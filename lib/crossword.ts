export type CrosswordEntry={answer:string;clue:string};
export type CrosswordWord={number:number;row:number;col:number;direction:'across'|'down';length:number;clue:string};
export type CrosswordChallenge={rows:number;cols:number;cells:{row:number;col:number;answer?:string}[];words:CrosswordWord[]};
export const crosswordThemes=['rempah','pahlawan','umum'] as const;
export const crosswordBanks:Record<string,CrosswordEntry[]>={
 rempah:[{answer:'JAHE',clue:'Rimpang beraroma hangat, sering dipakai untuk wedang.'},{answer:'KUNYIT',clue:'Rimpang yang memberi warna kuning alami pada masakan.'},{answer:'SERAI',clue:'Batang aromatik beraroma mirip lemon.'},{answer:'CENGKEH',clue:'Rempah berupa kuncup bunga kering.'},{answer:'PALA',clue:'Rempah berbiji harum yang juga menghasilkan fuli.'},{answer:'LADA',clue:'Rempah bulat kecil yang memberi rasa pedas.'}],
 pahlawan:[{answer:'KARTINI',clue:'Tokoh emansipasi perempuan dari Jepara.'},{answer:'HATTA',clue:'Wakil presiden pertama Indonesia.'},{answer:'SOEKARNO',clue:'Presiden pertama Indonesia.'},{answer:'DEWANTARA',clue:'Ki Hadjar ... , tokoh pendidikan Indonesia.'},{answer:'PATTIMURA',clue:'Nama perjuangan Thomas Matulessy dari Maluku.'}],
 umum:[{answer:'BUMI',clue:'Planet tempat manusia hidup.'},{answer:'MATAHARI',clue:'Bintang pusat tata surya.'},{answer:'AIR',clue:'Zat cair dengan rumus kimia H2O.'},{answer:'BUKU',clue:'Kumpulan halaman yang dijilid untuk dibaca.'},{answer:'GARUDA',clue:'Burung pada lambang negara Indonesia.'}]
};

// Deterministic layout shared by admin simulation and Apps Script. Answers
// remain server-side in public play; clients receive only cell coordinates.
export function buildCrossword(entries:CrosswordEntry[]):CrosswordChallenge{
 const grid:Record<string,{letter:string;directions:string[]}>={},placed:{entry:CrosswordEntry;row:number;col:number;direction:'across'|'down'}[]=[];
 const key=(r:number,c:number)=>r+':'+c;
 function fits(word:string,row:number,col:number,dir:'across'|'down'){
  const dr=dir==='down'?1:0,dc=dir==='across'?1:0;
  if(row<0||col<0||row+dr*(word.length-1)>=25||col+dc*(word.length-1)>=25||grid[key(row-dr,col-dc)]||grid[key(row+dr*word.length,col+dc*word.length)])return false;
  for(let i=0;i<word.length;i++){const r=row+dr*i,c=col+dc*i,cell=grid[key(r,c)];if(cell){if(cell.letter!==word[i]||cell.directions.includes(dir))return false;}else if(grid[key(r+dc,c+dr)]||grid[key(r-dc,c-dr)])return false;}
  return true;
 }
 for(const entry of [...entries].sort((a,b)=>b.answer.length-a.answer.length)){
  const word=entry.answer;let target:{row:number;col:number;direction:'across'|'down'}|undefined;
  const positions=Object.keys(grid).map(p=>p.split(':').map(Number));let best=Infinity;
  function candidate(row:number,col:number,direction:'across'|'down'){
   if(!fits(word,row,col,direction))return;
   const rs=positions.map(p=>p[0]).concat(row,row+(direction==='down'?word.length-1:0)),cs=positions.map(p=>p[1]).concat(col,col+(direction==='across'?word.length-1:0));
   const height=Math.max(...rs)-Math.min(...rs)+1,width=Math.max(...cs)-Math.min(...cs)+1,score=height*width+Math.abs(width-height)*2;
   if(score<best){best=score;target={row,col,direction};}
  }
  if(!positions.length)target={row:12,col:Math.floor((25-word.length)/2),direction:'across'};
  else{
   for(const pos of Object.keys(grid)){const [r,c]=pos.split(':').map(Number);for(let i=0;i<word.length;i++)if(grid[pos].letter===word[i])for(const dir of ['across','down'] as const)candidate(r-(dir==='down'?i:0),c-(dir==='across'?i:0),dir);}
   if(!target)for(let row=0;row<25;row++)for(let col=0;col<=25-word.length;col++)candidate(row,col,'across');
  }
  if(!target)throw new Error('TTS terlalu padat. Kurangi jumlah atau panjang jawaban.');
  const {row,col,direction}=target;for(let i=0;i<word.length;i++){const k=key(row+(direction==='down'?i:0),col+(direction==='across'?i:0));if(grid[k])grid[k].directions.push(direction);else grid[k]={letter:word[i],directions:[direction]};}
  placed.push({entry,...target});
 }
 const cells=Object.keys(grid).map(k=>{const [row,col]=k.split(':').map(Number);return {row,col,answer:grid[k].letter};}).sort((a,b)=>a.row-b.row||a.col-b.col);
 const minRow=Math.min(...cells.map(c=>c.row)),minCol=Math.min(...cells.map(c=>c.col));
 cells.forEach(c=>{c.row-=minRow;c.col-=minCol;});placed.forEach(p=>{p.row-=minRow;p.col-=minCol;});
 const starts=[...new Set(placed.map(p=>key(p.row,p.col)))].sort((a,b)=>{const [ar,ac]=a.split(':').map(Number),[br,bc]=b.split(':').map(Number);return ar-br||ac-bc;});
 return {rows:Math.max(...cells.map(c=>c.row))+1,cols:Math.max(...cells.map(c=>c.col))+1,cells,words:placed.map(p=>({number:starts.indexOf(key(p.row,p.col))+1,row:p.row,col:p.col,direction:p.direction,length:p.entry.answer.length,clue:p.entry.clue})).sort((a,b)=>a.number-b.number)};
}
