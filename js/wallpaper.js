(function () {
  function showMessage(message) {
    if (window.iziToast) iziToast.show({ message: message });
  }

  function setVisibility(element, visible) {
    if (element) element.style.display = visible ? "" : "none";
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
      if (text) text.textContent = "随机显示一张预设壁纸，刷新页面以生效";
      window.setBgImg(config);
      showMessage("壁纸设置成功，刷新生效");
    } else if (type === "2") {
      if (text) text.textContent = "显示必应每日一图，每天更新，刷新页面以生效 | API @ 缙哥哥";
      window.setBgImg(config);
      showMessage("壁纸设置成功，刷新生效");
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
    showMessage("自定义壁纸设置成功，刷新生效");
  }

  document.addEventListener("click", function (event) {
    var typeInput = event.target.closest && event.target.closest(".set-wallpaper");
    if (typeInput) handleWallpaperType(typeInput);
    if (event.target.closest && event.target.closest(".wallpaper_save")) saveCustomWallpaper();
  });
}());
