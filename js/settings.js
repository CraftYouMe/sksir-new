(function () {
  function organize() {
    var dataHost = document.getElementById("settings-data-host");
    if (!dataHost || document.getElementById("settings-data-tools")) return;
    var card = document.createElement("div");
    var version = document.getElementById("app-version");
    card.id = "settings-data-tools";
    card.className = "from_row settings-data-tools";
    card.innerHTML = '<div class="from_row_content">' +
      '<div class="settings-data-summary">数据只在当前浏览器，支持导入和导出。</div>' +
      '<div class="settings-data-actions"><button type="button" id="settings-data-export" class="secondary">导出数据</button>' +
      '<button type="button" id="settings-data-import" class="secondary">导入数据</button>' +
      '<input type="file" id="settings-data-import-file" accept="application/json,.json" hidden>' +
      '<button type="button" id="settings-data-reset">重置本机数据</button></div></div>';
    dataHost.appendChild(card);
    var aboutVersion = document.getElementById("settings-about-version");
    if (aboutVersion) aboutVersion.textContent = version ? version.textContent : "";
  }

  var settingsGroups = {
    search: {
      tabs: [
        { page: "search", label: "搜索引擎" },
        { page: "search-behavior", label: "搜索行为" }
      ]
    },
    appearance: {
      tabs: [
        { page: "background", label: "背景" },
        { page: "performance", label: "动画" },
        { page: "theme", label: "主题" }
      ]
    },
    navigation: {
      tabs: [
        { page: "quick-launch", label: "快捷入口" }
      ]
    },
    about: {
      tabs: [
        { page: "about", label: "关于本站" },
        { page: "data", label: "数据管理" },
        { page: "changelog", label: "更新日志" }
      ]
    }
  };

  var changelogLoadPromise = null;
  var changelogTagLabels = {
    fix: "修复",
    new: "新增",
    improve: "改进",
    optimize: "优化"
  };

  function createTextElement(tagName, className, text) {
    var element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function renderChangelog() {
    var host = document.getElementById("settings-changelog");
    var data = window.SKSIR_CHANGELOG;
    if (!host || !data || !Array.isArray(data.entries)) return;

    var grouped = {};
    data.entries.forEach(function (entry) {
      if (!entry || !entry.date) return;
      if (!grouped[entry.date]) grouped[entry.date] = [];
      grouped[entry.date].push(entry);
    });

    var timeline = document.createDocumentFragment();
    Object.keys(grouped).forEach(function (date, dateIndex) {
      var group = document.createElement("section");
      group.className = "changelog-day";
      var dateHead = document.createElement("header");
      dateHead.className = "changelog-date";
      var dateValue = new Date(date + "T00:00:00");
      var formatted = Number.isNaN(dateValue.getTime())
        ? date
        : new Intl.DateTimeFormat("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "short"
        }).format(dateValue);
      dateHead.appendChild(createTextElement("time", "", formatted));
      dateHead.appendChild(createTextElement("span", "", grouped[date].length + " 项更新"));
      group.appendChild(dateHead);

      grouped[date].forEach(function (entry) {
        var item = document.createElement("article");
        item.className = "changelog-entry";
        var marker = document.createElement("span");
        marker.className = "changelog-marker";
        marker.setAttribute("aria-hidden", "true");
        item.appendChild(marker);

        var card = document.createElement("div");
        card.className = "changelog-card";
        var heading = document.createElement("div");
        heading.className = "changelog-entry-head";
        heading.appendChild(createTextElement("h4", "", entry.summary || "使用体验更新"));
        var tags = document.createElement("div");
        tags.className = "changelog-tags";
        (entry.tags || ["improve"]).forEach(function (tag) {
          if (!changelogTagLabels[tag]) return;
          tags.appendChild(createTextElement("span", "changelog-tag is-" + tag, changelogTagLabels[tag]));
        });
        heading.appendChild(tags);
        card.appendChild(heading);

        if (Array.isArray(entry.details) && entry.details.length) {
          var detailList = document.createElement("ul");
          entry.details.forEach(function (detail) {
            detailList.appendChild(createTextElement("li", "", detail));
          });
          card.appendChild(detailList);
        }
        card.appendChild(createTextElement("span", "changelog-commit", entry.hash || ""));
        item.appendChild(card);
        group.appendChild(item);
      });
      if (dateIndex === 0) group.classList.add("is-latest");
      timeline.appendChild(group);
    });
    host.replaceChildren(timeline);
  }

  function showChangelogError() {
    var host = document.getElementById("settings-changelog");
    if (!host) return;
    var error = createTextElement("div", "changelog-error", "更新日志暂时无法加载，请稍后再试。");
    host.replaceChildren(error);
  }

  function loadChangelog() {
    if (window.SKSIR_CHANGELOG) {
      renderChangelog();
      return Promise.resolve();
    }
    if (changelogLoadPromise) return changelogLoadPromise;
    changelogLoadPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "./data/changelog.js";
      script.async = true;
      script.onload = function () {
        if (!window.SKSIR_CHANGELOG) {
          reject(new Error("Changelog data is unavailable"));
          return;
        }
        renderChangelog();
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    }).catch(function () {
      changelogLoadPromise = null;
      showChangelogError();
    });
    return changelogLoadPromise;
  }

  function showSettingsPage(page) {
    document.querySelectorAll("[data-settings-panel]").forEach(function (panel) {
      var selected = panel.getAttribute("data-settings-panel") === page;
      panel.classList.toggle("selected", selected);
      panel.style.display = selected ? "flex" : "none";
    });
    var content = document.querySelector(".set .productss");
    if (content) content.scrollTop = 0;
    if (page === "changelog") loadChangelog();
  }

  function renderSettingsTabs(config) {
    var tabList = document.getElementById("settings-page-tabs");
    if (!tabList) return;
    var fragment = document.createDocumentFragment();
    config.tabs.forEach(function (tab, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "settings-page-tab" + (index === 0 ? " is-active" : "");
      button.setAttribute("data-settings-page", tab.page);
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      button.textContent = tab.label;
      fragment.appendChild(button);
    });
    tabList.replaceChildren(fragment);
  }

  function showSettingsGroup(group) {
    var config = settingsGroups[group];
    if (!config) return;
    document.querySelectorAll("[data-settings-group]").forEach(function (item) {
      item.classList.toggle("is-active", item.getAttribute("data-settings-group") === group);
    });
    renderSettingsTabs(config);
    showSettingsPage(config.tabs[0].page);
  }

  function exportData() {
    var storage = {};
    for (var index = 0; index < localStorage.length; index += 1) {
      var key = localStorage.key(index);
      if (key && (key.indexOf("sksir-") === 0 || key === "bg_img_last_src")) {
        storage[key] = localStorage.getItem(key);
      }
    }
    var payload = {
      exportedAt: new Date().toISOString(),
      localStorage: storage,
      cookies: {
        se_list: Cookies.get("se_list") || "",
        se_default: Cookies.get("se_default") || "",
        bg_img: Cookies.get("bg_img") || ""
      }
    };
    var link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    link.download = "sksir-settings.json";
    link.click();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 0);
  }

  function resetData() {
    if (!window.confirm("确定重置本机设置？")) return;
    Object.keys(localStorage).forEach(function (key) {
      if (key.indexOf("sksir-") === 0 || key === "bg_img_last_src") localStorage.removeItem(key);
    });
    ["se_list", "se_default", "bg_img"].forEach(function (key) { Cookies.remove(key); });
    window.location.reload();
  }

  function importData(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var payload;
      try {
        payload = JSON.parse(reader.result);
      } catch (error) {
        iziToast.show({ timeout: 2400, message: "无法读取此配置文件" });
        return;
      }
      if (!payload || typeof payload.localStorage !== "object" || typeof payload.cookies !== "object") {
        iziToast.show({ timeout: 2400, message: "配置文件格式不正确" });
        return;
      }
      if (!window.confirm("导入会覆盖同名本机设置，是否继续？")) return;
      Object.keys(payload.localStorage).forEach(function (key) {
        if (key.indexOf("sksir-") === 0 || key === "bg_img_last_src") {
          localStorage.setItem(key, String(payload.localStorage[key]));
        }
      });
      ["se_list", "se_default", "bg_img"].forEach(function (key) {
        if (typeof payload.cookies[key] === "string") {
          Cookies.set(key, payload.cookies[key], { expires: 36500 });
        }
      });
      window.location.reload();
    };
    reader.readAsText(file);
  }

  function engineField(name) {
    return document.querySelector(".se_add_content input[name='" + name + "']");
  }

  function showEngineEditor(show) {
    document.querySelector(".se_list").style.display = show ? "none" : "";
    document.querySelector(".se_add_preinstall").style.display = show ? "none" : "";
    document.querySelector(".se_add_content").style.display = show ? "" : "none";
  }

  function confirmToast(message, action) {
    iziToast.show({
      timeout: 8000,
      message: message,
      buttons: [
        ["<button>确认</button>", function (instance, toast) {
          action();
          instance.hide({ transitionOut: "flipOutX" }, toast, "buttonName");
        }, true],
        ["<button>取消</button>", function (instance, toast) {
          instance.hide({ transitionOut: "flipOutX" }, toast, "buttonName");
        }]
      ]
    });
  }

  function refreshEngines() {
    setSeInit();
    seList();
  }

  function writeEngine(key, originalKey, engine) {
    var engines = getSeList();
    if (originalKey && originalKey !== key) delete engines[originalKey];
    engines[key] = engine;
    setSeList(engines);
    refreshEngines();
    showEngineEditor(false);
  }

  function saveEngine() {
    var originalKey = engineField("key_inhere").value;
    var key = engineField("key").value;
    var title = engineField("title").value.trim();
    var url = window.SksirSearchEngines.normalizeHttpUrl(engineField("url").value);
    var name = engineField("name").value.trim();
    var engine = {
      title: title,
      url: url,
      name: name,
      icon: "iconfont icon-wangluo"
    };
    if (!/^\+?[1-9][0-9]*$/.test(key)) {
      iziToast.show({ timeout: 2000, message: "序号 " + key + " 不是正整数" });
      return;
    }
    if (!title || !name) {
      iziToast.show({ timeout: 2000, message: "名称和字段名不能为空" });
      return;
    }
    if (!url) {
      iziToast.show({ timeout: 2000, message: "网址请用 http 或 https" });
      return;
    }
    if (getSeList()[key] && key !== originalKey) {
      confirmToast("搜索引擎 " + key + " 已有数据，是否覆盖？", function () {
        writeEngine(key, originalKey, engine);
        iziToast.show({ message: "覆盖成功" });
      });
      return;
    }
    writeEngine(key, originalKey, engine);
    iziToast.show({ timeout: 2000, message: "添加成功" });
  }

  function editEngine(key) {
    var engine = getSeList()[key];
    if (!engine) return;
    engineField("key_inhere").value = key;
    engineField("key").value = key;
    engineField("title").value = engine.title;
    engineField("url").value = engine.url;
    engineField("name").value = engine.name;
    showEngineEditor(true);
  }

  window.SksirSettingsOwnsSearchEngines = true;

  document.addEventListener("click", function (event) {
    var primaryItem = event.target.closest("[data-settings-group]");
    if (primaryItem) {
      showSettingsGroup(primaryItem.getAttribute("data-settings-group"));
      return;
    }
    var pageItem = event.target.closest("[data-settings-page]");
    if (pageItem) {
      document.querySelectorAll("[data-settings-page]").forEach(function (item) {
        var active = item === pageItem;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
      });
      showSettingsPage(pageItem.getAttribute("data-settings-page"));
      return;
    }
    var jumpItem = event.target.closest("[data-settings-jump]");
    if (jumpItem) {
      showSettingsGroup("navigation");
      showSettingsPage(jumpItem.getAttribute("data-settings-jump"));
      return;
    }
    if (event.target.closest(".settings-open-bookmarks")) {
      closeSet();
      openBox();
      return;
    }
    if (event.target.closest("#settings-data-export")) exportData();
    if (event.target.closest("#settings-data-import")) {
      document.getElementById("settings-data-import-file").click();
    }
    if (event.target.closest("#settings-data-reset")) resetData();
    var defaultButton = event.target.closest(".set_se_default");
    if (defaultButton) {
      event.preventDefault();
      if (setDefaultSearchEngine(defaultButton.value)) {
        iziToast.show({
          timeout: 1800,
          class: "setting-toast",
          title: "搜索设置",
          message: "\u5df2\u7acb\u5373\u5207\u6362\u9ed8\u8ba4\u641c\u7d22\u5f15\u64ce"
        });
      }
      return;
    }
    if (event.target.closest(".set_se_list_add")) {
      document.querySelectorAll(".se_add_content input").forEach(function (input) { input.value = ""; });
      showEngineEditor(true);
      return;
    }
    if (event.target.closest(".se_add_save")) {
      saveEngine();
      return;
    }
    if (event.target.closest(".se_add_cancel")) {
      showEngineEditor(false);
      return;
    }
    var editButton = event.target.closest(".edit_se");
    if (editButton) {
      editEngine(editButton.value);
      return;
    }
    var deleteButton = event.target.closest(".delete_se");
    if (deleteButton) {
      var key = deleteButton.value;
      if (key === getSeDefault()) {
        iziToast.show({ message: "默认搜索引擎不可删除" });
      } else {
        confirmToast("搜索引擎 " + key + " 是否删除？", function () {
          var engines = getSeList();
          delete engines[key];
          setSeList(engines);
          refreshEngines();
          iziToast.show({ message: "删除成功" });
        });
      }
      return;
    }
    if (event.target.closest(".set_se_list_preinstall")) {
      confirmToast("现有搜索引擎数据将被清空", function () {
        localStorage.removeItem("sksir-search-engine-order");
        localStorage.removeItem("sksir-search-engine-hidden");
        setSeList(se_list_preinstall);
        Cookies.set("se_default", 1, { expires: 36500 });
        setSeInit();
        iziToast.show({ message: "重置成功" });
        setTimeout(function () { window.location.reload(); }, 1000);
      });
    }
  });

  document.addEventListener("change", function (event) {
    if (event.target.id === "settings-data-import-file") {
      importData(event.target.files && event.target.files[0]);
      event.target.value = "";
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      organize();
      showSettingsGroup("search");
    }, { once: true });
  } else {
    organize();
    showSettingsGroup("search");
  }
}());
