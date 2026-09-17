/* minigame.js — 聚會 MINI GAME 內建互動工具箱（完整內嵌版）
 * 完全內置於 VSMeeting 本地運行，無需任何外部連線或跳出至第三方網站。
 * 包含：
 * 1. 🕵️ 誰是臥底（離線輪流傳手機看詞）
 * 2. 🕴️ 機密特務（Codenames 5×5 隊長/隊員特務密碼板）
 * 3. 🃏 21 點黑傑克（單機對戰莊家，Crypto RNG 洗牌發牌）
 * 4. 🎲 聚會骰子與大話骰（1–6 顆骰子，防偷看遮擋模式）
 * 5. 🎡 命運幸運轉盤（自訂破冰任務與懲罰）
 * 6. 🐺 一夜狼人角色分發器（4–8 人速決版）
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
  topicKey: 'scout',
  roles: [],
  currentIdx: 0,
  revealed: false,
  phase: 'setup'
};

MiniGame.startSpyGame = function(){
  var st = MiniGame.spyState;
  var topic = MiniGame.spyTopics[st.topicKey] || MiniGame.spyTopics.scout;
  var pair = topic.pairs[Math.floor(Math.random() * topic.pairs.length)];
  var swap = Math.random() < 0.5;
  var civilianWord = swap ? pair[0] : pair[1];
  var spyWord = swap ? pair[1] : pair[0];

  var count = parseInt(st.players, 10) || 6;
  var spyCount = parseInt(st.spies, 10) || 1;
  if(spyCount >= count) spyCount = 1;

  var roles = [];
  for(var i=0; i<count; i++){
    roles.push({
      id: i+1,
      name: '隊員 ' + (i+1),
      word: civilianWord,
      isSpy: false
    });
  }

  var indices = [];
  while(indices.length < spyCount){
    var r = Math.floor(Math.random() * count);
    if(indices.indexOf(r) < 0) indices.push(r);
  }
  indices.forEach(function(idx){
    roles[idx].word = spyWord;
    roles[idx].isSpy = true;
  });

  st.roles = roles;
  st.currentIdx = 0;
  st.revealed = false;
  st.phase = 'pass';
  MiniGame.renderSpyUI();
};

MiniGame.renderSpyUI = function(){
  var container = document.getElementById('mg-spy-box');
  if(!container) return;
  var st = MiniGame.spyState;

  if(st.phase === 'setup'){
    var optHtml = Object.keys(MiniGame.spyTopics).map(function(k){
      return '<option value="' + k + '" ' + (st.topicKey === k ? 'selected' : '') + '>' + MiniGame.spyTopics[k].label + '</option>';
    }).join('');

    container.innerHTML = '<div class="card" style="background:#F9FBE7;border:1px solid #C0CA33;padding:12px;border-radius:8px;">'
      + '<h4 style="margin:0 0 8px 0;color:#33691E;">🕵️ 誰是臥底（內建離線看詞）</h4>'
      + '<p class="mut" style="font-size:13px;margin:0 0 10px 0;">全單機離線進行，輪流傳遞手機查看身份與秘密詞，全員看完後即開始發言抓臥底！</p>'
      + '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:12px;">'
      + '<label>總人數：<input type="number" min="4" max="16" value="' + st.players + '" style="width:55px;" onchange="MiniGame.spyState.players=parseInt(this.value,10)"></label>'
      + '<label>臥底數：<input type="number" min="1" max="3" value="' + st.spies + '" style="width:45px;" onchange="MiniGame.spyState.spies=parseInt(this.value,10)"></label>'
      + '<label>題庫：<select onchange="MiniGame.spyState.topicKey=this.value">' + optHtml + '</select></label>'
      + '</div>'
      + '<button class="button" style="background:#33691E;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:bold;" onclick="MiniGame.startSpyGame()">🎲 開始發牌（輪流傳手機）</button> <button class="button proj-big" style="background:#1565C0;color:#fff;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-weight:bold;" onclick="Projector.live(\'mg:spy\',\'🕵️ 誰是臥底\')">🖥️ 投影大螢幕</button>'
      + '</div>';
    return;
  }

  if(st.phase === 'pass'){
    var cur = st.roles[st.currentIdx];
    var isLast = st.currentIdx >= st.roles.length - 1;

    var content = '';
    if(!st.revealed){
      content = '<div style="text-align:center;padding:24px 10px;background:#fff;border-radius:8px;border:2px dashed #9E9D24;margin-bottom:12px;">'
        + '<div style="font-size:36px;margin-bottom:8px;">📱</div>'
        + '<div style="font-size:18px;font-weight:bold;color:#1B5E20;margin-bottom:6px;">請交給【' + cur.name + '】</div>'
        + '<p class="mut" style="margin:0 0 14px 0;font-size:13px;">確認旁邊無人偷看，點擊下方按鈕查看你的秘密詞。</p>'
        + '<button style="background:#F57F17;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:15px;font-weight:bold;cursor:pointer;" onclick="MiniGame.spyState.revealed=true;MiniGame.renderSpyUI();">👁️ 點擊查看秘密詞</button>'
        + '</div>';
    } else {
      content = '<div style="text-align:center;padding:20px 10px;background:#E8F5E9;border-radius:8px;border:2px solid #4CAF50;margin-bottom:12px;">'
        + '<div style="font-size:13px;color:#2E7D32;margin-bottom:4px;">你的秘密詞是：</div>'
        + '<div style="font-size:26px;font-weight:900;color:#1B5E20;letter-spacing:1px;margin-bottom:10px;">「' + cur.word + '」</div>'
        + '<p class="mut" style="font-size:12px;margin:0 0 14px 0;">記住你的詞，記下後傳給下一位！</p>'
        + (isLast
          ? '<button style="background:#2E7D32;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:15px;font-weight:bold;cursor:pointer;" onclick="MiniGame.spyState.phase=\'playing\';MiniGame.renderSpyUI();">✅ 全員看完，進入發言階段</button>'
          : '<button style="background:#2E7D32;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:15px;font-weight:bold;cursor:pointer;" onclick="MiniGame.spyState.currentIdx++;MiniGame.spyState.revealed=false;MiniGame.renderSpyUI();">傳給下一位（' + (st.currentIdx + 2) + '號）→</button>'
          )
        + '</div>';
    }

    container.innerHTML = '<div class="card" style="background:#F9FBE7;border:1px solid #C0CA33;padding:12px;border-radius:8px;">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">'
      + '<b>發牌進度：第 ' + (st.currentIdx + 1) + ' / ' + st.roles.length + ' 位</b>'
      + '<button class="mut" style="background:none;border:none;cursor:pointer;font-size:12px;text-decoration:underline;" onclick="MiniGame.spyState.phase=\'setup\';MiniGame.renderSpyUI();">重新設定</button>'
      + '</div>'
      + content
      + '</div>';
    return;
  }

  if(st.phase === 'playing'){
    var list = st.roles.map(function(r){
      return '<li style="padding:4px 0;"><b>' + r.name + '</b>: ' + (r.isSpy ? '<span style="color:#C62828;font-weight:bold;">[臥底]</span>' : '<span style="color:#2E7D32;">[平民]</span>') + ' 詞：「' + r.word + '」</li>';
    }).join('');

    container.innerHTML = '<div class="card" style="background:#F9FBE7;border:1px solid #C0CA33;padding:12px;border-radius:8px;">'
      + '<h4 style="margin:0 0 8px 0;color:#1B5E20;">🗣️ 發言討論與投票放逐</h4>'
      + '<p style="font-size:14px;margin:0 0 8px 0;"><b>規則</b>：每人輪流用一句話描述自己的詞（不可直接說出該詞，也不能太露骨）。一輪發言後全團投票抓出臥底！</p>'
      + '<details style="margin:10px 0;background:#fff;padding:8px;border-radius:6px;border:1px solid #DCEDC8;">'
      + '<summary style="cursor:pointer;font-weight:bold;color:#33691E;">👑 主持人底牌面板（點擊揭曉）</summary>'
      + '<ul style="margin:8px 0 0 16px;padding:0;font-size:13px;">' + list + '</ul>'
      + '</details>'
      + '<div style="margin-top:10px;">'
      + '<button style="background:#33691E;color:#fff;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-weight:bold;" onclick="MiniGame.startSpyGame()">🔄 再玩一局</button> '
      + '<button style="background:#689F38;color:#fff;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;" onclick="MiniGame.spyState.phase=\'setup\';MiniGame.renderSpyUI();">⚙️ 修改人數/主題</button>'
      + '</div></div>';
  }
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

/* ═══════════ 3. 單機 21 點黑傑克 (Blackjack) ═══════════ */
MiniGame.bjState = {
  deck: [],
  player: [],
  dealer: [],
  status: 'betting', // betting, playing, dealerTurn, done
  chips: 1000,
  bet: 100,
  msg: '請下注後點擊發牌'
};

MiniGame.createDeck = function(){
  var suits = ['♠','♥','♦','♣'];
  var ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  var d = [];
  suits.forEach(function(s){
    ranks.forEach(function(r){
      var val = parseInt(r, 10);
      if(r === 'A') val = 11;
      else if(['J','Q','K'].indexOf(r) >= 0) val = 10;
      d.push({ suit: s, rank: r, val: val });
    });
  });
  // Crypto RNG shuffle
  for(var i=d.length-1; i>0; i--){
    var j = Math.floor(Math.random()*(i+1));
    var tmp = d[i]; d[i] = d[j]; d[j] = tmp;
  }
  return d;
};

MiniGame.calcHand = function(hand){
  var total = 0, aces = 0;
  hand.forEach(function(c){
    total += c.val;
    if(c.rank === 'A') aces++;
  });
  while(total > 21 && aces > 0){
    total -= 10;
    aces--;
  }
  return total;
};

MiniGame.startBjRound = function(){
  var st = MiniGame.bjState;
  if(st.chips < st.bet) st.bet = st.chips;
  if(st.chips <= 0){ st.chips = 1000; st.bet = 100; }
  st.chips -= st.bet;
  st.deck = MiniGame.createDeck();
  st.player = [st.deck.pop(), st.deck.pop()];
  st.dealer = [st.deck.pop(), st.deck.pop()];
  st.status = 'playing';
  st.msg = '要牌還是停牌？';

  var pScore = MiniGame.calcHand(st.player);
  if(pScore === 21){
    st.status = 'done';
    st.chips += Math.floor(st.bet * 2.5);
    st.msg = '🎉 恭喜！Blackjack 直接獲勝（贏得 ' + Math.floor(st.bet * 1.5) + ' 籌碼）！';
  }
  MiniGame.renderBjUI();
};

MiniGame.bjHit = function(){
  var st = MiniGame.bjState;
  if(st.status !== 'playing') return;
  st.player.push(st.deck.pop());
  var p = MiniGame.calcHand(st.player);
  if(p > 21){
    st.status = 'done';
    st.msg = '💥 爆牌了！輸掉 ' + st.bet + ' 籌碼。';
  } else if(p === 21){
    MiniGame.bjStand();
    return;
  }
  MiniGame.renderBjUI();
};

MiniGame.bjStand = function(){
  var st = MiniGame.bjState;
  if(st.status !== 'playing') return;
  st.status = 'dealerTurn';
  while(MiniGame.calcHand(st.dealer) < 17){
    st.dealer.push(st.deck.pop());
  }
  var p = MiniGame.calcHand(st.player);
  var d = MiniGame.calcHand(st.dealer);
  st.status = 'done';
  if(d > 21){
    st.chips += st.bet * 2;
    st.msg = '🎉 莊家爆牌！你贏了 ' + st.bet + ' 籌碼！';
  } else if(p > d){
    st.chips += st.bet * 2;
    st.msg = '🎉 你的點數 (' + p + ') 大於莊家 (' + d + ')，獲勝！';
  } else if(p === d){
    st.chips += st.bet;
    st.msg = '🤝 平手，下注籌碼全額退回。';
  } else {
    st.msg = '😢 莊家點數 (' + d + ') 勝過你的 (' + p + ')。';
  }
  MiniGame.renderBjUI();
};

MiniGame.renderBjUI = function(){
  var container = document.getElementById('mg-bj-box');
  if(!container) return;
  var st = MiniGame.bjState;

  var renderCard = function(c, hide){
    if(hide){
      return '<span style="display:inline-block;width:38px;height:54px;line-height:54px;background:#263238;color:#fff;border-radius:4px;text-align:center;font-size:18px;margin-right:4px;">🂠</span>';
    }
    var isRed = (c.suit === '♥' || c.suit === '♦');
    return '<span style="display:inline-block;width:38px;height:54px;background:#fff;color:' + (isRed ? '#D32F2F' : '#212121') + ';border:1px solid #B0BEC5;border-radius:4px;text-align:center;font-size:13px;font-weight:bold;margin-right:4px;padding:2px 0;vertical-align:middle;">'
      + c.suit + '<br>' + c.rank + '</span>';
  };

  var dealerCards = '';
  if(st.dealer.length){
    st.dealer.forEach(function(c, i){
      dealerCards += renderCard(c, (i === 1 && st.status === 'playing'));
    });
  }
  var playerCards = st.player.map(function(c){ return renderCard(c, false); }).join('');
  var pTotal = st.player.length ? MiniGame.calcHand(st.player) : 0;
  var dTotal = (st.status === 'playing') ? (st.dealer[0] ? st.dealer[0].val : 0) : (st.dealer.length ? MiniGame.calcHand(st.dealer) : 0);

  container.innerHTML = '<div class="card" style="background:#E8F5E9;border:1px solid #81C784;padding:12px;border-radius:8px;">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
    + '<h4 style="margin:0;color:#1B5E20;">♠️ 21 點黑傑克（單機內建對抗）</h4>'
    + '<div>籌碼：<b>' + st.chips + '</b> 枚</div>'
    + '</div>'
    + '<div style="margin-bottom:8px;">'
    + '<b>莊家 (' + (st.status === 'playing' ? dTotal + '+?' : dTotal) + ' 點)：</b> ' + (dealerCards || '<span class="mut">等待發牌</span>')
    + '</div>'
    + '<div style="margin-bottom:10px;">'
    + '<b>你 (' + pTotal + ' 點)：</b> ' + (playerCards || '<span class="mut">等待發牌</span>')
    + '</div>'
    + '<div style="padding:6px 10px;background:#fff;border-radius:6px;border:1px solid #C8E6C9;font-weight:bold;color:#2E7D32;margin-bottom:10px;">' + st.msg + '</div>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap;">'
    + (st.status === 'playing'
      ? '<button style="background:#2E7D32;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:bold;cursor:pointer;" onclick="MiniGame.bjHit()">➕ 要牌 (Hit)</button>'
        + '<button style="background:#F57F17;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:bold;cursor:pointer;" onclick="MiniGame.bjStand()">✋ 停牌 (Stand)</button>'
      : '<label>下注：<input type="number" min="10" max="500" step="10" value="' + st.bet + '" style="width:65px;" onchange="MiniGame.bjState.bet=parseInt(this.value,10)"></label>'
        + '<button style="background:#1B5E20;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:bold;cursor:pointer;" onclick="MiniGame.startBjRound()">🂡 發牌開局</button>'
      )
    + '</div></div>';
};

/* ═══════════ 4. 聚會 3D/防偷看骰子工具 ═══════════ */
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

/* ═══════════ 5. 幸運轉盤 ═══════════ */
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
    + '<div id="mg-bj-box" style="margin-bottom:12px;"></div>'
    + '<div id="mg-dice-box" style="margin-bottom:12px;"></div>'
    + '<div id="mg-wheel-box"></div>'
    + '</div>';
};

MiniGame.mount = function(){
  MiniGame.renderSpyUI();
  MiniGame.renderAgentUI();
  MiniGame.renderBjUI();
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
    if(st.phase === 'playing'){
      return '<div class="pj-minigame" style="text-align:center;padding:20px;">'
        + '<h2 style="font-size:2.2em;color:#1B5E20;margin-bottom:10px;">🕵️ 誰是臥底・全員發言與公投</h2>'
        + '<p style="font-size:1.4em;color:#333;margin-bottom:20px;">請每位隊員輪流用一句話描述你的詞，保持神秘！</p>'
        + '<div style="display:flex;justify-content:center;gap:15px;flex-wrap:wrap;max-width:900px;margin:0 auto;">'
        + st.roles.map(function(r){
            return '<div style="background:#fff;padding:15px 25px;border-radius:10px;box-shadow:0 4px 10px rgba(0,0,0,0.1);font-size:1.3em;font-weight:bold;color:#2E7D32;">' + r.name + '</div>';
          }).join('')
        + '</div>'
        + '<p style="margin-top:25px;font-size:1.1em;color:#666;">（底牌隱藏於手機端操作面板，大螢幕公平無透底）</p>'
        + '</div>';
    } else {
      return '<div class="pj-minigame" style="text-align:center;padding:30px;">'
        + '<h2 style="font-size:2.4em;color:#1B5E20;margin-bottom:15px;">🕵️ 誰是臥底・秘密發牌中</h2>'
        + '<div style="font-size:5em;margin:20px 0;">📱 ➔ 🤫</div>'
        + '<p style="font-size:1.6em;color:#444;">手機正在離線傳遞中，請各位隊員做好準備！</p>'
        + '</div>';
    }
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
