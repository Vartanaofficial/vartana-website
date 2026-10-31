import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-auth";
async function forward(r: NextRequest, write: boolean) {
  const secret=process.env.ADMIN_SESSION_SECRET, token=r.cookies.get("vartana_admin_session")?.value;
  if(!secret||!token||!verifyAdminSessionToken(token,secret))return NextResponse.json({success:false,message:"Silakan login admin kembali."},{status:401});
  try {
    const script=process.env.KONSINYASI_GOOGLE_SCRIPT_URL||process.env.GOOGLE_SCRIPT_URL||process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
    if(!script)throw Error("URL Apps Script belum dikonfigurasi.");
    const data=write?await r.json():null, action=write?"saveKonsinyasiPromo":r.nextUrl.searchParams.get("action")||"getKonsinyasiPromo";
    if(!write&&!["getKonsinyasiPromo","getKonsinyasiMitra","getKonsinyasiProduk"].includes(action))throw Error("Action tidak valid.");
    const url=new URL(script);if(!write)url.searchParams.set("action",action);
    const res=await fetch(url,{method:write?"POST":"GET",cache:"no-store",signal:AbortSignal.timeout(25000),...(write?{headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,data})}:{})});
    const result=await res.json();if(!res.ok||result.success!==true)throw Error(result.message||"Perbarui deployment Apps Script konsinyasi.");
    return NextResponse.json(result);
  }catch(e){return NextResponse.json({success:false,message:e instanceof Error?e.message:"Promo belum tersimpan."},{status:502});}
}
export const GET=(r:NextRequest)=>forward(r,false);
export const POST=(r:NextRequest)=>forward(r,true);
