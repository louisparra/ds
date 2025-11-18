<!--
What this file is:
Human-facing documentation explaining the CI jobs, how to run checks locally, and common troubleshooting.

Who should edit it:
Infra team or Docs Owner when CI changes.

When to update (example):
Update when workflows or scripts change (e.g., add new token validation steps).

Who must approve changes:
Engineering Lead and Infra team.
-->

# CI — README

This folder documents the CI skeleton used by the repository.

## Workflows included
- [ci-validate.yml](../.github/workflows/ci-validate.yml) — runs on PRs and branch pushes; validates tokens, lint/tests, and Storybook smoke build.
- [publish-packages.yml](../.github/workflows/publish-packages.yml) — publishes on annotated tags `v*.*.*` (skeleton).

## Running checks locally
- Node 18+ recommended.
- Token validation:
  ```bash
  node scripts/token-validate.js
	```
- Storybook smoke:
	```bash
	node scripts/build-storybook.js
	```

## Publishing (dry-run)

- Publishing requires registry credentials and a real publish script. The template script is a no-op.
	```bash
	bash scripts/publish-packages.sh
	```

## Troubleshooting

- If node scripts fail, check Node version and that required files exist (`tokens/tokens.json`, `storybook/stories`).
- If CI fails on GitHub but passes locally, check that secrets (NPM_TOKEN) exist in repository settings.