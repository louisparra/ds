<!--
What this file is:
Top-level orientation for the Figma docs in this repo.

Who should edit it:
Design System Lead or Token Owner.

When to update (example):
Update when folder structure or key doc names change.

Who must approve changes:
Design System Lead.
-->

# Figma library docs — README

This folder contains the Figma-facing guidance for designers who will author and maintain the Figma library that maps to the design system repository.

Contents:

- `FIGMA_LIBRARY_STRUCTURE.md` — how we organize pages, library files, and sections inside Figma.
- `NAMING_CONVENTIONS.md` — exact naming grammar for layers, components, styles, variants, and assets.
- `TOKENS_MAPPING.md` — mapping between `tokens/tokens.json` (dot.path keys) and Figma style/layer names.
- `COMPONENTS_LAYERING.md` — recommended layer order and anatomy for core components (Button, Input, Card, etc.).
- `EXPORT_PLAYBOOK.md` — step-by-step publish and export instructions (plugins, manual) for keeping Figma and repo in sync.

How to use:

1. Read `FIGMA_LIBRARY_STRUCTURE.md` to set up your Figma file (pages and sections).
2. Follow `NAMING_CONVENTIONS.md` when creating components and styles — the repo tooling expects these names.
3. Use `TOKENS_MAPPING.md` when exporting tokens or when you need to map a Figma style to a repo token.

If you're unsure about anything, ping the Design System Lead listed in `tokens/metadata.json`.
