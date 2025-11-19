<!--
What this file is:
Quick guide for running token builds and verifying outputs.

Who should edit it:
Token Owner or Tooling Engineer.

When to update (example):
Update when build scripts or output locations change.

Who must approve changes:
Token Owner & Engineering Lead.
-->

# Token build — quick guide

This document shows how to run the Style Dictionary build and check generated artifacts.

## Requirements

- Node.js 18+ (same as CI)
- `npm ci` should be run once to install devDependencies

## Build commands

### Fast (Style Dictionary only)

```bash
# Install deps (first time)
npm ci

# Build tokens using Style Dictionary (reads style-dictionary.config.js)
npm run build-tokens:sd
# or directly:
node scripts/build-tokens-sd.js
```

Outputs (example paths):

- `packages/tokens/dist/web/tokens.css`
- `packages/tokens/dist/web/tokens.json`
- `packages/tokens/dist/android/colors.xml`
- `packages/tokens/dist/ios/Colors.plist`

### Full build + smoke checks

```bash
# Higher-level build that also checks files were generated
node scripts/build-tokens.js
```

### Build a single platform (smoke checked)

```bash
node scripts/build-tokens.js --platform web
```

## Troubleshooting

- If build fails with `Can't find format: ios/colors` — ensure `style-dictionary/formats.js` exists and is required by `style-dictionary.config.js`.
- If files are missing under `packages/tokens/dist/...` check the console for Style Dictionary messages — it prints every destination file it produces.
- If transforms are not applied (naming mismatch), ensure `style-dictionary/transforms.js` is required by the config.

## Notes

- CI runs the same scripts; use the local commands to reproduce CI failures before opening PRs.
- The build scripts create files in `packages/tokens/dist/*`. Those artifacts are intended to be consumed by packages in this monorepo or published as part of a tokens package.
