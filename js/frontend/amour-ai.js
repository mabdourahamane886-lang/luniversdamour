(function () {
  const STORAGE_CONV = "amourAIConversations";
  const STORAGE_ACTIVE = "amourAIActiveConversation";
  const STORAGE_LEGACY = "amourAIConversation";
  const STORAGE_FAV = "amourAIFavorites";
  const STORAGE_MEM = "amourAIMemories";
  const STORAGE_CONSENT = "amourAIMemoryConsent";
  const STORAGE_QUIZ = "amourAIQuizResults";
  const STORAGE_VOICE = "amourAIVoiceName";
  const MAX_INPUT = 3000;

  const welcome =
    "Bonjour â¤ï¸ Je suis Amour AI, une intelligence artificielle. Je peux vous aider avec vos relations, vos Ã©motions, vos messages et vos questions du quotidien. Je ne remplace pas un professionnel.";

  const els = {
    form: document.getElementById("aiForm"),
    input: document.getElementById("aiInput"),
    send: document.getElementById("aiSend"),
    messages: document.getElementById("aiMessages"),
    thinking: document.getElementById("aiThinking"),
    card: document.getElementById("aiChatCard"),
    error: document.getElementById("aiError"),
    retry: document.getElementById("aiRetry"),
    suggestions: document.getElementById("aiSuggestions"),
    convList: document.getElementById("aiConvList"),
    search: document.getElementById("aiHistorySearch"),
    tool: document.getElementById("aiTool"),
    charCount: document.getElementById("aiCharCount"),
    speak: document.getElementById("aiSpeakToggle"),
    stopSpeak: document.getElementById("aiStopSpeak"),
    voice: document.getElementById("voiceButton"),
    micStop: document.getElementById("voiceStopButton"),
    newConv: document.getElementById("newAiChat"),
    exportBtn: document.getElementById("exportAiData"),
    wipeBtn: document.getElementById("wipeAiData"),
    memoryToggle: document.getElementById("aiMemoryConsent"),
    memoryList: document.getElementById("aiMemoryList"),
    premiumNote: document.getElementById("premiumNote"),
    quizBox: document.getElementById("aiQuizBox"),
    dashboard: document.getElementById("aiDashboardMount")
  };

  if (!els.form || !els.input) return;

  const toast = window.showSiteToast || function (message) {
    const node = document.getElementById("toast");
    if (!node) return;
    node.querySelector("span").textContent = message;
    node.classList.add("show");
    setTimeout(() => node.classList.remove("show"), 2500);
  };

  function uid() {
    return "c_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function loadConversations() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_CONV) || "[]");
      if (stored.length) return stored;
      const legacy = JSON.parse(localStorage.getItem(STORAGE_LEGACY) || "[]");
      if (legacy.length) {
        const migrated = [{
          id: uid(),
          title: "Conversation",
          archived: false,
          updatedAt: Date.now(),
          messages: legacy
        }];
        localStorage.setItem(STORAGE_CONV, JSON.stringify(migrated));
        return migrated;
      }
    } catch {
      return [];
    }
    return [];
  }

  let conversations = loadConversations();
  let activeId = localStorage.getItem(STORAGE_ACTIVE) || conversations[0]?.id;
  if (!activeId) {
    const first = { id: uid(), title: "Nouvelle conversation", archived: false, updatedAt: Date.now(), messages: [] };
    conversations = [first];
    activeId = first.id;
    persist();
  }

  function persist() {
    localStorage.setItem(STORAGE_CONV, JSON.stringify(conversations));
    localStorage.setItem(STORAGE_ACTIVE, activeId);
  }

  function activeConv() {
    return conversations.find((item) => item.id === activeId) || conversations[0];
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function hideError() {
    if (!els.error) return;
    els.error.hidden = true;
  }

  function showError(message, retryable) {
    if (!els.error) {
      toast(message);
      return;
    }
    els.error.hidden = false;
    els.error.querySelector("[data-error-text]").textContent = message;
    if (els.retry) els.retry.hidden = !retryable;
  }

  function renderMessages() {
    const conv = activeConv();
    const items = (conv.messages || []).slice(-80);
    if (!items.length) {
      els.messages.innerHTML = `
        <div class="ai-message ai-message-assistant">
          <div class="message-avatar">âœ¨</div>
          <div class="message-content">${escapeHtml(welcome)}</div>
        </div>`;
      return;
    }
    els.messages.innerHTML = items.map((item, index) => {
      const isUser = item.role === "user";
      const text = item.text || item.content || "";
      return `
        <div class="ai-message ${isUser ? "ai-message-user" : "ai-message-assistant"}" data-index="${index}">
          <div class="message-avatar">${isUser ? "ðŸ’—" : "âœ¨"}</div>
          <div class="message-bubble">
            <div class="message-content">${escapeHtml(text)}</div>
            <div class="message-actions">
              <button type="button" data-act="copy" aria-label="Copier">Copier</button>
              <button type="button" data-act="share" aria-label="Partager">Partager</button>
              ${isUser ? "" : `<button type="button" data-act="speak" aria-label="Lire">Lire</button>`}
              ${isUser ? "" : `<button type="button" data-act="regen" aria-label="RÃ©gÃ©nÃ©rer">RÃ©gÃ©nÃ©rer</button>`}
              <button type="button" data-act="fav" aria-label="Favori">Favori</button>
              <button type="button" data-act="delete" aria-label="Supprimer">Supprimer</button>
            </div>
          </div>
        </div>`;
    }).join("");
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function renderHistory() {
    if (!els.convList) return;
    const query = (els.search?.value || "").toLowerCase();
    els.convList.innerHTML = conversations
      .filter((item) => !item.archived)
      .filter((item) => {
        if (!query) return true;
        return (item.title || "").toLowerCase().includes(query) ||
          (item.messages || []).some((msg) => String(msg.text || msg.content || "").toLowerCase().includes(query));
      })
      .map((item) => `
        <button type="button" class="ai-conv-item ${item.id === activeId ? "active" : ""}" data-id="${item.id}">
          ${escapeHtml(item.title || "Sans titre")}
        </button>`)
      .join("") || "<p class='ai-muted'>Aucune conversation</p>";
  }

  function renderDashboard() {
    if (!els.dashboard) return;
    const favs = JSON.parse(localStorage.getItem(STORAGE_FAV) || "[]");
    const quizzes = JSON.parse(localStorage.getItem(STORAGE_QUIZ) || "[]");
    const msgCount = conversations.reduce((sum, item) => sum + (item.messages || []).length, 0);
    els.dashboard.innerHTML = `
      <div class="dash-grid">
        <article><h3>Conversations</h3><p>${conversations.length}</p></article>
        <article><h3>Messages</h3><p>${msgCount}</p></article>
        <article><h3>Favoris IA</h3><p>${favs.length}</p></article>
        <article><h3>Quiz</h3><p>${quizzes.length}</p></article>
      </div>
      <p class="ai-muted">Plan gratuit : 20 messages / jour. Premium bientÃ´t disponible.</p>
      <ul class="dash-favs">${favs.slice(-8).map((item) => `<li>${escapeHtml(String(item).slice(0, 180))}</li>`).join("")}</ul>
    `;
  }

  function renderMemories() {
    if (!els.memoryList) return;
    const memories = JSON.parse(localStorage.getItem(STORAGE_MEM) || "[]");
    els.memoryList.innerHTML = memories.length
      ? memories.map((item, i) => `<li>${escapeHtml(item)} <button type="button" data-mem="${i}">Supprimer</button></li>`).join("")
      : "<li class='ai-muted'>Aucune mÃ©moire (dÃ©sactivÃ©e par dÃ©faut)</li>";
  }

  let lastUserText = "";
  let sending = false;

  async function apiPost(url, body) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.error?.message || data.error || "Une erreur est survenue.";
      const err = new Error(message);
      err.retryable = response.status >= 500 || response.status === 429;
      throw err;
    }
    return data.data || data;
  }

  async function askSupabase(messages) {
    const config = window.LUNIVERS_SUPABASE || {};
    const url = String(config.url || "").replace(/\/$/, "");
    const anonKey = String(config.anonKey || "").trim();
    if (!url || !anonKey || url.includes("YOUR_PROJECT")) {
      throw new Error("SUPABASE_SKIP");
    }
    const response = await fetch(`${url}/functions/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + anonKey,
        apikey: anonKey
      },
      body: JSON.stringify({ messages })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Supabase indisponible");
    return data.reply || data.text;
  }

  async function generateReply(messages, tool) {
    try {
      const data = await apiPost("/api/chat", { messages, tool });
      return data.reply || data.text;
    } catch (error) {
      try {
        return await askSupabase(messages);
      } catch {
        throw error;
      }
    }
  }

  function pushMessage(role, text) {
    const conv = activeConv();
    conv.messages = conv.messages || [];
    conv.messages.push({ role, text, createdAt: Date.now() });
    conv.updatedAt = Date.now();
    if (role === "user" && conv.messages.filter((m) => m.role === "user").length === 1) {
      conv.title = text.slice(0, 42);
    }
    persist();
  }

  async function sendText(text, options = {}) {
    const value = String(text || "").trim();
    if (!value || sending) return;
    if (value.length > MAX_INPUT) {
      showError(`Maximum ${MAX_INPUT} caractÃ¨res.`, false);
      return;
    }
    if (!navigator.onLine) {
      showError("Pas de rÃ©seau. VÃ©rifiez votre connexion.", true);
      lastUserText = value;
      return;
    }

    hideError();
    sending = true;
    els.send.disabled = true;
    els.thinking.classList.add("show");
    lastUserText = value;
    if (!options.regenerate) {
      pushMessage("user", value);
    }
    renderMessages();

    try {
      const conv = activeConv();
      const reply = await generateReply(conv.messages, els.tool?.value || "chat");
      if (options.regenerate) {
        const last = [...(conv.messages || [])].reverse().find((m) => m.role === "model" || m.role === "assistant");
        if (last) last.text = reply;
        else pushMessage("model", reply);
        persist();
      } else {
        pushMessage("model", reply);
      }
      if (els.memoryToggle?.checked) {
        remember(value);
      }
      renderMessages();
      renderHistory();
      renderDashboard();
      if (els.speak?.checked) speak(reply);
    } catch (error) {
      showError(error.message || "Impossible de joindre Amour AI.", Boolean(error.retryable));
    } finally {
      sending = false;
      els.send.disabled = false;
      els.thinking.classList.remove("show");
    }
  }

  function remember(text) {
    if (/\b(mot de passe|password|iban|cvv|mineur)\b/i.test(text)) return;
    const memories = JSON.parse(localStorage.getItem(STORAGE_MEM) || "[]");
    const snippet = text.slice(0, 140);
    if (!memories.includes(snippet)) {
      memories.push(snippet);
      localStorage.setItem(STORAGE_MEM, JSON.stringify(memories.slice(-20)));
      renderMemories();
    }
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = document.documentElement.lang || "fr-FR";
    const preferred = localStorage.getItem(STORAGE_VOICE);
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.name === preferred) || voices.find((v) => v.lang.startsWith("fr"));
    if (match) utter.voice = match;
    window.speechSynthesis.speak(utter);
  }

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = els.input.value.trim();
    els.input.value = "";
    updateCount();
    sendText(text);
  });

  els.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      els.form.requestSubmit();
    }
  });

  function updateCount() {
    if (els.charCount) {
      els.charCount.textContent = `${els.input.value.length}/${MAX_INPUT}`;
    }
  }
  els.input.addEventListener("input", updateCount);

  els.suggestions?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-question]");
    if (!button) return;
    els.input.value = button.dataset.question;
    els.input.focus();
    updateCount();
  });

  els.messages.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-act]");
    if (!button) return;
    const wrap = button.closest(".ai-message");
    const index = Number(wrap?.dataset.index);
    const conv = activeConv();
    const item = conv.messages[index];
    if (!item) return;
    const text = item.text || item.content || "";
    const act = button.dataset.act;
    if (act === "copy") {
      navigator.clipboard.writeText(text).then(() => toast("Texte copiÃ© avec succÃ¨s !"));
    } else if (act === "share") {
      window.open("https://wa.me/?text=" + encodeURIComponent(text + "\n\nLâ€™univers dâ€™amour â¤ï¸\nhttps://luniversdamour.vercel.app"), "_blank");
    } else if (act === "speak") {
      speak(text);
    } else if (act === "regen") {
      sendText(lastUserText || text, { regenerate: true });
    } else if (act === "fav") {
      const favs = JSON.parse(localStorage.getItem(STORAGE_FAV) || "[]");
      favs.push(text);
      localStorage.setItem(STORAGE_FAV, JSON.stringify(favs));
      toast("AjoutÃ© aux favoris â¤ï¸");
      renderDashboard();
    } else if (act === "delete") {
      conv.messages.splice(index, 1);
      persist();
      renderMessages();
    }
  });

  document.getElementById("openAiButton")?.addEventListener("click", () => {
    els.card.scrollIntoView({ behavior: "smooth", block: "center" });
    els.input.focus();
  });

  document.getElementById("clearAiChat")?.addEventListener("click", () => {
    const conv = activeConv();
    conv.messages = [];
    persist();
    renderMessages();
    toast("Conversation effacÃ©e");
  });

  els.newConv?.addEventListener("click", () => {
    const created = { id: uid(), title: "Nouvelle conversation", archived: false, updatedAt: Date.now(), messages: [] };
    conversations.unshift(created);
    activeId = created.id;
    persist();
    renderHistory();
    renderMessages();
  });

  els.convList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;
    activeId = button.dataset.id;
    persist();
    renderHistory();
    renderMessages();
  });

  els.search?.addEventListener("input", renderHistory);

  els.retry?.addEventListener("click", () => sendText(lastUserText));

  els.stopSpeak?.addEventListener("click", () => window.speechSynthesis?.cancel());

  els.exportBtn?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ conversations, favorites: localStorage.getItem(STORAGE_FAV) }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "amour-ai-export.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  els.wipeBtn?.addEventListener("click", () => {
    if (!confirm("Supprimer toutes les donnÃ©es Amour AI de ce navigateur ?")) return;
    localStorage.removeItem(STORAGE_CONV);
    localStorage.removeItem(STORAGE_ACTIVE);
    localStorage.removeItem(STORAGE_LEGACY);
    localStorage.removeItem(STORAGE_FAV);
    localStorage.removeItem(STORAGE_MEM);
    conversations = [{ id: uid(), title: "Nouvelle conversation", archived: false, updatedAt: Date.now(), messages: [] }];
    activeId = conversations[0].id;
    persist();
    renderMessages();
    renderHistory();
    renderDashboard();
    renderMemories();
    toast("DonnÃ©es locales supprimÃ©es");
  });

  if (els.memoryToggle) {
    els.memoryToggle.checked = localStorage.getItem(STORAGE_CONSENT) === "1";
    els.memoryToggle.addEventListener("change", () => {
      localStorage.setItem(STORAGE_CONSENT, els.memoryToggle.checked ? "1" : "0");
      if (!els.memoryToggle.checked) {
        localStorage.removeItem(STORAGE_MEM);
      }
      renderMemories();
    });
  }

  els.memoryList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mem]");
    if (!button) return;
    const memories = JSON.parse(localStorage.getItem(STORAGE_MEM) || "[]");
    memories.splice(Number(button.dataset.mem), 1);
    localStorage.setItem(STORAGE_MEM, JSON.stringify(memories));
    renderMemories();
  });

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;
  if (SpeechRecognition && els.voice) {
    recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    els.voice.addEventListener("click", () => {
      try {
        recognition.start();
        els.voice.classList.add("recording");
      } catch {
        toast("Le microphone nâ€™est pas disponible.");
      }
    });
    els.micStop?.addEventListener("click", () => recognition.stop());
    recognition.addEventListener("end", () => els.voice.classList.remove("recording"));
    recognition.addEventListener("result", (event) => {
      els.input.value = event.results[0][0].transcript;
      els.input.focus();
      updateCount();
    });
    recognition.addEventListener("error", () => toast("Le microphone nâ€™est pas disponible."));
  } else if (els.voice) {
    els.voice.disabled = true;
    els.voice.title = "La saisie vocale nâ€™est pas disponible";
  }

  async function loadQuiz() {
    if (!els.quizBox) return;
    try {
      const res = await fetch("/api/quiz");
      const json = await res.json();
      const quizzes = json.data?.quizzes || [];
      els.quizBox.innerHTML = quizzes.map((q) => `<button type="button" data-quiz="${q.slug}">${q.title}</button>`).join("");
    } catch {
      els.quizBox.innerHTML = "<p class='ai-muted'>Quiz disponibles une fois lâ€™API dÃ©ployÃ©e.</p>";
    }
  }

  els.quizBox?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-quiz]");
    if (!button) return;
    const slug = button.dataset.quiz;
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug })
    });
    const json = await res.json();
    const quiz = json.data?.quiz;
    if (!quiz) return;
    const answers = {};
    for (const question of quiz.questions) {
      const choice = question.options[question.options.length - 1];
      answers[question.id] = choice;
    }
    const scored = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, answers })
    }).then((r) => r.json());
    const result = scored.data || {};
    const saved = JSON.parse(localStorage.getItem(STORAGE_QUIZ) || "[]");
    saved.push({ slug, score: result.score, at: Date.now() });
    localStorage.setItem(STORAGE_QUIZ, JSON.stringify(saved));
    sendText(`Voici mon score ${result.score}/100 au quiz ${quiz.title}. ${result.commentary || ""}`);
    renderDashboard();
  });

  fetch("/api/me").then((r) => r.json()).then((json) => {
    if (els.premiumNote && json.data?.limits) {
      els.premiumNote.textContent = `Plan ${json.data.limits.plan} Â· ${json.data.limits.dailyMessages} messages / jour Â· Premium bientÃ´t disponible`;
    }
  }).catch(() => {});

  renderMessages();
  renderHistory();
  renderDashboard();
  renderMemories();
  loadQuiz();
  updateCount();
})();
