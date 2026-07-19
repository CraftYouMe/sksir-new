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

const versionInfo = JSON.parse(fs.readFileSync(versionPath, "utf8"));
versionInfo.version = nextVersion;
fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2) + "\n", "utf8");

const indexSource = fs.readFileSync(indexPath, "utf8");
const appVersionPattern = /(<span id="app-version" class="app-version" data-version=")[^"]+(">v)[^<]+(<\/span>)/;
const nextIndexSource = indexSource.replace(
  appVersionPattern,
  `$1${nextVersion}$2${nextVersion}$3`
);

if (!appVersionPattern.test(indexSource)) {
  console.error("Could not find app-version span in index.html");
  process.exit(1);
}

fs.writeFileSync(indexPath, nextIndexSource, "utf8");
console.log(`Updated app version to ${nextVersion}`);
