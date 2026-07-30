const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const nextVersion = process.argv[2];

if (!nextVersion || !/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(nextVersion)) {
  console.error("Usage: node scripts/update-version.js YYYY.MM.DD.N");
  process.exit(1);
}

const versionPath = path.join(rootDir, "data", "app-version.json");
const indexPath = path.join(rootDir, "index.html");
const stylePath = path.join(rootDir, "css", "style.css");

const versionInfo = JSON.parse(fs.readFileSync(versionPath, "utf8"));
const previousVersion = String(versionInfo.version || "").trim();
versionInfo.version = nextVersion;
fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2) + "\n", "utf8");

const indexSource = fs.readFileSync(indexPath, "utf8");
const appVersionPattern = /(<span id="app-version" class="app-version" data-version=")[^"]+(">v)[^<]+(<\/span>)/;
let nextIndexSource = indexSource.replace(
  appVersionPattern,
  `$1${nextVersion}$2${nextVersion}$3`
);

if (!appVersionPattern.test(indexSource)) {
  console.error("Could not find app-version span in index.html");
  process.exit(1);
}

const assetVersionPattern = /(\?v=)\d{4}\.\d{2}\.\d{2}\.\d+/g;
if (!assetVersionPattern.test(nextIndexSource)) {
  console.error("Could not find versioned asset URLs in index.html");
  process.exit(1);
}
nextIndexSource = nextIndexSource.replace(assetVersionPattern, `$1${nextVersion}`);

const ossVersionPattern = /\/sksir\/\d{4}\.\d{2}\.\d{2}\.\d+\//g;
if (!ossVersionPattern.test(nextIndexSource)) {
  console.error("Could not find the versioned OSS asset path in index.html");
  process.exit(1);
}
nextIndexSource = nextIndexSource.replace(ossVersionPattern, `/sksir/${nextVersion}/`);

const styleSource = fs.readFileSync(stylePath, "utf8");
if (!assetVersionPattern.test(styleSource)) {
  console.error("Could not find versioned font URLs in css/style.css");
  process.exit(1);
}
const nextStyleSource = styleSource.replace(assetVersionPattern, `$1${nextVersion}`);

fs.writeFileSync(indexPath, nextIndexSource, "utf8");
fs.writeFileSync(stylePath, nextStyleSource, "utf8");

[
  "js/main.js",
  "js/set.js",
  "js/quick-launch-data.js",
  "data/sites.js",
  "data/sites.json"
].forEach((relativePath) => {
  const filePath = path.join(rootDir, relativePath);
  const source = fs.readFileSync(filePath, "utf8");
  const updated = source.replace(ossVersionPattern, `/sksir/${nextVersion}/`);
  if (previousVersion !== nextVersion && source.includes(`/sksir/${previousVersion}/`) && updated === source) {
    console.error(`Could not update the OSS asset path in ${relativePath}`);
    process.exit(1);
  }
  fs.writeFileSync(filePath, updated, "utf8");
});
console.log(`Updated app version to ${nextVersion}`);
