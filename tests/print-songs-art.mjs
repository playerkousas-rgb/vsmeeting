/* print-songs-art：列印＋素材庫回歸測試（2026-09-15 更新）
   1) 列印隔离：點哪項印哪項（body.print-pack 只出 #printarea；冇預覽就唔印彈窗）。
   2) 素材庫實裝：獨立試卷庫逐份可印（成員卷／領袖答案分開）；圖紙係成員跟做紙；
      歌曲有跟唱卡同A4歌紙，冇死掣 toast。集會反思紙保留喺出隊包（跟集會印）。
   3) 活動／技能圖解：每個對映鍵都有真實節、SVG 齊開齊埋、附自繪聲明；可單印一張圖解卡。 */
import fs from "fs";
import vm from "vm";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let fail = 0;
const ok = (c, msg) => { console.log((c ? "✓ " : "✗ FAIL ") + msg); if (!c) fail++; };

const mem = {};
const el = () => ({ innerHTML: "", className: "", style: {}, textContent: "", value: "", href: "", dataset: {}, appendChild() {}, setAttribute() {}, removeAttribute() {}, insertAdjacentHTML() {}, querySelector: () => null, querySelectorAll: () => [], closest: () => null });
const sb = {
  console,
  localStorage: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; }, clear: () => { for (const k in mem) delete mem[k]; } },
  location: { hash: "#plan", href: "" },
  navigator: { onLine: true },
  document: { getElementById: () => el(), createElement: () => el(), querySelectorAll: () => [], querySelector: () => null, body: { ...el(), classList: { toggle() {}, add() {}, remove() {} } }, documentElement: el(), addEventListener() {}, fonts: {} },
  window: {}, addEventListener() {}, scrollTo() {}, confirm: () => true, setTimeout, clearTimeout, setInterval, clearInterval,
};
sb.window = sb; sb.globalThis = sb;
vm.createContext(sb);
for (const f of ["js/data.js", "js/jungle-data.js", "js/practical-data.js", "js/guide.js", "js/flow.js", "js/app.js", "js/redesign.js", "js/content.js", "js/jungle.js", "js/practical.js", "js/uniform-ceremony.js", "js/field-visuals.js", "js/salute-lab.js", "js/salute-positions.js", "js/tracking-kit.js", "js/material-desk.js", "js/plain-content.js", "js/worksheet-guides.js", "js/exam-papers.js", "js/skill-art.js", "js/craft-sheets.js", "js/songbook.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), sb, { filename: f });
}
const Q = (s) => vm.runInContext(s, sb);

/* 1. 列印隔离 CSS */
{
  const css = fs.readFileSync(path.join(root, "css/app.css"), "utf8");
  ok(/body\.print-pack #app[\s\S]{0,200}display: none !important/.test(css), "print-pack 時背後 #app 唔出紙");
  ok(/body\.print-pack #modal \.modal-content > \*:not\(#printarea\)\s*\{\s*display: none !important/.test(css), "print-pack 時彈窗只留 #printarea（標題／說明／掣唔出紙）");
  ok(/body:not\(\.print-pack\):not\(\.modal-open\) #modal\s*\{\s*display: none !important/.test(css), "冇彈窗冇預覽直接列印時彈窗唔出紙（只印當前畫面）");
  ok(/body\.print-pack #modal \.mx\s*\{\s*display: none !important/.test(css), "列印時收埋彈窗關閉掣");
  /* 第二層：開咗活動卡／任何彈窗而未開預覽 → 只印彈窗嗰項，背後清單（A–H）唔出紙 */
  ok(/body\.modal-open:not\(\.print-pack\) #app[\s\S]{0,220}display: none !important/.test(css), "modal-open 列印時背後 #app（成頁清單）唔出紙");
  ok(/body\.modal-open:not\(\.print-pack\) #modal \.modal-content\s*\{/.test(css), "modal-open 列印時出彈窗內容");
  ok(/body\.modal-open:not\(\.print-pack\) #modal button[\s\S]{0,80}display: none !important/.test(css), "modal-open 列印時收埋彈窗內嘅掣");
  const app = fs.readFileSync(path.join(root, "js/app.js"), "utf8");
  ok(/classList\.add\("modal-open"\)/.test(app) && /classList\.remove\("modal-open"\)/.test(app), "Modal.open/close 維護 body.modal-open");
  ok(/addEventListener\("beforeprint"/.test(app) && /addEventListener\("afterprint"/.test(app), "beforeprint 隔離目標、afterprint 還原");
}

/* 2. 素材庫三個分頁實裝 */
{
  const p = Q("App.vPrint()");
  ok(p.includes('id="mini-worksheets"') && p.includes('exam-grid'), "工作紙分頁係獨立試卷庫（唔跟集會編號）");
  ok(!p.includes('sheet-entry'), "工作紙分頁唔再有集會索引（已搬去試卷庫）");
  const papers = Q("ExamPapers.papers");
  ok(papers.length >= 6, `試卷庫有 ${papers.length} 份卷（≥6）`);
  papers.forEach((pp) => {
    ok(!!pp.title && !!pp.topic && pp.mins >= 5 && pp.sections.length >= 2, `${pp.id} 有標題／主題／時間／至少兩部分`);
    ok(Q(`ExamPapers.sheet('${pp.id}',false)`).includes('class="psheet exam-sheet'), `${pp.id} 成員卷係單張A4`);
    ok(!Q(`ExamPapers.sheet('${pp.id}',false)`).includes('exam-key'), `${pp.id} 成員卷唔含答案`);
    ok(Q(`ExamPapers.sheet('${pp.id}',true)`).includes('exam-key') && Q(`ExamPapers.sheet('${pp.id}',true)`).includes('唔派畀成員'), `${pp.id} 領袖答案有答案＋唔派警告`);
  });
  ok(Q("ExamPapers.get('nope')") === undefined && Q("ExamPapers.sheet('nope')") === '', "唔存在嘅試卷唔會出空紙");
  ok(p.includes('id="mini-sheets"') && p.includes('craft-card'), "圖紙分頁有手工卡（Craft）");
  ok(p.includes('id="mini-sheets"') && p.includes('sheet-print-grid'), "圖紙分頁有剪卡／題紙列印掣");
  ok(p.includes('id="mini-songs"') && p.includes("Songbook.open("), "歌曲分頁係真實歌卡（Songbook.open）");
  ok(!/onclick="toast\('🎵|onclick="toast\('📣|onclick="toast\('🔥/.test(p), "歌曲分頁冇再用死掣 toast 扮實裝");
  ok(Q("App.vSongs()") === p && Q("App.vSong()") === p, "舊 #songs／#song 路由仍指同一素材庫");
  ok(Q("typeof Content!=='undefined' && typeof Content.worksheetIndex==='function'"), "Content.worksheetIndex 存在（#sheets 仍可用）");
  /* 集會反思紙保留喺出隊包：跟集會印，唔喺素材庫出現 */
  ok(Q("SessionPack.build(Practical.meeting('c01'),1,true)").includes('工作紙領袖參考'), "出隊包仍連埋嗰場反思紙領袖參考");
  ok(Q("Practical.summary(Practical.meeting('c01'))").includes("WorksheetGuide.open('c01')"), "集會摘要仍有反思紙點答入口");
  const craft = Q("Craft.items");
  ok(craft.length >= 4, `圖紙有 ${craft.length} 個小手工`);
  craft.forEach((c) => {
    ok(c.mats.length >= 3 && c.steps.length >= 3 && !!c.safety && !!c.leader, `${c.id} 有物料／步驟／安全／領袖提示`);
    ok(!!c.recordTitle && !!c.record, `${c.id} 有跟做記錄表（派畀成員填）`);
    ok(fs.existsSync(path.join(root, c.img)) || c.img.includes('assets/skills/'), `${c.id} 用現有圖，唔會開新圖檔`);
  });
  const sheet = Q("Craft.sheet('bracelet')");
  ok((sheet.match(/class="psheet/g) || []).length === 1, "手工跟做紙係單張A4");
  ok(sheet.includes('唔當考驗完成'), "跟做紙寫明唔當考驗完成");
  ok(sheet.includes('跟住做') && sheet.includes('領袖簽名'), "跟做紙有打剔步驟同簽名位（成員用）");
  ok(!sheet.includes('領袖提示'), "跟做紙唔印領袖提示（留喺畫面）");
  ok(Q("Craft.get('nope')") === undefined && Q("Craft.sheet('nope')") === '', "唔存在嘅手工唔會出空紙");
  Q("var __cap='';Modal.open=function(h){__cap=h;};");
  Q("Craft.open('bracelet')");const opened = Q("__cap");
  ok(opened.includes('物料') && opened.includes('做法') && opened.includes('⛑️') && opened.includes('領袖提示'), "手工卡有物料／做法／安全／領袖提示");
  ok(opened.includes("Craft.print('bracelet')"), "手工卡可以直接印嗰張圖紙");
  Q("__cap='';Craft.open('nope')");ok(Q("__cap") === '', "唔存在嘅手工唔會開彈窗");
  Q("__cap='';Craft.print('nope')");ok(Q("__cap") === '', "唔存在嘅手工唔會叫列印");
}

/* 3. Songbook 內容與界線 */
{
  const songs = Q("Songbook.songs");
  ok(songs.length >= 6, `歌曲／口號 ${songs.length} 首（≥6）`);
  songs.forEach((s) => {
    ok(Array.isArray(s.lines) && s.lines.length >= 4 && s.lines.every((l) => ["領", "眾", "合"].includes(l[0]) && l[1]), `${s.id} 每句有領／眾／合標記`);
    ok(!!s.tune && !!s.use && Array.isArray(s.lead) && s.lead.length >= 1 && !!s.actions, `${s.id} 有旋律來源／用途／動作／帶法`);
    ok(s.kind === "traditional" || s.kind === "original", `${s.id} 類別明確（${s.kind}）`);
  });
  ok(songs.some((s) => s.kind === "original" && /自編/.test(s.tune)), "自編口號標明「自編」，唔冒充官方");
  ok(songs.filter((s) => s.kind === "traditional").every((s) => /公有領域|流通/.test(s.tune)), "傳統歌標明公有領域／流通版本");
  songs.forEach((s) => {
    const sh = Q(`Songbook.sheet('${s.id}')`);
    ok(sh.includes('class="psheet song-sheet"') && sh.includes("p-foot"), `${s.id} A4歌紙含版面同來源腳註`);
  });
  ok((Q("Songbook.songs.map(function(s){return Songbook.sheet(s.id);}).join('')").match(/class="psheet song-sheet"/g) || []).length === songs.length, "印今晚歌單＝每首一張");
  ok(Q("Songbook.formal").length === 3 && Q("Songbook.formal").every((f) => f.open), "正式文字入口（團呼／誓詞／口令）開既有已核卡");
  ok(!/誓詞|規律|銘言/.test(Q("Songbook.songs.map(function(s){return s.lines.map(function(l){return l[1];}).join('');}).join('')")), "歌曲歌詞唔改寫正式誓詞／規律／銘言原文");
  /* 2026-09-15 旋律修正回歸：只播已核對嘅譜，未核對嘅唔造假 */
  ok(Q("Object.keys(SongPlayer.melodies).sort().join(',')") === 'campfire-burning,kumbayah,parting,shalom', "內置旋律得4首已核對（其餘跟領袖唱）");
  ok(Q("Songbook.hasMelody('together')") === false && Q("Songbook.hasMelody('wolf-tail')") === false, "旅團曲調未核對：唔提供假旋律");
  ok(Q("Songbook.hasMelody('ready-call')") === false, "自編口號本來就無旋律");
  ok(JSON.stringify(Q("SongPlayer.melodies['kumbayah'].notes.slice(0,3)")) === JSON.stringify([[60,1],[64,1],[67,1]]), "Kumbaya 開頭 C-E-G（舊錯譜 C-E-G-E 已換）");
  ok(Q("SongPlayer.melodies['shalom'].notes[0][0]") === 57 && Q("SongPlayer.melodies['shalom'].notes.some(function(n){return n[0]===74;})"), "Shalom 係D小調：A3起板＋有高音D5（舊C大調錯譜已換）");
  ok(JSON.stringify(Q("SongPlayer.melodies['parting'].notes.slice(0,4).map(function(n){return n[0];})")) === JSON.stringify([55,60,60,60]), "臨歧頌開頭 G-C-C-C（Auld Lang Syne，舊C-E開頭錯譜已換）");
  ok(Q("Songbook.get('parting').lead.join('')").includes('併唱'), "臨歧頌歌卡提醒十字句配八字旋律");
}

/* 4. SkillArt 圖解 */
{
  const map = Q("SkillArt.map"), art = Q("SkillArt.art");
  const keys = Object.keys(map);
  ok(keys.length >= 20, `圖解對映 ${keys.length} 節（≥20）`);
  keys.forEach((k) => {
    ok(!!art[map[k]] || !!Q("SkillArt.illustrations")[map[k]], `對映鍵 ${k} → ${map[k]} 有圖`);
    const [tid, i] = k.split(":");
    const m = Q(`DATA.meetings.find(function(x){return x.tid==='${tid}';})`);
    ok(!!m && !!m.segs[Number(i)], `${k} 對應真實集會節`);
    ok(Number(i) > 0 && Number(i) < m.segs.length - 1, `${k} 用喺教學節（唔係集合／回顧例行段）`);
  });
  keys.forEach((k) => {
    const a = Q(`SkillArt.get('${k.split(":")[0]}',${k.split(":")[1]})`);
    ok(!!a, `${k} has actual teaching media`);
    if (!a.svg) {
      ok(a.kind==='illustration' && a.visual.includes('AI輔助插畫'), `${k} is a real illustration without fake SVG source`);
      return;
    }
    ok(a && (a.svg.match(/<svg/g) || []).length === (a.svg.match(/<\/svg>/g) || []).length, `${k} SVG 開埋齊`);
    ok(a.svg.includes("自行繪製示意圖") && a.svg.includes("非官方圖樣"), `${k} 圖內標明自繪・非官方`);
    ok(!/undefined|NaN/.test(a.svg), `${k} SVG 無 undefined／NaN`);
  });
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  [...new Set(Object.values(map))].forEach(id => {
    const media=Q(`SkillArt.media('${id}')`);
    if(media.format==='svg') {
      ok(media.src===null && sw.includes('./js/skill-art.js'), id+' uses cached vector source, no duplicate raster');
      ok(!sw.includes('./assets/skills/'+id+'.avif'), id+' no AVIF forced on line diagram');
    } else {
      const bytes=fs.readFileSync(path.join(root,media.src));
      ok(bytes.subarray(4,40).toString().includes('avif'), id+' is real AVIF');
      ok(bytes.length<120*1024 && sw.includes('./'+media.src), id+' compact and precached');
    }
  });
  ok(Q("SkillArt.vectors.length")===28, '28 geometry diagrams render as SVG');
  const illustrations=Q("SkillArt.illustrations");
  ok(Object.keys(illustrations).length===42, 'forty-two separately authored scenes, not rasterized line drawings');
  ok(Q("Object.keys(SkillArt.art).filter(id=>SkillArt.media(id).kind==='legacy-diagram').length")===3, 'three legacy diagrams still explicitly pending (knots)');
  for(const [id,picture] of Object.entries(illustrations)) {
    const key=keys.find(key=>map[key]===id), [tid,i]=key.split(':');
    const sheet=Q(`SkillArt.sheet('${tid}',${i})`);
    ok(picture.cues.length===3 && picture.cues.every(c=>c.length<=26), id+' has three concise HTML cues');
    ok(sheet.includes(picture.src) && sheet.includes(picture.credit) && picture.cues.every(c=>sheet.includes(c)), id+' paper uses current picture, cues and provenance');
    ok(!sw.includes('./assets/skills/'+id+'.avif'), id+' superseded raster is not precached');
    ok(fs.statSync(path.join(root,picture.src)).size<60*1024, id+' illustration under 60 KiB');
  }
  const vector1=Q("SkillArt.get('c07',1).image"), vector2=Q("SkillArt.get('c07',1).image");
  ok(vector1.includes('<svg') && !vector1.includes('<img'), 'compass actually renders vector, not a rasterized SVG');
  ok(vector1.match(/id="sa-arrow-[0-9]+"/)[0]!==vector2.match(/id="sa-arrow-[0-9]+"/)[0], 'each SVG instance has unique marker IDs');
  const scene=Q("SkillArt.get('c01',2)");
  ok(scene.kind==='illustration' && scene.image.includes('cup-tower-scene.avif'), 'cup tower uses separately authored illustration');
  ok(scene.visual.includes('AI輔助插畫') && scene.visual.includes('skill-cues'), 'illustration has truthful provenance and real HTML captions');
  ok(Q("SkillArt.sheet('c01',2)").includes('AI輔助插畫') && !Q("SkillArt.sheet('c01',2)").includes('圖為本套包自繪'), 'print does not misattribute AI artwork');
  ok(Q("SkillArt.get('c06',1).image").includes('alt=') && Q("SkillArt.thumb('c06',1)").includes('loading="lazy"'), 'raster alt text and lazy thumbnails');
  /* 圖已接返入帶領資料：投影頁 .ldia 讀 s.svg */
  keys.forEach((k) => {
    const [tid, i] = k.split(":");
    ok(Q(`DATA.meetings.find(function(x){return x.tid==='${tid}';}).segs[${i}].art`) === map[k], `${k} 嘅節已掛上圖解（s.svg／s.art）`);
  });
  ok(Q("SkillArt.get('c03',3).svg")===null && Q("SkillArt.get('c02',2).svg")===null, 'new coverage does not invent SVG placeholders');
  ok(Q("SkillArt.get('c11',3).id")==='handover' && Q("SkillArt.get('c11',2).id")==='card-making', 'handover is attached to actual handover stage, not card-making');
  const care = [['c04',3,'ask-leader'],['c10',1,'food-check'],['c10',3,'snack-tidy'],['c12',2,'hike-kit'],['c19',3,'next-goal'],['c21',3,'exploration-art'],['c22',1,'progress-story'],['c22',3,'summer-plan']];
  for(const [tid,i,id] of care) ok(Q(`SkillArt.get('${tid}',${i}).id`)===id, tid+':'+i+' has dedicated care/planning art');
  for(const [tid,i,words] of [
    ['c04',3,['未答就約再跟','不承諾']],
    ['c10',1,['吞嚥需要','實際食品標示','交叉接觸']],
    ['c10',3,['不能安全保存唔留','衞生']],
    ['c12',2,['三件用品用途','唔干擾野生動物','不等於實際遠足']],
    ['c19',3,['家庭配合先徵求同意','唔等於獲章','長期進度']],
    ['c21',3,['作品展唔展由本人決定','不公開比較身材、能力或成績']],
    ['c22',1,['口述','邊個幫過','照片需有合適同意']],
    ['c22',3,['同成人','情況要停','分享日期']]
  ]) { const sheet=Q(`SkillArt.sheet('${tid}',${i})`); for(const word of words) ok(sheet.includes(word), tid+':'+i+' retains '+word); }
  const sharing = [['c01',3,'group-card'],['c02',3,'good-deed-plan'],['c13',1,'festival-discovery'],['c19',2,'requirements-check'],['c22',2,'next-questions'],['c25',2,'travel-explain']];
  for(const [tid,i,id] of sharing) ok(Q(`SkillArt.get('${tid}',${i}).id`)===id, tid+':'+i+' has matching sharing/planning art');
  for(const [tid,i,words] of [
    ['c01',3,['主辦機構','合作約定','家庭地址','不預填或猜旅號']],
    ['c02',3,['銘言「準備」','先取得同意','本週','不要求私人證據照片','未實踐只記計劃']],
    ['c13',1,['其他節日先核資料','傳說不當唯一歷史事實','不批評沒有慶祝']],
    ['c19',2,['適用版本','指定徽章要求','過渡安排','不當眾比較','沒有核准結果']],
    ['c22',2,['唔用幼童軍制度估','只在正式安排下頒已核准徽章','跟進人','不因年齡或能力']],
    ['c25',2,['唔自行試路','同行大人確認','不作導航或過路教學','不寫真實住址']]
  ]) { const sheet=Q(`SkillArt.sheet('${tid}',${i})`); for(const word of words) ok(sheet.includes(word), tid+':'+i+' retains '+word); }
  const learning = [['c02',1,'promise-reading'],['c04',2,'command-compare'],['c14',1,'origin-timeline'],['c14',2,'five-sections']];
  for(const [tid,i,id] of learning) ok(Q(`SkillArt.get('${tid}',${i}).id`)===id, tid+':'+i+' has source-aligned learning art');
  const promiseSheet=Q("SkillArt.sheet('c02',1)");
  for(const line of Q('DATA.facts.promise')) ok(promiseSheet.includes('<li>'+line+'</li>'), 'exact formal promise line remains HTML: '+line);
  ok(promiseSheet.includes('圍坐跟讀不是正式宣誓儀式') && promiseSheet.includes('不因忘詞羞辱'), 'learning scene is not a ceremony and allows support');
  const commandSvg=Q("SkillArt.get('c04',2).svg");
  for(const index of [3,4,5]) ok(commandSvg.includes(Q(`Ceremony.get('commands').steps[${index}][1]`)), 'command heading uses shared reviewed source '+index);
  ok(commandSvg.includes('立正 → 右轉 → 暫時解散') && commandSvg.includes('立正 → 右轉 → 敬禮') && commandSvg.includes('等領袖回禮 → 散會'), 'Fall Out and Dismiss are distinct, never direct unsupervised leaving');
  ok(commandSvg.includes('Fall In先立正，領袖放下手號後才成At Ease。') && Q("SkillArt.sheet('c04',2)").includes('未交接者仍由領袖照顧'), 'formation follows hand signal and adult handover is preserved');
  const timeline=Q("SkillArt.get('c14',1).svg"), sections=Q("SkillArt.get('c14',2).svg");
  for(const year of ['1857','1907','1908']) ok(timeline.includes(year), 'core timeline year '+year);
  ok(timeline.indexOf('1857')<timeline.indexOf('1907') && timeline.indexOf('1907')<timeline.indexOf('1908') && timeline.includes('白浪島實驗露營') && timeline.includes('《少年警探》出版'), 'birth, camp and publication stay separate and ordered');
  for(const card of Q('DATA.fieldDecks.sections.cards')) ok(sections.includes(card.front), 'section uses shared name '+card.front);
  ok(sections.includes('不是年齡表、職級表或自動晉團次序') && Q("SkillArt.sheet('c14',2)").includes('不把所有成員描述成只有一種性別或能力'), 'section diagram has no invented ages, rank markings or automatic advancement');
  const boundaries=Q("SkillArt.sheet('c03',1)"), network=Q("SkillArt.sheet('c03',3)"), call=Q("SkillArt.sheet('c08',1)");
  ok(boundaries.includes('唔係你嘅錯') && boundaries.includes('唔碰人') && boundaries.includes('醫療'), 'no blame, no contact rehearsal and care exceptions remain on paper');
  ok(network.includes('唔承諾絕對保密') && network.includes('唔使公開資料') && network.includes('不自行盤問'), 'support network preserves privacy and disclosure safeguards');
  ok(call.includes('不能撥號') && call.includes('999') && call.includes('唔自己搬傷者') && call.includes('真實緊急情況'), 'pretend calls stay distinct from genuine emergencies');
  const preparation = [['c05',1,'departure-check'],['c09',3,'return-check'],['c12',1,'route-plan'],['c12',3,'weather-stop'],['c23',2,'activity-clothes'],['c24',2,'safe-helping']];
  for(const [tid,i,id] of preparation) ok(Q(`SkillArt.get('${tid}',${i}).id`)===id, tid+':'+i+' newly covered with relevant media');
  const route=Q("SkillArt.get('c12',1)");
  ok(route.format==='svg' && route.visual.includes('skill-cues') && route.visual.includes('不可作導航'), 'route is real vector with readable HTML cues and non-navigation warning');
  ok(!sw.includes('route-plan.avif'), 'new vector has no redundant raster asset');
  ok(Q("SkillArt.sheet('c05',1)").includes('成人照顧隊頭隊尾'), 'departure sheet retains adult supervision requirements');
  ok(Q("SkillArt.sheet('c09',3)").includes('唔離隊搵'), 'missing equipment does not prompt leaving group');
  ok(Q("SkillArt.sheet('c12',3)").includes('唔投票硬行') && Q("SkillArt.sheet('c12',3)").includes('扭傷唔自己處理完繼續行'), 'weather scenario retains stopping and injury constraints');
  ok(Q("SkillArt.sheet('c24',2)").includes('清潔劑、火、電、高處工作交大人'), 'safe helping retains specific adult-only tasks');
  const community = [['c05',3,'park-facility'],['c09',1,'kit-choice'],['c11',1,'needs-first'],['c11',2,'card-making'],['c13',2,'festival-art'],['c13',3,'festival-safety']];
  for(const [tid,i,id] of community) ok(Q(`SkillArt.get('${tid}',${i}).id`)===id, tid+':'+i+' newly covered with matching activity art');
  ok(Q("SkillArt.get('c11',1).format")==='svg' && !sw.includes('needs-first.avif'), 'needs comparison is genuine vector, not an unnecessary raster');
  for(const [id,cues] of Object.entries(Q("SkillArt.vectorCues"))) {
    const [tid,i]=keys.find(k=>map[k]===id).split(':');
    ok(cues.length===3 && cues.every(c=>c.length<=26 && Q(`SkillArt.sheet('${tid}',${i})`).includes(c)), id+' keeps three concise vector captions as HTML');
  }
  ok(Q("SkillArt.sheet('c05',3)").includes('配圖不代替實地參觀'), 'park illustration is not proof of actual visit');
  ok(Q("SkillArt.sheet('c09',1)").includes('不把藥當道具'), 'equipment choices retain medicine restriction');
  ok(Q("SkillArt.sheet('c11',1)").includes('未有接收單位') && Q("SkillArt.sheet('c11',2)").includes('未交接只記準備'), 'confirmed needs and preparation/service distinction remain');
  ok(Q("SkillArt.sheet('c13',2)").includes('不使用明火、熱熔膠或尖銳竹枝') && Q("SkillArt.sheet('c13',3)").includes('不用節日食物作強制試食'), 'festival art does not replace safety with decoration');
  const makers = [['c15',1,'model-plan'],['c15',3,'model-review'],['c16',1,'waste-choice'],['c16',3,'waste-week'],['c17',1,'bridge-predict'],['c17',3,'bridge-report']];
  for(const [tid,i,id] of makers) ok(Q(`SkillArt.get('${tid}',${i}).id`)===id, tid+':'+i+' now has activity-specific media');
  for(const id of ['model-review','bridge-predict']) ok(Q(`SkillArt.media('${id}').format`)==='svg' && !sw.includes(id+'.avif'), id+' remains a real comparison vector');
  ok(Q("SkillArt.sheet('c15',1)").includes('模型唔畀人坐、企或爬'), 'model planning retains non-load-bearing limit');
  ok(Q("SkillArt.sheet('c15',3)").includes('同一紙旗') && Q("SkillArt.sheet('c15',3)").includes('不代替正式紮作考驗'), 'model revision retains same test object and formal boundary');
  ok(Q("SkillArt.sheet('c16',1)").includes('不從垃圾桶取物') && Q("SkillArt.sheet('c16',1)").includes('接收點規則'), 'waste choices use clean samples, not blanket recyclability');
  ok(Q("SkillArt.sheet('c16',3)").includes('一週後分享') && Q("SkillArt.sheet('c16',3)").includes('唔使買新'), 'waste trial needs follow-up, not purchasing');
  ok(Q("SkillArt.sheet('c17',1)").includes('紙張、跨度、紙杯、放杯位置一樣') && Q("SkillArt.sheet('c17',1)").includes('唔係測試結果'), 'prediction card keeps controlled variables and no fabricated outcome');
  ok(Q("SkillArt.sheet('c17',3)").includes('其他條件唔變') && Q("SkillArt.sheet('c17',3)").includes('手離開橋下'), 'report card preserves fair comparison and safe testing');
  const practice = [['c18',2,'tracking-walk'],['c18',3,'tracking-record'],['c20',2,'compass-practice'],['c20',3,'help-practice'],['c21',1,'gentle-warmup'],['c23',3,'weather-backup'],['c24',3,'helping-review'],['c25',3,'community-manners']];
  for(const [tid,i,id] of practice) ok(Q(`SkillArt.get('${tid}',${i}).id`)===id, tid+':'+i+' newly illustrated with matching practice content');
  const tracking=Q("SkillArt.get('c18',1).svg");
  for(const index of [0,3,4]) {
    const glyph=Q(`TrackingKit.svg(${index})`).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
    ok(tracking.includes(glyph), 'activity tracking example '+index+' shares actual TrackingKit drawing');
  }
  ok(tracking.includes('M55 35 L125 105 M125 35 L55 105') && tracking.includes('<circle cx="90" cy="70" r="5" fill="#222"/>'), 'wrong-way is a cross and home is circle plus central dot');
  ok(!tracking.includes('M520 134 v18') && !tracking.includes('M290 120 h44'), 'incorrect old tracking tails removed');
  ok(!fs.existsSync(path.join(root,'assets/skills/tracking.avif')), 'obsolete incorrect tracking raster is removed, not served as fallback');
  ok(Q("SkillArt.sheet('c18',1)").includes('安全位停') && !Q("SkillArt.sheet('c18',1)").includes('返約定位置搵領袖'), 'lost-route message consistently says stop safely and ask leader');
  ok(Q("SkillArt.sheet('c18',3)").includes('非香港官方原圖') && Q("SkillArt.sheet('c18',3)").includes('不自行回家'), 'tracking worksheet provenance and end-of-route rule survive printing');
  ok(Q("SkillArt.sheet('c20',2)").includes('四、八定十六') && Q("SkillArt.sheet('c20',2)").includes('唔係即時指南針'), 'compass practice is individual record, not live navigation');
  ok(Q("SkillArt.sheet('c20',3)").includes('不能撥號') && Q("SkillArt.sheet('c20',3)").includes('真實緊急情況'), 'call rehearsal is separated from genuine emergency help');
  ok(Q("SkillArt.sheet('c21',1)").includes('痛、暈、呼吸唔舒服') && Q("SkillArt.sheet('c21',1)").includes('唔強拉或彈震'), 'warm-up retains symptoms and no forced stretching');
  ok(Q("SkillArt.sheet('c24',3)").includes('兩個生活習慣另外記') && Q("SkillArt.sheet('c24',3)").includes('不即日當完成一週要求'), 'weekly task and habit records stay separate and truthful');
  ok(Q("SkillArt.sheet('c25',3)").includes('不衝出門模擬過路'), 'corridor example does not become road-crossing practice');
  const medical = Q("SkillArt.sheet('c08',3)");
  ok(medical.includes('10至15分鐘') && medical.includes('呼吸困難') && medical.includes('999'), '急救時間與立即求醫条件保留為HTML，不只在圖裡');
  /* 單張圖解卡：點哪節印哪節 */
  const sh = Q("SkillArt.sheet('c06',1)");
  ok((sh.match(/class="psheet/g) || []).length === 1 && sh.includes("圖解帶領卡") && sh.includes("assets/skills/overhand.avif"), "c06 反手結圖解卡＝單張A4");
  ok(Q("SkillArt.sheet('c06',0)").includes("呢節以文字帶法為主"), "例行段冇圖時坦白講明，唔硬塞");
  ok(Q("App.libraryCards('skill')").includes("skill-thumb"), "技能卡格仔有圖縮圖");
  ok(Q("App.libraryCards('activity')").includes("lib-tag"), "活動卡标明有圖解／文字卡");
  ok((Q("App.libraryCards('activity')").match(/只印呢張/g) || []).length >= 10 && (Q("App.libraryCards('skill')").match(/只印呢張/g) || []).length >= 10, "活動／技能卡格仔有「🖨️ 只印呢張」單張列印鈕");
}

console.log(fail === 0 ? "\nPRINT/SONGS/ART PASS: print isolation, real worksheets+songs tab, sing-along cards with A4 sheets, per-stage skill diagrams" : `\nPRINT/SONGS/ART FAIL (${fail})`);
process.exit(fail === 0 ? 0 : 1);
