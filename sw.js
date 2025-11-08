const CACHE_NAME = 'goal-tracker-v2'; // Updated cache name to force update
const urlsToCache = [
  '/',
  '/index.html',
  '/navbarlogo.png',
  '/no_goal.png',
  '/apple-touch-icon.png',
  '/site.webmanifest',
  'https://cdn.tailwindcss.com',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'
];
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Service Worker: Cache addAll failed:', error);
          throw error;
        });
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request).catch(error => {
          console.error('Service Worker: Fetch failed:', error);
          throw error;
        });
      })
  );
});
self.addEventListener('push', event => {
  console.log('Service Worker: Push event received');
  const data = event.data ? event.data.json() : { title: 'Goal Tracker Reminder', body: 'Time to check your goals!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/navbarlogo.png',
      badge: '/navbarlogo.png'
    }).catch(error => {
      console.error('Service Worker: Notification failed:', error);
    })
  );
});
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          console.log('Service Worker: Focusing existing window');
          return client.focus();
        }
      }
      if (clients.openWindow) {
        console.log('Service Worker: Opening new window');
        return clients.openWindow('/');
      }
    }).catch(error => {
      console.error('Service Worker: Notification click handling failed:', error);
    })
  );
});
