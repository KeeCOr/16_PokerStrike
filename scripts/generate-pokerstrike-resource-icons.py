from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "assets" / "ui" / "generated"
SIZE = 128


def add_glow(img, xy, fill):
    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse(xy, fill=fill)
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(8)))


def make_gold():
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    add_glow(img, (22, 22, 106, 106), (255, 190, 48, 130))
    d = ImageDraw.Draw(img)
    d.ellipse((24, 24, 104, 104), fill=(255, 181, 48, 255), outline=(255, 239, 150, 255), width=5)
    d.ellipse((34, 30, 94, 90), fill=(255, 211, 84, 255))
    d.arc((36, 34, 92, 92), 205, 340, fill=(147, 86, 12, 180), width=5)
    d.polygon(
        [(64, 38), (70, 56), (89, 56), (74, 68), (80, 88), (64, 76), (48, 88), (54, 68), (39, 56), (58, 56)],
        fill=(255, 247, 174, 240),
    )
    return img


def make_gem():
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    add_glow(img, (20, 18, 108, 110), (196, 110, 255, 135))
    d = ImageDraw.Draw(img)
    d.polygon([(42, 24), (86, 24), (108, 50), (64, 108), (20, 50)], fill=(153, 82, 245, 255), outline=(232, 190, 255, 255))
    d.polygon([(42, 24), (64, 108), (20, 50)], fill=(99, 211, 255, 165))
    d.polygon([(86, 24), (108, 50), (64, 108)], fill=(104, 54, 205, 210))
    d.polygon([(42, 24), (86, 24), (64, 50)], fill=(238, 215, 255, 235))
    d.line([(20, 50), (108, 50), (86, 24), (64, 108), (42, 24), (20, 50)], fill=(255, 247, 255, 210), width=3)
    d.line([(42, 24), (64, 50), (86, 24)], fill=(255, 255, 255, 180), width=2)
    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    make_gold().save(OUT / "resource-gold.png")
    make_gem().save(OUT / "resource-gem.png")


if __name__ == "__main__":
    main()
