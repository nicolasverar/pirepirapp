function listFutureSavings_(payload) {
  var includeInactive = Boolean((payload || {}).includeInactive);
  return readRecords_(appSheetNames_().futureSavings)
    .filter(function (record) {
      return includeInactive || normalizeText_(record.Estado) === activeStatus_();
    })
    .map(futureSavingToApi_);
}

function createFutureSaving_(payload) {
  return withScriptLock_(function () {
    return createFutureSavingUnlocked_(payload);
  });
}

function createFutureSavingUnlocked_(payload) {
  var input = validateFutureSavingInput_(payload, null);
  var record = {
    ID: generateId_('aho'),
    Titulo: input.titulo,
    Descripcion: input.descripcion,
    'Monto mensual': input.montoMensual,
    'Monto acumulado': 0,
    Estado: input.estado,
    'Fecha de creacion': timestampString_()
  };
  appendRecord_(appSheetNames_().futureSavings, record);
  return futureSavingToApi_(record);
}

function updateFutureSaving_(payload) {
  return withScriptLock_(function () {
    var id = requireText_((payload || {}).id, 'ID de ahorro', 120);
    var existing = getRecordById_(appSheetNames_().futureSavings, id);
    if (!existing) {
      notFoundError_('No existe el ahorro indicado.');
    }

    var input = validateFutureSavingInput_(payload, existing);
    var updated = updateRecordById_(appSheetNames_().futureSavings, id, {
      Titulo: input.titulo,
      Descripcion: input.descripcion,
      'Monto mensual': input.montoMensual,
      Estado: input.estado
    });
    return futureSavingToApi_(updated);
  });
}

function adjustFutureSavingAccumulated_(id, delta) {
  var existing = getRecordById_(appSheetNames_().futureSavings, id);
  if (!existing) {
    notFoundError_('No existe el ahorro relacionado.');
  }

  var current = Number(existing['Monto acumulado'] || 0);
  var next = clampAmount_(current + Number(delta || 0));
  var updated = updateRecordById_(appSheetNames_().futureSavings, id, {
    'Monto acumulado': next
  });
  return futureSavingToApi_(updated);
}

function assertFutureSavingExists_(id) {
  var existing = getRecordById_(appSheetNames_().futureSavings, id);
  if (!existing || normalizeText_(existing.Estado) !== activeStatus_()) {
    notFoundError_('No existe el ahorro activo relacionado.');
  }
  return existing;
}

function futureSavingToApi_(record) {
  return {
    id: normalizeText_(record.ID),
    titulo: normalizeText_(record.Titulo),
    descripcion: normalizeText_(record.Descripcion),
    montoMensual: Number(record['Monto mensual'] || 0),
    montoAcumulado: Number(record['Monto acumulado'] || 0),
    estado: normalizeText_(record.Estado),
    fechaCreacion: normalizeText_(record['Fecha de creacion'])
  };
}

function listGoals_(payload) {
  var includeInactive = Boolean((payload || {}).includeInactive);
  return readRecords_(appSheetNames_().goals)
    .filter(function (record) {
      return includeInactive || normalizeText_(record.Estado) === activeStatus_();
    })
    .map(goalToApi_);
}

function createGoal_(payload) {
  return withScriptLock_(function () {
    return createGoalUnlocked_(payload);
  });
}

function createGoalUnlocked_(payload) {
  var prepared = prepareImagePayload_(payload, 'goal');
  var input = validateGoalInput_(prepared, null);
  var record = {
    ID: generateId_('met'),
    Titulo: input.titulo,
    Descripcion: input.descripcion,
    'Monto mensual': input.montoMensual,
    'Monto objetivo': input.montoObjetivo,
    'Monto acumulado': input.montoAcumulado,
    Porcentaje: input.porcentaje,
    'ID de imagen en Drive': input.imageDriveId,
    'URL o referencia de imagen': input.imageRef,
    Estado: input.estado,
    'Fecha de creacion': timestampString_()
  };
  appendRecord_(appSheetNames_().goals, record);
  return goalToApi_(record);
}

function updateGoal_(payload) {
  return withScriptLock_(function () {
    var id = requireText_((payload || {}).id, 'ID de meta', 120);
    var existing = getRecordById_(appSheetNames_().goals, id);
    if (!existing) {
      notFoundError_('No existe la meta indicada.');
    }

    var prepared = prepareImagePayload_(payload, 'goal');
    var input = validateGoalInput_(prepared, existing);
    var updated = updateRecordById_(appSheetNames_().goals, id, {
      Titulo: input.titulo,
      Descripcion: input.descripcion,
      'Monto mensual': input.montoMensual,
      'Monto objetivo': input.montoObjetivo,
      'Monto acumulado': input.montoAcumulado,
      Porcentaje: input.porcentaje,
      'ID de imagen en Drive': input.imageDriveId,
      'URL o referencia de imagen': input.imageRef,
      Estado: input.estado
    });
    return goalToApi_(updated);
  });
}

function adjustGoalAccumulated_(id, delta) {
  var existing = getRecordById_(appSheetNames_().goals, id);
  if (!existing) {
    notFoundError_('No existe la meta relacionada.');
  }

  var current = Number(existing['Monto acumulado'] || 0);
  var target = Number(existing['Monto objetivo'] || 0);
  var next = clampAmount_(current + Number(delta || 0));
  var updated = updateRecordById_(appSheetNames_().goals, id, {
    'Monto acumulado': next,
    Porcentaje: calculateGoalPercent_(next, target)
  });
  return goalToApi_(updated);
}

function assertGoalExists_(id) {
  var existing = getRecordById_(appSheetNames_().goals, id);
  if (!existing || normalizeText_(existing.Estado) !== activeStatus_()) {
    notFoundError_('No existe la meta activa relacionada.');
  }
  return existing;
}

function goalToApi_(record) {
  var target = Number(record['Monto objetivo'] || 0);
  var accumulated = Number(record['Monto acumulado'] || 0);
  return {
    id: normalizeText_(record.ID),
    titulo: normalizeText_(record.Titulo),
    descripcion: normalizeText_(record.Descripcion),
    montoMensual: Number(record['Monto mensual'] || 0),
    montoObjetivo: target,
    montoAcumulado: accumulated,
    porcentaje: Number(record.Porcentaje || calculateGoalPercent_(accumulated, target)),
    imageDriveId: normalizeText_(record['ID de imagen en Drive']),
    imageRef: normalizeText_(record['URL o referencia de imagen']),
    estado: normalizeText_(record.Estado),
    fechaCreacion: normalizeText_(record['Fecha de creacion'])
  };
}

function listWishlist_(payload) {
  var includeInactive = Boolean((payload || {}).includeInactive);
  return readRecords_(appSheetNames_().wishlist)
    .filter(function (record) {
      return includeInactive || normalizeText_(record.Estado) === activeStatus_();
    })
    .map(wishlistToApi_);
}

function createWishlistItem_(payload) {
  return withScriptLock_(function () {
    return createWishlistItemUnlocked_(payload);
  });
}

function createWishlistItemUnlocked_(payload) {
  var prepared = prepareImagePayload_(payload, 'wishlist');
  var input = validateWishlistInput_(prepared, null);
  var record = {
    ID: generateId_('wis'),
    Titulo: input.titulo,
    Descripcion: input.descripcion,
    'Costo aproximado': input.costoAproximado,
    'ID de imagen en Drive': input.imageDriveId,
    'URL o referencia de imagen': input.imageRef,
    Estado: input.estado,
    'Fecha de creacion': timestampString_(),
    'Fecha de conversion a meta': ''
  };
  appendRecord_(appSheetNames_().wishlist, record);
  return wishlistToApi_(record);
}

function updateWishlistItem_(payload) {
  return withScriptLock_(function () {
    var id = requireText_((payload || {}).id, 'ID de wishlist', 120);
    var existing = getRecordById_(appSheetNames_().wishlist, id);
    if (!existing) {
      notFoundError_('No existe el elemento indicado.');
    }

    var prepared = prepareImagePayload_(payload, 'wishlist');
    var input = validateWishlistInput_(prepared, existing);
    var updated = updateRecordById_(appSheetNames_().wishlist, id, {
      Titulo: input.titulo,
      Descripcion: input.descripcion,
      'Costo aproximado': input.costoAproximado,
      'ID de imagen en Drive': input.imageDriveId,
      'URL o referencia de imagen': input.imageRef,
      Estado: input.estado
    });
    return wishlistToApi_(updated);
  });
}

function convertWishlistToGoal_(payload) {
  return withScriptLock_(function () {
    var source = payload || {};
    var wishlistId = requireText_(source.wishlistId || source.id, 'ID de wishlist', 120);
    var monthlyAmount = normalizeAmount_(source.montoMensual !== undefined ? source.montoMensual : source.monthlyAmount, 'Monto mensual', true);
    var item = getRecordById_(appSheetNames_().wishlist, wishlistId);
    if (!item || normalizeText_(item.Estado) !== activeStatus_()) {
      notFoundError_('No existe un elemento activo de wishlist con ese ID.');
    }

    var goal = createGoalUnlocked_({
      titulo: item.Titulo,
      descripcion: item.Descripcion,
      montoMensual: monthlyAmount,
      montoObjetivo: item['Costo aproximado'],
      montoAcumulado: 0,
      imageDriveId: item['ID de imagen en Drive'],
      imageRef: item['URL o referencia de imagen']
    });

    var updatedWishlist = updateRecordById_(appSheetNames_().wishlist, wishlistId, {
      Estado: convertedStatus_(),
      'Fecha de conversion a meta': timestampString_()
    });

    return {
      goal: goal,
      wishlistItem: wishlistToApi_(updatedWishlist)
    };
  });
}

function markWishlistPurchased_(id, purchased) {
  var existing = getRecordById_(appSheetNames_().wishlist, id);
  if (!existing) {
    notFoundError_('No existe el elemento de wishlist relacionado.');
  }

  var currentStatus = normalizeText_(existing.Estado);
  var nextStatus = purchased ? purchasedStatus_() : activeStatus_();
  if (!purchased && currentStatus === convertedStatus_()) {
    nextStatus = convertedStatus_();
  }

  var updated = updateRecordById_(appSheetNames_().wishlist, id, {
    Estado: nextStatus
  });
  return wishlistToApi_(updated);
}

function assertWishlistExists_(id) {
  var existing = getRecordById_(appSheetNames_().wishlist, id);
  if (!existing || normalizeText_(existing.Estado) !== activeStatus_()) {
    notFoundError_('No existe el elemento activo de wishlist relacionado.');
  }
  return existing;
}

function wishlistToApi_(record) {
  return {
    id: normalizeText_(record.ID),
    titulo: normalizeText_(record.Titulo),
    descripcion: normalizeText_(record.Descripcion),
    costoAproximado: Number(record['Costo aproximado'] || 0),
    imageDriveId: normalizeText_(record['ID de imagen en Drive']),
    imageRef: normalizeText_(record['URL o referencia de imagen']),
    estado: normalizeText_(record.Estado),
    fechaCreacion: normalizeText_(record['Fecha de creacion']),
    fechaConversionMeta: normalizeText_(record['Fecha de conversion a meta'])
  };
}

function prepareImagePayload_(payload, target) {
  var prepared = {};
  Object.keys(payload || {}).forEach(function (key) {
    prepared[key] = payload[key];
  });
  var image = resolveImageUploadForPayload_(payload, target);
  if (image.imageDriveId) {
    prepared.imageDriveId = image.imageDriveId;
  }
  if (image.imageRef) {
    prepared.imageRef = image.imageRef;
  }
  if (prepared.imageDriveId && !prepared.imageRef) {
    prepared.imageRef = 'drive:' + prepared.imageDriveId;
  }
  return prepared;
}
