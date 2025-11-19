<!--
What this file is:
Operational instructions for syncing Figma style exports into repository tokens/tokens.json.

Who should edit it:
Design System Lead, Token Owner, or Tooling Engineer.

When to update (example):
Update when export plugin choices or mapping rules change.

Who must approve changes:
Token Owner & Engineering Lead.
-->

# Figma → Repo token sync instructions

Purpose: This document describes a safe, repeatable process for exporting Figma styles (using the Figma Tokens plugin or equivalent) and converting them into the canonical `tokens/tokens.json` format used by the repo. Use this playbook for everyday syncs and for release-time publishing.

---

## Overview (fast summary)

1. Export from Figma (Figma Tokens plugin) → file `figma-export.json` (dot-path or style-name format).
2. Run conversion script to map Figma style names to repo token keys using `figma/FIGMA_STYLE_MAP.json`. (Tooling step).
3. Validate tokens: `npm run token-validate` + `npm run token-lint:local`.
4. Create PR: include `tokens/tokens.json` update, `figma/FIGMA_STYLE_MAP.json` changes (if any), and a short migration note.
5. Let CI run `token-validate` and `token-lint:ci` and the migration report workflow (if migration JSON added).

---

## Export from Figma (recommended: Figma Tokens plugin)

1. Open `DS.Core` (or your canonical library file).
2. Run the **Figma Tokens** plugin. Configure export to produce a JSON file with styles. Recommended settings:
   - Export format: JSON
   - Naming: keep style names with `/` groups (e.g., `color/brand/primary`)
   - If plugin offers dot-path output, prefer `color.brand.primary` format — but our tooling prefers slash format and will map to dot.path via `FIGMA_STYLE_MAP.json`.
3. Export -> save as `figma-export.json` to your local machine.

---

## Convert export to canonical tokens (two options)

### Option A — Automated (recommended)

> Requires a small script: `scripts/figma-sync.js` (not included yet). Command (example):

```bash
# from repo root
node scripts/figma-sync.js --input ./figma-export.json --map ./figma/FIGMA_STYLE_MAP.json --output ./tokens/tokens.json --dry
```

- `--dry` prints diff/preview without overwriting `tokens/tokens.json`.
- Without `--dry` the script will:
  - Validate that outputs are syntactically valid JSON matching the token schema.
  - Create a timestamped backup of existing `tokens/tokens.json`.
  - Write the new `tokens/tokens.json`.

**Script behavior expectations**

- When an explicit mapping exists in `FIGMA_STYLE_MAP.json.mappings`, use it.
- Otherwise apply default transform: replace `/` with `.` and lowercase the result.
- Merge exported tokens into existing tokens carefully:
  - Add new tokens.
  - Update values for matching tokens (preserve `description`, `deprecated`, and owner metadata unless explicitly overwritten).
  - Do **not** automatically delete tokens; deletion must be handled via deprecation/migration flow.

### Option B — Manual (safe)

1. Export JSON from Figma as `figma-export.json`.
2. Open `tokens/tokens.json` in editor.
3. For each exported style:
   - Determine its canonical token key (`FIGMA_STYLE_MAP.json` or auto rule).
   - Manually insert/update the `value` field under that dot.path in `tokens/tokens.json`.
   - Save file and run `npm run token-validate`.

Manual is slower but recommended if this is your first sync.

---

## Validation (must do before PR)

Run these locally, fix any errors, then commit:

```bash
npm ci
npm run token-validate
npm run token-lint:local   # runs the faster lint checks locally
# Optionally, run the deeper CI lint:
npm run token-lint:ci
```

- Resolve all schema and key-format issues. If token-lint flags semantic issues, discuss them with Token Owner.

---

## PR checklist (what to include in your PR)

- Updated `tokens/tokens.json` (do not modify unrelated tokens).
- If you added or renamed Figma styles that require mapping overrides, update `figma/FIGMA_STYLE_MAP.json` and explain why in PR description.
- If this export requires migration (renames/deprecations), include a migration JSON under `tokens/migrations/` using the template. Run `node scripts/report-migrations.js --file tokens/migrations/<file>.json` and paste the report in PR.
- Add short release notes in PR: list of top-level tokens changed, impacted packages/apps, and suggested rollout window.

---

## Approvals & Releases

- Token changes that affect branding or critical UI (criticality=high in `tokens/metadata.json`) must be approved by Token Owner + Product/Brand before merging.
- For non-critical cosmetic tokens you can proceed after Token Owner review.
- After merge: maintainers should publish new tokens package (see `packages/tokens/package.json`) and inform consuming teams.

---

## Rollback plan

- The automated script creates `tokens/tokens.json.bak.<timestamp>.json`. To rollback:
  1. Restore the backup locally.
  2. Open a PR reversing the change with explanation and notify impacted teams.

---

## Security & data hygiene

- Do not export tokens that embed PII or secrets. If you need realistic data for visual testing, use synthetic fixtures.
- Keep `figma-export.json` local and avoid committing raw exports; commit only the canonical `tokens/tokens.json` and `FIGMA_STYLE_MAP.json`.
