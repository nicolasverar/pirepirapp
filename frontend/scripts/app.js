(function () {
  'use strict';

  var utils = window.FinanzasUtils;

  function init() {
    window.FinanzasRouter.bind();
    window.FinanzasState.subscribe(window.FinanzasRender.render);
    bindGlobalActions();
    registerServiceWorker();
    window.FinanzasRender.render();
    if (window.FinanzasApi.hasBackend() && !window.FinanzasApi.getAuthToken()) {
      setStatus('Clave requerida');
      window.FinanzasForms.openAccessForm();
      return;
    }
    refresh();
  }

  function bindGlobalActions() {
    var actionKey = utils.qs('#action-key');
    actionKey.addEventListener('click', function () {
      window.FinanzasForms.actionMenu();
    });

    window.addEventListener('online', function () {
      setStatus('Sincronizado');
      refresh();
    });

    window.addEventListener('offline', function () {
      setStatus('Sin conexion');
    });
  }

  function refresh() {
    if (!window.FinanzasApi.hasBackend()) {
      setStatus('Falta URL');
      window.FinanzasRender.render();
      return Promise.resolve();
    }

    window.FinanzasState.setState({ loading: true, syncStatus: 'Cargando', error: '' });
    return window.FinanzasApi.request('bootstrap', {})
      .then(function (data) {
        window.FinanzasState.setData(data);
        window.FinanzasState.setState({ loading: false, syncStatus: 'Sincronizado', error: '' });
      })
      .catch(function (error) {
        window.FinanzasState.setState({ loading: false, syncStatus: 'Error', error: error.message });
        if (/clave|token|FINANZAS_API_TOKEN/i.test(error.message)) {
          window.FinanzasApi.clearAuthToken();
          window.FinanzasForms.openAccessForm();
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
      .then(function () {
        toast('Guardado');
        return refresh();
      })
      .catch(function (error) {
        window.FinanzasState.setState({ syncStatus: 'Error', error: error.message });
        if (/clave|token|FINANZAS_API_TOKEN/i.test(error.message)) {
          window.FinanzasApi.clearAuthToken();
          window.FinanzasForms.openAccessForm();
        }
        toast(error.message);
        throw error;
      });
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
    toast: toast
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
