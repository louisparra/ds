<!--
What this file is:
Practical accessibility recipes for designers (contrast, focus, keyboard, motion).

Who should edit it:
Designers, Accessibility Lead.

When to update (example):
Update when accessibility standards or tooling changes.

Who must approve changes:
Accessibility Lead & Design System Lead.
-->

# Accessibility recipes — quick checks for designers

This file lists short, actionable accessibility checks to run during design and before token/component PRs.

## Color contrast

- Text must meet at least **AA** contrast for normal text (4.5:1) and **AA Large** for large text (3:1).
- Use an automated checker (plugin or web tool) to validate contrast between text color token and background token.
- **Recipe**
  1. Note tokens: `color.text.primary` and `color.bg.page`.
  2. Use a contrast checker (or `axe`, `chromatic`) to verify ratio.
  3. If ratio fails, either pick a different token or provide a token pair with adequate contrast (e.g., `color.text.primary.highContrast`).

## Focus styles & keyboard

- Ensure interactive components have visible focus styles (use tokens for focus ring color and thickness).
- Test keyboard tab order in prototypes and add notes for developers about focus management.

**Focus token example**

```json
{
  "name": "focus.ring",
  "dotPath": "focus.ring",
  "type": "effect",
  "value": "0 0 0 3px rgba(10,132,255,0.16)"
}
```

## Reduced motion

- Provide motion tokens for durations and easing. Respect prefers-reduced-motion by providing alternative (no-motion) patterns.
- Recipe: For each animation, list `motion/duration/*` token and a reduced-motion alternative in PR notes.

## Component-specific checks

- Buttons: check minimum hit area (44×44 px) and focus contrast.
- Inputs: ensure placeholder vs input text contrast is accessible.

## Quick tools

- Figma contrast plugins (e.g., _Able_ or _Stark_) for in-editor checks.
- Browser extension: Axe, WAVE — use when reviewing documentation or dev preview.

## Acceptance criteria before PR

- [ ] All text tokens referenced in changed screens meet AA contrast vs bg token.
- [ ] Interactive elements have annotated focus tokens.
- [ ] Motion tokens include reduced-motion plan or alternatives.
