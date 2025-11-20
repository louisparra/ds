<!--
What this file is:
Instructions and rationale for the Figma pages and template frames teams should copy into their organization Figma files.

Who should edit it:
Design System Lead, Token Owner, or Design Ops.

When to update (example):
Update this doc when you add/remove a canonical page or change naming conventions for pages/frames.

Who must approve changes:
Design System Lead & Token Owner.
-->

# Figma pages & template frames

## Purpose

This document defines the canonical set of Figma pages and _template frames_ that each project or organization should copy into their Figma file when adopting this design-system template. The templates are intentionally simple SVG frames you can paste into Figma (no binary Figma files required). They provide consistent structure, naming and examples so designers and integrators can work predictably.

## Why this matters

- Gives a consistent _designer view_ (single source for tokens, components, and usage guidance).
- Keeps Figma organized for token extraction and adapter workflows.
- Reduces ambiguity during token mapping and when running `scripts/figma-sync.js` because style names are predictable.

## Canonical pages (recommended names)

Create the following pages in your Figma file (exact names recommended):

1. `00 — Tokens (source)`

   - Purpose: canonical token source (color styles, type styles, spacing scale, motion). This is the single place designers edit tokens. The adapters expect the source page to contain styles and the token export plugin to read from this page.

2. `01 — Components (library)`

   - Purpose: visual, annotated components implemented with semantic layer names that match token keys (naming convention: `component/variant/state/label`).

3. `02 — Patterns & Layouts`

   - Purpose: larger compositions, page templates, grid examples, accessibility notes.

4. `03 — Usage & Guidelines`

   - Purpose: live examples (dos/don'ts), platform guidance (web/iOS/Android), accessibility checklists.

5. `99 — Legacy / Mapping`
   - Purpose: temporary page to host legacy Figma styles that require explicit mapping overrides. When done, migrate styles or remove.

## Where to copy the templates

1. Open your organization's Figma file (or create a new Figma file for the design system).
2. For each SVG in `figma/templates/*.svg`:
   - Option A (recommended): open the `.svg` file in a text editor, copy the entire SVG markup, then in Figma paste (⌘V / Ctrl+V). Figma will create vector objects and groups from the SVG.
   - Option B: In Figma use _File → Place image..._ and choose the `.svg` file; then right-click the placed image and select _Outline Stroke_ / or ungroup to edit shapes if needed.
3. Rename the page to one of the canonical page names above (e.g., `00 — Tokens (source)`).
4. Move the pasted frame into the page and adapt content — the SVG frames are scaffolding: change colors, text, and tokens to match your organization.

## Template naming & frame roles

Each template frame (token-source, component-library, usage-kit) is intentionally _annotated_. When you paste it:

- Keep the top-left frame title (e.g., `Tokens — Source`) so maintainers can quickly identify the page purpose.
- Use Figma local styles where possible (after pasting, convert color rectangles to Color Styles, and text to Text Styles) so the plugin/exporter picks them up.

## Adapter & CI notes

- Adapters (`scripts/adapters/*`) expect exported token names or style names to be present in the `00 — Tokens (source)` page. Use consistent style naming `category/type/name` or the repo convention `component/variant/state/label`.
- If you have legacy or freeform Figma style names, add explicit mappings to `figma/FIGMA_STYLE_MAP.json` in the repo to avoid unpredictable dotPath derivation.

## Quick checklist to onboard a Figma file

- [ ] Create pages with the exact names above (copy-paste the SVG templates into the new pages).
- [ ] Convert color rectangles into Color Styles and name them following token naming conventions (or include the canonical dot.path in the style description).
- [ ] Convert text into Text Styles (for typography tokens).
- [ ] Run your plugin export and produce a canonical JSON using an adapter if necessary.
- [ ] Run `node scripts/figma-sync.js --input ./figma/canonical-export.json --map ./figma/FIGMA_STYLE_MAP.json --dry` to preview token changes.

## Practical tips for designers

- When naming a Figma style, prefer the slash-form (e.g., `color/brand/primary`). Put the repo dot.path into the style description if you need an immediate mapping (e.g., `tokens: color.brand.primary`).
- Keep `00 — Tokens (source)` minimal: tokens only (no presentation elements). Present components on a separate `01 — Components (library)` page.
- Use separate pages for platform variants if your design tokens differ significantly (e.g., `00 — Tokens (iOS)`), but prefer a single canonical source with mode metadata if possible.

## Links to templates and manifest

- `figma/templates/` — contains SVG scaffold frames.
- `figma/FIGMA_PAGE_TEMPLATES.json` — machine-friendly manifest describing templates and what each contains.
