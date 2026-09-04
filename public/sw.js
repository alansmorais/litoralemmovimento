// Litoral em Movimento - Self-Unregistering & Cache-Purging Service Worker
// Completely disables service worker caching to prevent white screen / loading lockups
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.matchAll({ type: 'window' });
    }).then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: 'SW_UNREGISTERED' });
      }
    })
  );
});

