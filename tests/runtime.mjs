/* runtime：用 DOM stub 將全部版面（同分頁）render 一次，捉 runtime error／undefined 漏出畫面。
 * 載入次序必須係：c01–c16 lessons → data → 其餘模組 → app（否則 data.js 會 ReferenceError: C01 is not defined）
 * 執行：node tests/runtime.mjs（或 npm run test:runtime）
 */
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let fail = 0;
const ok = (c, msg) => { console.log((c ? '✓ ' : '✗ FAIL ') + msg); if (!c) fail++; };

/* ── 極簡 DOM stub（夠 render 用）── */
function el(tag){
  const classes = new Set();
  const o = {
    tagName: (tag || 'div').toUpperCase(), innerHTML: '', textContent: '', value: '', href: '', id: '', title: '',
    style: {}, dataset: {}, children: [], parentNode: null, attrs: {},
    /* className 同 classList 要同步（同真瀏覽器一樣），否則行為測試冇意義 */
    classList: { add(...c){ c.forEach(x => classes.add(x)); }, remove(...c){ c.forEach(x => classes.delete(x)); },
      toggle(c, v){ if (v === undefined) v = !classes.has(c); v ? classes.add(c) : classes.delete(c); return v; },
      contains(c){ return classes.has(c); } },
    appendChild(c){ if (c) { if (c.parentNode) c.parentNode.children.splice(c.parentNode.children.indexOf(c), 1); c.parentNode = o; o.children.push(c); } return c; },
    insertBefore(c){ return o.appendChild(c); },
    removeChild(c){ const i = o.children.indexOf(c); if (i >= 0) { o.children.splice(i, 1); c.parentNode = null; } return c; },
    setAttribute(k, v){ o.attrs[k] = v; if (k === 'id') o.id = v; if (k === 'class') o.className = v; if (k.startsWith('data-')) o.dataset[k.slice(5)] = v; },
    getAttribute(k){ return o.attrs[k] !== undefined ? o.attrs[k] : null; },
    removeAttribute(k){ delete o.attrs[k]; }, addEventListener(){}, focus(){}, click(){}, remove(){}, matches(){ return false; },
    get className(){ return [...classes].join(' '); },
    set className(v){ classes.clear(); [...String(v || '').split(/\s+/)].filter(Boolean).forEach(c => classes.add(c)); },
    cloneNode(){ const c = el(o.tagName); c.innerHTML = o.innerHTML; c.className = o.className; return c; },
    _all(out){ (o.children || []).forEach(c => { out.push(c); if (c._all) c._all(out); }); return out; },
    querySelectorAll(sel){ const cls = sel.replace(/^\./, '');
      return o._all([]).filter(c => (' ' + (c.className || '') + ' ').includes(' ' + cls + ' ')); },
    querySelector(sel){ return o.querySelectorAll(sel)[0] || null; },
    closest(){ return null; }
  };
  return o;
}
const mem = {};
const body = el('body');
const sb = {
  console,
  localStorage: { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; }, clear: () => { for (const k in mem) delete mem[k]; } },
  location: { hash: '#plan', href: '', replace(){}, assign(){} },
  navigator: { onLine: true, serviceWorker: { register: () => Promise.resolve() } },
  setTimeout: () => 0, clearTimeout(){}, setInterval: () => 0, clearInterval(){},
  addEventListener(){}, scrollTo(){}, confirm: () => true, matchMedia: () => ({ matches: false, addEventListener(){} }),
  fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
  document: Object.assign(el('document'), {
    documentElement: el('html'), body,
    createElement: t => el(t),
    getElementById: id => body._all([]).find(x => x.id === id) || null,
    querySelector: s => body.querySelector(s), querySelectorAll: s => body.querySelectorAll(s),
    addEventListener(){}, head: el('head')
  })
};
sb.window = sb; sb.globalThis = sb;
vm.createContext(sb);

const lessons = fs.readdirSync(path.join(root, 'js')).filter(f => /^c\d\d-/.test(f)).sort().map(f => 'js/' + f);
const files = lessons.concat(['js/data.js', 'js/interests.js', 'js/ceremony.js', 'js/uniform.js', 'js/dia.js', 'js/ayp.js', 'js/figs.js', 'js/items.js', 'js/projector.js', 'js/minigame.js', 'js/app.js']);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sb, { filename: f });
ok(true, '載入次序正確：c01–c16 → data → 模組 → app（' + files.length + ' 個檔案）');

const App = sb.App, DATA = sb.DATA;
ok(!App.__err, 'app.js 載入冇 throw');

/* 全部頁面 render 一次 */
const pages = ['plan', 'play', 'skills', 'uniform', 'ceremony', 'book', 'badges', 'print', 'ayp', 'search'];
for (const p of pages) {
  if (typeof App.pages[p] !== 'function') { ok(false, 'pages.' + p + ' 唔存在'); continue; }
  try { const node = App.pages[p](); ok(!!node, 'pages.' + p + ' render'); }
  catch (e) { ok(false, 'pages.' + p + ' render：' + e.message); }
}

/* 分頁版 render（sub 路由） */
for (const s of ['all', 'camp', 'knot', 'hike', 'aid']) {
  try { const nd = App.pages.skills(s); ok(!!nd, 'skills/' + s + ' render'); } catch (e) { ok(false, 'skills/' + s + '：' + e.message); }
}
for (const s of ['land', 'sea', 'air', 'badge', 'acc', 'check']) {
  try { const nd = App.pages.uniform(s); ok(!!nd, 'uniform/' + s + ' render'); } catch (e) { ok(false, 'uniform/' + s + '：' + e.message); }
}
/* v42：教材頁每場都要 render 到（TEACH 接入點） */
for (const k of ['c01','c02','c03','c04','c05','c06','c07','c08','c09','c10','c11','c12','c13','c14','c15','c16']) {
  try { const nd = App.renderMeeting(k); ok(!!nd, 'renderMeeting/' + k); } catch (e) { ok(false, 'renderMeeting/' + k + '：' + e.message); }
}
for (const c of sb.CEREMONY.cards) {
  try { App.pages.ceremony(c.k); ok(true, 'ceremony/' + c.k + ' render'); } catch (e) { ok(false, 'ceremony/' + c.k + '：' + e.message); }
}
for (const k of ['about','levels','sections','join']) {
  try { App.pages.ayp(k); ok(true, 'ayp/' + k + ' render'); } catch (e) { ok(false, 'ayp/' + k + '：' + e.message); }
}

/* 16 場教案全部 render（分頁化之後每節都要落到 pane） */
for (const m of DATA.meetings) {
  try {
    const node = App.renderMeeting(m.tid);
    const panes = node.querySelectorAll('.tabpane');
    ok(panes.length >= 1, m.tid + ' 教案 render（' + panes.length + ' 版）');
  } catch (e) { ok(false, m.tid + '：' + e.message); }
}

/* 行為測試：教案頁「撳掣即換版」（唔係錨點跳位） */
{
  const page = App.renderMeeting('c16');
  const panes = page.querySelectorAll('.tabpane');
  const btns = page.querySelectorAll('.filter-btn');
  ok(panes.length >= 2 && btns.length === panes.length, 'c16 每節一個分頁掣（' + panes.length + ' 版）');
  const visible = () => panes.filter(p => !p.classList.contains('hidden'));
  ok(visible().length === 1, '一開頭只顯示一版');
  btns[2].onclick();
  const vis2 = visible();
  ok(vis2.length === 1 && vis2[0] === panes[2], '撳第 3 個掣 → 只換成第 3 版（' + (vis2[0] ? vis2[0].getAttribute('data-pane') : '冇') + '）');
  const act = btns.filter(b => b.classList.contains('active'));
  ok(act.length === 1 && act[0] === btns[2], 'active 狀態只落喺撳過嗰個掣');
  ok(btns[2].getAttribute('aria-selected') === 'true' && btns[0].getAttribute('aria-selected') === 'false', 'aria-selected 有跟住更新');
  /* 行動裝置／列印：所有 pane 都仍然喺 DOM（列印時 CSS 會全部展開） */
  ok(panes.length === page.querySelectorAll('.tabpane').length, '分頁內容冇被移除（列印全部展開）');
}

/* 行為測試：活動庫＝單項活動卡（v43：唔再係集會目錄副本） */
{
  const ITEMS = sb.ITEMS;
  const page = App.pages.play();
  const cards = page.querySelectorAll('.item-card');
  const btns = page.querySelectorAll('.filter-btn');
  ok(cards.length === ITEMS.activities.length && btns.length >= 2, '活動庫 ' + cards.length + ' 張單項活動卡＋' + btns.length + ' 個分類掣');
  btns[1].onclick();
  const cat = btns[1].getAttribute('data-cat');
  const shown = cards.filter(c => !c.classList.contains('hidden'));
  ok(shown.length > 0 && shown.every(c => c.getAttribute('data-cat') === cat), '撳「' + cat + '」只顯示該類活動（' + shown.length + ' 個）');
  btns[0].onclick();
  ok(cards.filter(c => !c.classList.contains('hidden')).length === cards.length, '撳「全部」還原所有活動');
  ok(ITEMS.activities.every(x => x.goal && x.flow && x.flow.length >= 3), '每項活動都有目的＋起碼 3 步流程');
}

/* 行為測試：技能頁＝有內容嘅單項技能卡（唔可以只連返教案） */
{
  const ITEMS = sb.ITEMS;
  const page = App.pages.skills('all');
  const cards = page.querySelectorAll('.item-card');
  ok(cards.length === ITEMS.skills.length, '技能頁 ' + cards.length + ' 張技能卡');
  ok(ITEMS.skills.every(x => x.points && x.points.length >= 3), '每張技能卡最少 3 個要點（有內容）');
  ok(ITEMS.skills.every(x => x.check && x.check.length >= 1), '每張技能卡都有「完成標準／檢查」');
  ok(ITEMS.skills.every(x => x.safety), '每張技能卡都有安全欄');
  const btns = page.querySelectorAll('.filter-btn');
  ok(btns.length >= 2, '技能頁有分類篩選（' + btns.length + ' 個）');
  btns[1].onclick();
  const cat = btns[1].getAttribute('data-cat');
  const shown = cards.filter(c => !c.classList.contains('hidden'));
  ok(shown.length > 0 && shown.every(c => c.getAttribute('data-cat') === cat), '撳技能分類「' + cat + '」只顯示該類（' + shown.length + ' 個）');
  const badgeTab = App.pages.skills('badge');
  ok(badgeTab.children.length >= 5, '技能頁「肩章對照」有 4 組官方要求（區塊 ' + badgeTab.children.length + ' 個）');
}

/* 行為測試：聚會 GAME 互動庫（每個分頁都要有內容，唔可以只剩標題） */
{
  const tools = App.printPanel('tools');
  ok(['mg-spy-box','mg-agent-box','mg-dice-box','mg-wheel-box'].every(k => tools.innerHTML.includes(k)), '互動工具分頁有 4 個掛載點（唔係只剩標題）');
  ok(!tools.innerHTML.includes('mg-bj-box'), '唔再有 21 點掛載點（零賭注）');
  ok(typeof sb.MiniGame === 'object' && ['mount','renderSpyUI','renderAgentUI','renderDiceUI','renderWheelUI','spyPrintCards','spyReveal','spyPickPair'].every(k => typeof sb.MiniGame[k] === 'function'), 'minigame.js 載入成功（語法正確）＋4 個 render 函式齊');
  ok(typeof sb.MiniGame.renderBjUI !== 'function' && typeof sb.MiniGame.bjState === 'undefined', '21 點程式碼已移走');
  sb.MiniGame.spyPickPair();
  const st = sb.MiniGame.spyState;
  ok(!!st.pair.civil && !!st.pair.spy && st.pair.civil !== st.pair.spy, '誰是臥底抽詞：平民詞／臥底詞成對且唔同');
  ok(sb.MiniGame.spyClockText(180) === '03:00' && sb.MiniGame.spyClockText(65) === '01:05', '誰是臥底發言計時格式（mm:ss）');
  ok(sb.MiniGame.spyRules.length === 3, '誰是臥底玩法列點（3 條）');
  const gamesP = App.printPanel('games');
  const gCards = gamesP.querySelectorAll('.game-card');
  ok(gCards.length === sb.DATA.games.length, '集會遊戲卡分頁有 ' + gCards.length + ' 個遊戲（有玩法／物資／安全）');
  const sheet = App.printPanel('sheet');
  const html = String(sheet.innerHTML);
  const aid = (html.match(/aid-wrap/g) || []).length;
  const ws = (html.match(/ws-item/g) || []).length;
  ok(aid >= 6 && ws >= 3 && /義勇軍進行曲/.test(html), '即印素材分頁有 ' + aid + ' 張急救卡＋' + ws + ' 張素材卡（誓詞／收繩／國歌）');
}

/* 儀式守門：深資團唔應該有「小隊／家長接送」要求 */
{
  const txt = sb.CEREMONY.cards.map(c => JSON.stringify(c)).join(' ');
  ok(!/小隊長[：:]/.test(txt), '儀式卡冇「小隊長」崗位');
  ok(!/家長接送|須家長接|由家長接|確認有人接/.test(txt), '儀式卡冇「家長接送／等人接」要求');
  ok(/唔設小隊|唔用「小隊」|冇小隊/.test(txt), '儀式卡有寫明「深資唔設小隊」');
  const fin = sb.CEREMONY.cards.find(c => c.k === 'fallin');
  ok(fin && /fall — in/.test(JSON.stringify(fin)), '集隊卡有《步操手冊》第六章口令（Squad, fall — in）');
}

/* 畫面唔應該漏 undefined */
let undef = 0;
for (const p of pages) {
  try { const node = App.pages[p](); if (String(node.innerHTML).includes('undefined')) undef++; } catch (e) {}
}
ok(undef === 0, '全部頁面 HTML 冇漏 "undefined"');

/* 清 agent 字句（app 內可見字句） */
const appSrc = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
for (const bad of ['搵今日集會', '黑箱作業', '一版講一個遊戲', '🅰️', '🅱️']) {
  ok(!appSrc.includes(bad), 'app.js 冇「' + bad + '」字句');
}

console.log(fail === 0 ? '\n🎉 runtime 全部通過' : '\n❌ runtime 有 ' + fail + ' 項失敗');
process.exit(fail === 0 ? 0 : 1);
