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

/**
 * Safe JSON read
 */
function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error('Failed to read/parse', p, e.message);
    process.exit(2);
  }
}

/**
 * Flatten tokens into an array of token descriptors
 * returns: [{ path: 'a.b.c', value: '12px', raw: {...}, type: 'color' }]
 */
function flattenTokens(obj, prefix = []) {
  const res = [];
  Object.keys(obj).forEach((k) => {
    const val = obj[k];
    const curPath = [...prefix, k];
    if (val && typeof val === 'object' && !Array.isArray(val) && 'value' in val) {
      res.push({
        path: curPath.join('.'),
        value: val.value,
        raw: val,
        // heuristics: token may include a 'type' property
        type:
          val.type || (val.attributes && val.attributes.category) || inferCategoryFromPath(curPath),
      });
    } else if (val && typeof val === 'object') {
      res.push(...flattenTokens(val, curPath));
    } else {
      // primitive leaf (rare) — still report it
      res.push({
        path: curPath.join('.'),
        value: val,
        raw: { value: val },
        type: inferCategoryFromPath(curPath),
      });
    }
  });
  return res;
}

function inferCategoryFromPath(pathArr) {
  // default: first path segment (e.g., "color", "spacing", "type")
  if (!Array.isArray(pathArr) || pathArr.length === 0) return 'unknown';
  return String(pathArr[0]);
}

/**
 * Check token key format (dot.path, lowercase alnum)
 */
function checkKeyFormat(keys) {
  const violations = [];
  const re = /^[a-z0-9]+(?:\.[a-z0-9]+)*$/;
  keys.forEach((k) => {
    if (!re.test(k))
      violations.push(`Invalid token key format: "${k}". Use lowercase alphanum and dots.`);
  });
  return violations;
}

/**
 * Deprecated flags checking
 */
function checkDeprecatedFlags(tokensArray) {
  const issues = [];
  tokensArray.forEach((t) => {
    const raw = t.raw || {};
    if (raw.deprecated && !raw.replacement) {
      issues.push(`Token ${t.path} is deprecated but has no 'replacement' field.`);
    }
  });
  return issues;
}

/**
 * Duplicate-value detection with policy:
 * - duplicates within same semantic category -> ERROR
 * - duplicates across categories -> allowed only if at least one token in group
 *   has explicit alias/deprecation metadata (replacement|aliasOf|deprecated:true)
 */
function findDuplicateValueIssues(tokensArray) {
  const map = new Map(); // value -> array of token descriptors
  tokensArray.forEach((t) => {
    const v = String(t.value).trim();
    if (!map.has(v)) map.set(v, []);
    map.get(v).push(t);
  });

  const withinCategory = []; // errors
  const acrossCategoryNoAlias = []; // errors/warnings depending on mode

  const ALIAS_KEYS = ['replacement', 'aliasOf', 'deprecated', 'mappedTo'];

  for (const [value, group] of map.entries()) {
    if (group.length <= 1) continue;

    // group by category/type
    const byCat = group.reduce((acc, tk) => {
      const cat = tk.type || inferCategoryFromPath(tk.path.split('.'));
      acc[cat] = acc[cat] || [];
      acc[cat].push(tk);
      return acc;
    }, {});

    // duplicates within same category -> error
    Object.entries(byCat).forEach(([cat, items]) => {
      if (items.length > 1) {
        withinCategory.push({
          value,
          category: cat,
          keys: items.map((i) => i.path),
        });
      }
    });

    // duplicates across categories -> check explicit alias metadata
    const categories = Object.keys(byCat);
    if (categories.length > 1) {
      const hasExplicitAlias = group.some((tk) => {
        const raw = tk.raw || {};
        for (const key of ALIAS_KEYS) {
          if (Object.prototype.hasOwnProperty.call(raw, key)) {
            if (key === 'deprecated') {
              if (raw.deprecated === true) return true;
            } else if (raw[key]) {
              return true;
            }
          }
        }
        return false;
      });

      if (!hasExplicitAlias) {
        acrossCategoryNoAlias.push({
          value,
          keys: group.map((g) => g.path),
          categories,
        });
      }
    }
  }

  return {
    withinCategory,
    acrossCategoryNoAlias,
  };
}

function main() {
  if (!fs.existsSync(TOKENS_PATH)) {
    console.warn('WARN: tokens/tokens.json not found — skipping token-lint-rules.');
    process.exit(0);
  }
  const tokensObj = readJson(TOKENS_PATH);

  // Flatten tokens
  const tokensArray = flattenTokens(tokensObj);
  const keys = tokensArray.map((t) => t.path);

  // FAST checks — always run (local & ci)
  const keyFormatViolations = checkKeyFormat(keys);
  const deprecatedIssues = checkDeprecatedFlags(tokensArray);

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
    const dupIssues = findDuplicateValueIssues(tokensArray);

    if (dupIssues.withinCategory.length > 0) {
      console.error('Duplicate token values detected within the same semantic category (errors):');
      dupIssues.withinCategory.forEach((d) => {
        console.error(` - ${d.value} -> ${d.keys.join(', ')} (category: ${d.category})`);
      });
      fail = true;
    }

    if (dupIssues.acrossCategoryNoAlias.length > 0) {
      console.error(
        'Duplicate token values detected across semantic categories without explicit alias/deprecation metadata:'
      );
      dupIssues.acrossCategoryNoAlias.forEach((d) => {
        console.error(
          ` - ${d.value} -> ${d.keys.join(', ')} (categories: ${d.categories.join(', ')})`
        );
      });
      // Treat cross-category duplicates without explicit alias as failure in CI
      fail = true;
    }
  } else {
    // Local mode: quick, non-blocking hinting for duplicates across categories
    const { acrossCategoryNoAlias } = findDuplicateValueIssues(tokensArray);
    if (acrossCategoryNoAlias.length > 0) {
      console.warn(
        'Potential duplicate token values across categories (no explicit alias found). Consider adding replacement/aliasOf metadata if intentional:'
      );
      acrossCategoryNoAlias.forEach((d) => {
        console.warn(
          ` - ${d.value} -> ${d.keys.join(', ')} (categories: ${d.categories.join(', ')})`
        );
      });
    }
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
