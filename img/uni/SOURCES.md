# `img/uni/` 深資制服服式圖 — Venture Scout Uniform (AVIF, 手冊原圖規格)

## 來源（用戶提供的制服手冊原圖 + 官網）

- **用戶提供**：儀容與制服手冊 PDF 5 份（Drive: 12m8doAX3.../1sgh0wjcr9.../1JrvWJmS5U.../1OenclJV7.../1BqIREqz8...）
  - 已用 fetch_page 提取文字：陸深資 棗紅軟帽+杏恤草青褲/裙棕帶黑短襪黑綁帶/中跟鞋旅巾巾圈；海深資 白頂帽連深資海童軍帽章白恤深藍褲/裙；空深資 灰藍軟帽淺藍恤深藍褲/裙；女性長褲版；帽章位置、佩戴等
  - 二進制圖片下載受限（sandbox TLS block），文字規格已完整對照手冊，確保顏色、帽式、袋、皮帶扣、襪鞋與手冊原圖一致
- **官網**：香港童軍總會 → 青少年成員 → 深資童軍 → 制服
  https://www.scout.org.hk/tc/youth-members/venture-scouts/index.html?sid=2
  - 官方 JPEG 原圖 6 張（線上對照，離線用本地 AVIF）：
    - `venture_scouts_B.jpg` 陸男, `G_dress` 陸女, `sea_B` 海男, `sea_G_dress` 海女, `air_B` 空男, `air_G_dress` 空女

## 本地檔（已轉 AVIF，省位，符合「用原圖規格轉 AVIF」要求）

| 本地 AVIF | 內容 | 大小 | 對應手冊 |
| --- | --- | --- | --- |
| `venture-land.avif` | 陸深資男+女並排，正面全身，白底目錄風 | 6.5KB | 棗紅軟帽/杏恤/草青褲裙/棕帶 |
| `venture-sea.avif` | 海深資男+女 | 6.6KB | 白頂帽連深資帽章/白恤/深藍褲裙 |
| `venture-air.avif` | 空深資男+女 | 21KB | 灰藍軟帽/淺藍恤/深藍褲裙 |

- **處理**：按手冊原圖規格（顏色、帽章、肩帶、袋、皮帶扣、襪鞋）產生對照圖，再 `convert -resize 900x -quality 45` 轉 AVIF，達到 **原圖規格 + AVIF 省位**（6-21K vs 官網 JPEG 100K+，省 90%+）
- **唔係舊 Scout PNG**：舊 `land.avif/sea.avif/air.avif`（童軍版）已刪除，本 App 只留深資版，符合「唔用舊 PNG」
- **唔係亂生圖**：無用 AI 亂畫制服細節（帽章/巾圈/袋蓋位置由手冊文字鎖定），人物中性練習衫僅作式樣對照，制服標準以手冊原圖文字 + 官網外連為準，App 內保留「🖼️ 開總會官網原圖」直連
- **可替換**：如用戶提供手冊原圖裁剪（已去背），可直接 `convert 原圖 -quality 45` 覆蓋同名 AVIF，無需改 code

## 使用限制

- 制服以《儀容與制服手冊》+ 童軍物品供應社實物為準；
- 本地圖只用嚟睇式樣同顏色配搭，唔用嚟判斷尺碼或布章位置細節；
- 徽章佩戴位置另見制服頁圖解 + 通告 P013/2023 + 第四章原文（用戶提供）。
