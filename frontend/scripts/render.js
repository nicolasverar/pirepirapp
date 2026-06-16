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
    hydrateWishParticles(screen);
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
      renderLiquid(summary.porcentajeDisponible || 0, 'liquid-large'),
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
    var movements = ((state.data.movimientos || {}).movimientos || []).slice();
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
      '<article class="system-window">',
      '<div class="window-title">EL FUTURO</div>',
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
        renderFutureScene(),
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
        renderGoalFlameFrame(),
        renderPhotoCanvas(item),
        '<div class="goal-body">',
        '<strong>' + utils.escapeHtml(item.titulo) + '</strong>',
        '<p>' + utils.escapeHtml(item.descripcion || '') + '</p>',
        '<dl><dt>Mensual</dt><dd>' + utils.escapeHtml(utils.formatMoney(item.montoMensual)) + '</dd><dt>Meta</dt><dd>' + utils.escapeHtml(utils.formatMoney(item.montoObjetivo)) + '</dd><dt>Acum.</dt><dd>' + utils.escapeHtml(utils.formatMoney(item.montoAcumulado)) + '</dd></dl>',
        renderLiquid(item.porcentaje || 0, 'liquid-compact'),
        '<div class="mini-actions">',
        '<button class="tiny-key js-edit-goal" data-id="' + utils.escapeHtml(item.id) + '" type="button">EDIT</button>',
        '<button class="tiny-key js-delete-goal" data-id="' + utils.escapeHtml(item.id) + '" type="button">DEL</button>',
        '</div>',
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
        '<article class="wish-card" data-wish-particles>',
        renderPhotoCanvas(item),
        '<strong>' + utils.escapeHtml(item.titulo) + '</strong>',
        '<p>' + utils.escapeHtml(item.descripcion || '') + '</p>',
        '<b>' + utils.escapeHtml(utils.formatMoney(item.costoAproximado)) + '</b>',
        '<div class="mini-actions">',
        '<button class="tiny-key js-convert-wish" data-id="' + utils.escapeHtml(item.id) + '" type="button">META</button>',
        '<button class="tiny-key js-edit-wish" data-id="' + utils.escapeHtml(item.id) + '" type="button">EDIT</button>',
        '</div>',
        '</article>'
      ].join('');
    }).join('') + '</div>';
  }

  function renderFutureScene() {
    return [
      '<span class="future-scene" aria-hidden="true">',
      '<span class="future-hill"></span>',
      '<span class="future-tree tree-a"></span>',
      '<span class="future-tree tree-b"></span>',
      '<span class="future-tree tree-c"></span>',
      '<span class="future-tree tree-d"></span>',
      '<span class="future-bird bird-a"></span>',
      '<span class="future-bird bird-b"></span>',
      '<span class="future-bird bird-c"></span>',
      '</span>'
    ].join('');
  }

  function renderGoalFlameFrame() {
    return [
      '<svg class="goal-flame-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">',
      '<path class="flame-step flame-step-1" d="M4 18 L8 12 L8 6 L18 6 L22 2 L29 6 L40 5 L44 10 L52 5 L60 7 L68 3 L73 9 L84 7 L90 12 L96 10 L94 22 L98 30 L94 40 L96 52 L91 59 L96 67 L92 76 L96 88 L86 92 L79 98 L70 92 L60 96 L52 91 L42 94 L35 90 L25 95 L20 89 L10 92 L6 82 L3 75 L7 65 L3 56 L6 48 L2 38 L6 30 Z"></path>',
      '<path class="flame-step flame-step-2" d="M5 16 L10 10 L7 5 L20 7 L25 3 L31 8 L39 4 L46 11 L54 6 L61 9 L69 4 L76 10 L83 6 L91 14 L97 12 L92 24 L97 33 L93 42 L98 52 L90 61 L96 70 L91 78 L95 89 L84 91 L78 96 L69 91 L61 98 L51 90 L43 95 L34 89 L26 94 L18 88 L9 93 L5 81 L2 73 L8 64 L4 55 L8 47 L3 37 L7 28 Z"></path>',
      '<path class="flame-step flame-step-3" d="M3 20 L9 13 L6 7 L17 5 L23 9 L30 3 L38 8 L45 4 L53 10 L60 5 L68 8 L74 4 L82 10 L89 8 L96 17 L92 25 L98 31 L94 43 L97 51 L92 60 L98 68 L90 77 L96 86 L87 94 L78 91 L70 97 L61 92 L53 95 L44 90 L36 97 L27 90 L19 95 L11 90 L7 83 L3 76 L8 66 L2 58 L7 49 L3 40 L8 31 Z"></path>',
      '<path class="flame-step flame-step-4" d="M6 17 L7 9 L12 5 L20 8 L24 2 L32 7 L41 6 L46 10 L55 4 L62 8 L70 5 L76 11 L85 6 L90 13 L97 11 L95 21 L99 29 L93 39 L96 49 L92 57 L97 66 L91 75 L96 88 L86 93 L80 97 L71 92 L63 96 L54 91 L45 94 L36 90 L29 97 L20 88 L11 93 L5 84 L2 74 L7 67 L3 57 L8 50 L2 39 L7 30 Z"></path>',
      '</svg>'
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

  function renderLiquid(percent, extraClass) {
    var value = Math.max(0, Math.min(100, Number(percent || 0)));
    var moodClass = value > 66 ? ' liquid-high' : value > 33 ? ' liquid-mid' : ' liquid-low';
    return [
      '<div class="liquid-meter ' + (extraClass || '') + moodClass + '" style="--level:' + value + '%">',
      '<div class="liquid-grid" aria-hidden="true"></div>',
      '<div class="liquid-fill"><i></i><i></i><i></i></div>',
      '<span class="liquid-label">' + utils.escapeHtml(utils.formatPercent(value)) + '</span>',
      '</div>'
    ].join('');
  }

  function hydrateWishParticles(root) {
    utils.qsa('[data-wish-particles]', root).forEach(function (card, cardIndex) {
      if (utils.qs('.wish-spark-layer', card)) {
        return;
      }
      var layer = document.createElement('span');
      var particleCount = 3 + (cardIndex % 2);
      layer.className = 'wish-spark-layer';
      layer.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < particleCount; i += 1) {
        var spark = document.createElement('i');
        spark.style.setProperty('--spark-x', (10 + Math.round(Math.random() * 78)) + '%');
        spark.style.setProperty('--spark-y', (12 + Math.round(Math.random() * 70)) + '%');
        spark.style.setProperty('--spark-delay', (Math.random() * 2.8 + i * 0.22).toFixed(2) + 's');
        spark.style.setProperty('--spark-size', (2 + Math.round(Math.random() * 2)) + 'px');
        layer.appendChild(spark);
      }
      card.insertBefore(layer, card.firstChild);
    });
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
    return findById(((window.FinanzasState.getState().data.movimientos || {}).movimientos || []), id);
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
