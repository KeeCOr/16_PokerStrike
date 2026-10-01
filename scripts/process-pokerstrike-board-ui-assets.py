from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "src" / "assets" / "art"
UI = ROOT / "src" / "assets" / "ui"

ENV_SRC = Path(
    r"C:\Users\오진우\.codex\generated_images\019e20ad-a82b-75e3-b715-88308fa4f6e1\ig_0e63be8aab79d4cb016a2a47857c88819194751b8516a28f04.png"
)
UI_SRC = Path(
    r"C:\Users\오진우\.codex\generated_images\019e20ad-a82b-75e3-b715-88308fa4f6e1\ig_0e63be8aab79d4cb016a2a47d971dc8191950e760dd775f5e1.png"
)

ENV_NAMES = [
    "board-tile",
    "board-tile-alt",
    "obstacle-stone",
    "obstacle-barricade",
    "spawn-gate",
    "base-core",
    "base-shield",
    "battle-label-frame",
]

UI_NAMES = [
    "button-action-gold",
    "button-action-cyan",
    "button-action-purple",
    "button-action-disabled",
    "button-upgrade-green",
    "button-upgrade-orange",
    "button-upgrade-blue",
    "button-danger-red",
    "tab-active",
    "tab-inactive",
    "panel-resource",
    "badge-wave",
]


def remove_green(im):
    im = im.convert("RGBA")
    px = im.load()
    width, height = im.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = px[x, y]
            if g > 155 and g > r * 1.4 and g > b * 1.4:
                px[x, y] = (r, g, b, 0)
            elif g > 120 and g > r * 1.2 and g > b * 1.2:
                alpha = max(0, min(255, int((max(r, b) / max(g, 1)) * 255)))
                px[x, y] = (r, g, b, alpha)
    return im


def alpha_bbox(im):
    alpha = im.getchannel("A")
    return alpha.getbbox()


def crop_sheet(src, names, cols, rows, out_dir, final_size=None):
    out_dir.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(src).convert("RGBA")
    cell_w = sheet.width / cols
    cell_h = sheet.height / rows

    for i, name in enumerate(names):
        col = i % cols
        row = i // cols
        x0 = round(col * cell_w)
        y0 = round(row * cell_h)
        x1 = round((col + 1) * cell_w)
        y1 = round((row + 1) * cell_h)
        sprite = remove_green(sheet.crop((x0, y0, x1, y1)))
        bbox = alpha_bbox(sprite)
        if bbox:
            sprite = sprite.crop(bbox)
        if final_size:
            sprite.thumbnail(final_size, Image.Resampling.LANCZOS)
            canvas = Image.new("RGBA", final_size, (0, 0, 0, 0))
            canvas.alpha_composite(sprite, ((final_size[0] - sprite.width) // 2, (final_size[1] - sprite.height) // 2))
            sprite = canvas
        sprite.save(out_dir / f"{name}.png")


def main():
    crop_sheet(ENV_SRC, ENV_NAMES, 4, 2, ART / "environment", (256, 256))
    crop_sheet(UI_SRC, UI_NAMES, 4, 3, UI / "generated", (384, 160))


if __name__ == "__main__":
    main()
