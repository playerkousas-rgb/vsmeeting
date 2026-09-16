/* dia.js — 圖解圖檔對照表＋DIAGRAMS 產生器（v37）
 * 用戶要求：唔要 SVG（手畫 vector 唔靚），圖解一律用 AVIF 真圖。
 * 呢個檔係前端唯一嘅圖解入口：
 *   1) IMG.map  = 每張圖解嘅 AVIF 檔案／尺寸／alt 文字
 *   2) DIAGRAMS = 由 IMG.map 自動砌返出嚟（每個 key 一個 <img>），所以 app.js 照舊寫 DIAGRAMS.cer.open
 * 前端由頭到尾唔會有 <svg>：圖檔 load 唔到就出 alt 文字（IMG.fallback），唔會退回 SVG。
 * 手繪 SVG 底稿已經搬離前端（assets_src/diasvg/，build-only），只留做重建 AVIF 嘅來源。
 * 圖檔來源、製作方法、授權見 img/dia/SOURCES.md。
 */
var IMG = {};
IMG.map = {
  'cer.attn': { f:'img/dia/cer-attn.avif', w:720, h:347, alt:'立正示意圖：腳尖與中線成 30 度、雙手握拳貼褲骨、後顎貼衣領、眼望無限遠' },
  'cer.close': { f:'img/dia/cer-close.avif', w:720, h:318, alt:'團集會結束流程圖：分組圈＋散會手續兩格示意' },
  'cer.dress': { f:'img/dia/cer-dress.avif', w:720, h:623, alt:'睇齊示意圖：Right—Dress 手肘貼隔離、身軀挺直、腳尖對齊' },
  'cer.drill': { f:'img/dia/cer-drill.avif', w:720, h:356, alt:'中式隊列基本動作三格圖：立正、稍息、行進姿勢' },
  'cer.flag': { f:'img/dia/cer-flag.avif', w:720, h:381, alt:'升旗禮位置示意圖：升旗手、護旗同全團隊列嘅相對位置' },
  'cer.formup': { f:'img/dia/cer-formup.avif', w:720, h:623, alt:'集隊隊形圖：三排站位、標號員同司令員嘅距離標示' },
  'cer.howl': { f:'img/dia/cer-howl.avif', w:720, h:623, alt:'團呼馬蹄鐵隊形俯視圖：歡呼領袖站缺口，全團圍成馬蹄鐵' },
  'cer.oath': { f:'img/dia/cer-oath.avif', w:720, h:381, alt:'宣誓儀式位置示意圖：新成員面向團長及團旗、領袖位置同左手握手' },
  'cer.open': { f:'img/dia/cer-open.avif', w:720, h:402, alt:'團集會開始集隊俯視圖：四組排成橫隊、帶隊執委站右前方、全體面向負責領袖同團旗' },
  'cer.rest': { f:'img/dia/cer-rest.avif', w:720, h:623, alt:'稍息示意圖：右掌疊左掌放身後、腳跟分開 305 毫米、回立正要打數' },
  'cer.salute': { f:'img/dia/cer-salute.avif', w:720, h:322, alt:'童軍三指敬禮兩格圖：全禮（食指對上右眼）同半禮（手放肩高）' },
  'cer.salute3': { f:'img/dia/cer-salute3.avif', w:720, h:623, alt:'原地向前敬禮四格圖：Up—Two—Three—Down，食指放右眼對上 25 毫米' },
  'cer.threefinger': { f:'img/dia/cer-threefinger.avif', w:720, h:623, alt:'童軍三指手形四格圖：三指並攏伸直、拇指壓住小指、手心向前略向下' },
  'fire.circle': { f:'img/dia/fire-circle.avif', w:720, h:381, alt:'營火圈座位俯視圖：火圈、領袖位置、急救箱同水桶位置、圍火安全距離' },
  'fire.flow': { f:'img/dia/fire-flow.avif', w:720, h:318, alt:'營火會流程圖：熱身 → 高潮 → 寧靜結尾三段氣氛' },
  'fire.scarf': { f:'img/dia/fire-scarf.avif', w:720, h:298, alt:'營火袍示意圖：袍身形狀同穿着方法' },
  'game.執包比賽': { f:'img/dia/game-pack-run.avif', w:720, h:254, alt:'「執包比賽」場地俯視圖：背囊擺位同比賽分區' },
  'game.大風吹': { f:'img/dia/game-chairs-circle.avif', w:720, h:267, alt:'「大風吹」場地俯視圖：椅子數量同圈形排列' },
  'game.定向尋寶': { f:'img/dia/game-hunt.avif', w:720, h:275, alt:'「定向尋寶」場地俯視圖：控制點位置同方向' },
  'game.急救情境賽': { f:'img/dia/game-aid-station.avif', w:720, h:254, alt:'「急救情境賽」場地俯視圖：各急救站嘅分佈' },
  'game.有口難言': { f:'img/dia/game-hush.avif', w:720, h:254, alt:'「有口難言」場地俯視圖：全團圍圈、示範者站圈中央，唔可以出聲' },
  'game.沙灘旗': { f:'img/dia/game-beach-flag.avif', w:720, h:254, alt:'「沙灘旗」場地俯視圖：旗位、分區同「絕對唔准衝向海邊」嘅界線' },
  'game.直呼其名': { f:'img/dia/game-names.avif', w:720, h:267, alt:'「直呼其名」場地俯視圖：圍圈站位同傳球方向' },
  'game.結繩接力賽': { f:'img/dia/game-knot-relay.avif', w:720, h:267, alt:'「結繩接力賽」場地俯視圖：接力路線同檢查站（唔出結圖）' },
  'game.繩索挑戰': { f:'img/dia/game-rope-line.avif', w:720, h:267, alt:'「繩索挑戰」場地俯視圖：繩索位置同分組分區' },
  'game.運水接力': { f:'img/dia/game-water-relay.avif', w:720, h:254, alt:'「運水接力」場地俯視圖：取水點、去程路線同回程' },
  'game.飛毯': { f:'img/dia/game-carpet.avif', w:720, h:254, alt:'「飛毯」場地俯視圖：帆布位置同分組起點' },
  'skillx.faint': { f:'img/dia/skill-faint.avif', w:720, h:280, alt:'復原臥式側臥示意圖：頭微向下、上膝屈前、上手放前面' },
  'skillx.knife': { f:'img/dia/skill-knife.avif', w:720, h:275, alt:'小刀安全圈示意圖：一臂長距離、傳刀合埋柄向人、跌刀唔接' },
  'skillx.legend': { f:'img/dia/skill-legend.avif', w:720, h:322, alt:'地圖圖例示意圖：車路、小徑、河流、林地、等高線等十種習用圖例' },
  'skillx.lost': { f:'img/dia/skill-lost.avif', w:720, h:254, alt:'迷路自保三步圖：S.T.A.Y. 企定、吹哨、保暖等救援' },
  'skillx.rice': { f:'img/dia/skill-rice.avif', w:720, h:254, alt:'RICE 扭傷處理示意圖：休息、冰敷、加壓、抬高四步' },
  'skillx.ropecare': { f:'img/dia/skill-ropecare.avif', w:720, h:254, alt:'收繩與保養示意圖：圈繞收法步驟同保養五要點' },
  'skillx.sos': { f:'img/dia/skill-sos.avif', w:720, h:233, alt:'SOS 哨音節拍圖：三短三長三短嘅節奏' },
  'skillx.stove': { f:'img/dia/skill-stove.avif', w:720, h:296, alt:'爐具安全示意圖：氣爐離帳篷 3 米、保持通風同安全圈位置' },
  'skillx.tent': { f:'img/dia/skill-tent.avif', w:720, h:296, alt:'搭帳篷六步側視圖：清地、鋪地布、穿柱、起篷、45 度拉營繩、打營釘' },
  'top.compass': { f:'img/dia/dgm-compass.avif', w:720, h:720, alt:'指南針八方位圖：紅針永遠指北，標示東南西北及四個方位角' },
  'top.pack': { f:'img/dia/dgm-pack.avif', w:720, h:847, alt:'背囊分層圖：頂放雨衣小食、貼背放重物、中間放衫、底放睡袋、外掛營柱地墊' },
  'track.arrow': { f:'img/dia/track-arrow.avif', w:240, h:160, alt:'追蹤符號：箭嘴＝向前行' },
  'track.circle': { f:'img/dia/track-circle.avif', w:240, h:160, alt:'追蹤符號：圓圈＝集合或終點' },
  'track.cross': { f:'img/dia/track-cross.avif', w:240, h:160, alt:'追蹤符號：交叉＝唔行呢邊' },
  'track.msg': { f:'img/dia/track-msg.avif', w:240, h:160, alt:'追蹤符號：三角＝附近有訊息' },
  'track.turn': { f:'img/dia/track-turn.avif', w:240, h:160, alt:'追蹤符號：轉彎箭嘴＝轉方向' },
  'track.water': { f:'img/dia/track-water.avif', w:240, h:160, alt:'追蹤符號：波浪＝有水要小心' },
  'uniform.branch': { f:'img/dia/uniform-branch.avif', w:1200, h:1381, alt:'陸童軍／海童軍／空童軍顏色配搭對照圖：陸＝深綠色軟帽、杏色恤衫、草青色短褲；海＝白頂帽、白色恤衫、深藍色短褲及長襪；空＝灰藍色軟帽、淺藍色恤衫、深藍色短褲及長襪；旁邊有逐項顏色方塊同文字' },
  'uniform.body': { f:'img/dia/uniform-body.avif', w:1200, h:1829, alt:'童軍支部全身徽章位置圖（恤衫＋短褲＋長襪正面人形）：右胸①–③、左胸④–⑥、右袖⑦、左袖⑧、專科徽章肩帶⑨，左邊有 cm 比例尺，右邊有位置對照表' },
  'uniform.cap': { f:'img/dia/uniform-cap.avif', w:1200, h:1343, alt:'制服帽佩戴圖：深綠色軟帽，帽章釘喺黑色膠邊左眼處上方 2cm，帽邊喺眼眉上方約 2cm；旁邊列出除帽後嘅處理同髮式規格' },
  'uniform.chest': { f:'img/dia/uniform-chest.avif', w:1200, h:1681, alt:'恤衫正面袋蓋位置圖：紅色上層線＝袋蓋上方 3cm、藍色中層線＝袋蓋上方 2cm、綠色下層線＝袋蓋上方、紫色＝袋中央；左右胸袋分別標①–③同④–⑥，附 3cm／2cm 尺寸線' },
  'uniform.kilwell': { f:'img/dia/uniform-kilwell.avif', w:1200, h:1321, alt:'木章皮繩佩戴位置圖三個小圖：領巾制服（皮繩連木珠掛喺領巾前面）、領帶制服（掛喺領帶前面）、禮服（皮繩藏喺翻領內只露木珠）' },
  'uniform.scarf': { f:'img/dia/uniform-scarf.avif', w:1200, h:2078, alt:'旅巾佩戴圖：左邊係戴起嘅樣（巾圈套喺衣領尖）、右上係照比例畫嘅規格尺寸線（一捲直徑 3.5cm、底至尖 12–15cm、皮帶線）、下面係捲巾四步實物圖，最後列出領巾 4 種同巾圈 4 種' },
  'uniform.sleeve': { f:'img/dia/uniform-sleeve.avif', w:1200, h:1160, alt:'右袖徽章位置圖：由上至下 1 旅章（肩膊位下方 2cm）、2 地域章／區章（再 2cm、兩章相距 1cm）、3 環境／社區參與／維護自然世界章、4 優異旅團章，另外 5 號章位喺袖口縫線上方 3cm（圖為童軍支部小隊章位置，深資支部不設小隊章），左邊有 2cm／3cm 尺寸線' },
  'uniform.ties': { f:'img/dia/uniform-ties.avif', w:1200, h:1262, alt:'領帶四色圖：棗紅色（深資童軍）、深綠色（樂行＋成年）、黑色（海童軍）、深藍色（空童軍），右邊列出佩戴要點（領帶結對稱、寬帶尖觸及皮帶扣上端等）' },
  'uniform.zoom': { f:'img/dia/uniform-zoom.avif', w:1200, h:1259, alt:'局部放大圖（左胸袋同右袖肩膊兩個放大圈）：袋蓋上方 3cm、2cm、袋蓋上方、袋中央四條線；右袖肩膊顯示旅章 2cm、地域章區章再 2cm、兩章相距 1cm' }
};
IMG.alt = function(key){ var m = IMG.map[key]; return m ? m.alt : (key || '示意圖'); };
/* 出一張圖（img 標籤）：一律加 dia-img 類＋onerror 文字後備；冇登記就回傳空字串，由呼叫者決定要唔要出後備 */
IMG.html = function(key, cls, attrs){
  var m = IMG.map[key];
  if(!m) return '';
  return '<img src="'+m.f+'" width="'+m.w+'" height="'+m.h+'" alt="'+m.alt+'" loading="lazy" decoding="async"'
    + ' class="dia-img'+(cls?' '+cls:'')+'" onerror="'+IMG.onerr(key)+'"'+(attrs?' '+attrs:'')+'>';
};
IMG.has = function(key){ return !!IMG.map[key]; };
/* 圖檔 load 唔到（舊瀏覽器唔支援 AVIF／缺檔）＝出 alt 文字，唔會退回 SVG */
IMG.fallback = function(key, self){
  var box = self && self.parentNode ? self.parentNode : null;
  if(!box || !document.createElement) return;
  var d = document.createElement('div');
  d.className = 'dgm-fallback';
  d.setAttribute('role','img');
  d.setAttribute('aria-label', IMG.alt(key));
  d.innerHTML = '<b>🖼️ 圖未顯示</b><span>'+IMG.alt(key)+'</span>';
  box.replaceChild(d, self);
};
IMG.onerr = function(key){
  return "IMG.fallback('" + key + "',this)";
};
/* ══════════ DIAGRAMS：由 IMG.map 砌返（前端唯一出圖路徑）══════════
   'uniform.chest' → DIAGRAMS.uniform.chest｜'top.compass' → DIAGRAMS.compass｜'track.arrow' → DIAGRAMS.track.arrow
   所以 app.js／ceremony.js 照舊寫 DIAGRAMS.cer.open、DIAGRAMS.uniform.body，出到嘅一定係 <img src="img/dia/*.avif">。 */
var DIAGRAMS = (typeof window !== 'undefined' && window.DIAGRAMS) ? window.DIAGRAMS : {};
(function(){
  Object.keys(IMG.map).forEach(function(key){
    var i = key.indexOf('.');
    if (i < 0) return;
    var grp = key.slice(0, i), name = key.slice(i + 1);
    var host = (grp === 'top') ? DIAGRAMS : (DIAGRAMS[grp] = DIAGRAMS[grp] || {});
    host[name] = IMG.html(key);
  });
})();
if (typeof window !== 'undefined') window.DIAGRAMS = DIAGRAMS;
if (typeof module !== 'undefined' && module.exports) module.exports = { IMG: IMG, DIAGRAMS: DIAGRAMS };
