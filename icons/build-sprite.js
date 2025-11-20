/*
What this file is:
Simple Node.js script that bundles icons/svgs/*.svg into a single SVG sprite (symbols) and emits a JSON mapping.

Who should edit it:
Build/Infra engineer or Icon Owner.

When to update (example):
Update when adding new output formats or changing naming conventions.

Who must approve changes:
Engineering Lead & Icon Owner.

Usage:
  node icons/build-sprite.js
Expected outputs:
  - icons/dist/icons-sprite.svg   (SVG <symbol> sprite)
  - icons/dist/icons-sprite.json  (mapping: name -> symbol id, viewBox)
*/

const fs = require('fs');
const path = require('path');

const svgsDir = path.join(__dirname, 'svgs');
const outDir = path.join(__dirname, 'dist');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function sanitizeId(name) {
  return name.replace(/[^a-z0-9\-_]/gi, '-').toLowerCase();
}

function readSVG(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function extractViewBox(svgContent) {
  const m = svgContent.match(/viewBox=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function extractInnerContent(svgContent) {
  // naive: remove <svg ...> and </svg>
  return svgContent
    .replace(/<\?xml[^>]*\?>\s*/g, '')
    .replace(/<!DOCTYPE[^>]*>\s*/g, '')
    .replace(/<svg[^>]*>/i, '')
    .replace(/<\/svg>/i, '')
    .trim();
}

function buildSprite() {
  ensureDir(outDir);
  const files = fs.readdirSync(svgsDir).filter((f) => f.endsWith('.svg'));
  const symbols = [];
  const map = {};

  files.forEach((file) => {
    const name = path.basename(file, '.svg'); // kebab-case
    const id = sanitizeId(name);
    const fullPath = path.join(svgsDir, file);
    const svg = readSVG(fullPath);
    const viewBox = extractViewBox(svg) || '0 0 24 24';
    const inner = extractInnerContent(svg);
    // wrap in symbol
    const symbol = `<symbol id="${id}" viewBox="${viewBox}">${inner}</symbol>`;
    symbols.push(symbol);
    map[name] = { id, viewBox, filename: `svgs/${file}` };
  });

  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols.join(
    '\n'
  )}\n</svg>\n`;
  fs.writeFileSync(path.join(outDir, 'icons-sprite.svg'), sprite, 'utf8');
  fs.writeFileSync(path.join(outDir, 'icons-sprite.json'), JSON.stringify(map, null, 2), 'utf8');

  console.log(`Built sprite with ${symbols.length} icons -> ${outDir}`);
}

if (require.main === module) {
  try {
    buildSprite();
  } catch (e) {
    console.error('Error building sprite:', e);
    process.exit(1);
  }
}

module.exports = { buildSprite };
