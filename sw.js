// ULTRA0 STORE - service worker: يجيب دائماً النسخة الجديدة من النت أول
const V = "u0-v3";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || !r.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(r, { cache: "no-store" }).then(res => {
      const copy = res.clone();
      caches.open(V).then(c => c.put(r, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match("index.html")))
  );
});
