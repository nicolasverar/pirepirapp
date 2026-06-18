# Bitacora - Pirepirapp

## 2026-06-16 - Ajuste visual de tarjetas y progreso

### Objetivo
- Corregir el espaciado visual de la seccion `Cosas que quiero`.
- Mantener tarjetas en dos columnas con contenido legible dentro de cada tarjeta.
- Retirar brillo/particulas, aves y efecto liquido.

### Consulta inicial
- `README.md`
- `docs/DESPLIEGUE.md`
- `docs/INSTALACION.md`
- `docs/PRUEBAS.md`
- `.gitignore`
- `backend/.clasp.json`
- `backend/.claspignore`
- `backend/appsscript.json`
- `frontend/index.html`
- `frontend/manifest.json`
- `frontend/service-worker.js`
- `frontend/scripts/config.js`
- `Manual maestro para creacion de appweb.txt`

No se encontro un `AGENTS.md` fisico en el repositorio o carpeta padre. Se aplicaron las instrucciones pegadas por el usuario en la sesion. Al inicio no se encontro `Manual maestro para creacion de appweb.txt` en la raiz de `C:\`; luego aparecio una copia sin versionar en la raiz del repositorio y fue consultada.

### Cambios
- `frontend/scripts/render.js`: se quitaron aves, particulas de brillo y medidor liquido. Se agrego una barra de progreso estatica.
- `frontend/styles/main.css`: se redujo el brillo de fondo, se reemplazo el estilo liquido por barra de progreso y se rehizo `Cosas que quiero` como tarjetas apiladas en dos columnas.
- `frontend/styles/responsive.css`: se ajusto el breakpoint angosto para mantener dos columnas sin comprimir imagen y texto en la misma fila.
- `frontend/index.html`: version de recursos subida a `v2.11`.
- `frontend/scripts/config.js`: `APP_VERSION` subida a `v2.11`.
- `frontend/service-worker.js`: cache subida a `finanzas-lcd-v19` y assets con query `v2.11`.
- `BITACORA.md`: creada para trazabilidad del repo.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: creado para registrar la secuencia de prompts.

No se usaron imagenes nuevas ni los archivos graficos sueltos de la raiz; quedan pendientes de confirmacion explicita del usuario antes de usarlos.

### Verificacion
- `git status --branch --short`: revisado al inicio y antes del cierre.
- `node --check` sobre `frontend/scripts/*.js`, `frontend/service-worker.js` y `backend/*.js`: sin errores.
- Busqueda `rg` de referencias viejas en frontend (`liquid`, `bird`, `wish-spark`, `v2.10`, cache anterior): sin resultados en frontend.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: todos los archivos existen.
- Servidor local iniciado en `http://127.0.0.1:4173`; `index.html` responde `200` y contiene `v2.11`.
- Push a `origin/main`: commit `80fae38`.
- Verificacion publica en `https://nicolasverar.github.io/pirepirapp/`: `index.html`, `scripts/config.js` y `service-worker.js` sirven `v2.11` / `finanzas-lcd-v19`.

### Pendientes
- No se pudo tomar screenshot automatico porque no hay Playwright ni navegador disponible en PATH.
- Revisar visualmente en el dispositivo final y usar `Actualizar app` para limpiar cache si ya estaba instalada.

## 2026-06-16 - Brillos P3 y guardado inmediato

### Objetivo
- Implementar la seleccion del usuario: B2 con brillos puntiagudos, P3 para pajaros y sin liquido.
- Hacer que guardados y conversion de `Cosas que quiero` a meta se reflejen mas rapido en pantalla.

### Cambios
- `frontend/scripts/render.js`: se agrego la bandada minima P3 en `EL FUTURO` y la capa de brillos puntiagudos B2 en tarjetas de wishlist.
- `frontend/styles/main.css`: se diseno el brillo como estrella/punta fina y se definio la animacion lenta de pajaros. No se reintrodujo ningun efecto liquido.
- `frontend/styles/responsive.css`: se ocultaron animaciones de pajaros/brillos cuando el sistema pide movimiento reducido.
- `frontend/scripts/app.js`: se aplica en memoria el resultado de `create/update/delete` de movimientos, ahorros, metas, wishlist y `convertWishlistToGoal` apenas responde la mutacion; el `refresh` posterior queda silencioso.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.12` y cache a `finanzas-lcd-v20`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registraron los prompts nuevos.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`, `frontend/service-worker.js` y `backend/*.js`: sin errores.
- Busqueda `rg` en `frontend` de `liquid`, `v2.11` y `finanzas-lcd-v19`: sin resultados.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: todos los archivos existen.
- `git diff --check`: sin errores, solo avisos de fin de linea CRLF esperados en Windows.
- Servidor local `http://127.0.0.1:4173`: `index.html` responde `200` y contiene `v2.12`.
- Push a `origin/main`: commit `e2e1b7f`.
- Verificacion publica en `https://nicolasverar.github.io/pirepirapp/`: `index.html`, `scripts/config.js` y `service-worker.js` sirven `v2.12` / `finanzas-lcd-v20`.

### Pendientes
- Revisar visualmente en el celular instalado y tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-18 - Resumen inmediato tras cargar gastos

### Objetivo
- Hacer que un gasto nuevo actualice de inmediato el total gastado del mes, actividad reciente y porcentaje disponible.
- Evitar que un refresh silencioso con lectura atrasada de Sheets borre de la UI el movimiento recien guardado.

### Cambios
- `frontend/scripts/app.js`: se agrego alta/edicion/baja optimista de movimientos, recalculo local de resumen mensual y proteccion temporal contra bootstrap viejo.
- `backend/MovementService.js`: se fuerza `SpreadsheetApp.flush()` antes de calcular el resumen devuelto por create/update/delete.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.23` y cache a `finanzas-lcd-v31`.
- `README.md` y `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: documentacion actualizada.

### Verificacion
- `node --check` sobre `backend/*.js`, `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Validacion de assets de `frontend/service-worker.js`: 23 assets, cache `finanzas-lcd-v31`.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.23`, `APP_VERSION: 'v2.23'`, `finanzas-lcd-v31`, `app.js?v=2.23` y `render.js?v=2.23`.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.

### Despliegue
- Commit principal: `10ce175` (`Actualizar resumen al guardar movimientos`) subido a `origin/main`.
- `clasp push`: 13 archivos backend publicados.
- `clasp version "Pirepirapp v2.23 resumen inmediato movimientos"`: version `21`.
- `clasp redeploy AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu --versionNumber 21`: redeploy publico `@21`.
- Ping backend publico: `{"ok":true}`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.23` sirve `v2.23`, `APP_VERSION: 'v2.23'`, `finanzas-lcd-v31`, `app.js?v=2.23` y `render.js?v=2.23`.

### Pendientes
- Verificar en el celular instalado despues de tocar `Actualizar app`.

## 2026-06-18 - Pixel art de aves, nubes e icono ampliado

### Objetivo
- Lograr que las aves de `EL FUTURO` se lean como aves y no como siluetas abstractas.
- Hacer que las nubes se lean como nubes pixel art, no como humo.
- Agrandar el icono de la app y reducir el fondo libre dentro del marco.

### Cambios
- `frontend/styles/main.css`: se redibujaron nubes con base plana, borde definido y relleno LCD; se redibujaron aves con cuerpo, cabeza, pico, cola y alas animadas.
- `frontend/styles/responsive.css`: se agrandaron los iconos de navegacion en mobile manteniendo la barra estable.
- `frontend/icons/icon-192.png` y `frontend/icons/icon-512.png`: regenerados desde `icono.jpeg` con recorte mas cerrado.
- `frontend/scripts/app.js`: se declaro `movementSyncGuards`, faltante del flujo de proteccion de movimientos recientes.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.24` y cache a `finanzas-lcd-v32`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompt registrado.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`, `backend/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Validacion de assets de `frontend/service-worker.js`: 23 assets, cache `finanzas-lcd-v32`.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.24`, `APP_VERSION: 'v2.24'`, `finanzas-lcd-v32`, `app.js?v=2.24` y `main.css?v=2.24`.
- PNGs de icono validados: `icon-192.png` mide `192x192`; `icon-512.png` mide `512x512`.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.

### Despliegue
- Commit principal: `d991713` (`Redibujar escena futuro e icono`) subido a `origin/main`.
- No hubo cambios de backend; no se ejecuto `clasp redeploy`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.24` sirve `v2.24`, `APP_VERSION: 'v2.24'`, `finanzas-lcd-v32`, `app.js?v=2.24` y `main.css?v=2.24`.
- Iconos publicos verificados: `icon-192.png` mide `192x192` y pesa `69856` bytes; `icon-512.png` mide `512x512` y pesa `387214` bytes.

### Pendientes
- Verificar visualmente en el celular instalado despues de tocar `Actualizar app`.

## 2026-06-18 - Rediseño de tarjetas del resumen

### Objetivo
- Renderizar la fecha principal con estetica LCD pixel siguiendo `fecprincipal.png`.
- Rehacer la tarjeta `Gastaste mas en` sin el fondo anterior, usando un recuadro delineado.
- Mantener intacta la tarjeta `Disponible`.
- Reemplazar la barra de particion de sueldo por una caja principal con subcajas proporcionales inspirada en `particionddesueldo.jpg`.

### Cambios
- `frontend/scripts/render.js`: se separo la fecha en bloque LCD, se agrego texto `Este mes gastaste`, y la particion de sueldo ahora calcula un treemap de cajas proporcionales.
- `frontend/styles/main.css`: estilos nuevos para fecha pixel, recuadro de mayor gasto y caja contenedora de sueldo con subcajas tramadas.
- `frontend/styles/responsive.css`: ajustes para fecha y treemap en pantallas angostas.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.25` y cache a `finanzas-lcd-v33`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompt registrado con rutas locales limpiadas.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`, `backend/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Validacion de assets de `frontend/service-worker.js`: 23 assets, cache `finanzas-lcd-v33`.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.25`, `APP_VERSION: 'v2.25'`, `finanzas-lcd-v33`, `render.js?v=2.25` y `main.css?v=2.25`.
- Busqueda de referencias viejas `v2.24`, `v=2.24` y `finanzas-lcd-v32`: sin resultados en archivos de version/cache.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.

### Despliegue
- Commit principal: `3c7d2b6` (`Redisenar tarjetas del resumen`) subido a `origin/main`.
- No hubo cambios de backend; no se ejecuto `clasp redeploy`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.25b` sirve `v2.25`, `APP_VERSION: 'v2.25'`, `finanzas-lcd-v33`, `render.js?v=2.25` y `main.css?v=2.25`.

### Pendientes
- Verificar visualmente en el celular instalado despues de tocar `Actualizar app`.

## 2026-06-18 - Depuracion de gastos y refinamiento UI

### Objetivo
- Corregir definitivamente que un gasto recien cargado aparezca y luego desaparezca por refresh/render posterior.
- Redisenar nubes y aves de `EL FUTURO` con formas finas, organicas y menos rigidas.
- Permitir lectura completa de titulos largos en `Cosas que quiero`.
- Hacer que el confeti de `¡Cobré!` dispare sin esperar a Sheets y tenga mas dinamica visual.

### Causa raiz
- La app ya aplicaba alta optimista para `createMovement`, pero no registraba esa alta temporal en `movementSyncGuards`.
- Si un `bootstrap` o refresh silencioso iniciado antes de guardar resolvia durante la ventana en que el movimiento tenia ID temporal, el snapshot viejo de Sheets reemplazaba la lista local y quitaba el gasto del DOM.
- La proteccion existente empezaba para movimientos confirmados o eliminados, pero no para creaciones pendientes.

### Cambios
- `frontend/scripts/app.js`: se agrego guard para creaciones optimistas, limpieza al recibir el ID real, orden deterministico por fecha/hora/modificacion/id y confeti inmediato tras confirmar `¡Cobré!`.
- `frontend/styles/main.css`: confeti con particulas fluidas, tamanos variables y caida con transform GPU; nubes/aves pasan a formas organicas de lineas suaves.
- `frontend/styles/main.css`: `Cosas que quiero` ya no recorta el titulo a dos lineas y deja que la tarjeta crezca manteniendo grilla simetrica por fila.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.26` y cache a `finanzas-lcd-v34`.
- `README.md` y `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: documentacion actualizada.

### Verificacion
- `node --check` sobre `backend/*.js`, `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json` y `backend/appsscript.json`: manifiestos OK.
- Validacion de assets de `frontend/service-worker.js`: 23 assets, cache `finanzas-lcd-v34`.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.26`, `APP_VERSION: 'v2.26'`, `finanzas-lcd-v34`, `app.js?v=2.26` y `main.css?v=2.26`.
- Busqueda de referencias viejas `v2.25`, `v=2.25` y `finanzas-lcd-v33`: sin resultados en archivos de version/cache.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.

### Despliegue
- Commit principal: `1b5eca9` (`Depurar gastos y refinar UI`) subido a `origin/main`.
- No hubo cambios de backend; no se ejecuto `clasp redeploy`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.26` sirve `v2.26`, `APP_VERSION: 'v2.26'`, `finanzas-lcd-v34`, `app.js?v=2.26` y `main.css?v=2.26`.

### Pendientes
- Verificar visualmente en el celular instalado despues de tocar `Actualizar app`.

## 2026-06-18 - Fijos automaticos e icono cerrado

### Objetivo
- Redibujar aves y nubes de `EL FUTURO` para que sean mas reconocibles.
- Reducir el espacio libre del icono PWA.
- Hacer que `Disponible` use sueldo menos gastos fijos configurados.
- Evitar que los gastos fijos se carguen manualmente o dominen `Gastaste mas en`, pero que queden guardados y visibles en `Gastos`.

### Cambios
- `frontend/styles/main.css`: nubes con base/contorno definido y aves con cuerpo, cabeza/pico, cola y alas solidas animadas.
- `frontend/icons/icon-192.png` y `frontend/icons/icon-512.png`: regenerados desde `icono.jpeg` con recorte mas cerrado.
- `frontend/scripts/forms.js` y `frontend/scripts/render.js`: se quito la carga manual visible de `Gasto fijo` desde el menu y la pestaña `Gastos`.
- `frontend/scripts/app.js` y `frontend/scripts/utils.js`: se agrego sincronizacion automatica de gastos fijos del mes, exclusion de fijos del ranking y calculo local de disponible desde sueldo menos fijos.
- `backend/MovementService.js`, `backend/Router.js` y `backend/SummaryService.js`: nueva accion `syncFixedExpenses`, resumen backend coherente y exclusion de fijos de `Gastaste mas en`.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.27` y cache a `finanzas-lcd-v35`.
- `README.md` y `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: documentacion actualizada.

### Verificacion
- `node --check` sobre `backend/*.js`, `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json` y `backend/appsscript.json`: manifiestos OK.
- PNGs de icono validados: `icon-192.png` mide `192x192`; `icon-512.png` mide `512x512`.
- Validacion de assets de `frontend/service-worker.js`: 23 assets, cache `finanzas-lcd-v35`.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.27`, `APP_VERSION: 'v2.27'`, `finanzas-lcd-v35`, `app.js?v=2.27` y `main.css?v=2.27`.
- Busqueda de referencias viejas `v2.26`, `v=2.26` y `finanzas-lcd-v34`: sin resultados en archivos de version/cache.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.

### Pendientes
- Commitear, desplegar backend con `clasp`, publicar GitHub Pages y verificar URL publica.

## 2026-06-17 - Gastos visibles, wishlist compacta y pixel art definido

### Objetivo
- Hacer mas definidas las nubes y aves de `EL FUTURO`.
- Aclarar el campo de destino en el formulario de movimientos.
- Corregir que el resumen y la seccion `Gastos` no reflejen bien los movimientos guardados en Drive/Sheets.
- Eliminar descripciones normales de `Cosas que quiero`, dejar comentario solo al convertir a meta, agregar orden menor/mayor y compactar tarjetas.

### Cambios
- `frontend/scripts/render.js`: gastos ahora muestra todos los movimientos disponibles, con filas de monto/titulo estables; wishlist elimina la descripcion visible, agrega orden `MENOR/MAYOR` por costo y renderiza nubes/aves mas definidas.
- `frontend/scripts/forms.js`: el campo `Relacionado` se reemplazo por destino contextual (`Ahorro destino`, `Meta destino`, `Cosa que quiero`); wishlist ya no permite descripcion normal y la conversion a meta permite `Comentario para la meta`.
- `frontend/scripts/app.js`: la actualizacion local de movimientos mantiene visible el registro nuevo cuando la vista trae todos los meses y solo refresca el resumen si corresponde al mes activo.
- `frontend/scripts/state.js`: se agrego estado `wishlistSort`.
- `frontend/styles/main.css` y `frontend/styles/responsive.css`: se ajustaron filas de gastos, tarjetas compactas de wishlist, controles de orden, nubes pixel art y aves con mas definicion.
- `backend/MovementService.js` y `backend/SummaryService.js`: el bootstrap carga todos los movimientos y el resumen conserva el calculo mensual; actividad reciente ahora trae 5 items para que aparezca el desvanecido.
- `backend/GoalService.js` y `backend/Validation.js`: wishlist no guarda ni expone descripcion normal; la descripcion de meta convertida sale solo del comentario de conversion.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.15` y cache a `finanzas-lcd-v23`.
- `README.md` y `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se documento el flujo nuevo y los prompts.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`, `frontend/service-worker.js` y `backend/*.js`: sin errores.
- `rg` en `frontend` de `v2.14`, `finanzas-lcd-v22`, `wish-info p`, `Compra wishlist`, `select('Relacionado'` y `No hay movimientos para este mes`: sin resultados.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: 25 assets, sin faltantes.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.
- Servidor local `http://127.0.0.1:4173`: responde `200` y sirve `v2.15` / `finanzas-lcd-v23`.
- `clasp push`: subio 13 archivos del backend.
- `clasp version "Pirepirapp v2.15 gastos y wishlist"`: creo version 14.
- `clasp redeploy AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu --versionNumber 14 --description "Pirepirapp v2.15 gastos y wishlist"`: Web App redeployado.
- `Invoke-WebRequest` a `https://script.google.com/macros/s/AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu/exec?action=ping`: `200 OK`.
- Commit `9de5c1c` (`Corregir gastos y compactar wishlist`) y push a `origin/main`.
- Verificacion publica en `https://nicolasverar.github.io/pirepirapp/`: `index.html`, `scripts/config.js` y `service-worker.js` sirven `v2.15` / `finanzas-lcd-v23`.

### Pendientes
- Revisar visualmente en el celular instalado y tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-17 - Resumen global, fecha española e icono v2.16

### Objetivo
- Hacer nubes y aves aun mas definidas, con lectura tipo pixel/32-bit.
- Lograr que la tabla del resumen muestre actividad aunque el mes activo no tenga movimientos.
- Mostrar fecha/hora de gastos en formato español tipo `LUN 07/MAYO/2026 15:45`.
- Cambiar el icono de la PWA usando `icono.jpeg`.

### Cambios
- `backend/SummaryService.js`: `actividadReciente` del resumen ahora se toma de todos los movimientos disponibles, no solo del mes activo.
- `frontend/scripts/utils.js`: se agrego `formatMovementDateTime` para fechas tipo `JUE 07/MAYO/2026 15:45`.
- `frontend/scripts/render.js`: resumen usa movimientos globales como respaldo si no hay actividad reciente; `Gastos totales` muestra fecha/hora en español; nubes y aves tienen mas piezas pixeladas.
- `frontend/styles/main.css`: se aumento el detalle visual de nubes y aves con bloques tipo sprite.
- `frontend/icons/icon-192.png` y `frontend/icons/icon-512.png`: regenerados desde `icono.jpeg`.
- `frontend/index.html`, `frontend/manifest.json` y `frontend/service-worker.js`: el icono apunta a PNG y se retiraron referencias de iconos SVG del manifest/cache.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.16` y cache a `finanzas-lcd-v24`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registraron los prompts nuevos.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`, `frontend/service-worker.js` y `backend/*.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest ok`.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: 23 assets, sin faltantes.
- `rg` en `frontend` de `v2.15`, `finanzas-lcd-v23`, `icon-192.svg` e `icon-512.svg`: sin referencias activas.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.16`, `finanzas-lcd-v24` y `icon-192.png`.
- `node -e` para `formatMovementDateTime('2026-05-07','15:45:00')`: `JUE 07/MAYO/2026 15:45`.
- `magick identify`: `icon-192.png` mide `192x192`; `icon-512.png` mide `512x512`.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.
- `clasp push`: subio 13 archivos del backend.
- `clasp version "Pirepirapp v2.16 resumen e icono"`: creo version 15.
- `clasp redeploy AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu --versionNumber 15 --description "Pirepirapp v2.16 resumen e icono"`: Web App redeployado.
- `Invoke-WebRequest` a `https://script.google.com/macros/s/AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu/exec?action=ping`: `200 OK`.
- Commit `48bcbf3` (`Ajustar resumen fecha icono y pixel art`) y push a `origin/main`.
- Verificacion publica en `https://nicolasverar.github.io/pirepirapp/`: `index.html`, `scripts/config.js`, `service-worker.js`, `manifest.json` e `icons/icon-192.png` sirven `v2.16` / `finanzas-lcd-v24`, manifest solo usa PNG y el icono responde `200`.

### Pendientes
- Revisar visualmente en el celular instalado y tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-17 - Mes actual coherente y total mensual v2.17

### Objetivo
- Corregir que `este mes gastaste` no muestre el total real del mes calendario actual.
- Evitar que un gasto con fecha del mes actual quede guardado o resumido bajo un mes anterior.
- Cambiar el flujo de `Iniciar mes` para que sincronice con el mes calendario actual.

### Cambios
- `backend/SpreadsheetService.js`: `ensureCurrentCalendarPeriod_` ahora corrige `mesActual` aunque la marca interna del mes ya exista, evitando que quede atrasado.
- `backend/SummaryService.js`: el resumen mensual suma los movimientos por la fecha real (`Fecha`) del registro; si la columna `Mes` quedo vieja, el gasto igual cuenta en el mes calendario correcto.
- `backend/Validation.js`: los movimientos derivan `Mes` desde `Fecha`; se ignoran meses forzados que lleguen desde clientes cacheados.
- `backend/AppClient.html`: se reemplazo `Iniciar mes` por `Sincronizar mes actual` y se usa siempre el mes calendario actual.
- `frontend/scripts/forms.js`: ya no envia `payload.mes`; la fecha elegida determina el mes del gasto.
- `frontend/scripts/app.js`: al guardar un movimiento, el resumen devuelto por backend actualiza tambien `mesActual` en memoria.
- `frontend/scripts/render.js`: el resumen dice `este mes gastaste`; `Gastos` y `Config` muestran `Mes actual`; el boton sincroniza con el mes calendario actual.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.17` y cache a `finanzas-lcd-v25`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt nuevo.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`, `frontend/service-worker.js` y `backend/*.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest ok`.
- Validacion de assets de `frontend/service-worker.js`: 23 assets, sin faltantes.
- `rg` en `frontend backend` de `payload.mes`, `Iniciar mes`, `Mes activo`, `v2.16` y `finanzas-lcd-v24`: sin usos activos en frontend; solo quedan descripciones tecnicas internas de config en backend.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.17`, `APP_VERSION: 'v2.17'`, `finanzas-lcd-v25` y `forms.js?v=2.17`.
- `clasp push`: subio 13 archivos del backend.
- `clasp version "Pirepirapp v2.17 mes actual coherente"`: creo version 16.
- `clasp redeploy AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu --versionNumber 16 --description "Pirepirapp v2.17 mes actual coherente"`: Web App redeployado.
- `Invoke-WebRequest` a `https://script.google.com/macros/s/AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu/exec?action=ping`: `200 OK`.
- Commit `ab41ce0` (`Corregir total del mes actual`) y push a `origin/main`.
- Verificacion publica en `https://nicolasverar.github.io/pirepirapp/`: `index.html`, `scripts/config.js` y `service-worker.js` sirven `v2.17` / `finanzas-lcd-v25`.

### Pendientes
- Revisar visualmente en el celular instalado y tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-18 - Hardening de autenticacion y limpieza de docs

### Objetivo
- Agregar rate limiting simulado por IP para fallos de autenticacion.
- Reemplazar comparacion directa de token por comparacion timing-safe.
- Evitar que `ping` exponga metadata publica.
- Limpiar rutas locales absolutas en documentacion.
- Documentar requisito minimo de entropia para `FINANZAS_API_TOKEN`.

### Cambios
- `backend/Router.js`: se agrego rate limiting simulado por IP con `CacheService.getScriptCache()` para fallos de autenticacion; se extrae IP desde headers/event.parameter/body cuando existe.
- `backend/Router.js`: `assertAuthorizedRequest_` usa mensaje generico de autenticacion y comparacion timing-safe de longitud fija mediante `timingSafeTokenEquals_`.
- `backend/Router.js`: `ping` publico sale sin wrapper y devuelve solo `{ ok: true }`.
- `backend/Code.js`: `ping()` auxiliar devuelve solo `{ ok: true }`.
- `README.md`: se agrego advertencia de que `FINANZAS_API_TOKEN` debe tener al menos 32 caracteres aleatorios y no ser predecible.
- `PROMPT_MAESTRO_CODEX_FINANZAS.md` y `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: rutas absolutas locales reemplazadas por `<ruta-local>`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt nuevo.

### Verificacion
- `node --check` sobre `backend/*.js`, `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest ok`.
- Busqueda de comparacion directa `providedToken !== configuredToken`, mensajes antiguos de token y metadata `app` en `Router.js`/`Code.js`: sin resultados.
- Busqueda de `CacheService`, `getScriptCache`, `timingSafeTokenEquals_`, `genericAuthErrorMessage_`, `registerFailedAuthAttempt_` y `requestClientIp_`: presentes en `backend/Router.js`.
- Busqueda de rutas `C:\Users\pc`, `C:/Users/pc` y `C:\` en los dos documentos solicitados: sin rutas locales absolutas.
- Busqueda en `README.md`: advertencia de `32 caracteres aleatorios`, palabra/frase/predecible y `FINANZAS_API_TOKEN` presente.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.
- `clasp push`: subio 13 archivos del backend.
- `clasp version "Pirepirapp seguridad auth rate limit"`: creo version 17.
- `clasp redeploy AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu --versionNumber 17 --description "Pirepirapp seguridad auth rate limit"`: Web App redeployado.
- `Invoke-WebRequest` a `https://script.google.com/macros/s/AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu/exec?action=ping`: devuelve `{"ok":true}`.

### Pendientes
- Sin pendientes tecnicos; revisar logs de Apps Script si se sospechan bloqueos legitimos por rate limit.

## 2026-06-18 - Borrado inmediato y compra reversible de wishlist

### Objetivo
- Hacer que al eliminar un gasto desaparezca de inmediato del panel `Gastos totales`.
- Actualizar el resumen local con mas rapidez al borrar movimientos.
- Reemplazar la idea confusa de `Destino` por una seleccion contextual.
- Si la categoria es `Cosas que quiero`, permitir seleccionar una cosa de wishlist y marcarla como comprada de forma reversible.

### Cambios
- `frontend/scripts/app.js`: se agrego borrado optimista de movimientos; al confirmar `DEL`, el item sale del estado local y el resumen se ajusta antes de esperar la respuesta de red. Si falla el backend, se revierte el estado previo.
- `frontend/scripts/app.js`: las listas globales (`ahorrosFuturo`, `metas`, `wishlist`) ahora se actualizan con el resultado del backend aunque el movimiento sea de otro mes.
- `frontend/scripts/forms.js`: el campo `Destino` se reemplazo por una seleccion contextual `Seleccionar`; si la categoria es `Cosas que quiero`, aparece `Cosa que quiero` con los items de wishlist.
- `frontend/scripts/forms.js`: si se elige una cosa de wishlist dentro de un gasto, el movimiento se envia como `Compra de wishlist`; si se cambia la categoria fuera de wishlist, vuelve a `Gasto`.
- `backend/Validation.js`: si llega un gasto con categoria `Wishlist`/`Cosas que quiero` e item relacionado, se normaliza como `Compra de wishlist`; si falta item, se rechaza con validacion.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.18` y cache a `finanzas-lcd-v26`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt nuevo.

### Verificacion
- `node --check` sobre `backend/*.js`, `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest ok`.
- Validacion de assets de `frontend/service-worker.js`: 23 assets, sin faltantes.
- Busqueda de `applyOptimisticMovementDelete`, `optimisticSummaryAfterDelete`, `relatedMode`, `isWishlistCategory`, `Elegir cosa que quiero`, `Selecciona la cosa`, `markWishlistPurchased_`, `v2.18` y `finanzas-lcd-v26`: referencias esperadas presentes.
- Busqueda en `frontend` de `v2.17`, `finanzas-lcd-v25`, `select('Destino'`, `Ahorro destino`, `Meta destino` y `return 'Destino'`: sin resultados.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.18`, `APP_VERSION: 'v2.18'`, `finanzas-lcd-v26`, `forms.js?v=2.18` y `app.js?v=2.18`.
- `clasp push`: subio 13 archivos del backend.
- `clasp version "Pirepirapp v2.18 borrado wishlist reversible"`: creo version 18.
- `clasp redeploy AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu --versionNumber 18 --description "Pirepirapp v2.18 borrado wishlist reversible"`: Web App redeployado.
- `Invoke-WebRequest` a `https://script.google.com/macros/s/AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu/exec?action=ping`: devuelve `{"ok":true}`.
- Commit `3bc14c9` (`Agilizar borrado y compra wishlist reversible`) y push a `origin/main`.
- Verificacion publica en `https://nicolasverar.github.io/pirepirapp/`: `index.html`, `scripts/config.js` y `service-worker.js` sirven `v2.18` / `finanzas-lcd-v26`; `forms.js?v=2.18` y `app.js?v=2.18` estan referenciados.

### Pendientes
- Revisar visualmente en el celular instalado y tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-18 - Legibilidad de gastos y panel inferior estable

### Objetivo
- Evitar que las tarjetas de gastos corten textos largos.
- Corregir la elevacion persistente del panel inferior despues de navegar.

### Cambios
- `frontend/styles/main.css`: el contenedor principal deja de depender de `100dvh`, elimina el padding inferior extra y bloquea overflow externo; las tarjetas de movimientos pasan a una distribucion interna en una columna con texto multilinea.
- `frontend/styles/responsive.css`: se aplica el mismo criterio de altura estable en pantallas grandes y se mantiene la tarjeta de movimientos legible en pantallas angostas.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.19` y cache a `finanzas-lcd-v27`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt nuevo.

### Verificacion
- `node --check` sobre `backend/*.js`, `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest ok`.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: 23 assets, sin faltantes.
- Busqueda en frontend activo de `v2.18`, `finanzas-lcd-v26` y `100dvh`: sin resultados.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.19`, `APP_VERSION: 'v2.19'`, `finanzas-lcd-v27` y `main.css?v=2.19`.
- Commit `9147bda` (`Mejorar legibilidad de gastos y panel inferior`) y push a `origin/main`.
- Verificacion publica en `https://nicolasverar.github.io/pirepirapp/`: `index.html`, `scripts/config.js` y `service-worker.js` sirven `v2.19` / `finanzas-lcd-v27`; `main.css?v=2.19` esta referenciado.

### Pendientes
- Verificar visualmente en el celular instalado despues de tocar `Actualizar app`.

## 2026-06-18 - Aves animadas y tarjetas de futuro

### Objetivo
- Reemplazar las aves estaticas por siluetas pixeladas animadas con aleteo y movimiento horizontal continuo, tomando `aves.jpg` como referencia visual.
- Redisenar las tarjetas de `AhorrosFuturo` para mostrar titulo, monto mensual, acumulado grande centrado y boton `Editar`.
- Agregar una preferencia frontend para ocultar o mostrar el acumulado sin modificar Sheets ni backend.

### Cambios
- `frontend/scripts/render.js`: se agregaron mas aves en la escena, se expuso un helper frontend para preferencias de futuro y se redibujo la tarjeta sin descripcion visible.
- `frontend/scripts/forms.js`: el formulario de ahorro futuro ahora incluye `Monto acumulado` y `Mostrar acumulado`, guardando la preferencia por ID en `localStorage`.
- `frontend/styles/main.css`: se reemplazo la silueta de aves por cuerpo y alas animadas con keyframes, se ajusto el vuelo horizontal y se agrego el layout nuevo de tarjetas.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.20` y cache a `finanzas-lcd-v28`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt nuevo.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest ok`.
- Validacion de assets de `frontend/service-worker.js`: 23 assets, sin faltantes.
- Busqueda en frontend de `v2.19` y `finanzas-lcd-v27`: sin referencias activas.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.20`, `APP_VERSION: 'v2.20'`, `finanzas-lcd-v28` y `render.js?v=2.20`.
- Commit `8e51e6b` (`Animar aves y redisenar tarjetas de futuro`) y push a `origin/main`.
- Verificacion publica en `https://nicolasverar.github.io/pirepirapp/`: `index.html`, `scripts/config.js` y `service-worker.js` sirven `v2.20` / `finanzas-lcd-v28`; `render.js?v=2.20` y `forms.js?v=2.20` estan referenciados.

### Pendientes
- Verificar visualmente el aleteo en el celular instalado despues de actualizar cache.

## 2026-06-18 - Configuracion automatica, sueldo y particion

### Objetivo
- Eliminar la edicion manual de mes y categorias en la PWA.
- Agregar `¡Cobré!` para registrar sueldo como ingreso directo con confeti pixel art.
- Agrupar `Gastaste mas en` por motivo similar en vez de categoria.
- Reestructurar gastos fijos y mostrar la particion del sueldo en Resumen.
- Separar carga de `Gasto fijo` y `Gasto corriente`.

### Cambios
- `frontend/scripts/render.js`: se rehizo Configuracion con sueldo y gastos fijos estructurados; se agrego particion SVG del sueldo; `Gastaste mas en` ahora agrupa por motivo con Levenshtein/trigramas y umbral 80%.
- `frontend/scripts/forms.js`: se elimino el campo visible `Categoria` del movimiento; se agrego selector de gasto fijo que precarga el formulario.
- `frontend/scripts/app.js`: se agrego `claimSalary` para registrar `Ingreso/Sueldo` con fecha/hora actual y confeti pixel art.
- `frontend/scripts/utils.js`: se agregaron helpers para normalizar gastos fijos con nombre, monto y porcentaje.
- `frontend/styles/main.css` y `frontend/styles/responsive.css`: estilos para editor de gastos fijos, particion de sueldo, boton `¡Cobré!` y confeti.
- `backend/SummaryService.js`: los movimientos `Ingreso/Sueldo` quedan registrados, pero no duplican el sueldo mensual en el resumen.
- `backend/Validation.js`: los gastos fijos conservan `nombre` y `porcentajeSueldo` dentro del JSON de configuracion sin cambiar el esquema de Sheets.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.21` y cache a `finanzas-lcd-v29`.
- `README.md` y `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: documentacion actualizada.

### Verificacion
- `node --check` sobre `backend/*.js`, `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest ok`.
- Validacion de assets de `frontend/service-worker.js`: 23 assets, sin faltantes.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.21`, `APP_VERSION: 'v2.21'`, `finanzas-lcd-v29`, `app.js?v=2.21` y `render.js?v=2.21`.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.
- Commit `c112278` (`Simplificar gastos y particion de sueldo`) y push a `origin/main`.
- `clasp push`: subio 13 archivos del backend.
- `clasp version "Pirepirapp v2.21 sueldo gastos fijos"`: creo version 19.
- `clasp redeploy AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu --versionNumber 19 --description "Pirepirapp v2.21 sueldo gastos fijos"`: Web App redeployado.
- `Invoke-WebRequest` a `https://script.google.com/macros/s/AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu/exec?action=ping`: devuelve `{"ok":true}`.
- Verificacion publica en `https://nicolasverar.github.io/pirepirapp/`: `index.html`, `scripts/config.js` y `service-worker.js` sirven `v2.21` / `finanzas-lcd-v29`; `app.js?v=2.21`, `render.js?v=2.21` y `forms.js?v=2.21` estan referenciados.

### Pendientes
- Verificar visualmente en el celular instalado despues de tocar `Actualizar app`.

## 2026-06-18 - Conversion instantanea de wishlist y profundidad LCD

### Objetivo
- Convertir una `Cosa que quiero` en meta sin modal ni formulario intermedio.
- Actualizar la UI de forma optimista con micro-confirmacion inline y rollback ante error.
- Dar mas profundidad visual a la paleta LCD usando solo variantes verdes.

### Cambios
- `frontend/scripts/render.js`: el boton de wishlist ahora dice `Convertir en meta`, dispara la conversion directa y muestra check inline/parpadeo durante la salida de la tarjeta.
- `frontend/scripts/app.js`: se agrego conversion optimista con meta temporal local, remocion diferida de la tarjeta y reemplazo por la respuesta real del backend.
- `frontend/scripts/forms.js`: se elimino el modal/formulario intermedio de conversion.
- `backend/GoalService.js`: `convertWishlistToGoal_` ya no requiere `montoMensual`; usa `0` si no se envia y mantiene titulo/costo de wishlist como titulo/objetivo de la meta.
- `frontend/styles/lcd-theme.css` y `frontend/styles/main.css`: se agregaron `--lcd-surface-hi` y `--lcd-surface-lo` y se aplicaron gradientes verdes de profundidad en pantalla, tarjetas, inputs y filas.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.22` y cache a `finanzas-lcd-v30`.
- `README.md` y `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: documentacion actualizada.

### Verificacion
- `node --check` sobre `backend/*.js`, `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest ok`.
- Validacion de assets de `frontend/service-worker.js`: 23 assets, sin faltantes.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.22`, `APP_VERSION: 'v2.22'`, `finanzas-lcd-v30`, `app.js?v=2.22` y `render.js?v=2.22`.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.

### Despliegue
- Commit principal: `5601f1e` (`Agilizar conversion wishlist y profundizar paleta`) subido a `origin/main`.
- `clasp push`: 13 archivos backend publicados.
- `clasp version "Pirepirapp v2.22 conversion wishlist instantanea"`: version `20`.
- `clasp redeploy AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu --versionNumber 20`: redeploy publico `@20`.
- Ping backend publico: `{"ok":true}`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.22` sirve `v2.22`, `APP_VERSION: 'v2.22'`, `finanzas-lcd-v30`, `app.js?v=2.22`, `render.js?v=2.22` y `forms.js?v=2.22`.

### Pendientes
- Verificar visualmente en el celular instalado despues de tocar `Actualizar app`.

## 2026-06-17 - Ajuste de brillo y silueta de aves

### Objetivo
- Hacer el brillo un poco mas vistoso sin saturar las tarjetas.
- Redibujar las aves para que no parezcan murcielagos.

### Cambios
- `frontend/scripts/render.js`: se agrego un cuarto destello por tarjeta.
- `frontend/styles/main.css`: se aumento el contraste/pico de brillo y se redibujo la silueta lateral de las aves con ala superior, cola y cuerpo mas estilizado.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.13` y cache a `finanzas-lcd-v21`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt nuevo.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`, `frontend/service-worker.js` y `backend/*.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: todos los archivos existen.
- Busqueda `rg` en `frontend` de `v2.12`, `finanzas-lcd-v20` y `liquid`: sin resultados viejos; solo aparecen `v2.13` y `finanzas-lcd-v21`.
- `git diff --check`: sin errores, solo avisos de fin de linea CRLF esperados en Windows.
- Servidor local `http://127.0.0.1:4173`: `index.html` responde `200` y contiene `v2.13`.
- Push a `origin/main`: commit `a0bc6dc`.
- Verificacion publica en `https://nicolasverar.github.io/pirepirapp/`: `index.html`, `scripts/config.js` y `service-worker.js` sirven `v2.13` / `finanzas-lcd-v21`.

### Pendientes
- Revisar visualmente en el celular instalado y tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-17 - Nubes y pajaros en Futuro

### Objetivo
- Reemplazar la silueta que se leia como avion por una escena con nubes, pajaros y aves.

### Cambios
- `frontend/scripts/render.js`: `EL FUTURO` ahora renderiza una escena de cielo con dos nubes, dos pajaros pequenos y un ave mas grande.
- `frontend/styles/main.css`: se reemplazaron las clases de la silueta anterior por nubes pixeladas y pajaros tipo gaviota.
- `frontend/styles/responsive.css`: se actualizaron las clases para ocultar la escena animada en modo de movimiento reducido.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.14` y cache a `finanzas-lcd-v22`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt nuevo.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`, `frontend/service-worker.js` y `backend/*.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: todos los archivos existen.
- Busqueda `rg` en `frontend` de `bird-flyover`, `fly-bird`, `v2.13` y `finanzas-lcd-v21`: sin resultados viejos; aparecen `v2.14`, `finanzas-lcd-v22` y las clases nuevas `sky-*`.
- `git diff --check`: sin errores, solo avisos de fin de linea CRLF esperados en Windows.
- Servidor local `http://127.0.0.1:4173`: `index.html` responde `200` y contiene `v2.14`.
- Push a `origin/main`: commit `628dfc9`.
- Verificacion publica en `https://nicolasverar.github.io/pirepirapp/`: `index.html`, `scripts/config.js` y `service-worker.js` sirven `v2.14` / `finanzas-lcd-v22`.

### Pendientes
- Revisar visualmente en el celular instalado y tocar `Actualizar app` si mantiene cache anterior.
