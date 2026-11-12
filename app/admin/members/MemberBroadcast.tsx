'use client';
import {useEffect,useRef,useState} from 'react';
import {adminManagement} from '@/lib/admin-management-client';
import {clientId} from '@/lib/client-id';

type Recipient={row:number;memberId:string;name:string;email:string};
type Delivery={email:string;name:string;memberId:string;status:'PENDING'|'SENDING'|'SENT'|'UNKNOWN';error?:string};
type Campaign={id:string;subject:string;body:string;createdAt:string;recipients:Delivery[]};
type History={id:string;subject:string;createdAt:string;total:number;sent:number};
const storageKey='vartana-last-member-broadcast';
const field='mt-2 w-full rounded-xl border border-[#cdd9bd] bg-white p-3 text-sm';

export default function MemberBroadcast({recipients,composeVersion=0}:{recipients:Recipient[];composeVersion?:number}){
  const [subject,setSubject]=useState('');
  const [body,setBody]=useState('');
  const [campaign,setCampaign]=useState<Campaign|null>(null);
  const [history,setHistory]=useState<History[]>([]);
  const [resumeId,setResumeId]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const pending=useRef(false),stop=useRef(false),draftId=useRef('');
  useEffect(()=>{try{setResumeId(localStorage.getItem(storageKey)||'');}catch{}},[]);
  useEffect(()=>{
    if(!composeVersion)return;
    if(pending.current){setMessage('Tunggu pengiriman selesai atau jeda dahulu sebelum menyusun email lain.');return;}
    setCampaign(null);draftId.current='';setMessage('Penerima diperbarui. Susun pesan lalu tinjau sebelum mengirim.');
    setResumeId('');try{localStorage.removeItem(storageKey);}catch{}
  },[composeVersion]);
  const recipientSignature=recipients.map(recipient=>recipient.row+':'+recipient.email).join('|');
  useEffect(()=>{draftId.current='';},[recipientSignature]);
  async function refresh(id=campaign?.id){
    if(!id||pending.current)return;
    pending.current=true;setBusy(true);
    try{const data=await adminManagement({operation:'campaignRead',id});setCampaign(data.campaign);setMessage('Status pengiriman dimuat. Tidak ada email yang dikirim otomatis.');}
    catch(error){setMessage(error instanceof Error?error.message:'Status belum dimuat.');}
    finally{pending.current=false;setBusy(false);}
  }
  async function loadHistory(){
    try{const data=await adminManagement({operation:'campaignList'});setHistory(data.campaigns);}
    catch(error){setMessage(error instanceof Error?error.message:'Riwayat belum dimuat.');}
  }
  async function prepare(){
    if(pending.current||!recipients.length)return;
    pending.current=true;setBusy(true);setMessage('Menyiapkan pratinjau dan memeriksa penerima…');
    draftId.current||=clientId();
    try{
      const data=await adminManagement({operation:'campaignCreate',id:draftId.current,subject,body,members:recipients.map(({row,memberId,email})=>({row,memberId,email}))});
      setCampaign(data.campaign);setResumeId(data.campaign.id);try{localStorage.setItem(storageKey,data.campaign.id);}catch{}
      setMessage('Pratinjau siap. Periksa isi dan penerima, lalu tekan Kirim. Email yang sama digabung menjadi satu penerima.');
    }catch(error){setMessage(error instanceof Error?error.message:'Pratinjau belum siap.');}
    finally{pending.current=false;setBusy(false);}
  }
  async function send(){
    if(pending.current||!campaign)return;
    pending.current=true;stop.current=false;setBusy(true);setMessage('Mengirim email satu per satu. Biarkan halaman ini terbuka.');
    let current=campaign;
    try{
      while(current.recipients.some(recipient=>recipient.status==='PENDING')&&!stop.current){
        const data=await adminManagement({operation:'campaignSend',id:current.id,confirmed:true});
        current=data.campaign;setCampaign(current);
      }
      setMessage(stop.current?'Pengiriman dijeda. Penerima yang tersisa dapat dilanjutkan.':'Proses selesai. Periksa status setiap penerima di bawah.');
    }catch(error){setMessage((error instanceof Error?error.message:'Koneksi terputus.')+' Muat status sebelum melanjutkan. Email dengan status belum pasti tidak dikirim ulang otomatis.');}
    finally{pending.current=false;setBusy(false);}
  }
  const sent=campaign?.recipients.filter(recipient=>recipient.status==='SENT').length||0;
  const remaining=campaign?.recipients.filter(recipient=>recipient.status==='PENDING').length||0;
  return <section id="member-broadcast" className="my-7 scroll-mt-28 rounded-3xl border border-[#ccd8bc] bg-gradient-to-br from-[#f9f7ed] to-[#e7efdd] p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-[#95752e]">EMAIL / VARTANA</p><h2 className="mt-2 font-serif text-3xl">Broadcast member</h2><p className="mt-3 text-sm leading-6">Kirim informasi promo kepada member yang Anda pilih. Setiap penerima mendapat email sendiri dari vartana@vartanaglobal.com.</p></div><button disabled={busy} onClick={()=>void loadHistory()} className="rounded-xl border border-[#bccca8] bg-white px-4 py-2 text-sm">Riwayat broadcast</button></div>
    {resumeId&&!campaign&&<button disabled={busy} onClick={()=>void refresh(resumeId)} className="mt-4 rounded-xl border border-[#b9caa6] bg-white px-4 py-3 text-sm">Buka broadcast terakhir</button>}
    {history.length>0&&<div className="my-4 flex flex-wrap gap-2">{history.map(item=><button key={item.id} disabled={busy} onClick={()=>void refresh(item.id)} className="rounded-xl border bg-white p-3 text-left text-xs"><strong>{item.subject}</strong><small className="mt-1 block">{item.sent}/{item.total} terkirim · {new Date(item.createdAt).toLocaleDateString('id-ID')}</small></button>)}</div>}
    {!campaign?<div className="mt-6 grid gap-5 lg:grid-cols-2">
      <div><p className="mb-4 text-sm font-semibold">{recipients.length} member dipilih</p><label className="text-sm">Subjek email<input className={field} maxLength={160} value={subject} disabled={busy} onChange={event=>{setSubject(event.target.value);draftId.current='';}} placeholder="Contoh: Penawaran khusus koleksi VARTANA"/></label><label className="mt-4 block text-sm">Isi pesan<textarea className={field} rows={7} maxLength={10000} value={body} disabled={busy} onChange={event=>{setBody(event.target.value);draftId.current='';}} placeholder="Tulis informasi promo, periode, dan ketentuan penawaran."/></label><p className="mt-2 text-xs">Sapaan nama dan identitas VARTANA ditambahkan otomatis.</p><button disabled={busy||!recipients.length||!subject.trim()||body.trim().length<10} onClick={()=>void prepare()} className="mt-5 rounded-xl bg-[#214b36] px-5 py-3 text-sm text-white disabled:opacity-40">{busy?'Menyiapkan…':'Tinjau pesan & penerima'}</button></div>
      <div className="rounded-2xl border border-[#d5dec8] bg-white/70 p-5"><h3 className="font-serif text-xl">Penerima terpilih</h3><p className="my-3 text-xs">Tandai member pada tabel di bawah, atau klik Email untuk satu member.</p><ul className="max-h-72 space-y-2 overflow-auto text-sm">{recipients.map(recipient=><li key={recipient.row} className="border-b border-[#e0e7d4] py-2"><strong>{recipient.name}</strong><span className="block text-xs">{recipient.email}</span></li>)}</ul></div>
    </div>:<div className="mt-6 grid gap-5 lg:grid-cols-2">
      <article className="rounded-2xl border border-[#d5dec8] bg-[#fffdf7] p-6"><p className="text-xs tracking-widest text-[#927332]">PRATINJAU EMAIL</p><h3 className="mt-4 font-serif text-2xl">{campaign.subject}</h3><p className="mt-5 text-sm">Halo {campaign.recipients[0]?.name||'Member VARTANA'},</p><p className="my-5 whitespace-pre-wrap text-sm leading-7">{campaign.body}</p><span className="text-sm underline">Belanja di VARTANA →</span><p className="mt-6 border-t pt-4 text-xs">VARTANA Botanical Wellness</p></article>
      <div><strong>{sent} dari {campaign.recipients.length} email terkirim</strong><p className="my-3 text-sm">{remaining} menunggu. Pengiriman hanya berjalan setelah Anda menekan tombol di bawah.</p><div className="mb-4 flex flex-wrap gap-2"><button disabled={busy||!remaining} onClick={()=>void send()} className="rounded-xl bg-[#214b36] px-5 py-3 text-sm text-white disabled:opacity-40">{busy?'Mengirim…':sent?'Lanjutkan pengiriman':'Kirim ke '+campaign.recipients.length+' alamat email'}</button>{busy&&<button onClick={()=>{stop.current=true;}} className="rounded-xl border border-[#b6c8a2] px-4 py-3 text-sm">Jeda setelah email ini</button>}<button disabled={busy} onClick={()=>void refresh()} className="rounded-xl border px-4 py-3 text-sm">Muat status</button><button disabled={busy} onClick={()=>{setCampaign(null);draftId.current='';setMessage('Pilih penerima dan susun pesan baru.');try{localStorage.removeItem(storageKey);}catch{}}} className="px-3 py-3 text-sm underline">Buat broadcast baru</button></div>
      <ul className="max-h-80 space-y-2 overflow-auto text-xs">{campaign.recipients.map(recipient=><li key={recipient.email} className="rounded-xl border border-[#cbd8bc] bg-white p-3"><strong>{recipient.name}</strong><span className="block">{recipient.email}</span><b className="mt-1 block">{recipient.status==='SENT'?'Terkirim':recipient.status==='PENDING'?'Menunggu':recipient.status==='SENDING'?'Sedang dikirim':'Belum dapat dipastikan — periksa email terkirim'}</b>{recipient.error&&<p>{recipient.error}</p>}</li>)}</ul></div>
    </div>}
    {message&&<p role="status" className="mt-5 rounded-xl border border-[#d0dcc0] bg-white/80 p-4 text-sm leading-6">{message}</p>}
  </section>;
}
