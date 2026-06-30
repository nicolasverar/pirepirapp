# Pirepirapp

App personal de finanzas con estetica LCD verde. Este repo quedo limpiado para iniciar la transicion desde PWA sincronizada con Google Apps Script/Drive hacia una app local instalable como APK.

## Estado Actual

- Version productiva visible: `v4.0`.
- El frontend productivo vive en `frontend/`.
- El backend de Apps Script queda solo como legado temporal en `backend/`.
- No debe haber token, URL de Web App, ID de Apps Script, ID de Sheet, fotos personales ni registros financieros en el repo.
- La app arranca por defecto en modo local con IndexedDB mediante `frontend/scripts/local-store.js`; Apps Script queda solo como legado opcional.
- El respaldo operativo es `BACKUP LOCAL` desde Configuracion: exporta/importa un JSON completo del dispositivo, fuera del repo.
- El modelo financiero local trata el sueldo como una particion disjunta: gastos fijos, ahorros y disponible.
- El sueldo se registra desde el formulario de ingreso usando motivo `Sueldo`; esto suma el remanente anterior y activa recordatorios post-cobro hasta cargar fijos, futuro y metas.
- En una instalacion nueva se muestra un onboarding inicial saltable para cargar sueldo, gastos fijos y primeros ahorros/metas/cosas; lo cargado se guarda por el mismo store local.
- El guardado local deja metadata diagnostica de ultima escritura (`IndexedDB` o fallback) sin registrar datos financieros extra.

## Modelo Financiero

- El saldo es continuo: no se resetea por mes; el remanente anterior entra al ciclo siguiente.
- El sueldo configurado define la particion esperada, pero el dinero disponible se calcula con movimientos reales.
- Los ahorros planificados se derivan automaticamente de futuro y metas activas.
- Wishlist queda como lista de deseos sin compromiso mensual; sus compras impactan como movimiento real.
- El panel post-cobro desaparece cuando todos los compromisos del mes fueron registrados.

## Datos

El repo no debe guardar:

- Movimientos reales.
- Montos personales.
- Fotos cargadas por el usuario.
- Links privados de Drive, Sheets o Apps Script.
- Backups exportados.
- Seeds de prueba con datos reales.
- APK/AAB generados.

Para limpiar una instalacion ya usada en navegador o PWA, abrir `frontend/reset.html` desde el mismo origen donde se instalo la app. Para limpiar Android por completo, tambien se puede borrar almacenamiento desde Ajustes > Apps > Pirepirapp > Almacenamiento.

## Proximo Camino

1. Probar persistencia local en APK: config, gastos, metas, wishlist, fotos y restauracion desde backup.
2. Pulir releases Android firmadas.
3. Definir si el backend legacy en `backend/` se elimina.
4. Evaluar almacenamiento nativo para fotos/backups si el volumen crece.

## Pruebas Locales

```powershell
npm run test:smoke
```

El smoke test simula modo local, cobro mensual, remanente continuo, panel post-cobro, gastos fijos, movimientos, ahorros, metas, wishlist, fotos y persistencia.

## APK Android

Antes de compilar en Android Studio, preparar los assets nativos:

```powershell
npm run android:prepare
```

Esto copia solo la app productiva desde `frontend/` hacia `android/app/src/main/assets/public/`, excluyendo laboratorios `previews/`, `data/` y archivos auxiliares que no deben entrar al APK. Luego abrir la carpeta `android/` en Android Studio y ejecutar `Build > Build APK(s)`.

Para generar un APK debug instalable desde consola:

```powershell
npm run cap:build:debug
```

Salida esperada: `android/app/build/outputs/apk/debug/app-debug.apk`. Android Studio usa su JBR 21; si se invoca `gradlew` directo desde consola, definir `JAVA_HOME` a JDK/JBR 21. Para un release instalable fuera de debug hace falta una keystore externa no versionada.
