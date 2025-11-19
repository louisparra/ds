<!--
What this file is:
Mapping reference between repo token keys (dot.path) and Figma style / layer names.

Who should edit it:
Token Owner or Design System Lead.

When to update (example):
Update when tokens structure changes in tokens/tokens.json.

Who must approve changes:
Token Owner & Engineering Lead.
-->

# Tokens ↔ Figma mapping

This document shows the exact mapping conventions used by our tooling and authors. _Tooling expects the Figma style name (left) and the repo token key (right) to match via simple transforms described below._

## Naming transform rules (bidirectional)

- Repo token → Figma style:
  - Replace `.` with `/` for style groups, keep lowercase.
  - Example: `color.brand.primary` → Figma style `color/brand/primary`
- Figma style → Repo token:
  - Replace `/` with `.` in style name.
  - Example: `type/body/16-regular` → `type.body.16.regular` (if you use numeric steps in token keys adjust accordingly)

## Canonical mappings (examples)

- Colors:
  - Repo: `color.brand.primary`  
    Figma: `color/brand/primary`  
    Figma style description: `tokens: color.brand.primary`
- Typography:
  - Repo: `type.body.16.regular`  
    Figma: `type/body/16-regular`  
    Description: `tokens: type.body.16.regular`
- Spacing:
  - Repo: `spacing.scale.4`  
    Figma: `spacing/scale/4` (or use frames named `spacing/4` in `00 - Tokens (source)` page)  
    Description: `tokens: spacing.scale.4`

## How to include token key in Figma style description

- Always add a 1-line `tokens:` annotation in the style description. Example:
  - `tokens: color.brand.primary`
- This enables reliable matching when exporting via plugins or scripts.

## Export examples

- Color style `color/brand/primary` will be exported as `--ds-color-brand-primary: #0A84FF;` in CSS if you use the CSS var generator.
- When using the Figma Tokens plugin or an exporter, set it to use `style name -> dot.path` mapping by replacing `/` with `.`.

## Mapping pitfalls & rules of thumb

- Avoid duplicate style names across pages — tooling typically reads published styles across the file, but duplicates create ambiguity.
- For scale tokens (spacing), prefer numeric suffixes (scale/1, scale/2) rather than semantic names, because teams often map them to CSS variables or spacing scale arrays.

## Example: full token export row (human readable)

| Figma style name     | Style type    | Repo token key       |
| -------------------- | ------------- | -------------------- |
| color/brand/primary  | Paint (Solid) | color.brand.primary  |
| type/heading/32-bold | Text style    | type.heading.32.bold |
| spacing/scale/4      | Frame/Token   | spacing.scale.4      |

When you change tokens in Figma, update the corresponding entry in `TOKENS_MAPPING.md` or add a short note in the token's Figma style `description` so automation detects the change.
