# `img/badge/` 興趣章官方章樣來源（33 張 AVIF）

## 來源

- **網站**：童軍資訊站《童軍訓練綱要》<https://scoutsinfohub.org.hk/scout-training-scheme>（香港童軍總會支部訓練綱要電子版）
- **圖檔路徑**：`…/ScoutTrainingScheme/img/Interest/<slug>.webp`（興趣章）
  同頁另有 `img/Pursuit/…`、`img/Instructor/…`、`img/Sea/…` 同 `img/Progressive/…`（漸進獎章）。
- **擷取日期**：2026-09-16
- **改動**：`-background white -flatten -strip -resize 256x256 -quality 62` 轉成 AVIF（33 張共約 110KB）；無加任何字或圖。

## 每張對應嘅官方圖

| app key（`js/interests.js`） | 官方 slug | 備註 |
| --- | --- | --- |
| angler | angler | |
| archery | archery | **綠底菱形**（興趣章）；同名仲有藍底版本，屬 Pursuit／Instructor 章，唔要 |
| artist | artist | |
| athlete | athlete | |
| birdwatcher | birdwatcher | 2026 新增 |
| boulderer | boulderer | 2026 新增 |
| campcook | campcook | |
| campfirehost | campfirehost | 2026 新增 |
| canoeist | canoeist | |
| collector | collector | |
| computer | computer | |
| cyclist | cyclist | |
| dragonboatman | dragonboatman | |
| footdrill | footdrill | |
| geologist | geologist | |
| horseman | horseman | |
| kiteflyer | kiteflyer | |
| librarian | librarian | |
| meteorologist | meteorologist | |
| modelmaker | modelmaker | |
| musician | musician | |
| naturalist | naturalist | 2026 式樣重新設計 |
| parkorienteer | parkorienteer | |
| petkeeper | petkeeper | 2026 新增 |
| photographer | photographer | |
| rowingboatman | rowingboatman | |
| sailor | sailor | |
| smallholder | smallholder | 2026 式樣重新設計 |
| sup | standuppaddleboarder | 直立板（2026 新增；官方 slug 冇縮寫） |
| suppolo | standuppaddlingpolo | 直立板球（2026 新增） |
| swimmer | swimmer | |
| tourism | tourism | |
| windsurfer | windsurfer | |

## 使用說明

- 章樣係**香港童軍總會嘅註冊徽章設計**；app 只用嚟識別同教學（成員對返實物布章），
  卡內並有標示「考核要求睇下面『官方考核要求』」同連返官方來源。
- 2026-08-15 生效嘅新版綱要改咗 8 個章（新增 6：賞鳥、抱石、營火主理、寵物護理、直立板、直立板球；
  重新設計 2：自然學家、小農夫）；`js/figs.js` 嘅 `BADGE_FIG` 圖說有標明。
- 官方之後如果改圖，重跑一次下載＋轉檔就得（路徑同上表）。
