# Registro de iteraciones - Pirepirapp

Ultima edicion: 2026-06-17

## Sesion 2026-06-16

### Prompt 1 - Usuario

```text
sigue sin estar bien espaciado las cosas que quiero se ve todo enciamdo el texto la intencion es que entre bien todo en las tarjetas en columnas de a dos ademas el brillo au no me gusta ni los pajaros ni el liquido y si me traes aca antes de usar y yo te confirmo cual usar par cada caso
```

### Resumen operativo
- Se reviso el estado del repositorio y la documentacion obligatoria disponible.
- Se ajusto el frontend para retirar elementos visuales no aprobados y mejorar la grilla de `Cosas que quiero`.

### Prompt 2 - Usuario

```text
pero yo queria que l brillo, los pajaros y el liquido no saques, cambies y que antes de elegir uon para cada uno me muestres asi yo decido cual si cual no mostrame las opcione spara cada item
```

### Resumen operativo
- Se reviso el estado del repositorio y la documentacion disponible.
- Se prepararon opciones para que el usuario elija el nuevo estilo de brillo, pajaros y liquido antes de implementarlos.

### Prompt 3 - Usuario

```text
b2 pero rediseña los brillos para que sean mas putiagudos no asi cuadradoides, P3 eliminamos el liquido por completo
```

### Prompt 4 - Usuario

```text
el guardado quiero que sea mas instantaneo asi como tambien la conversion de cosa que uiero en meta
```

### Prompt 5 - Usuario

```text
continua
```

### Resumen operativo
- Se implementa B2 con destellos puntiagudos y P3 con bandada minima.
- Se mantiene eliminado el liquido.
- Se optimiza la aplicacion local de resultados para que guardados y conversion de wishlist a meta se vean apenas responde la mutacion.

### Prompt 6 - Usuario

```text
unpoquito mas vistosoel brillo y las aves parecen muricelagos
```

### Resumen operativo
- Se aumenta ligeramente la visibilidad de los destellos.
- Se redibuja la silueta de las aves para evitar apariencia de murcielago.

### Prompt 7 - Usuario

```text
EN LUGAR DEE AVIONES PONE NUBES Y PAJAROS Y AVES
```

### Resumen operativo
- Se reemplaza la silueta anterior por una escena con nubes pixeladas, pajaros pequeños y un ave mas grande.

### Prompt 8 - Usuario

```text
las nubes que sean con mayor pixel art definido asi tambien las aves mas definicion que significa la relacion en el formulario soluciona por favor el gasto total en resumen no se actualiza cuando se carga el gasto enicma en la parte de gastos el registro se ve con los registros mal posicionados y si salgo de la seccion se elimina e registro  no puedo ver el desvanecido tampoco nada fijate en el drive hay muchos gastos cargados y ninguno se ve en la app
```

### Prompt 9 - Usuario

```text
elimina las descripciones de todaas las cosas qeu quiero y la capacidadde incluir furuos comentarios solo cuando se conviertnen metas se puede poner un cmenario y agrega la capacidad de que se ordene de m enor a mayor o viceversalas cosass qeu quier tambien ahora que ya no hay descripcion achica ese espacio muerto nuevo
```

### Resumen operativo
- Se trabaja sobre gastos, resumen, wishlist y escena visual.
- Se elimina descripcion normal de wishlist, se permite comentario solo al convertir a meta y se agrega orden menor/mayor por costo.

### Prompt 10 - Usuario

```text
nubes y aves aun mas definidos 32bit art por ahi, dmas la tabla resumen no levanta nada y gastos totales debe estar la fecha en español LUN 07/MAYO/2026 15:45  porejemplo
```

### Prompt 11 - Usuario

```text
cambia el iocno por <ruta-local>\icono.jpeg
```

### Resumen operativo
- Se refuerza el pixel art de nubes y aves.
- Se cambia actividad reciente del resumen para usar movimientos globales y se agrega formato de fecha/hora en español.
- Se reemplaza el icono PWA por PNG generado desde `icono.jpeg`.

### Prompt 12 - Usuario

```text
sigue sin salir cuanto gate este mesen total y debe ser coherente con el mes  en el quee eaamos y sumar todos esos regisstros pero aca paraece haber  una inconsistencia porque se empieza nueveo mes pero este mes sigue siendo el mismo yo no puedo for zar a que epiece un mes  entonces revvisa eso
```

### Resumen operativo
- Se corrige la fuente del mes mensual: el resumen suma por fecha real del movimiento y no por la columna `Mes` si quedo inconsistente.
- Se evita enviar/usar un mes forzado al crear movimientos.
- Se ajusta el flujo de configuracion para sincronizar con el mes calendario actual.

### Prompt 13 - Usuario

```text
Implementá las siguientes mejoras de seguridad:

Rate limiting por IP simulado: en Router.js, usando CacheService.getScriptCache(), registrá el número de requests fallidos por IP (disponible en event.parameter o headers). Si supera 10 intentos fallidos en 60 segundos, devolvé un error genérico sin revelar si el token existe o no.

Token timing-safe comparison: en assertAuthorizedRequest_, reemplazá la comparación directa providedToken !== configuredToken por una comparación carácter a carácter de longitud fija para evitar timing attacks.

Ping no revela metadata: en el handler de ping dentro de Router.js, eliminá los campos app y timezone de la respuesta pública. Solo devolvé { ok: true }.

Limpiar paths locales en docs: en PROMPT_MAESTRO_CODEX_FINANZAS.md y docs/REGISTRO_ITERACIONES_PIREPIRAPP_2026-06-16.md, reemplazá todas las ocurrencias de rutas absolutas tipo <ruta-local>\... por el placeholder <ruta-local>.

Agregar advertencia en README: en la sección de Seguridad del README.md, agregá un párrafo que indique explícitamente que FINANZAS_API_TOKEN debe tener al menos 32 caracteres aleatorios y nunca debe ser una palabra o frase predecible.

No modifiques la arquitectura general ni el flujo de autenticación existente. No agregues dependencias externas. Mantené el estilo de código actual (ES5, funciones con sufijo _, sin clases)
```

### Resumen operativo
- Se refuerza autenticacion de Apps Script con rate limit simulado, comparacion timing-safe y respuesta ping minima.
- Se limpian rutas locales de documentacion y se documenta la entropia minima del token.

### Prompt 14 - Usuario

```text
quiero que cuando elimino un gasto desaparezca de inmediato del panel de gastos totales y todo se actualice con rapidez y fluidez, en el formulario de carga de gasto no entiendo que es el campo destino, ademas quiero que si la categroia es cosas a que quiero que aparezca otra que me permita seleccionar lo que quiero entre las cosass que quiero y por ende desaparezca de cosas que quiero todo esto siendo reversible
```

### Resumen operativo
- Se agrega borrado optimista de movimientos para actualizar el panel de gastos al instante.
- Se cambia el formulario de gasto para que `Cosas que quiero` muestre una seleccion concreta de wishlist.
- Se refuerza backend para convertir esa seleccion en compra reversible de wishlist.

### Prompt 15 - Usuario

```text
quiero que todo se pueda leer bienlas tarjetas se cortan los textos en gastos por ejemplo, ademas sucede algo raro con l aapp despues de navegar uun rato el panel inferior se eleva como 1,5 cm y se queda ahi para siempre
```

### Resumen operativo
- Se ajusta el CSS de movimientos para que las tarjetas de gastos no corten motivo, fecha, monto ni tipo.
- Se estabiliza la altura del contenedor principal y se elimina el espacio inferior extra que elevaba la botonera.

### Prompt 16 - Usuario

```text
Tarea: Corrección de aves animadas y rediseño de tarjeta "Metas en el futuro"
Contexto del proyecto: PWA de finanzas personales (Pirepirapp). Frontend en HTML/CSS/JS puro, estética LCD verde. Las aves se renderizan en render.js y los estilos en main.css.

Cambio 1 — Aves animadas
Las aves actuales no se mueven ni aletean. Reemplazá la implementación actual por aves que:

Usen como referencia visual la imagen aves.jpg del proyecto local.
Se muevan horizontalmente por la pantalla de forma continua.
Tengan animación de aleteo (las alas suben y bajan cíclicamente) usando CSS keyframes o canvas.
Mantengan la paleta de colores LCD verde del resto de la app.


Cambio 2 — Rediseño de tarjeta "Metas en el futuro" (AhorrosFuturo)
Rediseñá cada tarjeta con este layout:
[ Título de la meta                    Gs. XXXX mensual ]
[                                                       ]
[              Gs. XXXXXX acumulado (grande)            ]
[                                                       ]
[                              [ Editar ]               ]
Reglas:

Eliminá el campo descripción de la tarjeta (no mostrarlo, no borrarlo del modelo de datos).
El título va a la izquierda, el monto mensual va a la derecha en la misma fila.
El monto acumulado va centrado abajo, en tipografía más grande que el resto.
El botón Editar va alineado a la derecha debajo del acumulado.


Cambio 3 — Opción de visibilidad del acumulado en el formulario de edición
En el modal o formulario que se abre al presionar Editar:

Agregá un toggle o checkbox que diga "Mostrar acumulado" (activado por defecto).
Si está desactivado, la tarjeta oculta el monto acumulado.
El valor acumulado sigue siendo editable en el formulario independientemente de si se muestra o no en la tarjeta.
Guardá la preferencia de visibilidad en el objeto de la meta (campo nuevo mostrarAcumulado: true/false), sin modificar el esquema de Sheets.


No modifiques el modelo de datos en Google Sheets ni los servicios del backend. Los cambios son exclusivamente de frontend (render.js, forms.js, main.css).
```

### Resumen operativo
- Se redibujan las aves como siluetas pixeladas con alas animadas por CSS y desplazamiento horizontal continuo.
- Se rediseñan las tarjetas de `AhorrosFuturo` sin descripcion visible, con acumulado centrado y boton `Editar` alineado a la derecha.
- Se agrega `Mostrar acumulado` y edicion local del acumulado en el formulario, guardando la preferencia frontend sin cambiar Sheets.

### Prompt 17 - Usuario

```text
Cambio 1 — Sección "Mes actual" en Configuración
El selector de mes actual es confuso e innesesario ya que deberia de ser automatico la seleccion de mes y todo el preparado de contenendores de datos aka carpetas etc tambien deberia de ser autmatico

Cambio 2 — Botón "¡Cobré!"
En la sección de sueldo mensual donde tepermiteponer cuanto dinero cobras de Configuración, agregá un botón prominente que diga "¡Cobré!". Al presionarlo debe:

Crear automáticamente un movimiento de tipo ingreso con monto igual al sueldo mensual configurado, fecha de hoy y motivo "Sueldo".
Mostrar una confirmación breve antes de registrar y una explosion de confeti en pixel art divertido que sale de los costados inferiores derecho e izquierdo y xplotan y se caen como confeti
No abrir ningún formulario, la acción debe ser inmediata.


Cambio 3 — Eliminación de Categorías y simplificación del formulario de carga

Eliminá la sección de categorías de Configuración.
En el formulario de carga de gasto, eliminá el campo Categoría. Solo quedan Motivo y los demás campos existentes.
En el panel de Resumen, la sección "Gastaste más en:" debe dejar de usar categoría y pasar a agrupar por Motivo.
Para normalizar motivos similares (ej. "uber", "Uber", "UBER ride"), implementá comparación por similitud de strings usando el algoritmo de distancia de Levenshtein o trigram similarity. Agrupá motivos cuya similitud supere un umbral configurable (sugerido: 80%) bajo el motivo más frecuente del grupo.


Cambio 4 — Gastos fijos reestructurados con partición de sueldo
Reemplazá el campo de texto plano de gastos fijos por un formulario estructurado. Cada gasto fijo debe tener:

Nombre (ej. "Alquiler")
Monto fijo mensual
Porcentaje del sueldo (calculado automáticamente en base al sueldo configurado, y también editable manualmente)
Botones de editar y eliminar por ítem.

La suma total de gastos fijos debe mostrarse al pie de la lista junto con el porcentaje total del sueldo que representan.

Cambio 5 — Visualización de partición de sueldo en Resumen
Agregá una sección nueva en la pestaña de Resumen que muestre visualmente cómo está distribuido el sueldo mensual. Debe incluir:

Un gráfico de barras o de torta con estética LCD verde (SVG puro o canvas, sin librerías externas).
Cada segmento representa un gasto fijo con su nombre y porcentaje.
Un segmento "Disponible" que muestre lo que resta después de los gastos fijos.
Si el total de gastos fijos supera el sueldo, resaltá el exceso visualmente.


Cambio 6 — Dos botones en la pantalla de carga de gastos
Reemplazá el botón único de añadir gasto por dos botones:

"Gasto fijo": pre-completa el formulario con los datos del gasto fijo seleccionado (abre un selector con la lista de gastos fijos configurados) y lo registra como movimiento.
"Gasto corriente": abre el formulario estándar actual.
```

### Prompt 18 - Usuario

```text
RETOMA LO QUE ESTABAS HACIENDO
```

### Resumen operativo
- Se elimina de la PWA la edicion manual de mes y categorias.
- Se agrega `¡Cobré!` con confirmacion, movimiento `Ingreso/Sueldo` y confeti pixel art.
- Se agrupa `Gastaste mas en` por motivo similar con Levenshtein/trigramas y umbral 80%.
- Se redisenan los gastos fijos como filas estructuradas y se agrega particion visual del sueldo en Resumen.

### Prompt 19 - Usuario

```text
Cambio 1 — Conversión de "Cosa que quiero" a Meta: flujo instantáneo
El flujo actual abre un formulario intermedio al convertir un ítem de wishlist en meta, lo cual es lento. Reemplazalo por:

Un botón "Convertir en meta" en la tarjeta que ejecute la conversión de forma inmediata sin abrir ningún modal ni formulario.
La conversión usa directamente el título y costo aproximado del ítem como nombre y monto objetivo de la nueva meta.
Se muestra una micro-confirmación visual inline en la tarjeta (ej. la tarjeta parpadea una vez o muestra un checkmark por 1 segundo) y luego desaparece de la lista de wishlist.
Si se necesita confirmación, que sea un único tap/click de confirmación inline dentro de la tarjeta, sin abrir ninguna capa nueva.
Optimizá el request al backend para que la UI actualice el estado local de forma optimista antes de que el servidor confirme, revirtiendo solo si hay error.
Cambio 2 — Rediseño de paleta: profundidad con dos variantes de verde
La app actualmente usa un verde de fondo prácticamente plano. Rediseñá la paleta incorporando dos variantes adicionales que generen profundidad sin romper la armonía LCD.No introduzcas nuevos colores fuera de la familia del verde. No uses librerías externas. Mantené ES5 en JS y variables CSS nativas sin preprocesadores
```

### Resumen operativo
- Se reemplaza el modal de conversion wishlist por accion directa `Convertir en meta`.
- Se agrega conversion optimista: meta temporal local, check inline en tarjeta y rollback si falla el servidor.
- Backend permite convertir wishlist sin pedir monto mensual, usando titulo/costo como titulo/objetivo.
- Se incorporan dos variantes verdes adicionales a la paleta LCD para dar profundidad visual.
