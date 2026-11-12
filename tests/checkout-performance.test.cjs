const {test}=require('node:test'),assert=require('node:assert/strict'),load=require('./load-ts.cjs');
const transport=load('lib/master-products.ts');
const {readCheckoutMaster}=load('lib/checkout-master.ts');
const {requestCheckoutQuote}=load('lib/checkout-client.ts');

test('preview shares pending/public master reads; submit always reads fresh; errors are retryable',async()=>{
 const oldProducts=transport.readMasterProducts,oldRequest=transport.requestMasterScript,oldUrl=process.env.GOOGLE_SCRIPT_URL;
 let products=0,promos=0,fail=false;
 transport.readMasterProducts=async()=>{products++;await new Promise(r=>setTimeout(r,5));if(fail)throw Error('offline');return [];};
 transport.requestMasterScript=async()=>{promos++;return {promotions:[]};};
 try{
  process.env.GOOGLE_SCRIPT_URL='https://script.google.com/performance-test';
  await Promise.all([readCheckoutMaster(false),readCheckoutMaster(false)]);
  await readCheckoutMaster(false);assert.equal(products,1);assert.equal(promos,1);
  await readCheckoutMaster();assert.equal(products,2);assert.equal(promos,2);
  process.env.GOOGLE_SCRIPT_URL+='-retry';fail=true;
  await assert.rejects(readCheckoutMaster(false),/offline/);fail=false;
  await readCheckoutMaster(false);assert.equal(products,4);
 }finally{transport.readMasterProducts=oldProducts;transport.requestMasterScript=oldRequest;if(oldUrl===undefined)delete process.env.GOOGLE_SCRIPT_URL;else process.env.GOOGLE_SCRIPT_URL=oldUrl;}
});

test('quote timeout leaves a useful retry error and cancels its request',async()=>{
 const original=global.fetch;let aborted=false;
 global.fetch=(_url,options)=>new Promise((resolve,reject)=>{options.signal.addEventListener('abort',()=>{aborted=true;reject(new DOMException('Aborted','AbortError'));});});
 try{await assert.rejects(requestCheckoutQuote({items:[{sku:'TEA',quantity:1}]},new AbortController().signal,10),/Coba lagi/);assert.equal(aborted,true);}finally{global.fetch=original;}
});

test('changing checkout inputs cancels obsolete quote instead of reporting it as a timeout',async()=>{
 const original=global.fetch,controller=new AbortController();
 global.fetch=(_url,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))));
 try{const pending=requestCheckoutQuote({items:[]},controller.signal,1000);controller.abort();await assert.rejects(pending,{name:'AbortError'});}finally{global.fetch=original;}
});
