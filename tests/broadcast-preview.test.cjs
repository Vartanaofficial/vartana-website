const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const load=require('./load-ts.cjs');
const {broadcastPreview}=load('lib/broadcast-preview.ts');
const id='00000000-0000-0000-0000-000000000003';
const member={row:2,memberId:'VRT-1',name:'Ayu',email:'ayu@example.com'};

test('local review deduplicates recipients and snapshots the exact message without a backend request',()=>{
  const members=[member,{...member,row:3,memberId:'VRT-2',email:'AYU@example.com'}];
  const preview=broadcastPreview({id,subject:' Promo ',body:' Pesan promo VARTANA. ',imageUrl:'',imageCaption:'',members});
  assert.equal(preview.subject,'Promo');assert.equal(preview.body,'Pesan promo VARTANA.');
  assert.equal(preview.recipients.length,1);assert.equal(preview.memberReferences.length,1);
  members[0]={...member,email:'other@example.com'};
  assert.equal(preview.recipients[0].email,'ayu@example.com');
  assert.throws(()=>broadcastPreview({id,subject:'',body:'Pesan lengkap',imageUrl:'',imageCaption:'',members:[member]}));
});

test('preview immediately exposes Send broadcast; only clicking it creates and sends the reviewed campaign',async()=>{
  const state=['Promo','Pesan promo VARTANA.','',''],calls=[];let cursor=0;
  const react={useState(value){const index=cursor++;if(!(index in state))state[index]=typeof value==='function'?value():value;return [state[index],next=>{state[index]=typeof next==='function'?next(state[index]):next;}];},useRef:value=>({current:value}),useEffect(){}};
  const imports={react,'react/jsx-runtime':require('react/jsx-runtime'),'@/app/components/SiteLanguage':{LocaleScope:'scope'},'@/lib/admin-management-client':{adminManagement:async payload=>{calls.push(payload);const preview=state[4];return {success:true,campaign:payload.operation==='campaignSend'?{...preview,recipients:preview.recipients.map(recipient=>({...recipient,status:'SENT'}))}:preview};}},'@/lib/client-id':{clientId:()=>id},'@/app/components/ProductImage':{default:()=>null},'@/lib/product-image':load('lib/product-image.ts'),'@/lib/broadcast-image':load('lib/broadcast-image.ts'),'@/lib/broadcast-preview':{broadcastPreview}};
  const source=ts.transpileModule(fs.readFileSync('app/admin/members/MemberBroadcast.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  const mod={exports:{}};
  new Function('require','module','exports','requestAnimationFrame','document','localStorage',source)(name=>imports[name],mod,mod.exports,callback=>callback(),{getElementById:()=>null},{setItem(){}});
  const text=node=>typeof node==='string'?node:Array.isArray(node)?node.map(text).join(''):node?.props?text(node.props.children):'';
  function nodes(node,result=[]){if(Array.isArray(node))node.forEach(child=>nodes(child,result));else if(node?.props){result.push(node);nodes(node.props.children,result);}return result;}
  function render(){cursor=0;return mod.exports.default({recipients:[member]});}
  let tree=render();const previewButton=nodes(tree).find(node=>node.type==='button'&&text(node)==='Lihat pratinjau →');
  assert.ok(previewButton);assert.equal(calls.length,0);previewButton.props.onClick();
  assert.equal(calls.length,0);tree=render();
  const sendButton=nodes(tree).find(node=>node.type==='button'&&text(node).startsWith('Kirim broadcast ·'));
  assert.ok(sendButton);assert.equal(sendButton.props.disabled,false);
  sendButton.props.onClick();await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(calls.map(call=>call.operation),['campaignCreate','campaignSend']);
  assert.equal(calls[0].body,'Pesan promo VARTANA.');assert.equal(calls[1].confirmed,true);
});
