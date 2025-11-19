<!--
What this file is:
Repository versioning and release policy for tokens, components and packages.

Who should edit it:
Design System Lead (policy) and Engineering Lead (technical details).

When to update (example):
Update when the release cadence changes or when we adopt a different versioning strategy.

Who must approve changes:
Design System Lead and Engineering Lead must approve changes via PR.
-->

# Versioning & Release Policy

This document defines how the design system versions artifacts (tokens, components, packages), how we interpret SemVer, and the release process. It ensures consumers (apps, teams) can rely on predictable upgrades and migrations.

---

## Key principles (short)

- **Semantic versioning (SemVer)** is used: `MAJOR.MINOR.PATCH`.

  - Increment **MAJOR** for breaking changes (API/contract changes or token renames that can break implementations).
  - Increment **MINOR** for additive, backward-compatible changes (new tokens, new component variants).
  - Increment **PATCH** for bug fixes and documentation updates.

- **Separate versioning per publishable artifact**: tokens, `@org/ui` packages, platform packages (iOS/Android), and example apps each have their own version numbers.

- **Backward compatibility is a priority.** Breaking changes must be rare and communicated with migration paths.

---

## What counts as a breaking change

- Renaming or removing a token key (e.g., `color.primary` → `color.brand`) without an aliasing layer or migration.
- Changing component props/contract semantics (e.g., changing `Button` `onClick` behavior, removing required props).
- Removing a published package API.

**If you think the change may be breaking — treat it as breaking.** Propose a migration strategy.

---

## Release types and workflow

### Patch release (no user-visible changes)

- When: bug fixes, documentation clarifications, cosmetic Storybook changes not affecting contracts.
- Who approves: Component Owner or Docs Owner (for docs-only).
- Steps:
  1. Open PR on branch (e.g., `fix/...`).
  2. CI runs tests.
  3. After approvals, merge and publish patch release (Release Manager).

### Minor release (backwards-compatible)

- When: new tokens, new component variants, non-breaking additions.
- Who approves: Token Owner (if tokens), Component Owner & Engineering Lead.
- Steps:
  1. Open PR with changes; include changelog entry.
  2. CI: token schema validation (if tokens), Storybook build.
  3. After approvals, merge. Release Manager publishes minor release.

### Major release (breaking)

- When: any breaking API/token change.
- Who approves: Design System Lead, Engineering Lead, Token Owner, Product Sponsor.
- Steps:
  1. Open a RFC-style PR including: rationale, migration mapping, compatibility plan, migration scripts (if possible), deprecation timeline.
  2. Run broad review (design, eng, QA, product).
  3. Create migration mapping files under [tokens/migrations/](../tokens/migrations/).
  4. Merge to a release branch `release/vX.0.0` and publish with clear communications and migration guides.

---

## Release cadence & tagging

- **Default cadence:** Minor/patch releases every 2–4 weeks; major releases only as required.
- **Tagging:** use annotated Git tags: `v1.2.3` with release notes. Include [CHANGELOG.md](../CHANGELOG.md) update.
- **Draft release:** use `scripts/create-release-draft.js --name vX.Y.Z` to scaffold release notes (see script).

---

## Compatibility & aliasing

- Prefer adding aliases (backwards-compatible tokens) when renaming tokens: add `color.brand` while keeping `color.primary` pointing to the same value and mark `color.primary` deprecated with a deprecation field. This avoids immediate breakage and gives consumers time to migrate.

---

## Emergency / hotfix policy

- For urgent fixes in production, create `hotfix/vX.Y.Z` branch and follow emergency PR process. Notify stakeholders and fast-track approvals from Eng Lead and Release Manager.

---

## Examples

- Add a new token `color.feedback.success` → **minor** release (no breaking).
- Rename `color.action` → `color.primary` with no alias → **major** release (breaking).
- Fix text in docs only → **patch** release.

---

## Enforcement & automation

- CI pipelines must validate SemVer bump consistency vs. changes (future step: add a bot or script to check version changes).
- PRs that change tokens must include [tokens.json](../tokens/tokens.json) diff and pass [tokens.schema.json](../tokens/tokens.schema.json) validation.

---

## Questions / escalation

- If unsure whether a change is breaking, label it **BREAKING-PROPOSED** in your PR and request direct review from the Design System Lead and Engineering Lead.
