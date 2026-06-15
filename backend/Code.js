function doGet(event) {
  if (event && event.parameter && (event.parameter.action || event.parameter.route)) {
    return routeRequest_('GET', event);
  }
  return serveApp_();
}

function serveApp_() {
  return HtmlService
    .createTemplateFromFile('App')
    .evaluate()
    .setTitle('Pirepirapp')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function includeHtml(filename) {
  return HtmlService.createTemplateFromFile(filename).getRawContent();
}

function serverAction(action, payload) {
  try {
    var data = dispatchAction_(action, payload || {}, { requireAuth: false });
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
