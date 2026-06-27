# Pruebas

## Wipe

- Abrir `frontend/reset.html`.
- Confirmar que vuelve a `index.html`.
- Confirmar que ya no quedan URL/token guardados en el formulario de conexion.
- En Android, borrar almacenamiento de la app si se quiere limpieza total del WebView.

## Frontend

- Validar sintaxis JS con `node --check`.
- Validar `frontend/manifest.json`.
- Validar que `frontend/service-worker.js` no tenga assets faltantes.
- Probar navegacion en Resumen, Gastos, Metas y Configuracion.

## Transicion Local

- Ejecutar `npm run test:smoke`.
- Configurar sueldo, gastos fijos, futuro y una meta.
- Pulsar `Cobre` y confirmar que aparece el panel post-cobro.
- Confirmar que el disponible inicial suma sueldo cobrado + remanente anterior.
- Cargar pagos fijos y verificar que desaparecen del panel.
- Cargar aportes a futuro/metas y verificar que desaparecen del panel.
- Confirmar que la meta actualiza progreso automaticamente.
- Crear movimiento.
- Editar movimiento.
- Eliminar movimiento.
- Crear meta con foto local.
- Crear wishlist.
- Convertir wishlist en meta.
- Exportar backup JSON.
- Borrar datos locales.
- Importar backup JSON y verificar que los saldos coincidan.

## APK

- Probar en Android Studio Emulator.
- Probar en telefono fisico por USB.
- Instalar APK manualmente.
- Confirmar que persiste datos despues de cerrar y abrir.
- Confirmar que funciona sin internet.
