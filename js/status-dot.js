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
      card.classList.add(data.status === "alive" ? "alive" : "dead");
    } catch (error) {
      card.classList.remove("loading");
      card.classList.add("dead");
    }
  };

  cards.forEach(card => checkLinkStatus(card));
});
