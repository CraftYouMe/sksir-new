const fs = require("fs");
const path = require("path");
const {
  deriveCategories,
  isPlainObject,
  loadNormalizedSites,
  serializeRuntimeJs
} = require("./sites-lib");

const rootDir = path.resolve(__dirname, "..");
const jsonPath = path.join(rootDir, "data", "sites.json");
const runtimePath = path.join(rootDir, "data", "sites.js");
const strict = process.argv.includes("--strict");
const errors = [];
const warnings = [];

function issue(list, location, message) {
  list.push({ location, message });
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function httpUrl(value) {
  if (!nonEmpty(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function asset(value) {
  if (value === "auto") return true;
  if (!nonEmpty(value) || /[\r\n]/.test(value)) return false;
  try {
    const url = new URL(value, "https://local.invalid/");
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function normalizedUrl(value) {
  const url = new URL(value);
  url.hash = "";
  return url.toString();
}

function validate(data) {
  if (!isPlainObject(data)) {
    issue(errors, "root", "must be an object");
    return { groups: 0, sites: 0, duplicates: 0 };
  }
  if (data.schemaVersion !== 1) issue(errors, "schemaVersion", "must be 1");
  if (!asset(data.iconFallback)) issue(errors, "iconFallback", "invalid asset reference");
  if (!Array.isArray(data.groups) || !data.groups.length) issue(errors, "groups", "must be non-empty");
  if (!Array.isArray(data.sites) || !data.sites.length) issue(errors, "sites", "must be non-empty");
  if (errors.length) return { groups: 0, sites: 0, duplicates: 0 };

  const groups = new Map();
  let selected = 0;
  data.groups.forEach((group, index) => {
    const at = `groups[${index}]`;
    if (!isPlainObject(group) || !nonEmpty(group.name)) return issue(errors, at, "name is required");
    if (groups.has(group.name)) issue(errors, at, `duplicate name "${group.name}"`);
    groups.set(group.name, group);
    if (group.selected === true) selected += 1;
    ["selected", "statusCheck", "hidden"].forEach((key) => {
      if (key in group && typeof group[key] !== "boolean") issue(errors, at, `${key} must be boolean`);
    });
    if (group.hidden === true && !isPlainObject(group.lock)) issue(errors, at, "hidden group must keep lock");
  });
  if (selected !== 1) issue(errors, "groups", "exactly one group must be selected");

  const ids = new Set();
  const groupUrls = new Map();
  const globalUrls = new Map();
  data.sites.forEach((site, index) => {
    const at = `sites[${index}]`;
    if (!isPlainObject(site)) return issue(errors, at, "must be an object");
    ["id", "name", "url", "group"].forEach((key) => {
      if (!nonEmpty(site[key])) issue(errors, at, `${key} is required`);
    });
    if (nonEmpty(site.id)) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(site.id)) issue(errors, at, "id must be an ASCII slug");
      if (ids.has(site.id)) issue(errors, at, `duplicate id "${site.id}"`);
      ids.add(site.id);
    }
    if (!httpUrl(site.url)) issue(errors, at, "url must be absolute http(s)");
    if (!groups.has(site.group)) issue(errors, at, `unknown group "${site.group}"`);
    if ("icon" in site && !asset(site.icon)) issue(errors, at, "invalid icon reference");
    ["category", "description", "icon", "searchKey", "title", "linkTitle"].forEach((key) => {
      if (key in site && typeof site[key] !== "string") issue(errors, at, `${key} must be string`);
    });
    ["featured", "statusCheck", "hidden"].forEach((key) => {
      if (key in site && typeof site[key] !== "boolean") issue(errors, at, `${key} must be boolean`);
    });
    if (groups.get(site.group)?.hidden === true && site.hidden !== true) {
      issue(errors, at, "site in hidden group must remain hidden");
    }
    if (httpUrl(site.url)) {
      const url = normalizedUrl(site.url);
      if (!groupUrls.has(site.group)) groupUrls.set(site.group, new Set());
      if (groupUrls.get(site.group).has(url)) issue(errors, at, "duplicate URL in the same group");
      groupUrls.get(site.group).add(url);
      globalUrls.set(url, (globalUrls.get(url) || 0) + 1);
    }
  });

  data.groups.forEach((group) => {
    deriveCategories(data.sites.filter((site) => site.group === group.name));
  });

  if (fs.readFileSync(runtimePath, "utf8") !== serializeRuntimeJs(data)) {
    issue(errors, "data/sites.js", "stale runtime artifact; run migrate-sites.js --generate-runtime");
  }

  return {
    groups: data.groups.length,
    sites: data.sites.length,
    duplicates: [...globalUrls.values()].filter((count) => count > 1).length
  };
}

let stats = { groups: 0, sites: 0, duplicates: 0 };
try {
  stats = validate(loadNormalizedSites(jsonPath));
} catch (error) {
  issue(errors, "data/sites.json", error.message);
}

function print(label, list) {
  if (!list.length) return;
  console.log(`${label}:`);
  list.forEach((entry) => console.log(`- ${entry.location}: ${entry.message}`));
}

print("Errors", errors);
print("Warnings", warnings);
console.log(
  `Checked data/sites.json: ${stats.groups} groups, ${stats.sites} sites, ` +
  `${stats.duplicates} cross-group duplicate URL(s), ${errors.length} error(s), ${warnings.length} warning(s)`
);
if (errors.length || (strict && warnings.length)) process.exitCode = 1;
else console.log(warnings.length ? "Result: passed with warnings." : "Result: passed.");
