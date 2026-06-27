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
    categorias: ['Alimentacion', 'Transporte', 'Disponible', 'Wishlist', 'Otros'],
    gastosFijos: [
      { nombre: 'Alquiler', monto: 1000000 },
      { categoria: 'Internet', monto: 150000 }
    ]
  });

  await window.FinanzasApi.request('createMovement', {
    tipo: 'Ingreso',
    motivo: 'Sueldo',
    categoria: 'Ingreso',
    monto: 5000000,
    fecha: '2026-04-30',
    hora: '08:00:00'
  });

  await window.FinanzasApi.request('createMovement', {
    tipo: 'Gasto',
    motivo: 'Cierre abril',
    categoria: 'Disponible',
    monto: 4000000,
    fecha: '2026-04-30',
    hora: '20:00:00'
  });

  const saving = await window.FinanzasApi.request('createFutureSaving', {
    titulo: 'Fondo emergencia',
    descripcion: 'Reserva',
    montoMensual: 250000,
    montoAcumulado: 100000
  });

  const goal = await window.FinanzasApi.request('createGoal', {
    titulo: 'Notebook',
    descripcion: 'Trabajo',
    montoMensual: 400000,
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

  const claim = await window.FinanzasApi.request('createMovement', {
    tipo: 'Ingreso',
    motivo: 'Sueldo',
    categoria: 'Ingreso',
    monto: 5000000,
    fecha: '2026-05-01',
    hora: '08:00:00',
    descripcion: 'Cobro cargado desde formulario de ingreso'
  });
  assert.strictEqual(claim.yaRegistrado, false, 'El primer ingreso de sueldo del mes debe crear movimiento');
  assert.strictEqual(claim.resumen.remanenteAnterior, 1000000, 'Debe arrastrar remanente anterior');
  assert.strictEqual(claim.resumen.sueldoCobrado, 5000000, 'Debe registrar sueldo cobrado');
  assert.strictEqual(claim.resumen.disponible, 6000000, 'Al cobrar debe sumar sueldo nuevo y remanente');
  assert.strictEqual(claim.resumen.ahorrosPlanificados, 650000, 'Ahorros planificados vienen de futuro + metas');
  assert.strictEqual(claim.resumen.superfluosPlanificados, 3200000, 'Disponible completa la particion del sueldo');
  assert.strictEqual(claim.resumen.recordatoriosPendientes.length, 4, 'Post-cobro debe recordar fijos, futuro y metas');

  const secondClaim = await window.FinanzasApi.request('createMovement', {
    tipo: 'Ingreso',
    motivo: 'Sueldo',
    categoria: 'Ingreso',
    monto: 5000000,
    fecha: '2026-05-01',
    hora: '09:00:00'
  });
  assert.strictEqual(secondClaim.yaRegistrado, true, 'Guardar sueldo dos veces el mismo mes no debe duplicarlo');

  await window.FinanzasApi.request('createMovement', {
    tipo: 'Gasto',
    motivo: 'Alquiler',
    categoria: 'Gasto fijo',
    monto: 1000000,
    fecha: '2026-05-02',
    hora: '09:00:00',
    descripcion: 'Gasto fijo'
  });

  await window.FinanzasApi.request('createMovement', {
    tipo: 'Gasto',
    motivo: 'Internet',
    categoria: 'Gasto fijo',
    monto: 150000,
    fecha: '2026-05-03',
    hora: '09:00:00',
    descripcion: 'Gasto fijo'
  });

  bootstrap = await window.FinanzasApi.request('bootstrap', {});
  assert.strictEqual(bootstrap.resumen.recordatoriosPendientes.length, 2, 'Pagar fijos debe quitarlos del panel');

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
  assert.strictEqual(summary.remanenteAnterior, 1000000);
  assert.strictEqual(summary.sueldoCobrado, 5000000);
  assert.strictEqual(summary.ingresosExtra, 200000);
  assert.strictEqual(summary.totalIngresos, 6200000);
  assert.strictEqual(summary.gastosFijosConfigurados, 1150000);
  assert.strictEqual(summary.gastosFijos, 1150000);
  assert.strictEqual(summary.gastosVariables, 50000);
  assert.strictEqual(summary.comprasWishlist, 350000);
  assert.strictEqual(summary.totalGastado, 400000);
  assert.strictEqual(summary.salidasTotales, 2200000);
  assert.strictEqual(summary.aportesAhorro, 250000);
  assert.strictEqual(summary.aportesMeta, 400000);
  assert.strictEqual(summary.totalApartado, 650000);
  assert.strictEqual(summary.ahorrosPlanificados, 650000);
  assert.strictEqual(summary.superfluosPlanificados, 3200000);
  assert.strictEqual(summary.disponible, 4000000);
  assert.strictEqual(summary.cantidadMovimientos, 8);
  assert.strictEqual(summary.recordatoriosPendientes.length, 0, 'Panel post-cobro debe vaciarse al cumplir compromisos');
  assert.strictEqual(summary.recordatoriosCompletos, true, 'Recordatorios deben quedar completos');
  assert.deepStrictEqual(summary.particionSueldo.map((item) => item.clave), ['fijos', 'ahorros', 'disponible']);

  const refreshedSaving = bootstrap.ahorrosFuturo.find((item) => item.id === saving.id);
  assert.strictEqual(refreshedSaving.montoAcumulado, 350000, 'Aporte debe acumular ahorro');

  const refreshedGoal = bootstrap.metas.find((item) => item.id === goal.id);
  assert.strictEqual(refreshedGoal.montoAcumulado, 400000, 'Aporte debe acumular meta');
  assert.ok(refreshedGoal.porcentaje > 13 && refreshedGoal.porcentaje < 14, 'Meta debe recalcular porcentaje');

  assert.ok(!bootstrap.wishlist.some((item) => item.id === wish.id), 'Wishlist comprada no debe quedar activa');
  assert.ok(!bootstrap.wishlist.some((item) => item.id === secondWish.id), 'Wishlist convertida no debe quedar activa');

  const state = await window.FinanzasLocalStore.loadState();
  assert.strictEqual(state.movimientos.length, 10, 'Persistencia local debe conservar movimientos');
  assert.ok(Object.keys(state.photos).length >= 2, 'Persistencia local debe conservar fotos');

  console.log('SMOKE_LOCAL_STORE_OK');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
