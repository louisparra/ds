<!--
What this file is:
Plugin-specific export instructions (Figma Tokens, Token Studio, Figmagic) and how to turn plugin output into canonical JSON using adapters.

Who should edit it:
Tooling Engineers, Token Owner, or Design System Lead.

When to update (example):
Update when supported plugin export shapes or adapter commands change.

Who must approve changes:
Token Owner & Engineering Lead.
-->

# Plugin-specific export recipes

This file provides exact steps and expected outputs for common plugins. Use the recipe that matches the plugin your team uses.

---

## 1) Figma Tokens (recommended for teams)

**Export steps (designer, GUI):**

1. Install _Figma Tokens_ plugin.
2. Open `00 — Tokens (source)` page.
3. In plugin: `Export` → choose `JSON` → save as `figma/figma-tokens-export.json` (save to local and add to branch if helpful).

**Adapter command:**

```bash
node scripts/adapters/figma-tokens-to-canonical.js \
  --input figma/figma-tokens-export.json \
  --output figma/canonical-export.json
```

**Expected canonical output (short):**

- File `figma/canonical-export.json` with:
  - `schemaVersion: "1.0"`
  - `exportedAt: <ISO timestamp>`
  - `source.plugin: "figma-tokens-adapter"`
  - `tokens: [ { name, dotPath, type, value, description?, meta? } ]`

**Notes:**

- Adapter will generate `dotPath` from slash or name. If ambiguous, update `figma/FIGMA_STYLE_MAP.json`.

---

## 2) Token Studio (Figma native tokens)

**Export steps (designer, GUI):**

1. Open Figma `Main` menu → `Plugins` → `Token Studio` (or token management).
2. Export tokens to JSON (save as `figma/token-studio-export.json`).

**Adapter command:**

```bash
node scripts/adapters/token-studio-to-canonical.js \
  --input figma/token-studio-export.json \
  --output figma/canonical-token-studio.json
```

**Expected output:**

- `figma/canonical-token-studio.json` as canonical schema.

**Notes:**

- Token Studio often has nested categories. Adapter flattens nested categories into slash names and produces `dotPath`.

---

## 3) Figmagic (or other flattened exporters)

**Export steps (designer or developer):**

- Figmagic and some other tools produce flattened `properties` JSON. Save as `figma/figmagic-export.json`.

**Adapter command:**

```bash
node scripts/adapters/figmagic-to-canonical.js \
  --input figma/figmagic-export.json \
  --output figma/canonical-figmagic.json
```

**Notes:**

- Figmagic exports often include keys like `color.brand.primary`. Adapter will normalize these into `dotPath` and `name`.

---

## 4) If you already have canonical JSON (you authored it)

If you already produce canonical JSON in your tooling, skip adapters and run:

```bash
node scripts/figma-sync.js --input path/to/canonical.json --map figma/FIGMA_STYLE_MAP.json --dry
```

---

## 5) Example CI snippet (what CI runs for PRs)

- CI will:
  1. run `npm ci`
  2. run adapter tests (`node scripts/tests/figma-adapter-tests.js`)
  3. run the adapter on the submitted export (if present) and `node scripts/figma-sync.js --dry`
  4. post a PR comment with the dry-run report.

**Expected CI status:** success or failure with diff in the PR comment — if failure, fix mapping or adapter and re-run.

---

## 6) Adapter troubleshooting checklist

- If adapter output missing tokens:
  - Open plugin export and check if token values are present under `value`.
  - Confirm adapter logged warnings; check `meta.raw` in canonical JSON to inspect the original plugin entry.
- If token keys collision:
  - Add explicit mapping to `figma/FIGMA_STYLE_MAP.json`.
- If gradients, shadows or modes are malformed:
  - Use fixtures in `figma/fixtures/` to reproduce and update adapter logic.
