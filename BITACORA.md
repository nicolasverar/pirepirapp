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
