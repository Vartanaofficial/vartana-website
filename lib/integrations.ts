export type IntegrationId = 'bank_transfer' | 'qris' | 'doku' | 'midtrans' | 'ipaymu' | 'legacy_shipping' | 'kiriminaja';
export type IntegrationSetting = {
  id: IntegrationId;
  enabled: boolean;
  environment: 'sandbox' | 'production';
  label: string;
  originId: string;
};
export type IntegrationDocument = {revision: string; settings: IntegrationSetting[]};
export type PaymentChoice = {id: 'bank_transfer' | 'qris' | 'doku' | 'midtrans'; label: string};

export const integrationProviders = [
  {id:'bank_transfer', category:'payment', name:'Transfer BCA', description:'Pembayaran transfer dengan konfirmasi tim VARTANA.', supported:true, variables:[]},
  {id:'qris', category:'payment', name:'QRIS manual', description:'QRIS VARTANA dengan nominal yang diisi customer.', supported:true, variables:[]},
  {id:'doku', category:'payment', name:'DOKU Checkout', description:'QRIS dinamis, virtual account dan e-wallet sesuai channel merchant.', supported:true, variables:['DOKU_CLIENT_ID','DOKU_SECRET_KEY']},
  {id:'ipaymu', category:'payment', name:'iPaymu', description:'Pilihan gateway pembayaran alternatif.', supported:false, variables:['IPAYMU_VA','IPAYMU_API_KEY']},
  {id:'legacy_shipping', category:'shipping', name:'Pengiriman existing', description:'J&T dan JNE melalui tarif existing atau estimasi wilayah.', supported:true, variables:['BITESHIP_API_KEY','ORIGIN_DISTRICT_ID']},
  {id:'kiriminaja', category:'shipping', name:'KiriminAja', description:'Agregator ongkir, pengiriman dan tracking.', supported:false, variables:['KIRIMINAJA_API_KEY']},
  {id:'midtrans', category:'payment', name:'Midtrans', description:'Pembayaran online melalui Midtrans Snap.', supported:true, variables:['MIDTRANS_SERVER_KEY','MIDTRANS_SIGNATURE_SECRET_KEY']},
] as const;

export function defaultIntegrations(): IntegrationDocument {
  return {revision:'', settings:integrationProviders.map(provider=>({id:provider.id,
    enabled:provider.supported&&provider.id!=='doku'&&provider.id!=='midtrans', environment:provider.supported?'production':'sandbox', label:provider.name, originId:''}))};
}

export function validateIntegrations(raw: unknown): IntegrationSetting[] {
  if (!Array.isArray(raw) || raw.length !== integrationProviders.length) throw new Error('Daftar layanan tidak lengkap. Muat ulang pengaturan.');
  const seen = new Set<string>();
  return raw.map(value=>{
    const provider = integrationProviders.find(item=>item.id===value?.id);
    if (!provider || seen.has(value.id) || typeof value.enabled!=='boolean' ||
        !['sandbox','production'].includes(value.environment) || typeof value.label!=='string' ||
        !value.label.trim() || value.label.length>60 || typeof value.originId!=='string' ||
        (value.originId && !/^[a-zA-Z0-9_-]{1,100}$/.test(value.originId))) throw new Error('Pengaturan layanan tidak valid.');
    if(value.id==='doku'&&value.enabled&&value.environment!=='production')throw new Error('Aktivasi DOKU saat ini memakai credential production.');
    if (value.enabled && !provider.supported) throw new Error(provider.name+' menunggu pemasangan dan pengujian adapter. Simpan sebagai nonaktif dahulu.');
    seen.add(provider.id);
    return {id:provider.id, enabled:value.enabled, environment:value.environment, label:value.label.trim(), originId:value.originId};
  });
}

export function paymentChoices(settings: IntegrationSetting[]): PaymentChoice[] {
  const midtrans=settings.find(setting=>setting.id==='midtrans'&&setting.enabled);
  if(midtrans)return [{id:'midtrans',label:midtrans.label}];
  const doku=settings.find(setting=>setting.id==='doku'&&setting.enabled);if(doku)return [{id:'doku',label:doku.label}];
  return settings.filter((setting): setting is IntegrationSetting & {id:PaymentChoice['id']}=>
    setting.enabled && ['bank_transfer','qris'].includes(setting.id)).map(setting=>({id:setting.id,label:setting.label}));
}
