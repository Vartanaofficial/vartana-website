const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),{test}=require('node:test');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017}}).outputText,file);
const {evaluatePromoStack}=require('../lib/promo-stack.ts');
const {decodeCheckoutPromos}=require('../lib/checkout-promos.ts');
const product={sku:'TEA',name:'Tea',variant:'Box',image:'/tea.png',price:50000,weight:100};
const gift={sku:'GIFT',name:'Small tea',variant:'Pouch',image:'/gift.png',price:20000,weight:50};
const items=[{...product,quantity:2}],products=[product,gift];
const rule=(changes={})=>({id:'rule',code:'SAVE8',name:'Save 8000',type:'nominal',value:8000,minSpend:100000,maxDiscount:0,startDate:'',endDate:'',active:true,automatic:true,stackable:true,priority:10,...changes});
test('spend Rp100000 saves Rp8000 and stacks with shipping discount',()=>{
 const r=evaluatePromoStack([rule(),rule({id:'ship',code:'SHIP',type:'shipping',value:7000,priority:20})],[],items,products,13000);
 assert.equal(r.productDiscount,8000);assert.equal(r.shippingDiscount,7000);assert.equal(r.total,98000);assert.equal(r.applied.length,2);
});
test('buy one get one and buy two get a different gift derive extra fulfillment lines',()=>{
 const r=evaluatePromoStack([rule({type:'bogo',code:'B1G1',minSpend:0,buySku:'TEA',buyQty:1,rewardQty:1,maxApplications:10}),rule({type:'gift',code:'BUY2',buySku:'TEA',buyQty:2,rewardSku:'GIFT',rewardQty:1,maxApplications:1})],[],items,products,13000);
 assert.equal(r.rewards[0].quantity,2);assert.equal(r.rewards[0].sku,'TEA');assert.equal(r.rewards[1].quantity,1);assert.equal(r.rewards[1].sku,'GIFT');assert.equal(r.total,113000);assert.equal(r.rewards[1].price,0);
});
test('redemption is opt-in and charged at configured price, never free by accident',()=>{
 const redeem=rule({type:'redeem',code:'TEBUS',automatic:false,buySku:'TEA',buyQty:2,rewardSku:'GIFT',rewardQty:1,maxApplications:1,redeemPrice:5000});
 assert.equal(evaluatePromoStack([redeem],[],items,products,13000).rewards.length,0);
 const chosen=evaluatePromoStack([rule(),redeem],['TEBUS'],items,products,13000);
 assert.equal(chosen.redeemTotal,5000);assert.equal(chosen.total,110000);assert.equal(chosen.rewards[0].kind,'redeem');
 assert.notEqual(evaluatePromoStack([{...redeem,redeemPrice:999999}],['TEBUS'],items,products,13000).errors.length,0);
});
test('free gifts never qualify for another reward and repeated codes do not duplicate it',()=>{
 const a=rule({type:'gift',code:'A',buySku:'TEA',buyQty:2,rewardSku:'GIFT',rewardQty:1});
 const b=rule({type:'gift',code:'B',minSpend:0,buySku:'GIFT',buyQty:1,rewardSku:'TEA',rewardQty:1});
 const r=evaluatePromoStack([a,b],['A','A'],items,products,0);assert.equal(r.rewards.length,1);assert.equal(r.applied.length,1);
});
test('exclusive manual promos block incompatible stacking, and invalid/expired offers fail closed',()=>{
 const exclusive=rule({code:'EXCLUSIVE',stackable:false,automatic:false,priority:1});
 const r=evaluatePromoStack([rule({automatic:false}),exclusive],['EXCLUSIVE','SAVE8'],items,products,0);assert.equal(r.applied.length,1);assert.match(r.errors.join(' '),/tidak bisa digabung/);
 assert.equal(evaluatePromoStack([rule({active:false})],['SAVE8'],items,products,0).applied.length,0);
 assert.equal(evaluatePromoStack([rule({endDate:'2000-01-01'})],[],items,products,0).applied.length,0);
 assert.match(evaluatePromoStack([],['UNKNOWN'],items,products,0).errors[0],/tidak ditemukan/);
});
test('sequential percentages use remaining subtotal and monetary discounts cannot exceed it',()=>{
 const r=evaluatePromoStack([rule({type:'percent',code:'FIRST',value:10,priority:1}),rule({type:'percent',code:'SECOND',value:10,priority:2})],[],items,products,0);
 assert.equal(r.productDiscount,19000);assert.equal(r.total,81000);
 const capped=evaluatePromoStack([rule({value:999999}),rule({code:'TWO',value:999999})],[],items,products,0);assert.equal(capped.total,0);
});
test('extended rule settings round trip through the existing spreadsheet API',()=>{
 const value=decodeCheckoutPromos([{promotionId:'test',promotionName:'Gift',active:true,bannerText:JSON.stringify({scope:'checkout-v2',code:'BUY2',type:'gift',value:0,minSpend:0,maxDiscount:0,buySku:'TEA',buyQty:2,rewardSku:'GIFT',rewardQty:1,automatic:true,stackable:true})}])[0];
 assert.equal(value.type,'gift');assert.equal(value.buyQty,2);assert.equal(value.automatic,true);assert.equal(value.rewardSku,'GIFT');
});
