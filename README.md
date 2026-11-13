# InstaSave v0.1 — PWA Glass

Versión inicial para Android y GitHub Pages. Incluye interfaz glassmorphism, validación de enlaces de publicaciones/reels/carruseles, historial local, manifest, service worker e iconos.

## Importante
Esta versión todavía NO descarga fotos ni videos. Solo valida el formato del enlace y guarda el historial local. Para descargar medios autorizados necesitaremos conectar un backend seguro. No se evaden cuentas privadas, inicios de sesión ni controles de acceso de Instagram.

## Subida desde Android
1. Descarga y extrae este ZIP en tu teléfono.
2. En GitHub abre el repositorio `pexa0n2k-hub/InstalSave`.
3. Sube los archivos de la raíz: `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js` y `README.md`.
4. Crea/abre la carpeta `assets` en el repositorio y sube dentro `icon-192.png` e `icon-512.png`.
5. En Settings → Pages selecciona `Deploy from a branch`, rama `main` y carpeta `/ (root)`.
6. Abre `https://pexa0n2k-hub.github.io/InstalSave/` cuando termine el despliegue.

GitHub desde el navegador móvil no descomprime automáticamente ZIP dentro del repositorio. Primero extrae el ZIP en el teléfono y después sube los archivos por separado. No subas el ZIP como si fuera el código fuente.

## Archivos
- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- `assets/icon-192.png`
- `assets/icon-512.png`
