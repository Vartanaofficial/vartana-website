const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),{test}=require('node:test');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {researchTerm,researchQuery,parseResearchPaper,researchDraft}=require('../lib/product-research.ts');
test('research translates local ingredients and neutralizes query operators',()=>{
 assert.equal(researchTerm('Jahe Merah'),'Zingiber officinale');
 const query=researchQuery('Jahe','digestion" OR *');assert.ok(query.includes('PUB_TYPE:"Randomized Controlled Trial"'));assert.ok(!query.includes('" OR *'));assert.ok(query.includes('NOT PUB_TYPE:"Preprint"'));
});
test('citations come from source records and reject unsafe links or withdrawn articles',()=>{
 const paper=parseResearchPaper({id:'123',source:'MED',title:'Ginger &lt;i&gt;trial&lt;/i&gt;',pubYear:'2024'});
 assert.equal(paper.title,'Ginger trial');assert.equal(paper.url,'https://europepmc.org/article/MED/123');
 assert.equal(parseResearchPaper({id:'javascript:alert(1)',source:'MED',title:'test'}),null);
 assert.equal(parseResearchPaper({id:'123',source:'MED',title:'Retraction: trial'}),null);
});
test('draft identifies study areas without inventing a product efficacy claim',()=>{
 assert.equal(researchDraft('Jahe',[]),'');
 const draft=researchDraft('Jahe',[{title:'Ginger trial for nausea'}]);assert.match(draft,/pencernaan/);assert.match(draft,/belum membuktikan/);
});
