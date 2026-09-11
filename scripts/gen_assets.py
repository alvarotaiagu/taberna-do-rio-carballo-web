"""Genera el emblema/icono de marca y la imagen Open Graph para A Taberna do Rio.
No hay logo real del negocio disponible, así que se crea un emblema propio
(no una foto) con la paleta de la web: iniciales "TR" sobre un círculo teal,
con una onda estilizada (el río) debajo. Se usa consistentemente en favicon,
iconos de "añadir a inicio" y como marca en el pie de página (inline SVG).
"""
import math
from PIL import Image, ImageDraw, ImageFont

TEAL = (31, 79, 68)        # --river-deep
TEAL_MID = (39, 111, 96)   # --river
GOLD = (196, 148, 59)      # --gold
CREAM = (250, 246, 236)    # --paper
INK = (26, 36, 32)         # --ink

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"


def wave_path(w, h, y_center, amplitude, cycles, phase=0):
    pts = []
    for x in range(0, w + 1, 4):
        y = y_center + amplitude * math.sin((x / w) * cycles * 2 * math.pi + phase)
        pts.append((x, y))
    return pts


def make_icon(size, out_path, rounded=True):
    scale = 4
    S = size * scale
    base = Image.new("RGBA", (S, S), (0, 0, 0, 0))

    # Circle (or rounded-square) mask that everything below gets clipped to
    pad = int(S * 0.04)
    circle_mask = Image.new("L", (S, S), 0)
    cmd = ImageDraw.Draw(circle_mask)
    if rounded:
        cmd.ellipse([pad, pad, S - pad, S - pad], fill=255)
    else:
        cmd.rounded_rectangle([0, 0, S, S], radius=int(S * 0.22), fill=255)

    # Flat teal fill, then a slightly darker riverbank band at the bottom
    layer = Image.new("RGBA", (S, S), TEAL_MID + (255,))
    ld = ImageDraw.Draw(layer)
    ld.rectangle([0, int(S * 0.78), S, S], fill=TEAL + (255,))

    # Wave line (river) sitting right on top of the band's edge
    wave_y = int(S * 0.78)
    pts = wave_path(S, S, wave_y, S * 0.03, 1.6)
    ld.line(pts, fill=GOLD, width=max(2, int(S * 0.02)))

    # Initials
    font_size = int(S * 0.34)
    font = ImageFont.truetype(FONT_BOLD, font_size)
    text = "TR"
    bbox = ld.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (S - tw) / 2 - bbox[0]
    ty = (S * 0.38) - th / 2 - bbox[1]
    ld.text((tx, ty), text, font=font, fill=CREAM)

    base.paste(layer, (0, 0), circle_mask)
    img = base.resize((size, size), Image.LANCZOS)
    img.save(out_path)
    print("wrote", out_path, size)


def make_og_image(out_path):
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), TEAL)
    d = ImageDraw.Draw(img)

    # Gradient wash teal -> deep teal
    for y in range(H):
        t = y / H
        r = int(TEAL_MID[0] * (1 - t) + TEAL[0] * t)
        g = int(TEAL_MID[1] * (1 - t) + TEAL[1] * t)
        b = int(TEAL_MID[2] * (1 - t) + TEAL[2] * t)
        d.line([(0, y), (W, y)], fill=(r, g, b))

    # River waves near bottom
    for i, (amp, cyc, yc, width, color) in enumerate([
        (18, 2.2, H - 70, 6, GOLD),
        (26, 1.6, H - 40, 10, (20, 60, 52)),
    ]):
        pts = wave_path(W, H, yc, amp, cyc, phase=i)
        d.line(pts, fill=color, width=width)

    # Emblem circle top-left-ish
    cx, cy, r = 150, 150, 78
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=CREAM)
    font_tr = ImageFont.truetype(FONT_BOLD, 62)
    text = "TR"
    bbox = d.textbbox((0, 0), text, font=font_tr)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((cx - tw / 2 - bbox[0], cy - th / 2 - bbox[1] - 6), text, font=font_tr, fill=TEAL)

    # Title
    font_title = ImageFont.truetype(FONT_BOLD, 74)
    d.text((80, 260), "A Taberna do Rio", font=font_title, fill=CREAM)

    font_sub = ImageFont.truetype(FONT_BOLD, 32)
    d.text((82, 350), "Terraza junto al Anllóns · Carballo", font=font_sub, fill=(224, 214, 190))

    img.save(out_path, quality=88)
    print("wrote", out_path)


if __name__ == "__main__":
    import os
    base = "assets/img/logo"
    os.makedirs(base, exist_ok=True)
    make_icon(96, f"{base}/icon-96.png")
    make_icon(180, f"{base}/icon-180.png")
    make_icon(192, f"{base}/icon-192.png")
    make_icon(512, f"{base}/icon-512.png")
    os.makedirs("assets/img/web", exist_ok=True)
    make_og_image("assets/img/web/og-image.jpg")
