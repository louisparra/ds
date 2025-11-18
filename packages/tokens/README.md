<!--
What this file is:
README for the tokens package. Describes where canonical tokens live and how to build/use token outputs.

Who should edit it:
Token Owner or Docs Owner.

When to update (example):
Update when build outputs or entrypoints change (e.g., change dist path).

Who must approve changes:
Token Owner and Design System Lead.
-->

# @ds/tokens — Canonical tokens package

This package contains the canonical tokens for the design system.

## Structure
- [../../tokens/tokens.json](../../tokens/tokens.json) — canonical nested token source (root of repo).
- [dist/tokens.json](dist/tokens.json) — flattened key -> value JSON created by `build`.
- [dist/tokens.css](dist/tokens.css) — CSS custom properties output of tokens build.

> Note: The canonical authored file is [tokens.json](../../tokens/tokens.json) at the repository root. [packages/tokens](../tokens) exists as the consumer-facing package (dist folder) and can be published later.

## Quick commands (from repo root)
```bash
# install deps (root)
npm run bootstrap

# validate tokens (schema)
npm run token-validate

# build tokens (outputs to packages/tokens/dist/)
npm run build-tokens
# or
npm run build:packages   # will run build across packages (invokes build-tokens via package script)
```

## How consumers use it

- Web: include [packages/tokens/dist/tokens.css](dist/tokens.css) in the HTML to get CSS variables.
- JS: import `@ds/tokens` (after publishing) or read [packages/tokens/dist/tokens.json](dist/tokens.json).