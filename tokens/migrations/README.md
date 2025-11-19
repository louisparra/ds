<!--
What this file is:
Guide to migration mapping files for tokens and how to add migration mappings for releases.

Who should edit it:
Token Owner and developer creating migration mappings or scripts.

When to update (example):
Update when preparing a release that includes token renames or removals.

Who must approve changes:
Token Owner and Engineering Lead must approve migration mappings.
-->

# Token Migrations — README

This folder stores mapping files and guidance to help consumers migrate from one token version to another. Use these files to automate or script token name replacements.

---

## File naming convention

- `v1-to-v2-mapping.json` — mapping from tokens in version 1 to tokens in version 2.
- `v2-to-v3-mapping.json` — etc.

Each mapping file is a simple JSON object where keys are old token paths and values are new token paths:

```json
{
  "color.action": "color.primary",
  "spacing.3": "spacing.4"
}
```

---

## How to create a mapping file

1. Create `tokens/migrations/vX-to-vY-mapping.json`.
2. In your PR, include automated tests or a sample script showing how to apply the mapping to a codebase or design files.
3. Add usage examples in the PR description and in `tokens/migrations/README.md`.

---

## Suggested workflow

- When proposing breaking token changes, include a migration mapping and a small script (or instructions) that scans the codebase and suggests replacements. This helps teams migrate quickly and reduces friction.

---

## Tools

- We will later provide `scripts/migrate-tokens.js` to apply mappings in codebases. For now, include the mapping file and manual instructions in the PR.
