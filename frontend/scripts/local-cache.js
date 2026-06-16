(function () {
  'use strict';

  var DATA_CACHE_PREFIX = 'finanzasBootstrapCache:';
  var PHOTO_CACHE_NAME = 'finanzas-user-photos-v1';

  function namespace() {
    var apiUrl = '';
    if (window.FinanzasApi && window.FinanzasApi.getApiUrl) {
      apiUrl = window.FinanzasApi.getApiUrl();
    }
    return hash(apiUrl || window.location.origin);
  }

  function hash(value) {
    var text = String(value || '');
    var result = 0;
    for (var index = 0; index < text.length; index += 1) {
      result = ((result << 5) - result) + text.charCodeAt(index);
      result |= 0;
    }
    return Math.abs(result).toString(36);
  }

  function dataKey() {
    return DATA_CACHE_PREFIX + namespace();
  }

  function loadBootstrap() {
    try {
      var raw = localStorage.getItem(dataKey());
      if (!raw) {
        return null;
      }
      var cache = JSON.parse(raw);
      if (!cache || !cache.data) {
        return null;
      }
      return cache;
    } catch (error) {
      return null;
    }
  }

  function saveBootstrap(data) {
    try {
      localStorage.setItem(dataKey(), JSON.stringify({
        savedAt: new Date().toISOString(),
        appVersion: (window.FINANZAS_CONFIG || {}).APP_VERSION || '',
        data: data
      }));
    } catch (error) {
      return;
    }
  }

  function clearBootstrap() {
    try {
      localStorage.removeItem(dataKey());
    } catch (error) {
      return;
    }
  }

  function photoRequest(fileId) {
    var url = new URL('./__photo-cache__/' + encodeURIComponent(namespace()) + '/' + encodeURIComponent(fileId), window.location.href);
    return new Request(url.toString(), { method: 'GET' });
  }

  function loadPhoto(fileId) {
    if (!window.caches || !fileId) {
      return Promise.resolve('');
    }
    return caches.open(PHOTO_CACHE_NAME)
      .then(function (cache) {
        return cache.match(photoRequest(fileId));
      })
      .then(function (response) {
        return response ? response.text() : '';
      })
      .catch(function () {
        return '';
      });
  }

  function savePhoto(fileId, dataUrl) {
    if (!window.caches || !fileId || !dataUrl) {
      return Promise.resolve();
    }
    return caches.open(PHOTO_CACHE_NAME)
      .then(function (cache) {
        return cache.put(photoRequest(fileId), new Response(dataUrl, {
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          }
        }));
      })
      .catch(function () {
        return null;
      });
  }

  window.FinanzasLocalCache = {
    loadBootstrap: loadBootstrap,
    saveBootstrap: saveBootstrap,
    clearBootstrap: clearBootstrap,
    loadPhoto: loadPhoto,
    savePhoto: savePhoto
  };
}());
