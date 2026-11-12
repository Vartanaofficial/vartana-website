const {test}=require('node:test'),assert=require('node:assert/strict'),{fixture,session}=require('./games-fixture.cjs');
const id=n=>'00000000-0000-0000-0000-'+String(n).padStart(12,'0');
function emailFixture(){const f=fixture();let n=10,locked=false,effective='vartana@vartanaglobal.com',aliases=[],quota=100,fail=false,nested=false;const sent=[];
 f.c.LockService.getScriptLock=()=>({waitLock(){assert.equal(locked,false);locked=true;},releaseLock(){locked=false;}});
 f.c.Session={getEffectiveUser:()=>({getEmail:()=>effective})};
 const deliver=(attemptId,resend=false,extra={})=>f.c.gamesRewardEmailHandle_(f.signed('gamesRewardEmail',{session,attemptId,resend,...extra}));
 let attempt;
 function send(message){assert.equal(locked,false,'mail must not hold the spreadsheet script lock');sent.push(message);if(nested){nested=false;assert.equal(deliver(attempt,false).duplicate,true);}if(fail)throw Error('ambiguous provider timeout');}
 f.c.MailApp={getRemainingDailyQuota:()=>quota,sendEmail:send};f.c.GmailApp={getAliases:()=>aliases,sendEmail:(to,subject,body,options)=>send({to,subject,body,...options})};
 const call=(operation,extra={})=>f.c.gamesHandle_(f.signed('games',{operation,game:'numbers',session,...extra}));
 const start=(extra={})=>call('start',{requestId:id(n++),name:'Ayu',phone:'081234567890',email:'ayu@example.com',...extra});
 function win(extra={}){const a=start(extra);attempt=a.attempt.id;const stored=JSON.parse(f.tables.GameAttempts.rows.at(-1)[14]);f.advance(1000);return call('finish',{attemptId:attempt,answers:stored.questions.map(q=>q.answer)});}
 return {...f,call,start,win,deliver,sent,configure:options=>{if('effective'in options)effective=options.effective;if('aliases'in options)aliases=options.aliases;if('quota'in options)quota=options.quota;if('fail'in options)fail=options.fail;if('nested'in options)nested=options.nested;}};
}
test('win creates one seven-day spreadsheet code and automatic email is idempotent and sent outside the lock',()=>{
 const f=emailFixture(),won=f.win(),code=won.voucher.code,expiry=won.voucher.expiresAt;assert.equal(won.voucher.email.status,'PENDING');assert.equal(won.voucher.email.sendCount,0);assert.equal(Date.parse(expiry)-JSON.parse(f.tables.GameAttempts.rows[1][14]).finishedAt,7*86400000);
 f.configure({nested:true});const sent=f.deliver(won.attempt.id);assert.equal(sent.email.status,'SENT');assert.equal(sent.email.sendCount,1);assert.equal(f.sent[0].to,'ayu@example.com');assert.ok(f.sent[0].body.includes(code));assert.equal(f.sent[0].replyTo,'vartana@vartanaglobal.com');assert.ok(f.sent[0].htmlBody.includes('checkout?promo='+code));
 assert.equal(f.deliver(won.attempt.id).duplicate,true);f.advance(60000);const again=f.win();assert.notEqual(again.voucher.code,code);assert.ok(Date.parse(again.voucher.expiresAt)>Date.parse(expiry));f.deliver(again.attempt.id);assert.equal(f.sent.length,2);assert.equal(f.tables.PuzzleVouchers.rows.length,3);
});
test('three wins earn three distinct vouchers; retries and later wins never send extra emails',()=>{
 const f=emailFixture(),codes=[];
 for(let n=0;n<3;n++){const won=f.win();codes.push(won.voucher.code);assert.equal(won.rewardLimit.earned,n+1);f.deliver(won.attempt.id);assert.equal(f.deliver(won.attempt.id).duplicate,true);assert.equal(f.call('finish',{attemptId:won.attempt.id,answers:[]}).voucher.code,won.voucher.code);assert.throws(()=>f.deliver(won.attempt.id,true),/satu kali/);}
 assert.equal(new Set(codes).size,3);const fourth=f.win();assert.equal(fourth.attempt.status,'WON');assert.equal(fourth.voucher,null);assert.equal(fourth.rewardLimit.remaining,0);assert.ok(fourth.leaderboard.entries.length);assert.equal(f.tables.PuzzleVouchers.rows.length,4);assert.equal(f.sent.length,3);assert.equal(f.call('status').voucher,null);
});

test('email, WhatsApp and Gmail aliases share the cap and cannot redirect a claimed recipient',()=>{
 const f=emailFixture(),won=f.win({email:'first.last@gmail.com'});assert.throws(()=>f.start({email:'new@example.com'}),/terikat/);
 const again=f.win({email:'firstlast+extra@gmail.com'});assert.notEqual(again.voucher.code,won.voucher.code);f.deliver(again.attempt.id);assert.equal(f.sent[0].to,'first.last@gmail.com');const third=f.win({email:'firstlast@gmail.com'});assert.ok(third.voucher);assert.equal(f.win({email:'firstlast+last@googlemail.com'}).voucher,null);assert.equal(f.tables.PuzzleVouchers.rows.length,4);
});
test('unverified sender or quota blocks mail without silently using a different from address',()=>{
 const f=emailFixture(),won=f.win();f.configure({effective:'other@example.com'});assert.equal(f.deliver(won.attempt.id).email.status,'BLOCKED');assert.equal(f.sent.length,0);assert.equal(f.call('status').voucher.email.sendCount,0);
 const q=emailFixture(),w=q.win();q.configure({quota:0});assert.equal(q.deliver(w.attempt.id).email.status,'BLOCKED');assert.equal(q.sent.length,0);
 const alias=emailFixture(),a=alias.win();alias.configure({effective:'other@example.com',aliases:['vartana@vartanaglobal.com']});assert.equal(alias.deliver(a.attempt.id).email.status,'BLOCKED');assert.equal(alias.sent.length,0);
});

test('uncertain provider results consume one send slot and are never automatically retried',()=>{
 const f=emailFixture(),won=f.win();f.configure({fail:true});assert.equal(f.deliver(won.attempt.id).email.status,'UNKNOWN');assert.equal(f.sent.length,1);f.advance(60000);assert.equal(f.deliver(won.attempt.id).duplicate,true);assert.equal(f.sent.length,1);assert.throws(()=>f.deliver(won.attempt.id,true),/satu kali/);for(let i=0;i<2;i++){const next=f.win();f.deliver(next.attempt.id);}assert.equal(f.win().voucher,null);assert.equal(f.sent.length,3);
});

test('expired or redeemed codes are not emailed, and another session cannot trigger delivery',()=>{
 const f=emailFixture(),won=f.win();assert.throws(()=>f.deliver(won.attempt.id,false,{session:id(999)}),/sesi ini/);f.tables.Orders.rows[0].push('Puzzle Voucher Code');const row=Array(17).fill('');row[16]=won.voucher.code;f.tables.Orders.appendRow(row);assert.equal(f.deliver(won.attempt.id).email.status,'USED');assert.equal(f.call('status').voucher.email.canResend,false);assert.equal(f.sent.length,0);
 const e=emailFixture(),expired=e.win();e.advance(7*86400000);assert.equal(e.deliver(expired.attempt.id).email.status,'EXPIRED');assert.equal(e.sent.length,0);assert.equal(e.call('status').voucher.code,expired.voucher.code);
});
test('legacy winners receive their original code and expiry with email metadata backfilled, not a fresh seven days',()=>{
 const f=emailFixture(),won=f.win(),sheet=f.tables.PuzzleVouchers,oldExpiry=new Date(Date.parse(won.voucher.expiresAt)-4*86400000);sheet.rows=[sheet.rows[0].slice(0,5),sheet.rows[1].slice(0,5)];sheet.rows[1][4]=oldExpiry;const current=f.call('status');assert.equal(current.voucher.code,won.voucher.code);assert.equal(current.voucher.expiresAt,oldExpiry.toISOString());assert.equal(current.voucher.email.status,'PENDING');f.deliver(won.attempt.id);assert.equal(f.sent.length,1);assert.equal(f.call('status').voucher.expiresAt,oldExpiry.toISOString());
});

test('signed admin recovery sends existing legacy codes once without issuing or extending rewards',()=>{
 const f=emailFixture(),won=f.win(),sheet=f.tables.PuzzleVouchers,code=won.voucher.code,expiry=won.voucher.expiresAt;sheet.rows=[sheet.rows[0].slice(0,5),sheet.rows[1].slice(0,5)];
 const recover=()=>f.c.gamesAdminHandle_(f.signed('gamesAdmin',{operation:'recoverRewardEmails'}));assert.equal(recover().recovery.sent,1);assert.equal(f.sent.length,1);assert.ok(f.sent[0].body.includes(code));assert.equal(sheet.rows.length,2);assert.equal(new Date(sheet.rows[1][4]).toISOString(),expiry);assert.equal(recover().recovery.sent,0);assert.equal(f.sent.length,1);
});

test('different phone numbers with the same email share three vouchers and recover their own legacy emails',()=>{
 const f=emailFixture(),first=f.win(),second=f.win({phone:'081299999999'});assert.notEqual(first.voucher.code,second.voucher.code);const sheet=f.tables.PuzzleVouchers;sheet.rows=sheet.rows.map(row=>row.slice(0,6));
 const recovered=f.c.gamesAdminHandle_(f.signed('gamesAdmin',{operation:'recoverRewardEmails'}));assert.equal(recovered.recovery.sent,2);assert.equal(f.sent.length,2);assert.ok(f.sent.every(m=>m.to==='ayu@example.com'));assert.equal(f.tables.PuzzleVouchers.rows.length,3);
 const third=f.win({phone:'081288888888'});assert.equal(third.rewardLimit.earned,3);f.deliver(third.attempt.id);assert.equal(f.win({phone:'081277777777'}).voucher,null);assert.equal(f.sent.length,3);
});
