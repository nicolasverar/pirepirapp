(function () {
  'use strict';

  var labels = {
    resumen: 'RESUMEN',
    gastos: 'GASTOS',
    metas: 'METAS',
    configuracion: 'CONFIG'
  };

  function go(view) {
    if (!labels[view]) {
      view = 'resumen';
    }
    window.FinanzasState.setView(view);
    window.location.hash = view;
  }

  function currentLabel() {
    return labels[window.FinanzasState.getState().currentView] || labels.resumen;
  }

  function bind() {
    window.FinanzasUtils.qsa('[data-view]').forEach(function (button) {
      button.addEventListener('click', function () {
        go(button.getAttribute('data-view'));
      });
    });

    window.addEventListener('hashchange', function () {
      var view = window.location.hash.replace('#', '');
      if (view) {
        go(view);
      }
    });

    var initial = window.location.hash.replace('#', '');
    if (initial) {
      go(initial);
    }
  }

  function syncNav() {
    var current = window.FinanzasState.getState().currentView;
    window.FinanzasUtils.qsa('[data-view]').forEach(function (button) {
      button.classList.toggle('is-active', button.getAttribute('data-view') === current);
    });
    syncActionKey(current);
  }

  function syncActionKey(current) {
    var actionKey = window.FinanzasUtils.qs('#action-key');
    var actionKeyLabel = window.FinanzasUtils.qs('#action-key .action-key-label');
    var keyZone = window.FinanzasUtils.qs('.key-zone');
    var enabled = current === 'resumen' || current === 'metas' || current === 'gastos' || current === 'configuracion';
    var label = current === 'gastos' ? 'FILTRAR' : (current === 'configuracion' ? 'ACTUALIZAR' : 'AGREGAR');
    if (actionKey) {
      actionKey.hidden = !enabled;
      actionKey.disabled = !enabled;
      actionKey.setAttribute('aria-hidden', enabled ? 'false' : 'true');
      actionKey.setAttribute('aria-label', label);
    }
    if (actionKeyLabel) {
      actionKeyLabel.textContent = label;
    }
    if (keyZone) {
      keyZone.classList.toggle('is-action-hidden', !enabled);
    }
  }

  window.FinanzasRouter = {
    bind: bind,
    go: go,
    currentLabel: currentLabel,
    syncNav: syncNav
  };
}());
