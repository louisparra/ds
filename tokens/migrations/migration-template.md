<!--
What this file is:
Human template for documenting a token migration. Copy to a new migration markdown file and fill fields.

Who should edit it:
Token Owner or Migration Author.

When to update (example):
Create one per migration event; update as migration proceeds.

Who must approve changes:
Token Owner & Eng Lead.
-->

# Migration: <YYYY-MM-DD>-<short-slug>

**Summary**  
Describe what this migration does (rename/deprecate/alias) and why.

**Author**

- Name <email@example.com>

**Date**

- YYYY-MM-DD

**Related files**

- `tokens/migrations/<YYYYMMDD>-<short-slug>.json`

**Actions (high-level)**

- `old.key.name` → `new.key.name` (rename)
- `old.other.key` → deprecated, replacement: `some.key` (deprecate)

**Approval**

- Token Owner: @username
- Product/Brand: @username
- Engineering Lead: @username

**Rollout plan**

1. Apply mapping to `tokens/tokens.json` and open PR.
2. Release patch with updated tokens package.
3. Consumer repos update usage; create PRs to adjust imports/usages.
4. After deprecation window, remove old tokens.

**Rollback plan**  
Describe how to revert: restore backup file created by `apply-migration.js` and open a revert PR.
