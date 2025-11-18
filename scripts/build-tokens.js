/*
What this file is:
Token build script that resolves the repository root and writes package artifacts to packages/tokens/dist.
It prefers the canonical repo-level tokens/tokens.json, with a fallback to package-local tokens.

Who should edit it:
Token Owner or developer. Update when token source location or dist paths change.

When to update (example):
Change if you want tokens stored under packages/tokens instead of repo root.

Who must approve changes:
Token Owner and Engineering Lead.

Usage:
# from repo root
node scripts/build-tokens.js

Expected outputs:
- packages/tokens/dist/tokens.json
- packages/tokens/dist/tokens.css
*/

const fs = require('fs');
const path = require('path');

// Determine repo-root (scripts are in <repo>/scripts)
const REPO_ROOT = path.resolve(__dirname, '..');
// Candidate token source paths (prefer repo-level)
const TOKENS_REPO_PATH = path.join(REPO_ROOT, 'tokens', 'tokens.json');
// fallback: package-local (useful if someone runs script inside package)
const TOKENS_PACKAGE_LOCAL = path.join(process.cwd(), 'tokens', 'tokens.json');

// Output (write into the tokens package dist so package consumers can read it)
const TOKEN_PKG_DIST = path.join(REPO_ROOT, 'packages', 'tokens', 'dist');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function flatten(obj, prefix = []) {
  const res = {};
  Object.keys(obj).forEach((k) => {
    const val = obj[k];
    if (val && typeof val === 'object' && 'value' in val && Object.keys(val).length >= 1) {
      const key = [...prefix, k].join('.');
      res[key] = val.value;
    } else if (val && typeof val === 'object') {
      const nested = flatten(val, [...prefix, k]);
      Object.assign(res, nested);
    } else {
      const key = [...prefix, k].join('.');
      res[key] = val;
    }
  });
  return res;
}

function toCssVars(flatTokens) {
  const lines = [':root {'];
  Object.keys(flatTokens).forEach((k) => {
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

function readTokensFile(p) {
  try {
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to read/parse ${p}: ${e.message}`);
  }
}

function main() {
  let srcPath = null;

  if (fs.existsSync(TOKENS_REPO_PATH)) {
    srcPath = TOKENS_REPO_PATH;
  } else if (fs.existsSync(TOKENS_PACKAGE_LOCAL)) {
    console.warn('WARN: repo-level tokens not found; using package-local tokens/tokens.json');
    srcPath = TOKENS_PACKAGE_LOCAL;
  } else {
    console.error(
      `ERROR: tokens/tokens.json not found.\nPlease create one at ${TOKENS_REPO_PATH} (you can copy tokens/tokens.example.json).`
    );
    process.exit(1);
  }

  let tokens;
  try {
    tokens = readTokensFile(srcPath);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  const flat = flatten(tokens);
  ensureDir(TOKEN_PKG_DIST);

  const outJson = path.join(TOKEN_PKG_DIST, 'tokens.json');
  const outCss = path.join(TOKEN_PKG_DIST, 'tokens.css');

  writeJson(outJson, flat);
  writeText(outCss, toCssVars(flat));

  console.log(`Built tokens from ${srcPath}: ${Object.keys(flat).length} tokens`);
  console.log(`Wrote ${outJson}`);
  console.log(`Wrote ${outCss}`);
  process.exit(0);
}

main();
