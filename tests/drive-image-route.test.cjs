const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const load=require('./load-ts.cjs');

test('different Drive IDs have different path URLs and old proxy links upgrade to the same canonical path',()=>{
  const {productImageUrl}=load('lib/product-image.ts');
  const a=productImageUrl('https://drive.google.com/file/d/IMAGE_A_123/view'),b=productImageUrl('https://drive.google.com/file/d/IMAGE_B_456/view');
  assert.notEqual(new URL(a,'https://www.vartana.id').pathname,new URL(b,'https://www.vartana.id').pathname);
  assert.equal(productImageUrl('/api/product-image?fileId=IMAGE_A_123'),a);
  assert.equal(productImageUrl('https://www.vartana.id/api/product-image?fileId=IMAGE_A_123'),a);
});

test('Drive proxy keeps image bytes separate and disables query-blind shared caches',async()=>{
  const requested=[],mod={exports:{}};
  const source=ts.transpileModule(fs.readFileSync('app/api/product-image/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function('require','module','exports',source)(name=>name==='next/server'?{NextResponse:{json:(value,init)=>Response.json(value,init)}}:{fetchGoogle:async url=>{const id=new URL(url).searchParams.get('id');requested.push(id);return new Response(id,{headers:{'Content-Type':'image/png'}});}},mod,mod.exports);
  for(const id of ['IMAGE_A_123','IMAGE_B_456']){
    const response=await mod.exports.GET(new Request('https://www.vartana.id/api/product-image?fileId='+id));
    assert.equal(await response.text(),id);
    assert.equal(response.headers.get('Netlify-CDN-Cache-Control'),'no-store');
    assert.equal(response.headers.get('CDN-Cache-Control'),'no-store');
    assert.equal(response.headers.get('Cache-Control'),'private, no-store');
  }
  assert.deepEqual(requested,['IMAGE_A_123','IMAGE_B_456']);
});
