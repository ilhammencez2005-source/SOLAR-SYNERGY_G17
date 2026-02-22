
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Solar Synergy Update';
  const options = {
    body: data.body || 'New update from your charging station.',
    icon: 'https://lh3.googleusercontent.com/d/1JB1msv8nSU3u--ywu_bAhKEhKar-94Vb',
    badge: 'https://lh3.googleusercontent.com/d/1JB1msv8nSU3u--ywu_bAhKEhKar-94Vb',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
