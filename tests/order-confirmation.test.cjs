const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),{test}=require('node:test');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {orderConfirmationMessage}=require('../lib/order-confirmation.ts');
const customer={name:'Customer Example',phone:'081234567890',email:'customer@example.test',address:'Alamat contoh'};
test('WhatsApp confirmation includes the recorded order, fulfillment details and exact shipping split',()=>{
 const message=orderConfirmationMessage({serial:'VRT-TEST',total:83000,details:{memberId:'MEM-TEST',customerName:customer.name,phone:customer.phone,email:customer.email,addressDetail:'Alamat tersimpan, Kota Contoh',itemsSummary:'Mix Edition [10 Tea Bags (Mixed Blend)] (1x) | Kurir JNE - JNE REG | Catatan: Tanpa kartu',subtotalProducts:78000,originalShipping:12000,customerShippingFee:5000,shippingSubsidy:7000}},customer,'bank_transfer');
 for(const text of ['Member MEM-TEST','VRT-TEST','Alamat tersimpan, Kota Contoh','- Mix Edition [10 Tea Bags (Mixed Blend)] (1x)','JNE - JNE REG','Rp78.000','Rp12.000','Rp5.000','Rp7.000','Rp83.000','Tanpa kartu','1940576471'])assert.ok(message.includes(text),text);
 assert.ok(!message.includes('pembayaran diterima'));
});
test('free gifts and redemption stay itemized and QRIS does not instruct a bank transfer',()=>{
 const message=orderConfirmationMessage({serial:'TEST',total:6000,details:{itemsSummary:'Tea [Pack] (1x) | GRATIS Gift [Pack] (1x @Rp0) [BONUS] | TEBUS MURAH Tea [Pack] (1x @Rp1000) [TEBUS] | Promo BONUS: diskon produk Rp0 | Kurir JNT',subtotalProducts:1000,customerShippingFee:5000,shippingSubsidy:0}},customer,'qris');
 for(const text of ['- GRATIS Gift','- TEBUS MURAH Tea','*Metode pembayaran:* QRIS','Subsidi Pengiriman Rp0'])assert.ok(message.includes(text));
 assert.ok(!message.includes('bukti transfer ke BCA'));assert.ok(!message.includes('- Promo BONUS'));
});
test('old receipts retain available contacts without inventing product or shipping amounts',()=>{
 const message=orderConfirmationMessage({serial:'OLD',total:83000},customer,'qris');assert.ok(message.includes('Customer Example'));assert.ok(message.includes('Rp83.000'));assert.ok(!message.includes('Biaya Pengiriman:'));assert.ok(!message.includes('undefined'));assert.ok(!message.includes('NaN'));
});
