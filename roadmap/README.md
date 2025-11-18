<!--
What this file is:
Documentation for the roadmap folder: explains files, conventions and how to edit milestones safely.

Who should edit it:
Design System Lead or Docs Owner when conventions change.

When to update (example):
Update if the milestone YAML schema changes or new automation uses it.

Who must approve changes:
Design System Lead and Docs Owner.
-->

# Roadmap folder — README

This folder contains the machine-readable and human templates for roadmap milestones.

**Files**

- [milestones.yaml](milestones.yaml) — canonical list of milestones (keys: id, name, phase, start_date, end_date, owners, deliverables, success_criteria, status). Edit via PR.
- README.md — this file (how to use the folder).
- [ROADMAP.md](../ROADMAP.md) — human-readable single-page roadmap that summarizes milestones.

**Editing rules**

- Edit [milestones.yaml](milestones.yaml) for structured updates (dates, owners, status).  
- Use [milestone template](../templates/milestone-template.md) to draft a detailed milestone description before committing.  
- Always change via branch + PR; request approvals from owners listed in the milestone.

**Consumption**
- This YAML is safe to read by scripts and dashboards to build status boards. Keep fields consistent.