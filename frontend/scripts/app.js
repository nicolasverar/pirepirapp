(function () {
  'use strict';

  var utils = window.FinanzasUtils;
  var movementGuardCounter = 0;
  var movementRefreshTimer = 0;
  var movementSyncGuards = {};
  var fixedExpenseSyncInFlight = false;
  var toastTimer = 0;
  var MOVEMENT_GUARD_TTL_MS = 300000;
  var MOVEMENT_REFRESH_DELAY_MS = 10000;
  var MOVEMENT_GUARDS_KEY_PREFIX = 'finanzasMovementSyncGuards:';

  function init() {
    window.FinanzasRouter.bind();
    window.FinanzasState.subscribe(window.FinanzasRender.render);
    syncVersionLabels();
    bindGlobalActions();
    registerServiceWorker();
    loadMovementGuards();
    var hadCache = loadCachedBootstrap();
    if (!hadCache) {
      window.FinanzasRender.render();
    }
    refresh({ background: hadCache });
  }

  function bindGlobalActions() {
    var actionKey = utils.qs('#action-key');
    actionKey.addEventListener('click', function () {
      window.FinanzasForms.actionMenu();
    });

    var updateButton = utils.qs('#update-app-button');
    if (updateButton) {
      updateButton.addEventListener('click', updateApp);
    }

    window.addEventListener('online', function () {
      setStatus('Sincronizado');
      refresh();
    });

    window.addEventListener('offline', function () {
      setStatus('Sin conexion');
    });
  }

  function loadCachedBootstrap() {
    if (!window.FinanzasLocalCache) {
      return false;
    }
    var cache = window.FinanzasLocalCache.loadBootstrap();
    if (!cache || !cache.data) {
      return false;
    }
    window.FinanzasState.setData(cache.data);
    window.FinanzasState.setState({
      loading: false,
      syncStatus: 'Local',
      error: '',
      localDataSavedAt: cache.savedAt || ''
    });
    return true;
  }

  function refresh(options) {
    var settings = options || {};
    if (!window.FinanzasApi.hasBackend()) {
      setStatus('Falta URL');
      window.FinanzasRender.render();
      return Promise.resolve();
    }

    var hasData = Boolean(window.FinanzasState.getState().data.resumen);
    var currentStatus = window.FinanzasState.getState().syncStatus;
    window.FinanzasState.setState({
      loading: !hasData,
      syncStatus: settings.silent ? currentStatus : (hasData || settings.background ? 'Actualizando' : 'Cargando'),
      error: ''
    });
    return window.FinanzasApi.request('bootstrap', {})
      .then(function (data) {
        var reconciled = reconcileBootstrapData(data);
        window.FinanzasState.setData(reconciled);
        if (window.FinanzasLocalCache) {
          window.FinanzasLocalCache.saveBootstrap(reconciled);
        }
        window.FinanzasState.setState({ loading: false, syncStatus: 'Sincronizado', error: '' });
      })
      .catch(function (error) {
        var hasLocalData = Boolean(window.FinanzasState.getState().data.resumen);
        window.FinanzasState.setState({
          loading: false,
          syncStatus: settings.silent && hasLocalData ? currentStatus : (hasLocalData ? 'Local' : 'Error'),
          error: error.message
        });
        if (/clave|token|conecta|url|FINANZAS_API_TOKEN/i.test(error.message)) {
          window.FinanzasApi.clearAuthToken();
          window.FinanzasForms.openAccessForm();
          toast(error.message);
          return;
        }
        if (settings.silent && hasLocalData) {
          return;
        }
        if (hasLocalData) {
          toast(navigator.onLine === false ? 'Sin conexion. Usando datos guardados.' : 'Usando datos guardados.');
          return;
        }
        toast(error.message);
      });
  }

  function mutate(action, payload) {
    if (!window.FinanzasApi.hasBackend()) {
      var error = new Error('No se pudo iniciar el almacenamiento local.');
      toast(error.message);
      return Promise.reject(error);
    }

    window.FinanzasState.setState({ syncStatus: 'Guardando', error: '' });
    var rollback = applyOptimisticMutation(action, payload || {});
    return window.FinanzasApi.request(action, payload || {})
      .then(function (data) {
        applyMutationResult(action, data);
        window.FinanzasState.setState({ syncStatus: 'Sincronizado', error: '' });
        toast('Guardado');
        if (isMovementRoute(action) && !(window.FinanzasApi.isLocalMode && window.FinanzasApi.isLocalMode())) {
          scheduleMovementRefresh();
        } else {
          refresh({ background: true, silent: true });
        }
        return data;
      })
      .catch(function (error) {
        if (rollback) {
          rollback();
        }
        window.FinanzasState.setState({ syncStatus: 'Error', error: error.message });
        if (/clave|token|conecta|url|FINANZAS_API_TOKEN/i.test(error.message)) {
          window.FinanzasApi.clearAuthToken();
          window.FinanzasForms.openAccessForm();
        }
        toast(error.message);
        throw error;
      });
  }

  function syncFixedExpensesIfNeeded(data) {
    var current = data || window.FinanzasState.getState().data || {};
    var config = current.config || {};
    var month = String((current.resumen || {}).mes || config.mesActual || utils.currentMonth()).slice(0, 7);
    var fixed = utils.normalizeFixedExpenses(config.gastosFijos || [], config.sueldoMensual || 0).filter(function (item) {
      return utils.fixedExpenseAmount(item) > 0 && utils.fixedExpenseName(item);
    });
    if (!fixed.length || fixedExpenseSyncInFlight || !window.FinanzasApi.hasBackend()) {
      return;
    }
    var movements = movementItemsFromData(current.movimientos || {});
    var missing = fixed.some(function (item) {
      return !hasFixedExpenseMovement(movements, month, item);
    });
    if (!missing) {
      return;
    }

    fixedExpenseSyncInFlight = true;
    window.FinanzasApi.request('syncFixedExpenses', { mes: month })
      .then(function (result) {
        fixedExpenseSyncInFlight = false;
        applyFixedExpenseSyncResult(result || {});
      })
      .catch(function () {
        fixedExpenseSyncInFlight = false;
      });
  }

  function hasFixedExpenseMovement(movements, month, fixedExpense) {
    var name = normalizeFixedExpenseName(utils.fixedExpenseName(fixedExpense));
    return (movements || []).some(function (item) {
      return movementMonth(item) === month
        && utils.isFixedExpenseMovement(item)
        && normalizeFixedExpenseName(item.motivo) === name;
    });
  }

  function normalizeFixedExpenseName(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function applyFixedExpenseSyncResult(result) {
    var created = Array.isArray(result.movimientosCreados) ? result.movimientosCreados : [];
    if (!created.length && !Array.isArray(result.movimientos)) {
      return;
    }

    var current = window.FinanzasState.getState().data;
    var source = current.movimientos || {};
    var sourceItems = movementItemsFromData(source);
    var sourceIsAllMonths = !Array.isArray(source) && Boolean(source.allMonths);
    var items = sourceIsAllMonths
      ? mergeMovementItems(sourceItems, created)
      : (Array.isArray(result.movimientos) ? result.movimientos.slice() : mergeMovementItems(sourceItems, created));
    sortMovementItems(items);
    applyMovementItemsToState(current, source, items, result.resumen || current.resumen, current.config);
    saveCurrentBootstrap();
    if (created.length) {
      toast('Gastos fijos sincronizados');
    }
  }

  function mergeMovementItems(items, additions) {
    var seen = {};
    var merged = [];
    (items || []).concat(additions || []).forEach(function (item) {
      var id = String((item || {}).id || '');
      if (id && seen[id]) {
        return;
      }
      if (id) {
        seen[id] = true;
      }
      merged.push(item);
    });
    return merged;
  }

  function applyOptimisticMutation(action, payload) {
    var route = String(action || '').toLowerCase();
    if (route === 'createmovement') {
      return applyOptimisticMovementCreate(payload || {});
    }
    if (route === 'updatemovement' && payload && payload.id) {
      return applyOptimisticMovementUpdate(payload);
    }
    if (route === 'deletemovement' && payload && payload.id) {
      return applyOptimisticMovementDelete(payload.id);
    }
    if (route === 'convertwishlisttogoal' && payload && (payload.wishlistId || payload.id)) {
      return applyOptimisticWishlistConversion(payload.wishlistId || payload.id);
    }
    return null;
  }

  function isMovementRoute(action) {
    return String(action || '').toLowerCase().indexOf('movement') !== -1;
  }

  function scheduleMovementRefresh() {
    window.clearTimeout(movementRefreshTimer);
    movementRefreshTimer = window.setTimeout(function () {
      refresh({ background: true, silent: true });
    }, MOVEMENT_REFRESH_DELAY_MS);
  }

  function convertWishlistInstant(id) {
    return mutate('convertWishlistToGoal', { wishlistId: id });
  }

  function applyOptimisticWishlistConversion(id) {
    var current = window.FinanzasState.getState().data;
    var snapshot = cloneData(current);
    var wishlist = Array.isArray(current.wishlist) ? current.wishlist.slice() : [];
    var item = wishlist.filter(function (entry) {
      return String(entry.id) === String(id);
    })[0];
    if (!item) {
      return null;
    }

    var optimisticGoalId = 'optimistic-goal-' + item.id;
    var goal = {
      id: optimisticGoalId,
      titulo: item.titulo,
      descripcion: '',
      montoMensual: 0,
      montoObjetivo: utils.normalizeAmount(item.costoAproximado),
      montoAcumulado: 0,
      porcentaje: 0,
      imageDriveId: item.imageDriveId || '',
      imageRef: item.imageRef || '',
      estado: 'Activo',
      optimisticSourceWishlistId: item.id
    };
    var nextWishlist = wishlist.map(function (entry) {
      if (String(entry.id) !== String(id)) {
        return entry;
      }
      var nextEntry = {};
      Object.keys(entry).forEach(function (key) {
        nextEntry[key] = entry[key];
      });
      nextEntry.conversionFeedback = true;
      nextEntry.conversionPending = true;
      return nextEntry;
    });
    var nextGoals = (Array.isArray(current.metas) ? current.metas.slice() : []).filter(function (entry) {
      return String(entry.id) !== optimisticGoalId;
    });
    nextGoals.push(goal);

    window.FinanzasState.setData({
      config: current.config,
      resumen: current.resumen,
      movimientos: current.movimientos,
      ahorrosFuturo: current.ahorrosFuturo,
      metas: nextGoals,
      wishlist: nextWishlist
    });
    saveCurrentBootstrap();

    var timer = window.setTimeout(function () {
      removeOptimisticWishlistCard(id);
    }, 850);

    return function () {
      window.clearTimeout(timer);
      window.FinanzasState.setData(snapshot);
      saveCurrentBootstrap();
    };
  }

  function removeOptimisticWishlistCard(id) {
    var current = window.FinanzasState.getState().data;
    var wishlist = Array.isArray(current.wishlist) ? current.wishlist.filter(function (entry) {
      return !(String(entry.id) === String(id) && entry.conversionPending);
    }) : [];

    window.FinanzasState.setData({
      config: current.config,
      resumen: current.resumen,
      movimientos: current.movimientos,
      ahorrosFuturo: current.ahorrosFuturo,
      metas: current.metas,
      wishlist: wishlist
    });
    saveCurrentBootstrap();
  }

  function applyOptimisticMovementCreate(payload) {
    var current = window.FinanzasState.getState().data;
    var snapshot = cloneData(current);
    var source = current.movimientos || {};
    var movement = movementFromPayload(payload, null, nextOptimisticMovementId());
    movement.optimisticAction = 'createMovement';
    movement.optimisticKey = movementClientKey(movement);

    var items = movementItemsFromData(source).filter(function (item) {
      return String(item.id) !== String(movement.id);
    });
    items.push(movement);
    sortMovementItems(items);

    applyMovementItemsToState(current, source, items, current.resumen, current.config);
    rememberMovementCreate(movement);
    saveCurrentBootstrap();

    return function () {
      forgetMovementGuard(movement.id);
      window.FinanzasState.setData(snapshot);
      saveCurrentBootstrap();
    };
  }

  function applyOptimisticMovementUpdate(payload) {
    var current = window.FinanzasState.getState().data;
    var snapshot = cloneData(current);
    var source = current.movimientos || {};
    var existing = movementItemsFromData(source).filter(function (item) {
      return String(item.id) === String(payload.id);
    })[0];
    if (!existing) {
      return null;
    }

    var movement = movementFromPayload(payload, existing, existing.id);
    var items = movementItemsFromData(source).filter(function (item) {
      return String(item.id) !== String(movement.id);
    });
    items.push(movement);
    sortMovementItems(items);

    applyMovementItemsToState(current, source, items, current.resumen, current.config);
    rememberMovementUpsert(movement);
    saveCurrentBootstrap();

    return function () {
      forgetMovementGuard(movement.id);
      window.FinanzasState.setData(snapshot);
      saveCurrentBootstrap();
    };
  }

  function applyOptimisticMovementDelete(id) {
    var current = window.FinanzasState.getState().data;
    var snapshot = cloneData(current);
    var source = current.movimientos || {};
    var item = movementItemsFromData(source).filter(function (movement) {
      return String(movement.id) === String(id);
    })[0];
    if (!item) {
      return null;
    }

    var items = movementItemsFromData(source).filter(function (movement) {
      return String(movement.id) !== String(id);
    });
    var nextMovements = Array.isArray(source)
      ? items
      : Object.assign({}, source, { movimientos: items });

    window.FinanzasState.setData({
      config: current.config,
      resumen: recalculateSummary(current.resumen, current.config, items),
      movimientos: nextMovements,
      ahorrosFuturo: current.ahorrosFuturo,
      metas: current.metas,
      wishlist: current.wishlist
    });
    rememberMovementDelete(id);
    saveCurrentBootstrap();

    return function () {
      forgetMovementGuard(id);
      window.FinanzasState.setData(snapshot);
      saveCurrentBootstrap();
    };
  }

  function isSalaryMovement(item) {
    return String((item || {}).tipo || '') === 'Ingreso' && String((item || {}).motivo || '').trim().toLowerCase() === 'sueldo';
  }

  function movementMonth(item) {
    var date = String((item || {}).fecha || '');
    if (/^\d{4}-\d{2}/.test(date)) {
      return date.slice(0, 7);
    }
    return String((item || {}).mes || '').slice(0, 7);
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
      id: id || base.id || nextOptimisticMovementId(),
      fecha: String(date || utils.toInputDate()).slice(0, 10),
      hora: normalizeMovementTime(time),
      mes: String(date || utils.toInputDate()).slice(0, 7),
      tipo: type,
      motivo: source.motivo !== undefined ? source.motivo : (base.motivo || ''),
      categoria: category,
      monto: utils.normalizeAmount(source.monto !== undefined ? source.monto : base.monto),
      idRelacionado: relatedId,
      tipoRelacionado: source.tipoRelacionado !== undefined ? source.tipoRelacionado : (base.tipoRelacionado || relatedTypeForMovement(type)),
      descripcion: source.descripcion !== undefined ? source.descripcion : (base.descripcion || ''),
      fechaCreacion: base.fechaCreacion || new Date().toISOString(),
      fechaModificacion: new Date().toISOString()
    };
  }

  function normalizeMovementTime(value) {
    var text = String(value || utils.toInputTime());
    if (/^\d{2}:\d{2}$/.test(text)) {
      return text + ':00';
    }
    return text;
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

  function nextOptimisticMovementId() {
    movementGuardCounter += 1;
    return 'optimistic-mov-' + Date.now() + '-' + movementGuardCounter;
  }

  function applyMovementItemsToState(current, source, items, summary, config) {
    window.FinanzasState.setData({
      config: config || current.config,
      resumen: recalculateSummary(summary || current.resumen, config || current.config, items),
      movimientos: movementDataWithItems(source, items),
      ahorrosFuturo: current.ahorrosFuturo,
      metas: current.metas,
      wishlist: current.wishlist
    });
  }

  function movementDataWithItems(source, items) {
    if (Array.isArray(source)) {
      return items;
    }
    var result = copyObject(source || {});
    result.movimientos = items;
    return result;
  }

  function sortMovementItems(items) {
    items.sort(function (left, right) {
      var leftKey = movementSortKey(left);
      var rightKey = movementSortKey(right);
      if (leftKey === rightKey) {
        return 0;
      }
      return leftKey < rightKey ? 1 : -1;
    });
    return items;
  }

  function movementSortKey(item) {
    return [
      String((item || {}).fecha || ''),
      String((item || {}).hora || ''),
      String((item || {}).fechaModificacion || (item || {}).fechaCreacion || ''),
      String((item || {}).id || '')
    ].join(' ');
  }

  function recalculateSummary(summary, config, movements, dataOverride) {
    var base = copyObject(summary || {});
    var appConfig = config || {};
    var month = String(base.mes || appConfig.mesActual || utils.currentMonth()).slice(0, 7);
    var monthlySalary = utils.normalizeAmount(appConfig.sueldoMensual !== undefined ? appConfig.sueldoMensual : base.sueldoMensual);
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

    (movements || []).forEach(function (item) {
      var type = String((item || {}).tipo || '');
      var amount = utils.normalizeAmount((item || {}).monto);
      var category = String((item || {}).categoria || 'Otros') || 'Otros';
      var itemMonth = movementMonth(item);
      if (itemMonth < month) {
        if (isIncomeMovement(item)) {
          remanenteAnterior += amount;
        } else if (isOutflowMovement(item)) {
          remanenteAnterior -= amount;
        }
      }
      if (itemMonth !== month) {
        return;
      }
      count += 1;
      if (type === 'Gasto') {
        totals.gastos += amount;
        if (utils.isFixedExpenseMovement(item)) {
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
        if (isSalaryMovement(item)) {
          totals.ingresosSueldo += amount;
          salaryMovement = salaryMovement || item;
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

    var totalGastado = totals.gastosVariables + totals.comprasWishlist;
    var totalApartado = totals.aportesAhorro + totals.aportesMeta;
    var fixedConfigured = fixedExpenseTotal(appConfig.gastosFijos, monthlySalary);
    var savingsPlan = plannedSavingsFromCurrentState(dataOverride);
    var savingsConfigured = savingsPlan.reduce(function (sum, item) {
      return sum + utils.normalizeAmount(item.monto);
    }, 0);
    var plannedPartition = fixedConfigured + savingsConfigured;
    var superfluosPlanificados = Math.max(0, monthlySalary - plannedPartition);
    var excesoParticion = Math.max(0, plannedPartition - monthlySalary);
    var salidasTotales = totals.gastos + totals.comprasWishlist + totals.aportesAhorro + totals.aportesMeta;
    var ingresosDelMes = totals.ingresosSueldo + totals.ingresosExtra;
    var totalIngresos = remanenteAnterior + ingresosDelMes;
    var baseDisponible = totalIngresos - fixedConfigured - savingsConfigured;
    var disponible = totalIngresos - salidasTotales;
    var baseCalculoDisponible = Math.max(0, totalIngresos);
    var reminders = postSalaryRemindersFromCurrentState(month, salaryMovement, movements, dataOverride);
    base.mes = month;
    base.moneda = appConfig.moneda || base.moneda || 'PYG';
    base.sueldoMensual = monthlySalary;
    base.sueldoCobrado = totals.ingresosSueldo;
    base.sueldoRegistrado = totals.ingresosSueldo > 0;
    base.fechaCobro = salaryMovement ? salaryMovement.fecha : '';
    base.remanenteAnterior = remanenteAnterior;
    base.ingresosExtra = totals.ingresosExtra;
    base.ingresosDelMes = ingresosDelMes;
    base.totalIngresos = totalIngresos;
    base.totalGastado = totalGastado;
    base.salidasTotales = salidasTotales;
    base.gastosNormales = totals.gastos;
    base.gastosFijos = totals.gastosFijos;
    base.gastosVariables = totals.gastosVariables;
    base.gastosFijosConfigurados = fixedConfigured;
    base.comprasWishlist = totals.comprasWishlist;
    base.aportesAhorro = totals.aportesAhorro;
    base.aportesMeta = totals.aportesMeta;
    base.totalApartado = totalApartado;
    base.ahorrosPlanificados = savingsConfigured;
    base.superfluosPlanificados = superfluosPlanificados;
    base.excesoParticion = excesoParticion;
    base.particionSueldo = salaryPartitionSummary(fixedConfigured, savingsConfigured, superfluosPlanificados, monthlySalary);
    base.baseDisponible = baseDisponible;
    base.baseCalculoDisponible = baseCalculoDisponible;
    base.disponible = disponible;
    base.porcentajeDisponible = baseCalculoDisponible > 0
      ? Math.max(0, Math.min(100, Math.round((disponible / baseCalculoDisponible) * 10000) / 100))
      : 0;
    base.categoriaMayorGasto = topCategoryFromTotals(categoryTotals);
    base.actividadReciente = sortMovementItems((movements || []).slice()).slice(0, 5);
    base.cantidadMovimientos = count;
    base.recordatoriosPostCobro = reminders.todos;
    base.recordatoriosPendientes = reminders.pendientes;
    base.recordatoriosCompletos = reminders.completos;
    return base;
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

  function plannedSavingsFromCurrentState(dataOverride) {
    var data = dataOverride || window.FinanzasState.getState().data || {};
    var items = [];
    activeStateItems(data.ahorrosFuturo).forEach(function (item) {
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
    activeStateItems(data.metas).forEach(function (item) {
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
      { clave: 'fijos', nombre: 'Gastos fijos', monto: fixed, porcentaje: Math.round((fixed / total) * 10000) / 100 },
      { clave: 'ahorros', nombre: 'Ahorros', monto: savings, porcentaje: Math.round((savings / total) * 10000) / 100 },
      { clave: 'disponible', nombre: 'Disponible', monto: superfluous, porcentaje: Math.round((superfluous / total) * 10000) / 100 }
    ].filter(function (item) {
      return item.monto > 0;
    });
  }

  function postSalaryRemindersFromCurrentState(month, salaryMovement, movements, dataOverride) {
    if (!salaryMovement) {
      return { todos: [], pendientes: [], completos: true };
    }
    var data = dataOverride || window.FinanzasState.getState().data || {};
    var config = data.config || {};
    var fixed = utils.normalizeFixedExpenses(config.gastosFijos || [], config.sueldoMensual || 0).map(function (item, index) {
      return {
        id: 'fixed-' + index,
        tipo: 'fijo',
        tipoMovimiento: 'Gasto fijo',
        nombre: utils.fixedExpenseName(item) || 'Gasto fijo',
        monto: utils.fixedExpenseAmount(item),
        idRelacionado: 'fixed-' + index,
        pagado: hasFixedPayment(movements, month, item)
      };
    }).filter(function (item) {
      return item.nombre && item.monto > 0;
    });
    var savings = plannedSavingsFromCurrentState(data).map(function (item) {
      return {
        id: item.tipo + '-' + item.idRelacionado,
        tipo: item.tipo,
        tipoMovimiento: item.tipo === 'meta' ? 'Aporte a meta' : 'Aporte a ahorro',
        nombre: item.nombre,
        monto: item.monto,
        idRelacionado: item.idRelacionado,
        pagado: hasRelatedPayment(movements, month, item)
      };
    });
    var all = fixed.concat(savings);
    return {
      todos: all,
      pendientes: all.filter(function (item) { return !item.pagado; }),
      completos: all.length > 0 && all.every(function (item) { return item.pagado; })
    };
  }

  function activeStateItems(items) {
    return (items || []).filter(function (item) {
      return !item.estado || String(item.estado).toLowerCase() === 'activo';
    });
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

  function fixedExpenseTotal(items, salary) {
    return utils.normalizeFixedExpenses(items || [], salary).reduce(function (sum, item) {
      return sum + utils.fixedExpenseAmount(item);
    }, 0);
  }

  function normalizeCompareText(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function topCategoryFromTotals(categoryTotals) {
    var names = Object.keys(categoryTotals || {});
    if (!names.length) {
      return {
        categoria: '',
        monto: 0,
        mensaje: 'Todavia no registraste gastos este mes.'
      };
    }
    names.sort(function (left, right) {
      return Number(categoryTotals[right] || 0) - Number(categoryTotals[left] || 0);
    });
    return {
      categoria: names[0],
      monto: Number(categoryTotals[names[0]] || 0),
      mensaje: 'Resumen local recalculado por categoria.'
    };
  }

  function copyObject(source) {
    var result = {};
    Object.keys(source || {}).forEach(function (key) {
      result[key] = source[key];
    });
    return result;
  }

  function movementClientKey(item) {
    return [
      String((item || {}).tipo || ''),
      String((item || {}).motivo || ''),
      String((item || {}).fecha || ''),
      String((item || {}).hora || ''),
      String(utils.normalizeAmount((item || {}).monto)),
      String((item || {}).idRelacionado || '')
    ].join('|');
  }

  function rememberMovementUpsert(movement) {
    if (!movement || !movement.id || String(movement.id).indexOf('optimistic-mov-') === 0) {
      return;
    }
    movementSyncGuards[movement.id] = {
      action: 'upsert',
      movement: cloneData(movement),
      expiresAt: Date.now() + MOVEMENT_GUARD_TTL_MS
    };
    saveMovementGuards();
  }

  function rememberMovementCreate(movement) {
    if (!movement || !movement.id) {
      return;
    }
    movementSyncGuards[movement.id] = {
      action: 'create',
      key: movement.optimisticKey || movementClientKey(movement),
      movement: cloneData(movement),
      expiresAt: Date.now() + MOVEMENT_GUARD_TTL_MS
    };
    saveMovementGuards();
  }

  function rememberMovementDelete(id) {
    if (!id) {
      return;
    }
    movementSyncGuards[id] = {
      action: 'delete',
      id: id,
      movement: null,
      expiresAt: Date.now() + MOVEMENT_GUARD_TTL_MS
    };
    saveMovementGuards();
  }

  function forgetMovementGuard(id) {
    if (id && movementSyncGuards[id]) {
      delete movementSyncGuards[id];
      saveMovementGuards();
    }
  }

  function forgetMovementCreateGuard(key) {
    var changed = false;
    Object.keys(movementSyncGuards).forEach(function (id) {
      var guard = movementSyncGuards[id];
      if (guard && guard.action === 'create' && guard.key === key) {
        delete movementSyncGuards[id];
        changed = true;
      }
    });
    if (changed) {
      saveMovementGuards();
    }
  }

  function activeMovementGuards() {
    var now = Date.now();
    var changed = false;
    var guards = Object.keys(movementSyncGuards).map(function (id) {
      var guard = movementSyncGuards[id];
      if (!guard || guard.expiresAt < now) {
        delete movementSyncGuards[id];
        changed = true;
        return null;
      }
      return guard;
    }).filter(Boolean);
    if (changed) {
      saveMovementGuards();
    }
    return guards;
  }

  function movementGuardsStorageKey() {
    var apiUrl = '';
    if (window.FinanzasApi && window.FinanzasApi.getApiUrl) {
      apiUrl = window.FinanzasApi.getApiUrl();
    }
    return MOVEMENT_GUARDS_KEY_PREFIX + hashText(apiUrl || window.location.origin);
  }

  function hashText(value) {
    var text = String(value || '');
    var result = 0;
    for (var index = 0; index < text.length; index += 1) {
      result = ((result << 5) - result) + text.charCodeAt(index);
      result |= 0;
    }
    return Math.abs(result).toString(36);
  }

  function loadMovementGuards() {
    try {
      var raw = localStorage.getItem(movementGuardsStorageKey());
      movementSyncGuards = raw ? (JSON.parse(raw) || {}) : {};
    } catch (error) {
      movementSyncGuards = {};
    }
    activeMovementGuards();
  }

  function saveMovementGuards() {
    try {
      localStorage.setItem(movementGuardsStorageKey(), JSON.stringify(movementSyncGuards || {}));
    } catch (error) {
      return;
    }
  }

  function reconcileBootstrapData(data) {
    var next = data || {};
    var guards = activeMovementGuards();
    if (!guards.length) {
      return next;
    }

    var current = window.FinanzasState.getState().data || {};
    var source = next.movimientos || current.movimientos || {};
    var items = movementItemsFromData(source);
    guards.forEach(function (guard) {
      if (guard.action === 'delete') {
        items = items.filter(function (item) {
          return String(item.id) !== String(guard.id);
        });
        return;
      }
      if (guard.action === 'upsert' && guard.movement) {
        items = items.filter(function (item) {
          return String(item.id) !== String(guard.movement.id);
        });
        items.push(guard.movement);
      }
      if (guard.action === 'create' && guard.movement) {
        var exists = items.some(function (item) {
          return String(item.id) === String(guard.movement.id) || movementClientKey(item) === guard.key;
        });
        if (!exists) {
          items.push(guard.movement);
        }
      }
    });
    sortMovementItems(items);

    var config = next.config || current.config;
    return {
      config: config,
      resumen: recalculateSummary(next.resumen || current.resumen, config, items),
      movimientos: movementDataWithItems(source, items),
      ahorrosFuturo: next.ahorrosFuturo || current.ahorrosFuturo,
      metas: next.metas || current.metas,
      wishlist: next.wishlist || current.wishlist
    };
  }

  function applyMutationResult(action, data) {
    var result = data || {};
    var route = String(action || '').toLowerCase();
    if (route.indexOf('movement') !== -1 && result.movimiento) {
      applyMovementResult(route, result);
      return;
    }

    if (route === 'updateconfig' && result) {
      applyConfigResult(result);
      return;
    }

    if (route === 'startmonth' && result.resumen) {
      applyStartMonthResult(result);
      return;
    }

    if ((route === 'createfuturesaving' || route === 'updatefuturesaving') && result.id) {
      applyListItemResult('ahorrosFuturo', result, true);
      return;
    }

    if ((route === 'creategoal' || route === 'updategoal' || route === 'deletegoal') && result.id) {
      applyListItemResult('metas', result, isActiveItem(result));
      return;
    }

    if ((route === 'createwishlistitem' || route === 'updatewishlistitem') && result.id) {
      applyListItemResult('wishlist', result, isActiveItem(result));
      return;
    }

    if (route === 'convertwishlisttogoal') {
      applyConvertWishlistResult(result);
    }
  }

  function applyMovementResult(route, result) {
    var current = window.FinanzasState.getState().data;
    var activeMonth = String(
      ((result.resumen || {}).mes) ||
      ((current.config || {}).mesActual) ||
      result.movimiento.mes ||
      utils.currentMonth()
    ).slice(0, 7);
    var source = current.movimientos || {};
    var showingAllMonths = !Array.isArray(source) && (source.allMonths || source.mes === null);
    var items = movementItemsFromData(source).filter(function (item) {
      return String(item.id) !== String(result.movimiento.id);
    });
    var movementMonth = String(result.movimiento.mes || activeMonth).slice(0, 7);
    if (route === 'createmovement') {
      var resultKey = movementClientKey(result.movimiento);
      items = items.filter(function (item) {
        return !(item.optimisticAction === 'createMovement' && item.optimisticKey === resultKey);
      });
      forgetMovementCreateGuard(resultKey);
    }

    if (route !== 'deletemovement' && (showingAllMonths || movementMonth === activeMonth)) {
      items.push(result.movimiento);
    }

    sortMovementItems(items);

    var nextMovements = Array.isArray(source)
      ? items
      : Object.assign({}, source, {
        mes: showingAllMonths ? null : activeMonth,
        allMonths: showingAllMonths,
        movimientos: items
      });
    var summaryMonth = result.resumen && result.resumen.mes ? String(result.resumen.mes).slice(0, 7) : activeMonth;
    var nextSummary = summaryMonth === activeMonth ? (result.resumen || current.resumen) : current.resumen;
    var nextConfig = result.resumen && result.resumen.mes
      ? Object.assign({}, current.config, { mesActual: summaryMonth })
      : current.config;
    var nextData = {
      config: nextConfig,
      resumen: nextSummary,
      movimientos: nextMovements,
      ahorrosFuturo: (result.resumen && result.resumen.ahorrosFuturo) || current.ahorrosFuturo,
      metas: (result.resumen && result.resumen.metas) || current.metas,
      wishlist: (result.resumen && result.resumen.wishlist) || current.wishlist
    };
    nextData.resumen = recalculateSummary(nextData.resumen, nextData.config, items, nextData);

    if (route === 'deletemovement') {
      rememberMovementDelete(result.movimiento.id);
    } else {
      rememberMovementUpsert(result.movimiento);
    }

    window.FinanzasState.setData(nextData);
    saveCurrentBootstrap();
  }

  function applyConfigResult(config) {
    var current = window.FinanzasState.getState().data;
    var source = current.movimientos || {};
    var items = movementItemsFromData(source);
    window.FinanzasState.setData({
      config: config || current.config,
      resumen: recalculateSummary(current.resumen, config || current.config, items),
      movimientos: current.movimientos,
      ahorrosFuturo: current.ahorrosFuturo,
      metas: current.metas,
      wishlist: current.wishlist
    });
    saveCurrentBootstrap();
  }

  function applyStartMonthResult(result) {
    var current = window.FinanzasState.getState().data;
    var nextConfig = Object.assign({}, current.config, {
      mesActual: result.mes || (current.config || {}).mesActual
    });
    window.FinanzasState.setData({
      config: nextConfig,
      resumen: result.resumen || current.resumen,
      movimientos: {
        mes: result.mes || null,
        movimientos: result.movimientosCreados || []
      },
      ahorrosFuturo: (result.resumen && result.resumen.ahorrosFuturo) || current.ahorrosFuturo,
      metas: (result.resumen && result.resumen.metas) || current.metas,
      wishlist: (result.resumen && result.resumen.wishlist) || current.wishlist
    });
    saveCurrentBootstrap();
  }

  function applyListItemResult(listName, item, keepVisible) {
    var current = window.FinanzasState.getState().data;
    var source = Array.isArray(current[listName]) ? current[listName] : [];
    var items = source.filter(function (existing) {
      return String(existing.id) !== String(item.id);
    });
    if (keepVisible) {
      items.push(item);
    }
    var nextData = Object.assign({}, current, objectWithKey(listName, items));
    nextData.resumen = recalculateSummary(
      current.resumen,
      nextData.config,
      movementItemsFromData(nextData.movimientos || {}),
      nextData
    );
    window.FinanzasState.setData(nextData);
    saveCurrentBootstrap();
  }

  function applyConvertWishlistResult(result) {
    var current = window.FinanzasState.getState().data;
    var convertedId = result.wishlistItem && result.wishlistItem.id;
    var metas = Array.isArray(current.metas) ? current.metas.filter(function (item) {
      if (result.goal && String(item.id) === String(result.goal.id)) {
        return false;
      }
      return !(convertedId && String(item.optimisticSourceWishlistId) === String(convertedId));
    }) : [];
    if (result.goal && isActiveItem(result.goal)) {
      metas.push(result.goal);
    }

    var wishlist = Array.isArray(current.wishlist) ? current.wishlist.filter(function (item) {
      return String(item.id) !== String(convertedId);
    }) : [];
    if (result.wishlistItem && isActiveItem(result.wishlistItem)) {
      wishlist.push(result.wishlistItem);
    }

    var nextData = {
      config: current.config,
      resumen: current.resumen,
      movimientos: current.movimientos,
      ahorrosFuturo: current.ahorrosFuturo,
      metas: metas,
      wishlist: wishlist
    };
    nextData.resumen = recalculateSummary(
      current.resumen,
      nextData.config,
      movementItemsFromData(nextData.movimientos || {}),
      nextData
    );
    window.FinanzasState.setData(nextData);
    saveCurrentBootstrap();
  }

  function objectWithKey(key, value) {
    var result = {};
    result[key] = value;
    return result;
  }

  function cloneData(data) {
    return JSON.parse(JSON.stringify(data || {}));
  }

  function isActiveItem(item) {
    return !item || !item.estado || String(item.estado).toLowerCase() === 'activo';
  }

  function saveCurrentBootstrap() {
    if (window.FinanzasLocalCache) {
      window.FinanzasLocalCache.saveBootstrap(window.FinanzasState.getState().data);
    }
  }

  function movementItemsFromData(source) {
    if (Array.isArray(source)) {
      return source.slice();
    }
    if (source && Array.isArray(source.movimientos)) {
      return source.movimientos.slice();
    }
    if (source && Array.isArray(source.data)) {
      return source.data.slice();
    }
    return [];
  }

  function setStatus(status) {
    window.FinanzasState.setState({ syncStatus: status });
  }

  function toast(message) {
    var terminal = utils.qs('#status-terminal');
    var line = utils.qs('#status-terminal span');
    if (!terminal || !line) {
      return;
    }
    window.clearTimeout(toastTimer);
    line.textContent = String(message || '');
    terminal.classList.add('is-notice');
    toastTimer = window.setTimeout(function () {
      var state = window.FinanzasState.getState();
      line.textContent = state.syncStatus || 'Sin iniciar';
      terminal.classList.remove('is-notice');
    }, 2600);
  }

  function version() {
    return (window.FINANZAS_CONFIG && window.FINANZAS_CONFIG.APP_VERSION) || 'dev';
  }

  function syncVersionLabels() {
    utils.qsa('[data-app-version], #update-app-button').forEach(function (item) {
      item.textContent = version();
    });
  }

  function updateApp() {
    if (navigator.onLine === false) {
      toast('Necesitas conexion para actualizar.');
      return Promise.resolve();
    }

    setStatus('Actualizando');
    toast('Actualizando app...');

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      window.location.assign('./reset.html?from=app&appUpdate=' + Date.now());
      return Promise.resolve();
    }

    return Promise.all([
      clearAppCaches(),
      unregisterServiceWorker()
    ]).then(function () {
      rememberUpdateMoment();
      reloadWithoutCache();
    }).catch(function (error) {
      setStatus('Error');
      toast(error && error.message ? error.message : 'No se pudo actualizar la app.');
    });
  }

  function clearAppCaches() {
    if (!window.caches) {
      return Promise.resolve();
    }
    return caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key.indexOf('finanzas-lcd-') === 0;
      }).map(function (key) {
        return caches.delete(key);
      }));
    });
  }

  function unregisterServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return Promise.resolve();
    }
    if (navigator.serviceWorker.getRegistrations) {
      return navigator.serviceWorker.getRegistrations().then(function (registrations) {
        return Promise.all(registrations.map(function (registration) {
          return registration.unregister();
        }));
      });
    }
    return navigator.serviceWorker.getRegistration().then(function (registration) {
      return registration ? registration.unregister() : null;
    });
  }

  function rememberUpdateMoment() {
    try {
      localStorage.setItem('finanzasLastAppUpdate', new Date().toISOString());
    } catch (error) {
      // Local storage can be unavailable in private browsing.
    }
  }

  function reloadWithoutCache() {
    var url = new URL(window.location.href);
    url.searchParams.set('appUpdate', String(Date.now()));
    window.location.replace(url.toString());
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return;
    }
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./service-worker.js').catch(function () {
        setStatus('PWA sin SW');
      });
    });
  }

  window.FinanzasApp = {
    init: init,
    refresh: refresh,
    mutate: mutate,
    convertWishlistInstant: convertWishlistInstant,
    toast: toast,
    updateApp: updateApp,
    version: version,
    syncVersionLabels: syncVersionLabels
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
