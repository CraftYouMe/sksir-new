$(document).ready(function () {
    var time_key = "my_time";  // 定义本地存储的 key

    var saved_time = localStorage.getItem(time_key);
    if (!saved_time) {
        saved_time = Date.now();
        localStorage.setItem(time_key, saved_time);
    }
    saved_time = parseInt(saved_time);

    var t = setTimeout(function() {
        time();
    }, 0);

    // 添加 visibilitychange 事件的处理函数
    document.addEventListener("visibilitychange", function() {
        if (document.visibilityState === 'visible') {
            // 如果页面已唤醒，重新计算时间差
            saved_time = Date.now();
            localStorage.setItem(time_key, saved_time);
        }
    });

    function time() {
        if (typeof t !== "undefined") {
            clearTimeout(t);
        }
        var now = Date.now();
        var dt = new Date(now);
        var saved_dt = new Date(saved_time);
        var diff = now - saved_time;
        var mm = dt.getMonth() + 1;
        var d = dt.getDate();
        var weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        var day = dt.getDay();
        var h = saved_dt.getHours();
        var m = saved_dt.getMinutes() + Math.floor(diff / (60 * 1000));
        // 如果分钟数超过60，将小时数加上相应的量，并减去60
        if (m >= 60) {
            h += Math.floor(m / 60);
            m = m % 60;
        }
        saved_time = now;
        localStorage.setItem(time_key, saved_time);
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
    $('#bg').css("cssText", "transform: scale(1);filter: blur(0px);transition: ease 1.5s;");
    $('#section').css("cssText", "opacity: 1;transition: ease 1.5s;");
    $('.cover').css("cssText", "opacity: 1;transition: ease 1.5s;");

    scheduleWelcomeToast();
    scheduleMiSansFont();
});
var now = new Date(), hour = now.getHours()

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
    runAfterLoadIdle(function () {
        setTimeout(function () {
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
        }, 600);
    }, 1800);
}

function scheduleMiSansFont() {
    if (!("FontFace" in window) || !document.fonts) return;

    runAfterLoadIdle(function () {
        var font = new FontFace(
            "MiSans",
            "url(https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/MiSans-Regular.woff2)",
            { display: "swap" }
        );

        font.load().then(function (loadedFont) {
            document.fonts.add(loadedFont);
            document.documentElement.classList.add("font-misans");
        }).catch(function () {
            document.documentElement.classList.remove("font-misans");
        });
    }, 2200);
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
    $(".mark .tab .tab-item").click(function () {
        $(this).addClass("active").siblings().removeClass("active");
        $(".products .mainCont").eq($(this).index()).css("display", "flex").siblings().css("display", "none");
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
document.getElementById("passBtn").addEventListener("click", function () {
    const password = "mypassword"; // 替换成你的密码
    const passInput = document.getElementById("passInput").value.trim(); // 去除输入的空格
    const passcodeElement = document.querySelector(".passcode");
    const quickJlElement = document.querySelector(".quick-jl");

    if (passInput === password) {
        if (passcodeElement) passcodeElement.style.display = "none";
        if (quickJlElement) quickJlElement.style.visibility = "visible";
    } else {
        alert("密码不正确，请重新输入！");
    }
});

document.addEventListener('DOMContentLoaded', function() {
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

$(function () {
    initCategoryRows();

    // 分类高亮及内容切换，只影响当前mainCont
    $('.category-row').on('click', '.category-item', function () {
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
        $row.addClass('has-anim-bg');
        updateCategoryIndicator($row);
    });
}

function updateCategoryIndicator($row) {
    var $active = $row.children('.category-item.active').first();
    var $indicator = $row.children('.category-anim-bg').first();
    if (!$active.length || !$indicator.length) return;

    requestAnimationFrame(function () {
        $indicator.css({
            width: $active.outerWidth(),
            left: $active.position().left
        });
    });
}

function refreshCategoryIndicators() {
    $('.category-row:visible').each(function () {
        updateCategoryIndicator($(this));
    });
}
