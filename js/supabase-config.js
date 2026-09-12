window.LUNIVERS_SUPABASE = {
  url: "https://bawryduhgopvxynqmiyo.supabase.co",
  anonKey: "sb_publishable_qZ9W7AdHI1zwGEMpDx2QDQ_8O6tjV1B"
};

(function () {
  "use strict";

  // Le frontend historique appelle encore /api/chat. On le route directement
  // vers l'Edge Function Supabase afin que l'IA fonctionne même sans nouveau
  // build Vercel. Les autres requêtes fetch restent inchangées.
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async function (input, init) {
    const requestUrl = typeof input === "string" ? input : (input && input.url) || "";
    const isChatApi = /(^|\/)api\/chat(?:\?|$)/.test(requestUrl);

    if (!isChatApi) {
      return nativeFetch(input, init);
    }

    const config = window.LUNIVERS_SUPABASE || {};
    const supabaseUrl = String(config.url || "").replace(/\/$/, "");
    const anonKey = String(config.anonKey || "").trim();

    if (!supabaseUrl || !anonKey) {
      return new Response(JSON.stringify({ error: "Supabase n'est pas configuré." }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }

    let payload = {};
    try {
      payload = init && typeof init.body === "string" ? JSON.parse(init.body) : {};
    } catch (_) {
      payload = {};
    }

    try {
      const upstream = await nativeFetch(`${supabaseUrl}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await upstream.json().catch(() => ({
        error: "Réponse Supabase invalide."
      }));

      return new Response(JSON.stringify(data), {
        status: upstream.status,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: error?.message || "Supabase indisponible."
      }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }
  };

  function removeApiProtectionNotice() {
    const disclaimer = document.querySelector(".ai-disclaimer");
    if (!disclaimer) return;

    // Ne pas afficher dans l'interface des informations techniques sur les clés API.
    disclaimer.textContent = "Amour AI fournit des conseils généraux et ne remplace pas un professionnel.";
  }

  function initAmourAiButton() {
    removeApiProtectionNotice();

    const navMenu = document.querySelector(".nav-menu");
    const aiSection = document.getElementById("amour-ai");
    const aiInput = document.getElementById("aiInput");
    const openAiButton = document.getElementById("openAiButton");

    if (!navMenu || !aiSection) return;
    if (document.getElementById("navAmourAiButton")) return;

    const style = document.createElement("style");
    style.textContent = `
      .nav-ai-button {
        display: inline-flex !important;
        align-items: center;
        gap: 7px;
        padding: 9px 13px;
        color: #fff !important;
        border-radius: 999px;
        background: linear-gradient(135deg, #e84368, #b9274b);
        box-shadow: 0 7px 18px rgba(232, 67, 104, .25);
        transition: transform .2s ease, box-shadow .2s ease;
      }
      .nav-ai-button::after { display: none !important; }
      .nav-ai-button:hover {
        color: #fff !important;
        transform: translateY(-2px);
        box-shadow: 0 10px 24px rgba(232, 67, 104, .35);
      }
      .amour-ai-floating {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 1999;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 13px 16px;
        color: #fff;
        border: 0;
        border-radius: 999px;
        background: linear-gradient(135deg, #e84368, #b9274b);
        box-shadow: 0 12px 28px rgba(188, 36, 74, .3);
        font: 700 12px/1 "Montserrat", sans-serif;
        cursor: pointer;
      }
      .amour-ai-floating:hover { transform: translateY(-2px); }
      @media (max-width: 600px) {
        .amour-ai-floating { right: 12px; bottom: 12px; padding: 12px 14px; }
        .nav-ai-button { justify-content: center; }
      }
    `;
    document.head.appendChild(style);

    const button = document.createElement("a");
    button.id = "navAmourAiButton";
    button.className = "nav-ai-button";
    button.href = "#amour-ai";
    button.innerHTML = '<i class="fa-solid fa-sparkles"></i><span>Amour AI</span>';
    button.addEventListener("click", function (event) {
      event.preventDefault();
      aiSection.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(function () {
        if (openAiButton) openAiButton.focus();
        if (aiInput) aiInput.focus();
      }, 450);
    });

    navMenu.appendChild(button);

    const floating = document.createElement("button");
    floating.type = "button";
    floating.className = "amour-ai-floating";
    floating.setAttribute("aria-label", "Ouvrir Amour AI");
    floating.innerHTML = '<i class="fa-solid fa-sparkles"></i><span>Amour AI</span>';
    floating.addEventListener("click", function () {
      aiSection.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(function () {
        if (aiInput) aiInput.focus();
      }, 450);
    });
    document.body.appendChild(floating);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAmourAiButton);
  } else {
    initAmourAiButton();
  }
})();
