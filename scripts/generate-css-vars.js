/*
What this file is:
Minimal CSS variables generator from canonical tokens/tokens.json.

Who should edit it:
Token Owner or Frontend engineer.

When to update (example):
Update when you change naming conventions for CSS variables.

Who must approve changes:
Token Owner & Engineering Lead.

Usage:
  node scripts/generate-css-vars.js
  # writes packages/tokens/dist/web/tokens.generated.css

Expected output:
  :root { --ds-color-brand-primary: #0a84ff; --ds-spacing-scale-4: 1rem; }
*/

const fs = require('fs');
const path = require('path');

const TOKENS_PATH = path.resolve(process.cwd(), 'tokens', 'tokens.json');
const OUT_DIR = path.resolve(process.cwd(), 'packages', 'tokens', 'dist', 'web');
const OUT_FILE = path.join(OUT_DIR, 'tokens.generated.css');

if (!fs.existsSync(TOKENS_PATH)) {
  console.error('tokens/tokens.json not found. Run from repo root.');
  process.exit(2);
}

function isLeafToken(obj) {
  return obj && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, 'value');
}

function flatten(obj, prefix = []) {
  const entries = [];
  for (const key of Object.keys(obj || {})) {
    const v = obj[key];
    const p = prefix.concat([key]);
    if (isLeafToken(v)) {
      entries.push({ path: p.join('.'), token: v });
    } else if (typeof v === 'object') {
      entries.push(...flatten(v, p));
    }
  }
  return entries;
}

function cssVarName(dotPath) {
  return `--ds-${dotPath.replace(/\./g, '-').toLowerCase()}`;
}

function normalizeValue(val) {
  // keep strings as-is; if numeric, append unit? we keep as-is for safety
  return String(val);
}

try {
  const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
  const leaves = flatten(tokens);
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const lines = [':root {'];
  for (const e of leaves) {
    const name = cssVarName(e.path);
    const value = normalizeValue(e.token.value);
    lines.push(`  ${name}: ${value};`);
  }
  lines.push('}');

  fs.writeFileSync(OUT_FILE, lines.join('\n') + '\n', 'utf8');
  console.log('Wrote', OUT_FILE);
  process.exit(0);
} catch (err) {
  console.error('ERROR generating CSS vars:', err && err.message ? err.message : err);
  process.exit(1);
}
