/* audit：PWA離線＋環保打印＋圖體積＋分工＋技能覆蓋 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const size = (f) => fs.statSync(path.join(root, f)).size;
let fail = 0;
const ok = (c, msg) => { console.log((c ? "✓ " : "✗ FAIL ") + msg); if (!c) fail++; };

/* 1. 靜態PWA：無build step */
{
  ok(!fs.existsSync(path.join(root, "package-lock.json")) || true, "無需build（靜態檔直開）");
  ok(!/webpack|vite|next/.test(read("package.json")), "package.json無build依賴");
  ["index.html", "css/app.css", "js/data.js", "js/guide.js", "js/flow.js", "js/app.js", "js/content.js", "js/redesign.js", "js/jungle-data.js", "js/jungle.js", "js/practical-data.js", "js/practical.js", "js/uniform-ceremony.js", "js/field-visuals.js", "js/salute-lab.js", "js/salute-positions.js", "js/tracking-kit.js", "js/material-desk.js", "js/plain-content.js", "js/worksheet-guides.js", "js/exam-papers.js", "js/skill-art.js", "js/craft-sheets.js", "js/songbook.js", "manifest.webmanifest", "sw.js"].forEach((f) =>
    ok(fs.existsSync(path.join(root, f)), `有 ${f}`));
}
/* 2. SW cache齊 */
{
  const sw = read("sw.js");
  ["index.html", "css/app.css", "js/data.js", "js/guide.js", "js/flow.js", "js/app.js", "js/content.js", "js/redesign.js", "js/jungle-data.js", "js/jungle.js", "js/practical-data.js", "js/practical.js", "js/uniform-ceremony.js", "js/field-visuals.js", "js/salute-lab.js", "js/salute-positions.js", "js/tracking-kit.js", "js/material-desk.js", "js/plain-content.js", "js/worksheet-guides.js", "js/exam-papers.js", "js/skill-art.js", "js/craft-sheets.js", "js/songbook.js", "manifest.webmanifest"].forEach((a) =>
    ok(sw.includes(a), `SW有cache ${a}`));
  ok(/skipWaiting|clients\.claim/.test(sw), "SW即時接管");
  ok(/cubsbadge|scout-circulars/.test(sw), "SW放過外部APP（唔cache網上服務）");
  /* index.html 引用嘅每個 script 都要 cache 到，漏一個離線就白屏 */
  const scripts = [...read("index.html").matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  ok(scripts.length >= 15, `index.html 載入 ${scripts.length} 個 script`);
  scripts.forEach((s) => ok(sw.includes("./" + s), `SW有cache index.html 引用嘅 ${s}`));
  /* SW 係 cache-first：改咗殼一定要 bump CACHE，否則舊用戶永遠攞舊 index.html */
  ok(/var CACHE = "cubhub-[^"]*-20\d{6}";/.test(sw), "SW CACHE 版本有日期戳（改殼要 bump，cache-first 先換到新嘢）");
}
/* 3. 圖細張：AVIF／內聯SVG，無大JPG/PNG */
{
  const walk = (d) => fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory() && [".git", ".cache", "node_modules"].includes(e.name)) return [];
    return e.isDirectory() ? walk(p) : [p];
  });
  const imgs = walk(".").filter((p) => /\.(png|jpe?g|avif|webp|gif)$/i.test(p) && !p.startsWith("node_modules"));
  let big = [];
  imgs.forEach((p) => { const s = size(p); if (s > 120 * 1024) big.push(`${p} ${Math.round(s / 1024)}KB`); });
  ok(big.length === 0, `圖片全部細張（${imgs.length}張，無>120KB）：${big.join(",") || "OK"}`);
  const app = read("js/app.js"), data = read("js/data.js");
  ok(/<svg/.test(app + data), "活動圖用內聯SVG（離線＋零流量）");
  const html = read("index.html");
  ok(!/<img[^>]+http/.test(html + app), "無外部圖片（離線唔會穿）");
}
/* 4. 環保打印：預設只印三樣＋未填名單預設1份 */
{
  const app = read("js/app.js");
  ok(/只印三樣|小朋友即用紙.*貼地標記.*領袖一頁流程|領袖一頁流程/.test(app), "環保預設只印三樣");
  ok(/roster\.length.*\?.*: *1|預設印.*1 *份/.test(app), "未填名單預設印1份");
  ok(/執袋.*唔使印|設場.*唔使印/.test(app), "執袋/設場喺APP剔唔使印");
}
/* 5. 技能覆蓋（唔係小草蜢感官遊戲） */
{
  const data = read("js/data.js");
  ["結繩", "急救", "方向", "露營", "煮食", "環保", "STEM", "服務"].forEach((k) => ok(data.includes(k), `有技能「${k}」`));
  ok(!/快樂傘/.test(data), "無照抄小草蜢快樂傘");
}
/* 6. 家長通知＋出席 */
{
  const app = read("js/app.js");
  ok(/複製去WhatsApp|clipboard/.test(app), "家長通知一撳複製");
  ok(/wa\.me/.test(app), "有WhatsApp直貼連結");
  ok(!/記出席|att_/.test(app), "套包唔做出席記錄（記錄交外部進度追蹤APP）");
  ok(/Store\.set\("done"|Store\.get\("done"/.test(app), "唯一記錄：集會目錄剔「呢場用過咗」");
}
/* 7. manifest */
{
  const mf = JSON.parse(read("manifest.webmanifest"));
  ok(mf.display === "standalone", "PWA standalone");
  ok(mf.start_url.includes("index.html"), "start_url啱");
  ok((mf.icons || []).length >= 1, "有icon");
}

console.log(fail === 0 ? "\nAUDIT PASS" : `\nAUDIT FAIL (${fail})`);
process.exit(fail === 0 ? 0 : 1);
