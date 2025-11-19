/*
What this file is:
Commitlint configuration to enforce conventional commit messages.

Who should edit it:
Maintainers or Release Manager. Update when commit convention changes.

Example when to update:
Change if you adopt a different commit convention.

Who must approve changes:
Release Manager and Eng Lead.
*/

module.exports = {
  extends: ['@commitlint/config-conventional'],
};
