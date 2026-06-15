# Finanzas LCD

Aplicacion PWA de finanzas personales con frontend estatico, backend en Google Apps Script, Google Sheets como base de datos y Google Drive para imagenes.

La interfaz esta pensada para celular, con estetica LCD verde inspirada en agendas electronicas clasicas.

## Estructura

- `backend/`: proyecto Apps Script para API, Sheets y Drive.
- `frontend/`: HTML, CSS, JavaScript puro, manifest y service worker.
- `docs/`: guias de instalacion, despliegue y pruebas.
- `scripts/`: ayudas locales.

## Estado actual

El backend y el frontend ya tienen codigo funcional local. Falta que pegues la URL real de la Web App de Apps Script en:

```text
frontend/scripts/config.js
```

## GitHub Pages

El repo incluye un workflow en `.github/workflows/pages.yml` que publica la carpeta `frontend/` en GitHub Pages.

Cuando el repositorio este en GitHub:

1. Entra a Settings > Pages.
2. En Build and deployment, elegi GitHub Actions.
3. Hace push a `main`.
4. Abri la URL que GitHub Pages muestre al terminar el workflow.

No abras directamente la URL de Apps Script para usar la app visual; esa URL es solo la API.

## Siguiente paso seguro

Primero revisa los cambios. Cuando quieras subir el backend a Apps Script:

```powershell
cd backend
clasp push
```

Despues crea o actualiza el despliegue como Web App desde Apps Script y pega la URL `/exec` en `frontend/scripts/config.js`.

Mas detalle en:

- `docs/INSTALACION.md`
- `docs/DESPLIEGUE.md`
- `docs/PRUEBAS.md`
