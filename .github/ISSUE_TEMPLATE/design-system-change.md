---
name: Design system change
about: Propose a token or component change (use this for token renames, new component, or API changes)
title: "[DS CHANGE] short description"
labels: ds-change
assignees: ''
---

<!--
What this file is:
Template for proposing changes specific to the design system (tokens, components, theming).

Who should edit it:
Token Owner, Component Owner, or a Design System contributor.

When to update (example):
Update when the approval matrix or required artifacts change.

Who must approve changes:
Token Owner and Engineering Lead (see `governance/pr-approval-matrix.md` for required approvers).
-->

## Short description
Describe the proposed change and the motivation.

## Files impacted
- `tokens/tokens.json` (if tokens)
- `components/<Component>/docs.md` (if component)
- `storybook` (if stories change)

## Backwards compatibility
- Is this breaking? Yes / No  
- If yes, include migration mapping and propose deprecation timeline (see `governance/deprecation-policy.md`).

## Migration plan
- Mapping file: `tokens/migrations/vX-to-vY-mapping.json` (if applicable)  
- Scripts / code-mod suggestions:

## Tests & validation
- Storybook story to validate (link)  
- A11y checks required: yes/no

## Approvals required
Based on `governance/pr-approval-matrix.md` — list the owners you’ll request:
- @token-owner
- @component-owner
- @eng-lead

---

### Checklist before opening PR
- [ ] Draft mapping files (if renaming/removing tokens)  
- [ ] Create Storybook stories demonstrating new behavior  
- [ ] Add unit tests (if applicable)