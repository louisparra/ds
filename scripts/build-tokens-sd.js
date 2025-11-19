/*
What this file is:
Node wrapper to run Style Dictionary using the repo config (style-dictionary.config.js).
Who should edit it:
Tooling engineer or Token Owner. Update when the style-dictionary config or transforms change.
When to update (example):
Update when adding/removing platforms or changing output paths.
Who must approve changes:
Token Owner & Engineering Lead.

Usage:
  # from repo root
  node scripts/build-tokens-sd.js

  # CI uses the same script; it exits non-zero on failure so CI will fail the job.
Expected output:
  - logs showing built platforms (web, android, ios)
  - created files under packages/tokens/dist/<platform>/
*/

const path = require('path');

function log(msg) {
  console.log(`[build-tokens-sd] ${msg}`);
}

(async function main() {
  try {
    // Register custom transforms & formats before loading the config
    // These files should exist and register transforms/formats on require.
    const td = path.resolve(process.cwd(), 'style-dictionary', 'transforms.js');
    const fd = path.resolve(process.cwd(), 'style-dictionary', 'formats.js');

    try {
      require(td);
      log(`Loaded transforms from ${path.relative(process.cwd(), td)}`);
    } catch (e) {
      log(`Warning: failed to load transforms module at ${td}: ${e.message}`);
      // continue — config might still work if built-in transforms suffice
    }

    try {
      require(fd);
      log(`Loaded formats from ${path.relative(process.cwd(), fd)}`);
    } catch (e) {
      log(`Warning: failed to load formats module at ${fd}: ${e.message}`);
    }

    // Load Style Dictionary and config
    const StyleDictionary = require('style-dictionary');
    const sdConfigPath = path.resolve(process.cwd(), 'style-dictionary.config.js');

    let sd;
    try {
      // Use extend so config can be a file that requires transforms/formats
      sd = StyleDictionary.extend(sdConfigPath);
    } catch (err) {
      console.error(
        'ERROR: Failed to load style-dictionary config:',
        err && err.message ? err.message : err
      );
      process.exit(2);
    }

    // Build all platforms defined in the config
    log('Starting Style Dictionary build (all platforms)...');
    sd.buildAllPlatforms();
    log('Style Dictionary build completed.');

    // Summarize outputs
    const platforms = Object.keys(
      sd.options && sd.options.platforms ? sd.options.platforms : sd.platforms || sd.options || {}
    );
    // sd.platforms shows built platforms; fall back to config reading
    const built = Object.keys(
      sd && sd.allPlatforms ? sd.allPlatforms : sd.build ? sd.build : sd
    ).filter(Boolean);
    log('Build finished. (Note: Style Dictionary prints detailed file output above.)');

    process.exit(0);
  } catch (err) {
    console.error('ERROR: Style Dictionary build failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
