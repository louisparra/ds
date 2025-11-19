/*
What this file is:
Wrapper that runs Style Dictionary programmatically and writes platform artifacts (web/android/ios).
Who should edit it:
Token Owner or Build/Infra engineer. Update when the SD config filename or build steps change.
When to update (example):
Update if you add new platforms, custom formats, or change the tokens source path.
Who must approve changes:
Token Owner and Engineering Lead.

Usage examples:
# Install dev deps (once)
npm ci

# Run the Style Dictionary build (recommended)
node scripts/build-tokens-sd.js

# Run and specify a custom config (optional)
STYLE_DICTIONARY_CONFIG=./my-style-dict.config.js node scripts/build-tokens-sd.js

Expected outputs (when tokens/tokens.json exists and config valid):
- packages/tokens/dist/web/tokens.css
- packages/tokens/dist/web/tokens.json
- packages/tokens/dist/android/colors.xml
- packages/tokens/dist/android/dimens.xml
- packages/tokens/dist/ios/Colors.plist
*/

const fs = require('fs');
const path = require('path');

const DEFAULT_TOKENS_PATH = path.join(process.cwd(), 'tokens', 'tokens.json');
const DEFAULT_CONFIG_PATH = path.join(process.cwd(), 'style-dictionary.config.js');

function exitWithError(msg) {
  // explicit single error output, CLI-friendly
  console.error('ERROR:', msg);
  process.exit(1);
}

function safeHasOwn(obj, prop) {
  // Use Object.hasOwn when available; fallback to robust call
  if (typeof Object.hasOwn === 'function') {
    return Object.hasOwn(obj, prop);
  }
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function resolveConfigPath() {
  // Allow override via env var for flexibility in CI/local testing
  if (process.env.STYLE_DICTIONARY_CONFIG) {
    return path.resolve(process.cwd(), process.env.STYLE_DICTIONARY_CONFIG);
  }
  return DEFAULT_CONFIG_PATH;
}

async function run() {
  const tokensPath = DEFAULT_TOKENS_PATH;
  const configPath = resolveConfigPath();

  if (!fs.existsSync(tokensPath)) {
    exitWithError(
      `tokens/tokens.json not found at ${tokensPath}. Please create tokens/tokens.json (you can copy tokens/tokens.example.json).`
    );
  }

  if (!fs.existsSync(configPath)) {
    exitWithError(
      `Style Dictionary config not found at ${configPath}. Set STYLE_DICTIONARY_CONFIG or add style-dictionary.config.js.`
    );
  }

  let StyleDictionary;
  try {
    // dynamically require so missing dependency can be reported clearly
    StyleDictionary = require('style-dictionary');
  } catch (e) {
    console.error(
      'Style Dictionary is not installed. Install dev dependency: npm install --save-dev style-dictionary'
    );
    exitWithError('Style Dictionary missing.');
  }

  let sdConfig;
  try {
    sdConfig = require(configPath);
  } catch (e) {
    exitWithError(`Failed to load ${configPath}: ${e && e.message ? e.message : String(e)}`);
  }

  // Basic sanity check of config shape (helpful early feedback)
  if (!sdConfig || typeof sdConfig !== 'object') {
    exitWithError(`Style Dictionary config must export an object. Check ${configPath}.`);
  }

  if (!safeHasOwn(sdConfig, 'platforms') || typeof sdConfig.platforms !== 'object') {
    // Not fatal — some projects might build manually, but warn and proceed to let SD decide.
    console.warn(
      'WARN: style-dictionary config has no "platforms" key or it is not an object. Style Dictionary may still run if config uses custom logic.'
    );
  }

  try {
    console.log('Starting Style Dictionary build with config:', configPath);
    const SD = StyleDictionary.extend(sdConfig);

    // Build all platforms (this will throw if formats/transforms are invalid)
    SD.buildAllPlatforms();

    // Optionally print a summary of generated outputs (best-effort)
    if (sdConfig.platforms && typeof sdConfig.platforms === 'object') {
      Object.keys(sdConfig.platforms).forEach((platformKey) => {
        const platform = sdConfig.platforms[platformKey];
        const buildPath = platform.buildPath || '(no buildPath)';
        const files = Array.isArray(platform.files)
          ? platform.files.map((f) => f.destination || '<unknown>').join(', ')
          : '(no files listed)';
        console.log(` - platform: ${platformKey} -> ${buildPath} [${files}]`);
      });
    }

    console.log('Style Dictionary build complete. Outputs should be under packages/tokens/dist/*');
    process.exit(0);
  } catch (err) {
    // Prefer readable error messages for CI
    console.error('Style Dictionary build failed:', err && err.message ? err.message : String(err));
    // If Style Dictionary provides details, print them
    if (err && err.errors) {
      try {
        // err.errors can be array-like
        (err.errors || []).forEach((e) => {
          console.error(' -', e);
        });
      } catch (e) {
        // ignore
      }
    }
    process.exit(1);
  }
}

run();
