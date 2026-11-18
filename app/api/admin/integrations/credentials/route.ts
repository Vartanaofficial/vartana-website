import {NextRequest,NextResponse} from 'next/server';
import {verifyAdminSessionToken} from '@/lib/admin-auth';
import {sameOriginRequest} from '@/lib/request-origin';
import {netlifyCredentialConnection,saveNetlifyCredential,listNetlifyCredentials,deleteNetlifyCredential} from '@/lib/netlify-credentials';

const headers={'Cache-Control':'no-store, private'};
function authenticated(request:NextRequest){const token=request.cookies.get('vartana_admin_session')?.value,secret=process.env.ADMIN_SESSION_SECRET;return !!(token&&secret&&verifyAdminSessionToken(token,secret));}
export async function GET(request:NextRequest){
  if(!authenticated(request))return NextResponse.json({success:false,message:'Silakan login admin.'},{status:401,headers});
  try{return NextResponse.json({success:true,...netlifyCredentialConnection(),entries:await listNetlifyCredentials()},{headers});}catch{return NextResponse.json({success:false,...netlifyCredentialConnection(),message:'Daftar API Netlify belum dapat dimuat. Coba muat ulang.'},{status:502,headers});}
}
export async function POST(request:NextRequest){
  if(!authenticated(request))return NextResponse.json({success:false,message:'Silakan login admin.'},{status:401,headers});
  if(!sameOriginRequest(request))return NextResponse.json({success:false,message:'Asal permintaan tidak valid.'},{status:403,headers});
  try{return NextResponse.json({success:true,...await saveNetlifyCredential(await request.json())},{headers});}
  catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:'API belum tersimpan.'},{status:400,headers});}
}

export async function DELETE(request:NextRequest){
 if(!authenticated(request))return NextResponse.json({success:false,message:'Silakan login admin.'},{status:401,headers});
 if(!sameOriginRequest(request))return NextResponse.json({success:false,message:'Asal permintaan tidak valid.'},{status:403,headers});
 try{return NextResponse.json({success:true,...await deleteNetlifyCredential(await request.json())},{headers});}
 catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:'API belum dihapus.'},{status:400,headers});}
}
