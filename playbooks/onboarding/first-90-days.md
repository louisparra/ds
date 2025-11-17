<!--
What this file is:
A practical 90-day rollout playbook for the DS tailored to the roadmap milestones.

Who should edit it:
Design System Lead and People Ops (onboarding). Update based on team capacity.

When to update (example):
Update when milestone dates change or when the organization refines priorities.

Who must approve changes:
Design System Lead and Product Manager.
-->

# First 90 Days — Design System Rollout Playbook (by role)

This playbook connects the roadmap milestones to concrete weekly activities for designers, developers, QA, product and ops for the first 90 days.

---

## Week 0 (Kickoff — aligns to M1)
**Designers**
- Fill `project-config.md` and confirm Figma access.
- Copy Figma starter library and map brand tokens.

**Developers**
- Validate repo access and run `node scripts/bootstrap-template.js --validate` (if Node available).
- Confirm CI access and staging links.

**QA**
- Review pilot scope and prepare accessibility baseline plan.

**Product**
- Finalize pilot area(s) and success metrics.

**Ops**
- Prepare CI runners and package registry access.

---

## Weeks 1–3 (Tokens skeleton & Core components — aligns to M2/M3)
**Designers**
- Populate token values in `tokens/tokens.json` (semantic tokens only).
- Create Button & Input variants in Figma.

**Developers**
- Implement `scripts/build-tokens.js` and generate `packages/tokens/dist/` artifacts.
- Create initial Storybook stories for Button & Input.

**QA**
- Run initial axe checks in Storybook and log issues.

**Product**
- Validate success criteria and accept pilot scope.

**Ops**
- Add CI job for token schema validation.

---

## Weeks 4–8 (Pilot migration & validation — aligns to M4)
**Designers**
- Pair with engineers on migration tickets and update component docs based on implementation notes.

**Developers**
- Migrate pilot flow screens to DS components; open PRs and resolve visual diffs.

**QA**
- Run full regression + accessibility tests on pilot flow.

**Product**
- Monitor usage metrics and collect stakeholder feedback.

**Ops**
- Ensure package publishing pipeline is ready for M5.

---

## Weeks 9–12 (Scale & publish — aligns to M5)
- Publish packages, finalize CI gating, run audit, and prepare for broader rollout.

---

## Notes & tips
- Keep milestones small and measurable. If a milestone grows, split it into smaller ones using `templates/milestone-template.md`.  
- Use this playbook as the baseline; adapt tasks based on team size and priorities.