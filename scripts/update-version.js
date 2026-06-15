const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const nextVersion = process.argv[2];

if (!nextVersion || !/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(nextVersion)) {
  console.error("Usage: node scripts/update-version.js YYYY.MM.DD.N");
  process.exit(1);
}

const versionPath = path.join(rootDir, "data", "app-version.json");
const swPath = path.join(rootDir, "sw.js");

const versionInfo = JSON.parse(fs.readFileSync(versionPath, "utf8"));
versionInfo.version = nextVersion;
fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2) + "\n", "utf8");

const swSource = fs.readFileSync(swPath, "utf8");
const cacheVersionPattern = /^const CACHE_VERSION = "nav-cache-[^"]+";/m;

if (!cacheVersionPattern.test(swSource)) {
  console.error("Could not find CACHE_VERSION in sw.js");
  process.exit(1);
}

const nextSwSource = swSource.replace(
  cacheVersionPattern,
  `const CACHE_VERSION = "nav-cache-${nextVersion}";`
);

fs.writeFileSync(swPath, nextSwSource, "utf8");
console.log(`Updated app version and service worker cache to ${nextVersion}`);
