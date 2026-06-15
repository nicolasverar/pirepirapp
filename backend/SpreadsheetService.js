function getScriptProperties_() {
  return PropertiesService.getScriptProperties();
}

function getExpectedHeaders_(sheetName) {
  var headers = appHeaders_();
  if (!headers[sheetName]) {
    validationError_('Hoja no reconocida: ' + sheetName);
  }
  return headers[sheetName];
}

function getSpreadsheet_() {
  ensureDatabase_();
  var props = getScriptProperties_();
  var spreadsheetId = props.getProperty(appPropertyKeys_().spreadsheetId);
  if (!spreadsheetId) {
    validationError_('No se pudo obtener el ID de la planilla.');
  }
  return SpreadsheetApp.openById(spreadsheetId);
}

function ensureDatabase_() {
  var props = getScriptProperties_();
  var keys = appPropertyKeys_();
  var spreadsheetId = props.getProperty(keys.spreadsheetId);
  var spreadsheet = null;

  if (spreadsheetId) {
    try {
      spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    } catch (error) {
      spreadsheet = null;
    }
  }

  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.create('FinanzasPersonales - Base de Datos');
    props.setProperty(keys.spreadsheetId, spreadsheet.getId());
  }

  ensureDriveStructure_();
  moveSpreadsheetToDatabaseFolder_(spreadsheet.getId());
  ensureAllSheets_(spreadsheet);
  ensureDefaultConfigInSpreadsheet_(spreadsheet);

  return {
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    sheets: Object.keys(appSheetNames_()).map(function (key) {
      return appSheetNames_()[key];
    }),
    drive: getDriveStructure_()
  };
}

function ensureAllSheets_(spreadsheet) {
  var names = appSheetNames_();
  Object.keys(names).forEach(function (key) {
    ensureSheet_(spreadsheet, names[key]);
  });
  removeEmptyDefaultSheet_(spreadsheet);
}

function ensureSheet_(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  var expectedHeaders = getExpectedHeaders_(sheetName);
  var lastColumn = Math.max(sheet.getLastColumn(), expectedHeaders.length);
  var headerRange = sheet.getRange(1, 1, 1, lastColumn);
  var currentHeaders = headerRange.getValues()[0].map(function (header) {
    return normalizeText_(header);
  });

  if (currentHeaders.every(function (header) { return !header; })) {
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    sheet.setFrozenRows(1);
    return sheet;
  }

  var missingHeaders = expectedHeaders.filter(function (header) {
    return currentHeaders.indexOf(header) === -1;
  });

  if (missingHeaders.length > 0) {
    sheet
      .getRange(1, currentHeaders.length + 1, 1, missingHeaders.length)
      .setValues([missingHeaders]);
  }

  sheet.setFrozenRows(1);
  if (sheetName === appSheetNames_().config) {
    sheet.getRange('B:B').setNumberFormat('@');
  }
  return sheet;
}

function removeEmptyDefaultSheet_(spreadsheet) {
  var defaultSheet = spreadsheet.getSheetByName('Sheet1') || spreadsheet.getSheetByName('Hoja 1');
  if (!defaultSheet || spreadsheet.getSheets().length <= 1) {
    return;
  }

  if (defaultSheet.getLastRow() <= 1 && defaultSheet.getLastColumn() <= 1) {
    spreadsheet.deleteSheet(defaultSheet);
  }
}

function getSheet_(sheetName) {
  var spreadsheet = getSpreadsheet_();
  return ensureSheet_(spreadsheet, sheetName);
}

function getHeadersFromSheet_(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn < 1) {
    return [];
  }
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function (header) {
    return normalizeText_(header);
  });
}

function readRecords_(sheetName) {
  var sheet = getSheet_(sheetName);
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  if (lastRow < 2 || lastColumn < 1) {
    return [];
  }

  var headers = getHeadersFromSheet_(sheet);
  var rows = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
  return rows
    .filter(function (row) {
      return !isBlankRow_(row);
    })
    .map(function (row, index) {
      var record = { _rowNumber: index + 2 };
      headers.forEach(function (header, columnIndex) {
        record[header] = row[columnIndex];
      });
      return record;
    });
}

function appendRecord_(sheetName, record) {
  var sheet = getSheet_(sheetName);
  return appendRecordToSheet_(sheet, record);
}

function appendRecordToSheet_(sheet, record) {
  var headers = getHeadersFromSheet_(sheet);
  var row = headers.map(function (header) {
    return serializeSheetValue_(record[header]);
  });
  sheet.appendRow(row);
  return record;
}

function updateRecordById_(sheetName, id, updates) {
  var sheet = getSheet_(sheetName);
  var rowInfo = findRecordRowById_(sheetName, id);
  if (!rowInfo) {
    notFoundError_('No existe el registro con ID ' + id + '.');
  }

  var updatedRecord = {};
  Object.keys(rowInfo.record).forEach(function (key) {
    if (key !== '_rowNumber') {
      updatedRecord[key] = rowInfo.record[key];
    }
  });
  Object.keys(updates || {}).forEach(function (key) {
    updatedRecord[key] = updates[key];
  });

  var headers = getHeadersFromSheet_(sheet);
  var row = headers.map(function (header) {
    return serializeSheetValue_(updatedRecord[header]);
  });
  sheet.getRange(rowInfo.rowNumber, 1, 1, headers.length).setValues([row]);
  updatedRecord._rowNumber = rowInfo.rowNumber;
  return updatedRecord;
}

function deleteRecordById_(sheetName, id) {
  var sheet = getSheet_(sheetName);
  var rowInfo = findRecordRowById_(sheetName, id);
  if (!rowInfo) {
    notFoundError_('No existe el registro con ID ' + id + '.');
  }
  sheet.deleteRow(rowInfo.rowNumber);
  return rowInfo.record;
}

function getRecordById_(sheetName, id) {
  var rowInfo = findRecordRowById_(sheetName, id);
  return rowInfo ? rowInfo.record : null;
}

function findRecordRowById_(sheetName, id) {
  var records = readRecords_(sheetName);
  var normalizedId = normalizeText_(id);
  for (var index = 0; index < records.length; index += 1) {
    if (normalizeText_(records[index].ID) === normalizedId) {
      return {
        rowNumber: records[index]._rowNumber,
        record: records[index]
      };
    }
  }
  return null;
}

function ensureDefaultConfig_() {
  ensureDefaultConfigInSpreadsheet_(getSpreadsheet_());
}

function ensureDefaultConfigInSpreadsheet_(spreadsheet) {
  var names = appSheetNames_();
  var sheet = ensureSheet_(spreadsheet, names.config);
  var records = readRecordsFromSheet_(sheet);
  var existing = {};
  records.forEach(function (record) {
    existing[normalizeText_(record.Clave)] = record;
  });

  defaultConfigRows_().forEach(function (row) {
    if (!existing[row.Clave]) {
      appendRecordToSheet_(sheet, row);
    }
  });

  sheet.autoResizeColumns(1, Math.min(sheet.getLastColumn(), 4));
}

function readRecordsFromSheet_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  if (lastRow < 2 || lastColumn < 1) {
    return [];
  }

  var headers = getHeadersFromSheet_(sheet);
  var rows = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
  return rows
    .filter(function (row) {
      return !isBlankRow_(row);
    })
    .map(function (row, index) {
      var record = { _rowNumber: index + 2 };
      headers.forEach(function (header, columnIndex) {
        record[header] = row[columnIndex];
      });
      return record;
    });
}

function defaultConfigRows_() {
  var timestamp = timestampString_();
  return [
    {
      Clave: 'sueldoMensual',
      Valor: 0,
      Descripcion: 'Sueldo mensual fijo en guaranies.',
      'Fecha de modificacion': timestamp
    },
    {
      Clave: 'moneda',
      Valor: appCurrency_(),
      Descripcion: 'Moneda principal de la aplicacion.',
      'Fecha de modificacion': timestamp
    },
    {
      Clave: 'estadoMesActual',
      Valor: 'pendiente',
      Descripcion: 'Estado operativo del mes actual.',
      'Fecha de modificacion': timestamp
    },
    {
      Clave: 'mesActual',
      Valor: currentMonthString_(),
      Descripcion: 'Mes activo en formato yyyy-MM.',
      'Fecha de modificacion': timestamp
    },
    {
      Clave: 'fechaUltimoInicioMes',
      Valor: '',
      Descripcion: 'Ultimo mes iniciado automaticamente.',
      'Fecha de modificacion': timestamp
    },
    {
      Clave: 'categorias',
      Valor: appDefaultCategories_(),
      Descripcion: 'Categorias disponibles para movimientos.',
      'Fecha de modificacion': timestamp
    },
    {
      Clave: 'gastosFijos',
      Valor: appDefaultFixedExpenses_(),
      Descripcion: 'Gastos fijos configurables del mes.',
      'Fecha de modificacion': timestamp
    },
    {
      Clave: 'zonaHoraria',
      Valor: appTimezone_(),
      Descripcion: 'Zona horaria usada para fechas y meses.',
      'Fecha de modificacion': timestamp
    }
  ];
}

function readConfigMap_() {
  var records = readRecords_(appSheetNames_().config);
  var map = {};
  records.forEach(function (record) {
    var key = normalizeText_(record.Clave);
    if (key) {
      map[key] = parseJsonValue_(record.Valor);
    }
  });
  return map;
}

function getConfig_() {
  ensureDatabase_();
  var map = readConfigMap_();
  var month = map.mesActual ? assertMonthString_(map.mesActual, 'Mes actual') : currentMonthString_();
  var lastStart = map.fechaUltimoInicioMes ? assertMonthString_(map.fechaUltimoInicioMes, 'Fecha del ultimo inicio de mes') : '';
  return {
    sueldoMensual: Number(map.sueldoMensual || 0),
    moneda: normalizeText_(map.moneda) || appCurrency_(),
    estadoMesActual: normalizeText_(map.estadoMesActual) || 'pendiente',
    mesActual: month,
    fechaUltimoInicioMes: lastStart,
    categorias: Array.isArray(map.categorias) ? map.categorias : appDefaultCategories_(),
    gastosFijos: Array.isArray(map.gastosFijos) ? map.gastosFijos : appDefaultFixedExpenses_(),
    zonaHoraria: normalizeText_(map.zonaHoraria) || appTimezone_()
  };
}

function updateConfig_(payload) {
  return withScriptLock_(function () {
    var source = payload || {};
    var updates = {};

    if (source.sueldoMensual !== undefined || source.monthlySalary !== undefined) {
      updates.sueldoMensual = normalizeAmount_(
        source.sueldoMensual !== undefined ? source.sueldoMensual : source.monthlySalary,
        'Sueldo mensual',
        true
      );
    }
    if (source.moneda !== undefined || source.currency !== undefined) {
      var currency = requireText_(source.moneda !== undefined ? source.moneda : source.currency, 'Moneda', 12);
      if (currency !== appCurrency_()) {
        validationError_('La moneda principal debe ser ' + appCurrency_() + '.');
      }
      updates.moneda = currency;
    }
    if (source.categorias !== undefined || source.categories !== undefined) {
      updates.categorias = sanitizeCategories_(source.categorias !== undefined ? source.categorias : source.categories);
    }
    if (source.gastosFijos !== undefined || source.fixedExpenses !== undefined) {
      updates.gastosFijos = sanitizeFixedExpenses_(source.gastosFijos !== undefined ? source.gastosFijos : source.fixedExpenses);
    }
    if (source.estadoMesActual !== undefined || source.monthStatus !== undefined) {
      updates.estadoMesActual = requireText_(source.estadoMesActual !== undefined ? source.estadoMesActual : source.monthStatus, 'Estado del mes', 40);
    }
    if (source.mesActual !== undefined || source.currentMonth !== undefined) {
      updates.mesActual = assertMonthString_(source.mesActual !== undefined ? source.mesActual : source.currentMonth, 'Mes actual');
    }

    setConfigValues_(updates);
    return getConfig_();
  });
}

function setConfigValues_(updates) {
  var keys = Object.keys(updates || {});
  if (keys.length === 0) {
    return;
  }

  var sheetName = appSheetNames_().config;
  keys.forEach(function (key) {
    setConfigValue_(sheetName, key, updates[key]);
  });
}

function setConfigValue_(sheetName, key, value) {
  var rowInfo = findConfigRowByKey_(key);
  var timestamp = timestampString_();
  var record = {
    Clave: key,
    Valor: value,
    Descripcion: configDescriptionForKey_(key),
    'Fecha de modificacion': timestamp
  };

  if (rowInfo) {
    updateConfigRow_(rowInfo.rowNumber, record);
  } else {
    appendRecord_(sheetName, record);
  }
}

function findConfigRowByKey_(key) {
  var records = readRecords_(appSheetNames_().config);
  for (var index = 0; index < records.length; index += 1) {
    if (normalizeText_(records[index].Clave) === key) {
      return {
        rowNumber: records[index]._rowNumber,
        record: records[index]
      };
    }
  }
  return null;
}

function updateConfigRow_(rowNumber, record) {
  var sheet = getSheet_(appSheetNames_().config);
  var headers = getHeadersFromSheet_(sheet);
  var row = headers.map(function (header) {
    return serializeSheetValue_(record[header]);
  });
  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
}

function configDescriptionForKey_(key) {
  var descriptions = {
    sueldoMensual: 'Sueldo mensual fijo en guaranies.',
    moneda: 'Moneda principal de la aplicacion.',
    estadoMesActual: 'Estado operativo del mes actual.',
    mesActual: 'Mes activo en formato yyyy-MM.',
    fechaUltimoInicioMes: 'Ultimo mes iniciado automaticamente.',
    categorias: 'Categorias disponibles para movimientos.',
    gastosFijos: 'Gastos fijos configurables del mes.',
    zonaHoraria: 'Zona horaria usada para fechas y meses.'
  };
  return descriptions[key] || 'Valor de configuracion.';
}
