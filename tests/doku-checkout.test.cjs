const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),load=require('./load-ts.cjs');
const {dokuHeaders,dokuPaymentUrl,createDokuPayment,checkDokuPayment}=load('lib/doku-checkout.ts');
const credentials={clientId:'BRN-TEST-123',secretKey:'secret-test-only'},invoice='VRTT'+'A'.repeat(26),id='00000000-0000-0000-0000-000000000001';
test('DOKU POST signs exact JSON digest; GET omits digest',()=>{
 const body='{"order":{"amount":1000}}',time='2026-11-18T14:00:00Z',target='/checkout/v1/payment';
 const raw=['Client-Id:'+credentials.clientId,'Request-Id:'+id,'Request-Timestamp:'+time,'Request-Target:'+target,'Digest:'+crypto.createHash('sha256').update(body).digest('base64')].join('\n');
 assert.equal(dokuHeaders(credentials,target,body,id,time).Signature,'HMACSHA256='+crypto.createHmac('sha256',credentials.secretKey).update(raw).digest('base64'));
 const getRaw=raw.split('\n').slice(0,4).join('\n');assert.equal(dokuHeaders(credentials,target,undefined,id,time).Signature,'HMACSHA256='+crypto.createHmac('sha256',credentials.secretKey).update(getRaw).digest('base64'));
});
test('payment URLs are restricted to HTTPS DOKU hosts',()=>{assert.equal(dokuPaymentUrl('https://jokul.doku.com/checkout/test'),'https://jokul.doku.com/checkout/test');for(const url of ['javascript:alert(1)','https://doku.com.evil.test/pay','http://doku.com/pay','https://user:password@doku.com/pay'])assert.throws(()=>dokuPaymentUrl(url));});
test('production payment validates amount, preserves request identity and never returns keys',async()=>{
 let call;const result=await createDokuPayment(credentials,invoice,1000,id,async(url,options)=>{call={url,options};return Response.json({response:{order:{invoice_number:invoice,amount:1000},payment:{url:'https://jokul.doku.com/checkout/test'}}});});
 assert.equal(call.url,'https://api.doku.com/checkout/v1/payment');assert.equal(call.options.headers['Request-Id'],id);assert.equal(JSON.parse(call.options.body).order.amount,1000);assert.equal(result.amount,1000);assert.equal(JSON.stringify(result).includes(credentials.secretKey),false);
 let calls=0;await assert.rejects(createDokuPayment(credentials,invoice,0,id,async()=>{calls++;}));assert.equal(calls,0);
});
test('wrong amount or invoice cannot produce payment result or paid status',async()=>{
 await assert.rejects(createDokuPayment(credentials,invoice,1000,id,async()=>Response.json({response:{order:{invoice_number:invoice,amount:1001},payment:{url:'https://jokul.doku.com/pay'}}})),/cocok/);
 await assert.rejects(checkDokuPayment(credentials,invoice,1000,async()=>Response.json({order:{invoice_number:'OTHER',amount:1000},transaction:{status:'SUCCESS'}})),/cocok/);
 const status=await checkDokuPayment(credentials,invoice,1000,async()=>Response.json({order:{invoice_number:invoice,amount:1000},transaction:{status:'PENDING'}}));assert.equal(status.paid,false);
 const paid=await checkDokuPayment(credentials,invoice,1000,async()=>Response.json({order:{invoice_number:invoice,amount:1000},transaction:{status:'SUCCESS'}}));assert.equal(paid.paid,true);
});
test('upstream failure does not reflect credential or provider body',async()=>{await assert.rejects(createDokuPayment(credentials,invoice,1000,id,async()=>new Response(credentials.secretKey,{status:401})),error=>!error.message.includes(credentials.secretKey)&&/401/.test(error.message));});
test('local DOKU configuration never enables production deployments or anonymous callers',()=>{
 const local=load('lib/local-doku.ts'),auth=load('lib/admin-auth.ts'),names=['NODE_ENV','ADMIN_USERNAME','ADMIN_SESSION_SECRET'],old=names.map(name=>process.env[name]);
 try{process.env.ADMIN_USERNAME='admin';process.env.ADMIN_SESSION_SECRET='test-admin-session-secret-32-chars';const token=auth.createAdminSessionToken('admin',process.env.ADMIN_SESSION_SECRET),req=new Request('http://localhost:3000/api/test',{headers:{cookie:'vartana_admin_session='+token}});
 process.env.NODE_ENV='production';assert.equal(local.localDokuAdmin(req),false);assert.equal(local.localDokuCredentials(),null);
 process.env.NODE_ENV='development';assert.equal(local.localDokuAdmin(new Request('http://localhost:3000/api/test')),false);assert.equal(local.localDokuAdmin(req),true);assert.equal(local.localDokuAdmin(new Request('https://www.vartana.id/api/test',{headers:{cookie:'vartana_admin_session='+token}})),false);
 }finally{names.forEach((name,i)=>{if(old[i]===undefined)delete process.env[name];else process.env[name]=old[i];});}
});
