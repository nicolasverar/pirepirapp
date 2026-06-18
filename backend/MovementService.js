function listMovements_(payload) {
  var source = payload || {};
  var allMonths = Boolean(source.allMonths || source.todosLosMeses);
  var month = allMonths
    ? ''
    : assertMonthString_(source.mes || source.month || getConfig_().mesActual || currentMonthString_(), 'Mes');
  var limit = source.limit ? Math.max(0, Number(source.limit)) : 0;
  var order = normalizeText_(source.order || source.orden || 'desc').toLowerCase();

  var records = allMonths ? readAllMovementRecords_() : readMovementRecordsForMonth_(month);

  records = sortMovementRecords_(records, order !== 'asc');
  if (limit > 0) {
    records = records.slice(0, limit);
  }

  return {
    mes: month || null,
    allMonths: allMonths,
    movimientos: records.map(movementToApi_)
  };
}

function createMovement_(payload) {
  return withScriptLock_(function () {
    var record = createMovementUnlocked_(payload);
    SpreadsheetApp.flush();
    return {
      movimiento: movementToApi_(record),
      resumen: getMonthlySummary_({ mes: record.Mes })
    };
  });
}

function createMovementUnlocked_(payload) {
  var record = buildMovementRecord_(payload, null);
  validateRelatedTargetForMovement_(record, null);
  appendMovementRecord_(record);
  applyMovementImpact_(record, 1);
  return record;
}

function updateMovement_(payload) {
  return withScriptLock_(function () {
    var source = payload || {};
    var id = requireText_(source.id, 'ID de movimiento', 120);
    var existing = getMovementRecordById_(id, source.mes || source.month);
    if (!existing) {
      notFoundError_('No existe el movimiento indicado.');
    }

    var updatedRecord = buildMovementRecord_(source, existing);
    validateRelatedTargetForMovement_(updatedRecord, existing);
    applyMovementImpact_(existing, -1);
    var stored = updateMovementRecordById_(id, updatedRecord, existing.Mes);
    applyMovementImpact_(stored, 1);
    SpreadsheetApp.flush();

    return {
      movimiento: movementToApi_(stored),
      resumen: getMonthlySummary_({ mes: stored.Mes })
    };
  });
}

function deleteMovement_(payload) {
  return withScriptLock_(function () {
    var source = payload || {};
    var id = requireText_(source.id, 'ID de movimiento', 120);
    var existing = getMovementRecordById_(id, source.mes || source.month);
    if (!existing) {
      notFoundError_('No existe el movimiento indicado.');
    }

    applyMovementImpact_(existing, -1);
    var deleted = deleteMovementRecordById_(id, existing.Mes);
    SpreadsheetApp.flush();
    return {
      movimiento: movementToApi_(deleted),
      resumen: getMonthlySummary_({ mes: deleted.Mes })
    };
  });
}

function startMonth_(payload) {
  return withScriptLock_(function () {
    var source = payload || {};
    var month = assertMonthString_(source.mes || source.month || currentMonthString_(), 'Mes');
    var store = ensureMonthlyMovementStore_(month);

    setConfigValues_({
      mesActual: month,
      estadoMesActual: 'abierto',
      fechaUltimoInicioMes: month
    });

    return {
      mes: month,
      archivoMensual: store,
      movimientosCreados: [],
      resumen: getMonthlySummary_({ mes: month })
    };
  });
}

function buildMovementRecord_(payload, existing) {
  var input = validateMovementRecordInput_(payload, existing);
  var now = timestampString_();
  return {
    ID: existing && existing.ID ? existing.ID : generateId_('mov'),
    Fecha: input.fecha,
    Hora: input.hora,
    Mes: input.mes,
    Tipo: input.tipo,
    Motivo: input.motivo,
    Categoria: input.categoria,
    Monto: input.monto,
    'ID relacionado': input.idRelacionado,
    'Tipo relacionado': input.tipoRelacionado,
    Descripcion: input.descripcion,
    'Fecha de creacion': existing && existing['Fecha de creacion'] ? existing['Fecha de creacion'] : now,
    'Fecha de modificacion': now
  };
}

function validateRelatedTargetForMovement_(record, existingMovement) {
  var type = normalizeText_(record.Tipo);
  var relatedId = normalizeText_(record['ID relacionado']);
  if (!isRelatedMovement_(type)) {
    return;
  }

  if (type === movementTypes_().futureSaving) {
    assertFutureSavingExists_(relatedId);
  }
  if (type === movementTypes_().goal) {
    assertGoalExists_(relatedId);
  }
  if (type === movementTypes_().wishlistPurchase) {
    var item = getRecordById_(appSheetNames_().wishlist, relatedId);
    if (!item) {
      notFoundError_('No existe el elemento de wishlist relacionado.');
    }
    var status = normalizeText_(item.Estado);
    var sameExistingPurchase = existingMovement
      && normalizeText_(existingMovement.Tipo) === movementTypes_().wishlistPurchase
      && normalizeText_(existingMovement['ID relacionado']) === relatedId
      && status === purchasedStatus_();
    if (status !== activeStatus_() && !sameExistingPurchase) {
      validationError_('El elemento de wishlist no esta disponible para compra.');
    }
  }
}

function applyMovementImpact_(record, direction) {
  var type = normalizeText_(record.Tipo);
  var amount = Number(record.Monto || 0) * Number(direction || 1);
  var relatedId = normalizeText_(record['ID relacionado']);

  if (type === movementTypes_().futureSaving && relatedId) {
    adjustFutureSavingAccumulated_(relatedId, amount);
  }
  if (type === movementTypes_().goal && relatedId) {
    adjustGoalAccumulated_(relatedId, amount);
  }
  if (type === movementTypes_().wishlistPurchase && relatedId) {
    markWishlistPurchased_(relatedId, Number(direction || 1) > 0);
  }
}

function hasMonthStartMarker_(month) {
  var marker = monthStartMarker_(month);
  return readMovementRecordsForMonth_(month).some(function (record) {
    return normalizeText_(record.Mes) === month && normalizeText_(record.Descripcion) === marker;
  });
}

function monthStartMarker_(month) {
  return 'Inicio automatico del mes ' + month;
}

function sortMovementRecords_(records, descending) {
  return records.sort(function (a, b) {
    var left = normalizeText_(a.Fecha) + ' ' + normalizeText_(a.Hora);
    var right = normalizeText_(b.Fecha) + ' ' + normalizeText_(b.Hora);
    if (left === right) {
      return 0;
    }
    if (descending) {
      return left < right ? 1 : -1;
    }
    return left > right ? 1 : -1;
  });
}

function movementToApi_(record) {
  return {
    id: normalizeText_(record.ID),
    fecha: normalizeText_(record.Fecha),
    hora: normalizeText_(record.Hora),
    mes: normalizeText_(record.Mes),
    tipo: normalizeText_(record.Tipo),
    motivo: normalizeText_(record.Motivo),
    categoria: normalizeText_(record.Categoria),
    monto: Number(record.Monto || 0),
    idRelacionado: normalizeText_(record['ID relacionado']),
    tipoRelacionado: normalizeText_(record['Tipo relacionado']),
    descripcion: normalizeText_(record.Descripcion),
    fechaCreacion: normalizeText_(record['Fecha de creacion']),
    fechaModificacion: normalizeText_(record['Fecha de modificacion'])
  };
}
