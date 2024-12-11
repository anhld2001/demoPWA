const CACHE_NAME = 'work-report-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/data/reports.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title || 'New Notification';
  const options = {
      body: data.body || 'Click to view',
      icon: '/icon.png',
      badge: '/badge.png'
  };

  event.waitUntil(
      self.registration.showNotification(title, options)
  );
}); 

// Đăng ký Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
          console.log('Service Worker registered', registration);

          // Đăng ký push notification
          return registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array('<your-public-vapid-key>')
          });
      })
      .then(subscription => {
          console.log('Push Notification subscribed', subscription);
          // Gửi thông tin đăng ký đến backend hoặc lưu trữ
      })
      .catch(error => {
          console.error('Push Notification failed', error);
      });
}

// Hàm chuyển đổi Base64 sang Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
