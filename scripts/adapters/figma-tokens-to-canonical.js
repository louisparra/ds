/*
What this file is:
Adapter that converts a Figma Tokens plugin export (and similar nested token JSON) into the repository canonical export schema.

Who should edit it:
Tooling Engineer or Token Owner who maintains Figma export adapters.

When to update (example):
Update when the Figma Tokens plugin changes its export shape, or when the canonical schema evolves.

Who must approve changes:
Token Owner & Engineering Lead.

NOTES:
- When deriving dotPath from `name`, normalize separators to canonical dot.path:
  - replace /, space, _, - with dots
  - remove non-alphanumeric/dot characters
  - collapse duplicate dots
  - lowercase
- If entry.dotPath is provided by the source, it is still preferred (authoritative).
- Fixed lint issue by avoiding unnecessary escape in regex: split slash replacement from other separators.
*/

const fs = require('fs');
const path = require('path');

function usage() {
  console.log(
    'Usage: node scripts/adapters/figma-tokens-to-canonical.js --input <plugin-export.json> [--output <canonical.json>]'
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
  // Trim first
  let s = name.trim();
  // Replace forward slashes first (avoid escaping inside a character class)
  s = s.replace(/\//g, '.');
  // Replace spaces, underscores, and hyphens with dots
  s = s.replace(/[\s\-_]+/g, '.');
  // Remove characters other than alnum and dot
  s = s.replace(/[^a-zA-Z0-9.]/g, '');
  // Collapse multiple dots
  s = s.replace(/\.+/g, '.');
  // Remove leading/trailing dots
  s = s.replace(/^\.+|\.+$/g, '');
  return s.toLowerCase();
}

// Helper: determine whether an object looks like a token leaf
function looksLikeLeaf(obj) {
  if (!isPlainObject(obj)) return false;
  if (Object.prototype.hasOwnProperty.call(obj, 'value')) return true;
  if (
    Object.prototype.hasOwnProperty.call(obj, 'type') &&
    (typeof obj.type === 'string' || typeof obj.type === 'number')
  )
    return true;
  if (Object.prototype.hasOwnProperty.call(obj, 'description')) return true;
  if (Object.prototype.hasOwnProperty.call(obj, 'meta')) return true;
  return false;
}

// Flatten nested object into { name (slash), entry }
function flattenNestedTokens(obj, prefix = []) {
  const out = [];
  if (!isPlainObject(obj)) return out;

  if (looksLikeLeaf(obj)) {
    out.push({ name: prefix.join('/'), entry: obj });
    return out;
  }

  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v === null || v === undefined) continue;
    if (isPlainObject(v) && looksLikeLeaf(v)) {
      out.push({ name: prefix.concat([k]).join('/'), entry: v });
    } else if (Array.isArray(v)) {
      v.forEach((item, idx) => {
        if (isPlainObject(item) && looksLikeLeaf(item)) {
          out.push({ name: prefix.concat([k, String(idx)]).join('/'), entry: item });
        } else if (isPlainObject(item)) {
          out.push(...flattenNestedTokens(item, prefix.concat([k, String(idx)])));
        } else {
          out.push({ name: prefix.concat([k, String(idx)]).join('/'), entry: { value: item } });
        }
      });
    } else if (isPlainObject(v)) {
      out.push(...flattenNestedTokens(v, prefix.concat([k])));
    } else {
      out.push({ name: prefix.concat([k]).join('/'), entry: { value: v } });
    }
  }
  return out;
}

function extractEntries(exportJson) {
  if (exportJson && Array.isArray(exportJson.tokens)) {
    return exportJson.tokens.map((t) => ({ name: t.name || null, entry: t }));
  }

  const rootCandidates = ['global', 'tokens', 'properties', 'values', 'dictionary'];
  for (const key of rootCandidates) {
    if (exportJson[key] && isPlainObject(exportJson[key])) {
      return flattenNestedTokens(exportJson[key]);
    }
  }

  if (isPlainObject(exportJson)) {
    return flattenNestedTokens(exportJson);
  }

  if (Array.isArray(exportJson)) {
    return exportJson.map((item) => ({ name: item.name || null, entry: item }));
  }

  return [];
}

function toCanonicalToken(name, entry) {
  const token = {};
  token.name = (name || '').replace(/^\//, '');
  // Prefer authoritative dotPath from entry if present; otherwise derive and normalize from name
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

  if (entry.type) token.type = entry.type;
  if (Object.prototype.hasOwnProperty.call(entry, 'value')) token.value = entry.value;
  else if ('raw' in entry && entry.raw && entry.raw.value) token.value = entry.raw.value;
  else if ('value' in entry && typeof entry.value === 'object') token.value = entry.value;
  else {
    if (entry.figma && entry.figma.value) token.value = entry.figma.value;
    else token.value = entry.default || null;
  }
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
  const tokens = entries.map(({ name, entry }) => toCanonicalToken(name, entry));
  const canonical = {
    schemaVersion: '1.0',
    exportedAt: new Date().toISOString(),
    source: { plugin: 'figma-tokens-adapter' },
    tokens,
  };
  writeJson(output, canonical);
})();
