self.addEventListener("install", e => {
  e.waitUntil(caches.open("treino-v9").then(c => c.addAll(["./", "./index.html", "./manifest.json"])));
  self.skipWaiting();
});
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== "treino-v9").map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open("treino-v9").then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
