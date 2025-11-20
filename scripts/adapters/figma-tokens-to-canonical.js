/*
What this file is:
Adapter that converts a Figma Tokens plugin export (and similar nested token JSON)
into the repository canonical export schema.

Who should edit it:
Tooling Engineer or Token Owner who maintains Figma export adapters.

When to update (example):
Update when the Figma Tokens plugin changes its export shape, or when the canonical schema evolves.

Who must approve changes:
Token Owner & Engineering Lead.

Usage:
  node scripts/adapters/figma-tokens-to-canonical.js --input ./figma/figma-export.json --output ./figma/canonical-export.json
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

/**
 * Flatten a nested token structure into entries of { name: 'a/b/c', entry: <object> }
 * Conservative: any object that contains 'value' or 'type' is considered a leaf.
 */
const flattenNestedTokens = (node, prefix = []) => {
  const results = [];
  if (!isPlainObject(node)) return results;

  // If node looks like a token leaf, return it as single entry
  if ('value' in node || 'type' in node || 'description' in node || 'meta' in node) {
    results.push({ name: prefix.join('/'), entry: node });
    return results;
  }

  // Otherwise walk children
  for (const key of Object.keys(node)) {
    const child = node[key];
    if (child === null || child === undefined) continue;

    if (isPlainObject(child)) {
      // If child itself is a token leaf, add it
      if ('value' in child || 'type' in child || 'description' in child || 'meta' in child) {
        results.push({ name: prefix.concat([key]).join('/'), entry: child });
      } else {
        // deep dive
        results.push(...flattenNestedTokens(child, prefix.concat([key])));
      }
    } else if (Array.isArray(child)) {
      child.forEach((item, idx) => {
        if (isPlainObject(item) && ('value' in item || 'type' in item)) {
          results.push({ name: prefix.concat([key, String(idx)]).join('/'), entry: item });
        } else {
          results.push({
            name: prefix.concat([key, String(idx)]).join('/'),
            entry: { value: item },
          });
        }
      });
    } else {
      // primitive leaf
      results.push({ name: prefix.concat([key]).join('/'), entry: { value: child } });
    }
  }

  return results;
};

const extractEntries = (exportJson) => {
  if (!exportJson) return [];

  // canonical tokens array
  if (exportJson && Array.isArray(exportJson.tokens)) {
    return exportJson.tokens.map((t) => ({ name: t.name || null, entry: t }));
  }

  // common root keys
  const rootCandidates = ['global', 'tokens', 'properties', 'values', 'dictionary'];
  for (const key of rootCandidates) {
    if (exportJson[key] && isPlainObject(exportJson[key])) {
      return flattenNestedTokens(exportJson[key]);
    }
  }

  // if top-level is an object, flatten from root
  if (isPlainObject(exportJson)) {
    return flattenNestedTokens(exportJson);
  }

  // if array of styles
  if (Array.isArray(exportJson)) {
    return exportJson.map((item) => ({ name: item.name || null, entry: item }));
  }

  return [];
};

const toCanonicalToken = (name, entry) => {
  const token = {};
  token.name = (name || '').replace(/^\//, '');
  token.dotPath = (token.name || '').replace(/\//g, '.').toLowerCase();
  if (entry.type) token.type = entry.type;
  if ('value' in entry) token.value = entry.value;
  else if (entry.raw && entry.raw.value) token.value = entry.raw.value;
  else if ('default' in entry) token.value = entry.default;
  else token.value = null;

  if (entry.description) token.description = entry.description;
  token.meta = token.meta || {};
  token.meta.raw = entry;
  return token;
};

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
