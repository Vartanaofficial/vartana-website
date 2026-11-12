const {test}=require('node:test');
const assert=require('node:assert/strict');
const {selectCheckoutVoucher:select}=require('./load-ts.cjs')('lib/voucher-selection.ts');

test('selecting a voucher enters its code and repeated taps do not duplicate it',()=>{
  const result=select(' welcome ','FIRST',[],[]);
  assert.equal(result.codes,'FIRST,WELCOME');
  assert.equal(select('WELCOME',result.codes,[],[]).codes,result.codes);
  assert.match(result.notice,/WELCOME dipilih/);
});

test('selecting an automatic voucher fills the field without forcing an ineligible code into checkout',()=>{
  const offers=[{code:'ONGKIR',automatic:true}];
  const pending=select('ONGKIR','FIRST',offers,[]);
  assert.equal(pending.codes,'FIRST');
  assert.equal(pending.input,'ONGKIR');
  assert.match(pending.notice,/setelah syarat/);
  const applied=select('ONGKIR','FIRST',offers,[{code:'ONGKIR'}]);
  assert.equal(applied.codes,'FIRST');
  assert.match(applied.notice,/sudah diterapkan/);
});
