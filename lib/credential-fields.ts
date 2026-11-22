export const credentialFields:Record<string,{label:string;help:string;secret:boolean}>={
 MIDTRANS_SERVER_KEY:{label:'Server Key',help:'Kunci API dari daftar Server Key di Midtrans. Beri akses Snap Checkout dan cek status transaksi.',secret:true},
 MIDTRANS_SIGNATURE_SECRET_KEY:{label:'Signature Secret Key',help:'Kunci penandatangan notifikasi pembayaran dari halaman Akses Key Midtrans.',secret:true},
 DOKU_CLIENT_ID:{label:'Client ID',help:'Salin Client ID dari dashboard merchant DOKU.',secret:false},
 DOKU_SECRET_KEY:{label:'Secret Key',help:'Salin Secret Key dari dashboard merchant DOKU. Jangan gunakan password akun.',secret:true},
 IPAYMU_VA:{label:'Nomor Virtual Account merchant',help:'Nomor VA identitas merchant iPaymu, sesuai dashboard provider.',secret:false},
 IPAYMU_API_KEY:{label:'API Key',help:'API Key merchant iPaymu.',secret:true},
 BITESHIP_API_KEY:{label:'API Key Biteship',help:'Token API dari dashboard Biteship, sesuai lingkungan akun yang digunakan.',secret:true},
 ORIGIN_DISTRICT_ID:{label:'ID area asal Biteship',help:'Gunakan area_id Biteship untuk alamat asal gudang; bukan kode pos.',secret:false},
 KIRIMINAJA_API_KEY:{label:'API Token KiriminAja',help:'Token integrasi dari akun KiriminAja.',secret:true},
};
export type CredentialEntry={key:string;updatedAt:string;secret:boolean};
