<!--
What this file is:
A simple, human-friendly list of owners and primary contacts for the design system instance.

Who should edit it:
Design System Lead or whoever runs the initial kickoff. Keep it up-to-date when owners change.

When to update (example):
Update when a new Token Owner, Engineering Lead, or Release Manager is assigned.

Who must approve changes:
Design System Lead and Engineering Lead must approve owner changes (add approval note in PR).
-->

# OWNERS — Design System Contacts & Responsibilities (quick reference)

> Use this file to quickly find who to contact for approvals, incidents, or questions about the design system.

| Role                          | Contact (Slack / handle / email) | Responsibilities (short)                                                           |
| ----------------------------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| Design System Lead            | `@design-lead`                   | Overall owner of the DS roadmap, approves major design decisions, runs governance. |
| Token Owner                   | `@token-owner`                   | Approves token changes, maintains `tokens/tokens.json`.                            |
| Engineering Lead              | `@eng-lead`                      | Approves CI/publish changes and major engineering decisions.                       |
| QA / Accessibility Lead       | `@qa-a11y`                       | Approves accessibility acceptance criteria, runs accessibility audits.             |
| Component Owner — Button      | `@owner-button`                  | Responsible for Button component UX, docs, and acceptance criteria.                |
| Component Owner — Input       | `@owner-input`                   | Responsible for Input component UX, docs, and acceptance criteria.                 |
| Component Owner — (others...) | `@owner-*`                       | Add per-component owners as we expand.                                             |
| Docs Owner                    | `@docs-owner`                    | Maintains docs/ and zeroheight/ publishing workflow.                               |
| Release Manager               | `@release-manager`               | Coordinates releases, changelogs, and publishes packages.                          |
| DevOps / Infra                | `@infra-team`                    | Maintains CI, runners, secrets and package registries.                             |
| Security Contact              | `@security`                      | Reviews sensitive or legal changes (when applicable).                              |
| Product Sponsor               | `@product`                       | Approves success criteria and prioritization.                                      |

---

## How to update owners (recommended process)

1. Create a branch: `ds/stakeholders-owners` (or `org/<org>/owners-update` in an instance repo).
2. Edit `OWNERS.md` and add the new entry.
3. Open a PR titled `chore(gov): update OWNERS — add <role>` and request approvals from **Design System Lead** and **Engineering Lead**.
4. After merge, announce in `#design-system` Slack channel.

> Do **not** put personal mobile numbers, secret emails, or credentials in this file. Use team aliases or Slack handles.

---

## Quick templates

**Slack ping to request approval (copy/paste):**

@design-lead @eng-lead Please review PR #NN "chore(gov): update OWNERS — add @new-owner" — this adds @new-owner as Component Owner for XYZ.

**PR title style:** `chore(gov): update OWNERS — add <role>`
