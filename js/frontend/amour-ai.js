(function () {
  "use strict";

  const STORAGE_KEY = "luniversdamour.ai.v2";
  const MAX_INPUT = 3000;
  const MAX_HISTORY = 200;
  const MODEL_CONTEXT_MESSAGES = 200;
  const DEFAULT_SUPABASE_URL = "https://bawryduhgopvxynqmiyo.supabase.co";
  const DEFAULT_SUPABASE_KEY = "sb_publishable_qZ9W7AdHI1zwGEMpDx2QDQ_8O6tjV1B";

  const els = {
    form: document.getElementById("aiForm"),
    input: document.getElementById("aiInput"),
    send: document.getElementById("aiSend"),
    messages: document.getElementById("aiMessages"),
    thinking: document.getElementById("aiThinking"),
    error: document.getElementById("aiError"),
    retry: document.getElementById("aiRetry"),
    suggestions: document.getElementById("aiSuggestions"),
    tool: document.getElementById("aiTool"),
    charCount: document.getElementById("aiCharCount"),
    newConv: document.getElementById("newAiChat"),
    search: document.getElementById("aiHistorySearch"),
    convList: document.getElementById("aiConvList"),
    speak: document.getElementById("aiSpeakToggle"),
    stopSpeak: document.getElementById("aiStopSpeak"),
    voice: document.getElementById("voiceButton"),
    micStop: document.getElementById("voiceStopButton")
  };

  if (!els.form || !els.input || !els.messages) return;

  const welcome =
    "Bonjour ❤️ Je suis Amour AI, l'assistante de L'univers d'amour. Je peux répondre à vos questions, vous aider à comprendre une situation, préparer un message, étudier un sujet, résoudre un problème technique ou réfléchir avec vous avec respect et douceur.";

  const toast = window.showSiteToast || function (message) {
    const node = document.getElementById("toast");
    if (!node) return;
    const span = node.querySelector("span");
    if (span) span.textContent = message;
    node.classList.add("show");
    window.setTimeout(() => node.classList.remove("show"), 2600);
  };

  function normalizeAiText(value) {
    if (typeof value === "string") return value.trim();
    if (value == null) return "";
    if (Array.isArray(value)) return value.map(normalizeAiText).filter(Boolean).join("\n").trim();
    if (typeof value === "object") {
      const direct = ["text", "content", "reply", "message", "output_text"].find((key) => typeof value[key] === "string");
      if (direct) return value[direct].trim();
      for (const key of ["output", "response", "result", "data"]) {
        if (value[key] != null) {
          const nested = normalizeAiText(value[key]);
          if (nested) return nested;
        }
      }
    }
    return String(value).trim();
  }

  function uid() {
    return "ai_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const state = raw ? JSON.parse(raw) : null;
      if (state && Array.isArray(state.conversations)) return state;
    } catch (_) {}
    const first = { id: uid(), title: "Nouvelle conversation", updatedAt: Date.now(), messages: [] };
    return { conversations: [first], activeId: first.id, voice: false };
  }

  let state = loadState();
  let sending = false;
  let lastRequest = null;

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function activeConversation() {
    return state.conversations.find((item) => item.id === state.activeId) || state.conversations[0];
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
  }

  function setThinking(value) {
    if (els.thinking) els.thinking.hidden = !value;
    if (els.send) els.send.disabled = value;
  }

  function setError(message, retryable) {
    if (!els.error) {
      if (message) toast(message);
      return;
    }
    const text = els.error.querySelector("[data-error-text]");
    if (text) text.textContent = message || "";
    els.error.hidden = !message;
    if (els.retry) els.retry.hidden = !retryable;
  }

  function renderMessages() {
    const conversation = activeConversation();
    const messages = conversation?.messages || [];
    if (!messages.length) {
      els.messages.innerHTML = `
        <div class="ai-message ai-message-assistant">
          <div class="message-avatar">✨</div>
          <div class="message-bubble">
            <div class="message-content">${escapeHtml(welcome)}</div>
          </div>
        </div>`;
      return;
    }
    els.messages.innerHTML = messages.slice(-80).map((message, index) => {
      const user = message.role === "user";
      const text = normalizeAiText(message.text ?? message.content);
      return `
        <div class="ai-message ${user ? "ai-message-user" : "ai-message-assistant"}" data-message-index="${index}">
          <div class="message-avatar">${user ? "💗" : "✨"}</div>
          <div class="message-bubble">
            <div class="message-content">${escapeHtml(text)}</div>
            <div class="message-actions">
              <button type="button" data-act="copy">Copier</button>
              <button type="button" data-act="share">Partager</button>
              ${user ? "" : '<button type="button" data-act="speak">Lire</button>'}
              ${user ? "" : '<button type="button" data-act="regen">Régénérer</button>'}
              <button type="button" data-act="delete">Supprimer</button>
            </div>
          </div>
        </div>`;
    }).join("");
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function renderHistory() {
    if (!els.convList) return;
    const q = String(els.search?.value || "").trim().toLowerCase();
    const rows = state.conversations
      .filter((item) => !q || String(item.title).toLowerCase().includes(q) || (item.messages || []).some((m) => normalizeAiText(m.text || m.content).toLowerCase().includes(q)))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((item) => `
        <button type="button" class="ai-conv-item ${item.id === state.activeId ? "active" : ""}" data-conv-id="${item.id}">
          ${escapeHtml(item.title || "Conversation")}
        </button>`);
    els.convList.innerHTML = rows.join("") || "<p class=\"ai-muted\">Aucune conversation</p>";
  }

  function updateCharCount() {
    if (els.charCount) els.charCount.textContent = `${els.input.value.length}/${MAX_INPUT}`;
  }

  function addMessage(role, text) {
    const conversation = activeConversation();
    conversation.messages = Array.isArray(conversation.messages) ? conversation.messages : [];
    const normalized = normalizeAiText(text);
    conversation.messages.push({ role, text: normalized, createdAt: Date.now() });
    conversation.messages = conversation.messages.slice(-MAX_HISTORY);
    conversation.updatedAt = Date.now();
    if (role === "user" && conversation.messages.filter((m) => m.role === "user").length === 1) {
      conversation.title = normalized.replace(/\s+/g, " ").slice(0, 48) || "Conversation";
    }
    persist();
  }

  async function postJson(url, payload) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error?.message || data?.error || "L'assistant est indisponible.");
      error.retryable = response.status >= 500 || response.status === 429;
      throw error;
    }
    return data?.data || data;
  }

  async function askSupabase(messages, tool) {
    const config = window.LUNIVERS_SUPABASE || {};
    const url = String(config.url || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
    const key = String(config.anonKey || DEFAULT_SUPABASE_KEY).trim();
    const response = await fetch(`${url}/functions/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({ messages, tool })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || "Supabase indisponible.");
    return normalizeAiText(data.reply ?? data.text);
  }

  async function generate(messages, tool) {
    try {
      const data = await postJson("/api/chat", { messages, tool });
      const text = normalizeAiText(data.reply ?? data.text);
      if (text) return { text, provider: data.provider || "vercel" };
      throw new Error("Réponse IA vide.");
    } catch (primaryError) {
      try {
        const text = await askSupabase(messages, tool);
        if (text) return { text, provider: "supabase" };
      } catch (_) {}
      throw primaryError;
    }
  }

  async function send(text) {
    const value = String(text || "").trim();
    if (!value || sending) return;
    if (value.length > MAX_INPUT) {
      setError(`Votre message est trop long. Maximum : ${MAX_INPUT} caractères.`, false);
      return;
    }

    sending = true;
    setError("");
    const conversation = activeConversation();
    const history = (conversation.messages || []).slice(-MODEL_CONTEXT_MESSAGES).map((item) => ({
      role: item.role,
      content: normalizeAiText(item.text || item.content)
    }));
    history.push({ role: "user", content: value });
    lastRequest = { messages: history.slice(-MODEL_CONTEXT_MESSAGES), tool: els.tool?.value || "advice" };

    addMessage("user", value);
    renderMessages();
    renderHistory();
    els.input.value = "";
    updateCharCount();
    setThinking(true);

    try {
      const result = await generate(lastRequest.messages, lastRequest.tool);
      if (!result.text) throw new Error("Réponse IA vide.");
      addMessage("assistant", result.text);
      renderMessages();
      renderHistory();
      if (state.voice) speak(result.text);
    } catch (error) {
      setError(error.message || "Impossible de contacter Amour AI.", Boolean(error.retryable));
    } finally {
      sending = false;
      setThinking(false);
    }
  }

  async function regenerate() {
    if (!lastRequest || sending) return;
    const conversation = activeConversation();
    while (conversation.messages?.length && conversation.messages[conversation.messages.length - 1].role === "assistant") {
      conversation.messages.pop();
    }
    persist();
    renderMessages();
    sending = true;
    setThinking(true);
    try {
      const result = await generate(lastRequest.messages, lastRequest.tool);
      addMessage("assistant", result.text);
      renderMessages();
    } catch (error) {
      setError(error.message || "Impossible de régénérer la réponse.", Boolean(error.retryable));
    } finally {
      sending = false;
      setThinking(false);
    }
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      toast("La lecture vocale n'est pas prise en charge sur ce navigateur.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(normalizeAiText(text));
    utterance.lang = document.documentElement.lang || "fr-FR";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeak() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  function newConversation() {
    const conversation = { id: uid(), title: "Nouvelle conversation", updatedAt: Date.now(), messages: [] };
    state.conversations.push(conversation);
    state.activeId = conversation.id;
    persist();
    renderMessages();
    renderHistory();
  }

  function handleMessageAction(button) {
    const item = button.closest(".ai-message");
    if (!item) return;
    const index = Number(item.dataset.messageIndex);
    const messages = activeConversation().messages || [];
    const visible = messages.slice(-80);
    const message = visible[index];
    if (!message) return;
    const text = normalizeAiText(message.text ?? message.content);
    const action = button.dataset.act;

    if (action === "copy") navigator.clipboard?.writeText(text).then(() => toast("Copié."));
    if (action === "share") {
      if (navigator.share) navigator.share({ title: "L'univers d'amour", text });
      else navigator.clipboard?.writeText(text).then(() => toast("Texte copié pour partage."));
    }
    if (action === "speak") speak(text);
    if (action === "regen") regenerate();
    if (action === "delete") {
      const realIndex = messages.length - visible.length + index;
      messages.splice(realIndex, 1);
      persist();
      renderMessages();
    }
  }

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    send(els.input.value);
  });

  els.input.addEventListener("input", updateCharCount);

  els.messages.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-act]");
    if (button) handleMessageAction(button);
  });

  els.convList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-conv-id]");
    if (!button) return;
    state.activeId = button.dataset.convId;
    persist();
    renderMessages();
    renderHistory();
  });

  els.search?.addEventListener("input", renderHistory);
  els.newConv?.addEventListener("click", newConversation);
  els.retry?.addEventListener("click", () => lastRequest && send(lastRequest.messages.at(-1)?.content || ""));
  els.speak?.addEventListener("click", () => { state.voice = !state.voice; persist(); toast(state.voice ? "Lecture vocale activée." : "Lecture vocale désactivée."); });
  els.stopSpeak?.addEventListener("click", stopSpeak);

  if (els.suggestions) {
    els.suggestions.addEventListener("click", (event) => {
      const button = event.target.closest("button,[data-prompt]");
      if (!button) return;
      const prompt = button.dataset.prompt || button.textContent || "";
      if (prompt.trim()) {
        els.input.value = prompt.trim();
        updateCharCount();
        els.form.requestSubmit();
      }
    });
  }

  if (els.voice && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    els.voice.addEventListener("click", () => {
      const recognition = new Recognition();
      recognition.lang = document.documentElement.lang || "fr-FR";
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        els.input.value = `${els.input.value} ${event.results[0][0].transcript}`.trim();
        updateCharCount();
      };
      recognition.start();
    });
    els.micStop?.addEventListener("click", () => {});
  }

  renderMessages();
  renderHistory();
  updateCharCount();
})();
