const fs = require('node:fs'), vm = require('node:vm');
const { test } = require('node:test'), assert = require('node:assert/strict');
const context = vm.createContext({ formatKonsinyasiDateTime_: String });
vm.runInContext(fs.readFileSync('apps-script/order-read-functions.txt', 'utf8'), context);
test('currency strings retain net sales instead of becoming zero', () => {
  for (const value of [72800, '72800', '72.800', 'Rp 72.800', 'Rp72.800,00', '72,800.00', '72800.00']) assert.equal(context.vartanaReadMoney_(value), 72800);
  assert.equal(context.vartanaReadMoney_(0), 0);
  for (const value of ['', null, true, '-100', '1959015918922379500']) assert.equal(context.vartanaReadMoney_(value), null);
});
test('reordered columns read money by header without changing sheet', () => {
  const rows = [['No. Resi J&T', 'Net Sales', 'Order Serial', 'Grand Total', 'Shipping Subsidy', 'Customer Shipping Fee', 'Original Shipping'], ['1959015918922379500', 'Rp72.800', 'TEST', '77.800', 7000, 5000, 12000]];
  const before = JSON.stringify(rows);
  const orders = context.vartanaReadOrders_({ getLastRow: () => rows.length, getDataRange: () => ({ getValues: () => rows }) });
  assert.equal(orders[0].subtotalProducts, 72800);
  assert.equal(orders[0].grandTotal, 77800);
  assert.equal(orders[0].originalShipping, 12000);
  assert.equal(orders[0].resiJNT, '1959015918922379500');
  assert.equal(JSON.stringify(rows), before);
});
test('missing values stay unknown and zero subsidy is preserved', () => {
  const rows = [['Order Serial', 'Subtotal Products', 'Shipping Subsidy'], ['TEST', '', 0]];
  const [order] = context.vartanaReadOrders_({ getLastRow: () => 2, getDataRange: () => ({ getValues: () => rows }) });
  assert.equal(order.subtotalProducts, null);
  assert.equal(order.shippingSubsidy, 0);
  assert.equal(order.originalShipping, null);
});
