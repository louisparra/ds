/*
What this file is:
Read-only migration preview and report generator. Lists mappings and checks presence in tokens/tokens.json.

Who should edit it:
Tooling Engineer or Token Owner.

When to update (example):
Enhance reporting (cross-repo scan) or add output formats.

Who must approve changes:
Token Owner & Eng Lead.

Usage:
node scripts/report-migrations.js --file tokens/migrations/000-example-migration.json

Expected output:
- Lists actions, missing keys, and counts (no changes written).
*/

const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node scripts/report-migrations.js --file <migration.json>');
  process.exit(2);
}

const args = process.argv.slice(2);
const fArg = (() => {
  const i = args.indexOf('--file');
  if (i !== -1 && args[i + 1]) return args[i + 1];
  const f = args.find((a) => a.startsWith('--file='));
  return f ? f.split('=')[1] : null;
})();
if (!fArg) usage();

const migrationPath = path.resolve(process.cwd(), fArg);
if (!fs.existsSync(migrationPath)) {
  console.error('Migration file not found:', migrationPath);
  process.exit(2);
}
const migration = JSON.parse(fs.readFileSync(migrationPath, 'utf8'));
const tokensPath = path.resolve(process.cwd(), 'tokens', 'tokens.json');
const tokens = fs.existsSync(tokensPath) ? JSON.parse(fs.readFileSync(tokensPath, 'utf8')) : null;

function exists(key) {
  if (!tokens) return false;
  const parts = key.split('.');
  let cur = tokens;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object' || !(p in cur)) return false;
    cur = cur[p];
  }
  return true;
}

console.log(`Migration id: ${migration.id}`);
console.log(`Date: ${migration.date}`);
console.log(`Author: ${migration.author}`);
console.log(`Description: ${migration.description}`);
console.log('Actions:');
let missing = 0;
migration.actions.forEach((a, i) => {
  const ok = exists(a.oldKey);
  console.log(
    ` ${i + 1}. ${a.action.toUpperCase()} ${a.oldKey} -> ${a.newKey || '(none)'} ${
      ok ? '' : ' [MISSING]'
    }`
  );
  if (!ok) missing++;
});
console.log(`\nSummary: total actions: ${migration.actions.length}, missing keys: ${missing}`);
if (missing > 0) {
  console.log(
    '\nHints:\n - Run apply-migration with --dry to preview (no changes).\n - Fix missing keys or confirm they will be added before applying.'
  );
}
