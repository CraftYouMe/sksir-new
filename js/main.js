// 本地提示框兜底
(function () {
    var defaultSettings = {};

    function merge() {
        var result = {};
        Array.prototype.slice.call(arguments).forEach(function (source) {
            if (!source) return;
            Object.keys(source).forEach(function (key) {
                result[key] = source[key];
            });
        });
        return result;
    }

    function ensureStyles() {
        if (document.getElementById("toast-fallback-style")) return;

        var style = document.createElement("style");
        style.id = "toast-fallback-style";
        style.textContent = [
            ".toast-fallback-wrap{position:fixed;top:calc(18px + env(safe-area-inset-top,0px));left:50%;z-index:2147483647;display:flex;flex-direction:column;align-items:center;gap:8px;transform:translateX(-50%);pointer-events:none}",
            ".toast-fallback{width:fit-content;max-width:min(520px,calc(100vw - 32px));min-height:44px;padding:10px 28px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(20,26,32,.78);box-shadow:0 14px 32px rgba(0,0,0,.26),inset 0 1px 0 rgba(255,255,255,.14);backdrop-filter:blur(14px) saturate(1.08);-webkit-backdrop-filter:blur(14px) saturate(1.08);color:#fff;text-shadow:none;pointer-events:auto;display:flex;align-items:center;justify-content:center;gap:10px;box-sizing:border-box;text-align:left;animation:toastFallbackIn .22s ease}",
            ".toast-fallback-title{flex:0 0 auto;margin:0;color:#fff;font-size:14px;font-weight:700;line-height:1.35;white-space:nowrap}",
            ".toast-fallback-message{flex:0 1 auto;min-width:0;font-size:14px;line-height:1.35;color:rgba(255,255,255,.74);overflow-wrap:anywhere}",
            ".toast-fallback-title+.toast-fallback-message{padding-left:10px;border-left:1px solid rgba(255,255,255,.14)}",
            ".toast-fallback-buttons{display:flex;flex:0 0 auto;align-items:center;justify-content:flex-end;gap:8px;margin:0 0 0 4px}",
            ".toast-fallback-buttons button{height:30px;padding:0 14px;border:1px solid rgba(179,195,214,.22);border-radius:999px;background:rgba(120,145,176,.30);color:#f7fbff;font-weight:700;cursor:pointer}",
            ".toast-fallback-buttons button:hover{background:rgba(145,166,193,.38)}",
            "@media (max-width:480px){.toast-fallback{min-width:0;width:calc(100vw - 32px);padding:10px 22px;justify-content:flex-start;flex-wrap:wrap;border-radius:24px}.toast-fallback-title+.toast-fallback-message{padding-left:0;border-left:0}.toast-fallback-buttons{width:100%;justify-content:flex-end;margin:2px 0 0 0}}",
            "@media (prefers-reduced-motion:reduce){.toast-fallback,.toast-fallback *{animation:none!important;transition:none!important}.toast-fallback{background:rgba(20,26,32,.92);backdrop-filter:none!important;-webkit-backdrop-filter:none!important}}",
            "@keyframes toastFallbackIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}"
        ].join("");
        document.head.appendChild(style);
    }

    function getContainer() {
        var container = document.querySelector(".toast-fallback-wrap");
        if (!container) {
            container = document.createElement("div");
            container.className = "toast-fallback-wrap";
            document.body.appendChild(container);
        }
        return container;
    }

    function normalizeButton(templateHtml) {
        var template = document.createElement("div");
        template.innerHTML = templateHtml || "<button>OK</button>";
        var button = template.firstElementChild || document.createElement("button");
        if (button.tagName.toLowerCase() !== "button") {
            var wrappedButton = document.createElement("button");
            wrappedButton.textContent = button.textContent || "OK";
            button = wrappedButton;
        }
        button.type = "button";
        return button;
    }

    var toastApi = {
        settings: function (options) {
            defaultSettings = merge(defaultSettings, options);
        },
        show: function (options) {
            ensureStyles();

            var opts = merge(defaultSettings, options);
            var container = getContainer();
            if (opts.displayMode === "replace") {
                container.innerHTML = "";
            }

            var toast = document.createElement("div");
            toast.className = "toast-fallback" + (opts.class ? " " + opts.class : "");

            if (opts.title) {
                var title = document.createElement("div");
                title.className = "toast-fallback-title";
                title.textContent = opts.title;
                toast.appendChild(title);
            }

            if (opts.message) {
                var message = document.createElement("div");
                message.className = "toast-fallback-message";
                message.textContent = opts.message;
                toast.appendChild(message);
            }

            if (Array.isArray(opts.buttons) && opts.buttons.length) {
                var buttons = document.createElement("div");
                buttons.className = "toast-fallback-buttons";
                opts.buttons.forEach(function (buttonConfig) {
                    var button = normalizeButton(buttonConfig[0]);
                    button.addEventListener("click", function () {
                        if (typeof buttonConfig[1] === "function") {
                            buttonConfig[1](toastApi, toast, "buttonName");
                        }
                    });
                    buttons.appendChild(button);
                });
                toast.appendChild(buttons);
            }

            container.appendChild(toast);

            if (opts.timeout !== false && opts.timeout !== 0) {
                setTimeout(function () {
                    toastApi.hide({}, toast);
                }, opts.timeout || 3000);
            }

            return toast;
        },
        hide: function (options, toast) {
            if (toast && toast.parentNode) {
                toast.style.opacity = "0";
                toast.style.transform = "translateY(-8px)";
                setTimeout(function () {
                    if (toast.parentNode) toast.parentNode.removeChild(toast);
                }, 180);
            }
        }
    };

    window.iziToast = toastApi;
})();

$(document).ready(function () {
    var t = setTimeout(time, 0);

    function time() {
        if (typeof t !== "undefined") {
            clearTimeout(t);
        }
        var now = Date.now();
        var dt = new Date(now);
        var mm = dt.getMonth() + 1;
        var d = dt.getDate();
        var weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        var day = dt.getDay();
        var h = dt.getHours();
        var m = dt.getMinutes();
        if (h < 10) {
            h = "0" + h;
        }
        if (m < 10) {
            m = "0" + m;
        }
        $("#time_text").html(h + '<span id="point">:</span>' + m);
        $("#day").html(mm + "&nbsp;月&nbsp;" + d + "&nbsp;日&nbsp;" + weekday[day]);
        t = setTimeout(time, 1000);
    }
});





//加载完成后执行
$(function () {
    //载入动画
    markFirstScreenVisible();

    scheduleNavSitesLoad();
    scheduleVisitorBadge();
    scheduleWelcomeToast();
    scheduleUpdateCheck();
    retireLegacyPwa();
    initNetworkStatus();
    setDailyQuote();
});
var now = new Date(), hour = now.getHours()

function markFirstScreenVisible() {
    runAfterFirstPaint(function () {
        var elapsed = window.performance && typeof window.performance.now === "function"
            ? window.performance.now()
            : 0;
        if (window.performance && typeof window.performance.now === "function") {
            window.__sksirFirstScreenMs = Math.round(elapsed);
        }
        scheduleFirstScreenReveal(elapsed);
    }, 0);
}

function scheduleFirstScreenReveal(elapsed) {
    var root = document.documentElement;
    var minVisibleMs = root.classList.contains("perf-lite") ? 180 : 420;
    var maxWallpaperWaitMs = root.classList.contains("perf-lite") ? 1800 : 3200;
    var remaining = Math.max(0, minVisibleMs - (elapsed || 0));
    var minTimeReady = false;
    var wallpaperReady = false;
    var revealed = false;

    if (window.__sksirBootFallbackTimer) {
        clearTimeout(window.__sksirBootFallbackTimer);
        window.__sksirBootFallbackTimer = 0;
    }

    setTimeout(function () {
        minTimeReady = true;
        revealWhenReady();
    }, remaining);

    waitForBootWallpaper(maxWallpaperWaitMs, function (reason) {
        wallpaperReady = true;
        window.__sksirBootWallpaperWait = reason;
        revealWhenReady();
    });

    function revealWhenReady() {
        if (revealed || !minTimeReady || !wallpaperReady) return;
        revealed = true;
        root.classList.add("is-first-screen-ready");
        setTimeout(function () {
            root.classList.remove("is-booting");
            root.classList.remove("is-first-screen-ready");
        }, root.classList.contains("perf-lite") ? 220 : 520);
    }
}

function waitForBootWallpaper(maxWaitMs, callback) {
    if (isBootWallpaperReady()) {
        callback("ready");
        return;
    }

    var completed = false;
    var timer = setTimeout(function () {
        done("timeout");
    }, maxWaitMs);

    function done(reason) {
        if (completed) return;
        completed = true;
        clearTimeout(timer);
        document.removeEventListener("sksir-wallpaper-ready", onWallpaperReady);
        callback(reason);
    }

    function onWallpaperReady() {
        done("ready");
    }

    document.addEventListener("sksir-wallpaper-ready", onWallpaperReady);
}

function isBootWallpaperReady() {
    var bg = document.getElementById("bg");
    if (bg && bg.classList.contains("is-loaded")) return true;

    var state = window.__sksirWallpaperState;
    return !!(state && state.status && state.status !== "loading");
}

function runAfterFirstPaint(callback, delay) {
    var run = function () {
        setTimeout(callback, delay || 0);
    };

    if ("requestAnimationFrame" in window) {
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(run);
        });
    } else {
        run();
    }
}

function runAfterLoadIdle(callback, timeout) {
    var run = function () {
        if ("requestIdleCallback" in window) {
            window.requestIdleCallback(callback, { timeout: timeout || 2500 });
        } else {
            setTimeout(callback, timeout || 1200);
        }
    };

    if (document.readyState === "complete") {
        run();
    } else {
        window.addEventListener("load", run, { once: true });
    }
}

var navSitesLoadPromise = null;
var navStatusLoadPromise = null;

function loadDeferredScript(id, src) {
    var existing = document.getElementById(id);
    if (existing) {
        return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.id = id;
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = function () {
            script.remove();
            reject(new Error("Failed to load " + src));
        };
        document.head.appendChild(script);
    });
}

function loadDeferredStylesheet(id, href) {
    var existing = document.getElementById(id) ||
        document.querySelector("link[href*='" + href.replace("./", "") + "']");
    if (existing) {
        return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
        var link = document.createElement("link");
        var completed = false;
        var fallbackTimer = setTimeout(function () {
            if (completed) return;
            completed = true;
            resolve();
        }, 2500);

        function finish(callback, value) {
            if (completed) return;
            completed = true;
            clearTimeout(fallbackTimer);
            callback(value);
        }

        link.id = id;
        link.rel = "stylesheet";
        link.href = href;
        link.onload = function () {
            finish(resolve);
        };
        link.onerror = function () {
            link.remove();
            finish(reject, new Error("Failed to load " + href));
        };
        document.head.appendChild(link);
    });
}

function ensureNavStatusResourcesLoaded() {
    var statusStyles = document.getElementById("status-dot-styles") ||
        document.querySelector("link[href*='css/status-dot.css']");
    if (window.startLinkStatusChecks && statusStyles) {
        return Promise.resolve(true);
    }
    if (navStatusLoadPromise) return navStatusLoadPromise;

    var styleTask = loadDeferredStylesheet("status-dot-styles", "./css/status-dot.css");
    var scriptTask = window.startLinkStatusChecks
        ? Promise.resolve()
        : loadDeferredScript("nav-status-checker", "./js/status-dot.js");

    navStatusLoadPromise = Promise.all([styleTask, scriptTask]).then(function () {
        return true;
    }).catch(function (error) {
        navStatusLoadPromise = null;
        throw error;
    });

    return navStatusLoadPromise;
}

function ensureNavSitesLoaded() {
    if (document.querySelector(".mark .mainCont")) {
        return Promise.resolve(true);
    }
    if (navSitesLoadPromise) return navSitesLoadPromise;

    navSitesLoadPromise = (window.NAV_SITES
        ? Promise.resolve()
        : loadDeferredScript("nav-sites-data", "./data/sites.js"))
        .then(function () {
            return window.renderNavSites
                ? Promise.resolve()
                : loadDeferredScript("nav-sites-renderer", "./js/nav-render.js");
        })
        .then(function () {
            if (!document.querySelector(".mark .mainCont") && typeof window.renderNavSites === "function") {
                window.renderNavSites();
            }
            if (!document.querySelector(".mark .mainCont")) {
                throw new Error("Navigation tabs were not rendered");
            }
        })
        .then(function () {
            return true;
        }).catch(function (error) {
            navSitesLoadPromise = null;
            throw error;
        });

    return navSitesLoadPromise;
}

function scheduleNavSitesLoad() {
    if (isMobileNavPriorityViewport()) {
        runAfterFirstPaint(function () {
            ensureNavSitesLoaded().catch(function (error) {
                console.warn("Navigation resources failed to load", error);
            });
        }, 120);
        return;
    }

    runAfterLoadIdle(function () {
        ensureNavSitesLoaded().catch(function (error) {
            console.warn("Navigation resources failed to load", error);
        });
    }, 1600);
}

function isMobileNavPriorityViewport() {
    return !!(window.matchMedia && window.matchMedia("(max-width: 768px)").matches);
}

window.ensureNavSitesLoaded = ensureNavSitesLoaded;
window.ensureNavStatusResourcesLoaded = ensureNavStatusResourcesLoaded;
window.isMobileNavPriorityViewport = isMobileNavPriorityViewport;

function scheduleWelcomeToast() {
    runAfterFirstPaint(function () {
        iziToast.settings({
            timeout: 2800,
            backgroundColor: 'transparent',
            titleColor: '#ffffff',
            messageColor: '#ffffff',
            progressBar: true,
            close: false,
            closeOnEscape: true,
            position: 'topCenter',
            transitionIn: 'fadeInDown',
            transitionOut: 'fadeOutUp',
            displayMode: 'replace',
            layout: '1'
        });
        iziToast.show({
            class: 'welcome-toast',
            title: getHello(),
            message: '欢迎来到 导航酱'
        });
    }, 950);
}

function setDailyQuote() {
    var quoteElement = document.getElementById("daily-quote");
    if (!quoteElement) return;
    if (window.matchMedia && window.matchMedia("(max-width: 720px)").matches) return;

    var quotes = [
        "天暗下来，你就是光",
        "路还长，天总会亮",
        "把今天过好，就是答案",
        "风会记得来时的路",
        "心有热望，日子发亮",
        "愿你眼里有星河，脚下有坦途",
        "林深时见鹿，海蓝时见鲸，梦醒时见你",
        "别急，花会沿路盛开",
        "保持热爱，奔赴山海",
        "清醒温柔，知进退也知努力",
        "把平凡的小事做得漂亮",
        "可惜我文笔平平，写不出惊鸿一场，道不出人间悲凉",
        "去做具体的事，等自然的风",
        "愿所有赶路，都有归处",
        "今日宜收藏好心情"
    ];
    var today = new Date();
    var seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    quoteElement.textContent = quotes[seed % quotes.length];
}

function scheduleVisitorBadge() {
    runAfterLoadIdle(function () {
        if (document.getElementById("visitor-badge")) return;

        var link = document.createElement("a");
        link.id = "visitor-badge";
        link.href = "https://visitor-badge.laobi.icu";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.cssText = "position:fixed;top:calc(14px + env(safe-area-inset-top,0px));left:14px;z-index:9999;";

        var img = document.createElement("img");
        img.src = "https://visitor-badge.laobi.icu/badge?page_id=sksir-new";
        img.alt = "visitor badge";
        img.loading = "lazy";
        img.decoding = "async";
        img.setAttribute("fetchpriority", "low");

        link.appendChild(img);
        document.body.appendChild(link);
    }, 3600);
}

function retireLegacyPwa() {
    runAfterLoadIdle(function () {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                return Promise.all(registrations.map(function (registration) {
                    return registration.unregister();
                }));
            }).catch(function (error) {
                console.warn("Service worker cleanup failed", error);
            });
        }

        if ("caches" in window) {
            caches.keys().then(function (keys) {
                return Promise.all(keys.filter(function (key) {
                    return key.indexOf("nav-cache-") === 0;
                }).map(function (key) {
                    return caches.delete(key);
                }));
            }).catch(function (error) {
                console.warn("Legacy cache cleanup failed", error);
            });
        }
    }, 3200);
}

function initNetworkStatus() {
    var status = document.getElementById("network-status");
    if (!status) return;
    var wasOffline = !navigator.onLine;
    var hideTimer = null;

    function show(message, state, autoHide) {
        if (hideTimer) clearTimeout(hideTimer);
        status.textContent = message;
        status.className = "network-status is-" + state;
        status.hidden = false;
        if (autoHide) {
            hideTimer = setTimeout(function () {
                status.hidden = true;
            }, autoHide);
        }
    }

    if (wasOffline) {
        show("当前离线，本地书签可使用", "offline", 0);
    }

    window.addEventListener("offline", function () {
        wasOffline = true;
        show("当前离线，本地书签可使用", "offline", 0);
    });
    window.addEventListener("online", function () {
        if (wasOffline) show("网络已恢复", "online", 1800);
        wasOffline = false;
    });
}

function scheduleUpdateCheck() {
    if (!window.fetch || !window.Promise) return;
    if (!/^https?:$/.test(window.location.protocol)) return;

    runAfterFirstPaint(function () {
        var updateButton = document.getElementById("update-check");
        var versionElement = document.getElementById("app-version");
        if (!updateButton) return;

        var versionUrl = "./data/app-version.json?t=" + Date.now();
        fetch(versionUrl, {
            cache: "no-store",
            credentials: "same-origin",
            priority: "low",
            headers: {
                "Accept": "application/json"
            }
        }).then(function (response) {
            if (!response.ok) throw new Error("Version check failed");
            return response.json();
        }).then(function (versionInfo) {
            var latestVersion = versionInfo && String(versionInfo.version || "").trim();
            if (!latestVersion) return;

            var runningVersion = getRunningAppVersion(versionElement);
            syncRunningAppVersion(versionElement, runningVersion);

            if (compareAppVersions(latestVersion, runningVersion) > 0) {
                showUpdateButtonAfterIntro(updateButton, latestVersion);
            }
        }).catch(function (error) {
            console.warn("Update check failed", error);
        });
    }, 650);
}

function getRunningAppVersion(versionElement) {
    var version = versionElement && String(versionElement.getAttribute("data-version") || "").trim();
    if (version) return version;

    version = versionElement && String(versionElement.textContent || "").trim().replace(/^v/i, "");
    if (version) return version;

    return "0.0.0.0";
}

function syncRunningAppVersion(versionElement, version) {
    if (!versionElement || !version) return;

    versionElement.textContent = "v" + version;
    versionElement.setAttribute("data-version", version);
}

function compareAppVersions(left, right) {
    var leftParts = parseAppVersion(left);
    var rightParts = parseAppVersion(right);
    var length = Math.max(leftParts.length, rightParts.length);

    for (var i = 0; i < length; i++) {
        var leftPart = leftParts[i] || 0;
        var rightPart = rightParts[i] || 0;
        if (leftPart > rightPart) return 1;
        if (leftPart < rightPart) return -1;
    }

    return 0;
}

function parseAppVersion(version) {
    return String(version || "").split(".").map(function (part) {
        var value = parseInt(part, 10);
        return isNaN(value) ? 0 : value;
    });
}

function showUpdateButtonAfterIntro(updateButton, latestVersion) {
    var elapsed = window.performance && window.performance.now ? window.performance.now() : 0;
    var introDelay = Math.max(0, 900 - elapsed);
    setTimeout(function () {
        showUpdateButton(updateButton, latestVersion);
    }, introDelay);
}

function showUpdateButton(updateButton, latestVersion) {
    var separator = updateButton.previousElementSibling;
    updateButton.hidden = false;
    if (separator && separator.classList.contains("footer-separator")) {
        separator.hidden = false;
    }
    updateButton.textContent = "\u66f4\u65b0\u5230 v" + latestVersion;

    updateButton.onclick = function () {
        updateButton.disabled = true;
        updateButton.textContent = "\u6b63\u5728\u66f4\u65b0...";

        clearSiteCaches().then(function () {
            reloadForFreshAssets(latestVersion);
        }).catch(function (error) {
            console.warn("Refresh cache failed", error);
            updateButton.disabled = false;
            updateButton.textContent = "\u66f4\u65b0\u5931\u8d25\uff0c\u518d\u8bd5\u4e00\u6b21";
        });
    };
}

function clearSiteCaches() {
    var tasks = [];

    if ("caches" in window) {
        tasks.push(caches.keys().then(function (keys) {
            return Promise.all(keys.filter(function (key) {
                return key.indexOf("nav-cache-") === 0;
            }).map(function (key) {
                return caches.delete(key);
            }));
        }));
    }

    if ("serviceWorker" in navigator) {
        tasks.push(navigator.serviceWorker.getRegistration().then(function (registration) {
            if (!registration) return null;
            return registration.update().catch(function () {
                return null;
            });
        }));
    }

    return Promise.all(tasks);
}

function reloadForFreshAssets(version) {
    var url = new URL(window.location.href);
    url.searchParams.set("site_update", version || String(Date.now()));
    window.location.replace(url.toString());
}

//进入问候
function getHello() {
    var now = new Date(), hour = now.getHours();
    if (hour < 6) {
        return "凌晨好";
    } else if (hour < 9) {
        return "早上好";
    } else if (hour < 12) {
        return "上午好";
    } else if (hour < 14) {
        return "中午好";
    } else if (hour < 17) {
        return "下午好";
    } else if (hour < 19) {
        return "傍晚好";
    } else if (hour < 22) {
        return "晚上好";
    } else {
        return "夜深了";
    }
}


    
//Tab书签页
$(function () {
    $(".mark .tab").on("click", ".tab-item", function () {
        var tabIndex = $(this).index();
        if (typeof window.ensureNavPanelRendered === "function") {
            window.ensureNavPanelRendered(tabIndex);
        }
        $(this).addClass("active").siblings().removeClass("active");
        $(".products .mainCont")
            .eq(tabIndex)
            .addClass("selected")
            .css("display", "flex")
            .siblings()
            .removeClass("selected")
            .css("display", "none");
        if (typeof loadVisibleNavIcons === "function") {
            loadVisibleNavIcons();
        }
        scheduleCategoryIndicatorRefresh();
    })
})

//设置
$(function () {
    $(".set .tabs .tab-items").click(function () {
        $(this).addClass("actives").siblings().removeClass("actives");
        $(".productss .mainConts").eq($(this).index()).css("display", "flex").siblings().css("display", "none");
    })
})

//输入框为空时阻止跳转
$(window).keydown(function (e) {
    var key = window.event ? e.keyCode : e.which;
    if (key.toString() == "13") {
        if ($(".wd").val() == "") {
            return false;
        }
    }
});

//点击搜索按钮
$(".sou-button").click(function () {
    if ($("body").attr("class") === "onsearch") {
        if ($(".wd").val() != "") {
            $("#search-submit").click();
        }
    }
});

//鼠标中键点击事件
$(window).mousedown(function (event) {
    if (event.button == 1) {
        $("#time_text").click();
    }
});

// 奖励栏密码获取
runWhenNavSitesReady(function () {
    const passBtn = document.getElementById("passBtn");
    const passInputElement = document.getElementById("passInput");
    if (!passBtn || !passInputElement) return;

    passBtn.addEventListener("click", function () {
        const password = "mypassword"; // 替换成你的密码
        const passInput = passInputElement.value.trim(); // 去除输入的空格
        const passcodeElement = document.querySelector(".passcode");
        const quickJlElement = document.querySelector(".quick-jl");

        if (passInput === password) {
            if (passcodeElement) passcodeElement.style.display = "none";
            if (quickJlElement) quickJlElement.style.visibility = "visible";
        } else {
            iziToast.show({
                timeout: 2200,
                class: "setting-toast",
                title: "密码错误",
                message: "请重新输入",
                backgroundColor: "transparent",
                close: false,
                closeOnEscape: true,
                position: "topCenter",
                transitionIn: "fadeInDown",
                transitionOut: "fadeOutUp",
                displayMode: "replace",
                layout: "1"
            });
            passInputElement.focus();
            passInputElement.select();
        }
    });
});

runWhenNavSitesReady(function () {
    var products = document.querySelector(".products");
    if (!products || products.dataset.cardClickBound === "1") return;

    products.dataset.cardClickBound = "1";
    products.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest("a")) return;

        var card = e.target.closest && e.target.closest(".quicks, .quickjl");
        if (!card || !products.contains(card)) return;

        var a = card.querySelector("a");
        if (!a || !a.href) return;

        var target = a.target || "_self";
        if (target === "_blank") {
            window.open(a.href, target, "noopener,noreferrer");
        } else {
            window.open(a.href, target);
        }
    });
});

function runWhenNavSitesReady(callback) {
    if (document.querySelector(".mark .mainCont")) {
        callback();
        return;
    }

    document.addEventListener("nav-sites-rendered", callback, { once: true });
}

$(function () {
    runWhenNavSitesReady(function () {
        initCategoryRows();
    });

    // 分类高亮及内容切换，只影响当前mainCont
    $('.products').on('click', '.category-row .category-item', function () {
        var $row = $(this).closest('.category-row');
        $(this).addClass('active').siblings().removeClass('active');
        updateCategoryIndicator($row);

        var category = $(this).text().trim();
        var $mainCont = $row.closest('.mainCont');
        $mainCont.find('.quicks').each(function () {
            if (category === '全部' || $(this).attr('data-category') === category) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    $(window).on('resize', function () {
        scheduleCategoryIndicatorRefresh();
    });
});

var categoryIndicatorRefreshFrame = 0;

function scheduleCategoryIndicatorRefresh() {
    if (categoryIndicatorRefreshFrame) return;

    categoryIndicatorRefreshFrame = requestAnimationFrame(function () {
        categoryIndicatorRefreshFrame = 0;
        refreshCategoryIndicators();
    });
}

function initCategoryRows() {
    $('.category-row').each(function () {
        var $row = $(this);
        if (!$row.children('.category-anim-bg').length) {
            $row.prepend('<div class="category-anim-bg"></div>');
        }
        updateCategoryIndicator($row);
    });
}

function updateCategoryIndicator($row) {
    var $active = $row.children('.category-item.active').first();
    var $indicator = $row.children('.category-anim-bg').first();
    if (!$active.length || !$indicator.length) return;
    if (!$row.is(':visible')) {
        $row.removeClass('has-anim-bg');
        return;
    }

    var width = $active.outerWidth();
    if (!width) {
        $row.removeClass('has-anim-bg');
        return;
    }

    var hasIndicator = $row.hasClass('has-anim-bg');
    if (!hasIndicator) {
        $indicator.css('transition', 'none');
    }

    var left = getCategoryIndicatorLeft($row[0], $active[0], width);
    $indicator.css({
        width: width,
        left: left
    });
    $row[0].style.setProperty('--category-indicator-x', left + 'px');
    $row.addClass('has-anim-bg');

    if (!hasIndicator) {
        requestAnimationFrame(function () {
            $indicator.css('transition', '');
        });
    }
}

function getCategoryIndicatorLeft(row, active, width) {
    if (!row || !active) return 0;

    var left = active.offsetLeft - row.clientLeft;
    var maxLeft = Math.max(0, row.scrollWidth - width - row.clientLeft);

    if (left < 0) return 0;
    if (left > maxLeft) return maxLeft;
    return left;
}

function refreshCategoryIndicators() {
    $('.category-row:visible').each(function () {
        updateCategoryIndicator($(this));
    });
}
