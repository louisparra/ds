<!--
What this file is:
Canonical roadmap & milestones for the design system instance. Use this file as the single-page human view.

Who should edit it:
Design System Lead (primary) with input from Product and Engineering. Small updates may be done by Docs Owner with review.

When to update (example):
Update after the kickoff, after baseline collection, or whenever milestone dates/owners change.

Who must approve changes:
Design System Lead and Product Manager must approve roadmap changes via PR.
-->

# Roadmap & Milestones — Design System

**Status:** Draft / Proposed — update the [milestones.yaml](roadmap/milestones.yaml) file for structured changes.

This document maps the rollout across five phases with measurable milestones. Use [milestones.yaml](roadmap/milestones.yaml) for CI-friendly consumption (dashboards, automations) and [milestone-template.md](templates/milestone-template.md) to author new milestones.

---

## Core 10 (initial scope)

- Tokens: color, type, spacing, radius, motion, zIndex
- Components: Button, Input, Card, Modal, Tooltip, Icon, Grid, Nav, Toast, Avatar

---

## High-level phases

A. Discover & Bootstrap  
B. Tokens & First Components (Core 10 baseline)  
C. Pilot Migration (1 flow)  
D. Scale & Stabilize (wider adoption)  
E. Operate & Improve (ongoing)

---

## Milestones table (authoritative — mirror in [milestones.yaml](roadmap/milestones.yaml))

|  ID | Milestone                                 | Phase |      Start |        End | Owners                          | Primary deliverable                                                           | Success criteria                                        |
| --: | ----------------------------------------- | ----- | ---------: | ---------: | ------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------- |
|  M1 | Project bootstrap (config & owners)       | A     | YYYY-MM-DD | YYYY-MM-DD | Design Lead, Eng Lead           | [project-config.md](project-config.md), [OWNERS.md](OWNERS.md)                | Project-config complete + owners assigned               |
|  M2 | Tokens skeleton + build pipeline          | B     | YYYY-MM-DD | YYYY-MM-DD | Token Owner, Eng Lead           | [tokens.json](tokens/tokens.json), [build-tokens.js](scripts/build-tokens.js) | Token schema validated + dist artifacts built           |
|  M3 | Button + Input canonical docs & Storybook | B     | YYYY-MM-DD | YYYY-MM-DD | Component Owners (Button/Input) | [components/\*](components/), Storybook stories                               | Storybook published; accessibility checks pass          |
|  M4 | Pilot migration (one flow)                | C     | YYYY-MM-DD | YYYY-MM-DD | Design Lead, Eng Lead, PM       | Migration tickets + migrated flow                                             | Pilot flow uses DS components; token usage >= target    |
|  M5 | Publish packages & CI gating              | D     | YYYY-MM-DD | YYYY-MM-DD | Release Manager, Infra          | [packages/\*](packages/), CI workflows                                        | Packages published; CI enforces token/schema checks     |
|  M6 | Adoption > X% & Quarterly audit           | E     | YYYY-MM-DD | YYYY-MM-DD | DS Lead, QA                     | Metrics report                                                                | Targets met (token usage, a11y, visual diff thresholds) |

> Replace `YYYY-MM-DD` and `X%` with your organization’s dates and targets in [milestones.yaml](roadmap/milestones.yaml).

---

## Gating rules (how to progress phases)

- **Gate 1 (A→B):** [project-config.md](project-config.md) complete, owners assigned, and kickoff meeting held.
- **Gate 2 (B→C):** Tokens built and Button + Input live in Storybook; CI token validation present.
- **Gate 3 (C→D):** Pilot migration completed and measurement baseline collected.
- **Gate 4 (D→E):** Packages published and adoption > target, or executive approval for continued rollout.

---

## Timeline guidance & buffer

- Use conservative buffers: each milestone should include an estimate and a 20–40% buffer for integration friction.
- Treat dates in [milestones.yaml](roadmap/milestones.yaml) as living; update via PR when changed.

---

## How teams consume this roadmap

- Designers: follow the milestone list to schedule component authoring and Figma updates.
- Engineers: read milestone deliverables to schedule integration sprints.
- QA: plan test coverage for pilot flows at M4.
- Product: use success criteria to accept milestone outcomes.

---

## Change log

- _YYYY-MM-DD_ — Expanded roadmap and added milestones YAML and 90-day playbook.
