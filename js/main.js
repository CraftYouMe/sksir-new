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

    scheduleVisitorBadge();
    scheduleWelcomeToast();
    scheduleUpdateCheck();
    scheduleMiSansFont();
    scheduleStaticCache();
    setDailyQuote();
});
var now = new Date(), hour = now.getHours()

function markFirstScreenVisible() {
    runAfterFirstPaint(function () {
        if (window.performance && typeof window.performance.now === "function") {
            window.__sksirFirstScreenMs = Math.round(window.performance.now());
        }
    }, 0);
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

function scheduleMiSansFont() {
    if (document.documentElement.classList.contains("ios-safari")) {
        document.documentElement.classList.remove("font-misans");
        return;
    }

    if (!("FontFace" in window) || !document.fonts) return;

    var cacheKey = "misans-font-ready";
    var storage = {
        get: function () {
            try {
                return localStorage.getItem(cacheKey);
            } catch (e) {
                return null;
            }
        },
        set: function () {
            try {
                localStorage.setItem(cacheKey, "1");
            } catch (e) {}
        },
        remove: function () {
            try {
                localStorage.removeItem(cacheKey);
            } catch (e) {}
        }
    };

    if (storage.get() === "1") {
        document.documentElement.classList.add("font-misans");
    }

    runAfterLoadIdle(function () {
        var font = new FontFace(
            "MiSans",
            "url(https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/MiSans-Regular.woff2)",
            { display: "optional" }
        );

        font.load().then(function (loadedFont) {
            document.fonts.add(loadedFont);
            document.documentElement.classList.add("font-misans");
            storage.set();
        }).catch(function () {
            storage.remove();
            document.documentElement.classList.remove("font-misans");
        });
    }, 2200);
}

function scheduleVisitorBadge() {
    runAfterLoadIdle(function () {
        if (document.getElementById("visitor-badge")) return;

        var link = document.createElement("a");
        link.id = "visitor-badge";
        link.href = "https://visitor-badge.laobi.icu";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.cssText = "position:fixed;top:14px;left:14px;z-index:9999;";

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

function scheduleStaticCache() {
    if (!("serviceWorker" in navigator)) return;
    if (!/^https?:$/.test(window.location.protocol)) return;

    runAfterLoadIdle(function () {
        navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).catch(function (error) {
            console.warn("Service worker registration failed", error);
        });
    }, 3200);
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
        $(this).addClass("active").siblings().removeClass("active");
        $(".products .mainCont")
            .eq($(this).index())
            .addClass("selected")
            .css("display", "flex")
            .siblings()
            .removeClass("selected")
            .css("display", "none");
        if (typeof loadVisibleNavIcons === "function") {
            loadVisibleNavIcons();
        }
        setTimeout(refreshCategoryIndicators, 0);
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

runWhenNavSitesReady(function() {
  document.querySelectorAll('.quicks').forEach(function(card) {
    card.addEventListener('click', function(e) {
      // 如果点击的是a标签本身，浏览器会自动跳转，无需处理
      // 否则手动跳转到a的href
      if (e.target.tagName.toLowerCase() !== 'a') {
        var a = card.querySelector('a');
        if (a && a.href) {
          window.open(a.href, a.target || '_self');
        }
      }
    });
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
        refreshCategoryIndicators();
    });
});

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
