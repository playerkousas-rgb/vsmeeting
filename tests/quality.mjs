/* quality.mjs — 靜態守門（v55）
 * 1) 官方 widget＋data-app 名（唔准用單一支部名）
 * 2) App.wrap 擴充登記處＋棘輪（冇檔案私自覆寫頁面）
 * 3) 預快取分層（核心 ≤1.5MB；大圖背景補）
 * 4) 綱要主入口直連官方 PDF
 * 5) 真實相片紀律（授權／來源；唔准亂配活動）
 * 6) 列印前自動打開 details
 * 執行：node tests/quality.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
let fail = 0;
const ok = (c, msg) => { console.log((c ? '✓ ' : '✗ FAIL ') + msg); if (!c) fail++; };

/* 1. 意見回報接入 */
{
  const idx = read('index.html');
  ok(idx.includes('https://scout-admin-blue.vercel.app/widget.js'), 'index.html 有 Scout Admin 官方 widget');
  ok(/widget\.js"\s+data-app="深資童軍集會"\s+defer/.test(idx), 'widget 用 data-app="深資童軍集會"＋defer');
  ok(!/data-app="深資童軍"/.test(idx), '唔准用單一支部名「深資童軍」做 data-app（會被歸入專章系統）');
  ok(idx.indexOf('js/app.js') < idx.indexOf('js/enhance.js'), 'enhance.js 喺 app.js 之後載入（App.wrap 先用得）');
  const en = read('js/enhance.js');
  for (const k of ['App.FEEDBACK', 'App.feedbackCard', 'App.feedback', 'App.copyFeedback', 'fb-ta'])
    ok(en.includes(k), 'enhance.js 有 ' + k);
  ok(en.includes('report.html?app=') && en.includes('encodeURIComponent'), '網頁版表單帶 app 參數');
  ok(en.includes('唔好填團員姓名、班別、地址或相片'), '回報卡寫明私隱界線');
  ok(en.includes('離線都用得'), '回報卡寫明離線後備做法');
  ok(read('css/app.css').includes('#scoutw-fab{bottom:calc(var(--tabh,82px)'), '浮動掣升上底部導覽（唔蓋 5 個掣）');
  ok(read('css/app.css').includes('#topnav .navrow a,#tabbar .navrow a{min-height:44px'), '導覽掣 ≥44px');
  const appSrc = read('js/app.js');
  ok(appSrc.includes("setAttribute('aria-current','page')") && appSrc.includes('isExternal'),
    '路由只由 app.js 負責＋外連唔會攞 aria-current');
}

/* 2. App.wrap 擴充登記處＋棘輪 */
{
  const app = read('js/app.js');
  ok(app.includes('App._wrapChain = {}') && app.includes('App.wrap = function') && app.includes('App.wrapOn = function'),
    'app.js 有 App.wrap／App.wrapOn 登記處');
  ok(!/^\s*var\s+prev\s*=\s*App\./m.test(app), 'app.js 冇舊式 var prev = App.xxx 疊加');
  const en = read('js/enhance.js');
  ok(en.includes("App.wrapOn(App.pages, 'plan'") && en.includes("App.wrapOn(App.pages, 'book'"),
    '疊加層經 App.wrapOn 登記（pages.plan／pages.book）');
  const files = fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js') && f !== 'app.js');
  const offenders = [];
  for (const f of files) {
    const src = read('js/' + f);
    if (/App\.pages\.[A-Za-z]+\s*=\s*function/.test(src)) offenders.push(f + ':App.pages.*');
    if (/^\s*var\s+prev\s*=\s*App\./m.test(src)) offenders.push(f + ':var prev');
  }
  ok(offenders.length === 0, '冇檔案私自覆寫頁面（' + (offenders.join('、') || '0 個') + '）');
}

/* 3. 預快取分層 */
{
  const sw = read('sw.js');
  ok(/var CORE = \[/.test(sw) && /var CACHE_EXTRA = \[/.test(sw), 'sw.js 分 CORE／CACHE_EXTRA 兩層');
  ok(/cacheAll\(CORE\)/.test(sw) && /cacheAll\(CACHE_EXTRA\)/.test(sw), '核心先快取；大圖背景補');
  const core = sw.split('var CORE = [')[1].split('];')[0].match(/"(\.\/[^"]+)"/g).map(x => x.slice(1, -1));
  let bytes = 0;
  for (const a of core) { const p = path.join(root, a.slice(2)); if (fs.existsSync(p) && fs.statSync(p).isFile()) bytes += fs.statSync(p).size; }
  ok(bytes <= 1.5 * 1024 * 1024, '核心預快取 ' + (bytes / 1048576).toFixed(2) + ' MB ≤ 1.5 MB（' + core.length + ' 檔）');
  ok(sw.includes('./js/enhance.js'), 'enhance.js 有入核心預快取');
  ok(fs.readFileSync(path.join(root, 'README.md'), 'utf8').includes('scout-v55-enhance-20261022'), 'README cache 版號同步');
}

/* 4. 綱要主入口 */
{
  const data = read('js/data.js');
  const app = read('js/app.js');
  ok(/url: 'https:\/\/drive\.google\.com\/file\/d\/1F8aZSr_/.test(data), 'DATA.source.url 直連綱要官方 PDF');
  ok(data.includes('onlineUrl:') , '保留網上版作後備（onlineUrl）');
  ok(app.includes("DATA.source.url") && app.includes('綱要全文（官方 PDF・主入口）'), '集會目錄主入口用官方 PDF');
  ok((app.match(/DATA\.source\.url/g) || []).length <= 3, '主入口唔重複（DATA.source.url 出現 ≤3 次）');
}

/* 5. 真實相片紀律 */
{
  const figs = read('js/figs.js');
  ok(figs.includes("'game-chairs'") && figs.includes('CC BY-SA 3.0') && figs.includes('commons.wikimedia.org'),
    '唯一真實相片有授權＋來源');
  ok(!/營火反思圈'\s*:\s*'game-chairs'/.test(figs), '音樂椅相片唔再當營火反思圈示範');
  ok(figs.includes("'營火反思圈':'fire-circle'") && figs.includes('非真實相片'), '營火反思圈用平面示意圖並標明');
  ok(/img\/uni（已停用）/.test(read('img/uni/SOURCES.md')), '制服頁冇本地 AI 圖（img/uni 已停用）');
  const uni = read('js/uniform.js');
  ok(!/localImg/.test(uni), 'UNIFORM 冇 localImg（唔用本地 AI 制服圖）');
  ok(uni.includes('www.scout.org.hk/uploads/member/venture_scouts_'), '制服圖只連官方網站');
}

/* 6. 列印前打開 details */
{
  const app = read('js/app.js');
  const fn = app.slice(app.indexOf('App.printPage = function'), app.indexOf('App.printPage = function') + 900);
  ok(/querySelectorAll\('details'\)/.test(fn), 'printPage 列印前掃 details');
  ok(/d\.open = true/.test(fn), '列印前自動打開');
  ok(/afterprint/.test(fn) && /d\.open = false/.test(fn), '印完還原（afterprint）');
}

console.log(fail === 0 ? '\n🎉 quality 全部通過' : '\n❌ quality 有 ' + fail + ' 項失敗');
process.exit(fail === 0 ? 0 : 1);
