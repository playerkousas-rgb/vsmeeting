/* nav：用真 index.html 的下方導覽 markup，逐粒餵入真 App.route()，
   確保「導覽掣寫乜」同「撳落去開乜」永遠對得上（防止兩邊再漂移） */
import fs from "fs";
import vm from "vm";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

const html = read("index.html");
const bot = (html.match(/<nav id="tabbar"[\s\S]*?<\/nav>/) || [""])[0];
const btns = [...bot.matchAll(/<a href="([^"]+)" data-tab="([^"]+)"><span>([^<]*)<\/span>([^<]+)<\/a>/g)]
  .map((m) => ({ href: m[1], tab: m[2], icon: m[3], label: m[4] }));

/* 最細但夠用嘅 DOM：#view 要留低 innerHTML 先讀到渲染結果 */
const mem = {};
const view = { innerHTML: "", className: "", style: {}, dataset: {}, classList: { toggle() {}, add() {}, remove() {} } };
const mk = () => ({ innerHTML: "", className: "", style: {}, dataset: {}, classList: { toggle() {}, add() {}, remove() {} }, appendChild() {}, setAttribute() {} });
const sb = {
  console,
  localStorage: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } },
  location: { hash: "#plan", href: "" },
  navigator: { onLine: true },
  document: {
    getElementById: (id) => (id === "view" ? view : mk()),
    createElement: mk, querySelectorAll: () => [], querySelector: () => null,
    body: mk(), documentElement: mk(),
  },
  window: {}, addEventListener() {}, scrollTo() {}, confirm: () => true,
  setTimeout, clearTimeout, setInterval, clearInterval, open() {},
};
sb.window = sb; sb.globalThis = sb;
vm.createContext(sb);
for (const f of ["js/data.js", "js/jungle-data.js", "js/practical-data.js", "js/guide.js", "js/flow.js", "js/app.js", "js/redesign.js", "js/content.js", "js/jungle.js", "js/practical.js", "js/uniform-ceremony.js", "js/field-visuals.js", "js/salute-lab.js", "js/salute-positions.js", "js/tracking-kit.js", "js/material-desk.js", "js/plain-content.js", "js/worksheet-guides.js", "js/exam-papers.js", "js/skill-art.js", "js/craft-sheets.js", "js/songbook.js"]) {
  vm.runInContext(read(f), sb, { filename: f });
}
const Q = (s) => vm.runInContext(s, sb);

let fail = 0;
const ok = (c, msg) => { console.log((c ? "✓ " : "✗ FAIL ") + msg); if (!c) fail++; };

/* 1. 下方導覽逐粒撳：路由開到 + 真係渲染到對應版面 */
const expect = {
  "#print":  ["素材庫", 'id="mini-worksheets"', 'id="mini-sheets"', 'id="mini-songs"'],
  "#play":   ["活動・技能帶領卡", "森林故事・角色卡"],
  "#badge":  ["活動章工具書", "badge-group-grid"],
  "#jungle": ["森林故事"],
  "#tools":  ["快鍵"],
};
ok(btns.length === 5, `index.html 下方導覽 ${btns.length} 粒（5）`);
for (const b of btns) {
  Q(`location.hash='${b.href}'; App.route()`);
  const out = view.innerHTML;
  ok(Q("App.tab") === b.tab, `撳「${b.icon}${b.label}」→ App.tab='${b.tab}'（實際 '${Q("App.tab")}'）`);
  ok(out.length > 200, `撳「${b.icon}${b.label}」→ #view 有渲染（${out.length} 字）`);
  for (const n of (expect[b.href] || [])) ok(out.includes(n), `撳「${b.icon}${b.label}」→ 版面有「${n}」`);
}

/* 1b. 底欄必須逐項吻合 js/redesign.js 嘅 BOTTOM 宣告（用戶明確要求）。
   之前呢個要求冇棘輪：nav.mjs 只比對自己嘅 expect map，BOTTOM 改咗都唔會爆。 */
{
  const src = read("js/redesign.js");
  const m = src.match(/var BOTTOM = (\[[\s\S]*?\]);/);
  ok(!!m, "redesign.js 讀到 BOTTOM 宣告");
  const BOTTOM = Q("(" + m[1] + ")");
  ok(BOTTOM.length === btns.length, `BOTTOM ${BOTTOM.length} 項 vs tabbar ${btns.length} 粒`);
  BOTTOM.forEach((b, i) => {
    const a = btns[i] || {};
    ok(a.tab === b.id, `第${i + 1}粒 id '${a.tab}'（BOTTOM '${b.id}'）`);
    ok(String(a.icon) === String(b.icon), `第${i + 1}粒 icon '${a.icon}'（BOTTOM '${b.icon}'）`);
    ok(String(a.label).includes(b.title), `第${i + 1}粒 title '${a.label}'（BOTTOM '${b.title}'）`);
  });
}

/* 2. #song 唔再係主導覽掣，舊書籤一律落入合併頁 */
ok(!/#song/.test(bot), "#song 唔再係固定下方導覽掣");
for (const legacy of ["#song", "#songs", "#craft"]) {
  Q(`location.hash='${legacy}'; App.route()`);
  ok(Q("App.tab") === "print", `舊 ${legacy} → 轉入工作紙＋歌曲頁（App.tab='${Q("App.tab")}'）`);
  ok(view.innerHTML.includes("素材庫"), `舊 ${legacy} → 渲染到素材庫，冇孤兒版`);
}

/* 3. 拆咗記錄頁之後，#track 唔可以變死胡同；改名單要有新入口 */
{
  ok(Q("typeof App.vTrack") === "undefined", "App.vTrack 已移除（套包唔做記錄）");
  Q("location.hash='#track'; App.route()");
  ok(view.innerHTML.includes("集會目錄"), "舊 #track 書籤落入集會目錄，唔會死胡同");
  /* 一定要行路由睇實際渲染：App.vPack 被 content.js 覆寫過，
     但 #pack 路由用嘅係 redesign.js 載入時捕獲嘅 app.js 版本 */
  Q("location.hash='#pack'; App.route()");
  ok(view.innerHTML.includes("App.editRoster()"), "出隊包頁（#pack 路由實際渲染）有「改名單」入口");
  ok(!/App\.editRoster|App\.saveAtt/.test(Q("App.vMeetDetail(curMeet())")), "詳細教案頁唔再有記出席卡");
}

/* 4. 素材庫三個小分頁真係切換到（真 App.showMiniTab） */
{
  const mkPane = (startHidden) => {
    const pane = { hidden: startHidden, classList: {} };
    pane.classList.toggle = (c, on) => { if (c === "hidden") pane.hidden = on; };
    return pane;
  };
  const panes = { "#mini-worksheets": mkPane(false), "#mini-sheets": mkPane(true), "#mini-songs": mkPane(true) };
  const tabs = [0, 1, 2].map(() => ({ classList: { add() {}, remove() {} } }));
  const card = { querySelectorAll: () => tabs, querySelector: (s) => panes[s] || null };
  const mkBtn = () => ({ closest: () => card, classList: { add() {}, remove() {} } });
  const shown = () => Object.keys(panes).filter((k) => !panes[k].hidden);
  Q("App.showMiniTab")(mkBtn(), "sheets");
  ok(shown().join() === "#mini-sheets", "撳「圖紙」→ 只顯示圖紙分頁");
  Q("App.showMiniTab")(mkBtn(), "songs");
  ok(shown().join() === "#mini-songs", "撳「歌曲」→ 只顯示歌曲分頁");
  Q("App.showMiniTab")(mkBtn(), "worksheets");
  ok(shown().join() === "#mini-worksheets", "撳「工作紙」→ 只顯示工作紙分頁");
  Q("App.showMiniTab")(mkBtn(), "library");
  ok(shown().join() === "#mini-worksheets", "舊 'library' 掣名照落入工作紙分頁（唔會白屏）");
}

console.log(fail === 0 ? "\nNAV PASS" : `\nNAV FAIL (${fail})`);
process.exit(fail === 0 ? 0 : 1);
