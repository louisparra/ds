/*
What this file is:
A simple token build script. Reads tokens/tokens.json and emits:
 - tokens/dist/tokens.json (flattened dot.path -> value)
 - tokens/dist/tokens.css (CSS custom properties under :root)

Who should edit it:
Token Owner or developer responsible for build pipelines. Expand transforms (Style Dictionary, platform outputs) as needed.

When to update (example):
Update when output formats or naming conventions change.

Who must approve changes:
Token Owner and Engineering Lead.

Usage:
# Run locally (Node 18+)
node scripts/build-tokens.js

Expected outputs:
- tokens/dist/tokens.json  (flattened token values)
- tokens/dist/tokens.css   (CSS variables)
If tokens/tokens.json missing, the script exits with a descriptive message.
*/

const fs = require('fs');
const path = require('path');

const TOKENS_IN = path.join(process.cwd(), 'tokens', 'tokens.json');
const DIST_DIR = path.join(process.cwd(), 'tokens', 'dist');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function flatten(obj, prefix = []) {
  const res = {};
  Object.keys(obj).forEach((k) => {
    const val = obj[k];
    if (val && typeof val === 'object' && 'value' in val && Object.keys(val).length >= 1) {
      // leaf token object with a `value`
      const key = [...prefix, k].join('.');
      res[key] = val.value;
    } else if (val && typeof val === 'object') {
      // nested category
      const nested = flatten(val, [...prefix, k]);
      Object.assign(res, nested);
    } else {
      // unexpected scalar; still add
      const key = [...prefix, k].join('.');
      res[key] = val;
    }
  });
  return res;
}

function toCssVars(flatTokens) {
  const lines = [':root {'];
  Object.keys(flatTokens).forEach((k) => {
    // transform dot.path to --dot-path
    const varName = '--' + k.replace(/\./g, '-');
    const value = flatTokens[k];
    lines.push(`  ${varName}: ${value};`);
  });
  lines.push('}');
  return lines.join('\n');
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function writeText(filePath, text) {
  fs.writeFileSync(filePath, text, 'utf8');
}

function main() {
  if (!fs.existsSync(TOKENS_IN)) {
    console.error('tokens/tokens.json not found. Please add tokens or skip build.');
    process.exit(1);
  }

  const raw = fs.readFileSync(TOKENS_IN, 'utf8');
  let tokens;
  try {
    tokens = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse tokens/tokens.json:', e.message);
    process.exit(1);
  }

  const flat = flatten(tokens);
  ensureDir(DIST_DIR);

  const outJson = path.join(DIST_DIR, 'tokens.json');
  const outCss = path.join(DIST_DIR, 'tokens.css');

  writeJson(outJson, flat);
  writeText(outCss, toCssVars(flat));

  console.log(`Built tokens: ${Object.keys(flat).length} tokens`);
  console.log(`Wrote ${outJson}`);
  console.log(`Wrote ${outCss}`);
  process.exit(0);
}

main();
