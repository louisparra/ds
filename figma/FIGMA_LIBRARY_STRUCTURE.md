<!--
What this file is:
Defines canonical Figma file & page structure for the Design System library.

Who should edit it:
Design System Lead or senior designer responsible for the library.

When to update (example):
Update when the library grows new sections (e.g., new platform) or the release process changes.

Who must approve changes:
Design System Lead & Product/Brand.
-->

# Figma library structure

This document prescribes a single predictable organization for the Figma design library so designers and devs can find styles, components, and tokens easily.

## High-level: one canonical library file per product domain

- **One** canonical, published Figma library file per product domain (e.g., `DS.Core`, `DS.Platform`, `DS.Apps`) is recommended.
- Keep the file name short, stable, and prefixed with `DS.` to make it discoverable.

## File organisation (top-level pages)

Inside the file, create these top-level **pages** in this order:

1. **00 - Tokens (source)**

   - Purpose: Figma Styles that correspond to `tokens/tokens.json` (colors, typography styles, spacing tokens represented as named tokens or frames).
   - Contents: Color Styles, Text Styles, Effect Styles, Grid/Layout styles, Motion presets (as annotated frames).
   - Notes: This page is the single Figma view of tokens and must mirror `TOKENS_MAPPING.md`.

2. **01 - Foundations**

   - Purpose: human-friendly representation of foundations (color palette boards, type specimens, spacing scale charts).
   - Contents: static boards illustrating token usage, contrast examples, accessibility notes.

3. **02 - Components (Core)**

   - Purpose: component library for core primitives (Button, Input, Card, Modal, Tooltip, Icon, Grid, Nav, Toast, Avatar).
   - Organization: For each component, create a section with:
     - **Component Frame** named `component/variant/state/label` (see naming guide).
     - Variants grouped under a single `Variants` frame using Figma Variants feature when practical.
     - Each instance annotated with token references (use Figma plugin comments or dedicated text labels).

4. **03 - Patterns / Templates**

   - Purpose: more complex composed patterns and page templates (e.g., list views, forms).
   - Contents: Patterns that reuse components.

5. **04 - Icons**

   - Purpose: icon system (components with boolean variants for filled/outlined if necessary).
   - Contents: single-frame icons named `icon/<purpose>/<name>`.

6. **05 - Deprecated (archive)**

   - Purpose: archived components/styles that are deprecated. Keep them for migration traceability.
   - Always include a deprecation note with replacement token or component key.

7. **06 - Playground / Prototypes**
   - Purpose: living examples, prototypes and experimentation work tied to the library.

## Page / Frame conventions

- Use numeric prefixes (`00 -`, `01 -`) to preserve ordering.
- Each component's page/frame must include:
  - A short description block at the top (purpose, when to use).
  - Token reference table listing the exact token keys used (matching `TOKENS_MAPPING.md`).
  - Accessibility notes (contrast, focus order).

## Publishing workflow (brief)

- Only designated library maintainers publish the library file.
- Publish after:
  - Token changes have passed `token-validate` and `token-lint:ci`.
  - Component and token docs are updated in the repo.
- Document the publish in the PR description (link to `EXPORT_PLAYBOOK.md` for full steps).

## Quick checklist for designers before publishing

- Are color / text styles named following `NAMING_CONVENTIONS.md`?
- Are every component’s token references listed in the description?
- Is deprecated content moved to `05 - Deprecated` with a `replacement` note?
