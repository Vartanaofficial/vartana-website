const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const load=require('./load-ts.cjs');
const language=load('lib/site-language.ts');
const compiled=ts.transpileModule(fs.readFileSync('app/components/SiteLanguage.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
const moduleValue={exports:{}};
new Function('require','exports','module',compiled)(name=>name==='@/lib/site-language'?language:require(name),moduleValue.exports,moduleValue);
const {SiteLanguageProvider,LocaleScope}=moduleValue.exports;
function render(lang,children){return renderToStaticMarkup(React.createElement(SiteLanguageProvider,{initialLanguage:lang},React.createElement(LocaleScope,null,children)));}

test('shared language scope translates rendered content and accessibility labels without changing URLs or form values',()=>{
  const html=render('en',React.createElement('section',null,
    React.createElement('a',{href:'/katalog?sku=JAHE','aria-label':'Belanja'},'Belanja'),
    React.createElement('input',{value:'Kenali bahannya',placeholder:'Nama lengkap',readOnly:true}),
    React.createElement('p',null,'Tersedia 5 kemasan')));
  assert.ok(html.includes('>Shop</a>'));
  assert.ok(html.includes('aria-label="Shop"'));
  assert.ok(html.includes('href="/katalog?sku=JAHE"'));
  assert.ok(html.includes('value="Kenali bahannya"'));
  assert.ok(html.includes('placeholder="Full name"'));
  assert.ok(html.includes('5 packs available'));
});

test('Indonesian mode, editable content and explicitly protected personal content remain untouched',()=>{
  assert.ok(render('id',React.createElement('h1',null,'Belanja')).includes('Belanja'));
  const html=render('en',React.createElement('div',null,
    React.createElement('p',{'data-no-translate':true},'Kenali bahannya'),
    React.createElement('textarea',{defaultValue:'Kenali bahannya'}),
    React.createElement('code',null,'Belanja')));
  assert.ok(html.includes('Kenali bahannya'));
  assert.ok(html.includes('<textarea>Kenali bahannya</textarea>'));
  assert.ok(html.includes('<code>Belanja</code>'));
  for(const text of ['VRT-123','PUZ-ABC123','member@example.com','Jl. Melati No. 2'])assert.equal(language.translateSiteText(text,'en'),text);
  for(const text of ['constructor','toString','__proto__'])assert.equal(language.translateSiteText(text,'en'),text);
});

test('published custom editorial translations supplement the built-in dictionary',()=>{
  assert.equal(language.translateSiteText('Artikel baru','en',{'Artikel baru':'New article'}),'New article');
  assert.equal(language.translateSiteText('Artikel baru','id',{'Artikel baru':'New article'}),'Artikel baru');
});

test('all current starter articles translate in full, including paragraphs rather than only headings',()=>{
  for(const article of load('lib/articles.ts').starterArticles){
    for(const text of [article.title,article.excerpt,...article.blocks.filter(block=>block.text).map(block=>block.text)]){
      assert.notEqual(language.translateSiteText(text,'en'),text,text);
    }
  }
});

test('language preference accepts only supported languages and dynamic voucher messages preserve codes',()=>{
  assert.equal(language.validSiteLanguage('en'),'en');
  for(const value of [null,'EN','fr',''])assert.equal(language.validSiteLanguage(value),'id');
  assert.equal(language.translateSiteText('Voucher PUZ-ABC sudah diterapkan otomatis pada pesanan Anda.','en'),'Voucher PUZ-ABC has been applied automatically to your order.');
});
