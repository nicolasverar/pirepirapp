# Pirepirapp

App personal de finanzas con estetica LCD verde. Este repo quedo limpiado para iniciar la transicion desde PWA sincronizada con Google Apps Script/Drive hacia una app local instalable como APK.

## Estado Actual

- El frontend productivo vive en `frontend/`.
- El backend de Apps Script queda solo como legado temporal en `backend/`.
- No debe haber token, URL de Web App, ID de Apps Script, ID de Sheet, fotos personales ni registros financieros en el repo.
- La app arranca por defecto en modo local con IndexedDB mediante `frontend/scripts/local-store.js`; Apps Script queda solo como legado opcional.
- El modelo financiero local trata el sueldo como una particion disjunta: gastos fijos, ahorros y disponible.
- El sueldo se registra desde el formulario de ingreso usando motivo `Sueldo`; esto suma el remanente anterior y activa recordatorios post-cobro hasta cargar fijos, futuro y metas.

## Modelo Financiero

- El saldo es continuo: no se resetea por mes; el remanente anterior entra al ciclo siguiente.
- El sueldo configurado define la particion esperada, pero el dinero disponible se calcula con movimientos reales.
- Los ahorros planificados se derivan automaticamente de futuro y metas activas.
- Wishlist queda como lista de deseos sin compromiso mensual; sus compras impactan como movimiento real.
- El panel post-cobro desaparece cuando todos los compromisos del mes fueron registrados.

## Datos

El repo no debe guardar:

- Movimientos reales.
- Montos personales.
- Fotos cargadas por el usuario.
- Links privados de Drive, Sheets o Apps Script.
- Backups exportados.
- APK/AAB generados.

Para limpiar una instalacion ya usada en navegador o PWA, abrir `frontend/reset.html` desde el mismo origen donde se instalo la app. Para limpiar Android por completo, tambien se puede borrar almacenamiento desde Ajustes > Apps > Pirepirapp > Almacenamiento.

## Proximo Camino

1. Agregar exportar/importar backup JSON.
2. Probar persistencia local en APK: config, gastos, metas, wishlist y fotos.
3. Pulir releases Android firmadas.
4. Definir si el backend legacy en `backend/` se elimina.

## Pruebas Locales

```powershell
npm run test:smoke
```

El smoke test simula modo local, cobro mensual, remanente continuo, panel post-cobro, gastos fijos, movimientos, ahorros, metas, wishlist, fotos y persistencia.
