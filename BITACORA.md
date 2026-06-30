# Bitacora - Pirepirapp

## 2026-06-30 - Ajustes finos onboarding y montos v4.0.1

### Objetivo
- Ajustar el tutorial integrado segun la revision visual del usuario.
- Formatear montos con puntos de miles en toda la app, no solo en onboarding.
- Mantener la version visible `v4.0` y forzar cache-busting interno con `4.0.1`.

### Cambios
- `frontend/scripts/onboarding.js` cambia `SUELDO` por `INGRESAR SUELDO`, elimina el caption `Cuanto soles cobrar?`, deja `GASTOS FIJOS` en una sola linea con `maxChars: 12` y cambia el cierre a `AHORA TODO LISTO` con `YA PODES EMPEZAR ;-)`.
- `frontend/styles/onboarding.css` baja las flechas de bienvenida, agranda levemente el caption de gastos fijos, agrega marcos a totales/secciones de ahorros/resumen y suaviza el marco de la columna de recorrido.
- `frontend/scripts/utils.js` agrega helpers de formato de monto (`formatAmountText`, `bindAmountInputs`, `setAmountInputValue`) para separar miles con puntos mientras `normalizeAmount` conserva el guardado numerico.
- `frontend/scripts/forms.js` y `frontend/scripts/render.js` aplican el formateo global a formularios, autocompletados de monto y configuracion.
- `frontend/styles/main.css` y `frontend/styles/onboarding.css` alinean a la derecha los inputs monetarios formateados.
- `frontend/index.html` sube cache-busting de assets a `4.0.1`.
- `frontend/service-worker.js` sube cache a `finanzas-lcd-v401` y precachea assets `?v=4.0.1`.
- `docs/ITERACIONES_PIREPIRAPP_2026-06-29.md` registra los prompts de esta iteracion.

### Verificacion
- `node --check frontend/scripts/utils.js`: OK.
- `node --check frontend/scripts/forms.js`: OK.
- `node --check frontend/scripts/onboarding.js`: OK.
- `node --check frontend/scripts/render.js`: OK.
- `Get-ChildItem frontend/scripts -Filter *.js | ForEach-Object { node --check $_.FullName }`: OK.
- `node --check frontend/service-worker.js`: OK.
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- Validacion Node de formato monetario: OK, `AMOUNT_FORMAT_OK`.
- Validacion estatica Node de copy/cache del onboarding: OK, `ONBOARDING_COPY_CACHE_OK`.
- `git diff --check`: OK; solo advertencias CRLF normales en Windows.

### Despliegue
- Commit: pendiente al cierre del hito.
- Push: pendiente al cierre del hito.
- URL publica a verificar: `https://nicolasverar.github.io/pirepirapp/`.

### Pendientes
- Recorrer visualmente el onboarding en dispositivo/PWA para ajustar posiciones finas de flechas si el boton fisico cambia por viewport.

## 2026-06-30 - Integracion onboarding y release v4.0

### Objetivo
- Incorporar a la app real el tour inicial trabajado en B3.
- Subir la version visible y cache-busting a `v4.0`.
- Endurecer el guardado local y ampliar la corrida de integridad.
- Revisar basura/local ignored sin borrar dependencias o salidas necesarias para builds.

### Cambios
- `frontend/scripts/onboarding.js` agrega un onboarding real de primer inicio, saltable, con pasos de bienvenida, sueldo, gastos fijos, ahorros y resumen.
- `frontend/styles/onboarding.css` incorpora el layout LCD/pixel del tour dentro de la app, reutilizando la estetica y botones fisicos.
- `frontend/scripts/app.js` inicializa el onboarding tras el bootstrap local.
- `frontend/scripts/render.js` pausa el render principal mientras el onboarding esta activo para evitar parpadeos o reemplazos de pantalla.
- `frontend/scripts/local-store.js` conserva `onboardingVersion`, `onboardingUpdatedAt` y `plazo` en ahorros/metas/wishlist, arrastra plazo al convertir wishlist a meta y registra metadata diagnostica de ultima escritura local.
- `frontend/index.html`, `frontend/scripts/config.js`, `frontend/service-worker.js`, `package.json` y `package-lock.json` pasan a `v4.0`; el service worker productivo sube a `finanzas-lcd-v400` e incluye `onboarding.css/js`.
- `frontend/previews/onboarding-terminal.html` y `frontend/previews/onboarding-console.html` actualizan referencias base a `v4.0`.
- `scripts/smoke-local-store.js` valida version/plazos de onboarding y metadata de guardado local.
- `README.md` documenta `v4.0`, onboarding inicial y metadata de guardado.
- `docs/ITERACIONES_PIREPIRAPP_2026-06-29.md` registra el prompt de esta iteracion.

### Verificacion
- `Get-ChildItem frontend/scripts -Filter *.js | ForEach-Object { node --check $_.FullName }`: OK.
- `node --check frontend/service-worker.js`: OK.
- `node --check scripts/smoke-local-store.js`: OK.
- Validacion estatica Node de `v4.0`, `onboarding.css/js` y `finanzas-lcd-v400`: OK, `STATIC_V4_OK`.
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- Validacion Node de compuerta de onboarding: OK, `ONBOARDING_GATE_OK`.
- `git diff --check`: OK; solo advirtio normalizacion CRLF de Windows.
- `rg --files -g "*.tmp" -g "*.bak" -g "*.log" -g "*.old" -g "*.json.backup" -g "Thumbs.db" -g ".DS_Store"`: sin archivos basura versionables.
- `git clean -ndX`: solo listo dependencias/caches/salidas ignoradas (`node_modules`, `.tool-cache`, Gradle, Android build, `frontend/data`); no se borraron porque son generados locales utiles o potencialmente necesarios para builds.

### Despliegue
- `git commit -m "Integrar onboarding inicial v4.0"`: OK, commit `07c0608`.
- `git push origin main`: OK, `613a02d..07c0608`.
- GitHub Actions Pages: OK, run `https://github.com/nicolasverar/pirepirapp/actions/runs/28454259647`, `completed/success`.
- URL publica `https://nicolasverar.github.io/pirepirapp/?v=07c0608c`: OK, sirve `v4.0`, `onboarding.js?v=4.0` y `onboarding.css?v=4.0`.
- URL publica `scripts/config.js?v=07c0608c`: OK, contiene `APP_VERSION: 'v4.0'`.
- URL publica `service-worker.js?v=07c0608c`: OK, contiene `finanzas-lcd-v400` y precache de `onboarding.js?v=4.0`.
- URL publica `scripts/onboarding.js?v=07c0608c`: OK, contiene `pirepirappOnboarding:v4.0`.
- URL publica `styles/onboarding.css?v=07c0608c`: OK, contiene `.onboarding-stage`.

### Pendientes
- Recorrido visual manual en navegador/PWA para ajustar microespaciado real del onboarding si aparece algun detalle de pantalla.

## 2026-06-30 - B3 centrado y compactacion final

### Objetivo
- Centrar correctamente el texto LCD que se escribe.
- Eliminar la bajada de `AHORROS` para que no reserve espacio vertical.
- Compactar el bloque tutorial y quitar reservas flexibles que generaban espacio muerto.

### Cambios
- `frontend/previews/onboarding-terminal.html` y `frontend/previews/onboarding-console.html` suben cache-busting a `20260630-a`.
- `frontend/previews/onboarding.js` deja vacio el caption de `AHORROS`.
- El SVG del texto LCD cambia a `preserveAspectRatio="xMidYMid meet"`.
- El generador `pixelText()` calcula `baseY` para centrar verticalmente las lineas escritas dentro del `viewBox`.
- `frontend/previews/onboarding.css` reduce `--onboarding-copy-height` a `94px`, elimina la fila flexible del stage y compacta el display principal.
- La bienvenida deja de reservar la linea superior invisible: ahora se oculta con `display: none`.
- Se actualizo `docs/ITERACIONES_PIREPIRAPP_2026-06-29.md` con el prompt de esta iteracion y fecha de ultima edicion.

### Verificacion
- `node --check frontend\previews\onboarding.js`: OK.
- Validacion estatica Node de cache-busting `20260630-a`, AHORROS sin caption, centrado `xMidYMid`, `baseY` y altura compacta: OK, `onboarding center compact static ok`.
- Validacion runtime Node con DOM simulado para bienvenida, AHORROS y campos de plazo: OK, `onboarding center compact runtime ok`.
- `git diff --check`: OK.
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git commit -m "Centrar y compactar onboarding B3"`: OK, commit `573bc22`.
- `git push origin main`: OK.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding-console.html?v=573bc22-2`: OK, contiene `PROTO B3` y cache-busting `onboarding.js?v=20260630-a` / `onboarding.css?v=20260630-a`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.js?v=573bc22-2`: OK, no contiene la bajada de `AHORROS`; contiene `preserveAspectRatio="xMidYMid meet"` y centrado vertical con `baseY`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.css?v=573bc22-2`: OK, contiene `--onboarding-copy-height: 94px`, filas compactas y `display: none` para la linea superior de bienvenida.

### Pendientes
- Recorrer visualmente B3 para confirmar que el titulo centrado no quede demasiado chico.

## 2026-06-29 - B3 compactacion y plazos en ahorros

### Objetivo
- Eliminar espacio vertical sobrante en `PROTO B3`.
- Quitar elementos redundantes: frase final `Ya podes usar la app`, pasos inferiores y guiones horizontales de completacion.
- Ajustar `AHORROS` para indicar `Anadir ahorro segun se trate de:` y permitir cargar plazos de tiempo.

### Cambios
- `frontend/previews/onboarding-terminal.html` y `frontend/previews/onboarding-console.html` suben cache-busting a `20260629-i`.
- `frontend/previews/onboarding.js` elimina `renderProgress()` y deja de renderizar la fila inferior de pasos/guiones.
- Se elimina el copy final duplicado `Ya podes usar la app`; el cierre queda como `LISTO` con resumen.
- `AHORROS` cambia su bajada a `Anadir ahorro segun se trate de:`.
- Se agregan plazos editables en ahorro de futuro, metas y cosas que quiero.
- `frontend/previews/onboarding.css` reduce `--onboarding-copy-height` a `118px`, elimina estilos de progreso inferior y compacta formularios, riel, resumen, inputs y selectores.
- Se actualizo `docs/ITERACIONES_PIREPIRAPP_2026-06-29.md` con el prompt de esta iteracion.

### Verificacion
- `node --check frontend\previews\onboarding.js`: OK.
- Validacion estatica Node de cache-busting `20260629-i`, eliminacion de progreso inferior, copy duplicado y altura compacta: OK, `onboarding compact static ok`.
- Validacion runtime Node con DOM simulado para `AHORROS`, toggles, campos de plazo y resumen final sin redundancias: OK, `onboarding compact runtime ok`.
- `git diff --check`: OK.
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git commit -m "Compactar onboarding B3 y ahorros"`: OK, commit `c5e0943`.
- `git push origin main`: OK.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding-console.html?v=c5e0943`: OK, contiene `PROTO B3` y cache-busting `onboarding.js?v=20260629-i` / `onboarding.css?v=20260629-i`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.js?v=c5e0943`: OK, no contiene `renderProgress`, `progress-slot` ni `Ya podes usar la app`; contiene copy nuevo de ahorros y campos `term`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.css?v=c5e0943`: OK, contiene `--onboarding-copy-height: 118px`, controles compactos y no contiene estilos de progreso inferior.

### Pendientes
- Revisar visualmente si el nuevo alto `118px` elimina el aire vertical sin cortar titulos LCD.

## 2026-06-29 - B3 altura consistente del tutorial

### Objetivo
- Mantener una altura consistente del bloque tutorial en todas las diapositivas.
- Subir la grilla/formulario para aprovechar mejor el espacio inferior.
- Conservar el texto LCD grande sin volver a agrandar el bloque completo.

### Cambios
- `frontend/previews/onboarding-terminal.html` y `frontend/previews/onboarding-console.html` suben cache-busting a `20260629-h`.
- `frontend/previews/onboarding.css` introduce `--onboarding-copy-height: 150px` como altura comun del tutorial.
- La grilla principal de cada diapositiva ahora reserva la misma fila para el tutorial: `auto var(--onboarding-copy-height) minmax(0, 1fr) auto`.
- La bienvenida deja de centrarse con una estructura especial; conserva el espacio de la linea superior invisible para que el bloque empiece a la misma altura que las demas diapositivas.
- Se reducen gaps y altura de contenedores inferiores para que formulario, riel y resumen arranquen mas arriba.
- En mobile se usa `--onboarding-copy-height: 136px` y se mantiene el ajuste proporcional del display LCD.
- Se actualizo `docs/ITERACIONES_PIREPIRAPP_2026-06-29.md` con el prompt de esta iteracion.

### Verificacion
- `node --check frontend\previews\onboarding.js`: OK.
- Validacion estatica Node de cache-busting `20260629-h`, altura fija del tutorial y ausencia de alturas viejas: OK, `onboarding layout h static ok`.
- Validacion runtime Node con DOM simulado para bienvenida, sueldo, gastos fijos y ahorros: OK, `onboarding layout h runtime ok`.
- `git diff --check`: OK.
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git commit -m "Unificar altura del onboarding B3"`: OK, commit `c1ceab7`.
- `git push origin main`: OK.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding-console.html?v=c1ceab7`: OK, contiene `PROTO B3` y cache-busting `onboarding.js?v=20260629-h` / `onboarding.css?v=20260629-h`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.css?v=c1ceab7`: OK, contiene altura comun `--onboarding-copy-height: 150px`, filas compartidas y no contiene las alturas viejas `178px` / `190px`.

### Pendientes
- Revisar visualmente en navegador si el formulario quedo suficientemente alto en cada diapositiva.

## 2026-06-29 - B3 escritura lenta y flechas pixel

### Objetivo
- Refinar `PROTO B3` segun feedback visual sobre el cierre, el tamano de texto y las flechas de bienvenida.
- Eliminar la frase final `Empieza el bailongo`.
- Hacer la escritura LCD mas grande y mas lenta.
- Rehacer las tres flechas como pixel art centrado con movimiento vertical visible.

### Cambios
- `frontend/previews/onboarding-terminal.html` y `frontend/previews/onboarding-console.html` suben cache-busting a `20260629-g`.
- `frontend/previews/onboarding.js` elimina el bloque final `Empieza el bailongo`.
- La escritura LCD pasa de `118ms` a `176ms` por paso de tipeo.
- El display principal usa pixeles mas grandes y `viewBox` mas chico para que el texto escrito ocupe mas pantalla.
- Las flechas de bienvenida ahora se renderizan con una matriz 5x7 de celdas reales, no con pseudo-elementos gruesos.
- `frontend/previews/onboarding.css` centra las flechas, aumenta el area del display y anima las flechas entre `translateY(-8px)` y `translateY(10px)`.
- Se actualizo `docs/ITERACIONES_PIREPIRAPP_2026-06-29.md` con el prompt de esta iteracion.

### Verificacion
- `node --check frontend\previews\onboarding.js`: OK.
- Validacion runtime Node con DOM simulado para bienvenida y resumen final: OK, `onboarding runtime g ok`.
- Validacion estatica Node de cache-busting `20260629-g`, frase eliminada, delay `176ms`, display grande y flechas pixel: OK, `onboarding static g ok`.
- `git diff --check`: OK.
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git commit -m "Pulir texto y flechas B3"`: OK, commit `1caf919`.
- `git push origin main`: OK.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding-console.html?v=1caf919`: OK, contiene `PROTO B3` y cache-busting `onboarding.js?v=20260629-g` / `onboarding.css?v=20260629-g`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.js?v=1caf919`: OK, no contiene `Empieza el bailongo`, usa delay `176ms` y renderiza `renderPixelArrow()`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.css?v=1caf919`: OK, contiene display de `142px`, grilla `repeat(5, 4px)` y movimiento `translateY(-8px)` / `translateY(10px)`.

### Pendientes
- Revisar visualmente en navegador si el tamano del titulo y el rebote de flechas ya quedan en el punto esperado.

## 2026-06-29 - B3 botones fisicos y titulo grande

### Objetivo
- Ajustar `PROTO B3` segun feedback visual: sin boton redundante dentro de la pantalla de bienvenida.
- Usar el boton fisico `COMENZAR` como accion principal y guiarlo con tres flechas pixel art.
- Dar mas peso visual al titulo de cada paso por encima de la grilla/formulario.

### Cambios
- `frontend/previews/onboarding-terminal.html` y `frontend/previews/onboarding-console.html` suben cache-busting a `20260629-f`.
- El boton fisico principal inicia como `COMENZAR` para evitar flash de `SIGUIENTE`.
- `frontend/previews/onboarding.js` elimina el boton interno `COMENZAR`, renderiza tres flechas pixel art y deja solo titulos grandes con caption normal debajo.
- `SUELDO` queda como titulo grande; debajo muestra `Cuanto soles cobrar?` y el formulario ya no renderiza la tarjeta negra `Ingreso mensual`.
- `GASTOS FIJOS` y `AHORROS` siguen la misma logica: titulo grande arriba, explicacion normal debajo y formulario directo.
- `frontend/previews/onboarding.css` agranda el rectangulo superior, agrega animacion de flechas y mantiene los inputs oscuros al hacer foco.
- Se removieron restos de estilos/renderers viejos: `pixel-terminal-sub`, `onboard-start-key`, `renderQuestion` y `renderFormTitle`.
- Se actualizo `docs/ITERACIONES_PIREPIRAPP_2026-06-29.md` con el prompt de esta iteracion.

### Verificacion
- `node --check frontend\previews\onboarding.js`: OK.
- Validacion runtime Node con DOM simulado para bienvenida, sueldo, gastos fijos y ahorros: OK, `onboarding runtime ok`.
- Validacion estatica Node de B3/A3, cache-busting `20260629-f`, botones fisicos, copy actualizado, flechas y ausencia de restos viejos: OK, `onboarding static ok`.
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK.
- Captura Playwright: no ejecutada porque `playwright` y `@playwright/test` no estan instalados en el entorno local.
- `git commit -m "Ajustar bienvenida y titulos B3"`: OK, commit `561be7c`.
- `git push origin main`: OK.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding-console.html?v=561be7c`: OK, contiene `PROTO B3`, `COMENZAR` y cache-busting `onboarding.js?v=20260629-f` / `onboarding.css?v=20260629-f`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.js?v=561be7c`: OK, contiene flechas pixel art, copy actualizado y no contiene `onboard-start-key`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.css?v=561be7c`: OK, contiene titulo superior grande, foco oscuro y animacion de flechas.

### Pendientes
- Recorrer `PROTO B3` en navegador para decidir el proximo ajuste fino de espaciado.

## 2026-06-29 - Refinamiento visual B3 onboarding

### Objetivo
- Concentrar la iteracion en `PROTO B3` como base.
- Simplificar la primera pantalla a `BIENVENIDO/A` centrado y `COMENZAR`.
- Mejorar copy y visual de sueldo, gastos fijos y ahorros.

### Cambios
- `frontend/previews/onboarding-terminal.html` y `frontend/previews/onboarding-console.html` suben cache-busting a `20260629-e`.
- `frontend/previews/onboarding.js` elimina `A PIREPIRAPP` de la bienvenida y centra el texto LCD en ese paso.
- La bienvenida ya no muestra la linea superior interna del tour; los botones inferiores de la app siguen visibles desde el inicio.
- La escritura LCD se hizo mas lenta.
- La pestana `SUELDO` mantiene `Ingreso mensual` y pregunta `Cuanto soles cobrar?`; se elimino `Ingreso fijo`.
- La pestana `GASTOS FIJOS` deja el titulo limpio y cambia el copy a `Defini gastos mensuales con nombre y apellido.`.
- La pestana `AHORROS` reemplaza `FUTURO METAS COSAS` por `ELEGI QUE QUERES ANADIR` y mantiene la pregunta `Elegi que queres anadir ahora.`.
- `frontend/previews/onboarding.css` mejora el centrado de bienvenida, el contraste de campos de entrada y los selectores de ahorros.
- Se actualizo `docs/ITERACIONES_PIREPIRAPP_2026-06-29.md` con el prompt de esta iteracion.

### Verificacion
- `node --check frontend\previews\onboarding.js`: OK.
- Validacion runtime Node de bienvenida, sueldo, gastos fijos y ahorros para variantes `terminal` y `console`: OK, `ONBOARDING_B3_REFINEMENT_RUNTIME_OK`.
- Validacion estatica Node de B3, cache-busting `20260629-e`, botones visibles, copy actualizado, estilos de bienvenida/selectores y ausencia de textos viejos: OK, `ONBOARDING_B3_REFINEMENT_STATIC_OK`.
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK.
- `git commit -m "Pulir bienvenida y formularios B3"`: OK, commit `e0cd701`.
- `git push origin main`: OK.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding-console.html?v=e0cd701-1`: OK, `200`, contiene `PROTO B3` y `onboarding.js?v=20260629-e`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.js?v=e0cd701-1`: OK, `200`, contiene bienvenida sin subtitulo, copy de sueldo y gastos fijos.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.css?v=e0cd701-1`: OK, `200`, contiene centrado de bienvenida y selectores de ahorros.

### Pendientes
- Recorrer `PROTO B3` en navegador y ajustar microcopy/espaciado segun feedback visual.

## 2026-06-29 - Onboarding cuestionario A3/B3

### Objetivo
- Tomar `PROTO B2` como direccion visual preferida y refinar dos HTML de prueba A3/B3.
- Agregar pantalla inicial escrita: `BIENVENIDO/A A PIREPIRAPP` con boton `COMENZAR`.
- Reordenar el recorrido como cuestionario coherente sin datos precargados.

### Cambios
- `frontend/previews/onboarding-terminal.html` pasa a `PROTO A3` y usa `onboarding.js?v=20260629-d` / `onboarding.css?v=20260629-d`.
- `frontend/previews/onboarding-console.html` pasa a `PROTO B3` y usa `onboarding.js?v=20260629-d` / `onboarding.css?v=20260629-d`.
- `frontend/previews/onboarding.js` cambia el flujo a: bienvenida, sueldo, gastos fijos, ahorros y resumen.
- Se elimina `Dia cobro` y toda precarga de montos de ejemplo.
- La pantalla `SUELDO` pregunta `Cual es tu ingreso mensual de ser fijo?`.
- La pantalla `GASTOS FIJOS` pregunta `Defini gastos con nombre y apellido.`.
- La pantalla `AHORROS` permite seleccionar y desplegar `Futuro`, `Meta` o `Cosa que quiero`, con explicacion breve de cada opcion.
- El resumen en vivo ya no muestra disponible si no hay sueldo cargado; muestra `Sin datos cargados` o `Sueldo pendiente` segun corresponda.
- El resumen final dice `Ya podes usar la app` y muestra `Empieza el bailongo`.
- `frontend/previews/onboarding.css` elimina el gris de cajones inactivos del riel B, convierte el resumen en lineas LCD y agrega estilos de cuestionario/seleccion desplegable.
- La escritura LCD se hizo mas lenta.
- Se actualizo `docs/ITERACIONES_PIREPIRAPP_2026-06-29.md` con el prompt de esta iteracion.

### Verificacion
- `node --check frontend\previews\onboarding.js`: OK.
- Validacion runtime Node con DOM simulado, recorriendo bienvenida, sueldo, gastos fijos y ahorros en variantes `terminal` y `console`: OK, `ONBOARDING_A3_RUNTIME_OK`.
- Validacion estatica Node de A3/B3, cache-busting `20260629-d`, bienvenida, preguntas, ahorros desplegables, ausencia de precargas, `system-window` y `translateY`: OK, `ONBOARDING_A3_STATIC_OK`.
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK.
- `git commit -m "Refinar onboarding cuestionario A3 B3"`: OK, commit `82866ff`.
- `git push origin main`: OK.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding-terminal.html?v=82866ff-2`: OK, `200`, contiene `PROTO A3` y `onboarding.js?v=20260629-d`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding-console.html?v=82866ff-2`: OK, `200`, contiene `PROTO B3` y `onboarding.js?v=20260629-d`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.js?v=82866ff-2`: OK, `200`, contiene bienvenida, pregunta de sueldo y cierre `Empieza el bailongo`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.css?v=82866ff-2`: OK, `200`, contiene estilos de opciones desplegables y riel B.

### Pendientes
- Recorrer especialmente `PROTO B3` en navegador y decidir si queda como base para integrar en la app real.

## 2026-06-29 - Fix pantalla vacia onboarding A2/B2

### Objetivo
- Corregir el bug reportado: los prototipos A2/B2 mostraban solo el fondo verde LCD sin contenido.
- Evitar que una validacion solo sintactica vuelva a pasar un prototipo que falla antes de renderizar.

### Diagnostico
- La URL publica respondia `200`, pero `frontend/previews/onboarding.js` llamaba `renderProgress()` dentro de `render()` y esa funcion no existia.
- Ese `ReferenceError` ocurria antes de asignar `root.innerHTML`, dejando la pantalla LCD vacia.

### Cambios
- Se agrego `renderProgress()` en `frontend/previews/onboarding.js`.
- Se actualizo el cache-busting de `frontend/previews/onboarding-terminal.html` y `frontend/previews/onboarding-console.html` a `onboarding.js?v=20260629-c` y `onboarding.css?v=20260629-c`.
- Se amplio la validacion local con una ejecucion runtime en DOM simulado que exige que ambos prototipos rendericen formulario y progreso.
- Se actualizo `docs/ITERACIONES_PIREPIRAPP_2026-06-29.md` con el reporte del bug.

### Verificacion
- `node --check frontend\previews\onboarding.js`: OK.
- Validacion runtime Node con DOM simulado para variantes `terminal` y `console`: OK, `ONBOARDING_RUNTIME_RENDER_OK`.
- Validacion estatica Node de cache-busting, `renderProgress`, campos, acciones, viewBox fijo y ausencia de `system-window`/`translateY`: OK, `ONBOARDING_EDITABLE_STATIC_OK`.
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK.
- `git commit -m "Corregir pantalla vacia onboarding"`: OK, commit `e861f4f`.
- `git push origin main`: OK.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding-terminal.html?v=e861f4f-1`: OK, `200`, carga `onboarding.js?v=20260629-c`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding-console.html?v=e861f4f-1`: OK, `200`, carga `onboarding.js?v=20260629-c`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.js?v=e861f4f-1`: OK, `200`, contiene `function renderProgress()` y formularios.

### Pendientes
- Recorrer A2/B2 en navegador ya actualizado para confirmar la direccion visual antes de integrar persistencia real.

## 2026-06-29 - Onboarding editable A2/B2

### Objetivo
- Corregir los prototipos de onboarding inicial porque la primera version era demasiado explicativa y no permitia completar campos.
- Hacer que el texto LCD se escriba quieto, sin rebote ni cambios de escala.
- Permitir configurar en el prototipo: sueldo, gastos fijos, futuro, metas y cosas que quiero, con opcion de skip.

### Cambios
- `frontend/previews/onboarding-terminal.html` pasa a `PROTO A2` y carga `onboarding.js?v=20260629-b`.
- `frontend/previews/onboarding-console.html` pasa a `PROTO B2` y carga `onboarding.js?v=20260629-b`.
- `frontend/previews/onboarding.js` ahora mantiene un borrador editable en memoria durante el tour.
- Se reemplazaron textos largos por titulos directos: `SUELDO`, `FIJOS`, `FUTURO`, `METAS`, `COSAS`, `LISTO`.
- Se agregaron campos editables para sueldo mensual, dia de cobro, mes inicial, fijos, futuro, metas y wishlist.
- Se agregaron acciones para agregar/quitar fijos, metas y cosas que quiero.
- `frontend/previews/onboarding.css` elimina desplazamientos verticales, mantiene la matriz LCD con viewBox fijo y usa aparicion sin movimiento.
- Se actualizo `docs/ITERACIONES_PIREPIRAPP_2026-06-29.md` con el prompt de correccion.

### Verificacion
- `node --check frontend\previews\onboarding.js`: OK.
- Validacion estatica Node de variantes, cache-busting, 6 pasos, campos, acciones agregar/quitar, texto escrito y ausencia de `system-window`: OK, `ONBOARDING_EDITABLE_STATIC_OK`.
- Busqueda en prototipos de `system-window`, `translateY`, animaciones viejas y textos largos anteriores: sin resultados.
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK.
- `git commit -m "Rehacer onboarding editable"`: OK, commit `1fa5ad4`.
- `git push origin main`: OK.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding-terminal.html?v=1fa5ad4-2`: OK, `200`, contiene `PROTO A2`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding-console.html?v=1fa5ad4-2`: OK, `200`, contiene `PROTO B2`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.js?v=1fa5ad4-2`: OK, `200`, contiene campos editables y acciones agregar/quitar.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.css?v=1fa5ad4-2`: OK, `200`, contiene estilos A2/B2.

### Pendientes
- Recorrer A2/B2 visualmente con el usuario y elegir la direccion antes de integrar persistencia real en la app.

## 2026-06-29 - Prototipos onboarding inicial

### Objetivo
- Crear dos HTML de prueba para recorrer el primer arranque de la app antes de implementarlo en produccion.
- Simular el tour completo de inicio a fin: bienvenida, sueldo mensual, gastos fijos, metas/ahorros, particion y cierre.
- Mantener estetica Pirepirapp: misma carcasa, mismo fondo LCD, sin tarjetas `system-window`, texto tipo terminal con matriz 5x7/35 segmentos y bloques emergentes.

### Cambios
- Se agrego `frontend/previews/onboarding-terminal.html` como prototipo A, con flujo terminal guiado y bloques de datos emergentes.
- Se agrego `frontend/previews/onboarding-console.html` como prototipo B, con flujo de consola/checklist y riel de pasos.
- Se agrego `frontend/previews/onboarding.css` con estilos propios del laboratorio, reutilizando clases reales de la app (`device-shell`, `status-bar`, `lcd-screen`, `key-zone`).
- Se agrego `frontend/previews/onboarding.js` con 6 pasos, controles `SIGUIENTE`, `ATRAS`, `SALTAR`, `REINICIAR` y `ENTRAR`, render de texto 35 segmentos y simulacion de particion.
- Se actualizo `docs/ITERACIONES_PIREPIRAPP_2026-06-29.md` con el prompt de esta iteracion.

### Verificacion
- `node --check frontend\previews\onboarding.js`: OK.
- Validacion estatica Node de referencias HTML, ausencia de `system-window`, cantidad de pasos y controles: OK, `ONBOARDING_PREVIEW_STATIC_OK`.
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK.
- Busqueda en los prototipos de `system-window`, `data-sync-test-seed`, `pirepirapp-test-seed`, `assets/torta` y `aves-flight`: sin resultados.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding-terminal.html?v=9957b5f`: OK, `200`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding-console.html?v=9957b5f`: OK, `200`.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.js?v=9957b5f`: OK, `200`, contiene pasos, controles y texto 35 segmentos.
- URL publica `https://nicolasverar.github.io/pirepirapp/previews/onboarding.css?v=9957b5f`: OK, `200`, contiene estilos del laboratorio.
- `git commit -m "Agregar prototipos de onboarding inicial"`: OK, commit `9957b5f`.
- `git push origin main`: OK.
- `git status --branch --short`: OK, `main...origin/main` sin cambios locales tras el push.

### Limitacion
- No se pudo obtener screenshot automatizado: Chrome headless queda bloqueado por errores GPU/`about:blank` en esta maquina. Los HTML son estaticos y pueden abrirse directamente en navegador.

### Pendientes
- Recorrer ambos prototipos en navegador con el usuario y elegir direccion visual/interactiva antes de integrar el onboarding real en la app.

## 2026-06-29 - Endurecimiento local/APK v3.34

### Objetivo
- Preparar una version mas solida, privada y fluida para PWA/APK.
- Cerrar el flujo temporal de seed personal y reducir peso de precache/runtime.
- Hacer el build Android debug reproducible desde consola aunque el `PATH` apunte a Java 8.

### Cambios
- Se elimino `frontend/data/pirepirapp-test-seed.json` del arbol actual y se agrego `frontend/data/` a `.gitignore`.
- Se retiro el boton temporal `Sincronizar` de Configuracion y se eliminaron `syncTestSeed()`, `testSeedUrl()` y `normalizeTestSeed()`.
- El service worker subio a `finanzas-lcd-v142`, la app visible subio a `v3.34` y el precache ya no incluye el seed ni assets muertos.
- El service worker ahora instala cache de forma tolerante a assets faltantes y solo guarda respuestas `ok`.
- Se eliminaron assets PNG sin referencias activas: `frontend/assets/torta.pmg.png` y `frontend/assets/aves-flight-sprite.png`.
- Se ignora `android/.idea/` para evitar ruido local de Android Studio.
- Se agrego `scripts/build-android-debug.ps1` y `npm run cap:build:debug` ahora usa JBR/JDK 21 y Gradle home temporal por defecto.
- Android desactivo `allowBackup`/`fullBackupContent` y `usesCleartextTraffic` para proteger datos locales.
- Se actualizo `README.md`, `docs/APK_TRANSICION.md`, `docs/PRUEBAS.md` y `docs/ITERACIONES_PIREPIRAPP_2026-06-29.md`.

### Verificacion
- `node --check` para scripts frontend activos, service worker y smoke test: OK.
- `npm run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- Validacion `frontend/manifest.json` con `ConvertFrom-Json`: OK.
- Busqueda activa de `syncTestSeed`, `data-sync-test-seed`, `pirepirapp-test-seed`, `assets/torta`, `aves-flight`, `v3.33` y `finanzas-lcd-v141`: sin resultados activos fuera de bitacora historica.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm run cap:copy`: OK; assets web copiados a `android/app/src/main/assets/public`.
- Verificacion de Android generado: sin seed ni assets eliminados; `v3.34` y `finanzas-lcd-v142` presentes.
- `npm run cap:build:debug`: OK; APK debug en `android/app/build/outputs/apk/debug/app-debug.apk`.
- `git commit -m "Endurecer app local y build Android"`: OK, commit `71f8ae6`.
- `git push origin main`: OK.
- URL publica `https://nicolasverar.github.io/pirepirapp/?v=3.34-71f8ae6`: OK, sirve `v3.34`.
- URL publica `scripts/config.js`: OK, contiene `APP_VERSION: 'v3.34'`.
- URL publica `service-worker.js`: OK, contiene `finanzas-lcd-v142` y no contiene `pirepirapp-test-seed`.
- URLs publicas de seed y assets eliminados: OK, responden 404.
- `git status --branch --short`: OK, `main...origin/main` sin cambios locales tras el push.

### Pendientes
- Si el seed personal ya fue empujado al remoto, evaluar limpieza de historial Git con aprobacion explicita y rotacion/eliminacion de cualquier dato expuesto.
- Probar el APK debug en emulador o telefono fisico y validar persistencia/importacion de backup con datos reales fuera del repo.

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
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.

## 2026-06-28 - Variantes simples de torta 2D

### Objetivo
- Probar variantes mas limpias de la torta 2D porque el texto y los colores de la version anterior no convencian.

### Cambios
- El laboratorio ahora muestra tres alternativas comparables: `Plana`, `LCD sobria` y `Monocroma`.
- Se redujo el texto dentro de la torta; la variante monocroma elimina los porcentajes internos y deja la lectura en la leyenda.
- Se simplificaron las etiquetas de la leyenda y se bajo el peso visual del panel de lectura.
- Se ajustaron las paletas para que sean mas sobrias, con menos contraste disonante y disponible en tono oscuro.
- Las tres variantes conservan la interaccion: tocar fijos/ahorros/metas revela particiones internas dentro de la misma torta.
- El simulacro queda solo en `frontend/previews`; no modifica aun la tarjeta oficial de Resumen.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.

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

## 2026-06-28 - Senaladores de torta restaurados v3.31

### Objetivo
- Recuperar la belleza y legibilidad de los senaladores de la torta 2D despues de agrandarla.

### Cambios
- Los codos de los callouts se movieron a carriles exteriores para que la linea tenga diagonal clara y tramo horizontal limpio.
- La posicion vertical de cada callout ahora se calcula con separacion respecto al punto de anclaje, evitando lineas aplastadas sobre el borde de la torta.
- `DISP.` mantiene senalador visible por defecto y porcentaje interno legible.
- El preview `frontend/previews/particion.html` actualiza cache-busting para revisar la variante corregida.
- Version y cache pasan de `v3.30`/`finanzas-lcd-v138` a `v3.31`/`finanzas-lcd-v139`.

### Verificacion
- Captura headless Chrome del preview: OK, senalador con diagonal exterior, tramo horizontal y porcentaje visible.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\previews\sueldo.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Leyenda natural de torta v3.32

### Objetivo
- Rehacer la leyenda de la torta porque la version anterior se sentia artificial: un solo senalador externo y otra leyenda compitiendo abajo.

### Cambios
- `FIJOS`, `AHORROS` y `DISP.` ahora muestran senaladores externos por defecto, cada uno saliendo de su propio sector.
- Las lineas usan una geometria orbital: tramo corto desde el borde de la torta y remate hacia la etiqueta cercana, sin carriles fijos laterales.
- El SVG gana aire vertical para que la etiqueta inferior de `AHORROS` no quede apretada.
- Se elimina la fila inferior de leyenda principal; abajo queda solo la lectura/estado de la seleccion y el boton `TOTAL`.
- La tipografia de los callouts gana tamano y pierde borde excesivo.
- Version y cache pasan de `v3.31`/`finanzas-lcd-v139` a `v3.32`/`finanzas-lcd-v140`.

### Verificacion
- Captura headless Chrome del preview: OK, leyenda externa en tres sectores y sin duplicacion inferior.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\previews\sueldo.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Backup local completo v3.33

### Objetivo
- Empezar el endurecimiento de Pirepirapp como APK local seria agregando exportacion/importacion manual de datos.

### Cambios
- `frontend/scripts/local-store.js` expone `exportBackup()` e `importBackup()` con esquema `pirepirapp-local-backup`.
- `frontend/scripts/app.js` permite exportar un JSON completo e importar un JSON desde archivo, forzando modo local y recargando la app.
- Configuracion suma una tarjeta `BACKUP LOCAL` con botones `Exportar backup` e `Importar backup`.
- El backup incluye configuracion, movimientos, ahorros, metas, wishlist y fotos locales.
- La pantalla de carga deja de mencionar Google Sheets y pasa a `Leyendo datos locales...`.
- Los errores remotos legados dejan de mencionar Apps Script/Google Sheets en la interfaz.
- `scripts/smoke-local-store.js` ahora valida exportar, limpiar estado e importar de vuelta.
- `docs/APK_TRANSICION.md` y `docs/PRUEBAS.md` documentan el nuevo flujo.
- Version y cache pasan de `v3.32`/`finanzas-lcd-v140` a `v3.33`/`finanzas-lcd-v141`.

### Verificacion
- `node --check frontend\scripts\local-store.js`: OK.
- `node --check frontend\scripts\app.js`: OK.
- `node --check frontend\scripts\api.js`: OK.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `node --check scripts\smoke-local-store.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`; incluye exportar backup, limpiar estado e importar de vuelta con fotos.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Torta A final colapsable

### Objetivo
- Dejar un unico candidato de torta 2D y corregir la interaccion final: categorias colapsables y `Disponible` tratado como los demas.

### Cambios
- `frontend/previews/sueldo.js` ahora renderiza un solo panel `Torta final` en lugar de tres variantes A.
- `Fijos`, `Ahorros` y `Disponible` se pueden seleccionar desde la torta o desde la lectura inferior, y volver a tocar el mismo grupo lo colapsa.
- Al entrar en `Metas`, tocar de nuevo vuelve al nivel agregado de `Ahorros`.
- `Disponible` queda seleccionable, aparece en la lectura inferior y genera callout exterior cuando esta activo.
- `frontend/previews/particion.html` actualiza titulo y cache-busting a `pie-a-final`.
- El cambio sigue limitado a `frontend/previews`; no modifica aun la tarjeta oficial de Resumen.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Torta 2D final implementada en Resumen v3.28

### Objetivo
- Llevar el candidato final de torta 2D desde `frontend/previews` a la app principal y dejar porcentajes macro visibles por defecto.

### Cambios
- `frontend/scripts/render.js` reemplaza la vista B1 rectangular por una torta 2D interactiva en `PARTICION SUELDO`.
- Por defecto quedan visibles dentro de la torta los porcentajes de `FIJOS`, `AHORROS` y `DISP.`.
- Al tocar `FIJOS` o `AHORROS`, el sector se desagrega dentro de la misma torta; tocar de nuevo lo colapsa.
- Al tocar `METAS`, `AHORROS` baja al detalle de futuro + metas; tocar de nuevo vuelve al nivel agregado.
- `DISP.` queda seleccionable y con el mismo grosor/stroke que las otras porciones, sin marca interna especial.
- `frontend/styles/main.css` y `frontend/styles/responsive.css` agregan la estetica productiva `salary-pie2d-*`.
- `frontend/previews` conserva el mismo candidato con porcentajes internos visibles.
- Version y cache pasan de `v3.27`/`finanzas-lcd-v135` a `v3.28`/`finanzas-lcd-v136`.

### Verificacion
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\scripts\app.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Ajuste fino de torta 2D v3.29

### Objetivo
- Mejorar la lectura de `DISP.` en la torta final sin cambiar el paradigma ya implementado.

### Cambios
- `DISP.` ahora mantiene callout externo siempre visible cuando existe disponible, aunque no este seleccionado.
- La torta crece apenas: radio de 108 a 112 y ancho visual un poco mayor.
- `Disponible` deja el negro puro y pasa a un verde muy oscuro `#24351f`, tanto en app principal como en preview.
- Los porcentajes internos ahora tienen una mini pastilla/marco SVG para mejorar contraste y consistencia.
- `frontend/previews` queda alineado con la app principal.
- Version y cache pasan de `v3.28`/`finanzas-lcd-v136` a `v3.29`/`finanzas-lcd-v137`.

### Verificacion
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Torta 2D XL v3.30

### Objetivo
- Agrandar de forma visible la torta final de `PARTICION SUELDO`.

### Cambios
- `frontend/scripts/render.js` aumenta el radio de la torta principal de 112 a 126.
- El viewBox de la torta pasa de `-62 0 444 260` a `-42 0 404 264`, reduciendo aire lateral muerto para que el circulo ocupe mas superficie real.
- `frontend/styles/main.css` aumenta el ancho maximo y la altura minima del escenario de torta.
- `frontend/styles/responsive.css` aumenta la escala tambien en pantallas chicas.
- `frontend/previews` replica la misma escala XL.
- Version y cache pasan de `v3.29`/`finanzas-lcd-v137` a `v3.30`/`finanzas-lcd-v138`.

### Verificacion
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Callouts de torta A hacia afuera

### Objetivo
- Corregir la apertura torpe de las leyendas de la torta 2D A, que todavia podian orientarse hacia adentro de la torta.

### Cambios
- `frontend/previews/sueldo.js` calcula el lado del callout desde el punto real de anclaje de cada porcion, no desde una regla fija por categoria.
- Las etiquetas ahora crecen hacia afuera: a la derecha usan anclaje inicial y a la izquierda anclaje final.
- El SVG de la torta gana margen lateral logico y el preview aumenta su ancho maximo para conservar el tamano visual sin cortar las leyendas.
- `frontend/previews/particion.html` actualiza cache-busting de CSS/JS para forzar la version nueva del laboratorio.
- Este ajuste queda solo en `frontend/previews`; no modifica aun la tarjeta oficial de Resumen.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Correccion tactil y leyenda de torta A

### Objetivo
- Corregir el laboratorio de torta A para que siga desagregando al tocar y ordenar la leyenda principal.

### Cambios
- El segundo toque sobre `AHORROS` ahora avanza desde `Futuro/Metas` hacia el detalle de metas.
- Tocar una meta o un componente desagregado ya no colapsa accidentalmente la torta.
- Se agrego un fallback de busqueda de atributos para toques sobre SVG en WebView.
- La leyenda principal se arma siempre en orden fijo: `FIJOS`, `AHORROS`, `DISP.`.
- `DISP.` aparece siempre en la leyenda, incluso cuando el disponible es 0%, y se mantiene negro.
- Las filas activas de la leyenda muestran estado abierto.
- El cambio queda solo en `frontend/previews`; no modifica aun la tarjeta oficial de Resumen.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Torta A con lectura inferior

### Objetivo
- Corregir la direccion visual de las leyendas: callouts hacia afuera de la torta y lectura porcentual abajo, sin texto en el centro.

### Cambios
- Se elimino el texto dentro del hueco central de la torta.
- Se quito el panel lateral y se reemplazo por una banda inferior.
- La banda inferior muestra las categorias principales y una lectura de la seleccion activa.
- Al abrir `Fijos`, se muestra `FIJOS xx% = componente xx% + ...`.
- Al abrir `Ahorros`, se muestra `AHORROS xx% = FUTURO xx% + METAS xx%`; tocar `METAS` abre el detalle de metas.
- Tocar `Fijos` o `Ahorros` ahora abre/cierra exactamente ese grupo.
- Las callout lines se empujaron hacia los bordes exteriores del SVG.
- El cambio queda solo en `frontend/previews`; no modifica aun la tarjeta oficial de Resumen.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Variantes A grandes con callouts

### Objetivo
- Tomar la variante A como base y hacerla mas grande, limpia y coherente con la app.

### Cambios
- El laboratorio ahora muestra `A1`, `A2` y `A3`, todas derivadas de la variante A.
- La torta ocupa mucho mas espacio util de cada tarjeta.
- `Disponible` queda siempre en negro.
- Los desagregados son acumulables: abrir `Fijos` y luego `Ahorros` ya no cierra lo anterior; `TOTAL` es el reset explicito.
- Se incorporaron callout lines para leer particiones desagregadas sin meter texto excesivo dentro del circulo.
- La leyenda principal queda sin texturas y solo muestra las categorias principales: `Fijos`, `Ahorros` y `Disponible`.
- El simulacro queda solo en `frontend/previews`; no modifica aun la tarjeta oficial de Resumen.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

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

## 2026-06-28 - Boton contextual y alta de gastos fijos v3.17

### Objetivo
- Reordenar la botonera inferior para que cada seccion tenga una accion contextual clara y mover el alta de gastos fijos de Configuracion a un formulario emergente.

### Cambios
- La botonera inferior ahora muestra `AGREGAR MOVIMIENTO`, `FILTRAR MOVIMIENTOS`, `AGREGAR OBJETIVO` o `AGREGAR GASTO FIJO` segun la seccion activa.
- En Configuracion, el boton inferior abre el formulario emergente `GASTO FIJO`; ya no ejecuta la limpieza/actualizacion de cache.
- El formulario de gasto fijo permite nombre, monto mensual y porcentaje del sueldo; monto y porcentaje se sincronizan y respetan el limite disponible considerando fijos existentes mas ahorros/metas planificados.
- La lista de gastos fijos deja de ser un editor inline y pasa a mostrarse debajo de la tarjeta de sueldo como tarjetas con nombre, porcentaje y monto, mas accion de eliminar.
- El boton interno que antes decia `Guardar montos` ahora dice `Actualizar app`; guarda el sueldo/configuracion y luego ejecuta la limpieza/recarga de cache de la app.
- Se actualizo cache/version de `v3.16` a `v3.17` y `finanzas-lcd-v125`.

### Verificacion
- `node --check frontend\scripts\app.js`: OK.
- `node --check frontend\scripts\router.js`: OK.
- `node --check frontend\scripts\forms.js`: OK.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda de etiquetas/version en `frontend` y assets Android: OK, `v3.17`, `finanzas-lcd-v125`, tarjetas de gasto fijo y nuevas etiquetas contextuales presentes.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Control legible de acumulado futuro v3.18

### Objetivo
- Corregir el formulario de `Ahorro futuro`, donde `Monto acumulado` aparecia como campo permanente y el switch se leia como un marco negro sin texto claro.

### Cambios
- El formulario de `Ahorro futuro` ya no muestra `Monto acumulado` como input permanente.
- Se agrego un control compacto y legible `Monto acumulado` con estado `NO/SI`.
- El campo `Valor acumulado` aparece solo cuando el control esta activo.
- Para ahorros nuevos, el acumulado arranca oculto; para ahorros existentes se conserva una preferencia guardada real o el valor acumulado si ya existia.
- Se actualizaron estilos del control para mantener la estetica LCD sin perder lectura.
- Se actualizo cache/version de `v3.17` a `v3.18` y `finanzas-lcd-v126`.

### Verificacion
- `node --check frontend\scripts\forms.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda en `frontend` y assets Android: OK, `v3.18`, `finanzas-lcd-v126`, `future-accumulated-toggle`, `Monto acumulado` y `Valor acumulado` presentes.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Acciones contextuales ancladas v3.19

### Objetivo
- Corregir el comportamiento del boton contextual: el alta de gasto fijo debe abrirse encima del boton, el selector de Metas debe volver a ofrecer las tres opciones, y las etiquetas largas del boton deben leerse mejor.

### Cambios
- `AGREGAR OBJETIVO` vuelve a abrir el selector con `El futuro`, `Meta especifica` y `Cosa que quiero`.
- El formulario `GASTO FIJO` ahora usa el anclaje del menu inferior y se despliega sobre el boton `AGREGAR GASTO FIJO`.
- Se aumento la altura y tamano tipografico del boton contextual para mejorar lectura de `AGREGAR MOVIMIENTO`, `FILTRAR MOVIMIENTOS`, `AGREGAR OBJETIVO` y `AGREGAR GASTO FIJO`.
- Se agrego una clase de formulario anclado para conservar el aspecto de formulario sin ocupar toda la pantalla.
- Se actualizo cache/version de `v3.18` a `v3.19` y `finanzas-lcd-v127`.

### Verificacion
- `node --check frontend\scripts\forms.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda en `frontend`: OK, selector `AGREGAR OBJETIVO`, formulario fijo anclado, fuente de boton y version/cache presentes.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Lectura vertical de gastos fijos v3.20

### Objetivo
- Reordenar la tarjeta de cada gasto fijo para que se lea como titulo, porcentaje/monto en una sola linea, y acciones `Editar`/`Eliminar` abajo.
- Rehacer la tarjeta `Total fijo` con lectura vertical y mover `Actualizar app` debajo del total de fijos, antes de `Papelera`.

### Cambios
- Cada gasto fijo ahora muestra el nombre arriba, una linea compacta con `% del sueldo` y monto mensual, y una ultima linea con `Editar` y `Eliminar`.
- `Editar` abre el mismo formulario de gasto fijo, precargado, y calcula el margen disponible excluyendo el gasto que se esta editando.
- `Total fijo` muestra monto, porcentaje del sueldo y `Disponible tras fijos y ahorros` en lineas separadas.
- El boton `Actualizar app` se movio debajo del bloque de gastos fijos y usa el formulario de sueldo por atributo `form="settings-form"`.
- Se actualizo cache/version de `v3.19` a `v3.20` y `finanzas-lcd-v128`.

### Verificacion
- `node --check frontend\scripts\forms.js`: OK.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda en `frontend` y assets Android: OK, `v3.20`, `finanzas-lcd-v128`, `js-edit-fixed-expense-card`, `settings-update-actions` y `fixed-expense-total-available` presentes.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Ahorro futuro sin valor acumulado v3.21

### Objetivo
- Simplificar el formulario de `Ahorro futuro` eliminando el campo separado `Valor acumulado` y dejando solo el control `Monto acumulado` con estado `NO/SI`.

### Cambios
- Se elimino el input visible `Valor acumulado` del formulario `AHORRO FUTURO`.
- El control `Monto acumulado` queda como selector `NO/SI` para mostrar u ocultar el acumulado en la tarjeta.
- Al guardar, se preserva internamente el acumulado existente; ocultarlo ya no borra el monto acumulado.
- Se elimino CSS muerto asociado a `future-accumulated-amount`.
- Se actualizo cache/version de `v3.20` a `v3.21` y `finanzas-lcd-v129`.

### Verificacion
- `node --check frontend\scripts\forms.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda en `frontend` y assets Android: OK, `Valor acumulado`, `data-future-accumulated-amount` y `future-accumulated-amount` sin resultados; `v3.21` y `finanzas-lcd-v129` presentes.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Toggle de formulario fijo y cierre simple v3.22

### Objetivo
- Hacer que el boton `AGREGAR GASTO FIJO` cierre el formulario si ya estaba abierto.
- Eliminar el boton superior `CERRAR`, porque `Cancelar` ya cumple esa funcion junto a `Guardar`.

### Cambios
- Se agrego `toggleFixedExpenseForm()` para alternar apertura/cierre del formulario `GASTO FIJO`.
- El boton contextual de Configuracion ahora usa ese toggle.
- `openModal()` dejo de renderizar el boton superior `CERRAR`; se conserva `Cancelar` dentro de los formularios y el backdrop para cerrar.
- Se actualizo cache/version de `v3.21` a `v3.22` y `finanzas-lcd-v130`.

### Verificacion
- `node --check frontend\scripts\forms.js`: OK.
- `node --check frontend\scripts\app.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda en `frontend` y assets Android: OK, `CERRAR` sin resultados; `toggleFixedExpenseForm`, `v3.22` y `finanzas-lcd-v130` presentes.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Particion sueldo con leyendas limpias v3.23

### Objetivo
- Limpiar la tarjeta `PARTICION SUELDO`: quitar `DISP. xx%` del marco, eliminar la escala `0 / 50% / 100%` y reforzar las leyendas reales de las particiones.

### Cambios
- El encabezado de la tarjeta ahora muestra solo `PARTICION SUELDO`.
- Se elimino la linea/etiqueta interna de `100%` y la escala inferior `0`, `50%`, `100% sueldo` y `exceso`.
- Las leader lines se reacomodaron en cascadas mas verticales: fijos arriba, ahorros/metas abajo y disponible hacia el lado contrario.
- Las etiquetas de leyenda se agrandaron y se aumento el espacio vertical de la tarjeta para mejorar lectura.
- Se actualizo cache/version de `v3.22` a `v3.23` y `finanzas-lcd-v131`.

### Verificacion
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda en `frontend` y assets Android de la vista real: OK, `titleBadge`, `salary-b1-axis`, `salary-b1-salary-line` y `DISP. ` sin resultados; `v3.23` y `finanzas-lcd-v131` presentes.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Resumen sin detalle de cobro v3.24

### Objetivo
- Quitar de la pantalla de Resumen las lineas `Remanente anterior` y `Cobro del mes` dentro de `PLATA DISPONIBLE`.

### Cambios
- Se elimino `renderMoneyLineDetails(summary)` de la tarjeta `PLATA DISPONIBLE`.
- Se elimino la funcion `renderMoneyLineDetails`.
- Se retiro el CSS muerto `.money-line-details`.
- Se actualizo cache/version de `v3.23` a `v3.24` y `finanzas-lcd-v132`.

### Verificacion
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda en `frontend` y assets Android: OK, `Remanente anterior`, `Cobro del mes`, `renderMoneyLineDetails` y `money-line-details` sin resultados; `v3.24` y `finanzas-lcd-v132` presentes.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Particion sueldo con cascada adaptable v3.25

### Objetivo
- Ajustar la vista `PARTICION SUELDO` para que la cascada de fijos arriba y ahorros/metas abajo tenga mayor presencia visual y la tarjeta crezca segun la cantidad de subdivisiones.

### Cambios
- Se agrego calculo de layout `salaryB1Layout()` para reservar espacio superior/inferior segun la cantidad de componentes visibles.
- La altura minima de la tarjeta B1 ahora se define con variables CSS dinamicas `--b1-stage-min`, `--b1-top-space` y `--b1-bottom-space`.
- `Disponible` deja de tener leader line y ahora se muestra como marca interna grande `DISP. xx%` dentro del tramo oscuro.
- Las etiquetas de fijos y ahorros/metas se estabilizaron con ancho fijo y cascada mas ordenada.
- Se actualizo cache/version de `v3.24` a `v3.25` y `finanzas-lcd-v133`.

### Verificacion
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- Busqueda en `frontend` y assets Android: OK, `salaryB1Layout`, `b1-stage-min`, `salary-b1-available-mark`, `v3.25` y `finanzas-lcd-v133` presentes.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Sincronizacion de base de prueba v3.26

### Objetivo
- Agregar un boton temporal `SINCRONIZAR` para cargar en fase de prueba la base personal desde el repo, sin importar ningun movimiento, ingreso ni egreso.

### Cambios
- Se genero `frontend/data/pirepirapp-test-seed.json` desde `FinanzasPersonales-20260627T194850Z-3-001.zip`.
- El seed incluye sueldo/configuracion, 5 gastos fijos, 1 ahorro futuro, 4 metas, 24 cosas que quiero y 25 fotos locales.
- El seed deja `movimientos: []` y la app vuelve a forzar ese arreglo vacio al sincronizar.
- Se agrego el boton `SINCRONIZAR` en Configuracion junto a `Actualizar app`.
- `syncTestSeed()` descarga el seed, fuerza modo local, limpia cache de fotos y guarda el estado en IndexedDB/localStorage.
- Se actualizo cache/version de `v3.25` a `v3.26` y `finanzas-lcd-v134`.
- Nota operativa: este seed contiene datos personales y debe eliminarse del repo al cerrar la fase de prueba.

### Verificacion
- `node --check frontend\scripts\app.js`: OK.
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- Validacion seed JSON: OK, 5 fijos, 1 ahorro, 4 metas, 24 wishlist, 25 fotos, 0 movimientos.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Ajuste de lectura en particion sueldo v3.27

### Objetivo
- Corregir la vista `PARTICION SUELDO` para que las cajas de texto no se corten, los porcentajes internos se lean mejor y `DISP.` use textura oscura coherente con el marco del titulo.

### Cambios
- Se amplio el espacio vertical reservado para cascadas superiores e inferiores segun cantidad de subdivisiones.
- Las etiquetas de fijos y ahorros/metas ahora usan ancho dinamico y ya no aplican ellipsis forzado.
- Los leader lines de fijos salen hacia la derecha y los de ahorros/metas hacia la izquierda para reducir choques con el borde de pantalla.
- Los porcentajes internos tienen una pastilla mas grande, con fondo oscuro tramado y mejor contraste.
- El tramo `Disponible` usa textura oscura rayada similar al encabezado `PARTICION SUELDO`.
- Se actualizo cache/version de `v3.26` a `v3.27` y `finanzas-lcd-v135`.

### Verificacion
- `node --check frontend\scripts\render.js`: OK.
- `node --check frontend\scripts\config.js`: OK.
- `node --check frontend\service-worker.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- Validacion seed JSON: OK, 0 movimientos.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Simulacros B1 con callouts al borde

### Objetivo
- Crear otra tanda de simulacros para `PARTICION SUELDO` con flechas diagonales + tramo horizontal hasta el borde de la tarjeta, evitando que las leyendas se corten.

### Cambios
- `frontend/previews/particion.html` ahora identifica el laboratorio como `B1 CALLOUT` y usa cache-busting para CSS/JS.
- `frontend/previews/sueldo.js` renderiza cuatro variantes: `Riel espejo`, `Riel derecho unico`, `Margen ancho` y `Candidato oficial`.
- Las nuevas variantes fijan las leyendas a carriles internos de borde; la barra central y el SVG de lineas usan el mismo ancho logico para alinear el origen de cada flecha con su porcion.
- `Disponible` conserva una textura oscura tipo marco LCD y los porcentajes internos quedan en pastillas oscuras.
- Este cambio queda solo como simulacro/previsualizacion; no modifica aun la tarjeta oficial de Resumen.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
- `npm.cmd run cap:copy`: OK, assets web copiados a `android/app/src/main/assets/public`.

## 2026-06-28 - Simulacro de torta 2D tactil

### Objetivo
- Probar nuevamente el paradigma de torta, pero en 2D plano y tactil, con revelado de particiones internas dentro del mismo circulo.

### Cambios
- `frontend/previews/particion.html` pasa a identificar la tanda como `TORTA 2D` y actualiza el cache-busting de CSS/JS.
- `frontend/previews/sueldo.js` incorpora `renderInteractivePie2D()`.
- La torta muestra el nivel macro y permite tocar `Gastos fijos` para abrir sus componentes en el mismo sector.
- Al tocar `Ahorros/metas`, primero se separa en `Futuro` y `Metas`; al tocar `Metas`, se revelan las metas concretas dentro del mismo sector.
- Se agrego panel lateral de lectura con porcentajes y montos, manteniendo el circulo 2D como foco principal.
- El modo `LIMPIO` oculta el panel lateral y centra la torta para evaluar solo el objeto visual.
- El simulacro queda solo en `frontend/previews`; no modifica aun la tarjeta oficial de Resumen.

### Verificacion
- `node --check frontend\previews\sueldo.js`: OK.
- `npm.cmd run test:smoke`: OK, `SMOKE_LOCAL_STORE_OK`.
- `git diff --check`: OK; solo avisos CRLF normales de Windows.
