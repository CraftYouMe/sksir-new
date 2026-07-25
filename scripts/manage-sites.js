const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const {
  isPlainObject,
  loadNormalizedSites,
  serializeJson,
  serializeRuntimeJs
} = require("./sites-lib");

const rootDir = path.resolve(__dirname, "..");
const editorDir = path.join(rootDir, "tools", "bookmark-editor");
const sitesPath = path.join(rootDir, "data", "sites.json");
const runtimePath = path.join(rootDir, "data", "sites.js");
const host = "127.0.0.1";
const portArg = process.argv.find((arg) => arg.startsWith("--port="));
const port = portArg ? Number(portArg.slice(7)) : 4173;
const MAX_BODY = 2 * 1024 * 1024;

function send(res, status, body, type) {
  res.writeHead(status, {
    "Content-Type": type || "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

function validate(data) {
  const errors = [];
  if (!isPlainObject(data) || data.schemaVersion !== 1) return ["数据根节点或版本无效"];
  if (!Array.isArray(data.groups) || !data.groups.length) return ["分组列表不能为空"];
  if (!Array.isArray(data.sites) || !data.sites.length) return ["站点列表不能为空"];
  const groupNames = new Set();
  let selectedGroups = 0;
  data.groups.forEach((group, index) => {
    if (!isPlainObject(group) || !String(group.name || "").trim()) errors.push(`分组 ${index + 1} 缺少名称`);
    else if (groupNames.has(group.name)) errors.push(`分组名称重复：${group.name}`);
    else groupNames.add(group.name);
    if (group.hidden === true && !isPlainObject(group.lock)) errors.push(`隐藏分组 ${group.name} 缺少锁配置`);
    if (group.selected === true) selectedGroups += 1;
  });
  if (selectedGroups !== 1) errors.push("必须且只能有一个默认分组");
  const ids = new Set();
  const groupUrls = new Map();
  data.sites.forEach((site, index) => {
    const at = `第 ${index + 1} 条`;
    if (!isPlainObject(site)) return errors.push(`${at}不是有效对象`);
    ["id", "name", "url", "group"].forEach((key) => {
      if (!String(site[key] || "").trim()) errors.push(`${at}缺少 ${key}`);
    });
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(site.id || "")) errors.push(`${at}的 ID 格式无效`);
    if (ids.has(site.id)) errors.push(`${at}的 ID 重复：${site.id}`);
    ids.add(site.id);
    let normalizedUrl = "";
    try {
      const url = new URL(site.url);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      url.hash = "";
      normalizedUrl = url.toString();
    } catch (error) {
      errors.push(`${at}的网址必须是 http(s) 绝对地址`);
    }
    if (!groupNames.has(site.group)) errors.push(`${at}引用未知分组：${site.group}`);
    if (normalizedUrl) {
      if (!groupUrls.has(site.group)) groupUrls.set(site.group, new Set());
      if (groupUrls.get(site.group).has(normalizedUrl)) errors.push(`${at}与同组站点网址重复`);
      groupUrls.get(site.group).add(normalizedUrl);
    }
    if (data.groups.find((group) => group.name === site.group)?.hidden === true && site.hidden !== true) {
      errors.push(`${at}位于隐藏分组但未标记 hidden`);
    }
  });
  return errors;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY) reject(new Error("请求数据过大"));
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(new Error("JSON 格式无效"));
      }
    });
    req.on("error", reject);
  });
}

function atomicWritePair(data) {
  const jsonContent = serializeJson(data);
  const runtimeContent = serializeRuntimeJs(data);
  const stamp = `${process.pid}-${Date.now()}`;
  const jsonTemp = `${sitesPath}.tmp-${stamp}`;
  const runtimeTemp = `${runtimePath}.tmp-${stamp}`;
  const jsonBackup = `${sitesPath}.bak-${stamp}`;
  const runtimeBackup = `${runtimePath}.bak-${stamp}`;

  fs.writeFileSync(jsonTemp, jsonContent, "utf8");
  fs.writeFileSync(runtimeTemp, runtimeContent, "utf8");
  try {
    JSON.parse(fs.readFileSync(jsonTemp, "utf8"));
    fs.copyFileSync(sitesPath, jsonBackup);
    fs.copyFileSync(runtimePath, runtimeBackup);
    fs.renameSync(jsonTemp, sitesPath);
    fs.renameSync(runtimeTemp, runtimePath);
    JSON.parse(fs.readFileSync(sitesPath, "utf8"));
    fs.unlinkSync(jsonBackup);
    fs.unlinkSync(runtimeBackup);
  } catch (error) {
    if (fs.existsSync(jsonBackup)) fs.copyFileSync(jsonBackup, sitesPath);
    if (fs.existsSync(runtimeBackup)) fs.copyFileSync(runtimeBackup, runtimePath);
    [jsonTemp, runtimeTemp, jsonBackup, runtimeBackup].forEach((file) => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
    throw error;
  }
}

function staticFile(res, pathname) {
  const files = {
    "/": ["index.html", "text/html; charset=utf-8"],
    "/editor.css": ["editor.css", "text/css; charset=utf-8"],
    "/editor.js": ["editor.js", "text/javascript; charset=utf-8"]
  };
  const entry = files[pathname];
  if (!entry) return send(res, 404, { error: "Not found" });
  send(res, 200, fs.readFileSync(path.join(editorDir, entry[0]), "utf8"), entry[1]);
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://${host}:${port}`).pathname;
  try {
    if (req.method === "GET" && pathname === "/api/sites") {
      return send(res, 200, loadNormalizedSites(sitesPath));
    }
    if (req.method === "POST" && (pathname === "/api/validate" || pathname === "/api/save")) {
      const data = await readBody(req);
      const errors = validate(data);
      if (errors.length) return send(res, 400, { ok: false, errors });
      if (pathname === "/api/save") atomicWritePair(data);
      return send(res, 200, { ok: true, groups: data.groups.length, sites: data.sites.length });
    }
    if (req.method === "GET") return staticFile(res, pathname);
    return send(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return send(res, 500, { ok: false, errors: [error.message] });
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") console.error(`端口 ${port} 已被占用，请使用 --port=其他端口。`);
  else console.error(error.message);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`收藏管理器已启动：http://${host}:${port}`);
  console.log("按 Ctrl+C 停止。服务仅监听本机，不会暴露项目目录。");
});
