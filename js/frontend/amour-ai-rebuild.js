(() => {
  'use strict';
  const css = `
  :root{--ai-bg:#f7f7f5;--ai-card:#fff;--ai-text:#20211f;--ai-muted:#777872;--ai-line:#e7e7e3;--ai-soft:#f1f1ee;--ai-dark:#20211f}
  html,body{background:var(--ai-bg)!important;color:var(--ai-text)!important}
  body{font-family:"DM Sans",system-ui,sans-serif!important}

  /* Desktop: keep the existing history/data architecture, but use the same minimal visual language. */
  .app{grid-template-columns:245px 1fr!important;background:var(--ai-bg)!important}
  .sidebar{background:#fff!important;border-right:1px solid var(--ai-line)!important;padding:18px 15px!important}
  .brand{padding:4px 6px 17px!important;font-size:12px!important}.brand-icon{width:36px!important;height:36px!important;border-radius:50%!important;background:var(--ai-dark)!important}
  .new{background:#f3f3f0!important;border:1px solid var(--ai-line)!important;color:var(--ai-text)!important;border-radius:10px!important;padding:11px!important}
  .search{background:#fafafa!important;border-color:var(--ai-line)!important;border-radius:10px!important}
  .topbar{height:62px!important;background:var(--ai-bg)!important;border-bottom:0!important;padding:0 22px!important;box-shadow:none!important}
  .plan{background:#f0f0ed!important;padding:8px 12px!important;color:#62635e!important;font-size:9px!important;border-radius:3px!important}.plan a{color:#454640!important;text-decoration:underline!important}
  .ai-top{font-size:9px!important;color:#555650!important}.ai-top span:first-child{display:none!important}.ai-dot{width:31px!important;height:31px!important;background:var(--ai-dark)!important;box-shadow:none!important}
  .content{width:min(980px,100%)!important;padding:0 20px 12px!important}
  .card{min-height:calc(100vh - 74px)!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;overflow:visible!important}
  .chat-head{padding:13px 4px 0!important;border-bottom:0!important}.chat-head h1{font-size:24px!important;color:var(--ai-text)!important}.chat-head p{font-size:9px!important;color:var(--ai-muted)!important}.badge{border:0!important;background:#ededeb!important;color:#656660!important}
  .messages{padding:18px 4px 16px!important}.empty{margin:16vh auto 10vh!important}.empty .big{width:58px!important;height:58px!important;background:var(--ai-dark)!important;box-shadow:none!important;color:#fff!important}.empty h2{font-size:28px!important;color:var(--ai-text)!important}.empty p{font-size:10px!important;color:var(--ai-muted)!important}.chips{gap:7px!important}.chip{background:#fff!important;border:1px solid var(--ai-line)!important;color:#62635d!important;padding:8px 12px!important}
  .msg{max-width:820px!important}.bubble{background:#fff!important;border:1px solid var(--ai-line)!important;box-shadow:none!important}.user .bubble{background:#f0f0ed!important;border-color:var(--ai-line)!important}.avatar{background:var(--ai-dark)!important}.user .avatar{background:#555650!important}
  .tools{justify-content:center!important;border-top:0!important;background:transparent!important;padding:8px 0!important}.tool{background:#fff!important;border-color:var(--ai-line)!important;border-radius:10px!important;color:#676861!important}
  .image-panel{background:#fff!important;border:1px solid var(--ai-line)!important;border-radius:14px!important;margin-bottom:8px!important}
  .composer{max-width:820px!important;width:100%!important;margin:0 auto!important;border:1px solid #deded9!important;border-radius:18px!important;background:#fff!important;box-shadow:0 4px 18px rgba(0,0,0,.045)!important;padding:8px!important;gap:6px!important}
  .plus{width:37px!important;height:37px!important;border:0!important;background:#f1f1ee!important;border-radius:50%!important;color:#555650!important}.composer-wrap{border:0!important;box-shadow:none!important;padding:4px 6px!important}.composer textarea{font-size:11px!important}.meta{font-size:7px!important}.model{background:transparent!important;padding:7px 5px!important;color:#5d5e58!important}.mic{border:0!important;background:transparent!important;width:34px!important;height:34px!important;color:#555650!important}.send{width:40px!important;height:40px!important;background:#20211f!important;box-shadow:none!important;font-size:0!important;position:relative}.send:after{content:'◉';font-size:15px;line-height:1;color:#fff}.send:disabled{opacity:.5}
  .mobile-note{color:#a0a09a!important}

  /* Reference model: mobile-first, airy white screen, compact top controls, centered welcome, bottom composer. */
  @media(max-width:820px){
    .app{display:block!important;background:#f7f7f5!important}
    .sidebar{display:none!important}
    .main{min-height:100svh!important;background:#f7f7f5!important}
    .topbar{height:58px!important;padding:0 12px!important;background:#f7f7f5!important;display:grid!important;grid-template-columns:42px 1fr 42px!important;align-items:center!important}
    .top-left{display:contents!important}
    .menu{display:grid!important;place-items:center!important;width:34px!important;height:34px!important;border:0!important;border-radius:8px!important;background:#f1f1ee!important;color:#4e4f4a!important;font-size:16px!important}
    .plan{grid-column:2!important;justify-self:center!important;margin:0!important;padding:8px 11px!important;background:#efefec!important;color:#5f605b!important;font-size:9px!important;border-radius:2px!important;white-space:nowrap!important}
    .plan a{font-weight:500!important;color:#42433f!important}
    .ai-top{grid-column:3!important;justify-self:end!important;margin:0!important}
    .ai-dot{width:34px!important;height:34px!important;border-radius:9px!important;background:#efefec!important;color:#555650!important;font-size:15px!important}
    .content{padding:0 10px!important;width:100%!important}
    .card{min-height:calc(100svh - 58px)!important;background:#fff!important;border-radius:0!important;display:flex!important}
    .chat-head{display:none!important}
    .messages{padding:0 8px 10px!important;display:flex!important;flex:1!important;flex-direction:column!important}
    .empty{margin:auto!important;width:100%!important;max-width:330px!important;padding:0 10px!important;text-align:center!important;transform:translateY(-7vh)!important}
    .empty .big{width:48px!important;height:48px!important;border-radius:0!important;background:transparent!important;color:#20211f!important;box-shadow:none!important;font-size:0!important;margin:0 auto 12px!important;position:relative!important}
    .empty .big:before{content:'L';font-family:"Playfair Display",serif!important;font-size:44px!important;font-weight:800!important;line-height:1!important;letter-spacing:-8px!important;display:block!important;transform:skew(-12deg)!important}
    .empty h2{font-family:"Playfair Display",serif!important;font-size:22px!important;font-weight:600!important;line-height:1.2!important;margin:0!important;color:#2a2a28!important}
    .empty p,.empty .chips{display:none!important}
    .msg{max-width:100%!important;margin-bottom:13px!important}.avatar{display:none!important}.bubble{max-width:88%!important;border:0!important;box-shadow:none!important;padding:10px 12px!important}.text{font-size:10px!important;line-height:1.55!important}
    .tools{display:none!important}
    .image-panel{margin:0 0 7px!important;border-radius:12px!important}
    .composer{width:100%!important;max-width:none!important;margin:0!important;border:1px solid #e3e3df!important;border-radius:17px!important;box-shadow:0 3px 14px rgba(0,0,0,.035)!important;padding:7px!important;display:grid!important;grid-template-columns:34px 1fr auto!important;grid-template-areas:'plus wrap right'!important;align-items:end!important}
    .plus{grid-area:plus!important;width:34px!important;height:34px!important;background:transparent!important;font-size:20px!important}
    .composer-wrap{grid-area:wrap!important;padding:2px 5px!important;min-width:0!important}
    .composer textarea{min-height:28px!important;max-height:90px!important;font-size:10px!important;line-height:1.4!important}
    .meta{display:none!important}
    .composer-right{grid-area:right!important;gap:3px!important;align-items:center!important}
    .model{display:block!important;border:0!important;background:transparent!important;font-size:8px!important;max-width:65px!important;padding:5px 2px!important;appearance:auto!important}
    .mic{display:grid!important;place-items:center!important;width:28px!important;height:28px!important;font-size:13px!important}
    .send{width:34px!important;height:34px!important;border-radius:50%!important;font-size:0!important}.send:after{font-size:13px!important}
    .mobile-note{display:block!important;text-align:center!important;font-size:6px!important;padding:4px 0 7px!important}
    .thinking,.error{font-size:8px!important}
  }

  @media(max-width:500px){
    .content{padding:0 7px!important}
    .card{min-height:calc(100svh - 58px)!important}
    .empty{transform:translateY(-9vh)!important}
    .empty h2{font-size:21px!important}
    .composer{border-radius:16px!important}
    .model{max-width:58px!important;font-size:7px!important}
    .mic{display:grid!important}
  }
  `;
  const style=document.createElement('style'); style.id='amourAIRebuild'; style.textContent=css; document.head.appendChild(style);
  const fix=()=>{
    const title=document.querySelector('.chat-head h1'); if(title) title.textContent='Bonjour, je suis Amour AI';
    const desc=document.querySelector('.chat-head p'); if(desc) desc.textContent='Votre assistant pour l’amour, les relations, les projets, l’apprentissage et la créativité.';
    const input=document.querySelector('#input'); if(input) input.placeholder='Comment puis-je vous aider aujourd’hui ?';
    const search=document.querySelector('#search'); if(search) search.placeholder='Rechercher une conversation…';
    const premium=document.querySelector('.plan a'); if(premium) premium.textContent='Upgrade';
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fix); else fix();
})();
