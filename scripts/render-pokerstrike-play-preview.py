from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "src" / "assets" / "art"
OUT_MAIN = ROOT / "docs" / "PokerStrike_01_플레이예시.png"
OUT_ALT = ROOT / "docs" / "PokerStrike_플레이예시_현재구현.png"

W, H = 640, 960
CELL = 76
COLS, ROWS = 7, 9
GX = int((W - COLS * CELL) / 2)
GY = 28
PANEL_Y = 744


def font(size, bold=False):
    candidates = [
        Path(r"C:\Windows\Fonts\malgunbd.ttf" if bold else r"C:\Windows\Fonts\malgun.ttf"),
        Path(r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf"),
    ]
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


F = {
    "tiny": font(10),
    "small": font(12),
    "body": font(14),
    "body_b": font(14, True),
    "mid": font(16, True),
    "big": font(22, True),
    "hero": font(30, True),
}


def rounded(draw, xy, r, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)


def text_center(draw, xy, s, fill, f):
    x, y = xy
    b = draw.textbbox((0, 0), s, font=f)
    draw.text((x - (b[2] - b[0]) / 2, y - (b[3] - b[1]) / 2), s, fill=fill, font=f)


def paste_asset(canvas, rel, center, size, glow=None):
    im = Image.open(ART / rel).convert("RGBA")
    im.thumbnail((size, size), Image.Resampling.LANCZOS)
    x = int(center[0] - im.width / 2)
    y = int(center[1] - im.height / 2)
    if glow:
        alpha = im.getchannel("A").filter(ImageFilter.GaussianBlur(6))
        aura = Image.new("RGBA", im.size, glow)
        aura.putalpha(alpha)
        canvas.alpha_composite(aura, (x, y))
    canvas.alpha_composite(im, (x, y))


def cell_center(c, r):
    return GX + c * CELL + CELL / 2, GY + r * CELL + CELL / 2


def draw_card(draw, x, y, suit, value):
    suit_color = {"H": "#e85555", "D": "#4fb8ff", "C": "#4ecb6a", "S": "#d8c26a"}[suit]
    suit_icon = {"H": "♥", "D": "♦", "C": "♣", "S": "♠"}[suit]
    rounded(draw, (x - 25, y - 32, x + 25, y + 32), 6, "#263142", suit_color, 2)
    rounded(draw, (x - 20, y - 27, x + 20, y + 27), 4, "#efe8dc", "#ffffff", 1)
    draw.rectangle((x - 15, y - 26, x + 15, y - 14), fill="#101a27")
    text_center(draw, (x, y - 19), suit_icon, suit_color, F["small"])
    text_center(draw, (x, y + 5), value, "#151a22", F["big"])
    text_center(draw, (x, y + 24), suit_icon, suit_color, F["mid"])


def main():
    img = Image.new("RGBA", (W, H), "#07111d")
    draw = ImageDraw.Draw(img)

    # Background bands
    for y in range(H):
        shade = int(12 + 16 * (y / H))
        draw.line((0, y, W, y), fill=(5, shade, 27 + shade // 3, 255))
    draw.rectangle((0, 0, W, 744), fill=(8, 17, 29, 245))

    # Top HUD
    rounded(draw, (14, 0, 294, 30), 5, "#1d1b21", "#ffd766", 1)
    text_center(draw, (88, 15), "골드 38", "#ffd766", F["mid"])
    text_center(draw, (220, 15), "보석 2", "#dca6ff", F["body_b"])
    rounded(draw, (340, 0, 588, 32), 5, "#0b2840", "#65d9ff", 2)
    text_center(draw, (420, 15), "웨이브 3", "#bceeff", F["body_b"])
    text_center(draw, (524, 15), "적 18 / 42", "#ffbd7a", F["small"])

    # Board
    for r in range(ROWS):
        for c in range(COLS):
            x0 = GX + c * CELL
            y0 = GY + r * CELL
            fill = "#0b1725" if (r + c) % 2 else "#0e1f32"
            draw.rectangle((x0 + 1, y0 + 1, x0 + CELL - 2, y0 + CELL - 2), fill=fill)
            draw.rectangle((x0, y0, x0 + CELL, y0 + CELL), outline="#24475f")
    obstacles = [(1, 2), (2, 2), (5, 3), (6, 3), (0, 5), (1, 5), (4, 6), (5, 6), (2, 7), (3, 7)]
    for c, r in obstacles:
        x0 = GX + c * CELL
        y0 = GY + r * CELL
        rounded(draw, (x0 + 7, y0 + 7, x0 + CELL - 7, y0 + CELL - 7), 8, "#253241", "#46596b", 2)
        draw.line((x0 + 14, y0 + 14, x0 + CELL - 14, y0 + CELL - 14), fill="#708090", width=2)

    # Spawn/base and message
    sx, sy = cell_center(3, 0)
    rounded(draw, (sx - 30, sy - 18, sx + 30, sy + 18), 6, "#3a1010", "#ff6666", 1)
    text_center(draw, (sx, sy), "스폰", "#ff8888", F["tiny"])
    bx, by = cell_center(3, 8)
    rounded(draw, (bx - 33, by - 23, bx + 33, by + 23), 7, "#11391f", "#44ff88", 2)
    text_center(draw, (bx, by), "본진", "#66ffaa", F["small"])
    draw.rectangle((bx - 38, by - 35, bx + 38, by - 29), fill="#333333")
    draw.rectangle((bx - 38, by - 35, bx + 16, by - 29), fill="#44ff44")
    rounded(draw, (160, 711, 480, 739), 5, "#08131f", "#2d6688", 1)
    text_center(draw, (320, 725), "적 방어력 감소 중", "#ffd166", F["body_b"])

    # Towers and monsters using real assets
    tower_positions = [("towers/H.png", 2, 5), ("towers/D.png", 4, 4), ("towers/C.png", 1, 6), ("towers/S.png", 5, 6)]
    for rel, c, r in tower_positions:
        paste_asset(img, rel, cell_center(c, r), 64, (80, 200, 255, 70))
    monster_positions = [
        ("monsters/basic.png", 3, 1, 48), ("monsters/runner.png", 4, 2, 48),
        ("monsters/swarm.png", 2, 3, 44), ("monsters/freezer.png", 5, 3, 48),
        ("monsters/armored.png", 3, 4, 50), ("monsters/boss.png", 1, 1, 68),
        ("monsters/shielded.png", 4, 1, 54), ("monsters/aerial.png", 6, 2, 50),
    ]
    for rel, c, r, size in monster_positions:
        paste_asset(img, rel, cell_center(c, r), size, (255, 80, 80, 55))
        cx, cy = cell_center(c, r)
        draw.rectangle((cx - 17, cy - 28, cx + 17, cy - 24), fill="#2a2a2a")
        draw.rectangle((cx - 17, cy - 28, cx + 8, cy - 24), fill="#ff4d4d")

    # Battle effects
    draw.line((cell_center(2, 5), cell_center(4, 2)), fill="#ffb347", width=2)
    draw.line((cell_center(4, 4), cell_center(5, 3)), fill="#7dd3ff", width=3)
    text_center(draw, (410, 255), "-86", "#ff6655", F["mid"])
    text_center(draw, (475, 305), "-42", "#ffdd66", F["body_b"])

    # Bottom HUD panels
    draw.rectangle((0, PANEL_Y, W, H), fill="#07111d")
    rounded(draw, (14, PANEL_Y + 2, 626, PANEL_Y + 42), 5, "#050b14", "#17496a", 2)
    tabs = [("카드패", 112, "#123b55", "#48d4ff"), ("업그레이드", 320, "#0a1522", "#314763"), ("강화 목록", 528, "#0a1522", "#314763")]
    for label, x, fill, stroke in tabs:
        rounded(draw, (x - 92, PANEL_Y + 2, x + 92, PANEL_Y + 34), 5, fill, stroke, 2 if label == "카드패" else 1)
        text_center(draw, (x, PANEL_Y + 18), label, "#ffffff" if label == "카드패" else "#95a4b8", F["body_b"])

    rounded(draw, (14, PANEL_Y + 45, 626, PANEL_Y + 127), 5, "#0b1725", "#2d6688", 1)
    rounded(draw, (14, PANEL_Y + 129, 626, PANEL_Y + 191), 5, "#081522", "#2d6688", 1)
    rounded(draw, (284, 782, 356, 798), 4, "#08131f", "#2d6688", 1)
    text_center(draw, (320, 790), "족보: 원페어", "#ffdd88", F["small"])
    rounded(draw, (419, 782, 491, 798), 4, "#08131f", "#2d6688", 1)
    text_center(draw, (455, 790), "공용패", "#9ee6ff", F["tiny"])
    rounded(draw, (502, 782, 578, 798), 4, "#08131f", "#2d6688", 1)
    text_center(draw, (540, 790), "무덤 7", "#d8b6ff", F["tiny"])

    cards = [("S", "A"), ("D", "7"), ("C", "K"), ("H", "10"), ("S", "Q")]
    for i, card in enumerate(cards):
        draw_card(draw, 53 + i * 56, 832, *card)
    shared = [("H", "9"), ("D", "9")]
    for i, card in enumerate(shared):
        draw_card(draw, 475 + i * 51, 832, *card)

    rounded(draw, (216, 868, 424, 890), 5, "#091421", "#40546d", 1)
    text_center(draw, (320, 879), "소환될 족보: 원페어", "#ffdd88", F["body_b"])
    buttons = [("마법", 112, 184, "#56308f", "#b776ff"), ("소환 2G", 320, 196, "#8a5a12", "#ffd766"), ("교체 4G", 528, 184, "#0f5878", "#58d5ff")]
    for label, x, w, fill, stroke in buttons:
        rounded(draw, (x - w / 2, 895, x + w / 2, 937), 7, fill, stroke, 2)
        text_center(draw, (x, 916), label, "#ffffff", F["mid"])

    img = img.convert("RGB")
    OUT_MAIN.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT_MAIN, quality=95)
    img.save(OUT_ALT, quality=95)


if __name__ == "__main__":
    main()
