(function () {
  'use strict';

  var colors = {
    fixed: '#87985d',
    saving: '#b7c67f',
    available: '#68794a',
    future: '#c8d38d',
    wish: '#7b8c55',
    excess: '#d6aa52'
  };

  var scenarios = {
    normal: {
      salary: 5000000,
      fixed: [
        { label: 'Alquiler', amount: 1200000 },
        { label: 'Servicios', amount: 320000 },
        { label: 'Internet', amount: 180000 }
      ],
      savings: [
        { label: 'Futuro', amount: 600000 },
        { label: 'IMPA', amount: 450000 },
        { label: 'Viaje', amount: 250000 }
      ]
    },
    fixed: {
      salary: 5000000,
      fixed: [
        { label: 'Alquiler', amount: 1700000 },
        { label: 'Tarjeta', amount: 680000 },
        { label: 'Servicios', amount: 420000 },
        { label: 'Internet', amount: 180000 }
      ],
      savings: [
        { label: 'Futuro', amount: 400000 },
        { label: 'IMPA', amount: 250000 },
        { label: 'Pinerr', amount: 150000 }
      ]
    },
    over: {
      salary: 5000000,
      fixed: [
        { label: 'Alquiler', amount: 1800000 },
        { label: 'Tarjeta', amount: 900000 },
        { label: 'Servicios', amount: 450000 }
      ],
      savings: [
        { label: 'Futuro', amount: 700000 },
        { label: 'IMPA', amount: 650000 },
        { label: 'Notebook', amount: 800000 }
      ]
    }
  };

  var currentScenario = 'normal';

  function sum(items) {
    return (items || []).reduce(function (total, item) {
      return total + Number(item.amount || 0);
    }, 0);
  }

  function model(data) {
    var fixed = sum(data.fixed);
    var savings = sum(data.savings);
    var committed = fixed + savings;
    var available = Math.max(0, data.salary - committed);
    var excess = Math.max(0, committed - data.salary);
    var scale = data.salary + excess;
    return {
      salary: data.salary,
      fixed: fixed,
      savings: savings,
      available: available,
      excess: excess,
      scale: scale || 1,
      committed: committed,
      fixedItems: data.fixed || [],
      savingItems: data.savings || []
    };
  }

  function money(value) {
    return 'Gs. ' + String(Math.round(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function percent(value, total) {
    if (!total) {
      return '0%';
    }
    var result = (Number(value || 0) / total) * 100;
    return (Math.round(result * 10) / 10).toString().replace('.', ',') + '%';
  }

  function pctValue(value, total) {
    if (!total) {
      return 0;
    }
    return Math.max(0, Math.round((Number(value || 0) / total) * 10000) / 100);
  }

  function styleVars(vars) {
    return Object.keys(vars).map(function (key) {
      return key + ':' + vars[key];
    }).join(';');
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderPrototype(code, title, detail, body) {
    return [
      '<article class="prototype">',
      '<div class="prototype-head">',
      '<div><h2>' + escapeHtml(title) + '</h2><small>' + escapeHtml(detail) + '</small></div>',
      '<span class="prototype-code">' + escapeHtml(code) + '</span>',
      '</div>',
      body,
      '</article>'
    ].join('');
  }

  function renderMoneyLine(left, right) {
    return '<div class="money-line"><span>' + escapeHtml(left) + '</span><b>' + escapeHtml(right) + '</b></div>';
  }

  function renderRail(data) {
    var d = model(data);
    var segments = [
      { label: 'Fijos', amount: d.fixed, color: colors.fixed },
      { label: 'Ahorros', amount: d.savings, color: colors.saving },
      { label: 'Disponible', amount: d.available, color: colors.available },
      { label: 'Exceso', amount: d.excess, color: colors.excess }
    ].filter(function (item) {
      return item.amount > 0;
    });
    var salaryLine = pctValue(d.salary, d.scale);
    return renderPrototype('A', 'Barra LCD segmentada', 'la mas directa y compacta', [
      renderMoneyLine('Sueldo mensual', money(d.salary)),
      '<div class="rail-shell" style="' + styleVars({ '--salary-line': salaryLine + '%' }) + '">',
      '<span class="salary-marker" aria-hidden="true"></span>',
      '<div class="lcd-rail">',
      segments.map(function (item) {
        return '<div class="lcd-segment" style="' + styleVars({ '--w': pctValue(item.amount, d.scale) + '%', '--c': item.color }) + '"><span>' + escapeHtml(item.label) + '</span></div>';
      }).join(''),
      '</div>',
      '<div class="rail-ticks" aria-hidden="true">' + new Array(11).join('<i></i>') + '</div>',
      '</div>',
      renderTags(d),
      renderGranular('Fijos comprometidos', d.fixedItems, d.fixed, colors.fixed, false),
      renderGranular('Ahorros y metas', d.savingItems, d.savings, colors.saving, false)
    ].join(''));
  }

  function renderGauge(data) {
    var d = model(data);
    var parts = [
      { label: 'Fijos', amount: d.fixed, color: colors.fixed },
      { label: 'Ahorros', amount: d.savings, color: colors.saving },
      { label: 'Disponible', amount: d.available, color: colors.available },
      { label: 'Exceso', amount: d.excess, color: colors.excess }
    ].filter(function (item) { return item.amount > 0; });
    var start = 180;
    var arcs = parts.map(function (item) {
      var sweep = (item.amount / d.scale) * 180;
      var path = arcPath(154, 142, 104, start, start + sweep);
      start += sweep;
      return '<path class="gauge-arc" d="' + path + '" style="' + styleVars({ '--c': item.color }) + '"></path>';
    }).join('');
    var needleAngle = 180 + ((d.committed / d.scale) * 180);
    var needle = polar(154, 142, 76, needleAngle);
    return renderPrototype('B', 'Gauge de distribucion', 'sensacion analogica de limite', [
      '<div class="gauge-stage">',
      '<svg class="gauge-svg" viewBox="0 0 308 184" role="img" aria-label="Gauge de particion">',
      '<path class="gauge-back" d="' + arcPath(154, 142, 104, 180, 360) + '"></path>',
      arcs,
      renderGaugeHatches(),
      '<line class="gauge-needle" x1="154" y1="142" x2="' + needle.x + '" y2="' + needle.y + '"></line>',
      '<circle class="gauge-center" cx="154" cy="142" r="18"></circle>',
      '<text class="gauge-text" x="154" y="132">USADO</text>',
      '<text class="gauge-text" x="154" y="151">' + escapeHtml(percent(d.committed, d.salary)) + '</text>',
      '</svg>',
      '</div>',
      renderTags(d),
      renderGranular('Fijos comprometidos', d.fixedItems, d.fixed, colors.fixed, false),
      renderGranular('Ahorros y metas', d.savingItems, d.savings, colors.saving, false)
    ].join(''));
  }

  function renderMatrix(data) {
    var d = model(data);
    var rows = [
      { label: 'Gastos fijos', amount: d.fixed, color: colors.fixed, detail: d.fixedItems },
      { label: 'Ahorros', amount: d.savings, color: colors.saving, detail: d.savingItems },
      { label: 'Disponible', amount: d.available, color: colors.available, detail: [] },
      { label: 'Exceso', amount: d.excess, color: colors.excess, detail: [] }
    ].filter(function (item) {
      return item.amount > 0;
    });
    return renderPrototype('C', 'Ledger proporcional', 'mas granular y menos decorativo', [
      renderMoneyLine('Sueldo mensual', money(d.salary)),
      '<div class="matrix-list">',
      rows.map(function (row) {
        return [
          '<div class="matrix-row">',
          '<div class="matrix-row-head"><strong>' + escapeHtml(row.label) + '</strong><small>' + escapeHtml(money(row.amount)) + ' / ' + escapeHtml(percent(row.amount, d.salary)) + '</small></div>',
          '<div class="matrix-bar"><i class="matrix-fill" style="' + styleVars({ '--w': Math.min(pctValue(row.amount, d.salary), 100) + '%', '--c': row.color }) + '"></i></div>',
          row.detail.length ? renderGranular('Desglose ' + row.label, row.detail, row.amount, row.color, true) : '',
          '</div>'
        ].join('');
      }).join(''),
      '</div>'
    ].join(''));
  }

  function renderTags(d) {
    return [
      '<div class="tag-line">',
      '<span class="tag">Fijos ' + escapeHtml(percent(d.fixed, d.salary)) + '</span>',
      '<span class="tag is-light">Ahorros ' + escapeHtml(percent(d.savings, d.salary)) + '</span>',
      '<span class="tag">Disp. ' + escapeHtml(percent(d.available, d.salary)) + '</span>',
      d.excess ? '<span class="tag is-danger">Exceso ' + escapeHtml(money(d.excess)) + '</span>' : '',
      '</div>'
    ].join('');
  }

  function renderGranular(title, items, total, color, open) {
    if (!items || !items.length) {
      return '';
    }
    return [
      '<details class="granular"' + (open ? ' open' : '') + '>',
      '<summary><span>' + escapeHtml(title) + '</span><b>' + escapeHtml(money(total)) + '</b></summary>',
      '<div class="granular-lines">',
      items.map(function (item) {
        return [
          '<div class="granular-line">',
          '<span>' + escapeHtml(item.label) + '</span>',
          '<b>' + escapeHtml(money(item.amount)) + '</b>',
          '<i class="mini-meter"><i style="' + styleVars({ '--w': pctValue(item.amount, total) + '%', '--c': color }) + '"></i></i>',
          '</div>'
        ].join('');
      }).join(''),
      '</div>',
      '</details>'
    ].join('');
  }

  function polar(cx, cy, radius, angleDeg) {
    var angle = angleDeg * Math.PI / 180;
    return {
      x: Math.round((cx + radius * Math.cos(angle)) * 100) / 100,
      y: Math.round((cy + radius * Math.sin(angle)) * 100) / 100
    };
  }

  function arcPath(cx, cy, radius, startAngle, endAngle) {
    var start = polar(cx, cy, radius, startAngle);
    var end = polar(cx, cy, radius, endAngle);
    var large = endAngle - startAngle > 180 ? 1 : 0;
    return ['M', start.x, start.y, 'A', radius, radius, 0, large, 1, end.x, end.y].join(' ');
  }

  function renderGaugeHatches() {
    var ticks = [];
    for (var i = 0; i <= 12; i += 1) {
      var angle = 180 + (i * 15);
      var a = polar(154, 142, 84, angle);
      var b = polar(154, 142, 112, angle);
      ticks.push('<line class="gauge-hatch" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '"></line>');
    }
    return ticks.join('');
  }

  function render() {
    var data = scenarios[currentScenario] || scenarios.normal;
    var grid = document.getElementById('preview-grid');
    grid.innerHTML = [
      renderRail(data),
      renderGauge(data),
      renderMatrix(data)
    ].join('');
  }

  function bind() {
    Array.prototype.slice.call(document.querySelectorAll('[data-scenario]')).forEach(function (button) {
      button.addEventListener('click', function () {
        currentScenario = button.getAttribute('data-scenario') || 'normal';
        Array.prototype.slice.call(document.querySelectorAll('[data-scenario]')).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        render();
      });
    });
  }

  bind();
  render();
}());
