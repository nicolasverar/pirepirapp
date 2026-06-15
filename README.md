# Pirepirapp

App privada de finanzas personales servida desde Google Apps Script, con Google Sheets como base de datos y Google Drive para imagenes.

La version publica de GitHub Pages queda desactivada por privacidad. La interfaz real se abre desde el Web App privado de Apps Script, usando tu cuenta de Google.

## Estructura

- `backend/`: proyecto Apps Script completo. Incluye API, Sheets, Drive y la interfaz privada HtmlService.
- `frontend/`: version estatica anterior, desactivada para uso publico.
- `docs/`: guias de instalacion, despliegue y pruebas.
- `scripts/`: ayudas locales.

## Privacidad

El modo recomendado es:

- Web App de Apps Script con `executeAs: USER_DEPLOYING`.
- Acceso del Web App en `MYSELF`.
- Sin GitHub Pages para usar la app real.
- Sin URL de Apps Script guardada en archivos publicos.

El token `FINANZAS_API_TOKEN` puede seguir existiendo como proteccion extra para llamadas API explicitas, pero la interfaz privada usa `google.script.run` dentro de Apps Script y no necesita exponer esa clave.

## Uso

1. Entra al proyecto de Apps Script.
2. Desplega como Web App.
3. Elegi acceso `Solo yo` / `Only myself`.
4. Abri la URL `/exec` estando logueado con tu cuenta de Google.

Si el repo sigue publico, no subas datos reales, credenciales ni claves. Los datos de la app deben vivir solo en Google Sheets, Drive y Script Properties.
