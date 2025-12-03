const CACHE_NAME = 'mates-pwa-v2'; // Cambiamos a v2 para obligar a actualizar

const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './splash.html', // Agregamos el splash
  './api/exercises.js', // ¡CRUCIAL! La lógica de los ejercicios
  './icons/icon-192.png', // Asegúrate que existan
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  // El "skipWaiting" fuerza al SW a activarse de inmediato
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log(' Guardando archivos en caché para offline...');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Borrando caché vieja:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, lo devuelve (Offline)
        if (response) {
          return response;
        }
        // Si no, lo busca en internet
        return fetch(event.request);
      })
  );
});