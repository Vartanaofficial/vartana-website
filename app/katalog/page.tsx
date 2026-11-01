import type {Metadata} from 'next';
import EditorialHeader from '../components/EditorialHeader';
import Catalog from './Catalog';
import '../editorial.css';
export const metadata:Metadata={title:'Katalog VARTANA | Pilihan racikan dan kemasan',description:'Lihat racikan, isi kemasan, dan harga terbaru dari katalog VARTANA.'};
export default function CatalogPage(){return <main className="editorial"><EditorialHeader/><section className="editorial-intro"><span className="editorial-eyebrow">KATALOG VARTANA</span><h1>Temukan racikan<br/>yang kamu suka.</h1><p>Lihat komposisi, pilihan kemasan, dan harga sebelum memesan. Informasi produk mengikuti katalog terbaru.</p></section><Catalog/><footer className="editorial-footer">Ada yang ingin ditanyakan? <a href="https://wa.me/6285777999960">Hubungi tim VARTANA</a></footer></main>;}
