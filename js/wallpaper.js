(function () {
  var customStorageKey = "sksir-custom-wallpapers";
  var dailySourceKey = "sksir-wallpaper-daily-source";
  var dailyApiKey = "sksir-wallpaper-daily-api";
  var bingUrl = "https://api.dujin.org/bing/1920.php";
  var activeWallpaper = null;

  function showMessage(message) {
    if (window.iziToast) iziToast.show({ timeout: 2200, message: message });
  }

  function readCustomWallpapers() {
    try {
      var items = JSON.parse(localStorage.getItem(customStorageKey) || "[]");
      return Array.isArray(items) ? items.filter(function (item) {
        return item && typeof item.src === "string" && item.src;
      }).slice(0, 12) : [];
    } catch (error) {
      return [];
    }
  }

  function writeCustomWallpapers(items) {
    localStorage.setItem(customStorageKey, JSON.stringify(items.slice(0, 12)));
  }

  function getDailySource() {
    var source = localStorage.getItem(dailySourceKey) || "bing";
    var customUrl = localStorage.getItem(dailyApiKey) || "";
    return source === "custom" && customUrl ? customUrl : bingUrl;
  }

  function getPreviewSource(config) {
    if (config.type === "2") {
      return config.path && window.bg_img_pictures.indexOf(config.path) === -1
        ? config.path
        : getDailySource();
    }
    if (config.type === "5") return config.path || "";
    return config.path && window.bg_img_pictures.indexOf(config.path) !== -1
      ? config.path
      : window.bg_img_pictures[0] || "";
  }

  function readActiveWallpaper() {
    var config = window.getBgImg();
    return {
      src: getPreviewSource(config),
      type: String(config.type || "1")
    };
  }

  function isActiveWallpaper(item) {
    return !!activeWallpaper &&
      activeWallpaper.src === item.src &&
      activeWallpaper.type === String(item.type);
  }

  function applyWallpaper(src, type, name) {
    if (!src) return;
    var config = window.getBgImg();
    config.type = String(type);
    config.path = src;
    window.setBgImg(config);
    window.applyBgImg(src);
    activeWallpaper = readActiveWallpaper();
    renderWallpapers();
    showMessage("壁纸已应用");
  }

  function createWallpaperCard(item) {
    var card = document.createElement("article");
    var button = document.createElement("button");
    var image = document.createElement("img");
    card.className = "wallpaper-option";
    card.classList.toggle("is-selected", isActiveWallpaper(item));
    card.setAttribute("data-wallpaper-src", item.src);
    button.type = "button";
    button.className = "wallpaper-option-select";
    button.setAttribute("aria-label", "应用" + item.name);
    image.src = item.src;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    button.appendChild(image);
    card.appendChild(button);
    if (item.removable) {
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "wallpaper-option-remove";
      remove.setAttribute("aria-label", "删除" + item.name);
      remove.textContent = "删除";
      card.appendChild(remove);
    }
    card._wallpaperItem = item;
    return card;
  }

  function renderGrid(grid, items, emptyText) {
    if (!grid) return;
    grid.replaceChildren();
    if (!items.length) {
      var mineEmpty = document.createElement("div");
      mineEmpty.className = "wallpaper-empty";
      mineEmpty.textContent = emptyText;
      grid.appendChild(mineEmpty);
    } else {
      items.forEach(function (item) { grid.appendChild(createWallpaperCard(item)); });
    }
  }

  function renderWallpapers() {
    activeWallpaper = readActiveWallpaper();
    renderGrid(document.getElementById("wallpaper-featured-grid"), window.bg_img_pictures.map(function (src, index) {
      return { src: src, name: "精选壁纸 " + (index + 1), type: "1" };
    }), "暂无精选壁纸");
    updateDailyCard();
    renderGrid(document.getElementById("wallpaper-mine-grid"), readCustomWallpapers(),
      "还没有自己的壁纸，点击“添加壁纸”进行添加。");
  }

  function setAddDialogOpen(open) {
    var dialog = document.getElementById("wallpaper-add-dialog");
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      return;
    }
    if (!open && dialog.open) dialog.close();
  }

  function activeAddMode() {
    var active = document.querySelector("[data-wallpaper-add-mode].is-active");
    return active ? active.getAttribute("data-wallpaper-add-mode") : "local";
  }

  function addRemoteWallpaper(mode) {
    var input = document.getElementById(mode === "oss" ? "wallpaper-oss-url" : "wallpaper-url");
    var url = String(input && input.value || "").trim();
    if (!/^https?:\/\/\S+$/i.test(url)) return showMessage("请输入正确的图片地址");
    saveCustomWallpaper({ src: url, name: mode === "oss" ? "OSS 壁纸" : "URL 壁纸", type: "5", removable: true });
  }

  function saveCustomWallpaper(item) {
    var items = readCustomWallpapers().filter(function (existing) { return existing.src !== item.src; });
    items.unshift(item);
    try {
      writeCustomWallpapers(items);
    } catch (error) {
      showMessage("图片过大，浏览器本机存储空间不足");
      return;
    }
    setAddDialogOpen(false);
    renderWallpapers();
    showMessage("壁纸已添加");
  }

  function addLocalWallpaper() {
    var input = document.getElementById("wallpaper-local-file");
    var file = input && input.files && input.files[0];
    if (!file) return showMessage("请先选择一张图片");
    if (!/^image\//.test(file.type)) return showMessage("请选择图片文件");
    if (file.size > 4 * 1024 * 1024) return showMessage("本地图片不能超过 4 MB");
    var reader = new FileReader();
    reader.onload = function () {
      saveCustomWallpaper({ src: reader.result, name: file.name || "本地壁纸", type: "5", removable: true });
    };
    reader.onerror = function () { showMessage("无法读取这张图片"); };
    reader.readAsDataURL(file);
  }

  function applyDailyWallpaper() {
    var select = document.getElementById("wallpaper-daily-source");
    var input = document.getElementById("wallpaper-daily-api");
    var source = select ? select.value : "bing";
    var url = String(input && input.value || "").trim();
    if (source === "custom" && !/^https?:\/\/\S+$/i.test(url)) return showMessage("请输入正确的 API 地址");
    localStorage.setItem(dailySourceKey, source);
    if (source === "custom") localStorage.setItem(dailyApiKey, url);
    applyWallpaper(source === "custom" ? url : bingUrl, "2", source === "custom" ? "每日壁纸 · 其他 API" : "每日壁纸 · 必应");
  }

  function updateDailyCard() {
    var card = document.querySelector(".wallpaper-daily-card");
    var image = document.getElementById("wallpaper-daily-image");
    var title = document.getElementById("wallpaper-daily-title");
    var description = document.getElementById("wallpaper-daily-description");
    var select = document.getElementById("wallpaper-daily-source");
    var input = document.getElementById("wallpaper-daily-api");
    var source = select ? select.value : (localStorage.getItem(dailySourceKey) || "bing");
    var customUrl = String(input && input.value || "").trim();
    var src = source === "custom" && /^https?:\/\/\S+$/i.test(customUrl) ? customUrl : bingUrl;
    if (image && image.getAttribute("src") !== src) image.src = src;
    if (title) title.textContent = source === "custom" ? "自定义每日壁纸" : "必应每日壁纸";
    if (description) description.textContent = source === "custom"
      ? "使用你的图片接口，点击切换。"
      : "每天一张精选图片，点击切换。";
    if (card) card.classList.toggle("is-selected", isActiveWallpaper({ src: src, type: "2" }));
    var state = document.querySelector(".wallpaper-daily-state");
    if (state) state.textContent = card && card.classList.contains("is-selected") ? "当前壁纸" : "点击切换";
  }

  function initWallpaperPicker() {
    activeWallpaper = readActiveWallpaper();
    var sourceSelect = document.getElementById("wallpaper-daily-source");
    var apiInput = document.getElementById("wallpaper-daily-api");
    var savedSource = localStorage.getItem(dailySourceKey) || "bing";
    if (sourceSelect) sourceSelect.value = savedSource;
    if (apiInput) {
      apiInput.value = localStorage.getItem(dailyApiKey) || "";
      apiInput.hidden = savedSource !== "custom";
    }
    renderWallpapers();
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest && event.target.closest(".wallpaper-add")) {
      return setAddDialogOpen(true);
    }
    if (event.target.closest && event.target.closest(".wallpaper-add-cancel")) {
      return setAddDialogOpen(false);
    }
    var mode = event.target.closest && event.target.closest("[data-wallpaper-add-mode]");
    if (mode) {
      var modeName = mode.getAttribute("data-wallpaper-add-mode");
      document.querySelectorAll("[data-wallpaper-add-mode]").forEach(function (button) { button.classList.toggle("is-active", button === mode); });
      document.querySelectorAll("[data-wallpaper-add-pane]").forEach(function (pane) { pane.classList.toggle("is-active", pane.getAttribute("data-wallpaper-add-pane") === modeName); });
      return;
    }
    if (event.target.closest && event.target.closest(".wallpaper-add-confirm")) {
      return activeAddMode() === "local" ? addLocalWallpaper() : addRemoteWallpaper(activeAddMode());
    }
    if (event.target.closest && event.target.closest(".wallpaper-daily-cover")) {
      return applyDailyWallpaper();
    }
    var card = event.target.closest && event.target.closest(".wallpaper-option");
    if (!card) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    var item = card._wallpaperItem;
    if (event.target.closest(".wallpaper-option-remove")) {
      writeCustomWallpapers(readCustomWallpapers().filter(function (entry) { return entry.src !== item.src; }));
      renderWallpapers();
      return showMessage("已删除壁纸");
    }
    applyWallpaper(item.src, item.type, item.name);
  });

  document.addEventListener("change", function (event) {
    if (event.target.id === "wallpaper-daily-source") {
      var apiInput = document.getElementById("wallpaper-daily-api");
      if (apiInput) apiInput.hidden = event.target.value !== "custom";
      updateDailyCard();
    }
  });

  document.addEventListener("input", function (event) {
    if (event.target.id === "wallpaper-daily-api") updateDailyCard();
  });

  document.addEventListener("keydown", function (event) {
    var dialog = document.getElementById("wallpaper-add-dialog");
    var key = event.key || event.keyCode;
    if (!dialog || !dialog.open || (key !== "Escape" && key !== "Esc" && key !== "ESC" && key !== 27)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setAddDialogOpen(false);
  }, true);

  var addDialog = document.getElementById("wallpaper-add-dialog");
  if (addDialog) {
    addDialog.addEventListener("click", function (event) {
      if (event.target === addDialog) setAddDialogOpen(false);
    });
  }

  window.initWallpaperPicker = initWallpaperPicker;
}());
