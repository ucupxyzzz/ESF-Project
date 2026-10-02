import React from 'react';
import { X, ExternalLink, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { BaSerahTerimaItem, BaKerusakanItem } from '../types';

interface DokumentasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
  isImage?: boolean;
  folderUrl?: string;
  folderName?: string;
  // Optional references
  bastItem?: BaSerahTerimaItem | null;
  kerusakanItem?: BaKerusakanItem | null;
  onFinalUpload?: (file: File, base64: string) => void;
  onOpenHoSign?: () => void;
  isHoUser?: boolean;
}

export const DokumentasiModal: React.FC<DokumentasiModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  isImage,
  folderUrl,
  folderName
}) => {
  if (!isOpen) return null;

  const isBase64Img = url && url.startsWith('data:image');
  const isPdf = url && (url.toLowerCase().endsWith('.pdf') || url.startsWith('data:application/pdf'));
  const isDriveLink = url && (url.includes('drive.google.com') || url.startsWith('http'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border border-[#0B4D3B]/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-[#063D2E] border-b border-[#0B4D3B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              {isImage || isBase64Img ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-emerald-200/80">Lampiran Dokumentasi & File Terkait</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200/70 hover:text-white rounded-lg hover:bg-[#0a4837] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white">
          {/* Main Visual / Preview */}
          {url ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col items-center justify-center">
              {isImage || isBase64Img ? (
                <div className="relative max-h-80 w-full flex items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                  <img
                    src={url}
                    alt={title}
                    className="max-h-80 w-auto object-contain rounded-lg border border-slate-300 shadow-xs"
                  />
                </div>
              ) : isPdf ? (
                <div className="w-full h-80 rounded-lg overflow-hidden border border-slate-300 bg-slate-100">
                  <iframe src={url} className="w-full h-full" title={title} />
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-12 h-12 text-emerald-600 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-slate-900 mb-1">Dokumen Tersimpan</p>
                  <p className="text-xs text-slate-500 font-mono break-all max-w-md mx-auto">{url}</p>
                </div>
              )}

              {/* Action Buttons for Document */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-200 w-full">
                {isDriveLink && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka di Google Drive
                  </a>
                )}
                {isBase64Img && (
                  <a
                    href={url}
                    download={`${title.replace(/[^a-zA-Z0-9]/g, '_')}.png`}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Gambar
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Belum Ada File Terlampir</p>
              <p className="text-xs text-slate-500 mt-1">
                Dokumen belum diunggah atau masih dalam proses sinkronisasi.
              </p>
            </div>
          )}

          {/* Google Drive Folder Shortcut Link */}
          {folderUrl && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">
                    Google Drive Folder: {folderName || 'Penyimpanan'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    File otomatis tersimpan pada cloud folder terintegrasi
                  </p>
                </div>
              </div>
              <a
                href={folderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                Kunjungi Folder
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
