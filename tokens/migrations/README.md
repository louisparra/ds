<!--
What this file is:
Authoritative guide for token migrations: formats, process, scripts, and governance.

Who should edit it:
Token Owner, Migration Author, or Tooling Engineer.

When to update (example):
Update when migration workflow, mapping format, or required approvals change.

Who must approve changes:
Token Owner & Engineering Lead.
-->

# Token migrations — README (final)

This document standardizes **how** we plan, describe, preview, apply and roll back token migrations. Use this as the single source of truth for any rename, deprecate, alias or larger restructuring of `tokens/tokens.json`.

---

## Quick links (what you will find here)

- Machine migration format (JSON) and example
- Human migration template (markdown)
- Scripts: preview (`report-migrations.js`) and apply (`apply-migration.js`)
- Process & checklist (what to do, in order)
- CI / PR guidance (what the pipeline will/should run)
- Rollback and backups
- Governance, approvals, and notifications

---

## Migration artifact types & locations

All migration artifacts live under `tokens/migrations/`:

- `tokens/migrations/<YYYYMMDD>-<slug>.md` — **Human** migration doc (use `migration-template.md` as boilerplate).
- `tokens/migrations/<YYYYMMDD>-<slug>.json` — **Machine** mapping used by tooling (see schema below).
- `tokens/migrations/*.bak.*` — optional backups created by apply script (do not commit backups).

**Example files included**

- `tokens/migrations/migration-template.md` — copyable markdown template.
- `tokens/migrations/000-example-migration.json` — example mapping file.

---

## Machine migration JSON — schema (required fields)

Each migration JSON MUST be a single JSON object with these top-level fields:

```json
{
  "id": "string (unique, e.g. 20251119-consolidate-brand-secondary)",
  "date": "YYYY-MM-DD",
  "author": "Name <email@example.com>",
  "description": "Short summary of intent and impact",
  "actions": [
    {
      "oldKey": "dot.path.to.token",
      "newKey": "dot.path.to.new.token | null",
      "action": "rename | alias | deprecate | noop",
      "notes": "optional human note",
      "reversible": true,
      "affects": ["packages/ui-react", "apps/web-dashboard"]
    }
  ]
}
```

Field notes:

- `oldKey`: required; dot.path key that currently exists in `tokens/tokens.json`.
- `newKey`: required for `rename`/`alias`; `null` for `deprecate` or `noop`.
- `action`:
  - `rename` — move token from `oldKey` → `newKey` (removes old key).
  - `alias` — create `newKey` (copy), mark `oldKey` deprecated with `replacement=newKey`.
  - `deprecate` — mark `oldKey` deprecated (optionally set `newKey` as replacement).
  - `noop` — no change; useful for validation checking that a key exists.
- `reversible` (optional; default `true`) — whether the migration can be reversed automatically.
- `affects` (optional) — list of known consumer packages / repos to notify.

---

## Human migration markdown — required sections

Use `migration-template.md` to create the human-readable plan. At minimum include:

- Summary (what & why)
- Author & date
- Related files (mapping json path)
- Approvals (Token Owner, Product/Brand, Eng Lead)
- Rollout plan (step-by-step)
- Rollback plan
- Affected consumers / owners and communication plan

---

## Scripts — how to preview & apply safely

**Preview (read-only)**
Command:

```bash
node scripts/report-migrations.js --file tokens/migrations/<file>.json
```

Expected output:

- Lists each action
- Flags missing `oldKey`s (shows `[MISSING]`)
- Summary: total actions, missing keys count

**Dry-run apply (no file changes)**
Command:

```bash
node scripts/apply-migration.js --file tokens/migrations/<file>.json --dry
```

Expected output:

- `Dry-run: no files written. Summary:` plus JSON summary of proposed changes.

**Apply migration (destructive, creates backup)**
Command:

```bash
node scripts/apply-migration.js --file tokens/migrations/<file>.json
```

Outputs:

- Backup created at `tokens/tokens.json.bak.<timestamp>.json`
- Updated `tokens/tokens.json` written
- JSON summary printed (applied / warnings / errors)
- Recommended follow-up: run `npm run token-validate` and include migration files in PR

**Optional stricter mode**
To fail when mapped `oldKey` is missing:

```bash
node scripts/apply-migration.js --file tokens/migrations/<file>.json --fail-on-missing
```

---

## Recommended migration process (step-by-step)

1. **Draft** migration markdown (`.md`) and mapping JSON (`.json`) on a feature branch (naming: `<YYYYMMDD>-<slug>`).

2. **Run preview**:

   ```bash
   node scripts/report-migrations.js --file tokens/migrations/<file>.json
   ```

   - Fix missing keys or add a `noop` action if intended.

3. **Run dry-run apply**:

   ```bash
   node scripts/apply-migration.js --file tokens/migrations/<file>.json --dry
   ```

   - Inspect summary; ensure expected changes appear.

4. **Open a PR** including:

   - Migration `.md` (human plan + approvals listed)
   - Migration `.json` (machine mapping)
   - Expected updated `tokens/tokens.json` (if you applied the mapping locally), OR let maintainers run apply in CI step (document which approach you used).
   - A short checklist: previewed, dry-run, applied locally? (yes/no), backups: location.

5. **CI checks** will run `npm run token-validate` and (if tokens changed) `npm run token-lint:ci`.

6. **Merge after approvals** (Token Owner + Product/Brand + Eng Lead as required).

7. **Notify consumers** listed in `affects` and post to `#design-system` and slack channels.

8. **Monitor consumer PRs** and coordinate follow-ups.

9. **After deprecation windows pass**, schedule removal PRs for old keys (document in `tokens/CHANGELOG.md`).

---

## PR template snippet (copy into PR body)

Use this checklist in your PR description:

```markdown
## Migration checklist

- [ ] Migration markdown (`tokens/migrations/<file>.md`) included
- [ ] Mapping JSON (`tokens/migrations/<file>.json`) included
- [ ] Previewed with `node scripts/report-migrations.js`
- [ ] Dry-run applied with `node scripts/apply-migration.js --dry`
- [ ] Backup strategy: `tokens/tokens.json.bak.<timestamp>.json` created
- [ ] Token validation: `npm run token-validate` passed
- [ ] Deep lint (CI): `token-lint:ci` will run on CI or was run locally
- [ ] Approvals requested: @token-owner, @product, @eng-lead
- [ ] Communication plan posted to #design-system
```

---

## CI integration suggestions

- **Mandatory**: CI runs `npm run token-validate` for all PRs that modify `tokens/**`.
- **Conditional**: Run `npm run token-lint:ci` only when `tokens/**` changed (see incremental CI pattern).
- **Optional (recommended)**: Add a CI job that runs `node scripts/report-migrations.js --file tokens/migrations/<file>.json` for any new migration files in the PR and posts the results as a PR comment (use a small GitHub Action or a workflow step).

Example workflow step (pseudo):

```yaml
# in your validate job
- name: Report migrations in PR
  run: |
    for f in $(git diff --name-only ${{ github.event.pull_request.base.sha }} ${{ github.sha }} | grep '^tokens/migrations/.*\.json' || true); do
      node scripts/report-migrations.js --file "$f"
    done
```

---

## Backups & rollback

- `apply-migration.js` creates a timestamped backup before writing: `tokens/tokens.json.bak.<timestamp>.json`
- To rollback:
  1. Restore backup locally: `cp tokens/tokens.json.bak.<timestamp>.json tokens/tokens.json`
  2. Run `npm run token-validate` and open a PR that restores the old file.
  3. Announce rollback in `#design-system` and notify affected teams.

---

## Governance & approvals (short)

- **Minor token changes** (non-brand, not customer-facing): Token Owner approval.
- **Branding / customer-facing tokens**: Token Owner + Product/Brand + Eng Lead.
- **Large-scale renames / mass migrations**: add a rollout plan and coordinate with consumer repos; consider a feature flagged rollout.

---

## Best practices & tips

- Prefer `alias` (temporary copy + deprecate old) over immediate `rename` when many consumers exist.
- Keep migrations small and well-scoped — many small migrations are easier to review than one giant rename.
- Use `affects` in migration JSON to list likely impacted packages; this helps reviewers and automation route notifications.
- Use `--dry` and `report` frequently — never skip previews.
- Keep the human migration markdown up-to-date; it is the record that non-technical stakeholders will read.

---

## Troubleshooting (common issues)

- **Missing token** reported by preview: ensure `oldKey` exists or add `noop` to validate intent.
- **Conflicting newKey**: if `newKey` already exists, the apply script will skip overwrite (and warn). Resolve conflict manually.
- **Backup not writable**: check file permissions and disk space.
- **CI doesn't detect migration files**: ensure PRs are compared against the correct base SHA (use full fetch in workflow).

---

## Contact & escalation

- Token Owner: @token-owner (replace with actual handle)
- Design System Slack: `#design-system`
- Engineering Lead: @eng-lead (replace with actual handle)

---

## Files referenced

- `tokens/migrations/migration-template.md` — template for human docs
- `tokens/migrations/000-example-migration.json` — example mapping
- `scripts/report-migrations.js` — preview tool
- `scripts/apply-migration.js` — safe apply tool
- `tokens/CHANGELOG.md` — record of deprecations & removals
- `tokens/deprecation-policy.md` — policy & windows

---

## Change log for this README

- **2025-11-19** — Finalized machine format, added `--dry` and `--fail-on-missing` options for safer application, added PR and CI guidance, and clarified governance/rollback.
