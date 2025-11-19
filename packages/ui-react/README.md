<!--
What this file is:
README for @ds/ui-react package. Explains minimal usage and that this is a scaffold placeholder.

Who should edit it:
Component Owners or Docs Owner.

When to update (example):
Update when package API stabilizes or when publishing is configured.

Who must approve changes:
Component Owner & Design System Lead.
-->

# @ds/ui-react — UI components (scaffold)

This package is a minimal scaffold for React (or DOM) UI components that consume tokens.

## Quick notes

- This is a placeholder. Production components should be authored in [packages/ui-react/src/](src/) with proper build steps and tests.
- Components should prefer CSS variables exported by the tokens package ([packages/tokens/dist/tokens.css](../tokens/dist/tokens.css)) or import token values via `@ds/tokens` once published.

## Example (plain DOM)

```js
const Button = require('@ds/ui-react/src/Button.js');
document.body.appendChild(Button({ children: 'Hello' }));
```
