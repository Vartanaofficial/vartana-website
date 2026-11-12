export type CustomerOrder={orderSerial:string;createdAt:string;itemsSummary:string;status:string;grandTotal:number|null;resiJNT:string};
export type CustomerOrderResult={success:true;customerOrdersVersion:2;found:boolean;history:CustomerOrder[];total:number;hasMore:boolean;message:string};
export const customerOrderSteps=[{status:'MENUNGGU PEMBAYARAN',label:'Menunggu bayar'},{status:'PEMBAYARAN DITERIMA',label:'Terbayar'},{status:'PESANAN DISIAPKAN',label:'Disiapkan'},{status:'DIKIRIM',label:'Dikirim'},{status:'SELESAI',label:'Selesai'}];
export function customerOrderStep(status:string){return customerOrderSteps.findIndex(step=>step.status===status.trim().toUpperCase());}

export type CustomerOrderChallenge={success:true;customerOrdersVersion:2;challengeId:string;maskedEmail:string;expiresAt:string;retryAt:string;deliveryStatus:string};
