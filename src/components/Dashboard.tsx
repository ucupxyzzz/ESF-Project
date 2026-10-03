import React from 'react';
import {
  AssetItem,
  ToolboxItem,
  PeminjamanItem,
  PengadaanItem,
  BaKerusakanItem,
  OsrItem,
  BaSerahTerimaItem,
  User,
  SheetModule
} from '../types';
import { ALL_JOBSITES } from '../data/defaultUsers';
import {
  Boxes,
  Briefcase,
  ArrowLeftRight,
  ShoppingCart,
  AlertTriangle,
  Wrench,
  FileCheck2,
  CheckCircle2,
  Building2,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Plus,
  Calendar,
  Layers,
  ArrowUpRight,
  Clock,
  FileText
} from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  activeJobsite: string; // 'ALL' or specific jobsite
  assets: AssetItem[];
  toolboxes: ToolboxItem[];
  peminjaman: PeminjamanItem[];
  pengadaan: PengadaanItem[];
  kerusakan: BaKerusakanItem[];
  osr: OsrItem[];
  bast: BaSerahTerimaItem[];
  onNavigate: (module: SheetModule) => void;
  onOpenCreateModal: (module: SheetModule) => void;
  onManualSync: () => void;
  isSyncing: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  activeJobsite,
  assets,
  toolboxes,
  peminjaman,
  pengadaan,
  kerusakan,
  osr,
  bast,
  onNavigate,
  onOpenCreateModal,
  onManualSync,
  isSyncing
}) => {
  const isHO = currentUser.role === 'ho';

  // Helper for computing clean percentages (e.g. 25%, 33.3%, 0%)
  const formatPct = (count: number, total: number): string => {
    if (!total || total <= 0) return '0%';
    const val = (count / total) * 100;
    return val % 1 === 0 ? `${val}%` : `${val.toFixed(1)}%`;
  };

  // ==============================================================
  // 1. TOTAL ASSETS (Modul: "Populasi Asset")
  // ==============================================================
  const totalAssets = assets.length;
  const assetBaikCount = assets.filter((a) => {
    const k = (a.kondisiAwal || '').toLowerCase();
    return k.includes('baik') || k.includes('ready');
  }).length;
  const assetRusakBeratCount = assets.filter((a) => {
    const k = (a.kondisiAwal || '').toLowerCase();
    return k.includes('berat') || k.includes('non-operational');
  }).length;
  const assetRusakRinganCount = assets.filter((a) => {
    const k = (a.kondisiAwal || '').toLowerCase();
    return k.includes('ringan') || k.includes('minor');
  }).length;
  const assetMaintenanceCount = assets.filter((a) => {
    const k = (a.kondisiAwal || '').toLowerCase();
    return k.includes('perbaiki') || k.includes('maint') || k.includes('sedang');
  }).length;
  const readyPercent = totalAssets > 0 ? Math.round((assetBaikCount / totalAssets) * 100) : 0;
  // Aliases for compatibility with legacy charts
  const baikCount = assetBaikCount;
  const rusakRinganCount = assetRusakRinganCount;
  const rusakBeratCount = assetRusakBeratCount;
  const maintenanceCount = assetMaintenanceCount;

  // ==============================================================
  // 2. TOOL BOX (Modul: "Populasi Toolbox")
  // ==============================================================
  const totalToolboxes = toolboxes.length;
  const toolboxLengkapCount = toolboxes.filter((t) => {
    const k = (t.kondisi || '').toLowerCase();
    return (k.includes('lengkap') && !k.includes('tidak')) || (k.includes('baik') && !k.includes('tidak'));
  }).length;
  const toolboxTidakLengkapCount = toolboxes.filter((t) => {
    const k = (t.kondisi || '').toLowerCase();
    return k.includes('tidak') || k.includes('hilang') || k.includes('kurang') || (!k.includes('lengkap') && !k.includes('baik') && k.length > 0);
  }).length;

  // ==============================================================
  // 3. OSR TOOLS & FACILITY (Modul: "OSR Tools & Facility")
  // Remarks: Waiting Administrasi, Under Repair, Waiting PO, Waiting PR, Waiting Quotation, Cancel Repair, Done Supply
  // ==============================================================
  const totalOsr = osr.length;
  const osrWaitingAdmin = osr.filter((o) => {
    const r = `${o.remarks || ''} ${o.keterangan || ''} ${o.condition || ''} ${o.status || ''}`.toLowerCase();
    return r.includes('admin');
  }).length;
  const osrUnderRepair = osr.filter((o) => {
    const r = `${o.remarks || ''} ${o.keterangan || ''} ${o.condition || ''} ${o.status || ''}`.toLowerCase();
    return (r.includes('under repair') || r.includes('dikerjakan') || (r.includes('repair') && !r.includes('cancel')));
  }).length;
  const osrWaitingPo = osr.filter((o) => {
    const r = `${o.remarks || ''} ${o.keterangan || ''} ${o.condition || ''}`.toLowerCase();
    return r.includes('waiting po') || (r.includes('po') && !r.includes('pr') && r.includes('waiting'));
  }).length;
  const osrWaitingPr = osr.filter((o) => {
    const r = `${o.remarks || ''} ${o.keterangan || ''} ${o.condition || ''}`.toLowerCase();
    return r.includes('waiting pr') || (r.includes('pr') && r.includes('waiting'));
  }).length;
  const osrWaitingQuotation = osr.filter((o) => {
    const r = `${o.remarks || ''} ${o.keterangan || ''} ${o.condition || ''}`.toLowerCase();
    return r.includes('quotation') || r.includes('penawaran') || r.includes('quote');
  }).length;
  const osrCancelRepair = osr.filter((o) => {
    const r = `${o.remarks || ''} ${o.keterangan || ''} ${o.condition || ''}`.toLowerCase();
    return r.includes('cancel') || r.includes('batal');
  }).length;
  const osrDoneSupply = osr.filter((o) => {
    const r = `${o.remarks || ''} ${o.keterangan || ''} ${o.condition || ''} ${o.status || ''}`.toLowerCase();
    return r.includes('done') || r.includes('supply') || r.includes('selesai');
  }).length;
  const activeOsr = osrUnderRepair > 0 ? osrUnderRepair : osr.filter((o) => o.status === 'Sedang Dikerjakan' || o.status === 'Testing').length;

  // ==============================================================
  // 4. ALAT DIPINJAM (Modul: "Peminjaman Tools")
  // ==============================================================
  const totalPeminjaman = peminjaman.length;
  const pjmDipinjam = peminjaman.filter((p) => p.status === 'Dipinjam').length;
  const pjmTerlambat = peminjaman.filter((p) => p.status === 'Terlambat').length;
  const pjmKembali = peminjaman.filter((p) => p.status === 'Kembali').length;
  const activeLoans = pjmDipinjam + pjmTerlambat;

  // ==============================================================
  // 5. BA KERUSAKAN ALAT (Modul: "BA Kerusakan Alat")
  // Action: Out Site Repair, In Site Repair, Pergantian Baru
  // ==============================================================
  const totalKerusakan = kerusakan.length;
  const baOutSiteRepair = kerusakan.filter((k) => {
    const a = `${k.action || ''} ${k.tindakanKorektif || ''}`.toLowerCase();
    return a.includes('out') || a.includes('osr');
  }).length;
  const baInSiteRepair = kerusakan.filter((k) => {
    const a = `${k.action || ''} ${k.tindakanKorektif || ''}`.toLowerCase();
    return a.includes('in site') || (a.includes('in') && !a.includes('out'));
  }).length;
  const baPergantianBaru = kerusakan.filter((k) => {
    const a = `${k.action || ''} ${k.tindakanKorektif || ''}`.toLowerCase();
    return a.includes('ganti') || a.includes('baru') || a.includes('pergantian');
  }).length;
  const openKerusakan = kerusakan.filter((k) => k.status === 'Investigasi' || k.status === 'Review HO').length;

  // ==============================================================
  // 6. PENGADAAN BARANG (Modul: "Pengadaan Barang")
  // Status: O/S PR, O/S PO, O/S GR, O/S GI
  // ==============================================================
  const totalPengadaan = pengadaan.length;
  const pgdOsPr = pengadaan.filter((p) => {
    const s = (p.status || '').toUpperCase();
    return s.includes('PR') || s === 'O/S PR' || s.includes('DIAJUKAN');
  }).length;
  const pgdOsPo = pengadaan.filter((p) => {
    const s = (p.status || '').toUpperCase();
    return s.includes('PO') || s === 'O/S PO' || s.includes('DISETUJUI');
  }).length;
  const pgdOsGr = pengadaan.filter((p) => {
    const s = (p.status || '').toUpperCase();
    return s.includes('GR') || s === 'O/S GR' || s.includes('PENGIRIMAN');
  }).length;
  const pgdOsGi = pengadaan.filter((p) => {
    const s = (p.status || '').toUpperCase();
    return s.includes('GI') || s === 'O/S GI' || s.includes('DITERIMA') || s.includes('SELESAI');
  }).length;
  const pendingPengadaan = pgdOsPr + pgdOsPo;

  // Category breakdown
  const categoryMap: { [cat: string]: number } = {};
  assets.forEach((a) => {
    const cat = a.kategori || 'Lainnya';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  // Color palette for category chart matching image.png (Green, Blue, Amber, Purple, Gray)
  const categoryPalette = ['#059669', '#2563EB', '#D97706', '#9333EA', '#64748B'];

  // Top 5 categories for donut chart
  const donutCategories = topCategories.slice(0, 5);
  const otherCount = topCategories.slice(5).reduce((sum, item) => sum + item[1], 0);
  if (otherCount > 0 && donutCategories.length === 5) {
    donutCategories[4] = ['Lainnya', donutCategories[4][1] + otherCount];
  }

  // Calculate SVG Donut strokeDasharray offsets
  let accumulatedPercent = 0;
  const donutSlices = donutCategories.map(([name, count], idx) => {
    const pct = totalAssets > 0 ? (count / totalAssets) * 100 : 0;
    const slice = {
      name,
      count,
      percent: Math.round(pct),
      color: categoryPalette[idx % categoryPalette.length],
      dashArray: `${pct * 2.83} ${283 - pct * 2.83}`,
      dashOffset: -accumulatedPercent * 2.83
    };
    accumulatedPercent += pct;
    return slice;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Deep Forest Green Enterprise Style */}
      <div className="bg-[#063D2E] border border-[#0B4D3B] rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden text-white">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#0E5642] text-emerald-200 border border-emerald-400/30">
                {isHO ? 'Head Office View (Super Admin)' : `Site Unit: ${currentUser.jobsite}`}
              </span>
              <span className="text-xs text-emerald-200/70">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Dashboard {activeJobsite === 'ALL' ? 'Seluruh Jobsite' : activeJobsite}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
              {isHO
                ? 'Sistem manajemen aset, peminjaman alat, pengadaan, dan pelaporan kerusakan PT Karunia Group terpadu.'
                : `Menampilkan ringkasan inventaris dan pergerakan alat kerja aktif untuk area ${activeJobsite}.`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onManualSync}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-[#0E5642] hover:bg-[#126850] border border-emerald-400/30 text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-300 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sync Spreadsheet'}</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenCreateModal('populasi-asset')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-[#063D2E] text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Asset Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Main KPI Stat Cards with Actual Module Data & Percentage Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* ============================================================== */}
        {/* Card 1: TOTAL ASSETS (Populasi Asset)                          */}
        {/* ============================================================== */}
        <div
          onClick={() => onNavigate('populasi-asset')}
          className="bg-white border border-slate-200/90 hover:border-emerald-500/60 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                    TOTAL ASSETS
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Modul Populasi Asset
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-emerald-700 transition-colors">
                <span>Buka</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1 mb-3.5 pb-2.5 border-b border-slate-100">
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {totalAssets.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-500 ml-1.5">Total Asset</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {readyPercent}% Ready
              </span>
            </div>

            {/* Status Breakdown with Count & Percentage */}
            <div className="space-y-1.5">
              {[
                {
                  label: 'Baik (Ready for Operation)',
                  count: assetBaikCount,
                  pct: formatPct(assetBaikCount, totalAssets),
                  dot: 'bg-emerald-500',
                  badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                },
                {
                  label: 'Rusak Ringan (Minor Defect)',
                  count: assetRusakRinganCount,
                  pct: formatPct(assetRusakRinganCount, totalAssets),
                  dot: 'bg-amber-400',
                  badge: 'bg-amber-50 text-amber-700 border-amber-200'
                },
                {
                  label: 'Sedang Diperbaiki (Maintenance)',
                  count: assetMaintenanceCount,
                  pct: formatPct(assetMaintenanceCount, totalAssets),
                  dot: 'bg-sky-500',
                  badge: 'bg-sky-50 text-sky-700 border-sky-200'
                },
                {
                  label: 'Rusak Berat (Non-Operational)',
                  count: assetRusakBeratCount,
                  pct: formatPct(assetRusakBeratCount, totalAssets),
                  dot: 'bg-rose-500',
                  badge: 'bg-rose-50 text-rose-700 border-rose-200'
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                    <span className="text-slate-600 font-medium truncate text-[11px]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                    <span className="font-bold text-slate-800">{item.count}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${item.badge}`}>
                      {item.pct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Card 2: TOOL BOX (Populasi Toolbox)                            */}
        {/* ============================================================== */}
        <div
          onClick={() => onNavigate('populasi-toolbox')}
          className="bg-white border border-slate-200/90 hover:border-amber-500/60 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                    TOOL BOX
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium">
                    Modul Populasi Toolbox
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-amber-700 transition-colors">
                <span>Buka</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1 mb-3.5 pb-2.5 border-b border-slate-100">
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {totalToolboxes.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-500 ml-1.5">Box Terdaftar</span>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                {formatPct(toolboxLengkapCount, totalToolboxes)} Lengkap
              </span>
            </div>

            {/* Status Breakdown with Count & Percentage */}
            <div className="space-y-1.5">
              {[
                {
                  label: 'Lengkap & Baik',
                  count: toolboxLengkapCount,
                  pct: formatPct(toolboxLengkapCount, totalToolboxes),
                  dot: 'bg-emerald-500',
                  badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                },
                {
                  label: 'Tidak Lengkap',
                  count: toolboxTidakLengkapCount,
                  pct: formatPct(toolboxTidakLengkapCount, totalToolboxes),
                  dot: 'bg-rose-500',
                  badge: 'bg-rose-50 text-rose-700 border-rose-200'
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                    <span className="text-slate-600 font-medium truncate text-[11px]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                    <span className="font-bold text-slate-800">{item.count}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${item.badge}`}>
                      {item.pct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Card 3: OSR TOOLS & FACILITY (OSR Tools & Facility)            */}
        {/* ============================================================== */}
        <div
          onClick={() => onNavigate('osr-tools')}
          className="bg-white border border-slate-200/90 hover:border-cyan-500/60 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200/70 flex items-center justify-center text-cyan-700 group-hover:scale-105 transition-transform">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                    OSR TOOLS & FACILITY
                  </span>
                  <span className="text-[10px] text-cyan-700 font-medium">
                    Modul OSR Tools & Facility
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-cyan-700 transition-colors">
                <span>Buka</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1 mb-3.5 pb-2.5 border-b border-slate-100">
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {totalOsr.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-500 ml-1.5">Total OSR</span>
              </div>
              <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
                {osrUnderRepair} In Repair
              </span>
            </div>

            {/* Remarks Breakdown with Count & Percentage */}
            <div className="space-y-1">
              {[
                {
                  label: 'Waiting Administrasi',
                  count: osrWaitingAdmin,
                  pct: formatPct(osrWaitingAdmin, totalOsr),
                  dot: 'bg-slate-400',
                  badge: 'bg-slate-50 text-slate-700 border-slate-200'
                },
                {
                  label: 'Under Repair',
                  count: osrUnderRepair,
                  pct: formatPct(osrUnderRepair, totalOsr),
                  dot: 'bg-amber-500',
                  badge: 'bg-amber-50 text-amber-700 border-amber-200'
                },
                {
                  label: 'Waiting PO',
                  count: osrWaitingPo,
                  pct: formatPct(osrWaitingPo, totalOsr),
                  dot: 'bg-blue-500',
                  badge: 'bg-blue-50 text-blue-700 border-blue-200'
                },
                {
                  label: 'Waiting PR',
                  count: osrWaitingPr,
                  pct: formatPct(osrWaitingPr, totalOsr),
                  dot: 'bg-indigo-500',
                  badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
                },
                {
                  label: 'Waiting Quotation',
                  count: osrWaitingQuotation,
                  pct: formatPct(osrWaitingQuotation, totalOsr),
                  dot: 'bg-purple-500',
                  badge: 'bg-purple-50 text-purple-700 border-purple-200'
                },
                {
                  label: 'Cancel Repair',
                  count: osrCancelRepair,
                  pct: formatPct(osrCancelRepair, totalOsr),
                  dot: 'bg-rose-500',
                  badge: 'bg-rose-50 text-rose-700 border-rose-200'
                },
                {
                  label: 'Done Supply',
                  count: osrDoneSupply,
                  pct: formatPct(osrDoneSupply, totalOsr),
                  dot: 'bg-emerald-500',
                  badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5 px-2 rounded-lg hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                    <span className="text-slate-600 font-medium truncate text-[11px]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                    <span className="font-bold text-slate-800">{item.count}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${item.badge}`}>
                      {item.pct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Card 4: ALAT DIPINJAM (Peminjaman Tools)                       */}
        {/* ============================================================== */}
        <div
          onClick={() => onNavigate('peminjaman-tools')}
          className="bg-white border border-slate-200/90 hover:border-purple-500/60 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/70 flex items-center justify-center text-purple-700 group-hover:scale-105 transition-transform">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                    ALAT DIPINJAM
                  </span>
                  <span className="text-[10px] text-purple-700 font-medium">
                    Modul Peminjaman Tools
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-purple-700 transition-colors">
                <span>Buka</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1 mb-3.5 pb-2.5 border-b border-slate-100">
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {activeLoans.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-500 ml-1.5">Sedang Dipinjam</span>
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                {totalPeminjaman} Transaksi
              </span>
            </div>

            {/* Status Breakdown with Count & Percentage */}
            <div className="space-y-1.5">
              {[
                {
                  label: 'Dipinjam (Active)',
                  count: pjmDipinjam,
                  pct: formatPct(pjmDipinjam, totalPeminjaman),
                  dot: 'bg-purple-500',
                  badge: 'bg-purple-50 text-purple-700 border-purple-200'
                },
                {
                  label: 'Terlambat (Overdue)',
                  count: pjmTerlambat,
                  pct: formatPct(pjmTerlambat, totalPeminjaman),
                  dot: 'bg-rose-500',
                  badge: 'bg-rose-50 text-rose-700 border-rose-200'
                },
                {
                  label: 'Kembali (Returned)',
                  count: pjmKembali,
                  pct: formatPct(pjmKembali, totalPeminjaman),
                  dot: 'bg-emerald-500',
                  badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                    <span className="text-slate-600 font-medium truncate text-[11px]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                    <span className="font-bold text-slate-800">{item.count}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${item.badge}`}>
                      {item.pct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Card 5: BA KERUSAKAN ALAT (BA Kerusakan Alat)                  */}
        {/* ============================================================== */}
        <div
          onClick={() => onNavigate('ba-kerusakan')}
          className="bg-white border border-slate-200/90 hover:border-rose-500/60 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/70 flex items-center justify-center text-rose-700 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                    BA KERUSAKAN ALAT
                  </span>
                  <span className="text-[10px] text-rose-700 font-medium">
                    Modul BA Kerusakan Alat
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-rose-700 transition-colors">
                <span>Buka</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1 mb-3.5 pb-2.5 border-b border-slate-100">
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {totalKerusakan.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-500 ml-1.5">Total BA Kerusakan</span>
              </div>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                {openKerusakan} Kasus Aktif
              </span>
            </div>

            {/* Action Breakdown with Count & Percentage */}
            <div className="space-y-1.5">
              {[
                {
                  label: 'Out Site Repair',
                  count: baOutSiteRepair,
                  pct: formatPct(baOutSiteRepair, totalKerusakan),
                  dot: 'bg-amber-500',
                  badge: 'bg-amber-50 text-amber-700 border-amber-200'
                },
                {
                  label: 'In Site Repair',
                  count: baInSiteRepair,
                  pct: formatPct(baInSiteRepair, totalKerusakan),
                  dot: 'bg-sky-500',
                  badge: 'bg-sky-50 text-sky-700 border-sky-200'
                },
                {
                  label: 'Pergantian Baru',
                  count: baPergantianBaru,
                  pct: formatPct(baPergantianBaru, totalKerusakan),
                  dot: 'bg-rose-500',
                  badge: 'bg-rose-50 text-rose-700 border-rose-200'
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                    <span className="text-slate-600 font-medium truncate text-[11px]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                    <span className="font-bold text-slate-800">{item.count}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${item.badge}`}>
                      {item.pct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Card 6: PENGADAAN BARANG (Pengadaan Barang)                    */}
        {/* ============================================================== */}
        <div
          onClick={() => onNavigate('pengadaan-barang')}
          className="bg-white border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                    PENGADAAN BARANG
                  </span>
                  <span className="text-[10px] text-blue-700 font-medium">
                    Modul Pengadaan Barang
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-blue-700 transition-colors">
                <span>Buka</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1 mb-3.5 pb-2.5 border-b border-slate-100">
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {totalPengadaan.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-500 ml-1.5">Item Pengadaan</span>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                {pendingPengadaan} O/S Pending
              </span>
            </div>

            {/* Status Breakdown with Count & Percentage */}
            <div className="space-y-1.5">
              {[
                {
                  label: 'O/S PR',
                  count: pgdOsPr,
                  pct: formatPct(pgdOsPr, totalPengadaan),
                  dot: 'bg-amber-500',
                  badge: 'bg-amber-50 text-amber-700 border-amber-200'
                },
                {
                  label: 'O/S PO',
                  count: pgdOsPo,
                  pct: formatPct(pgdOsPo, totalPengadaan),
                  dot: 'bg-blue-500',
                  badge: 'bg-blue-50 text-blue-700 border-blue-200'
                },
                {
                  label: 'O/S GR',
                  count: pgdOsGr,
                  pct: formatPct(pgdOsGr, totalPengadaan),
                  dot: 'bg-indigo-500',
                  badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
                },
                {
                  label: 'O/S GI',
                  count: pgdOsGi,
                  pct: formatPct(pgdOsGi, totalPengadaan),
                  dot: 'bg-emerald-500',
                  badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                    <span className="text-slate-600 font-medium truncate text-[11px]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                    <span className="font-bold text-slate-800">{item.count}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${item.badge}`}>
                      {item.pct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Mid Section: Asset Overview Donut, Maintenance Overview, Recent/Quick Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: ASSET OVERVIEW (Donut Chart matching image.png) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Asset Overview
              </h3>
              <p className="text-xs text-slate-500">Komposisi kategori peralatan operasional</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {totalAssets} Unit
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
            {/* SVG Donut Chart */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-slate-100"
                  strokeWidth="10"
                  fill="none"
                />
                {donutSlices.map((slice, i) => (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={slice.color}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={slice.dashArray}
                    strokeDashoffset={slice.dashOffset}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-black text-slate-900">{totalAssets}</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Assets</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs flex-1 w-full max-w-xs">
              {donutSlices.map((slice, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-slate-700 font-medium truncate">{slice.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 shrink-0 ml-2">
                    {slice.percent}%
                  </span>
                </div>
              ))}
              {donutSlices.length === 0 && (
                <div className="text-slate-400 text-xs text-center py-4">Belum ada data kategori</div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tersinkronisasi otomatis dengan Sheet</span>
            <button
              onClick={() => onNavigate('populasi-asset')}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              Rincian <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Column 2: MAINTENANCE OVERVIEW (Status tiles matching image.png) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Maintenance Overview
            </h3>
            <p className="text-xs text-slate-500">Status jadwal & pemeliharaan</p>
          </div>

          <div className="space-y-3">
            {/* OVERDUE */}
            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                  Overdue / Rusak Berat
                </span>
                <span className="text-lg font-black text-rose-900">
                  {rusakBeratCount}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-rose-100/80 flex items-center justify-center text-rose-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            {/* DUE THIS WEEK / OSR */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  OSR / Repair Luar
                </span>
                <span className="text-lg font-black text-amber-900">
                  {activeOsr}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-100/80 flex items-center justify-center text-amber-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            {/* IN SERVICE */}
            <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                  Servis On-Site
                </span>
                <span className="text-lg font-black text-sky-900">
                  {maintenanceCount + rusakRinganCount}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-sky-100/80 flex items-center justify-center text-sky-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            {/* COMPLETED */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Ready & Completed
                </span>
                <span className="text-lg font-black text-emerald-900">
                  {baikCount}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: OPERATIONAL MODULES / RECENT ASSETS (Matching image.png right side) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Modul Operasional
              </h3>
              <p className="text-xs text-slate-500">Akses cepat formulir & spreadsheet</p>
            </div>
            <button
              onClick={() => onNavigate('populasi-toolbox')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'populasi-toolbox' as SheetModule,
                name: 'Populasi Toolbox',
                desc: `${toolboxes.length} Box terdaftar`,
                icon: Briefcase,
                color: 'text-amber-600 bg-amber-50'
              },
              {
                id: 'peminjaman-tools' as SheetModule,
                name: 'Peminjaman Tools',
                desc: `${peminjaman.length} Log sirkulasi`,
                icon: ArrowLeftRight,
                color: 'text-purple-600 bg-purple-50'
              },
              {
                id: 'pengadaan-barang' as SheetModule,
                name: 'Pengadaan Barang',
                desc: `${pengadaan.length} PR/PO proses`,
                icon: ShoppingCart,
                color: 'text-sky-600 bg-sky-50'
              },
              {
                id: 'ba-serah-terima' as SheetModule,
                name: 'BA Serah Terima',
                desc: `${bast.length} Dokumen BAST`,
                icon: FileCheck2,
                color: 'text-emerald-600 bg-emerald-50'
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{item.desc}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onOpenCreateModal('peminjaman-tools')}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-700 hover:text-emerald-800 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Input Peminjaman Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Category Vertical Bar Chart & Jobsite Summary (Matching image.png bottom section) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Right / Left: ASSET CATEGORY Vertical Bar Chart (as shown in image.png bottom-right) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Asset Category Distribution
              </h3>
              <p className="text-xs text-slate-500">Jumlah inventaris berdasarkan klasifikasi</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Live Chart
            </span>
          </div>

          {/* Bar Chart Visualization matching image.png */}
          <div className="flex items-end justify-around gap-2 h-56 pt-8 pb-4 border-b border-slate-100 px-2">
            {topCategories.slice(0, 5).map(([catName, count], idx) => {
              const maxCount = Math.max(...topCategories.map((c) => c[1]), 1);
              const heightPct = Math.max(Math.round((count / maxCount) * 100), 12);
              const color = categoryPalette[idx % categoryPalette.length];

              return (
                <div key={catName} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end max-w-[70px]">
                  <span className="text-xs font-black text-slate-800 opacity-80 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all">
                    {count}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden">
                    <div
                      style={{ height: `${heightPct}%`, backgroundColor: color }}
                      className="w-full rounded-t-lg transition-all duration-700 group-hover:brightness-110 shadow-sm"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold truncate w-full text-center mt-1" title={catName}>
                    {catName.substring(0, 9)}
                  </span>
                </div>
              );
            })}

            {topCategories.length === 0 && (
              <div className="flex items-center justify-center w-full h-full text-slate-400 text-xs">
                Belum ada data kategori untuk ditampilkan.
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2">
            <span>Total terdaftar: <b>{totalAssets} item</b></span>
            <span className="text-emerald-700 font-semibold">{ALL_JOBSITES.length} Lokasi Tambang</span>
          </div>
        </div>

        {/* HO Multi-Jobsite Comparison Table or Site Overview */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Rekapitulasi Jobsite
                </h3>
                <p className="text-xs text-slate-500">Monitoring lintas jobsite tambang</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {ALL_JOBSITES.length} Jobsite
            </span>
          </div>

          <div className="overflow-x-auto max-h-64 custom-scrollbar">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#063D2E] text-white font-semibold uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Jobsite</th>
                  <th className="py-2.5 px-3">Total Asset</th>
                  <th className="py-2.5 px-3">Kondisi Baik</th>
                  <th className="py-2.5 px-3">Dipinjam</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {ALL_JOBSITES.map((site) => {
                  const siteAssets = assets.filter((a) => a.jobsite === site);
                  const siteBaik = siteAssets.filter((a) => a.kondisiAwal?.toLowerCase().includes('baik')).length;
                  const sitePjm = peminjaman.filter((p) => p.jobsite === site && p.status === 'Dipinjam').length;

                  return (
                    <tr key={site} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{site}</td>
                      <td className="py-2.5 px-3 text-slate-800 font-bold">{siteAssets.length}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">{siteBaik}</td>
                      <td className="py-2.5 px-3 text-purple-700 font-bold">{sitePjm}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Online
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Semua data terverifikasi realtime</span>
            <span className="font-semibold text-emerald-800">PT Karunia Group</span>
          </div>
        </div>
      </div>
    </div>
  );
};
