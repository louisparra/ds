<!--
What this file is:
A README for the React starter example showing how to consume the design system's token and UI packages.

Who should edit it:
Docs Owner or Example App maintainer.

When to update (example):
Update when package entrypoints, build commands, or token output paths change.

Who must approve changes:
Design System Lead (docs) and Component Owner (if example demonstrates components).
-->

# React Starter — example integration for the Design System

This README explains how a small React starter app should consume the design system's token artifacts and UI package scaffold. The example is intentionally lightweight: it focuses on _how to use_ `@ds/tokens` outputs and `@ds/ui-react` components rather than prescribing a specific React toolchain.

> Note: this repo currently contains a minimal `packages/ui-react` (DOM/JS scaffold) and `packages/tokens` (dist outputs). If you add a full React app later, use this README to document required scripts and conventions.

## Goals

- Show how to include CSS tokens (CSS custom properties) in a React app.
- Demonstrate a simple pattern to import UI components and tokens.
- Provide commands and expectations for junior contributors.

---

## Example project structure (suggested)

```
examples/react-starter/
├─ package.json # (if you scaffold a real example later)
├─ public/
│  └─ index.html
├─ src/
│  └─ index.jsx
└─ README.md # this file
```

## Minimal run instructions (if you scaffold a real example)

If you later add a real React starter (Vite / Create React App / Next), prefer Vite for minimal setup. Example commands (for a Vite-based starter):

```bash
# create the starter (run once locally)
npm init vite@latest examples/react-starter --template react

cd examples/react-starter

# link or install dependencies
# Option A (local workspace): at repo root, run:
npm run bootstrap            # installs root deps and prepares workspaces
npm run build-tokens:sd     # generate packages/tokens/dist/*

# then in example:
npm install                 # or use workspace symlinks if using npm workspaces
npm run dev                 # run the Vite dev server
```

### How to consume tokens (recommended patterns)

1. **Include CSS variables** (web):
   - Ensure `packages/tokens/dist/web/tokens.css` is built (via `npm run build-tokens:sd`).
   - In `index.html` (or root-level import), include:
     ```html
     <link rel="stylesheet" href="../../packages/tokens/dist/web/tokens.css" />
     ```
     or import in JS:
     ```javascript
     import '../../packages/tokens/dist/web/tokens.css';
     ```
1. **Consume flattened JSON in JS**:

   ```javascript
   // if you publish or bundle @ds/tokens, you might import:
   // import tokens from '@ds/tokens/dist/web/tokens.json'
   // For local example, require the dist file:
   import tokens from '../../packages/tokens/dist/web/tokens.json';
   console.log(tokens['color.primary']);
   ```

1. **Use UI components**:

   - `@ds/ui-react` in this template is a scaffold. If you publish or link it, import components:

     ```javascript 
     import Button from '../../packages/ui-react/src/Button.js';
     // or when published:
     // import { Button } from '@ds/ui-react';
     ```

### Recommended minimal example code (src/index.jsx)

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../packages/tokens/dist/web/tokens.css';
import Button from '../../packages/ui-react/src/Button';

function App() {
  return (
    <div style={{ padding: 'var(--spacing-3, 16px)' }}>
      <h1>Design System React Starter</h1>
      {/* Using the scaffolded Button (DOM-returning function) */}
      <div id="btn-root"></div>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// Example of using a DOM-returning component in this scaffold:
const btn = Button({ children: 'Primary' });
document.getElementById('btn-root').appendChild(btn);
```

## What to document later (when you add a full starter)

- Exact `package.json` scripts (`dev`, `build`, `preview`) and how to wire npm workspaces for local development.
- How to consume `@ds/tokens` via package import (if you publish) vs local file include.
- How to run tests / storybook in the example app and how to link Chromatic or visual tests.

## Troubleshooting / common gotchas

- If the example shows unstyled components, confirm `packages/tokens/dist/web/tokens.css` exists and is referenced correctly. Run `npm run build-tokens:sd` at repo root if missing.
- If `Button` is not a React component yet (scaffold uses DOM factory), either wrap it in a React wrapper or replace it with a React implementation in `packages/ui-react`.
