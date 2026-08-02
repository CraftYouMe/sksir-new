(function () {
  "use strict";

  function openExtensionStartupPage() {
    var url = chrome.runtime.getURL("newtab.html");

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
      var activeTab = Array.isArray(tabs) ? tabs[0] : null;
      if (activeTab && activeTab.id !== undefined) {
        chrome.tabs.update(activeTab.id, { url: url });
        return;
      }
      chrome.tabs.create({ url: url });
    });
  }

  chrome.runtime.onStartup.addListener(openExtensionStartupPage);
}());
