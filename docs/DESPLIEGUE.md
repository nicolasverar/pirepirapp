# Distribucion

## Mientras Sea PWA

GitHub Pages puede seguir sirviendo `frontend/` para pruebas visuales, pero no debe considerarse la fuente de datos. La etapa local/APK debe dejar de depender de Apps Script, Sheets y Drive.

## Para APK

El flujo esperado es:

1. Preparar frontend local-only.
2. Empaquetar con Capacitor.
3. Abrir `android/` en Android Studio.
4. Probar en emulador o telefono fisico.
5. Generar APK debug para pruebas internas.
6. Generar release APK/AAB solo cuando la persistencia local y backups esten probados.

No versionar APK, AAB, backups ni datos personales.
