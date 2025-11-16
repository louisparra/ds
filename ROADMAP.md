<!--
What this file is:
A practical roadmap for rolling out the design system in this org. It sets milestones, releases, and the "Core 10" components.

Who should edit it:
Design System Lead and Product Manager. Update when timelines or priorities change.

When to update (example):
Update after planning or sprint review when milestones slip or new priorities are set.

Who must approve changes:
Design System Lead and Product Manager.
-->

# Roadmap & Milestones — Design System

## Overview
This roadmap divides the design system rollout into phases: **Discover → Baseline → Pilot → Scale → Operate**. Each phase has concrete deliverables (files, artifacts, and activities).

---

## Core 10 (minimum viable scope)
These components and token families are the initial, high-impact deliverables to build first:

- Tokens: color, type, space, radius, motion, zIndex
- Components:
  1. Button
  2. Input
  3. Card
  4. Modal
  5. Tooltip
  6. Icon
  7. Grid
  8. Nav
  9. Toast
  10. Avatar

---

## Phased milestones (example timeline — adjust per project)

### Phase A — Discover & Bootstrap (Week 0–1)
- Deliverables:
  - `README-PROJECT.md` (this file)
  - `project-config.md`
  - `OWNERS.md`
- Goal: capture constraints and assign owners.

### Phase B — Tokens & First Components (Week 1–3)
- Deliverables:
  - `tokens/tokens.json` (semantic tokens skeleton)
  - `components/Button/docs.md` + Storybook story
  - `packages/tokens/dist/tokens.css` (generated)
- Goal: ship Core tokens + Button; enable devs to import tokens.

### Phase C — Pilot Migration (Week 3–6)
- Deliverables:
  - Pilot migration tickets (see `migration/`)
  - Visual regression baseline (Chromatic)
  - Measurement baseline (run measurement plan)
- Goal: migrate 1 product flow to DS components.

### Phase D — Scale & Stabilize (Week 6–12)
- Deliverables:
  - Add remaining Core components
  - CI gates (token validation, visual regression)
  - Publish packages to registry (private/public)
- Goal: DS usable across multiple teams with CI protections.

### Phase E — Operate & Improve (Ongoing)
- Deliverables:
  - Roadmap updates, quarterly audits, metrics reports
  - Migration plans for deprecated tokens
- Goal: ensure long-term health and adoption.

---

## Release cadence & versioning
- **Tokens & core package release cadence:** Every 2–4 weeks (minor/patch), major only for breaking changes.  
- **Visual baseline releases:** Every release triggers Chromatic; token-only changes should be batched and announced.

---

## Milestone owners (examples)
- Phase A: Design System Lead (R), Product (A), Eng Lead (C)  
- Phase B: Token Owner (R), Eng Lead (A), QA (C)  
*(Update `OWNERS.md` with specific names and handles.)*

---

## Risk & mitigation (short)
- **Risk:** Token churn causes instability. → *Mitigation:* Strict deprecation policy, staging, and migration mapping files (`tokens/migrations/*`).  
- **Risk:** Low adoption. → *Mitigation:* Office hours, starter examples, and onboarding playbooks (see `playbooks/`).

---

## How to use this roadmap
- A designer: follow Phase A tasks in the first week (see `playbooks/onboarding/first-30-mins.md`).  
- Product: use the milestones to prioritize migration tickets.  
- Engineers: use the release cadence to plan integration sprints.

---

## Change log
- _YYYY-MM-DD_ — Roadmap created for initial bootstrapping.