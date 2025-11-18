<!--
What this file is:
A copy-paste-ready release notes template used to create release drafts and release pages.

Who should edit it:
Release Manager or the person drafting the release notes.

When to update (example):
Update for each release draft; keep the template unchanged unless release format changes.

Who must approve changes:
Design System Lead and Release Manager.
-->

# Release Notes — [vX.Y.Z] — DRAFT

**Release date (planned):** YYYY-MM-DD  
**Release type:** Patch / Minor / Major  
**Prepared by:** @release-manager

---

## Summary
_A short summary of what this release contains (1–2 lines)._

---

## Highlights (what's new)
- Feature: Brief description.
- Token: New tokens added ([tokens.json](../tokens/tokens.json)).
- Component: New or improved components (list components).

---

## Breaking changes (if any)
- Describe breaking changes and the effect on consumers.
- Point to migration mappings in [tokens/migrations/](../tokens/migrations/) (file names).

---

## Migration guide / How to upgrade
1. Update package to `vX.Y.Z`.  
2. Run migration script: `node scripts/migrate-tokens.js --mapping tokens/migrations/vX-to-vY-mapping.json` (if provided).  
3. Run tests and visual regressions.

---

## Changelog (detailed)
- `packages/tokens`: list of token changes/added/removed.  
- `packages/ui-react`: list of component changes.

---

## QA checklist
- [ ] Storybook builds and previews are published.  
- [ ] Chromatic/Percy visual regression passes or diffs are acknowledged.  
- [ ] A11y checks passed for changed components.  
- [ ] Migration mapping files present (if applicable).

---

## Communication plan
- Announce in `#design-system` Slack with links.  
- Email to impacted teams (Product, Platform).  
- Schedule migration workshop (if major).

---

## Release artifacts & links
- Storybook: [link]  
- Release tag: `vX.Y.Z`  
- Migration mapping: `tokens/migrations/vX-to-vY-mapping.json`