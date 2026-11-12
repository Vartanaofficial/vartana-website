const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),{test}=require('node:test');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017}}).outputText,file);
const {checkoutQuote}=require('../lib/checkout.ts');
require('../lib/google-fetch.ts').fetchGoogle=(url,init)=>global.fetch(url,init);

test('server quote includes reward weight, redemption charges and stacked discount without spreadsheet writes',async()=>{
 const originalFetch=global.fetch,oldUrl=process.env.GOOGLE_SCRIPT_URL,oldKey=process.env.BITESHIP_API_KEY;
 process.env.GOOGLE_SCRIPT_URL='https://script.google.com/macros/s/test/exec';delete process.env.BITESHIP_API_KEY;
 const products=[{sku:'TEA',productName:'Tea',active:true,sellingPrice:50000,discountType:'nominal',discountValue:0,weightGram:500},{sku:'GIFT',productName:'Gift',active:true,sellingPrice:20000,discountType:'nominal',discountValue:0,weightGram:50}];
 const config=(code,type,extra)=>({promotionId:code,promotionName:code,active:true,bannerText:JSON.stringify({scope:'checkout-v2',code,type,value:0,minSpend:0,maxDiscount:0,stackable:true,priority:10,...extra})});
 const promotions=[config('SAVE8','nominal',{automatic:true,minSpend:100000,value:8000}),config('BUY2','gift',{automatic:true,buySku:'TEA',buyQty:2,rewardSku:'GIFT',rewardQty:1}),config('TEBUS','redeem',{automatic:false,buySku:'TEA',buyQty:2,rewardSku:'GIFT',rewardQty:1,redeemPrice:5000})];
 let writes=0;
 global.fetch=async(url,options)=>{const action=options.method==='POST'?JSON.parse(options.body).action:new URL(url).searchParams.get('action');if(!['getProducts','getPromotions'].includes(action))writes++;return Response.json(action==='getProducts'?{products}:{promotions});};
 try{
  const q=await checkoutQuote({items:[{sku:'TEA',quantity:2}],promoCode:'TEBUS',districtId:'test',provinceName:'BANTEN'});
  assert.equal(q.subtotal,100000);assert.equal(q.productDiscount,8000);assert.equal(q.redeemTotal,5000);assert.equal(q.shipping.price,26000);assert.equal(q.total,123000);assert.equal(q.rewardLines.length,2);assert.equal(q.lines.length,1);assert.equal(writes,0);assert.equal(q.promoError,'');
  await assert.rejects(checkoutQuote({items:[{sku:'TEA',quantity:-1}]}),/Jumlah/);
  await assert.rejects(checkoutQuote({items:[{sku:'NOT-ACTIVE',quantity:1}]}),/tidak tersedia/);
 }finally{global.fetch=originalFetch;if(oldUrl===undefined)delete process.env.GOOGLE_SCRIPT_URL;else process.env.GOOGLE_SCRIPT_URL=oldUrl;if(oldKey===undefined)delete process.env.BITESHIP_API_KEY;else process.env.BITESHIP_API_KEY=oldKey;}
});

test('personal puzzle voucher validates privately, caps product discount and refuses stacking',async()=>{
 const originalFetch=global.fetch,oldUrl=process.env.GOOGLE_SCRIPT_URL,oldSecret=process.env.ADMIN_SESSION_SECRET,oldKey=process.env.BITESHIP_API_KEY;
 process.env.GOOGLE_SCRIPT_URL='https://script.google.com/macros/s/test/exec';process.env.ADMIN_SESSION_SECRET='test-secret-'.repeat(4);delete process.env.BITESHIP_API_KEY;
 const requests=[];global.fetch=async(url,options)=>{if(options.method==='POST'&&JSON.parse(options.body).action==='puzzleVoucher'){const body=JSON.parse(options.body);requests.push(body);if(body.puzzlePayload.phone!=='081234567890')return Response.json({success:false,message:'Voucher berbeda member'});return Response.json({success:true,voucher:{code:body.puzzlePayload.code,value:20000}});}return Response.json((options.method==='POST'?JSON.parse(options.body).action:new URL(url).searchParams.get('action'))==='getProducts'?{products:[{sku:'TEA',productName:'Tea',active:true,sellingPrice:10000,discountValue:0,weightGram:100}]}:{promotions:[]});};
 try{
  const q=await checkoutQuote({items:[{sku:'TEA',quantity:1}],promoCode:'puz-ABC',phone:'081234567890',orderKey:'key',districtId:'test',provinceName:'BANTEN'});
  assert.equal(q.productDiscount,10000);assert.equal(q.total,13000);assert.equal(q.promoCode,'PUZ-ABC');assert.equal(requests[0].action,'puzzleVoucher');assert.equal(requests[0].puzzlePayload.orderKey,'key');assert.match(requests[0].authSignature,/^[a-f0-9]{64}$/);
  await assert.rejects(checkoutQuote({items:[{sku:'TEA',quantity:1}],promoCode:'PUZ-ABC',phone:'081299999999'}),/member/);
  await assert.rejects(checkoutQuote({items:[{sku:'TEA',quantity:1}],promoCode:'PUZ-ABC,SAVE20',phone:'081234567890'}),/sendiri/);
 }finally{global.fetch=originalFetch;for(const [key,value] of Object.entries({GOOGLE_SCRIPT_URL:oldUrl,ADMIN_SESSION_SECRET:oldSecret,BITESHIP_API_KEY:oldKey})){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
