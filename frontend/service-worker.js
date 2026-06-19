const CACHE_NAME = 'finanzas-lcd-v40';
const STATIC_ASSETS = [
  './',
  './index.html',
  './reset.html',
  './manifest.json',
  './styles/lcd-theme.css?v=2.32',
  './styles/main.css?v=2.32',
  './styles/responsive.css?v=2.32',
  './scripts/config.js?v=2.32',
  './scripts/utils.js?v=2.32',
  './scripts/state.js?v=2.32',
  './scripts/api.js?v=2.32',
  './scripts/local-cache.js?v=2.32',
  './scripts/router.js?v=2.32',
  './scripts/lcd-image.js?v=2.32',
  './scripts/forms.js?v=2.32',
  './scripts/render.js?v=2.32',
  './scripts/app.js?v=2.32',
  './assets/torta.pmg.png?v=2.32',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/nav/resumen.png',
  './icons/nav/gastos.png',
  './icons/nav/metas.png',
  './icons/nav/config.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.indexOf('finanzas-lcd-') === 0 && key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (event.request.mode === 'navigate' || requestUrl.pathname.endsWith('/index.html') || requestUrl.pathname.endsWith('/scripts/config.js')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => (
      cached || fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
    ))
  );
});

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      return response;
    })
    .catch(() => caches.match(request));
}
