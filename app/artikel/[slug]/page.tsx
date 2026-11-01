import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {readPublishedArticles} from '@/lib/article-server';
import EditorialHeader from '../../components/EditorialHeader';
import ArticleBody from '../../components/ArticleBody';
import CopyArticleLink from '../../components/CopyArticleLink';
import ProductImage from '../../components/ProductImage';
import {productImageUrl} from '@/lib/product-image';
import '../../editorial.css';
type Props={params:Promise<{slug:string}>};
export const dynamic='force-dynamic';
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params,{articles}=await readPublishedArticles(),a=articles.find(a=>a.slug===slug);return a?{title:a.title+' | VARTANA',description:a.excerpt,alternates:{canonical:'https://www.vartana.id/artikel/'+a.slug},openGraph:{title:a.title,description:a.excerpt,type:'article',...(a.coverUrl&&!a.coverUrl.includes('drive.google.com')?{images:[{url:new URL(productImageUrl(a.coverUrl),'https://www.vartana.id').href,alt:a.coverAlt}]}:{})}}:{title:'Artikel VARTANA',robots:{index:false}};}
export default async function ArticlePage({params}:Props){const {slug}=await params,{articles,unavailable}=await readPublishedArticles();if(unavailable)return <main className="editorial"><EditorialHeader/><p className="editorial-notice">Artikel belum bisa dimuat. Coba segarkan halaman sebentar lagi.</p></main>;const a=articles.find(a=>a.slug===slug);if(!a)notFound();return <main className="editorial"><EditorialHeader/><article><header className="article-intro"><Link href="/artikel" className="editorial-back">← Semua artikel</Link><span className="editorial-eyebrow">{a.category}</span><h1>{a.title}</h1><p className="article-summary">{a.excerpt}</p><p className="article-byline">Tim VARTANA{a.updatedAt?' · Diperbarui '+new Date(a.updatedAt).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Jakarta'}):''}</p></header>{a.coverUrl&&<figure className="article-cover"><ProductImage src={productImageUrl(a.coverUrl)} alt={a.coverAlt}/></figure>}<ArticleBody article={a}/><div className="article-ending"><CopyArticleLink slug={a.slug}/><Link href="/katalog" className="editorial-button">Lihat katalog</Link></div></article><section className="article-related"><h2>Bacaan berikutnya</h2>{articles.filter(p=>p.id!==a.id).slice(0,3).map(p=><Link key={p.id} href={'/artikel/'+p.slug}>{p.title} <span aria-hidden="true">↗</span></Link>)}</section><footer className="editorial-footer">VARTANA Botanical Wellness</footer></main>;}
