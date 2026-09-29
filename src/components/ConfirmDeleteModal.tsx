import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  moduleName: string;
  itemKey: string;
  itemName: string;
  jobsite: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  moduleName,
  itemKey,
  itemName,
  jobsite
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-rose-900/50 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">
              Konfirmasi Penghapusan Data
            </h3>
            <p className="text-xs text-rose-400 font-medium">Otorisasi Eksklusif HO - Balikpapan</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
          <div className="text-slate-400">
            Modul: <span className="font-semibold text-white">{moduleName}</span>
          </div>
          <div className="text-slate-400">
            Kunci/ID: <span className="font-mono font-bold text-amber-400">{itemKey}</span>
          </div>
          <div className="text-slate-400">
            Nama/Deskripsi: <span className="font-semibold text-slate-200">{itemName}</span>
          </div>
          <div className="text-slate-400">
            Jobsite: <span className="font-bold text-amber-300">{jobsite}</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Tindakan ini akan <b>menghapus data dari aplikasi</b> dan secara otomatis mengirim perintah penghapusan ke <b>Google Spreadsheet</b> terkait. Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Ya, Hapus Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
