from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "src" / "assets" / "art"
UI = ROOT / "src" / "assets" / "ui" / "generated"
OUT_MAIN = ROOT / "docs" / "PokerStrike_01_플레이예시.png"
OUT_ALT = ROOT / "docs" / "PokerStrike_플레이예시_현재구현.png"

W, H = 640, 960
CELL = 76
COLS, ROWS = 7, 9
GX = int((W - COLS * CELL) / 2)
GY = 52
PANEL_Y = 752


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
}


def rounded(draw, xy, r, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)


def text_center(draw, xy, text, fill, f):
    x, y = xy
    b = draw.textbbox((0, 0), text, font=f)
    draw.text((x - (b[2] - b[0]) / 2, y - (b[3] - b[1]) / 2), text, fill=fill, font=f)


def paste_png(canvas, path, center, size, glow=None):
    im = Image.open(path).convert("RGBA")
    if isinstance(size, tuple):
        im = im.resize(size, Image.Resampling.LANCZOS)
    else:
        im.thumbnail((size, size), Image.Resampling.LANCZOS)
    x = int(center[0] - im.width / 2)
    y = int(center[1] - im.height / 2)
    if glow:
        alpha = im.getchannel("A").filter(ImageFilter.GaussianBlur(6))
        aura = Image.new("RGBA", im.size, glow)
        aura.putalpha(alpha)
        canvas.alpha_composite(aura, (x, y))
    canvas.alpha_composite(im, (x, y))


def paste_asset(canvas, rel, center, size, glow=None):
    paste_png(canvas, ART / rel, center, size, glow)


def paste_ui(canvas, name, center, size):
    paste_png(canvas, UI / name, center, size)


def paste_asset_rotated(canvas, rel, center, size, angle, glow=None):
    im = Image.open(ART / rel).convert("RGBA")
    im.thumbnail((size, size), Image.Resampling.LANCZOS)
    im = im.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
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


def draw_buildable_effect(draw, x0, y0):
    pad = 9
    corner = 15
    x1 = x0 + CELL
    y1 = y0 + CELL
    color = (55, 230, 255, 158)
    fill = (55, 230, 255, 10)
    draw.rectangle((x0 + pad, y0 + pad, x1 - pad, y1 - pad), fill=fill, outline=(55, 230, 255, 70), width=1)
    segments = [
        ((x0 + pad, y0 + pad + corner), (x0 + pad, y0 + pad), (x0 + pad + corner, y0 + pad)),
        ((x1 - pad - corner, y0 + pad), (x1 - pad, y0 + pad), (x1 - pad, y0 + pad + corner)),
        ((x1 - pad, y1 - pad - corner), (x1 - pad, y1 - pad), (x1 - pad - corner, y1 - pad)),
        ((x0 + pad + corner, y1 - pad), (x0 + pad, y1 - pad), (x0 + pad, y1 - pad - corner)),
    ]
    for a, b, c in segments:
        draw.line((a, b, c), fill=color, width=2, joint="curve")


def main():
    img = Image.new("RGBA", (W, H), "#07111d")
    draw = ImageDraw.Draw(img)

    for y in range(H):
        shade = int(12 + 16 * (y / H))
        draw.line((0, y, W, y), fill=(5, shade, 27 + shade // 3, 255))
    draw.rectangle((0, 0, W, PANEL_Y), fill=(8, 17, 29, 245))

    paste_ui(img, "badge-wave.png", (320, 26), (214, 52))
    text_center(draw, (320, 26), "Wave 3", "#bceeff", F["body_b"])
    text_center(draw, (392, 26), "적 18 / 42", "#ffbd7a", F["small"])
    paste_ui(img, "panel-resource.png", (530, 26), (212, 48))
    paste_ui(img, "resource-gold.png", (456, 26), (24, 24))
    text_center(draw, (489, 26), "38", "#ffd766", F["mid"])
    paste_ui(img, "resource-gem.png", (548, 26), (24, 24))
    text_center(draw, (581, 26), "2", "#dca6ff", F["body_b"])

    for r in range(ROWS):
      for c in range(COLS):
        x0 = GX + c * CELL
        y0 = GY + r * CELL
        tile = "environment/board-tile.png" if (r + c) % 2 == 0 else "environment/board-tile-alt.png"
        paste_asset(img, tile, cell_center(c, r), CELL + 3)
        draw.rectangle((x0 + 2, y0 + 2, x0 + CELL - 2, y0 + CELL - 2), fill=(2, 6, 16, 132))
        draw_buildable_effect(draw, x0, y0)
        draw.rectangle((x0, y0, x0 + CELL, y0 + CELL), outline="#24475f")

    obstacles = [(1, 2), (2, 2), (5, 3), (6, 3), (0, 5), (1, 5), (4, 6), (5, 6), (2, 7), (3, 7)]
    for idx, (c, r) in enumerate(obstacles):
        rel = "environment/obstacle-stone.png" if idx % 2 == 0 else "environment/obstacle-barricade.png"
        paste_asset(img, rel, cell_center(c, r), CELL + 6, (80, 120, 160, 45))

    paste_asset(img, "environment/spawn-gate.png", cell_center(3, 0), CELL + 12, (255, 60, 60, 60))
    paste_asset(img, "environment/base-core.png", cell_center(3, 8), CELL + 16, (80, 255, 120, 60))
    bx, by = cell_center(3, 8)
    draw.rectangle((bx - 38, by - 35, bx + 38, by - 29), fill="#333333")
    draw.rectangle((bx - 38, by - 35, bx + 16, by - 29), fill="#44ff44")
    for rel, c, r, size, glow in [
        ("towers/H.png", 2, 5, 44, (255, 90, 50, 45)),
        ("towers/D.png", 4, 4, 54, (80, 220, 255, 80)),
        ("towers/C.png", 1, 6, 40, (80, 255, 130, 40)),
        ("towers/S.png", 5, 6, 58, (255, 225, 90, 90)),
    ]:
        paste_asset(img, rel, cell_center(c, r), size, glow)

    for rel, c, r, size in [
        ("monsters/basic.png", 3, 1, 48), ("monsters/runner.png", 4, 2, 48),
        ("monsters/swarm.png", 2, 3, 44), ("monsters/freezer.png", 5, 3, 48),
        ("monsters/armored.png", 3, 4, 50), ("monsters/boss.png", 1, 1, 68),
        ("monsters/shielded.png", 4, 1, 54), ("monsters/aerial.png", 6, 2, 50),
    ]:
        paste_asset(img, rel, cell_center(c, r), size, (255, 80, 80, 55))
        cx, cy = cell_center(c, r)
        draw.rectangle((cx - 17, cy - 28, cx + 17, cy - 24), fill="#2a2a2a")
        draw.rectangle((cx - 17, cy - 28, cx + 8, cy - 24), fill="#ff4d4d")

    paste_asset_rotated(img, "vfx/fire-projectile.png", (260, 430), 58, -33, (255, 120, 40, 80))
    paste_asset(img, "vfx/fire-impact.png", cell_center(4, 2), 58, (255, 80, 40, 70))
    paste_asset_rotated(img, "vfx/ice-projectile.png", (404, 334), 54, -48, (80, 210, 255, 70))
    paste_asset(img, "vfx/ice-impact.png", cell_center(5, 3), 60, (80, 210, 255, 70))
    paste_asset_rotated(img, "vfx/spade-projectile.png", (488, 290), 62, -15, (255, 210, 80, 60))
    paste_asset(img, "vfx/pierce-impact.png", cell_center(6, 2), 52, (255, 230, 120, 55))
    paste_asset(img, "vfx/aura-ring.png", cell_center(4, 4), 88, (255, 238, 80, 50))
    text_center(draw, (410, 255), "-86", "#ff6655", F["mid"])
    text_center(draw, (475, 305), "-42", "#ffdd66", F["body_b"])

    draw.rectangle((0, PANEL_Y, W, H), fill="#07111d")
    rounded(draw, (14, PANEL_Y + 2, 626, PANEL_Y + 42), 5, "#050b14", "#17496a", 2)
    tabs = [("카드패", 112, "tab-active.png"), ("업그레이드", 320, "tab-inactive.png"), ("강화 목록", 528, "tab-inactive.png")]
    for label, x, asset in tabs:
        paste_ui(img, asset, (x, PANEL_Y + 18), (210, 42))
        text_center(draw, (x, PANEL_Y + 20), label, "#ffffff" if label == "카드패" else "#95a4b8", F["body_b"])

    rounded(draw, (14, PANEL_Y + 45, 626, PANEL_Y + 127), 5, "#0b1725", "#2d6688", 1)
    rounded(draw, (14, PANEL_Y + 129, 626, PANEL_Y + 191), 5, "#081522", "#2d6688", 1)
    rounded(draw, (284, 790, 356, 806), 4, "#08131f", "#2d6688", 1)
    text_center(draw, (320, 798), "족보: 원페어", "#ffdd88", F["small"])
    rounded(draw, (419, 790, 491, 806), 4, "#08131f", "#2d6688", 1)
    text_center(draw, (455, 798), "공용패", "#9ee6ff", F["tiny"])
    rounded(draw, (502, 790, 578, 806), 4, "#08131f", "#2d6688", 1)
    text_center(draw, (540, 798), "무덤 7", "#d8b6ff", F["tiny"])

    for i, card in enumerate([("S", "A"), ("D", "7"), ("C", "K"), ("H", "10"), ("S", "Q")]):
        draw_card(draw, 53 + i * 56, 840, *card)
    for i, card in enumerate([("H", "9"), ("D", "9")]):
        draw_card(draw, 475 + i * 51, 840, *card)

    rounded(draw, (216, 876, 424, 898), 5, "#091421", "#40546d", 1)
    text_center(draw, (320, 887), "소환될 족보: 원페어", "#ffdd88", F["body_b"])
    buttons = [
        ("마법", 112, 184, "button-action-purple.png"),
        ("소환 2G", 320, 196, "button-action-gold.png"),
        ("교체 4G", 528, 184, "button-action-cyan.png"),
    ]
    for label, x, w, asset in buttons:
        paste_ui(img, asset, (x, 924), (w + 34, 60))
        text_center(draw, (x, 926), label, "#ffffff", F["mid"])

    OUT_MAIN.parent.mkdir(parents=True, exist_ok=True)
    rgb = img.convert("RGB")
    rgb.save(OUT_MAIN, quality=95)
    rgb.save(OUT_ALT, quality=95)


if __name__ == "__main__":
    main()
