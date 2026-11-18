import {NextRequest,NextResponse} from 'next/server';
import {verifyAdminSessionToken} from '@/lib/admin-auth';
import {sameOriginRequest} from '@/lib/request-origin';
import {integrationCredentials,readIntegrationSettings,saveIntegrationSettings} from '@/lib/integrations-server';

const headers={'Cache-Control':'no-store, private'};
async function run(request:NextRequest,write:boolean) {
  const secret=process.env.ADMIN_SESSION_SECRET,token=request.cookies.get('vartana_admin_session')?.value;
  if(!secret||!token||!verifyAdminSessionToken(token,secret))return NextResponse.json({success:false,message:'Silakan login admin.'},{status:401,headers});
  if(write&&!sameOriginRequest(request))return NextResponse.json({success:false,message:'Asal permintaan tidak valid.'},{status:403,headers});
  try {
    const body=write?await request.json():null;
    const document=write?await saveIntegrationSettings(body.settings,String(body.expectedRevision||'')):await readIntegrationSettings();
    return NextResponse.json({success:true,document,credentials:integrationCredentials(),local:process.env.NODE_ENV==='development',message:write?'Pengaturan integrasi tersimpan.':''},{headers});
  }catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:'Pengaturan belum dapat dimuat.'},{status:400,headers});}
}
export const GET=(request:NextRequest)=>run(request,false);
export const POST=(request:NextRequest)=>run(request,true);
