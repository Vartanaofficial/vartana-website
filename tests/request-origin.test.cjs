const {test}=require('node:test');
const assert=require('node:assert/strict');
const {sameOriginRequest}=require('./load-ts.cjs')('lib/request-origin.ts');

test('Netlify forwarded public origin is accepted while foreign or missing origins are rejected',()=>{
  const request=origin=>new Request('http://localhost:3000/api/admin/manage',{headers:{host:'internal.netlify', 'x-forwarded-host':'www.vartana.id','x-forwarded-proto':'https',...(origin?{origin}:{})}});
  assert.equal(sameOriginRequest(request('https://www.vartana.id')),true);
  assert.equal(sameOriginRequest(request('https://attacker.example')),false);
  assert.equal(sameOriginRequest(request()),false);
});
