<!--
What this file is:
Contributor guide explaining how to open issues, create branches, and submit PRs.

Who should edit it:
Docs Owner or Design System Lead.

When to update (example):
Update when the branch policy changes or CI steps are added/changed.

Who must approve changes:
Design System Lead and Engineering Lead.
-->

# Contributing to the Design System Template

Thanks for contributing! This document explains the simplest, safest way to contribute.

## 1. Create a branch

Follow the [branching](BRANCHING.md) policy. Example:

```bash
git checkout -b ds/your-feature-short
```

Branch name conventions:

- `ds/<phase>-<short>` for template-level work (e.g., `ds/top-level-scaffold`)
- `feature/<scope>/<short>` for features
- `chore/<scope>/<short>` for infra work

## 2. Make your changes

- Keep changes focused to one purpose per branch.
- Update or add tests/docs where relevant.
- For content edits, prefer human-readable markdown changes.

## 3. Commit & push

Use clear commit messages:

```scss
chore(docs): add CONTRIBUTING.md;
```

## 4. Open a Pull Request

- Target branch: `ds/main`
- Include a short description, checklist, and request the appropriate reviewers (CODEOWNERS will help).

## 5. Reviewer checklist

- Does this change affect tokens, components, CI, or governance? If yes, include owner approvals per [PR Approval Matrix](governance/pr-approval-matrix.md).
- Ensure no secrets or PII are added.

## 6. After merge

- Delete the branch.
- If the change affects roadmap or owners, announce in `#design-system` channel.
