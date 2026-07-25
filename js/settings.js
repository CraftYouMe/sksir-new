(function () {
  function organize() {
    var host = document.getElementById("quick-launch-settings-host");
    var quickSettings = document.querySelector(".quick-launch-settings");
    if (host && quickSettings && quickSettings.parentNode !== host) host.appendChild(quickSettings);

    var performanceRows = document.querySelector(".mainConts:nth-child(3) .performance-settings-block .froms");
    if (!performanceRows || document.getElementById("settings-data-tools")) return;
    var card = document.createElement("div");
    var version = document.getElementById("app-version");
    card.id = "settings-data-tools";
    card.className = "from_row settings-data-tools";
    card.innerHTML = '<div class="from_row_content"><div class="performance-setting-title">本机数据</div>' +
      '<div class="settings-data-summary">当前版本 ' + (version ? version.textContent : "") + '</div>' +
      '<div class="settings-data-actions"><button type="button" id="settings-data-export">导出数据</button>' +
      '<button type="button" id="settings-data-reset">重置本机数据</button></div></div>';
    performanceRows.appendChild(card);
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

  document.addEventListener("click", function (event) {
    if (event.target.closest("#settings-data-export")) exportData();
    if (event.target.closest("#settings-data-reset")) resetData();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", organize, { once: true });
  } else {
    organize();
  }
}());
