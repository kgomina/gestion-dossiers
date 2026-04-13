const CACHE_NAME = "gestion-dossiers-v2";

// Fichiers à mettre en cache pour le mode hors-ligne
const ASSETS = [
  "/gestion-dossiers/",
  "/gestion-dossiers/index.html",
  "/gestion-dossiers/rapports.html",
  "/gestion-dossiers/stats.html",
  "/gestion-dossiers/css/style.css",
  "/gestion-dossiers/js/app.js",
  "/gestion-dossiers/js/firebase.js",
  "/gestion-dossiers/js/rapports.js",
  "/gestion-dossiers/js/stats.js",
  "/gestion-dossiers/manifest.json",
  "/gestion-dossiers/icons/icon-192x192.png",
  "/gestion-dossiers/icons/icon-512x512.png",
];

// INSTALL — mise en cache des assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Mise en cache des fichiers...");
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE — suppression des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("[SW] Suppression ancien cache :", key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// FETCH — stratégie Network First (Firebase) / Cache First (assets statiques)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Firebase & CDN → toujours réseau (pas de cache)
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("firebase") ||
    url.hostname.includes("gstatic.com") ||
    url.hostname.includes("cdn.jsdelivr.net")
  ) {
    return; // laisser passer normalement
  }

  // Assets locaux → Cache First avec fallback réseau
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Mettre en cache la nouvelle réponse
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
