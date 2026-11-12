const {test}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {fixture}=require('./games-fixture.cjs');

function setup(){
  const f=fixture();
  f.c.Utilities.DigestAlgorithm={SHA_256:'SHA_256'};
  f.c.Utilities.computeDigest=(_,text)=>[...crypto.createHash('sha256').update(text).digest()];
  f.c.getProducts=()=>[{sku:'A'},{sku:'B'}];
  const sheets=f.c.inventorySheets_();
  f.c.inventoryCommit_(sheets,f.c.inventoryState_(sheets),'OPEN',[{kind:'finished',id:'A',qty:5}],'Opening');
  const payload={requestId:'00000000-0000-0000-0000-000000000001',note:'Hitung fisik',items:[{id:'A',qty:3,expectedQty:5},{id:'B',qty:0,expectedQty:null}]};
  return {...f,sheets,payload,save:(body=payload)=>f.c.saveFinishedBulk_(body)};
}

test('bulk count writes selected stock together, records unknown zero, and preserves settings',()=>{
  const f=setup();
  f.sheets.config.appendRow(['finished:A',2,'',10]);
  f.c.inventoryBatchChanges_=()=>{throw Error('Finished stock must not read material batches');};
  const before=f.tables.InventoryLedger.rows.length;
  assert.equal(f.save().success,true);
  const state=f.c.inventoryState_(f.sheets);
  assert.equal(state.balances['finished:A'],3);
  assert.equal(state.balances['finished:B'],0);
  assert.equal(state.minimum['finished:A'],2);
  assert.equal(state.maximum['finished:A'],10);
  assert.equal(f.tables.InventoryLedger.rows.length,before+2);
  assert.equal(f.tables.InventoryLedger.rows.at(-1)[1],f.tables.InventoryLedger.rows.at(-2)[1]);
});

test('bulk retry is idempotent even when item order changes; changed payload is rejected',()=>{
  const f=setup();assert.equal(f.save().success,true);
  const count=f.tables.InventoryLedger.rows.length;
  assert.equal(f.save({...f.payload,items:[...f.payload.items].reverse()}).duplicate,true);
  assert.equal(f.save({...f.payload,note:'Other'}).success,false);
  assert.equal(f.tables.InventoryLedger.rows.length,count);
});

for(const [name,items] of Object.entries({stale:[{id:'A',qty:4,expectedQty:4}],unknown:[{id:'A',qty:4,expectedQty:5},{id:'X',qty:1,expectedQty:null}],fraction:[{id:'A',qty:1.5,expectedQty:5}],negative:[{id:'A',qty:-1,expectedQty:5}],duplicate:[{id:'A',qty:3,expectedQty:5},{id:'A',qty:2,expectedQty:5}]})){
  test('bulk '+name+' fails without changing any stock',()=>{
    const f=setup(),before=JSON.stringify(f.tables.InventoryLedger.rows);
    assert.equal(f.save({...f.payload,items}).success,false);
    assert.equal(JSON.stringify(f.tables.InventoryLedger.rows),before);
  });
}
