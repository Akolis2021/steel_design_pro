// ── Steel Design Pro – Service Worker ──────────────────────────────────────
// Strategy:
//   • App shell (HTML, icons, manifest) → Cache First, then network
//   • /api/* routes → Network Only (never cache API calls)
// ────────────────────────────────────────────────────────────────────────────

const CACHE_NAME = 'steelpro-v1';

// Everything the app needs to work completely offline
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// ── Install: cache the app shell ────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()) // Activate new SW immediately
  );
});

// ── Activate: clean up old caches ───────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // Take control of all open tabs
  );
});

// ── Fetch: serve from cache, fallback to network ─────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept API calls — always go to network
  if (url.pathname.startsWith('/api/')) {
    return; // Let the browser handle it normally
  }

  // For everything else: try cache first, then network, update cache quietly
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(response => {
        // Cache a fresh copy of successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => null);

      // Return cache immediately if available, otherwise wait for network
      return cached || networkFetch;
    })
  );
});
