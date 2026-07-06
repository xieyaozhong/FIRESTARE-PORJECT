const CACHE = "spark-pachinko-v6-4";
const ASSETS = [
  "./", "./index.html", "./styles.css", "./state.js", "./features.js",
  "./controls.js", "./render-board.js", "./render-feature.js", "./v6-upgrade.js",
  "./v6-containment-fix.js", "./v6-entry-routing-fix.js", "./v6-layout-overhaul.js", "./main.js",
  "./manifest.webmanifest", "./icon.svg"
];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match("./index.html"))));
});
