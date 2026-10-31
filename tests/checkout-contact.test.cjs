const fs = require('node:fs'), ts = require('typescript');
const assert = require('node:assert/strict'), {test} = require('node:test');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText, filename);
const {normalizeWhatsApp} = require('../lib/checkout-contact.ts');
test('WhatsApp accepts Indonesian mobile formats and rejects missing or invalid contacts', () => {
  for (const value of ['081234567890', '+62 812-3456-7890', '6281234567890']) assert.equal(normalizeWhatsApp(value), '6281234567890');
  for (const value of ['', '        ', null, '--------', '+()()()()', '1234567890', '0812', '081234567890123456', '08123456abc']) assert.equal(normalizeWhatsApp(value), null);
});
