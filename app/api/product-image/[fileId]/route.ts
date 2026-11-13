import {GET as readDriveImage} from '../route';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(request:Request,{params}:{params:Promise<{fileId:string}>}){
  const {fileId}=await params;
  const url=new URL(request.url);
  url.searchParams.set('fileId',fileId);
  return readDriveImage(new Request(url,request));
}
