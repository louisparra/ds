<!--
What this file is:
Step-by-step guidance for exporting tokens and assets from Figma into the design system pipeline.

Who should edit it:
Design System Lead, Token Owner, or Design Ops.

When to update (example):
Update when supported plugins, adapter commands, or the canonical schema change.

Who must approve changes:
Design System Lead & Token Owner.
-->

# Figma Export & Asset Guidance — How to export tokens and assets correctly

This document describes the recommended, low-friction workflow designers should follow to export **tokens** and **assets** from Figma so the repo tooling (`scripts/adapters/*` and `scripts/figma-sync.js`) can convert them into the canonical JSON (`figma/canonical-export.json` or `tokens/tokens.json`) and asset bundles.

---

## High-level workflow (recommended)

1. **Prepare Figma pages**

   - Put tokens in the `00 — Tokens (source)` page and components in `01 — Components (library)`.
   - Convert swatches to **Color Styles** and text to **Text Styles**. Plugins read styles — not arbitrary rectangles/text.
   - Ensure style names follow the slash-form convention: `category/type/name` (e.g., `color/brand/primary`) or put exact dot.path in the style description for clarity.

2. **Export tokens using your chosen plugin**

   - Use one of the supported plugins (Figma Tokens, Token Studio, Figmagic) or your preferred tool.
   - Save the plugin export JSON in `figma/` in your branch (e.g., `figma/my-export.json`).

3. **Convert plugin export to canonical JSON**

   - Run the corresponding adapter in `scripts/adapters/`:
     - Example: `node scripts/adapters/figma-tokens-to-canonical.js --input figma/my-export.json --output figma/canonical-export.json`
   - The adapter will:
     - Flatten or normalize the plugin JSON,
     - Generate `name` and `dotPath` (unless present),
     - Preserve `meta.raw` for debugging.

4. **Preview changes using figma-sync (dry-run)**

   - `node scripts/figma-sync.js --input figma/canonical-export.json --map figma/FIGMA_STYLE_MAP.json --dry`
   - Expected output: a markdown-like report printed to stdout (also used by CI as PR comment) showing tokens **added**, **updated**, and **skipped**.
   - Inspect the report — if tokens map to the wrong keys, add explicit mappings to `figma/FIGMA_STYLE_MAP.json` or adjust style names in Figma.

5. **When ready, open a PR**
   - Include:
     - the plugin export (optional, helpful for reviewers),
     - the generated canonical JSON (`figma/canonical-export.json`) if maintainers requested it,
     - a note explaining mapping decisions and any `FIGMA_STYLE_MAP.json` overrides.
   - CI will run adapters/tests and post a migration preview.

---

## Quick examples — commands & expected outputs

- Convert Figma Tokens export to canonical:

```bash
node scripts/adapters/figma-tokens-to-canonical.js \
  --input figma/figma-tokens-export.json \
  --output figma/canonical-export.json
# Expected: writes figma/canonical-export.json with { schemaVersion, exportedAt, source, tokens: [] }
```

- Run sync dry-run:

```bash
node scripts/figma-sync.js \
  --input figma/canonical-export.json \
  --map figma/FIGMA_STYLE_MAP.json \
  --dry
# Expected: a printed report with sections: Added tokens, Updated tokens, Conflicts, Notes.
```

---

## Best practices and rules

- **Prefer style names that map cleanly**: `color/brand/primary` → `color.brand.primary`. Use simple, predictable names.
- **If you must use legacy/human names**, add an explicit mapping in `figma/FIGMA_STYLE_MAP.json` (example: `"Primary": "color.brand.primary"`).
- **Do not commit production exports with PII**. Use synthetic values or sanitized exports in PRs.
- **Keep `00 — Tokens (source)` tokens-only** — no layout/presentation elements.
- **Test locally** with fixtures in `figma/fixtures/` (we included many examples). Run `node scripts/tests/figma-adapter-tests.js` to validate the pipeline.

---

## Modes (light/dark) — recommended approach

Two valid approaches; choose one per organization and be consistent:

**A — Store modes inside token meta (recommended for this template)**

- Canonical token entry: include `meta.modes` with `light` and `dark` keys.
- Pros: Keeps tokens compact and easy to review; adapters & sync can expand if needed during build.
- Example canonical token:

```json
{
  "name": "color.bg.page",
  "dotPath": "color.bg.page",
  "type": "color",
  "value": "#FFFFFF",
  "meta": {
    "modes": { "light": "#FFFFFF", "dark": "#0B0B0B" }
  }
}
```

**B — Expand modes into separate tokens**

- Create `color.bg.page.light` and `color.bg.page.dark`.
- Pros: Simpler platform mapping for some consumers; slightly more verbose.

> Recommendation: Use **meta.modes** for authoring and let the token build step expand into platform artifacts when necessary.

---

## Troubleshooting quick guide

- **No tokens detected by plugin**: ensure styles are real Figma Color/Text Styles (not shapes).
- **dotPath wrong in sync report**: add explicit mapping to `figma/FIGMA_STYLE_MAP.json` or change the Figma style name.
- **CI fails on adapters**: check adapter test logs in CI; run `node scripts/tests/figma-adapter-tests.js` locally to reproduce.
