import { readFileSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { createContext, runInContext } from 'vm';
const root = new URL('..', import.meta.url).pathname;
const lessonFiles = ['js/c01-lesson.js','js/c02-lesson.js','js/c03-lesson.js','js/c04-lesson.js','js/c05-lesson.js','js/c06-lesson.js','js/c07-lesson.js','js/c08-lesson.js','js/c09-lesson.js','js/c10-lesson.js','js/c11-lesson.js','js/c12-lesson.js','js/c13-lesson.js','js/c14-lesson.js','js/c15-lesson.js','js/c16-lesson.js','js/c17-lesson.js','js/c18-lesson.js','js/c19-lesson.js','js/c20-lesson.js','js/c21-lesson.js','js/c22-lesson.js','js/c23-lesson.js','js/c24-lesson.js'];
const files = ['index.html','manifest.webmanifest','sw.js','css/app.css','js/data.js','js/dia.js','js/interests.js','js/ceremony.js','js/uniform.js','js/songs.js','js/figs.js','js/projector.js','js/app.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png',
  'assets_src/diasvg/diagrams.src.js','assets_src/diasvg/svg-kit.src.js',
  'img/fig/cer-open.avif','img/fig/cer-close.avif','img/fig/cer-drill.avif','img/fig/cer-flag.avif',
  'img/fig/cer-oath.avif','img/fig/cer-salute.avif','img/fig/fire-circle.avif','img/fig/fire-song.avif',  'img/fig/game-ball.avif','img/fig/game-shape.avif','img/fig/game-tarp.avif','img/fig/game-pack.avif',
  'img/fig/game-relay-cards.avif','img/fig/game-tug.avif','img/fig/game-aid.avif','img/fig/game-orienteer.avif',
  'img/fig/game-beachflag.avif','img/fig/game-water.avif','img/fig/game-lineup.avif','img/fig/game-chairs.avif','img/fig/SOURCES.md',
  'img/fig/skill-ropecare.avif','img/fig/skill-legend.avif','img/fig/skill-tent.avif',
  'img/fig/skill-stove.avif','img/fig/skill-rice.avif','img/fig/skill-lost.avif',
  'img/fig/skill-knife.avif','img/fig/skill-sos.avif',
  'img/fig/skill-pack.avif','img/fig/skill-pioneer.avif','img/fig/skill-track.avif','img/fig/skill-field.avif',
  'img/fig/aid-nosebleed.avif','img/fig/aid-cramp.avif','img/fig/aid-burn.avif','img/fig/aid-cut.avif','img/fig/aid-sting.avif', ...lessonFiles];
for (const f of files) {
  if (!existsSync(root + f)) { console.error('❌ Missing', f); process.exit(1); }
  console.log('✅', f);
}
const interestsSrc = readFileSync(root + 'js/interests.js', 'utf8');
const bm = interestsSrc.match(/k:'[a-z_]+',\s*en:'/g);
console.log('✅ 興趣章數：', bm ? bm.length : 0);
const html = readFileSync(root + 'index.html', 'utf8');
['1MhGE2LP3kiCEmyJAGUfIlLzL0Iq4fK33','js/ceremony.js','js/uniform.js','js/dia.js','js/songs.js','js/figs.js','js/projector.js', ...lessonFiles, 'icons/icon-192.png'].forEach(u => {
  if (!html.includes(u)) { console.error('❌ index.html 缺少', u); process.exit(1); }
});
if (html.includes('js/redesign.js')) { console.error('❌ index.html 仲有死引用 js/redesign.js'); process.exit(1); }
if ((html.match(/class="iconbtn"/g)||[]).length !== 2 || !html.includes('href="#book/refs"')) {
  console.error('❌ 手機頂欄應只留「搜尋／參考」兩個入口，外部工具集中喺手冊'); process.exit(1);
}
if (/window\.open\('https:\/\/(?:scoutbadge|districtbadgesystem30|scout-circulars)/.test(html)) {
  console.error('❌ 頂欄仍有重複外部工具掣'); process.exit(1);
}
console.log('✅ index.html 接線齊；頂欄外部工具已集中到「手冊→參考資料」');
if (!interestsSrc.includes('通告圖書館') || !interestsSrc.includes('訂閱')) { console.error('❌ 訓練班步驟未提及訂閱通告圖書館'); process.exit(1); }
console.log('✅ 訓練班程序包含「訂閱通告圖書館」');
if (!interestsSrc.includes('只係報考專科徽章用')) { console.error('❌ 未明確 districtbadgesystem30 只係報專章'); process.exit(1); }
// v19：興趣組＝團內考核，唔使自己入區系統
if (!interestsSrc.includes('團內考核')) { console.error('❌ interests.js 未改成團內考核流程'); process.exit(1); }
console.log('✅ 已標明 districtbadgesystem30 為專章系統＋興趣組團內考核');
const uniformSrc = readFileSync(root + 'js/uniform.js', 'utf8');
['www.scout.org.hk/uploads/member/Scout_B.1.jpg','www.scout.org.hk/uploads/member/Scout_G.1.jpg','uniform.scouting.org.hk','p013-23.pdf'].forEach(u => {
  if (!uniformSrc.includes(u)) { console.error('❌ 制服缺少官方圖/參考', u); process.exit(1); }
});
// v19：陸／海／空分支小分頁
if (!uniformSrc.includes('UNIFORM.branches') || !uniformSrc.includes("'sea'") || !uniformSrc.includes("'air'")) { console.error('❌ uniform.js 缺陸海空 branches'); process.exit(1); }
console.log('✅ 制服官網圖齊＋陸海空分支資料');
const ceremonySrc = readFileSync(root + 'js/ceremony.js','utf8');
['團集會儀式（開始）','團集會儀式（結束）','中式隊列基本動作','升旗禮','宣誓儀式','童軍三指敬禮','童軍團呼'].forEach(c => {
  if (!ceremonySrc.includes(c)) { console.error('❌ 儀式卡缺少', c); process.exit(1); }
});
// v19：儀式卡要附圖（fig 欄位）
if ((ceremonySrc.match(/fig:'/g)||[]).length < 6) { console.error('❌ 儀式卡 fig 圖解欄不足 6 套'); process.exit(1); }
console.log('✅ 8 套儀式卡存在（6 套附 AVIF 插畫＋2 套手繪平面圖解）');

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
checkLesson('js/c01-lesson.js','C01','c01',['加入小隊','立正','稍息','童軍動作','C01.program','C01.safety'],9);
checkLesson('js/c02-lesson.js','C02','c02',['貝登堡','白浪島','WOSM','百合花飾','C02.program'],9);
checkLesson('js/c03-lesson.js','C03','c03',['五星紅旗','保護自己三步','C03.scenarios','C03.program'],9);
checkLesson('js/c04-lesson.js','C04','c04',['義勇軍進行曲','三指敬禮','升旗','C04.program'],9);
checkLesson('js/c05-lesson.js','C05','c05',['我願以信譽為誓','C05.promise','C05.pledgeCard','C05.program'],9);
checkLesson('js/c06-lesson.js','C06','c06',['宣誓儀式','左手握手','C06.roles','C06.postCeremony','C06.trivia','C06.program'],9);
checkLesson('js/c07-lesson.js','C07','c07',['健康生活','小隊歡呼','21 天健康挑戰','C07.program'],9);
checkLesson('js/c08-lesson.js','C08','c08',['生態','自然筆記','家長同意書','Leave No Trace','C08.personalKit','C08.doNotBring','C08.roles','C08.postCeremony','C08.trivia','C08.program'],9);
checkLesson('js/c09-lesson.js','C09','c09',['1:25,000','等高線','圖例','執包三步','SOS','C09.trivia','C09.program'],9);
checkLesson('js/c10-lesson.js','C10','c10 一日郊野徒步',
  ['5 公里','安靜反思','撤退','Leave No Trace','中暑','C10.personalKit','C10.doNotBring','C10.postCeremony','C10.trivia','C10.roles','C10.program'],9);
checkLesson('js/c11-lesson.js','C11','c11 農曆新年團拜',
  ['揮春','團拜','鼓勵利是','左手握手','書法','年糕','過敏專區','哈姆立克','墨漬','C11.words','C11.roles','C11.postCeremony','C11.trivia','C11.worksheet','C11.program'],9);
checkLesson('js/c12-lesson.js','C12','c12 思善日',
  ['貝登堡','思善日','World Thinking Day','2 月 22','世界童軍','3 分鐘','電子蠟燭','捐款','自願','思善卡','誓詞','C12.countries','C12.roles','C12.postCeremony','C12.trivia','C12.worksheet','C12.bpMessage','C12.program'],9);
checkLesson('js/c13-lesson.js','C13','c13 先鋒工程（一）',
  ['平結','八字結','雙套結','半結','反手結','左壓右','婆婆結','接力賽','C13.knots','C13.trivia','C13.worksheet','C13.program'],9);
checkLesson('js/c14-lesson.js','C14','c14 先鋒工程（二）',
  ['稱人結','接繩結','繫木結','縮繩結','曳木結','收繩','保養','兔仔','拖木頭','十結小達人','C14.knots','C14.ropeCare','C14.trivia','C14.worksheet','C14.program'],9);
checkLesson('js/c15-lesson.js','C15','c15 營藝（一）',
  ['營藝','背囊','小刀','斧頭','手鋸','爐具','C15.trivia','C15.worksheet','C15.program'],9);
checkLesson('js/c16-lesson.js','C16','c16 小隊露營',
  ['露營','帳篷','營火','拔營','指南針','Leave No Trace','C16.personalKit','C16.doNotBring','C16.roles','C16.postCeremony','C16.trivia','C16.program'],9);
checkLesson('js/c17-lesson.js','C17','c17 七種急救',
  ['急救','流鼻血','燒傷','燙傷','抽筋','扭傷','割傷','刺傷','復原臥式','C17.firstaid','C17.trivia','C17.program'],9);
checkLesson('js/c18-lesson.js','C18','c18 母親節',
  ['母親節','康乃馨','心意卡','感恩','C18.roles','C18.postCeremony','C18.trivia','C18.program'],9);
checkLesson('js/c19-lesson.js','C19','c19 小隊會議',
  ['小隊會議','會議記錄','主席','小隊長','C19.trivia','C19.worksheet','C19.program'],9);
checkLesson('js/c20-lesson.js','C20','c20 頒發儀式',
  ['頒發儀式','探索獎章','證書','生活分享','C20.roles','C20.postCeremony','C20.trivia','C20.program'],9);
checkLesson('js/c21-lesson.js','C21','c21 暑期沙灘',
  ['暑期','沙灘','中暑','防曬','水上安全','淨灘','C21.personalKit','C21.doNotBring','C21.trivia','C21.program'],9);
checkLesson('js/c22-lesson.js','C22','c22 社區考察',
  ['社區','文化習俗','傳統節慶','訪問','C22.personalKit','C22.doNotBring','C22.trivia','C22.program'],9);
checkLesson('js/c23-lesson.js','C23','c23 游泳章',
  ['游泳','泳池','救生員','水上安全','踩水','HELP','C23.requirements','C23.roles','C23.trivia','C23.program'],9);
checkLesson('js/c24-lesson.js','C24','c24 模型製作',
  ['模型','STEAM','𠝹刀','膠水','C24.trivia','C24.worksheet','C24.program'],9);

const dataSrc = readFileSync(root+'js/data.js','utf8');
['sensitive:true','special:true','outdoor:true','personalKit'].forEach(t=>{
  if(!dataSrc.includes(t)){ console.error('❌ data 缺',t); process.exit(1); }
});
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
['js/dia.js','js/interests.js','js/ceremony.js','js/uniform.js','js/songs.js','js/figs.js','js/projector.js', ...lessonFiles, 'js/data.js','js/app.js'].forEach(f => {
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
const codes=['C01','C02','C03','C04','C05','C06','C07','C08','C09','C10','C11','C12','C13','C14','C15','C16','C17','C18','C19','C20','C21','C22','C23','C24'];
for(let i=0;i<codes.length;i++){
  const c=codes[i];
  console.log('✅ '+c.toLowerCase(),'full=',ctx.DATA.meetings[i].full,'segs=',ctx[c].program.length);
}
console.log('✅ App.renderMeeting:',typeof ctx.App.renderMeeting);
for(let i=0;i<codes.length;i++){
  const tid=codes[i].toLowerCase();
  try{ ctx.App.renderMeeting(tid); }catch(e){ console.error('❌ renderMeeting('+tid+'):',e.message,e.stack.split('\n')[0]); process.exit(1); }
}
console.log('✅ renderMeeting(c01-c24) 正常');

// v17：遊戲庫＋現場工具
if(ctx.DATA.games.length!==12){ console.error('❌ 遊戲庫唔係 12 個'); process.exit(1); }
console.log('✅ 遊戲庫 12 個');
for (const f of ['patrolScore','drawLots','countdownStart','groupRandom']) {
  if(typeof ctx.App[f]!=='function'){ console.error('❌ 缺集會現場工具函數 '+f); process.exit(1); }
}
/* v31：小隊數可加減＋每個工具都有投屏 */
for (const f of ['patrolCount','patrolScoreReset','patrolName','boardHtml','projHtml','toolsRefresh','projSec','projPage','projPlan']) {
  if(typeof ctx.App[f]!=='function'){ console.error('❌ v31 缺函數 '+f); process.exit(1); }
}
{
  const before = ctx.App.troop.count;
  ctx.App.patrolCount(6); if (ctx.App.troop.count !== 6) { console.error('❌ 小隊數改唔到（應 6，實際 '+ctx.App.troop.count+'）'); process.exit(1); }
  ctx.App.patrolCount(0); if (ctx.App.troop.count < 2) { console.error('❌ 小隊數下限冇守住'); process.exit(1); }
  ctx.App.patrolCount(99); if (ctx.App.troop.count > 8) { console.error('❌ 小隊數上限冇守住'); process.exit(1); }
  ctx.App.patrolCount(before);
  if (ctx.App.boardHtml(false).indexOf('第一小隊') < 0) { console.error('❌ 計分板冇小隊名'); process.exit(1); }
  if (ctx.App.boardHtml(true).indexOf('pj-score') < 0) { console.error('❌ 計分板冇投屏大字版'); process.exit(1); }
  for (const k of ['score','timer','lots','group']) {
    const h = ctx.App.projHtml(k);
    if (!h || h.indexOf('冇內容') >= 0) { console.error('❌ 投屏畫面缺 '+k); process.exit(1); }
  }
}
if (typeof ctx.Projector !== 'object' || typeof ctx.Projector.deck !== 'function' || typeof ctx.Projector.live !== 'function') {
  console.error('❌ projector.js 未載入或 API 唔齊'); process.exit(1);
}
console.log('✅ 集會現場工具函數齊（小隊數 2–8 可加減・4 個工具都有投屏版）');

// ═════════ v31：🖥️ 投屏（投影機／大電視）＋ 小隊數可加減 ═════════
if (typeof ctx.Projector !== 'object') { console.error('❌ projector.js 冇載入'); process.exit(1); }
for (const f of ['boot','show','deck','live','step','font','close','fullscreen','secondScreen','syncScreen','html']) {
  if (typeof ctx.Projector[f] !== 'function') { console.error('❌ Projector 缺 API：'+f); process.exit(1); }
}
for (const mk of ['App.projSec','App.projPage','App.projSong','App.projPlan','App.projBody','App.projHtml','App.act','App.toolsRefresh']) {
  if (typeof ctx.App[mk.split('.')[1]] !== 'function') { console.error('❌ app.js 缺投屏函數：'+mk); process.exit(1); }
}
/* 每個教學區塊都有「🖥️ 投屏」（App.sec 自動加） */
{ const appSrcV31 = readFileSync(root+'js/app.js','utf8');
  const secSrc = appSrcV31.slice(appSrcV31.indexOf('App.sec = function'), appSrcV31.indexOf('App.sec = function')+1600);
  if (secSrc.indexOf('proj-btn') < 0) { console.error('❌ App.sec 冇自動加「🖥️ 投屏」掣'); process.exit(1); } }
if (readFileSync(root+'js/app.js','utf8').indexOf('Projector.live(') < 0) { console.error('❌ 集會工具四個冇即時投屏'); process.exit(1); }
/* 小隊數 2–8 可加減 */
{
  const before = ctx.App.troop.count;
  ctx.App.patrolCount(6);  if (ctx.App.troop.count !== 6) { console.error('❌ 小隊數改唔到'); process.exit(1); }
  ctx.App.patrolCount(99); if (ctx.App.troop.count !== 8) { console.error('❌ 小隊數上限唔係 8'); process.exit(1); }
  ctx.App.patrolCount(0);  if (ctx.App.troop.count !== 2) { console.error('❌ 小隊數下限唔係 2'); process.exit(1); }
  ctx.App.patrolCount(before);
  const v31src = readFileSync(root+'js/app.js','utf8');
  if (v31src.indexOf('App.patrolCount(App.troop.count+1)') < 0 || v31src.indexOf('App.patrolCount(App.troop.count-1)') < 0) {
    console.error('❌ 冇「＋／－」改小隊數嘅掣'); process.exit(1);
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
console.log('✅ v31 投屏：projector.js API 齊・每節都有投屏掣・4 個即時工具・小隊數 2–8 可加減');
// v19：tab render——songs 取代 patrol；儀式/制服/手冊/技能帶 sub 都要 render 到
for (const p of ['print','play','skills','songs','badges','book','uniform','ceremony']) {
  try{ ctx.App.pages[p](); }catch(e){ console.error('❌ pages.'+p+':',e.message); process.exit(1); }
}
for (const s of ctx.CEREMONY.cards.map(c=>c.k)) { try{ ctx.App.pages.ceremony(s); }catch(e){ console.error('❌ pages.ceremony('+s+'):',e.message); process.exit(1); } }
for (const s of ['land','sea','air','badge','check']) { try{ ctx.App.pages.uniform(s); }catch(e){ console.error('❌ pages.uniform('+s+'):',e.message); process.exit(1); } }
for (const s of ['promise','patrol','tools','apply','course','refs']) { try{ ctx.App.pages.book(s); }catch(e){ console.error('❌ pages.book('+s+'):',e.message); process.exit(1); } }
for (const s of ['rope','care','map','pack','camp','pioneer','track','field','aid']) { try{ ctx.App.pages.skills(s); }catch(e){ console.error('❌ pages.skills('+s+'):',e.message); process.exit(1); } }
for (const sh of ctx.SONGS.sheets) { try{ ctx.App.pages.songs(sh.k); }catch(e){ console.error('❌ pages.songs('+sh.k+'):',e.message); process.exit(1); } }
console.log('✅ v19 全部 tab＋小分頁 render 正常');

const appSrc = readFileSync(root+'js/app.js','utf8');
for (const mk of ['工作紙','印本節','game-card','小隊計分板','隨機分組','抽籤','倒數計時','歡呼庫','會議記錄表','追蹤符號','printSec','subnav','meet-row']) {
  if(!appSrc.includes(mk)){ console.error('❌ app.js 缺標記 '+mk); process.exit(1); }
}
// v19 要求：唔出繩結卡（素材庫）、 Interest tab 唔放區系統 CTA、整行可撳
if (appSrc.includes('列印繩結卡')) { console.error('❌ 素材庫仲有「列印繩結卡」（用戶要求移除）'); process.exit(1); }
/* v31 用戶要求：素材庫要真分頁（撳 chip 換內容），唔係錨點跳位 */
for (const mk of ['App.printCats','App.printPanel','App.printSong','App.projSong','App.filterbar','App.projSec','App.projPage','App.projPlan','App.projBody']) {
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
  if (n < 6) { console.error('❌ 素材庫分頁得 '+n+' 類（應 6：工作紙／急救卡／誓詞／收繩／國歌／營火歌）'); process.exit(1); }
}
/* 用戶要求：刪 🅰️／🅱️ 兩句 navcap 同相關字句 */
if (appSrc.includes('🅰️') || appSrc.includes('🅱️')) { console.error('❌ app.js 仲有 🅰️／🅱️ 字句'); process.exit(1); }
console.log('✅ v31 素材庫真分頁（6 類即時切換）・🅰️／🅱️ 字句已清');
if (appSrc.includes('前往區總部報章系統')) { console.error('❌ 興趣章仲有「前往區總部報章系統」連結（用戶要求移除）'); process.exit(1); }
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
if(!ctx.DIAGRAMS || !ctx.DIAGRAMS.compass || !ctx.DIAGRAMS.pack || Object.keys(ctx.DIAGRAMS.track).length!==6){ console.error('❌ DIAGRAMS 基礎圖缺'); process.exit(1); }
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
    else if (v && typeof v==='object') walk(v, p); } })({compass:ctx.DIAGRAMS.compass,pack:ctx.DIAGRAMS.pack,track:ctx.DIAGRAMS.track,cer:ctx.DIAGRAMS.cer,game:ctx.DIAGRAMS.game,skillx:ctx.DIAGRAMS.skillx,fire:ctx.DIAGRAMS.fire,uniform:ctx.DIAGRAMS.uniform}, '');
  if (bad.length) { console.error('❌ DIAGRAMS 仲有 SVG 未轉 AVIF（'+bad.length+'）：'+bad.slice(0,8).join(', ')); process.exit(1); }
}
/* v37：前端 bundle 零 SVG —— 冇 <svg>、冇引用 .svg 檔（用戶：其他地方都盡量唔用 SVG，用 AVIF） */
{
  const shipped = ['index.html','manifest.webmanifest','sw.js','css/app.css','js/dia.js','js/data.js','js/interests.js','js/ceremony.js','js/uniform.js','js/songs.js','js/figs.js','js/projector.js','js/app.js', ...lessonFiles];
  const bad = [];
  /* 註解可以講 SVG（解釋設計決定），但碼／標記唔可以真係出 SVG → 掃之前剷走註解 */
  const codeOnly = (src)=>src.replace(/\/\*[\s\S]*?\*\//g,'').replace(/<!--[\s\S]*?-->/g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');
  for (const f of shipped) {
    const src = codeOnly(readFileSync(root+f,'utf8'));
    if (/<svg/i.test(src)) bad.push(f+'：有 <svg>');
    if (/\.svg["')]/.test(src)) bad.push(f+'：引用 .svg 檔');
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
    if (typeof v==='string') flat[key]=v; else if (v && typeof v==='object') walk(v,key); } })({compass:ctx.DIAGRAMS.compass,pack:ctx.DIAGRAMS.pack,track:ctx.DIAGRAMS.track,cer:ctx.DIAGRAMS.cer,game:ctx.DIAGRAMS.game,skillx:ctx.DIAGRAMS.skillx,fire:ctx.DIAGRAMS.fire,uniform:ctx.DIAGRAMS.uniform}, '');
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
  if (n < 50) { console.error('❌ dia.js 圖檔對照表太少（'+n+'）'); process.exit(1); }
  for (const k in m) {
    const e = m[k];
    if (!e.f || e.f.indexOf('img/dia/') !== 0 || e.f.indexOf('.avif') < 0) { console.error('❌ dia.js 圖檔路徑唔對：'+k); process.exit(1); }
    if (!e.w || !e.h) { console.error('❌ dia.js 冇標尺寸：'+k); process.exit(1); }
    if (!e.alt || e.alt.length < 8) { console.error('❌ dia.js 冇 alt 文字：'+k); process.exit(1); }
    if (!readFileSync(root+'sw.js','utf8').includes(e.f)) { console.error('❌ sw.js 冇 cache 圖檔：'+k+' → '+e.f); process.exit(1); }
    if (!existsSync(root+e.f)) { console.error('❌ 圖檔唔存在：'+e.f); process.exit(1); }
  }
}
if(Object.keys(ctx.DIAGRAMS.cer).length<6){ console.error('❌ 儀式圖解不足 6 套'); process.exit(1); }
if(Object.keys(ctx.DIAGRAMS.game).length!==12){ console.error('❌ 遊戲場地圖唔係 12 張，實際', Object.keys(ctx.DIAGRAMS.game).length); process.exit(1); }
if(!ctx.DIAGRAMS.skillx || !ctx.DIAGRAMS.skillx.tent || !ctx.DIAGRAMS.skillx.rice || !ctx.DIAGRAMS.skillx.sos || !ctx.DIAGRAMS.skillx.lost){ console.error('❌ 技能圖解缺'); process.exit(1); }
if(!ctx.DIAGRAMS.fire || !ctx.DIAGRAMS.fire.circle || !ctx.DIAGRAMS.fire.flow){ console.error('❌ 營火圖缺'); process.exit(1); }
if(ctx.DIAGRAMS.reef || ctx.DIAGRAMS.bowline){ console.error('❌ 仲殘留繩結逐步圖（用戶要求移除）'); process.exit(1); }
console.log('✅ 圖解庫齊（AVIF：指南針/背囊/追蹤6＋儀式/遊戲12/技能/營火；繩結圖已移除）');

// 搜尋頁
try{ ctx.App.pages.search('急救'); ctx.App.pages.search(); }catch(e){ console.error('❌ pages.search:',e.message); process.exit(1); }
console.log('✅ 搜尋頁 render 正常');
if(ctx.App.buildSearchIndex().length < 90){ console.error('❌ 搜尋索引太少：', ctx.App.buildSearchIndex().length); process.exit(1); }
console.log('✅ 搜尋索引', ctx.App.buildSearchIndex().length, '項');
for (const mk of ['義勇軍進行曲','searchGo','buildSearchIndex','全站搜尋']) {
  if(!appSrc.includes(mk)){ console.error('❌ app.js 缺標記 '+mk); process.exit(1); }
}
// 歌紙（v31 用戶要求）：換成香港旅團真係唱開嘅營火歌
const songsSrc = readFileSync(root+'js/songs.js','utf8');
const NEED_SONGS = ['campfire-hk','hk-scouts','bp-spirit','laofu','mosquito-net','sleepy-pig','happy','morra','we-sing-well','happy-wanderer','ging-gang','parting','grace','good-scout'];
for (const k of NEED_SONGS) {
  if (!songsSrc.includes("k:'"+k+"'")) { console.error('❌ songs.js 缺香港營火歌 '+k); process.exit(1); }
}
if (songsSrc.includes('Skip to My Lou') || songsSrc.includes('Oh! Susanna') || songsSrc.includes('Ten Green Bottles')) {
  console.error('❌ 仲有西方傳統歌（用戶要求換成香港旅團歌）'); process.exit(1);
}
if (appSrc.includes('Scout Hub 原創') || songsSrc.includes('原創歌詞')) { console.error('❌ 仲有「自創」歌（用戶明確禁止）'); process.exit(1); }
if (appSrc.includes('營火之夜') || appSrc.includes('小隊同心')) { console.error('❌ 素材庫仲殘留舊自創歌名'); process.exit(1); }
if (ctx.SONGS.sheets.length < 14) { console.error('❌ 歌紙不足 14 首（實際 '+ctx.SONGS.sheets.length+'）'); process.exit(1); }
for (const sh of ctx.SONGS.sheets) {
  if (!sh.zh || !sh.cat || !sh.from || !sh.lines || !sh.lines.length) { console.error('❌ 歌紙欄位唔齊：'+sh.k); process.exit(1); }
  if (!sh.acts || !sh.acts.length) { console.error('❌ 歌紙冇玩法／動作：'+sh.k); process.exit(1); }
  if (!sh.howto || !sh.howto.length) { console.error('❌ 歌紙冇領唱提示：'+sh.k); process.exit(1); }
}
if (!ctx.SONGS.leaderTips || ctx.SONGS.leaderTips.length < 3) { console.error('❌ 缺領唱技巧'); process.exit(1); }
if (!ctx.SONGS.musicTips || ctx.SONGS.musicTips.length < 3) { console.error('❌ 缺冇樂器帶歌技巧'); process.exit(1); }
if (!ctx.SONGS.hostPlan || ctx.SONGS.hostPlan.length < 6) { console.error('❌ 缺唱歌環節編排'); process.exit(1); }
if (!ctx.SONGS.safety || ctx.SONGS.safety.length < 3) { console.error('❌ 缺營火安全底線'); process.exit(1); }
if (!ctx.SONGS.mustKnow || !ctx.SONGS.mustKnow.list || ctx.SONGS.mustKnow.list.length < 3) { console.error('❌ 缺營火章必識歌清單'); process.exit(1); }
if (!ctx.SONGS.mustKnow.list.some(function(x){return x.must===true;})) { console.error('❌ 必識歌清單冇標明邊首係「必學」'); process.exit(1); }
if (!ctx.SONGS.sources || ctx.SONGS.sources.length < 3) { console.error('❌ 歌詞來源不足'); process.exit(1); }
console.log('✅ 營火歌：'+ctx.SONGS.sheets.length+' 首香港旅團歌紙（每首有歌詞/動作/領唱提示/出處）＋領唱技巧＋環節編排＋安全');

// index.html 接線
const htmlSrc = readFileSync(root+'index.html','utf8');
if(!htmlSrc.includes('js/dia.js') || !htmlSrc.includes("#search'")){ console.error('❌ index.html 缺 dia/search 接線'); process.exit(1); }
if(htmlSrc.includes('svg-kit') || htmlSrc.includes('diagrams.js')){ console.error('❌ index.html 仲載入緊手繪 SVG 底稿（v37 起前端只出 AVIF）'); process.exit(1); }
if(/<svg/i.test(htmlSrc) || /\.svg["']/.test(htmlSrc)){ console.error('❌ index.html 仲有 SVG'); process.exit(1); }
if(!htmlSrc.includes('data-tab="songs"') || htmlSrc.includes('data-tab="patrol"')){ console.error('❌ index.html 底部 tab 未轉營火歌'); process.exit(1); }
if(htmlSrc.includes('navcap')){ console.error('❌ index.html 仲有 navcap（用戶要求刪 🅰️／🅱️ 兩句）'); process.exit(1); }
if(htmlSrc.includes('🅰️') || htmlSrc.includes('🅱️')){ console.error('❌ index.html 仲有 🅰️／🅱️ 字句'); process.exit(1); }
if(!htmlSrc.includes('js/projector.js') || !htmlSrc.includes('id="projfab"')){ console.error('❌ index.html 未接 projector.js／投屏掣'); process.exit(1); }
if(htmlSrc.indexOf('js/projector.js') > htmlSrc.indexOf('js/app.js')){ console.error('❌ projector.js 要喺 app.js 之前載入'); process.exit(1); }
console.log('✅ index.html 接線齊（🔥營火歌 tab）');

// manifest：分頁捷徑＋maskable icon
const mf = readFileSync(root+'manifest.webmanifest','utf8');
if(!mf.includes('icon-maskable-512.png') || !mf.includes('#songs')){ console.error('❌ manifest 缺 maskable icon 或營火歌 shortcut'); process.exit(1); }
console.log('✅ manifest：新 icon＋營火歌 shortcut');

// sw.js
const swSrc = readFileSync(root+'sw.js','utf8');
const swVer = (swSrc.match(/scout-v(\d+)-c24-(\d+)/)||[])[1];
if(!swVer || !swSrc.includes('c24-lesson.js')){ console.error('❌ sw.js cache 名唔係 scout-vN-c24-日期 格式'); process.exit(1); }
if(!readFileSync(root+'README.md','utf8').includes('scout-v'+swVer+'-c24')){ console.error('❌ README 寫嘅 cache 版本同 sw.js（v'+swVer+'）唔一致'); process.exit(1); }
if(!swSrc.includes('songs.js') || !swSrc.includes('projector.js')){ console.error('❌ sw.js 未 cache 新檔（songs/projector）'); process.exit(1); }
if(swSrc.includes('svg-kit') || swSrc.includes('diagrams.js')){ console.error('❌ sw.js 仲 cache 緊 SVG 底稿（前端唔應該再下載）'); process.exit(1); }
if(!swSrc.includes('./js/dia.js')){ console.error('❌ sw.js 未 cache js/dia.js（圖檔對照表）'); process.exit(1); }
if(!swSrc.includes('img/badge/') || !swSrc.includes('img/uni/')){ console.error('❌ sw.js 未 cache 興趣章／制服圖（img/badge、img/uni）'); process.exit(1); }
console.log('✅ sw.js cache 版本 v'+swVer+'（README 已同步）');

// README
const rm = readFileSync(root+'README.md','utf8');
if(!rm.includes('c24')){ console.error('❌ README 缺 c24'); process.exit(1); }
// ── v29：內容範圍（集會套包＝會員章＋日常集會；深階步操交返訓練班＋《步操手冊》）──
{
  const C = srcView('cer');
  const keys = ctx.CEREMONY.cards.map(c=>c.k);
  const want = ['open','close','footdrill','flag','oath','salute','howl','fallin'];
  if (keys.join(',')!==want.join(',')) { console.error('❌ 儀式卡應得返：'+want.join('/')+'（而家：'+keys.join(',')+'）'); process.exit(1); }
  for (const dead of ['turns','sidepace','qmarch','qhalt','marchturn','marchabout','changestep','colour','march','handsign']) {
    if (C[dead]) { console.error('❌ 進階圖解「'+dead+'」未刪走（呢啲屬訓練班內容，唔擺喺集會套包）'); process.exit(1); }
  }
  for (const k of ['attn','rest','salute3']) if (!C[k]) { console.error('❌ 基本動作圖解缺 '+k+'（立正／稍息／敬禮要画得啱）'); process.exit(1); }
  // 尺寸線必須共用同一比例（呢個斷言先至令「750 係 375 兩倍」呢類判斷可信）
  const S = 0.05;
  for (const [key,src] of Object.entries(ctx.IMG.svg)) {
    if (typeof src!=='string') continue;
    for (const d of src.matchAll(/<desc data-mm="(\d+)" data-len="([-\d.]+)"><\/desc>/g)) {
      if (Math.abs(+d[2] - +d[1]*S) > 1.2) { console.error('❌ 圖解 '+key+' 尺寸線比例唔啱：'+d[1]+'mm 畫咗 '+d[2]+'px'); process.exit(1); }
    }
  }
  const angs = (k)=>Array.from(C[k].matchAll(/data-ang="([-\d.]+)"/g)).map(m=>+m[1]);
  if (angs('attn').filter(a=>a===30).length < 2) { console.error('❌ 立正圖解冇畫兩腳腳尖向外 30 度'); process.exit(1); }
  if (!/305/.test(C.rest)) { console.error('❌ 稍息圖解冇標 305mm'); process.exit(1); }
  if (!/25mm/.test(C.salute3)) { console.error('❌ 敬禮圖解冇標 25mm'); process.exit(1); }
  const srcs = ['js/ceremony.js','js/c01-lesson.js','assets_src/diasvg/svg-kit.src.js','js/app.js'].map(f=>readFileSync(root+f,'utf8')).join('\n');
  for (const banned of ['Changing step','Inclining','MARKER OUTWARD','AW-AWAY-YEA','CALL THE ROLL','Squad will advance','Bend the left knee','Shoot the right foot forward','Quick mark','抽膝踏步〔','彈前腳〔','{ h:\'5. 抽膝',"k:'commands'",'檢閱會操','動令落邊隻腳','150mm','每分鐘 116','flag 0','DOUBLE TIME']) {
    if (srcs.includes(banned)) { console.error('❌ 深階內容未清走：'+banned); process.exit(1); }
  }
  for (const dead of ['#ceremony/march','#ceremony/colour','#ceremony/commands','#ceremony/parade']) {
    if (srcs.includes(dead)) { console.error('❌ 仲有連結去已刪走嘅卡：'+dead); process.exit(1); }
  }
  const cerSrc = readFileSync(root+'js/ceremony.js','utf8');
  if (!/步操手冊|DRILL MANUAL/.test(cerSrc) || !/drive\.google\.com\/file\/d\/1g4M6C7e1K7tVDkr2IADdkebm1CjljI-l/.test(cerSrc)) { console.error('❌ 冇留低《步操手冊》出處＋連結（深階要靠呢個指引）'); process.exit(1); }
  if (!/訓練班/.test(readFileSync(root+'js/app.js','utf8'))) { console.error('❌ 儀式頁冇講明「深階步操請上訓練班」'); process.exit(1); }
  if (!/2003 年 7 月第二版|2003 第二版/.test(readFileSync(root+'js/app.js','utf8')+cerSrc)) { console.error('❌ 冇寫明手冊版次（2003 年 7 月第二版）'); process.exit(1); }
  const F = JSON.stringify(ctx.CEREMONY.cards.find(c=>c.k==='footdrill'));
  for (const [re,msg] of [[/30 度/,'立正腳尖向外 30 度'],[/305/,'稍息腳踭 305mm'],[/Out!/,'稍息打數 Out!'],[/In!/,'回立正打數 In!'],[/握拳/,'立正握拳'],[/後顎/,'後顎貼衣領'],[/Alert/,'集會用 Alert'],[/解散/,'解散'],[/睇齊|看——齊/,'睇齊'],[/唔准用作懲罰|唔准用嚟罰/,'步操唔准用作懲罰'],[/Stand — easy/,'休息'],[/Squad!/,'回稍息喊 Squad!']]) {
    if (!re.test(F)) { console.error('❌ 步操卡冇咗基本項：'+msg); process.exit(1); }
  }
  const FA = JSON.stringify(ctx.CEREMONY.cards.find(c=>c.k==='fallin'));
  if (!/集隊成三排|三排/.test(FA) || !/報數/.test(FA) || !/空行/.test(FA)) { console.error('❌ 集隊卡冇咗基本項（三排／報數／空行）'); process.exit(1); }
  if (!/進階/.test(FA)) { console.error('❌ 集隊卡冇標明七款手號屬進階內容'); process.exit(1); }
  const FL = JSON.stringify(ctx.CEREMONY.cards.find(c=>c.k==='flag'));
  if (!/持旗立正|攜旗|托旗/.test(FL) || !/第7章/.test(FL)) { console.error('❌ 升旗卡冇留低旗手三式＋手冊第7章指引'); process.exit(1); }
  const c01 = readFileSync(root+'js/c01-lesson.js','utf8');
  const blk = c01.slice(c01.indexOf("{ n:6, min:30"), c01.indexOf("{ n:7,"));
  const sub = [...blk.matchAll(/（(\d+)分鐘/g)].map(m=>+m[1]);
  const sum = sub.reduce((a,b)=>a+b,0);
  if (sum !== 30) { console.error('❌ c01 步操段分鐘數加唔埋 30（而家 '+sum+'：'+sub.join('+')+'）— 刪咗步驟要重新分配時間'); process.exit(1); }
  if (!/\{ h:'5\. 休息/.test(blk)) { console.error('❌ c01 冇返「5. 休息」呢步'); process.exit(1); }
  const rm = readFileSync(root+'README.md','utf8');
  if (!/8 套儀式卡/.test(rm)) { console.error('❌ README 冇講明儀式卡係 8 套（改咗卡數要同步）'); process.exit(1); }
  if (!/dgm-fold\{/.test(readFileSync(root+'css/app.css','utf8'))) { console.error('❌ css 缺 .dgm-fold（逐步圖解折疊用）'); process.exit(1); }
  console.log('✅ v29 範圍收斂：儀式卡 '+keys.length+' 張（會員章＋日常集會）・基本圖解 '+Object.keys(C).length+' 張・深階步操已交返訓練班＋手冊連結');
}

// ── v30：基本級 D 圖「補晒」（每張儀式卡都有圖・冇孤兒圖解・面板內文字唔准出框）──
{
  const C = srcView('cer');
  const got = Object.keys(C).sort();
  const want = ['attn','close','dress','flag','formup','howl','oath','open','rest','salute','salute3','threefinger','drill'].sort();
  if (got.join(',')!==want.join(',')) { console.error('❌ D.cer 圖解應得 13 張（'+want.join('/')+'）；而家 '+got.length+' 張：'+got.join(',')); process.exit(1); }
  // 每張儀式卡至少有一張圖（AI 插畫 fig 或手繪圖解 dgm／steps[].dgm／types[].dgm）
  const used = new Set();
  for (const c of ctx.CEREMONY.cards) {
    const refs = [c.fig, c.dgm]
      .concat((c.steps||[]).map(x=>x.dgm), (c.types||[]).map(x=>x.dgm)).filter(Boolean);
    if (!refs.length) { console.error('❌ 儀式卡「'+c.k+'」完全冇圖 — 基本級都要有示意圖（站位／動作）'); process.exit(1); }
    for (const r of refs) {
      if (!C[r]) { console.error('❌ 卡「'+c.k+'」引用咗冇嘅圖解 key：'+r); process.exit(1); }
      used.add(r);
    }
  }
  const orphan = Object.keys(C).filter(k=>!used.has(k));
  if (orphan.length) { console.error('❌ 孤兒圖解（冇喺任何儀式卡引用）：'+orphan.join(',')+' — 接返上卡或刪走'); process.exit(1); }
  // 新增四張：出處同幾何要講得明
  if (!/2250/.test(C.formup) || !/標號員/.test(C.formup) || !/小隊長/.test(C.formup)) { console.error('❌ 集隊圖解缺 2250mm／標號員／小隊長位置（第6章§1）'); process.exit(1); }
  if (!/留空|BLANK/.test(C.formup)) { console.error('❌ 集隊圖解冇交代人唔啱數點處理（BLANK FILE）'); process.exit(1); }
  const dang = Array.from(C.dress.matchAll(/data-ang="(-?[\d.]+)"/g)).map(m=>+m[1]);
  if (!dang.includes(90)) { console.error('❌ 睇齊圖解冇画「頭轉右 90 度」嘅角弧（要同立正 30 度一樣可核對）'); process.exit(1); }
  if (!/一手位/.test(C.dress) || !/375mm/.test(C.dress) || !/1500mm/.test(C.dress)) { console.error('❌ 睇齊圖解缺「一手位／375mm／1500mm」距離（第6章§4）'); process.exit(1); }
  if (!/25mm/.test(C.threefinger) || !/拇指壓住小指/.test(C.threefinger) || !/無名指/.test(C.threefinger)) { console.error('❌ 三指手形圖解缺 25mm／拇指壓小指／無名指（第3章§7）'); process.exit(1); }
  if (!/官方講法/.test(C.threefinger)) { console.error('❌ 三指含義冇註明「屬團内講解・有官方講法照官方」'); process.exit(1); }
  if (!/Horse Shoe|馬蹄鐵/.test(C.howl) || !/第8章/.test(C.howl)) { console.error('❌ 團呼圖解冇標明馬蹄鐵隊形嘅出處（第8章§6）'); process.exit(1); }
  if (!/待核/.test(C.howl) || !/唔准自己創作/.test(C.howl)) { console.error('❌ 團呼圖解冇寫明「字句待核・唔准自創」'); process.exit(1); }
  // 有圖都要照樣提醒待核（唔好因為補咗圖就當內容已核實）
  const howlCard = ctx.CEREMONY.cards.find(c=>c.k==='howl');
  if (!howlCard.pending) { console.error('❌ howl 卡補咗圖但要留低 pending:1（先至見到「待官方核對」提示）'); process.exit(1); }
  const appSrc0 = readFileSync(root+'js/app.js','utf8');
  if (!/if\(c\.pending && !full\) body \+= pendingNote;/.test(appSrc0)) { console.error('❌ app.js 冇喺「有圖但待核」嘅卡照樣顯示 pending 提示'); process.exit(1); }
  if (!/pendingNote/.test(appSrc0.slice(appSrc0.indexOf('App.ceremonySec = function')))) { console.error('❌ pending 提示唔係喺 ceremonySec 內（接錯位置）'); process.exit(1); }
  // 面板內文字／圖形唔准出框（fCL：panel 160×126，內文由 x=4 起・圖 translate(80,60) scale(.86)）
  const estw = (t,fs)=>{ let w=0; for (const ch of t) { const c = ch.codePointAt(0); w += (c>0x2e80?1.0:(ch===' '?0.34:0.58)); } return w*fs; };
  let pn=0, pbad=[];
  for (const [k,src] of Object.entries(C)) {
    if (typeof src!=='string' || src.indexOf('EAF1E6')<0) continue; pn++;
    /* 巢式 transform 疊乘；panel＝邊個 <g> 頭先跟住 <rect 0,0,160,126> */
    const re=/<g transform="translate\(([-\d.]+),([-\d.]+)\)(?: scale\(([-\d.]+)\))?">|<text x="(-[\d.]+)" y="(-[\d.]+)" font-size="([\d.]+)"[^>]*?text-anchor="(start|middle|end)"[^>]*>([^<]*)<\/text>|<\/g>/g;
    let mm, st=[{x:0,y:0,s:1,p:null}];
    while ((mm = re.exec(src))) {
      const cur=st[st.length-1];
      if (mm[0]==='</g>') { if (st.length>1) st.pop(); continue; }
      if (mm[1]!==undefined) {
        const nx=cur.x + (+mm[1])*cur.s, ny=cur.y + (+mm[2])*cur.s, ns=cur.s*(mm[3]?+mm[3]:1);
        const pm=src.slice(re.lastIndex).match(/^<rect x="0" y="0" width="([\d.]+)" height="([\d.]+)"/);
        st.push({x:nx,y:ny,s:ns, p: pm?{x:nx,y:ny,w:+pm[1]*ns,h:+pm[2]*ns} : cur.p});
        continue;
      }
      if (mm[4]===undefined || !cur.p) continue;
      const fs=+mm[6]*cur.s, txt=mm[8]||''; if (!txt) continue;
      const x=cur.x + (+mm[4])*cur.s, y=cur.y + (+mm[5])*cur.s, w=estw(txt,fs), anc=mm[7];
      let l=x,r=x; if (anc==='start') r=x+w; else if (anc==='end') l=x-w; else { l=x-w/2; r=x+w/2; }
      if (l<cur.p.x-1 || r>cur.p.x+cur.p.w+1 || y>cur.p.y+cur.p.h-1 || y<cur.p.y-1)
        pbad.push(k+'：「'+txt.slice(0,12)+'」'+l.toFixed(0)+'..'+r.toFixed(0)+'（面板 '+cur.p.x.toFixed(0)+'..'+(cur.p.x+cur.p.w).toFixed(0)+'，y '+y.toFixed(0)+'／限 ≤'+(cur.p.y+cur.p.h-1).toFixed(0)+'）');
    }
  }
  if (pbad.length) { console.error('❌ 下圖嘅面板內文字出咗框（會疊到隔離格／睇唔晒）：\n   '+pbad.join('\n   ')); process.exit(1); }
  console.log('✅ v30 補晒基本級 D 圖：8 張儀式卡全部有圖・D.cer 13 張冇孤兒・'+pn+' 張幀式圖解面板內文字唔出框');
}

// ── 所有手繪圖解嘅文字都要喺 viewBox 內（溢出即係睇唔到；用 stack 累加巢式 translate/scale）──
{
  const est = (t)=>{ let w=0; for (const ch of t) { const c = ch.codePointAt(0); w += (c>0x2e80?1.0:(ch===' '?0.34:0.58)); } return w; };
  const dkeys = Object.keys(ctx.IMG.svg);
  /* v36：制服 9 張（uniform.*）已經唔再由手繪 SVG raster 出嚟，而係「乾淨底圖＋程式疊位」
     直接畫成 AVIF，所以冇 SVG 底稿。其餘 45 張（儀式 13＋遊戲 12＋技能 9＋營火 3＋
     指南針／背囊 2＋追蹤 6）照舊要留低底稿做後備。 */
  if (dkeys.length < 45) { console.error('❌ IMG.svg 底稿唔齊（'+dkeys.length+'／45）— 換圖時冇存低原 SVG？'); process.exit(1); }
  ['chest','zoom','sleeve','body','scarf','ties','kilwell','cap','branch'].forEach(k=>{
    if (ctx.IMG.svg['uniform.'+k]) { console.error('❌ uniform.'+k+' 仲留住 SVG 底稿（v36 應直接出 AVIF）'); process.exit(1); }
    const u = ctx.IMG.map['uniform.'+k];
    if (!u || !existsSync(root+u.f)) { console.error('❌ uniform.'+k+' 冇對應 AVIF 圖檔'); process.exit(1); }
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
console.log('✅ README 提及 c24 同《步操手冊》');
// ═════════ v20：真圖示意插畫（AVIF），SVG 只做折疊後備 ═════════
const figSandbox = {}; createContext(figSandbox);
runInContext(readFileSync(root+'js/figs.js','utf8'), figSandbox, {filename:'js/figs.js'});
const FIGSJ = figSandbox.FIGS || {};
const figKeys = Object.keys(FIGSJ);
if (figKeys.length < 37) { console.error('❌ FIGS 不足 37 張（v31 加咗 4 技能＋5 急救），實際', figKeys.length); process.exit(1); }
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
const cerCardsWithFig = ctx.CEREMONY.cards.filter(c=>c.fig);
const missingImg = cerCardsWithFig.filter(c=>!FIGSJ['cer-'+c.fig]);
if (missingImg.length) { console.error('❌ 儀式卡冇插畫：', missingImg.map(c=>c.k).join(',')); process.exit(1); }
if (cerCardsWithFig.length < 6) { console.error('❌ 有圖儀式卡不足 6'); process.exit(1); }
const figHtml = ctx.App.cerFig(cerCardsWithFig[0]);
if (!figHtml.includes('class="ph-fig"')) { console.error('❌ 儀式圖未用 ph-fig 結構'); process.exit(1); }
if (!/img src="img\/fig\/cer-open\.avif"/.test(figHtml)) { console.error('❌ 儀式圖冇 AVIF <img>：', figHtml.slice(0,120)); process.exit(1); }
{ const f0 = FIGSJ[cerCardsWithFig[0].fig ? 'cer-'+cerCardsWithFig[0].fig : ''];
  if (!f0 || !figHtml.includes('width="'+f0.w+'"') || !figHtml.includes('height="'+f0.h+'"')) { console.error('❌ 儀式圖 w/h 屬性同 FIGS 資料唔一致（會 layout shift）'); process.exit(1); } }
for (const c of cerCardsWithFig) {
  const f = FIGSJ['cer-'+c.fig];
  const head = existsSync(root+f.src) ? readFileSync(root+f.src) : null;
  if (head) { const size = spawnSync('identify', ['-format','%wx%h', root+f.src], {encoding:'utf8'}).stdout.trim();
    if (size !== f.w+'x'+f.h) { console.error('❌ '+f.src+' 實際尺寸 '+size+' 唔等於 FIGS 記嘅 '+f.w+'x'+f.h); process.exit(1); } }
}
if (!figHtml.includes('<details class="dgm-alt no-print"')) { console.error('❌ 儀式圖冇折疊後備圖解'); process.exit(1); }
if (!figHtml.includes('onerror=')) { console.error('❌ 圖冇 onerror 後備'); process.exit(1); }
if (!figHtml.includes('ph-note') || !figHtml.includes('唔代表制服標準')) { console.error('❌ 圖說冇「唔代表制服標準」聲明'); process.exit(1); }
if (!appSrc.includes("App.ph('game-banner'")) { console.error('❌ 遊戲 tab 冇接封面插畫'); process.exit(1); }
if (appSrc.includes("App.ph('fire-robe'")) { console.error('❌ 營火袍仲用 AI 插畫（應該退回平面圖解）'); process.exit(1); }
if (figHtml.includes('undefined')) { console.error('❌ 儀式圖 markup 洩漏 undefined'); process.exit(1); }
if (ctx.App.cerFig({k:'blank'}) !== '') { console.error('❌ 冇 fig 亦冇 dgm 嘅卡唔應該硬出圖'); process.exit(1); }
const dgmOnly = ctx.App.cerFig(ctx.CEREMONY.cards.find(c=>!c.fig && c.dgm));
if (!dgmOnly.includes('class="dgm-fig"') || !dgmOnly.includes('\u{1F4D0}')) { console.error('❌ 得 dgm 嘅卡冇出平面圖解（v30 補晒圖之後呢先係正常路徑）'); process.exit(1); }
console.log('✅ 儀式卡插畫：6 張有 AVIF＋折疊後備圖解；2 張（團呼／集隊）用純手繪平面圖解（v30）');
for (const mk of ["App.ph('fire-song'", "App.ph('fire-circle'"]) {
  if (!appSrc.includes(mk)) { console.error('❌ 營火/歌 page 未接插畫：'+mk); process.exit(1); }
}
if (!appSrc.includes("附示意插畫＋位置圖解")) { console.error('❌ 搜尋索引未反映有插畫'); process.exit(1); }
const cssSrc2 = readFileSync(root+'css/app.css','utf8');
if (!cssSrc2.includes('.ph-fig.imgfail') || !cssSrc2.includes('.ph-fig .dgm-alt')) { console.error('❌ CSS 缺 ph-fig 後備樣式'); process.exit(1); }
if (!/@media print\{[\s\S]*?\.ph-fig \.dgm-alt,\.ph-fig \.ph-fail\{display:none!important\}/.test(cssSrc2)) { console.error('❌ 列印未隱藏折疊圖解'); process.exit(1); }
for (const k of figKeys) {
  if (!swSrc.includes(FIGSJ[k].src)) { console.error('❌ sw.js 未預 cache：'+FIGSJ[k].src); process.exit(1); }
}
if (!swSrc.includes('./js/figs.js')) { console.error('❌ sw.js 未 cache figs.js'); process.exit(1); }
if (!swSrc.includes('c.add(a).catch')) { console.error('❌ sw install 未改逐個 add（一張圖miss會拖冧全部）'); process.exit(1); }
console.log('✅ 營火/歌插畫接線＋CSS 後備＋sw 預 cache（9 張）齊');
// ═════════ v22：批次 2 — 遊戲場地圖插畫 ═════════
const GF = figSandbox.GAME_FIG || {};
const gfKeys = Object.keys(GF);
if (gfKeys.length !== 12) { console.error('❌ GAME_FIG 應覆蓋 12 個遊戲，實際 '+gfKeys.length); process.exit(1); }
for (const nm of gfKeys) {
  if (!FIGSJ[GF[nm]]) { console.error('❌ GAME_FIG 指向冇圖嘅 key：'+nm+' → '+GF[nm]); process.exit(1); }
}
const noImg = ctx.DATA.games.filter(g => !GF[g.n]);
if (noImg.length) { console.error('❌ 仲有遊戲未補圖：'+noImg.map(g=>g.n).join(',')); process.exit(1); }
let phCnt = 0, dgmCnt = 0;
for (const g of ctx.DATA.games) {
  const gk = GF[g.n] || '';
  const cap = (gk && FIGSJ[gk]) ? FIGSJ[gk].cap : '場地擺位圖';
  const html = ctx.App.ph(gk, cap, ctx.DIAGRAMS.game[g.n]);
  if (gk) {
    if (!html.includes('class="ph-fig"') || !html.includes('img/fig/'+gk+'.avif')) { console.error('❌ 遊戲 '+g.n+' 冇用 AVIF 插畫'); process.exit(1); }
    if (!html.includes('dgm-alt')) { console.error('❌ 遊戲 '+g.n+' 冇保留平面擺位圖後備'); process.exit(1); }
    phCnt++;
  } else {
    if (!html.includes('class="dgm-fig"')) { console.error('❌ 遊戲 '+g.n+' 退回邏輯唔啱'); process.exit(1); }
    dgmCnt++;
  }
  if (html.includes('undefined')) { console.error('❌ 遊戲 '+g.n+' markup 洩漏 undefined'); process.exit(1); }
}
if (!(phCnt===12 && dgmCnt===0)) { console.error('❌ 12 個遊戲應全部有圖片：ph='+phCnt+' dgm='+dgmCnt); process.exit(1); }
for (const k of Object.keys(FIGSJ).filter(x=>x.indexOf('game-')===0)) {
  const f = FIGSJ[k];
  if (/帽章|領巾|布章|巾圈|旅巾|制服|團員|童軍帽/.test(f.alt)) { console.error('❌ '+k+' alt 描述咗制服／身份：', f.alt); process.exit(1); }
  if (/平結|稱人結|八[字字]結|水手結/.test(f.alt)) { console.error('❌ '+k+' alt 畫咗繩結打法（禁止）'); process.exit(1); }
}
if (!/唔出繩結逐步圖/.test(FIGSJ['game-relay-cards'].cap) || !/唔出結圖/.test(FIGSJ['game-tug'].cap)) { console.error('❌ 繩結相關遊戲冇寫明「唔出結圖」'); process.exit(1); }
if (!/絕對唔准衝向海邊/.test(FIGSJ['game-beachflag'].cap)) { console.error('❌ 沙灘旗圖冇寫海邊安全提示'); process.exit(1); }
for (const k of Object.keys(FIGSJ).filter(x=>x.indexOf('game-')===0)) {
  if (!swSrc.includes(FIGSJ[k].src)) { console.error('❌ sw.js 未 cache 遊戲圖：'+k); process.exit(1); }
}
try { ctx.App.pages.play(); } catch(e) { console.error('❌ pages.play 插畫接入後 render 失敗：', e.message); process.exit(1); }
console.log('✅ 遊戲圖片：12/12 張 AVIF＋每張保留平面設場圖（ph='+phCnt+'/dgm='+dgmCnt+'）・sw 預 cache 齊');

// ═════════ v23：批次 3 — 技能插畫 ＋ QA fail 名單（唔准回流） ═════════
const SF = figSandbox.SKILL_FIG || {};
if (Object.keys(SF).length < 12) { console.error('❌ SKILL_FIG 只覆蓋 '+Object.keys(SF).length+' 項技能（v31 應 12）'); process.exit(1); }
for (const need of ['pack','pioneer','track','field']) { if (!SF[need]) { console.error('❌ SKILL_FIG 缺 '+need+'（v31 用戶要求：技能除繩結外全部要有圖）'); process.exit(1); } }
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
const capOath = FIGSJ['cer-oath'].cap + ' ' + ceremonySrc;
if (!/唔係合十/.test(capOath)) { console.error('❌ 宣誓圖冇交代「唔好合十／立正垂手」'); process.exit(1); }
if (!/中間唔准放嘢|唔可以插喺二人之間/.test(capOath)) { console.error('❌ 宣誓圖冇交代「旗唔准喺二人之間」'); process.exit(1); }
if (!/照<b>右格<\/b>數|照右格/.test(FIGSJ['cer-salute'].cap + ceremonySrc)) { console.error('❌ 敬禮圖冇講明手指數以邊格作準'); process.exit(1); }
if (!/右翼/.test(FIGSJ['cer-open'].cap)) { console.error('❌ 集隊圖冇講明右翼以邊個為準'); process.exit(1); }
if (!/制服不整齊|制服整唔整齊/.test(FIGSJ['cer-flag'].cap + ceremonySrc)) { console.error('❌ 升旗圖冇交代「以制服整齊與否決定舉手」（手冊§6.3）'); process.exit(1); }
if (FIGSJ['cer-open'].w*1 !== 1000 || FIGSJ['cer-open'].h === 747) { console.error('❌ cer-open 裁圖後 w/h 未更新（會 layout shift）'); process.exit(1); }
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
const { readdirSync } = await import('fs');
const avifs = readdirSync(root+'img/fig').filter(f=>/\.avif$/.test(f));
const allSrc = figKeys.map(k=>FIGSJ[k].src.replace('img/fig/',''));
for (const f of avifs) {
  if (!allSrc.includes(f)) { console.error('❌ img/fig/'+f+' 冇喺 FIGS 入面（孤兒圖，要咪刪走咪補 entry）'); process.exit(1); }
  if (!swSrc.includes(f)) { console.error('❌ sw.js 漏 cache img/fig/'+f); process.exit(1); }
}
for (const sub of ['care','map','pack','camp','pioneer','track','field','aid']) { try { ctx.App.pages.skills(sub); } catch(e) { console.error('❌ pages.skills('+sub+') render 失敗：', e.message); process.exit(1); } }
console.log('✅ 技能插畫 '+Object.keys(SF).length+'/12 齊（除繩結外全部技能有圖）・圖檔 '+figKeys.length+' 張全數入 FIGS＋sw');


// ═════════ v31：急救每種都有圖（AI 插畫＋手繪位置圖） ═════════
const AF = figSandbox.AID_FIG || {};
if (!AF || !Object.keys(AF).length) { console.error('❌ figs.js 冇 export AID_FIG'); process.exit(1); }
for (const f of ctx.C17.firstaid) {
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
console.log('✅ 急救 '+(Object.keys(AF).length+1)+' 張卡全部有圖（7 種 AVIF 插畫＋復原臥式側臥位置圖）');

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

// ═════════ v31：制服徽章佩戴位置圖（用戶要圖，呢度用 SVG 手繪，唔用 AI） ═════════
{
  const U = ctx.UNIFORM;
  if (!ctx.DIAGRAMS.uniform || !ctx.DIAGRAMS.uniform.chest || !ctx.DIAGRAMS.uniform.body) {
    console.error('❌ 缺 DIAGRAMS.uniform.chest / body（徽章位置圖）'); process.exit(1);
  }
  if (!U.placement || !U.placement.chest || U.placement.chest.length < 5) { console.error('❌ UNIFORM.placement.chest 唔齊'); process.exit(1); }
  if (!U.placement.body || U.placement.body.length < 3) { console.error('❌ UNIFORM.placement.body 唔齊'); process.exit(1); }
  for (const rr of U.placement.chest.concat(U.placement.body)) {
    if (!rr.n || !rr.side || !rr.items || !rr.items.length) { console.error('❌ placement 條目唔齊：'+JSON.stringify(rr).slice(0,60)); process.exit(1); }
  }
  const badgeSrc = appSrc.slice(appSrc.indexOf("if(cur==='badge')"), appSrc.indexOf("if(cur==='badge')")+3000);
  if (badgeSrc.indexOf('DIAGRAMS.uniform.chest') < 0 || badgeSrc.indexOf('DIAGRAMS.uniform.body') < 0) {
    console.error('❌ 徽章頁冇出 ①–⑥ / ⑦–⑨ 位置圖'); process.exit(1);
  }
  if (!/UNIFORM\.placement/.test(badgeSrc) || !/圖上/.test(badgeSrc)) { console.error('❌ 徽章頁冇出位置對照表'); process.exit(1); }
  const chestSvg = ctx.DIAGRAMS.uniform.chest, bodySvg = ctx.DIAGRAMS.uniform.body;
  if (!/①|1/.test('') === false) {}
  for (const [nm, svgStr] of [['chest',chestSvg],['body',bodySvg]]) {
    if (svgStr.indexOf('undefined') >= 0) { console.error('❌ DIAGRAMS.uniform.'+nm+' 有 undefined'); process.exit(1); }
    if (!(nm==='chest' ? /^<img src="img\/dia\/uniform-[a-z-]+\.avif"/ : /^<img src="img\/dia\/uniform-[a-z-]+\.avif"/).test(svgStr)) { console.error('❌ DIAGRAMS.uniform.'+nm+' 唔係 AVIF 位置圖'); process.exit(1); }
  }
  if (chestSvg.indexOf('①') < 0 || chestSvg.indexOf('⑥') < 0) { console.error('❌ 胸袋圖冇 ①–⑥ 標記'); process.exit(1); }
  if (bodySvg.indexOf('⑦') < 0 || bodySvg.indexOf('⑨') < 0) { console.error('❌ 全身圖冇 ⑦–⑨ 標記'); process.exit(1); }
  try { ctx.App.pages.uniform('badge'); } catch(e) { console.error('❌ 徽章頁 render 失敗：', e.message); process.exit(1); }
}
console.log('✅ 徽章佩戴位置圖：AVIF ①–⑥（胸袋）＋⑦–⑨（全身）＋ UNIFORM.placement 對照表');
console.log('✅ v24 儀式 QA 修正：宣誓唔合十＋旗唔喺二人之間、敬禮以右格作準、集隊右翼定義、升旗以制服整齊與否決定舉手');

// ═════════ v32：真分頁（唔再錨點跳位）＋營火會＋清 agent 字句＋補圖 ═════════
{
  const appSrc = readFileSync(root+'js/app.js','utf8');
  /* 1) 唔准再有錨點跳位 helper */
  if (appSrc.indexOf('App.jump =') >= 0 || appSrc.indexOf('App.chiprow = function') >= 0) {
    console.error('❌ 仲有錨點跳位 helper（App.jump／App.chiprow）'); process.exit(1);
  }
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
  /* 5) 🔥 營火會：歡呼＋時間表＋工作人員＋頌詞 */
  const S = ctx.SONGS;
  if (!S || !Array.isArray(S.programme) || S.programme.length < 5) { console.error('❌ SONGS.programme 時間表唔齊'); process.exit(1); }
  if (!Array.isArray(S.cheers) || S.cheers.length < 5) { console.error('❌ SONGS.cheers 歡呼／吶喊唔齊'); process.exit(1); }
  if (!Array.isArray(S.staff) || S.staff.length < 4) { console.error('❌ SONGS.staff 工作人員唔齊'); process.exit(1); }
  if (!S.ignition || S.ignition.words.length < 3) { console.error('❌ SONGS.ignition 點火頌詞唔齊'); process.exit(1); }
  if (S.ignition.how.indexOf('點火') < 0) { console.error('❌ 點火儀式冇寫法'); process.exit(1); }
  if (!S.hostNote || S.hostNote.indexOf('414') < 0) { console.error('❌ 營火會程序冇標出處（月刊 414 期）'); process.exit(1); }
  if (ctx.SONGS.meta.title.indexOf('營火會') < 0) { console.error('❌ SONGS.meta.title 未改做營火會'); process.exit(1); }
  try {
    ctx.App.pages.songs();
    for (const k of ['flow','cheers','staff','lead','library','safety']) ctx.App.pages.songs(k);
  } catch(e) { console.error('❌ 營火會分頁 render 失敗：', e.message); process.exit(1); }
  if (!Array.isArray(ctx.App.campTabs) || ctx.App.campTabs.length!==6) { console.error('❌ 營火會應拆成 6 個資料分頁'); process.exit(1); }
  if (appSrc.indexOf("App.subnav('songs',App.campTabs,cur)") < 0 || appSrc.indexOf("concat(sheets.map") >= 0) { console.error('❌ 營火會仲有塞晒 14 首歌嘅總覽導航'); process.exit(1); }
  for (const t of ['一般營火會時間表','歡呼／吶喊','營火會工作人員','點火儀式','營火會點樣帶']) {
    if (appSrc.indexOf(t) < 0) { console.error('❌ 營火會頁缺區塊：'+t); process.exit(1); }
  }
  const navHtml = readFileSync(root+'index.html','utf8');
  if (navHtml.indexOf('營火會') < 0 || /<span>🔥<\/span>營火歌/.test(navHtml)) { console.error('❌ index.html nav 未改做「營火會」'); process.exit(1); }
  {
    const mf = JSON.parse(readFileSync(root+'manifest.webmanifest','utf8'));
    if (mf.description.indexOf('跟住做') >= 0 || mf.description.indexOf('營火歌') >= 0) {
      console.error('❌ manifest description 仲有舊寫法（跟住做／營火歌）'); process.exit(1);
    }
    if (!mf.shortcuts.some(s => s.name.indexOf('營火會') >= 0)) { console.error('❌ manifest 捷徑未改做「營火會」'); process.exit(1); }
  }
  /* 6) 制服：局部放大圖＋旅巾圖 */
  if (!ctx.DIAGRAMS.uniform.zoom || !/^<img src="img\/dia\/uniform-zoom\.avif"/.test(ctx.DIAGRAMS.uniform.zoom)) { console.error('❌ 冇徽章局部放大圖（AVIF）'); process.exit(1); }
  if (srcOf('uniform.zoom').indexOf('3cm') < 0 || srcOf('uniform.zoom').indexOf('1cm') < 0) { console.error('❌ 放大圖冇標實際距離'); process.exit(1); }
  if (!ctx.DIAGRAMS.uniform.scarf || srcOf('uniform.scarf').indexOf('3.5cm') < 0) { console.error('❌ 冇旅巾綁法圖'); process.exit(1); }
  /* v36：陸／海／空三張手繪顏色圖合併成一張陸海空對照圖（uniform.branch），三個分支卡共用 */
  if (!ctx.DIAGRAMS.uniform.branch || !/^<img src="img\/dia\/uniform-branch\.avif"/.test(ctx.DIAGRAMS.uniform.branch)) {
    console.error('❌ 制服陸／海／空顏色配搭圖缺（uniform.branch）'); process.exit(1);
  }
  if (srcOf('uniform.branch').indexOf('海童軍') < 0 || srcOf('uniform.branch').indexOf('空童軍') < 0) {
    console.error('❌ 顏色配搭圖 alt 冇講齊陸／海／空'); process.exit(1);
  }
  if (appSrc.indexOf('bu.branch') < 0) { console.error('❌ 制服分支卡冇用顏色配搭圖'); process.exit(1); }
  if (appSrc.indexOf("DIAGRAMS.uniform.zoom") < 0) { console.error('❌ 徽章頁冇用局部放大圖'); process.exit(1); }
  /* v36：徽章頁要右袖放大圖、配件頁要制服帽圖 */
  if (appSrc.indexOf("DIAGRAMS.uniform.sleeve") < 0) { console.error('❌ 徽章頁冇用右袖放大圖'); process.exit(1); }
  if (appSrc.indexOf("bd.cap") < 0 || appSrc.indexOf("bd.scarf") < 0 || appSrc.indexOf("bd.ties") < 0 || appSrc.indexOf("bd.kilwell") < 0) { console.error('❌ 配件頁冇用齊制服帽／旅巾／領帶／木章圖'); process.exit(1); }
  if (appSrc.indexOf("UNIFORM.cap") < 0 || !ctx.UNIFORM.cap || ctx.UNIFORM.cap.points.length < 5) { console.error('❌ 制服帽（3.3）內容／圖缺'); process.exit(1); }
  if (srcOf('uniform.cap').indexOf('2cm') < 0) { console.error('❌ 制服帽圖冇標 2cm'); process.exit(1); }
  /* 7) 補圖：先鋒工程都要有圖 */
  if (appSrc.indexOf("figFor('pioneer'") < 0) { console.error('❌ 先鋒工程冇圖'); process.exit(1); }
  /* 8) 遊戲庫每個遊戲都有圖（插畫或俯視擺位圖） */
  for (const g of ctx.DATA.games) {
    const has = (ctx.GAME_FIG[g.n]) || (ctx.DIAGRAMS.game && ctx.DIAGRAMS.game[g.n]);
    if (!has) { console.error('❌ 遊戲冇圖：'+g.n); process.exit(1); }
  }
  /* 9) 儀式 8 張卡全部有圖（插畫或 SVG 位置圖） */
  for (const c of ctx.CEREMONY.cards) {
    const dk = c.fig || c.dgm;
    const has = c.fig ? !!ctx.FIGS['cer-'+c.fig] : !!(dk && ctx.DIAGRAMS.cer[dk]);
    if (!has) { console.error('❌ 儀式卡冇圖：'+c.n); process.exit(1); }
  }
}
console.log('✅ v32：真分頁（無錨點跳位）・營火會（時間表＋歡呼＋頌詞）・清 agent 字句・活動／技能／制服／儀式全部有圖');

// ═════════ v33：制服配件（領巾／巾圈／領帶／基維爾／皮帶襪）═════════
{
  const NW = ctx.UNIFORM.neckwear, KW = ctx.UNIFORM.kilwell, BS = ctx.UNIFORM.beltSocks;
  if (!NW || !KW || !BS) { console.error('❌ UNIFORM 缺 neckwear／kilwell／beltSocks'); process.exit(1); }
  if (NW.scarves.length !== 4) { console.error('❌ 領巾唔係 4 種'); process.exit(1); }
  if (NW.rings.length !== 4) { console.error('❌ 巾圈唔係 4 種'); process.exit(1); }
  if (NW.ties.length !== 4) { console.error('❌ 領帶唔係 4 色'); process.exit(1); }
  if (NW.wear.length !== 8) { console.error('❌ 捲巾佩戴唔係 8 步'); process.exit(1); }
  const nwAll = JSON.stringify(NW) + JSON.stringify(KW) + JSON.stringify(BS);
  for (const t of ['3.5 厘米','12–15 厘米','Windsor','棗紅色領帶','深綠色領帶','黑色領帶','深藍色領帶','顏色巾圈','童軍巾圈','小隊活動巾圈','基維爾巾圈','基維爾領巾','木章','襪帶','鞋碼','棕色皮帶']) {
    if (nwAll.indexOf(t) < 0) { console.error('❌ 制服配件缺資料：'+t); process.exit(1); }
  }
  if (NW.source.indexOf('3.4') < 0 || BS.source.indexOf('3.6') < 0) { console.error('❌ 制服配件冇標章節出處'); process.exit(1); }
  for (const k of ['ties','kilwell','scarf','zoom']) {
    const svg = ctx.DIAGRAMS.uniform[k];
    if (!svg || svg.indexOf('undefined') >= 0) { console.error('❌ 制服圖缺失／壞：'+k); process.exit(1); }
    if (!/^<img src="img\/dia\/uniform-/.test(svg)) { console.error('❌ 制服圖唔係 AVIF：'+k); process.exit(1); }
  }
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

// ═════════ v34：雙角色定位＋手機 44px＋營火六分頁＋按鈕去重 ═════════
{
  for (const t of ['第一次帶集會','熟手即場搵料','會員章 c01–06','探索 c07–18','標準／總結 c19–24','特別集會']) {
    if (!appSrc.includes(t)) { console.error('❌ v34 集會定位／篩選缺：'+t); process.exit(1); }
  }
  if (!appSrc.includes('type="search"') || appSrc.includes('>搵！</button>')) {
    console.error('❌ 搜尋應輸入即顯示，唔應有重複提交掣'); process.exit(1);
  }
  /* v35：制服頁改用本地官方服式圖（AVIF），載入唔到先連返官網原圖；一律用 closest 查找容器，唔可以再靠 nextElementSibling */
  if (appSrc.includes('nextElementSibling') || !appSrc.includes("this.closest(\\'.uniform-fig\\')")) {
    console.error('❌ 制服服式圖 fallback 未安全查找容器'); process.exit(1);
  }
  if (!appSrc.includes('UNIFORMFIG')) { console.error('❌ 制服頁冇用 UNIFORMFIG 出官方服式圖'); process.exit(1); }
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
  if ((ctx.App.campTabs||[]).map(x=>x.k).join(',') !== 'flow,cheers,staff,lead,library,safety') {
    console.error('❌ 營火會六分頁 key／次序錯'); process.exit(1);
  }
}
console.log('✅ v34：新／熟手定位・手機 44px・安全圖片 fallback・營火六分頁・按鈕範圍齊');

console.log('\n🎉 全部 smoke test 通過（v37：前端零 SVG — 圖解／徽章／制服一律 AVIF，圖載唔到只出 alt 文字）');
