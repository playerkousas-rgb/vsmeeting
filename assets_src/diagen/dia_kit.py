"""dia_kit.py — 圖解繪製工具箱（build-only，唔入 bundle）

用途：用 PIL 程式繪製教學圖解（中性線條人形／俯視腳位／隊形），出 AVIF 到 img/dia/。
點解唔用 AI 圖：動作角度、距離、隊形位置必須由官方條文決定（30°／60°／750mm／25mm…），
AI 一定畫錯；程式繪圖可以先決定數字再落筆。

字體：pan-CJK 字型（Noto Sans CJK）預設出簡體字形變體；本工具箱先用 harfbuzz
以 language=zh-Hant 逐字 shape 出繁體偏好用字形，再改寫 cmap 做一份「繁體優先」字體，
PIL 先至會出港式繁體字形。字體只喺 build 期用，唔會入 repo。
"""
import math
import os
import sys

from PIL import Image, ImageDraw, ImageFont

# ── 色板（同 app.css 主色一致）──────────────────────────────────────
GREEN = (46, 125, 50)        # #2E7D32 森林綠
GREEN_D = (27, 94, 32)
GOLD = (249, 168, 37)        # #F9A825
INK = (38, 50, 56)           # #263238
SLATE = (84, 110, 122)       # #546E7A
GREY = (120, 144, 156)
LINE = (206, 214, 208)
PANEL = (250, 251, 249)
WHITE = (255, 255, 255)
RED = (198, 40, 40)          # #C62828
BLUE = (21, 101, 192)
SAND = (255, 248, 225)

FONT_SRC = os.environ.get('DIA_FONT', os.path.expanduser('~/.fonts/NotoSansCJKsc-Regular.otf'))
FONT_TC = os.environ.get('DIA_FONT_TC', os.path.expanduser('~/.fonts/NotoSansCJKtc-derived.otf'))

STRINGS = set()
_FONT_CACHE = {}
FONT_READY = False


def collect(s):
    for line in str(s).split('\n'):
        STRINGS.add(line)


def build_tc_font(charset):
    """把 cmap 內每個用字改指去 zh-Hant 偏好用字形，另存一份字體。"""
    import uharfbuzz as hb
    from fontTools.ttLib import TTFont

    if not os.path.exists(FONT_SRC):
        raise SystemExit('缺少字型：%s（設定 DIA_FONT 指去任何 pan-CJK OTF）' % FONT_SRC)
    blob = hb.Blob(open(FONT_SRC, 'rb').read())
    hfont = hb.Font(hb.Face(blob))
    tt = TTFont(FONT_SRC, lazy=True)
    order = tt.getGlyphOrder()
    remap = {}
    chars = set()
    for s in charset:
        chars.update(str(s))
    for ch in sorted(chars):
        if ord(ch) < 128 or ord(ch) > 0xFFFF:
            continue
        buf = hb.Buffer()
        buf.add_str(ch)
        buf.guess_segment_properties()
        buf.language = 'zh-Hant'
        hb.shape(hfont, buf)
        infos = buf.glyph_infos
        if not infos:
            continue
        gid = infos[0].codepoint
        if 0 <= gid < len(order):
            remap[ord(ch)] = order[gid]
    # 只保留 format 12 子表：format 4 有 64KB 長度上限，加入幾百個改指會爆
    tt['cmap'].tables = [t for t in tt['cmap'].tables if t.format == 12]
    for table in tt['cmap'].tables:
        for cp, gname in remap.items():
            table.cmap[cp] = gname
    os.makedirs(os.path.dirname(FONT_TC), exist_ok=True)
    tt.save(FONT_TC)
    return len(remap)


def font(size, bold=False):
    key = (int(size), bool(bold))
    if key not in _FONT_CACHE:
        path = FONT_TC if os.path.exists(FONT_TC) else FONT_SRC
        _FONT_CACHE[key] = ImageFont.truetype(path, int(size))
    return _FONT_CACHE[key]


# ── 基本繪圖 ────────────────────────────────────────────────────────
class Dia:
    def __init__(self, w, h):
        self.img = Image.new('RGB', (w, h), WHITE)
        self.d = ImageDraw.Draw(self.img)
        self.w, self.h = w, h

    # 文字（anchor 跟 PIL：l/m/r + a/m/s/b/d）
    def text(self, s, x, y, size=18, fill=INK, anchor='ls', bold=False,
             halo=None, align='left', spacing=4):
        collect(s)
        if not FONT_READY:
            return
        f = font(size, bold)
        kw = dict(font=f, fill=fill, anchor=anchor)
        if bold:
            kw['stroke_width'] = max(1, int(size) // 20)
            kw['stroke_fill'] = fill
        if halo:
            kw['stroke_width'] = max(2, int(size) // 8)
            kw['stroke_fill'] = halo
        if '\n' in str(s):
            self.d.multiline_text((x, y), s, align=align, spacing=spacing, **kw)
        else:
            self.d.text((x, y), s, **kw)

    def tw(self, s, size=18, bold=False):
        collect(s)
        if not FONT_READY:
            return len(str(s)) * size * 0.9
        return font(size, bold).getlength(str(s).split('\n')[0])

    def th(self, size=18):
        return int(size * 1.32)

    def box(self, x0, y0, x1, y1, fill=None, outline=None, width=2, r=10):
        self.d.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=fill, outline=outline, width=width)

    def line(self, pts, fill=INK, width=3, dash=None):
        if dash:
            for i in range(0, len(pts) - 1):
                self._dash_seg(pts[i], pts[i + 1], fill, width, dash)
        else:
            self.d.line(pts, fill=fill, width=width, joint='curve')

    def _dash_seg(self, p0, p1, fill, width, dash):
        x0, y0 = p0
        x1, y1 = p1
        dx, dy = x1 - x0, y1 - y0
        length = (dx * dx + dy * dy) ** 0.5
        if length == 0:
            return
        on, off = dash
        t = 0.0
        while t < length:
            t2 = min(t + on, length)
            self.d.line([(x0 + dx * t / length, y0 + dy * t / length),
                         (x0 + dx * t2 / length, y0 + dy * t2 / length)], fill=fill, width=width)
            t = t2 + off

    def arrow(self, p0, p1, fill=INK, width=3, head=11, dash=None):
        self.line([p0, p1], fill=fill, width=width, dash=dash)
        import math
        ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
        a1 = ang + math.radians(155)
        a2 = ang - math.radians(155)
        self.d.polygon([p1,
                        (p1[0] + head * math.cos(a1), p1[1] + head * math.sin(a1)),
                        (p1[0] + head * math.cos(a2), p1[1] + head * math.sin(a2))], fill=fill)

    def arc_arrow(self, cxy, r, a0, a1, fill=GOLD, width=4, head=12):
        """弧形箭嘴（PIL 角度：0=右，順時針增加）。a1>a0 順時針，a1<a0 逆時針。"""
        import math
        lo, hi = (a0, a1) if a1 > a0 else (a1, a0)
        self.d.arc([cxy[0] - r, cxy[1] - r, cxy[0] + r, cxy[1] + r], lo, hi, fill=fill, width=width)
        ang = math.radians(a1)
        sgn = 1 if a1 > a0 else -1
        px, py = cxy[0] + r * math.cos(ang), cxy[1] + r * math.sin(ang)
        tang = ang + sgn * math.pi / 2
        self.d.polygon([(px + head * math.cos(tang), py + head * math.sin(tang)),
                        (px + head * 0.62 * math.cos(tang + 2.3), py + head * 0.62 * math.sin(tang + 2.3)),
                        (px + head * 0.62 * math.cos(tang - 2.3), py + head * 0.62 * math.sin(tang - 2.3))],
                       fill=fill)

    def dot(self, xy, r=4, fill=RED):
        self.d.ellipse([xy[0] - r, xy[1] - r, xy[0] + r, xy[1] + r], fill=fill)

    def num(self, xy, n, fill=GOLD, size=17, r=13):
        self.d.ellipse([xy[0] - r, xy[1] - r, xy[0] + r, xy[1] + r], fill=fill)
        self.text(str(n), xy[0], xy[1] - 1, size=size, fill=WHITE, anchor='mm', bold=True)

    # 標題欄
    def title(self, main, sub=None, h=54):
        self.d.rounded_rectangle([0, 0, self.w, h], radius=0, fill=GREEN)
        self.text(main, 18, h // 2, size=25, fill=WHITE, anchor='lm', bold=True)
        if sub:
            self.text(sub, self.w - 18, h // 2, size=15, fill=(216, 235, 216), anchor='rm')
        return h

    # 分格
    def panel(self, x0, y0, x1, y1, label=None, fill=PANEL, outline=LINE, lsize=19):
        self.box(x0, y0, x1, y1, fill=fill, outline=outline)
        if label:
            self.text(label, x0 + 14, y0 + 10, size=lsize, fill=GREEN_D, anchor='la', bold=True)
        return y0 + (14 + self.th(lsize) if label else 10)

    # 註解框
    def note(self, x0, y0, x1, y1, lines, title=None, fill=SAND, outline=(240, 214, 130), size=16):
        self.box(x0, y0, x1, y1, fill=fill, outline=outline)
        y = y0 + 10
        if title:
            self.text(title, x0 + 14, y, size=size + 1, fill=(120, 84, 6), anchor='la', bold=True)
            y += self.th(size + 1) + 3
        for ln in lines:
            self.text(ln, x0 + 16, y, size=size, fill=(90, 70, 20), anchor='la')
            y += self.th(size) + 3
        return y

    def save(self, name_avif, png_preview=None, quality=62):
        import pillow_avif  # noqa: F401
        out = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                           'img', 'dia', name_avif)
        self.img.save(out, 'AVIF', quality=quality)
        if png_preview:
            os.makedirs(os.path.dirname(png_preview), exist_ok=True)
            self.img.save(png_preview, 'PNG')
        return out, self.img.size


# ── 線條人形（中性練習服，唔畫制服）─────────────────────────────────
def person_front(D, cx, top, h, arms='down', legs='together', fill=None, outline=INK,
                 width=4, head_fill=WHITE, feet=0.0, arm_angle=0.0, hands_back=False):
    """正面人形。h＝總高；feet＝腳尖外分角度（每邊）；arms: down/side/salute"""
    d = D.d
    import math
    hr = h * 0.072                       # 頭半徑
    head_c = (cx, top + hr)
    d.ellipse([cx - hr, top, cx + hr, top + 2 * hr], fill=head_fill, outline=outline, width=width)
    neck_y = top + 2 * hr
    sh_y = neck_y + h * 0.035            # 肩線
    hip_y = top + h * 0.56
    sw = h * 0.155                       # 半肩闊
    # 頸
    d.line([(cx, neck_y), (cx, sh_y)], fill=outline, width=width)
    # 肩
    d.line([(cx - sw, sh_y), (cx + sw, sh_y)], fill=outline, width=width)
    # 身軀
    waist = h * 0.115
    d.polygon([(cx - sw, sh_y), (cx + sw, sh_y), (cx + waist, hip_y), (cx - waist, hip_y)],
              outline=outline, width=width, fill=fill)
    # 手臂
    import math as _m
    al = h * 0.30
    for sgn in (-1, 1):
        sx = cx + sgn * sw
        if arms == 'down':
            ang = _m.radians(arm_angle) * sgn
            ex = sx + al * _m.sin(ang)
            ey = sh_y + al * _m.cos(ang)
            d.line([(sx, sh_y), (ex, ey)], fill=outline, width=width)
            d.ellipse([ex - 4, ey - 4, ex + 4, ey + 4], fill=outline)
        elif arms == 'back':
            d.line([(sx, sh_y), (sx + sgn * h * 0.05, sh_y + al * 0.82)], fill=outline, width=width)
    if hands_back:
        hy = sh_y + al * 0.9
        d.line([(cx - sw, sh_y), (cx - h * 0.045, hy)], fill=outline, width=width)
        d.line([(cx + sw, sh_y), (cx + h * 0.045, hy)], fill=outline, width=width)
        d.ellipse([cx - 9, hy - 6, cx + 9, hy + 6], outline=outline, width=width)
    # 腿
    ll = h - (hip_y - top)
    if legs == 'together':
        for sgn in (-1, 1):
            fx = cx + sgn * h * 0.028
            d.line([(cx + sgn * waist * 0.55, hip_y), (fx, top + h)], fill=outline, width=width)
            # 腳
            fl = h * 0.055
            ang = _m.radians(feet) * sgn
            d.line([(fx, top + h), (fx + fl * _m.sin(ang) * sgn * 0.0 + fl * _m.sin(ang), top + h - fl * 0.25)],
                   fill=outline, width=width)
    return {'head': head_c, 'sh': (cx, sh_y), 'hip': (cx, hip_y), 'foot_y': top + h, 'hr': hr, 'sw': sw}


def person_side(D, cx, top, h, facing=1, outline=INK, width=4, head_fill=WHITE, lean=0.0):
    """側面人形（facing=1 面向右）"""
    d = D.d
    hr = h * 0.075
    leanx = facing * h * lean
    head_c = (cx + leanx * 0.55, top + hr)
    d.ellipse([head_c[0] - hr * 0.92, top, head_c[0] + hr * 0.92, top + 2 * hr],
              fill=head_fill, outline=outline, width=width)
    neck_y = top + 2 * hr
    sh_y = neck_y + h * 0.03
    hip_y = top + h * 0.56
    sh = (cx + leanx, sh_y)
    hip = (cx, hip_y)
    d.line([(head_c[0], neck_y), sh], fill=outline, width=width)
    d.polygon([(sh[0] - h * 0.045, sh[1]), (sh[0] + h * 0.055, sh[1]),
               (hip[0] + h * 0.05, hip[1]), (hip[0] - h * 0.05, hip[1])], outline=outline, width=width)
    # 手臂（貼身向下）
    al = h * 0.30
    d.line([sh, (sh[0] + facing * h * 0.015, sh[1] + al)], fill=outline, width=width)
    # 腿
    d.line([(hip[0] - h * 0.02, hip[1]), (cx - h * 0.02, top + h)], fill=outline, width=width)
    d.line([(hip[0] + h * 0.025, hip[1]), (cx + h * 0.03, top + h)], fill=outline, width=width)
    # 腳（指向 facing）
    fl = h * 0.075
    for fx in (cx - h * 0.02, cx + h * 0.03):
        d.line([(fx, top + h), (fx + facing * fl, top + h)], fill=outline, width=width + 1)
    return {'head': head_c, 'sh': sh, 'hip': hip, 'foot_y': top + h, 'hr': hr}


def person_top(D, xy, facing=0.0, r=12, fill=WHITE, outline=INK, width=3, ring=None):
    """俯視隊員：頭（圓）＋肩膊（橫線）。facing：0=向上，順時針正。"""
    x, y = xy
    a = math.radians(facing)
    dx, dy = math.sin(a), -math.cos(a)
    px, py = -dy, dx
    sw = r * 1.75
    D.d.line([(x - px * sw, y - py * sw), (x + px * sw, y + py * sw)], fill=outline, width=width + 1)
    D.d.ellipse([x - r, y - r, x + r, y + r], fill=fill, outline=outline, width=width)
    D.d.line([(x + dx * r * 0.2, y + dy * r * 0.2), (x + dx * r * 1.0, y + dy * r * 1.0)],
             fill=outline, width=2)
    if ring:
        D.d.ellipse([x - r - 5, y - r - 5, x + r + 5, y + r + 5], outline=ring, width=3)
    return (x, y)


def foot_top(D, heel, angle, length=92, width=34, fill=(236, 240, 241), outline=INK, lw=3, toe_round=True):
    """俯視腳掌。heel＝腳跟點；angle＝腳尖方向（0=向上/螢幕 -y，正值=順時針）"""
    import math
    L, W = length, width
    pts = [(-W * 0.36, 0), (W * 0.36, 0), (W * 0.50, -L * 0.30), (W * 0.50, -L * 0.66),
           (W * 0.34, -L * 0.94), (0, -L), (-W * 0.34, -L * 0.94), (-W * 0.50, -L * 0.66),
           (-W * 0.50, -L * 0.30)]
    a = math.radians(angle)
    ca, sa = math.cos(a), math.sin(a)
    out = []
    for (x, y) in pts:
        out.append((heel[0] + x * ca - y * sa, heel[1] + x * sa + y * ca))
    D.d.polygon(out, fill=fill, outline=outline, width=lw)
    return out


def foot_centre(D, heel, angle, length=92):
    """腳掌中心軸上某點（用嚟畫尺寸線／角度線）"""
    import math
    a = math.radians(angle)
    return (heel[0] + length * math.sin(a), heel[1] - length * math.cos(a))


def angle_mark(D, vertex, a0, a1, r, label, size=16, fill=RED, label_fill=None, r_text=None):
    """兩條射線之間嘅角度標記（角度定義同 foot_top 一致：0=向上，順時針正）"""
    import math
    def pt(a, rr):
        rad = math.radians(a)
        return (vertex[0] + rr * math.sin(rad), vertex[1] - rr * math.cos(rad))
    D.d.arc([vertex[0] - r, vertex[1] - r, vertex[0] + r, vertex[1] + r],
            a0 - 90, a1 - 90, fill=fill, width=3)
    mid = (a0 + a1) / 2.0
    rt = r_text or (r + 16)
    p = pt(mid, rt)
    D.text(label, p[0], p[1], size=size, fill=label_fill or fill, anchor='mm', bold=True, halo=WHITE)
