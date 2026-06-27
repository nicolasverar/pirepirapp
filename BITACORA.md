# Bitacora - Pirepirapp

## 2026-06-26 - Wipe de datos del proyecto y preparacion APK

### Objetivo
- Quitar del checkout rastros de datos, vinculos de sincronizacion y material suelto de trabajo.
- Dejar el proyecto preparado para iniciar la transicion a almacenamiento local y APK.

### Cambios
- Se elimino el vinculo local de Apps Script `backend/.clasp.json`.
- Se eliminaron borradores, previews, capturas, imagenes sueltas y laminas antiguas de diseno que no son necesarias para el runtime.
- Se reemplazo la documentacion base para reflejar el nuevo objetivo local/APK.
- `frontend/reset.html` ahora limpia `localStorage`, `sessionStorage`, caches PWA, cache de fotos locales y service workers.

## 2026-06-26 - Primer proyecto Android con Capacitor

### Objetivo
- Generar un primer contenedor Android para abrir Pirepirapp en Android Studio y producir un APK debug de prueba.
- Mantener los archivos y caches controlables del flujo dentro de la carpeta del repo.

### Cambios
- Se agrego `package.json` y `package-lock.json`.
- Se instalaron dependencias de Capacitor: `@capacitor/core`, `@capacitor/cli` y `@capacitor/android`.
- Se agrego `capacitor.config.json` con `appId` `com.pirepirapp.local`, nombre `Pirepirapp` y `webDir` `frontend`.
- Se genero el proyecto nativo `android/`.
- Se ajustaron `namespace`, `applicationId`, nombre visible y `MainActivity` para `com.pirepirapp.local`.
- Se copio el frontend a `android/app/src/main/assets/public`.
- Se documento el flujo de prueba en `docs/APK_TRANSICION.md`.
- Se agrego `.npmrc` para cache npm local en `.tool-cache/npm`.
- Se ajusto `npm run cap:build:debug` para usar `.gradle-user/` dentro del repo.

### Verificacion
- `node --check frontend/scripts/app.js`: OK.
- `android/app/src/main/assets/public/index.html`: existe.
- En esta maquina no se ejecuto `assembleDebug` porque no hay `java`, Android Studio ni SDK Android en PATH.

### Pendientes
- Abrir `android/` en Android Studio en la maquina de pruebas.
- Ejecutar Gradle sync desde Android Studio.
- Generar APK debug.
- Definir si el backend legacy en `backend/` se elimina despues de completar la migracion.

## 2026-06-26 - Modo local IndexedDB v2.78

### Objetivo
- Hacer que la APK arranque y guarde datos sin depender de Apps Script, URL, token, Sheets ni Drive.

### Cambios
- Se agrego `frontend/scripts/local-store.js` con almacenamiento local IndexedDB y fallback a `localStorage`.
- `frontend/scripts/api.js` ahora usa modo local por defecto y conserva Apps Script solo como legado opcional.
- La app ya no abre el modal de conexion al iniciar.
- Se cubren configuracion, movimientos, gastos fijos, ahorros, metas, wishlist, conversion a meta y fotos locales.
- Se subio la version visible a `v2.78` y se actualizo el service worker a `finanzas-lcd-v86`.
- Android Gradle ejecuta `npm run cap:copy` antes de compilar para copiar cambios web al APK.

### Verificacion
- `node --check` paso para `utils.js`, `state.js`, `local-store.js`, `api.js`, `local-cache.js`, `router.js`, `lcd-image.js`, `forms.js`, `render.js`, `app.js` y `service-worker.js`.
- Prueba logica Node: `LOCAL_STORE_OK` para bootstrap, config, movimiento, wishlist con foto y conversion a meta.
- Prueba logica Node: `API_MODE_OK` para modo local por defecto y vuelta desde remoto a local.
- En esta PC `npm run cap:copy` volvio a fallar por `EPERM` de OneDrive sobre `android/app/src/main/assets/public/.nojekyll`.

### Pendientes
- Ejecutar `npm run cap:sync` o directamente `Run` en Android Studio en la PC Android, donde el proyecto no esta bajo este OneDrive.
- Probar `Run` desde Android Studio en el emulador.
- Crear un gasto, una meta con foto y una wishlist para confirmar persistencia local.

## 2026-06-27 - Auditoria de consistencia local v2.78

### Objetivo
- Revisar que la app local sea consistente antes de empezar nuevas modificaciones funcionales.
- Simular flujos de uso sin Apps Script.

### Cambios
- Se corrigio el uso de `mesActual`: las acciones locales sin mes explicito ahora respetan el mes configurado.
- Se ajustaron mensajes residuales que todavia hablaban de Apps Script como requisito obligatorio.
- Se agrego `scripts/smoke-local-store.js`.
- Se agrego `npm run test:smoke`.
- Se subio cache/version visible a `v2.78`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check` paso para scripts frontend activos, service worker y smoke test.
- Busqueda de versiones/cache previos y mensajes de Apps Script obligatorio: sin referencias activas.

### Limitacion local
- En esta PC dentro de OneDrive, `npm run cap:copy` sigue fallando por `EPERM`; esta vez sobre `android/app/src/main/assets/public/index.html`.
- La prueba Android debe hacerse en la PC del emulador con `git pull` y `Run`, donde el build anterior ya funciono.

## 2026-06-27 - Modelo sueldo continuo y panel post-cobro v2.79

### Objetivo
- Implementar el concepto financiero de sueldo como particion disjunta y linea continua de dinero.
- Hacer que el cobro mensual active recordatorios hasta registrar fijos, futuro y metas.

### Cambios
- Se agrego accion local `claimSalary` para registrar el cobro del mes sin duplicarlo.
- El resumen local ahora calcula remanente anterior, sueldo cobrado, ingresos extra, salidas totales y disponible continuo.
- La torta de particion ahora usa fijos, ahorros y superfluos; ahorros se deriva de futuro + metas activas.
- Se agrego panel post-cobro bajo la fecha con frase pixelada y pendientes accionables.
- Se dejo de marcar gastos fijos como pagados automaticamente al refrescar.
- Se agregaron detalles de linea de dinero en la tarjeta de disponible.
- Se subio version visible a `v2.79` y service worker a `finanzas-lcd-v87`.
- Se actualizo `scripts/smoke-local-store.js`, `README.md` y `docs/PRUEBAS.md`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check` paso para scripts frontend activos, service worker y smoke test.
- El smoke test cubre remanente anterior, cobro mensual, no duplicacion de sueldo, panel post-cobro, pagos fijos, aportes a futuro/metas, wishlist, fotos y persistencia.

### Pendiente operativo
- Probar visualmente `v2.79` en Android Studio Emulator despues de `git pull` y `npm run cap:sync` en la PC Android.

## 2026-06-27 - Ajuste visual panel post-cobro v2.80

### Objetivo
- Corregir el panel post-cobro para que no aparezca como una tarjeta separada debajo de la fecha.

### Cambios
- El panel post-cobro ahora queda dentro del mismo bloque visual de fecha/resumen.
- Se elimino el `system-window` propio del panel y los pendientes se muestran como filas sobre el fondo LCD.
- Se subio version visible a `v2.80` y service worker a `finanzas-lcd-v88`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check` paso para scripts frontend activos, service worker y smoke test.
- `git diff --check`: OK.

## 2026-06-27 - Panel post-cobro sin mensaje duplicado v2.81

### Objetivo
- Quitar el mensaje duplicado de fecha dentro del panel post-cobro y mejorar la separacion visual de pendientes.

### Cambios
- Se reemplazo el texto post-cobro por `DISTRIBUIR INGRESO RECIENTE`.
- Se eliminaron las lineas de fecha y "ya cobraste" dentro del panel.
- Los pendientes de fijos, ahorros y metas ahora se separan con puntillismo LCD.
- Se subio version visible a `v2.81` y service worker a `finanzas-lcd-v89`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check` paso para scripts frontend activos, service worker y smoke test.
- `git diff --check`: OK.
- Busqueda de texto post-cobro anterior en frontend: sin resultados activos.

## 2026-06-27 - Legibilidad panel y consistencia torta v2.82

### Objetivo
- Mejorar legibilidad del encabezado post-cobro y corregir inconsistencias visuales de la torta.

### Cambios
- El encabezado post-cobro se partio en dos lineas: `DISTRIBUIR` e `INGRESO RECIENTE`.
- Se elimino el puntillismo de fondo detras del texto; quedan solo separadores pixelados entre filas.
- Se reemplazo el highlight tactil disonante por un color de la paleta LCD.
- La torta se deriva siempre de fijos configurados, ahorros planificados y superfluos.
- Al crear/editar ahorros, metas o wishlist convertida, el resumen visual recalcula con el estado nuevo.
- Se subio version visible a `v2.82` y service worker a `finanzas-lcd-v90`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check` paso para scripts frontend activos, service worker y smoke test.
- `git diff --check`: OK.
- Busqueda de encabezado/cache anterior en frontend: sin resultados activos.

## 2026-06-27 - Cinta transportadora post-cobro v2.83

### Objetivo
- Reforzar visualmente el estado de cobro reciente con una cinta transportadora en loop.
- Corregir letras faltantes del alfabeto pixelado.

### Cambios
- El panel post-cobro ahora muestra una cinta animada con `COBRO RECIENTE DETECTADO DISTRIBUIR INGRESO`.
- Se agregaron glyphs pixelados para `C` y `T`.
- Se mantuvo el listado de pendientes debajo de la cinta.
- Se subio version visible a `v2.83` y service worker a `finanzas-lcd-v91`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check` paso para scripts frontend activos, service worker y smoke test.
- `git diff --check`: OK.
- Busqueda de encabezado/cache anterior en frontend: sin resultados activos.

## 2026-06-27 - Volver particion disponible v2.84

### Objetivo
- Reemplazar la categoria visual `Superfluos` por `Disponible` en la particion del sueldo.

### Cambios
- Las categorias base vuelven a incluir `Disponible`.
- La torta y leyenda muestran `Disponible` y el badge abreviado `DISP.`.
- El resumen local conserva el calculo del tramo libre del sueldo y expone la clave de particion como `disponible`.
- Se subio version visible a `v2.84` y service worker a `finanzas-lcd-v92`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check` paso para scripts frontend activos, service worker y smoke test.
- `git diff --check`: OK.
- Busqueda de `Superfluos`, `SUPERF`, `v2.83` y `finanzas-lcd-v91` en frontend/scripts/docs activos: sin resultados.
- `npm run cap:sync`: copio assets web a `android/app/src/main/assets/public`, pero la fase final quedo bloqueada en esta maquina por placeholders/reparse points de OneDrive en archivos generados e ignorados por git. En la PC de Android, ejecutar `npm run cap:sync` despues del pull.
