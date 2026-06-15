function runSetup() {
  return setupBackend();
}

function setupBackend() {
  return initializeProject_();
}

function initializeProject_() {
  return withScriptLock_(function () {
    var database = ensureDatabase_();
    var config = getConfig_();
    return {
      database: database,
      config: config
    };
  });
}
