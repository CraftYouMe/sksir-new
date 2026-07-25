const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DEFAULT_ICON_FALLBACK = "./img/icon/fangdiu.png";
const ALL_CATEGORY = "全部";

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function loadLegacySites(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const sandbox = { window: Object.create(null) };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: filePath, timeout: 1000 });
  return sandbox.window.NAV_SITES;
}

function loadNormalizedSites(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function toBoolean(value, fallback) {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return fallback;
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getIdBase(item) {
  const nameSlug = slugify(item.name);
  if (nameSlug) return nameSlug;
  try {
    const url = new URL(item.url);
    const hostSlug = slugify(url.hostname.replace(/^www\./, ""));
    const pathSlug = slugify(url.pathname.split("/").filter(Boolean)[0] || "");
    return [hostSlug, pathSlug].filter(Boolean).join("-") || "site";
  } catch (error) {
    return "site";
  }
}

function makeUniqueId(item, groupName, usedIds) {
  const base = getIdBase(item);
  const groupSlug = slugify(groupName);
  let candidate = base;
  let suffix = 2;

  if (usedIds.has(candidate) && groupSlug) candidate = `${base}-${groupSlug}`;
  while (usedIds.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(candidate);
  return candidate;
}

function migrateLegacyData(legacy) {
  if (!isPlainObject(legacy) || !Array.isArray(legacy.tabs)) {
    throw new Error("Legacy NAV_SITES data is invalid");
  }

  const usedIds = new Set();
  const groups = [];
  const sites = [];

  legacy.tabs.forEach((tab, groupIndex) => {
    const group = {
      name: String(tab.title || `分组 ${groupIndex + 1}`),
      selected: tab.selected === true,
      statusCheck: tab.statusCheck !== false
    };
    if (tab.lock) {
      group.hidden = true;
      group.lock = { ...tab.lock };
    }
    if (tab.containerClass && tab.containerClass !== "quick-alls") {
      group.containerClass = tab.containerClass;
    }
    if (tab.containerStyle) group.containerStyle = tab.containerStyle;
    if (tab.categoryRowClass) group.categoryRowClass = tab.categoryRowClass;
    groups.push(group);

    (tab.items || []).forEach((item) => {
      const site = {
        id: makeUniqueId(item, group.name, usedIds),
        name: String(item.name || "").trim(),
        url: String(item.url || "").trim(),
        group: group.name
      };
      if (item.category) site.category = String(item.category).trim();
      if (item.desc) site.description = String(item.desc).trim();
      site.icon = item.icon ? String(item.icon).trim() : "auto";
      if (
        toBoolean(item.favoriteCheck, false) ||
        toBoolean(item.skipCheck, false)
      ) {
        site.statusCheck = false;
      }
      if (group.hidden) site.hidden = true;
      if (item.searchKey) site.searchKey = String(item.searchKey);
      if (item.title) site.title = String(item.title);
      if (item.linkTitle) site.linkTitle = String(item.linkTitle);
      sites.push(site);
    });
  });

  return {
    schemaVersion: 1,
    iconFallback: legacy.iconFallback || DEFAULT_ICON_FALLBACK,
    groups,
    sites
  };
}

function deriveCategories(sites) {
  const categories = [];
  const seen = new Set();
  sites.forEach((site) => {
    const category = String(site.category || "").trim();
    if (category && !seen.has(category)) {
      seen.add(category);
      categories.push(category);
    }
  });
  return categories.length ? [ALL_CATEGORY, ...categories] : [];
}

function toRuntimeData(normalized) {
  const sitesByGroup = new Map();
  normalized.groups.forEach((group) => sitesByGroup.set(group.name, []));
  normalized.sites.forEach((site) => {
    if (!sitesByGroup.has(site.group)) sitesByGroup.set(site.group, []);
    sitesByGroup.get(site.group).push(site);
  });

  return {
    iconFallback: normalized.iconFallback || DEFAULT_ICON_FALLBACK,
    tabs: normalized.groups.map((group) => {
      const groupSites = sitesByGroup.get(group.name) || [];
      const tab = {
        title: group.name,
        selected: group.selected === true,
        items: groupSites.map((site) => {
          const item = {
            className: "quicks",
            name: site.name,
            url: site.url,
            category: site.category || "",
            icon: site.icon === "auto" || !site.icon
              ? normalized.iconFallback || DEFAULT_ICON_FALLBACK
              : site.icon,
            desc: site.description || "",
            target: "_blank",
            rel: "noopener noreferrer"
          };
          if (site.statusCheck === false) item.skipCheck = true;
          if (site.searchKey) item.searchKey = site.searchKey;
          if (site.title) item.title = site.title;
          if (site.linkTitle) item.linkTitle = site.linkTitle;
          return item;
        }),
        statusCheck: group.statusCheck !== false,
        containerClass: group.containerClass || "quick-alls"
      };

      const categories = deriveCategories(groupSites);
      if (categories.length) tab.categories = categories;
      if (group.categoryRowClass) tab.categoryRowClass = group.categoryRowClass;
      if (group.containerStyle) tab.containerStyle = group.containerStyle;
      if (group.lock) tab.lock = { ...group.lock };
      return tab;
    })
  };
}

function serializeJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function serializeRuntimeJs(normalized) {
  return `// Generated from data/sites.json by scripts/migrate-sites.js. Do not edit directly.\nwindow.NAV_SITES = ${JSON.stringify(toRuntimeData(normalized), null, 2)};\n`;
}

function writeFileSafely(filePath, content, overwrite) {
  if (fs.existsSync(filePath) && !overwrite) {
    throw new Error(`${path.relative(process.cwd(), filePath)} already exists; pass --force to replace it`);
  }
  const tempPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tempPath, content, "utf8");
  fs.renameSync(tempPath, filePath);
}

module.exports = {
  ALL_CATEGORY,
  DEFAULT_ICON_FALLBACK,
  deriveCategories,
  isPlainObject,
  loadLegacySites,
  loadNormalizedSites,
  migrateLegacyData,
  serializeJson,
  serializeRuntimeJs,
  toRuntimeData,
  writeFileSafely
};
