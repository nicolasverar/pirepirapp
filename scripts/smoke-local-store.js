/* eslint-env node */
'use strict';

const assert = require('assert');

global.window = global;

function createStorage() {
  const data = {};
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    },
    removeItem(key) {
      delete data[key];
    },
    clear() {
      Object.keys(data).forEach((key) => delete data[key]);
    },
    dump() {
      return Object.assign({}, data);
    }
  };
}

global.localStorage = createStorage();
global.sessionStorage = createStorage();
global.indexedDB = null;

require('../frontend/scripts/utils.js');
require('../frontend/scripts/local-store.js');
require('../frontend/scripts/api.js');

async function run() {
  assert.strictEqual(window.FinanzasApi.isLocalMode(), true, 'API debe iniciar en modo local');
  assert.strictEqual(window.FinanzasApi.hasBackend(), true, 'El backend local debe estar disponible');
  assert.strictEqual(window.FinanzasApi.getAuthToken(), 'local-device', 'El modo local no debe pedir token real');

  window.FinanzasApi.configureConnection('https://example.test/exec', 'token', false);
  assert.strictEqual(window.FinanzasApi.isLocalMode(), false, 'Debe poder cambiar a modo remoto legado');
  window.FinanzasApi.useLocalMode();
  assert.strictEqual(window.FinanzasApi.isLocalMode(), true, 'Debe poder volver a modo local');
  assert.strictEqual(window.FinanzasApi.getApiUrl(), '', 'Volver a local limpia la URL remota');

  let bootstrap = await window.FinanzasApi.request('bootstrap', {});
  assert.ok(bootstrap.config, 'bootstrap debe traer config');
  assert.ok(bootstrap.movimientos, 'bootstrap debe traer movimientos');

  await window.FinanzasApi.request('updateConfig', {
    sueldoMensual: 5000000,
    mesActual: '2026-05',
    categorias: ['Alimentacion', 'Transporte', 'Wishlist', 'Otros'],
    gastosFijos: [
      { nombre: 'Alquiler', monto: 1000000 },
      { categoria: 'Internet', monto: 150000 }
    ]
  });

  const fixed = await window.FinanzasApi.request('syncFixedExpenses', {});
  assert.strictEqual(fixed.mes, '2026-05', 'Gastos fijos deben usar mesActual configurado');
  assert.strictEqual(fixed.movimientosCreados.length, 2, 'Debe crear dos gastos fijos');

  const saving = await window.FinanzasApi.request('createFutureSaving', {
    titulo: 'Fondo emergencia',
    descripcion: 'Reserva',
    montoMensual: 200000,
    montoAcumulado: 100000
  });

  const goal = await window.FinanzasApi.request('createGoal', {
    titulo: 'Notebook',
    descripcion: 'Trabajo',
    montoMensual: 300000,
    montoObjetivo: 3000000,
    imageBase64: 'data:image/png;base64,goal'
  });

  const wish = await window.FinanzasApi.request('createWishlistItem', {
    titulo: 'Auriculares',
    costoAproximado: 350000,
    imageBase64: 'data:image/png;base64,wish'
  });

  const photo = await window.FinanzasApi.request('getPhoto', { fileId: wish.imageDriveId });
  assert.strictEqual(photo.dataUrl, 'data:image/png;base64,wish', 'La foto local debe recuperarse por ID');

  await window.FinanzasApi.request('createMovement', {
    tipo: 'Gasto',
    motivo: 'Cafe',
    categoria: 'Alimentacion',
    monto: 50000,
    fecha: '2026-05-10',
    hora: '10:30:00'
  });

  await window.FinanzasApi.request('createMovement', {
    tipo: 'Ingreso',
    motivo: 'Bonus',
    categoria: 'Ingreso',
    monto: 200000,
    fecha: '2026-05-11',
    hora: '09:00:00'
  });

  await window.FinanzasApi.request('createMovement', {
    tipo: 'Aporte a ahorro',
    motivo: saving.titulo,
    categoria: 'Ahorros',
    monto: 250000,
    idRelacionado: saving.id,
    fecha: '2026-05-12',
    hora: '12:00:00'
  });

  await window.FinanzasApi.request('createMovement', {
    tipo: 'Aporte a meta',
    motivo: goal.titulo,
    categoria: 'Metas',
    monto: 400000,
    idRelacionado: goal.id,
    fecha: '2026-05-13',
    hora: '12:00:00'
  });

  await window.FinanzasApi.request('createMovement', {
    tipo: 'Compra de wishlist',
    motivo: wish.titulo,
    categoria: 'Wishlist',
    monto: 350000,
    idRelacionado: wish.id,
    fecha: '2026-05-14',
    hora: '18:00:00'
  });

  const secondWish = await window.FinanzasApi.request('createWishlistItem', {
    titulo: 'Mochila',
    costoAproximado: 180000
  });
  const converted = await window.FinanzasApi.request('convertWishlistToGoal', { wishlistId: secondWish.id });
  assert.ok(converted.goal.id, 'Convertir wishlist debe crear meta');
  assert.strictEqual(converted.wishlistItem.estado, 'Convertido', 'Wishlist convertida debe cambiar estado');

  bootstrap = await window.FinanzasApi.request('bootstrap', {});
  const summary = bootstrap.resumen;

  assert.strictEqual(summary.mes, '2026-05');
  assert.strictEqual(summary.totalIngresos, 5200000);
  assert.strictEqual(summary.gastosFijosConfigurados, 1150000);
  assert.strictEqual(summary.gastosFijos, 1150000);
  assert.strictEqual(summary.gastosVariables, 50000);
  assert.strictEqual(summary.comprasWishlist, 350000);
  assert.strictEqual(summary.totalGastado, 400000);
  assert.strictEqual(summary.aportesAhorro, 250000);
  assert.strictEqual(summary.aportesMeta, 400000);
  assert.strictEqual(summary.totalApartado, 650000);
  assert.strictEqual(summary.disponible, 3000000);
  assert.strictEqual(summary.cantidadMovimientos, 7);

  const refreshedSaving = bootstrap.ahorrosFuturo.find((item) => item.id === saving.id);
  assert.strictEqual(refreshedSaving.montoAcumulado, 350000, 'Aporte debe acumular ahorro');

  const refreshedGoal = bootstrap.metas.find((item) => item.id === goal.id);
  assert.strictEqual(refreshedGoal.montoAcumulado, 400000, 'Aporte debe acumular meta');
  assert.ok(refreshedGoal.porcentaje > 13 && refreshedGoal.porcentaje < 14, 'Meta debe recalcular porcentaje');

  assert.ok(!bootstrap.wishlist.some((item) => item.id === wish.id), 'Wishlist comprada no debe quedar activa');
  assert.ok(!bootstrap.wishlist.some((item) => item.id === secondWish.id), 'Wishlist convertida no debe quedar activa');

  const state = await window.FinanzasLocalStore.loadState();
  assert.strictEqual(state.movimientos.length, 7, 'Persistencia local debe conservar movimientos');
  assert.ok(Object.keys(state.photos).length >= 2, 'Persistencia local debe conservar fotos');

  console.log('SMOKE_LOCAL_STORE_OK');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
