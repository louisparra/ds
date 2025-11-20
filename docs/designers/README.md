<!--
What this file is:
Top-level narrative for designer-facing recipes and why they matter.

Who should edit it:
Design System Lead or Design Ops.

When to update (example):
Update when major workflow or tooling changes (new plugin, schema update).

Who must approve changes:
Design System Lead & Token Owner.
-->

# Designer-facing narrative & recipes — README

This folder contains **practical recipes** and short how-tos to help designers author tokens and components so the design system pipeline, adapters, and engineers can consume them reliably.

Purpose

- Explain _why_ tokens must be authored in a certain way (minimize ambiguity, avoid accidental breaking changes).
- Provide _how-to_ steps designers can follow (export, name, verify).
- Offer quick checklists and reproducible commands to preview changes locally and in CI.

Quick start (what to read first)

1. `token-authoring.md` — how to author colors, type, spacing, motion and modes. Read this first if you're changing tokens.
2. `component-authoring.md` — how to name components and annotate token usage.
3. `release-and-migrations.md` — process for making token or component changes safely.
4. `accessibility-and-a11y-recipes.md` — accessibility checks every PR should pass.
5. `visual-testing-recipes.md` — how to capture assets and snapshots for visual regression.

How this folder relates to the repo

- Adapters/readers (under `scripts/adapters/`) expect exports shaped according to the token-authoring recipes.
- The canonical token file `tokens/tokens.json` is the single source of truth — follow the naming schemes here to keep that file stable.
- Use `figma/FIGMA_STYLE_MAP.json` for explicit mappings when legacy style names exist.

If you are new

- Follow `token-authoring.md` to author tokens.
- Run the adapter + dry-run steps in `EXPORT_GUIDE.md` (top-level `figma/EXPORT_GUIDE.md`) before opening a PR.
- Ask the Token Owner for a 15-minute walkthrough if you are changing many tokens.

Want more help?

- Ping `@<design-system-lead>` for onboarding or to request a short walkthrough of the export workflow.
