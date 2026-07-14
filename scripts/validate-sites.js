const fs = require("fs");
const path = require("path");
const vm = require("vm");

const rootDir = path.resolve(__dirname, "..");
const sitesPath = path.join(rootDir, "data", "sites.js");
const args = new Set(process.argv.slice(2));
const strict = args.has("--strict");
const ALL_CATEGORY = "\u5168\u90e8";

if (args.has("-h") || args.has("--help")) {
  console.log([
    "Usage: node scripts/validate-sites.js [--strict]",
    "",
    "Checks data/sites.js without changing files.",
    "--strict exits with code 1 when warnings are found."
  ].join("\n"));
  process.exit(0);
}

const errors = [];
const warnings = [];

function addIssue(list, location, message) {
  list.push({ location, message });
}

function addError(location, message) {
  addIssue(errors, location, message);
}

function addWarning(location, message) {
  addIssue(warnings, location, message);
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isBooleanish(value) {
  return typeof value === "boolean" || value === "true" || value === "false";
}

function isHttpUrl(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function isAssetRef(value) {
  if (!isNonEmptyString(value) || /[\r\n]/.test(value)) return false;

  const trimmed = value.trim();
  if (/^javascript:/i.test(trimmed)) return false;

  try {
    const url = new URL(trimmed, "https://local.invalid/");
    if (url.protocol === "data:") return /^data:image\//i.test(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    return url.toString();
  } catch (error) {
    return String(value || "").trim();
  }
}

function displayName(value, fallback) {
  return isNonEmptyString(value) ? value.trim() : fallback;
}

function tabLocation(tab, index) {
  return `tabs[${index}] "${displayName(tab && tab.title, "untitled")}"`;
}

function itemLocation(tab, tabIndex, item, itemIndex) {
  return `${tabLocation(tab, tabIndex)}.items[${itemIndex}] "${displayName(item && item.name, "unnamed")}"`;
}

function loadSites() {
  const source = fs.readFileSync(sitesPath, "utf8");
  const sandbox = {
    window: Object.create(null)
  };

  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, {
    filename: sitesPath,
    timeout: 1000
  });

  return sandbox.window.NAV_SITES;
}

function validateOptionalString(owner, location, key) {
  if (Object.prototype.hasOwnProperty.call(owner, key) && typeof owner[key] !== "string") {
    addError(location, `${key} must be a string when present`);
  }
}

function validateLock(lock, location) {
  if (!isPlainObject(lock)) {
    addError(location, "lock must be an object");
    return;
  }

  ["placeholder", "inputId", "buttonId", "buttonText"].forEach((key) => {
    validateOptionalString(lock, `${location}.lock`, key);
  });

  if (
    Object.prototype.hasOwnProperty.call(lock, "inputType") &&
    !["password", "text", "search"].includes(lock.inputType)
  ) {
    addWarning(`${location}.lock`, "inputType is unusual; expected password, text, or search");
  }
}

function validateItem(item, tab, tabIndex, itemIndex, categorySet, tabUrlMap) {
  const location = itemLocation(tab, tabIndex, item, itemIndex);

  if (!isPlainObject(item)) {
    addError(location, "item must be an object");
    return;
  }

  if (!isNonEmptyString(item.name)) addError(location, "name is required");
  if (!isNonEmptyString(item.url)) {
    addError(location, "url is required");
  } else if (!isHttpUrl(item.url)) {
    addError(location, "url must be an absolute http(s) URL");
  } else {
    const normalizedUrl = normalizeUrl(item.url);
    if (tabUrlMap.has(normalizedUrl)) {
      addWarning(location, `duplicate URL in the same tab; first seen at ${tabUrlMap.get(normalizedUrl)}`);
    } else {
      tabUrlMap.set(normalizedUrl, location);
    }
  }

  [
    "className",
    "name",
    "url",
    "category",
    "icon",
    "desc",
    "target",
    "rel",
    "searchKey",
    "title",
    "linkTitle"
  ].forEach((key) => validateOptionalString(item, location, key));

  if (categorySet) {
    if (!isNonEmptyString(item.category)) {
      addError(location, "category is required because the tab has category filters");
    } else if (!categorySet.has(item.category)) {
      addWarning(location, `category "${item.category}" is not listed in this tab's categories`);
    }
  }

  if (!Object.prototype.hasOwnProperty.call(item, "icon")) {
    addWarning(location, "icon is missing; local fallback text/icon will be used");
  } else if (!isAssetRef(item.icon)) {
    addError(location, "icon must be a valid remote or local asset reference");
  }

  ["skipCheck", "favoriteCheck"].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(item, key) && !isBooleanish(item[key])) {
      addError(location, `${key} must be true/false or "true"/"false"`);
    }
  });

  if (Object.prototype.hasOwnProperty.call(item, "target")) {
    const allowedTargets = new Set(["_blank", "_self", "_parent", "_top"]);
    if (!allowedTargets.has(item.target)) {
      addWarning(location, `target "${item.target}" is unusual`);
    }
  }

  if ((item.target || "_blank") === "_blank") {
    const rel = isNonEmptyString(item.rel) ? item.rel.toLowerCase().split(/\s+/) : [];
    if (!rel.includes("noopener")) {
      addWarning(location, "target _blank should include rel=\"noopener\"");
    }
  }
}

function validateCategories(tab, location) {
  if (!Object.prototype.hasOwnProperty.call(tab, "categories")) return null;

  if (!Array.isArray(tab.categories)) {
    addError(location, "categories must be an array when present");
    return null;
  }

  if (!tab.categories.length) {
    addWarning(location, "categories is empty; remove it or add filter labels");
    return new Set();
  }

  const categorySet = new Set();
  tab.categories.forEach((category, index) => {
    const categoryLocation = `${location}.categories[${index}]`;
    if (!isNonEmptyString(category)) {
      addError(categoryLocation, "category label must be a non-empty string");
      return;
    }

    if (categorySet.has(category)) {
      addError(categoryLocation, `duplicate category "${category}"`);
    }

    categorySet.add(category);
  });

  if (tab.categories[0] !== ALL_CATEGORY) {
    addWarning(`${location}.categories[0]`, `first category should be "${ALL_CATEGORY}"`);
  }

  return categorySet;
}

function validateTab(tab, index) {
  const location = tabLocation(tab, index);

  if (!isPlainObject(tab)) {
    addError(location, "tab must be an object");
    return 0;
  }

  if (!isNonEmptyString(tab.title)) addError(location, "title is required");
  validateOptionalString(tab, location, "categoryRowClass");
  validateOptionalString(tab, location, "containerClass");
  validateOptionalString(tab, location, "containerStyle");

  if (Object.prototype.hasOwnProperty.call(tab, "selected") && typeof tab.selected !== "boolean") {
    addError(location, "selected must be a boolean when present");
  }

  if (Object.prototype.hasOwnProperty.call(tab, "statusCheck") && typeof tab.statusCheck !== "boolean") {
    addError(location, "statusCheck must be a boolean when present");
  }

  const categorySet = validateCategories(tab, location);

  if (Object.prototype.hasOwnProperty.call(tab, "lock")) {
    validateLock(tab.lock, location);
  }

  if (!Array.isArray(tab.items)) {
    addError(location, "items must be an array");
    return 0;
  }

  if (!tab.items.length) {
    addWarning(location, "items is empty");
  }

  const tabUrlMap = new Map();
  const usedCategories = new Set();

  tab.items.forEach((item, itemIndex) => {
    if (isPlainObject(item) && isNonEmptyString(item.category)) {
      usedCategories.add(item.category);
    }
    validateItem(item, tab, index, itemIndex, categorySet, tabUrlMap);
  });

  if (categorySet) {
    categorySet.forEach((category) => {
      if (category !== ALL_CATEGORY && !usedCategories.has(category)) {
        addWarning(location, `category "${category}" has no items`);
      }
    });
  }

  return tab.items.length;
}

function validateSites(sites) {
  if (!isPlainObject(sites)) {
    addError("window.NAV_SITES", "NAV_SITES must be an object");
    return { tabCount: 0, itemCount: 0 };
  }

  if (!isAssetRef(sites.iconFallback)) {
    addError("window.NAV_SITES.iconFallback", "iconFallback must be a valid remote or local asset reference");
  }

  if (!Array.isArray(sites.tabs)) {
    addError("window.NAV_SITES.tabs", "tabs must be an array");
    return { tabCount: 0, itemCount: 0 };
  }

  if (!sites.tabs.length) {
    addError("window.NAV_SITES.tabs", "tabs must not be empty");
    return { tabCount: 0, itemCount: 0 };
  }

  const titles = new Map();
  let selectedCount = 0;
  let itemCount = 0;

  sites.tabs.forEach((tab, index) => {
    if (isPlainObject(tab) && tab.selected === true) selectedCount += 1;

    if (isPlainObject(tab) && isNonEmptyString(tab.title)) {
      if (titles.has(tab.title)) {
        addError(tabLocation(tab, index), `duplicate tab title; first seen at ${titles.get(tab.title)}`);
      } else {
        titles.set(tab.title, tabLocation(tab, index));
      }
    }

    itemCount += validateTab(tab, index);
  });

  if (selectedCount > 1) {
    addError("window.NAV_SITES.tabs", "only one tab can be selected");
  }

  return { tabCount: sites.tabs.length, itemCount };
}

function printIssues(label, issues) {
  if (!issues.length) return;
  console.log(`${label}:`);
  issues.forEach((issue) => {
    console.log(`- ${issue.location}: ${issue.message}`);
  });
}

let stats = { tabCount: 0, itemCount: 0 };

try {
  stats = validateSites(loadSites());
} catch (error) {
  addError("data/sites.js", error.message);
}

printIssues("Errors", errors);
printIssues("Warnings", warnings);

const summary = [
  `Checked data/sites.js: ${stats.tabCount} tabs, ${stats.itemCount} items`,
  `${errors.length} error(s)`,
  `${warnings.length} warning(s)`
].join(", ");

console.log(summary);

if (errors.length || (strict && warnings.length)) {
  process.exitCode = 1;
} else if (warnings.length) {
  console.log("Result: passed with warnings. Use --strict to fail on warnings.");
} else {
  console.log("Result: passed.");
}
