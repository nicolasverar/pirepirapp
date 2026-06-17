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

### Pendientes
- Verificar despliegue publico tras push.
