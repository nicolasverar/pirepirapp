# Pirepirapp

PWA instalable de finanzas personales con Google Apps Script como API, Google Sheets como base de datos y Google Drive para imagenes.

La app instalable se publica como frontend estatico. No guarda URL ni claves en el repositorio: cada dispositivo se conecta ingresando la URL del Web App y la clave privada `FINANZAS_API_TOKEN`.

## Estructura

- `backend/`: proyecto Apps Script para API, Sheets y Drive.
- `frontend/`: PWA instalable con HTML, CSS, JS, manifest, iconos y service worker.
- `docs/`: guias de instalacion, despliegue y pruebas.
- `scripts/`: ayudas locales.

## Seguridad

El frontend puede estar en GitHub Pages porque no contiene datos ni claves.

Los datos se protegen en Apps Script:

- `FINANZAS_API_TOKEN` vive en Script Properties.
- Las acciones de datos requieren ese token.
- La PWA guarda la URL y, si elegis recordarlo, el token solo en el dispositivo instalado.

`FINANZAS_API_TOKEN` debe tener al menos 32 caracteres aleatorios. Nunca debe ser una palabra, frase, nombre, fecha ni ningun valor predecible.

Usa una clave larga y no la subas a GitHub.

## Instalacion En El Celular

1. Publica `frontend/` en GitHub Pages.
2. Abri la URL de Pages en Chrome.
3. Usa `Instalar app` o `Agregar a pantalla principal`.
4. Al abrir la app instalada, carga la URL `/exec` de Apps Script y tu clave privada.

La URL de Apps Script es un endpoint de API. La pantalla real instalable vive en GitHub Pages.

## Uso Actual

- `Gastos` muestra todos los movimientos disponibles en Drive/Sheets; el mes se sincroniza automaticamente con el calendario y las altas/bajas recalculan el resumen al instante.
- En `Gastos`, `Gasto fijo` permite elegir un gasto fijo configurado y precargarlo como movimiento; `Gasto corriente` abre el formulario estandar sin campo de categoria.
- `Configuracion` permite cargar sueldo mensual, registrar `¡Cobré!` como ingreso de sueldo y administrar gastos fijos estructurados.
- `Resumen` agrupa `Gastaste mas en` por motivo similar y muestra la particion del sueldo entre gastos fijos y disponible.
- `Cosas que quiero` no usa descripcion. `Convertir en meta` crea la meta al instante con el titulo y costo aproximado del item.
- La lista de `Cosas que quiero` se puede ordenar por costo de menor a mayor o de mayor a menor.
