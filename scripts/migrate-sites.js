const fs = require("fs");
const path = require("path");
const {
  loadLegacySites,
  loadNormalizedSites,
  migrateLegacyData,
  serializeJson,
  serializeRuntimeJs,
  toRuntimeData,
  writeFileSafely
} = require("./sites-lib");

const rootDir = path.resolve(__dirname, "..");
const legacyPath = path.join(rootDir, "data", "sites.js");
const normalizedPath = path.join(rootDir, "data", "sites.json");
const args = new Set(process.argv.slice(2));
const write = args.has("--write");
const force = args.has("--force");
const generateRuntime = args.has("--generate-runtime");

if (args.has("-h") || args.has("--help")) {
  console.log([
    "Usage:",
    "  node scripts/migrate-sites.js",
    "  node scripts/migrate-sites.js --write [--force]",
    "  node scripts/migrate-sites.js --generate-runtime",
    "",
    "Without flags, previews migration statistics without writing files.",
    "--write creates data/sites.json from the legacy data.",
    "--generate-runtime regenerates data/sites.js from data/sites.json."
  ].join("\n"));
  process.exit(0);
}

function countRuntime(runtime) {
  return {
    groups: runtime.tabs.length,
    sites: runtime.tabs.reduce((total, tab) => total + tab.items.length, 0)
  };
}

function printDuplicateUrls(normalized) {
  const urls = new Map();
  normalized.sites.forEach((site) => {
    let normalizedUrl = site.url;
    try {
      const url = new URL(site.url);
      url.hash = "";
      normalizedUrl = url.toString();
    } catch (error) {}
    if (!urls.has(normalizedUrl)) urls.set(normalizedUrl, []);
    urls.get(normalizedUrl).push(`${site.group}/${site.name}`);
  });
  const duplicates = [...urls.entries()].filter((entry) => entry[1].length > 1);
  console.log(`Duplicate URLs across groups: ${duplicates.length}`);
  duplicates.forEach(([url, locations]) => {
    console.log(`- ${url}: ${locations.join(", ")}`);
  });
}

if (generateRuntime) {
  const normalized = loadNormalizedSites(normalizedPath);
  const content = serializeRuntimeJs(normalized);
  const current = fs.existsSync(legacyPath) ? fs.readFileSync(legacyPath, "utf8") : "";
  if (current === content) {
    console.log("data/sites.js is already up to date.");
  } else {
    writeFileSafely(legacyPath, content, true);
    console.log("Generated data/sites.js from data/sites.json.");
  }
  process.exit(0);
}

const legacy = loadLegacySites(legacyPath);
const normalized = migrateLegacyData(legacy);
const before = countRuntime(legacy);
const after = countRuntime(toRuntimeData(normalized));

console.log(`Groups: ${before.groups} -> ${after.groups}`);
console.log(`Sites: ${before.sites} -> ${after.sites}`);
console.log(`Unique IDs: ${new Set(normalized.sites.map((site) => site.id)).size}`);
printDuplicateUrls(normalized);

if (write) {
  writeFileSafely(normalizedPath, serializeJson(normalized), force);
  console.log(`Wrote ${path.relative(rootDir, normalizedPath)}.`);
} else {
  console.log("Preview only; no files changed. Pass --write to create data/sites.json.");
}
