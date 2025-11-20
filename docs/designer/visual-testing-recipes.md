<!--
What this file is:
Recipes for producing visual test artifacts designers can include for visual-regression testing.

Who should edit it:
Designers, QA, or Visual Regression owners.

When to update (example):
Update when visual-regression tooling or snapshot formats change.

Who must approve changes:
QA Lead & Design System Lead.
-->

# Visual testing recipes — how to produce useful snapshots

Designers can help reduce visual regressions by providing clear, focused snapshots and guidance for tests.

## What to include in a visual test

- Component-only screenshots (isolated): one per variant/state at standard size.
- Contextual screenshots: component inside a simple layout (desktop & mobile).
- Dark & light mode variants if tokens differ by mode.
- Snapshot metadata: component name, variant, token list used, screen size.

## Simple process (manual)

1. In Figma, create a page `visual-tests` with frames for each component variant sized exactly as tests expect.
2. Export frames as PNG at `1x` and `2x`:
   - File names: `visual/button-primary-default@1x.png`, `visual/button-primary-default@2x.png`.
3. Add small JSON metadata next to the image (or in PR) listing token dot.paths (helpful for debugging).

## Automation-friendly approach

- Use Storybook + Chromatic or Playwright visual tests driven from the code implementation.
- Designers can provide a minimal HTML/CSS preview for each component that uses token CSS variables from the `packages/tokens/dist/web/tokens.css` artifact; QA can run snapshots against that preview.

## Example snapshot metadata JSON

```json
{
  "component": "button",
  "variant": "primary/default",
  "tokens": ["color.brand.primary", "type.button.16", "spacing.scale.2"],
  "viewport": "desktop-1024x768"
}
```

## Naming & storage

- Store snapshots in `visual-tests/<component>/` with clear naming: `button/primary/default/desktop@1x.png`
- Keep snapshots small and focused to speed CI.

## When to include visual tests in a PR

- Major token changes affecting many components.
- Component contract changes (size, spacing, visual style).
- New component additions.
