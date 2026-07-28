(function () {
  var customStorageKey = "sksir-custom-wallpapers";
  var dailySourceKey = "sksir-wallpaper-daily-source";
  var dailyApiKey = "sksir-wallpaper-daily-api";
  var bingUrl = "https://api.dujin.org/bing/1920.php";
  var activeCategory = "featured";
  var previewItem = null;

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

  function updatePreview(src, name) {
    var image = document.getElementById("wallpaper-preview-image");
    var label = document.getElementById("wallpaper-preview-name");
    if (image && src && image.getAttribute("src") !== src) image.src = src;
    if (label) label.textContent = name || "当前壁纸";
  }

  function currentSource() {
    return getPreviewSource(window.getBgImg());
  }

  function applyWallpaper(src, type, name) {
    if (!src) return;
    var config = window.getBgImg();
    config.type = type;
    config.path = src;
    window.setBgImg(config);
    window.applyBgImg(src);
    previewItem = { src: src, type: type, name: name };
    updatePreview(src, name);
    renderCategory();
    showMessage("壁纸已应用");
  }

  function createWallpaperCard(item) {
    var card = document.createElement("article");
    var button = document.createElement("button");
    var image = document.createElement("img");
    var actions = document.createElement("div");
    var preview = document.createElement("button");
    var apply = document.createElement("button");
    card.className = "wallpaper-option";
    card.classList.toggle("is-selected", !!previewItem && previewItem.src === item.src);
    card.classList.toggle("is-applied", currentSource() === item.src);
    card.setAttribute("data-wallpaper-src", item.src);
    button.type = "button";
    button.className = "wallpaper-option-select";
    button.setAttribute("aria-label", "应用" + item.name);
    image.src = item.src;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    button.appendChild(image);
    actions.className = "wallpaper-option-actions";
    preview.type = "button";
    preview.className = "wallpaper-option-preview";
    preview.textContent = "预览";
    apply.type = "button";
    apply.className = "wallpaper-option-apply";
    apply.textContent = "应用";
    actions.appendChild(preview);
    actions.appendChild(apply);
    if (item.removable) {
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "wallpaper-option-remove";
      remove.textContent = "删除";
      actions.appendChild(remove);
    }
    var name = document.createElement("span");
    name.className = "wallpaper-option-name";
    name.textContent = item.name;
    card.append(button, name, actions);
    card._wallpaperItem = item;
    return card;
  }

  function categoryItems() {
    if (activeCategory === "featured") {
      return window.bg_img_pictures.map(function (src, index) {
        return { src: src, name: "精选壁纸 " + (index + 1), type: "1" };
      });
    }
    if (activeCategory === "daily") {
      return [{ src: getDailySource(), name: "每日壁纸", type: "2" }];
    }
    if (activeCategory === "mine") return readCustomWallpapers();
    return [];
  }

  function renderCategory() {
    var grid = document.getElementById("wallpaper-library-grid");
    var dailySettings = document.querySelector(".wallpaper-daily-settings");
    if (!grid) return;
    grid.replaceChildren();
    var items = categoryItems();
    if (activeCategory === "dynamic") {
      var empty = document.createElement("div");
      empty.className = "wallpaper-empty";
      empty.innerHTML = "<strong>动态壁纸即将推出</strong><span>已预留独立分类，后续可接入视频或实时渲染壁纸。</span>";
      grid.appendChild(empty);
    } else if (!items.length) {
      var mineEmpty = document.createElement("div");
      mineEmpty.className = "wallpaper-empty";
      mineEmpty.innerHTML = "<strong>还没有自己的壁纸</strong><span>点击“添加壁纸”，从本地、URL 或 OSS 添加。</span>";
      grid.appendChild(mineEmpty);
    } else {
      items.forEach(function (item) { grid.appendChild(createWallpaperCard(item)); });
    }
    if (dailySettings) dailySettings.hidden = activeCategory !== "daily";
  }

  function switchCategory(category) {
    activeCategory = category;
    document.querySelectorAll("[data-wallpaper-category]").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-wallpaper-category") === category);
    });
    renderCategory();
  }

  function openAddDialog() {
    var dialog = document.getElementById("wallpaper-add-dialog");
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
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
    var dialog = document.getElementById("wallpaper-add-dialog");
    if (dialog) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
    activeCategory = "mine";
    switchCategory("mine");
    previewItem = item;
    updatePreview(item.src, item.name);
    renderCategory();
    showMessage("壁纸已添加，预览后可选择应用");
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

  function initWallpaperPicker() {
    var config = window.getBgImg();
    var name = config.type === "2" ? "每日壁纸" : config.type === "5" ? "我的壁纸" : "精选壁纸";
    previewItem = { src: getPreviewSource(config), type: config.type, name: name };
    updatePreview(previewItem.src, name);
    var sourceSelect = document.getElementById("wallpaper-daily-source");
    var apiInput = document.getElementById("wallpaper-daily-api");
    var savedSource = localStorage.getItem(dailySourceKey) || "bing";
    if (sourceSelect) sourceSelect.value = savedSource;
    if (apiInput) {
      apiInput.value = localStorage.getItem(dailyApiKey) || "";
      apiInput.hidden = savedSource !== "custom";
    }
    renderCategory();
  }

  document.addEventListener("click", function (event) {
    var category = event.target.closest && event.target.closest("[data-wallpaper-category]");
    if (category) return switchCategory(category.getAttribute("data-wallpaper-category"));
    if (event.target.closest && event.target.closest(".wallpaper-add")) return openAddDialog();
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
    if (event.target.closest && event.target.closest(".wallpaper-daily-apply")) return applyDailyWallpaper();
    var card = event.target.closest && event.target.closest(".wallpaper-option");
    if (!card) return;
    var item = card._wallpaperItem;
    if (event.target.closest(".wallpaper-option-remove")) {
      writeCustomWallpapers(readCustomWallpapers().filter(function (entry) { return entry.src !== item.src; }));
      renderCategory();
      return showMessage("已删除壁纸");
    }
    if (event.target.closest(".wallpaper-option-apply")) {
      return applyWallpaper(item.src, item.type, item.name);
    }
    previewItem = item;
    updatePreview(item.src, item.name);
    renderCategory();
    var text = document.getElementById("wallpaper_text");
    if (text) text.textContent = "正在预览“" + item.name + "”，点击卡片上的“应用”后才会更换首页壁纸。";
  });

  document.addEventListener("change", function (event) {
    if (event.target.id === "wallpaper-daily-source") {
      var apiInput = document.getElementById("wallpaper-daily-api");
      if (apiInput) apiInput.hidden = event.target.value !== "custom";
    }
  });

  window.initWallpaperPicker = initWallpaperPicker;
}());
