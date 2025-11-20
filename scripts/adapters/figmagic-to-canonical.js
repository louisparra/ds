/*
What this file is:
Adapter that converts Figmagic-style exports (or other flattened `properties` shapes) into canonical schema.

Who should edit it:
Tooling Engineer or Token Owner.

When to update (example):
Update when Figmagic export shapes change or canonical schema updates.

Who must approve changes:
Token Owner & Engineering Lead.

NOTES:
- Now prefers entry.dotPath when present. When deriving dotPath from name, normalizes name into canonical dot.path.
*/

const fs = require('fs');
const path = require('path');

function usage() {
  console.log(
    'Usage: node scripts/adapters/figmagic-to-canonical.js --input <figmagic-export.json> [--output <canonical.json>]'
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

  // cleaned regex: removed useless slash escape
  // matches: "/", whitespace, "_", "-" (hyphen last to avoid range)
  let s = name.trim().replace(/[/\s_-]+/g, '.');

  s = s.replace(/[^a-zA-Z0-9.]/g, '');
  s = s.replace(/\.+/g, '.');
  s = s.replace(/^\.+|\.+$/g, '');
  return s.toLowerCase();
}

// Figmagic commonly exports "properties": { "<token-name>": { value: "...", type: "color" } }
function extractFromProperties(obj) {
  const props = obj.properties || obj.props || obj;
  if (!isPlainObject(props)) return [];
  const out = [];
  for (const k of Object.keys(props)) {
    const v = props[k];
    if (v && typeof v === 'object' && ('value' in v || 'type' in v)) {
      out.push({ name: k, entry: v });
    } else if (typeof v === 'string' || typeof v === 'number') {
      out.push({ name: k, entry: { value: v } });
    } else {
      out.push({ name: k, entry: { value: v } });
    }
  }
  return out;
}

function toCanonical(name, entry) {
  const token = {};
  token.name = (name || '').replace(/^\//, '');

  // Prefer explicit dotPath
  if (entry && entry.dotPath && typeof entry.dotPath === 'string' && entry.dotPath.trim() !== '') {
    token.dotPath = entry.dotPath;
  } else {
    token.dotPath = normalizeToDotPathFromName(token.name);
  }

  if ('value' in entry) token.value = entry.value;
  else token.value = entry.val || entry.default || null;

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
  const entries = extractFromProperties(inJson);
  const tokens = entries.map(({ name, entry }) => toCanonical(name, entry));

  const canonical = {
    schemaVersion: '1.0',
    exportedAt: new Date().toISOString(),
    source: { plugin: 'figmagic-adapter' },
    tokens,
  };

  writeJson(output, canonical);
})();
