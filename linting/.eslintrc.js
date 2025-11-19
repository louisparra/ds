/*
What this file is:
Canonical ESLint configuration template for the design-system repo (JS only). Use as the authoritative base to extend from.

Who should edit it:
Eng Lead or Linting Owner. Update when you want to change linting standards across packages.

When to update (example):
Add rules when introducing React/TypeScript or when you want stricter/noisier rules.

Who must approve changes:
Eng Lead and Design System Lead.
*/

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    // Add plugin extensions here when enabling React or TypeScript, e.g.
    // 'plugin:react/recommended', '@typescript-eslint/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    // Example baseline rules
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    eqeqeq: ['error', 'always'],
  },
  overrides: [
    {
      files: ['packages/ui-react/**/*.{js,jsx,ts,tsx}'],
      rules: {
        // Placeholder for component-specific rules (e.g., react/jsx-uses-react)
      },
    },
  ],
};
