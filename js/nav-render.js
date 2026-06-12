(function () {
  var data = window.NAV_SITES || {};
  var tabs = Array.isArray(data.tabs) ? data.tabs : [];
  var iconFallback = data.iconFallback || "./img/icon/fangdiu.png";

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
    (tab.categories || []).forEach(function (category, index) {
      var item = createDiv("category-item" + (index === 0 ? " active" : ""), category);
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

  function loadDeferredNavIcons(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var icons = scope.querySelectorAll("img[data-icon-src]");

    Array.prototype.forEach.call(icons, function (img) {
      var src = img.dataset.iconSrc;
      if (!src) return;

      img.dataset.fallbackApplied = "";
      img.classList.remove("error", "iconcss-pending");
      delete img.dataset.iconSrc;
      img.src = src;
    });
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

  function renderNavSites() {
    var tabRoot = document.querySelector("[data-nav-tabs]");
    var productRoot = document.querySelector("[data-nav-products]");
    if (!tabRoot || !productRoot) return;

    tabRoot.textContent = "";
    productRoot.textContent = "";

    tabs.forEach(function (tab, index) {
      var isSelected = tab.selected || index === 0;
      tabRoot.appendChild(createDiv("tab-item" + (isSelected ? " active" : ""), tab.title));

      var panel = createDiv("mainCont" + (isSelected ? " selected" : ""));
      if (Array.isArray(tab.categories) && tab.categories.length) {
        panel.appendChild(createCategoryTools(tab));
      }
      if (tab.lock) panel.appendChild(createLock(tab.lock));

      var container = createDiv(tab.containerClass || "quick-alls");
      if (tab.containerStyle) container.setAttribute("style", tab.containerStyle);
      (tab.items || []).forEach(function (item) {
        container.appendChild(createCard(item));
      });

      panel.appendChild(container);
      productRoot.appendChild(panel);
    });

    document.dispatchEvent(new CustomEvent("nav-sites-rendered"));
  }

  window.renderNavSites = renderNavSites;
  window.loadDeferredNavIcons = loadDeferredNavIcons;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderNavSites, { once: true });
  } else {
    renderNavSites();
  }
})();
