import type {Product,ProductVariant,Language} from './products';
export function stockDisplay(value:Product|ProductVariant,language:Language='id'){
 const variants='variants' in value?value.variants:undefined;
 const ready=variants?variants.some(v=>v.stockKnown&&(v.stockAvailable||0)>0):!!(value as ProductVariant).stockKnown&&((value as ProductVariant).stockAvailable||0)>0;
 if('status' in value&&value.status==='COMING SOON')return language==='id'?'Segera hadir':'Coming soon';
 return ready?(language==='id'?'Tersedia':'In stock'):(language==='id'?'Stok habis':'Sold out');
}
