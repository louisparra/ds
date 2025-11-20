<!--
What this file is:
Practical recipes for authoring components with semantic layer naming and variant structure.

Who should edit it:
Component authors, Design System Lead, or senior designers.

When to update (example):
Update when core component contract (naming or tokens used) changes.

Who must approve changes:
Design System Lead & Engineering Lead.
-->

# Component authoring — recipes & handoff notes

This guide helps component authors produce components that are easy to implement and maintain by developers.

## Core goals

- **Make token usage explicit.** Annotate which tokens are used for color, type, spacing, elevation, etc.
- **Use variant naming that maps to code.** `component/variant/state/label` (e.g., `button/primary/hover/default`).
- **Keep implementation concerns visible.** Add notes for keyboard interactions and accessibility states.

---

## Frame & layer naming

- Component frame name: `component/<component-name>` (e.g., `component/button`).
- Variant frames inside a component: `component/<component-name>/<variant>/<state>` (e.g., `component/button/primary/active`).
- Use group or layer names that reference token dot.path for important layers (e.g., `background — color.brand.primary`).

---

## Annotating token usage (practical)

- Place a small annotation sticky near each component with lines like:
  - `tokens: color.brand.primary | type.button.16 | spacing.scale.2 | effect.shadow.card`
- Optionally include the canonical dot.path in the Figma layer description so adapters pick it up.

---

## Accessibility & interactions

- Include focus states (keyboard) and give them explicit token references (e.g., `focus-ring: color.brand.primary`).
- Provide a keyboard interaction list as a text box in the variant: `Enter = submit`, `Space = press`, `Esc = close`.

---

## Component API (developer-friendly)

When creating or changing a component, add a short "API" note in the component frame:

- Props: `variant`, `size`, `disabled`, `icon`
- Token mappings: `backgroundColor: color.brand.primary` etc.
- Events: `onClick`, `onHover`

This makes it easy for developers to translate the component into code.

---

## Visual states & responsive behavior

- Provide responsive variants or document responsive behavior in the component frame (e.g., `button/primary/compact`).
- Annotate when tokens change by breakpoint (e.g., `type.body.16 -> type.body.14` at < 420px).

---

## Handoff checklist

- [ ] Component frame exists under `01 — Components (library)`.
- [ ] Variants follow `component/variant/state` naming.
- [ ] Tokens used are annotated with dot.path.
- [ ] Focus/keyboard states present and annotated.
- [ ] Add a short developer API description in a text block inside the component frame.

---

## Example (Button)

- Figma component: `component/button`
- Variants:
  - `component/button/primary/default` — tokens: `color.brand.primary`, `type.button.16`, `spacing.scale.2`, `effect.shadow.card`
  - `component/button/primary/hover` — tokens: `color.brand.primary.hover`
  - `component/button/primary/disabled` — tokens: `color.ui.disabled`, `type.button.16`
- Developer API block:

  ```json
  Props: variant: 'primary' | 'secondary', size: 'sm' | 'md' | 'lg', disabled: boolean
  Events: onClick
  ```
