(function () {
  "use strict";

  function isRemoteIcon(source) {
    return /^https?:\/\//i.test(String(source || ""));
  }

  function getLocalFallback() {
    return window.sksirIconFallback || "./img/icon/fangdiu.png";
  }

  function load(image, source) {
    if (!image || !source) return;
    image.src = isRemoteIcon(source) ? getLocalFallback() : source;
  }

  window.SksirIconCache = {
    load: load,
    clear: function () { return Promise.resolve(false); }
  };
}());
