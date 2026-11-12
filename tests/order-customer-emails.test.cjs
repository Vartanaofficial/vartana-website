const {test}=require('node:test'),assert=require('node:assert/strict'),{fixture,session}=require('./games-fixture.cjs');
function orderFixture(email='customer@example.com'){
 const f=fixture(),sent=[];let held=false,fail=false,nested=false;
 f.c.LockService.getScriptLock=()=>({waitLock(){assert.equal(held,false,'nested script lock');held=true;},releaseLock(){held=false;}});
 f.c.Session={getEffectiveUser:()=>({getEmail:()=> 'vartana@vartanaglobal.com'})};
 f.c.getProducts=()=>[{sku:'TEA',active:true,productName:'Tea',variantName:'Pouch'}];
 f.c.MailApp={getRemainingDailyQuota:()=>100,sendEmail:m=>{assert.equal(held,false,'mail must run outside stock lock');sent.push(m);if(nested){nested=false;assert.equal(send(lastEvent).duplicate,true);}if(fail)throw Error('provider timeout');}};
 f.c.saveRetailOrderWithPromo_({orderSerial:'ORDER-1',orderKey:session,customerName:'Ayu <script>',phone:'081234567890',email,itemsSummary:'Tea (2x)',subtotalProducts:100000,grandTotal:113000,originalShipping:13000,customerShippingFee:13000,inventoryItems:[{sku:'TEA',quantity:2}]});
 const sheets=f.c.inventorySheets_();f.c.inventoryCommit_(sheets,f.c.inventoryState_(sheets),'OPEN',[{kind:'finished',id:'TEA',qty:5}],'Opening');
 let lastEvent;
 const update=(status,resiJNT='',extra={})=>{const result=f.c.updateOrderWithEmail_(f.signed('updateOrderWithEmail',{orderSerial:String(f.tables.Orders.rows[1][1]),status,resiJNT,...extra}));lastEvent=result.email?.eventId;return result;};
 const send=eventId=>f.c.sendOrderCustomerEmail_(f.signed('sendOrderCustomerEmail',{eventId}));
 const qty=()=>f.c.inventoryState_(f.c.inventorySheets_()).balances['finished:TEA'];
 return {...f,sent,update,send,qty,configure:o=>{if('fail'in o)fail=o.fail;if('nested'in o)nested=o.nested;}};
}
test('each saved stage queues one email; repeated saves/dispatches do not resend or deduct stock twice',()=>{
 const f=orderFixture();const stages=['PEMBAYARAN DITERIMA','PESANAN DISIAPKAN','DIKIRIM','SELESAI'];
 stages.forEach((stage,i)=>{const resi=i>=2?'JNT123456':'';const result=f.update(stage,resi,{email:'attacker@example.com'});assert.equal(result.email.status,'PENDING');if(i===0)f.configure({nested:true});assert.equal(f.send(result.email.eventId).status,'SENT');assert.equal(f.send(result.email.eventId).duplicate,true);assert.equal(f.update(stage,resi).email.status,'SENT');assert.equal(f.qty(),i===0?5:3);});
 assert.equal(f.sent.length,4);assert.ok(f.sent.every(m=>m.to==='customer@example.com'&&m.replyTo==='vartana@vartanaglobal.com'));assert.ok(f.sent[2].body.includes('JNT123456'));assert.ok(f.sent[0].htmlBody.includes('&lt;script&gt;'));assert.ok(f.sent[0].htmlBody.includes('/?track=1'));assert.equal(f.tables.OrderEmailNotifications.rows.length,5);
 assert.equal(f.c.vartanaReadOrders_(f.tables.Orders)[0].customerEmailStatus,'SENT');
});
test('invalid signatures or shipment without a tracking number cannot change status, inventory or email queue',()=>{
 const f=orderFixture(),bad=f.signed('updateOrderWithEmail',{orderSerial:'ORDER-1',status:'DIKIRIM',resiJNT:'TRACK'});bad.authSignature='bad';assert.throws(()=>f.c.updateOrderWithEmail_(bad),/Otorisasi/);assert.throws(()=>f.update('DIKIRIM'),/resi/);assert.equal(f.qty(),5);assert.equal(f.tables.Orders.rows[1][14],'MENUNGGU PEMBAYARAN');assert.equal(f.tables.OrderEmailNotifications,undefined);
});
test('missing recipient does not block status changes; uncertain provider result never blindly retries',()=>{
 const missing=orderFixture('-'),skipped=missing.update('PEMBAYARAN DITERIMA');assert.equal(skipped.email.status,'SKIPPED');assert.equal(missing.send(skipped.email.eventId).status,'SKIPPED');assert.equal(missing.sent.length,0);assert.equal(missing.tables.Orders.rows[1][14],'PEMBAYARAN DITERIMA');
 const f=orderFixture(),pending=f.update('PEMBAYARAN DITERIMA');f.configure({fail:true});assert.equal(f.send(pending.email.eventId).status,'UNKNOWN');assert.equal(f.send(pending.email.eventId).duplicate,true);assert.equal(f.update('PEMBAYARAN DITERIMA').email.status,'UNKNOWN');assert.equal(f.sent.length,1);assert.equal(f.qty(),5);
});
test('empty daily quota records BLOCKED without losing the saved order status',()=>{const f=orderFixture(),pending=f.update('PEMBAYARAN DITERIMA');f.c.MailApp.getRemainingDailyQuota=()=>0;assert.equal(f.send(pending.email.eventId).status,'BLOCKED');assert.equal(f.sent.length,0);assert.equal(f.tables.Orders.rows[1][14],'PEMBAYARAN DITERIMA');assert.equal(f.tables.OrderEmailNotifications.rows[1][7],0);});
test('product stock report separates paid sales, free rewards, unknown stock and unmapped historical orders',()=>{
 const f=orderFixture();f.c.getProducts=()=>[{sku:'TEA'},{sku:'NEW'}];const sh=f.tables.Orders,cols=f.c.checkoutColumns_(sh,['Reward Items']);sh.getRange(2,cols['Reward Items']).setValue(JSON.stringify([{sku:'TEA',quantity:1,price:0}]));
 assert.equal(f.c.productStockReport_().items[0].soldQty,0);f.update('PEMBAYARAN DITERIMA');let report=f.c.productStockReport_();assert.equal(report.items[0].soldQty,1);assert.equal(report.items[0].bonusQty,1);assert.equal(report.items[0].qty,5);assert.equal(report.items[1].qty,null);
 f.update('PESANAN DISIAPKAN');report=f.c.productStockReport_();assert.equal(report.items[0].soldQty,1);assert.equal(report.items[0].qty,3);
 sh.appendRow(['','OLD','M','Old','0812','','','TEA','Tea',0,0,0,0,0,'SELESAI','']);report=f.c.productStockReport_();assert.equal(report.unmappedOrders,1);assert.equal(report.items[0].soldQty,1);
});
