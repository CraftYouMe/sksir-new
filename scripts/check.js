const { spawnSync } = require("child_process");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const nodeBin = process.execPath;

function projectPath(...parts) {
  return path.join(rootDir, ...parts);
}

const checks = [
  {
    name: "Validate navigation data",
    args: [projectPath("scripts", "validate-sites.js")]
  },
  {
    name: "Syntax check main.js",
    args: ["--check", projectPath("js", "main.js")]
  },
  {
    name: "Syntax check set.js",
    args: ["--check", projectPath("js", "set.js")]
  },
  {
    name: "Syntax check nav-render.js",
    args: ["--check", projectPath("js", "nav-render.js")]
  },
  {
    name: "Syntax check status-dot.js",
    args: ["--check", projectPath("js", "status-dot.js")]
  },
  {
    name: "Syntax check service worker",
    args: ["--check", projectPath("sw.js")]
  },
  {
    name: "Syntax check status API",
    args: ["--check", projectPath("api", "check.js")]
  },
  {
    name: "Syntax check update-version.js",
    args: ["--check", projectPath("scripts", "update-version.js")]
  },
  {
    name: "Syntax check validate-sites.js",
    args: ["--check", projectPath("scripts", "validate-sites.js")]
  }
];

let failed = false;

checks.forEach((check, index) => {
  console.log(`\n[${index + 1}/${checks.length}] ${check.name}`);
  const result = spawnSync(nodeBin, check.args, {
    cwd: rootDir,
    stdio: "inherit",
    windowsHide: true
  });

  if (result.status !== 0) {
    failed = true;
    console.error(`Failed: ${check.name}`);
  }
});

if (failed) {
  console.error("\nProject checks failed.");
  process.exit(1);
}

console.log("\nProject checks passed.");
