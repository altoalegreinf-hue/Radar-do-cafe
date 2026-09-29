const CACHE_NAME = "radar-do-cafe-v3";

const APP_SHELL = [
  "/Radar-do-cafe/",
  "/Radar-do-cafe/index.html",
  "/Radar-do-cafe/manifest.json",
  "/Radar-do-cafe/icon-192.png",
  "/Radar-do-cafe/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // Não armazenar APIs e fontes externas no cache.
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {

        if (response && response.ok) {
          const copia = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, copia);
            });
        }

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
