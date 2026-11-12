const {test}=require('node:test');
const assert=require('node:assert/strict');
const {fixture}=require('./games-fixture.cjs');

test('member admin edits contacts while preserving ID/email/orders and rejects stale changes',()=>{
  const f=fixture();
  const call=payload=>f.c.adminMembers_(f.signed('adminMembers',payload));
  const before=JSON.stringify(f.tables.Orders.rows);
  const member=call({operation:'list'}).members[0];
  const result=call({operation:'save',member:{...member,name:'Ayu',phone:'81234567890',birthDate:'1990-01-01',address:'Jl. Melati',city:'Tangerang',email:'attacker@example.com'}});
  assert.equal(result.success,true);
  assert.equal(result.member.email,'member@example.com');
  assert.equal(result.member.memberId,'VRT-1');
  assert.equal(result.member.phone,'6281234567890');
  assert.equal(JSON.stringify(f.tables.Orders.rows),before);
  assert.throws(()=>call({operation:'save',member:{...member,name:'Stale'}}),/berubah/);
  assert.equal(f.tables.Members.rows[1][2],'Ayu');
});

test('member admin requires signed authorization and validates before changing data',()=>{
  const f=fixture();
  assert.throws(()=>f.c.adminMembers_({puzzlePayload:{operation:'list'}}));
  const member=f.c.adminMembers_(f.signed('adminMembers',{operation:'list'})).members[0];
  const before=JSON.stringify(f.tables.Members.rows);
  assert.throws(()=>f.c.adminMembers_(f.signed('adminMembers',{operation:'save',member:{...member,name:''}})));
  assert.equal(JSON.stringify(f.tables.Members.rows),before);
});
