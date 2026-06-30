const CACHE_NAME = 'finanzas-lcd-v402';
const STATIC_ASSETS = [
  './',
  './index.html',
  './reset.html',
  './manifest.json',
  './styles/lcd-theme.css?v=4.0.2',
  './styles/main.css?v=4.0.2',
  './styles/responsive.css?v=4.0.2',
  './styles/onboarding.css?v=4.0.2',
  './scripts/config.js?v=4.0.2',
  './scripts/utils.js?v=4.0.2',
  './scripts/state.js?v=4.0.2',
  './scripts/local-store.js?v=4.0.2',
  './scripts/api.js?v=4.0.2',
  './scripts/local-cache.js?v=4.0.2',
  './scripts/router.js?v=4.0.2',
  './scripts/lcd-image.js?v=4.0.2',
  './scripts/forms.js?v=4.0.2',
  './scripts/render.js?v=4.0.2',
  './scripts/onboarding.js?v=4.0.2',
  './scripts/app.js?v=4.0.2',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/nav/resumen.png',
  './icons/nav/gastos.png',
  './icons/nav/metas.png',
  './icons/nav/config.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => Promise.all(
      STATIC_ASSETS.map((asset) => cache.add(asset).catch(() => null))
    ))
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
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
    ))
  );
});

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response && response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(() => caches.match(request));
}
