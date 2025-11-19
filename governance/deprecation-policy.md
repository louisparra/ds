<!--
What this file is:
Deprecation policy describing lifecycle for deprecated tokens/components, communication plan and timelines.

Who should edit it:
Design System Lead and Token Owner when making deprecation decisions.

When to update (example):
Update when a token or component is marked deprecated or when the deprecation window policy changes.

Who must approve changes:
Design System Lead and Engineering Lead must approve deprecation decisions.
-->

# Deprecation Policy & Migration Lifecycle

Deprecation is the formal process for retiring tokens, component props, or APIs. This policy standardizes how we announce deprecations, how long consumers have to migrate, and how we assist migration.

---

## Deprecation lifecycle (recommended default)

1. **Proposal (PR)** — a PR proposes deprecation, including: reason, replacement, migration steps, and suggested timeline. (Author: owner)
2. **Announcement & Soft-deprecation (T0)** — merge change with `deprecated: true` metadata in token or component doc; maintain both old and new for the duration. Update [deprecated-tokens.json](../tokens/deprecated-tokens.json) and [tokens/migrations/\*](../tokens/migrations/). Announce to DS channel.
3. **Migration period (T1)** — default **3 releases** or **90 days** (whichever is longer). During this time:
   - CI will flag usages of deprecated items (token-lint).
   - Provide a migration script or code samples in [tokens/migrations/](../tokens/migrations/).
   - Owners track progress with the migration log.
4. **Removal (T2)** — after migration window, remove deprecated item in a **major** release with explicit communication and migration guides.

> Timelines can be shortened or extended by agreement between Design System Lead and Engineering Lead.

---

## How to mark a token/component as deprecated

- Add `"deprecated": true`, `"deprecatedDate": "YYYY-MM-DD"`, `"replacement": "token.path.replacement"` metadata to [tokens.json](../tokens/tokens.json) entry. Example:

```json
"color.action": {
  "value": "#0a84ff",
  "deprecated": true,
  "deprecatedDate": "2025-11-16",
  "replacement": "color.primary"
}
```

- Add an entry in [deprecated-tokens.json](../tokens/deprecated-tokens.json) with rationale and migration steps.

---

## Communication & documentation

- **Announcement channels:** `#design-system` Slack, email to affected teams, and a release note entry.
- **Documentation:** update the component token docs and [tokens/migrations/](../tokens/migrations/) with examples.
- **Migration workshops:** optional live session or recorded walkthrough for high-impact changes.

---

## Tooling & automation expectations

- Token-lint scripts should surface deprecated token usage (we will add `scripts/token-lint.js`).
- CI should fail PRs only if using **removed** items — during migration window, PRs should warn but not fail.

---

## Rollback options

- If removal caused unexpected large-scale breakages, the Release Manager and Eng Lead may revert the removal and extend the migration window.

---

## Example deprecation scenario

1. Token `color.positive` is replaced by `color.success`.
2. PR marks `color.positive` as deprecated; adds `color.success`. Update [deprecated-tokens.json](../tokens/deprecated-tokens.json).
3. Announce and allow 3 releases to migrate. Token-lint warns on usage. Provide migration script.
4. After migration window, remove `color.positive` in a major release.
