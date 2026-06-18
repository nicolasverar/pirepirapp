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
