<!--
What this file is:
Recommended component anatomy and layer ordering for core components to make handoff predictable.

Who should edit it:
Design System Lead or senior component designer.

When to update (example):
Update when component anatomy conventions change or new primitives are added.

Who must approve changes:
Design System Lead & Engineering Lead.
-->

# Component anatomy & layering

Consistent internal structure for components reduces ambiguity when developers inspect instances or when plugins extract token usage.

## Universal frame ordering (top → bottom)

1. **meta/notes** — small text block with token references (not visible in production instances)
2. **bg/shape** — background shape (rectangle, radius)
3. **content/** — primary content group
   - `content/leading` (optional)
   - `content/text`
   - `content/trailing` (optional)
4. **overlay/** — hover/focus overlays and states (positioned above content)
5. **mask/** — mask layers (if used)
6. **a11y/focus** — focus ring layer (visible only in interaction variants)
7. **debug/** — hidden helpers (do not include in exported assets)

## Example — Button (primary)

```markdown
component/button/primary/default
├─ meta/notes
├─ bg/shape
├─ content
│ ├─ icon/leading
│ └─ content/text
├─ overlay/hover
└─ a11y/focus
```

## Handoff hints for designers

- Keep all token-reliant layers named (e.g., `bg/shape` should have a fill referencing a Figma Color Style named `color/brand/primary`).
- Add a `meta/notes` text block at the top of the frame listing the repo token keys used.
- When a component uses multiple tokens for a property (e.g., different fills for pressed vs hover) annotate each variant separately.

## Developer reading order

When developers inspect a component, they should:

1. Open `meta/notes` to identify token keys.
2. Inspect layer `bg/shape` for fill -> find matching Figma style -> map to repo token via `tokens:` description.
3. Inspect `content/text` for text style mapping.

Using this structure helps automated extraction tools and reduces mis-matches between design and implementation.
