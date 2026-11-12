const {test}=require('node:test');
const assert=require('node:assert/strict');
const {fixture}=require('./games-fixture.cjs');
const id='00000000-0000-0000-0000-000000000002';
function setup(){
  const f=fixture(),mail=[];let locked=false;
  f.c.LockService.getScriptLock=()=>({waitLock(){assert.equal(locked,false);locked=true;},releaseLock(){locked=false;}});
  f.c.Session={getEffectiveUser:()=>({getEmail:()=> 'vartana@vartanaglobal.com'})};
  f.c.MailApp={getRemainingDailyQuota:()=>100,sendEmail(message){assert.equal(locked,false);mail.push(message);}};
  const call=payload=>f.c.adminManagement_(f.signed('adminManagement',payload));
  const draft={operation:'campaignCreate',id,subject:'Penawaran VARTANA',body:'Promo khusus bulan ini.',members:[{row:2,memberId:'VRT-1',email:'member@example.com'}]};
  return {...f,mail,call,draft};
}

test('menu order persists with optimistic concurrency and read does not create a sheet',()=>{
  const f=setup();assert.equal(f.call({operation:'menuRead'}).order.length,0);assert.equal(f.tables.AdminPreferences,undefined);
  const order=['/admin/games','/admin/members','/admin/dashboard?view=stock'];
  const saved=f.call({operation:'menuSave',order,expectedRevision:''});
  assert.equal(JSON.stringify(f.call({operation:'menuRead'}).order),JSON.stringify(order));
  assert.throws(()=>f.call({operation:'menuSave',order:[...order].reverse(),expectedRevision:''}),/berubah/);
  assert.ok(f.call({operation:'menuSave',order:[...order].reverse(),expectedRevision:saved.revision}).success);
});

test('campaign preview sends nothing, deduplicates email, and send requires explicit confirmation',()=>{
  const f=setup();f.tables.Members.appendRow(['','VRT-2','Same person','MEMBER@example.com','081234567890']);
  f.draft.members.push({row:3,memberId:'VRT-2',email:'MEMBER@example.com'});
  const result=f.call(f.draft);assert.equal(result.campaign.recipients.length,1);assert.equal(f.mail.length,0);
  assert.throws(()=>f.call({operation:'campaignSend',id}),/Tinjau/);
  assert.ok(f.call(f.draft).success);
  assert.throws(()=>f.call({...f.draft,subject:'Different'}),/berbeda/);
  assert.equal(f.call({operation:'campaignSend',id,confirmed:true}).campaign.recipients[0].status,'SENT');
  f.call({operation:'campaignSend',id,confirmed:true});assert.equal(f.mail.length,1);
  assert.equal(f.mail[0].to,'member@example.com');assert.equal(f.mail[0].bcc,undefined);
});

test('ambiguous email failure is recorded and never automatically retried',()=>{
  const f=setup();f.call(f.draft);let calls=0;
  f.c.MailApp.sendEmail=()=>{calls++;throw Error('Transport interrupted');};
  const result=f.call({operation:'campaignSend',id,confirmed:true});
  assert.equal(result.campaign.recipients[0].status,'UNKNOWN');
  f.call({operation:'campaignSend',id,confirmed:true});assert.equal(calls,1);
});

test('quota exhaustion leaves recipients pending and changed member data is rejected',()=>{
  const f=setup();assert.throws(()=>f.call({...f.draft,members:[{row:2,memberId:'VRT-1',email:'wrong@example.com'}]}),/thay|berubah/);
  f.call(f.draft);f.c.MailApp.getRemainingDailyQuota=()=>0;
  assert.throws(()=>f.call({operation:'campaignSend',id,confirmed:true}),/Kuota/);
  assert.equal(f.call({operation:'campaignRead',id}).campaign.recipients[0].status,'PENDING');assert.equal(f.mail.length,0);
});

test('email HTML escapes content and independent sends preserve each recipient status',()=>{
  const f=setup();f.tables.Members.appendRow(['','VRT-2','Other','other@example.com','081234567891']);
  f.draft.members.push({row:3,memberId:'VRT-2',email:'other@example.com'});f.draft.body='<img src=x onerror=alert(1)> Offer';
  f.call(f.draft);
  f.c.MailApp.sendEmail=message=>{f.mail.push(message);if(f.mail.length===1)f.call({operation:'campaignSend',id,confirmed:true});};
  f.call({operation:'campaignSend',id,confirmed:true});
  assert.equal(f.mail.length,2);assert.equal(new Set(f.mail.map(message=>message.to)).size,2);
  assert.ok(f.mail[0].htmlBody.includes('&lt;img'));assert.ok(!f.mail[0].htmlBody.includes('<img src=x'));
  assert.ok(f.call({operation:'campaignRead',id}).campaign.recipients.every(recipient=>recipient.status==='SENT'));
});

test('management requires signed authorization before accessing preferences or email',()=>{
  const f=setup();assert.throws(()=>f.c.adminManagement_({puzzlePayload:{operation:'campaignSend',id,confirmed:true}}));assert.equal(f.mail.length,0);
});

test('an interrupted delivery-status write cannot cause a second email on retry',()=>{
  const f=setup();f.call(f.draft);
  const sh=f.tables.MemberCampaigns,original=sh.getRange.bind(sh);let writes=0;
  sh.getRange=(...args)=>{const range=original(...args),set=range.setValue;range.setValue=value=>{writes++;if(writes===2)throw Error('Sheet interrupted after mail');return set(value);};return range;};
  assert.throws(()=>f.call({operation:'campaignSend',id,confirmed:true}),/interrupted/);
  assert.equal(f.mail.length,1);
  f.call({operation:'campaignSend',id,confirmed:true});assert.equal(f.mail.length,1);
  f.advance(16*60000);
  assert.equal(f.call({operation:'campaignRead',id}).campaign.recipients[0].status,'UNKNOWN');
});
