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

    function scheduleFirstScreenReveal(elapsed, firstScreenTask) {
        var root = document.documentElement;
        if (window.__sksirEarlyRevealStarted || !root.classList.contains("is-booting")) return;
        var minVisibleMs = root.classList.contains("perf-lite") ? 80 : 160;
        var remaining = Math.max(0, minVisibleMs - (elapsed || 0));
        var minTimeReady = false;
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

        Promise.resolve(firstScreenTask).catch(function (error) {
            console.warn("First screen content failed to prepare", error);
        }).then(function () {
            firstScreenContentReady = true;
            revealWhenReady();
        });

        function revealWhenReady() {
            if (revealed || !minTimeReady || !firstScreenContentReady) return;
            revealed = true;
            root.classList.add("is-first-screen-ready");
            setTimeout(function () {
                root.classList.remove("is-booting");
                root.classList.remove("is-first-screen-ready");
            }, root.classList.contains("perf-lite") ? 140 : 280);
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
