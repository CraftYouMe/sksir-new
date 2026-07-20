/*!
 * JavaScript Cookie v2.2.1
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;
(function (factory) {
	var registeredInModuleLoader;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend() {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[i];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function decode(s) {
		return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
	}

	function init(converter) {
		function api() {}

		function set(key, value, attributes) {
			if (typeof document === 'undefined') {
				return;
			}

			attributes = extend({
				path: '/'
			}, api.defaults, attributes);

			if (typeof attributes.expires === 'number') {
				attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
			}

			// We're using "expires" because "max-age" is not supported by IE
			attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

			try {
				var result = JSON.stringify(value);
				if (/^[\{\[]/.test(result)) {
					value = result;
				}
			} catch (e) {}

			value = converter.write ?
				converter.write(value, key) :
				encodeURIComponent(String(value))
				.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

			key = encodeURIComponent(String(key))
				.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
				.replace(/[\(\)]/g, escape);

			var stringifiedAttributes = '';
			for (var attributeName in attributes) {
				if (!attributes[attributeName]) {
					continue;
				}
				stringifiedAttributes += '; ' + attributeName;
				if (attributes[attributeName] === true) {
					continue;
				}

				// Considers RFC 6265 section 5.2:
				// ...
				// 3.  If the remaining unparsed-attributes contains a %x3B (";")
				//     character:
				// Consume the characters of the unparsed-attributes up to,
				// not including, the first %x3B (";") character.
				// ...
				stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
			}

			return (document.cookie = key + '=' + value + stringifiedAttributes);
		}

		function get(key, json) {
			if (typeof document === 'undefined') {
				return;
			}

			var jar = {};
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all.
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (!json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = decode(parts[0]);
					cookie = (converter.read || converter)(cookie, name) ||
						decode(cookie);

					if (json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					jar[name] = cookie;

					if (key === name) {
						break;
					}
				} catch (e) {}
			}

			return key ? jar[key] : jar;
		}

		api.set = set;
		api.get = function (key) {
			return get(key, false /* read as raw */ );
		};
		api.getJSON = function (key) {
			return get(key, true /* read as json */ );
		};
		api.remove = function (key, attributes) {
			set(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.defaults = {};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));

/*
作者:D.Young
日期：2019-07-26
版权所有，请勿删除
========================================
由 yeetime 修改
日期：2019-12-13
========================================
由 imsyy 二次修改
日期：2022-03-10
========================================
由 CraftYui 三次修改
github：https://github.com/CraftYouMe/sksir-new
日期：2022-03-10
*/

// 默认搜索引擎列表
var se_list_preinstall = {
    '1': {
        id: 1,
        title: "百度",
        url: "https://www.baidu.com/s",
        name: "wd",
        icon: "iconfont icon-baidu",
    },
    '2': {
        id: 2,
        title: "必应",
        url: "https://cn.bing.com/search?q=%s&go=&form=QBLH&qs=n&sk=",
        name: "q",
        icon: "iconfont icon-bing",
    },
    '3': {
        id: 3,
        title: "谷歌",
        url: "https://www.google.com/search",
        name: "q",
        icon: "iconfont icon-google",
    },
    '4': {
        id: 4,
        title: "搜狗",
        url: "https://www.sogou.com/web",
        name: "query",
        icon: "iconfont icon-sougousousuo",
    },
    '5': {
        id: 5,
        title: "360",
        url: "https://www.so.com/s",
        name: "q",
        icon: "iconfont icon-360sousuo",
    },
    '6': {
        id: 6,
        title: "微博",
        url: "https://s.weibo.com/weibo",
        name: "q",
        icon: "iconfont icon-xinlangweibo",
    },
    '7': {
        id: 7,
        title: "知乎",
        url: "https://www.zhihu.com/search",
        name: "q",
        icon: "iconfont icon-zhihu",
    },
    '8': {
        id: 8,
        title: "Github",
        url: "https://github.com/search",
        name: "q",
        icon: "iconfont icon-github",
    },
    '9': {
        id: 9,
        title: "BiliBili",
        url: "https://search.bilibili.com/all",
        name: "keyword",
        icon: "iconfont icon-bilibilidonghua",
    },
    '10': {
        id: 10,
        title: "淘宝",
        url: "https://s.taobao.com/search",
        name: "q",
        icon: "iconfont icon-taobao",
    },
    '11': {
        id: 11,
        title: "京东",
        url: "https://search.jd.com/Search",
        name: "keyword",
        icon: "iconfont icon-jingdong",
    }
};


// 获取搜索引擎列表
function getSeList() {
    var se_list_local = Cookies.get('se_list');
    if (se_list_local !== "{}" && se_list_local) {
        return JSON.parse(se_list_local);
    } else {
        setSeList(se_list_preinstall);
        return se_list_preinstall;
    }
}

// 设置搜索引擎列表
function setSeList(se_list) {
    if (se_list) {
        Cookies.set('se_list', se_list, {
            expires: 36500
        });
        return true;
    }
    return false;
}

// 获得默认搜索引擎
function getSeDefault() {
    var se_default = Cookies.get('se_default');
    var normalized = normalizeSeDefault(se_default ? se_default : "2");
    if (se_default && se_default !== normalized) {
        Cookies.set('se_default', normalized, {
            expires: 36500
        });
    }
    return normalized;
}

function normalizeSeDefault(se_default) {
    var aliases = {
        baidu: "1",
        bing: "2",
        google: "3",
        sogou: "4",
        so: "5",
        "360": "5",
        weibo: "6",
        zhihu: "7",
        github: "8",
        bilibili: "9",
        taobao: "10",
        jd: "11"
    };

    return aliases[se_default] || se_default || "2";
}

function getValidSeDefault(se_list) {
    var se_default = getSeDefault();
    if (se_list[se_default]) return se_default;

    var fallback = se_list["2"] ? "2" : Object.keys(se_list)[0];
    if (fallback) {
        Cookies.set('se_default', fallback, {
            expires: 36500
        });
    }
    return fallback;
}

function setDefaultSearchEngine(rawValue) {
    var key = normalizeSeDefault(rawValue);
    var se_list = getSeList();
    if (!se_list[key]) {
        iziToast.show({
            timeout: 2200,
            class: "setting-toast",
            title: "\u641c\u7d22\u8bbe\u7f6e",
            message: "\u672a\u627e\u5230\u8fd9\u4e2a\u641c\u7d22\u5f15\u64ce"
        });
        return false;
    }

    Cookies.set('se_default', key, {
        expires: 36500
    });
    setSeInit();
    searchData();
    seList();
    return true;
}

var keywordRequestSeq = 0;
var keywordReminderTimer = null;
var keywordPanelReadyAt = 0;
var keywordLocalResults = [];
var keywordRemoteSuggestions = [];
var keywordRemoteState = "idle";
var recentNavStorageKey = "sksir-recent-nav-items";
var recentNavLimit = 6;
var quickLaunchEnabledKey = "sksir-quick-launch-enabled";
var quickLaunchClicksKey = "sksir-quick-launch-clicks";
var quickLaunchOrderKey = "sksir-quick-launch-order";
var quickLaunchCustomKey = "sksir-quick-launch-custom";
var quickLaunchDesktopLimitKey = "sksir-quick-launch-desktop-limit";
var quickLaunchMobileLimitKey = "sksir-quick-launch-mobile-limit";
var quickLaunchStorageKeys = [quickLaunchEnabledKey, quickLaunchClicksKey, quickLaunchOrderKey,
    quickLaunchCustomKey, quickLaunchDesktopLimitKey, quickLaunchMobileLimitKey];
var quickLaunchCustomLimit = 24;
var quickLaunchSuppressClickUntil = 0;
var quickLaunchResizeFrame = 0;

function readQuickLaunchStorage(key, fallback) {
    try {
        var value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

function writeQuickLaunchStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // Storage can be unavailable in private browsing; keep the UI usable.
    }
}

function isQuickLaunchEnabled() {
    return readQuickLaunchStorage(quickLaunchEnabledKey, true) !== false;
}

function normalizeQuickLaunchUrl(url) {
    try {
        return new URL(url, window.location.href).href;
    } catch (error) {
        return url;
    }
}

function normalizeQuickLaunchWebUrl(url) {
    try {
        var parsed = new URL(String(url || "").trim());
        return /^(https?:)$/.test(parsed.protocol) ? parsed.href : "";
    } catch (error) {
        return "";
    }
}

function clampQuickLaunchLimit(value, fallback, maximum) {
    value = parseInt(value, 10);
    return Number.isFinite(value) ? Math.max(4, Math.min(maximum, value)) : fallback;
}

function getQuickLaunchLimit() {
    var mobile = window.matchMedia && window.matchMedia("(max-width: 720px)").matches;
    var key = mobile ? quickLaunchMobileLimitKey : quickLaunchDesktopLimitKey;
    return clampQuickLaunchLimit(readQuickLaunchStorage(key, mobile ? 6 : 8), mobile ? 6 : 8, mobile ? 8 : 12);
}

function getQuickLaunchCustomItems() {
    var stored = readQuickLaunchStorage(quickLaunchCustomKey, []);
    if (!Array.isArray(stored)) return [];
    var seen = {};
    return stored.slice(0, quickLaunchCustomLimit).reduce(function (items, item) {
        if (!item || typeof item !== "object") return items;
        var url = normalizeQuickLaunchWebUrl(item.url);
        if (!url || seen[url]) return items;
        seen[url] = true;
        var icon = normalizeQuickLaunchWebUrl(item.icon);
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

function repairQuickLaunchStorage() {
    var custom = getQuickLaunchCustomItems();
    writeQuickLaunchStorage(quickLaunchCustomKey, custom.map(function (item) {
        return { name: item.name, url: item.url, icon: item.icon, desc: item.desc };
    }));

    var clicks = readQuickLaunchStorage(quickLaunchClicksKey, {});
    var cleanClicks = {};
    if (clicks && typeof clicks === "object" && !Array.isArray(clicks)) {
        Object.keys(clicks).slice(0, 500).forEach(function (url) {
            var normalized = normalizeQuickLaunchWebUrl(url);
            var count = Math.floor(Number(clicks[url]));
            if (normalized && Number.isFinite(count) && count > 0) cleanClicks[normalized] = Math.min(count, 1000000);
        });
    }
    writeQuickLaunchStorage(quickLaunchClicksKey, cleanClicks);

    var order = readQuickLaunchStorage(quickLaunchOrderKey, []);
    var seenOrder = {};
    order = Array.isArray(order) ? order.reduce(function (clean, url) {
        var normalized = normalizeQuickLaunchWebUrl(url);
        if (normalized && !seenOrder[normalized]) {
            seenOrder[normalized] = true;
            clean.push(normalized);
        }
        return clean;
    }, []).slice(0, 24) : [];
    writeQuickLaunchStorage(quickLaunchOrderKey, order);
}

function getQuickLaunchItems() {
    var tabs = window.NAV_SITES && window.NAV_SITES.tabs;
    var items = getQuickLaunchCustomItems();
    var seenUrls = {};
    items.forEach(function (item) {
        seenUrls[item.url] = true;
    });
    if (!Array.isArray(tabs)) return items;
    tabs.forEach(function (tab) {
        if (tab.lock || !Array.isArray(tab.items)) return;
        tab.items.forEach(function (item) {
            if (!item || !item.url || !item.icon) return;
            var normalizedUrl = normalizeQuickLaunchUrl(item.url);
            if (seenUrls[normalizedUrl]) return;
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

function sortQuickLaunchItems(items) {
    var clicks = readQuickLaunchStorage(quickLaunchClicksKey, {});
    var manualOrder = readQuickLaunchStorage(quickLaunchOrderKey, []);
    var orderMap = {};
    if (Array.isArray(manualOrder) && manualOrder.length) {
        manualOrder.forEach(function (url, index) {
            orderMap[url] = index;
        });
    }
    return items.sort(function (a, b) {
        if (manualOrder.length) {
            var aOrder = Object.prototype.hasOwnProperty.call(orderMap, a.url) ? orderMap[a.url] : 9999;
            var bOrder = Object.prototype.hasOwnProperty.call(orderMap, b.url) ? orderMap[b.url] : 9999;
            if (aOrder !== bOrder) return aOrder - bOrder;
        }
        var countDiff = (clicks[b.url] || 0) - (clicks[a.url] || 0);
        if (!countDiff && a.custom !== b.custom) return a.custom ? -1 : 1;
        return countDiff || a.sourceIndex - b.sourceIndex;
    });
}

function recordQuickLaunchClick(url) {
    if (!url) return;
    url = normalizeQuickLaunchUrl(url);
    var clicks = readQuickLaunchStorage(quickLaunchClicksKey, {});
    clicks[url] = (clicks[url] || 0) + 1;
    writeQuickLaunchStorage(quickLaunchClicksKey, clicks);
}

function refreshQuickLaunchAutoOrder() {
    var manualOrder = readQuickLaunchStorage(quickLaunchOrderKey, []);
    if (!Array.isArray(manualOrder) || !manualOrder.length) {
        setTimeout(renderQuickLaunch, 0);
    }
}

function saveQuickLaunchOrder() {
    var order = $("#quick-launch .quick-launch-item").map(function () {
        return $(this).attr("data-url");
    }).get();
    writeQuickLaunchStorage(quickLaunchOrderKey, order);
}

function bindQuickLaunchDrag(item) {
    var startX = 0;
    var startY = 0;
    var dragging = false;

    item.addEventListener("pointerdown", function (event) {
        if (event.button !== undefined && event.button !== 0) return;
        startX = event.clientX;
        startY = event.clientY;
        dragging = false;
        item.setPointerCapture(event.pointerId);
    });

    item.addEventListener("pointermove", function (event) {
        if (!item.hasPointerCapture(event.pointerId)) return;
        if (!dragging && Math.hypot(event.clientX - startX, event.clientY - startY) < 7) return;
        dragging = true;
        item.classList.add("is-dragging");
        var target = document.elementFromPoint(event.clientX, event.clientY);
        var targetItem = target && target.closest && target.closest(".quick-launch-item");
        if (!targetItem || targetItem === item || targetItem.parentNode !== item.parentNode) return;
        var targetRect = targetItem.getBoundingClientRect();
        var insertAfter = event.clientX > targetRect.left + targetRect.width / 2;
        targetItem.parentNode.insertBefore(item, insertAfter ? targetItem.nextSibling : targetItem);
    });

    function finishDrag(event) {
        if (item.hasPointerCapture(event.pointerId)) item.releasePointerCapture(event.pointerId);
        item.classList.remove("is-dragging");
        if (!dragging) return;
        quickLaunchSuppressClickUntil = Date.now() + 400;
        saveQuickLaunchOrder();
        event.preventDefault();
        dragging = false;
    }

    item.addEventListener("pointerup", finishDrag);
    item.addEventListener("pointercancel", finishDrag);
    item.addEventListener("dragstart", function (event) {
        event.preventDefault();
    });
}

function renderQuickLaunch() {
    var panel = document.getElementById("quick-launch");
    if (!panel) return Promise.resolve();
    if (!isQuickLaunchEnabled()) {
        panel.hidden = true;
        panel.replaceChildren();
        return Promise.resolve();
    }

    var items = sortQuickLaunchItems(getQuickLaunchItems()).slice(0, getQuickLaunchLimit());
    panel.replaceChildren();
    items.forEach(function (entry) {
        var link = document.createElement("a");
        link.className = "quick-launch-item";
        link.href = entry.url;
        link.target = entry.target;
        link.rel = entry.rel;
        link.title = entry.name;
        link.setAttribute("aria-label", entry.name);
        link.setAttribute("data-url", entry.url);

        var icon = document.createElement("img");
        icon.src = entry.icon;
        icon.alt = "";
        icon.loading = "lazy";
        icon.decoding = "async";
        icon.onerror = function () {
            this.onerror = null;
            this.src = "./img/icon/fangdiu.png";
        };
        link.appendChild(icon);
        link.addEventListener("click", function (event) {
            event.stopPropagation();
            if (Date.now() < quickLaunchSuppressClickUntil) {
                event.preventDefault();
                return;
            }
            recordQuickLaunchClick(entry.url);
            recordRecentNavItem(entry);
            refreshQuickLaunchAutoOrder();
        });
        bindQuickLaunchDrag(link);
        panel.appendChild(link);
    });
    panel.hidden = items.length === 0;
    return Promise.resolve();
}

function initQuickLaunch() {
    $("#quick-launch-enabled").prop("checked", isQuickLaunchEnabled());
    $("#quick-launch-desktop-limit").val(String(clampQuickLaunchLimit(readQuickLaunchStorage(quickLaunchDesktopLimitKey, 8), 8, 12)));
    $("#quick-launch-mobile-limit").val(String(clampQuickLaunchLimit(readQuickLaunchStorage(quickLaunchMobileLimitKey, 6), 6, 8)));
    renderQuickLaunchCustomList();
    renderQuickLaunchLibraryTabs();
    if (!isQuickLaunchEnabled()) return renderQuickLaunch();
    renderQuickLaunch();
    return Promise.resolve();
}

function renderQuickLaunchCustomList() {
    var panel = document.getElementById("quick-launch-custom-list");
    if (!panel) return;
    var items = getQuickLaunchCustomItems();
    panel.replaceChildren();
    if (!items.length) {
        var empty = document.createElement("div");
        empty.className = "quick-launch-custom-empty";
        empty.textContent = "暂无自定义入口";
        panel.appendChild(empty);
        return;
    }
    items.forEach(function (item) {
        var row = document.createElement("div");
        row.className = "quick-launch-custom-item";
        var text = document.createElement("span");
        text.textContent = item.name;
        text.title = item.url;
        var remove = document.createElement("button");
        remove.type = "button";
        remove.className = "quick-launch-custom-remove";
        remove.setAttribute("data-url", item.url);
        remove.setAttribute("aria-label", "删除 " + item.name);
        remove.textContent = "删除";
        row.appendChild(text);
        row.appendChild(remove);
        panel.appendChild(row);
    });
}

function renderQuickLaunchLibraryTabs() {
    var select = document.getElementById("quick-launch-library-tab");
    if (!select) return;
    var selected = select.value;
    var tabs = window.NAV_SITES && window.NAV_SITES.tabs;
    select.replaceChildren(new Option("选择标签", ""));
    if (!Array.isArray(tabs)) return renderQuickLaunchLibraryItems();
    tabs.forEach(function (tab, index) {
        if (!tab || tab.lock || !Array.isArray(tab.items) || !tab.items.length) return;
        select.appendChild(new Option(tab.title || ("标签 " + (index + 1)), String(index)));
    });
    if (Array.from(select.options).some(function (option) { return option.value === selected; })) {
        select.value = selected;
    }
    renderQuickLaunchLibraryItems();
}

function renderQuickLaunchLibraryItems() {
    var tabSelect = document.getElementById("quick-launch-library-tab");
    var itemSelect = document.getElementById("quick-launch-library-item");
    if (!tabSelect || !itemSelect) return;
    var tabs = window.NAV_SITES && window.NAV_SITES.tabs;
    var tabIndex = parseInt(tabSelect.value, 10);
    var tab = Array.isArray(tabs) && Number.isFinite(tabIndex) ? tabs[tabIndex] : null;
    itemSelect.replaceChildren(new Option("选择网站", ""));
    if (!tab || tab.lock || !Array.isArray(tab.items)) {
        itemSelect.disabled = true;
        return;
    }
    tab.items.forEach(function (item, index) {
        if (!item || !normalizeQuickLaunchWebUrl(item.url)) return;
        itemSelect.appendChild(new Option(item.name || item.url, String(index)));
    });
    itemSelect.disabled = itemSelect.options.length < 2;
}

function saveQuickLaunchCustomItem(entry) {
    var items = getQuickLaunchCustomItems();
    var existing = items.find(function (item) { return item.url === entry.url; });
    if (!existing && items.length >= quickLaunchCustomLimit) return { full: true };
    if (existing) {
        items = items.map(function (item) { return item.url === entry.url ? entry : item; });
    } else {
        items.unshift(entry);
    }
    writeQuickLaunchStorage(quickLaunchCustomKey, items.map(function (item) {
        return { name: item.name, url: item.url, icon: item.icon, desc: item.desc || "" };
    }));
    renderQuickLaunchCustomList();
    renderQuickLaunch();
    return { updated: !!existing };
}

function showQuickLaunchMessage(message, isError) {
    iziToast.show({
        timeout: 2000,
        class: "setting-toast",
        title: isError ? "无法添加" : "快捷入口",
        message: message
    });
}

repairQuickLaunchStorage();
document.addEventListener("sksir-nav-sites-ready", function () {
    renderQuickLaunch();
    renderQuickLaunchLibraryTabs();
});
window.prepareQuickLaunchForBoot = initQuickLaunch;

function hideKeywordPanel() {
    if (keywordReminderTimer) {
        clearTimeout(keywordReminderTimer);
        keywordReminderTimer = null;
    }
    keywordRequestSeq++;
    keywordLocalResults = [];
    keywordRemoteSuggestions = [];
    keywordRemoteState = "idle";
    $("#keywords").empty().removeAttr("data-length").hide();
}

function canShowKeywordPanel(keyword, requestSeq) {
    return requestSeq === keywordRequestSeq &&
        $("body").hasClass("onsearch") &&
        $(".search-engine").is(":hidden") &&
        $.trim($(".wd").val()) === keyword;
}

function getRecentNavItems() {
    try {
        var items = JSON.parse(localStorage.getItem(recentNavStorageKey) || "[]");
        return Array.isArray(items) ? items.slice(0, recentNavLimit) : [];
    } catch (error) {
        return [];
    }
}

function recordRecentNavItem(item) {
    if (!item || !item.url || !/^https?:\/\//i.test(item.url)) return;
    var recentItems = getRecentNavItems().filter(function (recentItem) {
        return recentItem.url !== item.url;
    });
    recentItems.unshift({
        name: String(item.name || item.url),
        url: item.url,
        desc: String(item.desc || "")
    });
    try {
        localStorage.setItem(recentNavStorageKey, JSON.stringify(recentItems.slice(0, recentNavLimit)));
    } catch (error) {
        // Storage can be unavailable in private browsing; navigation still works.
    }
}

window.recordRecentNavItem = recordRecentNavItem;

function getSearchableNavItems() {
    var data = window.NAV_SITES || {};
    var seenUrls = {};
    var results = [];
    (data.tabs || []).forEach(function (tab) {
        if (tab.lock) return;
        (tab.items || []).forEach(function (item) {
            if (!item.url || seenUrls[item.url]) return;
            seenUrls[item.url] = true;
            results.push({
                name: item.name || item.url,
                url: item.url,
                desc: item.desc || "",
                searchText: [item.name, item.desc, item.category, item.searchKey, tab.title, item.url]
                    .filter(Boolean).join(" ").toLowerCase()
            });
        });
    });
    return results;
}

function searchLocalNavItems(keyword) {
    var query = String(keyword || "").trim().toLowerCase();
    if (!query) return [];
    return getSearchableNavItems().map(function (item) {
        var name = item.name.toLowerCase();
        var score = name === query ? 0 : name.indexOf(query) === 0 ? 1 : item.searchText.indexOf(query) >= 0 ? 2 : 9;
        return { item: item, score: score };
    }).filter(function (result) {
        return result.score < 9;
    }).sort(function (left, right) {
        return left.score - right.score || left.item.name.length - right.item.name.length;
    }).slice(0, 4).map(function (result) {
        return result.item;
    });
}

function renderKeywordPanel(keyword, requestSeq) {
    if (!canShowKeywordPanel(keyword, requestSeq)) return;
    var entries = keywordLocalResults.map(function (item) {
        return { kind: "nav", name: item.name, desc: item.desc, url: item.url };
    });
    keywordRemoteSuggestions.forEach(function (suggestion) {
        if (!entries.some(function (entry) { return entry.name.toLowerCase() === suggestion.toLowerCase(); })) {
            entries.push({ kind: "search", name: suggestion });
        }
    });
    entries = entries.slice(0, 8);

    var $panel = $("#keywords").empty();
    var statusMessages = {
        loading: "正在获取网络建议...",
        offline: "当前离线，只显示本地结果",
        error: "网络建议暂不可用"
    };
    var statusMessage = statusMessages[keywordRemoteState] || "";
    if (!entries.length && !statusMessage) {
        $panel.removeAttr("data-length").hide();
        return;
    }
    updateKeywordPanel();
    entries.forEach(function (entry, index) {
        var $item = $("<div></div>", {
            class: "keyword" + (entry.kind === "nav" ? " keyword-nav" : ""),
            "data-id": index + 1,
            "data-kind": entry.kind,
            "data-query": entry.name,
            role: "option"
        });
        if (entry.url) $item.attr("data-url", entry.url);
        $("<i></i>", {
            class: entry.kind === "nav" ? "iconfont icon-home" : "iconfont icon-sousuo"
        }).appendTo($item);
        $("<span></span>", { class: "keyword-label", text: entry.name }).appendTo($item);
        if (entry.kind === "nav") {
            $("<span></span>", { class: "keyword-meta", text: entry.desc || "打开书签" }).appendTo($item);
        }
        $panel.append($item);
    });
    if (statusMessage) {
        $("<div></div>", {
            class: "keyword-status",
            text: statusMessage,
            role: "status"
        }).appendTo($panel);
    }
    $panel.attr("data-length", entries.length).show();
}

function loadLocalKeywordResults(keyword, requestSeq) {
    if (!keyword) {
        keywordLocalResults = getRecentNavItems();
        renderKeywordPanel(keyword, requestSeq);
        return;
    }
    var loadTask = typeof window.ensureNavSitesLoaded === "function"
        ? window.ensureNavSitesLoaded()
        : Promise.resolve();
    loadTask.then(function () {
        if (!canShowKeywordPanel(keyword, requestSeq)) return;
        keywordLocalResults = keyword ? searchLocalNavItems(keyword) : getRecentNavItems();
        renderKeywordPanel(keyword, requestSeq);
    }).catch(function () {
        // Remote suggestions remain available if bookmark data cannot be loaded.
    });
}

function scheduleKeywordReminder(delay) {
    if (keywordReminderTimer) {
        clearTimeout(keywordReminderTimer);
    }
    var requestedDelay = typeof delay === "number" ? delay : 120;
    var openingDelay = Math.max(0, keywordPanelReadyAt - Date.now());
    keywordReminderTimer = setTimeout(function () {
        keywordReminderTimer = null;
        keywordReminder();
    }, Math.max(requestedDelay, openingDelay));
}

document.addEventListener("click", function (event) {
    var button = event.target.closest && event.target.closest(".set_se_default");
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (setDefaultSearchEngine(button.value)) {
        iziToast.show({
            timeout: 1800,
            class: "setting-toast",
            title: "\u641c\u7d22\u8bbe\u7f6e",
            message: "\u5df2\u7acb\u5373\u5207\u6362\u9ed8\u8ba4\u641c\u7d22\u5f15\u64ce"
        });
    }
}, true);

/**
 * 背景图片配置
 * type: "1" 随机壁纸, "2" 必应每日一图, "5" 自定义壁纸
 * path: 自定义图片地址
 */
var bg_img_preinstall = {
    "type": "1",
    "path": "",
};

var bg_img_pictures = [
    'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/icon/background1.webp',
    'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/icon/background-image2.webp',
    'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/icon/background-image3.webp',
    'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/icon/background-image4.webp',
    'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/icon/background-image5.webp',
    'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/icon/background-image6.webp'
];

// 获取背景图片
function getBgImg() {
    var bg_img_local = Cookies.getJSON('bg_img');
    if (bg_img_local && bg_img_local.type) {
        // 兼容旧版自定义壁纸曾写入的 type: "3"
        if (bg_img_local.type === "3") bg_img_local.type = "5";
        return bg_img_local;
    }

    setBgImg(bg_img_preinstall);
    return Object.assign({}, bg_img_preinstall);
}

// 设置背景图片
function setBgImg(bg_img) {
    if (bg_img) {
        Cookies.set('bg_img', bg_img, {
            expires: 36500
        });
        return true;
    }
    return false;
}

function getRandomBgPicture() {
    if (!bg_img_pictures.length) return "";

    var lastSrc = localStorage.getItem('bg_img_last_src');
    var availablePictures = bg_img_pictures.filter(function (src) {
        return src !== lastSrc;
    });
    var pool = availablePictures.length ? availablePictures : bg_img_pictures;
    var src = pool[Math.floor(Math.random() * pool.length)];

    localStorage.setItem('bg_img_last_src', src);
    return src;
}

function resolveBgImgSrc(bg_img) {
    switch (bg_img["type"]) {
        case "2":
            return 'https://api.dujin.org/bing/1920.php';
        case "5":
            return bg_img["path"] || "";
        case "1":
        default:
            return getRandomBgPicture();
    }
}

function setBootWallpaperState(status, src) {
    window.__sksirWallpaperState = {
        status: status,
        src: src || "",
        time: Date.now()
    };

    if (status === "loading") return;
    document.dispatchEvent(new CustomEvent("sksir-wallpaper-ready", {
        detail: window.__sksirWallpaperState
    }));
}

function setIosWallpaperFallback(src) {
    var root = document.documentElement;
    if (!root || (!root.classList.contains("ios-safari") && !root.classList.contains("ios-standalone"))) return;

    if (!src) {
        root.style.removeProperty("--ios-wallpaper-image");
        return;
    }

    root.style.setProperty("--ios-wallpaper-image", "url(" + JSON.stringify(src) + ")");
}

function applyBgImg(src) {
    var $bg = $('#bg');
    var targetSrc = src;
    var currentSrc = $bg.attr('src');

    if (!targetSrc) {
        $bg.addClass('error').removeClass('is-loaded').removeAttr('src');
        setIosWallpaperFallback("");
        setBootWallpaperState("empty", "");
        return;
    }
    if (currentSrc === targetSrc && $bg.hasClass('is-loaded')) {
        setIosWallpaperFallback(targetSrc);
        setBootWallpaperState("loaded", targetSrc);
        return;
    }

    $bg.removeClass('error is-loaded');
    setBootWallpaperState("loading", targetSrc);

    var img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.setAttribute("fetchpriority", "high");
    img.onload = function () {
        var wallpaperRevealed = false;
        var decodeFallbackTimer = 0;
        var revealWallpaper = function () {
            if (wallpaperRevealed) return;
            wallpaperRevealed = true;
            if (decodeFallbackTimer) clearTimeout(decodeFallbackTimer);

            $bg.attr('src', targetSrc);
            requestAnimationFrame(function () {
                setIosWallpaperFallback(targetSrc);
                $bg.addClass('is-loaded');
                setBootWallpaperState("loaded", targetSrc);
            });
        };

        if (typeof img.decode === "function") {
            decodeFallbackTimer = setTimeout(revealWallpaper, 180);
            try {
                img.decode().then(revealWallpaper, revealWallpaper);
            } catch (e) {
                revealWallpaper();
            }
        } else {
            revealWallpaper();
        }
    };
    img.onerror = function () {
        $bg.addClass('error').removeClass('is-loaded').removeAttr('src');
        setIosWallpaperFallback("");
        setBootWallpaperState("error", targetSrc);
    };
    img.src = targetSrc;
}

// 设置-壁纸
function setBgImgInit() {
    var bg_img = getBgImg();
    var wallpaperType = bg_img["type"];
    $("input[name='wallpaper-type'][value='" + wallpaperType + "']").prop("checked", true);

    if (wallpaperType === "5") {
        $("#wallpaper-url").val(bg_img["path"]);
        $("#wallpaper-button").show();
        $("#wallpaper_url").show();
    } else {
        $("#wallpaper_url").hide();
        $("#wallpaper-button").hide();
    }

    applyBgImg(resolveBgImgSrc(bg_img));
}

var bgImgInitStarted = false;

function startBgImgInit() {
    if (bgImgInitStarted) return;
    bgImgInitStarted = true;
    setBgImgInit();
}

startBgImgInit();

function getPerformanceMode() {
    try {
        return normalizePerformanceMode(localStorage.getItem("sksir-performance-mode"));
    } catch (e) {
        return "auto";
    }
}

function normalizePerformanceMode(mode) {
    if (mode === "full" || mode === "lite") return mode;
    return "auto";
}

function setPerformanceMode(mode) {
    mode = normalizePerformanceMode(mode);
    try {
        localStorage.setItem("sksir-performance-mode", mode);
    } catch (e) {}

    if (typeof window.applySksirPerformanceMode === "function") {
        window.applySksirPerformanceMode();
    }
    syncPerformanceVisualState();
}

function getPerformanceModeText(mode) {
    if (mode === "full") {
        return "完整动效：保留背景模糊、毛玻璃和过渡动画，适合性能较好的设备";
    }
    if (mode === "lite") {
        return "轻量动效：关闭大部分模糊、缩放和动画，适合低配电脑";
    }
    return "自动模式会在系统减少动态效果、省流量或明显低配设备上启用轻量动效";
}

function setPerformanceInit() {
    var mode = getPerformanceMode();
    $("input[name='performance-mode'][value='" + mode + "']").prop("checked", true);
    $("#performance_text").html(getPerformanceModeText(mode));
    if (typeof window.applySksirPerformanceMode === "function") {
        window.applySksirPerformanceMode();
    }
}

// 搜索框高亮
function focusWd() {
    if (!$('body').hasClass('onsearch')) {
        var isMobileSearch = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
        keywordPanelReadyAt = isMobileSearch ? 0 : Date.now() + 320;
    }
    $("body").addClass("onsearch");
    scheduleKeywordPanelUpdate();
    setTimeout(scheduleKeywordPanelUpdate, 180);
    setTimeout(scheduleKeywordPanelUpdate, 320);
}

// 搜索框取消高亮
function blurWd() {
    keywordPanelReadyAt = 0;
    $("body").removeClass("onsearch");
    //隐藏输入
    $(".wd").val("");
    $(".search-engine").hide();
    //隐藏搜索建议
    hideKeywordPanel();
}

// 搜索建议提示
function keywordReminder() {
    var keyword = $.trim($(".wd").val());
    var requestSeq = ++keywordRequestSeq;
    keywordLocalResults = [];
    keywordRemoteSuggestions = [];
    keywordRemoteState = keyword ? (navigator.onLine ? "loading" : "offline") : "idle";
    renderKeywordPanel(keyword, requestSeq);
    loadLocalKeywordResults(keyword, requestSeq);

    if (keyword != "" && navigator.onLine) {
        $.ajax({
            url: 'https://suggestion.baidu.com/su?wd=' + encodeURIComponent(keyword),
            dataType: 'jsonp',
            jsonp: 'cb', //回调函数的参数名(键值)key
            timeout: 3500,
            success: function (data) {
                if (!canShowKeywordPanel(keyword, requestSeq)) return;
                keywordRemoteSuggestions = data.s || [];
                keywordRemoteState = "ready";
                renderKeywordPanel(keyword, requestSeq);
            },
            error: function () {
                if (requestSeq !== keywordRequestSeq) return;
                keywordRemoteState = "error";
                renderKeywordPanel(keyword, requestSeq);
            }
        })
    }
}

function getDirectNavigationUrl(value, force) {
    var input = $.trim(value || "");
    if (!input || /\s/.test(input)) return "";
    if (/^https?:\/\//i.test(input)) {
        try {
            return new URL(input).href;
        } catch (error) {
            return "";
        }
    }

    var hostPart = input.split(/[/?#]/)[0].replace(/:\d+$/, "");
    var isLocalhost = /^localhost$/i.test(hostPart);
    var isIpv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostPart);
    var isDomain = /^(?:[a-z0-9\u4e00-\u9fff](?:[a-z0-9\u4e00-\u9fff-]{0,61}[a-z0-9\u4e00-\u9fff])?\.)+[a-z\u4e00-\u9fff]{2,63}$/i.test(hostPart);
    if (!force && !isLocalhost && !isIpv4 && !isDomain) return "";
    if (input.indexOf("@") >= 0) return "";
    try {
        return new URL("https://" + input).href;
    } catch (error) {
        return "";
    }
}

function openDirectNavigation(url) {
    hideKeywordPanel();
    window.open(url, "_blank", "noopener,noreferrer");
}

function updateKeywordPanel() {
    var searchBox = $(".all-search")[0];
    var searchWrap = $(".sou")[0];
    if (!searchBox || !searchWrap) return;

    var searchRect = searchBox.getBoundingClientRect();
    var wrapRect = searchWrap.getBoundingClientRect();
    var inset = Math.min(18, Math.max(10, Math.round(searchRect.height * 0.32)));
    var panelWidth = Math.max(180, Math.round(searchRect.width - inset * 2));

    $("#keywords").css({
        width: panelWidth,
        left: Math.round(searchRect.left - wrapRect.left + inset),
        top: Math.round(searchRect.bottom - wrapRect.top - 1)
    });
}

var keywordPanelUpdateFrame = 0;

function scheduleKeywordPanelUpdate() {
    if (keywordPanelUpdateFrame) return;

    keywordPanelUpdateFrame = requestAnimationFrame(function () {
        keywordPanelUpdateFrame = 0;
        updateKeywordPanel();
    });
}

// 搜索框数据加载
function searchData() {
    var se_list = getSeList();
    var se_default = getValidSeDefault(se_list);
    var defaultSe = se_list[se_default];
    if (defaultSe) {
        $(".search").attr("action", defaultSe["url"]);
        $("#icon-se").attr("class", defaultSe["icon"]);
        $(".wd").attr("name", defaultSe["name"]);
    }

    // 判断窗口大小，添加输入框自动完成
    // var wid = $("body").width();
    // if (wid < 640) {
    //     $(".wd").attr('autocomplete', 'off');
    // } else {
    //     $(".wd").focus();
    //     focusWd();
    // }
}

// 搜索引擎列表加载
function seList() {
    var html = "";
    var se_list = getSeList();
    for (var i in se_list) {
        html += `<div class='se-li' data-url='${se_list[i]["url"]}' data-name='${se_list[i]["name"]}' data-icon='${se_list[i]["icon"]}'>
        <a class='se-li-text'><i id='icon-sou-list' class='${se_list[i]["icon"]}'></i><span>${se_list[i]["title"]}</span></a></div>`;
    }
    $(".search-engine-list").html(html);
}

// 设置-搜索引擎列表加载
function setSeInit() {
    var se_list = getSeList();
    var se_default = getValidSeDefault(se_list);
    var html = "";
    for (var i in se_list) {
        var tr = `<div class='se_list_div'><div class='se_list_num'>${i}</div>`;
        if (i === se_default) {
            tr = `<div class='se_list_div'><div class='se_list_num'>
            <i class='iconfont icon-home'></i></div>`;
        }
        tr += `<div class='se_list_name'>${se_list[i]["title"]}</div>
        <div class='se_list_button'>
        <button class='set_se_default' value='${i}' style='border-radius: 8px 0px 0px 8px;'>
        <i class='iconfont icon-home'></i></button>
        <button class='edit_se' value='${i}'>
        <i class='iconfont icon-xiugai'></i></button>
        <button class='delete_se' value='${i}' style='border-radius: 0px 8px 8px 0px;'>
        <i class='iconfont icon-delete'></i></button></div>
        </div>`;
        html += tr;
    }
    $(".se_list_table").html(html);
}

// 打开设置
var bookmarkOpenTimer = null;
var bookmarkRevealFrame = null;
var bookmarkIconTimer = null;
var bookmarkOpenRequestId = 0;

function cancelBookmarkOpenTasks() {
    bookmarkOpenRequestId++;

    if (bookmarkOpenTimer) {
        clearTimeout(bookmarkOpenTimer);
        bookmarkOpenTimer = null;
    }
    if (bookmarkRevealFrame) {
        cancelAnimationFrame(bookmarkRevealFrame);
        bookmarkRevealFrame = null;
    }
    if (bookmarkIconTimer) {
        clearTimeout(bookmarkIconTimer);
        bookmarkIconTimer = null;
    }
}

function isMobileNavViewport() {
    if (typeof window.isMobileNavPriorityViewport === "function") {
        return window.isMobileNavPriorityViewport();
    }
    return !!(window.matchMedia && window.matchMedia("(max-width: 768px)").matches);
}

function openSet() {
    $("#menu").addClass('on');

    $("#content").addClass('box setting-open').removeClass('bookmarks-open');
    cancelBookmarkOpenTasks();
    $(".mark").removeClass("is-visible");

    //隐藏书签打开设置
    $(".mark").css({
        "display": "none",
    });
    $(".set").css({
        "display": "flex",
    });
    setBackgroundFocusEffect(true);
}

// 关闭设置
function closeSet() {
    $("#menu").removeClass('on');

    closeBox();
    $("#content").removeClass('setting-open');


    //隐藏设置
    $(".set").css({
        "display": "none",
    });

    $('#menu').hide();

    // 刷新主页数据
    seList();
}

// 书签显示
function openBox() {
    cancelBookmarkOpenTasks();
    var requestId = bookmarkOpenRequestId;
    var mobileNav = isMobileNavViewport();
    var liteMode = document.documentElement.classList.contains("perf-lite");
    $("#content").addClass('box bookmarks-open').removeClass('setting-open');
    $(".mark").removeClass("is-visible");
    $(".mark").css({
        "display": "none",
    });
    setBackgroundFocusEffect(true);

    var prepareNav = typeof window.ensureNavSitesLoaded === "function"
        ? window.ensureNavSitesLoaded()
        : Promise.resolve();

    if (typeof window.ensureNavStatusResourcesLoaded === "function") {
        window.ensureNavStatusResourcesLoaded().catch(function (error) {
            console.warn("Navigation status resources failed to load", error);
        });
    }

    prepareNav.then(function () {
        if (requestId !== bookmarkOpenRequestId) return;
        if (!$("#content").hasClass("bookmarks-open") || $("#content").hasClass("setting-open")) {
            return;
        }

        bookmarkOpenTimer = setTimeout(function () {
            bookmarkOpenTimer = null;
            if (requestId !== bookmarkOpenRequestId) return;

            $(".mark").css({
                "display": "flex",
            });
            if (typeof refreshCategoryIndicators === "function") {
                refreshCategoryIndicators();
            }

            if (!mobileNav) {
                loadVisibleNavIcons();
                $(".mark").addClass("is-visible");
                return;
            }

            bookmarkRevealFrame = requestAnimationFrame(function () {
                bookmarkRevealFrame = null;
                if (requestId !== bookmarkOpenRequestId) return;
                if (!$("#content").hasClass("bookmarks-open")) return;

                $(".mark").addClass("is-visible");
                bookmarkIconTimer = setTimeout(function () {
                    bookmarkIconTimer = null;
                    if (requestId !== bookmarkOpenRequestId) return;
                    if ($("#content").hasClass("bookmarks-open")) {
                        loadVisibleNavIcons();
                    }
                }, liteMode ? 80 : 240);
            });
        }, liteMode ? 0 : (mobileNav ? 70 : 220));
    }).catch(function (error) {
        console.warn("Navigation panel failed to prepare", error);
        if (requestId !== bookmarkOpenRequestId) return;
        if (!$("#content").hasClass("bookmarks-open")) return;

        closeBox();
        iziToast.show({
            timeout: 2200,
            class: "setting-toast",
            title: "书签加载失败",
            message: "请检查网络后重试"
        });
    });
}

function loadVisibleNavIcons() {
    if (typeof window.loadDeferredNavIcons !== "function") return;
    var selectedPanel = document.querySelector(".products .mainCont.selected");
    var options = isMobileNavViewport()
        ? { batchSize: 4, batchDelay: 45 }
        : null;
    window.loadDeferredNavIcons(selectedPanel || document, options);
}

// 书签关闭
function closeBox() {
    cancelBookmarkOpenTasks();
    $("#content").removeClass('box bookmarks-open setting-open');
    $(".mark").removeClass("is-visible");
    $(".mark").css({
        "display": "none",
    });
    setBackgroundFocusEffect(false);
}

function setBackgroundFocusEffect(active) {
    var isLite = document.documentElement.classList.contains("perf-lite");
    $('#bg').css({
        "transform": active && !isLite ? 'scale(1.08)' : 'scale(1)',
        "filter": active && !isLite ? "blur(10px)" : "blur(0px)",
        "transition": isLite ? "none" : "ease 0.3s",
    });
}

function syncPerformanceVisualState() {
    if ($("#content").hasClass("box") || $("#content").hasClass("setting-open")) {
        setBackgroundFocusEffect(true);
    }
}

function closeActiveSurface() {
    var hasSearch = $("body").hasClass("onsearch");
    var hasPanel = $("#content").hasClass("box") || $("#content").hasClass("setting-open");
    var hasFloatingSearch = $(".search-engine").is(":visible") || $("#keywords").is(":visible");

    if (!hasSearch && !hasPanel && !hasFloatingSearch) return false;

    blurWd();
    if ($("#content").hasClass("setting-open")) {
        closeSet();
    } else if (hasPanel) {
        closeBox();
    }
    $(".wd").trigger("blur");
    $('#s-button').hide();
    $('.se').hide();
    $('#menu').hide();
    $('.power').show();
    return true;
}

//显示设置搜索引擎列表
function showSe() {
    $(".se_list").show();
    $(".se_add_preinstall").show();
}

//隐藏设置搜索引擎列表
function hideSe() {
    $(".se_list").hide();
    $(".se_add_preinstall").hide();
}

$(document).ready(function () {

    // 搜索框数据加载
    searchData();

    // 搜索引擎列表加载
    seList();

    // 性能模式加载
    setPerformanceInit();

    // 点击事件
    $(document).on('click', function (e) {
        // 选择搜索引擎点击
        if ($(".search-engine").is(":hidden") && $(".se").is(e.target) || $(".search-engine").is(":hidden") && $("#icon-se").is(e.target)) {
            if ($(".se").is(e.target) || $("#icon-se").is(e.target)) {
                //获取宽度
                $(".search-engine").css("width", $('.sou').width() - 30);
                //出现动画
                $(".search-engine").slideDown(160);
            }
        } else {
            if (!$(".search-engine").is(e.target) && $(".search-engine").has(e.target).length === 0) {
                $(".search-engine").slideUp(160);
            }
        }

        // 自动提示隐藏
        if (!$(".sou").is(e.target) && $(".sou").has(e.target).length === 0) {
            hideKeywordPanel();
        }
    });

    // 时间点击
    $("#time_text").click(function () {
        if ($("#content").hasClass("box")) {
            closeBox();
            closeSet();
            blurWd();
            // 隐藏搜索按钮
            $('#s-button').hide();
            // 隐藏引擎按钮
            $('.se').hide();
            $('#menu').hide();
            $('.power').show();
        } else {
            openBox();
            $('#menu').show();
            $('.power').hide();
        }
    });

    // 搜索引擎列表点击
    $(".search-engine-list").on("click", ".se-li", function () {
        var url = $(this).attr('data-url');
        var name = $(this).attr('data-name');
        var icon = $(this).attr('data-icon');
        $(".search").attr("action", url);
        $(".wd").attr("name", name);
        $("#icon-se").attr("class", icon);
        $(".search-engine").slideUp(160);
    });

    // 搜索框点击事件
    $(document).on('click', '.sou', function (e) {
        focusWd();
        // 显示搜索按钮
        $('#s-button').show();
        // 显示引擎按钮
        $('.se').show();
        if ($(e.target).closest('.se, .sou-button, .search-engine').length === 0) {
            $(".wd").trigger("focus");
            $(".search-engine").slideUp(160);
        }
    });

    $(document).on('click', '.wd', function () {
        focusWd();
        scheduleKeywordReminder(80);
        $(".search-engine").slideUp(160);
    });

    window.addEventListener("offline", function () {
        if ($("body").hasClass("onsearch")) scheduleKeywordReminder(0);
    });
    window.addEventListener("online", function () {
        if ($("body").hasClass("onsearch")) scheduleKeywordReminder(120);
    });



    // 点击其他区域关闭事件
    $(document).on('click', '.close_sou', function (event) {
        if (!$('body').hasClass('onsearch')) return;
        event.preventDefault();
        event.stopPropagation();
        closeActiveSurface();
    });

    $(document).on('click', function (event) {
        var settingOpen = $('#content').hasClass('setting-open');
        var bookmarksOpen = $('#content').hasClass('bookmarks-open');
        if (!settingOpen && !bookmarksOpen) return;
        var activePanel = settingOpen ? '.set' : '.mark';
        if ($(event.target).closest(activePanel + ', .tool-all, #menu').length) return;
        event.preventDefault();
        event.stopPropagation();
        closeActiveSurface();
    });

    $(document).on('keydown', function (event) {
        var key = event.key || event.keyCode;
        if (key !== "Escape" && key !== "Esc" && key !== 27) return;
        if (closeActiveSurface()) {
            event.preventDefault();
            event.stopPropagation();
        }
    });

    // 点击搜索引擎时隐藏自动提示
    $(document).on('click', '.se', function () {
        hideKeywordPanel();
    });

    // 恢复自动提示
    $(document).on('click', '.se-li', function () {
        hideKeywordPanel();
    });

    // 自动提示 (调用百度 api）
    $('.wd').keyup(function (event) {
        var key = event.keyCode;
        // 屏蔽上下键
        var shieldKey = [38, 40];
        if (shieldKey.includes(key)) return;
        scheduleKeywordReminder(140);
    });

    // 点击远程搜索建议或本地书签
    $("#keywords").on("click", ".keyword", function () {
        var kind = $(this).attr("data-kind");
        var wd = $(this).attr("data-query") || $(this).text();
        if (kind === "nav") {
            var url = $(this).attr("data-url");
            recordRecentNavItem({ name: wd, url: url, desc: $(this).find(".keyword-meta").text() });
            openDirectNavigation(url);
            return;
        }
        $(".wd").val(wd);
        $(".search").submit();
        //隐藏输入
        $(".wd").val("");
        hideKeywordPanel();
    });

    // 自动提示键盘方向键选择操作
    $(".wd").keydown(function (event) { //上下键获取焦点
        var key = event.keyCode;
        var $chosen = $("#keywords .keyword.choose");
        if (key === 13 && $chosen.length && $chosen.attr("data-kind") === "nav") {
            event.preventDefault();
            $chosen.trigger("click");
            return;
        }
        if (key === 13 && (event.ctrlKey || event.metaKey)) {
            var forcedUrl = getDirectNavigationUrl($(this).val(), true);
            if (forcedUrl) {
                event.preventDefault();
                openDirectNavigation(forcedUrl);
            }
            return;
        }
        if (key !== 38 && key !== 40) return;

        var id = $(".choose").attr("data-id");
        if (id === undefined) id = 0;

        if (key === 38) {
            /*向上按钮*/
            id--;
        } else if (key === 40) {
            /*向下按钮*/
            id++;
        } else {
            return;
        }
        var length = $("#keywords").attr("data-length");
        if (id > length) id = 1;
        if (id < 1) id = length;

        var $next = $(".keyword[data-id=" + id + "]");
        $next.addClass("choose").siblings().removeClass("choose");
        if ($next.attr("data-kind") !== "nav") {
            $(".wd").val($next.attr("data-query") || $next.text());
        }
    });

    $(".search").on("submit", function (event) {
        var directUrl = getDirectNavigationUrl($(".wd").val(), false);
        if (!directUrl) return;
        event.preventDefault();
        openDirectNavigation(directUrl);
    });

    $(document).on("click", ".products .quicks, .products .quickjl", function () {
        var link = this.querySelector("a[href]");
        if (!link) return;
        var panel = this.closest(".mainCont[data-nav-tab-index]");
        var tabIndex = panel ? parseInt(panel.dataset.navTabIndex || "-1", 10) : -1;
        var tab = window.NAV_SITES && window.NAV_SITES.tabs && window.NAV_SITES.tabs[tabIndex];
        if (tab && tab.lock) return;
        recordRecentNavItem({
            name: $.trim(link.textContent),
            url: link.href,
            desc: $(this).find(".quick-desc").text()
        });
        recordQuickLaunchClick(link.href);
        refreshQuickLaunchAutoOrder();
    });

    $(document).on("change", ".set-quick-launch", function () {
        writeQuickLaunchStorage(quickLaunchEnabledKey, this.checked);
        initQuickLaunch();
    });

    $(document).on("click", "#quick-launch-auto", function () {
        try {
            localStorage.removeItem(quickLaunchOrderKey);
        } catch (error) {}
        initQuickLaunch();
        iziToast.show({
            timeout: 1600,
            class: "setting-toast",
            title: "快捷入口",
            message: "已恢复按点击次数自动调整"
        });
    });

    $(document).on("change", ".quick-launch-limit", function () {
        var mobile = this.id === "quick-launch-mobile-limit";
        var value = clampQuickLaunchLimit(this.value, mobile ? 6 : 8, mobile ? 8 : 12);
        writeQuickLaunchStorage(mobile ? quickLaunchMobileLimitKey : quickLaunchDesktopLimitKey, value);
        renderQuickLaunch();
    });

    $(document).on("change", "#quick-launch-library-tab", renderQuickLaunchLibraryItems);

    $(document).on("click", "#quick-launch-library-add", function () {
        var tabs = window.NAV_SITES && window.NAV_SITES.tabs;
        var tabIndex = parseInt($("#quick-launch-library-tab").val(), 10);
        var itemIndex = parseInt($("#quick-launch-library-item").val(), 10);
        var tab = Array.isArray(tabs) && Number.isFinite(tabIndex) ? tabs[tabIndex] : null;
        var item = tab && !tab.lock && Array.isArray(tab.items) && Number.isFinite(itemIndex) ? tab.items[itemIndex] : null;
        var url = item && normalizeQuickLaunchWebUrl(item.url);
        if (!item || !url) return showQuickLaunchMessage("请选择收藏网站", true);
        var result = saveQuickLaunchCustomItem({
            name: String(item.name || item.url).trim().slice(0, 30),
            url: url,
            icon: normalizeQuickLaunchWebUrl(item.icon) || new URL("/favicon.ico", url).href,
            desc: String(item.desc || "").slice(0, 80)
        });
        if (result.full) return showQuickLaunchMessage("只能添加 " + quickLaunchCustomLimit + " 个自定义入口", true);
        showQuickLaunchMessage(result.updated ? "已更新快捷入口" : "已添加到快捷入口");
    });

    $(document).on("submit", "#quick-launch-custom-form", function (event) {
        event.preventDefault();
        var name = $.trim($("#quick-launch-custom-name").val()).slice(0, 30);
        var url = normalizeQuickLaunchWebUrl($("#quick-launch-custom-url").val());
        var rawIcon = $.trim($("#quick-launch-custom-icon").val());
        var icon = rawIcon ? normalizeQuickLaunchWebUrl(rawIcon) : "";
        if (!name) return showQuickLaunchMessage("请填写入口名称", true);
        if (!url) return showQuickLaunchMessage("网址请使用 http:// 或 https:// 开头", true);
        if (rawIcon && !icon) return showQuickLaunchMessage("图标网址请使用 http:// 或 https:// 开头", true);

        var saved = { name: name, url: url, icon: icon || new URL("/favicon.ico", url).href };
        var result = saveQuickLaunchCustomItem(saved);
        if (result.full) return showQuickLaunchMessage("只能添加 " + quickLaunchCustomLimit + " 个自定义入口", true);
        this.reset();
        showQuickLaunchMessage(result.updated ? "已更新自定义入口" : "已添加自定义入口");
    });

    $(document).on("click", ".quick-launch-custom-remove", function () {
        var url = $(this).attr("data-url");
        var items = getQuickLaunchCustomItems().filter(function (item) { return item.url !== url; });
        writeQuickLaunchStorage(quickLaunchCustomKey, items.map(function (item) {
            return { name: item.name, url: item.url, icon: item.icon, desc: item.desc || "" };
        }));
        renderQuickLaunchCustomList();
        renderQuickLaunch();
        showQuickLaunchMessage("已删除自定义入口");
    });

    $(window).on("storage", function (event) {
        if (quickLaunchStorageKeys.indexOf(event.originalEvent && event.originalEvent.key) === -1) return;
        initQuickLaunch();
    });

    $(window).on("resize", function () {
        if (quickLaunchResizeFrame) cancelAnimationFrame(quickLaunchResizeFrame);
        quickLaunchResizeFrame = requestAnimationFrame(function () {
            quickLaunchResizeFrame = 0;
            renderQuickLaunch();
        });
    });

    $(document).on("keydown", function (event) {
        if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey) return;
        var target = event.target;
        var isEditing = target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
        if (isEditing) return;

        if (event.key === "/") {
            event.preventDefault();
            focusWd();
            $("#s-button, .se").show();
            $(".wd").trigger("focus");
            scheduleKeywordReminder(0);
        } else if (event.key === "b" || event.key === "B") {
            event.preventDefault();
            $("#time_text").trigger("click");
        } else if (event.key === ",") {
            event.preventDefault();
            openSet();
            $("#menu").show().addClass("on");
            $(".power").hide();
            setSeInit();
        } else if (event.altKey && /^[1-4]$/.test(event.key)) {
            var $engine = $(".search-engine-list .se-li").eq(parseInt(event.key, 10) - 1);
            if ($engine.length) {
                event.preventDefault();
                $engine.trigger("click");
            }
        }
    });

    // 菜单点击
    $("#menu").click(function () {
        if ($(this).attr("class") === "on") {
            closeSet();
        } else {
            openSet();

            // 设置内容加载
            setSeInit(); //搜索引擎设置
        }
    });

    // 修改默认搜索引擎
    $(".se_list_table").on("click", ".set_se_default", function () {
        if (setDefaultSearchEngine($(this).val())) {
            iziToast.show({
                timeout: 1800,
                class: "setting-toast",
                title: "\u641c\u7d22\u8bbe\u7f6e",
                message: "\u5df2\u7acb\u5373\u5207\u6362\u9ed8\u8ba4\u641c\u7d22\u5f15\u64ce"
            });
        }
    });

    // 搜索引擎添加
    $(".set_se_list_add").click(function () {
        $(".se_add_content input").val("");

        hideSe();
        $(".se_add_content").show();
    });

    // 搜索引擎保存
    $(".se_add_save").click(function () {
        var key_inhere = $(".se_add_content input[name='key_inhere']").val();
        var key = $(".se_add_content input[name='key']").val();
        var title = $(".se_add_content input[name='title']").val();
        var url = $(".se_add_content input[name='url']").val();
        var name = $(".se_add_content input[name='name']").val();
        //var icon = $(".se_add_content input[name='icon']").val();
        var icon = "iconfont icon-wangluo";

        var num = /^\+?[1-9][0-9]*$/;
        if (!num.test(key)) {
            iziToast.show({
                timeout: 2000,
                message: '序号 ' + key + ' 不是正整数'
            });
            return;
        }

        var se_list = getSeList();

        if (se_list[key]) {
            iziToast.show({
                timeout: 8000,
                message: '搜索引擎 ' + key + ' 已有数据，是否覆盖？',
                buttons: [
                    ['<button>确认</button>', function (instance, toast) {
                        se_list[key] = {
                            title: title,
                            url: url,
                            name: name,
                            icon: icon,
                        };
                        setSeList(se_list);
                        setSeInit();
                        $(".se_add_content").hide();
                        //显示列表
                        showSe();

                        instance.hide({
                            transitionOut: 'flipOutX',
                        }, toast, 'buttonName');
                        iziToast.show({
                            message: '覆盖成功'
                        });
                    }, true],
                    ['<button>取消</button>', function (instance, toast) {
                        instance.hide({
                            transitionOut: 'flipOutX',
                        }, toast, 'buttonName');
                    }]
                ]
            });
            return;
        }

        if (key_inhere && key !== key_inhere) {
            delete se_list[key_inhere];
        }

        se_list[key] = {
            title: title,
            url: url,
            name: name,
            icon: icon,
        };
        setSeList(se_list);
        setSeInit();
        iziToast.show({
            timeout: 2000,
            message: '添加成功'
        });
        $(".se_add_content").hide();
        showSe();
    });

    // 关闭表单
    $(".se_add_cancel").click(function () {
        $(".se_add_content").hide();

        //显示列表
        showSe();
    });

    // 搜索引擎修改
    $(".se_list").on("click", ".edit_se", function () {

        var se_list = getSeList();
        var key = $(this).val();
        $(".se_add_content input[name='key_inhere']").val(key);
        $(".se_add_content input[name='key']").val(key);
        $(".se_add_content input[name='title']").val(se_list[key]["title"]);
        $(".se_add_content input[name='url']").val(se_list[key]["url"]);
        $(".se_add_content input[name='name']").val(se_list[key]["name"]);
        // $(".se_add_content input[name='icon']").val("iconfont icon-Earth");

        //隐藏列表
        hideSe();

        $(".se_add_content").show();
    });

    // 搜索引擎删除
    $(".se_list").on("click", ".delete_se", function () {
        var se_default = getSeDefault();
        var key = $(this).val();
        if (key == se_default) {
            iziToast.show({
                message: '默认搜索引擎不可删除'
            });
        } else {
            iziToast.show({
                timeout: 8000,
                message: '搜索引擎 ' + key + ' 是否删除？',
                buttons: [
                    ['<button>确认</button>', function (instance, toast) {
                        var se_list = getSeList();
                        delete se_list[key];
                        setSeList(se_list);
                        setSeInit();
                        instance.hide({
                            transitionOut: 'flipOutX',
                        }, toast, 'buttonName');
                        iziToast.show({
                            message: '删除成功'
                        });
                    }, true],
                    ['<button>取消</button>', function (instance, toast) {
                        instance.hide({
                            transitionOut: 'flipOutX',
                        }, toast, 'buttonName');
                    }]
                ]
            });
        }
    });

    // 恢复预设搜索引擎
    $(".set_se_list_preinstall").click(function () {
        iziToast.show({
            timeout: 8000,
            message: '现有搜索引擎数据将被清空',
            buttons: [
                ['<button>确认</button>', function (instance, toast) {
                    setSeList(se_list_preinstall);
                    Cookies.set('se_default', 1, {
                        expires: 36500
                    });
                    setSeInit();
                    instance.hide({
                        transitionOut: 'flipOutX',
                    }, toast, 'buttonName');
                    iziToast.show({
                        message: '重置成功'
                    });
                    setTimeout(function () {
                        window.location.reload()
                    }, 1000);
                }, true],
                ['<button>取消</button>', function (instance, toast) {
                    instance.hide({
                        transitionOut: 'flipOutX',
                    }, toast, 'buttonName');
                }]
            ]
        });
    });

    // 壁纸设置
    $("#wallpaper").on("click", ".set-wallpaper", function () {
        var type = $(this).val();
        var bg_img = getBgImg();
        bg_img["type"] = type;

        if (type === "1") {
            $('#wallpaper_text').html("随机显示一张预设壁纸，刷新页面以生效");
            setBgImg(bg_img);
            iziToast.show({
                message: '壁纸设置成功，刷新生效',
            });
        }

        if (type === "2") {
            $('#wallpaper_text').html("显示必应每日一图，每天更新，刷新页面以生效 | API @ 缙哥哥");
            setBgImg(bg_img);
            iziToast.show({
                message: '壁纸设置成功，刷新生效',
            });
        }

        if (type === "5") {
            $('#wallpaper_text').html("自定义壁纸地址，请输入正确地址，点击保存且刷新页面以生效");
            $("#wallpaper_url").fadeIn(100);
            $("#wallpaper-button").fadeIn(100);
            $("#wallpaper-url").val(bg_img["path"]);
        } else {
            $("#wallpaper_url").fadeOut(300);
            $("#wallpaper-button").fadeOut(300);
        }
        if (type === "4") {
            $('#wallpaper_text').html("暂未实现该功能");
        }
    });

    // 自定义壁纸设置保存
    $(".wallpaper_save").click(function () {
        var url = $("#wallpaper-url").val();
        var reg = /^https?:\/\/\S+\.(?:jpe?g|png|gif|webp|avif)(?:[?#]\S*)?$/i;
        if (!reg.test(url)) {
            iziToast.show({
                message: '请输入正确的链接',
            });
        } else {
            var bg_img = getBgImg();
            bg_img["type"] = "5";
            bg_img["path"] = url;
            setBgImg(bg_img);
            iziToast.show({
                message: '自定义壁纸设置成功，刷新生效',
            });
        }
    });

    // 性能模式设置
    $("#performance").on("click", ".set-performance", function () {
        var mode = $(this).val();
        setPerformanceMode(mode);
        $("#performance_text").html(getPerformanceModeText(mode));
        iziToast.show({
            timeout: 1800,
            class: "setting-toast",
            title: "性能模式",
            message: "已切换为" + $(this).next("label").text().trim()
        });
    });
});

$(function () {
    $(document).on("focus click keyup", ".wd", function () {
        scheduleKeywordPanelUpdate();
    });

    $(window).on("resize", function () {
        if ($("#keywords").is(":visible")) scheduleKeywordPanelUpdate();
    });
});
