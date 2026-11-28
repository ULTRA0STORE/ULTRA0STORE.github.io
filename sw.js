// ULTRA0 STORE - service worker: صفحة جديدة دايماً + إشعارات النظام
const V = "u0-v10";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || !r.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(r, { cache: "no-store" }).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match("./index.html")))
  );
});
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: "ULTRA0 STORE", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "ULTRA0 STORE", {
    body: d.body || "", icon: "./icon-192.png", badge: "./icon-192.png",
    tag: d.tag || undefined, data: { url: d.url || "./" }, dir: "rtl", lang: "ar"
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) { if ("focus" in c) { c.navigate && c.navigate(url).catch(()=>{}); return c.focus(); } }
    return clients.openWindow(url);
  }));
});
