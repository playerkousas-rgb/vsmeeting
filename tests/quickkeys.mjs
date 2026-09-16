/* quickkeys：2026-09-15 用戶三點現場回饋的回歸測試
   1) 快鍵頁按鈕要大細一致、撳得中（唔可以再係預設細掣）。
   2) 小隊計分預設4隊，但要可以加隊／改名／刪隊。
   3) 抽籤要可以自己設定有幾個號碼。
   全部只改現場畫面，唔會寫入成員記錄、唔會改今場準備狀態。 */
import fs from "fs";
import vm from "vm";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
let fail = 0;
const ok = (c, msg) => { console.log((c ? "✓ " : "✗ FAIL ") + msg); if (!c) fail++; };

/* 1. CSS：快鍵同計分板要大型、一致 */
{
  const css = read("css/app.css");
  ok(/\.tk-grid\s*\{[^}]*display:\s*grid/.test(css), "快鍵用 grid 排版（每格一樣大）");
  const tkBtn = (css.match(/\.tk-btn\s*\{[^}]*\}/) || [""])[0];
  const minH = Number((tkBtn.match(/min-height:\s*(\d+)px/) || [0, 0])[1]);
  ok(minH >= 88, `.tk-btn 有最小高度 ${minH}px（≥88 先算撳得中）`);
  ok(/width:\s*100%/.test(tkBtn), ".tk-btn 撐滿格（唔會一顆大一顆細）");
  ok(/font:\s*inherit/.test(tkBtn), ".tk-btn 用返全站字級（唔會變瀏覽器預設細字）");
  ok(/\.tk-btn:focus-visible/.test(css), "鍵盤焦點有可見外框");
  const teamBtn = (css.match(/\.team-btns button\s*\{[^}]*\}/) || [""])[0];
  const tapH = Number((teamBtn.match(/min-height:\s*(\d+)px/) || [0, 0])[1]);
  ok(tapH >= 44, `小隊 ＋／－ 掣高度 ${tapH}px（≥44 觸控標準）`);
  ok(/\.scorebar\s*\{[^}]*display:\s*grid/.test(css), "計分板用 grid（每隊卡一樣大）");
}

/* 2. 沙盒：真 JS＋可讀嘅 DOM 樁 */
const mem = {};
const nodes = {};
const mkNode = (id) => ({
  id, innerHTML: "", textContent: "", value: "", className: "", style: {}, dataset: {},
  hidden: false, focused: false,
  classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, toggle(c, on) { on ? this._s.add(c) : this._s.delete(c); }, contains(c) { return this._s.has(c); } },
  appendChild() {}, setAttribute() {}, removeAttribute() {}, insertAdjacentHTML() {},
  querySelector: () => null, querySelectorAll: () => [], closest: () => null,
  focus() { this.focused = true; }
});
const get = (id) => (nodes[id] = nodes[id] || mkNode(id));
const sb = {
  console,
  localStorage: {
    getItem: (k) => (k in mem ? mem[k] : null),
    setItem: (k, v) => { mem[k] = String(v); },
    removeItem: (k) => { delete mem[k]; },
    clear: () => { for (const k in mem) delete mem[k]; }
  },
  location: { hash: "#tools", href: "" },
  navigator: { onLine: true },
  document: {
    getElementById: (id) => get(id),
    createElement: () => mkNode("new"),
    querySelectorAll: () => [], querySelector: () => null,
    body: { ...mkNode("body") }, documentElement: mkNode("html")
  },
  window: {}, addEventListener() {}, scrollTo() {}, confirm: () => true,
  prompt: (msg, def) => (typeof sb.__answer === "string" && sb.__answer !== "" ? sb.__answer : def),
  setTimeout, clearTimeout, setInterval, clearInterval
};
sb.window = sb; sb.globalThis = sb;
vm.createContext(sb);
for (const f of ["js/data.js", "js/jungle-data.js", "js/practical-data.js", "js/guide.js", "js/flow.js", "js/app.js", "js/redesign.js", "js/content.js", "js/jungle.js", "js/practical.js", "js/uniform-ceremony.js", "js/field-visuals.js", "js/salute-lab.js", "js/salute-positions.js", "js/tracking-kit.js", "js/material-desk.js", "js/plain-content.js", "js/worksheet-guides.js", "js/exam-papers.js", "js/skill-art.js", "js/craft-sheets.js", "js/songbook.js"]) {
  vm.runInContext(read(f), sb, { filename: f });
}
const Q = (s) => vm.runInContext(s, sb);

/* 3. 快鍵頁面：四張卡同款結構 */
{
  const html = Q("App.vTools(false)");
  ok(html.includes("快鍵"), "快鍵頁標題保留");
  ok(html.includes('class="tk-grid"'), "快鍵有 tk-grid 容器");
  const cards = [...html.matchAll(/<(?:button|a) class="tk-btn"[\s\S]*?<\/(?:button|a)>/g)].map((m) => m[0]);
  ok(cards.length === 4, `快鍵 ${cards.length} 張大卡（4）`);
  for (const c of cards) {
    ok(/<b>/.test(c) && /<small>/.test(c), "每張卡都有標題＋一行說明：" + c.slice(0, 46).replace(/\s+/g, " ") + "…");
  }
  ok(cards.some((c) => c.includes('href="#teams"')), "小隊計分由快鍵卡入去");
  ok(html.includes('id="toolPickMax"') && /type="number"/.test(html) && /min="1"/.test(html) && /max="200"/.test(html), "抽籤號碼數量輸入框（1–200）");
  ok(html.includes('id="toolpick"'), "抽籤結果區存在");
  ok(Q("App.vTools(true)").includes('onclick="Lead.addTeam()"'), "計分頁有「＋ 加小隊」掣");
  ok(Q("App.vTools(true)").includes('onclick="Lead.resetScores()"'), "計分頁有「分數清零」掣");
}

/* 4. 抽籤：號碼數量由用戶設定 */
{
  ok(Q("Tools.max()") === 12, "抽籤預設 12 個號碼");
  Q("Tools.setMax(30)");
  const pool = Q("Tools.pool()");
  ok(pool.length === 30 && pool[0] === "1號" && pool[29] === "30號", "設定 30 → 抽籤池 1號…30號");
  ok(Q("Tools.max()") === 30 && JSON.parse(mem.cub_pickmax) === 30, "設定記入本機（下次開返仲喺度）");
  Q("Tools.setMax(999)");
  ok(Q("Tools.max()") === 200, "上限夾到 200");
  Q("Tools.setMax('abc')");
  ok(Q("Tools.max()") === 200, "亂輸入唔會清走設定");
  Q("Tools.setMax(1)");
  ok(Q("Tools.pool()").join() === "1號", "設定 1 → 只抽 1號");
  Q("Tools.setMax(6)");
  for (let i = 0; i < 20; i++) {
    const got = Q("Tools.pick()");
    ok(typeof got === "string" && /^[1-6]號$/.test(got), "抽籤結果喺 1–6 之內（" + got + "）");
    break;
  }
  ok(get("toolpick").innerHTML.includes("抽中"), "結果顯示喺快鍵頁（唔靠彈窗）");
  ok(get("toolpickinfo").textContent.includes("1 至 6 號"), "頁面寫明而家抽幾號：" + get("toolpickinfo").textContent);
  Q("Tools.clearPick()");
  ok(get("toolpick").innerHTML === "未抽。", "可以清除結果");
  /* 有填名單時可以改用姓名 */
  Q("Store.set('roster',['陳小狼','李小虎','黃小豹'])");
  get("toolUseRoster").checked = true;
  const namePool = Q("Tools.pool()");
  ok(namePool.length === 3 && namePool[0] === "陳小狼", "揀咗名單 → 抽姓名而唔係號碼");
  ok(/^[陳李黃]/.test(Q("Tools.pick()")), "抽姓名行得通");
  ok(get("toolpickinfo").textContent.includes("名單姓名"), "頁面寫明改用姓名");
  get("toolUseRoster").checked = false;
  ok(Q("Tools.pool()").length === 6, "取消勾選就返去抽號碼");
  Q("Store.set('roster',[])");
}

/* 5. 小隊計分：預設4隊，可加／改／刪 */
{
  ok(Q("Lead.teamList()").join() === "紅隊,黃隊,藍隊,綠隊", "預設 4 隊：紅黃藍綠");
  Q("Lead.renderScore()");
  const board = get("leadscore").innerHTML;
  ok((board.match(/class="team"/g) || []).length === 4, "計分板出到 4 隊");
  ok(board.includes("紅隊") && board.includes("＋1") && board.includes("－1"), "有隊名同加減掣");
  ok(board.includes('onclick="Lead.renameTeam(0)"'), "隊名可以直接撳嚟改名");
  ok(board.includes('onclick="Lead.removeTeam(0)"'), "每隊有刪除掣");
  ok(board.includes('onclick="Lead.add(0,1)"'), "加減用隊序號（隊名有怪字都唔會爆）");
  sb.__answer = "冒險隊";
  Q("Lead.addTeam()");
  sb.__answer = "";
  ok(Q("Lead.teamList()").length === 5 && Q("Lead.teamList()")[4] === "冒險隊", "加得成第 5 隊");
  ok(JSON.parse(mem.cub_teams).join() === "紅隊,黃隊,藍隊,綠隊,冒險隊", "小隊名單有記住");
  sb.__answer = "紅隊";
  Q("Lead.addTeam()");
  sb.__answer = "";
  ok(Q("Lead.teamList()").length === 5, "唔會加重複隊名");
  Q("Lead.add(4,1)"); Q("Lead.add(4,1)");
  ok(Q("Lead.scores['冒險隊']") === 2, "新隊加分正常");
  Q("Lead.add(4,-5)");
  ok(Q("Lead.scores['冒險隊']") === 0, "分數唔會扣到負數");
  sb.__answer = "探險隊";
  Q("Lead.renameTeam(4)");
  sb.__answer = "";
  ok(Q("Lead.teamList()")[4] === "探險隊" && Q("Lead.scores['探險隊']") === 0, "改名連分數一齊搬");
  Q("Lead.removeTeam(4)");
  ok(Q("Lead.teamList()").join() === "紅隊,黃隊,藍隊,綠隊", "刪隊之後返到 4 隊");
  Q("Lead.resetScores()");
  ok(Q("Lead.teamList()").every(function (t) { return Q("Lead.scores")[t] === 0; }), "分數清零");
  /* 舊寫法仍然收 */
  Q("Lead.add('紅隊',3)");
  ok(Q("Lead.scores['紅隊']") === 3, "舊寫法 Lead.add('紅隊',1) 仍然運作");
  /* 分數唔可以入 localStorage（套包唔做記錄） */
  const keys = Object.keys(mem).filter((k) => k.startsWith("cub_"));
  ok(!keys.some((k) => /score|分/.test(k)), "分數冇寫入本機記錄：" + keys.join("／"));
  ok(get("teamcount").textContent.includes("4 隊"), "頁面顯示而家有幾隊：" + get("teamcount").textContent);
  /* 上限：加到 maxTeams 就停 */
  for (let i = 0; i < 30; i++) { sb.__answer = "測試隊" + i; Q("Lead.addTeam()"); }
  sb.__answer = "";
  ok(Q("Lead.teamList()").length === Q("Lead.maxTeams"), "加到上限 " + Q("Lead.maxTeams") + " 隊就停（實際 " + Q("Lead.teamList()").length + "）");
  ok(JSON.parse(mem.cub_teams).length === 16, "本機名單最多 16 隊");
}

/* 6. 唔影響今場準備狀態 */
{
  const before = mem.cub_tid, flow = mem.cub_flow;
  Q("Tools.pick()"); Q("Lead.add(0,1)"); Q("Lead.renderScore()");
  ok(mem.cub_tid === before && mem.cub_flow === flow, "快鍵操作唔會改本機準備狀態");
  ok(Q("typeof App.vTrack") === "undefined" && !/att_/.test(mem.cub_flow || ""), "冇趁機起記錄功能");
}

console.log(fail === 0 ? "\nQUICK KEYS PASS: unified large quick keys, editable team scoreboard, user-set draw numbers, no record side effects" : `\nQUICK KEYS FAIL (${fail})`);
process.exit(fail === 0 ? 0 : 1);
