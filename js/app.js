/* app.js — VS Hub 核心：路由（支援分頁 sub）、tab 渲染、指邊印邊列印（深資童軍團集會助手） */
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
  // 舊連結兼容：patrol 轉去手冊執委會制度
  if(raw==='patrol' || raw.indexOf('patrol/')===0){
    location.replace('#book/exec');
    return;
  }
  // 舊連結兼容：營火會已由 AYP 取代
  if(raw==='songs' || raw.indexOf('songs/')===0){
    location.replace('#ayp');
    return;
  }
  var parts = raw.split('/');
  var tab = parts[0];
  var sub = null;
  try{ sub = parts[1] ? decodeURIComponent(parts[1]) : null; }catch(e){ sub = parts[1]||null; }
  var allowed = ['plan','ceremony','uniform','official','book','print','play','skills','badges','ayp','search'];
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
    title = h1 ? h1.textContent.trim() : '深資童軍團集會助手';
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
  /* v42：儀式卡唔再用 AI 插畫（全部刪走）；得返 dgm 隊形／位置示意圖，配圖說講明唔係動作範本 */
  var dk = c.fig || c.dgm;
  var dgmHtml = (dk && typeof DIAGRAMS!=='undefined' && DIAGRAMS.cer && DIAGRAMS.cer[dk]) ? DIAGRAMS.cer[dk] : '';
  if(!dgmHtml) return '';
  return '<figure class="dgm-fig"><div class="dgm-wrap">'+dgmHtml+'</div>'
    + '<figcaption>📐 '+(c.figcap||'隊形／位置示意圖')+'・呢張圖只作隊形／位置示意，動作角度與手勢請照文字要領同《步操手冊》由領袖示範</figcaption></figure>';
};

/* 逐步圖解（照《步操手冊》分部動作；圖已轉 AVIF）；冇呢個 key 就乜都唔出 */
App.cerDgm = function(k, cap){
  var dk = (k && typeof DIAGRAMS!=='undefined' && DIAGRAMS.cer) ? DIAGRAMS.cer[k] : '';
  if(!dk) return '';
  return '<details class="dgm-fold"><summary>📐 分部動作圖解（'+(cap||k)+'）</summary>'
    + '<figure class="dgm-fig"><div class="dgm-wrap">'+dk+'</div><figcaption>📐 '+(cap||'分部動作圖解')
    + '・呢啲圖只作隊形／位置示意；動作角度同手勢請照文字要領＋《步操手冊》由領袖示範</figcaption></figure></details>';
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
  head.innerHTML = '🧭 深資童軍團集會助手 ｜ 列印範圍：'+(el.getAttribute ? (el.getAttribute('data-title')||'本節') : '本節')+' ｜ 旅團：＿＿＿＿＿＿　分組：＿＿＿＿　日期：＿＿＿＿年＿＿月＿＿日';
  box.appendChild(head);
  box.appendChild(clone);
  var foot = doc.createElement('div');
  foot.className='pz-foot';
  foot.innerHTML = '<small>由 Scout System 出品・內容以《深資童軍訓練綱要》及總會最新通告為準</small>';
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

/* 教材用：長句自動拆子彈（「；」分段）——用戶要求列點，唔好一大段字 */
App.teachD = function(d){
  d = String(d||'');
  if(d.length < 50) return d ? '：'+d : '';
  var parts = d.split('；').map(function(x){return x.trim();}).filter(function(x){return x;});
  if(parts.length < 2){ parts = d.split('。').map(function(x){return x.trim();}).filter(function(x){return x;}).map(function(x){return x+'。';}); }
  if(parts.length < 2 || parts.length > 7) return '：'+d;
  return '：<ul class="bullet tight sub">'+parts.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
};
/* 教材用：冇指定圖就按關鍵字配（同一場唔會重複用同一張） */
App.teachFigFor = function(b){
  var txt = [b.h||'', b.aim||''].concat((b.points||[]).map(function(p){return (p.t||'')+' '+(p.d||'');}),
    (b.script||[]), ((b.demo||[])||[]), (b.steps||[])).join(' ');
  var figMap = [
    [/鼻血/, 'aid-nosebleed'],
    [/出血|傷口|加壓|包紮|三角巾|懸臂|風帽|紗布|止血/, 'aid-cut'],
    [/燒傷|燙傷|燒燙/, 'aid-burn'],
    [/抽筋/, 'aid-cramp'],
    [/蜂|蟲咬|刺傷|水母/, 'aid-sting'],
    [/執包|執袋|背囊|裝備表|行裝|個人裝備/, 'skill-pack'],
    [/營幕|帳篷|紮營|營地|營區|天幕/, 'skill-tent'],
    [/氣爐|爐具|燃料|氣罐|擋風板/, 'skill-stove'],
    [/煮食|烹調|炊|食譜|膳食|米|飯/, 'skill-rice'],
    [/摺刀|小刀|刀具|用刀/, 'skill-knife'],
    [/收繩|繩索保養|圈繞|晾繩|繩紋/, 'skill-ropecare'],
    [/圖例|比例尺|方格網|座標|等高線|地圖種類|地圖閱讀/, 'skill-legend'],
    [/迷路|迷途|走失|唔見路/, 'skill-lost'],
    [/求救|SOS|哨音|訊號|哨子/, 'skill-sos'],
    [/隊形|站位|排位|陣式|集隊位置/, 'game-lineup']
  ];
  for(var i=0;i<figMap.length;i++){ if(figMap[i][0].test(txt)) return figMap[i][1]; }
  return '';
};
/* 平面圖解（DIAGRAMS/IMG）——圖表類（指南針、背囊）用呢個 */
App.teachDgmFor = function(b){
  var txt = [b.h||'', b.aim||''].concat((b.points||[]).map(function(p){return (p.t||'')+' '+(p.d||'');})).join(' ');
  if(/指南針|方位角|正置地圖|定向/.test(txt)) return 'compass';
  if(/背囊|執包|行裝/.test(txt)) return 'pack';
  return '';
};
App.buildSearchIndex = function(){
  if(App.searchIndex) return App.searchIndex;
  var idx = [];
  DATA.meetings.forEach(function(m){
    var mt = m.tid+' '+m.n+' '+(m.badge||'')+' '+(m.goal||'')+' '+((m.data&&m.data.goal)||'');
    if(m.data && Object.prototype.toString.call(m.data.program)==='[object Array]'){
      mt += ' ' + m.data.program.map(function(p){ return (p&&(p.t||p.n||p.label))||''; }).join(' ');
    }
    if(m.data && m.data.worksheet && m.data.worksheet.title){ mt += ' ' + m.data.worksheet.title; }
    idx.push({type:'集會', title:m.tid+' '+m.n, link:'#plan/'+m.tid, desc:m.badge||'', text:mt.toLowerCase()});
  });
  DATA.games.forEach(function(g){
    var gHasPh = (typeof GAME_FIG!=='undefined' && typeof FIGS!=='undefined' && g.n in GAME_FIG && !!FIGS[GAME_FIG[g.n]]);
    idx.push({type:'遊戲', title:g.n, link:'#print', desc:g.cat+' · '+g.minutes+'分鐘'+(gHasPh?'（附實景示意圖＋場地圖）':'（附場地圖）'),
      text:(g.n+' '+g.cat+' '+g.desc+' '+g.mats).toLowerCase()});
  });
  INTERESTS.badges.forEach(function(b){
    idx.push({type:'獎章', title:b.zh+'（'+b.en+'）', link:'#badges', desc:'考核要求',
      text:(b.zh+' '+b.en+' '+b.k+' '+(b.req||[]).join(' ')).toLowerCase()});
  });
  /* 技能／活動：由 ITEMS 單項項目庫即時生成（唔再硬編，避免連結去唔存在嘅分頁） */
  if(typeof ITEMS!=='undefined'){
    ITEMS.skills.forEach(function(x){
      idx.push({type:'技能', title:x.ic+' '+x.n, link:'#skills', desc:x.cat+' · '+x.mins,
        text:(x.n+' '+x.cat+' '+(x.points||[]).join(' ')+' '+(x.demo||[]).join(' ')+' '+(x.check||[]).join(' ')+' '+(x.wrong||[]).join(' ')+' '+[].concat(x.flow||[],x.flow||[],x.mats||'',x.badge||'').join(' ')).toLowerCase()});
    });
    ITEMS.activities.forEach(function(x){
      idx.push({type:'活動', title:x.ic+' '+x.n, link:'#play', desc:x.cat+' · '+x.mins,
        text:(x.n+' '+x.cat+' '+(x.flow||[]).join(' ')+' '+(x.lead||[]).join(' ')+(x.mats||'')+' '+(x.badge||'')+' '+(x.goal||'')).toLowerCase()});
    });
  }
  if(typeof TEACH!=='undefined'){ Object.keys(TEACH).forEach(function(tk){ if(tk==='sources') return; TEACH[tk].forEach(function(b,bi){ idx.push({type:'教材', title:(tk+' 教材'+(bi+1)+'・')+(b.h||''), link:'#plan/'+tk, desc:'照住講（含官方原文＋示範＋抽問）', text:((b.h||'')+' '+(b.aim||'')+" "+(b.points||[]).map(function(p){return p.t+' '+p.d;}).join(' ')+' '+(b.quote?(b.quote.text||''):'')+' '+(b.script||[]).join(' ')).toLowerCase()}); }); }); }
  CEREMONY.cards.forEach(function(c){
      idx.push({type:'儀式', title:c.icon+' '+c.n, link:'#ceremony/'+c.k, desc:(DIAGRAMS&&DIAGRAMS.cer&&(DIAGRAMS.cer[c.fig||c.dgm]))?'附隊形／位置示意圖（只作位置參考）':'文字程序照官方',
      text:('儀式 '+c.n+' 升旗 宣誓 步操 敬禮 隊列 點名 降旗 開始 結束 開禮 禮成 '+ (c.steps||[]).map(function(s){return s.h+' '+s.d;}).join(' ')).toLowerCase()});
  });
  idx.push({type:'制服', title:'制服佩戴（陸／海／空小分頁）＋自查清單', link:'#uniform', desc:'', text:'制服 領巾 徽章 佩戴 恤衫 褲裙 帽 皮帶 襪 鞋 儀容 海深資 空深資 陸深資 棗紅 軟帽 白頂帽 深資童軍'});
  idx.push({type:'制服', title:'🧣 領巾・巾圈・領帶（4 色）・皮帶皮鞋襪', link:'#uniform/acc', desc:'按手冊 3.4–3.6', text:'領巾 巾圈 領帶 顏色巾圈 童軍巾圈 小隊活動巾圈 基維爾巾圈 基維爾領巾 木章 皮帶 皮鞋 短襪 襪褲 捲巾 3.5cm 12至15cm windsor 棗紅 深綠 黑 深藍 配件 對照'});
  idx.push({type:'制服', title:'🎖️ 徽章佩戴位置圖（胸袋上下層＋衫袖＋肩章）', link:'#uniform/badge', desc:'附位置圖', text:'徽章 佩戴 位置 圖 胸袋 袋蓋 3cm 肩章 金帶 旅章 區章 地域章 香港章 服務年星 進度性獎章 會員章 圖解'});
  idx.push({type:'手冊', title:'誓詞規律銘言＋執委會制度＋報班', link:'#book', desc:'', text:'誓詞 規律 銘言 準備 報班 訓練班 考章 執委會'});
  idx.push({type:'手冊', title:'執委會制度＋執委職責＋會議記錄表', link:'#book/exec', desc:'已併入手冊', text:'執委會 執委 制度 會議記錄 主席 秘書 司庫 自務自治'});
  idx.push({type:'手冊', title:'集會工具（計分板・抽籤・倒數・分組・投屏）', link:'#book/tools', desc:'可投屏', text:'計分板 抽籤 倒數 分組 工具 投屏 分組數 投影 大電視'});
  idx.push({type:'手冊', title:'AYP領袖指南（團員參加＋領袖參與＋成立執行處）', link:'#book/ayp', desc:'新領袖必修', text:'ayp 領袖指南 團員參加 執行處支部 組長 導師 評核員 成立執行處 表格 AYP/10 座談會 紀錄簿 迎新講座'});
  idx.push({type:'手冊', title:'參考資料（綱要＋套包＋圖書館＋AYP＋升團直連）', link:'#book/refs', desc:'外部連結', text:'參考資料 綱要 套包 圖書館 ayp 升團 upgrade 外部連結 分享 團員'});
  idx.push({type:'素材', title:'🎮 互動遊戲工具（誰是臥底・機密特務・骰子・轉盤）', link:'#print', desc:'全離線・可投屏', text:'遊戲 互動 破冰 誰是臥底 機密特務 骰子 大話骰 轉盤 投影 投屏 聚會 game 派卡 秘密卡'});
  idx.push({type:'素材', title:'🎲 集會遊戲卡（23 個・有玩法物資安全）', link:'#print', desc:'即插即用', text:'遊戲卡 玩法 物資 安全 破冰 團隊 官方套包 集會遊戲'});
  idx.push({type:'素材', title:'🖨️ 即印素材（急救卡 6 張・誓詞卡・收繩卡・國歌歌紙）', link:'#print', desc:'A4 直接印', text:'急救卡 誓詞 規律 銘言 收繩 保養 國歌 義勇軍進行曲 升旗 歌紙 列印 素材 投屏'});
  if(typeof AYP!=='undefined'){
    idx.push({type:'AYP', title:'🌟 AYP 係乜（香港青年獎勵計劃・14–24 歲）', link:'#ayp/about', desc:'概覽', text:'ayp 香港青年獎勵計劃 hkayp 愛丁堡 銅章 銀章 金章 獎勵計劃 概覽 14歲 24歲'});
    idx.push({type:'AYP', title:'三級要求（主項副項＋時數月份）', link:'#ayp/levels', desc:'銅銀金', text:'ayp 銅章 銀章 金章 直接 漸進 主項 副項 major minor 時數 月份 26小時 52小時 78小時'});
    idx.push({type:'AYP', title:'五科介紹（服務・野外・技能・康體・團體生活）', link:'#ayp/sections', desc:'五科', text:'ayp 服務科 野外鍛鍊科 技能科 康樂體育科 團體生活科 service skills physical recreation adventurous journey residential 遠足 獨木舟'});
    idx.push({type:'AYP', title:'點參加（執行處・紀錄簿・評核 7 步）', link:'#ayp/join', desc:'參加', text:'ayp 報名 參加 執行處 執行機構 紀錄簿 導師 評核員 計劃書 簽署 領獎 參加辦法'});
  }
  App.searchIndex = idx;
  return idx;
};
App.searchGo = function(){
  var input = document.getElementById('q-input');
  var out = document.getElementById('q-out');
  if(!input||!out) return;
  var q = (input.value||'').trim().toLowerCase();
  if(!q){ out.innerHTML = '<p class="mut">輸入關鍵字即時搵：16 場集會＋遊戲＋獎章＋技能＋儀式＋AYP。</p>'; return; }
  var keys = q.split(/\s+/);
  var res = App.buildSearchIndex().filter(function(e){
    return keys.every(function(k){ return e.text.indexOf(k)>=0; });
  }).slice(0,30);
  if(!res.length){ out.innerHTML = '<p>😅 冇結果，試吓：儀式 / 急救 / 露營 / 地圖 / AYP / 獎章。</p>'; return; }
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
      warn.innerHTML = '⚠️ <b>本集會包含 Safe from Harm 保護課題（敏感議題）。</b><br>'+
        '・必須最少 2 位領袖在場（兩人規則）<br>'+
        '・<b>唔要求團員分享個人經歷</b>，所有情境均為假設<br>'+
        '・如團員情緒有反應，即由另一位領袖陪同離場安撫，事後按《青少年保護政策》跟進<br>'+
        '・如團員未滿 18 歲，可發家長須知（非儀式環節，行政用）';
      wrap.appendChild(warn);
    }
    if(m.outdoor){
      var outdoorWarn = App.h('div','card safety-warn outdoor-warn');
      outdoorWarn.innerHTML = '🥾 <b>室外郊野活動特別提醒</b><br>'+
        '・未滿 18 歲團員須交家長同意書；18 歲或以上由本人簽署<br>'+
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
    anchors.push({id:tid+'-program',ic:'📋',n:'程序表'});
    anchors.push({id:tid+'-bag',ic:'🎒',n:'執袋'});
    if(m.personalKit) anchors.push({id:tid+'-kit',ic:'👕',n:'個人裝備'});
    anchors.push({id:tid+'-notice',ic:'📝',n:'通知單'});
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

    /* 教材（照住講）：TEACH[tid] —— v43 版：列點、收折、加圖（用戶：字太多，盡量列點，能用圖表達就用圖） */
    if(typeof TEACH!=='undefined' && TEACH[tid] && TEACH[tid].length){
      var th = App.h('div','card teach-card');
      var H = '<h3>📖 照住講（教材 '+TEACH[tid].length+' 段）</h3>'
        + '<p class="mut">每段五格：🎯 目標 → 📌 要點（逐點列）→ 🗣 講稿（撳開照讀）→ 🛠 示範 → ❓ 抽問。字多嘅都收埋喺「撳開」入面，備課唔會一眼睇到頭暈；<b>「⚠️ 常見錯」同「📋 做完要見到」永遠企喺面</b>（最易出錯）。</p>';
      var usedFig = {};
      TEACH[tid].forEach(function(b, bi){
        H += '<div class="teach-block"><h4>'+(bi+1)+'. '+b.h+(b.mins?'<span class="tag">'+b.mins+'分鐘</span>':'')+'</h4>';
        if(b.aim) H += '<p class="teach-aim">🎯 '+b.aim+'</p>';
        if(b.quote){
          var qt = b.quote.text||'';
          if(qt.length > 120){
            H += '<details class="teach-quote"><summary>📜 官方原文（撳開照讀）</summary><blockquote>'+qt+'<cite>—— '+(b.quote.src||'')+'</cite></blockquote></details>';
          } else {
            H += '<blockquote class="teach-quote"><b>官方原文</b><br>'+qt+'<cite>—— '+(b.quote.src||'')+'</cite></blockquote>';
          }
        }
        if(b.points) H += '<h5>📌 要點</h5><ul class="bullet tight">'+b.points.map(function(pt){
          return '<li><b>'+pt.t+'</b>'+App.teachD(pt.d)+'</li>';
        }).join('')+'</ul>';
        var figKey = b.fig || App.teachFigFor(b);
        if(figKey && !usedFig[figKey] && typeof FIGS!=='undefined' && FIGS[figKey]){ usedFig[figKey] = 1;
          H += App.ph(figKey, FIGS[figKey].cap || '示意圖', '');
        } else {
          var dgmKey = b.dgm || App.teachDgmFor(b);
          if(dgmKey && !usedFig['dgm:'+dgmKey] && typeof IMG!=='undefined' && IMG.map['top.'+dgmKey]){ usedFig['dgm:'+dgmKey] = 1;
            H += App.dgmFigure('top.'+dgmKey, (typeof IMG!=='undefined'&&IMG.alt?IMG.alt('top.'+dgmKey):'平面圖解'));
          }
        }
        if(b.cards) H += '<table class="meeting-table"><tbody>'+b.cards.map(function(c){return '<tr><th>'+c.y+'</th><td><b>'+c.t+'</b>'+App.teachD(c.d)+'</td></tr>';}).join('')+'</tbody></table>';
        if(b.timetable) H += b.timetable.map(function(tp){return '<h5>⏱ '+tp.t+'</h5><ol class="steps tight">'+tp.rows.map(function(r){return '<li>'+r+'</li>';}).join('')+'</ol>';}).join('');
        if(b.steps) H += '<details class="teach-demo" open><summary>🪢 打法要領（照呢個順序教）</summary><ol class="steps tight">'+b.steps.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol></details>';
        if(b.use) H += '<p class="teach-line"><b>✔ 用途：</b>'+b.use.join('／')+'</p>';
        if(b.demo) H += '<details class="teach-demo"><summary>🛠 示範／實習：點樣帶（撳開照做）</summary><ol class="steps tight">'+b.demo.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol></details>';
        if(b.list) H += '<details class="teach-demo"><summary>☑ 檢查清單（'+b.list.length+' 項）</summary><ul class="bullet checklist tight">'+b.list.map(function(x){return '<li>☐ '+x+'</li>';}).join('')+'</ul></details>';
        if(b.script) H += '<details class="teach-script"><summary>🗣 講稿（'+b.script.length+' 句，可以照讀）</summary><ul class="bullet tight">'+b.script.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></details>';
        var qa = b.ask || b.quiz;
        if(qa) H += '<details class="teach-ask"><summary>❓ 抽問（'+qa.length+' 條，附答案）</summary><ul class="bullet tight">'+qa.map(function(q){return '<li><b>'+q.q+'</b><br><small>答案：'+q.a+'</small></li>';}).join('')+'</ul></details>';
        if(b.wrong) H += '<div class="callout warn"><b>⚠️ 常見錯</b><ul class="bullet tight">'+b.wrong.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>';
        if(b.note) H += '<p class="mut">'+b.note+'</p>';
        if(b.safety) H += '<p class="safety"><b>⚠️ 安全：</b>'+b.safety+'</p>';
        if(b.check) H += '<p class="teach-check">📋 做完要見到：'+b.check+'</p>';
        H += '</div>';
      });
      if(TEACH.sources) H += '<p class="source-note">📚 教材出處（要核對原文按呢度）：'+TEACH.sources.map(function(x){return '<a href="'+x.u+'" target="_blank" rel="noopener">'+x.t+'</a>';}).join('｜')+'</p>';
      th.innerHTML = H;
      var sTeach = App.sec('📖 照住講（教材）',{id:tid+'-teach', print:true});
      sTeach.add(th);
      wrap.appendChild(sTeach);
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

    // 程序表（段數按教案實際節數）
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
          if(p.leader.exec) ldr.push('<b>執委會：</b>'+p.leader.exec);
          if(p.leader.patrol) ldr.push('<b>組長（工作小組）：</b>'+p.leader.patrol);
          if(ldr.length) detail += '<p>'+ldr.join(' ｜ ')+'</p>';
        }
      }
      if(p.leaderScript){
        detail += '<div class="callout" style="background:#FFF8E1;border-left:4px solid #F9A825;margin:6px 0;"><b>🎤 講稿：</b>'+p.leaderScript+'</div>';
      }
      if(p.activities){
        detail += '<p><b>活動：</b>'+p.activities.map(function(a){return DATA.games.find(function(g){return g.n===a.name;})?('<a href="#play">'+a.name+'</a>（'+a.min+'分鐘）'):a.name+'（'+a.min+'分鐘）';}).join(' → ')+'</p>';
      }
      if(p.talking) detail += '<p><b>分組傾乜：</b></p><ul class="bullet">'+p.talking.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ul>';
      if(p.blocks) detail += p.blocks.map(function(b){return '<p><b>'+b.h+'</b>：'+b.d+(b.cite?' <small style="color:#888">'+b.cite+'</small>':'')+'</p>';}).join('');
      if(p.tip) detail += '<p class="tip">💡 '+p.tip+'</p>';
      if(p.key) detail += '<p><b>重點：</b>'+p.key+'</p>';
      if(p.safety) detail += '<p class="safety"><b>⚠️ 安全：</b>'+p.safety+'</p>';
      // 儀式段落加圖解連結（解決「淨睇文字唔明」）
      if(/儀式|升旗|隊列|宣誓|步操|敬禮/.test(title||'')){
        var ck = /升旗/.test(title)?'flag':(/宣誓/.test(title)?'oath':(/隊列|步操|立正|稍息/.test(title)?'footdrill':(/結束/.test(title)?'close':'open')));
        detail += '<p class="figlink">🎪 呢段有儀式：睇 <a href="#ceremony/'+ck+'">儀式卡圖解版</a>（隊列/升旗/宣誓都有位置圖）</p>';
      }
      var mats = '';
      if(p.mats && p.mats.length) mats = '<br><small>🎒 '+p.mats.join('、')+'</small>';
      else if(p.materials) mats = '<br><small>🎒 '+p.materials+'</small>';
      tbl.innerHTML += '<tr><td data-label="序">'+(idx+1)+'</td><td data-label="分鐘">'+(mins||'')+'</td><td data-label="項目">'+type+(type?'<br>':'')+'<small>'+title+'</small></td><td data-label="帶領要點">'+detail+mats+'</td></tr>';
    });
    tbl.innerHTML += '</tbody>';
    var sProg = App.sec('📋 '+(m.duration||90)+' 分鐘程序表（'+d.program.length+' 段）',{id:tid+'-program'});
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
      var sPk = App.sec('👕 個人裝備清單（通知團員）',{id:tid+'-kit'});
      sPk.add(pk);
      wrap.appendChild(sPk);
    }

    // 家長通知
    var nc = App.h('div','card notice-card');
    if(typeof d.notice === 'string'){
      nc.innerHTML = '<pre style="white-space:pre-wrap;font-family:inherit;margin:0;">'+d.notice+'</pre>';
    } else {
      nc.innerHTML = '<h3>'+(d.notice.title||'通知單')+'</h3><ul class="bullet">'+(d.notice.items||[]).map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
    }
    var sNotice = App.sec('📝 通知單／同意書（列印派發）',{id:tid+'-notice'});
    sNotice.add(nc);
    wrap.appendChild(sNotice);

    // 工作紙（深資版：手機優先，傳 tid 以便儲存）
    if(d.worksheet){
      var wsAudience = (d.worksheet.audience==='leader')?'領袖檢查清單':'工作紙（成員用・手機／iPad 直接填）';
      var sWs = App.sec('✂️ '+wsAudience,{id:tid+'-ws'});
      sWs._body.innerHTML = App.worksheetHtml(d.worksheet, tid);
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
    if(d.practical){
      if(Array.isArray(d.practical)){
        pb.innerHTML = d.practical.map(function(x){return '<p><b>'+x.situation+'：</b>'+x.action+'</p>';}).join('');
      } else {
        var pkeys = {fewPeople:'少人（6-8 人）',lackMat:'缺物資',notEngaged:'不投入',thirtyMinEnd:'要提早 30 分鐘收尾',emotionalSupport:'如有團員情緒反應',weatherBad:'天氣不好/落雨',techFail:'音響/投影失靈',late:'嘉賓/家長遲到',absentee:'有團員缺席'};
        var phtml = '';
        Object.keys(pkeys).forEach(function(k){
          if(d.practical[k]) phtml += '<p><b>'+pkeys[k]+'：</b>'+d.practical[k]+'</p>';
        });
        if(d.practical.qa && d.practical.qa.length){
          phtml += '<p><b>成員可能問：</b></p><ul class="bullet">'+d.practical.qa.map(function(q){return '<li><b>Q：'+q.q+'</b><br>A：'+q.a+'</li>';}).join('')+'</ul>';
        }
        pb.innerHTML = phtml || '<p class="mut">按現場人數及進度彈性調整分組及討論時間。</p>';
      }
    } else {
      pb.innerHTML = '<p class="mut">按現場人數及進度彈性調整分組及討論時間；如少人可合併討論，缺席者由秘書群組跟進補交資料。</p>';
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

/* 工作紙 HTML（深資版：手機／iPad 優先，離線可填，支援儲存＋分享＋列印） */
App.wsStore = App.wsStore || {};
App.wsSave = function(wsId, fieldIdx, val){
  try{
    var key='vs-ws-'+wsId;
    var data=JSON.parse(localStorage.getItem(key)||'{}');
    data[fieldIdx]=val;
    localStorage.setItem(key, JSON.stringify(data));
    var el=document.getElementById('ws-save-hint-'+wsId);
    if(el){ el.textContent='✓ 已自動儲存到手機'; setTimeout(function(){el.textContent='';},2000); }
  }catch(e){}
};
App.wsLoad = function(wsId){
  try{
    var key='vs-ws-'+wsId;
    var data=JSON.parse(localStorage.getItem(key)||'{}');
    return data;
  }catch(e){ return {}; }
};
App.wsClear = function(wsId){
  try{
    localStorage.removeItem('vs-ws-'+wsId);
    var root=document.querySelector('[data-ws-id="'+wsId+'"]');
    if(root){
      root.querySelectorAll('input,textarea').forEach(function(i){ i.value=''; });
    }
    App.toast('已清除本機儲存');
  }catch(e){}
};
App.wsCopy = function(wsId){
  try{
    var root=document.querySelector('[data-ws-id="'+wsId+'"]');
    if(!root) return;
    var title=root.getAttribute('data-ws-title')||'工作紙';
    var lines=[title,''];
    root.querySelectorAll('[data-field-label]').forEach(function(li){
      var lab=li.getAttribute('data-field-label');
      var inp=li.querySelector('input,textarea');
      var v=inp?inp.value.trim():'';
      lines.push(lab+'：'+(v||'（未填）'));
    });
    var txt=lines.join('\n');
    if(navigator.clipboard){ navigator.clipboard.writeText(txt).then(function(){App.toast('✓ 已複製到剪貼簿');}); }
    else { prompt('複製以下文字：',txt); }
  }catch(e){}
};
App.wsShare = function(wsId){
  try{
    var root=document.querySelector('[data-ws-id="'+wsId+'"]');
    if(!root) return;
    var title=root.getAttribute('data-ws-title')||'工作紙';
    var lines=[title,''];
    root.querySelectorAll('[data-field-label]').forEach(function(li){
      var lab=li.getAttribute('data-field-label');
      var inp=li.querySelector('input,textarea');
      var v=inp?inp.value.trim():'';
      lines.push(lab+'：'+(v||''));
    });
    var txt=lines.join('\n');
    if(navigator.share){ navigator.share({title:title, text:txt}); }
    else { App.wsCopy(wsId); }
  }catch(e){}
};
App.worksheetHtml = function(w, tid){
  tid = tid || (w.id) || w.title || 'ws';
  var wsId = 'ws-'+tid.replace(/[^a-z0-9]+/gi,'-');
  var saved = App.wsLoad(wsId);
  var html = '<div class="card worksheet" data-ws-id="'+wsId+'" data-ws-title="'+(w.title||'工作紙').replace(/"/g,'&quot;')+'"><h3>'+w.title+'</h3>';
  html += '<p class="mut ws-mobile-hint">📱 深資版：直接喺手機／iPad 填寫，自動儲存喺本機，支援複製／分享，唔使印都得；要印就撳「印本節」。</p>';
  if(w.fields){
    html += '<ul class="bullet ws-fields">'+w.fields.map(function(f,i){
      var lab = f.label || f.name || ('第 '+(i+1)+' 項');
      var ty = f.type || 'text';
      var val = (saved[i]||'').replace(/"/g,'&quot;');
      var h = '';
      if(ty==='textarea'){
        h = '<textarea rows="3" data-idx="'+i+'" oninput="App.wsSave(\''+wsId+'\','+i+',this.value)" placeholder="喺度輸入…">'+(saved[i]||'')+'</textarea>';
      } else if(ty==='check'){
        var chk = saved[i] ? 'checked' : '';
        h = '<label><input type="checkbox" data-idx="'+i+'" '+chk+' onchange="App.wsSave(\''+wsId+'\','+i+',this.checked?\'✓\':\'\')"> 已完成／已檢查</label>';
      } else {
        h = '<input type="text" data-idx="'+i+'" value="'+val+'" oninput="App.wsSave(\''+wsId+'\','+i+',this.value)" placeholder="喺度輸入…">';
      }
      return '<li data-field-label="'+lab.replace(/"/g,'&quot;')+'"><b>'+lab+'</b><div class="ws-input">'+h+'</div></li>';
    }).join('')+'</ul>';
    if(w.footer) html += '<p class="tip">'+w.footer+'</p>';
  } else if(w.prompts){
    html += '<ol class="steps ws-prompts">'+w.prompts.map(function(p,i){
      var val = saved[i]||'';
      return '<li data-field-label="'+('Q'+(i+1)).replace(/"/g,'&quot;')+'"><div>'+p+'</div><div class="ws-input"><textarea rows="2" data-idx="'+i+'" oninput="App.wsSave(\''+wsId+'\','+i+',this.value)" placeholder="喺度輸入你嘅想法…">'+val+'</textarea></div></li>';
    }).join('')+'</ol>';
  }
  html += '<div class="ws-actions no-print"><span id="ws-save-hint-'+wsId+'" class="ws-hint"></span> '
    + '<button onclick="App.wsCopy(\''+wsId+'\')">📋 複製文字</button> '
    + '<button onclick="App.wsShare(\''+wsId+'\')">📤 分享</button> '
    + '<button onclick="App.wsClear(\''+wsId+'\')" class="mut">🗑️ 清除</button></div>';
  html += '<div class="ws-sign">姓名：<input type="text" data-idx="name" style="width:120px" oninput="App.wsSave(\''+wsId+'\',\'name\',this.value)" value="'+(saved['name']||'').replace(/"/g,'&quot;')+'" placeholder="你個名">　旅團：<input type="text" data-idx="troop" style="width:100px" oninput="App.wsSave(\''+wsId+'\',\'troop\',this.value)" value="'+(saved['troop']||'').replace(/"/g,'&quot;')+'" placeholder="旅團">　日期：<input type="date" data-idx="date" oninput="App.wsSave(\''+wsId+'\',\'date\',this.value)" value="'+(saved['date']||'')+'">　執委核對：□</div></div>';
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
  box.innerHTML = '<label class="search-field" for="q-input"><span>🔍 關鍵字</span><input id="q-input" type="search" inputmode="search" autocomplete="off" placeholder="例：儀式 / 急救 / 背囊 / AYP…" value="'+q0.replace(/"/g,'&quot;')+'" oninput="App.searchGo()"></label>'+
    '<p>熱門：<a href="#search/儀式">儀式</a> · <a href="#search/急救">急救</a> · <a href="#search/背囊">背囊</a> · <a href="#search/地圖">地圖</a> · <a href="#search/AYP">AYP</a> · <a href="#search/獎章">獎章</a></p>'+
    '<div id="q-out"><p class="mut">輸入關鍵字即時搵，全站 16 場集會＋遊戲＋獎章＋技能＋儀式＋AYP都搵到。</p></div>';
  wrap.appendChild(box);
  return wrap;
};

/* 📅 集會目錄（整行可撳） */
App.pages.plan = function(){
  var wrap = App.h('div','page plan-page');
  wrap.appendChild(App.h('h1',null,'📅 集會目錄'));
  var guide = App.h('div','role-guide');
  guide.innerHTML = '<div><span class="role-ic">🧭</span><p><b>第一次帶集會</b><br>先揀一場跟程序表做；儀式／制服／手冊係必修知識。</p></div>'+
    '<div><span class="role-ic">⚡</span><p><b>熟手領袖搵料</b><br>心中有想法，直接去下方「素材庫／活動／技能／獎章／AYP」攞料。</p></div>';
  wrap.appendChild(guide);
  wrap.appendChild(App.h('p','lede','16 場完整集會：會員章 c01–c06、肩章・認識 c07–c09、肩章・技能 c10–c16。撳任何一張就開教案。'));

  var filterItems = [
    {k:'all',n:'全部 16 場'}, {k:'member',n:'會員章 c01–06'},
    {k:'know',n:'肩章・認識 c07–09'}, {k:'skill',n:'肩章・技能 c10–16'},
    {k:'special',n:'特別集會'}
  ];
  var filter = App.h('div','plan-filter filters');
  filter.setAttribute('aria-label','篩選集會');
  var result = App.h('p','plan-result','顯示 16 場');

  var table = App.h('table','meeting-table plan-table');
  table.innerHTML = '<thead><tr><th>場次／月份</th><th>主題／對應獎章</th><th>形式</th><th>狀態</th><th><span class="sr-only">開啟</span></th></tr></thead><tbody>' +
    DATA.meetings.map(function(m,idx){
      var tag = m.placeholder ? '<span class="tag wip">🚧 規劃中</span>' : (m.full ? '<span class="tag ok">✓ 完整</span>' : '<span class="tag wip">🚧</span>');
      var spec = m.special ? '<span class="tag sp">特別</span>' : '';
      var stage = idx<6 ? 'member' : (idx<9 ? 'know' : 'skill');
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

  wrap.appendChild(App.h('p','lede','呢度係<strong>深資童軍團</strong>用得到嘅儀式：開禮・禮成・集隊／睇齊／解散・敬禮・升旗・宣誓・支部目的卡。<b>⚠️ 深資團唔設小隊</b>（1970 年起用執行委員會制，自務自治），集隊以全團為單位；<b>亦唔設團呼／齊讀口號</b>，散會後團員自行離開（唔設「等家長接」）。集隊由執委會主席發口令、領袖監禮。<b>進階步操唔喺呢度教</b> —— 原地四轉、行進間轉向／換步、旗操、會操檢閱程序屬訓練班範圍：請上職前／進階訓練班，並對照《步操手冊》第六章（排列隊形）同 2024《隊列和升掛國旗及區旗指引》。實際動作必須由熟悉程序之領袖現場示範。'));
  var ref = App.h('div','callout');
  ref.innerHTML = '📚 <b>本頁內容全部照呢啲官方檔抄錄／整理（唔自創）：</b><ul class="bullet" style="margin:6px 0 0 18px;">' +
    CEREMONY.source.refs.map(function(r){return '<li>'+r+'</li>';}).join('') +
    '<li><a href="https://www.scout.org.hk/uploads/tc/circulars/16450/guidelines-of-chinese-foot-drill-and-national-flag-and-regional-flag-raising.pdf" target="_blank" rel="noopener">《隊列和升掛國旗及區旗指引》（2024 年 6 月版本）PDF——動作要領原文喺呢度</a></li>' +
    '<li><a href="https://drive.google.com/file/d/1F8aZSr_WzRbJCLy7l41iDO2tEUxpKCvE/view?usp=drive_link" target="_blank" rel="noopener">《深資童軍訓練綱要》第十一版 PDF（2026-08-15 生效）</a></li>' +
    '</ul><p class="mut">'+CEREMONY.source.note+'</p>';
  wrap.appendChild(ref);
  var pg = App.sec('⏱ 恆常集會程序（官方套包 8 段・每場照呢個排）', {id:'cer-program'});
  pg._body.innerHTML = '<div class="card"><table class="meeting-table"><thead><tr><th width="8%">#</th><th width="16%">環節</th><th width="12%">時間</th><th>內容（照套包程序表）</th></tr></thead><tbody>'+
    CEREMONY.program.rows.map(function(r){return '<tr><td>'+r[0]+'</td><td><b>'+r[1]+'</b></td><td>'+r[2]+'</td><td>'+r[3]+'</td></tr>';}).join('')+
    '</tbody></table><p class="mut">'+CEREMONY.program.note+'</p></div>';
  wrap.appendChild(pg);
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
  var pendingNote = '';
  if(c.fig || c.dgm){
    body += App.cerFig(c);
  }
  if(c.steps) body += '<ol class="steps">'+c.steps.map(function(st){return '<li><b>'+st.h+'</b>：'+st.d+(st.dgm?App.cerDgm(st.dgm, st.dgmc||st.h):'')+'</li>';}).join('')+'</ol>';
  if(c.types) body += '<ul class="bullet">'+c.types.map(function(t){return '<li><b>'+t.t+'：</b>'+t.d+(t.dgm?App.cerDgm(t.dgm, t.dgmc||t.t):'')+'</li>';}).join('')+'</ul>';
  if(c.when_to_salute) body += '<p><b>使用場合：</b></p><ul class="bullet">'+c.when_to_salute.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
  if(c.safety) body += '<p class="safety"><b>⚠️ 注意：</b>'+c.safety+'</p>';
  if(c.wrong) body += '<div class="callout warn"><b>⚠️ 呢度要避開</b><ul class="bullet">'+c.wrong.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>';
  if(c.check) body += '<p class="mut">📋 對應考核：'+c.check+'</p>';
  if(c.link) body += '<p class="source-note">📚 動作要領原文：<a href="'+c.link+'" target="_blank" rel="noopener">'+c.link.replace(/^https?:\/\//,'')+'</a></p>';
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
  wrap.appendChild(App.h('p','lede','深資童軍支部（陸／海／空）男／女團員制服標準。服式圖：<b>香港童軍總會</b>官方圖（撳「開總會官網原圖」對最新式樣；內容以《儀容與制服手冊》為準）。'));

  var byKey = {};
  UNIFORM.types.forEach(function(t){ byKey[t.k]=t; });
  var BRANCH = {vs_b:'vsland',vs_g:'vsland',vs_g_pants:'vsland',vs_sea_b:'vssea',vs_sea_g:'vssea',vs_sea_g_pants:'vssea',vs_air_b:'vsair',vs_air_g:'vsair',vs_air_g_pants:'vsair'};
  function typeCard(t){
    var rows = t.items.map(function(i){return '<tr><th>'+i[0]+'</th><td>'+i[1]+'</td></tr>';}).join('');
    return '<div class="card uniform-card"><h3>'+t.name+'</h3>'+      '<div class="uniform-visual no-print" style="margin:0 0 8px 0;">'+      '<a href="'+t.img+'" target="_blank" rel="noopener">🖼️ 開總會官網原圖（官方相，對最新式樣）</a>'+      '<small class="mut"> 式樣同章位請照官方相＋《儀容與制服手冊》原文。</small></div>'+      '<table class="uniform-table"><tbody>'+rows+'</tbody></table></div>';  }

  if(cur==='badge'){
    var P2 = UNIFORM.placementV2;
    wrap.appendChild(App.h('p','lede','章位一律照<b>《儀容與制服手冊》</b>原文（第三章 3.2–3.4／3.6–3.8、第四章 4.2–4.4）。要睇佩戴圖請開下面官方檔（手冊本身有佩戴插圖）。'));
    /* 官方《儀容與制服手冊》原圖／原文 PDF（分頁連結）*/
    var manualChunks = [
      ['1–30 頁','1rjD6MvA01eWUVU4b4qf9uSFYczXGMqY5'],['31–60 頁','1BqIREqz8JarW1WbDScXLBnQzr9KvPOnQ'],
      ['61–90 頁','1OenclJV7cifLmknCHDjCIhEOSzu5k1w_'],['91–120 頁','1JrvWJmS5Uj6IC2EPNRH5v1YN5GSEQYLz'],
      ['121–150 頁','1sgh0wjcr9fAaxbltfQE-uluOjNym4pIB'],['151–180 頁','12m8doAX3uZEGZ81Mvf6Fp2Dj_X7X6wwA'],
      ['181–210 頁','1sHG952U73znOwhSnZzoRpO1oSm_xZONG'],['211–224 頁','10iW2mv4V9s95azJ57v8drOja_n4o3Y7y']
    ];
    var mref = App.h('div','callout');
    mref.innerHTML = '📚 <b>《儀容與制服手冊》官方 PDF：</b>'
      + manualChunks.map(function(c){return '<a class="tag" href="https://drive.google.com/file/d/'+c[1]+'/view" target="_blank" rel="noopener">'+c[0]+'</a>';}).join(' ')
      + '<p class="mut" style="margin:6px 0 0;">章位表每一條都標咗手冊頁／節號；圖以手冊本身嘅插圖為準。</p>';
    wrap.appendChild(mref);
    wrap.appendChild(App.block('🎖️ 章位表（照手冊原文・分組）',
      P2.groups.map(function(g){
        return '<div class="card"><h3>'+g.g+'</h3><table class="meeting-table"><thead><tr><th width="30%">邊個章／配件</th><th width="38%">佩戴位置（原文）</th><th>備註／出處</th></tr></thead><tbody>'+          g.rows.map(function(r){return '<tr><td><b>'+r.item+'</b></td><td>'+r.where+'</td><td><small class="mut">'+(r.note||'')+'</small></td></tr>';}).join('')+          '</tbody></table></div>';
      }).join('')+      '<p class="source-note">📚 '+P2.source+'</p>', {id:'uni-places'}));
    wrap.appendChild(App.block('📚 官方檔（連插圖・要對圖就開呢啲）',
      '<div class="card"><ul class="bullet">'+UNIFORM.official.docs.map(function(d){return '<li><a href="'+d.u+'" target="_blank" rel="noopener">'+d.n+'</a></li>';}).join('')+'</ul>'+      '<p class="mut">'+UNIFORM.official.note+'</p></div>', {id:'uni-docs'}));
    wrap.appendChild(App.block('🧍 儀容・附加配件（手冊 3.3／3.8 原文）',
      '<div class="card"><ul class="bullet">'+UNIFORM.grooming.items.map(function(x){return '<li><b>'+x.t+'</b>：'+x.d+'</li>';}).join('')+'</ul>'+      '<p class="source-note">📚 '+UNIFORM.grooming.source+'</p></div>', {id:'uni-groom'}));
    wrap.appendChild(App.h('div','callout warn','⚠️ 考章／領隊提醒：制服不整齊時，禮節上只須立正、不須舉手敬禮（《隊列和升掛國旗及區旗指引》）。所以集會前用「自查清單」逐項執好，唔好靠即時補救。'));
    return wrap;
  }

  if(cur==='acc'){
    var NW = UNIFORM.neckwear, KW = UNIFORM.kilwell, BS = UNIFORM.beltSocks;
      wrap.appendChild(App.h('p','lede','領巾・巾圈・領帶：按《儀容與制服手冊》3.4–3.6。宣誓後才可佩戴；深資童軍一般集會戴旅巾＋童軍巾圈，正式場合打領帶（陸＝棗紅、海＝黑、空＝深藍）。'));
    wrap.appendChild(App.block('🔑 四條通則',
      '<div class="card"><ul class="bullet">'+NW.rules.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>'));
    wrap.appendChild(App.block('🧣 領巾 4 種（邊個戴）',
      '<div class="card"><ul class="bullet">'+NW.scarves.map(function(x){return '<li><b>'+x.n+'</b>：'+x.d+'</li>';}).join('')+'</ul></div>'));
    wrap.appendChild(App.block('🔘 巾圈 4 種',
      '<div class="card"><ul class="bullet">'+NW.rings.map(function(x){return '<li><b>'+x.n+'</b>：'+x.who+'</li>';}).join('')+'</ul>'
      +'<p class="mut">'+NW.ringsOther+'</p></div>'));
    wrap.appendChild(App.block('🧣 領巾點戴（捲巾 8 步＋規格）',
      '<div class="card"><ol class="steps">'+NW.wear.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol></div>'));
    wrap.appendChild(App.block('👔 領帶 4 色＋佩戴',
      '<div class="card"><ul class="bullet">'+NW.ties.map(function(x){return '<li><b>'+x.n+'</b>：'+x.who+'</li>';}).join('')+'</ul>'+      '<ol class="steps">'+NW.tieWear.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol></div>'));
    wrap.appendChild(App.block('🪵 基維爾巾圈・基維爾領巾・木章（成年成員對照）',
      '<div class="card"><ul class="bullet">'+KW.points.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>'+      '<p class="mut">'+KW.note+'</p>'+      '<ul class="bullet">'+KW.wear.map(function(x){return '<li><b>'+x.t+'</b>：'+x.d+'</li>';}).join('')+'</ul></div>'));
    wrap.appendChild(App.block('👖 皮帶・皮鞋・襪（按第三章原文）',
      '<div class="card"><ul class="bullet">'+BS.items.map(function(x){return '<li><b>'+x.n+'</b>：'+x.d+'</li>';}).join('')+'</ul><p class="mut">'+BS.source+'</p></div>'));
    // 毛衣（3.7）＋附加配件（3.8）
    if(UNIFORM.sweater){
      var SW = UNIFORM.sweater;
      wrap.appendChild(App.block('🧶 制服毛衣（冬天／體質需要）',
        '<div class="card"><ul class="bullet">'+SW.items.map(function(x){return '<li><b>'+x.n+'</b>：'+x.d+'</li>';}).join('')+'</ul><p class="mut">'+SW.source+'</p></div>'));
    }
    if(UNIFORM.extras){
      var EX = UNIFORM.extras;
      wrap.appendChild(App.block('🎒 附加配件（名牌／眼鏡／手錶／腰包）',
        '<div class="card"><ul class="bullet">'+EX.items.map(function(x){return '<li><b>'+x.n+'</b>：'+x.d+'</li>';}).join('')+'</ul><p class="mut">'+EX.source+'</p></div>'));
    }
    // 領帶制服（官方手冊第二章 49 頁）
    if(UNIFORM.tieUniform){
      var TU = UNIFORM.tieUniform;
      var tuHtml = '<div class="card"><p>'+TU.note+'</p><table class="meeting-table"><thead><tr><th>支部</th><th>領帶</th><th>男團員</th><th>女團員</th></tr></thead><tbody>'
        + TU.types.map(function(x){return '<tr><td>'+x.branch+'</td><td>'+x.tie+'</td><td>'+x.male+'</td><td>'+x.female+'</td></tr>';}).join('')
        + '</tbody></table><ul class="bullet">'+TU.wear.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>';
      wrap.appendChild(App.block('👔 深資童軍領帶制服（典禮／會議）', tuHtml, {id:'uni-tie'}));
    }
    var CP = UNIFORM.cap;
    wrap.appendChild(App.block('🧢 制服帽佩戴（帽章・帽邊・髮式）',
      '<div class="card"><ul class="bullet">'+CP.points.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>'+      '<p class="mut">'+CP.hard+'</p><p class="mut">'+CP.sea+'</p></div>'+      '<div class="card"><h4>髮式（戴帽期間）</h4><ul class="bullet">'+CP.hair.map(function(x){return '<li><b>'+x.t+'</b>：'+x.d+'</li>';}).join('')+'</ul></div>'));
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
    wrap.appendChild(App.block('🧣 旅巾規格（照手冊 3.4，唔使睇圖）',
      '<div class="card"><p>捲巾：由巾底捲向巾尖，捲好直徑約 <b>3.5cm</b>（與衣領高度相若）；巾底至巾尖約 <b>12–15cm</b>；巾圈套牢喺<b>衣領尖</b>位置；巾尖放<b>恤衫背後中央</b>；巾尾喺肚臍附近、<b>唔可以超越皮帶扣</b>；兩邊線條圖案對稱、長度相等。</p></div>'));
    wrap.appendChild(App.block('✅ 制服自查清單（每次集會前）', cl));
    return wrap;
  }
  var br = UNIFORM.branches.find(function(b){return b.k===cur;}) || UNIFORM.branches[0];
  wrap.appendChild(App.h('div','callout','<b>'+br.ic+' '+br.n+'制服要點：</b>'+br.note));
  br.types.forEach(function(tk){ wrap.appendChild(App.h('div','', typeCard(byKey[tk]))); });
  wrap.appendChild(App.h('div','callout','🧣 三組共通：旅巾＋巾圈、徽章佩戴位置、領巾領帶規格、集會前自查清單。<br>🛒 制服同配件一律以 <a href="'+UNIFORM.shop.url+'" target="_blank" rel="noopener">'+UNIFORM.shop.name+'</a> 供應者為標準（手冊 3.1）；3.7 制服毛衣同 3.8 附加配件唔喺 app 詳列，有需要到供應社查詢。'));
  return wrap;
};

/* 📖 手冊（小分頁：誓詞／執委會制度／工具／考章／參考） */
App.pages.book = function(sub){
  var wrap = App.h('div','page');
  wrap.appendChild(App.h('h1',null,'📖 手冊'));
  var subs = [
    {k:'promise',ic:'⚜️',n:'誓詞規律銘言'},
    {k:'exec',ic:'🧑‍🤝‍🧑',n:'執委會制度'},
    {k:'tools',ic:'⚠️',n:'重要須知'},
    {k:'apply',ic:'🎖️',n:'考章安排'},
    {k:'course',ic:'📚',n:'報考訓練班'},
    {k:'ayp',ic:'🌟',n:'AYP領袖指南'},
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
    ul2.innerHTML = '<li>'+DATA.facts.motto+'</li>';
    wrap.appendChild(App.sec('🎯 童軍銘言').add(ul2));
    wrap.appendChild(App.block('🏕️ 支部基本資料',
      '<p>年齡：'+DATA.facts.age+'</p><p>教育目標：'+DATA.facts.goal+'</p><p>敬禮：'+DATA.facts.salute+'</p><p>支部組織：'+DATA.facts.exec+'</p>'));
    return wrap;
  }

  if(cur==='exec'){
      wrap.appendChild(App.block('📋 執委會制度說明',
      '<p>'+DATA.facts.exec+'</p>'+
      '<ul class="bullet"><li><b>主席</b>：主持會議、對外代表、統籌全局（c07–c08）。</li>'+
      '<li><b>副主席</b>：主席唔喺度就頂上；平時跟進專責項目。</li>'+
      '<li><b>秘書</b>：議程、會議記錄、文件往來。</li>'+
      '<li><b>司庫</b>：團費、活動預算、核數。</li>'+
      '<li><b>康樂／總務</b>：活動氣氛、物資場地——職位由團員大會決定。</li>'+
      '<li><b>執委會會議</b>：策劃活動、管理團務——c08 列席實習。</li></ul>'));
    wrap.appendChild(App.block('⭐ 執委 3 大職責',
      '<ol class="steps"><li><b>做事</b>——策劃、執行、跟進，唔好齋講。</li><li><b>開會</b>——主持／參與執委會會議（c08 程序）。</li><li><b>帶頭</b>——自己做到先叫人做。</li></ol>'+
      '<p>記住：執委唔係官，係做嘢——做得差，下次冇人選你。</p>'));
    wrap.appendChild(App.block('📝 執委會會議記錄表（可列印）',
      '<table class="meeting-table"><tbody>'+
      '<tr><th width="90">日期</th><td>______年____月____日</td><th width="90">主席</th><td>__________</td></tr>'+
      '<tr><th>記錄</th><td>__________</td><th>出席</th><td>____ / ____ 人</td></tr>'+
      '<tr><th>議題一</th><td colspan="3">____________________<br>決議：____________________</td></tr>'+
      '<tr><th>議題二</th><td colspan="3">____________________<br>決議：____________________</td></tr>'+
      '<tr><th>分工</th><td colspan="3">邊個：__________ 做咩：__________ 幾時完成：__________</td></tr>'+
      '<tr><th>下次開會</th><td colspan="3">______年____月____日</td></tr>'+
      '</tbody></table>'));
    return wrap;
  }

  if(cur==='tools'){
    var sImp = App.sec('⚠️ 深資童軍重要須知與資格界線', {print:true, proj:false});
    sImp._body.innerHTML =
      '<div class="card" style="border-left:5px solid #C62828;background:#FFEBEE;">'+
      '<h3 style="color:#B71C1C;margin-top:0;">🛑 深資童軍職級限制（官方 P.O.R. 與訓練綱要核心規則）</h3>'+
      '<div class="callout warn" style="background:#fff;border-color:#D32F2F;font-size:15px;line-height:1.6;">'+
      '<p><b>⚠️ 深資童軍（15–20 歲）絕對不能擔任童軍領袖（Scout Leader / VSL / SL 等）！</b></p>'+
      '<ul class="bullet">'+
      '<li><b>身分界線</b>：深資童軍為<strong>青少年成員（Youth Member）</strong>，而非成年領袖（Adult Leader）。按香港童軍總會政策及規條（P.O.R.），領袖委任年齡起點為 20 歲（或特定職級 21 歲）；深資童軍身分持續至滿 21 歲生日止。</li>'+
      '<li><b>最高指導身分 —— 教練員（Instructor）</b>：深資童軍若具備特定專長（如露營、先鋒工程、地圖導航、急救等），經團長推薦及區總監核准，<strong>最多只可以獲委任為「教練員」（Instructor）</strong>，在領袖督導下協助指導幼童軍或童軍支部之技能訓練，不得行使童軍領袖之法定管轄職權。</li>'+
      '<li><b>自務自治不等於領袖職權</b>：深資團內推行「執委會制度（EC）」，由團員互選主席、秘書、司庫等管理團務，此乃支部青年自治實踐，絕非總會體制之領袖階層。深資團集會必須有合資格成年領袖（VSL / AVSL）在場督導與負責法定安全監護責任。</li>'+
      '</ul></div>'+
      '<div style="margin-top:14px;background:#fff;padding:12px;border-radius:6px;border:1px solid #FFCDD2;">'+
      '<b>📚 官方資料索引：</b>'+
      '<ul class="bullet" style="margin:4px 0 0 18px;">'+
      '<li>香港童軍總會《政策、組織及規條》（P.O.R.）第 2 章、第 4 章成員及領袖資格。</li>'+
      '<li>《深資童軍訓練綱要》：深資童軍之訓練定位與服務指導原則。</li>'+
      '</ul></div>'+
      '</div>';
    wrap.appendChild(sImp);
    return wrap;
  }

  if(cur==='apply'){
    wrap.appendChild(App.h('div','callout ok-callout','🏕️ '+INTERESTS.howToApply.troopNote));
    var ol3 = App.h('ol','steps');
    ol3.innerHTML = INTERESTS.howToApply.steps.map(function(s){
      return '<li><b>'+s.t+'</b>：'+s.d+'</li>';
    }).join('');
    wrap.appendChild(App.sec('🎖️ 如何考取會員章／肩章（團內考核）').add(ol3));
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

  if(cur==='ayp'){
    var L = AYP.leader;
    wrap.appendChild(App.h('p','lede','新領袖必修：AYP 係乜、團員點參加、領袖點參與、旅團點成立執行處支部。三級數字＋五科詳情去下方 <a href="#ayp">🌟 AYP</a> 查。'));
    wrap.appendChild(App.block('🌟 什麼是 AYP（三句話）', '<ul class="tight">'+L.what.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ul>', {print:true}));
    wrap.appendChild(App.block('🧒 團員如何參加（領袖幫手 5 步）', '<ol class="tight">'+L.joinMember.map(function(x){return '<li><b>'+x.t+'</b>：'+x.d+'</li>';}).join('')+'</ol>', {print:true}));
    wrap.appendChild(App.block('🧑‍🏫 領袖如何參與（三種角色）', L.joinLeader.map(function(x){return '<p><b>'+x.t+'</b>：'+x.d+'</p>';}).join(''), {print:true}));
    wrap.appendChild(App.block('🏕️ 如何成立童軍執行處支部', '<ol class="tight">'+L.setup.map(function(x){return '<li><b>'+x.t+'</b>：'+x.d+'</li>';}).join('')+'</ol><p class="tip">💡 '+L.setupNote+'</p>', {print:true}));
    var ldocs = L.links.map(function(d){return '<li><a class="external-link" href="'+d.url+'" target="_blank" rel="noopener">🔗 '+d.n+'</a>（'+d.d+'）</li>';}).join('');
    wrap.appendChild(App.block('🔗 官方文件', '<ul class="tight">'+ldocs+'</ul>', {print:false}));
    return wrap;
  }

  var ul3 = App.h('ul','bullet');
  ul3.innerHTML = '<li><a href="'+DATA.source.url+'" target="_blank" rel="noopener">《深資童軍訓練綱要》網上版（深資支部）</a></li>'+
    '<li><a href="'+EXTERNAL.officialPack+'" target="_blank" rel="noopener">官方集會套包 2026-09-01 版 PDF</a></li>'+
    '<li><a href="'+EXTERNAL.circulars+'" target="_blank" rel="noopener">📚 通告圖書館（訓練班／活動通告＋推送訂閱）</a></li>'+
    '<li><a href="'+EXTERNAL.vsbadge+'" target="_blank" rel="noopener">🎖️ 深資童軍進度追蹤</a></li>'+
    '<li><a href="'+EXTERNAL.ecportal+'" target="_blank" rel="noopener">🧑‍💼 執委會管理（ecportal・自務自治）</a></li>'+
    '<li><a href="'+EXTERNAL.aypGuide+'" target="_blank" rel="noopener">🌟 AYP 童軍接駁指南（領袖轉給團員）</a></li>'+
    '<li><a href="'+EXTERNAL.upgradeGuide+'" target="_blank" rel="noopener">⬆️ 升團準備指南（制服＋升團過渡）</a></li>'+
    '<li><a href="#book/tools">🎮 聚會互動 MINI GAME（內建集會工具・隨開即玩）</a></li>';
  wrap.appendChild(App.sec('🔗 參考資料').add(ul3));
  return wrap;
};

/* ✂️ 素材庫：即搵即印／即投屏 */
App.printCat = '';
/* v43：聚會 GAME 互動庫 ＝ ①互動工具（離線小遊戲）②集會遊戲卡（DATA.games 可以即場用）③即印即用素材
   用戶指正：唔可以只剩標題——每個分頁都要有真內容，而且係「揀一項塞入集會」嘅單項項目。 */
App.printCats = [
  {k:'tools', ic:'🎮', n:'互動遊戲工具'},
  {k:'games', ic:'🎲', n:'集會遊戲卡（'+DATA.games.length+' 個）'},
  {k:'ws',    ic:'📝', n:'集會工作紙（現成 5 張）'},
  {k:'sheet', ic:'🖨️', n:'即印即用素材'}
];
App.pages.print = function(){
  var wrap = App.h('div','page');
  wrap.appendChild(App.h('h1',null,'🎮 聚會 GAME 互動庫'));
  wrap.appendChild(App.h('p','lede','呢頁係<b>即場用得嘅遊戲同素材</b>：① 互動遊戲工具（離線・可投屏）② 官方套包嘅集會遊戲卡（有玩法、物資、安全）③ 16 場集會工作紙 ④ 即印素材（急救卡／誓詞卡／收繩／國歌歌紙）。揀一項就塞得入集會，唔需要由零設計。'));
  var cats = App.printCats;
  if (!App.printCat || !cats.some(function(c){return c.k===App.printCat;})) App.printCat = cats[0].k;
  var host = App.h('div','print-host');
  function draw(){
    host.innerHTML = '';
    try { host.appendChild(App.printPanel(App.printCat)); }
    catch(e){ host.innerHTML = '<div class="callout warn">⚠️ 呢一版出錯：'+(e&&e.message?e.message:e)+'</div>'; }
  }
  wrap.appendChild(App.filterbar(cats, App.printCat, function(k){
    App.printCat = k;
    draw();
  }));
  draw();
  wrap.appendChild(host);
  return wrap;
};

/* 每一類嘅內容 */
App.printPanel = function(cat){
  var box = App.h('div','');

  /* ── ① 互動遊戲工具（全部離線、可投屏）── */
  if (cat === 'tools') {
    box.innerHTML = '<div class="callout ok-callout" style="margin-bottom:14px;background:#E8F5E9;border-left:5px solid #2E7D32;">'
      + '<h3 style="margin:0 0 6px 0;color:#1B5E20;">🎮 聚會互動遊戲工具（4 個・離線可用・可投大螢幕）</h3>'
      + '<p style="margin:0;font-size:14px;">開會即用，唔需要上網。領袖用手機操作，撳每個工具下面嘅「🖥️ 投影大螢幕」就投到電視／投影機。</p>'
      + '</div>'
      + '<div class="card"><h3>🕵️ 誰是臥底（領袖主持・一次過派卡）</h3><div id="mg-spy-box"></div></div>'
      + '<div class="card"><h3>🕴️ 機密特務（5×5 猜詞）</h3><div id="mg-agent-box"></div></div>'
      + '<div class="card"><h3>🎲 骰子（大話骰／遮擋模式）</h3><div id="mg-dice-box"></div></div>'
      + '<div class="card"><h3>🎡 幸運轉盤（自訂任務）</h3><div id="mg-wheel-box"></div></div>';
    setTimeout(function(){ if(typeof MiniGame!=='undefined' && MiniGame.mount) MiniGame.mount(); }, 60);
    return box;
  }

  /* ── ② 集會遊戲卡（DATA.games，逐個可以即場用）── */
  if (cat === 'games') {
    var cats = App.catsOfGames();
    var filt = App.h('div','filters game-filt'); filt.setAttribute('role','tablist');
    [{k:'all',n:'全部（'+DATA.games.length+'）'}].concat(cats.map(function(c){return {k:c,n:c};})).forEach(function(b,i){
      var btn = App.h('button','filter-btn'+(i===0?' active':''), b.n);
      btn.setAttribute('data-cat', b.k); btn.setAttribute('role','tab');
      btn.onclick = function(){
        Array.prototype.forEach.call(box.querySelectorAll('.game-card'), function(card){
          var on = (b.k==='all' || card.getAttribute('data-cat')===b.k);
          if(card.classList) card.classList.toggle('hidden', !on); else card.style.display = on?'':'none';
        });
        Array.prototype.forEach.call(filt.querySelectorAll('.filter-btn'), function(x){ if(x.classList) x.classList.remove('active'); });
        if(btn.classList) btn.classList.add('active');
      };
      filt.appendChild(btn);
    });
    box.appendChild(filt);
    DATA.games.forEach(function(g){
      var card = App.h('div','card game-card');
      card.setAttribute('data-cat', g.cat);
      card.setAttribute('data-title','遊戲 '+g.n);
      var gk = (typeof GAME_FIG!=='undefined') ? (GAME_FIG[g.n]||'') : '';
      var gcap = (gk && typeof FIGS!=='undefined' && FIGS[gk]) ? FIGS[gk].cap : '場地擺位圖（俯視）・照圖設場就得';
      card.innerHTML = '<h3>🎲 '+g.n+' <span class="tag">'+g.cat+'</span> <span class="tag">'+g.minutes+'分鐘</span></h3>'
        + '<p class="mut"><b>人數：</b>'+g.people+' &nbsp; <b>物資：</b>'+g.mats+'</p>'
        + '<p>'+g.desc+'</p>' + App.ph(gk, gcap, '')
        + '<h4>▶ 玩法（照住做）</h4><ol class="steps">'+g.steps.map(function(st){return '<li>'+st+'</li>';}).join('')+'</ol>'
        + (g.tips?'<p class="tip">💡 '+g.tips+'</p>':'')
        + (g.safety?'<p class="safety"><b>⚠️ 安全：</b>'+g.safety+'</p>':'')
        + '<p class="card-actions"><button class="print-btn" onclick="App.printSec(this.closest(\'div.game-card\'))">🖨️ 只印呢個</button> '
        + '<button class="proj-btn" onclick="App.projSec(this.closest(\'div.game-card\'))">🖥️ 投講解</button></p>';
      box.appendChild(card);
    });
    return box;
  }

  /* ── ③ 集會工作紙（16 場・逐張印／逐張投）── */
  if (cat === 'ws') {
    var box2 = App.h('div','');
    box2.innerHTML = '<div class="callout" style="margin-bottom:12px;">📝 <b>現成工作紙 5 張</b>（c08 列席觀察表／c10 急救 5 式／c12 定向打卡表／c15 露營計劃書＋菜單／c16 露營檢討表）。其他場次以討論、實作同策劃為主，冇預設工作紙——想加就由教練按教案自己出。每張都可以「只印呢張」或「投呢張」。</div>';
    [{k:'會員章 c01–c06', from:0, to:6},{k:'肩章・認識 c07–c09', from:6, to:9},
     {k:'肩章・技能 c10–c16', from:9, to:16}].forEach(function(g){
      var list = DATA.meetings.slice(g.from,g.to).filter(function(m){return m.data && m.data.worksheet;});
      if (!list.length) return;
      var grp = App.h('div','ws-group-block');
      grp.innerHTML = '<h3 class="ws-group">'+g.k+'</h3>'+list.map(function(m){
        var aud = (m.data.worksheet.audience==='leader') ? '（領袖用）' : '（成員用 A4）';
        return '<div class="ws-item" data-title="'+m.tid+' 工作紙">'
          + '<div class="ws-head"><b>'+m.tid+aud+'</b><span class="mut"> '+m.n+'</span> '
          + '<a class="mut ws-goto" href="#plan/'+m.tid+'">睇完整教案 ↗</a>'
          + '<button class="print-btn" onclick="App.printSec(this.closest(\'div.ws-item\'))">🖨️ 只印呢張</button>'
          + '<button class="proj-btn" onclick="App.projSec(this.closest(\'div.ws-item\'))">🖥️ 投呢張</button></div>'
          + App.worksheetHtml(m.data.worksheet, m.tid)
          + '</div>';
      }).join('');
      box2.appendChild(grp);
    });
    return box2;
  }

  /* ── ④ 即印即用素材 ── */
  if (cat === 'sheet') {
    var html = '<div class="callout" style="margin-bottom:12px;">🖨️ 呢度嘅卡可以直接印（A4）或者投屏。印出嚟放急救箱、貼壁報、或者做集會嘅「手上卡」都得。</div>';

    /* 急救卡 6 張 */
    html += '<h3 class="ws-group">🩹 急救卡（5 種受傷＋復原臥式）</h3>';
    var aidList = (typeof C10!=='undefined' && C10.firstaid) ? C10.firstaid : [];
    aidList.forEach(function(f){
      html += '<div class="aid-wrap" data-title="急救卡 '+f.n+'">'+App.aidCard(f.n, f.how, f.warn)
        + '<p class="aid-ops"><button class="print-btn" onclick="App.printSec(this.closest(\'div.aid-wrap\'))">🖨️ 只印呢張</button> '
        + '<button class="proj-btn" onclick="App.projSec(this.closest(\'div.aid-wrap\'))">🖥️ 投呢張</button></p></div>';
    });
    html += '<div class="aid-wrap" data-title="急救卡 復原臥式">'
      + App.aidCard('復原臥式','唔醒但有呼吸：側臥，頭微向下、上膝屈前、上手放前面，防嘔吐物鯁親；轉身前後都要睇呼吸','呼吸唔正常即打 999；跟有急救證書嘅領袖做')
      + '<p class="aid-ops"><button class="print-btn" onclick="App.printSec(this.closest(\'div.aid-wrap\'))">🖨️ 只印呢張</button> '
      + '<button class="proj-btn" onclick="App.projSec(this.closest(\'div.aid-wrap\'))">🖥️ 投呢張</button></p></div>';

    /* 誓詞・規律・銘言 */
    html += '<h3 class="ws-group">⚜️ 誓詞・規律・銘言卡</h3><div class="ws-item" data-title="誓詞規律銘言卡"><div class="card">'
      + '<h3>童軍誓詞</h3><ol class="promise">'+DATA.facts.promise.map(function(l){return '<li>'+l+'</li>';}).join('')+'</ol>'
      + '<h3>童軍規律（七條）</h3><ul class="bullet">'+DATA.facts.law.map(function(l){return '<li>'+l+'</li>';}).join('')+'</ul>'
      + '<h3>童軍銘言</h3><p class="motto">準備（Be Prepared）</p></div>'
      + '<p class="aid-ops"><button class="print-btn" onclick="App.printSec(this.closest(\'div.ws-item\'))">🖨️ 只印呢張</button> '
      + '<button class="proj-btn" onclick="App.projSec(this.closest(\'div.ws-item\'))">🖥️ 投呢張</button></p></div>';

    /* 收繩保養 */
    var rc = (typeof C14!=='undefined' && C14.ropeCare) ? C14.ropeCare : null;
    if(rc){
      html += '<h3 class="ws-group">🧵 收繩保養卡</h3><div class="ws-item" data-title="收繩保養卡"><div class="card">'
        + '<p><b>收法：</b>'+rc.coil+'</p><ul class="bullet">'+rc.care.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>'
        + App.ph('skill-ropecare', (FIGS&&FIGS['skill-ropecare']?FIGS['skill-ropecare'].cap:''), '')
        + '</div><p class="aid-ops"><button class="print-btn" onclick="App.printSec(this.closest(\'div.ws-item\'))">🖨️ 只印呢張</button> '
        + '<button class="proj-btn" onclick="App.projSec(this.closest(\'div.ws-item\'))">🖥️ 投呢張</button></p></div>';
    }

    /* 國歌升旗歌紙 */
    html += '<h3 class="ws-group">🇨🇳 國歌《義勇軍進行曲》・升旗禮儀歌紙</h3><div class="ws-item" data-title="國歌升旗歌紙"><div class="card">'
      + '<ul class="bullet"><li><b>場合</b>：升旗禮、大型典禮——全體肅立，面向國旗。</li>'
      + '<li><b>禮儀</b>：制服整齊；領隊或單獨一人舉手敬禮，已列隊團員立正；穿便服只肅立。</li>'
      + '<li><b>程序</b>：掛旗固緊→升旗→奏唱國歌（敬禮）→禮畢→降旗（旗不可觸地）→摺好入袋。</li></ul>'
      + '<h3>歌詞</h3><p>起來！不願做奴隸的人們！把我們的血肉，築成我們新的長城！中華民族到了最危險的時候，每個人被迫着發出最後的吼聲。起來！起來！起來！我們萬眾一心，冒着敵人的炮火，前進！冒着敵人的炮火，前進！前進！前進！進！</p></div>'
      + '<p class="aid-ops"><button class="print-btn" onclick="App.printSec(this.closest(\'div.ws-item\'))">🖨️ 只印呢張</button> '
      + '<button class="proj-btn" onclick="App.projSec(this.closest(\'div.ws-item\'))">🖥️ 投呢張</button></p></div>';

    box.innerHTML = html;
    return box;
  }

  return box;
};

App.catsOfGames = function(){
  var cats = [];
  DATA.games.forEach(function(g){ if(cats.indexOf(g.cat)<0) cats.push(g.cat); });
  return cats;
};

/* 🎮 活動（v43：單項活動項目庫 —— 領袖揀一項塞入集會，唔係集會目錄副本） */
App.itemCard = function(x, kind){
  var card = App.h('div','card item-card');
  card.setAttribute('data-cat', x.cat);
  card.setAttribute('data-title', (kind==='skill'?'技能 ':'活動 ')+x.n);
  var h = '<h3>'+x.ic+' '+x.n+' <span class="tag">'+x.cat+'</span> <span class="tag">'+x.mins+'</span>'+(kind==='skill'&&x.meet?' <a class="tag meet" href="#plan/'+x.meet+'">📅 '+x.meet+' 教案</a>':'')+'</h3>';
  if(x.goal) h += '<p class="item-goal">🎯 '+x.goal+'</p>';
  h += '<p class="mut"><b>人數：</b>'+x.people+(x.mats?' &nbsp; <b>物資：</b>'+x.mats:'')+'</p>';
  if(x.fig) h += App.ph(x.fig, (FIGS&&FIGS[x.fig]?FIGS[x.fig].cap:''), '');
  if(x.points) h += '<h4>📌 要點（照住教）</h4><ul class="bullet">'+x.points.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ul>';
  if(x.flow) h += '<h4>▶ 流程（照住做）</h4><ol class="steps">'+x.flow.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ol>';
  if(x.demo) h += '<h4>🛠 示範／帶法</h4><ol class="steps">'+x.demo.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ol>';
  if(x.check) h += '<h4>✅ 完成標準／檢查</h4><ul class="bullet checklist">'+x.check.map(function(t){return '<li>☐ '+t+'</li>';}).join('')+'</ul>';
  if(x.wrong) h += '<div class="callout warn"><b>⚠️ 常見錯</b><ul class="bullet">'+x.wrong.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ul></div>';
  if(x.safety) h += '<p class="safety"><b>⚠️ 安全：</b>'+x.safety+'</p>';
  if(x.badge) h += '<p class="source-note">🎖️ 對應綱要：'+x.badge+'　<a href="#badges">獎章查閱 →</a></p>';
  h += '<p class="card-actions"><button class="print-btn" onclick="App.printSec(this.closest(\'div.item-card\'))">🖨️ 只印呢張</button> '
    + '<button class="proj-btn" onclick="App.projSec(this.closest(\'div.item-card\'))">🖥️ 投呢張</button></p>';
  card.innerHTML = h;
  return card;
};
App.filterItems = function(wrap, filt, all, show){
  Array.prototype.forEach.call(filt.querySelectorAll('.filter-btn'), function(x){ if(x.classList) x.classList.remove('active'); x.setAttribute('aria-selected','false'); });
  show.setAttribute('aria-selected','true'); if(show.classList) show.classList.add('active');
  var cat = show.getAttribute('data-cat');
  Array.prototype.forEach.call(wrap.querySelectorAll('.item-card'), function(card){
    var on = (cat==='all' || card.getAttribute('data-cat')===cat);
    if(card.classList) card.classList.toggle('hidden', !on); else card.style.display = on?'':'none';
  });
  filt.setAttribute('data-cat', cat);
};
App.pages.play = function(){
  var wrap = App.h('div','page');
  wrap.appendChild(App.h('h1',null,'🎮 活動（即插即用單項）'));
  wrap.appendChild(App.h('p','lede','呢頁係<b>單項活動庫</b>：領袖想搵啲題目填充入集會，就由呢度揀一項——每項有目的、流程、人手、物資、帶法、安全同對應獎章。揀好就按「🖨️ 只印呢張」帶入集會，或者按「🖥️ 投呢張」同團員講。<b>想搵遊戲</b>（破冰／隊際小品）去「🎮 聚會GAME」；<b>想搵技能</b>去「🪢 技能」。'));
  var cats = ITEMS.cats(ITEMS.activities);
  var filt = App.h('div','filters'); filt.setAttribute('role','tablist');
  [{k:'all',n:'全部'}].concat(cats.map(function(c){return {k:c,n:c};})).forEach(function(b,i){
    var btn = App.h('button','filter-btn'+(i===0?' active':''), b.n);
    btn.setAttribute('data-cat', b.k); btn.setAttribute('role','tab'); btn.setAttribute('aria-selected', i===0?'true':'false');
    btn.onclick = function(){ App.filterItems(wrap, filt, ITEMS.activities, btn); };
    filt.appendChild(btn);
  });
  wrap.appendChild(filt);
  var note = App.h('div','callout');
  note.innerHTML = '🧩 <b>點塞入集會？</b>套包恆常集會嘅「遊戲 20′」／「課程 15′＋15′」／「宣布 5′」三段，就係用嚟放呢啲項目：短活動（30–60 分鐘）放遊戲段或課程段；大項目（服務日、露營、比賽）就用成次集會或幾次集會去做，並且要先寫計劃書。';
  wrap.appendChild(note);
  ITEMS.activities.forEach(function(x){ wrap.appendChild(App.itemCard(x,'activity')); });
  return wrap;
};

/* 🪢 技能（v43：單項技能卡 —— 有內容，唔係只連返教案） */
App.pages.skills = function(sub){
  var wrap = App.h('div','page');
  wrap.appendChild(App.h('h1',null,'🪢 技能（單項技能卡）'));
  var cats = ITEMS.cats(ITEMS.skills);
  var SKUBS = [{k:'all',ic:'📚',n:'全部技能'}].concat(cats.map(function(c){return {k:c,ic:'🔧',n:c};}))
    .concat([{k:'badge',ic:'🎖️',n:'肩章對照'}]);
  var cur = (sub && SKUBS.some(function(x){return x.k===sub;})) ? sub : 'all';
  wrap.appendChild(App.subnav('skills', SKUBS, cur));
  wrap.appendChild(App.h('p','lede','每張卡＝<b>一個可以獨立教嘅技能項目</b>：要點、示範步驟、檢查標準、常見錯、安全都齊。領袖揀一張就可以塞入「課程段」，唔需要跟足某一場教案。<b>圖只作位置／動作示意</b>；繩結、承重、刀／爐／火呢類一定要由合資格人士現場示範。'));

  if(cur==='badge'){
    var SK = [
      { k:'camp', ic:'🏕️', n:'露營（7 項）', badge:'s-skill-camp', lessons:['c15','c16'],
        intro:'兩日一夜露營係肩章（二）嘅主考核場：策劃、分工、物資、營幕、爐具刀具、煮食、執包，全部要「做到＋講到」。' },
      { k:'knot', ic:'🪢', n:'繩結（9 個）', badge:'s-skill-knot', lessons:['c13','c14'],
        intro:'平結、接繩結、八字結、雙套結、稱人結、繫木結、四方編結、十字編結、八字編結。深資要求唔止識打，係識教＋識檢查＋識講用途同限制。' },
      { k:'hike', ic:'🧭', n:'遠足（2 項）', badge:'s-skill-hike', lessons:['c11','c12'],
        intro:'地圖與圖例（含本港地圖）、指南針運用與定向。進階嘅「深資童軍地圖閱讀訓練班／遠足訓練班」屬戶外探險段章前置，要經區／地域班報讀，唔係團內自己考。' },
      { k:'aid', ic:'🩹', n:'急救（3 項）', badge:'s-skill-aid', lessons:['c10'],
        intro:'急救目的與原則、出血與包紮、休克／復原臥式／燒燙傷／抽筋／扭傷。⚠️ 團內教學唔取代認可急救課程（社會服務段章選修(I) 要 30 小時課程證書）。' }
    ];
    function badgeCard(bk){
      var b = (typeof INTERESTS!=='undefined' && INTERESTS.byKey) ? INTERESTS.byKey[bk] : null;
      if(!b) return '';
      return '<div class="card"><h3>'+b.zh+'</h3>'
        + '<h4>📋 官方要求（第十一版）</h4><ol class="req-list">'+b.req.map(function(r){return '<li>'+r+'</li>';}).join('')+'</ol>'
        + '<h4>💡 團內考核建議</h4><ul class="sug-list">'+b.suggest.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>'
        + '<p class="source-note">查要求用<a href="#badges">🎖️ 獎章查閱</a>（只查不記）；出席／考核記錄用團內紀錄冊。</p></div>';
    }
    function lessonLinks(arr){ return arr.map(function(x){ return '<a class="tag meet" href="#plan/'+x+'">📅 '+x+'</a>'; }).join(' '); }
    SK.forEach(function(x){
      wrap.appendChild(App.block(x.ic+' '+x.n, '<div class="card"><p>'+x.intro+'</p><p>'+lessonLinks(x.lessons)+'</p></div>'+badgeCard(x.badge), {id:'sk-'+x.k}));
    });
    wrap.appendChild(App.h('div','callout','📌 肩章（二）嘅四類要求要用上面啲技能卡操熟：每張卡嘅「完成標準」就係主考人會睇嘅嘢。'));
    return wrap;
  }

  var filt = App.h('div','filters'); filt.setAttribute('role','tablist');
  [{k:'all',n:'全部'}].concat(cats.map(function(c){return {k:c,n:c};})).forEach(function(b,i){
    var btn = App.h('button','filter-btn'+(i===0?' active':''), b.n);
    btn.setAttribute('data-cat', b.k); btn.setAttribute('role','tab'); btn.setAttribute('aria-selected', i===0?'true':'false');
    btn.onclick = function(){ App.filterItems(wrap, filt, ITEMS.skills, btn); };
    filt.appendChild(btn);
  });
  if(cur==='all') wrap.appendChild(filt);
  ITEMS.skills.forEach(function(x){
    if(cur!=='all' && x.cat!==cur) return;
    wrap.appendChild(App.itemCard(x,'skill'));
  });
  wrap.appendChild(App.h('div','callout warn','⚠️ 安全紅線：刀具／爐具／火源／繩結承重必須有持委任書領袖在場；夜間與水域活動最少三人同行；任何「疑似真傷患」即時停止練習。呢頁係教材，唔係證書課程——急救、拯溺、先鋒工程高處工作要上正式課程。'));
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

/* 🎖️ 獎章查閱（會員章／肩章／獎章路：只查不記） */
App.pages.badges = function(){
  var wrap = App.h('div','page');
  wrap.appendChild(App.h('h1',null,'🎖️ 獎章查閱'));
  wrap.appendChild(App.h('p','lede','深資童軍獎章制度：<b>會員章</b>（12 項，c01–c06）→ <b>肩章</b>（認識＋技能，c07–c16）→ <b>深資童軍獎章</b>（完成下列<b>四個段章</b>：活動策劃・社會服務・多元技能・戶外探險）→ <b>榮譽童軍獎章</b>（每個段章配一條金帶，共四條）。呢度只做查閱：每項有考核要求＋對應集會；考核由團安排。'));
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
  wrap.appendChild(App.h('p','source-note','📚 來源：'+INTERESTS.source.title+'（'+INTERESTS.source.version+'）｜<a href="#book/apply">點考（團內考核 7 步）</a>｜💡 會員章＋肩章由團考核｜獎章路詳情：<a href="'+INTERESTS.source.url+'" target="_blank" rel="noopener">《深資童軍訓練綱要》網上版</a>'));
  var grid = App.h('div','badge-grid');
  INTERESTS.badges.forEach(function(b){
    var catName = (INTERESTS.categories.find(function(c){return c.k===b.cat;})||{n:''}).n;
    var meetLink = b.meet ? '<a class="tag meet" href="#plan/'+b.meet+'">📅 '+b.meet+' 教案</a>' : '';
    var reqList = b.req.map(function(r){return '<li>'+r+'</li>';}).join('');
    var sugList = b.suggest.map(function(s){return '<li>'+s+'</li>';}).join('');
    var card = App.h('div','badge-card');
    card.setAttribute('data-cat',b.cat);
    card.innerHTML =
      '<div class="badge-head">'+
      '<h3>'+b.zh+' <small>('+b.en+')</small></h3>'+
      '<div class="badge-tags"><span class="tag cat">'+catName+'</span>'+meetLink+'</div></div>'+
      '<details><summary>📋 考核要求</summary><ol class="req-list">'+reqList+'</ol></details>'+
      '<details><summary>💡 建議考核方式（僅供參考）</summary><ul class="sug-list">'+sugList+'</ul></details>'
      + '<p class="no-print"><button class="proj-btn" onclick="App.projSec(this.closest(\'div.badge-card\'))">🖥️ 投屏（同團員講要求）</button></p>';
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
  var note = App.h('div','callout');
  note.innerHTML = 'ℹ️ '+INTERESTS.howToApply.otherGroupsNote;
  wrap.appendChild(note);
  return wrap;
};

/* 🌟 AYP（香港青年獎勵計劃：概覽、三級要求、五科、點參加） */
App.aypTabs = [
  {k:'about',ic:'🌟',n:'概覽'},
  {k:'levels',ic:'🥉',n:'三級要求'},
  {k:'sections',ic:'📋',n:'五科介紹'},
  {k:'join',ic:'📝',n:'點參加'}
];
App.pages.ayp = function(sub){
  var wrap = App.h('div','page ayp-page');
  var cur = App.aypTabs.some(function(x){return x.k===sub;}) ? sub : 'about';
  wrap.appendChild(App.h('h1',null,'🌟 AYP 青年獎勵計劃'));
  wrap.appendChild(App.subnav('ayp',App.aypTabs,cur));
  wrap.appendChild(App.h('p','lede','香港青年獎勵計劃（AYP／HKAYP）：14–24 歲，銅銀金三級。深資團員 15–20 歲正係銀章 → 金章主力——呢頁只查唔記，詳情以官方為準。'));
  if(cur==='about'){
    var intro = AYP.about.map(function(t){return '<li>'+t+'</li>';}).join('');
    wrap.appendChild(App.block('🌟 AYP 係乜', '<ul class="tight">'+intro+'</ul>', {print:true}));
    wrap.appendChild(App.block('🎯 三級一眼睇晒', '<table class="meeting-table"><thead><tr><th>級別</th><th>年齡</th><th>點報</th></tr></thead><tbody>'+
      '<tr><td>🥉 銅章級</td><td>14 歲或以上</td><td rowspan="3">可直接報任何一級，亦可順序考；25 歲生日前完成</td></tr>'+
      '<tr><td>🥈 銀章級</td><td>15 歲或以上</td></tr>'+
      '<tr><td>🥇 金章級</td><td>16 歲或以上（加團體生活科）</td></tr>'+
      '</tbody></table><p class="tip">💡 時數＋月份＋評核旅程數字：<a href="#ayp/levels">三級要求</a>。</p>', {print:true}));
  } else if(cur==='levels'){
    var lt = AYP.levelTable;
    var th = lt.cols.map(function(c){return '<th>'+c+'</th>';}).join('');
    var tr = lt.rows.map(function(r){
      return '<tr>'+r.map(function(c,i){return (i===0?'<th>':'<td>')+c+(i===0?'</th>':'</td>');}).join('')+'</tr>';
    }).join('');
    var notes = lt.notes.map(function(t){return '<li>'+t+'</li>';}).join('');
    wrap.appendChild(App.block('🥉 三級要求比較', '<table class="meeting-table"><thead><tr>'+th+'</tr></thead><tbody>'+tr+'</tbody></table><ul class="tight">'+notes+'</ul>', {print:true}));
  } else if(cur==='sections'){
    AYP.sections.forEach(function(sx){
      var ex = sx.examples.map(function(e){return '<span class="tag">'+e+'</span>';}).join(' ');
      wrap.appendChild(App.block('📋 '+sx.n+'（'+sx.en+'）', '<p>'+sx.purpose+'</p><p>例子：'+ex+'</p><p class="tip">💡 '+sx.note+'</p>', {print:true}));
    });
  } else {
    var steps = AYP.join.map(function(st,i){return '<li><b>'+(i+1)+'．'+st.t+'</b>：'+st.d+'</li>';}).join('');
    var docs = AYP.docs.map(function(d){return '<li><a class="external-link" href="'+d.url+'" target="_blank" rel="noopener">🔗 '+d.n+'</a>（'+d.d+'）</li>';}).join('');
    wrap.appendChild(App.block('📝 點參加（7 步）', '<ol class="tight">'+steps+'</ol>', {print:true}));
    wrap.appendChild(App.block('🔗 官方文件', '<ul class="tight">'+docs+'</ul>', {print:false}));
    wrap.appendChild(App.h('p','tip','💡 領袖要幫團員參加／成立執行處支部：睇 <a href="#book/ayp">📖 手冊・AYP 領袖指南</a>。'));
  }
  wrap.appendChild(App.h('p','tip','📚 資料來源：'+AYP.source.title+'。'+AYP.source.note));
  return wrap;
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
   用戶要求（v31）：① 小組數目可以自己加減（唔一定四隊）② 自己手機用得，但一定要有投屏版，
   領袖手機操作、投影／大電視同步顯示，成員睇得見。 */
App.troop = {
  count: 4,
  names: ['第一組','第二組','第三組','第四組','第五組','第六組','第七組','第八組'],
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
  return '<table class="meeting-table score-table"><thead><tr><th>分組</th><th>分數</th><th>加減</th></tr></thead><tbody>'+rows+'</tbody></table>';
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
  if (kind && kind.indexOf('mg:') === 0) {
    if (typeof MiniGame !== 'undefined') {
      MiniGame.projMode = kind.replace('mg:', '');
      return MiniGame.projHtml();
    }
  }
  if (kind==='score') return '<h3>🏆 分組計分板</h3>'+App.boardHtml(true);
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

  var sBoard = App.sec('🏆 分組計分板', {print:false, proj:false, id:'pt-board-sec'});
  sBoard._body.innerHTML =
    '<div class="card"><p><b>今日有幾多組？</b> '+
      '<button onclick="App.patrolCount(App.troop.count-1)">－</button> '+
      '<input id="pt-troop-n" type="number" min="2" max="8" value="'+App.troop.count+'" onchange="App.patrolCount(this.value)" style="width:56px;text-align:center"> '+
      '<button onclick="App.patrolCount(App.troop.count+1)">＋</button> 組 '+
      '<small class="mut">（2–8 組；組名可以改）</small></p>'+
      '<div id="pt-board">'+App.boardHtml(false)+'</div>'+
      '<p><button onclick="App.patrolScoreReset()">🔄 全部清零</button> '+
      '<button class="proj-big" onclick="Projector.live(\'score\',\'🏆 分組計分板\')">🖥️ 投屏</button></p>'+
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

  var sMini = App.sec('🎮 聚會 MINI-GAME 互動箱（誰是臥底 / 機密特務 / 骰子 / 轉盤）', {print:false, proj:false});
  sMini._body.innerHTML =
    '<div class="card" style="margin-bottom:12px;">'+
    '<p class="lead">無需外出連結、唔使每人一機：深資團破冰、露營夜話、室內活動特訓互動組件（領袖一部手機搞得掂）。</p>'+
    (typeof MiniGame !== 'undefined' ? MiniGame.htmlBlock() : '<div id="mg-spy-box"></div><div id="mg-agent-box"></div><div id="mg-wheel-box"></div>')+
    '</div>';
  frag.appendChild(sMini);
  setTimeout(function(){ if(typeof MiniGame !== 'undefined' && MiniGame.mount) MiniGame.mount(); }, 50);

  return frag;
};

if (typeof module !== 'undefined' && module.exports) module.exports = App;
