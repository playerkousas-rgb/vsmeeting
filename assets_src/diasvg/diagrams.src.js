/* Scout Hub v18：技能 SVG 逐步圖解庫（純手寫 vector，offline 用得） */
var DIAGRAMS = {};

/* ── 指南針八方位 ── */
DIAGRAMS.compass = '<svg viewBox="0 0 180 180" width="180" height="180" role="img" aria-label="指南針八方位圖">'
+ '<circle cx="90" cy="90" r="70" fill="#fff" stroke="#333" stroke-width="3"/>'
+ '<line x1="90" y1="20" x2="90" y2="34" stroke="#333" stroke-width="3"/>'
+ '<line x1="90" y1="146" x2="90" y2="160" stroke="#333" stroke-width="3"/>'
+ '<line x1="20" y1="90" x2="34" y2="90" stroke="#333" stroke-width="3"/>'
+ '<line x1="146" y1="90" x2="160" y2="90" stroke="#333" stroke-width="3"/>'
+ '<polygon points="90,30 100,90 90,82 80,90" fill="#C62828"/>'
+ '<polygon points="90,150 100,90 90,98 80,90" fill="#999"/>'
+ '<circle cx="90" cy="90" r="6" fill="#333"/>'
+ '<text x="90" y="16" text-anchor="middle" font-size="14" font-weight="bold" fill="#C62828">N 北</text>'
+ '<text x="90" y="176" text-anchor="middle" font-size="14" font-weight="bold">S 南</text>'
+ '<text x="6" y="95" font-size="14" font-weight="bold">W 西</text>'
+ '<text x="162" y="95" font-size="14" font-weight="bold">E 東</text>'
+ '<text x="140" y="48" font-size="11" fill="#666">NE</text>'
+ '<text x="140" y="142" font-size="11" fill="#666">SE</text>'
+ '<text x="22" y="142" font-size="11" fill="#666">SW</text>'
+ '<text x="22" y="48" font-size="11" fill="#666">NW</text>'
+ '</svg>';

/* ── 背囊分層 ── */
DIAGRAMS.pack = '<svg viewBox="0 0 170 200" width="170" height="200" role="img" aria-label="背囊分層圖">'
+ '<rect x="35" y="8" width="100" height="32" rx="6" fill="#C8E6C9" stroke="#2E7D32" stroke-width="2"/>'
+ '<text x="85" y="28" text-anchor="middle" font-size="12">頂：雨衣/小食</text>'
+ '<rect x="35" y="42" width="100" height="42" rx="6" fill="#FFE0B2" stroke="#E65100" stroke-width="2"/>'
+ '<text x="85" y="59" text-anchor="middle" font-size="12">重嘢貼背</text>'
+ '<text x="85" y="74" text-anchor="middle" font-size="12">水/爐</text>'
+ '<rect x="35" y="86" width="100" height="42" rx="6" fill="#BBDEFB" stroke="#1565C0" stroke-width="2"/>'
+ '<text x="85" y="103" text-anchor="middle" font-size="12">衫/個人物品</text>'
+ '<text x="85" y="118" text-anchor="middle" font-size="12">常用放外</text>'
+ '<rect x="35" y="130" width="100" height="42" rx="6" fill="#E1BEE7" stroke="#6A1B9A" stroke-width="2"/>'
+ '<text x="85" y="147" text-anchor="middle" font-size="12">底：睡袋</text>'
+ '<text x="85" y="162" text-anchor="middle" font-size="12">輕而大件</text>'
+ '<text x="85" y="190" text-anchor="middle" font-size="11" fill="#666">外掛：營柱/地墊</text>'
+ '</svg>';

/* ── 追蹤符號（6 個） ── */
DIAGRAMS.track = {
arrow: '<svg viewBox="0 0 90 60" width="90" height="60"><line x1="10" y1="30" x2="68" y2="30" stroke="#37474F" stroke-width="6" stroke-linecap="round"/><polyline points="52,14 72,30 52,46" fill="none" stroke="#37474F" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
circle: '<svg viewBox="0 0 90 60" width="90" height="60"><circle cx="45" cy="30" r="18" fill="none" stroke="#37474F" stroke-width="6"/></svg>',
cross: '<svg viewBox="0 0 90 60" width="90" height="60"><line x1="27" y1="12" x2="63" y2="48" stroke="#37474F" stroke-width="6" stroke-linecap="round"/><line x1="63" y1="12" x2="27" y2="48" stroke="#37474F" stroke-width="6" stroke-linecap="round"/></svg>',
turn: '<svg viewBox="0 0 90 60" width="90" height="60"><path d="M15,50 H55 V24" fill="none" stroke="#37474F" stroke-width="6" stroke-linecap="round"/><polyline points="43,34 55,20 67,34" fill="none" stroke="#37474F" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
water: '<svg viewBox="0 0 90 60" width="90" height="60"><path d="M8,32 Q20,16 32,32 T56,32 T80,32" fill="none" stroke="#1565C0" stroke-width="5" stroke-linecap="round"/></svg>',
msg: '<svg viewBox="0 0 90 60" width="90" height="60"><polygon points="45,8 76,52 14,52" fill="none" stroke="#37474F" stroke-width="6" stroke-linejoin="round"/><circle cx="45" cy="40" r="4" fill="#37474F"/></svg>'
};

/* ⚠️ v19：已按用戶要求移除「繩結逐步圖解」（reef/fig8/bowline）——圖畫錯會教錯人。
 * 繩結教學只依 c13/c14 教案嘅文字口訣＋領袖現場示範。DIAGRAMS 嘅新增圖解喺 js/svg-kit.js。 */


if (typeof module !== "undefined" && module.exports) module.exports = DIAGRAMS;
