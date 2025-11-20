<!--
What this file is:
Process and recipe for proposing token/component changes, deprecation and migration guidance.

Who should edit it:
Product/PM, Token Owner, or Design System Lead.

When to update (example):
Update when deprecation windows or release cadence changes.

Who must approve changes:
Token Owner & Product Manager.
-->

# Release & migration recipes — safe token changes

This guide explains the end-to-end process to change tokens or component contracts safely, minimizing downstream developer churn.

## When to treat as a breaking change

- Removing a token entirely.
- Renaming a token (dot.path change).
- Changing token semantics (e.g., `color.brand.primary` meaning change).
- Contract changes to core components (props removed, behavior changed).

---

## Recommended cadence & windows

- **Minor cosmetic edits** (value tweaks): can be landed in regular sprints after PR review.
- **Token renames / removals**: follow a staged migration:
  1. Add new token (new.key) alongside old (old.key) — publish in patch/minor release.
  2. Update components to use new token (developer work).
  3. After migration window (recommended 2 release cycles / ~4–8 weeks), remove old token with deprecation notice in changelog.

**Deprecation window:** default 2 release cycles (adjust per org).

---

## PR contents for token rename (recipe)

- Include adapter export and canonical JSON showing the new token.
- Add migration notes in PR describing:
  - Why the rename is needed.
  - Components impacted.
  - Suggested migration steps for developers (code snippets).
- Label the PR `ds-change` and request Token Owner approval.

---

## Automated support

- Add a migration mapping file in `tokens/migrations/` (e.g., `v1-to-v2-mapping.json`) that maps old -> new keys.
- CI has a job that runs `scripts/report-migrations.js` to produce a migration report and posts it to the PR (if script present).

Example migration mapping:

```json
{
  "migrations": [
    { "from": "color.brand.primary", "to": "color.brand.main", "note": "renamed for clarity" }
  ]
}
```

---

## Rollback plan

- Keep deprecation metadata (e.g., `tokens/deprecated-tokens.json`) for at least the window period.
- If a change causes urgent regressions, revert the PR and open a follow-up with smaller, incremental fixes.

---

## Developer coordination

- Notify component owners in PR description and Slack.
- Include code-mod suggestions where possible (e.g., sed/TS codemods) to accelerate migration.

---

## Checklist before merging a token rename/removal PR

- [ ] Token Owner signed off.
- [ ] Migration mapping added to `tokens/migrations/`.
- [ ] Dry-run shows clear list of token updates and consumers.
- [ ] Developer owners acknowledged and a migration plan is attached.
- [ ] CI migration report (if configured) passes with no unexpected conflicts.

---

## Example PR text snippet to include

> **Migration:** Renaming `color.brand.primary` → `color.brand.main`.
> **Why:** Clarifies brand semantics and aligns with visual language.
> **Migration plan:**
>
> 1. Teams should update usages to `color.brand.main`.
> 2. Old token retained for 2 release cycles.
> 3. A codemod is included in `scripts/codemods/rename-color-brand-primary.js` (if available).
