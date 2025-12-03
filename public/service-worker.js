// service-worker.js

const CACHE_NAME = "mi-pwa-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/app.js",
  "/sw-register.js"
];

// Instalación
self.addEventListener("install", event => {
  console.log("[SW] Instalando...");

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting(); // Opcional
});

// Activación
self.addEventListener("activate", event => {
  console.log("[SW] Activado");

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Interceptar peticiones
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request);
    })
  );
});

// SKIP_WAITING solicitado desde sw-register.js
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
