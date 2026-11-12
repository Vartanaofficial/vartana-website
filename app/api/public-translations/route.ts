import {NextResponse} from 'next/server';
import {requestMasterScript} from '@/lib/master-products';

export async function GET(){
  try{
    const data=await requestMasterScript('getPublicContentTranslations',undefined,{legacyGet:true});
    if(data.publicTranslationVersion!==1)throw Error('Public content translations are awaiting the updated Apps Script.');
    return NextResponse.json(data,{headers:{'Cache-Control':data.pending?'private, max-age=5':'public, max-age=300'}});
  }catch{return NextResponse.json({success:false,translations:{},pending:0},{headers:{'Cache-Control':'no-store'}});}
}
