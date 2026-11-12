const {test}=require('node:test'),assert=require('node:assert/strict'),load=require('./load-ts.cjs');
const {calculatePartnerQuote}=load('lib/partner-quote.ts');
const row={sku:'KPR-0001',name:'Signature Blend',variant:'Pouch',quantity:12,basePrice:50000,discountPercent:10,extraCost:2000,mode:'margin',targetMargin:30,manualPrice:0};
const input={partnerName:'Toko Contoh',pic:'PIC Contoh',phone:'',address:'',reference:'SIMULASI',issuedOn:'2026-11-12',validUntil:'2026-11-19',terms:'',rounding:1000,items:[row]};
test('partner prices use discount and extra unit costs before margin, and totals reflect quantity',()=>{
 const q=calculatePartnerQuote(input),i=q.items[0];assert.equal(i.partnerPrice,45000);assert.equal(i.unitCost,47000);assert.equal(i.sellingPrice,68000);assert.equal(i.unitProfit,21000);assert.ok(i.margin>=30);assert.equal(q.purchaseTotal,540000);assert.equal(q.extraTotal,24000);assert.equal(q.capitalTotal,564000);assert.equal(q.revenueTotal,816000);assert.equal(q.profitTotal,252000);
});
test('margin is based on selling price and rounding does not over-round exact currency multiples',()=>{
 const q=calculatePartnerQuote({...input,items:[{...row,basePrice:70000,discountPercent:0,extraCost:0}]});assert.equal(q.items[0].sellingPrice,100000);assert.equal(q.margin,30);
 const zero=calculatePartnerQuote({...input,rounding:100,items:[{...row,basePrice:50001,discountPercent:0,extraCost:0,targetMargin:0}]});assert.equal(zero.items[0].sellingPrice,50100);
});
test('manual price below cost reports loss rather than hiding it; combined margin is revenue weighted',()=>{
 const q=calculatePartnerQuote({...input,items:[{...row,mode:'manual',manualPrice:40000},{...row,sku:'SECOND',quantity:1,discountPercent:0,extraCost:0,mode:'manual',manualPrice:100000}]});assert.equal(q.items[0].unitProfit,-7000);assert.equal(q.profitTotal,-34000);assert.equal(q.margin,-34000/580000*100);
});
test('invalid dates, missing products, duplicate SKUs and unsafe totals cannot be exported',()=>{
 for(const change of [{partnerName:''},{issuedOn:'2026-02-30'},{validUntil:'2026-11-01'},{rounding:0},{items:[]},{items:[row,row]},{items:[{...row,quantity:0}]},{items:[{...row,discountPercent:100}]},{items:[{...row,targetMargin:100}]},{items:[{...row,mode:'manual',manualPrice:NaN}]},{items:[{...row,basePrice:1e9,quantity:1000000,discountPercent:0}]}])assert.throws(()=>calculatePartnerQuote({...input,...change}));
});
module.exports={input,row};
