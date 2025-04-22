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
            saved_time += (Date.now() - saved_time);
            localStorage.setItem(time_key, saved_time);
        }
    });

    function time() {
        clearTimeout(t);
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
        saved_time += diff;
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
window.addEventListener('load', function () {
    //载入动画
    $('#loading-box').attr('class', 'loaded');
    $('#bg').css("cssText", "transform: scale(1);filter: blur(0px);transition: ease 1.5s;");
    $('#section').css("cssText", "opacity: 1;transition: ease 1.5s;");
    $('.cover').css("cssText", "opacity: 1;transition: ease 1.5s;");

    //用户欢迎
    iziToast.settings({
        timeout: 3000,
        backgroundColor: '#ffffff40',
        titleColor: '#efefef',
        messageColor: '#efefef',
        progressBar: false,
        close: false,
        closeOnEscape: true,
        position: 'topCenter',
        transitionIn: 'bounceInDown',
        transitionOut: 'flipOutX',
        displayMode: 'replace',
        layout: '1'
    });
    setTimeout(function () {
        iziToast.show({
            title: hello,
            message: '欢迎来到 导航酱'
        });
    }, 800);

    //中文字体缓加载-此处写入字体源文件
    //先行加载简体中文子集，后续补全字集
    //由于压缩过后的中文字体仍旧过大，可转移至对象存储或 CDN 加载
    const font = new FontFace(
        "MiSans",
        "url(" + "https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/MiSans-Regular.woff2" + ")"
    );
    document.fonts.add(font);

}, false)

//进入问候
now = new Date(), hour = now.getHours()
if (hour < 6) {
    var hello = "凌晨好";
} else if (hour < 9) {
    var hello = "早上好";
} else if (hour < 12) {
    var hello = "上午好";
} else if (hour < 14) {
    var hello = "中午好";
} else if (hour < 17) {
    var hello = "下午好";
} else if (hour < 19) {
    var hello = "傍晚好";
} else if (hour < 22) {
    var hello = "晚上好";
} else {
    var hello = "夜深了";
}


    
//Tab书签页
$(function () {
    $(".mark .tab .tab-item").click(function () {
        $(this).addClass("active").siblings().removeClass("active");
        $(".products .mainCont").eq($(this).index()).css("display", "flex").siblings().css("display", "none");
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

//控制台输出
var styleTitle1 = `
font-size: 20px;
font-weight: 600;
color: rgb(244,167,89);
`
var styleTitle2 = `
font-size:12px;
color: rgb(244,167,89);
`
var styleContent = `
color: rgb(30,152,255);
`
var title1 = 'sksir'
var content = `
版 本 号：0.3
更新日期：2023-11-30

0.3 | 更新内容
1. 为标签添加了icon图标
2. 删除快捷方式添加和使用习惯导出
3. 将常用栏的添加功能取消

0.2 | 更新内容
1. 修复刷新页面时间暂时消失
2. 修复页面休眠分钟超过60m
3. 添加搜索栏交互动画

0.1 | 更新内容
1. 修复搜索栏显示距离
2. 修复添加快捷方式失效问题
`
console.log(`%c${title1}
%c${content}`, styleTitle1, styleTitle2, styleContent)

