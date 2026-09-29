import React, { useState } from 'react';
import { X, ExternalLink, Download, FileText, Image as ImageIcon, Upload, CheckCircle2, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { PdfService } from '../services/pdfService';
import { BaSerahTerimaItem, BaKerusakanItem } from '../types';

interface DokumentasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
  isImage?: boolean;
  folderUrl?: string;
  folderName?: string;
  // BAST & BA Kerusakan specific capabilities
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
  folderName,
  bastItem,
  kerusakanItem,
  onFinalUpload,
  onOpenHoSign,
  isHoUser
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10MB.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExecuteUpload = async () => {
    if (!selectedFile || !fileBase64 || !onFinalUpload) return;
    setIsUploading(true);
    try {
      await onFinalUpload(selectedFile, fileBase64);
      setUploadSuccess(true);
      setTimeout(() => {
        setIsUploading(false);
        onClose();
      }, 1200);
    } catch (e) {
      setIsUploading(false);
      alert('Gagal mengupload dokumen. Silakan coba lagi.');
    }
  };

  const isBase64Img = url && url.startsWith('data:image');
  const isPdf = url && (url.toLowerCase().endsWith('.pdf') || url.startsWith('data:application/pdf'));
  const isDriveLink = url && (url.includes('drive.google.com') || url.startsWith('http'));

  const isHoApproved = bastItem && (Boolean(bastItem.hoSignature) || bastItem.status === 'Terverifikasi HO');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {isImage || isBase64Img ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400">Lampiran Dokumentasi & File Terkait</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Visual / Preview */}
          {url ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col items-center justify-center">
              {isImage || isBase64Img ? (
                <div className="relative max-h-80 w-full flex items-center justify-center overflow-hidden rounded-lg bg-slate-900">
                  <img
                    src={url}
                    alt={title}
                    className="max-h-80 w-auto object-contain rounded-lg border border-slate-800"
                  />
                </div>
              ) : isPdf ? (
                <div className="w-full h-80 rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                  <iframe src={url} className="w-full h-full" title={title} />
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-12 h-12 text-amber-400 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-white mb-1">Dokumen Tersimpan</p>
                  <p className="text-xs text-slate-400 font-mono break-all max-w-md mx-auto">{url}</p>
                </div>
              )}

              {/* Action Buttons for Document */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-800/80 w-full">
                {isDriveLink && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition shadow-lg shadow-blue-600/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka di Google Drive
                  </a>
                )}
                {isBase64Img && (
                  <a
                    href={url}
                    download={`${title.replace(/[^a-zA-Z0-9]/g, '_')}.png`}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Gambar
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">Belum Ada File Terlampir</p>
              <p className="text-xs text-slate-500 mt-1">
                Dokumen belum diunggah atau masih dalam proses sinkronisasi.
              </p>
            </div>
          )}

          {/* Google Drive Folder Shortcut Link */}
          {folderUrl && (
            <div className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-slate-800/80 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">
                    Google Drive Folder: {folderName || 'Penyimpanan'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    File otomatis tersimpan pada cloud folder terintegrasi
                  </p>
                </div>
              </div>
              <a
                href={folderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition"
              >
                Kunjungi Folder
              </a>
            </div>
          )}

          {/* BAST Special Section: PDF Generation & Approval & Final Upload */}
          {bastItem && (
            <div className="p-4 bg-slate-950/70 border border-amber-500/30 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Alur Dokumen BAST & Persetujuan (Two Approvals)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    1. ESF HO Balikpapan &bull; 2. Penerima Jobsite ({bastItem.penerima || 'Kolom H'})
                  </p>
                </div>
                {isHoApproved ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Approved HO
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    Menunggu Approval HO
                  </span>
                )}
              </div>

              {/* Approval & PDF Download Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                {isHoUser && !isHoApproved && onOpenHoSign && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenHoSign();
                    }}
                    className="px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
                  >
                    <ShieldCheck className="w-4 h-4" /> Berikan Tanda Tangan HO Balikpapan
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (!isHoApproved) {
                      alert('Dokumen BAST dapat didownload setelah dilakukan approval berupa tanda tangan digital oleh user HO - Balikpapan.');
                      return;
                    }
                    PdfService.downloadBastPdf(bastItem);
                  }}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                    isHoApproved
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <Download className="w-4 h-4" /> Download PDF Serah Terima
                </button>
              </div>

              {/* Final Upload Feature */}
              {onFinalUpload && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    Final Upload Dokumen BAST (Format Penamaan: {bastItem.noBast})
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf,image/*,.doc,.docx"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={handleExecuteUpload}
                      disabled={!selectedFile || isUploading || uploadSuccess}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition ${
                        uploadSuccess
                          ? 'bg-emerald-600 text-white'
                          : selectedFile
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {uploadSuccess ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terupload
                        </>
                      ) : isUploading ? (
                        'Mengupload...'
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" /> Upload Final
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    File yang diupload akan otomatis tersimpan di Google Drive BAST (Folder: 1NqjCKwHsH1_pVVfxPY95OI6nXcw71wT6) dengan nama file "{bastItem.noBast}".
                  </p>
                </div>
              )}
            </div>
          )}

          {/* BA Kerusakan Special Section: PDF Generation & Final Upload (Requirement 3) */}
          {kerusakanItem && (
            <div className="p-4 bg-slate-950/70 border border-amber-500/30 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Dokumen Berita Acara Kerusakan Alat (4 Approval)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Approval: 1. Pembuat BA &bull; 2. Toolkeeper &bull; 3. Planner/TE &bull; 4. Dept Head
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => PdfService.downloadBaKerusakanPdf(kerusakanItem)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF BA Kerusakan
                </button>
              </div>

              {/* Final Upload for BA Kerusakan */}
              {onFinalUpload && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    Final Upload Dokumen BA Kerusakan (Format Penamaan: {kerusakanItem.noBa || 'BA-KERUSAKAN'})
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf,image/*,.doc,.docx"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={handleExecuteUpload}
                      disabled={!selectedFile || isUploading || uploadSuccess}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition ${
                        uploadSuccess
                          ? 'bg-emerald-600 text-white'
                          : selectedFile
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {uploadSuccess ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terupload
                        </>
                      ) : isUploading ? (
                        'Mengupload...'
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" /> Upload Final
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    File yang diupload akan otomatis tersimpan di Google Drive BA Kerusakan (Folder: 10CGksP6f116XPGWjh23-4UR1wlypI5TM) dengan nama file "{kerusakanItem.noBa || 'BA-KERUSAKAN'}".
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
