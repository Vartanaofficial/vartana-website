const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');

function dock(){
 const positions=[],captures=[],saved=[];let stateIndex=0;
 const react={useState(initial){const index=stateIndex++;return [index===0?true:initial,value=>{if(index===2)positions.push(value);}];},useRef:value=>({current:value}),useEffect(){},useCallback:fn=>fn};
 const jsx={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props}),Fragment:'fragment'};
 const imports={react,'react/jsx-runtime':jsx,'react-dom':{createPortal:x=>x},'@/lib/ambient-soundscape':{},'@/lib/radio-position':require('./load-ts.cjs')('lib/radio-position.ts')};
 const mod={exports:{}};const source=ts.transpileModule(fs.readFileSync('app/components/AmbientMusic.tsx','utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports','window','document','localStorage',source)(n=>imports[n],mod,mod.exports,{innerWidth:1200,innerHeight:800},{body:{}},{setItem:(key,value)=>saved.push(JSON.parse(value))});
 const tree=mod.exports.default({}),node=tree.props.children[0],root={getBoundingClientRect:()=>({left:100,top:100,width:152,height:44}),setPointerCapture:id=>captures.push(id)};
 node.props.ref.current=root;
 const event=(x,y,extra={})=>({isPrimary:true,pointerType:'mouse',button:0,pointerId:7,clientX:x,clientY:y,currentTarget:root,target:{closest(){throw Error('Child capture must not replace root capture');}},preventDefault(){},...extra});
 return {handlers:node.props,event,root,positions,captures,saved};
}
test('holding the radio moves continuously through multiple pointer events and ignores child capture loss',()=>{
 const f=dock();f.handlers.onPointerDown(f.event(110,110));assert.deepEqual(f.captures,[7]);
 f.handlers.onPointerMove(f.event(180,190));f.handlers.onPointerMove(f.event(280,350));
 f.handlers.onLostPointerCapture(f.event(280,350)); // Bubbling from a child must not end the drag.
 f.handlers.onPointerMove(f.event(300,400));
 assert.deepEqual(f.positions,[{x:170,y:180},{x:270,y:340},{x:290,y:390}]);assert.deepEqual(f.captures,[7]);
 f.handlers.onPointerUp();assert.deepEqual(f.saved.at(-1),{x:290,y:390});
 let stopped=false;f.handlers.onClickCapture({detail:1,preventDefault(){stopped=true;},stopPropagation(){}});assert.equal(stopped,true);
 const count=f.positions.length;f.handlers.onPointerMove(f.event(500,600));assert.equal(f.positions.length,count);
});
test('a normal tap still opens the radio and root capture loss ends a drag safely',()=>{
 const f=dock();f.handlers.onPointerDown(f.event(110,110));f.handlers.onPointerMove(f.event(112,112));f.handlers.onPointerUp();assert.equal(f.positions.length,0);
 f.handlers.onClickCapture({detail:1,preventDefault(){throw Error('Tap must remain clickable');},stopPropagation(){}});
 f.handlers.onPointerDown(f.event(110,110));f.handlers.onPointerMove(f.event(130,150));f.handlers.onLostPointerCapture(f.event(130,150,{target:f.root}));const count=f.positions.length;f.handlers.onPointerMove(f.event(230,250));assert.equal(f.positions.length,count);
});
