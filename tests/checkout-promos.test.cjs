const fs = require("node:fs");
const ts = require("typescript");
const assert = require("node:assert/strict");
const { test } = require("node:test");
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017}}).outputText,filename);
const { applyCheckoutPromo, decodeCheckoutPromos, jakartaDate, promoInPeriod } = require("../lib/checkout-promos.ts");
const promo = changes => ({ id:"test",code:"WELCOME10",name:"Welcome",type:"percent",value:10,minSpend:100000,maxDiscount:20000,startDate:"",endDate:"",active:true,...changes });
test("checkout percentage discount respects minimum and maximum",()=>{
  assert.equal(applyCheckoutPromo(promo(),90000,13000).productDiscount,0);
  assert.match(applyCheckoutPromo(promo(),90000,13000).error,/Minimal/);
  assert.equal(applyCheckoutPromo(promo(),150000,13000).productDiscount,15000);
  assert.equal(applyCheckoutPromo(promo(),500000,13000).productDiscount,20000);
});
test("nominal and shipping discounts never make totals negative",()=>{
  assert.equal(applyCheckoutPromo(promo({type:"nominal",minSpend:0,maxDiscount:0,value:999999}),10000,13000).productDiscount,10000);
  const shipping = applyCheckoutPromo(promo({type:"shipping",minSpend:0,maxDiscount:0,value:20000}),10000,13000);
  assert.equal(shipping.shippingDiscount,13000); assert.equal(shipping.productDiscount,0);
});
test("inactive, unknown and expired coupons cannot be applied",()=>{
  assert.notEqual(applyCheckoutPromo(undefined,150000,13000).error,"");
  assert.notEqual(applyCheckoutPromo(promo({active:false}),150000,13000).error,"");
  assert.notEqual(applyCheckoutPromo(promo({endDate:"2000-01-01"}),150000,13000).error,"");
  assert.equal(promoInPeriod(promo({startDate:"2026-10-30",endDate:"2026-10-30"}),"2026-10-30"),true);
  assert.equal(jakartaDate(new Date("2026-10-30T18:00:00Z")),"2026-10-31");
});
test("checkout config round trips without treating legacy product promos as coupons",()=>{
  const rows=[{promotionId:"legacy",bannerText:"25% OFF"},{promotionId:"new",promotionName:"Welcome",active:true,startDate:"",endDate:"",bannerText:JSON.stringify({scope:"checkout-v1",code:"WELCOME10",type:"percent",value:10,minSpend:100000,maxDiscount:20000})}];
  const decoded=decodeCheckoutPromos(rows);assert.equal(decoded.length,1);assert.equal(decoded[0].code,"WELCOME10");assert.equal(decoded[0].value,10);
});
test("readable spreadsheet columns take precedence over legacy banner JSON",()=>{
  const decoded=decodeCheckoutPromos([{promotionId:"new",promotionName:"Welcome",active:true,scope:"checkout-v1",checkoutCode:"DIRECT10",checkoutType:"percent",checkoutValue:10,minSpend:100000,maxDiscount:20000,bannerText:"Diskon 10% | Min. belanja Rp100000"}]);
  assert.equal(decoded.length,1);assert.equal(decoded[0].code,"DIRECT10");assert.equal(decoded[0].maxDiscount,20000);
});
