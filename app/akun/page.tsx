import type {Metadata} from 'next';
import CustomerAccountPage from './CustomerAccountPage';
export const metadata:Metadata={title:'Akun Saya | VARTANA',robots:{index:false,follow:false},referrer:'no-referrer'};
export default function AccountPage(){return <CustomerAccountPage/>;}
