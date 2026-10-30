const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),{test}=require('node:test');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017}}).outputText,file);
const {normalizeRegionName,groupPostalCodes,lookupPostalCodes}=require('../lib/postal-codes.ts');
test('legacy region names match equivalent postal provider labels without mixing cities',()=>{
 assert.equal(normalizeRegionName('KOTA JAKARTA SELATAN'),normalizeRegionName('Kota Administrasi Jakarta Selatan'));
 assert.equal(normalizeRegionName('D.I. YOGYAKARTA'),normalizeRegionName('Daerah Istimewa Yogyakarta'));
 assert.equal(normalizeRegionName('DKI JAKARTA'),normalizeRegionName('Daerah Khusus Ibukota Jakarta'));
 assert.notEqual(normalizeRegionName('KOTA TANGERANG'),normalizeRegionName('KOTA TANGERANG SELATAN'));
});
test('postal dropdown groups villages, ignores missing codes and deduplicates labels',()=>{
 const result=groupPostalCodes([{id:'1',name:'Kalibata',postal_code:'12740'},{id:'2',name:'Pancoran',postal_code:'12780'},{id:'3',name:'Rawajati',postal_code:'12740'},{id:'4',name:'Kalibata',postal_code:'12740'},{id:'5',name:'Unknown',postal_code:''}]);
 assert.equal(result.length,2);assert.deepEqual(result[0],{code:'12740',villages:['Kalibata','Rawajati']});
});
test('lookup follows exact province/city/district matches and fails on unknown districts',async()=>{
 const before=global.fetch;
 const data={'provinces':[{id:'31',name:'DKI Jakarta'}],'regencies/31':[{id:'31.74',name:'Kota Administrasi Jakarta Selatan'}],'districts/31.74':[{id:'31.74.08',name:'Pancoran'}],'villages/31.74.08':[{id:'1',name:'Pancoran',postal_code:'12780'}]};
 global.fetch=async url=>Response.json({data:data[String(url).split('/v2/')[1].replace('.json','')]});
 try{const r=await lookupPostalCodes('DKI JAKARTA','KOTA JAKARTA SELATAN','PANCORAN');assert.equal(r[0].code,'12780');await assert.rejects(lookupPostalCodes('DKI JAKARTA','KOTA JAKARTA SELATAN','OTHER'),/belum cocok/);}finally{global.fetch=before;}
});

test('Tangerang city and regency remain separate and return every district code',async()=>{
 const before=global.fetch;const data={provinces:[{id:'36',name:'Banten'}],'regencies/36':[{id:'kab',name:'Kabupaten Tangerang'},{id:'kota',name:'Kota Tangerang'}],'districts/kota':[{id:'district',name:'Tangerang'}],'villages/district':[{id:'a',name:'A',postal_code:'15111'},{id:'b',name:'B',postal_code:'15112'}]};
 global.fetch=async url=>Response.json({data:data[String(url).split('/v2/')[1].replace('.json','')]});
 try{assert.deepEqual((await lookupPostalCodes('BANTEN','KOTA TANGERANG','TANGERANG')).map(x=>x.code),['15111','15112']);}finally{global.fetch=before;}
});
