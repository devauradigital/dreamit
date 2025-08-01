const CACHE_NAME = 'goal-tracker-v2';
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

// Install event: Cache essential files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Cache failed:', error);
      })
  );
  // Force the service worker to activate immediately
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Take control of clients immediately
  self.clients.claim();
});

// Fetch event: Serve cached content or fetch from network
self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Service Worker: Found in cache', event.request.url);
          return response;
        }
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Cache new responses for GET requests
            if (event.request.method === 'GET') {
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                });
            }
            return networkResponse;
          })
          .catch(error => {
            console.error('Service Worker: Fetch failed:', error);
            // Optional: Return a fallback page or response for offline
            return caches.match('/index.html');
          });
      })
  );
});

// Push event: Handle push notifications
self.addEventListener('push', event => {
  console.log('Service Worker: Push event received');
  let data = { title: 'Goal Tracker Reminder', body: 'Time to check your goals!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      console.error('Service Worker: Error parsing push data:', error);
    }
  }
  const options = {
    body: data.body,
    icon: '/navbarlogo.png',
    badge: '/navbarlogo.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .catch(error => console.error('Service Worker: Notification error:', error))
  );
});

// Notification click event: Open or focus the app
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        const url = event.notification.data.url || '/';
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
      .catch(error => console.error('Service Worker: Notification click error:', error))
  );
});
