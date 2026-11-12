import {LocaleScope} from '@/app/components/SiteLanguage';
export function BotanicalSprig({ className = "" }: { className?: string }) {
  return <LocaleScope><svg aria-hidden="true" viewBox="0 0 200 340" fill="none" className={className}>
    <path d="M88 329C110 254 83 172 121 29" stroke="currentColor" strokeWidth="1.2"/>
    {[0,1,2,3,4].map(i=><g key={i} transform={`translate(${i*3} ${i*52})`}><path d="M112 48C55 24 35 45 96 95C111 80 115 62 112 48Z" fill="currentColor" fillOpacity=".10" stroke="currentColor" strokeWidth=".7"/><path d="M106 72C158 22 184 54 113 121C103 105 101 87 106 72Z" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth=".7"/></g>)}
  </svg></LocaleScope>;
}

export function CheckoutProgress({ step }: { step: number }) {
  const labels = ["Pilihan produk", "Pengiriman & promo", "Pembayaran"];
  return <LocaleScope><nav aria-label="Tahap checkout" className="checkout-progress"><div className="checkout-progress-track"><span style={{ width: `${step*50}%` }}/></div><ol>{labels.map((label,index)=><li key={label} className={index<step?"is-complete":index===step?"is-current":""} aria-current={index===step?"step":undefined}><span className="checkout-step-number">{index<step?"✓":`0${index+1}`}</span><span>{label}</span></li>)}</ol></nav></LocaleScope>;
}
