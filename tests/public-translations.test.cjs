const {test}=require('node:test'),assert=require('node:assert/strict');
const {fixture}=require('./games-fixture.cjs');

test('editorial translation reads published text only, caches it, and never accepts customer input',()=>{
  const f=fixture(),calls=[];
  f.c.readArticles_=()=>[
    {status:'PUBLISHED',title:'Judul publik',excerpt:'Ringkasan publik',category:'Cerita',blocks:[{text:'Paragraf publik'}]},
    {status:'DRAFT',title:'Draf rahasia',blocks:[{text:'Bukan untuk publik'}]},
  ];
  f.c.catalogTranslateText_=text=>{calls.push(text);return 'English: '+text;};
  const result=f.c.publicArticleTranslations_();
  assert.equal(result.publicTranslationVersion,1);
  assert.equal(result.translations['Judul publik'],'English: Judul publik');
  assert.ok(!calls.includes('Draf rahasia'));assert.ok(!calls.includes('member@example.com'));
  const count=calls.length;f.c.publicArticleTranslations_();assert.equal(calls.length,count);
  assert.equal(f.tables.Orders.rows.length,1);
});
