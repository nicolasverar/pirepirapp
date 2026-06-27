# Transicion A APK

## Estado Del Primer APK

- Capacitor queda inicializado con `webDir = frontend`.
- El proyecto Android queda en `android/`.
- El paquete Android es `com.pirepirapp.local`.
- El nombre visible de la app es `Pirepirapp`.
- Esta etapa ya incluye un primer modo local con IndexedDB para configuracion, movimientos, metas, wishlist y fotos locales.

## Fase 1 - Local Primero

- Crear una capa `LocalStore` con IndexedDB.
- Mantener el contrato de datos que hoy consume la UI.
- Cambiar el arranque para que no pida URL ni token.
- Agregar exportacion e importacion JSON.

Estado: los tres primeros puntos ya estan implementados en `frontend/scripts/local-store.js`. Queda agregar exportacion/importacion JSON como backup manual.

## Fase 2 - Empaque Android

- Inicializar Capacitor.
- Usar `frontend/` como `webDir`.
- Probar con Android Studio.
- Sincronizar cambios con `npx cap sync android`.
- Android Gradle ejecuta `npm run cap:copy` antes de compilar para copiar cambios web al APK.

Comandos desde la raiz del repo:

```powershell
npm install
npm run cap:sync
npm run cap:open
```

## Modo Carpeta Estricta

Los archivos del proyecto quedan dentro de esta carpeta del repo. Para reducir escrituras externas durante la prueba:

- `.npmrc` fuerza la cache de npm a `.tool-cache/npm`.
- `npm run cap:build:debug` usa `.gradle-user/` como Gradle user home.
- `.tool-cache/` y `.gradle-user/` quedan ignoradas por git.

Android Studio igualmente puede usar su SDK/JDK y caches propios del sistema. Si la maquina de prueba requiere aislamiento total, configurar el SDK de Android Studio dentro de una subcarpeta local del repo antes de sincronizar Gradle.

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
