(function () {
  "use strict";

  const STORAGE_KEY = "luniversdamour.ai.v2";
  const ACTIVE_KEY = "luniversdamour.ai.activeConversation";
  const MAX_INPUT = 3000;
  const MAX_HISTORY = 200;
  const MODEL_CONTEXT_MESSAGES = 200;

  const els = {
    form: document.getElementById("aiForm"), input: document.getElementById("aiInput"), send: document.getElementById("aiSend"),
    messages: document.getElementById("aiMessages"), thinking: document.getElementById("aiThinking"), error: document.getElementById("aiError"),
    retry: document.getElementById("aiRetry"), suggestions: document.getElementById("aiSuggestions"), tool: document.getElementById("aiTool"),
    charCount: document.getElementById("aiCharCount"), newConv: document.getElementById("newAiChat"), search: document.getElementById("aiHistorySearch"),
    convList: document.getElementById("aiConvList"), speak: document.getElementById("aiSpeakToggle"), stopSpeak: document.getElementById("aiStopSpeak"),
    voice: document.getElementById("voiceButton"), micStop: document.getElementById("voiceStopButton")
  };
  if (!els.form || !els.input || !els.messages) return;

  const welcome = "Bonjour ❤️ Je suis Amour AI, l'assistante de L'univers d'amour. Je peux répondre à vos questions, vous aider à comprendre une situation, préparer un message, étudier un sujet, résoudre un problème technique ou réfléchir avec vous avec respect et douceur.";
  const toast = window.showSiteToast || function (message) { const node = document.getElementById("toast"); if (!node) return; const span = node.querySelector("span"); if (span) span.textContent = message; node.classList.add("show"); window.setTimeout(() => node.classList.remove("show"), 2600); };

  function normalizeAiText(value, seen = new WeakSet()) {
    if (typeof value === "string") return value.trim();
    if (value == null) return "";
    if (Array.isArray(value)) return value.map((item) => normalizeAiText(item, seen)).filter(Boolean).join("\n").trim();
    if (typeof value === "object") {
      if (seen.has(value)) return ""; seen.add(value);
      for (const key of ["text", "content", "reply", "message", "output_text"]) if (typeof value[key] === "string" && value[key].trim()) return value[key].trim();
      for (const key of ["output", "response", "result", "data", "candidates", "parts"]) if (value[key] != null) { const nested = normalizeAiText(value[key], seen); if (nested) return nested; }
      if (value.error) { const errorText = normalizeAiText(value.error, seen); if (errorText) return `Erreur IA : ${errorText}`; }
      return "Réponse IA reçue mais impossible à afficher.";
    }
    return String(value).trim();
  }
  function uid() { return "ai_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY), saved = raw ? JSON.parse(raw) : null;
      if (saved && Array.isArray(saved.conversations) && saved.conversations.length) {
        const active = sessionStorage.getItem(ACTIVE_KEY) || saved.activeId;
        saved.activeId = saved.conversations.some(c => c.id === active) ? active : saved.conversations[0].id;
        return saved;
      }
    } catch (_) {}
    const first = { id: uid(), title: "Nouvelle conversation", updatedAt: Date.now(), messages: [] };
    return { conversations: [first], activeId: first.id, voice: false };
  }
  let state = loadState(), sending = false, lastRequest = null;
  function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); try { sessionStorage.setItem(ACTIVE_KEY, state.activeId); } catch (_) {} }
  function activeConversation() { return state.conversations.find(item => item.id === state.activeId) || state.conversations[0]; }
  function escapeHtml(value) { const div = document.createElement("div"); div.textContent = String(value ?? ""); return div.innerHTML; }
  function setThinking(value) { if (els.thinking) els.thinking.hidden = !value; if (els.send) els.send.disabled = value; }
  function setError(message, retryable) { if (!els.error) { if (message) toast(message); return; } const text = els.error.querySelector("[data-error-text]"); if (text) text.textContent = message || ""; els.error.hidden = !message; if (els.retry) els.retry.hidden = !retryable; }

  function injectChatStyle() {
    if (document.getElementById("amour-ai-chat-style")) return;
    const style = document.createElement("style"); style.id = "amour-ai-chat-style";
    style.textContent = `
      .ai-history-group{margin:12px 0}.ai-history-group-title{padding:7px 10px;color:#8a727b;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}
      .ai-conv-row{display:flex;align-items:center;gap:3px;margin:2px 0}.ai-conv-item{display:block!important;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:10px 11px!important;border-radius:10px!important;text-align:left!important}
      .ai-conv-delete{width:32px;height:32px;border:0;background:transparent;color:#9b7d87;border-radius:8px;cursor:pointer;opacity:.35}.ai-conv-delete:hover{opacity:1;background:#fff0f4;color:#c92f55}
      .ai-chat-shell{position:relative;display:flex;min-height:640px}.ai-chat-sidebar{width:245px;flex:0 0 245px;border-right:1px solid #f0dfe5;background:#fff9fb;padding:14px;display:flex;flex-direction:column;gap:10px}.ai-chat-sidebar-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.ai-chat-sidebar-title{font-weight:800;font-size:13px}.ai-chat-new{width:100%;padding:11px 12px;border:1px solid #f0dfe5;border-radius:11px;background:#fff;color:#c92f55;font-weight:800;cursor:pointer}.ai-chat-main{min-width:0;flex:1}.ai-chat-mobile-history{display:none}
      .ai-chat-sidebar .conv-list,.ai-chat-sidebar .ai-conv-list{max-height:none;overflow:auto;flex:1}.ai-chat-sidebar .history-search{margin:0 0 2px}
      @media(max-width:800px){.ai-chat-sidebar{display:none}.ai-chat-mobile-history{display:flex}.ai-chat-shell{min-height:0}.ai-chat-main{width:100%}.ai-chat-mobile-history{padding:8px;border-bottom:1px solid #f0dfe5;gap:7px;overflow:auto}.ai-chat-mobile-history button{flex:0 0 auto}.ai-chat-mobile-history .mobile-new{padding:8px 10px;border-radius:9px;background:#fff0f4;color:#c92f55;font-weight:800}}
    `; document.head.appendChild(style);
  }

  function renderMessages() {
    const conversation = activeConversation(), messages = conversation?.messages || [];
    if (!messages.length) { els.messages.innerHTML = `<div class="ai-message ai-message-assistant"><div class="message-avatar">✨</div><div class="message-bubble"><div class="message-content">${escapeHtml(welcome)}</div></div></div>`; return; }
    const visible = messages.slice(-80);
    els.messages.innerHTML = visible.map((message,index) => { const user = message.role === "user", text = normalizeAiText(message.text ?? message.content); return `<div class="ai-message ${user ? "ai-message-user" : "ai-message-assistant"}" data-message-index="${index}"><div class="message-avatar">${user ? "💗" : "✨"}</div><div class="message-bubble"><div class="message-content">${escapeHtml(text)}</div><div class="message-actions"><button type="button" data-act="copy">Copier</button><button type="button" data-act="share">Partager</button>${user ? "" : '<button type="button" data-act="speak">Lire</button>'}${user ? "" : '<button type="button" data-act="regen">Régénérer</button>'}<button type="button" data-act="delete">Supprimer</button></div></div></div>`; }).join("");
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function historyGroupLabel(timestamp) { const d = new Date(timestamp || Date.now()), n = new Date(); const start = x => new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime(); const diff = Math.floor((start(n)-start(d))/86400000); if (diff === 0) return "Aujourd'hui"; if (diff === 1) return "Hier"; if (diff <= 7) return "7 derniers jours"; return "Plus ancien"; }
  function renderHistory() {
    if (!els.convList) return;
    const q = String(els.search?.value || "").trim().toLowerCase(), groups = new Map(), order = ["Aujourd'hui","Hier","7 derniers jours","Plus ancien"];
    state.conversations.filter(item => !q || String(item.title).toLowerCase().includes(q) || (item.messages || []).some(m => normalizeAiText(m.text || m.content).toLowerCase().includes(q))).sort((a,b)=>b.updatedAt-a.updatedAt).forEach(item => { const group=historyGroupLabel(item.updatedAt); if(!groups.has(group)) groups.set(group,[]); groups.get(group).push(item); });
    els.convList.innerHTML = order.map(group => { const items=groups.get(group); if(!items?.length) return ""; return `<section class="ai-history-group"><div class="ai-history-group-title">${group}</div>${items.map(item => `<div class="ai-conv-row"><button type="button" class="ai-conv-item ${item.id===state.activeId?"active":""}" data-conv-id="${item.id}" title="${escapeHtml(item.title||"Conversation")}">${escapeHtml(item.title||"Conversation")}</button><button type="button" class="ai-conv-delete" data-delete-conv="${item.id}" aria-label="Supprimer">×</button></div>`).join("")}</section>`; }).join("") || `<p class="ai-muted">Aucune conversation</p>`;
  }
  function updateCharCount(){ if(els.charCount) els.charCount.textContent=`${els.input.value.length}/${MAX_INPUT}`; }
  function addMessage(role,text){ const conversation=activeConversation(); conversation.messages=Array.isArray(conversation.messages)?conversation.messages:[]; const normalized=normalizeAiText(text)||"Réponse IA vide."; conversation.messages.push({role,text:normalized,createdAt:Date.now()}); conversation.messages=conversation.messages.slice(-MAX_HISTORY); conversation.updatedAt=Date.now(); if(role==="user" && conversation.messages.filter(m=>m.role==="user").length===1) conversation.title=normalized.replace(/\s+/g," ").slice(0,48)||"Conversation"; persist(); }
  async function postJson(url,payload){ const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); const data=await response.json().catch(()=>({})); if(!response.ok){const message=normalizeAiText(data?.error?.message??data?.error??data?.message)||`Erreur HTTP ${response.status}`; const error=new Error(message); error.retryable=response.status>=500||response.status===429; throw error;} return data?.data||data; }
  async function generate(messages,tool){ const data=await postJson("/api/chat",{messages,tool}); const text=normalizeAiText(data?.reply??data?.text??data?.message??data); if(text) return {text,provider:data?.provider||"vercel"}; throw new Error("Réponse IA vide."); }

  async function send(text){
    const value=String(text||"").trim(); if(!value||sending)return; if(value.length>MAX_INPUT){setError(`Votre message est trop long. Maximum : ${MAX_INPUT} caractères.`,false);return;}
    sending=true; setError(""); const conversation=activeConversation(); const history=(conversation.messages||[]).slice(-MODEL_CONTEXT_MESSAGES).map(item=>({role:item.role,content:normalizeAiText(item.text||item.content)})); history.push({role:"user",content:value}); lastRequest={messages:history.slice(-MODEL_CONTEXT_MESSAGES),tool:els.tool?.value||"advice"};
    addMessage("user",value); renderMessages(); renderHistory(); els.input.value=""; updateCharCount(); setThinking(true);
    try{const result=await generate(lastRequest.messages,lastRequest.tool); if(!result.text)throw new Error("Réponse IA vide."); addMessage("assistant",result.text); renderMessages(); renderHistory(); if(state.voice)speak(result.text);}catch(error){setError(error.message||"Impossible de contacter Amour AI.",Boolean(error.retryable));}finally{sending=false;setThinking(false);}
  }
  async function regenerate(){ if(!lastRequest||sending)return; const conversation=activeConversation(); while(conversation.messages?.length&&conversation.messages[conversation.messages.length-1].role==="assistant")conversation.messages.pop(); persist(); renderMessages(); sending=true; setThinking(true); try{const result=await generate(lastRequest.messages,lastRequest.tool);addMessage("assistant",result.text);renderMessages();renderHistory();}catch(error){setError(error.message||"Impossible de régénérer la réponse.",Boolean(error.retryable));}finally{sending=false;setThinking(false);} }
  function speak(text){if(!(window.speechSynthesis))return toast("La lecture vocale n'est pas prise en charge sur ce navigateur.");window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(normalizeAiText(text));utterance.lang=document.documentElement.lang||"fr-FR";utterance.rate=.95;window.speechSynthesis.speak(utterance);}
  function stopSpeak(){if(window.speechSynthesis)window.speechSynthesis.cancel();}
  function selectConversation(id){if(!state.conversations.some(c=>c.id===id))return;state.activeId=id;persist();renderMessages();renderHistory();els.input?.focus();}
  function newConversation(){ const current=activeConversation(); if(current&&!(current.messages||[]).length&&current.title==="Nouvelle conversation"){selectConversation(current.id);return;} const conversation={id:uid(),title:"Nouvelle conversation",updatedAt:Date.now(),messages:[]};state.conversations.unshift(conversation);state.activeId=conversation.id;persist();renderMessages();renderHistory();els.input?.focus(); }
  function deleteConversation(id){const conversation=state.conversations.find(c=>c.id===id);if(!conversation)return;if(!window.confirm(`Supprimer « ${conversation.title||"Conversation"} » ?`))return;state.conversations=state.conversations.filter(c=>c.id!==id);if(!state.conversations.length){const first={id:uid(),title:"Nouvelle conversation",updatedAt:Date.now(),messages:[]};state.conversations=[first];state.activeId=first.id;}else if(state.activeId===id)state.activeId=state.conversations[0].id;persist();renderMessages();renderHistory();}
  function handleMessageAction(button){const item=button.closest(".ai-message");if(!item)return;const index=Number(item.dataset.messageIndex),messages=activeConversation().messages||[],visible=messages.slice(-80),message=visible[index];if(!message)return;const text=normalizeAiText(message.text??message.content),action=button.dataset.act;if(action==="copy")navigator.clipboard?.writeText(text).then(()=>toast("Copié."));if(action==="share"){if(navigator.share)navigator.share({title:"L'univers d'amour",text});else navigator.clipboard?.writeText(text).then(()=>toast("Texte copié pour partage."));}if(action==="speak")speak(text);if(action==="regen")regenerate();if(action==="delete"){const realIndex=messages.length-visible.length+index;messages.splice(realIndex,1);persist();renderMessages();renderHistory();}}

  function mountChatShell(){
    injectChatStyle();
    const workspace=els.messages.closest(".workspace");
    if(!workspace||workspace.dataset.amourShell)return;
    workspace.dataset.amourShell="1";
    const rail=workspace.querySelector(".rail");
    const sidebar=document.createElement("aside"); sidebar.className="ai-chat-sidebar"; sidebar.innerHTML=`<div class="ai-chat-sidebar-head"><div class="ai-chat-sidebar-title">Amour AI</div><button type="button" class="icon" id="aiHistoryClose" aria-label="Fermer">×</button></div><button type="button" class="ai-chat-new" id="aiChatNew">＋ Nouvelle conversation</button><input class="history-search" id="aiChatSearch" type="search" placeholder="Rechercher une conversation…"><div class="ai-conv-list" id="aiChatList"></div>`;
    workspace.insertBefore(sidebar,workspace.firstChild);
    const main=workspace.querySelector(".messages")?.parentElement;
    const list=document.getElementById("aiChatList"), search=document.getElementById("aiChatSearch"), newBtn=document.getElementById("aiChatNew");
    if(list){els.convList=list;list.addEventListener("click",event=>{const del=event.target.closest("[data-delete-conv]");if(del){event.preventDefault();deleteConversation(del.dataset.deleteConv);return;}const btn=event.target.closest("[data-conv-id]");if(btn)selectConversation(btn.dataset.convId);});}
    if(search){els.search=search;search.addEventListener("input",renderHistory);}
    newBtn?.addEventListener("click",newConversation);
    rail?.remove();
    if(els.newConv)els.newConv.addEventListener("click",newConversation);
  }

  els.form.addEventListener("submit",event=>{event.preventDefault();send(els.input.value);});
  els.input.addEventListener("input",updateCharCount);
  els.messages.addEventListener("click",event=>{const button=event.target.closest("button[data-act]");if(button)handleMessageAction(button);});
  if(els.search)els.search.addEventListener("input",renderHistory);
  els.newConv?.addEventListener("click",newConversation);
  els.retry?.addEventListener("click",()=>lastRequest&&send(lastRequest.messages.at(-1)?.content||""));
  els.speak?.addEventListener("click",()=>{state.voice=!state.voice;persist();toast(state.voice?"Lecture vocale activée.":"Lecture vocale désactivée.");});
  els.stopSpeak?.addEventListener("click",stopSpeak);
  if(els.suggestions)els.suggestions.addEventListener("click",event=>{const button=event.target.closest("button,[data-prompt]");if(!button)return;const prompt=button.dataset.prompt||button.textContent||"";if(prompt.trim()){els.input.value=prompt.trim();updateCharCount();els.form.requestSubmit();}});
  if(els.voice&&(window.SpeechRecognition||window.webkitSpeechRecognition)){const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;els.voice.addEventListener("click",()=>{const recognition=new Recognition();recognition.lang=document.documentElement.lang||"fr-FR";recognition.interimResults=false;recognition.onresult=event=>{els.input.value=`${els.input.value} ${event.results[0][0].transcript}`.trim();updateCharCount();};recognition.onerror=()=>toast("Impossible d'utiliser le microphone.");recognition.start();});}
  if(els.micStop)els.micStop.addEventListener("click",stopSpeak);

  mountChatShell();
  renderMessages(); renderHistory(); updateCharCount();
})();
