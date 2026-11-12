const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),{test}=require('node:test');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {requestCostingBackend}=require('../lib/costing-backend.ts');
require('../lib/google-fetch.ts').fetchGoogle=(url,init)=>global.fetch(url,init);
const {normalizeMaterialPurchase}=require('../lib/raw-materials.ts');
test('old Apps Script is detected before a material write can fall through to order saving',async()=>{
 const original=global.fetch,env=process.env.GOOGLE_SCRIPT_URL;process.env.GOOGLE_SCRIPT_URL='https://script.google.com/macros/s/TEST/exec';let calls=0;
 global.fetch=async()=>{calls++;return {ok:true,json:async()=>({found:false,message:'Parameter tidak valid.'})};};
 try{await assert.rejects(requestCostingBackend('saveRawMaterials',{materials:[]}),/New version/);assert.equal(calls,1);}finally{global.fetch=original;if(env===undefined)delete process.env.GOOGLE_SCRIPT_URL;else process.env.GOOGLE_SCRIPT_URL=env;}
});
test('Rp120000 for one kg normalizes to Rp120 per gram',()=>{
 const m=normalizeMaterialPurchase({id:'MAT-TEST',name:'Jahe',category:'Bahan baku',unit:'kg',purchaseCost:120000,purchaseQty:1,supplier:'Supplier',source:'2026-10-29',confirmed:true});assert.equal(m.purchaseQty,1000);assert.equal(m.unit,'gram');assert.equal(m.purchaseCost/m.purchaseQty,120);
});
