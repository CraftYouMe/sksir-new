(function () {
    var resizeFrame = 0;
    var suppressClickUntil = 0;
    var pendingAddedUrl = "";
    var quickAddTrigger = null;
    var quickContextTrigger = null;
    var quickResetTrigger = null;
    var quickResetCloseTimer = 0;
    var quickCapacityTrigger = null;
    var quickCapacityCloseTimer = 0;
    var pendingCapacitySave = null;

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

    function getDefaultQuickLaunchUrls(service) {
        var defaultsByHost = {};
        service.getItems(true).forEach(function (entry) {
            var host = new URL(entry.url).hostname.replace(/^www\./, "").toLowerCase();
            if (!defaultsByHost[host]) defaultsByHost[host] = entry.url;
        });
        return ["bilibili.com", "deepseek.com", "chat.openai.com", "github.com", "iloveimg.com"]
            .map(function (host) { return defaultsByHost[host]; })
            .filter(Boolean);
    }

    function ensureQuickLaunchRoster(service) {
        var stored = service.read(service.rosterKey, null);
        var rosterVersion = Number(service.read(service.rosterVersionKey, 0)) || 0;
        var defaultRoster = getDefaultQuickLaunchUrls(service);
        if (defaultRoster.length < 5) {
            return Array.isArray(stored) ? service.getRosterUrls() : [];
        }

        if (rosterVersion < 2 || !Array.isArray(stored)) {
            var hiddenUrls = service.getHiddenUrls();
            var roster = defaultRoster.filter(function (url) {
                return hiddenUrls.indexOf(url) === -1;
            });
            service.getCustomItems().forEach(function (entry) {
                if (hiddenUrls.indexOf(entry.url) === -1 && roster.indexOf(entry.url) === -1) {
                    roster.push(entry.url);
                }
            });
            service.write(service.rosterKey, roster.slice(0, service.customLimit));
            if (rosterVersion < 1 && !service.read(service.orderKey, []).length) {
                service.write(service.orderKey, roster.slice());
            }
            service.write(service.rosterVersionKey, 2);
            return roster;
        }

        return service.getRosterUrls();
    }

    function ensureQuickContextMenu() {
        var menu = document.getElementById("quick-launch-context-menu");
        if (menu) return menu;
        menu = document.createElement("div");
        menu.id = "quick-launch-context-menu";
        menu.className = "quick-launch-context-menu";
        menu.hidden = true;
        menu.setAttribute("role", "menu");
        menu.setAttribute("aria-label", "快捷入口操作");
        menu.innerHTML = '<span class="quick-launch-context-name"></span>' +
            '<button type="button" class="quick-launch-context-delete" role="menuitem">删除快捷入口</button>';
        document.body.appendChild(menu);
        return menu;
    }

    function closeQuickContextMenu(restoreFocus) {
        var menu = document.getElementById("quick-launch-context-menu");
        if (!menu || menu.hidden) return;
        menu.classList.remove("is-visible");
        menu.hidden = true;
        if (restoreFocus && quickContextTrigger && document.contains(quickContextTrigger)) {
            quickContextTrigger.focus({ preventScroll: true });
        }
    }

    function openQuickContextMenu(event, entry, trigger) {
        event.preventDefault();
        event.stopPropagation();
        var menu = ensureQuickContextMenu();
        var name = menu.querySelector(".quick-launch-context-name");
        var button = menu.querySelector(".quick-launch-context-delete");
        quickContextTrigger = trigger;
        menu.setAttribute("data-url", entry.url);
        menu.setAttribute("data-custom", entry.custom ? "true" : "false");
        if (name) name.textContent = entry.name;
        menu.hidden = false;
        menu.classList.remove("is-visible");

        var gap = 8;
        var width = menu.offsetWidth;
        var height = menu.offsetHeight;
        var left = Math.max(gap, Math.min(event.clientX, document.documentElement.clientWidth - width - gap));
        var top = Math.max(gap, Math.min(event.clientY, document.documentElement.clientHeight - height - gap));
        menu.style.left = left + "px";
        menu.style.top = top + "px";
        void menu.offsetWidth;
        menu.classList.add("is-visible");
        if (button) button.focus({ preventScroll: true });
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
            var ghostLabel = ghost.querySelector(".quick-launch-label");
            if (ghostLabel) ghostLabel.remove();
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
            delete panel.dataset.renderSignature;
            return Promise.resolve();
        }

        var availableItems = service.getItems();
        var itemsByUrl = {};
        availableItems.forEach(function (entry) { itemsByUrl[entry.url] = entry; });
        var roster = ensureQuickLaunchRoster(service);
        var fixedUrls = getDefaultQuickLaunchUrls(service).filter(function (url) {
            return roster.indexOf(url) !== -1 && itemsByUrl[url];
        });
        var fixedLookup = {};
        fixedUrls.forEach(function (url) { fixedLookup[url] = true; });
        var customSlots = Math.max(0, service.getLimit() - fixedUrls.length);
        var customUrls = roster.filter(function (url) {
            return !fixedLookup[url] && itemsByUrl[url];
        }).slice(0, customSlots);
        var items = fixedUrls.concat(customUrls).map(function (url) {
            return itemsByUrl[url];
        }).filter(Boolean);
        items = service.sortItems(items);
        var renderSignature = JSON.stringify(items.map(function (entry) {
            return [entry.name, entry.url, entry.icon, entry.custom === true];
        }));
        if (panel.dataset.renderSignature === renderSignature &&
            panel.querySelectorAll(".quick-launch-item").length === items.length) {
            panel.hidden = false;
            return Promise.resolve();
        }
        panel.replaceChildren();
        items.forEach(function (entry, itemIndex) {
            var link = document.createElement("a");
            link.className = "quick-launch-item";
            link.href = entry.url;
            link.target = entry.target;
            link.rel = entry.rel;
            link.setAttribute("aria-label", entry.name);
            link.setAttribute("data-url", entry.url);
            if (entry.custom) link.setAttribute("data-custom", "true");

            var iconFallback = document.createElement("span");
            iconFallback.className = "quick-launch-icon-fallback";
            iconFallback.textContent = String(entry.name || "?").trim().slice(0, 1).toUpperCase();
            iconFallback.setAttribute("aria-hidden", "true");
            link.appendChild(iconFallback);

            var icon = document.createElement("img");
            icon.alt = "";
            icon.loading = "eager";
            icon.decoding = "async";
            if (itemIndex < 5) icon.setAttribute("fetchpriority", "high");
            icon.addEventListener("load", function () {
                link.classList.add("is-icon-ready");
            });
            icon.addEventListener("error", function () {
                icon.remove();
                link.classList.add("is-icon-fallback");
            });
            icon.src = entry.icon;
            if (entry.url === pendingAddedUrl) {
                var slowTimer = setTimeout(function () {
                    var currentService = api();
                    if (currentService) currentService.showMessage("图标加载较慢，正在继续加载");
                }, 1600);
                var finishPendingIcon = function () {
                    clearTimeout(slowTimer);
                    if (pendingAddedUrl === entry.url) pendingAddedUrl = "";
                };
                icon.addEventListener("load", finishPendingIcon, { once: true });
                icon.addEventListener("error", finishPendingIcon, { once: true });
            }
            link.appendChild(icon);
            var dockLabel = document.createElement("span");
            dockLabel.className = "quick-launch-label";
            dockLabel.textContent = entry.name;
            link.appendChild(dockLabel);
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
            link.addEventListener("contextmenu", function (event) {
                openQuickContextMenu(event, entry, link);
            });
            if (service.getSortMode() === "manual") bindDrag(link, service);
            panel.appendChild(link);
        });
        var addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "quick-launch-add";
        addButton.title = "添加快捷入口";
        addButton.setAttribute("aria-label", "添加快捷入口");
        addButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>';
        addButton.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            setQuickAddDialog(true, addButton);
        });
        panel.appendChild(addButton);
        panel.dataset.renderSignature = renderSignature;
        panel.hidden = false;
        return Promise.resolve();
    }

    function positionQuickAddDialog(dialog, trigger) {
        var sheet = dialog.querySelector(".quick-launch-add-sheet");
        if (!sheet || !trigger) return;
        var rect = trigger.getBoundingClientRect();
        var viewportWidth = document.documentElement.clientWidth;
        var sideGap = 12;
        var halfWidth = Math.min(sheet.offsetWidth / 2, (viewportWidth - sideGap * 2) / 2);
        var anchorX = Math.max(sideGap + halfWidth, Math.min(rect.left + rect.width / 2, viewportWidth - sideGap - halfWidth));
        var openBelow = rect.top < sheet.offsetHeight + 18;
        dialog.style.setProperty("--quick-add-x", anchorX + "px");
        dialog.style.setProperty("--quick-add-y", (openBelow ? rect.bottom : rect.top) + "px");
        dialog.classList.toggle("is-below", openBelow);
    }

    function setQuickAddDialog(open, trigger) {
        var dialog = document.getElementById("quick-launch-add-dialog");
        if (!dialog) return;
        if (trigger) quickAddTrigger = trigger;
        dialog.hidden = !open;
        document.body.classList.toggle("quick-add-open", open);
        if (open) {
            positionQuickAddDialog(dialog, quickAddTrigger);
            void dialog.offsetWidth;
            dialog.classList.add("is-visible");
            var sheet = dialog.querySelector(".quick-launch-add-sheet");
            if (sheet) sheet.focus({ preventScroll: true });
        } else {
            dialog.classList.remove("is-visible");
            if (quickAddTrigger && document.contains(quickAddTrigger)) {
                quickAddTrigger.focus({ preventScroll: true });
            }
        }
    }

    function setQuickResetDialog(open, trigger) {
        var dialog = document.getElementById("quick-launch-reset-dialog");
        if (!dialog) return;
        if (trigger) quickResetTrigger = trigger;
        if (quickResetCloseTimer) {
            clearTimeout(quickResetCloseTimer);
            quickResetCloseTimer = 0;
        }
        if (open) {
            dialog.hidden = false;
            void dialog.offsetWidth;
            dialog.classList.add("is-visible");
            var sheet = dialog.querySelector(".settings-confirm-sheet");
            if (sheet) sheet.focus({ preventScroll: true });
            return;
        }
        dialog.classList.remove("is-visible");
        quickResetCloseTimer = setTimeout(function () {
            dialog.hidden = true;
            quickResetCloseTimer = 0;
        }, 220);
        if (quickResetTrigger && document.contains(quickResetTrigger)) {
            quickResetTrigger.focus({ preventScroll: true });
        }
    }

    function resetQuickLaunch(service) {
        service.storageKeys.forEach(function (key) {
            localStorage.removeItem(key);
        });
        service.init();
        setQuickResetDialog(false);
        service.showMessage("快捷入口已恢复默认设置");
    }

    function setQuickCapacityDialog(open, trigger) {
        var dialog = document.getElementById("quick-launch-capacity-dialog");
        if (!dialog) return;
        if (trigger) quickCapacityTrigger = trigger;
        if (quickCapacityCloseTimer) {
            clearTimeout(quickCapacityCloseTimer);
            quickCapacityCloseTimer = 0;
        }
        if (open) {
            dialog.hidden = false;
            void dialog.offsetWidth;
            dialog.classList.add("is-visible");
            var sheet = dialog.querySelector(".settings-confirm-sheet");
            if (sheet) sheet.focus({ preventScroll: true });
            return;
        }
        dialog.classList.remove("is-visible");
        pendingCapacitySave = null;
        quickCapacityCloseTimer = setTimeout(function () {
            dialog.hidden = true;
            quickCapacityCloseTimer = 0;
        }, 220);
        if (quickCapacityTrigger && document.contains(quickCapacityTrigger)) {
            quickCapacityTrigger.focus({ preventScroll: true });
        }
    }

    function getCapacityExpansion(service, url) {
        var hiddenUrls = service.getHiddenUrls();
        var fixedCount = getDefaultQuickLaunchUrls(service).filter(function (fixedUrl) {
            return hiddenUrls.indexOf(fixedUrl) === -1;
        }).length;
        var visibleCustomUrls = service.getCustomItems().filter(function (entry) {
            return hiddenUrls.indexOf(entry.url) === -1;
        }).map(function (entry) {
            return entry.url;
        });
        var projectedTotal = fixedCount + visibleCustomUrls.length +
            (visibleCustomUrls.indexOf(url) === -1 ? 1 : 0);
        var currentLimit = service.getLimit();
        if (projectedTotal <= currentLimit) return null;

        var mobile = window.matchMedia && window.matchMedia("(max-width: 720px)").matches;
        var options = mobile ? [4, 5, 6, 7, 8] : [4, 6, 8, 10, 12];
        var expandedLimit = options.find(function (value) {
            return value >= projectedTotal;
        });
        return {
            mobile: mobile,
            currentLimit: currentLimit,
            projectedTotal: projectedTotal,
            expandedLimit: expandedLimit || options[options.length - 1],
            canFullyExpand: !!expandedLimit
        };
    }

    function commitFormItem(service, item, form) {
        pendingAddedUrl = item.url;
        var result = service.saveCustomItem(item);
        if (result.full) {
            pendingAddedUrl = "";
            service.showMessage("只能添加 " + service.customLimit + " 个自定义入口", true);
            return false;
        }
        if (form) form.reset();
        service.showMessage(result.updated ? "已更新快捷入口" : "已添加到首页");
        return true;
    }

    function requestCapacityExpansion(service, expansion, item, form) {
        var dialog = document.getElementById("quick-launch-capacity-dialog");
        var description = document.getElementById("quick-launch-capacity-description");
        var confirmButton = document.getElementById("quick-launch-capacity-confirm");
        if (!dialog || !description || !confirmButton) return false;

        if (expansion.canFullyExpand) {
            description.textContent = "添加后会有 " + expansion.projectedTotal + " 个快捷入口，超过当前设置的 " +
                expansion.currentLimit + " 个。是否自动增加到 " + expansion.expandedLimit + " 个？";
            confirmButton.textContent = "自动增加";
        } else {
            description.textContent = "添加后会有 " + expansion.projectedTotal + " 个快捷入口，超过当前设备可显示的 " +
                expansion.expandedLimit + " 个。继续保存时，超出的入口暂不显示。";
            confirmButton.textContent = "继续添加";
        }
        pendingCapacitySave = {
            service: service,
            expansion: expansion,
            item: item,
            form: form
        };
        setQuickCapacityDialog(true, form && form.querySelector(".quick-launch-home-submit"));
        return true;
    }

    function saveFormItem(service, values, form) {
        var name = String(values.name || "").trim().slice(0, 30);
        var url = service.normalizeWebUrl(values.url);
        var rawIcon = String(values.icon || "").trim();
        var icon = rawIcon ? service.normalizeWebUrl(rawIcon) : "";
        if (!name) return service.showMessage("请填写入口名称", true);
        if (!url) return service.showMessage("请输入正确的网址", true);
        if (rawIcon && !icon) return service.showMessage("请输入正确的图标网址", true);
        var item = {
            name: name,
            url: url,
            icon: icon || new URL("/favicon.ico", url).href
        };
        var expansion = getCapacityExpansion(service, url);
        if (expansion && requestCapacityExpansion(service, expansion, item, form)) return false;
        return commitFormItem(service, item, form);
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
        pendingAddedUrl = url;
        var result = service.saveCustomItem({
            name: String(item.name || item.url).trim().slice(0, 30),
            url: url,
            icon: service.normalizeWebUrl(item.icon) || new URL("/favicon.ico", url).href,
            desc: String(item.desc || "").slice(0, 80)
        });
        if (result.full) {
            pendingAddedUrl = "";
            return service.showMessage("只能添加 " + service.customLimit + " 个自定义入口", true);
        }
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

    function removeQuickLaunchItemByUrl(url, custom, service) {
        if (!url) return;
        if (custom) {
            var items = service.getCustomItems().filter(function (item) { return item.url !== url; });
            service.write(service.customKey, items.map(function (item) {
                return { name: item.name, url: item.url, icon: item.icon, desc: item.desc || "" };
            }));
        } else {
            var hiddenItems = service.getHiddenUrls();
            if (hiddenItems.indexOf(url) === -1) hiddenItems.push(url);
            service.write(service.hiddenKey, hiddenItems.slice(0, 100));
        }
        var manualOrder = service.read(service.orderKey, []);
        if (Array.isArray(manualOrder)) {
            service.write(service.orderKey, manualOrder.filter(function (itemUrl) { return itemUrl !== url; }));
        }
        service.renderCustomList();
        service.render();
        service.showMessage(custom ? "已删除自定义入口" : "快捷入口已移除");
    }

    function removeCustomItem(button, service) {
        removeQuickLaunchItemByUrl(button.getAttribute("data-url"), true, service);
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

        if (event.target.closest("#quick-launch-library-add")) addLibraryItem(service);
        var resetButton = event.target.closest("#quick-launch-reset");
        if (resetButton) {
            event.preventDefault();
            setQuickResetDialog(true, resetButton);
            return;
        }
        if (event.target.closest("[data-quick-reset-close]")) {
            event.preventDefault();
            setQuickResetDialog(false);
            return;
        }
        if (event.target.closest("#quick-launch-reset-confirm")) {
            event.preventDefault();
            resetQuickLaunch(service);
            return;
        }
        if (event.target.closest("[data-quick-capacity-close]")) {
            event.preventDefault();
            setQuickCapacityDialog(false);
            return;
        }
        if (event.target.closest("#quick-launch-capacity-confirm")) {
            event.preventDefault();
            if (!pendingCapacitySave) return;
            var capacitySave = pendingCapacitySave;
            if (capacitySave.expansion.canFullyExpand) {
                var limitKey = capacitySave.expansion.mobile ? service.mobileLimitKey : service.desktopLimitKey;
                var limitId = capacitySave.expansion.mobile ? "quick-launch-mobile-limit" : "quick-launch-desktop-limit";
                service.write(limitKey, capacitySave.expansion.expandedLimit);
                var limitControl = document.getElementById(limitId);
                if (limitControl) limitControl.value = String(capacitySave.expansion.expandedLimit);
            }
            var capacitySaved = commitFormItem(capacitySave.service, capacitySave.item, capacitySave.form);
            setQuickCapacityDialog(false);
            if (capacitySaved) setQuickAddDialog(false);
            return;
        }
        if (event.target.closest("[data-quick-add-close]")) {
            event.preventDefault();
            setQuickAddDialog(false);
        }

        var contextDelete = event.target.closest(".quick-launch-context-delete");
        if (contextDelete) {
            event.preventDefault();
            var contextMenu = contextDelete.closest(".quick-launch-context-menu");
            var contextUrl = contextMenu && contextMenu.getAttribute("data-url");
            var contextCustom = contextMenu && contextMenu.getAttribute("data-custom") === "true";
            closeQuickContextMenu(false);
            removeQuickLaunchItemByUrl(contextUrl, contextCustom, service);
            return;
        }
        if (!event.target.closest(".quick-launch-context-menu")) closeQuickContextMenu(false);

        var removeButton = event.target.closest(".quick-launch-custom-remove");
        if (removeButton) removeCustomItem(removeButton, service);
    });

    document.addEventListener("change", function (event) {
        var service = api();
        if (!service) return;
        if (event.target.matches(".set-quick-launch")) {
            service.write(service.enabledKey, event.target.value === "0");
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

    document.addEventListener("input", function (event) {
        if (event.target.matches(".set-quick-launch")) {
            var enabledControl = document.getElementById("quick-launch-enabled-control");
            var enabled = event.target.value === "0";
            if (enabledControl) enabledControl.setAttribute("data-slider-value", enabled ? "enabled" : "disabled");
            event.target.setAttribute("aria-valuetext", enabled ? "开启" : "关闭");
        }
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
        var contextMenu = document.getElementById("quick-launch-context-menu");
        if (event.key === "Escape" && contextMenu && !contextMenu.hidden) {
            event.preventDefault();
            closeQuickContextMenu(true);
            return;
        }
        var capacityDialog = document.getElementById("quick-launch-capacity-dialog");
        if (event.key === "Escape" && capacityDialog && !capacityDialog.hidden) {
            event.preventDefault();
            setQuickCapacityDialog(false);
            return;
        }
        if (event.key === "Escape" && !document.getElementById("quick-launch-add-dialog").hidden) {
            event.preventDefault();
            setQuickAddDialog(false);
            return;
        }
        var resetDialog = document.getElementById("quick-launch-reset-dialog");
        if (event.key === "Escape" && resetDialog && !resetDialog.hidden) {
            event.preventDefault();
            setQuickResetDialog(false);
        }
    });

    window.addEventListener("storage", function (event) {
        var service = api();
        if (service && service.storageKeys.indexOf(event.key) !== -1) service.init();
    });

    window.addEventListener("resize", function () {
        var service = api();
        if (!service) return;
        closeQuickContextMenu(false);
        var dialog = document.getElementById("quick-launch-add-dialog");
        if (dialog && !dialog.hidden) positionQuickAddDialog(dialog, quickAddTrigger);
        if (resizeFrame) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(function () {
            resizeFrame = 0;
            service.render();
        });
    });

    window.addEventListener("scroll", function () {
        closeQuickContextMenu(false);
    }, true);
}());
