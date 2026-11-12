const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),load=require('./load-ts.cjs'),{fixture}=require('./games-fixture.cjs');
const {adminFetch}=load('lib/admin-fetch.ts');
test('admin feedback reports pending then saved/failed, without consuming the caller response or duplicating the write',async()=>{
 const oldFetch=global.fetch,oldWindow=global.window,events=[];global.window={dispatchEvent:e=>events.push(e.detail)};let calls=0;
 try{
  global.fetch=async()=>{calls++;return Response.json({success:true,message:'Promo berhasil ditambahkan.'});};const response=await adminFetch('/api/admin/promos',{method:'POST',body:'{}'});assert.equal(calls,1);assert.equal((await response.json()).success,true);assert.deepEqual(events.map(e=>e.phase),['pending','success']);assert.equal(events[1].message,'Promo berhasil ditambahkan.');
  events.length=0;global.fetch=async()=>Response.json({success:false,message:'Kode sudah digunakan.'},{status:409});await adminFetch('/api/admin/promos',{method:'POST'});assert.deepEqual(events.map(e=>e.phase),['pending','error']);
  events.length=0;global.fetch=async()=>Response.json({success:true});await adminFetch('/api/admin/promos');assert.equal(events.length,0);
  global.fetch=async()=>{throw Error('offline');};await assert.rejects(adminFetch('/api/admin/inventory',{method:'POST'}),/offline/);assert.deepEqual(events.map(e=>e.phase),['pending','error']);
 }finally{global.fetch=oldFetch;if(oldWindow===undefined)delete global.window;else global.window=oldWindow;}
});
test('malformed successful HTTP bodies never produce a misleading saved notification',async()=>{const oldFetch=global.fetch,oldWindow=global.window,events=[];global.window={dispatchEvent:e=>events.push(e.detail)};global.fetch=async()=>new Response('broken');try{await adminFetch('/api/admin/promos',{method:'POST'});assert.equal(events.at(-1).phase,'error');}finally{global.fetch=oldFetch;if(oldWindow===undefined)delete global.window;else global.window=oldWindow;}});

test('promo save uses one backend RPC, verifies persisted fields, and reuses the same new ID on retry',async()=>{
 const f=fixture(),headers=['Promotion ID','SKU','Promotion Name','Promo Price','Discount Percentage','Banner Text','Start Date','End Date','Active','Created At','Updated At'];f.c.inventoryOperationsSheet_('Promotions',headers);
 const calls=[],mod={exports:{}};const imports={'next/server':{NextResponse:{json:(d,i)=>Response.json(d,i)}},'@/lib/admin-auth':{verifyAdminSessionToken:()=>true},'@/lib/master-products':{requestMasterScript:async(action,payload)=>{calls.push(action);const result=f.c.savePromotion(payload);if(!result.success)throw Error(result.message);return result;}},'@/lib/checkout-promos':load('lib/checkout-promos.ts')};
 const source=ts.transpileModule(fs.readFileSync('app/api/admin/promos/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','exports','module',source)(n=>imports[n],mod.exports,mod);
 const old=process.env.ADMIN_SESSION_SECRET;process.env.ADMIN_SESSION_SECRET='test-secret';
 const body={name:'Gratis ongkir',code:'SHIPTEST',type:'shipping',shippingMode:'free',area:'all',value:0,active:true,automatic:true,requestId:'00000000-0000-0000-0000-000000000123'};
 async function post(b){const req=new Request('https://example.com/api/admin/promos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});req.cookies={get:()=>({value:'test'})};return mod.exports.POST(req);}
 try{const result=await post(body),data=await result.json();assert.equal(result.status,200,data.message);assert.equal(data.verified,true);assert.equal(data.promo.code,'SHIPTEST');assert.equal(data.promo.automatic,true);assert.equal(data.promo.active,true);assert.deepEqual(calls,['createPromotion']);assert.equal(f.tables.Promotions.rows.length,2);await post(body);assert.equal(f.tables.Promotions.rows.length,2);assert.equal((await post({...body,requestId:'00000000-0000-0000-0000-000000000124'})).status,409);}finally{if(old===undefined)delete process.env.ADMIN_SESSION_SECRET;else process.env.ADMIN_SESSION_SECRET=old;}
});
