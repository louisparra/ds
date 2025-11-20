<!--
What this file is:
Repository-wide Pull Request template that guides contributors (designers, engineers, product) to include the information and artifacts required for safe token, Figma, and asset changes.

Who should edit it:
Repo maintainers, Design System Lead, or Documentation owners.

When to update (example):
Update when CI, branching, or approval rules change (eg: new approval matrix or PR checks).

Who must approve changes:
Design System Lead & Engineering Lead.
-->

## Summary

<!-- Write a short, plain-language summary of *what* changed and *why*. -->

- What: (one-line summary)
- Why: (business / product rationale)

---

## Type of change

<!-- check one -->

- [ ] Bug fix
- [ ] Feature / component
- [ ] Design tokens / styles (colors, type, spacing, motion)
- [ ] Assets (icons, images)
- [ ] Docs / templates / tooling
- [ ] Chore (CI, infra)

---

## Files / artifacts included

List the key files you changed or added (plugin exports, canonical JSON, assets, mapping updates).

- Token plugin export (optional but recommended): `figma/<your-export>.json`
- Canonical export (if generated): `figma/canonical-export.json`
- Token changes in repo (if any): `tokens/tokens.json` (or path)
- FIGMA style mapping changes: `figma/FIGMA_STYLE_MAP.json`
- Asset files: `assets/...` or `packages/assets/...`
- Other code/docs: `...`

---

## Migration & Impact notes

- Does this change rename or remove any tokens? If yes, list migration notes and recommended deprecation window.
- Does this change require component updates or CSS/JS migration? If so, include a short developer plan.

---

## How I tested (local)

Provide commands you ran and expected outputs so reviewers can reproduce.

1. Convert plugin export → canonical (adapter)

   ```bash
   # Example (Figma Tokens)
   node scripts/adapters/figma-tokens-to-canonical.js \
     --input figma/<your-export>.json \
     --output figma/canonical-export.json
   # Expected: writes figma/canonical-export.json containing { schemaVersion, exportedAt, tokens: [...] }

   ```

2. Preview token migration with sync (dry-run)

   ```bash
   node scripts/figma-sync.js \
     --input figma/canonical-export.json \
     --map figma/FIGMA_STYLE_MAP.json \
     --dry
   # Expected: printed report showing Added / Updated / Skipped tokens. No errors.
   ```

3. (Optional) Run adapter test suite (CI-style check)

   ```bash
   node scripts/tests/figma-adapter-tests.js
   # Expected: exit 0 and "[PASS]" messages for fixture tests
   ```

4. Asset sanity check

   - Open exported SVG/PNG in a browser or preview tool to verify naming and resolutions (eg. `assets/icons/...`).

---

## Reviewer checklist (what reviewers should verify)

- [ ] Title and summary are clear and link to issue/ticket (if any).
- [ ] Token changes are intentional and documented (migration notes included).
- [ ] If tokens renamed/deprecated, a migration plan is provided.
- [ ] `figma/FIGMA_STYLE_MAP.json` was updated when needed and mapping entries are minimal (only for ambiguous/legacy names).
- [ ] Canonical JSON present in PR when requested by maintainers (`figma/canonical-export.json`) or adapter output reproducible via commands above.
- [ ] Assets follow naming / density conventions (`kebab-case`, `@2x`/`@3x` for raster).
- [ ] Automated checks in CI pass (adapter tests, token lint, lint/format).
- [ ] Relevant unit / visual tests updated if component tokens changed.

---

## Design / Token Owner sign-off

- Token Owner: `@<token-owner-handle>`
- Design System Lead: `@<design-system-lead-handle>`
  _(Request explicit approval from Token Owner for any token rename / deprecation.)_

---

## Code / Engineering sign-off

- Engineering Lead or component owner(s): add reviewers as needed (see `governance/pr-approval-matrix.md`).

---

## Branch & PR metadata

- Branch name pattern (recommended): `ds/<area>/<short-desc>` or `feature/<area>/<short-desc>`
  - Examples: `ds/tokens/brand-primary-rename`, `feature/assets/add-icons`
- Add these labels (maintainers will triage): `bug`, `feature`, `ds-change`, `security`, `assets`

> See `/BRANCHING.md` for branch policies and `governance/pr-approval-matrix.md` for required reviewers and approvals.

---

## Checklist before merge (CONTRIBUTOR)

- [ ] Ran formatter & linters locally (`npm run lint` / `npm run format --check`)
- [ ] Ran token adapter + `figma-sync` dry-run and fixed any mapping issues
- [ ] Confirmed CI green (token validation, adapter tests, linting)
- [ ] Confirmed no PII or sensitive exports committed (use sanitized fixtures if needed)
- [ ] Added migration notes if tokens were renamed/deprecated

---

## Extra notes (optional)

Add any links to mockups, Figma file, issue trackers, or relevant docs.

- Figma file / page: `<link or file reference>`
- Related issue/ticket: `#<issue-number>`
- Migration timeline / plan: `docs/ROADMAP.md` or `docs/measurements/measurement-plan-template.md`

---

### Troubleshooting tips for reviewers

- If CI fails on token lint: run `node linting/token-lint-rules.js --mode=local` to reproduce local validation errors.
- If canonical JSON parsing fails: open the file and check `schemaVersion` and `tokens` array structure.
- If asset filenames fail QA: verify against `figma/ASSET_EXPORT_GUIDE.md` naming rules.
