document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".quicks, .quickjl");

  const checkLinkStatus = async (card) => {
    const link = card.querySelector("a");
    if (!link || !link.href) return;

    const url = link.href;
    card.classList.add("loading");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      await fetch(url, { method: "HEAD", mode: "no-cors", signal: controller.signal });
      card.classList.remove("loading");
      card.classList.add("alive");
    } catch (error) {
      card.classList.remove("loading");
      card.classList.add("dead");
      // You can also log or handle the error if needed
      console.error("Error fetching URL:", error);
    } finally {
      clearTimeout(timeout);
    }
  };

  // Loop over each card and check the status
  cards.forEach(card => checkLinkStatus(card));
});
