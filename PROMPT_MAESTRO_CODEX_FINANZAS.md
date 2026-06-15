# INSTRUCCIONES PARA CODEX — PROYECTO FINANZAS PWA

Trabajá dentro de la carpeta actualmente abierta en VS Code:

`C:\Users\pc\Desktop\Coding\Finanzas`

## Estado actual del proyecto

Ya existe esta estructura inicial:

- `frontend/`
- `backend/`
- `docs/`
- `scripts/`

Dentro de `backend/` ya existe un proyecto de Google Apps Script vinculado mediante `clasp`, con estos archivos:

- `.clasp.json`
- `.claspignore`
- `appsscript.json`
- `Code.js`
- `Setup.js`
- `Router.js`
- `SpreadsheetService.js`
- `DriveService.js`
- `MovementService.js`
- `GoalService.js`
- `SummaryService.js`
- `Validation.js`

El proyecto remoto de Apps Script ya fue creado y `clasp` ya está autenticado.

## Forma de trabajo obligatoria

1. Inspeccioná primero todos los archivos y la estructura existente.
2. No borres ni reemplaces archivos sin necesidad.
3. No incluyas contraseñas, tokens, credenciales ni secretos en el repositorio.
4. No inventes IDs de Google Sheets, carpetas de Drive ni URLs de despliegue.
5. Cuando necesites esos valores, utilizá placeholders claramente identificados o `PropertiesService`.
6. Implementá primero el backend y la estructura de datos.
7. Después implementá el frontend.
8. Luego implementá la PWA.
9. Finalmente agregá la documentación de instalación, pruebas y despliegue.
10. Generá código funcional, no pseudocódigo.
11. No dejes comentarios como “implementar después”, “resto del código”, “código similar” o “completar aquí”.
12. Mantené la arquitectura simple: HTML, CSS, JavaScript puro, Google Apps Script, Google Sheets y Google Drive.
13. Usá la zona horaria `America/Asuncion`.
14. Usá guaraníes (`Gs.` / `PYG`) como moneda principal.
15. Diseñá toda la interfaz con enfoque mobile-first.
16. Conservá estrictamente la estética LCD verde inspirada en Psion Series 3, Nokia 5110 y PalmPilot.
17. Las imágenes de metas y wishlist deben procesarse visualmente como fotografías pixeladas monocromáticas LCD verdes.
18. Antes de ejecutar `clasp push`, `git commit`, `git push` o cualquier despliegue, mostrámelo y pedime confirmación.
19. Después de cada fase, resumí:
   - archivos creados o modificados;
   - decisiones tomadas;
   - comandos que debo ejecutar;
   - datos que todavía necesitás de mí.
20. No intentes desplegar por tu cuenta sin mi autorización.
21. No cambies la arquitectura tecnológica definida en este documento.
22. No agregues funcionalidades nuevas que no estén solicitadas.
23. Toda operación de creación, edición o eliminación debe mantener coherentes los saldos, métricas, metas, ahorros e historial.
24. Implementá manejo de errores y validación de datos tanto en el frontend como en Apps Script.
25. Evitá dependencias externas innecesarias.

## Primera respuesta esperada de Codex

Antes de modificar archivos, devolveme solamente:

1. Un diagnóstico de la estructura actual.
2. Un plan de implementación por fases.
3. La lista exacta de archivos que vas a crear o modificar.
4. Las preguntas mínimas indispensables antes de comenzar.

Después esperá mi confirmación.

---

# PROMPT MAESTRO: APP PWA DE FINANZAS PERSONALES CON ESTÉTICA PSION SERIES 3

Quiero que diseñes y desarrolles una aplicación web completa de finanzas personales, optimizada principalmente para teléfonos celulares y capaz de instalarse como una PWA.

La aplicación debe utilizar:

* HTML.
* CSS.
* JavaScript.
* Google Apps Script como backend.
* Google Sheets como base de datos.
* Google Drive para almacenar los archivos y las imágenes.
* GitHub Pages para desplegar el frontend.
* Una Web App de Google Apps Script para exponer la API que conecta el frontend con Google Sheets y Google Drive.

La aplicación debe ser funcional, instalable en Android, responsive y cómoda para utilizarse con una sola mano.

No quiero solamente un diseño visual o una maqueta. Quiero una aplicación real, con frontend, backend, persistencia, sincronización, edición de registros y actualización instantánea de las métricas.

---

# 1. OBJETIVO DE LA APLICACIÓN

La aplicación debe ayudarme a organizar mis finanzas personales a partir de un sueldo fijo mensual.

El sueldo debe ser configurable y modificable desde la sección Configuración.

La aplicación debe permitir:

* Registrar gastos.
* Registrar ingresos adicionales fuera del sueldo.
* Distribuir el dinero entre gastos fijos, ahorros y dinero líquido.
* Administrar ahorros para el futuro.
* Administrar metas específicas.
* Administrar una lista de cosas que quiero comprar.
* Convertir elementos de esa lista en metas.
* Consultar el historial completo de movimientos.
* Editar movimientos cargados incorrectamente.
* Eliminar movimientos.
* Ver métricas mensuales actualizadas inmediatamente.
* Guardar todos los datos en Google Sheets.
* Guardar las imágenes en Google Drive.
* Usar la aplicación como una PWA instalada en el celular.

La experiencia de carga debe ser rápida. La intención es registrar un gasto inmediatamente después de realizarlo, completando un formulario pequeño.

---

# 2. MODELO GENERAL DE LAS FINANZAS

El sueldo mensual debe dividirse conceptualmente en tres grupos principales:

## 2.1. Gastos fijos

Este grupo incluye inicialmente:

* Alimentación.
* Transporte.

Estos gastos forman parte del presupuesto mensual y también pueden utilizarse como categorías al registrar movimientos.

## 2.2. Ahorros

Los ahorros deben dividirse en dos clases:

### Ahorros para el futuro

Son ahorros sin un monto final obligatorio.

Ejemplos:

* Fondos mutuos.
* Jubilación.
* Otros ahorros permanentes.

Cada ahorro para el futuro debe tener:

* Título.
* Monto mensual destinado.
* Descripción.
* Monto acumulado.

### Metas específicas

Son ahorros destinados a alcanzar un monto concreto.

Cada meta específica debe tener:

* Título.
* Monto mensual destinado.
* Monto total que se quiere alcanzar.
* Descripción.
* Monto acumulado.
* Porcentaje de avance.

## 2.3. Gastos líquidos

El dinero líquido es la cantidad que queda disponible para gastar después de separar los importes correspondientes a los ahorros definidos.

El dinero disponible debe actualizarse automáticamente cada vez que se registra:

* Un gasto.
* Un ingreso.
* Un aporte a un ahorro.
* Un aporte a una meta.
* Una compra vinculada a un elemento deseado.

---

# 3. INICIO DEL MES

Debe existir una acción para iniciar un nuevo mes.

Al iniciar el mes:

* Se toma el sueldo mensual configurado.
* Se crea o prepara el registro correspondiente al mes actual.
* Se registran los depósitos correspondientes a los ahorros definidos.
* Se registran los aportes mensuales correspondientes a las metas.
* Los aportes deben aparecer como opciones rápidas en la carga de movimientos.
* Se calcula el dinero disponible después de separar esos importes.
* Se actualizan los montos acumulados de los ahorros y de las metas.

La aplicación debe evitar registrar dos veces el inicio del mismo mes.

Cada mes debe quedar separado en Google Sheets para poder consultar los movimientos del periodo correspondiente.

---

# 4. ESTRUCTURA PRINCIPAL DE LA INTERFAZ

La aplicación debe estar organizada en cuatro grandes secciones:

1. Resumen.
2. Gastos totales.
3. Metas.
4. Configuración.

Además, debe existir una acción principal para agregar movimientos.

La navegación debe ser coherente con una aplicación móvil y mantenerse accesible desde la parte inferior de la pantalla.

---

# 5. SECCIÓN RESUMEN

La sección Resumen debe ser la pantalla principal de la aplicación.

Debe mostrar un encabezado amigable basado en la fecha actual.

Ejemplo:

“Estamos a 15 de junio y gastaste:”

Debajo debe aparecer claramente el gasto total acumulado hasta ese momento.

## 5.1. Total gastado

Debe mostrarse:

* El monto total gastado durante el mes.
* La moneda en guaraníes.
* Una presentación visual destacada.

Los ahorros no deben contarse como gastos normales en esta métrica.

## 5.2. Categoría con mayor gasto

Debajo debe aparecer un texto como:

“Lo que más gastaste fue en:”

La aplicación debe determinar automáticamente la categoría que tiene el mayor gasto acumulado durante el mes.

La información debe inferirse a partir de los registros cargados mediante el formulario de gastos.

Si un movimiento corresponde a una compra vinculada con una meta o con algo de la lista de deseos, la aplicación puede mostrar un mensaje relacionado con esa compra, por ejemplo:

“Compraste eso que tanto querías.”

## 5.3. Actividad reciente

Debe mostrarse una lista apilada con los movimientos más recientes.

La lista debe:

* Mostrar cuatro filas visibles.
* Ordenar los movimientos desde el más reciente al más antiguo.
* Atenuar progresivamente los elementos más antiguos.
* Mostrar motivo, categoría y monto.
* Tener una opción llamada “Ver completo”.

Al seleccionar “Ver completo”, la aplicación debe abrir la sección Gastos totales.

## 5.4. Dinero disponible

Más abajo debe aparecer una sección con el texto:

“Te queda disponible”

Debe mostrar:

* El monto disponible actual.
* El porcentaje del ingreso mensual que todavía queda disponible.

Este valor debe representarse mediante un recipiente visual con líquido animado.

El nivel del líquido debe corresponder al porcentaje de dinero disponible.

El líquido debe moverse de manera suave, pero debe conservar la apariencia de una pantalla LCD monocromática.

---

# 6. SECCIÓN GASTOS TOTALES

Esta sección debe permitir consultar todos los movimientos realizados durante el mes sin necesidad de abrir directamente Google Sheets.

Cada registro debe mostrar:

* Fecha.
* Hora.
* Motivo.
* Categoría.
* Tipo de movimiento.
* Monto.

Los movimientos deben poder ordenarse cronológicamente.

Al seleccionar un registro deben aparecer las acciones:

* Editar.
* Eliminar.

Cuando se edite o elimine un movimiento:

* Debe modificarse el registro correspondiente en Google Sheets.
* Deben recalcularse las métricas.
* Debe recalcularse el saldo disponible.
* Deben actualizarse los ahorros o metas vinculadas.
* Debe actualizarse inmediatamente la pantalla Resumen.

La aplicación debe solicitar confirmación antes de eliminar definitivamente un registro.

---

# 7. SECCIÓN METAS

La sección Metas debe estar dividida en tres partes claramente diferenciadas:

1. El futuro.
2. Metas.
3. Cosas que quiero.

---

# 8. EL FUTURO

Esta sección debe mostrar los ahorros permanentes destinados al futuro.

Cada ahorro debe mostrarse como un bloque sólido y ordenado.

Cada bloque debe mostrar:

* Título.
* Descripción.
* Monto mensual destinado.
* Monto acumulado.

Estos ahorros no necesitan tener un monto objetivo final.

Ejemplos:

* Jubilación.
* Fondos mutuos.
* Ahorros para el futuro.

---

# 9. METAS ESPECÍFICAS

Las metas específicas deben aparecer como bloques individuales.

Cada bloque debe mostrar:

* Título de la meta.
* Descripción.
* Monto mensual destinado.
* Monto acumulado.
* Monto que se quiere alcanzar.
* Porcentaje completado.

El progreso debe representarse mediante un efecto de líquido que llena el bloque de acuerdo con el porcentaje alcanzado.

Ejemplo:

Si se acumularon Gs. 400.000 de una meta de Gs. 1.000.000, el recipiente debe mostrarse lleno al 40 %.

El efecto debe ser animado, pero visualmente compatible con una pantalla LCD verde monocromática.

---

# 10. COSAS QUE QUIERO

Debe existir una sección para registrar cosas que quiero comprar.

Cada elemento debe mostrarse como una pequeña tarjeta o caja que incluya:

* Fotografía opcional.
* Nombre del elemento.
* Costo aproximado.
* Descripción.

Por ejemplo:

* Impresora.
* Computadora.
* Accesorio.
* Cualquier objeto que quiera comprar.

Cada elemento debe tener una acción para convertirlo en una meta específica.

Cuando se convierta en meta:

* Debe dejar de aparecer en “Cosas que quiero”.
* Debe trasladarse a la sección Metas.
* Debe conservar su título.
* Debe conservar su descripción.
* Debe conservar su fotografía.
* Su costo aproximado debe convertirse en el monto objetivo.
* Debe solicitarse o definirse el monto mensual destinado.

También debe ser posible registrar un gasto relacionado con uno de estos elementos cuando finalmente se compre.

---

# 11. TRATAMIENTO VISUAL DE LAS FOTOGRAFÍAS

Las fotografías cargadas en la sección Metas o en “Cosas que quiero” no deben mostrarse con colores fotográficos normales.

Deben procesarse para parecer imágenes representadas en una pantalla LCD monocromática de los años 1990.

El procesamiento visual debe aplicarse en el navegador mediante JavaScript y Canvas, conservando el archivo original en Google Drive.

La versión mostrada en la interfaz debe utilizar únicamente tonos relacionados con la pantalla LCD:

* Verde claro como fondo.
* Verde medio.
* Verde oscuro.
* Verde casi negro para las sombras más intensas.

La imagen debe tener:

* Resolución visual reducida.
* Pixelado visible.
* Contraste alto.
* Pocos niveles de luminosidad.
* Efecto de sombreado por tramado o dithering.
* Apariencia de imagen monocromática.
* Bordes definidos mediante píxeles.
* Ausencia total de colores fotográficos modernos.

El resultado debe parecer una fotografía convertida para una pantalla LCD verde de una Psion Series 3, un Nokia 5110 o un dispositivo Palm antiguo.

Puede utilizarse un proceso como:

1. Cargar la fotografía original.
2. Dibujarla en un Canvas de baja resolución.
3. Convertir cada píxel a escala de grises.
4. Reducir la escala de grises a una paleta de tres o cuatro tonos verdes.
5. Aplicar tramado ordenado o dithering para representar sombras.
6. Escalar nuevamente la imagen utilizando renderizado por píxel, sin suavizado.
7. Mostrar el resultado dentro de una caja con borde oscuro.

Debe utilizarse:

```css
image-rendering: pixelated;
```

La fotografía procesada debe integrarse visualmente con el resto de la interfaz y no parecer una imagen moderna pegada sobre una interfaz antigua.

El archivo original debe guardarse en Google Drive, mientras que el efecto LCD puede generarse en tiempo real en el frontend.

---

# 12. ACCIÓN PRINCIPAL PARA CARGAR MOVIMIENTOS

La aplicación debe tener una acción principal accesible desde la parte inferior.

No debe ser un botón circular moderno. Debe parecer una tecla física integrada al dispositivo.

Debe cambiar su comportamiento según la sección actual.

## 12.1. En Resumen

Debe abrir un menú con dos opciones:

* Registrar gasto.
* Registrar ingreso.

## 12.2. En Metas

Debe abrir un menú con tres opciones:

* Crear ahorro para el futuro.
* Crear meta específica.
* Agregar algo que quiero.

El menú debe aparecer como una ventana emergente inspirada en un sistema operativo de una agenda electrónica antigua.

---

# 13. FORMULARIO PARA REGISTRAR GASTOS

El formulario debe ser pequeño, rápido y cómodo para usar inmediatamente después de realizar un gasto.

Debe solicitar:

* Motivo del gasto.
* Monto.
* Categoría o destino.

La fecha y la hora deben completarse automáticamente.

El campo de monto debe abrir el teclado numérico del celular.

El campo de categoría debe permitir seleccionar opciones predeterminadas como:

* Alimentación.
* Transporte.
* Ahorros.
* Metas.
* Wishlist o cosas que quiero.

Si se selecciona una meta, un ahorro o un elemento de la wishlist, el formulario debe permitir elegir el elemento específico relacionado.

Ejemplos:

* Aporte a “Fondo de jubilación”.
* Aporte a “Comprar computadora”.
* Compra de “Impresora”.

Cuando se guarde el movimiento:

* Debe enviarse al backend de Apps Script.
* Debe registrarse en Google Sheets.
* Deben actualizarse las métricas.
* Debe actualizarse el saldo disponible.
* Debe actualizarse la meta o ahorro relacionado.
* Debe aparecer en la actividad reciente.

---

# 14. FORMULARIO PARA REGISTRAR INGRESOS

Debe ser posible agregar ingresos adicionales fuera del sueldo.

El formulario debe solicitar:

* Motivo del ingreso.
* Monto.
* Descripción opcional.

La fecha y la hora deben completarse automáticamente.

El ingreso debe incorporarse al flujo disponible del mes y reflejarse inmediatamente en los cálculos de la aplicación.

Debe diferenciarse claramente del sueldo mensual y de los gastos.

---

# 15. FORMULARIO PARA CREAR UN AHORRO PARA EL FUTURO

Debe solicitar:

* Título.
* Monto mensual destinado.
* Descripción.

Debe clasificarse automáticamente como ahorro para el futuro.

No debe exigir un monto objetivo final.

---

# 16. FORMULARIO PARA CREAR UNA META ESPECÍFICA

Debe solicitar:

* Título.
* Monto mensual destinado.
* Monto que se quiere alcanzar.
* Descripción.
* Fotografía opcional.

Debe clasificarse automáticamente como meta específica.

---

# 17. FORMULARIO PARA AGREGAR ALGO QUE QUIERO

Debe solicitar:

* Título.
* Monto aproximado de costo.
* Descripción.
* Fotografía opcional.

Debe clasificarse automáticamente como elemento de la sección “Cosas que quiero”.

La fotografía debe mostrarse con el procesamiento pixelado y monocromático de pantalla LCD descrito anteriormente.

---

# 18. CONFIGURACIÓN

La sección Configuración debe permitir modificar los datos generales de la aplicación.

Debe incluir al menos:

* Sueldo mensual.
* Gastos fijos.
* Categorías disponibles.
* Montos mensuales destinados a ahorros.
* Montos mensuales destinados a metas.
* Datos financieros utilizados al iniciar el mes.

Las modificaciones deben guardarse en Google Sheets y reflejarse en el resto de la aplicación.

---

# 19. IDENTIDAD VISUAL

La aplicación debe inspirarse directamente en la experiencia de usuario clásica de dispositivos móviles de los años 1990, especialmente:

* Psion Series 3.
* Nokia 5110.
* PalmPilot.

La referencia principal para la estructura visual debe ser la Psion Series 3.

No se debe copiar literalmente el teclado físico.

La estructura física del dispositivo debe reinterpretarse para una pantalla táctil moderna.

La interfaz debe sentirse como un organizador electrónico personal clásico adaptado a un celular actual.

---

# 20. ESTRUCTURA VISUAL GENERAL

La pantalla debe dividirse visualmente en tres zonas:

1. Barra superior de estado.
2. Pantalla LCD principal.
3. Zona inferior de teclas de navegación y acciones.

Toda la aplicación puede estar contenida dentro de un marco oscuro que recuerde la carcasa de un dispositivo electrónico.

La interfaz debe evitar parecer una aplicación financiera moderna.

No utilizar:

* Tarjetas blancas modernas.
* Fondos completamente blancos.
* Botones circulares con sombras grandes.
* Degradados modernos.
* Efectos de vidrio.
* Estética de banca digital contemporánea.
* Colores brillantes fuera de la paleta LCD.

---

# 21. PALETA DE PANTALLA LCD

La paleta debe estar basada en tonos verdes monocromáticos.

Debe incluir:

* Verde LCD muy claro para el fondo.
* Verde claro para zonas secundarias.
* Verde medio para elementos desactivados.
* Verde oscuro para bordes e iconos.
* Verde casi negro para texto principal.

Todos los elementos deben conservar suficiente contraste y legibilidad.

Los efectos de profundidad deben realizarse mediante:

* Bordes.
* Patrones.
* Tramado.
* Sombras duras de uno o pocos píxeles.
* Diferentes tonos de verde.

No utilizar sombras suaves propias de interfaces modernas.

---

# 22. TIPOGRAFÍA E ICONOS

La tipografía debe ser:

* Monoespaciada.
* Compacta.
* Muy legible.
* Inspirada en pantallas de baja resolución.

Los títulos pueden mostrarse en mayúsculas.

Los iconos deben:

* Ser simples.
* Utilizar pocos píxeles.
* Ser monocromáticos.
* Tener una estética similar a los iconos de sistemas operativos portátiles de los años 1990.

Los iconos no deben depender de emojis.

---

# 23. BARRA SUPERIOR

Debe existir una barra superior fija y compacta.

Debe mostrar:

* Nombre de la sección actual.
* Fecha actual.
* Hora cuando corresponda.
* Indicador de sincronización.

Ejemplo conceptual:

```text
RESUMEN                 15 JUN
```

El indicador de sincronización puede mostrar estados como:

* Sincronizado.
* Guardando.
* Sin conexión.
* Error.

Debe representarse mediante un icono pequeño y monocromático.

---

# 24. NAVEGACIÓN INFERIOR

Las cuatro secciones principales deben aparecer como una fila de teclas físicas:

* Resumen.
* Gastos.
* Metas.
* Configuración.

Cada tecla debe tener:

* Borde oscuro.
* Fondo LCD.
* Estado normal.
* Estado presionado.
* Estado seleccionado.
* Icono pixelado.
* Texto corto.

Al tocar una tecla debe producirse una animación breve que simule el hundimiento de un botón físico.

La navegación debe permanecer fija en la parte inferior del celular.

---

# 25. VENTANAS Y PANELES

El contenido debe organizarse como ventanas internas de un sistema operativo antiguo.

Utilizar:

* Rectángulos.
* Líneas divisorias.
* Encabezados compactos.
* Bordes oscuros.
* Fondos verdes.
* Poco espacio desperdiciado.

Los paneles deben ocupar casi todo el ancho disponible en el celular.

No abusar de los bordes redondeados. La mayoría de los componentes debe tener esquinas rectas o apenas redondeadas.

---

# 26. FORMULARIOS CON APARIENCIA DE PDA

Los formularios deben abrirse como ventanas del sistema.

Deben incluir:

* Barra de título.
* Campos rectangulares.
* Etiquetas visibles.
* Botones Guardar y Cancelar.
* Selectores adaptados al tacto.
* Mensajes de validación dentro de la misma ventana.

Aunque visualmente sean compactos, los controles deben ser cómodos para tocar con los dedos.

Cada elemento interactivo debe tener un área táctil suficiente para un teléfono celular.

---

# 27. EFECTOS DE LÍQUIDO

Los indicadores líquidos deben respetar la estética LCD.

No deben parecer recipientes modernos tridimensionales.

Deben utilizar:

* Formas rectangulares.
* Bordes pixelados.
* Movimiento horizontal discreto.
* Paleta monocromática verde.
* Tramado para diferenciar el líquido del fondo.
* Porcentaje visible en texto.

El efecto líquido se utilizará en:

* Dinero disponible.
* Progreso de metas específicas.

---

# 28. ADAPTACIÓN A CELULAR

La aplicación debe diseñarse primero para celular.

Debe utilizar:

* Una sola columna.
* Desplazamiento vertical.
* Barra superior fija.
* Navegación inferior fija.
* Acción principal accesible con el pulgar.
* Formularios de pocos campos.
* Teclado numérico para montos.
* Paneles de ancho completo.
* Textos legibles.
* Botones táctiles suficientemente grandes.

No debe reproducirse un teclado QWERTY decorativo dentro de la aplicación.

La parte inferior que en la Psion Series 3 corresponde al teclado físico debe reinterpretarse como:

* Navegación.
* Accesos rápidos.
* Acción principal.
* Botones de los formularios.

En pantallas grandes, la interfaz puede mantenerse centrada con un ancho limitado para conservar la sensación de un dispositivo portátil.

---

# 29. ESTRUCTURA DE GOOGLE SHEETS

Usar Google Sheets como base de datos.

Debe existir una hoja de cálculo principal con pestañas separadas.

## Hoja Configuracion

Columnas o pares clave-valor para almacenar:

* Sueldo mensual.
* Moneda.
* Estado del mes actual.
* Fecha del último inicio de mes.
* Categorías configuradas.

## Hoja Movimientos

Columnas:

* ID.
* Fecha.
* Hora.
* Mes.
* Tipo.
* Motivo.
* Categoría.
* Monto.
* ID relacionado.
* Tipo relacionado.
* Descripción.
* Fecha de creación.
* Fecha de modificación.

El tipo de movimiento debe distinguir entre:

* Gasto.
* Ingreso.
* Aporte a ahorro.
* Aporte a meta.
* Compra de wishlist.

## Hoja AhorrosFuturo

Columnas:

* ID.
* Título.
* Descripción.
* Monto mensual.
* Monto acumulado.
* Estado.
* Fecha de creación.

## Hoja Metas

Columnas:

* ID.
* Título.
* Descripción.
* Monto mensual.
* Monto objetivo.
* Monto acumulado.
* Porcentaje.
* ID de imagen en Drive.
* URL o referencia de imagen.
* Estado.
* Fecha de creación.

## Hoja Wishlist

Columnas:

* ID.
* Título.
* Descripción.
* Costo aproximado.
* ID de imagen en Drive.
* URL o referencia de imagen.
* Estado.
* Fecha de creación.
* Fecha de conversión a meta.

Los registros deben utilizar identificadores únicos y no depender solamente del número de fila.

---

# 30. ORGANIZACIÓN EN GOOGLE DRIVE

Crear una carpeta principal para la aplicación.

Dentro de ella organizar:

```text
FinanzasPersonales/
├── BaseDeDatos/
├── ImagenesMetas/
├── ImagenesWishlist/
└── Respaldos/
```

Las fotografías originales deben guardarse en Google Drive.

Google Sheets debe almacenar el identificador o la referencia necesaria para recuperar cada imagen.

El frontend debe procesar visualmente la fotografía para mostrarla con estilo LCD, sin destruir el archivo original.

---

# 31. BACKEND EN GOOGLE APPS SCRIPT

Google Apps Script debe actuar como backend y proporcionar operaciones para:

* Obtener configuración.
* Modificar configuración.
* Iniciar un mes.
* Obtener resumen mensual.
* Obtener movimientos.
* Crear movimiento.
* Editar movimiento.
* Eliminar movimiento.
* Obtener ahorros para el futuro.
* Crear ahorro para el futuro.
* Obtener metas.
* Crear meta.
* Actualizar meta.
* Convertir wishlist en meta.
* Obtener wishlist.
* Crear elemento de wishlist.
* Subir fotografías a Google Drive.
* Obtener referencias de fotografías.

Todas las respuestas deben devolverse en formato JSON.

Cada respuesta debe incluir:

* Estado de éxito.
* Datos.
* Mensaje.
* Información del error cuando corresponda.

El backend debe validar los datos antes de escribir en Google Sheets.

---

# 32. CONEXIÓN ENTRE GITHUB PAGES Y APPS SCRIPT

El frontend debe publicarse mediante GitHub Pages.

La aplicación debe tener un archivo de configuración donde se indique la URL de la Web App de Apps Script.

El frontend debe comunicarse con el backend mediante solicitudes HTTP.

La aplicación debe:

* Mostrar un estado de carga.
* Informar cuando está guardando.
* Informar cuando la sincronización terminó.
* Manejar errores de conexión.
* Evitar que un mismo formulario se envíe dos veces.
* Actualizar la interfaz después de cada operación exitosa.

No deben incluirse claves privadas ni información sensible en el repositorio de GitHub.

---

# 33. PWA

La aplicación debe poder instalarse desde el navegador del celular.

Debe incluir:

* `manifest.json`.
* `service-worker.js`.
* Iconos para instalación.
* Nombre de la aplicación.
* Nombre corto.
* Color del tema.
* Color de fondo.
* Modo `standalone`.
* Página inicial.
* Caché de los recursos estáticos.

La PWA debe abrirse sin mostrar la interfaz normal del navegador cuando se inicia desde el icono instalado.

Debe conservar la estética de dispositivo electrónico desde la pantalla inicial.

La aplicación puede cargar la estructura visual sin conexión, pero las operaciones que modifican Google Sheets deben indicar claramente cuando necesitan conexión.

---

# 34. COMPORTAMIENTO Y COHERENCIA

Toda la aplicación debe trabajar como un sistema conectado.

Cuando se registre, edite o elimine un movimiento, deben actualizarse:

* El gasto total.
* El ingreso total.
* El dinero disponible.
* La categoría con mayor gasto.
* La actividad reciente.
* Los ahorros.
* Las metas.
* Los porcentajes.
* Los indicadores líquidos.
* El historial completo.

No deben existir datos visuales simulados una vez que la aplicación esté conectada al backend.

Todos los valores mostrados deben provenir de Google Sheets o ser calculados a partir de sus registros.

---

# 35. RESULTADO ESPERADO

Entrega el proyecto completo y organizado.

Debe incluir:

* Estructura de carpetas.
* Archivos HTML.
* Archivos CSS.
* Archivos JavaScript.
* Manifest de la PWA.
* Service Worker.
* Código completo de Google Apps Script.
* Funciones para crear automáticamente las hojas necesarias.
* Encabezados de cada hoja.
* Funciones para leer, crear, modificar y eliminar registros.
* Procesamiento de fotografías mediante Canvas.
* Conversión visual de fotografías a paleta LCD verde pixelada.
* Instrucciones para desplegar el frontend en GitHub Pages.
* Instrucciones para desplegar Apps Script como Web App.
* Instrucciones para conectar la URL del backend.
* Instrucciones para instalar la PWA en Android.

No omitas código utilizando frases como:

* “Aquí iría el resto”.
* “Implementar después”.
* “Código similar”.
* “Completar según necesidad”.

Genera todos los archivos necesarios con código funcional y coherente entre sí.

La prioridad del proyecto debe ser:

1. Registro rápido de movimientos.
2. Claridad de la información financiera.
3. Sincronización correcta con Google Sheets y Google Drive.
4. Uso cómodo desde el celular.
5. Coherencia visual con Psion Series 3, Nokia 5110 y PalmPilot.
6. Fotografías pixeladas en tonos verdes con sombreado LCD.
7. Funcionamiento como PWA instalable.
