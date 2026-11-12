import {LocaleScope} from '@/app/components/SiteLanguage';
const principles = [
  {title:'Kenali bahannya',text:'Baca komposisi sebelum memilih racikan. Tanyakan kepada kami jika ada bahan yang belum kamu kenal.'},
  {title:'Pilih kemasan yang sesuai',text:'Periksa jumlah tea bag, berat, dan harga pada varian yang kamu pilih.'},
  {title:'Seduh sesuai petunjuk',text:'Ikuti petunjuk pada produk agar takaran air dan waktu seduhnya sesuai.'},
];

export default function VartanaPurpose(){
  return <LocaleScope><section id="tujuan-vartana" className="mx-auto my-12 max-w-6xl rounded-3xl border border-[#dce2d2] bg-[#f6f3ea] p-6 text-[#173d2b] sm:my-20 sm:p-10">
    <p className="text-xs uppercase tracking-[0.2em] text-[#96752d]">Tujuan VARTANA</p>
    <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Informasi yang membantu kamu memilih.</h2>
    <p className="mt-4 leading-7">Kami ingin kamu tahu apa yang dipilih dan bagaimana menikmatinya.</p>
    <div className="mt-8 grid gap-4 md:grid-cols-3">{principles.map((principle,index)=><div key={principle.title} className="rounded-2xl border border-[#dce2d2] bg-[#fffdf8] p-6"><span className="font-serif text-3xl text-[#96752d]">0{index+1}</span><h3 className="mt-4 font-serif text-xl">{principle.title}</h3><p className="mt-3 text-sm leading-7 text-[#526158]">{principle.text}</p></div>)}</div>
    <p className="mt-8 text-sm leading-7">Ada yang belum jelas? Tim VARTANA bisa membantu sebelum kamu memesan.</p>
  </section></LocaleScope>;
}
