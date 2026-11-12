const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const load=require('./load-ts.cjs');
const navigation=load('lib/section-navigation.ts');

test('section navigation handles same-page anchors without intercepting route changes or unrelated links',()=>{
  assert.equal(navigation.samePageSection('/#philosophy','https://www.vartana.id/').id,'philosophy');
  assert.equal(navigation.samePageSection('#science','https://www.vartana.id/').id,'science');
  for(const href of ['/katalog','#','https://evil.example/#philosophy','/?track=1#science','#%ZZ'])assert.equal(navigation.samePageSection(href,'https://www.vartana.id/'),null);
  assert.equal(navigation.sectionScrollTop(600,100,90),590);
  assert.equal(navigation.sectionScrollTop(0,0,90),0);
});

test('Filosofi links explicitly scroll below the shared header after navigation, with reduced-motion support',()=>{
  for(const reduced of [false,true]){
    const listeners={},scrolls=[],cleanups=[];
    const location={href:'https://www.vartana.id/#philosophy'};
    const window={scrollY:100,matchMedia:()=>({matches:reduced}),scrollTo:value=>scrolls.push(value),addEventListener:(name,handler)=>{listeners[name]=handler;},removeEventListener(){},dispatchEvent:event=>listeners[event.type]?.(event)};
    class Element{constructor(anchor){this.anchor=anchor;}closest(){return this.anchor;}}
    const document={getElementById:id=>id==='philosophy'?{getBoundingClientRect:()=>({top:600})}:null,querySelector:()=>({getBoundingClientRect:()=>({height:90})}),addEventListener:(name,handler,capture)=>{assert.equal(capture,true);listeners[name]=handler;},removeEventListener(){}};
    const imports={react:{useEffect:callback=>cleanups.push(callback())},'next/navigation':{usePathname:()=> '/'},'./SiteLanguage':{useSiteLanguage:()=>({ready:true,language:'id'})},'@/lib/section-navigation':navigation};
    const source=ts.transpileModule(fs.readFileSync('app/components/SectionNavigation.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,mod={exports:{}};
    new Function('require','module','exports','window','document','location','history','requestAnimationFrame','cancelAnimationFrame','Element','HashChangeEvent',source)(name=>imports[name],mod,mod.exports,window,document,location,{pushState(_state,_title,url){location.href=new URL(url,location.href).href;}},callback=>{callback();return 1;},()=>{},Element,class{constructor(type){this.type=type;}});
    mod.exports.default();assert.equal(scrolls[0].top,590);assert.equal(scrolls[0].behavior,'instant');
    let prevented=false;listeners.click({target:new Element({href:'https://www.vartana.id/#philosophy',target:'',hasAttribute:()=>false}),button:0,preventDefault(){prevented=true;}});
    assert.equal(prevented,true);assert.equal(scrolls.at(-1).behavior,reduced?'instant':'smooth');
    prevented=false;listeners.click({target:new Element({href:'https://www.vartana.id/katalog',target:'',hasAttribute:()=>false}),button:0,preventDefault(){prevented=true;}});assert.equal(prevented,false);
    cleanups.forEach(cleanup=>cleanup?.());
  }
});
