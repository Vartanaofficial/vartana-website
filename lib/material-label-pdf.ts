import {jsPDF} from 'jspdf';
export type MaterialLabel={inputOrder?:number;name:string;packId:string;qty:number;unit:string;receivedOn:string;expiryDate:string};
export function labelPackCode(id:string){return 'PK-'+id.replace(/^BAT-/,'').toUpperCase();}
export function materialLabelDate(value:string){if(!value)return '-';const parts=value.split('-').map(Number);if(parts.length<2||parts[1]<1||parts[1]>12)return '-';const months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];return (parts[2]?parts[2]+' ':'')+months[parts[1]-1]+' '+parts[0];}
export function createMaterialLabelPdf(labels:MaterialLabel[],width=100,height=150){
 if(!labels.length||labels.length>400||![width,height].every(n=>Number.isFinite(n)&&n>=80&&n<=200))throw Error('Pilih label dan ukuran kertas antara 80 sampai 200 mm.');
 const doc=new jsPDF({unit:'mm',format:[width,height],orientation:width>height?'landscape':'portrait'}),margin=3,gap=2,cw=(width-margin*2-gap)/2,ch=(height-margin*2-gap)/2;
 labels.forEach((label,index)=>{if(index&&index%4===0)doc.addPage([width,height],width>height?'landscape':'portrait');const x=margin+(index%2)*(cw+gap),y=margin+(Math.floor(index%4/2))*(ch+gap),pad=3,inside=cw-pad*2;
 doc.setDrawColor(155);doc.setLineWidth(.15);doc.roundedRect(x,y,cw,ch,1,1);doc.setTextColor(0);doc.setFont('helvetica','bold');doc.setFontSize(7);doc.text('VARTANA \u2022 BAHAN BAKU',x+pad,y+5);if(label.inputOrder!==undefined){doc.setFontSize(6);doc.text('No. '+label.inputOrder,x+cw-pad,y+8,{align:'right'});}
 doc.setFontSize(11);const title=doc.splitTextToSize(label.name.toUpperCase(),inside).slice(0,2);doc.text(title,x+pad,y+11);const afterTitle=y+11+(title.length-1)*4;
 doc.setFont('helvetica','normal');doc.setFontSize(7);doc.text('Berat saat dikemas:',x+pad,afterTitle+6);doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(Number(label.qty.toFixed(4)).toLocaleString('id-ID')+' '+label.unit,x+pad,afterTitle+12);
 doc.setFont('helvetica','normal');doc.setFontSize(6.5);doc.text('Masuk: '+materialLabelDate(label.receivedOn),x+pad,afterTitle+19);doc.text('ED: '+materialLabelDate(label.expiryDate),x+pad,afterTitle+23);doc.setFontSize(5.3);doc.text(doc.splitTextToSize('Pack: '+labelPackCode(label.packId),inside),x+pad,afterTitle+28);
 });return doc;
}
