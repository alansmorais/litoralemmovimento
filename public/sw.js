// Litoral em Movimento - Service Worker (Bypass in dev/preview & Self-Cleaning)
const CACHE_NAME = 'litoral-cache-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Purge all existing caches to completely eliminate white screens and stale bundles
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'UNREGISTER') {
    self.registration.unregister().then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => client.navigate(client.url));
    });
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // ALWAYS bypass: non-GET, API routes, Vite internals, dev modules, source files, preview domains
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.tsx') ||
    url.search.includes('v=') ||
    url.search.includes('t=') ||
    url.hostname.includes('run.app') ||
    url.hostname.includes('localhost') ||
    url.hostname.includes('127.0.0.1')
  ) {
    // Unconditional network pass-through, zero service worker interception
    return;
  }

  // Network-first for other requests, falling back to cache only when truly offline
  event.respondWith(
    fetch(request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(request);
      if (match) return match;
      if (request.mode === 'navigate') {
        const offlinePage = await cache.match('/offline.html');
        if (offlinePage) return offlinePage;
      }
      return new Response('Rede indisponível', { status: 503, statusText: 'Offline' });
    })
  );
});
