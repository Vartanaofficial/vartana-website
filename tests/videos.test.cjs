const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),crypto=require('crypto'),load=require('./load-ts.cjs');
const {articleVideoEmbed}=load('lib/article-video.ts'),{validateVideoLibrary}=load('lib/videos.ts');
const video=(o={})=>({id:'VID-test-0001',title:'Mengenal VARTANA',url:'https://drive.google.com/file/d/ABCDE12345/view?usp=sharing',caption:'Cerita singkat',details:'Detail video',visible:true,...o});
test('video links accept Google Drive and YouTube share links and reject other hosts',()=>{
 assert.equal(articleVideoEmbed('https://drive.google.com/file/d/ABCDE12345/view?usp=sharing').src,'https://drive.google.com/file/d/ABCDE12345/preview');
 assert.equal(articleVideoEmbed('https://youtu.be/dQw4w9WgXcQ?si=abc').src,'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&playsinline=1&loop=1&playlist=dQw4w9WgXcQ');
 assert.equal(articleVideoEmbed('https://youtube.com/shorts/dQw4w9WgXcQ').poster,'https://i.ytimg.com/vi/dQw4w9WgXcQ/oardefault.jpg');
 assert.equal(articleVideoEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10').provider,'youtube');
 assert.equal(articleVideoEmbed('https://youtube.com/shorts/dQw4w9WgXcQ').provider,'youtube');
 for(const bad of ['https://evil.example/v.mp4','http://drive.google.com/file/d/ABCDE12345/view','javascript:alert(1)',''])assert.equal(articleVideoEmbed(bad),null);
});
test('video library validation requires a title and a recognised link and trims values',()=>{
 assert.equal(validateVideoLibrary({videos:[video({title:'  Judul  '})]}).videos[0].title,'Judul');
 assert.throws(()=>validateVideoLibrary({videos:[video({title:' '})]}),/judul/);
 assert.throws(()=>validateVideoLibrary({videos:[video({url:'https://evil.example/v.mp4'})]}),/link/);
 assert.throws(()=>validateVideoLibrary({videos:[video(),video()]}),/tidak valid/);
 assert.throws(()=>validateVideoLibrary({videos:Array.from({length:51},(_,i)=>video({id:'VID-test-'+i}))}),/maksimal/);
});
function fixture(){
 const sheets={};const makeSheet=()=>{const rows=[];return {rows,setFrozenRows(){},getLastRow:()=>rows.length,getDataRange:()=>({getValues:()=>rows.map(r=>r.slice())}),getRange:(r,c,h=1,w=1)=>({getValues:()=>Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>rows[r+y-1]?.[c+x-1]??'')),setValues:values=>{values.forEach((row,y)=>{while(rows.length<r+y)rows.push([]);row.forEach((v,x)=>rows[r+y-1][c+x-1]=v);});},setValue(){}})};};
 const ss={getSheetByName:n=>sheets[n]||null,insertSheet:n=>(sheets[n]=makeSheet())};const secret='video-test-secret-not-used-outside-tests-000001';
 const c={console,PropertiesService:{getScriptProperties:()=>({getProperty:()=>secret})},Utilities:{computeHmacSha256Signature:(m,k)=>Array.from(crypto.createHmac('sha256',k).update(m).digest(),v=>v>127?v-256:v)},SpreadsheetApp:{getActiveSpreadsheet:()=>ss},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('apps-script/Code.gs','utf8'),c);c.responseJSON=x=>x;
 const sign=data=>{const authTime=String(Date.now());return {...data,authTime,authSignature:crypto.createHmac('sha256',secret).update(data.action+'\n'+authTime+'\n'+JSON.stringify(data.article||null)+'\n'+String(data.expectedUpdatedAt||'')).digest('hex')};};
 return {c,sign,save:(videos,expectedUpdatedAt='')=>c.saveVideoLibrary_(sign({action:'saveVideos',article:{videos},expectedUpdatedAt})),publicRead:()=>c.doGet({internalSecurity:true,parameter:{action:'getVideos'}})};
}
test('Apps Script stores the video library, hides invisible videos from the public and rejects stale or unsigned writes',()=>{
 const f=fixture();
 assert.deepEqual(Array.from(f.publicRead().videos),[]);
 assert.throws(()=>f.c.saveVideoLibrary_({action:'saveVideos',article:{videos:[video()]}}),/Otorisasi/);
 const first=f.save([video(),video({id:'VID-test-0002',title:'Rahasia',visible:false})]);
 assert.equal(first.success,true);assert.equal(first.videos.length,2);
 const pub=f.publicRead();assert.equal(pub.videoVersion,1);assert.deepEqual(Array.from(pub.videos,v=>v.title),['Mengenal VARTANA']);
 assert.equal(f.save([video({title:'Stale'})],'old-revision').success,false);
 assert.equal(f.save([video({url:'https://evil.example/v.mp4'})],first.updatedAt).success,false);
 const second=f.save([video({title:'Judul baru'})],first.updatedAt);assert.equal(second.success,true);
 assert.equal(f.publicRead().videos[0].title,'Judul baru');
});
test('optional TikTok links are validated on the website and stored by Apps Script',()=>{
 const {tiktokLink}=load('lib/videos.ts');
 assert.equal(tiktokLink('https://www.tiktok.com/@vartanabotanical/video/7300000000000000000'),'https://www.tiktok.com/@vartanabotanical/video/7300000000000000000');
 assert.ok(tiktokLink('https://vt.tiktok.com/ZSabc123/'));
 for(const bad of ['https://tiktok.evil.com/x','http://www.tiktok.com/@x','javascript:alert(1)'])assert.equal(tiktokLink(bad),'');
 assert.equal(validateVideoLibrary({videos:[video({tiktokUrl:'https://www.tiktok.com/@vartanabotanical'})]}).videos[0].tiktokUrl,'https://www.tiktok.com/@vartanabotanical');
 assert.equal(validateVideoLibrary({videos:[video()]}).videos[0].tiktokUrl,'');
 assert.throws(()=>validateVideoLibrary({videos:[video({tiktokUrl:'https://evil.example/v'})]}),/TikTok/);
 const f=fixture();
 const saved=f.save([video({tiktokUrl:'https://vt.tiktok.com/ZSabc123/'})]);assert.equal(saved.success,true);assert.equal(saved.videos[0].tiktokUrl,'https://vt.tiktok.com/ZSabc123/');
 assert.equal(f.publicRead().videos[0].tiktokUrl,'https://vt.tiktok.com/ZSabc123/');
 assert.equal(f.save([video({tiktokUrl:'https://tiktok.evil.com/x'})],saved.updatedAt).success,false);
});
