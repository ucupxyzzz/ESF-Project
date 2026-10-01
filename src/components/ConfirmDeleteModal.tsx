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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border border-rose-200 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Konfirmasi Penghapusan Data
            </h3>
            <p className="text-xs text-rose-600 font-semibold">Otorisasi Eksklusif HO - Balikpapan</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="text-slate-600">
            Modul: <span className="font-semibold text-slate-900">{moduleName}</span>
          </div>
          <div className="text-slate-600">
            Kunci/ID: <span className="font-mono font-bold text-emerald-700">{itemKey}</span>
          </div>
          <div className="text-slate-600">
            Nama/Deskripsi: <span className="font-semibold text-slate-800">{itemName}</span>
          </div>
          <div className="text-slate-600">
            Jobsite: <span className="font-bold text-emerald-800">{jobsite}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Tindakan ini akan <b>menghapus data dari aplikasi</b> dan secara otomatis mengirim perintah penghapusan ke <b>Google Spreadsheet</b> terkait. Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-300 cursor-pointer transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Ya, Hapus Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
