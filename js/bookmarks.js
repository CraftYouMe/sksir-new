(function () {
  var filterFrame = 0;
  var resultPanelClass = "bookmark-search-results";
  var tabOrderKey = "sksir-bookmark-tab-order";
  var customItemsKey = "sksir-bookmark-custom-items";
  var customItemsLimit = 120;
  var suppressTabClickUntil = 0;
  var itemDialogCloseTimer = 0;
  var deleteDialogCloseTimer = 0;
  var pendingItemPanel = null;
  var pendingDeleteId = "";

  function getPanels(products) {
    return Array.prototype.filter.call(
      products.querySelectorAll(".mainCont"),
      function (panel) {
        return !panel.classList.contains(resultPanelClass);
      }
    );
  }

  function readJson(key, fallback) {
    return window.SksirStorage ? window.SksirStorage.readJson(key, fallback) : fallback;
  }

  function writeJson(key, value) {
    return window.SksirStorage && window.SksirStorage.writeJson(key, value);
  }

  function normalizeWebUrl(value) {
    value = String(value || "").trim();
    if (value && !/^[a-z][a-z0-9+.-]*:/i.test(value)) value = "https://" + value;
    try {
      var parsed = new URL(value);
      return /^(https?:)$/.test(parsed.protocol) ? parsed.href : "";
    } catch (error) {
      return "";
    }
  }

  function getCustomItems() {
    var stored = readJson(customItemsKey, []);
    if (!Array.isArray(stored)) return [];
    var seen = {};
    return stored.slice(0, customItemsLimit).reduce(function (items, item) {
      if (!item || typeof item !== "object") return items;
      var id = String(item.id || "").trim();
      var tabTitle = String(item.tabTitle || "").trim();
      var name = String(item.name || "").trim().slice(0, 30);
      var url = normalizeWebUrl(item.url);
      if (!id || !tabTitle || !name || !url || seen[id]) return items;
      seen[id] = true;
      items.push({
        id: id,
        tabTitle: tabTitle,
        name: name,
        url: url,
        desc: String(item.desc || "").trim().slice(0, 80),
        icon: normalizeWebUrl(item.icon),
        category: String(item.category || "").trim().slice(0, 30)
      });
      return items;
    }, []);
  }

  function getTabData(panel) {
    var index = parseInt(panel && panel.getAttribute("data-nav-tab-index") || "-1", 10);
    var tabs = window.NAV_SITES && window.NAV_SITES.tabs;
    return Array.isArray(tabs) && index >= 0 ? tabs[index] : null;
  }

  function createAddCard(panel, tab) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "bookmark-add-card";
    button.setAttribute("aria-label", "添加到 " + tab.title);
    button.title = "添加到 " + tab.title;
    var icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "+";
    button.appendChild(icon);
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      openItemDialog(panel);
    });
    return button;
  }

  function createCustomCard(item, tab, panel) {
    if (typeof window.createNavBookmarkCard !== "function") return null;
    var card = window.createNavBookmarkCard({
      className: "quicks",
      name: item.name,
      url: item.url,
      category: item.category,
      icon: item.icon || (window.NAV_SITES && window.NAV_SITES.iconFallback),
      desc: item.desc,
      target: "_blank",
      rel: "noopener noreferrer",
      skipCheck: true
    }, tab);
    card.classList.add("bookmark-custom-card");
    card.dataset.bookmarkCustomId = item.id;

    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "bookmark-custom-remove";
    remove.setAttribute("aria-label", "删除 " + item.name);
    remove.title = "删除 " + item.name;
    remove.textContent = "\u00d7";
    remove.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openDeleteDialog(item.id, item.name, panel);
    });
    card.appendChild(remove);
    return card;
  }

  function syncPanelCustomItems(panel) {
    if (!panel || panel.classList.contains(resultPanelClass) || panel.dataset.navHydrated !== "1") return;
    var tab = getTabData(panel);
    var container = panel.querySelector("[data-nav-items]");
    if (!tab || !container) return;

    container.querySelectorAll(".bookmark-custom-card, .bookmark-add-card").forEach(function (item) {
      item.remove();
    });
    getCustomItems().filter(function (item) {
      return item.tabTitle === tab.title;
    }).forEach(function (item) {
      var card = createCustomCard(item, tab, panel);
      if (card) container.appendChild(card);
    });
    container.appendChild(createAddCard(panel, tab));
    if (typeof window.loadDeferredNavIcons === "function") {
      window.loadDeferredNavIcons(panel);
    }
  }

  function syncAllCustomItems() {
    document.querySelectorAll(".products .mainCont[data-nav-tab-index]").forEach(syncPanelCustomItems);
  }

  function applySavedTabOrder() {
    var row = document.querySelector(".mark .tab");
    if (!row) return;
    var items = Array.prototype.slice.call(row.querySelectorAll(".tab-item"));
    var order = readJson(tabOrderKey, []);
    if (!Array.isArray(order) || !order.length) return;
    var orderMap = {};
    order.forEach(function (title, index) {
      orderMap[String(title)] = index;
    });
    items.sort(function (left, right) {
      var leftTitle = left.getAttribute("data-nav-tab-title") || left.textContent.trim();
      var rightTitle = right.getAttribute("data-nav-tab-title") || right.textContent.trim();
      var leftIndex = Object.prototype.hasOwnProperty.call(orderMap, leftTitle) ? orderMap[leftTitle] : 9999;
      var rightIndex = Object.prototype.hasOwnProperty.call(orderMap, rightTitle) ? orderMap[rightTitle] : 9999;
      return leftIndex - rightIndex;
    }).forEach(function (item) {
      row.appendChild(item);
    });
  }

  function saveTabOrder(row) {
    writeJson(tabOrderKey, Array.prototype.map.call(row.querySelectorAll(".tab-item"), function (item) {
      return item.getAttribute("data-nav-tab-title") || item.textContent.trim();
    }));
  }

  function animateTabReorder(row, previousRects, draggingItem) {
    row.querySelectorAll(".tab-item").forEach(function (item) {
      var previous = previousRects.get(item);
      if (!previous || item === draggingItem || typeof item.animate !== "function") return;
      var current = item.getBoundingClientRect();
      var deltaX = previous.left - current.left;
      if (!deltaX) return;
      if (typeof item.getAnimations === "function") {
        item.getAnimations().forEach(function (animation) { animation.cancel(); });
      }
      item.animate([
        { transform: "translateX(" + deltaX + "px)" },
        { transform: "translateX(0)" }
      ], { duration: 160, easing: "cubic-bezier(.2,.8,.2,1)" });
    });
  }

  function bindTabDrag(item, row) {
    if (item.dataset.bookmarkDragBound === "1") return;
    item.dataset.bookmarkDragBound = "1";
    var startX = 0;
    var startY = 0;
    var pointerX = 0;
    var pointerY = 0;
    var moveFrame = 0;
    var dragging = false;
    var ghost = null;
    var placeholder = null;

    function moveGhost(event) {
      var points = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : null;
      var point = points && points.length ? points[points.length - 1] : event;
      pointerX = point.clientX;
      pointerY = point.clientY;
      if (ghost) {
        ghost.style.transform = "translate3d(" + (pointerX - ghost.offsetWidth / 2) + "px," +
          (pointerY - 24) + "px,0)";
      }
    }

    function updatePosition() {
      moveFrame = 0;
      if (!dragging || !placeholder) return;
      var rowRect = row.getBoundingClientRect();
      if (pointerX < rowRect.left + 34) row.scrollLeft -= 10;
      if (pointerX > rowRect.right - 34) row.scrollLeft += 10;

      var entries = Array.prototype.filter.call(row.querySelectorAll(".tab-item"), function (entry) {
        return entry !== item;
      });
      var before = null;
      for (var index = 0; index < entries.length; index += 1) {
        var rect = entries[index].getBoundingClientRect();
        if (pointerX < rect.left + rect.width / 2) {
          before = entries[index];
          break;
        }
      }
      if (placeholder.nextSibling === before || (!before && !placeholder.nextSibling)) return;
      var previousRects = new Map();
      entries.forEach(function (entry) {
        previousRects.set(entry, entry.getBoundingClientRect());
      });
      row.insertBefore(placeholder, before);
      animateTabReorder(row, previousRects, item);
    }

    function schedulePosition(event) {
      moveGhost(event);
      if (!moveFrame) moveFrame = requestAnimationFrame(updatePosition);
    }

    function startDrag(event) {
      dragging = true;
      item.classList.add("is-dragging");
      item.setAttribute("aria-grabbed", "true");
      row.classList.add("is-reordering");
      placeholder = document.createElement("span");
      placeholder.className = "bookmark-tab-placeholder";
      placeholder.setAttribute("aria-hidden", "true");
      row.insertBefore(placeholder, item);
      ghost = document.createElement("div");
      ghost.className = "bookmark-tab-drag-ghost";
      ghost.textContent = item.textContent.trim();
      document.body.appendChild(ghost);
      schedulePosition(event);
    }

    item.addEventListener("pointerdown", function (event) {
      if (event.button !== undefined && event.button !== 0) return;
      startX = event.clientX;
      startY = event.clientY;
      dragging = false;
      item.setPointerCapture(event.pointerId);
    });

    item.addEventListener("pointermove", function (event) {
      if (!item.hasPointerCapture(event.pointerId)) return;
      if (!dragging && Math.hypot(event.clientX - startX, event.clientY - startY) < 4) return;
      if (!dragging) startDrag(event);
      event.preventDefault();
      schedulePosition(event);
    });

    function finishDrag(event) {
      if (item.hasPointerCapture(event.pointerId)) item.releasePointerCapture(event.pointerId);
      if (moveFrame) cancelAnimationFrame(moveFrame);
      moveFrame = 0;
      if (!dragging) return;
      row.insertBefore(item, placeholder);
      placeholder.remove();
      ghost.remove();
      placeholder = null;
      ghost = null;
      dragging = false;
      item.classList.remove("is-dragging");
      item.removeAttribute("aria-grabbed");
      row.classList.remove("is-reordering");
      suppressTabClickUntil = Date.now() + 260;
      saveTabOrder(row);
    }

    item.addEventListener("pointerup", finishDrag);
    item.addEventListener("pointercancel", finishDrag);
  }

  function initTabSorting() {
    var row = document.querySelector(".mark .tab");
    if (!row) return;
    applySavedTabOrder();
    row.querySelectorAll(".tab-item").forEach(function (item) {
      bindTabDrag(item, row);
    });
    if (row.dataset.bookmarkClickGuard !== "1") {
      row.dataset.bookmarkClickGuard = "1";
      row.addEventListener("click", function (event) {
        if (Date.now() >= suppressTabClickUntil) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      }, true);
    }
  }

  function restoreSelectedPanel(products, panels) {
    var resultPanel = products.querySelector("." + resultPanelClass);
    if (resultPanel) resultPanel.remove();

    var activeTab = document.querySelector(".mark .tab-item.active");
    var activeIndex = activeTab ? activeTab.getAttribute("data-nav-tab-index") : "0";
    var activePanel = products.querySelector(".mainCont[data-nav-tab-index='" + activeIndex + "']");

    panels.forEach(function (panel) {
      var selected = panel === activePanel;
      panel.classList.toggle("selected", selected);
      panel.style.display = selected ? "flex" : "none";
    });

    return activePanel || panels[0];
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
        var removeButton = resultCard.querySelector(".bookmark-custom-remove");
        if (removeButton) removeButton.remove();
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

  function setItemDialog(open) {
    var dialog = document.getElementById("bookmark-item-dialog");
    if (!dialog) return;
    if (itemDialogCloseTimer) {
      clearTimeout(itemDialogCloseTimer);
      itemDialogCloseTimer = 0;
    }
    if (open) {
      dialog.hidden = false;
      void dialog.offsetWidth;
      dialog.classList.add("is-visible");
      var sheet = dialog.querySelector(".bookmark-item-sheet");
      if (sheet) sheet.focus({ preventScroll: true });
      var nameInput = document.getElementById("bookmark-item-name");
      if (nameInput) nameInput.focus({ preventScroll: true });
      return;
    }
    dialog.classList.remove("is-visible");
    pendingItemPanel = null;
    itemDialogCloseTimer = setTimeout(function () {
      dialog.hidden = true;
      itemDialogCloseTimer = 0;
    }, 220);
  }

  function openItemDialog(panel) {
    var tab = getTabData(panel);
    var form = document.getElementById("bookmark-item-form");
    var subtitle = document.getElementById("bookmark-item-subtitle");
    var categoryRow = document.getElementById("bookmark-item-category-row");
    var categorySelect = document.getElementById("bookmark-item-category");
    if (!tab || !form || !subtitle || !categoryRow || !categorySelect) return;

    pendingItemPanel = panel;
    form.reset();
    subtitle.textContent = "添加到“" + tab.title + "”页面";
    categorySelect.replaceChildren();
    var categories = (tab.categories || []).filter(function (category) {
      return category && category !== "全部";
    });
    categories.forEach(function (category) {
      var option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
    categoryRow.hidden = categories.length === 0;
    setItemDialog(true);
  }

  function showBookmarkMessage(message, isError) {
    if (!window.iziToast) return;
    iziToast.show({
      timeout: 2200,
      class: "setting-toast",
      title: isError ? "无法保存" : "自定义收藏",
      message: message
    });
  }

  function saveCustomItem() {
    var tab = getTabData(pendingItemPanel);
    var name = String(document.getElementById("bookmark-item-name").value || "").trim().slice(0, 30);
    var url = normalizeWebUrl(document.getElementById("bookmark-item-url").value);
    var desc = String(document.getElementById("bookmark-item-desc").value || "").trim().slice(0, 80);
    var iconValue = String(document.getElementById("bookmark-item-icon").value || "").trim();
    var icon = iconValue ? normalizeWebUrl(iconValue) : "";
    var categoryRow = document.getElementById("bookmark-item-category-row");
    var category = categoryRow && !categoryRow.hidden
      ? String(document.getElementById("bookmark-item-category").value || "").trim()
      : "";
    if (!tab || !pendingItemPanel) return false;
    if (!name) {
      showBookmarkMessage("请填写网站名称", true);
      return false;
    }
    if (!url) {
      showBookmarkMessage("请输入正确的网址", true);
      return false;
    }
    if (iconValue && !icon) {
      showBookmarkMessage("请输入正确的图标网址", true);
      return false;
    }

    var items = getCustomItems();
    if (items.length >= customItemsLimit) {
      showBookmarkMessage("只能添加 " + customItemsLimit + " 个自定义收藏", true);
      return false;
    }
    var id = "bookmark-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    items.push({
      id: id,
      tabTitle: tab.title,
      name: name,
      url: url,
      desc: desc,
      icon: icon,
      category: category
    });
    if (!writeJson(customItemsKey, items)) {
      showBookmarkMessage("本机存储空间不足", true);
      return false;
    }
    var panel = pendingItemPanel;
    setItemDialog(false);
    syncPanelCustomItems(panel);
    scheduleFilter();
    showBookmarkMessage("已添加到“" + tab.title + "”");
    return true;
  }

  function setDeleteDialog(open) {
    var dialog = document.getElementById("bookmark-delete-dialog");
    if (!dialog) return;
    if (deleteDialogCloseTimer) {
      clearTimeout(deleteDialogCloseTimer);
      deleteDialogCloseTimer = 0;
    }
    if (open) {
      dialog.hidden = false;
      void dialog.offsetWidth;
      dialog.classList.add("is-visible");
      var sheet = dialog.querySelector(".settings-confirm-sheet");
      if (sheet) sheet.focus({ preventScroll: true });
      return;
    }
    dialog.classList.remove("is-visible");
    pendingDeleteId = "";
    deleteDialogCloseTimer = setTimeout(function () {
      dialog.hidden = true;
      deleteDialogCloseTimer = 0;
    }, 220);
  }

  function openDeleteDialog(id, name) {
    var description = document.getElementById("bookmark-delete-description");
    if (!description) return;
    pendingDeleteId = id;
    description.textContent = "“" + name + "”将在当前设备移除，此操作不能恢复。";
    setDeleteDialog(true);
  }

  function deleteCustomItem() {
    if (!pendingDeleteId) return;
    var id = pendingDeleteId;
    var item = getCustomItems().find(function (entry) {
      return entry.id === id;
    });
    var items = getCustomItems().filter(function (entry) {
      return entry.id !== id;
    });
    if (!writeJson(customItemsKey, items)) {
      showBookmarkMessage("删除失败，请稍后再试", true);
      return;
    }
    setDeleteDialog(false);
    syncAllCustomItems();
    scheduleFilter();
    showBookmarkMessage(item ? "已删除“" + item.name + "”" : "已删除自定义收藏");
  }

  document.addEventListener("input", function (event) {
    if (event.target && event.target.id === "bookmark-search-input") scheduleFilter();
  });
  document.addEventListener("click", function (event) {
    if (event.target && event.target.closest && event.target.closest("[data-bookmark-item-close]")) {
      event.preventDefault();
      setItemDialog(false);
      return;
    }
    if (event.target && event.target.closest && event.target.closest("[data-bookmark-delete-close]")) {
      event.preventDefault();
      setDeleteDialog(false);
      return;
    }
    if (event.target && event.target.closest && event.target.closest("#bookmark-delete-confirm")) {
      event.preventDefault();
      deleteCustomItem();
      return;
    }
    var close = event.target && event.target.closest && event.target.closest("#bookmark-close");
    if (!close) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof window.closeBox === "function") window.closeBox();
  });

  document.addEventListener("submit", function (event) {
    if (!event.target || event.target.id !== "bookmark-item-form") return;
    event.preventDefault();
    saveCustomItem();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var itemDialog = document.getElementById("bookmark-item-dialog");
    if (itemDialog && !itemDialog.hidden) {
      event.preventDefault();
      setItemDialog(false);
      return;
    }
    var deleteDialog = document.getElementById("bookmark-delete-dialog");
    if (deleteDialog && !deleteDialog.hidden) {
      event.preventDefault();
      setDeleteDialog(false);
    }
  });

  document.addEventListener("nav-sites-rendered", function (event) {
    initTabSorting();
    var index = event.detail && event.detail.index;
    if (Number.isFinite(index)) {
      syncPanelCustomItems(document.querySelector(".products .mainCont[data-nav-tab-index='" + index + "']"));
    } else {
      syncAllCustomItems();
    }
  });

  initTabSorting();
  syncAllCustomItems();

  window.scheduleBookmarkCenterFilter = scheduleFilter;
}());
