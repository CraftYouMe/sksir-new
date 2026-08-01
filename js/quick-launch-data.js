(function () {
    "use strict";

    var enabledKey = "sksir-quick-launch-enabled";
    var clicksKey = "sksir-quick-launch-clicks";
    var orderKey = "sksir-quick-launch-order";
    var sortModeKey = "sksir-quick-launch-sort-mode";
    var customKey = "sksir-quick-launch-custom";
    var hiddenKey = "sksir-quick-launch-hidden";
    var rosterKey = "sksir-quick-launch-roster";
    var rosterVersionKey = "sksir-quick-launch-roster-version";
    var desktopLimitKey = "sksir-quick-launch-desktop-limit";
    var mobileLimitKey = "sksir-quick-launch-mobile-limit";
    var storageKeys = [enabledKey, clicksKey, orderKey, sortModeKey, customKey, hiddenKey, rosterKey, rosterVersionKey, desktopLimitKey, mobileLimitKey];
    var customLimit = 24;
    var bootItems = [
        {
            name: "BiliBili",
            url: "https://BiliBili.com",
            icon: "https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/2026.08.02.2/favicon/64/bilibili.webp",
            desc: "视频弹幕社区"
        },
        {
            name: "ChatGPT",
            url: "https://chat.openai.com/",
            icon: "https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/2026.08.02.2/favicon/64/chatgpt.webp",
            desc: "AI 对话助手"
        },
        {
            name: "DeepSeek",
            url: "https://www.deepseek.com/",
            icon: "https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/2026.08.02.2/favicon/64/deepseek.webp",
            desc: "国产 AI 助手"
        },
        {
            name: "GitHub",
            url: "https://github.com/",
            icon: "https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/2026.08.02.2/icon/github.png",
            desc: "代码托管平台"
        },
        {
            name: "iLoveIMG",
            url: "https://www.iloveimg.com/zh-cn",
            icon: "https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/2026.08.02.2/icon/iloveimg.png",
            desc: "图片批量处理"
        }
    ];

    function read(key, fallback) {
        return window.SksirStorage ? window.SksirStorage.readJson(key, fallback) : fallback;
    }

    function write(key, value) {
        if (window.SksirStorage) window.SksirStorage.writeJson(key, value);
    }

    function isEnabled() {
        return read(enabledKey, true) !== false;
    }

    function getSortMode() {
        return "manual";
    }

    function normalizeUrl(url) {
        try {
            return new URL(url, window.location.href).href;
        } catch (error) {
            return url;
        }
    }

    function normalizeWebUrl(url) {
        var value = String(url || "").trim();
        if (value && !/^[a-z][a-z0-9+.-]*:/i.test(value)) value = "https://" + value;
        try {
            var parsed = new URL(value);
            return /^(https?:)$/.test(parsed.protocol) ? parsed.href : "";
        } catch (error) {
            return "";
        }
    }

    function clampLimit(value, fallback, maximum) {
        value = parseInt(value, 10);
        return Number.isFinite(value) ? Math.max(4, Math.min(maximum, value)) : fallback;
    }

    function getLimit() {
        var mobile = window.matchMedia && window.matchMedia("(max-width: 720px)").matches;
        var key = mobile ? mobileLimitKey : desktopLimitKey;
        return clampLimit(read(key, mobile ? 6 : 8), mobile ? 6 : 8, mobile ? 8 : 12);
    }

    function getCustomItems() {
        var stored = read(customKey, []);
        if (!Array.isArray(stored)) return [];
        var seen = {};
        return stored.slice(0, customLimit).reduce(function (items, item) {
            if (!item || typeof item !== "object") return items;
            var url = normalizeWebUrl(item.url);
            if (!url || seen[url]) return items;
            seen[url] = true;
            var icon = normalizeWebUrl(item.icon);
            items.push({
                name: String(item.name || new URL(url).hostname).trim().slice(0, 30),
                url: url,
                icon: icon || new URL("/favicon.ico", url).href,
                desc: String(item.desc || "自定义快捷入口").slice(0, 80),
                target: "_blank",
                rel: "noopener noreferrer",
                custom: true,
                sourceIndex: items.length
            });
            return items;
        }, []);
    }

    function getHiddenUrls() {
        var stored = read(hiddenKey, []);
        var seen = {};
        return Array.isArray(stored) ? stored.reduce(function (items, url) {
            var normalized = normalizeWebUrl(url);
            if (normalized && !seen[normalized]) {
                seen[normalized] = true;
                items.push(normalized);
            }
            return items;
        }, []).slice(0, 100) : [];
    }

    function getRosterUrls() {
        var stored = read(rosterKey, []);
        var seen = {};
        return Array.isArray(stored) ? stored.reduce(function (items, url) {
            var normalized = normalizeWebUrl(url);
            if (normalized && !seen[normalized]) {
                seen[normalized] = true;
                items.push(normalized);
            }
            return items;
        }, []).slice(0, customLimit) : [];
    }

    function repairStorage() {
        var custom = getCustomItems();
        write(customKey, custom.map(function (item) {
            return { name: item.name, url: item.url, icon: item.icon, desc: item.desc };
        }));
        write(hiddenKey, getHiddenUrls());
        if (Array.isArray(read(rosterKey, null))) write(rosterKey, getRosterUrls());

        var clicks = read(clicksKey, {});
        var cleanClicks = {};
        if (clicks && typeof clicks === "object" && !Array.isArray(clicks)) {
            Object.keys(clicks).slice(0, 500).forEach(function (url) {
                var normalized = normalizeWebUrl(url);
                var count = Math.floor(Number(clicks[url]));
                if (normalized && Number.isFinite(count) && count > 0) {
                    cleanClicks[normalized] = Math.min(count, 1000000);
                }
            });
        }
        write(clicksKey, cleanClicks);

        var order = read(orderKey, []);
        var seenOrder = {};
        order = Array.isArray(order) ? order.reduce(function (clean, url) {
            var normalized = normalizeWebUrl(url);
            if (normalized && !seenOrder[normalized]) {
                seenOrder[normalized] = true;
                clean.push(normalized);
            }
            return clean;
        }, []).slice(0, 24) : [];
        write(orderKey, order);
    }

    function getItems(includeHidden) {
        var tabs = window.NAV_SITES && window.NAV_SITES.tabs;
        var hiddenUrls = includeHidden ? [] : getHiddenUrls();
        var items = getCustomItems().filter(function (item) {
            return hiddenUrls.indexOf(item.url) === -1;
        });
        var seenUrls = {};
        items.forEach(function (item) {
            seenUrls[item.url] = true;
        });
        var sourceTabs = Array.isArray(tabs) ? tabs : [{ items: bootItems }];
        sourceTabs.forEach(function (tab) {
            if (tab.lock || !Array.isArray(tab.items)) return;
            tab.items.forEach(function (item) {
                if (!item || !item.url || !item.icon) return;
                var normalizedUrl = normalizeUrl(item.url);
                if (seenUrls[normalizedUrl] || hiddenUrls.indexOf(normalizedUrl) !== -1) return;
                seenUrls[normalizedUrl] = true;
                items.push({
                    name: item.name || item.url,
                    url: normalizedUrl,
                    icon: item.icon,
                    desc: item.desc || "",
                    target: item.target || "_blank",
                    rel: item.rel || "noopener noreferrer",
                    sourceIndex: items.length
                });
            });
        });
        return items;
    }

    function sortItems(items) {
        var manualOrder = read(orderKey, []);
        var orderMap = {};
        if (Array.isArray(manualOrder) && manualOrder.length) {
            manualOrder.forEach(function (url, index) {
                orderMap[url] = index;
            });
        }
        return items.sort(function (left, right) {
            if (manualOrder.length) {
                var leftOrder = Object.prototype.hasOwnProperty.call(orderMap, left.url) ? orderMap[left.url] : 9999;
                var rightOrder = Object.prototype.hasOwnProperty.call(orderMap, right.url) ? orderMap[right.url] : 9999;
                if (leftOrder !== rightOrder) return leftOrder - rightOrder;
            }
            if (left.custom !== right.custom) return left.custom ? -1 : 1;
            return left.sourceIndex - right.sourceIndex;
        });
    }

    function recordClick(url) {
        if (!url) return;
        url = normalizeUrl(url);
        var clicks = read(clicksKey, {});
        clicks[url] = (clicks[url] || 0) + 1;
        write(clicksKey, clicks);
    }

    var service = {
        storageKeys: storageKeys.slice(),
        enabledKey: enabledKey,
        orderKey: orderKey,
        sortModeKey: sortModeKey,
        customKey: customKey,
        hiddenKey: hiddenKey,
        rosterKey: rosterKey,
        rosterVersionKey: rosterVersionKey,
        desktopLimitKey: desktopLimitKey,
        mobileLimitKey: mobileLimitKey,
        customLimit: customLimit,
        read: read,
        write: write,
        normalizeWebUrl: normalizeWebUrl,
        clampLimit: clampLimit,
        getCustomItems: getCustomItems,
        getHiddenUrls: getHiddenUrls,
        getRosterUrls: getRosterUrls,
        isEnabled: isEnabled,
        getSortMode: getSortMode,
        getLimit: getLimit,
        getItems: getItems,
        sortItems: sortItems,
        recordClick: recordClick,
        repairStorage: repairStorage
    };

    window.SksirQuickLaunchData = service;
}());
