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

## 2026-06-27 - Cinta pixelada hundida v2.85

### Objetivo
- Hacer que la cinta post-cobro recorra el mensaje con la misma fuente pixelada de 35 segmentos usada en la fecha.
- Quitar el enmarcado adicional de la cinta y dejar solo un fondo rectangular hundido por sombra.

### Cambios
- El texto de la cinta ahora se renderiza como SVG 5x7 con segmentos activos y fantasma.
- Se duplico el SVG dentro del track para mantener el loop continuo.
- Se eliminaron los bordes superior/inferior y las piezas laterales; el rectangulo usa fondo LCD con sombras internas para dar profundidad.
- Se subio version visible a `v2.85` y service worker a `finanzas-lcd-v93`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check` paso para scripts frontend activos, service worker y smoke test.
- `git diff --check`: OK.
- Busqueda de cache anterior activa: sin resultados; solo queda `2.84rem` como tamano CSS no relacionado.
- No se pudo hacer screenshot headless porque Edge/Chrome no estan en PATH en esta maquina.

## 2026-06-27 - Fondo integrado para cinta v2.86

### Objetivo
- Hacer que el fondo hundido de la cinta use el mismo tratamiento visual que la parte superior.
- Reducir drasticamente la sombra para que el hundimiento sea sutil.

### Cambios
- La cinta adopta la grilla y color base LCD de los modulos superiores.
- Se reemplazo la sombra marcada por dos sombras internas leves.
- Se elimino el oscurecimiento lateral del overlay.
- Se subio version visible a `v2.86` y service worker a `finanzas-lcd-v94`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check` paso para scripts frontend activos, service worker y smoke test.
- `git diff --check`: OK.

## 2026-06-27 - Cobro solo desde formulario y grilla fina v2.87

### Objetivo
- Igualar la hendidura de la cinta a la densidad real de pixeles del fondo superior.
- Quitar el boton de sueldo/cobro de la seccion Resumen y dejar el cobro solo desde el formulario de ingreso.

### Cambios
- La hendidura usa la misma matriz fina de 2px, tono base y gradiente del fondo LCD superior, con sombreado apenas perceptible.
- Se eliminaron los botones directos `Cobre`/`Sueldo cargado` de Resumen y Configuracion.
- Se elimino la ruta UI/especial `claimSalary`; el sueldo se registra como movimiento `Ingreso` con motivo `Sueldo`.
- El atajo `¡Cobré!` del formulario solo autocompleta monto, motivo y fecha/hora; el registro ocurre al guardar.
- `createMovement` evita duplicar un ingreso de sueldo si ya existe en el mismo mes.
- Se subio version visible a `v2.87` y service worker a `finanzas-lcd-v95`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check` paso para scripts frontend activos, service worker y smoke test.
- `git diff --check`: OK.
- Busqueda activa de `claimSalary`, `claimsalary`, `js-claim-salary` y `salary-paid-button`: sin resultados en frontend/scripts/docs activos.

## 2026-06-27 - Marco PDA negro e icono circular v2.88

### Objetivo
- Reemplazar el tono verdoso del marco fisico y botonera por una textura negra tipo PDA.
- Limpiar el header superior para quitar referencias visibles a sincronizacion, conexion y actualizacion.
- Usar `logo.jpeg` solo como icono de app/launcher, sin insertarlo en la interfaz.

### Cambios
- El header muestra `PIREPIRAPP`, version visible y un terminal compacto solo para avisos rapidos como `Guardado`.
- Se eliminaron los controles visibles de conexion, actualizacion de app, estado de sync y texto de mes automatico.
- La carcasa y botones inferiores adoptan grafito/negro con textura sutil de material.
- Se genero `logo-circle.png` desde `..\logo.jpeg` con fondo transparente y se actualizaron `frontend/icons/icon-192.png`, `frontend/icons/icon-512.png` y todos los recursos launcher de Android.
- El fondo adaptive launcher pasa a transparente y se subio version visible a `v2.88` con service worker `finanzas-lcd-v96`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check` paso para scripts frontend activos, service worker y smoke test.
- `git diff --check`: OK.
- Busqueda activa en `frontend` de `Conexion`, `Actualizar app`, `Mes automatico`, `Sincronizado`, `Sin conexion`, `update-app`, `sync-status` y handlers obsoletos: sin resultados.
- Iconos PNG verificados: `cornerA=0` y `centerA=255` en `logo-circle.png`, `icon-192.png`, `icon-512.png` y launcher Android principal.
- `npm run cap:copy` quedo bloqueado en esta maquina por `EPERM` al reemplazar `android/app/src/main/assets/public/cordova_plugins.js`, carpeta ignorada por git y marcada como `ReparsePoint` de OneDrive. En la PC de Android, correr `npm run cap:copy` despues del pull antes de ejecutar desde Android Studio.
- `npm run cap:build:debug` quedo bloqueado en esta maquina porque no hay `java` en `PATH` ni `JAVA_HOME` configurado.

## 2026-06-27 - Agregar solo en resumen y metas v2.89

### Objetivo
- Quitar cualquier boton de agregar en las secciones `Gastos` y `Configuracion`.

### Cambios
- El boton fisico `AGREGAR` ahora se muestra y funciona solo en `Resumen` y `Metas`.
- El menu `AGREGAR` ignora clicks fuera de esas dos secciones.
- Se retiro el boton interno `Agregar gasto fijo` de `Configuracion`.
- Se subio version visible a `v2.89` y service worker a `finanzas-lcd-v97`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check` paso para scripts frontend activos, router, service worker y smoke test.
- `git diff --check`: OK.
- Busqueda activa en `frontend` de `Agregar gasto fijo`, `js-add-fixed-expense`, `v2.88`, `2.88` y `finanzas-lcd-v96`: sin resultados.

## 2026-06-27 - Resumen y cobro sueldo v2.90

### Objetivo
- Consolidar el flujo de cobro como ingreso de sueldo y dejar la distribucion para el panel post-cobro.
- Unificar la textura de tarjetas de Resumen con la estetica de tarjetas de Metas.

### Cambios
- Todas las tarjetas principales de `Resumen` usan marco negro, textura LCD y sombra lateral/inferior tipo Metas.
- `Plata disponible` muestra el monto con render pixelado/segmentado igual al monto gastado del mes.
- El formulario nuevo de ingreso/gasto ya no muestra selector manual de meta, ahorro, gasto fijo o wishlist; esos destinos se cargan desde el emergente post-cobro.
- El segundo intento de registrar sueldo en el mismo mes muestra la alerta: `Cobraste otra vez gua'u? que bola que sos en serio`.
- Se agrego defensa para respuestas `yaRegistrado` del storage/backend, evitando que se trate como `Guardado`.
- Se subio version visible a `v2.90` y service worker a `finanzas-lcd-v98`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check`: OK para scripts frontend activos, service worker y smoke test.
- `git diff --check`: OK.
- Busqueda activa en `frontend` de `v2.89`, `2.89`, `finanzas-lcd-v97`, `claimSalary`, `js-claim-salary`, `salary-paid-button`, `Eliminar cobro`, `eliminar cobro`, `Sueldo cargado` y `Agregar gasto fijo`: sin controles de cobro/config obsoletos activos.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=2.90`: OK, responde HTML con `v2.90`.
- `git push origin main`: OK.

## 2026-06-27 - Correccion textura Resumen v2.91

### Objetivo
- Corregir la textura cuadriculada de `Resumen` y alinearla con la textura rayada de las tarjetas de `Metas`.
- Dejar la tarjeta de fecha (`HOY ES`) fuera del marco/sombra global agregado en v2.90.

### Cambios
- `Resumen` ahora aplica textura rayada horizontal tipo Metas a las tarjetas de gasto mensual, plata disponible y particion.
- Se retiro `summary-embedded.total-window` del selector global de tarjetas para recuperar el comportamiento sin fondo/marco de la fecha.
- El bloque `Lo que va de junio gastaste` y el fondo de `Plata disponible` dejan de usar cuadricula y pasan a raya fina.
- Se subio version visible a `v2.91` y service worker a `finanzas-lcd-v99`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check`: OK para scripts frontend activos, service worker y smoke test.
- `git diff --check`: OK.
- Busqueda activa en `frontend` de `v2.90`, `2.90`, `finanzas-lcd-v98` y `summary-embedded.total-window`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=2.91`: OK, responde HTML con `v2.91`.
- `git push origin main`: OK.

## 2026-06-27 - Fondo y sombra Resumen v2.92

### Objetivo
- Hacer visible el fondo rayado en `Plata disponible`.
- Hacer visible la sombra inferior de las tarjetas de `Resumen`, no solo la lateral derecha.

### Cambios
- Se agrego el selector especifico `availability-card-b` al override final para que no gane el fondo liso previo.
- El area de monto de `Plata disponible` tambien recibe la textura rayada.
- La sombra inferior paso a `z-index` visible y se agrego margen inferior/box-shadow para que no quede tapada por la siguiente tarjeta.
- Se subio version visible a `v2.92` y service worker a `finanzas-lcd-v100`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check`: OK para scripts frontend activos, service worker y smoke test.
- `git diff --check`: OK.
- Busqueda activa en `frontend` de `v2.91`, `2.91` y `finanzas-lcd-v99`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=2.92`: OK, responde HTML con `v2.92`.
- `git push origin main`: OK.

## 2026-06-27 - Metas y cosas que quiero v2.93

### Objetivo
- Redisenar las tarjetas de `Metas` segun referencia visual local `asi quiero.jpeg`.
- Rebalancear `Cosas que quiero` y reemplazar el pin disonante por una perforacion circular integrada.
- Aclarar el control `Mostrar acumulado` del formulario de ahorro futuro.

### Cambios
- La tarjeta de meta ahora usa fila principal con titulo/modulos de dinero a la izquierda e imagen cuadrada alineada a la derecha.
- `Acumulado` y `Por mes` quedan apilados junto a la imagen; la barra de progreso pasa al espacio inferior.
- La wishlist reduce espacio muerto superior, compacta foto/contenido y reemplaza el icono de pin por una circunferencia negra texturada en la esquina.
- Se quito `pin-lcd.png` del precache del service worker porque ya no participa del pin visual.
- `Mostrar acumulado` en ahorro futuro se ve como toggle LCD, no como checkbox/selector plano.
- Se subio version visible a `v2.93` y service worker a `finanzas-lcd-v101`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check`: OK para scripts frontend activos, service worker y smoke test.
- `git diff --check`: OK.
- Busqueda activa en `frontend` de `v2.92`, `2.92`, `finanzas-lcd-v100`, `pin-lcd.png` y `grid-area: actions`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=2.93`: OK, responde HTML con `v2.93`.
- `git push origin main`: OK.

## 2026-06-27 - Ajuste sombra y wishlist v2.94

### Objetivo
- Agregar puntillado visible en la sombra inferior de `Plata disponible` y `Particion de sueldo`.
- Recentrar y compactar las tarjetas de `Cosas que quiero`.

### Cambios
- `Plata disponible` y `Particion de sueldo` tienen sombra inferior con fondo punteado explicito, igual que el lateral.
- La tarjeta `Cosas que quiero` reduce espacio superior, centra titulo/monto/botones y compacta la foto.
- El boton de fijar/punch queda integrado a la esquina superior derecha y mas cerca del campo visual.
- Se subio version visible a `v2.94` y service worker a `finanzas-lcd-v102`.

### Verificacion
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check`: OK para scripts frontend activos, service worker y smoke test.
- `git diff --check`: OK.
- Busqueda activa en `frontend` de `v2.93`, `2.93` y `finanzas-lcd-v101`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=2.94`: OK, responde HTML con `v2.94`.
- `git push origin main`: OK.

## 2026-06-27 - Configuracion y archivo v2.95

### Objetivo
- Reestructurar `Config` para que solo gestione sueldo mensual y gastos fijos.
- Reemplazar el porcentaje numerico de gastos fijos por un control tactil tipo dial/slider.
- Implementar `Papelera/Archivo` para metas y cosas que quiero borradas, cumplidas o convertidas.

### Cambios
- `Config` ahora muestra tarjetas separadas para `Sueldo mensual`, `Gastos fijos` y `Papelera/Archivo`.
- Se eliminaron funciones extra dentro de Config: no hay cobro, eliminacion de cobro, actualizar app ni mes automatico.
- Cada gasto fijo conserva tres campos: nombre, monto mensual y porcentaje del sueldo.
- Monto y porcentaje se recalculan en ambas direcciones; el porcentaje se controla con dial circular y slider de 0% a 100%.
- El archivo local lista metas borradas, metas cumplidas, cosas compradas, cosas convertidas y cosas borradas.
- Cada item de archivo se puede recuperar y vuelve a su coleccion activa sin perder fotos, montos ni progreso.
- Las metas que llegan a 100% pasan a estado `Cumplido` y entran al archivo.
- Se subio version visible a `v2.95` y service worker a `finanzas-lcd-v103`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check`: OK para `render.js`, `local-store.js`, `app.js`, `state.js`, `config.js` y `service-worker.js`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `v=2.94`, `v2.94`, `APP_VERSION: 'v2.94'` y `finanzas-lcd-v102`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=2.95`: OK, responde HTML con `v2.95`.
- Service worker publico verificado con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/service-worker.js?v=2.95`: OK, responde `finanzas-lcd-v103`.
- Commit funcional `554e555` pusheado a `origin/main`.

## 2026-06-27 - Sombras punteadas y wishlist v2.96

### Objetivo
- Hacer visible el puntillado de la sombra inferior en `Plata disponible` y `Particion sueldo`.
- Recentrar las tarjetas de `Cosas que quiero` y eliminar el control de fijar.

### Cambios
- Se agrego una regla final mas especifica para la sombra inferior/lateral de `Plata disponible` y `Particion sueldo`, con puntillado oscuro explicito.
- `Cosas que quiero` ya no renderiza boton de fijar ni conserva orden por pin.
- Se elimino la logica y CSS de `wish-pin`/`is-pinned`.
- La grilla de wishlist queda en dos columnas estables, sin margen externo por tarjeta, con padding interno parejo para foto, monto y acciones.
- Se subio version visible a `v2.96` y service worker a `finanzas-lcd-v104`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `v=2.95`, `v2.95`, `finanzas-lcd-v103` y `WISHLIST_PINS_KEY`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=2.96`: OK, responde HTML con `v2.96`.
- Service worker publico verificado con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/service-worker.js?v=2.96`: OK, responde `finanzas-lcd-v104`.
- Commit funcional `56e959f` pusheado a `origin/main`.

## 2026-06-27 - Fijos simplificados y sombra reforzada v2.97

### Objetivo
- Evitar la etiqueta duplicada `Sueldo mensual` en Config.
- Simplificar gastos fijos eliminando la rueda y dejando solo el deslizador.
- Asegurar que la sombra inferior punteada salga en `Plata disponible` y `Particion sueldo`.

### Cambios
- En la tarjeta `Sueldo mensual`, el campo ahora se etiqueta solo como `Monto`.
- En `Gastos fijos`, se elimino la rueda/dial; queda un slider horizontal con lectura porcentual.
- El total de fijos muestra el porcentaje del sueldo y el disponible estimado despues de fijos.
- Se neutralizo el estilo rojo de sobrepresupuesto para que Config no se vea como alerta completa.
- `Plata disponible` y `Particion sueldo` ahora tienen un elemento real `.summary-bottom-dot-shadow` dentro de la tarjeta, ademas del pseudo-elemento, para que el puntillado inferior se vea aunque el navegador tape la sombra externa.
- Se subio version visible a `v2.97` y service worker a `finanzas-lcd-v105`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `fixed-dial`, `fixed-dial-face`, `data-fixed-dial`, `fixedDialAngle`, `Sueldo mensual</span>`, `v=2.96`, `v2.96` y `finanzas-lcd-v104`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=2.97`: OK, responde HTML con `v2.97`.
- Service worker publico verificado con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/service-worker.js?v=2.97`: OK, responde `finanzas-lcd-v105`.
- Commit funcional `d8d6825` pusheado a `origin/main`.

## 2026-06-27 - Limite de presupuesto en fijos v2.98

### Objetivo
- Hacer que el porcentaje del gasto fijo complete automaticamente el monto que representa.
- Evitar asignaciones que hagan que fijos + ahorros superen el 100% del sueldo.
- Reducir el refuerzo de sombra inferior para que sea igual al lateral.

### Cambios
- El editor de gastos fijos calcula el maximo asignable por fila como `sueldo - ahorros planificados - otros fijos`.
- Al mover el slider de porcentaje, el monto mensual se autocompleta con el valor de ese porcentaje del sueldo.
- Si el monto o porcentaje supera lo disponible, se recorta al maximo permitido y se muestra el limite asignable.
- Al guardar, se bloquea la configuracion si fijos + ahorros exceden el sueldo.
- El total de fijos muestra `Disponible tras fijos y ahorros`.
- La sombra inferior de `Plata disponible` y `Particion sueldo` ahora es una sola franja punteada de 8px, igual al lateral, sin doble capa excesiva.
- Se subio version visible a `v2.98` y service worker a `finanzas-lcd-v106`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `fixed-dial`, `fixedDialAngle`, `data-fixed-dial`, `v=2.97`, `v2.97` y `finanzas-lcd-v105`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=2.98`: OK, responde HTML con `v2.98`.
- Service worker publico verificado con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/service-worker.js?v=2.98`: OK, responde `finanzas-lcd-v106`.
- Commit funcional `4c53882` pusheado a `origin/main`.

## 2026-06-27 - Reparacion slider fijos v2.99

### Objetivo
- Corregir el deslizador de porcentaje de sueldo en `Gastos fijos`.

### Cambios
- El slider mantiene su rango nativo `0-100` para que siempre pueda moverse.
- El limite de presupuesto se calcula por JS sin pisar dinamicamente el `max` del control.
- Se separo el valor tecnico del range del texto visual mostrado, evitando formatos no aptos para `input type="range"`.
- Al mover el porcentaje, se autocompleta el monto mensual y si supera `sueldo - ahorros - otros fijos`, se recorta al maximo permitido.
- Se reforzo la interaccion del range con `cursor: pointer`, `z-index` y `touch-action`.
- Se subio version visible a `v2.99` y service worker a `finanzas-lcd-v107`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `v=2.98`, `v2.98`, `finanzas-lcd-v106`, `fixed-dial`, `fixedDialAngle` y `data-fixed-dial`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=2.99`: OK, responde HTML con `v2.99`.
- Service worker publico verificado con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/service-worker.js?v=2.99`: OK, responde `finanzas-lcd-v107`.
- Commit funcional `335f056` pusheado a `origin/main`.

## 2026-06-27 - Primer rediseño vista gastos v3.00

### Objetivo
- Eliminar la presentacion anterior de filtros en `Gastos`.
- Reemplazar el encabezado por `MOVIMIENTOS` grande con la misma logica pixelada 5x7/35 segmentos usada en la tarjeta de fecha del resumen.

### Cambios
- La vista `Gastos` ya no muestra el titulo `GASTOS TOTALES`, el mensaje `Mostrando todos los movimientos...` ni el boton visible `Actualizar`.
- Se agrego un encabezado `MOVIMIENTOS` renderizado con `renderSummaryPixelSvg`.
- Se agrego una linea compacta que cambia segun el filtro activo, con conteo y alcance mensual.
- Los filtros pasaron al pie de la vista como dock de seleccion, sin tarjeta envolvente.
- La lista de movimientos queda en su panel propio debajo del encabezado.
- Se subio version visible a `v3.00` y service worker a `finanzas-lcd-v108`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `Mostrando todos los movimientos`, `GASTOS TOTALES`, `v=2.99`, `v2.99` y `finanzas-lcd-v107`: sin resultados visibles; queda solo el listener generico `.js-refresh` sin boton renderizado en la vista.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=3.00`: OK, responde HTML con `v3.00`.
- Service worker publico verificado con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/service-worker.js?v=3.00`: OK, responde `finanzas-lcd-v108`.
- Commit funcional `e7993ed` pusheado a `origin/main`.

## 2026-06-27 - Filtros de gastos en boton inferior v3.01

### Objetivo
- Mover los filtros de `Gastos` al lugar del boton inferior de accion.
- El boton debe llamarse `FILTRAR` y abrir un menu similar al de `AGREGAR`.

### Cambios
- En la vista `Gastos`, el boton inferior vuelve a mostrarse y cambia su etiqueta a `FILTRAR`.
- El menu `FILTRAR` se despliega desde la barra inferior con el mismo posicionamiento del menu `AGREGAR`.
- Dentro del menu se reutilizan los mismos filtros aprobados: `Todo`, `Gastos`, `Ingresos`, `Cosas`, `Ahorro/meta` y `Fijos`.
- Los chips de filtro ya no se renderizan sueltos dentro de la pantalla de gastos.
- Al elegir un filtro, se actualiza `movementFilter`, se cierra el menu y la vista conserva el encabezado `MOVIMIENTOS`.
- Se subio version visible a `v3.01` y service worker a `finanzas-lcd-v109`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\forms.js`: OK.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\router.js`: OK.
- `node --check frontend\scripts\app.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `v=3.00`, `v3.00`, `finanzas-lcd-v108`, `renderMovementFilters`, `js-movement-filter`, `Mostrando todos los movimientos` y `GASTOS TOTALES`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=3.01`: OK, responde HTML con `v3.01`.
- Service worker publico verificado con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/service-worker.js?v=3.01`: OK, responde `finanzas-lcd-v109`.
- Commit funcional `80e932e` pusheado a `origin/main`.

## 2026-06-27 - Actualizar app desde Config v3.02

### Objetivo
- Agregar en `Config` el boton inferior `ACTUALIZAR` para refrescar la app y limpiar cache.

### Cambios
- El boton inferior queda con tres modos: `AGREGAR` en Resumen/Metas, `FILTRAR` en Gastos y `ACTUALIZAR` en Config.
- Al tocar `ACTUALIZAR`, la app muestra aviso en terminal, borra cache PWA `finanzas-lcd-*`, cache de fotos `finanzas-user-photos-*`, limpia el bootstrap cacheado y desregistra service workers.
- Despues de limpiar cache, recarga `index.html` con `appUpdate=<timestamp>` conservando el hash de la vista.
- No se usa `reset.html` y no se borra el almacenamiento principal de datos financieros.
- Se subio version visible a `v3.02` y service worker a `finanzas-lcd-v110`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\app.js`: OK.
- `node --check frontend\scripts\router.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `v=3.01`, `v3.01` y `finanzas-lcd-v109`: sin resultados; se confirmaron `ACTUALIZAR`, `updateApplicationCache`, `clearRuntimeCaches` y `unregisterServiceWorkers`.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=3.02`: OK, responde HTML con `v3.02`.
- Service worker publico verificado con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/service-worker.js?v=3.02`: OK, responde `finanzas-lcd-v110`.
- Commit funcional `8b26778` pusheado a `origin/main`.

## 2026-06-27 - Aviso post-cobro y guardado local v3.03

### Objetivo
- Reemplazar la cinta post-cobro por un cuadro LCD intermitente que sobresalga de la pantalla.
- Reforzar el guardado local ante fallos de IndexedDB/localStorage.

### Cambios
- El aviso post-cobro ya no usa cinta transportadora; ahora muestra un cuadro saltante con `COBRO RECIENTE` y `DETECTADO` en display pixelado 5x7/35 segmentos.
- La lista de gastos, ahorros y metas pendientes queda debajo del cuadro y mantiene sus acciones de carga.
- El panel permite overflow visible para que el cuadro parezca salir y volver a la pantalla, con sombra punteada y animacion intermitente.
- `local-store.js` ahora mantiene un espejo actualizado en `localStorage` y usa una marca de prioridad para leer el fallback si una escritura de IndexedDB falla o se aborta.
- Se subio version visible a `v3.03` y service worker a `finanzas-lcd-v111`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\local-store.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `post-salary-belt`, `post-salary-belt-loop`, `post-salary-belt-track`, `post-salary-belt-copy`, `renderPostSalaryBeltText`, `v=3.02`, `v3.02` y `finanzas-lcd-v110`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=3.03`: OK, responde HTML con `v3.03`.
- Service worker publico verificado con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/service-worker.js?v=3.03`: OK, responde `finanzas-lcd-v111`.
- Commit funcional `d80b77b` pusheado a `origin/main`.

## 2026-06-27 - Aviso post-cobro sin marco v3.04

### Objetivo
- Hacer que el aviso post-cobro muestre toda la frase en una sola fila.
- Quitar el marco/cuadro y dejar la intermitencia solo en las letras.

### Cambios
- `COBRO RECIENTE DETECTADO` se renderiza en una sola linea con la matriz pixelada 5x7/35 segmentos.
- Se eliminaron el contenedor con borde, la sombra, el fondo, el salto del bloque y la animacion del marco.
- La intermitencia ahora aplica solamente a los segmentos activos de las letras.
- Se compacto el SVG del aviso para que entre mejor en pantallas chicas sin partirse en dos lineas.
- Se subio version visible a `v3.04` y service worker a `finanzas-lcd-v112`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `post-salary-alert-face`, `post-salary-alert-line`, `post-salary-pop`, `post-salary-face-pulse`, `v=3.03`, `v3.03` y `finanzas-lcd-v111`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=3.04`: OK, responde HTML con `v3.04`.
- Service worker publico verificado con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/service-worker.js?v=3.04`: OK, responde `finanzas-lcd-v112`.
- Commit funcional `826de5a` pusheado a `origin/main`.

## 2026-06-27 - Linea superior intermitente post-cobro v3.05

### Objetivo
- Agregar un marco superior de lineas intermitentes al aviso post-cobro.
- Acelerar el parpadeo del aviso.

### Cambios
- El aviso `COBRO RECIENTE DETECTADO` conserva una sola linea y sin marco completo.
- Se agrego una linea superior segmentada/pixelada con el mismo lenguaje visual de los separadores inferiores.
- El parpadeo de las letras y de la linea superior pasa de `1.08s` a `0.64s`.
- Se subio version visible a `v3.05` y service worker a `finanzas-lcd-v113`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `v=3.04`, `v3.04` y `finanzas-lcd-v112`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=3.05`: OK, responde HTML con `v3.05`.
- Service worker publico verificado con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/service-worker.js?v=3.05`: OK, responde `finanzas-lcd-v113`.
- Commit funcional `d9d9d81` pusheado a `origin/main`.

## 2026-06-27 - Cinta post-cobro sin parpadeo v3.06

### Objetivo
- Quitar el parpadeo del aviso post-cobro.
- Hacer que el texto recorra el espacio entre lineas segmentadas, sin fondo, sombra ni marco.

### Cambios
- `COBRO RECIENTE DETECTADO` vuelve a moverse como cinta, pero sin contenedor visual adicional.
- El texto pixelado se duplica en un track continuo y corre de izquierda a derecha en loop.
- Se mantienen lineas segmentadas superior e inferior como carril del aviso.
- Se elimino la animacion de parpadeo de letras y linea superior.
- Se subio version visible a `v3.06` y service worker a `finanzas-lcd-v114`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `post-salary-letter-blink`, `0.64s`, `v=3.05`, `v3.05` y `finanzas-lcd-v113`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=3.06`: OK, responde HTML con `v3.06`.
- Service worker publico verificado con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/service-worker.js?v=3.06`: OK, responde `finanzas-lcd-v114`.
- Commit funcional `b0781f1` pusheado a `origin/main`.

## 2026-06-27 - Movimientos en tarjetas horizontales v3.07

### Objetivo
- Redisenar cada registro de `Gastos` como tarjeta horizontal con motivo, monto, fecha/hora y acciones.

### Cambios
- La lista de movimientos ahora renderiza cada registro como tarjeta individual con textura LCD rayada, borde negro y sombra punteada lateral/inferior.
- La primera fila muestra motivo a la izquierda y monto a la derecha.
- La segunda fila muestra fecha y hora del registro.
- Las acciones quedan en una columna compacta con botones `EDIT` y `DEL`; `EDIT` abre el formulario existente y `DEL` mantiene la confirmacion de borrado.
- El contenedor de la lista queda transparente/sin marco para no anidar tarjetas visuales.
- Se agregaron ajustes responsive para conservar lectura horizontal en pantallas chicas.
- Se subio version visible a `v3.07` y service worker a `finanzas-lcd-v115`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `v=3.06`, `v3.06` y `finanzas-lcd-v114`: sin resultados.
- URL publica verificada con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/?v=3.07`: OK, responde HTML con `v3.07`.
- Service worker publico verificado con `curl.exe -L --max-time 20 https://nicolasverar.github.io/pirepirapp/service-worker.js?v=3.07`: OK, responde `finanzas-lcd-v115`.
- Commit funcional `e57e146` pusheado a `origin/main`.

## 2026-06-27 - Filtros acumulables y tacto app v3.08

### Objetivo
- Permitir que los filtros de `Gastos` se acumulen marcando y desmarcando opciones sin cerrar el menu.
- Diferenciar sutilmente las tarjetas de movimientos por tipo sin salir de la estetica LCD.
- Evitar la seleccion accidental de texto en la app, manteniendo inputs y formularios editables.

### Cambios
- `movementFilter` ahora acepta multiples filtros activos y conserva compatibilidad con el valor unico anterior.
- El menu inferior `FILTRAR` permanece abierto al tocar chips y actualiza el estado visual/cantidad de filtros activos.
- La linea de estado de `MOVIMIENTOS` muestra combinaciones como `Gastos + Fijos`.
- Cada tarjeta de movimiento recibe una marca lateral pixelada distinta para ingresos, gastos, fijos, ahorro/metas y wishlist.
- Se agrego `user-select: none` a la interfaz general y se re-habilito `user-select: text` en campos de formulario.
- Se subio version visible a `v3.08` y service worker a `finanzas-lcd-v116`.
- Se ejecuto `npm.cmd run cap:copy` para copiar los assets web al proyecto Android local; la carpeta generada `android/app/src/main/assets/public` sigue ignorada por git.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\forms.js`: OK.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `v=3.07`, `v3.07` y `finanzas-lcd-v115`: sin resultados.
- `npm.cmd run build`: no aplica; el proyecto no tiene script `build`.
- `npm.cmd run cap:build:debug`: bloqueado en esta maquina porque no hay `java` en `PATH` ni `JAVA_HOME` configurado.

## 2026-06-27 - Filtros por mes y wishlist desde gasto v3.09

### Objetivo
- Agregar filtro por meses en la seccion `Gastos`, acumulable junto con los filtros de tipo.
- Quitar de la linea de estado el conteo textual de movimientos.
- Permitir registrar una compra de `Cosas que quiero` desde el campo `Motivo` del formulario de gasto.

### Cambios
- El menu `FILTRAR` ahora separa filtros por `Tipo` y por `Mes`.
- Los filtros de tipo se acumulan como union y los filtros de mes cruzan el resultado, por ejemplo `Gastos + Junio 2026`.
- La linea bajo `MOVIMIENTOS` ya no muestra `X movimientos`; solo muestra filtros activos unidos por `+`.
- El campo `Motivo` del formulario de gasto mantiene escritura libre por defecto y agrega un boton `COSAS` cuando hay wishlist activa.
- Al elegir una cosa de wishlist, el movimiento pasa a `Compra de wishlist`, se guarda `idRelacionado`, se autocompleta motivo y monto aproximado, dejando el monto editable.
- Se agrego opcion `LIBRE` para volver al modo de motivo manual.
- Se subio version visible a `v3.09` y service worker a `finanzas-lcd-v117`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\forms.js`: OK.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `v=3.08`, `v3.08` y `finanzas-lcd-v116`: sin resultados.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-27 - Etiqueta de tipo en movimientos v3.10

### Objetivo
- Mostrar debajo del nombre de cada movimiento una etiqueta legible de categoria/tipo.

### Cambios
- Cada tarjeta de `Gastos` muestra ahora una linea bajo el motivo con etiquetas como `Gasto corriente`, `Gasto fijo`, `Ahorro futuro`, `Ahorro meta`, `Cosa que quiero`, `Ingreso` o `Cobro de sueldo`.
- La etiqueta usa estilo pixelado compacto negro/verde para no competir con el monto ni la fecha.
- Se subio version visible a `v3.10` y service worker a `finanzas-lcd-v118`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `v=3.09`, `v3.09` y `finanzas-lcd-v117`: sin resultados.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-27 - Intervalo de meses en filtros v3.11

### Objetivo
- Reemplazar la seleccion de meses por chips individuales por un filtro compacto de intervalo.

### Cambios
- El menu `FILTRAR` mantiene los chips acumulables de `Tipo`.
- La seccion `Meses` ahora muestra controles `Desde` y `Hasta` con selector mensual.
- El intervalo se guarda como un unico filtro `range:AAAA-MM..AAAA-MM`, para evitar una vista pesada cuando haya muchos meses.
- El boton `TODO` limpia solo el intervalo de meses y conserva los filtros de tipo activos.
- La linea bajo `MOVIMIENTOS` muestra el intervalo como texto compacto, por ejemplo `Gastos + Junio 2026 - Agosto 2026`.
- Se conserva compatibilidad con filtros viejos `month:AAAA-MM` si quedaron en estado local.
- Se subio version visible a `v3.11` y service worker a `finanzas-lcd-v119`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\forms.js`: OK.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `monthOptions`, `movement-filter-months`, `movementMonthFilterOptions`, `v=3.10`, `v3.10` y `finanzas-lcd-v118`: sin resultados.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-27 - Header compacto y terminal deslizante v3.12

### Objetivo
- Reducir el alto del marco superior para ganar espacio de pantalla.
- Mantener nombre de app, version y terminal de comandos en una sola fila.
- Hacer que las notificaciones del terminal se deslicen de derecha a izquierda tres veces y desaparezcan.

### Cambios
- El header superior paso de dos filas a una sola fila compacta.
- `PIREPIRAPP`, version visible y terminal quedan alineados horizontalmente.
- El terminal queda como ranura de comando con prompt `>`.
- Los avisos usan animacion `terminalNoticeSlide` con tres repeticiones.
- Al terminar la animacion, el texto del aviso se limpia y queda solo el terminal vacio.
- Se subio version visible a `v3.12` y service worker a `finanzas-lcd-v120`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\app.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `v=3.11`, `v3.11` y `finanzas-lcd-v119`: sin resultados.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-27 - Legibilidad etiquetas de gastos v3.13

### Objetivo
- Corregir la etiqueta compacta bajo el motivo de cada gasto, que quedaba ilegible por bajo contraste.

### Cambios
- La etiqueta de tipo de movimiento pasa a fondo LCD claro con texto negro.
- Se aumento levemente el tamano y padding de la etiqueta.
- Se reforzo borde/sombra para mantener estetica pixelada sin oscurecer el texto.
- Se subio version visible a `v3.13` y service worker a `finanzas-lcd-v121`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `v=3.12`, `v3.12` y `finanzas-lcd-v120`: sin resultados.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-27 - Redisenar filtro de meses v3.14

### Objetivo
- Corregir el filtro de meses por intervalo `Desde / Hasta`, que se veia feo e incomodo de usar.

### Cambios
- Se reemplazaron los campos nativos `type="month"` por selectores LCD con los meses disponibles.
- El intervalo ahora se muestra en filas completas `Desde` y `Hasta`, sin quedar comprimido.
- Se ajustaron estilos responsive para que el control sea usable en pantallas chicas.
- Se subio version visible a `v3.14` y service worker a `finanzas-lcd-v122`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\forms.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `v=3.13`, `v3.13` y `finanzas-lcd-v121`: sin resultados.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-27 - Sincronizar menu inferior con pestanas v3.15

### Objetivo
- Hacer que la ventanita abierta desde el boton inferior sea consistente al cambiar de pestana.

### Cambios
- Si el menu de accion esta abierto y se cambia a `Gastos`, se reemplaza por el menu `FILTRAR`.
- Si el menu de accion esta abierto y se cambia a `Metas`, se reemplaza por el menu de agregar metas/wishlist/ahorro.
- Si el menu de accion esta abierto y se cambia a `Resumen`, se reemplaza por el menu de ingreso/gasto.
- Si el menu de accion esta abierto y se cambia a `Config`, se cierra.
- Se subio version visible a `v3.15` y service worker a `finanzas-lcd-v123`.

### Verificacion
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `node --check frontend\scripts\forms.js`: OK.
- `node --check frontend\scripts\router.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda activa en `frontend` de `v=3.14`, `v3.14` y `finanzas-lcd-v122`: sin resultados.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-27 - Previsualizaciones particion sueldo

### Objetivo
- Explorar reemplazos visuales para el grafico de torta de `Particion sueldo` antes de implementarlo en la app principal.

### Cambios
- Se creo `frontend/previews/particion.html` como laboratorio independiente.
- Se agregaron tres alternativas: barra LCD segmentada, gauge de distribucion y ledger proporcional.
- Cada alternativa permite ver desglose granular de gastos fijos y ahorros/metas.
- Se agregaron escenarios de prueba: base, fijos altos y exceso.
- No se reemplazo todavia la torta actual en `Resumen`; queda pendiente elegir una direccion visual.

### Verificacion
- `node --check frontend\previews\particion.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-27 - Nuevos paradigmas visuales de sueldo

### Objetivo
- Probar paradigmas de clasificacion de sueldo distintos a los graficos proporcionales iniciales.

### Cambios
- Se amplio `frontend/previews/particion.html` con un texto de laboratorio para comparar modelos mentales.
- Se agregaron tres paradigmas nuevos:
  - `D` Sobres de sueldo: cajones mentales obligatorio/construccion/libre/exceso.
  - `E` Flujo de sueldo: corriente desde ingreso hacia destinos.
  - `F` Mapa compromiso-tiempo: clasificacion por obligacion y horizonte temporal.
- Se conservaron los escenarios base, fijos altos y exceso.
- No se reemplazo todavia la torta de la app principal.

### Verificacion
- `node --check frontend\previews\particion.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-27 - Rehacer laboratorio sueldo 100 desagregado

### Objetivo
- Corregir el laboratorio visual porque no capturaba la idea central: cuanto del sueldo queda dedicado a cada cosa.

### Cambios
- Se reemplazo el enfoque de paradigmas abstractos por tres vistas centradas en `sueldo = 100%`.
- Nueva vista `A`: regla horizontal donde cada componente ocupa su tramo proporcional del sueldo.
- Nueva vista `B`: mapa de 100 casillas, donde cada casilla representa cerca de 1% del sueldo.
- Nueva vista `C`: desglose jerarquico con grupos y componentes visibles.
- Se agrego selector `DESAGREGADO / MACRO`; por defecto abre en desagregado.
- Gastos fijos y ahorros/metas se muestran en sus componentes individuales.
- La app principal sigue intacta; solo cambia el laboratorio `frontend/previews/particion.html`.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-27 - Explorar torta y mapa 100 con tramas

### Objetivo
- Explorar enfoques de torta y mapa 100 que no dependan tanto de una paleta de colores limitada.

### Cambios
- El laboratorio ahora muestra seis opciones:
  - `A` Torta con callouts e indice lateral.
  - `B` Torta anillada con centro limpio y tramas.
  - `C` Doble anillo: categorias internas y componentes externos.
  - `D` Mapa 100 serpiente.
  - `E` Mapa 100 por bandas/familias.
  - `F` Mapa 100 compacto por bloques proporcionales.
- Se agregaron patrones visuales: diagonales, verticales, puntos, cruz, horizontales y grilla.
- Se conserva el selector `DESAGREGADO / MACRO`.
- La app principal sigue intacta; solo cambia el laboratorio de preview.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.

## 2026-06-27 - Variaciones stacked bar 100

### Objetivo
- Concentrar el laboratorio visual en barras apiladas 100% para representar la particion del sueldo.

### Cambios
- Se reemplazo la salida visible de tortas/mapas por seis variantes de `100 percent stacked bar chart`.
- Nuevas opciones:
  - `A` Barra 100 principal, con selector macro/desagregado.
  - `B` Doble nivel: macro arriba, componentes abajo.
  - `C` Filas por familia, con cada grupo medido contra el sueldo.
  - `D` Barra + ranking ordenado por monto.
  - `E` Version compacta candidata para tarjeta de resumen.
  - `F` Umbral de sueldo para ver sobreasignacion/exceso.
- Se reforzaron tramas, etiquetas y lectura proporcional sin depender solo del color.
- La app principal sigue intacta; solo cambia el laboratorio de preview.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-27 - Doble nivel dinamico para sueldo

### Objetivo
- Profundizar la opcion `B` de doble nivel con formas interactivas de revelar el desagregado.

### Cambios
- El laboratorio `frontend/previews/particion.html` ahora presenta `DOBLE NIVEL`.
- Se reemplazo la grilla visible por seis pruebas interactivas:
  - `B1` Drill alineado: tocar una familia revela sus componentes justo debajo.
  - `B2` Expansion en sitio: el tramo seleccionado se abre internamente.
  - `B3` Lupa inferior: la barra macro queda fija y cambia la lupa.
  - `B4` Acordeon tactil: cada familia abre su banda de componentes.
  - `B5` Secuencia guiada: recorre familias con controles anterior/siguiente.
  - `B6` Bandeja inspectora: la bandeja inferior cambia sin mover la barra.
- El selector `ABIERTO / COMPACTO` permite comparar etiquetas completas contra lectura reducida.
- La app principal sigue intacta; solo cambia el laboratorio de preview.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Render smoke con DOM minimo en Node: OK, genera `Drill alineado` y `Bandeja inspectora`.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-27 - B1 desagregado en sitio

### Objetivo
- Refinar la opcion preferida `B1` para que el desagregado aparezca dentro del mismo tramo tocado.

### Cambios
- El laboratorio ahora queda enfocado en una sola tarjeta `B1 EN SITIO`.
- Al tocar `Gastos fijos`, `Ahorros/metas`, `Disponible` o `Exceso`, ese tramo se parte internamente en sus componentes.
- Se quitaron las tramas diferentes de la vista visible B1.
- La distincion visual pasa a numeros, leyenda y porcentajes siempre visibles.
- El modo `LEYENDA / LIMPIO` mantiene porcentajes; `LIMPIO` oculta montos para comparar una lectura mas despejada.
- La app principal sigue intacta; solo cambia el laboratorio de preview.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Render smoke con DOM minimo en Node: OK, genera `Desagrega en el mismo tramo`, no renderiza `Drill alineado`, mantiene `b1-subbar` y porcentajes.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - B1 particion dentro del rectangulo

### Objetivo
- Corregir la interpretacion de B1: al tocar `Gastos fijos` o cualquier familia, la desagregacion debe revelarse dentro del mismo rectangulo completo, no como cabecera mas subbarra ni como tarjeta incrustada.

### Cambios
- El tramo activo de B1 ahora se reemplaza por sus componentes internos ocupando toda la altura del rectangulo.
- Se elimino la cabecera interna `b1-expanded-head` y la subbarra `b1-subbar`.
- Los componentes se distinguen por numero, porcentaje permanente, divisores y leyenda inferior; no se usan texturas diferentes.
- La leyenda conserva el nombre, categoria, porcentaje y monto del componente seleccionado.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Render smoke con DOM minimo en Node: OK, `hasChild=true`, `hasSubbar=false`, `hasExpandedHead=false`, `activeInsideSameSegment=true`, `hasPct=true`.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - B1 leader lines y ahorro jerarquico

### Objetivo
- Refinar la opcion B1 para que no use numeros ni leyendas inferiores.
- Al tocar `Ahorros/metas`, revelar primero `Ahorros` y `Metas`; al tocar `Metas`, revelar otra vez dentro del mismo rectangulo las metas concretas junto con `Futuro`.

### Cambios
- B1 ahora usa leader lines: lineas verticales que salen de cada porcion y giran horizontalmente hacia la etiqueta.
- Las etiquetas muestran nombre, porcentaje permanente y monto en modo `LEYENDA`; el modo `LIMPIO` oculta el monto.
- Se elimino el render de `b1-readout`, `b1-legend` y `b1-macro-legend`.
- Se agrego estado de segundo nivel para `Ahorros/metas`: `summary` y `metas`.
- Se actualizo el texto del laboratorio para describir el desglose jerarquico.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Render smoke con DOM minimo en Node: OK, `baseHasLeader=true`, `savingHasAhorros=true`, `savingHasMetas=true`, `savingHasDrill=true`, `metasHasIMPA=true`, `metasHasViaje=true`, `metasHasFuture=true`, `hasBottomLegend=false`.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - B1 callouts y colapso tactil

### Objetivo
- Rehacer las lineas de B1 como callouts legibles: punto de anclaje, diagonal y tramo horizontal.
- Mantener el porcentaje visible dentro de cada rectangulo.
- Permitir colapsar niveles tocando de nuevo o tocando afuera.

### Cambios
- Las lineas de B1 ahora usan circulo de origen, diagonal y tramo horizontal hacia la etiqueta.
- Cada porcion muestra una chapita interna `b1-inside-pct` con porcentaje permanente.
- `Gastos fijos`, que solo tiene un nivel, se vuelve a agregar si se toca adentro o afuera.
- En `Ahorros/metas`, tocar `Metas` abre el ultimo nivel; tocar una meta concreta vuelve a agregar todo a `Ahorros/metas`.
- Tocar afuera de un tramo abierto vuelve a la vista macro.
- `Exceso` ahora se muestra como una porcion propia en rojo apagado compatible con la paleta.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Render smoke con DOM minimo en Node: OK, `fixedClosed=true`, `fixedOpen=true`, `savingDetail=true`, `savingCollapsed=true`, `outsideCollapsed=true`, `insidePct=true`, `leaderCircle=true`.
- Render smoke escenario `EXCESO`: OK, `hasMutedRed=true`, `closedHasExcess=true`, `excessOpen=true`, `excessClosed=true`.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - B1 cascada superior e inferior

### Objetivo
- Ajustar la maqueta B1 al esquema visual de viga central: gastos fijos se desagregan hacia arriba, ahorros/metas hacia abajo, y `Disponible` queda como tramo estable sin apertura.

### Cambios
- Los callouts de hijos de `Gastos fijos` ahora se fuerzan hacia arriba y en cascada.
- Los callouts de `Ahorros/metas`, incluyendo el segundo nivel de metas concretas, se fuerzan hacia abajo y en cascada.
- Las diagonales de los callouts se alargan segun el nivel para que el punto, la diagonal y el tramo horizontal se mantengan conectados.
- `Disponible` deja de renderizarse como boton en B1 y queda como porcion estatica con porcentaje interno.
- Se actualizo el texto del laboratorio para explicar la cascada superior/inferior.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Render smoke con DOM minimo en Node: OK, `fixed_initial_top_cascade`, `available_static`, `saving_summary_bottom_cascade`, `saving_detail_bottom_cascade`, `available_does_not_open`.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - B1 alineacion fina y multiapertura

### Objetivo
- Ajustar la cascada B1 luego de revision visual: eliminar el circulo, agrandar porcentajes internos, alinear lineas desde el centro real de cada tramo y permitir que varios grupos queden abiertos a la vez.

### Cambios
- Se elimino el circulo de origen de los callouts; la diagonal ahora nace directamente desde el centro del tramo o subtramo.
- La etiqueta de callout se simplifico a una sola tira horizontal: nombre, porcentaje y monto en una linea.
- La cascada superior de gastos fijos se invirtio para que el item mas a la izquierda quede mas alto.
- El porcentaje interno del rectangulo se agrando para mejorar lectura.
- B1 ahora guarda multiples grupos abiertos en paralelo; abrir `Ahorros/metas` ya no contrae `Gastos fijos`.
- Tocar una subporcion de una familia abierta cierra solo esa familia, no todas las demas.
- Tocar `Disponible` no abre ni cierra otros grupos.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Render smoke con DOM minimo en Node: OK, `initial_fixed_open`, `leader_has_no_circle_tag`, `leader_uses_single_text_strip`, `fixed_leftmost_highest`, `pct_is_larger`, `fixed_stays_open_when_saving_opens`, `saving_detail_keeps_fixed_open`, `available_does_not_close_others`, `closing_fixed_keeps_saving_open`.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - B1 ajuste de escala de callouts

### Objetivo
- Corregir la lectura visual de B1: el texto de callouts se veia desproporcionado y `Disponible` competia visualmente con los callouts superiores de gastos fijos.

### Cambios
- La etiqueta del callout ahora se renderiza como una sola cadena uniforme: nombre, porcentaje y monto con la misma escala.
- Se eliminaron reglas CSS heredadas para `strong/span/em` dentro de los callouts que pisaban el estilo de la tira principal.
- La cascada inferior de `Ahorros/metas` se invirtio para que el item inferior mas a la izquierda sea el mas largo.
- `Disponible` ahora orienta su callout hacia abajo/derecha para no chocar con `Gastos fijos`.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Render smoke con DOM minimo en Node: OK, `callout_single_text`, `callout_no_inner_title_markup`, `available_bottom_right`, `leader_text_scale_uniform`, `saving_bottom_left_longest`, `saving_detail_bottom_left_longest`.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - B1 integrado en Resumen v3.16

### Objetivo
- Probar la vista B1 dentro de la app real para evaluar si el enfoque funciona en la tarjeta de `PARTICION SUELDO` o queda demasiado pequeno.

### Cambios
- La tarjeta `PARTICION SUELDO` del Resumen ahora renderiza la barra B1 integrada en lugar de la torta 3D.
- La vista B1 se alimenta con datos reales: gastos fijos de Configuracion, ahorros futuro, metas, disponible y exceso.
- `Gastos fijos` y `Ahorros/metas` quedan abiertos por defecto para probar la lectura en el espacio real de la app.
- Se agrego interaccion local para abrir/cerrar familias y desagregar `Metas` sin modificar datos.
- Se agregaron estilos `salary-b1-*` propios para no mezclar la app principal con el laboratorio de preview.
- Se actualizo cache/version de `v3.15` a `v3.16` y `finanzas-lcd-v124`.

### Verificacion
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Render smoke con DOM minimo en Node: OK, `summary_renders_b1`, `b1_opens_fixed`, `b1_opens_saving`, `b1_has_available_static`, `b1_has_real_labels`, `partition_card_no_pie_stage`, `version_bumped`.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.
