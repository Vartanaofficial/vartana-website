const {test}=require('node:test'),assert=require('node:assert/strict');
const {broadcastImageUrl}=require('./load-ts.cjs')('lib/broadcast-image.ts');
test('broadcast image accepts public Drive links and VARTANA images while rejecting arbitrary remote fetches',()=>{
  assert.equal(broadcastImageUrl(''),'');
  assert.equal(broadcastImageUrl('/promo.png'),'https://www.vartana.id/promo.png');
  assert.equal(broadcastImageUrl('https://drive.google.com/file/d/VALID12345/view'),'https://www.vartana.id/api/product-image?fileId=VALID12345');
  for(const input of ['http://www.vartana.id/photo.png','https://localhost/photo.png','https://127.0.0.1/photo.png','https://www.vartana.id.evil.com/photo.png','https://www.vartana.id/api/admin/members','javascript:alert(1)'])assert.throws(()=>broadcastImageUrl(input),input);
});
