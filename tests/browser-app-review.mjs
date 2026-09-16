// Whole-app audit: real DOM, image decoding, selected-tab printing, A4 sheet boundaries.
// Run a static server first. Optional TEST_FONT_CSS supplies CJK fonts on minimal CI hosts.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const base=process.env.BASE_URL || 'http://127.0.0.1:8090';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE || undefined,args:JSON.parse(process.env.CHROMIUM_ARGS || '[]')});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[],views=[],prints=[];
page.on('pageerror',e=>errors.push(e.message));
async function fonts(){if(process.env.TEST_FONT_CSS)await page.addStyleTag({content:fs.readFileSync(process.env.TEST_FONT_CSS,'utf8')});}
async function inspect(label,selector='#view'){
  await page.evaluate(async selector=>{
    await document.fonts.ready;
    for(const img of document.querySelectorAll(selector+' img')){img.loading='eager';await img.decode();}
  },selector);
  const result=await page.locator(selector).evaluate(el=>({chars:el.innerText.length,images:[...el.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),alt:i.getAttribute('alt'),ok:i.naturalWidth>0})),svg:el.querySelectorAll('svg').length,overflow:document.documentElement.scrollWidth>innerWidth}));
  assert(!result.overflow,label+' must fit mobile');
  for(const image of result.images){assert(image.ok,label+' image decodes');assert(image.src.endsWith('.avif'),label+' raster is AVIF');assert(image.alt!==null,label+' image has alt (empty is allowed for labelled buttons)');}
  views.push({label,...result});
}
async function pdf(expected,label){
  await page.evaluate(async()=>{await document.fonts.ready;for(const img of document.querySelectorAll('#modal img,#leadstage img'))await img.decode();});
  const bytes=await page.pdf({format:'A4',preferCSSPageSize:true});
  const count=(bytes.toString('latin1').match(/\/Type \/Page\b/g)||[]).length;
  assert.equal(count,expected,label+' A4 pages');
  assert.equal(await page.locator('[data-print-exclude]').count(),0,'print restores UI');
  prints.push({label,pages:count});
}
async function route(hash){await page.evaluate(hash=>{Modal.close();location.hash=hash;App.route();},hash);}
async function printMedia(check){
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>dispatchEvent(new Event('beforeprint')));
  await check();
  await page.evaluate(()=>dispatchEvent(new Event('afterprint')));
  await page.emulateMedia({media:null});
}
try{
  await page.goto(base);await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await fonts();
  for(const hash of ['#plan','#prep','#meet?tid=c01','#lead','#pack','#uniform','#ceremony','#book','#print','#skills','#play','#badge','#jungle','#tools','#teams','#sheets']){await route(hash);await inspect(hash);}
  await route('#book');
  const bookChars=(await page.locator('#view').innerText()).length;
  assert(bookChars<650,'default handbook is a concise index, not the full material inventory');
  assert.equal(await page.locator('.handbook-more[open]').count(),0);
  await page.locator('.handbook-more summary').filter({hasText:'物資庫'}).click();
  assert(await page.locator('#matlist').isVisible(),'full inventory is still accessible');
  for(const sub of ['six','roles','sixer','calls','uniform','ceremony','apps']){await route('#book?sub='+sub);await inspect('book/'+sub);}
  await route('#book?sub=uniform');
  assert.equal(await page.locator('.handbook .uniform-reference-grid img').count(),2);
  assert(!(await page.locator('.handbook').innerText()).includes('幼童軍無肩章'),'obsolete simplified uniform claim removed');
  await route('#book?sub=calls');
  assert.equal(await page.locator('.handbook .formation-map').count(),1);
  assert.equal(await page.locator('img[src$="pack-call-hands.avif"]').count(),0,'old wolf-ear artwork not served as current instruction');
  await route('#book');
  for(const id of await page.locator('.booktool').evaluateAll(els=>els.map(e=>e.dataset.tool))){await page.locator('.booktool[data-tool="'+id+'"]').click();await inspect('booktool/'+id);}
  const cards=await page.evaluate(()=>DATA.meetings.flatMap(m=>m.segs.map((s,i)=>({tid:m.tid,i,name:s.n,diagram:!!s.art,reference:!!SkillArt.support(m.tid,i)})).filter((s,i)=>i>0&&i<m.segs.length-1)));
  assert.equal(cards.length,81);assert.equal(cards.filter(c=>c.diagram).length,73);assert.equal(cards.filter(c=>c.reference).length,8);
  assert.equal(cards.filter(c=>!c.diagram&&!c.reference).length,0,'all core stages now have dedicated or explicitly reference media');
  assert.equal(await page.evaluate(()=>SkillArt.vectors.length),28,'SVG is used for suitable geometry');
  for(const card of cards){
    await page.evaluate(c=>App.activity(c.tid,c.i),card);await inspect('activity/'+card.tid+':'+card.i,'#modal');
    assert(await page.locator('#modal .modal-content > .safe').isVisible(),'activity safety stays visible');
    if(card.tid==='c02'&&card.i===1){
      assert.deepEqual(await page.locator('#modal .skill-formal-copy li').allTextContents(), await page.evaluate(()=>DATA.facts.promise),'promise text is exact, ordered HTML');
    }
    if(card.tid==='c04'&&card.i===2){
      assert.equal(await page.locator('#modal .skill-instructions ol').count(),1,'command activity retains original teaching steps in expandable details');
      assert.equal(await page.locator('#modal .skill-instructions').getAttribute('open'),null,'do not duplicate full command instructions below picture by default');
      assert.equal(await page.locator('#modal button').filter({hasText:'六個口令逐步卡'}).count(),1,'full six-command reader remains accessible');
    }
    if(card.diagram){const format=await page.evaluate(c=>SkillArt.get(c.tid,c.i).format,card);assert.equal(await page.locator('#modal svg.skill-art').count(),format==='svg'?1:0);}
    await page.evaluate(c=>SkillArt.print(c.tid,c.i),card);await pdf(1,'card '+card.tid+':'+card.i);
  }
  // Scene portraits must follow that scene's cast, not a generic unrelated picture.
  const episodes=await page.evaluate(()=>DATA.jungle.episodes.map(e=>({id:e.id,scenes:e.scenes.map(s=>({cast:s.cast,text:s.text,lesson:s.lesson}))})));
  for(let e=0;e<episodes.length;e++)for(let i=0;i<episodes[e].scenes.length;i++){
    const scene=episodes[e].scenes[i];
    await page.evaluate(([e,i])=>{Jungle.open(e);Jungle.move(i);},[e,i]);
    await inspect('story/'+e+':'+i,'#modal');
    const srcs=await page.locator('.story-cast img').evaluateAll(imgs=>imgs.map(i=>i.getAttribute('src')));
    assert.deepEqual(srcs,scene.cast.map(id=>'assets/jungle/'+id+'.avif'));
    assert.equal(await page.locator('.story-text').innerText(),scene.text,'story not truncated');
    assert((await page.locator('.story-reader > .safe').innerText()).includes(scene.lesson));
    await pdf(1,'story '+e+':'+i);
  }
  for(const id of await page.evaluate(()=>DATA.jungle.characters.map(c=>c.id))){await page.evaluate(id=>Jungle.card(id),id);await inspect('character/'+id,'#modal');}
  const badges=await page.evaluate(()=>App.badgeGroups().flatMap(g=>g.items).concat(App.legacyBadgeGroup().items));
  for(const name of badges){
    await page.evaluate(name=>App.openBadge(name),name);await inspect('badge/'+name,'#modal');
    assert(!(await page.locator('#badge-official').innerText()).includes('正在按'),'official badge text available');
    for(const selected of ['official','suggest']){
      await page.locator('.badge-detail-tabs button').nth(selected==='official'?0:1).click();
      await printMedia(async()=>{
        assert.equal(await page.locator('#app').isVisible(),false,'badge background excluded');
        assert(await page.locator('#badge-'+selected).isVisible());
        assert.equal(await page.locator('#badge-'+(selected==='official'?'suggest':'official')).isVisible(),false,'unselected badge tab does not print');
      });
    }
  }
  await route('#lead');assert(await page.locator('#leadstage .leadcard').isVisible(),'lead route actually mounts current stage');
  await page.evaluate(()=>{Lead.idx=1;Lead.render();});
  await printMedia(async()=>{
    assert(await page.locator('#leadstage').isVisible());
    assert.equal(await page.locator('.field-summary').isVisible(),false,'lead prints only current stage, not all preparation panels');
  });
  await pdf(1,'current projected stage');
  const calls=['Uniform.print(false)','Uniform.print(true)','FieldVisuals.printReference()','FieldVisuals.printFormation()','SaluteLab.print(false)','SaluteLab.print(true)','SalutePositions.print()',...['cards','guide','worksheet'].map(k=>`TrackingKit.print('${k}')`),...await page.evaluate(()=>Ceremony.items.map(c=>`Ceremony.print('${c.id}')`)),...await page.evaluate(()=>FormalKit.cards.map(c=>`FormalKit.print('${c.id}')`)),...await page.evaluate(()=>DATA.meetings.filter(m=>m.practical).map(m=>`Practical.printModal('pack',SessionPack.build(Practical.meeting('${m.tid}'),1,true))`))];
  for(const call of calls){await page.evaluate(call);await pdf(await page.locator('#printarea .psheet').count(),call);}
  await page.evaluate(()=>PackPrint.open('sheet','c01'));
  assert(await page.locator('.writing-space').first().evaluate(e=>e.getBoundingClientRect().height>=80),'worksheets have actual space to draw/write');
  await page.evaluate(()=>Modal.close());
  const paths=await page.evaluate(async()=>[...(await(await fetch('sw.js')).text()).matchAll(/"\.\/(assets\/[^\"]+\.(?:avif|jpg|png))"/g)].map(m=>m[1]));
  assert(paths.every(p=>p.endsWith('.avif')),'all precached teaching raster assets are AVIF (app icons excluded)');
  await page.context().setOffline(true);await page.reload();await page.waitForFunction(()=>typeof SkillArt==='object');
  await page.evaluate(async paths=>{for(const src of paths){const img=new Image();img.src=src;await img.decode();}},paths);
  await page.evaluate(()=>App.activity('c07',1));assert.equal(await page.locator('#modal svg.skill-art').count(),1,'vector works offline');
  await page.evaluate(()=>App.activity('c18',1));
  assert.equal(await page.locator('#modal [data-tracking-key=home] circle').count(),2,'correct end symbol includes outer circle and central dot offline');
  assert.equal(await page.locator('#modal [data-tracking-key=wrong] path').getAttribute('d'),'M55 35 L125 105 M125 35 L55 105');
  const vectorCards=await page.evaluate(()=>Object.entries(SkillArt.map).filter(([key,id])=>SkillArt.vectorCues[id]).map(([key,id])=>({key,id,cues:SkillArt.vectorCues[id]})));
  for(const card of vectorCards){
    await page.evaluate(key=>{const [tid,i]=key.split(':');App.activity(tid,Number(i));},card.key);
    await inspect('offline/'+card.id,'#modal');
    assert.equal(await page.locator('#modal svg.skill-art').count(),1);
    assert.deepEqual(await page.locator('#modal .skill-cues li').allTextContents(),card.cues);
  }
  const illustrated=await page.evaluate(()=>Object.entries(SkillArt.map).filter(([key,id])=>SkillArt.illustrations[id]).map(([key,id])=>({key,id,...SkillArt.illustrations[id]})));
  for(const scene of illustrated){
    await page.evaluate(key=>{const [tid,i]=key.split(':');App.activity(tid,Number(i));},scene.key);
    await inspect('offline/illustration/'+scene.id,'#modal');
    assert.deepEqual(await page.locator('#modal .skill-cues li').allTextContents(),scene.cues,'offline captions stay selectable HTML');
    assert((await page.locator('#modal .skill-art-credit').innerText()).includes('AI輔助插畫'));
  }
  await route('#book?sub=uniform');await inspect('offline/uniform');
  await page.evaluate(()=>Jungle.open(0));await inspect('offline/story','#modal');
  await route('#print');await page.locator('#mini-worksheets .exam-card').first().getByRole('button',{name:'預覽'}).click();
  assert((await page.locator('#modal').innerText()).includes('選擇題'),'exam paper preview works offline');await page.locator('.mx').click();
  assert.equal(await page.locator('#topnav .external-link').getAttribute('aria-disabled'),'true','official external link disabled offline');
  assert.equal(await page.locator('#view a.back').getAttribute('aria-disabled'),null,'internal links still work offline');
  await page.context().setOffline(false);
  await page.setViewportSize({width:1280,height:900});await route('#book');await inspect('desktop/book');
  await page.evaluate(()=>App.activity('c26',2));await inspect('desktop/story-activity','#modal');
  // Reset is scoped to this app, never localStorage.clear() for unrelated apps.
  await Promise.all([page.waitForEvent('load'),page.evaluate(()=>{
    localStorage.setItem('other_app_setting','keep');localStorage.setItem('cub_review_temp','remove');
    window.confirm=()=>true;App.clearLocal();
  })]);
  assert.equal(await page.evaluate(()=>localStorage.getItem('other_app_setting')),'keep');
  assert.equal(await page.evaluate(()=>localStorage.getItem('cub_review_temp')),null);
  assert.deepEqual(errors,[]);
  fs.mkdirSync('.cache',{recursive:true});
  fs.writeFileSync('.cache/app-review-results.json',JSON.stringify({views,prints,cards,badges:badges.length,scenes:episodes.reduce((n,e)=>n+e.scenes.length,0),offlineAssets:paths.length,bookChars,errors},null,2));
  console.log(`APP REVIEW PASS: ${views.length} views, ${cards.length} cards, ${badges.length} badge entries, 20 scenes, ${prints.length} PDF checks, ${paths.length} offline AVIF assets plus SVG source. Handbook ${bookChars} visible characters.`);
}finally{await browser.close();}
