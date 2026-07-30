const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function position(source, marker) {
  const index = source.indexOf(marker);
  assert.notStrictEqual(index, -1, `Missing required marker: ${marker}`);
  return index;
}

const html = read("index.html");
const style = read("css/style.css");
const main = read("js/main.js");
const serviceWorker = read("sw.js");
const statusApi = read(path.join("api", "check.js"));
const vercelConfig = JSON.parse(read("vercel.json"));

const versionMatch = html.match(/id="app-version"[^>]*data-version="([^"]+)"/);
assert(versionMatch, "The app version marker is missing.");
const assetVersion = versionMatch[1];
[
  "iconfont.woff2",
  "MiSans-UI.woff2"
].forEach((font) => {
  position(html, `./font/${font}?v=${assetVersion}`);
  position(style, `../font/${font}?v=${assetVersion}`);
});
assert(
  /font-family:\s*"MiSans UI";[\s\S]*?font-display:\s*swap;/.test(style),
  "MiSans UI must keep font-display: swap."
);

const cacheHeaders = new Map(
  vercelConfig.headers.map((rule) => [
    rule.source,
    new Map(rule.headers.map((header) => [header.key.toLowerCase(), header.value]))
  ])
);
["/css/(.*)", "/js/(.*)", "/font/(.*)", "/assets/(.*)", "/data/(.*).js"].forEach((source) => {
  assert.strictEqual(
    cacheHeaders.get(source)?.get("cache-control"),
    "public, max-age=31536000, immutable",
    `Long-term immutable caching is missing for ${source}.`
  );
});
[
  "index.html",
  "data/sites.json",
  "data/sites.js",
  "js/quick-launch-data.js",
  "js/set.js"
].forEach((relativePath) => {
  assert(
    !read(relativePath).includes("yuanone-blog-picture.oss-cn-beijing.aliyuncs.com"),
    `${relativePath} must not use the OSS default domain for browser images.`
  );
});
["/", "/index.html", "/sw.js"].forEach((source) => {
  assert(
    cacheHeaders.get(source)?.get("cache-control")?.includes("no-cache"),
    `${source} must remain revalidated.`
  );
});
["/data/app-version.json", "/api/check"].forEach((source) => {
  assert(
    cacheHeaders.get(source)?.get("cache-control")?.includes("no-store"),
    `${source} must remain uncached.`
  );
});

const stylesheet = position(
  html,
  `<link id="app-styles" rel="stylesheet" type="text/css" href="./css/style.css?v=${assetVersion}">`
);
const earlyBoot = position(html, "window.__sksirBootFallbackTimer");
assert(stylesheet > earlyBoot, "The real stylesheet must remain after the early boot script.");

const requiredScripts = [
  "./js/jquery-3.6.0.min.js",
  "./js/main.js",
  "./js/storage.js",
  "./js/quick-launch-data.js",
  "./js/search-engines.js",
  "./js/set.js",
  "./js/quick-launch.js",
  "./js/search-ui.js",
  "./js/bootstrap.js"
];
let previousPosition = stylesheet;
requiredScripts.forEach((src) => {
  const versionSuffix = src === "./js/jquery-3.6.0.min.js" ? "" : `?v=${assetVersion}`;
  const marker = `<script defer src="${src}${versionSuffix}"></script>`;
  const currentPosition = position(html, marker);
  assert(currentPosition > previousPosition, `Invalid defer script order at ${src}`);
  previousPosition = currentPosition;
});

[
  "./data/sites.js",
  "./js/nav-render.js",
  "./js/bookmarks.js",
  "./js/status-dot.js",
  "./css/status-dot.css",
  "./js/settings.js",
  "./js/wallpaper.js"
].forEach((resource) => {
  assert(
    !html.includes(`src="${resource}"`) && !html.includes(`href="${resource}"`),
    `${resource} must not be loaded directly by index.html.`
  );
});

[
  'loadDeferredScript("nav-sites-data", "./data/sites.js")',
  'loadDeferredScript("nav-sites-renderer", "./js/nav-render.js")',
  'loadDeferredScript("nav-bookmarks-controller", "./js/bookmarks.js")',
  'loadDeferredScript("nav-status-checker", "./js/status-dot.js")',
  'loadDeferredStylesheet("status-dot-styles", "./css/status-dot.css")',
  'loadDeferredScript("settings-controller", "./js/settings.js")',
  'loadDeferredScript("wallpaper-settings-controller", "./js/wallpaper.js")'
].forEach((marker) => position(main, marker));

const appVersion = position(html, 'id="app-version"');
const separator = position(html, 'class="footer-separator"');
assert(separator > appVersion, "The footer separator must remain after #app-version.");

assert(serviceWorker.includes('key.indexOf("nav-cache-") === 0'), "Service Worker cache cleanup is missing.");
assert(serviceWorker.includes("self.registration.unregister()"), "Service Worker self-unregister is missing.");
assert(!/\bcaches\.(open|match)\b/.test(serviceWorker), "Service Worker must not restore offline caching.");
assert(!serviceWorker.includes("fetch"), "Service Worker must not install a fetch handler.");

[
  "getAllowedHosts",
  "isBlockedHostname",
  "isBlockedIp",
  "dns.lookup",
  "metadata.google.internal",
  "(a === 169 && b === 254)"
].forEach((marker) => position(statusApi, marker));

console.log("Runtime boundary checks passed.");
