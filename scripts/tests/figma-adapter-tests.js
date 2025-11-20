/*
What this file is:
Small test runner that verifies adapters convert plugin exports to the canonical schema
and that scripts/figma-sync.js can process the canonical export in --dry mode.

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

const tests = [
  {
    name: 'figma-tokens adapter',
    adapter: path.join(adaptersDir, 'figma-tokens-to-canonical.js'),
    fixture: path.join(fixturesDir, 'figma-tokens-export.json'),
    expectedKeys: ['color.brand.primary', 'type.body.16.regular'],
    canonicalOut: path.join(canonicalOutDir, 'canonical-figma-tokens.json'),
  },
  {
    name: 'token-studio adapter',
    adapter: path.join(adaptersDir, 'token-studio-to-canonical.js'),
    fixture: path.join(fixturesDir, 'token-studio-export.json'),
    expectedKeys: ['color.brand.primary', 'spacing.scale.4'],
    canonicalOut: path.join(canonicalOutDir, 'canonical-token-studio.json'),
  },
  {
    name: 'figmagic adapter',
    adapter: path.join(adaptersDir, 'figmagic-to-canonical.js'),
    fixture: path.join(fixturesDir, 'figmagic-export.json'),
    expectedKeys: ['color.brand.primary', 'type.body.16.regular'],
    canonicalOut: path.join(canonicalOutDir, 'canonical-figmagic.json'),
  },
];

(async function main() {
  console.log('Running figma adapter + sync dry-run tests...');
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
      assert(fs.existsSync(t.adapter), `Adapter not found: ${t.adapter}`);
      assert(fs.existsSync(t.fixture), `Fixture not found: ${t.fixture}`);

      // Run adapter to produce canonical export
      const adapterCmd = `node ${t.adapter} --input ${t.fixture} --output ${t.canonicalOut}`;
      console.log('> ' + adapterCmd);
      run(adapterCmd, { cwd: repoRoot });
      assert(fs.existsSync(t.canonicalOut), `Canonical output not created: ${t.canonicalOut}`);

      // Run figma-sync in dry mode on canonical output
      const syncCmd = `node scripts/figma-sync.js --input ${t.canonicalOut} --map figma/FIGMA_STYLE_MAP.json --dry`;
      console.log('> ' + syncCmd);
      const out = run(syncCmd, { cwd: repoRoot });

      // Basic assertions: expect expectedKeys to be referenced in the output (report)
      for (const key of t.expectedKeys) {
        if (!out.includes(key)) {
          throw new Error(
            `Expected token key "${key}" not found in sync report output for test "${t.name}".\nOutput:\n${out}`
          );
        }
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
    console.log('\nAll adapter tests passed.');
    process.exit(0);
  }
})();
