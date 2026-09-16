/* projector.js — 投屏（v31・用戶：「要加入投屏功能」「方便領袖教學」：領袖用自己部手機做控制器，投影／大電視同步顯示）
 *
 * 兩種用法，兩種都係同一部機／同一個瀏覽器，唔使上網、唔會上傳任何資料：
 *   ① 同機投屏：撳「🖥️ 投屏」→ App 蓋住成個畫面出大字（接咗投影機／HDMI 就係投影）。
 *   ② 第二螢幕：撳「🪟 開第二螢幕」→ 開一個新視窗，將佢拖去投影機或大電視度按全螢幕；
 *      自己部手機就做控制器（加分、倒數、抽籤），兩邊睇住同一份狀態。
 *
 * 三種內容：view（單頁大字）／deck（一頁一頁嘅圖文，教完一版撳下一版）／live（計分板、倒數等即時工具）。
 * 鍵盤：← → 或空白＝上一版／下一版，＋／－＝字大細，F＝全螢幕，Esc＝收埋。
 */
var Projector = {};

Projector.on = false;
Projector.mode = '';
Projector.title = '';
Projector.body = '';
Projector.slides = null;
Projector.si = 0;
Projector.liveKind = '';
Projector.tick = null;
Projector.scale = 1;
Projector.win = null;

/* 建立投屏 DOM（第一次用先建） */
Projector.boot = function(){
  if (typeof document === 'undefined') return null;
  if (document.getElementById('proj')) return document.getElementById('proj');
  var el = document.createElement('div');
  el.id = 'proj';
  el.className = 'hidden';
  el.innerHTML =
    '<div class="proj-bar">' +
      '<b class="proj-title"></b>' +
      '<span class="proj-nav">' +
        '<button class="pj-btn" onclick="Projector.step(-1)" aria-label="上一版">← 上一版</button>' +
        '<span class="pj-count"></span>' +
        '<button class="pj-btn" onclick="Projector.step(1)" aria-label="下一版">下一版 →</button>' +
      '</span>' +
      '<span class="proj-tools">' +
        '<button class="pj-btn" onclick="Projector.font(-1)" aria-label="字細啲">A－</button>' +
        '<button class="pj-btn" onclick="Projector.font(1)" aria-label="字大啲">A＋</button>' +
        '<button class="pj-btn" onclick="Projector.fullscreen()" aria-label="全螢幕">⛶</button>' +
        '<button class="pj-btn" onclick="Projector.secondScreen()" aria-label="開第二螢幕">🪟</button>' +
        '<button class="pj-btn close" onclick="Projector.close()" aria-label="收埋">✕</button>' +
      '</span>' +
    '</div>' +
    '<div class="proj-stage"></div>';
  document.body.appendChild(el);
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('keydown', function(e){
      if (!Projector.on) return;
      var k = e.key;
      if (k === 'Escape') { Projector.close(); }
      else if (k === 'ArrowRight' || k === ' ' || k === 'PageDown') { Projector.step(1); if(e.preventDefault) e.preventDefault(); }
      else if (k === 'ArrowLeft' || k === 'PageUp') { Projector.step(-1); if(e.preventDefault) e.preventDefault(); }
      else if (k === '+' || k === '=') { Projector.font(1); }
      else if (k === '-' || k === '_') { Projector.font(-1); }
      else if (k === 'f' || k === 'F') { Projector.fullscreen(); }
    });
  }
  return el;
};

/* 單頁大字（教一個動作、講一個程序用） */
Projector.show = function(title, html, opts){
  opts = opts || {};
  Projector.open('view', title, html, opts);
  return Projector;
};

/* 一頁一頁嘅圖文（教技能／講教案最常用） */
Projector.deck = function(title, slides, i){
  Projector.slides = slides || [];
  Projector.si = Math.max(0, Math.min((i||0), Projector.slides.length - 1));
  Projector.open('deck', title, '');
  return Projector;
};

/* 即時工具（計分板／倒數／抽籤／分組）：狀態一改，兩邊即刻同步 */
Projector.live = function(kind, title){
  Projector.liveKind = kind;
  Projector.open('live', title || '', '');
  return Projector;
};

Projector.slidesOf = function(bodyHtml){
  /* 將 HTML 拆成「一版一版」：每個 <h3>/<h4>／<figure>／<section> 做起點，畀唔出圖就用一版過 */
  var slides = [];
  if (typeof bodyHtml !== 'string' || !bodyHtml) return [{ h:'', body:'' }];
  var parts = bodyHtml.split(/(?=<h[34][ >])/);
  parts.forEach(function(p){
    if (!p.replace(/\s/g, '')) return;
    var m = p.match(/<h[34][^>]*>([\s\S]*?)<\/h[34]>/);
    var h = m ? m[1].replace(/<[^>]*>/g,'').trim() : '';
    slides.push({ h:h, body:p });
  });
  return slides.length ? slides : [{ h:'', body:bodyHtml }];
};

/* 由一版 HTML 開投屏：有 <h3> 分量就自動變 deck，否則單頁 */
Projector.html = function(title, html){
  var slides = Projector.slidesOf(html);
  if (slides.length > 1 && slides[0].body.length > 180) return Projector.deck(title, slides, 0);
  return Projector.show(title, html);
};

Projector.open = function(mode, title, body, opts){
  opts = opts || {};
  var el = Projector.boot();
  if (!el) return Projector;
  Projector.on = true; Projector.mode = mode; Projector.title = title || ''; Projector.body = body || '';
  Projector.liveKind = (mode === 'live') ? (opts.kind || Projector.liveKind) : '';
  el.classList.remove('hidden');
  el.classList.toggle('pj-live', mode === 'live');
  if (document.body && document.body.classList) document.body.classList.add('proj-on');
  if (mode === 'live' && !Projector.tick) {
    Projector.tick = setInterval(function(){ if (Projector.on && Projector.mode === 'live') Projector.render(); }, 1000);
  }
  if (mode !== 'live' && Projector.tick) { clearInterval(Projector.tick); Projector.tick = null; }
  Projector.render();
  Projector.fullscreenMaybe(opts.full !== false);
  return Projector;
};

Projector.fullscreenMaybe = function(want){
  /* 同機投屏：盡量自動全螢幕（瀏覽器唔畀都冇問題，畫面本身已經蓋晒） */
  if (!want || typeof document === 'undefined' || !document.documentElement) return;
  var d = document.documentElement;
  if (document.fullscreenElement || !d.requestFullscreen) return;
  try { var p = d.requestFullscreen(); if (p && p.catch) p.catch(function(){}); } catch(e){}
};

Projector.stage = function(){
  var el = document.getElementById('proj');
  return el ? el.querySelector('.proj-stage') : null;
};

Projector.current = function(){
  if (Projector.mode === 'deck') {
    var s = Projector.slides && Projector.slides[Projector.si];
    if (!s) return { h:'', body:'' };
    return { h:s.h, body:(s.h ? '<h3 class="pj-h">'+s.h+'</h3>' : '') + s.body };
  }
  if (Projector.mode === 'live') {
    return { h:'', body:(typeof App !== 'undefined' && App.projHtml) ? App.projHtml(Projector.liveKind) : '' };
  }
  return { h:'', body:Projector.body };
};

Projector.render = function(){
  if (!Projector.on) return;
  var el = document.getElementById('proj');
  if (!el) return;
  var t = el.querySelector('.proj-title');
  if (t) t.innerHTML = Projector.title;
  var stage = el.querySelector('.proj-stage');
  var cur = Projector.current();
  var html = '<div class="pj-page" style="font-size:'+Projector.scale+'em">'+cur.body+'</div>';
  if (stage) stage.innerHTML = html;
  var nav = el.querySelector('.proj-nav');
  if (nav) nav.style.display = (Projector.mode === 'deck' && Projector.slides && Projector.slides.length > 1) ? '' : 'none';
  var cnt = el.querySelector('.pj-count');
  if (cnt && Projector.slides) cnt.textContent = (Projector.si + 1) + ' / ' + Projector.slides.length;
  Projector.syncScreen();
};

Projector.step = function(d){
  if (Projector.mode !== 'deck' || !Projector.slides) return;
  var n = Projector.si + d;
  if (n < 0) n = 0;
  if (n > Projector.slides.length - 1) n = Projector.slides.length - 1;
  Projector.si = n;
  Projector.render();
};

Projector.font = function(d){
  Projector.scale = Math.max(0.6, Math.min(2.4, Projector.scale + d * 0.15));
  Projector.render();
};

Projector.fullscreen = function(){
  if (typeof document === 'undefined') return;
  var d = document.documentElement;
  if (!d) return;
  if (document.fullscreenElement) { if (document.exitFullscreen) document.exitFullscreen(); return; }
  if (d.requestFullscreen) { try { d.requestFullscreen(); } catch(e){} }
};

/* 第二螢幕：同源新視窗，內容由呢度推過去（唔使上網、唔使登入） */
Projector.secondScreen = function(){
  if (typeof window === 'undefined' || !window.open) return;
  var w = Projector.win;
  if (!w || w.closed) {
    w = window.open('', 'scout-hub-screen', 'width=1280,height=720');
    Projector.win = w;
  }
  if (!w) {
    if (typeof App !== 'undefined' && App.toast) App.toast('⚠️ 瀏覽器擋咗彈窗：請喺網址欄右邊准許彈出視窗，再撳一次 🪟');
    return;
  }
  try { w.focus(); } catch(e){}
  Projector.syncScreen(true);
};

Projector.syncScreen = function(force){
  var w = Projector.win;
  if (!w || w.closed) return;
  var cur = Projector.current();
  var cnt = (Projector.mode === 'deck' && Projector.slides) ? '<div class="sc-count">'+(Projector.si+1)+' / '+Projector.slides.length+'</div>' : '';
  var doc = '<!DOCTYPE html><html lang="zh-HK"><head><meta charset="utf-8"><title>🖥️ 投屏畫面</title><style>'
    + 'html,body{margin:0;height:100%;background:#0b1a12;color:#F1F8E9;font-family:-apple-system,"PingFang HK","Noto Sans HK",sans-serif;overflow:hidden}'
    + '.sc-bar{display:flex;justify-content:space-between;align-items:center;padding:10px 18px;background:#12321f;color:#A5D6A7;font-size:20px}'
    + '.sc-title{font-weight:700;color:#FFF}'
    + '.sc-body{padding:3vh 4vw;height:calc(100% - 50px);overflow:auto;font-size:'+(2.1*Projector.scale)+'vh;line-height:1.6}'
    + '.sc-body h3,.sc-body h4{color:#FFD54F;font-size:1.35em;margin:.4em 0}'
    + '.sc-body img{max-width:100%;max-height:62vh;display:block;margin:0 auto;border-radius:10px;background:#fff}'
    + '.sc-body ul,.sc-body ol{margin:.3em 0 .3em 1.2em}.sc-body li{margin:.25em 0}'
    + '.sc-body table{border-collapse:collapse;width:100%;font-size:.9em}.sc-body th,.sc-body td{border:1px solid #4E6B57;padding:6px 8px;text-align:left}'
    + '.sc-body .mut{color:#B0BEC5}.sc-body .pj-h{font-size:1.3em}'
    + '.sc-body button{display:none}   /* 第二螢幕只睇，唔撳：掣留喺領袖手機度 */'
    + '.sc-score{display:flex;gap:2vw;justify-content:center;flex-wrap:wrap}'
    + '.sc-score>div{background:#16371f;border-radius:14px;padding:1.6vh 2.4vw;text-align:center}'
    + '.sc-score b{display:block;font-size:3.4em;color:#FFD54F}'
    + '.sc-clock{text-align:center;font-size:22vh;font-weight:800;letter-spacing:.02em}'
    + '.sc-clock.done{color:#FF8A65}'
    + '</style></head><body>'
    + '<div class="sc-bar"><span class="sc-title">🧭 '+Projector.title+'</span><span>📱 由手機控制・唔使上網</span></div>'
    + '<div class="sc-body">'+cur.body+cnt+'</div>'
    + '</body></html>';
  try { w.document.open(); w.document.write(doc); w.document.close(); } catch(e){}
};

Projector.closeWin = function(){
  if (Projector.win && !Projector.win.closed) { try { Projector.win.close(); } catch(e){} }
  Projector.win = null;
};

Projector.close = function(){
  Projector.on = false;
  var el = typeof document !== 'undefined' ? document.getElementById('proj') : null;
  if (el) el.classList.add('hidden');
  if (typeof document !== 'undefined' && document.body && document.body.classList) document.body.classList.remove('proj-on');
  if (Projector.tick) { clearInterval(Projector.tick); Projector.tick = null; }
  if (typeof document !== 'undefined' && document.fullscreenElement && document.exitFullscreen) { try { document.exitFullscreen(); } catch(e){} }
};

if (typeof module !== 'undefined' && module.exports) module.exports = Projector;
