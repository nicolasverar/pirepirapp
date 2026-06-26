# Pirepirapp

App personal de finanzas con estetica LCD verde. Este repo quedo limpiado para iniciar la transicion desde PWA sincronizada con Google Apps Script/Drive hacia una app local instalable como APK.

## Estado Actual

- El frontend productivo vive en `frontend/`.
- El backend de Apps Script queda solo como legado temporal en `backend/`.
- No debe haber token, URL de Web App, ID de Apps Script, ID de Sheet, fotos personales ni registros financieros en el repo.
- La siguiente etapa recomendada es reemplazar la capa `frontend/scripts/api.js` por almacenamiento local, idealmente IndexedDB primero y luego Capacitor/Android.

## Datos

El repo no debe guardar:

- Movimientos reales.
- Montos personales.
- Fotos cargadas por el usuario.
- Links privados de Drive, Sheets o Apps Script.
- Backups exportados.
- APK/AAB generados.

Para limpiar una instalacion ya usada en navegador o PWA, abrir `frontend/reset.html` desde el mismo origen donde se instalo la app. Para limpiar Android por completo, tambien se puede borrar almacenamiento desde Ajustes > Apps > Pirepirapp > Almacenamiento.

## Proximo Camino

1. Crear un adaptador local que replique las acciones actuales del API.
2. Guardar configuracion, movimientos, metas y wishlist en IndexedDB.
3. Guardar fotos como blobs/base64 locales o migrarlas a almacenamiento nativo al empaquetar.
4. Agregar exportar/importar backup JSON.
5. Empaquetar con Capacitor y probar APK en Android.
