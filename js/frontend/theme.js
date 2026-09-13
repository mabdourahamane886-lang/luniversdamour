(function () {
  const KEY = "luniversTheme";
  const root = document.documentElement;
  const saved = localStorage.getItem(KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", theme);

  const button = document.getElementById("themeToggle");
  if (!button) return;
  button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  button.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
    button.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
  });
})();
