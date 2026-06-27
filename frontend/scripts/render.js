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
    if (sectionTitle) {
      sectionTitle.textContent = window.FinanzasRouter.currentLabel();
    }
    if (statusDate) {
      statusDate.textContent = utils.compactDate();
    }
    window.FinanzasRouter.syncNav();
  }

  function renderMissingConfig() {
    return [
      '<section class="system-window">',
      '<div class="window-title">CONFIGURACION</div>',
      '<p class="lcd-strong">Almacenamiento local no disponible.</p>',
      '<p>Reinicia la app o limpia almacenamiento local si el problema persiste.</p>',
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
      renderPostSalaryPanel(summary),
      '</article>',
      '<article class="summary-combined-card">',
      '<div class="summary-combined-spent">',
      '<span class="summary-combined-title">EN LO QUE VA DE ' + utils.escapeHtml(String(currentMonthName || '').toUpperCase()) + ' GASTASTE</span>',
      '<div class="summary-combined-divider"></div>',
      '<div class="summary-combined-amount">' + renderSummaryPixelSvg(utils.formatMoney(variableSpent), 'amount') + '</div>',
      '</div>',
      '<div class="summary-combined-divider"></div>',
      '<div class="summary-combined-top">',
      '<span class="summary-combined-top-label">EN LO QUE MAS GASTASTE FUE EN</span>',
      '<p class="summary-combined-top-line"><strong>' + utils.escapeHtml(top.motivo || 'Sin gastos') + '</strong></p>',
      '</div>',
      '</article>',
      '<article class="system-window availability-card availability-card-b">',
      '<div class="availability-b-title"><span>PLATA DISPONIBLE</span></div>',
      '<div class="available-line"><span>Te queda</span><strong class="available-money-pixel">' + renderSummaryPixelSvg(utils.formatMoney(summary.disponible || 0), 'amount') + '</strong></div>',
      renderMoneyLineDetails(summary),
      '<div class="availability-b-divider"></div>',
      renderProgressMeter(summary.porcentajeDisponible || 0, 'progress-large'),
      '<span class="summary-bottom-dot-shadow" aria-hidden="true"></span>',
      '</article>',
      renderSalaryPartition(config, summary),
      '</section>'
    ].join('');
  }

  function summaryDayLabel() {
    var days = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    return days[new Date().getDay()] || '';
  }

  function renderPostSalaryPanel(summary) {
    var pending = (summary || {}).recordatoriosPendientes || [];
    if (!(summary || {}).sueldoRegistrado || !pending.length) {
      return '';
    }
    var message = 'COBRO RECIENTE DETECTADO';
    var alertText = renderPostSalaryPixelText(message);
    return [
      '<div class="post-salary-panel">',
      '<div class="post-salary-alert" aria-label="' + utils.escapeHtml(message) + '">',
      '<div class="post-salary-marquee-track">',
      '<span class="post-salary-marquee-copy">' + alertText + '</span>',
      '<span class="post-salary-marquee-copy" aria-hidden="true">' + alertText + '</span>',
      '</div>',
      '</div>',
      '<div class="post-salary-list">',
      pending.map(renderPostSalaryItem).join(''),
      '</div>',
      '</div>'
    ].join('');
  }

  function renderPostSalaryPixelText(text) {
    var value = String(text || '').toUpperCase();
    var cell = 2.1;
    var gap = 0.75;
    var charGap = 2;
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
      '<svg class="post-salary-pixel-svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="xMinYMid meet" aria-hidden="true" focusable="false">',
      '<g class="post-salary-pixel-ghost">' + ghost.join('') + '</g>',
      '<g class="post-salary-pixel-active">' + active.join('') + '</g>',
      '</svg>'
    ].join('');
  }

  function renderPostSalaryItem(item) {
    var kind = String(item.tipo || '').toUpperCase();
    if (kind === 'AHORRO') {
      kind = 'FUTURO';
    }
    return [
      '<button class="post-salary-item js-pay-reminder" type="button"',
      ' data-reminder-type="' + utils.escapeHtml(item.tipoMovimiento || '') + '"',
      ' data-reminder-name="' + utils.escapeHtml(item.nombre || '') + '"',
      ' data-reminder-amount="' + utils.escapeHtml(item.monto || 0) + '"',
      ' data-reminder-related="' + utils.escapeHtml(item.idRelacionado || '') + '">',
      '<span class="post-salary-kind">' + utils.escapeHtml(kind || 'ITEM') + '</span>',
      '<strong>' + utils.escapeHtml(item.nombre || 'Pendiente') + '</strong>',
      '<b>' + utils.escapeHtml(utils.formatMoney(item.monto || 0)) + '</b>',
      '</button>'
    ].join('');
  }

  function renderMoneyLineDetails(summary) {
    var source = summary || {};
    return [
      '<div class="money-line-details">',
      '<span>Remanente anterior <b>' + utils.escapeHtml(utils.formatMoney(source.remanenteAnterior || 0)) + '</b></span>',
      '<span>Cobro del mes <b>' + utils.escapeHtml(utils.formatMoney(source.sueldoCobrado || 0)) + '</b></span>',
      '</div>'
    ].join('');
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
    '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
    'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    'B': ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    'C': ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
    'D': ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    'E': ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    'G': ['01111', '10000', '10000', '10011', '10001', '10001', '01111'],
    'H': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    'I': ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    'J': ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
    'L': ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    'M': ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    'N': ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    'O': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    'R': ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    'S': ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    'T': ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
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
    return [
      '<section class="movements-stack">',
      '<article class="movement-hero" aria-label="Movimientos">',
      '<div class="movement-title-pixel">' + renderSummaryPixelSvg('MOVIMIENTOS', 'movement-title') + '</div>',
      '<p class="movement-filter-status">' + utils.escapeHtml(movementFilterStatus(activeFilter, config, allMonths)) + '</p>',
      '</article>',
      '<section class="system-window movement-list-panel">',
      filteredMovements.length ? renderMovementTable(filteredMovements, allMonths) : '<p class="empty-state">No hay movimientos para este filtro.</p>',
      '</section>',
      '</section>'
    ].join('');
  }

  function movementFilterStatus(activeFilter, config, allMonths) {
    var filters = normalizeMovementFilters(activeFilter);
    if (filters.length) {
      return filters.map(function (value) {
        return movementFilterLabel(value);
      }).join(' + ');
    }
    return allMonths ? 'Todo' : 'Mes ' + movementMonthLabel((config || {}).mesActual || utils.currentMonth());
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

  function filterMovementsByType(movements, filter) {
    var groups = splitMovementFilters(filter);
    if (!groups.types.length && !groups.months.length) {
      return (movements || []).slice();
    }
    return (movements || []).filter(function (item) {
      var typeMatches = !groups.types.length || groups.types.some(function (activeFilter) {
        return matchesMovementFilter(item, activeFilter);
      });
      var monthMatches = !groups.months.length || groups.months.indexOf(movementMonth(item)) !== -1;
      return typeMatches && monthMatches;
    });
  }

  function normalizeMovementFilters(filter) {
    var values = Array.isArray(filter) ? filter : [filter || 'all'];
    var allowed = movementFilterOptions().map(function (option) {
      return option.value;
    });
    var seen = {};
    var result = [];
    values.forEach(function (value) {
      var clean = String(value || '').trim();
      if (!clean || clean === 'all' || seen[clean]) {
        return;
      }
      if (isMonthFilter(clean) || allowed.indexOf(clean) !== -1) {
        seen[clean] = true;
        result.push(clean);
      }
    });
    return result;
  }

  function splitMovementFilters(filter) {
    var groups = {
      types: [],
      months: []
    };
    normalizeMovementFilters(filter).forEach(function (value) {
      if (isMonthFilter(value)) {
        groups.months.push(value.slice(6, 13));
      } else {
        groups.types.push(value);
      }
    });
    return groups;
  }

  function movementFilterLabel(value) {
    if (isMonthFilter(value)) {
      return movementMonthLabel(value.slice(6, 13));
    }
    var option = movementFilterOptions().filter(function (candidate) {
      return candidate.value === value;
    })[0];
    return option ? option.label : 'Todo';
  }

  function isMonthFilter(value) {
    return /^month:\d{4}-\d{2}$/.test(String(value || ''));
  }

  function movementMonthLabel(value) {
    var names = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Sept', 'Oct', 'Nov', 'Dic'];
    var text = String(value || '');
    var index = Number(text.slice(5, 7)) - 1;
    var name = names[index] || text.slice(5, 7);
    return name + ' ' + text.slice(0, 4);
  }

  function matchesMovementFilter(item, filter) {
    var type = String((item || {}).tipo || '');
    if (!filter || filter === 'all') {
      return true;
    }
    if (isMonthFilter(filter)) {
      return movementMonth(item) === String(filter).slice(6, 13);
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
      var title = item.motivo || 'Movimiento';
      var kindLabel = movementKindLabel(item);
      return [
        '<article class="movement-row movement-card' + movementKindClass(item) + '">',
        '<span class="movement-kind-mark" aria-hidden="true"></span>',
        '<div class="movement-main">',
        '<div class="movement-card-top">',
        '<span class="movement-title-stack">',
        '<strong class="movement-title">' + utils.escapeHtml(title) + '</strong>',
        '<small class="movement-kind-label">' + utils.escapeHtml(kindLabel) + '</small>',
        '</span>',
        '<b class="movement-value">' + utils.escapeHtml(utils.formatMoney(item.monto)) + '</b>',
        '</div>',
        '<div class="movement-card-bottom">',
        '<small>' + utils.escapeHtml(meta) + '</small>',
        '</div>',
        '</div>',
        '<div class="movement-actions">',
        '<button class="tiny-key js-edit-movement" type="button" data-id="' + utils.escapeHtml(item.id) + '">EDIT</button>',
        '<button class="tiny-key js-delete-movement" type="button" data-id="' + utils.escapeHtml(item.id) + '">DEL</button>',
        '</div>',
        '</article>'
      ].join('');
    }).join('') + '</div>';
  }

  function movementKindClass(item) {
    var type = String((item || {}).tipo || '');
    if (type === 'Ingreso') {
      return ' movement-kind-income';
    }
    if (utils.isFixedExpenseMovement(item)) {
      return ' movement-kind-fixed';
    }
    if (type === 'Aporte a ahorro' || type === 'Aporte a meta') {
      return ' movement-kind-saving';
    }
    if (type === 'Compra de wishlist') {
      return ' movement-kind-wishlist';
    }
    return ' movement-kind-expense';
  }

  function movementKindLabel(item) {
    var type = String((item || {}).tipo || '');
    var motive = String((item || {}).motivo || '').trim().toLowerCase();
    if (type === 'Ingreso') {
      return motive === 'sueldo' ? 'Cobro de sueldo' : 'Ingreso';
    }
    if (utils.isFixedExpenseMovement(item)) {
      return 'Gasto fijo';
    }
    if (type === 'Aporte a ahorro') {
      return 'Ahorro futuro';
    }
    if (type === 'Aporte a meta') {
      return 'Ahorro meta';
    }
    if (type === 'Compra de wishlist') {
      return 'Cosa que quiero';
    }
    return 'Gasto corriente';
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
        '<article class="goal-card goal-card-mt1">',
        '<div class="goal-main-row">',
        '<div class="goal-left-stack">',
        '<div class="goal-copy">',
        '<strong>' + utils.escapeHtml(item.titulo) + '</strong>',
        '<p>' + utils.escapeHtml(item.descripcion || '') + '</p>',
        '</div>',
        '<div class="goal-money-row">',
        '<div class="goal-balance"><strong>' + utils.escapeHtml(utils.formatMoney(item.montoAcumulado)) + '</strong><span>acumulado de ' + utils.escapeHtml(utils.formatMoney(item.montoObjetivo)) + '</span></div>',
        '<div class="goal-monthly-panel"><span>Por mes</span><b>' + utils.escapeHtml(utils.formatMoney(item.montoMensual)) + '</b></div>',
        '</div>',
        '</div>',
        '<div class="goal-photo">' + renderPhotoCanvas(item) + '</div>',
        '</div>',
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
    var summary = state.data.resumen || {};
    var archive = state.data.archivo || [];
    return [
      '<section class="settings-stack">',
      '<form class="lcd-form settings-form" id="settings-form">',
      '<p class="form-error" hidden></p>',
      '<section class="system-window settings-card salary-settings-card">',
      '<div class="window-title"><span>SUELDO MENSUAL</span><span>MONTO</span></div>',
      '<div class="salary-config-panel">',
      '<label class="field"><span>Monto</span><input name="sueldoMensual" data-salary-input type="number" min="0" step="1" inputmode="numeric" value="' + utils.escapeHtml(config.sueldoMensual || 0) + '"></label>',
      '</div>',
      '</section>',
      renderFixedExpensesEditor(config, summary),
      '<div class="form-actions">',
      '<button class="lcd-button primary" type="submit">Guardar montos</button>',
      '</div>',
      '</form>',
      renderArchiveSection(archive),
      '</section>'
    ].join('');
  }

  function renderFixedExpensesEditor(config, summary) {
    var salary = utils.normalizeAmount((config || {}).sueldoMensual || 0);
    var plannedSavings = utils.normalizeAmount((summary || {}).ahorrosPlanificados || plannedSavingsFromSummary(summary));
    var items = utils.normalizeFixedExpenses((config || {}).gastosFijos || [], salary);
    return [
      '<section class="system-window settings-card fixed-expense-editor">',
      '<div class="window-title"><span>GASTOS FIJOS</span><span>MONTO/%</span></div>',
      '<div class="fixed-expense-list" data-fixed-list data-planned-savings="' + utils.escapeHtml(plannedSavings) + '">',
      (items.length ? items : [{ nombre: '', monto: 0, porcentajeSueldo: 0 }]).map(function (item, index) {
        return renderFixedExpenseRow(item, index, salary);
      }).join(''),
      '</div>',
      '<div class="fixed-expense-total" data-fixed-total></div>',
      '</section>'
    ].join('');
  }

  function renderFixedExpenseRow(item, index, salary) {
    var name = utils.fixedExpenseName(item);
    var amount = utils.fixedExpenseAmount(item);
    var percent = utils.fixedExpensePercent(item, salary);
    var percentValue = formatPercentRange(percent);
    return [
      '<article class="fixed-expense-row" data-fixed-row>',
      '<div class="fixed-expense-fields">',
      '<label class="field fixed-expense-name"><span>Nombre del gasto</span><input data-fixed-name name="gastoFijoNombre' + index + '" type="text" maxlength="80" value="' + utils.escapeHtml(name) + '" autocomplete="off"></label>',
      '<label class="field"><span>Monto mensual</span><input data-fixed-amount name="gastoFijoMonto' + index + '" type="number" min="0" step="1" inputmode="numeric" value="' + utils.escapeHtml(amount || '') + '"></label>',
      '<label class="field fixed-percent-control"><span>Porcentaje del sueldo</span>',
      '<span class="fixed-slider-shell">',
      '<input data-fixed-percent name="gastoFijoPorcentaje' + index + '" type="range" min="0" max="100" step="0.5" value="' + utils.escapeHtml(percentValue) + '">',
      '<b data-fixed-percent-display>' + utils.escapeHtml(percentValue) + '%</b>',
      '</span>',
      '<small class="fixed-limit-message" data-fixed-limit-message hidden></small>',
      '</label>',
      '</div>',
      '<div class="fixed-expense-actions">',
      '<button class="tiny-key js-remove-fixed-expense" type="button">Eliminar</button>',
      '</div>',
      '</article>'
    ].join('');
  }

  function formatPercentInput(value) {
    var number = Number(value || 0);
    return number ? String(Math.round(number * 100) / 100) : '';
  }

  function formatPercentLabel(value) {
    return formatPercentInput(value) || '0';
  }

  function parsePercentRange(value) {
    var number = Number(String(value === undefined || value === null || value === '' ? 0 : value).replace(',', '.'));
    if (!isFinite(number)) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round(number * 100) / 100));
  }

  function formatPercentRange(value) {
    return String(parsePercentRange(value));
  }

  function renderArchiveSection(items) {
    return [
      '<section class="system-window settings-card archive-settings-card">',
      '<div class="window-title"><span>PAPELERA</span><span>ARCHIVO</span></div>',
      '<div class="archive-list" data-archive-list>',
      renderArchiveItems(items || []),
      '</div>',
      '</section>'
    ].join('');
  }

  function renderArchiveItems(items) {
    if (!items || !items.length) {
      return '<p class="empty-state archive-empty">No hay metas ni cosas archivadas.</p>';
    }
    return items.map(function (item) {
      var type = item.tipo === 'wishlist' ? 'wishlist' : 'meta';
      var title = item.titulo || (type === 'wishlist' ? 'Cosa que quiero' : 'Meta');
      var amount = item.montoObjetivo || item.costoAproximado || item.montoAcumulado || 0;
      return [
        '<article class="archive-item">',
        '<div class="archive-copy">',
        '<span class="archive-badge">' + utils.escapeHtml(item.motivoArchivo || archiveReason(item)) + '</span>',
        '<strong>' + utils.escapeHtml(title) + '</strong>',
        amount ? '<small>' + utils.escapeHtml(utils.formatMoney(amount)) + '</small>' : '',
        '</div>',
        '<button class="tiny-key js-restore-archive" type="button" data-archive-type="' + utils.escapeHtml(type) + '" data-id="' + utils.escapeHtml(item.id || '') + '">Recuperar</button>',
        '</article>'
      ].join('');
    }).join('');
  }

  function archiveReason(item) {
    var status = String((item || {}).estado || '').toLowerCase();
    if ((item || {}).tipo === 'wishlist') {
      if (status === 'comprado') {
        return 'Cumplida';
      }
      if (status === 'convertido') {
        return 'Convertida';
      }
      return 'Borrada';
    }
    if ((item || {}).cumplida) {
      return 'Cumplida';
    }
    return 'Borrada';
  }

  function renderSalaryPartition(config, summary) {
    var salary = utils.normalizeAmount((config || {}).sueldoMensual || 0);
    var partition = salaryPartitionFromSummary(summary, config);
    var total = partition.reduce(function (sum, item) {
      return sum + item.amount;
    }, 0);
    var excess = Math.max(0, utils.normalizeAmount((summary || {}).excesoParticion || 0));
    var superfluous = utils.normalizeAmount((summary || {}).superfluosPlanificados || 0);
    var superfluousPercent = salary ? Math.round((superfluous / salary) * 10000) / 100 : 0;
    var titleBadge = excess > 0 ? 'EXCESO' : 'DISP. ' + (formatPercentInput(superfluousPercent) || '0') + '%';

    return [
      '<article class="system-window salary-partition-card salary-partition-aaa' + (excess > 0 ? ' is-over-budget' : '') + '">',
      '<div class="window-title salary-partition-heading"><span>PARTICION SUELDO</span><span>' + utils.escapeHtml(titleBadge) + '</span></div>',
      salary ? '<div class="partition-summary partition-summary-top"><span>Sueldo distribuido</span><b>' + utils.escapeHtml(utils.formatMoney(salary)) + '</b></div>' : '',
      excess > 0 ? '<p class="partition-warning">Exceso: ' + utils.escapeHtml(utils.formatMoney(excess)) + '</p>' : '',
      salary ? renderSalaryPartitionPie(partition, salary, total, excess) : '<p class="empty-state">Carga tu sueldo mensual para ver la particion.</p>',
      salary ? renderSalaryPartitionLegend(partition, salary, excess) : '',
      '<span class="summary-bottom-dot-shadow" aria-hidden="true"></span>',
      '</article>'
    ].join('');
  }

  function salaryPartitionFromSummary(summary, config) {
    var salary = utils.normalizeAmount((config || {}).sueldoMensual || 0);
    var fixed = utils.normalizeAmount((summary || {}).gastosFijosConfigurados);
    var savings = utils.normalizeAmount((summary || {}).ahorrosPlanificados);
    var superfluous = utils.normalizeAmount((summary || {}).superfluosPlanificados);
    if (!fixed) {
      fixed = utils.normalizeFixedExpenses((config || {}).gastosFijos || [], salary).reduce(function (sum, item) {
        return sum + utils.fixedExpenseAmount(item);
      }, 0);
    }
    if (!savings) {
      savings = plannedSavingsFromSummary(summary);
    }
    if (!superfluous) {
      superfluous = Math.max(0, salary - fixed - savings);
    }
    return [
      { label: 'Gastos fijos', amount: fixed, className: 'segment-0' },
      { label: 'Ahorros', amount: savings, className: 'segment-1' },
      { label: 'Disponible', amount: superfluous, className: 'segment-available' }
    ].filter(function (item) {
      return item.amount > 0;
    });
  }

  function plannedSavingsFromSummary(summary) {
    var source = summary || {};
    var total = 0;
    (source.ahorrosFuturo || []).forEach(function (item) {
      total += utils.normalizeAmount(item.montoMensual);
    });
    (source.metas || []).forEach(function (item) {
      total += utils.normalizeAmount(item.montoMensual);
    });
    return total;
  }

  function renderSalaryPartitionPie(segments, salary, total, excess) {
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

  function renderSalaryPartitionLegend(segments, salary, excess) {
    var items = (segments || []).map(function (item) {
      var amount = utils.normalizeAmount(item.amount);
      var percent = salary ? Math.round((amount / salary) * 10000) / 100 : 0;
      return '<li><i class="' + utils.escapeHtml(item.className || 'segment-0') + '"></i><span><strong>' + utils.escapeHtml(item.label || 'Particion') + '</strong><small>' + utils.escapeHtml(utils.formatMoney(amount)) + '</small></span><b>' + utils.escapeHtml(formatPercentInput(percent) || '0') + '%</b></li>';
    });
    if (excess > 0) {
      items.push('<li><i class="segment-excess"></i><span><strong>Exceso</strong><small>' + utils.escapeHtml(utils.formatMoney(excess)) + '</small></span><b>' + utils.escapeHtml(formatPercentInput((excess / salary) * 100) || '0') + '%</b></li>');
    }
    return '<ul class="partition-legend">' + items.join('') + '</ul>';
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

    utils.qsa('.js-pay-reminder', root).forEach(function (button) {
      button.addEventListener('click', function () {
        var type = button.getAttribute('data-reminder-type') || 'Gasto';
        var name = button.getAttribute('data-reminder-name') || '';
        var amount = button.getAttribute('data-reminder-amount') || '';
        var related = button.getAttribute('data-reminder-related') || '';
        window.FinanzasForms.openMovementForm('Gasto', null, {
          tipo: type,
          motivo: name,
          monto: amount,
          idRelacionado: related,
          categoria: type === 'Gasto fijo' ? 'Gasto fijo' : (type === 'Aporte a meta' ? 'Metas' : 'Ahorros'),
          descripcion: type === 'Gasto fijo' ? 'Gasto fijo' : 'Reparto post-cobro'
        });
      });
    });

    var refresh = utils.qs('.js-refresh', root);
    if (refresh) {
      refresh.addEventListener('click', window.FinanzasApp.refresh);
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
      if (updateFixedTotal(form) === false) {
        errorBox.textContent = 'Los fijos y ahorros superan el 100% del sueldo.';
        errorBox.hidden = false;
        return;
      }
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
    bindArchive(root);
  }

  function bindFixedExpenseEditor(form) {
    var list = utils.qs('[data-fixed-list]', form);
    var salaryInput = utils.qs('[data-salary-input]', form);
    if (!list || !salaryInput) {
      return;
    }

    function salary() {
      return utils.normalizeAmount(salaryInput.value);
    }

    function plannedSavings() {
      return utils.normalizeAmount(list.getAttribute('data-planned-savings') || 0);
    }

    function otherFixedTotal(row) {
      return utils.qsa('[data-fixed-row]', list).reduce(function (sum, item) {
        if (item === row) {
          return sum;
        }
        return sum + utils.normalizeAmount((utils.qs('[data-fixed-amount]', item) || {}).value);
      }, 0);
    }

    function maxAmountForRow(row) {
      var sueldo = salary();
      if (!sueldo) {
        return 0;
      }
      return Math.max(0, sueldo - plannedSavings() - otherFixedTotal(row));
    }

    function updateRowLimit(row) {
      var sueldo = salary();
      var amountInput = utils.qs('[data-fixed-amount]', row);
      var percentInput = utils.qs('[data-fixed-percent]', row);
      var message = utils.qs('[data-fixed-limit-message]', row);
      var maxAmount = maxAmountForRow(row);
      var maxPercent = sueldo ? Math.round((maxAmount / sueldo) * 10000) / 100 : 0;
      var amount = utils.normalizeAmount((amountInput || {}).value);
      var clamped = sueldo && amount > maxAmount;
      if (amountInput && clamped) {
        amountInput.value = maxAmount ? String(maxAmount) : '';
        amount = maxAmount;
      }
      if (percentInput) {
        percentInput.max = '100';
        percentInput.setAttribute('data-fixed-max-percent', formatPercentLabel(maxPercent));
        percentInput.value = formatPercentRange(sueldo ? (amount / sueldo) * 100 : 0);
      }
      updatePercentSlider(row);
      if (message) {
        message.hidden = !clamped;
        message.textContent = clamped
          ? 'Limite disponible: ' + utils.formatMoney(maxAmount)
          : '';
      }
      return !clamped;
    }

    function enforceBudgetLimits() {
      utils.qsa('[data-fixed-row]', list).forEach(updateRowLimit);
      return updateFixedTotal(form);
    }

    function bindRow(row) {
      var nameInput = utils.qs('[data-fixed-name]', row);
      var amountInput = utils.qs('[data-fixed-amount]', row);
      var percentInput = utils.qs('[data-fixed-percent]', row);
      var removeButton = utils.qs('.js-remove-fixed-expense', row);

      amountInput.addEventListener('input', function () {
        var sueldo = salary();
        percentInput.value = formatPercentRange(sueldo ? (utils.normalizeAmount(amountInput.value) / sueldo) * 100 : 0);
        updateRowLimit(row);
        updateFixedTotal(form);
      });
      percentInput.addEventListener('input', function () {
        var sueldo = salary();
        var percent = parsePercentRange(percentInput.value);
        percentInput.value = formatPercentRange(percent);
        if (sueldo) {
          amountInput.value = String(Math.round(percent * sueldo / 100));
        } else {
          amountInput.value = '';
        }
        updateRowLimit(row);
        updateFixedTotal(form);
      });
      nameInput.addEventListener('input', function () {
        updateFixedTotal(form);
      });
      removeButton.addEventListener('click', function () {
        row.parentNode.removeChild(row);
        if (!utils.qsa('[data-fixed-row]', list).length) {
          list.insertAdjacentHTML('beforeend', renderFixedExpenseRow({}, 0, salary()));
          bindRow(utils.qs('[data-fixed-row]:last-child', list));
        }
        enforceBudgetLimits();
      });
    }

    utils.qsa('[data-fixed-row]', list).forEach(bindRow);
    salaryInput.addEventListener('input', function () {
      utils.qsa('[data-fixed-row]', list).forEach(function (row) {
        var amountInput = utils.qs('[data-fixed-amount]', row);
        var percentInput = utils.qs('[data-fixed-percent]', row);
        percentInput.value = formatPercentRange(salary() ? (utils.normalizeAmount(amountInput.value) / salary()) * 100 : 0);
        updatePercentSlider(row);
      });
      enforceBudgetLimits();
    });
    enforceBudgetLimits();
  }

  function updatePercentSlider(row) {
    var percentInput = utils.qs('[data-fixed-percent]', row);
    var display = utils.qs('[data-fixed-percent-display]', row);
    var percent = parsePercentRange((percentInput || {}).value);
    if (percentInput) {
      percentInput.value = formatPercentRange(percent);
    }
    if (display) {
      display.textContent = formatPercentLabel(percent) + '%';
    }
  }

  function bindArchive(root) {
    var list = utils.qs('[data-archive-list]', root);
    if (!list) {
      return;
    }

    function render(items) {
      list.innerHTML = renderArchiveItems(items || []);
    }

    function loadArchive() {
      if (!window.FinanzasApi || !window.FinanzasApi.request) {
        return Promise.resolve();
      }
      return window.FinanzasApi.request('getArchive', {})
        .then(render)
        .catch(function () {
          return null;
        });
    }

    list.addEventListener('click', function (event) {
      var button = event.target.closest ? event.target.closest('.js-restore-archive') : null;
      if (!button || !list.contains(button)) {
        return;
      }
      button.disabled = true;
      window.FinanzasApp.mutate('restoreArchiveItem', {
        tipo: button.getAttribute('data-archive-type') || '',
        id: button.getAttribute('data-id') || ''
      })
        .then(loadArchive)
        .catch(function () {
          button.disabled = false;
        });
    });

    loadArchive();
  }

  function collectFixedExpenses(root, salary) {
    return utils.qsa('[data-fixed-row]', root).map(function (row) {
      var name = String((utils.qs('[data-fixed-name]', row) || {}).value || '').trim();
      var amount = utils.normalizeAmount((utils.qs('[data-fixed-amount]', row) || {}).value);
      var percent = parsePercentRange((utils.qs('[data-fixed-percent]', row) || {}).value);
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
    var list = utils.qs('[data-fixed-list]', root);
    var plannedSavings = utils.normalizeAmount((list || {}).getAttribute ? list.getAttribute('data-planned-savings') : 0);
    var items = collectFixedExpenses(root, salary);
    var total = items.reduce(function (sum, item) {
      return sum + utils.normalizeAmount(item.monto);
    }, 0);
    var percent = salary ? Math.round((total / salary) * 10000) / 100 : 0;
    var availableAfterFixed = Math.max(0, salary - total - plannedSavings);
    var overBudget = Boolean(salary && total + plannedSavings > salary);
    var detail = salary
      ? (overBudget
        ? 'Excede por ' + utils.formatMoney(total + plannedSavings - salary) + ' contando ahorros'
        : (formatPercentInput(percent) || '0') + '% del sueldo - Disponible tras fijos y ahorros ' + utils.formatMoney(availableAfterFixed))
      : 'Carga el sueldo para calcular disponible';
    var box = utils.qs('[data-fixed-total]', root);
    if (box) {
      box.innerHTML = '<span>Total fijo</span><strong>' + utils.escapeHtml(utils.formatMoney(total)) + '</strong><small>' + utils.escapeHtml(detail) + '</small>';
      box.className = 'fixed-expense-total' + (overBudget ? ' is-over-budget' : '');
    }
    return !overBudget;
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
