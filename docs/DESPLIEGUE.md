# Despliegue privado

## Apps Script

1. En `backend/`, subi el codigo:

```powershell
clasp push
```

2. Crea una nueva version:

```powershell
clasp version "Modo privado Apps Script"
```

3. Actualiza el despliegue Web App existente o crea uno nuevo.
4. Configura:

- Ejecutar como: tu usuario.
- Acceso: solo yo.

5. Abri la URL `/exec` estando logueado con tu cuenta de Google.

## GitHub Pages

GitHub Pages no se usa para la app privada.

Para evitar confusiones:

- El workflow de Pages fue removido.
- `frontend/scripts/config.js` no contiene una URL real.
- `index.html` y `frontend/index.html` muestran solo un aviso de app privada.

Si el repo esta publico, podes dejarlo asi sin datos reales. Para maxima privacidad, cambia el repo a privado y desactiva Pages en Settings > Pages.

## API publica opcional

Las rutas `?action=...` siguen existiendo para pruebas tecnicas, pero requieren `FINANZAS_API_TOKEN` salvo `ping`. No uses esta API como entrada principal si queres privacidad total.
