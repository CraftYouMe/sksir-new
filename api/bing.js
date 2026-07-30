const BING_ARCHIVE_URL =
  "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN";
const REQUEST_TIMEOUT_MS = 6000;

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).end();
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(BING_ARCHIVE_URL, {
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Bing archive returned ${response.status}`);

    const data = await response.json();
    const imagePath = data && data.images && data.images[0] && data.images[0].url;
    if (typeof imagePath !== "string" || !imagePath.startsWith("/th?id=OHR.")) {
      throw new Error("Bing archive returned an invalid image path");
    }

    res.setHeader(
      "Cache-Control",
      "public, max-age=1800, s-maxage=21600, stale-while-revalidate=86400"
    );
    return res.redirect(302, new URL(imagePath, "https://www.bing.com").href);
  } catch (error) {
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(502).json({ error: "Bing wallpaper is temporarily unavailable" });
  } finally {
    clearTimeout(timeout);
  }
};
