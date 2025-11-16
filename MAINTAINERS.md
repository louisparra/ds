<!--
What this file is:
Defines maintainers, commit rights, release responsibilities and the process to request maintainer access.

Who should edit it:
Design System Lead & Engineering Lead. Update when maintainers or on-call shifts change.

When to update (example):
Update when a new person is added to the maintainer roster or on-call rotation changes.

Who must approve changes:
Design System Lead and Engineering Lead must approve any changes.
-->

# MAINTAINERS — Committers & Release Responsibilities

## Purpose
This file lists the individuals or teams who are authorized to merge PRs, publish packages, and perform release operations for the design system repository.

## Maintainers (example placeholders)
- **Release Manager:** `@release-manager` — publishes packages and runs release checks.  
- **Core Maintainers:** `@eng-lead`, `@token-owner`, `@docs-owner` — can merge PRs after required approvals.  
- **Infra Maintainers:** `@infra-team` — manage CI, secrets, and deployment scripts.

---

## How to request maintainer access
1. Open a PR to add the person to `MAINTAINERS.md` with justification (role, team).  
2. Provide a sponsor: a current maintainer must approve.  
3. Security & Legal sign-off if the person will have access to sensitive deploy credentials.

---

## Maintainer responsibilities
- Ensure PRs follow code & docs standards.  
- Monitor CI and fix failures in the `ds/main` branch.  
- Coordinate releases with Release Manager and Design System Lead.  
- Maintain the security posture (rotate credentials, follow infra guidelines).

---

## On-call / rotation notes (example)
- Week 1: `@engineer1` (maintainer)  
- Week 2: `@engineer2`  
*(Replace with real schedule and optionally link to calendar)*