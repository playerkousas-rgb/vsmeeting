# `img/uni/` 制服服式圖來源（3 張 AVIF）

## 來源

- **網站**：香港童軍總會官網 → 青少年成員 → 童軍支部（制服圖）
  <https://www.scout.org.hk/tc/youth-members/scouts/index.html?sid=2>
- **原圖（官網 JPEG，每個支部男／女各一張）**：

| 本地檔 | 官網原圖 | 內容 |
| --- | --- | --- |
| `land.avif` | `uploads/member/Scout_B.1.jpg` ＋ `Scout_G.1.jpg` | 陸童軍男／女團員 |
| `sea.avif` | `uploads/member/Scout_Sea_B.jpg` ＋ `Scout_Sea_G.jpg` | 海童軍男／女團員 |
| `air.avif` | `uploads/member/Scout_Air_B.jpg` ＋ `Scout_Air_G.jpg` | 空童軍男／女團員 |

- **改動**：男女兩張並排、去底、統一高度，`-resize 900x -quality 55` 轉 AVIF（3 張共約 110KB）。
  無加字、無改色、無用生成式 AI。
- **維持熱連**：制服頁仍然有「🖼️ 開總會官網原圖」連返上述官網 JPEG，
  圖載入唔到（離線／官網改路徑）會自動改用官網原圖，再唔得就顯示提示。

## 點解要本地一份

- 用戶要求「制服內唔要用 SVG」，而且離線（露營／集會現場冇網）都要睇得到服式；
- 官網 JPEG 熱連喺離線時一定爆圖，本地 AVIF 入咗 Service Worker 預緩存（`sw.js`）。

## 使用限制（照舊）

- 制服**顏色配搭**另有手繪示意圖（`img/dia/uniform-{land,sea,air}.avif`，由 `js/uniform.js` 資料畫）。
- 一切以《儀容與制服手冊》同**童軍物品供應社**（<https://www.hkscoutshop.org.hk/>）供應嘅實物為準；
  官網圖只用嚟睇式樣，唔會用嚟判斷尺碼或配件細節。
- 手繪圖解一律只畫中性練習衫，唔會生成制服圖（見 `HANDOVER.md` §20）。
