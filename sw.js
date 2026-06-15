const CACHE_VERSION = "nav-cache-2026.06.15.9";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./css/font.css",
  "./css/mobile.css",
  "./css/animation.css",
  "./css/status-dot.css",
  "./js/jquery-3.6.0.min.js",
  "./js/js.cookie.js",
  "./js/toast-loader.js",
  "./js/main.js",
  "./js/set.js",
  "./js/status-dot.js",
  "./js/nav-render.js",
  "./data/sites.js",
  "./font/iconfont.woff2",
  "./font/iconfont.woff",
  "./font/iconfont.ttf",
  "./img/icon/fangdiu.png",
  "./apple-touch-icon.png",
  "./favicon.ico"
];

const CACHE_FIRST_HOSTS = new Set([
  "yuanone-blog-picture.oss-cn-beijing.aliyuncs.com"
]);

const CACHE_FIRST_EXTENSIONS = /\.(?:css|js|woff2?|ttf|png|jpe?g|gif|webp|avif|svg|ico)(?:[?#].*)?$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS.map((url) => {
          return new Request(url, { cache: "reload" });
        }));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function shouldUseCacheFirst(requestUrl) {
  if (requestUrl.pathname.startsWith("/api/")) return false;
  if (requestUrl.hostname === "api.dujin.org") return false;
  if (requestUrl.hostname === "suggestion.baidu.com") return false;

  if (requestUrl.origin === self.location.origin) {
    return CACHE_FIRST_EXTENSIONS.test(requestUrl.pathname) || requestUrl.pathname === "/";
  }

  return CACHE_FIRST_HOSTS.has(requestUrl.hostname) && CACHE_FIRST_EXTENSIONS.test(requestUrl.pathname);
}

function cacheFirst(request) {
  return caches.match(request).then((cachedResponse) => {
    if (cachedResponse) return cachedResponse;

    var fetchRequest = request;
    if (new URL(request.url).origin === self.location.origin) {
      fetchRequest = new Request(request, { cache: "reload" });
    }

    return fetch(fetchRequest).then((networkResponse) => {
      if (!networkResponse || (!networkResponse.ok && networkResponse.type !== "opaque")) {
        return networkResponse;
      }

      var responseToCache = networkResponse.clone();
      caches.open(CACHE_VERSION).then((cache) => {
        cache.put(request, responseToCache);
      });
      return networkResponse;
    });
  });
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  var requestUrl = new URL(event.request.url);
  if (!shouldUseCacheFirst(requestUrl)) return;

  event.respondWith(cacheFirst(event.request));
});
