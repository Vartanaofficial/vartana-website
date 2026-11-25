import {requestMasterScript} from './master-products';
import {signPuzzle} from './puzzle-server';
export async function checkoutContext(phone:string,orderKey:string,includeMaster=true){
 const payload={phone,orderKey,includeMaster};
 return requestMasterScript('getCheckoutContext',signPuzzle('getCheckoutContext',payload));
}
