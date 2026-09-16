// Real print-engine regression: selected item only, A4 pagination, AVIF decode and offline cache.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const base = process.env.BASE_URL || 'http://127.0.0.1:8090';
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE || undefined,args:JSON.parse(process.env.CHROMIUM_ARGS || '[]')});
const page = await browser.newPage({viewport:{width:390,height:844}});
const errors = [];
page.on('pageerror', e => errors.push(e.message));
async function ready() {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll('#modal img')].map(i => i.decode()));
  });
}
async function pages(expected, label) {
  await ready();
  const pdf = await page.pdf({format:'A4',preferCSSPageSize:true});
  assert.equal((pdf.toString('latin1').match(/\/Type \/Page\b/g)||[]).length, expected, label);
  assert.equal(await page.locator('[data-print-exclude]').count(),0,'afterprint restores screen');
}
async function isolated(selector) {
  await page.emulateMedia({media:'print'});
  await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
  assert.equal(await page.locator('#app').isVisible(),false,'background list must not print');
  assert(await page.locator(selector).isVisible());
  assert.equal(await page.locator('#modal .mx').isVisible(),false);
  await page.evaluate(() => dispatchEvent(new Event('beforeprint'))); // repeated event remains idempotent
  assert.equal(await page.locator('#app').isVisible(),false);
  await page.evaluate(() => dispatchEvent(new Event('afterprint')));
  await page.emulateMedia({media:null});
}
try {
  await page.goto(base + '/#play');
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.reload();
  if(process.env.TEST_FONT_CSS) await page.addStyleTag({content:fs.readFileSync(process.env.TEST_FONT_CSS,'utf8')});
  const state = await page.evaluate(()=>[curTid(),localStorage.getItem('cub_flow')]);
  // Actual card button from the long A–H list, not just a standalone test fixture.
  await page.locator('#lib-activity .lib-card').first().getByRole('button',{name:'🖨️ 只印呢張'}).click();
  await isolated('#printarea .psheet');
  assert.equal(await page.locator('#printarea .psheet').count(),1);
  await pages(1,'single card from library');
  // Use the real print button; wait for image decode before invoking browser print.
  await page.evaluate(()=>{window.originalPrint=window.print;window.printCalls=0;window.print=()=>{window.printCalls++;dispatchEvent(new Event('beforeprint'));dispatchEvent(new Event('afterprint'));};});
  await page.getByRole('button',{name:'列印',exact:true}).click();
  await page.waitForFunction(()=>window.printCalls===1);
  await page.evaluate(()=>{window.print=window.originalPrint;delete window.originalPrint;});
  await page.locator('.mx').click();
  const keys = await page.evaluate(()=>Object.keys(SkillArt.map));
  for(const key of keys) {
    const [tid,i] = key.split(':');
    await page.evaluate(([tid,i])=>SkillArt.print(tid,Number(i)),[tid,i]);
    await pages(1,key+' mixed-media A4 card');
    await page.evaluate(([tid,i])=>App.activity(tid,Number(i)),[tid,i]);
    assert.equal(await page.locator('.skill-instructions').getAttribute('open'),null);
    assert(await page.locator('#modal .safe').isVisible());
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await pages(1,key+' browser print from activity modal');
    assert.equal(await page.locator('.skill-instructions').getAttribute('open'),null);
  }
  await isolated('#modal .skill-art');
  await page.evaluate(()=>SkillArt.zoom('c06',1));
  await pages(1,'zoomed image still fits one A4');
  const vectorCards=await page.evaluate(()=>Object.entries(SkillArt.map).filter(([key,id])=>SkillArt.vectorCues[id]).map(([key,id])=>({key,id,cues:SkillArt.vectorCues[id]})));
  for(const card of vectorCards){
    await page.evaluate(key=>{const [tid,i]=key.split(':');SkillArt.zoom(tid,Number(i));},card.key);
    assert.equal(await page.locator('#modal svg.skill-art').count(),1);
    assert.deepEqual(await page.locator('#modal .skill-cues li').allTextContents(),card.cues);
    await pages(1,card.id+' vector zoom and HTML cues one A4');
  }
  const scenes=await page.evaluate(()=>Object.entries(SkillArt.map).filter(([key,id])=>SkillArt.illustrations[id]).map(([key,id])=>({key,id,...SkillArt.illustrations[id]})));
  for(const scene of scenes){
    const [tid,i]=scene.key.split(':');
    await page.evaluate(([tid,i])=>SkillArt.zoom(tid,Number(i)),[tid,i]);
    await ready();
    assert.equal(await page.locator('#modal .skill-cues li').count(),3);
    assert.equal(await page.locator('#modal img.skill-art').getAttribute('src'),scene.src);
    assert.deepEqual(await page.locator('#modal img.skill-art').evaluate(img=>[img.naturalWidth,img.naturalHeight]),[scene.width,scene.height]);
    await pages(1,scene.key+' illustration zoom is one A4 with captions');
  }
  await page.evaluate(()=>App.activity('c06',1));
  await page.locator('.skill-instructions summary').click();
  assert(await page.locator('#modal .lsteps').isVisible(),'full text is accessible on demand');
  await pages(1,'expanded leader notes do not duplicate diagram on paper');
  assert.equal(await page.locator('.skill-instructions').getAttribute('open'),'');
  await page.locator('.mx').click();
  // Single worksheets/songs and deliberately selected multiple pages.
  for(const tid of await page.evaluate(()=>DATA.meetings.map(m=>m.tid))) {
    await page.evaluate(tid=>PackPrint.open('sheet',tid),tid);
    await pages(1,tid+' single worksheet');
  }
  const songs = await page.evaluate(()=>Songbook.songs.map(s=>s.id));
  await page.evaluate(id=>Songbook.print(id),songs[0]);
  await pages(1,'single song');
  await page.evaluate(ids=>Practical.printModal('two selected songs',ids.map(id=>Songbook.sheet(id)).join('')),songs.slice(0,2));
  await pages(2,'explicit two-item batch stays two pages');
  // Loading failure exposes complete text rather than leaving an empty teaching card.
  await page.evaluate(()=>{App.activity('c06',1);SkillArt.imageError(document.querySelector('#modal img'));});
  assert(await page.locator('.skill-image-error').isVisible());
  assert(await page.locator('#modal .lsteps').isVisible());
  await page.evaluate(()=>{App.activity('c21',2);SkillArt.imageError(document.querySelector('#modal img'));});
  assert(await page.locator('.skill-image-error').isVisible(),'authored illustration failure is visible');
  assert(await page.locator('#modal .lsteps').isVisible(),'illustration failure restores full teaching steps');
  await page.locator('.mx').click();
  await page.evaluate(()=>Modal.open('<details><summary>Other item</summary><p>Not selected</p></details><h2>Selected item</h2>'));
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>dispatchEvent(new Event('beforeprint')));
  assert.equal(await page.locator('#modal details').isVisible(),false,'closed item headings do not print');
  await page.evaluate(()=>dispatchEvent(new Event('afterprint')));
  await page.emulateMedia({media:null});
  assert.equal(await page.locator('#modal details').getAttribute('open'),null);
  await page.locator('.mx').click();
  // Exam papers print one sheet each; key stays separate.
  await page.evaluate(()=>ExamPapers.print('promise-law'));
  assert.equal(await page.locator('#printarea .exam-sheet').count(),1,'single exam paper prints one sheet');
  assert.equal(await page.locator('#printarea .exam-key').count(),0,'member paper carries no answers');
  await page.locator('.mx').click();
  await page.evaluate(()=>ExamPapers.printKey('promise-law'));
  assert((await page.locator('#printarea').innerText()).includes('唔派畀成員'),'key warns not to hand out');
  await page.locator('.mx').click();
  // No modal: exam index cards stay put on Ctrl+P.
  await page.goto(base+'/#print');
  await page.evaluate(()=>dispatchEvent(new Event('beforeprint')));
  assert.equal(await page.locator('#mini-worksheets .exam-card').count(),8);
  assert.equal(await page.locator('#mini-worksheets details[open]').count(),0);
  await page.evaluate(()=>dispatchEvent(new Event('afterprint')));
  const assets=await page.evaluate(()=>[...new Set(Object.values(SkillArt.map))].map(id=>SkillArt.media(id).src).filter(Boolean));
  await page.context().setOffline(true);
  await page.reload();
  await page.evaluate(async assets=>{
    for(const src of assets){const img=new Image();img.src=src;await img.decode();if(!img.naturalWidth)throw new Error(src);}
  },assets);
  await page.evaluate(()=>App.activity('c06',1));
  await ready();
  assert(await page.locator('#modal img').isVisible());
  for(const scene of scenes){
    await page.evaluate(async key=>{const [tid,i]=key.split(':');Modal.close();setTid(tid);if(location.hash!=='#lead')await new Promise(resolve=>{addEventListener('hashchange',resolve,{once:true});location.hash='#lead';});else App.route();Lead.idx=Number(i);Lead.render();},scene.key);
    await page.evaluate(async()=>{for(const img of document.querySelectorAll('#leadstage img'))await img.decode();});
    assert.equal(await page.locator('#leadstage .skill-art').getAttribute('src'),scene.src,'projection uses new illustration offline');
    assert.equal(await page.locator('#leadstage .skill-cues li').count(),3);
    await pages(1,scene.key+' illustrated projected stage one A4');
  }
  for(const card of vectorCards){
    await page.evaluate(key=>{const [tid,i]=key.split(':');setTid(tid);App.route();Lead.idx=Number(i);Lead.render();},card.key);
    assert.equal(await page.locator('#leadstage svg.skill-art').count(),1,card.id+' vector in offline projection');
    assert.deepEqual(await page.locator('#leadstage .skill-cues li').allTextContents(),card.cues);
    await pages(1,card.id+' vector projected stage one A4');
  }
  await page.evaluate(tid=>setTid(tid),state[0]);
  assert.deepEqual(await page.evaluate(()=>[curTid(),localStorage.getItem('cub_flow')]),state);
  assert.deepEqual(errors,[]);
  console.log('PRINT SCOPE PASS: '+keys.length+' diagram cards and modals are one A4 each; selected worksheets/songs, intentional batches, restored UI, SVG/AVIF offline and missing-image fallback.');
} finally { await browser.close(); }
