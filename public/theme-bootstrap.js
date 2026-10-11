(function () {
  try {
    var t = localStorage.getItem("theme") || "system";
    if (t === "system") {
      t = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    document.documentElement.classList.add(t);
    document.documentElement.style.colorScheme = t;
  } catch (e) {}
})();