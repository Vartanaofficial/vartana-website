'use client';
import {LocaleScope} from '@/app/components/SiteLanguage';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import type {CustomerAccount,CustomerProfile} from '@/lib/customer-account';
import '../akun/customer-account.css';
export default function CheckoutAccountProfile({onProfile}:{onProfile:(profile:CustomerProfile,replace:boolean)=>void}){
 const [account,setAccount]=useState<CustomerAccount|null>(null),[ready,setReady]=useState(false);
 useEffect(()=>{let active=true;const controller=new AbortController();fetch('/api/customer/account',{cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])}).then(r=>r.json()).then(d=>{if(active&&d.authenticated){setAccount(d.account);onProfile(d.account.profile,false);}}).catch(()=>{/* Account lookup must never block guest checkout. */}).finally(()=>{if(active)setReady(true);});return()=>{active=false;controller.abort();};},[onProfile]);
 if(!ready)return <LocaleScope><div className="checkout-account-panel"><p>Belanja bisa dilanjutkan sambil memeriksa akun.</p></div></LocaleScope>;
 return <LocaleScope><section className="checkout-account-panel">{account?<><h3>Data belanjamu siap.</h3><p>Masuk sebagai <span data-no-translate>{account.email}</span>. Data akun mengisi kolom yang masih kosong.</p><button type="button" onClick={()=>onProfile(account.profile,true)}>Gunakan data & alamat akun</button><small>Alamat pengiriman tetap bisa diubah untuk pesanan ini.</small></>:<><h3>Sudah pernah belanja?</h3><p>Masuk untuk memakai kembali data diri dan alamatmu. Member lama bisa membuat password lewat kode email.</p><Link href="/akun?next=/checkout">Masuk / aktifkan akun →</Link><small>Atau lanjutkan mengisi formulir di bawah tanpa login.</small></>}</section></LocaleScope>;
}
