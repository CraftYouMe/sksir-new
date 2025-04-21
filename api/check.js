export default async function handler(req, res) {
    const { url } = req.query;
  
    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ status: "invalid" });
    }
  
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000); // ⏱️ 设置超时时间为 7 秒
  
    try {
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
      });
  
      clearTimeout(timeout);
  
      if (response.ok) {
        return res.status(200).json({ status: "alive" });
      } else {
        return res.status(200).json({ status: "dead" });
      }
    } catch (error) {
      clearTimeout(timeout);
  
      if (error.name === "AbortError") {
        // 超时导致的错误
        return res.status(200).json({ status: "slow" });
      }
  
      // 其他类型错误，比如 DNS 错误等
      return res.status(200).json({ status: "dead" });
    }
  }
  