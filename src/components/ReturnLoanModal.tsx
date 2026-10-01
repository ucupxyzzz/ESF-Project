import React, { useState, useEffect } from 'react';
import { PeminjamanItem } from '../types';
import { DateInput } from './DateInput';
import { RotateCcw, X, CheckCircle, AlertTriangle, ShieldCheck, Calendar, Info, FileWarning } from 'lucide-react';

export const KONDISI_AKHIR_OPTIONS = [
  'Baik (Ready for Operation)',
  'Rusak Ringan (Minor Defect)',
  'Rusak Berat(Non-Operational)'
] as const;

export type KondisiAkhirType = typeof KONDISI_AKHIR_OPTIONS[number];

interface ReturnLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanItem: PeminjamanItem | null;
  onConfirmReturn: (item: PeminjamanItem, tglRealisasiKembali: string, kondisiAkhir: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const ReturnLoanModal: React.FC<ReturnLoanModalProps> = ({
  isOpen,
  onClose,
  loanItem,
  onConfirmReturn,
  isSubmitting = false
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [tglRealisasiKembali, setTglRealisasiKembali] = useState(today);
  const [kondisiAkhir, setKondisiAkhir] = useState<string>('Baik (Ready for Operation)');

  useEffect(() => {
    if (loanItem) {
      setTglRealisasiKembali(loanItem.tglRealisasiKembali || today);

      // Normalisasi nilai kondisi akhir jika dari data lama
      const currentKondisi = loanItem.kondisiAkhir || '';
      if (currentKondisi.includes('Berat')) {
        setKondisiAkhir('Rusak Berat(Non-Operational)');
      } else if (currentKondisi.includes('Ringan')) {
        setKondisiAkhir('Rusak Ringan (Minor Defect)');
      } else {
        setKondisiAkhir('Baik (Ready for Operation)');
      }
    }
  }, [loanItem, isOpen, today]);

  if (!isOpen || !loanItem) return null;

  const isDamaged =
    kondisiAkhir.includes('Rusak') ||
    kondisiAkhir.includes('Defect') ||
    kondisiAkhir.includes('Non-Operational');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tglRealisasiKembali.trim()) {
      alert('Silakan tentukan Tanggal Realisasi Kembali (Kolom J).');
      return;
    }
    await onConfirmReturn(loanItem, tglRealisasiKembali.trim(), kondisiAkhir);
  };

  const assetName = loanItem.namaAsset || loanItem.namaTool || 'Asset Tanpa Nama';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-[#0B4D3B] rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-[#063D2E] border-b border-[#0B4D3B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Aksi Pengembalian Tools
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono font-bold">
                  Kolom J & M
                </span>
              </h3>
              <p className="text-xs text-emerald-200/70">
                Pencatatan realisasi kembali alat dan update otomatis ke Google Spreadsheet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-emerald-200/70 hover:text-white rounded-lg hover:bg-[#0a4837] text-xs cursor-pointer transition disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  Nama Asset yang Dipinjam (Kolom C)
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {assetName}
                </h4>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shrink-0">
                {loanItem.kodeAlat || '-'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">ID Peminjaman (A):</span>
                <span className="font-mono font-bold text-slate-200">
                  {loanItem.idPeminjaman || loanItem.noPeminjaman || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Jobsite (E):</span>
                <span className="font-semibold text-emerald-300">{loanItem.jobsite || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Peminjam (F):</span>
                <span className="font-semibold text-slate-200">{loanItem.peminjam || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Tgl Pinjam (H):</span>
                <span className="font-mono text-slate-200">{loanItem.tglPinjam || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Estimasi Kembali (I):</span>
                <span className="font-mono text-slate-200">
                  {loanItem.estimasiKembali || loanItem.tglRencanaKembali || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Kondisi Awal (L):</span>
                <span className="font-medium text-slate-300">{loanItem.kondisiAwal || 'Baik (Ready for Operation)'}</span>
              </div>
            </div>
          </div>

          {/* Input 1: Tgl Realisasi Kembali (Kolom J) */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Tgl Realisasi Kembali (Kolom J Spreadsheet)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Bisa ketik manual atau klik tombol kalender
              </span>
            </label>
            <DateInput
              value={tglRealisasiKembali}
              onChange={setTglRealisasiKembali}
              placeholder="YYYY-MM-DD atau DD/MM/YYYY"
              required
              disabled={isSubmitting}
            />
            <p className="text-[10px] text-slate-400 mt-1 italic">
              Tanggal fisik alat diterima kembali di gudang/tool room.
            </p>
          </div>

          {/* Input 2: Kondisi Akhir (Kolom M) */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Kondisi Akhir (Kolom M Spreadsheet)
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Dropdown Pilihan Wajib</span>
            </label>
            <select
              value={kondisiAkhir}
              onChange={(e) => setKondisiAkhir(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
            >
              <option value="Baik (Ready for Operation)">Baik (Ready for Operation)</option>
              <option value="Rusak Ringan (Minor Defect)">Rusak Ringan (Minor Defect)</option>
              <option value="Rusak Berat(Non-Operational)">Rusak Berat(Non-Operational)</option>
            </select>
          </div>

          {/* Peringatan Otomatis Jika Memilih Kondisi Rusak */}
          {isDamaged && (
            <div className="p-3.5 rounded-xl bg-amber-950/70 border-2 border-amber-500/70 flex items-start gap-3 text-xs text-amber-200 animate-in fade-in slide-in-from-top-1 shadow-lg">
              <FileWarning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Peringatan Otomatis: Kondisi Alat Terindikasi Rusak!</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-100/90">
                  Anda memilih kondisi akhir <b>"{kondisiAkhir}"</b>. Pengguna disarankan untuk mempertimbangkan pembuatan <b>Berita Acara Kerusakan (BA Kerusakan)</b> di modul BA Kerusakan agar dapat segera diinvestigasi atau diterbitkan perbaikan OSR.
                </p>
              </div>
            </div>
          )}

          {/* Status K Announcement */}
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              Update Status Peminjaman (Kolom K):
            </span>
            <span className="font-bold text-emerald-400 px-2.5 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/30">
              Otomatis &rarr; Kembali
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan ke Spreadsheet...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Konfirmasi & Kembalikan Alat</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
