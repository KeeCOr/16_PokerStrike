from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "src" / "assets" / "art"
VFX_SRC = Path(r"C:\Users\오진우\.codex\generated_images\019e20ad-a82b-75e3-b715-88308fa4f6e1\ig_0af8a2c73d99879c016a2a29ab5b348191a440ca7a7c584ead.png")

VFX = [
    "fire-projectile", "fire-impact", "ice-projectile", "ice-impact",
    "club-projectile", "armor-break-impact", "spade-projectile", "pierce-impact",
    "aura-ring", "magic-burst", "hit-spark", "shield-ripple",
]


def remove_key(im):
    im = im.convert("RGBA")
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if r < 95 and g > 150 and b < 95:
                px[x, y] = (r, g, b, 0)
            elif g > max(r, b) + 45 and r < 145 and b < 145:
                alpha = int(a * max(8, r, b, 255 - g) / 120)
                px[x, y] = (r, max(r, b, 90), b, alpha)
    return im


def trim_and_fit(im, size=256, margin=10):
    bbox = im.getbbox()
    if not bbox:
        return Image.new("RGBA", (size, size), (0, 0, 0, 0))
    crop = im.crop(bbox)
    max_side = size - margin * 2
    scale = min(max_side / crop.width, max_side / crop.height)
    new_size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    crop = crop.resize(new_size, Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.alpha_composite(crop, ((size - new_size[0]) // 2, (size - new_size[1]) // 2))
    return out


def main():
    out_dir = ART / "vfx"
    out_dir.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(VFX_SRC).convert("RGBA")
    cols, rows = 4, 3
    cell_w = sheet.width / cols
    cell_h = sheet.height / rows
    for index, name in enumerate(VFX):
        col = index % cols
        row = index // cols
        box = (
            round(col * cell_w),
            round(row * cell_h),
            round((col + 1) * cell_w),
            round((row + 1) * cell_h),
        )
        sprite = trim_and_fit(remove_key(sheet.crop(box)))
        sprite.save(out_dir / f"{name}.png")


if __name__ == "__main__":
    main()
