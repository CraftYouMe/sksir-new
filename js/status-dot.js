(function () {
  var isChecking = false;
  var maxConcurrent = 4;
  var resetButtonTimer = null;
  var runId = 0;
  var statusClasses = [
    "loading",
    "skip",
    "favorite",
    "alive",
    "slow",
    "dead",
    "status-checking",
    "status-skipped",
    "status-success",
    "status-failed"
  ];
  var statusLabels = {
    "status-checking": "检测中",
    "status-skipped": "跳过检测",
    "status-success": "检测成功",
    "status-failed": "检测失败"
  };

  function clearStatus(card) {
    statusClasses.forEach(function (className) {
      card.classList.remove(className);
    });
    card.removeAttribute("data-status-label");
    card.removeAttribute("title");
    card.removeAttribute("aria-label");
  }

  function setStatus(card, className) {
    clearStatus(card);
    card.classList.add(className);
    card.setAttribute("data-status-label", statusLabels[className]);
    card.setAttribute("title", statusLabels[className]);
    card.setAttribute("aria-label", statusLabels[className]);
  }

  function shouldSkipCheck(link) {
    return link.hasAttribute("data-skip-check") || link.hasAttribute("data-favorite-check");
  }

  function markSkippedStatus(card, link) {
    if (!link || !shouldSkipCheck(link)) return false;
    setStatus(card, "status-skipped");
    return true;
  }

  function isVisible(card) {
    if (!card.getClientRects().length) return false;
    var style = window.getComputedStyle(card);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function getVisibleCards() {
    return Array.prototype.filter.call(
      document.querySelectorAll(".mark .quicks, .mark .quickjl"),
      isVisible
    );
  }

  function setButtonText(button, text) {
    var textNode = button.querySelector(".status-check-text");
    if (textNode) {
      textNode.textContent = text;
    } else {
      button.textContent = text;
    }
  }

  function resetButton(button, text) {
    button.disabled = false;
    button.classList.remove("is-checking");
    setButtonText(button, text || "检测状态");
  }

  async function checkLinkStatus(card) {
    var link = card.querySelector("a");
    if (!link || !link.href) return;
    if (markSkippedStatus(card, link)) return;

    setStatus(card, "status-checking");

    try {
      var url = encodeURIComponent(link.href);
      var res = await fetch("/api/check?url=" + url);
      var data = await res.json();

      if (data.status === "alive" || data.status === "slow") {
        setStatus(card, "status-success");
      } else {
        setStatus(card, "status-failed");
      }
    } catch (error) {
      console.error("Check link failed", link.href, error);
      setStatus(card, "status-failed");
    }
  }

  function runQueue(cards, onProgress) {
    return new Promise(function (resolve) {
      var queue = cards.slice();
      var active = 0;
      var completed = 0;
      var total = queue.length;

      function drain() {
        if (!queue.length && active === 0) {
          resolve();
          return;
        }

        while (active < maxConcurrent && queue.length) {
          active++;
          checkLinkStatus(queue.shift()).finally(function () {
            active--;
            completed++;
            onProgress(completed, total);
            drain();
          });
        }
      }

      drain();
    });
  }

  async function startManualStatusChecks(event) {
    if (isChecking) return;

    var button = event && event.currentTarget
      ? event.currentTarget
      : document.querySelector(".mainCont.selected .status-check-btn");
    if (!button) return;

    var cards = getVisibleCards();
    var pendingCards = [];

    if (resetButtonTimer) {
      clearTimeout(resetButtonTimer);
      resetButtonTimer = null;
    }

    cards.forEach(function (card) {
      var link = card.querySelector("a");
      if (!link || !link.href) return;

      if (!markSkippedStatus(card, link)) {
        setStatus(card, "status-checking");
        pendingCards.push(card);
      }
    });

    if (!cards.length || !pendingCards.length) {
      resetButton(button, !cards.length ? "无可检测" : "已跳过");
      resetButtonTimer = setTimeout(function () {
        resetButton(button);
      }, 1400);
      return;
    }

    isChecking = true;
    runId++;
    var currentRunId = runId;
    button.disabled = true;
    button.classList.add("is-checking");
    setButtonText(button, "检测中 0/" + pendingCards.length);

    await runQueue(pendingCards, function (completed, total) {
      setButtonText(button, "检测中 " + completed + "/" + total);
    });

    if (currentRunId !== runId) return;

    isChecking = false;
    resetButton(button, "检测完成");
    resetButtonTimer = setTimeout(function () {
      resetButton(button);
    }, 1600);
  }

  window.startLinkStatusChecks = startManualStatusChecks;

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".status-check-btn").forEach(function (button) {
      button.addEventListener("click", startManualStatusChecks);
    });
  });
})();
