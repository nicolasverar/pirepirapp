# Despliegue

## Apps Script

1. En `backend/`, subi el codigo:

```powershell
clasp push
```

2. Abri el proyecto:

```powershell
clasp open
```

3. En Apps Script, crea un despliegue de tipo Web App.
4. Configura:

- Ejecutar como: tu usuario.
- Acceso: cualquier usuario con el enlace, o la opcion equivalente que prefieras.

5. Copia la URL `/exec`.

## Configurar frontend

Edita `frontend/scripts/config.js`:

```js
window.FINANZAS_CONFIG = {
  API_URL: 'URL_DE_APPS_SCRIPT_WEB_APP',
  APP_NAME: 'Finanzas LCD',
  DEFAULT_MONTH: ''
};
```

## GitHub Pages

1. Sube el repositorio a GitHub.
2. En Settings > Pages, selecciona la carpeta `frontend` si usas una rama dedicada, o publica la carpeta mediante el flujo que prefieras.
3. Verifica que `index.html`, `manifest.json`, `service-worker.js`, `styles/`, `scripts/` e `icons/` queden disponibles en la URL publica.

## Android

1. Abri la URL de GitHub Pages en Chrome.
2. Espera a que cargue la app.
3. Usa la opcion de instalar aplicacion o agregar a pantalla principal.
4. La app debe abrir en modo `standalone`.
