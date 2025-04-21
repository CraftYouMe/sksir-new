document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".quicks, .quickjl");

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

  const checkLinkStatus = async (card) => {
    const link = card.querySelector("a");
    if (!link || !link.href) return;

    const url = encodeURIComponent(link.href);
    setCardStatus(card, "loading");

    try {
      const res = await fetch(`/api/check?url=${url}`);
      const data = await res.json();

      setCardStatus(card, data.status === "alive" ? "alive"
                          : data.status === "slow" ? "slow"
                          : "dead");
    } catch (error) {
      console.error("检查链接失败:", link.href, error);
      setCardStatus(card, "dead");
    }
  };
});