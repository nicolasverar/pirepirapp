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
    { code: 'INICIO', title: 'SUELDO', hint: 'MONTO MENSUAL', type: 'salary', status: 'sueldo mensual' },
    { code: 'FIJOS', title: 'FIJOS', hint: 'GASTOS DEL MES', type: 'fixed', status: 'gastos fijos' },
    { code: 'FUTURO', title: 'FUTURO', hint: 'AHORRO LARGO', type: 'future', status: 'ahorro futuro' },
    { code: 'METAS', title: 'METAS', hint: 'OBJETIVOS', type: 'goals', status: 'metas' },
    { code: 'COSAS', title: 'COSAS', hint: 'QUIERO COMPRAR', type: 'wishlist', status: 'cosas que quiero' },
    { code: 'LISTO', title: 'LISTO', hint: 'RESUMEN', type: 'summary', status: 'listo' }
  ];

  var defaults = {
    salary: '3500000',
    payDay: '1',
    startMonth: 'Julio 2026',
    fixed: [
      { id: 'fixed-1', title: 'Alquiler', amount: '1050000' },
      { id: 'fixed-2', title: 'Internet', amount: '165000' },
      { id: 'fixed-3', title: 'Luz y agua', amount: '230000' }
    ],
    futureTitle: 'Futuro',
    futureMonthly: '350000',
    futureAccumulated: '0',
    goals: [
      { id: 'goal-1', title: 'Notebook', monthly: '300000', target: '6000000' }
    ],
    wishlist: [
      { id: 'wish-1', title: 'Auriculares', cost: '450000' }
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
      '<section class="onboarding-stage is-' + escapeHtml(variant) + '">',
      renderTopline(step),
      renderCopyShell(step),
      renderWork(step),
      renderProgress(),
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
      '<div class="pixel-terminal-sub" data-pixel-sub></div>',
      '</div>',
      '</section>'
    ].join('');
  }

  function renderWork(step) {
    var summary = calculateSummary();
    if (variant === 'console') {
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
      index < steps.length - 1 ? renderLiveSummary(summary) : '',
      '</section>'
    ].join('');
  }

  function renderStepForm(step, summary) {
    if (step.type === 'salary') {
      return renderSalaryForm();
    }
    if (step.type === 'fixed') {
      return renderFixedForm(summary);
    }
    if (step.type === 'future') {
      return renderFutureForm(summary);
    }
    if (step.type === 'goals') {
      return renderGoalsForm(summary);
    }
    if (step.type === 'wishlist') {
      return renderWishlistForm();
    }
    return renderSummaryPanel(summary);
  }

  function renderSalaryForm() {
    return [
      '<form class="onboard-form" data-onboard-form="salary">',
      renderFormTitle('Primer inicio', 'Sueldo'),
      '<div class="onboard-field-grid">',
      '<div class="onboard-row is-single">',
      renderControl('Sueldo mensual', 'number', draft.salary, 'data-bind="salary" min="0" step="1" inputmode="numeric"'),
      '</div>',
      '<div class="onboard-row is-double">',
      renderControl('Dia cobro', 'number', draft.payDay, 'data-bind="payDay" min="1" max="31" step="1" inputmode="numeric"'),
      renderControl('Mes inicial', 'text', draft.startMonth, 'data-bind="startMonth" maxlength="24" autocomplete="off"'),
      '</div>',
      '</div>',
      '</form>'
    ].join('');
  }

  function renderFixedForm(summary) {
    return [
      '<form class="onboard-form" data-onboard-form="fixed">',
      renderFormTitle('Gastos fijos', 'Fijos'),
      '<div class="onboard-field-grid">',
      draft.fixed.map(function (item) {
        return renderMoneyRow('fixed', item.id, item.title, item.amount, 'Gasto fijo', 'Monto');
      }).join(''),
      '</div>',
      '<button class="onboard-add-key" type="button" data-add="fixed">Agregar fijo</button>',
      renderTotalLine('Total fijos', summary.fixedTotal, 'fixed'),
      '</form>'
    ].join('');
  }

  function renderFutureForm(summary) {
    return [
      '<form class="onboard-form" data-onboard-form="future">',
      renderFormTitle('Ahorro largo', 'Futuro'),
      '<div class="onboard-field-grid">',
      '<div class="onboard-row is-double">',
      renderControl('Nombre', 'text', draft.futureTitle, 'data-bind="futureTitle" maxlength="32" autocomplete="off"'),
      renderControl('Mensual', 'number', draft.futureMonthly, 'data-bind="futureMonthly" min="0" step="1" inputmode="numeric"'),
      '</div>',
      '<div class="onboard-row is-single">',
      renderControl('Ya acumulado', 'number', draft.futureAccumulated, 'data-bind="futureAccumulated" min="0" step="1" inputmode="numeric"'),
      '</div>',
      '</div>',
      renderTotalLine('Futuro mensual', summary.futureTotal, 'future'),
      '</form>'
    ].join('');
  }

  function renderGoalsForm(summary) {
    return [
      '<form class="onboard-form" data-onboard-form="goals">',
      renderFormTitle('Objetivos', 'Metas'),
      '<div class="onboard-field-grid">',
      draft.goals.map(function (item) {
        return [
          '<div class="onboard-row">',
          renderControl('Meta', 'text', item.title, 'data-list="goals" data-id="' + escapeHtml(item.id) + '" data-field="title" maxlength="32" autocomplete="off"'),
          renderControl('Mensual', 'number', item.monthly, 'data-list="goals" data-id="' + escapeHtml(item.id) + '" data-field="monthly" min="0" step="1" inputmode="numeric"'),
          renderRemoveButton('goals', item.id),
          '</div>',
          '<div class="onboard-row is-single">',
          renderControl('Objetivo', 'number', item.target, 'data-list="goals" data-id="' + escapeHtml(item.id) + '" data-field="target" min="1" step="1" inputmode="numeric"'),
          '</div>'
        ].join('');
      }).join(''),
      '</div>',
      '<button class="onboard-add-key" type="button" data-add="goals">Agregar meta</button>',
      renderTotalLine('Metas mensual', summary.goalTotal, 'goals'),
      '</form>'
    ].join('');
  }

  function renderWishlistForm() {
    return [
      '<form class="onboard-form" data-onboard-form="wishlist">',
      renderFormTitle('Compras deseadas', 'Cosas'),
      '<div class="onboard-field-grid">',
      draft.wishlist.map(function (item) {
        return renderMoneyRow('wishlist', item.id, item.title, item.cost, 'Cosa', 'Costo');
      }).join(''),
      '</div>',
      '<button class="onboard-add-key" type="button" data-add="wishlist">Agregar cosa</button>',
      renderTotalLine('Cosas total', calculateSummary().wishlistTotal, 'wishlist'),
      '</form>'
    ].join('');
  }

  function renderSummaryPanel(summary) {
    return [
      '<section class="summary-panel" aria-label="Resumen inicial">',
      '<div class="summary-title"><span>Config inicial</span><b>Entrar</b></div>',
      renderSummaryGrid(summary),
      renderPartitionRail(summary),
      '</section>'
    ].join('');
  }

  function renderLiveSummary(summary) {
    return [
      '<section class="live-summary" aria-label="Resumen en vivo">',
      '<div class="summary-title"><span>Resumen</span><b data-total="available">' + escapeHtml(formatMoney(summary.available)) + '</b></div>',
      renderSummaryGrid(summary),
      renderPartitionRail(summary),
      '</section>'
    ].join('');
  }

  function renderSummaryGrid(summary) {
    return [
      '<div class="summary-grid" data-summary-grid>',
      '<div class="summary-cell"><span>Sueldo</span><b>' + escapeHtml(formatMoney(summary.salary)) + '</b></div>',
      '<div class="summary-cell"><span>Fijos</span><b>' + escapeHtml(formatMoney(summary.fixedTotal)) + '</b></div>',
      '<div class="summary-cell"><span>Ahorro</span><b>' + escapeHtml(formatMoney(summary.savingsTotal)) + '</b></div>',
      '<div class="summary-cell"><span>Libre</span><b>' + escapeHtml(formatMoney(summary.available)) + '</b></div>',
      '</div>'
    ].join('');
  }

  function renderPartitionRail(summary) {
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

  function renderFormTitle(label, value) {
    return '<div class="onboard-form-title"><span>' + escapeHtml(label) + '</span><b>' + escapeHtml(value) + '</b></div>';
  }

  function renderMoneyRow(list, id, title, amount, titleLabel, amountLabel) {
    return [
      '<div class="onboard-row">',
      renderControl(titleLabel, 'text', title, 'data-list="' + escapeHtml(list) + '" data-id="' + escapeHtml(id) + '" data-field="title" maxlength="32" autocomplete="off"'),
      renderControl(amountLabel, 'number', amount, 'data-list="' + escapeHtml(list) + '" data-id="' + escapeHtml(id) + '" data-field="' + (list === 'wishlist' ? 'cost' : 'amount') + '" min="0" step="1" inputmode="numeric"'),
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
    var subEl = root.querySelector('[data-pixel-sub]');
    var mainValue = step.title;
    var subValue = step.hint;
    var mainCurrent = 0;
    var subCurrent = 0;
    clearTimeout(typingTimer);

    function tickMain() {
      if (!mainEl || !subEl) {
        return;
      }
      mainEl.innerHTML = pixelText(mainValue.slice(0, mainCurrent), 'main');
      mainCurrent += 1;
      if (mainCurrent <= mainValue.length) {
        typingTimer = setTimeout(tickMain, 36);
        return;
      }
      tickSub();
    }

    function tickSub() {
      if (!subEl) {
        return;
      }
      subEl.innerHTML = pixelText(subValue.slice(0, subCurrent), 'sub');
      subCurrent += 1;
      if (subCurrent <= subValue.length) {
        typingTimer = setTimeout(tickSub, 28);
      }
    }

    mainEl.innerHTML = pixelText('', 'main');
    subEl.innerHTML = pixelText('', 'sub');
    tickMain();
  }

  function pixelText(text, kind) {
    var value = normalizePixelText(text);
    var cell = kind === 'main' ? 3.1 : 2.15;
    var gap = kind === 'main' ? 0.85 : 0.62;
    var charGap = kind === 'main' ? 2.2 : 1.55;
    var maxChars = kind === 'main' ? 16 : 24;
    var maxLines = kind === 'main' ? 2 : 1;
    var viewWidth = 320;
    var viewHeight = kind === 'main' ? 76 : 30;
    var lineHeight = 7 * (cell + gap) - gap + (kind === 'main' ? 7 : 4);
    var active = [];
    var ghost = [];
    wrapText(value, maxChars).slice(0, maxLines).forEach(function (line, lineIndex) {
      drawPixelLine(line, 0, lineIndex * lineHeight, cell, gap, charGap, active, ghost);
    });
    return [
      '<svg viewBox="0 0 ' + viewWidth + ' ' + viewHeight + '" preserveAspectRatio="xMinYMin meet" role="img" aria-label="' + escapeHtml(value) + '">',
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

  function refreshDynamic() {
    var summary = calculateSummary();
    replaceAll('[data-summary-grid]', renderSummaryGrid(summary));
    replaceAll('[data-partition-rail]', renderPartitionRail(summary));
    setText('[data-total="fixed"]', formatMoney(summary.fixedTotal));
    setText('[data-total="future"]', formatMoney(summary.futureTotal));
    setText('[data-total="goals"]', formatMoney(summary.goalTotal));
    setText('[data-total="wishlist"]', formatMoney(summary.wishlistTotal));
    setText('[data-total="available"]', formatMoney(summary.available));
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
    var futureTotal = toNumber(draft.futureMonthly);
    var goalTotal = sum(draft.goals, 'monthly');
    var wishlistTotal = sum(draft.wishlist, 'cost');
    var savingsTotal = futureTotal + goalTotal;
    return {
      salary: salary,
      fixedTotal: fixedTotal,
      futureTotal: futureTotal,
      goalTotal: goalTotal,
      wishlistTotal: wishlistTotal,
      savingsTotal: savingsTotal,
      available: salary - fixedTotal - savingsTotal
    };
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
      draft.fixed.push({ id: 'fixed-' + uid, title: 'Nuevo fijo', amount: '0' });
    } else if (list === 'goals') {
      draft.goals.push({ id: 'goal-' + uid, title: 'Nueva meta', monthly: '0', target: '1000000' });
    } else if (list === 'wishlist') {
      draft.wishlist.push({ id: 'wish-' + uid, title: 'Nueva cosa', cost: '0' });
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
              item[key] = key === 'title' ? '' : '0';
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
      nextButton.querySelector('.action-key-label').textContent = index === steps.length - 1 ? 'ENTRAR' : 'GUARDAR';
    }
    document.querySelectorAll('[data-tour-action="prev"]').forEach(function (button) {
      button.disabled = index === 0;
    });
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
