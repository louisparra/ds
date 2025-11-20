<!--
What this file is:
README for the figma/templates folder describing SVG templates and usage.

Who should edit it:
Design System Lead or Design Ops.

When to update (example):
Update when adding/removing template frames or changing import instructions.

Who must approve changes:
Design System Lead & Token Owner.
-->

# Figma templates — README

This folder contains lightweight SVG frames you can paste into a Figma file as starting templates for the canonical pages described in `figma/PAGES_AND_TEMPLATES.md`.

Files:

- `token-source-frame.svg` — scaffolding for the `00 — Tokens (source)` page (colors, type, spacing).
- `component-library-frame.svg` — scaffolding for the `01 — Components (library)` page.
- `usage-kit-frame.svg` — scaffolding for the `03 — Usage & Guidelines` page.

How to import:

1. Copy SVG markup and paste into Figma (paste-as-SVG) OR File → Place image and choose the file.
2. Ungroup / Convert shapes into local styles as needed.
3. Rename the page and frames according to your project structure.

Notes:

- These SVGs are intentionally _editable vectors_ — after pasting, create Color/Text Styles from the shapes so token plugins can detect them.
- If you want a `.fig` file exported from Figma, your org design lead can create it from these templates and add it to the repo (binary files are discouraged in this template repo).
