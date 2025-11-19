/*
What this file is:
Style Dictionary transform registrations for naming conventions and unit transforms.
Who should edit it:
Token Owner or Build/Infra engineer (Token Owner approves naming changes).
When to update (example):
Update when you change platform naming conventions (e.g., Android resource naming) or add new token types.
Who must approve changes:
Token Owner & Engineering Lead.

Usage:
1) Place this file at repo root as style-dictionary/transforms.js
2) In your style-dictionary.config.js require it before extending the config:
   require('./style-dictionary/transforms');
3) Use the custom transform names in your platform 'transform' arrays:
   transforms: ['attribute/cti', 'ts/name/css', 'ts/size/pxToRem']

Expected outputs (examples):
- color.brand.primary -> web css var: --ds-color-brand-primary
- color.brand.primary -> android name: color_brand_primary
- spacing.scale.4 -> android dimen: spacing_scale_4 (value converted to dp if px)
- type.font.size.md -> ios name: typeFontSizeMd
*/

const StyleDictionary = require('style-dictionary');

// ---- helpers ----
function toLowerSnake(str) {
  // convert dot.path or camelCase to lower_snake_case
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // camelCase to snake
    .replace(/[.\- ]+/g, '_') // dots/dashes/spaces to _
    .replace(/__+/g, '_')
    .toLowerCase();
}

function toCssVarName(path) {
  // path is style-dictionary's token path (e.g., color.brand.primary)
  // result: --ds-color-brand-primary
  // Accept either array or string input
  const p = Array.isArray(path) ? path.join('.') : String(path);
  return `--ds-${p.replace(/\./g, '-').toLowerCase()}`;
}

function toAndroidName(path) {
  // Android resource names must be lowercase and can include underscores.
  // Convention: <category>_<sub>_<token>
  // Example: color.brand.primary -> color_brand_primary
  const p = Array.isArray(path) ? path.join('.') : String(path);
  return toLowerSnake(p);
}

function toIosName(path) {
  // iOS asset / symbol names: use camelCase (common in Swift APIs)
  // Example: color.brand.primary -> colorBrandPrimary
  const p = Array.isArray(path) ? path.join('.') : String(path);
  const parts = p.split('.');
  return parts
    .map((pPart, i) => {
      if (i === 0) return pPart.toLowerCase();
      return pPart.charAt(0).toUpperCase() + pPart.slice(1);
    })
    .join('');
}

// ---- register transforms ----

// 1) Name transforms for CSS variables
StyleDictionary.registerTransform({
  name: 'ts/name/css',
  type: 'name',
  transformer: function (token) {
    const path = Array.isArray(token.path) ? token.path.join('.') : token.name || token.path;
    return toCssVarName(path);
  },
});

// 2) Name transforms for Android (resource name)
StyleDictionary.registerTransform({
  name: 'ts/name/android',
  type: 'name',
  transformer: function (token) {
    const path = Array.isArray(token.path) ? token.path.join('.') : token.name || token.path;
    return toAndroidName(path);
  },
});

// 3) Name transform for iOS (camelCase)
StyleDictionary.registerTransform({
  name: 'ts/name/ios',
  type: 'name',
  transformer: function (token) {
    const path = Array.isArray(token.path) ? token.path.join('.') : token.name || token.path;
    return toIosName(path);
  },
});

// 4) Transform px to rem for web (optional)
StyleDictionary.registerTransform({
  name: 'ts/size/pxToRem',
  type: 'value',
  matcher: function (token) {
    // apply to font-size, spacing, dimension-like tokens with px values
    return (
      token.type &&
      (token.type.indexOf('font-size') !== -1 ||
        token.type.indexOf('spacing') !== -1 ||
        token.type.indexOf('dimension') !== -1) &&
      typeof token.value === 'string' &&
      token.value.trim().endsWith('px')
    );
  },
  transformer: function (token) {
    const px = parseFloat(token.value.replace('px', '').trim());
    // default root = 16px -> 1rem
    const rem = px / 16;
    // keep 4 decimal places
    return `${parseFloat(rem.toFixed(4))}rem`;
  },
});

// 5) Transform px to dp for Android (map px -> dp, keep ints)
StyleDictionary.registerTransform({
  name: 'ts/size/pxToDp',
  type: 'value',
  matcher: function (token) {
    return (
      token.type &&
      (token.type.indexOf('spacing') !== -1 || token.type.indexOf('dimension') !== -1) &&
      typeof token.value === 'string' &&
      token.value.trim().endsWith('px')
    );
  },
  transformer: function (token) {
    const px = parseFloat(token.value.replace('px', '').trim());
    // Android uses dp; most design systems map 1px==1dp for simplicity on baseline scale
    const dp = Math.round(px);
    return `${dp}dp`;
  },
});

// 6) Color format transform (ensure colors are hex for platforms that expect it)
StyleDictionary.registerTransform({
  name: 'ts/color/hex',
  type: 'value',
  matcher: function (token) {
    return token.type && token.type === 'color' && typeof token.value === 'string';
  },
  transformer: function (token) {
    // naive normalization: return value as-is for now.
    // If you need conversions (rgba -> hex), implement parsing here.
    return token.value;
  },
});

// 7) Compose transform groups to make it convenient to reference in config
StyleDictionary.registerTransformGroup({
  name: 'ts/web',
  transforms: ['attribute/cti', 'ts/name/css', 'ts/color/hex', 'ts/size/pxToRem'],
});

StyleDictionary.registerTransformGroup({
  name: 'ts/android',
  transforms: ['attribute/cti', 'ts/name/android', 'ts/color/hex', 'ts/size/pxToDp'],
});

StyleDictionary.registerTransformGroup({
  name: 'ts/ios',
  transforms: ['attribute/cti', 'ts/name/ios', 'ts/color/hex'],
});

// Export helper functions if other scripts need them (optional)
module.exports = {
  toCssVarName,
  toAndroidName,
  toIosName,
};
