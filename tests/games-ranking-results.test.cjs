const {test}=require('node:test'),assert=require('node:assert/strict'),{fixture,session}=require('./games-fixture.cjs');
const id=n=>'00000000-0000-0000-0000-'+String(n).padStart(12,'0');
test('arithmetic ranks correct answers before speed and exposes counts without revealing answers',()=>{
 const f=fixture(),call=(operation,extra={})=>f.c.gamesHandle_(f.signed('games',{operation,game:'numbers',session,...extra}));
 function play(n,right,ms){const a=call('start',{requestId:id(n),name:'Player '+n,phone:'08123456'+String(n).padStart(4,'0'),email:'player'+n+'@example.com'});const stored=JSON.parse(f.tables.GameAttempts.rows.at(-1)[14]);f.advance(ms);return call('finish',{attemptId:a.attempt.id,answers:stored.questions.map((q,i)=>i<right?q.answer:9999)});}
 play(100,7,1000);play(101,9,5000);const winner=play(102,10,6000);assert.deepEqual(Array.from(winner.leaderboard.entries,e=>e.correctAnswers),[10,9,7]);assert.ok(winner.leaderboard.entries.every(e=>e.totalAnswers===10));assert.ok(!JSON.stringify(winner.leaderboard).includes('"answer":'));assert.equal(winner.attempt.correctAnswers,10);
 const headers=f.tables.GameAttempts.rows[0],row=f.tables.GameAttempts.rows[2];assert.equal(row[headers.indexOf('Correct Answers')],9);assert.equal(row[headers.indexOf('Total Answers')],10);
});
test('TTS counts complete correct words, persists partial results at expiry, and awards only fully correct boards',()=>{
 const f=fixture(),call=(operation,extra={})=>f.c.gamesHandle_(f.signed('games',{operation,game:'crossword',session,...extra}));
 const a=call('start',{requestId:id(120),name:'Ayu',phone:'081234567890',email:'ayu@example.com'}),stored=JSON.parse(f.tables.GameAttempts.rows.at(-1)[14]);
 const word=stored.crossword.words[0],answers=stored.crossword.cells.map(c=>{for(let i=0;i<word.length;i++)if(c.row===word.row+(word.direction==='down'?i:0)&&c.col===word.col+(word.direction==='across'?i:0))return c.answer;return 'Z';});
 f.advance(1000);const partial=call('finish',{attemptId:a.attempt.id,answers});assert.equal(partial.attempt.status,'STARTED');assert.equal(partial.voucher,null);assert.ok(partial.attempt.correctAnswers>=1);assert.ok(partial.attempt.correctAnswers<partial.attempt.totalAnswers);assert.equal(partial.attempt.totalAnswers,stored.crossword.words.length);
 f.advance(120000);const expired=call('status');assert.equal(expired.attempt.status,'EXPIRED');assert.equal(expired.voucher,null);assert.equal(expired.leaderboard.entries[0].correctAnswers,partial.attempt.correctAnswers);assert.equal(expired.leaderboard.entries[0].totalAnswers,stored.crossword.words.length);
 const late=call('finish',{attemptId:a.attempt.id,answers:stored.crossword.cells.map(c=>c.answer)});assert.equal(late.attempt.correctAnswers,partial.attempt.correctAnswers);assert.equal(late.leaderboard.entries[0].correctAnswers,partial.attempt.correctAnswers);assert.equal(late.voucher,null);
 const b=call('start',{requestId:id(121),name:'Ayu',phone:'081234567890',email:'ayu@example.com'}),next=JSON.parse(f.tables.GameAttempts.rows.at(-1)[14]);f.advance(2000);const won=call('finish',{attemptId:b.attempt.id,answers:next.crossword.cells.map(c=>c.answer)});assert.equal(won.attempt.status,'WON');assert.equal(won.leaderboard.entries.length,1);assert.equal(won.leaderboard.entries[0].correctAnswers,next.crossword.words.length);assert.ok(won.voucher);
});
test('each game saves its own pasted image link and preserves the image snapshot of an existing attempt',()=>{
 const f=fixture();for(const [n,game] of ['puzzle','numbers','crossword'].entries()){
  const settings=f.c.gamesSettings_(f.c.gamesSheets_().settings,game),url='https://drive.google.com/file/d/game-photo-'+game+'/view';
  const result=f.c.gamesAdminHandle_(f.signed('gamesAdmin',{operation:'saveSettings',game,requestId:id(130+n),expectedRevision:1,settings:{...settings,imageUrl:url,imageAlt:'Photo '+game}}));assert.equal(result.settings.imageUrl,url);
  const active=f.c.gamesHandle_(f.signed('games',{operation:'start',game,session,requestId:id(140+n),name:'Ayu',phone:'081234567890',email:'ayu@example.com'}));assert.equal(active.attempt.settings.imageUrl,url);
  f.c.gamesAdminHandle_(f.signed('gamesAdmin',{operation:'saveSettings',game,requestId:id(150+n),expectedRevision:2,settings:{...result.settings,imageUrl:'https://example.com/new.jpg'}}));
  const status=f.c.gamesHandle_(f.signed('games',{operation:'status',game,session}));assert.equal(status.settings.imageUrl,'https://example.com/new.jpg');assert.equal(status.attempt.settings.imageUrl,url);
 }
});
