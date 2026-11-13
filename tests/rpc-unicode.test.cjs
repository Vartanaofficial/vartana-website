const {test}=require('node:test'),assert=require('node:assert/strict');
const load=require('./load-ts.cjs'),{fixture}=require('./games-fixture.cjs');
const {signPuzzle}=load('lib/puzzle-server.ts');
const {serializeSignedPayload}=load('lib/rpc-payload.ts');

test('Unicode promo text is signed using identical ASCII bytes on Node and Apps Script without changing its contents',()=>{
  const old=process.env.ADMIN_SESSION_SECRET;process.env.ADMIN_SESSION_SECRET='x'.repeat(40);
  try{
    const f=fixture();
    for(const sample of ['Hai, Sahabat VARTANA! 🌿','Promo · Rp20.000 →','Café — こんにちは','Halo\r\n\r\nPromo','\ud800']){
      const payload={operation:'campaignCapabilities',sample},proof=signPuzzle('adminManagement',payload);
      f.c.Date.now=()=>Number(proof.authTime);
      const wire=serializeSignedPayload({...proof,action:'adminManagement'});
      assert.ok(/^[\x00-\x7f]*$/.test(wire));
      const received=JSON.parse(wire);assert.equal(received.puzzlePayload.sample,sample);
      assert.equal(f.c.adminManagement_(received).success,true);
      received.puzzlePayload.sample+='changed';assert.throws(()=>f.c.adminManagement_(received),/Otorisasi/);
    }
  }finally{if(old===undefined)delete process.env.ADMIN_SESSION_SECRET;else process.env.ADMIN_SESSION_SECRET=old;}
});

test('legacy RPC proofs remain compatible and encoding metadata does not enter signed order data',()=>{
  const f=fixture(),payload={orderSerial:'VRT-1',phone:'081234567890'};
  const legacy=f.signed('saveOrder',payload);assert.doesNotThrow(()=>f.c.puzzleVerify_(legacy,'saveOrder'));
  assert.equal(JSON.stringify(f.c.puzzleOrderProof_({...payload,...legacy,authEncoding:'json-ascii-v1'})),JSON.stringify(payload));
  assert.throws(()=>f.c.puzzleVerify_({...legacy,authEncoding:'unsupported'},'saveOrder'),/Format/);
});
