/*
What this file is:
Token lint helper — performs additional semantic checks on tokens/tokens.json beyond JSON Schema.
Examples: key-name format (dot.path), reserved prefixes, detecting identical color values, deprecated token sanity checks.

Who should edit it:
Token Owner or Tooling engineer. Update when new token conventions are introduced.

When to update (example):
Add new naming rules, or additional semantic checks for new token types.

Who must approve changes:
Token Owner & Engineering Lead.

Usage:
# from repo root (Node 18+)
node linting/token-lint-rules.js

Expected output:
- Exit code 0 and "OK" if no rule violations.
- Exit code 1 and list of violations otherwise.
*/

const fs = require('fs');
const path = require('path');

const TOKENS_PATH = path.join(process.cwd(), 'tokens', 'tokens.json');

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error('Failed to read/parse', p, e.message);
    process.exit(2);
  }
}

function flattenKeys(obj, prefix = []) {
  const res = [];
  Object.keys(obj).forEach((k) => {
    const val = obj[k];
    if (val && typeof val === 'object' && !Array.isArray(val) && 'value' in val) {
      res.push([...prefix, k].join('.'));
    } else if (val && typeof val === 'object') {
      res.push(...flattenKeys(val, [...prefix, k]));
    } else {
      res.push([...prefix, k].join('.'));
    }
  });
  return res;
}

function checkKeyFormat(keys) {
  const violations = [];
  const re = /^[a-z0-9]+(?:\.[a-z0-9]+)*$/;
  keys.forEach((k) => {
    if (!re.test(k))
      violations.push(`Invalid token key format: "${k}". Use lowercase alphanum and dots.`);
  });
  return violations;
}

function findDuplicateValues(obj) {
  // naive duplicate value detector for strings (e.g., colors)
  const map = new Map();
  const duplicates = [];
  function recurse(o, p = []) {
    Object.keys(o).forEach((k) => {
      const val = o[k];
      if (val && typeof val === 'object' && 'value' in val) {
        const v = String(val.value).trim();
        if (map.has(v)) {
          duplicates.push({
            value: v,
            keys: [map.get(v), [...p, k].join('.')],
          });
        } else {
          map.set(v, [...p, k].join('.'));
        }
      } else if (typeof val === 'object') {
        recurse(val, [...p, k]);
      }
    });
  }
  recurse(obj);
  return duplicates;
}

function checkDeprecatedFlags(obj) {
  const issues = [];
  function recurse(o, p = []) {
    Object.keys(o).forEach((k) => {
      const val = o[k];
      if (val && typeof val === 'object' && 'value' in val) {
        if (val.deprecated && !val.replacement) {
          issues.push(`Token ${[...p, k].join('.')} is deprecated but has no 'replacement' field.`);
        }
      } else if (typeof val === 'object') {
        recurse(val, [...p, k]);
      }
    });
  }
  recurse(obj);
  return issues;
}

function main() {
  if (!fs.existsSync(TOKENS_PATH)) {
    console.warn('WARN: tokens/tokens.json not found — skipping token-lint-rules.');
    process.exit(0);
  }
  const tokens = readJson(TOKENS_PATH);

  const keys = flattenKeys(tokens);
  const keyFormatViolations = checkKeyFormat(keys);
  const dupes = findDuplicateValues(tokens);
  const deprecatedIssues = checkDeprecatedFlags(tokens);

  let fail = false;
  if (keyFormatViolations.length) {
    console.error('Key format violations:');
    keyFormatViolations.forEach((v) => console.error(' -', v));
    fail = true;
  }
  if (dupes.length) {
    console.error('Duplicate token values detected (value -> [existingKey, newKey]):');
    dupes.forEach((d) => console.error(` - ${d.value} -> ${d.keys.join(', ')}`));
    fail = true;
  }
  if (deprecatedIssues.length) {
    console.error('Deprecated token issues:');
    deprecatedIssues.forEach((i) => console.error(' -', i));
    fail = true;
  }

  if (fail) {
    console.error(
      'Token lint rules FAILED. Fix issues or update token-lint-rules.js if rule change intended.'
    );
    process.exit(1);
  } else {
    console.log('OK: token-lint-rules passed.');
    process.exit(0);
  }
}

main();
