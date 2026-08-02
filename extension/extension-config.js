(function () {
  "use strict";

  var assetVersion = "__LOCAL_ASSET_VERSION__";
  var assetRoot = "./assets/oss/" + assetVersion + "/";

  window.sksirExtension = true;
  var extensionRoot = document.documentElement;
  extensionRoot.setAttribute("data-sksir-extension", "true");
  extensionRoot.classList.add("sksir-extension-starting");
  window.sksirAssetBase = "./";
  window.sksirApiBase = "https://sksir.top";
  window.sksirApiUrl = function (path) {
    return window.sksirApiBase + "/" + String(path || "").replace(/^\/+/, "");
  };
  window.sksirIconFallback = "./img/icon/fangdiu.png";
  window.sksirWallpaperPictures = [
    assetRoot + "icon/background1.webp",
    assetRoot + "icon/background-image2.webp",
    assetRoot + "icon/background-image3.webp",
    assetRoot + "icon/background-image4.webp",
    assetRoot + "icon/background-image5.webp",
    assetRoot + "icon/background-image6.webp"
  ];
  window.sksirDefaultWallpaper = window.sksirWallpaperPictures[0];
  window.sksirWallpaperAssetBase = assetRoot + "wallpaper/responsive/";

  function releaseStartupTransition() {
    extensionRoot.classList.remove("sksir-extension-starting");
  }

  window.setTimeout(releaseStartupTransition, 780);

  function ensureBundledDefaultWallpaper() {
    var image = document.getElementById("bg");
    if (!image || image.getAttribute("src")) return;
    var mobile = window.matchMedia && window.matchMedia("(max-width: 720px)").matches;
    var suffix = mobile ? "-mobile.webp" : "-desktop.webp";
    image.classList.remove("error");
    image.setAttribute("data-wallpaper-source", window.sksirDefaultWallpaper);
    image.addEventListener("load", function () {
      image.classList.remove("error");
      image.classList.add("is-loaded");
    }, { once: true });
    image.src = window.sksirWallpaperAssetBase + "background1" + suffix;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var image = document.getElementById("bg");
    if (image && window.MutationObserver) {
      var observer = new MutationObserver(function () {
        if (image.getAttribute("data-wallpaper-source") !== window.sksirDefaultWallpaper) return;
        image.classList.remove("error");
        if (image.naturalWidth > 0) image.classList.add("is-loaded");
      });
      observer.observe(image, { attributes: true, attributeFilter: ["class", "src", "data-wallpaper-source"] });
    }

    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      ensureBundledDefaultWallpaper();
      if (attempts >= 10) window.clearInterval(timer);
    }, 500);
  }, { once: true });
}());
