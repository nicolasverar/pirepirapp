# Transicion A APK

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

## Fase 3 - Pruebas En Celular

Opciones:

- Android Studio: ejecutar en emulador o telefono por USB.
- APK debug: generar e instalar manualmente en el telefono.
- GitHub Actions: compilar APK y descargarlo como artifact.

No hace falta una extension de Git para probar. Lo mas parecido es usar GitHub Actions para que cada push genere un APK descargable. Git solo versiona el codigo; el APK conviene tratarlo como artifact de build, no como archivo del repo.
