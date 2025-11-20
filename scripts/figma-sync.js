/*
What this file is:
Enhanced converter that maps a Figma-exported JSON (from any plugin or adapter)
into the canonical tokens/tokens.json shape. It prefers canonical fields when present,
supports multiple export shapes, improves value extraction (colors, rgba, objects),
and supports mode handling (meta or expansion).

Who should edit it:
Token Owner or Tooling Engineer. Changes to schema handling or mode strategy must be reviewed.

When to update (example):
Update when the canonical export schema changes or when you add support for more plugin export shapes.

Who must approve changes:
Token Owner & Engineering Lead.

Usage examples:
  node scripts/figma-sync.js --input ./figma/canonical.json --map ./figma/FIGMA_STYLE_MAP.json --dry
  node scripts/figma-sync.js --input ./figma/canonical.json --map ./figma/FIGMA_STYLE_MAP.json --dry --modes expand
  node scripts/figma-sync.js --input ./figma/canonical.json --map ./figma/FIGMA_STYLE_MAP.json --output ./tokens/tokens.json
*/

const fs = require('fs');
const path = require('path');

const argv = require('process').argv.slice(2);

function usageAndExit(code = 2) {
  console.log(
    'Usage: node scripts/figma-sync.js --input <figma-export.json> [--map <figma/FIGMA_STYLE_MAP.json>] [--output <tokens/tokens.json>] [--dry] [--modes meta|expand]'
  );
  process.exit(code);
}

let inputPath = null;
let mapPath = path.resolve(process.cwd(), 'figma', 'FIGMA_STYLE_MAP.json'); // default
let outputPath = path.resolve(process.cwd(), 'tokens', 'tokens.json'); // default
let dry = false;
let modesStrategy = 'meta'; // 'meta' or 'expand'

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
  } else if (a === '--modes' && argv[i + 1]) {
    modesStrategy = argv[++i];
  } else {
    usageAndExit(2);
  }
}

if (!inputPath) {
  console.error('ERROR: --input <figma-export.json> is required.');
  usageAndExit(2);
}

if (!['meta', 'expand'].includes(modesStrategy)) {
  console.error('ERROR: --modes must be "meta" or "expand".');
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

function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// value normalization & color helpers
const isHexString = (s) =>
  typeof s === 'string' && /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(s && s.trim());
const expandHex = (shortHex) => {
  const h = shortHex.replace('#', '');
  if (h.length === 3) {
    return '#' + h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  return '#' + h;
};
const clamp01 = (n) => Math.max(0, Math.min(1, n));
const componentToHex = (c) => {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};
const rgbaObjToString = (rgba) => {
  let r = rgba.r,
    g = rgba.g,
    b = rgba.b,
    a = rgba.a;
  if (r === undefined && rgba.red !== undefined) {
    r = rgba.red;
    g = rgba.green;
    b = rgba.blue;
    a = rgba.alpha;
  }
  if (typeof r === 'number' && r <= 1) r = r * 255;
  if (typeof g === 'number' && g <= 1) g = g * 255;
  if (typeof b === 'number' && b <= 1) b = b * 255;
  if (typeof a === 'number' && a > 1) a = a / 255;
  r = Math.round(r || 0);
  g = Math.round(g || 0);
  b = Math.round(b || 0);
  a = a === undefined ? 1 : clamp01(a);
  if (a >= 0.999) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3).replace(/\.?0+$/, '')})`;
};

const parseColorString = (s) => {
  if (!s || typeof s !== 'string') return null;
  const v = s.trim();
  if (isHexString(v)) {
    const hex = expandHex(v);
    return hex.toUpperCase();
  }
  const rgbaMatch = v.match(
    /rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)/i
  );
  if (rgbaMatch) {
    const r = Number(rgbaMatch[1]),
      g = Number(rgbaMatch[2]),
      b = Number(rgbaMatch[3]),
      a = rgbaMatch[4] !== undefined ? Number(rgbaMatch[4]) : 1;
    return rgbaObjToString({ r, g, b, a });
  }
  const bareHex = v.match(/^([A-Fa-f0-9]{6})$/);
  if (bareHex) return ('#' + bareHex[1]).toUpperCase();
  return null;
};

// normalize input export to array of entries
const normalizeFigmaExport = (exportJson) => {
  const entries = [];
  if (!exportJson) return entries;

  if (exportJson.schemaVersion && Array.isArray(exportJson.tokens)) {
    for (const t of exportJson.tokens) {
      entries.push({
        name: t.name || null,
        dotPath: t.dotPath || null,
        valueRaw: t.value,
        type: t.type || null,
        description: t.description || null,
        meta: t.meta || null,
        raw: t,
      });
    }
    return entries;
  }

  if (typeof exportJson === 'object' && !Array.isArray(exportJson)) {
    const maybeFlat = Object.keys(exportJson).every(
      (k) =>
        typeof exportJson[k] === 'object' && ('value' in exportJson[k] || 'type' in exportJson[k])
    );
    if (maybeFlat) {
      for (const k of Object.keys(exportJson)) {
        entries.push({
          name: k,
          dotPath: null,
          valueRaw: exportJson[k].value,
          type: exportJson[k].type || exportJson[k].category || null,
          description: exportJson[k].description || null,
          meta: exportJson[k].meta || null,
          raw: exportJson[k],
        });
      }
      return entries;
    }

    if (exportJson.properties && typeof exportJson.properties === 'object') {
      for (const k of Object.keys(exportJson.properties)) {
        const v = exportJson.properties[k];
        if (typeof v === 'object' && ('value' in v || 'type' in v)) {
          entries.push({
            name: k,
            dotPath: null,
            valueRaw: v.value,
            type: v.type || null,
            description: v.description || null,
            meta: v.meta || null,
            raw: v,
          });
        }
      }
      if (entries.length) return entries;
    }

    if (Array.isArray(exportJson.styles) && exportJson.styles.length) {
      for (const s of exportJson.styles) {
        const val =
          s.value ||
          (s.style && s.style.color) ||
          (s.style && s.style.fills && s.style.fills[0] && s.style.fills[0].color) ||
          null;
        entries.push({
          name: s.name || null,
          dotPath: s.dotPath || null,
          valueRaw: val,
          type: s.type || (s.style && s.style.type) || null,
          description: s.description || null,
          meta: s.meta || null,
          raw: s,
        });
      }
      if (entries.length) return entries;
    }

    // Last resort: flatten object for primitive leaves (non-recursive function expression)
    const walk = (o, prefix = []) => {
      for (const k of Object.keys(o || {})) {
        const v = o[k];
        if (v && typeof v === 'object' && !Array.isArray(v) && !('value' in v) && !('type' in v)) {
          walk(v, prefix.concat([k]));
        } else if (
          typeof v === 'string' ||
          typeof v === 'number' ||
          typeof v === 'boolean' ||
          (v && typeof v === 'object' && 'value' in v)
        ) {
          const name = prefix.concat([k]).join('/');
          if (v && typeof v === 'object' && 'value' in v) {
            entries.push({
              name,
              dotPath: v.dotPath || null,
              valueRaw: v.value,
              type: v.type || null,
              description: v.description || null,
              meta: v.meta || null,
              raw: v,
            });
          } else {
            entries.push({
              name,
              dotPath: null,
              valueRaw: v,
              type: null,
              description: null,
              meta: null,
              raw: v,
            });
          }
        }
      }
    };
    walk(exportJson, []);
    return entries;
  }

  if (Array.isArray(exportJson)) {
    for (const item of exportJson) {
      if (item && typeof item === 'object' && item.name) {
        entries.push({
          name: item.name,
          dotPath: item.dotPath || null,
          valueRaw: item.value || item.val || null,
          type: item.type || null,
          description: item.description || null,
          meta: item.meta || null,
          raw: item,
        });
      }
    }
    return entries;
  }

  return entries;
};

const figmaNameToTokenKeyPreferDotPath = (entry, mapObj) => {
  if (entry && entry.dotPath) return entry.dotPath;
  if (
    mapObj &&
    mapObj.mappings &&
    entry &&
    entry.name &&
    Object.prototype.hasOwnProperty.call(mapObj.mappings, entry.name)
  ) {
    return mapObj.mappings[entry.name];
  }
  if (entry && entry.name) return entry.name.replace(/\//g, '.').toLowerCase();
  return null;
};

// smarter value extraction
const extractValueFromEntry = (e) => {
  if (e.valueRaw !== undefined && e.valueRaw !== null) {
    if (typeof e.valueRaw === 'string') {
      const c = parseColorString(e.valueRaw);
      if (c) return c;
      return e.valueRaw;
    }
    if (typeof e.valueRaw === 'number' || typeof e.valueRaw === 'boolean') return e.valueRaw;
    if (typeof e.valueRaw === 'object') {
      const v = e.valueRaw;
      if (
        (v.r !== undefined && v.g !== undefined && v.b !== undefined) ||
        (v.red !== undefined && v.green !== undefined && v.blue !== undefined)
      ) {
        return rgbaObjToString(v);
      }
      if (v.light || v.dark || v.modes) {
        if (v.modes && typeof v.modes === 'object') return { modes: v.modes };
        return Object.assign({}, v);
      }
      return v;
    }
  }

  if (e.raw && typeof e.raw === 'object') {
    if (e.raw.style && e.raw.style.color) {
      const c = parseColorString(e.raw.style.color);
      if (c) return c;
    }
    if (e.raw.fills && Array.isArray(e.raw.fills) && e.raw.fills[0] && e.raw.fills[0].color) {
      const col = e.raw.fills[0].color;
      return rgbaObjToString(col);
    }
    if (e.raw.value && (typeof e.raw.value === 'string' || typeof e.raw.value === 'number')) {
      return e.raw.value;
    }
  }

  if (typeof e.name === 'string') {
    const possible = e.name.match(/(\d+(\.\d+)?)(px|rem|em)?$/);
    if (possible) {
      const num = Number(possible[1]);
      const unit = possible[3] || null;
      return unit ? `${num}${unit}` : num;
    }
  }
  return null;
};

// Main
(async function main() {
  try {
    const exportJson = readJsonSafe(inputPath);
    if (!exportJson) {
      console.error(`ERROR: Unable to read or parse input export file: ${inputPath}`);
      process.exit(2);
    }

    if (exportJson.schemaVersion) {
      const sv = String(exportJson.schemaVersion);
      if (!sv.startsWith('1.')) {
        console.warn(
          `Warning: export schemaVersion is ${sv}. This script expects 1.x exports or plugin shapes. Proceeding but double-check adapters.`
        );
      }
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
      if (!e || (!e.name && !e.dotPath)) continue;

      const tokenKey = figmaNameToTokenKeyPreferDotPath(e, mapJson);
      if (!tokenKey || tokenKey.trim() === '') {
        report.unmapped.push({
          figmaName: e.name || '(no name)',
          reason: 'empty token key after mapping',
        });
        continue;
      }

      let normalizedValue = extractValueFromEntry(e);
      const metaModes =
        (e.meta && e.meta.modes) || (e.valueRaw && e.valueRaw.modes) || (e.raw && e.raw.modes);
      if (metaModes && typeof metaModes === 'object') {
        if (modesStrategy === 'meta') {
          const defaultMode = metaModes.light !== undefined ? 'light' : Object.keys(metaModes)[0];
          const defaultVal = metaModes[defaultMode];
          normalizedValue = parseColorString(defaultVal) || defaultVal;
          e._modesToPersist = metaModes;
        } else if (modesStrategy === 'expand') {
          const expanded = {};
          for (const mk of Object.keys(metaModes)) {
            const v = metaModes[mk];
            expanded[mk] = parseColorString(v) || v;
          }
          normalizedValue = expanded;
        }
      }

      if (normalizedValue === null || normalizedValue === undefined) {
        if (e.dotPath && e.raw && typeof e.raw === 'object' && e.raw.value !== undefined) {
          normalizedValue = e.raw.value;
        } else if (
          typeof e.raw === 'string' ||
          typeof e.raw === 'number' ||
          typeof e.raw === 'boolean'
        ) {
          normalizedValue = e.raw;
        } else {
          report.warnings.push({
            tokenKey,
            figmaName: e.name,
            note: 'no value extracted; skipping',
          });
          continue;
        }
      }

      const tokenObj = { value: normalizedValue };
      if (e.type) tokenObj.type = e.type;
      if (e.description) tokenObj.description = e.description;
      if (e._modesToPersist && modesStrategy === 'meta') {
        tokenObj.meta = tokenObj.meta || {};
        tokenObj.meta.modes = e._modesToPersist;
      }
      if (e.raw) {
        tokenObj.meta = tokenObj.meta || {};
        tokenObj.meta.raw = e.raw;
      }

      const existing = getNested(existingTokens, tokenKey);
      if (!existing) {
        setNested(newTokens, tokenKey, tokenObj);
        report.added.push({ tokenKey, figmaName: e.name || '(no name)', value: tokenObj.value });
      } else {
        const existingValue = existing && existing.value !== undefined ? existing.value : null;
        const oldStr = JSON.stringify(existingValue);
        const newStr = JSON.stringify(tokenObj.value);
        if (oldStr === newStr) {
          report.unchanged.push({
            tokenKey,
            figmaName: e.name || '(no name)',
            value: tokenObj.value,
          });
        } else {
          const merged = Object.assign({}, existing, tokenObj);
          if (existing.meta && existing.meta.owner && !(tokenObj.meta && tokenObj.meta.owner)) {
            merged.meta = merged.meta || {};
            merged.meta.owner = existing.meta.owner;
          }
          setNested(newTokens, tokenKey, merged);
          report.updated.push({
            tokenKey,
            figmaName: e.name || '(no name)',
            oldValue: existingValue,
            newValue: tokenObj.value,
          });
        }
      }
    }

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
        md.push(`- \`${a.tokenKey}\` <- \`${a.figmaName}\` = \`${JSON.stringify(a.value)}\``);
      }
      md.push('');
    }

    if (report.updated.length) {
      md.push('### Updated tokens');
      md.push('');
      for (const u of report.updated.slice(0, 200)) {
        md.push(
          `- \`${u.tokenKey}\`: \`${JSON.stringify(u.oldValue)}\` => \`${JSON.stringify(
            u.newValue
          )}\` (from \`${u.figmaName}\`)`
        );
      }
      md.push('');
    }

    if (report.unchanged.length) {
      md.push('### Unchanged (same value)');
      md.push('');
      for (const c of report.unchanged.slice(0, 200)) {
        md.push(`- \`${c.tokenKey}\` = \`${JSON.stringify(c.value)}\``);
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

    if (dry) {
      console.log(md.join('\n'));
      process.exit(0);
    }

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
