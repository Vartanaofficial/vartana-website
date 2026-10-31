const fs = require('node:fs');
const ts = require('typescript');
const { test } = require('node:test');
const assert = require('node:assert/strict');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
const { orderFinancialIssues } = require('../lib/order-financials.ts');
const valid = { grandTotal: 77800, subtotalProducts: 72800, originalShipping: 12000, customerShippingFee: 5000, shippingSubsidy: 7000 };
test('consistent order and free shipping are valid', () => {
  assert.deepEqual(orderFinancialIssues(valid), []);
  assert.deepEqual(orderFinancialIssues({ ...valid, grandTotal: 72800, originalShipping: 7000, customerShippingFee: 0 }), []);
});
test('corrupt legacy revenue and unsafe shipping cannot enter totals', () => {
  const issues = orderFinancialIssues({ ...valid, grandTotal: 0, subtotalProducts: 0, originalShipping: 1959015918922379500 });
  assert.ok(issues.includes('emptyRevenue'));
  assert.ok(issues.includes('originalShipping'));
});
test('missing, negative and inconsistent amounts are reported', () => {
  assert.ok(orderFinancialIssues({ ...valid, subtotalProducts: undefined }).includes('subtotalProducts'));
  assert.ok(orderFinancialIssues({ ...valid, grandTotal: -1 }).includes('grandTotal'));
  assert.ok(orderFinancialIssues({ ...valid, grandTotal: 100 }).includes('totalMismatch'));
});
