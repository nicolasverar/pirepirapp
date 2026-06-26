# Instalacion Local y APK

## PWA Local

La app puede probarse como frontend estatico desde `frontend/`.

En esta maquina el script historico con Python puede fallar si Python no esta instalado. Para servir con Node:

```powershell
npx serve frontend
```

Si no queres instalar nada global, tambien se puede usar cualquier servidor estatico local.

## APK

La ruta recomendada para Android es Capacitor:

```powershell
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init Pirepirapp com.pirepirapp.local --web-dir frontend
npx cap add android
npx cap sync android
npx cap open android
```

Desde Android Studio se prueba en emulador o telefono fisico. Para telefono fisico hay que activar Opciones de desarrollador y Depuracion USB.

## Limpieza De Una Instalacion Vieja

Abrir `reset.html` desde el mismo origen donde se uso la app para borrar caches y datos locales del navegador. En Android instalado, tambien se puede borrar desde Ajustes > Apps > Pirepirapp > Almacenamiento.
