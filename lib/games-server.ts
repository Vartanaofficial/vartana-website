import {requestMasterScript} from './master-products';
import {puzzleRequest} from './puzzle-server';

const deploymentMessage = 'Backend Games belum diperbarui. Ganti seluruh kode Apps Script dengan VARTANA-AppsScript-v2.txt terbaru, Save, lalu Deploy > Manage deployments > Edit > New version pada Web app yang digunakan website. Mengganti kode saja belum memperbarui Web app.';
let verifiedUntil = 0;
let verification:Promise<void>|null=null;
let emailReady=false;
export async function verifyGamesBackend() {
  // Read-only capability check prevents old deployments routing game requests into Orders.
  if(Date.now()<verifiedUntil)return;
  if(!verification)verification=(async()=>{const capabilities=await requestMasterScript('getGameCapabilities');if(capabilities.gamesVersion!==3)throw new Error(deploymentMessage);emailReady=capabilities.gameEmailVersion===1;verifiedUntil=Date.now()+300000;})().finally(()=>{verification=null;});
  return verification;
}
export async function sendGamesRewardEmail(session:string,attemptId:string,resend=false){
 await verifyGamesBackend();
 if(!emailReady)throw new Error('Pengiriman email hadiah belum diaktifkan admin. Kode hadiah tetap tersimpan.');
 return puzzleRequest('gamesRewardEmail',{session,attemptId,resend});
}
export async function gamesAdminRequest(payload:Record<string,unknown>){
  await verifyGamesBackend();
  const result=await puzzleRequest('gamesAdmin',payload);
  if(result.gamesVersion!==3)throw new Error(deploymentMessage);
  return result;
}
export async function gamesRequest(payload: Record<string, unknown>) {
  await verifyGamesBackend();
  try {
    const result = await puzzleRequest('games', payload);
    if (result.gamesVersion !== 3) throw new Error(deploymentMessage);
    return result;
  } catch (error) {
    if (error instanceof Error && /Order serial|nomor WhatsApp wajib diisi/i.test(error.message)) {
      verifiedUntil = 0;
      throw new Error(deploymentMessage);
    }
    throw error;
  }
}
