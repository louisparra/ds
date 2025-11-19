/*
What this file is:
Tiny module to expose token dist as a CommonJS/ES module for local consumption. Edit by Token Owner.

When to update:
Update if the dist path changes or if publishing strategy changes.

Approvals:
Token Owner & Eng Lead.
*/

const path = require('path');
const fs = require('fs');

const distJson = path.join(__dirname, '..', 'dist', 'tokens.json');

function readTokens() {
  if (!fs.existsSync(distJson)) {
    throw new Error(
      'Token dist not built. Run: npm run build-tokens (root) or npm run build in @ds/tokens package.'
    );
  }
  return JSON.parse(fs.readFileSync(distJson, 'utf8'));
}

module.exports = {
  readTokens,
};
