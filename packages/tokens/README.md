<!--
What this file is:
README for the tokens package. Describes canonical tokens and how Style Dictionary produces platform artifacts.

Who should edit it:
Token Owner or Docs Owner.

When to update (example):
Update when SD config, outputs, or entrypoints change.

Who must approve changes:
Token Owner and Design System Lead.
-->

# @ds/tokens — Canonical tokens package (Style Dictionary)

This package contains the canonical tokens and the output artifacts produced by Style Dictionary.

## Source

- `tokens/tokens.json` — canonical nested token source (authored by designers/token owners).

## Generated outputs (via Style Dictionary)

After running `npm run build-tokens:sd` (or `node scripts/build-tokens-sd.js`), look for:

- `packages/tokens/dist/web/tokens.css` — CSS custom properties (use in web).
- `packages/tokens/dist/web/tokens.json` — flattened JSON (dot.path keys).
- `packages/tokens/dist/android/colors.xml` — Android colors.
- `packages/tokens/dist/android/dimens.xml` — Android dimens (spacing, sizes).
- `packages/tokens/dist/ios/Colors.plist` — iOS-friendly color plist.

## Quick start

```bash
# Ensure Node 18+ and install dev deps
npm ci

# Validate tokens against schema
npm run token-validate

# Build platform artifacts via Style Dictionary
npm run build-tokens:sd
```

## Notes

- We keep `scripts/build-tokens.js` as a simple fallback (legacy) builder. Prefer the SD build for consistent platform outputs.
- If you rename tokens or change token structure, update `tokens/tokens.schema.json` and inform the Token Owner. Use aliases or migration mapping to avoid breaking consumers.
