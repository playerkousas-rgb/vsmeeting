# 📮 意見回報系統（Scout Admin 統一回報 v1）

> 加入日期：2026-10-22 ｜ 影響檔案：`index.html`、`js/enhance.js`（新）、`css/app.css`、`sw.js`、`tests/runtime.mjs`、`tests/quality.mjs`
> 結論：本 APP **原本冇**任何回報／意見渠道；現在接上 Scout Admin 的**統一回報 v1**：一行腳本、無後端、同其他童軍系統同一個看板。

---

## 一、加了什麼

| 位置 | 內容 | 檔案 |
|---|---|---|
| 全站右下角浮動掣 | 官方 widget：`🐛💬 回報 · 意見`（問題回報／意見回饋兩個分頁） | `index.html` 最後一行 `<script>` |
| 手冊 `#book/refs` | 「📮 意見回報」卡：開表單掣＋網頁版表單＋私隱提示＋離線做法 | `js/enhance.js`（`App.feedbackCard`） |
| 離線／腳本被封時 | 撳「開回報表單」會開模態：可複製的回報文字＋網頁版連結 | `App.feedback()` / `App.copyFeedback()` |
| 樣式 | 浮動掣升上底部導覽（原本會蓋住 `#tabbar`）、≥44px、列印時隱藏 | `css/app.css` 尾段 |
| 離線清單 | `sw.js` 升 `CACHE` 版號，舊用戶會換新 | `sw.js` |

接入碼（就係這一行）：

```html
<script src="https://scout-admin-blue.vercel.app/widget.js" data-app="深資童軍集會" defer></script>
```

- **`data-app="深資童軍集會"`** 一定要用這個名。
  用「深資童軍」會被 Scout Admin 的 `SOURCE_ALIASES` 歸入**專章系統**，同獎章 APP（`vsbadge`）的回報混在一起。
- 提交**不需要 API KEY、不需要登入**；`name`／`contact`／`troopId` 全部選填（可匿名）。
- 統一 payload：`type`（`issue`／`feedback`）、`sourceApp`、`title`／`desc`／`severity` 或 `fbType`／`content`。

---

## 二、後台會見到什麼

在 Scout Admin（`https://scout-admin-blue.vercel.app/`）的「問題回報 / 意見回饋」看板：

- 來源名稱：**🔹 深資童軍集會**（未登記來源＝原樣顯示，照樣分流、照樣統計，**唔會漏單**）。
- 想看正式名稱／專屬圖示／固定排序，才需要在 **scout-admin 倉庫**加一行（可選，非必須）：

```js
// scout-admin/index.html  SOURCE_APPS
{ key:'vsmeeting', icon:'🧭', label:'深資童軍集會',
  aliases:['vsmeeting','vsmeeting.vercel.app','深資童軍集會','深資童軍團集會'] }
```

```js
// scout-admin/apps-script/Code.gs  SOURCE_ALIASES 加同一組別名（儲存名稱會統一成中文）
```

改完依文件重新部署（管理部署 → 編輯 → 版本：新版本），Apps Script 網址不變。

> 這兩行**未做**（唔屬本 APP 範圍）；未做都照收得到，只係後台顯示 `🔹 深資童軍集會`。

---

## 三、離線／被封網時的退路（重要）

本 APP 係離線優先 PWA，但 widget 係**外部腳本**，Service Worker 唔會跨網域快取它。

| 情況 | 行為 |
|---|---|
| 有網 | 右下角出現 `🐛💬 回報 · 意見`，撳開即有兩個分頁（問題／意見），提交後顯示「✅ 已提交」 |
| 離線／腳本載入失敗 | 浮動掣唔會出現（頁面照常運作，0 錯誤）；手冊「📮 意見回報」卡仍然開得，撳「開回報表單」→ 出可複製文字＋網頁版連結 |
| 恢復上網 | 浮動掣自動再出現，唔需要重裝 |

實測（sandbox 連唔到 `scout-admin-blue.vercel.app`，正好模擬離線）：
`#book/refs` 1 個 `h1`、`.feedback-holder` 存在、`#scoutw-fab` 不存在、`App.feedback()` 回 `false` 並開後備模態、模態有 `#fb-ta` 同 `report.html?app=` 連結、0 console error。

---

## 四、私隱界線（寫入 UI，亦寫入測試）

- 只收**問題本身**；卡片同後備模板都寫明：**唔好填團員姓名、班別、地址或相片**。
- 無出席／考章資料，無帳戶，無 cookie；提交內容唔會寫入本機儲存。
- 「帶會進度／繼續上次」係另一個獨立功能：只用 `localStorage` 記場次同段落，**冇上傳、冇姓名**。
- 領袖如要留聯絡方法，屬自願欄位（`name`／`contact`）。

---

## 五、測試鎖

`tests/quality.mjs`（靜態）＋`tests/runtime.mjs`（行為），合共 20+ 條回報相關斷言，包括：

- `index.html` 有官方 widget 腳本、`data-app="深資童軍集會"`、有 `defer`；
- **唔准**用 `data-app="深資童軍"`（會被歸入專章系統）；
- `enhance.js` 必須喺 `app.js` 之後載入（`App.wrapOn` 先用得）；
- 手冊有回報卡、私隱提示、離線做法；
- `App.feedback()`／`copyFeedback()`／`feedbackTemplate()` 存在，模板含類別／頁面／裝置；
- CSS：浮動掣 `bottom:calc(var(--tabh,82px)…)`、列印隱藏；
- 腳本未載入時 `feedback()` 必須回 `false` 並開後備模態（唔可以靜靜失敗）。

---

## 六、其他 MEETING APP 要照做的最小步驟

1. `index.html` 最後加一行，只改 `data-app`（見下表）。
2. 加 `js/enhance.js`（照抄本 APP，改 `App.FEEDBACK.app`／`data-app` 名），喺 `app.js` 之後載入。
3. CSS 加浮動掣位置（`#scoutw-fab{bottom:calc(var(--tabh,82px) + 18px)…}`）。
4. `sw.js` 升 `CACHE` 版號，令舊用戶換新。
5. 跑一次 `npm test`，加返一條「唔准用單一支部名做 data-app」的斷言。

| APP | `data-app` |
|---|---|
| 深資童軍集會（本 APP） | `深資童軍集會` |
| 幼童軍集會 | `幼童軍集會` |
| 童軍集會 | `童軍集會` |
| 樂行童軍集會 | `樂行童軍集會` |
| 旅團通用 | `旅團集會` |

⚠️ 共通禁忌：**唔好用**「幼童軍」「童軍」「深資童軍」「樂行童軍」單獨做 `data-app`——全部會被歸入「專章系統」。
