'use client';

import {useEffect, useRef, useState, type FormEvent} from 'react';
import {adminFetch} from '@/lib/admin-fetch';
import {clientId} from '@/lib/client-id';
import './inventory-bulk-stock.css';

type FinishedItem = {id: string; name: string; qty: number | null};
type StockRow = FinishedItem & {actual: string};

export default function InventoryBulkStock({items, onClose, onSaved}: {
  items: FinishedItem[];
  onClose: () => void;
  onSaved: (count: number) => Promise<void>;
}) {
  const [rows, setRows] = useState<StockRow[]>(() => items.map(item => ({...item, actual: item.qty === null ? '' : String(item.qty)})));
  const [note, setNote] = useState('Hasil hitung fisik barang jadi');
  const [requestId, setRequestId] = useState(clientId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const dialog = useRef<HTMLElement>(null);
  const pending = useRef(false);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLInputElement>('input')?.focus();
    function keyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !pending.current) onClose();
      if (event.key !== 'Tab') return;
      const elements = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled)');
      if (!elements?.length) {event.preventDefault(); return;}
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
      if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
    }
    document.addEventListener('keydown', keyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  function updateQuantity(id: string, actual: string) {
    setRows(previous => previous.map(row => row.id === id ? {...row, actual} : row));
    setRequestId(clientId());
    setNotice('');
  }

  async function refreshBalances() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await adminFetch('/api/admin/inventory', {cache: 'no-store', signal: AbortSignal.timeout(30000)});
      const data = await response.json();
      if (!response.ok || !data.success || !Array.isArray(data.finished)) throw Error(data.message || 'Saldo terbaru belum bisa dimuat.');
      const refreshed = rows.map(row => {
        const latest = data.finished.find((item: FinishedItem) => item.id === row.id);
        if (!latest) throw Error('SKU ' + row.id + ' tidak tersedia. Tutup form dan perbarui daftar produk.');
        return {...row, qty: latest.qty};
      });
      setRows(refreshed);
      setRequestId(clientId());
      setNotice('Saldo sistem sudah diperbarui. Isian stok fisikmu tetap ada. Periksa selisihnya sebelum menyimpan.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Saldo belum dapat dimuat.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (pending.current) return;
    const invalid = rows.find(row => row.actual.trim() === '' || !Number.isSafeInteger(Number(row.actual)) || Number(row.actual) < 0 || Number(row.actual) > 1e12);
    if (invalid) {setError('Isi stok fisik ' + invalid.name + ' dengan bilangan bulat nol atau lebih.'); return;}
    pending.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await adminFetch('/api/admin/inventory', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({operation: 'bulkFinishedOpname', requestId, note, items: rows.map(row => ({id: row.id, qty: Number(row.actual), expectedQty: row.qty}))}),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw Error(data.message || 'Stok belum berhasil disimpan.');
      await onSaved(rows.length);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Koneksi terputus. Coba simpan kembali untuk memeriksa hasilnya.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  const needsNote = rows.some(row => row.qty !== null && row.actual !== '' && Number(row.actual) !== row.qty);
  const filled = rows.filter(row => row.actual.trim() !== '').length;

  return <div className="bulk-stock-backdrop">
    <section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="bulk-stock-title" className="bulk-stock-dialog">
      <header className="bulk-stock-heading">
        <div><span>BARANG JADI</span><h2 id="bulk-stock-title">Isi stok beberapa SKU</h2><p>Masukkan jumlah kemasan yang benar-benar ada untuk setiap produk.</p></div>
        <button type="button" disabled={busy} onClick={onClose} aria-label="Tutup edit stok massal">×</button>
      </header>
      <form onSubmit={save}>
        <div className="bulk-stock-content">
          <div className="bulk-stock-summary"><strong>{rows.length} SKU dipilih</strong><span>{filled} dari {rows.length} isian terisi</span><button type="button" disabled={busy} onClick={() => void refreshBalances()}>Muat ulang saldo</button></div>
          <div className="bulk-stock-scroll"><table className="bulk-stock-table">
            <thead><tr><th>Produk</th><th>Saldo sistem</th><th>Stok fisik (pack)</th><th>Selisih</th></tr></thead>
            <tbody>{rows.map(row => {
              const actual = row.actual === '' ? null : Number(row.actual);
              const difference = actual === null ? null : actual - (row.qty || 0);
              return <tr key={row.id}>
                <td><strong>{row.name}</strong><small>{row.id}</small></td>
                <td>{row.qty === null ? <span className="bulk-stock-unknown">Belum diisi</span> : row.qty.toLocaleString('id-ID') + ' pack'}</td>
                <td><input required type="number" inputMode="numeric" min={0} max={1e12} step={1} disabled={busy} value={row.actual} onChange={event => updateQuantity(row.id, event.target.value)} aria-label={'Stok fisik ' + row.name} placeholder="Isi jumlah"/></td>
                <td className={difference !== null && difference < 0 ? 'bulk-stock-negative' : ''}>{difference === null ? '—' : (difference > 0 ? '+' : '') + difference.toLocaleString('id-ID')}</td>
              </tr>;
            })}</tbody>
          </table></div>
          <label className="bulk-stock-note">Catatan hasil hitung{needsNote ? ' (wajib)' : ''}<textarea required={needsNote} maxLength={300} rows={2} disabled={busy} value={note} onChange={event => {setNote(event.target.value); setRequestId(clientId());}}/></label>
          {error && <p role="alert" className="bulk-stock-error">{error}</p>}
          {notice && <p role="status" className="bulk-stock-notice">{notice}</p>}
        </div>
        <footer className="bulk-stock-footer"><p>Hasil hitung ini menjadi saldo stok terbaru untuk SKU yang dipilih.</p><div><button type="button" disabled={busy} onClick={onClose}>Batal</button><button type="submit" disabled={busy}>{busy ? 'Memproses…' : 'Simpan ' + rows.length + ' SKU sekaligus'}</button></div></footer>
      </form>
    </section>
  </div>;
}
