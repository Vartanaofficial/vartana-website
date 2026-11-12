import {requestMasterScript} from './master-products';
import {signPuzzle} from './puzzle-server';
export async function checkoutContext(phone:string,orderKey:string){
 const payload={phone,orderKey,includeMaster:true};
 return requestMasterScript('getCheckoutContext',signPuzzle('getCheckoutContext',payload));
}
