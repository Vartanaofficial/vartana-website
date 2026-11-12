type Offer = {code:string; automatic?:boolean};

export function selectCheckoutVoucher(code:string, current:string, offers:Offer[], applied:{code:string}[]) {
  const cleaned=code.trim().toUpperCase();
  if(!cleaned)return {codes:current,input:'',notice:''};
  const offer=offers.find(item=>item.code===cleaned);
  // Automatic offers already participate in the quote. Selecting their card must
  // not turn an unmet condition into a forced-code error that blocks payment.
  if(offer?.automatic)return {
    codes:current,
    input:cleaned,
    notice:applied.some(item=>item.code===cleaned)
      ? 'Voucher '+cleaned+' sudah diterapkan otomatis pada pesanan Anda.'
      : 'Voucher '+cleaned+' akan diterapkan otomatis setelah syarat belanja dan alamat terpenuhi.',
  };
  return {
    codes:[...new Set([...current.split(/[\s,]+/),cleaned])].filter(Boolean).join(','),
    input:'',
    notice:'Voucher '+cleaned+' dipilih. Potongan akan tampil setelah syarat belanja dan alamat terpenuhi.',
  };
}
