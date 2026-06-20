# Bitacora - Pirepirapp

## 2026-06-20 - Pixel font real P6 en Resumen

### Objetivo
- Implementar la variante P6 elegida para el bloque `Hoy es` / fecha del Resumen.
- Mantener la fecha dentro del marco con ajuste responsive.

### Cambios
- `frontend/scripts/render.js`: el bloque de bienvenida ahora usa canvas con glifos bitmap 5x7, pixeles activos y ghost de segmentos apagados.
- `frontend/styles/main.css`: se agregaron tamanos para `summary-pixel-label` y `summary-pixel-date`.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.42` y cache a `finanzas-lcd-v50`.
- `docs/summary_welcome_pixel_font_options.html` y `docs/summary_welcome_true_pixel_font_options.html`: previews locales usados para la decision visual.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompts y resumen operativo actualizados.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- Busqueda `rg` de `v2.41`, `finanzas-lcd-v49` y `APP_VERSION: 'v2.41'` en `frontend`: sin resultados.
- Servidor local `http://127.0.0.1:4173/`: sirve `v2.42`.

### Despliegue
- Commit principal: `f74a4f4` (`Implementar pixel font P6 en resumen`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.42` sirve `v2.42`, `APP_VERSION: 'v2.42'`, cache `finanzas-lcd-v50`, render con `summary-pixel-text` y CSS de `summary-pixel-date`.
- No hubo cambios de backend; no se ejecuto `clasp redeploy`.

### Pendientes
- Revisar visualmente en el celular instalado despues de tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-20 - Preview de fondos LCD

### Objetivo
- Mostrar alternativas visuales de fondo LCD antes de modificar la app.
- Refinar la opcion D con cuadrados mas pequenos.
- Implementar la variante elegida por el usuario: opcion D con pixel de `2px`.

### Cambios
- `docs/lcd_background_options.html`: lamina local con cinco variantes comparables: LCD limpio, matriz LCD, scanlines, Game Boy y LCD sobrio.
- `docs/lcd_background_option_d_variants.html`: lamina local con cinco variantes D1-D5 del fondo Game Boy/LCD oscuro, reduciendo progresivamente el tamano de pixel.
- `docs/lcd_background_option_d_micro_variants.html`: lamina local con variantes micro del fondo D en `3px`, `2.5px`, `2px` y `1px`.
- `frontend/styles/main.css`: se implemento el fondo LCD opcion D con matriz fina de `2px`, scanline suave y tarjetas coordinadas al tono Game Boy.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.41` y cache a `finanzas-lcd-v49`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompt y resumen operativo actualizados.

### Verificacion
- Se abrio el preview local con `Start-Process .\docs\lcd_background_options.html`.
- Se abrio el preview local con `Start-Process .\docs\lcd_background_option_d_variants.html`.
- Se abrio el preview local con `Start-Process .\docs\lcd_background_option_d_micro_variants.html`.
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- Busqueda `rg` de `v2.40`, `finanzas-lcd-v48` y `APP_VERSION: 'v2.40'` en `frontend`: sin resultados.
- Servidor local `http://127.0.0.1:4173/`: sirve `v2.41`.

### Despliegue
- Commit principal: `6e8e373` (`Implementar fondo LCD D 2px`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.41` sirve `v2.41`, `APP_VERSION: 'v2.41'`, cache `finanzas-lcd-v49` y CSS con `--lcd-pixel-size: 2px`.
- No hubo cambios de backend; no se ejecuto `clasp redeploy`.

### Pendientes
- Revisar visualmente en el celular instalado despues de tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-20 - Preview de pixel font bienvenida

### Objetivo
- Mostrar variantes visuales del bloque `Hoy es` / fecha de Resumen antes de modificar la app.
- Rehacer las opciones como pixel font real, porque las primeras variantes no evocaban una fuente pixel.

### Cambios
- `docs/summary_welcome_pixel_font_options.html`: lamina local con seis variantes de pixel font para el mensaje de bienvenida de Resumen.
- `docs/summary_welcome_true_pixel_font_options.html`: lamina local con seis variantes P1-P6 renderizadas como matriz de pixeles en canvas, sin fuentes del sistema.
- `docs/summary_welcome_true_pixel_font_options.html`: se redujo la escala base y se agrego ajuste automatico por ancho/alto para que la fecha no salga del marco.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompt y resumen operativo actualizados.

### Verificacion
- Se abrio el preview local con `Start-Process .\docs\summary_welcome_pixel_font_options.html`.
- Se abrio el preview local con `Start-Process .\docs\summary_welcome_true_pixel_font_options.html`.
- Se reabrio el preview local corregido con `Start-Process .\docs\summary_welcome_true_pixel_font_options.html`.

### Despliegue
- No aplica; no se modifico el frontend productivo ni se desplego.

### Pendientes
- Esperar eleccion del usuario (`P1` a `P6`) para implementar la variante elegida.

## 2026-06-19 - Grilla LCD y leyenda de particion

### Objetivo
- Reordenar el bloque de fecha: `Hoy es` arriba, espacio vertical y fecha pixel art limpia debajo.
- Eliminar el puntillismo de los fondos y reemplazarlo por cuadricula vintage LCD.
- Dejar el dithering solo como sombra/base visible de tarjetas, siguiendo `ejemplo.png`.
- Rediseñar el boton `AGREGAR`, la paleta de particion y la leyenda.

### Cambios
- `frontend/styles/main.css`: se agrego una capa final `v2.40` con fondos de grilla lineal, fecha con jerarquia vertical, sombras dithered visibles en base/lateral de tarjetas de futuro/metas/wishlist, boton `AGREGAR` sin marco claro y paleta nueva de torta.
- `frontend/scripts/render.js`: la leyenda de `Particion sueldo` ahora muestra nombre, monto y porcentaje por item.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.40` y cache a `finanzas-lcd-v48`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompt y resumen operativo actualizados con rutas locales sanitizadas.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- Busqueda `rg` de `v2.39`, `finanzas-lcd-v47` y `APP_VERSION: 'v2.39'` en `frontend`: sin resultados.
- Servidor local `http://127.0.0.1:4173/`: sirve `v2.40`.

### Despliegue
- Commit principal: `444fafd` (`Refinar grilla LCD y particion`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.40` sirve `v2.40`, `APP_VERSION: 'v2.40'`, cache `finanzas-lcd-v48`, sombras dither en base de tarjetas, leyenda nueva y estilos `v2.40`.
- No hubo cambios de backend; no se ejecuto `clasp redeploy`.

### Pendientes
- Revisar visualmente en el celular instalado despues de tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-19 - Fecha compacta y puntillismo retro

### Objetivo
- Quitar los dos puntos de `Hoy es` y compactar la fecha para que entre como `VIE 19/06/26`.
- Separar el texto `En lo que va de [mes] gastaste` del monto en guaranies.
- Reemplazar sombreados planos por puntillismo retro y mejorar la legibilidad de la leyenda de particion.
- Dar fondo puntillista a las tarjetas de `EL FUTURO`, `METAS` y `COSAS QUE QUIERO`.

### Cambios
- `frontend/scripts/render.js`: el resumen renderiza `Hoy es` sin dos puntos, fecha corta `DD/MM/AA`, monto mensual variable en una linea reservada y clases especificas para ventanas de metas/lista.
- `frontend/styles/main.css`: se agregaron overrides de fecha compacta, monto con caja punteada, badge con puntos, leyenda de particion mas legible y fondos puntillistas para metas/wishlist/futuro.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.39` y cache a `finanzas-lcd-v47`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompt y resumen operativo actualizados.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Busqueda `rg` de `v2.38`, `finanzas-lcd-v46`, `Hoy es:` y separador de fecha viejo: sin resultados.

### Despliegue
- Commit principal: `e1d601b` (`Ajustar resumen compacto y puntillismo`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.39` sirve `v2.39`, `APP_VERSION: 'v2.39'`, cache `finanzas-lcd-v47`, `Hoy es` sin dos puntos, fecha corta, leyenda ampliada y puntillismo en tarjetas.
- No hubo cambios de backend; no se ejecuto `clasp redeploy`.

### Pendientes
- Revisar visualmente en el celular instalado despues de tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-19 - Correccion de fecha, patrones y torta solida

### Objetivo
- Quitar las circunferencias concentricas del bloque de fecha y del boton `AGREGAR`.
- Hacer que `Hoy es` quede sin marco de tarjeta y con fecha pixelada inspirada en `fecprincipal.png`.
- Corregir la torta para que se lea como piezas solidas y no como discos flotantes.

### Cambios
- `frontend/styles/main.css`: se eliminaron patrones radiales/concentricos en los bloques criticados, se dejo `summary-embedded` sin marco ni tarjeta, se reforzo la tipografia pixelada de fecha y se limpio el fondo del boton `AGREGAR`.
- `frontend/scripts/render.js`: se quitaron los aros/rims globales y la elevacion de porciones de la torta para evitar la lectura de discos flotando.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.38` y cache a `finanzas-lcd-v46`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompt y resumen operativo actualizados.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- Servidor local `http://127.0.0.1:4173/`: sirve `v2.38`.

### Despliegue
- Commit principal: `e615dd0` (`Corregir resumen LCD y torta solida`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.38` sirve `v2.38`, `APP_VERSION: 'v2.38'`, cache `finanzas-lcd-v46`, resumen sin marco, boton `AGREGAR` limpio y torta sin rims flotantes.
- No hubo cambios de backend; no se ejecuto `clasp redeploy`.

### Pendientes
- Revisar visualmente en el celular instalado despues de tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-19 - Ajuste fino LCD oliva y scrollbars

### Objetivo
- Acercar el tono oliva, biseles y texturas a la referencia visual provista.
- Eliminar los scrollbars grises nativos que rompian la estetica lateral.

### Cambios
- `frontend/styles/lcd-theme.css`: paleta base reajustada a oliva mas grisaceo, menos saturado y menos amarillo.
- `frontend/styles/main.css`: carcasa, pantalla, tarjetas, titulos, bordes y texturas refinadas; la textura de pantalla pasa a ser interna y se ocultan scrollbars en navegador.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.37` y cache a `finanzas-lcd-v45`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompt y resumen operativo actualizados.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- Servidor local `http://127.0.0.1:4173/`: sirve `v2.37`.

### Despliegue
- Commit principal: `b6e7a72` (`Afinar estetica LCD oliva`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.37` sirve `v2.37`, `APP_VERSION: 'v2.37'`, cache `finanzas-lcd-v45`, CSS con scrollbars ocultos y tono oliva ajustado.
- No hubo cambios de backend; no se ejecuto `clasp redeploy`.

### Pendientes
- Revisar visualmente en el celular instalado despues de tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-19 - Resumen version 3.0

### Objetivo
- Rediseñar la seccion Resumen segun especificacion v3.0.
- Reemplazar la tarjeta principal por una zona incrustada con bajo relieve.
- Quitar la lista de ultimos gastos y dejar solo un KPI compacto de mayor gasto.
- Hacer que la torta muestre porcentajes y use tramados monocromaticos.

### Cambios
- `frontend/scripts/render.js`: el Resumen ahora muestra `Hoy es:`, `En lo que va de [Mes] gastaste: [Monto]`, calcula el gasto variable mensual excluyendo fijos/ahorros/metas, reemplaza la lista reciente por un badge KPI y cambia la torta para etiquetar porcentajes.
- `frontend/styles/main.css`: estilos nuevos para bloque incrustado, badge KPI retro/isometrico, disponible como `Plata disponible` y torta con patrones/dithering monocromatico.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.36` y cache a `finanzas-lcd-v44`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompt y resumen operativo actualizados.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- Servidor local `http://127.0.0.1:4173/`: sirve `v2.36`.

### Despliegue
- Commit principal: `b7d09cc` (`Redisenar resumen v3`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.36` sirve `v2.36`, `APP_VERSION: 'v2.36'`, cache `finanzas-lcd-v44`, `Hoy es:`, `summaryVariableSpent` y etiquetas porcentuales de torta.
- No hubo cambios de backend; no se ejecuto `clasp redeploy`.

### Pendientes
- Revisar visualmente en el celular instalado despues de tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-19 - Rediseño LCD oliva y torta elevada

### Objetivo
- Rediseñar visualmente la app completa siguiendo la referencia LCD verde oliva con sombreado puntillado, cuadricula y carcasa oscura.
- Mantener la navegacion y el boton principal abajo.
- Elevar las porciones de la torta desde menor a mayor, dejando la porcion mas grande en el nivel base.

### Cambios
- `frontend/styles/lcd-theme.css`: se ajustaron los tokens de color hacia una paleta oliva LCD mas cercana a la referencia.
- `frontend/styles/main.css`: se agrego una capa visual global con carcasa oscura, pantalla con grano/cuadricula, tarjetas con encabezados solidos, sombreado puntillado y botones inferiores oscuros.
- `frontend/scripts/render.js`: la torta de sueldo eleva verticalmente cada porcion en funcion de su tamano relativo; la porcion mayor permanece al nivel base.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.35` y cache a `finanzas-lcd-v43`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompts y resumen operativo actualizados.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- Servidor local `http://127.0.0.1:4173/`: sirve `v2.35`.

### Despliegue
- Commit principal: `4feabe0` (`Redisenar interfaz LCD oliva`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.35` sirve `v2.35`, `APP_VERSION: 'v2.35'`, cache `finanzas-lcd-v43` y `render.js` con elevacion de porciones.
- No hubo cambios de backend; no se ejecuto `clasp redeploy`.

### Pendientes
- Revisar visualmente en el celular instalado despues de tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-19 - Torta dinamica de particion de sueldo

### Objetivo
- Incorporar a la app la torta dinamica aprobada visualmente en el preview local.
- Mantener porciones proporcionales al sueldo/gastos fijos, con estilo isometrico LCD similar a la referencia.

### Cambios
- `frontend/scripts/render.js`: la torta de particion ahora dibuja porciones dinamicas con tapa superior, paredes exteriores por segmento y sin caras internas que muestren el interior.
- `frontend/styles/main.css`: se aplicaron colores verdes solidos coherentes por porcion, textura de trama como capa superior y numeracion en circulo.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.34` y cache a `finanzas-lcd-v42`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro la aprobacion del preview y la integracion.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`, `backend/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Servidor local existente `http://127.0.0.1:4173/`: sirve `v2.34`.
- `scripts/render.js?v=2.34` servido localmente contiene `salary-hatch-5` y `salaryPieFrontSidePieces`, y ya no contiene `addPieSideLine`.

### Despliegue
- Commit principal: `fdfb0fc` (`Integrar torta dinamica de sueldo`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.34` sirve `v2.34`, `APP_VERSION: 'v2.34'`, cache `finanzas-lcd-v42` y `render.js` con `salaryPieFrontSidePieces`.
- No hubo cambios de backend; no se ejecuto `clasp redeploy`.

### Pendientes
- Revisar visualmente en el celular instalado despues de tocar `Actualizar app` si mantiene cache anterior.

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

### Despliegue
- Commit principal: `33e4529` (`Automatizar gastos fijos y ajustar escena`) subido a `origin/main`.
- `clasp push`: 13 archivos backend publicados.
- `clasp version "Pirepirapp v2.27 gastos fijos automaticos"`: version `22`.
- `clasp redeploy AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu --versionNumber 22`: redeploy publico `@22`.
- Ping backend publico: `{"ok":true}`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.27` sirve `v2.27`, `APP_VERSION: 'v2.27'`, `finanzas-lcd-v35`, `app.js?v=2.27` y `main.css?v=2.27`.

### Pendientes
- Verificar visualmente en el celular instalado despues de tocar `Actualizar app`.

## 2026-06-18 - Aves desde MP4 correcto

### Objetivo
- Reemplazar las aves dibujadas en CSS por una animacion basada en el `aves.mp4` correcto.
- Usar el ciclo recomendado de frames reales para que el movimiento se lea como ave volando.

### Cambios
- `frontend/assets/aves-flight-sprite.png`: sprite transparente de seis frames generado desde `aves.mp4` con el ciclo `01, 04, 06, 07, 10, 13`.
- `frontend/scripts/render.js`: `EL FUTURO` ahora renderiza `mp4-bird` en lugar de las siluetas CSS anteriores.
- `frontend/styles/main.css`: se agrego `mp4-bird-flap` con `steps(6)` y variantes de escala/velocidad para profundidad.
- `frontend/styles/responsive.css`: `mp4-bird` respeta `prefers-reduced-motion`.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.28` y cache a `finanzas-lcd-v36`; el service worker cachea el sprite.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompt registrado.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de `frontend/service-worker.js`: cache `finanzas-lcd-v36`, `main.css?v=2.28` y `assets/aves-flight-sprite.png` presentes.
- Sprite validado: `aves-flight-sprite.png` mide `576x56`.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.28`, `APP_VERSION: 'v2.28'`, `finanzas-lcd-v36`, `render.js?v=2.28` y `main.css?v=2.28`.
- Busqueda de referencias viejas `v2.27`, `v=2.27` y `finanzas-lcd-v35`: sin resultados en archivos de version/cache.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.

### Pendientes
- Commitear, publicar GitHub Pages y verificar URL publica.

## 2026-06-19 - Aleteo MP4 suavizado y aves en profundidad

### Objetivo
- Ampliar el ciclo de aleteo porque seis frames se veian raros.
- Hacer algunas aves mas pequenas para que parezcan lejanas.
- Separar las trayectorias para evitar superposiciones entre aves.

### Cambios
- `frontend/assets/aves-flight-sprite.png`: sprite regenerado desde el `aves.mp4` actual con 16 frames y tamano final `1536x56`.
- `frontend/styles/main.css`: `mp4-bird-flap` pasa a `steps(16)`, usa el sprite `v=2.29`, separa cuatro carriles verticales y reduce escala/opacidad de las aves lejanas.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.29` y cache a `finanzas-lcd-v37`; el service worker cachea el sprite con `?v=2.29`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompt registrado.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de CSS/cache: `steps(16)`, `1536px 56px`, `finanzas-lcd-v37` y `aves-flight-sprite.png?v=2.29` presentes.
- Sprite validado con ImageMagick: `aves-flight-sprite.png` mide `1536x56`.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.29`, `APP_VERSION: 'v2.29'`, `finanzas-lcd-v37`, `main.css?v=2.29` y sprite cacheado.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.
- Commit principal `9613193` (`Suavizar aleteo de aves MP4`) enviado a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.29` sirve `v2.29`, `APP_VERSION: 'v2.29'`, `finanzas-lcd-v37`, `main.css?v=2.29` y sprite cacheado.
- Sprite publico `https://nicolasverar.github.io/pirepirapp/assets/aves-flight-sprite.png?v=2.29`: `200 OK`, `image/png`, `5720` bytes.
- Backend sin cambios; no se ejecuto despliegue de Apps Script.

### Pendientes
- Verificar visualmente en el celular instalado despues de tocar `Actualizar app`.

## 2026-06-19 - Resumen con torta y filtros de gastos

### Objetivo
- Evitar que `Compra cosa que quiero` pida `Motivo` cuando el item seleccionado ya define ese texto.
- Reemplazar la particion de sueldo en cajas por un diagrama de torta con efecto LCD/3D.
- Agregar filtros en `Gastos totales` y quitar botones redundantes de alta junto a `Actualizar`.

### Cambios
- `frontend/scripts/forms.js`: el campo `Motivo` se oculta para `Compra cosa que quiero`; el payload usa automaticamente el titulo de la cosa seleccionada.
- `frontend/scripts/render.js`: `Gastos totales` agrega filtros `Todo`, `Gastos`, `Ingresos`, `Cosas`, `Ahorro/meta` y `Fijos`; arriba queda solo `Actualizar`.
- `frontend/scripts/render.js`: `Particion sueldo` renderiza una torta SVG con base sombreada, etiquetas porcentuales y aviso de exceso si los fijos superan el sueldo.
- `frontend/scripts/state.js`: se agrego `movementFilter` local.
- `frontend/styles/main.css` y `frontend/styles/responsive.css`: estilos para filtros y torta LCD responsive.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.30` y cache a `finanzas-lcd-v38`.
- `README.md` y `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: documentacion actualizada.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Busqueda en `frontend` de `js-new-expense`, `js-new-income`, `salary-box-map`, `partition-box`, `v=2.29` y `finanzas-lcd-v37`: sin resultados.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.30`, `APP_VERSION: 'v2.30'`, `finanzas-lcd-v38`, `forms.js?v=2.30`, `render.js?v=2.30` y `main.css?v=2.30`.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.
- Commit principal `5a3f884` (`Ajustar resumen y filtros de gastos`) enviado a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.30` sirve `v2.30`, `APP_VERSION: 'v2.30'`, `finanzas-lcd-v38`, `forms.js?v=2.30`, `render.js?v=2.30` y `main.css?v=2.30`.
- Backend sin cambios; no se ejecuto despliegue de Apps Script.

### Pendientes
- Verificar visualmente en el celular instalado despues de tocar `Actualizar app`.

## 2026-06-19 - Torta de referencia, disponible post-particiones y limpieza visual

### Objetivo
- Usar la imagen local `torta.pmg.png` como referencia visual para `Particion sueldo`.
- Mantener la particion basada solo en `Configuracion`, sin depender de gastos efectuados.
- Calcular el porcentaje disponible sobre la plata que queda despues de gastos fijos, no sobre el sueldo total.
- Eliminar aves, nubes y confeti hasta nuevo aviso.

### Cambios
- `frontend/assets/torta.pmg.png`: asset agregado desde la referencia local.
- `frontend/scripts/render.js`: la torta de particion usa `torta.pmg.png` como textura/referencia y conserva segmentos dinamicos por gastos fijos configurados; se elimino el render de aves/nubes.
- `frontend/styles/main.css` y `frontend/styles/responsive.css`: se ajusto la torta LCD con tramas, se elimino el espacio reservado para cielo y se limpiaron estilos de aves/nubes/confeti.
- `frontend/scripts/app.js`: `totalGastado` excluye gastos fijos y `porcentajeDisponible` usa `baseCalculoDisponible` (`sueldo - fijos + ingresos extra`) como base.
- `backend/SummaryService.js`: se replico el mismo calculo en el resumen inicial del backend.
- `frontend/scripts/app.js`: el boton `¡Cobré!` ya no dispara confeti.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.31` y cache a `finanzas-lcd-v39`; el service worker cachea `torta.pmg.png` y ya no precarga el sprite de aves.
- `README.md` y `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: documentacion actualizada.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`, `frontend/service-worker.js` y `backend/*.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets del service worker: 24 assets, sin faltantes; `finanzas-lcd-v39`, `assets/torta.pmg.png?v=2.31` presente y sprite de aves ausente.
- Busqueda en `frontend` y `backend` de `launchPixelConfetti`, `pixel-confetti`, `confetti`, `renderSkyScene`, `pixel-cloud`, `mp4-bird`, `sky-bird`, `sky-ave`, `aves-flight-sprite`, `v=2.30`, `v2.30` y `finanzas-lcd-v38`: sin resultados.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.31`, `APP_VERSION: 'v2.31'`, `finanzas-lcd-v39`, `app.js?v=2.31`, `render.js?v=2.31` y `torta.pmg.png?v=2.31`.
- Asset local `http://127.0.0.1:4173/assets/torta.pmg.png?v=2.31`: `200 OK`, `image/png`, `81701` bytes.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.
- Commit principal `17e7874` (`Ajustar particion de sueldo y limpiar animaciones`) enviado a `origin/main`.
- `clasp push`: subio 13 archivos del backend.
- `clasp version "Pirepirapp v2.31 particion sueldo"`: creo version `23`.
- `clasp redeploy AKfycbyEhc9Jx-2sJn4ziT_k95IJmP6_hsAEPnrdBFNczOpF4oT8R5sXBxq0dcoBXRK3OfEu --versionNumber 23 --description "Pirepirapp v2.31 particion sueldo"`: Web App redeployado `@23`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.31` sirve `v2.31`, `APP_VERSION: 'v2.31'`, `finanzas-lcd-v39`, `app.js?v=2.31`, `render.js?v=2.31` y cachea `torta.pmg.png?v=2.31`.
- Asset publico `https://nicolasverar.github.io/pirepirapp/assets/torta.pmg.png?v=2.31`: `200 OK`, `image/png`, `81701` bytes.
- Ping backend publico: `{"ok":true}`.

### Pendientes
- Verificar visualmente en el celular instalado despues de tocar `Actualizar app`.

## 2026-06-19 - Torta isometrica sin superposicion

### Objetivo
- Corregir que la particion anterior apareciera encima de la torta.
- Redibujar `Particion sueldo` como torta 3D isometrica, no como grafico plano superpuesto.

### Cambios
- `frontend/scripts/render.js`: se elimino la imagen visible `salary-pie-reference`; la torta ahora se renderiza como un solo SVG isometrico con costados, tapa, borde frontal y sectores dinamicos.
- `frontend/styles/main.css` y `frontend/styles/responsive.css`: se ajusto profundidad, tramas, contornos y tamano responsive del grafico.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.32` y cache a `finanzas-lcd-v40`.
- `README.md` y `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: documentacion actualizada.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Busqueda en `frontend` de `salary-pie-reference`, `<img class="salary-pie`, `v=2.31`, `v2.31` y `finanzas-lcd-v39`: sin resultados.
- Validacion de render/cache: `partitionPieSidePath`, `salary-pie-bottom-rim`, `v2.32`, `APP_VERSION: 'v2.32'`, `finanzas-lcd-v40` y `torta.pmg.png?v=2.32` presentes.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.32`, `APP_VERSION: 'v2.32'`, `finanzas-lcd-v40`, `render.js?v=2.32` y `main.css?v=2.32`.
- Asset local `http://127.0.0.1:4173/assets/torta.pmg.png?v=2.32`: `200 OK`, `image/png`, `81701` bytes.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.
- Commit principal `9e8724e` (`Redibujar torta de sueldo isometrica`) enviado a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.32` sirve `v2.32`, `APP_VERSION: 'v2.32'`, `finanzas-lcd-v40`, `render.js?v=2.32` y `main.css?v=2.32`.
- Asset publico `https://nicolasverar.github.io/pirepirapp/assets/torta.pmg.png?v=2.32`: `200 OK`, `image/png`, `81701` bytes.
- Backend sin cambios; no se ejecuto despliegue de Apps Script.

### Pendientes
- Verificar visualmente en el celular instalado despues de tocar `Actualizar app`.

## 2026-06-19 - Torta monocroma numerada como referencia

### Objetivo
- Acercar `Particion sueldo` a la referencia `torta.pmg.png`: dibujo tecnico LCD, monocromo, tramado y numerado.
- Evitar que se lea como grafico colorido moderno.

### Cambios
- `frontend/scripts/render.js`: la torta usa `viewBox 282x223`, sectores numerados, pared frontal unica, separadores laterales y tramas por porcion.
- `frontend/styles/main.css`: se neutralizaron los colores fuertes dentro del grafico, se reforzaron contornos, hachurados y aspecto monocromo.
- `frontend/styles/responsive.css`: se ajusto alto/ancho responsive de la torta.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.33` y cache a `finanzas-lcd-v41`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompt registrado.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de render/cache: `viewBox="0 0 282 223"`, `salary-side-hatch`, leyenda numerada, override monocromo, `v2.33`, `APP_VERSION: 'v2.33'` y `finanzas-lcd-v41` presentes.
- Busqueda en `frontend` de `v=2.32`, `v2.32`, `finanzas-lcd-v40`, `salary-pie-reference` y `<img class="salary-pie`: sin resultados.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.33`, `APP_VERSION: 'v2.33'`, `finanzas-lcd-v41`, `render.js?v=2.33` y `main.css?v=2.33`.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.
- Commit principal `8507436` (`Acercar torta de sueldo a referencia`) enviado a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.33` sirve `v2.33`, `APP_VERSION: 'v2.33'`, `finanzas-lcd-v41`, `render.js?v=2.33` y `main.css?v=2.33`.
- Backend sin cambios; no se ejecuto despliegue de Apps Script.

### Pendientes
- Verificar visualmente en el celular instalado despues de tocar `Actualizar app`.

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
