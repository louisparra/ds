<!--
What this file is:
Guidance on exporting visual assets (icons, images, sprites) from Figma for web, iOS, and Android.

Who should edit it:
Designers, Design Ops or Build/Infra engineers.

When to update (example):
Update when new platform requirements appear or naming conventions change.

Who must approve changes:
Design System Lead & Engineering Lead.
-->

# Asset export guidance — names, formats, scales

This guide covers common patterns for exporting icons, illustrations and bitmap assets from Figma so engineering receives consistent output.

---

## Naming conventions

- Use _kebab-case_ filenames and include token or component context:
  - `icon-arrow-right.svg`
  - `avatar-default@2x.png`
  - `illustration-hero-mobile.webp`
- For platform-specific versions, suffix with platform:
  - `logo-ios.svg`, `logo-android.svg` (if different)
- For density scales, use `@1x`, `@2x`, `@3x` for raster images.

---

## Icons (vector)

- Prefer **SVG** for icons (scalable, small). Export as single-file SVGs or an icon sprite if needed.
- **Export rules**
  - In Figma, create an icon component or frame sized to the intended viewport (e.g., 24×24).
  - Right-click → Export → select SVG → export.
  - Remove unnecessary metadata (Figma may include `<title>` or editor metadata) — keep clean SVGs.
- **Naming**
  - `icons/<component>/<name>.svg` — e.g., `icons/button/arrow-right.svg`

---

## Bitmaps (PNG/WebP)

- Use PNG for simple bitmaps needing alpha; use WebP for smaller footprints if supported.
- Export at required densities:
  - `component@1x.png` (e.g., 48×48)
  - `component@2x.png` (e.g., 96×96)
  - `component@3x.png`
- **iOS:** provide `@1x`, `@2x`, `@3x` and prefer PNG or WebP as pipeline supports.
- **Android:** provide `mdpi`, `hdpi`, `xhdpi`, `xxhdpi` naming or rely on build tools to generate from a base.

---

## SVG icon sprite (optional)

- If your web app prefers a sprite: generate a single SVG sprite (automation script recommended).
- Keep individual SVGs canonical and script-create the sprite in CI as part of `packages/assets`.

---

## Exporting images from Figma (GUI)

1. Select the frame/component.
2. In the right panel → Export → set format (SVG/PNG/WebP) and scale (`1x`, `2x`, etc.).
3. Click Export and save into `assets/<component>/`.

---

## Automation & CI recommendations

- Store exported assets in `packages/assets/` and follow semantic folders: `icons/`, `images/`, `illustrations/`.
- Add a lightweight CI check that ensures:
  - required densities exist for components that require them,
  - file names follow kebab-case rules,
  - no SVG contains disallowed `width/height` attributes that might break responsive use.

---

## Troubleshooting

- **SVG looks incorrect in app:** open the raw SVG and remove `width`/`height` attributes or `viewBox` issues; ensure `fill="currentColor"` if icons should inherit text color.
- **Raster icons blurry at runtime:** confirm correct density `@2x/@3x` images were exported and used by developers.
