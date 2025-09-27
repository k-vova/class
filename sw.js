// Змінив версію, щоб кеш примусово оновився
const CACHE_NAME = 'classmates-album-v5'; 

// Список файлів для збереження в кеші
const FILES_TO_CACHE = [
  // --- Основні файли (ВИПРАВЛЕНО) ---
  '/class/',
  '/class/index.html',
  '/class/main.js', // <-- Правильна назва файлу скриптів
  
  // --- Важливі ресурси ---
  '/class/img/background.jpg', // <-- Додав фонове зображення
  '/class/video/keep-awake.mp4',
  '/class/icons/icon-192x192.png',
  '/class/icons/icon-512x512.png',
  '/class/favicon.ico',

  // --- Музика (додав файли з вашого плейлиста) ---
  '/class/audio/song1.mp3',
  '/class/audio/song2.mp3',
  '/class/audio/song3.mp3',
  '/class/audio/song4.mp3',
  '/class/audio/song5.mp3'
];

// 1. Встановлення Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Встановлення...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Кешування оболонки додатку...');
      return cache.addAll(FILES_TO_CACHE);
    })
    .catch(error => {
      console.error('[Service Worker] Помилка при кешуванні оболонки:', error);
    })
  );
});

// 2. Активація Service Worker та очищення старого кешу
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

// 3. Перехоплення запитів (для роботи офлайн)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Якщо ресурс є в кеші, повертаємо його
      if (response) {
        return response;
      }
      // Інакше, завантажуємо з мережі
      return fetch(event.request).then((response) => {
        // Перевіряємо, чи отримали ми валідну відповідь
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // Клонуємо відповідь, щоб покласти її в кеш
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
        });
        
        return response;
      });
    })
  );
});