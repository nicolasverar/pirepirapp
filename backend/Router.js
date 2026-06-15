function routeRequest_(method, event) {
  try {
    var request = parseRequest_(method, event || {});
    var data = dispatchAction_(request.action, request.payload, request);
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
    payload: payload
  };
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

function dispatchAction_(action, payload) {
  var route = normalizeText_(action).toLowerCase();
  if (route !== 'ping') {
    assertAuthorizedRequest_(payload);
  }

  var routes = {
    ping: function () {
      return {
        ok: true,
        app: 'FinanzasPersonales',
        timezone: appTimezone_()
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

function assertAuthorizedRequest_(payload) {
  var configuredToken = normalizeText_(getScriptProperties_().getProperty(appPropertyKeys_().apiToken));
  if (!configuredToken) {
    validationError_('Falta configurar FINANZAS_API_TOKEN en Apps Script.');
  }

  var providedToken = normalizeText_((payload || {}).authToken || (payload || {}).apiToken || (payload || {}).token);
  if (!providedToken || providedToken !== configuredToken) {
    validationError_('Clave de acceso invalida.');
  }

  delete payload.authToken;
  delete payload.apiToken;
  delete payload.token;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
