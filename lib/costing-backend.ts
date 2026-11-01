import {requestMasterScript} from "./master-products";
export const COSTING_DEPLOY_MESSAGE = "Web app Apps Script masih memakai versi lama. Di Apps Script pilih Deploy > Manage deployments > Edit (ikon pensil) > New version > Deploy pada deployment website yang sama. Save kode saja belum memperbarui Web app. Data tetap disimpan di spreadsheet existing.";
export async function requestCostingBackend(action:string,payload?:Record<string,unknown>){
 const readAction=action.includes("RawMaterials")?"getRawMaterials":"getProductCosting";
 const field=readAction==="getRawMaterials"?"materials":"costs";
 const current=await requestMasterScript(readAction);
 if(!Array.isArray(current[field]))throw Error(COSTING_DEPLOY_MESSAGE);
 if(payload?.inventorySettings&&current.materialWorkflowVersion!==2)throw Error(COSTING_DEPLOY_MESSAGE);
 return payload?requestMasterScript(action,payload):current;
}
