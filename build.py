#!/usr/bin/env python3
"""Assemble the static site: wraps each src/pages/*.html in src/layout.html and writes docs/."""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
OUT = ROOT / "docs"

META_RE = re.compile(r"^<!--(.*?)-->\s*", re.S)


def parse(page: Path):
    raw = page.read_text(encoding="utf-8")
    meta = {}
    m = META_RE.match(raw)
    if m:
        for line in m.group(1).strip().splitlines():
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()
        raw = raw[m.end():]
    return meta, raw


def mark_current(html: str, filename: str, section: str) -> str:
    """Add aria-current to nav links pointing at this page, and flag the parent section."""
    html = html.replace(f'href="{filename}" data-nav', f'href="{filename}" aria-current="page" data-nav')
    if section:
        html = html.replace(f'data-section="{section}"', f'data-section="{section}" data-active')
    return html


def main():
    layout = (SRC / "layout.html").read_text(encoding="utf-8")
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(SRC / "assets", OUT / "assets")
    for page in sorted((SRC / "pages").glob("*.html")):
        meta, body = parse(page)
        html = (
            layout.replace("{{title}}", meta.get("title", "Autism Society of India"))
            .replace("{{description}}", meta.get("description", ""))
            .replace("{{body_class}}", meta.get("class", ""))
            .replace("{{content}}", body)
        )
        html = mark_current(html, page.name, meta.get("section", ""))
        (OUT / page.name).write_text(html, encoding="utf-8")
        print("built", page.name)
    (OUT / ".nojekyll").touch()


if __name__ == "__main__":
    main()
