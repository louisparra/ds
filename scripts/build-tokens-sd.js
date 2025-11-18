/*
What this file is:
Wrapper that runs Style Dictionary programmatically. It validates presence of tokens/tokens.json and runs the SD build across configured platforms.

Who should edit it:
Token Owner or Build/Infra engineer. Extend when adding transforms or custom formats.

When to update (example):
Update when style-dictionary.config.js location changes or when adding pre/post build steps.

Who must approve changes:
Token Owner and Engineering Lead.

Usage:
# 1) Ensure dev deps are installed
npm ci

# 2) Run the build
node scripts/build-tokens-sd.js

Expected outputs:
- packages/tokens/dist/web/tokens.css
- packages/tokens/dist/web/tokens.json
- packages/tokens/dist/android/colors.xml
- packages/tokens/dist/android/dimens.xml
- packages/tokens/dist/ios/Colors.plist
*/

const fs = require('fs');
const path = require('path');

const TOKENS_PATH = path.join(process.cwd(), 'tokens', 'tokens.json');
const SD_CONFIG_PATH = path.join(process.cwd(), 'style-dictionary.config.js');

function exitWithError(msg) {
  console.error('ERROR:', msg);
  process.exit(1);
}

async function run() {
  if (!fs.existsSync(TOKENS_PATH)) {
    exitWithError('tokens/tokens.json not found. Please create tokens/tokens.json (copy tokens/tokens.example.json if needed).');
  }

  if (!fs.existsSync(SD_CONFIG_PATH)) {
    exitWithError('style-dictionary.config.js not found at repo root.');
  }

  let StyleDictionary;
  try {
    // require style-dictionary dynamically so we can detect if it's installed
    StyleDictionary = require('style-dictionary');
  } catch (e) {
    console.error('Style Dictionary is not installed. Install dev dependency: npm install --save-dev style-dictionary');
    exitWithError('Style Dictionary missing.');
  }

  // load config
  let sdConfig;
  try {
    sdConfig = require(SD_CONFIG_PATH);
  } catch (e) {
    exitWithError(`Failed to load ${SD_CONFIG_PATH}: ${e.message}`);
  }

  try {
    console.log('Starting Style Dictionary build using config:', SD_CONFIG_PATH);
    const SD = StyleDictionary.extend(sdConfig);
    SD.buildAllPlatforms();
    console.log('Style Dictionary build complete. Outputs written to packages/tokens/dist/*');
    process.exit(0);
  } catch (e) {
    console.error('Style Dictionary build failed:', e.message || e);
    if (e.errors) {
      console.error(e.errors);
    }
    process.exit(1);
  }
}

run();
