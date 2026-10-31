const fs = require('node:fs'), ts = require('typescript');
const assert = require('node:assert/strict'), { test } = require('node:test');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const { recoverLegacyOrder, analyzeOrderItems } = require('../lib/admin-order-analysis.ts');
const products = [{ sku: 'SIG', productName: 'Signature Blend', variantName: '10 Tea Bags (Signature Edition)', sellingPrice: 97000, discountType: 'nominal', discountValue: 24200, hpp: 26400 }, { sku: 'MIX', productName: 'Mix Edition', variantName: '10 Tea Bags (Mixed Blend)', sellingPrice: 100000, hpp: 30000 }];
test('legacy shifted columns recover stored transfer and net without using current prices', () => {
  const order = recoverLegacyOrder({ sku: 'Signature Blend [10 Tea Bags (Signature Edition)] (12x)', itemsSummary: '873600', grandTotal: 0, subtotalProducts: 0, customerShippingFee: 0, originalShipping: 1959015918922379500 });
  assert.equal(order.grandTotal, 873600);
  assert.equal(order.subtotalProducts, 873600);
  assert.equal(order.originalShipping, null);
  const analysis = analyzeOrderItems(order, products);
  assert.equal(analysis.units, 12);
  assert.equal(analysis.cogs, 316800);
  assert.equal(analysis.regular, 1164000);
  assert.equal(analysis.net, 873600);
});
test('multi-item summaries count each SKU and use real master HPP', () => {
  const result = analyzeOrderItems({ itemsSummary: 'Signature Blend [10 Tea Bags (Signature Edition)] (2x) | Mix Edition [10 Tea Bags (Mixed Blend)] (3x)', subtotalProducts: 400000 }, products);
  assert.equal(result.units, 5);
  assert.equal(result.cogs, 142800);
  assert.equal(result.net, 400000);
});
test('missing HPP and ambiguous product names stay unknown', () => {
  assert.equal(analyzeOrderItems({ sku: 'SIG', subtotalProducts: 72800 }, [{ ...products[0], hpp: 0 }]).cogs, null);
  assert.equal(analyzeOrderItems({ itemsSummary: 'Unknown blend (1x)' }, products).net, null);
});
test('modern rows including legitimate zero subtotal stay unchanged', () => {
  const order = { sku: 'SIG', itemsSummary: 'Signature Blend (1x)', grandTotal: 5000, subtotalProducts: 0 };
  assert.deepEqual(recoverLegacyOrder(order), order);
  assert.equal(analyzeOrderItems(order, products).net, 0);
});
