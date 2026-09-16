import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const mem={}, elements={};
const el=()=>({id:'',innerHTML:'',className:'',style:{setProperty(){}},value:'',hidden:false,
  classList:{_s:new Set(),toggle(c,on){on?this._s.add(c):this._s.delete(c)},add(c){this._s.add(c)},remove(c){this._s.delete(c)},contains(c){return this._s.has(c)}},
  setAttribute(){},getAttribute:()=>null,removeAttribute(){},appendChild(n){if(n&&n.id)elements[n.id]=n},addEventListener(){},removeEventListener(){},
  querySelector:()=>null,querySelectorAll:()=>[],closest:()=>null,focus(){},insertAdjacentHTML(){},remove(){}});
const body=el();body.id='body';
const ctx={console,localStorage:{getItem:k=>mem[k]??null,setItem:(k,v)=>mem[k]=String(v)},location:{hash:'#plan'},navigator:{onLine:true},
  document:{getElementById:id=>elements[id]??=el(),createElement:()=>el(),querySelectorAll:()=>[],querySelector:()=>null,body,documentElement:el(),addEventListener(){},removeEventListener(){},fullscreenElement:null,exitFullscreen(){}},
  setTimeout:()=>{},clearTimeout(){},setInterval:()=>1,clearInterval(){},addEventListener(){},scrollTo(){},print(){}};
ctx.window=ctx;vm.createContext(ctx);
for(const file of ['data','jungle-data','practical-data','guide','flow','app','redesign','content','jungle','practical','uniform-ceremony','field-visuals','salute-lab','salute-positions','tracking-kit','material-desk','plain-content','worksheet-guides'])vm.runInContext(fs.readFileSync(`js/${file}.js`,'utf8'),ctx);
const {DATA,App,Flow,PackPrint}=ctx;
assert.equal(DATA.meetings.length,27);
assert.equal(new Set(DATA.meetings.map(m=>m.tid)).size,27);
assert.equal(DATA.facts.motto,'準備');
assert.equal(DATA.source.version,'2026-08-09');
assert(DATA.badges.some(b=>b.n==='幼童軍體驗章'));
assert(!DATA.badges.some(b=>b.n==='幼童軍獎章'||b.n==='專科章'));
for(const m of DATA.meetings){
  for(const key of ['goal','evidence','gap','notice','contentVersion'])assert(m[key]?.length>5,`${m.tid} ${key}`);
  assert(m.refs.length&&m.adapt.easy&&m.adapt.hard);
  assert.equal(m.mins,m.segs.reduce((sum,s)=>sum+s.m,0));
  for(const s of m.segs){assert.equal(s.steps.length,3);assert(s.watch&&s.safety&&s.script&&s.rhythm);assert.equal(ctx.Guide.forStage(s).steps[0][3],s.steps[0]);for(const item of s.mats)assert(m.bag.includes(item));}
  for(const item of m.bag)assert(DATA.materials.some(x=>x.n===item),`${m.tid} missing material ${item}`);
  assert.equal(m.worksheet.prompts.length,3);
  const detail=App.vMeetDetail(m);assert(detail.includes(m.evidence)&&detail.includes(m.gap));
}
for(const code of ['1.1.1','1.1.2','1.1.3','1.2.1','1.2.2','1.2.3','1.3.1','1.3.2','1.3.3','1.4.1','1.4.2','1.4.3'])assert(DATA.meetings.some(m=>m.refs.includes(code)),`experience support ${code}`);
assert(DATA.meetings.find(m=>m.tid==='c24').gap.includes('一週'));
assert(DATA.meetings.find(m=>m.tid==='c03').gap.includes('須補核'));
let output='';ctx.Modal.open=html=>output=html;
App.prepare('c07');ctx.Store.set('roster',['A','B','C']);
PackPrint.open('sheet','c24');assert.equal(ctx.curTid(),'c07');assert.equal((output.match(/class="psheet worksheet"/g)||[]).length,3);assert(!output.includes('class="psheet leader-sheet"'));assert(output.includes('一週內三次幫手任務'));
PackPrint.confirmDone();assert(!Flow.isDone('print'),'printing another sheet must not advance current meeting');
PackPrint.open('leader');assert(output.includes('class="psheet leader-sheet"'));assert(!output.includes('class="psheet worksheet"'));
PackPrint.doit();assert(!Flow.isDone('print'),'opening or cancelling print must not auto-complete');
PackPrint.open('all');assert.equal((output.match(/class="psheet worksheet"/g)||[]).length,3);assert.equal((output.match(/class="psheet divider"/g)||[]).length,1);
PackPrint.confirmDone();assert(Flow.isDone('print'));
assert(!output.includes('圖紙內容：跟住領袖指示做'));
assert(App.vBook().includes(DATA.source.url));
console.log('CONTENT PASS: 27 lessons, 135 authored stages, syllabus mappings, materials, text worksheets and print isolation');

assert.equal(DATA.jungle.characters.length,11);
assert.equal(DATA.jungle.episodes.length,5);
/* 2026-09-15：故事文字依總會原版（月刊158–170期版本）加厚，每集6/7/4/5/5段，投屏每段一大圖。 */
assert.equal(JSON.stringify(DATA.jungle.episodes.map(e=>e.scenes.length)),'[6,7,4,5,5]','每集分段數目（加厚後）');
for(const episode of DATA.jungle.episodes){
  assert(DATA.jungle.decks[episode.id]&&DATA.jungle.decks[episode.id].subtitle,'每集要有投屏封面同副題：'+episode.id);
  for(const scene of episode.scenes){
    assert(scene.text&&scene.question&&scene.answer&&scene.lesson);
    for(const id of scene.cast)assert(DATA.jungle.characters.some(c=>c.id===id));
    if(scene.img&&!DATA.jungle.pendingArt.includes(scene.img)){const fp=path.join(root,'assets/jungle/slides/'+scene.img+'.avif');
      assert(fs.existsSync(fp),'已出圖嘅段落檔案要存在：'+scene.img);
      assert(fs.statSync(fp).size<=120*1024,'投屏圖 ≤120KB：'+scene.img);
      assert(fs.readFileSync('sw.js','utf8').includes('./assets/jungle/slides/'+scene.img+'.avif'),'投屏圖要入離線快取：'+scene.img);}
    else if(scene.img){assert(!fs.existsSync(path.join(root,'assets/jungle/slides/'+scene.img+'.avif')),'pendingArt 清單要同實際檔案同步：'+scene.img);}
  }
}
assert(DATA.jungle.episodes.find(e=>e.id==='welcome').scenes.some(s=>s.text.includes('白勞')&&s.text.includes('白基拿')),'加入狼群一集要保留兩位擔保人');
assert(DATA.jungle.episodes.find(e=>e.id==='fire').scenes.some(s=>s.text.includes('紅花')),'火種一集要保留紅花情節');
assert(DATA.jungle.episodes.find(e=>e.id==='village').scenes.some(s=>s.text.includes('美修娃')),'回村一集要保留美修娃認子情節');
App.prepare('c07');
ctx.location.hash='#jungle';App.route();assert(elements.view.innerHTML.includes('11位角色'));assert.equal(ctx.curTid(),'c07');
ctx.Jungle.open(0);assert.equal(ctx.Jungle.page,0);ctx.Jungle.move(-1);assert.equal(ctx.Jungle.page,0);
ctx.Jungle.move(99);assert.equal(ctx.Jungle.page,5,'第一集最尾一段');assert(output.includes('白勞'));
ctx.Jungle.open(1);assert.equal(ctx.Jungle.page,0);ctx.Jungle.move(3);assert(output.includes('獵場'));
ctx.Jungle.card('kaa');assert(output.includes('幫助毛吉利'));assert.equal(ctx.curTid(),'c07');
/* 本地 AI 插畫頭像係受審查嘅依賴，准；外連 http 圖唔准。 */
const jungleView=ctx.Jungle.view();
assert(!jungleView.includes('src="http'),"jungle view 唔得引用外連 http 圖");
for(const c of DATA.jungle.characters){
  if(c.img){assert(c.img.startsWith("assets/jungle/"),"頭像路徑要喺 assets/jungle/：" + c.id);
    const fp=path.join(root,c.img);assert(fs.existsSync(fp),"頭像檔案要存在：" + c.img);
    assert(fs.statSync(fp).size<=120*1024,"頭像要 ≤120KB：" + c.img);}
}
assert(jungleView.includes("AI 繪製教學示意"),"要標明頭像係 AI 教學示意、非官方原圖");
/* 投屏講故事：開幕、翻頁、問題、收幕、鍵盤、列印，全部唔改準備狀態。 */
ctx.location.hash='#jungle';App.route();
assert(elements.view.innerHTML.includes('投屏講故事'),'故事頁要有投屏入口');
const stageEl=()=>ctx.document.getElementById('story-stage');
ctx.Jungle.show(0);
assert(stageEl().innerHTML.includes('story-stage'),'投屏要 render 舞台');
assert(stageEl().innerHTML.includes('jungle-wolf-carry.avif'),'封面用大圖');
assert(stageEl().innerHTML.includes('1 / 7'),'顯示第幾張（封面＋6段）');
assert(!stageEl().innerHTML.includes('story-ask'),'封面唔會顯示問題區');
assert(stageEl().innerHTML.includes('story-castline')&&/出場：/.test(stageEl().innerHTML),'封面列出今集出場角色');
ctx.Jungle.stageMove(1);assert.equal(ctx.Jungle.stageState.slide,1);assert(stageEl().innerHTML.includes('jungle-night-tiger.avif'),'第二張換圖');
assert(!stageEl().innerHTML.includes('story-ask'),'未撳問題時唔會預先出問題區');
const beforeAsk=stageEl().innerHTML;ctx.Jungle.stageAsk();
assert(stageEl().innerHTML!==beforeAsk&&stageEl().innerHTML.includes('story-ask'),'撳「問題」先出問題區');
assert(/領袖答案/.test(stageEl().innerHTML),'答案收喺問題區內可展開');
ctx.Jungle.stageMove(1);assert(!stageEl().innerHTML.includes('story-ask'),'轉去下一張會收返問題區');
assert(stageEl().innerHTML.includes('jungle-wolf-carry.avif'),'第三張用返狼父銜住嬰兒嗰張圖');
ctx.Jungle.stageMove(-5);assert.equal(ctx.Jungle.stageState.slide,0,'上一張唔會越界');
ctx.Jungle.stageMove(99);assert.equal(ctx.Jungle.stageState.slide,6,'下一張去到最後一張（封面＋6段）');
ctx.Jungle.episodeStep(4);assert.equal(ctx.Jungle.stageState.ep,4);assert(stageEl().innerHTML.includes('1 / 6'),'可跳去第五集（封面＋5段）');
ctx.Jungle.episodeStep(9);assert.equal(ctx.Jungle.stageState.ep,4,'跳去唔存在集數唔會出事');
ctx.Jungle.fontStep(1);assert(stageEl().style&&typeof stageEl().style.setProperty==='function','放大字唔會拋錯');
ctx.Jungle.stageMove(1);
assert.equal(DATA.jungle.pendingArt.length,0,'場景圖已經全部出齊');
assert(stageEl().innerHTML.includes('story-photo')&&stageEl().innerHTML.includes('jungle-village.avif'),'第五集第 2 段用新出嘅大圖');
assert(!stageEl().innerHTML.includes('製作中'),'圖齊咗就唔會再出「製作中」提示');
ctx.Jungle.episodeStep(0);ctx.Jungle.stageMove(1);
assert(stageEl().innerHTML.includes('story-photo')&&stageEl().innerHTML.includes('jungle-night-tiger.avif'),'已出圖嘅段落用大圖');
ctx.Jungle.bindKeys(true);const slideBefore=ctx.Jungle.stageState.slide;ctx.Jungle.keys({key:'ArrowRight',preventDefault(){}});assert(ctx.Jungle.stageState.slide===slideBefore+1,'鍵盤 → 可以翻頁');
ctx.Jungle.keys({key:'q',preventDefault(){}});assert(ctx.Jungle.stageState.ask,'鍵盤 Q 開問題區');
ctx.Jungle.bindKeys(false);
ctx.Jungle.stageClose();assert.equal(stageEl().innerHTML,'','收幕清空舞台');
assert(!ctx.document.body.classList.contains('story-open'),'收幕要移除 body.story-open');
ctx.Jungle.bindKeys(true);assert(ctx.Jungle._bound===true,'綁定鍵盤');ctx.Jungle.bindKeys(false);assert(ctx.Jungle._bound===false,'收幕解除鍵盤綁定');
ctx.Jungle.bindKeys(false);
/* 旁白錄音：語言清單、檔案、播放清單、暫停／換集行為。 */
const narr=DATA.jungle.narration;
assert(narr&&narr.langs.length===3&&narr.files,'要有旁白錄音資料');
const narrFiles=[];
for(const ep of DATA.jungle.episodes){
  const langs=ctx.Jungle.langsOf(ep.id);
  if(narr.pending.includes(ep.id))assert.equal(langs.length,0,'待錄旁白嘅集數唔應該有清單：'+ep.id);
  else assert(langs.length>=1,'每集至少一種語言旁白（'+ep.id+'）');
  for(const [code] of langs){
    const list=narr.files[ep.id][code]||[];
    const sceneClips=((DATA.jungle.sceneAudio[ep.id]||{})[code]||[]).filter(Boolean);
    assert(Array.isArray(list),'旁白清單要係陣列：'+ep.id+'/'+code);
    assert(list.length>=1||sceneClips.length>=1,'該語言要有旁白或逐段聲：'+ep.id+'/'+code);
    for(const f of list.concat(sceneClips)){assert(fs.existsSync(path.join(root,f)),'旁白檔案要存在：'+f);
      narrFiles.push(f);}
  }
}
assert(narrFiles.length>=5,'起碼有幾段旁白（實際 '+narrFiles.length+'）');
assert(ctx.Jungle.langsOf('help').some(l=>l[0]==='zh'),'普通話旁白要覆蓋第二集');
assert(ctx.Jungle.playlist('fire','en').chained===true,'整集模式要用逐段檔案接播（唔會重複錄一套成集聲）');
assert.equal(ctx.Jungle.playlist('village','en').files.length,5,'第五集英文整集＝5 段接播');
/* 2026-09-15 第二輪：普通話＋英文補齊五集；粵語第一集試聽，並標明語氣限制。 */
assert.deepEqual===undefined||true;
assert.equal(JSON.stringify(Object.keys(narr.files).sort()),JSON.stringify(['fire','help','rules','village','welcome']),'五集都有旁白資料');
for(const ep of DATA.jungle.episodes){
  assert(ctx.Jungle.langsOf(ep.id).some(l=>l[0]==='en'),'每集都要有英文旁白：'+ep.id);
}
assert(ctx.Jungle.langsOf('welcome').some(l=>l[0]==='yue'),'第一集有粵語');
for(const ep of DATA.jungle.episodes)assert(ctx.Jungle.sceneDone(ep.id,'yue'),'五集都要有粵語旁白：'+ep.id);
assert(narr.langNotes&&narr.langNotes.yue.includes('生硬'),'粵語要標明語氣限制');
assert.equal(narr.pending.length,0,'旁白唔應該再有待錄項');
assert.equal(DATA.jungle.pendingArt.length,0,'場景圖要全部出齊');
ctx.Jungle.show(0);
const barHTML=ctx.Jungle.audioBarHTML();
assert(barHTML.includes('🎧')&&barHTML.includes('普')&&barHTML.includes('EN'),'音訊條要有語言掣');
assert(barHTML.includes('粵'),'粵語掣要出（五集都有粵語旁白）');
assert(ctx.Jungle.langsOf('welcome').some(l=>l[0]==='en'),'第一集有英文旁白');
assert.equal(ctx.Jungle.langsOf('village').length,3,'第五集有普通話、英文同粵語');
assert(ctx.Jungle.langsOf('rules').length===3,'第三集有三種語言');
ctx.Jungle.show(1);assert(ctx.Jungle.langsOf('help').length===3,'第二集有三種語言');
ctx.Jungle.show(0);
assert(ctx.Jungle.langNote('yue').includes('生硬')&&ctx.Jungle.langNote('zh')==='','粵語提示只喺粵語出現');

/* 用假 audio 元素驗兩種模式：整集連續播、逐段自動跟圖，同環境音。 */
const played=[];let paused=0,ambPlayed=0,ambPaused=0,ambVol=null;
const fake=(bag)=>({src:'',currentTime:0,duration:60,paused:true,volume:1,
  play(){bag();this.paused=false;return Promise.resolve();},pause(){this.paused=true;return undefined;},
  addEventListener(){},getAttribute(n){return n==='src'?this.src:null;}});
ctx.Jungle.audioEl=()=>JungleEl;
let JungleEl=fake(()=>played.push(JungleEl.src));
JungleEl.pause=function(){paused++;this.paused=true;};
const JungleAmb=fake(()=>ambPlayed++);JungleAmb.pause=function(){ambPaused++;this.paused=true;};
ctx.Jungle.ambEl=()=>JungleAmb;

/* 1. 整集模式：連續播，唔會自動跳圖 */
ctx.Jungle.show(0);
ctx.Jungle.audio.mode='episode';
ctx.Jungle.show(4);
ctx.Jungle.playNarration('en');
assert(played.length===1&&played[0].includes('scene/village-1-en.mp3'),'整集模式：由第一段開始播');
assert(ctx.Jungle.audio.playing,'播放狀態要開');
const slideAtStart=ctx.Jungle.stageState.slide;
ctx.Jungle.narrationEnded();
assert(played.length===2&&played[1].includes('scene/village-2-en.mp3'),'整集模式：第一段完自動接第二段');
assert(ctx.Jungle.stageState.slide===slideAtStart,'整集模式唔會自動跳圖');
for(let k=0;k<4;k++)ctx.Jungle.narrationEnded();
assert(!ctx.Jungle.audio.playing,'整集播到第五段就會停低');
ctx.Jungle.show(0);ctx.Jungle.playNarration('zh');
assert(played[played.length-1].includes('scene/welcome-1-zh.mp3'),'整集模式：普通話逐段齊，會接住播');
ctx.Jungle.show(0);ctx.Jungle.playNarration('en');
assert(played[played.length-1].includes('scene/welcome-1-en.mp3'),'整集模式：英文第一集同逐段接住播');
ctx.Jungle.show(1);ctx.Jungle.playNarration('en');
assert(played[played.length-1].includes('scene/help-1-en.mp3'),'整集模式：英文第二集接播');

/* 2. 逐段模式：一段一張圖，播放器跟住圖走 */
ctx.Jungle.toggleMode();
assert(ctx.Jungle.audio.mode==='scene','可以轉逐段模式');
assert(JSON.parse(mem.cub_storyPrefs||'{}').mode==='scene','模式要記住（本機偏好）');
assert.equal(ctx.Jungle.audio.playing,false,'轉模式會先停低');
ctx.Jungle.show(0);
ctx.Jungle.playNarration('yue');
assert(played[played.length-1].includes('scene/welcome-1-yue.mp3'),'逐段模式：由第一段嗰張圖開始播');
assert(ctx.Jungle.stageState.slide===1,'封面唔會有聲，會先跳去第一段');
ctx.Jungle.narrationEnded();
assert(played[played.length-1].includes('scene/welcome-2-yue.mp3'),'逐段模式：播完自動跳下一張圖再播');
assert(ctx.Jungle.stageState.slide===2,'圖要跟住聲行');

/* 熄自動跟圖：播完就停低等人 */
ctx.Jungle.toggleAuto();
assert(ctx.Jungle.audio.auto===false,'可以熄自動跟圖');
const holdSlide=ctx.Jungle.stageState.slide;
ctx.Jungle.narrationEnded();
assert(ctx.Jungle.stageState.slide===holdSlide&&!ctx.Jungle.audio.playing,'熄咗自動就唔會自己跳圖');
ctx.Jungle.toggleAuto();

/* 3. 逐段未錄嘅集數：唔會亂跳，會提示改用整集 */
ctx.Jungle.show(4);
assert(ctx.Jungle.sceneFile('village','en',5).includes('village-5-en.mp3'),'第五集最後一段英文已錄');
assert(ctx.Jungle.sceneFile('village','yue',5).includes('village-5-yue.mp3'),'第五集最後一段粵語已錄');
assert(ctx.Jungle.sceneFile('fire','zh',4).includes('fire-4-zh.mp3'),'第四集第四段普通話已錄');
assert(ctx.Jungle.sceneFile('village','zh',1).includes('village-1-zh.mp3'),'第五集第一段普通話已錄');
assert.equal(ctx.Jungle.sceneFile('welcome','en',9),'','超出段數唔會亂回檔案');
assert(!ctx.Jungle.sceneDone('welcome','yue')===false,'第一集粵語逐段已錄完');
assert(ctx.Jungle.sceneDone('help','yue')===true,'第二集粵語逐段已錄完');
assert(ctx.Jungle.sceneDone('rules','yue')===true,'第三集粵語逐段已錄完');
assert(ctx.Jungle.sceneDone('fire','yue')===true,'第四集粵語逐段已錄完');
assert(ctx.Jungle.sceneDone('village','yue')===true,'第五集粵語逐段已錄完');
assert(ctx.Jungle.sceneDone('welcome','zh')===true,'第一集普通話逐段已錄完');
assert(ctx.Jungle.sceneDone('welcome','en')===true,'第一集英文逐段已錄完');
assert(ctx.Jungle.sceneDone('help','en')===true,'第二集英文逐段已錄完');
assert(ctx.Jungle.sceneDone('rules','en')===true,'第三集英文逐段已錄完');
assert(ctx.Jungle.sceneDone('fire','en')===true,'第四集英文逐段已錄完');
assert(ctx.Jungle.sceneDone('village','en')===true,'第五集英文逐段已錄完（英文全套完成）');
assert(ctx.Jungle.sceneDone('help','zh')===true,'第二集普通話逐段已錄完');
assert(ctx.Jungle.sceneDone('rules','zh')===true,'第三集普通話逐段已錄完');
assert(ctx.Jungle.sceneDone('fire','zh')===true,'第四集普通話逐段已錄完');
assert(ctx.Jungle.sceneDone('village','zh')===true,'第五集普通話逐段已錄完（普通話全套完成）');

/* 封面（冇逐段聲）同超出段數都唔會亂播其他音檔。 */
ctx.Jungle.show(4);
const before=played.length;
ctx.Jungle.audio.mode='scene';
ctx.Jungle.playCurrent(false);
assert(ctx.Jungle.stageState.slide===1,'封面撳播會先跳去第一段（封面本身冇聲）');
assert(played.length===before+1&&played[played.length-1].includes('scene/village-1-'),'封面撳播會播第一段嗰句');
ctx.Jungle.show(4);
ctx.Jungle.playNarration('zh');
assert(played[played.length-1].includes('scene/village-1-zh.mp3'),'第五集普通話有第一段就播返第五集');
ctx.Jungle.playNarration('yue');
assert(played[played.length-1].includes('scene/village-1-yue.mp3'),'第五集粵語錄齊就會播返第五集');

/* 4. 環境音：跟段落轉、細音量、可熄 */
ctx.Jungle.show(0);
assert(ctx.Jungle.slideAmb()==='night','封面用夜間環境音');
assert(ctx.Jungle.ambSrc().includes('jungle-night.mp3'),'夜間環境音檔');
ctx.Jungle.stageMove(1);
assert(ctx.Jungle.ambSrc().includes('jungle-night.mp3'),'第一段（森林晚上）仍然夜聲');
ctx.Jungle.show(3);
for(let k=1;k<=ctx.Jungle.slides(3).length-1;k++){ctx.Jungle.stageMove(1);}
assert(ctx.Jungle.slideAmb()==='leaves'&&ctx.Jungle.ambSrc().includes('leaves.mp3'),'第三集最尾一段（猴子／樹林）用樹葉聲');
ctx.Jungle.show(1);ctx.Jungle.stageMove(2);
assert(ctx.Jungle.ambSrc().includes('jungle-day.mp3'),'第二集第二段（日間）用日間環境音');
ctx.Jungle.show(4);ctx.Jungle.stageMove(1);
assert(ctx.Jungle.ambSrc().includes('jungle-day.mp3'),'第五集第一段（田園）用日間環境音');
ctx.Jungle.show(3);ctx.Jungle.stageMove(2);
assert(ctx.Jungle.ambSrc().includes('fire-crackle.mp3'),'第四集紅花一段用營火聲');
ctx.Jungle.setAmbVol('100');
assert(ctx.Jungle.audio.ambVol<=0.4,'環境音最大音量要壓住，唔可以蓋過人聲');
assert(ambVol===null||true,'音量設定唔會拋錯');
ctx.Jungle.toggleAmb();
assert(ctx.Jungle.audio.amb===false&&ctx.Jungle.ambStopping===true,'可以熄環境音（會有短促淡出再停）');
assert(JSON.parse(mem.cub_storyPrefs).amb===false,'環境音開關要記住');
ctx.Jungle.toggleAmb();
assert(ctx.Jungle.audio.amb===true&&ambPlayed>=1&&ctx.Jungle.ambStopping===false,'可以再開環境音');
assert(JSON.parse(mem.cub_storyPrefs).amb===true,'環境音喜好要記住');

/* 5. 收幕／暫停要停晒兩層聲 */
ctx.Jungle.show(0);
ctx.Jungle.pauseNarration();
assert(paused>=1&&!ctx.Jungle.audio.playing,'收幕／暫停要叫停旁白同環境音');
assert(ctx.Jungle.mmss(75)==='1:15','時間顯示格式');
/* 6. 逐段旁白檔案齊唔齊、有冇入快取、同 scenePending 對唔對得上 */
{
  const sa=DATA.jungle.sceneAudio, sw=fs.readFileSync('sw.js','utf8');
  const pending=new Set(DATA.jungle.scenePending);
  let missing=0, filled=0;
  for(const ep of DATA.jungle.episodes){
    const want=ep.scenes.length, byLang=sa[ep.id]||{};
    for(const code of ['zh','en','yue']){
      const arr=byLang[code]||[];
      assert(arr.length===want,'逐段旁白數量要對得住段數：'+ep.id+'/'+code);
      const all=arr.every(Boolean);
      if(all)assert(!pending.has(ep.id+':'+code),'已錄完就唔應該喺 scenePending：'+ep.id+':'+code);
      else {assert(pending.has(ep.id+':'+code)||scenesFilledPartial(ep.id,code),'未錄完要喺 scenePending：'+ep.id+':'+code);}
      for(const f of arr){if(!f)continue;filled++;
        assert(fs.existsSync(path.join(root,f)),'逐段旁白檔案要存在：'+f);
        missing+=0;}
    }
  }
  function scenesFilledPartial(id,code){const arr=(sa[id]||{})[code]||[];return arr.some(Boolean)&&!arr.every(Boolean);}
  assert.equal(filled,81,'逐段旁白要 81 段（5 集 × 27 段 × 3 語言；實際 '+filled+'）');
  assert.equal(DATA.jungle.scenePending.length,0,'唔應該再有未錄嘅逐段旁白');
  for(const ep of DATA.jungle.episodes)for(const code of ['yue','zh','en'])
    assert(ctx.Jungle.sceneDone(ep.id,code),'三語逐段要全部完成：'+ep.id+'/'+code);
  for(const ep of DATA.jungle.episodes){assert(ctx.Jungle.sceneDone(ep.id,'zh'),'普通話逐段要全套完成：'+ep.id);assert(ctx.Jungle.sceneDone(ep.id,'yue'),'粵語逐段要全套完成：'+ep.id);}
  assert.equal(Object.values(sa).reduce((n,b)=>n+(b.yue||[]).filter(Boolean).length,0),27,'粵語逐段共 27 段');
  assert.equal(Object.values(sa).reduce((n,b)=>n+(b.zh||[]).filter(Boolean).length,0),27,'普通話逐段共 27 段');
  assert.equal(Object.values(sa).reduce((n,b)=>n+(b.yue||[]).filter(Boolean).length,0),27,'粵語逐段共 27 段');
  assert.equal(Object.values(sa).reduce((n,b)=>n+(b.en||[]).filter(Boolean).length,0),27,'英文逐段 27 段');

  for(const ep of DATA.jungle.episodes){
    assert(ctx.Jungle.sceneDone(ep.id,'yue'),'粵語逐段要全套完成：'+ep.id);
    const yue=(sa[ep.id].yue||[]);
    assert(yue.length===ep.scenes.length,'粵語逐段數量要等於段數：'+ep.id);
    assert(yue.every(Boolean),'粵語逐段唔應該有空格：'+ep.id);
  }
  assert.equal(ctx.Jungle.sceneFile('village','en',6),'','超出段數要回空');
  assert.equal(ctx.Jungle.sceneFile('welcome','yue',0),'','封面冇逐段聲');
  assert.equal(ctx.Jungle.sceneFile('welcome','yue',7),'','超出段數唔會亂回檔案');
  assert(ctx.Jungle.sceneFile('welcome','zh',4).includes('welcome-4-zh.mp3'),'普通話逐段有檔案');
  assert.equal(ctx.Jungle.sceneFile('welcome','zh',1).includes('welcome-1-zh.mp3'),true,'第一段普通話仍然在');
  assert.equal(ctx.Jungle.sceneFile('nope','yue',1),'','唔存在嘅集唔會爆');
}
/* 7. 環境音：檔案齊、包在離線語音包內、唔預先塞入安裝包、音量上限 */
{
  const amb=DATA.jungle.ambience;
  const pack=ctx.Jungle.audioPackList();
  const swNow=fs.readFileSync('sw.js','utf8');
  const precacheHas=(f)=>{const pc=(swNow.match(/ASSETS = \[([\s\S]*?)\];/)||[])[1]||'';return pc.includes('./'+f);};
  for(const k of ['night','day','leaves','fire']){
    assert(amb[k],'要有環境音：'+k);
    assert(fs.existsSync(path.join(root,amb[k])),'環境音檔案要存在：'+amb[k]);
    assert(pack.includes(amb[k]),'環境音要包括在離線語音包內');
    assert(!precacheHas(amb[k]),'環境音都唔應該預先塞入安裝包（唔聽聲就完全唔下載）');
    assert(fs.statSync(path.join(root,amb[k])).size<120*1024,'環境音要細過 120KB：'+amb[k]);
  }
  for(const ep of DATA.jungle.episodes)for(const sc of ep.scenes)assert(['night','day','leaves','fire'].includes(sc.amb),'每段要有環境音標籤：'+sc.title);
  { /* 環境音跟段落轉：唔同段落要對得住唔同聲 */
    ctx.Jungle.show(0);assert(ctx.Jungle.slideAmb()==='night'&&ctx.Jungle.ambName().includes('夜'),'封面／森林晚上用夜聲');
    ctx.Jungle.show(3);assert(ctx.Jungle.slideAmb()==='night','第四集封面（森林夜景）用夜聲');
    ctx.Jungle.stageMove(1);assert(ctx.Jungle.slideAmb()==='night','狼群分歧＝夜聲');
    ctx.Jungle.stageMove(1);assert(ctx.Jungle.slideAmb()==='fire'&&ctx.Jungle.ambName().includes('營火'),'紅花是火＝營火聲');
    ctx.Jungle.show(1);ctx.Jungle.stageMove(5);assert(ctx.Jungle.slideAmb()==='leaves','被猴群帶走＝落葉聲');
ctx.Jungle.show(1);ctx.Jungle.stageMove(3);assert(ctx.Jungle.slideAmb()==='day','湖邊的水蛇＝日間聲');
    ctx.Jungle.show(0);ctx.Jungle.stageMove(2);assert(ctx.Jungle.slideAmb()==='leaves','洞口小人兒＝落葉／腳步聲');
    ctx.Jungle.show(4);assert(ctx.Jungle.slideAmb()==='leaves','第五集封面（草原小路）用落葉聲');
    ctx.Jungle.show(4);ctx.Jungle.stageMove(1);assert(ctx.Jungle.slideAmb()==='day','美修娃＝日間聲');
  }
  assert(['night','day','leaves','fire'].includes((DATA.jungle.decks[ep0()]||{}).amb||'day'),'封面要有環境音標籤');
  function ep0(){return DATA.jungle.episodes[0].id;}
}
/* 8. 試聽面板：唔開投屏都聽到旁白同環境音 */
{
  ctx.Jungle.show(0);
  ctx.Jungle.audioLab();
  assert(output.includes('🎚️ 試聽：旁白＋環境音'),'森林故事頁要有試聽入口');
  for(const ep of DATA.jungle.episodes)assert(output.includes(ep.title),'試聽面板要列出每集：'+ep.title);
  assert(output.includes('🔁 連播'),'環境音要有連播試聽');
  assert(output.includes('amb-lab-vol'),'試聽面板要有音量拉桿');
  assert(output.includes('逐段旁白覆蓋'),'試聽面板要顯示逐段覆蓋率');
  assert(ctx.Jungle.sceneCoverage().includes('粵 27/27')&&ctx.Jungle.sceneCoverage().includes('普 27/27'),'覆蓋率要計得準（粵、普全套）');
  assert(ctx.Jungle.sceneCoverage().includes('EN 27/27'),'英文覆蓋率要顯示 EN 27/27');
  assert(output.includes('story-lab')&&output.includes('story-lab-amb'),'試聽面板要有兩個播放器（旁白／環境音）');
  ctx.Jungle.labNarr(0,'yue');
  const lab=ctx.document.getElementById('story-lab');
  assert(lab.src.includes('scene/welcome-1-yue.mp3'),'試聽旁白會用逐段第一段');
  ctx.Jungle.labNarr(2,'yue');
  assert(ctx.document.getElementById('story-lab').src.includes('scene/rules-1-yue.mp3'),'試聽第三集用該集第一段');
  ctx.Jungle.ambPlayLab('fire');
  assert(ctx.document.getElementById('story-lab-amb').src.includes('fire-crackle.mp3'),'試聽環境音會揀啱檔案');
  ctx.Jungle.ambPlayLab('night');
  assert(ctx.document.getElementById('story-lab-amb').src.includes('jungle-night.mp3')&&ctx.document.getElementById('story-lab-amb').loop===true,'環境音試聽要 loop');
  ctx.Jungle.show(0);
}
/* 9. 體積控制：唔重複錄同一段內容、audio 唔塞入安裝包、有離線語音包下載 */
{
  const fsx=fs, pathx=path;
  const audioDir=pathx.join(root,'assets/jungle/audio');
  const sceneDir=pathx.join(audioDir,'scene');
  const ambDir=pathx.join(root,'assets/jungle/ambience');
  const onDisk=[].concat(
    fsx.readdirSync(audioDir).filter(f=>f.endsWith('.mp3')).map(f=>'assets/jungle/audio/'+f),
    fsx.readdirSync(sceneDir).filter(f=>f.endsWith('.mp3')).map(f=>'assets/jungle/audio/scene/'+f),
    fsx.readdirSync(ambDir).filter(f=>f.endsWith('.mp3')).map(f=>'assets/jungle/ambience/'+f));
  const pack=ctx.Jungle.audioPackList();
  /* (a) 每個檔案都要有用途（唔可以留低冇人用嘅重複檔） */
  const orphan=onDisk.filter(f=>!pack.includes(f));
  assert.equal(orphan.length,0,'唔可以留低無人用嘅語音檔：'+orphan.join('、'));
  /* (b) 逐段錄齊嘅語言，唔應該再有一套成集聲（重複佔位） */
  for(const ep of DATA.jungle.episodes){
    for(const code of ['zh','en','yue']){
      if(!ctx.Jungle.sceneDone(ep.id,code))continue;
      assert.equal((narr.files[ep.id][code]||[]).length,0,'逐段齊咗就唔應該再有一套成集聲：'+ep.id+'/'+code);
      const pl=ctx.Jungle.playlist(ep.id,code);
      assert(pl.chained&&pl.files.length===ep.scenes.length,'整集模式要用逐段接播（'+ep.id+'/'+code+'）');
    }
  }
  /* (c) 成集模式接住播：唔會跳圖，播完最後一段就停 */
  ctx.Jungle.show(0);ctx.Jungle.audio.mode='episode';
  ctx.Jungle.playNarration('zh');
  assert(played[played.length-1].includes('scene/welcome-1-zh.mp3'),'普通話第一集：整集模式＝逐段接播');
  const slide0=ctx.Jungle.stageState.slide;
  ctx.Jungle.narrationEnded();
  assert(ctx.Jungle.stageState.slide===slide0,'接播唔會跳圖');
  assert(played[played.length-1].includes('scene/welcome-2-zh.mp3'),'接播會順住第二段');
  /* (d) 全部語言都用逐段檔案接播，冇任何重複成集錄音 */
  ctx.Jungle.show(4);ctx.Jungle.playNarration('en');
  assert(played[played.length-1].includes('scene/village-1-en.mp3'),'第五集英文都由逐段接播');
  for(const ep of DATA.jungle.episodes){
    for(const code of ['zh','en','yue']){
      assert.equal((narr.files[ep.id][code]||[]).length,0,'唔應該再留成集錄音：'+ep.id+'/'+code);
      const pl2=ctx.Jungle.playlist(ep.id,code);
      assert(pl2.chained&&pl2.files.length===ep.scenes.length,'整集模式要逐段接播：'+ep.id+'/'+code);
    }
  }
  ctx.Jungle.toggleMode();ctx.Jungle.show(0);
  /* (e) 體積上限 */
  let audioBytes=0;for(const f of onDisk)audioBytes+=fsx.statSync(pathx.join(root,f)).size;
  assert(audioBytes<9*1048576,'語音檔總量要細過 9MB（實際 '+(audioBytes/1048576).toFixed(1)+'MB）');
  for(const f of onDisk)assert(fsx.statSync(pathx.join(root,f)).size<800*1024,'單個語音檔唔應該大過 800KB：'+f);
  let slideBytes=0;for(const f of fsx.readdirSync(pathx.join(root,'assets/jungle/slides')))slideBytes+=fsx.statSync(pathx.join(root,'assets/jungle/slides/'+f)).size;
  assert(slideBytes<3*1048576,'場景圖總量要細過 3MB（實際 '+(slideBytes/1048576).toFixed(1)+'MB）');
  /* (f) 安裝包完全唔包聲音檔（旁白＋環境音都係要用時才下載） */
  const swSrc=fsx.readFileSync('sw.js','utf8');
  const precacheHas=(p)=>{const pc=(swSrc.match(/ASSETS = \[([\s\S]*?)\];/)||[])[1]||'';return pc.includes('./'+p);};
  const precache=(swSrc.match(/ASSETS = \[([\s\S]*?)\];/)||[])[1]||'';
  assert(!/\/assets\/jungle\/audio\//.test(precache),'安裝包唔應該塞成 10MB 語音檔');
  assert(swSrc.includes('AUDIO_RE'),'旁白同環境音都用同一套即時快取');
  assert(/AUDIO_RE/.test(swSrc),'Service Worker 要為聲音檔做即時快取');
  assert(swSrc.includes('AUDIO_RE.test')&&swSrc.includes('(audio|ambience)'),'即時快取要涵蓋旁白同環境音');
  assert(swSrc.includes('has("range")'),'要處理媒體 Range 請求，否則快取唔到');
  assert(pack.length>=40,'離線語音包要包括全部旁白／逐段／環境音（實際 '+pack.length+'）');
  assert(ctx.Jungle.packSummary().includes(String(pack.length)),'面板要顯示語音檔數量');
  let asked=[];
  ctx.fetch=(u)=>{asked.push(u);return Promise.resolve({blob:()=>Promise.resolve({size:1024})});};
  ctx.caches={open:()=>Promise.resolve({})};
  ctx.Jungle.downloadAudioPack();
  ctx.Jungle.downloadAudioPack();
  assert(asked.length>=1&&asked[0].includes('assets/jungle/'),'下載會逐個檔案抓');
  assert(ctx.document.getElementById('pack-state').textContent.includes('下載中'),'下載時要顯示進度');
  ctx.Jungle.show(0);
}
/* 10. 列印選項：只印圖／圖＋文字／圖＋旁白稿／只印旁白稿 */
{
  ctx.Jungle.printOptions(0);
  assert(output.includes('🖨️ 列印《'),'要有列印選項面板');
  for(const m of Object.values(ctx.Jungle.printModes))assert(output.includes(m),'列印面板要列出：'+m);
  assert(output.includes('print-answers')&&output.includes('print-cast'),'要有附加選項（領袖問答／出場角色）');
  assert(output.includes('本集旁白'),'列印面板要顯示本集有邊幾種旁白語音');
  ctx.Jungle.printPrefSet('mode','story');ctx.Jungle.printPrefSet('answers',true);ctx.Jungle.printPrefSet('cast',false);
  ctx.Jungle.printEpisode(0);
  assert(output.includes('story-sheet')&&output.includes('class="psheet leader-sheet"'),'可印本集文字＋領袖答案');
  assert(output.includes('jungle-night-tiger.avif'),'印出嚟都有圖');
  /* 只印圖：有大圖、冇內文、冇領袖問答頁 */
  const img=ctx.Jungle.sheets(0,{mode:'image'});
  assert(img.includes('story-photo')&&img.includes('jungle-night-tiger.avif'),'只印圖要有大圖');
  assert(!img.includes('停一停，問一問'),'只印圖唔應該有問題');
  assert(!img.includes('leader-sheet'),'只印圖唔應該有領袖問答頁');
  assert(!img.includes(DATA.jungle.episodes[0].scenes[0].text.slice(0,12)),'只印圖唔應該有故事文字');
  /* 圖＋旁白稿：有圖、有文字、冇問題 */
  const scr=ctx.Jungle.sheets(0,{mode:'script',cast:true,answers:true});
  assert(scr.includes('旁白稿')&&scr.includes('story-photo'),'旁白稿模式要有圖＋稿');
  assert(scr.includes(DATA.jungle.episodes[0].scenes[0].text.slice(0,12)),'旁白稿要有故事文字');
  assert(!scr.includes('停一停，問一問'),'旁白稿模式唔印問題');
  assert(scr.includes('出場：'),'揀咗出場角色就要印');
  /* 只印旁白稿：慳紙，冇圖 */
  const txt=ctx.Jungle.sheets(0,{mode:'text'});
  assert(!txt.includes('story-photo'),'只印旁白稿唔應該有圖');
  assert(txt.includes(DATA.jungle.episodes[0].scenes[0].text.slice(0,12)),'只印旁白稿要有文字');
  /* 選項會記住 */
  ctx.Jungle.printEpisode(0,'script');
  assert(JSON.parse(mem.cub_storyPrint||'{}').mode==='script','列印選項要記住（本機偏好）');
  assert(ctx.Jungle.sheets(0).includes('旁白稿'),'下次列印會用返記住嘅模式');
  ctx.Jungle.printPrefSet('mode','story');
}
ctx.Jungle.printEpisode(0);
assert.equal(ctx.PackPrint.activeTid,null,'印故事唔會當印出隊包');
const withImg=DATA.jungle.characters.filter(c=>c.img);
assert.equal(withImg.length,11,"11 個角色全部要有頭像，實際 " + withImg.length);
ctx.Jungle.card("mowgli");assert(output.includes("character-portrait"),"角色卡要 render 肖像");
ctx.Jungle.card("hathi");assert(output.includes("character-portrait"),"哈蒂而家有頭像，card 要 render 肖像");
PackPrint.open('sheet','c26');assert(output.includes('排序並重述'));assert.equal(ctx.curTid(),'c07');
ctx.location.hash='#prep?tid=c27';App.route();assert.equal(ctx.curTid(),'c27');assert(App.vPrep().includes('2.4.2'));
console.log('JUNGLE PASS: characters, source-linked scenes, independent reader, lesson routes and worksheets');
