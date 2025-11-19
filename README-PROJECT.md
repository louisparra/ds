<!--
What this file is:
A short, project-specific one-page overview of the design system instance.

Who should edit it:
The designer who boots the template for this organization. Update when the project name, primary contacts, or initial scope change.

When to update (example):
Update after the kickoff meeting or when owners/contacts change.

Who must approve changes:
Design System Lead and Engineering Lead.
-->

# Project README — Design System (project instance)

**Project / Org:** _[Insert project or org name here]_  
**Short purpose:** _One sentence describing why this design system exists for this org (e.g., "Provide a shared token & component library to speed UI development and improve consistency across product pages")._

---

## Quick start (what to do in your first 30 minutes)

1. Read this file top-to-bottom.
2. Open the Figma library link (ask your design lead if you don't have it).
3. Check [OWNERS.md](OWNERS.md) for who to contact about tokens or code.
4. Open Storybook preview (link added below once Storybook is published).

---

## Scope (initial)

- **Core platforms supported (initial):** Web-first (React examples), with generated mappings for iOS/Android.
- **Core components (initial "Core 10"):** Button, Input, Card, Modal, Tooltip, Icon, Grid, Nav, Toast, Avatar.
- **Canonical token file:** [tokens.json](tokens/tokens.json) (edit here only; see tokens [README](tokens/README.md)).
- **Designer view:** Figma library (page: `00_TOKENS`, `01_SYSTEM`, `02_PATTERNS`).
- **Developer view:** Storybook (MDX) + packages in `packages/`.

---

## Owners & Contacts (fill these in now)

- **Design System Lead:** _@name_ — overall owner (approvals, roadmap)
- **Token Owner:** _@name_ — approves token changes
- **Engineering Lead:** _@name_ — approves publish + CI changes
- **QA / Accessibility Lead:** _@name_ — accessibility sign-off  
  _(Replace `@name` with team handles; update [OWNERS.md](OWNERS.md) as the authoritative file.)_

---

## Success Criteria (initial — SMART style)

These are early measurable targets for the first 3 months (adjust after kickoff):

- **Adoption:** 25% of new UI code uses `@org/ui` components (measured by [token-usage-scan.js](metrics/token-usage-scan.js) or manual repo checks).
- **Quality:** Zero critical a11y violations for Core 10 components in Storybook (automated axe + manual verification).
- **Velocity:** Reduce average dev time to implement a new screen by 15% for the pilot flow.
- **Stability:** Visual diffs per release <= 10 (Chromatic/Percy measured).

> We will improve these after baseline collection — see [measurement plan template](docs/measurements/measurement-plan-template.md).

---

## Key links (add after setup)

- Figma library: _[link to Figma file]_
- Storybook preview: _[link after CI publishes]_
- Repo: _[link to repo]_
- Roadmap: [ROADMAP.md](ROADMAP.md) (this repo)
- Measurement plan: [measurement-plan-template.md](docs/measurements/measurement-plan-template.md)

---

## How to use this file

- A designer: update the **Owners & Contacts** section and the **Quick start** checklist after access is granted.
- A product manager: review and confirm the Success Criteria during kickoff.
- A developer: follow the "Canonical token file" rule — tokens live at [tokens.json](tokens/tokens.json).

---

## Change log

- _YYYY-MM-DD_ — Created initial project README.
- (Use [CHANGELOG.md](CHANGELOG.md) for more granular release history.)
