<!--
What this file is:
Precise naming grammar for Figma layers, components, styles and assets.

Who should edit it:
Design System Lead or Token Owner.

When to update (example):
Update when repo naming or CSS naming conventions change.

Who must approve changes:
Design System Lead & Engineering Lead.
-->

# Figma naming conventions — grammar & examples

This file codifies the single naming language designers must use in Figma so automation, tokens mapping and developer handoff are reliable.

## Overarching rules

- Always use **lowercase** for tokens and use `kebab-case` for CSS-like names. (Figma allows mixed case for component names but keeping a consistent lower/ kebab/pascal style reduces errors.)
- Use the canonical **dot.path** token keys for repository tokens and map them to Figma style names using `TOKENS_MAPPING.md`.
- Component and layer naming grammar uses slashes for hierarchy and `component/variant/state/label` for frames.

## Component naming (frames & components)

- Format: `component/<component-name>/<variant>/<state>/<label?>`
  - Examples:
    - `component/button/primary/default`
    - `component/button/primary/hover`
    - `component/input/filled/focus/with-icon`
- If using Figma Variants, the main component name becomes `component/button` and variant properties adhere to Variant names: `variant=primary`, `state=hover`.

## Layer naming inside components

- Layers should use `type/role/name` style to convey purpose:
  - `bg/shape` — background layer
  - `content/text` — primary text
  - `icon/leading` — leading icon
  - `overlay/hover` — hover overlay
- Example component frame structure:

  ```markdown
  component/button/primary/default
  ├─ bg/shape
  ├─ content/text
  └─ icon/leading
  ```

## Style naming (Figma Styles)

- **Color Styles:** `color/<usage>/<name>`
- Examples: `color/brand/primary`, `color/ui/background`, `color/text/primary`
- **Text Styles:** `type/<usage>/<size>-<weight>`
- Examples: `type/heading/32-bold`, `type/body/16-regular`
- **Effect Styles:** `effect/shadow/<purpose>`
- Example: `effect/shadow/card`
- **Grid Styles:** `grid/<columns>-<gutter>`
- Example: `grid/12-16`
- Styles should match token semantics; ensure each style has a `description` containing the canonical token key (e.g., `tokens: color.brand.primary`).

## Asset naming (icons, images)

- Icons: `icon/<category>/<name>` (e.g., `icon/action/edit`)
- Images: `image/<context>/<name>` (e.g., `image/illustration/onboarding`)

## Deprecated items

- When deprecating, prepend `deprecated/` to the item name and add a `replacement` note in the description. Example:
- `deprecated/component/button/old-primary` — description: `deprecated: use component/button/primary/default -> tokens: color.brand.primary`

## Practical examples mapping to repo

- Figma color style `color/brand/primary` → repo token `color.brand.primary`
- Figma text style `type/body/16-regular` → repo token `type.body.16.regular` (if you need parity, follow `TOKENS_MAPPING.md`)

## Notes for automation

- Keep names free of stray punctuation and emojis: automation is brittle with non-ASCII characters.
- Always include the canonical token key in the style description — this is how automated exporters match Figma styles to repo tokens.
