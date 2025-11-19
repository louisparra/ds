<!--
What this file is:
Detailed descriptions of each governance role, responsibilities, and examples of expected actions.

Who should edit it:
Design System Lead (for role definitions) and HR/People Ops (for team assignments).

When to update (example):
Update when roles or responsibilities change (e.g., new token owner assigned).

Who must approve changes:
Design System Lead and Engineering Lead.
-->

# Roles & Responsibilities — Design System Governance

This document explains what each role does and provides concrete examples of tasks they perform.

---

## Design System Lead

**Primary responsibilities**

- Owns strategy and roadmap for the DS.
- Chairs governance meetings and office hours.
- Final approver for major design or policy changes.

**Examples**

- Approve a breaking token rename that affects multiple teams.
- Run monthly DS health review and update [roadmap](../ROADMAP.md).

---

## Token Owner

**Primary responsibilities**

- Maintains [tokens.json](../tokens/tokens.json) and token schema.
- Reviews and approves token-change PRs.
- Coordinates migration plans for deprecated tokens.

**Examples**

- Merge PR that adds a new semantic color token after validation and storybook review.

---

## Engineering Lead

**Primary responsibilities**

- Reviews CI/scripts and approves publish flows.
- Ensures packages build across supported platforms.
- Reviews high-impact technical changes.

**Examples**

- Approve [ci-generate-and-publish-artifacts.yml](../.github/workflows/ci-generate-and-publish-artifacts.yml) changes.

---

## Component Owner (per component)

**Primary responsibilities**

- Responsible for UX, docs, and acceptance criteria for a specific component (e.g., Button).
- Maintains `components/<Component>/docs.md` and stories.

**Examples**

- Update Button docs to include a new variant and ensure Storybook has matching stories.

---

## QA / Accessibility Lead

**Primary responsibilities**

- Validates components against accessibility acceptance criteria.
- Runs axe and manual screen reader checks for components.

**Examples**

- Review Storybook accessibility report for the Input component and approve before merge.

---

## Docs Owner

**Primary responsibilities**

- Maintains [docs/](../docs/) and publishing to Zeroheight/GitHub Pages.
- Ensures narrative docs are aligned with canonical component docs.

**Examples**

- Publish an updated "How to use tokens in Figma" page.

---

## Release Manager

**Primary responsibilities**

- Coordinates release pipeline and writes release notes.
- Publishes packages to registries according to release cadence.

**Examples**

- Run [publish-packages.sh](../scripts/publish-packages.sh) and create a release tag, then notify stakeholders.

---

## DevOps / Infra

**Primary responsibilities**

- Maintain CI runners, secrets, and pipelines.
- Ensure Storybook deployment and visual regression service availability.

**Examples**

- Update GitHub Actions to add a new secret for Chromatic.

---

## Security Contact

**Primary responsibilities**

- Review changes that may affect security or compliance.
- Guide removal of sensitive fixtures or data.

**Examples**

- Approve or reject a PR containing a new external service integration with sensitive data handling.

---

## How to decide who to contact

- For token changes: ping **Token Owner** and **Design System Lead**.
- For CI or infra changes: ping **Engineering Lead** and **Infra**.
- For accessibility approvals: ping **QA / Accessibility Lead**.
