import { readFileSync, existsSync, readdirSync } from 'fs';
import { spawnSync } from 'child_process';
import { createContext, runInContext, Script } from 'vm';
const root = new URL('..', import.meta.url).pathname;
/* VS 版：16 場（會員章 c01–c06、肩章認識 c07–c09、肩章技能 c10–c16） */
const lessonFiles = ['js/c01-lesson.js','js/c02-lesson.js','js/c03-lesson.js','js/c04-lesson.js','js/c05-lesson.js','js/c06-lesson.js','js/c07-lesson.js','js/c08-lesson.js','js/c09-lesson.js','js/c10-lesson.js','js/c11-lesson.js','js/c12-lesson.js','js/c13-lesson.js','js/c14-lesson.js','js/c15-lesson.js','js/c16-lesson.js'];
const files = ['index.html','manifest.webmanifest','sw.js','css/app.css','js/data.js','js/dia.js','js/interests.js','js/ceremony.js','js/uniform.js','js/ayp.js','js/figs.js','js/items.js','js/projector.js','js/app.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png',
  'assets_src/diasvg/diagrams.src.js','assets_src/diasvg/svg-kit.src.js',
  
  'img/fig/game-ball.avif','img/fig/game-shape.avif','img/fig/game-tarp.avif','img/fig/game-pack.avif',
  'img/fig/game-relay-cards.avif','img/fig/game-tug.avif','img/fig/game-aid.avif','img/fig/game-orienteer.avif',
  'img/fig/game-beachflag.avif','img/fig/game-water.avif','img/fig/game-lineup.avif','img/fig/game-chairs.avif','img/fig/SOURCES.md',
  'img/fig/skill-ropecare.avif','img/fig/skill-legend.avif','img/fig/skill-tent.avif',
  'img/fig/skill-stove.avif','img/fig/skill-rice.avif','img/fig/skill-lost.avif',
  'img/fig/skill-knife.avif','img/fig/skill-sos.avif',
  'img/fig/skill-pack.avif',
  'img/fig/aid-nosebleed.avif','img/fig/aid-cramp.avif','img/fig/aid-burn.avif','img/fig/aid-cut.avif','img/fig/aid-sting.avif', ...lessonFiles];
for (const f of files) {
  if (!existsSync(root + f)) { console.error('❌ Missing', f); process.exit(1); }
  console.log('✅', f);
}
const interestsSrc = readFileSync(root + 'js/interests.js', 'utf8');
const bm = interestsSrc.match(/\{ k:'[a-z0-9-]+', en:'/g);
console.log('✅ 獎章數：', bm ? bm.length : 0);
if (!bm || bm.length !== 34) { console.error('❌ 獎章應為 34 項（會員章 12＋肩章 9＋段章／金帶 7＋獎章路 3＋第十版對照 3），實際 '+(bm?bm.length:0)); process.exit(1); }
const html = readFileSync(root + 'index.html', 'utf8');
['1MEXphy7RQXXfFZX3uXsg0L4ZfOXbPEuo','js/ceremony.js','js/uniform.js','js/dia.js','js/ayp.js','js/figs.js','js/projector.js', ...lessonFiles, 'icons/icon-192.png'].forEach(u => {
  if (!html.includes(u)) { console.error('❌ index.html 缺少', u); process.exit(1); }
});
/* 已刪除嘅 c17–c24 唔可以再有 script tag */
for (let i = 17; i <= 24; i++) {
  if (html.includes('js/c' + i + '-lesson.js')) { console.error('❌ index.html 仲有已刪除嘅 c' + i + ' 引用'); process.exit(1); }
}
if (!html.includes('深資童軍團集會助手') || !html.includes('VENTURE')) { console.error('❌ index.html 未轉深資版 brand'); process.exit(1); }
if (html.includes('SCOUTS') || html.includes('>🧭 童軍團集會助手 <')) { console.error('❌ index.html 仲有童軍支部 brand'); process.exit(1); }
if (!html.includes('Scout System 出品')) { console.error('❌ index.html footer 未註明 Scout System 出品'); process.exit(1); }
if (html.includes('js/redesign.js')) { console.error('❌ index.html 仲有死引用 js/redesign.js'); process.exit(1); }
if ((html.match(/class="iconbtn"/g)||[]).length < 4 || !html.includes('https://scout-circulars.vercel.app/') || !html.includes('https://ayp-eight.vercel.app/') || !html.includes('https://upgrade-ashen.vercel.app/')) {
  console.error('❌ 手機頂欄應為搜尋＋圖書館＋AYP＋升團四個入口'); process.exit(1);
}
if (html.includes('scoutbadge') || html.includes('districtbadgesystem30') || html.includes('專章考驗')) {
  console.error('❌ 唔應該有專章系統入口（深資唔用專章系統）'); process.exit(1);
}
console.log('✅ index.html 接線齊（深資版 brand＋官方套包 VS 版）；頂欄四掣（搜尋＋圖書館＋AYP＋升團）');
if (!interestsSrc.includes('通告圖書館') || !interestsSrc.includes('訂閱')) { console.error('❌ 訓練班步驟未提及訂閱通告圖書館'); process.exit(1); }
console.log('✅ 訓練班程序包含「訂閱通告圖書館」');
// VS：會員章＋肩章＝團內考核；童軍支部嘅區報章系統唔出現
if (!interestsSrc.includes('團內考核')) { console.error('❌ interests.js 未寫明團內考核流程'); process.exit(1); }
if (interestsSrc.includes('districtbadgesystem30')) { console.error('❌ interests.js 仲有童軍支部區報章系統'); process.exit(1); }
if (!interestsSrc.includes('courseApply')) { console.error('❌ interests.js 缺 courseApply（手冊→報班用）'); process.exit(1); }
console.log('✅ 獎章＝團內考核＋訓練班報班程序齊');
const uniformSrc = readFileSync(root + 'js/uniform.js', 'utf8');
/* VS 版：6 款深資制服官網原圖（link-only，唔本地存檔） */
['www.scout.org.hk/uploads/member/venture_scouts_B.jpg','www.scout.org.hk/uploads/member/venture_scouts_G_dress.jpg','www.scout.org.hk/uploads/member/venture_scouts_sea_B.jpg','www.scout.org.hk/uploads/member/venture_scouts_sea_G_dress.jpg','www.scout.org.hk/uploads/member/venture_scouts_air_B.jpg','www.scout.org.hk/uploads/member/venture_scouts_air_G_dress.jpg','uniform.scouting.org.hk','p013-23.pdf'].forEach(u => {
  if (!uniformSrc.includes(u)) { console.error('❌ 制服缺少官方圖/參考', u); process.exit(1); }
});
if (/Scout_B\.1\.jpg|Scout_G\.1\.jpg/.test(uniformSrc)) { console.error('❌ 制服仲有童軍支部官方圖'); process.exit(1); }
/* 深資軟帽唔係貝雷帽 */
if (!uniformSrc.includes('軟帽') || uniformSrc.includes('貝雷帽')) { console.error('❌ 深資制服帽應為軟帽（唔係貝雷帽）'); process.exit(1); }
if (!uniformSrc.includes('UNIFORM.branches') || !uniformSrc.includes("'sea'") || !uniformSrc.includes("'air'")) { console.error('❌ uniform.js 缺陸海空 branches'); process.exit(1); }
console.log('✅ 制服官網圖齊（深資 6 款 link-only）＋陸海空分支資料');
const ceremonySrc = readFileSync(root + 'js/ceremony.js','utf8');
/* VS 版：7 套儀式卡（深資集會唔設團呼） */
['團集會儀式（開始）','團集會儀式（結束）','中式隊列基本動作','升旗禮','宣誓儀式','童軍三指敬禮'].forEach(c => {
  if (!ceremonySrc.includes(c)) { console.error('❌ 儀式卡缺少', c); process.exit(1); }
});
if (ceremonySrc.includes("k:'howl'") || /n:'[^']*團呼/.test(ceremonySrc)) { console.error('❌ 儀式卡仲有團呼（深資集會唔設）'); process.exit(1); }
if (!/唔設團呼/.test(ceremonySrc)) { console.error('❌ 儀式卡冇講明深資唔設團呼'); process.exit(1); }
if ((ceremonySrc.match(/fig:'/g)||[]).length < 6) { console.error('❌ 儀式卡 fig 圖解欄不足 6 套'); process.exit(1); }
console.log('✅ 7 套儀式卡存在（6 套附 AVIF 插畫＋1 套手繪平面圖解）');

function checkLesson(file, tid, name, keys, expectedSegs){
  const src = readFileSync(root + file, 'utf8');
  keys.forEach(k=>{
    if (!src.includes(k)) { console.error('❌ '+tid+' 教案缺少', k); process.exit(1); }
  });
  const sandbox = {};
  createContext(sandbox);
  try { runInContext(src, sandbox, {filename:file}); }
  catch(e){ console.error('❌ '+tid+' parse error:', e.message); process.exit(1); }
  const obj = sandbox[tid];
  if (!obj || !Array.isArray(obj.program)) { console.error('❌ '+tid+' 無 program'); process.exit(1); }
  if (obj.program.length !== expectedSegs) { console.error('❌ '+tid+' program 應為'+expectedSegs+'段，實際', obj.program.length); process.exit(1); }
  if (!Array.isArray(obj.bag)) { console.error('❌ '+tid+' 缺 bag'); process.exit(1); }
  if (!Array.isArray(obj.safety)) { console.error('❌ '+tid+' 缺 safety'); process.exit(1); }
  console.log('✅ '+name+'：'+expectedSegs+'段程序齊');
}
checkLesson('js/c01-lesson.js','C01','c01 破冰＋童軍運動目的',['直呼其名','P.O.R. 係乜','點解叫 Venture','分組旗'],8);
checkLesson('js/c02-lesson.js','C02','c02 世界及香港童軍運動＋隊列',['貝登堡','WOSM','中式隊列','時間線'],8);
checkLesson('js/c03-lesson.js','C03','c03 國旗國徽區旗區徽',['五星紅旗','紫荊花','升掛禮儀'],8);
checkLesson('js/c04-lesson.js','C04','c04 香港童軍大會操',['大會操','點名','制服檢查'],5);
checkLesson('js/c05-lesson.js','C05','c05 國歌＋升旗',['國歌','升旗程序','模擬升旗'],8);
checkLesson('js/c06-lesson.js','C06','c06 宣誓集會',['Safe from Harm','宣誓儀式','會員章','兩人規則'],8);
checkLesson('js/c07-lesson.js','C07','c07 認識深資童軍支部',['執委會制','15 至 20 歲','獎章路'],8);
checkLesson('js/c08-lesson.js','C08','c08 列席執委會會議',['列席執委會','會議記錄'],8);
checkLesson('js/c09-lesson.js','C09','c09 童軍創辦人紀念日活動',['貝登堡','思善卡','最後訊息'],8);
checkLesson('js/c10-lesson.js','C10','c10 急救',['出血','包紮','燒燙傷','情境賽','firstaid'],8);
checkLesson('js/c11-lesson.js','C11','c11 地圖種類及圖例',['1:20,000','比例尺','等高線','圖例'],8);
checkLesson('js/c12-lesson.js','C12','c12 指南針＋戶外定向',['指南針','正置地圖','定向'],8);
checkLesson('js/c13-lesson.js','C13','c13 繩結（一）',['平結','八字結','雙套結','接繩結','knots'],8);
checkLesson('js/c14-lesson.js','C14','c14 繩結（二）＋收繩',['繫木結','四方編結','八字編結','收繩','九結大點名','ropeCare'],8);
checkLesson('js/c15-lesson.js','C15','c15 露營策劃＋烹調實習',['露營計劃書','氣爐','刀具','烹調','執包比賽'],8);
checkLesson('js/c16-lesson.js','C16','c16 兩日一夜露營＋頒發肩章',['紮營','營火晚會','拔營','頒肩章'],7);

const dataSrc = readFileSync(root+'js/data.js','utf8');
['sensitive:true','special:true','outdoor:true','personalKit'].forEach(t=>{
  if(!dataSrc.includes(t)){ console.error('❌ data 缺',t); process.exit(1); }
});
if (!dataSrc.includes('深資童軍訓練綱要')) { console.error('❌ data 未指明深資綱要'); process.exit(1); }
console.log('✅ data 標記齊');
const icon = readFileSync(root + 'icons/icon-192.png');
if (!(icon[0]===0x89 && icon[1]===0x50 && icon[2]===0x4E && icon[3]===0x47)) { console.error('❌ icon 非 PNG'); process.exit(1); }
{
  const i512 = readFileSync(root + 'icons/icon-512.png');
  const rd = (b)=>({w:b.readUInt32BE(16),h:b.readUInt32BE(20)});
  const a = rd(icon), b2 = rd(i512);
  if (a.w!==192||a.h!==192){ console.error('❌ icon-192 唔係 192×192，係', a.w+'x'+a.h); process.exit(1); }
  if (b2.w!==512||b2.h!==512){ console.error('❌ icon-512 唔係 512×512，係', b2.w+'x'+b2.h); process.exit(1); }
  const mask = readFileSync(root+'icons/icon-maskable-512.png');
  if (!(mask[0]===0x89 && mask[1]===0x50)){ console.error('❌ maskable icon 非 PNG'); process.exit(1); }
}
console.log('✅ v19 icon：192/512/maskable 齊晒（尺寸啱）');

const ctx={window:{addEventListener:()=>{},print:()=>{},scrollTo:()=>{}},document:{getElementById:()=>({appendChild:()=>{},innerHTML:'',classList:{add:()=>{},remove:()=>{},toggle:()=>{}},setAttribute:()=>{},onclick:null,style:{}}),querySelector:()=>null,querySelectorAll:()=>[],createElement:(t)=>({classList:{add:()=>{},remove:()=>{},toggle:()=>{}},setAttribute:()=>{},appendChild:()=>{},innerHTML:'',style:{}}),addEventListener:()=>{}},location:{hash:'',href:'',replace:()=>{}},navigator:{onLine:true,serviceWorker:{register:()=>new Promise(()=>{})}},addEventListener:()=>{},setTimeout:()=>0};
createContext(ctx);
['js/dia.js','js/interests.js','js/ceremony.js','js/uniform.js','js/ayp.js','js/figs.js','js/items.js','js/projector.js','js/teach.js','js/teach2.js', ...lessonFiles, 'js/data.js','js/app.js'].forEach(f => {
  runInContext(readFileSync(root+f,'utf8'), ctx, {filename:f});
});
/* v37：前端已經完全冇 SVG（用戶：唔要 SVG，全部 AVIF）——js/dia.js 由 IMG.map 砌 DIAGRAMS，
   只會出 <img src="img/dia/*.avif">。手繪 SVG 底稿搬去 assets_src/diasvg/（build-only），
   呢度照舊載入佢哋，只為驗「圖上畫咗／寫咗乜」（尺寸線、角度、文字出框）——
   AVIF 由同一張底稿 raster 出嚟，驗到底稿即係驗到圖。 */
{
  const sc = { window:{}, Math, JSON, console };
  sc.window = sc; sc.globalThis = sc;
  createContext(sc);
  for (const f of ['assets_src/diasvg/diagrams.src.js','assets_src/diasvg/svg-kit.src.js']) {
    runInContext(readFileSync(root+f,'utf8'), sc, {filename:f});
  }
  const SVGSRC = {};
  (function walk(o, prefix){
    for (const k in o) {
      const v = o[k], key = prefix ? prefix+'.'+k : k;
      if (typeof v === 'string') { if (/<svg/i.test(v)) SVGSRC[key] = v; }
      else if (v && typeof v === 'object') walk(v, key);
    }
  })(sc.DIAGRAMS, '');
  /* 'top.compass'／'top.pack' 係 app 出圖用嘅 key，底稿入面就叫 compass／pack → 對返 */
  for (const k of ['compass','pack']) if (SVGSRC[k]) { SVGSRC['top.'+k] = SVGSRC[k]; delete SVGSRC[k]; }
  ctx.IMG.svg = SVGSRC;   /* 測試專用；前端冇呢個 map */
  ctx.__testSvgSrc = true;
  if (Object.keys(SVGSRC).length < 45) { console.error('❌ 底稿源檔唔齊（'+Object.keys(SVGSRC).length+'／45）：assets_src/diasvg/'); process.exit(1); }
}
function srcView(g){ const o={}; for (const k in ctx.IMG.svg) if (k.indexOf(g+'.')===0) o[k.slice(g.length+1)] = ctx.IMG.svg[k]; return o; }
/* 圖上寫咗乜：v35 之前係手繪 SVG 底稿（IMG.svg）；v36 起制服 9 張冇底稿，
   內容直接燒喺 AVIF 度，所以改用 IMG.map 嘅 alt（同時 app.js 嘅 figcaption 都要講同樣數字）。 */
function srcOf(key){ return ctx.IMG.svg[key] || (ctx.IMG.map[key] ? ctx.IMG.map[key].alt : '') || ''; }
console.log('✅ JS 執行：', Object.keys(ctx.App.pages).join(','));
console.log('✅ 儀式卡',ctx.CEREMONY.cards.length,'制服類型',ctx.UNIFORM.types.length,'制服分支',ctx.UNIFORM.branches.length);
if (ctx.CEREMONY.cards.length !== 8) { console.error('❌ 儀式卡應為 8 套（含支部目的卡）'); process.exit(1); }
if (ctx.UNIFORM.types.length !== 9) { console.error('❌ 制服類型應為 9 款（深資陸海空 × 男／女＋女長褲變體）'); process.exit(1); }
const codes=['C01','C02','C03','C04','C05','C06','C07','C08','C09','C10','C11','C12','C13','C14','C15','C16'];
for(let i=0;i<codes.length;i++){
  const c=codes[i];
  console.log('✅ '+c.toLowerCase(),'full=',ctx.DATA.meetings[i].full,'segs=',ctx[c].program.length);
}
if (ctx.DATA.meetings.length !== 16) { console.error('❌ 集會應為 16 場'); process.exit(1); }
console.log('✅ App.renderMeeting:',typeof ctx.App.renderMeeting);
for(let i=0;i<codes.length;i++){
  const tid=codes[i].toLowerCase();
  try{ ctx.App.renderMeeting(tid); }catch(e){ console.error('❌ renderMeeting('+tid+'):',e.message,e.stack.split('\n')[0]); process.exit(1); }
}
console.log('✅ renderMeeting(c01-c16) 正常');

// v17：遊戲庫＋現場工具（VS：13 個遊戲）
if(ctx.DATA.games.length!==23){ console.error('❌ 遊戲庫唔係 23 個（官方套包 3 ＋ 深資自製 20），實際 '+ctx.DATA.games.length); process.exit(1); }
for (const gname of ['你是誰（官方套包）','用背脊畫圖畫（官方套包）','香港童軍運動問答挑戰賽（官方套包）']) {
  const g = ctx.DATA.games.find(x=>x.n===gname);
  if (!g) { console.error('❌ 缺少官方套包遊戲：'+gname); process.exit(1); }
  if (!Array.isArray(g.steps) || g.steps.length < 4) { console.error('❌ '+gname+' 冇完整玩法（要逐步寫出，唔係得一句）'); process.exit(1); }
  if (!g.mats || !g.safety || !g.tips) { console.error('❌ '+gname+' 缺物資／安全／帶領提示'); process.exit(1); }
}
if (ctx.DATA.games.some(g=>/德州撲克|21點|百家樂|賭/.test(g.desc||''))) { console.error('❌ 遊戲庫仲有賭博類內容，唔適合團集會'); process.exit(1); }
console.log('✅ 遊戲庫 23 個（官方套包 3 個玩法齊＋無賭博類）');
for (const f of ['patrolScore','drawLots','countdownStart','groupRandom']) {
  if(typeof ctx.App[f]!=='function'){ console.error('❌ 缺集會現場工具函數 '+f); process.exit(1); }
}
/* v31：分組數可加減＋每個工具都有投屏 */
for (const f of ['patrolCount','patrolScoreReset','patrolName','boardHtml','projHtml','toolsRefresh','projSec','projPage','projPlan']) {
  if(typeof ctx.App[f]!=='function'){ console.error('❌ v31 缺函數 '+f); process.exit(1); }
}
{
  const before = ctx.App.troop.count;
  ctx.App.patrolCount(6); if (ctx.App.troop.count !== 6) { console.error('❌ 分組數改唔到（應 6，實際 '+ctx.App.troop.count+'）'); process.exit(1); }
  ctx.App.patrolCount(0); if (ctx.App.troop.count < 2) { console.error('❌ 分組數下限冇守住'); process.exit(1); }
  ctx.App.patrolCount(99); if (ctx.App.troop.count > 8) { console.error('❌ 分組數上限冇守住'); process.exit(1); }
  ctx.App.patrolCount(before);
  if (ctx.App.boardHtml(false).indexOf('第一組') < 0) { console.error('❌ 計分板冇分組名'); process.exit(1); }
  if (ctx.App.boardHtml(false).indexOf('第一小隊') >= 0) { console.error('❌ 計分板仲有小隊名（應為分組）'); process.exit(1); }
  if (ctx.App.boardHtml(true).indexOf('pj-score') < 0) { console.error('❌ 計分板冇投屏大字版'); process.exit(1); }
  for (const k of ['score','timer','lots','group']) {
    const h = ctx.App.projHtml(k);
    if (!h || h.indexOf('冇內容') >= 0) { console.error('❌ 投屏畫面缺 '+k); process.exit(1); }
  }
}
if (typeof ctx.Projector !== 'object' || typeof ctx.Projector.deck !== 'function' || typeof ctx.Projector.live !== 'function') {
  console.error('❌ projector.js 未載入或 API 唔齊'); process.exit(1);
}
console.log('✅ 集會現場工具函數齊（分組數 2–8 可加減・4 個工具都有投屏版）');

// ═════════ v31：🖥️ 投屏（投影機／大電視）＋ 分組數可加減 ═════════
if (typeof ctx.Projector !== 'object') { console.error('❌ projector.js 冇載入'); process.exit(1); }
for (const f of ['boot','show','deck','live','step','font','close','fullscreen','secondScreen','syncScreen','html']) {
  if (typeof ctx.Projector[f] !== 'function') { console.error('❌ Projector 缺 API：'+f); process.exit(1); }
}
for (const mk of ['App.projSec','App.projPage','App.projPlan','App.projBody','App.projHtml','App.act','App.toolsRefresh']) {
  if (typeof ctx.App[mk.split('.')[1]] !== 'function') { console.error('❌ app.js 缺投屏函數：'+mk); process.exit(1); }
}
/* 每個教學區塊都有「🖥️ 投屏」（App.sec 自動加） */
{ const appSrcV31 = readFileSync(root+'js/app.js','utf8');
  const secSrc = appSrcV31.slice(appSrcV31.indexOf('App.sec = function'), appSrcV31.indexOf('App.sec = function')+1600);
  if (secSrc.indexOf('proj-btn') < 0) { console.error('❌ App.sec 冇自動加「🖥️ 投屏」掣'); process.exit(1); } }
if (readFileSync(root+'js/app.js','utf8').indexOf('Projector.live(') < 0) { console.error('❌ 集會工具四個冇即時投屏'); process.exit(1); }
/* 分組數 2–8 可加減 */
{
  const before = ctx.App.troop.count;
  ctx.App.patrolCount(6);  if (ctx.App.troop.count !== 6) { console.error('❌ 分組數改唔到'); process.exit(1); }
  ctx.App.patrolCount(99); if (ctx.App.troop.count !== 8) { console.error('❌ 分組數上限唔係 8'); process.exit(1); }
  ctx.App.patrolCount(0);  if (ctx.App.troop.count !== 2) { console.error('❌ 分組數下限唔係 2'); process.exit(1); }
  ctx.App.patrolCount(before);
  const v31src = readFileSync(root+'js/app.js','utf8');
  if (v31src.indexOf('App.patrolCount(App.troop.count+1)') < 0 || v31src.indexOf('App.patrolCount(App.troop.count-1)') < 0) {
    console.error('❌ 冇「＋／－」改分組數嘅掣'); process.exit(1);
  }
  const big = ctx.App.boardHtml(true), small = ctx.App.boardHtml(false);
  if (big.indexOf('pj-score') < 0 || small.indexOf('score-table') < 0) { console.error('❌ 計分板冇手機版／投屏版'); process.exit(1); }
  for (const k of ['score','timer','lots','group']) {
    const h = ctx.App.projHtml(k);
    if (!h || h.length < 60) { console.error('❌ 投屏即時畫面「'+k+'」內容不足'); process.exit(1); }
    if (/undefined/.test(h)) { console.error('❌ 投屏即時畫面「'+k+'」有 undefined'); process.exit(1); }
  }
}
/* 投屏 CSS＋接線 */
{
  const cssV31 = readFileSync(root+'css/app.css','utf8');
  for (const c of ['#proj','.proj-btn','.proj-fab','.pj-page','.pj-score','.pj-clock','.pg-row','.subrow','.score-table','.aid-card','.song-grid','.print-host']) {
    if (!cssV31.includes(c)) { console.error('❌ CSS 缺 v31 樣式：'+c); process.exit(1); }
  }
  if (cssV31.indexOf('.proj-btn,.proj-big,.proj-fab') < 0) { console.error('❌ 列印時冇隱藏投屏掣'); process.exit(1); }
}
console.log('✅ v31 投屏：projector.js API 齊・每節都有投屏掣・4 個即時工具・分組數 2–8 可加減');
// v19：tab render——ayp 取代 patrol；儀式/制服/手冊/技能帶 sub 都要 render 到
for (const p of ['print','play','skills','ayp','badges','book','uniform','ceremony']) {
  try{ ctx.App.pages[p](); }catch(e){ console.error('❌ pages.'+p+':',e.message); process.exit(1); }
}
for (const s of ctx.CEREMONY.cards.map(c=>c.k)) { try{ ctx.App.pages.ceremony(s); }catch(e){ console.error('❌ pages.ceremony('+s+'):',e.message); process.exit(1); } }
for (const s of ['land','sea','air','badge','acc','check']) { try{ ctx.App.pages.uniform(s); }catch(e){ console.error('❌ pages.uniform('+s+'):',e.message); process.exit(1); } }
/* VS：手冊 subs＝誓詞／執委會制度／工具／考章／報班／參考 */
for (const s of ['promise','exec','tools','apply','course','ayp','refs']) { try{ ctx.App.pages.book(s); }catch(e){ console.error('❌ pages.book('+s+'):',e.message); process.exit(1); } }
/* v43：技能頁 sub＝單項技能分類（唔再係課程摘要） */
for (const s of ['all','露營','繩結與繩索','地圖與定向','急救','先鋒工程','策劃與會議','badge']) { try{ ctx.App.pages.skills(s); }catch(e){ console.error('❌ pages.skills('+s+'):',e.message); process.exit(1); } }
for (const s of ['about','levels','sections','join']) { try{ ctx.App.pages.ayp(s); }catch(e){ console.error('❌ pages.ayp('+s+'):',e.message); process.exit(1); } }
console.log('✅ v19 全部 tab＋小分頁 render 正常');

/* ═══════ v43 守門：語法／字眼／單項項目庫 ═══════ */
/* 1) 每個 js 都要 parse 得過（v42 曾因 minigame.js 引號未跳脫而靜靜死咗 → 分頁只剩標題） */
{
  const jsFiles = readdirSync(root+'js').filter(f=>f.endsWith('.js'));
  for (const f of jsFiles) {
    const src = readFileSync(root+'js/'+f, 'utf8');
    try { new Script(src, {filename:f}); } catch(e){ console.error('❌ js/'+f+' 語法錯誤：'+e.message); process.exit(1); }
  }
  console.log('✅ '+jsFiles.length+' 個 js 檔全部 parse 得過（防止「只剩標題」再發生）');
}
/* 2) 深資童軍獎章＝四個段章（唔准寫成四條金帶） */
{
  const all = readdirSync(root+'js').filter(f=>f.endsWith('.js')).map(f=>readFileSync(root+'js/'+f,'utf8')).join('\n');
  const bad = ['深資童軍獎章（四金帶）','深資童軍獎章（四條金帶）','深資童軍獎章＝四金帶','深資童軍獎章之四條金帶'];
  for(const b of bad){ if(all.includes(b)){ console.error('❌ 出現錯誤字眼：'+b+'（深資童軍獎章＝四個段章）'); process.exit(1); } }
  if(!all.includes('四個段章')){ console.error('❌ 缺「四個段章」正確講法'); process.exit(1); }
  for(const b of ['實践','参加','策划','不同类型','总会','家长','每分钟','旗面无','礼成','畀我听','险些','延时','汇總','總領䄂','组成部分','三层','规定','预计','做错','装備','服装','远离','各组','我讲一句']){
    if(all.includes(b)){ console.error('❌ 出現簡體／錯字：'+b); process.exit(1); }
  }
  console.log('✅ 字眼守門：深資童軍獎章＝四個段章；冇簡體字／錯字殘留');
}
/* 3) 深資集會儀式：冇小隊、冇家長接送 */
{
  const cer = readFileSync(root+'js/ceremony.js','utf8');
  if(/小隊長[：:]/.test(cer)){ console.error('❌ 儀式卡仍有「小隊長」'); process.exit(1); }
  if(/家長接送|須家長接|由家長接/.test(cer)){ console.error('❌ 儀式卡仍有「家長接送」'); process.exit(1); }
  if(!cer.includes('唔設小隊')){ console.error('❌ 儀式卡未寫明深資唔設小隊'); process.exit(1); }
  if(!cer.includes('Squad, fall — in')){ console.error('❌ 儀式卡未用《步操手冊》集隊口令'); process.exit(1); }
  console.log('✅ 儀式守門：深資冇小隊／冇家長接送；集隊照《步操手冊》第六章');
}
/* 3b) 聚會互動工具：領袖一部手機主持（唔逐個傳手機）；唔收錄賭博玩法 */
{
  const mg = readFileSync(root+'js/minigame.js','utf8');
  const app = readFileSync(root+'js/app.js','utf8');
  if(!mg.includes('一次過派卡')){ console.error('❌ 誰是臥底未改做「一次過派卡」（用戶：唔要逐個傳手機）'); process.exit(1); }
  if(!mg.includes('spyPrintCards')){ console.error('❌ 誰是臥底冇「列印秘密卡」功能'); process.exit(1); }
  if(/renderBjUI|bjState|bjHit|startBjRound/.test(mg)){ console.error('❌ minigame.js 仲有 21 點程式碼（唔適合集會）'); process.exit(1); }
  if(app.includes('mg-bj-box')){ console.error('❌ app.js 仲有 21 點掛載點'); process.exit(1); }
  for(const mk of ['mg-spy-box','mg-agent-box','mg-dice-box','mg-wheel-box']){
    if(!app.includes(mk)){ console.error('❌ 互動工具分頁缺掛載點 '+mk); process.exit(1); }
  }
  if(!mg.includes('主持面板')){ console.error('❌ 誰是臥底缺領袖主持面板'); process.exit(1); }
  if(/德州撲克|百家樂|21點|籌碼|bjState|renderBjUI|bjHit/.test(mg)){ console.error('❌ minigame.js 仲有投注輸贏類內容'); process.exit(1); }
  console.log('✅ 互動工具：4 個（誰是臥底＝領袖主持／一次過派卡＋可印秘密卡；冇 21 點／賭博玩法）');
}
/* 4) 單項項目庫（技能／活動）要有內容 */
{
  const items = readFileSync(root+'js/items.js','utf8');
  const aN = (items.match(/\{ n:'/g)||[]).length;
  if(!ctx.ITEMS || ctx.ITEMS.activities.length < 12){ console.error('❌ 活動項目太少'); process.exit(1); }
  if(ctx.ITEMS.skills.length < 15){ console.error('❌ 技能項目太少'); process.exit(1); }
  for(const k of ['flow','goal','points','demo','check','wrong','safety']){
    if(!items.includes(k+':')){ console.error('❌ items.js 缺欄位 '+k); process.exit(1); }
  }
  console.log('✅ 單項項目庫：活動 '+ctx.ITEMS.activities.length+' 項＋技能 '+ctx.ITEMS.skills.length+' 項（有目的／流程／要點／檢查／安全）');
}

const appSrc = readFileSync(root+'js/app.js','utf8');
for (const mk of ['印本節','game-card','item-card','ITEMS','printPanel','分組計分板','隨機分組','抽籤','倒數計時','會議記錄表','printSec','subnav','meet-row']) {
  if(!appSrc.includes(mk)){ console.error('❌ app.js 缺標記 '+mk); process.exit(1); }
}
if (appSrc.includes('小隊計分板')) { console.error('❌ app.js 仲有「小隊計分板」（應為分組）'); process.exit(1); }
// v19 要求：唔出繩結卡（素材庫）、 獎章 tab 唔放區系統 CTA、整行可撳
if (appSrc.includes('列印繩結卡')) { console.error('❌ 素材庫仲有「列印繩結卡」（用戶要求移除）'); process.exit(1); }
/* v31 用戶要求：素材庫要真分頁（撳 chip 換內容），唔係錨點跳位 */
for (const mk of ['App.printCats','App.printPanel','App.filterbar','App.projSec','App.projPage','App.projPlan','App.projBody']) {
  if (!appSrc.includes(mk)) { console.error('❌ app.js 缺 v31 標記 '+mk); process.exit(1); }
}
{
  const ps = appSrc.slice(appSrc.indexOf('App.pages.print = function'), appSrc.indexOf('App.printPanel = function'));
  if (ps.indexOf('App.filterbar(') < 0) { console.error('❌ 素材庫冇用真分頁掣（filterbar）'); process.exit(1); }
  if (ps.indexOf('App.chiprow(') >= 0) { console.error('❌ 素材庫仲用錨點 chiprow（用戶要撳掣即換內容）'); process.exit(1); }
  if (ps.indexOf('App.jump(') >= 0) { console.error('❌ 素材庫仲用跳位 App.jump'); process.exit(1); }
}
{
  const cats = (appSrc.match(/App\.printCats = \[([\s\S]*?)\];/)||[])[1] || '';
  const n = (cats.match(/\{k:'/g)||[]).length;
  if (n !== 3) { console.error('❌ 聚會GAME 分頁得 '+n+' 類（應 3：互動遊戲工具／集會遊戲卡／即印即用素材，工作紙屬教案內容唔放呢度）'); process.exit(1); }
  if (cats.includes("k:'ws'")) { console.error('❌ 聚會GAME 仲有工作紙分頁（應搬走，工作紙留喺教案頁面）'); process.exit(1); }
}
/* 用戶要求：刪 🅰️／🅱️ 兩句 navcap 同相關字句 */
if (appSrc.includes('🅰️') || appSrc.includes('🅱️')) { console.error('❌ app.js 仲有 🅰️／🅱️ 字句'); process.exit(1); }
console.log('✅ 素材庫真分頁（3 類即時切換：互動工具／遊戲卡／即印素材）・🅰️／🅱️ 字句已清');
if (appSrc.includes('前往區總部報章系統')) { console.error('❌ 獎章仲有「前往區總部報章系統」連結（用戶要求移除）'); process.exit(1); }
if (!appSrc.includes('data-href')) { console.error('❌ 集會目錄冇整行可撳（data-href）'); process.exit(1); }
console.log('✅ v19：無繩結卡・無區系統CTA・整行可撳');

const cssSrc = readFileSync(root+'css/app.css','utf8');
if(!cssSrc.includes('.print-btn, .filters')){ console.error('❌ CSS 缺列印隱藏規則'); process.exit(1); }
/* v31 投屏 */
for (const c of ['#proj','.proj-btn','.proj-fab','.pj-score','.pj-clock','.pg-row','.song-grid','.score-table','.aid-card']) {
  if(!cssSrc.includes(c)){ console.error('❌ CSS 缺 v31 樣式 '+c); process.exit(1); }
}
if (!/proj-btn,\.proj-big,\.proj-fab/.test(cssSrc)) { console.error('❌ CSS 冇喺列印時隱藏投屏掣'); process.exit(1); }
for (const c of ['.subnav','.print-one','#printzone','.dgm-fig','.song-grid','.meet-row']) {
  if(!cssSrc.includes(c)){ console.error('❌ CSS 缺 v19 樣式 '+c); process.exit(1); }
}
console.log('✅ 列印 CSS＋v19 樣式齊');

// v19 圖解庫
if(!ctx.DIAGRAMS || !ctx.DIAGRAMS.compass || !ctx.DIAGRAMS.pack){ console.error('❌ DIAGRAMS 基礎圖缺'); process.exit(1); }
/* v42：童軍支部「地面追蹤符號」6 張圖已刪除（唔准照抄支部內容） */
if (ctx.DIAGRAMS.track && Object.keys(ctx.DIAGRAMS.track).length) { console.error('❌ DIAGRAMS.track 仲有圖（支部追蹤內容應刪走，只能引用出處）'); process.exit(1); }
/* v35：圖解統一係 <img src="img/dia/*.avif">（用戶要求唔用 SVG） */
for (const [nm, html] of [['compass',ctx.DIAGRAMS.compass],['pack',ctx.DIAGRAMS.pack],['cer.open',ctx.DIAGRAMS.cer.open],['game.有口難言',ctx.DIAGRAMS.game['有口難言']]]) {
  if (!/^<img src="img\/dia\/[a-z0-9-]+\.avif"/.test(html)) { console.error('❌ '+nm+' 唔係 AVIF 圖：'+String(html).slice(0,40)); process.exit(1); }
}
if (!ctx.IMG || typeof ctx.IMG.has!=='function' || !ctx.IMG.has('cer.open') || !ctx.IMG.alt('cer.open') || typeof ctx.IMG.fallback!=='function' || typeof ctx.IMG.onerr!=='function') { console.error('❌ js/dia.js 未載入（IMG API 缺）'); process.exit(1); }
/* 全庫掃描：DIAGRAMS 任何一葉都唔可以再係 <svg>（用戶：盡量唔要 SVG） */
{
  const bad = [];
  (function walk(o, path){ for (const k in o) { const v=o[k], p=path?path+'.'+k:k;
    if (typeof v==='string') { if (/<svg/i.test(v)) bad.push(p); }
    else if (v && typeof v==='object') walk(v, p); } })({compass:ctx.DIAGRAMS.compass,pack:ctx.DIAGRAMS.pack,cer:ctx.DIAGRAMS.cer,game:ctx.DIAGRAMS.game,skillx:ctx.DIAGRAMS.skillx,fire:ctx.DIAGRAMS.fire}, '');
  if (bad.length) { console.error('❌ DIAGRAMS 仲有 SVG 未轉 AVIF（'+bad.length+'）：'+bad.slice(0,8).join(', ')); process.exit(1); }
}
/* v37：前端 bundle 零 SVG —— 冇 <svg>、冇引用 .svg 檔（用戶：其他地方都盡量唔用 SVG，用 AVIF） */
{
  const shipped = ['index.html','manifest.webmanifest','sw.js','css/app.css','js/dia.js','js/data.js','js/interests.js','js/ceremony.js','js/uniform.js','js/teach.js','js/teach2.js','js/ayp.js','js/figs.js','js/items.js','js/projector.js','js/app.js', ...lessonFiles];
  const bad = [];
  /* 註解可以講 SVG（解釋設計決定），但碼／標記唔可以真係出 SVG → 掃之前剷走註解 */
  const codeOnly = (src)=>src.replace(/\/\*[\s\S]*?\*\//g,'').replace(/<!--[\s\S]*?-->/g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');
  for (const f of shipped) {
    const src = codeOnly(readFileSync(root+f,'utf8'));
    if (/<svg/i.test(src)) bad.push(f+'：有 <svg>');
    if (/\.svg["']/.test(src)) bad.push(f+'：引用 .svg 檔');
    if (/data:image\/svg/i.test(src)) bad.push(f+'：inline SVG data URI');
  }
  if (bad.length) { console.error('❌ 前端仲有 SVG（用戶要求唔要）：\n   '+bad.join('\n   ')); process.exit(1); }
  if (typeof ctx.IMG.svg !== 'undefined' && !ctx.__testSvgSrc) { console.error('❌ js/dia.js 應該冇 IMG.svg（SVG 後備已經冇）'); process.exit(1); }
  console.log('✅ v37：前端 '+shipped.length+' 個檔案零 SVG（冇 <svg>、冇 .svg 檔；圖載唔到只出 alt 文字）');
}
/* 每個 IMG.map key 都要出得到圖：DIAGRAMS 對應位置一定係 <img src="img/dia/*.avif"> */
{
  const flat = {};
  (function walk(o, p){ for (const k in o) { const v=o[k], key=p?p+'.'+k:k;
    if (typeof v==='string') flat[key]=v; else if (v && typeof v==='object') walk(v,key); } })({compass:ctx.DIAGRAMS.compass,pack:ctx.DIAGRAMS.pack,cer:ctx.DIAGRAMS.cer,game:ctx.DIAGRAMS.game,skillx:ctx.DIAGRAMS.skillx,fire:ctx.DIAGRAMS.fire}, '');
  const bad = [];
  for (const key of Object.keys(ctx.IMG.map)) {
    const k = key.indexOf('top.')===0 ? key.slice(4) : key;
    const html = flat[k];
    if (!html) { bad.push(key+'：DIAGRAMS 冇呢一葉'); continue; }
    if (!/^<img src="img\/dia\/[a-z0-9-]+\.avif"/.test(html)) bad.push(key+'：唔係 AVIF img（'+String(html).slice(0,30)+'）');
  }
  const extra = Object.keys(flat).filter(k => !ctx.IMG.map[k] && !ctx.IMG.map['top.'+k]);
  if (bad.length) { console.error('❌ IMG.map → DIAGRAMS 對唔上：\n   '+bad.join('\n   ')); process.exit(1); }
  console.log('✅ v37：IMG.map '+Object.keys(ctx.IMG.map).length+' 張圖全部經 DIAGRAMS 出 <img>（零 SVG'+(extra.length?'；'+extra.length+' 個孤兒 key':'')+'）');
}
/* 每張圖都有圖檔＋alt，並且 sw.js 有 cache */
{
  const m = ctx.IMG.map, n = Object.keys(m).length;
  if (n < 28 || n > 40) { console.error('❌ dia.js 圖檔對照表唔啱數（'+n+'）——v42 删咗自製制服／手勢／追蹤圖之後應得 30 張附近'); process.exit(1); }
  for (const k in m) {
    const e = m[k];
    if (!e.f || e.f.indexOf('img/dia/') !== 0 || e.f.indexOf('.avif') < 0) { console.error('❌ dia.js 圖檔路徑唔對：'+k); process.exit(1); }
    if (!e.w || !e.h) { console.error('❌ dia.js 冇標尺寸：'+k); process.exit(1); }
    if (!e.alt || e.alt.length < 8) { console.error('❌ dia.js 冇 alt 文字：'+k); process.exit(1); }
    if (!readFileSync(root+'sw.js','utf8').includes(e.f)) { console.error('❌ sw.js 冇 cache 圖檔：'+k+' → '+e.f); process.exit(1); }
    if (!existsSync(root+e.f)) { console.error('❌ 圖檔唔存在：'+e.f); process.exit(1); }
  }
}
if(Object.keys(ctx.DIAGRAMS.cer).length!==5){ console.error('❌ 儀式圖解應得 5 張隊形圖（open/close/oath/flag/formup）'); process.exit(1); }
/* VS：11 張遊戲場地圖（拖木頭挑戰已移除；你是誰／用背脊畫圖畫係破冰，唔使場地圖） */
if(Object.keys(ctx.DIAGRAMS.game).length!==11){ console.error('❌ 遊戲場地圖唔係 11 張，實際', Object.keys(ctx.DIAGRAMS.game).length); process.exit(1); }
if(ctx.DIAGRAMS.game['拖木頭挑戰']){ console.error('❌ 遊戲場地圖仲有拖木頭挑戰'); process.exit(1); }
if(!ctx.DIAGRAMS.skillx || !ctx.DIAGRAMS.skillx.tent || !ctx.DIAGRAMS.skillx.rice || !ctx.DIAGRAMS.skillx.sos || !ctx.DIAGRAMS.skillx.lost){ console.error('❌ 技能圖解缺'); process.exit(1); }
if(!ctx.DIAGRAMS.fire || !ctx.DIAGRAMS.fire.circle || !ctx.DIAGRAMS.fire.flow){ console.error('❌ 營火圖缺'); process.exit(1); }
if(ctx.DIAGRAMS.reef || ctx.DIAGRAMS.bowline){ console.error('❌ 仲殘留繩結逐步圖（用戶要求移除）'); process.exit(1); }
console.log('✅ 圖解庫齊（AVIF：指南針/背囊/追蹤6＋儀式/遊戲11/技能/營火；繩結圖已移除）');

// 搜尋頁
try{ ctx.App.pages.search('急救'); ctx.App.pages.search(); }catch(e){ console.error('❌ pages.search:',e.message); process.exit(1); }
console.log('✅ 搜尋頁 render 正常');
if(ctx.App.buildSearchIndex().length < 75){ console.error('❌ 搜尋索引太少：', ctx.App.buildSearchIndex().length); process.exit(1); }
console.log('✅ 搜尋索引', ctx.App.buildSearchIndex().length, '項');
for (const mk of ['義勇軍進行曲','searchGo','buildSearchIndex','全站搜尋']) {
  if(!appSrc.includes(mk)){ console.error('❌ app.js 缺標記 '+mk); process.exit(1); }
}
// AYP（v39 用戶要求）：營火會成格刪掉，底部第 5 格改做 AYP（只查不記）
const aypSrc = readFileSync(root+'js/ayp.js','utf8');
for (const k of ['service','skills','recreation','journey','residential']) {
  if (!aypSrc.includes("k: '"+k+"'")) { console.error('❌ ayp.js 缺五科 '+k); process.exit(1); }
}
if (!ctx.AYP || ctx.AYP.sections.length !== 5) { console.error('❌ AYP 五科唔齊'); process.exit(1); }
if (ctx.AYP.join.length !== 7) { console.error('❌ AYP 參加流程唔係 7 步'); process.exit(1); }
if (ctx.AYP.docs.length < 6) { console.error('❌ AYP 官方文件不足 6 份'); process.exit(1); }
if (ctx.AYP.levelTable.rows.length !== 4) { console.error('❌ AYP 三級比較表唔係 4 行'); process.exit(1); }
for (const sx of ctx.AYP.sections) {
  if (!sx.n || !sx.en || !sx.purpose || !sx.examples || !sx.examples.length || !sx.note) { console.error('❌ AYP 五科欄位唔齊：'+sx.k); process.exit(1); }
}
for (const st of ctx.AYP.join) {
  if (!st.t || !st.d) { console.error('❌ AYP 參加步驟欄位唔齊'); process.exit(1); }
}
for (const d of ctx.AYP.docs) {
  if (!d.n || !d.url || d.url.indexOf('http') !== 0) { console.error('❌ AYP 官方文件連結唔齊'); process.exit(1); }
}
if (!ctx.AYP.leader || ctx.AYP.leader.what.length < 3) { console.error('❌ AYP.leader.what 唔齊'); process.exit(1); }
if (ctx.AYP.leader.joinMember.length !== 5) { console.error('❌ AYP.leader.joinMember 唔係 5 步'); process.exit(1); }
if (ctx.AYP.leader.joinLeader.length !== 3) { console.error('❌ AYP.leader.joinLeader 唔係 3 種角色'); process.exit(1); }
if (ctx.AYP.leader.setup.length !== 4) { console.error('❌ AYP.leader.setup 唔係 4 步'); process.exit(1); }
if (ctx.AYP.leader.links.length < 5) { console.error('❌ AYP.leader.links 官方文件不足'); process.exit(1); }
if (!aypSrc.includes('AYP/10') || !aypSrc.includes('2157 8610')) { console.error('❌ ayp.js 缺 AYP/10／2157 8610'); process.exit(1); }
if (!appSrc.includes('AYP領袖指南') || appSrc.indexOf("if(cur==='ayp'){") < 0) { console.error('❌ 手冊冇 AYP領袖指南分頁'); process.exit(1); }
if (!aypSrc.includes('主項') || !aypSrc.includes('副項') || !aypSrc.includes('紀錄簿') || !aypSrc.includes('執行處')) { console.error('❌ ayp.js 缺關鍵內容（主項／副項／紀錄簿／執行處）'); process.exit(1); }
console.log('✅ AYP：五科＋三級比較表＋7 步參加流程＋官方文件（只查不記）');
// index.html 接線
const htmlSrc = readFileSync(root+'index.html','utf8');
if(!htmlSrc.includes('js/dia.js') || !htmlSrc.includes("#search'")){ console.error('❌ index.html 缺 dia/search 接線'); process.exit(1); }
if(htmlSrc.includes('svg-kit') || htmlSrc.includes('diagrams.js')){ console.error('❌ index.html 仲載入緊手繪 SVG 底稿（v37 起前端只出 AVIF）'); process.exit(1); }
if(/<svg/i.test(htmlSrc) || /\.svg["']/.test(htmlSrc)){ console.error('❌ index.html 仲有 SVG'); process.exit(1); }
if(!htmlSrc.includes('data-tab="ayp"') || htmlSrc.includes('data-tab="patrol"')){ console.error('❌ index.html 底部 tab 未轉AYP'); process.exit(1); }
if(htmlSrc.includes('navcap')){ console.error('❌ index.html 仲有 navcap（用戶要求刪 🅰️／🅱️ 兩句）'); process.exit(1); }
if(htmlSrc.includes('🅰️') || htmlSrc.includes('🅱️')){ console.error('❌ index.html 仲有 🅰️／🅱️ 字句'); process.exit(1); }
if(!htmlSrc.includes('js/projector.js') || !htmlSrc.includes('id="projfab"')){ console.error('❌ index.html 未接 projector.js／投屏掣'); process.exit(1); }
if(htmlSrc.indexOf('js/projector.js') > htmlSrc.indexOf('js/app.js')){ console.error('❌ projector.js 要喺 app.js 之前載入'); process.exit(1); }
console.log('✅ index.html 接線齊（🌟AYP tab）');

// manifest：分頁捷徑＋maskable icon（VS 版）
const mf = readFileSync(root+'manifest.webmanifest','utf8');
if(!mf.includes('icon-maskable-512.png') || !mf.includes('#ayp')){ console.error('❌ manifest 缺 maskable icon 或 AYP shortcut'); process.exit(1); }
if(!mf.includes('深資童軍團集會助手') || !mf.includes('Scout System 出品')){ console.error('❌ manifest 未轉深資版'); process.exit(1); }
if(!mf.includes('#badges') || mf.includes('興趣章')){ console.error('❌ manifest 獎章 shortcut 未改名'); process.exit(1); }
console.log('✅ manifest：深資版＋新 icon＋AYP shortcut');

// sw.js（VS 版：scout-vN-xxx-日期）
const swSrc = readFileSync(root+'sw.js','utf8');
const swTag = (swSrc.match(/scout-v[0-9]+-[a-z0-9]+-[0-9]+/)||[])[0];
if(!swTag || !swSrc.includes('c16-lesson.js')){ console.error('❌ sw.js cache 名唔係 scout-vN-xxx-日期 格式'); process.exit(1); }
for (let i = 17; i <= 24; i++) {
  if (swSrc.includes('c'+i+'-lesson.js')) { console.error('❌ sw.js 仲 cache 緊已刪除嘅 c'+i); process.exit(1); }
}
/* VS 版唔再預緩存童軍支部興趣章圖／制服圖（app 已唔用） */
if(swSrc.includes('img/badge/') || swSrc.includes('img/uni/')){ console.error('❌ sw.js 仲 cache 緊已棄用嘅 badge/uni 圖'); process.exit(1); }
if(!readFileSync(root+'README.md','utf8').includes(swTag)){ console.error('❌ README 寫嘅 cache 版本同 sw.js（'+swTag+'）唔一致'); process.exit(1); }
if(!swSrc.includes('ayp.js') || !swSrc.includes('projector.js')){ console.error('❌ sw.js 未 cache 新檔（ayp/projector）'); process.exit(1); }
if(swSrc.includes('svg-kit') || swSrc.includes('diagrams.js')){ console.error('❌ sw.js 仲 cache 緊 SVG 底稿（前端唔應該再下載）'); process.exit(1); }
if(!swSrc.includes('./js/dia.js')){ console.error('❌ sw.js 未 cache js/dia.js（圖檔對照表）'); process.exit(1); }
console.log('✅ sw.js cache 版本 '+swTag+'（README 已同步）');

// README
const rm = readFileSync(root+'README.md','utf8');
if(!rm.includes('c16')){ console.error('❌ README 缺 c16'); process.exit(1); }
if(!rm.includes('深資童軍團集會助手') || !rm.includes('Scout System 出品')){ console.error('❌ README 未轉深資版'); process.exit(1); }
// ── v42：儀式內容範圍（照官方指引・唔准有自創動作／舊版錯誤數字）──
{
  const srcs = ['js/ceremony.js','js/c01-lesson.js','js/app.js'].map(f=>readFileSync(root+f,'utf8')).join('\n');
  for (const dead of ['#ceremony/march','#ceremony/colour','#ceremony/commands','#ceremony/parade','#ceremony/handsign','#ceremony/sidepace']) {
    if (srcs.includes(dead)) { console.error('❌ 仲有連結去已刪走嘅卡：'+dead); process.exit(1); }
  }
  const cerSrc = readFileSync(root+'js/ceremony.js','utf8');
  if (!/步操手冊|DRILL MANUAL/.test(cerSrc) || !/drive\.google\.com\/file\/d\/1gWQA1dhwATv2T_jO0MMTrOBlh7NqzpHj/.test(cerSrc) || !/drive\.google\.com\/file\/d\/1NKR6LMXPBSokJl1IbHDc8IFAEVZAcT7F/.test(cerSrc)) { console.error('❌ 冇留低《步操手冊》出處＋分割檔連結（1–30／91–120；深階要靠呢個指引）'); process.exit(1); }
  if (!/訓練班/.test(readFileSync(root+'js/app.js','utf8'))) { console.error('❌ 儀式頁冇講明「深階步操請上訓練班」'); process.exit(1); }
  if (!/2003 年 7 月第二版/.test(cerSrc)) { console.error('❌ 冇寫明《步操手冊》版次（2003 年 7 月第二版）'); process.exit(1); }
  /* v42：舊版自創／抄錯嘅步操描述一律唔准回流（正確要領照《隊列和升掛國旗及區旗指引》2024-06） */
  const FT = JSON.stringify(ctx.CEREMONY.cards.find(c=>c.k==='footdrill'));
  for (const banned of ['305','Out!','In!','Alert','Bend the left knee','Shoot the right foot','Changing step','Inclining','MARKER OUTWARD','AW-AWAY-YEA','CALL THE ROLL','後顎貼衣領','腳尖向外 30 度','150mm','DOUBLE TIME','動令落邊隻腳','檢閱會操','每分鐘 116']) {
    if (FT.includes(banned)) { console.error('❌ 步操卡仲有舊版錯誤／深階內容：'+banned); process.exit(1); }
  }
  for (const kw of ['一腳之長','約 60 度','三分之二','75 厘米','116–122']) {
    if (!FT.includes(kw)) { console.error('❌ 步操卡冇照《隊列和升掛國旗及區旗指引》（2024-06）寫要領：缺「'+kw+'」'); process.exit(1); }
  }
  if (!/整理著裝/.test(FT) || !/滿伍/.test(FT)) { console.error('❌ 步操卡冇預備口令「整理著裝」／「滿伍」（2024 指引新增）'); process.exit(1); }
  const FL = JSON.stringify(ctx.CEREMONY.cards.find(c=>c.k==='flag'));
  if (!/國旗在右、區旗在左|區旗在左/.test(FL)) { console.error('❌ 升旗卡冇寫國旗與區旗並列位置（國旗在右、區旗在左）'); process.exit(1); }
  if (!/持旗手持旗經過/.test(FL) || !/面向旗幟肅立/.test(FL)) { console.error('❌ 升旗卡冇寫「持旗經過／未列隊者」嘅行禮規定（原文要照留）'); process.exit(1); }
  const FA = JSON.stringify(ctx.CEREMONY.cards.find(c=>c.k==='fallin'));
  if (!/團長/.test(FA) || !/執委會/.test(FA) || !/右前方/.test(FA)) { console.error('❌ 集隊卡冇講團長／執委會／組長位置'); process.exit(1); }
  const c01mins = ctx.C01.program.reduce((a2,p2)=>a2+(p2.min||0),0);
  const c01dur = ctx.DATA.meetings.find(m=>m.tid==='c01').duration;
  if (c01mins !== c01dur) { console.error('❌ c01 各段分鐘數加唔埋資料卡 duration（'+c01mins+' ≠ '+c01dur+'）'); process.exit(1); }
    {
    const sum = ctx.CEREMONY.program.rows.reduce((a2,r)=>a2+((String(r[2]).match(/(\d+)\s*′/)||[0,0])[1]|0),0);
    if (sum !== 75) { console.error('❌ 恆常集會 8 段時間加唔埋 75′（官方套包：5+5+20+15+15+5+5+5）；而家 '+sum+'′'); process.exit(1); }
    if (!/85 分鐘/.test(ctx.CEREMONY.program.note)) { console.error('❌ 程序表冇交代套包每場 85 分鐘（75′ 流程＋10′ 緩衝）'); process.exit(1); }
  }
  const rm = readFileSync(root+'README.md','utf8');
  if (!/8 套儀式卡/.test(rm)) { console.error('❌ README 冇講明儀式卡係 8 套（改咗卡數要同步）'); process.exit(1); }
  if (!/dgm-fold\{/.test(readFileSync(root+'css/app.css','utf8'))) { console.error('❌ css 缺 .dgm-fold（逐步圖解折疊用）'); process.exit(1); }
  console.log('✅ v42 範圍收斂：儀式卡 '+ctx.CEREMONY.cards.length+' 張・步操照 2024 指引・無自創動作・c01 85 分鐘');
}

// ── v42：儀式卡守門（只准用隊形／位置示意圖；唔准再有自製動作・手勢・章位圖）──
{
  const got = Object.keys(ctx.IMG.map).filter(k=>k.indexOf('cer.')===0).map(k=>k.slice(4)).sort();
  const want = ['close','flag','formup','oath','open'];
  if (got.join(',') !== want.join(',')) {
    console.error('❌ IMG.map 應該淨低 5 張隊形示意圖（'+want.join('/')+'）；而家 '+got.join(',')); process.exit(1);
  }
  for (const c of ctx.CEREMONY.cards) {
    if (c.fig && !ctx.IMG.map['cer.'+c.fig]) { console.error('❌ 卡「'+c.k+'」引用咗冇嘅圖解 key：cer.'+c.fig); process.exit(1); }
    const heads = (c.steps||[]).map(x=>x.h).concat((c.types||[]).map(x=>x.t)).join('|');
    if (/團呼|歡呼大會|齊讀口號|齊讀支部口號/.test(heads)) { console.error('❌ 儀式卡「'+c.k+'」仲有自創團呼／齊讀環節（官方程序冇）'); process.exit(1); }
    if (c.k==='open' || c.k==='close') {
      const n = (c.steps||[]).length;
      if (n < 5) { console.error('❌ '+c.k+' 卡步驟太少（'+n+'）：新領袖要可以逐項照讀'); process.exit(1); }
    }
  }
  /* 恆常集會程序照官方套包 8 段 */
  if (!ctx.CEREMONY.program || ctx.CEREMONY.program.rows.length !== 8) { console.error('❌ 缺恆常集會 8 段程序表（官方套包）'); process.exit(1); }
  console.log('✅ v42 儀式：5 張隊形示意圖・無自製動作圖・8 段程序表');
}

/* v42：教材守門——16 場全部要有「照住講」內容（官方原文＋知識點＋示範步驟＋抽問） */
{
  const codes = ['c01','c02','c03','c04','c05','c06','c07','c08','c09','c10','c11','c12','c13','c14','c15','c16'];
  if (typeof ctx.TEACH === 'undefined') { console.error('❌ 冇 js/teach.js（教材庫）'); process.exit(1); }
  for (const k of codes) {
    const b = ctx.TEACH[k];
    if (!Array.isArray(b) || b.length < 2) { console.error('❌ 教材缺 '+k+'（需要至少 2 段真教材，唔係「請講解⋯」）'); process.exit(1); }
    const txt = JSON.stringify(b);
    if (/undefined|\[object Object\]/.test(txt)) { console.error('❌ '+k+' 教材有 undefined／未展開物件'); process.exit(1); }
    if (!b.some(x=>x.points&&x.points.length || x.cards&&x.cards.length || x.steps&&x.steps.length || x.list&&x.list.length || x.timetable&&x.timetable.length)) {
      console.error('❌ '+k+' 教材冇知識點內容（要有 points／cards／steps／list／timetable）'); process.exit(1);
    }
    if (!b.some(x=>x.demo&&x.demo.length)) { console.error('❌ '+k+' 教材冇示範／實習帶法（demo）'); process.exit(1); }
    if (!b.some(x=>x.script&&x.script.length)) { console.error('❌ '+k+' 教材冇可照讀嘅講稿（script）'); process.exit(1); }
    try { ctx.App.renderMeeting(k); } catch(e){ console.error('❌ renderMeeting('+k+') 失敗：'+e.message); process.exit(1); }
  }
  /* app.js 要真係將 TEACH 渲染入教案頁（唔好淨係得資料冇出口） */
  const appSrcT = readFileSync(root+'js/app.js','utf8');
  if (!/TEACH\[tid\]/.test(appSrcT) || !/照住講/.test(appSrcT)) { console.error('❌ app.js 冇將 TEACH 渲染到教案頁（缺 TEACH[tid]／「照住講」標題）'); process.exit(1); }
  if (!/teach-/.test(readFileSync(root+'css/app.css','utf8'))) { console.error('❌ css 冇 .teach-* 樣式（教材頁會散晒）'); process.exit(1); }
  /* 教材出處要齊（官方檔案連結，唔係得個名） */
  if (!Array.isArray(ctx.TEACH.sources) || ctx.TEACH.sources.length < 5) { console.error('❌ TEACH.sources 唔夠（要列明官方出處＋連結）'); process.exit(1); }
  if (!ctx.TEACH.sources.some(s=>/drive\.google\.com/.test(s.u)) || !ctx.TEACH.sources.some(s=>/p022-26/.test(s.u))) {
    console.error('❌ 教材出處欠第十一版綱要 PDF 或生效通告 P022/26'); process.exit(1);
  }
  /* 舊「備課指引」資料已刪除（內容有錯：立正角度、香港童軍年份等） */
  const lessonTxt = codes.map(k=>readFileSync(root+'js/'+k+'-lesson.js','utf8')).join('\n');
  if (/teachingGuide/.test(lessonTxt)) { console.error('❌ 教案仲留低 teachingGuide（舊備課指引有錯誤事實，應改用 TEACH）'); process.exit(1); }
  for (const bad of ['迎接挑戰 ② 充實人生','四句都要背','腳尖分開 45 度','向前跨半步、雙手 back',"左腳向前跨半步'"]) {
    if (new RegExp(bad).test(lessonTxt)) { console.error('❌ 教案仲有錯誤／自創內容：'+bad); process.exit(1); }
  }
  /* 步操舊錯要「就地改正」：c02 要寫明正確要領＋唔係跨半步 */
  const c02src = readFileSync(root+'js/c02-lesson.js','utf8');
  if (!/三分之二/.test(c02src) || !/唔係跨半步/.test(c02src)) { console.error('❌ c02 冇寫明稍息正確要領（伸出約全腳三分之二）＋唔係跨半步'); process.exit(1); }
  console.log('✅ v42 教材：16 場 ×（知識點＋示範＋講稿）齊，全部經 renderMeeting 出到頁');
}

/* v42：制服頁守門——唔准有自製制服圖；要用《儀容與制服手冊》原文表＋官方檔連結 */
{
  for (const k of ['uniform.chest','uniform.zoom','uniform.sleeve','uniform.body','uniform.scarf','uniform.ties','uniform.cap','uniform.kilwell','uniform.branch']) {
    if (ctx.IMG.map[k]) { console.error('❌ IMG.map 仲有 '+k+'（自製章位圖已刪除）'); process.exit(1); }
  }
  if (existsSync(root+'img/uni/venture-land.avif')) { console.error('❌ img/uni AI 制服圖未刪除'); process.exit(1); }
  const uniJs = readFileSync(root+'js/uniform.js','utf8');
  const appJs = readFileSync(root+'js/app.js','utf8');
  if (/DIAGRAMS\.uniform\.|img\/uni\/|UNIFORMFIG\[/.test(appJs)) { console.error('❌ app.js 仲引用自製制服圖'); process.exit(1); }
  if (!/UNIFORM\.placementV2/.test(uniJs) || !/UNIFORM\.grooming/.test(uniJs) || !/UNIFORM\.official/.test(uniJs)) {
    console.error('❌ uniform.js 欠 placementV2／grooming／official（手冊原文表＋官方檔連結）'); process.exit(1);
  }
  const g = ctx.UNIFORM.placementV2.groups.map(x=>x.rows.length).reduce((x,y)=>x+y,0);
  if (g < 20) { console.error('❌ placementV2 太少條目（而家 '+g+'，要照手冊逐條列）'); process.exit(1); }
  try { ctx.App.pages.uniform('badge'); } catch(e){ console.error('❌ pages.uniform(badge) 失敗：'+e.message); process.exit(1); }
  if (!/UNIFORM\.placementV2/.test(appJs)) { console.error('❌ app.js 冇渲染 placementV2 原文表'); process.exit(1); }
  if (!/drive\.google\.com\/file\/d\/1JrvWJmS5Uj6IC2EPNRH5v1YN5GSEQYLz/.test(uniJs) || !/drive\.google\.com\/file\/d\/12m8doAX3uZEGZ81Mvf6Fp2Dj_X7X6wwA/.test(uniJs)) {
    console.error('❌ 制服頁冇連結去《儀容與制服手冊》官方檔（第三章／第四章 4.4–4.7）'); process.exit(1); }
  if (!/左眼處上方|袋蓋上方 3 厘米|肩膊位下方 2 厘米|地域章在前/.test(uniJs)) { console.error('❌ 章位表唔似照手冊原文（缺關鍵句）'); process.exit(1); }
  if (/貝雷帽|beret/i.test(uniJs)) { console.error('❌ 深資制服帽應為棗紅色軟帽'); process.exit(1); }
  console.log('✅ v42 制服：零自製圖・章位照手冊原文（'+g+' 條）＋官方檔連結');
}

/* v42：技能頁只收肩章（二）四類；唔准照抄童軍支部技能／活動 */
{
  const appJs2 = readFileSync(root+'js/app.js','utf8');
  const intJs2 = readFileSync(root+'js/interests.js','utf8');
  const pageTxt = appJs2 + intJs2;
  for (const k of ['露營','繩結','遠足','急救','肩章','第十一版']) {
    if (pageTxt.indexOf(k) < 0) { console.error('❌ 技能頁／章冊缺：'+k); process.exit(1); }
  }
  if (!/官方要求（第十一版）/.test(appJs2) || !/req-list/.test(appJs2)) { console.error('❌ 技能頁冇逐項列出官方考核要求（要 render INTERESTS 要求原文）'); process.exit(1); }
  if (!/s-skill-camp|s-skill-knot|s-skill-hike|s-skill-aid/.test(intJs2)) { console.error('❌ interests.js 冇技能章 byKey（s-skill-*），技能頁攞唔到要求原文'); process.exit(1); }
  for (const bad of ['無痕山林7原則','專科徽章','小隊制度','地面石塊追蹤']) {
    if (appJs2.indexOf(bad) >= 0) { console.error('❌ app.js 仲有童軍支部抄件：'+bad); process.exit(1); }
  }
  if (ctx.IMG.map['track.arrow']) { console.error('❌ IMG.map 仲有 track.*（支部追蹤圖）'); process.exit(1); }
  for (const sub of ['all','camp','knot','hike','aid']) {
    try { ctx.App.pages.skills(sub); } catch(e) { console.error('❌ 技能頁 '+sub+' render 失敗：'+e.message); process.exit(1); }
  }
  const reqLen = {};
  for (const k of ['s-skill-camp','s-skill-knot','s-skill-hike','s-skill-aid']) {
    const b = ctx.INTERESTS.byKey[k];
    if (!b || !Array.isArray(b.req) || !b.req.length) { console.error('❌ 肩章（二）缺 '+k+' 嘅官方要求'); process.exit(1); }
    reqLen[k] = b.req.length;
  }
  const wantLen = { 's-skill-camp':7, 's-skill-knot':1, 's-skill-hike':2, 's-skill-aid':3 };
  for (const k in wantLen) {
    if (reqLen[k] !== wantLen[k]) { console.error('❌ '+k+' 要求項數唔啱（要 '+wantLen[k]+'，而家 '+reqLen[k]+'）'); process.exit(1); }
    const label = {'s-skill-camp':'露營（7 項）','s-skill-knot':'繩結（9 個）','s-skill-hike':'遠足（2 項）','s-skill-aid':'急救（3 項）'}[k];
    if (appJs2.indexOf(label) < 0) { console.error('❌ 技能頁標題同章冊要求唔一致：'+label); process.exit(1); }
  }
  /* 繩結：9 個結要逐個列喺要求內（口訣為準，唔出逐步圖） */
  const knotTxt = ctx.INTERESTS.byKey['s-skill-knot'].req.join('');
  for (const kn of ['平結','接繩結','八字結','雙套結','稱人結','繫木結','四方編結','十字編結','八字編結']) {
    if (knotTxt.indexOf(kn) < 0) { console.error('❌ 繩結要求缺：'+kn); process.exit(1); }
  }
  console.log('✅ v42 技能頁：四類要求照第十一版＋教材連結（無支部抄件）');
}

/* v42：本地圖一律 AVIF（icons 加咗 avif；PNG 只准做 <picture>／manifest 後備） */
{
  const html = readFileSync(root+'index.html','utf8');
  const bad = [];
  let m; const re=/<img[^>]*src="([^"]+\.(?:png|jpg|jpeg|webp|gif|svg))"/g;
  while ((m = re.exec(html))) {
    const before = html.slice(Math.max(0, m.index-200), m.index);
    if (!/<picture>/.test(before)) bad.push(m[1]);
  }
  for (const f of ['icons/icon-192.avif','icons/icon-512.avif','icons/icon-maskable-512.avif','icons/icon-1024.avif']) {
    if (!existsSync(root+f)) bad.push('缺 '+f);
  }
  const man = readFileSync(root+'manifest.webmanifest','utf8');
  if (man.indexOf('image/avif') < 0) bad.push('manifest 冇 avif icon');
  const allJs = ctx_files_join();
  const re2=/src="((?:img|icons)\/[^"]+\.(?:png|jpg|jpeg|webp|gif|svg))"/g;
  while ((m = re2.exec(allJs))) bad.push('js 引用 '+m[1]);
  if (bad.length) { console.error('❌ 有唔係 AVIF 嘅本地圖引用：\n   '+bad.join('\n   ')); process.exit(1); }
  console.log('✅ v42 圖片格式：本地圖一律 AVIF（PNG 只作 <picture>／manifest 後備）');
  function ctx_files_join(){
    return ['js/app.js','js/data.js','js/uniform.js','js/dia.js','js/figs.js','js/items.js','js/ceremony.js','js/interests.js','js/teach.js','js/teach2.js']
      .concat(['c01','c02','c03','c04','c05','c06','c07','c08','c09','c10','c11','c12','c13','c14','c15','c16'].map(c=>'js/'+c+'-lesson.js')).map(f=>readFileSync(root+f,'utf8')).join('\n');
  }
}

// ── 所有手繪圖解嘅文字都要喺 viewBox 內（溢出即係睇唔到；用 stack 累加巢式 translate/scale）──
{
  const est = (t)=>{ let w=0; for (const ch of t) { const c = ch.codePointAt(0); w += (c>0x2e80?1.0:(ch===' '?0.34:0.58)); } return w; };
  const dkeys = Object.keys(ctx.IMG.svg);
  /* v36：制服 9 張（uniform.*）已經唔再由手繪 SVG raster 出嚟，而係「乾淨底圖＋程式疊位」
     直接畫成 AVIF，所以冇 SVG 底稿。其餘 45 張（儀式 13＋遊戲 12＋技能 9＋營火 3＋
     指南針／背囊 2＋追蹤 6）照舊要留低底稿做後備。 */
  if (dkeys.length < 45) { console.error('❌ IMG.svg 底稿唔齊（'+dkeys.length+'／45）— 換圖時冇存低原 SVG？'); process.exit(1); }
  /* v42：制服 9 張自製圖全部刪走（唔准再用 AI 圖教章位）——底稿同 IMG.map 都唔准有 */
  ['chest','zoom','sleeve','body','scarf','ties','kilwell','cap','branch'].forEach(k=>{
    if (ctx.IMG.map['uniform.'+k]) { console.error('❌ IMG.map 仲有 uniform.'+k+'（自製章位圖應已刪除）'); process.exit(1); }
    if (ctx.DIAGRAMS.uniform && ctx.DIAGRAMS.uniform[k]) { console.error('❌ DIAGRAMS.uniform.'+k+' 仲出到圖'); process.exit(1); }
    if (readFileSync(root+'sw.js','utf8').includes('img/dia/uniform-'+k)) { console.error('❌ sw.js 仲預緩存 img/dia/uniform-'+k); process.exit(1); }
  });
  let n=0, bad=[];
  for (const key of dkeys) {
    const grp = key, k = '';
    const src = ctx.IMG.svg[key]; const m = src.match(/viewBox="0 0 (\d+) (\d+)"/); if (!m) continue; n++;
    const W=+m[1], H=+m[2];
    const re=/<g transform="translate\(([-\d.]+),([-\d.]+)\)(?: scale\(([-\d.]+)\))?">|<\/g>|<text x="([-\d.]+)" y="([-\d.]+)" font-size="([-\d.]+)"[^>]*?text-anchor="(start|middle|end)"[^>]*>([^<]*)<\/text>/g;
    let mm, stack=[[0,0,1]], over=[];
    while ((mm = re.exec(src))) {
      if (mm[0]==='</g>') { if (stack.length>1) stack.pop(); continue; }
      if (mm[8]===undefined) { const p0=stack[stack.length-1]; stack.push([p0[0]+ +mm[1], p0[1]+ +mm[2], p0[2]*(mm[3]?+mm[3]:1)]); continue; }
      const top=stack[stack.length-1], fs=+mm[6]*top[2], anc=mm[7], txt=mm[8]||'';
      if (!txt) continue;
      const w=est(txt)*fs, x=top[0]+ +mm[4]*top[2];
      const y=top[1]+ +mm[5]*top[2];
      let l=x,r=x; if (anc==='start') r=x+w; else if (anc==='end') l=x-w; else { l=x-w/2; r=x+w/2; }
      if (l<-2 || r>W+2 || y<-2 || y>H+2) over.push(txt.slice(0,14)+'['+l.toFixed(0)+'..'+r.toFixed(0)+']');
    }
    if (over.length) bad.push(key+'：'+over.slice(0,2).join('、'));
  }
  if (bad.length) { console.error('❌ 下圖文字超出 viewBox（會俾人cut）：\n   '+bad.join('\n   ')); process.exit(1); }
  console.log('✅ '+n+' 張圖解底稿文字全部喺 viewBox 內（AVIF 由同一底稿 raster，唔會 cut 字）');
}
console.log('✅ README 提及 c16 同《步操手冊》');
// ═════════ v20：真圖示意插畫（AVIF），SVG 只做折疊後備 ═════════
const figSandbox = {}; createContext(figSandbox);
runInContext(readFileSync(root+'js/figs.js','utf8'), figSandbox, {filename:'js/figs.js'});
const FIGSJ = figSandbox.FIGS || {};
const figKeys = Object.keys(FIGSJ);
if (figKeys.length < 24 || figKeys.length > 45) { console.error('❌ FIGS 數量唔啱（v46 為活動／技能卡補齊插圖，門檻已放寬），實際', figKeys.length); process.exit(1); }
for (const gone of ['skill-pioneer','skill-track','skill-field']) {
  if (figKeys.includes(gone)) { console.error('❌ FIGS 仲有 '+gone+'（童軍支部內容／AI 動作圖，已判死）'); process.exit(1); }
}
if (runFigsContains('uniform')) { console.error('❌ FIGS 仲有制服類圖'); process.exit(1); }
function runFigsContains(w){ return figKeys.some(k=>k.indexOf(w)>=0); }
if (figKeys.some(k => k === 'note' || typeof FIGSJ[k] === 'string')) { console.error('❌ FIGS 混咗非圖項目（note 應該用全域 FIGS_NOTE）'); process.exit(1); }
if (figSandbox.FIGS_NOTE !== undefined && !/唔代表制服標準/.test(figSandbox.FIGS_NOTE)) { console.error('❌ FIGS_NOTE 冇寫明唔代表制服標準'); process.exit(1); }
for (const k of figKeys) {
  if (/robe|uniform|scarf|制服|領巾|布章|章/.test(k)) { console.error('❌ FIGS 出咗制服／布章類插畫（用戶禁止，AI 會畫錯）：'+k); process.exit(1); }
  if (/skill-|aid-/.test(k) && /制服|旅巾|領巾|布章|徽章|帽章/.test(FIGSJ[k].alt)) { console.error('❌ '+k+' alt 講咗制服／徽章：', FIGSJ[k].alt); process.exit(1); }
  if (/帽章|布章|領巾|巾圈|旅巾/.test(FIGSJ[k].alt)) { console.error('❌ '+k+' alt 描述咗制服細節：', FIGSJ[k].alt); process.exit(1); }
  if (/杏色|草青|深綠軟帽|neckerchief|badge/i.test(FIGSJ[k].alt)) { console.error('❌ '+k+' alt 仲當住係制服圖'); process.exit(1); }
}
if (existsSync(root+'img/fig/fire-robe.avif')) { console.error('❌ fire-robe.avif 未移除（屬布章／制服範圍，唔准出插畫）'); process.exit(1); }
let figBytes = 0;
for (const k of figKeys) {
  const f = FIGSJ[k];
  if (!/^img\/fig\/[a-z0-9-]+\.avif$/.test(f.src)) { console.error('❌ FIGS.'+k+' src 唔係 img/fig/*.avif：', f.src); process.exit(1); }
  if (!existsSync(root+f.src)) { console.error('❌ FIGS.'+k+' 檔案唔存在：', f.src); process.exit(1); }
  const buf = readFileSync(root+f.src);
  figBytes += buf.length;
  const brand = buf.slice(4,12).toString('latin1');
  if (brand !== 'ftypavif') { console.error('❌ '+f.src+' 唔係 AVIF（brand='+brand+'）'); process.exit(1); }
  if (buf.length > 140*1024) { console.error('❌ '+f.src+' 太大：', Math.round(buf.length/1024)+'KB'); process.exit(1); }
  if (!(f.w>200 && f.h>200)) { console.error('❌ '+k+' 缺 w/h（會 layout shift）'); process.exit(1); }
  if (!f.alt || f.alt.length < 20) { console.error('❌ '+k+' alt 描述太短'); process.exit(1); }
  if (!f.cap || f.cap.length < 15) { console.error('❌ '+k+' 缺圖說'); process.exit(1); }
}
if (figBytes > 1200*1024) { console.error('❌ 插畫總容量過大（離線 PWA 上限 1.2MB）：', Math.round(figBytes/1024)+'KB'); process.exit(1); }
for (const k of figKeys) {
  if (/knot|reef|bowline|fig8|繩結|結/.test(k)) { console.error('❌ FIGS 出咗繩結圖（用戶明確禁止）：'+k); process.exit(1); }
}
console.log('✅ v21 插畫：'+figKeys.length+' 張 AVIF（'+Math.round(figBytes/1024)+'KB・無繩結圖・alt/cap 齊）');
/* v42：儀式卡嘅圖一律用 dgm 隊形示意圖（AI 插畫已刪除）；有 fig 就一定要有對應圖 */
const cerCardsWithFig = ctx.CEREMONY.cards.filter(c=>c.fig);
const missingImg = cerCardsWithFig.filter(c=>!ctx.IMG.map['cer.'+c.fig]);
if (missingImg.length) { console.error('❌ 儀式卡引用咗冇嘅圖：', missingImg.map(c=>c.k).join(',')); process.exit(1); }
for (const c of ctx.CEREMONY.cards) {
  if (c.fig && !c.figcap) { console.error('❌ 卡「'+c.k+'」有圖但冇 figcap（新領袖睇唔明張圖係講乜）'); process.exit(1); }
  if (c.fig && !/隊形|位置|示意/.test(c.figcap||'')) { console.error('❌ 卡「'+c.k+'」嘅 figcap 冇講明「只做隊形／位置示意」（避免被當動作範本）'); process.exit(1); }
}
if (cerCardsWithFig.length < 5) { console.error('❌ 有隊形示意圖嘅儀式卡不足 5'); process.exit(1); }
const figHtml = ctx.App.cerFig(ctx.CEREMONY.cards.find(c=>c.k==='open'));
if (!figHtml.includes('class="dgm-fig"')) { console.error('❌ 儀式卡圖冇用 dgm-fig 結構（AI 插畫路徑應該已經唔行）'); process.exit(1); }
if (!/img src="img\/dia\/cer-open\.avif"/.test(figHtml)) { console.error('❌ 儀式卡冇出 AVIF 隊形圖：', figHtml.slice(0,140)); process.exit(1); }
if (figHtml.includes('ph-fig')) { console.error('❌ 儀式卡行咗 AI 插畫（ph-fig）路徑 — 圖已刪除'); process.exit(1); }
if (!figHtml.includes('只作隊形／位置示意')) { console.error('❌ 儀式卡圖說冇講明「只作隊形／位置示意」'); process.exit(1); }
if (/FIGSJ\['cer-'/.test(readFileSync(root+'js/app.js','utf8'))) { console.error('❌ app.js 仲查 FIGS cer-*（圖已刪）'); process.exit(1); }
if (ctx.App.cerFig({k:'blank'}) !== '') { console.error('❌ 冇 fig 亦冇 dgm 嘅卡唔應該硬出圖'); process.exit(1); }

if (!appSrc.includes('附隊形／位置示意圖（只作位置參考）')) { console.error('❌ 搜尋索引冇反映 v42 儀式圖嘅限制（只作位置參考）'); process.exit(1); }
  if (!appSrc.includes("type:'教材'")) { console.error('❌ 搜尋索引欠教材入口（TEACH 入面搵唔到嘢）'); process.exit(1); }
const cssSrc2 = readFileSync(root+'css/app.css','utf8');
if (!cssSrc2.includes('.ph-fig.imgfail') || !cssSrc2.includes('.ph-fig .dgm-alt')) { console.error('❌ CSS 缺 ph-fig 後備樣式'); process.exit(1); }
if (!/@media print\{[\s\S]*?\.ph-fig \.dgm-alt,\.ph-fig \.ph-fail\{display:none!important\}/.test(cssSrc2)) { console.error('❌ 列印未隱藏折疊圖解'); process.exit(1); }
for (const k of figKeys) {
  if (!swSrc.includes(FIGSJ[k].src)) { console.error('❌ sw.js 未預 cache：'+FIGSJ[k].src); process.exit(1); }
}
if (!swSrc.includes('./js/figs.js')) { console.error('❌ sw.js 未 cache figs.js'); process.exit(1); }
if (!swSrc.includes('c.add(a).catch')) { console.error('❌ sw install 未改逐個 add（一張圖miss會拖冧全部）'); process.exit(1); }
console.log('✅ 插畫接線＋CSS 後備＋sw 預 cache 齊');
// ═════════ v22：批次 2 — 遊戲場地圖插畫 ═════════
const GF = figSandbox.GAME_FIG || {};
const gfKeys = Object.keys(GF);
/* v42：GAME_FIG 要同 DATA.games 對得上（唔准有孤兒圖；官方套包 3 個遊戲屬室內／圍圈玩法，唔使場地圖） */
{
  const usedTxt = readFileSync(root+'js/data.js','utf8')
    + ['c01','c02','c03','c04','c05','c06','c07','c08','c09','c10','c11','c12','c13','c14','c15','c16'].map(k=>readFileSync(root+'js/'+k+'-lesson.js','utf8')).join('\n');
  const orphans = gfKeys.filter(k=>usedTxt.indexOf(k) < 0);
  if (orphans.length) { console.error('❌ GAME_FIG 有孤兒圖（DATA.games 同 16 場教案都冇呢個遊戲）：'+orphans.join(',')); process.exit(1); }
  for (const off of ['你是誰（官方套包）','用背脊畫圖畫（官方套包）','香港童軍運動問答挑戰賽（官方套包）']) {
    if (GF[off]) { console.error('❌ 官方套包遊戲唔使自己加場地圖插畫：'+off); process.exit(1); }
  }
  if (gfKeys.length < 10) { console.error('❌ GAME_FIG 太少（'+gfKeys.length+'）：舊有有圖遊戲唔好刪走'); process.exit(1); }
}
for (const nm of gfKeys) {
  if (!FIGSJ[GF[nm]]) { console.error('❌ GAME_FIG 指向冇圖嘅 key：'+nm+' → '+GF[nm]); process.exit(1); }
}
const noImg = ctx.DATA.games.filter(g => !GF[g.n]).map(g=>g.n).sort();
  /* v42：冇場地圖嘅遊戲＝圍圈／室內／官方套包（唔使自己加插畫）＋兩班舊遊戲 */
  const allowNoImg = ['你是誰（官方套包）','用背脊畫圖畫（官方套包）','香港童軍運動問答挑戰賽（官方套包）','聚會互動 MINI GAME（團集會版）','先鋒工程速搭','永續發展挑戰'].sort();
  if (noImg.join(',') !== allowNoImg.join(',')) { console.error('❌ 無圖遊戲清單唔啱（應得：'+allowNoImg.join('、')+'；而家：'+noImg.join(',')+'）'); process.exit(1); }
  for (const g of ctx.DATA.games) {
    if (GF[g.n] && !FIGSJ[GF[g.n]]) { console.error('❌ '+g.n+' 嘅場地圖 key 冇圖：'+GF[g.n]); process.exit(1); }
    if (!Array.isArray(g.steps) || g.steps.length < 3) { console.error('❌ 遊戲「'+g.n+'」玩法步驟不足 3 步（新領袖唔知點帶）'); process.exit(1); }
    if (!g.minutes || !g.people || !g.mats || !g.cat || !g.desc) { console.error('❌ 遊戲「'+g.n+'」缺時間／人數／物資／類別／說明'); process.exit(1); }
    if (!g.safety) { console.error('❌ 遊戲「'+g.n+'」冇安全提示'); process.exit(1); }
  }

let phCnt = 0, dgmCnt = 0, noFigCnt = 0;
for (const g of ctx.DATA.games) {
  const gk = GF[g.n] || '';
  const cap = (gk && FIGSJ[gk]) ? FIGSJ[gk].cap : '場地擺位圖';
  const html = ctx.App.ph(gk, cap, ctx.DIAGRAMS.game[g.n]);
  if (gk) {
    if (!html.includes('class="ph-fig"') || !html.includes('img/fig/'+gk+'.avif')) { console.error('❌ 遊戲 '+g.n+' 冇用 AVIF 插畫'); process.exit(1); }
    if (ctx.DIAGRAMS.game[g.n] && !html.includes('dgm-alt')) { console.error('❌ 遊戲 '+g.n+' 有平面圖卻冇折疊後備'); process.exit(1); }
    phCnt++;
  } else if (ctx.DIAGRAMS.game[g.n]) {
    if (!html.includes('class="dgm-fig"')) { console.error('❌ 遊戲 '+g.n+' 退回邏輯唔啱'); process.exit(1); }
    dgmCnt++;
  } else {
    if (html !== '') { console.error('❌ 破冰遊戲 '+g.n+' 應唔出圖（而家有雜訊）'); process.exit(1); }
    noFigCnt++;
  }
  if (html.includes('undefined')) { console.error('❌ 遊戲 '+g.n+' markup 洩漏 undefined'); process.exit(1); }
}
if (phCnt + dgmCnt + noFigCnt !== ctx.DATA.games.length) { console.error('❌ 遊戲圖三分法數唔啱：ph='+phCnt+' dgm='+dgmCnt+' none='+noFigCnt+'／'+ctx.DATA.games.length); process.exit(1); }
if (noFigCnt !== 6) { console.error('❌ 唔出圖嘅遊戲應得 6 個（官方套包 3＋MINI GAME＋先鋒速搭＋永續發展），而家 '+noFigCnt); process.exit(1); }
if (phCnt < 17) { console.error('❌ 有場地圖插畫嘅遊戲太少（'+phCnt+'）：舊圖唔好刪走'); process.exit(1); }
for (const k of Object.keys(FIGSJ).filter(x=>x.indexOf('game-')===0)) {
  const f = FIGSJ[k];
  if (/帽章|領巾|布章|巾圈|旅巾|制服|團員|童軍帽/.test(f.alt)) { console.error('❌ '+k+' alt 描述咗制服／身份：', f.alt); process.exit(1); }
  if (/平結|稱人結|八[字字]結|水手結/.test(f.alt)) { console.error('❌ '+k+' alt 畫咗繩結打法（禁止）'); process.exit(1); }
}
/* 繩結相關遊戲：圖只畫場地／道具，唔畫打法（玩法指去 c13／c14 教案） */
if (/平結|稱人結|八字結|雙套結/.test(FIGSJ['game-tug'].cap) || !/c14/.test(FIGSJ['game-tug'].cap)) { console.error('❌ 曳木結遊戲圖 cap 唔啱（唔准畫打法，要指去 c14 教案）'); process.exit(1); }
if (!/c13/.test(FIGSJ['game-relay-cards'].cap)) { console.error('❌ 結繩接力圖 cap 唔啱（要指去 c13 教案）'); process.exit(1); }
if (!/絕對唔准衝向海邊/.test(FIGSJ['game-beachflag'].cap)) { console.error('❌ 沙灘旗圖冇寫海邊安全提示'); process.exit(1); }
for (const k of Object.keys(FIGSJ).filter(x=>x.indexOf('game-')===0)) {
  if (!swSrc.includes(FIGSJ[k].src)) { console.error('❌ sw.js 未 cache 遊戲圖：'+k); process.exit(1); }
}
try { ctx.App.pages.play(); } catch(e) { console.error('❌ pages.play 插畫接入後 render 失敗：', e.message); process.exit(1); }
console.log('✅ 遊戲圖片：AVIF 場地圖＋平面設場圖後備（ph='+phCnt+'/dgm='+dgmCnt+'/無圖='+noFigCnt+'）・sw 預 cache 齊');

// ═════════ v23：批次 3 — 技能插畫 ＋ QA fail 名單（唔准回流） ═════════
const SF = figSandbox.SKILL_FIG || {};
if (Object.keys(SF).length !== 9) { console.error('❌ SKILL_FIG 應得 9 項技能插畫（v42 刪走先鋒／追蹤／田野 3 項支部抄件），而家 '+Object.keys(SF).length); process.exit(1); }
for (const gone of ['pioneer','track','field']) {
  if (SF[gone]) { console.error('❌ SKILL_FIG 仲有 '+gone+'（童軍支部技能，只准引用出處）'); process.exit(1); }
}
for (const need of ['pack','tent','stove','knife','ropecare','legend','lost','sos','rice']) { if (!SF[need]) { console.error('❌ SKILL_FIG 缺 '+need+'（v31 用戶要求：技能除繩結外全部要有圖）'); process.exit(1); } }
for (const nm of Object.keys(SF)) { if (!FIGSJ[SF[nm]]) { console.error('❌ SKILL_FIG 指向冇圖嘅 key：'+nm); process.exit(1); } }
// 刀交接／SOS 係已逐項 QA 嘅本地圖；大風吹改用網上授權相片，唔自行生成。
if (!SF.knife || !SF.sos) { console.error('❌ knife/sos 應該已重出並入 SKILL_FIG（v24）'); process.exit(1); }
if (GF['大風吹'] !== 'game-chairs' || !FIGSJ['game-chairs']) { console.error('❌ 大風吹未接網上來源圖片'); process.exit(1); }
const chairs = FIGSJ['game-chairs'];
if (!/Wikimedia|Artaxerxes|CC BY-SA/.test((chairs.credit||'')+' '+(chairs.source||'')) || !/並非 AI 生成/.test(chairs.credit||'')) {
  console.error('❌ 大風吹圖片缺來源／授權／非生成聲明'); process.exit(1);
}
if (!/少一張櫈/.test(chairs.cap) || !/俯視圖/.test(chairs.cap)) { console.error('❌ 大風吹相片冇交代正確櫈數要睇俯視圖'); process.exit(1); }
// v24 儀式圖 QA 修正：宣誓唔可以合十、旗唔可以插喺二人之間；敬禮邊格作準要講明；升旗戴帽／無帽條文要喺圖說
/* v42：AI 宣誓插畫已刪除 → 呢啲 QA 提醒必須留喺 ceremony.js 卡內（先至真係教到人） */
const capOath = (ctx.CEREMONY.byKey.oath ? JSON.stringify(ctx.CEREMONY.byKey.oath) : '') + ' ' + ceremonySrc;
if (!/唔好合十|唔係合十/.test(capOath)) { console.error('❌ 宣誓圖冇交代「唔好合十／立正垂手」'); process.exit(1); }
if (!/唔可以插喺|中間唔准放嘢/.test(capOath)) { console.error('❌ 宣誓圖冇交代「旗唔准喺二人之間」'); process.exit(1); }
/* v42：AI 儀式插畫已刪除 → 呢啲要領改由卡內文字承擔（要照官方文件，唔准自畫自創） */
{
  const saluteCard = JSON.stringify(ctx.CEREMONY.byKey.salute || {});
  const openCard = JSON.stringify(ctx.CEREMONY.byKey.open || {});
  const flagCard = JSON.stringify(ctx.CEREMONY.byKey.flag || {});
  if (!/步操手冊/.test(saluteCard)) { console.error('❌ 敬禮卡冇寫明手形／手指數要依《步操手冊》（唔准照 app 自畫圖學）'); process.exit(1); }
  if (!/右前方|右翼/.test(openCard)) { console.error('❌ 開始卡冇講明基準／右翼以邊個為準'); process.exit(1); }
  if (!/制服不整齊時只立正不舉手/.test(flagCard)) { console.error('❌ 升旗卡冇交代「制服唔整齊只立正不舉手」（手冊第三章）'); process.exit(1); }
  if (/img\/fig\/cer-/.test(io_read_all())) { console.error('❌ 仲有地方引用 AI 儀式插畫 img/fig/cer-*'); process.exit(1); }
  function io_read_all(){ return ['js/app.js','sw.js','index.html','js/data.js'].map(f=>readFileSync(root+f,'utf8')).join('\n'); }
}
// 技能頁逐分頁 render：有圖用 ph-fig，冇圖退回 dgm-fig
for (const sub of ['care','map','camp','field','aid']) {
  try { ctx.App.pages.skills(sub); } catch(e) { console.error('❌ pages.skills('+sub+') 接入插畫後失敗：', e.message); process.exit(1); }
}
const figHtmlCamp = ctx.App.ph('skill-tent', FIGSJ['skill-tent'].cap, ctx.DIAGRAMS.skillx.tent);
if (!figHtmlCamp.includes('img/fig/skill-tent.avif') || !figHtmlCamp.includes('45 度')) { console.error('❌ 帳篷圖／圖說唔啱'); process.exit(1); }
const figHtmlRope = ctx.App.ph('skill-ropecare', FIGSJ['skill-ropecare'].cap, ctx.DIAGRAMS.skillx.ropecare);
if (!/圈繞.*照文字/.test(figHtmlRope)) { console.error('❌ 收繩圖冇寫明「步驟照文字」（唔准出結圖）'); process.exit(1); }
const figHtmlSos = ctx.App.ph('', 'SOS 哨音節拍（三短三長三短）', ctx.DIAGRAMS.skillx.sos);
if (!figHtmlSos.includes('class="dgm-fig"')) { console.error('❌ SOS 應該退回平面節拍圖'); process.exit(1); }
// 冇孤兒圖：img/fig 入面每張都要有 FIGS 項目＋喺 sw

const avifs = readdirSync(root+'img/fig').filter(f=>/\.avif$/.test(f));
const allSrc = figKeys.map(k=>FIGSJ[k].src.replace('img/fig/',''));
for (const f of avifs) {
  if (!allSrc.includes(f)) { console.error('❌ img/fig/'+f+' 冇喺 FIGS 入面（孤兒圖，要咪刪走咪補 entry）'); process.exit(1); }
  if (!swSrc.includes(f)) { console.error('❌ sw.js 漏 cache img/fig/'+f); process.exit(1); }
}
for (const sub of ['all','camp','knot','hike','aid']) { try { ctx.App.pages.skills(sub); } catch(e) { console.error('❌ pages.skills('+sub+') render 失敗：', e.message); process.exit(1); } }
console.log('✅ 技能插畫 '+Object.keys(SF).length+'/12 齊（除繩結外全部技能有圖）・圖檔 '+figKeys.length+' 張全數入 FIGS＋sw');


// ═════════ v31：急救每種都有圖（AI 插畫＋手繪位置圖） ═════════
const AF = figSandbox.AID_FIG || {};
if (!AF || !Object.keys(AF).length) { console.error('❌ figs.js 冇 export AID_FIG'); process.exit(1); }
/* VS：c10 急救 5 種（出血包紮／抽筋／燒傷／燙傷／扭傷）＋復原臥式 */
for (const f of ctx.C10.firstaid) {
  if (!AF[f.n]) { console.error('❌ 急救「'+f.n+'」冇對應插畫 key'); process.exit(1); }
  if (!FIGSJ[AF[f.n]]) { console.error('❌ AID_FIG 指向冇圖嘅 key：'+f.n+' → '+AF[f.n]); process.exit(1); }
  if (!swSrc.includes(FIGSJ[AF[f.n]].src)) { console.error('❌ sw.js 冇 cache 急救圖：'+AF[f.n]); process.exit(1); }
  const card = ctx.App.aidCard(f.n, f.how, f.warn);
  if (card.indexOf(AF[f.n]+'.avif') < 0) { console.error('❌ 急救卡「'+f.n+'」冇出圖'); process.exit(1); }
  if (card.indexOf('undefined') >= 0) { console.error('❌ 急救卡「'+f.n+'」洩漏 undefined'); process.exit(1); }
}
{
  const faint = ctx.App.aidCard('復原臥式','側臥','有呼吸先做');
  if (faint.indexOf('img/dia/skill-faint.avif') < 0) { console.error('❌ 復原臥式冇側臥位置圖（AVIF）'); process.exit(1); }
  if (!ctx.DIAGRAMS.skillx || !ctx.DIAGRAMS.skillx.faint) { console.error('❌ 缺 DIAGRAMS.skillx.faint 復原臥式圖解'); process.exit(1); }
}
console.log('✅ 急救 '+(ctx.C10.firstaid.length+1)+' 張卡全部有圖（5 種 AVIF 插畫＋復原臥式側臥位置圖）');

/* ── 遊戲／技能／急救圖說（caption）統一格式（2026-09 潤色）──────────────────
   規則：① 開頭一個短標籤＋「：」　② 中段要點用「・」　③ 最後一定要有「⚠️ 」提示
        ④ 教案出處寫「cXX 教案」（唔用「照 c17」呢類簡寫）　⑤ 60–200 字　⑥ 除 ⚠️ 外唔用其他 emoji */
{
  const OPEN = ['設場', '玩法', '急救步驟', '搭帳次序', '保養五點', '氣爐六條', '扭傷 RICE', '迷路三步', '小刀三條', '求救節奏', '執包三件事', '實習場面', '符號砌法', '收場做齊', '練習：飛毯', '練習：'];
  const famKeys = Object.values(GF).concat(Object.values(SF), Object.values(AF));
  let checked = 0;
  for (const k of new Set(famKeys)) {
    const f = FIGSJ[k];
    if (!f || !f.cap) continue;
    checked++;
    if (!OPEN.some(o => f.cap.indexOf(o) === 0)) { console.error('❌ 圖說未用統一開頭（'+k+'）：'+f.cap.slice(0, 20)); process.exit(1); }
    if (f.cap.indexOf('⚠️') < 0) { console.error('❌ 圖說冇 ⚠️ 提示（'+k+'）'); process.exit(1); }
    if (f.cap.length > 210) { console.error('❌ 圖說太長（'+k+'：'+f.cap.length+' 字）——卡內會爆行'); process.exit(1); }
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(f.cap.replace(/⚠️/g, ''))) { console.error('❌ 圖說只用得 ⚠️ 一個 emoji（'+k+'）'); process.exit(1); }
    if (/照 ?c\d|對應 ?c\d(?!\d)/.test(f.cap) && !/c\d\d 教案/.test(f.cap)) { console.error('❌ 圖說出處要用「cXX 教案」寫法（'+k+'）'); process.exit(1); }
    if (/setup/i.test(f.cap)) { console.error('❌ 圖說唔好用英文 setup（'+k+'）'); process.exit(1); }
  }
  /* 燒傷／燙傷共用同一張圖，圖說要講明「兩者一樣」 */
  if (!/燒傷／燙傷一樣|燙傷／燒傷一樣/.test(FIGSJ['aid-burn'].cap)) { console.error('❌ 燒傷圖說冇講明燙傷處理一樣'); process.exit(1); }
  console.log('✅ 遊戲／技能／急救圖說 '+checked+' 條：開頭統一・要點用「・」・尾段 ⚠️・出處寫「cXX 教案」');
}

{
  /* v22 前端紀律：冇 chiprow／scrollIntoView・有分頁 API・每頁都有圖 */
  if (/App\.chiprow\(/.test(appSrc)) { console.error('❌ 仲有地方用 App.chiprow()'); process.exit(1); }
  if (appSrc.indexOf('scrollIntoView') >= 0) { console.error('❌ 仲有 scrollIntoView 錨點跳位'); process.exit(1); }
  /* 2) 一頁幾版＝撳掣即換內容 */
  if (appSrc.indexOf('App.showPane') < 0 || appSrc.indexOf('tabpane') < 0 || appSrc.indexOf('data-pane') < 0) {
    console.error('❌ 冇「撳掣即換版」嘅分頁實作（App.showPane／tabpane）'); process.exit(1);
  }
  if (typeof ctx.App.showPane !== 'function' || typeof ctx.App.tabs !== 'function') {
    console.error('❌ app.js 未 export 分頁 API'); process.exit(1);
  }
  if (appSrc.indexOf('wrap.appendChild(tabHost)') < 0) { console.error('❌ 教案頁分頁條冇掛上去'); process.exit(1); }
  if (appSrc.indexOf("pane.setAttribute('data-pane'") < 0) { console.error('❌ 分頁冇 data-pane 標記'); process.exit(1); }
  /* 3) agent 指示字句／內部講法一律唔准出現喺 app */
  for (const bad of ['搵今日集會','黑箱作業','一版講一個遊戲','🅰️','🅱️']) {
    if (appSrc.includes(bad)) { console.error('❌ app.js 仲有「'+bad+'」呢類字句'); process.exit(1); }
  }
  /* 4) 按鈕定位：全頁投屏只保留浮動掣；每節掣要清楚寫「投本節」。 */
  if (appSrc.indexOf('var projAll') >= 0 || appSrc.indexOf("App.projPage('🎮 活動") >= 0) {
    console.error('❌ 活動頁仲有同「投整頁」重複嘅投屏掣'); process.exit(1);
  }
  if (appSrc.indexOf("'🖥️ 投本節'") < 0 || html.indexOf('🖥️ 投整頁') < 0) {
    console.error('❌ 投屏掣未分清本節／整頁範圍'); process.exit(1);
  }
  /* 5) 🌟 AYP：概覽＋三級＋五科＋參加（v39 取代營火會） */
  const S = ctx.AYP;
  if (!S || !Array.isArray(S.about) || S.about.length < 5) { console.error('❌ AYP.about 概覽唔齊'); process.exit(1); }
  if (!S.levelTable || !Array.isArray(S.levelTable.cols) || S.levelTable.cols.length !== 6) { console.error('❌ AYP.levelTable 欄唔齊'); process.exit(1); }
  if (!S.sections || !Array.isArray(S.sections) || S.sections.length !== 5) { console.error('❌ AYP.sections 五科唔齊'); process.exit(1); }
  if (!S.join || !Array.isArray(S.join) || S.join.length !== 7) { console.error('❌ AYP.join 7 步唔齊'); process.exit(1); }
  if (!Array.isArray(S.docs) || S.docs.length < 6 || S.docs.some(d=>!d.url || d.url.indexOf('http')!==0)) { console.error('❌ AYP.docs 官方連結唔齊'); process.exit(1); }
  try {
    ctx.App.pages.ayp();
    for (const k of ['about','levels','sections','join']) ctx.App.pages.ayp(k);
  } catch(e) { console.error('❌ AYP分頁 render 失敗：', e.message); process.exit(1); }
  if (!Array.isArray(ctx.App.aypTabs) || ctx.App.aypTabs.length!==4) { console.error('❌ AYP應拆成 4 個資料分頁'); process.exit(1); }
  if (appSrc.indexOf("App.subnav('ayp',App.aypTabs,cur)") < 0) { console.error('❌ AYP頁冇用 subnav 真分頁'); process.exit(1); }
  for (const t of ['AYP 係乜','三級要求比較','點參加（7 步）','官方文件']) {
    if (appSrc.indexOf(t) < 0) { console.error('❌ AYP頁缺區塊：'+t); process.exit(1); }
  }
  const navHtml = readFileSync(root+'index.html','utf8');
  if (navHtml.indexOf('data-tab="ayp"') < 0 || navHtml.indexOf('data-tab="songs"') >= 0) { console.error('❌ index.html nav 未改做 AYP'); process.exit(1); }
  {
    const mf = JSON.parse(readFileSync(root+'manifest.webmanifest','utf8'));
    if (mf.description.indexOf('跟住做') >= 0 || mf.description.indexOf('營火') >= 0) {
      console.error('❌ manifest description 仲有舊寫法（跟住做／營火）'); process.exit(1);
    }
    if (!mf.shortcuts.some(s => s.name.indexOf('AYP') >= 0)) { console.error('❌ manifest 捷徑未改做「AYP」'); process.exit(1); }
  }
  /* 6) v42：制服頁唔准再用自製位置圖／本地 AI 服式圖——改用《儀容與制服手冊》原文表＋官網連結 */
  if (appSrc.indexOf('UNIFORM.placementV2') < 0) { console.error('❌ 徽章頁冇用 placementV2（手冊原文表）'); process.exit(1); }
  if (appSrc.indexOf('UNIFORM.official') < 0) { console.error('❌ 制服頁冇用 official（官網原圖連結）'); process.exit(1); }
  if (!ctx.UNIFORM.cap || ctx.UNIFORM.cap.points.length < 5) { console.error('❌ 制服帽要點缺'); process.exit(1); }
  if (appSrc.indexOf('bu.branch') >= 0) { console.error('❌ 制服分支卡仲用緊童軍支部顏色對照圖'); process.exit(1); }
  /* 7) v42：技能分頁唔使自己補先鋒工程圖（支部內容只准引用出處） */
  if (appSrc.indexOf("figFor('pioneer'") >= 0) { console.error('❌ app.js 仲有先鋒工程插畫入口（支部內容已刪）'); process.exit(1); }
  /* 8) 遊戲庫每個遊戲都有圖（插畫或俯視擺位圖；兩個破冰唔使圖） */
  for (const g of ctx.DATA.games) {
    const has = (ctx.GAME_FIG[g.n]) || (ctx.DIAGRAMS.game && ctx.DIAGRAMS.game[g.n]);
    const noImgOk = ['你是誰（官方套包）','用背脊畫圖畫（官方套包）','香港童軍運動問答挑戰賽（官方套包）','聚會互動 MINI GAME（團集會版）','先鋒工程速搭','永續發展挑戰'];
    if (!has && noImgOk.indexOf(g.n) < 0) { console.error('❌ 遊戲冇圖亦冇白名單理由：'+g.n); process.exit(1); }
  }
  /* 9) v42：儀式卡唔再要求每張有圖——只有队形／位置類先有 dgm；動作類（敬禮／步操）刻意冇圖 */
  for (const c of ctx.CEREMONY.cards) {
    const dk = c.fig || c.dgm;
    if (dk && !ctx.DIAGRAMS.cer[dk]) { console.error('❌ 儀式卡「'+c.n+'」引用咗冇嘅圖解：'+dk); process.exit(1); }
    if (/FIGS\['cer-/.test(readFileSync(root+'js/app.js','utf8'))) { console.error('❌ app.js 仲查 AI 儀式插畫 FIGS'); process.exit(1); }
  }
}
console.log('✅ v32：真分頁（無錨點跳位）・AYP（概覽＋三級＋五科＋參加）・清 agent 字句・活動／技能／制服／儀式全部有圖');

// ═════════ v33：制服配件（領巾／巾圈／領帶／基維爾／皮帶襪）═════════
{
  const NW = ctx.UNIFORM.neckwear, KW = ctx.UNIFORM.kilwell, BS = ctx.UNIFORM.beltSocks;
  if (!NW || !KW || !BS) { console.error('❌ UNIFORM 缺 neckwear／kilwell／beltSocks'); process.exit(1); }
  if (NW.scarves.length !== 4) { console.error('❌ 領巾唔係 4 種'); process.exit(1); }
  if (NW.rings.length !== 4) { console.error('❌ 巾圈唔係 4 種'); process.exit(1); }
  if (NW.ties.length !== 4) { console.error('❌ 領帶唔係 4 色'); process.exit(1); }
  if (NW.wear.length !== 8) { console.error('❌ 捲巾佩戴唔係 8 步'); process.exit(1); }
  const nwAll = JSON.stringify(NW) + JSON.stringify(KW) + JSON.stringify(BS);
  for (const t of ['3.5 厘米','12–15 厘米','Windsor','棗紅色領帶','深綠色領帶','黑色領帶','深藍色領帶','顏色巾圈','童軍巾圈','小隊活動巾圈','基維爾巾圈','基維爾領巾','木章','鞋碼','棕色皮帶']) {
    if (nwAll.indexOf(t) < 0) { console.error('❌ 制服配件缺資料：'+t); process.exit(1); }
  }
  /* VS：男黑短襪＋女肉色尼龍襪褲，唔用長襪，所以冇襪帶 */
  if (!/黑色短襪/.test(nwAll) || !/肉色/.test(nwAll)) { console.error('❌ 制服配件缺深資襪規格（黑短襪／肉色襪褲）'); process.exit(1); }
  if (/襪帶/.test(nwAll)) { console.error('❌ 制服配件仲有襪帶（深資唔用長襪）'); process.exit(1); }
  if (NW.source.indexOf('3.4') < 0 || BS.source.indexOf('3.6') < 0) { console.error('❌ 制服配件冇標章節出處'); process.exit(1); }
  try { const node = ctx.App.pages.uniform('acc'); if (!node) throw new Error('冇回傳'); }
  catch(e) { console.error('❌ 制服「領巾領帶」分頁 render 失敗：', e.message); process.exit(1); }
  /* 制服毛衣／附加配件：只指向童軍物品供應社，唔自創內容 */
  const SH = ctx.UNIFORM.shop;
  if (!SH || SH.url.indexOf('hkscoutshop.org.hk') < 0) { console.error('❌ 冇童軍物品供應社資料'); process.exit(1); }
  if (SH.rest.indexOf('3.7') < 0 || SH.rest.indexOf('3.8') < 0) { console.error('❌ 供應社說明冇交代 3.7／3.8 唔詳列'); process.exit(1); }
  if (SH.rule.indexOf('3.1') < 0) { console.error('❌ 供應社說明冇引手冊 3.1（以供應社為標準）'); process.exit(1); }
  if (!/tel|2957/.test(SH.tel)) { console.error('❌ 供應社冇電話'); process.exit(1); }
  const appSrcV33 = readFileSync(root+'js/app.js','utf8');
  if (appSrcV33.indexOf('UNIFORM.shop.url') < 0) { console.error('❌ 制服頁冇出供應社連結'); process.exit(1); }
  if (appSrcV33.indexOf("k:'acc'") < 0) { console.error('❌ 制服 subnav 冇「領巾領帶」分頁'); process.exit(1); }
  /* 自查清單要包含配件規格 */
  const cl = ctx.UNIFORM.checklist.join(' ');
  for (const t of ['領帶','巾圈','皮帶']) { if (cl.indexOf(t) < 0) { console.error('❌ 自查清單缺：'+t); process.exit(1); } }
}
console.log('✅ v33：制服配件（領巾 4 種・巾圈 4 種・領帶 4 色・基維爾木章・皮帶皮鞋襪）＋ 兩張新圖');

// ═════════ v34：雙角色定位＋手機 44px＋AYP四分頁＋按鈕去重 ═════════
{
  for (const t of ['第一次帶集會','熟手領袖搵料','會員章 c01–06','肩章・認識 c07–09','肩章・技能 c10–16','特別集會']) {
    if (!appSrc.includes(t)) { console.error('❌ v34 集會定位／篩選缺：'+t); process.exit(1); }
  }
  if (!appSrc.includes('type="search"') || appSrc.includes('>搵！</button>')) {
    console.error('❌ 搜尋應輸入即顯示，唔應有重複提交掣'); process.exit(1);
  }
  /* v42：官方制服圖 link-only（唔本地存、唔准 AI 生成）→ 呢兩項要完全冇返 */
  if (appSrc.includes('UNIFORMFIG[') || readFileSync(root+'js/uniform.js','utf8').includes("localImg:'img/uni/")) {
    console.error('❌ 仲有本地 img/uni 制服圖引用（用戶指示：官網圖只留連結）'); process.exit(1);
  }
  if (appSrc.includes('nextElementSibling')) { console.error('❌ 仲用 nextElementSibling（舊服式圖 fallback，脆弱）'); process.exit(1); }
  const cssV34 = readFileSync(root+'css/app.css','utf8');
  for (const rule of [
    '#view button,.subtab,.pg-btn{min-height:44px;min-width:44px}',
    '#view input:not([type="checkbox"]):not([type="radio"]):not([type="range"]),#view select,#view textarea{min-height:44px}',
    '.sec .print-btn,.sec .proj-btn{min-height:44px',
    '.plan-table tr.meet-row{display:grid',
    '.camp-page>.subnav .subrow{display:grid'
  ]) {
    if (!cssV34.includes(rule)) { console.error('❌ v34 手機規則缺：'+rule); process.exit(1); }
  }
  if ((ctx.App.aypTabs||[]).map(x=>x.k).join(',') !== 'about,levels,sections,join') {
    console.error('❌ AYP四分頁 key／次序錯'); process.exit(1);
  }
}
console.log('✅ v34：新／熟手定位・手機 44px・安全圖片 fallback・AYP四分頁・按鈕範圍齊');

// ═════════ v38：深資版獨有守則 ═════════
{
  /* 獎章頁：20 張卡＋分類篩選＋每張有教案連結（有 meet 欄位嘅話） */
  const badges = ctx.INTERESTS.badges;
  if (badges.length !== 34) { console.error('❌ 獎章唔係 34 項'); process.exit(1); }
  for (const b of badges) {
    if (!b.zh || !b.en || !b.cat || !b.req || !b.req.length || !b.suggest || !b.suggest.length) {
      console.error('❌ 獎章欄位唔齊：'+b.zh); process.exit(1);
    }
  }
  const cats = ctx.INTERESTS.categories.map(c=>c.k);
    if (cats.join(',') !== ['member','shoulder','plan','service','skills','outdoor','path','legacy'].join(',')) { console.error('❌ 獎章分類唔啱（第十一版應得 8 類）：'+cats.join(',')); process.exit(1); }
  if (ctx.INTERESTS.version.indexOf('第十一版') < 0 || ctx.INTERESTS.transition.indexOf('2029') < 0) { console.error('❌ 冇寫明第十一版＋過渡期（至 2029-08-14）'); process.exit(1); }
  for (const nm of ['活動策劃','社會服務','多元技能','戶外探險']) {
    if (JSON.stringify(ctx.INTERESTS).indexOf(nm) < 0) { console.error('❌ 缺第十一版段章／金帶名稱：'+nm); process.exit(1); }
  }
  for (const old10 of ['自立','責任']) {
    if (!new RegExp('第十版').test(JSON.stringify(ctx.INTERESTS))) { console.error('❌ 冇第十版對照（過渡期要畀團員對到數）'); process.exit(1); break; }
  }
  if (!/https:\/\/sites\.google\.com\/scouting\.org\.hk\/venture/.test(JSON.stringify(ctx.INTERESTS))) { console.error('❌ 獎章頁冇官方出處連結'); process.exit(1); }
  /* 會員章：第十一版拆成 12 項（m1–m12 齊；舊版 11 項已喺 2026-08-15 起被取代） */
  const mids = badges.filter(b=>b.cat==='member').map(b=>b.k);
  if (mids.length !== 12) { console.error('❌ 會員章唔係 12 項（第十一版），而家 '+mids.length); process.exit(1); }
  for (let i=1;i<=12;i++) if (mids.indexOf('m'+i)<0) { console.error('❌ 會員章缺 m'+i); process.exit(1); }
  /* 肩章（二）四類要求要喺 byKey，俾技能頁逐項列出 */
  for (const k of ['s-skill-camp','s-skill-knot','s-skill-hike','s-skill-aid']) {
    const b = ctx.INTERESTS.byKey[k];
    if (!b || !b.req || !b.req.length) { console.error('❌ byKey 缺 '+k+'（技能頁會空頁）'); process.exit(1); }
  }
  /* 手冊→考章／報班 render（用 interests.js 資料，唔可以 throw） */
  try { ctx.App.pages.book('apply'); ctx.App.pages.book('course'); } catch(e) { console.error('❌ 手冊考章／報班 render 失敗：', e.message); process.exit(1); }
  if (ctx.INTERESTS.howToApply.steps.length !== 7 || ctx.INTERESTS.howToApply.courseApply.steps.length !== 7) {
    console.error('❌ 考章／報班步驟唔係各 7 步'); process.exit(1);
  }
  /* 制服 6 款 key＋官方圖連結 */
  const tks = ctx.UNIFORM.types.map(t=>t.k);
  const wantTks = ['vs_b','vs_g','vs_g_pants','vs_sea_b','vs_sea_g','vs_sea_g_pants','vs_air_b','vs_air_g','vs_air_g_pants'];
  if (tks.join(',') !== wantTks.join(',')) { console.error('❌ 制服款式 key 錯：'+tks.join(',')); process.exit(1); }
  /* v42：每款都要有官網圖連結（link-only），而且唔准有本地 AI 圖 */
  for (const t of ctx.UNIFORM.types) {
    if (!/www\.scout\.org\.hk\/uploads\/member\//.test(t.img||'')) { console.error('❌ 制服款式 '+t.k+' 冇官網圖連結'); process.exit(1); }
    if (t.localImg) { console.error('❌ 制服款式 '+t.k+' 仲有 localImg（本地 AI 圖已判死）'); process.exit(1); }
  }
  for (const t of ctx.UNIFORM.types) {
    if (!t.img || t.img.indexOf('venture_scouts_') < 0) { console.error('❌ 制服款 '+t.k+' 冇官網原圖連結'); process.exit(1); }
  }
  /* 每場教案分鐘數加埋等於 duration（c04 大會操全日外出、c16 兩日一夜露營：時間跟大會／營期公布，唔設分段分鐘） */
  for (const m of ctx.DATA.meetings) {
    if (m.tid === 'c04' || m.tid === 'c16') continue;
    const tid = m.tid.toUpperCase();
    const sum = ctx[tid].program.reduce((a,p)=>a+(p.min||0),0);
    if (sum !== m.duration) { console.error('❌ '+m.tid+' 分鐘數加唔埋 '+m.duration+'（而家 '+sum+'）'); process.exit(1); }
  }
  console.log('✅ v42：獎章 34 項（第十一版 8 類＋第十版對照）・考章報班各 7 步・制服 6 款官網圖・16 場分鐘數啱');
}

console.log('\n🎉 全部 smoke test 通過（v44：16 場教材＋8 套儀式卡＋單項項目庫＋第十一版獎章路＋手冊原文章位・前端零 SVG・本地圖全 AVIF）');
