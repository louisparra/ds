/*
What this file is:
Minimal Android resources generator (colors.xml and dimens.xml) from tokens/tokens.json.

Who should edit it:
Token Owner or Android engineer.

When to update (example):
Update when Android naming or dimen formatting rules change.

Who must approve changes:
Token Owner & Engineering Lead.

Usage:
  node scripts/generate-android-res.js
  # writes packages/tokens/dist/android/colors.xml and dimens.xml

Expected output:
  <resources><color name="color_brand_primary">#0a84ff</color>...</resources>
  <resources><dimen name="spacing_scale_4">16dp</dimen>...</resources>
*/

const fs = require('fs');
const path = require('path');

const TOKENS_PATH = path.resolve(process.cwd(), 'tokens', 'tokens.json');
const OUT_DIR = path.resolve(process.cwd(), 'packages', 'tokens', 'dist', 'android');
const COLORS_FILE = path.join(OUT_DIR, 'colors.xml');
const DIMENS_FILE = path.join(OUT_DIR, 'dimens.xml');

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

function androidName(dotPath) {
  return dotPath.replace(/\./g, '_').toLowerCase();
}

function toDp(value) {
  // naive: if value ends with px, strip and use integer dp; else pass through
  if (typeof value === 'string' && value.trim().endsWith('px')) {
    const n = parseFloat(value.trim().replace('px', ''));
    // round to nearest int
    return `${Math.round(n)}dp`;
  }
  return String(value);
}

function isColorValue(v) {
  return typeof v === 'string' && v.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
}

try {
  const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
  const leaves = flatten(tokens);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const colors = [];
  const dimens = [];

  for (const e of leaves) {
    const typeHint = (e.token.type || '').toLowerCase();
    const name = androidName(e.path);
    const v = e.token.value;
    if (typeHint === 'color' || isColorValue(v)) {
      colors.push({ name, value: v });
    } else if (
      typeHint.indexOf('spacing') !== -1 ||
      typeHint.indexOf('dimension') !== -1 ||
      String(v).endsWith('px')
    ) {
      dimens.push({ name, value: toDp(v) });
    }
  }

  // colors.xml
  const colLines = ['<?xml version="1.0" encoding="utf-8"?>', '<resources>'];
  for (const c of colors) {
    colLines.push(`  <color name="${c.name}">${c.value}</color>`);
  }
  colLines.push('</resources>');
  fs.writeFileSync(COLORS_FILE, colLines.join('\n') + '\n', 'utf8');
  console.log('Wrote', COLORS_FILE);

  // dimens.xml
  const dimLines = ['<?xml version="1.0" encoding="utf-8"?>', '<resources>'];
  for (const d of dimens) {
    dimLines.push(`  <dimen name="${d.name}">${d.value}</dimen>`);
  }
  dimLines.push('</resources>');
  fs.writeFileSync(DIMENS_FILE, dimLines.join('\n') + '\n', 'utf8');
  console.log('Wrote', DIMENS_FILE);

  process.exit(0);
} catch (err) {
  console.error('ERROR generating Android resources:', err && err.message ? err.message : err);
  process.exit(1);
}
