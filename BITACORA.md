# Bitacora - Pirepirapp

## 2026-06-26 - Wipe de datos del proyecto y preparacion APK

### Objetivo
- Quitar del checkout rastros de datos, vinculos de sincronizacion y material suelto de trabajo.
- Dejar el proyecto preparado para iniciar la transicion a almacenamiento local y APK.

### Cambios
- Se elimino el vinculo local de Apps Script `backend/.clasp.json`.
- Se eliminaron borradores, previews, capturas, imagenes sueltas y laminas antiguas de diseno que no son necesarias para el runtime.
- Se reemplazo la documentacion base para reflejar el nuevo objetivo local/APK.
- `frontend/reset.html` ahora limpia `localStorage`, `sessionStorage`, caches PWA, cache de fotos locales y service workers.

### Pendientes
- Implementar almacenamiento local real en IndexedDB.
- Agregar exportacion/importacion de backup JSON.
- Crear proyecto Android con Capacitor.
- Definir si el backend legacy en `backend/` se elimina despues de completar la migracion.
