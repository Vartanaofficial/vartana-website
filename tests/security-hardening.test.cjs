const {test} = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const {fixture} = require('./games-fixture.cjs');
const load = require('./load-ts.cjs');

function signedWire(f, payload, nonce = crypto.randomUUID(), timestamp = String(f.c.Date.now())) {
  const serialized = JSON.stringify(payload).replace(/[\u007f-\uffff]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
  const signature = crypto.createHmac('sha256', 'x'.repeat(40)).update(['VARTANA-RPC-V1', timestamp, nonce, serialized].join('\n')).digest('hex');
  return {...payload, rpcAuth: {version: 1, timestamp, nonce, signature}};
}
function post(f, data) { return f.c.doPost({postData: {contents: JSON.stringify(data)}}); }
function snapshot(f) { return JSON.stringify(Object.fromEntries(Object.entries(f.tables).map(([name, sheet]) => [name, sheet.rows]))); }

test('the previously successful unsigned member update is denied before any side effect', () => {
  const f = fixture(), before = snapshot(f);
  const result = post(f, {action:'saveMember', phone:'081234567890', name:'Unauthorized', email:'other@example.test'});
  assert.equal(result.status, 'error');
  assert.match(result.message, /Otorisasi/);
  assert.equal(snapshot(f), before);
});

test('the previously successful unsigned product deletion is denied and an authorized deletion still works', () => {
  const f = fixture();
  let deletions = 0;
  f.tables.Products = {getLastRow: () => 2, getRange: () => ({getDisplayValues: () => [['FIXTURE-SKU']]}), deleteRow: () => { deletions++; }};
  const result = post(f, {action:'deleteProduct', sku:'FIXTURE-SKU'});
  assert.equal(result.status, 'error');
  assert.equal(deletions, 0);
  assert.equal(f.tables.SecurityNonces, undefined);
  assert.equal(post(f, signedWire(f, {action:'deleteProduct', sku:'FIXTURE-SKU'})).success, true);
  assert.equal(deletions, 1);
});

test('every private action rejects unsigned dispatch including old login and all master/stock/consignment writes', () => {
  const f = fixture(), before = snapshot(f);
  for (const action of ['adminLogin','verifySession','createProduct','updateProduct','deleteProduct','saveIngredient',
    'createPricing','updatePricing','createPromotion','updatePromotion','saveMember','saveInventory','saveRawMaterials',
    'saveProductCosting','setupKonsinyasiSheets','saveKonsinyasiMitra','updateKonsinyasiMitra','saveKonsinyasiProduk',
    'saveKonsinyasiPromo','saveKonsinyasiSO','reviseKonsinyasiSO','deleteKonsinyasiSO','saveKonsinyasiPengiriman',
    'koreksiPenerimaanKonsinyasi','saveKonsinyasiMutasiStok','saveKonsinyasiPenjualanMitra','saveArticle',
    'customerAccount','customerOrderLookup','saveRetailOrderV3','adminRead','adminMembers','adminManagement']) {
    const result = post(f, {action});
    assert.equal(result.status, 'error', action);
    assert.match(result.message, /Otorisasi/, action);
  }
  assert.equal(snapshot(f), before);
});

test('direct GET and POST cannot read HPP, recipes, customer or consignment data', () => {
  const f = fixture(), before = snapshot(f);
  for (const action of ['getProducts','getStoreCatalog','getPricing','getPromotions','getInventory','getRawMaterials',
    'getProductCosting','getAdminData','fetchOrders','getKonsinyasiMitra','getKonsinyasiSO','getKonsinyasiLaporan',
    'getProductStock','getRetailStock','getCheckoutContext','getCatalogTranslations','getArticles']) {
    assert.equal(f.c.doGet({parameter: {action, internalSecurity:'true', internalAdmin:'true'}}).success, false, action);
    assert.equal(post(f, {action, internalSecurity:true, internalAdmin:true}).status, 'error', action);
  }
  assert.equal(snapshot(f), before);
  assert.equal(f.c.doGet({parameter:{action:'getSecurityCapabilities'}}).securityVersion, 1);
});

test('signed reads preserve full internal contracts and Unicode member updates stay authorized', () => {
  const f = fixture();
  assert.ok(Array.isArray(post(f, signedWire(f, {action:'getProducts'})).products));
  const result = post(f, signedWire(f, {action:'saveMember', phone:'081234567890', memberVerifiedEmail:'member@example.com',
    email:'member@example.com', name:'Nama 🌿'}));
  assert.equal(result.success, true);
  assert.equal(f.tables.Members.rows[1][2], 'Nama 🌿');
});

test('tampering, wrong keys, expired/future timestamps and forged markers fail before state changes', () => {
  for (const mutate of [
    data => { data.name = 'tampered'; },
    data => { data.rpcAuth.signature = '0'.repeat(64); },
    data => { data.rpcAuth.timestamp = '1000000000000'; },
    data => { data.rpcAuth.version = 99; },
  ]) {
    const f = fixture(), before = snapshot(f), data = signedWire(f, {action:'saveMember', phone:'081234567890'});
    mutate(data);
    assert.equal(post(f, data).status, 'error');
    assert.equal(snapshot(f), before);
  }
  const f = fixture(), data = signedWire(f, {action:'saveMember'}, undefined, String(f.c.Date.now() + 300001));
  assert.equal(post(f, data).status, 'error');
});

test('replay is rejected across requests sharing persistent Sheets state', () => {
  const f = fixture(), data = signedWire(f, {action:'getProducts'});
  assert.ok(post(f, data).products);
  const before = snapshot(f);
  const result = post(f, data);
  assert.match(result.message, /sudah digunakan/);
  assert.equal(snapshot(f), before);
});

test('fresh transport nonces do not change business fingerprints on an authorized retry', () => {
  const f = fixture(), observed = [];
  f.c.deleteProduct = data => { observed.push(JSON.stringify(data)); return {success:true}; };
  const payload = {action:'deleteProduct', sku:'FIXTURE-SKU', requestId:crypto.randomUUID()};
  assert.equal(post(f, signedWire(f, payload)).success, true);
  assert.equal(post(f, signedWire(f, payload)).success, true);
  assert.equal(observed[0], observed[1]);
  assert.equal(observed[0], JSON.stringify(payload));
});

test('real Node transport interoperates with the guarded Apps Script dispatcher and legacy inner proofs', async () => {
  const f = fixture(), originalKey = process.env.ADMIN_SESSION_SECRET, originalUrl = process.env.GOOGLE_SCRIPT_URL;
  process.env.ADMIN_SESSION_SECRET = 'x'.repeat(40);
  process.env.GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/test/exec';
  const transport = load('lib/google-fetch.ts'), originalFetch = transport.fetchGoogle;
  f.c.Date.now = Date.now;
  transport.fetchGoogle = async (_url, init) => Response.json(f.c.doPost({postData:{contents:init.body}}));
  try {
    const {requestMasterScript} = load('lib/master-products.ts');
    const {puzzleRequest} = load('lib/puzzle-server.ts');
    assert.ok(Array.isArray((await requestMasterScript('getProducts')).products));
    assert.equal((await puzzleRequest('adminManagement', {operation:'campaignCapabilities'})).broadcastImageVersion, 1);
    f.c.publicArticleTranslations_ = () => ({success:true,publicTranslationVersion:1,translations:{}});
    assert.equal((await requestMasterScript('getPublicContentTranslations', undefined, {legacyGet:true})).publicTranslationVersion, 1);
  } finally {
    transport.fetchGoogle = originalFetch;
    if (originalKey === undefined) delete process.env.ADMIN_SESSION_SECRET; else process.env.ADMIN_SESSION_SECRET = originalKey;
    if (originalUrl === undefined) delete process.env.GOOGLE_SCRIPT_URL; else process.env.GOOGLE_SCRIPT_URL = originalUrl;
  }
});

test('persistent rate buckets block at the limit, survive subsequent RPCs and expire', () => {
  const f = fixture(), key = 'a'.repeat(64), payload = {action:'securityRateLimit', buckets:[{key, limit:2, windowMs:60000}]};
  assert.equal(post(f, signedWire(f, payload)).allowed, true);
  assert.equal(post(f, signedWire(f, payload)).allowed, true);
  const denied = post(f, signedWire(f, payload));
  assert.equal(denied.allowed, false);
  assert.equal(denied.retryAfter, 60);
  f.advance(60001);
  assert.equal(post(f, signedWire(f, payload)).allowed, true);
});

test('expired nonce cleanup never removes an active replay marker', () => {
  const f = fixture(), data = signedWire(f, {action:'getProducts'});
  post(f, data);
  const rows = f.tables.SecurityNonces.rows;
  for (let i = 0; i < 1001; i++) rows.push(['expired-' + i, new Date(f.c.Date.now() - 1)]);
  post(f, signedWire(f, {action:'getProducts'}));
  assert.equal(rows.length, 3);
  assert.match(post(f, data).message, /sudah digunakan/);
});

test('guest checkout cannot replace an existing member even through a signed request', () => {
  const f = fixture(), before = JSON.stringify(f.tables.Members.rows);
  assert.equal(post(f, signedWire(f, {action:'saveMember', phone:'081234567890', createOnly:true,
    email:'other@example.test', name:'Other person'})).success, true);
  assert.equal(JSON.stringify(f.tables.Members.rows), before);
  assert.equal(post(f, signedWire(f, {action:'saveMember', phone:'081234567890', memberVerifiedEmail:'other@example.test',
    email:'other@example.test'})).status, 'error');
  assert.equal(JSON.stringify(f.tables.Members.rows), before);
});

test('all existing direct Apps Script HTTP callers use the signed transport', () => {
  const files = ['app/api/admin/products/route.ts','app/api/admin/ingredients/route.ts','app/api/konsinyasi/route.ts',
    ...fs.readdirSync('app/api/konsinyasi', {withFileTypes:true}).filter(x => x.isDirectory()).map(x => 'app/api/konsinyasi/' + x.name + '/route.ts')];
  for (const file of files) if (fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes('fetch(')) {
    assert.match(fs.readFileSync(file, 'utf8'), /import \{fetchScript as fetch\}/, file);
  }
});

test('development login quotas work locally while production backend failures fail closed', async () => {
  const {checkRateLimit, rateBucket} = load('lib/security-rate-limit.ts');
  const original = process.env.NODE_ENV, oldKey = process.env.ADMIN_SESSION_SECRET;
  process.env.ADMIN_SESSION_SECRET = 'x'.repeat(40);
  process.env.NODE_ENV = 'development';
  try {
    const buckets = [rateBucket('local-unit-test', crypto.randomUUID(), 1, 60000)];
    assert.equal((await checkRateLimit(buckets)).allowed, true);
    assert.equal((await checkRateLimit(buckets)).allowed, false);
    const backend = load('lib/master-products.ts');
    const originalRequest = backend.requestMasterScript;
    process.env.NODE_ENV = 'production';
    backend.requestMasterScript = async () => { throw new Error('Backend unavailable'); };
    try { await assert.rejects(checkRateLimit(buckets), /Backend unavailable/); }
    finally { backend.requestMasterScript = originalRequest; }
  } finally {
    if (original === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = original;
    if (oldKey === undefined) delete process.env.ADMIN_SESSION_SECRET; else process.env.ADMIN_SESSION_SECRET = oldKey;
  }
});

test('admin login accepts the real credential verifier, creates a valid session and throttles brute force', async () => {
  const ts = require('typescript');
  const saved = {NODE_ENV:process.env.NODE_ENV, ADMIN_USERNAME:process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD:process.env.ADMIN_PASSWORD, ADMIN_SESSION_SECRET:process.env.ADMIN_SESSION_SECRET};
  process.env.NODE_ENV = 'development';
  process.env.ADMIN_USERNAME = 'security-test-' + crypto.randomUUID();
  process.env.ADMIN_PASSWORD = 'local-test-password';
  process.env.ADMIN_SESSION_SECRET = 'x'.repeat(40);
  const auth = load('lib/admin-auth.ts'), limiter = load('lib/security-rate-limit.ts');
  const compiledModule = {exports:{}};
  let session;
  const imports = {
    'next/server': {NextResponse:{json(value, init) {
      const response = Response.json(value, init);
      response.cookies = {set(_name, token) { session = token; }};
      return response;
    }}},
    '@/lib/admin-auth':auth, '@/lib/security-rate-limit':limiter,
  };
  const compiled = ts.transpileModule(fs.readFileSync('app/api/admin/auth/login/route.ts','utf8'),
    {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  new Function('require','exports','module',compiled)(name=>imports[name],compiledModule.exports,compiledModule);
  const request = password => new Request('http://localhost/api/admin/auth/login', {method:'POST',
    headers:{'Content-Type':'application/json','x-nf-client-connection-ip':crypto.randomUUID()},
    body:JSON.stringify({username:process.env.ADMIN_USERNAME,password})});
  try {
    assert.equal((await compiledModule.exports.POST(request('wrong'))).status, 401);
    const accepted = await compiledModule.exports.POST(request(process.env.ADMIN_PASSWORD));
    assert.equal(accepted.status, 200);
    assert.equal(auth.verifyAdminSessionToken(session,process.env.ADMIN_SESSION_SECRET), true);
    for (let i=0;i<8;i++) assert.equal((await compiledModule.exports.POST(request('wrong'))).status, 401);
    session = undefined;
    const blocked = await compiledModule.exports.POST(request(process.env.ADMIN_PASSWORD));
    assert.equal(blocked.status, 429);
    assert.ok(Number(blocked.headers.get('Retry-After'))>0);
    assert.equal(session, undefined);
  } finally {
    for (const [name,value] of Object.entries(saved)) {
      if (value===undefined) delete process.env[name]; else process.env[name]=value;
    }
  }
});
