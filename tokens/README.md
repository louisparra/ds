<!--
What this file is:
Guidance for tokens (tokens/tokens.json): structure, editing rules, and workflows.

Who should edit it:
Token Owner, Design Lead, or Docs Owner.

When to update (example):
Update when schema or output transforms change, or when adding a new token category.

Who must approve changes:
Token Owner & Design System Lead.
-->

# Tokens — single source of truth

This folder contains the canonical tokens that feed the design system pipeline (Style Dictionary, builds, Storybook, etc.).

## Location

- Canonical authored file: `tokens/tokens.json`
- Example starter file: `tokens/tokens.example.json`

## High-level guidelines

- Tokens are nested by category (e.g., `color.brand.primary`) and each token is an object:
  - `value` (required) — the actual token value (e.g., `#0a84ff`, `16px`, `1.5`, `cubic-bezier(...)`)
  - `type` (recommended) — semantic type (e.g., `color`, `font-size`, `spacing`, `duration`, `easing`, `font-family`)
  - `description` (recommended) — short human-readable explanation
  - `deprecated` (optional, boolean) — mark tokens that will be removed; include `replacement` when deprecating
  - `replacement` (optional) — dot.path key that replaces this token

Example token:

```json
{
  "color": {
    "brand": {
      "primary": {
        "value": "#0a84ff",
        "type": "color",
        "description": "Primary brand color"
      }
    }
  }
}
```

## Workflow (recommended)

1. Edit `tokens/tokens.json` on a feature branch.
2. Run local checks:
   - `npm run token-validate` — validates JSON shape against `tokens/tokens.schema.json`.
   - `npm run token-lint:local` — fast semantic checks (key format, required value).
   - `npm run build-tokens:sd` — (optional) generate artifacts locally for preview.
3. Open a PR with a clear summary of token changes and expected impact.
4. CI will run deep semantic checks (`token-lint:ci`) and SD build artifacts; coordinate breaking changes with Token Owner.

## Naming & conventions

- Use `lowercase-with-dots` for token keys (e.g., `color.brand.primary`).
- Keep values explicit (units for sizes, `px/rem` or unitless for line-height as decided by your team).
- Prefer unitless line-height (e.g., `1.5`) and explicit `px` for font sizes to simplify platform transforms.

## Migrations & deprecation

- If removing or renaming a token, add an entry in `tokens/migrations/` and mark the old token `deprecated: true` with `replacement` set.
- Add a migration note to `tokens/CHANGELOG.md`.

## Tools (quick)

- Validate: `npm run token-validate`
- Build (Style Dictionary): `npm run build-tokens:sd`
- Local token-lint (fast): `npm run token-lint:local`
- CI token-lint (deep): `npm run token-lint:ci`
