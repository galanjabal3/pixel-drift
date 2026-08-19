const VERSION = 'pixel-drift-v6';
const CACHE_NAME = `pixel-drift-${VERSION}`;

const CORE = ['./', './offline.html', './register.js', './dist/pixel-drift.mjs'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    const serveGame = () =>
      caches.match('./offline.html').then((c) => c || Response.error());
    if (navigator.onLine === false) {
      event.respondWith(serveGame());
      return;
    }
    const withTimeout = (p, ms) =>
      Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))]);
    event.respondWith(
      withTimeout(fetch(req), 2500)
        .then((res) => {
          if (!res) return serveGame();
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(serveGame),
    );
    return;
  }

  event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});