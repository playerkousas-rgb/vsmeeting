/* Scout Hub v19 — svg-kit.js：儀式／遊戲／技能／營火 示意圖解庫（純手寫 vector，離線用得）
 * 圖解只做「場地面視圖／位置示意／流程」，唔係動作範本；實際手勢步操以領袖現場示範為準。
 * ⚠️ 按用戶要求：唔再做繩結逐步卡／圖（會錯）；繩結只留文字口訣＋ c13/c14 教案連結。
 */
(function(){
/* 必須喺 js/diagrams.js 之後 load（DIAGRAMS 已存在）；如冇就自己開一個 */
if (typeof DIAGRAMS === 'undefined') { window.DIAGRAMS = {}; }
var D = (typeof DIAGRAMS !== 'undefined') ? DIAGRAMS : window.DIAGRAMS;

/* ── 小工具 ── */
function svg(w,h,label,body){
  return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" role="img" aria-label="'+label+'" style="max-width:100%;height:auto;background:#fff">'+body+'</svg>';
}
function T(x,y,s,size,fill,anchor,bold,halo){
  /* halo＝文字背後一圈白邊：標籤坐喺線／圓點／圖形上面都睇得清（唔會遮住人形本身） */
  return '<text x="'+x+'" y="'+y+'" font-size="'+(size||11)+'" fill="'+(fill||'#333')+'" text-anchor="'+(anchor||'middle')+'"'
    + (bold?' font-weight="bold"':'')
    + (halo?' stroke="#fff" stroke-width="2.6" stroke-linejoin="round" paint-order="stroke"':'')
    + '>'+s+'</text>';
}
function dot(x,y,r,fill){ return '<circle cx="'+x+'" cy="'+y+'" r="'+(r||4.5)+'" fill="'+(fill||'#37474F')+'"/>'; }
function sq(x,y,s,fill){ return '<rect x="'+(x-s)+'" y="'+(y-s)+'" width="'+(s*2)+'" height="'+(s*2)+'" rx="2" fill="'+fill+'"/>'; }
function ln(x1,y1,x2,y2,st,col,dash){ return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(col||'#90A4AE')+'" stroke-width="'+(st||1.5)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>'; }
function arrow(x1,y1,x2,y2,col,sw){ return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(col||'#2E7D32')+'" stroke-width="'+(sw||2)+'" marker-end="url(#ah)"/>'; }
function mkr(){ return '<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 z" fill="'+arguments[0]+'" stroke="none"/></marker></defs>'; }
function box(x,y,w,h,fill,stroke,rx){ return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(rx||6)+'" fill="'+fill+'" stroke="'+(stroke||'#B0BEC5')+'" stroke-width="1.5"/>'; }
function row(x,y,n,gap,fill){ var s=''; for(var i=0;i<n;i++){ s+=dot(x+i*gap,y,4.5,fill||'#37474F'); } return s; }
function pole(x,baseY,hh,col,label){
  return ln(x,baseY,x,baseY-hh,3,'#5D4037')
    +'<path d="M'+(x)+','+(baseY-hh)+' l20,5 l-20,5 z" fill="'+col+'"/>'
    +T(x,baseY+12,label,10,'#5D4037','middle',0,1);
}
var MK='<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 z" fill="#2E7D32" stroke="none"/></marker></defs>';

/* ══════════ 🎪 儀式圖（DIAGRAMS.cer） ══════════ */
D.cer = {};

/* 團集會開始：集隊隊列（俯視圖） */
D.cer.open = svg(340,190,'團集會開始隊列俯視圖',
  MK
  +T(170,16,'團集會開始・集隊（俯視圖）',12,'#1B5E20','middle',1)
  +dot(150,44,6,'#F9A825')+T(150,62,'負責領袖（面向全團）',10,'#8D6E63')
  +pole(262,52,30,'#C62828','持團旗者（右側）')
  +T(84,92,'第一小隊',10,'#666')+row(60,104,5,24)
  +T(84,128,'第二小隊',10,'#666')+row(60,140,5,24)
  +T(256,92,'第三小隊',10,'#666')+row(232,104,5,24)
  +T(256,128,'第四小隊',10,'#666')+row(232,140,5,24)
  +sq(38,88,5,'#2E7D32')+T(38,80,'小隊長',9.5,'#2E7D32')
  +sq(210,88,5,'#2E7D32')
  +T(170,178,'小隊長站小隊右前方・各隊排橫隊・全體面向領袖及團旗',10.5,'#8D6E63')
);

/* 團集會結束：五步流程 */
D.cer.close = svg(340,150,'團集會結束流程示意',
  MK
  +T(170,14,'團集會結束・五步',12,'#1B5E20','middle',1)
  +box(10,30,56,42,'#E8F5E9','#81C784')+T(38,48,'1 收拾',10)+T(38,62,'完集合',10)
  +arrow(70,51,82,51)
  +box(86,30,56,42,'#E8F5E9','#81C784')+T(114,48,'2 宣佈',10)+T(114,62,'下次集會',9.5)
  +arrow(146,51,158,51)
  +box(162,30,56,42,'#E8F5E9','#81C784')+T(190,48,'3 回顧',10)+T(190,62,'表揚感謝',9.5)
  +arrow(222,51,234,51)
  +box(238,30,56,42,'#E8F5E9','#81C784')+T(266,48,'4 降旗',10)+T(266,62,'如適用',9.5)
  +arrow(298,51,310,51)
  +box(296,92,38,40,'#FFF3E0','#FFB300')+T(315,108,'5',10)+T(315,122,'解散',10)
  +dot(250,112)+dot(232,120)+dot(214,106)+dot(196,118)
  +arrow(270,112,294,112,'#FF8F00')
  +box(12,92,150,40,'#F5F5F5','#BDBDBD')
  +T(87,110,'⚠️ 未完成家長交接',10,'#C62828')
  +T(87,124,'之成員不得自行離開',10,'#C62828')
);


/* ── v28：步操動作逐步圖解（《步操手冊》第3–4章 分部動作）───────────────
   呢啲圖一定要手繪：AI 數唔到腳序，亦度唔到角度／毫米。
   畫法＝用角度／距離產生圖；圖解入面每一條受手冊規定嘅角度或距離都帶
   data-ang / data-mm，tests/smoke.mjs 會逐個核對，唔靠眼。 */
var fA = '#37474F', fAD = '#C62828', fAT = '#E65100', fA2 = '#607D8B';
function frd(v){ return Math.round(v*10)/10; }
function fpv(x, y, ang, len){ return [x + len*Math.sin(ang*Math.PI/180), y - len*Math.cos(ang*Math.PI/180)]; }
function fln(a, b, c, d, col, w, dash){
  return '<path d="M'+frd(a)+','+frd(b)+' L'+frd(c)+','+frd(d)+'" stroke="'+(col||fA)+'" stroke-width="'+(w||3)
    +'" stroke-linecap="round" fill="none"'+(dash?' stroke-dasharray="3,2.5"':'')+'/>';
}
function fdot(x, y, r, col){ return '<circle cx="'+frd(x)+'" cy="'+frd(y)+'" r="'+(r||2.4)+'" fill="'+(col||fA)+'"/>'; }
/* 側面人形（髖喺 0,0；腳垂直向下＝0 度，向前為正） */
var fS = 0.05;
function fSFG(o){
  var s = '', sh = fpv(0, 0, (o.lean||0)-180, 26);
  s += fln(0, 0, sh[0], sh[1], fA, 7);
  var hd = fpv(sh[0], sh[1], (o.head===undefined ? (o.lean||0) : o.head)-180, 8.6);
  s += fdot(hd[0], hd[1], 5.4);
  var arms = o.arms || [[0,0],[0,0]];
  for (var i=0;i<arms.length;i++){
    var a = arms[i], col = i===1 ? fA : fA2;
    var e = fpv(sh[0], sh[1], a[0], 12), h = fpv(e[0], e[1], a[1], 11);
    s += fln(sh[0], sh[1], e[0], e[1], col, 2.7) + fln(e[0], e[1], h[0], h[1], col, 2.7);
    s += a[2] ? fdot(h[0], h[1], 2.3, col) : fln(h[0]-2.3, h[1], h[0]+2.3, h[1]-1.9, col, 1.8);
  }
  var legs = o.legs || [[0,0,'flat'],[0,0,'flat']];
  for (var k=0;k<legs.length;k++){
    var g = legs[k], lc = k===1 ? fA : fA2;
    var kn = fpv(0, 0, g[0], 13), an = fpv(kn[0], kn[1], g[1], 14);
    s += fln(0, 0, kn[0], kn[1], lc, 3.1) + fln(kn[0], kn[1], an[0], an[1], lc, 3.1);
    var fa = g[2]==='heel' ? -20 : g[2]==='toe' ? 25 : 90;
    var toe = fpv(an[0], an[1], fa, 7);
    s += fln(an[0], an[1], toe[0], toe[1], lc, 2.5);
  }
  return s + fln(-44, 27.5, 44, 27.5, '#B9B3A6', 1.3);
}
/* 俯視腳位：sp=每隻腳尖向外角度（相對中線），gap=兩腳踭距離 px，mm=標明距離 */
function fTOP(o){
  var sp = o.sp===undefined ? 30 : o.sp, g = o.gap||5, s = '';
  if (o.mm) g = o.mm*fS/2;
  if (o.shiftTo) s += fln(g, 0, o.shiftTo, 0, fAT, 1.4, 1) + fdot(o.shiftTo, 0, 2, fAT);
  /* 中線＝正前方（兩腳之間），畫到腳跟後面少少 */
  s += fln(0, 3, 0, -26, '#90A4AE', 1, 1);
  /* 兩隻腳：腳跟喺 ±g，腳尖離中線 sp 度（俯視；每隻腳跟一條方向虛線幫眼睇角度） */
  for (var i=0;i<2;i++){
    var dir = i===0 ? -1 : 1;
    s += fFOOT(dir*g, dir*sp);
  }
  /* 角度弧擺喺腳尖之外（半徑 30），唔會壓住隻腳 */
  /* 兩個弧都由中線頂端向外掃，箭嘴指去「向外嗰邊」；標籤擺喺弧上面，唔會撞箭嘴 */
  if (o.arc) s += fARC(0,0,30,0,sp) + fARC(0,0,30,0,-sp) + T(0,-38,'各 '+sp+'°',6.6,fAT,'middle',1);
  /* 兩腳踭距離：尺寸線畫喺腳下面少少，數值再落一行——放喺兩腳之間會壓住隻腳 */
  if (o.mm) s += fDIM(-g, 10, g, 10, '', o.mm) + T(0, 21, o.dim, 6.6, fAD, 'middle', 1);
  return s;
}
/* 白底數字標記（位置圖用）：號碼要有白底，先至唔會同斜帶／袖邊撞色睇唔清 */
function pnum(x, y, t, c, fs){
  fs = fs || 10;
  return '<circle cx="'+x+'" cy="'+frd(y - fs*0.33)+'" r="'+frd(fs*0.66)+'" fill="#fff" opacity="0.92"/>'
    + T(x, y, t, fs, c, 'middle');
}
/* 俯視一隻腳：腳跟喺 (hx,0)，腳尖向上再向外轉 deg 度（腳尖圓、腳跟窄，似返隻腳）
   注意：唔用 <g rotate()> 巢式變換——直接算旋轉後嘅座標，測試嘅簡單 stack 解析器先至追得到。 */
function fFOOT(hx, deg){
  var r = deg*Math.PI/180;
  function W(x, y){ return [frd(hx + x*Math.cos(r) + y*Math.sin(r)), frd(-x*Math.sin(r) + y*Math.cos(r))]; }
  function L(pts){ return pts.map(function(p){ return p[0]+','+p[1]; }).join(' '); }
  var heel = W(0, 0.6), toe = W(0, -26), a1 = W(-2.4, -2.4), a2 = W(-3.4, -16.4),
      c1 = W(-3.4, -20.5), c2 = W(0, -20.5), c3 = W(3.4, -20.5), b1 = W(3.4, -16.4), b2 = W(2.4, -2.4);
  return '<line x1="'+W(0,1.6)[0]+'" y1="'+W(0,1.6)[1]+'" x2="'+toe[0]+'" y2="'+toe[1]+'" stroke="#90A4AE" stroke-width="0.9" stroke-dasharray="3,2" data-ang="'+frd(Math.abs(deg))+'"/>'
    + '<path d="M'+L([a1])+' Q'+L([a2])+' '+L([c1])+' Q'+L([c2])+' '+L([c3])+' Q'+L([b1])+' '+L([b2])+' Q'+L([heel])+' '+L([a1])+' z"'
    + ' fill="'+fA+'" data-ang="'+frd(Math.abs(deg))+'"/>';
}
/* 白底數字標記（位置圖用）：號碼要有白底，先至唔會同斜帶／袖邊撞色睇唔清 */
function pnum(x, y, t, c, fs){
  fs = fs || 10;
  return '<circle cx="'+x+'" cy="'+frd(y - fs*0.33)+'" r="'+frd(fs*0.66)+'" fill="#fff" opacity="0.92"/>'
    + T(x, y, t, fs, c, 'middle');
}
/* 俯視一隻腳：腳跟喺 (hx,0)，腳尖向上再向外轉 deg 度（腳尖圓、腳跟窄，似返隻腳）
   注意：唔用 <g rotate()> 巢式變換——直接算旋轉後嘅座標，測試嘅簡單 stack 解析器先至追得到。 */
function fFOOT(hx, deg){
  function P(x, y){ var p = fpv(hx, 0, deg, -y), q = [hx + (x)*Math.cos(deg*Math.PI/180) + (-y)*Math.sin(deg*Math.PI/180), 0]; return [frd(p[0]), frd(p[1])]; }
  /* 用平面旋轉：局部 (x,y) → 世界（先繞原點轉 deg，再平移到腳跟） */
  function W(x, y){
    var r = deg*Math.PI/180;
    return [frd(hx + x*Math.cos(r) + y*Math.sin(r)), frd(-x*Math.sin(r) + y*Math.cos(r))];
  }
  var heel = W(0, 0), toe = W(0, -26), a1 = W(-2.4, -2.4), a2 = W(-3.4, -16.4), b1 = W(3.4, -16.4), b2 = W(2.4, -2.4), c1 = W(-3.4, -19), c2 = W(3.4, -19);
  return '<line x1="'+heel[0]+'" y1="'+heel[1]+'" x2="'+toe[0]+'" y2="'+toe[1]+'" stroke="#90A4AE" stroke-width="0.9" stroke-dasharray="3,2" data-ang="'+frd(Math.abs(deg))+'"/>'
    + '<path d="M'+a1[0]+','+a1[1]+' Q'+a2[0]+','+a2[1]+' '+c1[0]+','+c1[1]+' Q0,'+frd(-19*Math.cos(deg*Math.PI/180)-hx*0)+' '+c2[0]+','+c2[1]+' Q'+b1[0]+','+b1[1]+' '+b2[0]+','+b2[1]+' L'+heel[0]+','+heel[1]+' z"'
    + ' fill="'+fA+'" data-ang="'+frd(Math.abs(deg))+'"/>';
}
/* 正面人形（敬禮用；rArm=右手動作模式） */
function fFGG(o){
  var s = fdot(0, -30, 5.6) + '<rect x="-7" y="-24" width="14" height="19" rx="5" fill="'+fA+'"/>'
    + fln(-3.5, -5, -5, 16) + fln(-5, 16, -12, 16) + fln(3.5, -5, 5, 16) + fln(5, 16, 12, 16)
    + fln(-40, 17.5, 40, 17.5, '#B9B3A6', 1.3);
  s += fln(-7, -22, -14, -12, fA2, 2.7) + fln(-14, -12, -16, -1, fA2, 2.7) + fdot(-16, -1, 2.2, fA2);
  if (o.rArm === 'down') s += fln(7, -22, 14, -12) + fln(14, -12, 15, -1) + fdot(15, -1, 2.2);
  else if (o.rArm === 'side') s += fln(7, -22, 24, -22) + fdot(25.5, -22, 2.4) + fln(3, -22.6, 24, -22.6, fAD, 1);
  else if (o.rArm === 'at') s += fln(7, -22, 20, -26) + fln(20, -26, 5, -32)
    + '<path d="M5,-32 L-1,-34.5 L-1,-30 z" fill="'+fA+'"/>'
    + fln(2.5,-30,2.5,-35.5,fAD,1) + fln(0.8,-30,4.2,-30,fAD,1) + fln(0.8,-35.5,4.2,-35.5,fAD,1)
    + T(12,-30.5,'25mm',6.6,fAD,'start',1,1);
  return s;
}
/* 毫米尺寸線（帶 data-mm 俾 test 核對） */
function fDIM(x1, y1, x2, y2, label, mm){
  var s = fln(x1, y1, x2, y2, fAD, 1.1), dx = x2-x1, dy = y2-y1;
  var nx = (dy===0?0:(dx===0?3:-dy/Math.sqrt(dx*dx+dy*dy)*3)), ny = (dx===0?0:(dy===0?3:dx/Math.sqrt(dx*dx+dy*dy)*3));
  s += fln(x1-nx, y1-ny, x1+nx, y1+ny, fAD, 1.1) + fln(x2-nx, y2-ny, x2+nx, y2+ny, fAD, 1.1);
  s += '<rect x="'+frd(Math.min(x1,x2))+'" y="'+frd(Math.min(y1,y2)-3)+'" width="'+frd(Math.abs(dx)||2)+'" height="'+frd(Math.abs(dy)||2)+'" fill="none" stroke="none" data-mm="'+mm+'"/>';
  s += '<desc data-mm="'+mm+'" data-len="'+frd(Math.sqrt(dx*dx+dy*dy))+'"></desc>';
  return s + T((x1+x2)/2 + (dy===0?0:11), (y1+y2)/2 + (dx===0?0:-4), label, 6.8, fAD, 'middle', 1);
}
/* 俯視轉向弧（由 a0 轉到 a1，ang＝手冊規定角度） */
function fARC(cx, cy, rad, a0, a1){
  var p0 = [cx+rad*Math.sin(a0*Math.PI/180), cy-rad*Math.cos(a0*Math.PI/180)];
  var p1 = [cx+rad*Math.sin(a1*Math.PI/180), cy-rad*Math.cos(a1*Math.PI/180)];
  var sw = a1>a0 ? 1 : 0;
  var s = '<path d="M'+frd(p0[0])+','+frd(p0[1])+' A'+rad+','+rad+' 0 0 '+sw+' '+frd(p1[0])+','+frd(p1[1])
    +'" stroke="'+fAT+'" stroke-width="1.8" fill="none" stroke-dasharray="4,2.4" data-ang="'+frd(Math.abs(a1-a0))+'"/>';
  var t = (a1 + (sw?90:-90))*Math.PI/180, ux = Math.sin(t), uy = -Math.cos(t);
  return s + '<path d="M'+frd(p1[0]+ux*6.5)+','+frd(p1[1]+uy*6.5)+' L'+frd(p1[0]-uy*3.4)+','+frd(p1[1]+ux*3.4)
    + ' L'+frd(p1[0]+uy*3.4)+','+frd(p1[1]-ux*3.4)+' z" fill="'+fAT+'"/>';
}
/* 一格：標題＋圖＋三行註（棕／藍打數／紅警告） */
function fCL(n, title, art, l1, l2, l3, cols, cw, ch){
  cols = cols || 2; cw = cw || 160; ch = ch || 126;
  var col = (n-1)%cols, row = Math.floor((n-1)/cols);
  var x = 8+col*(cw+4), y = 20+row*(ch+4);
  return '<g transform="translate('+x+','+y+')">'
    + '<rect x="0" y="0" width="'+cw+'" height="'+ch+'" rx="8" fill="#EAF1E6" stroke="#C7D8C2"/>'
    + T(5, 12, title, 7.8, '#1B5E20', 'start', 1)
    + '<g transform="translate('+frd(cw/2)+',60) scale(0.86)">'+art+'</g>'
    + T(4, ch-25, l1, 6.6, '#6D4C41', 'start')
    + T(4, ch-17, l2, 6.6, '#0D47A1', 'start', 1)
    + T(4, ch-9, l3, 6.6, '#C62828', 'start')
    + '</g>';
}
/* 自動排版：panels=[[標題,圖,l1,l2,l3]]，cols=欄數 */
function fDGR(title, panels, cols, foot){
  cols = cols || 2;
  var cw = Math.floor((340-16-(cols-1)*4)/cols), ch = 126;
  var rows = Math.ceil(panels.length/cols), H = 20+rows*(ch+4)+14;
  var cells = panels.map(function(p, i){ return fCL(i+1, p[0], p[1], p[2], p[3], p[4], cols, cw, ch); }).join('');
  return svg(340, H, title,
    T(170, 12, title, 9.4, '#1B5E20', 'middle', 1) + cells
    + T(170, H-4, foot || '《步操手冊》第3–4章・分部動作（by numbers）逐格做熟，先至連貫做完全動作', 6.8, '#8D6E63', 'middle'));
}

/* ── v28 圖解 10 張（《步操手冊》第3–4章 分部動作）──────────────────── */

/* 立正（第3章§2）— 會員章 m5 級；進階練習不進入集會套包 */
/* 1. 立正〔第3章§2〕 */
D.cer.attn = fDGR('立正 Position of Attention（第3章§2）', [
  ['① 腳：腳尖向外與中線成 30 度', fTOP({sp:30, gap:4, arc:1}),
    '兩腳掌平放地面・雙膝蹬直',
    '口令 Alert!（集會用）；Shun 類只用於典禮',
    '⚠️ 唔係 45 度 —— 手冊寫 30 度'],
  ['② 手・頸・眼', fFGG({rArm:'down'})
    + '<rect x="-11" y="-2" width="9" height="6" rx="2.6" fill="'+fA+'" data-note="fist"/>'
    + '<rect x="2" y="-2" width="9" height="6" rx="2.6" fill="'+fA+'"/>',
    '雙手握拳、手踭蹬直、母指指甲向前放喺食指上',
    '母指同時放於褲骨之後',
    '身體挺直・後顎貼衣領・眼望無限遠']
], 2, '第3章§2・會員章 m5「中式隊列基本動作」；抽膝踏步／彈前腳等練習屬訓練班內容，請照《步操手冊》');

/* 2. 稍息・休息・回立正〔第3章§2〕 */
function fBKN(loose){
  var s = '<rect x="-9" y="-22" width="18" height="26" rx="6" fill="'+fA2+'"/>'
    + '<circle cx="0" cy="-28" r="5.4" fill="'+fA+'"/>'
    + fln(-9,-18,-16,loose?4:-4, fA, 2.8) + fln(9,-18,16,loose?4:-4, fA, 2.8)
    + fln(-16,loose?4:-4,-2,loose?8:2, fA, 2.8) + fln(16,loose?4:-4,2,loose?8:2, fA, 2.8)
    + '<rect x="-6" y="0" width="12" height="5.5" rx="2.4" fill="'+fA+'"/>';
  return s + fln(-40,27.5,40,27.5,'#B9B3A6',1.3);
}
/* ── v30：補晒基本級 D 圖（集隊／睇齊／三指手形／團呼隊形）────────────
   同樣用「角度／距離產生圖」＋ data-ang・data-mm，等 test 核對得住。
   範圍照 v29：得返會員章＋日常集會用得到嘅嘢。 */

/* 頂視圖：n 行 × f 列小圓點；skip＝留空嘅格，hi＝改色 */
function fFILES(n, f, opts){
  opts = opts || {};
  var s = '', x0 = -((f-1)*15)/2, y0 = -((n-1)*18.75)/2;  /* 行距 15・排位距 18.75px ＝ 375mm ×0.05 */
  for (var r=0;r<n;r++) for (var c=0;c<f;c++){
    var x = x0+c*15, y = y0+r*18.75, sk = opts.skip && opts.skip[c] && opts.skip[c].indexOf(r)>=0;
    s += sk ? '<rect x="'+frd(x-3.6)+'" y="'+frd(y-3.6)+'" width="7.2" height="7.2" rx="2" fill="none" stroke="#BDBDBD" stroke-width="1" stroke-dasharray="2,1.6"/>'
            : fdot(x, y, 3.4, (opts.hi && opts.hi[r+'-'+c]) || fA);
  }
  return s;
}

/* 1. 集隊站位・三排・標號員〔第6章§1–2／第8章〕 */
D.cer.formup = fDGR('集隊：三排・標號員・司令員距離', [
  ['① 排好之後（頂視圖）', (function(){
      var s = fFILES(3,6);
      s += fln(0,-30,0,-19,'#90A4AE',1,1) + fdot(0,-34,4,'#2E7D32') + T(9,-31,'司令員',6.6,'#2E7D32','start',1);
      /* 司令員→最前排 2250mm：左邊拉尺寸線，標籤擺喺隊形下面，唔會壓住啲圓點 */
      s += fln(-58,-34,-58,-18.75,fAT,1.2,1) + fln(-61,-34,-55,-34,fAT,1.2) + fln(-61,-18.75,-55,-18.75,fAT,1.2);
      return s + T(-44,-4,'F1',6.6,fA,'end',1) + T(44,-4,'左標號員',6.4,fAT,'start',1)
        + T(0,33,'司令員同最前排相距 2250mm（90 吋）',6.6,fAT,'middle',1);
    })(),
    '最早到嘅企咗 F1（右標號員），其後向左伸延',
    '司令員與最前排相距 2250 毫米（90 英吋）',
    '排好照樣立正；司令員放下雙手才一次過轉稍息'],
  ['② 小隊長／副隊長位置', (function(){
      var s = fFILES(1,6,{hi:{'0-0':'#2E7D32','0-5':'#1565C0'}});
      s += T(-42,-13,'小隊長（最右）',6.6,'#2E7D32','end',1) + T(42,-13,'副隊長（最左）',6.6,'#1565C0','start',1);
      return s + T(0,14,'直行時：小隊長最前、副隊長最後',6.8,'#6D4C41','middle');
    })(),
    '幼童軍團／童軍團以小隊為基本單位',
    '小隊長喺所有隊員最右方，副隊長喺最左',
    '深資團／樂行團無小隊制，按團内習慣排'],
  ['③ 報數・排高矮', (function(){
      var s = fFILES(1,6);
      for (var i=0;i<6;i++) s += T(-37.5+i*15,-11,String(i+1),7,i===5?fAT:fA,'middle',1);
      return s + fln(-44,4,44,4,fAT,1.4,1) + T(0,13,'由右至左 →',6.8,fAT,'middle',1);
    })(),
    '由右至左報數，最後一位喊 Sir!／Madam!',
    '報數時頭同眼唔准郁；英式口令由右邊喊',
    '中排同後排跟前排號數，唔使再報一次'],
  ['④ 人唔啱數：留空行', (function(){
      var s = fFILES(3,5,{skip:{3:[1,2]}});
      return s + T(15,31,'留空嘅中排／後排',6.6,fAD,'middle',1,1) + fln(15,22,15,12,fAD,1,1);
    })(),
    '「BLANK — FILE!」— 留空行嘅做法',
    '打數 One—Two—Up—One—Two',
    '⚠️ 調位用碎步／橫移，唔准跑位、唔准推人']
], 2, '第6章§1–2／§4・第8章概言・日常集會用口頭口令已經夠；七款集隊手號屬會操／訓練班內容');

/* 2. 睇齊〔第6章§4／中式「向右看——齊」〕 */
D.cer.dress = fDGR('睇齊：Up—Two—Three—Move', [
  ['① 前排：手向橫・頭轉右', fFGG({rArm:'side'})
    + '<g transform="translate(34,-34) scale(0.62)">'+fARC(0,0,13,0,90)+'</g>'
    + '<rect x="24" y="-46" width="22" height="16" rx="4" fill="none" stroke="#90A4AE" stroke-width="0.9"/>',
    '除右標號員外：右手握拳向橫提升至與肩平',
    '同時頭轉右 90 度，右眼睺齊右邊隊員嘅左邊眼',
    '打數 Up — Two — Three — Move'],
  ['② 中排／後排：手向前', (function(){
      var s = fFGG({rArm:'down'}) + fln(7,-22,20,-30) + fln(20,-30,22,-38) + fdot(22,-38,2.3);
      return s + T(0,26,'只有最右行嘅中排及後排咁做',6.8,'#6D4C41','middle');
    })(),
    '最右行嘅中排及後排：右手向「前」提升',
    '用嚟睺齊前面嗰位嘅後頸／肩線',
    '兩排版：前排右手叉腰（手背向天、放喺皮帶對上）'],
  ['③ 移到得一手位', (function(){
      var s = '<g transform="translate(-26,0)">'+fFGG({rArm:'side'})+'</g><g transform="translate(26,0)">'+fFGG({rArm:'side'})+'</g>';
      /* 一手位＝375mm：量左邊隊員嘅拳頭到右邊隊員嘅膊頭（按 0.05px/mm 畫，test 核對得返） */
      return s + fDIM(-0.5,-34,18.25,-34,'375mm（一手位）',375) + T(0,26,'拳頭 → 右邊隊員膊頭',6.6,fAD,'middle');
    })(),
    '用碎步移動，移到與右邊隊員得「一隻手位」',
    '兩排版：行與行相隔 375mm、排與排 1500mm',
    '⚠️ 唔准跑位、唔准用手推隔離隊員'],
  ['④ 收工「EYES — FRONT!」', fFGG({rArm:'down'}) + '<g transform="translate(34,-34) scale(0.62)">'+fARC(0,0,13,90,0)+'</g>',
    '打數 Down：右手放回右邊褲骨、頭轉回向前',
    '熟咗之後唔使起手，淨係轉頭就得',
    '中式集會「向右——看」／「向前——看」同一個道理']
], 2, '第6章§4・睇齊只係調整齊，唔屬進階步操；排長要移動就照手冊用橫移');

/* 3. 三指手形（宣誓・敬禮共用）〔手冊第3章§7／綱要誓詞〕 */
D.cer.threefinger = fDGR('童軍三指手形（宣誓與敬禮都用呢個）', [
  ['① 手指點樣擺', (function(){
      var s = '<rect x="-13" y="-4" width="26" height="22" rx="6" fill="'+fA+'"/>';
      for (var i=0;i<3;i++) s += '<rect x="'+(-11+i*8)+'" y="-24" width="6.6" height="22" rx="3.2" fill="'+fA+'"/>';
      s += '<rect x="7.5" y="-8" width="7" height="9" rx="3.4" fill="'+fA2+'"/>';
      s += '<rect x="-2" y="-10" width="17" height="6.4" rx="3" fill="'+fA+'"/>';
      for (var k=0;k<3;k++) s += T(-7+k*8,-27,String.fromCodePoint(0x2460+k),7,fAT,'middle',1);
      return s;
    })(),
    '食指、中指、無名指並攏伸直；拇指壓住小指',
    '手心向前略向下',
    '①②③ 就係伸直嗰三隻手指（唔好舉五隻指）'],
  ['② 宣誓時點舉', (function(){
      var s = fFGG({rArm:'down'}) + fln(7,-22,16,-34) + fln(16,-34,14,-46) + '<rect x="10.5" y="-53" width="7" height="8" rx="2.6" fill="'+fA+'"/>';
      return s + fln(-7,-22,-14,-14) + fln(-14,-14,-2,-16) + fdot(-2,-16,2.2);
    })(),
    '右手舉起三指禮（約頭側高度），跟讀誓詞',
    '左手按旗桿或置於胸前 — 由所屬旅團按傳統決定',
    '⚠️ 團内慣例唔同，就要事先講明，唔好臨場改'],
  ['③ 敬禮（全禮）位置', fFGG({rArm:'at'}),
    '食指對住右眼眼球中心、對上 25mm',
    '先向橫提至與肩膊平，先至擺前臂（圖見 ③）',
    '打數 Up—Two—Three—Down（見敬禮圖）'],
  ['④ 三指代表咩', (function(){
      var lab = ['對神明、對國家，盡責任','對別人，要幫助','對規律，必遵行'], s = '';
      for (var i=0;i<3;i++) s += '<rect x="-46" y="'+(-26+i*16)+'" width="92" height="13" rx="4" fill="#fff" stroke="#C7D8C2"/>'
        + T(-42,-16+i*16,(i+1)+'. '+lab[i],6.8,fA,'start');
      return s;
    })(),
    '常見解說：三指＝誓詞嘅三部分（照上面三行）',
    '呢個屬一般講法，唔係《步操手冊》條文',
    '⚠️ 你團有官方講法就照官方版本']
], 2, '手冊第3章§7（手形與 25mm）＋《童軍訓練綱要》誓詞（2026-06-06 版）・三指含義屬團内講解');

/* 4. 團呼：馬蹄鐵隊形〔手冊第8章§6〕＋字句待核 */
D.cer.howl = fDGR('團呼：馬蹄鐵隊形（字句屬團内傳統）', [
  ['① 馬蹄鐵形（頂視圖）', (function(){
      var s = '';
      for (var i=0;i<11;i++){
        var ang = (200 + i*14)*Math.PI/180;
        s += fdot(30*Math.sin(ang), -30*Math.cos(ang)+10, 3.4, fA);
      }
      s += fdot(0,-26,4,'#2E7D32') + T(0,-34,'領袖／發號者',6.6,'#2E7D32','middle',1);
      return s + fln(-12,30,12,30,'#90A4AE',1.2,1) + T(0,38,'開口位',6.4,fAT,'middle',1,1);
    })(),
    '馬蹄鐵形係手冊第8章§6 嘅官方隊形之一',
    '人人面對中心：領袖睇到每一個人，隊員亦見到領袖',
    '用呢個隊形＝為咗睇得清，唔代表團呼字句有官方版'],
  ['② 邊啲先算有依據', (function(){
      return '<rect x="-46" y="-28" width="92" height="14" rx="4" fill="#E8F5E9" stroke="#81C784"/>'
        + T(0,-18,'✅ 隊形：手冊第8章§6',6.8,'#1B5E20','middle',1)
        + '<rect x="-46" y="-11" width="92" height="14" rx="4" fill="#E8F5E9" stroke="#81C784"/>'
        + T(0,-1,'✅ 立正／稍息：手冊第3章§2',6.8,'#1B5E20','middle',1)
        + '<rect x="-46" y="6" width="92" height="14" rx="4" fill="#FFF3E0" stroke="#FFB300"/>'
        + T(0,16,'⚠️ 團呼字句／動作：待核',6.8,'#E65100','middle',1);
    })(),
    '呢張卡嘅呼喊內容仍然係「待核」',
    '唔准自己創作口號、節拍或動作',
    '用之前問資深領袖，並喺教案注明出處'],
  ['③ 帶團呼嘅次序', (function(){
      var it = ['整好隊先（三排或馬蹄鐵）','領袖發口令，全站好先','領呼者喺開口位起調','全團一次過喊完，再等口令'], s = '';
      for (var i=0;i<4;i++) s += '<rect x="-46" y="'+(-30+i*15)+'" width="92" height="12" rx="4" fill="#fff" stroke="#C7D8C2"/>'
        + T(-42,-21+i*15,(i+1)+'. '+it[i],6.6,fA,'start');
      return s;
    })(),
    '呼喊前後都要企得整齊（呢個先係可評估嘅部分）',
    '完畢由領袖發口令轉立正，唔准自行郁動',
    '未宣誓嘅新成員：照宣誓卡嘅講法處理'],
  ['④ 評估得到嘅嘢', (function(){
      var s = '<rect x="-46" y="-26" width="92" height="42" rx="6" fill="none" stroke="#81C784" stroke-width="1.2"/>';
      var it = ['叫到隔離隊友嘅名','跟到口令企好／立正','有冇人自己郁動、笑場'];
      for (var i=0;i<3;i++) s += T(-42,-14+i*13,'· '+it[i],6.8,'#1B5E20','start');
      return s;
    })(),
    '會員章 m2／m5 評嘅係「參與・跟到程序」',
    '唔好將團呼變成背口號考核',
    '做錯唔好笑人，示範一次再嚟一次']
], 2, '第8章§6（隊形）・團呼字句仍屬待核：app 唔自創，照你團嘅版本並注明出處');

D.cer.rest = fDGR('稍息・休息・回立正（第3章§2）', [
  ['① 稍息 Stand at — ease!', fTOP({sp:30, gap:15, arc:1, mm:305, dim:'305mm'}),
    '提左腳至大腿平行，再用力向外踏下',
    '打數 Out!・腳踭分開 305mm（約同肩膊闊）',
    '雙腳腳掌平放、膝蹬直、重心放兩腳之間'],
  ['② 稍息 手部', fBKN(0),
    '雙手沿身體向後移至身後中央，由拳變掌',
    '右掌疊於左掌上，雙手母指緊扣',
    '所有手指及手踭蹬直，頸至頭保持立正向前'],
  ['③ 休息 Stand — easy!', fBKN(1),
    '口令無打數：只係將雙手手踭自然放鬆',
    '除手踭外，其餘與稍息完全相同',
    '回稍息：喊「Squad!」手踭用力拉緊蹬直'],
  ['④ 回立正 Alert!（打數 In!）', fSFG({legs:[[86,10,'toe'],[0,0,'flat']], arms:[[-16,-30,1],[-20,-34,1]]})
    + fARC(0,0,16,86,0),
    '左腳尖微微指向地下，用力踏回右腳旁',
    '雙手由掌變拳沿身體向前移至拇指貼褲骨',
    '⚠️ 立正↔休息唔可以直接互轉，要經稍息']
], 2, '《步操手冊》第3章§2・原地動作一律用標準停頓時距（每分鐘 40 個動作）');

D.cer.salute3 = fDGR('原地向前敬禮（第3章§7）・Up—Two—Three—Down', [
  ['① 預備（立正）', fFGG({rArm:'down'}),
    'Salute to the front — salute!',
    '打數 Up—Two—Three—Down',
    '左手握拳緊貼褲骨，雙腳腳掌平放'],
  ['② 「Up」向橫提至與肩膊平', fFGG({rArm:'side'})
    + fln(-30,-26,30,-26,'#90A4AE',1,1) + T(33,-29,'肩膊水平線',6.6,'#6D4C41','start'),
    '右手向橫提昇直至與肩膊平',
    '同時將右手握成童軍敬禮手號',
    '先向橫提至與肩膊平，先至擺前臂'],
  ['③ 「Up」前臂擺至右眼對上', fFGG({rArm:'at'}),
    '用力將右前臂擺至食指於右眼對上的位置',
    '右食指喺右眼眼球中心對上 25 毫米',
    '右手前臂與指尖成一直線・頭向前望'],
  ['④ 「Down」放回褲骨', fFGG({rArm:'down'}) + fARC(22,-20,9,180,270),
    '右手用最短的距離握拳放回右邊褲骨',
    '分部：Saluting by numbers… one!',
    '「Two—Three」係停留時間冇動作']
], 2, '第3章§7・25mm 係手冊數字；「指尖接帽沿／眉梢」屬中式講法');

D.cer.drill = svg(340,168,'中式隊列基本動作示意圖',
  MK
  +T(170,16,'中式隊列・三個動作要領（俯視／後視／側視示意）',11.5,'#1B5E20','middle',1)
  /* A 立正：俯視腳部 */
  +'<g transform="translate(48,66)">'
  +'<ellipse cx="-13" cy="-10" rx="6.5" ry="13" fill="#37474F" transform="rotate(-22 -13 -10)"/>'
  +'<ellipse cx="13" cy="-10" rx="6.5" ry="13" fill="#37474F" transform="rotate(22 13 -10)"/>'
  +'<path d="M-26,-28 A32,32 0 0 1 26,-28" fill="none" stroke="#2E7D32" stroke-width="1.5" stroke-dasharray="3,3"/>'
  +T(0,-40,'腳尖向外與中線成30°',9.5,'#2E7D32')
  +T(0,22,'腳跟靠攏・腳掌平放',9.5,'#666')+'</g>'
  +T(48,112,'A 立正',11,'#333',null,1)+T(48,128,'握拳・拇指壓食指',9.5,'#8D6E63')
  /* B 童軍動作：後面睇 */
  +'<g transform="translate(170,64)">'
  +'<circle cx="0" cy="-30" r="9" fill="#37474F"/>'
  +'<rect x="-11" y="-19" width="22" height="36" rx="7" fill="#37474F"/>'
  +'<path d="M-11,-12 L-15,7 L-1,13" fill="none" stroke="#37474F" stroke-width="4.5" stroke-linecap="round"/>'
  +'<path d="M11,-12 L15,7 L1,13" fill="none" stroke="#37474F" stroke-width="4.5" stroke-linecap="round"/>'
  +'<circle cx="0" cy="13" r="5.5" fill="#F9A825"/>'
  +'</g>'
  +T(170,112,'B 童軍動作（後面睇）',11,'#333',null,1)
  +T(170,128,'雙手放身後中央・右掌疊左掌',9.5,'#8D6E63')
  /* C 齊步：腳印示意 */
  +'<g transform="translate(290,64)">'
  +'<ellipse cx="-16" cy="14" rx="6" ry="10" fill="#B0BEC5"/>'
  +'<ellipse cx="14" cy="-8" rx="6" ry="10" fill="#37474F" transform="rotate(14 14 -8)"/>'
  +arrow(-12,10,8,-6,'#2E7D32',1.5)
  +T(0,-28,'步幅750mm',9.5,'#2E7D32')
  +'</g>'
  +T(290,112,'C 齊步——走',11,'#333',null,1)
  +T(290,128,'左腳先行・116 步/分',9.5,'#8D6E63')
  +T(170,158,'口令＝介令＋預令＋動令；原地停 1.5 秒；唔准用步操罰人',9.5,'#8D6E63')
);

/* 升旗禮：旗桿與觀眾位置 */
D.cer.flag = svg(340,180,'升旗禮位置示意圖',
  MK
  +T(170,16,'升旗禮・旗桿與站位（示意）',12,'#1B5E20','middle',1)
  +box(96,28,150,106,'#FAFAFA','#C8E6C9')
  +pole(150,118,66,'#DE2910','國旗')
  +pole(216,118,46,'#00704C','區旗')
  +T(183,144,'國旗喺中央且高於區旗',10.5,'#C62828','middle',1)
  +dot(64,84,5,'#37474F')+T(64,70,'旗手',10,'#2E7D32')
  +dot(276,84,5,'#37474F')+T(276,70,'護旗',10,'#2E7D32')
  +row(76,160,9,26)+row(76,174,9,26)
  +T(20,150,'全體面向旗桿立正',10,'#666','start')
  +T(170,38,'奏國歌時同步揚旗・緩緩升至頂部',10.5,'#666')
  +T(170,54,'戴帽→三指舉手禮・無帽→注目禮',10.5,'#1565C0')
);

/* 宣誓儀式：位置圖 */
D.cer.oath = svg(340,180,'宣誓儀式位置示意圖',
  MK
  +T(170,16,'宣誓儀式・站位（依儀式卡程序繪畫）',11.5,'#1B5E20','middle',1)
  +pole(170,64,26,'#C62828','團旗（中央）')
  +sq(112,70,6,'#2E7D32')+T(112,56,'團長',10.5,'#2E7D32')
  +dot(170,86,5,'#F9A825')+T(170,102,'新成員：舉右手三指禮・跟讀誓詞',10.5,'#8D6E63','middle',0,1)
  +box(26,102,96,34,'#F3E5F5','#CE93D8')+T(74,116,'見證家長',10.5,'#6A1B9A')+T(74,129,'（前排／側坐）',10,'#6A1B9A')
  +box(218,102,96,34,'#E3F2FD','#90CAF9')+T(266,116,'資深成員',10.5,'#1565C0')+T(266,129,'持旗旁立',10,'#1565C0')
  +row(80,152,8,26)
  +T(170,172,'全團整齊排列（後方）・禮成後左手握手・全團歡呼迎新的隊員',10.5,'#666')
);

/* 三指敬禮：手勢＋全禮半禮 */
D.cer.salute = (function(){
  function fig(x,hi,cap1,cap2){
    var g='<g transform="translate('+x+',78)">'
      +'<circle cx="0" cy="-26" r="9" fill="#37474F"/>'
      +'<path d="M-10,-30 L10,-30 L8,-38 L-8,-38 z" fill="#5D4037"/>'
      +'<rect x="-9" y="-15" width="18" height="30" rx="6" fill="#37474F"/>'
      +'<line x1="-4" y1="15" x2="-5" y2="34" stroke="#37474F" stroke-width="5" stroke-linecap="round"/>'
      +'<line x1="4" y1="15" x2="5" y2="34" stroke="#37474F" stroke-width="5" stroke-linecap="round"/>';
    if(hi){
      g+='<path d="M7,-8 L14,-24 L5,-30" fill="none" stroke="#37474F" stroke-width="4.5" stroke-linecap="round"/>'
        +'<circle cx="4" cy="-31" r="3.2" fill="#F9A825"/>';
      g+=ln(-14,-31,16,-31,1,'#1565C0','3,3');
    } else {
      g+='<path d="M7,-8 L13,-2 L11,-14" fill="none" stroke="#37474F" stroke-width="4.5" stroke-linecap="round"/>'
        +'<circle cx="11" cy="-16" r="3.2" fill="#F9A825"/>';
      g+=ln(0,-16,20,-16,1,'#1565C0','3,3');
    }
    g+='</g>'+T(x,126,cap1,10.5,'#333',null,1)+T(x,140,cap2,9.5,'#8D6E63');
    return g;
  }
  return svg(340,152,'童軍三指敬禮手勢示意圖', MK
    +T(170,14,'三指敬禮・手勢與高度',12,'#1B5E20','middle',1)
    +'<g transform="translate(58,86)">'
    +'<rect x="-15" y="16" width="30" height="15" rx="5" fill="#F1C9A5" stroke="#B07B4F" stroke-width="1.5"/>'
    +'<rect x="-14" y="-34" width="9" height="50" rx="4.5" fill="#F1C9A5" stroke="#B07B4F" stroke-width="1.5"/>'
    +'<rect x="-4.5" y="-40" width="9" height="56" rx="4.5" fill="#F1C9A5" stroke="#B07B4F" stroke-width="1.5"/>'
    +'<rect x="5" y="-34" width="9" height="50" rx="4.5" fill="#F1C9A5" stroke="#B07B4F" stroke-width="1.5"/>'
    +'<rect x="15" y="2" width="8" height="14" rx="4" fill="#F1C9A5" stroke="#B07B4F" stroke-width="1.5"/>'
    +'<path d="M-21,16 Q-25,4 -15,1" fill="none" stroke="#B07B4F" stroke-width="3" stroke-linecap="round"/>'
    +T(0,-52,'食指・中指・無名指',9.5,'#C62828')
    +T(0,-40,'並攏伸直',9.5,'#C62828')
    +T(-6,26,'拇指壓住小指',8.5,'#C62828','start')
    +'</g>'
    +T(58,126,'手勢（掌心面）',10.5,'#333',null,1)
    +T(58,140,'三指＝誓詞三部分',9.5,'#8D6E63')
    +ln(128,24,128,148,'#E0E0E0',1)
    +fig(200,1,'全禮','指尖齊右眉／帽沿')
    +ln(262,24,262,148,'#E0E0E0',1)
    +fig(312,0,'半禮','手約齊肩')
  );
})();

/* ══════════ 🎮 遊戲場地圖（DIAGRAMS.game） ══════════ */
D.game = {};

D.game['有口難言'] = svg(340,120,'有口難言場地示意',
  MK+T(170,14,'有口難言・排隊示意（全程唔准出聲）',11.5,'#1B5E20','middle',1)
  +ln(20,60,320,60,1.5,'#B0BEC5','5,4')
  +dot(46,60)+dot(84,60)+dot(120,60)+dot(158,60)+dot(196,60)+dot(234,60)+dot(272,60)+dot(306,60)
  +T(30,80,'1月',9.5,'#666','start')+T(310,80,'12月',9.5,'#666','end')
  +arrow(60,94,280,94,'#2E7D32',1.5)
  +T(170,40,'用手勢比月份/日期，自行排成一條直線',10.5,'#8D6E63')
);
D.game['直呼其名'] = svg(340,126,'直呼其名場地示意',
  MK+T(170,14,'直呼其名・圍圈拋球（先叫名，聽到「到」先抛）',11.5,'#1B5E20','middle',1)
  +'<circle cx="120" cy="70" r="36" fill="none" stroke="#B0BEC5" stroke-width="1.5" stroke-dasharray="4,4"/>'
  +dot(120,34)+dot(156,70)+dot(120,106)+dot(84,70)+dot(94,44)+dot(146,44)+dot(146,96)+dot(94,96)
  +arrow(120,34,152,66,'#F9A825',2)+arrow(146,96,90,72,'#F9A825',2)
  +sq(252,64,6,'#2E7D32')+T(252,48,'領袖',10,'#2E7D32')+dot(252,88,4,'#999')+T(252,102,'軟球',10,'#666')
);
D.game['繩索挑戰'] = svg(340,126,'繩索挑戰場地示意',
  MK+T(170,14,'繩索挑戰・全隊用一條繩砌出指定形狀',11.5,'#1B5E20','middle',1)
  +'<rect x="110" y="36" width="120" height="60" fill="none" stroke="#6D4C41" stroke-width="5" rx="4"/>'
  +dot(110,36)+dot(170,36)+dot(230,36)+dot(230,96)+dot(170,96)+dot(110,96)
  +T(170,68,'正方形',11,'#6D4C41')
  +dot(70,48,4,'#999')+dot(58,64,4,'#999')+T(60,92,'隊員拉繩砌形',9.5,'#8D6E63','start',0,1)
  +T(170,116,'進階：砌星形・唔准講嘢・手唔可以離繩',10,'#8D6E63')
);
D.game['飛毯'] = svg(340,120,'飛毯場地示意',
  MK+T(170,14,'飛毯・全隊企喺帆布上，將帆布反轉（無人落地）',11,'#1B5E20','middle',1)
  +'<rect x="118" y="40" width="104" height="52" fill="#C8E6C9" stroke="#2E7D32" stroke-width="2.5" transform="rotate(-6 170 66)"/>'
  +dot(140,58)+dot(162,54)+dot(186,58)+dot(208,62)+dot(150,78)+dot(176,82)+dot(200,78)
  +'<path d="M236,50 q18,12 0,28" fill="none" stroke="#F9A825" stroke-width="3"/>'
  +T(170,110,'策略自己傾：疊位／翻邊／分段轉',10,'#8D6E63')
);
D.game['執包比賽'] = svg(340,120,'執包比賽場地示意',
  MK+T(170,14,'執包比賽・一隊一張枱：揀啱嘢＋執得啱放',11.5,'#1B5E20','middle',1)
  +box(56,34,124,54,'#FFF8E1','#F9A825')+T(118,56,'物品池 20 樣',10.5,'#333')+T(118,72,'（14 啱用 + 6 陷阱）',10,'#C62828')
  +'<rect x="242" y="32" width="34" height="56" rx="8" fill="#C8E6C9" stroke="#2E7D32" stroke-width="2"/>'
  +T(259,64,'背囊',10,'#2E7D32')
  +arrow(184,60,238,60,'#2E7D32',2)
  +T(170,110,'⏱ 限時 10 分鐘・完隊展示：帶咗咩・點解咁放',10,'#8D6E63')
);
D.game['結繩接力賽'] = svg(340,126,'結繩接力賽場地示意',
  MK+T(170,14,'結繩接力賽・起點 → 任務枱打結 → 評判檢查 → 接力',11,'#1B5E20','middle',1)
  +row(36,48,4,16)+T(44,72,'起點',10.5,'#2E7D32')
  +row(36,96,4,16)+T(52,118,'候跑區',10,'#8D6E63','start')
  +box(140,52,76,46,'#FFF8E1','#F9A825')+T(178,70,'任務枱',10.5,'#333')+T(178,86,'抽卡打結',10,'#666')
  +sq(272,75,7,'#2E7D32')+T(272,56,'評判',10,'#2E7D32')
  +arrow(82,76,136,76)+arrow(220,70,262,72,'#FF8F00')
  +T(170,118,'✅ 結打啱先准接力（速度半・準確半）',10,'#8D6E63')
);
D.game['拖木頭挑戰'] = svg(340,120,'拖木頭挑戰場地示意',
  MK+T(170,14,'拖木頭挑戰・曳木結固定「木頭」，拖行 5 米繞樁折返',11,'#1B5E20','middle',1)
  +ln(24,52,316,52,1.5,'#B0BEC5','5,4')
  +'<rect x="44" y="58" width="26" height="13" rx="3" fill="#6D4C41"/>'
  +'<line x1="70" y1="64" x2="106" y2="64" stroke="#8D6E63" stroke-width="2.5"/>'
  +dot(114,64)+T(114,88,'拉',10,'#2E7D32')
  +'<polygon points="280,54 288,72 272,72" fill="#F9A825" stroke="#E65100"/>'
  +arrow(136,62,256,62,'#2E7D32',2)+arrow(256,70,136,70,'#FF8F00',2)
  +T(170,106,'⚠️ 通道兩邊唔企人・唔准企喺條繩前面',10,'#C62828')
);
D.game['急救情境賽'] = svg(340,120,'急救情境賽站點示意',
  MK+T(170,14,'急救情境賽・一隊一張墊：抽卡 → 做＋講 → 評判核對',11,'#1B5E20','middle',1)
  +box(20,36,88,58,'#FFEBEE','#E57373')+T(64,54,'處理區',10,'#C62828')+dot(44,78,4,'#37474F')+dot(62,78,4.5,'#90A4AE')+dot(80,78,4,'#37474F')+T(62,94,'「傷者」',9.5,'#666','middle',0,1)
  +arrow(114,64,134,64)
  +box(140,36,64,58,'#F5F5F5','#BDBDBD')+T(172,56,'情境卡',10,'#333')+T(172,70,'扭傷/燙親',9.5,'#666')+T(172,82,'鼻血/刺傷',9.5,'#666')
  +arrow(210,64,230,64)
  +sq(268,64,8,'#2E7D32')+T(268,44,'評判',10,'#2E7D32')
  +T(268,88,'步驟60%',9.5,'#666')+T(268,100,'速度20%・安慰20%',9.5,'#666')
);
D.game['定向尋寶'] = svg(340,130,'定向尋寶路線示意',
  MK+T(170,14,'定向尋寶・按任務卡方位逐站蓋印（每站有領袖睇住）',11,'#1B5E20','middle',1)
  +'<rect x="24" y="30" width="292" height="72" fill="#F1F8E9" stroke="#AED581" stroke-width="1.5"/>'
  +sq(58,50,7,'#C62828')+'<circle cx="150" cy="46" r="7" fill="#1565C0"/>'
  +'<circle cx="240" cy="62" r="7" fill="#1565C0"/>'+'<circle cx="188" cy="86" r="7" fill="#1565C0"/>'
  +'<circle cx="284" cy="88" r="7" fill="#F9A825"/>'
  +arrow(66,52,140,48,'#2E7D32',1.5)+arrow(158,48,232,60,'#2E7D32',1.5)+arrow(236,68,196,82,'#2E7D32',1.5)+arrow(196,88,274,88,'#2E7D32',1.5)
  +T(58,38,'起',10,'#C62828','middle',0,1)+T(150,34,'站1',10,'#1565C0','middle',0,1)
  +T(240,50,'站2',10,'#1565C0','middle',0,1)+T(188,102,'站3',10,'#1565C0','middle',0,1)
  +T(284,114,'終點',10.5,'#E65100','middle',0,1)
  +T(70,118,'🧭 例：向東50步 → 向北30步 …',10,'#666','start')
);
D.game['沙灘旗'] = svg(340,120,'沙灘旗場地示意',
  MK+T(170,14,'沙灘旗・俯卧一線，哨聲一響先起身搶旗',11.5,'#1B5E20','middle',1)
  +dot(40,74,4.5)+dot(70,74,4.5)+dot(100,74,4.5)+dot(130,74,4.5)+dot(160,74,4.5)
  +ln(28,74,172,74,1.5,'#B0BEC5','5,4')+T(100,92,'俯卧線（出發線）',10,'#666')
  +arrow(176,74,240,74,'#2E7D32',2)
  +ln(250,74,250,44,2.5,'#5D4037')+'<path d="M250,44 l20,5 l-20,5 z" fill="#C62828"/>'
  +T(256,100,'5–10 米',10,'#8D6E63')
  +T(170,114,'逐輪淘汰，最後贏家做「旗王」；分多條線避免撞埋一齊',10,'#8D6E63')
);
D.game['運水接力'] = svg(340,120,'運水接力場地示意',
  MK+T(170,14,'運水接力・水源 → 端杯跑 → 倒入隊桶（限時鬥多）',11,'#1B5E20','middle',1)
  +box(20,46,54,38,'#E3F2FD','#1565C0')+T(47,61,'水源',10,'#1565C0')+T(47,75,'桶/水缸',9.5,'#666')
  +box(266,46,54,38,'#E8F5E9','#2E7D32')+T(293,61,'終點桶',10,'#2E7D32')+T(293,75,'量水位',9.5,'#666')
  +dot(118,64)+dot(170,64)+dot(222,64)
  +arrow(80,64,258,64,'#1565C0',2)+arrow(258,76,80,76,'#90CAF9',1.5)
  +T(170,106,'杯越細越好玩・灑出嚟唔扣分・濕地易跣要清跑道',10,'#8D6E63')
);
D.game['大風吹'] = svg(340,126,'大風吹圍圈示意',
  MK+T(170,14,'大風吹・櫈圍圈（少一張），「鬼」企中間',11.5,'#1B5E20','middle',1)
  +(function(){var s='';for(var i=0;i<10;i++){var a=(i/10)*Math.PI*2-Math.PI/2;var x=170+Math.cos(a)*52,y=72+Math.sin(a)*38;
    s+='<rect x="'+(x-7)+'" y="'+(y-5)+'" width="14" height="10" rx="2" fill="#BCAAA4" stroke="#8D6E63" stroke-width="1"/>';}return s;})()
  +dot(170,72,6,'#C62828')+T(170,92,'「鬼」',10,'#C62828')
  +T(170,116,'「大風吹！」「吹咩？」「吹着短襪嘅！」→ 中咗者換位・鬼搶位',10,'#8D6E63')
);

/* ══════════ 🪢 技能圖（DIAGRAMS.skillx） ══════════ */
D.skillx = {};

D.skillx.ropecare = svg(340,120,'收繩與保養示意',
  MK+T(170,14,'收繩・圈繞收法 ＋ 保養五要点',11.5,'#1B5E20','middle',1)
  +'<ellipse cx="70" cy="58" rx="32" ry="24" fill="none" stroke="#6D4C41" stroke-width="5"/>'
  +'<ellipse cx="70" cy="58" rx="20" ry="14" fill="none" stroke="#8D6E63" stroke-width="3"/>'
  +'<path d="M92,42 q14,-8 6,12" fill="none" stroke="#F9A825" stroke-width="4"/>'
  +T(70,98,'① 一圈圈繞成束',10,'#666')
  +T(70,112,'② 繩尾纏頂部數圈・穿過拉緊',10,'#666')
  +ln(140,26,140,116,'#E0E0E0',1)
  +T(246,44,'🚫 唔好踩・唔好拖落地',10.5,'#C62828')
  +T(246,64,'💧 污糟清水洗・陰乾唔暴曬',10.5,'#1565C0')
  +T(246,84,'🔍 斷絲/磨損/發霉＝報廢',10.5,'#333')
  +T(246,102,'📦 通風乾燥位・避熱源化學品',10.5,'#333')
);

D.skillx.legend = svg(340,152,'地圖圖例示意',
  MK+T(170,14,'地圖常見圖例（示意；實際以地圖圖例欄為準）',11.5,'#1B5E20','middle',1)
  +'<g transform="translate(14,24)">'+box(0,0,76,44,'#FAFAFA','#E0E0E0')+'<line x1="8" y1="20" x2="68" y2="20" stroke="#C62828" stroke-width="5"/><line x1="8" y1="20" x2="68" y2="20" stroke="#fff" stroke-width="1" stroke-dasharray="6,4"/>'+T(38,58,'車路',10)+'</g>'
  +'<g transform="translate(98,24)">'+box(0,0,76,44,'#FAFAFA','#E0E0E0')+'<line x1="8" y1="20" x2="68" y2="20" stroke="#8D6E63" stroke-width="2.5" stroke-dasharray="5,3"/>'+T(38,58,'小徑',10)+'</g>'
  +'<g transform="translate(182,24)">'+box(0,0,76,44,'#FAFAFA','#E0E0E0')+'<path d="M8,26 Q24,12 40,24 T68,20" fill="none" stroke="#1565C0" stroke-width="3"/>'+T(38,58,'河流',10)+'</g>'
  +'<g transform="translate(266,24)">'+box(0,0,76,44,'#FAFAFA','#E0E0E0')+'<rect x="10" y="10" width="56" height="22" rx="4" fill="#BBDEFB" stroke="#1565C0" stroke-width="1.5"/>'+T(38,58,'水塘',10)+'</g>'
  +'<g transform="translate(14,86)">'+box(0,0,76,44,'#FAFAFA','#E0E0E0')+'<rect x="10" y="10" width="56" height="22" rx="4" fill="#C8E6C9" stroke="#2E7D32" stroke-width="1.5"/>'+T(38,58,'林地',10)+'</g>'
  +'<g transform="translate(98,86)">'+box(0,0,76,44,'#FAFAFA','#E0E0E0')+'<path d="M12,32 Q38,4 64,32" fill="none" stroke="#A1887F" stroke-width="1.5"/><path d="M22,32 Q38,14 54,32" fill="none" stroke="#A1887F" stroke-width="1.5"/>'+T(38,58,'等高線(密=斜)',9)+'</g>'
  +'<g transform="translate(182,86)">'+box(0,0,76,44,'#FAFAFA','#E0E0E0')+'<polygon points="38,10 54,32 22,32" fill="#FFF3E0" stroke="#E65100" stroke-width="2"/>'+T(38,58,'營地',10)+'</g>'
  +'<g transform="translate(266,86)">'+box(0,0,76,44,'#FAFAFA','#E0E0E0')+'<rect x="20" y="14" width="36" height="16" fill="#455A64"/>'+T(38,58,'建築物',10)+'</g>'
  +T(170,124,'1:25,000 → 圖 1cm = 實地 250 米',10.5,'#8D6E63')
);

D.skillx.tent = svg(340,140,'搭帳篷示意',
  MK+T(170,14,'搭帳篷・六步（側視示意）',11.5,'#1B5E20','middle',1)
  +'<line x1="14" y1="104" x2="326" y2="104" stroke="#8D6E63" stroke-width="2"/>'
  +'<rect x="86" y="97" width="168" height="6" rx="2" fill="#A1887F"/>'
  +'<path d="M170,36 L88,104 L252,104 z" fill="#FFF3E0" stroke="#E65100" stroke-width="2"/>'
  +'<line x1="170" y1="36" x2="88" y2="104" stroke="#5D4037" stroke-width="2.5"/>'
  +'<line x1="170" y1="36" x2="252" y2="104" stroke="#5D4037" stroke-width="2.5"/>'
  +'<line x1="170" y1="36" x2="62" y2="110" stroke="#2E7D32" stroke-width="1.5"/>'
  +'<line x1="170" y1="36" x2="278" y2="110" stroke="#2E7D32" stroke-width="1.5"/>'
  +'<rect x="56" y="108" width="10" height="4" rx="1.5" fill="#333" transform="rotate(-24 61 110)"/>'
  +'<rect x="274" y="108" width="10" height="4" rx="1.5" fill="#333" transform="rotate(24 279 110)"/>'
  +T(28,124,'④起篷',9.5,'#2E7D32','start')+T(246,124,'⑤營繩約45°',9.5,'#2E7D32','end')+T(324,124,'⑥營釘',9.5,'#2E7D32','end')
  +T(170,132,'流程：①平地清石 → ②舖地布 → ③穿柱 → ④起篷 → ⑤拉營繩 → ⑥打營釘',10,'#8D6E63')
);

D.skillx.stove = svg(340,140,'爐具安全示意',
  MK+T(170,14,'爐具・「3 米」安全距離（俯視示意）',11.5,'#1B5E20','middle',1)
  +'<rect x="30" y="42" width="60" height="40" rx="6" fill="#C8E6C9" stroke="#2E7D32" stroke-width="2"/>'+T(60,60,'帳篷',10.5,'#1B5E20')+T(60,74,'帳內煮食✗',9.5,'#C62828')
  +'<circle cx="240" cy="62" r="40" fill="none" stroke="#FF8F00" stroke-width="1.5" stroke-dasharray="4,3"/>'
  +'<rect x="228" y="56" width="24" height="14" rx="3" fill="#455A64"/>'
  +'<path d="M234,56 q4,-10 8,0" fill="#F9A825"/>'
  +T(240,92,'氣爐',10,'#333')
  +arrow(94,62,220,62,'#E65100',2)
  +T(158,52,'≥ 3 米',11,'#E65100')
  +T(170,124,'通風・使用前檢查漏氣・煮食唔離人・熄火先關氣',10,'#8D6E63')
);

D.skillx.knife = svg(340,130,'小刀安全圈示意',
  MK+T(170,14,'小刀・安全圈＝一臂長（俯視示意）',11.5,'#1B5E20','middle',1)
  +'<circle cx="170" cy="66" r="42" fill="#FFF8E1" stroke="#F9A825" stroke-width="2" stroke-dasharray="5,4"/>'
  +ln(170,66,212,66,1,'#F9A825','3,3')
  +dot(170,66,6,'#2E7D32')+T(170,58,'用刀者',9.5,'#2E7D32')
  +dot(96,40,4.5)+dot(246,38,4.5)+dot(90,94,4.5)+dot(252,96,4.5)
  +T(170,122,'其他人都要喺圈外・向外削・傳刀合埋柄向人・跌刀唔好用手接',10,'#8D6E63')
);

D.skillx.rice = svg(340,120,'RICE 扭傷處理示意',
  MK+T(170,14,'扭傷 RICE 四步',11.5,'#1B5E20','middle',1)
  +box(14,30,74,62,'#E3F2FD','#90CAF9')+T(51,56,'R',19,'#1565C0',null,1)
  +T(51,74,'Rest 休息',10,'#333')+T(51,87,'停喺度唔好行',9.5,'#666')
  +box(96,30,74,62,'#E8F5E9','#A5D6A7')+T(133,56,'I',19,'#2E7D32',null,1)
  +T(133,74,'Ice 冰敷',10,'#333')+T(133,87,'15–20分鐘/次',9.5,'#666')
  +box(178,30,74,62,'#FFF3E0','#FFCC80')+T(215,56,'C',19,'#E65100',null,1)
  +T(215,74,'Compression',9.5,'#333')+T(215,87,'包紮・唔好太緊',9.5,'#666')
  +box(260,30,68,62,'#F3E5F5','#CE93D8')+T(294,56,'E',19,'#6A1B9A',null,1)
  +T(294,74,'Elevation',9.5,'#333')+T(294,87,'患肢抬高',9.5,'#666')
  +T(170,110,'燙傷另有五步口訣「沖・脫・泡・蓋・送」——詳見 c17',10,'#8D6E63')
);

D.skillx.sos = svg(340,110,'SOS 哨音信號示意',
  MK+T(170,14,'求救哨音／燈號・SOS 節拍',11.5,'#1B5E20','middle',1)
  +'<rect x="26" y="48" width="14" height="22" rx="3" fill="#333"/><rect x="46" y="48" width="14" height="22" rx="3" fill="#333"/><rect x="66" y="48" width="14" height="22" rx="3" fill="#333"/>'
  +'<rect x="94" y="48" width="42" height="22" rx="3" fill="#F9A825"/><rect x="144" y="48" width="42" height="22" rx="3" fill="#F9A825"/><rect x="194" y="48" width="42" height="22" rx="3" fill="#F9A825"/>'
  +'<rect x="244" y="48" width="14" height="22" rx="3" fill="#333"/><rect x="264" y="48" width="14" height="22" rx="3" fill="#333"/><rect x="284" y="48" width="14" height="22" rx="3" fill="#333"/>'
  +T(53,40,'三短',10,'#333')+T(155,40,'三長',10,'#E65100')+T(269,40,'三短',10,'#333')
  +T(170,90,'重複・停一停再吹；手電筒同理：短＝快速閃，長＝按住閃',10,'#8D6E63')
);

D.skillx.lost = svg(340,120,'迷路自保三步示意',
  MK+T(170,14,'迷路／走失・三步自保（S.T.A.Y.）',11.5,'#1B5E20','middle',1)
  +'<rect x="40" y="46" width="10" height="34" fill="#6D4C41"/>'
  +'<circle cx="45" cy="40" r="14" fill="#81C784"/>'
  +dot(60,66,5,'#C62828')
  +T(45,96,'① 企定',10,'#C62828')
  +arrow(84,66,120,66)
  +'<circle cx="150" cy="60" r="15" fill="#FFF8E1" stroke="#F9A825" stroke-width="2"/>'
  +T(150,65,'哨',12,'#E65100')
  +T(150,96,'② 吹 SOS',10,'#E65100')
  +arrow(182,66,218,66)
  +'<rect x="240" y="42" width="24" height="38" rx="5" fill="#455A64"/>'
  +'<circle cx="252" cy="74" r="2.6" fill="#fff"/>'
  +T(252,96,'③ 等救援',10,'#1565C0')
  +T(170,114,'唔好亂行搵路・留低喺明顯位置・可打 999／182 報警求助',10,'#8D6E63')
);

/* ══════════ 🔥 營火圖（DIAGRAMS.fire） ══════════ */
D.fire = {};

D.fire.circle = svg(340,180,'營火圈座位示意圖',
  MK+T(170,16,'營火圈・座位與安全距離（俯視示意）',11.5,'#1B5E20','middle',1)
  +'<circle cx="170" cy="94" r="38" fill="#FFF3E0" stroke="#FF8F00" stroke-width="2" stroke-dasharray="5,4"/>'
  +'<path d="M162,96 q8,-22 16,0 q8,-10 4,10 q-6,10 -24,0 q-4,-6 4,-10z" fill="#F9A825" stroke="#E65100" stroke-width="1.5"/>'
  +'<rect x="152" y="100" width="36" height="5" rx="2" fill="#6D4C41"/><rect x="156" y="105" width="28" height="5" rx="2" fill="#8D6E63"/>'
  +'<rect x="140" y="59" width="60" height="14" rx="4" fill="#fff" opacity="0.88"/>'
  +T(170,70,'火圈範圍',9.5,'#E65100')
  +'<circle cx="170" cy="94" r="68" fill="none" stroke="#C8E6C9" stroke-width="1.5"/>'
  +(function(){var s='';for(var i=0;i<14;i++){var a=(i/14)*Math.PI*2;var x=170+Math.cos(a)*68,y=94+Math.sin(a)*68;
    if(i===10){ s+=sq(x,y,6,'#2E7D32')+T(x+2,y+13,'領唱',9,'#2E7D32','middle',0,1); } else s+=dot(x,y,4.5,'#37474F');}return s;})()
  +dot(296,150,5,'#1565C0')+T(296,166,'水桶/沙',9.5,'#1565C0')
  +dot(44,150,5,'#C62828')+T(44,166,'急救箱',9.5,'#C62828')
  +T(170,142,'觀眾坐外圈・離火至少一臂以上',10,'#8D6E63')
);

D.fire.flow = svg(340,150,'營火歌唱節目六段流程',
  MK+T(170,14,'一場 10–15 分鐘「唱歌環節」流程（示範編排）',11.5,'#1B5E20','middle',1)
  +(function(){
    var steps=['1 開場團呼','2 大合唱','3 輪唱對壘','4 動作歌','5 慢歌收尾','6 晚安呼'];
    var mins=['1分鐘','3分鐘','3分鐘','3分鐘','2分鐘','1分鐘'];
    var s='';
    steps.forEach(function(st,i){
      var col=i%3, rw=Math.floor(i/3);
      var x=22+col*104, y=30+rw*54;
      s+=box(x,y,98,42,rw===0?'#E8F5E9':'#FFF3E0',rw===0?'#81C784':'#FFCC80');
      s+=T(x+49,y+18,st,11,'#333','middle',1);
      s+=T(x+49,y+34,'約'+mins[i],9.5,'#8D6E63');
    });
    s+=arrow(124,51,140,51,'#999',1.5)+arrow(228,51,244,51,'#999',1.5);
    s+=arrow(300,72,300,98,'#999',1.5);
    s+=arrow(228,119,244,119,'#999',1.5)+arrow(124,119,140,119,'#999',1.5);
    return s;
  })()
  +T(170,144,'領唱企圈內：見到晒所有人・大家見到佢張口；細聲歌坐近啲',10,'#8D6E63')
);

D.fire.scarf = svg(300,124,'營火袍示意',
  MK+T(150,14,'營火袍（Campfire Blanket/Robe）示意',11,'#1B5E20','middle',1)
  +'<path d="M118,26 L100,96 Q150,106 200,96 L182,26 Q150,16 118,26 z" fill="#4E342E" stroke="#3E2723" stroke-width="2"/>'
  +'<path d="M118,26 Q150,16 182,26 L182,40 Q150,30 118,40 z" fill="#6D4C41"/>'
  +'<rect x="112" y="52" width="20" height="20" rx="3" fill="#F9A825" stroke="#E65100"/>'
  +'<rect x="140" y="70" width="20" height="20" rx="3" fill="#C8E6C9" stroke="#2E7D32"/>'
  +'<rect x="168" y="50" width="20" height="20" rx="3" fill="#BBDEFB" stroke="#1565C0"/>'
  +T(150,118,'布章至少兩枚縫喺袍上（營火章要求）',10,'#8D6E63')
);
/* ══════════ 👕 制服：徽章佩戴位置 ══════════
   v36 起制服 9 張位置圖（chest／zoom／sleeve／body／scarf／ties／kilwell／cap／branch）
   全部係「乾淨制服底圖＋程式照《儀容與制服手冊》疊位」直接畫成 AVIF，冇手繪 SVG 底稿；
   前端由 js/dia.js 嘅 IMG.map 直接出圖，所以呢度唔使（亦唔應該）再畫。
   位置依據：手冊 3.2 基本徽章、3.3 制服帽、3.4 領巾／領帶、3.5 基維爾巾圈及木章、
   4.6 袋蓋上方標誌及徽章、4.7 制服標誌及徽章佩戴。 */

/* 復原臥式（側臥）手繪圖解——AI 圖未出之前先用呢張；出咗圖會自動轉用插畫，呢張變折疊後備 */
D.skillx.faint = svg(340,132,'復原臥式側臥示意', MK
  +T(170,14,'復原臥式（唔醒但有呼吸先用）',11,'#1B5E20','middle',1)
  +box(16,96,308,12,'#EFEBE9','#BCAAA4',3)
  +'<circle cx="58" cy="80" r="12" fill="#EFE0C8" stroke="#C9A96A" stroke-width="1.5"/>'
  +'<path d="M70,74 Q104,60 142,78 L142,94 Q104,102 70,90 z" fill="#E0E0E0" stroke="#9E9E9E" stroke-width="1.5"/>'
  +'<path d="M142,84 L180,66 L190,88" fill="none" stroke="#9E9E9E" stroke-width="7" stroke-linecap="round"/>'
  +ln(142,90,214,96,6,'#9E9E9E')
  +'<path d="M66,88 Q84,100 100,98" fill="none" stroke="#C9A96A" stroke-width="2.5"/>'
  +T(58,116,'口向下',9,'#8D6E63')
  +T(150,116,'上手放前面',9,'#8D6E63')
  +T(206,116,'上膝屈前踏地',9,'#8D6E63')
  +T(170,128,'轉身前後都要睇呼吸；唔好墊枕頭、唔好仰臥',8.5,'#A1887F')
);

/* ══════════ 呢個檔係 build-only 底稿（v37 起唔會入前端 bundle） ══════════
 * 用途：留低 45 張手繪圖解嘅原始 vector，做兩件事——
 *   1) 重建 img/dia/*.avif（見 img/dia/SOURCES.md 嘅重製步驟）
 *   2) tests/smoke.mjs 驗「圖上畫咗／寫咗乜」（尺寸線比例、角度、文字唔出框）
 * 前端出圖一律經 js/dia.js（IMG.map → DIAGRAMS），只會出 <img src="img/dia/*.avif">，
 * 唔會有任何 <svg>；圖載入唔到就出 alt 文字後備（IMG.fallback）。
 */

})();
if (typeof module !== 'undefined' && module.exports) module.exports = DIAGRAMS;
