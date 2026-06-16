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
    window.FinanzasState.setState({
      loading: !hasData,
      syncStatus: hasData || settings.background ? 'Actualizando' : 'Cargando',
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
          syncStatus: hasLocalData ? 'Local' : 'Error',
          error: error.message
        });
        if (/clave|token|conecta|url|FINANZAS_API_TOKEN/i.test(error.message)) {
          window.FinanzasApi.clearAuthToken();
          window.FinanzasForms.openAccessForm();
          toast(error.message);
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
    return window.FinanzasApi.request(action, payload || {})
      .then(function (data) {
        applyMutationResult(action, data);
        toast('Guardado');
        refresh({ background: true });
        return data;
      })
      .catch(function (error) {
        window.FinanzasState.setState({ syncStatus: 'Error', error: error.message });
        if (/clave|token|conecta|url|FINANZAS_API_TOKEN/i.test(error.message)) {
          window.FinanzasApi.clearAuthToken();
          window.FinanzasForms.openAccessForm();
        }
        toast(error.message);
        throw error;
      });
  }

  function applyMutationResult(action, data) {
    var result = data || {};
    var route = String(action || '').toLowerCase();
    if (route.indexOf('movement') === -1 || !result.movimiento) {
      return;
    }

    var current = window.FinanzasState.getState().data;
    var activeMonth = String(
      ((current.config || {}).mesActual) ||
      ((result.resumen || {}).mes) ||
      result.movimiento.mes ||
      utils.currentMonth()
    ).slice(0, 7);
    var source = current.movimientos || {};
    var items = movementItemsFromData(source).filter(function (item) {
      return String(item.id) !== String(result.movimiento.id);
    });

    if (route !== 'deletemovement' && String(result.movimiento.mes || activeMonth).slice(0, 7) === activeMonth) {
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
        mes: activeMonth,
        movimientos: items
      });

    window.FinanzasState.setData({
      config: current.config,
      resumen: result.resumen || current.resumen,
      movimientos: nextMovements,
      ahorrosFuturo: (result.resumen && result.resumen.ahorrosFuturo) || current.ahorrosFuturo,
      metas: (result.resumen && result.resumen.metas) || current.metas,
      wishlist: (result.resumen && result.resumen.wishlist) || current.wishlist
    });
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
