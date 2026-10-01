from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "src" / "assets" / "art"
MONSTER_SRC = Path(r"C:\Users\오진우\.codex\generated_images\019e20ad-a82b-75e3-b715-88308fa4f6e1\ig_073180e8a0969a2a016a265a5d6ba08191994ee5320da9c220.png")
TOWER_SRC = Path(r"C:\Users\오진우\.codex\generated_images\019e20ad-a82b-75e3-b715-88308fa4f6e1\ig_073180e8a0969a2a016a265b21e1ec8191b5d5eb34d2d81a67.png")

MONSTERS = [
    "basic", "tank", "runner", "aerial",
    "magicImmune", "splitter", "regen", "freezer",
    "boss", "armored", "swarm", "berserker",
    "shielded",
]

TOWERS = ["H", "D", "C", "S"]


def remove_key(im):
    im = im.convert("RGBA")
    px = im.load()
    for y in range(im.height):
      for x in range(im.width):
        r, g, b, a = px[x, y]
        if r < 105 and g > 145 and b < 105:
            px[x, y] = (r, g, b, 0)
        elif r < 150 and g > 145 and b < 135:
            alpha = int(a * max(8, r, b, 255 - g) / 120)
            px[x, y] = (r, min(g, max(r, b, 120)), b, alpha)
        elif g > max(r, b) + 55 and r < 145 and b < 145:
            px[x, y] = (r, max(r, b, 85), b, a)
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
    out.alpha_composite(crop, ((size - new_size[0]) // 2, (size - new_size[1]) // 2))
    return out


def crop_sheet(src, names, cols, rows, out_dir):
    out_dir.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(src).convert("RGBA")
    cell_w = sheet.width / cols
    cell_h = sheet.height / rows
    for index, name in enumerate(names):
        col = index % cols
        row = index // cols
        box = (
            round(col * cell_w),
            round(row * cell_h),
            round((col + 1) * cell_w),
            round((row + 1) * cell_h),
        )
        sprite = sheet.crop(box)
        sprite = trim_and_fit(remove_key(sprite))
        sprite.save(out_dir / f"{name}.png")


def main():
    crop_sheet(MONSTER_SRC, MONSTERS, 4, 4, ART / "monsters")
    crop_sheet(TOWER_SRC, TOWERS, 2, 2, ART / "towers")


if __name__ == "__main__":
    main()
