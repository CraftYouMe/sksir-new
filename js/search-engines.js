(function () {
  "use strict";
  // Keep the UI subset's template-literal marker: `

  var cookieOptions = { expires: 36500 };
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

  // 设置搜索引擎列表
  function setList(engines) {
    if (!engines) return false;
    Cookies.set("se_list", engines, cookieOptions);
    return true;
  }

  // 获取搜索引擎列表
  function getList() {
    var stored = Cookies.get("se_list");
    if (stored && stored !== "{}") {
      try {
        var parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length) return parsed;
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

  // 搜索引擎列表加载
  function renderPicker() {
    var container = document.querySelector(".search-engine-list");
    if (!container) return;
    var fragment = document.createDocumentFragment();
    var engines = getList();
    Object.keys(engines).forEach(function (key) {
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

  function createActionButton(className, value, iconName) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.value = value;
    button.appendChild(createIcon("iconfont " + iconName));
    return button;
  }

  // 设置-搜索引擎列表加载
  function renderSettings() {
    var container = document.querySelector(".se_list_table");
    if (!container) return;
    var fragment = document.createDocumentFragment();
    var engines = getList();
    var selected = getValidDefault(engines);
    Object.keys(engines).forEach(function (key) {
      var row = document.createElement("div");
      var number = document.createElement("div");
      var name = document.createElement("div");
      var actions = document.createElement("div");
      row.className = "se_list_div";
      number.className = "se_list_num";
      if (key === selected) number.appendChild(createIcon("iconfont icon-home"));
      else number.textContent = key;
      name.className = "se_list_name";
      name.textContent = engines[key].title;
      actions.className = "se_list_button";
      var defaultButton = createActionButton("set_se_default", key, "icon-home");
      var deleteButton = createActionButton("delete_se", key, "icon-delete");
      defaultButton.style.borderRadius = "8px 0 0 8px";
      deleteButton.style.borderRadius = "0 8px 8px 0";
      actions.appendChild(defaultButton);
      actions.appendChild(createActionButton("edit_se", key, "icon-xiugai"));
      actions.appendChild(deleteButton);
      row.append(number, name, actions);
      fragment.appendChild(row);
    });
    container.replaceChildren(fragment);
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
