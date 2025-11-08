const CACHE_NAME = 'dreamit-v1';
const urlsToCache = [
  '/dreamit/',
  '/dreamit/index.html',
  '/dreamit/site.webmanifest',
  '/dreamit/navbarlogo.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
