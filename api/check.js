// /api/check.js

const dns = require("dns").promises;
const fs = require("fs");
const net = require("net");
const path = require("path");
const vm = require("vm");

const REQUEST_TIMEOUT_MS = 8000;
const SLOW_THRESHOLD_MS = 5000;
const ALLOWLIST_CACHE_MS = 5 * 60 * 1000;
const LOCAL_METADATA_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata",
  "metadata.google.internal"
]);

let allowlistCache = {
  hosts: null,
  expiresAt: 0
};

function sendJson(res, httpStatus, body) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  return res.status(httpStatus).json(body);
}

function normalizeHostname(hostname) {
  return String(hostname || "")
    .trim()
    .toLowerCase()
    .replace(/^\[(.*)\]$/, "$1")
    .replace(/\.$/, "");
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function loadSitesData() {
  const sitesPath = path.resolve(process.cwd(), "data", "sites.js");
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

function collectAllowedHosts() {
  const sites = loadSitesData();
  const hosts = new Set();

  if (!isPlainObject(sites) || !Array.isArray(sites.tabs)) {
    throw new Error("Invalid NAV_SITES data");
  }

  sites.tabs.forEach((tab) => {
    if (!isPlainObject(tab) || !Array.isArray(tab.items)) return;

    tab.items.forEach((item) => {
      if (!isPlainObject(item) || typeof item.url !== "string") return;

      try {
        const itemUrl = new URL(item.url);
        if (itemUrl.protocol === "http:" || itemUrl.protocol === "https:") {
          hosts.add(normalizeHostname(itemUrl.hostname));
        }
      } catch (error) {
        // data/sites.js is validated by scripts/validate-sites.js; ignore malformed entries here.
      }
    });
  });

  return hosts;
}

function getAllowedHosts() {
  const now = Date.now();
  if (allowlistCache.hosts && allowlistCache.expiresAt > now) {
    return allowlistCache.hosts;
  }

  const hosts = collectAllowedHosts();
  allowlistCache = {
    hosts,
    expiresAt: now + ALLOWLIST_CACHE_MS
  };
  return hosts;
}

function parseIpv4(address) {
  const parts = String(address).split(".");
  if (parts.length !== 4) return null;

  const bytes = parts.map((part) => {
    if (!/^\d+$/.test(part)) return -1;
    const value = Number(part);
    return value >= 0 && value <= 255 ? value : -1;
  });

  return bytes.every((value) => value >= 0) ? bytes : null;
}

function isBlockedIpv4(address) {
  const bytes = parseIpv4(address);
  if (!bytes) return false;

  const [a, b] = bytes;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isBlockedIpv6(address) {
  const lower = String(address).toLowerCase();
  if (lower === "::" || lower === "::1") return true;

  if (lower.startsWith("::ffff:")) {
    return isBlockedIpv4(lower.slice(7));
  }

  const firstSegment = lower.split(":")[0];
  const first = parseInt(firstSegment || "0", 16);
  if (Number.isNaN(first)) return false;

  return (
    (first & 0xfe00) === 0xfc00 ||
    (first & 0xffc0) === 0xfe80 ||
    (first & 0xff00) === 0xff00
  );
}

function isBlockedIp(address) {
  const family = net.isIP(address);
  if (family === 4) return isBlockedIpv4(address);
  if (family === 6) return isBlockedIpv6(address);
  return false;
}

function isBlockedHostname(hostname) {
  const host = normalizeHostname(hostname);
  return (
    !host ||
    LOCAL_METADATA_HOSTS.has(host) ||
    host.endsWith(".localhost") ||
    isBlockedIp(host)
  );
}

function getQueryUrl(req) {
  const query = req.query || {};
  const rawUrl = Array.isArray(query.url) ? query.url[0] : query.url;
  if (typeof rawUrl !== "string" || !rawUrl.trim()) return "";

  try {
    return decodeURIComponent(rawUrl);
  } catch (error) {
    return rawUrl;
  }
}

function parseTargetUrl(value) {
  try {
    const targetUrl = new URL(value);
    if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
      throw Object.assign(new Error("Unsupported protocol"), { statusCode: 400 });
    }
    targetUrl.hash = "";
    return targetUrl;
  } catch (error) {
    if (error.statusCode) throw error;
    throw Object.assign(new Error("Invalid URL"), { statusCode: 400 });
  }
}

async function assertSafeTarget(targetUrl) {
  const hostname = normalizeHostname(targetUrl.hostname);
  if (isBlockedHostname(hostname)) {
    throw Object.assign(new Error("Blocked target"), { statusCode: 403 });
  }

  const allowedHosts = getAllowedHosts();
  if (!allowedHosts.has(hostname)) {
    throw Object.assign(new Error("Host is not in navigation data"), { statusCode: 403 });
  }

  const records = await dns.lookup(hostname, {
    all: true,
    verbatim: true
  });

  if (!records.length || records.some((record) => isBlockedIp(record.address))) {
    throw Object.assign(new Error("Blocked resolved address"), { statusCode: 403 });
  }
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (check-status)",
        "Accept": "*/*"
      }
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return sendJson(res, 405, { status: "dead", code: 405 });
  }

  const queryUrl = getQueryUrl(req);
  if (!queryUrl) {
    return sendJson(res, 400, { status: "dead", code: 400 });
  }

  try {
    const targetUrl = parseTargetUrl(queryUrl);
    await assertSafeTarget(targetUrl);

    const startTime = Date.now();
    const response = await fetchWithTimeout(targetUrl.toString(), REQUEST_TIMEOUT_MS);
    const timeUsed = Date.now() - startTime;
    const statusCode = response.status;

    if (statusCode >= 200 && statusCode < 400) {
      return sendJson(res, 200, {
        status: timeUsed > SLOW_THRESHOLD_MS ? "slow" : "alive",
        time: timeUsed,
        code: statusCode
      });
    }

    return sendJson(res, 200, {
      status: "dead",
      code: statusCode
    });
  } catch (error) {
    if (error.name === "AbortError") {
      return sendJson(res, 408, { status: "dead", code: 408 });
    }

    const statusCode = error.statusCode || 500;
    return sendJson(res, statusCode, {
      status: "dead",
      code: statusCode
    });
  }
};
