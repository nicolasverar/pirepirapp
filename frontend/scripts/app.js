(function () {
  'use strict';

  var utils = window.FinanzasUtils;

  function init() {
    window.FinanzasRouter.bind();
    window.FinanzasState.subscribe(window.FinanzasRender.render);
    syncVersionLabels();
    bindGlobalActions();
    registerServiceWorker();
    if (!window.FinanzasApi.hasBackend() || !window.FinanzasApi.getAuthToken()) {
      window.FinanzasRender.render();
      setStatus('Conectar');
      window.FinanzasForms.openAccessForm();
      return;
    }
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
        window.FinanzasState.setData(data);
        if (window.FinanzasLocalCache) {
          window.FinanzasLocalCache.saveBootstrap(data);
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
      var error = new Error('Primero configura la URL de Apps Script.');
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
        refresh({ background: true, silent: true });
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

  function applyOptimisticMutation(action, payload) {
    var route = String(action || '').toLowerCase();
    if (route === 'deletemovement' && payload && payload.id) {
      return applyOptimisticMovementDelete(payload.id);
    }
    return null;
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
      resumen: optimisticSummaryAfterDelete(current.resumen, current.config, item),
      movimientos: nextMovements,
      ahorrosFuturo: current.ahorrosFuturo,
      metas: current.metas,
      wishlist: current.wishlist
    });
    saveCurrentBootstrap();

    return function () {
      window.FinanzasState.setData(snapshot);
      saveCurrentBootstrap();
    };
  }

  function optimisticSummaryAfterDelete(summary, config, item) {
    if (!summary) {
      return summary;
    }
    var summaryMonth = String(summary.mes || (config || {}).mesActual || utils.currentMonth()).slice(0, 7);
    var itemMonth = movementMonth(item);
    var next = Object.assign({}, summary, {
      actividadReciente: (summary.actividadReciente || []).filter(function (recent) {
        return String(recent.id) !== String(item.id);
      })
    });
    if (itemMonth !== summaryMonth) {
      return next;
    }

    var amount = Number(item.monto || 0);
    var type = String(item.tipo || '');
    next.cantidadMovimientos = Math.max(0, Number(summary.cantidadMovimientos || 0) - 1);

    if (type === 'Gasto' || type === 'Compra de wishlist') {
      next.totalGastado = Math.max(0, Number(summary.totalGastado || 0) - amount);
      if (type === 'Compra de wishlist') {
        next.comprasWishlist = Math.max(0, Number(summary.comprasWishlist || 0) - amount);
      } else {
        next.gastosNormales = Math.max(0, Number(summary.gastosNormales || 0) - amount);
      }
      next.disponible = Number(summary.disponible || 0) + amount;
    } else if (type === 'Ingreso') {
      next.ingresosExtra = Math.max(0, Number(summary.ingresosExtra || 0) - amount);
      next.totalIngresos = Math.max(0, Number(summary.totalIngresos || 0) - amount);
      next.disponible = Number(summary.disponible || 0) - amount;
    } else if (type === 'Aporte a ahorro' || type === 'Aporte a meta') {
      next.totalApartado = Math.max(0, Number(summary.totalApartado || 0) - amount);
      if (type === 'Aporte a ahorro') {
        next.aportesAhorro = Math.max(0, Number(summary.aportesAhorro || 0) - amount);
      } else {
        next.aportesMeta = Math.max(0, Number(summary.aportesMeta || 0) - amount);
      }
      next.disponible = Number(summary.disponible || 0) + amount;
    }
    next.porcentajeDisponible = Number(next.totalIngresos || 0) > 0
      ? Math.max(0, Math.min(100, Math.round((Number(next.disponible || 0) / Number(next.totalIngresos || 0)) * 10000) / 100))
      : 0;
    return next;
  }

  function movementMonth(item) {
    var date = String((item || {}).fecha || '');
    if (/^\d{4}-\d{2}/.test(date)) {
      return date.slice(0, 7);
    }
    return String((item || {}).mes || '').slice(0, 7);
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

    if (route !== 'deletemovement' && (showingAllMonths || movementMonth === activeMonth)) {
      items.push(result.movimiento);
    }

    items.sort(function (left, right) {
      var leftKey = String(left.fecha || '') + ' ' + String(left.hora || '');
      var rightKey = String(right.fecha || '') + ' ' + String(right.hora || '');
      if (leftKey === rightKey) {
        return 0;
      }
      return leftKey < rightKey ? 1 : -1;
    });

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

    window.FinanzasState.setData({
      config: nextConfig,
      resumen: nextSummary,
      movimientos: nextMovements,
      ahorrosFuturo: (result.resumen && result.resumen.ahorrosFuturo) || current.ahorrosFuturo,
      metas: (result.resumen && result.resumen.metas) || current.metas,
      wishlist: (result.resumen && result.resumen.wishlist) || current.wishlist
    });
    saveCurrentBootstrap();
  }

  function applyConfigResult(config) {
    var current = window.FinanzasState.getState().data;
    window.FinanzasState.setData({
      config: config || current.config,
      resumen: current.resumen,
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
    window.FinanzasState.setData(Object.assign({}, current, objectWithKey(listName, items)));
    saveCurrentBootstrap();
  }

  function applyConvertWishlistResult(result) {
    var current = window.FinanzasState.getState().data;
    var metas = Array.isArray(current.metas) ? current.metas.filter(function (item) {
      return !result.goal || String(item.id) !== String(result.goal.id);
    }) : [];
    if (result.goal && isActiveItem(result.goal)) {
      metas.push(result.goal);
    }

    var convertedId = result.wishlistItem && result.wishlistItem.id;
    var wishlist = Array.isArray(current.wishlist) ? current.wishlist.filter(function (item) {
      return String(item.id) !== String(convertedId);
    }) : [];
    if (result.wishlistItem && isActiveItem(result.wishlistItem)) {
      wishlist.push(result.wishlistItem);
    }

    window.FinanzasState.setData({
      config: current.config,
      resumen: current.resumen,
      movimientos: current.movimientos,
      ahorrosFuturo: current.ahorrosFuturo,
      metas: metas,
      wishlist: wishlist
    });
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
    var root = utils.qs('#toast-root');
    var item = document.createElement('div');
    item.className = 'toast';
    item.textContent = message;
    root.appendChild(item);
    setTimeout(function () {
      item.classList.add('is-leaving');
      setTimeout(function () {
        item.remove();
      }, 240);
    }, 2200);
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
