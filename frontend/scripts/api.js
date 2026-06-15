(function () {
  'use strict';

  function getApiUrl() {
    return String((window.FINANZAS_CONFIG && window.FINANZAS_CONFIG.API_URL) || '').trim();
  }

  function hasBackend() {
    var url = getApiUrl();
    return Boolean(url && url.indexOf('PEGAR_URL') === -1);
  }

  function request(action, payload) {
    if (!hasBackend()) {
      return Promise.reject(new Error('Falta configurar la URL de la Web App de Apps Script en frontend/scripts/config.js.'));
    }

    return fetch(getApiUrl(), {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: action,
        payload: payload || {}
      })
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status + ' al conectar con Apps Script.');
        }
        return response.text();
      })
      .then(function (text) {
        var result;
        try {
          result = JSON.parse(text);
        } catch (error) {
          throw new Error('La respuesta del backend no es JSON valido.');
        }
        if (!result.success) {
          throw new Error(result.message || 'El backend devolvio un error.');
        }
        return result.data;
      });
  }

  window.FinanzasApi = {
    request: request,
    hasBackend: hasBackend,
    getApiUrl: getApiUrl
  };
}());
