window.LUNIVERS_SUPABASE = {
  url: "https://okdohokhlkxrmxpevees.supabase.co",
  anonKey: "sb_publishable_EiTruyR5fwwHpS_PzO5_iA_d1i4iMCP"
};

(function () {
  "use strict";

  // Supabase est utilisé par les fonctionnalités de données/authentification.
  // L'assistant Amour AI utilise /api/chat côté serveur Vercel afin de ne jamais
  // exposer une clé Gemini au navigateur. Ne pas intercepter window.fetch ici.
  function initAmourAiButton() {
    const button = document.getElementById("openAmourAi");
    const panel = document.getElementById("amourAiPanel");
    if (!button || !panel || button.dataset.aiBound === "true") return;

    button.dataset.aiBound = "true";
    button.addEventListener("click", () => {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        const input = document.getElementById("aiInput");
        if (input) input.focus();
      }, 350);
    });
  }

  function removeApiProtectionNotice() {
    const disclaimer = document.querySelector(".ai-disclaimer");
    if (!disclaimer) return;
    disclaimer.textContent = "Amour AI fournit des conseils généraux et ne remplace pas un professionnel.";
  }

  function init() {
    initAmourAiButton();
    removeApiProtectionNotice();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
