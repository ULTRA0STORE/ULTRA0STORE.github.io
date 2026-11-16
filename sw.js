const C = "u0-v3";
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => c.addAll(["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"])).catch(() => {}));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match("./index.html")))
  );
});

self.addEventListener("push", e => {
  let d = {};
  try { d = e.data.json(); } catch (_) { d = { title: "ULTRA0", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "ULTRA0", {
    body: d.body || "", icon: "./icon-192.png", badge: "./icon-192.png",
    dir: "rtl", lang: "ar", tag: d.tag || undefined, data: { url: d.url || "./" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const u = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cl => {
    for (const c of cl) if ("focus" in c) { c.navigate && c.navigate(u).catch(() => {}); return c.focus(); }
    return self.clients.openWindow(u);
  }));
});
