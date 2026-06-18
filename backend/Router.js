function routeRequest_(method, event) {
  try {
    var request = parseRequest_(method, event || {});
    if (normalizeText_(request.action).toLowerCase() === 'ping') {
      return jsonResponse_(dispatchAction_(request.action, request.payload, { requireAuth: false }));
    }

    var data = dispatchAction_(request.action, request.payload, {
      requireAuth: true,
      clientIp: request.clientIp
    });
    return jsonResponse_({
      success: true,
      data: data,
      message: 'OK',
      timestamp: timestampString_(),
      timezone: appTimezone_()
    });
  } catch (error) {
    return jsonResponse_({
      success: false,
      data: null,
      message: error.message || 'Error inesperado.',
      error: {
        name: error.name || 'Error'
      },
      timestamp: timestampString_(),
      timezone: appTimezone_()
    });
  }
}

function parseRequest_(method, event) {
  var parameters = event.parameter || {};
  var headers = normalizeRequestHeaders_(event.headers || {});
  var body = {};

  if (method === 'POST' && event.postData && event.postData.contents) {
    body = parseRequestBody_(event.postData.contents);
  }

  var action = normalizeText_(body.action || parameters.action || parameters.route || 'ping');
  var payload = body.payload !== undefined ? body.payload : {};
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    payload = { value: payload };
  }

  Object.keys(parameters).forEach(function (key) {
    if (key !== 'action' && key !== 'route') {
      payload[key] = parameters[key];
    }
  });

  Object.keys(body).forEach(function (key) {
    if (key !== 'action' && key !== 'payload') {
      payload[key] = body[key];
    }
  });

  return {
    method: method,
    action: action,
    payload: payload,
    clientIp: requestClientIp_(parameters, headers, body)
  };
}

function normalizeRequestHeaders_(headers) {
  var normalized = {};
  Object.keys(headers || {}).forEach(function (key) {
    normalized[String(key).toLowerCase()] = headers[key];
  });
  return normalized;
}

function requestClientIp_(parameters, headers, body) {
  var candidates = [
    headers['x-forwarded-for'],
    headers['x-real-ip'],
    headers['cf-connecting-ip'],
    parameters.ip,
    parameters.clientIp,
    parameters.client_ip,
    parameters.xForwardedFor,
    body.ip,
    body.clientIp,
    body.client_ip
  ];

  for (var index = 0; index < candidates.length; index += 1) {
    var value = normalizeText_(candidates[index]);
    if (value) {
      return value.split(',')[0].trim();
    }
  }
  return 'unknown';
}

function parseRequestBody_(contents) {
  var text = normalizeText_(contents);
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    validationError_('El cuerpo de la solicitud debe ser JSON valido.');
  }
  return {};
}

function dispatchAction_(action, payload, options) {
  var route = normalizeText_(action).toLowerCase();
  var settings = options || {};
  if (settings.requireAuth !== false && route !== 'ping') {
    assertAuthorizedRequest_(payload, settings.clientIp);
  }
  if (route !== 'ping' && route !== 'setup') {
    ensureDatabase_();
    ensureCurrentCalendarPeriod_();
  }

  var routes = {
    ping: function () {
      return {
        ok: true
      };
    },
    setup: function () {
      return initializeProject_();
    },
    bootstrap: function () {
      return getBootstrapData_();
    },
    getconfig: function () {
      return getConfig_();
    },
    updateconfig: function () {
      return updateConfig_(payload);
    },
    startmonth: function () {
      return startMonth_(payload);
    },
    getsummary: function () {
      return getMonthlySummary_(payload);
    },
    getmovements: function () {
      return listMovements_(payload);
    },
    createmovement: function () {
      return createMovement_(payload);
    },
    updatemovement: function () {
      return updateMovement_(payload);
    },
    deletemovement: function () {
      return deleteMovement_(payload);
    },
    getfuturesavings: function () {
      return listFutureSavings_(payload);
    },
    createfuturesaving: function () {
      return createFutureSaving_(payload);
    },
    updatefuturesaving: function () {
      return updateFutureSaving_(payload);
    },
    getgoals: function () {
      return listGoals_(payload);
    },
    creategoal: function () {
      return createGoal_(payload);
    },
    updategoal: function () {
      return updateGoal_(payload);
    },
    deletegoal: function () {
      return deleteGoal_(payload);
    },
    convertwishlisttogoal: function () {
      return convertWishlistToGoal_(payload);
    },
    getwishlist: function () {
      return listWishlist_(payload);
    },
    createwishlistitem: function () {
      return createWishlistItem_(payload);
    },
    updatewishlistitem: function () {
      return updateWishlistItem_(payload);
    },
    uploadphoto: function () {
      return uploadPhoto_(payload);
    },
    getphoto: function () {
      return getPhoto_(payload);
    }
  };

  if (!routes[route]) {
    validationError_('Accion no reconocida: ' + action);
  }
  return routes[route]();
}

function assertAuthorizedRequest_(payload, clientIp) {
  var ip = normalizeText_(clientIp) || 'unknown';
  if (isAuthRateLimited_(ip)) {
    validationError_(genericAuthErrorMessage_());
  }

  var configuredToken = normalizeText_(getScriptProperties_().getProperty(appPropertyKeys_().apiToken));
  if (!configuredToken) {
    registerFailedAuthAttempt_(ip);
    validationError_(genericAuthErrorMessage_());
  }

  var providedToken = normalizeText_((payload || {}).authToken || (payload || {}).apiToken || (payload || {}).token);
  if (!providedToken || !timingSafeTokenEquals_(providedToken, configuredToken)) {
    registerFailedAuthAttempt_(ip);
    validationError_(genericAuthErrorMessage_());
  }

  clearFailedAuthAttempts_(ip);
  delete payload.authToken;
  delete payload.apiToken;
  delete payload.token;
}

function genericAuthErrorMessage_() {
  return 'No se pudo autorizar la solicitud.';
}

function authRateLimitKey_(clientIp) {
  var safeIp = normalizeText_(clientIp || 'unknown').replace(/[^A-Za-z0-9_.:-]/g, '_').slice(0, 80);
  return 'auth_fail_' + safeIp;
}

function failedAuthAttempts_(clientIp) {
  var value = CacheService.getScriptCache().get(authRateLimitKey_(clientIp));
  return Math.max(0, Number(value || 0));
}

function isAuthRateLimited_(clientIp) {
  return failedAuthAttempts_(clientIp) >= 10;
}

function registerFailedAuthAttempt_(clientIp) {
  var cache = CacheService.getScriptCache();
  var key = authRateLimitKey_(clientIp);
  var attempts = Math.min(999, Math.max(0, Number(cache.get(key) || 0)) + 1);
  cache.put(key, String(attempts), 60);
  return attempts;
}

function clearFailedAuthAttempts_(clientIp) {
  CacheService.getScriptCache().remove(authRateLimitKey_(clientIp));
}

function timingSafeTokenEquals_(providedToken, configuredToken) {
  var left = normalizeText_(providedToken);
  var right = normalizeText_(configuredToken);
  var compareLength = 512;
  var diff = left.length === right.length ? 0 : 1;
  if (left.length > compareLength || right.length > compareLength) {
    diff = 1;
  }

  for (var index = 0; index < compareLength; index += 1) {
    var leftCode = index < left.length ? left.charCodeAt(index) : 0;
    var rightCode = index < right.length ? right.charCodeAt(index) : 0;
    diff |= leftCode ^ rightCode;
  }
  return diff === 0;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
