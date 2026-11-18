import {NextResponse} from 'next/server';
import {sameOriginRequest} from '@/lib/request-origin';
import {localDokuAdmin,localDokuCredentials,configureLocalDoku,localDokuStatus} from '@/lib/local-doku';
const headers={'Cache-Control':'no-store, private'};
export async function GET(request:Request){return NextResponse.json({localAdmin:localDokuAdmin(request),ready:localDokuAdmin(request)&&!!localDokuCredentials()},{headers});}
export async function POST(request:Request){
 if(!localDokuAdmin(request))return NextResponse.json({message:'Hanya untuk admin pada development localhost.'},{status:403,headers});
 if(!sameOriginRequest(request))return NextResponse.json({message:'Asal permintaan tidak valid.'},{status:403,headers});
 try{const data=await request.json();if(data.operation==='configure'){configureLocalDoku({clientId:data.clientId,secretKey:data.secretKey});return NextResponse.json({success:true,ready:true},{headers});}
 if(data.operation==='status'&&/^[a-f0-9-]{36}$/i.test(data.orderKey||''))return NextResponse.json({success:true,...await localDokuStatus(data.orderKey)},{headers});throw new Error('Operasi tidak valid.');
 }catch(e){return NextResponse.json({message:e instanceof Error?e.message:'DOKU belum siap.'},{status:400,headers});}
}
