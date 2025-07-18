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
    return se_default ? se_default : "2";
}

/**
 * 背景图片配置
 * type: "1" 默认壁纸, "2" 必应每日一图, "5" 自定义壁纸
 * path: 自定义图片地址
 */
var bg_img_preinstall = {
    "type": "1",
    "path": "",
};

// 获取背景图片
function getBgImg() {
    var bg_img_local = Cookies.get('bg_img');
    if (bg_img_local && bg_img_local !== "{}") {
        return JSON.parse(bg_img_local);
    } else {
        setBgImg(bg_img_preinstall);
        return bg_img_preinstall;
    }
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

// 设置-壁纸
function setBgImgInit() {
    var bg_img = getBgImg();
    $("input[name='wallpaper-type'][value=" + bg_img["type"] + "]").click();
    if (bg_img["type"] === "5") {
        $("#wallpaper-url").val(bg_img["path"]);
        $("#wallpaper-button").fadeIn(100);
        $("#wallpaper_url").fadeIn(100);
    } else {
        $("#wallpaper_url").fadeOut(300);
        $("#wallpaper-button").fadeOut(300);
    }

    switch (bg_img["type"]) {
        case "1":
            // 默认壁纸轮播，每张图片尽量刷新到一次
            var pictures = [
                'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/img/background-image.jpg',
                'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/img/background-image2.PNG',
                'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/img/background-image3.JPG',
                'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/img/background-image4.PNG',
                'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/img/background-image5.JPG',
                'https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/img/background-image6.PNG'
            ];
            // 记录上次索引
            var idx = parseInt(localStorage.getItem('bg_img_idx') || '0', 10);
            $('#bg').attr('src', pictures[idx]);
            idx = (idx + 1) % pictures.length;
            localStorage.setItem('bg_img_idx', idx);
            break;
        case "2":
            $('#bg').attr('src', 'https://api.dujin.org/bing/1920.php');
            break;
        case "5":
            $('#bg').attr('src', bg_img["path"]);
            break;
    }
}

// 搜索框高亮
function focusWd() {
    $("body").addClass("onsearch");
}

// 搜索框取消高亮
function blurWd() {
    $("body").removeClass("onsearch");
    //隐藏输入
    $(".wd").val("");
    //隐藏搜索建议
    $("#keywords").hide();
}

// 搜索建议提示
function keywordReminder() {
    var keyword = $(".wd").val();
    if (keyword != "") {
        $.ajax({
            url: 'https://suggestion.baidu.com/su?wd=' + keyword,
            dataType: 'jsonp',
            jsonp: 'cb', //回调函数的参数名(键值)key
            success: function (data) {
                //获取宽度
                $("#keywords").css("width", $('.sou').width());
                $("#keywords").empty().show();
                $.each(data.s, function (i, val) {
                    $('#keywords').append(`<div class="keyword" data-id="${i + 1}"><i class='iconfont icon-sousuo'></i>${val}</div>`);
                });
                $("#keywords").attr("data-length", data.s["length"]);
                $(".keyword").click(function () {
                    $(".wd").val($(this).text());
                    $("#search-submit").click();
                });
            },
            error: function () {
                $("#keywords").empty().show();
                $("#keywords").hide();
            }
        })
    } else {
        $("#keywords").empty().show();
        $("#keywords").hide();
    }
}

// 搜索框数据加载
function searchData() {
    var se_default = getSeDefault();
    var se_list = getSeList();
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
    var se_default = getSeDefault();
    var se_list = getSeList();
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
function openSet() {
    $("#menu").addClass('on');

    openBox();

    //隐藏书签打开设置
    $(".mark").css({
        "display": "none",
    });
    $(".set").css({
        "display": "flex",
    });
}

// 关闭设置
function closeSet() {
    $("#menu").removeClass('on');

    closeBox();


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
    $("#content").addClass('box');
    $(".mark").css({
        "display": "flex",
    });
    //时间上移
    $(".tool-all").css({
        "transform": 'translateY(-220%)'
    });
    //背景模糊
    $('#bg').css({
        "transform": 'scale(1.08)',
        "filter": "blur(10px)",
        "transition": "ease 0.3s",
    });
}

// 书签关闭
function closeBox() {
    $("#content").removeClass('box');
    $(".mark").css({
        "display": "none",
    });
    //时间下移
    $(".tool-all").css({
        "transform": 'translateY(-120%)'
    });
    //背景模糊
    $('#bg').css({
        "transform": 'scale(1)',
        "filter": "blur(0px)",
        "transition": "ease 0.3s",
    });
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

    // 壁纸数据加载
    setBgImgInit();

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
            $("#keywords").hide();
        }
    });

    // 时间点击
    $("#time_text").click(function () {
        if ($("#content").attr("class") === "box") {
            closeBox();
            closeSet();
            blurWd();
            // 隐藏搜索按钮
            $('#s-button').hide();
            // 隐藏引擎按钮
            $('.se').hide();
            $('#menu').hide();
        } else {
            openBox();
            $('#menu').show();
            // 添加时间向上移动的样式
            $(".tool-all").css({
                "transform": 'translateY(-220%)'
            });
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
    $(document).on('click', '.sou', function () {
        focusWd();
        // 显示搜索按钮
        $('#s-button').show();
        // 显示引擎按钮
        $('.se').show();
        $('#menu').show();
        $(".search-engine").slideUp(160);
    });

    $(document).on('click', '.wd', function () {
        focusWd();
        keywordReminder();
        $(".search-engine").slideUp(160);
    });



    // 点击其他区域关闭事件
    $(document).on('click', '.close_sou', function () {
        blurWd();
        closeSet();
        // 隐藏搜索按钮
        $('#s-button').hide();
        // 隐藏引擎按钮
        $('.se').hide();
        $('#menu').hide();
    });

    // 点击搜索引擎时隐藏自动提示
    $(document).on('click', '.se', function () {
        $('#keywords').toggle();
    });

    // 恢复自动提示
    $(document).on('click', '.se-li', function () {
        $('#keywords').show();
    });

    // 自动提示 (调用百度 api）
    $('.wd').keyup(function (event) {
        var key = event.keyCode;
        // 屏蔽上下键
        var shieldKey = [38, 40];
        if (shieldKey.includes(key)) return;
        keywordReminder();
    });

    // 点击自动提示的搜索建议
    $("#keywords").on("click", ".wd", function () {
        var wd = $(this).text();
        $(".wd").val(wd);
        $(".search").submit();
        //隐藏输入
        $(".wd").val("");
        $("#keywords").hide();
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
        var name = $(this).val();
        Cookies.set('se_default', name, {
            expires: 36500
        });
        iziToast.show({
            timeout: 8000,
            message: '是否设置为默认搜索引擎？',
            buttons: [
                ['<button>确认</button>', function (instance, toast) {
                    setSeInit();
                    instance.hide({
                        transitionOut: 'flipOutX',
                    }, toast, 'buttonName');
                    iziToast.show({
                        message: '设置成功'
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
            $('#wallpaper_text').html("显示默认壁纸，刷新页面以生效");
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

        if (type === "3") {
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
        var reg = /^https?:\/\/(?:[a-z0-9-]+\.)*[a-z0-9-]+(?:\.[a-z]{2,})+(?:\/\S*)?\.(?:jpe?g|png|gif)$/i;
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
});
