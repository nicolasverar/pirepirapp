(function () {
  'use strict';

  var utils = window.FinanzasUtils;
  var COMPLETE_KEY = 'pirepirappOnboarding:v4.0';
  var SAVE_REASON = 'onboarding-v4';
  var active = false;
  var saving = false;
  var bound = false;
  var root;
  var index = 0;
  var typingTimer = 0;
  var uid = 20;
  var savedChrome = null;

  var steps = [
    { code: 'HOLA', title: 'BIENVENIDO/A', caption: '', type: 'welcome', status: 'bienvenida' },
    { code: 'SUELDO', title: 'SUELDO', caption: 'Cuanto soles cobrar?', type: 'salary', status: 'sueldo mensual' },
    { code: 'GASTOS', title: 'GASTOS FIJOS', caption: 'Defini gastos mensuales con nombre y apellido.', type: 'fixed', status: 'gastos fijos' },
    { code: 'AHORRO', title: 'AHORROS', caption: '', type: 'savings', status: 'ahorros' },
    { code: 'LISTO', title: 'LISTO', caption: '', type: 'summary', status: 'listo' }
  ];

  var defaults = {
    salary: '',
    fixed: [{ id: 'fixed-1', title: '', amount: '' }],
    savingsPlan: {
      future: false,
      goals: false,
      wishlist: false
    },
    futureTitle: 'Futuro',
    futureMonthly: '',
    futureAccumulated: '',
    futureTerm: '',
    goals: [{ id: 'goal-1', title: '', monthly: '', target: '', term: '' }],
    wishlist: [{ id: 'wish-1', title: '', cost: '', term: '' }]
  };

  var draft = clone(defaults);

  var GLYPHS = {
    ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
    '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
    ',': ['00000', '00000', '00000', '00000', '01100', '00100', '01000'],
    '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
    '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
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
    'C': ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
    'D': ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    'E': ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    'F': ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    'G': ['01111', '10000', '10000', '10011', '10001', '10001', '01111'],
    'H': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    'I': ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    'J': ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
    'K': ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
    'L': ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    'M': ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    'N': ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    'O': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    'P': ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    'Q': ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
    'R': ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    'S': ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    'T': ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    'U': ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    'V': ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
    'W': ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
    'X': ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
    'Y': ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    'Z': ['11111', '00001', '00010', '00100', '01000', '10000', '11111']
  };

  function bind() {
    if (bound || !utils) {
      return;
    }
    root = utils.qs('#app-screen');
    if (!root) {
      return;
    }
    bound = true;
    root.addEventListener('input', handleRootInput);
    root.addEventListener('change', handleRootChange);
    root.addEventListener('click', handleRootClick);
    document.addEventListener('click', handleDocumentClick, true);
    document.addEventListener('submit', handleDocumentSubmit, true);
  }

  function maybeStart() {
    var data;
    bind();
    if (active || saving || !window.FinanzasState) {
      return false;
    }
    data = (window.FinanzasState.getState() || {}).data || {};
    if (!shouldShow(data)) {
      return false;
    }
    start(data);
    return true;
  }

  function shouldShow(data) {
    if (readCompletionFlag()) {
      return false;
    }
    if (!window.FinanzasApi || !window.FinanzasApi.hasBackend || !window.FinanzasApi.hasBackend()) {
      return false;
    }
    return !hasUserSetup(data || {});
  }

  function hasUserSetup(data) {
    var config = data.config || {};
    var salary = utils.normalizeAmount(config.sueldoMensual || 0);
    var fixed = utils.normalizeFixedExpenses(config.gastosFijos || [], salary).filter(function (item) {
      return utils.fixedExpenseAmount(item) > 0;
    });
    return salary > 0
      || fixed.length > 0
      || activeItems(data.ahorrosFuturo).length > 0
      || activeItems(data.metas).length > 0
      || activeItems(data.wishlist).length > 0
      || movementCount(data.movimientos) > 0;
  }

  function activeItems(items) {
    return (Array.isArray(items) ? items : []).filter(function (item) {
      return !item || !item.estado || String(item.estado).toLowerCase() === 'activo';
    });
  }

  function movementCount(source) {
    if (Array.isArray(source)) {
      return source.length;
    }
    if (source && Array.isArray(source.movimientos)) {
      return source.movimientos.length;
    }
    if (source && Array.isArray(source.data)) {
      return source.data.length;
    }
    return 0;
  }

  function start(data) {
    active = true;
    saving = false;
    index = 0;
    draft = draftFromData(data || {});
    captureChrome();
    document.body.classList.add('is-onboarding-active');
    if (root) {
      root.classList.add('is-onboarding-screen');
    }
    render();
  }

  function render() {
    var step;
    if (!active || !root) {
      return;
    }
    if (saving) {
      renderSaving();
      return;
    }
    step = steps[index];
    root.innerHTML = [
      '<section class="onboarding-stage is-console is-step-' + utils.escapeHtml(step.type) + '">',
      renderTopline(step),
      renderCopyShell(step),
      renderWork(step),
      '</section>'
    ].join('');
    updateChrome(step);
    typeStep(step);
    refreshDynamic();
  }

  function renderSaving() {
    if (!root) {
      return;
    }
    root.innerHTML = [
      '<section class="onboarding-stage is-console is-step-saving">',
      '<section class="onboarding-copy" aria-label="Guardando">',
      '<div class="pixel-terminal"><div class="pixel-terminal-main">',
      pixelText('GUARDANDO', 'main', true, 9),
      '</div></div>',
      '</section>',
      '<section class="onboarding-work"><p class="onboard-empty-note">Configuracion inicial en proceso.</p></section>',
      '</section>'
    ].join('');
    setActionLabel('GUARDANDO');
    setStatus('guardando');
  }

  function renderTopline(step) {
    if (step.type === 'welcome') {
      return '';
    }
    return [
      '<div class="onboarding-topline">',
      '<span class="onboarding-chip">' + utils.escapeHtml(step.code) + '</span>',
      '<span class="onboarding-line" aria-hidden="true"></span>',
      '<button class="onboarding-skip-inline" type="button" data-onboard-action="skip">SKIP</button>',
      '</div>'
    ].join('');
  }

  function renderCopyShell(step) {
    return [
      '<section class="onboarding-copy" aria-label="' + utils.escapeHtml(step.title) + '">',
      '<div class="pixel-terminal">',
      '<div class="pixel-terminal-main" data-pixel-main></div>',
      '</div>',
      step.caption ? '<p class="step-caption">' + utils.escapeHtml(step.caption) + '</p>' : '',
      '</section>'
    ].join('');
  }

  function renderWork(step) {
    var summary = calculateSummary();
    if (index > 0) {
      return [
        '<section class="onboarding-work" aria-label="Configuracion inicial">',
        renderConsoleRail(),
        '<div class="console-work-area">',
        renderStepForm(step, summary),
        index < steps.length - 1 ? renderLiveSummary(summary) : '',
        '</div>',
        '</section>'
      ].join('');
    }
    return [
      '<section class="onboarding-work" aria-label="Configuracion inicial">',
      renderStepForm(step, summary),
      '</section>'
    ].join('');
  }

  function renderStepForm(step, summary) {
    if (step.type === 'welcome') {
      return renderWelcomeForm();
    }
    if (step.type === 'salary') {
      return renderSalaryForm();
    }
    if (step.type === 'fixed') {
      return renderFixedForm(summary);
    }
    if (step.type === 'savings') {
      return renderSavingsForm(summary);
    }
    return renderSummaryPanel(summary);
  }

  function renderWelcomeForm() {
    return [
      '<section class="welcome-panel" aria-label="Comenzar configuracion">',
      '<div class="welcome-arrows" aria-hidden="true">',
      renderPixelArrow(),
      renderPixelArrow(),
      renderPixelArrow(),
      '</div>',
      '</section>'
    ].join('');
  }

  function renderPixelArrow() {
    var pixels = [
      '00100',
      '00100',
      '00100',
      '00100',
      '11111',
      '01110',
      '00100'
    ];
    return [
      '<span class="pixel-arrow">',
      pixels.map(function (row) {
        return row.split('').map(function (cell) {
          return '<i class="' + (cell === '1' ? 'is-on' : 'is-off') + '"></i>';
        }).join('');
      }).join(''),
      '</span>'
    ].join('');
  }

  function renderSalaryForm() {
    return [
      '<form class="onboard-form" data-onboard-form="salary">',
      '<div class="onboard-field-grid">',
      '<div class="onboard-row is-single">',
      renderControl('Ingreso mensual', 'number', draft.salary, 'data-bind="salary" min="0" step="1" inputmode="numeric" placeholder="Gs."'),
      '</div>',
      '</div>',
      '</form>'
    ].join('');
  }

  function renderFixedForm(summary) {
    return [
      '<form class="onboard-form" data-onboard-form="fixed">',
      '<div class="onboard-field-grid">',
      draft.fixed.map(function (item) {
        return renderMoneyRow('fixed', item.id, item.title, item.amount, 'Nombre completo del gasto', 'Monto mensual');
      }).join(''),
      '</div>',
      '<button class="onboard-add-key" type="button" data-add="fixed">Agregar fijo</button>',
      renderTotalLine('Total fijos', summary.fixedTotal, 'fixed'),
      '</form>'
    ].join('');
  }

  function renderSavingsForm(summary) {
    return [
      '<form class="onboard-form" data-onboard-form="savings">',
      '<div class="savings-choice-grid">',
      renderSavingsChoice('future', 'Futuro', 'Reserva mensual.'),
      renderSavingsChoice('goals', 'Meta', 'Objetivo con monto y plazo.'),
      renderSavingsChoice('wishlist', 'Cosa', 'Compra deseada con plazo.'),
      '</div>',
      draft.savingsPlan.future ? renderFutureFields() : '',
      draft.savingsPlan.goals ? renderGoalFields(summary) : '',
      draft.savingsPlan.wishlist ? renderWishlistFields() : '',
      hasSavingsSelection() ? renderTotalLine('Ahorro mensual', summary.savingsTotal, 'savings') : '<p class="onboard-empty-note">Podes seguir sin cargar ahorros.</p>',
      '</form>'
    ].join('');
  }

  function renderSavingsChoice(key, title, detail) {
    var activeClass = draft.savingsPlan[key] ? ' is-active' : '';
    return [
      '<label class="savings-choice' + activeClass + '">',
      '<input type="checkbox" data-toggle-saving="' + utils.escapeHtml(key) + '"' + (draft.savingsPlan[key] ? ' checked' : '') + '>',
      '<span><b>' + utils.escapeHtml(title) + '</b><small>' + utils.escapeHtml(detail) + '</small></span>',
      '</label>'
    ].join('');
  }

  function renderFutureFields() {
    return [
      '<div class="onboard-subform">',
      '<div class="onboard-subtitle">Futuro</div>',
      '<div class="onboard-row is-triple">',
      renderControl('Nombre', 'text', draft.futureTitle, 'data-bind="futureTitle" maxlength="32" autocomplete="off" placeholder="Futuro"'),
      renderControl('Mensual', 'number', draft.futureMonthly, 'data-bind="futureMonthly" min="0" step="1" inputmode="numeric" placeholder="Gs."'),
      renderControl('Plazo', 'text', draft.futureTerm, 'data-bind="futureTerm" maxlength="24" autocomplete="off" placeholder="Ej. 12 meses"'),
      '</div>',
      '<div class="onboard-row is-single">',
      renderControl('Ya acumulado', 'number', draft.futureAccumulated, 'data-bind="futureAccumulated" min="0" step="1" inputmode="numeric" placeholder="Gs."'),
      '</div>',
      '</div>'
    ].join('');
  }

  function renderGoalFields(summary) {
    return [
      '<div class="onboard-subform">',
      '<div class="onboard-subtitle">Metas</div>',
      draft.goals.map(function (item) {
        return [
          '<div class="onboard-row">',
          renderControl('Meta', 'text', item.title, 'data-list="goals" data-id="' + utils.escapeHtml(item.id) + '" data-field="title" maxlength="32" autocomplete="off" placeholder="Ej. notebook"'),
          renderControl('Mensual', 'number', item.monthly, 'data-list="goals" data-id="' + utils.escapeHtml(item.id) + '" data-field="monthly" min="0" step="1" inputmode="numeric" placeholder="Gs."'),
          renderRemoveButton('goals', item.id),
          '</div>',
          '<div class="onboard-row is-double">',
          renderControl('Objetivo', 'number', item.target, 'data-list="goals" data-id="' + utils.escapeHtml(item.id) + '" data-field="target" min="1" step="1" inputmode="numeric" placeholder="Gs."'),
          renderControl('Plazo', 'text', item.term, 'data-list="goals" data-id="' + utils.escapeHtml(item.id) + '" data-field="term" maxlength="24" autocomplete="off" placeholder="Ej. 6 meses"'),
          '</div>'
        ].join('');
      }).join(''),
      '<button class="onboard-add-key" type="button" data-add="goals">Agregar meta</button>',
      renderTotalLine('Metas mensual', summary.goalTotal, 'goals'),
      '</div>'
    ].join('');
  }

  function renderWishlistFields() {
    return [
      '<div class="onboard-subform">',
      '<div class="onboard-subtitle">Cosas que quiero</div>',
      draft.wishlist.map(function (item) {
        return [
          renderMoneyRow('wishlist', item.id, item.title, item.cost, 'Cosa', 'Costo'),
          '<div class="onboard-row is-single">',
          renderControl('Plazo', 'text', item.term, 'data-list="wishlist" data-id="' + utils.escapeHtml(item.id) + '" data-field="term" maxlength="24" autocomplete="off" placeholder="Ej. 3 meses"'),
          '</div>'
        ].join('');
      }).join(''),
      '<button class="onboard-add-key" type="button" data-add="wishlist">Agregar cosa</button>',
      renderTotalLine('Cosas total', calculateSummary().wishlistTotal, 'wishlist'),
      '</div>'
    ].join('');
  }

  function renderSummaryPanel(summary) {
    return [
      '<section class="summary-panel" aria-label="Resumen inicial">',
      renderSummaryGrid(summary),
      renderPartitionRail(summary),
      '</section>'
    ].join('');
  }

  function renderLiveSummary(summary) {
    if (!summary.hasAnyData) {
      return '<section class="live-summary" aria-label="Resumen en vivo"><p class="summary-empty">Sin datos cargados.</p></section>';
    }
    return [
      '<section class="live-summary" aria-label="Resumen en vivo">',
      '<div class="summary-title"><span>Resumen</span><b data-total="available">' + utils.escapeHtml(summary.hasSalary ? utils.formatMoney(summary.available) : 'Sueldo pendiente') + '</b></div>',
      renderSummaryGrid(summary),
      renderPartitionRail(summary),
      '</section>'
    ].join('');
  }

  function renderSummaryGrid(summary) {
    if (!summary.hasAnyData) {
      return '<div class="summary-grid" data-summary-grid><p class="summary-empty">Sin datos cargados.</p></div>';
    }
    return [
      '<div class="summary-grid" data-summary-grid>',
      '<div class="summary-cell"><span>Sueldo</span><b>' + utils.escapeHtml(summary.hasSalary ? utils.formatMoney(summary.salary) : 'Pendiente') + '</b></div>',
      summary.hasFixed ? '<div class="summary-cell"><span>Gastos fijos</span><b>' + utils.escapeHtml(utils.formatMoney(summary.fixedTotal)) + '</b></div>' : '',
      summary.hasSavings ? '<div class="summary-cell"><span>Ahorros</span><b>' + utils.escapeHtml(utils.formatMoney(summary.savingsTotal)) + '</b></div>' : '',
      summary.hasWishlist ? '<div class="summary-cell"><span>Cosas</span><b>' + utils.escapeHtml(utils.formatMoney(summary.wishlistTotal)) + '</b></div>' : '',
      summary.hasSalary ? '<div class="summary-cell"><span>Libre</span><b>' + utils.escapeHtml(utils.formatMoney(summary.available)) + '</b></div>' : '',
      '</div>'
    ].join('');
  }

  function renderPartitionRail(summary) {
    var salary;
    var fixedWidth;
    var savingsWidth;
    var availableWidth;
    if (!summary.hasSalary) {
      return '<div class="partition-rail is-empty" data-partition-rail aria-label="Particion del sueldo"><i style="--w:100%;--c:transparent"></i></div>';
    }
    salary = summary.salary || Math.max(1, summary.fixedTotal + summary.savingsTotal + Math.max(0, summary.available));
    fixedWidth = share(summary.fixedTotal, salary);
    savingsWidth = share(summary.savingsTotal, salary);
    availableWidth = Math.max(0, 100 - fixedWidth - savingsWidth);
    return [
      '<div class="partition-rail" data-partition-rail aria-label="Particion del sueldo">',
      '<i style="--w:' + fixedWidth + '%;--c:#627545"></i>',
      '<i style="--w:' + savingsWidth + '%;--c:#7d8d55"></i>',
      '<i style="--w:' + availableWidth + '%;--c:#24351f"></i>',
      '</div>'
    ].join('');
  }

  function renderConsoleRail() {
    return [
      '<aside class="console-rail" aria-label="Pasos">',
      steps.map(function (step, stepIndex) {
        var state = stepIndex < index ? ' is-done' : (stepIndex === index ? ' is-active' : '');
        return '<button class="console-step' + state + '" type="button" data-onboard-step="' + stepIndex + '"><span>0' + (stepIndex + 1) + '</span><b>' + utils.escapeHtml(step.title) + '</b></button>';
      }).join(''),
      '</aside>'
    ].join('');
  }

  function renderMoneyRow(list, id, title, amount, titleLabel, amountLabel) {
    return [
      '<div class="onboard-row">',
      renderControl(titleLabel, 'text', title, 'data-list="' + utils.escapeHtml(list) + '" data-id="' + utils.escapeHtml(id) + '" data-field="title" maxlength="32" autocomplete="off" placeholder="Nombre"'),
      renderControl(amountLabel, 'number', amount, 'data-list="' + utils.escapeHtml(list) + '" data-id="' + utils.escapeHtml(id) + '" data-field="' + (list === 'wishlist' ? 'cost' : 'amount') + '" min="0" step="1" inputmode="numeric" placeholder="Gs."'),
      renderRemoveButton(list, id),
      '</div>'
    ].join('');
  }

  function renderControl(label, type, value, attrs) {
    return [
      '<label class="onboard-control">',
      '<span>' + utils.escapeHtml(label) + '</span>',
      '<input type="' + utils.escapeHtml(type) + '" value="' + utils.escapeHtml(value) + '" ' + attrs + '>',
      '</label>'
    ].join('');
  }

  function renderRemoveButton(list, id) {
    return '<button class="onboard-mini-key" type="button" data-remove="' + utils.escapeHtml(list) + '" data-id="' + utils.escapeHtml(id) + '" aria-label="Quitar">X</button>';
  }

  function renderTotalLine(label, amount, key) {
    return '<div class="onboard-total"><span>' + utils.escapeHtml(label) + '</span><b data-total="' + utils.escapeHtml(key) + '">' + utils.escapeHtml(utils.formatMoney(amount)) + '</b></div>';
  }

  function typeStep(step) {
    var mainEl = root.querySelector('[data-pixel-main]');
    var mainValue = step.title;
    var mainCurrent = 0;
    clearTimeout(typingTimer);

    function tickMain() {
      if (!mainEl || !active || saving) {
        return;
      }
      mainEl.innerHTML = pixelText(mainValue.slice(0, mainCurrent), 'main', true, step.type === 'welcome' ? 12 : 8);
      mainCurrent += 1;
      if (mainCurrent <= mainValue.length) {
        typingTimer = setTimeout(tickMain, 176);
      }
    }

    if (mainEl) {
      mainEl.innerHTML = pixelText('', 'main', true, step.type === 'welcome' ? 12 : 8);
      tickMain();
    }
  }

  function pixelText(text, kind, center, maxCharsOverride) {
    var value = normalizePixelText(text);
    var cell = kind === 'main' ? 4.05 : 2.15;
    var gap = kind === 'main' ? 0.62 : 0.62;
    var charGap = kind === 'main' ? 1.2 : 1.55;
    var maxChars = maxCharsOverride || (kind === 'main' ? 8 : 24);
    var maxLines = kind === 'main' ? 2 : 1;
    var viewWidth = kind === 'main' ? 300 : 320;
    var viewHeight = kind === 'main' ? 82 : 30;
    var lineHeight = 7 * (cell + gap) - gap + (kind === 'main' ? 7 : 4);
    var lineBoxHeight = 7 * (cell + gap) - gap;
    var activeRects = [];
    var ghostRects = [];
    var lines = wrapText(value, maxChars).slice(0, maxLines);
    var textHeight = lines.length * lineBoxHeight + Math.max(0, lines.length - 1) * (lineHeight - lineBoxHeight);
    var baseY = center ? Math.max(0, (viewHeight - textHeight) / 2) : 0;
    lines.forEach(function (line, lineIndex) {
      var offsetX = center ? Math.max(0, (viewWidth - pixelLineWidth(line, cell, gap, charGap)) / 2) : 0;
      drawPixelLine(line, offsetX, baseY + lineIndex * lineHeight, cell, gap, charGap, activeRects, ghostRects);
    });
    return [
      '<svg viewBox="0 0 ' + viewWidth + ' ' + viewHeight + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + utils.escapeHtml(value) + '">',
      '<g class="pixel-terminal-ghost">' + ghostRects.join('') + '</g>',
      '<g class="pixel-terminal-active">' + activeRects.join('') + '</g>',
      '</svg>'
    ].join('');
  }

  function drawPixelLine(line, offsetX, offsetY, cell, gap, charGap, activeRects, ghostRects) {
    var x = offsetX;
    var glyph;
    var row;
    var col;
    var rect;
    for (var charIndex = 0; charIndex < line.length; charIndex += 1) {
      glyph = GLYPHS[line.charAt(charIndex)] || GLYPHS[' '];
      for (row = 0; row < glyph.length; row += 1) {
        for (col = 0; col < glyph[row].length; col += 1) {
          rect = '<rect x="' + round(x + col * (cell + gap)) + '" y="' + round(offsetY + row * (cell + gap)) + '" width="' + cell + '" height="' + cell + '"></rect>';
          if (glyph[row].charAt(col) === '1') {
            activeRects.push(rect);
          } else {
            ghostRects.push(rect);
          }
        }
      }
      x += glyph[0].length * (cell + gap) + charGap;
    }
  }

  function pixelLineWidth(text, cell, gap, charGap) {
    var width = 0;
    for (var charIndex = 0; charIndex < text.length; charIndex += 1) {
      width += (GLYPHS[text.charAt(charIndex)] || GLYPHS[' '])[0].length * (cell + gap) + charGap;
    }
    return Math.max(1, width - charGap);
  }

  function wrapText(text, maxChars) {
    var words = String(text || '').split(/\s+/);
    var lines = [];
    var line = '';
    words.forEach(function (word) {
      var next = line ? line + ' ' + word : word;
      if (next.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) {
      lines.push(line);
    }
    return lines.length ? lines : [''];
  }

  function normalizePixelText(value) {
    return String(value || '')
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9 .,\-\/]/g, ' ');
  }

  function handleRootInput(event) {
    var input = event.target.closest ? event.target.closest('input') : null;
    var direct;
    var list;
    var id;
    var field;
    var item;
    if (!active || !input) {
      return;
    }
    direct = input.getAttribute('data-bind');
    list = input.getAttribute('data-list');
    id = input.getAttribute('data-id');
    field = input.getAttribute('data-field');
    if (direct) {
      draft[direct] = input.value;
    } else if (list && id && field) {
      item = findItem(list, id);
      if (item) {
        item[field] = input.value;
      }
    }
    refreshDynamic();
  }

  function handleRootChange(event) {
    var toggle = event.target.closest ? event.target.closest('[data-toggle-saving]') : null;
    var key;
    if (!active || !toggle) {
      return;
    }
    key = toggle.getAttribute('data-toggle-saving');
    if (key && Object.prototype.hasOwnProperty.call(draft.savingsPlan, key)) {
      draft.savingsPlan[key] = Boolean(toggle.checked);
      render();
    }
  }

  function handleRootClick(event) {
    var stepButton;
    var addButton;
    var removeButton;
    var actionButton;
    if (!active || saving || !event.target.closest) {
      return;
    }
    stepButton = event.target.closest('[data-onboard-step]');
    addButton = event.target.closest('[data-add]');
    removeButton = event.target.closest('[data-remove]');
    actionButton = event.target.closest('[data-onboard-action]');
    if (stepButton) {
      setStep(Number(stepButton.getAttribute('data-onboard-step')));
    } else if (addButton) {
      addItem(addButton.getAttribute('data-add'));
    } else if (removeButton) {
      removeItem(removeButton.getAttribute('data-remove'), removeButton.getAttribute('data-id'));
    } else if (actionButton) {
      handleAction(actionButton.getAttribute('data-onboard-action'));
    }
  }

  function handleDocumentClick(event) {
    var actionKey;
    var navKey;
    var action;
    if (!active || !event.target.closest) {
      return;
    }
    actionKey = event.target.closest('#action-key');
    navKey = event.target.closest('.bottom-nav .nav-key');
    if (!actionKey && !navKey) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (saving) {
      return;
    }
    if (actionKey) {
      handlePrimaryAction();
      return;
    }
    action = navKey.getAttribute('data-onboarding-key');
    if (!action) {
      action = ['prev', 'skip', 'restart', 'finish'][navIndex(navKey)] || '';
    }
    handleAction(action);
  }

  function handleDocumentSubmit(event) {
    if (active && event.target.closest && event.target.closest('.onboard-form')) {
      event.preventDefault();
    }
  }

  function handlePrimaryAction() {
    if (index >= steps.length - 1) {
      saveAndFinish();
      return;
    }
    setStep(index + 1);
  }

  function handleAction(action) {
    if (action === 'prev') {
      setStep(index - 1);
    } else if (action === 'skip') {
      complete('skipped');
    } else if (action === 'restart') {
      restart();
    } else if (action === 'finish') {
      saveAndFinish();
    }
  }

  function setStep(nextIndex) {
    index = Math.max(0, Math.min(steps.length - 1, nextIndex));
    render();
  }

  function restart() {
    draft = clone(defaults);
    setStep(0);
  }

  function saveAndFinish() {
    var requests;
    if (saving) {
      return;
    }
    saving = true;
    renderSaving();
    setSyncStatus('Guardando');
    requests = buildSaveRequests();
    requests.reduce(function (promise, request) {
      return promise.then(request);
    }, Promise.resolve())
      .then(function () {
        return complete('complete');
      })
      .catch(function (error) {
        saving = false;
        setSyncStatus('Error');
        if (window.FinanzasApp && window.FinanzasApp.toast) {
          window.FinanzasApp.toast(error.message || 'No se pudo guardar el inicio.');
        }
        render();
      });
  }

  function buildSaveRequests() {
    var state = (window.FinanzasState && window.FinanzasState.getState()) || {};
    var data = state.data || {};
    var config = Object.assign({}, data.config || {});
    var salary = utils.normalizeAmount(draft.salary);
    var fixed = validFixedExpenses();
    var requests = [];
    if (salary > 0 || fixed.length) {
      if (salary > 0) {
        config.sueldoMensual = salary;
      }
      if (fixed.length) {
        config.gastosFijos = fixed;
      }
      config.onboardingVersion = 'v4.0';
      config.onboardingUpdatedAt = new Date().toISOString();
      requests.push(function () {
        return requestSave('updateConfig', config);
      });
    }
    requests = requests.concat(futureRequests(), goalRequests(), wishlistRequests());
    if (!requests.length) {
      requests.push(function () {
        return Promise.resolve(null);
      });
    }
    return requests;
  }

  function validFixedExpenses() {
    return (draft.fixed || []).map(function (item) {
      return {
        nombre: text(item.title),
        categoria: text(item.title),
        monto: utils.normalizeAmount(item.amount)
      };
    }).filter(function (item) {
      return item.nombre || item.monto > 0;
    });
  }

  function futureRequests() {
    var title = text(draft.futureTitle) || 'Futuro';
    var monthly = utils.normalizeAmount(draft.futureMonthly);
    var accumulated = utils.normalizeAmount(draft.futureAccumulated);
    var term = text(draft.futureTerm);
    if (!draft.savingsPlan.future || (!monthly && !accumulated && !term && title === 'Futuro')) {
      return [];
    }
    return [function () {
      return requestSave('createFutureSaving', {
        titulo: title,
        descripcion: termDescription(term),
        plazo: term,
        montoMensual: monthly,
        montoAcumulado: accumulated,
        saveReason: SAVE_REASON
      });
    }];
  }

  function goalRequests() {
    if (!draft.savingsPlan.goals) {
      return [];
    }
    return (draft.goals || []).map(function (item) {
      var title = text(item.title);
      var monthly = utils.normalizeAmount(item.monthly);
      var target = utils.normalizeAmount(item.target);
      var term = text(item.term);
      if (!title && (monthly || target || term)) {
        title = 'Meta';
      }
      if (!title) {
        return null;
      }
      return function () {
        return requestSave('createGoal', {
          titulo: title,
          descripcion: termDescription(term),
          plazo: term,
          montoMensual: monthly,
          montoObjetivo: target,
          saveReason: SAVE_REASON
        });
      };
    }).filter(Boolean);
  }

  function wishlistRequests() {
    if (!draft.savingsPlan.wishlist) {
      return [];
    }
    return (draft.wishlist || []).map(function (item) {
      var title = text(item.title);
      var cost = utils.normalizeAmount(item.cost);
      var term = text(item.term);
      if (!title && (cost || term)) {
        title = 'Cosa que quiero';
      }
      if (!title) {
        return null;
      }
      return function () {
        return requestSave('createWishlistItem', {
          titulo: title,
          costoAproximado: cost,
          plazo: term,
          saveReason: SAVE_REASON
        });
      };
    }).filter(Boolean);
  }

  function requestSave(action, payload) {
    if (!window.FinanzasApi || !window.FinanzasApi.request) {
      return Promise.reject(new Error('El guardado local no esta disponible.'));
    }
    return window.FinanzasApi.request(action, payload || {});
  }

  function complete(status) {
    writeCompletionFlag(status);
    return refreshAfterComplete().then(function () {
      active = false;
      saving = false;
      clearTimeout(typingTimer);
      restoreChrome();
      if (root) {
        root.classList.remove('is-onboarding-screen');
      }
      document.body.classList.remove('is-onboarding-active');
      setSyncStatus('Local');
      if (window.FinanzasRender && window.FinanzasRender.render) {
        window.FinanzasRender.render();
      }
      if (status === 'complete' && window.FinanzasApp && window.FinanzasApp.toast) {
        window.FinanzasApp.toast('Inicio configurado');
      }
    });
  }

  function refreshAfterComplete() {
    if (window.FinanzasApp && window.FinanzasApp.refresh) {
      return window.FinanzasApp.refresh({ background: true, silent: true });
    }
    return Promise.resolve();
  }

  function refreshDynamic() {
    var summary;
    if (!active || !root) {
      return;
    }
    summary = calculateSummary();
    replaceAll('[data-summary-grid]', renderSummaryGrid(summary));
    replaceAll('[data-partition-rail]', renderPartitionRail(summary));
    setText('[data-total="fixed"]', utils.formatMoney(summary.fixedTotal));
    setText('[data-total="goals"]', utils.formatMoney(summary.goalTotal));
    setText('[data-total="savings"]', utils.formatMoney(summary.savingsTotal));
    setText('[data-total="wishlist"]', utils.formatMoney(summary.wishlistTotal));
    setText('[data-total="available"]', summary.hasSalary ? utils.formatMoney(summary.available) : 'Sueldo pendiente');
  }

  function replaceAll(selector, html) {
    root.querySelectorAll(selector).forEach(function (node) {
      var wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      if (wrapper.firstElementChild) {
        node.replaceWith(wrapper.firstElementChild);
      }
    });
  }

  function setText(selector, value) {
    root.querySelectorAll(selector).forEach(function (node) {
      node.textContent = value;
    });
  }

  function calculateSummary() {
    var salary = utils.normalizeAmount(draft.salary);
    var fixedTotal = sum(draft.fixed, 'amount');
    var futureTotal = draft.savingsPlan.future ? utils.normalizeAmount(draft.futureMonthly) : 0;
    var goalTotal = draft.savingsPlan.goals ? sum(draft.goals, 'monthly') : 0;
    var wishlistTotal = draft.savingsPlan.wishlist ? sum(draft.wishlist, 'cost') : 0;
    var savingsTotal = futureTotal + goalTotal;
    var hasSalary = salary > 0;
    var hasFixed = fixedTotal > 0 || hasListData(draft.fixed, ['title', 'amount']);
    var hasSavings = savingsTotal > 0
      || (draft.savingsPlan.future && (hasText(draft.futureTitle) || hasText(draft.futureMonthly) || hasText(draft.futureAccumulated) || hasText(draft.futureTerm)))
      || (draft.savingsPlan.goals && hasListData(draft.goals, ['title', 'monthly', 'target', 'term']));
    var hasWishlist = draft.savingsPlan.wishlist && (wishlistTotal > 0 || hasListData(draft.wishlist, ['title', 'cost', 'term']));
    return {
      salary: salary,
      fixedTotal: fixedTotal,
      futureTotal: futureTotal,
      goalTotal: goalTotal,
      wishlistTotal: wishlistTotal,
      savingsTotal: savingsTotal,
      available: hasSalary ? salary - fixedTotal - savingsTotal : 0,
      hasSalary: hasSalary,
      hasFixed: hasFixed,
      hasSavings: hasSavings,
      hasWishlist: hasWishlist,
      hasAnyData: hasSalary || hasFixed || hasSavings || hasWishlist
    };
  }

  function hasSavingsSelection() {
    return Boolean(draft.savingsPlan.future || draft.savingsPlan.goals || draft.savingsPlan.wishlist);
  }

  function hasListData(items, keys) {
    return (items || []).some(function (item) {
      return keys.some(function (key) {
        return hasText(item && item[key]);
      });
    });
  }

  function hasText(value) {
    return text(value) !== '';
  }

  function sum(items, key) {
    return (items || []).reduce(function (total, item) {
      return total + utils.normalizeAmount(item && item[key]);
    }, 0);
  }

  function share(amount, salary) {
    if (!salary) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round((amount / salary) * 100)));
  }

  function addItem(list) {
    uid += 1;
    if (list === 'fixed') {
      draft.fixed.push({ id: 'fixed-' + uid, title: '', amount: '' });
    } else if (list === 'goals') {
      draft.goals.push({ id: 'goal-' + uid, title: '', monthly: '', target: '', term: '' });
    } else if (list === 'wishlist') {
      draft.wishlist.push({ id: 'wish-' + uid, title: '', cost: '', term: '' });
    }
    render();
  }

  function removeItem(list, id) {
    var items = draft[list] || [];
    if (items.length <= 1) {
      items.forEach(function (item) {
        if (item.id === id) {
          Object.keys(item).forEach(function (key) {
            if (key !== 'id') {
              item[key] = '';
            }
          });
        }
      });
    } else {
      draft[list] = items.filter(function (item) {
        return item.id !== id;
      });
    }
    render();
  }

  function findItem(list, id) {
    return (draft[list] || []).filter(function (item) {
      return item.id === id;
    })[0] || null;
  }

  function draftFromData(data) {
    var next = clone(defaults);
    var config = data.config || {};
    var salary = utils.normalizeAmount(config.sueldoMensual || 0);
    var fixed = utils.normalizeFixedExpenses(config.gastosFijos || [], salary);
    if (salary > 0) {
      next.salary = String(salary);
    }
    if (fixed.length) {
      next.fixed = fixed.map(function (item, itemIndex) {
        return {
          id: 'fixed-' + itemIndex,
          title: utils.fixedExpenseName(item),
          amount: String(utils.fixedExpenseAmount(item) || '')
        };
      });
    }
    return next;
  }

  function captureChrome() {
    var actionLabel = utils.qs('#action-key .action-key-label');
    savedChrome = {
      actionLabel: actionLabel ? actionLabel.textContent : '',
      nav: utils.qsa('.bottom-nav .nav-key').map(function (button) {
        return {
          html: button.innerHTML,
          active: button.classList.contains('is-active'),
          ariaLabel: button.getAttribute('aria-label') || '',
          disabled: button.disabled
        };
      })
    };
  }

  function restoreChrome() {
    var actionLabel = utils.qs('#action-key .action-key-label');
    var navButtons = utils.qsa('.bottom-nav .nav-key');
    var keyZone = utils.qs('.key-zone');
    if (actionLabel && savedChrome) {
      actionLabel.textContent = savedChrome.actionLabel || 'AGREGAR MOVIMIENTO';
    }
    navButtons.forEach(function (button, buttonIndex) {
      var saved = savedChrome && savedChrome.nav[buttonIndex];
      button.removeAttribute('data-onboarding-key');
      if (saved) {
        button.innerHTML = saved.html;
        button.disabled = saved.disabled;
        if (saved.ariaLabel) {
          button.setAttribute('aria-label', saved.ariaLabel);
        } else {
          button.removeAttribute('aria-label');
        }
        button.classList.toggle('is-active', saved.active);
      }
    });
    if (keyZone) {
      keyZone.classList.remove('is-onboarding-keys');
    }
    if (window.FinanzasRouter && window.FinanzasRouter.syncNav) {
      window.FinanzasRouter.syncNav();
    }
    savedChrome = null;
  }

  function updateChrome(step) {
    var labels = [
      { action: 'prev', label: 'ATRAS' },
      { action: 'skip', label: 'SKIP' },
      { action: 'restart', label: 'REINICIAR' },
      { action: 'finish', label: 'ENTRAR' }
    ];
    var navButtons = utils.qsa('.bottom-nav .nav-key');
    var keyZone = utils.qs('.key-zone');
    setStatus(step.status);
    setActionLabel(index === 0 ? 'COMENZAR' : (index >= steps.length - 1 ? 'ENTRAR' : 'GUARDAR'));
    if (keyZone) {
      keyZone.classList.add('is-onboarding-keys');
    }
    navButtons.forEach(function (button, buttonIndex) {
      var item = labels[buttonIndex] || labels[0];
      button.setAttribute('data-onboarding-key', item.action);
      button.setAttribute('aria-label', item.label);
      button.disabled = item.action === 'prev' && index === 0;
      button.classList.toggle('is-active', item.action === 'finish' && index >= steps.length - 1);
      button.innerHTML = '<span>' + utils.escapeHtml(item.label) + '</span>';
    });
  }

  function navIndex(button) {
    return utils.qsa('.bottom-nav .nav-key').indexOf(button);
  }

  function setActionLabel(label) {
    var actionKey = utils.qs('#action-key');
    var actionLabel = utils.qs('#action-key .action-key-label');
    if (actionKey) {
      actionKey.hidden = false;
      actionKey.disabled = false;
      actionKey.setAttribute('aria-hidden', 'false');
      actionKey.setAttribute('aria-label', label);
    }
    if (actionLabel) {
      actionLabel.textContent = label;
    }
  }

  function setStatus(value) {
    var statusLine = utils.qs('#status-terminal span');
    if (statusLine) {
      statusLine.textContent = value || '';
    }
  }

  function setSyncStatus(value) {
    if (window.FinanzasState && window.FinanzasState.setState) {
      window.FinanzasState.setState({ syncStatus: value });
    }
  }

  function termDescription(term) {
    return term ? 'Plazo: ' + term : '';
  }

  function text(value) {
    return String(value || '').trim();
  }

  function readCompletionFlag() {
    try {
      return Boolean(localStorage.getItem(COMPLETE_KEY));
    } catch (error) {
      return true;
    }
  }

  function writeCompletionFlag(status) {
    try {
      localStorage.setItem(COMPLETE_KEY, JSON.stringify({
        status: status,
        version: 'v4.0',
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      return;
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function round(value) {
    return String(Math.round(Number(value || 0) * 100) / 100);
  }

  window.FinanzasOnboarding = {
    bind: bind,
    maybeStart: maybeStart,
    render: render,
    isActive: function () {
      return active;
    },
    shouldShow: shouldShow
  };
}());
