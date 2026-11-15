#!/usr/bin/env python3
"""Vetoriza a arte do save the date (traço azul sobre fundo creme) em SVGs.

Uso:
    python3 tools/vectorize.py [source/save-the-date.jpg] [public/art]

Requisitos: Pillow, numpy, scipy e o binário `potrace` (apt install potrace).

Como funciona:
  1. Converte a imagem em máscara de tinta (canal vermelho escuro = tinta azul).
  2. Separa a arte em componentes conectados: a moldura (guirlandas, concha,
     querubins) é um único traço contínuo; a faixa é outro; cada letra/palavra
     é um componente pequeno. Isso permite gerar a moldura SEM texto e a faixa
     vazia, além dos letterings isolados.
  3. Cada peça é ampliada, suavizada e passada no potrace; o SVG final usa
     fill="currentColor" para poder ser recolorido via CSS.

As regiões estão em coordenadas relativas (0–1) da imagem original, então um
scan em alta resolução com o mesmo enquadramento funciona sem ajustes; se o
enquadramento mudar, ajuste PIECES/TEXT_BOXES abaixo.
"""
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "source/save-the-date.jpg")
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "public/art")

# Referência: imagem de 1427x2000. Boxes = (x0, y0, x1, y1) em pixels dessa referência.
REF_W, REF_H = 1427, 2000
TEXT_BOXES = {
    "lettering-save-the-date": (400, 590, 1020, 725),
    "lettering-data": (495, 726, 935, 835),
    "lettering-nomes": (330, 915, 1080, 1090),
    "lettering-local": (480, 1160, 945, 1370),
}
BANNER_BOX = (205, 890, 1232, 1200)
# Peças recortadas da moldura (já sem texto).
CROPS = {
    "concha": (455, 118, 990, 545),
    "moldura-esquerda": (30, 120, 475, 1890),
    "moldura-direita": (955, 120, 1410, 1890),
    "querubim-esquerdo": (75, 1225, 560, 1890),
    "querubim-direito": (880, 1225, 1360, 1890),
    "ramo-esquerdo": (250, 695, 380, 910),
    "ramo-direito": (1060, 695, 1185, 910),
    "guirlanda-esquerda": (30, 120, 460, 640),
    "guirlanda-direita": (990, 120, 1410, 640),
}
SCALE = 3  # ampliação antes do potrace (curvas mais suaves)
INK_THRESHOLD = 175  # canal R abaixo disso = tinta


def box_px(box, w, h):
    sx, sy = w / REF_W, h / REF_H
    x0, y0, x1, y1 = box
    return int(x0 * sx), int(y0 * sy), int(x1 * sx), int(y1 * sy)


def inside(sl, box):
    ys, xs = sl
    x0, y0, x1, y1 = box
    return xs.start >= x0 and xs.stop <= x1 and ys.start >= y0 and ys.stop <= y1


def trace(gray_crop: Image.Image, name: str, view_w: int, view_h: int):
    """gray_crop: L image, 0 = tinta, 255 = papel."""
    big = gray_crop.resize((gray_crop.width * SCALE, gray_crop.height * SCALE), Image.LANCZOS)
    big = big.filter(ImageFilter.GaussianBlur(SCALE * 0.6))
    bw = big.point(lambda v: 0 if v < 150 else 255, "1")
    with tempfile.TemporaryDirectory() as td:
        bmp = Path(td) / "in.bmp"
        svg = Path(td) / "out.svg"
        bw.save(bmp)
        subprocess.run(
            ["potrace", str(bmp), "-s", "-o", str(svg), "-t", "6", "-a", "1.0",
             "-O", "0.4", "--flat"],
            check=True,
        )
        raw = svg.read_text()
    # Extrai os paths e o transform gerados pelo potrace.
    g = re.search(r"<g transform=\"([^\"]+)\"[^>]*>(.*?)</g>", raw, re.S)
    transform, body = g.group(1), g.group(2)
    # Ajusta escala do transform para o viewBox em pixels da imagem original.
    transform = re.sub(
        r"scale\(([-\d.]+),([-\d.]+)\)",
        lambda m: f"scale({float(m.group(1)) / SCALE:.6f},{float(m.group(2)) / SCALE:.6f})",
        transform,
    )
    transform = re.sub(
        r"translate\(([-\d.]+),([-\d.]+)\)",
        lambda m: f"translate({float(m.group(1)) / SCALE:.3f},{float(m.group(2)) / SCALE:.3f})",
        transform,
    )
    body = re.sub(r"\s+", " ", body).strip()
    out = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view_w} {view_h}" '
        f'fill="currentColor" role="img" aria-hidden="true">'
        f'<g transform="{transform}" stroke="none">{body}</g></svg>\n'
    )
    (OUT / f"{name}.svg").write_text(out)
    print(f"{name}.svg  {view_w}x{view_h}  {len(out) // 1024} KB")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    img = Image.open(SRC).convert("RGB")
    w, h = img.size
    red = np.asarray(img)[..., 0].astype(np.uint8)
    ink = red < INK_THRESHOLD

    lab, n = nd.label(ink, structure=np.ones((3, 3)))
    slices = nd.find_objects(lab)
    sizes = nd.sum(ink, lab, range(1, n + 1))

    text_boxes = {k: box_px(b, w, h) for k, b in TEXT_BOXES.items()}
    banner_box = box_px(BANNER_BOX, w, h)
    in_banner = [i for i, sl in enumerate(slices, start=1) if sl is not None and inside(sl, banner_box)]
    banner_id = max(in_banner, key=lambda i: sizes[i - 1])  # maior traço dentro da faixa = a própria faixa
    groups = {k: [] for k in text_boxes}
    frame_ids = []
    for i, sl in enumerate(slices, start=1):
        if sl is None:
            continue
        if i == banner_id:
            continue
        for k, b in text_boxes.items():
            if inside(sl, b):
                groups[k].append(i)
                break
        else:
            frame_ids.append(i)

    def layer(ids):
        """Imagem cinza contendo só os componentes `ids` (resto vira papel)."""
        # Dilata 2px para manter o antialias ao redor dos traços.
        halo = nd.binary_dilation(np.isin(lab, ids), iterations=2)
        return Image.fromarray(np.where(halo, red, 255).astype(np.uint8), "L")

    frame = layer(frame_ids)
    # Moldura completa (sem textos nem faixa)
    trace(frame, "moldura", w, h)
    # Faixa vazia
    bx0, by0, bx1, by1 = banner_box
    trace(layer([banner_id]).crop(banner_box), "faixa", bx1 - bx0, by1 - by0)
    # Letterings
    for k, ids in groups.items():
        x0, y0, x1, y1 = text_boxes[k]
        trace(layer(ids).crop((x0, y0, x1, y1)), k, x1 - x0, y1 - y0)
    # Recortes da moldura
    for k, b in CROPS.items():
        x0, y0, x1, y1 = box_px(b, w, h)
        trace(frame.crop((x0, y0, x1, y1)), k, x1 - x0, y1 - y0)


if __name__ == "__main__":
    main()
