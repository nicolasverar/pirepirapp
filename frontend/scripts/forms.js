(function () {
  'use strict';

  var utils = window.FinanzasUtils;
  var DUPLICATE_SALARY_MESSAGE = "Cobraste otra vez gua'u? que bola que sos en serio";
  var FUTURE_PREFS_KEY = 'finanzasFutureSavingsPrefs';

  function openModal(title, content, afterOpen, className) {
    var root = utils.qs('#modal-root');
    var modalClass = className ? ' ' + className : '';
    var isActionMenu = String(className || '').indexOf('action-menu-modal') !== -1;
    root.className = 'modal-root' + (isActionMenu ? ' is-action-menu' : '');
    root.hidden = false;
    root.innerHTML = [
      '<div class="modal-backdrop" data-close-modal></div>',
      '<section class="system-modal' + utils.escapeHtml(modalClass) + '" role="dialog" aria-modal="true" aria-label="' + utils.escapeHtml(title) + '">',
      '<div class="window-title">',
      '<span>' + utils.escapeHtml(title) + '</span>',
      '<button class="window-close" type="button" data-close-modal>CERRAR</button>',
      '</div>',
      '<div class="modal-body">' + content + '</div>',
      '</section>'
    ].join('');

    utils.qsa('[data-close-modal]', root).forEach(function (item) {
      item.addEventListener('click', closeModal);
    });

    if (afterOpen) {
      afterOpen(root);
    }
    if (isActionMenu) {
      positionActionMenu(root);
      window.setTimeout(function () {
        positionActionMenu(root);
      }, 0);
    }
  }

  function closeModal() {
    var root = utils.qs('#modal-root');
    root.hidden = true;
    root.className = 'modal-root';
    root.innerHTML = '';
  }

  function positionActionMenu(root) {
    var modal = utils.qs('.system-modal', root);
    var keyZone = utils.qs('.key-zone');
    if (!modal || !keyZone) {
      return;
    }
    var rect = keyZone.getBoundingClientRect();
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    var gap = 8;
    modal.style.left = (rect.left + (rect.width / 2)) + 'px';
    modal.style.width = Math.max(260, Math.min(rect.width, viewportWidth - 24)) + 'px';
    modal.style.bottom = Math.max(8, viewportHeight - rect.top + gap) + 'px';
    modal.style.maxHeight = Math.max(176, rect.top - 18) + 'px';
  }

  function field(label, name, type, value, attrs) {
    return [
      '<label class="field">',
      '<span>' + utils.escapeHtml(label) + '</span>',
      '<input name="' + utils.escapeHtml(name) + '" type="' + utils.escapeHtml(type || 'text') + '" value="' + utils.escapeHtml(value || '') + '" ' + (attrs || '') + '>',
      '</label>'
    ].join('');
  }

  function textarea(label, name, value, attrs) {
    return [
      '<label class="field">',
      '<span>' + utils.escapeHtml(label) + '</span>',
      '<textarea name="' + utils.escapeHtml(name) + '" ' + (attrs || '') + '>' + utils.escapeHtml(value || '') + '</textarea>',
      '</label>'
    ].join('');
  }

  function select(label, name, options, value, attrs) {
    var optionHtml = (options || []).map(function (option) {
      var val = typeof option === 'string' ? option : option.value;
      var text = typeof option === 'string' ? option : option.label;
      return '<option value="' + utils.escapeHtml(val) + '"' + (String(val) === String(value || '') ? ' selected' : '') + '>' + utils.escapeHtml(text) + '</option>';
    }).join('');
    return [
      '<label class="field">',
      '<span>' + utils.escapeHtml(label) + '</span>',
      '<select name="' + utils.escapeHtml(name) + '" ' + (attrs || '') + '>' + optionHtml + '</select>',
      '</label>'
    ].join('');
  }

  function checkbox(label, name, checked, attrs) {
    return [
      '<label class="field check-field">',
      '<span>' + utils.escapeHtml(label) + '</span>',
      '<input name="' + utils.escapeHtml(name) + '" type="checkbox" value="true" ' + (checked ? 'checked ' : '') + (attrs || '') + '>',
      '</label>'
    ].join('');
  }

  function formActions(saveLabel) {
    return [
      '<div class="form-actions">',
      '<button class="lcd-button primary" type="submit">' + utils.escapeHtml(saveLabel || 'Guardar') + '</button>',
      '<button class="lcd-button" type="button" data-close-modal>Cancelar</button>',
      '</div>'
    ].join('');
  }

  function incomeSalaryShortcut() {
    return [
      '<div class="income-shortcuts">',
      '<button class="lcd-button salary-inline-button" type="button" data-fill-salary>¡Cobré!</button>',
      '</div>'
    ].join('');
  }

  function movementMotiveField(value, wishlistItems) {
    var items = Array.isArray(wishlistItems) ? wishlistItems : [];
    if (!items.length) {
      return field('Motivo', 'motivo', 'text', value || '', 'required maxlength="120" autocomplete="off" data-movement-motive');
    }
    return [
      '<div class="field movement-motive-field">',
      '<span>Motivo</span>',
      '<div class="movement-motive-control">',
      '<input name="motivo" type="text" value="' + utils.escapeHtml(value || '') + '" required maxlength="120" autocomplete="off" data-movement-motive>',
      '<button class="motive-wishlist-toggle" type="button" data-wishlist-picker-toggle>COSAS</button>',
      '</div>',
      '<div class="motive-wishlist-panel" hidden data-wishlist-picker-list>',
      '<button class="motive-wishlist-item motive-wishlist-free" type="button" data-wishlist-free>',
      '<strong>LIBRE</strong>',
      '<small>Escribir motivo</small>',
      '</button>',
      items.map(function (item) {
        return [
          '<button class="motive-wishlist-item" type="button" data-wishlist-picker-id="' + utils.escapeHtml(item.id || '') + '">',
          '<strong>' + utils.escapeHtml(item.titulo || 'Cosa que quiero') + '</strong>',
          '<small>' + utils.escapeHtml(utils.formatMoney(item.costoAproximado || 0)) + '</small>',
          '</button>'
        ].join('');
      }).join(''),
      '</div>',
      '</div>'
    ].join('');
  }

  function bindSalaryShortcut(root, config, motiveInput, amountInput) {
    var button = utils.qs('[data-fill-salary]', root);
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      var salary = utils.normalizeAmount((config || {}).sueldoMensual || 0);
      if (!salary) {
        if (window.FinanzasApp && window.FinanzasApp.toast) {
          window.FinanzasApp.toast('Carga tu sueldo mensual en Configuracion.');
        }
        return;
      }
      var dateInput = utils.qs('[name="fecha"]', root);
      var timeInput = utils.qs('[name="hora"]', root);
      if (motiveInput) {
        motiveInput.value = 'Sueldo';
      }
      if (amountInput) {
        amountInput.value = salary;
      }
      if (dateInput) {
        dateInput.value = utils.toInputDate();
      }
      if (timeInput) {
        timeInput.value = utils.toInputTime();
      }
      if (window.FinanzasApp && window.FinanzasApp.toast) {
        window.FinanzasApp.toast('Ingreso listo para guardar.');
      }
    });
  }

  function bindForm(root, selector, handler) {
    var form = utils.qs(selector, root);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (form.getAttribute('data-submitting') === 'true') {
        return;
      }
      setFormError(form, '');
      setFormPending(form, true);
      var result;
      try {
        result = handler(form);
      } catch (error) {
        setFormError(form, error.message || 'No se pudo guardar.');
        setFormPending(form, false);
        return;
      }
      Promise.resolve(result).catch(function (error) {
        var message = error.message || 'No se pudo guardar.';
        if (form.getAttribute('data-close-on-submit') === 'true') {
          if (window.FinanzasApp && window.FinanzasApp.toast) {
            window.FinanzasApp.toast(message);
          }
        } else {
          setFormError(form, message);
          setFormPending(form, false);
        }
      });
      if (form.getAttribute('data-close-on-submit') === 'true') {
        closeModal();
      }
    });
  }

  function setFormPending(form, pending) {
    var submit = utils.qs('button[type="submit"]', form);
    form.setAttribute('data-submitting', pending ? 'true' : 'false');
    if (submit) {
      if (!submit.getAttribute('data-original-label')) {
        submit.setAttribute('data-original-label', submit.textContent);
      }
      submit.disabled = pending;
      submit.textContent = pending ? 'Guardando...' : submit.getAttribute('data-original-label');
    }
  }

  function setFormError(form, message) {
    var box = utils.qs('.form-error', form);
    if (box) {
      box.textContent = message || '';
      box.hidden = !message;
    }
  }

  function actionMenu() {
    var view = window.FinanzasState.getState().currentView;
    if (isActionMenuOpen()) {
      closeModal();
      return;
    }
    openActionMenuForView(view);
  }

  function syncActionMenuForView(view) {
    if (!isActionMenuOpen()) {
      return;
    }
    openActionMenuForView(view);
  }

  function isActionMenuOpen() {
    var root = utils.qs('#modal-root');
    return Boolean(root && !root.hidden && root.className.indexOf('is-action-menu') !== -1);
  }

  function openActionMenuForView(view) {
    if (view === 'configuracion') {
      openFixedExpenseForm();
      return;
    }
    if (view !== 'resumen' && view !== 'metas' && view !== 'gastos') {
      closeModal();
      return;
    }
    if (view === 'gastos') {
      openModal('FILTRAR MOVIMIENTOS', filterMenuContent(), bindMovementFilterMenu, 'action-menu-modal filter-action-modal');
      return;
    }
    if (view === 'metas') {
      openModal('AGREGAR OBJETIVO', actionMenuContent('METAS', '3 OPC.', [
        { action: 'future', title: 'El futuro', detail: 'Ahorro largo' },
        { action: 'goal', title: 'Meta especifica', detail: 'Objetivo' },
        { action: 'wish', title: 'Cosa que quiero', detail: 'Wishlist' }
      ]), bindActionMenu, 'action-menu-modal');
      return;
    }

    openModal('AGREGAR MOVIMIENTO', actionMenuContent('RESUMEN', '2 OPC.', [
      { action: 'expense', title: 'Gasto corriente', detail: 'Salida' },
      { action: 'income', title: 'Registrar ingreso', detail: 'Entrada' }
    ]), bindActionMenu, 'action-menu-modal');
  }

  function actionMenuContent(label, count, options) {
    return [
      '<div class="add-action-menu">',
      '<div class="add-action-context">',
      '<div class="add-action-context-label"><span>' + utils.escapeHtml(label) + '</span><span>' + utils.escapeHtml(count) + '</span></div>',
      '<div class="add-action-list">',
      options.map(function (option, index) {
        var activeClass = option.active ? ' is-active' : '';
        return [
          '<button class="add-action-item' + activeClass + '" type="button" data-form-action="' + utils.escapeHtml(option.action) + '">',
          '<i class="add-action-num">' + utils.escapeHtml(String(index + 1).length === 1 ? '0' + (index + 1) : String(index + 1)) + '</i>',
          '<span><strong>' + utils.escapeHtml(option.title) + '</strong><span>' + utils.escapeHtml(option.detail) + '</span></span>',
          '</button>'
        ].join('');
      }).join(''),
      '</div>',
      '</div>',
      '</div>'
    ].join('');
  }

  function bindActionMenu(root) {
    utils.qsa('[data-form-action]', root).forEach(function (button) {
      button.addEventListener('click', function () {
        var action = button.getAttribute('data-form-action');
        if (action === 'expense') {
          openMovementForm('Gasto');
        }
        if (action === 'income') {
          openMovementForm('Ingreso');
        }
        if (action === 'future') {
          openFutureSavingForm();
        }
        if (action === 'goal') {
          openGoalForm();
        }
        if (action === 'wish') {
          openWishlistForm();
        }
      });
    });
  }

  function filterMenuContent() {
    var groups = movementFilterMenuOptions();
    var activeCount = groups.typeOptions.filter(function (option) {
      return option.value !== 'all' && option.active;
    }).length + (groups.monthRange.active ? 1 : 0);
    var status = activeCount ? activeCount + ' ON' : (groups.typeOptions.length + 1) + ' OPC.';
    return [
      '<div class="add-action-menu filter-action-menu">',
      '<div class="add-action-context">',
      '<div class="add-action-context-label"><span>MOVIMIENTOS</span><span>' + utils.escapeHtml(status) + '</span></div>',
      renderMovementFilterGroup('Tipo', groups.typeOptions, 'movement-filter-types'),
      renderMovementMonthRange(groups.monthRange, groups.monthBounds),
      '</div>',
      '</div>'
    ].join('');
  }

  function renderMovementFilterGroup(label, options, extraClass) {
    return [
      '<div class="movement-filter-group">',
      '<div class="movement-filter-group-label">' + utils.escapeHtml(label) + '</div>',
      '<nav class="movement-filters movement-filter-dock ' + utils.escapeHtml(extraClass || '') + '" aria-label="Filtrar movimientos por ' + utils.escapeHtml(label.toLowerCase()) + '">',
      options.map(function (option) {
        var activeClass = option.active ? ' is-active' : '';
        return [
          '<button class="filter-chip js-filter-menu-option' + activeClass + '" type="button" data-filter="' + utils.escapeHtml(option.value) + '" aria-pressed="' + (option.active ? 'true' : 'false') + '">',
          '<span>' + utils.escapeHtml(option.label) + '</span>',
          '<small>' + utils.escapeHtml(option.count) + '</small>',
          '</button>'
        ].join('');
      }).join(''),
      '</nav>',
      '</div>'
    ].join('');
  }

  function renderMovementMonthRange(range, bounds) {
    var current = range || {};
    var limits = bounds || {};
    var options = movementRangeMonthOptions(current, limits);
    return [
      '<div class="movement-filter-group movement-range-filter">',
      '<div class="movement-filter-group-label">Meses</div>',
      '<div class="movement-range-panel' + (current.active ? ' is-active' : '') + '">',
      '<div class="movement-range-grid">',
      renderMovementMonthSelect('Desde', 'data-filter-month-from', current.from || '', options),
      renderMovementMonthSelect('Hasta', 'data-filter-month-to', current.to || '', options),
      '</div>',
      '<div class="movement-range-actions">',
      '<button class="range-key primary" type="button" data-filter-range-apply>APLICAR</button>',
      '<button class="range-key" type="button" data-filter-range-clear>TODO</button>',
      '</div>',
      '</div>',
      '</div>'
    ].join('');
  }

  function renderMovementMonthSelect(label, attribute, value, options) {
    var currentValue = String(value || '').slice(0, 7);
    var optionHtml = ['<option value="">MES</option>'].concat((options || []).map(function (option) {
      var optionValue = String(option.value || '').slice(0, 7);
      return '<option value="' + utils.escapeHtml(optionValue) + '"' + (optionValue === currentValue ? ' selected' : '') + '>' + utils.escapeHtml(option.label || optionValue) + '</option>';
    })).join('');
    return [
      '<label class="movement-range-field">',
      '<span>' + utils.escapeHtml(label) + '</span>',
      '<span class="movement-range-select"><select ' + attribute + '>' + optionHtml + '</select></span>',
      '</label>'
    ].join('');
  }

  function movementRangeMonthOptions(current, bounds) {
    var source = ((bounds || {}).options || []).slice();
    var seen = {};
    function addOption(value) {
      var month = normalizeMonthInput(value);
      if (!month || seen[month]) {
        return;
      }
      seen[month] = true;
      source.push({ value: month, label: movementMonthLabel(month) });
    }
    source.forEach(function (option) {
      seen[String(option.value || '').slice(0, 7)] = true;
    });
    addOption((current || {}).from);
    addOption((current || {}).to);
    if (!source.length) {
      addOption(utils.currentMonth());
    }
    return source.sort(function (left, right) {
      return String(right.value || '').localeCompare(String(left.value || ''));
    });
  }

  function bindMovementFilterMenu(root) {
    utils.qsa('.js-filter-menu-option', root).forEach(function (button) {
      button.addEventListener('click', function () {
        var current = window.FinanzasState.getState().movementFilter || 'all';
        var next = toggleMovementFilter(current, button.getAttribute('data-filter') || 'all');
        window.FinanzasState.setState({ movementFilter: next });
        refreshMovementFilterMenu(root);
      });
    });
    bindMovementRangeMenu(root);
  }

  function bindMovementRangeMenu(root) {
    var fromInput = utils.qs('[data-filter-month-from]', root);
    var toInput = utils.qs('[data-filter-month-to]', root);
    var applyButton = utils.qs('[data-filter-range-apply]', root);
    var clearButton = utils.qs('[data-filter-range-clear]', root);

    function applyRange() {
      var current = window.FinanzasState.getState().movementFilter || 'all';
      var next = setMovementMonthRange(current, fromInput && fromInput.value, toInput && toInput.value);
      window.FinanzasState.setState({ movementFilter: next });
      refreshMovementFilterMenu(root);
    }

    if (applyButton) {
      applyButton.addEventListener('click', applyRange);
    }
    if (fromInput) {
      fromInput.addEventListener('change', applyRange);
    }
    if (toInput) {
      toInput.addEventListener('change', applyRange);
    }
    if (clearButton) {
      clearButton.addEventListener('click', function () {
        var current = window.FinanzasState.getState().movementFilter || 'all';
        window.FinanzasState.setState({ movementFilter: setMovementMonthRange(current, '', '') });
        refreshMovementFilterMenu(root);
      });
    }
  }

  function refreshMovementFilterMenu(root) {
    var body = utils.qs('.modal-body', root);
    if (!body) {
      return;
    }
    body.innerHTML = filterMenuContent();
    bindMovementFilterMenu(root);
    positionActionMenu(root);
  }

  function movementFilterMenuOptions() {
    var state = window.FinanzasState.getState();
    var movements = movementItemsFromData((state.data || {}).movimientos);
    var config = (state.data || {}).config || {};
    var active = state.movementFilter || 'all';
    return {
      typeOptions: movementFilterOptions().map(function (option) {
        var count = movementFilterCount(movements, option.value);
        return {
          value: option.value,
          label: option.label,
          count: count,
          active: movementFiltersInclude(active, option.value)
        };
      }),
      monthRange: movementRangeFromFilters(active),
      monthBounds: movementRangeBounds(movements, config)
    };
  }

  function movementRangeBounds(movements, config) {
    var seen = {};
    var months = [];
    function addMonth(value) {
      var month = String(value || '').slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(month) || seen[month]) {
        return;
      }
      seen[month] = true;
      months.push(month);
    }

    addMonth((config || {}).mesActual || utils.currentMonth());
    (movements || []).forEach(function (item) {
      addMonth(movementMonth(item));
    });

    months.sort().reverse();
    return {
      min: months.length ? months[months.length - 1] : '',
      max: months.length ? months[0] : '',
      options: months.map(function (month) {
        return {
          value: month,
          label: movementMonthLabel(month)
        };
      })
    };
  }

  function movementRangeFromFilters(active) {
    var months = [];
    var range = null;
    normalizeMovementFilters(active).forEach(function (value) {
      if (isRangeFilter(value)) {
        range = parseRangeFilter(value);
      } else if (isMonthFilter(value)) {
        months.push(value.slice(6, 13));
      }
    });
    if (!range && months.length) {
      months.sort();
      range = {
        from: months[0],
        to: months[months.length - 1]
      };
    }
    return Object.assign({ from: '', to: '', active: false }, range || {}, { active: Boolean(range) });
  }

  function movementMonthLabel(value) {
    var monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    var text = String(value || '');
    var index = Number(text.slice(5, 7)) - 1;
    var label = monthNames[index] || text.slice(5, 7);
    return label + ' ' + text.slice(2, 4);
  }

  function movementTypeFilterOptions() {
    return [
      { value: 'all', label: 'Todo' },
      { value: 'expense', label: 'Gastos' },
      { value: 'income', label: 'Ingresos' },
      { value: 'wishlist', label: 'Cosas' },
      { value: 'saving', label: 'Ahorro/meta' },
      { value: 'fixed', label: 'Fijos' }
    ];
  }

  function movementFilterOptions() {
    return movementTypeFilterOptions();
  }

  function movementFilterCount(movements, filter) {
    return (movements || []).filter(function (item) {
      return matchesMovementFilter(item, filter);
    }).length;
  }

  function normalizeMovementFilters(filter) {
    var values = Array.isArray(filter) ? filter : [filter || 'all'];
    var allowed = movementTypeFilterOptions().map(function (option) {
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

  function isMonthFilter(value) {
    return /^month:\d{4}-\d{2}$/.test(String(value || ''));
  }

  function isRangeFilter(value) {
    return /^range:\d{4}-\d{2}\.\.\d{4}-\d{2}$/.test(String(value || ''));
  }

  function parseRangeFilter(value) {
    var match = /^range:(\d{4}-\d{2})\.\.(\d{4}-\d{2})$/.exec(String(value || ''));
    if (!match) {
      return null;
    }
    return normalizeMonthRange(match[1], match[2]);
  }

  function movementFiltersInclude(active, value) {
    var filters = normalizeMovementFilters(active);
    return value === 'all' ? !filters.length : filters.indexOf(value) !== -1;
  }

  function toggleMovementFilter(active, value) {
    var clean = String(value || 'all').trim();
    var filters = normalizeMovementFilters(active);
    var index;
    if (!clean || clean === 'all') {
      return 'all';
    }
    index = filters.indexOf(clean);
    if (index === -1) {
      filters.push(clean);
    } else {
      filters.splice(index, 1);
    }
    return filters.length ? filters : 'all';
  }

  function setMovementMonthRange(active, fromValue, toValue) {
    var range = normalizeMonthRange(fromValue, toValue);
    var filters = normalizeMovementFilters(active).filter(function (value) {
      return !isMonthFilter(value) && !isRangeFilter(value);
    });
    if (range) {
      filters.push('range:' + range.from + '..' + range.to);
    }
    return filters.length ? filters : 'all';
  }

  function normalizeMonthRange(fromValue, toValue) {
    var from = normalizeMonthInput(fromValue);
    var to = normalizeMonthInput(toValue);
    var swap;
    if (!from && !to) {
      return null;
    }
    if (!from) {
      from = to;
    }
    if (!to) {
      to = from;
    }
    if (from > to) {
      swap = from;
      from = to;
      to = swap;
    }
    return { from: from, to: to };
  }

  function normalizeMonthInput(value) {
    var text = String(value || '').slice(0, 7);
    return /^\d{4}-\d{2}$/.test(text) ? text : '';
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

  function openFixedExpenseForm(existing, existingIndex) {
    var editIndex = Number(existingIndex);
    var isEditing = isFixedExpenseEditIndex(existingIndex);
    var budget = fixedExpenseFormBudget(isEditing ? editIndex : null);
    var source = existing || {};
    var initialName = utils.fixedExpenseName(source);
    var initialAmount = utils.fixedExpenseAmount(source);
    var initialPercent = utils.fixedExpensePercent(source, budget.salary);
    var maxPercent = budget.salary ? roundFixedPercent((budget.maxAmount / budget.salary) * 100) : 0;
    var html = [
      '<form class="lcd-form fixed-expense-form" id="fixed-expense-form">',
      '<p class="form-error" hidden></p>',
      fixedExpenseBudgetPanel(budget),
      field('Nombre del gasto', 'nombre', 'text', initialName || '', 'required maxlength="80" autocomplete="off" data-fixed-form-name'),
      field('Monto mensual', 'monto', 'number', initialAmount || '', 'required min="1" step="1" inputmode="numeric" data-fixed-form-amount'),
      '<label class="field fixed-percent-control"><span>Porcentaje del sueldo</span>',
      '<span class="fixed-slider-shell">',
      '<input data-fixed-form-percent name="porcentajeSueldo" type="range" min="0" max="' + utils.escapeHtml(maxPercent) + '" step="0.5" value="' + utils.escapeHtml(formatFixedPercent(initialPercent)) + '">',
      '<b data-fixed-form-percent-display>0%</b>',
      '</span>',
      '<small class="fixed-limit-message" data-fixed-form-limit></small>',
      '</label>',
      formActions(isEditing ? 'Actualizar' : 'Guardar'),
      '</form>'
    ].join('');

    openModal('GASTO FIJO', html, function (root) {
      bindFixedExpenseForm(root, isEditing ? editIndex : null);
    }, 'ticket-form-modal action-menu-modal anchored-form-modal fixed-expense-form-modal');
  }

  function fixedExpenseBudgetPanel(budget) {
    var warningClass = budget.salary ? '' : ' is-warning';
    return [
      '<div class="fixed-form-budget' + warningClass + '">',
      '<span><small>Sueldo</small><strong>' + utils.escapeHtml(utils.formatMoney(budget.salary)) + '</strong></span>',
      '<span><small>Ya fijo</small><strong>' + utils.escapeHtml(utils.formatMoney(budget.usedFixed)) + '</strong></span>',
      '<span><small>Ahorros</small><strong>' + utils.escapeHtml(utils.formatMoney(budget.plannedSavings)) + '</strong></span>',
      '<span><small>Disponible</small><strong>' + utils.escapeHtml(utils.formatMoney(budget.maxAmount)) + '</strong></span>',
      '</div>'
    ].join('');
  }

  function bindFixedExpenseForm(root, editIndex) {
    var form = utils.qs('#fixed-expense-form', root);
    var amountInput = utils.qs('[data-fixed-form-amount]', root);
    var percentInput = utils.qs('[data-fixed-form-percent]', root);
    var display = utils.qs('[data-fixed-form-percent-display]', root);
    var message = utils.qs('[data-fixed-form-limit]', root);

    function currentBudget() {
      var budget = fixedExpenseFormBudget(editIndex);
      var maxPercent = budget.salary ? roundFixedPercent((budget.maxAmount / budget.salary) * 100) : 0;
      if (percentInput) {
        percentInput.max = String(maxPercent);
      }
      return budget;
    }

    function setLimitMessage(text) {
      if (message) {
        message.textContent = text || '';
        message.hidden = !text;
      }
    }

    function syncPercentDisplay() {
      if (display) {
        display.textContent = formatFixedPercent(parseFixedPercent((percentInput || {}).value)) + '%';
      }
    }

    function syncFromAmount() {
      var budget = currentBudget();
      var amount = utils.normalizeAmount((amountInput || {}).value);
      if (budget.maxAmount >= 0 && amount > budget.maxAmount) {
        amount = budget.maxAmount;
        amountInput.value = amount ? String(amount) : '';
        setLimitMessage('Limite disponible: ' + utils.formatMoney(budget.maxAmount));
      } else {
        setLimitMessage('');
      }
      if (percentInput) {
        percentInput.value = formatFixedPercent(budget.salary ? (amount / budget.salary) * 100 : 0);
      }
      syncPercentDisplay();
    }

    function syncFromPercent() {
      var budget = currentBudget();
      var maxPercent = budget.salary ? roundFixedPercent((budget.maxAmount / budget.salary) * 100) : 0;
      var percent = parseFixedPercent((percentInput || {}).value);
      if (percent > maxPercent) {
        percent = maxPercent;
        setLimitMessage('Limite disponible: ' + utils.formatMoney(budget.maxAmount));
      } else {
        setLimitMessage('');
      }
      if (percentInput) {
        percentInput.value = formatFixedPercent(percent);
      }
      if (amountInput) {
        amountInput.value = budget.salary && percent ? String(Math.round((percent * budget.salary) / 100)) : '';
      }
      syncPercentDisplay();
    }

    if (amountInput) {
      amountInput.addEventListener('input', syncFromAmount);
    }
    if (percentInput) {
      percentInput.addEventListener('input', syncFromPercent);
    }
    currentBudget();
    syncPercentDisplay();

    bindForm(root, '#fixed-expense-form', function () {
      var budget = fixedExpenseFormBudget(editIndex);
      var payload = utils.formDataToObject(form);
      var name = String(payload.nombre || '').trim();
      var amount = utils.normalizeAmount(payload.monto);
      var percent = budget.salary ? roundFixedPercent((amount / budget.salary) * 100) : parseFixedPercent(payload.porcentajeSueldo);
      var nextItems = budget.items.slice();
      var fixedExpense = {
        categoria: name,
        nombre: name,
        monto: amount,
        porcentajeSueldo: percent
      };
      if (!budget.salary) {
        throw new Error('Carga el sueldo mensual antes de agregar fijos.');
      }
      if (!name) {
        throw new Error('Escribi el nombre del gasto fijo.');
      }
      if (!amount) {
        throw new Error('Carga el monto mensual.');
      }
      if (amount > budget.maxAmount) {
        throw new Error('Ese gasto supera el disponible para fijos: ' + utils.formatMoney(budget.maxAmount) + '.');
      }
      if (isFixedExpenseEditIndex(editIndex) && Number(editIndex) < nextItems.length) {
        nextItems[Number(editIndex)] = fixedExpense;
      } else {
        nextItems = nextItems.concat([fixedExpense]);
      }
      return window.FinanzasApp.mutate('updateConfig', Object.assign({}, budget.config, {
        sueldoMensual: budget.salary,
        gastosFijos: nextItems
      })).then(closeModal);
    });
  }

  function fixedExpenseFormBudget(editIndex) {
    var data = window.FinanzasState.getState().data || {};
    var config = data.config || {};
    var salary = utils.normalizeAmount(config.sueldoMensual || 0);
    var items = utils.normalizeFixedExpenses(config.gastosFijos || [], salary);
    var excludedIndex = isFixedExpenseEditIndex(editIndex) ? Number(editIndex) : -1;
    var usedFixed = sumFixedExpenses(items.filter(function (item, index) {
      return index !== excludedIndex;
    }));
    var plannedSavings = plannedSavingsForFixedExpenseForm(data);
    return {
      config: config,
      salary: salary,
      items: items,
      usedFixed: usedFixed,
      plannedSavings: plannedSavings,
      maxAmount: Math.max(0, salary - usedFixed - plannedSavings)
    };
  }

  function isFixedExpenseEditIndex(value) {
    return value !== undefined && value !== null && value !== '' && isFinite(Number(value)) && Number(value) >= 0;
  }

  function plannedSavingsForFixedExpenseForm(data) {
    var source = data || {};
    var summaryTotal = utils.normalizeAmount((source.resumen || {}).ahorrosPlanificados || 0);
    if (summaryTotal) {
      return summaryTotal;
    }
    var total = 0;
    activeFinanceItems(source.ahorrosFuturo).forEach(function (item) {
      total += utils.normalizeAmount(item.montoMensual);
    });
    activeFinanceItems(source.metas).forEach(function (item) {
      total += utils.normalizeAmount(item.montoMensual);
    });
    return total;
  }

  function activeFinanceItems(items) {
    return (Array.isArray(items) ? items : []).filter(function (item) {
      return !item.estado || String(item.estado).toLowerCase() === 'activo';
    });
  }

  function sumFixedExpenses(items) {
    return (items || []).reduce(function (sum, item) {
      return sum + utils.fixedExpenseAmount(item);
    }, 0);
  }

  function parseFixedPercent(value) {
    var number = Number(String(value === undefined || value === null || value === '' ? 0 : value).replace(',', '.'));
    if (!isFinite(number)) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round(number * 100) / 100));
  }

  function roundFixedPercent(value) {
    return parseFixedPercent(value);
  }

  function formatFixedPercent(value) {
    return String(parseFixedPercent(value));
  }

  function openMovementForm(defaultType, existing, defaults) {
    var data = window.FinanzasState.getState().data;
    var config = data.config || {};
    var movement = Object.assign({}, defaults || {}, existing || {});
    var defaultDate = movement.fecha || defaultDateForActiveMonth(config.mesActual);
    var isIncome = defaultType === 'Ingreso' || movement.tipo === 'Ingreso';
    var defaultCategory = movement.categoria || (isIncome ? 'Ingreso' : 'Otros');
    if (!isIncome && movement.tipo === 'Compra de wishlist') {
      defaultCategory = 'Wishlist';
    }
    var initialType = (!isIncome && defaultCategory === 'Gasto fijo')
      ? 'Gasto fijo'
      : (movement.tipo || defaultType);
    var initialRelatedId = movement.idRelacionado || '';
    if (initialType === 'Gasto fijo' && !initialRelatedId) {
      initialRelatedId = fixedExpenseValueForMovement(data, movement);
    }
    var useTypeSelect = Boolean(existing && !isIncome);
    var typeControl = isIncome
      ? '<input name="tipo" type="hidden" value="Ingreso" data-movement-type>'
      : (useTypeSelect ? select('Tipo', 'tipo', [
        { value: 'Gasto', label: 'Gasto' },
        { value: 'Gasto fijo', label: 'Gasto fijo' },
        { value: 'Aporte a ahorro', label: 'Aporte a ahorro' },
        { value: 'Aporte a meta', label: 'Aporte a meta' },
        { value: 'Compra de wishlist', label: 'Compra cosa que quiero' }
      ], initialType, 'data-movement-type') : '<input name="tipo" type="hidden" value="' + utils.escapeHtml(initialType || 'Gasto') + '" data-movement-type>');

    var relatedOptions = relatedSelectOptions(data, relatedMode(initialType, defaultCategory));
    var useRelatedSelect = Boolean(existing && !isIncome);
    var relatedControl = useRelatedSelect
      ? select('Seleccionar', 'idRelacionado', relatedOptions, initialRelatedId, 'data-related-select')
      : '<input name="idRelacionado" type="hidden" value="' + utils.escapeHtml(initialRelatedId || '') + '">';
    var showWishlistPicker = !isIncome && !useTypeSelect && Array.isArray(data.wishlist) && data.wishlist.length;
    var html = [
      '<form class="lcd-form" id="movement-form" data-close-on-submit="true">',
      '<p class="form-error" hidden></p>',
      typeControl,
      isIncome ? incomeSalaryShortcut() : '',
      movementMotiveField(movement.motivo || '', showWishlistPicker ? data.wishlist : []),
      field('Monto', 'monto', 'number', movement.monto || '', 'required min="1" step="1" inputmode="numeric" data-movement-amount'),
      relatedControl,
      textarea('Descripcion', 'descripcion', movement.descripcion || '', 'maxlength="500" rows="3"'),
      '<div class="field-row">',
      field('Fecha', 'fecha', 'date', defaultDate, 'required'),
      field('Hora', 'hora', 'time', movement.hora || utils.toInputTime(), 'required'),
      '</div>',
      formActions(existing ? 'Actualizar' : 'Guardar'),
      '</form>'
    ].join('');

    openModal(isIncome ? 'INGRESO' : 'GASTO', html, function (root) {
      var typeSelect = utils.qs('[data-movement-type]', root);
      var relatedSelect = utils.qs('[data-related-select]', root);
      var relatedField = utils.qs('[name="idRelacionado"]', root);
      var motiveInput = utils.qs('[data-movement-motive]', root);
      var amountInput = utils.qs('[data-movement-amount]', root);
      if (relatedSelect) {
        updateRelatedOptions(data, typeSelect, { value: defaultCategory }, relatedSelect, initialRelatedId, movement.motivo || '');
        updateRelatedVisibility(typeSelect, { value: defaultCategory }, relatedSelect);
        updateMotiveVisibility(typeSelect, relatedSelect, motiveInput);
        autocompleteRelatedAmount(data, typeSelect, relatedSelect, amountInput, motiveInput);
      }
      bindSalaryShortcut(root, config, motiveInput, amountInput);
      if (typeSelect.tagName === 'SELECT' && relatedSelect) {
        typeSelect.addEventListener('change', function () {
          var currentCategory = typeSelect.value === 'Compra de wishlist' ? 'Wishlist' : defaultCategory;
          updateRelatedOptions(data, typeSelect, { value: currentCategory }, relatedSelect, '', movement.motivo || '');
          updateRelatedVisibility(typeSelect, { value: currentCategory }, relatedSelect);
          updateMotiveVisibility(typeSelect, relatedSelect, motiveInput);
          autocompleteRelatedAmount(data, typeSelect, relatedSelect, amountInput, motiveInput);
        });
      }
      if (relatedSelect) {
        relatedSelect.addEventListener('change', function () {
          updateMotiveVisibility(typeSelect, relatedSelect, motiveInput);
          autocompleteRelatedAmount(data, typeSelect, relatedSelect, amountInput, motiveInput);
        });
      }
      bindWishlistMotivePicker(root, data, typeSelect, motiveInput, amountInput, relatedField);

      bindForm(root, '#movement-form', function (form) {
        var payload = utils.formDataToObject(form);
        payload.monto = utils.normalizeAmount(payload.monto);
        payload.hora = payload.hora.length === 5 ? payload.hora + ':00' : payload.hora;
        payload.categoria = categoryForMovementPayload(payload.tipo, defaultCategory, isIncome);
        normalizeRelatedMovementPayload(payload, relatedSelect, movement);
        if (!existing && isDuplicateSalaryPayload(data, payload)) {
          throw new Error(DUPLICATE_SALARY_MESSAGE);
        }
        if (payload.categoria === 'Gasto fijo') {
          delete payload.idRelacionado;
        } else if (!payload.idRelacionado) {
          delete payload.idRelacionado;
        }
        if (existing) {
          payload.id = existing.id;
        }
        return window.FinanzasApp.mutate(existing ? 'updateMovement' : 'createMovement', payload)
          .then(closeModal);
      });
    }, isIncome ? 'ticket-form-modal movement-income-modal' : 'ticket-form-modal movement-expense-modal');
  }

  function categoryForMovementPayload(type, fallbackCategory, isIncome) {
    if (type === 'Compra de wishlist') {
      return 'Wishlist';
    }
    if (type === 'Aporte a ahorro') {
      return 'Ahorros';
    }
    if (type === 'Aporte a meta') {
      return 'Metas';
    }
    if (type === 'Gasto fijo') {
      return 'Gasto fijo';
    }
    if (isIncome || type === 'Ingreso') {
      return 'Ingreso';
    }
    return fallbackCategory || 'Otros';
  }

  function bindWishlistMotivePicker(root, data, typeControl, motiveInput, amountInput, relatedField) {
    var toggle = utils.qs('[data-wishlist-picker-toggle]', root);
    var panel = utils.qs('[data-wishlist-picker-list]', root);
    if (!toggle || !panel || !typeControl || !motiveInput) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
    });

    var freeButton = utils.qs('[data-wishlist-free]', panel);
    if (freeButton) {
      freeButton.addEventListener('click', function () {
        typeControl.value = 'Gasto';
        if (relatedField) {
          relatedField.value = '';
        }
        toggle.classList.remove('is-active');
        panel.hidden = true;
        motiveInput.focus();
      });
    }

    utils.qsa('[data-wishlist-picker-id]', panel).forEach(function (button) {
      button.addEventListener('click', function () {
        var item = findById((data || {}).wishlist || [], button.getAttribute('data-wishlist-picker-id'));
        var amount = utils.normalizeAmount(item && item.costoAproximado);
        if (!item) {
          return;
        }
        typeControl.value = 'Compra de wishlist';
        if (relatedField) {
          relatedField.value = item.id || '';
        }
        motiveInput.value = item.titulo || motiveInput.value || 'Cosa que quiero';
        if (amount > 0 && amountInput) {
          amountInput.value = amount;
        }
        toggle.classList.add('is-active');
        panel.hidden = true;
        if (amountInput) {
          amountInput.focus();
          amountInput.select();
        }
      });
    });
  }

  function isDuplicateSalaryPayload(data, payload) {
    if (!isSalaryPayload(payload)) {
      return false;
    }
    var month = String((payload.fecha || utils.toInputDate())).slice(0, 7);
    return movementItemsFromData(data.movimientos).some(function (item) {
      return movementMonth(item) === month && isSalaryPayload(item);
    });
  }

  function isSalaryPayload(item) {
    return String((item || {}).tipo || '') === 'Ingreso'
      && String((item || {}).motivo || '').trim().toLowerCase() === 'sueldo';
  }

  function movementItemsFromData(source) {
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

  function movementMonth(item) {
    var date = String((item || {}).fecha || '');
    if (/^\d{4}-\d{2}/.test(date)) {
      return date.slice(0, 7);
    }
    return String((item || {}).mes || '').slice(0, 7);
  }

  function openFixedExpensePicker() {
    var config = window.FinanzasState.getState().data.config || {};
    var items = utils.normalizeFixedExpenses(config.gastosFijos || [], config.sueldoMensual || 0);
    if (!items.length) {
      if (window.FinanzasApp && window.FinanzasApp.toast) {
        window.FinanzasApp.toast('Primero carga un gasto fijo en Configuracion.');
      }
      return;
    }

    openModal('GASTO FIJO', [
      '<div class="fixed-picker-list">',
      items.map(function (item, index) {
        return [
          '<button class="menu-item fixed-picker-item" type="button" data-fixed-index="' + utils.escapeHtml(index) + '" data-fixed-name="' + utils.escapeHtml(utils.fixedExpenseName(item)) + '" data-fixed-amount="' + utils.escapeHtml(utils.fixedExpenseAmount(item)) + '">',
          '<strong>' + utils.escapeHtml(utils.fixedExpenseName(item)) + '</strong>',
          '<span>' + utils.escapeHtml(utils.formatMoney(utils.fixedExpenseAmount(item))) + '</span>',
          '</button>'
        ].join('');
      }).join(''),
      '</div>'
    ].join(''), function (root) {
      utils.qsa('.fixed-picker-item', root).forEach(function (button) {
        button.addEventListener('click', function () {
          var defaults = {
            tipo: 'Gasto fijo',
            motivo: button.getAttribute('data-fixed-name') || 'Gasto fijo',
            monto: button.getAttribute('data-fixed-amount') || '',
            idRelacionado: fixedExpenseOptionValue(button.getAttribute('data-fixed-index') || 0),
            categoria: 'Gasto fijo',
            descripcion: 'Gasto fijo'
          };
          closeModal();
          openMovementForm('Gasto', null, defaults);
        });
      });
    });
  }

  function defaultDateForActiveMonth(activeMonth) {
    var month = String(activeMonth || utils.currentMonth()).slice(0, 7);
    var today = utils.toInputDate();
    if (today.slice(0, 7) === month) {
      return today;
    }
    return month + '-01';
  }

  function categoryOptions(config) {
    var seen = {};
    var list = Array.isArray((config || {}).categorias) ? (config || {}).categorias : [];
    var result = list.map(function (item) {
      return String(item || '').trim();
    }).filter(function (item) {
      var key = isWishlistCategory(item) ? 'wishlist' : item.toLowerCase();
      if (!item || seen[key]) {
        return false;
      }
      seen[key] = true;
      return true;
    });

    ['Ahorros', 'Metas', 'Wishlist', 'Otros'].forEach(function (item) {
      var key = isWishlistCategory(item) ? 'wishlist' : item.toLowerCase();
      if (!seen[key]) {
        seen[key] = true;
        result.push(item);
      }
    });

    return (result.length ? result : ['Otros']).map(function (item) {
      if (isWishlistCategory(item)) {
        return { value: 'Wishlist', label: 'Cosas que quiero' };
      }
      return item;
    });
  }

  function isWishlistCategory(value) {
    var text = String(value || '').toLowerCase();
    return text === 'wishlist' || text === 'cosas que quiero' || text === 'cosa que quiero';
  }

  function relatedMode(type, category) {
    if (type === 'Gasto fijo' || String(category || '').toLowerCase() === 'gasto fijo') {
      return 'fijo';
    }
    if (/ahorro/i.test(type)) {
      return 'ahorro';
    }
    if (/meta/i.test(type)) {
      return 'meta';
    }
    if (/wishlist/i.test(type) || (type === 'Gasto' && isWishlistCategory(category))) {
      return 'wishlist';
    }
    return '';
  }

  function relatedSelectOptions(data, mode) {
    var blank = [{ value: '', label: relatedBlankLabel(mode) }];
    if (mode === 'ahorro') {
      return blank.concat((data.ahorrosFuturo || []).map(function (item) {
        return { value: item.id, label: item.titulo };
      }));
    }
    if (mode === 'meta') {
      return blank.concat((data.metas || []).map(function (item) {
        return { value: item.id, label: item.titulo };
      }));
    }
    if (mode === 'wishlist') {
      return blank.concat((data.wishlist || []).map(function (item) {
        return { value: item.id, label: item.titulo };
      }));
    }
    if (mode === 'fijo') {
      return blank.concat(fixedExpenseItems(data).map(function (item, index) {
        return { value: fixedExpenseOptionValue(index), label: utils.fixedExpenseName(item) || 'Gasto fijo' };
      }));
    }
    return blank;
  }

  function relatedBlankLabel(mode) {
    if (mode === 'ahorro') {
      return 'Elegir ahorro';
    }
    if (mode === 'meta') {
      return 'Elegir meta';
    }
    if (mode === 'wishlist') {
      return 'Elegir cosa que quiero';
    }
    if (mode === 'fijo') {
      return 'Elegir gasto fijo';
    }
    return 'Sin seleccion';
  }

  function relatedFieldLabel(mode) {
    if (mode === 'ahorro') {
      return 'Ahorro';
    }
    if (mode === 'meta') {
      return 'Meta';
    }
    if (mode === 'wishlist') {
      return 'Cosa que quiero';
    }
    if (mode === 'fijo') {
      return 'Gasto fijo';
    }
    return 'Seleccionar';
  }

  function updateRelatedOptions(data, typeSelect, categorySelect, relatedSelect, selectedValue, fallbackLabel) {
    var mode = relatedMode(typeSelect.value, categorySelect.value);
    var options = relatedSelectOptions(data, mode);
    if (mode && selectedValue && !options.some(function (option) {
      return String(option.value) === String(selectedValue);
    })) {
      options.push({
        value: selectedValue,
        label: fallbackLabel || 'Seleccion guardada'
      });
    }
    relatedSelect.innerHTML = options.map(function (option) {
      var selected = String(option.value) === String(selectedValue || '') ? ' selected' : '';
      return '<option value="' + utils.escapeHtml(option.value) + '"' + selected + '>' + utils.escapeHtml(option.label) + '</option>';
    }).join('');
  }

  function updateRelatedVisibility(typeSelect, categorySelect, relatedSelect) {
    var mode = relatedMode(typeSelect.value, categorySelect.value);
    var needsRelated = Boolean(mode);
    var fieldBox = relatedSelect.closest('.field');
    var label = fieldBox && utils.qs('span', fieldBox);
    if (label) {
      label.textContent = relatedFieldLabel(mode);
    }
    if (fieldBox) {
      fieldBox.hidden = !needsRelated;
    }
    relatedSelect.required = needsRelated;
  }

  function updateMotiveVisibility(typeSelect, relatedSelect, motiveInput) {
    if (!motiveInput) {
      return;
    }
    var isWishlistPurchase = typeSelect && typeSelect.value === 'Compra de wishlist';
    var isFixedExpense = typeSelect && typeSelect.value === 'Gasto fijo';
    var fieldBox = motiveInput.closest('.field');
    if (fieldBox) {
      fieldBox.hidden = isWishlistPurchase || isFixedExpense;
    }
    motiveInput.required = !(isWishlistPurchase || isFixedExpense);
    if (isWishlistPurchase) {
      motiveInput.value = selectedRelatedLabel(relatedSelect) || motiveInput.value || 'Compra cosa que quiero';
    }
    if (isFixedExpense) {
      motiveInput.value = selectedRelatedLabel(relatedSelect) || motiveInput.value || 'Gasto fijo';
    }
  }

  function normalizeRelatedMovementPayload(payload, relatedSelect, movement) {
    if (!payload) {
      return;
    }
    if (payload.tipo === 'Compra de wishlist') {
      payload.motivo = selectedRelatedLabel(relatedSelect)
        || payload.motivo
        || (movement || {}).motivo
        || 'Compra cosa que quiero';
    }
    if (payload.tipo === 'Gasto fijo') {
      payload.motivo = selectedRelatedLabel(relatedSelect)
        || payload.motivo
        || (movement || {}).motivo
        || 'Gasto fijo';
      payload.descripcion = 'Gasto fijo';
      payload.tipo = 'Gasto';
      payload.tipoRelacionado = '';
    }
  }

  function autocompleteRelatedAmount(data, typeSelect, relatedSelect, amountInput, motiveInput) {
    if (!amountInput || !typeSelect) {
      return;
    }
    var type = typeSelect.value;
    var item = null;
    var amount = 0;

    setAmountLocked(amountInput, type === 'Gasto fijo');

    if (type === 'Compra de wishlist') {
      item = findById((data || {}).wishlist || [], relatedSelect && relatedSelect.value);
      amount = utils.normalizeAmount(item && item.costoAproximado);
    }
    if (type === 'Aporte a ahorro') {
      item = findById((data || {}).ahorrosFuturo || [], relatedSelect && relatedSelect.value);
      amount = utils.normalizeAmount(item && item.montoMensual);
      autofillMotiveIfEmpty(motiveInput, item && item.titulo);
    }
    if (type === 'Aporte a meta') {
      item = findById((data || {}).metas || [], relatedSelect && relatedSelect.value);
      amount = utils.normalizeAmount(item && item.montoMensual);
      autofillMotiveIfEmpty(motiveInput, item && item.titulo);
    }
    if (type === 'Gasto fijo') {
      item = fixedExpenseByValue(data, relatedSelect && relatedSelect.value);
      amount = utils.fixedExpenseAmount(item);
      if (motiveInput) {
        motiveInput.value = selectedRelatedLabel(relatedSelect) || utils.fixedExpenseName(item) || 'Gasto fijo';
      }
      if (!item) {
        amountInput.value = '';
        return;
      }
    }
    if (amount > 0) {
      amountInput.value = amount;
    }
  }

  function setAmountLocked(amountInput, locked) {
    if (!amountInput) {
      return;
    }
    amountInput.readOnly = Boolean(locked);
    amountInput.classList.toggle('is-readonly', Boolean(locked));
    if (locked) {
      amountInput.setAttribute('aria-readonly', 'true');
      amountInput.title = 'Este monto se cambia desde Configuracion.';
    } else {
      amountInput.removeAttribute('aria-readonly');
      amountInput.removeAttribute('title');
    }
  }

  function autofillMotiveIfEmpty(motiveInput, value) {
    if (!motiveInput || !value || String(motiveInput.value || '').trim()) {
      return;
    }
    motiveInput.value = value;
  }

  function fixedExpenseItems(data) {
    var config = (data || {}).config || {};
    return utils.normalizeFixedExpenses(config.gastosFijos || [], config.sueldoMensual || 0);
  }

  function fixedExpenseOptionValue(index) {
    return 'fixed-' + String(index || 0);
  }

  function fixedExpenseByValue(data, value) {
    var match = /^fixed-(\d+)$/.exec(String(value || ''));
    var index = match ? Number(match[1]) : -1;
    if (index < 0) {
      return null;
    }
    return fixedExpenseItems(data)[index] || null;
  }

  function fixedExpenseValueForMovement(data, movement) {
    var items = fixedExpenseItems(data);
    var name = normalizeCompareText((movement || {}).motivo || (movement || {}).categoria);
    var amount = utils.normalizeAmount((movement || {}).monto);
    for (var index = 0; index < items.length; index += 1) {
      if (normalizeCompareText(utils.fixedExpenseName(items[index])) === name
        && utils.fixedExpenseAmount(items[index]) === amount) {
        return fixedExpenseOptionValue(index);
      }
    }
    for (var fallback = 0; fallback < items.length; fallback += 1) {
      if (normalizeCompareText(utils.fixedExpenseName(items[fallback])) === name) {
        return fixedExpenseOptionValue(fallback);
      }
    }
    return '';
  }

  function normalizeCompareText(value) {
    return String(value || '').trim().toLowerCase();
  }

  function findById(items, id) {
    var value = String(id || '');
    if (!value) {
      return null;
    }
    for (var index = 0; index < items.length; index += 1) {
      if (String(items[index].id || '') === value) {
        return items[index];
      }
    }
    return null;
  }

  function selectedRelatedLabel(relatedSelect) {
    if (!relatedSelect || relatedSelect.selectedIndex < 0) {
      return '';
    }
    var option = relatedSelect.options[relatedSelect.selectedIndex];
    if (!option || !option.value) {
      return '';
    }
    return String(option.textContent || option.innerText || '').trim();
  }

  function openFutureSavingForm(existing) {
    var item = existing || {};
    var prefs = futureAccumulatedPrefs(item, existing);
    var html = [
      '<form class="lcd-form" id="future-form" data-close-on-submit="true">',
      '<p class="form-error" hidden></p>',
      field('Titulo', 'titulo', 'text', item.titulo || '', 'required maxlength="100"'),
      field('Monto mensual', 'montoMensual', 'number', item.montoMensual || '', 'required min="0" step="1" inputmode="numeric"'),
      futureAccumulatedControl(prefs),
      textarea('Descripcion', 'descripcion', item.descripcion || '', 'maxlength="500" rows="3"'),
      formActions(existing ? 'Actualizar' : 'Guardar'),
      '</form>'
    ].join('');
    openModal('AHORRO FUTURO', html, function (root) {
      bindFutureAccumulatedControl(root);
      bindForm(root, '#future-form', function (form) {
        var payload = utils.formDataToObject(form);
        var showAccumulated = Boolean(utils.qs('[name="mostrarAcumulado"]', form).checked);
        payload.montoMensual = utils.normalizeAmount(payload.montoMensual);
        payload.montoAcumulado = utils.normalizeAmount(payload.montoAcumulado);
        payload.mostrarAcumulado = showAccumulated;
        if (existing) {
          payload.id = existing.id;
          existing.montoAcumulado = payload.montoAcumulado;
          existing.mostrarAcumulado = showAccumulated;
          saveFuturePrefs(payload.id, payload);
        }
        return window.FinanzasApp.mutate(existing ? 'updateFutureSaving' : 'createFutureSaving', payload)
          .then(function (result) {
            var id = (result && result.id) || payload.id;
            saveFuturePrefs(id, payload);
            if (window.FinanzasState) {
              window.FinanzasState.setState({});
            }
            closeModal();
          });
      });
    }, 'ticket-form-modal future-saving-modal');
  }

  function futureAccumulatedPrefs(item, existing) {
    var source = item || {};
    var saved = existing ? readSavedFuturePrefs(source.id) : null;
    var fallbackAmount = utils.normalizeAmount(source.montoAcumulado || 0);
    if (existing && saved) {
      return {
        mostrarAcumulado: futureBoolean(saved.mostrarAcumulado, false),
        montoAcumulado: utils.normalizeAmount(saved.montoAcumulado)
      };
    }
    return {
      mostrarAcumulado: existing ? futureBoolean(source.mostrarAcumulado, fallbackAmount > 0) : false,
      montoAcumulado: fallbackAmount
    };
  }

  function readSavedFuturePrefs(id) {
    if (!id) {
      return null;
    }
    try {
      return (JSON.parse(localStorage.getItem(FUTURE_PREFS_KEY) || '{}') || {})[String(id)] || null;
    } catch (error) {
      return null;
    }
  }

  function futureBoolean(value, fallback) {
    if (value === undefined || value === null || value === '') {
      return Boolean(fallback);
    }
    return !(value === false || value === 'false' || value === '0' || value === 0);
  }

  function futureAccumulatedControl(prefs) {
    var show = Boolean((prefs || {}).mostrarAcumulado);
    var amount = utils.normalizeAmount((prefs || {}).montoAcumulado || 0);
    return [
      '<div class="future-accumulated-control" data-future-accumulated-control>',
      '<label class="future-accumulated-toggle">',
      '<input name="mostrarAcumulado" type="checkbox" value="true" data-future-accumulated-toggle' + (show ? ' checked' : '') + '>',
      '<span class="future-accumulated-toggle-copy"><strong>Monto acumulado</strong><small>Mostrar en tarjeta</small></span>',
      '<b class="future-accumulated-switch" aria-hidden="true"><span>NO</span><span>SI</span></b>',
      '</label>',
      '<label class="field future-accumulated-amount" data-future-accumulated-amount' + (show ? '' : ' hidden') + '>',
      '<span>Valor acumulado</span>',
      '<input name="montoAcumulado" type="number" min="0" step="1" inputmode="numeric" value="' + utils.escapeHtml(amount || 0) + '">',
      '</label>',
      '</div>'
    ].join('');
  }

  function bindFutureAccumulatedControl(root) {
    var toggle = utils.qs('[data-future-accumulated-toggle]', root);
    var amountField = utils.qs('[data-future-accumulated-amount]', root);
    if (!toggle || !amountField) {
      return;
    }
    function sync() {
      amountField.hidden = !toggle.checked;
    }
    toggle.addEventListener('change', sync);
    sync();
  }

  function saveFuturePrefs(id, payload) {
    if (!id || !window.FinanzasFuturePrefs) {
      return;
    }
    window.FinanzasFuturePrefs.save(id, {
      mostrarAcumulado: payload.mostrarAcumulado,
      montoAcumulado: payload.montoAcumulado
    });
  }

  function openGoalForm(existing) {
    var item = existing || {};
    var html = [
      '<form class="lcd-form" id="goal-form" data-close-on-submit="true">',
      '<p class="form-error" hidden></p>',
      field('Titulo', 'titulo', 'text', item.titulo || '', 'required maxlength="100"'),
      field('Monto mensual', 'montoMensual', 'number', item.montoMensual || '', 'required min="0" step="1" inputmode="numeric"'),
      field('Monto objetivo', 'montoObjetivo', 'number', item.montoObjetivo || '', 'required min="1" step="1" inputmode="numeric"'),
      textarea('Descripcion', 'descripcion', item.descripcion || '', 'maxlength="500" rows="3"'),
      '<label class="field"><span>Fotografia</span><input name="foto" type="file" accept="image/*" data-photo-input></label>',
      '<canvas class="lcd-photo-preview" data-photo-preview width="216" height="162"></canvas>',
      formActions(existing ? 'Actualizar' : 'Guardar'),
      '</form>'
    ].join('');
    openModal('META', html, function (root) {
      bindPhotoPreview(root);
      bindForm(root, '#goal-form', function (form) {
        return buildImagePayload(form).then(function (imagePayload) {
          var payload = utils.formDataToObject(form);
          delete payload.foto;
          payload.montoMensual = utils.normalizeAmount(payload.montoMensual);
          payload.montoObjetivo = utils.normalizeAmount(payload.montoObjetivo);
          Object.keys(imagePayload).forEach(function (key) {
            payload[key] = imagePayload[key];
          });
          if (existing) {
            payload.id = existing.id;
          }
          return window.FinanzasApp.mutate(existing ? 'updateGoal' : 'createGoal', payload);
        }).then(closeModal);
      });
    }, 'ticket-form-modal goal-form-modal');
  }

  function openWishlistForm(existing) {
    var item = existing || {};
    var html = [
      '<form class="lcd-form" id="wish-form" data-close-on-submit="true">',
      '<p class="form-error" hidden></p>',
      field('Titulo', 'titulo', 'text', item.titulo || '', 'required maxlength="100"'),
      field('Costo aproximado', 'costoAproximado', 'number', item.costoAproximado || '', 'required min="1" step="1" inputmode="numeric"'),
      '<label class="field"><span>Fotografia</span><input name="foto" type="file" accept="image/*" data-photo-input></label>',
      '<canvas class="lcd-photo-preview" data-photo-preview width="216" height="162"></canvas>',
      formActions(existing ? 'Actualizar' : 'Guardar'),
      '</form>'
    ].join('');
    openModal('QUIERO', html, function (root) {
      bindPhotoPreview(root);
      bindForm(root, '#wish-form', function (form) {
        return buildImagePayload(form).then(function (imagePayload) {
          var payload = utils.formDataToObject(form);
          delete payload.foto;
          payload.descripcion = '';
          payload.costoAproximado = utils.normalizeAmount(payload.costoAproximado);
          Object.keys(imagePayload).forEach(function (key) {
            payload[key] = imagePayload[key];
          });
          if (existing) {
            payload.id = existing.id;
          }
          return window.FinanzasApp.mutate(existing ? 'updateWishlistItem' : 'createWishlistItem', payload);
        }).then(closeModal);
      });
    }, 'ticket-form-modal wish-form-modal');
  }

  function bindPhotoPreview(root) {
    var input = utils.qs('[data-photo-input]', root);
    var canvas = utils.qs('[data-photo-preview]', root);
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file) {
        return;
      }
      window.FinanzasImages.fileToDataUrl(file)
        .then(function (dataUrl) {
          return window.FinanzasImages.renderDataUrlToCanvas(dataUrl, canvas);
        });
    });
  }

  function buildImagePayload(form) {
    var input = utils.qs('[data-photo-input]', form);
    var file = input && input.files && input.files[0];
    if (!file) {
      return Promise.resolve({});
    }
    return window.FinanzasImages.fileToDataUrl(file).then(function (dataUrl) {
      return {
        imageBase64: dataUrl,
        imageFileName: file.name,
        imageMimeType: file.type || 'image/png'
      };
    });
  }

  window.FinanzasForms = {
    actionMenu: actionMenu,
    syncActionMenuForView: syncActionMenuForView,
    openMovementForm: openMovementForm,
    openFixedExpenseForm: openFixedExpenseForm,
    openFixedExpensePicker: openFixedExpensePicker,
    openFutureSavingForm: openFutureSavingForm,
    openGoalForm: openGoalForm,
    openWishlistForm: openWishlistForm,
    closeModal: closeModal
  };
}());
