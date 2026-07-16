(function () {
  var data = window.NAV_SITES || {};
  var tabs = Array.isArray(data.tabs) ? data.tabs : [];
  var iconFallback = data.iconFallback || "./img/icon/fangdiu.png";
  var deferredHydrationScheduled = false;

  function appendText(parent, text) {
    parent.appendChild(document.createTextNode(text || ""));
  }

  function createDiv(className, text) {
    var div = document.createElement("div");
    if (className) div.className = className;
    if (typeof text === "string") div.textContent = text;
    return div;
  }

  function setBooleanDataAttr(element, name, value) {
    if (value === undefined || value === null || value === false) return;
    element.setAttribute(name, value === true ? "true" : String(value));
  }

  function createStatusTools() {
    var tools = createDiv("status-actions");
    var button = document.createElement("button");
    button.className = "status-check-btn";
    button.type = "button";
    button.title = "检测当前显示的网站状态";

    var label = document.createElement("span");
    label.className = "status-check-text";
    label.textContent = "检测状态";

    button.appendChild(label);
    tools.appendChild(button);
    return tools;
  }

  function createCategoryTools(tab) {
    var tools = createDiv("category-tools");
    var rowClass = "category-row";
    if (tab.categoryRowClass) rowClass += " " + tab.categoryRowClass;

    var row = createDiv(rowClass);
    row.setAttribute("role", "group");
    (tab.categories || []).forEach(function (category, index) {
      var item = createDiv("category-item" + (index === 0 ? " active" : ""), category);
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", index === 0 ? "0" : "-1");
      item.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      row.appendChild(item);
    });

    tools.appendChild(row);
    if (tab.statusCheck) tools.appendChild(createStatusTools());
    return tools;
  }

  function createLock(lock) {
    var passcode = createDiv("passcode");
    var input = document.createElement("input");
    input.type = lock.inputType || "password";
    input.placeholder = lock.placeholder || "";
    input.id = lock.inputId || "passInput";

    var button = document.createElement("button");
    button.id = lock.buttonId || "passBtn";
    button.type = "button";
    button.textContent = lock.buttonText || "开启";

    passcode.appendChild(input);
    passcode.appendChild(button);
    return passcode;
  }

  function createIcon(src, name) {
    var img = document.createElement("img");
    var isRemoteIcon = /^https?:\/\//i.test(src);

    img.className = "iconcss";
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.setAttribute("fetchpriority", "low");
    img.src = isRemoteIcon ? iconFallback : src;
    if (isRemoteIcon) {
      img.dataset.iconSrc = src;
      img.classList.add("iconcss-pending");
    }

    img.addEventListener("error", function () {
      if (img.dataset.fallbackApplied === "1" || img.src.indexOf(iconFallback) !== -1) {
        img.classList.add("error");
        img.alt = name || "";
        return;
      }
      img.dataset.fallbackApplied = "1";
      img.src = iconFallback;
    });

    return img;
  }

  function loadDeferredNavIcons(root, options) {
    var scope = root && root.querySelectorAll ? root : document;
    var icons = Array.prototype.filter.call(
      scope.querySelectorAll("img[data-icon-src]"),
      function (img) {
        if (img.dataset.iconLoadScheduled === "1") return false;
        img.dataset.iconLoadScheduled = "1";
        return true;
      }
    );
    var batchSize = options && options.batchSize ? options.batchSize : icons.length;
    var batchDelay = options && options.batchDelay ? options.batchDelay : 0;

    function loadBatch() {
      icons.splice(0, batchSize).forEach(function (img) {
        var src = img.dataset.iconSrc;
        delete img.dataset.iconLoadScheduled;
        if (!src) return;

        img.dataset.fallbackApplied = "";
        img.classList.remove("error", "iconcss-pending");
        delete img.dataset.iconSrc;
        img.src = src;
      });

      if (icons.length) {
        setTimeout(loadBatch, batchDelay);
      }
    }

    loadBatch();
  }

  function createCard(item) {
    var card = createDiv(item.className || "quicks");
    if (item.category) card.dataset.category = item.category;
    if (item.searchKey) card.dataset.s = item.searchKey;
    if (Object.prototype.hasOwnProperty.call(item, "title")) card.title = item.title || "";

    var link = document.createElement("a");
    link.href = item.url || "#";
    link.target = item.target || "_blank";
    link.rel = item.rel || "noopener noreferrer";
    if (Object.prototype.hasOwnProperty.call(item, "linkTitle")) link.title = item.linkTitle || "";
    setBooleanDataAttr(link, "data-favorite-check", item.favoriteCheck);
    setBooleanDataAttr(link, "data-skip-check", item.skipCheck);

    if (item.icon) link.appendChild(createIcon(item.icon, item.name));
    appendText(link, item.icon ? " " + item.name : item.name);

    card.appendChild(link);
    if (item.desc) {
      var desc = document.createElement("span");
      desc.className = "quick-desc";
      desc.textContent = item.desc;
      card.appendChild(desc);
    }
    return card;
  }

  function hydratePanelItems(panel) {
    if (!panel || panel.dataset.navHydrated === "1") return false;

    var index = parseInt(panel.dataset.navTabIndex || "0", 10);
    var tab = tabs[index];
    var container = panel.querySelector("[data-nav-items]");
    if (!tab || !container) return false;

    (tab.items || []).forEach(function (item) {
      container.appendChild(createCard(item));
    });

    panel.dataset.navHydrated = "1";
    panel.removeAttribute("data-nav-lazy-panel");
    return true;
  }

  function ensureNavPanelRendered(target) {
    var panel = typeof target === "number"
      ? document.querySelector(".products .mainCont[data-nav-tab-index='" + target + "']")
      : target;

    if (!panel) return false;

    var hydrated = hydratePanelItems(panel);
    if (hydrated) {
      document.dispatchEvent(new CustomEvent("nav-sites-rendered", {
        detail: {
          phase: "panel",
          index: parseInt(panel.dataset.navTabIndex || "0", 10)
        }
      }));
    }
    return hydrated;
  }

  function requestIdleTask(callback, timeout) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: timeout || 1800 });
    } else {
      setTimeout(callback, timeout || 900);
    }
  }

  function hydrateNextDeferredPanel() {
    var panel = document.querySelector(".products .mainCont[data-nav-lazy-panel='true']");
    if (!panel) return;

    ensureNavPanelRendered(panel);

    if (document.querySelector(".products .mainCont[data-nav-lazy-panel='true']")) {
      requestIdleTask(hydrateNextDeferredPanel, 500);
    }
  }

  function scheduleDeferredPanelHydration() {
    if (deferredHydrationScheduled) return;
    deferredHydrationScheduled = true;

    var run = function () {
      requestIdleTask(hydrateNextDeferredPanel, 1800);
    };

    if (document.readyState === "complete") {
      run();
    } else {
      window.addEventListener("load", run, { once: true });
    }
  }

  function renderNavSites() {
    var tabRoot = document.querySelector("[data-nav-tabs]");
    var productRoot = document.querySelector("[data-nav-products]");
    if (!tabRoot || !productRoot) return;

    tabRoot.textContent = "";
    productRoot.textContent = "";
    tabRoot.setAttribute("role", "tablist");

    var selectedIndex = 0;
    tabs.some(function (tab, index) {
      if (!tab.selected) return false;
      selectedIndex = index;
      return true;
    });

    tabs.forEach(function (tab, index) {
      var isSelected = index === selectedIndex;
      var tabItem = createDiv("tab-item" + (isSelected ? " active" : ""), tab.title);
      var tabId = "nav-tab-" + index;
      var panelId = "nav-panel-" + index;

      tabItem.id = tabId;
      tabItem.setAttribute("role", "tab");
      tabItem.setAttribute("tabindex", isSelected ? "0" : "-1");
      tabItem.setAttribute("aria-selected", isSelected ? "true" : "false");
      tabItem.setAttribute("aria-controls", panelId);
      tabRoot.appendChild(tabItem);

      var panel = createDiv("mainCont" + (isSelected ? " selected" : ""));
      panel.id = panelId;
      panel.dataset.navTabIndex = index;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabId);
      panel.setAttribute("aria-hidden", isSelected ? "false" : "true");
      if (Array.isArray(tab.categories) && tab.categories.length) {
        panel.appendChild(createCategoryTools(tab));
      }
      if (tab.lock) panel.appendChild(createLock(tab.lock));

      var container = createDiv(tab.containerClass || "quick-alls");
      container.setAttribute("data-nav-items", "");
      if (tab.containerStyle) container.setAttribute("style", tab.containerStyle);

      panel.appendChild(container);
      if (isSelected) {
        hydratePanelItems(panel);
      } else {
        panel.dataset.navLazyPanel = "true";
      }
      productRoot.appendChild(panel);
    });

    scheduleDeferredPanelHydration();
    document.dispatchEvent(new CustomEvent("nav-sites-rendered", {
      detail: {
        phase: "initial"
      }
    }));
  }

  window.renderNavSites = renderNavSites;
  window.loadDeferredNavIcons = loadDeferredNavIcons;
  window.ensureNavPanelRendered = ensureNavPanelRendered;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderNavSites, { once: true });
  } else {
    renderNavSites();
  }
})();
