# 深資童軍團集會助手 — Handover Notes（交下一個 Agent 用）

> 最後更新：2026-09-17
> 目前 branch：`arena/01a0a9bb-vsmeeting`（v39：**深資童軍版** — 16 場＋7 套儀式卡＋獎章查閱＋AYP，前端零 SVG）
>
> **v39 快照（睇呢段就夠；下面 v19–v38 係歷史記錄）**
> - **深資童軍版全量重建**：16 場教案（會員章 c01–c06／肩章認識 c07–c09／肩章技能 c10–c16）、7 套儀式卡（無團呼）、深資制服 6 款（官網原圖 link-only）、獎章 20 項（會員章 11＋肩章 7＋獎章路 2，只查不記）、繩結 9 個、地圖 1:20,000、急救 5 種＋復原臥式；v39：底部第 5 格由營火會改做 AYP（概覽＋三級＋五科＋參加，只查不記）。
> - **組織**：執委會制（主席／副主席／秘書／司庫／康樂總務）＋團員大會；集隊由執委會帶，領袖監禮；考章＝團內考核 7 步，報班＝通告圖書館 7 步。
> - **已刪走嘅童軍支部內容**：c17–c24 教案、團呼卡、拖木頭挑戰場地圖、小隊制度／小隊長、興趣組 33 章、區報章系統、童軍版繩結 10／地圖 1:25,000／急救 7 種；sw 已唔再預緩存 `img/badge/`＋`img/uni/`（檔仲喺 disk，未刪）；v39 加：營火會頁（流程／歡呼／人手／帶唱／歌單 14／安全）＋素材庫歌紙分類＋fire-circle/fire-song 插畫。
> - **v36／v37 舊快照（架構沿用）**
> - **制服 9 張位置圖**（`img/dia/uniform-{chest,zoom,sleeve,body,scarf,ties,kilwell,cap,branch}.avif`）＝乾淨制服底圖（AI 生成中性衣物、零徽章）＋**程式照《儀容與制服手冊》疊位置線／尺寸線／①–⑨ 編號**；章位一律由條文決定，AI 只出底圖（守住 v21 禁令）。前端經 `IMG.html('uniform.<key>')` 出圖。
> - **前端零 SVG（v37）**：`js/diagrams.js`＋`js/svg-kit.js`（76KB 手繪 SVG 字串）已經搬去 `assets_src/diasvg/*.src.js`（build-only，唔入 bundle）；`js/dia.js` 用 `IMG.map`（54 張 AVIF＋尺寸＋alt）自動砌返 `DIAGRAMS.*`，所以 `app.js`／`ceremony.js` 嘅寫法完全不變，但出到嘅一定係 `<img src="img/dia/*.avif">`。圖載唔到＝`IMG.fallback()` 出 alt 文字（冇 SVG 後備）。
> - `img/icon-192.svg` → `assets_src/icons/icon-192.svg`（只有 icon 來源仲係 SVG，唔會 ship）。
> - 測試：`npm test` = smoke＋runtime；smoke 有「37 個前端檔案零 `<svg>`／`.svg` 引用／inline SVG data URI」＋「IMG.map 54 張全部經 DIAGRAMS 出 img」＋「`js/dia.js` 冇 `IMG.svg`」守門，幾何斷言（0.05px/mm、30°、文字唔出框）改讀 `assets_src/diasvg/`。
> 本文件係交俾下一個 Agent 接手時嘅工作記錄，包含產品定位、技術架構、已完成項目、代碼約定、下一步優先次序。

---

## 1. 項目是什麼

**深資童軍團集會助手** = 深資童軍支部（15–20 歲）團集會助手 PWA，俾領袖帶隊用。Scout System 出品。
- 參考：童軍 Scout Hub UI/架構（同殼同 5+5，同無 build step）
- 內容來源：《深資童軍訓練綱要》+ 官方 2026-09-01 深資童軍團集會套包
- 定位：**領袖帶隊工具**，上方 5 tab 畀新領袖（集會目錄跟流程做＋儀式／制服／套包／手冊必修知識）＋下方 5 tab 畀熟手領袖（心中有想法，直接搵料）
- 主色：**森林綠 #2E7D32 + 金色 #F9A825**
- Icon：自製森林綠底＋金色百合花飾（fleur-de-lis），喺 `icons/icon-192.png`、`icons/icon-512.png`（唔用 Cubs Hub 嗰套 emoji icon）

## 2. 10 個 Tab（5+5 架構）

**上方 5 tab**：
| Tab | 狀態 | 說明 |
|---|---|---|
| 📅 集會目錄（plan） | ✅ 16/16 全完成！ | 16 場規劃表格（階段篩選），撳 tid 入教案詳情 |
| 🎪 集會儀式（ceremony） | ✅ 7 套儀式卡 | 開始/結束儀式、中式隊列、升旗、宣誓、三指敬禮、集合解散（無團呼） |
| 👕 制服（uniform） | ✅ 深資 6 款＋佩戴 ①–⑨＋配件＋自查 | 服式圖連總會官網原圖（link-only，唔本地存） |
| 📦 官方套包（official） | ✅ 外連 | 深資支部官方集會套包 Drive PDF |
| 📖 手冊（book） | ✅ 誓詞/規律/銘言＋執委會＋工具＋考章＋報班＋參考 | 含「團內考核 7 步」+「報考訓練班（訂閱通告圖書館）7 步」 |

**下方 5 tab**：
| Tab | 狀態 | 說明 |
|---|---|---|
| ✂️ 素材庫（print） | ✅ 5 類真分頁 | 16 場工作紙逐張印＋6 張急救卡＋誓詞卡＋收繩卡＋國歌升旗 |
| 🎮 活動（play） | ✅ 13 個遊戲 | 玩法/人數/物資/安全/場地圖（11 有圖＋2 破冰無圖） |
| 🪢 技能（skills） | ✅ 9 分頁 | 繩結 9 口訣＋收繩/地圖/指南針/露營/先鋒/追蹤/郊野/急救 |
| 🎖️ 獎章（badges） | ✅ 20 項 | 會員章 11＋肩章 7＋獎章路 2，考核要求＋建議方式＋教案連結 |
| 🌟 AYP（ayp） | ✅ 4 分頁 | 概覽/三級要求/五科介紹/點參加（只查不記） |

**頂欄**（icon-only 按鈕）：🔍 全站搜尋 ＋ 🔗 參考資料（外部工具集中喺 `#book/refs`：深資綱要網上版＋官方套包＋通告圖書館）

## 3. 重要用戶約定（唔可以改）

0. **v39 深資版約定**：①tab 內容要分頁 ②會員章＋肩章由團內考核，獎章 tab 只查不記、唔放報章系統 ③唔出繩結逐步圖卡（文字口訣為準）④儀式/活動/技能要補圖（獎章唔使）⑤唔做營火會歌紙／歡呼庫（深資營火由團員自務）；AYP 只查不記、數字以官方為準 ⑥列印指邊印邊 ⑦工作紙：上面教案「跟住做」＋素材庫「直接印」兩邊都要 ⑧集會目錄整行可撳
1. **唔好抄 Cubs Hub 嘅 emoji icon**——用自製森林綠+金百合花飾（v19 已更新為 192/512/maskable 三 size，原圖來自 generate_image）
2. **完全移除森林故事**（幼童軍先有，童軍支部冇）
3. **第 4 tab = 🪢 技能；第 5 tab 已由 🔥 營火歌改為 🌟 AYP**（v39 用戶指示：深資營火由團員自務，唔做歌紙；取代 v19 約定）
4. **「獎章」tab 做會員章 11＋肩章 7＋獎章路 2**，只查不記；考核由團安排，訓練班經通告圖書館
5. **唔做考核記錄／獎章判定／出席記錄**
6. **深資制服服式圖連總會官網原圖**（`https://www.scout.org.hk/uploads/member/venture_scouts_*.jpg`，link-only，唔本地存，唔好自己整/改圖）；深資軟帽唔係貝雷帽
7. **儀式內容唔自己作**，動作要領文字化；中式隊列參考總會《中式隊列指引》PDF
8. **誓詞/規律/銘言照《深資童軍訓練綱要》**，唔好亂改字眼
9. **「如何報考訓練班」**必須教用通告圖書館訂閱：通知面板 → 剔支部/分類 → 啟用通知 → 手機加入主畫面
10. **恆常集會為主、特別集會（大會操/宣誓/創辦人日/露營）另設篩選**；執委會帶活動、領袖做顧問
11. **恆常集會 90 分鐘，段數按教案實際節數**（c01–c03/c05–c15 係 8 段，c04 大會操 5 段，c16 露營 7 段）
13. **🚫 集會套包只教「會員章＋日常集會」級別**（v29 用戶指示，v38 沿用）：深階步操**唔放喺 app**——由領袖自己上職前／進階訓練班＋人手一份《步操手冊》研讀。app 內只留：基本姿勢（立正・稍息・休息・睇齊）・敬禮・升旗禮儀・宣誓・集合／解散・基本整隊，加上手冊連結同「呢啲屬進階」嘅講明。深資集會唔設團呼。**測試已經鎖死**（`tests/smoke.mjs` v29 段會 fail 如果深階內容翻咗嚟），唔好為咗「完整」再搬返入面。
12. **🚫 唔准生成「制服圖」**（v21 用戶指正：AI 一定畫錯帽章／巾圈／袋蓋／布章位置）。AI 插畫只畫**中性練習衫**（灰T＋深灰短褲、冇帽冇領巾冇章），目標只係俾領袖睇明**動作／站位／程序**；制服標準一律用官網圖＋《儀容與制服手冊》。同埋唔出：繩結逐步圖、營火袍布章插畫（呢啲屬制服／徽章範圍，只用平面圖解＋文字）

## 4. 已完成教案（16/16 場，狀態：✅ full:true）🎉

| tid | 主題 | 獎章 | 形式 | 特色檔案標記 |
|---|---|---|---|---|
| c01 | 破冰＋童軍運動目的 | 會員章・理解 | 恆常（90min・8 段） | P.O.R. 第一章、分組旗、期望工作紙 |
| c02 | 世界及香港童軍運動＋隊列 | 會員章・理解 | 恆常（90min・8 段） | WOSM、時間線比賽、中式隊列 |
| c03 | 國旗國徽區旗區徽 | 會員章・認識 | 恆常（90min・8 段） | 升掛禮儀＋情境題 |
| c04 | 香港童軍大會操 | — | **特別室外（全日）** | special + outdoor（集體外出觀摩） |
| c05 | 國歌＋升旗 | 會員章・認識 | 恆常（90min・8 段） | 國歌教唱、升旗程序、模擬升旗 |
| c06 | 宣誓集會 | 會員章・宣誓 | 特別（90min・8 段） | special + **sensitive:true**（Safe from Harm＋兩人規則）＋頒會員章 |
| c07 | 認識深資童軍支部 | 肩章・認識 | 恆常（90min・8 段） | 執委會制、獎章路 |
| c08 | 列席執委會會議 | 肩章・認識 | 恆常（90min・8 段） | 真會議列席＋會議記錄實習 |
| c09 | 童軍創辦人紀念日活動 | 肩章・認識 | 特別（90min・8 段） | special（貝登堡故事、思善卡、服務策劃） |
| c10 | 急救 | 肩章・技能 | 恆常（90min・8 段） | 5 種＋復原臥式＋情境賽＋C10.firstaid 速查表 |
| c11 | 地圖種類及圖例 | 肩章・技能 | 恆常（90min・8 段） | 1:20,000、圖例測驗 |
| c12 | 指南針＋戶外定向 | 肩章・技能 | 室外（90min・8 段） | outdoor（正置地圖、校園定向） |
| c13 | 繩結（一） | 肩章・技能 | 恆常（90min・8 段） | 平/接繩/八字/雙套＋C13.knots 速查表 |
| c14 | 繩結（二）＋收繩 | 肩章・技能 | 恆常（90min・8 段） | 稱人/繫木/三編結＋收繩保養＋九結大點名＋C14.knots/C14.ropeCare |
| c15 | 露營策劃＋烹調實習 | 肩章・技能 | 恆常（90min・8 段） | 計劃書、氣爐刀具安全、煮食、執包比賽 |
| c16 | 兩日一夜露營＋頒發肩章 | 肩章・技能 | **特別室外（兩日一夜・7 段）** | special + outdoor（紮營煮食營火拔營＋頒肩章） |

**16 場已全數完成！🎉**（v38 深資版重建；舊 c17–c24 已刪除）

## 5. 檔案結構

```
vsmeeting/
├── index.html              # 入口（載入所有 js）
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service Worker（版本號 scout-v{N}-c{XX}-YYYYMMDD）
├── css/app.css             # 所有樣式
├── README.md               # 公開 README
├── HANDOVER.md             # ← 你而家睇緊
├── POSITIONING.md          # 初期定位確認記錄
├── package.json            # 只有 npm test 指令
├── icons/
│   ├── icon-192.png        # 192×192 自製百合花飾 PNG
│   └── icon-512.png        # 512×512
├── assets_src/
│   ├── diasvg/
│   │   ├── diagrams.src.js # build-only：指南針／背囊／追蹤符號手繪 SVG 底稿
│   │   └── svg-kit.src.js  # build-only：儀式／遊戲／技能／營火手繪 SVG 底稿（前端唔會下載）
│   └── icons/icon-192.svg  # icon 原始 SVG（前端只 ship PNG）
├── js/
│   ├── dia.js              # IMG.map（53 張 AVIF＋尺寸＋alt）＋自動砌 DIAGRAMS（前端唯一出圖路徑；cer.howl／uniform.branch 底稿保留，app 唔用）
│   ├── app.js              # 核心：路由、App.renderMeeting()、所有 page render
│   ├── data.js             # DATA 物件：meetings[] 16 場、facts、games（13 個）、EXTERNAL 外連
│   ├── interests.js        # INTERESTS：獎章 20 項（會員章 11＋肩章 7＋獎章路 2）、howToApply（團內考核＋報班流程）
│   ├── ceremony.js         # CEREMONY：7 套儀式卡（無團呼，含 refs 連結）
│   ├── uniform.js          # UNIFORM：深資 6 款規格＋neckwear/kilwell/beltSocks＋placement＋checklist＋shop
│   ├── c01-lesson.js ~ c16-lesson.js  # 16 個完整教案（含 C10.firstaid/C13.knots/C14.knots/C14.ropeCare 速查表）
└── tests/
    ├── smoke.mjs           # 主要 test（16 場＋全部 tab＋圖解幾何＋深資守則）
    └── runtime.mjs         # 全部頁面 render＋行為測試（`npm test` 兩個一齊跑）
```

**注意**：tests/ 資料夾仲有幾個舊嘅 *.mjs 檔（audit/browser-*/content/nav/practical/print-songs-art/quickkeys/ui）係前期遺留，**唔係**現行測試——現行用 `tests/smoke.mjs`＋`tests/runtime.mjs`。唔好因為其他 test 壞而卡住，可以留低/刪除都得。

## 6. 教案物件結構（重要代碼約定）

每個 `Cxx` 物件可以包含以下欄位（全部 optional，按場次屬性 render）：

```js
var C12 = {};
C12.timing = { prepWeek, leaderMeeting, setBefore, packAfter, venue };
C12.leaderPrep = [{when, what}] | [string]; // 兩種格式都支援
C13.knots / C14.ropeCare / C10.firstaid / ...  // 隨教案自訂速查表（技能 tab 會用）
C12.program = [                             // 必備，段數按教案實際節數
  {
    label: '段落名', min: 分鐘（c04/c16 無 min，時間跟大會／營期）,
    steps: [string,...],                    // 新格式（c10+）
    leader: {leader:'...', exec:'...'} | string,  // exec＝執委會分工（舊 patrol 欄位保留兼容）
    leaderScript: '...',                    // 段內領袖講稿（新格式，app.js 會渲染為金色 callout）
    materials: '...' | mats: [...],         // 物資（新舊格式）
    safety: '...',                          // 段內安全提示（新格式）
    // 舊格式仲支援：sub[], activities[], talking[], blocks[], tip, key
  },
];
C12.bpMessage / C12.bpMessage = '...';     // 可放教案特設文字
C12.roles = [{role, qty（可數字或字串）, duties|duty, person?}];
C12.items = [{n, to?, qty?, d?}];
C12.bag = [{n, qty（數字或字串，數字+中文如「2卷」一定要引號！）, type, note?}];
C12.personalKit = [string] （室外場）； C12.doNotBring = [string] （室外場）；
C12.notice = {title,items[]} | long string; // 兩種格式，string 會用 <pre> 保留換行
C12.worksheet = {title, audience, prompts[]} | {title, audience, fields:[{label,type}], footer?};
C12.pledgeCard = {...}; // c05 用
C12.scenarios = [{s,a}]; // c03 用
C12.observation = {title, items[]} | [string]; // 領袖檢查清單
C12.practical = {fewPeople, lackMat, ..., qa:[{q,a}]} | [{situation, action}]; // 新舊兩種
C12.safety = [string];
C12.postCeremony = [string];
C12.trivia = [{h,d}] | [{q,a}]; // 新舊兩種（h/d 舊，q/a 新）
```

**⚠️ 關鍵 bug 紀錄**：bag 內 qty 如包含中文單位（如 `qty:2卷`、`qty:數支`、`qty:3-4`）必須用引號包住，否則 JS parse 會 crash。c09/c10/c11/c12 已經全部修正為字串；c13/c14 直接用字串。

## 7. renderMeeting 通用渲染規則（app.js）

`App.renderMeeting(tid)` 根據 `DATA.meetings` 入面 `m` 物件嘅 flag 自動渲染：

- `m.sensitive:true` → Safe from Harm 橙色警告卡（c06）
- `m.outdoor:true` → 藍色室外警告卡 + `m.personalKit` / `m.doNotBring` 清單
- `m.full:true` → 用 `m.data = Cxx` 完整渲染
- `m.special:true` → 自動顯示崗位表（roles）、頒發物品（items）、禮成後跟進（postCeremony）、補充小知識（trivia）
- 通用區塊：領袖預備（leaderPrep）、開場白（script）、程序表（段數按教案實際節數）、🎒執袋、📝家長通知、✂️工作紙、👥崗位、🎖️物品、👀觀察/檢查、📬禮成、🆘後備、🃏情境卡、💡小知識、⚠️安全

renderMeeting 支援新舊兩種段落格式混合（`label/min`、`n/t`、`sub/activities/talking/blocks`）；leader 支援 `{leader, exec}` 物件。16 場已全完成，無需再寫新教案。

## 8. PWA 與 Cache

- Service Worker 檔案：`sw.js`
- Cache 命名：`scout-v{N}-c16-YYYYMMDD`（現行 `scout-v38-c16-20260917`）
- 每加/減一個 cXX-lesson.js，要做 3 件事：
  1. `index.html` 加 `<script src="js/cXX-lesson.js"></script>`
  2. `data.js` 將對應 placeholder 替換為 `full:true, special?/outdoor?/sensitive?, data:Cxx, bag?/notice?/personalKit?/doNotBring?`
  3. `sw.js`：升級 CACHE 版本字串，ASSETS 加 `js/cXX-lesson.js`
- 清 cache 方法：用戶 hard reload 或 SW 更新時自動換

## 9. 外部資源來源（已 fetch，內容已應用）

| URL | 用途 |
|---|---|
| https://sites.google.com/scouting.org.hk/venture/VentureScoutTrainingScheme | 《深資童軍訓練綱要》網上版（獎章要求出處） |
| https://www.scout.org.hk/tc/youth-members/venture-scouts/index.html?sid=2 + `uploads/member/venture_scouts_*.jpg` 6 張 | 深資制服規格＋官網原圖（link-only） |
| https://drive.google.com/file/d/1MEXphy7RQXXfFZX3uXsg0L4ZfOXbPEuo/view | 官方深資團集會套包 2026-09-01 版 PDF |
| https://scout-circulars.vercel.app/ | 通告圖書館（報班流程＋推送訂閱教學） |
| https://www.hkscoutshop.org.hk/ | 童軍物品供應社（3.7／3.8 唔入 app，指向呢度） |

## 10. 測試

```bash
cd /home/user/vsmeeting
npm test    # smoke.mjs＋runtime.mjs，必須全部 ✅ 先好 merge
```

測試會驗（v38 深資版）：
- 所有檔案存在、icon 係 PNG、HTML 有齊外連/script（c17–c24 引用必須消失）
- 深資制服官網 URL（6 張 venture_scouts_*.jpg）存在、通告圖書館「訂閱」提及、團內考核、無區報章系統
- 7 套儀式卡（無團呼）、獎章 20 項（會員章 m1–m11 齊）
- 每個 c01-c16 都 parse 到、program 段數啱（c04 係 5、c16 係 7、其餘 8）、bag/safety 陣列存在
- 每個 lesson 獨有關鍵字存在（例如 c01 要有「P.O.R. 係乜」；c06 要有「Safe from Harm」；c11 要有「1:20,000」；c14 要有「九結大點名」）
- renderMeeting(c01-c16) 全部可正常呼叫（用 fake DOM stub）
- sw.js cache 名 `scout-vN-c16-日期`、同 README 一致；sw 唔再 cache `img/badge/`＋`img/uni/`
- 深資守則：考章／報班各 7 步、制服 6 款 key、16 場分鐘數（c04／c16 除外）

## 11. 已知限制 / 技術債

1. **制服圖片熱連**——官網 TLS 曾經 wget/curl fail，但瀏覽器入到，暫時熱連；如將來官網改路徑要更新 uniform.js
2. **素材庫/技能/小隊 tab** 全部係 placeholder（🚧），需要做：
   - ~~素材：c01-c24 工作紙列印版、技能 9 卡、小隊制度工具、歌紙、SVG 圖解~~（v17＋v18 已完成 ✅）
3. ~~**搜尋功能（🔍）** 暫時跳去 #book~~（v18 已做真搜尋 ✅：即時搜尋＋85 項索引＋熱門關鍵字）
4. **c01-c05 仲用舊 inline 格式**（leaderPrep 其實冇、d.script 有），將來可考慮統一到新格式，但唔強制——renderMeeting 已經兼容
5. ~~**game/activities** 淨係得 4 個常用~~（v17 已擴充到 12 個 ✅，全部有完整玩法/物資/安全）
6. **browser-app-review/browser-practical/browser-print-scope** 等測試檔係早期規劃遺留，未完成，可視乎需要整理或刪除
7. **http server（python3 -m http.server 8080）** 如果 restart 會 kill 咗之前個 process，可再 `python3 -m http.server 8080 &` 重開
8. **assets_src/icons/icon-192.svg**（v37 前係 `img/icon-192.svg`）有 SVG 源檔，但 ImageMagick 缺 rsvg-convert 所以唔可以直接 convert 去 PNG，將來改 icon 可以繼續用 generate_image 出 1024×1024 PNG 再 resize 覆蓋 icons/icon-512.png。**前端唔可以有 SVG**（用戶要求），所以 SVG 源檔一律擺 `assets_src/`。
9. ~~**print CSS** 未特別優化~~（早已有完整 `@media print` 系統；v17 再加咗隱藏 `.print-btn`/`.filters` ✅）
10. ~~**歡呼庫/歌書**完全未做~~（v17 歡呼＋v18 歌紙 ✅：國歌＋2 原創營火歌＋歌單＋自創工作坊）
11. ~~指南針方位已由 c13 延後~~（v16 已落實：c16 Day2 加入指南針定向遊戲＋C16 gap 註明呼應 c09 承諾，閉環完成 ✅）
12. **index.html 載入 `js/redesign.js` 但檔案唔存在**（404，前人遺留；暫無害因為 App.init 有 try/catch，但最好下次清走或補回檔案）
13. ~~執袋表冇 note 會顯示 undefined~~（v15 已修：app.js 加咗 `(x.note||'')` fallback）

## 12. 下一步優先次序（建議）

> v16 已完成：c15–c24 全數補完，24 場集會 24/24 全完成！🎉（指南針閉環：c16 落實）
> v17 已完成：10 個 tab 內容全補齊！🎉（素材庫/12遊戲/9技能卡/小隊工具＋列印隱藏）
> v18 已完成：歌紙＋SVG 圖解＋全站搜尋！🎉（國歌/原創歌/歌單；17 SVG；85 項搜尋索引）

1. 清走 `js/redesign.js` 死引用（見第 11 節第 12 點）
2. （預留）更多 SVG 圖解（復原臥式、十字紮）、歌紙加歌

## 13. 開發命令

```bash
cd /home/user/vsmeeting
python3 -m http.server 8090 --bind 0.0.0.0   # 開 dev server（npm start 同效）
npm test                      # smoke＋runtime
```

## 14. Git 狀態

- working branch 規則：**永遠留喺 `arena/01a0a9bb-vsmeeting` 做嘢**，合併先落 `main`
- 本 session 喺 `arena/01a0a9bb-vsmeeting` 上開發（由 main 童軍版起步，全量重建深資版）；完成後經 PR 或 merge 落 `main`，唔好開新 branch（Arena 用呢個 branch 追蹤 session）
- 可以 push：`git push origin arena/01a0a9bb-vsmeeting`（認證已配置）；合併 main 用 PR（由用戶批）

## 15. 用戶口吻／文案風格

- 全部文案用**香港口語中文**（唔用台灣/大陸用語，唔寫「什么/怎麼/程序」要寫「什麼/怎麼/程序」——其實用返「程序/咩/點/嘅/咗/喺/嘅/啲/唔/係」呢種日常講法）
- 對象係**香港童軍領袖**（包括新手領袖），所以要 step-by-step、白話、唔使用童軍術語唔解釋
- 家長通知要**正式但親切**，一定要有簽署欄
- 安全條款一定要用 ⚠️ 標示，同埋講明「兩人規則」「1:6 比例」「持急救證書」呢啲硬規則
- 家長 Q&A 要預先回答家長最關心嘅問題（收費？安全？宗教？過敏？）

---
**Last agent 完成時間**：2026-09-17（v38：深資童軍版全量重建完成！）
**最後完成**：v38（16 場教案／7 套儀式卡／獎章 20 項／深資制服 6 款）
**smoke test＋runtime**：全綠
**http server**：如需要可 `cd /home/user/vsmeeting && npm start` 重開


---

## 16. v19 改動記錄（2026-09-15，用戶 12 項回饋）

| # | 要求 | 做法 |
|---|---|---|
| 1 | tab 內容太長要分頁 | 新增 `App.subnav`（tab/sub 路由）＋`App.chiprow`（錨點跳位）；制服=陸/海/空/徽章/自查、儀式=7套逐一、手冊=6分頁、技能=9分頁、營火歌=11首歌紙分頁；集會詳情頁頂部加節位 chips |
| 2 | 做 APP ICON | generate_image 出 1024 原圖→ImageMagick crop/resize：icons/icon-192.png、icon-512.png、icon-maskable-512.png；img/icon-192.svg 重畫成對應源檔；manifest 更新 |
| 3 | 興趣章唔放區系統連結 | app.js badges 移除「📝 前往區總部報章系統」；interests.js howToApply 改「團內考核 7 步」（no system CTA）；topbar 📝 保留（供其他組用，註明只係報專科徽章用） |
| 4 | 儀式加分頁補圖 | svg-kit.js 新增 DIAGRAMS.cer（open/close/drill/flag/oath/salute 6 套場位圖）；ceremony.js 每卡加 fig/figcap/rel；#ceremony/<k> 單頁模式＋上一套/下一套導航 |
| 5 | 工作紙定位 | 素材庫直接列 24 場工作紙（.ws-item，逐張「只印呢張」）；集會頁內工作紙保留（跟住做）；lede 寫明上下定位分別 |
| 6 | 列印指邊印邊 | `App.printSec(el)`：clone 目標 .sec/.card/.ws-item 去 #printzone＋body.print-one，@media print 收埋 #app 淨印 printzone；「只印本節」掣遍布各區塊；全場印＝「整場教案全部列印」明示按鈕 |
| 7 | 唔出繩結卡 | 刪素材庫「繩結卡」區、技能「平結/八字/稱人圖解」卡、diagrams.js reef/fig8/bowline 資料；換成 warn callout 指向 c13/c14 教案 |
| 8 | 活動/技能/儀式補圖（興趣章除外） | DIAGRAMS.game 12 張場地擺位圖；DIAGRAMS.skillx（ropecare/legend/tent/stove/knife/rice/sos/lost）；DIAGRAMS.fire（circle/flow/scarf）；badges 維持文字 |
| 9 | 歌紙用童軍營火歌 | 新 js/songs.js：11 首 Public Domain 傳統歌（含兩隻老虎輪唱）＋有版權歌只列名（Kookaburra/熊熊烈火/友誼之光/童軍歌）；刪自創歌＋流行歌單＋自創工作坊 |
| 10 | 小隊tab改營火歌 | 底部 #tabbar 第五格 = 🔥 營火歌 #songs；route 舊 #patrol → #book/patrol redirect；sw/manifest shortcut 更新 |
| 11 | 小隊制度入手册 | book 新增「小隊制度」（制度/小隊長3職責/會議記錄表）＋「集會工具」（計分板/抽籤/倒數/分組）；歡呼庫去營火歌 tab |
| 12 | 目錄整行可撳 | plan-table tr.meet-row onclick＋tabindex＋▶；hover 高亮 |

**測試**：tests/smoke.mjs 已改 v19 版（加：svg-kit/songs 檔存在、icon 尺寸、無繩結卡/無區系統CTA negative test、DIAGRAMS.cer/game/skillx/fire 計數、傳統歌 positive/自創歌 negative、manifest maskable）——108+ 項全綠。
**注意**：sw.js CACHE=scout-v19-c24-20260915（測試斷言 'scout-v19'）；#ceremony/#songs 用 hash sub，SW 唔使理。

---

## 17. v20 改動記錄（2026-09-16，補圖：SVG → 真圖 AVIF，批次 1／3）

用戶指正：**補圖唔好再用我手畫嘅 SVG**（唔專業、又好慢），一次大概只能出 10 張，圖檔格式用 **AVIF**。

### 做法（pipeline，下次繼續照做）
1. `generate_image` 出 1024 級原圖去 `assets_src/figsrc/<key>.png`（呢個 dir 已入 `.gitignore`，唔提交，每次只提交 AVIF）。
2. prompt 必帶風格 lock：`Clean editorial flat illustration with soft shading, warm muted palette, very light off-white background, no text no letters no numbers no watermark no logos`＋**制服必須照 uniform.js 寫實**（陸童軍：深綠軟帽連帽章／杏色短袖恤兩胸袋／草青短褲／棕皮帶童軍扣／深草青直坑紋長襪／黑皮鞋／旅巾連巾圈）。
3. 逐張 `read_file` 睇成品 **有冇畫錯**（手勢、指數、腳位、旗位）；錯嘅部分宁可 crop 走（例：cer-salute 右格半禮畫成兩指 → 淨 crop 左格全禮，半禮改做文字），**唔好擺錯圖教錯人**（同繩結卡同理）。
4. 編 AVIF：`convert src.png -resize '1000x1000>' -strip -quality 58~64 -define avif:pixel-format=yuv420p img/fig/<key>.avif`（IM 6.9 有 libaom，0.5s/張；1000px 約 10–80KB）。
5. 喺 `js/figs.js` 加 key：`{src,w,h,alt,cap}`（w/h 必填防 CLS；alt 寫清楚畫面內容俾螢幕閱讀器＋冇圖時嘅交代；cap 係圖說）。
6. 渲染：`App.ph(key, cap, svgFallback)`（app.js）→ `<figure class="ph-fig">`＋`<img loading=lazy onerror=...>`＋`<details class="dgm-alt no-print">`（舊 SVG 變折疊後備）。load 唔到 AVIF（舊瀏覽器）→ `.imgfail` 收埋圖、auto-open 圖解。
7. 收尾：sw.js ASSETS＋CACHE 版本、`index.html` script、`npm test`（smoke 已加 v20 斷言）。

### 本批（批次 1／3）已出 9 張
| key | 用咩位置 |
|---|---|
| cer-open / cer-close / cer-drill / cer-flag / cer-oath / cer-salute | `#ceremony/<k>` 每張儀式卡主圖（ceremony.js 用 `fig:'open'` → key `'cer-'+fig`；figcap 已改寫到啱「場景示意」） |
| fire-circle | 🔥 營火歌 tab hero（取代 DIAGRAMS.fire.circle 做主圖；flow 仍係圖解） |
| fire-song | 🔥 營火歌 tab 頂部 banner |
| fire-robe | 營火章「營火袍」位（DIAGRAMS.fire.scarf 退居折疊後備） |

**v39**：`fire-circle`＋`fire-song` 已刪（營火會頁成格移除，FIGS 38→36）；`DIAGRAMS.fire`（circle/flow/scarf 圖解）保留，c16 營火晚會照用。

cer-flag 圖內旗面刻意只畫色塊（國旗／區旗細節唔好靠 AI），caption 已註明「實際樣式以《隊列和升掛國旗及區旗指引》為準」。

### 未做（下一批先做）
- **批次 2**：遊戲 12 張場圖（`DIAGRAMS.game` 逐個換 AVIF；遊戲名做 key，建議 `game-<slug>`）。
- **批次 3**：技能 8 張（ropecare／legend／tent／stove／knife／rice／sos／lost）＋補返 cer-salute 正確嘅「全禮＋半禮」兩格圖。
- **永遠唔做**：繩結逐步圖（用戶明確禁止）。
- 測試 guard：`smoke.mjs` 會 fail 掉任何 key 符合 `/knot|reef|bowline|fig8|繩結|結/` 嘅 FIGS 項目、任何 >140KB 嘅 AVIF、任何非 `ftypavif` header、以及 sw.js 漏 cache 嘅圖。

**注意**：sw.js `CACHE=scout-v20-c24-20260916`（測試斷言 'scout-v20'）；改圖必需要改 CACHE 名，先至會踢走舊 cache。

### v21 修正（2026-09-16）：補圖唔畫制服
用戶：「唔好生成制服嘅圖，因為會生錯；我哋目標只係讓領袖知道動作」→ 批次 1 全部 9 張**重畫**：
- prompt 加硬規則：`plain neutral practice clothing — light grey t-shirt, dark grey shorts, bare head, NO hat, NO neckerchief, NO badges/patches/emblems/insignia; the image teaches only body position / spacing / sequence`
- 旗照舊只畫**純色塊**（紅高綠矮），caption 註明樣式以《隊列和升掛國旗及區旗指引》為準
- `cer-salute` 由「淨全禮」改成**兩格（全禮＋半禮）**，兩格手勢一致先至夠clear；`cer-drill` C 格喺圖說寫明「圖只係一般行進姿勢，腳手前後次序照文字」（AI 分唔掂左右腳配對邊隻手）
- **抽走 `fire-robe.avif`**（營火袍＝布章位置，屬制服範圍）→ 退回 `DIAGRAMS.fire.scarf` 平面圖解
- 新增 `game-banner.avif`（🎮 活動 tab 封面：設場安全位＋內外圈方向）
- 每張圖說自動加 `FIGS_NOTE`（全域變數，唔放落 FIGS key 入面，避免比 test 當成一張圖）：「圖內人物只係中性練習衫，唔代表制服標準 → 睺 👕 制服 tab 官網圖」
- `App.ph()` 負責 append note；`sw.js` CACHE 升 `scout-v21-c24-20260916`
- 9 張 AVIF 合計 **318KB**（比 v20 更細，因為冇制服細節／紋理）

**smoke test 新增 guard**：FIGS 任何 key 命中 `/robe|uniform|scarf|制服|領巾|布章|章/` 即 fail；`alt` 提到帽章/布章/領巾/杏色/草青 即 fail；`img/fig/fire-robe.avif` 存在即 fail；圖說冇 ph-note 即 fail。
**下一批照跟**：遊戲 12 張、技能 8 張 — 全部中性練習衫，唔画制服、唔画章。

## 18. v22 改動記錄（2026-09-16，補圖批次 2：遊戲 10 張場地圖插畫）

沿用 v21 條鐵律：**唔畫制服**（人物一律灰T＋深灰短褲、冇帽冇領巾冇章）、唔畫繩結打法、唔畫醫療手法細節。

- 新增 10 張 AVIF（`img/fig/`，1000×545 為主，共約 380KB）：`game-ball 直呼其名`、`game-shape 繩索挑戰`、`game-tarp 飛毯`、`game-pack 執包比賽`、`game-relay-cards 結繩接力賽`、`game-tug 拖木頭挑戰`、`game-aid 急救情境賽`、`game-orienteer 定向尋寶`、`game-beachflag 沙灘旗`、`game-water 運水接力`
- `js/figs.js` 加 `GAME_FIG`（遊戲名 → key）；**未入表嘅 2 個遊戲（有口難言／大風吹）自動退回平面擺位圖**（呢兩個「排直線」「圍圈少張凳」用俯視圖已經夠清楚，唔揀佢哋佔額度）
- `App.pages.play`：每卡 `App.ph(GAME_FIG[g.n], cap, DIAGRAMS.game[g.n])` → 有圖＝AVIF 主圖＋折疊平面圖；冇圖＝照舊 dgm-fig（唔會出空白）
- 圖說帶安全提示：`game-tug`／`game-relay-cards` 寫明「結點打照 c13/c14，本 app 唔出結圖」；`game-aid` 寫明「手法照 c17」；`game-beachflag` 寫明「圖上海喺盡頭係場景，實際旗線要離水線好遠」；`game-pack` 寫明「利器唔入物料池」
- 搜尋索引 desc 會分「附實景示意圖＋場地圖」／「附場地圖」
- `sw.js` CACHE=`scout-v22-c24-20260916`，ASSETS 加入 10 張
- smoke test 新增：`GAME_FIG` 覆蓋 10／未補圖必須得 2／逐遊戲 render 檢查 ph-fig 或 dgm-fig／game-* 嘅 alt 命中 `帽章|領巾|布章|巾圈|旅巾|制服|童軍帽` 即 fail／alt 出現繩結打法名即 fail／sw 漏圖即 fail

**批次 3（最後一輪）待辦**：`DIAGRAMS.skillx` 八張（ropecare／legend／tent／stove／knife／rice／sos／lost）換 AVIF ＋ `game-lineup 有口難言`、`game-chairs 大風吹`。注意 `skillx.rope care`／`stove`／`knife` 三張：只畫**場合同要點**（捲繩手法唔出逐步圖、爐具只示擺位同通風、刀只示「唔傳刀、刀尖向自己」呢類原則），涉及結法／包紮／切法步驟一律留文字＋教案連結。

## 19. v23 改動記錄（2026-09-16，補圖批次 3：技能 6 張＋有口難言；QA 擋走 3 張）

> **歷史記錄**：下面對 `game-chairs` 嘅禁令已由 v34 §31 取代；v34 採用有 CC BY-SA 授權嘅網上真實相片（唔係被擋走嘅生成圖），現行測試要求保留。

出咗 10 張、**收 7 張**，另外 3 張我 QA 自己 fail 咗冇放落 repo（原圖喺 `assets_src/figsrc/`，gitignore 內）：

| 狀態 | 圖 | 理由 |
|---|---|---|
| ✅ | skill-ropecare / skill-legend / skill-tent / skill-stove / skill-rice / skill-lost | 動作＋距離＋位置講得啱（45° 營繩、3 米線、抬高過心口、氣罐直立分開） |
| ✅ | game-lineup（有口難言） | 直線＋手指貼嘴＋袋水放界外，冇可畫錯嘅細節 |
| ❌ | skill-knife | 右格畫成「刃向人交接」（應該俾柄）＋左格扶木隻手喺刀前；呢類一錯就會傷人 |
| ❌ | skill-sos | 天上音波畫咗 4 組（要 3 短 3 長 3 短）；節奏错＝教錯 |
| ❌ | game-chairs | 凳數冇滿足「少一張」，睇圖設場會玩唔成 |

**守住唔准回流**：`tests/smoke.mjs` 有斷言——`img/fig/skill-knife.avif`／`skill-sos.avif`／`game-chairs.avif` 一出現即 fail；`SKILL_FIG` 出現 `knife`／`sos` 即 fail；`GAME_FIG` 出現「大風吹」即 fail；`img/fig` 有孤兒圖（冇入 FIGS 或冇入 sw）即 fail。
=> 下一批重出呢三張時，prompt 要寫死：刀「blade folded, handle toward receiver, blade end held by giver only」；SOS「exactly three groups of arcs: 3 short, 3 long, 3 short, nothing else」；凳「chairs = players − 1, count them: 10 chairs, 11 players」。

### 其他接入
- `App.pages.skills` 嘅 `figFor()` 改行 `SKILL_FIG` → 有圖用 `App.ph()`（AVIF＋折疊平面圖解），冇圖（rope 口訣/SOS/先鋒紮作）自動退回 `dgm-fig`；`css` 加 `.svg-steps .ph-fig{flex:1 1 100%}`
- 圖說全部寫明邊度「圖冇畫、要照文字」：收繩圈繞步驟、爐具漏氣／熄火次序、包紮力度與燙傷五步
- `sw.js` CACHE=`scout-v23-c24-20260916`，ASSETS 26 張圖；全場插畫 886KB（AVIF q58–64／1000px）
- 而家覆蓋率：儀式 6/6、遊戲 11/12、技能 6/8（另 2 張刻意用圖解）、營火／歌 3/3、制服 0（只用官網圖，永久規則）、興趣章 0（用戶話唔使）

## 20. v24 改動記錄（2026-09-16，用戶抓錯：儀式圖逐張 QA）

用戶指出 `cer-oath` 兩個錯：**(1) 領袖雙手合什（祈禱式，唔係童軍動作）(2) 團旗插喺團長與新成員中間 → 二人無法「面對團長及團旗」；排位怪**。跟手要求「儀式認真睇返有冇錯」（遊戲/活動按文字生成、錯嘅機會低、無傷大雅 → 唔使逐張重做）。

### 逐張核對結果（對住 `js/ceremony.js` 程序）
| 圖 | 發現 | 處理 |
|---|---|---|
| cer-oath | 合什＋旗喺中間 | 重出：`COMPLETELY EMPTY floor between them — no pole, no stand`＋`no praying hands, no palms pressed together, no folded/clasped hands`＋`ONE SINGLE flag pole, no second pole, no pennant` |
| cer-salute | 左格全禮像得兩指（角度遮無名指），右格三指啱 | 重出（手畫大、兩格幾何一致、寫明「exactly three straight extended fingers」）＋圖說加「數手指照右格」 |
| cer-open | 「團旗喺右側」有歧義（畫面右 vs 隊員右手邊）；隊列散 | 改由**隊員背後**睇（畫面右＝隊列右翼，零歧義）＋整齊直排；顺手 crop 走左邊多餘木架（1392→1000×727，FIGS w/h 已更新） |
| cer-flag | 人物冇戴帽卻行三指禮（程序：戴帽三指禮、無帽注目禮） | 圖冇再重出（重出風險係旗位又錯）；改喺 figcap＋FIGS cap 補返呢條，話明「圖冇畫帽係避免畫錯制服，教嗰陣要補」 |
| cer-close | 折旗／交接無硬傷 | 保留 |
| cer-drill | 行進腳手配對圖唔可靠 | 保留（圖說已寫「次序照文字」） |
| skill-knife／skill-sos（v23 被 QA fail） | 用硬指令重出通過：刀「俾柄唔俾刃」＋跌刀後退舉手；SOS 恰好「三組、每組三條、冇第四組」 | 入 `SKILL_FIG`（技能插畫 8/8 齊） |
| game-chairs | 凳數仍唔啱「少一張」 | **繼續 ban**（smoke test 断言檔案唔准存在） |

### 下次補圖／改圖必守（QA SOP）
1. 圖生成後**一定要 `read_file` 睇返**，逐項對程序文字：手勢手指數、旗／物位置、人與人關係（面對面／背向）、物件有冇多餘、帽與程序條文有冇矛盾。
2. prompt 用**可數嘅硬約束**：`exactly three groups of arcs, nine arcs total, no fourth group`／`ONE SINGLE flag pole`／`no praying hands, no clasped hands`／`chairs = players − 1`。
3. 有歧義嘅「左／右」改用視角消歧義（例如由隊員背後睇，畫面右＝右翼）。
4. 錯得會教錯人 → **唔 ship**：檔名入 `tests/smoke.mjs` ban 名單（一出現即 fail），原圖留 `assets_src/figsrc/`（gitignore）等改 prompt 重出。
5. 圖做唔到但程序要緊 → 寫入 `figcap`／`cap`（例：升旗戴帽條文、敬禮以邊格作準、收繩步驟照文字）。
6. 改咗圖就改 CACHE（`scout-vNN`）；改咗尺寸就改 `FIGS.w/h`（新断言會用 `identify` 對實際尺寸）。

### 容量／測試
- 28 張 AVIF = 929KB（上限放寬到 1.2MB，逐張 ≤140KB；smoke test 有斷言）
- 新斷言：oath「唔係合十」＋「旗唔准喺二人之間」、salute「照右格數手指」、open「右翼定義」、flag「戴帽行三指禮」缺席即 fail；每張儀式圖實際像素要等於 `FIGS.w/h`；`SKILL_FIG` 必須 8 項；`game-chairs.avif` 存在即 fail
- `sw.js` CACHE=`scout-v24-c24-20260916`（+skill-knife、+skill-sos）

## 21. v25 改動記錄（2026-09-16，用戶提供官方《步操手冊》→ 逐項對照修正）

用戶比咗 Drive 連結（`https://drive.google.com/file/d/1g4M6C7e1K7tVDkr2IADdkebm1CjljI-l/view`）＝**《步操手冊》DRILL MANUAL，香港童軍總會 2000 新版**（青少年活動總監陳肖齢序、步操教練員黃志樂主席編訂）。用 `fetch_page` 讀到嘅係**文字層**：序／目錄／述語定義／第1章／第2章（施教步操・致敬）／第3章§1–§2 開頭。**第3章其餘、第4–8章、附錄甲–戊大部分係掃描圖冇文字層 → 攞唔到**，呢啲位置一律標「照紙本核對」，唔好自創。

### 改咗啲（全部標明章節出處）
| 位置 | 之前（憑印象） | 依家（手冊） |
|---|---|---|
| 立正 c01 教案＋步操卡＋圖解 | 腳尖向外**約 45 度**、雙手下垂手指自然彎曲 | 腳尖向外**與中線成 30 度**、雙膝蹬直、**雙手握拳**、手踭蹬直、母指指甲向前放食指上面、母指壓住**褲骨**、後顎貼衣領、眼望無限遠；口令「立正（**Alert**）」 |
| 集會用嗰個口令 | 冇講 | Attention／Squad Shun／Parade Shun 動作相同，但**只適用於典禮、訓練班、其他制服團體，一般童軍集會不建議用**（第3章§2 註） |
| 熱身 | 冇 | 新增**抽膝踏步**（Bend the left (right) knee!，大腿與地面平行、小腿放鬆、拳貼褲骨）＋**彈前腳**（Shoot the right (left) foot forward!，半步 **375mm**）＋交替練習（第3章§1）；c01 加咗 4 分鐘步驟（分鐘數重新配平：2+8+5+5+4+4+2=30） |
| 口令結構 | 「預令＋動令」 | **介令 → 預令 → 動令**（Move to the right in threes / Right / March）；原地停「標準停頓時距」＝**1.5 秒（每分鐘 40 個動作）**；快步預令→動令 ≤4 步、慢步 ≤3 步；打數期間「Two—Three」全身不動（第2章§7–11） |
| 步速步幅 | 步幅約 75cm | 快/慢步操步幅 **750mm**、大跨步 830、短跨步 530、加快 1000、橫移 305；快步 **116 步/分鐘**（新隊員最多 140）、慢步 65、加快 180（第2章§12） |
| 教具 | 冇 | 拍子機／鼓／步規＋鼓手站位＋40 次/分鐘校法（第2章§3）；隊形用途：**直行＝步操、半圓＝棍操／旗操、開闊排＋斜轉＝原地敬禮**；唔好面向太陽／當風（第2章§2.1） |
| 紅線 | 「唔係罰企」（口頭） | 明文引用：**步操無論如何唔准用作懲罰**（第2章§3.1(己)） |
| 升旗「敬禮」 | 「戴帽行三指禮、**無帽行注目禮**」（無據） | 改用手冊條文：奏國歌時**隊列中童軍立正致敬**、領隊或單獨一人**舉手敬禮**、**穿便服／制服不整齊→只肅立不舉手**（§3(丙)、§6.3）；「戴帽先舉手」降為單位慣例 → 要問區總部 |
| 敬禮卡 | 只有四種禮 | 加：**§6.1** 兩人以上由一名領袖／領隊舉手，其餘立正；**§6.2** 冇領袖時由**最右方隊員**舉手；**§5.1** 行進間「MARCH TO ATTENTION!」→「EYES — RIGHT!/LEFT!」；**§5** 每日向同一童軍人士只致敬一次；**§2.1** 典禮必須致敬對象（國家領導人・特首・總領袖/港監及其代表・主禮嘉賓）；**§4.1** 靈柩；§1.1 敬禮嘅意義 |
| 集隊卡 | 「右翼」口語 | 官方術語：**睇齊**（Dressing）、**引導翼**（Directing Flank，用作睇齊嗰邊）、**側翼**、**標號員**（Markers）、**空行**留空規則（三排留最左數起第二行中排／中排＋後排；兩排留後排最左數起第三行）、**收窄排 750mm／開闊排 1500mm**、**As you were**（取消口令）；第8章七款**集隊手號**名稱已列（直線／直線由高至矮／直行／闊橫排／窄橫排／馬蹄鐵形／開口正方形），⚠️動作喺圖冇文字層 → 標「照紙本核對先教」 |

### 圖（三張重出＋尺寸更新）
- `cer-oath`：其他人立正改成**握拳貼褲骨**（舊圖開掌）；二人中間真空、淨返一支旗（v4 通過 QA）
- `cer-open`：v2 出咗**制服＋膊頭布章**（違反「唔准画制服」）→ v3 全部灰色練習衫、無帽無章；全员握拳立正
- `cer-drill`：加**握拳放大圓圈**（拇指壓食指）＋稍息／行進拳；檔底有英文 panel 標籤（POSITION OF ATTENTION／STAND AT EASE／MARCHING）＝手冊口令原文，可接受
- FIGS 尺寸跟住改：`cer-open 1000×558`、`cer-oath 1000×545`、`cer-drill 1000×330`（smoke test 會用 `identify` 核對實際像素）
- 插畫總量 28 張 967KB；`sw.js` CACHE=`scout-v25-c24-20260916`

### QA SOP 加多一條（第 8 步）
**有官方手冊嘅項目（儀式／步操／禮節）一定要查手冊原文先寫**——唔好靠印象或別本指引嘅數字；AI 圖 prompt 要寫到手冊級細節（角度、握拳與拇指位置、腳位），否則畫出嚅就係錯。手冊冇文字層嘅章節：標「照紙本核對」＋喺 cards 內寫明我哋份電子檔睇唔到，唔准自創。

### 仍然未做（要用戶幫手）
1. 第4–5章（快步／慢步開步停步、行進間轉向、行進間敬禮）動作文字 → 需要紙本頁（可影相畀我）
2. 第6章 集隊成三排／報數／睇齊／開闊排／解散／行進間注目禮 → 一樣
3. 第7章 **旗操**（持旗立正・持旗稍息・攜旗・托旗・換手・讓旗幟飄揚・抓回旗幟・原地敬禮）→ 呢啲先至係旗手真正要學嘅嘢，依家只能列術語
4. 第8章 集隊手號**動作**
5. 附錄丙 檢閱會操／附錄丁 結業會操／附錄戊 檢閱須知 → 大会操程序若要做到「照手冊」就要呢三頁

## 22. v26 改動記錄（2026-09-16，用戶將《步操手冊》拆成 8 份 → 讀晒第3–8章＋附錄）

用戶一次過拆檔（Drive 8 條 link），全部讀到文字層。跟住逐章將 app 對住改／補。

### 新讀到嘅關鍵條文（之前完全冇／寫錯）
1. **稍息＝「童軍動作」**（第3章§2・圖7）：口令 `Stand at — EASE!` 打數 `Out!`；提左腳至大腿平行、向外踏下（兩腳踭分開 **305mm**、腳尖向外與中線成 **30°**）、雙手移去身後**由拳變掌、右掌疊左掌、拇指緊扣、手指同手踭蹬直**。→ **我哋之前教「左腳橫移＋左手握右手腕」係中式跨立，唔係手冊嘅稍息**（已改 `footdrill` 卡＋c01 教案，並喺教案講明兩者要分清楚）。
2. **休息** `Stand — EASY!`＝只放鬆手踭；回稍息用 `Squad!`；回立正 `Alert!`（打數 `In!`）。⚠️ **唔准由立正直接轉休息**（要先稍息），反之亦然。
3. **原地轉法**：`Turning, right (left, about) — TURN!` 打數 `One—Two—Three—One`（Two—Three 係停留、唔准郁）；軸＝右腳踭＋左腳尖；轉完提膝踏返定位。斜轉 45°：`Inclining, left/right — INCLINE!`。**橫移**：`One pace, left close — MARCH!`，每步 300mm、**唔准多於 8 步**、多步時中間加 `Up`。
4. **原地向前敬禮**：`Saluting, salute to the front — SALUTE!` 打數 `Up—Two—Three—Down`；右手先向橫升至與肩平→握成敬禮手號→前臂擺至**右食指喺右眼眼球中心對上 25mm（1 英吋）**；Down 時用**最短距離**握拳放回褲骨。→ 敬禮卡改用呢個官方準則（帽沿／眉梢講法保留為中式慣例並註明）。
5. **第4章快步**：開步分三種場合口令（多排／面向前後／一排 `Step off together`）；停步 `Squad — HALT!`（動令喺**左腳腳踭著地**）；行進間轉向打數 `Check — Down`；換步 `Changing step, CHANGE — STEP!`；`Quick mark — TIME!`。
6. **第5章慢步**：`By the left/right/centre, SLOW — MARCH!`＝**每分鐘 65 步**、行到 375mm 稍停；向後轉 `One Stop—Two Stop—Three Stop—Forward`；快慢轉換 `Break into slow (quick) time…`。
7. **第6章排列隊形**：集隊 `Squad, FALL — IN!`（先到企 F1 右標號員→C1→R1→F2…向左伸延，到咗面向司令員再由立正轉稍息）；報數 `From the right — NUMBER!`（最後一位要加喊 `Sir!/Madam!`，中／後排跟前排號數）；排高矮 `Sizing, tallest on the right, … — SIZE!`（四種排法以「高兩邊矮中央」最常用）；空行 `BLANK — FILE!`（例：五行欠一人→R4 橫移兩步、C4 向後一步，同時到位）；睇齊 `Dressing, right — DRESS!`（`Up—Two—Three—Move`，前排向橫起手／最右行中後排向前起手／其他人只轉頭；熟咗唔使起手）＋`EYES — FRONT!`（`Down`）；兩排版右手**叉腰**、行與行 **375mm**；開闊排 1500mm／收窄排 750mm（行進間版 `Marching in open/close — ORDER!`）；三排↔單行／轉變隊形方向 `Change direction right, at the halt, right — FORM!`；解散 `Turn to the right, and salute, FALL — OUT!`／`… do not salute, …`／`… DISMISS!`（打數完整）；行進間斜轉 45°、轉彎半徑 **600mm**、**唔准超過 6 排**。
8. **第7章旗操 §9–§12**：讓旗幟飄揚、抓回旗幟（風大可用左手）、原地敬禮（`General Salute`→`Salute`：竿底離旗套、左手握旗套、向右橫掃（風從右嚟就向左掃）、夾腋下、手背向地、**眼球唔准跟住竿郁**、雨天／泥地掃至與地面平行就得）、慢步行進間敬禮（`Eyes — RIGHT!` 打數 `Up`、動令右腳腳外側著地、四步完成）、快步行進間敬禮（`Check — Up`、動令左腳腳踭著地、聽 Right 再操兩步）。⚠️ §1–§8（持旗立正・持旗稍息・攜旗・托旗・換手…）呢批檔仍冇文字層 → 卡內標明「照紙本核對」。
9. **第8章集隊手號**（全部七款動作＋距離）：司令員先立正→發口令→做手號；與最前排相距 **2250mm**；排好後**保持立正**，司令員**放下雙手**先轉稍息；幼童軍／童軍團以小隊為單位，**小隊長最右、副隊長最左**（直行時最前／最後）。七款：直線＝兩手側平伸；直線（由高至矮）＝一手面前屈肘90°一手側平伸；直行＝兩手前平伸、**手背向天**；闊橫排＝兩手側平伸＋前臂上彎90°、手背向外；窄橫排＝兩手前平伸＋前臂上彎90°、手背向前；馬蹄鐵＝雙手蹬直向前、**左手腕疊右手腕**；開口正方形＝手掌互握、右手背向前高舉過頭。→ **撤銷我哋之前自創嘅手號描述**。
10. **附錄甲 口令一覽表**（介令／預令／動令全表）＋**附錄丁 結業會操 47 步**＋**附錄戊 檢閱須知**（檢閱前 check 制服・檢閱時隊伍必須立正・檢查立正與睇齊・頭部/上身/皮帶/褲裙/襪/鞋逐項、衣袋唔准隆起、皮帶扣正中；唔准同隊員爭吵、唔准用手接觸隊員、唔准取笑、唔准企太耐、唔准讓陪同者代檢、唔准含糊指錯；要作風一致、清楚交代、值得稱讚就稱讚）。

### app 落地
- **新增三張儀式卡**：`march`（快步行進／慢步行進）、`fallin`（集隊手號・睇齊・解散）、`parade`（會操／檢閱須知）→ 儀式卡由 7 張變 **10 張**
- `footdrill` 重寫第2–6b步（稍息／休息／轉姿勢次序／轉法打數／原地敬禮 25mm／橫移）；`salute` 卡全禮改用官方準則；`flag` 卡加旗操五節＋第7章待核声明；`c01` 教案稍息改返手冊版＋新增「5b. 休息」步驟（分鐘數配平返 30）
- **新圖解（純手繪 SVG，唔用 AI）**：`D.cer.handsign`（七格手號，含 2250/750/1500mm 註解）、`D.cer.march`（九格口令＋動令落腳＋打數表）；`App.cerFig` 支援 `c.dgm`（冇插畫都得）
- `CEREMONY.refs` 加返手冊連結；版本註記改做 **2003 年 7 月第二版**（我哋之前寫 2000 係編委年份，唔係版次）
- `sw.js` CACHE → `scout-v26-c24-20260916`；插畫數量冇變（28 張 967KB）
- **手繪圖解先至係正路**：手號／口令表呢啲「要數清楚」嘅內容一律用 SVG（`D.cer.handsign`、`D.cer.march`），唔出 AI 圖；`App.cerFig` 現在支援 `c.dgm`（冇插畫都有圖解）
- **新增防溢出檢查**：smoke test 會逐張掃描 37 個 SVG 圖解，估算每段 `<text>` 嘅寬度（CJK 1.0em／拉丁 0.58em），超出 viewBox 就 fail —— 手繪圖解寫長咗字好易俺 cut 走，睇落正常但其实冇晒
- smoke test **149 項全綠**，v26 段新增斷言：三張新卡唔係空殼＋唔准有 AI 插畫、七款手號名稱齊、稍息唔准回流中式版本、25mm／305mm／116／65／375／600mm／FALL—IN／BLANK—FILE／DRESSING／DISMISS／檢閱 do-don't 全部要有；並檢查新 SVG 冇 `undefined/NaN` **且內容唔准超出 viewBox**（用 translate y 對 viewBox 高度）

### 仍未有文字層（要紙本／再拆檔先補到）
第7章 §1–§8（持旗立正・持旗稍息・攜旗・托旗・換手）；附錄乙「發出動令時間及打數表」總表（各節已散見，但總表冇）；附錄丙「檢閱會操」程序表前半（讀到嘅由 Seq 34 開始）。

---

## 23. v27：旗操 12 節全本＋附錄乙／丙落地（2026-09-16）

用戶連_send_三次「我幫你一下」再講「繼續補」，意思係將《步操手冊》剩低未落地嘅章節全部補完。

**⚠️ 最重要教訓（寫低以免再犯）**：上一輪我講「第7章 §1–§8、附錄乙、附錄丙前半電子檔冇文字層，要照紙本核對」——**全部錯**。手冊被用戶拆成 8 份 Drive 檔，每份有 2–3 個 chunk，`fetch_page` 只返第一 chunk，我冇讀 `totalChunks` 之後嘅部分就落結論。**規則：任何「讀唔到／要照紙本核對」嘅講法，必須先確認嗰份檔所有 chunk 都讀完。**

**新增兩張儀式卡（`CEREMONY.cards` 而家 12 張）**
- `colour` 旗操（第7章 §1–§12 全抄改寫）：持旗立正 Order・持旗稍息（兩腳踭 300mm、左手握拳蹬直拇指貼褲骨）・攜旗 Carry（右手提至身體正中央、竿底對準旗套、完成時右前臂與地面平行、右手喺口部對出、手背向前）・托旗 Slope（竿放右肩、**竿與地面 45 度**、旗身覆蓋竿由肩至手唔准外露）・換手（先提竿至右手肩膊水平再擺上左肩）・托旗↔攜旗（**轉托旗之前必須先轉為右手攜旗**）・讓旗幟飄揚／抓回（風大可用左手協助）・原地敬禮 Lower（向右橫掃、竿頂喺右腳前方微微離地、**竿夾腋下**、⚠️眼球必須向前直望唔准望住旗竿郁、雨天／泥濘橫掃至與地面平行就得）・慢／快步行進間敬禮（快步聽「Right」之後要繼續向前操兩步）·步操旗手口令（Carry／Slope／Order／Present — COLOUR）·旗手口號（CARRY COLOUR! 分三路、ORDER COLOUR!／AT EASE!／SALUTE!／CARRY ON!，全隊回 AW-AWAY-YEA，喊口號時旗置胸前）。重點 types：四種竿角（垂直／垂直／45°／平行）就係判別依據；口號「行進間用 Order Colour，停低就 Slope Colour」要糾正。
- `commands` 口令與動令時間表：附錄甲（介令／預令／動令結構、Attention 只用於典禮、日常用 Alert、Open/Close March 預備「Double time」要連續、Squad CLOSE MARCH 两步完成、Blank file 唔准用作隊形、口號要響亮兼有氣魄）＋附錄乙 15 項逐項「動令喺邊隻腳落＋全隊打數」（HALT 快步=左腳踭著地／慢步=左腳經過右腳、QUICK/SLOW-MARCH 落腳位、RIGHT-TURN 打數 CHECK—DOWN、ABOUT-TURN 打數 IN—LEFT—RIGHT—LEFT—FORWARD、MARK-TIME 打數 IN、原地踏步 HALT/FORWARD 喺大腿提高至與地面平行時、CHANGE-STEP 行進間 LEFT—RIGHT—LEFT／原地 LEFT—LEFT—RIGHT、BREAK INTO QUICK/SLOW TIME、DRESS/IN CLINE/OPEN CLOSE ORDER、EYES RIGHT/LEFT + FRONT、RIGHT-FORM 成連時喊、SALUTE TO THE FRONT 長串打數、SALUTE TO THE RIGHT/LEFT UP—TWO—THREE—FOUR—FIVE—DOWN—SWING）＋打數規則（淨喺 ONE/UP—TWO THREE—ONE/DOWN 做動作、原地動作每分鐘 40 個、前後隊員相隔 30 米）。
- **無 AI 圖**（第 13 次驗證：AI 畫唔啱腳序／手位／竿角）；旗手四式改用新手绘圖解 `D.cer.colour`。

**改動其他卡**
- `flag`：移除上輪擺落去嘅 5 項旗操 §9–§12 types ＋「§1–§8 冇文字層／照紙本核對」呢類講法，改為一句指向 `#ceremony/colour`（避免兩邊溝）。
- `march`：補第 6 章 §10 **行進間注目禮**（Eyes — RIGHT (LEFT)! 打數 Up／Check — Up，慢步動令喺右腳腳外側著地、快步喺左腳腳踭著地，⚠️最右（左）前方嗰名隊員唔使轉頭；必須喺列隊期間做）。
- `parade`：補**附錄丙 檢閱會操 12 步**（RIGHT — MARKER（14 步）→ MARKER OUTWARD — TURN → MARKER — STEADY → GET ON — PARADE（14 步）→ IN OPEN ORDER RIGHT — DRESS → STAND STILL 前／中／後排 → EYES — FRONT → CALL THE ROLL → STAND AT — EASE → PARADE — SHUN）＋**附錄丁結業會操第一號／第二號**收隊段分別（第一號 MOVE TO THE LEFT IN THREES + ON THE LEFT FORM — SQUAD；第二號 MOVE TO THE RIGHT IN THREES + 三次 LEFT — WHEEL），提示「揀咗邊號就成場跟返邊號，唔好溝住用」。

**測試（`tests/smoke.mjs`，而家 151 項全綠）**
- 新增 v27 斷言組：卡數 ≥12、旗操卡 11 條手冊原文、口令表 7 條、會操卡 8 條、march 注目禮 4 條，以及**禁止**升旗卡再出現「呢份電子檔冇文字層／仍待紙本」呢類過時講法。
- `DIAGRAMS` 手繪圖解由 37 → **39 張**，全部要過 viewBox 文字溢出檢查（舊有 cer.drill 兩段溢出已縮短至界內）。
- **新加「竿角幾何斷言」**：由 `D.cer.colour` 度旗竿路徑嘅角度，必須係 90°／90°／45°／≤25°（手冊 §2・§4・§5・§11）。第一次跑就揪出我托旗畫咗 34°，已改返啱 — 呢個做法值得推廣：**圖解入面凡是手冊寫明角度／距離嘅，用斷言度，唔好靠眼**。

**未做／下一步**
- 手冊第1–5章細節（各動作分部）仍有多 chunk 未逐個核對；如果之後要將每式動作都做圖解，按 §23 個方法（先讀晒 chunk → 寫卡 → 加角度斷言）。
- 用戶仍可以要求補圖；補圖批次上限 10 張／AVIF／唔出制服／唔出繩結逐步圖，照舊。

---

## 24. v28：補圖解 — 步操分部動作 10 張手繪圖（2026-09-16）

用戶一句「補圖解」。做法：**先讀晒手冊第3–4章所有 chunk**（第 23 節個教訓），再照「分部動作（by numbers）」逐段画圖；**一律手繪 SVG，唔用 AI 圖**（AI 數唔到腳序亦度唔到毫米）。

**新增 10 張圖（`js/svg-kit.js` 嘅 `D.cer.*`）**
| key | 內容（章節） |
|---|---|
| `attn` | 立正・抽膝踏步・彈前腳（第3章§1–2）：腳尖向外 30°、握拳母指壓食指、後顎貼衣領；抽膝大腿平行；彈前腳 375mm |
| `rest` | 稍息・休息・回立正（第3章§2）：打數 Out!／無／In!、腳踭 305mm、右掌疊左掌、⚠️立正↔休息必須經稍息 |
| `turns` | 原地四轉（第3章§3–6）：右 90／左 90／後 180／斜 45，打數 One—Two—Three—One（Two—Three 停留）、軸心腳踭＋腳尖 |
| `salute3` | 原地向前敬禮（第3章§7）：Up 先向橫至與肩膊平→食指喺右眼眼球中心對上 25mm、Down 用最短距離回褲骨 |
| `sidepace` | 橫移（第3章§8）：每步 300mm、打數 One—Two—Up—…、最後一步唔加 Up、上限 8 步 |
| `qmarch` | 快步開步三分部（第4章§1）＋慢步 balance step（第5章§1）：750mm、116 步/分鐘、三種開步口令 |
| `qhalt` | 快步停步（第4章§2）：Freeze→One(半步375)→Two、二至三分部雙倍速度 |
| `marchturn` | 行進間向左／右轉四分部（第4章§3–4）：Freeze／提膝／以腳踭為軸轉 90＋伸出半步 375／Forward |
| `marchabout` | 行進間向後轉（第4章§5）：In（750mm＋右腳小步 **150mm**）→兩次 90 度→Forward；初學可用合併分部 In—Left |
| `changestep` | 行進間換步（第4章§6）：右腳踏喺**左腳腳踭後**、後兩步雙倍速度、相反版打數 Right—Left—Right |

**畫圖用「數據產生圖形」＋測試斷言（呢個係本次最值得沿用嘅做法）**
- 新 helper：`fSFG`（側面人形，四肢用角度）、`fTOP`（俯視腳位）、`fFGG`（正面敬禮）、`fDIM`（毫米尺寸線）、`fARC`（轉向弧）、`fCL`/`fDGR`（分格排版）。
- 每一條尺寸線都寫 `data-mm` ＋ `data-len`，全部圖共用同一個比例 `fS = 0.05 px/mm`；`tests/smoke.mjs` 逐條核對 `|len - mm×0.05| ≤ 1.2`。**效果**：750 一定要係 375 嘅兩倍、150mm 唔可以随手画大。
- 每一個角度都寫 `data-ang`，而且數值係由畫出嚟嘅弧直接計算（唔准另外宣稱）；測試斷言 `turns` 有 90/180/45、`attn` 有兩個 30 ＋一個 90、`rest` 有 30。
- 順手升級咗 viewBox 溢出檢查器：**用 stack 累加巢式 `translate`／`scale`**（舊版见到 `</g>` 就歸零，令我十張新圖全部誤報左邊界溢出；改完先至真係反映瀏覽器實際位置）。現在 48 張圖解全過。

**渲染端**
- `js/app.js`：新增 `App.cerDgm(key, caption)`，支援 `steps[].dgm`／`types[].dgm`，以 `<details class="dgm-fold">` 折疊（手機唔會撐到好長）；`App.printSec` 喺 clone 之後將所有 `details` 設 `open=true`，**列印一定出到圖**（用家之前要求「列印必須指邊印邊」）。
- `css/app.css`：加 `.dgm-fold` 樣式 ＋ `@media print` 隱藏 summary。

**同步改嘅文字**（全部照手冊，唔係自己推斷）：footdrill 步驟重新編序 1–15（之前有兩個「3.」「4.」）、稍息補回打數 `Out!`、回立正 `Alert!`＝`In!`、轉法補分部口令 `Turning by numbers…`、橫移補打數序列；march 拆開「向後轉／換步」兩步並補 150mm 小步＋`左腳腳踭後`＋慢步 balance step；salute 卡「全禮」挂上 `salute3` 圖解。

**踩咗嘅坑（寫低以免再犯）**：我一开始把 helper 命名做 `dot`／`ln`，`js/svg-kit.js` 本身已經有同名 helper（`(x,y,r,fill)`／`(x1,y1,x2,y2,st,col,dash)`），新定義蓋住舊定義之後**弄坏咗 `D.cer.close`（fill="undefined"）同埋其他用 `ln` 嘅舊圖**。全部函數改名加 `f` 前綴後正常。**規則：喺 svg-kit.js 加 helper 一定要用獨有前綴，唔准用 `T/svg/dot/ln/box/arrow/row/sq/mkr` 呢類名。**

**下一步（未完成）**：仲有第5章慢步全套分部、第4章§10 原地踏步、§7–9 行進間致敬七分部、第6章§1–8（斜轉／彎道／開闊排睇齊）未画圖解；`D.cer.march`／`handsign`／`colour` 已存在。想再補就照本節個做法（讀晒 chunk → 數據画圖 → data-* 斷言）。

---

## 25. v29：範圍收斂 — 集會套包得返會員章＋日常集會（2026-09-16）

用戶本來叫「再出第二批 10 張」圖解，跟住即刻收口：「**等一下，我們這是集會套包，就只需要最基本的，深的讓領袖自己去上班學／研讀步操手冊，我們就只教會員章內容和日常集會而已**」；再確認基本清單＝「開禮・禮成・集合／解散・立正／稍息（童軍動作）・三指敬禮・升旗禮儀・宣誓・團呼 ＋ 小隊隊列／開會操前後基本整隊（立正・稍息・睇齊）＋ 隊旗升旗手站位」，处理方式揗咗「**由 app 移走**」（唔係折埋）。

**刪咗乜（git 歷史有晒，要還原就 `git show 4dea5e6:js/ceremony.js` / `git show 243874a:js/svg-kit.js`）**
- 儀式卡 **12 → 8 張**：刪走 `march`（快慢步行進 12 步）、`parade`（會操檢閱／附錄丙丁戊）、`colour`（旗操 12 節全本）、`commands`（附錄甲＋乙口令與動令時間表）。
- 圖解 **19 → 9 張**：刪走 v28 十張入面嘅 `turns`／`sidepace`／`qmarch`／`qhalt`／`marchturn`／`marchabout`／`changestep` ＋ `D.cer.colour`（旗手四式）、`D.cer.march`（行進間口令九格）、`D.cer.handsign`（七款集隊手號），埋佢哋嘅 helper（`COL`／`MD`／`HS`／`fTURN`／`fSTRIDE`）。**留低**嘅三張新圖全部係基本級：`attn`（立正・腳 30°・握拳）、`rest`（稍息・休息・回立正）、`salute3`（原地向前敬禮 25mm）——`attn` 由 4 格縮到 2 格（抽膝／彈前腳删走）。
- `footdrill` 卡 15 步 → 9 步（立正／稍息／休息／轉姿勢順序／睇齊／原地向前敬禮／齊步——走・立——定／集合・解散／「進階去邊度學」）；`fallin` 15 步 → 7 步（集隊成三排／報數／空行／睇齊／解散＋一句講明七款手號屬進階）；`flag` 卡旗手部分改為三式摘要（持旗立正／攜旗／托旗）＋「其餘十一節照手冊第7章」；`salute` 卡「行進間致敬」改為進階提示。步幅／步速數字（750mm・116/65 步）亦由卡內移走，只餘「照手冊第4–5章張表」。
- `c01-lesson.js`：删走「抽膝踏步＋彈前腳」嗰步，騰出嘅 4 分鐘分配畧 立正 6／稍息 7／小隊比賽 5（block 6 仍然 30 分鐘，測試會核對加埋係 30）；總結改用會員章 m5 嘅講法。

**留咗久（刻意唔刪）**
- `CEREMONY.refs` 入面《步操手冊》DRILL MANUAL 連結＋版次（2003 年 7 月第二版）— 呢個就係「進階去邊度睇」嘅出口；儀式頁 lede ＋ 參考文件 callout 已寫明「深階請上訓練班＋照手冊，唔好靠記憶」。
- `js/app.js` 嘅 `App.cerDgm`（steps/types 逐項圖解）＋ `.dgm-fold` 折疊 ＋ 列印自動展開 details：呢套機制基本級都要用（立正／稍息／敬禮），唔係為深階而設。
- 角度／毫米斷言機制（`data-ang`／`data-mm`+`data-len` 共用 0.05px/mm 比例）繼續用喺三張基本圖上。

**測試（`tests/smoke.mjs`）**
- 舊 v25／v26／v27／v28 四段斷言全部拆走，換成一段 **v29 範圍守門**：卡數與 key 集合要 exactly 8 張；十個進階圖解 key 要「唔存在」；`app.js/ceremony.js/svg-kit.js/c01` 入面唔准出現 `Changing step`／`Inclining`／`Squad will advance`／`Bend the left knee`／`抽膝踏步〔`／`150mm`／`每分鐘 116`／`#ceremony/march` 等標記（**用嚟防止自己又好、AI 又好，下次又將深階搬返入面**）；同時要出現 30 度／305／Out!／In!／握拳／後顎／睇齊／解散／步操唔准用作懲罰 呢啲基本項。
- 順手修咗兩個**睇唔到嘅真 bug**：
  1. viewBox 溢出檢查器喺 v28 升級時 group 序號遷咗位（`mm[5]/mm[6]/mm[7]` 應該係 `mm[6]/mm[7]/mm[8]`），變成實質上乢都查唔到；改返啱之後即管捉到 **`D.skillx.legend` 四條標籤喺 y=144 但 viewBox 高得 130 → 一直俾人 cut 咗**（已改 152）。而家 32 張圖解全部真係過檢查。
  2. `sw.js` 版本斷言由「硬編碼 v27」改成「sw 版本必須同 README 寫嘅一致」，以後唔使再改 test。
- `npm test` **全綠**（圖解渲染＋每張儀式卡頁 render 都跑過）；`tests/practical.mjs`／`print-songs-art.mjs` 係舊架構遺留（引用 `Ceremony.items`／`Ceremony.get('commands')`），本来已經跑唔切、亦唔喺 `npm test` 之內 — 未動。

**以後嘅做法（重要）**：想加任何儀式／步操內容之前，先問「會員章要唔要？日常集會用唔用？」；兩樣都唔係 → 只寫一句指向手冊＋訓練班，唔好画圖、唔好列程序表。

## 26. v30：基本級 D 圖補晒（2026-09-16，用戶：「D 圖補晒就可以合併進 main」）

### 補咗 4 張手繪圖解（`js/svg-kit.js` → `D.cer.*`，9 → **13 張**；全站手繪圖解 32 → **36 張**）
| key | 內容 | 接喺邊 |
|---|---|---|
| `formup` | 集隊站位頂視圖：F1 右標號員起、C1／R1 向左伸延・司令員與前排 2250mm・小隊長最右／副隊長最左・報數・人唔啱數就 `BLANK — FILE!` 留空行 | `#ceremony/fallin`（card-level `dgm`） |
| `dress` | 睇齊 `Up—Two—Three—Move`：前排右手**向橫**＋頭轉**右 90°**（用 `fARC` 落 `data-ang`）・最右行中／後排手**向前**・移到得一手位・兩排版行與行 375mm／排與排 1500mm（`fDIM` 落 `data-mm`） | `footdrill` 步 5「睇齊」（`steps[].dgm`） |
| `threefinger` | 童軍三指手形（宣誓＋敬禮共用）：食／中／無名指並攏、拇指壓小指、手心向前略向下；敬禮位置＝食指喺右眼眼球中心對上 **25mm**；三指含義註明屬團内講解、有官方講法照官方 | `salute.types` 第一條（`types[].dgm`）＋ `oath` 步 4 指去呢張卡 |
| `howl` | 團呼：馬蹄鐵隊形（頂視圖・開口位）＋「邊啲有依據／邊啲待核」對照格＋帶領次序＋可評估項 | `#ceremony/howl`（card-level `dgm`） |

### 範圍守則（照 §3 item 13）
- 四張全部係**會員章／日常集會**級：無一份畫深階步操；`formup`／`howl` 內文再講明「七款集隊手號屬會操／訓練班」「團呼字句仍屬待核・唔准自創」。
- `howl` 補咗圖但內容仍未核 → 卡上加 `pending:1`，`App.ceremonySec` 有圖都照樣出「⚠️ 仍待官方核對」提示（唔好因為有圖就當核實咗）。

### 順手修到嘅舊問題
1. **面板內文字出框**（新 checker 即時揪出）：`cer.attn`「口令 Alert!…Attention／Shun…」同 `cer.salute3` 英文口令行寬 ~200／183px，而 fCL 面板淨係 160px 寬 → 縮短至 ≤150px。
2. `fDIM(...,'一手位',0)` 會產生 `data-mm="0"` 假毫米值 → 改画普通標線（口語距離唔硬套毫米）。
3. `fallin` 嘅 `figcap` 由 v29 起係**死文字**（佢講緊已刪走嘅手號圖，而張卡冇 `fig`）→ 改寫成 `formup` 圖說。

### 測試（`tests/smoke.mjs`，`npm test` → 149 項全綠）
- 新增 v30 段：`D.cer` key 集合必須係嗰 13 張；**每張儀式卡都要有圖**（`fig`／`dgm`／`steps[].dgm`／`types[].dgm` 計）；**冇孤兒圖解**（每張都要俾卡引用；`fig` 當 AI 圖嘅後備圖解都算用咗）。
- 新圖內容斷言：`formup` 2250／標號員／小隊長／BLANK；`dress` `data-ang=90`＋一手位＋375／1500mm；`threefinger` 25mm＋拇指壓小指＋「官方講法」免责；`howl` 馬蹄鐵＋第8章＋「待核」「唔准自己創作」。
- **面板內文字溢出 checker**：巢式 `translate/scale` 疊乘後比較所屬 160×126 面板框（舊 checker 净係睇 viewBox，跨格疊字睇唔到）。`tests` 行 `node --check` 先至算數。
- ⚠️ 教訓：**自己寫嘅 QA 要自己先驗** — 第一版 panel checker 用咗面板原點去算 art 內座標（冇乘 0.86 scale），誤報 9 條；改返逐層疊乘至正確。

### 合併
- PR #3（`arena/01a0a749-scoutmeeting` → `main`）v19–v30 一次過合併；合併前 `npm test` 必綠＋`gh pr view 3 --json mergeable,mergeStateStatus` 要 `MERGEABLE/CLEAN`；repo 慣用 merge commit（main 頭先係「Merge pull request #2…」）。

## 27. v32：真分頁／清 agent 字句／補圖／營火會（2026-09-16，用戶睇完 v31 追加 5 項）

### 1. 清走「教你點用個 App」嘅字句（全站覆核）
- 刪：首頁 lede「搵今日集會：撳一行任何位置…」、集會工具 lede「…成員唔會覺得黑箱作業」、活動庫「一版講一個遊戲，唔會一次過彈晒…」、各頁「想印邊張就撳…／投屏出嚟一齊讀…」等。
- **寫法守則（以後照跟）**：UI 講內容同事實，唔講「你應該點撳」。`npm test` 有禁字檢查：`搵今日集會／黑箱作業／一版講一個遊戲／🅰️／🅱️`（app.js 連註解都唔准出現，projector.js 亦已改寫）。

### 2. 錨點跳位清零（`App.jump`／`App.chiprow` 已刪）
- 教案頁原本用 chip 行跳節：而家**改真分頁**——`App.filterbar(items, cur, pick, root)` 加 `root` 參數＋`App.showPane(root,key)`／`App.tabs()`；每個 section 包入 `div.tabpane[data-pane]`，撳掣即換版。
- 實作重點：`renderMeeting` 內以 `secList` 記錄 section 次序（**唔可以靠 `wrap.children`**——smoke 嘅 DOM stub 冇呢個 property，會 `filter called on null`），並包住 `wrap.appendChild` 收集；`tabHost` 一定要 `wrap.appendChild(tabHost)`（漏咗就冇分頁條，肉眼睇唔出，只有撳唔到掣）。
- 列印：`@media print{.tabpane{display:block!important}.tabhost,.pane-note{display:none!important}}`，所以「整場教案全部列印」照樣印晒；每節「🖨️ 只印本節」不變。
- 全 app 掃過 `chiprow／App.jump／scrollIntoView` 已清零；素材庫／制服／技能／儀式本身已經係 `#tab/key` 路由（真轉頁）。

### 3. 徽章位置局部放大圖（跟手冊做法）
- 用戶指：**《儀容與制服手冊》本身有局部放大插圖**。`D.uniform.zoom` 照住做兩個放大圈：左胸袋（袋蓋上方 3cm ↔ 袋中央）、右袖肩膊（旅章肩膊下 2cm、地域章前區章後相距 1cm）。
- 徽章頁加 callout 連去手冊第三章＋2023 年第 13 號通告 PDF 對照；另加 `D.uniform.scarf` 旅巾綁法（巾圈／3.5cm／12–15cm／巾尾唔超皮帶扣）。

### 4. 補圖（除繩結外全部有圖）
- 技能：`pioneer` 補 `figFor('pioneer')`（原本漏接）。
- 制服：新增 `D.uniform.land／sea／air` 顏色示意圖（**本地 SVG，離線都睇得到**；官網圖係熱連，離線會冇圖），AI 制服圖禁令照舊。
- 活動 12 個遊戲（11 AVIF＋1 俯視圖）、儀式 8 卡全部有圖；`tests/runtime.mjs` 逐項 check。

### 5. 🔥 營火歌 → 營火會
- 資料：`js/songs.js` 加 `staff`（4 位工作人員）、`ignition`（點火儀式＋3 款頌詞）、`cheers`（Bravo 三連呼／「童子軍，食雲吞」／「123，321，1234567」／拍手節奏呼／小隊吶喊／晚安呼）、`programme`（90 分鐘三段程序：熱身 → 高潮 → 寧靜結尾）、`gear`（設備清單）、`hostNote`。
- **出處**：《香港童軍》月刊第 414 期〈談談營火會〉（顏明仁、馮源）— https://scout.org.hk/article_attach/31112/sa_hksm_414_p2-4.pdf （已 fetch，內容已落地；重點：歡呼代替鼓掌、短劇 ≤3 分鐘、上半場多唱舊歌）。
- Nav／頁標題／搜尋索引全部改名「營火會」；`SONGS.meta.title`＝香港童軍營火會；SW cache `scout-v32-c24-20260916`。

### 測試
- `npm test` ＝ `tests/smoke.mjs` ＋ `tests/runtime.mjs`（**已修好舊 runtime**：佢以前引用 `js/jungle-data.js` 等唔存在嘅檔＋舊 API `App.vPlan`，載入次序亦錯（`js/data.js` 要用 C01 → 必須 lessons 先）。而家 runtime 會 render 全部頁面／分頁／24 場教案，並檢查畫面冇漏 `undefined`）。
- ⚠️ 教訓：**static patch 完要驗「掛唔掛得上樹」** — tabHost 冇 append、`appendChild(projAll)` 喺 `var projAll` 之前，兩單都係 harness／smoke 捉唔到嘅（stub 唔 throw）。所以加咗 static 次序檢查＋`tabHost` 掛樹檢查。

## 28. v33：制服配件補齊（2026-09-16，用戶：「一併補埋」）

- 依《儀容與制服手冊》**第三章 3.4–3.6**（Drive #7，fetch 到文字層）補齊：領巾 4 種、**巾圈 4 種**、捲巾 8 步規格、**領帶 4 色**、基維爾巾圈／領巾／木章（3.5）、皮帶／皮鞋／襪（3.6）。
- 落地位置：`js/uniform.js` 新增 `UNIFORM.neckwear`（scarves／rings／ringsOther／wear／ties／tieWear／rules）、`UNIFORM.kilwell`、`UNIFORM.beltSocks`；`js/app.js` 制服 subnav 加 `{k:'acc',ic:'🧣',n:'領巾領帶'}`；`js/svg-kit.js` 加 `D.uniform.ties`（4 色）＋`D.uniform.kilwell`（木章皮繩位置）。
- 註：3.6 原文「戶外活動尼龍皮帶：童軍成員（小童軍除外）穿著戶外活動服裝時可佩戴」；3.7 制服毛衣／3.8 附加配件喺掃描圖冇文字層，未入 app（需要就跟紙本核對）。
- 測試：smoke 加 v33 block（4／4／4／8 數量、關鍵字、圖齊、分頁 render、自查清單含領帶／巾圈／皮帶）、新 `plotCheck()` 檢查 SVG 文字唔出框。
- SW cache → `scout-v33-c24-20260916`。
- QA 手法（新）：冇 chromium／playwright，所以寫咗 `/tmp/svg2png.py`（純 Python 極簡 SVG rasterizer）＋`/tmp/svgaudit.mjs`（幾何座標出框檢查）嚟肉眼睇手繪圖——**只放 /tmp，唔入 repo**。

## 29. v33 收尾：讀完 Drive #8＋互動測試＋無障礙

- **Drive #8（`1sHG952U73znOwhSnZzoRpO1oSm_xZONG`）已讀**＝第五章「勳章及獎勵」＋第六章附錄（禮服／晚禮服款式、晚禮服黑色硬帽編號 UM01–UM05、金屬職級肩章）。**全部係成年成員／總監勳章範疇**，同 §3 用戶約定（範圍收斂：只做會員章＋日常集會）唔相關 → **決定唔入 app**，避免又開新範圍。連帶：#7 chunk 1 亦已讀（只係上頁最後一句）。
- 手冊第三章現況：3.1／3.2／3.3／3.4／3.5／3.6 已落地；**3.7 制服毛衣、3.8 附加配件仍係掃描圖（無文字層）**，未有紙本可核對前唔寫。
- 互動修正：
  1. 活動庫分類掣唔再用全域 `document.querySelectorAll('#view .filter-btn')` 清 active（會誤清其他篩選 bar）→ 改為只喺自己條 bar 切換，卡片篩選 scope 喺本頁 `wrap`，並補 `role="tablist"`／`aria-selected`。
  2. `App.filterbar`／`App.showPane` 補 `role="tab"`／`aria-selected`／`role="tabpanel"`／`aria-hidden`。
  3. 素材庫工作紙嗰句「（跟住做時一齊印）；呢度係「淨係想印某張」嘅入口」＝agent 味 → 改寫成「同集會目錄每場教案用嘅係同一份工作紙。」
- 測試（`tests/runtime.mjs`）：**(1) 行為測試**——撳第 3 個分頁掣 → 只顯示第 3 版、active／aria-selected 跟住移；活動庫撳分類 → 只顯示該類、撳「全部」還原。**(2) DOM stub 升級**：`className` 同 `classList` 同步（用 accessor），否則「一開頭只顯示一版」呢類測試會假過。
- 文件：README 手動 QA 清單加 v32／v33 項目（分頁唔跳位、列印展開、活動篩選、制服配件、營火會區塊）；POSITIONING.md 字眼「營火歌」→「營火會」。

## 30. v33 最終：3.7／3.8 唔入 app（用戶決定）＋合併 main

- 用戶指示（2026-09-16）：「制服手冊 3.7 制服毛衣、3.8 附加配件 那不用加，就叫有需要到童軍用品供應社查詢」。
- 落地：`UNIFORM.source.shopUrl` ＋ 新 `UNIFORM.shop`（名稱／網址 https://www.hkscoutshop.org.hk/ ／地址（香港童軍中心 11 樓）／電話 2957 6444／電郵／`rule`＝手冊 3.1「配件以童軍物品供應社所供應者為標準」／`rest`＝「3.7／3.8 本 app 唔詳列，有需要到供應社查詢」）。
- 顯示位置：制服「🧣 領巾領帶」分頁尾、每個支部頁「三組共通」callout、自查清單頁。**冇自創 3.7／3.8 內容**（避免估錯用品款式）。
- 教訓／守則：手冊冇文字層嘅章節，一律用「指向供應社／官方」收尾，唔好靠估。
- 之後：`gh pr merge 4 --merge`（repo 慣用 merge commit），main 由 `88c4f6e` 前進。

## 31. v34：雙角色＋手機全面 QA、營火會六分頁、補齊遊戲圖片（2026-09-16）

### 用戶要求（現行約定）
1. 分別由**第一次帶集會嘅新領袖**同**熟手領袖**情境全面測試。
2. 手機要方便；按鈕功能唔重複、定位清晰。
3. 營火會總覽內容太多，要拆分頁。
4. 除繩結外，缺圖內容要補圖；只可用網上圖片轉 AVIF／直接連結，**今輪不可自行生成圖片**。

### 資訊架構及按鈕
- `#plan` 頂部加兩張純提示卡：新領袖按「揀一場 → 領袖預備 → 安全注意」；熟手用下方素材庫／活動／技能／興趣章／營火會。提示唔另加捷徑，避免同既有導航重複。
- 24 場目錄加 5 個即時篩選：全部、會員章 c01–06、探索 c07–18、標準／總結 c19–24、特別集會；手機將 7 欄表轉成整張可按卡，保留場次、月份、主題、獎章、形式、狀態及箭嘴。
- 頂欄由「搜尋＋3 個外部工具」收成唯一**搜尋**＋**參考資料**入口；外部網站仍喺 `#book/refs`，冇刪功能。
- 操作範圍固定：浮動 `投整頁`、section `印本節／投本節`、遊戲／素材卡 `印遊戲（或印呢張）／投講解（或投呢張）`。有逐卡操作嘅頁移除重複外層操作；搜尋改 `oninput` 即時出結果，冇第二個提交掣。

### 營火會
- `#songs` 預設流程；總覽拆成 6 個主導航：`flow` 流程、`cheers` 歡呼、`staff` 人手設備、`lead` 帶唱、`library` 14 首歌單、`safety` 安全考章。
- `#songs/<song-key>` 14 條舊深層連結全部保留；單歌有上一首／下一首／返歌單。
- 390px 實測頁高：flow 1559、cheers 1624、staff 1831、lead 2427、library 2476、safety 1321；唔再將所有資料塞入一個 8,000px+ 總覽。

### 圖片（不可回退）
- 遊戲現為 **12/12 有 AVIF 主圖**，而且每張仍保留 `DIAGRAMS.game` 俯視設場圖作補充／fallback；繩結照用戶要求唔補圖。
- `game-chairs.avif` 唔係 v23 被擋嘅生成候選圖。現圖來自 Wikimedia Commons：Artaxerxes，*Musical chairs Lawn Jam Our Community Place Harrisonburg VA June 2008*，CC BY-SA 3.0；原相縮至 **800×474**、移除 metadata、轉 AVIF（約 23KB），**沒有使用生成式 AI**。
- 授權、原始 URL、改動及用途限制寫喺 `img/fig/SOURCES.md`；卡內亦有作者／授權／來源連結。此署名及 ShareAlike 資料必須隨圖保留。
- 相片只示範櫈圈同同方向走動；大風吹「參加者少一張櫈」、中央叫特徵及安全距離仍以文字＋俯視圖為準。

### 手機修正
- `@media(max-width:640px)`：可操作 button／文字及數字 input／select／textarea 最少 44px；section 操作亦由 40 提至 44px；checkbox／radio 24px 並由 label 提供可按範圍。
- 修正 320px 全局溢出：目錄卡片化、9 段程序卡片化、長表格只喺自身容器捲、工作紙長字可換行、營火導航 3×2（320px 2×3）。`overflow-x:clip` 唔係唯一防線：真 Chromium 逐路由量過 `documentElement.scrollWidth === innerWidth`。
- 制服官網圖 fallback 不再假設 sibling 一定存在；以 `.closest('.uniform-visual').querySelector(...)` 安全查找。QA 人為觸發 `onerror`：官網圖隱藏、本地 fallback 顯示、零 page error。

### 測試結果
- `npm test`：`tests/smoke.mjs`＋`tests/runtime.mjs` **全綠**；包含 24 份教案、12 個遊戲、38 張 AVIF、六個營火主路由、14 首歌深層路由、圖片來源／授權、投屏範圍及 renderer。
- 真 Chromium 138（`/tmp/scout-browser`）測 **35 路由 × 4 viewport = 140 route-view**：320／390／768／1280px 全部無全局橫向溢出、無可見 broken image、無本地 request failure、無 page error；320／390px 所有納入操作控制均無小於 44px。
- 390px 行為測試全過：新／熟手定位；6／12／6 階段篩選；鍵盤 Enter 開教案＋8 分頁只顯示一頁；即時搜尋；六個營火分頁；14 首歌深層連結及返回；遊戲 12→1 篩選；`投本節`／`投整頁` 各自打開；制服 fallback。
- QA 詳細 JSON 留喺當次 sandbox `/tmp/scout-v34-browser-qa.json`（唔入 Git）；自動 smoke/runtime 先係 repo 內長期守門。

### PWA／文件
- `sw.js` cache：`scout-v34-c24-20260916`；預 cache 新 AVIF。38 張 AVIF 合計約 1,194KiB（仍低於 smoke 1,200KiB 上限）。
- README 同本 HANDOVER 已同步。歷史 §19 嘅「game-chairs 禁止回流」只係針對錯櫈數生成候選圖，已由本節及現行 smoke 斷言取代。

---

## 32. v38：深資童軍版全量重建（2026-09-17）

由童軍 Scout Hub v37 起步，按《深資童軍訓練綱要》＋官方深資集會套包（2026-09-01）全量重建。Scout System 出品（app 名：深資童軍團集會助手）。

### 重寫／刪除
- **教案**：c01–c16 全新深資版（會員章→肩章認識→肩章技能）；**刪除 c17–c24**（`index.html` script tag＋`sw.js` cache 一併移除）。
- **儀式**：7 套卡（刪團呼；集隊改執委會帶；開禮加「深資集會唔設童軍團呼」註明）。
- **制服**：深資 6 款規格重寫（軟帽／恤／褲裙／皮帶鞋襪／旅巾巾圈／徽章五種）；服式圖改官網原圖 link-only（唔本地存）；分支卡唔再用童軍支部顏色對照圖。
- **獎章**：`interests.js` 重寫成 20 項（會員章 m1–m11＋肩章 7＋獎章路 2），每項 req＋suggest＋meet；考章＝團內考核 7 步；訓練班＝通告圖書館 7 步（`courseApply` 保留）。
- **技能**：繩結 10→9 個（刪半結／反手結／縮繩結／曳木結，加三編結）；地圖 1:25,000→1:20,000；急救 7 種→5 種（C10.firstaid）；營藝刀斧→刀具安全。
- **遊戲**：刪拖木頭挑戰（場地圖一併刪）；加破冰「你是誰」「用背脊畫圖畫」（唔使場地圖）；計分板／工具改「分組」。
- **手冊**：小隊制度→執委會制度；「報考專科徽章」→「考章安排」；參考資料剩 3 條（深資綱要＋官方套包＋通告圖書館）。
- **品牌**：title／brand／footer／manifest／README 全轉深資版＋VENTURE＋Scout System 出品；官方套包 Drive ID 轉深資版 `1MEXphy7RQXXfFZX3uXsg0L4ZfOXbPEuo`。
- **sw.js**：`scout-v38-c16-20260917`；唔再預緩存 `img/badge/`＋`img/uni/`（童軍支部舊圖，檔仲喺 disk）。

### 保留未動（刻意）
- `assets_src/diasvg/` 手繪底稿（含 howl）、`js/dia.js` 全表、`img/dia/*.avif` 全部：幾何斷言（30°／305／25mm／2250／BLANK／viewBox 唔出框）照舊全綠；app 層唔引用 howl／uniform.branch。
- 歌曲 14 首（只改小隊→分組字眼）、投屏、列印、44px、營火會 6 分頁架構。

### 測試
- `tests/smoke.mjs` 重寫 v38 版（16 場段數／關鍵字、7 卡、20 獎章、11 遊戲圖＋2 破冰無圖、c16 cache 名、badge/uni 不在 sw、深資守則 block）；`tests/runtime.mjs` 訊息更新。`npm test` 全綠。

### 教訓（重要）
- **唔好同一個 block 入面對同一個檔打多個 edit_file**：會 race（last-write-wins，甚至 corrupt）。同檔多改一律用 **一個 bash python script 原子執行＋assert 逐個 count**。
- 從 `read_file` 輸出抄 regex 返 `write_file` 時，唔好「修正」反斜線數量：讀顯示會 double、寫輸入會 halve，**逐字抄先啱**。中過一次：viewBox checker 誤報，root cause 係我將 `\\d` 寫成 `\\\\d`。

## 33. v39：底部第 5 格由營火會改做 AYP（2026-09-17）

用戶拍板：深資營火會由團員自務，唔係領袖帶隊教材 → 營火會成格刪除，換做 🌟 AYP（只查不記）。

### 定位修正（用戶原話精神，先定好上下格定義）
- 上方 5 格畀**新領袖**：只有集會目錄係流程（跟住做）；儀式／制服／套包／手冊係必修知識。
- 下方 5 格畀**熟手領袖**：心中有想法，直接搵料（唔係「事前 vs 臨場」之分，係「邊個話事」之分）。
- 集會目錄兩張提示卡文案已同步改（「第一次帶集會」／「熟手領袖搵料」）；README＋POSITIONING.md 同步改。

### 刪除
- `js/songs.js`（14 首歌紙＋programme/cheers/staff/ignition/safety/mustKnow）成檔 `git rm`。
- `App.campTabs`＋`App.pages.songs`＋`App.songSheetHtml`＋`App.songSec`＋`App.printSong`＋`App.projSong`；搜尋索引歌紙區（14＋5 條）；素材庫 `song` 分類（6→5 類）；手冊歡呼庫提示。
- `img/fig/fire-circle.avif`＋`img/fig/fire-song.avif`＋FIGS 兩條 key（43→41）。
- `index.html` nav＋script、`manifest` shortcut（name＋short_name＋url）、`sw.js` cache 兩張圖。
- 舊連結 `#songs*` → `location.replace('#ayp')`（同 patrol→book/exec 一樣做法）。

### 新增（`js/ayp.js`＋`App.pages.ayp`，4 分頁）
- `about` 概覽（AYP 係乜＋點解深資領袖要識＋同獎章獨立）／`levels` 三級要求比較表（主項／副項時數月份＋評核旅程時數）／`sections` 五科介紹（目的＋例子＋note）／`join` 7 步參加流程＋6 份官方文件連結。
- 數字跟 AYP 官方五科介紹（2024 PDF）＋ayp.org.hk 參加者進程＋童軍 AYP 專頁；scout.org.hk 舊數字表（服務 15/30/100hr）已過時，唔用。要求會變，頁面寫明「詳情以官方為準」。
- 搜尋索引加 4 條 AYP（type:'AYP'）。

### 刻意保留
- `js/dia.js`＋`img/dia/fire-*`（circle/flow/scarf 圖解）：c16 營火晚會照用；測試 iterate map，唔郁。
- smoke 嘅 `DIAGRAMS.fire` 檢查、`fire-robe` 負向檢查保留。
- c16 營火晚會段、遊戲「營火」分類、LNT 七原則「減營火影響」：係活動內容／場地分類，唔係已刪嘅歌紙頁，全部保留。
- `BADGE_FIG`（figs.js 死數據，v38 遺留）：唔郁，唔關 v39 事。

### 版本＋測試
- `sw.js` CACHE → `scout-v39-ayp-20260917`；smoke 改捉 `scout-v[0-9]+-[a-z0-9]+-[0-9]+`（唔再寫死 `-c16-`，README 用成個 tag 比對）。
- `npm test` 全綠；搜尋索引 92→77（門檻改 75）；FIGS 38→36（門檻改 36）；素材庫 6→5 類。
