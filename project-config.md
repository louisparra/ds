<!--
What this file is:
A project-specific configuration questionnaire used to adapt the design-system template to the organization's constraints.

Who should edit it:
The designer bootstrapping the template (or design system lead) — fill answers during the first discovery/kickoff.

When to update (example):
Update after kickoff when devs confirm frameworks, token pipeline, CI, owners, or release cadence.

Who must approve changes:
Design System Lead and Engineering Lead must approve the final answers (add their names in the Owners section).
-->

# Project Configuration (project-config.md)

> Fill this file during discovery / kickoff. Answers here are used to configure the design-system template for this organization.
> If you prefer a guided flow, run: `node scripts/bootstrap-template.js --init` (see scripts/bootstrap-template.js for usage).

---

## Basic project info
- **Project / Org name:** `Your Org / Project name`  
  _Example:_ `Acme Payments`

- **Repository URL:** `https://github.com/your-org/your-repo`  
  _If private, paste the repo path or write "private"._

- **Primary contact (Design System Lead):** `@handle or name`  
- **Engineering Lead:** `@handle or name`  
- **Product / PM contact:** `@handle or name`  
- **QA / Accessibility contact:** `@handle or name`

---

## Platforms & stacks (choose the primary)
- **Primary platform(s)** (select all that apply):  
  - `[ ]` Web  
  - `[ ]` iOS (native)  
  - `[ ]` Android (native)  
  - `[ ]` React Native  
  - `[ ]` Flutter  
  - `[ ]` Other: `_________`

- **If Web:** primary framework: `React / Vue / Svelte / Web Components / Plain JS`  
  _Example:_ `React`

- **Web styling approach (if Web):** `CSS / CSS Modules / CSS-in-JS (styled-components/emotion) / Tailwind / Utility`  
  _Example:_ `CSS-in-JS (Emotion)`

- **Native choices (iOS):** `SwiftUI / UIKit / Mixed`  
- **Native choices (Android):** `Jetpack Compose / XML / Mixed`

---

## Tokens & design-system pipeline
- **Canonical token format accepted?** (we use `tokens/tokens.json` by default)  
  - `[ ]` Yes — we will use `tokens/tokens.json` as source of truth  
  - `[ ]` No — preferred format: `_________`

- **Token pipeline preference**:  
  - `[ ]` Style Dictionary (recommended)  
  - `[ ]` Figma Tokens plugin  
  - `[ ]` Manual (no token pipeline)  
  - `[ ]` Other: `_________`

- **Component distribution model:**  
  - `[ ]` `npm` / private registry (packages)  
  - `[ ]` Monorepo workspaces (yarn/npm workspaces)  
  - `[ ]` Storybook-only (docs only)  
  - `[ ]` Other: `_________`

---

## Icons & assets
- **Icon strategy:**  
  - `[ ]` SVG components (recommended for web)  
  - `[ ]` Icon sprite sheet  
  - `[ ]` Icon font  
  - `[ ]` SF Symbols / system icons (iOS)  
  - `[ ]` Other: `_________`

- **Illustrations / photos hosting:** `S3 / Cloudinary / Git LFS / repo / other` — `_________`

---

## CI, visual tests & publishing
- **CI system:** `GitHub Actions / GitLab CI / CircleCI / Other` — `_________`  
- **Visual regression tool:** `Chromatic / Percy / None / Other` — `_________`  
- **Publish on merge?** (artifact publish)  
  - `[ ]` Yes — publish tokens / packages on tag/merge  
  - `[ ]` No — manual publish only

---

## Accessibility, localization & performance
- **A11y owner:** `@handle or name`  
- **i18n required?** (languages & RTL) — list languages and whether RTL support is required: `_________`  
- **Performance constraints:** `low-bandwidth targets / image-heavy / legacy devices / TTI budgets` — `_________`

---

## Governance & process
- **Preferred release cadence for tokens/components:** `Weekly / Biweekly / Monthly / On-demand` — `_________`  
- **Deprecation window for breaking changes:** `e.g., 3 releases / 30 days / 90 days` — `_________`  
- **Design owner(s) for tokens:** `team or person` — `_________`  
- **Engineering owner(s) for tokens/component packages:** `team or person` — `_________`

---

## Pilot & success criteria
- **Pilot area(s) (first pages / flows to migrate):**  
  - `1)` `_________`  
  - `2)` `_________`  
  - `3)` `_________`

- **Initial success criteria (fill SMART goals):**  
  - Adoption target (e.g., `%` token usage or component usage): `_________`  
  - Quality target (e.g., 0 critical a11y violations): `_________`  
  - Velocity target (e.g., reduce dev time by X%): `_________`

---

## Access & credentials (do not store secrets here)
> **Do not** paste passwords, API keys, or PII. Use team/role names and request secrets via your organization's secure channel.

- **Figma team / file link:** `_________`  
- **Who can grant access to Figma:** `_________`  
- **Who can grant repo access:** `_________`

---

## Notes & special constraints
- Add any legal, regulatory, or organizational constraints relevant here (data residency, compliance, procurement limits):  
  `_________`

---

## Timestamps & approvals
- **Date populated:** `YYYY-MM-DD`  
- **Populated by:** `@handle or name`  
- **Design Lead approval:** `@handle (signature/comments)`  
- **Engineering Lead approval:** `@handle (signature/comments)`

---

## How to use this file
- Save this file to the repository root. It is used by the bootstrap script (`scripts/bootstrap-template.js`) when run in `--init` mode to create a filled config.  
- Non-developers: you can fill this directly in GitHub using **Add file → Create new file** and commit to a branch, then open a PR for approvals.