# `img/dia/` 圖解來源（54 張 AVIF）

## 呢啲圖係咩

兩條唔同嘅製作線，出圖格式一樣（AVIF），前端一樣由 `js/dia.js` 嘅 `IMG.map` 出 `<img>`（v37 起前端零 SVG）：

| | 邊 45 張 | 制服 9 張（`uniform-*`） |
| --- | --- | --- |
| 圖解內容 | 儀式／遊戲／技能／營火／追蹤／指南針／背囊 | chest、zoom、sleeve、body、scarf、ties、kilwell、cap、branch |
| 底稿 | app 自己嘅**手繪 SVG**（`assets_src/diasvg/diagrams.src.js`＋`svg-kit.src.js`，build-only） | **乾淨服裝底圖（AI 生成，中性衣物、零徽章零文字）＋ 程式疊位** |
| 前端出圖 | `js/dia.js` `IMG.map` → `DIAGRAMS.*` → `<img src="img/dia/*.avif">`（45 張底稿唔會下載） | 同左（v36 起直接登記 `IMG.map`，冇底稿） |
| 後備 | v37 起**冇 SVG 後備**：AVIF load 唔到就 `IMG.fallback()` 出 `alt` 文字（`.dgm-fallback`） | 同左（`alt` 文字＋`figcaption`） |
| 測試 | `tests/smoke.mjs` 驗底稿尺寸線比例（0.05 px/mm）／角度／文字唔出框 | 驗 9 個 key 有 AVIF、冇 SVG 底稿、alt 有齊實際距離（3cm／2cm／1cm／3.5cm） |

### 制服 9 張點解要另做一條線（v36）

用戶 2026-09-16：「制服內的 SVG 很醜，徽章佩戴也要有圖」。

- 制服唔可以由 AI 直接畫（**HANDOVER v21 禁令**：AI 一定畫錯帽章／巾圈／袋蓋／布章位置），
  亦唔可以靠手繪 SVG（就係「醜」嘅來源，而且人眼對位易錯）。
- 所以分兩層做：**底圖＝乾淨衣物（AI 生成，只有衫褲帽，冇任何徽章、冇任何文字、冇位置線）；
  位置＝程式畫**。位置一律由 `/tmp/build/fig_uniform.py` 用 PIL 按 `js/uniform.js` 嘅
  `UNIFORM.placement`／`UNIFORM.cap` 逐項疊上去（袋蓋線、3cm／2cm 尺寸線、①–⑨ 編號、皮帶線、
  領巾規格線），所以「章喺邊」永遠由條文決定，唔會由 AI 決定。
- 比例一律由實際量度底圖得出（shirt 12px/cm、figure 4.36、tie_shirt 17 等），
  尺寸標籤寫嘅 cm 同圖上嘅距離係同一套換算。

## 檔案清單（54）

| 前綴 | 張數 | 內容 |
| --- | --- | --- |
| `cer-` | 13 | 儀式／步操：集隊、睇齊、立正、稍息、敬禮、三指手形、升旗禮、宣誓站位、集會開始／結束、團呼馬蹄鐵 |
| `uniform-` | 9 | 制服：chest 胸袋上下層、zoom 左胸袋＋右袖放大、sleeve 右袖由上至下、body 全身衫袖肩帶、scarf 旅巾佩戴＋規格、ties 領帶四色、kilwell 木章皮繩、cap 制服帽帽章、branch 陸／海／空顏色配搭對照 |
| `skill-` | 9 | 技能：收繩、地圖圖例、帳篷、爐具、小刀、RICE、SOS、迷路、復原臥式 |
| `fire-` | 3 | 營火：火圈座位、流程、營火袍 |
| `dgm-` | 2 | 指南針八方位、背囊分層 |
| `track-` | 6 | 追蹤符號（箭嘴／圓圈／交叉／轉彎／水／訊息） |
| `game-` | 12 | 遊戲場地俯視圖 |

## 製作方法

### 手繪 45 張

0. **v37 起底稿位置**：`assets_src/diasvg/diagrams.src.js`（指南針／背囊／追蹤 6）＋ `assets_src/diasvg/svg-kit.src.js`（儀式／遊戲／技能／營火／復原臥式）；呢兩個檔**唔會**入前端 bundle（`index.html`／`sw.js` 都冇），只係重建 AVIF 同俾測試驗圖用。
1. 底稿 SVG（340 單位闊，除遊戲圖）→ `resvg-js` raster：
   - `cer`／`game`／`skillx`／`fire`：放大 3 倍
   - 指南針／背囊：放大 4 倍　·　追蹤符號：放大 5 倍
   - 字體：`Noto Sans CJK SC`（Regular ＋ Bold），`loadSystemFonts: false`（避免揀錯字）
   - ⚠️ `@resvg/resvg-js` 出唔到 `<text>`（`defaultFontFamily`／`fontFiles` 都無效）→ 呢條線唔可以出文字圖
2. `convert` 轉 AVIF：大圖 `-resize 720x -strip -quality 50`；追蹤符號 `-resize 240x`。
3. 尺寸寫入 `js/dia.js`（`IMG.map`）嘅 `w`／`h`，同 `alt` 文字一齊——前端出圖時一定要有 `width`／`height`，避免跳位。

### 制服 9 張（v36）

1. 底圖 = `/tmp/art/` 嘅 AI 生成中性衣物（`shirt.png`／`figure_cap.png`／`ties.png`／`jacket.png`／
   `neck.png`／`fold.png`／`cap.png`／`tie_shirt.png`／`figure.png`），量度出每張圖嘅 px/cm。
2. `python /tmp/build/fig_uniform.py`：PIL 開底圖 → 按 `UNIFORM.placement` 疊位置線／尺寸線／編號 →
   加標題、圖表、出處（CJK 字型一律 `/tmp/fonts/DroidSansFallback.ttf`；偽粗體＝`stroke_width=2`）→
   1600px 闊 PNG（`figlib.Plate` 自動對放大過嘅底圖做 UnsharpMask）。
3. `convert out/<key>.png -resize '1200x>' -strip -quality 46 -define avif:pixel-format=yuv420p img/dia/uniform-<key>.avif`
4. 尺寸／alt 寫入 `js/dia.js`；key 加落 `sw.js` `ASSETS`；`js/svg-kit.js` 嘅 `D.uniform` 直接登記
   `IMG.html('uniform.<key>')`（唔再放 SVG 字串）。

## 質量檢查

- `node /home/user/svgrender/qa-textink.js`：逐張圖 render 兩次（完整／剷走文字），
  用「文字 bbox 內嘅深色像素比例」＋「文字 bbox 互相重疊」捉**文字壓住圖形**、**文字疊文字**。
  2026-09 用呢個腳本執好 8 處（立正腳形重畫、集隊尺寸線搬位、左胸袋／右袖編號加白底、
  睇齊「一手位」改量 375mm、營火圈標籤搬位等）。目標：0 個壓圖問題。
- `node /home/user/svgrender/qa-render.mjs`：跑 app 所有頁面，確認冇任何頁面再出 `<svg>`。
- `npm test`：`tests/smoke.mjs` 驗 `IMG.map` 每張圖（路徑／尺寸／alt／入 sw.js／檔案存在）、
  驗底稿嘅尺寸線比例（0.05 px/mm）、角度（立正 30°、睇齊 90°）、文字唔出框；
  v36 另加制服 9 張嘅存在／冇 SVG 底稿／alt 有實際距離嘅斷言。
- **制服圖嘅位置要人手對條文**：出完圖一定要放大睇（例：`/tmp/qa/branch_zoom.png` 睇陸／海／空膚色有冇被換色整污糟），
  唔可以只信程式檢查——換色／疊位程式曾經染到膚色同手腳。

## 重製方法

```bash
# 手繪 45 張（底稿喺 assets_src/diasvg/）
node /home/user/svgrender/render-dia.js    # 底稿 → /tmp/diapng → img/dia/*.avif（約 25 秒）
node /home/user/svgrender/gen-dia-js.js    # 按渲染結果更新 js/dia.js（含 alt 文字表）
node /home/user/svgrender/qa-textink.js    # 檢查文字壓圖

# 制服 9 張（v36）
python /tmp/build/fig_uniform.py           # 底圖＋位置線 → /tmp/build/out/*.png
convert /tmp/build/out/chest.png -resize '1200x>' -strip -quality 46 -define avif:pixel-format=yuv420p img/dia/uniform-chest.avif
```

改咗底稿（`assets_src/diasvg/diagrams.src.js`／`svg-kit.src.js`）之後一定要重跑上面三步，否則 app 出嘅 AVIF 會同底稿唔一致。
加新圖解：① 底稿加 key（例如 `D.cer.xxx`）② 出 AVIF 落 `img/dia/` ③ `js/dia.js` 嘅 `IMG.map` 加 `'cer.xxx'` 一行（尺寸＋alt）④ `sw.js` ASSETS 加圖檔 ⑤ `npm test`。前端唔使改任何嘢——`DIAGRAMS.cer.xxx` 會自動有圖。
改咗 `js/uniform.js` 嘅 `placement`／`cap` 之後要重跑制服管線，否則圖上嘅位置會同條文脫節。

## 注意

- 手繪 45 張嘅比例係 **0.05 px = 1 mm**（`fS`）；尺寸線一律用 `fDIM()` 出，測試會逐條核對（讀 `assets_src/diasvg/*.src.js`）。
- 制服 9 張嘅比例係**逐張底圖量度**得出嘅 px/cm（唔可以假設），尺寸標籤同圖上距離用同一套換算。
- 【v21 禁令】AI **唔可以**畫制服實物／徽章位置：底圖只可以是**中性衣物**，位置一律由程式疊。
  AI 插畫（`img/fig/`）亦只畫中性練習衫（灰 T＋深灰短褲、冇帽冇領巾冇章）。
- 制服標準服式圖仍然一律用官方圖（見 `../uni/SOURCES.md`），呢批圖係「位置示意」唔係「服式對照」。
- 繩結照產品規則**不設圖**；營火袍布章唔出插畫。
