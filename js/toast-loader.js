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
            ".toast-fallback-wrap{position:fixed;top:18px;left:50%;z-index:2147483647;display:flex;flex-direction:column;align-items:center;gap:8px;transform:translateX(-50%);pointer-events:none}",
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
