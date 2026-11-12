const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),load=require('./load-ts.cjs');
const {sameOriginRequest}=load('lib/request-origin.ts');
function route(){const jobs=[],sends=[],mod={exports:{}};let cookie='00000000-0000-0000-0000-000000000123',status='PENDING';
 const result=()=>({success:true,gamesVersion:3,attempt:{id:'GAME-WIN',status:'WON'},voucher:{code:'PUZ-ONE',email:{status}}});
 const imports={'next/server':{after:fn=>jobs.push(fn),NextResponse:{json:(data,init)=>{const r=Response.json(data,init);r.cookies={set(){}};return r;}}},'node:crypto':require('crypto'),'@/lib/request-origin':{sameOriginRequest},'@/lib/games-server':{gamesRequest:async()=>result(),sendGamesRewardEmail:async(...args)=>{sends.push(args);status='SENT';return {success:true};}}};
 const source=ts.transpileModule(fs.readFileSync('app/api/games/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',source)(n=>imports[n],mod,mod.exports);
 async function post(operation,extra={}){const req=new Request('https://www.vartana.id/api/games',{method:'POST',headers:{Origin:'https://www.vartana.id','Content-Type':'application/json'},body:JSON.stringify({game:'numbers',operation,...extra})});req.cookies={get:()=>cookie?{value:cookie}:undefined};return mod.exports.POST(req);}
 return {jobs,sends,post,clearCookie:()=>{cookie='';}};
}
test('winning response schedules email after the response; successful status refresh never queues another delivery',async()=>{const f=route(),r=await f.post('finish');assert.equal(r.status,200);assert.equal(f.sends.length,0);assert.equal(f.jobs.length,1);await f.jobs[0]();assert.deepEqual(f.sends[0],['00000000-0000-0000-0000-000000000123','GAME-WIN']);await f.post('status');assert.equal(f.jobs.length,1);});
test('public resend is rejected and never sends or schedules mail',async()=>{const f=route(),r=await f.post('emailReward',{attemptId:'GAME-WIN',email:'attacker@example.com'});assert.equal(r.status,400);assert.equal(f.sends.length,0);assert.equal(f.jobs.length,0);});

test('old Apps Script deployments are checked before sending an unrecognized email action',async()=>{
 const master=load('lib/master-products.ts'),puzzle=load('lib/puzzle-server.ts'),server=load('lib/games-server.ts'),oldMaster=master.requestMasterScript,oldPuzzle=puzzle.puzzleRequest,oldNow=Date.now;let ready=false,calls=0;
 master.requestMasterScript=async()=>({gamesVersion:3,...(ready?{gameEmailVersion:1}:{})});puzzle.puzzleRequest=async(action,payload)=>{calls++;assert.equal(action,'gamesRewardEmail');assert.equal(payload.resend,false);return {success:true};};
 try{await assert.rejects(server.sendGamesRewardEmail('session','attempt'),/belum diaktifkan/);assert.equal(calls,0);ready=true;const now=oldNow();Date.now=()=>now+301000;await server.sendGamesRewardEmail('session','attempt');assert.equal(calls,1);}finally{master.requestMasterScript=oldMaster;puzzle.puzzleRequest=oldPuzzle;Date.now=oldNow;}
});
