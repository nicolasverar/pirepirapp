(function () {
  'use strict';

  var utils = window.FinanzasUtils;

  function openModal(title, content, afterOpen) {
    var root = utils.qs('#modal-root');
    root.hidden = false;
    root.innerHTML = [
      '<div class="modal-backdrop" data-close-modal></div>',
      '<section class="system-modal" role="dialog" aria-modal="true" aria-label="' + utils.escapeHtml(title) + '">',
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
  }

  function closeModal() {
    var root = utils.qs('#modal-root');
    root.hidden = true;
    root.innerHTML = '';
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
    if (view === 'metas') {
      openModal('NUEVO', [
        '<div class="menu-grid">',
        '<button class="menu-item" type="button" data-form-action="future">Crear ahorro para el futuro</button>',
        '<button class="menu-item" type="button" data-form-action="goal">Crear meta especifica</button>',
        '<button class="menu-item" type="button" data-form-action="wish">Agregar algo que quiero</button>',
        '</div>'
      ].join(''), bindActionMenu);
      return;
    }

    openModal('MOVIMIENTO', [
      '<div class="menu-grid">',
      '<button class="menu-item" type="button" data-form-action="expense">Gasto corriente</button>',
      '<button class="menu-item" type="button" data-form-action="income">Registrar ingreso</button>',
      '</div>'
    ].join(''), bindActionMenu);
  }

  function openAccessForm() {
    openModal('CONEXION', [
      '<form class="lcd-form" id="access-form">',
      '<p class="form-error" hidden></p>',
      '<p>Conecta esta instalacion con tu Apps Script.</p>',
      field('URL Apps Script', 'apiUrl', 'url', window.FinanzasApi.getApiUrl(), 'required inputmode="url" autocomplete="url" placeholder="https://script.google.com/macros/s/.../exec"'),
      field('Clave', 'authToken', 'password', '', 'required autocomplete="current-password"'),
      '<label class="check-field"><input name="remember" type="checkbox" value="1"><span>Recordar en este dispositivo</span></label>',
      '<div class="form-actions">',
      '<button class="lcd-button primary" type="submit">Conectar</button>',
      '</div>',
      '</form>'
    ].join(''), function (root) {
      bindForm(root, '#access-form', function (form) {
        var payload = utils.formDataToObject(form);
        window.FinanzasApi.configureConnection(payload.apiUrl, payload.authToken, payload.remember === '1');
        closeModal();
        return window.FinanzasApp.refresh();
      });
    });
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
    var typeOptions = isIncome
      ? [{ value: 'Ingreso', label: 'Ingreso' }]
      : [
        { value: 'Gasto', label: 'Gasto' },
        { value: 'Aporte a ahorro', label: 'Aporte a ahorro' },
        { value: 'Aporte a meta', label: 'Aporte a meta' },
        { value: 'Compra de wishlist', label: 'Compra cosa que quiero' }
      ];

    var relatedOptions = relatedSelectOptions(data, relatedMode(movement.tipo || defaultType, defaultCategory));
    var html = [
      '<form class="lcd-form" id="movement-form" data-close-on-submit="true">',
      '<p class="form-error" hidden></p>',
      select('Tipo', 'tipo', typeOptions, movement.tipo || defaultType, 'data-movement-type'),
      field('Motivo', 'motivo', 'text', movement.motivo || '', 'required maxlength="120" autocomplete="off"'),
      field('Monto', 'monto', 'number', movement.monto || '', 'required min="1" step="1" inputmode="numeric"'),
      select('Seleccionar', 'idRelacionado', relatedOptions, movement.idRelacionado || '', 'data-related-select'),
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
      updateRelatedOptions(data, typeSelect, { value: defaultCategory }, relatedSelect, movement.idRelacionado || '');
      updateRelatedVisibility(typeSelect, { value: defaultCategory }, relatedSelect);
      typeSelect.addEventListener('change', function () {
        var currentCategory = typeSelect.value === 'Compra de wishlist' ? 'Wishlist' : defaultCategory;
        updateRelatedOptions(data, typeSelect, { value: currentCategory }, relatedSelect, relatedSelect.value);
        updateRelatedVisibility(typeSelect, { value: currentCategory }, relatedSelect);
      });

      bindForm(root, '#movement-form', function (form) {
        var payload = utils.formDataToObject(form);
        payload.monto = utils.normalizeAmount(payload.monto);
        payload.hora = payload.hora.length === 5 ? payload.hora + ':00' : payload.hora;
        payload.categoria = categoryForMovementPayload(payload.tipo, defaultCategory, isIncome);
        if (!payload.idRelacionado) {
          delete payload.idRelacionado;
        }
        if (existing) {
          payload.id = existing.id;
        }
        return window.FinanzasApp.mutate(existing ? 'updateMovement' : 'createMovement', payload)
          .then(closeModal);
      });
    });
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
    if (isIncome || type === 'Ingreso') {
      return 'Ingreso';
    }
    return fallbackCategory || 'Otros';
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
      items.map(function (item) {
        return [
          '<button class="menu-item fixed-picker-item" type="button" data-fixed-name="' + utils.escapeHtml(utils.fixedExpenseName(item)) + '" data-fixed-amount="' + utils.escapeHtml(utils.fixedExpenseAmount(item)) + '">',
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
            tipo: 'Gasto',
            motivo: button.getAttribute('data-fixed-name') || 'Gasto fijo',
            monto: button.getAttribute('data-fixed-amount') || '',
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
    return 'Seleccionar';
  }

  function updateRelatedOptions(data, typeSelect, categorySelect, relatedSelect, selectedValue) {
    var mode = relatedMode(typeSelect.value, categorySelect.value);
    relatedSelect.innerHTML = relatedSelectOptions(data, mode).map(function (option) {
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

  function openFutureSavingForm(existing) {
    var item = existing || {};
    var prefs = window.FinanzasFuturePrefs ? window.FinanzasFuturePrefs.get(item) : {
      mostrarAcumulado: item.mostrarAcumulado !== false,
      montoAcumulado: item.montoAcumulado || 0
    };
    var html = [
      '<form class="lcd-form" id="future-form" data-close-on-submit="true">',
      '<p class="form-error" hidden></p>',
      field('Titulo', 'titulo', 'text', item.titulo || '', 'required maxlength="100"'),
      field('Monto mensual', 'montoMensual', 'number', item.montoMensual || '', 'required min="0" step="1" inputmode="numeric"'),
      field('Monto acumulado', 'montoAcumulado', 'number', prefs.montoAcumulado || 0, 'min="0" step="1" inputmode="numeric"'),
      checkbox('Mostrar acumulado', 'mostrarAcumulado', prefs.mostrarAcumulado),
      textarea('Descripcion', 'descripcion', item.descripcion || '', 'maxlength="500" rows="3"'),
      formActions(existing ? 'Actualizar' : 'Guardar'),
      '</form>'
    ].join('');
    openModal('AHORRO FUTURO', html, function (root) {
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
    });
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
    });
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
    });
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
    openAccessForm: openAccessForm,
    openMovementForm: openMovementForm,
    openFixedExpensePicker: openFixedExpensePicker,
    openFutureSavingForm: openFutureSavingForm,
    openGoalForm: openGoalForm,
    openWishlistForm: openWishlistForm,
    closeModal: closeModal
  };
}());
