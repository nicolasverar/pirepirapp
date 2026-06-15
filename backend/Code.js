function doGet(event) {
  if (event && event.parameter && (event.parameter.action || event.parameter.route)) {
    return routeRequest_('GET', event);
  }
  return serveApiLanding_();
}

function serveApp_() {
  return HtmlService
    .createTemplateFromFile('App')
    .evaluate()
    .setTitle('Pirepirapp')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function serveApiLanding_() {
  return HtmlService
    .createHtmlOutput([
      '<!doctype html>',
      '<html lang="es">',
      '<head><base target="_top"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
      '<title>Pirepirapp API</title></head>',
      '<body style="font-family:Arial,sans-serif;background:#101510;color:#e8f0d6;display:grid;min-height:100vh;place-items:center;margin:0;">',
      '<main style="max-width:560px;padding:28px;border:1px solid #6f8451;background:#182118;">',
      '<h1>Pirepirapp API</h1>',
      '<p>Este endpoint es para la PWA instalable.</p>',
      '<p>Las acciones de datos requieren la clave privada configurada en Apps Script.</p>',
      '</main>',
      '</body>',
      '</html>'
    ].join(''))
    .setTitle('Pirepirapp API')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function includeHtml(filename) {
  return HtmlService.createTemplateFromFile(filename).getRawContent();
}

function serverAction(action, payload) {
  try {
    var data = dispatchAction_(action, payload || {}, { requireAuth: true });
    return {
      success: true,
      data: data,
      message: 'OK',
      timestamp: timestampString_(),
      timezone: appTimezone_()
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.message || 'Error inesperado.',
      error: {
        name: error.name || 'Error'
      },
      timestamp: timestampString_(),
      timezone: appTimezone_()
    };
  }
}

function apiGet(event) {
  return routeRequest_('GET', event);
}

function doPost(event) {
  return routeRequest_('POST', event);
}

function ping() {
  return {
    ok: true,
    app: 'FinanzasPersonales',
    timezone: appTimezone_(),
    timestamp: timestampString_()
  };
}
