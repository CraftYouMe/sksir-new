(function () {
  var pickerReady = false;

  function showMessage(message) {
    if (window.iziToast) iziToast.show({ message: message });
  }

  function setVisibility(element, visible) {
    if (element) element.style.display = visible ? "" : "none";
  }

  function getPreviewSource(config) {
    if (config.type === "2") return "https://api.dujin.org/bing/1920.php";
    if (config.type === "5") return config.path || "";
    return config.path && window.bg_img_pictures.indexOf(config.path) !== -1
      ? config.path
      : window.bg_img_pictures[0] || "";
  }

  function updatePreview(src, name) {
    var image = document.getElementById("wallpaper-preview-image");
    var label = document.getElementById("wallpaper-preview-name");
    if (image && src && image.getAttribute("src") !== src) image.src = src;
    if (label) label.textContent = name || "壁纸预看";
  }

  function updateSelectedOption(src) {
    document.querySelectorAll(".wallpaper-option").forEach(function (option) {
      var selected = option.getAttribute("data-wallpaper-src") === src;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function selectLibraryWallpaper(src, index, notify) {
    if (!src) return;
    var config = window.getBgImg();
    config.type = "1";
    config.path = src;
    window.setBgImg(config);
    var radio = document.getElementById("radio1");
    if (radio) radio.checked = true;
    setVisibility(document.getElementById("wallpaper_url"), false);
    setVisibility(document.getElementById("wallpaper-button"), false);
    updatePreview(src, "可选壁纸 " + (index + 1));
    updateSelectedOption(src);
    window.applyBgImg(src);
    var text = document.getElementById("wallpaper_text");
    if (text) text.textContent = "已选择可选壁纸，设置会自动保存在本机";
    if (notify) showMessage("壁纸已应用");
  }

  function initWallpaperPicker() {
    var grid = document.getElementById("wallpaper-library-grid");
    if (!grid || !Array.isArray(window.bg_img_pictures)) return;

    if (!pickerReady) {
      window.bg_img_pictures.forEach(function (src, index) {
        var option = document.createElement("button");
        var image = document.createElement("img");
        var number = document.createElement("span");
        option.type = "button";
        option.className = "wallpaper-option";
        option.setAttribute("data-wallpaper-src", src);
        option.setAttribute("aria-label", "选择壁纸 " + (index + 1));
        option.setAttribute("aria-pressed", "false");
        image.src = src;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        number.textContent = String(index + 1);
        option.appendChild(image);
        option.appendChild(number);
        grid.appendChild(option);
      });
      pickerReady = true;
    }

    var config = window.getBgImg();
    var src = getPreviewSource(config);
    var libraryIndex = window.bg_img_pictures.indexOf(src);
    var name = config.type === "2"
      ? "每日必应"
      : config.type === "5"
        ? "自定义壁纸"
        : "可选壁纸 " + ((libraryIndex < 0 ? 0 : libraryIndex) + 1);
    updatePreview(src, name);
    updateSelectedOption(config.type === "1" ? src : "");
  }

  function handleWallpaperType(input) {
    var type = input.value;
    var config = window.getBgImg();
    var text = document.getElementById("wallpaper_text");
    var urlRow = document.getElementById("wallpaper_url");
    var saveRow = document.getElementById("wallpaper-button");
    var urlInput = document.getElementById("wallpaper-url");
    config.type = type;

    if (type === "1") {
      var selected = config.path && window.bg_img_pictures.indexOf(config.path) !== -1
        ? config.path
        : window.bg_img_pictures[0];
      selectLibraryWallpaper(selected, Math.max(0, window.bg_img_pictures.indexOf(selected)), true);
    } else if (type === "2") {
      if (text) text.textContent = "显示必应每日一图，每天更新，刷新页面以生效 | API @ 缙哥哥";
      window.setBgImg(config);
      updatePreview(getPreviewSource(config), "每日必应");
      updateSelectedOption("");
      window.applyBgImg(getPreviewSource(config));
      showMessage("壁纸已应用");
    }

    if (type === "5") {
      if (text) text.textContent = "自定义壁纸地址，请输入正确地址，点击保存且刷新页面以生效";
      setVisibility(urlRow, true);
      setVisibility(saveRow, true);
      if (urlInput) urlInput.value = config.path || "";
    } else {
      setVisibility(urlRow, false);
      setVisibility(saveRow, false);
    }

    if (type === "4" && text) text.textContent = "暂未实现该功能";
  }

  function saveCustomWallpaper() {
    var input = document.getElementById("wallpaper-url");
    var url = String(input && input.value || "").trim();
    var pattern = /^https?:\/\/\S+\.(?:jpe?g|png|gif|webp|avif)(?:[?#]\S*)?$/i;
    if (!pattern.test(url)) {
      showMessage("请输入正确的链接");
      return;
    }
    var config = window.getBgImg();
    config.type = "5";
    config.path = url;
    window.setBgImg(config);
    updatePreview(url, "自定义壁纸");
    updateSelectedOption("");
    window.applyBgImg(url);
    showMessage("自定义壁纸已应用");
  }

  document.addEventListener("click", function (event) {
    var wallpaperOption = event.target.closest && event.target.closest(".wallpaper-option");
    if (wallpaperOption) {
      var src = wallpaperOption.getAttribute("data-wallpaper-src");
      var index = window.bg_img_pictures.indexOf(src);
      selectLibraryWallpaper(src, Math.max(0, index), true);
      return;
    }
    var typeInput = event.target.closest && event.target.closest(".set-wallpaper");
    if (typeInput) handleWallpaperType(typeInput);
    if (event.target.closest && event.target.closest(".wallpaper_save")) saveCustomWallpaper();
  });

  window.initWallpaperPicker = initWallpaperPicker;
}());
