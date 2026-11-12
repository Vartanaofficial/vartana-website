import type {CustomerProfile} from './customer-account';
const keys=['name','phone','email','address','provinceId','provinceName','cityId','cityName','districtId','districtName','postalCode'] as const;
const shipping=['address','provinceId','provinceName','cityId','cityName','districtId','districtName','postalCode'] as const;
export function prefillCustomer<T extends Record<string,string>>(current:T,profile:CustomerProfile,replace=false):T{
 if(!replace&&current.email&&current.email.trim().toLowerCase()!==profile.email)return current;
 const next={...current},hasShipping=shipping.some(k=>!!current[k]);
 for(const key of keys){if(replace||(!current[key]&&(!shipping.includes(key as typeof shipping[number])||!hasShipping)))(next as Record<string,string>)[key]=profile[key]||'';}
 return next;
}
