(function () {
  const KEY = "luniversTheme";
  const STYLE_KEY = "luniversStyle";
  const root = document.documentElement;
  const savedTheme = localStorage.getItem(KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (prefersDark ? "dark" : "light");

  const styles = {
    rose: {
      petrol: "#5b174b", emerald: "#b83280", emerald2: "#e0529c", coral: "#e85d75", coral2: "#ff9bb3", ivory: "#fff7fb", soft: "#fff0f6", line: "#efd7e3", ink: "#2b1b25", muted: "#75616c", shadow: "0 24px 75px rgba(91,23,75,.13)"
    },
    violet: {
      petrol: "#32145f", emerald: "#6d3fd1", emerald2: "#9a6cff", coral: "#e85c9d", coral2: "#ff9dcc", ivory: "#faf7ff", soft: "#f3edff", line: "#e2d8f2", ink: "#241a30", muted: "#6f6478", shadow: "0 24px 75px rgba(50,20,95,.13)"
    },
    sunset: {
      petrol: "#54231b", emerald: "#c34f35", emerald2: "#ee7858", coral: "#d94d73", coral2: "#ff9a9e", ivory: "#fff9f4", soft: "#fff0e7", line: "#efdcd0", ink: "#2d211e", muted: "#75645e", shadow: "0 24px 75px rgba(84,35,27,.13)"
    },
    ocean: {
      petrol: "#063b3b", emerald: "#0f766e", emerald2: "#14a38b", coral: "#df6f62", coral2: "#f4a094", ivory: "#fff8f1", soft: "#f9eee9", line: "#e8ddd6", ink: "#18262a", muted: "#68777b", shadow: "0 24px 75px rgba(6,59,59,.12)"
    },
    midnight: {
      petrol: "#10182f", emerald: "#3157c8", emerald2: "#6f8fff", coral: "#d64f83", coral2: "#ff91b8", ivory: "#f7f8ff", soft: "#eef1ff", line: "#dce1f1", ink: "#171b2b", muted: "#697087", shadow: "0 24px 75px rgba(16,24,47,.14)"
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
    style.textContent = `:root{--petrol:${palette.petrol};--emerald:${palette.emerald};--emerald2:${palette.emerald2};--coral:${palette.coral};--coral2:${palette.coral2};--ivory:${palette.ivory};--soft:${palette.soft};--line:${palette.line};--ink:${palette.ink};--muted:${palette.muted};--shadow:${palette.shadow}}[data-theme="dark"]{--ivory:#160e16;--soft:#241521;--line:#493342;--ink:#fff4fa;--muted:#c6aebb}.lunivers-style-panel{border-color:${palette.line}!important}`;
    localStorage.setItem(STYLE_KEY, name);
  }

  applyTheme(theme);
  applyStyle(localStorage.getItem(STYLE_KEY) || "ocean");

  function addLovePhotos() {
    if (document.getElementById("luniversLovePhotos")) return;
    const main = document.querySelector("main");
    if (!main) return;
    const section = document.createElement("section");
    section.id = "luniversLovePhotos";
    section.setAttribute("aria-label", "Photos de L’univers d’amour");
    section.innerHTML = `
      <div class="lunivers-love-photos">
        <figure><img src="https://images.unsplash.com/photo-1784460469850-80838868f4d2?auto=format&fit=crop&fm=jpg&q=82&w=1400" alt="Femme noire souriante" loading="eager"><figcaption>Un sourire, une émotion ❤️</figcaption></figure>
        <figure><img src="https://images.unsplash.com/photo-1644042191329-759b854f880a?auto=format&fit=crop&fm=jpg&q=82&w=1400" alt="Couple africain souriant et complice" loading="lazy"><figcaption>Complicité & amour 💕</figcaption></figure>
      </div>`;
    main.insertBefore(section, main.firstElementChild);
    const style = document.createElement("style");
    style.textContent = `#luniversLovePhotos{padding:18px 0 8px}.lunivers-love-photos{width:min(1180px,calc(100% - 32px));margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:16px}.lunivers-love-photos figure{margin:0;position:relative;overflow:hidden;border-radius:24px;min-height:250px;background:var(--soft);box-shadow:var(--shadow);border:1px solid var(--line)}.lunivers-love-photos img{display:block;width:100%;height:300px;object-fit:cover;transition:transform .45s ease}.lunivers-love-photos figure:hover img{transform:scale(1.03)}.lunivers-love-photos figcaption{position:absolute;left:14px;right:14px;bottom:14px;padding:11px 14px;border-radius:14px;background:rgba(0,0,0,.42);backdrop-filter:blur(8px);color:#fff;font-weight:800;font-size:13px}@media(max-width:700px){.lunivers-love-photos{grid-template-columns:1fr}.lunivers-love-photos img{height:260px}}`;
    document.head.appendChild(style);
  }

  function buildGoogleHeader() {
    const nav = document.querySelector(".top .nav");
    if (!nav || document.getElementById("luniversGoogleSearch")) return;
    const search = document.createElement("form");
    search.id = "luniversGoogleSearch";
    search.className = "lunivers-google-search";
    search.setAttribute("role", "search");
    search.innerHTML = `<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input id="luniversSiteSearch" type="search" autocomplete="off" placeholder="Rechercher dans L’univers d’amour" aria-label="Rechercher dans L’univers d’amour"><button type="submit" aria-label="Rechercher"><i class="fa-solid fa-arrow-right"></i></button>`;
    const profile = document.createElement("a");
    profile.className = "lunivers-profile-button";
    profile.href = "#univers";
    profile.setAttribute("aria-label", "Profil L’univers d’amour");
    profile.innerHTML = `<i class="fa-solid fa-user"></i>`;
    nav.insertBefore(search, nav.querySelector(".menu"));
    nav.appendChild(profile);
    const style = document.createElement("style");
    style.textContent = `.top .nav{gap:14px}.lunivers-google-search{height:44px;flex:1;max-width:430px;min-width:190px;display:flex;align-items:center;gap:10px;padding:0 8px 0 16px;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:999px;box-shadow:0 2px 12px rgba(0,0,0,.12);color:#7a7a7a}.lunivers-google-search>i{font-size:14px;flex:none}.lunivers-google-search input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:#222;font-size:12px}.lunivers-google-search input::placeholder{color:#8b8b8b}.lunivers-google-search button{width:32px;height:32px;border-radius:50%;background:#f5f5f5;color:var(--petrol);display:grid;place-items:center;flex:none}.lunivers-google-search button:hover{background:#ececec}.lunivers-profile-button{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--coral2),var(--coral));color:#fff;border:2px solid rgba(255,255,255,.75);box-shadow:0 4px 15px rgba(0,0,0,.18);flex:none}.lunivers-profile-button i{font-size:17px}@media(max-width:980px){.lunivers-google-search{order:3;max-width:none;width:100%;flex-basis:100%}.top .nav{flex-wrap:wrap;padding:12px 0}.top .nav .menu{display:none}.lunivers-profile-button{margin-left:auto}.brand{margin-right:auto}}@media(max-width:600px){.lunivers-google-search{height:42px}.lunivers-google-search input{font-size:11px}.lunivers-profile-button{width:40px;height:40px}.brand-mark{width:40px;height:40px}}`;
    document.head.appendChild(style);
    search.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = document.getElementById("luniversSiteSearch").value.trim().toLowerCase();
      if (!query) return;
      const candidates = Array.from(document.querySelectorAll("main section, main article"));
      const target = candidates.find((el) => (el.innerText || "").toLowerCase().includes(query));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function buildStylePanel() {
    if (document.getElementById("luniversStylePanel")) return;
    const panel = document.createElement("div");
    panel.id = "luniversStylePanel";
    panel.className = "lunivers-style-panel";
    panel.innerHTML = `
      <button class="lunivers-style-toggle" id="luniversStyleToggle" aria-label="Personnaliser les couleurs">♥</button>
      <div class="lunivers-style-menu" id="luniversStyleMenu" aria-hidden="true">
        <strong>Personnaliser</strong><span>Choisis ton univers de couleurs</span>
        <div class="lunivers-style-actions">
          <button data-style="rose"><i></i>Rose</button><button data-style="violet"><i></i>Violet</button><button data-style="sunset"><i></i>Sunset</button><button data-style="ocean"><i></i>Océan</button><button data-style="midnight"><i></i>Nuit</button>
        </div>
        <button class="lunivers-theme-action" id="luniversThemeAction">🌙 Mode nuit</button>
      </div>`;
    document.body.appendChild(panel);
    const style = document.createElement("style");
    style.textContent = `#luniversStylePanel{position:fixed;right:18px;bottom:18px;z-index:9999;font-family:DM Sans,sans-serif}.lunivers-style-toggle{width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,var(--coral2),var(--coral));color:#fff;font-size:20px;box-shadow:0 12px 35px rgba(0,0,0,.18);transition:.2s}.lunivers-style-toggle:hover{transform:translateY(-3px) scale(1.03)}.lunivers-style-menu{position:absolute;right:0;bottom:61px;width:235px;padding:15px;border-radius:20px;background:rgba(255,255,255,.98);border:1px solid var(--line);box-shadow:0 20px 60px rgba(0,0,0,.16);display:none}.lunivers-style-menu.open{display:block;animation:luvPop .18s ease}.lunivers-style-menu strong{display:block;color:var(--petrol);font-size:13px}.lunivers-style-menu span{display:block;color:var(--muted);font-size:9px;margin:4px 0 12px}.lunivers-style-actions{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.lunivers-style-actions button{padding:8px 2px;border:1px solid var(--line);border-radius:10px;background:var(--soft);color:var(--ink);font-size:8px;font-weight:800}.lunivers-style-actions i{display:block;width:20px;height:20px;border-radius:50%;margin:0 auto 4px;background:linear-gradient(135deg,#ff9bb3,#5b174b)}.lunivers-style-actions button:nth-child(2) i{background:linear-gradient(135deg,#9a6cff,#32145f)}.lunivers-style-actions button:nth-child(3) i{background:linear-gradient(135deg,#ff9a9e,#c34f35)}.lunivers-style-actions button:nth-child(4) i{background:linear-gradient(135deg,#14a38b,#063b3b)}.lunivers-style-actions button:nth-child(5) i{background:linear-gradient(135deg,#6f8fff,#10182f)}.lunivers-theme-action{width:100%;margin-top:9px;padding:10px;border-radius:11px;background:var(--petrol);color:#fff;font-size:9px;font-weight:800}@keyframes luvPop{from{opacity:0;transform:translateY(5px) scale(.98)}to{opacity:1;transform:none}}@media(max-width:600px){#luniversStylePanel{right:12px;bottom:12px}.lunivers-style-menu{width:215px}}`;
    document.head.appendChild(style);
    const toggle = document.getElementById("luniversStyleToggle");
    const menu = document.getElementById("luniversStyleMenu");
    toggle.addEventListener("click", () => { const open = menu.classList.toggle("open"); menu.setAttribute("aria-hidden", String(!open)); });
    panel.querySelectorAll("[data-style]").forEach((button) => button.addEventListener("click", () => { applyStyle(button.dataset.style); menu.classList.remove("open"); }));
    const themeAction = document.getElementById("luniversThemeAction");
    function refreshThemeLabel() { themeAction.textContent = root.getAttribute("data-theme") === "dark" ? "☀️ Mode clair" : "🌙 Mode nuit"; }
    refreshThemeLabel();
    themeAction.addEventListener("click", () => { const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark"; applyTheme(next); refreshThemeLabel(); });
  }

  function buildAIAccess() {
    if (document.getElementById("luniversAIAccess")) return;
    const shell = document.createElement("div");
    shell.id = "luniversAIAccess";
    shell.innerHTML = `
      <button class="lunivers-ai-fab" id="luniversAIFab" aria-label="Ouvrir Amour AI" title="Amour AI"><span class="ai-orbit"></span><span class="ai-spark">✦</span></button>
      <div class="lunivers-ai-overlay" id="luniversAIOverlay" aria-hidden="true">
        <div class="lunivers-ai-window" role="dialog" aria-modal="true" aria-label="Amour AI">
          <div class="lunivers-ai-header"><div class="lunivers-ai-title"><span class="ai-mini-icon">✦</span><div><strong>Amour AI</strong><small>Assistant de L’univers d’amour</small></div></div><div class="lunivers-ai-actions"><a href="/amour-ai.html" aria-label="Ouvrir Amour AI en plein écran">↗</a><button id="luniversAIClose" aria-label="Fermer">×</button></div></div>
          <iframe id="luniversAIFrame" title="Amour AI" src="/amour-ai.html?embedded=1" loading="lazy"></iframe>
        </div>
      </div>`;
    document.body.appendChild(shell);
    const style = document.createElement("style");
    style.textContent = `#luniversAIAccess{font-family:DM Sans,sans-serif}.lunivers-ai-fab{position:fixed;right:18px;bottom:78px;z-index:10000;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#fff 0 7%,transparent 8%),linear-gradient(135deg,var(--coral2),var(--emerald2),var(--petrol));color:#fff;border:2px solid rgba(255,255,255,.9);box-shadow:0 12px 34px rgba(0,0,0,.24);cursor:pointer;transition:transform .2s ease,box-shadow .2s ease}.lunivers-ai-fab:hover{transform:translateY(-3px) scale(1.04);box-shadow:0 16px 42px rgba(0,0,0,.28)}.ai-orbit{position:absolute;inset:6px;border:1px solid rgba(255,255,255,.55);border-radius:50%;animation:luvSpin 5s linear infinite}.ai-orbit:after{content:"";position:absolute;top:-3px;left:50%;width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 10px #fff}.ai-spark{font-size:22px;line-height:1;filter:drop-shadow(0 2px 5px rgba(0,0,0,.2))}@keyframes luvSpin{to{transform:rotate(360deg)}}.lunivers-ai-overlay{position:fixed;inset:0;z-index:10001;background:rgba(10,8,15,.52);backdrop-filter:blur(9px);display:none;padding:clamp(10px,3vw,32px);align-items:center;justify-content:center}.lunivers-ai-overlay.open{display:flex;animation:luvFade .18s ease}.lunivers-ai-window{width:min(980px,100%);height:min(860px,94vh);background:#fff;border-radius:26px;overflow:hidden;box-shadow:0 30px 100px rgba(0,0,0,.35);display:flex;flex-direction:column}.lunivers-ai-header{height:62px;flex:0 0 62px;display:flex;align-items:center;justify-content:space-between;padding:0 14px 0 17px;background:linear-gradient(135deg,var(--petrol),var(--emerald));color:#fff}.lunivers-ai-title{display:flex;align-items:center;gap:10px}.ai-mini-icon{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--coral2),var(--coral));font-weight:900}.lunivers-ai-title strong{display:block;font-size:13px}.lunivers-ai-title small{display:block;font-size:9px;opacity:.78;margin-top:2px}.lunivers-ai-actions{display:flex;align-items:center;gap:5px}.lunivers-ai-actions a,.lunivers-ai-actions button{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.12);color:#fff;text-decoration:none;font-size:17px}.lunivers-ai-actions a:hover,.lunivers-ai-actions button:hover{background:rgba(255,255,255,.22)}#luniversAIFrame{border:0;width:100%;height:calc(100% - 62px);background:#fff}@keyframes luvFade{from{opacity:0}to{opacity:1}}@media(max-width:600px){.lunivers-ai-fab{right:12px;bottom:74px;width:50px;height:50px}.lunivers-ai-overlay{padding:0}.lunivers-ai-window{width:100%;height:100%;border-radius:0}.lunivers-ai-header{height:58px;flex-basis:58px}#luniversAIFrame{height:calc(100% - 58px)}}`;
    document.head.appendChild(style);
    const open = document.getElementById("luniversAIFab");
    const overlay = document.getElementById("luniversAIOverlay");
    const close = document.getElementById("luniversAIClose");
    const openAI = () => { overlay.classList.add("open"); overlay.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; };
    const closeAI = () => { overlay.classList.remove("open"); overlay.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };
    open.addEventListener("click", openAI);
    close.addEventListener("click", closeAI);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) closeAI(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && overlay.classList.contains("open")) closeAI(); });
  }

  const existingButton = document.getElementById("themeToggle");
  if (existingButton) {
    existingButton.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    existingButton.addEventListener("click", () => { const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark"; applyTheme(next); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { addLovePhotos(); buildGoogleHeader(); buildStylePanel(); buildAIAccess(); }, { once: true });
  } else {
    addLovePhotos();
    buildGoogleHeader();
    buildStylePanel();
    buildAIAccess();
  }
})();
