const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, "extension");
const defaultOutputDir = path.resolve(rootDir, "..", "sksir-new-extension");
const outputArg = process.argv.slice(2).find((arg) => arg.startsWith("--out="));
const outputDir = path.resolve(outputArg ? outputArg.slice("--out=".length) : defaultOutputDir);
const appVersion = JSON.parse(fs.readFileSync(path.join(rootDir, "data", "app-version.json"), "utf8")).version;
const ossHost = "https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/";

const runtimeJsFiles = [
  "jquery-3.6.0.min.js",
  "main.js",
  "storage.js",
  "quick-launch-data.js",
  "search-engines.js",
  "set.js",
  "quick-launch.js",
  "search-ui.js",
  "bootstrap.js",
  "nav-render.js",
  "bookmarks.js",
  "settings.js",
  "wallpaper.js",
  "status-dot.js"
];

function assertOutsideProject(target) {
  const relative = path.relative(rootDir, target);
  if (!relative || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    throw new Error(`Extension output must be outside the project directory: ${target}`);
  }
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function writeJson(filePath, value) {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function copyFile(relativeSource, relativeTarget = relativeSource) {
  const source = path.join(rootDir, relativeSource);
  const target = path.join(outputDir, relativeTarget);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDirectory(relativeSource, relativeTarget = relativeSource) {
  const sourceRoot = path.join(rootDir, relativeSource);
  const targetRoot = path.join(outputDir, relativeTarget);

  function copyTree(source, target) {
    fs.mkdirSync(target, { recursive: true });
    fs.readdirSync(source, { withFileTypes: true }).forEach((entry) => {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);
      if (entry.isDirectory()) {
        copyTree(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  }

  copyTree(sourceRoot, targetRoot);
}

function getLocalAssetVersion() {
  const assetRoot = path.join(rootDir, "assets", "oss");
  const versions = fs.readdirSync(assetRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  if (!versions.length) throw new Error("No local OSS asset version found under assets/oss.");
  return versions[versions.length - 1];
}

function replaceAll(value, search, replacement) {
  return value.split(search).join(replacement);
}

function localizeBundledAssetReferences(content, localAssetVersion) {
  const pattern = new RegExp(
    `${ossHost.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}[^/]+/((?:favicon/64|icon|wallpaper)/[^\\"']+)`,
    "g"
  );
  return content.replace(pattern, `./assets/oss/${localAssetVersion}/$1`);
}

function extractInlineScripts(html) {
  let inlineIndex = 0;
  return html.replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi, (full, attributes, body) => {
    if (/\bsrc\s*=/.test(attributes) || !body.trim()) return full;
    inlineIndex += 1;
    const filename = `extension-inline-${inlineIndex}.js`;
    writeText(path.join(outputDir, "js", filename), body.trim() + "\n");
    return `<script${attributes} src="./js/${filename}"></script>`;
  });
}

function transformInlineHandlers(html) {
  return html
    .replace(/onclick="event\.stopPropagation\(\); openBox\(\)"/g, 'data-extension-action="open-settings"')
    .replace(/onclick="closeSet\(\)"/g, 'data-extension-action="close-settings"')
    .replace(/oninput="if\(value>20\)value=20;if\(value<0\)value=0"/g, 'data-extension-range-clamp="0,20"');
}

function transformAssetReferences(html) {
  const localAssetDirectory = "assets/oss/" + getLocalAssetVersion();
  let result = html;

  result = result.replace(/<link rel="preconnect"[^>]*>\s*/g, "");
  result = result.replace(/https:\/\/yuanone-blog-picture\.oss-cn-beijing\.aliyuncs\.com\/sksir\/[^/]+\/icon\/apple-touch-icon\.png/g, "./apple-touch-icon.png");
  result = result.replace(/https:\/\/yuanone-blog-picture\.oss-cn-beijing\.aliyuncs\.com\/sksir\/[^/]+\/css\/style\.css(?:\?[^"']*)?/g, "./css/style.css");

  runtimeJsFiles.forEach((filename) => {
    const pattern = new RegExp(`${ossHost.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^/]+/js/${filename}(?:\\?[^\"']*)?`, "g");
    result = result.replace(pattern, `./js/${filename}`);
  });

  ["iconfont.woff2", "MiSans-UI.woff2"].forEach((filename) => {
    const pattern = new RegExp(`${ossHost.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^/]+/font/${filename}(?:\\?[^\"']*)?`, "g");
    result = result.replace(pattern, `./font/${filename}`);
  });

  result = result.replace(/data-version="[^"]*"/, `data-version="${appVersion}"`);
  result = result.replace(/(<span id="app-version"[^>]*>v)[^<]*/, `$1${appVersion}`);
  result = result.replace(
    /<!-- 引入样式 -->/,
    '<script src="./js/extension-config.js"></script>\n    <script src="./js/icon-cache.js"></script>\n    <script src="./js/extension-events.js"></script>\n    <!-- 引入样式 -->'
  );
  result = result.replace(
    /(<style id="boot-critical-styles">[\s\S]*?)(<\/style>)/,
    '$1\n        /* 本地扩展不能被任何单个脚本或资源永久阻塞。 */\n        html.is-booting::before,\n        html.is-booting::after {\n            animation: none !important;\n            opacity: 0 !important;\n            visibility: hidden !important;\n            pointer-events: none !important;\n        }\n    $2'
  );
  result = result.replace(
    /(<style id="boot-critical-styles">[\s\S]*?)(<\/style>)/,
    '$1\n        /* 扩展启动时保留很短的进入过渡，不影响点击和首屏资源。 */\n        html[data-sksir-extension] #section {\n            opacity: 1;\n            transform: translate3d(0, 0, 0);\n            transition: opacity 320ms cubic-bezier(0.16, 1, 0.3, 1), transform 360ms cubic-bezier(0.16, 1, 0.3, 1);\n        }\n        html[data-sksir-extension].sksir-extension-starting #section {\n            opacity: 0;\n            transform: translate3d(0, 6px, 0);\n        }\n        html[data-sksir-extension].sksir-extension-starting .bg-all {\n            transform: scale(1.008);\n        }\n        @media (prefers-reduced-motion: reduce) {\n            html[data-sksir-extension] #section {\n                transition: none;\n            }\n        }\n    $2'
  );
  result = result.replace(
    /(<style id="boot-critical-styles">[\s\S]*?)(<\/style>)/,
    '$1\n        /* 扩展启动时使用约 200ms 的轻微模糊锐化，不位移、不缩放。 */\n        html[data-sksir-extension] #section {\n            filter: blur(0);\n            transition: filter 200ms ease-out;\n        }\n        html[data-sksir-extension] #bg {\n            filter: blur(0);\n            transition: filter 200ms ease-out;\n        }\n        html[data-sksir-extension].sksir-extension-starting #section {\n            filter: blur(8px);\n        }\n        html[data-sksir-extension].sksir-extension-starting #bg {\n            filter: blur(3px);\n        }\n        @media (prefers-reduced-motion: reduce) {\n            html[data-sksir-extension] #section,\n            html[data-sksir-extension] #bg {\n                transition: none;\n            }\n        }\n    $2'
  );
  result = result.replace(
    /(<style id="boot-critical-styles">[\s\S]*?)(<\/style>)/,
    '$1\n        html[data-sksir-extension].sksir-extension-starting #section {\n            opacity: 1;\n            transform: none;\n        }\n        html[data-sksir-extension].sksir-extension-starting .bg-all {\n            transform: none;\n        }\n    $2'
  );
  result = result.replace(
    /(<style id="boot-critical-styles">[\s\S]*?)(<\/style>)/,
    '$1\n        /* 扩展启动：背景从中心扩散，快捷入口从搜索区域向外展开。 */\n        html[data-sksir-extension] #bg {\n            clip-path: circle(150% at 50% 50%);\n            filter: none;\n            transition: clip-path 520ms cubic-bezier(0.22, 0.72, 0.2, 1);\n        }\n        html[data-sksir-extension] #quick-launch {\n            opacity: 1;\n            transform: translateY(0) scaleY(1);\n            transform-origin: center top;\n            transition: opacity 360ms ease-out, transform 420ms cubic-bezier(0.22, 0.72, 0.2, 1);\n        }\n        html[data-sksir-extension].sksir-extension-starting #bg {\n            clip-path: circle(0% at 50% 50%);\n        }\n        html[data-sksir-extension].sksir-extension-starting #section {\n            filter: none;\n            opacity: 1;\n            transform: none;\n        }\n        html[data-sksir-extension].sksir-extension-starting #quick-launch:not([hidden]) {\n            opacity: 0;\n            transform: translateY(-16px) scaleY(0.62);\n        }\n        @media (prefers-reduced-motion: reduce) {\n            html[data-sksir-extension] #bg,\n            html[data-sksir-extension] #quick-launch {\n                transition: none;\n            }\n        }\n    $2'
  );
  result = result.replace(
    /(<style id="boot-critical-styles">[\s\S]*?)(<\/style>)/,
    '$1\n        html[data-sksir-extension].sksir-extension-starting #bg {\n            filter: none;\n        }\n    $2'
  );
  result = result.replace(
    /(<style id="boot-critical-styles">[\s\S]*?)(<\/style>)/,
    '$1\n        /* 参考青柠起始页的柔和进入感：背景径向显现，快捷入口从搜索区域展开。 */\n        @keyframes sksirExtensionBackgroundReveal {\n            from {\n                opacity: 0.72;\n                transform: scale(1.025);\n                -webkit-mask-size: 0% 0%;\n                mask-size: 0% 0%;\n            }\n            68% {\n                opacity: 0.96;\n            }\n            to {\n                opacity: 1;\n                transform: scale(1);\n                -webkit-mask-size: 220% 220%;\n                mask-size: 220% 220%;\n            }\n        }\n        @keyframes sksirExtensionQuickLaunchReveal {\n            from {\n                opacity: 0;\n                transform: translateY(-12px) scaleY(0.84);\n            }\n            to {\n                opacity: 1;\n                transform: translateY(0) scaleY(1);\n            }\n        }\n        html[data-sksir-extension] #bg {\n            clip-path: none;\n            filter: none;\n            -webkit-mask-image: none;\n            mask-image: none;\n        }\n        html[data-sksir-extension].sksir-extension-starting #bg {\n            clip-path: none;\n            -webkit-mask-image: radial-gradient(circle at 50% 50%, #000 0%, rgba(0, 0, 0, 0.98) 48%, transparent 82%);\n            mask-image: radial-gradient(circle at 50% 50%, #000 0%, rgba(0, 0, 0, 0.98) 48%, transparent 82%);\n            -webkit-mask-position: center;\n            mask-position: center;\n            -webkit-mask-repeat: no-repeat;\n            mask-repeat: no-repeat;\n            animation: sksirExtensionBackgroundReveal 620ms cubic-bezier(0.22, 0.72, 0.2, 1) both;\n        }\n        html[data-sksir-extension].sksir-extension-starting #quick-launch:not([hidden]) {\n            animation: sksirExtensionQuickLaunchReveal 480ms cubic-bezier(0.22, 0.72, 0.2, 1) both;\n            transform-origin: center top;\n        }\n        @media (prefers-reduced-motion: reduce) {\n            html[data-sksir-extension].sksir-extension-starting #bg,\n            html[data-sksir-extension].sksir-extension-starting #quick-launch:not([hidden]) {\n                animation: none;\n                -webkit-mask-image: none;\n                mask-image: none;\n            }\n        }\n    $2'
  );
  result = result
    .replace(/^\s*filter: blur\(8px\);\s*$/gm, "")
    .replace(/^\s*filter: blur\(3px\);\s*$/gm, "")
    .replace(/^\s*clip-path: circle\((?:0|150)% at 50% 50%\);\s*$/gm, "");
  return result.replace(/assets\/oss\/[^/]+/g, localAssetDirectory);
}

function buildHtml() {
  let html = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  html = transformAssetReferences(html);
  html = transformInlineHandlers(html);
  html = html.replace(
    /document\.documentElement\.classList\.add\(\"is-booting\"\);/g,
    ""
  );
  html = extractInlineScripts(html);
  const localAssetVersion = getLocalAssetVersion();
  const localWallpaper = `./assets/oss/${localAssetVersion}/wallpaper/responsive/background1-desktop.webp`;
  html = html.replace(
    /<img id="bg"([^>]*)>/,
    `<img id="bg"$1 src="${localWallpaper}" class="is-loaded" data-wallpaper-source="./assets/oss/${localAssetVersion}/icon/background1.webp">`
  );
  html = html.replace(
    /<\/head>/,
    `    <link rel="preload" href="${localWallpaper}" as="image" fetchpriority="high">\n</head>`
  );
  writeText(path.join(outputDir, "newtab.html"), html);
}

function createManifest() {
  const manifest = JSON.parse(fs.readFileSync(path.join(sourceDir, "manifest.json"), "utf8"));
  manifest.version_name = appVersion;
  writeJson(path.join(outputDir, "manifest.json"), manifest);
}

function build() {
  assertOutsideProject(outputDir);
  const localAssetVersion = getLocalAssetVersion();
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  createManifest();
  copyFile("extension/background.js", "background.js");
  copyFile("apple-touch-icon.png");
  copyFile("favicon.ico");
  copyDirectory("css");
  copyDirectory("font");
  copyDirectory("img");
  copyDirectory("assets/oss/" + localAssetVersion);
  ["changelog.js", "app-version.json"].forEach((filename) => copyFile(`data/${filename}`));
  const localSites = localizeBundledAssetReferences(
    fs.readFileSync(path.join(rootDir, "data", "sites.js"), "utf8"),
    localAssetVersion
  );
  writeText(path.join(outputDir, "data", "sites.js"), localSites);
  runtimeJsFiles.forEach((filename) => {
    const source = fs.readFileSync(path.join(rootDir, "js", filename), "utf8");
    writeText(
      path.join(outputDir, "js", filename),
      localizeBundledAssetReferences(source, localAssetVersion)
    );
  });
  ["extension-config.js", "icon-cache.js", "extension-events.js"].forEach((filename) => {
    const source = fs.readFileSync(path.join(sourceDir, filename), "utf8")
      .replace(/__LOCAL_ASSET_VERSION__/g, localAssetVersion);
    writeText(path.join(outputDir, "js", filename), source);
  });
  buildHtml();

  console.log(`Built local Sksir New Tab ${appVersion}`);
  console.log(`Output: ${outputDir}`);
  console.log(`Bundled CSS, fonts, JavaScript, UI assets and wallpapers from ${localAssetVersion}.`);
  console.log("Bundled site icons and wallpapers are local; the extension does not request remote favicons.");
  console.log("User settings, bookmarks and import/export data remain in the extension's local storage.");
}

build();
