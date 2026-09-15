(() => {
  'use strict';
  const css = `
  :root{--ai-bg:#f8f8f7;--ai-card:#fff;--ai-text:#171817;--ai-muted:#7c7c76;--ai-line:#e7e7e2;--ai-brand:#0d5c55;--ai-accent:#e8897d;--ai-soft:#f1f6f4;}
  html,body{background:var(--ai-bg)!important;color:var(--ai-text)!important}
  body{font-family:"DM Sans",system-ui,sans-serif!important}
  .app{grid-template-columns:245px 1fr!important;background:var(--ai-bg)!important}
  .sidebar{background:#fff!important;border-right:1px solid var(--ai-line)!important;padding:20px 16px!important}
  .brand{padding:4px 6px 18px!important;font-size:12px!important}.brand-icon{width:36px!important;height:36px!important;border-radius:50%!important;background:var(--ai-brand)!important}
  .new{background:#f4f7f6!important;border:1px solid #dce8e5!important;color:#174a45!important;border-radius:12px!important;padding:12px!important}
  .search{background:#fafafa!important;border-color:var(--ai-line)!important;border-radius:11px!important}
  .topbar{height:64px!important;background:rgba(248,248,247,.9)!important;border-bottom:1px solid var(--ai-line)!important;padding:0 24px!important}
  .plan{background:transparent!important;padding:0!important;color:#85857f!important;font-size:10px!important}.plan a{color:var(--ai-brand)!important;text-decoration:none!important}
  .ai-top{font-size:10px!important;color:#555650!important}.ai-dot{width:30px!important;height:30px!important;background:var(--ai-brand)!important;box-shadow:none!important}
  .content{width:min(980px,100%)!important;padding:16px 20px 12px!important}
  .card{min-height:calc(100vh - 92px)!important;border:0!important;border-radius:18px!important;box-shadow:none!important;background:transparent!important;overflow:visible!important}
  .chat-head{padding:18px 4px 15px!important;border-bottom:0!important}.chat-head h1{font-size:28px!important;color:var(--ai-text)!important}.chat-head p{font-size:10px!important;color:var(--ai-muted)!important}.badge{border:0!important;background:#eaf4f1!important;color:var(--ai-brand)!important}
  .messages{padding:28px 4px 20px!important}.empty{margin:13vh auto!important}.empty .big{width:56px!important;height:56px!important;background:var(--ai-brand)!important;box-shadow:0 10px 28px rgba(13,92,85,.15)!important}.empty h2{font-size:34px!important;color:var(--ai-text)!important}.empty p{font-size:11px!important;color:var(--ai-muted)!important}
  .chips{gap:8px!important}.chip{background:#fff!important;border:1px solid var(--ai-line)!important;color:#62635d!important;padding:9px 13px!important}
  .msg{max-width:820px!important}.bubble{background:#fff!important;border:1px solid var(--ai-line)!important;box-shadow:0 4px 18px rgba(0,0,0,.035)!important;font-size:11px!important}.user .bubble{background:#eef6f4!important;border-color:#dcebe8!important}.avatar{background:var(--ai-brand)!important}.user .avatar{background:#242624!important}
  .tools{justify-content:center!important;border-top:0!important;background:transparent!important;padding:8px 0!important}.tool{background:#fff!important;border-color:var(--ai-line)!important;border-radius:11px!important;color:#676861!important}
  .image-panel{background:#fff!important;border:1px solid var(--ai-line)!important;border-radius:16px!important;margin-bottom:8px!important}
  .composer{max-width:820px!important;width:100%!important;margin:0 auto!important;border:1px solid #dcdcd6!important;border-radius:20px!important;background:#fff!important;box-shadow:0 7px 30px rgba(0,0,0,.07)!important;padding:9px!important;gap:7px!important}
  .plus{width:38px!important;height:38px!important;border:0!important;background:#f3f3f0!important;border-radius:50%!important;color:#62635d!important}.composer-wrap{border:0!important;box-shadow:none!important;padding:5px 7px!important}.composer textarea{font-size:11px!important}.meta{font-size:7px!important}.model{background:#f4f4f1!important}.mic{border:0!important;background:#f3f3f0!important;width:36px!important;height:36px!important}.send{width:40px!important;height:40px!important;background:var(--ai-brand)!important;box-shadow:none!important}
  .mobile-note{color:#a0a09a!important}
  @media(max-width:820px){.app{grid-template-columns:1fr!important}.sidebar{width:275px!important}.content{padding:8px 10px!important}.card{min-height:calc(100vh - 78px)!important}.chat-head{padding:14px 2px 8px!important}.chat-head h1{font-size:23px!important}.messages{padding:18px 2px!important}.empty{margin:9vh auto!important}.empty h2{font-size:28px!important}.tools{justify-content:flex-start!important;overflow-x:auto!important;padding-bottom:8px!important}.composer{border-radius:18px!important}.topbar{padding:0 12px!important}}
  @media(max-width:500px){.empty p{max-width:310px!important}.empty h2{font-size:25px!important}.chat-head p{max-width:245px!important}.badge{display:none!important}}
  `;
  const style=document.createElement('style'); style.id='amourAIRebuild'; style.textContent=css; document.head.appendChild(style);
  const fix=()=>{
    const title=document.querySelector('.chat-head h1'); if(title) title.textContent='Bonjour, je suis Amour AI';
    const desc=document.querySelector('.chat-head p'); if(desc) desc.textContent='Votre assistant pour l’amour, les relations, les projets, l’apprentissage et la créativité.';
    const input=document.querySelector('#input'); if(input) input.placeholder='Comment puis-je vous aider aujourd’hui ?';
    const search=document.querySelector('#search'); if(search) search.placeholder='Rechercher une conversation…';
    const premium=document.querySelector('.plan a'); if(premium) premium.textContent='Premium';
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fix); else fix();
})();
