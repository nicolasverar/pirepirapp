# Transicion A APK

## Estado Del Primer APK

- Capacitor queda inicializado con `webDir = frontend`.
- El proyecto Android queda en `android/`.
- El paquete Android es `com.pirepirapp.local`.
- El nombre visible de la app es `Pirepirapp`.
- Esta primera etapa es un contenedor Android para probar instalacion y WebView. Todavia no reemplaza la capa legacy de Apps Script por almacenamiento local.

## Fase 1 - Local Primero

- Crear una capa `LocalStore` con IndexedDB.
- Mantener el contrato de datos que hoy consume la UI.
- Cambiar el arranque para que no pida URL ni token.
- Agregar exportacion e importacion JSON.

## Fase 2 - Empaque Android

- Inicializar Capacitor.
- Usar `frontend/` como `webDir`.
- Probar con Android Studio.
- Sincronizar cambios con `npx cap sync android`.

Comandos desde la raiz del repo:

```powershell
npm install
npm run cap:sync
npm run cap:open
```

Si `cap sync` falla dentro de OneDrive por permisos `EPERM`, abrir igualmente `android/` en Android Studio y dejar que Android Studio regenere/compile. En una carpeta local fuera de OneDrive suele ser mas estable.

## Fase 3 - Pruebas En Celular

Opciones:

- Android Studio: ejecutar en emulador o telefono por USB.
- APK debug: generar e instalar manualmente en el telefono.
- GitHub Actions: compilar APK y descargarlo como artifact.

No hace falta una extension de Git para probar. Lo mas parecido es usar GitHub Actions para que cada push genere un APK descargable. Git solo versiona el codigo; el APK conviene tratarlo como artifact de build, no como archivo del repo.

## Prueba En Android Studio

1. Abrir Android Studio.
2. Elegir `Open`.
3. Seleccionar la carpeta `android/` dentro del repo.
4. Esperar a que Gradle sincronice.
5. Crear o seleccionar un emulador.
6. Tocar `Run`.

Para generar APK debug desde Android Studio:

```text
Build > Build App Bundle(s) / APK(s) > Build APK(s)
```

El APK debug queda normalmente en:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```
