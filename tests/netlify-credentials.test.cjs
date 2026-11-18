const {test}=require('node:test'),assert=require('node:assert/strict'),load=require('./load-ts.cjs');
const {validateCredentialInput,saveNetlifyCredential,netlifyCredentialConnection,listNetlifyCredentials,deleteNetlifyCredential}=load('lib/netlify-credentials.ts');
test('credential editor cannot overwrite auth, script, public or arbitrary environment variables',()=>{
 for(const key of ['ADMIN_SESSION_SECRET','GOOGLE_SCRIPT_URL','NETLIFY_INTEGRATION_TOKEN','NEXT_PUBLIC_SECRET','NODE_OPTIONS','UNKNOWN_KEY'])assert.throws(()=>validateCredentialInput({key,value:'test'}));
 assert.deepEqual(validateCredentialInput({key:'DOKU_SECRET_KEY',value:' test '}),{key:'DOKU_SECRET_KEY',value:'test'});
 assert.equal(validateCredentialInput({key:'VARTANA_EXT_NEW_API',value:'test'}).key,'VARTANA_EXT_NEW_API');
 assert.throws(()=>validateCredentialInput({key:'DOKU_SECRET_KEY',value:'a\nb'}));
});
test('new API creates a site-scoped production secret without returning its value',async()=>{
 const names=['NETLIFY_INTEGRATION_TOKEN','NETLIFY_INTEGRATION_ACCOUNT_ID','NETLIFY_INTEGRATION_SITE_ID'],old=names.map(name=>process.env[name]);
 names.forEach((name,i)=>process.env[name]=['token-test-only','account-test','site-test'][i]);
 const calls=[];try{
 const result=await saveNetlifyCredential({key:'DOKU_SECRET_KEY',value:'provider-secret-test'},async(url,options)=>{calls.push({url,options});return new Response(null,{status:calls.length===1?404:201});});
 assert.equal(calls.length,2);assert.match(calls[1].url,/site_id=site-test/);
 const [payload]=JSON.parse(calls[1].options.body);assert.equal(payload.is_secret,true);assert.deepEqual(payload.scopes,['builds','functions','runtime']);assert.equal(payload.values[0].context,'production');
 assert.equal(JSON.stringify(result).includes('provider-secret-test'),false);assert.equal(JSON.stringify(result).includes('token-test-only'),false);assert.equal(result.requiresDeploy,true);
 }finally{names.forEach((name,i)=>{if(old[i]===undefined)delete process.env[name];else process.env[name]=old[i];});}
});
test('editing an API patches only production and never replaces all environment values',async()=>{
 const names=['NETLIFY_INTEGRATION_TOKEN','NETLIFY_INTEGRATION_ACCOUNT_ID','NETLIFY_INTEGRATION_SITE_ID'],old=names.map(name=>process.env[name]);names.forEach(name=>process.env[name]='test');
 const calls=[];try{
 await saveNetlifyCredential({key:'BITESHIP_API_KEY',value:'new-secret'},async(url,options)=>{calls.push({url,options});return new Response(null,{status:200});});
 assert.equal(calls[1].options.method,'PATCH');assert.deepEqual(JSON.parse(calls[1].options.body),{context:'production',value:'new-secret'});
 }finally{names.forEach((name,i)=>{if(old[i]===undefined)delete process.env[name];else process.env[name]=old[i];});}
});
test('missing bootstrap and invalid key fail before external calls; Netlify errors never echo secrets',async()=>{
 const names=['NETLIFY_INTEGRATION_TOKEN','NETLIFY_INTEGRATION_ACCOUNT_ID','NETLIFY_INTEGRATION_SITE_ID'],old=names.map(name=>process.env[name]);let calls=0;
 try{names.forEach(name=>delete process.env[name]);assert.equal(netlifyCredentialConnection().configured,false);
 await assert.rejects(saveNetlifyCredential({key:'DOKU_SECRET_KEY',value:'test'},async()=>{calls++;}),/belum disiapkan/);assert.equal(calls,0);
 names.forEach(name=>process.env[name]='test');await assert.rejects(saveNetlifyCredential({key:'DOKU_SECRET_KEY',value:'provider-secret'},async()=>new Response('provider-secret token-test',{status:403})),error=>!error.message.includes('provider-secret'));
 }finally{names.forEach((name,i)=>{if(old[i]===undefined)delete process.env[name];else process.env[name]=old[i];});}
});

test('credential API requires an admin session and same-origin confirmation before any write',async()=>{
 const fs=require('node:fs'),ts=require('typescript'),auth=load('lib/admin-auth.ts'),oldSecret=process.env.ADMIN_SESSION_SECRET,oldUser=process.env.ADMIN_USERNAME;
 process.env.ADMIN_SESSION_SECRET='test-admin-secret-32-characters-long';process.env.ADMIN_USERNAME='test-admin';
 const token=auth.createAdminSessionToken('test-admin',process.env.ADMIN_SESSION_SECRET);let writes=0;const testModule={exports:{}},imports={'next/server':{NextResponse:{json:(body,options)=>Response.json(body,options)}},'@/lib/admin-auth':auth,'@/lib/request-origin':load('lib/request-origin.ts'),'@/lib/netlify-credentials':{netlifyCredentialConnection:()=>({configured:true}),listNetlifyCredentials:async()=>[],deleteNetlifyCredential:async()=>{writes++;return {deleted:true};},saveNetlifyCredential:async()=>{writes++;return {saved:true};}}};
 const source=ts.transpileModule(fs.readFileSync('app/api/admin/integrations/credentials/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 new Function('require','module','exports',source)(name=>imports[name],testModule,testModule.exports);
 const request=(cookie,origin)=>({url:'https://vartana.test/api/admin/integrations/credentials',headers:new Headers({origin}),cookies:{get:()=>cookie?{value:cookie}:undefined},json:async()=>({key:'DOKU_SECRET_KEY',value:'test'})});
 try{assert.equal((await testModule.exports.GET(request('','https://vartana.test'))).status,401);assert.equal((await testModule.exports.POST(request('','https://vartana.test'))).status,401);assert.equal((await testModule.exports.POST(request(token,'https://evil.test'))).status,403);assert.equal((await testModule.exports.DELETE(request('','https://vartana.test'))).status,401);assert.equal((await testModule.exports.DELETE(request(token,'https://evil.test'))).status,403);assert.equal(writes,0);assert.equal((await testModule.exports.POST(request(token,'https://vartana.test'))).status,200);assert.equal(writes,1);}
 finally{if(oldSecret===undefined)delete process.env.ADMIN_SESSION_SECRET;else process.env.ADMIN_SESSION_SECRET=oldSecret;if(oldUser===undefined)delete process.env.ADMIN_USERNAME;else process.env.ADMIN_USERNAME=oldUser;}
});

function setupConnection(){const names=['NETLIFY_INTEGRATION_TOKEN','NETLIFY_INTEGRATION_ACCOUNT_ID','NETLIFY_INTEGRATION_SITE_ID'],old=names.map(name=>process.env[name]);names.forEach(name=>process.env[name]='test');return ()=>names.forEach((name,i)=>{if(old[i]===undefined)delete process.env[name];else process.env[name]=old[i];});}
test('API list strips values and excludes protected connection keys',async()=>{
 const restore=setupConnection();try{const entries=await listNetlifyCredentials(async()=>Response.json([
 {key:'DOKU_SECRET_KEY',updated_at:'today',is_secret:true,values:[{context:'production',value:'must-not-leak'}]},
 {key:'NETLIFY_INTEGRATION_TOKEN',values:[{context:'production',value:'never-leak'}]},
 {key:'ADMIN_PASSWORD',values:[{context:'production',value:'never-leak'}]},
 {key:'VARTANA_EXT_TEST_KEY',values:[{context:'production',value:'also-secret'}]},
 {key:'IPAYMU_API_KEY',values:[{context:'deploy-preview',value:'preview'}]}
 ]));assert.deepEqual(entries.map(e=>e.key),['DOKU_SECRET_KEY','VARTANA_EXT_TEST_KEY']);assert.equal(JSON.stringify(entries).includes('must-not-leak'),false);assert.equal(JSON.stringify(entries).includes('also-secret'),false);
 }finally{restore();}
});
test('API delete requires typed confirmation and never permits protected keys',async()=>{
 let calls=0;for(const key of ['ADMIN_SESSION_SECRET','NETLIFY_INTEGRATION_TOKEN','GOOGLE_SCRIPT_URL'])await assert.rejects(deleteNetlifyCredential({key,confirmKey:key,expectedUpdatedAt:''},async()=>{calls++;}));
 await assert.rejects(deleteNetlifyCredential({key:'DOKU_SECRET_KEY',confirmKey:'wrong',expectedUpdatedAt:''},async()=>{calls++;}));assert.equal(calls,0);
});
test('API delete removes only matching production value and rejects stale data',async()=>{
 const restore=setupConnection(),calls=[];try{const send=async(url,options)=>{calls.push({url,options});return options.method==='DELETE'?new Response(null,{status:204}):Response.json({updated_at:'revision-2',values:[{id:'prod-id',context:'production',value:'secret'},{id:'preview-id',context:'deploy-preview'}]});};
 await assert.rejects(deleteNetlifyCredential({key:'DOKU_SECRET_KEY',confirmKey:'DOKU_SECRET_KEY',expectedUpdatedAt:'revision-1'},send),/berubah/);assert.equal(calls.length,1);calls.length=0;
 const result=await deleteNetlifyCredential({key:'DOKU_SECRET_KEY',confirmKey:'DOKU_SECRET_KEY',expectedUpdatedAt:'revision-2'},send);assert.equal(result.deleted,true);assert.equal(calls.length,2);assert.match(calls[1].url,/DOKU_SECRET_KEY\/value\/prod-id\?site_id=/);assert.equal(calls[1].options.method,'DELETE');assert.equal(JSON.stringify(result).includes('secret'),false);
 }finally{restore();}
});
