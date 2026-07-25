(function () {
  var filterFrame = 0;

  function applyFilter() {
    filterFrame = 0;
    var input = document.getElementById("bookmark-search-input");
    var panel = document.querySelector(".products .mainCont.selected");
    var empty = document.getElementById("bookmark-empty");
    if (!panel) return;

    var query = String(input && input.value || "").trim().toLowerCase();
    var activeCategory = panel.querySelector(".category-item.active");
    var category = activeCategory ? activeCategory.textContent.trim() : "全部";
    var visibleCount = 0;

    panel.querySelectorAll(".quicks, .quick").forEach(function (card) {
      var categoryMatch = category === "全部" || card.dataset.category === category;
      var searchText = card.dataset.bookmarkSearch || card.textContent.toLowerCase();
      var visible = categoryMatch && (!query || searchText.indexOf(query) >= 0);
      card.style.display = visible ? "" : "none";
      if (visible) visibleCount += 1;
    });

    if (empty) empty.hidden = visibleCount > 0 || !!panel.querySelector(".passcode");
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
