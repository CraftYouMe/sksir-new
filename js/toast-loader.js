(function () {
    var cssUrl = "https://cdn.bootcdn.net/ajax/libs/izitoast/1.4.0/css/iziToast.min.css";
    var scriptUrl = "https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-y/izitoast/1.4.0/js/iziToast.min.js";
    var queue = [];
    var loading = false;
    var fallbackTimer = null;
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

    function ensureFallbackStyles() {
        if (document.getElementById("toast-fallback-style")) return;

        var style = document.createElement("style");
        style.id = "toast-fallback-style";
        style.textContent = [
            ".toast-fallback-wrap{position:fixed;top:18px;left:50%;z-index:2147483647;display:flex;flex-direction:column;gap:8px;transform:translateX(-50%);pointer-events:none}",
            ".toast-fallback{min-width:220px;max-width:min(360px,calc(100vw - 28px));padding:12px 16px;border:1px solid rgba(255,255,255,.16);border-radius:8px;background:linear-gradient(180deg,rgba(20,26,32,.82),rgba(20,26,32,.66));box-shadow:0 14px 32px rgba(0,0,0,.26),inset 0 1px 0 rgba(255,255,255,.14);backdrop-filter:blur(14px) saturate(1.08);-webkit-backdrop-filter:blur(14px) saturate(1.08);color:#fff;text-shadow:none;pointer-events:auto;animation:toastFallbackIn .22s ease}",
            ".toast-fallback-title{font-weight:700;margin-bottom:2px;color:#fff}",
            ".toast-fallback-message{font-size:14px;line-height:1.5;color:rgba(255,255,255,.72)}",
            ".toast-fallback-buttons{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}",
            ".toast-fallback-buttons button{height:30px;padding:0 12px;border:1px solid rgba(179,195,214,.22);border-radius:6px;background:rgba(120,145,176,.30);color:#f7fbff;font-weight:700;cursor:pointer}",
            ".toast-fallback-buttons button:hover{background:rgba(145,166,193,.38)}",
            "@keyframes toastFallbackIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}"
        ].join("");
        document.head.appendChild(style);
    }

    function getFallbackContainer() {
        var container = document.querySelector(".toast-fallback-wrap");
        if (!container) {
            container = document.createElement("div");
            container.className = "toast-fallback-wrap";
            document.body.appendChild(container);
        }
        return container;
    }

    function flush(toastApi) {
        queue.splice(0).forEach(function (call) {
            if (typeof toastApi[call.method] === "function") {
                toastApi[call.method].apply(toastApi, call.args);
            }
        });
    }

    var fallbackToast = {
        settings: function (options) {
            defaultSettings = merge(defaultSettings, options);
        },
        show: function (options) {
            ensureFallbackStyles();

            var opts = merge(defaultSettings, options);
            var container = getFallbackContainer();
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
                    var template = document.createElement("div");
                    template.innerHTML = buttonConfig[0] || "<button>OK</button>";
                    var button = template.firstElementChild || document.createElement("button");
                    if (button.tagName.toLowerCase() !== "button") {
                        var wrappedButton = document.createElement("button");
                        wrappedButton.textContent = button.textContent || "OK";
                        button = wrappedButton;
                    }
                    button.type = "button";
                    button.addEventListener("click", function () {
                        if (typeof buttonConfig[1] === "function") {
                            buttonConfig[1](fallbackToast, toast, "buttonName");
                        }
                    });
                    buttons.appendChild(button);
                });
                toast.appendChild(buttons);
            }

            container.appendChild(toast);

            if (opts.timeout !== false && opts.timeout !== 0) {
                setTimeout(function () {
                    fallbackToast.hide({}, toast);
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

    function activateFallback() {
        var realToast = window.iziToast;
        if (realToast && realToast !== toastProxy && typeof realToast.show === "function") {
            flush(realToast);
            return;
        }

        window.iziToast = fallbackToast;
        flush(fallbackToast);
    }

    function ensureToastAssets() {
        if (loading) return;
        loading = true;

        if (!document.querySelector('link[data-izitoast-css]')) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = cssUrl;
            link.dataset.izitoastCss = "true";
            document.head.appendChild(link);
        }

        var script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        script.onload = function () {
            if (fallbackTimer) clearTimeout(fallbackTimer);
            var realToast = window.iziToast;
            if (!realToast || realToast === toastProxy) {
                activateFallback();
                return;
            }

            flush(realToast);
        };
        script.onerror = activateFallback;
        document.head.appendChild(script);

        fallbackTimer = setTimeout(activateFallback, 3500);
    }

    function enqueue(method, args) {
        queue.push({
            method: method,
            args: Array.prototype.slice.call(args)
        });
        ensureToastAssets();
    }

    var toastProxy = {
        settings: function () {
            queue.push({
                method: "settings",
                args: Array.prototype.slice.call(arguments)
            });
        },
        show: function () {
            enqueue("show", arguments);
        },
        hide: function () {
            enqueue("hide", arguments);
        }
    };

    if (!window.iziToast) {
        window.iziToast = toastProxy;
    }
})();
