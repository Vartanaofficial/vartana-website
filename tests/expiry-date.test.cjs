const {test}=require('node:test'),assert=require('node:assert/strict'),load=require('./load-ts.cjs');
const {expiryFromReceipt}=load('lib/expiry-date.ts');
test('expiry shortcuts use receipt date and roll across years',()=>{assert.equal(expiryFromReceipt('2026-11-01',3),'2027-02-01');assert.equal(expiryFromReceipt('2026-11-01',6),'2027-05-01');assert.equal(expiryFromReceipt('2026-11-01',12),'2027-11-01');});
test('month-only receipts explicitly use first day and month ends clamp',()=>{assert.equal(expiryFromReceipt('2026-11',3),'2027-02-01');assert.equal(expiryFromReceipt('2026-08-31',6),'2027-02-28');assert.equal(expiryFromReceipt('2024-02-29',12),'2025-02-28');assert.equal(expiryFromReceipt('2023-11-30',3),'2024-02-29');});
test('empty, invalid dates and unsupported shortcuts produce no expiry',()=>{for(const value of ['','2026-13','2026-02-30','2026-00','abc'])assert.equal(expiryFromReceipt(value,3),'');assert.equal(expiryFromReceipt('2026-11',2),'');});
