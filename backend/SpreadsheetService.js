var FINANZAS_RUNTIME_CACHE_ = {
  spreadsheet: null,
  monthlySpreadsheets: {},
  databaseReady: false
};

function runtimeCache_() {
  return FINANZAS_RUNTIME_CACHE_;
}

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
  var props = getScriptProperties_();
  var cache = runtimeCache_();
  var spreadsheetId = props.getProperty(appPropertyKeys_().spreadsheetId);
  if (!spreadsheetId || !cache.databaseReady) {
    ensureDatabase_();
    spreadsheetId = props.getProperty(appPropertyKeys_().spreadsheetId);
  }
  if (!spreadsheetId) {
    validationError_('No se pudo obtener el ID de la planilla.');
  }
  if (cache.spreadsheet && cache.spreadsheet.getId() === spreadsheetId) {
    return cache.spreadsheet;
  }
  cache.spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  return cache.spreadsheet;
}

function ensureCurrentCalendarPeriod_() {
  var currentMonth = currentMonthString_();
  ensureMonthlyMovementStore_(currentMonth);

  var props = getScriptProperties_();
  var keys = appPropertyKeys_();
  var lastCalendarMonth = normalizeText_(props.getProperty(keys.lastCalendarMonth));
  if (lastCalendarMonth === currentMonth) {
    return currentMonth;
  }

  var configMap = readConfigMap_();
  var updates = {
    mesActual: currentMonth,
    estadoMesActual: 'abierto',
    fechaUltimoInicioMes: currentMonth
  };

  if (normalizeText_(configMap.mesActual) === currentMonth) {
    delete updates.mesActual;
  }
  setConfigValues_(updates);
  props.setProperty(keys.lastCalendarMonth, currentMonth);
  return currentMonth;
}

function ensureDatabase_() {
  var props = getScriptProperties_();
  var keys = appPropertyKeys_();
  var cache = runtimeCache_();
  if (cache.databaseReady && cache.spreadsheet) {
    return databaseInfo_(cache.spreadsheet);
  }

  var spreadsheetId = props.getProperty(keys.spreadsheetId);
  var spreadsheet = null;

  if (spreadsheetId) {
    try {
      spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      cache.spreadsheet = spreadsheet;
    } catch (error) {
      spreadsheet = null;
    }
  }

  if (spreadsheet && props.getProperty(keys.databaseInitialized) === 'true') {
    cache.databaseReady = true;
    return databaseInfo_(spreadsheet);
  }

  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.create('FinanzasPersonales - Base de Datos');
    cache.spreadsheet = spreadsheet;
    props.setProperty(keys.spreadsheetId, spreadsheet.getId());
  }

  ensureDriveStructure_();
  moveSpreadsheetToDatabaseFolder_(spreadsheet.getId());
  ensureAllSheets_(spreadsheet);
  ensureDefaultConfigInSpreadsheet_(spreadsheet);
  props.setProperty(keys.databaseInitialized, 'true');
  cache.databaseReady = true;

  return databaseInfo_(spreadsheet);
}

function monthStorageKey_(month) {
  return assertMonthString_(month, 'Mes').replace('-', '_');
}

function monthFromStorageKey_(storageKey) {
  var text = normalizeText_(storageKey);
  if (!/^\d{4}_\d{2}$/.test(text)) {
    return '';
  }
  return text.replace('_', '-');
}

function monthlyFolderPropertyKey_(month) {
  return appPropertyKeys_().monthlyFolderPrefix + monthStorageKey_(month);
}

function monthlyMovementsPropertyKey_(month) {
  return appPropertyKeys_().monthlyMovementsPrefix + monthStorageKey_(month);
}

function ensureMonthlyMovementStore_(month) {
  var targetMonth = assertMonthString_(month || currentMonthString_(), 'Mes');
  var storageKey = monthStorageKey_(targetMonth);
  var props = getScriptProperties_();
  var keys = appPropertyKeys_();
  var cache = runtimeCache_();
  var propertyKey = monthlyMovementsPropertyKey_(targetMonth);
  var spreadsheetId = props.getProperty(propertyKey);
  var spreadsheet = null;

  if (cache.monthlySpreadsheets[storageKey] && cache.monthlySpreadsheets[storageKey].getId() === spreadsheetId) {
    return monthlyMovementStoreInfo_(targetMonth, cache.monthlySpreadsheets[storageKey]);
  }

  if (spreadsheetId) {
    try {
      spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    } catch (error) {
      spreadsheet = null;
      props.deleteProperty(propertyKey);
    }
  }

  ensureDriveStructure_();
  var folder = ensureMonthlyFolder_(targetMonth);

  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.create('Pirepirapp Movimientos ' + storageKey);
    props.setProperty(propertyKey, spreadsheet.getId());
    moveFileToFolder_(spreadsheet.getId(), folder);
  }

  var sheet = ensureSheet_(spreadsheet, appSheetNames_().movements);
  removeEmptyDefaultSheet_(spreadsheet);
  migrateLegacyMovementsForMonth_(targetMonth, sheet);
  cache.monthlySpreadsheets[storageKey] = spreadsheet;
  return monthlyMovementStoreInfo_(targetMonth, spreadsheet);
}

function monthlyMovementStoreInfo_(month, spreadsheet) {
  return {
    month: month,
    storageKey: monthStorageKey_(month),
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    folderId: getScriptProperties_().getProperty(monthlyFolderPropertyKey_(month))
  };
}

function ensureMonthlyFolder_(month) {
  var props = getScriptProperties_();
  var structure = getDriveStructure_();
  var folderName = monthStorageKey_(month);
  var propertyKey = monthlyFolderPropertyKey_(month);
  var folder = null;

  var folderId = props.getProperty(propertyKey);
  if (folderId) {
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (error) {
      folder = null;
      props.deleteProperty(propertyKey);
    }
  }

  if (!folder) {
    var parent = structure.databaseFolderId
      ? DriveApp.getFolderById(structure.databaseFolderId)
      : DriveApp.getFolderById(structure.rootFolderId);
    folder = getOrCreateChildFolder_(parent, folderName);
    props.setProperty(propertyKey, folder.getId());
  }
  return folder;
}

function moveFileToFolder_(fileId, folder) {
  try {
    DriveApp.getFileById(fileId).moveTo(folder);
  } catch (error) {
    // La planilla queda utilizable aunque Drive no permita moverla.
  }
}

function getMonthlyMovementsSheet_(month) {
  var info = ensureMonthlyMovementStore_(month || currentMonthString_());
  var cache = runtimeCache_();
  var storageKey = monthStorageKey_(info.month);
  var spreadsheet = cache.monthlySpreadsheets[storageKey];
  if (!spreadsheet || spreadsheet.getId() !== info.spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(info.spreadsheetId);
    cache.monthlySpreadsheets[storageKey] = spreadsheet;
  }
  return ensureSheet_(spreadsheet, appSheetNames_().movements);
}

function readMovementRecordsForMonth_(month) {
  var targetMonth = assertMonthString_(month || currentMonthString_(), 'Mes');
  var sheet = getMonthlyMovementsSheet_(targetMonth);
  var records = [];
  var seen = {};

  function addRecord(record, assumeTargetMonth) {
    var normalizedMonth = normalizeText_(record.Mes);
    if (!normalizedMonth && isDateValue_(record.Fecha)) {
      normalizedMonth = formatDate_(record.Fecha, 'yyyy-MM');
      record.Mes = normalizedMonth;
    }
    if (!normalizedMonth && /^\d{4}-\d{2}/.test(normalizeText_(record.Fecha))) {
      normalizedMonth = normalizeText_(record.Fecha).slice(0, 7);
      record.Mes = normalizedMonth;
    }
    if (!normalizedMonth && assumeTargetMonth) {
      record.Mes = targetMonth;
      normalizedMonth = targetMonth;
    }
    if (normalizedMonth !== targetMonth) {
      return;
    }

    var id = normalizeText_(record.ID);
    var key = id || [
      normalizeText_(record.Fecha),
      normalizeText_(record.Hora),
      normalizeText_(record.Tipo),
      normalizeText_(record.Motivo),
      normalizeText_(record.Monto)
    ].join('|');
    if (seen[key]) {
      return;
    }
    seen[key] = true;
    records.push(record);
  }

  readRecordsFromSheet_(sheet).forEach(function (record) {
    addRecord(record, true);
  });

  var legacySheet = ensureSheet_(getSpreadsheet_(), appSheetNames_().movements);
  if (legacySheet.getParent().getId() !== sheet.getParent().getId()) {
    readRecordsFromSheet_(legacySheet).forEach(function (record) {
      addRecord(record, false);
    });
  }

  return records;
}

function readAllMovementRecords_() {
  var knownMonths = knownMonthlyMovementMonths_();
  var monthlyRecords = [];
  knownMonths.forEach(function (month) {
    monthlyRecords = monthlyRecords.concat(readMovementRecordsForMonth_(month));
  });

  var migrated = {};
  knownMonths.forEach(function (month) {
    migrated[month] = true;
  });

  var legacySheet = ensureSheet_(getSpreadsheet_(), appSheetNames_().movements);
  var legacyRecords = readRecordsFromSheet_(legacySheet)
    .filter(function (record) {
      return !migrated[normalizeText_(record.Mes)];
    });

  return monthlyRecords.concat(legacyRecords);
}

function appendMovementRecord_(record) {
  var month = assertMonthString_(record.Mes || currentMonthString_(), 'Mes');
  var sheet = getMonthlyMovementsSheet_(month);
  return appendRecordToSheet_(sheet, record);
}

function getMovementRecordById_(id, monthHint) {
  var rowInfo = findMovementRowById_(id, monthHint);
  return rowInfo ? rowInfo.record : null;
}

function updateMovementRecordById_(id, updates, monthHint) {
  var rowInfo = findMovementRowById_(id, monthHint);
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

  var targetMonth = assertMonthString_(updatedRecord.Mes, 'Mes');
  if (targetMonth !== rowInfo.month) {
    rowInfo.sheet.deleteRow(rowInfo.rowNumber);
    appendMovementRecord_(updatedRecord);
    updatedRecord._rowNumber = getMonthlyMovementsSheet_(targetMonth).getLastRow();
    return updatedRecord;
  }

  var headers = getHeadersFromSheet_(rowInfo.sheet);
  var row = headers.map(function (header) {
    return serializeSheetValue_(updatedRecord[header]);
  });
  rowInfo.sheet.getRange(rowInfo.rowNumber, 1, 1, headers.length).setValues([row]);
  updatedRecord._rowNumber = rowInfo.rowNumber;
  return updatedRecord;
}

function deleteMovementRecordById_(id, monthHint) {
  var rowInfo = findMovementRowById_(id, monthHint);
  if (!rowInfo) {
    notFoundError_('No existe el registro con ID ' + id + '.');
  }
  rowInfo.sheet.deleteRow(rowInfo.rowNumber);
  return rowInfo.record;
}

function findMovementRowById_(id, monthHint) {
  var normalizedId = normalizeText_(id);
  var months = [];
  var seen = {};
  function addMonth(month) {
    var normalizedMonth = normalizeText_(month);
    if (/^\d{4}-\d{2}$/.test(normalizedMonth) && !seen[normalizedMonth]) {
      seen[normalizedMonth] = true;
      months.push(normalizedMonth);
    }
  }

  addMonth(monthHint);
  addMonth(readConfigMap_().mesActual);
  addMonth(currentMonthString_());
  knownMonthlyMovementMonths_().forEach(addMonth);

  for (var monthIndex = 0; monthIndex < months.length; monthIndex += 1) {
    var month = months[monthIndex];
    var sheet = getMonthlyMovementsSheet_(month);
    var found = findRecordRowByIdInSheet_(sheet, normalizedId);
    if (found) {
      found.month = month;
      return found;
    }
  }

  var legacySheet = ensureSheet_(getSpreadsheet_(), appSheetNames_().movements);
  var legacyFound = findRecordRowByIdInSheet_(legacySheet, normalizedId);
  if (legacyFound) {
    legacyFound.month = normalizeText_(legacyFound.record.Mes);
    return legacyFound;
  }
  return null;
}

function findRecordRowByIdInSheet_(sheet, normalizedId) {
  var records = readRecordsFromSheet_(sheet);
  for (var index = 0; index < records.length; index += 1) {
    if (normalizeText_(records[index].ID) === normalizedId) {
      return {
        sheet: sheet,
        rowNumber: records[index]._rowNumber,
        record: records[index]
      };
    }
  }
  return null;
}

function knownMonthlyMovementMonths_() {
  var props = getScriptProperties_().getProperties();
  var prefix = appPropertyKeys_().monthlyMovementsPrefix;
  return Object.keys(props)
    .filter(function (key) {
      return key.indexOf(prefix) === 0 && normalizeText_(props[key]);
    })
    .map(function (key) {
      return monthFromStorageKey_(key.slice(prefix.length));
    })
    .filter(Boolean)
    .sort();
}

function migrateLegacyMovementsForMonth_(month, monthlySheet) {
  if (monthlySheet.getLastRow() > 1) {
    return;
  }

  var legacySpreadsheet = getSpreadsheet_();
  var legacySheet = ensureSheet_(legacySpreadsheet, appSheetNames_().movements);
  if (legacySheet.getParent().getId() === monthlySheet.getParent().getId()) {
    return;
  }

  readRecordsFromSheet_(legacySheet)
    .filter(function (record) {
      return normalizeText_(record.Mes) === month;
    })
    .forEach(function (record) {
      appendRecordToSheet_(monthlySheet, record);
    });
}

function databaseInfo_(spreadsheet) {
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
  ensureCurrentCalendarPeriod_();
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
