(function () {
  var hasStarted = false;
  var queue = [];
  var active = 0;
  var maxConcurrent = 4;

  function markStaticStatus(card, link) {
    if (link.hasAttribute("data-skip-check")) {
      card.classList.add("skip");
      return true;
    }

    if (link.hasAttribute("data-favorite-check")) {
      card.classList.add("favorite");
      return true;
    }

    return false;
  }

  async function checkLinkStatus(card) {
    var link = card.querySelector("a");
    if (!link || !link.href) return;
    if (markStaticStatus(card, link)) return;

    card.classList.add("loading");

    try {
      var url = encodeURIComponent(link.href);
      var res = await fetch("/api/check?url=" + url);
      var data = await res.json();

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
      console.error("Check link failed", link.href, error);
      card.classList.remove("loading");
      card.classList.remove("alive", "slow");
      card.classList.add("dead");
    }
  }

  function drainQueue() {
    while (active < maxConcurrent && queue.length) {
      active++;
      checkLinkStatus(queue.shift()).finally(function () {
        active--;
        drainQueue();
      });
    }
  }

  function enqueueStatusChecks() {
    if (hasStarted) return;
    hasStarted = true;

    document.querySelectorAll(".quicks, .quickjl").forEach(function (card) {
      var link = card.querySelector("a");
      if (!link || !link.href) return;

      if (!markStaticStatus(card, link)) {
        queue.push(card);
      }
    });

    drainQueue();
  }

  function scheduleStatusChecks() {
    if (hasStarted) return;

    var run = function () {
      setTimeout(enqueueStatusChecks, 300);
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(run, { timeout: 1500 });
    } else {
      run();
    }
  }

  window.startLinkStatusChecks = scheduleStatusChecks;

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".quicks, .quickjl").forEach(function (card) {
      var link = card.querySelector("a");
      if (link) markStaticStatus(card, link);
    });

    var timeText = document.getElementById("time_text");
    if (timeText) {
      timeText.addEventListener("click", scheduleStatusChecks, { once: true });
    }

    var mark = document.querySelector(".mark");
    if (mark && "MutationObserver" in window) {
      var observer = new MutationObserver(function () {
        if (getComputedStyle(mark).display !== "none") {
          scheduleStatusChecks();
          observer.disconnect();
        }
      });
      observer.observe(mark, { attributes: true, attributeFilter: ["style", "class"] });
    }
  });
})();
