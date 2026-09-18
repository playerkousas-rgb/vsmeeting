"""drill_diagrams.py — 步操／隊列教學圖解（build-only）

出 7 張 AVIF 到 img/dia/：
  drill-attention   立正
  drill-standease   稍息・跨立
  drill-turns       原地轉法（向右／左／後轉）
  drill-salute      三指敬禮・注目禮
  drill-dress       看齊・報數
  drill-formation   隊列名詞（橫隊／縱隊／翼／間隔／距離）
  drill-march       行進・立定

內容依據：
  《隊列和升掛國旗及區旗指引》（2024 年 6 月版本）「隊列動作要領」
  《步操手冊》DRILL MANUAL（香港童軍總會 2003 年 7 月第二版）第二至四章
人物一律中性線條（唔畫制服）；數字全部由條文決定。

執行：python3 assets_src/diagen/drill_diagrams.py
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dia_kit as K
from dia_kit import (Dia, person_front, person_side, foot_top, angle_mark, person_top,
                     GREEN, GREEN_D, GOLD, INK, SLATE, GREY, LINE, PANEL, WHITE, RED, BLUE, SAND)

PREVIEW = '/tmp/dia-preview'


def _ghost_foot(D, heel, angle, L, W):
    pts = [(-W * 0.36, 0), (W * 0.36, 0), (W * 0.50, -L * 0.30), (W * 0.50, -L * 0.66),
           (W * 0.34, -L * 0.94), (0, -L), (-W * 0.34, -L * 0.94), (-W * 0.50, -L * 0.66),
           (-W * 0.50, -L * 0.30)]
    a = math.radians(angle)
    ca, sa = math.cos(a), math.sin(a)
    D.d.polygon([(heel[0] + x * ca - y * sa, heel[1] + x * sa + y * ca) for (x, y) in pts],
                outline=GREY, width=2)


def _dim(D, p0, p1, tick, label, lsize=14, fill=GOLD, tcol=(140, 96, 8), anchor='ma', ldy=16):
    D.line([p0, p1], fill=fill, width=3)
    if abs(p0[1] - p1[1]) < 1:   # 橫向
        for xx in (p0[0], p1[0]):
            D.line([(xx, p0[1] - tick), (xx, p0[1] + tick)], fill=fill, width=3)
        D.text(label, (p0[0] + p1[0]) / 2, p0[1] + ldy, size=lsize, fill=tcol, anchor=anchor, halo=WHITE)
    else:                        # 縱向
        for yy in (p0[1], p1[1]):
            D.line([(p0[0] - tick, yy), (p0[0] + tick, yy)], fill=fill, width=3)
        D.text(label, p0[0] + ldy, (p0[1] + p1[1]) / 2, size=lsize, fill=tcol, anchor='lm', halo=WHITE)


# ══════════════════════════════════════════════════════════════════
# ① 立正
# ══════════════════════════════════════════════════════════════════
def dia_attention():
    D = Dia(720, 556)
    D.title('立正　口令「立——正」', '照 2024 指引＋《步操手冊》', h=52)

    # ① 正面
    y0 = D.panel(12, 62, 306, 388, '① 正面')
    P = person_front(D, 92, y0 + 14, 262, feet=30, arms='down')
    cx = 92
    lead = [
        (P['head'][1] - 2, '眼望無限遠'),
        (P['head'][1] + 18, '下頜微收・頸直'),
        (P['sh'][1] + 8, '兩肩平・稍後張'),
        (P['sh'][1] + 70, '兩臂自然下垂'),
        (P['sh'][1] + 96, '中指貼褲縫'),
        (P['hip'][1] + 6, '小腹微收・挺胸'),
        (P['foot_y'] - 26, '腳跟靠攏'),
    ]
    for y, s in lead:
        D.line([(cx + 34, y), (148, y)], fill=GREY, width=2)
        D.text(s, 152, y, size=14, fill=INK, anchor='lm')

    # ② 腳位俯視
    y0 = D.panel(316, 62, 470, 388, '② 腳位（俯視）')
    hx, hy = 393, 320
    D.line([(hx, hy), (hx, hy - 148)], fill=GREY, width=2, dash=(6, 5))
    foot_top(D, (hx, hy), -30, length=100, width=38)
    foot_top(D, (hx, hy), 30, length=100, width=38)
    angle_mark(D, (hx, hy), -30, 0, 56, '30°', size=14)
    angle_mark(D, (hx, hy), 0, 30, 80, '30°', size=14)
    D.text('兩腳尖分開約 60°', hx, y0 + 8, size=16, fill=RED, anchor='ma', bold=True)
    D.text('每腳同中線成 30°', hx, y0 + 30, size=13, fill=SLATE, anchor='ma')
    D.dot((hx, hy), 4, RED)
    D.text('中線', hx + 8, hy - 140, size=12, fill=GREY, anchor='lm')
    D.text('腳跟靠攏', hx, hy + 16, size=13, fill=RED, anchor='ma')
    D.text('腳掌平放地面', hx, hy + 34, size=12, fill=SLATE, anchor='ma')

    # ③ 側面
    y0 = D.panel(480, 62, 708, 388, '③ 側面')
    S = person_side(D, 540, y0 + 16, 258, facing=1, lean=0.03)
    side_lead = [
        (S['head'][1] + 2, '頭正頸直'),
        (S['sh'][1] + 22, '微向前傾'),
        (S['hip'][1] - 10, '兩腿挺直'),
        (S['foot_y'] - 24, '腳掌平放'),
    ]
    for y, s in side_lead:
        D.line([(566, y), (596, y)], fill=GREY, width=2)
        D.text(s, 600, y, size=14, fill=INK, anchor='lm')

    D.note(12, 398, 708, 548, [
        '‧ 口令「立——正」：預令拖音、動令短促。',
        '‧ 步操手冊 Alert：雙手握拳、拇指指甲向前貼食指、',
        '　拇指放褲骨之後、後顎貼衣領、眼望無限遠。',
        '‧ 檢閱時下頜上仰約 15 度。',
        '‧ 常見錯：腳尖過闊、駝背、拇指翹起、膝彎。',
    ], title='要領')
    return D


# ══════════════════════════════════════════════════════════════════
# ② 稍息・跨立
# ══════════════════════════════════════════════════════════════════
def dia_standease():
    D = Dia(720, 520)
    D.title('稍息・跨立　口令「稍——息」', '中式隊列＋《步操手冊》', h=52)

    # ① 稍息（中式）
    y0 = D.panel(12, 62, 246, 372, '① 稍息（中式）')
    foot_top(D, (172, 318), 26, length=96, width=36, fill=(232, 240, 233))
    gx, gy = 96, 318
    _ghost_foot(D, (gx, gy), -26, 96, 36)
    a = math.radians(-26)
    nx = gx + (96 * 0.67) * math.sin(a)
    ny = gy - (96 * 0.67) * math.cos(a)
    foot_top(D, (nx, ny), -26, length=96, width=36, fill=(255, 243, 224))
    D.arrow((gx - 2, gy - 60), (nx - 6, ny - 46), fill=RED, width=3, head=9)
    D.text('左腳順腳尖伸出', 20, y0 + 4, size=15, fill=RED, anchor='la')
    D.text('約全腳 2/3', 20, y0 + 24, size=15, fill=RED, anchor='la')
    D.text('虛線＝原位', 20, y0 + 52, size=12, fill=GREY, anchor='la')
    D.text('重心多在右腳', 128, 346, size=14, fill=INK, anchor='mm')
    D.text('上體保持立正', 128, 364, size=13, fill=SLATE, anchor='mm')

    # ② 跨立
    y0 = D.panel(256, 62, 480, 372, '② 跨立')
    person_front(D, 368, y0 + 26, 112, feet=10, hands_back=True)
    D.text('兩手後背', 318, y0 + 40, size=13, fill=SLATE, anchor='rm')
    D.line([(322, y0 + 40), (352, y0 + 46)], fill=GREY, width=2)
    D.text('左手握右手腕', 474, y0 + 40, size=13, fill=SLATE, anchor='rm')
    hy2 = 314
    foot_top(D, (404, hy2), 22, length=84, width=32, fill=(232, 240, 233))
    foot_top(D, (318, hy2), -22, length=84, width=32, fill=(255, 243, 224))
    _dim(D, (318, hy2 + 24), (404, hy2 + 24), 8, '跨出約一腳之長', lsize=13, ldy=12)
    D.text('重心落兩腳之間', 368, 364, size=13, fill=SLATE, anchor='mm')

    # ③ 步操手冊 Stand at ease
    y0 = D.panel(490, 62, 708, 372, '③ Stand at ease（手冊）')
    hy3 = 300
    foot_top(D, (546, hy3), -30, length=92, width=34, fill=(255, 243, 224))
    foot_top(D, (664, hy3), 30, length=92, width=34, fill=(232, 240, 233))
    _dim(D, (546, hy3 + 22), (664, hy3 + 22), 8, '腳跟分開 305 毫米', lsize=13)
    D.text('腳尖向外・同中線成 30°', 599, y0 + 6, size=14, fill=INK, anchor='ma')
    D.text('雙手向後放身後中央：', 599, y0 + 28, size=14, fill=INK, anchor='ma')
    D.text('右掌疊左掌・拇指緊扣', 599, y0 + 48, size=15, fill=RED, anchor='ma', bold=True)
    D.text('企耐可自行換腳', 599, 356, size=13, fill=SLATE, anchor='mm')

    D.note(12, 382, 708, 512, [
        '‧ 立正→稍息：提起左腳至大腿同地面平行，再向外踏下。',
        '‧ 「休息」＝稍息手踭放鬆；聽到「Squad！」即拉直回復稍息。',
        '‧ 一次活動只用一套口令，唔好中英文混用。',
    ], title='要領')
    return D


# ══════════════════════════════════════════════════════════════════
# ③ 原地轉法
# ══════════════════════════════════════════════════════════════════
def _turn_panel(D, x0, x1, label, degrees, caption, extra):
    y0 = D.panel(x0, 62, x1, 356, label)
    cx = (x0 + x1) / 2
    hy = 252
    L, W = 70, 26
    D.text(caption, cx, y0 + 6, size=15, fill=INK, anchor='ma', bold=True)
    D.text(extra, cx, y0 + 28, size=13, fill=SLATE, anchor='ma')
    # 原位（虛線）
    _ghost_foot(D, (cx, hy), -30, L, W)
    _ghost_foot(D, (cx, hy), 30, L, W)
    # 轉後（實線）：整組繞 (cx,hy) 轉 degrees
    foot_top(D, (cx, hy), 30 + degrees, L, W, fill=(232, 240, 233))
    foot_top(D, (cx, hy), -30 + degrees, L, W, fill=(255, 243, 224))
    r = 66
    if degrees > 0:
        D.arc_arrow((cx, hy), r, -90 - 14, -90 + degrees, fill=GOLD, width=4)
    else:
        D.arc_arrow((cx, hy), r, -90 + 14, -90 + degrees, fill=GOLD, width=4)
    D.dot((cx, hy), 5, RED)
    D.text('軸心', cx + 14, hy + 10, size=13, fill=RED, anchor='lm')
    D.text('虛線＝轉之前', cx, 334, size=12, fill=GREY, anchor='mm')
    D.text('轉完兩腳跟仍靠攏', cx, 318, size=12, fill=SLATE, anchor='mm')
    return y0


def dia_turns():
    D = Dia(720, 470)
    D.title('原地轉法', '中式隊列／步操手冊 Turning', h=52)
    _turn_panel(D, 12, 246, '① 向右轉 90°', 90, '以右腳跟為軸', '右腳跟同左腳掌前部同時用力')
    _turn_panel(D, 256, 480, '② 向左轉 90°', -90, '以左腳跟為軸', '左腳跟同右腳掌前部同時用力')
    _turn_panel(D, 490, 708, '③ 向後轉 180°', 180, '以右腳跟為軸・經右轉', '另一腳取捷徑迅速靠攏')
    D.note(12, 366, 708, 462, [
        '‧ 半面向右（左）轉＝45 度；預令拖音、動令短促。',
        '‧ 打數教：Turning by numbers, right turn — one!',
        '　（One—Two—Three—One，Two—Three 停留冇動作）。',
        '‧ 安全：預留一臂距離，轉前睇清後面有冇人。',
    ], title='要領')
    return D


# ══════════════════════════════════════════════════════════════════
# ④ 三指敬禮・注目禮
# ══════════════════════════════════════════════════════════════════
def dia_salute():
    D = Dia(720, 590)
    D.title('三指敬禮・注目禮', '步操手冊＋2024 指引', h=52)

    # ① 正面手位
    y0 = D.panel(12, 62, 250, 336, '① 手嘅位置（正面）')
    hx, hy, hr = 128, y0 + 84, 44
    D.d.ellipse([hx - hr, hy - hr, hx + hr, hy + hr], fill=WHITE, outline=INK, width=4)
    D.line([(hx - hr, hy - hr * 0.42), (hx + hr, hy - hr * 0.42)], fill=SLATE, width=3)
    D.text('帽邊', hx + hr + 4, hy - hr * 0.42, size=12, fill=SLATE, anchor='lm')
    eye_r = (hx - hr * 0.36, hy + hr * 0.02)
    eye_l = (hx + hr * 0.36, hy + hr * 0.02)
    for e in (eye_r, eye_l):
        D.d.ellipse([e[0] - 5, e[1] - 4, e[0] + 5, e[1] + 4], fill=INK)
    elbow = (hx + hr * 1.4, hy + hr * 2.4)
    hand = (eye_r[0] - 5, eye_r[1] - 32)
    D.line([elbow, hand], fill=INK, width=6)
    D.d.polygon([hand, (hand[0] + 3, hand[1] - 24), (hand[0] + 16, hand[1] - 20), (hand[0] + 11, hand[1] + 2)],
                fill=(255, 224, 178), outline=INK, width=3)
    D.line([(eye_r[0] - 24, eye_r[1]), (eye_r[0] - 24, eye_r[1] - 28)], fill=GOLD, width=3)
    D.line([(eye_r[0] - 30, eye_r[1]), (eye_r[0] - 18, eye_r[1])], fill=GOLD, width=3)
    D.line([(eye_r[0] - 30, eye_r[1] - 28), (eye_r[0] - 18, eye_r[1] - 28)], fill=GOLD, width=3)
    D.text('指尖喺右眼', 20, hy - 40, size=14, fill=(140, 96, 8), anchor='la')
    D.text('對上 25 毫米', 20, hy - 20, size=14, fill=(140, 96, 8), anchor='la')
    D.line([(60, hy - 12), (eye_r[0] - 26, eye_r[1] - 16)], fill=GOLD, width=2)
    D.text('手心向前・手指同前臂成一直線', 131, 322, size=13, fill=INK, anchor='mm')

    # ② 手型
    y0 = D.panel(260, 62, 460, 336, '② 手型')
    cx = 360
    D.d.rounded_rectangle([cx - 34, y0 + 110, cx + 34, y0 + 196], radius=16,
                          fill=(255, 224, 178), outline=INK, width=3)
    for fx in (-22, 0, 22):
        D.d.rounded_rectangle([cx + fx - 9, y0 + 34, cx + fx + 9, y0 + 112], radius=8,
                              fill=(255, 224, 178), outline=INK, width=3)
    D.d.rounded_rectangle([cx + 12, y0 + 140, cx + 52, y0 + 164], radius=11,
                          fill=(255, 214, 150), outline=INK, width=3)
    D.d.ellipse([cx - 46, y0 + 132, cx - 6, y0 + 164], fill=(255, 214, 150), outline=INK, width=3)
    D.text('三指伸直併攏', cx, y0 + 12, size=14, fill=RED, anchor='ma')
    D.text('拇指壓尾指', 452, y0 + 152, size=13, fill=INK, anchor='rm')
    D.text('唔係五指張開', cx, y0 + 214, size=13, fill=SLATE, anchor='ma')

    # ③ 側面
    y0 = D.panel(470, 62, 708, 336, '③ 側面（肘唔外張）')
    hx2, hy2, hr2 = 540, y0 + 84, 38
    D.d.ellipse([hx2 - hr2, hy2 - hr2, hx2 + hr2, hy2 + hr2], fill=WHITE, outline=INK, width=4)
    D.d.ellipse([hx2 - hr2 * 1.02, hy2 - hr2 * 1.12, hx2 + hr2 * 1.02, hy2 - hr2 * 0.3],
                fill=(236, 240, 241), outline=INK, width=3)
    sh = (hx2 + hr2 * 0.4, hy2 + hr2 * 1.5)
    elbow2 = (hx2 + hr2 * 0.62, hy2 + hr2 * 2.5)
    hand2 = (hx2 - hr2 * 0.5, hy2 - hr2 * 0.5)
    D.line([sh, elbow2], fill=INK, width=6)
    D.line([elbow2, hand2], fill=INK, width=6)
    D.line([hand2, (hand2[0] - 13, hand2[1] - 9)], fill=INK, width=6)
    D.text('上臂下垂', 596, hy2 + hr2 * 1.6, size=13, fill=INK, anchor='lm')
    D.text('肘貼身', 596, hy2 + hr2 * 2.1, size=13, fill=INK, anchor='lm')
    D.text('前臂同指尖成一直線', 589, 322, size=13, fill=INK, anchor='mm')

    # ④ 注目禮
    y0 = D.panel(12, 346, 708, 452, '④ 注目禮（Eyes — right）：唔舉手、只轉頭')
    cx3, cy3 = 120, y0 + 52
    person_top(D, (cx3 - 76, cy3), facing=0, r=14, ring=GREEN)
    person_top(D, (cx3 + 76, cy3), facing=38, r=14, fill=(255, 243, 224), ring=GOLD)
    D.arc_arrow((cx3 + 76, cy3), 36, -90, -90 + 38, fill=RED, width=3, head=9)
    D.text('轉頭唔超過 45 度', cx3 + 76, cy3 + 40, size=13, fill=RED, anchor='mm')
    D.text('面向受禮者成立正・目迎目送', 300, y0 + 28, size=15, fill=INK, anchor='lm')
    D.text('行進間：領隊發「Eyes — right！」', 300, y0 + 52, size=14, fill=SLATE, anchor='lm')
    D.text('領隊自己舉手，隊員行注目禮', 300, y0 + 74, size=14, fill=SLATE, anchor='lm')

    D.note(12, 462, 708, 582, [
        '‧ 舉手禮場合：升旗／奏國歌／宣誓／遇總監或主禮；',
        '　列隊由領隊發令，其他已集隊成員立正致敬。',
        '‧ 便服或制服不整齊：只肅立／立正，唔使舉手。',
        '‧ 「敬禮」→ 停頓 →「禮畢」，手最短距離放回褲骨。',
    ], title='場合')
    return D


# ══════════════════════════════════════════════════════════════════
# ⑤ 看齊・報數
# ══════════════════════════════════════════════════════════════════
def dia_dress():
    D = Dia(720, 582)
    D.title('看齊・報數', '2024 指引・深資全團一個隊形', h=52)
    y0 = D.panel(12, 62, 708, 448, '① 三排橫隊（俯視・團員面向上方）')
    files, ranks = 6, 3
    gx0, gy0 = 128, y0 + 132
    dx, dy = 92, 72
    pos = [[(gx0 + f * dx, gy0 + r * dy) for f in range(files)] for r in range(ranks)]
    for f in range(files):
        D.line([(pos[0][f][0], pos[0][f][1] - 26), (pos[ranks - 1][f][0], pos[ranks - 1][f][1] + 26)],
               fill=GREY, width=1, dash=(4, 5))
    for r in range(ranks):
        for f in range(files):
            base = (r == 0 and f == files - 1)
            person_top(D, pos[r][f], facing=0, r=12,
                       fill=(255, 243, 224) if base else WHITE, ring=GOLD if base else None)
    bx, by = pos[0][files - 1]
    D.text('基準員（唔郁）', bx - 4, by - 30, size=13, fill=(140, 96, 8), anchor='rm', bold=True)
    for f in range(1, files - 1):
        D.line([(pos[0][f][0] + 12, pos[0][f][1] - 3), (bx - 15, by - 1)], fill=BLUE, width=2, dash=(7, 5))
    f5 = 0
    D.line([(pos[0][f5][0] + 12, pos[0][f5][1] + 8), (pos[0][f5 + 3][0] - 13, pos[0][f5 + 3][1] + 10)],
           fill=RED, width=2, dash=(7, 5))
    D.text('前四名通視基準員', (pos[0][2][0] + bx) / 2, by + 26, size=13, fill=BLUE, anchor='mm')
    D.text('第五名起睇右側第三人', pos[0][f5][0] + 58, pos[0][f5][1] + 44, size=13, fill=RED, anchor='lm')
    D.text('後列先向前對正、再向右看齊', pos[1][2][0] + 30, pos[1][1][1] - 26, size=14, fill=INK, anchor='lm')
    # 報數
    D.arrow((bx - 6, by - 74), (pos[0][0][0] + 16, by - 74), fill=GREEN, width=3, head=11)
    for i in range(files):
        D.text(str(files - i), pos[0][i][0], by - 90, size=15, fill=GREEN, anchor='mm', bold=True)
    D.text('報數：由右至左・轉頭喊・最後一名唔轉頭', (pos[0][0][0] + bx) / 2, by - 108,
           size=14, fill=GREEN, anchor='mm', bold=True)
    # 間隔
    fy = pos[ranks - 1][0][1] + 44
    _dim(D, (pos[ranks - 1][0][0], fy), (pos[ranks - 1][1][0], fy), 8,
         '間隔約 10 厘米（一拳）', lsize=13)
    D.text('距離（前後）約 75 厘米（一臂）', pos[1][3][0] + 40, pos[1][2][1] + 40, size=13,
           fill=(140, 96, 8), anchor='mm')
    D.text('排距：收窄 750／開闊 1500 毫米', pos[1][4][0] + 40, pos[2][0][1] + 52, size=13,
           fill=SLATE, anchor='mm')

    D.note(12, 458, 708, 574, [
        '‧ 「向右看——齊」→ 碎步調整 →「向前——看」。',
        '‧ 報數「From the right — number！」；後列最後',
        '　一名報「滿伍」或「缺 x 名」。',
        '‧ 睇齊用碎步，唔准推撞。',
    ], title='要領')
    return D


# ══════════════════════════════════════════════════════════════════
# ⑥ 隊列名詞
# ══════════════════════════════════════════════════════════════════
def dia_formation():
    D = Dia(720, 470)
    D.title('隊列名詞', '教 FALL IN 前先用呢張圖', h=52)

    y0 = D.panel(12, 62, 300, 344, '① 橫隊＝按「列」排')
    for r in range(3):
        for f in range(4):
            x = 74 + f * 60
            y = y0 + 62 + r * 56
            person_top(D, (x, y), facing=0, r=10,
                       ring=GOLD if (r == 0 and f == 3) else None,
                       fill=(255, 243, 224) if (r == 0 and f == 3) else WHITE)
    D.text('左翼', 74, y0 + 44, size=13, fill=BLUE, anchor='mm')
    D.text('右翼', 254, y0 + 44, size=13, fill=RED, anchor='mm')
    D.arrow((92, y0 + 44), (118, y0 + 44), fill=BLUE, width=2, head=8)
    D.arrow((236, y0 + 44), (210, y0 + 44), fill=RED, width=2, head=8)
    D.text('前排', 40, y0 + 62, size=12, fill=SLATE, anchor='mm')
    D.text('後排', 40, y0 + 174, size=12, fill=SLATE, anchor='mm')
    D.text('三排橫隊＝FALL IN 常用', 156, 322, size=13, fill=INK, anchor='mm')

    y0 = D.panel(310, 62, 470, 344, '② 縱隊＝按「路」')
    for f in range(2):
        for r in range(4):
            person_top(D, (358 + f * 58, y0 + 48 + r * 54), facing=0, r=10)
    D.text('前後對齊＝「對齊行」', 390, 322, size=13, fill=INK, anchor='mm')

    y0 = D.panel(480, 62, 708, 344, '③ 行進基準（邊個話事）')
    yy = y0 + 42
    rows = [
        ('橫隊行進', '以右翼為基準', RED),
        ('並列縱隊', '以右翼為基準', RED),
        ('縱隊行進', '以左翼為基準', BLUE),
        ('一路縱隊', '以先頭為基準', GREEN),
    ]
    for i, (a, b, c) in enumerate(rows):
        D.box(492, yy + i * 44, 696, yy + i * 44 + 36, fill=WHITE, outline=LINE)
        D.text(a, 502, yy + i * 44 + 18, size=14, fill=INK, anchor='lm')
        D.text(b, 686, yy + i * 44 + 18, size=14, fill=c, anchor='rm', bold=True)
    D.text('「立——定」後先對正、看齊，先稍息', 594, 320, size=12, fill=SLATE, anchor='mm')

    D.note(12, 354, 708, 462, [
        '‧ 排（Rank）＝左右一橫線｜行（File）＝前後一直線。',
        '‧ 間隔＝左右相鄰距離｜距離＝前後距離｜翼＝兩端。',
        '‧ 標號員＝標號位置嘅隊員，FALL IN 最先到做右標號員。',
        '‧ 空行＝人數唔夠時留空位（三排留最左第二行中排）。',
    ], title='講清楚呢幾個字')
    return D


# ══════════════════════════════════════════════════════════════════
# ⑦ 行進・立定
# ══════════════════════════════════════════════════════════════════
def dia_march():
    D = Dia(720, 520)
    D.title('行進・立定', '步操手冊：步幅 750mm・116 步／分', h=52)

    y0 = D.panel(12, 62, 356, 376, '① 齊步（快步）行進')
    gy = y0 + 250
    D.line([(24, gy), (344, gy)], fill=SLATE, width=3)
    person_side(D, 118, y0 + 80, 164, facing=1)
    D.text('腳跟先著地', 200, y0 + 92, size=14, fill=INK, anchor='la')
    D.text('前手同肩平・後手拉後', 200, y0 + 116, size=13, fill=SLATE, anchor='la')
    D.text('打數 Left—Right—Left…', 200, y0 + 140, size=13, fill=GREEN, anchor='la')
    _dim(D, (72, gy + 12), (186, gy + 12), 8, '一步 750 毫米（30 吋）', lsize=12, ldy=14)

    y0 = D.panel(366, 62, 708, 376, '② 立定（Squad — halt）三步')
    gy2 = y0 + 224
    D.line([(378, gy2), (696, gy2)], fill=SLATE, width=3)
    for i, x in enumerate((432, 544, 648)):
        person_side(D, x, y0 + 56, 158, facing=1)
        D.num((x, gy2 + 24), i + 1, fill=GREEN, size=14, r=11)
        caps = ['再行一步\n750mm', '半步\n375mm', '後腳靠攏\n成立正']
        D.text(caps[i], x, gy2 + 42, size=13, fill=INK, anchor='ma', align='center')

    D.note(12, 386, 708, 512, [
        '‧ 中式「踏步——走」＝原地踏步；「立——定」：左腳再向前',
        '　大半步、腳尖向外約 30 度，右腳取捷徑靠攏。',
        '‧ 動令「定」喺左腳腳跟著地時發出。',
        '‧ 行進間轉彎／旗操／分列式＝訓練班範圍（步操手冊四至七章）。',
    ], title='要領')
    return D


BUILDERS = [
    ('drill-attention.avif', dia_attention),
    ('drill-standease.avif', dia_standease),
    ('drill-turns.avif', dia_turns),
    ('drill-salute.avif', dia_salute),
    ('drill-dress.avif', dia_dress),
    ('drill-formation.avif', dia_formation),
    ('drill-march.avif', dia_march),
]


def main():
    for _, fn in BUILDERS:
        fn()
    n = K.build_tc_font(K.STRINGS)
    print('造咗繁體優先字體：%s（%d 個字改指 zh-Hant 字形）' % (K.FONT_TC, n))
    K.FONT_READY = True
    K._FONT_CACHE.clear()
    for name, fn in BUILDERS:
        D = fn()
        out, size = D.save(name, png_preview=os.path.join(PREVIEW, name.replace('.avif', '.png')))
        print('✅ %-26s %dx%d  %d KB' % (name, size[0], size[1], os.path.getsize(out) // 1024))


if __name__ == '__main__':
    main()
