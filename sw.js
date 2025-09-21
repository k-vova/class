// sw.js

const CACHE_NAME = 'classmates-album-v3'; // Змінив версію, щоб кеш точно оновився
const FILES_TO_CACHE = [
  '/class/',
  '/class/index.html',
  '/class/style.css',
  '/class/audio/mysong.mp3',
  '/class/video/keep-awake.mp4',
  '/class/icons/icon-192x192.png',
  '/class/icons/icon-512x512.png'
];

// Подія 'install' - кешування оболонки додатку
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Встановлення...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Кешування оболонки додатку');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Подія 'activate' - очищення старого кешу
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Видалення старого кешу', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Подія 'fetch' - перехоплення запитів (стратегія "Cache-First")
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Якщо є в кеші - повертаємо з кешу
      if (response) {
        return response;
      }
      // Інакше - йдемо в мережу
      return fetch(event.request).then((response) => {
        // Якщо відповідь некоректна, просто повертаємо її
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Клонуємо відповідь і кешуємо її
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
        });
        
        return response;
      });
    })
  );
});