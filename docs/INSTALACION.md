# Instalacion

## Requisitos

- Google Apps Script vinculado con `clasp`.
- Acceso a Google Drive y Google Sheets con la misma cuenta.
- Un navegador moderno en Android o escritorio.

## Backend

1. Abri una terminal en `backend/`.
2. Cuando quieras subir el codigo, ejecuta:

```powershell
clasp push
```

3. En Apps Script, ejecuta manualmente `runSetup` una vez.
4. Acepta los permisos de Google Sheets y Drive.

`runSetup` crea:

- La planilla principal.
- Las hojas `Configuracion`, `Movimientos`, `AhorrosFuturo`, `Metas` y `Wishlist`.
- La carpeta `FinanzasPersonales` en Drive.
- Las subcarpetas `BaseDeDatos`, `ImagenesMetas`, `ImagenesWishlist` y `Respaldos`.

## Frontend

1. Desplega Apps Script como Web App.
2. Copia la URL terminada en `/exec`.
3. Pegala en:

```text
frontend/scripts/config.js
```

Ejemplo:

```js
window.FINANZAS_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec',
  APP_NAME: 'Finanzas LCD',
  DEFAULT_MONTH: ''
};
```

## Uso local

Para probar la PWA en localhost:

```powershell
.\scripts\servir-frontend.ps1
```

Luego abri:

```text
http://localhost:4173
```
