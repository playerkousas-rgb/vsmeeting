# `img/badge/` 深資童軍徽章 — VENTURE版（8 張 AVIF，省位）

## 來源（官方訓練綱要）

- **網站**：深資童軍訓練綱要（網上版） https://sites.google.com/scouting.org.hk/venture/VentureScoutTrainingScheme/%E7%8D%8E%E7%AB%A0%E8%80%83%E6%A0%B8%E8%A6%81%E6%B1%82
- **官方圖樣**（訓練綱要第十版）：
  - 會員章：紫底白箭頭白繩平結（深資第一步）
  - 肩章：棕底白V月桂環童軍徽（認識+技能）
  - 深資童軍獎章：棕底V+月桂
  - 榮譽童軍獎章：綠底金火炬紅火焰月桂環童軍徽（青少年最高榮譽）
  - 四段章：自立S/責任R/活動A/探險E（S/R/A/E字母 + 技能圖示）

## 本地檔（已轉 AVIF，省位 98%+）

| 本地 AVIF | 來源 | 大小 | 備註 |
| --- | --- | --- | --- |
| `venture-member.avif` | 會員章 | 12K | 紫底白箭，PNG 2.9M → 12K |
| `venture-shoulder.avif` | 肩章 | 8.2K | 棕底白V，PNG 1.2M → 8.2K |
| `venture-award.avif` | 深資童軍獎章 | 16K | 棕底V月桂 |
| `dragon-award.avif` | 榮譽童軍獎章 | 16K | 綠底金火炬 |
| `venture-self.avif` | 自立段章 | 4.5K | S 人際+生活 |
| `venture-responsibility.avif` | 責任段章 | 12K | R 消防急救拯溺 |
| `venture-activity.avif` | 活動段章 | 12K | A 露營先鋒興趣體育 |
| `venture-adventure.avif` | 探險段章 | 11K | E 地圖遠足選修 |

- **處理**：用戶提供 PNG 原圖（1.2-2.9M）→ `convert -resize 512x512 -quality 50` → AVIF 4.5-16K，省 98-99%，符合「圖用AVIF省位」
- **舊童軍興趣章**：33 張綠底菱形（angler等）已移除，本 App 只保留深資版，符合深資適配（15-20歲執委會自務自治，唔係童軍興趣章）

## 考核規則（官方）

- 會員章：VSL與執委會商議頒發
- 肩章：VSL簽發
- 段章：VSL安排主考+簽發，區總監協助
- 金帶：團長/區總監協助，區/地域/青少年活動總監或代表主考（通常ADC(VS)）

## 使用說明

- 章樣係香港童軍總會註冊設計，App 只作識別教學，進度追蹤用 vsbadge.vercel.app
- 圖說已標「由VSL考核」/「由ADC(VS)主考」，符合用戶要求「段章由VSL考，金帶由ADC(VS)考」
