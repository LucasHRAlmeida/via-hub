#!/usr/bin/env python3
"""Renderiza uma edição Markdown da Revista VIA em PDF A4 pesquisável."""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

NAVY = colors.HexColor("#0C3E67")
TEAL = colors.HexColor("#0F7291")
INK = colors.HexColor("#16232E")
MUTED = colors.HexColor("#4A5A68")
RULE = colors.HexColor("#D6DEE5")
WASH = colors.HexColor("#F2F6F9")


def register_fonts() -> tuple[str, str]:
    candidates = [
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
        ("/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf", "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf"),
    ]
    for regular, bold in candidates:
        if Path(regular).exists() and Path(bold).exists():
            pdfmetrics.registerFont(TTFont("VIA-Regular", regular))
            pdfmetrics.registerFont(TTFont("VIA-Bold", bold))
            return "VIA-Regular", "VIA-Bold"
    return "Helvetica", "Helvetica-Bold"


REGULAR, BOLD = register_fonts()


def inline(text: str) -> str:
    links: list[tuple[str, str]] = []

    def stash_link(match: re.Match[str]) -> str:
        links.append((match.group(1), match.group(2)))
        return f"@@LINK{len(links) - 1}@@"

    text = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", stash_link, text)
    text = html.escape(text, quote=False)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", text)
    text = re.sub(r"`([^`]+)`", r"<font name='Courier'>\1</font>", text)
    for i, (label, url) in enumerate(links):
        replacement = f"<link href='{html.escape(url, quote=True)}' color='#0F7291'>{html.escape(label)}</link>"
        text = text.replace(f"@@LINK{i}@@", replacement)
    return text


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("TitleVIA", parent=base["Title"], fontName=BOLD, fontSize=24, leading=28, textColor=NAVY, alignment=TA_LEFT, spaceAfter=10),
        "meta": ParagraphStyle("MetaVIA", parent=base["Normal"], fontName=REGULAR, fontSize=9, leading=12, textColor=MUTED, spaceAfter=3),
        "quote": ParagraphStyle("QuoteVIA", parent=base["Normal"], fontName=BOLD, fontSize=12, leading=17, textColor=NAVY, backColor=WASH, borderColor=TEAL, borderWidth=0, borderPadding=(10, 12, 10, 12), leftIndent=8, spaceBefore=8, spaceAfter=16),
        "h2": ParagraphStyle("H2VIA", parent=base["Heading2"], fontName=BOLD, fontSize=16, leading=20, textColor=NAVY, spaceBefore=16, spaceAfter=8, keepWithNext=True),
        "h3": ParagraphStyle("H3VIA", parent=base["Heading3"], fontName=BOLD, fontSize=11, leading=14, textColor=TEAL, spaceBefore=10, spaceAfter=5, keepWithNext=True),
        "body": ParagraphStyle("BodyVIA", parent=base["BodyText"], fontName=REGULAR, fontSize=9.3, leading=13.7, textColor=INK, alignment=TA_LEFT, spaceAfter=7),
        "source": ParagraphStyle("SourceVIA", parent=base["BodyText"], fontName=REGULAR, fontSize=8.2, leading=11.5, textColor=MUTED, borderColor=RULE, borderWidth=0, borderPadding=(6, 0, 0, 0), spaceBefore=5, spaceAfter=10),
        "bullet": ParagraphStyle("BulletVIA", parent=base["BodyText"], fontName=REGULAR, fontSize=9.2, leading=13.4, textColor=INK, leftIndent=3),
        "footer": ParagraphStyle("FooterVIA", parent=base["Normal"], fontName=REGULAR, fontSize=7.4, leading=9, textColor=MUTED, alignment=TA_CENTER),
    }


def parse_markdown(source: Path):
    st = styles()
    lines = source.read_text(encoding="utf-8").replace("\r\n", "\n").splitlines()
    story = []
    paragraph: list[str] = []
    bullets: list[str] = []

    def flush_paragraph():
        nonlocal paragraph
        if not paragraph:
            return
        raw = " ".join(x.strip() for x in paragraph).strip()
        style = st["source"] if re.match(r"^\*\*(Fonte|Fontes)", raw, re.I) else st["body"]
        story.append(Paragraph(inline(raw), style))
        paragraph = []

    def flush_bullets():
        nonlocal bullets
        if not bullets:
            return
        items = [ListItem(Paragraph(inline(item), st["bullet"]), leftIndent=8) for item in bullets]
        story.append(ListFlowable(items, bulletType="bullet", leftIndent=15, bulletFontName=REGULAR, bulletFontSize=6, spaceAfter=8))
        bullets = []

    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            flush_paragraph(); flush_bullets(); continue
        if re.fullmatch(r"---+", line.strip()):
            flush_paragraph(); flush_bullets(); story.append(Spacer(1, 4)); continue
        image_match = re.match(r"!\[([^\]]*)\]\(([^)]+)\)", line.strip())
        if image_match:
            flush_paragraph(); flush_bullets()
            image_path = (source.parent / image_match.group(2)).resolve()
            if image_path.exists():
                img = Image(str(image_path))
                img._restrictSize(165 * mm, 90 * mm)
                story.append(KeepTogether([img, Paragraph(inline(image_match.group(1)), st["source"])]))
            continue
        if line.startswith("# "):
            flush_paragraph(); flush_bullets(); story.append(Paragraph(inline(line[2:]), st["title"])); continue
        if line.startswith("## "):
            flush_paragraph(); flush_bullets(); story.append(Paragraph(inline(line[3:]), st["h2"])); continue
        if line.startswith("### "):
            flush_paragraph(); flush_bullets(); story.append(Paragraph(inline(line[4:]), st["h3"])); continue
        if line.startswith("> "):
            flush_paragraph(); flush_bullets(); story.append(Paragraph(inline(line[2:]), st["quote"])); continue
        if re.match(r"^-\s+", line):
            flush_paragraph(); bullets.append(re.sub(r"^-\s+", "", line)); continue
        if re.fullmatch(r"\*\*[^*]+\*\*", line.strip()) and len(story) < 8:
            flush_paragraph(); flush_bullets(); story.append(Paragraph(inline(line), st["meta"])); continue
        if bullets:
            flush_bullets()
        paragraph.append(line)
    flush_paragraph(); flush_bullets()
    return story


def draw_page(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 9 * mm, width, 9 * mm, fill=1, stroke=0)
    canvas.setFont(BOLD, 7.5)
    canvas.setFillColor(colors.white)
    canvas.drawString(18 * mm, height - 6 * mm, "VIA · SAÚDE NA ÚLTIMA SEMANA")
    canvas.setFont(REGULAR, 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawCentredString(width / 2, 8 * mm, f"Revista Eletrônica VIA · {doc.page}")
    canvas.restoreState()


def render(source: Path, output: Path):
    output.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(output), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm,
        topMargin=17 * mm, bottomMargin=15 * mm,
        title="Saúde na Última Semana — Revista Eletrônica VIA",
        author="Dr Lucas HR Almeida — Iniciativa VIA",
        subject="Saúde pública, cuidado, ciência e tecnologia",
    )
    doc.build(parse_markdown(source), onFirstPage=draw_page, onLaterPages=draw_page)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    render(args.source.resolve(), args.output.resolve())


if __name__ == "__main__":
    main()
