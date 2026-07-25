(function () {
    var resizeFrame = 0;

    function api() {
        return window.SksirQuickLaunch;
    }

    function readValue(id) {
        var element = document.getElementById(id);
        return element ? element.value : "";
    }

    function addLibraryItem(service) {
        var tabs = window.NAV_SITES && window.NAV_SITES.tabs;
        var tabIndex = parseInt(readValue("quick-launch-library-tab"), 10);
        var itemIndex = parseInt(readValue("quick-launch-library-item"), 10);
        var tab = Array.isArray(tabs) && Number.isFinite(tabIndex) ? tabs[tabIndex] : null;
        var item = tab && !tab.lock && Array.isArray(tab.items) && Number.isFinite(itemIndex)
            ? tab.items[itemIndex]
            : null;
        var url = item && service.normalizeWebUrl(item.url);
        if (!item || !url) return service.showMessage("请选择收藏网站", true);
        var result = service.saveCustomItem({
            name: String(item.name || item.url).trim().slice(0, 30),
            url: url,
            icon: service.normalizeWebUrl(item.icon) || new URL("/favicon.ico", url).href,
            desc: String(item.desc || "").slice(0, 80)
        });
        if (result.full) return service.showMessage("只能添加 " + service.customLimit + " 个自定义入口", true);
        service.showMessage(result.updated ? "已更新快捷入口" : "已添加到快捷入口");
    }

    function addCustomItem(event, service) {
        event.preventDefault();
        var name = readValue("quick-launch-custom-name").trim().slice(0, 30);
        var url = service.normalizeWebUrl(readValue("quick-launch-custom-url"));
        var rawIcon = readValue("quick-launch-custom-icon").trim();
        var icon = rawIcon ? service.normalizeWebUrl(rawIcon) : "";
        if (!name) return service.showMessage("请填写入口名称", true);
        if (!url) return service.showMessage("网址请使用 http:// 或 https:// 开头", true);
        if (rawIcon && !icon) return service.showMessage("图标网址请使用 http:// 或 https:// 开头", true);

        var result = service.saveCustomItem({
            name: name,
            url: url,
            icon: icon || new URL("/favicon.ico", url).href
        });
        if (result.full) return service.showMessage("只能添加 " + service.customLimit + " 个自定义入口", true);
        event.target.reset();
        service.showMessage(result.updated ? "已更新自定义入口" : "已添加自定义入口");
    }

    function removeCustomItem(button, service) {
        var url = button.getAttribute("data-url");
        var items = service.getCustomItems().filter(function (item) { return item.url !== url; });
        service.write(service.customKey, items.map(function (item) {
            return { name: item.name, url: item.url, icon: item.icon, desc: item.desc || "" };
        }));
        service.renderCustomList();
        service.render();
        service.showMessage("已删除自定义入口");
    }

    document.addEventListener("click", function (event) {
        var service = api();
        if (!service) return;

        var navItem = event.target.closest(".products .quicks, .products .quickjl");
        if (navItem) {
            var link = navItem.querySelector("a[href]");
            var panel = navItem.closest(".mainCont[data-nav-tab-index]");
            var tabIndex = panel ? parseInt(panel.dataset.navTabIndex || "-1", 10) : -1;
            var tab = window.NAV_SITES && window.NAV_SITES.tabs && window.NAV_SITES.tabs[tabIndex];
            if (link && !(tab && tab.lock)) {
                recordRecentNavItem({
                    name: link.textContent.trim(),
                    url: link.href,
                    desc: (navItem.querySelector(".quick-desc") || {}).textContent || ""
                });
                service.recordClick(link.href);
                service.refreshAutoOrder();
            }
        }

        if (event.target.closest("#quick-launch-auto")) {
            if (window.SksirStorage) window.SksirStorage.remove(service.orderKey);
            service.init();
            iziToast.show({
                timeout: 1600,
                class: "setting-toast",
                title: "快捷入口",
                message: "已恢复按点击次数自动调整"
            });
        }
        if (event.target.closest("#quick-launch-library-add")) addLibraryItem(service);

        var removeButton = event.target.closest(".quick-launch-custom-remove");
        if (removeButton) removeCustomItem(removeButton, service);
    });

    document.addEventListener("change", function (event) {
        var service = api();
        if (!service) return;
        if (event.target.matches(".set-quick-launch")) {
            service.write(service.enabledKey, event.target.checked);
            service.init();
        }
        if (event.target.matches(".quick-launch-limit")) {
            var mobile = event.target.id === "quick-launch-mobile-limit";
            var value = service.clampLimit(event.target.value, mobile ? 6 : 8, mobile ? 8 : 12);
            service.write(mobile ? service.mobileLimitKey : service.desktopLimitKey, value);
            service.render();
        }
        if (event.target.matches("#quick-launch-library-tab")) service.renderLibraryItems();
    });

    document.addEventListener("submit", function (event) {
        if (!event.target.matches("#quick-launch-custom-form")) return;
        var service = api();
        if (service) addCustomItem(event, service);
    });

    window.addEventListener("storage", function (event) {
        var service = api();
        if (service && service.storageKeys.indexOf(event.key) !== -1) service.init();
    });

    window.addEventListener("resize", function () {
        var service = api();
        if (!service) return;
        if (resizeFrame) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(function () {
            resizeFrame = 0;
            service.render();
        });
    });
}());
