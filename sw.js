/* Service Worker fuer den mentalen Adventskalender.
   Strategie: zuerst Netz, bei Ausfall Cache. So bekommen alle Leute
   Aktualisierungen sofort und der Kalender funktioniert trotzdem offline. */
const CACHE = "uphillbattle-advent-2026-v1";
const START = [
  "./",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(START))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const kopie = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, kopie)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./")))
  );
});
