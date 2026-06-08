(function () {
    var cssUrl = "https://cdn.bootcdn.net/ajax/libs/izitoast/1.4.0/css/iziToast.min.css";
    var scriptUrl = "https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-y/izitoast/1.4.0/js/iziToast.min.js";
    var queue = [];
    var loading = false;

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
            var realToast = window.iziToast;
            if (!realToast || realToast === toastProxy) return;

            queue.splice(0).forEach(function (call) {
                if (typeof realToast[call.method] === "function") {
                    realToast[call.method].apply(realToast, call.args);
                }
            });
        };
        document.head.appendChild(script);
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
