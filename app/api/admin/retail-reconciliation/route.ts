import {NextRequest,NextResponse} from 'next/server';
import {verifyAdminSessionToken} from '@/lib/admin-auth';
import {requestMasterScript} from '@/lib/master-products';
import {signPuzzle} from '@/lib/puzzle-server';
import {sameOriginRequest} from '@/lib/request-origin';
async function run(req:NextRequest,write:boolean){const secret=process.env.ADMIN_SESSION_SECRET,token=req.cookies.get('vartana_admin_session')?.value;if(!secret||!token||!verifyAdminSessionToken(token,secret))return NextResponse.json({success:false,message:'Silakan login admin.'},{status:401});try{if(write&&!sameOriginRequest(req))throw new Error('Buka rekonsiliasi dari dashboard.');const body=write?await req.json():{},payload=write?{operation:'save',orderSerial:body.orderSerial,items:body.items,requestId:body.requestId,expectedFingerprint:body.expectedFingerprint}:{operation:'list'};const result=await requestMasterScript('retailReconciliation',signPuzzle('retailReconciliation',payload));return NextResponse.json(result,{headers:{'Cache-Control':'no-store, private'}});}catch(e){return NextResponse.json({success:false,message:e instanceof Error?e.message:'Rekonsiliasi belum dapat dimuat.'},{status:400});}}
export const GET=(req:NextRequest)=>run(req,false);
export const POST=(req:NextRequest)=>run(req,true);
