# Pruebas manuales

## Backend

- Ejecutar `runSetup` y confirmar que se crean las hojas.
- Llamar `ping` desde Apps Script y verificar zona horaria `America/Asuncion`.
- Confirmar que `bootstrap` sin token devuelve error de clave.
- Confirmar que `bootstrap` con `FINANZAS_API_TOKEN` devuelve datos.

## PWA

- Abrir la URL publica de GitHub Pages.
- Confirmar que aparece el formulario de conexion.
- Cargar URL `/exec` de Apps Script y clave privada.
- Marcar `Recordar en este dispositivo` en un celular personal.
- Instalar desde Chrome con `Instalar app` o `Agregar a pantalla principal`.
- Abrir desde el icono instalado y verificar que mantiene la conexion.
- Abrir Resumen y verificar estado de sincronizacion.
- Registrar un gasto comun.
- Registrar un ingreso adicional.
- Registrar un aporte a ahorro.
- Registrar un aporte a meta.
- Comprar un elemento de wishlist.
- Editar un movimiento y verificar que cambien metricas y acumulados.
- Eliminar un movimiento y verificar que se reviertan metricas y acumulados.
- Crear meta con fotografia y verificar efecto LCD pixelado.
- Eliminar una meta y verificar que desaparece de la lista sin borrar movimientos historicos.
- Convertir wishlist en meta.
- Cambiar sueldo mensual en Configuracion.

## Seguridad

- Abrir la URL de Apps Script sin token y verificar que solo muestra la portada de API.
- No guardar `FINANZAS_API_TOKEN` en archivos del repo.
- Si se pierde el celular, cambiar `FINANZAS_API_TOKEN` en Apps Script.
