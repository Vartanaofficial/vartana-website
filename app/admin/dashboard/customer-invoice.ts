import {jsPDF} from "jspdf";
import {receiptSvg,type ReceiptOrder} from "@/lib/customer-receipt";
export {invoiceAvailable} from "@/lib/customer-receipt";
async function render(order:ReceiptOrder){
 const response=await fetch("/Logo%20Vartana%20Bulat.png");if(!response.ok)throw Error("Logo struk belum berhasil dimuat.");
 const blob=await response.blob();
 const logo=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error("Logo belum terbaca."));reader.readAsDataURL(blob);});
 const design=receiptSvg(order,logo),url=URL.createObjectURL(new Blob([design.svg],{type:"image/svg+xml;charset=utf-8"}));
 try{const img=await new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error("Struk belum berhasil dibuat."));image.src=url;});
 const scale=Math.min(3,32000/design.height),canvas=document.createElement("canvas");canvas.width=Math.ceil(design.width*scale);canvas.height=Math.ceil(design.height*scale);const ctx=canvas.getContext("2d");if(!ctx)throw Error("Browser belum mendukung gambar struk.");ctx.scale(scale,scale);ctx.drawImage(img,0,0);return {canvas,design};
 }finally{URL.revokeObjectURL(url);}
}
export async function downloadCustomerInvoice(order:ReceiptOrder,format:"pdf"|"png"="pdf"){
 try{const {canvas,design}=await render(order),name=`Struk-VARTANA-${order.orderSerial.replace(/[^a-z0-9-]/gi,"")}`;
 if(format==="png"){const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error("Gambar struk belum tersedia.")),"image/png"));const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name+".png";a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);return;}
 const height=design.height/design.width*80,doc=new jsPDF({unit:"mm",format:[80,height],orientation:height>=80?"portrait":"landscape"});doc.addImage(canvas.toDataURL("image/png"),"PNG",0,0,80,height);doc.save(name+".pdf");
 }catch(e){window.alert(e instanceof Error?e.message:"Struk belum berhasil dibuat.");}
}
