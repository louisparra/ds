/*
What this file is:
Node script that validates tokens/tokens.json against tokens/tokens.schema.json using AJV.
Who should edit it:
Token Owner or Tooling engineer. Update when schema location or validation policy changes.
When to update (example):
Add additional checks (e.g., color regex or unit rules) or change schema path.
Who must approve changes:
Token Owner & Engineering Lead.

Usage examples:
  node scripts/token-validate.js
  node scripts/token-validate.js --file tokens/tokens.json

Expected outputs:
  - Exit code 0 and message "OK: schema validation passed for <file>" if valid.
  - Exit code 1 and printed list of schema errors if invalid.
*/

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

function usage() {
  console.log('Usage: node scripts/token-validate.js [--file path/to/tokens.json]');
  process.exit(2);
}

const args = process.argv.slice(2);
let fileArg = args.find((a) => a.startsWith('--file='));
if (!fileArg) {
  const idx = args.indexOf('--file');
  if (idx !== -1 && args[idx + 1]) fileArg = `--file=${args[idx + 1]}`;
}
const tokensPath = fileArg
  ? path.resolve(process.cwd(), fileArg.split('=')[1])
  : path.resolve(process.cwd(), 'tokens', 'tokens.json');
const schemaPath = path.resolve(process.cwd(), 'tokens', 'tokens.schema.json');

function readJsonFile(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error(`ERROR: Failed to read or parse JSON file at ${p}`);
    console.error(e.message);
    process.exit(2);
  }
}

// Ensure files exist
if (!fs.existsSync(schemaPath)) {
  console.error(`ERROR: Schema file not found at ${schemaPath}`);
  process.exit(2);
}
if (!fs.existsSync(tokensPath)) {
  console.error(`ERROR: Tokens file not found at ${tokensPath}`);
  process.exit(2);
}

// Load files
const schema = readJsonFile(schemaPath);
const tokens = readJsonFile(tokensPath);

// Setup AJV
// NOTE: remove deprecated jsonPointers option and add allowUnionTypes to support 'type': ['string','number'] patterns
const ajv = new Ajv({ allErrors: true, verbose: true, allowUnionTypes: true });
// If you have ajv-errors installed, we can use it for nicer messages; swallow errors if not installed.
try {
  require('ajv-errors')(ajv);
} catch (e) {
  /* optional - ajv-errors not installed; proceed without it */
}

// compile and validate
let validate;
try {
  validate = ajv.compile(schema);
} catch (compileErr) {
  console.error('ERROR: Failed to compile JSON schema:');
  console.error(compileErr && compileErr.message ? compileErr.message : compileErr);
  process.exit(2);
}

const valid = validate(tokens);

if (valid) {
  console.log(`OK: schema validation passed for ${tokensPath}`);
  process.exit(0);
} else {
  console.error(`Schema validation failed for ${tokensPath}. Errors:`);
  // print structured and helpful errors
  validate.errors.forEach((err) => {
    // instancePath is the JSON Pointer to the failing node
    const instancePath = err.instancePath || err.dataPath || '';
    const message = err.message || JSON.stringify(err);
    console.error(` - ${instancePath} ${message}`);
    if (err.params) {
      if (err.keyword === 'required' && err.params && err.params.missingProperty) {
        console.error(`   -> Missing property: ${err.params.missingProperty}`);
      } else if (
        err.keyword === 'additionalProperties' &&
        err.params &&
        err.params.additionalProperty
      ) {
        console.error(`   -> Unexpected property: ${err.params.additionalProperty}`);
      }
    }
  });
  // exit with non-zero so CI fails
  process.exit(1);
}
