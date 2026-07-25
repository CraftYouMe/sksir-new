(function () {
    var updateFrame = 0;
    var requestSeq = 0;
    var reminderTimer = null;
    var panelReadyAt = 0;
    var localResults = [];
    var remoteSuggestions = [];
    var remoteState = "idle";
    var remoteCleanup = null;

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
            localResults = typeof window.getRecentNavItems === "function" ? window.getRecentNavItems() : [];
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

    ["focusin", "click", "keyup"].forEach(function (type) {
        document.addEventListener(type, function (event) {
            if (isSearchInput(event.target)) scheduleKeywordPanelUpdate();
        });
    });

    window.addEventListener("resize", function () {
        var panel = document.getElementById("keywords");
        if (panel && getComputedStyle(panel).display !== "none") scheduleKeywordPanelUpdate();
    });

    window.updateKeywordPanel = updateKeywordPanel;
    window.scheduleKeywordPanelUpdate = scheduleKeywordPanelUpdate;
    window.SksirSearchUI = {
        searchLocalNavItems: searchLocalNavItems,
        renderKeywordPanel: renderKeywordPanel,
        remind: remind,
        scheduleReminder: scheduleReminder,
        setPanelReadyAt: function (value) { panelReadyAt = Number(value) || 0; },
        hide: hide
    };
}());
