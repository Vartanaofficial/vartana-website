const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{test}=require('node:test');
const source=fs.readFileSync('deliverables/VARTANA-AppsScript-v2/VARTANA-AppsScript-v2.txt','utf8');
const promoHeaders=['Promotion ID','SKU','Promotion Name','Promo Price','Discount Percentage','Banner Text','Start Date','End Date','Active','Created At','Updated At'];
const orderHeaders=['Timestamp','Order Serial','Member ID','Nama Customer','No. WhatsApp','Email','Detail Alamat','SKU','Items Summary','Subtotal Products','Original Shipping','Shipping Subsidy','Customer Shipping Fee','Grand Total','Status','No. Resi J&T'];
class Sheet {
 constructor(rows){this.rows=rows;this.validations=[];this.maxColumns=26;}
 getMaxColumns(){return this.maxColumns;}insertColumnsAfter(after,count){this.maxColumns+=count;}
 getLastColumn(){return Math.max(0,...this.rows.map(r=>r.length));}getLastRow(){return this.rows.length;}getMaxRows(){return Math.max(100,this.rows.length);}
 getRange(row,col,height=1,width=1){const sheet=this;return {getValues(){return Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>sheet.rows[row+y-1]?.[col+x-1]??''));},getDisplayValues(){return this.getValues().map(r=>r.map(String));},setValue(value){while(sheet.rows.length<row)sheet.rows.push([]);sheet.rows[row-1][col-1]=value;return this;},setValues(values){values.forEach((r,y)=>r.forEach((v,x)=>sheet.getRange(row+y,col+x).setValue(v)));return this;},setFontWeight(){return this;},setNumberFormat(){return this;},setDataValidation(rule){sheet.validations.push({row,col,height,rule});return this;}};}
 getDataRange(){return this.getRange(1,1,this.rows.length,this.getLastColumn());}appendRow(row){this.rows.push([...row]);}setFrozenRows(){}
}
function fixture(){
 const config={scope:'checkout-v2',code:'BUY2',type:'gift',value:0,minSpend:100000,maxDiscount:0,buySku:'TEA',buyQty:2,rewardSku:'GIFT',rewardQty:1,automatic:true,stackable:true,priority:5,maxApplications:3};
 const legacy=['LEGACY','VRT-01','Old product promo',72800,.25,'25% OFF','','',true,'created','updated'];
 const sheets={Promotions:new Sheet([promoHeaders.slice(),legacy.slice(),['NEW','CHECKOUT','Beli 2 bonus',0,0,JSON.stringify(config),'','',true,'created','updated']]),Orders:new Sheet([orderHeaders.slice()])};
 let locks=0;
 const context=vm.createContext({console,SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:name=>sheets[name]}),newDataValidation:()=>({requireValueInList(){return this;},setAllowInvalid(){return this;},build(){return {valid:true};}})},LockService:{getScriptLock:()=>({waitLock(){locks++;},releaseLock(){locks--;}})},Utilities:{getUuid:()=> 'new-id'},ContentService:{MimeType:{JSON:'application/json'},createTextOutput:content=>({getContent:()=>content,setMimeType(){return this;}})}});
 vm.runInContext(source,context);return {context,sheets,config,legacy,locks:()=>locks};
}
test('setup migrates legacy JSON into readable columns and is safe to rerun',()=>{
 const {context:c,sheets,legacy,locks}=fixture();c.setupCheckoutPromotions();const first=JSON.stringify(sheets.Promotions.rows);c.setupCheckoutPromotions();assert.equal(JSON.stringify(sheets.Promotions.rows),first);assert.deepEqual(sheets.Promotions.rows[1].slice(0,11),legacy);const headers=sheets.Promotions.rows[0],row=sheets.Promotions.rows[2];assert.equal(row[headers.indexOf('Buy Qty')],2);assert.equal(row[headers.indexOf('Automatic')],true);assert.match(row[5],/Beli 2 TEA, gratis 1 GIFT/);assert.ok(sheets.Orders.rows[0].includes('Reward Items'));assert.equal(locks(),0);
});
test('spreadsheet column edits are reflected in the website API',()=>{
 const {context:c,sheets}=fixture();c.setupCheckoutPromotions();sheets.Promotions.rows[2][sheets.Promotions.rows[0].indexOf('Buy Qty')]=3;const config=JSON.parse(c.getPromotions().find(p=>p.promotionId==='NEW').bannerText);assert.equal(config.buyQty,3);assert.equal(config.type,'gift');assert.equal(config.stackable,true);
});
test('save supports full v2 rules and rejects duplicate codes without duplicate rows',()=>{
 const {context:c,sheets,config,locks}=fixture();c.setupCheckoutPromotions();const payload={sku:'CHECKOUT',promotionId:'NEW',promotionName:'Updated',active:true,bannerText:JSON.stringify({...config,type:'redeem',redeemPrice:5000})};let r=JSON.parse(c.savePromotion(payload).getContent());assert.equal(r.success,true);assert.equal(sheets.Promotions.rows.length,3);let row=c.getPromotions().find(p=>p.promotionId==='NEW');assert.equal(JSON.parse(row.bannerText).redeemPrice,5000);assert.equal(JSON.parse(row.bannerText).automatic,false);r=JSON.parse(c.savePromotion({...payload,promotionId:'OTHER'}).getContent());assert.equal(r.success,false);assert.equal(sheets.Promotions.rows.length,3);assert.equal(locks(),0);
});
test('order records promo audit data, waits for payment, and deduplicates retries',()=>{
 const {context:c,sheets,locks}=fixture();const body={orderSerial:'VRT-TEST',phone:'081234567890',subtotalProducts:97000,grandTotal:103000,customerShippingFee:6000,originalShipping:13000,shippingSubsidy:7000,grossSubtotalProducts:100000,promoCode:'SAVE8,TEBUS,SHIP',promoName:'Stacked',productDiscount:8000,promoShippingDiscount:7000,redeemTotal:5000,promoBreakdown:[{code:'SAVE8',productDiscount:8000}],rewardItems:[{sku:'GIFT',quantity:1,price:5000}]};const r=JSON.parse(c.saveRetailOrderWithPromo_(body).getContent());assert.equal(r.success,true);assert.equal(sheets.Orders.rows[1][14],'MENUNGGU PEMBAYARAN');const header=sheets.Orders.rows[0],row=sheets.Orders.rows[1];assert.equal(row[header.indexOf('Redeem Total')],5000);assert.equal(JSON.parse(row[header.indexOf('Reward Items')])[0].sku,'GIFT');assert.equal(JSON.parse(c.saveRetailOrderWithPromo_(body).getContent()).duplicate,true);assert.equal(sheets.Orders.rows.length,2);assert.equal(locks(),0);
});
test('legitimate zero-subtotal orders never use fallback pricing',()=>{
 const {context:c,sheets}=fixture();const r=JSON.parse(c.saveRetailOrderWithPromo_({orderSerial:'FREE',phone:'081234567890',subtotalProducts:0,grandTotal:0,customerShippingFee:0}).getContent());assert.equal(r.success,true);assert.equal(sheets.Orders.rows[1][9],0);const bad=JSON.parse(c.saveRetailOrderWithPromo_({orderSerial:'BAD',phone:'081234567890',subtotalProducts:0,grandTotal:1,customerShippingFee:0}).getContent());assert.equal(bad.status,'error');assert.equal(sheets.Orders.rows.length,2);
});

test("payment method appends beyond reconciliation columns without overwriting them",()=>{const {context:c,sheets}=fixture();sheets.Orders.rows[0].push(...c.vartanaOrderColumnNames_().filter(x=>x!=="Payment Method"),"Status Rekonsiliasi","Catatan Rekonsiliasi");const cols=c.checkoutColumns_(sheets.Orders,c.vartanaOrderColumnNames_());assert.equal(cols["Payment Method"],27);assert.equal(sheets.Orders.getMaxColumns(),27);assert.equal(sheets.Orders.rows[0][24],"Status Rekonsiliasi");});
