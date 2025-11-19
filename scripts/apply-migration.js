/*
What this file is:
Apply a machine-readable migration mapping to tokens/tokens.json. Creates a backup and updates tokens per mapping.

Who should edit it:
Tooling engineer or Token Owner. Update when migration formats change.

When to update (example):
Add new action types (e.g., split -> multiple) or change backup location.

Who must approve changes:
Token Owner & Engineering Lead.

Usage:
# Preview (dry-run)
node scripts/apply-migration.js --file tokens/migrations/000-example-migration.json --dry

# Apply migration (destructive; creates a backup)
node scripts/apply-migration.js --file tokens/migrations/000-example-migration.json

Expected outputs:
- On success: prints changed keys and path to backup file.
- On missing keys: prints warnings and continues (does not fail by default unless --fail-on-missing).
*/

const fs = require('fs');
const path = require('path');

function usageAndExit() {
  console.log(
    'Usage: node scripts/apply-migration.js --file <migration.json> [--dry] [--fail-on-missing]'
  );
  process.exit(2);
}

const argv = process.argv.slice(2);
const fileArg = (() => {
  const i = argv.indexOf('--file');
  if (i !== -1 && argv[i + 1]) return argv[i + 1];
  const f = argv.find((a) => a.startsWith('--file='));
  return f ? f.split('=')[1] : null;
})();
if (!fileArg) usageAndExit();

const dryRun = argv.includes('--dry');
const failOnMissing = argv.includes('--fail-on-missing');

const migrationPath = path.resolve(process.cwd(), fileArg);
if (!fs.existsSync(migrationPath)) {
  console.error('Migration file not found:', migrationPath);
  process.exit(2);
}

const tokensPath = path.resolve(process.cwd(), 'tokens', 'tokens.json');
if (!fs.existsSync(tokensPath)) {
  console.error('tokens/tokens.json not found; cannot apply migration.');
  process.exit(2);
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error(`Failed to read/parse ${p}:`, e.message);
    process.exit(2);
  }
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

// dot.path helpers
function getAt(obj, dotPath) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object' || !(p in cur)) return undefined;
    cur = cur[p];
  }
  return cur;
}

function setAt(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in cur) || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function deleteAt(obj, dotPath) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in cur)) return false;
    cur = cur[p];
  }
  const last = parts[parts.length - 1];
  if (!(last in cur)) return false;
  delete cur[last];
  return true;
}

const migration = readJson(migrationPath);
const tokens = readJson(tokensPath);

const actions = migration.actions || [];
const summary = { applied: [], warnings: [], errors: [] };

for (const act of actions) {
  const { oldKey, newKey, action, notes, reversible } = act;
  const existing = getAt(tokens, oldKey);
  if (existing === undefined) {
    const msg = `Missing token: ${oldKey}`;
    summary.warnings.push(msg);
    console.warn('WARN:', msg);
    if (failOnMissing) summary.errors.push(msg);
    continue;
  }

  if (action === 'rename') {
    if (!newKey) {
      const msg = `rename action requires newKey for ${oldKey}`;
      console.error('ERROR:', msg);
      summary.errors.push(msg);
      continue;
    }
    const newExists = getAt(tokens, newKey);
    if (newExists !== undefined) {
      summary.warnings.push(`Target key already exists: ${newKey} (skipping overwrite)`);
      console.warn('WARN: target exists, skipping:', newKey);
      continue;
    }
    // perform move
    setAt(tokens, newKey, existing);
    deleteAt(tokens, oldKey);
    summary.applied.push({ action: 'rename', from: oldKey, to: newKey });
  } else if (action === 'alias') {
    if (!newKey) {
      summary.errors.push(`alias action requires newKey for ${oldKey}`);
      console.error('ERROR: alias missing newKey for', oldKey);
      continue;
    }
    // create newKey pointing to same value (copy) and mark oldKey deprecated
    setAt(tokens, newKey, existing);
    // mark old as deprecated with replacement
    const oldObj = Object.assign({}, existing);
    oldObj.deprecated = true;
    oldObj.replacement = newKey;
    setAt(tokens, oldKey, oldObj);
    summary.applied.push({ action: 'alias', from: oldKey, to: newKey });
  } else if (action === 'deprecate') {
    // mark token deprecated and optionally set replacement
    const obj = Object.assign({}, existing);
    obj.deprecated = true;
    if (newKey) obj.replacement = newKey;
    setAt(tokens, oldKey, obj);
    summary.applied.push({ action: 'deprecate', key: oldKey, replacement: newKey || null });
  } else if (action === 'noop') {
    summary.applied.push({ action: 'noop', key: oldKey });
  } else {
    summary.warnings.push(`Unknown action "${action}" for ${oldKey}`);
  }
}

// Fail fast on errors from mapping
if (summary.errors.length) {
  console.error('Migration errors encountered:');
  summary.errors.forEach((e) => console.error(' -', e));
  process.exit(1);
}

if (dryRun) {
  console.log('Dry-run: no files written. Summary:');
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

// create backup
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = `${tokensPath}.bak.${ts}.json`;
fs.copyFileSync(tokensPath, backupPath);
console.log('Backup created at', backupPath);

// write new tokens
writeJson(tokensPath, tokens);
console.log('Updated tokens written to', tokensPath);
console.log('Migration summary:');
console.log(JSON.stringify(summary, null, 2));
console.log(
  'Next steps: run `npm run token-validate` and `npm run token-lint:ci` in CI; open PR with this change.'
);
