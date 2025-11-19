/*
What this file is:
Token lint helper — performs schema and semantic checks on tokens/tokens.json.
Supports two modes:
 - local (fast): quick schema + lightweight semantic checks
 - ci (deep): expensive global checks like duplicate-value scanning

Who should edit it:
Token Owner or Tooling engineer.

When to update:
Add rules when token conventions evolve.

Who must approve changes:
Token Owner & Engineering Lead.
*/

const fs = require('fs');
const path = require('path');

const TOKENS_PATH = path.join(process.cwd(), 'tokens', 'tokens.json');

// Parse CLI args
const args = process.argv.slice(2);
const argMode = args.find((a) => a.startsWith('--mode=')) || '';
const MODE = argMode ? argMode.split('=')[1] : process.env.TOKEN_LINT_MODE || 'local'; // 'local' or 'ci'
console.log(`token-lint-rules running in mode: ${MODE}`);

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

  // FAST checks — always run (local & ci)
  const keyFormatViolations = checkKeyFormat(keys);
  const deprecatedIssues = checkDeprecatedFlags(tokens);

  let fail = false;

  if (keyFormatViolations.length) {
    console.error('Key format violations:');
    keyFormatViolations.forEach((v) => console.error(' -', v));
    fail = true;
  }

  if (deprecatedIssues.length) {
    console.error('Deprecated token issues:');
    deprecatedIssues.forEach((i) => console.error(' -', i));
    // In local mode this is a warning; in CI treat as failure
    if (MODE === 'ci') {
      fail = true;
    } else {
      console.warn('Note: deprecated tokens without replacement (local mode -> warning).');
    }
  }

  // DEEP checks — only in CI mode
  if (MODE === 'ci') {
    const dupes = findDuplicateValues(tokens);
    if (dupes.length) {
      console.error('Duplicate token values detected (value -> [existingKey, newKey]):');
      dupes.forEach((d) => console.error(` - ${d.value} -> ${d.keys.join(', ')}`));
      fail = true;
    }
  } else {
    // In local mode, do a quick duplicate heuristic for nearby keys (optional)
    // leaving out expensive full-scan to keep commits fast
  }

  if (fail) {
    console.error('Token lint rules FAILED.');
    process.exit(1);
  } else {
    console.log('OK: token-lint-rules passed.');
    process.exit(0);
  }
}

main();
