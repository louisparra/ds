<!--
What this file is:
Guidance for writing token migration scripts or mapping files for token renames/aliases.

Who should edit it:
Token Owner / Tooling engineer.

When to update (example):
Add a migration file whenever tokens are renamed or restructured.

Who must approve changes:
Token Owner & Eng Lead.
-->

# Token migrations

Place migration artifacts here. Each migration should have:

- a human-readable markdown describing the change and rationale,
- an optional script (e.g., Node script) that can help automated replacements in codebases,
- test notes showing the expected before/after.

Example structure:

`tokens/migrations/2025-11-18-deprecate-brand-secondary.md`
`tokens/migrations/scripts/2025-11-18-apply-migration.js`

Guidelines:

- Keep migrations idempotent.
- Always include a rollback note.
- Coordinate migrations with consumers (frontend apps, design tokens consumers).
