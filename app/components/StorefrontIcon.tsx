import type {SVGProps} from 'react';
export default function StorefrontIcon({name,...props}:SVGProps<SVGSVGElement>&{name:'cart'|'search'|'book'}){
 return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{name==='search'?<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>:name==='cart'?<><path d="M3 3h2l2.5 12h10l3-9H6"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></>:<><path d="M3 4h6a4 4 0 0 1 3 1 4 4 0 0 1 3-1h6v15h-6a4 4 0 0 0-3 1 4 4 0 0 0-3-1H3zM12 5v15"/></>}</svg>;
}
