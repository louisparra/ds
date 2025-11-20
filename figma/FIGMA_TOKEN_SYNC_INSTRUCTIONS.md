<!--
What this file is:
Operational instructions for syncing Figma style exports into repository tokens/tokens.json.
Who should edit it:
Design System Lead, Token Owner, or Tooling Engineer.
When to update (example):
Update when export plugin choices, mapping rules, or canonical schema change.
Who must approve changes:
Token Owner & Engineering Lead.
-->

# Figma → Repo token sync instructions

**NOTE:** This document now depends on the repository's canonical export schema. Before running any automated sync you should either produce an export that matches the canonical schema or run an adapter that converts your plugin's export into it.

**Canonical schema:** `figma/CANONICAL_EXPORT_SCHEMA.md` — **use this as the single source of truth** for what shape exports must have before the `scripts/figma-sync.js` converter runs. Adapters convert plugin-specific exports into the canonical shape.

---

## Overview (fast summary)

1. Export from Figma (recommended: Figma Tokens or another token plugin) → produce a plugin export file.
2. Convert plugin export → canonical schema (use an adapter or produce canonical export directly). See `figma/CANONICAL_EXPORT_SCHEMA.md`.
3. Run conversion script to map canonical export to `tokens/tokens.json` using `scripts/figma-sync.js` (use `--dry` first).
4. Validate tokens: `npm run token-validate` + `npm run token-lint:local`.
5. Create PR: include `tokens/tokens.json` update, `figma/FIGMA_STYLE_MAP.json` changes (if any), and a short migration note.
6. Let CI run `token-validate` and `token-lint:ci` and the migration report workflow.

---

## Export from Figma (recommended plugin approach)

- We recommend the **Figma Tokens** plugin because it is widely used, but you may use any plugin. The requirement is: **before running sync scripts in CI, ensure you have a file in the canonical schema** (see `figma/CANONICAL_EXPORT_SCHEMA.md`) or include a plugin-specific export that CI can convert via an adapter.

---

## Convert export to canonical tokens (two options)

### Option A — Automated (recommended)

- Use an adapter to convert plugin export → canonical JSON, then run the sync script in dry-run:

```bash
# adapter step (example adapter path; adapters are optional)
node scripts/adapters/figma-tokens-to-canonical.js --input ./figma/figma-export.json --output ./figma/canonical-export.json

# preview the sync (dry-run)
node scripts/figma-sync.js --input ./figma/canonical-export.json --map ./figma/FIGMA_STYLE_MAP.json --dry
```

- The canonical JSON must match `figma/CANONICAL_EXPORT_SCHEMA.md`. The adapter should populate `dotPath` where possible and include `meta` information if available.

### Option B — Manual (safe)

1. Export JSON from Figma.
2. Manually transform the file to the canonical schema (follow `figma/CANONICAL_EXPORT_SCHEMA.md`) or copy token values into `tokens/tokens.json` manually.
3. Run validation locally:

```bash
npm ci
npm run token-validate
npm run token-lint:local
```

---

## Validation (must do before PR)

Run these locally, fix any errors, then commit:

```bash
npm ci
# dry-run the figma sync converter
node scripts/figma-sync.js --input ./figma/canonical-export.json --map ./figma/FIGMA_STYLE_MAP.json --dry

# schema + lint checks
npm run token-validate
npm run token-lint:local
```

- If the dry-run report looks correct, proceed to create a PR with the canonical export (or with the derived `tokens/tokens.json`) and mapping updates if needed.

---

## PR checklist (what to include in your PR)

- Updated `tokens/tokens.json` (or canonical export if you prefer humans to review before apply).
- If you added or renamed Figma styles that require mapping overrides, update `figma/FIGMA_STYLE_MAP.json` and explain why in PR description.
- If this export requires migration (renames/deprecations), include a migration JSON under `tokens/migrations/` using the template and run the migration report script.
- Add short release notes in PR: list of top-level tokens changed and affected packages/apps.

---

## CI expectations

- CI will run `scripts/figma-sync.js` in **dry-run** for PRs (see workflow `.github/workflows/figma-sync-dry-run.yml`) and post a Markdown report as a PR comment.
- The CI job expects either:
  - a canonical export file (recommended), or
  - a plugin export plus an adapter step (CI runs adapter -> canonical -> dry-run).
- The canonical schema is authoritative — if CI cannot parse the export, the PR will receive instructions to include a canonical export or to add an adapter.

---

## Apply step (maintainer-only)

- Applying the changes (non-dry) writes `tokens/tokens.json` and creates a timestamped backup. Only maintainers or release engineers should run apply in the repository or via a protected workflow after approvals:

```bash
# apply locally (maintainer)
node scripts/figma-sync.js --input ./figma/canonical-export.json --map ./figma/FIGMA_STYLE_MAP.json --output ./tokens/tokens.json
```

- After apply, run full CI, merge PR, and follow the release/publish steps for tokens package.

---

## Rollback plan

- The apply step creates a backup such as `tokens/tokens.json.bak.<timestamp>.json`. To rollback:
  1. Restore the backup locally.
  2. Open a PR that reverts the change and document the reason.

---

## Security & hygiene

- **Do not** export PII or secrets in token exports. If you need realistic data for visuals, sanitize or use synthetic fixtures.
- Treat exported JSON as code — review in PRs and restrict apply permissions to maintainers.

---

## Quick recommendations to adopters

- Prefer producing canonical export files; it simplifies CI and reduces friction.
- If your org uses a different plugin, add a small adapter in `scripts/adapters/` that converts plugin output to the canonical schema—this is a one-time cost and makes future syncs smooth.
- Include `tokens:` annotations in Figma style descriptions where possible — this speeds mapping and reduces ambiguity.

---

## Links

- Canonical schema: `figma/CANONICAL_EXPORT_SCHEMA.md`
- Mapping file: `figma/FIGMA_STYLE_MAP.json`
- Sync script: `scripts/figma-sync.js`
- Dry-run CI: `.github/workflows/figma-sync-dry-run.yml`
