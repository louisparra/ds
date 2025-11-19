<!--
What this file is:
Operational playbook for publishing the Figma library and exporting tokens to the repo.

Who should edit it:
Design System Lead or Release/Library Maintainer.

When to update (example):
Update when export process, plugin choices, or token mapping changes.

Who must approve changes:
Design System Lead & Engineering Lead.
-->

# Export playbook — publish & sync Figma → repo

This playbook documents the manual and plugin-based steps maintainers should follow to publish updates to the Figma library and export tokens for the repository.

## Before you start

- Ensure you have library maintainer permissions in the Figma file.
- Ensure `tokens/tokens.json` in the repo is up to date and that local `npm run token-validate` passes.
- Design changes that affect tokens must be coordinated with Token Owner + Eng Lead (see `tokens/deprecation-policy.md`).

## Option A — Using the Figma Tokens plugin (recommended)

1. Install and open the **Figma Tokens** plugin in the `DS.<library>` file.
2. Map Figma styles to token keys:
   - Use `TOKENS_MAPPING.md` as a reference — ensure each style description contains the repo token key (`tokens: color.brand.primary`).
3. Export tokens:
   - In plugin: Export > JSON > choose dot-path format (replace `/` with `.` if plugin requires).
4. Commit exported JSON:
   - Save file locally as `tokens/tokens.from-figma.json` and open PR against the repo branch `ds/figma-sync-<date>`.
   - In PR description include a short summary and link to the Figma file and the change preview.
5. Run CI and validation:
   - CI will run `npm run token-validate` and `token-lint:ci`.
6. After CI and reviews, merge PR — maintainers publish the Figma library version.

## Option B — Manual export (quick edits)

1. Open `00 - Tokens (source)` page.
2. For each style, copy its hex/value and update `tokens/tokens.json` manually (use the canonical keys).
3. Run `npm run token-validate` locally.
4. Open PR and follow the same review rules as Option A.

## Publishing the Figma library

1. After the tokens PR is merged, update Figma components to reference new styles (if needed).
2. Library maintainer: Publish > Update library in Figma (top-right “Publish” button).
3. Update `figma` docs in the repo with release notes (short summary + token keys changed).

## Automation tips

- Aim to keep the `tokens/tokens.json` file as the single source-of-truth. Use plugin exports to generate PRs but manually review all automated changes.
- Add the `tokens:` annotation in style descriptions so exporters map styles accurately.

## Rollback note

- If you accidentally publish broken tokens, revert the repo PR and publish a new library version that reverts the Figma file or restores previous styles from the `05 - Deprecated` page.

## Quick checklist before publishing

- `npm run token-validate` passes locally.
- `token-lint:ci` passes in CI for changed tokens.
- Figma styles have `tokens:` annotations.
- PR description includes list of token keys changed and components impacted.
