const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),{test}=require('node:test');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {receiptSvg}=require('../lib/customer-receipt.ts');
const logo='data:image/png;base64,AA==',order={orderSerial:'TEST',customerName:'Example',phone:'08xx',addressDetail:'Alamat contoh',itemsSummary:'Tea [Pack] (1x)',subtotalProducts:78000,customerShippingFee:5000,shippingSubsidy:7000,grandTotal:83000,status:'SELESAI'};
test('compact receipt uses supplied contacts, keeps recorded totals and labels shipping subsidy as included',()=>{
 const d=receiptSvg(order,logo);assert.equal(d.width,384);assert.ok(d.height>384);
 for(const s of ['Rp 83.000','Rp 5.000','Rp 7.000','Subsidi sudah mengurangi','vartana@vartanaglobal.com','@vartanabotanical','+62 857-7799-9960','data:image/png;base64'])assert.ok(d.svg.includes(s),s);
});
test('customer text is escaped and longer orders grow without losing the footer',()=>{
 const short=receiptSvg(order,logo),long=receiptSvg({...order,customerName:'<script>alert("test")</script>',itemsSummary:Array.from({length:20},(_,i)=>`Tea ${i} [Very long product variant name] (1x)`).join(', ')},logo);
 assert.ok(long.height>short.height);assert.ok(!long.svg.includes('<script>'));assert.ok(long.svg.includes('&lt;script&gt;'));assert.ok(long.svg.includes('Sertakan nomor pesanan'));
});
test('unpaid orders cannot generate a paid receipt and unknown amounts stay unknown',()=>{
 assert.throws(()=>receiptSvg({...order,status:'MENUNGGU PEMBAYARAN'},logo),/Verifikasi/);
 assert.throws(()=>receiptSvg({...order,grandTotal:NaN},logo));
 const d=receiptSvg({...order,subtotalProducts:null,customerShippingFee:null},logo);assert.ok(d.svg.includes('Belum tersedia'));
});
test('receipt keeps the actual order stage and omits internal shipping diagnostics and unknown payment method',()=>{
 for(const status of ['PEMBAYARAN DITERIMA','PESANAN DISIAPKAN','DIKIRIM','SELESAI']){
  const d=receiptSvg({...order,status,reconciliationStatus:'ESTIMASI_ONGKIR'},logo);
  assert.ok(d.svg.includes(status));assert.ok(d.svg.includes('Biaya pengiriman'));
  for(const text of ['estimasi historis','Tidak tercatat','Metode saat checkout'])assert.ok(!d.svg.includes(text));
  if(status!=='PEMBAYARAN DITERIMA')assert.ok(!d.svg.includes('PEMBAYARAN DITERIMA'));
 }
 assert.ok(receiptSvg({...order,paymentMethod:'qris'},logo).svg.includes('QRIS'));
});
