// 内存缓存对象：key 为 URL，value 为 { status, timestamp }
const cache = new Map();

const CACHE_TTL = 30 * 60 * 1000; // 30分钟（毫秒）

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { urls } = req.body;
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "Missing URLs" });
  }

  const maxCheck = 25;
  const now = Date.now();
  const limitedUrls = urls.slice(0, maxCheck);

  // 检查单个 URL 状态
  const checkUrl = async (url) => {
    const controller = new AbortController();
    const timeout = 8000;
    const start = Date.now();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: controller.signal,
      });

      const duration = Date.now() - start;
      clearTimeout(timer);

      const status = res.ok
        ? (duration > 4000 ? "slow" : "alive")
        : "dead";

      cache.set(url, { status, timestamp: Date.now() });
      return { url, status };
    } catch {
      clearTimeout(timer);
      const status = "dead";
      cache.set(url, { status, timestamp: Date.now() });
      return { url, status };
    }
  };

  // 使用缓存或重新检测
  const promises = limitedUrls.map(async (url) => {
    const record = cache.get(url);
    if (record && now - record.timestamp < CACHE_TTL) {
      return { url, status: record.status };
    } else {
      return await checkUrl(url);
    }
  });

  const results = await Promise.all(promises);
  return res.status(200).json(results);
}
