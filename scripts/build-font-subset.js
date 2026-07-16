const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "font", "MiSans-UI.woff2");
const charactersPath = path.join(rootDir, "font", "MiSans-UI.characters.txt");
const sourceFiles = [
  "index.html",
  "data/sites.js",
  "js/main.js",
  "js/set.js",
  "js/nav-render.js",
  "js/status-dot.js"
];

function shouldIncludeCharacter(character) {
  const codePoint = character.codePointAt(0);
  return (
    (codePoint >= 0x20 && codePoint <= 0x7e) ||
    (codePoint >= 0xa0 && codePoint <= 0x24f) ||
    (codePoint >= 0x2000 && codePoint <= 0x206f) ||
    (codePoint >= 0x3000 && codePoint <= 0x303f) ||
    (codePoint >= 0x3400 && codePoint <= 0x9fff) ||
    (codePoint >= 0xff00 && codePoint <= 0xffef)
  );
}

function collectCharacters() {
  const characters = new Set();

  sourceFiles.forEach((relativePath) => {
    const source = fs.readFileSync(path.join(rootDir, relativePath), "utf8");
    Array.from(source).forEach((character) => {
      if (shouldIncludeCharacter(character)) {
        characters.add(character);
      }
    });
  });

  return Array.from(characters)
    .sort((left, right) => left.codePointAt(0) - right.codePointAt(0))
    .join("");
}

function validateSubsetFiles(expectedCharacters) {
  if (!fs.existsSync(charactersPath)) {
    console.error("Missing font/MiSans-UI.characters.txt");
    return false;
  }

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 1024) {
    console.error("Missing or invalid font/MiSans-UI.woff2");
    return false;
  }

  const savedCharacters = fs.readFileSync(charactersPath, "utf8").replace(/\r?\n$/, "");
  if (savedCharacters !== expectedCharacters) {
    console.error("MiSans UI character list is out of date.");
    console.error("Regenerate it after changing visible text or navigation data.");
    return false;
  }

  console.log(
    `Checked MiSans UI subset: ${Array.from(expectedCharacters).length} characters, ` +
    `${fs.statSync(outputPath).size} bytes`
  );
  return true;
}

const characters = collectCharacters();

if (process.argv.includes("--check")) {
  process.exit(validateSubsetFiles(characters) ? 0 : 1);
}

const sourceFont = process.argv[2] || process.env.MISANS_SOURCE;
if (!sourceFont) {
  console.error("Usage: node scripts/build-font-subset.js path/to/MiSans-Regular.woff2");
  console.error("Install the generator first: python -m pip install fonttools brotli");
  process.exit(1);
}

const resolvedSourceFont = path.resolve(sourceFont);
if (!fs.existsSync(resolvedSourceFont)) {
  console.error(`Source font not found: ${resolvedSourceFont}`);
  process.exit(1);
}

fs.writeFileSync(charactersPath, characters + "\n", "utf8");

const pythonBin = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
const subsetResult = spawnSync(
  pythonBin,
  [
    "-m",
    "fontTools.subset",
    resolvedSourceFont,
    `--text-file=${charactersPath}`,
    `--output-file=${outputPath}`,
    "--flavor=woff2",
    "--layout-features=*",
    "--notdef-glyph",
    "--notdef-outline",
    "--recommended-glyphs",
    "--name-IDs=*",
    "--name-legacy",
    "--name-languages=*"
  ],
  {
    cwd: rootDir,
    stdio: "inherit",
    windowsHide: true,
    env: {
      ...process.env,
      PYTHONUTF8: "1"
    }
  }
);

if (subsetResult.error || subsetResult.status !== 0) {
  console.error("Failed to generate MiSans UI subset.");
  console.error("Install the generator with: python -m pip install fonttools brotli");
  process.exit(subsetResult.status || 1);
}

if (!validateSubsetFiles(characters)) {
  process.exit(1);
}
