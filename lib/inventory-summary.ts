type StockItem={category?:unknown;qty?:unknown;unit?:unknown;value?:unknown;unitCost?:unknown};
export function inventorySummary(materials:StockItem[],finished:StockItem[]){
 const groups=[{label:'Bahan baku',items:materials.filter(i=>i.category==='Bahan baku')},{label:'Kemasan & perlengkapan',items:materials.filter(i=>i.category!=='Bahan baku'&&i.category!=='Produksi')},{label:'Barang jadi (HPP)',items:finished}];
 return groups.map(group=>{
  const units:Record<string,number>={};let incomplete=0,value=0;
  group.items.forEach(i=>{if(typeof i.qty!=='number'||!Number.isFinite(i.qty)){incomplete++;return;}units[String(i.unit||'pack')]=(units[String(i.unit||'pack')]||0)+i.qty;if(i.qty>0&&(!(typeof i.unitCost==='number')||i.unitCost<=0||typeof i.value!=='number'||!Number.isFinite(i.value))){incomplete++;return;}if(typeof i.value==='number'&&Number.isFinite(i.value))value+=i.value;});
  return {...group,value,incomplete,quantity:Object.entries(units).map(([unit,qty])=>qty.toLocaleString('id-ID',{maximumFractionDigits:4})+' '+unit).join(' + ')||'Belum dicatat'};
 });
}
