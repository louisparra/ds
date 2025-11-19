/*
What this file is:
Minimal xcassets color sets generator from tokens/tokens.json. Creates packages/tokens/dist/ios/xcassets/<name>.colorset/Contents.json per color token.

Who should edit it:
Token Owner or iOS engineer.

When to update (example):
Change color component decimals, add light/dark variants, or map alpha formats.

Who must approve changes:
Token Owner & Engineering Lead.

Usage:
  node scripts/generate-ios-xcassets.js
  # writes packages/tokens/dist/ios/xcassets/<token>.colorset/Contents.json

Expected output:
  packages/tokens/dist/ios/xcassets/colorBrandPrimary.colorset/Contents.json
  (This basic format uses RGB hex; adjust if you need asset catalogs with color components.)
*/

const fs = require('fs');
const path = require('path');

const TOKENS_PATH = path.resolve(process.cwd(), 'tokens', 'tokens.json');
const OUT_DIR = path.resolve(process.cwd(), 'packages', 'tokens', 'dist', 'ios', 'xcassets');

if (!fs.existsSync(TOKENS_PATH)) {
  console.error('tokens/tokens.json not found. Run from repo root.');
  process.exit(2);
}

// helpers
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

function iosSafeName(dotPath) {
  // simple camelCase
  const parts = dotPath.split('.');
  return parts
    .map((p, i) => (i === 0 ? p.toLowerCase() : p.charAt(0).toUpperCase() + p.slice(1)))
    .join('');
}

function normalizeHex(hex) {
  if (!hex) return null;
  hex = hex.trim();
  if (/^#([0-9a-fA-F]{3})$/.test(hex)) {
    // expand shorthand
    hex = hex.replace(/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/, '#$1$1$2$2$3$3');
  }
  if (/^#([0-9a-fA-F]{6})$/.test(hex)) return hex.toUpperCase();
  return null;
}

// convert hex '#RRGGBB' to { "color": { "components": { "red": "0.XXX", ... } } } if desired
function hexToComponents(hex) {
  const h = normalizeHex(hex);
  if (!h) return null;
  const r = parseInt(h.substr(1, 2), 16) / 255;
  const g = parseInt(h.substr(3, 2), 16) / 255;
  const b = parseInt(h.substr(5, 2), 16) / 255;
  return { red: r.toFixed(3), green: g.toFixed(3), blue: b.toFixed(3), alpha: '1.000' };
}

try {
  const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
  const leaves = flatten(tokens);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let created = 0;
  for (const e of leaves) {
    const typeHint = (e.token.type || '').toLowerCase();
    const v = e.token.value;
    // pick color-like tokens
    if (typeHint === 'color' || (typeof v === 'string' && v.trim().startsWith('#'))) {
      const name = iosSafeName(e.path);
      const hex = normalizeHex(v);
      if (!hex) {
        console.warn(`Skipping token ${e.path} — not a hex color: ${v}`);
        continue;
      }
      const bundleDir = path.join(OUT_DIR, `${name}.colorset`);
      if (!fs.existsSync(bundleDir)) fs.mkdirSync(bundleDir, { recursive: true });
      // Simple Contents.json which many setups accept; adjust for Xcode expectations if needed.
      // We'll output a contents.json with an "colors" array with one universal color containing RGB components.
      const comps = hexToComponents(hex);
      const content = {
        info: { version: 1, author: 'xcode' },
        colors: [
          {
            idiom: 'universal',
            color: {
              'color-space': 'srgb',
              components: {
                red: comps.red,
                green: comps.green,
                blue: comps.blue,
                alpha: comps.alpha,
              },
            },
          },
        ],
      };
      fs.writeFileSync(
        path.join(bundleDir, 'Contents.json'),
        JSON.stringify(content, null, 2) + '\n',
        'utf8'
      );
      created++;
    }
  }

  console.log(`Wrote ${created} colorsets under ${OUT_DIR}`);
  process.exit(0);
} catch (err) {
  console.error('ERROR generating iOS xcassets:', err && err.message ? err.message : err);
  process.exit(1);
}
