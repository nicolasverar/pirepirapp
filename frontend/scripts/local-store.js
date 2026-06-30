(function () {
  'use strict';

  var utils = window.FinanzasUtils;
  var DB_NAME = 'pirepirapp-local';
  var DB_VERSION = 1;
  var STORE_NAME = 'records';
  var STATE_KEY = 'state';
  var FALLBACK_KEY = 'pirepirappLocalState';
  var FALLBACK_PRIORITY_KEY = 'pirepirappLocalStatePreferFallback';
  var SAVE_META_KEY = 'pirepirappLocalSaveMeta';
  var BACKUP_SCHEMA = 'pirepirapp-local-backup';
  var BACKUP_SCHEMA_VERSION = 1;
  var ACTIVE = 'Activo';
  var INACTIVE = 'Inactivo';
  var COMPLETED = 'Cumplido';
  var CONVERTED = 'Convertido';
  var PURCHASED = 'Comprado';

  function request(action, payload) {
    var route = String(action || '').toLowerCase();
    return loadState().then(function (state) {
      var result = dispatch(state, route, payload || {});
      state.resumen = buildSummary(state);
      if (result.changed) {
        return saveState(state).then(function () {
          return clone(result.data);
        });
      }
      return clone(result.data);
    });
  }

  function dispatch(state, route, payload) {
    if (route === 'ping') {
      return unchanged({ ok: true, mode: 'local' });
    }
    if (route === 'bootstrap') {
      return unchanged(bootstrap(state));
    }
    if (route === 'getconfig') {
      return unchanged(state.config);
    }
    if (route === 'updateconfig') {
      state.config = normalizeConfig(Object.assign({}, state.config, payload || {}));
      return changed(state.config);
    }
    if (route === 'startmonth') {
      state.config.mesActual = monthFromPayload(payload) || currentMonth();
      state.config.estadoMesActual = 'abierto';
      state.config.fechaUltimoInicioMes = state.config.mesActual;
      return changed({
        mes: state.config.mesActual,
        movimientosCreados: [],
        resumen: buildSummary(state)
      });
    }
    if (route === 'getsummary') {
      return unchanged(buildSummary(state, monthFromPayload(payload) || state.config.mesActual));
    }
    if (route === 'getmovements') {
      return unchanged(listMovements(state, payload || {}));
    }
    if (route === 'syncfixedexpenses') {
      return changed(syncFixedExpenses(state, payload || {}));
    }
    if (route === 'createmovement') {
      return changed(createMovement(state, payload || {}));
    }
    if (route === 'updatemovement') {
      return changed(updateMovement(state, payload || {}));
    }
    if (route === 'deletemovement') {
      return changed(deleteMovement(state, payload || {}));
    }
    if (route === 'getfuturesavings') {
      return unchanged(activeItems(state.ahorrosFuturo));
    }
    if (route === 'createfuturesaving') {
      return changed(upsertFutureSaving(state, payload || {}, null));
    }
    if (route === 'updatefuturesaving') {
      return changed(upsertFutureSaving(state, payload || {}, requireItem(state.ahorrosFuturo, payload.id, 'ahorro')));
    }
    if (route === 'getgoals') {
      return unchanged(activeItems(state.metas));
    }
    if (route === 'creategoal') {
      return changed(upsertGoal(state, payload || {}, null));
    }
    if (route === 'updategoal') {
      return changed(upsertGoal(state, payload || {}, requireItem(state.metas, payload.id, 'meta')));
    }
    if (route === 'deletegoal') {
      return changed(deleteGoal(state, payload || {}));
    }
    if (route === 'convertwishlisttogoal') {
      return changed(convertWishlistToGoal(state, payload || {}));
    }
    if (route === 'getwishlist') {
      return unchanged(sortWishlist(activeItems(state.wishlist)));
    }
    if (route === 'createwishlistitem') {
      return changed(upsertWishlistItem(state, payload || {}, null));
    }
    if (route === 'updatewishlistitem') {
      return changed(upsertWishlistItem(state, payload || {}, requireItem(state.wishlist, payload.id, 'wishlist')));
    }
    if (route === 'deletewishlistitem') {
      return changed(deleteWishlistItem(state, payload || {}));
    }
    if (route === 'getarchive') {
      return unchanged(archiveItems(state));
    }
    if (route === 'restorearchiveitem') {
      return changed(restoreArchiveItem(state, payload || {}));
    }
    if (route === 'uploadphoto') {
      return changed(uploadPhoto(state, payload || {}));
    }
    if (route === 'getphoto') {
      return unchanged(getPhoto(state, payload || {}));
    }
    throw new Error('Accion local no reconocida: ' + route);
  }

  function changed(data) {
    return { changed: true, data: data };
  }

  function unchanged(data) {
    return { changed: false, data: data };
  }

  function openDb() {
    if (!window.indexedDB) {
      return Promise.resolve(null);
    }
    return new Promise(function (resolve) {
      var requestDb = indexedDB.open(DB_NAME, DB_VERSION);
      requestDb.onupgradeneeded = function () {
        var db = requestDb.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      requestDb.onsuccess = function () {
        resolve(requestDb.result);
      };
      requestDb.onerror = function () {
        resolve(null);
      };
      requestDb.onblocked = function () {
        resolve(null);
      };
    });
  }

  function loadState() {
    if (shouldPreferFallbackState()) {
      return Promise.resolve(loadFallbackState());
    }
    return openDb().then(function (db) {
      if (!db) {
        return loadFallbackState();
      }
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(STORE_NAME, 'readonly');
          var store = tx.objectStore(STORE_NAME);
          var req = store.get(STATE_KEY);
          req.onsuccess = function () {
            resolve(ensureState(req.result));
          };
          req.onerror = function () {
            resolve(loadFallbackState());
          };
        } catch (error) {
          resolve(loadFallbackState());
        }
      });
    });
  }

  function saveState(state) {
    var clean = ensureState(state);
    var fallbackSaved = saveFallbackState(clean);
    return openDb().then(function (db) {
      if (!db) {
        writeSaveMeta(fallbackSaved ? 'fallback' : 'unavailable', fallbackSaved ? 'ok' : 'error', 'indexeddb unavailable');
        return null;
      }
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put(clean, STATE_KEY);
          tx.oncomplete = function () {
            clearFallbackPriority();
            writeSaveMeta('indexeddb', 'ok', fallbackSaved ? '' : 'fallback unavailable');
            resolve(null);
          };
          tx.onerror = function () {
            markFallbackPriority();
            writeSaveMeta(fallbackSaved ? 'fallback' : 'unavailable', fallbackSaved ? 'ok' : 'error', indexedDbError(tx));
            resolve(null);
          };
          tx.onabort = function () {
            markFallbackPriority();
            writeSaveMeta(fallbackSaved ? 'fallback' : 'unavailable', fallbackSaved ? 'ok' : 'error', indexedDbError(tx));
            resolve(null);
          };
        } catch (error) {
          markFallbackPriority();
          writeSaveMeta(fallbackSaved ? 'fallback' : 'unavailable', fallbackSaved ? 'ok' : 'error', error && error.message);
          resolve(null);
        }
      });
    });
  }

  function exportBackup() {
    return loadState().then(function (state) {
      return {
        app: 'Pirepirapp',
        schema: BACKUP_SCHEMA,
        schemaVersion: BACKUP_SCHEMA_VERSION,
        exportedAt: timestamp(),
        state: clone(state)
      };
    });
  }

  function importBackup(payload) {
    var source = payload && payload.state ? payload.state : payload;
    if (!source || typeof source !== 'object') {
      return Promise.reject(new Error('El backup no tiene datos validos.'));
    }
    if (payload && payload.schema && payload.schema !== BACKUP_SCHEMA) {
      return Promise.reject(new Error('El archivo no parece ser un backup de Pirepirapp.'));
    }
    return saveState(ensureState(source)).then(function () {
      return loadState();
    });
  }

  function loadFallbackState() {
    try {
      return ensureState(JSON.parse(localStorage.getItem(FALLBACK_KEY) || 'null'));
    } catch (error) {
      return ensureState(null);
    }
  }

  function saveFallbackState(state) {
    try {
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      // Storage quota can be reached if many photos are saved in fallback mode.
      return false;
    }
  }

  function shouldPreferFallbackState() {
    try {
      return localStorage.getItem(FALLBACK_PRIORITY_KEY) === '1';
    } catch (error) {
      return false;
    }
  }

  function markFallbackPriority() {
    try {
      localStorage.setItem(FALLBACK_PRIORITY_KEY, '1');
    } catch (error) {
      // If localStorage is blocked, the normal IndexedDB path remains available.
    }
  }

  function clearFallbackPriority() {
    try {
      localStorage.removeItem(FALLBACK_PRIORITY_KEY);
    } catch (error) {
      // Nothing to clear if localStorage is blocked.
    }
  }

  function writeSaveMeta(channel, status, detail) {
    try {
      localStorage.setItem(SAVE_META_KEY, JSON.stringify({
        channel: channel,
        status: status,
        detail: detail || '',
        savedAt: timestamp(),
        version: (window.FINANZAS_CONFIG && window.FINANZAS_CONFIG.APP_VERSION) || ''
      }));
    } catch (error) {
      // Metadata is diagnostic only; the state write already ran.
    }
  }

  function readSaveMeta() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_META_KEY) || 'null');
    } catch (error) {
      return null;
    }
  }

  function indexedDbError(tx) {
    return (tx && tx.error && tx.error.message) || 'indexeddb write failed';
  }

  function ensureState(source) {
    var base = source && typeof source === 'object' ? clone(source) : {};
    base.config = normalizeConfig(base.config || {});
    base.movimientos = Array.isArray(base.movimientos) ? base.movimientos : [];
    base.ahorrosFuturo = Array.isArray(base.ahorrosFuturo) ? base.ahorrosFuturo : [];
    base.metas = Array.isArray(base.metas) ? base.metas : [];
    base.wishlist = Array.isArray(base.wishlist) ? base.wishlist : [];
    base.photos = base.photos && typeof base.photos === 'object' ? base.photos : {};
    base.resumen = buildSummary(base);
    return base;
  }

  function normalizeConfig(source) {
    var config = source || {};
    var salary = utils.normalizeAmount(config.sueldoMensual !== undefined ? config.sueldoMensual : config.monthlySalary);
    return {
      sueldoMensual: salary,
      moneda: String(config.moneda || config.currency || 'PYG').trim() || 'PYG',
      estadoMesActual: String(config.estadoMesActual || config.monthStatus || 'abierto').trim() || 'abierto',
      mesActual: normalizeMonth(config.mesActual || config.currentMonth || currentMonth()),
      fechaUltimoInicioMes: String(config.fechaUltimoInicioMes || '').slice(0, 7),
      fechaUltimoCobro: String(config.fechaUltimoCobro || '').slice(0, 10),
      ultimoMesCobrado: String(config.ultimoMesCobrado || '').slice(0, 7),
      categorias: normalizeCategories(config.categorias || config.categories),
      gastosFijos: normalizeFixedExpenses(config.gastosFijos || config.fixedExpenses, salary),
      zonaHoraria: String(config.zonaHoraria || 'America/Asuncion'),
      onboardingVersion: String(config.onboardingVersion || ''),
      onboardingUpdatedAt: String(config.onboardingUpdatedAt || '')
    };
  }

  function normalizeCategories(items) {
    var fallback = ['Alimentacion', 'Transporte', 'Servicios', 'Salud', 'Educacion', 'Hogar', 'Ocio', 'Disponible', 'Ahorros', 'Metas', 'Wishlist', 'Otros'];
    var seen = {};
    return (Array.isArray(items) && items.length ? items : fallback)
      .map(function (item) { return String(item || '').trim(); })
      .filter(function (item) {
        var key = item.toLowerCase();
        if (!item || seen[key]) {
          return false;
        }
        seen[key] = true;
        return true;
      });
  }

  function normalizeFixedExpenses(items, salary) {
    return utils.normalizeFixedExpenses(Array.isArray(items) ? items : [], salary);
  }

  function bootstrap(state) {
    return {
      config: clone(state.config),
      resumen: buildSummary(state),
      movimientos: listMovements(state, { allMonths: true, order: 'desc' }),
      ahorrosFuturo: activeItems(state.ahorrosFuturo),
      metas: activeItems(state.metas),
      wishlist: sortWishlist(activeItems(state.wishlist)),
      archivo: archiveItems(state)
    };
  }

  function listMovements(state, payload) {
    var allMonths = Boolean(payload.allMonths || payload.todosLosMeses);
    var month = allMonths ? '' : normalizeMonth(payload.mes || payload.month || state.config.mesActual);
    var items = state.movimientos.filter(function (item) {
      return allMonths || movementMonth(item) === month;
    });
    sortMovements(items);
    if (String(payload.order || payload.orden || 'desc').toLowerCase() === 'asc') {
      items.reverse();
    }
    if (payload.limit) {
      items = items.slice(0, Math.max(0, Number(payload.limit) || 0));
    }
    return {
      mes: month || null,
      allMonths: allMonths,
      movimientos: clone(items)
    };
  }

  function createMovement(state, payload) {
    var movement = movementFromPayload(payload, null, nextId('mov'));
    if (isSalaryMovement(movement)) {
      var existingSalary = findSalaryMovement(state.movimientos, movement.mes);
      if (existingSalary) {
        return {
          movimiento: clone(existingSalary),
          yaRegistrado: true,
          resumen: buildSummary(state, movement.mes)
        };
      }
      state.config.ultimoMesCobrado = movement.mes;
      state.config.fechaUltimoCobro = movement.fecha;
    }
    state.movimientos.push(movement);
    applyMovementImpact(state, movement, 1);
    return {
      movimiento: clone(movement),
      yaRegistrado: false,
      resumen: buildSummary(state, movement.mes)
    };
  }

  function updateMovement(state, payload) {
    var existing = requireItem(state.movimientos, payload.id, 'movimiento');
    applyMovementImpact(state, existing, -1);
    var updated = movementFromPayload(payload, existing, existing.id);
    replaceItem(state.movimientos, updated);
    applyMovementImpact(state, updated, 1);
    return {
      movimiento: clone(updated),
      resumen: buildSummary(state, updated.mes)
    };
  }

  function deleteMovement(state, payload) {
    var existing = requireItem(state.movimientos, payload.id, 'movimiento');
    state.movimientos = state.movimientos.filter(function (item) {
      return String(item.id) !== String(existing.id);
    });
    applyMovementImpact(state, existing, -1);
    return {
      movimiento: clone(existing),
      resumen: buildSummary(state, existing.mes)
    };
  }

  function movementFromPayload(payload, existing, id) {
    var source = payload || {};
    var base = existing || {};
    var type = source.tipo !== undefined ? source.tipo : (base.tipo || 'Gasto');
    var category = source.categoria !== undefined ? source.categoria : (base.categoria || defaultCategoryForMovement(type));
    var relatedId = source.idRelacionado !== undefined ? source.idRelacionado : (base.idRelacionado || '');
    if (type === 'Gasto' && isWishlistCategory(category) && relatedId) {
      type = 'Compra de wishlist';
      category = 'Wishlist';
    }
    if (type === 'Aporte a ahorro') {
      category = 'Ahorros';
    }
    if (type === 'Aporte a meta') {
      category = 'Metas';
    }
    if (type === 'Compra de wishlist') {
      category = 'Wishlist';
    }
    if (type === 'Ingreso') {
      category = 'Ingreso';
    }
    var date = source.fecha !== undefined ? source.fecha : (base.fecha || utils.toInputDate());
    var time = source.hora !== undefined ? source.hora : (base.hora || utils.toInputTime() + ':00');
    return {
      id: id || base.id || nextId('mov'),
      fecha: String(date || utils.toInputDate()).slice(0, 10),
      hora: normalizeTime(time),
      mes: String(date || utils.toInputDate()).slice(0, 7),
      tipo: type,
      motivo: source.motivo !== undefined ? String(source.motivo || '').trim() : (base.motivo || ''),
      categoria: category,
      monto: utils.normalizeAmount(source.monto !== undefined ? source.monto : base.monto),
      idRelacionado: relatedId,
      tipoRelacionado: source.tipoRelacionado !== undefined ? source.tipoRelacionado : (base.tipoRelacionado || relatedTypeForMovement(type)),
      descripcion: source.descripcion !== undefined ? String(source.descripcion || '') : (base.descripcion || ''),
      fechaCreacion: base.fechaCreacion || timestamp(),
      fechaModificacion: timestamp()
    };
  }

  function syncFixedExpenses(state, payload) {
    var month = monthFromPayload(payload) || state.config.mesActual || currentMonth();
    var existingKeys = {};
    var created = [];
    state.movimientos.forEach(function (movement) {
      var key = fixedExpenseKey(movement);
      if (key) {
        existingKeys[key] = true;
      }
    });
    normalizeFixedExpenses(state.config.gastosFijos, state.config.sueldoMensual).forEach(function (item) {
      var name = utils.fixedExpenseName(item);
      var amount = utils.fixedExpenseAmount(item);
      var key = month + '|' + name.toLowerCase().replace(/\s+/g, ' ');
      if (!name || amount <= 0 || existingKeys[key]) {
        return;
      }
      var movement = movementFromPayload({
        fecha: month + '-01',
        hora: '00:00:00',
        tipo: 'Gasto',
        motivo: name,
        categoria: 'Gasto fijo',
        monto: amount,
        descripcion: 'Gasto fijo automatico ' + month + ' :: ' + name
      }, null, nextId('mov'));
      state.movimientos.push(movement);
      created.push(movement);
      existingKeys[key] = true;
    });
    return {
      mes: month,
      movimientosCreados: clone(created),
      movimientos: listMovements(state, { mes: month }).movimientos,
      resumen: buildSummary(state, month)
    };
  }

  function fixedExpenseKey(movement) {
    if (!movement || movement.categoria !== 'Gasto fijo') {
      return '';
    }
    return movementMonth(movement) + '|' + String(movement.motivo || '').toLowerCase().replace(/\s+/g, ' ');
  }

  function upsertFutureSaving(state, payload, existing) {
    var item = Object.assign({}, existing || {}, {
      id: existing ? existing.id : nextId('aho'),
      titulo: String(payload.titulo || (existing || {}).titulo || '').trim(),
      descripcion: String(payload.descripcion || (existing || {}).descripcion || ''),
      plazo: String(payload.plazo || (existing || {}).plazo || '').trim(),
      montoMensual: utils.normalizeAmount(payload.montoMensual !== undefined ? payload.montoMensual : (existing || {}).montoMensual),
      montoAcumulado: utils.normalizeAmount(payload.montoAcumulado !== undefined ? payload.montoAcumulado : (existing || {}).montoAcumulado),
      estado: payload.estado || (existing || {}).estado || ACTIVE,
      fechaCreacion: (existing || {}).fechaCreacion || timestamp()
    });
    requireTitle(item.titulo, 'ahorro');
    replaceItem(state.ahorrosFuturo, item);
    return clone(item);
  }

  function upsertGoal(state, payload, existing) {
    var image = prepareImage(state, payload, existing);
    var target = utils.normalizeAmount(payload.montoObjetivo !== undefined ? payload.montoObjetivo : (existing || {}).montoObjetivo);
    var accumulated = utils.normalizeAmount(payload.montoAcumulado !== undefined ? payload.montoAcumulado : (existing || {}).montoAcumulado);
    var item = Object.assign({}, existing || {}, {
      id: existing ? existing.id : nextId('met'),
      titulo: String(payload.titulo || (existing || {}).titulo || '').trim(),
      descripcion: String(payload.descripcion || (existing || {}).descripcion || ''),
      plazo: String(payload.plazo || (existing || {}).plazo || '').trim(),
      montoMensual: utils.normalizeAmount(payload.montoMensual !== undefined ? payload.montoMensual : (existing || {}).montoMensual),
      montoObjetivo: target,
      montoAcumulado: accumulated,
      porcentaje: goalPercent(accumulated, target),
      imageDriveId: image.imageDriveId,
      imageRef: image.imageRef,
      estado: payload.estado || (existing || {}).estado || ACTIVE,
      fechaCreacion: (existing || {}).fechaCreacion || timestamp()
    });
    requireTitle(item.titulo, 'meta');
    replaceItem(state.metas, item);
    return clone(item);
  }

  function deleteGoal(state, payload) {
    var existing = requireItem(state.metas, payload.id, 'meta');
    existing.estado = INACTIVE;
    return clone(existing);
  }

  function upsertWishlistItem(state, payload, existing) {
    var image = prepareImage(state, payload, existing);
    var item = Object.assign({}, existing || {}, {
      id: existing ? existing.id : nextId('wis'),
      titulo: String(payload.titulo || (existing || {}).titulo || '').trim(),
      descripcion: String(payload.descripcion !== undefined ? payload.descripcion : ((existing || {}).descripcion || '')),
      plazo: String(payload.plazo || (existing || {}).plazo || '').trim(),
      costoAproximado: utils.normalizeAmount(payload.costoAproximado !== undefined ? payload.costoAproximado : (existing || {}).costoAproximado),
      imageDriveId: image.imageDriveId,
      imageRef: image.imageRef,
      estado: payload.estado || (existing || {}).estado || ACTIVE,
      fechaCreacion: (existing || {}).fechaCreacion || timestamp(),
      fechaConversionMeta: (existing || {}).fechaConversionMeta || ''
    });
    requireTitle(item.titulo, 'wishlist');
    replaceItem(state.wishlist, item);
    return clone(item);
  }

  function deleteWishlistItem(state, payload) {
    var existing = requireItem(state.wishlist, payload.id, 'wishlist');
    existing.estado = INACTIVE;
    return clone(existing);
  }

  function convertWishlistToGoal(state, payload) {
    var id = payload.wishlistId || payload.id;
    var item = requireItem(state.wishlist, id, 'wishlist');
    if (item.estado && item.estado !== ACTIVE) {
      throw new Error('La wishlist indicada no esta activa.');
    }
    var goal = upsertGoal(state, {
      titulo: item.titulo,
      descripcion: payload.descripcion || item.descripcion || '',
      plazo: payload.plazo || item.plazo || '',
      montoMensual: utils.normalizeAmount(payload.montoMensual || payload.monthlyAmount),
      montoObjetivo: item.costoAproximado,
      montoAcumulado: 0,
      imageDriveId: item.imageDriveId,
      imageRef: item.imageRef
    }, null);
    item.estado = CONVERTED;
    item.fechaConversionMeta = timestamp();
    return {
      goal: goal,
      wishlistItem: clone(item)
    };
  }

  function prepareImage(state, payload, existing) {
    if (payload.imageBase64) {
      var imageId = (existing && existing.imageDriveId) || nextId('img');
      state.photos[imageId] = payload.imageBase64;
      return {
        imageDriveId: imageId,
        imageRef: 'local:' + imageId
      };
    }
    return {
      imageDriveId: payload.imageDriveId || (existing || {}).imageDriveId || '',
      imageRef: payload.imageRef || (existing || {}).imageRef || ''
    };
  }

  function uploadPhoto(state, payload) {
    var imageId = nextId('img');
    var dataUrl = payload.dataUrl || payload.imageBase64 || '';
    if (!dataUrl) {
      throw new Error('No hay imagen para guardar.');
    }
    state.photos[imageId] = dataUrl;
    return {
      fileId: imageId,
      imageDriveId: imageId,
      imageRef: 'local:' + imageId
    };
  }

  function getPhoto(state, payload) {
    var id = payload.fileId || payload.imageDriveId || payload.id || '';
    return {
      fileId: id,
      dataUrl: state.photos[id] || ''
    };
  }

  function applyMovementImpact(state, movement, direction) {
    var amount = utils.normalizeAmount(movement && movement.monto) * Number(direction || 1);
    var relatedId = movement && movement.idRelacionado;
    if (!relatedId) {
      return;
    }
    if (movement.tipo === 'Aporte a ahorro') {
      adjustAccumulated(state.ahorrosFuturo, relatedId, amount, false);
    }
    if (movement.tipo === 'Aporte a meta') {
      adjustAccumulated(state.metas, relatedId, amount, true);
    }
    if (movement.tipo === 'Compra de wishlist') {
      var item = findById(state.wishlist, relatedId);
      if (item) {
        if (Number(direction || 1) > 0) {
          item.estado = PURCHASED;
        } else if (item.estado === PURCHASED) {
          item.estado = ACTIVE;
        }
      }
    }
  }

  function adjustAccumulated(items, id, delta, isGoal) {
    var item = findById(items, id);
    if (!item) {
      throw new Error('No existe el registro relacionado.');
    }
    item.montoAcumulado = Math.max(0, utils.normalizeAmount(item.montoAcumulado) + Number(delta || 0));
    if (isGoal) {
      item.porcentaje = goalPercent(item.montoAcumulado, item.montoObjetivo);
      if (goalCompleted(item)) {
        item.estado = COMPLETED;
      } else if (String(item.estado || '').toLowerCase() === COMPLETED.toLowerCase()) {
        item.estado = ACTIVE;
      }
    }
  }

  function buildSummary(state, explicitMonth) {
    var config = normalizeConfig(state.config || {});
    var month = normalizeMonth(explicitMonth || config.mesActual || currentMonth());
    var salary = utils.normalizeAmount(config.sueldoMensual);
    var totals = {
      gastos: 0,
      gastosFijos: 0,
      gastosVariables: 0,
      comprasWishlist: 0,
      ingresosSueldo: 0,
      ingresosExtra: 0,
      aportesAhorro: 0,
      aportesMeta: 0
    };
    var categoryTotals = {};
    var count = 0;
    var remanenteAnterior = 0;
    var salaryMovement = null;

    state.movimientos.forEach(function (movement) {
      var itemMonth = movementMonth(movement);
      var amount = utils.normalizeAmount(movement.monto);
      if (itemMonth < month) {
        if (isIncomeMovement(movement)) {
          remanenteAnterior += amount;
        } else if (isOutflowMovement(movement)) {
          remanenteAnterior -= amount;
        }
      }
    });

    state.movimientos.filter(function (movement) {
      return movementMonth(movement) === month;
    }).forEach(function (movement) {
      var type = movement.tipo;
      var amount = utils.normalizeAmount(movement.monto);
      var category = movement.categoria || 'Otros';
      count += 1;
      if (type === 'Gasto') {
        totals.gastos += amount;
        if (utils.isFixedExpenseMovement(movement)) {
          totals.gastosFijos += amount;
        } else {
          totals.gastosVariables += amount;
          categoryTotals[category] = Number(categoryTotals[category] || 0) + amount;
        }
      }
      if (type === 'Compra de wishlist') {
        totals.comprasWishlist += amount;
        categoryTotals[category] = Number(categoryTotals[category] || 0) + amount;
      }
      if (type === 'Ingreso') {
        if (isSalaryMovement(movement)) {
          totals.ingresosSueldo += amount;
          salaryMovement = salaryMovement || movement;
        } else {
          totals.ingresosExtra += amount;
        }
      }
      if (type === 'Aporte a ahorro') {
        totals.aportesAhorro += amount;
      }
      if (type === 'Aporte a meta') {
        totals.aportesMeta += amount;
      }
    });

    var fixedConfigured = normalizeFixedExpenses(config.gastosFijos, salary).reduce(function (sum, item) {
      return sum + utils.fixedExpenseAmount(item);
    }, 0);
    var savingsPlan = plannedSavings(state);
    var savingsConfigured = savingsPlan.reduce(function (sum, item) {
      return sum + item.monto;
    }, 0);
    var plannedPartition = fixedConfigured + savingsConfigured;
    var superfluosPlanificados = Math.max(0, salary - plannedPartition);
    var excesoParticion = Math.max(0, plannedPartition - salary);
    var totalGastado = totals.gastosVariables + totals.comprasWishlist;
    var salidasTotales = totals.gastos + totals.comprasWishlist + totals.aportesAhorro + totals.aportesMeta;
    var ingresosDelMes = totals.ingresosSueldo + totals.ingresosExtra;
    var totalIngresos = remanenteAnterior + ingresosDelMes;
    var totalApartado = totals.aportesAhorro + totals.aportesMeta;
    var baseDisponible = totalIngresos - fixedConfigured - savingsConfigured;
    var disponible = totalIngresos - salidasTotales;
    var baseCalculoDisponible = Math.max(0, totalIngresos);
    var reminders = postSalaryReminders(state, month, salaryMovement);

    return {
      mes: month,
      moneda: config.moneda || 'PYG',
      sueldoMensual: salary,
      sueldoCobrado: totals.ingresosSueldo,
      sueldoRegistrado: totals.ingresosSueldo > 0,
      fechaCobro: salaryMovement ? salaryMovement.fecha : '',
      remanenteAnterior: remanenteAnterior,
      ingresosExtra: totals.ingresosExtra,
      ingresosDelMes: ingresosDelMes,
      totalIngresos: totalIngresos,
      totalGastado: totalGastado,
      salidasTotales: salidasTotales,
      gastosNormales: totals.gastos,
      gastosFijos: totals.gastosFijos,
      gastosVariables: totals.gastosVariables,
      gastosFijosConfigurados: fixedConfigured,
      comprasWishlist: totals.comprasWishlist,
      aportesAhorro: totals.aportesAhorro,
      aportesMeta: totals.aportesMeta,
      totalApartado: totalApartado,
      ahorrosPlanificados: savingsConfigured,
      superfluosPlanificados: superfluosPlanificados,
      excesoParticion: excesoParticion,
      particionSueldo: salaryPartitionSummary(fixedConfigured, savingsConfigured, superfluosPlanificados, salary),
      baseDisponible: baseDisponible,
      baseCalculoDisponible: baseCalculoDisponible,
      disponible: disponible,
      porcentajeDisponible: baseCalculoDisponible > 0
        ? Math.max(0, Math.min(100, Math.round((disponible / baseCalculoDisponible) * 10000) / 100))
        : 0,
      categoriaMayorGasto: topCategory(categoryTotals),
      actividadReciente: sortMovements(state.movimientos.slice()).slice(0, 5),
      cantidadMovimientos: count,
      recordatoriosPostCobro: reminders.todos,
      recordatoriosPendientes: reminders.pendientes,
      recordatoriosCompletos: reminders.completos,
      ahorrosFuturo: activeItems(state.ahorrosFuturo),
      metas: activeItems(state.metas),
      wishlist: sortWishlist(activeItems(state.wishlist)),
      archivo: archiveItems(state)
    };
  }

  function plannedSavings(state) {
    var items = [];
    activeItems(state.ahorrosFuturo).forEach(function (item) {
      var amount = utils.normalizeAmount(item.montoMensual);
      if (amount > 0) {
        items.push({
          tipo: 'ahorro',
          idRelacionado: item.id,
          nombre: item.titulo || 'Futuro',
          monto: amount
        });
      }
    });
    activeItems(state.metas).forEach(function (item) {
      var amount = utils.normalizeAmount(item.montoMensual);
      if (amount > 0) {
        items.push({
          tipo: 'meta',
          idRelacionado: item.id,
          nombre: item.titulo || 'Meta',
          monto: amount
        });
      }
    });
    return items;
  }

  function salaryPartitionSummary(fixed, savings, superfluous, salary) {
    var total = Math.max(1, utils.normalizeAmount(salary));
    return [
      {
        clave: 'fijos',
        nombre: 'Gastos fijos',
        monto: fixed,
        porcentaje: Math.round((fixed / total) * 10000) / 100
      },
      {
        clave: 'ahorros',
        nombre: 'Ahorros',
        monto: savings,
        porcentaje: Math.round((savings / total) * 10000) / 100
      },
      {
        clave: 'disponible',
        nombre: 'Disponible',
        monto: superfluous,
        porcentaje: Math.round((superfluous / total) * 10000) / 100
      }
    ].filter(function (item) {
      return item.monto > 0;
    });
  }

  function postSalaryReminders(state, month, salaryMovement) {
    if (!salaryMovement) {
      return { todos: [], pendientes: [], completos: true };
    }
    var fixedItems = normalizeFixedExpenses(state.config.gastosFijos, state.config.sueldoMensual).map(function (item, index) {
      return {
        id: 'fixed-' + index,
        tipo: 'fijo',
        tipoMovimiento: 'Gasto fijo',
        nombre: utils.fixedExpenseName(item) || 'Gasto fijo',
        monto: utils.fixedExpenseAmount(item),
        idRelacionado: 'fixed-' + index,
        pagado: hasFixedPayment(state.movimientos, month, item)
      };
    }).filter(function (item) {
      return item.nombre && item.monto > 0;
    });
    var savingItems = plannedSavings(state).map(function (item) {
      return {
        id: item.tipo + '-' + item.idRelacionado,
        tipo: item.tipo,
        tipoMovimiento: item.tipo === 'meta' ? 'Aporte a meta' : 'Aporte a ahorro',
        nombre: item.nombre,
        monto: item.monto,
        idRelacionado: item.idRelacionado,
        pagado: hasRelatedPayment(state.movimientos, month, item)
      };
    });
    var all = fixedItems.concat(savingItems);
    return {
      todos: all,
      pendientes: all.filter(function (item) { return !item.pagado; }),
      completos: all.length > 0 && all.every(function (item) { return item.pagado; })
    };
  }

  function hasFixedPayment(movements, month, fixedExpense) {
    var name = normalizeCompareText(utils.fixedExpenseName(fixedExpense));
    return (movements || []).some(function (movement) {
      return movementMonth(movement) === month
        && utils.isFixedExpenseMovement(movement)
        && normalizeCompareText(movement.motivo) === name;
    });
  }

  function hasRelatedPayment(movements, month, item) {
    var expectedType = item.tipo === 'meta' ? 'Aporte a meta' : 'Aporte a ahorro';
    return (movements || []).some(function (movement) {
      return movementMonth(movement) === month
        && movement.tipo === expectedType
        && String(movement.idRelacionado || '') === String(item.idRelacionado || '');
    });
  }

  function normalizeCompareText(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function topCategory(totals) {
    var names = Object.keys(totals || {});
    if (!names.length) {
      return {
        categoria: '',
        monto: 0,
        mensaje: 'Todavia no registraste gastos este mes.'
      };
    }
    names.sort(function (left, right) {
      return Number(totals[right] || 0) - Number(totals[left] || 0);
    });
    return {
      categoria: names[0],
      monto: Number(totals[names[0]] || 0),
      mensaje: 'Resumen local recalculado por categoria.'
    };
  }

  function activeItems(items) {
    return clone((items || []).filter(function (item) {
      return !item.estado || String(item.estado).toLowerCase() === ACTIVE.toLowerCase();
    }));
  }

  function archiveItems(state) {
    var archived = [];
    (state.metas || []).forEach(function (item) {
      var status = String(item.estado || ACTIVE).toLowerCase();
      if (status === INACTIVE.toLowerCase() || status === COMPLETED.toLowerCase()) {
        archived.push(Object.assign({}, item, {
          tipo: 'meta',
          cumplida: status === COMPLETED.toLowerCase(),
          motivoArchivo: status === COMPLETED.toLowerCase() ? 'Meta cumplida' : 'Meta borrada'
        }));
      }
    });
    (state.wishlist || []).forEach(function (item) {
      var status = String(item.estado || ACTIVE).toLowerCase();
      if (status !== ACTIVE.toLowerCase()) {
        archived.push(Object.assign({}, item, {
          tipo: 'wishlist',
          motivoArchivo: wishlistArchiveReason(status)
        }));
      }
    });
    archived.sort(function (left, right) {
      return String(left.titulo || '').localeCompare(String(right.titulo || ''), 'es');
    });
    return clone(archived);
  }

  function wishlistArchiveReason(status) {
    if (status === PURCHASED.toLowerCase()) {
      return 'Cosa cumplida';
    }
    if (status === CONVERTED.toLowerCase()) {
      return 'Cosa convertida';
    }
    return 'Cosa borrada';
  }

  function restoreArchiveItem(state, payload) {
    var type = String(payload.tipo || payload.type || payload.coleccion || '').toLowerCase();
    var isWishlist = type === 'wishlist' || type === 'wish' || type === 'cosas';
    var collection = isWishlist ? state.wishlist : state.metas;
    var label = isWishlist ? 'wishlist' : 'meta';
    var item = requireItem(collection, payload.id, label);
    item.estado = ACTIVE;
    if (isWishlist) {
      item.fechaConversionMeta = '';
    }
    return {
      tipo: isWishlist ? 'wishlist' : 'meta',
      coleccion: isWishlist ? 'wishlist' : 'metas',
      item: clone(item),
      archivo: archiveItems(state),
      resumen: buildSummary(state)
    };
  }

  function goalCompleted(item) {
    var target = utils.normalizeAmount((item || {}).montoObjetivo);
    return target > 0 && utils.normalizeAmount((item || {}).montoAcumulado) >= target;
  }

  function sortWishlist(items) {
    return clone(items || []).sort(function (left, right) {
      return utils.normalizeAmount(left.costoAproximado) - utils.normalizeAmount(right.costoAproximado);
    });
  }

  function sortMovements(items) {
    return (items || []).sort(function (left, right) {
      var leftKey = movementSortKey(left);
      var rightKey = movementSortKey(right);
      if (leftKey === rightKey) {
        return 0;
      }
      return leftKey < rightKey ? 1 : -1;
    });
  }

  function movementSortKey(item) {
    return [
      String((item || {}).fecha || ''),
      String((item || {}).hora || ''),
      String((item || {}).fechaModificacion || (item || {}).fechaCreacion || ''),
      String((item || {}).id || '')
    ].join(' ');
  }

  function movementMonth(item) {
    var date = String((item || {}).fecha || '');
    if (/^\d{4}-\d{2}/.test(date)) {
      return date.slice(0, 7);
    }
    return String((item || {}).mes || currentMonth()).slice(0, 7);
  }

  function findSalaryMovement(items, month) {
    return (items || []).filter(function (item) {
      return movementMonth(item) === month && isSalaryMovement(item);
    })[0] || null;
  }

  function isSalaryMovement(item) {
    return String((item || {}).tipo || '') === 'Ingreso'
      && String((item || {}).motivo || '').trim().toLowerCase() === 'sueldo';
  }

  function isIncomeMovement(item) {
    return String((item || {}).tipo || '') === 'Ingreso';
  }

  function isOutflowMovement(item) {
    var type = String((item || {}).tipo || '');
    return type === 'Gasto'
      || type === 'Compra de wishlist'
      || type === 'Aporte a ahorro'
      || type === 'Aporte a meta';
  }

  function monthFromPayload(payload) {
    var value = (payload || {}).mes || (payload || {}).month || '';
    if (!value) {
      return '';
    }
    return normalizeMonth(value);
  }

  function normalizeMonth(value) {
    var text = String(value || '').slice(0, 7);
    return /^\d{4}-\d{2}$/.test(text) ? text : currentMonth();
  }

  function currentMonth() {
    return utils.currentMonth();
  }

  function normalizeTime(value) {
    var text = String(value || utils.toInputTime());
    return /^\d{2}:\d{2}$/.test(text) ? text + ':00' : text;
  }

  function defaultCategoryForMovement(type) {
    if (type === 'Ingreso') {
      return 'Ingreso';
    }
    if (type === 'Aporte a ahorro') {
      return 'Ahorros';
    }
    if (type === 'Aporte a meta') {
      return 'Metas';
    }
    if (type === 'Compra de wishlist') {
      return 'Wishlist';
    }
    return 'Otros';
  }

  function relatedTypeForMovement(type) {
    if (type === 'Aporte a ahorro') {
      return 'ahorro';
    }
    if (type === 'Aporte a meta') {
      return 'meta';
    }
    if (type === 'Compra de wishlist') {
      return 'wishlist';
    }
    return '';
  }

  function isWishlistCategory(value) {
    var text = String(value || '').toLowerCase();
    return text === 'wishlist' || text === 'cosas que quiero' || text === 'cosa que quiero';
  }

  function requireItem(items, id, label) {
    var item = findById(items, id);
    if (!item) {
      throw new Error('No existe el registro de ' + label + '.');
    }
    return item;
  }

  function findById(items, id) {
    var value = String(id || '');
    return (items || []).filter(function (item) {
      return String(item.id || '') === value;
    })[0] || null;
  }

  function replaceItem(items, item) {
    var found = false;
    for (var index = 0; index < items.length; index += 1) {
      if (String(items[index].id) === String(item.id)) {
        items[index] = item;
        found = true;
        break;
      }
    }
    if (!found) {
      items.push(item);
    }
  }

  function requireTitle(title, label) {
    if (!String(title || '').trim()) {
      throw new Error('Carga un titulo para ' + label + '.');
    }
  }

  function goalPercent(accumulated, target) {
    var total = utils.normalizeAmount(target);
    if (!total) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round((utils.normalizeAmount(accumulated) / total) * 10000) / 100));
  }

  function nextId(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function timestamp() {
    return new Date().toISOString();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value === undefined ? null : value));
  }

  window.FinanzasLocalStore = {
    request: request,
    loadState: loadState,
    saveState: saveState,
    readSaveMeta: readSaveMeta,
    exportBackup: exportBackup,
    importBackup: importBackup
  };
}());
