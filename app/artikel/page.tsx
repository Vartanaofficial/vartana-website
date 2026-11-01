import Link from 'next/link';
import type {Metadata} from 'next';
import {readPublishedArticles} from '@/lib/article-server';
import EditorialHeader from '../components/EditorialHeader';
import ProductImage from '../components/ProductImage';
import {productImageUrl} from '@/lib/product-image';
import '../editorial.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Jurnal VARTANA | Cerita dan panduan',description:'Cerita VARTANA, catatan tentang bahan, dan panduan memilih racikan.'};
export default async function ArticlesPage(){const {articles,unavailable}=await readPublishedArticles();return <main className="editorial"><EditorialHeader/><section className="catalog-hero"><div><span className="editorial-eyebrow">JURNAL VARTANA</span><h1>Cerita, bahan,<br/>dan hal-hal sehari-hari.</h1><p>Tempat kami berbagi cerita VARTANA, mengenalkan bahan, dan menjawab pertanyaan seputar produk.</p></div><figure><img src="/vartana-spices-hero.jpg" alt="Rempah pilihan dalam cerita VARTANA"/><figcaption>Setiap seduhan punya cerita.</figcaption></figure></section>{unavailable?<p role="status" className="editorial-notice">Artikel belum bisa dimuat. <Link href="/artikel">Coba muat ulang</Link>.</p>:<section className="editorial-grid" aria-label="Daftar artikel">{articles.map(a=><Link key={a.id} href={'/artikel/'+a.slug} className="editorial-card">{a.coverUrl?<div className="editorial-card-image"><ProductImage src={productImageUrl(a.coverUrl)} alt={a.coverAlt} className="h-full w-full"/></div>:<div aria-hidden="true" className="editorial-card-placeholder">V.</div>}<div className="editorial-card-copy"><span className="editorial-eyebrow">{a.category}</span><h2>{a.title}</h2><p>{a.excerpt}</p><span className="editorial-read">Baca artikel <span aria-hidden="true">↗</span></span></div></Link>)}</section>}<footer className="editorial-footer">VARTANA Botanical Wellness · <Link href="/katalog">Lihat katalog</Link></footer></main>;}
