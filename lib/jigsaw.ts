export const JIGSAW_COLUMNS=5;
export const JIGSAW_ROWS=4;
export const JIGSAW_COUNT=20;
export type Placements=(number|null)[];
export const emptyPlacements=():Placements=>Array(JIGSAW_COUNT).fill(null);
export function placePiece(placements:Placements,slot:number,piece:number|null):Placements {
 if(placements.length!==20||!Number.isInteger(slot)||slot<0||slot>=20||(piece!==null&&(!Number.isInteger(piece)||piece<0||piece>=20)))throw new Error('Keping atau tempat puzzle tidak valid.');
 const next=placements.map(value=>piece!==null&&value===piece?null:value);next[slot]=piece;return next;
}
export const jigsawSolved=(placements:Placements)=>placements.length===20&&placements.every((piece,index)=>piece===index);
export function shuffledPieces(){const pieces=Array.from({length:20},(_,i)=>i);for(let i=19;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pieces[i],pieces[j]]=[pieces[j],pieces[i]];}return pieces;}
export function jigsawPath(index:number){
 const row=Math.floor(index/5),col=index%5,right=(r:number,c:number)=>(r+c)%2?1:-1,bottom=(r:number,c:number)=>(r+c)%2?-1:1;
 const signs=[row===0?0:-bottom(row-1,col),col===4?0:right(row,col),row===3?0:bottom(row,col),col===0?0:-right(row,col-1)];
 let path='M 0 0';
 const starts=[[0,0],[100,0],[100,100],[0,100]],directions=[[1,0],[0,1],[-1,0],[0,-1]];
 for(let side=0;side<4;side++){
  const [x,y]=starts[side],[dx,dy]=directions[side],sign=signs[side],point=(t:number,n:number)=>`${x+t*dx-n*dy} ${y+t*dy+n*dx}`;
  if(sign)path+=` L ${point(35,0)} C ${point(45,0)} ${point(30,-18*sign)} ${point(50,-18*sign)} C ${point(70,-18*sign)} ${point(55,0)} ${point(65,0)}`;
  path+=` L ${point(100,0)}`;
 }
 return path+' Z';
}
