(() => {
  'use strict';

  /*
   * Amour AI visual layer.
   * IMPORTANT: UI only. Conversation state, local history, /api/chat,
   * /api/image and all Supabase/database code remain untouched.
   */
  const css = `
    :root{
      --am-bg:#f5f4f1;
      --am-white:#ffffff;
      --am-text:#202124;
      --am-muted:#777873;
      --am-line:#e9e8e4;
      --am-soft:#f2f1ee;
      --am-accent:#e51b72;
    }

    html,body{background:var(--am-bg)!important;color:var(--am-text)!important}
    body{font-family:"DM Sans",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}

    /* Desktop keeps the existing history architecture, with the reference's
       restrained white/grey visual language. */
    .app{grid-template-columns:245px 1fr!important;background:var(--am-bg)!important}
    .sidebar{background:#fff!important;border-right:1px solid var(--am-line)!important;padding:18px 15px!important}
    .brand{padding:4px 6px 17px!important;font-size:12px!important}
    .brand-icon{width:36px!important;height:36px!important;border-radius:50%!important;background:#202124!important}
    .new{background:var(--am-soft)!important;border:1px solid var(--am-line)!important;color:var(--am-text)!important;border-radius:10px!important}
    .search{background:#fafafa!important;border-color:var(--am-line)!important}
    .topbar{height:62px!important;background:var(--am-bg)!important;border-bottom:0!important;padding:0 22px!important;box-shadow:none!important}
    .plan{background:#eeedea!important;color:#60615c!important;border-radius:3px!important}
    .plan a{color:#383934!important}
    .ai-top span:first-child{display:none!important}
    .ai-dot{width:32px!important;height:32px!important;background:#eeedea!important;color:#454641!important;box-shadow:none!important;border-radius:9px!important}
    .content{width:min(980px,100%)!important;padding:0 20px 12px!important}
    .card{min-height:calc(100vh - 74px)!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important}
    .chat-head{padding:13px 4px 0!important;border-bottom:0!important}
    .chat-head h1{font-size:24px!important;color:var(--am-text)!important}
    .chat-head p{font-size:9px!important;color:var(--am-muted)!important}
    .badge{border:0!important;background:#ecebe8!important;color:#60615c!important}
    .messages{padding:18px 4px 16px!important}
    .empty{margin:14vh auto 10vh!important}
    .empty .big{background:#202124!important;box-shadow:none!important}
    .empty h2{font-size:28px!important;color:var(--am-text)!important}
    .empty p{font-size:10px!important;color:var(--am-muted)!important}
    .chip{background:#fff!important;border:1px solid var(--am-line)!important;color:#62635e!important}
    .bubble{background:#fff!important;border-color:var(--am-line)!important;box-shadow:none!important}
    .user .bubble{background:#f0efec!important;border-color:var(--am-line)!important}
    .avatar{background:#202124!important}
    .user .avatar{background:#555650!important}
    .tools{background:transparent!important;border-top:0!important}
    .tool{background:#fff!important;border-color:var(--am-line)!important;color:#666762!important}
    .composer{max-width:820px!important;width:100%!important;margin:0 auto!important;border:1px solid #dfded9!important;border-radius:18px!important;background:#fff!important;box-shadow:0 4px 18px rgba(0,0,0,.045)!important;padding:8px!important}
    .plus{border:0!important;background:#f1f0ed!important;color:#555650!important;border-radius:50%!important}
    .composer-wrap{border:0!important;box-shadow:none!important}
    .model{background:transparent!important;color:#5d5e58!important}
    .mic{border:0!important;background:transparent!important;color:#555650!important}
    .send{background:#202124!important;box-shadow:none!important}

    /* Reference mobile UI: clean white canvas, three compact top controls,
       centered Amour AI welcome state, then the low-profile composer. */
    @media(max-width:820px){
      .app{display:block!important;background:var(--am-bg)!important}
      .sidebar{display:none!important}
      .main{min-height:100svh!important;background:var(--am-bg)!important}
      .topbar{
        height:60px!important;
        padding:0 12px!important;
        background:var(--am-bg)!important;
        display:grid!important;
        grid-template-columns:40px 1fr 40px!important;
        align-items:center!important;
      }
      .top-left{display:contents!important}
      .menu{
        display:grid!important;
        place-items:center!important;
        width:34px!important;height:34px!important;
        border:0!important;border-radius:8px!important;
        background:#eeedea!important;color:#454641!important;
        font-size:17px!important;
      }
      .plan{
        grid-column:2!important;
        justify-self:center!important;
        margin:0!important;
        padding:8px 12px!important;
        background:#eeedea!important;
        color:#555650!important;
        font-size:9px!important;
        border-radius:2px!important;
        white-space:nowrap!important;
      }
      .plan a{font-weight:600!important;color:#333430!important}
      .ai-top{grid-column:3!important;justify-self:end!important;margin:0!important}
      .ai-dot{
        width:34px!important;height:34px!important;
        border-radius:9px!important;
        background:#eeedea!important;
        color:#555650!important;
        font-size:15px!important;
      }
      .content{width:100%!important;padding:0 8px!important}
      .card{
        min-height:calc(100svh - 60px)!important;
        background:#fff!important;
        border-radius:0!important;
        display:flex!important;
      }
      .chat-head{display:none!important}
      .messages{
        padding:0 8px 8px!important;
        display:flex!important;
        flex:1!important;
        flex-direction:column!important;
      }
      .empty{
        margin:auto!important;
        width:100%!important;
        max-width:350px!important;
        padding:0 12px!important;
        text-align:center!important;
        transform:translateY(-8vh)!important;
      }
      .empty .big{
        width:54px!important;height:54px!important;
        border-radius:0!important;
        background:transparent!important;
        color:transparent!important;
        box-shadow:none!important;
        font-size:0!important;
        margin:0 auto 13px!important;
        position:relative!important;
      }
      /* Minimal Amour mark inspired by the supplied reference. */
      .empty .big:before,
      .empty .big:after{
        content:"";
        position:absolute;
        left:50%;top:50%;
        width:25px;height:25px;
        border:4px solid #202124;
        transform:translate(-68%,-42%) rotate(45deg);
        border-radius:4px 50% 50% 50%;
      }
      .empty .big:after{
        transform:translate(-20%,-42%) rotate(45deg);
        border-color:#444540;
      }
      .empty h2{
        font-family:"Playfair Display",Georgia,serif!important;
        font-size:22px!important;
        font-weight:600!important;
        line-height:1.2!important;
        margin:0!important;
        color:#292a27!important;
      }
      .empty p,.empty .chips{display:none!important}
      .msg{max-width:100%!important;margin-bottom:13px!important}
      .avatar{display:none!important}
      .bubble{
        max-width:88%!important;
        border:0!important;
        box-shadow:none!important;
        padding:10px 12px!important;
      }
      .text{font-size:10px!important;line-height:1.55!important}
      .actions{margin-top:6px!important}
      .actions button{font-size:7px!important;padding:4px 6px!important}
      .tools{display:none!important}
      .image-panel{margin:0 0 7px!important;border-radius:12px!important}
      .composer{
        width:100%!important;
        max-width:none!important;
        margin:0!important;
        border:1px solid #e1e0dc!important;
        border-radius:17px!important;
        box-shadow:0 3px 14px rgba(0,0,0,.035)!important;
        padding:7px!important;
        display:grid!important;
        grid-template-columns:34px 1fr auto!important;
        grid-template-areas:"plus wrap right"!important;
        align-items:end!important;
        gap:3px!important;
      }
      .plus{grid-area:plus!important;width:34px!important;height:34px!important;background:transparent!important;font-size:21px!important}
      .composer-wrap{grid-area:wrap!important;padding:2px 5px!important;min-width:0!important}
      .composer textarea{min-height:28px!important;max-height:90px!important;font-size:10px!important;line-height:1.4!important}
      .meta{display:none!important}
      .composer-right{grid-area:right!important;gap:2px!important;align-items:center!important}
      .model{display:block!important;border:0!important;background:transparent!important;font-size:8px!important;max-width:62px!important;padding:5px 1px!important;appearance:auto!important}
      .mic{display:grid!important;place-items:center!important;width:28px!important;height:28px!important;font-size:13px!important}
      .send{width:34px!important;height:34px!important;border-radius:50%!important;font-size:0!important}
      .send:after{content:""!important;width:12px;height:12px;border-radius:50%;background:#fff;display:block!important;margin:auto!important}
      .mobile-note{display:block!important;text-align:center!important;font-size:6px!important;color:#a0a09a!important;padding:4px 0 7px!important}
      .thinking,.error{font-size:8px!important}
    }

    @media(max-width:500px){
      .content{padding:0 7px!important}
      .card{min-height:calc(100svh - 60px)!important}
      .empty{transform:translateY(-9vh)!important}
      .empty h2{font-size:21px!important}
      .composer{border-radius:16px!important}
      .model{max-width:55px!important;font-size:7px!important}
    }
  `;

  const old = document.getElementById('amourAIRebuild');
  if (old) old.remove();
  const style = document.createElement('style');
  style.id = 'amourAIRebuild';
  style.textContent = css;
  document.head.appendChild(style);

  const fix = () => {
    const title = document.querySelector('.chat-head h1');
    if (title) title.textContent = 'Bonjour, je suis Amour AI';
    const desc = document.querySelector('.chat-head p');
    if (desc) desc.textContent = 'Votre assistant pour l’amour, les relations, les projets, l’apprentissage et la créativité.';
    const input = document.querySelector('#input');
    if (input) input.placeholder = 'Comment puis-je vous aider aujourd’hui ?';
    const search = document.querySelector('#search');
    if (search) search.placeholder = 'Rechercher une conversation…';
    const premium = document.querySelector('.plan a');
    if (premium) premium.textContent = 'Upgrade';
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix, { once:true });
  else fix();
})();
