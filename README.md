# InstaSave — Downloader v0.4

PWA de descarga conectada al backend OmniDL.

## Funciones
- Analiza enlaces de publicaciones, carruseles y Reels de Instagram.
- Muestra vista previa por elemento cuando el extractor la proporciona.
- Permite seleccionar elementos y elegir formato disponible.
- Descarga un elemento individual o una selección como ZIP.
- Guarda historial de enlaces localmente.
- Conserva la estética glassmorphism y la instalación PWA.

## Backend configurado
`https://omnidl-poov.onrender.com`

API utilizada:
- `POST /api/v1/media/analyze`
- `GET /api/v1/media/:id/preview/:item`
- `POST /api/v1/media/download`

El backend OmniDL debe permitir el origen `https://pexa0n2k-hub.github.io` en `FRONTEND_ORIGINS`.

## Publicar desde Android
1. Extrae el ZIP en el teléfono.
2. Abre el repositorio `pexa0n2k-hub/InstalSave` en GitHub.
3. Reemplaza en la raíz `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest` y `README.md`.
4. Conserva la carpeta `assets` y sus dos iconos PNG; si GitHub te pide reemplazarlos, usa los incluidos.
5. Espera a que GitHub Pages publique los cambios.
6. En Chrome Android abre InstaSave. Si ves la versión anterior, cierra la PWA, abre el sitio en Chrome y recarga; el service worker nuevo usa una caché distinta.

## Importante
- Esta versión ya no incluye galería, importación local, favoritos ni biblioteca.
- La descarga requiere conexión a Internet y un backend activo.
- Las sesiones de análisis expiran aproximadamente en 15 minutos o al reiniciar el backend. Si caduca, vuelve a analizar el enlace.
- Render Free puede suspender el servidor por inactividad; el primer análisis después de dormir puede tardar.
- Instagram puede bloquear o limitar solicitudes incluso para publicaciones públicas. No se garantiza que todos los enlaces funcionen.
- No admite cuentas privadas ni elude inicios de sesión o controles de acceso.
- Descarga únicamente contenido propio o que tengas permiso para guardar y respeta derechos de autor y condiciones de Instagram.


## v0.4 — vistas previas tipo tarjeta
- Miniaturas compactas con altura fija.
- Carruseles y publicaciones múltiples en cuadrícula de dos columnas.
- Publicación individual centrada y limitada a un ancho máximo.
- Controles de formato y descarga más compactos.
