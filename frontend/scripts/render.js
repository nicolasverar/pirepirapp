(function () {
  'use strict';

  var utils = window.FinanzasUtils;
  var FUTURE_PREFS_KEY = 'finanzasFutureSavingsPrefs';
  var MOTIVE_SIMILARITY_THRESHOLD = 0.8;
  var salaryPartitionOpenGroups = {};
  var salaryPartitionSavingNode = 'summary';

  function render() {
    var state = window.FinanzasState.getState();
    updateChrome(state);
    var screen = utils.qs('#app-screen');
    if (!screen) {
      return;
    }
    if (window.FinanzasOnboarding && window.FinanzasOnboarding.isActive && window.FinanzasOnboarding.isActive()) {
      window.FinanzasOnboarding.render();
      return;
    }
    screen.classList.toggle('is-summary-screen', state.currentView !== 'gastos' && state.currentView !== 'metas' && state.currentView !== 'configuracion');

    if (!window.FinanzasApi.hasBackend()) {
      screen.innerHTML = renderMissingConfig();
      bindRenderedActions(screen);
      return;
    }

    if (state.loading && !state.data.resumen) {
      screen.innerHTML = '<section class="system-window"><div class="window-title">CARGANDO</div><p class="lcd-muted">Leyendo datos locales...</p></section>';
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
      '<div class="availability-b-divider"></div>',
      renderProgressMeter(summary.porcentajeDisponible || 0, 'progress-large'),
      '<span class="summary-bottom-dot-shadow" aria-hidden="true"></span>',
      '</article>',
      renderSalaryPartition(config, summary, state.data),
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
    if (!groups.types.length && !groups.range) {
      return (movements || []).slice();
    }
    return (movements || []).filter(function (item) {
      var typeMatches = !groups.types.length || groups.types.some(function (activeFilter) {
        return matchesMovementFilter(item, activeFilter);
      });
      var month = movementMonth(item);
      var monthMatches = !groups.range || (month >= groups.range.from && month <= groups.range.to);
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
      if (isMonthFilter(clean) || isRangeFilter(clean) || allowed.indexOf(clean) !== -1) {
        seen[clean] = true;
        result.push(clean);
      }
    });
    return result;
  }

  function splitMovementFilters(filter) {
    var groups = {
      types: [],
      range: null
    };
    var months = [];
    normalizeMovementFilters(filter).forEach(function (value) {
      if (isMonthFilter(value)) {
        months.push(value.slice(6, 13));
      } else if (isRangeFilter(value)) {
        groups.range = parseRangeFilter(value);
      } else {
        groups.types.push(value);
      }
    });
    if (!groups.range && months.length) {
      months.sort();
      groups.range = {
        from: months[0],
        to: months[months.length - 1]
      };
    }
    return groups;
  }

  function movementFilterLabel(value) {
    var range;
    if (isRangeFilter(value)) {
      range = parseRangeFilter(value);
      if (!range) {
        return 'Meses';
      }
      if (range.from === range.to) {
        return movementMonthLabel(range.from);
      }
      return movementMonthLabel(range.from) + ' - ' + movementMonthLabel(range.to);
    }
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

  function isRangeFilter(value) {
    return /^range:\d{4}-\d{2}\.\.\d{4}-\d{2}$/.test(String(value || ''));
  }

  function parseRangeFilter(value) {
    var match = /^range:(\d{4}-\d{2})\.\.(\d{4}-\d{2})$/.exec(String(value || ''));
    var from;
    var to;
    if (!match) {
      return null;
    }
    from = match[1];
    to = match[2];
    if (from > to) {
      return { from: to, to: from };
    }
    return { from: from, to: to };
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
    if (isRangeFilter(filter)) {
      var range = parseRangeFilter(filter);
      var month = movementMonth(item);
      return Boolean(range && month >= range.from && month <= range.to);
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
      '</form>',
      renderFixedExpensesList(config, summary),
      renderSettingsUpdateAction(),
      renderLocalBackupAction(),
      renderArchiveSection(archive),
      '</section>'
    ].join('');
  }

  function renderSettingsUpdateAction() {
    return [
      '<div class="settings-update-actions">',
      '<button class="lcd-button primary" type="submit" form="settings-form">Actualizar app</button>',
      '</div>'
    ].join('');
  }

  function renderLocalBackupAction() {
    return [
      '<section class="system-window settings-card local-backup-card">',
      '<div class="window-title"><span>BACKUP LOCAL</span><span>JSON</span></div>',
      '<p>Guarda una copia completa del dispositivo o restaura una copia anterior.</p>',
      '<div class="local-backup-actions">',
      '<button class="lcd-button primary" type="button" data-export-local-backup>Exportar backup</button>',
      '<button class="lcd-button" type="button" data-import-local-backup>Importar backup</button>',
      '</div>',
      '</section>'
    ].join('');
  }

  function renderFixedExpensesList(config, summary) {
    var salary = utils.normalizeAmount((config || {}).sueldoMensual || 0);
    var plannedSavings = utils.normalizeAmount((summary || {}).ahorrosPlanificados || plannedSavingsFromSummary(summary));
    var items = utils.normalizeFixedExpenses((config || {}).gastosFijos || [], salary);
    return [
      '<section class="system-window settings-card fixed-expense-list-card">',
      '<div class="window-title"><span>GASTOS FIJOS</span><span>MONTO/%</span></div>',
      '<div class="fixed-expense-cards" data-fixed-card-list>',
      (items.length ? items.map(function (item, index) {
        return renderFixedExpenseCard(item, index, salary);
      }).join('') : '<p class="fixed-expense-empty">Todavia no cargaste gastos fijos.</p>'),
      '</div>',
      renderFixedExpenseTotal(items, salary, plannedSavings),
      '</section>'
    ].join('');
  }

  function renderFixedExpenseCard(item, index, salary) {
    var name = utils.fixedExpenseName(item);
    var amount = utils.fixedExpenseAmount(item);
    var percent = utils.fixedExpensePercent(item, salary);
    return [
      '<article class="fixed-expense-card">',
      '<strong class="fixed-expense-card-name">' + utils.escapeHtml(name || 'Gasto fijo') + '</strong>',
      '<div class="fixed-expense-card-line">',
      '<span><b>' + utils.escapeHtml(formatPercentInput(percent) || '0') + '%</b> del sueldo</span>',
      '<strong>' + utils.escapeHtml(utils.formatMoney(amount)) + '</strong>',
      '</div>',
      '<div class="fixed-expense-card-actions">',
      '<button class="tiny-key js-edit-fixed-expense-card" type="button" data-fixed-index="' + utils.escapeHtml(index) + '">Editar</button>',
      '<button class="tiny-key js-remove-fixed-expense-card" type="button" data-fixed-index="' + utils.escapeHtml(index) + '">Eliminar</button>',
      '</div>',
      '</article>'
    ].join('');
  }

  function renderFixedExpenseTotal(items, salary, plannedSavings) {
    var total = (items || []).reduce(function (sum, item) {
      return sum + utils.fixedExpenseAmount(item);
    }, 0);
    var percent = salary ? Math.round((total / salary) * 10000) / 100 : 0;
    var availableAfterFixed = Math.max(0, salary - total - plannedSavings);
    var overBudget = Boolean(salary && total + plannedSavings > salary);
    var availableLabel = overBudget ? 'Exceso tras fijos y ahorros' : 'Disponible tras fijos y ahorros';
    var availableValue = overBudget ? (total + plannedSavings - salary) : availableAfterFixed;
    return [
      '<div class="fixed-expense-total' + (overBudget ? ' is-over-budget' : '') + '">',
      '<span class="fixed-expense-total-label">Total fijo</span>',
      '<strong class="fixed-expense-total-amount">' + utils.escapeHtml(utils.formatMoney(total)) + '</strong>',
      '<small class="fixed-expense-total-percent">' + utils.escapeHtml((formatPercentInput(percent) || '0') + '% del sueldo') + '</small>',
      '<small class="fixed-expense-total-available"><span>' + utils.escapeHtml(availableLabel) + '</span><b>' + utils.escapeHtml(utils.formatMoney(availableValue)) + '</b></small>',
      '</div>'
    ].join('');
  }

  function formatPercentInput(value) {
    var number = Number(value || 0);
    return number ? String(Math.round(number * 100) / 100) : '';
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

  function renderSalaryPartition(config, summary, data) {
    var model = salaryPartitionB1Model(config, summary, data);
    var salary = model.salary;

    return [
      '<article class="system-window salary-partition-card salary-partition-aaa' + (model.excess > 0 ? ' is-over-budget' : '') + '">',
      '<div class="window-title salary-partition-heading"><span>PARTICION SUELDO</span></div>',
      salary ? '<div class="partition-summary partition-summary-top"><span>Sueldo distribuido</span><b>' + utils.escapeHtml(utils.formatMoney(salary)) + '</b></div>' : '',
      model.excess > 0 ? '<p class="partition-warning">Exceso: ' + utils.escapeHtml(utils.formatMoney(model.excess)) + '</p>' : '',
      salary ? renderSalaryPartitionPie2D(model) : '<p class="empty-state">Carga tu sueldo mensual para ver la particion.</p>',
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

  function salaryPartitionB1Model(config, summary, data) {
    var source = data || {};
    var salary = utils.normalizeAmount((config || {}).sueldoMensual || (summary || {}).sueldoMensual || 0);
    var fixedItems = utils.normalizeFixedExpenses((config || {}).gastosFijos || [], salary).map(function (item, index) {
      return {
        label: utils.fixedExpenseName(item) || 'Gasto fijo',
        group: 'fixed',
        amount: utils.fixedExpenseAmount(item),
        index: index
      };
    }).filter(partitionNonZero);
    var fixedTotal = fixedItems.reduce(partitionSum, 0);
    var fallbackFixed = utils.normalizeAmount((summary || {}).gastosFijosConfigurados);
    if (!fixedTotal && fallbackFixed > 0) {
      fixedTotal = fallbackFixed;
      fixedItems = [{ label: 'Gastos fijos', group: 'fixed', amount: fallbackFixed, index: 0 }];
    }

    var futureItems = partitionActiveItems((summary || {}).ahorrosFuturo || source.ahorrosFuturo).map(function (item, index) {
      return {
        label: item.titulo || item.nombre || 'Futuro',
        group: 'saving-future',
        amount: utils.normalizeAmount(item.montoMensual),
        index: index
      };
    }).filter(partitionNonZero);
    var goalItems = partitionActiveItems((summary || {}).metas || source.metas).map(function (item, index) {
      return {
        label: item.titulo || item.nombre || 'Meta',
        group: 'saving-goal',
        amount: utils.normalizeAmount(item.montoMensual),
        index: index
      };
    }).filter(partitionNonZero);
    var savingsTotal = futureItems.concat(goalItems).reduce(partitionSum, 0);
    var fallbackSavings = utils.normalizeAmount((summary || {}).ahorrosPlanificados);
    if (!savingsTotal && fallbackSavings > 0) {
      savingsTotal = fallbackSavings;
      futureItems = [{ label: 'Ahorros', group: 'saving-future', amount: fallbackSavings, index: 0 }];
    }

    return {
      salary: salary,
      fixedItems: fixedItems,
      fixedTotal: fixedTotal,
      futureItems: futureItems,
      goalItems: goalItems,
      savingsTotal: savingsTotal,
      available: Math.max(0, salary - fixedTotal - savingsTotal),
      excess: Math.max(0, fixedTotal + savingsTotal - salary),
      scale: Math.max(salary, fixedTotal + savingsTotal, 1)
    };
  }

  function partitionActiveItems(items) {
    return (items || []).filter(function (item) {
      return !item.estado || String(item.estado).toLowerCase() === 'activo';
    });
  }

  function partitionNonZero(item) {
    return utils.normalizeAmount((item || {}).amount) > 0;
  }

  function partitionSum(sum, item) {
    return sum + utils.normalizeAmount((item || {}).amount);
  }

  function salaryPartitionB1Groups(model) {
    return [
      {
        label: 'Gastos fijos',
        group: 'fixed',
        amount: model.fixedTotal,
        color: '#7f8f5b',
        children: model.fixedItems
      },
      {
        label: 'Ahorros/metas',
        group: 'saving',
        amount: model.savingsTotal,
        color: '#b7c982',
        children: model.futureItems.concat(model.goalItems)
      },
      {
        label: 'Disponible',
        group: 'available',
        amount: model.available,
        color: '#24351f',
        children: []
      },
      {
        label: 'Exceso',
        group: 'excess',
        amount: model.excess,
        color: '#b7615f',
        children: [{ label: 'Exceso', group: 'excess', amount: model.excess }]
      }
    ].filter(partitionNonZero);
  }

  function renderSalaryPartitionPie2D(model) {
    var groups = salaryPartitionB1Groups(model);
    return [
      '<div class="salary-pie2d-stage" data-salary-partition-pie>',
      '<div class="salary-pie2d-chart">',
      renderSalaryPie2dSvg(groups, model),
      '</div>',
      renderSalaryPie2dBottom(model, groups),
      '</div>'
    ].join('');
  }

  function renderSalaryPie2dSvg(groups, model) {
    var cx = 160;
    var cy = 130;
    var radius = 126;
    var start = -90;
    var callouts = [];
    var pieces = groups.map(function (group) {
      var sweep = (group.amount / model.scale) * 360;
      var end = start + sweep;
      var html = isSalaryB1GroupOpen(group.group) && canSalaryB1DrillGroup(group)
        ? renderSalaryPie2dSubSlices(group, model, cx, cy, radius, start, end, callouts)
        : renderSalaryPie2dSlice(group, model, cx, cy, radius, start, end, false, null, callouts);
      start = end;
      return html;
    }).join('');
    return [
      '<svg class="salary-pie2d-svg" viewBox="-42 -8 404 304" role="img" aria-label="Torta 2D interactiva de particion del sueldo">',
      '<circle class="salary-pie2d-shadow" cx="160" cy="134" r="128"></circle>',
      pieces,
      '<circle class="salary-pie2d-rim" cx="160" cy="130" r="' + radius + '"></circle>',
      renderSalaryPie2dCallouts(callouts),
      '<circle class="salary-pie2d-center" cx="160" cy="130" r="34"></circle>',
      '</svg>'
    ].join('');
  }

  function renderSalaryPie2dSubSlices(group, model, cx, cy, radius, startAngle, endAngle, callouts) {
    var cursor = startAngle;
    return salaryB1ChildrenForGroup(group, model).map(function (item, index) {
      var sweep = group.amount ? ((item.amount / group.amount) * (endAngle - startAngle)) : 0;
      var end = cursor + sweep;
      var child = Object.assign({}, item, {
        color: salaryPie2dColor(item.group || group.group, index)
      });
      var html = renderSalaryPie2dSlice(child, model, cx, cy, radius, cursor, end, true, group.group, callouts);
      cursor = end;
      return html;
    }).join('');
  }

  function renderSalaryPie2dSlice(item, model, cx, cy, radius, startAngle, endAngle, nested, ownerGroup, callouts) {
    var sweep = endAngle - startAngle;
    var path = salaryPie2dPath(cx, cy, radius, startAngle, endAngle);
    var mid = startAngle + (sweep / 2);
    var labelPoint = salaryPie2dPolar(cx, cy, nested ? radius * 0.68 : radius * 0.62, mid);
    var tightClass = sweep < 22 ? ' is-tight' : '';
    var labelHtml = renderSalaryPie2dInsidePct(item, model, labelPoint, sweep, nested);
    var action = salaryPie2dAttrs(item, ownerGroup);
    addSalaryPie2dCallout(callouts, item, model, cx, cy, radius, mid, sweep, nested);
    return [
      '<g class="salary-pie2d-part' + (nested ? ' is-nested' : ' is-macro') + tightClass + ' is-' + utils.escapeHtml(item.group) + '" ' + action + '>',
      '<path class="salary-pie2d-slice" d="' + path + '" style="' + cssVars({ '--c': item.color || salaryPie2dColor(item.group, 0) }) + '"></path>',
      labelHtml,
      '</g>'
    ].join('');
  }

  function renderSalaryPie2dInsidePct(item, model, point, sweep, nested) {
    var text = salaryPartitionPctLabel(item.amount, model.salary);
    var width = Math.max(30, Math.min(58, (text.length * 6) + 12));
    if (nested && sweep < 9) {
      return '';
    }
    return [
      '<rect class="salary-pie2d-label-box" x="' + salaryPie2dNum(point.x - (width / 2)) + '" y="' + salaryPie2dNum(point.y - 8) + '" width="' + salaryPie2dNum(width) + '" height="16"></rect>',
      '<text class="salary-pie2d-label" x="' + salaryPie2dNum(point.x) + '" y="' + salaryPie2dNum(point.y) + '">' + utils.escapeHtml(text) + '</text>'
    ].join('');
  }

  function salaryPie2dAttrs(item, ownerGroup) {
    if (item.drillNode === 'metas') {
      return 'data-salary-partition-saving-node="metas"';
    }
    if (item.drillNode === 'collapse') {
      return 'data-salary-partition-saving-node="summary"';
    }
    if (ownerGroup === 'fixed') {
      return 'data-salary-partition-child-group="fixed"';
    }
    if (ownerGroup === 'saving') {
      return 'data-salary-partition-child-group="saving"';
    }
    if (item.group === 'excess') {
      return '';
    }
    return 'data-salary-partition-group="' + utils.escapeHtml(item.group) + '"';
  }

  function addSalaryPie2dCallout(callouts, item, model, cx, cy, radius, midAngle, sweep, nested) {
    var principal = !nested && ['fixed', 'saving', 'available', 'excess'].indexOf(item.group) !== -1;
    var shouldShow = (principal && item.amount > 0 && sweep >= 8) || (nested && sweep >= 8);
    var placement;
    if (!shouldShow || !callouts) {
      return;
    }
    placement = salaryPie2dCalloutPlacement(cx, cy, radius, midAngle, nested);
    callouts.push({
      side: placement.side,
      y: placement.y,
      anchor: placement.anchor,
      elbowX: placement.elbowX,
      labelX: placement.labelX,
      group: item.group,
      label: salaryPie2dCalloutText(item, model, nested)
    });
  }

  function salaryPie2dCalloutPlacement(cx, cy, radius, midAngle, nested) {
    var anchor = salaryPie2dPolar(cx, cy, radius + 2, midAngle);
    var elbow = salaryPie2dPolar(cx, cy, radius + (nested ? 18 : 24), midAngle);
    var side = elbow.x >= cx ? 'right' : 'left';
    var gap = nested ? 12 : 18;
    return {
      side: side,
      y: Math.max(10, Math.min(286, elbow.y)),
      anchor: anchor,
      elbowX: elbow.x,
      labelX: side === 'right' ? elbow.x + gap : elbow.x - gap
    };
  }

  function salaryPie2dCalloutText(item, model, nested) {
    var label = salaryPie2dShortLabel(item.label, item.group);
    if (!nested && item.group === 'fixed') {
      label = 'FIJOS';
    } else if (!nested && item.group === 'saving') {
      label = 'AHORROS';
    } else if (!nested && item.group === 'available') {
      label = 'DISP.';
    }
    return label + ' ' + salaryPartitionPctLabel(item.amount, model.salary);
  }

  function renderSalaryPie2dCallouts(callouts) {
    var rows = normalizeSalaryPie2dCallouts(callouts);
    if (!rows.length) {
      return '';
    }
    return [
      '<g class="salary-pie2d-callouts">',
      rows.map(function (row) {
        var elbowX = row.elbowX;
        var labelX = salaryPie2dCalloutLabelX(row);
        var anchor = row.side === 'right' ? 'start' : 'end';
        return [
          '<polyline class="salary-pie2d-callout-line is-' + utils.escapeHtml(row.group) + '" points="' + salaryPie2dNum(row.anchor.x) + ',' + salaryPie2dNum(row.anchor.y) + ' ' + salaryPie2dNum(elbowX) + ',' + salaryPie2dNum(row.y) + ' ' + salaryPie2dNum(labelX) + ',' + salaryPie2dNum(row.y) + '"></polyline>',
          '<text class="salary-pie2d-callout-text is-' + utils.escapeHtml(row.group) + '" x="' + salaryPie2dNum(labelX) + '" y="' + salaryPie2dNum(row.y) + '" text-anchor="' + anchor + '">' + utils.escapeHtml(row.label) + '</text>'
        ].join('');
      }).join(''),
      '</g>'
    ].join('');
  }

  function salaryPie2dCalloutLabelX(row) {
    var width = Math.min(118, Math.max(34, String(row.label || '').length * 5.2));
    if (row.side === 'right') {
      return Math.min(row.labelX, 356 - width);
    }
    return Math.max(row.labelX, -36 + width);
  }

  function normalizeSalaryPie2dCallouts(callouts) {
    var rows = [];
    ['left', 'right'].forEach(function (side) {
      var sideRows = (callouts || []).filter(function (row) {
        return row.side === side;
      }).sort(function (a, b) {
        return a.y - b.y;
      });
      var minY = 10;
      var maxY = 286;
      var gap = 17;
      sideRows.forEach(function (row, index) {
        row.y = Math.max(minY + (index * gap), Math.min(maxY, row.y));
        if (index && row.y < sideRows[index - 1].y + gap) {
          row.y = sideRows[index - 1].y + gap;
        }
      });
      for (var index = sideRows.length - 1; index >= 0; index -= 1) {
        if (sideRows[index].y > maxY - ((sideRows.length - 1 - index) * gap)) {
          sideRows[index].y = maxY - ((sideRows.length - 1 - index) * gap);
        }
      }
      rows = rows.concat(sideRows);
    });
    return rows;
  }

  function renderSalaryPie2dBottom(model, groups) {
    return [
      '<div class="salary-pie2d-bottom">',
      renderSalaryPie2dSelection(model),
      '</div>'
    ].join('');
  }

  function renderSalaryPie2dLegend(model, groups) {
    return [
      '<div class="salary-pie2d-legend">',
      (groups || []).map(function (item) {
        var action = item.group === 'excess' ? '' : ' data-salary-partition-group="' + utils.escapeHtml(item.group) + '"';
        var openClass = isSalaryB1GroupOpen(item.group) ? ' is-open' : '';
        var staticClass = action ? '' : ' is-static';
        return [
          '<button type="button" class="salary-pie2d-row is-' + utils.escapeHtml(item.group) + openClass + staticClass + '"' + action + '>',
          '<i style="' + cssVars({ '--c': item.color || salaryPie2dColor(item.group, 0) }) + '"></i>',
          '<span><b>' + utils.escapeHtml(salaryPie2dShortLabel(item.label, item.group)) + '</b></span>',
          '<strong>' + utils.escapeHtml(salaryPartitionPctLabel(item.amount, model.salary)) + '</strong>',
          '</button>'
        ].join('');
      }).join(''),
      '</div>'
    ].join('');
  }

  function renderSalaryPie2dSelection(model) {
    var lines = [];
    if (isSalaryB1GroupOpen('fixed')) {
      lines.push(renderSalaryPie2dDetailLine('FIJOS', model.fixedTotal, model.fixedItems, model));
    }
    if (isSalaryB1GroupOpen('saving')) {
      if (salaryPartitionSavingNode === 'metas') {
        lines.push(renderSalaryPie2dDetailLine('AHORROS DETALLE', model.savingsTotal, model.futureItems.concat(model.goalItems), model));
      } else {
        lines.push(renderSalaryPie2dDetailLine('AHORROS', model.savingsTotal, salaryPie2dSavingSummaryItems(model), model));
      }
    }
    if (isSalaryB1GroupOpen('available')) {
      lines.push(renderSalaryPie2dDetailLine('DISPONIBLE', model.available, [{ label: 'Libre', group: 'available', amount: model.available }], model));
    }
    if (!lines.length) {
      return '<div class="salary-pie2d-selection is-empty">TOCA FIJOS, AHORROS O DISPONIBLE</div>';
    }
    return '<div class="salary-pie2d-selection">' + lines.join('') + '</div>';
  }

  function renderSalaryPie2dDetailLine(title, amount, items, model) {
    var parts = (items || []).filter(partitionNonZero).map(function (item) {
      return '<span>' + utils.escapeHtml(salaryPie2dShortLabel(item.label, item.group || '')) + ' ' + utils.escapeHtml(salaryPartitionPctLabel(item.amount, model.salary)) + '</span>';
    }).join('<b>+</b>');
    return [
      '<div class="salary-pie2d-detail-line">',
      '<strong>' + utils.escapeHtml(title) + ' ' + utils.escapeHtml(salaryPartitionPctLabel(amount, model.salary)) + '</strong>',
      parts ? '<em>' + parts + '</em>' : '',
      '</div>'
    ].join('');
  }

  function salaryPie2dSavingSummaryItems(model) {
    return [
      { label: 'Futuro', group: 'saving-future', amount: model.futureItems.reduce(partitionSum, 0) },
      { label: 'Metas', group: 'saving-goals', amount: model.goalItems.reduce(partitionSum, 0) }
    ].filter(partitionNonZero);
  }

  function salaryPie2dShortLabel(label, group) {
    if (group === 'available') {
      return 'DISP.';
    }
    if (group === 'saving-future') {
      return 'FUTURO';
    }
    if (group === 'saving-goals') {
      return 'METAS';
    }
    return String(label || '').toUpperCase();
  }

  function salaryPie2dColor(group, index) {
    var family = group === 'saving-future' || group === 'saving-goals' || group === 'saving-goal' ? 'saving' : group;
    var palettes = {
      fixed: ['#7f8f5b', '#8f9f68', '#718252', '#9aaa6f'],
      saving: ['#b7c982', '#c5d58d', '#a7bb74', '#d0dd98'],
      available: ['#24351f'],
      excess: ['#a95c5a']
    };
    var colors = palettes[family] || palettes.available;
    return colors[index % colors.length];
  }

  function salaryPie2dPath(cx, cy, radius, startAngle, endAngle) {
    var start = salaryPie2dPolar(cx, cy, radius, startAngle);
    var end = salaryPie2dPolar(cx, cy, radius, endAngle);
    var large = endAngle - startAngle > 180 ? 1 : 0;
    return ['M', cx, cy, 'L', start.x, start.y, 'A', radius, radius, 0, large, 1, end.x, end.y, 'Z'].join(' ');
  }

  function salaryPie2dPolar(cx, cy, radius, angleDeg) {
    var angle = angleDeg * Math.PI / 180;
    return {
      x: salaryPie2dNum(cx + (Math.cos(angle) * radius)),
      y: salaryPie2dNum(cy + (Math.sin(angle) * radius))
    };
  }

  function salaryPie2dNum(value) {
    return Math.round(Number(value || 0) * 100) / 100;
  }

  function renderSalaryPartitionB1(model) {
    var groups = salaryPartitionB1Groups(model);
    var layout = salaryB1Layout(groups, model);
    return [
      '<div class="salary-b1-stage" data-salary-partition-b1 style="' + layout.style + '">',
      '<div class="salary-b1-bar-wrap">',
      '<div class="salary-b1-bar" role="group" aria-label="Particion del sueldo en barra interactiva">',
      groups.map(function (group, index) {
        return isSalaryB1GroupOpen(group.group) && canSalaryB1DrillGroup(group)
          ? renderSalaryB1ExpandedSegment(group, model, index)
          : renderSalaryB1MacroSegment(group, model, index);
      }).join(''),
      '</div>',
      '</div>',
      '</div>'
    ].join('');
  }

  function salaryB1Layout(groups, model) {
    var topCount = 1;
    var bottomCount = 1;
    (groups || []).forEach(function (group) {
      var count;
      if (group.group === 'fixed') {
        count = isSalaryB1GroupOpen(group.group) && canSalaryB1DrillGroup(group)
          ? salaryB1ChildrenForGroup(group, model).length
          : 1;
        topCount = Math.max(topCount, count || 1);
      }
      if (group.group === 'saving') {
        count = isSalaryB1GroupOpen(group.group) && canSalaryB1DrillGroup(group)
          ? salaryB1ChildrenForGroup(group, model).length
          : 1;
        bottomCount = Math.max(bottomCount, count || 1);
      }
    });
    var topSpace = Math.max(132, 72 + (topCount * 42));
    var bottomSpace = Math.max(132, 72 + (bottomCount * 42));
    return {
      style: cssVars({
        '--b1-top-space': topSpace + 'px',
        '--b1-bottom-space': bottomSpace + 'px',
        '--b1-stage-min': (128 + topSpace + bottomSpace) + 'px'
      })
    };
  }

  function renderSalaryB1MacroSegment(group, model, index) {
    var width = partitionPercent(group.amount, model.scale);
    var tightClass = width < 10 ? ' is-tight' : '';
    if (!canSalaryB1DrillGroup(group)) {
      return [
        '<div class="salary-b1-segment is-' + utils.escapeHtml(group.group) + ' is-static' + tightClass + '" role="img" aria-label="' + utils.escapeHtml(group.label + ' ' + salaryPartitionPctLabel(group.amount, model.salary)) + '" style="' + cssVars({ '--w': width + '%', '--c': group.color }) + '">',
        renderSalaryB1InsidePct(group, model),
        group.group === 'available' ? '' : renderSalaryB1Leader(group, model, index, false, group.group),
        '</div>'
      ].join('');
    }
    return [
      '<button class="salary-b1-segment is-' + utils.escapeHtml(group.group) + tightClass + '" type="button" data-salary-partition-group="' + utils.escapeHtml(group.group) + '" style="' + cssVars({ '--w': width + '%', '--c': group.color }) + '">',
      renderSalaryB1InsidePct(group, model),
      renderSalaryB1Leader(group, model, index, false, group.group),
      '</button>'
    ].join('');
  }

  function renderSalaryB1ExpandedSegment(group, model) {
    var width = partitionPercent(group.amount, model.scale);
    var children = salaryB1ChildrenForGroup(group, model);
    return [
      '<div class="salary-b1-segment is-expanded is-' + utils.escapeHtml(group.group) + '" role="group" aria-label="' + utils.escapeHtml(group.label + ' abierto ' + salaryPartitionPctLabel(group.amount, model.salary)) + '" style="' + cssVars({ '--w': width + '%', '--c': group.color }) + '">',
      children.map(function (item, childIndex) {
        var childWidth = partitionPercent(item.amount, group.amount);
        var tightClass = childWidth < 14 ? ' is-tight' : '';
        var tinyClass = childWidth < 8 ? ' is-tiny' : '';
        var drillAttr = item.drillNode
          ? ' data-salary-partition-saving-node="' + utils.escapeHtml(item.drillNode) + '"'
          : ' data-salary-partition-child-group="' + utils.escapeHtml(group.group) + '"';
        return [
          '<button class="salary-b1-child is-' + utils.escapeHtml(item.group) + tightClass + tinyClass + '" type="button"' + drillAttr + ' title="' + utils.escapeHtml(item.label + ' - ' + salaryPartitionPctLabel(item.amount, model.salary)) + '" style="' + cssVars({ '--w': childWidth + '%', '--c': group.color, '--shade': ((childIndex % 3) * 0.07).toFixed(2) }) + '">',
          renderSalaryB1InsidePct(item, model),
          renderSalaryB1Leader(item, model, childIndex, true, group.group),
          '</button>'
        ].join('');
      }).join(''),
      '</div>'
    ].join('');
  }

  function salaryB1ChildrenForGroup(group, model) {
    var futureAmount;
    var goalAmount;
    if (group.group !== 'saving') {
      return group.children;
    }
    if (salaryPartitionSavingNode === 'metas') {
      return model.futureItems.concat(model.goalItems).map(function (item) {
        var copy = Object.assign({}, item);
        copy.drillNode = 'collapse';
        return copy;
      });
    }
    futureAmount = model.futureItems.reduce(partitionSum, 0);
    goalAmount = model.goalItems.reduce(partitionSum, 0);
    return [
      { label: 'Ahorros', group: 'saving-future', amount: futureAmount, drillNode: 'collapse' },
      { label: 'Metas', group: 'saving-goals', amount: goalAmount, drillNode: 'metas' }
    ].filter(partitionNonZero);
  }

  function renderSalaryB1InsidePct(item, model) {
    var value = salaryPartitionPctLabel(item.amount, model.salary);
    if ((item || {}).group === 'available') {
      return '<span class="salary-b1-inside-pct salary-b1-available-mark">' + utils.escapeHtml('DISP. ' + value) + '</span>';
    }
    return '<span class="salary-b1-inside-pct">' + utils.escapeHtml(value) + '</span>';
  }

  function canSalaryB1DrillGroup(group) {
    return group && group.group !== 'available' && group.group !== 'excess';
  }

  function isSalaryB1GroupOpen(group) {
    return !!salaryPartitionOpenGroups[group];
  }

  function setSalaryB1GroupOpen(group, open) {
    if (group !== 'fixed' && group !== 'saving' && group !== 'available') {
      return;
    }
    if (open) {
      salaryPartitionOpenGroups[group] = true;
      return;
    }
    delete salaryPartitionOpenGroups[group];
    if (group === 'saving') {
      salaryPartitionSavingNode = 'summary';
    }
  }

  function handleSalaryPartitionGroupTap(group) {
    if (group === 'saving') {
      if (isSalaryB1GroupOpen('saving')) {
        setSalaryB1GroupOpen('saving', false);
        return;
      }
      salaryPartitionSavingNode = 'summary';
      setSalaryB1GroupOpen('saving', true);
      return;
    }
    setSalaryB1GroupOpen(group, !isSalaryB1GroupOpen(group));
  }

  function handleSalaryPartitionSavingTap(node) {
    if (node === 'metas' && isSalaryB1GroupOpen('saving') && salaryPartitionSavingNode === 'metas') {
      salaryPartitionSavingNode = 'summary';
      return;
    }
    if (node === 'summary' && isSalaryB1GroupOpen('saving') && salaryPartitionSavingNode === 'summary') {
      setSalaryB1GroupOpen('saving', false);
      return;
    }
    setSalaryB1GroupOpen('saving', true);
    salaryPartitionSavingNode = node || 'summary';
  }

  function salaryB1LeaderPlacement(group, index, nested) {
    var side = index % 2 ? 'bottom' : 'top';
    var direction = index % 4 < 2 ? 'right' : 'left';
    var run = 26;
    var rise = 44;
    var arm = 96;
    var angle;
    var diag;
    var labelWidth = 234;
    if (nested && group === 'fixed') {
      side = 'top';
      direction = 'right';
      rise = 132 - (Math.min(index, 5) * 22);
      run = Math.max(10, 38 - (Math.min(index, 5) * 7));
      arm = 58;
      labelWidth = 250;
    } else if (nested && group === 'saving') {
      side = 'bottom';
      direction = 'left';
      rise = 132 - (Math.min(index, 5) * 22);
      run = Math.max(8, 24 - (Math.min(index, 5) * 4));
      arm = 28;
      labelWidth = 242;
    } else if (nested && group === 'excess') {
      side = 'top';
      direction = 'left';
      rise = 64;
      arm = 100;
    } else if (!nested && group === 'fixed') {
      side = 'top';
      direction = 'right';
      rise = 86;
      run = 30;
      arm = 62;
      labelWidth = 242;
    } else if (!nested && group === 'saving') {
      side = 'bottom';
      direction = 'left';
      rise = 86;
      run = 20;
      arm = 40;
      labelWidth = 238;
    } else if (!nested && group === 'available') {
      side = 'bottom';
      direction = 'left';
      rise = 58;
      run = 34;
      arm = 96;
    } else if (!nested && group === 'excess') {
      side = 'bottom';
      direction = 'left';
      rise = 66;
      arm = 100;
    }
    diag = Math.round(Math.sqrt((run * run) + (rise * rise)));
    angle = Math.round((Math.atan2(rise, run) * 1800) / Math.PI) / 10;
    if (direction === 'right' && side === 'top') {
      angle = -angle;
    } else if (direction === 'left' && side === 'top') {
      angle = 180 + angle;
    } else if (direction === 'left' && side === 'bottom') {
      angle = 180 - angle;
    }
    return {
      side: side,
      direction: direction,
      cascade: nested ? Math.min(index, 4) : 0,
      style: cssVars({
        '--leader-y': (side === 'top' ? '-' : '') + rise + 'px',
        '--leader-run': run + 'px',
        '--leader-arm': arm + 'px',
        '--leader-diag': diag + 'px',
        '--leader-angle': angle + 'deg',
        '--leader-left-arm-x': '-' + (run + arm) + 'px',
        '--leader-label-x': (run + arm + 5) + 'px',
        '--leader-label-width': labelWidth + 'px'
      })
    };
  }

  function renderSalaryB1Leader(item, model, index, nested, ownerGroup) {
    var placement = salaryB1LeaderPlacement(ownerGroup || item.group, index, nested);
    var labelText = item.label + ' ' + salaryPartitionPctLabel(item.amount, model.salary) + ' ' + utils.formatMoney(item.amount);
    return [
      '<span class="salary-b1-leader is-' + utils.escapeHtml(placement.side) + ' is-' + utils.escapeHtml(placement.direction) + (nested ? ' is-nested is-cascade-' + utils.escapeHtml(String(placement.cascade)) : '') + '" style="' + placement.style + '">',
      '<span class="salary-b1-leader-text">' + utils.escapeHtml(labelText) + '</span>',
      '</span>'
    ].join('');
  }

  function partitionPercent(value, total) {
    if (!total) {
      return 0;
    }
    return Math.round((utils.normalizeAmount(value) / total) * 1000) / 10;
  }

  function salaryPartitionPctLabel(value, salary) {
    return (formatPercentInput(partitionPercent(value, salary)) || '0') + '%';
  }

  function cssVars(vars) {
    return Object.keys(vars).map(function (key) {
      return key + ':' + vars[key];
    }).join(';');
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
    bindSalaryPartition(root);
  }

  function bindSalaryPartition(root) {
    var panel = utils.qs('[data-salary-partition-pie]', root);
    if (!panel) {
      return;
    }
    panel.addEventListener('click', function (event) {
      var savingButton = event.target.closest ? event.target.closest('[data-salary-partition-saving-node]') : null;
      var childButton = event.target.closest ? event.target.closest('[data-salary-partition-child-group]') : null;
      var groupButton = event.target.closest ? event.target.closest('[data-salary-partition-group]') : null;
      var group;
      if (savingButton && panel.contains(savingButton)) {
        handleSalaryPartitionSavingTap(savingButton.getAttribute('data-salary-partition-saving-node') || 'summary');
        render();
        return;
      }
      if (childButton && panel.contains(childButton)) {
        setSalaryB1GroupOpen(childButton.getAttribute('data-salary-partition-child-group'), false);
        render();
        return;
      }
      if (groupButton && panel.contains(groupButton)) {
        group = groupButton.getAttribute('data-salary-partition-group');
        handleSalaryPartitionGroupTap(group);
        render();
      }
    });
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
      var data = window.FinanzasState.getState().data || {};
      var currentConfig = data.config || {};
      var payload = Object.assign({}, currentConfig, utils.formDataToObject(form));
      payload.sueldoMensual = utils.normalizeAmount(payload.sueldoMensual);
      payload.gastosFijos = utils.normalizeFixedExpenses(currentConfig.gastosFijos || [], payload.sueldoMensual);
      var plannedSavings = utils.normalizeAmount(((data.resumen || {}).ahorrosPlanificados || plannedSavingsFromSummary(data)));
      var fixedTotal = payload.gastosFijos.reduce(function (sum, item) {
        return sum + utils.fixedExpenseAmount(item);
      }, 0);
      if (payload.sueldoMensual && fixedTotal + plannedSavings > payload.sueldoMensual) {
        errorBox.textContent = 'Los fijos y ahorros superan el 100% del sueldo.';
        errorBox.hidden = false;
        return;
      }
      window.FinanzasApp.mutate('updateConfig', payload)
        .then(function () {
          if (window.FinanzasApp.updateApplicationCache) {
            window.FinanzasApp.updateApplicationCache();
          }
        })
        .catch(function (error) {
          errorBox.textContent = error.message;
          errorBox.hidden = false;
        });
    });

    bindSettingsBackup(root);
    bindFixedExpenseList(root);
    bindArchive(root);
  }

  function bindSettingsBackup(root) {
    var exportButton = utils.qs('[data-export-local-backup]', root);
    var importButton = utils.qs('[data-import-local-backup]', root);
    if (exportButton) {
      exportButton.addEventListener('click', function () {
        if (!window.FinanzasApp || !window.FinanzasApp.exportLocalBackup) {
          return;
        }
        exportButton.disabled = true;
        exportButton.textContent = 'Exportando';
        window.FinanzasApp.exportLocalBackup().finally(function () {
          exportButton.disabled = false;
          exportButton.textContent = 'Exportar backup';
        });
      });
    }
    if (importButton) {
      importButton.addEventListener('click', function () {
        if (window.FinanzasApp && window.FinanzasApp.openLocalBackupImportPicker) {
          window.FinanzasApp.openLocalBackupImportPicker();
        }
      });
    }
  }

  function bindFixedExpenseList(root) {
    var list = utils.qs('[data-fixed-card-list]', root);
    if (!list) {
      return;
    }
    list.addEventListener('click', function (event) {
      var button = event.target.closest ? event.target.closest('.js-edit-fixed-expense-card, .js-remove-fixed-expense-card') : null;
      if (!button || !list.contains(button)) {
        return;
      }
      var index = Number(button.getAttribute('data-fixed-index'));
      var data = window.FinanzasState.getState().data || {};
      var config = data.config || {};
      var salary = utils.normalizeAmount(config.sueldoMensual || 0);
      var items = utils.normalizeFixedExpenses(config.gastosFijos || [], salary);
      if (!isFinite(index) || index < 0 || index >= items.length) {
        return;
      }
      if (button.classList.contains('js-edit-fixed-expense-card')) {
        if (window.FinanzasForms && window.FinanzasForms.openFixedExpenseForm) {
          window.FinanzasForms.openFixedExpenseForm(items[index], index);
        }
        return;
      }
      items.splice(index, 1);
      button.disabled = true;
      window.FinanzasApp.mutate('updateConfig', Object.assign({}, config, {
        sueldoMensual: salary,
        gastosFijos: items
      })).catch(function () {
        button.disabled = false;
      });
    });
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
