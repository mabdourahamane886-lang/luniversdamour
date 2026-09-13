(function () {
  const KEY = "luniversTheme";
  const STYLE_KEY = "luniversStyle";
  const root = document.documentElement;
  const savedTheme = localStorage.getItem(KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (prefersDark ? "dark" : "light");

  const styles = {
    rose: {
      petrol: "#5b174b",
      emerald: "#b83280",
      emerald2: "#e0529c",
      coral: "#e85d75",
      coral2: "#ff9bb3",
      ivory: "#fff7fb",
      soft: "#fff0f6",
      line: "#efd7e3",
      ink: "#2b1b25",
      muted: "#75616c",
      shadow: "0 24px 75px rgba(91,23,75,.13)"
    },
    violet: {
      petrol: "#32145f",
      emerald: "#6d3fd1",
      emerald2: "#9a6cff",
      coral: "#e85c9d",
      coral2: "#ff9dcc",
      ivory: "#faf7ff",
      soft: "#f3edff",
      line: "#e2d8f2",
      ink: "#241a30",
      muted: "#6f6478",
      shadow: "0 24px 75px rgba(50,20,95,.13)"
    },
    sunset: {
      petrol: "#54231b",
      emerald: "#c34f35",
      emerald2: "#ee7858",
      coral: "#d94d73",
      coral2: "#ff9a9e",
      ivory: "#fff9f4",
      soft: "#fff0e7",
      line: "#efdcd0",
      ink: "#2d211e",
      muted: "#75645e",
      shadow: "0 24px 75px rgba(84,35,27,.13)"
    }
  };

  function applyTheme(next) {
    root.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
  }

  function applyStyle(name) {
    const palette = styles[name] || styles.rose;
    let style = document.getElementById("luniversDynamicTheme");
    if (!style) {
      style = document.createElement("style");
      style.id = "luniversDynamicTheme";
      document.head.appendChild(style);
    }
    style.textContent = `:root{--petrol:${palette.petrol};--emerald:${palette.emerald};--emerald2:${palette.emerald2};--coral:${palette.coral};--coral2:${palette.coral2};--ivory:${palette.ivory};--soft:${palette.soft};--line:${palette.line};--ink:${palette.ink};--muted:${palette.muted};--shadow:${palette.shadow}}[data-theme="dark"]{--ivory:#160e16;--soft:#241521;--line:#493342;--ink:#fff4fa;--muted:#c6aebb} .lunivers-style-panel{border-color:${palette.line}!important}`;
    localStorage.setItem(STYLE_KEY, name);
  }

  applyTheme(theme);
  applyStyle(localStorage.getItem(STYLE_KEY) || "rose");

  function buildStylePanel() {
    if (document.getElementById("luniversStylePanel")) return;
    const panel = document.createElement("div");
    panel.id = "luniversStylePanel";
    panel.className = "lunivers-style-panel";
    panel.innerHTML = `
      <button class="lunivers-style-toggle" id="luniversStyleToggle" aria-label="Personnaliser les couleurs">♥</button>
      <div class="lunivers-style-menu" id="luniversStyleMenu" aria-hidden="true">
        <strong>Personnaliser</strong>
        <span>Choisis ton univers de couleurs</span>
        <div class="lunivers-style-actions">
          <button data-style="rose"><i></i> Rose</button>
          <button data-style="violet"><i></i> Violet</button>
          <button data-style="sunset"><i></i> Sunset</button>
        </div>
        <button class="lunivers-theme-action" id="luniversThemeAction">🌙 Mode nuit</button>
      </div>`;
    document.body.appendChild(panel);

    const style = document.createElement("style");
    style.textContent = `
      #luniversStylePanel{position:fixed;right:18px;bottom:18px;z-index:9999;font-family:DM Sans,sans-serif}
      .lunivers-style-toggle{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--coral2),var(--coral));color:#fff;font-size:20px;box-shadow:0 12px 35px rgba(0,0,0,.18);transition:.2s}
      .lunivers-style-toggle:hover{transform:translateY(-3px) scale(1.03)}
      .lunivers-style-menu{position:absolute;right:0;bottom:59px;width:220px;padding:15px;border-radius:18px;background:rgba(255,255,255,.97);border:1px solid var(--line);box-shadow:0 20px 60px rgba(0,0,0,.16);display:none}
      [data-theme="dark"] .lunivers-style-menu{background:#21151f;color:#fff}
      .lunivers-style-menu.open{display:block;animation:luvPop .18s ease}
      .lunivers-style-menu strong{display:block;color:var(--petrol);font-size:13px}.lunivers-style-menu span{display:block;color:var(--muted);font-size:9px;margin:4px 0 12px}
      .lunivers-style-actions{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}.lunivers-style-actions button{padding:8px 4px;border:1px solid var(--line);border-radius:10px;background:var(--soft);color:var(--ink);font-size:9px;font-weight:800}.lunivers-style-actions i{display:block;width:18px;height:18px;border-radius:50%;margin:0 auto 4px;background:linear-gradient(135deg,var(--coral2),var(--coral))}.lunivers-style-actions button:nth-child(2) i{background:linear-gradient(135deg,#9a6cff,#32145f)}.lunivers-style-actions button:nth-child(3) i{background:linear-gradient(135deg,#ff9a9e,#c34f35)}
      .lunivers-theme-action{width:100%;margin-top:8px;padding:9px;border-radius:10px;background:var(--petrol);color:#fff;font-size:9px;font-weight:800}
      @keyframes luvPop{from{opacity:0;transform:translateY(5px) scale(.98)}to{opacity:1;transform:none}}
      @media(max-width:600px){#luniversStylePanel{right:12px;bottom:12px}.lunivers-style-menu{right:0;width:205px}}
    `;
    document.head.appendChild(style);

    const toggle = document.getElementById("luniversStyleToggle");
    const menu = document.getElementById("luniversStyleMenu");
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      menu.setAttribute("aria-hidden", String(!open));
    });

    panel.querySelectorAll("[data-style]").forEach((button) => {
      button.addEventListener("click", () => {
        applyStyle(button.dataset.style);
        menu.classList.remove("open");
      });
    });

    const themeAction = document.getElementById("luniversThemeAction");
    function refreshThemeLabel() {
      themeAction.textContent = root.getAttribute("data-theme") === "dark" ? "☀️ Mode clair" : "🌙 Mode nuit";
    }
    refreshThemeLabel();
    themeAction.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      refreshThemeLabel();
    });
  }

  const existingButton = document.getElementById("themeToggle");
  if (existingButton) {
    existingButton.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    existingButton.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildStylePanel, { once: true });
  } else {
    buildStylePanel();
  }
})();
