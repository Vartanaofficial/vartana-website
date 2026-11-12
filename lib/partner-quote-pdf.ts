import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';
import {calculatePartnerQuote,quoteDate,quoteMoney,type PartnerQuoteInput} from './partner-quote';
const green:[number,number,number]=[23,61,43],gold:[number,number,number]=[167,132,61],ink:[number,number,number]=[47,64,53];
export function createPartnerQuotePdf(input:PartnerQuoteInput,logo?:string){
 const q=calculatePartnerQuote(input),doc=new jsPDF({unit:'mm',format:'a4',compress:true});
 // Explicit field mapping: this partner document never serializes master/HPP data.
 doc.setProperties({title:'Penawaran Kemitraan VARTANA',author:'VARTANA Botanical Wellness',subject:'Simulasi harga jual mitra'});
 function heading(first:boolean){
  doc.setFillColor(...green);doc.rect(0,0,210,first?52:29,'F');
  let x=14;if(logo){doc.addImage(logo,'PNG',14,first?11:6,first?23:17,first?23:17);x=first?42:36;}
  doc.setTextColor(255);doc.setFont('helvetica','bold');doc.setFontSize(first?18:13);doc.text('VARTANA',x,first?21:14);
  doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(221,230,214);doc.text('BOTANICAL WELLNESS',x,first?27:20);
  if(first){doc.setFont('times','italic');doc.setFontSize(18);doc.setTextColor(234,217,171);doc.text('Tumbuh bersama, satu seduhan.',14,44);}
  doc.setDrawColor(...gold);doc.setLineWidth(.7);doc.line(14,first?52:29,196,first?52:29);
 }
 function text(t:string,x:number,y:number,size=9,bold=false,color=ink){doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);doc.text(t,x,y);}
 heading(true);
 text('PENAWARAN KEMITRAAN',14,63,10,true);
 doc.setFontSize(8);doc.setTextColor(...ink);const refLines=doc.splitTextToSize(q.reference||'SIMULASI HARGA JUAL',80) as string[];doc.text(refLines,196,63,{align:'right'});
 let y=72+Math.max(0,refLines.length-1)*4;
 doc.setFont('times','bold');doc.setFontSize(20);doc.setTextColor(...green);const name=doc.splitTextToSize(q.partnerName,181);doc.text(name,14,y);y+=name.length*8;
 if(q.pic){text('Untuk '+q.pic,14,y,9);y+=5;}
 if(q.phone){text(q.phone,14,y,8);y+=5;}
 if(q.address){doc.setFontSize(8);const lines=doc.splitTextToSize(q.address,181);doc.text(lines,14,y);y+=lines.length*4;}
 y+=5;text('Diterbitkan '+quoteDate(q.issuedOn)+'  |  Berlaku hingga '+quoteDate(q.validUntil),14,y,8);y+=9;
 const cards=[['TOTAL HARGA MITRA',quoteMoney(q.purchaseTotal)],['EST. OMZET MITRA',quoteMoney(q.revenueTotal)],['EST. LABA KOTOR',quoteMoney(q.profitTotal)]];
 for(let i=0;i<cards.length;i++){const x=14+i*62;doc.setFillColor(242,245,235);doc.roundedRect(x,y,58,22,2,2,'F');text(cards[i][0],x+4,y+7,6.5,true,[99,116,87]);text(cards[i][1],x+4,y+16,11,true);}
 y+=29;text('01 / SIMULASI PER KEMASAN',14,y,8,true,gold);y+=4;
 autoTable(doc,{
  startY:y,margin:{top:38,bottom:21,left:14,right:14},theme:'plain',rowPageBreak:'avoid',
  head:[['Produk / varian','Qty','Harga mitra','Biaya lain*','Harga jual**','Laba / unit','Margin']],
  body:q.items.map(i=>[i.name+'\n'+i.variant+'\n'+i.sku,String(i.quantity),quoteMoney(i.partnerPrice),quoteMoney(i.extraCost),quoteMoney(i.sellingPrice),quoteMoney(i.unitProfit),i.margin.toFixed(1)+'%']),
  styles:{font:'helvetica',fontSize:7.5,cellPadding:3,overflow:'linebreak',textColor:ink,lineColor:[223,230,216],lineWidth:0},
  headStyles:{fillColor:green,textColor:255,fontSize:7,fontStyle:'bold'},alternateRowStyles:{fillColor:[246,248,242]},
  columnStyles:{0:{cellWidth:48},1:{cellWidth:10,halign:'center'},2:{cellWidth:25,halign:'right'},3:{cellWidth:23,halign:'right'},4:{cellWidth:26,halign:'right'},5:{cellWidth:29,halign:'right'},6:{cellWidth:21,halign:'right'}},
  willDrawPage:data=>{if(data.pageNumber>1)heading(false);},
 });
 y=(doc as jsPDF&{lastAutoTable:{finalY:number}}).lastAutoTable.finalY+9;
 function room(h:number){if(y+h>270){doc.addPage();heading(false);y=40;}}
 function paragraph(t:string,size=8,color=ink){doc.setFont('helvetica','normal');doc.setFontSize(size);const lines=doc.splitTextToSize(t,182) as string[];for(const line of lines){room(5);text(line,14,y,size,false,color);y+=4.5;}y+=3;}
 room(31);text('02 / RINGKASAN POTENSI',14,y,8,true,gold);y+=8;
 const summary=[['Jumlah kemasan',String(q.quantity)+' / '+q.margin.toFixed(1)+'% margin'],['Biaya tambahan mitra',quoteMoney(q.extraTotal)],['Total modal mitra',quoteMoney(q.capitalTotal)]];
 for(const [label,value] of summary){room(8);text(label,14,y,8);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...green);doc.text(value,196,y,{align:'right'});y+=7;}
 y+=4;paragraph('* Biaya lain adalah alokasi biaya tambahan per kemasan yang diisi pada simulasi. Total modal = harga mitra + biaya lain.');
 paragraph('** Harga jual adalah rekomendasi/simulasi. Laba kotor = harga jual - harga mitra - biaya lain; belum dikurangi biaya operasional, pajak, atau biaya lain di luar simulasi. Estimasi mengasumsikan seluruh '+q.quantity+' kemasan terjual dan bukan jaminan keuntungan.');
 room(16);text('03 / KETENTUAN PENAWARAN',14,y,8,true,gold);y+=7;
 paragraph(q.terms||'Harga dan ketersediaan produk perlu dikonfirmasi sebelum pemesanan. Ongkir belum termasuk kecuali disebutkan dalam penawaran.');
 paragraph('Dokumen simulasi, bukan invoice, Sales Order, atau bukti pembayaran.',7,[111,122,103]);
 for(let p=1;p<=doc.getNumberOfPages();p++){doc.setPage(p);doc.setDrawColor(219,225,211);doc.line(14,279,196,279);text('VARTANA / ROOTED IN EARTH, BUILT FOR GROWTH',14,284,6.5,true,gold);text('www.vartana.id  |  vartana@vartanaglobal.com',14,289,7);doc.text(p+' / '+doc.getNumberOfPages(),196,289,{align:'right'});}
 return doc;
}
