(function () {
  'use strict';

  var currentScenario = 'normal';
  var currentMode = 'detail';

  var palette = {
    fixed: ['#87985d', '#768851', '#9aaa6b', '#68794a', '#aebd7a'],
    saving: ['#b7c67f', '#c8d38d', '#9daf70', '#a4b573', '#d1dc94'],
    available: ['#68794a'],
    excess: ['#d6aa52']
  };

  var scenarios = {
    normal: {
      salary: 5000000,
      fixed: [
        { label: 'Alquiler', amount: 1200000 },
        { label: 'Servicios', amount: 320000 },
        { label: 'Internet', amount: 180000 },
        { label: 'Seguro', amount: 150000 }
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

  function sum(items) {
    return (items || []).reduce(function (total, item) {
      return total + Number(item.amount || 0);
    }, 0);
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function money(value) {
    return 'Gs. ' + String(Math.round(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function pct(value, total) {
    if (!total) {
      return 0;
    }
    return Math.round((Number(value || 0) / total) * 1000) / 10;
  }

  function pctLabel(value, total) {
    return String(pct(value, total)).replace('.', ',') + '%';
  }

  function styleVars(vars) {
    return Object.keys(vars).map(function (key) {
      return key + ':' + vars[key];
    }).join(';');
  }

  function scenarioModel() {
    var source = scenarios[currentScenario] || scenarios.normal;
    var fixedTotal = sum(source.fixed);
    var savingsTotal = sum(source.savings);
    var committed = fixedTotal + savingsTotal;
    var available = Math.max(0, source.salary - committed);
    var excess = Math.max(0, committed - source.salary);
    return {
      salary: source.salary,
      fixedTotal: fixedTotal,
      savingsTotal: savingsTotal,
      available: available,
      excess: excess,
      committed: committed,
      fixed: source.fixed,
      savings: source.savings,
      scale: Math.max(source.salary, committed, 1)
    };
  }

  function components(model) {
    if (currentMode === 'macro') {
      return [
        { label: 'Gastos fijos', group: 'fixed', amount: model.fixedTotal, color: palette.fixed[0] },
        { label: 'Ahorros/metas', group: 'saving', amount: model.savingsTotal, color: palette.saving[0] },
        { label: 'Disponible', group: 'available', amount: model.available, color: palette.available[0] },
        { label: 'Exceso', group: 'excess', amount: model.excess, color: palette.excess[0] }
      ].filter(nonZero);
    }

    return []
      .concat(model.fixed.map(function (item, index) {
        return componentFromItem(item, 'fixed', palette.fixed[index % palette.fixed.length]);
      }))
      .concat(model.savings.map(function (item, index) {
        return componentFromItem(item, 'saving', palette.saving[index % palette.saving.length]);
      }))
      .concat(model.available > 0 ? [{ label: 'Disponible', group: 'available', amount: model.available, color: palette.available[0] }] : [])
      .concat(model.excess > 0 ? [{ label: 'Exceso', group: 'excess', amount: model.excess, color: palette.excess[0] }] : []);
  }

  function nonZero(item) {
    return Number(item.amount || 0) > 0;
  }

  function componentFromItem(item, group, color) {
    return {
      label: item.label,
      group: group,
      amount: Number(item.amount || 0),
      color: color
    };
  }

  function groupName(group) {
    if (group === 'fixed') {
      return 'Gasto fijo';
    }
    if (group === 'saving') {
      return 'Ahorro/meta';
    }
    if (group === 'excess') {
      return 'Exceso';
    }
    return 'Disponible';
  }

  function renderSummary(model) {
    var availableClass = model.excess ? ' is-alert' : '';
    return [
      '<div class="salary-kpi"><span>Sueldo</span><b>' + escapeHtml(money(model.salary)) + '</b></div>',
      '<div class="salary-kpi"><span>Fijos</span><b>' + escapeHtml(pctLabel(model.fixedTotal, model.salary)) + '</b></div>',
      '<div class="salary-kpi"><span>Ahorros</span><b>' + escapeHtml(pctLabel(model.savingsTotal, model.salary)) + '</b></div>',
      '<div class="salary-kpi' + availableClass + '"><span>' + (model.excess ? 'Exceso' : 'Libre') + '</span><b>' + escapeHtml(model.excess ? money(model.excess) : pctLabel(model.available, model.salary)) + '</b></div>'
    ].join('');
  }

  function renderPanel(code, title, detail, body) {
    return [
      '<article class="panel">',
      '<header class="panel-head">',
      '<span class="panel-code">' + escapeHtml(code) + '</span>',
      '<div><h2>' + escapeHtml(title) + '</h2><small>' + escapeHtml(detail) + '</small></div>',
      '</header>',
      body,
      '</article>'
    ].join('');
  }

  function renderRail(model) {
    var scale = model.scale;
    var salaryLine = pct(model.salary, scale);
    var list = components(model);
    return renderPanel('A', 'Sueldo como regla 100%', 'cada componente ocupa su tramo del sueldo', [
      '<div class="salary-rail-wrap" style="' + styleVars({ '--salary-line': salaryLine + '%' }) + '">',
      '<span class="salary-line" aria-hidden="true"></span>',
      '<div class="salary-rail">',
      list.map(function (item) {
        return [
          '<div class="salary-segment is-' + escapeHtml(item.group) + '" style="' + styleVars({ '--w': pct(item.amount, scale) + '%', '--c': item.color }) + '" title="' + escapeHtml(item.label + ' ' + money(item.amount)) + '">',
          '<span>' + escapeHtml(item.label) + '</span>',
          '<b>' + escapeHtml(pctLabel(item.amount, model.salary)) + '</b>',
          '</div>'
        ].join('');
      }).join(''),
      '</div>',
      '<div class="rail-scale"><span>0</span><span>50%</span><span>100% sueldo</span>' + (model.excess ? '<span>exceso</span>' : '') + '</div>',
      '</div>',
      renderComponentLegend(model, list)
    ].join(''));
  }

  function renderTiles(model) {
    var list = components(model);
    var units = buildUnits(list, model);
    return renderPanel('B', 'Mapa 100 casillas', 'cada cuadro representa cerca de 1% del sueldo', [
      '<div class="tile-board" aria-label="Mapa de sueldo en 100 casillas">',
      units.salary.map(function (item) {
        return '<i class="tile is-' + escapeHtml(item.group) + '" style="' + styleVars({ '--c': item.color }) + '" title="' + escapeHtml(item.label) + '"></i>';
      }).join(''),
      '</div>',
      model.excess ? '<div class="overflow-row"><span>EXCESO FUERA DEL 100%</span><div>' + units.overflow.map(function (item) {
        return '<i class="tile is-excess" style="' + styleVars({ '--c': item.color }) + '" title="' + escapeHtml(item.label) + '"></i>';
      }).join('') + '</div></div>' : '',
      renderComponentLegend(model, list)
    ].join(''));
  }

  function buildUnits(list, model) {
    var salaryUnits = [];
    var overflowUnits = [];
    var used = 0;
    list.forEach(function (item) {
      var target = Math.max(1, Math.round(pct(item.amount, model.salary)));
      var unit;
      for (unit = 0; unit < target; unit += 1) {
        if (item.group === 'excess' || used >= 100) {
          overflowUnits.push(item);
        } else {
          salaryUnits.push(item);
          used += 1;
        }
      }
    });
    while (salaryUnits.length < 100) {
      salaryUnits.push({ label: 'sin asignar', group: 'empty', color: 'transparent' });
    }
    return {
      salary: salaryUnits.slice(0, 100),
      overflow: overflowUnits
    };
  }

  function renderLedger(model) {
    return renderPanel('C', 'Desglose jerarquico', 'macro arriba, componentes abajo, todo medido contra sueldo', [
      '<div class="hierarchy">',
      renderGroupBlock('Gastos fijos', model.fixedTotal, model.salary, model.fixed, 'fixed', palette.fixed),
      renderGroupBlock('Ahorros/metas', model.savingsTotal, model.salary, model.savings, 'saving', palette.saving),
      renderGroupBlock('Disponible', model.available, model.salary, [{ label: 'Libre para el mes', amount: model.available }], 'available', palette.available),
      model.excess ? renderGroupBlock('Exceso', model.excess, model.salary, [{ label: 'Monto sobreasignado', amount: model.excess }], 'excess', palette.excess) : '',
      '</div>'
    ].join(''));
  }

  function renderGroupBlock(title, amount, salary, children, group, colors) {
    if (amount <= 0) {
      return '';
    }
    return [
      '<section class="group-block is-' + escapeHtml(group) + '">',
      '<header><strong>' + escapeHtml(title) + '</strong><span>' + escapeHtml(money(amount)) + ' / ' + escapeHtml(pctLabel(amount, salary)) + '</span></header>',
      '<div class="group-meter"><i style="' + styleVars({ '--w': Math.min(pct(amount, salary), 100) + '%', '--c': colors[0] }) + '"></i></div>',
      '<div class="child-list">',
      (children || []).map(function (item, index) {
        var color = colors[index % colors.length];
        return [
          '<div class="child-row">',
          '<span><b>' + escapeHtml(item.label) + '</b><small>' + escapeHtml(groupName(group)) + '</small></span>',
          '<strong>' + escapeHtml(money(item.amount)) + '</strong>',
          '<em>' + escapeHtml(pctLabel(item.amount, salary)) + '</em>',
          '<i class="child-meter"><i style="' + styleVars({ '--w': Math.min(pct(item.amount, salary), 100) + '%', '--c': color }) + '"></i></i>',
          '</div>'
        ].join('');
      }).join(''),
      '</div>',
      '</section>'
    ].join('');
  }

  function renderComponentLegend(model, list) {
    return [
      '<div class="component-list">',
      list.map(function (item) {
        return [
          '<div class="component-row is-' + escapeHtml(item.group) + '">',
          '<i style="' + styleVars({ '--c': item.color }) + '"></i>',
          '<span><strong>' + escapeHtml(item.label) + '</strong><small>' + escapeHtml(groupName(item.group)) + '</small></span>',
          '<b>' + escapeHtml(money(item.amount)) + '</b>',
          '<em>' + escapeHtml(pctLabel(item.amount, model.salary)) + '</em>',
          '</div>'
        ].join('');
      }).join(''),
      '</div>'
    ].join('');
  }

  function render() {
    var model = scenarioModel();
    document.getElementById('salary-summary').innerHTML = renderSummary(model);
    document.getElementById('preview-grid').innerHTML = [
      renderRail(model),
      renderTiles(model),
      renderLedger(model)
    ].join('');
  }

  function bindChoice(selector, attr, callback) {
    Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute(attr);
        Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        callback(value);
        render();
      });
    });
  }

  bindChoice('[data-scenario]', 'data-scenario', function (value) {
    currentScenario = value || 'normal';
  });
  bindChoice('[data-mode]', 'data-mode', function (value) {
    currentMode = value || 'detail';
  });
  render();
}());
