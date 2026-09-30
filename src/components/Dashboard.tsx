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
  ArrowUpRight
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

  // Condition counts for assets
  const baikCount = assets.filter((a) => a.kondisiAwal?.toLowerCase().includes('baik')).length;
  const rusakRinganCount = assets.filter((a) =>
    a.kondisiAwal?.toLowerCase().includes('ringan')
  ).length;
  const rusakBeratCount = assets.filter((a) =>
    a.kondisiAwal?.toLowerCase().includes('berat')
  ).length;
  const maintenanceCount = assets.filter((a) =>
    a.kondisiAwal?.toLowerCase().includes('perbaiki') || a.kondisiAwal?.toLowerCase().includes('maint')
  ).length;

  const totalAssets = assets.length;
  const readyPercent = totalAssets > 0 ? Math.round((baikCount / totalAssets) * 100) : 0;

  // Active loans
  const activeLoans = peminjaman.filter((p) => p.status === 'Dipinjam' || p.status === 'Terlambat').length;
  const pendingPengadaan = pengadaan.filter((p) => p.status === 'Diajukan' || p.status === 'Draft').length;
  const activeOsr = osr.filter((o) => o.status === 'Sedang Dikerjakan' || o.status === 'Testing').length;
  const openKerusakan = kerusakan.filter((k) => k.status === 'Investigasi' || k.status === 'Review HO').length;

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

      {/* 5 Main KPI Stat Cards (Matching image.png exactly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: TOTAL ASSETS */}
        <div
          onClick={() => onNavigate('populasi-asset')}
          className="bg-white border border-slate-200/80 hover:border-emerald-500/50 rounded-2xl p-5 transition-all cursor-pointer shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {readyPercent}% Siap
            </span>
          </div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Assets
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {totalAssets.toLocaleString()}
          </div>
          <div className="text-[11px] font-medium text-emerald-700 mt-2 flex items-center gap-1">
            <span>&uarr; 100% data tersinkron</span>
          </div>
        </div>

        {/* Card 2: ACTIVE ASSETS */}
        <div
          onClick={() => onNavigate('populasi-asset')}
          className="bg-white border border-slate-200/80 hover:border-sky-500/50 rounded-2xl p-5 transition-all cursor-pointer shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
              Kondisi Baik
            </span>
          </div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Active Assets
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {baikCount.toLocaleString()}
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-2">
            <span>{readyPercent}% of total</span>
          </div>
        </div>

        {/* Card 3: UNDER MAINTENANCE */}
        <div
          onClick={() => onNavigate('ba-kerusakan')}
          className="bg-white border border-slate-200/80 hover:border-amber-500/50 rounded-2xl p-5 transition-all cursor-pointer shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {rusakBeratCount} Rusak
            </span>
          </div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Under Maintenance
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {(maintenanceCount + rusakRinganCount + rusakBeratCount).toLocaleString()}
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-2">
            <span>{totalAssets > 0 ? Math.round(((maintenanceCount + rusakRinganCount + rusakBeratCount) / totalAssets) * 100) : 0}% of total</span>
          </div>
        </div>

        {/* Card 4: PEMINJAMAN TOOLS */}
        <div
          onClick={() => onNavigate('peminjaman-tools')}
          className="bg-white border border-slate-200/80 hover:border-purple-500/50 rounded-2xl p-5 transition-all cursor-pointer shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
              Sirkulasi
            </span>
          </div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Alat Dipinjam
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {activeLoans.toLocaleString()}
          </div>
          <div className="text-[11px] font-medium text-purple-700 mt-2">
            <span>{peminjaman.length} log transaksi</span>
          </div>
        </div>

        {/* Card 5: OSR & KERUSAKAN */}
        <div
          onClick={() => onNavigate('osr-tools')}
          className="bg-white border border-slate-200/80 hover:border-rose-500/50 rounded-2xl p-5 transition-all cursor-pointer shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              External
            </span>
          </div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total OSR & BA
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {(activeOsr + openKerusakan).toLocaleString()}
          </div>
          <div className="text-[11px] font-medium text-rose-600 mt-2">
            <span>{activeOsr} OSR &bull; {openKerusakan} BA Baru</span>
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
