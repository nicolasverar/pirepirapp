# Despliegue instalable

## Apps Script API

1. En `backend/`, subi el codigo:

```powershell
clasp push
```

2. Crea una nueva version:

```powershell
clasp version "PWA installable API"
```

3. Desplega o actualiza el Web App.
4. Configura:

- Ejecutar como: tu usuario.
- Acceso: cualquier usuario con el enlace.

5. Guarda la URL `/exec`.

Las acciones de datos requieren `FINANZAS_API_TOKEN`. Sin esa clave, el endpoint no entrega ni modifica tus datos.

## GitHub Pages

El workflow `.github/workflows/pages.yml` publica la carpeta `frontend/`.

1. En GitHub, entra a Settings > Pages.
2. En Build and deployment, elegi GitHub Actions.
3. Hace push a `main`.
4. Espera que termine la action `Deploy Installable PWA`.
5. Abri la URL de Pages.

## Instalar En Android

1. Abri la URL de GitHub Pages en Chrome.
2. Toca el menu de Chrome.
3. Elegi `Instalar app` o `Agregar a pantalla principal`.
4. Abri la app instalada.
5. Ingresa:

- URL Apps Script: la URL `/exec`.
- Clave: `FINANZAS_API_TOKEN`.

Podes marcar `Recordar en este dispositivo` si es tu celular personal.
