# Bitacora - Pirepirapp

## 2026-06-22 - Terminal superior, logo y pin LCD

### Objetivo
- Reemplazar las notificaciones emergentes por un mini terminal en el banner superior.
- Reorganizar el banner como `PIREPIRAPP + version + terminal + indicador de conexion`.
- Incorporar el logo nuevo desde `docs/logo.png`.
- Reemplazar el pin CSS de `COSAS QUE QUIERO` por el asset local `pin.png`, recoloreado a la paleta LCD.

### Cambios
- `frontend/index.html`: el header ahora contiene logo, nombre, version, terminal de estado y cuadradito de conexion separado.
- `frontend/scripts/render.js`: `updateChrome` escribe el estado en el terminal superior y mantiene el indicador de conexion como etiqueta accesible.
- `frontend/scripts/app.js`: `toast()` deja de crear popups y muestra mensajes temporales dentro del terminal superior.
- `frontend/styles/main.css` y `frontend/styles/responsive.css`: estilos del banner, terminal, indicador de conexion y layout responsive.
- `frontend/icons/logo.png`: logo nuevo incorporado a la PWA desde `docs/logo.png`.
- `frontend/icons/pin-lcd.png`: pin generado desde `pin.png`, con fondo transparente, recortado y recoloreado en verdes LCD.
- `frontend/styles/main.css`: `.wish-pin` usa `pin-lcd.png` en vez del icono CSS anterior.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.75` y cache PWA a `finanzas-lcd-v83`.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`: sin errores.
- `node --check frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: 26 assets, sin faltantes.
- `rg` en `frontend`: sin referencias activas a `v2.74`, `finanzas-lcd-v82` ni `root.appendChild(item)`.
- Servidor local `http://127.0.0.1:4173/?v=2.75`: sirve `v2.75`, `APP_VERSION: 'v2.75'`, `finanzas-lcd-v83`, `status-terminal`, `logo.png` y `pin-lcd.png`.

### Despliegue
- Pendiente de commit, push y verificacion publica.

### Pendientes
- Revisar visualmente en celular instalado que el terminal superior no corte mensajes demasiado largos.

## 2026-06-22 - MT1C en Metas y pin compacto

### Objetivo
- Incorporar en `METAS` la variante `MT1C - Barra junto a foto` de `docs/goals_goal_card_mt1_variants_v26.html`.
- Mejorar el boton `PIN` de `COSAS QUE QUIERO` para que no se vea como texto crudo.

### Cambios
- `frontend/styles/main.css`: la tarjeta de `METAS` usa grilla MT1C con areas `copy/photo`, `progress/photo`, `money/money` y `actions/actions`.
- `frontend/styles/responsive.css`: la variante MT1C se mantiene tambien en viewport movil con foto lateral reducida.
- `frontend/scripts/render.js`: el boton de pin pasa a renderizar un span visual sin texto.
- `frontend/styles/main.css`: `.wish-pin` se redibuja como un boton fisico compacto con icono CSS.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.74` y cache PWA a `finanzas-lcd-v82`.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`: sin errores.
- `node --check frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- Servidor local `http://127.0.0.1:4173/?v=2.74`: sirve `v2.74`, `APP_VERSION: 'v2.74'`, `finanzas-lcd-v82`, MT1C en metas, pin iconico y sin clases preparatorias `movements-window`/`settings-window`.

### Despliegue
- Commit principal: `b1c5325` (`Implementar MT1C en metas`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.74` sirvio `v2.74`, `APP_VERSION: 'v2.74'`, `finanzas-lcd-v82`, MT1C en metas, pin iconico y sin clases preparatorias `movements-window`/`settings-window`.

### Pendientes
- Retomar luego, si se confirma, el rediseño de `Resumen`, `Gastos` y `Configuracion` con el lenguaje FT2C.

## 2026-06-22 - Foto protagonista, sin marcos y pins en Wishlist

### Objetivo
- Ajustar la tarjeta productiva `METAS` para aprovechar el espacio muerto bajo el titulo usando la foto como elemento protagonista.
- Mantener la fila horizontal `acumulado` / `por mes`, la barra con porcentaje y las acciones.
- Eliminar el bloque rectangular de fondo heredado en `METAS` y `COSAS QUE QUIERO`.
- Rediseñar las tarjetas de `COSAS QUE QUIERO` con el estilo FT2C y agregar opcion de pinear items.

### Cambios
- `frontend/styles/main.css`: `.goals-window .goal-card` pasa de foto lateral a layout vertical: titulo/descripcion, foto full-width, fila de dinero, progreso y acciones.
- `frontend/styles/main.css`: `.goal-photo` y sus canvas/placeholders ocupan el ancho completo con altura minima para que la imagen sea protagonista.
- `frontend/styles/main.css`: `.goals-window.system-window` y `.wishlist-window.system-window` quedan sin fondo, borde, sombra ni pseudo-elemento lateral.
- `frontend/styles/main.css`: `COSAS QUE QUIERO` recibe cards FT2C con sombra punteada externa, panel de costo oscuro, botones compactos y estado `is-pinned`.
- `frontend/scripts/render.js`: se agrega pin local por ID en `localStorage` (`finanzasWishlistPins`), boton `PIN` por card y ordenamiento con pineadas arriba antes del criterio menor/mayor.
- `frontend/styles/responsive.css`: se elimina el ancho fijo movil de 84px para la foto de metas y se fuerza ancho completo.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.73` y cache PWA a `finanzas-lcd-v81`.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`: sin errores.
- `node --check frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- `rg` sobre `frontend`: confirma `v2.73`, `finanzas-lcd-v81`, `WISHLIST_PINS_KEY`, `js-pin-wish`, ventanas sin marco y `wish-card.is-pinned`.
- Servidor local `http://127.0.0.1:4173/?v=2.73`: sirve `v2.73`, `APP_VERSION: 'v2.73'`, `finanzas-lcd-v81`, `METAS` y `COSAS QUE QUIERO` sin marco heredado, wishlist FT2C, pin local y sin restos `v2.72`/`finanzas-lcd-v80`.

### Despliegue
- Commit principal: `58dca36` (`Redisenar metas y wishlist FT2C`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.73` sirve `v2.73`, `APP_VERSION: 'v2.73'`, `finanzas-lcd-v81`, `METAS` y `COSAS QUE QUIERO` sin marco heredado, pin local en wishlist, cards FT2C y sin restos `v2.72`/`finanzas-lcd-v80`.

### Pendientes
- Revisar visualmente en celular si la altura de foto protagonista y la densidad de las cards de wishlist quedan en el punto justo.

## 2026-06-22 - FT2C sin marco y MT1 para Metas

### Objetivo
- Corregir `EL FUTURO` para que coincida con la preview FT2C sin el marco/fondo heredado de `system-window`.
- Implementar en `METAS` una tarjeta basada en MT1 con foto lateral, fila horizontal `acumulado` / `por mes` y porcentaje visible.
- Generar una lamina nueva con variaciones MT1 derivadas.

### Cambios
- `frontend/styles/main.css`: `.future-window.system-window` queda sin fondo, borde, sombra ni pseudo-elemento lateral; el titulo `EL FUTURO` conserva el estilo de la preview y las tarjetas quedan FT2C.
- `frontend/scripts/render.js`: las tarjetas `METAS` pasan a `goal-card-mt1`, con foto lateral y nueva fila `goal-money-row`.
- `frontend/styles/main.css` y `frontend/styles/responsive.css`: nuevo skin MT1 productivo con paneles `acumulado` y `por mes` en una misma fila, barra con porcentaje y ajustes moviles.
- `docs/goals_goal_card_mt1_variants_v26.html`: nueva lamina MT1A-MT1D para comparar variaciones sobre la misma base visual.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.71` y cache PWA a `finanzas-lcd-v79`.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`: sin errores.
- `node --check frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.
- Servidor local `http://127.0.0.1:4173/?v=2.71`: sirve `v2.71`, `APP_VERSION: 'v2.71'`, `finanzas-lcd-v79`, `future-window.system-window` sin marco, `goal-card-mt1`, `goal-money-row`, `goal-monthly-panel`, responsive de metas y sin pajaritos.
- Se abrio la app local y la lamina `docs/goals_goal_card_mt1_variants_v26.html`.

### Despliegue
- Commit principal: `bb46fa7` (`Ajustar FT2C y tarjeta MT1 de metas`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.71` sirve `v2.71`, `APP_VERSION: 'v2.71'`, `finanzas-lcd-v79`, `EL FUTURO` sin marco heredado, `goal-card-mt1`, `goal-money-row`, `goal-monthly-panel` y sin pajaritos.

### Pendientes
- Revisar visualmente en celular si MT1A queda como base definitiva o si conviene una de las variantes MT1B-MT1D.

## 2026-06-22 - FT2C exacta en El Futuro y propuestas Metas

### Objetivo
- Cambiar la tarjeta productiva `EL FUTURO` desde FT2E a FT2C y ajustar el CSS para que coincida con la preview elegida.
- Eliminar los pajaritos y la linea vertical punteada del titulo `EL FUTURO`.
- Continuar el trabajo visual de la seccion `Metas` con propuestas para las tarjetas de metas especificas.

### Cambios
- `frontend/scripts/render.js`: el titulo `EL FUTURO` vuelve a ser un `window-title` simple, sin pista ni pajaritos.
- `frontend/styles/main.css`: el skin de `.future-card` pasa a FT2C con grilla, cuerpo claro tipo FT2, sombra punteada externa y acumulado en panel oscuro.
- `frontend/styles/main.css`: se eliminaron los selectores/keyframes de pajaritos y la linea vertical punteada.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.70` y cache PWA a `finanzas-lcd-v78`.
- `docs/goals_goal_card_variants_v25.html`: nueva lamina con variantes MT1-MT6 para tarjetas `METAS`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt 110 y su resumen operativo.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`: sin errores.
- `node --check frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- `rg` sobre `frontend`: sin `v2.69`, `finanzas-lcd-v77`, `FT2E` ni `future-bird`.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.70`, `APP_VERSION: 'v2.70'`, `finanzas-lcd-v78`, titulo simple `EL FUTURO`, sin `future-bird`, CSS FT2C exacta y sin CSS de pajaritos.
- Se verifico la existencia de `docs/goals_goal_card_variants_v25.html` y variantes MT1-MT6.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.

### Despliegue
- Commit principal: `2246cde` (`Ajustar El Futuro a FT2C`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.70` sirve `v2.70`, `APP_VERSION: 'v2.70'`, `finanzas-lcd-v78`, titulo simple `EL FUTURO`, sin `future-bird` y CSS FT2C exacta.

### Pendientes
- Elegir una variante MT para implementar el rediseño de tarjetas `METAS`.

## 2026-06-21 - FT2E en El Futuro y pajaritos de titulo

### Objetivo
- Implementar la variante FT2E en la tarjeta productiva `EL FUTURO`.
- Agregar en el rectangulo oscuro del titulo una linea vertical punteada con pajaritos del mismo color que vuelan hasta el final del rectangulo.

### Cambios
- `frontend/scripts/render.js`: el titulo `EL FUTURO` ahora se renderiza con `future-window-title`, texto, pista, linea punteada y tres pajaritos animados.
- `frontend/styles/main.css`: se agrego el skin FT2E para `.future-card`, con doble borde suave, fondo LCD punteado, sombra externa punteada y badge mensual claro.
- `frontend/styles/main.css`: se agregaron los pajaritos CSS con aleteo, vuelo horizontal y soporte `prefers-reduced-motion`.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.69` y cache PWA a `finanzas-lcd-v77`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt 109 y su resumen operativo.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`: sin errores.
- `node --check frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- `rg` sobre `frontend`: sin `v2.68` ni `finanzas-lcd-v76`.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.69`, `APP_VERSION: 'v2.69'`, `finanzas-lcd-v77`, `future-bird-track`, CSS FT2E y keyframes `future-title-bird-fly`.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.

### Despliegue
- Commit principal: `0f809fe` (`Implementar FT2E en El Futuro`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.69` sirve `v2.69`, `APP_VERSION: 'v2.69'`, `finanzas-lcd-v77`, `future-bird-track`, CSS FT2E y keyframes `future-title-bird-fly`.

### Pendientes
- Revisar en celular instalado si la velocidad y forma de los pajaritos queda agradable.

## 2026-06-21 - Variaciones FT2 tarjeta El Futuro

### Objetivo
- Profundizar la variante FT2 elegida como direccion posible para las tarjetas `EL FUTURO`.

### Cambios
- `docs/goals_future_card_ft2_variants_v24.html`: nueva lamina con seis variaciones FT2A-FT2F basadas en FT2.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt 108 y su resumen operativo.

### Verificacion
- Se verifico la existencia del archivo de preview y la presencia de FT2A-FT2F.
- `git diff --check`: sin errores.

### Despliegue
- No aplica: no se modifico la app productiva.

### Pendientes
- Elegir una variacion FT2 o pedir una mezcla antes de implementar en `render.js` y `main.css`.

## 2026-06-21 - Propuestas tarjeta El Futuro

### Objetivo
- Presentar propuestas visuales para la tarjeta `EL FUTURO` de la seccion `Metas` antes de modificar la app productiva.

### Cambios
- `docs/goals_future_card_variants_v23.html`: nueva lamina con seis variantes FT1-FT6 para tarjetas de ahorro futuro.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt 107 y su resumen operativo.

### Verificacion
- Se verifico la existencia del archivo de preview y la presencia de las variantes FT1-FT6.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.

### Despliegue
- No aplica: no se modifico la app productiva.

### Pendientes
- Elegir una variante o pedir ajustes antes de implementar en `render.js` y `main.css`.

## 2026-06-21 - Autocomplete de metas, ahorros y gastos fijos en movimientos

### Objetivo
- Extender la misma logica de autocompletado de wishlist a aportes de metas, ahorros futuros y gastos fijos.
- Impedir que el monto de gasto fijo se modifique desde el formulario de movimiento.
- Simplificar el formulario de ingreso quitando el selector visual `Tipo` y agregando un acceso `¡Cobré!`.

### Cambios
- `frontend/scripts/forms.js`: el formulario de movimiento ahora usa `autocompleteRelatedAmount` para completar `Monto` desde wishlist, metas, ahorros futuros y gastos fijos.
- `frontend/scripts/forms.js`: `Aporte a meta` y `Aporte a ahorro` toman `montoMensual` del item seleccionado y completan `Motivo` con el titulo si estaba vacio.
- `frontend/scripts/forms.js`: `Gasto fijo` se muestra como tipo del formulario, carga los fijos configurados, bloquea `Monto` y persiste el movimiento como `tipo: Gasto` + `categoria: Gasto fijo`.
- `frontend/scripts/forms.js`: el formulario `INGRESO` oculta el campo visual `Tipo` y agrega el boton `¡Cobré!`, que carga `Sueldo`, el sueldo mensual configurado y fecha/hora actual.
- `frontend/styles/main.css`: se agregaron estilos para el boton `¡Cobré!` y el estado readonly del monto de gasto fijo.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.68` y cache PWA a `finanzas-lcd-v76`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt 106 y su resumen operativo.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`: sin errores.
- `node --check frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- `rg` sobre `frontend`: sin `v2.67`, `finanzas-lcd-v75`, `autocompleteWishlistAmount` ni `normalizeWishlistMovementPayload`.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.68`, `APP_VERSION: 'v2.68'`, `finanzas-lcd-v76`, `data-fill-salary`, `autocompleteRelatedAmount`, persistencia de fijo como `Gasto` y CSS `input.is-readonly`.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.

### Despliegue
- Commit principal: `82bba3c` (`Extender autocompletado de movimientos`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.68` sirve `v2.68`, `APP_VERSION: 'v2.68'`, `finanzas-lcd-v76`, JS con `data-fill-salary` / `autocompleteRelatedAmount` / persistencia de fijo como `Gasto` y CSS con `input.is-readonly`.

### Pendientes
- Verificar en el celular instalado que `Actualizar app` descargue `v2.68`.

## 2026-06-21 - Autocomplete wishlist y estilo unificado de formularios

### Objetivo
- Autocompletar el monto del gasto al seleccionar una `Cosa que quiero`, usando su costo aproximado.
- Mantener ese monto editable despues del autocompletado.
- Llevar el estilo GF3/GF1 tambien a los formularios de `Ingreso`, `Meta`, `Ahorro futuro` y `Cosa que quiero`.

### Cambios
- `frontend/scripts/forms.js`: el campo `Monto` de movimientos queda marcado con `data-movement-amount`.
- `frontend/scripts/forms.js`: se agregaron `autocompleteWishlistAmount` y `findById` para completar el monto desde `wishlist[].costoAproximado` al cambiar el selector relacionado.
- `frontend/scripts/forms.js`: los modales de gasto, ingreso, meta, ahorro futuro y cosa que quiero ahora reciben la clase compartida `ticket-form-modal`.
- `frontend/styles/main.css`: el skin GF3/GF1 se generalizo de `movement-expense-modal` a `ticket-form-modal`.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.67` y cache PWA a `finanzas-lcd-v75`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt 105 y su resumen operativo.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`: sin errores.
- `node --check frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- `rg` sobre `frontend`: sin `v2.66`, `APP_VERSION: 'v2.66'` ni `finanzas-lcd-v74`.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.67`, `APP_VERSION: 'v2.67'`, `finanzas-lcd-v75`, `autocompleteWishlistAmount` y `ticket-form-modal`.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.

### Despliegue
- Commit principal: `731b7e6` (`Autocompletar wishlist y unificar formularios`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.67` sirve `v2.67`, `APP_VERSION: 'v2.67'`, `finanzas-lcd-v75`, CSS con `ticket-form-modal` y JS con `autocompleteWishlistAmount` / `data-movement-amount`.

### Pendientes
- Verificar visualmente en celular instalado despues de tocar `Actualizar app`.

## 2026-06-21 - Formulario de gasto GF3 con fondo GF1

### Objetivo
- Implementar en la app el formulario de gasto elegido desde `docs/expense_form_variants_v22.html`: variante GF3 con fondo GF1.
- Eliminar la palabra `ticket` del encabezado de esa variante.
- Mantener este cambio acotado al formulario de `Gasto`, sin tocar el formulario de `Ingreso` ni los formularios de `Metas`.

### Cambios
- `frontend/scripts/forms.js`: el modal de movimiento ahora recibe `movement-expense-modal` cuando se abre como gasto, y `movement-income-modal` cuando se abre como ingreso.
- `frontend/styles/main.css`: se agrego el estilo encapsulado de `movement-expense-modal` con filas label/campo, separadores punteados, botones oscuros y fondo texturado GF1.
- `docs/expense_form_variants_v22.html`: GF3 ahora usa el fondo GF1 y ya no muestra `ticket` en la esquina superior derecha.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.66` y cache PWA a `finanzas-lcd-v74`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt 104 y su resumen operativo.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js`: sin errores.
- `node --check frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- `rg` sobre `frontend` y `docs/expense_form_variants_v22.html`: sin `ticket`, `v2.65`, `APP_VERSION: 'v2.65'` ni `finanzas-lcd-v73`.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.66`, `APP_VERSION: 'v2.66'`, `finanzas-lcd-v74` y CSS con `movement-expense-modal`.
- `git diff --check`: sin errores, solo avisos CRLF esperados en Windows.

### Despliegue
- Commit principal: `a3f6b9f` (`Implementar formulario gasto GF3`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.66` sirve `v2.66`, `APP_VERSION: 'v2.66'`, `finanzas-lcd-v74`, CSS/JS con `movement-expense-modal` y sin `ticket`.

### Pendientes
- Revisar visualmente el formulario de gasto en el celular instalado despues de tocar `Actualizar app`.

## 2026-06-20 - Preview de fondos y sombras de tarjetas

### Objetivo
- Proponer variantes visuales para la seccion `En lo que va de ... gastaste` antes de modificar la app.
- Definir un fondo extrapolable al resto de tarjetas y una sombra mas pixel art, evitando puntas diagonales.
- Implementar la estetica DD elegida en todas las tarjetas de la app.
- Corregir el alcance: revertir la aplicacion global y dejar DD solo en la tarjeta fusionada de Resumen.
- Implementar la variante GG para mejorar legibilidad de la tarjeta fusionada.
- Corregir la trama superior que seguia ensuciando la tarjeta GG.
- Hacer que la tarjeta real coincida mejor con el preview GG elegido.
- Eliminar por completo los puntitos sobre la tarjeta de Resumen.
- Convertir la sombra punteada en tiras externas para que no pueda ocupar el interior de la tarjeta.
- Ajustar el contenido de la tarjeta: titulo en una linea, monto pixelado y bloque inferior solo con el elemento principal.
- Agrandar el titulo `EN LO QUE VA DE [MES] GASTASTE`, simplificar el KPI de mayor gasto y extender ese skin a las demas tarjetas de Resumen sin cambiar sus estructuras.
- Centrar el titulo de gasto mensual y aclarar que el cuadro inferior muestra en que se gasto mas durante el mes.
- Quitar el marco interno de mayor gasto, separar con linea intermitente y mostrar `EN LO QUE MAS GASTASTE FUE EN` centrado sobre el gasto.
- Implementar la opcion B de `Plata disponible`, manteniendo el porcentaje junto al progress bar y dejando `Particion sueldo` sin cambios productivos.
- Ajustar definitivamente `Plata disponible` a la opcion B del preview, retirando la barra `window-title` negra y usando titulo simple interno.
- Igualar `Plata disponible` a la opcion B del preview local, copiando medidas, fondo, recuadro de monto y progress bar simple.

### Cambios
- `docs/card_background_shadow_variants.html`: lamina local con cuatro variantes de fondo y sombra: cuadricula LCD limpia, dithering de puntos, scanline bajo relieve y mixto LCD cuadricula + puntos.
- `docs/card_background_shadow_variants_v2.html`: segunda lamina local con variantes E-H, bordes mas definidos y sombras de puntillismo pixel art mas visibles.
- `docs/card_background_shadow_variants_v3.html`: tercera lamina local con variantes I-L, combinando borde de E, fondo de H, puntillismo reducido y sombras menos desplazadas.
- `docs/card_inner_layout_variants_v4.html`: cuarta lamina local con la base fondo J + sombra I y seis organizaciones internas M-R.
- `docs/card_combined_summary_variants_v5.html`: quinta lamina local con tarjeta fusionada de gasto mensual y `Gastaste mas en`, comparando fondos AA-FF.
- `docs/card_combined_summary_variants_v6.html`: sexta lamina local con fondos GG-LL mas legibles para la tarjeta fusionada y sombra derecha con una columna extra de puntitos.
- `frontend/scripts/render.js`: se fusiono el bloque `En lo que va de ... gastaste` con `Gastaste mas en` en una unica tarjeta `summary-combined-card`.
- `frontend/styles/main.css`: se retiro el skin DD global y se dejo DD acotado solo a `summary-combined-card`.
- `frontend/styles/main.css`: se implemento el fondo GG en `summary-combined-card`, mas limpio y legible, con sombra derecha ampliada para una columna extra de puntitos.
- `frontend/scripts/render.js`: la vista Resumen ahora marca `#app-screen` con la clase `is-summary-screen`.
- `frontend/styles/main.css`: se redujo la superposicion de `lcd-screen::after` solo en Resumen y se aislo `summary-combined-card` para que no reciba puntitos encima.
- `frontend/scripts/render.js`: la tarjeta fusionada ahora incluye la fila inferior del bloque `Gastaste mas en`, con rank y monto del movimiento mas alto del mes.
- `frontend/styles/main.css`: la capa superior de Resumen ya no dibuja trama punteada y se agregaron estilos para la fila inferior del bloque superior.
- `frontend/styles/main.css`: se desactivo por completo la capa `lcd-screen.is-summary-screen::after` y se volvieron opacos los bloques internos de `summary-combined-card`.
- `frontend/styles/main.css`: la sombra punteada de `summary-combined-card` ahora son dos tiras externas separadas, derecha e inferior, en vez de un rectangulo detras de toda la tarjeta.
- `frontend/scripts/render.js`: el titulo superior queda en una sola linea, el monto usa `renderSummaryPixelSvg(..., 'amount')`, y el bloque inferior ya no imprime `Gastaste mas en`.
- `frontend/styles/main.css`: se agregaron estilos para `summary-combined-amount` y `summary-pixel-amount`.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.54` y cache a `finanzas-lcd-v62`.
- `frontend/scripts/render.js`: el KPI inferior de mayor gasto deja de mostrar la fila secundaria de rank/monto y queda solo con el elemento principal.
- `frontend/styles/main.css`: el titulo superior de la tarjeta fusionada es mas grande y el skin de fondo/borde/sombra se comparte con `Plata disponible` y `Particion sueldo`.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.55` y cache a `finanzas-lcd-v63`.
- `frontend/scripts/render.js`: se agrego la etiqueta `MAS GASTASTE ESTE MES EN` en el cuadro inferior de la tarjeta fusionada.
- `frontend/styles/main.css`: se centro `summary-combined-title` y se agrego estilo compacto para `summary-combined-top-label`.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.56` y cache a `finanzas-lcd-v64`.
- `frontend/scripts/render.js`: se agrego una segunda linea `summary-combined-divider` antes del bloque de mayor gasto y la etiqueta paso a `EN LO QUE MAS GASTASTE FUE EN`.
- `frontend/styles/main.css`: se elimino el fondo/borde del bloque `summary-combined-top` para que quede integrado sin marco interno.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.57` y cache a `finanzas-lcd-v65`.
- `frontend/scripts/render.js`: `Plata disponible` ahora usa la clase `availability-card-b`.
- `frontend/styles/main.css`: se agrego el display central de monto para `availability-card-b`; el porcentaje sigue en `renderProgressMeter`.
- `docs/summary_available_partition_variants.html`: preview de opciones A-F agregado al repositorio.
- `docs/salary_partition_variants_v2.html`: segunda lamina de opciones G-J para redisenar `Particion sueldo`.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.58` y cache a `finanzas-lcd-v66`.
- `frontend/scripts/render.js`: `Plata disponible` usa `availability-b-title` y `availability-b-divider` en vez de `window-title`.
- `frontend/styles/main.css`: override final actualizado para que la tarjeta B no herede la barra negra de `window-title`.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.60` y cache a `finanzas-lcd-v68`.
- `frontend/styles/main.css`: `availability-card-b` ahora replica los valores de la opcion B del preview: `min-height: 190px`, radio `7px`, fondo `lcd-card`, monto central de `82px` y progress bar sin marco contenedor.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.61` y cache a `finanzas-lcd-v69`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompt y resumen operativo actualizados.

### Verificacion
- Se abrio el preview local con `Start-Process .\docs\card_background_shadow_variants.html`.
- Se abrio el preview local con `Start-Process .\docs\card_background_shadow_variants_v2.html`.
- Se abrio el preview local con `Start-Process .\docs\card_background_shadow_variants_v3.html`.
- Se abrio el preview local con `Start-Process .\docs\card_inner_layout_variants_v4.html`.
- Se abrio el preview local con `Start-Process .\docs\card_combined_summary_variants_v5.html`.
- Se abrio el preview local con `Start-Process .\docs\card_combined_summary_variants_v6.html`.
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- Busqueda `rg` de `v2.53`, `finanzas-lcd-v61` y `APP_VERSION: 'v2.53'` en `frontend`: sin resultados.
- Servidor local `http://127.0.0.1:4173/`: sirve `v2.54`.
- Verificacion especifica de tarjeta: sin `<br>GASTASTE`, monto con SVG pixel, sin label `Gastaste mas en`, glifos `G` y `.` presentes.
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: assets sin faltantes.
- Busqueda `rg` de `v2.54`, `finanzas-lcd-v62` y `APP_VERSION: 'v2.54'` en `frontend`: sin resultados.
- Verificacion especifica `v2.55`: titulo sin salto, monto pixelado, KPI inferior simple y skin compartido en tarjetas de Resumen.
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: assets sin faltantes.
- Busqueda `rg` de `v2.55`, `finanzas-lcd-v63` y `APP_VERSION: 'v2.55'` en `frontend`: sin resultados.
- Verificacion especifica `v2.56`: etiqueta `MAS GASTASTE ESTE MES EN`, titulo centrado, CSS de label y cache `finanzas-lcd-v64`.
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: assets sin faltantes.
- Busqueda especifica de `v2.56`, `finanzas-lcd-v64` y `APP_VERSION: 'v2.56'` en `frontend`: sin resultados.
- Verificacion especifica `v2.57`: label `EN LO QUE MAS GASTASTE FUE EN`, dos lineas intermitentes y bloque inferior sin marco interno.
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Conteo de llaves CSS en `main.css`: llaves balanceadas.
- Validacion de assets de `frontend/service-worker.js`: assets sin faltantes.
- Busqueda especifica de `v2.57`, `finanzas-lcd-v65` y `APP_VERSION: 'v2.57'` en `frontend`: sin resultados.
- Verificacion especifica `v2.58`: clase `availability-card-b`, progress bar sigue renderizando `porcentajeDisponible`, CSS de tarjeta B presente y cache `finanzas-lcd-v66`.
- Verificacion especifica `v2.61`: GitHub Pages sirve `v2.61`, `APP_VERSION: 'v2.61'`, cache `finanzas-lcd-v69`, `availability-b-title`, sin `window-title` en `Plata disponible`, `min-height: 190px`, monto central de `82px` y progress bar simple.

### Despliegue
- Commit principal: `87de50a` (`Pixelar monto de tarjeta resumen`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.54` sirve `v2.54`, `APP_VERSION: 'v2.54'`, cache `finanzas-lcd-v62`, titulo sin `<br>GASTASTE`, monto con `renderSummaryPixelSvg(..., 'amount')` y sin label `Gastaste mas en`.
- Commit principal: `40eaed4` (`Refinar tarjetas de resumen`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.55` sirve `v2.55`, `APP_VERSION: 'v2.55'`, cache `finanzas-lcd-v63`, titulo en una linea, monto pixelado, KPI inferior simple y skin compartido en `Plata disponible` / `Particion sueldo`.
- Commit principal: `a3aea47` (`Aclarar KPI de mayor gasto`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.56` sirve `v2.56`, `APP_VERSION: 'v2.56'`, cache `finanzas-lcd-v64`, label `MAS GASTASTE ESTE MES EN` y titulo centrado.
- Commit principal: `43316fb` (`Simplificar bloque de mayor gasto`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.57` sirve `v2.57`, `APP_VERSION: 'v2.57'`, cache `finanzas-lcd-v65`, label `EN LO QUE MAS GASTASTE FUE EN`, dos separadores intermitentes y bloque inferior sin marco interno.
- Commit principal: `846fbe3` (`Aplicar tarjeta disponible B`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.58` sirve `v2.58`, `APP_VERSION: 'v2.58'`, cache `finanzas-lcd-v66`, tarjeta `availability-card-b` y progress bar con porcentaje disponible.
- Commit principal: `d36a275` (`Igualar disponible a opcion B`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.61` sirve `v2.61`, `APP_VERSION: 'v2.61'`, cache `finanzas-lcd-v69` y estructura visual de `Plata disponible` alineada a la opcion B del preview.

### Pendientes
- Revisar visualmente en el celular instalado despues de tocar `Actualizar app`.

## 2026-06-20 - Pixel font real P6 en Resumen

### Objetivo
- Implementar la variante P6 elegida para el bloque `Hoy es` / fecha del Resumen.
- Mantener la fecha dentro del marco con ajuste responsive.
- Corregir el escalado para que la fecha quede grande debajo de `HOY ES` y no se vea pequeña o desplazada.
- Corregir la visibilidad de la fecha reemplazando canvas por SVG de pixeles reales.
- Corregir la cascada CSS para que la fecha no quede al lado de `HOY ES`.

### Cambios
- `frontend/scripts/render.js`: el bloque de bienvenida usa glifos bitmap 5x7 con pixeles activos y ghost de segmentos apagados.
- `frontend/scripts/render.js`: el escalado del canvas ahora permite crecer por ancho disponible, separando proporciones de label y fecha.
- `frontend/scripts/render.js`: `HOY ES` y la fecha ahora se renderizan como SVG de rectangulos pixel, evitando fallas donde solo aparecia el label.
- `frontend/styles/main.css`: se ampliaron los altos de `summary-pixel-label` y `summary-pixel-date`, y la fecha queda en contenedor limpio sin borde heredado.
- `frontend/styles/main.css`: se agregaron estilos para `summary-pixel-svg`, rectangulos activos y ghost.
- `frontend/styles/main.css`: se agrego una regla final para resetear `grid-template-columns` a una sola columna y ubicar la fecha debajo.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.45` y cache a `finanzas-lcd-v53`.
- `docs/summary_welcome_pixel_font_options.html` y `docs/summary_welcome_true_pixel_font_options.html`: previews locales usados para la decision visual.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: prompts y resumen operativo actualizados.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- Conteo de llaves CSS en `main.css`, `responsive.css` y `lcd-theme.css`: llaves balanceadas.
- `node -e` parseando `frontend/manifest.json`: `manifest OK`.
- Validacion de assets de `frontend/service-worker.js`: 24 assets, sin faltantes.
- Busqueda `rg` de `v2.44`, `finanzas-lcd-v52` y `APP_VERSION: 'v2.44'` en `frontend`: sin resultados.
- Servidor local `http://127.0.0.1:4173/`: sirve `v2.45`.

### Despliegue
- Commit principal: `d2c864b` (`Corregir fecha debajo de hoy es`) subido a `origin/main`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.45` sirve `v2.45`, `APP_VERSION: 'v2.45'`, cache `finanzas-lcd-v53` y CSS con `grid-template-columns: minmax(0, 1fr)` para el bloque de fecha.
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

## 2026-06-21 - Variantes de particion sueldo en torta

### Objetivo
- Volver desde la exploracion 10x10 a particiones con torta 3D para revisar encuadre, leyenda y jerarquia visual.

### Cambios
- `docs/salary_partition_pie_refocus_variants_v12.html`: nueva lamina local con variantes XX-BBB basadas en torta 3D volumetrica.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: registro del prompt y resumen operativo.

### Verificacion
- Se valido que la lamina existe y contiene las variantes XX-BBB con `data-pie`.
- No se modifico la app productiva ni se desplego nueva version.

### Pendientes
- El usuario debe elegir o descartar una de las variantes de torta antes de incorporarla a `frontend/`.

## 2026-06-21 - Implementacion AAA en particion sueldo

### Objetivo
- Incorporar en la app real la variante AAA elegida para `Particion sueldo`.

### Cambios
- `frontend/scripts/render.js`: la tarjeta ahora muestra encabezado con disponible, resumen `Sueldo distribuido` arriba, torta 3D al centro y leyenda debajo.
- `frontend/styles/main.css`: nuevo override final `salary-partition-aaa` para reproducir el layout AAA y mejorar legibilidad de leyenda.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.62` y cache a `finanzas-lcd-v70`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro el prompt y el resumen operativo.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- `rg` confirmo `v2.62`, `finanzas-lcd-v70`, `salary-partition-aaa` y ausencia de `v2.61`/`finanzas-lcd-v69` en `frontend/`.
- Servidor local `http://127.0.0.1:4173`: `index.html`, `scripts/config.js`, `service-worker.js` y `scripts/render.js` sirven la version nueva.
- Llaves CSS balanceadas en `main.css`, `responsive.css` y `lcd-theme.css`.
- Assets declarados en `frontend/service-worker.js`: todos existen.
- `git diff --check`: sin errores, solo avisos esperados de CRLF en Windows.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.62` sirve `v2.62`, `APP_VERSION: 'v2.62'`, `finanzas-lcd-v70`, `render.js?v=2.62`, `main.css?v=2.62`, `salary-partition-aaa` y el CSS de la variante AAA.

### Pendientes
- Revisar visualmente en el celular instalado y tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-21 - Implementacion BTN2 en botonera inferior

### Objetivo
- Incorporar en la app real la variante BTN2 elegida para que la botonera inferior evoque botones fisicos de goma redondeada.

### Cambios
- `frontend/index.html`: header ajustado para mostrar `PIREPIRAPP` y `v2.63` juntos a la izquierda; el estado/conexion queda a la derecha.
- `frontend/styles/main.css`: override final BTN2 para `AGREGAR` y navegacion inferior, con capuchon oscuro redondeado, textura grafito, relieve interno y pared inferior.
- `frontend/styles/responsive.css`: ajuste responsive del header para que nombre, version y estado no se compriman en pantallas chicas.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.63` y cache a `finanzas-lcd-v71`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: se registro la seleccion e implementacion de BTN2.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- `rg` confirmo ausencia de `v2.62` y `finanzas-lcd-v70` en `frontend/`.
- `rg` confirmo `v2.63`, `finanzas-lcd-v71`, `brand-version` y el override BTN2 en los archivos esperados.
- Llaves CSS balanceadas en `main.css`, `responsive.css` y `lcd-theme.css`.
- Assets declarados en `frontend/service-worker.js`: 24 assets, sin faltantes.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.63`, `finanzas-lcd-v71` y el CSS `botonera inferior fisica`.
- `git diff --check`: sin errores, solo avisos esperados de CRLF en Windows.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.63` sirve `v2.63`, `APP_VERSION: 'v2.63'`, `finanzas-lcd-v71` y el CSS BTN2.

### Pendientes
- Revisar visualmente en el celular instalado y tocar `Actualizar app` si mantiene cache anterior.

## 2026-06-21 - Variantes de formulario AGREGAR

### Objetivo
- Proponer alternativas para el emergente que aparece al presionar `AGREGAR` en Resumen y en Metas, antes de modificar la app productiva.

### Cambios
- `docs/add_modal_form_variants_v20.html`: lamina local con variantes AF1-AF4 del selector/formulario emergente.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: registro del prompt y resumen operativo.

### Verificacion
- Se abrio la lamina local con `Start-Process .\docs\add_modal_form_variants_v20.html`.
- `rg` confirmo la presencia de AF1-AF4, los contextos Resumen/Metas y los iconos reales de navegacion.
- No se modifico la app productiva ni se desplego nueva version.

### Pendientes
- Elegir una variante o combinar elementos antes de incorporarla a `frontend/`.

## 2026-06-21 - Variantes especificas AF3

### Objetivo
- Profundizar la opcion AF3 del emergente `AGREGAR`, manteniendo la idea de lista numerada terminal.

### Cambios
- `docs/add_modal_form_af3_variants_v21.html`: lamina local con variantes AF3A-AF3E.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: registro del prompt y resumen operativo.

### Verificacion
- Se abrio la lamina local con `Start-Process .\docs\add_modal_form_af3_variants_v21.html`.
- `rg` confirmo AF3A-AF3E y el uso de iconos reales de navegacion.
- No se modifico la app productiva ni se desplego nueva version.

### Pendientes
- Elegir una variante AF3 o pedir ajustes antes de incorporarla a `frontend/`.

## 2026-06-21 - Implementacion AF3B y variantes de formulario gasto

### Objetivo
- Implementar el selector `AGREGAR` como AF3B con fondo AF3A y continuar el trabajo visual por formularios, empezando por Gasto.

### Cambios
- `frontend/scripts/forms.js`: `AGREGAR` ahora abre un selector numerado compacto con opciones propias de Resumen o Metas; se agrego clase opcional para modales.
- `frontend/styles/main.css`: estilos `action-menu-modal` y `add-action-*` para AF3B con fondo claro/scanline AF3A.
- `frontend/styles/responsive.css`: el selector pasa a una columna en pantallas angostas.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.64` y cache a `finanzas-lcd-v72`.
- `docs/add_modal_form_af3_variants_v21.html`: AF3B actualizado con fondo AF3A y sin `panel compacto`.
- `docs/expense_form_variants_v22.html`: lamina local con variantes GF1-GF4 del formulario de gasto.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: registro del prompt y resumen operativo.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- `rg` confirmo ausencia de `v2.63` y `finanzas-lcd-v71` en `frontend/`.
- `rg` confirmo `v2.64`, `finanzas-lcd-v72`, `action-menu-modal`, `add-action-menu` y `APP_VERSION` en los archivos esperados.
- Llaves CSS balanceadas en `main.css`, `responsive.css` y `lcd-theme.css`.
- Assets declarados en `frontend/service-worker.js`: 24 assets, sin faltantes.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.64`, `finanzas-lcd-v72`, `forms.js` con `action-menu-modal` y CSS con `Selector AGREGAR`.
- `rg` confirmo ausencia de `panel compacto` en `frontend/` y previews relacionados.
- Se abrieron localmente `docs/add_modal_form_af3_variants_v21.html`, `docs/expense_form_variants_v22.html` y `http://127.0.0.1:4173/index.html`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.64` sirve `v2.64`, `APP_VERSION: 'v2.64'`, `finanzas-lcd-v72`, `forms.js` con `action-menu-modal` y CSS del selector.

### Pendientes
- Elegir variante de formulario de gasto antes de trabajar formularios de Metas.

## 2026-06-21 - Popup AGREGAR y sincronizacion robusta

### Objetivo
- Hacer que el menu `AGREGAR` se despliegue encima de los botones inferiores sin tapar toda la pantalla.
- Corregir inconsistencias donde un gasto recien agregado aparecia y luego desaparecia por refrescos remotos tardios.

### Cambios
- `frontend/scripts/forms.js`: `AGREGAR` se puede cerrar tocando nuevamente el boton inferior; el menu se posiciona dinamicamente encima de `.key-zone`.
- `frontend/styles/main.css`: el selector `AGREGAR` ya no usa cortina oscura; queda como popup anclado con punta inferior.
- `frontend/scripts/app.js`: guards de movimientos persistentes en `localStorage`, TTL extendido a 5 minutos y refresh de movimientos diferido a 10 segundos.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`: version subida a `v2.65` y cache a `finanzas-lcd-v73`.
- `docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md`: registro del prompt y resumen operativo.

### Causa raiz
- El alta/edicion/borrado de movimientos ya se aplicaba de forma optimista, pero un `refresh` en segundo plano podia traer un bootstrap de Sheets aun desactualizado y pisar el estado local. La app tenia guards en memoria, pero eran cortos y no sobrevivian recargas.

### Verificacion
- `node --check` sobre `frontend/scripts/*.js` y `frontend/service-worker.js`: sin errores.
- `rg` confirmo ausencia de `v2.64` y `finanzas-lcd-v72` en `frontend/`.
- `rg` confirmo `v2.65`, `finanzas-lcd-v73`, `positionActionMenu`, `is-action-menu`, `finanzasMovementSyncGuards`, `MOVEMENT_GUARD_TTL_MS` y `MOVEMENT_REFRESH_DELAY_MS`.
- Llaves CSS balanceadas en `main.css`, `responsive.css` y `lcd-theme.css`.
- Assets declarados en `frontend/service-worker.js`: 24 assets, sin faltantes.
- Servidor local `http://127.0.0.1:4173`: sirve `v2.65`, `finanzas-lcd-v73`, `forms.js` con `positionActionMenu`, `app.js` con `finanzasMovementSyncGuards` y CSS con `modal-root.is-action-menu`.
- `git diff --check`: sin errores, solo avisos esperados de CRLF en Windows.
- Se abrio localmente `http://127.0.0.1:4173/index.html`.
- GitHub Pages publico: `https://nicolasverar.github.io/pirepirapp/?v=2.65` sirve `v2.65`, `APP_VERSION: 'v2.65'`, `finanzas-lcd-v73`, popup anclado y guards persistentes.

### Pendientes
- Validar en uso real con un gasto nuevo desde la PWA instalada.

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
- Busqueda de rutas locales absolutas en los dos documentos solicitados: sin rutas locales absolutas.
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
