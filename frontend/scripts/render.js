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
    screen.classList.toggle('is-summary-screen', state.currentView !== 'gastos' && state.currentView !== 'metas' && state.currentView !== 'configuracion');

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
    hydrateSummaryPixelText(screen);
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
    var topMovement = topSpendingMovement(movements, config, summary);
    var variableSpent = summaryVariableSpent(movements, config, summary);
    var currentMonthName = summaryMonthName(summary, config);
    return [
      '<section class="summary-stack">',
      '<article class="summary-embedded total-window summary-primary">',
      '<div class="summary-date-block">',
      renderSummaryPixelSvg('HOY ES', 'label'),
      '<div class="summary-date-display">',
      renderSummaryPixelSvg(summaryDayLabel() + ' ' + summaryDateLabel(), 'date'),
      '</div>',
      '</div>',
      '</article>',
      '<article class="summary-combined-card">',
      '<div class="summary-combined-spent">',
      '<span class="summary-combined-title">EN LO QUE VA DE ' + utils.escapeHtml(String(currentMonthName || '').toUpperCase()) + '<br>GASTASTE</span>',
      '<div class="summary-combined-divider"></div>',
      '<strong>' + utils.escapeHtml(utils.formatMoney(variableSpent)) + '</strong>',
      '</div>',
      '<div class="summary-combined-top">',
      '<p class="summary-combined-top-line"><span>Gastaste más en</span><strong>' + utils.escapeHtml(top.motivo || 'Sin gastos') + '</strong></p>',
      renderSummaryCombinedItem(topMovement),
      '</div>',
      '</article>',
      '<article class="system-window availability-card">',
      '<div class="window-title">PLATA DISPONIBLE</div>',
      '<div class="available-line"><span>Te queda</span><strong>' + utils.escapeHtml(utils.formatMoney(summary.disponible || 0)) + '</strong></div>',
      renderProgressMeter(summary.porcentajeDisponible || 0, 'progress-large'),
      '</article>',
      renderSalaryPartition(config),
      '</section>'
    ].join('');
  }

  function summaryDayLabel() {
    var days = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    return days[new Date().getDay()] || '';
  }

  function summaryDateLabel() {
    var now = new Date();
    return String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + String(now.getFullYear()).slice(-2);
  }

  function renderSummaryPixelSvg(text, kind) {
    var value = String(text || '').toUpperCase();
    var cell = 4;
    var gap = 1;
    var charGap = kind === 'label' ? 5 : 4;
    var width = summaryPixelSvgWidth(value, cell, gap, charGap);
    var height = 7 * (cell + gap) - gap;
    var active = [];
    var ghost = [];
    var x = 0;
    for (var c = 0; c < value.length; c += 1) {
      var glyph = summaryPixelGlyph(value.charAt(c));
      for (var row = 0; row < glyph.length; row += 1) {
        for (var col = 0; col < glyph[row].length; col += 1) {
          var rect = '<rect x="' + (x + col * (cell + gap)) + '" y="' + (row * (cell + gap)) + '" width="' + cell + '" height="' + cell + '"></rect>';
          if (glyph[row].charAt(col) === '1') {
            active.push(rect);
          } else {
            ghost.push(rect);
          }
        }
      }
      x += glyph[0].length * (cell + gap) + charGap;
    }
    return [
      '<svg class="summary-pixel-svg summary-pixel-' + utils.escapeHtml(kind) + '" viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + utils.escapeHtml(value) + '">',
      '<g class="summary-pixel-ghost">' + ghost.join('') + '</g>',
      '<g class="summary-pixel-active">' + active.join('') + '</g>',
      '</svg>'
    ].join('');
  }

  function summaryPixelSvgWidth(text, cell, gap, charGap) {
    var width = 0;
    for (var i = 0; i < text.length; i += 1) {
      width += summaryPixelGlyph(text.charAt(i))[0].length * (cell + gap) + charGap;
    }
    return Math.max(1, width - charGap);
  }

  var SUMMARY_PIXEL_GLYPHS = {
    ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
    '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
    '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
    '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
    'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    'B': ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    'D': ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    'E': ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    'H': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    'I': ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    'J': ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
    'L': ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    'M': ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    'N': ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    'O': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    'R': ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    'S': ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    'U': ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    'V': ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
    'Y': ['10001', '10001', '01010', '00100', '00100', '00100', '00100']
  };

  var summaryPixelResizeBound = false;
  var summaryPixelRoot = null;

  function hydrateSummaryPixelText(root) {
    summaryPixelRoot = root;
    utils.qsa('.summary-pixel-text', root).forEach(function (canvas) {
      drawSummaryPixelText(canvas);
    });
    if (!summaryPixelResizeBound) {
      summaryPixelResizeBound = true;
      window.addEventListener('resize', function () {
        if (summaryPixelRoot) {
          hydrateSummaryPixelText(summaryPixelRoot);
        }
      });
    }
  }

  function drawSummaryPixelText(canvas) {
    var text = String(canvas.getAttribute('data-pixel-text') || '').toUpperCase();
    var kind = canvas.getAttribute('data-pixel-kind') || 'date';
    var style = kind === 'label'
      ? { cell: 4.2, gap: 0.85, scale: 1, fillWidth: 0.72, maxScale: 3.2 }
      : { cell: 4.2, gap: 0.75, scale: 1, fillWidth: 0.98, maxScale: 2.6 };
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var ctx = canvas.getContext('2d');
    if (!ctx || !rect.width || !rect.height) {
      return;
    }
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.imageSmoothingEnabled = false;
    drawSummaryPixelLine(ctx, text, rect.width, rect.height, style);
  }

  function drawSummaryPixelLine(ctx, text, width, height, style) {
    var local = {
      cell: style.cell * style.scale,
      gap: style.gap * style.scale,
      stretchY: 1,
      ghost: true
    };
    var maxWidth = (width - 6) * (style.fillWidth || 1);
    var maxHeight = height - 4;
    var fit = Math.min(style.maxScale || 1, maxWidth / Math.max(summaryPixelTextWidth(text, local), 1), maxHeight / Math.max(summaryPixelTextHeight(local), 1));
    if (fit !== 1) {
      local.cell *= fit;
      local.gap *= fit;
    }
    var x = Math.max(0, (width - summaryPixelTextWidth(text, local)) / 2);
    var y = Math.max(0, (height - summaryPixelTextHeight(local)) / 2);
    var ink = '#071007';
    var ghost = 'rgba(7, 16, 7, 0.14)';
    for (var c = 0; c < text.length; c += 1) {
      var glyph = summaryPixelGlyph(text.charAt(c));
      for (var row = 0; row < glyph.length; row += 1) {
        for (var col = 0; col < glyph[row].length; col += 1) {
          var active = glyph[row].charAt(col) === '1';
          if (!active && !local.ghost) {
            continue;
          }
          ctx.fillStyle = active ? ink : ghost;
          ctx.fillRect(
            x + col * (local.cell + local.gap),
            y + row * (local.cell + local.gap) * local.stretchY,
            local.cell,
            local.cell * local.stretchY
          );
        }
      }
      x += glyph[0].length * (local.cell + local.gap) + local.cell * 1.15;
    }
  }

  function summaryPixelGlyph(ch) {
    return SUMMARY_PIXEL_GLYPHS[ch] || SUMMARY_PIXEL_GLYPHS[' '];
  }

  function summaryPixelTextWidth(text, style) {
    var width = 0;
    for (var i = 0; i < text.length; i += 1) {
      width += summaryPixelGlyph(text.charAt(i))[0].length * (style.cell + style.gap) + style.cell * 1.15;
    }
    return width;
  }

  function summaryPixelTextHeight(style) {
    return 7 * (style.cell + style.gap) * style.stretchY;
  }

  function summaryMonthName(summary, config) {
    var months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    var month = String((summary || {}).mes || (config || {}).mesActual || utils.currentMonth()).slice(0, 7);
    var index = Number(month.slice(5, 7)) - 1;
    if (index >= 0 && index < months.length) {
      return months[index];
    }
    return months[new Date().getMonth()];
  }

  function summaryVariableSpent(movements, config, summary) {
    var month = String((summary || {}).mes || (config || {}).mesActual || utils.currentMonth()).slice(0, 7);
    return (movements || []).reduce(function (sum, item) {
      if (!isExpenseMovement(item) || utils.isFixedExpenseMovement(item) || movementMonth(item) !== month) {
        return sum;
      }
      return sum + utils.normalizeAmount(item.monto);
    }, 0);
  }

  function topSpendingMovement(movements, config, summary) {
    var month = String((summary || {}).mes || (config || {}).mesActual || utils.currentMonth()).slice(0, 7);
    var filtered = (movements || []).filter(function (item) {
      return isExpenseMovement(item) && !utils.isFixedExpenseMovement(item) && movementMonth(item) === month;
    });
    if (!filtered.length) {
      return null;
    }
    filtered.sort(function (a, b) {
      return utils.normalizeAmount(b.monto) - utils.normalizeAmount(a.monto);
    });
    return filtered[0];
  }

  function renderSummaryCombinedItem(item) {
    if (!item) {
      return '<div class="summary-combined-item"><span class="summary-combined-rank">00</span><b>Sin gastos registrados</b><em>Gs. 0</em></div>';
    }
    return [
      '<div class="summary-combined-item">',
      '<span class="summary-combined-rank">01</span>',
      '<b>' + utils.escapeHtml(item.motivo || 'Sin motivo') + '</b>',
      '<em>' + utils.escapeHtml(utils.formatMoney(item.monto || 0)) + '</em>',
      '</div>'
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
    var activeFilter = state.movementFilter || 'all';
    var filteredMovements = filterMovementsByType(movements, activeFilter);
    var subtitle = allMonths
      ? 'Mostrando todos los movimientos. Mes actual: ' + (config.mesActual || utils.currentMonth())
      : 'Mes actual: ' + (config.mesActual || utils.currentMonth());
    return [
      '<section class="system-window">',
      '<div class="window-title">GASTOS TOTALES</div>',
      '<p class="lcd-muted">' + utils.escapeHtml(subtitle) + '</p>',
      '<div class="toolbar-line">',
      '<button class="lcd-button js-refresh" type="button">Actualizar</button>',
      '</div>',
      renderMovementFilters(movements, activeFilter),
      filteredMovements.length ? renderMovementTable(filteredMovements, allMonths) : '<p class="empty-state">No hay movimientos para este filtro.</p>',
      '</section>'
    ].join('');
  }

  function renderMovementFilters(movements, activeFilter) {
    var options = movementFilterOptions();
    return [
      '<div class="movement-filters" aria-label="Filtrar movimientos">',
      options.map(function (option) {
        var count = movementFilterCount(movements, option.value);
        var activeClass = option.value === activeFilter ? ' is-active' : '';
        return [
          '<button class="filter-chip js-movement-filter' + activeClass + '" type="button" data-filter="' + utils.escapeHtml(option.value) + '">',
          '<span>' + utils.escapeHtml(option.label) + '</span>',
          '<small>' + utils.escapeHtml(count) + '</small>',
          '</button>'
        ].join('');
      }).join(''),
      '</div>'
    ].join('');
  }

  function movementFilterOptions() {
    return [
      { value: 'all', label: 'Todo' },
      { value: 'expense', label: 'Gastos' },
      { value: 'income', label: 'Ingresos' },
      { value: 'wishlist', label: 'Cosas' },
      { value: 'saving', label: 'Ahorro/meta' },
      { value: 'fixed', label: 'Fijos' }
    ];
  }

  function movementFilterCount(movements, filter) {
    return filterMovementsByType(movements || [], filter).length;
  }

  function filterMovementsByType(movements, filter) {
    return (movements || []).filter(function (item) {
      return matchesMovementFilter(item, filter);
    });
  }

  function matchesMovementFilter(item, filter) {
    var type = String((item || {}).tipo || '');
    if (!filter || filter === 'all') {
      return true;
    }
    if (filter === 'expense') {
      return type === 'Gasto' && !utils.isFixedExpenseMovement(item);
    }
    if (filter === 'income') {
      return type === 'Ingreso';
    }
    if (filter === 'wishlist') {
      return type === 'Compra de wishlist';
    }
    if (filter === 'saving') {
      return type === 'Aporte a ahorro' || type === 'Aporte a meta';
    }
    if (filter === 'fixed') {
      return utils.isFixedExpenseMovement(item);
    }
    return true;
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
      renderFutureSavings(data.ahorrosFuturo || []),
      '</article>',
      '<article class="system-window goals-window">',
      '<div class="window-title">METAS</div>',
      renderGoalCards(data.metas || []),
      '</article>',
      '<article class="system-window wishlist-window">',
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
      var cardClass = 'wish-card' + (item.conversionFeedback ? ' is-converting' : '');
      return [
        '<article class="' + cardClass + '">',
        renderSharpSparkles(),
        item.conversionFeedback ? '<span class="wish-convert-check" aria-hidden="true">OK</span>' : '',
        renderPhotoCanvas(item),
        '<div class="wish-info">',
        '<strong>' + utils.escapeHtml(item.titulo) + '</strong>',
        '<b>' + utils.escapeHtml(utils.formatMoney(item.costoAproximado)) + '</b>',
        '<div class="mini-actions">',
        '<button class="tiny-key js-convert-wish" data-id="' + utils.escapeHtml(item.id) + '" type="button"' + (item.conversionPending ? ' disabled' : '') + '>Convertir en meta</button>',
        '<button class="tiny-key js-edit-wish" data-id="' + utils.escapeHtml(item.id) + '" type="button">EDIT</button>',
        '</div>',
        '</div>',
        '</article>'
      ].join('');
    }).join('') + '</div>';
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
      salary ? renderSalaryPartitionPie(fixed, salary, total, available, excess) : '<p class="empty-state">Carga tu sueldo mensual para ver la particion.</p>',
      '<div class="partition-summary">',
      '<span>Fijos: <b>' + utils.escapeHtml(utils.formatMoney(total)) + '</b></span>',
      '<span>' + utils.escapeHtml(formatPercentInput(totalPercent) || '0') + '% del sueldo</span>',
      '</div>',
      excess > 0 ? '<p class="partition-warning">Exceso: ' + utils.escapeHtml(utils.formatMoney(excess)) + '</p>' : '',
      salary ? renderSalaryPartitionLegend(fixed, salary, available, excess) : '',
      '</article>'
    ].join('');
  }

  function renderSalaryPartitionPie(fixed, salary, total, available, excess) {
    var segments = salaryPartitionSegments(fixed, salary, available);
    var chartTotal = Math.max(segments.reduce(function (sum, item) {
      return sum + item.amount;
    }, 0), 1);
    var cx = 141;
    var cy = 82;
    var rx = 84;
    var ry = 46;
    var depth = 54;
    var start = -Math.PI / 2;
    var tops = [];
    var labels = [];
    var sides = [];
    segments.forEach(function (item, index) {
      var sweep = (item.amount / chartTotal) * Math.PI * 2;
      var end = start + sweep;
      var full = sweep >= Math.PI * 2 - 0.0001;
      var d = partitionPiePath(cx, cy, rx, ry, start, end, full);
      var className = utils.escapeHtml(item.className);
      var hatchClass = 'hatch-' + (index % 6);
      salaryPieFrontSidePieces(start, end).forEach(function (piece) {
        var sideD = salaryPieSidePath(cx, cy, rx, ry, depth, piece.start, piece.end);
        sides.push('<path class="salary-pie-side-fill ' + className + '" d="' + sideD + '"></path>');
        sides.push('<path class="salary-pie-side-texture ' + hatchClass + '" d="' + sideD + '"></path>');
        sides.push('<path class="salary-pie-side-shade" d="' + sideD + '"></path>');
      });
      tops.push('<path class="salary-pie-slice ' + className + '" d="' + d + '"></path>');
      tops.push('<path class="salary-pie-hatch ' + hatchClass + '" d="' + d + '"></path>');
      if ((item.amount / chartTotal) >= 0.055) {
        labels.push(renderPieLabel(cx, cy, rx, ry, start + sweep / 2, item.percent));
      }
      start = end;
    });

    return [
      '<div class="salary-pie-stage' + (excess > 0 ? ' is-over-budget' : '') + '" role="img" aria-label="Particion del sueldo en diagrama de torta">',
      '<svg class="salary-pie-svg" viewBox="0 0 282 223" focusable="false" aria-hidden="true">',
      '<defs>',
      '<pattern id="salary-hatch-0" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)"><line x1="0" y1="0" x2="0" y2="9"></line></pattern>',
      '<pattern id="salary-hatch-1" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(0)"><line x1="0" y1="0" x2="0" y2="9"></line></pattern>',
      '<pattern id="salary-hatch-2" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><line x1="0" y1="0" x2="0" y2="9"></line><line x1="4.5" y1="0" x2="4.5" y2="9"></line></pattern>',
      '<pattern id="salary-hatch-3" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(90)"><line x1="0" y1="0" x2="0" y2="9"></line><line x1="0" y1="0" x2="9" y2="0"></line></pattern>',
      '<pattern id="salary-hatch-4" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="9"></line></pattern>',
      '<pattern id="salary-hatch-5" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="9"></line><line x1="4.5" y1="0" x2="4.5" y2="9"></line></pattern>',
      '</defs>',
      '<ellipse class="salary-pie-shadow" cx="' + cx + '" cy="' + (cy + depth + 12) + '" rx="' + (rx + 9) + '" ry="32"></ellipse>',
      '<g class="salary-pie-sides">' + sides.join('') + '</g>',
      '<g class="salary-pie-tops">' + tops.join('') + '</g>',
      labels.join(''),
      '</svg>',
      excess > 0 ? '<span class="salary-pie-over">EXCESO ' + utils.escapeHtml(utils.formatMoney(excess)) + '</span>' : '',
      '</div>'
    ].join('');
  }

  function salaryPartitionSegments(fixed, salary, available) {
    var segments = fixed.map(function (item, index) {
      var amount = utils.fixedExpenseAmount(item);
      return {
        label: utils.fixedExpenseName(item) || 'Gasto fijo',
        amount: amount,
        percent: salary ? Math.round((amount / salary) * 10000) / 100 : 0,
        className: 'segment-' + (index % 6)
      };
    }).filter(function (item) {
      return item.amount > 0;
    });
    if (available > 0) {
      segments.push({
        label: 'Disponible',
        amount: available,
        percent: salary ? Math.round((available / salary) * 10000) / 100 : 0,
        className: 'segment-available'
      });
    }
    if (!segments.length) {
      segments.push({
        label: 'Disponible',
        amount: salary || 1,
        percent: 100,
        className: 'segment-available'
      });
    }
    return segments;
  }

  function partitionPiePath(cx, cy, rx, ry, start, end, full) {
    if (full) {
      return [
        'M', svgNumber(cx - rx), svgNumber(cy),
        'A', svgNumber(rx), svgNumber(ry), '0 1 0', svgNumber(cx + rx), svgNumber(cy),
        'A', svgNumber(rx), svgNumber(ry), '0 1 0', svgNumber(cx - rx), svgNumber(cy),
        'Z'
      ].join(' ');
    }
    var first = ellipsePoint(cx, cy, rx, ry, start);
    var last = ellipsePoint(cx, cy, rx, ry, end);
    var largeArc = end - start > Math.PI ? 1 : 0;
    return [
      'M', svgNumber(cx), svgNumber(cy),
      'L', svgNumber(first.x), svgNumber(first.y),
      'A', svgNumber(rx), svgNumber(ry), '0', largeArc, '1', svgNumber(last.x), svgNumber(last.y),
      'Z'
    ].join(' ');
  }

  function salaryPieSidePath(cx, cy, rx, ry, depth, start, end) {
    var first = ellipsePoint(cx, cy, rx, ry, start);
    var last = ellipsePoint(cx, cy, rx, ry, end);
    var largeArc = end - start > Math.PI ? 1 : 0;
    return [
      'M', svgNumber(first.x), svgNumber(first.y),
      'A', svgNumber(rx), svgNumber(ry), '0', largeArc, '1', svgNumber(last.x), svgNumber(last.y),
      'L', svgNumber(last.x), svgNumber(last.y + depth),
      'A', svgNumber(rx), svgNumber(ry), '0', largeArc, '0', svgNumber(first.x), svgNumber(first.y + depth),
      'Z'
    ].join(' ');
  }

  function salaryPieFrontSidePieces(start, end) {
    var pieceStart = Math.max(start, 0);
    var pieceEnd = Math.min(end, Math.PI);
    if (pieceEnd - pieceStart <= 0.0001) {
      return [];
    }
    return [{ start: pieceStart, end: pieceEnd }];
  }

  function ellipsePoint(cx, cy, rx, ry, angle) {
    return {
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry
    };
  }

  function renderPieLabel(cx, cy, rx, ry, angle, percentValue) {
    var point = ellipsePoint(cx, cy, rx * 0.56, ry * 0.56, angle);
    var label = formatPercentInput(percentValue) || '0';
    return [
      '<rect class="salary-pie-label-bg" x="' + svgNumber(point.x - 17) + '" y="' + svgNumber(point.y - 8) + '" width="34" height="16"></rect>',
      '<text class="salary-pie-label" x="' + svgNumber(point.x) + '" y="' + svgNumber(point.y) + '">' + utils.escapeHtml(label) + '%</text>'
    ].join('');
  }

  function svgNumber(value) {
    return String(Math.round(Number(value || 0) * 100) / 100);
  }

  function renderSalaryPartitionLegend(fixed, salary, available, excess) {
    var items = fixed.map(function (item, index) {
      var amount = utils.fixedExpenseAmount(item);
      var percent = salary ? Math.round((utils.fixedExpenseAmount(item) / salary) * 10000) / 100 : 0;
      return '<li><i class="segment-' + (index % 6) + '"></i><span><strong>' + utils.escapeHtml(utils.fixedExpenseName(item) || 'Gasto fijo') + '</strong><small>' + utils.escapeHtml(utils.formatMoney(amount)) + '</small></span><b>' + utils.escapeHtml(formatPercentInput(percent) || '0') + '%</b></li>';
    });
    items.push('<li><i class="segment-available"></i><span><strong>Disponible</strong><small>' + utils.escapeHtml(utils.formatMoney(available)) + '</small></span><b>' + utils.escapeHtml(formatPercentInput(salary ? (available / salary) * 100 : 0) || '0') + '%</b></li>');
    if (excess > 0) {
      items.push('<li><i class="segment-excess"></i><span><strong>Exceso</strong><small>' + utils.escapeHtml(utils.formatMoney(excess)) + '</small></span><b>' + utils.escapeHtml(formatPercentInput((excess / salary) * 100) || '0') + '%</b></li>');
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

    utils.qsa('.js-movement-filter', root).forEach(function (button) {
      button.addEventListener('click', function () {
        window.FinanzasState.setState({ movementFilter: button.getAttribute('data-filter') || 'all' });
      });
    });

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
        window.FinanzasApp.convertWishlistInstant(button.getAttribute('data-id'));
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
      if (!isExpenseMovement(item) || utils.isFixedExpenseMovement(item) || movementMonth(item) !== month) {
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
