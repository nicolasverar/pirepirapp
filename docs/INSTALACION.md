# Instalacion

## Requisitos

- Google Apps Script vinculado con `clasp`.
- Acceso a Google Drive y Google Sheets con la misma cuenta.
- Un navegador moderno en Android o escritorio.
- Repositorio publico o un hosting HTTPS para servir la PWA.

## Backend

1. Abri una terminal en `backend/`.
2. Subi el codigo:

```powershell
clasp push
```

3. En Apps Script, ejecuta manualmente `runSetup` una vez.
4. Acepta los permisos de Google Sheets y Drive.
5. Configura una Script Property:

```text
FINANZAS_API_TOKEN = una clave larga que solo vos conozcas
```

6. Desplega como Web App con acceso `cualquier usuario con el enlace`.

Ese acceso es necesario para que la PWA instalada pueda sincronizar. La proteccion real de datos es el token privado.

`runSetup` crea:

- La planilla principal.
- Las hojas `Configuracion`, `Movimientos`, `AhorrosFuturo`, `Metas` y `Wishlist`.
- La carpeta `FinanzasPersonales` en Drive.
- Las subcarpetas `BaseDeDatos`, `ImagenesMetas`, `ImagenesWishlist` y `Respaldos`.

## Frontend Instalado

La carpeta `frontend/` es la app instalable.

No pongas la URL ni la clave en `frontend/scripts/config.js`. La app las pide al abrir y las guarda localmente en el dispositivo.

Para probar local:

```powershell
.\scripts\servir-frontend.ps1
```

Luego abri:

```text
http://localhost:4173
```
