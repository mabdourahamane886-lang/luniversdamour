(function(){
  "use strict";

  const KEY="luniversdamour.ai.dashboard.v3",MAX=3000,MAX_MSG=200,CONTEXT=200;
  const $=id=>document.getElementById(id);
  const els={
    sidebar:$("sidebar"),history:$("history"),search:$("search"),newChat:$("newChat"),menu:$("menu"),
    messages:$("messages"),form:$("form"),input:$("input"),send:$("send"),count:$("count"),
    thinking:$("thinking"),error:$("error")
  };
  if(!els.form||!els.input||!els.messages)return;

  function uid(){return "conv_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
  function text(v,seen=new WeakSet()){
    if(typeof v==="string")return v.trim();
    if(v==null)return "";
    if(Array.isArray(v))return v.map(x=>text(x,seen)).filter(Boolean).join("\n");
    if(typeof v==="object"){
      if(seen.has(v))return ""; seen.add(v);
      for(const k of ["text","content","reply","message","output_text"]){if(typeof v[k]==="string"&&v[k].trim())return v[k].trim()}
      for(const k of ["output","response","result","data","candidates","parts"]){if(v[k]!=null){const x=text(v[k],seen);if(x)return x}}
      if(v.error){const x=text(v.error,seen);if(x)return "Erreur IA : "+x}
      return "Réponse IA reçue mais impossible à afficher.";
    }
    return String(v).trim();
  }
  function esc(v){const d=document.createElement("div");d.textContent=String(v??"");return d.innerHTML}
  function initial(){
    try{
      const x=JSON.parse(localStorage.getItem(KEY)||"null");
      if(x?.conversations?.length)return x;
      const old=JSON.parse(localStorage.getItem("luniversdamour.ai.dashboard.v1")||"null");
      if(old?.conversations?.length)return {...old,voice:false};
    }catch(e){}
    const c={id:uid(),title:"Nouvelle conversation",updatedAt:Date.now(),messages:[]};
    return{conversations:[c],activeId:c.id,voice:false};
  }
  let state=initial(),sending=false,lastRequest=null,recognition=null,listening=false;
  function save(){localStorage.setItem(KEY,JSON.stringify(state))}
  function active(){return state.conversations.find(c=>c.id===state.activeId)||state.conversations[0]}
  function group(ts){
    const d=new Date(ts),n=new Date(),a=x=>new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime();
    const diff=Math.floor((a(n)-a(d))/86400000);
    return diff===0?"Aujourd’hui":diff===1?"Hier":diff<=7?"7 derniers jours":"Plus ancien";
  }
  function renderHistory(){
    if(!els.history)return;
    const q=(els.search?.value||"").trim().toLowerCase(),groups={};
    state.conversations.filter(c=>!q||String(c.title||"").toLowerCase().includes(q)||(c.messages||[]).some(m=>text(m.text||m.content).toLowerCase().includes(q))).sort((a,b)=>b.updatedAt-a.updatedAt).forEach(c=>(groups[group(c.updatedAt)]??=[]).push(c));
    els.history.innerHTML=["Aujourd’hui","Hier","7 derniers jours","Plus ancien"].map(g=>{
      const a=groups[g];if(!a?.length)return "";
      return `<div class="group-title">${g}</div>`+a.map(c=>`<div class="conv"><button class="${c.id===state.activeId?"active":""}" data-id="${esc(c.id)}">${esc(c.title||"Conversation")}</button><button class="del" data-del="${esc(c.id)}" title="Supprimer">×</button></div>`).join("");
    }).join("")||'<div class="group-title">Aucune conversation</div>';
  }
  function render(){
    const c=active(),ms=c?.messages||[];
    if(!ms.length){
      els.messages.innerHTML='<div class="empty"><div class="big">♥</div><h2>Bonjour, je suis Amour AI</h2><p>Votre compagnon intelligent pour l’amour, les relations, les projets, l’apprentissage, la technologie et la créativité.</p><div class="chips"><button class="chip" data-prompt="Comment mieux communiquer dans une relation ?">Relations</button><button class="chip" data-prompt="Aide-moi à organiser mon projet.">Projet</button><button class="chip" data-prompt="Explique-moi un sujet simplement.">Apprentissage</button><button class="chip" data-prompt="Donne-moi une idée créative.">Créativité</button></div></div>';
      return;
    }
    const visible=ms.slice(-80);
    els.messages.innerHTML=visible.map((m,i)=>{
      const u=m.role==="user",t=text(m.text||m.content);
      return `<div class="msg ${u?"user":""}" data-index="${i}"><div class="avatar">${u?"♥":"✦"}</div><div class="bubble"><div class="text">${esc(t).replace(/\n/g,"<br>")}</div><div class="actions"><button data-act="copy" data-index="${i}">Copier</button><button data-act="share" data-index="${i}">Partager</button>${!u?'<button data-act="speak" data-index="'+i+'">Lire</button>':''}${!u?'<button data-act="regen" data-index="'+i+'">Régénérer</button>':''}<button data-act="delete" data-index="${i}">Supprimer</button></div></div></div>`;
    }).join("");
    els.messages.scrollTop=els.messages.scrollHeight;
  }
  function add(role,value){
    const c=active();c.messages=Array.isArray(c.messages)?c.messages:[];
    c.messages.push({role,text:text(value),createdAt:Date.now()});c.messages=c.messages.slice(-MAX_MSG);c.updatedAt=Date.now();
    if(role==="user"&&c.messages.filter(x=>x.role==="user").length===1)c.title=text(value).replace(/\s+/g," ").slice(0,48)||"Conversation";
    save();
  }
  async function api(messages){
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages,tool:"advice"})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(text(d?.error?.message??d?.error??d?.message)||`Erreur HTTP ${r.status}`);
    const out=text(d?.data?.reply??d?.data?.text??d?.reply??d?.text??d);
    if(!out)throw new Error("Réponse IA vide.");return out;
  }
  function resize(){
    els.input.style.height="auto";els.input.style.height=Math.min(140,Math.max(48,els.input.scrollHeight))+"px";
    if(els.count)els.count.textContent=`${els.input.value.length}/${MAX}`;
  }
  function showError(v){if(els.error){els.error.textContent=v;els.error.hidden=!v}else if(v)toast(v)}
  function toast(message){
    let n=document.getElementById("amourToast");
    if(!n){n=document.createElement("div");n.id="amourToast";n.style.cssText="position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:99999;padding:10px 14px;border-radius:12px;background:#202124;color:#fff;font:600 12px system-ui;box-shadow:0 8px 28px rgba(0,0,0,.18)";document.body.appendChild(n)}
    n.textContent=message;n.hidden=false;clearTimeout(n._t);n._t=setTimeout(()=>n.hidden=true,2400);
  }
  function speak(v){
    if(!window.speechSynthesis){toast("La lecture vocale n’est pas disponible.");return}
    window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text(v));u.lang="fr-FR";u.rate=.95;window.speechSynthesis.speak(u);
  }
  function stopSpeak(){if(window.speechSynthesis)window.speechSynthesis.cancel()}
  function setupVoice(){
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SpeechRecognition){toast("La dictée vocale n’est pas prise en charge par ce navigateur.");return}
    if(listening){recognition?.stop();return}
    recognition=new SpeechRecognition();recognition.lang=document.documentElement.lang||"fr-FR";recognition.interimResults=true;recognition.continuous=false;
    recognition.onstart=()=>{listening=true;voiceBtn.classList.add("recording");voiceBtn.setAttribute("aria-label","Arrêter la dictée");toast("Écoute en cours…")};
    recognition.onresult=e=>{let finalText="";for(let i=e.resultIndex;i<e.results.length;i++)finalText+=e.results[i][0].transcript;if(finalText)els.input.value=finalText;resize()};
    recognition.onerror=e=>{listening=false;voiceBtn.classList.remove("recording");toast(e.error==="not-allowed"?"Autorisez le microphone dans votre navigateur.":"Impossible d’utiliser le microphone.")};
    recognition.onend=()=>{listening=false;voiceBtn.classList.remove("recording");voiceBtn.setAttribute("aria-label","Dicter un message")};
    recognition.start();
  }
  let voiceBtn=null;
  function injectVoice(){
    if(document.getElementById("amourVoiceButton"))return document.getElementById("amourVoiceButton");
    const host=els.form.querySelector(".composer-right")||els.form.querySelector(".composer")||els.form;
    voiceBtn=document.createElement("button");voiceBtn.type="button";voiceBtn.id="amourVoiceButton";voiceBtn.className="amour-voice-button";voiceBtn.textContent="🎙";voiceBtn.title="Dicter un message";voiceBtn.setAttribute("aria-label","Dicter un message");
    host.appendChild(voiceBtn);voiceBtn.addEventListener("click",setupVoice);return voiceBtn;
  }
  function injectStyle(){
    if(document.getElementById("amour-ai-enhanced-style"))return;
    const s=document.createElement("style");s.id="amour-ai-enhanced-style";s.textContent=`
      .amour-voice-button{width:34px;height:34px;border:0;border-radius:50%;background:#f2f1ee;color:#202124;cursor:pointer;font-size:15px;display:inline-grid;place-items:center;margin:0 2px;transition:.18s}
      .amour-voice-button:hover{transform:scale(1.05)}.amour-voice-button.recording{background:#e51b72;color:#fff;animation:amourPulse 1.1s infinite}
      @keyframes amourPulse{50%{box-shadow:0 0 0 7px rgba(229,27,114,.12)}}
      .actions{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px}.actions button{cursor:pointer;border:1px solid #e8e6e2;background:#fff;border-radius:8px;padding:5px 8px;font-size:11px}
      .actions button:hover{background:#f7f6f3}.msg .text{white-space:normal}.empty .chip{cursor:pointer}
      @media(max-width:820px){.amour-voice-button{width:28px;height:28px;font-size:13px}.actions button{font-size:8px;padding:4px 6px}}
    `;document.head.appendChild(s);
  }
  function newChat(){const c={id:uid(),title:"Nouvelle conversation",updatedAt:Date.now(),messages:[]};state.conversations.unshift(c);state.activeId=c.id;save();render();renderHistory();els.input.focus()}
  function select(id){if(!state.conversations.some(c=>c.id===id))return;state.activeId=id;save();render();renderHistory();els.sidebar?.classList.remove("open");els.input.focus()}
  function del(id){
    const c=state.conversations.find(x=>x.id===id);if(!c)return;if(!confirm(`Supprimer « ${c.title} » ?`))return;
    state.conversations=state.conversations.filter(x=>x.id!==id);if(!state.conversations.length){const n={id:uid(),title:"Nouvelle conversation",updatedAt:Date.now(),messages:[]};state.conversations=[n];state.activeId=n.id}else if(state.activeId===id)state.activeId=state.conversations[0].id;save();render();renderHistory();
  }
  async function send(value){
    value=text(value);if(!value||sending)return;if(value.length>MAX){showError(`Maximum ${MAX} caractères.`);return}
    const c=active(),ctx=(c.messages||[]).slice(-CONTEXT).map(m=>({role:m.role,content:text(m.text||m.content)}));ctx.push({role:"user",content:value});lastRequest=ctx;
    add("user",value);render();renderHistory();els.input.value="";resize();sending=true;els.send.disabled=true;els.thinking.hidden=false;els.error.hidden=true;
    try{const reply=await api(ctx);add("assistant",reply);render();renderHistory();if(state.voice)speak(reply)}catch(e){showError(e.message||"Impossible de contacter Amour AI.")}finally{sending=false;els.send.disabled=false;els.thinking.hidden=true}
  }
  async function regenerate(){
    if(!lastRequest||sending)return;sending=true;els.send.disabled=true;els.thinking.hidden=false;els.error.hidden=true;
    const c=active();if(c.messages?.at(-1)?.role==="assistant")c.messages.pop();save();render();
    try{const reply=await api(lastRequest);add("assistant",reply);render();renderHistory()}catch(e){showError(e.message||"Impossible de régénérer la réponse.")}finally{sending=false;els.send.disabled=false;els.thinking.hidden=true}
  }
  async function messageAction(e){
    const b=e.target.closest("[data-act]");if(!b)return;const visible=active().messages.slice(-80),m=visible[Number(b.dataset.index)];if(!m)return;const t=text(m.text||m.content);
    if(b.dataset.act==="copy")navigator.clipboard?.writeText(t).then(()=>toast("Réponse copiée."));
    if(b.dataset.act==="share"){if(navigator.share){navigator.share({title:"Amour AI",text:t}).catch(()=>{})}else navigator.clipboard?.writeText(t).then(()=>toast("Texte copié pour partage."))}
    if(b.dataset.act==="speak")speak(t);if(b.dataset.act==="regen")regenerate();
    if(b.dataset.act==="delete"){const real=active().messages.length-visible.length+Number(b.dataset.index);active().messages.splice(real,1);save();render();renderHistory()}
  }
  els.form.addEventListener("submit",e=>{e.preventDefault();send(els.input.value)});
  els.input.addEventListener("input",resize);
  els.input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();els.form.requestSubmit()}});
  els.newChat?.addEventListener("click",newChat);els.search?.addEventListener("input",renderHistory);
  els.menu?.addEventListener("click",()=>els.sidebar?.classList.toggle("open"));
  els.history?.addEventListener("click",e=>{const id=e.target.dataset.id,delId=e.target.dataset.del;if(id)select(id);if(delId)del(delId)});
  els.messages.addEventListener("click",e=>{const chip=e.target.closest("[data-prompt]");if(chip){send(chip.dataset.prompt);return}messageAction(e)});
  injectStyle();injectVoice();render();renderHistory();resize();
})();