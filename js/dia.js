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
  'cer.close': { f:'img/dia/cer-close.avif', w:720, h:318, alt:'團集會結束流程圖：分組圈＋散會手續兩格示意' },
  'cer.flag': { f:'img/dia/cer-flag.avif', w:720, h:381, alt:'升旗禮位置示意圖：升旗手、護旗同全團隊列嘅相對位置' },
  'cer.formup': { f:'img/dia/cer-formup.avif', w:720, h:623, alt:'集隊隊形圖：三排站位、標號員同司令員嘅距離標示' },
  'cer.oath': { f:'img/dia/cer-oath.avif', w:720, h:381, alt:'宣誓儀式位置示意圖：新成員面向團長及團旗、領袖位置同左手握手' },
  'cer.open': { f:'img/dia/cer-open.avif', w:720, h:402, alt:'團集會開始集隊俯視圖：四組排成橫隊、帶隊執委站右前方、全體面向負責領袖同團旗' },
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
  'map.legend': { f:'img/dia/map-legend.avif', w:720, h:884, alt:'行山地圖常用圖例表：主要道路、全天候公路、行山徑、小徑、河流、水塘、樹林、等高線、高程點、山峰、建築物、橋、營地、觀景台、國家公園界線、電纜線共 16 個符號同名稱' },
  'map.sample': { f:'img/dia/map-sample.avif', w:720, h:700, alt:'1:20,000 樣本行山地圖：格網參考、等高線山丘加山峰高程 198、溪流、公路過橋、行山徑、營地、樹林、圖例欄、比例尺 0-200 米、指北針，四要素標註 ①圖名 ②比例尺 ③圖例 ④指北針' },
  'map.contour': { f:'img/dia/map-contour.avif', w:720, h:452, alt:'等高線四種讀法四格圖：線密＝坡陡、閉合圈＝山頂、V 尖朝上（上游）＝山谷有溪流、兩峰之間低谷＝鞍部（坳口）' },
  'map.orient': { f:'img/dia/map-orient.avif', w:720, h:512, alt:'正置地圖兩步圖：①指南針放地圖上轉動地圖直到紅針指住 N 箭 ②正置後圖上方向等於真實地形方向，你喺度標記' },
  'top.compass': { f:'img/dia/dgm-compass.avif', w:720, h:720, alt:'指南針八方位圖：紅針永遠指北，標示東南西北及四個方位角' },
  'top.pack': { f:'img/dia/dgm-pack.avif', w:720, h:847, alt:'背囊分層圖：頂放雨衣小食、貼背放重物、中間放衫、底放睡袋、外掛營柱地墊' },
  /* ── v54：步操／隊列教學圖解（PIL 程式繪製；數字照 2024 指引＋《步操手冊》）── */
  'drill.attention': { f:'img/dia/drill-attention.avif', w:720, h:556, alt:'立正圖解：正面（眼望無限遠、兩肩平、中指貼褲縫、腳跟靠攏）＋腳位俯視（兩腳尖分開約60度、每腳同中線成30度）＋側面（上體微向前傾、兩腿挺直）' },
  'drill.standease': { f:'img/dia/drill-standease.avif', w:720, h:520, alt:'稍息跨立圖解：稍息（左腳順腳尖伸出約全腳三分之二、重心多在右腳）＋跨立（左腳向左跨約一腳之長、左手握右手腕）＋步操手冊稍息（腳跟分開305毫米、右掌疊左掌）' },
  'drill.turns': { f:'img/dia/drill-turns.avif', w:720, h:470, alt:'原地轉法圖解：向右轉90度以右腳跟為軸、向左轉90度以左腳跟為軸、向後轉180度經右邊轉，俯視腳位同旋轉弧' },
  'drill.salute': { f:'img/dia/drill-salute.avif', w:720, h:590, alt:'三指敬禮圖解：食指指尖喺右眼對上25毫米、三指伸直併攏拇指壓尾指、側面前臂同指尖成一直線、注目禮轉頭唔超過45度' },
  'drill.dress': { f:'img/dia/drill-dress.avif', w:720, h:582, alt:'看齊報數圖解：三排橫隊俯視，基準員喺右、前四名通視基準員、第五名起睇右側第三人、報數由右至左、間隔約10厘米、距離約75厘米' },
  'drill.formation': { f:'img/dia/drill-formation.avif', w:720, h:470, alt:'隊列名詞圖解：橫隊按列排、縱隊按路排、左右翼、行進基準（橫隊以右翼為基準、縱隊以左翼為基準）、間隔同距離' },
  'drill.march': { f:'img/dia/drill-march.avif', w:720, h:520, alt:'行進立定圖解：齊步行進步幅750毫米腳跟先著地、立定三步分解（再行一步、半步375毫米、後腳靠攏）' },
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
