<!--
What this file is:
A template for measuring the success of the design system. Teams should copy this file, fill in baselines, and use it to report metrics.

Who should edit it:
Design System Lead with Product/Engineering input. Update after baseline collection or after each release if success metrics change.

When to update (example):
Update when baseline data has been collected or when success criteria are re-negotiated.

Who must approve changes:
Product Manager and Design System Lead.
-->

# Measurement Plan — Design System

> Use this template to record baselines, set targets, and collect metrics for DS adoption and quality.

---

## 1) Goals (example)
- Increase token usage in new UI code to **X%** within 3 months.  
- Reduce visual diffs per release to **<= N**.  
- Maintain zero critical accessibility violations in Core 10 components.

---

## 2) Metrics & data sources (recommended)
- **Token usage coverage** — percent of UI files using tokens vs raw values.  
  - Data source: `metrics/token-usage-scan.js` (script to scan codebase).  
  - Unit: percentage.

- **Component usage count** — number of uses of canonical components (`@org/ui` imports or component tags).  
  - Data source: code search or build telemetry.

- **Visual Diff Count** — number of Storybook visual diffs per PR / release.  
  - Data source: Chromatic/Percy report.

- **Accessibility violations** — axe-core automated results + manual checks.  
  - Data source: `tests/a11y/axe-storybook.test.js` output.

- **Time-to-implement** — average dev hours to implement a screen (before vs after DS).  
  - Data source: developer time reports or ticket estimates.

---

## 3) Baseline collection (how to gather initial numbers)
**Manual quick steps (non-dev):**
1. Ask engineering for the most recent visual diff report (Chromatic link).  
2. Ask QA for latest a11y report or run the Storybook a11y job in CI (see `tests/a11y/`).  
3. Product/PM: collect 2–3 recent tickets with implementation time to estimate current dev time.

**Command-line scripts (dev-run):**
- Run token usage scan (example — script added later in `metrics/`):
```bash
# from repo root
node metrics/token-usage-scan.js --path ../path-to-codebase
```

- Run Storybook a11y checks (local):
```bash
# build storybook then run axe script
npm run build-storybook
node scripts/run-axe-storybook.js
```

---

## 4) Targets (fill in with team)

- token_usage_coverage: from **baseline%** → target **X%** in 3 months.
- visual_diff_count: baseline → target **<= N** per release.
- a11y_violations: baseline → target **0 criticals**.

------

## 5) Reporting cadence and owners

- **Weekly:** Automated token usage + visual diff summary emailed to DS channel. (Owner: DS Lead / Eng)
- **Monthly:** Full metrics dashboard + one-page summary for Product. (Owner: Product + DS Lead)
- **Quarterly:** Review adoption and roadmap adjustments (owner: leadership).

------

## 6) Dashboard & storage

- Suggested: store CSV snapshots in `metrics/` and create a simple dashboard (Notion/Sheets).
- Example files to use:
  - `metrics/token-usage-scan.js` (script)
  - `metrics/visual-diff-report.js` (script)

------

## 7) Notes for non-developers

- If you cannot run scripts, ask engineering to run the `token-usage-scan` and paste the results into a new file `metrics/token-usage-baseline.csv`.
- The measurement plan is collaborative — Product and Engineering must help collect reliable baselines.

------

## 8) Next steps (after filling this template)

1. Collect baseline numbers using the scripts above or ask Eng to run them.
2. Agree on specific numeric targets with Product/PM.
3. Add the baseline values under a new section `Baseline (YYYY-MM-DD)`.