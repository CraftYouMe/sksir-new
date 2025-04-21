document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".quicks, .quickjl");

  const checkLinkStatus = async (card) => {
    const link = card.querySelector("a");
    if (!link || !link.href) return;

    const url = encodeURIComponent(link.href);
    card.classList.add("loading");

    try {
      const res = await fetch(`/api/check?url=${url}`);
      const data = await res.json();

      card.classList.remove("loading");
      card.classList.remove("alive", "dead", "slow");

      if (data.status === "alive") {
        card.classList.add("alive");
      } else if (data.status === "slow") {
        card.classList.add("slow");
      } else {
        card.classList.add("dead");
      }

    } catch (error) {
      console.error("检查链接失败:", link.href, error);
      card.classList.remove("loading");
      card.classList.remove("alive", "slow");
      card.classList.add("dead");
    }
  };

  cards.forEach(card => checkLinkStatus(card));
});
