const fs = require("fs");
const http = require("http");
const path = require("path");
const { URL } = require("url");

const rootDir = path.resolve(__dirname, "..");
const host = "127.0.0.1";
const portArg = process.argv.find((arg) => arg.startsWith("--port="));
const port = portArg ? Number(portArg.slice(7)) : 4173;
const localAssetPrefix = "/__assets__/";
const ossVersionPrefix = /https:\/\/yuanone-blog-picture\.oss-cn-beijing\.aliyuncs\.com\/sksir\/\d{4}\.\d{2}\.\d{2}\.\d+\//g;
const bundledAssetRoot = path.join(rootDir, "assets", "oss");
const bundledAssetDir = fs.readdirSync(bundledAssetRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(entry.name))
  .map((entry) => entry.name)
  .sort((left, right) => right.localeCompare(left, undefined, { numeric: true }))
  .map((name) => path.join(bundledAssetRoot, name))[0];

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function send(res, status, body, contentType) {
  res.writeHead(status, {
    "Content-Type": contentType || "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function resolveRequestPath(pathname) {
  const isVersionedAsset = pathname.startsWith(localAssetPrefix);
  const relativePath = isVersionedAsset
    ? pathname.slice(localAssetPrefix.length)
    : pathname.replace(/^\/+/, "");
  const decodedPath = decodeURIComponent(relativePath || "index.html");
  if (isVersionedAsset && decodedPath === "icon/apple-touch-icon.png") {
    return path.join(rootDir, "apple-touch-icon.png");
  }
  const filePath = path.resolve(rootDir, decodedPath);
  if (filePath !== rootDir && !filePath.startsWith(rootDir + path.sep)) return null;
  if (isVersionedAsset && !fs.existsSync(filePath) && bundledAssetDir) {
    const bundledPath = path.resolve(bundledAssetDir, decodedPath);
    if (bundledPath === bundledAssetDir || bundledPath.startsWith(bundledAssetDir + path.sep)) {
      return bundledPath;
    }
  }
  return filePath;
}

function rewriteVersionedAssets(content) {
  return content.replace(ossVersionPrefix, localAssetPrefix);
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "Method not allowed");
  }

  let pathname;
  try {
    pathname = new URL(req.url, `http://${host}:${port}`).pathname;
  } catch (error) {
    return send(res, 400, "Bad request");
  }

  const filePath = resolveRequestPath(pathname);
  if (!filePath) return send(res, 403, "Forbidden");

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) return send(res, 404, "Not found");

    fs.readFile(filePath, (readError, buffer) => {
      if (readError) return send(res, 500, "Unable to read file");
      const extension = path.extname(filePath).toLowerCase();
      const contentType = contentTypes[extension] || "application/octet-stream";
      const isTextAsset = extension === ".html" || extension === ".css" ||
        extension === ".js" || extension === ".json";
      const body = isTextAsset ? rewriteVersionedAssets(buffer.toString("utf8")) : buffer;
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*"
      });
      res.end(req.method === "HEAD" ? undefined : body);
    });
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`端口 ${port} 已被占用，请运行 npm run preview -- --port=其他端口。`);
  } else {
    console.error(error.message);
  }
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`本地预览已启动：http://${host}:${port}/`);
  console.log("版本化 OSS 静态资源会自动映射到当前工作区，按 Ctrl+C 停止。");
});
