(function () {
  var filterFrame = 0;
  var resultPanelClass = "bookmark-search-results";
  var tabOrderKey = "sksir-bookmark-tab-order";
  var tabSortingEnabledKey = "sksir-bookmark-tab-sort-enabled";
  var cardOrderKey = "sksir-bookmark-card-order";
  var cardSortingEnabledKey = "sksir-bookmark-card-sort-enabled";
  var bookmarkCardSelector = ".quick, .quicks, .quickjl";
  var customItemsKey = "sksir-bookmark-custom-items";
  var deletedItemsKey = "sksir-bookmark-deleted-items";
  var customItemsLimit = 120;
  var suppressTabClickUntil = 0;
  var suppressCardClickUntil = 0;
  var itemDialogCloseTimer = 0;
  var deleteDialogCloseTimer = 0;
  var resetDialogCloseTimer = 0;
  var pendingItemPanel = null;
  var pendingDeleteId = "";
  var pendingDeleteKey = "";
  var pendingDeleteName = "";
  var resetDialogTrigger = null;
  var bookmarkQuickContextEntry = null;
  var bookmarkQuickContextTrigger = null;

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

  function getDeletedItemKeys() {
    var stored = readJson(deletedItemsKey, []);
    var seen = {};
    return Array.isArray(stored) ? stored.reduce(function (keys, key) {
      key = String(key || "").trim();
      if (key && !seen[key]) {
        seen[key] = true;
        keys.push(key);
      }
      return keys;
    }, []).slice(0, 300) : [];
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
      bookmarkKey: "custom:" + item.id,
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
    var deletedLookup = {};
    getDeletedItemKeys().forEach(function (key) {
      deletedLookup[key] = true;
    });
    container.querySelectorAll(bookmarkCardSelector).forEach(function (card) {
      if (deletedLookup[getCardKey(card)] && !card.classList.contains("bookmark-custom-card")) {
        card.remove();
      }
    });
    container.appendChild(createAddCard(panel, tab));
    initPanelCardSorting(panel);
    if (typeof window.loadDeferredNavIcons === "function") {
      window.loadDeferredNavIcons(panel);
    }
  }

  function syncAllCustomItems() {
    document.querySelectorAll(".products .mainCont[data-nav-tab-index]").forEach(syncPanelCustomItems);
  }

  function getCardOrders() {
    var stored = readJson(cardOrderKey, {});
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  }

  function getCardKey(card) {
    return String(card && card.getAttribute("data-bookmark-key") || "").trim();
  }

  function applySavedCardOrder(panel) {
    if (!panel || panel.classList.contains(resultPanelClass)) return;
    var container = panel.querySelector("[data-nav-items]");
    var tabTitle = panel.getAttribute("data-nav-tab-title") || "";
    var order = getCardOrders()[tabTitle];
    if (!container || !Array.isArray(order) || !order.length) return;

    var orderMap = {};
    order.forEach(function (key, index) {
      if (!Object.prototype.hasOwnProperty.call(orderMap, key)) orderMap[key] = index;
    });
    Array.prototype.slice.call(container.querySelectorAll(bookmarkCardSelector))
      .map(function (card, index) {
        return {
          card: card,
          index: index,
          savedIndex: Object.prototype.hasOwnProperty.call(orderMap, getCardKey(card))
            ? orderMap[getCardKey(card)]
            : Number.MAX_SAFE_INTEGER
        };
      })
      .sort(function (left, right) {
        return left.savedIndex - right.savedIndex || left.index - right.index;
      })
      .forEach(function (entry) {
        container.insertBefore(entry.card, container.querySelector(".bookmark-add-card"));
      });
  }

  function saveCardOrder(panel) {
    var container = panel && panel.querySelector("[data-nav-items]");
    var tabTitle = panel && panel.getAttribute("data-nav-tab-title");
    if (!container || !tabTitle) return;
    var order = Array.prototype.map.call(
      container.querySelectorAll(bookmarkCardSelector),
      getCardKey
    ).filter(Boolean);
    var stored = getCardOrders();
    stored[tabTitle] = order;
    writeJson(cardOrderKey, stored);
  }

  function isCardSortingEnabled() {
    return readJson(cardSortingEnabledKey, true) !== false;
  }

  function getCardDropTarget(cards, pointerX, pointerY) {
    var positions = cards.map(function (entry) {
      var rect = entry.getBoundingClientRect();
      return {
        entry: entry,
        rect: rect,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2
      };
    }).filter(function (position) {
      return position.rect.width > 0 && position.rect.height > 0;
    });
    if (!positions.length) return null;

    var hovered = positions.find(function (position) {
      return pointerX >= position.rect.left &&
        pointerX <= position.rect.right &&
        pointerY >= position.rect.top &&
        pointerY <= position.rect.bottom;
    });
    if (hovered) return hovered.entry;

    var rows = [];
    positions.forEach(function (position) {
      var row = rows[rows.length - 1];
      var tolerance = Math.max(10, position.rect.height * 0.46);
      if (!row || Math.abs(position.centerY - row.centerY) > tolerance) {
        rows.push({
          items: [position],
          centerY: position.centerY,
          top: position.rect.top,
          bottom: position.rect.bottom
        });
        return;
      }
      row.items.push(position);
      row.centerY = row.items.reduce(function (sum, item) {
        return sum + item.centerY;
      }, 0) / row.items.length;
      row.top = Math.min(row.top, position.rect.top);
      row.bottom = Math.max(row.bottom, position.rect.bottom);
    });
    rows.forEach(function (row) {
      row.items.sort(function (left, right) {
        return left.rect.left - right.rect.left;
      });
    });

    var firstRow = rows[0];
    var lastRow = rows[rows.length - 1];
    var edgeTolerance = Math.max(12, (lastRow.bottom - lastRow.top) * 0.34);
    if (pointerY < firstRow.top - edgeTolerance) return firstRow.items[0].entry;
    if (pointerY > lastRow.bottom + edgeTolerance) return null;

    var rowIndex = rows.length - 1;
    for (var index = 0; index < rows.length - 1; index += 1) {
      var boundary = (rows[index].centerY + rows[index + 1].centerY) / 2;
      if (pointerY < boundary) {
        rowIndex = index;
        break;
      }
    }

    var targetRow = rows[rowIndex];
    for (var itemIndex = 0; itemIndex < targetRow.items.length; itemIndex += 1) {
      if (pointerX < targetRow.items[itemIndex].centerX) {
        return targetRow.items[itemIndex].entry;
      }
    }
    var nextRow = rows[rowIndex + 1];
    return nextRow && nextRow.items.length ? nextRow.items[0].entry : null;
  }

  function bindCardDrag(card, panel) {
    if (!card || card.dataset.bookmarkCardDragBound === "1") return;
    card.dataset.bookmarkCardDragBound = "1";
    var container = card.parentNode;
    var startX = 0;
    var startY = 0;
    var pointerX = 0;
    var pointerY = 0;
    var grabOffsetX = 0;
    var grabOffsetY = 0;
    var moveFrame = 0;
    var dragging = false;
    var ghost = null;
    var placeholder = null;
    var placeholderPositioned = false;
    var dropBefore = null;

    function updatePointer(event) {
      var points = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : null;
      var point = points && points.length ? points[points.length - 1] : event;
      pointerX = point.clientX;
      pointerY = point.clientY;
      if (ghost) {
        ghost.style.transform = "translate3d(" + (pointerX - grabOffsetX) + "px," +
          (pointerY - grabOffsetY) + "px,0)";
      }
    }

    function updatePosition() {
      moveFrame = 0;
      if (!dragging || !placeholder) return;
      var products = panel.closest(".products");
      if (products) {
        var productsRect = products.getBoundingClientRect();
        if (pointerY < productsRect.top + 48) products.scrollTop -= 12;
        if (pointerY > productsRect.bottom - 48) products.scrollTop += 12;
      }

      var cards = Array.prototype.filter.call(
        container.querySelectorAll(bookmarkCardSelector),
        function (entry) {
          return window.getComputedStyle(entry).display !== "none";
        }
      );
      var before = getCardDropTarget(cards, pointerX, pointerY);
      var targetRect = before && before.getBoundingClientRect();
      var containerRect = container.getBoundingClientRect();
      dropBefore = before;
      if (!targetRect) {
        placeholder.hidden = true;
        return;
      }
      var nextTransform = "translate3d(" +
        (targetRect.left - containerRect.left + container.scrollLeft) + "px," +
        (targetRect.top - containerRect.top + container.scrollTop) + "px,0)";
      placeholder.style.width = targetRect.width + "px";
      placeholder.style.height = targetRect.height + "px";
      placeholder.style.transform = nextTransform;
      placeholder.hidden = false;
      if (!placeholderPositioned) {
        placeholder.style.transition = "none";
        void placeholder.offsetWidth;
        placeholder.style.transition = "transform 90ms cubic-bezier(0.22, 1, 0.36, 1)";
        placeholderPositioned = true;
      }
    }

    function schedulePosition(event) {
      updatePointer(event);
      if (!moveFrame) moveFrame = requestAnimationFrame(updatePosition);
    }

    function startDrag(event) {
      dragging = true;
      var rect = card.getBoundingClientRect();
      grabOffsetX = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      grabOffsetY = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
      card.classList.add("is-dragging");
      card.setAttribute("aria-grabbed", "true");
      container.classList.add("is-reordering");

      placeholder = document.createElement("span");
      placeholder.className = "bookmark-card-placeholder";
      placeholder.setAttribute("aria-hidden", "true");
      placeholder.hidden = true;
      placeholder.style.transition = "none";
      container.appendChild(placeholder);

      ghost = document.createElement("div");
      ghost.className = "bookmark-card-drag-ghost";
      var ghostLabel = document.createElement("span");
      var sourceLink = card.querySelector("a");
      var ghostName = sourceLink ? sourceLink.textContent.trim() : card.textContent.trim();
      var ghostMark = document.createElement("span");
      ghostMark.className = "bookmark-card-drag-mark";
      ghostMark.textContent = ghostName.slice(0, 1).toUpperCase();
      ghost.appendChild(ghostMark);
      ghostLabel.className = "bookmark-card-drag-label";
      ghostLabel.textContent = ghostName;
      ghost.appendChild(ghostLabel);
      var ghostWidth = Math.min(140, Math.max(112, rect.width * 0.78));
      var ghostHeight = Math.min(50, rect.height);
      ghost.style.width = ghostWidth + "px";
      ghost.style.height = ghostHeight + "px";
      grabOffsetX = Math.max(0, Math.min(ghostWidth,
        (event.clientX - rect.left) / rect.width * ghostWidth));
      grabOffsetY = Math.max(0, Math.min(ghostHeight,
        (event.clientY - rect.top) / rect.height * ghostHeight));
      document.body.appendChild(ghost);
      schedulePosition(event);
    }

    card.addEventListener("pointerdown", function (event) {
      if (event.button !== undefined && event.button !== 0) return;
      if (event.target.closest("button, input, select, textarea")) return;
      if (!isCardSortingEnabled()) return;
      startX = event.clientX;
      startY = event.clientY;
      dragging = false;
      card.setPointerCapture(event.pointerId);
    });

    card.addEventListener("pointermove", function (event) {
      if (!card.hasPointerCapture(event.pointerId)) return;
      if (!dragging && Math.hypot(event.clientX - startX, event.clientY - startY) < 4) return;
      if (!dragging) startDrag(event);
      event.preventDefault();
      schedulePosition(event);
    });

    card.addEventListener("pointerrawupdate", function (event) {
      if (!dragging || !card.hasPointerCapture(event.pointerId)) return;
      updatePointer(event);
    });

    function finishDrag(event) {
      if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
      if (!dragging) return;
      updatePointer(event);
      if (moveFrame) cancelAnimationFrame(moveFrame);
      moveFrame = 0;
      updatePosition();

      container.insertBefore(card, dropBefore || container.querySelector(".bookmark-add-card"));
      placeholder.remove();
      placeholder = null;
      dropBefore = null;
      card.classList.remove("is-dragging");
      card.removeAttribute("aria-grabbed");
      container.classList.remove("is-reordering");
      void container.offsetWidth;
      if (ghost) {
        ghost.style.boxShadow = "none";
        ghost.style.webkitBackdropFilter = "none";
        ghost.style.backdropFilter = "none";
        ghost.remove();
        ghost = null;
      }
      dragging = false;
      suppressCardClickUntil = Date.now() + 420;
      saveCardOrder(panel);
      card.classList.add("just-dropped");
      setTimeout(function () { card.classList.remove("just-dropped"); }, 280);
      event.preventDefault();
    }

    card.addEventListener("pointerup", finishDrag);
    card.addEventListener("pointercancel", finishDrag);
    card.addEventListener("dragstart", function (event) {
      event.preventDefault();
    });
  }

  function initPanelCardSorting(panel) {
    if (!panel || panel.dataset.navHydrated !== "1" || panel.classList.contains(resultPanelClass)) return;
    var container = panel.querySelector("[data-nav-items]");
    if (!container) return;
    var enabled = isCardSortingEnabled();
    container.classList.toggle("bookmark-card-sorting-enabled", enabled);
    var toggle = document.getElementById("bookmark-card-sort-enabled");
    if (toggle) toggle.checked = enabled;
    applySavedCardOrder(panel);
    container.querySelectorAll(bookmarkCardSelector).forEach(function (card) {
      bindCardDrag(card, panel);
    });
    if (container.dataset.bookmarkCardClickGuard !== "1") {
      container.dataset.bookmarkCardClickGuard = "1";
      container.addEventListener("click", function (event) {
        if (Date.now() >= suppressCardClickUntil) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      }, true);
    }
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

  function isTabSortingEnabled() {
    return readJson(tabSortingEnabledKey, false) === true;
  }

  function restoreDefaultTabOrder(row) {
    Array.prototype.slice.call(row.querySelectorAll(".tab-item"))
      .sort(function (left, right) {
        return Number(left.getAttribute("data-nav-tab-index")) -
          Number(right.getAttribute("data-nav-tab-index"));
      })
      .forEach(function (item) {
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
      if (!isTabSortingEnabled()) return;
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
    var enabled = isTabSortingEnabled();
    row.classList.toggle("bookmark-tab-sorting-enabled", enabled);
    if (enabled) {
      applySavedTabOrder();
    } else {
      restoreDefaultTabOrder(row);
    }
    var toggle = document.getElementById("bookmark-tab-sort-enabled");
    if (toggle) toggle.checked = enabled;
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

  function ensureBookmarkQuickContextMenu() {
    var menu = document.getElementById("bookmark-quick-context-menu");
    if (menu) return menu;
    menu = document.createElement("div");
    menu.id = "bookmark-quick-context-menu";
    menu.className = "bookmark-quick-context-menu";
    menu.hidden = true;
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "收藏操作");
    var addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "bookmark-quick-context-add";
    addButton.textContent = "添加到首页";
    addButton.setAttribute("role", "menuitem");
    menu.appendChild(addButton);
    var deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "bookmark-quick-context-delete";
    deleteButton.textContent = "删除收藏";
    deleteButton.setAttribute("role", "menuitem");
    menu.appendChild(deleteButton);
    document.body.appendChild(menu);
    return menu;
  }

  function closeBookmarkQuickContextMenu(restoreFocus) {
    var menu = document.getElementById("bookmark-quick-context-menu");
    if (!menu || menu.hidden) return;
    menu.classList.remove("is-visible");
    menu.hidden = true;
    bookmarkQuickContextEntry = null;
    if (restoreFocus && bookmarkQuickContextTrigger &&
      document.contains(bookmarkQuickContextTrigger)) {
      var link = bookmarkQuickContextTrigger.querySelector("a[href]");
      if (link) link.focus({ preventScroll: true });
    }
    bookmarkQuickContextTrigger = null;
  }

  function openBookmarkQuickContextMenu(event, card) {
    var link = card && card.querySelector("a[href]");
    if (!link) return;
    event.preventDefault();
    event.stopPropagation();
    var image = card.querySelector("img");
    var imageSource = image && (
      image.dataset.iconSrc ||
      (!image.classList.contains("error") ? image.src : "")
    );
    bookmarkQuickContextEntry = {
      name: link.textContent.trim() || link.href,
      url: link.href,
      icon: imageSource || "",
      desc: (card.querySelector(".quick-desc") || {}).textContent || "",
      key: getCardKey(card),
      customId: String(card.dataset.bookmarkCustomId || "")
    };
    bookmarkQuickContextTrigger = card;
    var menu = ensureBookmarkQuickContextMenu();
    menu.hidden = false;
    menu.classList.remove("is-visible");
    var gap = 8;
    var width = menu.offsetWidth;
    var height = menu.offsetHeight;
    menu.style.left = Math.max(gap,
      Math.min(event.clientX, document.documentElement.clientWidth - width - gap)) + "px";
    menu.style.top = Math.max(gap,
      Math.min(event.clientY, document.documentElement.clientHeight - height - gap)) + "px";
    void menu.offsetWidth;
    menu.classList.add("is-visible");
    var button = menu.querySelector("button");
    if (button) button.focus({ preventScroll: true });
  }

  function addContextBookmarkToQuickLaunch() {
    var entry = bookmarkQuickContextEntry;
    var trigger = bookmarkQuickContextTrigger;
    var focusTrigger = trigger && trigger.querySelector
      ? trigger.querySelector("a[href]")
      : null;
    closeBookmarkQuickContextMenu(false);
    if (!entry || !window.SksirQuickLaunchActions) {
      showBookmarkMessage("快捷入口暂时无法使用", true);
      return;
    }
    window.SksirQuickLaunchActions.addItem(entry, focusTrigger || trigger);
  }

  function openContextBookmarkDelete() {
    var entry = bookmarkQuickContextEntry;
    var trigger = bookmarkQuickContextTrigger;
    if (!entry || !entry.key) {
      closeBookmarkQuickContextMenu(false);
      return;
    }
    closeBookmarkQuickContextMenu(false);
    openDeleteDialog(entry.customId, entry.name, trigger, entry.key);
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
    pendingDeleteKey = "";
    pendingDeleteName = "";
    deleteDialogCloseTimer = setTimeout(function () {
      dialog.hidden = true;
      deleteDialogCloseTimer = 0;
    }, 220);
  }

  function openDeleteDialog(id, name, trigger, bookmarkKey) {
    var description = document.getElementById("bookmark-delete-description");
    if (!description) return;
    pendingDeleteId = String(id || "");
    pendingDeleteKey = String(bookmarkKey || (pendingDeleteId ? "custom:" + pendingDeleteId : ""));
    pendingDeleteName = String(name || "这个收藏");
    description.textContent = pendingDeleteId
      ? "“" + pendingDeleteName + "”将在当前设备移除，此操作不能恢复。"
      : "“" + pendingDeleteName + "”将在当前设备移除，可通过重置收藏中心恢复。";
    setDeleteDialog(true);
  }

  function deleteBookmarkItem() {
    if (!pendingDeleteId && !pendingDeleteKey) return;
    var id = pendingDeleteId;
    var key = pendingDeleteKey;
    var name = pendingDeleteName;
    if (id) {
      var items = getCustomItems().filter(function (entry) {
        return entry.id !== id;
      });
      if (!writeJson(customItemsKey, items)) {
        showBookmarkMessage("删除失败，请稍后再试", true);
        return;
      }
    } else {
      var deletedKeys = getDeletedItemKeys();
      if (deletedKeys.indexOf(key) === -1) deletedKeys.push(key);
      if (!writeJson(deletedItemsKey, deletedKeys.slice(0, 300))) {
        showBookmarkMessage("删除失败，请稍后再试", true);
        return;
      }
    }
    var orders = getCardOrders();
    Object.keys(orders).forEach(function (tabTitle) {
      if (!Array.isArray(orders[tabTitle])) return;
      orders[tabTitle] = orders[tabTitle].filter(function (itemKey) {
        return itemKey !== key;
      });
    });
    if (!writeJson(cardOrderKey, orders)) {
      showBookmarkMessage("删除失败，请稍后再试", true);
      return;
    }
    setDeleteDialog(false);
    syncAllCustomItems();
    scheduleFilter();
    showBookmarkMessage("已删除“" + name + "”");
  }

  function setBookmarkResetDialog(open, trigger) {
    var dialog = document.getElementById("bookmark-center-reset-dialog");
    if (!dialog) return;
    if (trigger) resetDialogTrigger = trigger;
    if (resetDialogCloseTimer) {
      clearTimeout(resetDialogCloseTimer);
      resetDialogCloseTimer = 0;
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
    resetDialogCloseTimer = setTimeout(function () {
      dialog.hidden = true;
      resetDialogCloseTimer = 0;
    }, 220);
    if (resetDialogTrigger && document.contains(resetDialogTrigger)) {
      resetDialogTrigger.focus({ preventScroll: true });
    }
  }

  function resetBookmarkCenter() {
    [
      customItemsKey,
      deletedItemsKey,
      cardOrderKey,
      cardSortingEnabledKey,
      tabOrderKey,
      tabSortingEnabledKey
    ].forEach(function (key) {
      if (window.SksirStorage) {
        window.SksirStorage.remove(key);
      } else {
        localStorage.removeItem(key);
      }
    });
    setBookmarkResetDialog(false);
    if (typeof window.renderNavSites === "function") {
      window.renderNavSites();
    } else {
      initTabSorting();
      syncAllCustomItems();
    }
    scheduleFilter();
    showBookmarkMessage("收藏中心已恢复默认内容和设置");
  }

  document.addEventListener("input", function (event) {
    if (event.target && event.target.id === "bookmark-search-input") scheduleFilter();
  });
  document.addEventListener("change", function (event) {
    if (!event.target) return;
    if (event.target.id === "bookmark-card-sort-enabled") {
      if (!writeJson(cardSortingEnabledKey, event.target.checked)) {
        event.target.checked = !event.target.checked;
        showBookmarkMessage("无法保存收藏内容拖动设置", true);
        return;
      }
      document.querySelectorAll(".products .mainCont[data-nav-hydrated='1']")
        .forEach(initPanelCardSorting);
      showBookmarkMessage(event.target.checked ? "已开启收藏内容拖动" : "已关闭收藏内容拖动");
      return;
    }
    if (event.target.id !== "bookmark-tab-sort-enabled") return;
    if (!writeJson(tabSortingEnabledKey, event.target.checked)) {
      event.target.checked = !event.target.checked;
      showBookmarkMessage("无法保存分类排序设置", true);
      return;
    }
    initTabSorting();
    if (!event.target.checked) {
      var tabRow = document.querySelector(".mark .tab");
      if (tabRow) saveTabOrder(tabRow);
    }
    showBookmarkMessage(event.target.checked ? "已开启分类标签拖动" : "已关闭分类标签拖动");
  });
  document.addEventListener("click", function (event) {
    var quickContextMenu = document.getElementById("bookmark-quick-context-menu");
    if (event.target && event.target.closest &&
      event.target.closest(".bookmark-quick-context-add")) {
      event.preventDefault();
      addContextBookmarkToQuickLaunch();
      return;
    }
    if (event.target && event.target.closest &&
      event.target.closest(".bookmark-quick-context-delete")) {
      event.preventDefault();
      openContextBookmarkDelete();
      return;
    }
    if (quickContextMenu && !quickContextMenu.hidden &&
      (!event.target.closest || !event.target.closest("#bookmark-quick-context-menu"))) {
      closeBookmarkQuickContextMenu(false);
    }
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
      deleteBookmarkItem();
      return;
    }
    if (event.target && event.target.closest && event.target.closest("[data-bookmark-reset-close]")) {
      event.preventDefault();
      setBookmarkResetDialog(false);
      return;
    }
    if (event.target && event.target.closest && event.target.closest("#bookmark-center-reset-confirm")) {
      event.preventDefault();
      resetBookmarkCenter();
      return;
    }
    var close = event.target && event.target.closest && event.target.closest("#bookmark-close");
    if (!close) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof window.closeBox === "function") window.closeBox();
  });

  document.addEventListener("contextmenu", function (event) {
    var card = event.target && event.target.closest &&
      event.target.closest(bookmarkCardSelector);
    if (!card || !card.closest(".products") || card.classList.contains("is-dragging")) return;
    openBookmarkQuickContextMenu(event, card);
  });

  document.addEventListener("submit", function (event) {
    if (!event.target || event.target.id !== "bookmark-item-form") return;
    event.preventDefault();
    saveCustomItem();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var quickContextMenu = document.getElementById("bookmark-quick-context-menu");
    if (quickContextMenu && !quickContextMenu.hidden) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeBookmarkQuickContextMenu(true);
      return;
    }
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
      return;
    }
    var resetDialog = document.getElementById("bookmark-center-reset-dialog");
    if (resetDialog && !resetDialog.hidden) {
      event.preventDefault();
      setBookmarkResetDialog(false);
    }
  }, true);

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

  window.addEventListener("storage", function (event) {
    if (event.key === tabSortingEnabledKey || event.key === tabOrderKey) initTabSorting();
    if (event.key === cardOrderKey || event.key === cardSortingEnabledKey) {
      document.querySelectorAll(".products .mainCont[data-nav-hydrated='1']").forEach(initPanelCardSorting);
    }
    if (event.key === deletedItemsKey && typeof window.renderNavSites === "function") {
      window.renderNavSites();
    }
  });

  window.scheduleBookmarkCenterFilter = scheduleFilter;
  window.SksirBookmarks = {
    openResetDialog: function (trigger) {
      setBookmarkResetDialog(true, trigger);
    },
    reset: resetBookmarkCenter
  };
}());
