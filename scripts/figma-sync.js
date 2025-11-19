/*
What this file is:
A safe converter that maps a Figma-exported JSON (from Figma Tokens or similar)
into the canonical tokens/tokens.json shape. Supports a dry-run preview that emits a
markdown report suitable for CI PR comments.

Who should edit it:
Token Owner or Tooling Engineer. Keep changes minimal and reviewed by Token Owner.

When to update (example):
Update when Figma export shape or mapping rules change.

Who must approve changes:
Token Owner & Engineering Lead.

Usage examples:
  # dry-run preview (recommended)
  node scripts/figma-sync.js --input ./figma/figma-export.json --map ./figma/FIGMA_STYLE_MAP.json --dry

  # apply changes (non-dry): creates a backup before writing tokens/tokens.json
  node scripts/figma-sync.js --input ./figma/figma-export.json --map ./figma/FIGMA_STYLE_MAP.json --output ./tokens/tokens.json

Expected outputs:
  - On --dry: prints a Markdown report to stdout describing additions/updates/unmapped entries.
  - On apply: updates tokens/tokens.json, creates a backup tokens/tokens.json.bak.<timestamp>.json, and prints a summary.
*/

const fs = require('fs');
const path = require('path');

const argv = require('process').argv.slice(2);

function usageAndExit(code = 2) {
  console.log(
    'Usage: node scripts/figma-sync.js --input <figma-export.json> --map <figma/FIGMA_STYLE_MAP.json> [--output <tokens/tokens.json>] [--dry]'
  );
  process.exit(code);
}

let inputPath = null;
let mapPath = path.resolve(process.cwd(), 'figma', 'FIGMA_STYLE_MAP.json'); // default
let outputPath = path.resolve(process.cwd(), 'tokens', 'tokens.json'); // default
let dry = false;

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--input' && argv[i + 1]) {
    inputPath = path.resolve(process.cwd(), argv[++i]);
  } else if (a === '--map' && argv[i + 1]) {
    mapPath = path.resolve(process.cwd(), argv[++i]);
  } else if (a === '--output' && argv[i + 1]) {
    outputPath = path.resolve(process.cwd(), argv[++i]);
  } else if (a === '--dry') {
    dry = true;
  } else {
    usageAndExit(2);
  }
}

if (!inputPath) {
  console.error('ERROR: --input <figma-export.json> is required.');
  usageAndExit(2);
}

// helpers
function readJsonSafe(p) {
  try {
    const s = fs.readFileSync(p, 'utf8');
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}

function setNested(obj, dotPath, valueObj) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = Object.assign({}, cur[parts[parts.length - 1]] || {}, valueObj);
}

function getNested(obj, dotPath) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    cur = cur && cur[parts[i]];
    if (cur === undefined) return undefined;
  }
  return cur;
}

// Try to normalize multiple possible Figma export shapes into an array of { name, value, type (optional) }
function normalizeFigmaExport(exportJson) {
  const entries = [];

  if (!exportJson) return entries;

  // If plugin exported a top-level "tokens" or "properties" object with nested entries
  if (typeof exportJson === 'object' && !Array.isArray(exportJson)) {
    // Common shape: { "color/brand/primary": { "value": "#fff", "type":"color" }, ... }
    const maybeFlat = Object.keys(exportJson).every(
      (k) =>
        typeof exportJson[k] === 'object' && ('value' in exportJson[k] || 'type' in exportJson[k])
    );
    if (maybeFlat) {
      for (const k of Object.keys(exportJson)) {
        entries.push({
          name: k,
          value: exportJson[k].value,
          type: exportJson[k].type || exportJson[k].category || null,
          raw: exportJson[k],
        });
      }
      return entries;
    }

    // Some plugins export { properties: { ... } }
    if (exportJson.properties && typeof exportJson.properties === 'object') {
      for (const k of Object.keys(exportJson.properties)) {
        const v = exportJson.properties[k];
        if (typeof v === 'object' && ('value' in v || 'type' in v)) {
          entries.push({ name: k, value: v.value, type: v.type || null, raw: v });
        }
      }
      if (entries.length) return entries;
    }

    // Some exports have "styles" array
    if (Array.isArray(exportJson.styles) && exportJson.styles.length) {
      for (const s of exportJson.styles) {
        // style object might be { name: "color/brand/primary", value: "#fff", type: "color" }
        if (s.name && (s.value || (s.style && s.style.color))) {
          const val =
            s.value ||
            (s.style && s.style.color) ||
            (s.style && s.style.fills && s.style.fills[0] && s.style.fills[0].color) ||
            null;
          entries.push({
            name: s.name,
            value: val,
            type: s.type || (s.style && s.style.type) || null,
            raw: s,
          });
        }
      }
      if (entries.length) return entries;
    }

    // Last resort: flatten all strings in object tree where leaf is primitive
    const walk = (o, prefix = []) => {
      for (const k of Object.keys(o || {})) {
        const v = o[k];
        if (v && typeof v === 'object') {
          walk(v, prefix.concat([k]));
        } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          const name = prefix.concat([k]).join('/');
          entries.push({ name, value: v, type: null, raw: v });
        }
      }
    };
    walk(exportJson, []);
    return entries;
  }

  // If exportJson is array
  if (Array.isArray(exportJson)) {
    for (const item of exportJson) {
      if (item && typeof item === 'object' && item.name) {
        entries.push({
          name: item.name,
          value: item.value || item.val || null,
          type: item.type || null,
          raw: item,
        });
      }
    }
    return entries;
  }

  return entries;
}

function figmaNameToTokenKey(figmaName, mapObj) {
  // If explicit mapping present, use it
  if (
    mapObj &&
    mapObj.mappings &&
    Object.prototype.hasOwnProperty.call(mapObj.mappings, figmaName)
  ) {
    return mapObj.mappings[figmaName];
  }
  // Otherwise apply default transform (replace / with . and lowercase)
  return figmaName.replace(/\//g, '.').toLowerCase();
}

function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Main
(async function main() {
  try {
    const exportJson = readJsonSafe(inputPath);
    if (!exportJson) {
      console.error(`ERROR: Unable to read or parse input export file: ${inputPath}`);
      process.exit(2);
    }

    const mapJson = readJsonSafe(mapPath) || {};
    const existingTokens = readJsonSafe(outputPath) || {};

    const entries = normalizeFigmaExport(exportJson);

    const report = {
      added: [],
      updated: [],
      unchanged: [],
      unmapped: [],
      warnings: [],
    };

    const newTokens = cloneDeep(existingTokens);

    for (const e of entries) {
      if (!e || !e.name) continue;
      const figmaName = e.name;
      const tokenKey = figmaNameToTokenKey(figmaName, mapJson);
      if (!tokenKey || tokenKey.trim() === '') {
        report.unmapped.push({ figmaName, reason: 'empty token key after mapping' });
        continue;
      }

      // normalize token value: try to use e.value, or for color objects, extract hex
      let newValue = null;
      if (e.value !== undefined && e.value !== null) {
        newValue = e.value;
      } else if (e.raw && e.raw.style && e.raw.style.color) {
        // plugin-specific: style.color hex
        newValue = e.raw.style.color;
      } else if (typeof e.raw === 'string' || typeof e.raw === 'number') {
        newValue = e.raw;
      } else {
        // fallback: try to stringify
        try {
          newValue = JSON.stringify(e.raw);
        } catch (err) {
          newValue = String(e.raw);
        }
      }

      if (newValue === null || newValue === undefined) {
        report.warnings.push({ tokenKey, figmaName, note: 'no value extracted' });
        continue;
      }

      // Prepare token object: keep minimal fields; prefer to set type if available
      const tokenObj = { value: newValue };
      if (e.type) tokenObj.type = e.type;

      // Compare with existing token
      const existing = getNested(existingTokens, tokenKey);
      if (!existing) {
        // Add new token
        setNested(newTokens, tokenKey, tokenObj);
        report.added.push({ tokenKey, figmaName, value: newValue });
      } else {
        // Compare value
        const existingValue = existing && existing.value !== undefined ? existing.value : null;
        if (String(existingValue) === String(newValue)) {
          report.unchanged.push({ tokenKey, figmaName, value: newValue });
        } else {
          // Update: preserve metadata fields except 'value' and optional 'type' if provided
          const merged = Object.assign({}, existing, tokenObj);
          setNested(newTokens, tokenKey, merged);
          report.updated.push({ tokenKey, figmaName, oldValue: existingValue, newValue });
        }
      }
    }

    // Build markdown report
    const md = [];
    md.push('# Figma → tokens sync report');
    md.push('');
    md.push(`- input: \`${path.relative(process.cwd(), inputPath)}\``);
    md.push(`- map: \`${path.relative(process.cwd(), mapPath)}\``);
    md.push(`- output (preview): \`${path.relative(process.cwd(), outputPath)}\``);
    md.push('');
    md.push('## Summary');
    md.push('');
    md.push(`- Added: ${report.added.length}`);
    md.push(`- Updated: ${report.updated.length}`);
    md.push(`- Unchanged: ${report.unchanged.length}`);
    md.push(`- Unmapped / skipped: ${report.unmapped.length}`);
    md.push(`- Warnings: ${report.warnings.length}`);
    md.push('');

    if (report.added.length) {
      md.push('### Added tokens');
      md.push('');
      for (const a of report.added.slice(0, 200)) {
        md.push(`- \`${a.tokenKey}\` <- \`${a.figmaName}\` = \`${String(a.value)}\``);
      }
      md.push('');
    }

    if (report.updated.length) {
      md.push('### Updated tokens');
      md.push('');
      for (const u of report.updated.slice(0, 200)) {
        md.push(
          `- \`${u.tokenKey}\`: \`${String(u.oldValue)}\` => \`${String(u.newValue)}\` (from \`${
            u.figmaName
          }\`)`
        );
      }
      md.push('');
    }

    if (report.unchanged.length) {
      md.push('### Unchanged (same value)');
      md.push('');
      for (const c of report.unchanged.slice(0, 200)) {
        md.push(`- \`${c.tokenKey}\` = \`${String(c.value)}\``);
      }
      md.push('');
    }

    if (report.unmapped.length) {
      md.push('### Unmapped or skipped');
      md.push('');
      for (const s of report.unmapped.slice(0, 200)) {
        md.push(`- \`${s.figmaName}\` — ${s.reason}`);
      }
      md.push('');
    }

    if (report.warnings.length) {
      md.push('### Warnings');
      md.push('');
      for (const w of report.warnings.slice(0, 200)) {
        md.push(`- \`${w.tokenKey || '-'}\` — ${w.note} (source: \`${w.figmaName}\`)`);
      }
      md.push('');
    }

    // On dry-run: print report and exit 0 (so CI can post comment)
    if (dry) {
      console.log(md.join('\n'));
      process.exit(0);
    }

    // Apply changes: create backup and write new tokens file
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${outputPath}.bak.${ts}`;
    try {
      if (fs.existsSync(outputPath)) {
        fs.copyFileSync(outputPath, backupPath);
        console.log(`Backup created: ${backupPath}`);
      }
    } catch (err) {
      console.warn('Warning creating backup:', err && err.message ? err.message : err);
    }

    // Write new tokens file (pretty printed)
    fs.writeFileSync(outputPath, JSON.stringify(newTokens, null, 2) + '\n', 'utf8');
    console.log('Wrote updated tokens to', outputPath);
    console.log('');
    console.log(md.join('\n'));
    process.exit(0);
  } catch (err) {
    console.error('ERROR: figma-sync failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
