const CACHE = 'dreamit-v2';

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
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('/dreamit/index.html').then(r => r || fetch(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});



