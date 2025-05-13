#!/usr/bin/env python
"""
build_coords.py – gera static/coords/<andar>.json a partir dos PDFs.

Execute sempre que trocar/adicionar PDF.
"""

from pathlib import Path
import json, re, fitz

# ⇣ ajuste se necessário ────────────────────────────────────────────────
ROOT     = Path(__file__).resolve().parent.parent      # pasta-raiz do projeto
PDF_DIR  = ROOT / "backend" / "static" / "andares"
OUT_DIR  = ROOT / "backend" / "static" / "coords"
# ────────────────────────────────────────────────────────────────────────

OUT_DIR.mkdir(parents=True, exist_ok=True)
LAYER_CANDIDATAS = ["ARQ-NUM", "ARK-NUM"]

def extract_coords(pdf_path: Path) -> list[dict]:
    doc = fitz.open(pdf_path)

    ocgs = doc.get_ocgs() or {}
    layer_xref = next(
        (x for nome in LAYER_CANDIDATAS
           for x, v in ocgs.items() if v["name"] == nome),
        None,
    )
    if not layer_xref:
        print(f"[warn] {pdf_path.name}: layer não encontrada – pulando")
        doc.close()
        return []

    doc.set_layer(-1, on=[layer_xref], off=[x for x in ocgs if x != layer_xref])

    rows = []
    for pg in range(doc.page_count):
        for x0, y0, x1, y1, texto, bloco, linha, ordem in doc[pg].get_text("words"):
            rows.append({
                "page":  pg + 1,
                "x0": x0, "y0": y0, "x1": x1, "y1": y1,
                "texto": re.sub(r"^0([1-9])$", r"\\1", texto.strip()),
                "bloco": int(bloco), "linha": int(linha), "ordem": int(ordem),
            })

    doc.close()
    return rows


def main() -> None:
    if not list(PDF_DIR.glob("*.pdf")):
        print(f"[erro] Nenhum PDF encontrado em {PDF_DIR}")
        return

    total = 0
    for pdf_path in sorted(PDF_DIR.glob("*.pdf")):
        coords = extract_coords(pdf_path)
        if not coords:
            continue
        out_file = OUT_DIR / f"{pdf_path.stem}.json"
        out_file.write_text(
            json.dumps(coords, ensure_ascii=False),
            encoding="utf-8"
        )
        print(f"[ok] {pdf_path.name}  →  {out_file.relative_to(ROOT)}  ({len(coords)} palavras)")
        total += 1

    print(f"Concluído: {total} arquivo(s) gerados em {OUT_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
