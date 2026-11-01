import type {Article} from '@/lib/articles';
import ProductImage from './ProductImage';
import {productImageUrl} from '@/lib/product-image';
export default function ArticleBody({article}:{article:Article}){return <div className="article-body">{article.blocks.map((b,i)=>b.type==='heading'?<h2 key={i}>{b.text}</h2>:b.type==='image'?<figure key={i}><ProductImage src={productImageUrl(b.url)} alt={b.alt||''}/>{b.caption&&<figcaption>{b.caption}</figcaption>}</figure>:<p key={i}>{b.text}</p>)}</div>;}
