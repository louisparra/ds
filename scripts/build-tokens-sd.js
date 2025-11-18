/*
What this file is:
Wrapper that runs Style Dictionary programmatically. Registers a small custom iOS plist format
so Style Dictionary can emit a simple iOS-friendly Colors.plist. Validates presence of tokens/tokens.json.

Who should edit it:
Token Owner or Build/Infra engineer.

When to update (example):
Update when you want richer iOS output (xcassets) or different plist structure.

Who must approve changes:
Token Owner and Engineering Lead.

Usage:
npm ci
node scripts/build-tokens-sd.js
*/

const fs = require('fs');
const path = require('path');

const TOKENS_PATH = path.join(process.cwd(), 'tokens', 'tokens.json');
const SD_CONFIG_PATH = path.join(process.cwd(), 'style-dictionary.config.js');

function exitWithError(msg) {
  console.error('ERROR:', msg);
  process.exit(1);
}

function hexNormalize(hex) {
  // Ensure hex is in #RRGGBB or #RRGGBBAA format; leave as-is otherwise.
  if (typeof hex !== 'string') return hex;
  if (!hex.startsWith('#')) return hex;
  if (hex.length === 4) {
    // #RGB -> #RRGGBB
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex;
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

  // Register a simple custom iOS plist format that outputs token name -> hex string.
  // This is intentionally conservative: it emits a plist-like XML mapping so iOS engineers
  // have a straightforward starting artifact. You can replace this with xcassets generation later.
  StyleDictionary.registerFormat({
    name: 'custom/ios-plist',
    formatter: function({ dictionary, file, options }) {
      // We will produce a very simple plist with key/value pairs (string values).
      // Use dictionary.allProperties to capture every token entry that has a value.
      const lines = [];
      lines.push('<?xml version="1.0" encoding="UTF-8"?>');
      lines.push('<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">');
      lines.push('<plist version="1.0">');
      lines.push('<dict>');

      dictionary.allProperties.forEach(prop => {
        const key = prop.name; // already normalized by SD; e.g., colorPrimary
        const rawValue = prop.value;
        // prefer string hex if token looks like a hex color; else stringify
        let outValue = rawValue;
        if (typeof rawValue === 'string' && rawValue.startsWith('#')) {
          outValue = hexNormalize(rawValue);
        } else if (typeof rawValue === 'object' && rawValue.hasOwnProperty('value')) {
          // in case someone passed a token object in a non-standard way
          outValue = rawValue.value;
        }
        lines.push(`  <key>${key}</key>`);
        lines.push(`  <string>${outValue}</string>`);
      });

      lines.push('</dict>');
      lines.push('</plist>');
      return lines.join('\n');
    }
  });

  // load config
  let sdConfig;
  try {
    sdConfig = require(SD_CONFIG_PATH);
  } catch (e) {
    exitWithError(`Failed to load ${SD_CONFIG_PATH}: ${e.message}`);
  }

  // If the user config references ios/colors and that format doesn't exist,
  // we map it to our custom format name if necessary. But since the config
  // already used 'ios/colors' before, it's simpler to ensure the iOS file in the config
  // uses 'custom/ios-plist' as the format. If you keep your config as-is, modify it to:
  //    format: 'custom/ios-plist'
  //
  // For safety, we will also accept either and transform any 'ios' platform file with `destination` ending in 'Colors.plist'
  // to use our 'custom/ios-plist' format before building.
  try {
    // normalize sdConfig to ensure our custom format is used for iOS files named Colors.plist
    if (sdConfig && sdConfig.platforms && sdConfig.platforms.ios && Array.isArray(sdConfig.platforms.ios.files)) {
      sdConfig.platforms.ios.files = sdConfig.platforms.ios.files.map(f => {
        if (f.destination && f.destination.toLowerCase().includes('colors') && f.format !== 'custom/ios-plist') {
          return Object.assign({}, f, { format: 'custom/ios-plist' });
        }
        return f;
      });
    }
  } catch (e) {
    console.warn('Warning: failed to normalize SD config for iOS files; proceeding with original config.');
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
