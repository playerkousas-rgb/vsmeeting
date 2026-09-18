/* minigame.js — 聚會 MINI-GAME 互動箱（v49 重設：領袖一部手機主導流程）
   設計原則（真實投影場景）：
   ・投影屏／大電視冇觸控——所有掣只存在領袖手機；投影純顯示，由領袖手機「推」過去。
   ・答案／秘密（臥底身份詞、特務色卡、秘密骰面、抽籤名單）永遠只喺領袖手機顯示，
     投影版本一律中性（灰牌／🔒），要揭由領袖撳掣先至出。
   ・每個工具都列咗「 主持流程」：邊步投咩、邊步唔好投，照做就行。 */
var MiniGame = {};

/* ══════════ 誰是臥底（領袖一次過派卡）══════════ */
/* 玩法：每人都得一張卡（多數同詞＋1-2 個臥底詞）。領袖一次過派卡（逐張攞畀人看，唔好畀人他人卡）。
   逐輪各人講一個詞描述，投票投出嫌疑最大者。投中臥底／臥底全出局→結束。 */
var spyState = {
  words: { common: '', spy: '' },
  players: ['玩家 1','玩家 2','玩家 3','玩家 4'],
  eliminated: [],
  phase: 'setup',       /* setup / play / result */
  round: 1,
  firstTurn: 0,
  hostOpen: false       /* 主持面板（含答案詞）預設收起 */
};
var SPY_WORDS = [
  ['番茄','番茄沙律'],['紅豆','綠豆'],['奶茶','咖啡'],['巴士','的士'],
  ['床','梳化'],['眼鏡','隐形眼鏡'],['生日派對','婚禮'],['游泳','浮水'],
  ['醫生','護士'],['飛機','直升機'],['薯條','炸魚柳'],['猫','猫頭鷹']
];
function spyPickWord(){
  var p = SPY_WORDS[Math.floor(Math.random()*SPY_WORDS.length)];
  return { common: p[0], spy: p[1] };
}
function spyAddPlayer(){
  if(spyState.players.length>=12) return;
  spyState.players.push('玩家 '+(spyState.players.length+1));
  renderSpy();
}
function spyDelPlayer(i){
  if(spyState.players.length<=3) { alert('最少 3 人'); return; }
  spyState.players.splice(i,1);
  if(spyState.eliminated.indexOf(i)>=0) {
    /* 簡化：重排 eliminated index（只移除該位之後嘅 offset） */
    spyState.eliminated = spyState.eliminated.map(function(x){ return x>i ? x-1 : x; }).filter(function(x){ return x < spyState.players.length; });
  }
  if(spyState.firstTurn >= spyState.players.length) spyState.firstTurn = 0;
  renderSpy();
}
function spyStart(){
  spyState.words = spyPickWord();
  spyState.eliminated = [];
  spyState.round = 1;
  spyState.firstTurn = Math.floor(Math.random()*spyState.players.length);
  spyState.phase = 'play';
  renderSpy();
}
function spyNextRound(){
  spyState.round++;
  spyState.firstTurn = (spyState.firstTurn+1) % spyState.players.length;
  renderSpy();
}
function spyEliminate(i){
  if(spyState.eliminated.indexOf(i)>=0) return;
  spyState.eliminated.push(i);
  var alive = spyState.players.length - spyState.eliminated.length;
  if(alive<=2){
    spyState.phase = 'result';
  } else {
    spyState.round++;
    spyState.firstTurn = (spyState.firstTurn+1) % spyState.players.length;
  }
  renderSpy();
}
function spyReset(){
  spyState.words = { common:'', spy:'' };
  spyState.eliminated = [];
  spyState.round = 1;
  spyState.firstTurn = 0;
  spyState.phase = 'setup';
  renderSpy();
}
function renderSpy(){
  var box = document.getElementById('mg-spy-box');
  if(!box) return;
  var H = '';
  if(spyState.phase==='setup'){
    H += '<p class="mut">🎬 主持流程：① 設玩家數 → ② 撳「開始」抽詞 → ③ <b>一次過派卡</b>（逐張攞畀人看）→ ④ 撳「🖥️ 投影」先投派卡畫面 → ⑤ 逐輪講詞＋投票；投中／剩 2 人先「揭曉身份」。</p>';
    H += '<label class="mg-lbl">玩家數：<input type="number" min="3" max="12" value="'+spyState.players.length+'" id="spy-n" onchange="spySetN(this.value)"> 人（最少 3 人）</label>';
    H += '<div class="mg-btns"><button class="mg-primary" onclick="spyStart()">🎲 開始（抽一組詞）</button></div>';
  } else {
    H += '<div class="callout spy-turn">🗣️ 第 '+spyState.round+' 輪・由 <b>'+spyState.players[spyState.firstTurn]+'</b> 先講（每人一句：呢個詞有咩特徵？唔好俾人猜到）</div>';
    var list = '';
    spyState.players.forEach(function(p,i){
      var out = spyState.eliminated.indexOf(i)>=0;
      list += '<li class="mg-p'+(out?' out':'')+'">'+p+(out?' <small>（已出局）</small>':'')+'</li>';
    });
    H += '<div class="mg-players"><ul>'+list+'</ul></div>';
    H += '<div class="mg-btns">';
    if(spyState.phase==='play'){
      H += '<button onclick="spyNextRound()">➡️ 下一輪</button>';
      H += '<button class="mg-proj" onclick="Projector.live(\'mg:spy\',\'🕵️ 誰是臥底\')">🖥️ 投影（無詞版）</button>';
    } else {
      H += '<button class="mg-primary" onclick="Projector.live(\'mg:spy\',\'🕵️ 誰是臥底\')">🖥️ 投影揭曉</button>';
      H += '<button onclick="spyReset()">🔄 再玩一次</button>';
    }
    H += '</div>';
  }
  /* 主持面板（含答案詞）——預設收起，要派卡／核對先撳開 */
  H += '<details class="mg-host'+(spyState.hostOpen?' open':'')+'"><summary>📱 主持面板（領袖手機・身份詞喺呢度・唔好投屏）</summary><div class="mg-host-body">';
  if(spyState.phase==='setup'){
    H += '<p class="mut">撳「開始」先至有詞。派卡時用「印卡」逐張對住派（一次過攞畀人看）。</p>';
  } else {
    H += '<div class="spy-cards">';
    H += '<div class="spy-card"><h4>🕵️ 臥底詞（只有臥底見到）</h4><div class="spy-word">'+spyState.words.spy+'</div></div>';
    H += '<div class="spy-card"><h4>👥 普通詞（其余人見到）</h4><div class="spy-word">'+spyState.words.common+'</div></div>';
    H += '</div>';
    H += '<p class="mut">派卡方法：每人都得一張卡，逐張翻開畀本人看、即刻掩返；只有一個／兩個「臥底」有臥底詞，其余人有普通詞。建議將臥底位置隨機分派（例如第 1 及第 4 位）。</p>';
    if(spyState.phase==='play'){
      H += '<div class="mg-btns"><button onclick="spyPrintCards()">🖨️ 印卡（A4 逐張）</button></div>';
      H += '<p class="mut spy-elim-note">撳「有人被投票出局」後，喺下方逐人標記出局；剩 2 人自動進入揭曉。</p>';
      var elimBtns = '';
      spyState.players.forEach(function(p,i){
        var out = spyState.eliminated.indexOf(i)>=0;
        if(!out) elimBtns += '<button onclick="spyEliminate('+i+')">出局：'+p+'</button>';
      });
      H += '<div class="mg-elim">'+elimBtns+'</div>';
    } else {
      H += '<p class="callout ok">🎉 揭曉：臥底係「<b>'+spyState.words.spy+'</b>」，普通人講嘅係「<b>'+spyState.words.common+'</b>」。撳「🖥️ 投影揭曉」全場先至見到。</p>';
    }
  }
  H += '</div></details>';
  box.innerHTML = H;
  if (typeof Projector !== 'undefined' && Projector.on && Projector.liveKind==='mg:spy') Projector.render();
}
/* 提示邊個被投出（簡化：直接逐人撳出局掣） */
function spyEliminatePrompt(){
  /* 此掣只係提示：實際由下方「出局：○○」逐人標記 */
}
function spySetN(n){
  n = parseInt(n,10);
  if(isNaN(n) || n<3 || n>12) n = 4;
  var old = spyState.players.length;
  spyState.players = [];
  for(var i=0;i<n;i++) spyState.players.push('玩家 '+(i+1));
  spyState.eliminated = [];
  renderSpy();
}
function spyPrintCards(){
  /* 印出兩張卡（普通／臥底），領袖逐張派 */
  var w = spyState.words;
  var html = '<div class="spy-print-card"><h3>普通卡 ×'+(spyState.players.length-1)+'</h3><p class="spy-print-word">'+w.common+'</p></div>'
    + '<div class="spy-print-card"><h3>臥底卡 ×1（隨機派）</h3><p class="spy-print-word">'+w.spy+'</p></div>';
  var win = window.open('', '_blank', 'width=640,height=480');
  if(!win) { alert('請容許彈出視窗先至可以印卡'); return; }
  win.document.write('<html><head><title>誰是臥底・派卡</title><style>body{font-family:sans-serif;padding:24px}.spy-print-card{border:3px dashed #333;border-radius:10px;width:240px;height:300px;display:inline-block;margin:8px;text-align:center;padding-top:60px;page-break-inside:avoid}.spy-print-word{font-size:56px;font-weight:700}</style></head><body>'+html+'<p style="margin-top:16px"><button onclick="window.print()">列印</button></p></body></html>');
  win.document.close();
}
var spyRules = {
  title: '🕵️ 誰是臥底（10 分鐘・全團）',
  rules: [
    '每人都得一張卡：多數人「普通詞」＋1～2 人「臥底詞」',
    '領袖一次過派卡，逐張翻開畀本人看、即刻掩返',
    '由「先講」開始順時針每人講一句（描述特徵，唔好用有冇呢個字）',
    '講完一圈→投票投出最大嫌疑；得票最多者出局',
    '若投出臥底→遊戲即時結束；若臥底全出局→普通人勝',
    '剩 2 人時領袖「揭曉身份」'
  ]
};
function spyRulesHtml(){
  return '<div class="spy-rules"><h3>'+spyRules.title+'</h3><ol class="steps tight">'+spyRules.rules.map(function(r){return '<li>'+r+'</li>';}).join('')+'</ol></div>';
}
function spyCardsHtml(){
  var w = spyState.words;
  if(!w.common) return '';
  var cards = '';
  for(var i=0;i<spyState.players.length-1;i++) cards += '<div class="scard"><p class="sc-word">'+w.common+'</p><p class="sc-tag">普通</p></div>';
  cards += '<div class="scard spy"><p class="sc-word">'+w.spy+'</p><p class="sc-tag">🕵️ 臥底</p></div>';
  return '<div class="spy-cards-a4">'+cards+'</div>';
}

/* ══════════ 機密特務（5×5 猜詞・領袖／隊長看色卡）══════════ */
/* 投影永遠中性：未翻牌＝灰（冇顏色）；已翻牌先至出色。
   色卡（邊塊係紅／藍）只存在領袖手機嘅「隊長面板」——唔好投屏。
   流程：① 新盤 → ② 隊長（領袖）手機看色卡 → ③ 隊長喊「主題＋數量」（例：食物 3）
   → ④ 隊長喺手機逐塊撳「翻牌」＝全場翻牌（投影同步）→ ⑤ 換邊隊 → ⑥ 撞炸彈＝立即結束。 */
var agentState = {
  grid: [],        /* 25 格：{word, type:'red'|'blue'|'assassin', revealed} */
  turn: 'red',     /* 邊隊輪到喊提示 */
  over: false,
  winner: ''
};
var AGENT_WORDS = [
  '蘋果','咖啡','火車','醫院','書包','大海','太陽','醫生','學校','蛋糕',
  '足球','警察','飛機','餅乾','森林','月亮','老師','漢堡','電話','雪地'
];
function agentDeal(){
  var words = AGENT_WORDS.slice();
  /* 洗牌 */
  for(var i=words.length-1;i>0;i--){
    var j = Math.floor(Math.random()*(i+1));
    var t = words[i]; words[i]=words[j]; words[j]=t;
  }
  var grid = [];
  /* 2 紅 + 2 藍 + 1 炸彈 + 20 平民 */
  var types = ['red','red','blue','blue','assassin'];
  for(var k=5;k<25;k++) types.push('civil');
  for(var m=0;m<types.length;m++){
    grid.push({ word: words[m], type: types[m], revealed:false });
  }
  agentState.grid = grid;
  agentState.turn = 'red';
  agentState.over = false;
  agentState.winner = '';
  renderAgent();
}
/* ══ 盤面代號：將 25 格布局（1 炸彈＋2 紅＋2 藍）編碼做 5 個字，
   第二部裝置（TV 屏）輸入代號即可重組同一盤——兩機唔使網絡、唔使同步。
   代號只包含「位置」，唔包含任何詞。 ══ */
var AGENT_CODE_ALPHABET = 'ABCDEFGHJKLMNPRSTUVWXYZ23456789'; /* 32 字（無 0/1/I/O，易讀易喊） */
function agentPairIdx(p, total){ return p[0]*(total-p[0]-1) + (p[1]-p[0]-1); }
function agentPairFromIdx(idx, total){
  for(var a=0;a<total-1;a++){
    var cnt = total-a-1;
    if(idx < a*cnt + cnt){ return [a, a + (idx - a*cnt) + 1]; }
  }
  return null;
}
function agentCodeEncode(grid){
  var b=-1, reds=[], blues=[];
  grid.forEach(function(c,i){ if(c.type==='assassin') b=i; else if(c.type==='red') reds.push(i); else if(c.type==='blue') blues.push(i); });
  if(b<0) return '';
  reds.sort(function(x,y){return x-y;}); blues.sort(function(x,y){return x-y;});
  var rest=[];
  for(var i=0;i<25;i++){ if(i!==reds[0] && i!==reds[1]) rest.push(i); }
  var bp = [rest.indexOf(blues[0]), rest.indexOf(blues[1])];
  var n = (b*300 + agentPairIdx(reds,25))*253 + agentPairIdx(bp,23);
  var code='';
  for(var k=0;k<5;k++){ code = AGENT_CODE_ALPHABET.charAt(n%32) + code; n = Math.floor(n/32); }
  return code;
}
function agentCodeDecode(code){
  code = String(code||'').trim().toUpperCase();
  if(code.length!==5) return null;
  var n=0;
  for(var k=0;k<5;k++){ var d=AGENT_CODE_ALPHABET.indexOf(code[k]); if(d<0) return null; n = n*32+d; }
  var blueIdx = n % 253; var m = Math.floor(n/253);
  var redIdx = m % 300; var b = Math.floor(m/300);
  if(b>24 || redIdx>299 || blueIdx>252) return null;
  var reds = agentPairFromIdx(redIdx,25);
  if(!reds) return null;
  var rest=[];
  for(var i=0;i<25;i++){ if(i!==reds[0] && i!==reds[1]) rest.push(i); }
  var bp = agentPairFromIdx(blueIdx,23);
  if(!bp) return null;
  var types = [];
  for(i=0;i<25;i++) types.push('civil');
  types[b]='assassin'; types[reds[0]]='red'; types[reds[1]]='red'; types[rest[bp[0]]]='blue'; types[rest[bp[1]]]='blue';
  return types;
}
function agentFlip(i){
  if(!agentState.grid[i]) return;
  var c = agentState.grid[i];
  if(c.revealed){ c.revealed = false; return; }  /* 撳已翻牌＝掩返 */
  c.revealed = true;
  if(c.type==='assassin'){
    agentState.over = true;
    agentState.winner = '';
    renderAgent();
    return;
  }
  /* 計分：該色卡全部翻晒＝嗰隊勝 */
  var red = 0, blue = 0;
  agentState.grid.forEach(function(g){ if(g.revealed){ if(g.type==='red') red++; if(g.type==='blue') blue++; } });
  var needRed = agentState.grid.filter(function(g){return g.type==='red';}).length;
  var needBlue = agentState.grid.filter(function(g){return g.type==='blue';}).length;
  if(red>=needRed){ agentState.over = true; agentState.winner = 'red'; }
  else if(blue>=needBlue){ agentState.over = true; agentState.winner = 'blue'; }
  renderAgent();
}
function agentTurn(){ agentState.turn = agentState.turn==='red'?'blue':'red'; renderAgent(); }
function renderAgent(){
  var box = document.getElementById('mg-agent-box');
  if(!box) return;
  var H = '';
  if(!agentState.grid.length){
    H += '<div class="agent-howto"><b>🎬 主持流程（投影邊個版面？答案點睇？）</b><ol class="steps tight"><li><b>投影永遠係「中性盤」</b>——未翻＝灰牌、冇顏色、冇詞。色卡（邊塊係紅／藍／炸彈）<b>淨係呢部機有，絕對唔好投</b>——投咗＝全場睇到答案。</li><li><b>隊長＝邊個</b>：預設＝領袖自己（睇「 隊長答案卡」）；想團員做隊長，就領袖喺呢部機<b>私下</b>畀佢睇色卡。隊長一定要知道布局（靠位置＋顏色出詞），觀衆永遠淨係睇中性盤。</li><li><b>「又要投影中性盤、又要睇答案」點同時做？答案同投影要分兩部機</b>——一部機影咗去 TV，TV 就會見到你部機顯示緊嘅色卡。兩種做法：<br>A. <b>電腦＋投影機（最好）</b>：撳「️ 投影」開第二視窗拖去投影機（或用「🪟 開第二螢幕」）——投影機＝中性盤，電腦畫面＝隊長答案卡＋翻牌掣。<br>B. <b>兩部手機</b>：手機 A 接 TV，開「<a href="#tvagent">🖥️ TV 屏・機密特務</a>」；手機 B＝領袖（呢個版面）。撳「 新盤」後領袖喊出「盤面代號」（5 字），手機 A 輸入代號＝同一盤。其後：團員喊號碼 → 領袖喺手機 B 翻牌（自己見到顏色）＋喊結果（例「13 號，紅＋1」）→ 負責團員喺手機 A 撳 13 號＋紅＋1。</li><li><b>流程</b>：新盤 → 隊長喊「主題＋數量」（例：「食物，3 塊」）→ 團員逐個喊號碼 → 領袖翻牌（TV 同步）→ 收晒自己色＝嗰隊贏 → 換邊隊。</li><li>撞炸彈＝即時結束（TV 屏自動出「遊戲結束」）。</li></ol></div>';
    H += '<div class="mg-btns"><button class="mg-primary" onclick="agentDeal()">🎲 新盤（25 詞）</button><button class="mg-proj" onclick="Projector.live(\'mg:agent\',\'🕴️ 機密特務\')">🖥️ 投影（中性盤：未翻＝灰牌）</button><a class="mg-proj mg-proj-link" href="#tvagent">🖥️ TV 屏（第二部手機）</a></div>';
    box.innerHTML = H; return;
  }
  /* 隊長面板（色卡＝答案，領袖手機專用，唔好投屏） */
  H += '<div class="agent-secret"><div class="agent-secret-head">🔒 隊長答案卡・色卡（淨係呢部手機・絕對唔好投屏）<span class="agent-turn-tag '+(agentState.turn==='red'?'t-red':'t-blue')+'">'+(agentState.turn==='red'?'🔴 紅隊輪到喊提示':'🔵 藍隊輪到喊提示')+'</span></div>';
  H += '<div class="agent-code">📡 盤面代號：<b>'+agentCodeEncode(agentState.grid)+'</b><small>＝呢盤布局（位置）嘅 5 字密碼。第二部裝置（TV／投影機）開「<a href="#tvagent">🖥️ TV 屏・機密特務</a>」輸入呢 5 個字＝重組同一盤；TV 屏淨係中性盤，冇詞、冇顏色。</small></div>';
  H += agentGridHtml(agentState.grid, true);
  H += '<div class="mg-btns">';
  if(agentState.over){
    H += agentState.winner
      ? '<span class="agent-over">🏆 '+(agentState.winner==='red'?'紅隊':'藍隊')+'集齊自己色卡，贏咗！</span>'
      : '<span class="agent-over">💣 撞咗炸彈（特務）！喊提示嗰隊輸——遊戲結束。</span>';
    H += '<button class="mg-primary" onclick="agentDeal()"> 再嚟一盤</button>';
  } else {
    H += '<button onclick="agentTurn()">🔄 換邊隊喊（'+(agentState.turn==='red'?'🔵 藍隊':'🔴 紅隊')+'）</button>';
    H += '<button onclick="agentDeal()">🎲 新盤</button>';
  }
  H += '<button class="mg-proj" onclick="Projector.live(\'mg:agent\',\'🕴️ 機密特務\')">🖥️ 投影（中性盤：未翻＝灰牌）</button>';
  H += '<a class="mg-proj mg-proj-link" href="#tvagent">🖥️ TV 屏（第二部手機）</a>';
  H += '</div></div>';
  /* 計分（已翻幾多） */
  var red=0, blue=0, civ=0, bomb=false;
  agentState.grid.forEach(function(g){ if(!g.revealed) return; if(g.type==='red') red++; else if(g.type==='blue') blue++; else if(g.type==='assassin') bomb=true; else civ++; });
  H += '<p class="agent-score">🔴 紅隊已收 <b>'+red+'</b>／2　🔵 藍隊已收 <b>'+blue+'</b>／2　平民 '+civ+(bomb?'　💣 炸彈已翻':'')+'</p>';
  box.innerHTML = H;
  if (typeof Projector !== 'undefined' && Projector.on && Projector.liveKind==='mg:agent') Projector.render();
}
/* 格子 HTML：showColor=true 畀隊長看（有色框）；false＝投影中性版 */
function agentGridHtml(grid, showColor){
  var H = '<div class="agent-grid">';
  grid.forEach(function(c,i){
    var cls = 'ag-cell';
    if(c.revealed){
      cls += ' rev '+(showColor ? (c.type==='red'?'c-red':(c.type==='blue'?'c-blue':(c.type==='assassin'?'c-bomb':'c-civ'))) : (c.type==='red'?'p-red':(c.type==='blue'?'p-blue':(c.type==='assassin'?'p-bomb':'p-civ'))));
    } else {
      cls += ' hide';
    }
    var label = c.revealed ? c.word : '？';
    H += '<button class="'+cls+'" onclick="agentFlip('+i+')"><i class="ag-num">'+(i+1)+'</i><span>'+label+'</span></button>';
  });
  H += '</div>';
  return H;
}
/* 投影用嘅中性 grid（未翻＝灰，冇任何顏色暗示）——inline style，第二屏冇 app.css 都啱 */
function agentProjGrid(){
  var base = 'position:relative;background:#1b3a29;color:#E8F5E9;border:1px solid #4E6B57;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.05em;line-height:1.2;padding:1vh 0.4vw;text-align:center;';
  var H = '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:0.8vw;margin:1.4vh 0;">';
  agentState.grid.forEach(function(c,i){
    var bg = base;
    var label = '？';
    if(c.revealed){
      if(c.type==='red') bg = 'position:relative;background:#B71C1C;color:#FFF;border:1px solid #FF8A80;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.05em;line-height:1.2;padding:1vh 0.4vw;text-align:center;';
      else if(c.type==='blue') bg = 'position:relative;background:#0D47A1;color:#FFF;border:1px solid #82B1FF;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.05em;line-height:1.2;padding:1vh 0.4vw;text-align:center;';
      else if(c.type==='assassin') bg = 'position:relative;background:#212121;color:#FF5252;border:2px solid #FF5252;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.05em;line-height:1.2;padding:1vh 0.4vw;text-align:center;';
      else bg = 'position:relative;background:#2E7D32;color:#FFF;border:1px solid #A5D6A7;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.05em;line-height:1.2;padding:1vh 0.4vw;text-align:center;';
      label = c.word;
    }
    H += '<div style="'+bg+'"><span style="position:absolute;top:4px;left:8px;font-size:0.55em;font-weight:600;opacity:0.8">'+(i+1)+'</span>'+label+'</div>';
  });
  H += '</div>';
  return H;
}

/* ══════════ TV 屏・機密特務（第二部手機／TV 專用：中性盤、冇詞冇色、可安全投屏）══════════
   用法：領袖喺主版面「🎲 新盤」後喊出「盤面代號」（5 字）；呢度輸入代號＝重組同一盤。
   操作：團員喊號碼 → 呢度撳該號碼（翻牌＝收咗）→ 撞炸彈＝自動出「遊戲結束」；
   得分由領袖喊出（例「紅＋1」），負責團員撳對應＋1。此版面冇任何答案內容。 */
var tvAgentState = { types: null, picked: {}, red: 0, blue: 0, over: false, msg: '' };
function tvAgentSet(code){
  var t = agentCodeDecode(code);
  if(!t){ tvAgentState.msg = '❌ 代號唔啱：要 5 個字（A–Z／2–9，無 0、1、I、O）。再對吓領袖喊嘅代號。'; renderTvAgent(); return; }
  tvAgentState = { types: t, picked: {}, red: 0, blue: 0, over: false, msg: '✅ 盤面設好（25 格：1 炸彈＋2 紅＋2 藍）。等領袖喊「開局」。' };
  renderTvAgent();
}
function tvAgentFlip(i){
  var s = tvAgentState;
  if(!s.types || s.over || s.picked[i]) return;
  s.picked[i] = true;
  if(s.types[i] === 'assassin'){ s.over = true; s.msg = '💣 撞咗炸彈（特務）！遊戲結束。'; }
  else if(s.types[i] === 'red' || s.types[i] === 'blue'){ s.msg = (i+1)+' 號已收——領袖喊邊隊＋1，就撳該隊＋1。'; }
  renderTvAgent();
}
function tvAgentScore(team, d){
  var s = tvAgentState;
  if(!s.types || s.over) return;
  s[team] = Math.max(0, s[team] + d);
  renderTvAgent();
}
function renderTvAgent(){
  var box = document.getElementById('tvagent-box');
  if(!box) return;
  var s = tvAgentState;
  var H = '';
  if(!s.types){
    H += '<div class="agent-howto"><b>📡 設盤（輸入領袖喊嘅盤面代號）</b><ol class="steps tight"><li>領袖喺「機密特務」版面撳「 新盤」，會出一個 <b>5 字盤面代號</b>（例：K7Q3Z）。</li><li>領袖喊出代號 → 呢度輸入 → 「設盤」。</li><li>其後照喊：團員喊號碼 → 撳該號碼 → 領袖喊結果 → 撳該隊＋1。此版面<b>冇詞、冇顏色</b>，可放心投屏／mirror。</li></ol></div>';
    H += '<div class="tvagent-code"><input id="tvagent-code" maxlength="5" placeholder="K7Q3Z" autocomplete="off" style="letter-spacing:0.3em;text-transform:uppercase;font-size:1.6rem;font-weight:800;width:100%"><button class="mg-primary" onclick="tvAgentSet(document.getElementById(\'tvagent-code\').value)">📡 設盤</button></div>';
    if(s.msg) H += '<p class="tvagent-msg">'+s.msg+'</p>';
  } else {
    H += '<div class="tvagent-grid">';
    s.types.forEach(function(t,i){
      var cls = 'tvagent-cell';
      if(s.picked[i]){ cls += ' picked'; if(t==='assassin') cls += ' bomb'; }
      var label = s.picked[i] ? (t==='assassin' ? '💣' : '✓') : '？';
      H += '<button class="'+cls+'" onclick="tvAgentFlip('+i+')"><i class="ag-num">'+(i+1)+'</i><span>'+label+'</span></button>';
    });
    H += '</div>';
    H += '<div class="tvagent-score"><span class="t-red">🔴 紅隊 <b>'+s.red+'</b><button onclick="tvAgentScore(\'red\',-1)">−</button><button onclick="tvAgentScore(\'red\',1)">＋1</button></span><span class="t-blue">🔵 藍隊 <b>'+s.blue+'</b><button onclick="tvAgentScore(\'blue\',-1)">−</button><button onclick="tvAgentScore(\'blue\',1)">＋1</button></span></div>';
    if(s.msg) H += '<p class="tvagent-msg">'+s.msg+'</p>';
    if(s.over) H += '<div class="agent-over tvagent-over">'+(s.msg.indexOf('💣')>=0 ? '💣 撞咗炸彈——喊提示嗰隊輸，遊戲結束。' : '🏆 遊戲結束。')+'<br><button class="mg-primary" onclick="tvAgentReset()">🔄 等新盤（等領袖喊新代號）</button></div>';
  }
  box.innerHTML = H;
}
function tvAgentReset(){ tvAgentState = { types: null, picked: {}, red: 0, blue: 0, over: false, msg: '' }; renderTvAgent(); }

/* ══════════ 骰子（大話骰／公開擲＋秘密擲）══════════ */
/* 公開擲：動畫＋結果手機同投影一樣（适合「大話骰」要全場睇）。
   秘密擲（祕密結果）：擲完結果淨係領袖手機睇到；投影一直係 🔒，
   由領袖撳「🖥️ 投出結果」先至全場見到——適合「領袖先核對先公布」。 */
var diceState = { value:0, hidden:false, rolling:false, secret:false, projLocked:false };
function diceSetSecret(on){
  diceState.secret = !!on;
  if(diceState.secret) diceState.hidden = true;
  else diceState.hidden = false;
  renderDice();
}
function rollDice(){
  if(diceState.rolling) return;
  diceState.rolling = true;
  diceState.hidden = false;          /* 動畫喺領袖手機上跑（投影暫時顯示「擲緊」） */
  renderDice();
  var face = 6;
  var iv = setInterval(function(){
    face = 1 + Math.floor(Math.random()*6);
    diceState.value = face;
    renderDice();
  }, 90);
  setTimeout(function(){
    clearInterval(iv);
    diceState.value = 1 + Math.floor(Math.random()*6);
    diceState.rolling = false;
    if(diceState.secret){
      /* 秘密擲：手機一直顯示結果（領袖核對），投影鎖定 */
      diceState.hidden = false;
      diceState.projLocked = true;
    } else {
      diceState.hidden = false;
    }
    renderDice();
  }, 1300);
}
function diceToggleHide(){
  if(diceState.rolling) return;
  diceState.hidden = !diceState.hidden;
  renderDice();
}
function diceRevealProj(){ diceState.projLocked = false; renderDice(); }
function diceLockProj(){ diceState.projLocked = true; renderDice(); }
function renderDice(){
  var box = document.getElementById('mg-dice-box');
  if(!box) return;
  var H = '';
  H += '<p class="mut">🎬 主持流程：想全場一齊睇→「公開擲」；想領袖先核對先公布（抽中先至投）→「🔒 秘密擲」，擲完先撳「🖥️ 投出結果」。</p>';
  H += '<label class="mg-lbl mg-toggle"><input type="checkbox" '+(diceState.secret?'checked':'')+' onchange="diceSetSecret(this.checked)"> 🔒 秘密擲（結果先淨係你睇到）</label>';
  H += '<div class="mg-dice"><span id="mg-dice-face">'+(diceState.value||'')+'</span></div>';
  var note = '';
  if(diceState.rolling) note = '擲緊…';
  else if(diceState.secret && diceState.value){
    note = '🔒 結果淨係喺呢部手機——核對完先撳「🖥️ 投出結果」';
  } else if(diceState.hidden && diceState.value) note = '🔒 已遮擋（大話骰）';
  H += '<p class="mut">'+note+'</p>';
  H += '<div class="mg-btns"><button class="mg-primary" onclick="rollDice()">🎲 擲骰子</button>';
  if(!diceState.secret && diceState.value && !diceState.rolling) H += '<button onclick="diceToggleHide()">'+(diceState.hidden?'👁️ 顯示':'🙈 遮擋')+'</button>';
  if(diceState.secret && diceState.value && !diceState.rolling){
    H += '<button class="mg-proj" onclick="diceRevealProj()">🖥️ 投出結果</button>';
    if(!diceState.projLocked) H += '<button onclick="diceLockProj()">🔒 再鎖投影</button>';
  }
  H += '<button onclick="Projector.live(\'mg:dice\',\'🎲 骰子\')">🖥️ 投影</button></div>';
  box.innerHTML = H;
  if (typeof Projector !== 'undefined' && Projector.on && Projector.liveKind==='mg:dice') Projector.render();
}

/* ══════════ 幸運轉盤（任務）══════════ */
var wheelItems = ['講一個冷知識','唱一句歌','扮一只貓','講自己一個童年糗事','比劃一個動作畀人猜','用三句講晒今日集會'];
var wheelState = { result:'' };
function wheelAddItem(){
  var v = prompt('新任務：');
  if(v && v.trim()){ wheelItems.push(v.trim()); renderWheel(); }
}
function wheelDelItem(i){ wheelItems.splice(i,1); renderWheel(); }
function spinWheel(){
  var i = Math.floor(Math.random()*wheelItems.length);
  wheelState.result = wheelItems[i];
  renderWheel();
  /* 投影要等領袖撳「投影」先至顯示結果（避免未轉先洩漏） */
}
function renderWheel(){
  var box = document.getElementById('mg-wheel-box');
  if(!box) return;
  var H = '';
  H += '<p class="mut">🎬 主持流程：① 任務喺手機改（唔好提前投）→ ② 撳「️ 投影」出空盤 → ③ 即場抽人轉（或領袖代轉）→ ④ 轉完投影自動出任務，嗰人做。</p>';
  H += '<p><b>任務列表：</b></p><ul class="mg-wheel-list">';
  wheelItems.forEach(function(it,i){
    H += '<li>'+it+' <button class="mg-del" onclick="wheelDelItem('+i+')" aria-label="移除">✕</button></li>';
  });
  H += '</ul>';
  H += '<p class="mg-btns"><button onclick="wheelAddItem()">＋ 加任務</button></p>';
  H += '<div class="mg-wheel"><button class="mg-primary mg-spin" onclick="spinWheel()">🎡 轉盤！</button></div>';
  if(wheelState.result){
    H += '<p class="mut">🎯 抽中：<b>'+wheelState.result+'</b></p>'
      + '<p class="mg-btns"><button class="mg-proj" onclick="Projector.live(\'mg:wheel\',\'🎡 幸運轉盤\')">🖥️ 投影結果（全場睇）</button></p>';
  }
  box.innerHTML = H;
  if (typeof Projector !== 'undefined' && Projector.on && Projector.liveKind==='mg:wheel') Projector.render();
}

/* ══════════ 投屏版本（投影屏淨係顯示・由領袖手機「推」）══════════ */
MiniGame.projMode = null;
MiniGame.projHtml = function(){
  var m = MiniGame.projMode;
  if(m==='spy'){
    var H = '<h3>🕵️ 誰是臥底</h3>';
    if(spyState.phase==='setup'){
      H += '<p class="pj-big">🃏 準備派卡</p><p class="pj-note">領袖一次過派卡：每人都得一張，逐張翻開畀本人看、即刻掩返。<br>派好卡先開始第一輪。</p>';
    } else if(spyState.phase==='play'){
      H += '<p class="pj-big">第 '+spyState.round+' 輪</p><p>🗣️ 由 <b>'+spyState.players[spyState.firstTurn]+'</b> 先講（每人一句描述特徵）</p>';
      H += '<p class="pj-note">講完一圈→投票；身份詞只有領袖有，唔會喺投影出現。</p>';
    } else {
      H += '<p class="pj-big">🎉 揭曉</p><p>🕵️ 臥底詞：<b class="pj-huge">'+spyState.words.spy+'</b><br>👥 普通詞：<b class="pj-huge">'+spyState.words.common+'</b></p>';
    }
    return H;
  }
  if(m==='agent'){
    var A = '<h3>🕴️ 機密特務（5×5 猜詞）</h3>';
    if(!agentState.grid.length){
      A += '<p class="pj-big">準備開始</p><p class="pj-note">撳「新盤」先出詞牌。</p>';
      return A;
    }
    A += '<p class="pj-turn '+(agentState.turn==='red'?'t-red':'t-blue')+'">'+(agentState.turn==='red'?'🔴 紅隊喊提示中':'🔵 藍隊喊提示中')+'</p>';
    A += agentProjGrid();
    var red=0, blue=0;
    agentState.grid.forEach(function(g){ if(g.revealed){ if(g.type==='red') red++; if(g.type==='blue') blue++; } });
    A += '<p class="pj-note">🔴 紅隊已收 '+red+'／2　🔵 藍隊已收 '+blue+'／2　（未翻＝灰牌；顏色由隊長喺自己手機攞，唔會喺投影出現）</p>';
    if(agentState.over){
      A += '<p class="pj-big">'+(agentState.winner ? '🏆 '+(agentState.winner==='red'?'紅隊':'藍隊')+'贏！' : '💣 撞炸彈——遊戲結束！')+'</p>';
    }
    return A;
  }
  if(m==='dice'){
    var D = '<h3>🎲 骰子</h3>';
    if(diceState.secret && diceState.projLocked){
      D += '<p class="pj-big">🔒 秘密擲</p><p class="pj-note">結果淨係領袖手機有——等領袖「投出結果」先至見到。</p>';
    } else if(diceState.rolling){
      D += '<p class="pj-big">🎲 擲緊…</p>';
    } else if(diceState.value && !diceState.hidden){
      D += '<p class="pj-huge">'+diceState.value+'</p>';
    } else {
      D += '<p class="pj-big">'+(diceState.value?'🔒 已遮擋':'（未擲）')+'</p><p class="pj-note">撳「 擲骰子」開始。</p>';
    }
    return D;
  }
  if(m==='wheel'){
    var W = '<h3>🎡 幸運轉盤</h3>';
    if(wheelState.result){
      W += '<p class="pj-big">🎯 抽中任務</p><p class="pj-huge">'+wheelState.result+'</p>';
    } else {
      W += '<p class="pj-big">🎡 輪到你轉！</p><p class="pj-note">即場抽人轉（或領袖代轉）；轉完先至出任務。</p>';
    }
    return W;
  }
  return '<p class="pj-big">（冇內容）</p>';
};

/* ══════════ 掛載：將工具盒插去各咁位 ══════════ */
MiniGame.mount = function(){
  var s = document.getElementById('mg-spy-box');
  if(s){ renderSpy(); }
  var a = document.getElementById('mg-agent-box');
  if(a){ renderAgent(); }
  var d = document.getElementById('mg-dice-box');
  if(d){ renderDice(); }
  var w = document.getElementById('mg-wheel-box');
  if(w){ renderWheel(); }
};
/* 手冊→集會工具 用嘅整塊（同一組 box id） */
MiniGame.htmlBlock = function(){
  return '<div class="mg-tools"><div id="mg-spy-box"></div><div id="mg-agent-box"></div><div id="mg-dice-box"></div><div id="mg-wheel-box"></div></div>';
};

/* 掛去 MiniGame 上（測試／外部呼叫用；onclick 用全局名都得） */
MiniGame.spyPrintCards = spyPrintCards;
MiniGame.renderSpy = renderSpy;
MiniGame.renderAgent = renderAgent;
MiniGame.renderDice = renderDice;
MiniGame.renderWheel = renderWheel;
MiniGame.agentDeal = agentDeal;
MiniGame.agentFlip = agentFlip;
MiniGame.agentCodeEncode = agentCodeEncode;
MiniGame.agentCodeDecode = agentCodeDecode;
MiniGame.tvAgentSet = tvAgentSet;
MiniGame.tvAgentFlip = tvAgentFlip;
MiniGame.tvAgentScore = tvAgentScore;
MiniGame.tvAgentReset = tvAgentReset;
MiniGame.renderTvAgent = renderTvAgent;
MiniGame.rollDice = rollDice;
MiniGame.spinWheel = spinWheel;

if (typeof module !== 'undefined' && module.exports) module.exports = MiniGame;
