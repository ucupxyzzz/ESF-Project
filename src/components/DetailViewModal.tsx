import React from 'react';
import {
  X,
  Eye,
  Calendar,
  MapPin,
  Tag,
  ShieldCheck,
  AlertCircle,
  FileText,
  User,
  Clock,
  Briefcase,
  Layers,
  Wrench,
  CheckCircle2,
  Copy,
  Printer
} from 'lucide-react';
import { SheetModule, AssetItem, ToolboxItem, PeminjamanItem } from '../types';

interface DetailViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: SheetModule;
  item: any;
  onEdit?: (item: any) => void;
}

export const DetailViewModal: React.FC<DetailViewModalProps> = ({
  isOpen,
  onClose,
  module,
  item,
  onEdit
}) => {
  if (!isOpen || !item) return null;

  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getHeaderInfo = () => {
    switch (module) {
      case 'populasi-asset':
        return {
          title: 'Rincian Lengkap Populasi Asset',
          subtitle: `No Registrasi: ${item.noRegistrasi || '-'} • ${item.namaAsset || '-'}`,
          badge: item.kategori || 'Common Tools'
        };
      case 'populasi-toolbox':
        return {
          title: 'Rincian Lengkap Populasi Toolbox',
          subtitle: `No Toolbox: ${item.noToolbox || '-'} • ${item.namaToolbox || '-'}`,
          badge: item.jenisToolbox || item.kategori || 'Toolbox'
        };
      case 'peminjaman-tools':
        return {
          title: 'Rincian Lengkap Peminjaman Tools',
          subtitle: `ID Peminjaman: ${item.idPeminjaman || item.noPeminjaman || '-'} • Peminjam: ${item.peminjam || '-'}`,
          badge: item.status || 'Dipinjam'
        };
      default:
        return {
          title: 'Rincian Data Dokumen',
          subtitle: item.id || '',
          badge: module
        };
    }
  };

  const { title, subtitle, badge } = getHeaderInfo();

  const renderBadgeStatus = (value: string | undefined, type: 'kondisi' | 'status') => {
    if (!value) return <span className="text-slate-400 italic">-</span>;
    const lower = value.toLowerCase();

    if (type === 'status') {
      if (lower === 'kembali') {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {value}
          </span>
        );
      }
      if (lower === 'terlambat') {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5" />
            {value}
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <Clock className="w-3.5 h-3.5" />
          {value}
        </span>
      );
    }

    // Kondisi
    if (lower.includes('baik') || lower.includes('ready')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          {value}
        </span>
      );
    }
    if (lower.includes('ringan') || lower.includes('minor')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <AlertCircle className="w-3.5 h-3.5" />
          {value}
        </span>
      );
    }
    if (lower.includes('berat') || lower.includes('non-operational')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <AlertCircle className="w-3.5 h-3.5" />
          {value}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
        {value}
      </span>
    );
  };

  const renderField = (
    label: string,
    value: React.ReactNode,
    options?: {
      icon?: React.ReactNode;
      isFullWidth?: boolean;
      copyableText?: string;
      isHighlighted?: boolean;
    }
  ) => {
    return (
      <div
        className={`p-3 rounded-xl border transition-all ${
          options?.isHighlighted
            ? 'bg-emerald-50/70 border-emerald-200'
            : 'bg-slate-50/80 border-slate-200/90'
        } ${options?.isFullWidth ? 'sm:col-span-2' : ''}`}
      >
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
          <span className="flex items-center gap-1.5">
            {options?.icon}
            {label}
          </span>
          {options?.copyableText && (
            <button
              type="button"
              onClick={() => handleCopy(options.copyableText!, label)}
              className="text-[10px] text-slate-400 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
              title="Salin ke Clipboard"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedKey === label ? 'Tersalin!' : 'Salin'}</span>
            </button>
          )}
        </div>
        <div className="text-xs font-semibold text-slate-900 break-words">
          {value || <span className="text-slate-400 italic font-normal">-</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-white border border-[#0B4D3B]/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Header Modal - Hijau Identitas Aplikasi */}
        <div className="px-6 py-4 bg-[#063D2E] border-b border-[#0B4D3B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">{title}</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                  {badge}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 truncate max-w-md mt-0.5 font-mono">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200/80 hover:text-white rounded-lg hover:bg-[#0a4837] transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Detail Fields */}
        <div className="p-6 overflow-y-auto space-y-4 bg-white text-slate-800">
          {/* ============================================================== */}
          {/* 1. POPULASI ASSET                                              */}
          {/* ============================================================== */}
          {module === 'populasi-asset' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {renderField(
                'No Registrasi (Kolom A)',
                <span className="font-mono text-emerald-800 font-bold">{item.noRegistrasi}</span>,
                { icon: <Tag className="w-3.5 h-3.5 text-emerald-600" />, copyableText: item.noRegistrasi }
              )}
              {renderField(
                'Nama Asset (Kolom B)',
                item.namaAsset,
                { icon: <Wrench className="w-3.5 h-3.5 text-slate-500" />, copyableText: item.namaAsset }
              )}
              {renderField(
                'Kategori (Kolom C)',
                item.kategori || 'Common Tools',
                { icon: <Layers className="w-3.5 h-3.5 text-slate-500" /> }
              )}
              {renderField(
                'Merk / Brand (Kolom D)',
                item.merkBrand,
                { icon: <Briefcase className="w-3.5 h-3.5 text-slate-500" /> }
              )}
              {renderField(
                'No PO (Kolom E)',
                item.noPo ? <span className="font-mono">{item.noPo}</span> : '-',
                { icon: <FileText className="w-3.5 h-3.5 text-slate-500" />, copyableText: item.noPo }
              )}
              {renderField(
                'Tgl Supply (Kolom F)',
                item.tglSupply,
                { icon: <Calendar className="w-3.5 h-3.5 text-emerald-600" /> }
              )}
              {renderField(
                'Lokasi / Penempatan (Kolom G)',
                item.lokasiPenempatan,
                { icon: <MapPin className="w-3.5 h-3.5 text-slate-500" /> }
              )}
              {renderField(
                'Jobsite (Kolom H)',
                <span className="px-2.5 py-0.5 rounded-md font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300">
                  {item.jobsite}
                </span>,
                { icon: <MapPin className="w-3.5 h-3.5 text-emerald-700" />, isHighlighted: true }
              )}
              {renderField(
                'Kondisi Awal (Kolom I)',
                renderBadgeStatus(item.kondisiAwal, 'kondisi'),
                { icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> }
              )}
              {renderField(
                'Tanggal Penginputan (Kolom K)',
                item.tanggalPenginputan || item.tglInput || item.tglSupply || '-',
                { icon: <Clock className="w-3.5 h-3.5 text-slate-500" /> }
              )}
              {renderField(
                'Spesifikasi & Keterangan Tambahan (Kolom J)',
                <div className="whitespace-pre-line text-slate-700 leading-relaxed font-normal bg-white p-3 rounded-lg border border-slate-200 mt-1">
                  {item.spesifikasiKeterangan || <span className="text-slate-400 italic">Tidak ada spesifikasi tambahan</span>}
                </div>,
                { icon: <FileText className="w-3.5 h-3.5 text-emerald-700" />, isFullWidth: true }
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. POPULASI TOOLBOX                                            */}
          {/* ============================================================== */}
          {module === 'populasi-toolbox' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {renderField(
                'No Toolbox (Kolom A)',
                <span className="font-mono text-emerald-800 font-bold">{item.noToolbox}</span>,
                { icon: <Tag className="w-3.5 h-3.5 text-emerald-600" />, copyableText: item.noToolbox }
              )}
              {renderField(
                'Nama Toolbox (Kolom B)',
                item.namaToolbox,
                { icon: <Wrench className="w-3.5 h-3.5 text-slate-500" />, copyableText: item.namaToolbox }
              )}
              {renderField(
                'Kategori (Kolom C)',
                item.jenisToolbox || item.kategori || 'Common Tools',
                { icon: <Layers className="w-3.5 h-3.5 text-slate-500" /> }
              )}
              {renderField(
                'Merk / Brand (Kolom D)',
                item.merkBrand,
                { icon: <Briefcase className="w-3.5 h-3.5 text-slate-500" /> }
              )}
              {renderField(
                'No PO (Kolom E)',
                item.jumlahItem || item.noPo || '-',
                { icon: <FileText className="w-3.5 h-3.5 text-slate-500" />, copyableText: item.jumlahItem || item.noPo }
              )}
              {renderField(
                'Tgl Supply (Kolom F)',
                item.tglSupply,
                { icon: <Calendar className="w-3.5 h-3.5 text-emerald-600" /> }
              )}
              {renderField(
                'Lokasi Penempatan (Kolom G)',
                item.lokasiPenempatan,
                { icon: <MapPin className="w-3.5 h-3.5 text-slate-500" /> }
              )}
              {renderField(
                'Jobsite (Kolom H)',
                <span className="px-2.5 py-0.5 rounded-md font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300">
                  {item.jobsite}
                </span>,
                { icon: <MapPin className="w-3.5 h-3.5 text-emerald-700" />, isHighlighted: true }
              )}
              {renderField(
                'Kondisi (Kolom I)',
                renderBadgeStatus(item.kondisi, 'kondisi'),
                { icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> }
              )}
              {renderField(
                'PIC Penanggung Jawab (Kolom J)',
                item.pic ? (
                  <span className="font-semibold text-slate-900">{item.pic}</span>
                ) : (
                  <span className="text-slate-400 italic">Belum Ditentukan</span>
                ),
                { icon: <User className="w-3.5 h-3.5 text-emerald-600" /> }
              )}
              {renderField(
                'Keterangan (Kolom K)',
                <div className="whitespace-pre-line text-slate-700 leading-relaxed font-normal bg-white p-3 rounded-lg border border-slate-200 mt-1">
                  {item.keterangan || <span className="text-slate-400 italic">Tidak ada keterangan</span>}
                </div>,
                { icon: <FileText className="w-3.5 h-3.5 text-slate-500" />, isFullWidth: true }
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. PEMINJAMAN TOOLS                                            */}
          {/* ============================================================== */}
          {module === 'peminjaman-tools' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {renderField(
                'ID Peminjaman (Kolom A)',
                <span className="font-mono text-emerald-800 font-bold">{item.idPeminjaman || item.noPeminjaman}</span>,
                { icon: <Tag className="w-3.5 h-3.5 text-emerald-600" />, copyableText: item.idPeminjaman || item.noPeminjaman }
              )}
              {renderField(
                'Kode Alat (Kolom B)',
                <span className="font-mono">{item.kodeAlat || item.noRegistrasi || '-'}</span>,
                { icon: <Tag className="w-3.5 h-3.5 text-slate-500" />, copyableText: item.kodeAlat || item.noRegistrasi }
              )}
              {renderField(
                'Nama Asset (Kolom C)',
                item.namaAsset || item.namaTool || '-',
                { icon: <Wrench className="w-3.5 h-3.5 text-slate-500" /> }
              )}
              {renderField(
                'Kategori (Kolom D)',
                item.kategori || 'Common Tools',
                { icon: <Layers className="w-3.5 h-3.5 text-slate-500" /> }
              )}
              {renderField(
                'Jobsite (Kolom E)',
                <span className="px-2.5 py-0.5 rounded-md font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300">
                  {item.jobsite}
                </span>,
                { icon: <MapPin className="w-3.5 h-3.5 text-emerald-700" />, isHighlighted: true }
              )}
              {renderField(
                'Peminjam (Kolom F)',
                <span className="font-bold text-slate-900">{item.peminjam}</span>,
                { icon: <User className="w-3.5 h-3.5 text-emerald-600" /> }
              )}
              {renderField(
                'Section / Departemen (Kolom G)',
                item.section || 'Plant Maintenance',
                { icon: <Briefcase className="w-3.5 h-3.5 text-slate-500" /> }
              )}
              {renderField(
                'Tgl Pinjam (Kolom H)',
                item.tglPinjam,
                { icon: <Calendar className="w-3.5 h-3.5 text-emerald-600" /> }
              )}
              {renderField(
                'Estimasi Kembali (Kolom I)',
                item.estimasiKembali || item.tglRencanaKembali || '-',
                { icon: <Calendar className="w-3.5 h-3.5 text-amber-600" /> }
              )}
              {renderField(
                'Tgl Realisasi Kembali (Kolom J)',
                item.tglRealisasiKembali ? (
                  <span className="font-mono text-emerald-800 font-bold">{item.tglRealisasiKembali}</span>
                ) : (
                  <span className="text-amber-600 font-medium">Belum Dikembalikan</span>
                ),
                { icon: <Calendar className="w-3.5 h-3.5 text-emerald-700" /> }
              )}
              {renderField(
                'Status (Kolom K)',
                renderBadgeStatus(item.status, 'status'),
                { icon: <Clock className="w-3.5 h-3.5 text-slate-500" /> }
              )}
              {renderField(
                'Kondisi Awal (Kolom L)',
                renderBadgeStatus(item.kondisiAwal, 'kondisi'),
                { icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> }
              )}
              {renderField(
                'Kondisi Akhir (Kolom M)',
                renderBadgeStatus(item.kondisiAkhir, 'kondisi'),
                { icon: <AlertCircle className="w-3.5 h-3.5 text-slate-500" />, isFullWidth: false }
              )}
              {renderField(
                'Keperluan (Kolom N)',
                <div className="whitespace-pre-line text-slate-700 leading-relaxed font-normal bg-white p-3 rounded-lg border border-slate-200 mt-1">
                  {item.keperluan || <span className="text-slate-400 italic">Tidak ada catatan keperluan</span>}
                </div>,
                { icon: <FileText className="w-3.5 h-3.5 text-slate-500" />, isFullWidth: true }
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* GENERAL FALLBACK                                               */}
          {/* ============================================================== */}
          {!['populasi-asset', 'populasi-toolbox', 'peminjaman-tools'].includes(module) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {Object.entries(item).map(([key, value]) => {
                if (key === 'id' || key === 'fileData' || typeof value === 'object') return null;
                return renderField(key, String(value || '-'), { icon: <Tag className="w-3.5 h-3.5 text-slate-400" /> });
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white/95 backdrop-blur flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
            Disinkronkan otomatis dengan Google Spreadsheet
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition cursor-pointer"
              >
                Edit Data
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
