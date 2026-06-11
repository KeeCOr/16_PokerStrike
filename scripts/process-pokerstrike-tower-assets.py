from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "src" / "assets" / "art"
TOWER_SRC = Path(
    r"C:\Users\오진우\.codex\generated_images\019e20ad-a82b-75e3-b715-88308fa4f6e1\ig_0e63be8aab79d4cb016a2a5e3a484881918227d1a9100dc37d.png"
)

TOWERS = ["H", "D", "C", "S"]


def remove_green(im):
    im = im.convert("RGBA")
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if g > 150 and g > r * 1.35 and g > b * 1.35:
                px[x, y] = (r, g, b, 0)
            elif g > 120 and g > r * 1.2 and g > b * 1.2:
                alpha = max(0, min(255, int(a * max(r, b, 30) / max(g, 1))))
                px[x, y] = (r, max(r, b, 85), b, alpha)
    return im


def trim_and_fit(im, size=256, margin=18):
    bbox = im.getbbox()
    if not bbox:
        return Image.new("RGBA", (size, size), (0, 0, 0, 0))
    crop = im.crop(bbox)
    max_side = size - margin * 2
    scale = min(max_side / crop.width, max_side / crop.height)
    new_size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    crop = crop.resize(new_size, Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.alpha_composite(crop, ((size - crop.width) // 2, (size - crop.height) // 2))
    return out


def main():
    out_dir = ART / "towers"
    out_dir.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(TOWER_SRC).convert("RGBA")
    cell_w = sheet.width / 2
    cell_h = sheet.height / 2
    for index, name in enumerate(TOWERS):
        col = index % 2
        row = index // 2
        box = (
            round(col * cell_w),
            round(row * cell_h),
            round((col + 1) * cell_w),
            round((row + 1) * cell_h),
        )
        trim_and_fit(remove_green(sheet.crop(box))).save(out_dir / f"{name}.png")


if __name__ == "__main__":
    main()
