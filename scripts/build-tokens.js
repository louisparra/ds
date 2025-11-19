/*
What this file is:
Higher-level token build runner: runs the Style Dictionary build (via build-tokens-sd.js)
and performs simple smoke checks (presence of expected artifacts) and optional copy to package locations.

Who should edit it:
Tooling engineer or Token Owner. Update when output paths change or you add more verification.

When to update (example):
Add new platform-specific checks, or change 'packages/tokens/dist/*' structure.

Who must approve changes:
Token Owner & Engineering Lead.

Usage examples:
  # Run the full build and smoke checks
  node scripts/build-tokens.js

  # Run a build and only check web outputs
  node scripts/build-tokens.js --platform web

Expected outputs:
  - returns exit code 0 on success
  - prints files created: packages/tokens/dist/web/tokens.css, packages/tokens/dist/android/colors.xml, packages/tokens/dist/ios/Colors.plist
*/

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runNodeScript(scriptPath, args = []) {
  const node = process.execPath || 'node';
  const res = spawnSync(node, [scriptPath, ...args], { stdio: 'inherit' });
  return res.status === 0;
}

// Simple existence check helper
function checkFileExists(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).isFile();
  } catch (e) {
    return false;
  }
}

function usageAndExit() {
  console.log('Usage: node scripts/build-tokens.js [--platform <web|android|ios>]');
  process.exit(2);
}

const args = process.argv.slice(2);
let platform = null;
if (args.length === 2 && args[0] === '--platform') {
  platform = args[1];
} else if (args.length > 0) {
  usageAndExit();
}

(async function main() {
  console.log('[build-tokens] Starting token build pipeline.');

  // 1) Run style-dictionary build wrapper
  const sdScript = path.resolve(process.cwd(), 'scripts', 'build-tokens-sd.js');
  if (!fs.existsSync(sdScript)) {
    console.error('[build-tokens] ERROR: style-dictionary build script missing at', sdScript);
    process.exit(2);
  }

  const ok = runNodeScript(sdScript);
  if (!ok) {
    console.error('[build-tokens] ERROR: style-dictionary build failed.');
    process.exit(1);
  }

  // 2) Smoke checks (platform-specific)
  const checks = {
    web: [
      path.resolve(process.cwd(), 'packages', 'tokens', 'dist', 'web', 'tokens.css'),
      path.resolve(process.cwd(), 'packages', 'tokens', 'dist', 'web', 'tokens.json'),
    ],
    android: [
      path.resolve(process.cwd(), 'packages', 'tokens', 'dist', 'android', 'colors.xml'),
      path.resolve(process.cwd(), 'packages', 'dist', 'android', 'dimens.xml'),
    ],
    ios: [path.resolve(process.cwd(), 'packages', 'tokens', 'dist', 'ios', 'Colors.plist')],
  };

  const platformsToCheck = platform ? [platform] : Object.keys(checks);

  let failed = false;
  for (const p of platformsToCheck) {
    const files = checks[p] || [];
    console.log(`[build-tokens] Checking outputs for platform: ${p}`);
    for (const f of files) {
      if (checkFileExists(f)) {
        console.log(`  ✓ ${path.relative(process.cwd(), f)}`);
      } else {
        console.error(`  ✗ MISSING: ${path.relative(process.cwd(), f)}`);
        failed = true;
      }
    }
  }

  if (failed) {
    console.error('[build-tokens] One or more expected artifacts are missing. See messages above.');
    process.exit(1);
  }

  console.log('[build-tokens] All checks passed.');
  process.exit(0);
})();
