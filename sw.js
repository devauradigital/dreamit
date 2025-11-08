/* service-worker.js */
const CACHE_NAME = 'goal-tracker-v2';          // bump this when you deploy
const ASSETS = [
  '/',
  '/index.html',
  '/navbarlogo.png',
  '/no_goal.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/manifest.json',
  // CDN assets – they will be cached on first load
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js'
];

/* ---------- INSTALL ---------- */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ---------- ACTIVATE ---------- */
self.addEventListener('activate', e => {
  const whitelist = [CACHE_NAME];
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.map(name => {
          if (!whitelist.includes(name)) return caches.delete(name);
        })
      )
    ).then(() => self.clients.claim())
  );
});

/* ---------- FETCH ---------- */
self.addEventListener('fetch', e => {
  // Only cache GET requests
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      // Network-first for everything else
      return fetch(e.request).then(networkResponse => {
        // Cache successful responses (2xx)
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return networkResponse;
      });
    }).catch(() => {
      // Optional: offline fallback page
      // return caches.match('/offline.html');
    })
  );
});

/* ---------- PUSH (optional) ---------- */
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'Dreamit', body: 'Time to check your goals!' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'goal-reminder'
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(list => {
        for (const c of list) {
          if (c.url.includes('index.html') && 'focus' in c) return c.focus();
        }
        if (clients.openWindow) return clients.openWindow('/');
      })
  );
});
