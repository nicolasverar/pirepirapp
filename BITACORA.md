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

### Pendientes
- Commit, push y verificacion publica en GitHub Pages.

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
