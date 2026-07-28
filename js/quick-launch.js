(function () {
    var resizeFrame = 0;
    var suppressClickUntil = 0;

    function api() {
        return window.SksirQuickLaunch;
    }

    function readValue(id) {
        var element = document.getElementById(id);
        return element ? element.value : "";
    }

    function saveOrder(service) {
        var order = Array.from(document.querySelectorAll("#quick-launch .quick-launch-item")).map(function (item) {
            return item.getAttribute("data-url");
        });
        service.write(service.orderKey, order);
    }

    function animateReorder(panel, previousRects) {
        panel.querySelectorAll(".quick-launch-item").forEach(function (entry) {
            var previous = previousRects.get(entry);
            if (!previous || entry.classList.contains("is-dragging")) return;
            var current = entry.getBoundingClientRect();
            var deltaX = previous.left - current.left;
            var deltaY = previous.top - current.top;
            if (!deltaX && !deltaY) return;
            if (typeof entry.animate !== "function") return;
            if (typeof entry.getAnimations === "function") {
                entry.getAnimations().forEach(function (animation) { animation.cancel(); });
            }
            entry.animate([
                { transform: "translate(" + deltaX + "px," + deltaY + "px)" },
                { transform: "translate(0,0)" }
            ], { duration: 160, easing: "cubic-bezier(.2,.8,.2,1)" });
        });
    }

    function bindDrag(item, service) {
        var startX = 0;
        var startY = 0;
        var pointerX = 0;
        var pointerY = 0;
        var moveFrame = 0;
        var dragging = false;
        var ghost = null;
        var placeholder = null;
        var panel = null;

        function moveGhostImmediately(event) {
            var points = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : null;
            var point = points && points.length ? points[points.length - 1] : event;
            pointerX = point.clientX;
            pointerY = point.clientY;
            if (ghost) {
                ghost.style.transform = "translate3d(" + (pointerX - 22) + "px," +
                    (pointerY - 30) + "px,0)";
            }
        }

        function updateDragPosition() {
            moveFrame = 0;
            if (!dragging || !ghost || !placeholder || !panel) return;

            var entries = Array.from(panel.querySelectorAll(".quick-launch-item")).filter(function (entry) {
                return entry !== item;
            });
            var before = null;
            for (var index = 0; index < entries.length; index += 1) {
                var rect = entries[index].getBoundingClientRect();
                if (pointerX < rect.left + rect.width / 2) {
                    before = entries[index];
                    break;
                }
            }
            var nextNode = before || panel.querySelector(".quick-launch-add");
            if (placeholder.nextSibling === nextNode) return;

            var previousRects = new Map();
            entries.forEach(function (entry) {
                previousRects.set(entry, entry.getBoundingClientRect());
            });
            panel.insertBefore(placeholder, nextNode);
            animateReorder(panel, previousRects);
        }

        function scheduleDragPosition(event) {
            moveGhostImmediately(event);
            if (!moveFrame) moveFrame = requestAnimationFrame(updateDragPosition);
        }

        function startDrag(event) {
            dragging = true;
            panel = item.parentNode;
            item.classList.add("is-dragging");
            panel.classList.add("is-reordering");
            item.setAttribute("aria-grabbed", "true");
            placeholder = document.createElement("span");
            placeholder.className = "quick-launch-drop-placeholder";
            placeholder.setAttribute("aria-hidden", "true");
            panel.insertBefore(placeholder, item);
            ghost = item.cloneNode(true);
            ghost.removeAttribute("href");
            ghost.removeAttribute("data-url");
            ghost.className = "quick-launch-drag-ghost";
            var label = document.createElement("span");
            label.textContent = item.getAttribute("aria-label") || item.title || "快捷入口";
            ghost.appendChild(label);
            document.body.appendChild(ghost);
            scheduleDragPosition(event);
        }

        item.addEventListener("pointerdown", function (event) {
            if (event.button !== undefined && event.button !== 0) return;
            startX = event.clientX;
            startY = event.clientY;
            dragging = false;
            item.setPointerCapture(event.pointerId);
        });

        item.addEventListener("pointermove", function (event) {
            if (!item.hasPointerCapture(event.pointerId)) return;
            if (!dragging && Math.hypot(event.clientX - startX, event.clientY - startY) < 3) return;
            if (!dragging) startDrag(event);
            event.preventDefault();
            scheduleDragPosition(event);
        });

        item.addEventListener("pointerrawupdate", function (event) {
            if (!dragging || !item.hasPointerCapture(event.pointerId)) return;
            moveGhostImmediately(event);
        });

        function finishDrag(event) {
            if (item.hasPointerCapture(event.pointerId)) item.releasePointerCapture(event.pointerId);
            if (moveFrame) {
                cancelAnimationFrame(moveFrame);
                moveFrame = 0;
            }
            if (!dragging) return;

            panel.insertBefore(item, placeholder);
            placeholder.remove();
            placeholder = null;
            item.classList.remove("is-dragging");
            item.removeAttribute("aria-grabbed");
            panel.classList.remove("is-reordering");
            if (ghost) {
                var finalRect = item.getBoundingClientRect();
                ghost.style.transition = "transform 160ms cubic-bezier(.2,.8,.2,1), opacity 160ms ease";
                ghost.style.opacity = "0";
                ghost.style.transform = "translate3d(" + (finalRect.left - 5) + "px," +
                    (finalRect.top - 5) + "px,0) scale(0.78)";
                setTimeout(function () {
                    if (ghost) ghost.remove();
                    ghost = null;
                }, 170);
            }
            suppressClickUntil = Date.now() + 400;
            saveOrder(service);
            item.classList.add("just-dropped");
            setTimeout(function () { item.classList.remove("just-dropped"); }, 320);
            event.preventDefault();
            dragging = false;
            panel = null;
        }

        item.addEventListener("pointerup", finishDrag);
        item.addEventListener("pointercancel", finishDrag);
        item.addEventListener("dragstart", function (event) {
            event.preventDefault();
        });
    }

    function render() {
        var service = api();
        var panel = document.getElementById("quick-launch");
        if (!service || !panel) return Promise.resolve();
        if (!service.isEnabled()) {
            panel.hidden = true;
            panel.replaceChildren();
            return Promise.resolve();
        }

        var items = service.sortItems(service.getItems()).slice(0, service.getLimit());
        panel.replaceChildren();
        items.forEach(function (entry) {
            var link = document.createElement("a");
            link.className = "quick-launch-item";
            link.href = entry.url;
            link.target = entry.target;
            link.rel = entry.rel;
            link.title = entry.name;
            link.setAttribute("aria-label", entry.name);
            link.setAttribute("data-url", entry.url);

            var icon = document.createElement("img");
            icon.src = entry.icon;
            icon.alt = "";
            icon.loading = "lazy";
            icon.decoding = "async";
            icon.onerror = function () {
                this.onerror = null;
                this.src = "./img/icon/fangdiu.png";
            };
            link.appendChild(icon);
            link.addEventListener("click", function (event) {
                event.stopPropagation();
                if (Date.now() < suppressClickUntil) {
                    event.preventDefault();
                    return;
                }
                service.recordClick(entry.url);
                recordRecentNavItem(entry);
                service.refreshAutoOrder();
            });
            bindDrag(link, service);
            panel.appendChild(link);
        });
        var addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "quick-launch-add";
        addButton.title = "添加快捷入口";
        addButton.setAttribute("aria-label", "添加快捷入口");
        addButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>';
        panel.appendChild(addButton);
        panel.hidden = false;
        return Promise.resolve();
    }

    function setQuickAddDialog(open) {
        var dialog = document.getElementById("quick-launch-add-dialog");
        if (!dialog) return;
        dialog.hidden = !open;
        document.body.classList.toggle("quick-add-open", open);
        if (open) {
            requestAnimationFrame(function () {
                dialog.classList.add("is-visible");
                var name = document.getElementById("quick-launch-home-name");
                if (name) name.focus();
            });
        } else {
            dialog.classList.remove("is-visible");
        }
    }

    function saveFormItem(service, values, form) {
        var name = String(values.name || "").trim().slice(0, 30);
        var url = service.normalizeWebUrl(values.url);
        var rawIcon = String(values.icon || "").trim();
        var icon = rawIcon ? service.normalizeWebUrl(rawIcon) : "";
        if (!name) return service.showMessage("请填写入口名称", true);
        if (!url) return service.showMessage("请输入正确的网址", true);
        if (rawIcon && !icon) return service.showMessage("请输入正确的图标网址", true);
        var result = service.saveCustomItem({
            name: name,
            url: url,
            icon: icon || new URL("/favicon.ico", url).href
        });
        if (result.full) return service.showMessage("只能添加 " + service.customLimit + " 个自定义入口", true);
        if (form) form.reset();
        service.showMessage(result.updated ? "已更新快捷入口" : "已添加到首页");
        return true;
    }

    window.SksirQuickLaunchRenderer = render;

    function addLibraryItem(service) {
        var tabs = window.NAV_SITES && window.NAV_SITES.tabs;
        var tabIndex = parseInt(readValue("quick-launch-library-tab"), 10);
        var itemIndex = parseInt(readValue("quick-launch-library-item"), 10);
        var tab = Array.isArray(tabs) && Number.isFinite(tabIndex) ? tabs[tabIndex] : null;
        var item = tab && !tab.lock && Array.isArray(tab.items) && Number.isFinite(itemIndex)
            ? tab.items[itemIndex]
            : null;
        var url = item && service.normalizeWebUrl(item.url);
        if (!item || !url) return service.showMessage("请选择收藏网站", true);
        var result = service.saveCustomItem({
            name: String(item.name || item.url).trim().slice(0, 30),
            url: url,
            icon: service.normalizeWebUrl(item.icon) || new URL("/favicon.ico", url).href,
            desc: String(item.desc || "").slice(0, 80)
        });
        if (result.full) return service.showMessage("只能添加 " + service.customLimit + " 个自定义入口", true);
        service.showMessage(result.updated ? "已更新快捷入口" : "已添加到快捷入口");
    }

    function addCustomItem(event, service) {
        event.preventDefault();
        saveFormItem(service, {
            name: readValue("quick-launch-custom-name"),
            url: readValue("quick-launch-custom-url"),
            icon: readValue("quick-launch-custom-icon")
        }, event.target);
    }

    function removeCustomItem(button, service) {
        var url = button.getAttribute("data-url");
        var items = service.getCustomItems().filter(function (item) { return item.url !== url; });
        service.write(service.customKey, items.map(function (item) {
            return { name: item.name, url: item.url, icon: item.icon, desc: item.desc || "" };
        }));
        service.renderCustomList();
        service.render();
        service.showMessage("已删除自定义入口");
    }

    document.addEventListener("click", function (event) {
        var service = api();
        if (!service) return;

        var navItem = event.target.closest(".products .quicks, .products .quickjl");
        if (navItem) {
            var link = navItem.querySelector("a[href]");
            var panel = navItem.closest(".mainCont[data-nav-tab-index]");
            var tabIndex = panel ? parseInt(panel.dataset.navTabIndex || "-1", 10) : -1;
            var tab = window.NAV_SITES && window.NAV_SITES.tabs && window.NAV_SITES.tabs[tabIndex];
            if (link && !(tab && tab.lock)) {
                recordRecentNavItem({
                    name: link.textContent.trim(),
                    url: link.href,
                    desc: (navItem.querySelector(".quick-desc") || {}).textContent || ""
                });
                service.recordClick(link.href);
                service.refreshAutoOrder();
            }
        }

        if (event.target.closest("#quick-launch-auto")) {
            if (window.SksirStorage) window.SksirStorage.remove(service.orderKey);
            service.init();
            iziToast.show({
                timeout: 1600,
                class: "setting-toast",
                title: "快捷入口",
                message: "已恢复按点击次数自动调整"
            });
        }
        if (event.target.closest("#quick-launch-library-add")) addLibraryItem(service);
        if (event.target.closest(".quick-launch-add")) {
            event.preventDefault();
            event.stopPropagation();
            setQuickAddDialog(true);
        }
        if (event.target.closest("[data-quick-add-close]")) setQuickAddDialog(false);

        var removeButton = event.target.closest(".quick-launch-custom-remove");
        if (removeButton) removeCustomItem(removeButton, service);
    });

    document.addEventListener("change", function (event) {
        var service = api();
        if (!service) return;
        if (event.target.matches(".set-quick-launch")) {
            service.write(service.enabledKey, event.target.checked);
            service.init();
        }
        if (event.target.matches(".quick-launch-limit")) {
            var mobile = event.target.id === "quick-launch-mobile-limit";
            var value = service.clampLimit(event.target.value, mobile ? 6 : 8, mobile ? 8 : 12);
            service.write(mobile ? service.mobileLimitKey : service.desktopLimitKey, value);
            service.render();
        }
        if (event.target.matches("#quick-launch-library-tab")) service.renderLibraryItems();
    });

    document.addEventListener("submit", function (event) {
        var service = api();
        if (!service) return;
        if (event.target.matches("#quick-launch-custom-form")) {
            addCustomItem(event, service);
        } else if (event.target.matches("#quick-launch-home-form")) {
            event.preventDefault();
            var saved = saveFormItem(service, {
                name: readValue("quick-launch-home-name"),
                url: readValue("quick-launch-home-url"),
                icon: readValue("quick-launch-home-icon")
            }, event.target);
            if (saved) setQuickAddDialog(false);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !document.getElementById("quick-launch-add-dialog").hidden) {
            event.preventDefault();
            setQuickAddDialog(false);
        }
    });

    window.addEventListener("storage", function (event) {
        var service = api();
        if (service && service.storageKeys.indexOf(event.key) !== -1) service.init();
    });

    window.addEventListener("resize", function () {
        var service = api();
        if (!service) return;
        if (resizeFrame) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(function () {
            resizeFrame = 0;
            service.render();
        });
    });
}());
