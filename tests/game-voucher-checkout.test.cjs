const {test}=require('node:test'),assert=require('node:assert/strict');
const {fixture,session}=require('./games-fixture.cjs'),load=require('./load-ts.cjs');
const {checkoutQuote}=load('lib/checkout.ts'),master=load('lib/master-products.ts'),puzzle=load('lib/puzzle-server.ts');
const id=n=>'00000000-0000-0000-0000-'+String(n).padStart(12,'0');
test('all three earned codes apply through checkout and redeem independently once with their own expiry',async()=>{
 const f=fixture(),codes=[];
 const call=(operation,extra={})=>f.c.gamesHandle_(f.signed('games',{operation,game:'numbers',session,...extra}));
 for(let i=0;i<3;i++){const a=call('start',{requestId:id(100+i),name:'Ayu',phone:'081234567890',email:'ayu@example.com'});const stored=JSON.parse(f.tables.GameAttempts.rows.at(-1)[14]);f.advance(1000);codes.push(call('finish',{attemptId:a.attempt.id,answers:stored.questions.map(q=>q.answer)}).voucher.code);}
 const old={products:master.readMasterProducts,request:master.requestMasterScript,puzzle:puzzle.puzzleRequest};
 master.readMasterProducts=async()=>[{sku:'TEA',active:true,productName:'Tea',sellingPrice:50000,weightGram:100}];master.requestMasterScript=async action=>action==='getRetailStock'?{success:true,retailStockVersion:1,items:[{sku:'TEA',qty:100,reservedQty:0,availableQty:100}]}:{promotions:[]};
 puzzle.puzzleRequest=async(action,payload)=>{assert.equal(action,'puzzleVoucher');return {voucher:f.c.puzzleVoucher_(payload.code,payload.phone,payload.orderKey)};};
 const save=input=>f.c.saveRetailOrderWithPromo_({...input,...f.signed('saveOrder',input)});
 try{
  for(let i=0;i<3;i++){
   const input={items:[{sku:'TEA',quantity:1}],promoCode:codes[i],phone:'081234567890',orderKey:id(200+i)};
   await assert.rejects(checkoutQuote({...input,phone:'081299999999'}),/WhatsApp/);
   const quote=await checkoutQuote(input);assert.equal(quote.productDiscount,20000);assert.equal(quote.total,30000);assert.equal(quote.promoCode,codes[i]);assert.equal(quote.promoError,'');
   const order={orderSerial:'TEST-'+i,orderKey:input.orderKey,memberId:'VRT-1',phone:input.phone,promoCode:codes[i],grossSubtotalProducts:50000,productDiscount:20000,subtotalProducts:30000,customerShippingFee:0,originalShipping:0,grandTotal:30000};
   assert.equal(save(order).success,true);assert.equal(save(order).duplicate,true);
   await assert.rejects(checkoutQuote({...input,orderKey:id(300+i)}),/digunakan/);
   assert.throws(()=>save({...order,orderSerial:'REUSE-'+i,orderKey:id(300+i)}),/digunakan/);
  }
  assert.equal(f.tables.Orders.rows.length,4);
 }finally{master.readMasterProducts=old.products;master.requestMasterScript=old.request;puzzle.puzzleRequest=old.puzzle;}
});
test('three unused vouchers expire separately seven days from each winning attempt',()=>{
 const f=fixture(),vouchers=[],call=(operation,extra={})=>f.c.gamesHandle_(f.signed('games',{operation,game:'numbers',session,...extra}));
 for(let i=0;i<3;i++){const a=call('start',{requestId:id(400+i),name:'Ayu',phone:'081234567890',email:'ayu@example.com'}),stored=JSON.parse(f.tables.GameAttempts.rows.at(-1)[14]);f.advance(1000);vouchers.push(call('finish',{attemptId:a.attempt.id,answers:stored.questions.map(q=>q.answer)}).voucher);if(i<2)f.advance(86400000);}
 f.advance(5*86400000);assert.throws(()=>f.c.puzzleVoucher_(vouchers[0].code,'081234567890',''),/kedaluwarsa/);assert.equal(f.c.puzzleVoucher_(vouchers[1].code,'081234567890','').code,vouchers[1].code);assert.equal(f.c.puzzleVoucher_(vouchers[2].code,'081234567890','').code,vouchers[2].code);
});
