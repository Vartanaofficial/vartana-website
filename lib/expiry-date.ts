// Month-only receipts use day 1; clamp month-end dates instead of overflowing.
export function expiryFromReceipt(received:string,months:number):string{
 if(!/^\d{4}-(0[1-9]|1[0-2])(?:-\d{2})?$/.test(received)||![3,6,12].includes(months))return '';
 const full=received.length===7?received+'-01':received;
 const date=new Date(full+'T00:00:00Z');
 if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==full)return '';
 const year=date.getUTCFullYear(),month=date.getUTCMonth()+months,day=date.getUTCDate();
 const last=new Date(Date.UTC(year,month+1,0)).getUTCDate();
 return new Date(Date.UTC(year,month,Math.min(day,last))).toISOString().slice(0,10);
}
