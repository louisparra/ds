<!--
What this file is:
Changelog for token-level breaking changes and migration notes.

Who should edit it:
Token Owner when making breaking changes.

When to update (example):
Add an entry when deprecating or renaming tokens.

Who must approve changes:
Token Owner & Product/Release Manager.
-->

# Tokens changelog

All meaningful token changes (renames, deprecations, replacements) should be recorded here with date, summary, and migration steps.

## Unreleased

- (empty)

## Example entry

### 2025-11-18 — Deprecate `color.brand.secondary`

- Reason: consolidating brand palette into `color.brand.primary` + accents.
- Migration: replace usages of `color.brand.secondary` with `color.brand.primary` where appropriate.
- Files changed: `tokens/tokens.json`, `packages/ui-react/src/Button.js`
