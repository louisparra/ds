<!--
What this file is:
Canonical export schema specification for Figma token exports. Tooling (adapters, CI, sync scripts) should accept this shape or convert plugin outputs into it.

Who should edit it:
Design System Lead or Tooling Engineer.

When to update (example):
Update when you add token categories, change naming transforms, or add structured metadata such as multi-mode tokens.

Who must approve changes:
Token Owner & Engineering Lead.
-->

# Figma export schema

## Purpose

This document defines a small, stable JSON schema that the repo's tooling expects as the canonical input when converting Figma styles into repository tokens (`tokens/tokens.json`). Adapters should convert plugin-specific exports (Figma Tokens, Token Studio, Figmagic, etc.) into **this** shape before calling `scripts/figma-sync.js` (or CI dry-run).

## Goals

- Be expressive enough to represent common token types (color, spacing, typography, motion).
- Be plugin-agnostic: adapters convert any plugin output to this shape.
- Be easy for humans and CI to read and review (array of token objects).
- Support light/dark (or other modes) and per-token metadata.

## Top-level shape (summary)

A canonical export file is a JSON object with the keys:

- `schemaVersion` — string, e.g. `"1.0"`.
- `exportedAt` — ISO timestamp.
- `source` — optional object describing Figma file/page/plugin.
- `tokens` — array of token objects (see token object spec).

## Minimal example

```json
{
  "schemaVersion": "1.0",
  "exportedAt": "2025-11-19T12:34:56Z",
  "source": {
    "file": "DS.Core",
    "page": "00 - Tokens (source)",
    "plugin": "figma-tokens@4.0"
  },
  "tokens": [
    {
      "name": "color/brand/primary",
      "dotPath": "color.brand.primary",
      "type": "color",
      "value": "#0A84FF",
      "description": "Primary brand color",
      "meta": {
        "figmaStyleId": "S:1234",
        "modes": {
          "light": "#0A84FF",
          "dark": "#0060D6"
        }
      }
    },
    {
      "name": "spacing/scale/4",
      "dotPath": "spacing.scale.4",
      "type": "spacing",
      "value": "16px",
      "description": "Spacing step 4"
    },
    {
      "name": "type/body/16-regular",
      "dotPath": "type.body.16.regular",
      "type": "typography",
      "value": {
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": 400,
        "lineHeight": 24
      }
    }
  ]
}
```

## Token object spec

Each element of `tokens` must be an object with the following recommended fields:

- `name` — string. The Figma-style name (slash form), e.g. `color/brand/primary`. Helpful for human debugging.
- `dotPath` — string. Canonical repo token key (dot.path), e.g. `color.brand.primary`. **If present it MUST be used** by sync tooling; adapters should generate this when possible.
- `type` — string. One of common types: `color`, `spacing`, `typography`, `border`, `shadow`, `radius`, `motion`, `icon`, `z-index`, `effect`, `gradient`, etc. Type hints help downstream transforms.
- `value` — primitive (string/number) or object (for complex tokens like typography). Examples:
  - color: `"#0A84FF"`
  - spacing: `"16px"` or `16`
  - typography: `{ "fontFamily": "Inter", "fontSize": 16, "fontWeight": 400 }`
- `description` — optional human string; encouraged to include the canonical repo token key or notes. Example: `tokens: color.brand.primary`.
- `meta` — optional object for extra fields:
  - `figmaStyleId` — plugin or Figma style id for traceability.
  - `modes` — object mapping mode-name → value (example: `{"light":"#fff","dark":"#000"}`).
  - `source` — e.g., `"figma-style"`, `"manual"`.
  - `aliases` — array of dot.path keys this token aliases (for deprecation flows).
  - `raw` — optional raw plugin data for debugging.

## Rules / conventions

1. **Prefer `dotPath` when available.** Adapters should compute `dotPath` using `figma/FIGMA_STYLE_MAP.json` overrides first, then the default transform (replace `/` with `.` and lowercase).
2. **No deletions in canonical exports.** Exports only declare tokens to add/update. Deletions are handled via deprecation/migration flows in `tokens/migrations/`.
3. **Modes:** If a token has different values across modes (dark/light), populate `meta.modes`. How to persist modes in `tokens/tokens.json` is an implementation choice — e.g., keep `value` as the default (light) and add `modes` metadata, or expand to `value: { "light": "...", "dark": "..." }`. Your sync tooling should document chosen approach.
4. **Type normalization:** Ensure `type` is present for clarity. If plugin cannot provide `type`, adapter should infer it (e.g., hex → `color`, px/number → `spacing`).
5. **Units:** Keep units explicit in `value` strings (e.g., `16px`, `1.5rem`) or use numbers with metadata about units. Be consistent across exports.
6. **Escaping & encoding:** Values must be JSON-friendly; prefer simple primitives. Avoid embedding large binary blobs.
7. **Backwards compatibility:** Keep `schemaVersion` updated when changing the export shape. Adapters and `figma-sync.js` should check `schemaVersion` and fail early with a useful message if incompatible.

## Adapter guidance

- **Adapters** convert plugin outputs to this canonical schema. Create small one-file adapters such as:
  - `scripts/adapters/figma-tokens-to-canonical.js`
  - `scripts/adapters/token-studio-to-canonical.js`
- Adapters should:
  - Read plugin export file (plugin-specific shape).
  - Produce canonical JSON (writing to stdout or to a file).
  - Populate `dotPath` using `figma/FIGMA_STYLE_MAP.json` when available.
  - Normalize `value` and `type` fields.
  - Preserve raw plugin data under `meta.raw` for debugging.

Suggested adapter behavior priority

1. Use explicit mapping from `figma/FIGMA_STYLE_MAP.json` if present for a given name.
2. Use `dotPath` field from plugin export if already provided.
3. Fall back to auto-transform: `name.replace('/', '.').toLowerCase()`.

## CI / Tooling expectations

- CI should accept either:
  - A direct canonical export (`figma-export-canonical.json`) placed in PR, or
  - A plugin export plus an adapter step (CI runs adapter → canonical → `scripts/figma-sync.js --dry`).
- The repo's `scripts/figma-sync.js` already attempts to normalize common plugin shapes — adapters make it more robust.
- Provide fixtures (`figma/fixtures/`) for each supported plugin and add CI unit tests that run adapter + sync dry-run to avoid regressions.

## Practical examples

### Color token (simple)

```json
{
  "name": "color/brand/primary",
  "dotPath": "color.brand.primary",
  "type": "color",
  "value": "#0A84FF",
  "description": "Primary brand color",
  "meta": { "figmaStyleId": "S:1234" }
}
```

### Typography token (object)

```json
{
  "name": "type/body/16-regular",
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

### Mode-aware color token

```json
{
  "name": "color/bg/page",
  "dotPath": "color.bg.page",
  "type": "color",
  "value": "#FFFFFF",
  "meta": {
    "modes": { "light": "#FFFFFF", "dark": "#0B0B0B" }
  }
}
```

## Error handling & reporting

- Adapters must emit clear errors when input is malformed or required fields are missing.
- `scripts/figma-sync.js --dry` should produce a **markdown** report suitable for PR comments summarizing:
  - tokens added
  - tokens updated (old vs new values)
  - unmapped items (figma style names with no mapping)
  - warnings (missing values, ambiguous types)
- CI should fail only when schema is invalid or the dry-run detects critical issues; otherwise it should post a report and allow human review.

## Backwards compatibility & migration strategy

- Changing the canonical schema requires bumping `schemaVersion` and updating adapters + sync script. Keep release notes and migration guide.
- Never automatically remove tokens via an export. Removals must be explicit via `tokens/migrations/*` per the migration policy.

## Quick checklist for adapter authors

    - [ ] Produce `schemaVersion` and `exportedAt`.
    - [ ] Populate `tokens` array; every entry has `name`, `dotPath` (if possible), `type`, and `value`.
    - [ ] Put Figma plugin raw data in `meta.raw` (optional) for debugging.
    - [ ] For any multi-mode tokens, fill `meta.modes`.
    - [ ] Run `node scripts/figma-sync.js --input <canonical.json> --dry` to verify the dry-run report.
    - [ ] Add a fixture in `figma/fixtures/` and add a test in CI.

## Why this design

- Arrays + per-token objects make it robust across different plugin outputs.
- `dotPath` is authoritative and simplifies downstream merges.
- `meta` is flexible and future-proofs the schema for modes, ids, and raw data.

## Appendix: small JSON Schema (informal)

Below is a compact, informal JSON Schema to validate basic shape (not exhaustive):

```json
{
  "type": "object",
  "required": ["schemaVersion", "exportedAt", "tokens"],
  "properties": {
    "schemaVersion": { "type": "string" },
    "exportedAt": { "type": "string", "format": "date-time" },
    "source": { "type": "object" },
    "tokens": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "value"],
        "properties": {
          "name": { "type": "string" },
          "dotPath": { "type": "string" },
          "type": { "type": "string" },
          "value": {},
          "description": { "type": "string" },
          "meta": { "type": "object" }
        }
      }
    }
  }
}
```
