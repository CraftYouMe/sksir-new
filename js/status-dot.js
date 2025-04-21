document.addEventListener("DOMContentLoaded", () => {
  const cards = [...document.querySelectorAll(".quicks, .quickjl")];

  const setCardStatus = (card, status) => {
    card.classList.remove("loading", "alive", "dead", "slow");
    card.classList.add(status);
    card.title = {
      alive: "可访问",
      slow: "访问缓慢",
      dead: "无法访问",
      loading: "检测中"
    }[status] || "";
  };

  const checkLinks = async () => {
    cards.forEach(card => setCardStatus(card, "loading"));

    const urls = cards.map(card => card.querySelector("a")?.href || "").filter(Boolean);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls })
      });

      const data = await res.json();
      data.forEach(({ url, status }) => {
        const card = cards.find(c => c.querySelector("a")?.href === url);
        if (card) setCardStatus(card, status);
      });
    } catch (err) {
      console.error("批量检测失败", err);
      cards.forEach(card => setCardStatus(card, "dead"));
    }
  };

  checkLinks();
});
