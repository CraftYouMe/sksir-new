(function () {
  var filterFrame = 0;
  var resultPanelClass = "bookmark-search-results";

  function getPanels(products) {
    return Array.prototype.filter.call(
      products.querySelectorAll(".mainCont"),
      function (panel) {
        return !panel.classList.contains(resultPanelClass);
      }
    );
  }

  function restoreSelectedPanel(products, panels) {
    var resultPanel = products.querySelector("." + resultPanelClass);
    if (resultPanel) resultPanel.remove();

    var activeTab = document.querySelector(".mark .tab-item.active");
    var activeIndex = activeTab
      ? Array.prototype.indexOf.call(activeTab.parentNode.children, activeTab)
      : 0;

    panels.forEach(function (panel, index) {
      var selected = index === activeIndex;
      panel.classList.toggle("selected", selected);
      panel.style.display = selected ? "flex" : "none";
    });

    return panels[activeIndex] || panels[0];
  }

  function filterSelectedPanel(panel, empty) {
    if (!panel) return;

    var activeCategory = panel.querySelector(".category-item.active");
    var category = activeCategory ? activeCategory.textContent.trim() : "全部";
    var visibleCount = 0;

    panel.querySelectorAll(".quicks, .quick").forEach(function (card) {
      var categoryMatch = category === "全部" || card.dataset.category === category;
      var visible = categoryMatch;
      card.style.display = visible ? "" : "none";
      if (visible) visibleCount += 1;
    });

    if (empty) {
      empty.textContent = "当前分类暂无收藏";
      empty.hidden = visibleCount > 0 || !!panel.querySelector(".passcode");
    }
  }

  function isProtectedPanelHidden(panel) {
    var items = panel.querySelector("[data-nav-items]");
    return !!(
      panel.querySelector(".passcode") &&
      items &&
      window.getComputedStyle(items).visibility === "hidden"
    );
  }

  function getResultKey(card) {
    var link = card.querySelector("a[href]");
    if (!link) return card.dataset.bookmarkSearch || card.textContent.trim().toLowerCase();

    try {
      var url = new URL(link.href, window.location.href);
      url.hash = "";
      if (url.pathname.length > 1) {
        url.pathname = url.pathname.replace(/\/+$/, "");
      }
      return url.href;
    } catch (error) {
      return link.href;
    }
  }

  function renderGlobalResults(products, panels, query, empty) {
    var resultPanel = products.querySelector("." + resultPanelClass);
    if (!resultPanel) {
      resultPanel = document.createElement("div");
      resultPanel.className = "mainCont " + resultPanelClass;
      resultPanel.appendChild(document.createElement("div")).className = "quick-alls";
      products.appendChild(resultPanel);
    }

    var resultGrid = resultPanel.querySelector(".quick-alls");
    resultGrid.textContent = "";
    var resultKeys = new Set();

    panels.forEach(function (panel) {
      if (typeof window.ensureNavPanelRendered === "function") {
        window.ensureNavPanelRendered(panel);
      }
      if (isProtectedPanelHidden(panel)) return;

      panel.querySelectorAll(".quicks, .quick").forEach(function (card) {
        var searchText = card.dataset.bookmarkSearch || card.textContent.toLowerCase();
        if (searchText.indexOf(query) < 0) return;

        var resultKey = getResultKey(card);
        if (resultKeys.has(resultKey)) return;
        resultKeys.add(resultKey);

        var resultCard = card.cloneNode(true);
        resultCard.style.display = "";
        resultCard.querySelectorAll("[data-icon-load-scheduled]").forEach(function (icon) {
          icon.removeAttribute("data-icon-load-scheduled");
        });
        resultGrid.appendChild(resultCard);
      });
    });

    panels.forEach(function (panel) {
      panel.style.display = "none";
    });
    resultPanel.classList.add("selected");
    resultPanel.style.display = "flex";

    if (typeof window.loadDeferredNavIcons === "function") {
      window.loadDeferredNavIcons(resultPanel);
    }

    if (empty) {
      empty.textContent = "暂无搜索结果";
      empty.hidden = resultGrid.children.length > 0;
    }
  }

  function applyFilter() {
    filterFrame = 0;
    var input = document.getElementById("bookmark-search-input");
    var products = document.querySelector(".products");
    var empty = document.getElementById("bookmark-empty");
    if (!products) return;

    var query = String(input && input.value || "").trim().toLowerCase();
    var panels = getPanels(products);

    if (query) {
      renderGlobalResults(products, panels, query, empty);
      return;
    }

    filterSelectedPanel(restoreSelectedPanel(products, panels), empty);
  }

  function scheduleFilter() {
    if (filterFrame) cancelAnimationFrame(filterFrame);
    filterFrame = requestAnimationFrame(applyFilter);
  }

  document.addEventListener("input", function (event) {
    if (event.target && event.target.id === "bookmark-search-input") scheduleFilter();
  });
  document.addEventListener("click", function (event) {
    var close = event.target && event.target.closest && event.target.closest("#bookmark-close");
    if (!close) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof window.closeBox === "function") window.closeBox();
  });

  window.scheduleBookmarkCenterFilter = scheduleFilter;
}());
