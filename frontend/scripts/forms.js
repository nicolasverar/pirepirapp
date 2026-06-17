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
      '<button class="menu-item" type="button" data-form-action="expense">Registrar gasto</button>',
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

  function openMovementForm(defaultType, existing) {
    var data = window.FinanzasState.getState().data;
    var config = data.config || {};
    var categories = categoryOptions(config);
    var movement = existing || {};
    var defaultDate = movement.fecha || defaultDateForActiveMonth(config.mesActual);
    var isIncome = defaultType === 'Ingreso' || movement.tipo === 'Ingreso';
    var defaultCategory = movement.categoria || (isIncome ? 'Otros' : categories[0]);
    var typeOptions = isIncome
      ? [{ value: 'Ingreso', label: 'Ingreso' }]
      : [
        { value: 'Gasto', label: 'Gasto' },
        { value: 'Aporte a ahorro', label: 'Aporte a ahorro' },
        { value: 'Aporte a meta', label: 'Aporte a meta' },
        { value: 'Compra de wishlist', label: 'Compra cosa que quiero' }
      ];

    var relatedOptions = relatedSelectOptions(data, movement.tipo || defaultType);
    var html = [
      '<form class="lcd-form" id="movement-form" data-close-on-submit="true">',
      '<p class="form-error" hidden></p>',
      select('Tipo', 'tipo', typeOptions, movement.tipo || defaultType, 'data-movement-type'),
      field('Motivo', 'motivo', 'text', movement.motivo || '', 'required maxlength="120" autocomplete="off"'),
      field('Monto', 'monto', 'number', movement.monto || '', 'required min="1" step="1" inputmode="numeric"'),
      select('Categoria', 'categoria', categories, defaultCategory),
      select('Destino', 'idRelacionado', relatedOptions, movement.idRelacionado || '', 'data-related-select'),
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
      updateRelatedVisibility(typeSelect, relatedSelect);
      typeSelect.addEventListener('change', function () {
        relatedSelect.innerHTML = relatedSelectOptions(data, typeSelect.value).map(function (option) {
          return '<option value="' + utils.escapeHtml(option.value) + '">' + utils.escapeHtml(option.label) + '</option>';
        }).join('');
        updateRelatedVisibility(typeSelect, relatedSelect);
      });

      bindForm(root, '#movement-form', function (form) {
        var payload = utils.formDataToObject(form);
        payload.monto = utils.normalizeAmount(payload.monto);
        payload.hora = payload.hora.length === 5 ? payload.hora + ':00' : payload.hora;
        if (!payload.idRelacionado) {
          delete payload.idRelacionado;
        }
        if (existing) {
          payload.id = existing.id;
        }
        payload.mes = (config.mesActual || utils.currentMonth()).slice(0, 7);
        return window.FinanzasApp.mutate(existing ? 'updateMovement' : 'createMovement', payload)
          .then(closeModal);
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
      var key = item.toLowerCase();
      if (!item || seen[key]) {
        return false;
      }
      seen[key] = true;
      return true;
    });

    ['Ahorros', 'Metas', 'Wishlist', 'Otros'].forEach(function (item) {
      var key = item.toLowerCase();
      if (!seen[key]) {
        seen[key] = true;
        result.push(item);
      }
    });

    return result.length ? result : ['Otros'];
  }

  function relatedSelectOptions(data, type) {
    var normalized = String(type || '').toLowerCase();
    var blank = [{ value: '', label: relatedBlankLabel(type) }];
    if (normalized.indexOf('ahorro') !== -1) {
      return blank.concat((data.ahorrosFuturo || []).map(function (item) {
        return { value: item.id, label: item.titulo };
      }));
    }
    if (normalized.indexOf('meta') !== -1) {
      return blank.concat((data.metas || []).map(function (item) {
        return { value: item.id, label: item.titulo };
      }));
    }
    if (normalized.indexOf('wishlist') !== -1) {
      return blank.concat((data.wishlist || []).map(function (item) {
        return { value: item.id, label: item.titulo };
      }));
    }
    return blank;
  }

  function relatedBlankLabel(type) {
    var normalized = String(type || '').toLowerCase();
    if (normalized.indexOf('ahorro') !== -1) {
      return 'Elegir ahorro';
    }
    if (normalized.indexOf('meta') !== -1) {
      return 'Elegir meta';
    }
    if (normalized.indexOf('wishlist') !== -1) {
      return 'Elegir cosa';
    }
    return 'Sin destino';
  }

  function relatedFieldLabel(type) {
    var normalized = String(type || '').toLowerCase();
    if (normalized.indexOf('ahorro') !== -1) {
      return 'Ahorro destino';
    }
    if (normalized.indexOf('meta') !== -1) {
      return 'Meta destino';
    }
    if (normalized.indexOf('wishlist') !== -1) {
      return 'Cosa que quiero';
    }
    return 'Destino';
  }

  function updateRelatedVisibility(typeSelect, relatedSelect) {
    var needsRelated = /ahorro|meta|wishlist/i.test(typeSelect.value);
    var fieldBox = relatedSelect.closest('.field');
    var label = fieldBox && utils.qs('span', fieldBox);
    if (label) {
      label.textContent = relatedFieldLabel(typeSelect.value);
    }
    if (fieldBox) {
      fieldBox.hidden = !needsRelated;
    }
    relatedSelect.required = needsRelated;
  }

  function openFutureSavingForm(existing) {
    var item = existing || {};
    var html = [
      '<form class="lcd-form" id="future-form" data-close-on-submit="true">',
      '<p class="form-error" hidden></p>',
      field('Titulo', 'titulo', 'text', item.titulo || '', 'required maxlength="100"'),
      field('Monto mensual', 'montoMensual', 'number', item.montoMensual || '', 'required min="0" step="1" inputmode="numeric"'),
      textarea('Descripcion', 'descripcion', item.descripcion || '', 'maxlength="500" rows="3"'),
      formActions(existing ? 'Actualizar' : 'Guardar'),
      '</form>'
    ].join('');
    openModal('AHORRO FUTURO', html, function (root) {
      bindForm(root, '#future-form', function (form) {
        var payload = utils.formDataToObject(form);
        payload.montoMensual = utils.normalizeAmount(payload.montoMensual);
        if (existing) {
          payload.id = existing.id;
        }
        return window.FinanzasApp.mutate(existing ? 'updateFutureSaving' : 'createFutureSaving', payload)
          .then(closeModal);
      });
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

  function convertWishlist(id) {
    openModal('CONVERTIR', [
      '<form class="lcd-form" id="convert-form" data-close-on-submit="true">',
      '<p class="form-error" hidden></p>',
      field('Monto mensual', 'montoMensual', 'number', '', 'required min="0" step="1" inputmode="numeric"'),
      textarea('Comentario para la meta', 'descripcion', '', 'maxlength="500" rows="3"'),
      formActions('Convertir'),
      '</form>'
    ].join(''), function (root) {
      bindForm(root, '#convert-form', function (form) {
        var payload = utils.formDataToObject(form);
        payload.wishlistId = id;
        payload.montoMensual = utils.normalizeAmount(payload.montoMensual);
        return window.FinanzasApp.mutate('convertWishlistToGoal', payload).then(closeModal);
      });
    });
  }

  window.FinanzasForms = {
    actionMenu: actionMenu,
    openAccessForm: openAccessForm,
    openMovementForm: openMovementForm,
    openFutureSavingForm: openFutureSavingForm,
    openGoalForm: openGoalForm,
    openWishlistForm: openWishlistForm,
    convertWishlist: convertWishlist,
    closeModal: closeModal
  };
}());
