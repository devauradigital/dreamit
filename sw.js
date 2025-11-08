// sw.js for GitHub Pages (subpath /dreamit/)
const CACHE = 'dreamit-v1';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([
        '/dreamit/',
        '/dreamit/index.html',
        '/dreamit/site.webmanifest',
        '/dreamit/navbarlogo.png',
        '/dreamit/no_goal.png'
      ]);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('/dreamit/index.html').then(r => r || fetch(req)));
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
