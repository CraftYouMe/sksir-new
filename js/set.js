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

function hideKeywordPanel() {
    if (keywordReminderTimer) {
        clearTimeout(keywordReminderTimer);
        keywordReminderTimer = null;
    }
    keywordRequestSeq++;
    $("#keywords").empty().removeAttr("data-length").hide();
}

function canShowKeywordPanel(keyword, requestSeq) {
    return requestSeq === keywordRequestSeq &&
        $("body").hasClass("onsearch") &&
        $(".search-engine").is(":hidden") &&
        $(".wd").val() === keyword &&
        keyword !== "";
}

function scheduleKeywordReminder(delay) {
    if (keywordReminderTimer) {
        clearTimeout(keywordReminderTimer);
    }
    keywordReminderTimer = setTimeout(function () {
        keywordReminderTimer = null;
        keywordReminder();
    }, delay || 120);
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
    if (!root || !root.classList.contains("ios-safari")) return;

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
    img.onload = function () {
        $bg.attr('src', targetSrc);
        requestAnimationFrame(function () {
            setIosWallpaperFallback(targetSrc);
            $bg.addClass('is-loaded');
            setBootWallpaperState("loaded", targetSrc);
        });
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

function scheduleBgImgInit() {
    if (typeof runAfterFirstPaint === "function") {
        runAfterFirstPaint(setBgImgInit, 0);
    } else {
        setTimeout(setBgImgInit, 0);
    }
}

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
    $("body").addClass("onsearch");
    requestAnimationFrame(updateKeywordPanel);
    setTimeout(updateKeywordPanel, 180);
    setTimeout(updateKeywordPanel, 320);
}

// 搜索框取消高亮
function blurWd() {
    $("body").removeClass("onsearch");
    //隐藏输入
    $(".wd").val("");
    $(".search-engine").hide();
    //隐藏搜索建议
    hideKeywordPanel();
}

// 搜索建议提示
function keywordReminder() {
    var keyword = $(".wd").val();
    if (keyword != "") {
        var requestSeq = ++keywordRequestSeq;
        $.ajax({
            url: 'https://suggestion.baidu.com/su?wd=' + keyword,
            dataType: 'jsonp',
            jsonp: 'cb', //回调函数的参数名(键值)key
            success: function (data) {
                if (!canShowKeywordPanel(keyword, requestSeq)) return;
                if (!data.s || data.s.length === 0) {
                    hideKeywordPanel();
                    return;
                }
                //获取宽度
                updateKeywordPanel();
                $("#keywords").empty();
                $.each(data.s, function (i, val) {
                    var $item = $("<div></div>", {
                        class: "keyword",
                        "data-id": i + 1
                    });
                    $("<i></i>", {
                        class: "iconfont icon-sousuo"
                    }).appendTo($item);
                    $item.append(document.createTextNode(val));
                    $('#keywords').append($item);
                });
                $("#keywords").attr("data-length", data.s.length).show();
            },
            error: function () {
                if (requestSeq === keywordRequestSeq) hideKeywordPanel();
            }
        })
    } else {
        hideKeywordPanel();
    }
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

function openSet() {
    $("#menu").addClass('on');

    $("#content").addClass('box setting-open').removeClass('bookmarks-open');
    if (bookmarkOpenTimer) {
        clearTimeout(bookmarkOpenTimer);
        bookmarkOpenTimer = null;
    }
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
    if (bookmarkOpenTimer) {
        clearTimeout(bookmarkOpenTimer);
        bookmarkOpenTimer = null;
    }
    $("#content").addClass('box bookmarks-open').removeClass('setting-open');
    $(".mark").removeClass("is-visible");
    $(".mark").css({
        "display": "none",
    });
    setBackgroundFocusEffect(true);

    var prepareNav = typeof window.ensureNavSitesLoaded === "function"
        ? window.ensureNavSitesLoaded()
        : Promise.resolve();

    prepareNav.then(function () {
        if (!$("#content").hasClass("bookmarks-open") || $("#content").hasClass("setting-open")) {
            return;
        }

        // 背景模糊在轻量性能模式下会被跳过，避免低配设备频繁重绘。
        bookmarkOpenTimer = setTimeout(function () {
            $(".mark").css({
                "display": "flex",
            });
            loadVisibleNavIcons();
            if (typeof refreshCategoryIndicators === "function") {
                refreshCategoryIndicators();
            }
            $(".mark").addClass("is-visible");
            bookmarkOpenTimer = null;
        }, document.documentElement.classList.contains("perf-lite") ? 0 : 220);
    }).catch(function (error) {
        console.warn("Navigation panel failed to prepare", error);
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
    window.loadDeferredNavIcons(selectedPanel || document);
}

// 书签关闭
function closeBox() {
    if (bookmarkOpenTimer) {
        clearTimeout(bookmarkOpenTimer);
        bookmarkOpenTimer = null;
    }
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

    // 壁纸远程图不参与 0.5 秒首屏目标，首屏结构出现后再加载。
    scheduleBgImgInit();

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
        $('#menu').show();
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



    // 点击其他区域关闭事件
    $(document).on('click', '.close_sou', function () {
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

    // 点击自动提示的搜索建议
    $("#keywords").on("click", ".keyword", function () {
        var wd = $(this).text();
        $(".wd").val(wd);
        $(".search").submit();
        //隐藏输入
        $(".wd").val("");
        hideKeywordPanel();
    });

    // 自动提示键盘方向键选择操作
    $(".wd").keydown(function (event) { //上下键获取焦点
        var key = event.keyCode;
        if ($.trim($(this).val()).length === 0) return;

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

        $(".keyword[data-id=" + id + "]").addClass("choose").siblings().removeClass("choose");
        $(".wd").val($(".keyword[data-id=" + id + "]").text());
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
        updateKeywordPanel();
    });

    $(window).on("resize", function () {
        if ($("#keywords").is(":visible")) updateKeywordPanel();
    });
});
