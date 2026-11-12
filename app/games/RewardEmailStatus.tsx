'use client';
import {LocaleScope} from '@/app/components/SiteLanguage';
import type {GameVoucher} from '@/lib/games';
export default function RewardEmailStatus({voucher,busy,onRefresh}:{voucher:GameVoucher;busy:boolean;onRefresh:()=>void}){
 const email=voucher.email;
 if(!email)return <LocaleScope><p className="puzzle-note">Kode tersimpan. Pengiriman email belum diaktifkan admin.</p></LocaleScope>;
 const message=email.status==='SENT'?'Email telah dikirim. Periksa inbox dan folder spam.':['PENDING','SENDING'].includes(email.status)?'Email hadiah sedang disiapkan. Kode di atas tetap bisa digunakan.':email.status==='EXPIRED'?'Kode sudah kedaluwarsa.':email.status==='USED'?'Kode sudah digunakan pada pesanan.':email.status==='BLOCKED'?'Pengiriman belum tersedia. Hubungi tim VARTANA; kode tetap tersimpan.':'Status pengiriman belum terkonfirmasi. Periksa inbox atau hubungi tim VARTANA.';
 return <LocaleScope><section className="reward-email-status" aria-label="Pengiriman email hadiah"><div><strong>Hadiah juga masuk ke emailmu</strong><p role="status">{message}</p><small>{email.recipient}</small><div className="reward-email-actions"><button type="button" disabled={busy} onClick={onRefresh}>Periksa status email</button></div><small>Setiap kode dikirim otomatis satu kali. Maksimal 3 voucher berbeda per email/WhatsApp untuk seluruh Games.</small></div></section></LocaleScope>;
}
