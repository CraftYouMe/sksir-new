// /api/check.js

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ status: "error", message: "Missing URL" });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10秒超时

    const startTime = Date.now();
    const response = await fetch(decodeURIComponent(url), {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (check-status)",
        "Accept": "*/*"
      }
    });

    clearTimeout(timeout);

    const timeUsed = Date.now() - startTime;
    const statusCode = response.status;

    if (statusCode >= 200 && statusCode < 400) {
      const status = timeUsed > 5000 ? "slow" : "alive";
      return res.status(200).json({ status, time: timeUsed });
    } else {
      return res.status(200).json({ status: "dead", code: statusCode });
    }
  } catch (error) {
    return res.status(200).json({ status: "dead", error: error.message });
  }
}