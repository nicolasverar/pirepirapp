(function () {
  'use strict';

  var utils = window.FinanzasUtils;

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
    var top = summary.categoriaMayorGasto || {};
    var recent = summary.actividadReciente || [];
    return [
      '<section class="summary-stack">',
      '<article class="system-window total-window summary-primary">',
      '<p class="summary-date-line"><strong>Estamos el ' + utils.escapeHtml(utils.friendlyDate()) + '</strong></p>',
      '<p class="summary-subline">y ya gastaste:</p>',
      '<strong class="big-money">' + utils.escapeHtml(utils.formatMoney(summary.totalGastado || 0)) + '</strong>',
      '</article>',
      '<article class="system-window summary-metrics-card">',
      '<p class="top-spend-line">Gastaste mas en: <strong>' + utils.escapeHtml(top.categoria || 'Sin gastos') + '</strong></p>',
      renderRecent(recent),
      '<button class="text-key js-view-full" type="button">Ver completo</button>',
      '</article>',
      '<article class="system-window availability-card">',
      '<div class="window-title">DISPONIBLE</div>',
      '<div class="available-line"><span>Te queda</span><strong>' + utils.escapeHtml(utils.formatMoney(summary.disponible || 0)) + '</strong></div>',
      renderProgressMeter(summary.porcentajeDisponible || 0, 'progress-large'),
      '</article>',
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
      return [
        '<li class="recent-row dataframe-row ' + recentDitherClass(index) + '">',
        '<span class="df-index">' + utils.escapeHtml(String(index + 1).padStart(2, '0')) + '</span>',
        '<span class="row-title"><strong>' + utils.escapeHtml(item.motivo) + '</strong><small>' + utils.escapeHtml(item.categoria || item.tipo) + '</small></span>',
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
    var movements = movementItemsFromState_(state).slice();
    var config = state.data.config || {};
    return [
      '<section class="system-window">',
      '<div class="window-title">GASTOS TOTALES</div>',
      '<p class="lcd-muted">Mes activo: ' + utils.escapeHtml(config.mesActual || utils.currentMonth()) + '</p>',
      '<div class="toolbar-line">',
      '<button class="lcd-button js-refresh" type="button">Actualizar</button>',
      '<button class="lcd-button js-new-expense" type="button">Gasto</button>',
      '<button class="lcd-button js-new-income" type="button">Ingreso</button>',
      '</div>',
      movements.length ? renderMovementTable(movements) : '<p class="empty-state">No hay movimientos para este mes.</p>',
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

  function renderMovementTable(movements) {
    return '<div class="movement-list">' + movements.map(function (item) {
      return [
        '<article class="movement-row">',
        '<button class="movement-main js-edit-movement" type="button" data-id="' + utils.escapeHtml(item.id) + '">',
        '<span><strong>' + utils.escapeHtml(item.motivo) + '</strong><small>' + utils.escapeHtml(item.fecha) + ' ' + utils.escapeHtml(item.hora) + '</small></span>',
        '<span><b>' + utils.escapeHtml(utils.formatMoney(item.monto)) + '</b><small>' + utils.escapeHtml(item.tipo) + '</small></span>',
        '</button>',
        '<button class="tiny-key js-delete-movement" type="button" data-id="' + utils.escapeHtml(item.id) + '">DEL</button>',
        '</article>'
      ].join('');
    }).join('') + '</div>';
  }

  function renderGoals(state) {
    var data = state.data;
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
      renderWishlist(data.wishlist || []),
      '</article>',
      '</section>'
    ].join('');
  }

  function renderFutureSavings(items) {
    if (!items.length) {
      return '<p class="empty-state">Todavia no hay ahorros para el futuro.</p>';
    }
    return '<div class="block-list">' + items.map(function (item) {
      return [
        '<article class="data-block future-card">',
        '<div><strong>' + utils.escapeHtml(item.titulo) + '</strong><p>' + utils.escapeHtml(item.descripcion || '') + '</p></div>',
        '<dl><dt>Mensual</dt><dd>' + utils.escapeHtml(utils.formatMoney(item.montoMensual)) + '</dd><dt>Acumulado</dt><dd>' + utils.escapeHtml(utils.formatMoney(item.montoAcumulado)) + '</dd></dl>',
        '<button class="tiny-key js-edit-future" data-id="' + utils.escapeHtml(item.id) + '" type="button">EDIT</button>',
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

  function renderWishlist(items) {
    if (!items.length) {
      return '<p class="empty-state">La lista esta vacia.</p>';
    }
    return '<div class="wish-grid">' + items.map(function (item) {
      return [
        '<article class="wish-card">',
        renderSharpSparkles(),
        renderPhotoCanvas(item),
        '<div class="wish-info">',
        '<strong>' + utils.escapeHtml(item.titulo) + '</strong>',
        '<p>' + utils.escapeHtml(item.descripcion || '') + '</p>',
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
      '<span class="pixel-cloud pixel-cloud-a"><i></i><i></i><i></i></span>',
      '<span class="pixel-cloud pixel-cloud-b"><i></i><i></i><i></i></span>',
      '<span class="sky-bird sky-bird-a"></span>',
      '<span class="sky-bird sky-bird-b"></span>',
      '<span class="sky-ave sky-ave-a"></span>',
      '</span>'
    ].join('');
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
      '<label class="field"><span>Mes activo</span><input name="mesActual" type="month" value="' + utils.escapeHtml(config.mesActual || utils.currentMonth()) + '" required></label>',
      '<label class="field"><span>Sueldo mensual</span><input name="sueldoMensual" type="number" min="0" step="1" inputmode="numeric" value="' + utils.escapeHtml(config.sueldoMensual || 0) + '"></label>',
      '<label class="field"><span>Categorias</span><textarea name="categorias" rows="6">' + utils.escapeHtml((config.categorias || []).join('\n')) + '</textarea></label>',
      '<label class="field"><span>Gastos fijos</span><textarea name="gastosFijos" rows="4">' + utils.escapeHtml(utils.fixedExpensesToText(config.gastosFijos || [])) + '</textarea></label>',
      '<div class="form-actions">',
      '<button class="lcd-button primary" type="submit">Guardar</button>',
      '<button class="lcd-button js-start-month" type="button">Iniciar mes</button>',
      '<button class="lcd-button js-connect-backend" type="button">Conexion</button>',
      '</div>',
      '</form>',
      '<p class="lcd-muted">Mes activo: ' + utils.escapeHtml(config.mesActual || utils.currentMonth()) + '</p>',
      renderAppVersionPanel(),
      '</section>'
    ].join('');
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

    var refresh = utils.qs('.js-refresh', root);
    if (refresh) {
      refresh.addEventListener('click', window.FinanzasApp.refresh);
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
      payload.categorias = utils.splitLines(payload.categorias);
      payload.gastosFijos = utils.fixedExpensesFromText(payload.gastosFijos);
      window.FinanzasApp.mutate('updateConfig', payload)
        .catch(function (error) {
          errorBox.textContent = error.message;
          errorBox.hidden = false;
        });
    });

    var start = utils.qs('.js-start-month', root);
    if (start) {
      start.addEventListener('click', function () {
        var monthInput = utils.qs('[name="mesActual"]', form);
        var selectedMonth = monthInput && monthInput.value ? monthInput.value : ((window.FinanzasState.getState().data.config || {}).mesActual || utils.currentMonth());
        window.FinanzasApp.mutate('startMonth', { mes: selectedMonth });
      });
    }
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
}());
