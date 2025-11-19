<!--
What this file is:
Repository branching policy and examples for the Design System template.

Who should edit it:
Design System Lead and Engineering Lead. Minor clarifications may be added by contributors (via PR).

When to update (example):
Update when branching process / CI gating / or CODEOWNERS changes (e.g., new approvers) — e.g., "Update after we add a new platform or new owners".

Who must approve changes:
Design System Lead and Engineering Lead must approve changes to this file.
-->

# Branching policy — Design System template

This file describes the _official_ branching strategy used across the design system template and any instance repos derived from it. Follow this policy for consistency, traceability, and safe collaboration.

---

## Basic rules (summary)

1. **Never push directly to `ds/main`.** Always create a branch, open a PR, request reviewers, and merge after checks.
2. **Small, focused branches**: each branch should do one thing (e.g., `feature/components/button`, `chore/ci/add-validate`), not multiple unrelated tasks.
3. **Naming convention:** use the format `<prefix>/<scope>-<short-description>` where:

   - `prefix` ∈ {`ds`, `feature`, `chore`, `fix`, `hotfix`, `org`, `release`}
   - `scope` is one of `tokens`, `components`, `ci`, `docs`, `playbooks`, `scripts`, `gov`, `example`, etc.
   - Example: `feature/tokens/initial-skeleton`, `ds/phase0-bootstrap-config`, `chore/ci/add-validate-workflow`.

4. **Protect `ds/main`:** require PR checks and required approvers (see CODEOWNERS). PRs must pass CI tests relevant to changed paths.

---

## Branch types & examples

### A. Template changes (global, affects all instances)

- Purpose: changes to canonical templates and automation used by all projects.
- Branch prefix: `ds/` or `feature/`
- Examples:
  - `ds/bootstrap-readme-roadmap` — add initial README and roadmap.
  - `feature/tokens/initial-skeleton` — add `tokens/tokens.json` skeleton and schema.

### B. Component or token features

- Purpose: add or change components or token definitions.
- Branch prefix: `feature/`
- Examples:
  - `feature/components/button`
  - `feature/tokens/add-spacing-scale`

### C. CI / scripts / infra

- Purpose: add or modify automation or publish flows.
- Branch prefix: `chore/ci-` or `chore/scripts-`
- Examples:
  - `chore/ci/add-validate-workflow`
  - `chore/scripts/bootstrap`

### D. Instance / Org-specific changes

- Purpose: when you instantiate the template for a specific organization, keep org-specific edits in the instance repo under `org/<org-name>/...`.
- Examples:
  - `org/acme/bootstrap-config`
  - `org/acme/custom-branding`

### E. Hotfixes / urgent

- Purpose: emergencies requiring immediate patch.
- Branch prefix: `hotfix/` or `fix/`
- Examples:
  - `hotfix/ci-failure-chromatic`
  - `fix/docs/readme-typo`

---

## Reviewers & CODEOWNERS guidance

Use CODEOWNERS to auto-request reviews based on paths:

- `tokens/**` → `@token-owner @design-lead`
- `components/**` → `@component-owner @eng-lead`
- `scripts/**` & `.github/workflows/**` → `@eng-lead @infra-team`
- `docs/**` & `figma/**` → `@design-lead @doc-owner`

**Minimum reviewers per PR**

- Docs-only: 1 design reviewer + optional PM
- Token or component changes: Token owner + Eng owner + Design Lead
- CI changes: Eng Lead + Infra

---

## CI gating (recommended)

- PR runs:
  - Lightweight checks for docs-only PRs (spelling, lint).
  - Full checks for code/tokens/components (token schema validation, Storybook build, unit tests).
  - Visual regression only for UI/Storybook changes (Chromatic/Percy).
- Protect `ds/main` so merges require all required checks to pass.

---

## Branch lifecycle & housekeeping

- Delete branches after merge (cleanup).
- Rebase or merge main frequently for long-lived branches.
- Stale branch policy: delete branches older than 90 days after confirming no active work.

---

## When to update BRANCHING.md

- Add a new reviewer or team (update CODEOWNERS).
- Shift CI platforms or gating rules (e.g., enabling Chromatic).
- Change naming conventions or add new branch prefixes.

If you update this file, open a PR and request sign-off from the Design System Lead and Engineering Lead.

---

## Quick cheat sheet (one-liners)

- Create branch and start work:
  ```bash
  git checkout -b feature/components/button
  ```
- Push & open PR:
  ```bash
  git push -u origin feature/components/button
  ```
- Recommended PR title:
  ```scss
  feat(components): Add Button component docs and Storybook stories;
  ```
