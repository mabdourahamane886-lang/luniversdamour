window.LUNIVERS_SUPABASE = {
  url: "https://okdohokhlkxrmxpevees.supabase.co",
  anonKey: "sb_publishable_EiTruyR5fwwHpS_PzO5_iA_d1i4iMCP"
};

(function () {
  "use strict";

  function removeApiProtectionNotice() {
    const disclaimer = document.querySelector(".ai-disclaimer");
    if (!disclaimer) return;
    disclaimer.textContent = "Amour AI fournit des conseils généraux et ne remplace pas un professionnel.";
  }

  function initAmourAiPageMode() {
    removeApiProtectionNotice();

    const navMenu = document.querySelector(".nav-menu");
    const aiSection = document.getElementById("amour-ai");
    const aiInput = document.getElementById("aiInput");
    if (!navMenu || !aiSection) return;
    if (document.getElementById("amourAiPageLayer")) return;

    const style = document.createElement("style");
    style.textContent = `
      /* Amour AI = catégorie indépendante, pas une section à faire défiler */
      #amour-ai.amour-ai-category {
        display: none !important;
      }

      body.amour-ai-open {
        overflow: hidden;
      }

      #amourAiPageLayer {
        position: fixed;
        inset: 0;
        z-index: 5000;
        display: grid;
        place-items: stretch;
        padding: 0;
        background: rgba(38, 12, 27, .68);
        opacity: 0;
        pointer-events: none;
        visibility: hidden;
        perspective: 1800px;
        transition: opacity .28s ease, visibility .28s ease;
      }

      #amourAiPageLayer.open {
        opacity: 1;
        pointer-events: auto;
        visibility: visible;
      }

      #amourAiPageSheet {
        position: relative;
        width: min(1180px, 96vw);
        height: min(94vh, 980px);
        margin: auto;
        overflow: auto;
        border: 1px solid rgba(232, 67, 104, .18);
        border-radius: 28px;
        background: #fff7f9;
        box-shadow: 0 35px 100px rgba(0, 0, 0, .35);
        transform-origin: left center;
        transform: rotateY(-88deg) translateX(-28px) scale(.96);
        opacity: 0;
        transition: transform .62s cubic-bezier(.2,.8,.2,1), opacity .42s ease;
        will-change: transform, opacity;
      }

      #amourAiPageLayer.open #amourAiPageSheet {
        transform: rotateY(0deg) translateX(0) scale(1);
        opacity: 1;
      }

      #amourAiClose {
        position: sticky;
        top: 16px;
        z-index: 20;
        float: right;
        display: grid;
        width: 42px;
        height: 42px;
        margin: 16px 16px 0 0;
        place-items: center;
        color: #fff;
        border: 1px solid rgba(255,255,255,.35);
        border-radius: 50%;
        background: #b9274b;
        box-shadow: 0 10px 25px rgba(185,39,75,.25);
        cursor: pointer;
      }

      #amourAiPageSheet > #amour-ai {
        display: block !important;
        min-height: 100%;
        padding: 52px 0 60px;
        background: linear-gradient(135deg, #fff7f9, #fff);
      }

      #amourAiPageSheet > #amour-ai .container {
        width: min(1040px, 92%);
      }

      .amour-ai-category-link {
        display: inline-flex !important;
        align-items: center;
        gap: 7px;
        padding: 9px 13px;
        color: #fff !important;
        border-radius: 999px;
        background: linear-gradient(135deg, #e84368, #b9274b);
        box-shadow: 0 7px 18px rgba(232, 67, 104, .25);
      }

      .amour-ai-category-link::after {
        display: none !important;
      }

      @media (max-width: 600px) {
        #amourAiPageLayer {
          padding: 0;
        }

        #amourAiPageSheet {
          width: 100vw;
          height: 100vh;
          border-radius: 0;
        }

        #amourAiClose {
          top: 10px;
          margin: 10px 10px 0 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #amourAiPageSheet {
          transition: opacity .2s ease;
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    aiSection.classList.add("amour-ai-category");

    const layer = document.createElement("div");
    layer.id = "amourAiPageLayer";
    layer.setAttribute("aria-hidden", "true");

    const sheet = document.createElement("div");
    sheet.id = "amourAiPageSheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-label", "Amour AI");

    const close = document.createElement("button");
    close.id = "amourAiClose";
    close.type = "button";
    close.setAttribute("aria-label", "Fermer Amour AI");
    close.innerHTML = '<i class="fa-solid fa-xmark"></i>';

    const inner = document.createElement("div");
    inner.appendChild(close);
    inner.appendChild(aiSection);
    sheet.appendChild(inner);
    layer.appendChild(sheet);
    document.body.appendChild(layer);

    function openAi() {
      layer.classList.add("open");
      layer.setAttribute("aria-hidden", "false");
      document.body.classList.add("amour-ai-open");
      window.setTimeout(() => aiInput?.focus(), 520);
    }

    function closeAi() {
      layer.classList.remove("open");
      layer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("amour-ai-open");
    }

    const existingAiLinks = navMenu.querySelectorAll('a[href="#amour-ai"]');
    existingAiLinks.forEach((link) => {
      link.classList.add("amour-ai-category-link");
      link.innerHTML = '<i class="fa-solid fa-sparkles"></i><span>Amour AI</span>';
      link.addEventListener("click", (event) => {
        event.preventDefault();
        navMenu.classList.remove("open");
        const menuIcon = document.querySelector(".menu-toggle i");
        if (menuIcon) menuIcon.className = "fa-solid fa-bars";
        openAi();
      });
    });

    const heroButton = document.getElementById("openAiButton");
    if (heroButton) {
      heroButton.addEventListener("click", (event) => {
        event.preventDefault();
        openAi();
      });
    }

    close.addEventListener("click", closeAi);
    layer.addEventListener("click", (event) => {
      if (event.target === layer) closeAi();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && layer.classList.contains("open")) {
        closeAi();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAmourAiPageMode);
  } else {
    initAmourAiPageMode();
  }
})();
