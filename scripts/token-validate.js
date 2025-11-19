/*
What this file is:
Token validation script. Validates tokens/tokens.json and (if present) validates against tokens/tokens.schema.json using Ajv.

Who should edit it:
Token Owner or an engineer. Expand validations as schema evolves.

When to update (example):
Update when schema changes, or when we need to validate additional fields (aliases, platform mappings).

Who must approve changes:
Token Owner and Engineering Lead.

Usage:
# run locally
node scripts/token-validate.js

Expected outputs:
- If tokens missing: non-fatal warning (template stage) and exit 0.
- If schema missing: basic existence & parse checks, exit 0.
- If schema present and tokens valid: "OK: schema validation passed" and exit 0.
- If schema present and tokens invalid: prints errors and exits 1.
*/

const fs = require('fs');
const path = require('path');

const TOKENS_PATH = path.join(process.cwd(), 'tokens', 'tokens.json');
const SCHEMA_PATH = path.join(process.cwd(), 'tokens', 'tokens.schema.json');

// Helper: safe read JSON
function readJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to read/parse ${filePath}: ${e.message}`);
  }
}

async function runSchemaValidation(tokens, schema) {
  let Ajv;
  try {
    Ajv = require('ajv');
  } catch (e) {
    console.error('Ajv not installed. Install dev dependency "ajv" to enable schema validation.');
    console.error(
      'Fallback: skipping schema validation. To enable, run: npm install --save-dev ajv'
    );
    return { skipped: true };
  }

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const valid = validate(tokens);
  if (valid) {
    return { valid: true };
  } else {
    return { valid: false, errors: validate.errors };
  }
}

function exitWithError(msg) {
  console.error('ERROR:', msg);
  process.exit(1);
}

function exitWithWarn(msg) {
  console.warn('WARN:', msg);
  process.exit(0);
}

async function main() {
  if (!fs.existsSync(TOKENS_PATH)) {
    console.warn(
      'WARN: tokens/tokens.json not found. If your project has no tokens yet, skip this check.'
    );
    process.exit(0); // non-failing in template stage
  }

  let tokens;
  try {
    tokens = readJSON(TOKENS_PATH);
  } catch (e) {
    exitWithError(e.message);
  }

  // Basic structural check (previous behavior)
  if (typeof tokens !== 'object' || Array.isArray(tokens) || tokens === null) {
    exitWithError('tokens/tokens.json should be a JSON object with semantic token keys.');
  }
  const topKeys = Object.keys(tokens);
  if (topKeys.length === 0) {
    console.warn('WARN: tokens/tokens.json is present but empty (no top-level keys).');
    process.exit(0);
  }

  // If schema exists, run schema validation
  if (fs.existsSync(SCHEMA_PATH)) {
    let schema;
    try {
      schema = readJSON(SCHEMA_PATH);
    } catch (e) {
      exitWithError(e.message);
    }

    const result = await runSchemaValidation(tokens, schema);
    if (result.skipped) {
      console.log('Schema validation skipped (Ajv not installed).');
      process.exit(0);
    }
    if (result.valid) {
      console.log(`OK: schema validation passed for ${TOKENS_PATH}`);
      process.exit(0);
    } else {
      console.error('Schema validation FAILED. Errors:');
      result.errors.forEach((err) => {
        console.error(` - ${err.instancePath || '(root)'} ${err.message}`);
      });
      process.exit(1);
    }
  } else {
    console.log('No schema found at tokens/tokens.schema.json — basic checks passed.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
