/*
What this file is:
Registers custom Style Dictionary formats for iOS (Colors.plist) and a simple JSON asset fallback.
Who should edit it:
Token Owner or Build/Infra engineer. Update when iOS output structure needs to change.
When to update (example):
Change when consumers expect xcassets or a different plist structure.
Who must approve changes:
Token Owner & Engineering Lead.

Usage:
Require this file before Style Dictionary uses the config:
  require('./style-dictionary/transforms');
  require('./style-dictionary/formats');

Expected output (example file):
- packages/tokens/dist/ios/Colors.plist
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist ...>
  <plist version="1.0"><dict><key>colorBrandPrimary</key><string>#0a84ff</string>...</dict></plist>
*/

const StyleDictionary = require('style-dictionary');

function escapeXML(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Create an Apple-style plist string with keys mapping to token values.
 * Only tokens of type "color" are included by default (but this can be changed).
 */
StyleDictionary.registerFormat({
  name: 'ios/colors',
  formatter: function ({ dictionary /*, options */ }) {
    // Collect properties; dictionary.allProperties already uses transforms/groups so .name is transformed
    const props = dictionary.allProperties.filter(
      (p) => (p.attributes && p.attributes.category === 'color') || p.type === 'color'
    );

    // Build plist entries: key -> string(value)
    const entries = props
      .map((p) => {
        const key = escapeXML(p.name);
        const value = escapeXML(p.value);
        return `  <key>${key}</key>\n  <string>${value}</string>`;
      })
      .join('\n');

    const plist =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n` +
      `<plist version="1.0">\n<dict>\n${entries}\n</dict>\n</plist>\n`;

    return plist;
  },
});

// Optional: provide a generic ios/plist-json format for non-color tokens
StyleDictionary.registerFormat({
  name: 'ios/plist-json',
  formatter: function ({ dictionary }) {
    const obj = {};
    dictionary.allProperties.forEach((p) => {
      obj[p.name] = p.value;
    });
    return JSON.stringify(obj, null, 2);
  },
});

// Export nothing — registration happens on require
module.exports = {};
