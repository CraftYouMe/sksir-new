// /api/check.js

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
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

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ status: "error", message: "Missing URL" });

  try {
    const decodedUrl = decodeURIComponent(url);
    const startTime = Date.now();
    const response = await fetchWithTimeout(decodedUrl, 20000); // 20秒超时
    const timeUsed = Date.now() - startTime;
    const statusCode = response.status;

    if (statusCode >= 200 && statusCode < 400) {
      const status = timeUsed > 5000 ? "slow" : "alive";
      return res.status(200).json({ status, time: timeUsed });
    } else {
      return res.status(200).json({ status: "dead", code: statusCode });
    }
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(408).json({ status: "dead", error: "Request timed out" });
    }
    return res.status(500).json({ status: "dead", error: error.message });
  }
}
