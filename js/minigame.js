/* minigame.js — 聚會 MINI GAME 工具箱（深資童軍集會互動組件）
 * 移植自 Pocket Play (minigame) 開源專案：
 * 包含：
 * 1. 誰是臥底 / 間諜危機（Secret Words / Spyfall 派對推理，離線輪流看詞）
 * 2. 機密特務（Codenames 特務密碼 5x5 隊長/隊員題目板）
 * 3. 幸運轉盤工具
 */

var MiniGame = {};

// 1. 誰是臥底詞庫
MiniGame.spyTopics = {
  party: {
    label: '派對娛樂',
    pairs: [
      ['啤酒', '清酒'], ['KTV', '酒吧'], ['麻將', '撲克牌'], ['露營', '野餐'],
      ['遊樂園', '夜市'], ['桌遊', '電玩'], ['保齡球', '撞球'], ['密室逃脫', '劇本殺']
    ]
  },
  food: {
    label: '飲食生活',
    pairs: [
      ['奶茶', '咖啡'], ['漢堡', '三明治'], ['可樂', '雪碧'], ['火鍋', '麻辣燙'],
      ['拉麵', '烏冬麵'], ['水餃', '鍋貼'], ['冰淇淋', '雪葩'], ['臭豆腐', '榴槤']
    ]
  },
  scout: {
    label: '童軍與戶外',
    pairs: [
      ['帳篷', '天幕'], ['指南針', 'GPS導航'], ['氣爐', '營火'], ['行山杖', '童軍棍'],
      ['睡袋', '防潮墊'], ['急救包', '求生包'], ['先鋒工程', '步操'], ['平結', '接繩結']
    ]
  },
  life: {
    label: '日常校園',
    pairs: [
      ['手機', '平板'], ['耳機', '喇叭'], ['雨傘', '雨衣'], ['圖書館', '自修室'],
      ['期中考', '期末考'], ['報告', '考試'], ['鬧鐘', '手錶'], ['外賣', '堂食']
    ]
  }
};

MiniGame.spyState = {
  players: 6,
  spies: 1,
  topicKey: 'party',
  roles: [],
  currentIdx: 0,
  revealed: false,
  phase: 'setup'
};

MiniGame.startSpyGame = function(){
  var st = MiniGame.spyState;
  var topic = MiniGame.spyTopics[st.topicKey] || MiniGame.spyTopics.party;
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
      + '<h4 style="margin:0 0 8px 0;">🕵️ 誰是臥底（離線輪流發牌）</h4>'
      + '<p class="mut" style="font-size:13px;margin:0 0 10px 0;">每人拿秘密詞，臥底拿到相似但不同的詞。一台手機輪流傳遞查看，全部看過後開始發言抓臥底！</p>'
      + '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:12px;">'
      + '<label>總人數：<input type="number" min="4" max="16" value="' + st.players + '" style="width:55px;" onchange="MiniGame.spyState.players=parseInt(this.value,10)"></label>'
      + '<label>臥底數：<input type="number" min="1" max="3" value="' + st.spies + '" style="width:45px;" onchange="MiniGame.spyState.spies=parseInt(this.value,10)"></label>'
      + '<label>主題：<select onchange="MiniGame.spyState.topicKey=this.value">' + optHtml + '</select></label>'
      + '</div>'
      + '<button class="button" style="background:#33691E;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:bold;" onclick="MiniGame.startSpyGame()">🎲 開始發牌（秘密傳手機）</button>'
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
        + '<p class="mut" style="margin:0 0 14px 0;font-size:13px;">確認只有本人在看，點擊下方按鈕查看你的秘密詞。</p>'
        + '<button style="background:#F57F17;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:15px;font-weight:bold;cursor:pointer;" onclick="MiniGame.spyState.revealed=true;MiniGame.renderSpyUI();">👁️ 點擊查看秘密詞</button>'
        + '</div>';
    } else {
      content = '<div style="text-align:center;padding:20px 10px;background:#E8F5E9;border-radius:8px;border:2px solid #4CAF50;margin-bottom:12px;">'
        + '<div style="font-size:13px;color:#2E7D32;margin-bottom:4px;">你的秘密詞是：</div>'
        + '<div style="font-size:26px;font-weight:900;color:#1B5E20;letter-spacing:1px;margin-bottom:10px;">「' + cur.word + '」</div>'
        + '<p class="mut" style="font-size:12px;margin:0 0 14px 0;">記住你的詞，不要被其他人看到！</p>'
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
      + '<p style="font-size:14px;margin:0 0 8px 0;"><b>規則</b>：每人輪流用一句話描述自己的詞（不可直接說出詞語，也不能太明顯）。一輪結束後全團投票抓出臥底！</p>'
      + '<details style="margin:10px 0;background:#fff;padding:8px;border-radius:6px;border:1px solid #DCEDC8;">'
      + '<summary style="cursor:pointer;font-weight:bold;color:#33691E;">👑 主持人答案面板（點擊揭曉）</summary>'
      + '<ul style="margin:8px 0 0 16px;padding:0;font-size:13px;">' + list + '</ul>'
      + '</details>'
      + '<div style="margin-top:10px;">'
      + '<button style="background:#33691E;color:#fff;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-weight:bold;" onclick="MiniGame.startSpyGame()">🔄 再玩一局</button> '
      + '<button style="background:#689F38;color:#fff;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;" onclick="MiniGame.spyState.phase=\'setup\';MiniGame.renderSpyUI();">⚙️ 修改人數/主題</button>'
      + '</div></div>';
  }
};

// 2. 機密特務（Codenames 5x5 雙隊詞盤）
MiniGame.agentWords = [
  '指南針','營火','睡袋','天幕','先鋒','地圖','等高線','無痕山林','平結','稱人結',
  '雙套結','十字編結','步操','誓詞','旅巾','急救包','哨子','頭燈','氣爐','水樽',
  '露營','夜行','遠征','執委會','自立','責任','探險','活動','榮譽','童軍'
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
    + '<h4 style="margin:0;">🕴️ 機密特務（5×5 Codenames 童軍密碼版）</h4>'
    + '<div style="font-size:13px;">🔴 紅隊剩 <b>' + st.score.redLeft + '</b> ｜ 🔵 藍隊剩 <b>' + st.score.blueLeft + '</b></div>'
    + '</div>'
    + '<p class="mut" style="font-size:12px;margin:0 0 10px 0;">紅藍兩隊隊長看答案卡並給出【提示詞＋數字】（如「露營 2」），隊員點擊詞板翻牌。猜中對方詞送分，猜中炸彈 ☠️ 立即落敗！</p>'
    + '<div style="display:flex;gap:10px;margin-bottom:10px;">'
    + '<button style="flex:1;padding:6px;border-radius:6px;font-weight:bold;cursor:pointer;background:' + (isCaptain ? '#E0E0E0' : '#5E35B1') + ';color:' + (isCaptain ? '#333' : '#fff') + ';border:none;" onclick="MiniGame.agentState.viewRole=\'player\';MiniGame.renderAgentUI();">👥 隊員視角（全平民）</button>'
    + '<button style="flex:1;padding:6px;border-radius:6px;font-weight:bold;cursor:pointer;background:' + (isCaptain ? '#5E35B1' : '#E0E0E0') + ';color:' + (isCaptain ? '#fff' : '#333') + ';border:none;" onclick="MiniGame.agentState.viewRole=\'captain\';MiniGame.renderAgentUI();">👑 隊長視角（全見底牌）</button>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:6px;margin-bottom:10px;">' + cardsHtml + '</div>'
    + '<button class="button" style="background:#512DA8;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:12px;" onclick="MiniGame.initAgentGame()">🔄 重新生成 5×5 題目盤</button>'
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

// 3. 幸運轉盤工具
MiniGame.wheelItems = ['自我介紹＋專長', '講一個露營糗事', '做 5 下掌上壓', '免罰一次（過關）', '唱一句童軍歌曲', '指定一人回答問題'];
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
    + '<p class="mut" style="font-size:12px;margin:0 0 8px 0;">破冰互動或遊戲懲罰小工具：點擊快速隨機抽取任務。</p>'
    + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">' + itemsHtml + '</div>'
    + '<button style="background:#F57F17;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:bold;cursor:pointer;" onclick="MiniGame.spinWheel()">🎲 轉一下！</button>'
    + '<div id="mg-wheel-result" style="margin-top:8px;"></div>'
    + '</div>';
};

// 整合成單一區塊供放入工作紙或素材庫
MiniGame.htmlBlock = function(){
  return '<div class="minigame-hub" style="margin-top:14px;">'
    + '<div id="mg-spy-box" style="margin-bottom:12px;"></div>'
    + '<div id="mg-agent-box" style="margin-bottom:12px;"></div>'
    + '<div id="mg-wheel-box"></div>'
    + '</div>';
};

MiniGame.mount = function(){
  MiniGame.renderSpyUI();
  MiniGame.renderAgentUI();
  MiniGame.renderWheelUI();
};

if (typeof module !== 'undefined' && module.exports) module.exports = MiniGame;
