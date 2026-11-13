# InstaSave — starter PWA

Interfaz inicial glassmorphism para Android/PWA. Incluye validación básica de enlaces, historial local, manifest, service worker e instalación PWA.

## Importante: estado real de las descargas
Este starter **todavía no descarga archivos**. La interfaz reconoce URLs de publicaciones/reels/carruseles y guarda el historial. Instagram no ofrece una API pública general para descargar cualquier publicación. No se debe implementar scraping que evada inicio de sesión, controles de acceso, cuentas privadas o límites de la plataforma.

## Siguiente etapa: servicio de procesamiento
Conectar `POST /api/resolve` en un backend propio. El backend debe:
- Aceptar únicamente URLs públicas y permitidas.
- Respetar derechos de autor, permisos y términos aplicables.
- No pedir ni almacenar contraseñas/cookies de Instagram.
- Devolver metadatos y enlaces de medios únicamente cuando el acceso esté permitido.
- Aplicar límites de uso, validación de dominio y protección contra SSRF.
- Entregar archivos con nombres/tipos MIME seguros.

Respuesta sugerida:
```json
{
  "ok": true,
  "media": [
    {"type":"image","url":"https://...","filename":"instasave-01.jpg"}
  ]
}
```
La aplicación debe validar la respuesta antes de habilitar descargas.

## Probar
1. Sube el contenido de esta carpeta a un repositorio GitHub.
2. Activa GitHub Pages desde Settings → Pages → Deploy from a branch → `main` / root.
3. Abre la URL HTTPS en Chrome Android y usa el menú ⋮ → Instalar aplicación o Añadir a pantalla principal.

## Convertir a APK después
Cuando la PWA esté estable, añadir Capacitor:
```bash
npm init -y
npm install @capacitor/core @capacitor/cli
npx cap init InstaSave com.instasave.app
npm install @capacitor/android
npx cap add android
```
Para compilar APK se necesita Android Studio/SDK (local o CI). El proyecto web puede seguir publicándose en GitHub Pages.

## Próximas mejoras
- Conectar backend compatible.
- Vista previa real de los medios autorizados.
- Descarga individual y descarga múltiple de carruseles.
- Permisos/compartir y guardado en dispositivo.
- Pantalla de ajustes, privacidad y límites.
