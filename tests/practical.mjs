import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const mem={},els={};
const element=()=>({innerHTML:'',className:'',style:{},value:'',checked:false,classList:{toggle(){},add(){},remove(){}},setAttribute(){},removeAttribute(){}});
const ctx={console,localStorage:{getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=String(v);}},location:{hash:'#plan'},navigator:{onLine:true},document:{getElementById:id=>els[id]??=element(),querySelectorAll:()=>[],body:element(),documentElement:element()},setTimeout:()=>{},clearTimeout(){},setInterval:()=>1,clearInterval(){},addEventListener(){},scrollTo(){},print(){}};ctx.window=ctx;vm.createContext(ctx);
let jungleBefore,beforePlain;
for(const file of ['data','jungle-data','practical-data','guide','flow','app','redesign','content','jungle','practical','uniform-ceremony','field-visuals','salute-lab','salute-positions','tracking-kit','material-desk','plain-content','worksheet-guides','exam-papers']){
 if(file==='practical-data')jungleBefore=JSON.stringify(ctx.DATA.meetings.filter(m=>['c26','c27'].includes(m.tid)));
 if(file==='plain-content')beforePlain=JSON.parse(JSON.stringify({meetings:ctx.DATA.meetings,facts:ctx.DATA.facts,ceremonies:ctx.Ceremony.items,followup:ctx.DATA.followupContent,stored:mem}));
 vm.runInContext(fs.readFileSync(`js/${file}.js`,'utf8'),ctx);
 if(file==='plain-content')assert.equal(JSON.stringify(mem),JSON.stringify(beforePlain.stored),'copy layer load has no storage writes');
}
assert.equal(JSON.stringify(ctx.DATA.meetings.filter(m=>['c26','c27'].includes(m.tid))),jungleBefore,'forest lesson content stays unchanged');
const {DATA,App,Practical,Followup,Flow}=ctx;
const ms=DATA.meetings.filter(m=>m.practical);assert.equal(ms.length,25);
for(const m of ms){const p=m.practical;for(const k of ['opening','distribute','confused','quiet','few','missing','sourceNote'])assert(p[k]?.length>10,`${m.tid}: ${k}`);assert.equal(p.short.steps.reduce((sum,s)=>sum+s.minutes,0),30);assert(p.short.boundary);assert.equal(p.qa.length,2);for(const q of p.qa)assert(q.q&&q.a);assert(App.vMeetDetail(m).includes('實戰帶領包'));}
assert.equal(new Set(ms.map(m=>m.practical.missing)).size,25,'fallbacks are authored per meeting');
assert(DATA.meetings.find(m=>m.tid==='c14').segs[1].how.includes('1908'));
let html='';ctx.Modal.open=h=>{html=h;};App.prepare('c07');const storedBefore=mem.cub_flow;
for(const m of ms){Practical.open(m.tid);assert(html.includes(m.practical.confused));Practical.quiz(m.tid);assert(html.includes(m.practical.qa[0].q));assert(!html.includes(m.practical.qa[0].a));Practical.reveal();assert(html.includes(m.practical.qa[0].a));Practical.next(99);assert.equal(Practical.reader.index,1);assert(!Practical.reader.reveal);Practical.next(-99);assert.equal(Practical.reader.index,0);}
assert.equal(ctx.curTid(),'c07');assert.equal(mem.cub_flow,storedBefore,'reading does not change preparation');
Practical.deck('troop');assert(html.includes('尚未填寫'));Practical.editTroop();
for(const [key] of Practical.troopFields)ctx.document.getElementById('troop-'+key).value=key==='number'?'<img src=x onerror=alert(1)>':'測試'+key;
assert(Practical.saveTroop());assert(html.includes('&lt;img'));assert(!html.includes('<img src=x'));
assert.equal(ctx.Store.get('troopProfile',{}).district,'測試district');
Practical.printDeck('history',false);assert(html.includes('1907年'));assert(!html.includes('進行實驗露營，透過戶外活動及小隊生活學習。'));
Practical.printDeck('history',true);assert(html.includes('進行實驗露營，透過戶外活動及小隊生活學習。'));
Practical.print('c07');assert.equal(ctx.PackPrint.activeTid,null);assert.equal(mem.cub_flow,storedBefore);
assert(!Followup.validDate('2026-02-30'));assert(Followup.validDate('2028-02-29'));assert(!Followup.validDate('2026-2-3'));assert(!Followup.validDate('hello'));
Followup.open('c24');ctx.document.getElementById('followup-date').value='2026-02-30';assert.equal(Followup.save('c24'),false);assert(!mem.cub_followupNotes);
ctx.document.getElementById('followup-date').value='2026-09-18';ctx.document.getElementById('followup-note').value='<script>alert(1)</script>';ctx.document.getElementById('followup-reviewed').checked=true;
assert(Followup.save('c24'));assert.equal(Followup.read('c24').due,'2026-09-18');assert(Followup.read('c24').reviewed);
Followup.open('c24');assert(html.includes('&lt;script&gt;'));assert(!html.includes('<script>alert'));
assert.equal(ctx.curTid(),'c07');assert.equal(mem.cub_flow,storedBefore);
const set=ctx.localStorage.setItem;ctx.localStorage.setItem=()=>{throw new Error('quota');};assert.equal(Followup.save('c24'),false);assert.equal(Practical.saveTroop(),false);ctx.localStorage.setItem=set;
assert(typeof App.vTrack==='undefined');assert(App.vBook().includes('文字材料'));
console.log('PRACTICAL PASS: 25 field packs, 50 Q&As, deck answers, escaped local data, follow-up dates, storage errors and no progress side effects');

const {SessionPack}=ctx;
for(const n of [0,-1,1.5,101,NaN,Infinity,'x'])assert.equal(SessionPack.copies(n),null);
for(const m of ms){
 const all=SessionPack.build(m,2,true),leader=SessionPack.build(m,2,false);
 for(const seg of m.segs){for(const step of seg.steps)assert(all.includes(ctx.esc(step)),m.tid+' complete steps');assert(all.includes(ctx.esc(seg.safety)));}
 assert.equal((all.match(/class="psheet worksheet"/g)||[]).length,2);
 assert.equal((all.match(/class="psheet worksheet family-sheet"/g)||[]).length,DATA.followupContent[m.tid]?2:0);
 assert(!leader.includes('class="psheet worksheet'));assert(!leader.includes('以下才派給成員'));
 const childPart=all.split('以下才派給成員')[1];assert(!childPart.includes('leader-sheet'));assert(!childPart.includes('｜短講及答案'));
 assert(all.includes(ctx.esc(m.gap)));assert(!all.includes('<script>alert'));
 assert(!all.includes('&lt;script&gt;'),'private follow-up note not printed for families');
 for(const k of m.practical.decks||[])assert(all.includes(ctx.esc(Practical.getDeck(k).brief)));
}
SessionPack.open('c24');ctx.document.getElementById('session-copies').value='1.5';ctx.document.getElementById('session-children').checked=true;
assert.equal(SessionPack.preview('c24'),false);
ctx.document.getElementById('session-copies').value='2';assert(SessionPack.preview('c24'));assert.equal(ctx.PackPrint.activeTid,'c24');ctx.PackPrint.confirmDone();
assert.equal(ctx.curTid(),'c07');assert.equal(mem.cub_flow,storedBefore,'preview/other-meeting confirmation does not alter current preparation');
SessionPack.overview();assert.equal((html.match(/開完整出隊包/g)||[]).length,25);
console.log('SESSION PACK PASS: all 25 complete scripts and safety, answer separation, exact copies, family handouts, privacy, validation, no progress side effects');

assert.equal(ctx.FormalKit.cards.length,4);
for(const c of ctx.FormalKit.cards){assert(c.scope&&c.items.length>=4);ctx.FormalKit.open(c.id);assert(html.includes(ctx.FormalKit.sources[c.source]));ctx.FormalKit.print(c.id);assert.equal(ctx.PackPrint.activeTid,null);assert(html.includes(c.title));}
const c04=DATA.meetings.find(m=>m.tid==='c04');
const formalPacket=ctx.SessionPack.build(c04,1,true),parts=formalPacket.split('<section class="psheet divider">');
for(const c of ctx.FormalKit.cards){assert(parts[0].includes(c.title));assert(!parts[1].includes(c.title));}
assert(ctx.FormalKit.panel().includes('正式程序仍須完成'));
assert(ctx.FormalKit.panel().includes('圖片按安排後補'));
assert.equal(ctx.curTid(),'c07');assert.equal(mem.cub_flow,storedBefore);
console.log('FORMAL KIT PASS: sourced factual aids, c04 leader-only placement, independent print, required unfinished scope explicit');

const {Uniform,Ceremony}=ctx;
assert.equal(Uniform.places.length,6);
assert.equal(Ceremony.items.length,6);
for(const q of Uniform.places)assert(q.id&&q.n&&q.items.length&&q.answer);
Uniform.startQuiz();assert(!html.includes(Uniform.places[0].answer));Uniform.reveal();assert(html.includes(Uniform.places[0].answer));Uniform.next(99);assert.equal(Uniform.quiz.index,5);assert(!Uniform.quiz.answer);Uniform.next(-99);assert.equal(Uniform.quiz.index,0);
const pupil=Uniform.sheets(false),teacher=Uniform.sheets(true);
assert(pupil.includes('穿著者右'));assert(pupil.includes('穿著者左'));
assert(!pupil.includes(Uniform.places[0].answer));assert(teacher.includes(Uniform.places[0].answer));
assert(Uniform.scarfText().includes('3.5厘米'));assert(Uniform.checkText().includes('仍可視作整齊制服'));
for(const c of Ceremony.items){assert(c.steps.length>=4&&c.prep&&c.scope);assert(Ceremony.sources[c.source]);Ceremony.open(c.id);assert.equal(Ceremony.reader.index,0);assert(html.includes(ctx.esc(c.steps[0][1])));Ceremony.move(99);assert.equal(Ceremony.reader.index,c.steps.length-1);Ceremony.move(-99);assert.equal(Ceremony.reader.index,0);const sheets=Ceremony.sheets(c.id);for(const s of c.steps)for(const x of s)assert(sheets.includes(ctx.esc(x)));Ceremony.print(c.id);assert.equal(ctx.PackPrint.activeTid,null);}
assert(Ceremony.get('howl').scope.includes('不混作同一要求'));
assert(Ceremony.get('howl').steps.some(s=>s[2].includes('未宣誓')));
assert(Ceremony.get('investiture').steps.some(s=>s[1]===DATA.facts.promise.join(' ')));
const materialPack=ctx.SessionPack.build(c04,3,true),materialLeader=materialPack.split('<section class="psheet divider">')[0];
assert.equal((materialPack.match(/class="psheet uniform-task"/g)||[]).length,3);
assert(!ctx.SessionPack.build(c04,3,false).includes('class="psheet uniform-task"'));
for(const k of ['commands','salutes','howl','unfurl'])assert(materialLeader.includes(Ceremony.get(k).title));
assert(ctx.SessionPack.build(DATA.meetings.find(m=>m.tid==='c02'),1,false).includes(Ceremony.get('investiture').title));
App.activity('c04',1);assert(html.includes('制服圖解與配對'));
assert.equal(ctx.curTid(),'c07');assert.equal(mem.cub_flow,storedBefore);
assert.equal(DATA.meetings.length,27);assert.equal(ms.reduce((n,m)=>n+m.segs.length,0),125);
console.log('UNIFORM & CEREMONY PASS: diagrams, answer isolation, six readers, source/version boundaries, child copies, packet integration, no preparation/award effects');

const {FieldVisuals}=ctx;
const fieldBefore=JSON.stringify(mem),fieldTid=ctx.curTid();
assert.equal(FieldVisuals.refs.length,2);
for(const r of FieldVisuals.refs){assert(fs.existsSync(r.file));assert(fs.statSync(r.file).size<120*1024);assert(fs.readFileSync('sw.js','utf8').includes(r.file));assert(r.original.startsWith('https://www.scout.org.hk/uploads/member/Cub_'));assert(r.alt.includes('幼童軍'));}
FieldVisuals.reference();assert(html.includes('圖片：香港童軍總會'));assert(html.includes('放大男款圖'));assert(html.includes('放大女款圖'));
FieldVisuals.zoom('girl');assert(html.includes('cub-uniform-girl.avif'));FieldVisuals.zoom('bad');
FieldVisuals.formation();assert(html.includes('A 亞基拿'));assert(html.includes('值日小隊長'));assert(html.includes('不是正式尺寸圖'));
for(const fn of ['printReference','printFormation']){FieldVisuals[fn]();assert.equal(ctx.PackPrint.activeTid,null);assert(!html.includes('已完成考驗'));}
const fieldPacket=SessionPack.build(Practical.meeting('c04'),2,true),fieldParts=fieldPacket.split('以下才派給成員');
assert(fieldParts[0].includes('uniform-reference-sheet'));assert(fieldParts[0].includes('formation-sheet'));assert(fieldParts[0].includes('role-cards'));
assert(!fieldParts[1].includes('uniform-reference-sheet'));assert(!fieldParts[1].includes('role-cards'));
assert.equal((ctx.Uniform.sheets(false).match(/class="psheet/g)||[]).length,1);
assert(FieldVisuals.sourceNote('howl').includes('2025比賽表'));assert.equal(FieldVisuals.sourceNote('invalid'),'');
/* 官方圖／真實相片：只用官方或政府來源；唔准自繪制服 */
assert.equal(FieldVisuals.official.length,2);
for(const o of FieldVisuals.official){assert(fs.existsSync(o.file),o.id+' file');assert(fs.statSync(o.file).size<120*1024,o.id+' size');assert(fs.readFileSync('sw.js','utf8').includes(o.file),o.id+' precached');assert(o.original.startsWith('https://'),o.id+' original url');assert(o.page.url.startsWith('https://'),o.id+' page url');assert(o.alt.length>25&&o.limit.length>20&&o.use.length>15,o.id+' photo/limit copy');assert(!/自繪|AI/.test(o.credit),o.id+' credit must be a real source, not own artwork');}
const officialFigure=FieldVisuals.officialFigure('badgemap');
assert(officialFigure.includes('cub-badge-map-2025.avif')&&officialFigure.includes('香港童軍總會'), '官方圖卡連檔名同出處');
assert(officialFigure.includes('唔等於車縫尺寸'), '官方圖卡寫明唔等於車縫尺寸');
assert(FieldVisuals.officialFigure('nope')==='', '唔存在的圖唔會渲染空圖');
html='';
FieldVisuals.officialZoom('badgemap');assert(html.includes('cub-badge-map-2025.avif')&&html.includes('唔等於車縫尺寸'), '放大圖同樣帶出處同限制');
html='';FieldVisuals.officialZoom('nope');assert.equal(html,'', '唔存在的圖唔會開模態');
FieldVisuals.printOfficial();assert.equal(ctx.PackPrint.activeTid,null);assert(html.includes('leader-sheet'), '官方圖只用領袖紙印');
assert(App.vUniform().includes('cub-badge-map-2025.avif'), '制服頁貼官方位置圖');
assert(App.vCeremony().includes('rally-flag-party-2025.avif'), '儀式頁貼真實大會操相片');
html='';Uniform.open();assert(html.includes('cub-badge-map-2025.avif'), '制服教學包入面有官方圖');
assert(!Uniform.sheets(false).includes('cub-badge-map-2025.avif'), '成員題紙唔貼官方位置圖（會漏答案）');
assert(Uniform.sheets(true).includes('cub-badge-map-2025.avif'), '領袖紙有官方位置圖核對');
assert.equal(JSON.stringify(mem),fieldBefore);assert.equal(ctx.curTid(),fieldTid);
console.log('FIELD VISUALS PASS: credited local images, cache/size checks, original formation and role cards, teacher-only insertion, zoom/invalid id, independent print and state isolation.');

const {SaluteLab}=ctx,saluteBefore=JSON.stringify(mem),saluteTid=ctx.curTid();
assert.equal(SaluteLab.questions.length,4);assert(fs.statSync(SaluteLab.image).size<120*1024);assert(fs.readFileSync('sw.js','utf8').includes(SaluteLab.image));
SaluteLab.open();assert(html.includes('AI輔助生成'));assert(html.includes('不是兩指狼禮'));assert(html.includes('右眼對上'));
SaluteLab.start();assert(!html.includes('class="field-answer"'));
for(let i=0;i<4;i++){SaluteLab.reader.index=i;SaluteLab.reader.reveal=false;SaluteLab.render();assert(html.includes(ctx.esc(SaluteLab.questions[i].q)));assert(!html.includes(ctx.esc(SaluteLab.questions[i].a)));SaluteLab.reveal();assert(html.includes(ctx.esc(SaluteLab.questions[i].a)));}
SaluteLab.move(-100);assert.equal(SaluteLab.reader.index,0);assert(!SaluteLab.reader.reveal);SaluteLab.move(100);assert.equal(SaluteLab.reader.index,3);SaluteLab.move(NaN);assert.equal(SaluteLab.reader.index,3);SaluteLab.start();assert.equal(SaluteLab.reader.index,0);
for(const q of SaluteLab.questions){assert(!SaluteLab.sheets(false).includes(ctx.esc(q.a)));assert(SaluteLab.sheets(true).includes(ctx.esc(q.a)));}
for(const teacher of [false,true]){SaluteLab.print(teacher);assert.equal(ctx.PackPrint.activeTid,null);}
for(const tid of ['c02','c04']){const pack=SessionPack.build(Practical.meeting(tid),2,true).split('以下才派給成員');assert(pack[0].includes('salute-guide'));assert(pack[0].includes('salute-answers'));assert(!pack[1].includes('salute-answers'));assert(!pack[1].includes('salute-task'));}
assert(!SessionPack.build(Practical.meeting('c03'),2,true).includes('salute-guide'));
assert.equal(JSON.stringify(mem),saluteBefore);assert.equal(ctx.curTid(),saluteTid);
console.log('SALUTE LAB PASS: reviewed image provenance, four scenarios, reveal/reset/bounds, separated pupil sheet, leader packet integration and no state effects.');

const {SalutePositions}=ctx,positionsBefore=JSON.stringify(mem),positionsTid=ctx.curTid();
assert(SalutePositions.svg(false).includes('全禮：食指在右眼對上'));
assert(SalutePositions.svg(true).includes('半禮：手在肩高'));
assert(SalutePositions.note().includes('不代表手形或只伸一指'));
assert(SalutePositions.note().includes('半禮的肘位僅示意'));
SalutePositions.open();assert(html.includes('人物本人的右側'));assert(html.includes('2026第五章'));
SalutePositions.print();assert.equal(ctx.PackPrint.activeTid,null);
assert.equal((SaluteLab.sheets(true).match(/class="psheet/g)||[]).length,3);
assert(!SaluteLab.sheets(false).includes('salute-position-sheet'));
for(const tid of ['c02','c04']){const parts=SessionPack.build(Practical.meeting(tid),2,true).split('以下才派給成員');assert.equal((parts[0].match(/salute-position-sheet/g)||[]).length,1);assert(!parts[1].includes('salute-position-sheet'));assert(Practical.meeting(tid).bag.includes('三指手形、敬禮位置及答案（A4共3張）'));}
assert.equal(JSON.stringify(mem),positionsBefore);assert.equal(ctx.curTid(),positionsTid);
console.log('SALUTE POSITIONS PASS: explicit observer orientation, hand/height limits, single leader insert, updated materials, pupil separation and print/state isolation.');

const {TrackingKit}=ctx,trackingBefore=JSON.stringify(mem),trackingTid=ctx.curTid();
assert.equal(TrackingKit.items.length,6);assert.equal(new Set(TrackingKit.items.map(s=>s.key)).size,6);
assert(TrackingKit.scope.includes('馬耳他'), 'scope 要講明圖形屬自繪');
/* 六個符號名已核對官方《幼童軍獎章—追蹤》工作紙；官方共十個，未收四個要講明 */
assert(TrackingKit.scope.includes('《幼童軍獎章—追蹤》'), 'scope 要引用官方工作紙名');
for (const n of TrackingKit.items.map(x=>x.name)) assert(TrackingKit.scope.includes(n), 'scope 要列出已核名稱「'+n+'」');
for (const n of ['繼續前進','前面有水','前面有障礙','我們分途前進']) assert(TrackingKit.scope.includes(n), 'scope 要講明未收「'+n+'」');
assert(!TrackingKit.scope.includes('仍待逐圖比對'), '名稱已核對，唔好再寫「仍待比對」');
assert(TrackingKit.sources.hk.includes('TrackingSigns.pdf'), '要有官方追蹤工作紙連結');
assert(TrackingKit.items[4].answer.includes('不代表可以自己離場回家'));
assert(TrackingKit.items[5].answer.includes('不是固定米數'));
TrackingKit.open();assert(html.includes('三站'));
/* scope 話「開下面連結」，連結就要真係喺 open() 入面 render 到 */
assert(TrackingKit.open.toString().includes('TrackingKit.sources.hk'), 'open() 要 render 官方連結');
assert(TrackingKit.scope.includes('開下面'), '連結喺 note() 之後，措辭要寫「下面」');
assert(!TrackingKit.open.toString().includes('仍待逐圖比對'), 'extBtn 副題唔好再用舊句');TrackingKit.start();assert(!html.includes('class="field-answer"'));
for(let i=0;i<6;i++){TrackingKit.reader.index=i;TrackingKit.reader.reveal=false;TrackingKit.render();assert(!html.includes(ctx.esc(TrackingKit.items[i].answer)));TrackingKit.reveal();assert(html.includes(ctx.esc(TrackingKit.items[i].answer)));}
TrackingKit.move(-99);assert.equal(TrackingKit.reader.index,0);assert(!TrackingKit.reader.reveal);TrackingKit.move(99);assert.equal(TrackingKit.reader.index,5);TrackingKit.move(NaN);assert.equal(TrackingKit.reader.index,5);TrackingKit.start();assert.equal(TrackingKit.reader.index,0);
for(const mode of ['cards','guide','worksheet']){const sheet=TrackingKit.sheets(mode);assert.equal((sheet.match(/class="tracking-symbol"/g)||[]).length,6);for(const item of TrackingKit.items)assert.equal(sheet.includes(ctx.esc(item.answer)),mode==='guide');TrackingKit.print(mode);assert.equal(ctx.PackPrint.activeTid,null);}
assert.equal(TrackingKit.sheets('bad'),'');const priorTrackingHTML=html;TrackingKit.print('bad');assert.equal(html,priorTrackingHTML);
for(const n of [1,2,25]){const pack=SessionPack.build(Practical.meeting('c18'),n,true),parts=pack.split('以下才派給成員');assert.equal((parts[0].match(/tracking-guide/g)||[]).length,1);assert(!parts[0].includes('tracking-cards'));assert(!parts[1].includes('tracking-guide'));assert.equal((parts[1].match(/tracking-cards/g)||[]).length,1);assert.equal((pack.match(/class="psheet worksheet"/g)||[]).length,n);assert(!pack.includes('tracking-worksheet'));}
assert(!SessionPack.build(Practical.meeting('c18'),2,false).includes('tracking-cards'));
assert(!SessionPack.build(Practical.meeting('c17'),2,true).includes('tracking-guide'));
assert.equal(JSON.stringify(mem),trackingBefore);assert.equal(ctx.curTid(),trackingTid);
console.log('TRACKING KIT PASS: six source-described shapes, limits/safety, reveal/bounds, separate answers, one shared card set, pupil counts and state isolation.');

const {MaterialDesk}=ctx,deskBefore=JSON.stringify(mem),deskTid=ctx.curTid();
assert.equal(MaterialDesk.kits.length,8);
for(const bad of [undefined,{}, {ids:[]},{ids:['no-such-kit']}])assert(MaterialDesk.build(bad).error);
for(const n of [0,-1,1.5,101,null,'',NaN,Infinity])assert(MaterialDesk.build({ids:['tracking'],copies:n,groups:1}).error);
assert(MaterialDesk.build({ids:['tracking'],copies:1,groups:21}).error);
assert(MaterialDesk.build({ids:['tracking','uniform','salutes'],copies:100,groups:20}).error);
for(const k of MaterialDesk.kits){const result=MaterialDesk.build({ids:[k.id],copies:2,groups:3,children:true});assert(!result.error,k.id);assert.equal(MaterialDesk.pages(result.html),result.pages);assert(result.html.includes(k.scope));}
const bundle=MaterialDesk.build({ids:['tracking','salutes','tracking'],copies:2,groups:3});
assert.equal(bundle.summary.length,2);assert.equal((bundle.html.match(/class="psheet tracking-cards"/g)||[]).length,3);
assert.equal((bundle.html.match(/class="psheet tracking-worksheet"/g)||[]).length,2);
assert.equal((bundle.html.match(/class="psheet salute-task"/g)||[]).length,2);
const deskParts=bundle.html.split('以下才派給成員');assert.equal(deskParts.length,2);
assert(deskParts[0].includes('tracking-guide'));assert(deskParts[0].includes('salute-answers'));assert(!deskParts[1].includes('tracking-guide'));assert(!deskParts[1].includes('salute-answers'));
const only=MaterialDesk.build({ids:['tracking','uniform'],children:false,copies:'',groups:''});assert(!only.error);assert(!only.html.includes('material-divider'));assert(!only.html.includes('tracking-cards'));assert(!only.html.includes('uniform-task'));
assert(!bundle.html.includes('測試旅'));assert(!bundle.html.includes('troopProfile'));assert(!bundle.html.includes('followup-note'));
assert.equal(JSON.stringify(mem),deskBefore);assert.equal(ctx.curTid(),deskTid);
console.log('MATERIAL DESK PASS: eight kits, exact counts, dedupe, input limits, page cap, answer partition, leader-only, no private data or state writes.');


const plainStored=JSON.stringify(mem);
let plainBeforeChars=0,plainAfterChars=0,plainStages=0;
assert.equal(Object.keys(ctx.PlainContent.lessons).length,25);
for(const original of beforePlain.meetings){const current=Practical.meeting(original.tid);
 if(['c26','c27'].includes(original.tid)){assert.equal(JSON.stringify(current),JSON.stringify(original),'forest lessons entirely unchanged');continue;}
 for(const key of ['refs','mins','goal','evidence','gap','adapt','bag','venue','notice'])assert.equal(JSON.stringify(current[key]),JSON.stringify(original[key]),original.tid+' metadata '+key);
 current.segs.forEach((stage,i)=>{const old=original.segs[i];for(const key of ['n','m','script','watch','safety','mats','rhythm'])assert.equal(JSON.stringify(stage[key]),JSON.stringify(old[key]),original.tid+' preserve '+key);
  assert.equal(stage.steps.length,3);assert.equal(stage.how,stage.steps.map((x,j)=>(j+1)+'. '+x).join(' '));
  if(JSON.stringify(stage.steps)!==JSON.stringify(old.steps))plainStages++;
  plainBeforeChars+=old.steps.join('').length;plainAfterChars+=stage.steps.join('').length;
 });
 assert.equal(current.worksheet.prompts.length,3);
 ctx.App.activity(current.tid,1);for(const step of current.segs[1].steps)assert(html.includes(ctx.esc(step)),current.tid+' activity uses short copy');
 const paper=SessionPack.build(current,1,true);for(const stage of current.segs)for(const step of stage.steps)assert(paper.includes(ctx.esc(step)),current.tid+' paper uses short copy');
 for(const prompt of current.worksheet.prompts)assert(paper.includes(ctx.esc(prompt)),current.tid+' pupil copy');
}
assert.equal(JSON.stringify(DATA.facts),JSON.stringify(beforePlain.facts),'formal facts and promise unchanged');
assert.equal(JSON.stringify(ctx.Ceremony.items),JSON.stringify(beforePlain.ceremonies),'formal ceremony calls unchanged');
assert.equal(JSON.stringify(DATA.followupContent),JSON.stringify(beforePlain.followup),'family follow-up unchanged');
assert.equal(JSON.stringify(mem),plainStored,'copy views do not persist state');
assert.equal(JSON.stringify(Practical.meeting('c14').segs[3]),JSON.stringify(beforePlain.meetings.find(m=>m.tid==='c14').segs[3]),'existing forest segment unchanged');
assert.equal(plainStages,124);
assert.equal(Practical.meeting('c14').worksheet.prompts[2],beforePlain.meetings.find(m=>m.tid==='c14').worksheet.prompts[2],'forest worksheet prompt unchanged');
assert(plainAfterChars<plainBeforeChars,'shorter main instructions');
const medical=Practical.meeting('c08').segs.map(s=>s.steps.join(' ')).join(' ');
for(const phrase of ['10至15分鐘','唔拔異物','止血後','直接按壓','呼吸困難','999'])assert(medical.includes(phrase),'retain medical detail '+phrase);
const week=Practical.meeting('c24').segs[3].steps.join(' ');assert(week.includes('同一週'));assert(week.includes('三次'));assert(week.includes('兩個好習慣'));
console.log('PLAIN CONTENT PASS: '+plainStages+' stages across 25 lessons; '+plainBeforeChars+' → '+plainAfterChars+' instruction characters; safety/ritual/forest unchanged, shared screen and print copy.');

const {WorksheetGuide}=ctx,answerBefore=JSON.stringify(mem),answerTid=ctx.curTid();
assert.equal(Object.keys(WorksheetGuide.data).length,25);
let responseCount=0;
for(const tid of Object.keys(WorksheetGuide.data)){
 const meeting=Practical.meeting(tid),rows=WorksheetGuide.data[tid];assert.equal(rows.length,3,tid+' matches three worksheet questions');
 for(const row of rows){assert.equal(row.length,3);for(const text of row)assert(typeof text==='string'&&text.length>8);responseCount++;}
 WorksheetGuide.open(tid);assert(html.includes('唔叫大家照抄'));for(const prompt of meeting.worksheet.prompts)assert(html.includes(ctx.esc(prompt)),tid+' current question text');
 assert(Practical.summary(meeting).includes('工作紙：點答・點提示'));
 WorksheetGuide.print(tid);assert.equal(ctx.PackPrint.activeTid,null);
 for(const n of [1,2]){const packet=SessionPack.build(meeting,n,true),parts=packet.split('以下才派給成員');assert.equal(parts.length,2);assert.equal((packet.match(/class="psheet leader-sheet worksheet-guide"/g)||[]).length,1);assert(parts[0].includes('工作紙領袖參考'));assert(!parts[1].includes('worksheet-guide'));
  for(const row of rows){assert(parts[0].includes(ctx.esc(row[0])));assert(!parts[1].includes(ctx.esc(row[0])),tid+' no guide answer in child pages');}
  assert.equal((packet.match(/class="psheet worksheet"/g)||[]).length,n);
 }
 assert(SessionPack.build(meeting,1,false).includes('worksheet-guide'));
}
assert.equal(responseCount,75);assert.equal(WorksheetGuide.get('c26'),null);assert.equal(WorksheetGuide.sheet('no-such-id'),'');const priorGuideHtml=html;WorksheetGuide.open('bad');WorksheetGuide.print('bad');assert.equal(html,priorGuideHtml);
assert.equal((App.vSheets().match(/class="exam-card"/g)||[]).length,8,'vSheets shows 8 standalone exam papers');
assert(!App.vSheets().includes('sheet-entry'),'meeting worksheet index moved out of vSheets');
assert(WorksheetGuide.data.c08[2][0].includes('10至15分鐘'));assert(WorksheetGuide.data.c08[2][1].includes('呼吸困難'));
assert(WorksheetGuide.data.c24[2][1].includes('不以同一集會做三次代替一週'));
assert(WorksheetGuide.data.c17[1][0].includes('真實'));assert(WorksheetGuide.data.c22[1][0].includes('待查'));
assert.equal(JSON.stringify(mem),answerBefore);assert.equal(ctx.curTid(),answerTid);
console.log('WORKSHEET GUIDES PASS: 25 per-meeting guides/75 responses in meeting flow, 8 standalone exam papers in vSheets, live question alignment, exact leader-only insertion, no child answers, no state or forest changes.');

// September 2026: chapter 5 text is read, not inferred from the 2021 appendix.
for(const c of Ceremony.items){
 assert.equal(c.source,'scheme2026');
 assert(c.scope.includes('2026'));
 assert(!/第五章.*(?:待核|未完成|待交叉)/.test(c.scope));
}
assert(Ceremony.sources.scheme2026.url.includes('20260809.pdf'));
assert(Ceremony.get('salutes').steps[1][2].includes('右眼對上2厘米'));
assert(Ceremony.get('salutes').steps[1][2].includes('手指、手腕及前臂成一直線'));
assert(Ceremony.get('salutes').steps[4][2].includes('目光和微笑'));
assert(Ceremony.get('salutes').steps[4][2].includes('隊列場合另依2024'));
assert(Ceremony.get('commands').steps[1][2].includes('各向外與中線成30度'));
assert(Ceremony.get('howl').scope.includes('蹲下呼號後立正'));
assert(Ceremony.get('howl').steps.some(s=>s[1]==='Cubs! Do your best!'));
assert(Ceremony.get('investiture').steps.some(s=>s[1]==='我相信你會盡你所能，堅守你的許諾。你現在已成為世界童軍的一份子了。'));
assert(!Ceremony.sheets('unfurl').includes('向右後轉'));
for(const text of [ctx.SaluteLab.rules(),ctx.SaluteLab.sheets(true),ctx.SalutePositions.sheet(),Ceremony.sheets('salutes')])assert(text.includes('2厘米'));
for(const text of [Ceremony.panel(),ctx.FormalKit.panel(),ctx.FieldVisuals.formationSheets(),ctx.SaluteLab.credit(),ctx.SalutePositions.note()])assert(!/第五章[^。<]*(?:待核|未完成|待交叉)/.test(text));
assert(Ceremony.panel().includes('隊長就職、晉團及摺旗／繫旗操作不在該章內'));
console.log('2026 CHAPTER 5 PASS: six sourced cards, full-salute distance/alignment, everyday vs drill gaze, stand after howl, exact investiture confirmation, retained unresolved procedures.');
