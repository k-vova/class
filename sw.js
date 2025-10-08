const CACHE_NAME = 'classmates-album-v4'; 
const FILES_TO_CACHE = [
  '/class/',
  '/class/index1.html',
  '/class/style1.css',
  '/class/script1.js', 
  '/class/audio/happy-birthday.mp3',
  '/class/audio/song1.mp3',
  '/class/audio/song2.mp3',
  '/class/audio/song3.mp3',
  '/class/audio/song4.mp3',
  '/class/audio/song5.mp3',
  '/class/audio/mysong.mp3',
  '/class/video/clip1.mp4',
  '/class/video/clip2.mp4',
  '/class/video/clip3.mp4',
  '/class/video/clip4.mp4',
  '/class/video/keep-awake.mp4',
  '/class/icons/icon-192x192.png',
  '/class/icons/icon-512x512.png',
  '/class/favicon.ico' 
];

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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
        });
        
        return response;
      });
    })
  );
});