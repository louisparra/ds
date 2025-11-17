/*
What this file is:
A simple Node.js script that scaffolds a release draft file (RELEASE_NOTES_DRAFT.md) using the release-notes template.

Who should edit it:
Release Manager or a maintainer. Update if the release format changes.

When to update (example):
Update when you want to change the release draft structure or the default QA checklist.

Who must approve changes:
Design System Lead and Release Manager.

Usage examples:
1) Create a draft with a name:
   node scripts/create-release-draft.js --name v1.2.0

2) Create a draft and open it for editing (Unix):
   node scripts/create-release-draft.js --name v1.2.0 && ${EDITOR:-vi} RELEASE_NOTES_DRAFT.md

Expected output:
- Creates (or overwrites) RELEASE_NOTES_DRAFT.md at repo root and prints "Release draft created: RELEASE_NOTES_DRAFT.md"
*/

const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'release-notes-template.md');
const OUT_PATH = path.join(process.cwd(), 'RELEASE_NOTES_DRAFT.md');

function printHelp() {
  console.log('Usage: node scripts/create-release-draft.js --name vX.Y.Z');
  console.log('--name    : required. Release tag (e.g., v1.2.0)');
  console.log('--help    : show this help');
}

function readTemplate() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error('Template not found:', TEMPLATE_PATH);
    process.exit(1);
  }
  return fs.readFileSync(TEMPLATE_PATH, 'utf8');
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  const nameIndex = args.indexOf('--name');
  if (nameIndex === -1 || !args[nameIndex + 1]) {
    console.error('Error: --name vX.Y.Z is required.');
    printHelp();
    process.exit(1);
  }
  const releaseName = args[nameIndex + 1];

  const template = readTemplate();
  const content = template.replace('[vX.Y.Z]', releaseName).replace('YYYY-MM-DD', new Date().toISOString().slice(0,10));

  fs.writeFileSync(OUT_PATH, content, 'utf8');
  console.log('Release draft created:', OUT_PATH);
  process.exit(0);
}

main();
