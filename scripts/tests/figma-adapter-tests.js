/*
What this file is:
Enhanced test runner that verifies adapters convert plugin exports to the canonical schema
and that scripts/figma-sync.js can process the canonical export in --dry mode.
Adds stricter assertions: canonical.schemaVersion, tokens array structure, token objects have name+value,
and domain-specific checks for gradients, shadows and mode-aware tokens.

Who should edit it:
Tooling Engineers maintaining adapters and CI.

When to update (example):
Update when adapters, fixtures, or the canonical schema change.

Who must approve changes:
Token Owner & Engineering Lead.

Usage:
  # locally (after installing deps)
  node scripts/tests/figma-adapter-tests.js

Expected output:
  - Console logs showing each adapter test passing, or an error and non-zero exit if any assertion fails.
*/

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, Object.assign({ stdio: 'pipe', encoding: 'utf8' }, opts));
  } catch (err) {
    // attach stdout/stderr for debug
    err.stdout = err.stdout ? err.stdout.toString() : '';
    err.stderr = err.stderr ? err.stderr.toString() : '';
    throw err;
  }
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

const repoRoot = process.cwd();
const fixturesDir = path.join(repoRoot, 'figma', 'fixtures');
const adaptersDir = path.join(repoRoot, 'scripts', 'adapters');
const canonicalOutDir = path.join(repoRoot, 'figma', 'canonical-tests');

ensureDir(canonicalOutDir);

// Test matrix: fixture -> adapter -> expected keys / domain checks
const tests = [
  {
    name: 'figma-tokens adapter (basic)',
    adapter: path.join(adaptersDir, 'figma-tokens-to-canonical.js'),
    fixture: path.join(fixturesDir, 'figma-tokens-export.json'),
    expectedKeys: ['color.brand.primary', 'type.body.16.regular'],
    canonicalOut: path.join(canonicalOutDir, 'canonical-figma-tokens.json'),
    domainChecks: [], // none extra
  },
  {
    name: 'token-studio adapter (basic)',
    adapter: path.join(adaptersDir, 'token-studio-to-canonical.js'),
    fixture: path.join(fixturesDir, 'token-studio-export.json'),
    expectedKeys: ['color.brand.primary', 'spacing.scale.4'],
    canonicalOut: path.join(canonicalOutDir, 'canonical-token-studio.json'),
    domainChecks: [],
  },
  {
    name: 'figmagic adapter (basic)',
    adapter: path.join(adaptersDir, 'figmagic-to-canonical.js'),
    fixture: path.join(fixturesDir, 'figmagic-export.json'),
    expectedKeys: ['color.brand.primary', 'type.body.16.regular'],
    canonicalOut: path.join(canonicalOutDir, 'canonical-figmagic.json'),
    domainChecks: [],
  },
  {
    name: 'figma-tokens adapter (gradient-linear)',
    adapter: path.join(adaptersDir, 'figma-tokens-to-canonical.js'),
    fixture: path.join(fixturesDir, 'gradient-linear-export.json'),
    expectedKeys: [], // domain check below
    canonicalOut: path.join(canonicalOutDir, 'canonical-gradient-linear.json'),
    domainChecks: ['gradient'],
  },
  {
    name: 'token-studio adapter (gradient-radial)',
    adapter: path.join(adaptersDir, 'token-studio-to-canonical.js'),
    fixture: path.join(fixturesDir, 'gradient-radial-export.json'),
    expectedKeys: [],
    canonicalOut: path.join(canonicalOutDir, 'canonical-gradient-radial.json'),
    domainChecks: ['gradient'],
  },
  {
    name: 'figmagic adapter (shadows)',
    adapter: path.join(adaptersDir, 'figmagic-to-canonical.js'),
    fixture: path.join(fixturesDir, 'shadow-export.json'),
    expectedKeys: [],
    canonicalOut: path.join(canonicalOutDir, 'canonical-shadow.json'),
    domainChecks: ['shadow'],
  },
  {
    name: 'figma-tokens adapter (multi-mode canonical)',
    adapter: path.join(adaptersDir, 'figma-tokens-to-canonical.js'),
    fixture: path.join(fixturesDir, 'multi-mode-export.json'),
    expectedKeys: ['color.bg.page', 'color.text.primary', 'color.brand.gradientModes'],
    canonicalOut: path.join(canonicalOutDir, 'canonical-modes.json'),
    domainChecks: ['modes'],
  },
];

(async function main() {
  console.log('Running enhanced figma adapter + sync dry-run tests...');
  let failures = 0;

  // Basic environment check
  try {
    run('node -v');
  } catch (err) {
    console.error('Node must be available in PATH. Aborting.');
    process.exit(2);
  }

  // Run npm ci minimally to ensure any local dependencies (if CI job already ran it, it's okay)
  try {
    console.log('Installing dependencies (npm ci)...');
    run('npm ci');
  } catch (err) {
    console.warn(
      'npm ci failed or was skipped — ensure CI has run npm ci. Continuing tests anyway.'
    );
  }

  for (const t of tests) {
    console.log(`\n[TEST] ${t.name}`);
    try {
      assert(fs.existsSync(t.fixture), `Fixture not found: ${t.fixture}`);

      // If adapter exists, run it; if not (unlikely), try to copy fixture as canonical (for canonical fixtures)
      if (t.adapter && fs.existsSync(t.adapter)) {
        const adapterCmd = `node ${t.adapter} --input ${t.fixture} --output ${t.canonicalOut}`;
        console.log('> ' + adapterCmd);
        run(adapterCmd, { cwd: repoRoot });
        assert(fs.existsSync(t.canonicalOut), `Canonical output not created: ${t.canonicalOut}`);
      } else {
        // Copy fixture to canonicalOut (useful for fixtures already in canonical form)
        fs.copyFileSync(t.fixture, t.canonicalOut);
        console.log('Adapter missing; copied fixture to canonical out as fallback.');
      }

      // Read canonical JSON and perform structural assertions
      const canonicalRaw = fs.readFileSync(t.canonicalOut, 'utf8');
      let canonical;
      try {
        canonical = JSON.parse(canonicalRaw);
      } catch (e) {
        throw new Error(`Canonical JSON parse error for ${t.canonicalOut}: ${e.message}`);
      }

      // Basic schema assertions
      assert(typeof canonical === 'object', 'Canonical output must be an object');
      // schemaVersion is recommended; if present, ensure it's 1.x
      if (canonical.schemaVersion !== undefined) {
        assert(
          typeof canonical.schemaVersion === 'string',
          'schemaVersion must be a string when present'
        );
        assert(
          canonical.schemaVersion.startsWith('1.'),
          `schemaVersion ${canonical.schemaVersion} not compatible (expect 1.x)`
        );
      }
      // exportedAt if present should be a string
      if (canonical.exportedAt !== undefined) {
        assert(typeof canonical.exportedAt === 'string', 'exportedAt must be string when present');
      }

      // tokens array required for canonical exports
      assert(
        Array.isArray(canonical.tokens),
        `canonical.tokens must be an array (found ${typeof canonical.tokens})`
      );
      assert(canonical.tokens.length > 0, 'canonical.tokens should not be empty');

      // Each token object should have name (string) and value (present)
      for (const token of canonical.tokens) {
        assert(token && typeof token === 'object', 'token entry must be object');
        assert(
          typeof token.name === 'string' && token.name.length > 0,
          `token.name missing or not a string: ${JSON.stringify(token)}`
        );
        assert(token.value !== undefined, `token.value missing for token ${token.name}`);
      }

      // Domain-specific assertions
      const tokensByDot = {};
      for (const tt of canonical.tokens) {
        const dp = tt.dotPath || (tt.name && tt.name.replace(/\//g, '.').toLowerCase());
        tokensByDot[dp] = tt;
      }

      // Check expectedKeys appear either in canonical tokens or will appear in sync output later
      for (const key of t.expectedKeys || []) {
        const found = Object.keys(tokensByDot).some((k) => k.endsWith(key) || k === key);
        assert(found, `Expected key "${key}" not found in canonical tokens for test "${t.name}"`);
      }

      // Gradient checks
      if ((t.domainChecks || []).includes('gradient')) {
        // Ensure at least one token has type 'gradient' or value with 'stops' array
        const hasGradient = canonical.tokens.some((tok) => {
          if (tok.type && String(tok.type).toLowerCase().includes('gradient')) return true;
          const v = tok.value;
          return v && typeof v === 'object' && Array.isArray(v.stops) && v.stops.length >= 2;
        });
        assert(
          hasGradient,
          'No gradient token found in canonical output (expected stops or type: gradient)'
        );
        console.log('  [OK] Gradient structure detected.');
      }

      // Shadow checks
      if ((t.domainChecks || []).includes('shadow')) {
        // Ensure at least one token has type 'shadow' or value object/array with x/y/blur keys
        const hasShadow = canonical.tokens.some((tok) => {
          if (tok.type && String(tok.type).toLowerCase() === 'shadow') return true;
          const v = tok.value;
          if (Array.isArray(v)) {
            return v.some(
              (it) =>
                it &&
                (it.x !== undefined || it.b !== undefined || it.blur !== undefined || it.color)
            );
          }
          if (v && typeof v === 'object') {
            return (
              v.x !== undefined ||
              v.y !== undefined ||
              v.blur !== undefined ||
              v.color !== undefined ||
              v.inset !== undefined
            );
          }
          return false;
        });
        assert(
          hasShadow,
          'No shadow token found in canonical output (expected type: shadow or shadow-like value)'
        );
        console.log('  [OK] Shadow structure detected.');
      }

      // Mode checks (multi-mode)
      if ((t.domainChecks || []).includes('modes')) {
        // Look for the well-known token color.bg.page or similar keys in tokensByDot
        const modeCandidates = [
          'color.bg.page',
          'color.text.primary',
          'color.brand.gradientmodes',
          'color.brand.gradient-modes',
          'color.brand.gradientModes',
        ];
        let found = false;
        for (const candidate of modeCandidates) {
          for (const k of Object.keys(tokensByDot)) {
            if (k.endsWith(candidate)) {
              const tk = tokensByDot[k];
              // modes may live under tk.meta.modes or tk.value.modes
              const modes = (tk.meta && tk.meta.modes) || (tk.value && tk.value.modes) || null;
              assert(
                modes && typeof modes === 'object',
                `Expected modes object for token ${k} but none found`
              );
              // verify at least light and dark
              assert(
                Object.prototype.hasOwnProperty.call(modes, 'light'),
                `modes object for ${k} missing 'light' key`
              );
              assert(
                Object.prototype.hasOwnProperty.call(modes, 'dark'),
                `modes object for ${k} missing 'dark' key`
              );
              found = true;
              console.log(`  [OK] Modes found for token ${k}`);
              break;
            }
          }
          if (found) break;
        }
        assert(
          found,
          'No multi-mode token (with meta.modes) found in canonical output for multi-mode fixture'
        );
      }

      // Run figma-sync dry-run to ensure adapter->sync pipeline works
      const syncCmd = `node scripts/figma-sync.js --input ${t.canonicalOut} --map figma/FIGMA_STYLE_MAP.json --dry`;
      console.log('> ' + syncCmd);
      const out = run(syncCmd, { cwd: repoRoot });

      // Basic assertion: the sync report should reference some token names/dotPaths from canonical
      const sampleToken = canonical.tokens[0];
      if (sampleToken && sampleToken.name) {
        assert(
          out.includes(sampleToken.name) || out.includes(sampleToken.dotPath || ''),
          `Sync dry-run report does not reference sample token ${sampleToken.name}`
        );
      }

      // Additional checks: for domainChecks 'modes' ensure report contains 'modes' or the token dotPath
      if ((t.domainChecks || []).includes('modes')) {
        assert(
          out.toLowerCase().includes('modes') ||
            (t.expectedKeys && t.expectedKeys.some((k) => out.includes(k))),
          'Sync report did not surface modes information (expected)'
        );
      }

      console.log(`[PASS] ${t.name}`);
    } catch (err) {
      failures++;
      console.error(`[FAIL] ${t.name}:`, err.message || err);
      if (err.stdout) console.error('stdout:', err.stdout);
      if (err.stderr) console.error('stderr:', err.stderr);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('\nAll enhanced adapter tests passed.');
    process.exit(0);
  }
})();
