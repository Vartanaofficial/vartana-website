import {NextRequest,NextResponse} from "next/server";
import {verifyAdminSessionToken} from "@/lib/admin-auth";
import {requestMasterScript} from "@/lib/master-products";
function authorized(r:NextRequest){const s=process.env.ADMIN_SESSION_SECRET,t=r.cookies.get('vartana_admin_session')?.value;return !!(s&&t&&verifyAdminSessionToken(t,s));}
async function run(r:NextRequest,write:boolean){if(!authorized(r))return NextResponse.json({success:false,message:'Silakan login admin.'},{status:401});try{const current=await requestMasterScript('getInventory');if(![1,2,3,4].includes(current.inventoryVersion))throw Error('Deploy Apps Script versi stok terbaru terlebih dahulu. Stok disimpan di spreadsheet existing.');if(write&&current.inventoryVersion!==4)throw Error('Perbarui Apps Script stok dan produksi v4 sebelum mengedit stok.');return NextResponse.json(write?await requestMasterScript('saveInventory',await r.json()):current);}catch(e){return NextResponse.json({success:false,message:e instanceof Error?e.message:'Stok belum dimuat.'},{status:502});}}
export const GET=(r:NextRequest)=>run(r,false);
export const POST=(r:NextRequest)=>run(r,true);
