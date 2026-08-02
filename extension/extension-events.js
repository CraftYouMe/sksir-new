(function () {
  "use strict";

  document.addEventListener("click", function (event) {
    var target = event.target.closest && event.target.closest("[data-extension-action]");
    if (!target) return;

    var action = target.getAttribute("data-extension-action");
    if (action === "open-settings" && typeof window.openBox === "function") {
      event.stopPropagation();
      window.openBox();
    }
    if (action === "close-settings" && typeof window.closeSet === "function") {
      event.stopPropagation();
      window.closeSet();
    }
  }, true);

  document.addEventListener("input", function (event) {
    var input = event.target;
    var range = input && input.getAttribute && input.getAttribute("data-extension-range-clamp");
    if (!range) return;

    var limits = range.split(",").map(Number);
    if (limits.length !== 2 || !Number.isFinite(limits[0]) || !Number.isFinite(limits[1])) return;
    if (input.value !== "") input.value = Math.max(limits[0], Math.min(limits[1], Number(input.value)));
  }, true);
}());
