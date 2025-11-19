<!--
What this file is:
Canonical Pull Request template for the design system template repo.

Who should edit it:
Docs Owner or Design System Lead. Update when PR workflow or required checks change.

When to update (example):
Update when new CI checks or required approvers are added.

Who must approve changes:
Design System Lead and Engineering Lead must approve changes to this template.
-->

## Pull Request — short description

**What changed**

- Summary (1-2 sentences):

**Why**

- Short rationale and user-facing impact:

---

## Branch & PR checklist (follow BRANCHING.md)

- Branch name follows branching policy (example): `ds/<phase>-<short>` or `feature/<scope>/<short>`. See `BRANCHING.md`.
- PR targets `ds/main`.
- Link to project config or roadmap if relevant: `project-config.md` / `ROADMAP.md`.

---

## Files changed / scope

- List key files or areas touched (e.g., `tokens/tokens.json`, `components/Button/*`, `scripts/*`).

---

## Tests & validations

- [ ] Token schema validated (if tokens changed).
- [ ] Storybook builds locally and visually reviewed (if components changed).
- [ ] A11y checks run and no critical violations (if UI changes).
- [ ] Unit tests / lint passed where applicable.

---

## Approvals required

Use `governance/pr-approval-matrix.md` to determine required approvers. Common cases:

- tokens → `@token-owner`, `@design-lead`
- components → component owner, `@eng-lead`, `@qa-a11y`
- CI/scripts → `@infra-team`, `@eng-lead`

> Add the required reviewers in GitHub or rely on CODEOWNERS.

---

## Release notes (short)

- Release type: Patch / Minor / Major
- Changelog entry (1-3 bullets):

---

## Implementation notes / migration

- If this is a breaking change, include a migration plan and mapping files under `tokens/migrations/`.

---

## Reviewer checklist (for approvers)

- [ ] I confirm the change follows `BRANCHING.md`.
- [ ] The PR includes tests or a rollout plan.
- [ ] For breaking changes: migration files + communication plan included.
