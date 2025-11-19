/*
What this file is:
Template commitlint config (conventional commits). Use as canonical config for commit message rules.

Who should edit it:
Maintainers or Release Manager. Update when commit conventions change.

When to update (example):
If your organization adopts a custom scope or prefix list.

Who must approve changes:
Release Manager and Eng Lead.
*/

module.exports = {
  extends: ['@commitlint/config-conventional'],
};
