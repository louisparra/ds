<!--
What this file is:
Matrix mapping repository paths to required approvers for PRs. Use this to configure CODEOWNERS and PR templates.

Who should edit it:
Design System Lead and Engineering Lead. Update when new areas or owners are added.

When to update (example):
Update when a new component owner or a new workflow is added that changes approval requirements.

Who must approve changes:
Design System Lead & Engineering Lead.
-->

# PR Approval Matrix — which approvers are required per path

Use this matrix when opening a PR: include the required reviewers listed below.

| Path pattern           | Required approvers (minimum)                       | Notes                                                        |
| ---------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| `tokens/**`            | `@token-owner`, `@design-lead`                     | Token schema validation must pass; include migration plan if breaking. |
| `components/**`        | `@component-owner`, `@eng-lead`, `@qa-a11y`        | Storybook stories + acceptance criteria required.            |
| `packages/**`          | `@eng-lead`, `@release-manager`                    | Package build & publish scripts must be included.            |
| `scripts/**`           | `@eng-lead`, `@infra-team`                         | CI-safe scripts only.                                        |
| `.github/workflows/**` | `@infra-team`, `@eng-lead`                         | Changes to CI require infra approval.                        |
| `docs/**`              | `@docs-owner`, `@design-lead`                      | Docs-only PRs require at least one design reviewer.          |
| `figma/**`             | `@design-lead`                                     | Figma ownership and mapping changes.                         |
| `assets/**`            | `@design-lead`, `@security` (if licenses involved) | Asset licensing must be clear.                               |
| `governance/**`        | `@design-lead`, `@eng-lead`                        | Governance changes need both approvals.                      |

---

## How to use this matrix
- When you open a PR, request the listed approvers.  
- If the PR touches multiple paths, include approvers for all relevant rows.

---

## Example PR checklist (add to PR description)
- [ ] Token schema validation passed (if tokens changed).  
- [ ] Storybook built (if components changed).  
- [ ] Visual diff reported (Chromatic/Percy link, if applicable).  
- [ ] QA / A11y sign-off captured in PR comments (if required).

---

## Mapping to CODEOWNERS
Use the rows above to inform entries in `.github/CODEOWNERS` (this file exists in the root and should mirror this matrix).