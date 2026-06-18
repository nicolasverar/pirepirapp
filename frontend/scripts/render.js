(function () {
  'use strict';

  var utils = window.FinanzasUtils;
  var FUTURE_PREFS_KEY = 'finanzasFutureSavingsPrefs';
  var MOTIVE_SIMILARITY_THRESHOLD = 0.8;

  function render() {
    var state = window.FinanzasState.getState();
    updateChrome(state);
    var screen = utils.qs('#app-screen');
    if (!screen) {
      return;
    }

    if (!window.FinanzasApi.hasBackend()) {
      screen.innerHTML = renderMissingConfig();
      bindRenderedActions(screen);
      return;
    }

    if (state.loading && !state.data.resumen) {
      screen.innerHTML = '<section class="system-window"><div class="window-title">CARGANDO</div><p class="lcd-muted">Leyendo Google Sheets...</p></section>';
      return;
    }

    if (state.currentView === 'gastos') {
      screen.innerHTML = renderMovements(state);
    } else if (state.currentView === 'metas') {
      screen.innerHTML = renderGoals(state);
    } else if (state.currentView === 'configuracion') {
      screen.innerHTML = renderSettings(state);
    } else {
      screen.innerHTML = renderSummary(state);
    }

    bindRenderedActions(screen);
    window.FinanzasImages.hydrate(screen);
  }

  function updateChrome(state) {
    var sectionTitle = utils.qs('#section-title');
    var statusDate = utils.qs('#status-date');
    var syncLabel = utils.qs('#sync-status span:last-child');
    var syncBox = utils.qs('#sync-status');
    if (sectionTitle) {
      sectionTitle.textContent = window.FinanzasRouter.currentLabel();
    }
    if (statusDate) {
      statusDate.textContent = utils.compactDate();
    }
    if (syncLabel) {
      syncLabel.textContent = state.syncStatus;
    }
    if (syncBox) {
      syncBox.className = 'sync-indicator sync-' + syncClass(state.syncStatus);
    }
    window.FinanzasRouter.syncNav();
  }

  function syncClass(status) {
    var text = String(status || '').toLowerCase();
    if (text.indexOf('error') !== -1) {
      return 'error';
    }
    if (text.indexOf('guard') !== -1 || text.indexOf('carg') !== -1) {
      return 'saving';
    }
    if (text.indexOf('sin conexion') !== -1 || text.indexOf('falta') !== -1) {
      return 'offline';
    }
    return 'ok';
  }

  function renderMissingConfig() {
    return [
      '<section class="system-window">',
      '<div class="window-title">CONFIGURACION</div>',
      '<p class="lcd-strong">Falta conectar Apps Script.</p>',
      '<p>Ingresa la URL del Web App y tu clave privada para sincronizar este dispositivo.</p>',
      '<button class="lcd-button primary js-connect-backend" type="button">Conectar</button>',
      renderAppVersionPanel(),
      '</section>'
    ].join('');
  }

  function renderSummary(state) {
    var summary = state.data.resumen || {};
    var config = state.data.config || {};
    var movements = movementItemsFromState_(state);
    var top = topSpendingMotive(movements, config, summary);
    var recent = (summary.actividadReciente || []).length
      ? summary.actividadReciente
      : movements.slice(0, 5);
    return [
      '<section class="summary-stack">',
      '<article class="system-window total-window summary-primary">',
      '<p class="summary-date-line"><strong>Estamos el ' + utils.escapeHtml(utils.friendlyDate()) + '</strong></p>',
      '<p class="summary-subline">este mes gastaste:</p>',
      '<strong class="big-money">' + utils.escapeHtml(utils.formatMoney(summary.totalGastado || 0)) + '</strong>',
      '</article>',
      '<article class="system-window summary-metrics-card">',
      '<p class="top-spend-line">Gastaste mas en: <strong>' + utils.escapeHtml(top.motivo || 'Sin gastos') + '</strong></p>',
      top.mensaje ? '<p class="lcd-muted top-spend-detail">' + utils.escapeHtml(top.mensaje) + '</p>' : '',
      renderRecent(recent),
      '<button class="text-key js-view-full" type="button">Ver completo</button>',
      '</article>',
      '<article class="system-window availability-card">',
      '<div class="window-title">DISPONIBLE</div>',
      '<div class="available-line"><span>Te queda</span><strong>' + utils.escapeHtml(utils.formatMoney(summary.disponible || 0)) + '</strong></div>',
      renderProgressMeter(summary.porcentajeDisponible || 0, 'progress-large'),
      '</article>',
      renderSalaryPartition(config),
      '</section>'
    ].join('');
  }

  function ledgerLine(label, value) {
    return '<div class="ledger-line"><span>' + utils.escapeHtml(label) + '</span><strong>' + utils.escapeHtml(utils.formatMoney(value)) + '</strong></div>';
  }

  function renderRecent(items) {
    if (!items.length) {
      return '<p class="empty-state">Sin movimientos cargados.</p>';
    }
    return '<ol class="recent-list dataframe-list">' + items.map(function (item, index) {
      var details = [item.tipo, utils.formatMovementDateTime(item.fecha, item.hora)].filter(Boolean).join(' · ');
      return [
        '<li class="recent-row dataframe-row ' + recentDitherClass(index) + '">',
        '<span class="df-index">' + utils.escapeHtml(String(index + 1).padStart(2, '0')) + '</span>',
        '<span class="row-title"><strong>' + utils.escapeHtml(item.motivo) + '</strong><small>' + utils.escapeHtml(details) + '</small></span>',
        '<b class="df-amount">' + utils.escapeHtml(utils.formatMoney(item.monto)) + '</b>',
        '</li>'
      ].join('');
    }).join('') + '</ol>';
  }

  function recentDitherClass(index) {
    if (index < 3) {
      return 'dither-sharp';
    }
    if (index === 3) {
      return 'dither-soft';
    }
    if (index === 4) {
      return 'dither-dots';
    }
    return 'dither-hidden';
  }

  function renderMovements(state) {
    var source = (state.data || {}).movimientos || {};
    var movements = movementItemsFromState_(state).slice();
    var config = state.data.config || {};
    var allMonths = !Array.isArray(source) && (source.allMonths || source.mes === null);
    var subtitle = allMonths
      ? 'Mostrando todos los movimientos. Mes actual: ' + (config.mesActual || utils.currentMonth())
      : 'Mes actual: ' + (config.mesActual || utils.currentMonth());
    return [
      '<section class="system-window">',
      '<div class="window-title">GASTOS TOTALES</div>',
      '<p class="lcd-muted">' + utils.escapeHtml(subtitle) + '</p>',
      '<div class="toolbar-line">',
      '<button class="lcd-button js-refresh" type="button">Actualizar</button>',
      '<button class="lcd-button js-new-fixed-expense" type="button">Gasto fijo</button>',
      '<button class="lcd-button js-new-expense" type="button">Gasto corriente</button>',
      '<button class="lcd-button js-new-income" type="button">Ingreso</button>',
      '</div>',
      movements.length ? renderMovementTable(movements, allMonths) : '<p class="empty-state">No hay movimientos cargados.</p>',
      '</section>'
    ].join('');
  }

  function movementItemsFromState_(state) {
    var source = (state.data || {}).movimientos;
    if (Array.isArray(source)) {
      return source;
    }
    if (source && Array.isArray(source.movimientos)) {
      return source.movimientos;
    }
    if (source && Array.isArray(source.data)) {
      return source.data;
    }
    return [];
  }

  function renderMovementTable(movements, showMonth) {
    return '<div class="movement-list">' + movements.map(function (item) {
      var meta = utils.formatMovementDateTime(item.fecha, item.hora);
      return [
        '<article class="movement-row">',
        '<button class="movement-main js-edit-movement" type="button" data-id="' + utils.escapeHtml(item.id) + '">',
        '<span class="movement-title"><strong>' + utils.escapeHtml(item.motivo) + '</strong><small>' + utils.escapeHtml(meta) + '</small></span>',
        '<span class="movement-value"><b>' + utils.escapeHtml(utils.formatMoney(item.monto)) + '</b><small>' + utils.escapeHtml(item.tipo) + '</small></span>',
        '</button>',
        '<button class="tiny-key js-delete-movement" type="button" data-id="' + utils.escapeHtml(item.id) + '">DEL</button>',
        '</article>'
      ].join('');
    }).join('') + '</div>';
  }

  function renderGoals(state) {
    var data = state.data;
    var wishlistSort = state.wishlistSort || 'asc';
    return [
      '<section class="goals-stack">',
      '<article class="system-window future-window">',
      '<div class="window-title">EL FUTURO</div>',
      renderSkyScene(),
      renderFutureSavings(data.ahorrosFuturo || []),
      '</article>',
      '<article class="system-window">',
      '<div class="window-title">METAS</div>',
      renderGoalCards(data.metas || []),
      '</article>',
      '<article class="system-window">',
      '<div class="window-title">COSAS QUE QUIERO</div>',
      renderWishlist(data.wishlist || [], wishlistSort),
      '</article>',
      '</section>'
    ].join('');
  }

  function renderFutureSavings(items) {
    if (!items.length) {
      return '<p class="empty-state">Todavia no hay ahorros para el futuro.</p>';
    }
    return '<div class="block-list">' + items.map(function (item) {
      var prefs = futureDisplayPrefs(item);
      var cardClass = prefs.mostrarAcumulado ? 'data-block future-card' : 'data-block future-card is-accumulated-hidden';
      return [
        '<article class="' + cardClass + '">',
        '<div class="future-card-head">',
        '<strong class="future-title">' + utils.escapeHtml(item.titulo) + '</strong>',
        '<span class="future-monthly">' + utils.escapeHtml(utils.formatMoney(item.montoMensual)) + ' mensual</span>',
        '</div>',
        prefs.mostrarAcumulado ? '<div class="future-accumulated"><strong>' + utils.escapeHtml(utils.formatMoney(prefs.montoAcumulado)) + '</strong><span>acumulado</span></div>' : '',
        '<div class="future-card-actions"><button class="tiny-key js-edit-future" data-id="' + utils.escapeHtml(item.id) + '" type="button">Editar</button></div>',
        '</article>'
      ].join('');
    }).join('') + '</div>';
  }

  function renderGoalCards(items) {
    if (!items.length) {
      return '<p class="empty-state">Todavia no cargaste metas especificas.</p>';
    }
    return '<div class="goal-list">' + items.map(function (item) {
      return [
        '<article class="goal-card">',
        '<div class="goal-top-band">',
        '<div class="goal-copy">',
        '<strong>' + utils.escapeHtml(item.titulo) + '</strong>',
        '<p>' + utils.escapeHtml(item.descripcion || '') + '</p>',
        '<span class="goal-monthly">Por mes: <b>' + utils.escapeHtml(utils.formatMoney(item.montoMensual)) + '</b></span>',
        '</div>',
        '<div class="goal-photo">' + renderPhotoCanvas(item) + '</div>',
        '</div>',
        '<div class="goal-balance"><strong>' + utils.escapeHtml(utils.formatMoney(item.montoAcumulado)) + '</strong><span>de ' + utils.escapeHtml(utils.formatMoney(item.montoObjetivo)) + '</span></div>',
        renderProgressMeter(item.porcentaje || 0, 'goal-progress'),
        '<div class="mini-actions goal-actions">',
        '<button class="tiny-key js-edit-goal" data-id="' + utils.escapeHtml(item.id) + '" type="button">EDIT</button>',
        '<button class="tiny-key js-delete-goal" data-id="' + utils.escapeHtml(item.id) + '" type="button">DEL</button>',
        '</div>',
        '</article>'
      ].join('');
    }).join('') + '</div>';
  }

  function renderWishlist(items, sortOrder) {
    if (!items.length) {
      return '<p class="empty-state">La lista esta vacia.</p>';
    }
    var order = sortOrder === 'desc' ? 'desc' : 'asc';
    var sorted = items.slice().sort(function (left, right) {
      var leftAmount = Number(left.costoAproximado || 0);
      var rightAmount = Number(right.costoAproximado || 0);
      return order === 'desc' ? rightAmount - leftAmount : leftAmount - rightAmount;
    });
    return [
      '<div class="wish-toolbar" aria-label="Ordenar cosas que quiero">',
      '<button class="tiny-key js-wish-sort' + (order === 'asc' ? ' is-active' : '') + '" type="button" data-order="asc">MENOR</button>',
      '<button class="tiny-key js-wish-sort' + (order === 'desc' ? ' is-active' : '') + '" type="button" data-order="desc">MAYOR</button>',
      '</div>',
      '<div class="wish-grid">'
    ].join('') + sorted.map(function (item) {
      return [
        '<article class="wish-card">',
        renderSharpSparkles(),
        renderPhotoCanvas(item),
        '<div class="wish-info">',
        '<strong>' + utils.escapeHtml(item.titulo) + '</strong>',
        '<b>' + utils.escapeHtml(utils.formatMoney(item.costoAproximado)) + '</b>',
        '<div class="mini-actions">',
        '<button class="tiny-key js-convert-wish" data-id="' + utils.escapeHtml(item.id) + '" type="button">META</button>',
        '<button class="tiny-key js-edit-wish" data-id="' + utils.escapeHtml(item.id) + '" type="button">EDIT</button>',
        '</div>',
        '</div>',
        '</article>'
      ].join('');
    }).join('') + '</div>';
  }

  function renderSkyScene() {
    return [
      '<span class="sky-scene" aria-hidden="true">',
      '<span class="pixel-cloud pixel-cloud-a"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>',
      '<span class="pixel-cloud pixel-cloud-b"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>',
      '<span class="pixel-cloud pixel-cloud-c"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>',
      '<span class="sky-bird sky-bird-a"><i></i><b></b><em></em></span>',
      '<span class="sky-bird sky-bird-b"><i></i><b></b><em></em></span>',
      '<span class="sky-bird sky-bird-c"><i></i><b></b><em></em></span>',
      '<span class="sky-ave sky-ave-a"><i></i><b></b><em></em></span>',
      '<span class="sky-ave sky-ave-b"><i></i><b></b><em></em></span>',
      '</span>'
    ].join('');
  }

  function readFuturePrefs() {
    try {
      return JSON.parse(localStorage.getItem(FUTURE_PREFS_KEY) || '{}') || {};
    } catch (error) {
      return {};
    }
  }

  function writeFuturePrefs(prefs) {
    try {
      localStorage.setItem(FUTURE_PREFS_KEY, JSON.stringify(prefs || {}));
    } catch (error) {
      return;
    }
  }

  function toBoolean(value, fallback) {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }
    return !(value === false || value === 'false' || value === '0' || value === 0);
  }

  function futureDisplayPrefs(item) {
    var source = item || {};
    var saved = source.id ? (readFuturePrefs()[String(source.id)] || {}) : {};
    var visible = source.mostrarAcumulado !== undefined
      ? toBoolean(source.mostrarAcumulado, true)
      : toBoolean(saved.mostrarAcumulado, true);
    var accumulated = saved.montoAcumulado !== undefined
      ? utils.normalizeAmount(saved.montoAcumulado)
      : utils.normalizeAmount(source.montoAcumulado);

    return {
      mostrarAcumulado: visible,
      montoAcumulado: accumulated
    };
  }

  function saveFutureDisplayPrefs(id, patch) {
    if (!id) {
      return;
    }
    var key = String(id);
    var prefs = readFuturePrefs();
    var current = prefs[key] || {};
    prefs[key] = Object.assign({}, current, {
      mostrarAcumulado: toBoolean(patch.mostrarAcumulado, true),
      montoAcumulado: utils.normalizeAmount(patch.montoAcumulado)
    });
    writeFuturePrefs(prefs);
  }

  function renderSharpSparkles() {
    return [
      '<span class="sharp-spark-layer" aria-hidden="true">',
      '<i class="sharp-spark sharp-spark-a"></i>',
      '<i class="sharp-spark sharp-spark-b"></i>',
      '<i class="sharp-spark sharp-spark-c"></i>',
      '<i class="sharp-spark sharp-spark-d"></i>',
      '</span>'
    ].join('');
  }

  function renderPhotoCanvas(item) {
    if (!item.imageDriveId) {
      return '<div class="lcd-photo-placeholder">IMG</div>';
    }
    return '<canvas class="lcd-photo" width="216" height="162" data-image-id="' + utils.escapeHtml(item.imageDriveId) + '"></canvas>';
  }

  function renderSettings(state) {
    var config = state.data.config || {};
    return [
      '<section class="system-window">',
      '<div class="window-title">CONFIGURACION</div>',
      '<form class="lcd-form settings-form" id="settings-form">',
      '<p class="form-error" hidden></p>',
      '<div class="salary-config-panel">',
      '<label class="field"><span>Sueldo mensual</span><input name="sueldoMensual" data-salary-input type="number" min="0" step="1" inputmode="numeric" value="' + utils.escapeHtml(config.sueldoMensual || 0) + '"></label>',
      '<button class="lcd-button primary salary-paid-button js-claim-salary" type="button">¡Cobré!</button>',
      '</div>',
      renderFixedExpensesEditor(config),
      '<div class="form-actions">',
      '<button class="lcd-button primary" type="submit">Guardar</button>',
      '<button class="lcd-button js-connect-backend" type="button">Conexion</button>',
      '</div>',
      '</form>',
      '<p class="lcd-muted">Mes automatico: ' + utils.escapeHtml(config.mesActual || utils.currentMonth()) + '</p>',
      renderAppVersionPanel(),
      '</section>'
    ].join('');
  }

  function renderFixedExpensesEditor(config) {
    var salary = utils.normalizeAmount((config || {}).sueldoMensual || 0);
    var items = utils.normalizeFixedExpenses((config || {}).gastosFijos || [], salary);
    return [
      '<section class="fixed-expense-editor">',
      '<div class="section-subtitle">Gastos fijos</div>',
      '<div class="fixed-expense-list" data-fixed-list>',
      (items.length ? items : [{ nombre: '', monto: 0, porcentajeSueldo: 0 }]).map(function (item, index) {
        return renderFixedExpenseRow(item, index, salary);
      }).join(''),
      '</div>',
      '<div class="fixed-expense-total" data-fixed-total></div>',
      '<button class="lcd-button js-add-fixed-expense" type="button">Agregar gasto fijo</button>',
      '</section>'
    ].join('');
  }

  function renderFixedExpenseRow(item, index, salary) {
    var name = utils.fixedExpenseName(item);
    var amount = utils.fixedExpenseAmount(item);
    var percent = utils.fixedExpensePercent(item, salary);
    return [
      '<article class="fixed-expense-row" data-fixed-row>',
      '<label class="field"><span>Nombre</span><input data-fixed-name name="gastoFijoNombre' + index + '" type="text" maxlength="80" value="' + utils.escapeHtml(name) + '" autocomplete="off"></label>',
      '<div class="field-row">',
      '<label class="field"><span>Monto mensual</span><input data-fixed-amount name="gastoFijoMonto' + index + '" type="number" min="0" step="1" inputmode="numeric" value="' + utils.escapeHtml(amount || '') + '"></label>',
      '<label class="field"><span>% sueldo</span><input data-fixed-percent name="gastoFijoPorcentaje' + index + '" type="number" min="0" step="0.01" inputmode="decimal" value="' + utils.escapeHtml(formatPercentInput(percent)) + '"></label>',
      '</div>',
      '<div class="fixed-expense-actions">',
      '<button class="tiny-key js-edit-fixed-expense" type="button">Editar</button>',
      '<button class="tiny-key js-remove-fixed-expense" type="button">Eliminar</button>',
      '</div>',
      '</article>'
    ].join('');
  }

  function formatPercentInput(value) {
    var number = Number(value || 0);
    return number ? String(Math.round(number * 100) / 100) : '';
  }

  function renderSalaryPartition(config) {
    var salary = utils.normalizeAmount((config || {}).sueldoMensual || 0);
    var fixed = utils.normalizeFixedExpenses((config || {}).gastosFijos || [], salary);
    var total = fixed.reduce(function (sum, item) {
      return sum + utils.fixedExpenseAmount(item);
    }, 0);
    var available = Math.max(0, salary - total);
    var excess = Math.max(0, total - salary);
    var totalPercent = salary ? Math.round((total / salary) * 10000) / 100 : 0;

    return [
      '<article class="system-window salary-partition-card' + (excess > 0 ? ' is-over-budget' : '') + '">',
      '<div class="window-title">PARTICION SUELDO</div>',
      salary ? renderSalaryPartitionSvg(fixed, salary, total, available, excess) : '<p class="empty-state">Carga tu sueldo mensual para ver la particion.</p>',
      '<div class="partition-summary">',
      '<span>Fijos: <b>' + utils.escapeHtml(utils.formatMoney(total)) + '</b></span>',
      '<span>' + utils.escapeHtml(formatPercentInput(totalPercent) || '0') + '% del sueldo</span>',
      '</div>',
      excess > 0 ? '<p class="partition-warning">Exceso: ' + utils.escapeHtml(utils.formatMoney(excess)) + '</p>' : '',
      salary ? renderSalaryPartitionLegend(fixed, salary, available, excess) : '',
      '</article>'
    ].join('');
  }

  function renderSalaryPartitionSvg(fixed, salary, total, available, excess) {
    var base = Math.max(salary, total, 1);
    var x = 0;
    var segments = fixed.map(function (item, index) {
      var amount = utils.fixedExpenseAmount(item);
      var width = Math.max(0, (amount / base) * 100);
      var rect = '<rect class="partition-segment segment-' + (index % 6) + '" x="' + x.toFixed(2) + '" y="2" width="' + width.toFixed(2) + '" height="14"></rect>';
      x += width;
      return rect;
    });
    if (available > 0) {
      var availableWidth = Math.max(0, (available / base) * 100);
      segments.push('<rect class="partition-segment segment-available" x="' + x.toFixed(2) + '" y="2" width="' + availableWidth.toFixed(2) + '" height="14"></rect>');
    }
    if (excess > 0) {
      var limitX = Math.max(0, Math.min(100, (salary / base) * 100));
      segments.push('<line class="partition-limit" x1="' + limitX.toFixed(2) + '" y1="0" x2="' + limitX.toFixed(2) + '" y2="18"></line>');
    }
    return [
      '<svg class="salary-partition-chart" viewBox="0 0 100 18" role="img" aria-label="Particion del sueldo">',
      '<rect class="partition-bg" x="0" y="2" width="100" height="14"></rect>',
      segments.join(''),
      '</svg>'
    ].join('');
  }

  function renderSalaryPartitionLegend(fixed, salary, available, excess) {
    var items = fixed.map(function (item, index) {
      var percent = salary ? Math.round((utils.fixedExpenseAmount(item) / salary) * 10000) / 100 : 0;
      return '<li><i class="segment-' + (index % 6) + '"></i><span>' + utils.escapeHtml(utils.fixedExpenseName(item) || 'Gasto fijo') + '</span><b>' + utils.escapeHtml(formatPercentInput(percent) || '0') + '%</b></li>';
    });
    items.push('<li><i class="segment-available"></i><span>Disponible</span><b>' + utils.escapeHtml(formatPercentInput(salary ? (available / salary) * 100 : 0) || '0') + '%</b></li>');
    if (excess > 0) {
      items.push('<li><i class="segment-excess"></i><span>Exceso</span><b>' + utils.escapeHtml(formatPercentInput((excess / salary) * 100) || '0') + '%</b></li>');
    }
    return '<ul class="partition-legend">' + items.join('') + '</ul>';
  }

  function renderAppVersionPanel() {
    var version = (window.FinanzasApp && window.FinanzasApp.version && window.FinanzasApp.version()) || ((window.FINANZAS_CONFIG || {}).APP_VERSION || 'dev');
    return [
      '<div class="app-version-panel">',
      '<div class="version-line"><strong data-app-version>' + utils.escapeHtml(version) + '</strong></div>',
      '<button class="lcd-button js-update-app" type="button">Actualizar app</button>',
      '</div>'
    ].join('');
  }

  function renderProgressMeter(percent, extraClass) {
    var value = Math.max(0, Math.min(100, Number(percent || 0)));
    var moodClass = value > 66 ? ' progress-high' : value > 33 ? ' progress-mid' : ' progress-low';
    var label = utils.formatPercent(value);
    return [
      '<div class="progress-meter ' + (extraClass || '') + moodClass + '" style="--level:' + value + '%" aria-label="Progreso ' + utils.escapeHtml(label) + '">',
      '<div class="progress-track" aria-hidden="true"><span></span></div>',
      '<span class="progress-label">' + utils.escapeHtml(label) + '</span>',
      '</div>'
    ].join('');
  }

  function bindRenderedActions(root) {
    var full = utils.qs('.js-view-full', root);
    if (full) {
      full.addEventListener('click', function () {
        window.FinanzasRouter.go('gastos');
      });
    }

    utils.qsa('.js-connect-backend', root).forEach(function (button) {
      button.addEventListener('click', function () {
        window.FinanzasForms.openAccessForm();
      });
    });

    utils.qsa('.js-update-app', root).forEach(function (button) {
      button.addEventListener('click', function () {
        window.FinanzasApp.updateApp();
      });
    });

    utils.qsa('.js-claim-salary', root).forEach(function (button) {
      button.addEventListener('click', function () {
        var salaryInput = utils.qs('[data-salary-input]', root);
        window.FinanzasApp.claimSalary(salaryInput ? salaryInput.value : undefined);
      });
    });

    var refresh = utils.qs('.js-refresh', root);
    if (refresh) {
      refresh.addEventListener('click', window.FinanzasApp.refresh);
    }

    var newFixedExpense = utils.qs('.js-new-fixed-expense', root);
    if (newFixedExpense) {
      newFixedExpense.addEventListener('click', function () {
        window.FinanzasForms.openFixedExpensePicker();
      });
    }

    var newExpense = utils.qs('.js-new-expense', root);
    if (newExpense) {
      newExpense.addEventListener('click', function () {
        window.FinanzasForms.openMovementForm('Gasto');
      });
    }

    var newIncome = utils.qs('.js-new-income', root);
    if (newIncome) {
      newIncome.addEventListener('click', function () {
        window.FinanzasForms.openMovementForm('Ingreso');
      });
    }

    utils.qsa('.js-edit-movement', root).forEach(function (button) {
      button.addEventListener('click', function () {
        var item = findMovement(button.getAttribute('data-id'));
        if (item) {
          window.FinanzasForms.openMovementForm(item.tipo, item);
        }
      });
    });

    utils.qsa('.js-delete-movement', root).forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-id');
        if (window.confirm('Eliminar definitivamente este movimiento?')) {
          window.FinanzasApp.mutate('deleteMovement', { id: id });
        }
      });
    });

    utils.qsa('.js-edit-future', root).forEach(function (button) {
      button.addEventListener('click', function () {
        var item = findById(window.FinanzasState.getState().data.ahorrosFuturo, button.getAttribute('data-id'));
        if (item) {
          window.FinanzasForms.openFutureSavingForm(item);
        }
      });
    });

    utils.qsa('.js-edit-goal', root).forEach(function (button) {
      button.addEventListener('click', function () {
        var item = findById(window.FinanzasState.getState().data.metas, button.getAttribute('data-id'));
        if (item) {
          window.FinanzasForms.openGoalForm(item);
        }
      });
    });

    utils.qsa('.js-delete-goal', root).forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-id');
        if (window.confirm('Eliminar esta meta? Queda guardada como inactiva en Sheets.')) {
          window.FinanzasApp.mutate('deleteGoal', { id: id });
        }
      });
    });

    utils.qsa('.js-edit-wish', root).forEach(function (button) {
      button.addEventListener('click', function () {
        var item = findById(window.FinanzasState.getState().data.wishlist, button.getAttribute('data-id'));
        if (item) {
          window.FinanzasForms.openWishlistForm(item);
        }
      });
    });

    utils.qsa('.js-convert-wish', root).forEach(function (button) {
      button.addEventListener('click', function () {
        window.FinanzasForms.convertWishlist(button.getAttribute('data-id'));
      });
    });

    utils.qsa('.js-wish-sort', root).forEach(function (button) {
      button.addEventListener('click', function () {
        window.FinanzasState.setState({ wishlistSort: button.getAttribute('data-order') || 'asc' });
      });
    });

    bindSettings(root);
  }

  function bindSettings(root) {
    var form = utils.qs('#settings-form', root);
    if (!form) {
      return;
    }
    var errorBox = utils.qs('.form-error', form);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      errorBox.hidden = true;
      var payload = utils.formDataToObject(form);
      payload.sueldoMensual = utils.normalizeAmount(payload.sueldoMensual);
      payload.gastosFijos = collectFixedExpenses(form, payload.sueldoMensual);
      window.FinanzasApp.mutate('updateConfig', payload)
        .catch(function (error) {
          errorBox.textContent = error.message;
          errorBox.hidden = false;
        });
    });

    bindFixedExpenseEditor(form);
  }

  function bindFixedExpenseEditor(form) {
    var list = utils.qs('[data-fixed-list]', form);
    var salaryInput = utils.qs('[data-salary-input]', form);
    var addButton = utils.qs('.js-add-fixed-expense', form);
    if (!list || !salaryInput) {
      return;
    }

    function salary() {
      return utils.normalizeAmount(salaryInput.value);
    }

    function bindRow(row) {
      var nameInput = utils.qs('[data-fixed-name]', row);
      var amountInput = utils.qs('[data-fixed-amount]', row);
      var percentInput = utils.qs('[data-fixed-percent]', row);
      var editButton = utils.qs('.js-edit-fixed-expense', row);
      var removeButton = utils.qs('.js-remove-fixed-expense', row);

      amountInput.addEventListener('input', function () {
        var sueldo = salary();
        percentInput.value = sueldo ? formatPercentInput((utils.normalizeAmount(amountInput.value) / sueldo) * 100) : '';
        updateFixedTotal(form);
      });
      percentInput.addEventListener('input', function () {
        var sueldo = salary();
        if (sueldo) {
          amountInput.value = String(Math.round((Number(String(percentInput.value).replace(',', '.')) || 0) * sueldo / 100));
        }
        updateFixedTotal(form);
      });
      nameInput.addEventListener('input', function () {
        updateFixedTotal(form);
      });
      editButton.addEventListener('click', function () {
        nameInput.focus();
        nameInput.select();
      });
      removeButton.addEventListener('click', function () {
        row.parentNode.removeChild(row);
        if (!utils.qsa('[data-fixed-row]', list).length) {
          list.insertAdjacentHTML('beforeend', renderFixedExpenseRow({}, 0, salary()));
          bindRow(utils.qs('[data-fixed-row]:last-child', list));
        }
        updateFixedTotal(form);
      });
    }

    utils.qsa('[data-fixed-row]', list).forEach(bindRow);
    salaryInput.addEventListener('input', function () {
      utils.qsa('[data-fixed-row]', list).forEach(function (row) {
        var amountInput = utils.qs('[data-fixed-amount]', row);
        var percentInput = utils.qs('[data-fixed-percent]', row);
        percentInput.value = salary() ? formatPercentInput((utils.normalizeAmount(amountInput.value) / salary()) * 100) : '';
      });
      updateFixedTotal(form);
    });
    if (addButton) {
      addButton.addEventListener('click', function () {
        list.insertAdjacentHTML('beforeend', renderFixedExpenseRow({}, utils.qsa('[data-fixed-row]', list).length, salary()));
        bindRow(utils.qs('[data-fixed-row]:last-child', list));
        updateFixedTotal(form);
      });
    }
    updateFixedTotal(form);
  }

  function collectFixedExpenses(root, salary) {
    return utils.qsa('[data-fixed-row]', root).map(function (row) {
      var name = String((utils.qs('[data-fixed-name]', row) || {}).value || '').trim();
      var amount = utils.normalizeAmount((utils.qs('[data-fixed-amount]', row) || {}).value);
      var percent = Number(String((utils.qs('[data-fixed-percent]', row) || {}).value || '').replace(',', '.')) || 0;
      if (!name && !amount) {
        return null;
      }
      return {
        categoria: name || 'Gasto fijo',
        nombre: name || 'Gasto fijo',
        monto: amount,
        porcentajeSueldo: percent || (salary ? Math.round((amount / salary) * 10000) / 100 : 0)
      };
    }).filter(Boolean);
  }

  function updateFixedTotal(root) {
    var salary = utils.normalizeAmount((utils.qs('[data-salary-input]', root) || {}).value);
    var items = collectFixedExpenses(root, salary);
    var total = items.reduce(function (sum, item) {
      return sum + utils.normalizeAmount(item.monto);
    }, 0);
    var percent = salary ? Math.round((total / salary) * 10000) / 100 : 0;
    var box = utils.qs('[data-fixed-total]', root);
    if (box) {
      box.innerHTML = '<span>Total fijo</span><strong>' + utils.escapeHtml(utils.formatMoney(total)) + '</strong><small>' + utils.escapeHtml(formatPercentInput(percent) || '0') + '% del sueldo</small>';
      box.className = 'fixed-expense-total' + (salary && total > salary ? ' is-over-budget' : '');
    }
  }

  function topSpendingMotive(movements, config, summary) {
    var month = String((summary || {}).mes || (config || {}).mesActual || utils.currentMonth()).slice(0, 7);
    var groups = [];
    (movements || []).forEach(function (item) {
      if (!isExpenseMovement(item) || movementMonth(item) !== month) {
        return;
      }
      addMovementToMotiveGroups(groups, item);
    });

    if (!groups.length) {
      return {
        motivo: '',
        monto: 0,
        mensaje: 'Todavia no registraste gastos este mes.'
      };
    }

    groups.sort(function (left, right) {
      return right.total - left.total;
    });
    return {
      motivo: canonicalMotive(groups[0]),
      monto: groups[0].total,
      mensaje: utils.formatMoney(groups[0].total) + ' agrupado por motivo similar.'
    };
  }

  function addMovementToMotiveGroups(groups, item) {
    var motive = String(item.motivo || 'Sin motivo').trim() || 'Sin motivo';
    var normalized = normalizeMotive(motive);
    var amount = utils.normalizeAmount(item.monto);
    var group = groups.filter(function (candidate) {
      return maxMotiveSimilarity(normalized, candidate.keys) >= MOTIVE_SIMILARITY_THRESHOLD;
    })[0];
    if (!group) {
      group = { total: 0, variants: {}, keys: [] };
      groups.push(group);
    }
    group.total += amount;
    if (group.keys.indexOf(normalized) === -1) {
      group.keys.push(normalized);
    }
    if (!group.variants[normalized]) {
      group.variants[normalized] = {
        label: motive,
        count: 0,
        total: 0
      };
    }
    group.variants[normalized].count += 1;
    group.variants[normalized].total += amount;
  }

  function canonicalMotive(group) {
    return Object.keys(group.variants).map(function (key) {
      return group.variants[key];
    }).sort(function (left, right) {
      if (right.count !== left.count) {
        return right.count - left.count;
      }
      return right.total - left.total;
    })[0].label;
  }

  function maxMotiveSimilarity(value, keys) {
    return (keys || []).reduce(function (max, key) {
      return Math.max(max, motiveSimilarity(value, key));
    }, 0);
  }

  function motiveSimilarity(left, right) {
    if (!left || !right) {
      return 0;
    }
    if (left === right) {
      return 1;
    }
    if ((left.length >= 3 && right.indexOf(left) !== -1) || (right.length >= 3 && left.indexOf(right) !== -1)) {
      return 0.9;
    }
    return Math.max(levenshteinSimilarity(left, right), trigramSimilarity(left, right));
  }

  function normalizeMotive(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function levenshteinSimilarity(left, right) {
    var distance = levenshteinDistance(left, right);
    var length = Math.max(left.length, right.length, 1);
    return 1 - (distance / length);
  }

  function levenshteinDistance(left, right) {
    var previous = [];
    var current = [];
    var i;
    var j;
    for (j = 0; j <= right.length; j += 1) {
      previous[j] = j;
    }
    for (i = 1; i <= left.length; i += 1) {
      current[0] = i;
      for (j = 1; j <= right.length; j += 1) {
        current[j] = Math.min(
          previous[j] + 1,
          current[j - 1] + 1,
          previous[j - 1] + (left.charAt(i - 1) === right.charAt(j - 1) ? 0 : 1)
        );
      }
      previous = current.slice();
    }
    return previous[right.length];
  }

  function trigramSimilarity(left, right) {
    var leftSet = trigrams(left);
    var rightSet = trigrams(right);
    var matches = 0;
    Object.keys(leftSet).forEach(function (key) {
      if (rightSet[key]) {
        matches += Math.min(leftSet[key], rightSet[key]);
      }
    });
    var leftCount = Object.keys(leftSet).reduce(function (sum, key) { return sum + leftSet[key]; }, 0);
    var rightCount = Object.keys(rightSet).reduce(function (sum, key) { return sum + rightSet[key]; }, 0);
    return (leftCount + rightCount) ? (2 * matches) / (leftCount + rightCount) : 0;
  }

  function trigrams(value) {
    var text = '  ' + String(value || '') + '  ';
    var result = {};
    var index;
    for (index = 0; index < text.length - 2; index += 1) {
      var key = text.slice(index, index + 3);
      result[key] = Number(result[key] || 0) + 1;
    }
    return result;
  }

  function isExpenseMovement(item) {
    var type = String((item || {}).tipo || '');
    return type === 'Gasto' || type === 'Compra de wishlist';
  }

  function movementMonth(item) {
    var date = String((item || {}).fecha || '');
    if (/^\d{4}-\d{2}/.test(date)) {
      return date.slice(0, 7);
    }
    return String((item || {}).mes || '').slice(0, 7);
  }

  function findMovement(id) {
    return findById(movementItemsFromState_(window.FinanzasState.getState()), id);
  }

  function findById(items, id) {
    return (items || []).filter(function (item) {
      return String(item.id) === String(id);
    })[0];
  }

  window.FinanzasRender = {
    render: render
  };

  window.FinanzasFuturePrefs = {
    get: futureDisplayPrefs,
    save: saveFutureDisplayPrefs
  };
}());
