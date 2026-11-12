import PartnerPricing from './PartnerPricing';
export default async function PartnerPricingPage({searchParams}:{searchParams:Promise<{mitra?:string}>}){
 const query=await searchParams;
 return <PartnerPricing initialPartnerCode={typeof query.mitra==='string'?query.mitra:''}/>;
}
