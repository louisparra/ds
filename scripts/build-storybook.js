/*
What this file is:
Simple Storybook build/check helper for CI; either runs a configured build or checks story files exist.

Who should edit it:
Component owners or Engineers who maintain Storybook. Update when build commands change.

When to update (example):
Update when Storybook config moves or build commands are added.

Who must approve changes:
Component Owner and Engineering Lead.

Usage:
# Run locally (Node 18+)
node scripts/build-storybook.js

Expected outputs:
- If storybook build command is configured: prints build output or "Storybook built".
- If no build command present: prints "No Storybook build configured; checking for stories..." and reports presence of story files.
*/

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCmd(cmd) {
  try {
    const out = execSync(cmd, { stdio: 'inherit' });
    return out;
  } catch (e) {
    console.error('Command failed:', cmd);
    process.exit(1);
  }
}

const hasPackage = fs.existsSync(path.join(process.cwd(), 'package.json'));
if (hasPackage) {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  if (pkg.scripts && pkg.scripts['build-storybook']) {
    console.log('Running npm run build-storybook...');
    runCmd('npm run build-storybook');
    process.exit(0);
  }
}

// Fallback: check for a storybook/stories folder
const storiesPath = path.join(process.cwd(), 'storybook', 'stories');
if (fs.existsSync(storiesPath)) {
  const files = fs.readdirSync(storiesPath).filter(Boolean);
  console.log(`Found ${files.length} files in storybook/stories (example: ${files.slice(0,3).join(', ')})`);
  process.exit(0);
}

console.warn('No storybook build script or story files detected. If Storybook is not used yet, this check is a no-op.');
process.exit(0);
