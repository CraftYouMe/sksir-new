(function () {
    "use strict";

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

    function isBootWallpaperReady() {
        var background = document.getElementById("bg");
        if (background && background.classList.contains("is-loaded")) return true;
        var state = window.__sksirWallpaperState;
        return !!(state && state.status && state.status !== "loading");
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

    function scheduleFirstScreenReveal(elapsed, firstScreenTask) {
        var root = document.documentElement;
        var minVisibleMs = root.classList.contains("perf-lite") ? 180 : 420;
        var maxWallpaperWaitMs = root.classList.contains("perf-lite") ? 1800 : 3200;
        var remaining = Math.max(0, minVisibleMs - (elapsed || 0));
        var minTimeReady = false;
        var wallpaperReady = false;
        var firstScreenContentReady = false;
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

        Promise.resolve(firstScreenTask).catch(function (error) {
            console.warn("First screen content failed to prepare", error);
        }).then(function () {
            firstScreenContentReady = true;
            revealWhenReady();
        });

        function revealWhenReady() {
            if (revealed || !minTimeReady || !wallpaperReady || !firstScreenContentReady) return;
            revealed = true;
            root.classList.add("is-first-screen-ready");
            setTimeout(function () {
                root.classList.remove("is-booting");
                root.classList.remove("is-first-screen-ready");
            }, root.classList.contains("perf-lite") ? 220 : 520);
        }
    }

    function markFirstScreenVisible(firstScreenTask) {
        runAfterFirstPaint(function () {
            var elapsed = window.performance && typeof window.performance.now === "function"
                ? window.performance.now()
                : 0;
            if (window.performance && typeof window.performance.now === "function") {
                window.__sksirFirstScreenMs = Math.round(elapsed);
            }
            scheduleFirstScreenReveal(elapsed, firstScreenTask);
        }, 0);
    }

    function start() {
        var quickLaunchReady = typeof window.prepareQuickLaunchForBoot === "function"
            ? window.prepareQuickLaunchForBoot()
            : Promise.resolve();
        markFirstScreenVisible(quickLaunchReady);
        scheduleNavSitesLoad();
        scheduleVisitorBadge();
        scheduleWelcomeToast();
        scheduleUpdateCheck();
        retireLegacyPwa();
        initNetworkStatus();
        setDailyQuote();
    }

    window.runAfterFirstPaint = runAfterFirstPaint;
    window.runAfterLoadIdle = runAfterLoadIdle;
    window.SksirBootstrap = { start: start };

    // 加载完成后执行
    // 载入动画
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
}());
