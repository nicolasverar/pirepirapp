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
      renderB1InlineFocus(model)
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
