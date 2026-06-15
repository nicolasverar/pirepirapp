function doGet(event) {
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
