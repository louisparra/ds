/*
What this file is:
Style Dictionary configuration for the repo. Defines platforms and output formats (web CSS vars, flattened JSON, Android XML, iOS assets).

Who should edit it:
Token Owner or Build/Infra engineer. Small changes require Token Owner review.

When to update (example):
Update when token structure or platform naming conventions change.

Who must approve changes:
Token Owner and Engineering Lead.
*/

module.exports = {
  // Source: canonical token file authored by designers / token owners
  source: ['tokens/tokens.json'],

  // Transform groups and platforms
  platforms: {
    // Web: CSS custom properties + flat JSON for JS consumption
    web: {
      transformGroup: 'css',
      buildPath: 'packages/tokens/dist/web/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables', // outputs :root { --token-name: value; }
          options: {
            outputReferences: true
          }
        },
        {
          destination: 'tokens.json',
          format: 'json/flat' // flattened dot.path -> value
        }
      ]
    },

    // Android: colors.xml and dimens.xml (basic)
    android: {
      transformGroup: 'android',
      buildPath: 'packages/tokens/dist/android/',
      files: [
        {
          destination: 'colors.xml',
          format: 'android/colors'
        },
        {
          destination: 'dimens.xml',
          format: 'android/dimens'
        }
      ]
    },

    // iOS: color assets / plist
    ios: {
      transformGroup: 'ios',
      buildPath: 'packages/tokens/dist/ios/',
      files: [
        {
          destination: 'Colors.plist',
          format: 'ios/colors' // note: consumers may want xcassets; this produces Apple-friendly formats
        }
      ]
    }
  }
};
