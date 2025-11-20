/*
What this file is:
Adapter that converts Token Studio (Figma native tokens) exports into the canonical schema.

Who should edit it:
Tooling Engineer or Token Owner.

When to update (example):
Update when Token Studio export conventions change or canonical schema updates.

Who must approve changes:
Token Owner & Engineering Lead.

Usage:
  node scripts/adapters/token-studio-to-canonical.js --input ./figma/token-studio-export.json --output ./figma/canonical-export.json

Expected output:
  - Writes ./figma/canonical-export.json containing canonical schema.
*/

const fs = require('fs');
const path = require('path');

function usage() {
  console.log(
    'Usage: node scripts/adapters/token-studio-to-canonical.js --input <token-studio-export.json> [--output <canonical.json>]'
  );
  process.exit(2);
}

const argv = process.argv.slice(2);
let input = null;
let output = path.resolve(process.cwd(), 'figma', 'canonical-export.json');

for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--input' && argv[i + 1]) {
    input = path.resolve(process.cwd(), argv[++i]);
  } else if (argv[i] === '--output' && argv[i + 1]) {
    output = path.resolve(process.cwd(), argv[++i]);
  } else {
    usage();
  }
}
if (!input) usage();

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error('Failed to read/parse', p, e && e.message);
    process.exit(1);
  }
}
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log('Wrote canonical export to', p);
}

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

// Token Studio often exports a top-level "tokens" object keyed by category
// Example shapes handled:
// { "tokens": { "color": { "brand": { "primary": { "value": "#fff", "type":"color" }}}}}
function flattenTokenStudio(obj, prefix = []) {
  const out = [];
  if (!isPlainObject(obj)) return out;
  if ('value' in obj || 'type' in obj || 'description' in obj) {
    out.push({ name: prefix.join('/'), entry: obj });
    return out;
  }
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (isPlainObject(v)) {
      out.push(...flattenTokenStudio(v, prefix.concat([k])));
    } else if (Array.isArray(v)) {
      v.forEach((it, idx) => {
        if (isPlainObject(it)) out.push(...flattenTokenStudio(it, prefix.concat([k, String(idx)])));
        else out.push({ name: prefix.concat([k, String(idx)]).join('/'), entry: { value: it } });
      });
    } else {
      out.push({ name: prefix.concat([k]).join('/'), entry: { value: v } });
    }
  }
  return out;
}

function extractEntries(exportJson) {
  if (!exportJson) return [];
  if (Array.isArray(exportJson.tokens)) {
    // sometimes token studio exports an array
    return exportJson.tokens.map((t) => ({ name: t.name || null, entry: t }));
  }
  if (isPlainObject(exportJson.tokens)) {
    return flattenTokenStudio(exportJson.tokens);
  }
  // fallback: try flattening root
  return flattenTokenStudio(exportJson);
}

function toCanonical(name, entry) {
  const token = {};
  token.name = (name || '').replace(/^\//, '');
  token.dotPath = (token.name || '').replace(/\//g, '.').toLowerCase();
  if ('value' in entry) token.value = entry.value;
  else token.value = entry.default || null;
  if (entry.type) token.type = entry.type;
  if (entry.description) token.description = entry.description;
  token.meta = token.meta || {};
  token.meta.raw = entry;
  return token;
}

(function main() {
  const inJson = readJson(input);
  const entries = extractEntries(inJson);
  const tokens = entries.map(({ name, entry }) => toCanonical(name, entry));
  const canonical = {
    schemaVersion: '1.0',
    exportedAt: new Date().toISOString(),
    source: { plugin: 'token-studio-adapter' },
    tokens,
  };
  writeJson(output, canonical);
})();
