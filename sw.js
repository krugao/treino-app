self.addEventListener("install", e => {
  e.waitUntil(caches.open("treino-v4").then(c => c.addAll(["./", "./index.html", "./manifest.json"])));
  self.skipWaiting();
});
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== "treino-v4").map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
