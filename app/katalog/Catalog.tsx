'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import type {Product,ProductVariant} from '@/lib/products';
import {readClientJson} from '@/lib/client-reads';
import {readCart,writeCart,type StoredCartItem} from '@/lib/cart-storage';
import ProductImage from '../components/ProductImage';

const money=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
export default function Catalog(){
 const [products,setProducts]=useState<Product[]>([]),[message,setMessage]=useState('Memuat katalog…'),[search,setSearch]=useState(''),[reload,setReload]=useState(0),[choices,setChoices]=useState<Record<string,string>>({}),[cart,setCart]=useState<StoredCartItem[]>([]),[notice,setNotice]=useState('');
 useEffect(()=>{setCart(readCart());const sync=()=>setCart(readCart());window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
 useEffect(()=>{let active=true;readClientJson<{success:boolean;products:Product[]}>('/api/catalog?lang=id',15000,reload>0).then(data=>{if(!Array.isArray(data.products))throw new Error('Respons katalog belum lengkap.');if(active){setProducts(data.products);setMessage(data.products.length?'':'Belum ada produk yang tersedia.');}}).catch(e=>{if(active)setMessage(e instanceof Error?e.message:'Katalog belum bisa dimuat.');});return()=>{active=false;};},[reload]);
 const visible=products.filter(product=>(product.name+' '+product.ingredients.map(i=>i.id).join(' ')).toLowerCase().includes(search.toLowerCase()));
 function add(product:Product,variant:ProductVariant){
  if(!variant.sku)return;const current=readCart(),index=current.findIndex(item=>item.selectedVariant.sku===variant.sku);
  if(index>=0){if(current[index].quantity>=999){setNotice('Jumlah maksimal 999 per kemasan.');return;}current[index]={product,selectedVariant:variant,quantity:current[index].quantity+1};}else current.push({product,selectedVariant:variant,quantity:1});
  writeCart(current);setCart(current);setNotice(`${product.name} (${variant.size}) ditambahkan ke keranjang.`);
 }
 return <><div id="racikan" className="catalog-toolbar"><div><span className="editorial-eyebrow">PILIH TEMAN JEDAMU</span><h2>Racikan VARTANA</h2><p>{visible.length} racikan untuk dijelajahi</p></div><label className="text-xs text-[#617163]">Cari racikan<input className="mt-2 block w-full max-w-md rounded-xl border border-[#ccd7c2] bg-white p-3 text-sm" placeholder="Nama racikan atau bahan" value={search} onChange={e=>setSearch(e.target.value)}/></label>{message&&<p role="status" className="mt-5 text-sm">{message} <button className="underline" onClick={()=>setReload(n=>n+1)}>Muat ulang</button></p>}</div>
 {!!cart.length&&<aside className="catalog-basket"><div><strong>{cart.reduce((sum,item)=>sum+item.quantity,0)} kemasan di keranjang</strong><span>{money(cart.reduce((sum,item)=>sum+item.quantity*item.selectedVariant.priceValue,0))}</span></div><Link href="/checkout" className="editorial-button">Lanjut ke checkout →</Link></aside>}{notice&&<p className="catalog-basket-note" role="status">{notice}</p>}
 <section className="editorial-grid catalog-grid" aria-label="Katalog produk">{visible.map(product=>{const variants=(product.variants||[]).filter(v=>v.sku),variant=variants.find(v=>v.sku===choices[product.id])||variants[0];return <article key={product.id} className="editorial-card"><div className="editorial-card-image"><ProductImage src={variant?.image||product.image||'/Logo Vartana.png'} alt={product.name} className="h-full w-full p-4"/></div><div className="editorial-card-copy"><span className="editorial-eyebrow">{product.subtitle}</span><h2>{product.name}</h2><p>{variant?.description?.id||product.description.id}</p><label className="catalog-variant-label">Pilih kemasan<select value={variant?.sku||''} onChange={e=>setChoices(previous=>({...previous,[product.id]:e.target.value}))}>{variants.map(v=><option key={v.sku} value={v.sku}>{v.size}</option>)}</select></label><p className="editorial-catalog-price">{money(variant?.priceValue||product.priceValue)}</p><button type="button" className="editorial-button catalog-add" disabled={!variant||product.status==='COMING SOON'} onClick={()=>variant&&add(product,variant)}>Tambah ke keranjang</button><Link href={'/?produk='+encodeURIComponent(product.id)+'#collection'} className="editorial-read">Baca detail racikan →</Link></div></article>;})}</section>{!message&&!visible.length&&<p className="editorial-notice">Tidak ada racikan yang sesuai pencarian.</p>}</>;
}
