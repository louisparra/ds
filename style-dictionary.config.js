/*
What this file is:
Style Dictionary configuration for the repo. Defines platforms and output formats (web CSS vars, flattened JSON, Android XML, iOS assets).
This updated config loads custom transforms (style-dictionary/transforms.js) so platform outputs follow our naming & unit rules.

Who should edit it:
Token Owner or Build/Infra engineer. Small changes require Token Owner review.

When to update (example):
Update when token structure, platform naming conventions, or transform groups change.

Who must approve changes:
Token Owner and Engineering Lead.

Usage:
# from repo root
npm ci
npm run build-tokens:sd

Expected outputs:
- packages/tokens/dist/web/tokens.css
- packages/tokens/dist/web/tokens.json
- packages/tokens/dist/android/colors.xml
- packages/tokens/dist/android/dimens.xml
- packages/tokens/dist/ios/Colors.plist
*/

// ensure custom transforms are registered before Style Dictionary uses this config
require('./style-dictionary/transforms');
require('./style-dictionary/formats');

module.exports = {
  // Source: canonical token file authored by designers / token owners
  source: ['tokens/tokens.json'],

  // Transform groups and platforms — use our custom transform groups (ts/*)
  platforms: {
    // Web: CSS custom properties + flat JSON for JS consumption
    web: {
      transformGroup: 'ts/web',
      buildPath: 'packages/tokens/dist/web/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables', // outputs :root { --token-name: value; }
          options: {
            outputReferences: true,
          },
        },
        {
          destination: 'tokens.json',
          format: 'json/flat', // flattened dot.path -> value
        },
      ],
    },

    // Android: colors.xml and dimens.xml (use ts/android transforms)
    android: {
      transformGroup: 'ts/android',
      buildPath: 'packages/tokens/dist/android/',
      files: [
        {
          destination: 'colors.xml',
          format: 'android/colors',
        },
        {
          destination: 'dimens.xml',
          format: 'android/dimens',
        },
      ],
    },

    // iOS: color assets / plist (use ts/ios transforms)
    ios: {
      transformGroup: 'ts/ios',
      buildPath: 'packages/tokens/dist/ios/',
      files: [
        {
          destination: 'Colors.plist',
          format: 'ios/colors', // note: consumers may want xcassets; this produces Apple-friendly formats
        },
      ],
    },
  },
};
