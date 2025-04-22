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

async function getGeoLocation(url) {
  try {
    const ipApiUrl = `http://ip-api.com/json/${new URL(url).hostname}`;
    const response = await fetch(ipApiUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch geolocation:", error);
    return null;
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

    // 获取地理位置
    const geoData = await getGeoLocation(decodedUrl);
    const isNonChinaServer = geoData && geoData.countryCode !== "CN";

    if (statusCode >= 200 && statusCode < 400) {
      const status = timeUsed > 5000 ? "slow" : "alive";
      return res.status(200).json({
        status,
        time: timeUsed,
        location: geoData ? geoData.country : "Unknown",
        color: isNonChinaServer ? "yellow" : "green"
      });
    } else {
      return res.status(200).json({
        status: "dead",
        code: statusCode,
        location: geoData ? geoData.country : "Unknown",
        color: isNonChinaServer ? "yellow" : "red"
      });
    }
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(408).json({ status: "dead", error: "Request timed out" });
    }
    return res.status(500).json({ status: "dead", error: error.message });
  }
}
