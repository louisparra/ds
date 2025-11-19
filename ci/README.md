<!--
What this file is:
Human-facing documentation explaining the CI jobs, how to run checks locally, and common troubleshooting.

Who should edit it:
Infra team or Docs Owner when CI changes.

When to update (example):
Update when workflows or scripts change (e.g., add new SD build steps).

Who must approve changes:
Engineering Lead and Infra team.
-->

# CI — README

This folder documents the CI skeleton used by the repository.

## Workflows included

- `.github/workflows/ci-validate.yml` — runs on PRs and branch pushes; validates tokens (schema), runs Style Dictionary builds, runs Storybook smoke and tests.
- `.github/workflows/publish-packages.yml` — publishes on annotated tags `v*.*.*` (skeleton).
- Other workflows: storybook deploy, build-and-test, etc. (scaffolded elsewhere)

## Style Dictionary integration

We use Style Dictionary to transform canonical tokens into platform artifacts.

Local steps:

```bash
# install dependencies (Node 18+ recommended)
npm ci

# validate tokens (schema)
npm run token-validate

# run style-dictionary build
npm run build-tokens:sd

# fallback (legacy builder)
npm run build-tokens
```

CI notes:

- CI will run `npm ci` before the SD build. The SD build will fail the job if Style Dictionary reports issues.
- Ensure `tokens/tokens.json` exists in the branch or CI will fail; for new projects copy `tokens/tokens.example.json` to `tokens/tokens.json` in a bootstrap PR.

## Troubleshooting

- If the SD build fails with transform errors, check the token value types — the schema helps catch common problems.
- If SD is not installed in CI, confirm `devDependencies` are installed via `npm ci`. If missing in package.json, add `style-dictionary` to `devDependencies`.
