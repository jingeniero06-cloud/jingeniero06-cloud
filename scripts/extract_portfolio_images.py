"""Extract/render portfolio preview images from case-study PDFs."""
from __future__ import annotations

import fitz
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "images"
OUT.mkdir(parents=True, exist_ok=True)

PDFS = [
    (ROOT / "assets" / "static-landing-case-study.pdf", "static-landing"),
    (ROOT / "assets" / "static-conversion-case-study.pdf", "static-conversion"),
    (ROOT / "assets" / "portfolio-audit-13sites.pdf", "portfolio-audit"),
    (ROOT / "assets" / "website-seo-proposal.pdf", "seo-proposal"),
]


def save_webp(img: Image.Image, path: Path, max_w: int = 1600) -> None:
    if img.mode == "RGBA":
        bg = Image.new("RGB", img.size, (11, 15, 18))
        bg.paste(img, mask=img.split()[3])
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    if img.width > max_w:
        ratio = max_w / img.width
        img = img.resize((max_w, int(img.height * ratio)), Image.Resampling.LANCZOS)
    img.save(path, "WEBP", quality=82, method=4)


def main() -> None:
    for pdf_path, prefix in PDFS:
        if not pdf_path.exists():
            print(f"MISSING {pdf_path}")
            continue
        doc = fitz.open(pdf_path)
        print(f"\n=== {pdf_path.name}: {doc.page_count} pages ===")

        for i in range(min(doc.page_count, 3)):
            page = doc[i]
            pix = page.get_pixmap(matrix=fitz.Matrix(1.6, 1.6), alpha=False)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            out_path = OUT / f"{prefix}-page{i + 1}.webp"
            save_webp(img, out_path)
            print(f"  rendered {out_path.name} {img.size}")

        extracted = 0
        for pno in range(doc.page_count):
            for imginfo in doc.get_page_images(pno):
                xref = imginfo[0]
                try:
                    pix = fitz.Pixmap(doc, xref)
                except Exception:
                    continue
                if pix.n >= 5:
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                w, h = pix.width, pix.height
                if w < 220 or h < 140 or w * h < 90000:
                    continue
                extracted += 1
                mode = "RGBA" if pix.alpha else "RGB"
                im = Image.frombytes(mode, [w, h], pix.samples)
                name = f"{prefix}-embed-{extracted:02d}.webp"
                save_webp(im, OUT / name)
                print(f"  embed {name} {im.size} page {pno + 1}")
                if extracted >= 8:
                    break
            if extracted >= 8:
                break
        print(f"  embedded kept: {extracted}")

    print("\nDone:")
    for p in sorted(OUT.glob("*")):
        print(f"  {p.name}\t{p.stat().st_size}")


if __name__ == "__main__":
    main()
