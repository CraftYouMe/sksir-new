(function () {
  "use strict";
  // Keep the UI subset's template-literal marker: `

  var cookieOptions = { expires: 36500 };
  var orderStorageKey = "sksir-search-engine-order";
  var hiddenStorageKey = "sksir-search-engine-hidden";
  // 默认搜索引擎列表
  var preset = {
    "1": { id: 1, title: "百度", url: "https://www.baidu.com/s", name: "wd", icon: "iconfont icon-baidu" },
    "2": { id: 2, title: "必应", url: "https://cn.bing.com/search?q=%s&go=&form=QBLH&qs=n&sk=", name: "q", icon: "iconfont icon-bing" },
    "3": { id: 3, title: "谷歌", url: "https://www.google.com/search", name: "q", icon: "iconfont icon-google" },
    "4": { id: 4, title: "搜狗", url: "https://www.sogou.com/web", name: "query", icon: "iconfont icon-sougousousuo" },
    "5": { id: 5, title: "360", url: "https://www.so.com/s", name: "q", icon: "iconfont icon-360sousuo" },
    "6": { id: 6, title: "微博", url: "https://s.weibo.com/weibo", name: "q", icon: "iconfont icon-xinlangweibo" },
    "7": { id: 7, title: "知乎", url: "https://www.zhihu.com/search", name: "q", icon: "iconfont icon-zhihu" },
    "8": { id: 8, title: "Github", url: "https://github.com/search", name: "q", icon: "iconfont icon-github" },
    "9": { id: 9, title: "BiliBili", url: "https://search.bilibili.com/all", name: "keyword", icon: "iconfont icon-bilibilidonghua" },
    "10": { id: 10, title: "淘宝", url: "https://s.taobao.com/search", name: "q", icon: "iconfont icon-taobao" },
    "11": { id: 11, title: "京东", url: "https://search.jd.com/Search", name: "keyword", icon: "iconfont icon-jingdong" }
  };
  var aliases = {
    baidu: "1", bing: "2", google: "3", sogou: "4", so: "5", "360": "5",
    weibo: "6", zhihu: "7", github: "8", bilibili: "9", taobao: "10", jd: "11"
  };

  function normalizeHttpUrl(value) {
    var raw = String(value || "").trim();
    if (!raw) return "";
    try {
      var parsed = new URL(raw);
      return parsed.protocol === "http:" || parsed.protocol === "https:" ? raw : "";
    } catch (error) {
      return "";
    }
  }

  function sanitizeList(engines) {
    var safe = {};
    if (!engines || typeof engines !== "object") return safe;
    Object.keys(engines).forEach(function (key, index) {
      var engine = engines[key];
      var url = engine && normalizeHttpUrl(engine.url);
      if (!url) return;
      safe[key] = {
        id: engine.id,
        title: String(engine.title || url),
        url: url,
        name: String(engine.name || "q"),
        icon: String(engine.icon || "iconfont icon-wangluo")
      };
    });
    return safe;
  }

  // 设置搜索引擎列表
  function setList(engines) {
    if (!engines) return false;
    Cookies.set("se_list", sanitizeList(engines), cookieOptions);
    return true;
  }

  // 获取搜索引擎列表
  function getList() {
    var stored = Cookies.get("se_list");
    if (stored && stored !== "{}") {
      try {
        var parsed = JSON.parse(stored);
        var sanitized = sanitizeList(parsed);
        if (Object.keys(sanitized).length) {
          if (JSON.stringify(parsed) !== JSON.stringify(sanitized)) setList(sanitized);
          return sanitized;
        }
      } catch (error) {
        // Invalid legacy data falls back to the built-in list below.
      }
    }
    setList(preset);
    return preset;
  }

  function normalizeDefault(value) {
    return aliases[value] || value || "2";
  }

  // 获得默认搜索引擎
  function getDefault() {
    var stored = Cookies.get("se_default");
    var normalized = normalizeDefault(stored || "2");
    if (stored && stored !== normalized) Cookies.set("se_default", normalized, cookieOptions);
    return normalized;
  }

  function getValidDefault(engines) {
    var selected = getDefault();
    if (engines[selected]) return selected;
    var fallback = engines["2"] ? "2" : Object.keys(engines)[0];
    if (fallback) Cookies.set("se_default", fallback, cookieOptions);
    return fallback;
  }

  function createIcon(className) {
    var icon = document.createElement("i");
    icon.className = className;
    return icon;
  }

  function readStoredKeys(storageKey) {
    try {
      var value = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(value) ? value.map(String) : [];
    } catch (error) {
      return [];
    }
  }

  function orderedKeys(engines) {
    var keys = Object.keys(engines);
    var stored = readStoredKeys(orderStorageKey);
    return stored.filter(function (key) { return keys.indexOf(key) !== -1; })
      .concat(keys.filter(function (key) { return stored.indexOf(key) === -1; }));
  }

  function writeOrder(keys) {
    localStorage.setItem(orderStorageKey, JSON.stringify(keys));
  }

  function isHidden(key) {
    return readStoredKeys(hiddenStorageKey).indexOf(String(key)) !== -1;
  }

  function toggleHidden(key) {
    var hidden = readStoredKeys(hiddenStorageKey);
    var index = hidden.indexOf(String(key));
    if (index === -1) hidden.push(String(key));
    else hidden.splice(index, 1);
    localStorage.setItem(hiddenStorageKey, JSON.stringify(hidden));
    renderSettings();
    renderPicker();
  }

  // 搜索引擎列表加载
  function renderPicker() {
    var container = document.querySelector(".search-engine-list");
    if (!container) return;
    var fragment = document.createDocumentFragment();
    var engines = getList();
    orderedKeys(engines).forEach(function (key) {
      if (isHidden(key)) return;
      var engine = engines[key];
      var item = document.createElement("div");
      var label = document.createElement("a");
      var title = document.createElement("span");
      item.className = "se-li";
      item.dataset.url = engine.url;
      item.dataset.name = engine.name;
      item.dataset.icon = engine.icon;
      label.className = "se-li-text";
      label.appendChild(createIcon(engine.icon));
      title.textContent = engine.title;
      label.appendChild(title);
      item.appendChild(label);
      fragment.appendChild(item);
    });
    container.replaceChildren(fragment);
  }

  function createActionButton(className, value, iconName, label) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.value = value;
    button.title = label;
    button.setAttribute("aria-label", label);
    button.appendChild(createIcon("iconfont " + iconName));
    var text = document.createElement("span");
    text.className = "se-action-text";
    text.textContent = label;
    button.appendChild(text);
    return button;
  }

  // 设置-搜索引擎列表加载
  function renderSettings() {
    var container = document.querySelector(".se_list_table");
    if (!container) return;
    var list = container.closest(".se_list");
    var savedScrollTop = list ? list.scrollTop : 0;
    var fragment = document.createDocumentFragment();
    var engines = getList();
    var selected = getValidDefault(engines);
    orderedKeys(engines).forEach(function (key) {
      var row = document.createElement("div");
      var icon = createIcon(engines[key].icon);
      var details = document.createElement("div");
      var name = document.createElement("strong");
      var domain = document.createElement("span");
      row.className = "se_list_div se-engine-card";
      row.setAttribute("data-engine-key", key);
      row.setAttribute("title", "点击设为默认，右键管理");
      row.draggable = true;
      row.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (suppressCardClick) return;
        setDefaultEngine(key);
      });
      icon.classList.add("se-engine-card-icon");
      details.className = "se-engine-card-details";
      name.textContent = engines[key].title;
      try {
        domain.textContent = new URL(engines[key].url).hostname.replace(/^www\./, "");
      } catch (error) {
        domain.textContent = "";
      }
      if (key === selected) {
        row.classList.add("is-default");
        var defaultBadge = document.createElement("span");
        defaultBadge.className = "se-default-badge";
        defaultBadge.textContent = "默认";
        row.appendChild(defaultBadge);
      }
      if (isHidden(key)) {
        var hiddenBadge = document.createElement("span");
        hiddenBadge.className = "se-hidden-badge";
        hiddenBadge.textContent = "已隐藏";
        row.appendChild(hiddenBadge);
      }
      details.append(name, domain);
      row.append(icon, details);
      fragment.appendChild(row);
    });
    var addCard = document.createElement("button");
    addCard.type = "button";
    addCard.className = "se-engine-card se-engine-add-card set_se_list_add";
    addCard.innerHTML = '<span aria-hidden="true">+</span><strong>自定义搜索引擎</strong><small>添加新的搜索服务</small>';
    fragment.appendChild(addCard);
    container.replaceChildren(fragment);
    if (list) list.scrollTop = savedScrollTop;
  }

  function contextMenu() {
    var menu = document.getElementById("se-engine-context-menu");
    if (menu) return menu;
    menu = document.createElement("div");
    menu.id = "se-engine-context-menu";
    menu.className = "se-engine-context-menu";
    menu.hidden = true;
    document.body.appendChild(menu);
    return menu;
  }

  if (document.addEventListener) {
  document.addEventListener("contextmenu", function (event) {
    var card = event.target.closest(".se-engine-card[data-engine-key]");
    if (!card) return;
    event.preventDefault();
    var key = card.getAttribute("data-engine-key");
    var menu = contextMenu();
    menu.innerHTML =
      '<button type="button" class="edit_se" value="' + key + '">编辑</button>' +
      '<button type="button" class="toggle_se_hidden" value="' + key + '">' + (isHidden(key) ? "取消隐藏" : "隐藏") + '</button>' +
      '<button type="button" class="delete_se danger" value="' + key + '">删除</button>';
    menu.style.left = Math.min(event.clientX, window.innerWidth - 170) + "px";
    menu.style.top = Math.min(event.clientY, window.innerHeight - 180) + "px";
    menu.hidden = false;
  });

  var suppressCardClick = false;
  document.addEventListener("click", function (event) {
    var hideButton = event.target.closest(".toggle_se_hidden");
    if (hideButton) toggleHidden(hideButton.value);
    var menu = document.getElementById("se-engine-context-menu");
    if (menu) menu.hidden = true;
  });

  var draggedEngineKey = "";
  document.addEventListener("dragstart", function (event) {
    var card = event.target.closest(".se-engine-card[data-engine-key]");
    if (!card) return;
    draggedEngineKey = card.getAttribute("data-engine-key");
    suppressCardClick = true;
    card.classList.add("is-dragging");
  });
  document.addEventListener("dragend", function (event) {
    var card = event.target.closest(".se-engine-card");
    if (card) card.classList.remove("is-dragging");
    draggedEngineKey = "";
    setTimeout(function () { suppressCardClick = false; }, 0);
  });
  document.addEventListener("dragover", function (event) {
    if (draggedEngineKey && event.target.closest(".se-engine-card[data-engine-key]")) event.preventDefault();
  });
  document.addEventListener("drop", function (event) {
    var target = event.target.closest(".se-engine-card[data-engine-key]");
    if (!target || !draggedEngineKey) return;
    event.preventDefault();
    var keys = orderedKeys(getList()).filter(function (key) { return key !== draggedEngineKey; });
    var targetIndex = keys.indexOf(target.getAttribute("data-engine-key"));
    keys.splice(Math.max(0, targetIndex), 0, draggedEngineKey);
    writeOrder(keys);
    renderSettings();
    renderPicker();
  });
  }

  function setDefaultEngine(value) {
    var key = normalizeDefault(value);
    if (!getList()[key]) {
      iziToast.show({
        timeout: 2200,
        class: "setting-toast",
        title: "\u641c\u7d22\u8bbe\u7f6e",
        message: "\u672a\u627e\u5230\u8fd9\u4e2a\u641c\u7d22\u5f15\u64ce"
      });
      return false;
    }
    Cookies.set("se_default", key, cookieOptions);
    renderSettings();
    if (typeof window.searchData === "function") window.searchData();
    renderPicker();
    return true;
  }

  window.SksirSearchEngines = {
    preset: preset,
    getList: getList,
    setList: setList,
    getDefault: getDefault,
    getValidDefault: getValidDefault,
    setDefault: setDefaultEngine,
    normalizeHttpUrl: normalizeHttpUrl,
    renderPicker: renderPicker,
    renderSettings: renderSettings
  };
  window.se_list_preinstall = preset;
  window.getSeList = getList;
  window.setSeList = setList;
  window.getSeDefault = getDefault;
  window.normalizeSeDefault = normalizeDefault;
  window.getValidSeDefault = getValidDefault;
  window.setDefaultSearchEngine = setDefaultEngine;
  window.seList = renderPicker;
  window.setSeInit = renderSettings;
}());
