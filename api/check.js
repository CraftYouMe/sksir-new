export default async function handler(req, res) {
    const { url } = req.query;
  
    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ status: "invalid" });
    }
  
    try {
      const response = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (response.ok) {
        return res.status(200).json({ status: "alive" });
      } else {
        return res.status(200).json({ status: "dead" });
      }
    } catch (error) {
      return res.status(200).json({ status: "dead" });
    }
  }
  