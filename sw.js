// sw.js

const CACHE_NAME = 'classmates-album-v1';
// Список файлів, які потрібно закешувати при встановленні
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/audio/mysong.mp3', // Додайте сюди ваші ключові файли
  '/video/keep-awake.mp4',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
  // ВАЖЛИВО: Не додавайте сюди всі ваші фото! 
  // Їх ми будемо кешувати динамічно.
];

// Подія 'install' - відбувається при першому завантаженні
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
          return caches.delete(key);
        }
      }));
    })
  );
});

// Подія 'fetch' - перехоплення запитів до мережі
// Стратегія "Cache-First" (Спочатку кеш)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Якщо запит є в кеші - повертаємо його
      if (response) {
        return response;
      }
      // Інакше - робимо запит до мережі, отримуємо відповідь
      // і додаємо її в кеш для майбутніх запитів
      return fetch(event.request).then((response) => {
        // Перевіряємо, чи ми отримали коректну відповідь
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Клонуємо відповідь, бо її можна прочитати лише один раз
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
            // Кешуємо нові запити (наприклад, фотографії)
            cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});