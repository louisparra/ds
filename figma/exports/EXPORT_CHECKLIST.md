<!--
What this file is:
A short, copy-paste checklist designers should run before opening a PR that changes tokens or assets.

Who should edit it:
Designers, Design System Lead.

When to update (example):
Update when export steps or tooling change.

Who must approve changes:
Design System Lead & Token Owner.
-->

# Export checklist — quick steps before opening a PR

Use this checklist to reduce CI churn and make reviews fast.

## Tokens

- [ ] `00 — Tokens (source)` page contains only Color/Text/Effect styles (no presentation elements).
- [ ] Style names follow slash-form (e.g., `color/brand/primary`) or include the repo dot.path in the style description.
- [ ] Export plugin JSON saved to `figma/<your-export>.json` in the branch (optional but helpful).
- [ ] Run adapter locally:

  ```bash
  node scripts/adapters/<adapter>.js --input figma/<your-export>.json --output figma/canonical-export.json

  ```

- [ ] Run dry-run:

  ```bash
  node scripts/figma-sync.js --input figma/canonical-export.json --map figma/FIGMA_STYLE_MAP.json --dry
  ```

- [ ] Inspect dry-run report and fix mapping/style name issues.

## Assets

- [ ] Export icons as SVGs into `assets/icons/<component>/name.svg`
- [ ] Export bitmap assets at required densities (`@1x`, `@2x`, `@3x`) into `assets/`
- [ ] Filenames use kebab-case and include context (component name)

## PR

- [ ] In PR description: list which pages were edited, plugin + version used to export, and whether `FIGMA_STYLE_MAP.json` was modified.
- [ ] Attach a short note with any required reviewer attention (mapping overrides, major token renames).

If you're a designer and unsure, ping the Token Owner or Design System Lead before opening the PR.
