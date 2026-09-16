/* app.js — Scout Hub 核心：路由（支援分頁 sub）、tab 渲染、指邊印邊列印（v19） */
var App = {};

App.init = function(){
  App.renderFlow();
  window.addEventListener('hashchange', App.route);
  window.addEventListener('online', App.netState);
  window.addEventListener('offline', App.netState);
  App.netState();
  App.route();
};

App.netState = function(){
  var bar = document.getElementById('netbar');
  if(!bar) return;
  bar.style.display = navigator.onLine ? 'none' : 'block';
  document.querySelectorAll('a.external-link').forEach(function(a){
    a.style.opacity = navigator.onLine ? '1' : '0.5';
    a.style.pointerEvents = navigator.onLine ? '' : 'none';
  });
};

App.route = function(){
  var raw = location.hash.replace('#','') || 'plan';
  // 舊連結兼容：小隊 tab 已改為營火會；小隊制度/工具放入手冊
  if(raw==='patrol' || raw.indexOf('patrol/')===0){
    location.replace('#book/patrol');
    return;
  }
  var parts = raw.split('/');
  var tab = parts[0];
  var sub = null;
  try{ sub = parts[1] ? decodeURIComponent(parts[1]) : null; }catch(e){ sub = parts[1]||null; }
  var allowed = ['plan','ceremony','uniform','official','book','print','play','skills','badges','songs','search'];
  if(allowed.indexOf(tab)<0){ tab = 'plan'; sub=null; }
  document.querySelectorAll('#topnav a, #tabbar a').forEach(function(a){
    a.classList.toggle('active', a.getAttribute('data-tab')===tab);
  });
  if(tab==='official'){ location.href = EXTERNAL.officialPack; return; }
  var view = document.getElementById('view');
  view.innerHTML = '';
  var el;
  if(tab==='plan' && sub){
    el = App.renderMeeting(sub);
  } else if(tab==='search'){
    el = App.pages.search(sub);
  } else {
    var fn = App.pages[tab] || App.pages.plan;
    el = fn(sub);
  }
  if(el) view.appendChild(el);
  if(tab==='search'){ try{ App.searchGo(); }catch(e){} }
  App.projFab();
  window.scrollTo(0,0);
};

/* 浮動「🖥️ 投屏」掣：淨係有區塊嘅頁先出 */
App.projFab = function(){
  var b = document.getElementById('projfab');
  if (!b) return;
  var has = document.querySelectorAll('#view section.sec').length > 0;
  if (b.classList) b.classList.toggle('hidden', !has);
  else b.style.display = has ? '' : 'none';
};

/* 全站搜尋 */

App.renderFlow = function(){
  var fb = document.getElementById('flowbar');
  if(!fb) return;
  fb.innerHTML = '<small>🧭 選集會 → 印教材 → 執袋 → 設場 → 帶領</small>';
};

App.h = function(tag, cls, html){
  var el = document.createElement(tag);
  if(cls) el.className = cls;
  if(html!==undefined) el.innerHTML = html;
  return el;
};

App.searchOpen = function(){ location.hash = '#search'; };

/* ── 分頁 chip 導航（tab 內小分頁；每版最多 8 格，唔會擠成一條長龍）── */
App.SUBN_PER = 8;
App.subnav = function(tab, items, cur){
  cur = cur || (items[0] && items[0].k) || '';
  App._subnavItems = App._subnavItems || {};
  App._subnavItems[tab] = items;   /* 版本切換要用 */
  var per = App.SUBN_PER;
  var pages = Math.max(1, Math.ceil(items.length / per));
  var pi = 0, ci = 0;
  for (var i = 0; i < items.length; i++) { if ((items[i].k || '') === cur) { ci = i; pi = Math.floor(i / per); } }
  if (pi > pages - 1) pi = pages - 1;
  var from = pi * per, to = Math.min(items.length, from + per);

  var nav = App.h('nav','subnav');
  nav.setAttribute('aria-label','分頁導航');

  if (pages > 1) {
    var head = App.h('div','pg-row');
    head.innerHTML =
      '<button class="pg-btn" '+(pi===0?'disabled':'')+' onclick="App.subnavShift(\''+tab+'\','+(from-1)+')" aria-label="前一批分頁">‹ 前一批</button>'+
      '<span class="pg-of">第 '+(pi+1)+'／'+pages+' 批（共 '+items.length+' 頁）</span>'+
      '<button class="pg-btn" '+(pi>=pages-1?'disabled':'')+' onclick="App.subnavShift(\''+tab+'\','+to+')" aria-label="後一批分頁">後 '+Math.max(0,items.length-to)+' 個 ›</button>';
    nav.appendChild(head);
  }

  var row = App.h('div','subrow');
  items.slice(from, to).forEach(function(it){
    var on = (it.k || '') === cur;
    var a = App.h('a','subtab'+(on?' on':''),'<i>'+(it.ic||'📄')+'</i><b>'+it.n+'</b>');
    a.href = it.k ? '#'+tab+'/'+it.k : '#'+tab;
    row.appendChild(a);
  });
  nav.appendChild(row);
  return nav;
};
/* 版本切換＝跳去嗰版第一／最後一格（唔會出現「撳唔返」） */
App.subnavItems = function(tab){ return (App._subnavItems || {})[tab] || null; };
App.subnavShift = function(tab, idx){
  var items = App.subnavItems ? App.subnavItems(tab) : null;
  if (!items || !items.length) return;
  idx = Math.max(0, Math.min(idx, items.length - 1));
  var k = items[idx].k;
  location.hash = k ? '#'+tab+'/'+k : '#'+tab;
};

/* 集會目錄投屏：將目錄表 + 特別集會變成幾版大字 */
App.projPlan = function(title){
  if (typeof Projector === 'undefined') return;
  var slides = [];
  var tbl = document.querySelector('#view table.plan-table');
  if (tbl) slides.push({ h:'📅 全年集會', body: App.projBody(tbl) });
  var special = document.querySelector('#view ul.bullet');
  if (special) slides.push({ h:'🌟 特別集會／活動', body: App.projBody(special) });
  if (!slides.length) { App.toast('呢頁冇嘢可以投影'); return; }
  Projector.deck('🧭 '+(title||'集會目錄'), slides, 0);
};



/* 即時篩選 chip 行（同 🎮 活動 tab 嘅分類掣一樣：撳完即刻轉內容，唔跳頁唔轉版本） */
App.filterbar = function(items, cur, pick, root){
  var bar = App.h('div','filters fbar');
  bar.setAttribute('role','tablist');
  items.forEach(function(it){
    var b = App.h('button','filter-btn'+((it.k===cur)?' active':''), (it.ic?it.ic+' ':'')+it.n);
    b.setAttribute('data-k', it.k);
    b.setAttribute('role','tab');
    b.setAttribute('aria-selected', (it.k===cur)?'true':'false');
    b.onclick = function(){
      Array.prototype.forEach.call(bar.querySelectorAll('.filter-btn'), function(x){
        var on = (x===b);
        if (x.classList) x.classList.toggle('active', on);
        x.setAttribute('aria-selected', on?'true':'false');
      });
      if (root) App.showPane(root, it.k);
      pick(it.k);
    };
    bar.appendChild(b);
  });
  return bar;
};

/* 一頁幾版：撳掣換內容（唔係跳位） */
App.showPane = function(root, key){
  if (!root || !root.querySelectorAll) return;
  Array.prototype.forEach.call(root.querySelectorAll('.tabpane'), function(p){
    var on = p.getAttribute('data-pane') === key;
    p.setAttribute('role','tabpanel');
    p.setAttribute('aria-hidden', on?'false':'true');
    if (p.classList) p.classList.toggle('hidden', !on); else p.style.display = on ? '' : 'none';
  });
};
/* 版面分頁條：items＝[{k,ic,n}]；panes 容器內每個 .tabpane[data-pane=k] */
App.tabs = function(items, cur, root){
  return App.filterbar(items, cur, function(){}, root);
};

/* ══════════ 🖥️ 投屏（Projector，見 js/projector.js）══════════ */
/* 攞一段內容出嚟投影：抽走掣、輸入格、導航，只留睇得明嘅嘢 */
App.projBody = function(el){
  if (!el || !el.cloneNode) return '';
  var c = el.cloneNode(true);
  Array.prototype.forEach.call(c.querySelectorAll('.print-btn,.proj-btn,.no-print,button,input,textarea,.subnav,.chiprow,.filters,.cer-nav,.back-link'), function(n){
    if (n.parentNode) n.parentNode.removeChild(n);
  });
  Array.prototype.forEach.call(c.querySelectorAll('details'), function(d){ d.open = true; });
  return c.innerHTML;
};
App.projSec = function(secEl){
  if (typeof Projector === 'undefined' || !secEl) return;
  var body = secEl.querySelector('.sec-body') || secEl;
  var title = secEl.getAttribute('data-title') || (document.querySelector('#view h1') ? document.querySelector('#view h1').textContent : '投影');
  Projector.html(title, App.projBody(body));
};
/* 成頁投影：每個區塊變一版，撳「下一版」教下一步 */
App.projPage = function(title){
  if (typeof Projector === 'undefined') return;
  var slides = [];
  Array.prototype.forEach.call(document.querySelectorAll('#view section.sec'), function(s){
    var h = s.querySelector('.sec-head h2');
    var b = s.querySelector('.sec-body');
    if (!b) return;
    var body = App.projBody(b);
    if (!body.replace(/[\s\u200b]/g,'')) return;
    slides.push({ h: h ? h.innerHTML.replace(/<[^>]*>/g,'').replace(/🖨️.*/,'').trim() : '', body: body });
  });
  if (!slides.length) { App.toast('呢頁冇嘢可以投影'); return; }
  if (!title) {
    var h1 = document.querySelector('#view h1');
    title = h1 ? h1.textContent.trim() : '童軍團集會助手';
  }
  Projector.deck('🧭 '+title, slides, 0);
};
App.projOpen = function(){ return typeof Projector !== 'undefined' && Projector.on; };

/* ── 區塊：每節獨立「指邊印邊」── */
App.sec = function(title, opts){
  opts = opts || {};
  var s = App.h('section','sec');
  var secTitle = title.replace(/<[^>]*>/g,'').replace(/🖨️.*/,'').trim();
  if(opts.id) s.id = opts.id;
  s.setAttribute('data-title', secTitle);
  var head = App.h('div','sec-head');
  var h = App.h('h2', null, title);
  head.appendChild(h);
  var body = App.h('div','sec-body');
  if(opts.print !== false){
    var b = App.h('button','print-btn','🖨️ 印本節');
    b.setAttribute('aria-label','列印本節：'+secTitle);
    b.onclick = function(){ App.printSec(s); };
    head.appendChild(b);
  }
  if(opts.proj !== false){
    var p = App.h('button','proj-btn','🖥️ 投本節');
    p.setAttribute('aria-label','投屏本節：'+secTitle);
    p.onclick = function(){ App.projSec(s); };
    head.appendChild(p);
  }
  s.appendChild(head);
  s.appendChild(body);
  s._body = body;
  s.add = function(el){ body.appendChild(el); return s; };
  return s;
};
/* 一行過：標題＋HTML 內容（附本節列印） */
App.block = function(title, innerHTML, opts){
  var s = App.sec(title, opts);
  s._body.innerHTML = innerHTML;
  return s;
};

/* ── 🖨️ 指邊印邊：只複製目標區塊去列印區 ── */
/* 🖼️ 示意圖（v20）：優先 AVIF 插畫；無圖就退回平面圖解；圖 load 唔到（舊瀏覽器／缺檔）自動-show 平面圖解 */
App.ph = function(key, cap, svgHtml){
  var f = (typeof FIGS !== 'undefined' && FIGS) ? FIGS[key] : null;
  var svgAltHtml = svgHtml || '';
  if(!f) return svgAltHtml ? '<figure class="dgm-fig"><div class="dgm-wrap">'+svgAltHtml+'</div><figcaption>🖼️ '+(cap||'示意圖解')+'</figcaption></figure>' : '';
  var onerr = "var p=this.closest('.ph-fig');if(p){p.classList.add('imgfail');var d=p.querySelector('details');if(d)d.open=true;}";
  var img = '<div class="ph-wrap"><img src="'+f.src+'" width="'+(f.w||1000)+'" height="'+(f.h||750)+'" alt="'+(f.alt||'')+'" loading="lazy" decoding="async" onerror="'+onerr+'"></div>';
  var noteText = (f.note!==undefined) ? f.note : ((typeof FIGS_NOTE!=='undefined' && FIGS_NOTE) ? FIGS_NOTE : '');
  var note = noteText ? '<span class="ph-note">'+noteText+'</span>' : '';
  var credit = f.credit ? '<span class="ph-credit">📷 '+f.credit+(f.source?' · <a href="'+f.source+'" target="_blank" rel="noopener">來源</a>':'')+'</span>' : '';
  return '<figure class="ph-fig" data-fig="'+key+'">'+img+
    (cap?'<figcaption>🖼️ '+cap+note+credit+'</figcaption>':'')+
    '<div class="ph-fail">📷 呢張圖load唔到（舊瀏覽器唔支援 AVIF／檔案未落 cache）；用下面嘅平面圖解代替。</div>'+
    (svgAltHtml?'<details class="dgm-alt no-print"><summary>📐 平面／位置圖解（睇位用）</summary><div class="dgm-wrap">'+svgAltHtml+'</div></details>':'')+
    '</figure>';
};
/* 平面圖解：所有圖解由 js/dia.js 嘅 IMG.map 出（一律 <img src="img/dia/*.avif">，冇 SVG） */
App.dgmFigure = function(key, cap, cls){
  var html = (typeof IMG!=='undefined' && IMG.map[key]) ? IMG.html(key, cls) : '';
  if(!html) return '';
  return '<figure class="dgm-fig">'+html+'<figcaption>📐 '+(cap||IMG.alt(key))+'</figcaption></figure>';
};
/* 攞儀式卡嘅圖（cer-＋fig key），冇圖先退回平面圖解 */
App.cerFig = function(c){
  var dk = c.fig || c.dgm;
  var svgAlt = (dk && typeof DIAGRAMS!=='undefined' && DIAGRAMS.cer && DIAGRAMS.cer[dk]) ? DIAGRAMS.cer[dk] : '';
  if(!c.fig) return svgAlt ? '<figure class="dgm-fig"><div class="dgm-wrap">'+svgAlt+'</div><figcaption>📐 '+(c.figcap||'位置圖解')+'</figcaption></figure>' : '';
  return App.ph('cer-'+c.fig, c.figcap || '位置示意圖解', svgAlt);
};

/* 逐步圖解（照《步操手冊》分部動作；圖已轉 AVIF）；冇呢個 key 就乜都唔出 */
App.cerDgm = function(k, cap){
  var dk = (k && typeof DIAGRAMS!=='undefined' && DIAGRAMS.cer) ? DIAGRAMS.cer[k] : '';
  if(!dk) return '';
  return '<details class="dgm-fold"><summary>📐 分部動作圖解（'+(cap||k)+'）</summary>'
    + '<figure class="dgm-fig"><div class="dgm-wrap">'+dk+'</div><figcaption>📐 '+(cap||'分部動作圖解')
    + '・角度／距離已照手冊標示，可對住示範</figcaption></figure></details>';
};

App.printSec = function(el){
  if(!el || typeof document==='undefined' || !document.body) return;
  var doc = document;
  var box = doc.getElementById('printzone');
  if(!box){ box = doc.createElement('div'); box.id='printzone'; doc.body.appendChild(box); }
  box.innerHTML = '';
  var clone;
  try { clone = el.cloneNode(true); } catch(e){ return; }
  if(clone.querySelectorAll){
    Array.prototype.forEach.call(clone.querySelectorAll('.print-btn,.subnav,.chiprow,.no-print,button,input[type=checkbox]'), function(n){
      if(n.parentNode) n.parentNode.removeChild(n);
    });
    Array.prototype.forEach.call(clone.querySelectorAll('details'), function(d){ d.open = true; });
  }
  var head = doc.createElement('div');
  head.className = 'pz-head';
  head.innerHTML = '🧭 童軍團集會助手 Scout Hub ｜ 列印範圍：'+(el.getAttribute ? (el.getAttribute('data-title')||'本節') : '本節')+' ｜ 旅團：＿＿＿＿＿＿　小隊：＿＿＿＿　日期：＿＿＿＿年＿＿月＿＿日';
  box.appendChild(head);
  box.appendChild(clone);
  var foot = doc.createElement('div');
  foot.className='pz-foot';
  foot.innerHTML = '<small>由 Scout Hub 產生・內容以《童軍訓練綱要》及總會最新通告為準</small>';
  box.appendChild(foot);
  doc.body.classList.add('print-one');
  var done = function(){
    doc.body.classList.remove('print-one');
    if(window.removeEventListener) window.removeEventListener('afterprint', done);
  };
  if(window.addEventListener) window.addEventListener('afterprint', done);
  setTimeout(done, 20000);
  window.print();
};
App.printPage = function(){ window.print(); };

/* ══════════ 搜尋 ══════════ */
App.searchIndex = null;
App.buildSearchIndex = function(){
  if(App.searchIndex) return App.searchIndex;
  var idx = [];
  DATA.meetings.forEach(function(m){
    var mt = m.tid+' '+m.n+' '+(m.badge||'')+' '+(m.goal||'')+' '+((m.data&&m.data.goal)||'');
    if(m.data && Object.prototype.toString.call(m.data.program)==='[object Array]'){
      mt += ' ' + m.data.program.map(function(p){ return (p&&(p.t||p.n))||''; }).join(' ');
    }
    if(m.data && m.data.worksheet && m.data.worksheet.title){ mt += ' ' + m.data.worksheet.title; }
    idx.push({type:'集會', title:m.tid+' '+m.n, link:'#plan/'+m.tid, desc:m.badge||'', text:mt.toLowerCase()});
  });
  DATA.games.forEach(function(g){
    var gHasPh = (typeof GAME_FIG!=='undefined' && typeof FIGS!=='undefined' && g.n in GAME_FIG && !!FIGS[GAME_FIG[g.n]]);
    idx.push({type:'遊戲', title:g.n, link:'#play', desc:g.cat+' · '+g.minutes+'分鐘'+(gHasPh?'（附實景示意圖＋場地圖）':'（附場地圖）'),
      text:(g.n+' '+g.cat+' '+g.desc+' '+g.mats).toLowerCase()});
  });
  INTERESTS.badges.forEach(function(b){
    idx.push({type:'興趣章', title:b.zh+'（'+b.en+'）', link:'#badges', desc:'官方要求',
      text:(b.zh+' '+b.en+' '+b.k+' '+(b.req||[]).join(' ')).toLowerCase()});
  });
  var skills = [
    {t:'繩結（10 個・文字口訣）', k:'繩結 平結 八字結 雙套結 半結 反手結 稱人結 接繩結 繫木結 縮繩結 曳木結 bowline 打結 c13 c14', l:'#skills/rope'},
    {t:'收繩與繩索保養（附圖）', k:'收繩 保養 繩索 圈繞 陰乾 報廢 圖', l:'#skills/care'},
    {t:'地圖與指南針（附圖）', k:'地圖 指南針 比例尺 圖例 方位 compass 定向 紅針 北 等高線 圖', l:'#skills/map'},
    {t:'執背囊（附圖）', k:'背囊 執包 行山袋 防水 分層 圖', l:'#skills/pack'},
    {t:'營藝：帳篷／爐具／刀具（附圖）', k:'營藝 紮營 帳篷 氣爐 小刀 斧頭 手鋸 安全圈 3米 圖', l:'#skills/camp'},
    {t:'先鋒工程入門（附圖）', k:'先鋒工程 紮作 十字紮 剪立紮 平行紮 天幕 三腳架 圖', l:'#skills/pioneer'},
    {t:'追蹤符號（附圖）', k:'追蹤符號 追蹤 箭嘴 記號 tracking 符號 圖', l:'#skills/track'},
    {t:'郊野守則＋求助信號（附圖）', k:'郊野守則 Leave No Trace 山火 天氣 撤退 哨子 SOS 迷路 環保 999 三短三長 圖', l:'#skills/field'},
    {t:'急救 8 種（每種有圖）', k:'急救 流鼻血 抽筋 燒傷 燙傷 扭傷 割傷 刺傷 復原臥式 RICE first aid 沖脫泡蓋送 急救卡 圖', l:'#skills/aid'}
  ];
  skills.forEach(function(sk){
    idx.push({type:'技能', title:sk.t, link:sk.l, desc:'技能卡（附圖解）', text:(sk.t+' '+sk.k).toLowerCase()});
  });
  CEREMONY.cards.forEach(function(c){
    idx.push({type:'儀式', title:c.icon+' '+c.n, link:'#ceremony/'+c.k, desc:(c.fig?((typeof FIGS!=='undefined'&&FIGS['cer-'+c.fig])?'附示意插畫＋位置圖解':'附位置圖解'):'文字程序'),
      text:('儀式 '+c.n+' 升旗 宣誓 步操 敬禮 隊列 點名 降旗 團呼 開始 結束 '+ (c.steps||[]).map(function(s){return s.h+' '+s.d;}).join(' ')).toLowerCase()});
  });
  idx.push({type:'制服', title:'制服佩戴（陸／海／空小分頁）＋自查清單', link:'#uniform', desc:'', text:'制服 領巾 徽章 佩戴 恤衫 褲 帽 皮帶 襪 鞋 儀容 海童軍 空童軍 陸童軍'});
  idx.push({type:'制服', title:'🧣 領巾・巾圈・領帶（4 色）・皮帶皮鞋襪', link:'#uniform/acc', desc:'按手冊 3.4–3.6', text:'領巾 巾圈 領帶 顏色巾圈 童軍巾圈 小隊活動巾圈 基維爾巾圈 基維爾領巾 木章 皮帶 皮鞋 長襪 襪帶 捲巾 3.5cm 12至15cm windsor 棗紅 深綠 黑 深藍 配件 對照'});
  idx.push({type:'制服', title:'🎖️ 徽章佩戴位置圖（胸袋上下層＋衫袖＋專章帶）', link:'#uniform/badge', desc:'附位置圖', text:'徽章 佩戴 位置 圖 胸袋 袋蓋 3cm 肩帶 專章帶 小隊章 旅章 區章 地域章 香港章 服務年星 進度性獎章 會員章 圖解'});
  idx.push({type:'手冊', title:'誓詞規律銘言＋小隊制度＋報班', link:'#book', desc:'', text:'誓詞 規律 銘言 準備 報章 報班 訓練班 考章'});
  idx.push({type:'手冊', title:'小隊制度＋小隊長職責＋會議記錄表', link:'#book/patrol', desc:'已併入手冊', text:'小隊 小隊長 制度 會議記錄 團隊長 副小隊長'});
  idx.push({type:'手冊', title:'集會工具（計分板・抽籤・倒數・分組・投屏）', link:'#book/tools', desc:'可投屏', text:'計分板 抽籤 倒數 分組 工具 投屏 小隊數 投影 大電視'});
  idx.push({type:'素材', title:'工作紙（24 場直接印）＋急救卡（8 張連圖）＋營火會歌紙', link:'#print', desc:'可印可投屏', text:'工作紙 列印 素材 急救卡 家長通知 歌紙 誓詞卡 投屏'});
  idx.push({type:'營火會', title:'🇨🇳 國歌《義勇軍進行曲》＋升旗禮儀', link:'#print', desc:'素材庫', text:'國歌 義勇軍進行曲 升旗 禮儀 唱國歌'});
  (typeof SONGS!=='undefined' ? SONGS.sheets : []).forEach(function(s){
    idx.push({type:'營火會', title:'🔥 '+s.zh+(s.en?'（'+s.en+'）':''), link:'#songs/'+s.k, desc:s.cat,
      text:(s.zh+' '+(s.en||'')+' 營火會 營火歌 唱歌 歌紙 歌詞 香港 '+s.cat+' '+(s.lines||[]).map(function(l){return l[1];}).join(' ')).toLowerCase()});
  });
  if(typeof SONGS!=='undefined'){
    idx.push({type:'營火會', title:'90 分鐘時間表＋三段氣氛', link:'#songs/flow', desc:'流程', text:'營火會 營火 時間表 程序 熱身 高潮 寧靜結尾 90分鐘'});
    idx.push({type:'營火會', title:'歡呼／吶喊＋小隊歡呼創作', link:'#songs/cheers', desc:'歡呼', text:'營火會 歡呼 吶喊 bravo 童子軍食雲吞 香港童軍好精神 小隊歡呼'});
    idx.push({type:'營火會', title:'工作人員＋點火頌詞＋設備', link:'#songs/staff', desc:'人手設備', text:'營火會 人手 工作人員 領唱 歡呼領袖 設備管理員 點火 頌詞 柴火 水 沙 電筒'});
    idx.push({type:'營火會', title:'冇樂器帶唱＋領唱 5 招', link:'#songs/lead', desc:'帶唱', text:'營火會 領唱 帶唱 冇樂器 手勢 快歌 慢歌 唱歌環節'});
    idx.push({type:'營火會', title:'安全底線＋營火章必識歌', link:'#songs/safety', desc:'安全考章', text:'營火會 安全 營火章 熊熊烈火 campfire burning kookaburra 友誼之光 必識'});
  }
  App.searchIndex = idx;
  return idx;
};
App.searchGo = function(){
  var input = document.getElementById('q-input');
  var out = document.getElementById('q-out');
  if(!input||!out) return;
  var q = (input.value||'').trim().toLowerCase();
  if(!q){ out.innerHTML = '<p class="mut">輸入關鍵字即時搵：24 場集會＋遊戲＋興趣章＋技能＋儀式＋營火會。</p>'; return; }
  var keys = q.split(/\s+/);
  var res = App.buildSearchIndex().filter(function(e){
    return keys.every(function(k){ return e.text.indexOf(k)>=0; });
  }).slice(0,30);
  if(!res.length){ out.innerHTML = '<p>😅 冇結果，試吓：儀式 / 急救 / 露營 / 地圖 / 歌 / 小隊。</p>'; return; }
  out.innerHTML = '<p>🔍 搵到 '+res.length+' 項：</p><ul class="bullet">'+res.map(function(e){
    return '<li><span class="tag">'+e.type+'</span> <a href="'+e.link+'">'+e.title+'</a>'+(e.desc?' <small>（'+e.desc+'）</small>':'')+'</li>';
  }).join('')+'</ul>';
};

/* ══════════ 教案詳情（跟住做就帶到） ══════════ */
App.renderMeeting = function(tid){
  var m = DATA.meetings.find(function(x){return x.tid===tid;});
  if(!m) return App.pages.plan();
  var wrap = App.h('div','page meeting-page');
  var secList = [];                 /* 每節 section 嘅次序（分頁用） */
  var _add = wrap.appendChild;
  wrap.appendChild = function(node){
    if (node && node.tagName && String(node.tagName).toLowerCase() === 'section') secList.push(node);
    return _add.call(wrap, node);
  };
  var back = App.h('a','back-link','← 返回集會目錄');
  back.href = '#plan';
  wrap.appendChild(back);
  wrap.appendChild(App.h('h1',null,'📅 '+m.tid+' '+m.n));
  var meta = App.h('div','meeting-meta');
  meta.innerHTML = '<span class="tag ok">'+m.month+'</span>'+
    '<span class="tag cat">'+m.form+'</span>'+
    '<span class="tag">'+(m.duration||90)+'分鐘</span>'+
    '<span class="tag">'+m.badge+'</span>'+
    '<button class="print-all-btn" onclick="App.printPage()">🖨️ 整場教案全部列印</button>'+
    (m.full ? '<span class="tag ok">✓ 完整教案</span>' : '<span class="tag wip">內容陸續補上</span>');
  wrap.appendChild(meta);
  wrap.appendChild(App.h('p','lede','📍 場地：'+m.venue+'<br>🎯 目標：'+m.goal+(m.evidence?'<br>👀 觀察：'+m.evidence:'')+(m.gap?'<br>⚠️ 注意：'+m.gap:'')));

  if(m.data){
    var d = m.data;

    if(m.sensitive){
      var warn = App.h('div','card safety-warn');
      warn.innerHTML = '⚠️ <b>本集會包含敏感議題（保護自己／防止兒童侵害）。</b><br>'+
        '・必須最少 2 位領袖在場（兩人規則）<br>'+
        '・<b>唔要求成員分享個人經歷</b>，所有情境均為虛構<br>'+
        '・如隊員情緒有反應，即由另一位領袖陪同離場安撫，事後按《青少年保護政策》跟進<br>'+
        '・家長通知務必派發，俾家長知悉今日課題';
      wrap.appendChild(warn);
    }
    if(m.outdoor){
      var outdoorWarn = App.h('div','card safety-warn outdoor-warn');
      outdoorWarn.innerHTML = '🥾 <b>室外郊野活動特別提醒</b><br>'+
        '・所有參加者<b>必須交回家長簽署同意書</b><br>'+
        '・必須檢查鞋、水、帽、雨具、個人藥物<br>'+
        '・最少 1:6 領袖比例，含 1 位持有效急救證書<br>'+
        '・預先實地視察路線、預備撤退路線<br>'+
        '・三號風球/紅雨/黑雨/雷暴/酷熱警告自動延期';
      wrap.appendChild(outdoorWarn);
    }

    // 快速跳去節位 chips
    var anchors = [];
    if(d.leaderPrep) anchors.push({id:tid+'-prep',ic:'📌',n:'領袖預備'});
    if(d.script) anchors.push({id:tid+'-script',ic:'🎤',n:'開場白'});
    anchors.push({id:tid+'-program',ic:'📋',n:'9段程序'});
    anchors.push({id:tid+'-bag',ic:'🎒',n:'執袋'});
    if(m.personalKit) anchors.push({id:tid+'-kit',ic:'👕',n:'個人裝備'});
    anchors.push({id:tid+'-notice',ic:'📝',n:'家長通知'});
    if(d.worksheet) anchors.push({id:tid+'-ws',ic:'✂️',n:'工作紙'});
    if(d.pledgeCard) anchors.push({id:tid+'-pledge',ic:'💌',n:'承諾卡'});
    if(d.roles) anchors.push({id:tid+'-roles',ic:'👥',n:'崗位'});
    if(d.items) anchors.push({id:tid+'-items',ic:'🎖️',n:'物品'});
    if(d.observation) anchors.push({id:tid+'-obs',ic:'👀',n:'觀察'});
    if(d.postCeremony) anchors.push({id:tid+'-post',ic:'📬',n:'禮成跟進'});
    anchors.push({id:tid+'-back',ic:'🆘',n:'後備'});
    if(d.scenarios) anchors.push({id:tid+'-sc',ic:'🃏',n:'情境卡'});
    if(d.trivia) anchors.push({id:tid+'-tr',ic:'💡',n:'小知識'});
    anchors.push({id:tid+'-safety',ic:'⚠️',n:'安全'});
    var tabHost = App.h('div','tabhost');   /* 分頁條：撳掣即換版 */
    wrap.appendChild(tabHost);

    // 領袖預備
    if(d.leaderPrep){
      var lp = App.h('ul','bullet');
      lp.innerHTML = d.leaderPrep.map(function(x){
        if(typeof x === 'string') return '<li>'+x+'</li>';
        return '<li><b>'+x.when+'：</b>'+x.what+'</li>';
      }).join('');
      var sPrep = App.sec('📌 領袖預備備忘',{id:tid+'-prep'});
      sPrep.add(lp);
      wrap.appendChild(sPrep);
    }

    // 領袖開場白
    if(d.script){
      var sc = App.h('div','card script-card');
      var scHtml = '';
      Object.keys(d.script).forEach(function(k){
        scHtml += '<p><b>'+({open:'開場',intro:'介紹今日流程',beforeGame:'遊戲前',beforeDrill:'隊列前',close:'結束'}[k]||k)+'：</b>'+d.script[k]+'</p>';
      });
      sc.innerHTML = scHtml;
      var sSc = App.sec('🎤 領袖開場白',{id:tid+'-script'});
      sSc.add(sc);
      wrap.appendChild(sSc);
    }

    // 9 段程序表
    var tbl = App.h('table','meeting-table program-table');
    tbl.innerHTML = '<thead><tr><th width="40">序</th><th width="50">分鐘</th><th width="80">項目</th><th>內容／帶領要點</th></tr></thead><tbody>';
    d.program.forEach(function(p,idx){
      var detail = '';
      var isNew = (typeof p.n === 'string');
      var mins = isNew ? p.t : p.min;
      var title = isNew ? p.n : p.label;
      var type = isNew ? '' : (p.type||'');
      var steps = p.steps || p.sub || [];
      if(steps.length) detail += '<ul class="bullet">'+steps.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ul>';
      if(p.leader){
        if(typeof p.leader === 'string'){
          detail += '<p><b>領袖：</b>'+p.leader+'</p>';
        } else {
          var ldr = [];
          if(p.leader.leader) ldr.push('<b>領袖：</b>'+p.leader.leader);
          if(p.leader.patrol) ldr.push('<b>小隊長：</b>'+p.leader.patrol);
          if(ldr.length) detail += '<p>'+ldr.join(' ｜ ')+'</p>';
        }
      }
      if(p.leaderScript){
        detail += '<div class="callout" style="background:#FFF8E1;border-left:4px solid #F9A825;margin:6px 0;"><b>🎤 講稿：</b>'+p.leaderScript+'</div>';
      }
      if(p.activities){
        detail += '<p><b>活動：</b>'+p.activities.map(function(a){return DATA.games.find(function(g){return g.n===a.name;})?('<a href="#play">'+a.name+'</a>（'+a.min+'分鐘）'):a.name+'（'+a.min+'分鐘）';}).join(' → ')+'</p>';
      }
      if(p.talking) detail += '<p><b>小隊長傾乜：</b></p><ul class="bullet">'+p.talking.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ul>';
      if(p.blocks) detail += p.blocks.map(function(b){return '<p><b>'+b.h+'</b>：'+b.d+(b.cite?' <small style="color:#888">'+b.cite+'</small>':'')+'</p>';}).join('');
      if(p.tip) detail += '<p class="tip">💡 '+p.tip+'</p>';
      if(p.key) detail += '<p><b>重點：</b>'+p.key+'</p>';
      if(p.safety) detail += '<p class="safety"><b>⚠️ 安全：</b>'+p.safety+'</p>';
      // 儀式段落加圖解連結（解決「淨睇文字唔明」）
      if(/儀式|升旗|隊列|宣誓|步操|敬禮|團呼/.test(title||'')){
        var ck = /團呼/.test(title)?'howl':(/升旗/.test(title)?'flag':(/宣誓/.test(title)?'oath':(/隊列|步操|立正|稍息/.test(title)?'footdrill':(/結束/.test(title)?'close':'open'))));
        detail += '<p class="figlink">🎪 呢段有儀式：睇 <a href="#ceremony/'+ck+'">儀式卡圖解版</a>（隊列/升旗/宣誓都有位置圖）</p>';
      }
      var mats = '';
      if(p.mats && p.mats.length) mats = '<br><small>🎒 '+p.mats.join('、')+'</small>';
      else if(p.materials) mats = '<br><small>🎒 '+p.materials+'</small>';
      tbl.innerHTML += '<tr><td data-label="序">'+(idx+1)+'</td><td data-label="分鐘">'+(mins||'')+'</td><td data-label="項目">'+type+(type?'<br>':'')+'<small>'+title+'</small></td><td data-label="帶領要點">'+detail+mats+'</td></tr>';
    });
    tbl.innerHTML += '</tbody>';
    var sProg = App.sec('📋 '+(m.duration||90)+' 分鐘 9 段程序表',{id:tid+'-program'});
    sProg.add(tbl);
    wrap.appendChild(sProg);

    // 物資清單（領袖執袋）
    var bt = App.h('table','meeting-table');
    bt.innerHTML = '<thead><tr><th>物品</th><th>數量</th><th>性質</th><th>備註</th></tr></thead><tbody>'+
      d.bag.map(function(x){return '<tr><td>'+x.n+'</td><td>'+(typeof x.qty==='number'?x.qty:x.qty)+'</td><td>'+x.type+'</td><td>'+(x.note||'')+'</td></tr>';}).join('')+
      '</tbody>';
    var sBag = App.sec('🎒 執袋清單（領袖/共用物資）',{id:tid+'-bag'});
    sBag.add(bt);
    wrap.appendChild(sBag);

    // 個人裝備（室外特別集會）
    if(m.personalKit){
      var pk = App.h('div','card');
      pk.innerHTML = '<h3>✅ 一定要帶</h3><ul class="bullet">'+m.personalKit.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
      if(m.doNotBring){
        pk.innerHTML += '<h3>🚫 唔好帶</h3><ul class="bullet">'+m.doNotBring.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
      }
      var sPk = App.sec('👕 個人裝備清單（通知家長/成員）',{id:tid+'-kit'});
      sPk.add(pk);
      wrap.appendChild(sPk);
    }

    // 家長通知
    var nc = App.h('div','card notice-card');
    if(typeof d.notice === 'string'){
      nc.innerHTML = '<pre style="white-space:pre-wrap;font-family:inherit;margin:0;">'+d.notice+'</pre>';
    } else {
      nc.innerHTML = '<h3>'+(d.notice.title||'家長通知')+'</h3><ul class="bullet">'+(d.notice.items||[]).map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
    }
    var sNotice = App.sec('📝 家長通知（列印派發）',{id:tid+'-notice'});
    sNotice.add(nc);
    wrap.appendChild(sNotice);

    // 工作紙
    if(d.worksheet){
      var wsAudience = (d.worksheet.audience==='leader')?'領袖檢查清單':'工作紙（成員用，A4）';
      var sWs = App.sec('✂️ '+wsAudience,{id:tid+'-ws'});
      sWs._body.innerHTML = App.worksheetHtml(d.worksheet);
      wrap.appendChild(sWs);
    }

    // 承諾卡
    if(d.pledgeCard){
      var pc = App.h('div','card pledge-card');
      pc.innerHTML = '<h3>'+d.pledgeCard.title+'</h3>'+
        '<div class="pledge-body"><ul class="bullet">'+d.pledgeCard.fields.map(function(f){return '<li>'+f+'</li>';}).join('')+'</ul></div>';
      var sPc = App.sec('💌 承諾卡（每位宣誓成員 1 張，自己保存）',{id:tid+'-pledge'});
      sPc.add(pc);
      wrap.appendChild(sPc);
    }

    // 崗位分工
    if(d.roles){
      var rl = App.h('table','meeting-table');
      rl.innerHTML = '<thead><tr><th>崗位</th><th>人數</th><th>人選</th><th>職責</th></tr></thead><tbody>'+
        d.roles.map(function(r){
          var qty = (r.qty!==undefined)?r.qty:'';
          var duty = r.duties || r.duty || '';
          var person = r.person || '__________';
          return '<tr><td>'+r.role+'</td><td>'+qty+'</td><td>'+person+'</td><td>'+duty+'</td></tr>';
        }).join('')+
        '</tbody>';
      var sRoles = App.sec('👥 當日崗位分工',{id:tid+'-roles'});
      sRoles.add(rl);
      wrap.appendChild(sRoles);
    }

    // 頒發物品清單
    if(d.items){
      var it = App.h('ul','bullet');
      it.innerHTML = d.items.map(function(x){
        var who = x.to ? '（俾 '+x.to+'，'+x.qty+'）' : '';
        var desc = x.d || '';
        return '<li><b>'+x.n+'</b>'+who+(desc?' — '+desc:'')+'</li>';
      }).join('');
      var sIt = App.sec('🎖️ 當日頒發/派發物品',{id:tid+'-items'});
      sIt.add(it);
      wrap.appendChild(sIt);
    }

    // 觀察記錄
    if(d.observation){
      var isObsObj = !Array.isArray(d.observation);
      var obTitle = (isObsObj && d.observation.audience==='leader')?'✅ 領袖事後檢查清單':'👀 領袖觀察記錄（領袖用）';
      var ob = App.h('div','card');
      var obsItems = isObsObj ? d.observation.items : d.observation;
      var obsTitle = isObsObj ? '<h3>'+d.observation.title+'</h3>' : '';
      ob.innerHTML = obsTitle +
        '<ul class="bullet">'+obsItems.map(function(x){return '<li><label><input type="checkbox"> '+x+'</label></li>';}).join('')+'</ul>';
      var sOb = App.sec(obTitle,{id:tid+'-obs'});
      sOb.add(ob);
      wrap.appendChild(sOb);
    }

    // 禮成後跟進
    if(d.postCeremony){
      var pst = App.h('div','card');
      pst.innerHTML = '<ul class="bullet">'+d.postCeremony.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
      var sPost = App.sec('📬 禮成後跟進',{id:tid+'-post'});
      sPost.add(pst);
      wrap.appendChild(sPost);
    }

    // 實戰後備
    var pb = App.h('div','card');
    if(Array.isArray(d.practical)){
      pb.innerHTML = d.practical.map(function(x){return '<p><b>'+x.situation+'：</b>'+x.action+'</p>';}).join('');
    } else {
      var pkeys = {fewPeople:'少人（6-8 人）',lackMat:'缺物資',notEngaged:'不投入',thirtyMinEnd:'要提早 30 分鐘收尾',emotionalSupport:'如有隊員情緒反應',weatherBad:'天氣不好/落雨',techFail:'音響/投影失靈',late:'嘉賓/家長遲到',absentee:'有隊員缺席'};
      var phtml = '';
      Object.keys(pkeys).forEach(function(k){
        if(d.practical[k]) phtml += '<p><b>'+pkeys[k]+'：</b>'+d.practical[k]+'</p>';
      });
      phtml += '<p><b>成員可能問：</b></p><ul class="bullet">'+(d.practical.qa||[]).map(function(q){return '<li><b>Q：'+q.q+'</b><br>A：'+q.a+'</li>';}).join('')+'</ul>';
      pb.innerHTML = phtml;
    }
    var sPb = App.sec('🆘 實戰後備',{id:tid+'-back'});
    sPb.add(pb);
    wrap.appendChild(sPb);

    // 情境卡
    if(d.scenarios){
      var scd = App.h('div','card');
      scd.innerHTML = '<ol class="steps">'+d.scenarios.map(function(s){return '<li><b>情境：</b>'+s.s+'<br><b>處理：</b>'+s.a+'</li>';}).join('')+'</ol>';
      var sSc = App.sec('🃏 情境卡（領袖口頭講，每隊討論）',{id:tid+'-sc'});
      sSc.add(scd);
      wrap.appendChild(sSc);
    }

    // 小知識
    if(d.trivia){
      var tv = App.h('div','card');
      tv.innerHTML = d.trivia.map(function(t){
        var head = t.h || t.q || '';
        var body = t.d || t.a || '';
        return '<p><b>'+head+'：</b>'+body+'</p>';
      }).join('');
      var sTv = App.sec('💡 補充小知識',{id:tid+'-tr'});
      sTv.add(tv);
      wrap.appendChild(sTv);
    }

    // 安全
    var sf = App.h('ul','bullet');
    sf.innerHTML = (d.safety||[]).map(function(s){ return '<li>'+s+'</li>'; }).join('');
    var sSf = App.sec('⚠️ 安全注意',{id:tid+'-safety'});
    sSf.add(sf);
    wrap.appendChild(sSf);

    /* ── 分頁：每一節一個掣，撳掣即換版（唔再係跳位）── */
    (function(){
      var secs = secList;
      if (secs.length < 2) { if (tabHost.parentNode) tabHost.parentNode.removeChild(tabHost); return; }
      var items = [];
      secs.forEach(function(sec, i){
        var k = sec.id || ('sec'+i);
        var a = null;
        anchors.forEach(function(x){ if (x.id === k) a = x; });
        items.push({ k:k, ic:(a && a.ic) || '📄', n:(a && a.n) || sec.getAttribute('data-title') || ('第 '+(i+1)+' 節') });
      });
      secs.forEach(function(sec, i){
        var pane = App.h('div','tabpane'+(i===0?'':' hidden'));
        pane.setAttribute('data-pane', items[i].k);
        if (sec.parentNode && sec.parentNode.removeChild) sec.parentNode.removeChild(sec);
        pane.appendChild(sec);
        wrap.appendChild(pane);
      });
      tabHost.appendChild(App.filterbar(items, items[0].k, function(){}, wrap));
    })();

    return wrap;
  }

  wrap.appendChild(App.h('h2',null,'🚧 本場完整教案籌備中'));
  wrap.appendChild(App.h('p',null,'本場（'+m.n+'）完整三步帶法、工作紙、出隊包將會喺後續版本補上。現階段可參考頂欄 📦 官方套包 PDF 相關程序。'));
  return wrap;
};

/* 工作紙 HTML（教案頁同素材庫共用同一份內容） */
App.worksheetHtml = function(w){
  var html = '<div class="card worksheet"><h3>'+w.title+'</h3>';
  if(w.fields){
    html += '<ul class="bullet">'+w.fields.map(function(f,i){
      var lab = f.label || f.name || ('第 '+(i+1)+' 項');
      var ty = f.type || 'text';
      var h = ty==='textarea' ? '<textarea rows="3" style="width:100%;margin-top:4px;"></textarea>' : '<input type="text" style="width:60%;margin-top:4px;">';
      return '<li><b>'+lab+'</b> '+h+'</li>';
    }).join('')+'</ul>';
    if(w.footer) html += '<p class="tip">'+w.footer+'</p>';
  } else if(w.prompts){
    html += '<ol class="steps">'+w.prompts.map(function(p){return '<li>'+p+'</li>';}).join('')+'</ol>';
  }
  html += '<div class="ws-sign">姓名：＿＿＿＿＿＿　旅團：＿＿＿＿＿＿　日期：＿＿＿＿　小隊長核對：□</div></div>';
  return html;
};

/* ══════════ 各分頁 render ══════════ */
App.pages = {};

App.pages.search = function(sub){
  var wrap = App.h('div','page');
  wrap.appendChild(App.h('h1',null,'🔍 全站搜尋'));
  var q0 = '';
  try{ q0 = sub?decodeURIComponent(sub):''; }catch(e){ q0 = sub||''; }
  var box = App.h('div','card');
  box.innerHTML = '<label class="search-field" for="q-input"><span>🔍 關鍵字</span><input id="q-input" type="search" inputmode="search" autocomplete="off" placeholder="例：儀式 / 急救 / 背囊 / 營火會…" value="'+q0.replace(/"/g,'&quot;')+'" oninput="App.searchGo()"></label>'+
    '<p>熱門：<a href="#search/儀式">儀式</a> · <a href="#search/急救">急救</a> · <a href="#search/背囊">背囊</a> · <a href="#search/地圖">地圖</a> · <a href="#search/營火會">營火會</a> · <a href="#search/小隊">小隊</a></p>'+
    '<div id="q-out"><p class="mut">輸入關鍵字即時搵，全站 24 場集會＋遊戲＋興趣章＋技能＋儀式＋歌都搵到。</p></div>';
  wrap.appendChild(box);
  return wrap;
};

/* 📅 集會目錄（整行可撳） */
App.pages.plan = function(){
  var wrap = App.h('div','page plan-page');
  wrap.appendChild(App.h('h1',null,'📅 集會目錄'));
  var guide = App.h('div','role-guide');
  guide.innerHTML = '<div><span class="role-ic">🧭</span><p><b>第一次帶集會</b><br>先揀一場，再由「領袖預備」逐頁做到「安全注意」。</p></div>'+
    '<div><span class="role-ic">⚡</span><p><b>熟手即場搵料</b><br>用畫面下方「素材庫／活動／技能／興趣章／營火會」。</p></div>';
  wrap.appendChild(guide);
  wrap.appendChild(App.h('p','lede','24 場完整集會：會員章 6 場、探索 12 場、標準／總結 6 場。撳任何一張就開教案。'));

  var filterItems = [
    {k:'all',n:'全部 24 場'}, {k:'member',n:'會員章 c01–06'},
    {k:'explore',n:'探索 c07–18'}, {k:'standard',n:'標準／總結 c19–24'},
    {k:'special',n:'特別集會'}
  ];
  var filter = App.h('div','plan-filter filters');
  filter.setAttribute('aria-label','篩選集會');
  var result = App.h('p','plan-result','顯示 24 場');

  var table = App.h('table','meeting-table plan-table');
  table.innerHTML = '<thead><tr><th>場次／月份</th><th>主題／對應獎章</th><th>形式</th><th>狀態</th><th><span class="sr-only">開啟</span></th></tr></thead><tbody>' +
    DATA.meetings.map(function(m,idx){
      var tag = m.placeholder ? '<span class="tag wip">🚧 規劃中</span>' : (m.full ? '<span class="tag ok">✓ 完整</span>' : '<span class="tag wip">🚧</span>');
      var spec = m.special ? '<span class="tag sp">特別</span>' : '';
      var stage = idx<6 ? 'member' : (idx<18 ? 'explore' : 'standard');
      var groups = stage+(m.special?' special':'');
      return '<tr class="meet-row" data-groups="'+groups+'" data-href="#plan/'+m.tid+'" tabindex="0" role="link" aria-label="開啟 '+m.tid+' '+m.n+'">'+
        '<td class="plan-id"><b>'+m.tid+'</b><small>'+m.month+'</small></td>'+
        '<td class="plan-topic"><b>'+m.n+'</b><small>🎖️ '+m.badge+'</small></td>'+
        '<td class="plan-form">'+m.form+spec+'</td><td class="plan-status">'+tag+'</td><td class="row-go" aria-hidden="true">▶</td></tr>';
    }).join('') + '</tbody>';

  filterItems.forEach(function(it,i){
    var btn = App.h('button','filter-btn'+(i===0?' active':''),it.n);
    btn.setAttribute('aria-pressed',i===0?'true':'false');
    btn.onclick = function(){
      Array.prototype.forEach.call(filter.querySelectorAll('.filter-btn'),function(x){
        x.classList.remove('active'); x.setAttribute('aria-pressed','false');
      });
      btn.classList.add('active'); btn.setAttribute('aria-pressed','true');
      var shown = 0;
      Array.prototype.forEach.call(table.querySelectorAll('tr.meet-row'),function(tr){
        var on = it.k==='all' || (' '+tr.getAttribute('data-groups')+' ').indexOf(' '+it.k+' ')>=0;
        tr.classList.toggle('hidden',!on); if(on) shown++;
      });
      result.textContent = '顯示 '+shown+' 場';
    };
    filter.appendChild(btn);
  });
  wrap.appendChild(filter);
  wrap.appendChild(result);
  if(table.querySelectorAll){
    Array.prototype.forEach.call(table.querySelectorAll('tr.meet-row'), function(tr){
      tr.onclick = function(){ location.hash = tr.getAttribute('data-href'); };
      tr.onkeydown = function(e){ if(e && (e.key==='Enter'||e.key===' ')){ if(e.preventDefault)e.preventDefault(); location.hash = tr.getAttribute('data-href'); } };
    });
  }
  wrap.appendChild(table);
  var planProj = App.h('p','plan-project');
  planProj.innerHTML = '<button class="proj-big" onclick="App.projPlan(\'年度集會目錄\')">🖥️ 投年度表</button>';
  wrap.appendChild(planProj);
  wrap.appendChild(App.h('h2',null,'🌟 特別集會／活動'));
  var ul = App.h('ul','bullet');
  ul.innerHTML = DATA.specialEvents.map(function(e){
    return '<li><b>'+e.n+'</b>（'+e.month+'）— '+e.note+'</li>';
  }).join('');
  wrap.appendChild(ul);
  return wrap;
};

/* 🎪 集會儀式（小分頁＋圖解） */
App.pages.ceremony = function(sub){
  var wrap = App.h('div','page');
  wrap.appendChild(App.h('h1',null,'🎪 集會儀式'));
  var subs = [{k:'all',ic:'📚',n:'總覽'}].concat(CEREMONY.cards.map(function(c){return {k:c.k,ic:c.icon,n:c.n.replace(/（.*?）/g,'')};}));
  wrap.appendChild(App.subnav('ceremony',subs, (sub && sub!=='all')?sub:'all'));

  if(sub && sub!=='all'){
    var c0 = CEREMONY.cards.find(function(c){return c.k===sub;});
    if(c0){
      var idx = CEREMONY.cards.indexOf(c0);
      var bar = App.h('div','cer-nav');
      var prev = CEREMONY.cards[idx-1], next = CEREMONY.cards[idx+1];
      bar.innerHTML = '<a class="back-link" href="#ceremony">← 儀式總覽</a>'+
        (prev?'<a class="cer-prev" href="#ceremony/'+prev.k+'">← '+prev.icon+' '+prev.n.replace(/（.*?）/g,'')+'</a>':'')+
        (next?'<a class="cer-next" href="#ceremony/'+next.k+'">'+next.icon+' '+next.n.replace(/（.*?）/g,'')+' →</a>':'');
      wrap.appendChild(bar);
      wrap.appendChild(App.ceremonySec(c0, true));
      return wrap;
    }
  }

  wrap.appendChild(App.h('p','lede','呢度淨係<strong>會員章＋日常集會</strong>用得到嘅儀式：開禮・禮成・集合／解散・立正／稍息（童軍動作）・敬禮・升旗・宣誓・團呼・基本整隊。<b>深嘅步操唔喺呢度教</b> —— 原地四轉、行進間轉向／換步、口令與動令時間表、旗手十二式、會操檢閱程序全部屬訓練班範圍：請上職前／進階訓練班，並人手一份《步操手冊》（香港童軍總會 2003 年 7 月第二版）照住做。實際動作必須由熟悉程序之領袖現場示範。'));
  var ref = App.h('div','callout');
  ref.innerHTML = '📚 <b>參考文件：</b>（要教進階步操／帶會操，請用呢啲檔＋上訓練班，唔好靠記憶）<ul class="bullet" style="margin:6px 0 0 18px;">' +
    CEREMONY.refs.map(function(r){return '<li><a href="'+r.url+'" target="_blank" rel="noopener">'+r.n+'</a></li>';}).join('') +
    '</ul>';
  wrap.appendChild(ref);
  CEREMONY.cards.forEach(function(c){
    wrap.appendChild(App.ceremonySec(c, false));
  });
  return wrap;
};

/* 一張儀式卡（含圖解）；full=true 完整顯示連列印，否則摘要＋連結 */
App.ceremonySec = function(c, full){
  var s = App.sec(c.icon+' '+c.n+(c.duration?' <span class="tag">'+c.duration+'</span>':''), {id:'cer-'+c.k, print: full?true:false});
  var body = '';
  body += c.when ? '<p><b>時機：</b>'+c.when+'</p>' : '';
  if(c.rel && c.rel.length){
    body += '<p><b>邊場會用：</b>'+c.rel.map(function(t){return '<a href="#plan/'+t+'">'+t+'</a>';}).join('、')+'</p>';
  }
  if(c.prep) body += '<p><b>預備物資：</b>'+c.prep+'</p>';
  if(c.intro) body += '<p><b>動作要點：</b>'+c.intro+'</p>';
  var pendingNote = '<div class="callout">⚠️ 呢套程序仍待官方核對，暫時只有文字＋參考文件連結；帶之前請先問熟悉程序之領袖。</div>';
  if(c.fig || c.dgm){
    body += App.cerFig(c);
    /* 有圖但內容仍未核（例如團呼嘅隊形圖）— 照樣要提醒 */
    if(c.pending && !full) body += pendingNote;
  } else if(!full){
    body += pendingNote;
  }
  if(c.steps) body += '<ol class="steps">'+c.steps.map(function(st){return '<li><b>'+st.h+'</b>：'+st.d+(st.dgm?App.cerDgm(st.dgm, st.dgmc||st.h):'')+'</li>';}).join('')+'</ol>';
  if(c.types) body += '<ul class="bullet">'+c.types.map(function(t){return '<li><b>'+t.t+'：</b>'+t.d+(t.dgm?App.cerDgm(t.dgm, t.dgmc||t.t):'')+'</li>';}).join('')+'</ul>';
  if(c.when_to_salute) body += '<p><b>使用場合：</b></p><ul class="bullet">'+c.when_to_salute.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
  if(c.safety) body += '<p class="safety"><b>⚠️ 注意：</b>'+c.safety+'</p>';
  if(c.note) body += '<div class="callout warn">'+c.note+'</div>';
  var link = full ? '' : '<p class="cer-open"><a href="#ceremony/'+c.k+'">睇完整程序＋圖解 →</a></p>';
  s._body.innerHTML = body + link;
  return s;
};

/* 👕 制服（陸／海／空小分頁） */
App.pages.uniform = function(sub){
  var wrap = App.h('div','page');
  wrap.appendChild(App.h('h1',null,'👕 制服'));
  var subs = UNIFORM.branches.map(function(b){return {k:b.k,ic:b.ic,n:b.n};})
    .concat([{k:'badge',ic:'🎖️',n:'徽章佩戴'},{k:'acc',ic:'🧣',n:'領巾領帶'},{k:'check',ic:'✅',n:'自查清單'}]);
  var cur = 'land';
  subs.forEach(function(x){ if(x.k===sub) cur = sub; });
  wrap.appendChild(App.subnav('uniform',subs,cur));
  wrap.appendChild(App.h('p','lede','童軍支部（陸）、海童軍、空童軍男／女團員制服標準。服式圖：<b>香港童軍總會</b>官方圖（本地存檔，離線都睇得到），可以另開官網原圖對最新式樣；內容以《儀容與制服手冊》為準。'));

  var byKey = {};
  UNIFORM.types.forEach(function(t){ byKey[t.k]=t; });
  var BRANCH = {scout_b:'land',scout_g:'land',sea_b:'sea',sea_g:'sea',air_b:'air',air_g:'air'};
  function typeCard(t){
    var rows = t.items.map(function(i){return '<tr><th>'+i[0]+'</th><td>'+i[1]+'</td></tr>';}).join('');
    var br = BRANCH[t.k] || 'land';
    var uni = (typeof UNIFORMFIG!=='undefined' && UNIFORMFIG) ? UNIFORMFIG[br] : null;
    var figHtml = '';
    if(uni){
      /* 主圖：官方服式圖（本地 AVIF，離線都睇得到）；load 唔到先連返總會官網原圖 */
      figHtml = '<figure class="uniform-fig"><img src="'+uni.src+'" width="'+uni.w+'" height="'+uni.h+'" alt="'+t.name+'：'+uni.alt+'" loading="lazy" decoding="async"'
        + ' onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src=\''+t.img+'\';}else{var f=this.closest(\'.uniform-fig\');if(f)f.classList.add(\'imgfail\');}">'
        + '<figcaption>'+t.name+'官方服式圖（'+uni.branch+'男／女團員）｜實物以<a href="'+UNIFORM.shop.url+'" target="_blank" rel="noopener">童軍物品供應社</a>及《儀容與制服手冊》為準</figcaption></figure>';
    }
    var bu = (typeof DIAGRAMS!=='undefined' && DIAGRAMS.uniform) ? DIAGRAMS.uniform : {};
    var bfig = bu.branch ? '<div class="svg-steps"><figure>'+bu.branch+
      '<figcaption>顏色配搭對照圖（離線都睇得到）：陸／海／空三種制服嘅帽、恤衫、短褲／裙褲同長襪顏色，逐項並排比較（'+t.name+'睇自己一支）</figcaption></figure></div>' : '';
    return '<div class="card uniform-card"><h3>'+t.name+'</h3>'+figHtml+bfig+
      '<div class="uniform-split">'+
        '<div class="uniform-visual no-print"><a href="'+t.img+'" target="_blank" rel="noopener">🖼️ 開總會官網原圖（對最新式樣）</a>'+
        '<small class="mut">本地圖係總會官網同一張，離線都睇得到。</small></div>'+
        '<table class="uniform-table"><tbody>'+rows+'</tbody></table>'+
      '</div></div>';
  }

  if(cur==='badge'){
    var P = UNIFORM.placement;
    wrap.appendChild(App.h('p','lede','徽章位置表：按《儀容與制服手冊》4.6／4.7。圖上 ①–⑨ 對返下面各行；同一位置上下可以疊幾層。手冊本身有局部放大插圖，下面兩張放大圖就係照住嗰啲位置畫，方便對位同列印。'));
    var CIR = ['','①','②','③','④','⑤','⑥','⑦','⑧','⑨'];
    function pTable(rows){
      return '<table class="meeting-table"><thead><tr><th width="46">圖上</th><th>位置</th><th>擺咩章</th></tr></thead><tbody>'+
        rows.map(function(r){
          return '<tr><td class="pt-num">'+(CIR[r.n]||r.n)+'</td><td><b>'+r.side+'</b>'+(r.note?'<br><small class="mut">'+r.note+'</small>':'')+
            '</td><td>'+r.items.map(function(x){return '・'+x;}).join('<br>')+'</td></tr>';
        }).join('')+'</tbody></table>';
    }
    wrap.appendChild(App.block('🎖️ 胸袋上下層點排（圖上 ①–⑥）',
      '<div class="svg-steps"><figure>'+DIAGRAMS.uniform.chest+
      '<figcaption>恤衫正面：袋蓋上方 3cm＝上層、袋蓋上方＝下層、袋中央＝進度性獎章（圖只示位置，唔畫徽章樣式）</figcaption></figure></div>'
      + pTable(P.chest), {id:'uni-chest'}));
    wrap.appendChild(App.block('🔍 局部放大：最易擺錯嘅兩處（左胸袋・右袖肩膊）',
      '<div class="svg-steps"><figure>'+DIAGRAMS.uniform.zoom+
      '<figcaption>左：左胸袋——袋蓋上方 3cm 同袋中央係兩個唔同高度；右：右袖——旅章喺肩膊位下方 2cm，地域章（前）→ 區章（後）相距 1cm</figcaption></figure></div>'
      +'<div class="callout">📖 對唔到就照《儀容與制服手冊》本身嘅放大插圖：'
      +'<a href="'+UNIFORM.source.url+'" target="_blank" rel="noopener">第三章「制服配件」</a>、'
      +'<a href="'+UNIFORM.source.badgeGuide+'" target="_blank" rel="noopener">支部成員徽章佩戴指引 PDF</a>（官方圖最準）。</div>', {id:'uni-zoom'}));

    wrap.appendChild(App.block('🎖️ 全身位置：衫袖・肩帶（圖上 ⑦–⑨）',
      '<div class="svg-steps"><figure>'+DIAGRAMS.uniform.body+
      '<figcaption>正面位置：右袖由上至下（小隊章 3cm 起）・左袖（AYP／拯溺）・專章帶由左肩斜落右腰；旅巾着喺肩帶外面</figcaption></figure></div>'
      +'<div class="svg-steps"><figure>'+DIAGRAMS.uniform.sleeve+
      '<figcaption>右袖放大（圖上 ①–⑤）：① 旅章／香港肩章＝肩膊位下方 2cm；② 總部／地域／區章＝再落 2cm，地域前區後相距 1cm；③ 環境／社區參與／維護自然世界章；④ 優異旅團章（佩戴一年）；⑤ 童軍小隊章＝袖口縫線上方 3cm。左袖鏡像相同（AYP 上、拯溺下）</figcaption></figure></div>'
      + pTable(P.body), {id:'uni-body'}));
    wrap.appendChild(App.h('div','callout','📚 出處：'+P.source+'。本 app 服務童軍支部（11–15 歲）：深資／樂行先有嘅章（急救章、深資／樂行肩章、ATAS 標誌）只作對照，未夠資格唔使理。<br>原文（連官方插圖）：<a href="'+UNIFORM.source.url+'" target="_blank" rel="noopener">《儀容與制服手冊》</a>｜<a href="'+UNIFORM.source.badgeGuide+'" target="_blank" rel="noopener">支部成員徽章佩戴指引（2023 年第 13 號通告）PDF</a>'));
    wrap.appendChild(App.h('p','tip','💡 集會前逐個章對位檢查。'));
    return wrap;
  }
  if(cur==='acc'){
    var NW = UNIFORM.neckwear, KW = UNIFORM.kilwell, BS = UNIFORM.beltSocks;
    var bd = (typeof DIAGRAMS!=='undefined' && DIAGRAMS.uniform) ? DIAGRAMS.uniform : {};
    wrap.appendChild(App.h('p','lede','領巾・巾圈・領帶：按《儀容與制服手冊》3.4–3.6。宣誓後才可佩戴；童軍支部一般戴領巾，領帶部分屬深資／樂行／成年成員，列出嚟方便對照。'));
    wrap.appendChild(App.block('🔑 四條通則',
      '<div class="card"><ul class="bullet">'+NW.rules.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>'));
    wrap.appendChild(App.block('🧣 領巾 4 種（邊個戴）',
      '<div class="card"><ul class="bullet">'+NW.scarves.map(function(x){return '<li><b>'+x.n+'</b>：'+x.d+'</li>';}).join('')+'</ul></div>'));
    wrap.appendChild(App.block('🔘 巾圈 4 種',
      '<div class="card"><ul class="bullet">'+NW.rings.map(function(x){return '<li><b>'+x.n+'</b>：'+x.who+'</li>';}).join('')+'</ul>'
      +'<p class="mut">'+NW.ringsOther+'</p></div>'));
    wrap.appendChild(App.block('🧣 領巾點戴（捲巾 8 步＋規格）',
      '<div class="svg-steps"><figure>'+(bd.scarf||'')+
      '<figcaption>捲巾直徑約 3.5cm、底至尖 12–15cm；巾圈套喺衣領尖，巾尾唔可超越皮帶扣</figcaption></figure></div>'
      +'<div class="card"><ol class="steps">'+NW.wear.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol></div>'));
    wrap.appendChild(App.block('👔 領帶 4 色＋佩戴',
      '<div class="svg-steps"><figure>'+(bd.ties||'')+
      '<figcaption>棗紅（深資）・深綠（樂行＋成年）・黑（海童軍）・深藍（空童軍）</figcaption></figure></div>'
      +'<div class="card"><ul class="bullet">'+NW.ties.map(function(x){return '<li><b>'+x.n+'</b>：'+x.who+'</li>';}).join('')+'</ul>'
      +'<ol class="steps">'+NW.tieWear.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol></div>'));
    wrap.appendChild(App.block('🪵 基維爾巾圈・基維爾領巾・木章（成年成員對照）',
      '<div class="svg-steps"><figure>'+(bd.kilwell||'')+
      '<figcaption>木章皮繩位置：領巾／領帶制服掛喺前面，禮服藏翻領內只露木珠</figcaption></figure></div>'
      +'<div class="card"><ul class="bullet">'+KW.points.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>'
      +'<p class="mut">'+KW.note+'</p>'
      +'<ul class="bullet">'+KW.wear.map(function(x){return '<li><b>'+x.t+'</b>：'+x.d+'</li>';}).join('')+'</ul></div>'));
    wrap.appendChild(App.block('👖 皮帶・皮鞋・襪',
      '<div class="card"><ul class="bullet">'+BS.items.map(function(x){return '<li><b>'+x.n+'</b>：'+x.d+'</li>';}).join('')+'</ul></div>'));
    var CP = UNIFORM.cap;
    wrap.appendChild(App.block('🧢 制服帽佩戴（帽章・帽邊・髮式）',
      '<div class="svg-steps"><figure>'+(bd.cap||'')+
      '<figcaption>帽章＝軟帽左眼處上方 2cm；帽邊＝眼眉上方約 2cm（約一隻手指闊）；帽帶尾套入帽後端黑色膠邊內</figcaption></figure></div>'
      +'<div class="card"><ul class="bullet">'+CP.points.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>'
      +'<p class="mut">'+CP.hard+'</p>'
      +'<p class="mut">'+CP.sea+'</p></div>'
      +'<div class="card"><h4>髮式（戴帽期間）</h4><ul class="bullet">'
      +CP.hair.map(function(x){return '<li><b>'+x.t+'</b>：'+x.d+'</li>';}).join('')+'</ul></div>'));
    wrap.appendChild(App.h('div','callout','🛒 <b>'+UNIFORM.shop.name+'</b>：'+UNIFORM.shop.addr+'｜電話 '+UNIFORM.shop.tel+'｜<a href="'+UNIFORM.shop.url+'" target="_blank" rel="noopener">hkscoutshop.org.hk</a><br>'+UNIFORM.shop.rule+'<br>'+UNIFORM.shop.rest));
    wrap.appendChild(App.h('div','callout','📚 出處：'+NW.source+'；'+BS.source+'；'+UNIFORM.cap.source+'。原文（連官方插圖）：<a href="'+UNIFORM.source.url+'" target="_blank" rel="noopener">《儀容與制服手冊》</a>'));
    return wrap;
  }
  if(cur==='check'){
    var cl = '<ul class="bullet">'+UNIFORM.checklist.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>'+
      '<p><i>'+UNIFORM.winter.note+'</i></p>'+
      '<p class="source-note">🖼️ '+UNIFORM.source.note+'</p>'+
      '<div class="callout">📚 <a href="'+UNIFORM.source.url+'" target="_blank" rel="noopener">儀容與制服手冊（官方網站）</a>｜🛒 <a href="'+UNIFORM.shop.url+'" target="_blank" rel="noopener">'+UNIFORM.shop.name+'</a>（'+UNIFORM.shop.tel+'）</div>'+
      '<p class="mut">'+UNIFORM.shop.rest+'</p>';
    wrap.appendChild(App.block('🧣 旅巾點綁（巾圈・巾尾長度）',
      '<div class="svg-steps"><figure>'+DIAGRAMS.uniform.scarf+
      '<figcaption>捲巾直徑約 3.5cm、底至尖 12–15cm；巾圈收喺衣領尖，巾尾喺肚臍附近、唔可以超越皮帶扣</figcaption></figure></div>'));
    wrap.appendChild(App.block('✅ 制服自查清單（每次集會前）', cl));
    return wrap;
  }
  var br = UNIFORM.branches.find(function(b){return b.k===cur;}) || UNIFORM.branches[0];
  wrap.appendChild(App.h('div','callout','<b>'+br.ic+' '+br.n+'制服要點：</b>'+br.note));
  br.types.forEach(function(tk){ wrap.appendChild(App.h('div','', typeCard(byKey[tk]))); });
  wrap.appendChild(App.h('div','callout','🧣 三組共通：旅巾＋巾圈、徽章佩戴位置、領巾領帶規格、集會前自查清單。<br>🛒 制服同配件一律以 <a href="'+UNIFORM.shop.url+'" target="_blank" rel="noopener">'+UNIFORM.shop.name+'</a> 供應者為標準（手冊 3.1）；3.7 制服毛衣同 3.8 附加配件唔喺 app 詳列，有需要到供應社查詢。'));
  return wrap;
};

/* 📖 手冊（小分頁：誓詞／小隊制度／工具／報章／報班／參考） */
App.pages.book = function(sub){
  var wrap = App.h('div','page');
  wrap.appendChild(App.h('h1',null,'📖 手冊'));
  var subs = [
    {k:'promise',ic:'⚜️',n:'誓詞規律銘言'},
    {k:'patrol',ic:'🧑‍🤝‍🧑',n:'小隊制度'},
    {k:'tools',ic:'🧰',n:'集會工具'},
    {k:'apply',ic:'🎖️',n:'報考專科徽章'},
    {k:'course',ic:'📚',n:'報考訓練班'},
    {k:'refs',ic:'🔗',n:'參考資料'}
  ];
  var cur = subs.some(function(s){return s.k===sub;}) ? sub : 'promise';
  wrap.appendChild(App.subnav('book',subs,cur));

  if(cur==='promise'){
    var ol = App.h('ol','promise');
    ol.innerHTML = DATA.facts.promise.map(function(l){ return '<li>'+l+'</li>'; }).join('');
    wrap.appendChild(App.sec('⚜️ 童軍誓詞').add(ol));
    var ul1 = App.h('ul','bullet');
    ul1.innerHTML = DATA.facts.law.map(function(l){ return '<li>'+l+'</li>'; }).join('');
    wrap.appendChild(App.sec('📜 童軍規律（7 條）').add(ul1));
    var ul2 = App.h('ul','motto');
    ul2.innerHTML = DATA.facts.motto7.map(function(l){ return '<li>'+l+'</li>'; }).join('');
    wrap.appendChild(App.sec('🎯 童軍銘言').add(ul2));
    wrap.appendChild(App.block('🏕️ 支部基本資料',
      '<p>年齡：'+DATA.facts.age+'</p><p>教育目標：'+DATA.facts.goal+'</p><p>敬禮：'+DATA.facts.salute+'</p>'));
    return wrap;
  }

  if(cur==='patrol'){
      wrap.appendChild(App.block('📋 小隊制度說明',
      '<p>'+DATA.facts.patrol+'</p>'+
      '<ul class="bullet"><li><b>小隊長</b>：管一隊，帶人帶會帶頭（c19）。</li>'+
      '<li><b>副小隊長</b>：小隊長唔喺度就頂上；平時管記錄/物資/新隊員。</li>'+
      '<li><b>團隊長</b>：最資深小隊長，幫團長管晒所有小隊長。</li>'+
      '<li><b>小隊長會議</b>：安排團活動、內部管理及經費——c19 教開會程序。</li></ul>'));
    wrap.appendChild(App.block('⭐ 小隊長 3 大職責',
      '<ol class="steps"><li><b>帶人</b>——分工、鼓勵、頂硬上。</li><li><b>帶會</b>——主持小隊會議（7 步程序，c19）。</li><li><b>帶頭</b>——自己做到先叫人做。</li></ol>'+
      '<p>記住：人哋跟你唔係因為你惡，係因為你值得跟。</p>'));
    wrap.appendChild(App.block('📝 小隊會議記錄表（可列印）',
      '<table class="meeting-table"><tbody>'+
      '<tr><th width="90">日期</th><td>______年____月____日</td><th width="90">主席</th><td>__________</td></tr>'+
      '<tr><th>記錄</th><td>__________</td><th>出席</th><td>____ / ____ 人</td></tr>'+
      '<tr><th>議題一</th><td colspan="3">____________________<br>決議：____________________</td></tr>'+
      '<tr><th>議題二</th><td colspan="3">____________________<br>決議：____________________</td></tr>'+
      '<tr><th>分工</th><td colspan="3">邊個：__________ 做咩：__________ 幾時完成：__________</td></tr>'+
      '<tr><th>下次開會</th><td colspan="3">______年____月____日</td></tr>'+
      '</tbody></table>'));
    wrap.appendChild(App.h('p','tip','📣 歡呼庫：<a href="#songs">🔥 營火會</a>。'));
    return wrap;
  }

  if(cur==='tools'){
    wrap.appendChild(App.toolsSecs());
    return wrap;
  }

  if(cur==='apply'){
    wrap.appendChild(App.h('div','callout ok-callout','🏕️ '+INTERESTS.howToApply.troopNote));
    var ol3 = App.h('ol','steps');
    ol3.innerHTML = INTERESTS.howToApply.steps.map(function(s){
      return '<li><b>'+s.t+'</b>：'+s.d+'</li>';
    }).join('');
    wrap.appendChild(App.sec('🎖️ 如何報考專科徽章（興趣組：團內考核）').add(ol3));
    wrap.appendChild(App.h('p','source-note',INTERESTS.howToApply.otherGroupsNote));
    return wrap;
  }

  if(cur==='course'){
    var ol4 = App.h('ol','steps');
    ol4.innerHTML = INTERESTS.howToApply.courseApply.steps.map(function(s){
      return '<li><b>'+s.t+'</b>：'+s.d+'</li>';
    }).join('');
    wrap.appendChild(App.sec('📚 如何報考訓練班（訂閱通告圖書館）').add(ol4));
    return wrap;
  }

  var ul3 = App.h('ul','bullet');
  ul3.innerHTML = '<li><a href="'+DATA.source.url+'" target="_blank" rel="noopener">《童軍訓練綱要》網上版（童軍支部）</a></li>'+
    '<li><a href="'+EXTERNAL.officialPack+'" target="_blank" rel="noopener">官方集會套包 2026-09-01 版 PDF</a></li>'+
    '<li><a href="'+EXTERNAL.badge+'" target="_blank" rel="noopener">童軍進度追蹤（外部 APP）</a></li>'+
    '<li><a href="'+EXTERNAL.circulars+'" target="_blank" rel="noopener">通告圖書館</a></li>'+
    '<li><a href="'+EXTERNAL.district+'" target="_blank" rel="noopener">區總部報章系統（只係部分專科徽章報名用；興趣組由團長團內考核，唔使入）</a></li>';
  wrap.appendChild(App.sec('🔗 參考資料').add(ul3));
  return wrap;
};

/* ✂️ 素材庫：即搵即印／即投屏 */
App.printCat = '';
App.printCats = [
  {k:'ws',   ic:'📝', n:'工作紙（24 場）'},
  {k:'aid',  ic:'🩹', n:'急救卡（8 張）'},
  {k:'text', ic:'⚜️', n:'誓詞規律銘言'},
  {k:'rope', ic:'🧵', n:'收繩保養'},
  {k:'flag', ic:'🇨🇳', n:'國歌升旗'},
  {k:'song', ic:'🔥', n:'營火會歌紙'}
];
App.pages.print = function(){
  var wrap = App.h('div','page');
  wrap.appendChild(App.h('h1',null,'✂️ 素材庫'));
  var cats = App.printCats;
  if (!App.printCat || !cats.some(function(c){return c.k===App.printCat;})) App.printCat = cats[0].k;
  var host = App.h('div','print-host');
  function draw(){
    host.innerHTML = '';
    host.appendChild(App.printPanel(App.printCat));
  }
  wrap.appendChild(App.filterbar(cats, App.printCat, function(k){
    App.printCat = k;
    wrap.querySelectorAll('.fbar .filter-btn').forEach(function(b,i){ b.classList.toggle('active', cats[i].k===k); });
    draw();
  }));
  draw();
  wrap.appendChild(host);
  return wrap;
};

/* 素材庫每一類嘅內容 */
App.printPanel = function(cat){
  var box = App.h('div','');
  if (cat === 'ws') {
    var wsHtml = '<p class="mut">同集會目錄每場教案用嘅係同一份工作紙。</p>';
    [{k:'會員章 c01–c06', from:0, to:6},{k:'探索 c07–c12', from:6, to:12},
     {k:'探索 c13–c18', from:12, to:18},{k:'標準／總結 c19–c24', from:18, to:24}].forEach(function(g){
      var list = DATA.meetings.slice(g.from,g.to).filter(function(m){return m.full&&m.data&&m.data.worksheet;});
      if (!list.length) return;
      wsHtml += '<h3 class="ws-group">'+g.k+'</h3>';
      list.forEach(function(m){
        var aud = m.data.worksheet.audience==='leader' ? '（領袖用）' : '（成員用 A4）';
        wsHtml += '<div class="ws-item" data-title="'+m.tid+' 工作紙">'
          + '<div class="ws-head"><b>'+m.tid+aud+'</b><span class="mut"> '+m.n+'</span> '
          + '<a class="mut ws-goto" href="#plan/'+m.tid+'">睇完整教案 ↗</a>'
          + '<button class="print-btn" onclick="App.printSec(this.closest(\'div.ws-item\'))">🖨️ 只印呢張</button>'
          + '<button class="proj-btn" onclick="App.projSec(this.closest(\'div.ws-item\'))">🖥️ 投呢張</button></div>'
          + App.worksheetHtml(m.data.worksheet)
          + '</div>';
      });
    });
    box.appendChild(App.block('📝 工作紙（逐張印／逐張投）', wsHtml, {print:false,proj:false}));
    return box;
  }

  if (cat === 'aid') {
    var html = '<p class="mut">8 張卡：7 種常見受傷＋復原臥式。每張都有圖，可以印出嚟貼喺急救箱／壁報，或者投屏一齊睇。</p>';
    C17.firstaid.forEach(function(f){
      html += '<div class="aid-wrap" data-title="急救卡 '+f.n+'">'+App.aidCard(f.n, f.how, f.warn)
        + '<p class="aid-ops"><button class="print-btn" onclick="App.printSec(this.closest(\'div.aid-wrap\'))">🖨️ 只印呢張</button>'
        + '<button class="proj-btn" onclick="App.projSec(this.closest(\'div.aid-wrap\'))">🖥️ 投呢張</button></p></div>';
    });
    var faint = App.aidCard('復原臥式','唔醒但有呼吸：側臥，頭微向下、上膝屈前、上手放前面，防嘔吐物鯁親；轉身前後都要睇呼吸','呼吸唔正常即打 999；跟有急救證書嘅領袖做');
    html += '<div class="aid-wrap" data-title="急救卡 復原臥式">'+faint
      + '<p class="aid-ops"><button class="print-btn" onclick="App.printSec(this.closest(\'div.aid-wrap\'))">🖨️ 只印呢張</button>'
      + '<button class="proj-btn" onclick="App.projSec(this.closest(\'div.aid-wrap\'))">🖥️ 投呢張</button></p></div>';
    box.appendChild(App.block('🩹 急救卡（8 張，連圖）', html, {print:false,proj:false}));
    return box;
  }

  if (cat === 'text') {
    box.appendChild(App.block('⚜️ 誓詞・規律・銘言卡',
      '<div class="card"><h3>童軍誓詞</h3><ol class="promise">'+DATA.facts.promise.map(function(l){return '<li>'+l+'</li>';}).join('')+'</ol>'+
      '<h3>童軍規律</h3><ul class="bullet">'+DATA.facts.law.map(function(l){return '<li>'+l+'</li>';}).join('')+'</ul>'+
      '<h3>童軍銘言：準備</h3><ul class="motto">'+DATA.facts.motto7.map(function(l){return '<li>'+l+'</li>';}).join('')+'</ul></div>'+
      '</div>'));
    return box;
  }

  if (cat === 'rope') {
    box.appendChild(App.block('🧵 收繩保養卡',
      '<div class="card"><p><b>收法：</b>'+C14.ropeCare.coil+'</p><ul class="bullet">'+C14.ropeCare.care.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>'+
      (DIAGRAMS.skillx&&DIAGRAMS.skillx.ropecare?'<figure class="dgm-fig"><div class="dgm-wrap">'+DIAGRAMS.skillx.ropecare+'</div><figcaption>收繩＋保養示意（步驟照 c14 文字）</figcaption></figure>':'')+'</div>'));
    return box;
  }

  if (cat === 'flag') {
    box.appendChild(App.block('🇨🇳 國歌《義勇軍進行曲》・升旗禮儀歌紙',
      '<div class="card"><ul class="bullet"><li><b>場合</b>：升旗禮（c04/c06/c12/c20）、大型典禮——全體肅立，面向國旗。</li>'+
      '<li><b>禮儀</b>：制服要整齊；隊列中童軍立正致敬，領隊或單獨一人舉手敬禮（制服唔整齊或穿便服 → 只肅立，唔舉手）。</li></ul>'+
      '<p><b>歌詞</b>：起來！不願做奴隸的人們！把我們的血肉，築成我們新的長城！中華民族到了最危險的時候，每個人被迫着發出最後的吼聲。起來！起來！起來！我們萬眾一心，冒着敵人的炮火，前進！冒着敵人的炮火，前進！前進！前進！進！</p></div>'+
      '<p class="tip">💡 升旗程序、位置圖解：<a href="#ceremony/flag">🎪 升旗禮儀式卡</a>；升旗口令細節見 <a href="#plan/c04">c04</a>。</p>'));
    return box;
  }

  /* 營火會歌紙：直接印某一首／投屏 */
  var songHtml = '';
  songHtml += '<table class="meeting-table"><thead><tr><th>歌名</th><th>場合</th><th>第一句</th><th>點用</th></tr></thead><tbody>';
  SONGS.sheets.forEach(function(sg){
    songHtml += '<tr><td><b>'+sg.zh+'</b></td><td><span class="tag cat">'+sg.cat+'</span></td>'
      + '<td class="mut">'+((sg.lines&&sg.lines[0])?sg.lines[0][1]:'').slice(0,18)+'…</td>'
      + '<td class="nowrap"><button class="print-btn" onclick="App.printSong(\''+sg.k+'\')">🖨️ 印呢首</button>'
      + '<button class="proj-btn" onclick="App.projSong(\''+sg.k+'\')">🖥️ 投呢首</button></td></tr>';
  });
  songHtml += '</tbody></table>';
  box.appendChild(App.block('🔥 營火會歌紙（14 首）', songHtml, {print:false,proj:false}));
  return box;
};

/* 印／投一首歌（唔使跳去 🔥 營火會 tab 都做得到） */
App.printSong = function(k){
  var sg = SONGS.sheets.filter(function(x){return x.k===k;})[0];
  if (!sg) return;
  App.printSec(App.songSec(sg, true));
};
App.projSong = function(k){
  var sg = SONGS.sheets.filter(function(x){return x.k===k;})[0];
  if (!sg) return;
  var html = '<h3>🔥 '+sg.zh+'</h3>' + App.songSheetHtml(sg);
  if (typeof Projector !== 'undefined') Projector.html('🔥 '+sg.zh, html);
};

/* 🎮 活動（每個遊戲附場地圖） */
App.pages.play = function(){
  var wrap = App.h('div','page');
  wrap.appendChild(App.h('h1',null,'🎮 活動'));
  wrap.appendChild(App.h('p','lede','共 '+DATA.games.length+' 個遊戲：破冰、合作、課程活動、營火、雨天後備。每個都有場地圖、人數、物資、玩法、安全提示。'));
  var gbn = App.h('div','game-banner');
  gbn.innerHTML = App.ph('game-banner', FIGS&&FIGS['game-banner']?FIGS['game-banner'].cap:'設場要點');
  wrap.appendChild(gbn);
  var cats = [];
  DATA.games.forEach(function(g){ if(cats.indexOf(g.cat)<0) cats.push(g.cat); });
  var filt = App.h('div','filters');
  filt.setAttribute('role','tablist');
  [{k:'all',n:'全部'}].concat(cats.map(function(c){return {k:c,n:c};})).forEach(function(b,i){
    var btn = App.h('button','filter-btn'+(i===0?' active':''),b.n);
    btn.setAttribute('data-cat',b.k);
    btn.setAttribute('role','tab');
    btn.setAttribute('aria-selected', i===0?'true':'false');
    btn.onclick = function(){
      /* 只喺自己條 bar 切 active（唔會影響頁面其他篩選）＋即時換內容 */
      Array.prototype.forEach.call(filt.querySelectorAll('.filter-btn'), function(x){
        if(x.classList) x.classList.remove('active');
        x.setAttribute('aria-selected','false');
      });
      if(btn.classList) btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      var cat = b.k;
      Array.prototype.forEach.call(wrap.querySelectorAll('.game-card'), function(card){
        var on = (cat==='all' || card.getAttribute('data-cat')===cat);
        if (card.classList) card.classList.toggle('hidden', !on); else card.style.display = on?'':'none';
      });
    };
    filt.appendChild(btn);
  });
  wrap.appendChild(filt);
  DATA.games.forEach(function(g){
    var card = App.h('div','card game-card');
    card.setAttribute('data-cat',g.cat);
    card.setAttribute('data-title','遊戲 '+g.n);
    var gk = (typeof GAME_FIG!=='undefined') ? (GAME_FIG[g.n]||'') : '';
    var gcap = (gk && typeof FIGS!=='undefined' && FIGS[gk]) ? FIGS[gk].cap : '場地擺位圖（俯視）・照圖設場就得';
    var fig = App.ph(gk, gcap, (DIAGRAMS.game && DIAGRAMS.game[g.n]) ? DIAGRAMS.game[g.n] : '');
    card.innerHTML = '<h3>'+g.n+' <span class="tag">'+g.cat+'</span> <span class="tag">'+g.minutes+'分鐘</span></h3>'+
      '<p><b>人數：</b>'+g.people+' &nbsp; <b>物資：</b>'+g.mats+'</p>'+
      '<p>'+g.desc+'</p>'+fig+
      '<p><b>玩法：</b></p><ol class="steps">'+g.steps.map(function(st){return '<li>'+st+'</li>';}).join('')+'</ol>'+
      '<p class="tip">💡 '+g.tips+'</p>'+
      '<p class="safety"><b>⚠️ 安全：</b>'+g.safety+'</p>'+
      '<p class="card-actions"><button class="print-btn" onclick="App.printSec(this.closest(\'div.game-card\'))">🖨️ 印遊戲</button> '
      + '<button class="proj-btn" onclick="App.projSec(this.closest(\'div.game-card\'))">🖥️ 投講解</button></p>';
    wrap.appendChild(card);
  });
  return wrap;
};

/* 🪢 技能（小分頁＋圖解；按用戶要求唔出繩結逐步卡） */
App.pages.skills = function(sub){
  var wrap = App.h('div','page');
  wrap.appendChild(App.h('h1',null,'🪢 技能'));
  wrap.appendChild(App.h('p','lede','除繩結（只出口訣，唔出逐步圖）外，每樣技能都附圖。'));
  var subs = [
    {k:'rope',ic:'🪢',n:'繩結口訣'},
    {k:'care',ic:'🧵',n:'收繩保養'},
    {k:'map',ic:'🗺️',n:'地圖指南針'},
    {k:'pack',ic:'🎒',n:'背囊'},
    {k:'camp',ic:'🏕️',n:'營藝'},
    {k:'pioneer',ic:'🪚',n:'先鋒工程'},
    {k:'track',ic:'👣',n:'追蹤符號'},
    {k:'field',ic:'🌳',n:'郊野守則'},
    {k:'aid',ic:'🩹',n:'急救'}
  ];
  var cur = subs.some(function(x){return x.k===sub;}) ? sub : subs[0].k;
  wrap.appendChild(App.subnav('skills',subs,cur));
  var sk = DIAGRAMS.skillx || {};
  function figFor(name, cap){
    var k = (typeof SKILL_FIG!=='undefined' && SKILL_FIG[name]) ? SKILL_FIG[name] : '';
    var fcap = (k && typeof FIGS!=='undefined' && FIGS[k] && FIGS[k].cap) ? FIGS[k].cap : cap;
    return App.ph(k, fcap, sk[name] || '');
  }
  var secs = {};
  secs.rope = App.block('🪢 繩結（10 個・文字口訣為準）',
    '<div class="card"><ul class="bullet">'+C13.knots.concat(C14.knots).map(function(k){
      return '<li><b>'+k.n+'</b>（'+k.en+'）：'+k.use+'</li>';
    }).join('')+'</ul>'+
    '<div class="callout warn">🚫 本 app <b>唔設「繩結逐步圖卡」</b>——圖解好易畫錯誤導人。打法請跟 <a href="#plan/c13">c13</a>／<a href="#plan/c14">c14</a> 教案嘅文字口訣（例：平結「左壓右」、稱人結「兔仔出洞繞樹返洞」），並由領袖現場示範＋檢查。</div></div>');
  secs.care = App.block('🧵 收繩與繩索保養',
    '<div class="card"><p><b>圈繞收法：</b>'+C14.ropeCare.coil+'</p>'+figFor('ropecare','收繩步驟＋保養五要点')+
    '<ul class="bullet">'+C14.ropeCare.care.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>');
  secs.map = App.block('🗺️ 地圖與指南針',
    '<div class="card"><ul class="bullet">'+
    '<li><b>比例尺 1:25,000</b>：地圖 1cm = 實際 250 米；4 個指甲 ≈ 1 公里（c09）。</li>'+
    '<li><b>10 種圖例</b>：車路/小徑/河流/水塘/林地/等高線（密=斜）/營地/建築/瞭望台/求助電話（c09）。</li>'+
    '<li><b>8 方位</b>：東南西北＋東北、東南、西南、西北（c16 定向遊戲）。</li>'+
    '<li><b>指南針</b>：放平，轉身令紅針對住 N，前面就係北；避開鐵器/磁石/電話（c16）。</li></ul>'+
    '<div class="svg-steps"><figure>'+DIAGRAMS.compass+'<figcaption>指南針八方位：紅針永遠指北（N）</figcaption></figure>'+figFor('legend','地圖圖例（示意）')+'</div></div>');
  secs.pack = App.block('🎒 背囊收拾',
    '<div class="card"><ul class="bullet">'+
    '<li><b>執包三步</b>：輕重分佈（重貼背中上）→常用在外→防水（密實袋）。</li>'+
    '<li><b>一日郊野</b>（c09）：水/乾糧/帽/雨具/防曬蚊怕水/哨子/電話/電筒/小急救包/證件錢。</li>'+
    '<li><b>露營</b>（c15/c16）：50–70L，睡袋放底、衫放中、煮食用具放頂；唔超過體重 1/4。</li></ul>'+
    '<div class="svg-steps"><figure>'+DIAGRAMS.pack+'<figcaption>背囊分層圖：重貼背中上，常用放外，底放睡袋</figcaption></figure></div></div>');
  secs.camp = App.block('🏕️ 營藝（帳篷・爐具・刀具安全）',
    '<div class="card"><ul class="bullet">'+
    '<li><b>紮營</b>：平地→清石→地布→穿柱→起篷→45 度拉營繩→打營釘（c16）。</li>'+
    '<li><b>氣爐</b>：通風、離帳篷 3 米、檢查漏氣、煮食唔離人、熄火先關氣（c15）。</li>'+
    '<li><b>小刀</b>：安全圈一臂、向外削、傳刀合埋柄向人、跌刀唔接（c15）。</li>'+
    '<li><b>斧頭手鋸</b>：3 米線、木頭放穩、扶木手唔放鋸路（c15）。</li></ul>'+
    '<div class="svg-steps">'+figFor('tent','搭帳六步（側視）')+figFor('stove','爐具 3 米安全圈（俯視）')+figFor('knife','小刀安全圈＝一臂長')+'</div></div>');
  secs.pioneer = App.block('🪚 先鋒工程入門',
    '<div class="card"><ul class="bullet">'+
    '<li><b>基礎</b>：10 個繩結（見「繩結口訣」分頁）＋收繩保養——c13/c14 已教齊。</li>'+
    '<li><b>紮作預告</b>：十字紮（綁十字木）、剪立紮（A 字架）、平行紮（接長木）——留待後續先鋒工程場次，雙套結做起結收結。</li>'+
    '<li><b>應用</b>：天幕、營門、橋、瞭望台——c16 營地建設已實習天幕。</li></ul>'+
    '<div class="svg-steps">'+figFor('pioneer','先鋒工程物料／安全距離示意')+'</div>'+
    '<div class="callout">⚠️ 紮作同繩結一樣「畫錯就教錯」，所以圖解一律以現場示範＋教案文字為準。</div></div>');
  secs.track = App.block('👣 追蹤符號（國際通用）',
    '<div class="card"><ul class="bullet">'+
    '<li><b>→ 箭嘴</b>：向前行；<b>○ 圓圈</b>：集合/終點。</li>'+
    '<li><b>✕ 交叉</b>：唔行呢邊/行錯路；<b>↑ 轉彎箭嘴</b>：轉方向。</li>'+
    '<li><b>～ 波浪</b>：有水/小心；<b>△ 三角</b>：留訊息喺附近。</li>'+
    '<li><b>用法</b>：粉筆/石頭/樹枝喺路邊做記號，帶後隊跟路；做完要清走（Leave No Trace）。</li></ul>'+
    '<div class="svg-steps">'+
    '<figure>'+DIAGRAMS.track.arrow+'<figcaption>向前行</figcaption></figure>'+
    '<figure>'+DIAGRAMS.track.circle+'<figcaption>集合/終點</figcaption></figure>'+
    '<figure>'+DIAGRAMS.track.cross+'<figcaption>唔行呢邊</figcaption></figure>'+
    '<figure>'+DIAGRAMS.track.turn+'<figcaption>轉方向</figcaption></figure>'+
    '<figure>'+DIAGRAMS.track.water+'<figcaption>有水/小心</figcaption></figure>'+
    '<figure>'+DIAGRAMS.track.msg+'<figcaption>附近有訊息</figcaption></figure></div></div>');
  secs.field = App.block('🌳 郊野守則・求助信號',
    '<div class="card"><ul class="bullet">'+
    '<li><b>Leave No Trace 七原則</b>：計劃準備→硬地行露營→垃圾帶走→唔郁自然嘢→減營火影響→尊重野生動物→顧及其他人（c16）。</li>'+
    '<li><b>山火預防</b>：只喺指定爐位生火；離開淋熄攪拌感受冇熱；乾燥季節唔生火。</li>'+
    '<li><b>天氣觀察</b>：黑雲/悶熱/風向轉＝落雨先兆；行雷閃電即落山，唔企大樹下。</li>'+
    '<li><b>緊急撤退</b>：預先定撤退路線＋集合點；迷路企定＋吹哨（三短三長三短 SOS）＋等救援（c09/c10）。</li></ul>'+
    '<div class="svg-steps">'+figFor('sos','SOS 哨音節拍（三短三長三短）')+figFor('lost','迷路自保三步 S.T.A.Y.')+'</div></div>');
  secs.aid = App.block('🩹 急救 7 種＋復原臥式（逐種有圖）',
    '<p class="mut">口訣：<b>睇環境 → 嗌救命（999）→ 先救命</b>；唔醒／流血唔止／骨折變形／大面積燒傷一律即送院。</p>'+
    C17.firstaid.map(function(f){ return App.aidCard(f.n, f.how, f.warn); }).join('')+
    App.aidCard('復原臥式','唔醒但有呼吸：側臥，頭微向下、上膝屈前、上手放前面，防嘔吐物鯁親；轉身前後都要睇呼吸','有任何呼吸唔正常即打 999＋準備心肺復甦（跟有急救證書嘅領袖做）')+
    '<p>完整教學＋情境賽：<a href="#plan/c17">c17</a>；可列印急救卡：<a href="#print">✂️ 素材庫</a>。</p>');
  wrap.appendChild(secs[cur]);
  return wrap;
};

/* 🎖️ 興趣章章樣：用官方圖（img/badge/*.avif）；冇圖／load 唔到就出文字章名，唔會用 emoji 代替 */
App.badgeFig = function(k){
  var b = (typeof BADGE_FIG!=='undefined' && BADGE_FIG) ? BADGE_FIG[k] : null;
  if(!b) return '<span class="badge-ic" aria-hidden="true"></span>';
  return '<figure class="badge-fig"><img src="'+b.src+'" width="132" height="132" alt="'+b.alt+'" loading="lazy" decoding="async"'
    + ' onerror="var f=this.closest(\'.badge-fig\');if(f){f.classList.add(\'imgfail\');}">'
    + '<figcaption>'+b.cap+'</figcaption></figure>';
};

/* 🎖️ 興趣章（唔放區總部報章系統入口——興趣組由團考核） */
App.pages.badges = function(){
  var wrap = App.h('div','page');
  wrap.appendChild(App.h('h1',null,'🎖️ 興趣章（興趣組專科徽章）'));
  wrap.appendChild(App.h('p','lede','專科徽章分 4 組：興趣組（綠底，11–13 歲入門）、技能組（藍底，13–15 歲）、服務組（紅底）、教導組（金邊）。呢度只列<b>興趣組</b>——多數由團長喺團內安排考驗。想查其他組別：<a href="'+EXTERNAL.badge+'" target="_blank" rel="noopener">🏅 童軍進度追蹤</a>。'));
  var filt = App.h('div','filters');
  var btns = [{k:'all',n:'全部'}].concat(INTERESTS.categories.map(function(c){return {k:c.k,n:c.ic+' '+c.n};}));
  btns.forEach(function(b,i){
    var btn = App.h('button','filter-btn'+(i===0?' active':''),b.n);
    btn.setAttribute('data-cat',b.k);
    btn.onclick = function(){
      document.querySelectorAll('.filters .filter-btn').forEach(function(x){x.classList.remove('active');});
      btn.classList.add('active');
      var cat = b.k;
      document.querySelectorAll('.badge-card').forEach(function(card){
        card.style.display = (cat==='all' || card.getAttribute('data-cat')===cat) ? '' : 'none';
      });
    };
    filt.appendChild(btn);
  });
  wrap.appendChild(filt);
  wrap.appendChild(App.h('p','source-note','📚 來源：'+INTERESTS.source.title+'（'+INTERESTS.source.version+'）｜<a href="#book/apply">興趣組點考（團內考核 7 步）</a>｜💡 興趣組由團考核，唔使自己入區總部報章系統<br>🎖️ 章樣：<a href="https://scoutsinfohub.org.hk/scout-training-scheme" target="_blank" rel="noopener">童軍資訊站《童軍訓練綱要》</a>官方專科徽章圖（本地存檔，離線都睇得到）；實物以<a href="'+UNIFORM.shop.url+'" target="_blank" rel="noopener">童軍物品供應社</a>發售嘅布章為準。'));
  var grid = App.h('div','badge-grid');
  INTERESTS.badges.forEach(function(b){
    var catName = (INTERESTS.categories.find(function(c){return c.k===b.cat;})||{n:''}).n;
    var tags = '';
    if(b.new2026) tags += '<span class="tag new">🆕 2026新增</span>';
    if(b.rev2026) tags += '<span class="tag rev">✏️ 2026修訂</span>';
    var reqList = b.req.map(function(r){return '<li>'+r+'</li>';}).join('');
    var sugList = b.suggest.map(function(s){return '<li>'+s+'</li>';}).join('');
    var card = App.h('div','badge-card');
    card.setAttribute('data-cat',b.cat);
    card.innerHTML =
      '<div class="badge-head">'+App.badgeFig(b.k)+
      '<h3>'+b.zh+' <small>('+b.en+')</small></h3>'+
      '<div class="badge-tags">'+tags+'<span class="tag cat">'+catName+'</span></div></div>'+
      '<details><summary>📋 官方考核要求</summary><ol class="req-list">'+reqList+'</ol></details>'+
      '<details><summary>💡 建議考核方式（僅供參考）</summary><ul class="sug-list">'+sugList+'</ul></details>'
      + '<p class="no-print"><button class="proj-btn" onclick="App.projSec(this.closest(\'div.badge-card\'))">🖥️ 投屏（同成員講要求）</button></p>';
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
  var cancel = App.h('div','callout warn');
  cancel.innerHTML = '⚠️ <b>已取消徽章（2026-08-15生效）</b>：愛護動物章（興趣組）已取消，由新設「動物飼養章（興趣組）」及「愛護動物章（服務組）」取代；持有舊章者仍可佩戴至童軍身分完結。';
  wrap.appendChild(cancel);
  return wrap;
};

/* 🔥 營火會（程序、歡呼、時間表＋香港旅團唱開嘅歌） */
App.campTabs = [
  {k:'flow',ic:'🗓️',n:'流程'},
  {k:'cheers',ic:'📣',n:'歡呼'},
  {k:'staff',ic:'👥',n:'人手設備'},
  {k:'lead',ic:'🎤',n:'帶唱'},
  {k:'library',ic:'🎵',n:'歌單（14）'},
  {k:'safety',ic:'⚠️',n:'安全考章'}
];
App.pages.songs = function(sub){
  var wrap = App.h('div','page camp-page');
  var sheets = SONGS.sheets;
  var song = sub ? sheets.filter(function(x){return x.k===sub;})[0] : null;
  var cur = song ? 'library' : (App.campTabs.some(function(x){return x.k===sub;}) ? sub : 'flow');
  wrap.appendChild(App.h('h1',null,'🔥 營火會'));
  wrap.appendChild(App.subnav('songs',App.campTabs,cur));

  /* 單首歌紙：保留舊深層連結，但主導航只列六類，唔再將 14 首歌塞入總覽。 */
  if(song){
    var i0 = sheets.indexOf(song);
    var prev = sheets[i0-1], next = sheets[i0+1];
    var bar = App.h('div','cer-nav song-nav');
    bar.innerHTML = '<a class="back-link" href="#songs/library">← 14 首歌單</a>'
      + (prev?'<a class="cer-prev" href="#songs/'+prev.k+'" aria-label="上一首：'+prev.zh+'">← '+prev.zh+'</a>':'')
      + (next?'<a class="cer-next" href="#songs/'+next.k+'" aria-label="下一首：'+next.zh+'">'+next.zh+' →</a>':'');
    wrap.appendChild(bar);
    wrap.appendChild(App.songSec(song, true));
    return wrap;
  }

  var source = '<p class="source-note">📚 營火會程序依據：'+SONGS.hostNote+'；歌詞來源：'+SONGS.sources.join('、')+'。旅團版本如有出入，以自己旅團／區訓練組版本為準。</p>';

  if(cur==='flow'){
    wrap.appendChild(App.h('p','lede','第一次帶就照住呢個 90 分鐘次序：準備 → 熱身 → 高潮 → 歌唱 → 寧靜結尾 → 完全熄火。其他資料已拆到上面五個分頁。'));
    var hero = App.h('div','card song-hero camp-hero');
    hero.innerHTML = '<h3>🔥 營火會點樣帶</h3><div class="svg-steps"><figure>'+(DIAGRAMS.fire?DIAGRAMS.fire.flow:'')+'<figcaption>三段氣氛：熱身 → 高潮 → 寧靜結尾</figcaption></figure></div>';
    wrap.appendChild(hero);
    wrap.appendChild(App.block('🗓️ 一般營火會時間表（約 90 分鐘）',
      '<div class="card"><ol class="steps camp-timeline">'+SONGS.programme.map(function(x){return '<li><b>'+x.t+'</b><br>'+x.d+'</li>';}).join('')+'</ol>'+
      '<p class="tip">✅ '+SONGS.programmeTip+'</p></div>'));
    wrap.appendChild(App.h('div','camp-next','下一步：<a href="#songs/staff">分人手、執設備 →</a>'));
    wrap.appendChild(App.h('div','',source));
    return wrap;
  }

  if(cur==='cheers'){
    wrap.appendChild(App.h('p','lede','每個表演完用一款歡呼代替鼓掌。由歡呼領袖叫第一句，全體跟；同一晚輪流用 3–4 款。'));
    var call = App.h('div','cheer-flow');
    call.innerHTML = '<div><b>1</b><span>歡呼領袖<br><small>叫名＋做動作</small></span></div><i>→</i><div><b>2</b><span>全體<br><small>齊聲回應</small></span></div><i>→</i><div><b>3</b><span>即刻收<br><small>接下一節目</small></span></div>';
    wrap.appendChild(call);
    wrap.appendChild(App.block('📣 歡呼／吶喊（代替鼓掌）',
      '<div class="card cheer-list"><ul class="bullet">'+SONGS.cheers.map(function(x){return '<li><b>'+x.n+'</b>：'+x.d+'</li>';}).join('')+'</ul>'+
      '<p class="tip">💡 '+SONGS.cheersTip+'</p></div>'));
    wrap.appendChild(App.block('📣 小隊自己嘅歡呼點作',
      '<div class="card"><ul class="bullet">'+
      '<li><b>準備三連呼</b>：準備！準備！準備！耶！（右拳每次舉高，最後跳起）</li>'+
      '<li><b>小隊名威風呼</b>：（小隊名）！最威！最叻！耶！（圍圈搭膊，嗌名向圓心踏一步）</li>'+
      '<li><b>勝利 V 呼</b>：贏！贏！贏！我哋係第一！（雙手 V 字舉高）</li>'+
      '<li><b>動物吶喊</b>：小隊動物叫聲＋一個動作，由小隊長帶。</li></ul>'+
      '<p>想同小隊由零創作？<a href="#plan/c07">c07 教案</a>有完整活動。</p></div>'));
    wrap.appendChild(App.h('div','',source));
    return wrap;
  }

  if(cur==='staff'){
    wrap.appendChild(App.h('p','lede','小型營火會四個人已經帶得到：一人控流程、一人控歡呼、兩人管場同器材。'));
    var setup = App.h('div','camp-visual');
    setup.innerHTML = App.ph('fire-circle', FIGS&&FIGS['fire-circle']?FIGS['fire-circle'].cap:'營火場座位與安全設備位置');
    wrap.appendChild(setup);
    wrap.appendChild(App.block('👥 營火會工作人員',
      '<div class="card"><ul class="bullet">'+SONGS.staff.map(function(x){return '<li><b>'+x.r+'</b>：'+x.d+'</li>';}).join('')+'</ul></div>'));
    wrap.appendChild(App.block('🔥 點火儀式＋營火頌詞',
      '<div class="card"><p>'+SONGS.ignition.how+'</p><ul class="bullet">'+SONGS.ignition.words.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>'));
    wrap.appendChild(App.block('🎒 設備清單',
      '<div class="card"><ul class="check-list">'+SONGS.gear.map(function(x){return '<li><span aria-hidden="true">□</span>'+x+'</li>';}).join('')+'</ul></div>'));
    wrap.appendChild(App.h('div','',source));
    return wrap;
  }

  if(cur==='lead'){
    wrap.appendChild(App.h('p','lede','帶唱唔靠器材：自己唱第一句、手勢請全體接、快歌先慢歌後。圖只示圍圈同領唱位置。'));
    var banner = App.h('div','song-banner');
    banner.innerHTML = App.ph('fire-song', FIGS&&FIGS['fire-song']?FIGS['fire-song'].cap:'營火唱歌現場');
    wrap.appendChild(banner);
    wrap.appendChild(App.block('🎤 冇樂器都帶得',
      '<div class="card"><ul class="bullet">'+SONGS.musicTips.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ul></div>', {print:false}));
    wrap.appendChild(App.block('🎤 領唱 5 招',
      '<div class="card"><ol class="steps">'+SONGS.leaderTips.map(function(t,i){return '<li><b>第'+(i+1)+'招：</b>'+t+'</li>';}).join('')+'</ol></div>', {print:false}));
    wrap.appendChild(App.block('📋 唱歌環節編排（10–15 分鐘）',
      '<div class="card"><ol class="steps">'+SONGS.hostPlan.map(function(x){return '<li><b>'+x.t+'</b>：'+x.d+'</li>';}).join('')+'</ol></div>'));
    wrap.appendChild(App.h('div','camp-next','揀歌：<a href="#songs/library">開 14 首歌單 →</a>'));
    wrap.appendChild(App.h('div','',source));
    return wrap;
  }

  if(cur==='library'){
    wrap.appendChild(App.h('p','lede','14 首香港旅團唱開嘅歌。每張只顯示歌名、場合同第一句；撳入去先睇完整歌詞、玩法、領唱提示。'));
    var grid = App.h('div','song-grid');
    sheets.forEach(function(sg){
      var card = App.h('a','card song-card');
      card.href = '#songs/'+sg.k;
      card.innerHTML = '<h3>🎵 '+sg.zh+(sg.en?'<br><small>'+sg.en+'</small>':'')+'</h3>'+
        '<p><span class="tag cat">'+sg.cat+'</span>'+(sg.meter?' <span class="tag">'+sg.meter+'</span>':'')+'</p>'+
        '<p class="mut">'+((sg.lines&&sg.lines[0])?sg.lines[0][1]:'').slice(0,30)+'…</p>'+
        '<p class="ws-open">開歌紙 →</p>';
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    wrap.appendChild(App.h('div','',source));
    return wrap;
  }

  var must = SONGS.mustKnow;
  var mustHtml = '<div class="card"><p>'+must.why+'</p><ul class="bullet">'+must.list.map(function(m){
    return '<li>'+(m.must?'⭐必學：':'')+'<b>'+m.n+'</b> — '+m.tip+'</li>';
  }).join('')+'</ul><p class="tip">✅ '+must.check+'</p><p>營火專科徽章要求：<a href="#badges">🎖️ 興趣章</a>。</p></div>';
  wrap.appendChild(App.h('p','lede','出發前逐項核對安全；考營火章要識歌名同實際帶領，唔係淨係睇歌紙。'));
  wrap.appendChild(App.block('⚠️ 安全底線',
    '<div class="card safety-card"><ul class="check-list">'+SONGS.safety.map(function(x){return '<li><span aria-hidden="true">□</span>'+x+'</li>';}).join('')+'</ul></div>'));
  wrap.appendChild(App.block('⭐ 營火章要識嘅歌（有版權嗰幾首）', mustHtml, {print:false}));
  wrap.appendChild(App.h('div','',source));
  return wrap;
};

/* 歌紙內容（🔥 營火會分頁同 ✂️ 素材庫共用） */
App.songSheetHtml = function(sg){
  var html = '<div class="card song-sheet">';
  html += '<p><span class="tag cat">'+sg.cat+'</span>'
    + (sg.meter?'<span class="tag">拍子 '+sg.meter+'</span>':'')
    + (sg.tempo?'<span class="tag">'+sg.tempo+'</span>':'')+'</p>';
  if (sg.tune) html += '<p><b>旋律：</b>'+sg.tune+'</p>';
  if (sg.form) html += '<p><b>曲式：</b>'+sg.form+'</p>';
  html += '<div class="song-lines">';
  (sg.lines||[]).forEach(function(pair){
    html += '<div class="song-pair">'+(pair[0]?'<div class="chord">'+pair[0]+'</div>':'')+'<div class="ly">'+pair[1]+'</div></div>';
  });
  html += '</div>';
  if (sg.acts && sg.acts.length) html += '<p><b>玩法／動作：</b></p><ul class="bullet">'+sg.acts.map(function(a){return '<li>'+a+'</li>';}).join('')+'</ul>';
  if (sg.howto && sg.howto.length) html += '<p><b>領唱提示：</b></p><ul class="bullet">'+sg.howto.map(function(a){return '<li>'+a+'</li>';}).join('')+'</ul>';
  if (sg.from) html += '<p class="source-note">📚 '+sg.from+'</p>';
  html += '</div>';
  return html;
};

/* 一首歌嘅歌紙卡（可列印／可投屏） */
App.songSec = function(sg, single){
  var sec = App.sec('🎵 '+sg.zh+(sg.en?'（'+sg.en+'）':''), {id:'song-'+sg.k});
  var html = App.songSheetHtml(sg);
  sec._body.innerHTML = html

  return sec;
};

/* 一張急救卡（技能 tab 同素材庫共用）：圖＋處理＋注意 */
App.aidCard = function(name, how, warn, svgFallback){
  var key = (typeof AID_FIG !== 'undefined' && AID_FIG[name]) ? AID_FIG[name] : '';
  var cap = (key && typeof FIGS !== 'undefined' && FIGS[key]) ? FIGS[key].cap : (svgFallback ? '' : '');
  var fb = svgFallback || ((name==='復原臥式' && typeof DIAGRAMS!=='undefined' && DIAGRAMS.skillx) ? DIAGRAMS.skillx.faint : '');
  return '<div class="card aid-card" data-title="急救卡 '+name+'">'+
    '<h3>🩹 '+name+'</h3>'+
    (key ? App.ph(key, cap, fb) : (fb ? '<figure class="dgm-fig"><div class="dgm-wrap">'+fb+'</div><figcaption>📐 '+name+'位置圖解</figcaption></figure>' : ''))+
    '<p><b>處理：</b>'+how+'</p>'+
    (warn ? '<p class="safety"><b>⚠️ 注意：</b>'+warn+'</p>' : '')+
    '</div>';
};

/* ══════════ 集會現場工具（計分板／抽籤／倒數／分組）＋🖥️ 投屏 ══════════
   用戶要求（v31）：① 小隊數目可以自己加減（唔一定四隊）② 自己手機用得，但一定要有投屏版，
   領袖手機操作、投影／大電視同步顯示，成員睇得見。 */
App.troop = {
  count: 4,
  names: ['第一小隊','第二小隊','第三小隊','第四小隊','第五小隊','第六小隊','第七小隊','第八小隊'],
  scores: [0,0,0,0,0,0,0,0],
  timer: { total: 300, left: 300, end: 0, running: false, id: null },
  drawn: [], groups: [], list: []
};
App.patrolScores = App.troop.scores;   /* 舊名保留 */
App.patrolNames = App.troop.names;

App.patrolCount = function(n){
  n = parseInt(n,10);
  if (isNaN(n)) n = App.troop.count;          /* 入錯字就唔變 */
  n = Math.max(2, Math.min(8, n));            /* 2–8 隊 */
  App.troop.count = n;
  App.toolsRefresh();
  if (typeof Projector !== 'undefined' && Projector.on && Projector.liveKind === 'score') Projector.render();
};
App.patrolScore = function(i,d){
  App.troop.scores[i] = Math.max(0,(App.troop.scores[i]||0)+d);
  App.toolsRefresh();
};
App.patrolScoreReset = function(){
  var i;
  for (i=0;i<8;i++) App.troop.scores[i] = 0;
  App.toolsRefresh();
};
App.patrolName = function(i,v){ App.troop.names[i] = String(v||'').slice(0,12); App.toolsRefresh(); };

/* 計分板（手機版／投屏版同一份分數） */
App.boardHtml = function(big){
  var n = App.troop.count, rows = '', i;
  if (big) {
    for (i=0;i<n;i++){
      rows += '<div><span class="pj-team">'+App.troop.names[i]+'</span><b>'+App.troop.scores[i]+'</b>'
        + '<span class="pj-ops"><button onclick="App.act(\'score:'+i+':1\')">＋1</button>'
        + '<button onclick="App.act(\'score:'+i+':5\')">＋5</button>'
        + '<button onclick="App.act(\'score:'+i+':-1\')">－1</button></span></div>';
    }
    return '<div class="pj-score">'+rows+'</div>'
      + '<p class="pj-note">分數兩邊一樣：投影上面嘅數字同領袖手機同步，加咗幾多分人人睇到。'
      + '<button onclick="App.act(\'reset\')">🔄 全部清零</button></p>';
  }
  for (i=0;i<n;i++){
    rows += '<tr><td><input class="pt-name" value="'+String(App.troop.names[i]).replace(/"/g,'&quot;')+'" onchange="App.patrolName('+i+',this.value)"></td>'
      + '<td class="pt-num">'+App.troop.scores[i]+'</td>'
      + '<td class="pt-ops"><button onclick="App.patrolScore('+i+',1)">＋1</button>'
      + '<button onclick="App.patrolScore('+i+',5)">＋5</button>'
      + '<button onclick="App.patrolScore('+i+',-1)">－1</button></td></tr>';
  }
  return '<table class="meeting-table score-table"><thead><tr><th>小隊</th><th>分數</th><th>加減</th></tr></thead><tbody>'+rows+'</tbody></table>';
};

/* 投屏入面嘅掣（同一頁面，所以直接改狀態） */
App.act = function(cmd){
  var p = String(cmd||'').split(':');
  if (p[0]==='score') App.patrolScore(parseInt(p[1],10)||0, parseInt(p[2],10)||0);
  else if (p[0]==='reset') App.patrolScoreReset();
  else if (p[0]==='lots') App.drawLots();
  else if (p[0]==='group') App.groupRandom();
  else if (p[0]==='timer') App.timerCmd(p[1], p[2]);
  App.toolsRefresh();
};

/* 手機版面同投屏同步（改咗分數／倒數，兩邊即刻一樣） */
App.toolsRefresh = function(){
  var b = document.getElementById('pt-board');
  if (b) b.innerHTML = App.boardHtml(false);
  var m = document.getElementById('pt-troop-n');
  if (m && String(App.troop.count) !== String(m.value)) m.value = App.troop.count;
  var o = document.getElementById('pt-cd-out');
  if (o) o.innerHTML = App.clockHtml(false);
  if (typeof Projector !== 'undefined' && Projector.on && Projector.mode === 'live') Projector.render();
};

App.listFrom = function(id){
  var t = document.getElementById(id);
  if (!t) return App.troop.list;
  App.troop.list = String(t.value||'').split('\n').map(function(x){return x.trim();}).filter(function(x){return x;});
  return App.troop.list;
};
App.drawLots = function(){
  var names = App.listFrom('pt-lots-names');
  var nEl = document.getElementById('pt-lots-n');
  var n = Math.max(1, parseInt((nEl&&nEl.value)||'1',10)||1);
  if (!names.length) { App.toast('⚠️ 先入名單（一行一個名）'); return; }
  var pool = names.slice(), picked = [];
  while (pool.length && picked.length<n) picked.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  App.troop.drawn = picked;
  var out = document.getElementById('pt-lots-out');
  if (out) out.innerHTML = '🎲 抽中：<b>'+picked.join('、')+'</b>';
  if (typeof Projector !== 'undefined' && Projector.on && Projector.mode==='live') Projector.render();
};
App.groupRandom = function(){
  var names = App.listFrom('pt-grp-names');
  var gEl = document.getElementById('pt-grp-n');
  var g = Math.max(2, parseInt((gEl&&gEl.value)||'2',10)||2);
  if (!names.length) { App.toast('⚠️ 先入名單（一行一個名）'); return; }
  var pool = names.slice(), i, j, t;
  for (i=pool.length-1;i>0;i--){ j=Math.floor(Math.random()*(i+1)); t=pool[i]; pool[i]=pool[j]; pool[j]=t; }
  var groups = [], k; for (k=0;k<g;k++) groups.push([]);
  pool.forEach(function(nm,idx){ groups[idx%g].push(nm); });
  App.troop.groups = groups;
  var out = document.getElementById('pt-grp-out');
  if (out) out.innerHTML = groups.map(function(gr,gi){return '<p><b>第 '+(gi+1)+' 組：</b>'+gr.join('、')+'</p>';}).join('');
  if (typeof Projector !== 'undefined' && Projector.on && Projector.mode==='live') Projector.render();
};

/* ── 倒數（手機同投屏用同一個計時器）── */
App.timerSet = function(min){
  App.timerStop();
  App.troop.timer.total = Math.max(5, Math.round((parseFloat(min)||1)*60));
  App.troop.timer.left = App.troop.timer.total;
  App.toolsRefresh();
};
App.timerCmd = function(what, arg){
  if (what==='set') App.timerSet(arg);
  else if (what==='start') App.timerStart();
  else if (what==='stop') App.timerStop();
  else if (what==='reset') App.timerSet(App.troop.timer.total/60);
};
App.timerStart = function(){
  var T = App.troop.timer;
  if (T.running) return;
  if (T.left<=0) T.left = T.total;
  T.end = Date.now() + T.left*1000;
  T.running = true;
  if (T.id) clearInterval(T.id);
  T.id = setInterval(function(){
    var left = Math.round((T.end - Date.now())/1000);
    T.left = left>0?left:0;
    if (left<=0) App.timerStop();
    App.toolsRefresh();
  }, 250);
  App.toolsRefresh();
};
App.timerStop = function(){
  var T = App.troop.timer;
  if (T.id) { clearInterval(T.id); T.id = null; }
  if (T.running) T.left = Math.max(0, Math.round((T.end - Date.now())/1000));
  T.running = false;
  App.toolsRefresh();
};
App.timerText = function(){
  var T = App.troop.timer, left = T.running ? Math.max(0, Math.round((T.end - Date.now())/1000)) : T.left;
  var m = Math.floor(left/60), sec = left%60;
  return m+':'+(sec<10?'0':'')+sec;
};
App.clockHtml = function(big){
  var T = App.troop.timer;
  if (big){
    return '<div class="pj-clock'+(T.left<=0 && !T.running?' done':'')+'">'+App.timerText()+'</div>'
      + '<p class="pj-note">'
      + '<button onclick="App.act(\'timer:set:1\')">1 分鐘</button>'
      + '<button onclick="App.act(\'timer:set:2\')">2 分鐘</button>'
      + '<button onclick="App.act(\'timer:set:5\')">5 分鐘</button>'
      + '<button onclick="App.act(\'timer:set:10\')">10 分鐘</button>'
      + (T.running ? '<button onclick="App.act(\'timer:stop\')">⏸ 暫停</button>' : '<button onclick="App.act(\'timer:start\')">▶ 開始</button>')
      + '<button onclick="App.act(\'timer:reset\')">↺ 重設</button></p>';
  }
  return '<b class="pt-clock">'+App.timerText()+'</b>'
    + (T.running ? ' <button onclick="App.timerStop()">⏸ 暫停</button>' : ' <button onclick="App.timerStart()">▶ 開始</button>')
    + ' <button onclick="App.timerCmd(\'reset\')">↺ 重設</button>';
};
/* 舊名兼容 */
App.countdownStart = function(){
  var mEl = document.getElementById('pt-cd-m'), sEl = document.getElementById('pt-cd-s');
  var m = parseInt((mEl&&mEl.value)||'0',10)||0, sec = parseInt((sEl&&sEl.value)||'0',10)||0;
  var total = m*60+sec;
  if (total>0) { App.troop.timer.total = total; App.troop.timer.left = total; }
  App.timerStart();
};
App.countdownStop = function(){ App.timerStop(); };

/* 投屏用嘅即時畫面 */
App.projHtml = function(kind){
  if (kind==='score') return '<h3>🏆 小隊計分板</h3>'+App.boardHtml(true);
  if (kind==='timer') return '<h3>⏱️ 倒數</h3>'+App.clockHtml(true);
  if (kind==='lots') {
    return '<h3>🎲 抽籤</h3><p class="pj-big">'+(App.troop.drawn.length?App.troop.drawn.join('、'):'（未抽）')+'</p>'
      + '<p class="pj-note"><button onclick="App.act(\'lots\')">🎲 再抽一次</button>'
      + '<span class="mut">名單喺手機度入（一行一個名）；抽籤係即場隨機，全場一齊睇住抽。</span></p>';
  }
  if (kind==='group') {
    var g = App.troop.groups;
    return '<h3>👥 隨機分組</h3>'+(g.length?g.map(function(gr,gi){
      return '<div class="pj-group"><b>第 '+(gi+1)+' 組</b><span>'+gr.join('、')+'</span></div>';
    }).join(''):'<p class="pj-big">（未分組）</p>')
      + '<p class="pj-note"><button onclick="App.act(\'group\')">👥 再分一次</button>'
      + '<span class="mut">即場隨機抽，抽完即刻投出嚟，人人睇到。</span></p>';
  }
  return '<p class="pj-big">（冇內容）</p>';
};

/* 集會現場工具（📖 手冊→集會工具；每個都可以投影） */
App.toolsSecs = function(){
  var frag = App.h('div','');

  var sBoard = App.sec('🏆 小隊計分板', {print:false, proj:false, id:'pt-board-sec'});
  sBoard._body.innerHTML =
    '<div class="card"><p><b>今日有幾多隊？</b> '+
      '<button onclick="App.patrolCount(App.troop.count-1)">－</button> '+
      '<input id="pt-troop-n" type="number" min="2" max="8" value="'+App.troop.count+'" onchange="App.patrolCount(this.value)" style="width:56px;text-align:center"> '+
      '<button onclick="App.patrolCount(App.troop.count+1)">＋</button> 隊 '+
      '<small class="mut">（2–8 隊；小隊名可以改）</small></p>'+
      '<div id="pt-board">'+App.boardHtml(false)+'</div>'+
      '<p><button onclick="App.patrolScoreReset()">🔄 全部清零</button> '+
      '<button class="proj-big" onclick="Projector.live(\'score\',\'🏆 小隊計分板\')">🖥️ 投屏</button></p>'+
      '<p class="mut">分數喺呢部機暫存，閂咗個 App 先清零。</p></div>';
  frag.appendChild(sBoard);

  var sLots = App.sec('🎲 抽籤', {print:false, proj:false});
  sLots._body.innerHTML =
    '<div class="card"><p>名單（一行一個）：</p><textarea id="pt-lots-names" rows="4" style="width:100%" placeholder="陳大文&#10;李小明&#10;…"></textarea>'+
    '<p>抽幾個？<input id="pt-lots-n" type="number" value="1" min="1" style="width:60px"> '+
    '<button onclick="App.drawLots()">抽籤！</button> '+
    '<button class="proj-big" onclick="Projector.live(\'lots\',\'🎲 抽籤\')">🖥️ 投屏</button></p>'+
    '<div id="pt-lots-out"></div>'+
    '</div>';
  frag.appendChild(sLots);

  var sCd = App.sec('⏱️ 倒數計時', {print:false, proj:false});
  sCd._body.innerHTML =
    '<div class="card"><p><button onclick="App.timerCmd(\'set\',1)">1 分鐘</button> '+
    '<button onclick="App.timerCmd(\'set\',2)">2 分鐘</button> '+
    '<button onclick="App.timerCmd(\'set\',5)">5 分鐘</button> '+
    '<button onclick="App.timerCmd(\'set\',10)">10 分鐘</button> '+
    '<input id="pt-cd-m" type="number" value="5" min="0" style="width:56px"> 分 '+
    '<input id="pt-cd-s" type="number" value="0" min="0" max="59" style="width:56px"> 秒 '+
    '<button onclick="App.countdownStart()">▶ 用呢個時間開始</button></p>'+
    '<p id="pt-cd-out">'+App.clockHtml(false)+'</p>'+
    '<p><button class="proj-big" onclick="Projector.live(\'timer\',\'⏱️ 倒數\')">🖥️ 投屏</button></p>'+
    '<p class="mut">分組討論、遊戲計時用。</p></div>';
  frag.appendChild(sCd);

  var sGrp = App.sec('👥 隨機分組', {print:false, proj:false});
  sGrp._body.innerHTML =
    '<div class="card"><p>名單（一行一個）：</p><textarea id="pt-grp-names" rows="4" style="width:100%" placeholder="陳大文&#10;李小明&#10;…"></textarea>'+
    '<p>分幾多組？<input id="pt-grp-n" type="number" value="2" min="2" max="8" style="width:60px"> '+
    '<button onclick="App.groupRandom()">隨機分組！</button> '+
    '<button class="proj-big" onclick="Projector.live(\'group\',\'👥 隨機分組\')">🖥️ 投屏</button></p>'+
    '<div id="pt-grp-out"></div>'+
    '</div>';
  frag.appendChild(sGrp);

  return frag;
};

if (typeof module !== 'undefined' && module.exports) module.exports = App;
