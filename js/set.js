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

var recentNavStorageKey = "sksir-recent-nav-items";
var recentNavLimit = 6;
var quickLaunchData = window.SksirQuickLaunchData;
var quickLaunchEnabledKey = quickLaunchData.enabledKey;
var quickLaunchOrderKey = quickLaunchData.orderKey;
var quickLaunchSortModeKey = quickLaunchData.sortModeKey;
var quickLaunchCustomKey = quickLaunchData.customKey;
var quickLaunchHiddenKey = quickLaunchData.hiddenKey;
var quickLaunchRosterKey = quickLaunchData.rosterKey;
var quickLaunchRosterVersionKey = quickLaunchData.rosterVersionKey;
var quickLaunchDesktopLimitKey = quickLaunchData.desktopLimitKey;
var quickLaunchMobileLimitKey = quickLaunchData.mobileLimitKey;
var quickLaunchStorageKeys = quickLaunchData.storageKeys;
var quickLaunchCustomLimit = quickLaunchData.customLimit;
var readQuickLaunchStorage = quickLaunchData.read;
var writeQuickLaunchStorage = quickLaunchData.write;
var isQuickLaunchEnabled = quickLaunchData.isEnabled;
var getQuickLaunchSortMode = quickLaunchData.getSortMode;
var normalizeQuickLaunchWebUrl = quickLaunchData.normalizeWebUrl;
var clampQuickLaunchLimit = quickLaunchData.clampLimit;
var getQuickLaunchLimit = quickLaunchData.getLimit;
var getQuickLaunchCustomItems = quickLaunchData.getCustomItems;
var repairQuickLaunchStorage = quickLaunchData.repairStorage;
var getQuickLaunchItems = quickLaunchData.getItems;
var sortQuickLaunchItems = quickLaunchData.sortItems;
var recordQuickLaunchClick = quickLaunchData.recordClick;

function refreshQuickLaunchAutoOrder() {
    if (getQuickLaunchSortMode() === "auto") {
        setTimeout(renderQuickLaunch, 0);
    }
}

function renderQuickLaunch() {
    return window.SksirQuickLaunchRenderer
        ? window.SksirQuickLaunchRenderer()
        : Promise.resolve();
}

function initQuickLaunch() {
    syncQuickLaunchSettingsControls();
    $("#quick-launch-desktop-limit").val(String(clampQuickLaunchLimit(readQuickLaunchStorage(quickLaunchDesktopLimitKey, 8), 8, 12)));
    $("#quick-launch-mobile-limit").val(String(clampQuickLaunchLimit(readQuickLaunchStorage(quickLaunchMobileLimitKey, 6), 6, 8)));
    renderQuickLaunchCustomList();
    renderQuickLaunchLibraryTabs();
    if (!isQuickLaunchEnabled()) return renderQuickLaunch();
    renderQuickLaunch();
    return Promise.resolve();
}

function syncQuickLaunchSettingsControls() {
    var enabled = isQuickLaunchEnabled();
    var enabledRange = document.getElementById("quick-launch-enabled");
    var enabledControl = document.getElementById("quick-launch-enabled-control");

    if (enabledRange) {
        enabledRange.value = enabled ? "0" : "1";
        enabledRange.setAttribute("aria-valuetext", enabled ? "开启" : "关闭");
    }
    if (enabledControl) enabledControl.setAttribute("data-slider-value", enabled ? "enabled" : "disabled");
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
        var icon = document.createElement("img");
        icon.src = item.icon;
        icon.alt = "";
        icon.loading = "lazy";
        var text = document.createElement("span");
        var name = document.createElement("strong");
        name.textContent = item.name;
        var host = document.createElement("small");
        host.textContent = new URL(item.url).hostname;
        text.title = item.url;
        text.appendChild(name);
        text.appendChild(host);
        var remove = document.createElement("button");
        remove.type = "button";
        remove.className = "quick-launch-custom-remove";
        remove.setAttribute("data-url", item.url);
        remove.setAttribute("aria-label", "删除 " + item.name);
        remove.textContent = "删除";
        row.appendChild(icon);
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
    var hiddenItems = quickLaunchData.getHiddenUrls();
    var hiddenBeforeSave = hiddenItems.slice();
    if (hiddenItems.indexOf(entry.url) !== -1) {
        writeQuickLaunchStorage(quickLaunchHiddenKey, hiddenItems.filter(function (url) {
            return url !== entry.url;
        }));
    }
    var rosterStored = readQuickLaunchStorage(quickLaunchRosterKey, null);
    if (Array.isArray(rosterStored)) {
        var rosterItems = quickLaunchData.getRosterUrls();
        if (rosterItems.indexOf(entry.url) === -1) {
            var visibleLimit = getQuickLaunchLimit();
            var emptyIndex = rosterItems.findIndex(function (url, index) {
                return index < visibleLimit && hiddenBeforeSave.indexOf(url) !== -1;
            });
            if (emptyIndex !== -1) {
                rosterItems[emptyIndex] = entry.url;
            } else {
                rosterItems.splice(Math.min(rosterItems.length, Math.max(0, visibleLimit - 1)), 0, entry.url);
            }
            writeQuickLaunchStorage(quickLaunchRosterKey, rosterItems.slice(0, quickLaunchCustomLimit));
        }
    }
    if (getQuickLaunchSortMode() === "manual") {
        var manualOrder = readQuickLaunchStorage(quickLaunchOrderKey, []);
        if (Array.isArray(manualOrder) && manualOrder.length) {
            manualOrder = manualOrder.filter(function (url) { return url !== entry.url; });
        } else {
            manualOrder = sortQuickLaunchItems(getQuickLaunchItems()).filter(function (item) {
                return item.url !== entry.url;
            }).map(function (item) {
                return item.url;
            });
        }
        var visibleLimit = getQuickLaunchLimit();
        var insertIndex = Math.min(manualOrder.length, Math.max(0, visibleLimit - 1));
        manualOrder.splice(insertIndex, 0, entry.url);
        writeQuickLaunchStorage(quickLaunchOrderKey, manualOrder.slice(0, 24));
    }
    writeQuickLaunchStorage(quickLaunchEnabledKey, true);
    $("#quick-launch-enabled").prop("checked", true);
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
window.SksirQuickLaunch = {
    storageKeys: quickLaunchStorageKeys.slice(),
    enabledKey: quickLaunchEnabledKey,
    orderKey: quickLaunchOrderKey,
    sortModeKey: quickLaunchSortModeKey,
    customKey: quickLaunchCustomKey,
    hiddenKey: quickLaunchHiddenKey,
    rosterKey: quickLaunchRosterKey,
    rosterVersionKey: quickLaunchRosterVersionKey,
    desktopLimitKey: quickLaunchDesktopLimitKey,
    mobileLimitKey: quickLaunchMobileLimitKey,
    customLimit: quickLaunchCustomLimit,
    read: readQuickLaunchStorage,
    write: writeQuickLaunchStorage,
    normalizeWebUrl: normalizeQuickLaunchWebUrl,
    clampLimit: clampQuickLaunchLimit,
    getCustomItems: getQuickLaunchCustomItems,
    isEnabled: isQuickLaunchEnabled,
    getSortMode: getQuickLaunchSortMode,
    getLimit: getQuickLaunchLimit,
    getItems: getQuickLaunchItems,
    getHiddenUrls: quickLaunchData.getHiddenUrls,
    getRosterUrls: quickLaunchData.getRosterUrls,
    sortItems: sortQuickLaunchItems,
    recordClick: recordQuickLaunchClick,
    refreshAutoOrder: refreshQuickLaunchAutoOrder,
    render: renderQuickLaunch,
    init: initQuickLaunch,
    syncSettingsControls: syncQuickLaunchSettingsControls,
    renderCustomList: renderQuickLaunchCustomList,
    renderLibraryItems: renderQuickLaunchLibraryItems,
    saveCustomItem: saveQuickLaunchCustomItem,
    showMessage: showQuickLaunchMessage
};

function hideKeywordPanel() {
    if (window.SksirSearchUI) window.SksirSearchUI.hide();
}

function getRecentNavItems() {
    var items = window.SksirStorage
        ? window.SksirStorage.readJson(recentNavStorageKey, [])
        : [];
    return Array.isArray(items) ? items.slice(0, recentNavLimit) : [];
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
    if (window.SksirStorage) {
        window.SksirStorage.writeJson(recentNavStorageKey, recentItems.slice(0, recentNavLimit));
    }
}

window.recordRecentNavItem = recordRecentNavItem;
window.getRecentNavItems = getRecentNavItems;

function scheduleKeywordReminder(delay) {
    if (window.SksirSearchUI) window.SksirSearchUI.scheduleReminder(delay);
}

/**
 * 背景图片配置
 * type: "1" 可选壁纸, "2" 必应每日一图, "5" 自定义壁纸
 * path: 可选或自定义图片地址
 */
var bg_img_preinstall = {
    "type": "1",
    "path": "https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/2026.08.01.5/icon/background1.webp",
};
var bgImgStorageKey = "sksir-bg-img";

var bg_img_pictures = [
    'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/2026.08.01.5/icon/background1.webp',
    'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/2026.08.01.5/icon/background-image2.webp',
    'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/2026.08.01.5/icon/background-image3.webp',
    'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/2026.08.01.5/icon/background-image4.webp',
    'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/2026.08.01.5/icon/background-image5.webp',
    'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/2026.08.01.5/icon/background-image6.webp'
];

var bgImgResponsiveBase = "https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/2026.08.01.5/wallpaper/responsive/";
var bgImgMobileMedia = window.matchMedia
    ? window.matchMedia("(max-width: 720px)")
    : null;

function isMobileWallpaperViewport() {
    return !!(bgImgMobileMedia && bgImgMobileMedia.matches);
}

function getPresetResponsiveWallpaperSrc(src) {
    if (bg_img_pictures.indexOf(src) === -1) return "";

    try {
        var filename = new URL(src, window.location.href).pathname.split("/").pop().replace(/\.webp$/i, "");
        return bgImgResponsiveBase + filename + (isMobileWallpaperViewport() ? "-mobile.webp" : "-desktop.webp");
    } catch (error) {
        return "";
    }
}

function getAliyunResponsiveWallpaperSrc(src) {
    if (!/^https?:\/\//i.test(src) || /[?&]x-oss-process=/i.test(src)) return src;

    try {
        var url = new URL(src);
        if (!/\.aliyuncs\.com$/i.test(url.hostname) || /\.gif$/i.test(url.pathname)) return src;

        var hash = url.hash;
        var process = isMobileWallpaperViewport()
            ? "image/resize,m_fill,w_828,h_1792/quality,Q_74/format,webp"
            : "image/resize,m_lfit,w_1920,h_1200/quality,Q_82/format,webp";
        url.hash = "";
        return url.toString() + (url.search ? "&" : "?") + "x-oss-process=" + process + hash;
    } catch (error) {
        return src;
    }
}

function resolveResponsiveBgImgSrc(src, type) {
    var source = String(src || "");
    if (!source || String(type) === "2") return source;

    var preset = getPresetResponsiveWallpaperSrc(source);
    if (preset) return preset;
    return getAliyunResponsiveWallpaperSrc(source);
}

// 获取背景图片
function getBgImg() {
    var bg_img_stored = window.SksirStorage
        ? window.SksirStorage.readJson(bgImgStorageKey, null)
        : null;
    if (bg_img_stored && bg_img_stored.type) {
        if (bg_img_stored.type === "3") bg_img_stored.type = "5";
        return bg_img_stored;
    }

    var bg_img_local = Cookies.getJSON('bg_img');
    if (bg_img_local && bg_img_local.type) {
        // 兼容旧版自定义壁纸曾写入的 type: "3"
        if (bg_img_local.type === "3") bg_img_local.type = "5";
        if (window.SksirStorage) window.SksirStorage.writeJson(bgImgStorageKey, bg_img_local);
        return bg_img_local;
    }

    setBgImg(bg_img_preinstall);
    return Object.assign({}, bg_img_preinstall);
}

// 设置背景图片
function setBgImg(bg_img) {
    if (bg_img) {
        var saved = window.SksirStorage
            ? window.SksirStorage.writeJson(bgImgStorageKey, bg_img)
            : false;
        // Keep the legacy Cookie copy only when the wallpaper URL fits safely.
        if (String(bg_img.path || "").length < 3000) {
            Cookies.set('bg_img', bg_img, {
                expires: 36500
            });
        } else {
            Cookies.remove('bg_img');
        }
        return saved || !window.SksirStorage;
    }
    return false;
}

function getSelectedBgPicture(bg_img) {
    if (!bg_img_pictures.length) return "";
    if (bg_img && bg_img_pictures.indexOf(bg_img.path) !== -1) return bg_img.path;
    return bg_img_pictures[0];
}

function isLegacyBingWallpaperUrl(src) {
    return /^https?:\/\/api\.dujin\.org\/bing\//i.test(String(src || ""));
}

function resolveBgImgSrc(bg_img) {
    switch (bg_img["type"]) {
        case "2":
            return bg_img["path"] &&
                bg_img_pictures.indexOf(bg_img["path"]) === -1 &&
                !isLegacyBingWallpaperUrl(bg_img["path"])
                ? bg_img["path"]
                : "/api/bing";
        case "5":
            return bg_img["path"] || "";
        case "1":
        default:
            return getSelectedBgPicture(bg_img);
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

function applyBgImg(src, options) {
    var $bg = $('#bg');
    var sourceSrc = String(src || "");
    var wallpaperType = options && options.type;
    var targetSrc = resolveResponsiveBgImgSrc(sourceSrc, wallpaperType);
    var currentSource = $bg.attr('data-wallpaper-source');

    if (!targetSrc) {
        $bg.addClass('error').removeClass('is-loaded').removeAttr('src data-wallpaper-source');
        setIosWallpaperFallback("");
        setBootWallpaperState("empty", "");
        return;
    }
    if (!options || !options.force) {
        if (currentSource === sourceSrc && $bg.attr('src') === targetSrc && $bg.hasClass('is-loaded')) {
            setIosWallpaperFallback(targetSrc);
            setBootWallpaperState("loaded", targetSrc);
            return;
        }
    }

    $bg.removeClass('error is-loaded');
    setBootWallpaperState("loading", targetSrc);

    function loadWallpaperCandidate(candidateSrc, allowFallback) {
        var img = new Image();
        img.decoding = "async";
        img.setAttribute("fetchpriority", "high");
        img.onload = function () {
            var wallpaperRevealed = false;
            var decodeFallbackTimer = 0;
            var revealWallpaper = function () {
                if (wallpaperRevealed) return;
                wallpaperRevealed = true;
                if (decodeFallbackTimer) clearTimeout(decodeFallbackTimer);

                $bg.attr({
                    src: candidateSrc,
                    "data-wallpaper-source": sourceSrc
                });
                requestAnimationFrame(function () {
                    setIosWallpaperFallback(candidateSrc);
                    $bg.addClass('is-loaded');
                    setBootWallpaperState("loaded", candidateSrc);
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
            if (allowFallback && candidateSrc !== sourceSrc) {
                loadWallpaperCandidate(sourceSrc, false);
                return;
            }

            $bg.addClass('error').removeClass('is-loaded').removeAttr('src data-wallpaper-source');
            setIosWallpaperFallback("");
            setBootWallpaperState("error", candidateSrc);
        };
        img.src = candidateSrc;
    }

    loadWallpaperCandidate(targetSrc, true);
}

function refreshResponsiveWallpaper() {
    var bg_img = getBgImg();
    if (String(bg_img.type) === "2") return;
    applyBgImg(resolveBgImgSrc(bg_img), {
        type: bg_img.type,
        force: true
    });
}

if (bgImgMobileMedia) {
    if (typeof bgImgMobileMedia.addEventListener === "function") {
        bgImgMobileMedia.addEventListener("change", refreshResponsiveWallpaper);
    } else if (typeof bgImgMobileMedia.addListener === "function") {
        bgImgMobileMedia.addListener(refreshResponsiveWallpaper);
    }
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

    applyBgImg(resolveBgImgSrc(bg_img), {
        type: wallpaperType
    });
}

var bgImgInitStarted = false;

function startBgImgInit() {
    if (bgImgInitStarted) return;
    bgImgInitStarted = true;
    setBgImgInit();
}

startBgImgInit();

function getPerformanceMode() {
    return normalizePerformanceMode(window.SksirStorage
        ? window.SksirStorage.read("sksir-performance-mode", "auto")
        : "auto");
}

function normalizePerformanceMode(mode) {
    if (mode === "full" || mode === "lite") return mode;
    return "auto";
}

function setPerformanceMode(mode) {
    mode = normalizePerformanceMode(mode);
    if (window.SksirStorage) window.SksirStorage.write("sksir-performance-mode", mode);

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

function getPerformanceModeIndex(mode) {
    return ["auto", "full", "lite"].indexOf(normalizePerformanceMode(mode));
}

function getPerformanceModeFromIndex(index) {
    return ["auto", "full", "lite"][Number(index)] || "auto";
}

function updatePerformanceControl(mode) {
    var normalizedMode = normalizePerformanceMode(mode);
    var range = document.getElementById("performance-range");
    var control = document.getElementById("performance");
    var labels = { auto: "自动", full: "完整", lite: "轻量" };
    if (range) {
        range.value = String(getPerformanceModeIndex(normalizedMode));
        range.setAttribute("aria-valuetext", labels[normalizedMode]);
    }
    if (control) control.setAttribute("data-performance-mode", normalizedMode);
    $("#performance_text").text(getPerformanceModeText(normalizedMode));
}

function setPerformanceInit() {
    var mode = getPerformanceMode();
    updatePerformanceControl(mode);
    if (typeof window.applySksirPerformanceMode === "function") {
        window.applySksirPerformanceMode();
    }
}

// 搜索框高亮
function focusWd() {
    if (window.SksirSearchUI) window.SksirSearchUI.focus();
}

// 搜索框取消高亮
function blurWd() {
    if (window.SksirSearchUI) window.SksirSearchUI.blur();
}

// 搜索建议提示
function keywordReminder() {
    if (window.SksirSearchUI) window.SksirSearchUI.remind();
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

window.SksirSearchActions = {
    getDirectNavigationUrl: getDirectNavigationUrl,
    openDirectNavigation: openDirectNavigation,
    recordRecentNavItem: recordRecentNavItem
};

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
    // 设置内容按需渲染。
    var loadSettings = typeof window.ensureSettingsResourcesLoaded === "function"
        ? window.ensureSettingsResourcesLoaded()
        : Promise.resolve(true);

    return loadSettings.then(function () {
        document.body.classList.remove("bookmarks-surface-open");
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
        setSeInit();
        setBackgroundFocusEffect(true);
        return true;
    }).catch(function (error) {
        $("#menu").removeClass('on');
        $(".power").show();
        console.warn("Settings resources failed to load", error);
        iziToast.show({
            timeout: 2200,
            class: "setting-toast",
            title: "设置加载失败",
            message: "请检查网络后重试"
        });
        return false;
    });
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
    document.body.classList.add("bookmarks-surface-open");
    $("#content").addClass('box bookmarks-open').removeClass('setting-open');
    $(".mark").removeClass("is-visible").addClass("is-loading");
    $(".mark").css({
        "display": "flex",
    });
    requestAnimationFrame(function () {
        if ($("#content").hasClass("bookmarks-open")) {
            $(".mark").addClass("is-visible");
        }
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
            if (typeof window.scheduleBookmarkCenterFilter === "function") {
                window.scheduleBookmarkCenterFilter();
            }
            $(".mark").removeClass("is-loading");

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
    document.body.classList.remove("bookmarks-surface-open");
    $("#content").removeClass('box bookmarks-open setting-open');
    $(".mark").removeClass("is-visible");
    $(".mark").removeClass("is-loading");
    $(".mark").css({
        "display": "none",
    });
    var bookmarkSearch = document.getElementById("bookmark-search-input");
    if (bookmarkSearch) bookmarkSearch.value = "";
    var bookmarkEmpty = document.getElementById("bookmark-empty");
    if (bookmarkEmpty) bookmarkEmpty.hidden = true;
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

    // 搜索框点击事件
    $(document).on('click', '.sou', function (e) {
        focusWd();
        // 显示搜索按钮
        $('#s-button').show();
        // 显示引擎按钮
        $('.se').show();
        if ($(e.target).closest('.se, .sou-button, .search-engine').length === 0) {
            $(".wd").trigger("focus");
        }
    });

    $(document).on('click', '.wd', function () {
        focusWd();
        scheduleKeywordReminder(80);
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
        if ($(event.target).closest(activePanel + ', .tool-all, #menu, #bookmark-quick-context-menu, .settings-confirm-dialog, .bookmark-item-dialog').length) return;
        event.preventDefault();
        event.stopPropagation();
        closeActiveSurface();
    });

    $(document).on('keydown', function (event) {
        var key = event.key || event.keyCode;
        if (key !== "Escape" && key !== "Esc" && key !== 27) return;
        // Let child dialogs consume Escape before closing the settings surface.
        var childDialog = document.querySelector(".settings-confirm-dialog:not([hidden]), .bookmark-item-dialog:not([hidden])");
        if (document.querySelector("dialog[open]") || childDialog) return;
        if (closeActiveSurface()) {
            event.preventDefault();
            event.stopPropagation();
        }
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
            openSet().then(function (opened) {
                if (!opened) return;
                $("#menu").show().addClass("on");
                $(".power").hide();
            });
        } else if (event.altKey && /^[1-4]$/.test(event.key)) {
            var engines = document.querySelectorAll(".search-engine-list .se-li");
            var engine = engines[parseInt(event.key, 10) - 1];
            if (engine) {
                event.preventDefault();
                engine.click();
            }
        }
    });

    // 菜单点击
    $("#menu").click(function () {
        if ($(this).hasClass("on")) {
            closeSet();
        } else {
            openSet();
        }
    });


    // 性能模式设置
    $("#performance").on("input", ".set-performance", function () {
        var mode = getPerformanceModeFromIndex(this.value);
        setPerformanceMode(mode);
        updatePerformanceControl(mode);
    }).on("change", ".set-performance", function () {
        var mode = getPerformanceModeFromIndex(this.value);
        var labels = { auto: "自动", full: "完整", lite: "轻量" };
        iziToast.show({
            timeout: 1800,
            class: "setting-toast",
            title: "性能模式",
            message: "已切换为" + labels[mode]
        });
    });
});
