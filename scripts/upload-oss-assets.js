const fs = require("fs");
const path = require("path");
const OSS = require("ali-oss");

const rootDir = path.resolve(__dirname, "..");
const version = JSON.parse(
  fs.readFileSync(path.join(rootDir, "data", "app-version.json"), "utf8")
).version;
const prefix = `sksir/${version}/`;
const publicBase = `https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/${prefix}`;
const cacheControl = "public, max-age=31536000, immutable";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function loadPicGoConfig() {
  const appData = process.env.APPDATA;
  if (!appData) throw new Error("APPDATA is unavailable");
  const configPath = path.join(appData, "picgo", "data.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const aliyun = config.picBed && config.picBed.aliyun;
  if (!aliyun || !aliyun.bucket || !aliyun.area || !aliyun.accessKeyId || !aliyun.accessKeySecret) {
    throw new Error("PicGo does not contain a complete active Aliyun OSS configuration");
  }
  return aliyun;
}

function latestBundledAssetDir() {
  const baseDir = path.join(rootDir, "assets", "oss");
  const candidates = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => right.localeCompare(left, undefined, { numeric: true }));
  if (!candidates.length) throw new Error("No bundled asset directory exists under assets/oss");
  return path.join(baseDir, candidates[0]);
}

function collectFiles() {
  const files = [];
  const add = (source, target) => {
    if (fs.existsSync(source)) files.push({ source, target });
  };

  ["css", "js"].forEach((directory) => {
    const absoluteDir = path.join(rootDir, directory);
    fs.readdirSync(absoluteDir).forEach((name) => {
      const extension = path.extname(name).toLowerCase();
      if (extension === ".css" || extension === ".js") {
        add(path.join(absoluteDir, name), `${directory}/${name}`);
      }
    });
  });

  fs.readdirSync(path.join(rootDir, "font")).forEach((name) => {
    if (mimeTypes[path.extname(name).toLowerCase()]) {
      add(path.join(rootDir, "font", name), `font/${name}`);
    }
  });

  ["sites.js", "sites.json", "changelog.js"].forEach((name) => {
    add(path.join(rootDir, "data", name), `data/${name}`);
  });
  add(path.join(rootDir, "img", "icon", "fangdiu.png"), "img/icon/fangdiu.png");

  const assetDir = latestBundledAssetDir();
  const walk = (directory) => {
    fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
        return;
      }
      add(absolutePath, path.relative(assetDir, absolutePath).replace(/\\/g, "/"));
    });
  };
  walk(assetDir);
  return files;
}

async function runPool(items, worker, concurrency) {
  const queue = items.slice();
  const runners = Array.from({ length: concurrency }, async () => {
    while (queue.length) await worker(queue.shift());
  });
  await Promise.all(runners);
}

async function verifyPublicAssets() {
  const checks = [
    ["css/style.css", "text/css"],
    ["js/main.js", "application/javascript"],
    ["data/sites.js", "application/javascript"],
    ["font/MiSans-UI.woff2", "font/woff2"]
  ];

  for (const [relativePath, expectedType] of checks) {
    const response = await fetch(publicBase + relativePath, {
      headers: { Origin: "https://sksir.top" },
      cache: "no-store"
    });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.toLowerCase().startsWith(expectedType)) {
      throw new Error(`OSS verification failed for ${relativePath}: ${response.status} ${contentType}`);
    }
    if (
      relativePath.endsWith(".woff2") &&
      response.headers.get("access-control-allow-origin") !== "*"
    ) {
      throw new Error("OSS font CORS verification failed");
    }
  }
}

async function main() {
  const config = loadPicGoConfig();
  const client = new OSS({
    region: config.area,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    bucket: config.bucket,
    secure: true
  });
  const files = collectFiles();
  let uploaded = 0;

  await runPool(files, async ({ source, target }) => {
    const contentType = mimeTypes[path.extname(source).toLowerCase()] || "application/octet-stream";
    await client.put(prefix + target, source, {
      headers: {
        "Cache-Control": cacheControl,
        "Content-Type": contentType
      }
    });
    uploaded += 1;
  }, 4);

  await verifyPublicAssets();
  console.log(`Uploaded and verified ${uploaded} OSS assets for ${version}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
