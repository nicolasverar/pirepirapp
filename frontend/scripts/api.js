(function () {
  'use strict';

  var API_URL_KEY = 'finanzasApiUrl';
  var TOKEN_SESSION_KEY = 'finanzasApiToken';
  var TOKEN_LOCAL_KEY = 'finanzasApiTokenRemembered';
  var MODE_KEY = 'finanzasDataMode';

  function getStoredValue(storage, key) {
    try {
      return storage.getItem(key) || '';
    } catch (error) {
      return '';
    }
  }

  function setStoredValue(storage, key, value) {
    try {
      if (value) {
        storage.setItem(key, value);
      } else {
        storage.removeItem(key);
      }
    } catch (error) {
      return;
    }
  }

  function getApiUrl() {
    return String(
      getStoredValue(localStorage, API_URL_KEY) ||
      (window.FINANZAS_CONFIG && window.FINANZAS_CONFIG.API_URL) ||
      ''
    ).trim();
  }

  function setApiUrl(url) {
    setStoredValue(localStorage, API_URL_KEY, String(url || '').trim());
  }

  function hasBackend() {
    if (isLocalMode()) {
      return Boolean(window.FinanzasLocalStore);
    }
    var url = getApiUrl();
    return Boolean(url && url.indexOf('PEGAR_URL') === -1);
  }

  function getAuthToken() {
    if (isLocalMode()) {
      return 'local-device';
    }
    return getStoredValue(localStorage, TOKEN_LOCAL_KEY) || getStoredValue(sessionStorage, TOKEN_SESSION_KEY);
  }

  function setAuthToken(token, remember) {
    var value = String(token || '').trim();
    if (remember) {
      setStoredValue(localStorage, TOKEN_LOCAL_KEY, value);
      setStoredValue(sessionStorage, TOKEN_SESSION_KEY, '');
    } else {
      setStoredValue(sessionStorage, TOKEN_SESSION_KEY, value);
      setStoredValue(localStorage, TOKEN_LOCAL_KEY, '');
    }
  }

  function clearAuthToken() {
    setStoredValue(sessionStorage, TOKEN_SESSION_KEY, '');
    setStoredValue(localStorage, TOKEN_LOCAL_KEY, '');
  }

  function configureConnection(apiUrl, token, remember) {
    setApiUrl(apiUrl);
    setAuthToken(token, remember);
    setStoredValue(localStorage, MODE_KEY, String(apiUrl || '').trim() ? 'remote' : 'local');
  }

  function clearConnection() {
    clearAuthToken();
    setApiUrl('');
    setStoredValue(localStorage, MODE_KEY, 'local');
  }

  function isLocalMode() {
    var mode = getStoredValue(localStorage, MODE_KEY);
    return mode !== 'remote';
  }

  function useLocalMode() {
    clearAuthToken();
    setApiUrl('');
    setStoredValue(localStorage, MODE_KEY, 'local');
  }

  function request(action, payload) {
    if (isLocalMode()) {
      if (!window.FinanzasLocalStore) {
        return Promise.reject(new Error('El almacenamiento local no esta disponible.'));
      }
      return window.FinanzasLocalStore.request(action, payload || {});
    }

    if (!hasBackend()) {
      return Promise.reject(new Error('Conecta la URL de Apps Script para sincronizar.'));
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
    }, 60000);

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
    setApiUrl: setApiUrl,
    getAuthToken: getAuthToken,
    setAuthToken: setAuthToken,
    clearAuthToken: clearAuthToken,
    configureConnection: configureConnection,
    isLocalMode: isLocalMode,
    useLocalMode: useLocalMode,
    clearConnection: clearConnection
  };
}());
