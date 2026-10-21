// apps/workbench/public/sw.js — hand-written service worker (~80 lines)
const VERSION = "pqw-1";
const SHELL_CACHE = `shell-${VERSION}`;
const PACK_CACHE = `pack-${VERSION}`;
const SHELL = ["/", "/index.html", "/main.js", "/style.css"];
const OFFLINE = "/offline.html";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== PACK_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET") return;
  // pack chunks: runtime cache, network-first
  if (url.pathname.includes("/packs/")) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(PACK_CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match(OFFLINE)))
    );
    return;
  }
  // shell: cache-first
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
      return res;
    }).catch(() => caches.match(OFFLINE)))
  );
});
