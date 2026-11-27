import {LocaleScope} from '@/app/components/SiteLanguage';
import type {Article, ArticleBlock} from '@/lib/articles';
import ProductImage from './ProductImage';
import {productImageUrl} from '@/lib/product-image';

function Block({b}: {b: ArticleBlock}) {
  if (b.type === 'heading') return <h2>{b.text}</h2>;
  if (b.type === 'image') return <figure><ProductImage src={productImageUrl(b.url)} alt={b.alt || ''}/>{b.caption && <figcaption>{b.caption}</figcaption>}</figure>;
  return <p>{b.text}</p>;
}

// "flow": the usual single reading column.
// "sections": opening paragraphs as a wide lead, then every subheading with its text as a card
// in a two-column grid, so a short story page fills the width instead of leaving empty margins.
export default function ArticleBody({article, layout = 'flow'}: {article: Article; layout?: 'flow' | 'sections'}) {
  if (layout === 'flow') return <LocaleScope><div className="article-body">{article.blocks.map((b, i) => <Block key={i} b={b}/>)}</div></LocaleScope>;
  const lead: ArticleBlock[] = [];
  const sections: {heading: ArticleBlock; blocks: ArticleBlock[]}[] = [];
  for (const b of article.blocks) {
    if (b.type === 'heading') sections.push({heading: b, blocks: []});
    else if (sections.length) sections[sections.length - 1].blocks.push(b);
    else lead.push(b);
  }
  return <LocaleScope><div className="article-body is-sections">
    {lead.length > 0 && <div className="article-lead">{lead.map((b, i) => <Block key={i} b={b}/>)}</div>}
    {sections.length > 0 && <div className="article-section-grid">
      {sections.map((s, i) => <section key={i} className="article-section-card">
        <Block b={s.heading}/>
        {s.blocks.map((b, j) => <Block key={j} b={b}/>)}
      </section>)}
    </div>}
  </div></LocaleScope>;
}
