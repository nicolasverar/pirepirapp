# Instalacion

## Requisitos

- Google Apps Script vinculado con `clasp`.
- Acceso a Google Drive y Google Sheets con la misma cuenta.
- Un navegador moderno con tu sesion de Google iniciada.

## Backend privado

1. Abri una terminal en `backend/`.
2. Cuando quieras subir el codigo, ejecuta:

```powershell
clasp push
```

3. En Apps Script, ejecuta manualmente `runSetup` una vez.
4. Acepta los permisos de Google Sheets y Drive.
5. Desplega como Web App con acceso `Solo yo`.

`runSetup` crea:

- La planilla principal.
- Las hojas `Configuracion`, `Movimientos`, `AhorrosFuturo`, `Metas` y `Wishlist`.
- La carpeta `FinanzasPersonales` en Drive.
- Las subcarpetas `BaseDeDatos`, `ImagenesMetas`, `ImagenesWishlist` y `Respaldos`.

## Clave privada

En modo Apps Script privado, la interfaz visual no necesita exponer una clave en el navegador.

Igual conviene mantener una Script Property para las rutas API explicitas:

```text
FINANZAS_API_TOKEN = una clave larga que solo vos conozcas
```

No guardes esa clave en GitHub.

## Frontend

La interfaz principal vive ahora en `backend/App.html`, `backend/AppStyles.html` y `backend/AppClient.html`.

La carpeta `frontend/` queda como version estatica anterior y esta desactivada para uso publico.
