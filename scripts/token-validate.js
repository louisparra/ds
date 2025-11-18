/*
What this file is:
Lightweight Node validator for tokens/tokens.json. Ensures file exists and has a shallow shape.

Who should edit it:
Token Owner or a developer. Expand validation rules as the token schema matures.

When to update (example):
Update when token schema requirements change or when adding new output mappings (css/xcassets).

Who must approve changes:
Token Owner and Engineering Lead.

Usage examples:
# Run locally
node scripts/token-validate.js

Expected output:
- "OK: tokens/tokens.json found and contains X top-level keys" (exit 0)
- Or error messages listing missing files or structural issues (exit 1)
*/

const fs = require('fs');
const path = require('path');

const TOKENS_PATH = path.join(process.cwd(), 'tokens', 'tokens.json');

function exitWithError(msg) {
  console.error('ERROR:', msg);
  process.exit(1);
}

function main() {
  if (!fs.existsSync(TOKENS_PATH)) {
    console.warn('WARN: tokens/tokens.json not found. If your project has no tokens yet, skip this check.');
    process.exit(0); // non-failing in template stage
  }

  let raw;
  try {
    raw = fs.readFileSync(TOKENS_PATH, 'utf8');
  } catch (e) {
    exitWithError(`Cannot read ${TOKENS_PATH}: ${e.message}`);
  }

  let tokens;
  try {
    tokens = JSON.parse(raw);
  } catch (e) {
    exitWithError(`Invalid JSON in ${TOKENS_PATH}: ${e.message}`);
  }

  // Basic structural checks: top-level object and at least one key
  if (typeof tokens !== 'object' || Array.isArray(tokens) || tokens === null) {
    exitWithError('tokens/tokens.json should be a JSON object with semantic token keys.');
  }

  const topKeys = Object.keys(tokens);
  if (topKeys.length === 0) {
    console.warn('WARN: tokens/tokens.json is present but empty (no top-level keys).');
    process.exit(0);
  }

  console.log(`OK: tokens/tokens.json found and contains ${topKeys.length} top-level keys.`);
  // Optionally more advanced checks can be added here (value types, deprecated flags, etc.)
  process.exit(0);
}

main();