import {productImageUrl} from './product-image';

export function broadcastImageUrl(raw:unknown):string{
  if(raw===undefined||raw==='')return '';
  if(typeof raw!=='string'||raw.length>2000)throw Error('Link foto promo tidak valid.');
  const converted=productImageUrl(raw);
  if(!converted)throw Error('Gunakan link foto Google Drive atau foto dari website VARTANA.');
  const url=new URL(converted,'https://www.vartana.id');
  if(url.protocol!=='https:'||url.port||url.username||url.password||!['www.vartana.id','vartana.id'].includes(url.hostname)||
    !(url.pathname==='/api/product-image'&&url.searchParams.has('fileId')||/\.(png|jpe?g|gif)$/i.test(url.pathname)))throw Error('Gunakan link foto Google Drive atau foto JPG/PNG/GIF dari website VARTANA.');
  url.hostname='www.vartana.id';return url.toString();
}
