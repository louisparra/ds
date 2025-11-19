/*
What this file is:
A small Node.js helper that interactively creates a filled `project-config.md` (writes file to repo root)
or validates an existing `project-config.md` for obvious missing answers.

Who should edit it:
A developer or power-designer with Node installed. The file is safe to run locally and doesn't call external services.

When to update (example):
Update if you change the questions in `project-config.md` or want additional validation rules.

Who must approve changes:
Design System Lead & Engineering Lead should agree on changes to the bootstrap behavior.
*/

/*
Usage:
1) Interactive init (creates or overwrites project-config.md):
   node scripts/bootstrap-template.js --init

2) Validate existing project-config.md for empty required fields:
   node scripts/bootstrap-template.js --validate

3) Show help:
   node scripts/bootstrap-template.js --help

Expected outputs:
- --init: writes `project-config.md` to repository root and prints "project-config.md created".
- --validate: prints a validation summary (missing fields) and exits with code 0 (no issues) or 1 (issues found).
*/

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CONFIG_PATH = path.join(process.cwd(), 'project-config.md');

function printHelp() {
  console.log('Usage: node scripts/bootstrap-template.js [--init | --validate | --help]');
  console.log('--init      : interactively create project-config.md');
  console.log('--validate  : validate existing project-config.md for placeholders/TBD values');
  console.log('--help      : show this help');
}

function ask(question, rl) {
  return new Promise((resolve) => {
    rl.question(question + ' ', (answer) => resolve(answer.trim()));
  });
}

async function initInteractive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log(
    'Interactive project-config.md creator — answers will be written to project-config.md'
  );
  const answers = {};
  answers.projectName = await ask('Project / Org name (e.g., Acme):', rl);
  answers.repoUrl = await ask('Repository URL (or "private"):', rl);
  answers.designLead = await ask('Design System Lead (handle or name):', rl);
  answers.engLead = await ask('Engineering Lead (handle or name):', rl);
  answers.pm = await ask('Product / PM contact (handle or name):', rl);
  answers.qa = await ask('QA / Accessibility contact (handle or name):', rl);
  answers.primaryPlatforms = await ask('Primary platform(s) (comma-separated, e.g., Web,iOS):', rl);
  answers.webFramework = await ask('If Web: framework (React/Vue/Svelte/None):', rl);
  answers.styling = await ask('Web styling approach (CSS/CSS-in-JS/Tailwind/Other):', rl);
  answers.tokenPipeline = await ask(
    'Token pipeline (Style Dictionary / Figma Tokens / Manual):',
    rl
  );
  answers.componentDistribution = await ask(
    'Component distribution (npm/monorepo/storybook-only):',
    rl
  );
  answers.iconStrategy = await ask('Icon strategy (SVG / sprite / SF Symbols / Other):', rl);
  answers.ci = await ask('CI platform (GitHub Actions / GitLab / CircleCI / Other):', rl);
  answers.visualTool = await ask('Visual regression tool (Chromatic/Percy/None):', rl);
  answers.i18n = await ask('Localization / RTL required? (languages or "none"):', rl);
  answers.releaseCadence = await ask(
    'Release cadence (Weekly / Biweekly / Monthly / On-demand):',
    rl
  );
  answers.deprecationWindow = await ask('Deprecation window (e.g., 3 releases / 30 days):', rl);
  answers.pilotAreas = await ask('Pilot areas (comma-separated):', rl);

  rl.close();

  // Compose markdown content
  const mdLines = [];
  mdLines.push('<!--');
  mdLines.push(
    'Auto-generated project-config.md — run scripts/bootstrap-template.js --init to recreate interactively.'
  );
  mdLines.push('-->');
  mdLines.push('');
  mdLines.push(`# Project Configuration (project-config.md)`);
  mdLines.push('');
  mdLines.push(`**Project / Org name:** ${answers.projectName || 'TBD'}`);
  mdLines.push(`**Repository URL:** ${answers.repoUrl || 'TBD'}`);
  mdLines.push('');
  mdLines.push(`**Primary contacts:**`);
  mdLines.push(`- Design System Lead: ${answers.designLead || 'TBD'}`);
  mdLines.push(`- Engineering Lead: ${answers.engLead || 'TBD'}`);
  mdLines.push(`- Product / PM contact: ${answers.pm || 'TBD'}`);
  mdLines.push(`- QA / Accessibility contact: ${answers.qa || 'TBD'}`);
  mdLines.push('');
  mdLines.push(`**Platforms & stacks:**`);
  mdLines.push(`- Primary platforms: ${answers.primaryPlatforms || 'TBD'}`);
  mdLines.push(`- Web framework: ${answers.webFramework || 'TBD'}`);
  mdLines.push(`- Web styling approach: ${answers.styling || 'TBD'}`);
  mdLines.push('');
  mdLines.push(`**Tokens & pipeline:**`);
  mdLines.push(`- Token pipeline preference: ${answers.tokenPipeline || 'TBD'}`);
  mdLines.push(`- Component distribution: ${answers.componentDistribution || 'TBD'}`);
  mdLines.push('');
  mdLines.push(`**Icons & assets:**`);
  mdLines.push(`- Icon strategy: ${answers.iconStrategy || 'TBD'}`);
  mdLines.push('');
  mdLines.push(`**CI & Visual tests:**`);
  mdLines.push(`- CI platform: ${answers.ci || 'TBD'}`);
  mdLines.push(`- Visual regression tool: ${answers.visualTool || 'TBD'}`);
  mdLines.push('');
  mdLines.push(`**Accessibility & Localization:**`);
  mdLines.push(`- i18n/RTL: ${answers.i18n || 'TBD'}`);
  mdLines.push('');
  mdLines.push(`**Governance & cadence:**`);
  mdLines.push(`- Release cadence: ${answers.releaseCadence || 'TBD'}`);
  mdLines.push(`- Deprecation window: ${answers.deprecationWindow || 'TBD'}`);
  mdLines.push('');
  mdLines.push(`**Pilot areas:** ${answers.pilotAreas || 'TBD'}`);
  mdLines.push('');
  mdLines.push(`**Date populated:** ${new Date().toISOString().slice(0, 10)}`);
  mdLines.push(`**Populated by:** ${answers.designLead || 'TBD'}`);
  mdLines.push('');
  const content = mdLines.join('\n');

  fs.writeFileSync(CONFIG_PATH, content, 'utf8');
  console.log(`project-config.md created at ${CONFIG_PATH}`);
}

function validateConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('project-config.md not found. Run with --init to create it interactively.');
    process.exit(1);
  }
  const content = fs.readFileSync(CONFIG_PATH, 'utf8');
  const placeholders = [
    'TBD',
    'tbd',
    'TBD',
    'Your Org',
    'Your Org / Project name',
    'replace',
    '_________',
  ];
  const missing = [];
  // Very simple heuristic: look for common placeholder markers
  placeholders.forEach((p) => {
    if (content.includes(p)) {
      missing.push(p);
    }
  });

  // Look for empty critical sections by headings
  const requiredHeadings = ['Primary platforms', 'Token pipeline preference', 'CI platform'];
  requiredHeadings.forEach((h) => {
    if (!content.includes(h)) {
      missing.push(`missing heading: ${h}`);
    }
  });

  if (missing.length > 0) {
    console.log('Validation issues found in project-config.md:');
    missing.forEach((m) => console.log(' -', m));
    console.log(
      'Please open project-config.md and replace placeholders with real values, then re-run this script:'
    );
    console.log('  node scripts/bootstrap-template.js --validate');
    process.exit(1);
  } else {
    console.log('project-config.md validation passed. No obvious placeholders found.');
    process.exit(0);
  }
}

// CLI parsing
const arg = process.argv[2];
if (!arg || arg === '--help') {
  printHelp();
  process.exit(0);
}

if (arg === '--init') {
  initInteractive().catch((err) => {
    console.error('Error during interactive init:', err);
    process.exit(1);
  });
} else if (arg === '--validate') {
  validateConfig();
} else {
  printHelp();
  process.exit(0);
}
