/* minigame.js — 聚會 MINI GAME 內建互動工具箱（完整內嵌版）
 * 完全內置於 VSMeeting 本地運行，無需任何外部連線或跳出至第三方網站。
 * 包含（全部領袖一部手機搞得掂，唔使逐個傳機）：
 * 1. 🕵️ 誰是臥底（領袖主持：一次過抽詞＋可列印秘密卡一次過派）
 * 2. 🕴️ 機密特務（Codenames 5×5 隊長／隊員特務密碼板）
 * 3. 🎲 聚會骰子工具（1–6 顆、遮擋模式）
 * 4. 🎡 幸運轉盤（自訂破冰任務／獎勵）
 * 註：帶投注輸贏性質嘅玩法（21 點、撲克等）一律唔收錄，唔符合童軍活動原則。
 */

var MiniGame = {};

/* ═══════════ 1. 誰是臥底 ═══════════ */
MiniGame.spyTopics = {
  party: {
    label: '派對娛樂',
    pairs: [
      ['啤酒', '清酒'], ['KTV', '酒吧'], ['麻將', '撲克牌'], ['露營', '野餐'],
      ['遊樂園', '夜市'], ['桌遊', '電玩'], ['保齡球', '撞球'], ['密室逃脫', '劇本殺'],
      ['跨年晚會', '中秋烤肉'], ['生日蛋糕', '婚禮蛋糕'], ['電影院', '歌劇院']
    ]
  },
  food: {
    label: '飲食生活',
    pairs: [
      ['奶茶', '咖啡'], ['漢堡', '三明治'], ['可樂', '雪碧'], ['火鍋', '麻辣燙'],
      ['拉麵', '烏冬麵'], ['水餃', '鍋貼'], ['冰淇淋', '雪葩'], ['臭豆腐', '榴槤'],
      ['滷肉飯', '牛肉麵'], ['披薩', '蔥油餅'], ['珍珠奶茶', '楊枝甘露']
    ]
  },
  scout: {
    label: '童軍與戶外',
    pairs: [
      ['帳篷', '天幕'], ['指南針', 'GPS導航'], ['氣爐', '營火'], ['行山杖', '童軍棍'],
      ['睡袋', '防潮墊'], ['急救包', '求生包'], ['先鋒工程', '步操'], ['平結', '接繩結'],
      ['稱人結', '雙套結'], ['地圖等高線', '衛星空照圖'], ['無痕山林', '郊野守則']
    ]
  },
  life: {
    label: '日常校園與職場',
    pairs: [
      ['手機', '平板'], ['耳機', '喇叭'], ['雨傘', '雨衣'], ['圖書館', '自修室'],
      ['期中考', '期末考'], ['報告', '考試'], ['鬧鐘', '手錶'], ['外賣', '堂食'],
      ['捷運', '高鐵'], ['實習生', '正職'], ['面試', '答辯']
    ]
  }
};

MiniGame.spyState = {
  players: 6,
  spies: 1,
  topicKey: 'random',          // 'random'＝後台祕密抽主題（開局前唔會顯示）
  topicLabel: '',
  pair: { civil: '', spy: '' },
  roles: [],
  phase: 'setup',              // setup → play → result
  hostOpen: false,             // 主持面板：身份同詞攤開定收起（投屏前要收起）
  timerLeft: 180,
  timerId: null,
  votedIdx: -1
};

MiniGame.spyTimerStop = function(){
  if(MiniGame.spyState.timerId){ clearInterval(MiniGame.spyState.timerId); MiniGame.spyState.timerId = null; }
};

MiniGame.spyClockText = function(sec){
  var m = Math.floor(sec / 60), s = sec % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
};

/* 抽詞：主題由後台祕密抽（可自選），平民詞／臥底詞一對，開局前唔會顯示 */
MiniGame.spyPickPair = function(){
  var st = MiniGame.spyState;
  var keys = Object.keys(MiniGame.spyTopics);
  var key = st.topicKey;
  if(key === 'random' || !MiniGame.spyTopics[key]) key = keys[Math.floor(Math.random() * keys.length)];
  var topic = MiniGame.spyTopics[key];
  var pair = topic.pairs[Math.floor(Math.random() * topic.pairs.length)];
  var swap = Math.random() < 0.5;
  st.topicLabel = topic.label + (st.topicKey === 'random' ? '（後台祕密抽出）' : '');
  st.pair = { civil: swap ? pair[1] : pair[0], spy: swap ? pair[0] : pair[1] };
};

MiniGame.startSpyGame = function(){
  var st = MiniGame.spyState;
  MiniGame.spyTimerStop();
  MiniGame.spyPickPair();

  var count = parseInt(st.players, 10) || 6;
  if(count < 4) count = 4;
  if(count > 16) count = 16;
  var spyCount = parseInt(st.spies, 10) || 1;
  if(spyCount >= count) spyCount = 1;

  var roles = [];
  for(var i = 0; i < count; i++){
    roles.push({ id: i + 1, name: '隊員 ' + (i + 1), word: st.pair.civil, isSpy: false });
  }
  var picked = [];
  while(picked.length < spyCount){
    var r = Math.floor(Math.random() * count);
    if(picked.indexOf(r) < 0) picked.push(r);
  }
  picked.forEach(function(idx){ roles[idx].word = st.pair.spy; roles[idx].isSpy = true; });

  st.players = count;
  st.roles = roles;
  st.phase = 'play';
  st.hostOpen = false;
  st.votedIdx = -1;
  st.timerLeft = 180;
  MiniGame.renderSpyUI();
};

MiniGame.spyTimerToggle = function(){
  var st = MiniGame.spyState;
  if(st.timerId){ MiniGame.spyTimerStop(); MiniGame.renderSpyUI(); return; }
  if(st.timerLeft <= 0) st.timerLeft = 180;
  st.timerId = setInterval(MiniGame.spyTick, 1000);
  MiniGame.renderSpyUI();
};

MiniGame.spyTimerReset = function(){
  MiniGame.spyTimerStop();
  MiniGame.spyState.timerLeft = 180;
  MiniGame.renderSpyUI();
};

MiniGame.spyTick = function(){
  var st = MiniGame.spyState;
  st.timerLeft--;
  if(st.timerLeft <= 0){ st.timerLeft = 0; MiniGame.spyTimerStop(); }
  var clock = document.getElementById('mg-spy-clock');
  if(clock) clock.textContent = st.timerId ? MiniGame.spyClockText(st.timerLeft) : '時間到，開始公投！';
  if(!st.timerId) MiniGame.renderSpyUI();
};

MiniGame.spyPick = function(idx){
  MiniGame.spyState.votedIdx = (MiniGame.spyState.votedIdx === idx ? -1 : idx);
  MiniGame.renderSpyUI();
};

MiniGame.spyReveal = function(){
  MiniGame.spyTimerStop();
  MiniGame.spyState.phase = 'result';
  MiniGame.renderSpyUI();
};

MiniGame.spyToggleHost = function(){
  MiniGame.spyState.hostOpen = !MiniGame.spyState.hostOpen;
  MiniGame.renderSpyUI();
};

/* 秘密卡：A4 一版印晒，剪開一次過派（唔使逐個傳手機） */
MiniGame.spyCardsHtml = function(){
  var st = MiniGame.spyState;
  return '<div id="mg-spy-cards" data-title="誰是臥底・秘密卡（剪開一次過派）" style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">'
    + st.roles.map(function(r){
        return '<div style="border:1.5px dashed #333;border-radius:8px;padding:10px 12px;color:#000;background:#fff;page-break-inside:avoid;break-inside:avoid;">'
          + '<div style="font-size:11px;letter-spacing:1px;color:#555;">🕵️ 誰是臥底 ｜ 秘密卡</div>'
          + '<div style="font-size:12px;margin-top:2px;color:#333;">' + r.name + '</div>'
          + '<div style="font-size:22px;font-weight:900;margin:4px 0;">' + r.word + '</div>'
          + '<div style="font-size:10px;color:#555;">睇完蓋住；描述時唔准講出個詞</div>'
          + '</div>';
      }).join('')
    + '</div>';
};

MiniGame.spyPrintCards = function(){
  var node = document.getElementById('mg-spy-cards');
  if(!node) return;
  if(typeof App !== 'undefined' && App.printSec){ App.printSec(node); return; }
  if(typeof window !== 'undefined' && window.print) window.print();
};

MiniGame.spyRules = [
  '每人輪流講一句：形容你手上嘅詞（唔准講出個詞本身，亦唔准太露骨）',
  '一輪發言之後，全團公投：邊個最可疑？',
  '被投出嗰位如果係臥底＝平民勝；唔係＝臥底勝',
  '全場零賭注：唔准任何金錢或物質輸贏'
];

MiniGame.renderSpyUI = function(){
  var container = document.getElementById('mg-spy-box');
  if(!container) return;
  var st = MiniGame.spyState;

  var projBtn = ' <button class="button proj-big" style="background:#1565C0;color:#fff;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-weight:bold;font-size:13px;" onclick="Projector.live(\'mg:spy\',\'🕵️ 誰是臥底\')">🖥️ 投影大螢幕</button>';

  /* ── 設定 ── */
  if(st.phase === 'setup'){
    var optHtml = '<option value="random" ' + (st.topicKey === 'random' ? 'selected' : '') + '>🎲 後台祕密抽（開局前唔顯示）</option>'
      + Object.keys(MiniGame.spyTopics).map(function(k){
          return '<option value="' + k + '" ' + (st.topicKey === k ? 'selected' : '') + '>' + MiniGame.spyTopics[k].label + '</option>';
        }).join('');

    container.innerHTML = '<div class="card" style="background:#F9FBE7;border:1px solid #C0CA33;padding:12px;border-radius:8px;">'
      + '<h4 style="margin:0 0 6px 0;color:#33691E;">🕵️ 誰是臥底（領袖主持・一次過派卡）</h4>'
      + '<p class="mut" style="font-size:13px;margin:0 0 10px 0;">領袖一部手機就夠：app 一次過抽好詞同身份，領袖印／抄落卡紙<b>一次過派</b>，唔使逐個傳手機——集會即開即玩。</p>'
      + '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:12px;">'
      + '<label>總人數：<input type="number" min="4" max="16" value="' + st.players + '" style="width:55px;" onchange="MiniGame.spyState.players=parseInt(this.value,10)"></label>'
      + '<label>臥底數：<input type="number" min="1" max="3" value="' + st.spies + '" style="width:45px;" onchange="MiniGame.spyState.spies=parseInt(this.value,10)"></label>'
      + '<label>題庫：<select onchange="MiniGame.spyState.topicKey=this.value">' + optHtml + '</select></label>'
      + '</div>'
      + '<button style="background:#33691E;color:#fff;border:none;padding:9px 16px;border-radius:6px;cursor:pointer;font-weight:bold;" onclick="MiniGame.startSpyGame()">🎲 一次過發牌（抽詞＋身份）</button>'
      + projBtn
      + '<p class="mut" style="font-size:12px;margin:10px 0 0 0;">⚠️ 純口頭推理，零賭注；用完記得收回秘密卡。</p>'
      + '</div>';
    return;
  }

  var wordLine = '<div style="font-size:13px;color:#33691E;margin-bottom:8px;">主題：<b>' + st.topicLabel + '</b>｜人數 <b>' + st.roles.length + '</b>｜臥底 <b>' + st.roles.filter(function(r){ return r.isSpy; }).length + '</b></div>';

  /* ── 發牌後：主持面板＋發言＋公投 ── */
  if(st.phase === 'play'){
    var spyList = st.roles.map(function(r){
      return '<li style="padding:3px 0;"><b>' + r.name + '</b>：'
        + (r.isSpy ? '<span style="color:#C62828;font-weight:bold;">[臥底]</span>' : '<span style="color:#2E7D32;">[平民]</span>')
        + ' 詞「' + r.word + '」</li>';
    }).join('');

    var voteBtns = st.roles.map(function(r, i){
      var on = st.votedIdx === i;
      return '<button style="padding:6px 10px;border-radius:6px;cursor:pointer;font-size:13px;border:1px solid ' + (on ? '#C62828' : '#C0CA33') + ';background:' + (on ? '#FFEBEE' : '#fff') + ';font-weight:' + (on ? 'bold' : 'normal') + ';" onclick="MiniGame.spyPick(' + i + ')">' + r.name + (on ? ' ⬅ 被投出' : '') + '</button>';
    }).join(' ');

    container.innerHTML = '<div class="card" style="background:#F9FBE7;border:1px solid #C0CA33;padding:12px;border-radius:8px;">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">'
      + '<h4 style="margin:0;color:#33691E;">🕵️ 誰是臥底・已經發牌</h4>'
      + '<button style="background:none;border:none;cursor:pointer;font-size:12px;text-decoration:underline;" onclick="MiniGame.spyTimerStop();MiniGame.spyState.phase=\'setup\';MiniGame.renderSpyUI();">⚙️ 改設定</button>'
      + '</div>'
      + wordLine
      + '<details style="margin:10px 0;background:#fff;padding:8px;border-radius:6px;border:1px solid #DCEDC8;"' + (st.hostOpen ? ' open' : '') + '>'
      + '<summary style="cursor:pointer;font-weight:bold;color:#33691E;" onclick="event.preventDefault();MiniGame.spyToggleHost();">'
      + (st.hostOpen ? '🙈 收起主持面板（投屏前要收）' : '👑 主持面板（睇身份同詞）') + '</summary>'
      + '<ul style="margin:8px 0 0 16px;padding:0;font-size:13px;">' + spyList + '</ul></details>'
      + '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#fff;border:1px solid #DCEDC8;border-radius:6px;padding:8px 10px;margin-bottom:10px;">'
      + '<b>⏱️ 發言計時：</b><span id="mg-spy-clock" style="font-size:18px;font-weight:900;color:#33691E;">' + MiniGame.spyClockText(st.timerLeft) + '</span>'
      + '<button style="background:' + (st.timerId ? '#F57F17' : '#33691E') + ';color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:bold;" onclick="MiniGame.spyTimerToggle()">' + (st.timerId ? '⏸️ 停一停' : '▶️ 開始計時') + '</button>'
      + '<button style="background:#78909C;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;" onclick="MiniGame.spyTimerReset()">🔄 重設 3:00</button>'
      + '</div>'
      + '<div style="font-size:13px;margin-bottom:10px;"><b>🗣️ 玩法</b><ul style="margin:6px 0 0 18px;padding:0;">'
      + MiniGame.spyRules.map(function(r){ return '<li>' + r + '</li>'; }).join('')
      + '</ul></div>'
      + '<div style="font-size:13px;margin-bottom:8px;"><b>🗳️ 公投（邊個被投出？）</b><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">' + voteBtns + '</div></div>'
      + '<button style="background:#1B5E20;color:#fff;border:none;padding:9px 16px;border-radius:6px;cursor:pointer;font-weight:bold;" onclick="MiniGame.spyReveal()">🔎 揭曉結果</button>'
      + projBtn
      + '<details style="margin-top:12px;background:#fff;padding:8px;border-radius:6px;border:1px dashed #9E9D24;">'
      + '<summary style="cursor:pointer;font-weight:bold;color:#33691E;">🖨️ 秘密卡（印出嚟剪開一次過派）</summary>'
      + '<p class="mut" style="font-size:12px;margin:6px 0;">一版 A4 印晒全部秘密卡，剪開派俾每個人；卡上只有詞、冇身份，平民同臥底嘅卡一模一樣。</p>'
      + '<button class="print-btn" style="background:#33691E;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:bold;margin-bottom:8px;" onclick="MiniGame.spyPrintCards()">🖨️ 列印秘密卡</button>'
      + MiniGame.spyCardsHtml()
      + '</details>'
      + '</div>';
    return;
  }

  /* ── 揭曉 ── */
  var spies = st.roles.filter(function(r){ return r.isSpy; }).map(function(r){ return r.name; });
  var judged = '';
  if(st.votedIdx >= 0){
    var outed = st.roles[st.votedIdx];
    judged = '<div style="margin:8px 0;padding:8px 10px;border-radius:6px;font-weight:bold;background:' + (outed.isSpy ? '#E8F5E9' : '#FFEBEE') + ';color:' + (outed.isSpy ? '#1B5E20' : '#B71C1C') + ';">'
      + '🗳️ 公投結果：' + outed.name + ' 被投出 → ' + (outed.isSpy ? '✅ 捉到臥底，平民勝！' : '❌ 捉錯人，臥底勝！') + '</div>';
  }
  container.innerHTML = '<div class="card" style="background:#E8F5E9;border:1px solid #A5D6A7;padding:12px;border-radius:8px;">'
    + '<h4 style="margin:0 0 8px 0;color:#1B5E20;">🔎 揭曉</h4>'
    + judged
    + '<div style="font-size:15px;margin-bottom:6px;">平民詞：<b style="color:#2E7D32;">「' + st.pair.civil + '」</b></div>'
    + '<div style="font-size:15px;margin-bottom:6px;">臥底詞：<b style="color:#C62828;">「' + st.pair.spy + '」</b></div>'
    + '<div style="font-size:15px;margin-bottom:10px;">臥底係：<b>' + spies.join('、') + '</b></div>'
    + '<div style="font-size:13px;color:#33691E;margin-bottom:10px;">主題：' + st.topicLabel + '（' + st.roles.length + ' 人）</div>'
    + '<button style="background:#33691E;color:#fff;border:none;padding:9px 16px;border-radius:6px;cursor:pointer;font-weight:bold;" onclick="MiniGame.startSpyGame()">🔄 再玩一局（同設定）</button> '
    + '<button style="background:#689F38;color:#fff;border:none;padding:9px 16px;border-radius:6px;cursor:pointer;" onclick="MiniGame.spyState.phase=\'setup\';MiniGame.renderSpyUI();">⚙️ 改設定</button>'
    + projBtn
    + '</div>';
};

/* ═══════════ 2. 機密特務 (5x5 Codenames) ═══════════ */
MiniGame.agentWords = [
  '指南針','營火','睡袋','天幕','先鋒','地圖','等高線','無痕山林','平結','稱人結',
  '雙套結','十字編結','步操','誓詞','旅巾','急救包','哨子','頭燈','氣爐','水樽',
  '露營','夜行','遠征','執委會','自立','責任','探險','活動','榮譽','童軍',
  '山脊','山谷','防潮墊','登山杖','童軍棍','反光鏡','風褸','繩圈','三角巾','繃帶'
];

MiniGame.agentState = {
  grid: [],
  score: { redTotal: 9, blueTotal: 8, redLeft: 9, blueLeft: 8 },
  viewRole: 'player'
};

MiniGame.initAgentGame = function(){
  var words = MiniGame.agentWords.slice();
  words.sort(function(){ return 0.5 - Math.random(); });
  var chosen = words.slice(0, 25);

  var types = [];
  for(var i=0; i<9; i++) types.push('red');
  for(var i=0; i<8; i++) types.push('blue');
  for(var i=0; i<7; i++) types.push('neutral');
  types.push('assassin');
  types.sort(function(){ return 0.5 - Math.random(); });

  MiniGame.agentState.grid = chosen.map(function(w, idx){
    return { word: w, type: types[idx], revealed: false };
  });
  MiniGame.agentState.score = { redTotal: 9, blueTotal: 8, redLeft: 9, blueLeft: 8 };
  MiniGame.agentState.viewRole = 'player';
  MiniGame.renderAgentUI();
};

MiniGame.renderAgentUI = function(){
  var container = document.getElementById('mg-agent-box');
  if(!container) return;
  var st = MiniGame.agentState;
  if(!st.grid.length){ MiniGame.initAgentGame(); return; }

  var isCaptain = st.viewRole === 'captain';

  var cardsHtml = st.grid.map(function(card, idx){
    var bg = '#ECEFF1';
    var color = '#263238';
    var border = '1px solid #CFD8DC';

    if(card.revealed){
      if(card.type === 'red'){ bg = '#FFCDD2'; color = '#B71C1C'; border = '2px solid #E53935'; }
      else if(card.type === 'blue'){ bg = '#BBDEFB'; color = '#0D47A1'; border = '2px solid #1E88E5'; }
      else if(card.type === 'assassin'){ bg = '#212121'; color = '#fff'; border = '2px solid #000'; }
      else { bg = '#CFD8DC'; color = '#546E7A'; }
    } else if(isCaptain){
      if(card.type === 'red'){ border = '3px solid #E53935'; bg = '#FFEBEE'; }
      else if(card.type === 'blue'){ border = '3px solid #1E88E5'; bg = '#E3F2FD'; }
      else if(card.type === 'assassin'){ border = '3px solid #000'; bg = '#E0E0E0'; }
      else { border = '1px dashed #B0BEC5'; }
    }

    return '<button onclick="MiniGame.clickAgentCard(' + idx + ')" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:52px;background:' + bg + ';color:' + color + ';border:' + border + ';border-radius:6px;font-size:13px;font-weight:bold;cursor:pointer;padding:2px;user-select:none;">'
      + card.word
      + (card.revealed ? '<span style="font-size:10px;margin-top:2px;">' + (card.type === 'red' ? '🔴紅' : card.type === 'blue' ? '🔵藍' : card.type === 'assassin' ? '☠️炸彈' : '⚪平民') + '</span>' : '')
      + '</button>';
  }).join('');

  container.innerHTML = '<div class="card" style="background:#EDE7F6;border:1px solid #B39DDB;padding:12px;border-radius:8px;">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">'
    + '<h4 style="margin:0;color:#4A148C;">🕴️ 機密特務（5×5 Codenames 特務密碼）</h4>'
    + '<div style="font-size:13px;">🔴 紅隊剩 <b>' + st.score.redLeft + '</b> ｜ 🔵 藍隊剩 <b>' + st.score.blueLeft + '</b></div>'
    + '</div>'
    + '<p class="mut" style="font-size:12px;margin:0 0 10px 0;">紅藍雙方隊長看答案卡並給出【提示詞＋數字】（如「露營 2」），隊員點擊詞板翻牌。猜中對方詞送分，猜中炸彈 ☠️ 立即落敗！</p>'
    + '<div style="display:flex;gap:10px;margin-bottom:10px;">'
    + '<button style="flex:1;padding:6px;border-radius:6px;font-weight:bold;cursor:pointer;background:' + (isCaptain ? '#E0E0E0' : '#5E35B1') + ';color:' + (isCaptain ? '#333' : '#fff') + ';border:none;" onclick="MiniGame.agentState.viewRole=\'player\';MiniGame.renderAgentUI();">👥 隊員視角（全平民）</button>'
    + '<button style="flex:1;padding:6px;border-radius:6px;font-weight:bold;cursor:pointer;background:' + (isCaptain ? '#5E35B1' : '#E0E0E0') + ';color:' + (isCaptain ? '#fff' : '#333') + ';border:none;" onclick="MiniGame.agentState.viewRole=\'captain\';MiniGame.renderAgentUI();">👑 隊長視角（全見底牌）</button>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:6px;margin-bottom:10px;">' + cardsHtml + '</div>'
    + '<button class="button" style="background:#512DA8;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:12px;" onclick="MiniGame.initAgentGame()">🔄 重新生成 5×5 題目盤</button> <button class="button proj-big" style="background:#1565C0;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:bold;" onclick="Projector.live(\'mg:agent\',\'🕴️ 機密特務\')">🖥️ 投影大螢幕</button>'
    + '</div>';
};

MiniGame.clickAgentCard = function(idx){
  var card = MiniGame.agentState.grid[idx];
  if(!card || card.revealed) return;
  card.revealed = true;
  if(card.type === 'red' && MiniGame.agentState.score.redLeft > 0) MiniGame.agentState.score.redLeft--;
  if(card.type === 'blue' && MiniGame.agentState.score.blueLeft > 0) MiniGame.agentState.score.blueLeft--;
  if(card.type === 'assassin') alert('☠️ 踩中炸彈！該隊立即落敗！');
  MiniGame.renderAgentUI();
};

/* ═══════════ 3. 聚會骰子工具（1–6 顆／遮擋模式） ═══════════ */
MiniGame.diceState = {
  count: 5,
  results: [1, 2, 3, 4, 5],
  hidden: false
};

MiniGame.rollDice = function(){
  var st = MiniGame.diceState;
  var res = [];
  for(var i=0; i<st.count; i++){
    res.push(Math.floor(Math.random()*6) + 1);
  }
  st.results = res;
  MiniGame.renderDiceUI();
};

MiniGame.renderDiceUI = function(){
  var container = document.getElementById('mg-dice-box');
  if(!container) return;
  var st = MiniGame.diceState;

  var diceEmojis = ['⚀','⚁','⚂','⚃','⚄','⚅'];
  var diceHtml = st.results.map(function(num){
    if(st.hidden){
      return '<span style="display:inline-block;width:42px;height:42px;line-height:42px;background:#263238;color:#90A4AE;border-radius:8px;font-size:22px;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.2);">🔒</span>';
    }
    return '<span style="display:inline-block;width:42px;height:42px;line-height:42px;background:#fff;color:#D84315;border:2px solid #FF7043;border-radius:8px;font-size:28px;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.15);font-weight:bold;">' + diceEmojis[num-1] + '</span>';
  }).join(' ');

  container.innerHTML = '<div class="card" style="background:#FBE9E7;border:1px solid #FFAB91;padding:12px;border-radius:8px;">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
    + '<h4 style="margin:0;color:#D84315;">🎲 聚會骰子工具（支援大話骰/防偷看模式）</h4>'
    + '<label>骰子數：<select onchange="MiniGame.diceState.count=parseInt(this.value,10);MiniGame.rollDice()">'
    + [1,2,3,4,5,6].map(function(n){ return '<option value="' + n + '" ' + (st.count===n?'selected':'') + '>' + n + ' 顆</option>'; }).join('')
    + '</select></label>'
    + '</div>'
    + '<div style="display:flex;gap:8px;justify-content:center;padding:12px 0;background:rgba(255,255,255,0.6);border-radius:8px;margin-bottom:10px;">'
    + diceHtml
    + '</div>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">'
    + '<button style="background:#D84315;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:bold;cursor:pointer;" onclick="MiniGame.rollDice()">🎲 搖一搖 / 擲骰</button>'
    + '<button style="background:#546E7A;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:bold;cursor:pointer;" onclick="MiniGame.diceState.hidden=!MiniGame.diceState.hidden;MiniGame.renderDiceUI()">'
    + (st.hidden ? '👁️ 揭曉骰面' : '🔒 遮擋（大話骰偷看模式）')
    + '</button>' + '<button class="button proj-big" style="background:#1565C0;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:bold;cursor:pointer;" onclick="Projector.live(\'mg:dice\',\'🎲 聚會骰子\')">🖥️ 投影大螢幕</button>'
    + '</div>'
    + '</div>';
};

/* ═══════════ 4. 幸運轉盤 ═══════════ */
MiniGame.wheelItems = ['自我介紹＋個人專長', '講一件最糗的露營經驗', '伏地挺身 / 深蹲 5 下', '免罰一次（幸運過關）', '唱一句童軍歌曲或會歌', '指定在場一人回答提問', '模仿一種動物叫聲 10 秒'];
MiniGame.spinWheel = function(){
  var idx = Math.floor(Math.random() * MiniGame.wheelItems.length);
  var target = MiniGame.wheelItems[idx];
  var out = document.getElementById('mg-wheel-result');
  if(out){
    out.innerHTML = '<span style="color:#E65100;font-size:18px;font-weight:bold;">🎯 轉盤抽中：【' + target + '】</span>';
  }
};

MiniGame.renderWheelUI = function(){
  var container = document.getElementById('mg-wheel-box');
  if(!container) return;
  var itemsHtml = MiniGame.wheelItems.map(function(it, i){
    return '<span style="background:#FFF3E0;color:#E65100;padding:3px 8px;border-radius:12px;font-size:12px;border:1px solid #FFE0B2;">' + (i + 1) + '. ' + it + '</span>';
  }).join(' ');

  container.innerHTML = '<div class="card" style="background:#FFFDE7;border:1px solid #FFF59D;padding:12px;border-radius:8px;">'
    + '<h4 style="margin:0 0 6px 0;color:#F57F17;">🎡 聚會互動幸運轉盤</h4>'
    + '<p class="mut" style="font-size:12px;margin:0 0 8px 0;">破冰互動或集會遊戲懲罰隨機抽取小工具。</p>'
    + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">' + itemsHtml + '</div>'
    + '<button style="background:#F57F17;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:bold;cursor:pointer;" onclick="MiniGame.spinWheel()">🎲 轉一下！</button> <button class="button proj-big" style="background:#1565C0;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:bold;cursor:pointer;" onclick="Projector.live(\'mg:wheel\',\'🎡 幸運轉盤\')">🖥️ 投影大螢幕</button>'
    + '<div id="mg-wheel-result" style="margin-top:8px;"></div>'
    + '</div>';
};

/* ═══════════ 單一掛載點 ═══════════ */
MiniGame.htmlBlock = function(){
  return '<div class="minigame-hub" style="margin-top:14px;">'
    + '<div id="mg-spy-box" style="margin-bottom:12px;"></div>'
    + '<div id="mg-agent-box" style="margin-bottom:12px;"></div>'
    + '<div id="mg-dice-box" style="margin-bottom:12px;"></div>'
    + '<div id="mg-wheel-box"></div>'
    + '</div>';
};

MiniGame.mount = function(){
  MiniGame.renderSpyUI();
  MiniGame.renderAgentUI();
  MiniGame.renderDiceUI();
  MiniGame.renderWheelUI();
};

if (typeof module !== 'undefined' && module.exports) module.exports = MiniGame;

/* ═══════════ 投影支援（大螢幕/電視即時同步） ═══════════ */
MiniGame.projMode = 'hub'; // 'hub', 'spy', 'agent', 'dice', 'wheel'

MiniGame.projHtml = function(){
  var mode = MiniGame.projMode;
  if(mode === 'spy'){
    var st = MiniGame.spyState;
    if(st.phase === 'play'){
      var clock = st.timerId || st.timerLeft < 180 ? (st.timerLeft > 0 ? MiniGame.spyClockText(st.timerLeft) : '時間到！') : '3:00';
      return '<div class="pj-minigame" style="text-align:center;padding:20px;">'
        + '<h2 style="font-size:2.2em;color:#1B5E20;margin-bottom:10px;">🕵️ 誰是臥底・發言中</h2>'
        + '<p style="font-size:1.4em;color:#333;margin-bottom:12px;">每人輪流講一句：形容你手上嘅詞，唔准講出個詞本身</p>'
        + '<div style="font-size:3.4em;font-weight:900;color:#33691E;margin:10px 0 18px 0;">⏱️ ' + clock + '</div>'
        + '<div style="display:flex;justify-content:center;gap:15px;flex-wrap:wrap;max-width:900px;margin:0 auto;">'
        + st.roles.map(function(r){
            return '<div style="background:#fff;padding:15px 25px;border-radius:10px;box-shadow:0 4px 10px rgba(0,0,0,0.1);font-size:1.3em;font-weight:bold;color:#2E7D32;">' + r.name + '</div>';
          }).join('')
        + '</div>'
        + '<p style="margin-top:25px;font-size:1.1em;color:#666;">（身份同詞只喺領袖手機嘅主持面板，大螢幕公平無透底）</p>'
        + '</div>';
    }
    if(st.phase === 'result'){
      var spies = st.roles.filter(function(r){ return r.isSpy; }).map(function(r){ return r.name; });
      var judged = '';
      if(st.votedIdx >= 0){
        var outed = st.roles[st.votedIdx];
        judged = '<p style="font-size:1.5em;font-weight:bold;color:' + (outed.isSpy ? '#1B5E20' : '#B71C1C') + ';">🗳️ ' + outed.name + ' 被投出 → '
          + (outed.isSpy ? '✅ 捉到臥底，平民勝！' : '❌ 捉錯人，臥底勝！') + '</p>';
      }
      return '<div class="pj-minigame" style="text-align:center;padding:24px;">'
        + '<h2 style="font-size:2.4em;color:#1B5E20;margin-bottom:10px;">🔎 揭曉</h2>'
        + judged
        + '<p style="font-size:1.8em;margin:8px 0;">平民詞：<b style="color:#2E7D32;">「' + st.pair.civil + '」</b></p>'
        + '<p style="font-size:1.8em;margin:8px 0;">臥底詞：<b style="color:#C62828;">「' + st.pair.spy + '」</b></p>'
        + '<p style="font-size:1.8em;margin:8px 0;">臥底係：<b>' + spies.join('、') + '</b></p>'
        + '</div>';
    }
    return '<div class="pj-minigame" style="text-align:center;padding:30px;">'
      + '<h2 style="font-size:2.4em;color:#1B5E20;margin-bottom:15px;">🕵️ 誰是臥底</h2>'
      + '<div style="font-size:5em;margin:20px 0;">🃏 ✂️</div>'
      + '<p style="font-size:1.6em;color:#444;">秘密卡由領袖一次過派；派完之後由領袖按「開始計時」，大螢幕會顯示發言倒數。</p>'
      + '</div>';
  }

  if(mode === 'agent'){
    var st = MiniGame.agentState;
    var cards = st.grid.map(function(card){
      var bg = '#ECEFF1', color = '#263238', border = '2px solid #CFD8DC';
      if(card.revealed){
        if(card.type === 'red'){ bg = '#FFCDD2'; color = '#B71C1C'; border = '3px solid #E53935'; }
        else if(card.type === 'blue'){ bg = '#BBDEFB'; color = '#0D47A1'; border = '3px solid #1E88E5'; }
        else if(card.type === 'assassin'){ bg = '#212121'; color = '#fff'; border = '3px solid #000'; }
        else { bg = '#CFD8DC'; color = '#546E7A'; }
      }
      return '<div style="height:68px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:'+bg+';color:'+color+';border:'+border+';border-radius:8px;font-size:1.25em;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.08);">'
        + card.word
        + (card.revealed ? '<span style="font-size:0.65em;margin-top:2px;">'+(card.type==='red'?'🔴紅隊':card.type==='blue'?'🔵藍隊':card.type==='assassin'?'☠️炸彈':'⚪中立')+'</span>' : '')
        + '</div>';
    }).join('');

    return '<div class="pj-minigame" style="padding:15px;max-width:1000px;margin:0 auto;">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">'
      + '<h2 style="margin:0;font-size:2em;color:#4A148C;">🕴️ 機密特務（5×5 Codenames）</h2>'
      + '<div style="font-size:1.3em;">🔴 紅隊剩 <b>'+st.score.redLeft+'</b> ｜ 🔵 藍隊剩 <b>'+st.score.blueLeft+'</b></div>'
      + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:10px;">' + cards + '</div>'
      + '</div>';
  }

  if(mode === 'dice'){
    var st = MiniGame.diceState;
    var diceEmojis = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    var diceHtml = st.results.map(function(num){
      if(st.hidden){
        return '<span style="display:inline-block;width:90px;height:90px;line-height:90px;background:#263238;color:#90A4AE;border-radius:16px;font-size:45px;text-align:center;box-shadow:0 4px 10px rgba(0,0,0,0.3);">🔒</span>';
      }
      return '<span style="display:inline-block;width:90px;height:90px;line-height:90px;background:#fff;color:#D84315;border:4px solid #FF7043;border-radius:16px;font-size:60px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.2);font-weight:bold;">' + diceEmojis[num-1] + '</span>';
    }).join(' ');

    return '<div class="pj-minigame" style="text-align:center;padding:30px;">'
      + '<h2 style="font-size:2.4em;color:#D84315;margin-bottom:20px;">🎲 聚會骰子大螢幕</h2>'
      + '<div style="display:flex;gap:15px;justify-content:center;padding:30px 0;background:rgba(255,255,255,0.7);border-radius:16px;max-width:800px;margin:0 auto 20px auto;">'
      + diceHtml
      + '</div>'
      + '<p style="font-size:1.3em;color:#666;">（手機操作搖骰、投屏同步觀看）</p>'
      + '</div>';
  }

  if(mode === 'wheel'){
    var res = document.getElementById('mg-wheel-result');
    var text = res ? res.textContent : '請由領袖點擊手機「轉一下！」';
    return '<div class="pj-minigame" style="text-align:center;padding:30px;">'
      + '<h2 style="font-size:2.4em;color:#E65100;margin-bottom:20px;">🎡 聚會命運幸運轉盤</h2>'
      + '<div style="font-size:6em;margin:20px 0;">🎯</div>'
      + '<div style="font-size:2.2em;font-weight:bold;color:#D84315;background:#FFF3E0;padding:20px;border-radius:12px;border:3px solid #FFE0B2;max-width:800px;margin:0 auto;">' + text + '</div>'
      + '</div>';
  }

  // default hub
  return '<div class="pj-minigame" style="text-align:center;padding:30px;">'
    + '<h2 style="font-size:2.4em;color:#2E7D32;margin-bottom:15px;">🎮 深資童軍聚會 MINI GAME 互動大螢幕</h2>'
    + '<p style="font-size:1.3em;color:#555;">領袖可在手機上選擇投屏遊戲：誰是臥底、機密特務、骰子工具或幸運轉盤。</p>'
    + '</div>';
};
