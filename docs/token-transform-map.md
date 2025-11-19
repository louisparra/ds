<!--
What this file is:
Human-friendly mapping table and rationale for token naming conventions across platforms.

Who should edit it:
Token Owner or Design System Lead.

When to update (example):
Update when transform naming conventions change or when new token categories are added.

Who must approve changes:
Token Owner & Eng Lead.
-->

# Token transform map — naming conventions

This document explains how semantic tokens (dot.path) are mapped to platform-specific names by the Style Dictionary transforms in `style-dictionary/transforms.js`.

## Principles

- Keep the canonical token keys as lowercase dot.paths (e.g., `color.brand.primary`).
- Web uses CSS custom properties prefixed with `--ds-`.
- Android uses lowercase underscore-separated resource names (compatible with `res/values/*.xml`).
- iOS uses camelCase asset / key names (convenient for Swift `UIColor(named:)` and Foundation keys).
- Units: web prefers `rem` for scalable sizes; Android uses `dp` for dimens. You can tweak px->rem and px->dp logic in the transform module.

## Mapping table — examples

| Semantic token key        | Web (CSS var)                                     | Android (resource name)    | iOS (asset/variable name)         |
| ------------------------- | ------------------------------------------------- | -------------------------- | --------------------------------- |
| `color.brand.primary`     | `--ds-color-brand-primary`                        | `color_brand_primary`      | `colorBrandPrimary`               |
| `color.ui.text.primary`   | `--ds-color-ui-text-primary`                      | `color_ui_text_primary`    | `colorUiTextPrimary`              |
| `spacing.scale.4`         | `--ds-spacing-scale-4` (value: `1rem` if px->rem) | `spacing_scale_4` (16dp)   | `spacingScale4` (value preserved) |
| `type.font.size.md`       | `--ds-type-font-size-md` (value: `1rem`)          | `type_font_size_md` (16dp) | `typeFontSizeMd`                  |
| `motion.duration.default` | `--ds-motion-duration-default`                    | `motion_duration_default`  | `motionDurationDefault`           |

## Behavior and rationale

- **Prefixes**: CSS variables use `--ds-` to reduce collisions with consumer apps. Android resource names are kept without extra `res_` prefix — but you can add one if you prefer `ds_` names.
- **Unit transforms**:
  - `px -> rem` for web: consistent scalable typography/spacing (root=16px).
  - `px -> dp` for Android: simplest mapping is 1px -> 1dp; adjust if your design tokens represent a different baseline.
  - iOS: keep the raw value (or produce platform-specific plist entries) — you can post-process in the iOS consumer if needed.
- **Color formats**: By default we pass color strings through unchanged. If you accept RGBA or named colors in tokens, implement a convertor (e.g., rgba -> hex) in `ts/color/hex`.

## How to change behavior

- Edit `style-dictionary/transforms.js` to:
  - change naming helpers: `toCssVarName`, `toAndroidName`, `toIosName`
  - change unit transforms: `ts/size/pxToRem`, `ts/size/pxToDp`
  - add additional transforms for typography composition or tokens with aliasing

## Notes

- These conventions are intentionally minimal and broadly compatible. If your org has Android resource naming rules or Swift asset naming standards, update the helper functions and register the updated transforms.
