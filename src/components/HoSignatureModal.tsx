import React, { useRef, useState, useEffect } from 'react';
import { BaSerahTerimaItem } from '../types';
import { X, CheckCircle, RotateCcw, PenTool, ShieldCheck } from 'lucide-react';

interface HoSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  bastItem: BaSerahTerimaItem | null;
  onApprove: (item: BaSerahTerimaItem, signatureDataUrl: string, signerName: string) => void;
  currentUserName: string;
}

export const HoSignatureModal: React.FC<HoSignatureModalProps> = ({
  isOpen,
  onClose,
  bastItem,
  onApprove,
  currentUserName
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState(currentUserName || 'HO - Balikpapan');

  useEffect(() => {
    if (isOpen) {
      setSignerName(currentUserName || 'HO - Balikpapan');
      setHasDrawn(false);
      setTimeout(clearCanvas, 50);
    }
  }, [isOpen, currentUserName]);

  if (!isOpen || !bastItem) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!hasDrawn) {
      alert('Silakan bubuhkan tanda tangan terlebih dahulu pada kolom yang disediakan.');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    onApprove(bastItem, dataUrl, signerName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#063D2E] border-b border-[#0B4D3B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Approval Digital Sign - ESF HO Balikpapan</h3>
              <p className="text-xs text-emerald-200/70">Verifikasi dan tanda tangani dokumen serah terima peralatan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200/70 hover:text-white rounded-lg hover:bg-[#0a4837] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Document Summary */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">No. BAST:</span>
              <span className="font-mono font-semibold text-emerald-400">{bastItem.noBast}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Jobsite:</span>
              <span className="text-white font-medium">{bastItem.jobsite}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Nama Asset:</span>
              <span className="text-white font-medium">{bastItem.namaAsset} ({bastItem.noRegister || '-'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Penerima di Jobsite (Kolom H):</span>
              <span className="text-emerald-400 font-semibold">{bastItem.penerima || '-'}</span>
            </div>
          </div>

          {/* Signer Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Approver HO Balikpapan
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              placeholder="Contoh: Budi Santoso - Head of ESF"
            />
          </div>

          {/* Canvas Signature Pad */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                Bubuhkan Tanda Tangan Digital di Bawah:
              </label>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" /> Hapus / Ulang
              </button>
            </div>
            <div className="border-2 border-dashed border-slate-700 rounded-xl overflow-hidden bg-white shadow-inner">
              <canvas
                ref={canvasRef}
                width={460}
                height={160}
                className="w-full h-40 cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 italic text-center">
              Gunakan mouse atau sentuhan layar untuk menandatangani dokumen ini.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasDrawn}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition shadow-lg ${
              hasDrawn
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Simpan & Setujui (Approve)
          </button>
        </div>
      </div>
    </div>
  );
};
