/*
What this file is:
Adapter that converts Token Studio (Figma native tokens) exports into the canonical schema.

Who should edit it:
Tooling Engineer or Token Owner.

When to update (example):
Update when Token Studio export conventions change or canonical schema updates.

Who must approve changes:
Token Owner & Engineering Lead.

NOTES:
- Now prefers entry.dotPath when present, preserving canonical dotPath casing and overrides.
- When deriving a dotPath from a name, normalizes separators to canonical dot.path (replaces /, space, _, - with dots,
  removes non-alphanumeric/dot, collapses duplicate dots, lowercases).
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

// Normalize a derived name into a dot.path canonical key
function normalizeToDotPathFromName(name) {
  if (!name || typeof name !== 'string') return '';
  // replace common separators with dot (remove useless escape)
  let s = name.trim().replace(/[/\s\-_]+/g, '.');
  // remove characters other than alnum and dot
  s = s.replace(/[^a-zA-Z0-9.]/g, '');
  // collapse multiple dots
  s = s.replace(/\.+/g, '.');
  // remove leading/trailing dots
  s = s.replace(/^\.+|\.+$/g, '');
  return s.toLowerCase();
}

// Token Studio often exports a top-level "tokens" object keyed by category
function flattenTokenStudio(obj, prefix = []) {
  const out = [];
  if (!isPlainObject(obj)) return out;

  if (
    Object.prototype.hasOwnProperty.call(obj, 'value') ||
    (Object.prototype.hasOwnProperty.call(obj, 'type') &&
      (typeof obj.type === 'string' || typeof obj.type === 'number')) ||
    Object.prototype.hasOwnProperty.call(obj, 'description')
  ) {
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
        else
          out.push({
            name: prefix.concat([k, String(idx)]).join('/'),
            entry: { value: it },
          });
      });
    } else {
      out.push({
        name: prefix.concat([k]).join('/'),
        entry: { value: v },
      });
    }
  }
  return out;
}

function extractEntries(exportJson) {
  if (!exportJson) return [];
  if (Array.isArray(exportJson.tokens)) {
    return exportJson.tokens.map((t) => ({ name: t.name || null, entry: t }));
  }
  if (isPlainObject(exportJson.tokens)) {
    return flattenTokenStudio(exportJson.tokens);
  }
  return flattenTokenStudio(exportJson);
}

function toCanonical(name, entry) {
  const token = {};
  token.name = (name || '').replace(/^\//, '');

  if (
    entry &&
    typeof entry === 'object' &&
    entry.dotPath &&
    typeof entry.dotPath === 'string' &&
    entry.dotPath.trim() !== ''
  ) {
    token.dotPath = entry.dotPath;
  } else {
    token.dotPath = normalizeToDotPathFromName(token.name);
  }

  if ('value' in entry) token.value = entry.value;
  else token.value = entry.default || null;

  if (entry.type) token.type = entry.type;
  if (entry.description) token.description = entry.description;

  token.meta = token.meta || {};
  if (entry.meta && typeof entry.meta === 'object') {
    token.meta = Object.assign({}, entry.meta, token.meta);
  }
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
