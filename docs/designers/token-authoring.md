<!--
What this file is:
Practical recipes for authoring canonical tokens (colors, typography, spacing, motion).

Who should edit it:
Token Owner, Design System Lead, or senior designers owning tokens.

When to update (example):
Update when canonical token schema or naming conventions change.

Who must approve changes:
Token Owner & Engineering Lead.
-->

# Token authoring — recipes & examples

This file gives concrete, copyable recipes for authoring tokens that will be exported from Figma and converted to canonical JSON.

## Core principles (short)

- **Author semantically.** Tokens represent intent (e.g., `color.bg.page`, `type.body.16.regular`), not visual specifics.
- **Be predictable.** Use naming patterns the pipeline can auto-derive (slash-form in Figma: `color/brand/primary` → `color.brand.primary`).
- **Minimize legacy names.** If legacy human-friendly names exist (e.g., "Primary"), add mappings in `figma/FIGMA_STYLE_MAP.json` rather than changing behavior.
- **Test locally.** Always run adapter + `figma-sync --dry` before PR.

---

## Colors (recipe)

**Figma practice**

1. Create Color Styles only on `00 — Tokens (source)` page.
2. Name styles as `color/<category>/<name>` (e.g., `color/brand/primary`, `color/ui/background`).
3. If a style serves multiple semantic roles (rare), duplicate it and give each copy a semantic name.

**Token metadata**

- Add description and, optionally, a token dot.path in the style description (e.g., `tokens: color.brand.primary`).
- For mode-aware colors, prefer `meta.modes` (see Modes section).

**Examples (canonical JSON snippet)**

```json
{
  "name": "color.bg.page",
  "dotPath": "color.bg.page",
  "type": "color",
  "value": "#FFFFFF",
  "meta": { "modes": { "light": "#FFFFFF", "dark": "#0B0B0B" } }
}
```

**Validation**

- Run `node scripts/adapters/figma-tokens-to-canonical.js --input figma/your-export.json --output figma/canonical-export.json`
- Then `node scripts/figma-sync.js --input figma/canonical-export.json --map figma/FIGMA_STYLE_MAP.json --dry`

---

## Typography (recipe)

**Figma practice**

1. Create Text Styles (avoid inline text attributes).
2. Use `type/<role>/<size>-<weight>` naming: `type/body/16-regular`, `type/heading/32-bold`.
3. Include values: font family, font-size, font-weight, line-height, letter-spacing.

**Canonical token example**

```json
{
  "name": "type.body.16.regular",
  "dotPath": "type.body.16.regular",
  "type": "typography",
  "value": {
    "fontFamily": "Inter",
    "fontSize": 16,
    "fontWeight": 400,
    "lineHeight": 24
  }
}
```

**Notes**

- Use numeric values (avoid "small", "large" ambiguous labels).
- Add accessible size variants; note how scaling behaves across breakpoints.

---

## Spacing (recipe)

**Figma practice**

- Create geometric rectangles representing spacing scale on `00 — Tokens (source)`.
- Name as `spacing/scale/<n>` where `<n>` maps to a pixel step (e.g., `spacing/scale/1` = 4px, `2` = 8px).

**Canonical token example**

```json
{ "name": "spacing.scale.2", "dotPath": "spacing.scale.2", "type": "spacing", "value": "8px" }
```

---

## Motion (recipe)

- Author easing and duration as tokens: `motion/curve/standard`, `motion/duration/fast`.
- When designing micro-interactions, reference tokens rather than hardcoding timings.

**Canonical token example**

```json
{
  "name": "motion.duration.fast",
  "dotPath": "motion.duration.fast",
  "type": "time",
  "value": "120ms"
}
```

---

## Modes (light/dark) — recommended approach

Two choices; we recommend **meta.modes** authoring:

**Authoring approach (meta.modes)**

- Author the default value and provide a `meta.modes` object with at least `light` and `dark`.
- Adapters will include `meta.modes` in canonical JSON and sync tooling can expand or convert during build.

**Example**

```json
{
  "name": "color.text.primary",
  "dotPath": "color.text.primary",
  "type": "color",
  "value": "#091625",
  "meta": { "modes": { "light": "#091625", "dark": "#E6EEF8" } }
}
```

---

## Naming conventions & dot.path rules (copyable)

- Lowercase, alphanumeric and dots for token keys: `component.variant.state.label`
- Figma names (slash-form) map to dot.path by replacing `/` with `.` and lowercasing.
- Avoid underscores, leading symbols, and private keys starting with `_`.

---

## Common anti-patterns

- Using shape fills or inline text instead of styles.
- Overloading a single style with multiple semantic meanings.
- Naming tokens with platform specifics (`color.ios.primary`) — prefer platform mapping at build time.

---

## Quick checklist (before PR)

- [ ] Styles are Color/Text/Effect styles in Figma.
- [ ] Style names follow slash-form or include canonical dot.path in description.
- [ ] Run adapter + sync dry-run locally and inspect report.
- [ ] If renaming tokens, include migration notes in the PR (see `release-and-migrations.md`).
