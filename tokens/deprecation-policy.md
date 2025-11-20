<!--
What this file is:
Formal deprecation & migration policy for design tokens.

Who should edit it:
Token Owner or Design System Lead.

When to update (example):
Update when governance windows or approval flow change.

Who must approve changes:
Token Owner, Product/Brand, and Engineering Lead.
-->

# Token deprecation & migration policy

This document explains how tokens are deprecated, what metadata is required, the minimum notice window, and the approval flow.

## Key rules

- **Soft deprecation first**: mark tokens as `deprecated: true` and provide a `replacement` token key before removing or renaming.
- **Minimum notice window**: 2 weeks for minor tokens; 4 weeks for brand/marketing tokens or tokens used by external consumers.
- **Communication:** Add an entry to `tokens/CHANGELOG.md` and mention the PR to `#design-system` slack channel and relevant repo owners.
- **Approvals:** Token Owner + Product/Brand must approve deprecations; Engineering Lead must approve migrations that require code changes.

## Metadata required for deprecation

When deprecating a token, update the token object with:

- `deprecated: true` (boolean)
- `replacement`: `"dot.path.to.replacement"` (string) **or** `replacement: null` if there is no direct replacement (rare)
- `deprecatedAt`: `"YYYY-MM-DD"` (recommended)
- `deprecationWindowDays`: `14` (optional override)

Example:

```json
"color": {
  "brand": {
    "secondary": {
      "value": "#5e5ce6",
      "type": "color",
      "deprecated": true,
      "replacement": "color.brand.primary",
      "deprecatedAt": "2025-11-20",
      "deprecationWindowDays": 28,
      "description": "Deprecated in favor of consolidated brand color"
    }
  }
}
```

## Removal policy

- Do **not** remove a token until:
  1. The deprecation window has passed, **and**
  2. Consumers (packages / apps) have migrated (verified via PRs / CI), **and**
  3. The Token Owner & Eng Lead approve removal and update `tokens/CHANGELOG.md`.
- Prefer automated migration updates and coordinated releases for large-scale renames.

## Emergency fixes

- If a token must be changed urgently (bugfix that breaks app), coordinate a fast-track change with approvals recorded in the PR, and document the change in `tokens/CHANGELOG.md`.

## Who to notify

- Tag `@token-owner` and the list of known consumer repo owners in PRs.
- Post a short note to `#design-system` and `#engineering` channels when you start a migration that will affect multiple repos.
