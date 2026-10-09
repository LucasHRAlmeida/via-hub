"""QR vetorial do WhatsApp Business: qrcode==8.2 e fontTools.

O SVG é a fonte do PNG de divulgação e do QR incorporado à revista.
Nenhuma dependência Python é necessária para servir a página publicada.
"""

from pathlib import Path

import qrcode
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
TARGET = "https://wa.me/message/AFWK5RO4256SG1"
OUTPUT = ROOT / "assets/qr-whatsapp-business-via.svg"
BACKGROUND = "#fcf9f2"
INK = "#12161a"
ACCENT = "#993322"
QUIET = 4

qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=0)
qr.add_data(TARGET)
qr.make(fit=True)
matrix = qr.get_matrix()
size = len(matrix)
extent = size + QUIET * 2
eyes = [(0, 0), (size - 7, 0), (0, size - 7)]

parts = [
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {extent} {extent}" width="{extent * 30}" height="{extent * 30}" role="img" aria-labelledby="title desc">',
    '<title id="title">WhatsApp Business - Dr Lucas HR | VIA</title>',
    f'<desc id="desc">Código QR para iniciar uma conversa: {TARGET}. Margem livre de quatro módulos e correção de erros H.</desc>',
    f'<rect width="{extent}" height="{extent}" fill="{BACKGROUND}"/>',
    f'<g fill="{INK}">',
]
for y, row in enumerate(matrix):
    for x, dark in enumerate(row):
        if dark and not any(ex <= x < ex + 7 and ey <= y < ey + 7 for ex, ey in eyes):
            parts.append(f'<rect x="{x + QUIET}" y="{y + QUIET}" width="1" height="1" rx=".12"/>')
parts.append('</g>')
for x, y in eyes:
    x, y = x + QUIET, y + QUIET
    parts.extend([
        f'<rect x="{x}" y="{y}" width="7" height="7" rx=".6" fill="{ACCENT}"/>',
        f'<rect x="{x + 1}" y="{y + 1}" width="5" height="5" rx=".35" fill="{BACKGROUND}"/>',
        f'<rect x="{x + 2}" y="{y + 2}" width="3" height="3" rx=".25" fill="{ACCENT}"/>',
    ])

# Marca VIA pequena: traçados da fonte local, sem depender de fontes do leitor.
font = TTFont(ROOT / "assets/fonts/parar/cinzel-normal-700.ttf")
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
names = [cmap[ord(char)] for char in "VIA"]
advance = sum(font["hmtx"][name][0] for name in names)
scale = 4.8 / advance
center = extent / 2
parts.append(f'<rect x="{center - 3.35:g}" y="{center - 2.1:g}" width="6.7" height="4.2" rx=".65" fill="{BACKGROUND}" stroke="{ACCENT}" stroke-width=".1"/>')
parts.append(f'<g fill="{INK}" transform="translate({center - 2.4:g} {center + .95:g}) scale({scale:.8f} {-scale:.8f})">')
offset = 0
for name in names:
    pen = SVGPathPen(glyphs)
    glyphs[name].draw(pen)
    parts.append(f'<path transform="translate({offset} 0)" d="{pen.getCommands()}"/>')
    offset += font["hmtx"][name][0]
parts.extend(['</g>', '</svg>'])
OUTPUT.write_text('\n'.join(parts) + '\n', encoding='utf-8')
print(f'{OUTPUT.relative_to(ROOT)}: QR v{qr.version}, {size} módulos, destino {TARGET}')
