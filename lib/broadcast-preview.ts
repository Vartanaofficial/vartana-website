export type BroadcastMember={row:number;memberId:string;name:string;email:string};
export function broadcastPreview(input:{id:string;subject:string;body:string;imageUrl:string;imageCaption:string;members:BroadcastMember[]}){
  const subject=input.subject.trim(),body=input.body.trim();
  if(!subject||subject.length>160||/[\r\n]/.test(subject))throw Error('Isi subjek email yang valid (maksimal 160 karakter).');
  if(body.length<10||body.length>10000)throw Error('Isi pesan antara 10 dan 10.000 karakter.');
  if(!input.members.length||input.members.length>100)throw Error('Pilih 1 sampai 100 member sebelum meninjau pesan.');
  if(input.imageCaption.trim()&&!input.imageUrl.trim())throw Error('Tambahkan foto sebelum mengisi caption.');
  const seen=new Set<string>();
  const members=input.members.filter(member=>{
    const email=member.email.trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!Number.isInteger(member.row)||member.row<2)throw Error('Ada email member yang tidak valid. Periksa penerima terpilih.');
    const [local,domain]=email.split('@');
    const key=['gmail.com','googlemail.com'].includes(domain)?local.split('+')[0].replace(/\./g,'')+'@gmail.com':email;
    if(seen.has(key))return false;seen.add(key);return true;
  });
  return {
    id:input.id,subject,body,imageUrl:input.imageUrl.trim(),imageCaption:input.imageCaption.trim(),createdAt:new Date().toISOString(),
    memberReferences:members.map(({row,memberId,email})=>({row,memberId,email})),
    recipients:members.map(({name,email,memberId})=>({name,email,memberId,status:'PENDING' as const})),
  };
}
