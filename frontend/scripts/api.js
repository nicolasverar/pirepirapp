(function () {
  'use strict';

  function getApiUrl() {
    return String((window.FINANZAS_CONFIG && window.FINANZAS_CONFIG.API_URL) || '').trim();
  }

  function hasBackend() {
    var url = getApiUrl();
    return Boolean(url && url.indexOf('PEGAR_URL') === -1);
  }

  function getAuthToken() {
    try {
      return sessionStorage.getItem('finanzasApiToken') || '';
    } catch (error) {
      return '';
    }
  }

  function setAuthToken(token) {
    try {
      sessionStorage.setItem('finanzasApiToken', token || '');
    } catch (error) {
      return;
    }
  }

  function clearAuthToken() {
    try {
      sessionStorage.removeItem('finanzasApiToken');
    } catch (error) {
      return;
    }
  }

  function request(action, payload) {
    if (!hasBackend()) {
      return Promise.reject(new Error('Falta configurar la URL de la Web App de Apps Script en frontend/scripts/config.js.'));
    }

    var requestPayload = {};
    Object.keys(payload || {}).forEach(function (key) {
      requestPayload[key] = payload[key];
    });

    if (String(action).toLowerCase() !== 'ping') {
      var token = getAuthToken();
      if (!token) {
        return Promise.reject(new Error('Ingresa tu clave de acceso para sincronizar.'));
      }
      requestPayload.authToken = token;
    }

    var controller = new AbortController();
    var timeout = setTimeout(function () {
      controller.abort();
    }, 35000);

    return fetch(getApiUrl(), {
      method: 'POST',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: action,
        payload: requestPayload
      })
    })
      .then(function (response) {
        clearTimeout(timeout);
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
      })
      .catch(function (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
          throw new Error('Google Sheets esta tardando demasiado. Proba de nuevo en unos segundos.');
        }
        throw error;
      });
  }

  window.FinanzasApi = {
    request: request,
    hasBackend: hasBackend,
    getApiUrl: getApiUrl,
    getAuthToken: getAuthToken,
    setAuthToken: setAuthToken,
    clearAuthToken: clearAuthToken
  };
}());
