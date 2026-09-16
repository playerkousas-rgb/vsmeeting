/* ui：導覽規則＋嚮導條＋外部APP掣＋打印樣式 */
import fs from "fs";
import vm from "vm";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
let fail = 0;
const ok = (c, msg) => { console.log((c ? "✓ " : "✗ FAIL ") + msg); if (!c) fail++; };

const html = read("index.html");
const css = read("css/app.css");
const app = read("js/app.js");
const flowCode = read("js/flow.js");

/* 1. 上下導覽各最多4粒 */
{
  const top = (html.match(/<nav id="topnav"[\s\S]*?<\/nav>/) || [""])[0];
  const bot = (html.match(/<nav id="tabbar"[\s\S]*?<\/nav>/) || [""])[0];
  const tn = (top.match(/<a /g) || []).length, bn = (bot.match(/<a /g) || []).length;
  ok(tn === 5, `上面入口列 ${tn} 粒（5）`);
  ok(bot.includes('href="#jungle"') && bot.includes('森林故事'), '下方有森林故事直接入口');
  ok(!bot.includes('href="#teams"'), '小隊不再佔下方入口');
  ok(read('js/jungle.js').includes("a.getAttribute('href')==='#jungle'"), '森林故事頁高亮自己的入口');
  ok(bn === 5, `下面工具箱 ${bn} 粒（5）`);
  ok(!/一二三四|步驟一|Step 1/.test(top + bot), "導覽掣無標一二三四扮流程");
  /* 下方導覽必須同 js/redesign.js 的 BOTTOM 一模一樣（防止兩邊漂移） */
  const redesign = read("js/redesign.js");
  const bottomSrc = (redesign.match(/var BOTTOM = \[([\s\S]*?)\n  \];/) || ["", ""])[1];
  const entries = [...bottomSrc.matchAll(/\{id:'([^']+)',\s*icon:'([^']+)',\s*title:'([^']+)'/g)]
    .map((m) => ({ id: m[1], icon: m[2], title: m[3] }));
  const btns = [...bot.matchAll(/<a href="#([^"]+)" data-tab="([^"]+)"><span>([^<]*)<\/span>([^<]+)<\/a>/g)]
    .map((m) => ({ href: m[1], tab: m[2], icon: m[3], label: m[4] }));
  ok(entries.length === 5, `redesign.js BOTTOM ${entries.length} 項（5）`);
  ok(btns.length === bn, `下方導覽解析到 ${btns.length} 粒掣（同 <a> 數一致）`);
  entries.forEach((e, i) => {
    const b = btns[i] || {};
    ok(b.href === e.id && b.tab === e.id, `第${i + 1}粒去 #${e.id}（實際 #${b.href} / data-tab=${b.tab}）`);
    ok(b.icon === e.icon, `第${i + 1}粒圖示 ${e.icon}（實際 ${b.icon}）`);
    ok(b.label === e.title, `第${i + 1}粒文案「${e.title}」（實際「${b.label}」）`);
  });
  ok(!/#song/.test(bot), "#song 唔再係固定下方導覽掣");
  ok(bot.includes('href="#badge"') && bot.includes("活動章"), "下方有活動章直接入口");
  ok(/badge:\s*App\.vBadge/.test(redesign), "#badge 路由指去 App.vBadge()");
}
/* 2. 嚮導每步四要素齊（做咩n／點解why／動作掣btn／go） */
{
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(flowCode, ctx);
  ok(ctx.Flow.STEPS.length === 5, `嚮導 ${ctx.Flow.STEPS.length} 步（5：揀→印→執袋→設場→帶領）`);
  ctx.Flow.STEPS.forEach((s) => {
    ok(!!(s.k && s.n && s.why && s.btn && s.go), `嚮導「${s.n}」四要素齊（做咩/點解/掣/go）`);
  });
  const keys = ctx.Flow.STEPS.map((s) => s.k);
  ["pick", "print", "bag", "venue", "lead"].forEach((k) => ok(keys.includes(k), `嚮導有「${k}」步`));
  /* 定位：套包只幫人「帶集會」，唔幫人記錄。記錄交右上角嘅進度追蹤APP／通告圖書館引流。 */
  ["rec", "sync"].forEach((k) => ok(!keys.includes(k), `嚮導冇「${k}」步（記錄唔屬於呢個套包）`));
  ok(keys[keys.length - 1] === "lead", "嚮導最後一步係「帶領」，帶完即散會");
  ok(!/下一步/.test(ctx.Flow.STEPS.map((s) => s.btn).join("")), "嚮導無「下一步」掣（要做完自動跳）");
  ok(/邀請|帶我由頭做到尾/.test(flowCode) || /帶我由頭做到尾/.test(app), "有邀請卡「第一次帶集會？我帶你由頭做到尾」");
  ok(/quit/.test(flowCode) && /唔再彈|唔使帶/.test(flowCode + html), "可退出，退咗唔再彈");
  ok(/s\.tid!==t|s\.tid\s*!==|tid/.test(flowCode), "換第二場自動重頭計");
}
/* 3. 外部APP掣：連結正確＋新分頁＋rel＋離線變灰 */
{
  const data = read("js/data.js");
  ok(data.includes("https://cubsbadge.vercel.app/"), "進度APP網址啱");
  ok(data.includes("https://scout-circulars.vercel.app/"), "通告圖書館網址啱");
  ok((app.match(/target="_blank"/g) || []).length >= 3, "外部掣新分頁開（target=_blank ≥3處）");
  ok((app.match(/rel="noopener"/g) || []).length >= 3, "外部掣有 rel=noopener");
  ok(/要上網先用得/.test(app + html), "離線掣變灰＋顯示「要上網先用得」");
  ok(/navigator\.onLine|online.*offline|offline/.test(app), "有handle離線（online/offline監聽）");
  /* 三個位＋兩個位 */
  /* 定位：套包只幫帶集會，唔做記錄。內部冇記錄頁，只留引流去外部進度追蹤APP。 */
  ok(!/vTrack/.test(app), "冇內部記錄頁（App.vTrack 已移除）");
  ok(!/att_/.test(app), "冇出席剔格儲存（att_ 已移除）");
  ok(/幼童軍進度追蹤系統/.test(app), "手冊有引流大卡去外部進度追蹤系統");
  ok(!/同步落進度追蹤APP/.test(flowCode), "嚮導唔再有「同步落進度追蹤APP」步驟");
  ok(/相關APP|相關APP/.test(app), "手冊有「相關APP」區");
  ok(/睇最新通告同活動/.test(app), "年度計劃頁有細卡「睇最新通告同活動」");
  ok(/今天／七天／三十天|七天／三十天/.test(app), "通告文案有教時間視窗");
  ok(/唔好.*再.*獎章資料庫|唔好喺套包再起一套|獎章資料庫/.test(app), "文案講清分工（唔喺套包再做獎章DB）");
}
/* 4. 打印樣式：A4＋隱藏兩列＋嚮導條 */
{
  ok(/@media print/.test(css), "有打印樣式");
  ok(/@page/.test(css) && /A4/.test(css), "A4實際尺寸");
  ok(/#topnav|#tabbar/.test(css) && /none/.test(css), "打印隱藏導覽列");
  ok(/#flowbar/.test(css), "打印隱藏嚮導條");
}
/* 5. 投影帶領六件套 */
{
  ["全螢幕|requestFullscreen", "計時|startTimer", "AudioContext|beep|音效|吹哨", "計分|scores", "抽籤|pick"].forEach((k) =>
    ok(new RegExp(k).test(app), `投影有「${k}」`));
  ok(/大字|lsay|26px/.test(app + css), "投影大字");
}
/* 6. typeof保護 */
{
  const hooks = (app.match(/typeof (Flow|Guide|PackPrint|Bag|Venue|Lead|Modal|EXTERNAL|DATA)/g) || []).length;
  ok(hooks >= 5, `嚮導hook有typeof保護（${hooks}處）`);
  ok(/typeof\s+App\s*!==\s*"undefined"|typeof\s+Flow\s*!==\s*"undefined"/.test(flowCode + html), "index/flow有typeof保護");
}
/* 7. 廣東話口語＋動詞開頭抽查 */
{
  ok(/撳|睇|剔|帶|記|執|開|去/.test(app), "文案動詞開頭（撳/睇/剔/帶/記…）");
  ok(!/请|您/.test(app), "無書面語「请/您」");
}

console.log(fail === 0 ? "\nUI PASS" : `\nUI FAIL (${fail})`);
process.exit(fail === 0 ? 0 : 1);
