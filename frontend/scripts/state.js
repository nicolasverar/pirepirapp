(function () {
  'use strict';

  var listeners = [];
  var state = {
    currentView: 'resumen',
    wishlistSort: 'asc',
    movementFilter: 'all',
    syncStatus: 'Sin iniciar',
    loading: false,
    error: '',
    data: {
      config: {
        sueldoMensual: 0,
        moneda: 'PYG',
        mesActual: window.FinanzasUtils.currentMonth(),
        categorias: ['Alimentacion', 'Transporte', 'Servicios', 'Salud', 'Educacion', 'Hogar', 'Ocio', 'Superfluos', 'Ahorros', 'Metas', 'Wishlist', 'Otros'],
        gastosFijos: [
          { categoria: 'Alimentacion', monto: 0 },
          { categoria: 'Transporte', monto: 0 }
        ]
      },
      resumen: null,
      movimientos: { movimientos: [] },
      ahorrosFuturo: [],
      metas: [],
      wishlist: []
    }
  };

  function getState() {
    return state;
  }

  function setState(patch) {
    Object.keys(patch || {}).forEach(function (key) {
      state[key] = patch[key];
    });
    notify();
  }

  function setData(data) {
    var next = data || {};
    state.data = {
      config: next.config || state.data.config,
      resumen: next.resumen || state.data.resumen,
      movimientos: next.movimientos || state.data.movimientos,
      ahorrosFuturo: next.ahorrosFuturo || state.data.ahorrosFuturo,
      metas: next.metas || state.data.metas,
      wishlist: next.wishlist || state.data.wishlist
    };
    notify();
  }

  function subscribe(listener) {
    listeners.push(listener);
    return function () {
      listeners = listeners.filter(function (item) {
        return item !== listener;
      });
    };
  }

  function notify() {
    listeners.forEach(function (listener) {
      listener(state);
    });
  }

  function setView(view) {
    state.currentView = view;
    notify();
  }

  window.FinanzasState = {
    getState: getState,
    setState: setState,
    setData: setData,
    subscribe: subscribe,
    setView: setView
  };
}());
