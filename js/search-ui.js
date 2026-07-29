(function () {
    var updateFrame = 0;
    var requestSeq = 0;
    var reminderTimer = null;
    var panelReadyAt = 0;
    var localResults = [];
    var remoteSuggestions = [];
    var remoteState = "idle";
    var remoteCleanup = null;
    var engineCloseTimer = 0;
    var suggestionsEnabledKey = "sksir-search-suggestions-enabled";
    var historySuggestionsEnabledKey = "sksir-search-history-suggestions-enabled";

    function readBooleanSetting(key, fallback) {
        if (window.SksirStorage) {
            return window.SksirStorage.readJson(key, fallback) !== false;
        }
        try {
            var stored = localStorage.getItem(key);
            return stored === null ? fallback : JSON.parse(stored) !== false;
        } catch (error) {
            return fallback;
        }
    }

    function writeBooleanSetting(key, value) {
        if (window.SksirStorage) return window.SksirStorage.writeJson(key, !!value);
        try {
            localStorage.setItem(key, JSON.stringify(!!value));
            return true;
        } catch (error) {
            return false;
        }
    }

    function areSuggestionsEnabled() {
        return readBooleanSetting(suggestionsEnabledKey, true);
    }

    function areHistorySuggestionsEnabled() {
        return readBooleanSetting(historySuggestionsEnabledKey, true);
    }

    function syncSuggestionControls() {
        var suggestionsToggle = document.getElementById("search-suggestions-enabled");
        var historyToggle = document.getElementById("search-history-suggestions-enabled");
        var historyRow = document.getElementById("search-history-suggestions-row");
        var enabled = areSuggestionsEnabled();
        if (suggestionsToggle) suggestionsToggle.checked = enabled;
        if (historyToggle) {
            historyToggle.checked = areHistorySuggestionsEnabled();
            historyToggle.disabled = !enabled;
        }
        if (historyRow) historyRow.classList.toggle("is-disabled", !enabled);
    }

    function updateKeywordPanel() {
        var searchBox = document.querySelector(".all-search");
        var searchWrap = document.querySelector(".sou");
        var panel = document.getElementById("keywords");
        if (!searchBox || !searchWrap || !panel) return;

        var searchRect = searchBox.getBoundingClientRect();
        var wrapRect = searchWrap.getBoundingClientRect();
        var mobile = window.matchMedia && window.matchMedia("(max-width: 720px)").matches;
        var inset = mobile ? 4 : Math.min(14, Math.max(8, Math.round(searchRect.height * 0.22)));
        var gap = mobile ? 8 : 10;
        panel.style.width = Math.max(180, Math.round(searchRect.width - inset * 2)) + "px";
        panel.style.left = Math.round(searchRect.left - wrapRect.left + inset) + "px";
        panel.style.top = Math.round(searchRect.bottom - wrapRect.top + gap) + "px";
    }

    function positionEnginePanel() {
        // 搜索框宽度
        var searchBox = document.querySelector(".all-search");
        var searchWrap = document.querySelector(".sou");
        var panel = document.querySelector(".search-engine");
        if (!searchBox || !searchWrap || !panel) return;
        var searchRect = searchBox.getBoundingClientRect();
        var wrapRect = searchWrap.getBoundingClientRect();
        var mobile = window.matchMedia && window.matchMedia("(max-width: 720px)").matches;
        var inset = mobile ? 4 : Math.min(14, Math.max(8, Math.round(searchRect.height * 0.22)));
        var gap = mobile ? 8 : 10;
        panel.style.width = Math.max(180, Math.round(searchRect.width - inset * 2)) + "px";
        panel.style.left = Math.round(searchRect.left - wrapRect.left + inset) + "px";
        panel.style.top = Math.round(searchRect.bottom - wrapRect.top + gap) + "px";
    }

    function showEnginePanel() {
        var panel = document.querySelector(".search-engine");
        if (!panel) return;
        clearTimeout(engineCloseTimer);
        positionEnginePanel();
        panel.classList.remove("is-closing", "is-visible");
        panel.style.display = "block";
        requestAnimationFrame(function () {
            if (panel.style.display !== "none") panel.classList.add("is-visible");
        });
    }

    function hideEnginePanel(immediate) {
        var panel = document.querySelector(".search-engine");
        if (!panel || getComputedStyle(panel).display === "none") return;
        clearTimeout(engineCloseTimer);
        var reduceMotion = document.documentElement.classList.contains("perf-lite") ||
            (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        if (immediate || reduceMotion) {
            panel.classList.remove("is-visible", "is-closing");
            panel.style.display = "none";
            return;
        }
        panel.classList.remove("is-visible");
        panel.classList.add("is-closing");
        engineCloseTimer = setTimeout(function () {
            panel.classList.remove("is-closing");
            panel.style.display = "none";
            engineCloseTimer = 0;
        }, 150);
    }

    function scheduleKeywordPanelUpdate() {
        if (updateFrame) return;
        updateFrame = requestAnimationFrame(function () {
            updateFrame = 0;
            updateKeywordPanel();
        });
    }

    function isSearchInput(target) {
        return !!(target && target.matches && target.matches(".wd"));
    }

    function activateKeyword(item) {
        var actions = window.SksirSearchActions;
        var input = document.querySelector(".wd");
        if (!actions || !input || !item) return;
        var kind = item.dataset.kind;
        var query = item.dataset.query || item.textContent;
        if (kind === "nav") {
            var meta = item.querySelector(".keyword-meta");
            actions.recordRecentNavItem({
                name: query,
                url: item.dataset.url,
                desc: meta ? meta.textContent : ""
            });
            actions.openDirectNavigation(item.dataset.url);
            return;
        }
        input.value = query;
        var form = input.closest("form");
        if (form) {
            if (typeof form.requestSubmit === "function") {
                form.requestSubmit();
            } else if (form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))) {
                form.submit();
            }
        }
        input.value = "";
        hide();
    }

    function handleInputKeydown(event) {
        // 键盘方向操作，上下键获取焦点并屏蔽。
        // 保留字体：）
        if (!isSearchInput(event.target)) return;
        var key = event.keyCode;
        var chosen = document.querySelector("#keywords .keyword.choose");
        if (key === 13 && chosen && chosen.dataset.kind === "nav") {
            event.preventDefault();
            activateKeyword(chosen);
            return;
        }
        if (key === 13 && (event.ctrlKey || event.metaKey)) {
            var actions = window.SksirSearchActions;
            var forcedUrl = actions && actions.getDirectNavigationUrl(event.target.value, true);
            if (forcedUrl) {
                event.preventDefault();
                actions.openDirectNavigation(forcedUrl);
            }
            return;
        }
        if (key !== 38 && key !== 40) return;

        var currentId = chosen ? parseInt(chosen.dataset.id, 10) : 0;
        var length = parseInt((document.getElementById("keywords") || {}).dataset.length, 10) || 0;
        if (!length) return;
        var nextId = currentId + (key === 38 ? -1 : 1);
        if (nextId > length) nextId = 1;
        if (nextId < 1) nextId = length;

        document.querySelectorAll("#keywords .keyword.choose").forEach(function (item) {
            item.classList.remove("choose");
        });
        var next = document.querySelector('#keywords .keyword[data-id="' + nextId + '"]');
        if (!next) return;
        next.classList.add("choose");
        if (next.dataset.kind !== "nav") {
            event.target.value = next.dataset.query || next.textContent;
        }
    }

    function getSearchableNavItems() {
        var data = window.NAV_SITES || {};
        var seenUrls = {};
        var results = [];
        (data.tabs || []).forEach(function (tab) {
            if (tab.lock) return;
            (tab.items || []).forEach(function (item) {
                if (!item.url || seenUrls[item.url]) return;
                seenUrls[item.url] = true;
                results.push({
                    name: item.name || item.url,
                    url: item.url,
                    desc: item.desc || "",
                    searchText: [item.name, item.desc, item.category, item.searchKey, tab.title, item.url]
                        .filter(Boolean).join(" ").toLowerCase()
                });
            });
        });
        return results;
    }

    function searchLocalNavItems(keyword) {
        var query = String(keyword || "").trim().toLowerCase();
        if (!query) return [];
        return getSearchableNavItems().map(function (item) {
            var name = item.name.toLowerCase();
            var score = name === query ? 0 : name.indexOf(query) === 0 ? 1 : item.searchText.indexOf(query) >= 0 ? 2 : 9;
            return { item: item, score: score };
        }).filter(function (result) {
            return result.score < 9;
        }).sort(function (left, right) {
            return left.score - right.score || left.item.name.length - right.item.name.length;
        }).slice(0, 4).map(function (result) {
            return result.item;
        });
    }

    function createKeywordItem(entry, index) {
        var item = document.createElement("div");
        item.className = "keyword" + (entry.kind === "nav" ? " keyword-nav" : "");
        item.dataset.id = String(index + 1);
        item.dataset.kind = entry.kind;
        item.dataset.query = entry.name;
        item.setAttribute("role", "option");
        if (entry.url) item.dataset.url = entry.url;

        var icon = document.createElement("i");
        icon.className = entry.kind === "nav" ? "iconfont icon-home" : "iconfont icon-sousuo";
        item.appendChild(icon);

        var label = document.createElement("span");
        label.className = "keyword-label";
        label.textContent = entry.name;
        item.appendChild(label);

        if (entry.kind === "nav") {
            var meta = document.createElement("span");
            meta.className = "keyword-meta";
            meta.textContent = entry.desc || "打开书签";
            item.appendChild(meta);
        }
        return item;
    }

    function renderKeywordPanel(state) {
        var panel = document.getElementById("keywords");
        if (!panel) return;
        var entries = (state.localResults || []).map(function (item) {
            return { kind: "nav", name: item.name, desc: item.desc, url: item.url };
        });
        (state.remoteSuggestions || []).forEach(function (suggestion) {
            if (!entries.some(function (entry) { return entry.name.toLowerCase() === suggestion.toLowerCase(); })) {
                entries.push({ kind: "search", name: suggestion });
            }
        });
        entries = entries.slice(0, 8);

        var statusMessages = {
            loading: "正在获取必应建议...",
            offline: "当前离线，只显示本地结果",
            error: "必应建议暂不可用"
        };
        var statusMessage = statusMessages[state.remoteState] || "";
        panel.replaceChildren();
        if (!entries.length && !statusMessage) {
            panel.removeAttribute("data-length");
            panel.style.display = "none";
            return;
        }

        updateKeywordPanel();
        entries.forEach(function (entry, index) {
            panel.appendChild(createKeywordItem(entry, index));
        });
        if (statusMessage) {
            var status = document.createElement("div");
            status.className = "keyword-status";
            status.textContent = statusMessage;
            status.setAttribute("role", "status");
            panel.appendChild(status);
        }
        panel.dataset.length = String(entries.length);
        panel.style.display = "block";
    }

    function currentState() {
        return {
            localResults: localResults,
            remoteSuggestions: remoteSuggestions,
            remoteState: remoteState
        };
    }

    function canShow(keyword, sequence) {
        var input = document.querySelector(".wd");
        var enginePanel = document.querySelector(".search-engine");
        return sequence === requestSeq &&
            document.body.classList.contains("onsearch") &&
            (!enginePanel || getComputedStyle(enginePanel).display === "none") &&
            !!input && input.value.trim() === keyword;
    }

    function renderCurrent(keyword, sequence) {
        if (canShow(keyword, sequence)) renderKeywordPanel(currentState());
    }

    function cancelRemoteRequest() {
        if (remoteCleanup) {
            remoteCleanup();
            remoteCleanup = null;
        }
    }

    function requestRemoteSuggestions(keyword, sequence) {
        cancelRemoteRequest();
        // JSONP 回调函数参数名和值。
        var callbackName = "__sksirKeywordSuggestions" + sequence;
        var script = document.createElement("script");
        var settled = false;
        var timeoutId = 0;

        function cleanup() {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            script.remove();
            try {
                delete window[callbackName];
            } catch (error) {
                window[callbackName] = undefined;
            }
        }

        function fail() {
            cleanup();
            if (sequence !== requestSeq) return;
            remoteState = "error";
            renderCurrent(keyword, sequence);
        }

        window[callbackName] = function (data) {
            cleanup();
            if (!canShow(keyword, sequence)) return;
            var groups = data && data.AS && Array.isArray(data.AS.Results) ? data.AS.Results : [];
            var seen = {};
            remoteSuggestions = groups.reduce(function (suggestions, group) {
                (group && Array.isArray(group.Suggests) ? group.Suggests : []).forEach(function (item) {
                    var text = item && typeof item.Txt === "string" ? item.Txt.trim() : "";
                    if (text && !seen[text.toLowerCase()]) {
                        seen[text.toLowerCase()] = true;
                        suggestions.push(text);
                    }
                });
                return suggestions;
            }, []);
            remoteState = "ready";
            renderCurrent(keyword, sequence);
        };
        script.async = true;
        script.src = "https://api.bing.com/qsonhs.aspx?type=cb&q=" + encodeURIComponent(keyword) +
            "&cb=" + encodeURIComponent(callbackName);
        script.onerror = fail;
        timeoutId = setTimeout(fail, 3500);
        remoteCleanup = cleanup;
        document.head.appendChild(script);
    }

    function loadLocalResults(keyword, sequence) {
        if (!keyword) {
            localResults = areHistorySuggestionsEnabled() &&
                typeof window.getRecentNavItems === "function" ? window.getRecentNavItems() : [];
            renderCurrent(keyword, sequence);
            return;
        }
        var loadTask = typeof window.ensureNavSitesLoaded === "function"
            ? window.ensureNavSitesLoaded()
            : Promise.resolve();
        loadTask.then(function () {
            if (!canShow(keyword, sequence)) return;
            localResults = searchLocalNavItems(keyword);
            renderCurrent(keyword, sequence);
        }).catch(function () {
            // Network suggestions remain available if bookmark data cannot be loaded.
        });
    }

    function remind() {
        if (!areSuggestionsEnabled()) {
            hide();
            return;
        }
        var input = document.querySelector(".wd");
        var keyword = input ? input.value.trim() : "";
        var sequence = ++requestSeq;
        cancelRemoteRequest();
        localResults = [];
        remoteSuggestions = [];
        remoteState = keyword ? (navigator.onLine ? "loading" : "offline") : "idle";
        renderCurrent(keyword, sequence);
        loadLocalResults(keyword, sequence);
        if (keyword && navigator.onLine) requestRemoteSuggestions(keyword, sequence);
    }

    function scheduleReminder(delay) {
        if (reminderTimer) clearTimeout(reminderTimer);
        var requestedDelay = typeof delay === "number" ? delay : 120;
        var openingDelay = Math.max(0, panelReadyAt - Date.now());
        reminderTimer = setTimeout(function () {
            reminderTimer = null;
            remind();
        }, Math.max(requestedDelay, openingDelay));
    }

    function hide() {
        if (reminderTimer) {
            clearTimeout(reminderTimer);
            reminderTimer = null;
        }
        requestSeq += 1;
        cancelRemoteRequest();
        localResults = [];
        remoteSuggestions = [];
        remoteState = "idle";
        var panel = document.getElementById("keywords");
        if (panel) {
            panel.replaceChildren();
            panel.removeAttribute("data-length");
            panel.style.display = "none";
        }
    }

    function focusSearch() {
        if (!document.body.classList.contains("onsearch")) {
            var mobile = window.matchMedia && window.matchMedia("(max-width: 720px)").matches;
            panelReadyAt = mobile ? 0 : Date.now() + 320;
        }
        document.body.classList.add("onsearch");
        scheduleKeywordPanelUpdate();
        setTimeout(scheduleKeywordPanelUpdate, 180);
        setTimeout(scheduleKeywordPanelUpdate, 320);
    }

    function blurSearch() {
        panelReadyAt = 0;
        document.body.classList.remove("onsearch");
        var input = document.querySelector(".wd");
        var enginePanel = document.querySelector(".search-engine");
        if (input) input.value = "";
        if (enginePanel) hideEnginePanel(true);
        hide();
    }

    function selectSearchEngine(item) {
        var form = document.querySelector(".search");
        var input = document.querySelector(".wd");
        var icon = document.getElementById("icon-se");
        var enginePanel = document.querySelector(".search-engine");
        if (form && item.dataset.url) form.setAttribute("action", item.dataset.url);
        if (input && item.dataset.name) input.setAttribute("name", item.dataset.name);
        if (icon && item.dataset.icon) icon.className = item.dataset.icon;
        if (enginePanel) hideEnginePanel();
        hide();
    }

    ["focusin", "click", "keyup"].forEach(function (type) {
        document.addEventListener(type, function (event) {
            if (isSearchInput(event.target)) scheduleKeywordPanelUpdate();
        });
    });

    document.addEventListener("keyup", function (event) {
        if (!isSearchInput(event.target) || event.keyCode === 38 || event.keyCode === 40) return;
        scheduleReminder(140);
    });

    document.addEventListener("keydown", handleInputKeydown);

    document.addEventListener("change", function (event) {
        if (!event.target) return;
        var key = "";
        if (event.target.id === "search-suggestions-enabled") key = suggestionsEnabledKey;
        if (event.target.id === "search-history-suggestions-enabled") key = historySuggestionsEnabledKey;
        if (!key) return;
        if (!writeBooleanSetting(key, event.target.checked)) {
            event.target.checked = !event.target.checked;
            return;
        }
        syncSuggestionControls();
        if (!areSuggestionsEnabled()) {
            hide();
            return;
        }
        var input = document.querySelector(".wd");
        if (document.body.classList.contains("onsearch") && input &&
            (input.value.trim() || areHistorySuggestionsEnabled())) {
            scheduleReminder(0);
        } else if (input && !input.value.trim()) {
            hide();
        }
    });

    document.addEventListener("click", function (event) {
        var item = event.target.closest && event.target.closest("#keywords .keyword");
        if (item) activateKeyword(item);

        var engine = event.target.closest && event.target.closest(".search-engine-list .se-li");
        if (engine) selectSearchEngine(engine);

        var engineTrigger = event.target.closest && event.target.closest(".se");
        if (engineTrigger) {
            hide();
            var panel = document.querySelector(".search-engine");
            if (panel && getComputedStyle(panel).display !== "none" && !panel.classList.contains("is-closing")) {
                hideEnginePanel();
            } else {
                showEnginePanel();
            }
        } else if (!event.target.closest || !event.target.closest(".search-engine")) {
            hideEnginePanel();
        }
    });

    document.addEventListener("submit", function (event) {
        if (!event.target.matches(".search")) return;
        var input = event.target.querySelector(".wd");
        var actions = window.SksirSearchActions;
        var directUrl = actions && actions.getDirectNavigationUrl(input ? input.value : "", false);
        if (!directUrl) return;
        event.preventDefault();
        actions.openDirectNavigation(directUrl);
    });

    window.addEventListener("offline", function () {
        if (document.body.classList.contains("onsearch")) scheduleReminder(0);
    });

    window.addEventListener("online", function () {
        if (document.body.classList.contains("onsearch")) scheduleReminder(120);
    });

    window.addEventListener("resize", function () {
        var panel = document.getElementById("keywords");
        if (panel && getComputedStyle(panel).display !== "none") scheduleKeywordPanelUpdate();
        var enginePanel = document.querySelector(".search-engine");
        if (enginePanel && getComputedStyle(enginePanel).display !== "none") positionEnginePanel();
    });

    window.addEventListener("storage", function (event) {
        if (event.key !== suggestionsEnabledKey && event.key !== historySuggestionsEnabledKey) return;
        syncSuggestionControls();
        if (!areSuggestionsEnabled()) hide();
    });

    syncSuggestionControls();

    window.updateKeywordPanel = updateKeywordPanel;
    window.scheduleKeywordPanelUpdate = scheduleKeywordPanelUpdate;
    window.SksirSearchUI = {
        searchLocalNavItems: searchLocalNavItems,
        renderKeywordPanel: renderKeywordPanel,
        remind: remind,
        scheduleReminder: scheduleReminder,
        setPanelReadyAt: function (value) { panelReadyAt = Number(value) || 0; },
        hide: hide,
        focus: focusSearch,
        blur: blurSearch
    };
}());
