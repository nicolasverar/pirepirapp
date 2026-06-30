(function () {
  'use strict';

  var root = document.getElementById('onboarding-root');
  if (!root) {
    return;
  }

  var variant = root.getAttribute('data-variant') || 'terminal';
  var nextButton = document.getElementById('onboarding-next');
  var statusLine = document.querySelector('.status-terminal span');
  var index = 0;
  var typingTimer = 0;
  var uid = 20;

  var steps = [
    { code: 'HOLA', title: 'BIENVENIDO/A', caption: '', type: 'welcome', status: 'bienvenida' },
    { code: 'SUELDO', title: 'SUELDO', caption: 'Cuanto soles cobrar?', type: 'salary', status: 'sueldo mensual' },
    { code: 'GASTOS', title: 'GASTOS FIJOS', caption: 'Defini gastos mensuales con nombre y apellido.', type: 'fixed', status: 'gastos fijos' },
    { code: 'AHORRO', title: 'AHORROS', caption: '', type: 'savings', status: 'ahorros' },
    { code: 'LISTO', title: 'LISTO', caption: '', type: 'summary', status: 'listo' }
  ];

  var defaults = {
    salary: '',
    fixed: [
      { id: 'fixed-1', title: '', amount: '' }
    ],
    savingsPlan: {
      future: false,
      goals: false,
      wishlist: false
    },
    futureTitle: 'Futuro',
    futureMonthly: '',
    futureAccumulated: '',
    futureTerm: '',
    goals: [
      { id: 'goal-1', title: '', monthly: '', target: '', term: '' }
    ],
    wishlist: [
      { id: 'wish-1', title: '', cost: '', term: '' }
    ]
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

  function render() {
    var step = steps[index];
    root.innerHTML = [
      '<section class="onboarding-stage is-' + escapeHtml(variant) + ' is-step-' + escapeHtml(step.type) + '">',
      renderTopline(step),
      renderCopyShell(step),
      renderWork(step),
      '</section>'
    ].join('');
    updateChrome(step);
    typeStep(step);
    refreshDynamic();
  }

  function renderTopline(step) {
    return [
      '<div class="onboarding-topline">',
      '<span class="onboarding-chip">' + escapeHtml(step.code) + '</span>',
      '<span class="onboarding-line" aria-hidden="true"></span>',
      '<button class="onboarding-skip-inline" type="button" data-tour-action="skip">SKIP</button>',
      '</div>'
    ].join('');
  }

  function renderCopyShell(step) {
    return [
      '<section class="onboarding-copy" aria-label="' + escapeHtml(step.title) + '">',
      '<div class="pixel-terminal">',
      '<div class="pixel-terminal-main" data-pixel-main></div>',
      '</div>',
      step.caption ? '<p class="step-caption">' + escapeHtml(step.caption) + '</p>' : '',
      '</section>'
    ].join('');
  }

  function renderWork(step) {
    var summary = calculateSummary();
    if (variant === 'console' && index > 0) {
      return [
        '<section class="onboarding-work" aria-label="Configuracion inicial">',
        renderConsoleRail(),
        '<div class="console-work-area">',
        renderStepForm(step, summary),
        index > 0 && index < steps.length - 1 ? renderLiveSummary(summary) : '',
        '</div>',
        '</section>'
      ].join('');
    }
    return [
      '<section class="onboarding-work" aria-label="Configuracion inicial">',
      renderStepForm(step, summary),
      index > 0 && index < steps.length - 1 ? renderLiveSummary(summary) : '',
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
      renderSavingsChoice('future', 'Futuro', 'Fondo o reserva con aporte mensual.'),
      renderSavingsChoice('goals', 'Meta', 'Objetivo con monto, aporte y plazo.'),
      renderSavingsChoice('wishlist', 'Cosa que quiero', 'Compra deseada con costo y plazo.'),
      '</div>',
      draft.savingsPlan.future ? renderFutureFields() : '',
      draft.savingsPlan.goals ? renderGoalFields(summary) : '',
      draft.savingsPlan.wishlist ? renderWishlistFields() : '',
      hasSavingsSelection() ? renderTotalLine('Ahorro mensual', summary.savingsTotal, 'savings') : '<p class="onboard-empty-note">Podés seguir sin cargar ahorros.</p>',
      '</form>'
    ].join('');
  }

  function renderSavingsChoice(key, title, detail) {
    var active = draft.savingsPlan[key] ? ' is-active' : '';
    return [
      '<label class="savings-choice' + active + '">',
      '<input type="checkbox" data-toggle-saving="' + escapeHtml(key) + '"' + (draft.savingsPlan[key] ? ' checked' : '') + '>',
      '<span><b>' + escapeHtml(title) + '</b><small>' + escapeHtml(detail) + '</small></span>',
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
          renderControl('Meta', 'text', item.title, 'data-list="goals" data-id="' + escapeHtml(item.id) + '" data-field="title" maxlength="32" autocomplete="off" placeholder="Ej. notebook"'),
          renderControl('Mensual', 'number', item.monthly, 'data-list="goals" data-id="' + escapeHtml(item.id) + '" data-field="monthly" min="0" step="1" inputmode="numeric" placeholder="Gs."'),
          renderRemoveButton('goals', item.id),
          '</div>',
          '<div class="onboard-row is-double">',
          renderControl('Objetivo', 'number', item.target, 'data-list="goals" data-id="' + escapeHtml(item.id) + '" data-field="target" min="1" step="1" inputmode="numeric" placeholder="Gs."'),
          renderControl('Plazo', 'text', item.term, 'data-list="goals" data-id="' + escapeHtml(item.id) + '" data-field="term" maxlength="24" autocomplete="off" placeholder="Ej. 6 meses"'),
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
          renderControl('Plazo', 'text', item.term, 'data-list="wishlist" data-id="' + escapeHtml(item.id) + '" data-field="term" maxlength="24" autocomplete="off" placeholder="Ej. 3 meses"'),
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
      '<div class="summary-title"><span>Resumen</span><b data-total="available">' + escapeHtml(summary.hasSalary ? formatMoney(summary.available) : 'Sueldo pendiente') + '</b></div>',
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
      '<div class="summary-cell"><span>Sueldo</span><b>' + escapeHtml(summary.hasSalary ? formatMoney(summary.salary) : 'Pendiente') + '</b></div>',
      summary.hasFixed ? '<div class="summary-cell"><span>Gastos fijos</span><b>' + escapeHtml(formatMoney(summary.fixedTotal)) + '</b></div>' : '',
      summary.hasSavings ? '<div class="summary-cell"><span>Ahorros</span><b>' + escapeHtml(formatMoney(summary.savingsTotal)) + '</b></div>' : '',
      summary.hasWishlist ? '<div class="summary-cell"><span>Cosas</span><b>' + escapeHtml(formatMoney(summary.wishlistTotal)) + '</b></div>' : '',
      summary.hasSalary ? '<div class="summary-cell"><span>Libre</span><b>' + escapeHtml(formatMoney(summary.available)) + '</b></div>' : '',
      '</div>'
    ].join('');
  }

  function renderPartitionRail(summary) {
    if (!summary.hasSalary) {
      return '<div class="partition-rail is-empty" data-partition-rail aria-label="Particion del sueldo"><i style="--w:100%;--c:transparent"></i></div>';
    }
    var salary = summary.salary || Math.max(1, summary.fixedTotal + summary.savingsTotal + Math.max(0, summary.available));
    var fixedWidth = share(summary.fixedTotal, salary);
    var savingsWidth = share(summary.savingsTotal, salary);
    var availableWidth = Math.max(0, 100 - fixedWidth - savingsWidth);
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
        return '<button class="console-step' + state + '" type="button" data-step="' + stepIndex + '"><span>0' + (stepIndex + 1) + '</span><b>' + escapeHtml(step.title) + '</b></button>';
      }).join(''),
      '</aside>'
    ].join('');
  }

  function renderMoneyRow(list, id, title, amount, titleLabel, amountLabel) {
    return [
      '<div class="onboard-row">',
      renderControl(titleLabel, 'text', title, 'data-list="' + escapeHtml(list) + '" data-id="' + escapeHtml(id) + '" data-field="title" maxlength="32" autocomplete="off" placeholder="Nombre"'),
      renderControl(amountLabel, 'number', amount, 'data-list="' + escapeHtml(list) + '" data-id="' + escapeHtml(id) + '" data-field="' + (list === 'wishlist' ? 'cost' : 'amount') + '" min="0" step="1" inputmode="numeric" placeholder="Gs."'),
      renderRemoveButton(list, id),
      '</div>'
    ].join('');
  }

  function renderControl(label, type, value, attrs) {
    return [
      '<label class="onboard-control">',
      '<span>' + escapeHtml(label) + '</span>',
      '<input type="' + escapeHtml(type) + '" value="' + escapeHtml(value) + '" ' + attrs + '>',
      '</label>'
    ].join('');
  }

  function renderRemoveButton(list, id) {
    return '<button class="onboard-mini-key" type="button" data-remove="' + escapeHtml(list) + '" data-id="' + escapeHtml(id) + '" aria-label="Quitar">X</button>';
  }

  function renderTotalLine(label, amount, key) {
    return '<div class="onboard-total"><span>' + escapeHtml(label) + '</span><b data-total="' + escapeHtml(key) + '">' + escapeHtml(formatMoney(amount)) + '</b></div>';
  }

  function typeStep(step) {
    var mainEl = root.querySelector('[data-pixel-main]');
    var mainValue = step.title;
    var mainCurrent = 0;
    clearTimeout(typingTimer);

    function tickMain() {
      if (!mainEl) {
        return;
      }
      mainEl.innerHTML = pixelText(mainValue.slice(0, mainCurrent), 'main', true, step.type === 'welcome' ? 12 : 8);
      mainCurrent += 1;
      if (mainCurrent <= mainValue.length) {
        typingTimer = setTimeout(tickMain, 176);
      }
    }

    mainEl.innerHTML = pixelText('', 'main', true, step.type === 'welcome' ? 12 : 8);
    tickMain();
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
    var active = [];
    var ghost = [];
    var lines = wrapText(value, maxChars).slice(0, maxLines);
    var textHeight = lines.length * lineBoxHeight + Math.max(0, lines.length - 1) * (lineHeight - lineBoxHeight);
    var baseY = center ? Math.max(0, (viewHeight - textHeight) / 2) : 0;
    lines.forEach(function (line, lineIndex) {
      var offsetX = center ? Math.max(0, (viewWidth - pixelLineWidth(line, cell, gap, charGap)) / 2) : 0;
      drawPixelLine(line, offsetX, baseY + lineIndex * lineHeight, cell, gap, charGap, active, ghost);
    });
    return [
      '<svg viewBox="0 0 ' + viewWidth + ' ' + viewHeight + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + escapeHtml(value) + '">',
      '<g class="pixel-terminal-ghost">' + ghost.join('') + '</g>',
      '<g class="pixel-terminal-active">' + active.join('') + '</g>',
      '</svg>'
    ].join('');
  }

  function drawPixelLine(line, offsetX, offsetY, cell, gap, charGap, active, ghost) {
    var x = offsetX;
    for (var c = 0; c < line.length; c += 1) {
      var glyph = GLYPHS[line.charAt(c)] || GLYPHS[' '];
      for (var row = 0; row < glyph.length; row += 1) {
        for (var col = 0; col < glyph[row].length; col += 1) {
          var rect = '<rect x="' + round(x + col * (cell + gap)) + '" y="' + round(offsetY + row * (cell + gap)) + '" width="' + cell + '" height="' + cell + '"></rect>';
          if (glyph[row].charAt(col) === '1') {
            active.push(rect);
          } else {
            ghost.push(rect);
          }
        }
      }
      x += glyph[0].length * (cell + gap) + charGap;
    }
  }

  function pixelLineWidth(text, cell, gap, charGap) {
    var width = 0;
    for (var i = 0; i < text.length; i += 1) {
      width += (GLYPHS[text.charAt(i)] || GLYPHS[' '])[0].length * (cell + gap) + charGap;
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

  function handleInput(input) {
    var direct = input.getAttribute('data-bind');
    var list = input.getAttribute('data-list');
    var id = input.getAttribute('data-id');
    var field = input.getAttribute('data-field');
    if (direct) {
      draft[direct] = input.value;
    } else if (list && id && field) {
      var item = findItem(list, id);
      if (item) {
        item[field] = input.value;
      }
    }
    refreshDynamic();
  }

  function handleSavingToggle(input) {
    var key = input.getAttribute('data-toggle-saving');
    if (key && Object.prototype.hasOwnProperty.call(draft.savingsPlan, key)) {
      draft.savingsPlan[key] = Boolean(input.checked);
      render();
    }
  }

  function refreshDynamic() {
    var summary = calculateSummary();
    replaceAll('[data-summary-grid]', renderSummaryGrid(summary));
    replaceAll('[data-partition-rail]', renderPartitionRail(summary));
    setText('[data-total="fixed"]', formatMoney(summary.fixedTotal));
    setText('[data-total="future"]', formatMoney(summary.futureTotal));
    setText('[data-total="goals"]', formatMoney(summary.goalTotal));
    setText('[data-total="savings"]', formatMoney(summary.savingsTotal));
    setText('[data-total="wishlist"]', formatMoney(summary.wishlistTotal));
    setText('[data-total="available"]', summary.hasSalary ? formatMoney(summary.available) : 'Sueldo pendiente');
  }

  function replaceAll(selector, html) {
    root.querySelectorAll(selector).forEach(function (node) {
      var wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      node.replaceWith(wrapper.firstElementChild);
    });
  }

  function setText(selector, text) {
    root.querySelectorAll(selector).forEach(function (node) {
      node.textContent = text;
    });
  }

  function calculateSummary() {
    var salary = toNumber(draft.salary);
    var fixedTotal = sum(draft.fixed, 'amount');
    var futureTotal = draft.savingsPlan.future ? toNumber(draft.futureMonthly) : 0;
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
    return String(value || '').trim() !== '';
  }

  function sum(items, key) {
    return (items || []).reduce(function (total, item) {
      return total + toNumber(item && item[key]);
    }, 0);
  }

  function toNumber(value) {
    var number = Number(String(value || '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(number) ? Math.max(0, number) : 0;
  }

  function share(amount, salary) {
    if (!salary) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round((amount / salary) * 100)));
  }

  function formatMoney(value) {
    var number = Number(String(value || '').replace(/[^\d.-]/g, ''));
    var amount = Number.isFinite(number) ? Math.round(number) : 0;
    var sign = amount < 0 ? '-' : '';
    return sign + 'Gs. ' + String(Math.abs(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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

  function setStep(nextIndex) {
    index = Math.max(0, Math.min(steps.length - 1, nextIndex));
    render();
  }

  function skip() {
    setStep(steps.length - 1);
  }

  function restart() {
    draft = clone(defaults);
    setStep(0);
  }

  function updateChrome(step) {
    if (statusLine) {
      statusLine.textContent = step.status;
    }
    if (nextButton) {
      nextButton.querySelector('.action-key-label').textContent = index === 0 ? 'COMENZAR' : (index === steps.length - 1 ? 'ENTRAR' : 'GUARDAR');
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function round(value) {
    return String(Math.round(Number(value || 0) * 100) / 100);
  }

  root.addEventListener('input', function (event) {
    var input = event.target.closest ? event.target.closest('input') : null;
    if (input) {
      handleInput(input);
    }
  });

  root.addEventListener('click', function (event) {
    var stepButton = event.target.closest ? event.target.closest('[data-step]') : null;
    var addButton = event.target.closest ? event.target.closest('[data-add]') : null;
    var removeButton = event.target.closest ? event.target.closest('[data-remove]') : null;
    var actionButton = event.target.closest ? event.target.closest('[data-tour-action]') : null;
    if (stepButton) {
      setStep(Number(stepButton.getAttribute('data-step')));
    } else if (addButton) {
      addItem(addButton.getAttribute('data-add'));
    } else if (removeButton) {
      removeItem(removeButton.getAttribute('data-remove'), removeButton.getAttribute('data-id'));
    } else if (actionButton) {
      handleAction(actionButton.getAttribute('data-tour-action'));
    }
  });

  root.addEventListener('change', function (event) {
    var toggle = event.target.closest ? event.target.closest('[data-toggle-saving]') : null;
    if (toggle) {
      handleSavingToggle(toggle);
    }
  });

  document.addEventListener('click', function (event) {
    if (event.target.closest && event.target.closest('#onboarding-next')) {
      if (index >= steps.length - 1) {
        skip();
      } else {
        setStep(index + 1);
      }
    }
  });

  document.addEventListener('click', function (event) {
    var actionButton = event.target.closest ? event.target.closest('[data-tour-action]') : null;
    if (actionButton && !root.contains(actionButton)) {
      handleAction(actionButton.getAttribute('data-tour-action'));
    }
  });

  document.addEventListener('submit', function (event) {
    if (event.target.closest && event.target.closest('.onboard-form')) {
      event.preventDefault();
    }
  });

  function handleAction(action) {
    if (action === 'prev') {
      setStep(index - 1);
    } else if (action === 'skip' || action === 'finish') {
      skip();
    } else if (action === 'restart') {
      restart();
    }
  }

  render();
}());
