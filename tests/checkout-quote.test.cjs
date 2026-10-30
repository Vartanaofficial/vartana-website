const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),{test}=require('node:test');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017}}).outputText,file);
const {checkoutQuote}=require('../lib/checkout.ts');

test('server quote includes reward weight, redemption charges and stacked discount without spreadsheet writes',async()=>{
 const originalFetch=global.fetch,oldUrl=process.env.GOOGLE_SCRIPT_URL,oldKey=process.env.BITESHIP_API_KEY;
 process.env.GOOGLE_SCRIPT_URL='https://script.google.com/macros/s/test/exec';delete process.env.BITESHIP_API_KEY;
 const products=[{sku:'TEA',productName:'Tea',active:true,sellingPrice:50000,discountType:'nominal',discountValue:0,weightGram:500},{sku:'GIFT',productName:'Gift',active:true,sellingPrice:20000,discountType:'nominal',discountValue:0,weightGram:50}];
 const config=(code,type,extra)=>({promotionId:code,promotionName:code,active:true,bannerText:JSON.stringify({scope:'checkout-v2',code,type,value:0,minSpend:0,maxDiscount:0,stackable:true,priority:10,...extra})});
 const promotions=[config('SAVE8','nominal',{automatic:true,minSpend:100000,value:8000}),config('BUY2','gift',{automatic:true,buySku:'TEA',buyQty:2,rewardSku:'GIFT',rewardQty:1}),config('TEBUS','redeem',{automatic:false,buySku:'TEA',buyQty:2,rewardSku:'GIFT',rewardQty:1,redeemPrice:5000})];
 let writes=0;
 global.fetch=async(url,options)=>{if(options.method!=='GET')writes++;return Response.json(new URL(url).searchParams.get('action')==='getProducts'?{products}:{promotions});};
 try{
  const q=await checkoutQuote({items:[{sku:'TEA',quantity:2}],promoCode:'TEBUS',districtId:'test',provinceName:'BANTEN'});
  assert.equal(q.subtotal,100000);assert.equal(q.productDiscount,8000);assert.equal(q.redeemTotal,5000);assert.equal(q.shipping.price,26000);assert.equal(q.total,123000);assert.equal(q.rewardLines.length,2);assert.equal(q.lines.length,1);assert.equal(writes,0);assert.equal(q.promoError,'');
  await assert.rejects(checkoutQuote({items:[{sku:'TEA',quantity:-1}]}),/Jumlah/);
  await assert.rejects(checkoutQuote({items:[{sku:'NOT-ACTIVE',quantity:1}]}),/tidak tersedia/);
 }finally{global.fetch=originalFetch;if(oldUrl===undefined)delete process.env.GOOGLE_SCRIPT_URL;else process.env.GOOGLE_SCRIPT_URL=oldUrl;if(oldKey===undefined)delete process.env.BITESHIP_API_KEY;else process.env.BITESHIP_API_KEY=oldKey;}
});
