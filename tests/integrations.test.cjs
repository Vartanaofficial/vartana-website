const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const load=require('./load-ts.cjs'),{fixture}=require('./games-fixture.cjs');
const {defaultIntegrations,validateIntegrations,paymentChoices}=load('lib/integrations.ts');
test('manual payment activation is configurable and unknown future adapters cannot be enabled',()=>{
 const settings=defaultIntegrations().settings;
 assert.deepEqual(paymentChoices(settings).map(x=>x.id),['bank_transfer','qris']);
 settings[0].enabled=false;assert.deepEqual(paymentChoices(settings).map(x=>x.id),['qris']);
 settings[1].enabled=false;assert.deepEqual(paymentChoices(settings),[]);
 settings[3].enabled=true;assert.throws(()=>validateIntegrations(settings),/adapter/);
 settings[3].enabled=false;settings[1].id='bank_transfer';assert.throws(()=>validateIntegrations(settings),/valid/);
});
test('integration preferences reject unsigned writes without sheet changes; signed revisions survive reads',()=>{
 const f=fixture(),settings=defaultIntegrations().settings,before=JSON.stringify(f.tables);
 const denied=f.c.doPost({postData:{contents:JSON.stringify({action:'integrationSettings',operation:'save',settings})}});
 assert.equal(denied.status,'error');assert.equal(JSON.stringify(f.tables),before);
 const saved=f.rpc({action:'integrationSettings',operation:'save',settings,expectedRevision:''});
 assert.equal(saved.success,true);assert.ok(saved.document.revision);
 assert.equal(f.rpc({action:'integrationSettings',operation:'read'}).document.revision,saved.document.revision);
 const old=JSON.stringify(f.tables.AdminPreferences.rows);
 assert.equal(f.rpc({action:'integrationSettings',operation:'save',settings,expectedRevision:''}).status,'error');
 assert.equal(JSON.stringify(f.tables.AdminPreferences.rows),old);
});
test('settings persist only allowlisted preferences, never credential fields',()=>{
 const f=fixture(),settings=defaultIntegrations().settings;
 settings[0].secret='must-never-persist';settings[0].enabled=false;
 const saved=f.rpc({action:'integrationSettings',operation:'save',settings,expectedRevision:''});
 assert.equal(saved.document.settings[0].enabled,false);
 assert.equal(JSON.stringify(f.tables.AdminPreferences.rows).includes('must-never-persist'),false);
 settings[3].enabled=true;
 assert.equal(f.rpc({action:'integrationSettings',operation:'save',settings,expectedRevision:saved.document.revision}).status,'error');
});
test('admin integration endpoint rejects anonymous/cross-origin writes and returns only credential presence',async()=>{
 const secret='integration-test-secret-32-characters-long',auth=load('lib/admin-auth.ts'),old=process.env.ADMIN_SESSION_SECRET,oldUser=process.env.ADMIN_USERNAME;
 process.env.ADMIN_SESSION_SECRET=secret;process.env.ADMIN_USERNAME='admin';
 const token=auth.createAdminSessionToken('admin',secret);let saves=0;
 const testModule={exports:{}},imports={'next/server':{NextResponse:{json:(value,init)=>Response.json(value,init)}},'@/lib/admin-auth':auth,'@/lib/request-origin':load('lib/request-origin.ts'),'@/lib/integrations-server':{integrationCredentials:()=>[{id:'doku',variables:[{name:'DOKU_SECRET_KEY',configured:true}]}],readIntegrationSettings:async()=>defaultIntegrations(),saveIntegrationSettings:async()=>{saves++;return defaultIntegrations();}}};
 const output=ts.transpileModule(fs.readFileSync('app/api/admin/integrations/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 new Function('require','module','exports',output)(name=>imports[name],testModule,testModule.exports);
 const req=(cookie,origin)=>({url:'https://vartana.test/api/admin/integrations',headers:new Headers({origin}),cookies:{get:()=>cookie?{value:cookie}:undefined},json:async()=>({settings:defaultIntegrations().settings})});
 try{
  assert.equal((await testModule.exports.POST(req('', 'https://vartana.test'))).status,401);
  assert.equal((await testModule.exports.POST(req(token,'https://other.test'))).status,403);
  assert.equal(saves,0);
  const response=await testModule.exports.GET(req(token,'https://vartana.test')),data=await response.json();
  assert.equal(response.status,200);assert.equal(data.credentials[0].variables[0].configured,true);
  assert.match(response.headers.get('cache-control'),/no-store/);
 }finally{if(oldUser===undefined)delete process.env.ADMIN_USERNAME;else process.env.ADMIN_USERNAME=oldUser;if(old===undefined)delete process.env.ADMIN_SESSION_SECRET;else process.env.ADMIN_SESSION_SECRET=old;}
});
