const CACHE_NAME = "learning-arcade-v3";
const FONT_CACHE_NAME = "learning-arcade-fonts-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/ark_soroban.png",
];

async function warmAppAssetsFromIndex(cache) {
  const indexResponse = await cache.match("/index.html");
  if (!indexResponse) return;

  const html = await indexResponse.text();
  const assetPaths = new Set();

  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
    const assetPath = match[1];
    if (assetPath) assetPaths.add(assetPath);
  }

  if (assetPaths.size === 0) return;
  await cache.addAll([...assetPaths]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        await cache.addAll(APP_SHELL);
        await warmAppAssetsFromIndex(cache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME && key !== FONT_CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => caches.open(CACHE_NAME).then((cache) => warmAppAssetsFromIndex(cache)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  const isGoogleFontsCss = url.origin === "https://fonts.googleapis.com";
  const isGoogleFontsAsset = url.origin === "https://fonts.gstatic.com";

  if (isGoogleFontsCss || isGoogleFontsAsset) {
    event.respondWith(
      caches.open(FONT_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;

        const response = await fetch(event.request);
        if (response && response.ok) {
          cache.put(event.request, response.clone());
        }
        return response;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", responseClone));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match("/index.html")) || Response.error();
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});
