(function () {
  'use strict';

  var currentScenario = 'normal';
  var currentMode = 'detail';
  var b1OpenGroups = { fixed: true };
  var selectedSavingNode = 'summary';
  var inlineRevealGroup = 'fixed';
  var lensRevealGroup = 'fixed';
  var accordionRevealGroup = 'fixed';
  var stepRevealIndex = 0;
  var trayRevealGroup = 'fixed';
  var pieOpenGroups = {};
  var pieSavingNode = 'summary';

  var palette = {
    fixed: ['#87985d', '#768851', '#9aaa6b', '#68794a', '#aebd7a'],
    saving: ['#b7c67f', '#c8d38d', '#9daf70', '#a4b573', '#d1dc94'],
    available: ['#68794a'],
    excess: ['#b7615f']
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
    return currentMode === 'macro' ? macroComponents(model) : detailComponents(model);
  }

  function macroComponents(model) {
    return [
      { label: 'Gastos fijos', group: 'fixed', amount: model.fixedTotal, color: palette.fixed[0], pattern: 0 },
      { label: 'Ahorros/metas', group: 'saving', amount: model.savingsTotal, color: palette.saving[0], pattern: 1 },
      { label: 'Disponible', group: 'available', amount: model.available, color: palette.available[0], pattern: 4 },
      { label: 'Exceso', group: 'excess', amount: model.excess, color: palette.excess[0], pattern: 5 }
    ].filter(nonZero);
  }

  function detailComponents(model) {
    return []
      .concat(model.fixed.map(function (item, index) {
        return componentFromItem(item, 'fixed', palette.fixed[index % palette.fixed.length], index);
      }))
      .concat(model.savings.map(function (item, index) {
        return componentFromItem(item, 'saving', palette.saving[index % palette.saving.length], index + model.fixed.length);
      }))
      .concat(model.available > 0 ? [{ label: 'Disponible', group: 'available', amount: model.available, color: palette.available[0], pattern: 4 }] : [])
      .concat(model.excess > 0 ? [{ label: 'Exceso', group: 'excess', amount: model.excess, color: palette.excess[0], pattern: 5 }] : []);
  }

  function nonZero(item) {
    return Number(item.amount || 0) > 0;
  }

  function componentFromItem(item, group, color, index) {
    return {
      label: item.label,
      group: group,
      amount: Number(item.amount || 0),
      color: color,
      pattern: index % 6
    };
  }

  function groupName(group) {
    if (group === 'fixed') {
      return 'Fijo';
    }
    if (group === 'saving') {
      return 'Ahorro';
    }
    if (group === 'saving-future') {
      return 'Futuro';
    }
    if (group === 'saving-goals' || group === 'saving-goal') {
      return 'Meta';
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

  function renderStackBar(items, model, options) {
    var config = options || {};
    var total = config.total || model.scale;
    var salaryLine = Math.min(100, Math.max(0, pct(model.salary, total)));
    var extraClass = config.className ? ' ' + config.className : '';
    var caption = config.caption ? [
      '<div class="stack-caption">',
      '<span>' + escapeHtml(config.caption) + '</span>',
      '<b>' + escapeHtml(config.value || '') + '</b>',
      '</div>'
    ].join('') : '';

    return [
      '<div class="stack-wrap' + extraClass + '" style="' + styleVars({ '--salary-line': salaryLine + '%' }) + '">',
      caption,
      '<div class="stack-bar" role="img" aria-label="' + escapeHtml(config.aria || 'Barra apilada 100 del sueldo') + '">',
      '<span class="stack-salary-line" aria-hidden="true">100%</span>',
      items.map(function (item) {
        var width = pct(item.amount, total);
        var tightClass = width < 8 ? ' is-tiny' : width < 14 ? ' is-tight' : '';
        return [
          '<div class="stack-segment pat-' + escapeHtml(String(item.pattern || 0)) + ' is-' + escapeHtml(item.group) + tightClass + '" style="' + styleVars({ '--w': width + '%', '--c': item.color }) + '" title="' + escapeHtml(item.label + ' - ' + money(item.amount) + ' - ' + pctLabel(item.amount, model.salary)) + '">',
          '<span>' + escapeHtml(item.label) + '</span>',
          '<b>' + escapeHtml(pctLabel(item.amount, model.salary)) + '</b>',
          '</div>'
        ].join('');
      }).join(''),
      '</div>',
      '<div class="stack-axis"><span>0</span><span>50%</span><span>100% sueldo</span>' + (model.excess ? '<span>exceso</span>' : '') + '</div>',
      '</div>'
    ].join('');
  }

  function renderClassicStack(model) {
    var list = components(model);
    return renderPanel('A', 'Barra 100 principal', 'una sola fila; el selector cambia macro o detalle', [
      renderStackBar(list, model, {
        className: 'is-large',
        caption: currentMode === 'macro' ? 'Familias del sueldo' : 'Componentes del sueldo',
        value: 'Sueldo = 100%'
      }),
      renderComponentLegend(model, list)
    ].join(''));
  }

  function renderDualStack(model) {
    var macro = macroComponents(model);
    var detail = detailComponents(model);
    return renderPanel('B', 'Doble nivel', 'arriba familias, abajo componentes exactos', [
      '<div class="tier-grid">',
      renderStackBar(macro, model, { className: 'is-medium', caption: 'Nivel macro', value: pctLabel(model.committed + model.available, model.salary) }),
      renderStackBar(detail, model, { className: 'is-medium', caption: 'Nivel desagregado', value: String(detail.length) + ' tramos' }),
      '</div>',
      renderCompactLegend(model, detail)
    ].join(''));
  }

  function renderFamilyRows(model) {
    var groups = [
      { label: 'Gastos fijos', group: 'fixed', amount: model.fixedTotal, color: palette.fixed[0], children: model.fixed.map(function (item, index) { return componentFromItem(item, 'fixed', palette.fixed[index % palette.fixed.length], index); }) },
      { label: 'Ahorros/metas', group: 'saving', amount: model.savingsTotal, color: palette.saving[0], children: model.savings.map(function (item, index) { return componentFromItem(item, 'saving', palette.saving[index % palette.saving.length], index + model.fixed.length); }) },
      { label: 'Disponible', group: 'available', amount: model.available, color: palette.available[0], children: model.available > 0 ? [{ label: 'Libre', group: 'available', amount: model.available, color: palette.available[0], pattern: 4 }] : [] },
      { label: 'Exceso', group: 'excess', amount: model.excess, color: palette.excess[0], children: model.excess > 0 ? [{ label: 'Exceso', group: 'excess', amount: model.excess, color: palette.excess[0], pattern: 5 }] : [] }
    ].filter(nonZero);

    return renderPanel('C', 'Filas por familia', 'cada fila mide cuanto ocupa esa familia del sueldo', [
      '<div class="group-stack-list">',
      groups.map(function (group) {
        var familyWidth = Math.max(1.2, pct(group.amount, model.scale));
        return [
          '<section class="group-stack-card is-' + escapeHtml(group.group) + '">',
          '<header><strong>' + escapeHtml(group.label) + '</strong><span>' + escapeHtml(money(group.amount)) + ' / ' + escapeHtml(pctLabel(group.amount, model.salary)) + '</span></header>',
          '<div class="group-row-bar">',
          '<div class="group-row-fill pat-' + escapeHtml(String(group.children[0] ? group.children[0].pattern : 0)) + '" style="' + styleVars({ '--w': familyWidth + '%', '--c': group.color }) + '">',
          '<div class="mini-stack">',
          group.children.map(function (item) {
            return '<i class="mini-segment pat-' + escapeHtml(String(item.pattern || 0)) + ' is-' + escapeHtml(item.group) + '" style="' + styleVars({ '--w': pct(item.amount, group.amount) + '%', '--c': item.color }) + '" title="' + escapeHtml(item.label + ' ' + pctLabel(item.amount, model.salary)) + '"></i>';
          }).join(''),
          '</div>',
          '</div>',
          '</div>',
          '<div class="family-tags">',
          group.children.map(function (item) {
            return '<span>' + escapeHtml(item.label) + ' <b>' + escapeHtml(pctLabel(item.amount, model.salary)) + '</b></span>';
          }).join(''),
          '</div>',
          '</section>'
        ].join('');
      }).join(''),
      '</div>'
    ].join(''));
  }

  function renderLedgerStack(model) {
    var list = detailComponents(model).slice().sort(function (left, right) {
      return right.amount - left.amount;
    });
    return renderPanel('D', 'Barra + ranking', 'la barra muestra totalidad; abajo se lee item por item', [
      renderStackBar(list, model, { className: 'is-medium', caption: 'Distribucion ordenada por monto', value: 'mayor a menor' }),
      '<div class="rank-list">',
      list.map(function (item, index) {
        return [
          '<div class="rank-row is-' + escapeHtml(item.group) + '">',
          '<i class="rank-index pat-' + escapeHtml(String(item.pattern || 0)) + '" style="' + styleVars({ '--c': item.color }) + '">' + escapeHtml(String(index + 1)) + '</i>',
          '<span><strong>' + escapeHtml(item.label) + '</strong><small>' + escapeHtml(groupName(item.group)) + '</small></span>',
          '<b>' + escapeHtml(pctLabel(item.amount, model.salary)) + '</b>',
          '<em>' + escapeHtml(money(item.amount)) + '</em>',
          '<div class="rank-meter"><i class="pat-' + escapeHtml(String(item.pattern || 0)) + '" style="' + styleVars({ '--w': Math.min(100, pct(item.amount, model.salary)) + '%', '--c': item.color }) + '"></i></div>',
          '</div>'
        ].join('');
      }).join(''),
      '</div>'
    ].join(''));
  }

  function renderCompactStack(model) {
    var macro = macroComponents(model);
    return renderPanel('E', 'Version compacta', 'candidata para tarjeta de resumen sin ocupar mucho alto', [
      '<div class="compact-board">',
      renderStackBar(macro, model, { className: 'is-compact', caption: 'Sueldo particionado', value: pctLabel(model.committed, model.salary) + ' asignado' }),
      '<div class="compact-kpis">',
      '<span><b>' + escapeHtml(pctLabel(model.fixedTotal, model.salary)) + '</b> fijos</span>',
      '<span><b>' + escapeHtml(pctLabel(model.savingsTotal, model.salary)) + '</b> ahorros</span>',
      '<span><b>' + escapeHtml(model.excess ? pctLabel(model.excess, model.salary) : pctLabel(model.available, model.salary)) + '</b> ' + escapeHtml(model.excess ? 'exceso' : 'libre') + '</span>',
      '</div>',
      '</div>',
      renderCompactLegend(model, macro)
    ].join(''));
  }

  function renderOverflowStack(model) {
    var committedItems = [
      { label: 'Fijos', group: 'fixed', amount: model.fixedTotal, color: palette.fixed[0], pattern: 0 },
      { label: 'Ahorros/metas', group: 'saving', amount: model.savingsTotal, color: palette.saving[0], pattern: 1 },
      { label: 'Libre', group: 'available', amount: model.available, color: palette.available[0], pattern: 4 },
      { label: 'Exceso', group: 'excess', amount: model.excess, color: palette.excess[0], pattern: 5 }
    ].filter(nonZero);

    return renderPanel('F', 'Umbral de sueldo', 'se ve claramente cuando lo asignado pasa del 100%', [
      '<div class="overflow-board">',
      renderStackBar(committedItems, model, { className: 'is-large is-threshold', caption: 'Linea negra = sueldo completo', value: model.excess ? 'pasado ' + pctLabel(model.excess, model.salary) : 'dentro del 100%' }),
      '<div class="threshold-readout ' + (model.excess ? 'is-alert' : '') + '">',
      '<strong>' + escapeHtml(model.excess ? 'Sobreasignacion detectada' : 'Particion dentro del sueldo') + '</strong>',
      '<span>' + escapeHtml(model.excess ? money(model.excess) + ' por encima del sueldo' : money(model.available) + ' queda disponible') + '</span>',
      '</div>',
      '</div>'
    ].join(''));
  }

  function familyGroups(model) {
    return [
      {
        label: 'Gastos fijos',
        group: 'fixed',
        amount: model.fixedTotal,
        color: palette.fixed[0],
        pattern: 0,
        children: model.fixed.map(function (item, index) {
          return componentFromItem(item, 'fixed', palette.fixed[index % palette.fixed.length], index);
        })
      },
      {
        label: 'Ahorros/metas',
        group: 'saving',
        amount: model.savingsTotal,
        color: palette.saving[0],
        pattern: 1,
        children: model.savings.map(function (item, index) {
          return componentFromItem(item, 'saving', palette.saving[index % palette.saving.length], index + model.fixed.length);
        })
      },
      {
        label: 'Disponible',
        group: 'available',
        amount: model.available,
        color: palette.available[0],
        pattern: 4,
        children: model.available > 0 ? [{ label: 'Libre', group: 'available', amount: model.available, color: palette.available[0], pattern: 4 }] : []
      },
      {
        label: 'Exceso',
        group: 'excess',
        amount: model.excess,
        color: palette.excess[0],
        pattern: 5,
        children: model.excess > 0 ? [{ label: 'Exceso', group: 'excess', amount: model.excess, color: palette.excess[0], pattern: 5 }] : []
      }
    ].filter(nonZero);
  }

  function activeFamily(model, group) {
    var groups = familyGroups(model);
    var found = groups.filter(function (item) {
      return item.group === group;
    })[0];
    return found || groups[0];
  }

  function familyOffset(model, groupNameValue) {
    var groups = familyGroups(model);
    var offset = 0;
    groups.some(function (group) {
      if (group.group === groupNameValue) {
        return true;
      }
      offset += group.amount;
      return false;
    });
    return pct(offset, model.scale);
  }

  function renderInteractiveMacroBar(model, activeGroup, scope, caption, value, extraClass) {
    var groups = familyGroups(model);
    var salaryLine = Math.min(100, Math.max(0, pct(model.salary, model.scale)));
    return [
      '<div class="stack-wrap interactive-stack ' + escapeHtml(extraClass || '') + '" style="' + styleVars({ '--salary-line': salaryLine + '%' }) + '">',
      '<div class="stack-caption"><span>' + escapeHtml(caption) + '</span><b>' + escapeHtml(value || 'toque un tramo') + '</b></div>',
      '<div class="stack-bar" role="group" aria-label="' + escapeHtml(caption) + '">',
      '<span class="stack-salary-line" aria-hidden="true">100%</span>',
      groups.map(function (group) {
        var width = pct(group.amount, model.scale);
        var activeClass = group.group === activeGroup ? ' is-active' : '';
        var tightClass = width < 8 ? ' is-tiny' : width < 14 ? ' is-tight' : '';
        return [
          '<button class="stack-segment stack-action pat-' + escapeHtml(String(group.pattern || 0)) + ' is-' + escapeHtml(group.group) + activeClass + tightClass + '" type="button" data-reveal-scope="' + escapeHtml(scope) + '" data-reveal-group="' + escapeHtml(group.group) + '" style="' + styleVars({ '--w': width + '%', '--c': group.color }) + '">',
          '<span>' + escapeHtml(group.label) + '</span>',
          '<b>' + escapeHtml(pctLabel(group.amount, model.salary)) + '</b>',
          '</button>'
        ].join('');
      }).join(''),
      '</div>',
      '<div class="stack-axis"><span>0</span><span>50%</span><span>100% sueldo</span>' + (model.excess ? '<span>exceso</span>' : '') + '</div>',
      '</div>'
    ].join('');
  }

  function renderDetailWindow(model, groupNameValue, label) {
    var family = activeFamily(model, groupNameValue);
    var width = Math.max(1, pct(family.amount, model.scale));
    var displayWidth = Math.max(width, 32);
    var safeOffset = Math.min(familyOffset(model, family.group), Math.max(0, 100 - displayWidth));
    var compactClass = currentMode === 'macro' ? ' is-compact-detail' : '';
    return [
      '<div class="detail-window' + compactClass + '" style="' + styleVars({ '--x': safeOffset + '%', '--w': displayWidth + '%', '--pin': (familyOffset(model, family.group) + (width / 2)) + '%', '--c': family.color }) + '">',
      '<header><strong>' + escapeHtml(label || family.label) + '</strong><span>' + escapeHtml(money(family.amount)) + ' / ' + escapeHtml(pctLabel(family.amount, model.salary)) + '</span></header>',
      '<div class="detail-window-rail">',
      family.children.map(function (item) {
        var childWidth = pct(item.amount, family.amount);
        var tightClass = childWidth < 16 ? ' is-tight' : '';
        return [
          '<i class="detail-chip pat-' + escapeHtml(String(item.pattern || 0)) + ' is-' + escapeHtml(item.group) + tightClass + '" style="' + styleVars({ '--w': childWidth + '%', '--c': item.color }) + '">',
          '<span>' + escapeHtml(item.label) + '</span>',
          '<b>' + escapeHtml(pctLabel(item.amount, model.salary)) + '</b>',
          '</i>'
        ].join('');
      }).join(''),
      '</div>',
      renderDetailRows(family, model),
      '</div>'
    ].join('');
  }

  function renderDetailRows(family, model) {
    if (currentMode === 'macro') {
      return '';
    }
    return [
      '<div class="detail-rows">',
      family.children.map(function (item) {
        return [
          '<span class="detail-row">',
          '<i class="swatch pat-' + escapeHtml(String(item.pattern || 0)) + '" style="' + styleVars({ '--c': item.color }) + '"></i>',
          '<b>' + escapeHtml(item.label) + '</b>',
          '<em>' + escapeHtml(pctLabel(item.amount, model.salary)) + '</em>',
          '</span>'
        ].join('');
      }).join(''),
      '</div>'
    ].join('');
  }

  function renderAlignedReveal(model) {
    var active = activeFamily(model, b1PrimaryOpenGroup(model));
    return renderPanel('B1', 'Drill alineado', 'toque una familia y el detalle aparece justo debajo', [
      '<div class="reveal-stage">',
      renderInteractiveMacroBar(model, active.group, 'drill', 'Nivel macro fijo', 'detalle alineado'),
      renderDetailWindow(model, active.group, active.label),
      '</div>'
    ].join(''));
  }

  function renderInlineReveal(model) {
    var active = activeFamily(model, inlineRevealGroup);
    var groups = familyGroups(model);
    var salaryLine = Math.min(100, Math.max(0, pct(model.salary, model.scale)));
    return renderPanel('B2', 'Expansion en sitio', 'el tramo seleccionado se abre por dentro sin crear otra tarjeta', [
      '<div class="stack-wrap interactive-stack is-large" style="' + styleVars({ '--salary-line': salaryLine + '%' }) + '">',
      '<div class="stack-caption"><span>Macro con corte interno</span><b>' + escapeHtml(active.label) + '</b></div>',
      '<div class="stack-bar inline-stack">',
      '<span class="stack-salary-line" aria-hidden="true">100%</span>',
      groups.map(function (group) {
        var width = pct(group.amount, model.scale);
        var activeClass = group.group === active.group ? ' is-active has-inline-detail' : '';
        return [
          '<button class="stack-segment stack-action pat-' + escapeHtml(String(group.pattern || 0)) + ' is-' + escapeHtml(group.group) + activeClass + '" type="button" data-reveal-scope="inline" data-reveal-group="' + escapeHtml(group.group) + '" style="' + styleVars({ '--w': width + '%', '--c': group.color }) + '">',
          '<span>' + escapeHtml(group.label) + '</span>',
          '<b>' + escapeHtml(pctLabel(group.amount, model.salary)) + '</b>',
          group.group === active.group ? renderInlineMini(group) : '',
          '</button>'
        ].join('');
      }).join(''),
      '</div>',
      '<div class="stack-axis"><span>0</span><span>50%</span><span>100% sueldo</span>' + (model.excess ? '<span>exceso</span>' : '') + '</div>',
      '</div>',
      renderDetailRows(active, model)
    ].join(''));
  }

  function renderInlineMini(group) {
    return [
      '<i class="inline-mini" aria-hidden="true">',
      group.children.map(function (item) {
        return '<i class="mini-segment pat-' + escapeHtml(String(item.pattern || 0)) + '" style="' + styleVars({ '--w': pct(item.amount, group.amount) + '%', '--c': item.color }) + '"></i>';
      }).join(''),
      '</i>'
    ].join('');
  }

  function renderLensReveal(model) {
    var active = activeFamily(model, lensRevealGroup);
    return renderPanel('B3', 'Lupa inferior', 'la barra no cambia; la lupa muestra la familia elegida', [
      renderInteractiveMacroBar(model, active.group, 'lens', 'Barra macro estable', 'lupa: ' + active.label, 'is-medium'),
      '<div class="lens-box">',
      '<header><strong>' + escapeHtml(active.label) + '</strong><span>' + escapeHtml(pctLabel(active.amount, model.salary)) + '</span></header>',
      renderStackBar(active.children, model, { className: 'is-compact is-detail-only', caption: 'Detalle medido contra sueldo', value: money(active.amount) }),
      renderDetailRows(active, model),
      '</div>'
    ].join(''));
  }

  function renderAccordionReveal(model) {
    var active = activeFamily(model, accordionRevealGroup);
    return renderPanel('B4', 'Acordeon tactil', 'cada familia abre su propia banda de componentes', [
      '<div class="accordion-list">',
      familyGroups(model).map(function (group) {
        var openClass = group.group === active.group ? ' is-open' : '';
        return [
          '<section class="accordion-family' + openClass + '">',
          '<button class="accordion-head" type="button" data-reveal-scope="accordion" data-reveal-group="' + escapeHtml(group.group) + '">',
          '<span>' + escapeHtml(group.label) + '</span><b>' + escapeHtml(pctLabel(group.amount, model.salary)) + '</b>',
          '</button>',
          group.group === active.group ? [
            '<div class="accordion-body">',
            renderStackBar(group.children, model, { className: 'is-compact is-detail-only', caption: 'Abierto', value: money(group.amount) }),
            renderDetailRows(group, model),
            '</div>'
          ].join('') : '',
          '</section>'
        ].join('');
      }).join(''),
      '</div>'
    ].join(''));
  }

  function renderStepperReveal(model) {
    var groups = familyGroups(model);
    var index = ((stepRevealIndex % groups.length) + groups.length) % groups.length;
    var active = groups[index];
    return renderPanel('B5', 'Secuencia guiada', 'recorre familia por familia como inspeccion de sueldo', [
      '<div class="stepper-bar">',
      '<button type="button" data-cycle="-1" aria-label="Anterior">ANT</button>',
      '<strong>' + escapeHtml(String(index + 1)) + '/' + escapeHtml(String(groups.length)) + ' ' + escapeHtml(active.label) + '</strong>',
      '<button type="button" data-cycle="1" aria-label="Siguiente">SIG</button>',
      '</div>',
      renderInteractiveMacroBar(model, active.group, 'step', 'Punto actual de lectura', pctLabel(active.amount, model.salary), 'is-medium'),
      renderDetailWindow(model, active.group, active.label)
    ].join(''));
  }

  function renderTrayReveal(model) {
    var active = activeFamily(model, trayRevealGroup);
    return renderPanel('B6', 'Bandeja inspectora', 'toque un tramo y la bandeja inferior cambia sin mover la barra', [
      '<div class="tray-stage">',
      renderInteractiveMacroBar(model, active.group, 'tray', 'Barra siempre quieta', 'bandeja dinamica', 'is-medium'),
      '<div class="tray-box">',
      '<div class="tray-meter" style="' + styleVars({ '--w': pct(active.amount, model.scale) + '%', '--c': active.color }) + '"><i class="pat-' + escapeHtml(String(active.pattern || 0)) + '"></i></div>',
      '<header><strong>' + escapeHtml(active.label) + '</strong><span>' + escapeHtml(money(active.amount)) + '</span></header>',
      renderDetailRows(active, model),
      '</div>',
      '</div>'
    ].join(''));
  }

  function renderB1InlineFocus(model) {
    var groups = familyGroups(model);
    var salaryLine = Math.min(100, Math.max(0, pct(model.salary, model.scale)));
    return renderPanel('B1', 'Desagrega en el mismo tramo', 'leader lines; ahorros/metas abre un segundo nivel dentro del mismo rectangulo', [
      '<div class="b1-focus">',
      '<div class="b1-bar-wrap" style="' + styleVars({ '--salary-line': salaryLine + '%' }) + '">',
      '<div class="b1-bar" role="group" aria-label="Barra de sueldo con desagregado en sitio">',
      '<span class="b1-salary-line" aria-hidden="true">100%</span>',
      groups.map(function (group, index) {
        return isB1GroupOpen(group.group) && canB1DrillGroup(group) ? renderB1ExpandedSegment(group, model, index) : renderB1MacroSegment(group, model, index);
      }).join(''),
      '</div>',
      '<div class="b1-axis"><span>0</span><span>50%</span><span>100% sueldo</span>' + (model.excess ? '<span>exceso</span>' : '') + '</div>',
      '</div>',
      '</div>'
    ].join(''));
  }

  function renderB1MacroSegment(group, model, index) {
    var width = pct(group.amount, model.scale);
    var tightClass = width < 10 ? ' is-tight' : '';
    var staticClass = canB1DrillGroup(group) ? '' : ' is-static';
    var label = group.label + ' ' + pctLabel(group.amount, model.salary);
    if (!canB1DrillGroup(group)) {
      return [
        '<div class="b1-segment is-' + escapeHtml(group.group) + staticClass + tightClass + '" role="img" aria-label="' + escapeHtml(label) + '" style="' + styleVars({ '--w': width + '%', '--c': group.color }) + '">',
        renderB1InsidePct(group, model),
        renderB1Leader(group, model, index, false, group.group),
        '</div>'
      ].join('');
    }
    return [
      '<button class="b1-segment is-' + escapeHtml(group.group) + tightClass + '" type="button" data-reveal-scope="drill" data-reveal-group="' + escapeHtml(group.group) + '" style="' + styleVars({ '--w': width + '%', '--c': group.color }) + '">',
      renderB1InsidePct(group, model),
      renderB1Leader(group, model, index, false, group.group),
      '</button>'
    ].join('');
  }

  function renderB1ExpandedSegment(group, model, index) {
    var width = pct(group.amount, model.scale);
    var children = b1ChildrenForGroup(group, model);
    return [
      '<div class="b1-segment is-expanded is-' + escapeHtml(group.group) + '" role="group" aria-label="' + escapeHtml(group.label + ' abierto ' + pctLabel(group.amount, model.salary)) + '" style="' + styleVars({ '--w': width + '%', '--c': group.color }) + '">',
      children.map(function (item, childIndex) {
        var childWidth = pct(item.amount, group.amount);
        var tightClass = childWidth < 14 ? ' is-tight' : '';
        var tinyClass = childWidth < 8 ? ' is-tiny' : '';
        var drillAttr = item.drillNode ? ' data-saving-node="' + escapeHtml(item.drillNode) + '"' : ' data-b1-child-group="' + escapeHtml(group.group) + '"';
        return [
          '<button class="b1-child is-' + escapeHtml(item.group) + tightClass + tinyClass + '" type="button"' + drillAttr + ' title="' + escapeHtml(item.label + ' - ' + pctLabel(item.amount, model.salary)) + '" style="' + styleVars({ '--w': childWidth + '%', '--c': group.color, '--shade': ((childIndex % 3) * 0.07).toFixed(2) }) + '">',
          renderB1InsidePct(item, model),
          renderB1Leader(item, model, childIndex, true, group.group),
          '</button>'
        ].join('');
      }).join(''),
      '</div>'
    ].join('');
  }

  function b1ChildrenForGroup(group, model) {
    if (group.group !== 'saving') {
      return group.children;
    }
    return selectedSavingNode === 'metas' ? b1SavingDetail(model) : b1SavingSummary(model);
  }

  function b1SavingSummary(model) {
    var future = model.savings.filter(function (item) {
      return /futuro/i.test(item.label);
    });
    var goals = model.savings.filter(function (item) {
      return !/futuro/i.test(item.label);
    });
    return [
      {
        label: 'Ahorros',
        group: 'saving-future',
        amount: sum(future),
        color: palette.saving[0],
        drillNode: 'collapse'
      },
      {
        label: 'Metas',
        group: 'saving-goals',
        amount: sum(goals),
        color: palette.saving[2],
        drillNode: 'metas'
      }
    ].filter(nonZero);
  }

  function b1SavingDetail(model) {
    return model.savings.map(function (item, index) {
      var group = /futuro/i.test(item.label) ? 'saving-future' : 'saving-goal';
      return {
        label: item.label,
        group: group,
        amount: Number(item.amount || 0),
        color: palette.saving[index % palette.saving.length],
        pattern: index % 6,
        drillNode: 'collapse'
      };
    }).filter(nonZero);
  }

  function renderB1InsidePct(item, model) {
    return '<span class="b1-inside-pct">' + escapeHtml(pctLabel(item.amount, model.salary)) + '</span>';
  }

  function canB1DrillGroup(group) {
    return group && group.group !== 'available';
  }

  function isB1GroupOpen(group) {
    return !!b1OpenGroups[group];
  }

  function setB1GroupOpen(group, open) {
    if (open) {
      b1OpenGroups[group] = true;
      return;
    }
    delete b1OpenGroups[group];
    if (group === 'saving') {
      selectedSavingNode = 'summary';
    }
  }

  function b1HasOpenGroups() {
    return Object.keys(b1OpenGroups).some(function (group) {
      return b1OpenGroups[group];
    });
  }

  function b1PrimaryOpenGroup(model) {
    var groups = familyGroups(model);
    var found = groups.filter(function (group) {
      return isB1GroupOpen(group.group);
    })[0];
    return found ? found.group : (groups[0] ? groups[0].group : 'fixed');
  }

  function b1LeaderPlacement(group, index, nested) {
    var side = index % 2 ? 'bottom' : 'top';
    var direction = index % 4 < 2 ? 'right' : 'left';
    var run = 42;
    var rise = 38;
    var arm = 38;
    var angle;
    var diag;
    if (nested && group === 'fixed') {
      side = 'top';
      direction = 'right';
      rise = Math.max(42, 104 - (Math.min(index, 4) * 18));
      run = 42 + (Math.min(index, 4) * 16);
    } else if (nested && group === 'saving') {
      side = 'bottom';
      direction = 'right';
      rise = Math.max(42, 104 - (Math.min(index, 4) * 18));
      run = 42 + (Math.min(index, 4) * 16);
    } else if (nested && group === 'excess') {
      side = 'top';
      direction = 'left';
      rise = 54;
    } else if (!nested && group === 'fixed') {
      side = 'top';
      direction = 'right';
    } else if (!nested && group === 'saving') {
      side = 'bottom';
      direction = 'right';
    } else if (!nested && group === 'available') {
      side = 'bottom';
      direction = 'right';
      rise = 36;
      run = 48;
    } else if (!nested && group === 'excess') {
      side = 'bottom';
      direction = 'left';
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
      style: styleVars({
        '--leader-y': (side === 'top' ? '-' : '') + rise + 'px',
        '--leader-run': run + 'px',
        '--leader-arm': arm + 'px',
        '--leader-diag': diag + 'px',
        '--leader-angle': angle + 'deg',
        '--leader-left-arm-x': '-' + (run + arm) + 'px',
        '--leader-label-x': (run + arm + 6) + 'px'
      })
    };
  }

  function renderB1Leader(item, model, index, nested, ownerGroup) {
    var placement = b1LeaderPlacement(ownerGroup || item.group, index, nested);
    var amountLabel = currentMode === 'macro' ? '' : ' ' + money(item.amount);
    var labelText = item.label + ' ' + pctLabel(item.amount, model.salary) + amountLabel;
    return [
      '<span class="b1-leader is-' + escapeHtml(placement.side) + ' is-' + escapeHtml(placement.direction) + (nested ? ' is-nested is-cascade-' + escapeHtml(String(placement.cascade)) : '') + '" style="' + placement.style + '">',
      '<span class="b1-leader-text">' + escapeHtml(labelText) + '</span>',
      '</span>'
    ].join('');
  }

  function edgeComponents(model) {
    var cursor = 0;
    return components(model).map(function (item) {
      var amount = Number(item.amount || 0);
      var start = pct(cursor, model.scale);
      var width = pct(amount, model.scale);
      cursor += amount;
      return {
        label: item.label,
        group: item.group,
        amount: amount,
        color: item.color,
        pattern: item.pattern,
        start: start,
        width: width,
        mid: start + (width / 2)
      };
    });
  }

  function edgeRowsFor(items, model, side, direction, startY, gap, bendBase, labelPrefix) {
    return items.map(function (item, index) {
      var y = side === 'top' ? startY + (index * gap) : startY - (index * gap);
      var edgeX = direction === 'right' ? 98 : 2;
      var bend;
      var run = bendBase + (index * 2.4);
      if (direction === 'right') {
        bend = Math.min(94, Math.max(item.mid + run, 62 + (index * 3)));
      } else {
        bend = Math.max(6, Math.min(item.mid - run, 38 - (index * 3)));
      }
      return {
        item: item,
        group: item.group,
        side: side,
        direction: direction,
        y: y,
        edgeX: edgeX,
        bendX: bend,
        label: edgeLabelText(item, model, labelPrefix)
      };
    });
  }

  function edgeLabelText(item, model, prefix) {
    var lead = prefix ? prefix + ' / ' : '';
    return lead + item.label + ' ' + pctLabel(item.amount, model.salary) + ' ' + money(item.amount);
  }

  function renderEdgeCalloutPreview(model, code, title, detail, options) {
    var opts = options || {};
    var items = edgeComponents(model);
    var fixed = items.filter(function (item) { return item.group === 'fixed'; });
    var saving = items.filter(function (item) { return item.group === 'saving'; });
    var other = items.filter(function (item) {
      return item.group === 'available' || item.group === 'excess';
    });
    var rows = []
      .concat(edgeRowsFor(
        fixed,
        model,
        'top',
        opts.fixedDirection || 'right',
        opts.topStart || 12,
        opts.topGap || 8,
        opts.fixedBend || 9,
        opts.labelPrefix ? 'Fijo' : ''
      ))
      .concat(edgeRowsFor(
        saving,
        model,
        'bottom',
        opts.savingDirection || 'left',
        opts.bottomStart || 88,
        opts.bottomGap || 8,
        opts.savingBend || 9,
        opts.labelPrefix ? 'Ahorro' : ''
      ));
    var stageHeight = opts.height || Math.max(330, 214 + (Math.max(fixed.length, saving.length) * 32));
    var stageStyle = styleVars({
      '--edge-stage-height': stageHeight + 'px',
      '--bar-y': (opts.barY || 54)
    });
    var classes = 'edge-sim is-' + escapeHtml(opts.variant || 'mirror');
    return renderPanel(code, title, detail, [
      '<div class="' + classes + '">',
      '<div class="edge-title"><span>PARTICION SUELDO</span><b>' + escapeHtml(opts.badge || '100%') + '</b></div>',
      '<div class="edge-total"><span>SUELDO DISTRIBUIDO</span><b>' + escapeHtml(money(model.salary)) + '</b></div>',
      '<div class="edge-stage" style="' + stageStyle + '">',
      '<svg class="edge-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">',
      rows.map(renderEdgeLine).join(''),
      '</svg>',
      '<div class="edge-bar" role="img" aria-label="Particion del sueldo">',
      items.map(function (item) {
        return renderEdgeSegment(item, model);
      }).join(''),
      '</div>',
      rows.map(renderEdgeLabel).join(''),
      other.map(function (item, index) {
        return renderEdgeSideNote(item, model, index, opts);
      }).join(''),
      '</div>',
      '</div>'
    ].join(''));
  }

  function renderEdgeLine(row) {
    var points = [
      edgeNum(row.item.mid), '54',
      edgeNum(row.bendX), edgeNum(row.y),
      edgeNum(row.edgeX), edgeNum(row.y)
    ].join(' ');
    return '<polyline class="edge-line is-' + escapeHtml(row.group) + ' is-' + escapeHtml(row.side) + ' is-' + escapeHtml(row.direction) + '" points="' + points + '"></polyline>';
  }

  function renderEdgeLabel(row) {
    return [
      '<span class="edge-label is-' + escapeHtml(row.side) + ' is-' + escapeHtml(row.direction) + ' is-' + escapeHtml(row.group) + '" style="' + styleVars({ '--label-y': edgeNum(row.y) }) + '">',
      escapeHtml(row.label),
      '</span>'
    ].join('');
  }

  function renderEdgeSegment(item, model) {
    var slim = item.width < 7 ? ' is-micro' : item.width < 12 ? ' is-slim' : '';
    var label = item.group === 'available'
      ? 'DISP. ' + pctLabel(item.amount, model.salary)
      : item.group === 'excess'
        ? 'EXC. ' + pctLabel(item.amount, model.salary)
        : pctLabel(item.amount, model.salary);
    return [
      '<span class="edge-segment is-' + escapeHtml(item.group) + ' pat-' + escapeHtml(String(item.pattern || 0)) + slim + '" style="' + styleVars({ '--x': edgeNum(item.start) + '%', '--w': edgeNum(item.width) + '%', '--c': item.color }) + '">',
      '<b>' + escapeHtml(label) + '</b>',
      '</span>'
    ].join('');
  }

  function renderEdgeSideNote(item, model, index, opts) {
    var direction = opts.availableDirection || 'right';
    var y = 44 + (index * 14);
    var label = edgeLabelText(item, model, '');
    return [
      '<span class="edge-side-note is-' + escapeHtml(direction) + ' is-' + escapeHtml(item.group) + '" style="' + styleVars({ '--label-y': edgeNum(y) }) + '">',
      escapeHtml(label),
      '</span>'
    ].join('');
  }

  function edgeNum(value) {
    return String(Math.round(Number(value || 0) * 100) / 100);
  }

  function renderEdgeMirror(model) {
    return renderEdgeCalloutPreview(model, 'B1-A', 'Riel espejo', 'fijos arriba al borde derecho; ahorros abajo al borde izquierdo', {
      variant: 'mirror',
      fixedDirection: 'right',
      savingDirection: 'left',
      availableDirection: 'right',
      topStart: 11,
      bottomStart: 89,
      topGap: 8.4,
      bottomGap: 8.4,
      height: 350,
      badge: 'BORDE'
    });
  }

  function renderEdgeSingleRail(model) {
    return renderEdgeCalloutPreview(model, 'B1-B', 'Riel derecho unico', 'todas las leyendas terminan en el mismo borde para lectura vertical', {
      variant: 'single-rail',
      fixedDirection: 'right',
      savingDirection: 'right',
      availableDirection: 'left',
      topStart: 11,
      bottomStart: 89,
      topGap: 8.2,
      bottomGap: 8.2,
      fixedBend: 8,
      savingBend: 14,
      height: 356,
      badge: 'RIEL'
    });
  }

  function renderEdgeWideGutter(model) {
    return renderEdgeCalloutPreview(model, 'B1-C', 'Margen ancho', 'cajas mas grandes y sin elipsis para probar legibilidad extrema', {
      variant: 'wide-gutter',
      fixedDirection: 'left',
      savingDirection: 'right',
      availableDirection: 'right',
      topStart: 13,
      bottomStart: 87,
      topGap: 9.2,
      bottomGap: 9.2,
      fixedBend: 12,
      savingBend: 12,
      height: 372,
      badge: 'ANCHO',
      labelPrefix: true
    });
  }

  function renderEdgeOfficialDraft(model) {
    return renderEdgeCalloutPreview(model, 'B1-D', 'Candidato oficial', 'alto adaptable, cascada limpia y disponible con textura oscura', {
      variant: 'official-draft',
      fixedDirection: 'right',
      savingDirection: 'left',
      availableDirection: 'right',
      topStart: 10,
      bottomStart: 90,
      topGap: 9,
      bottomGap: 9,
      fixedBend: 10,
      savingBend: 10,
      height: Math.max(390, 238 + (model.fixed.length + model.savings.length) * 24),
      badge: 'APP'
    });
  }

  function renderPieVariantSet(model) {
    return [
      renderInteractivePie2D(model, 'a-max'),
      renderInteractivePie2D(model, 'a-edge'),
      renderInteractivePie2D(model, 'a-clean')
    ].join('');
  }

  function pieVariantConfig(name) {
    var variants = {
      'a-max': {
        code: 'A1',
        title: 'A grande',
        detail: 'torta maxima, callouts solo en lo desagregado',
        labels: 'none',
        callouts: 'open',
        texture: false,
        money: false,
        colors: {
          fixed: ['#7f8f5b', '#8f9f68', '#718252', '#9aaa6f'],
          saving: ['#b7c982', '#c5d58d', '#a7bb74', '#d0dd98'],
          available: ['#071007'],
          excess: ['#a95c5a']
        }
      },
      'a-edge': {
        code: 'A2',
        title: 'A con lectura abajo',
        detail: 'mismos colores, callouts solo al seleccionar',
        labels: 'none',
        callouts: 'open',
        texture: false,
        money: false,
        colors: {
          fixed: ['#7f8f5b', '#8c9b65', '#718252', '#98a96f'],
          saving: ['#b7c982', '#c5d58d', '#a8bb75', '#d0dd98'],
          available: ['#071007'],
          excess: ['#a95c5a']
        }
      },
      'a-clean': {
        code: 'A3',
        title: 'A limpia',
        detail: 'sin porcentajes internos, leyenda solida de tres categorias',
        labels: 'none',
        callouts: 'open',
        texture: false,
        money: false,
        colors: {
          fixed: ['#839361', '#93a36e', '#758658', '#a1af77'],
          saving: ['#b4c681', '#c2d18b', '#a4b975', '#cdd993'],
          available: ['#071007'],
          excess: ['#a95c5a']
        }
      }
    };
    return variants[name] || variants['a-max'];
  }

  function pieColor(group, index, variant) {
    var cfg = pieVariantConfig(variant);
    var family = group === 'saving-future' || group === 'saving-goals' || group === 'saving-goal' ? 'saving' : group;
    var colors = cfg.colors[family] || cfg.colors.available;
    return colors[index % colors.length];
  }

  function renderInteractivePie2D(model, variant) {
    var cfg = pieVariantConfig(variant);
    var groups = pieGroups(model, variant);
    var cleanClass = currentMode === 'macro' ? ' is-clean' : '';
    var readout = currentMode === 'macro' ? '' : renderPieBottomReadout(model, variant);
    return renderPanel(cfg.code, cfg.title, cfg.detail, [
      '<div class="pie-touch-layout is-variant is-' + escapeHtml(variant) + cleanClass + '">',
      '<div class="pie-touch-stage">',
      renderInteractivePieSvg(groups, model, variant),
      '</div>',
      readout,
      '</div>'
    ].join(''));
  }

  function renderPieBottomReadout(model, variant) {
    return [
      '<div class="pie-touch-bottom">',
      renderPiePrincipalLegend(model, variant),
      renderPieSelectionDetail(model, variant),
      '<button class="pie-touch-reset" type="button" data-pie-reset="1">TOTAL</button>',
      '</div>'
    ].join('');
  }

  function pieGroups(model, variant) {
    return [
      {
        label: 'Gastos fijos',
        group: 'fixed',
        amount: model.fixedTotal,
        color: pieColor('fixed', 0, variant),
        pattern: 0,
        children: model.fixed.map(function (item, index) {
          return componentFromItem(item, 'fixed', pieColor('fixed', index, variant), index);
        })
      },
      {
        label: 'Ahorros/metas',
        group: 'saving',
        amount: model.savingsTotal,
        color: pieColor('saving', 0, variant),
        pattern: 1,
        children: pieSavingChildren(model, variant)
      },
      {
        label: 'Disponible',
        group: 'available',
        amount: model.available,
        color: pieColor('available', 0, variant),
        pattern: 4,
        children: model.available > 0 ? [{ label: 'Disponible', group: 'available', amount: model.available, color: pieColor('available', 0, variant), pattern: 4 }] : []
      },
      {
        label: 'Exceso',
        group: 'excess',
        amount: model.excess,
        color: pieColor('excess', 0, variant),
        pattern: 5,
        children: model.excess > 0 ? [{ label: 'Exceso', group: 'excess', amount: model.excess, color: pieColor('excess', 0, variant), pattern: 5 }] : []
      }
    ].filter(nonZero);
  }

  function pieSavingChildren(model, variant) {
    if (pieSavingNode === 'goals') {
      return b1SavingDetail(model).map(function (item, index) {
        item.color = pieColor(item.group, index, variant);
        return item;
      });
    }
    return b1SavingSummary(model).map(function (item, index) {
      return {
        label: item.label,
        group: item.group,
        amount: item.amount,
        color: pieColor(item.group, index, variant),
        pattern: index + 1,
        drillNode: item.drillNode
      };
    }).filter(nonZero);
  }

  function renderInteractivePieSvg(groups, model, variant) {
    var cfg = pieVariantConfig(variant);
    var cx = 160;
    var cy = 130;
    var radius = 108;
    var start = -90;
    var callouts = [];
    var pieces = groups.map(function (group) {
      var sweep = (group.amount / model.scale) * 360;
      var end = start + sweep;
      var html = isPieGroupOpen(group.group) && group.children && group.children.length && group.group !== 'available' && group.group !== 'excess'
        ? renderPieSubSlices(group, model, cx, cy, radius, start, end, variant, callouts)
        : renderPieTouchSlice(group, model, cx, cy, radius, start, end, false, null, variant, callouts);
      start = end;
      return html;
    }).join('');
    var calloutHtml = renderPieCallouts(callouts, cfg);

    return [
      '<svg class="pie-touch-svg is-' + escapeHtml(variant) + '" viewBox="-62 0 444 260" role="img" aria-label="Torta 2D interactiva de sueldo">',
      patternDefs(),
      '<circle class="pie-touch-shadow" cx="160" cy="134" r="110"></circle>',
      pieces,
      '<circle class="pie-touch-rim" cx="160" cy="130" r="' + radius + '"></circle>',
      calloutHtml,
      '<circle class="pie-touch-center" cx="160" cy="130" r="34"></circle>',
      '</svg>'
    ].join('');
  }

  function renderPieSubSlices(group, model, cx, cy, radius, startAngle, endAngle, variant, callouts) {
    var cursor = startAngle;
    return group.children.map(function (item, index) {
      var sweep = group.amount ? ((item.amount / group.amount) * (endAngle - startAngle)) : 0;
      var end = cursor + sweep;
      var child = {
        label: item.label,
        group: item.group || group.group,
        amount: item.amount,
        color: item.color || group.color,
        pattern: item.pattern === undefined ? index : item.pattern,
        drillNode: item.drillNode
      };
      var html = renderPieTouchSlice(child, model, cx, cy, radius, cursor, end, true, group.group, variant, callouts);
      cursor = end;
      return html;
    }).join('');
  }

  function renderPieTouchSlice(item, model, cx, cy, radius, startAngle, endAngle, nested, ownerGroup, variant, callouts) {
    var cfg = pieVariantConfig(variant);
    var path = piePath(cx, cy, radius, startAngle, endAngle);
    var mid = startAngle + ((endAngle - startAngle) / 2);
    var labelPoint = polar(cx, cy, nested ? radius * 0.68 : radius * 0.62, mid);
    var label = pctLabel(item.amount, model.salary);
    var action = pieTouchAttrs(item, ownerGroup);
    var tightClass = Math.abs(endAngle - startAngle) < 22 ? ' is-tight' : '';
    var labelHtml = pieTouchSliceLabel(label, labelPoint, endAngle - startAngle, nested, cfg);
    addPieCallout(callouts, item, model, cx, cy, radius, mid, endAngle - startAngle, nested, cfg);
    return [
      '<g class="pie-touch-part' + (nested ? ' is-nested' : ' is-macro') + tightClass + ' is-' + escapeHtml(item.group) + '" ' + action + '>',
      '<path class="pie-touch-slice" d="' + path + '" style="' + styleVars({ '--c': item.color }) + '"></path>',
      cfg.texture ? '<path class="pie-touch-texture pat-' + escapeHtml(String(item.pattern || 0)) + '" d="' + path + '"></path>' : '',
      labelHtml,
      '</g>'
    ].join('');
  }

  function addPieCallout(callouts, item, model, cx, cy, radius, midAngle, sweep, nested, cfg) {
    var shouldShow = (cfg.callouts === 'all' && sweep >= 14) || (cfg.callouts === 'open' && nested && sweep >= 8);
    var side;
    var anchor;
    if (!shouldShow || !callouts) {
      return;
    }
    anchor = polar(cx, cy, radius + 2, midAngle);
    side = pieCalloutSide(anchor.x, cx);
    callouts.push({
      side: side,
      y: Math.max(20, Math.min(240, anchor.y)),
      anchor: anchor,
      group: item.group,
      label: pieCalloutText(item, model, nested)
    });
  }

  function pieCalloutSide(anchorX, centerX) {
    return anchorX >= centerX ? 'right' : 'left';
  }

  function pieCalloutText(item, model, nested) {
    var label = pieShortLabel(item.label, item.group);
    if (!nested && item.group === 'fixed') {
      label = 'FIJOS';
    } else if (!nested && item.group === 'saving') {
      label = 'AHORROS';
    } else if (!nested && item.group === 'available') {
      label = 'DISP.';
    }
    return label + ' ' + pctLabel(item.amount, model.salary);
  }

  function pieShortLabel(label, group) {
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

  function renderPieCallouts(callouts) {
    var rows = normalizePieCallouts(callouts);
    if (!rows.length) {
      return '';
    }
    return [
      '<g class="pie-touch-callouts">',
      rows.map(function (row) {
        var elbowX = row.side === 'right' ? 274 : 46;
        var labelX = row.side === 'right' ? elbowX + 6 : elbowX - 6;
        var textAnchor = row.side === 'right' ? 'start' : 'end';
        return [
          '<polyline class="pie-touch-callout-line is-' + escapeHtml(row.group) + '" points="' + edgeNum(row.anchor.x) + ',' + edgeNum(row.anchor.y) + ' ' + edgeNum(elbowX) + ',' + edgeNum(row.y) + ' ' + edgeNum(labelX) + ',' + edgeNum(row.y) + '"></polyline>',
          '<text class="pie-touch-callout-text is-' + escapeHtml(row.group) + '" x="' + edgeNum(labelX) + '" y="' + edgeNum(row.y) + '" text-anchor="' + textAnchor + '">' + escapeHtml(row.label) + '</text>'
        ].join('');
      }).join(''),
      '</g>'
    ].join('');
  }

  function normalizePieCallouts(callouts) {
    var rows = [];
    ['left', 'right'].forEach(function (side) {
      var sideRows = callouts.filter(function (row) {
        return row.side === side;
      }).sort(function (a, b) {
        return a.y - b.y;
      });
      var minY = 20;
      var maxY = 240;
      var gap = 15;
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

  function pieTouchSliceLabel(label, point, sweep, nested, cfg) {
    if (cfg.labels === 'none') {
      return '';
    }
    if (sweep < (nested ? 20 : 16)) {
      return '';
    }
    if (cfg.labels === 'large' && nested && sweep < 28) {
      return '';
    }
    return '<text class="pie-touch-label" x="' + point.x + '" y="' + point.y + '">' + escapeHtml(label) + '</text>';
  }

  function pieTouchAttrs(item, ownerGroup) {
    if (item.drillNode === 'metas') {
      return 'data-pie-saving-node="goals"';
    }
    if (item.drillNode === 'collapse') {
      return '';
    }
    if (ownerGroup === 'fixed') {
      return '';
    }
    if (ownerGroup === 'saving') {
      return '';
    }
    return 'data-pie-group="' + escapeHtml(item.group) + '"';
  }

  function renderPiePrincipalLegend(model, variant) {
    var list = piePrincipalLegendItems(model, variant);
    return [
      '<div class="pie-touch-legend">',
      list.map(function (item) {
        var action = pieLegendAction(item);
        var openClass = isPieGroupOpen(item.group) ? ' is-open' : '';
        var staticClass = action ? '' : ' is-static';
        return [
          '<button type="button" class="pie-touch-row is-' + escapeHtml(item.group) + openClass + staticClass + '"' + action + '>',
          '<i style="' + styleVars({ '--c': item.color || palette.available[0] }) + '"></i>',
          '<span><b>' + escapeHtml(pieShortLabel(item.label, item.group)) + '</b></span>',
          '<strong>' + escapeHtml(pctLabel(item.amount, model.salary)) + '</strong>',
          '</button>'
        ].join('');
      }).join(''),
      '</div>'
    ].join('');
  }

  function renderPieSelectionDetail(model, variant) {
    var lines = [];
    if (isPieGroupOpen('fixed')) {
      lines.push(renderPieDetailLine('FIJOS', model.fixedTotal, model.fixed, model));
    }
    if (isPieGroupOpen('saving')) {
      if (pieSavingNode === 'goals') {
        lines.push(renderPieDetailLine('METAS', sum(model.savings.filter(function (item) {
          return !/futuro/i.test(item.label);
        })), model.savings.filter(function (item) {
          return !/futuro/i.test(item.label);
        }), model));
      } else {
        lines.push(renderPieDetailLine('AHORROS', model.savingsTotal, pieSavingSummaryDetailItems(model), model));
      }
    }
    if (!lines.length) {
      return '<div class="pie-touch-selection is-empty">TOCA FIJOS O AHORROS PARA DESAGREGAR</div>';
    }
    return '<div class="pie-touch-selection">' + lines.join('') + '</div>';
  }

  function renderPieDetailLine(title, amount, items, model) {
    var parts = (items || []).filter(nonZero).map(function (item) {
      return '<span>' + escapeHtml(pieShortLabel(item.label, item.group || '')) + ' ' + escapeHtml(pctLabel(item.amount, model.salary)) + '</span>';
    }).join('<b>+</b>');
    return [
      '<div class="pie-touch-detail-line">',
      '<strong>' + escapeHtml(title) + ' ' + escapeHtml(pctLabel(amount, model.salary)) + '</strong>',
      parts ? '<em>' + parts + '</em>' : '',
      '</div>'
    ].join('');
  }

  function pieSavingSummaryDetailItems(model) {
    var future = model.savings.filter(function (item) {
      return /futuro/i.test(item.label);
    });
    var goals = model.savings.filter(function (item) {
      return !/futuro/i.test(item.label);
    });
    return [
      {
        label: 'Futuro',
        group: 'saving-future',
        amount: sum(future)
      },
      {
        label: 'Metas',
        group: 'saving-goals',
        amount: sum(goals)
      }
    ].filter(nonZero);
  }

  function piePrincipalLegendItems(model, variant) {
    return [
      {
        label: 'Fijos',
        group: 'fixed',
        amount: model.fixedTotal,
        color: pieColor('fixed', 0, variant)
      },
      {
        label: 'Ahorros',
        group: 'saving',
        amount: model.savingsTotal,
        color: pieColor('saving', 0, variant)
      },
      {
        label: 'Disponible',
        group: 'available',
        amount: model.available,
        color: pieColor('available', 0, variant)
      }
    ];
  }

  function pieLegendAction(item) {
    if (item.drillNode === 'metas') {
      return ' data-pie-saving-node="goals"';
    }
    if (item.drillNode === 'collapse') {
      return ' data-pie-saving-node="summary"';
    }
    if (item.group === 'fixed' || item.group === 'saving') {
      return ' data-pie-group="' + escapeHtml(item.group) + '"';
    }
    return '';
  }

  function isPieGroupOpen(group) {
    return !!pieOpenGroups[group];
  }

  function setPieGroupOpen(group, open) {
    if (group !== 'fixed' && group !== 'saving') {
      return;
    }
    if (open) {
      pieOpenGroups[group] = true;
    } else {
      delete pieOpenGroups[group];
      if (group === 'saving') {
        pieSavingNode = 'summary';
      }
    }
  }

  function handlePieGroupTap(group) {
    if (group === 'saving') {
      if (isPieGroupOpen('saving')) {
        setPieGroupOpen('saving', false);
        return;
      }
      pieSavingNode = 'summary';
      setPieGroupOpen('saving', true);
      return;
    }
    setPieGroupOpen(group, !isPieGroupOpen(group));
  }

  function pieOpenLabel() {
    var labels = [];
    if (isPieGroupOpen('fixed')) {
      labels.push('FIJOS');
    }
    if (isPieGroupOpen('saving')) {
      labels.push(pieSavingNode === 'goals' ? 'METAS' : 'AHORROS');
    }
    return labels.length ? labels.join(' + ') : 'MACRO';
  }

  function renderPieSolid(model) {
    var list = components(model);
    return renderPanel('A', 'Torta con callouts', 'sectores desagregados con indice y lista lateral', [
      '<div class="pie-layout">',
      renderPieSvg(list, model, { id: 'callout', donut: false, callouts: true }),
      renderCompactLegend(model, list),
      '</div>'
    ].join(''));
  }

  function renderPieDonut(model) {
    var list = components(model);
    return renderPanel('B', 'Torta anillada', 'centro limpio, componentes en corona con tramas', [
      '<div class="pie-layout">',
      renderPieSvg(list, model, { id: 'donut', donut: true, callouts: false }),
      renderComponentLegend(model, list),
      '</div>'
    ].join(''));
  }

  function renderPieDoubleRing(model) {
    var detail = components(model);
    var macro = [
      { label: 'Fijos', group: 'fixed', amount: model.fixedTotal, color: palette.fixed[0], pattern: 0 },
      { label: 'Ahorros', group: 'saving', amount: model.savingsTotal, color: palette.saving[0], pattern: 1 },
      { label: 'Disponible', group: 'available', amount: model.available, color: palette.available[0], pattern: 2 },
      { label: 'Exceso', group: 'excess', amount: model.excess, color: palette.excess[0], pattern: 3 }
    ].filter(nonZero);
    return renderPanel('C', 'Doble anillo', 'adentro categorias, afuera componentes', [
      '<div class="pie-layout">',
      renderDoubleRingSvg(macro, detail, model),
      renderCompactLegend(model, detail),
      '</div>'
    ].join(''));
  }

  function renderTiles(model) {
    var list = components(model);
    var units = buildUnits(list, model);
    return renderPanel('D', 'Mapa 100 serpiente', 'lectura clasica: cien pixeles seguidos', [
      '<div class="tile-board tile-board-serpent" aria-label="Mapa de sueldo en 100 casillas">',
      units.salary.map(function (item) {
        return renderTile(item);
      }).join(''),
      '</div>',
      model.excess ? '<div class="overflow-row"><span>EXCESO FUERA DEL 100%</span><div>' + units.overflow.map(function (item) {
        return renderTile(item);
      }).join('') + '</div></div>' : '',
      renderComponentLegend(model, list)
    ].join(''));
  }

  function renderTilesGrouped(model) {
    var list = components(model).filter(function (item) {
      return item.group !== 'excess';
    });
    var groups = ['fixed', 'saving', 'available'].map(function (group) {
      return {
        group: group,
        label: groupName(group),
        items: list.filter(function (item) { return item.group === group; })
      };
    }).filter(function (group) {
      return group.items.length;
    });
    return renderPanel('E', 'Mapa 100 por bandas', 'las casillas se ordenan por familia antes de detallar', [
      '<div class="band-map">',
      groups.map(function (group) {
        return renderTileBand(group, model);
      }).join(''),
      '</div>',
      model.excess ? renderExcessStrip(model) : '',
      renderCompactLegend(model, components(model))
    ].join(''));
  }

  function renderTilesPacked(model) {
    var list = components(model);
    return renderPanel('F', 'Mapa 100 compacto', 'bloques rectangulares con proporcion y etiqueta', [
      '<div class="pack-map">',
      list.map(function (item) {
        var width = Math.max(12, Math.min(100, pct(item.amount, model.salary)));
        return [
          '<div class="pack-block pat-' + escapeHtml(String(item.pattern || 0)) + ' is-' + escapeHtml(item.group) + '" style="' + styleVars({ '--w': width + '%', '--c': item.color }) + '">',
          '<span>' + escapeHtml(item.label) + '</span>',
          '<b>' + escapeHtml(pctLabel(item.amount, model.salary)) + '</b>',
          '</div>'
        ].join('');
      }).join(''),
      '</div>',
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

  function renderTile(item) {
    return '<i class="tile is-' + escapeHtml(item.group) + ' pat-' + escapeHtml(String(item.pattern || 0)) + '" style="' + styleVars({ '--c': item.color }) + '" title="' + escapeHtml(item.label) + '"></i>';
  }

  function renderTileBand(group, model) {
    var units = buildUnits(group.items, model).salary.filter(function (item) {
      return item.group !== 'empty';
    });
    var total = sum(group.items);
    return [
      '<section class="tile-band is-' + escapeHtml(group.group) + '">',
      '<header><strong>' + escapeHtml(group.label) + '</strong><span>' + escapeHtml(pctLabel(total, model.salary)) + '</span></header>',
      '<div class="tile-band-grid">',
      units.map(renderTile).join(''),
      '</div>',
      '</section>'
    ].join('');
  }

  function renderExcessStrip(model) {
    var units = buildUnits([{ label: 'Exceso', group: 'excess', amount: model.excess, color: palette.excess[0], pattern: 5 }], model).salary.filter(function (item) {
      return item.group !== 'empty';
    });
    if (!units.length) {
      units = buildUnits([{ label: 'Exceso', group: 'excess', amount: model.excess, color: palette.excess[0], pattern: 5 }], model).overflow;
    }
    return [
      '<div class="overflow-row"><span>EXCESO FUERA DEL 100%</span><div>',
      units.map(renderTile).join(''),
      '</div></div>'
    ].join('');
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

  function renderCompactLegend(model, list) {
    return [
      '<div class="compact-legend">',
      list.map(function (item, index) {
        return [
          '<div class="compact-row">',
          '<i class="legend-index pat-' + escapeHtml(String(item.pattern || 0)) + '" style="' + styleVars({ '--c': item.color }) + '">' + escapeHtml(String(index + 1)) + '</i>',
          '<span><strong>' + escapeHtml(item.label) + '</strong><small>' + escapeHtml(groupName(item.group)) + '</small></span>',
          '<b>' + escapeHtml(pctLabel(item.amount, model.salary)) + '</b>',
          '</div>'
        ].join('');
      }).join(''),
      '</div>'
    ].join('');
  }

  function renderPieSvg(list, model, options) {
    var cfg = options || {};
    var cx = 110;
    var cy = 110;
    var radius = 82;
    var inner = cfg.donut ? 43 : 0;
    var start = -90;
    var total = model.scale;
    var labelIndex = 0;
    var pieces = list.map(function (item) {
      var sweep = (item.amount / total) * 360;
      var end = start + sweep;
      var path = cfg.donut ? donutPath(cx, cy, radius, inner, start, end) : piePath(cx, cy, radius, start, end);
      var mid = start + (sweep / 2);
      var labelPoint = polar(cx, cy, radius + 18, mid);
      var chip = '';
      labelIndex += 1;
      if (cfg.callouts && sweep > 7) {
        chip = '<text class="pie-chip-text" x="' + labelPoint.x + '" y="' + labelPoint.y + '">' + labelIndex + '</text>';
      }
      start = end;
      return [
        '<path class="pie-slice is-' + escapeHtml(item.group) + '" d="' + path + '" style="' + styleVars({ '--c': item.color }) + '"></path>',
        '<path class="pie-texture pat-' + escapeHtml(String(item.pattern || 0)) + '" d="' + path + '"></path>',
        chip
      ].join('');
    }).join('');

    return [
      '<div class="pie-stage">',
      '<svg class="pie-svg" viewBox="0 0 220 220" role="img" aria-label="Torta de sueldo">',
      patternDefs(),
      '<circle class="pie-shadow" cx="110" cy="114" r="85"></circle>',
      pieces,
      '<circle class="pie-rim" cx="110" cy="110" r="' + radius + '"></circle>',
      cfg.donut ? '<circle class="pie-hole" cx="110" cy="110" r="' + inner + '"></circle>' : '',
      cfg.donut ? '<text class="pie-center-text" x="110" y="106">SUELDO</text><text class="pie-center-text small" x="110" y="122">100%</text>' : '',
      '</svg>',
      model.excess ? '<span class="pie-over">EXCESO ' + escapeHtml(money(model.excess)) + '</span>' : '',
      '</div>'
    ].join('');
  }

  function renderDoubleRingSvg(macro, detail, model) {
    var cx = 110;
    var cy = 110;
    return [
      '<div class="pie-stage">',
      '<svg class="pie-svg" viewBox="0 0 220 220" role="img" aria-label="Torta de doble anillo">',
      patternDefs(),
      renderRing(macro, model.scale, cx, cy, 58, 30, true),
      renderRing(detail, model.scale, cx, cy, 88, 63, false),
      '<circle class="pie-hole" cx="110" cy="110" r="25"></circle>',
      '<text class="pie-center-text" x="110" y="107">100%</text>',
      '<text class="pie-center-text small" x="110" y="122">SAL</text>',
      '</svg>',
      '</div>'
    ].join('');
  }

  function renderRing(list, total, cx, cy, outer, inner, macro) {
    var start = -90;
    return list.map(function (item) {
      var sweep = (item.amount / total) * 360;
      var end = start + sweep;
      var path = donutPath(cx, cy, outer, inner, start, end);
      start = end;
      return [
        '<path class="pie-slice ' + (macro ? 'is-macro ' : '') + 'is-' + escapeHtml(item.group) + '" d="' + path + '" style="' + styleVars({ '--c': item.color }) + '"></path>',
        '<path class="pie-texture pat-' + escapeHtml(String(item.pattern || 0)) + '" d="' + path + '"></path>'
      ].join('');
    }).join('');
  }

  function patternDefs() {
    return [
      '<defs>',
      '<pattern id="pdiag" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><line x1="0" y1="0" x2="0" y2="8"></line></pattern>',
      '<pattern id="pvert" width="7" height="7" patternUnits="userSpaceOnUse"><line x1="2" y1="0" x2="2" y2="7"></line></pattern>',
      '<pattern id="pdot" width="7" height="7" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="2" height="2"></rect></pattern>',
      '<pattern id="pcross" width="8" height="8" patternUnits="userSpaceOnUse"><line x1="0" y1="4" x2="8" y2="4"></line><line x1="4" y1="0" x2="4" y2="8"></line></pattern>',
      '<pattern id="phoriz" width="7" height="7" patternUnits="userSpaceOnUse"><line x1="0" y1="2" x2="7" y2="2"></line></pattern>',
      '<pattern id="pgrid" width="8" height="8" patternUnits="userSpaceOnUse"><rect x="1" y="1" width="5" height="5"></rect></pattern>',
      '</defs>'
    ].join('');
  }

  function piePath(cx, cy, radius, startAngle, endAngle) {
    var start = polar(cx, cy, radius, startAngle);
    var end = polar(cx, cy, radius, endAngle);
    var large = endAngle - startAngle > 180 ? 1 : 0;
    return ['M', cx, cy, 'L', start.x, start.y, 'A', radius, radius, 0, large, 1, end.x, end.y, 'Z'].join(' ');
  }

  function donutPath(cx, cy, outer, inner, startAngle, endAngle) {
    var startOuter = polar(cx, cy, outer, startAngle);
    var endOuter = polar(cx, cy, outer, endAngle);
    var startInner = polar(cx, cy, inner, endAngle);
    var endInner = polar(cx, cy, inner, startAngle);
    var large = endAngle - startAngle > 180 ? 1 : 0;
    return [
      'M', startOuter.x, startOuter.y,
      'A', outer, outer, 0, large, 1, endOuter.x, endOuter.y,
      'L', startInner.x, startInner.y,
      'A', inner, inner, 0, large, 0, endInner.x, endInner.y,
      'Z'
    ].join(' ');
  }

  function polar(cx, cy, radius, angleDeg) {
    var angle = angleDeg * Math.PI / 180;
    return {
      x: Math.round((cx + (Math.cos(angle) * radius)) * 100) / 100,
      y: Math.round((cy + (Math.sin(angle) * radius)) * 100) / 100
    };
  }

  function render() {
    var model = scenarioModel();
    document.getElementById('salary-summary').innerHTML = renderSummary(model);
    document.getElementById('preview-grid').innerHTML = [
      renderPieVariantSet(model)
    ].join('');
  }

  function setRevealGroup(scope, group, model) {
    var validGroup = activeFamily(model, group).group;
    if (scope === 'inline') {
      inlineRevealGroup = validGroup;
    } else if (scope === 'lens') {
      lensRevealGroup = validGroup;
    } else if (scope === 'accordion') {
      accordionRevealGroup = validGroup;
    } else if (scope === 'tray') {
      trayRevealGroup = validGroup;
    } else if (scope === 'step') {
      stepRevealIndex = familyGroups(model).map(function (item) {
        return item.group;
      }).indexOf(validGroup);
    } else {
      if (!canB1DrillGroup({ group: validGroup })) {
        return;
      }
      if (isB1GroupOpen(validGroup)) {
        setB1GroupOpen(validGroup, false);
        return;
      }
      setB1GroupOpen(validGroup, true);
      if (validGroup === 'saving') {
        selectedSavingNode = 'summary';
      }
    }
  }

  function handlePreviewClick(event) {
    var model = scenarioModel();
    var cycleButton = event.target.closest('[data-cycle]');
    var savingButton = event.target.closest('[data-saving-node]');
    var childButton = event.target.closest('[data-b1-child-group]');
    var pieGroupButton = closestByAttribute(event.target, 'data-pie-group');
    var pieSavingButton = closestByAttribute(event.target, 'data-pie-saving-node');
    var pieResetButton = closestByAttribute(event.target, 'data-pie-reset');
    var revealButton;
    var groups;
    if (cycleButton) {
      groups = familyGroups(model);
      stepRevealIndex += Number(cycleButton.getAttribute('data-cycle') || 0);
      stepRevealIndex = ((stepRevealIndex % groups.length) + groups.length) % groups.length;
      render();
      return;
    }
    if (savingButton) {
      if (savingButton.getAttribute('data-saving-node') === 'collapse') {
        setB1GroupOpen('saving', false);
      } else {
        setB1GroupOpen('saving', true);
        selectedSavingNode = savingButton.getAttribute('data-saving-node') || 'summary';
      }
      render();
      return;
    }
    if (childButton) {
      setB1GroupOpen(childButton.getAttribute('data-b1-child-group'), false);
      render();
      return;
    }
    if (pieResetButton) {
      pieOpenGroups = {};
      pieSavingNode = 'summary';
      render();
      return;
    }
    if (pieSavingButton) {
      setPieGroupOpen('saving', true);
      pieSavingNode = pieSavingButton.getAttribute('data-pie-saving-node') || 'summary';
      render();
      return;
    }
    if (pieGroupButton) {
      handlePieGroupTap(pieGroupButton.getAttribute('data-pie-group'));
      render();
      return;
    }
    revealButton = event.target.closest('[data-reveal-group]');
    if (revealButton) {
      setRevealGroup(revealButton.getAttribute('data-reveal-scope'), revealButton.getAttribute('data-reveal-group'), model);
      render();
      return;
    }

    if (b1HasOpenGroups()) {
      b1OpenGroups = {};
      selectedSavingNode = 'summary';
      render();
    }
  }

  function closestByAttribute(node, attr) {
    var current = node;
    while (current && current !== document) {
      if (current.getAttribute && current.getAttribute(attr) !== null) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
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
  document.getElementById('preview-grid').addEventListener('click', handlePreviewClick);
  render();
}());
