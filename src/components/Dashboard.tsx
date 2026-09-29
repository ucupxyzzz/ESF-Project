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
  XCircle,
  Building2,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Plus
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {isHO ? 'Head Office View (Super Admin)' : `Site Unit: ${currentUser.jobsite}`}
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Dashboard ESF Monitoring {activeJobsite === 'ALL' ? 'Seluruh Jobsite' : activeJobsite}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {isHO
                ? 'Ringkasan operasional konsolidasian dari semua jobsite tambang. Anda memiliki akses penuh melihat dan mengelola seluruh data.'
                : `Menampilkan ringkasan data inventaris dan pergerakan alat khusus untuk area kerja ${activeJobsite}.`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onManualSync}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sync Spreadsheet'}</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenCreateModal('populasi-asset')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Asset Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div
          onClick={() => onNavigate('populasi-asset')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {readyPercent}% Siap
            </span>
          </div>
          <div className="text-2xl font-black text-white">{totalAssets}</div>
          <div className="text-xs font-medium text-slate-400 mt-1 flex items-center justify-between">
            <span>Populasi Asset</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-amber-400" />
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden flex">
            <div
              style={{ width: `${readyPercent}%` }}
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Kondisi Baik vs Rusak */}
        <div
          onClick={() => onNavigate('populasi-asset')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {rusakBeratCount + rusakRinganCount} Rusak
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{baikCount}</div>
          <div className="text-xs font-medium text-slate-400 mt-1 flex items-center justify-between">
            <span>Asset Kondisi Baik (Ready)</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-emerald-400" />
          </div>
          <div className="text-[11px] text-slate-400 mt-3 flex items-center gap-3">
            <span>Sedang Servis: <b className="text-amber-400">{maintenanceCount}</b></span>
            <span>Rusak Berat: <b className="text-rose-400">{rusakBeratCount}</b></span>
          </div>
        </div>

        {/* Peminjaman Tools */}
        <div
          onClick={() => onNavigate('peminjaman-tools')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-400">
              {peminjaman.filter((p) => p.status === 'Terlambat').length > 0
                ? `${peminjaman.filter((p) => p.status === 'Terlambat').length} Overdue`
                : 'Lancar'}
            </span>
          </div>
          <div className="text-2xl font-black text-white">{activeLoans}</div>
          <div className="text-xs font-medium text-slate-400 mt-1 flex items-center justify-between">
            <span>Alat Sedang Dipinjam</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-amber-400" />
          </div>
          <div className="text-[11px] text-slate-400 mt-3 flex items-center justify-between">
            <span>Total Catatan: {peminjaman.length}</span>
            <span className="text-emerald-400">
              Kembali: {peminjaman.filter((p) => p.status === 'Kembali').length}
            </span>
          </div>
        </div>

        {/* OSR & BA Kerusakan */}
        <div
          onClick={() => onNavigate('osr-tools')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {openKerusakan} BA Baru
            </span>
          </div>
          <div className="text-2xl font-black text-rose-400">{activeOsr}</div>
          <div className="text-xs font-medium text-slate-400 mt-1 flex items-center justify-between">
            <span>Alat OSR (Perbaikan Luar)</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-rose-400" />
          </div>
          <div className="text-[11px] text-slate-400 mt-3 flex items-center justify-between">
            <span>Pengadaan Diajukan:</span>
            <b className="text-amber-400">{pendingPengadaan} PO/PR</b>
          </div>
        </div>
      </div>

      {/* Grid: Breakdown Kondisi Aset & Kategori Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Kondisi Status Detail */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Status Kesehatan & Kondisi Aset
              </h3>
              <p className="text-xs text-slate-400">Berdasarkan Kolom I (Kondisi Awal)</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">{totalAssets} Unit</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-2 text-slate-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Baik (Ready for Operation)
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {baikCount} ({totalAssets > 0 ? Math.round((baikCount / totalAssets) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${totalAssets > 0 ? (baikCount / totalAssets) * 100 : 0}%` }}
                  className="bg-emerald-500 h-full rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-2 text-slate-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Rusak Ringan (Minor Defect)
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {rusakRinganCount} ({totalAssets > 0 ? Math.round((rusakRinganCount / totalAssets) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${totalAssets > 0 ? (rusakRinganCount / totalAssets) * 100 : 0}%` }}
                  className="bg-amber-500 h-full rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-2 text-slate-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Rusak Berat (Non-Operational)
                </span>
                <span className="font-mono font-bold text-rose-400">
                  {rusakBeratCount} ({totalAssets > 0 ? Math.round((rusakBeratCount / totalAssets) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${totalAssets > 0 ? (rusakBeratCount / totalAssets) * 100 : 0}%` }}
                  className="bg-rose-500 h-full rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-2 text-slate-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  Sedang Diperbaiki (Maintenance)
                </span>
                <span className="font-mono font-bold text-sky-400">
                  {maintenanceCount} ({totalAssets > 0 ? Math.round((maintenanceCount / totalAssets) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${totalAssets > 0 ? (maintenanceCount / totalAssets) * 100 : 0}%` }}
                  className="bg-sky-500 h-full rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Perlu tindakan perbaikan segera:</span>
            <span className="font-bold text-rose-400">{rusakBeratCount + rusakRinganCount} Asset</span>
          </div>
        </div>

        {/* Right: Kategori Aset Terbanyak */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Distribusi Kategori Peralatan
              </h3>
              <p className="text-xs text-slate-400">Klasifikasi inventaris tools & fasilitas</p>
            </div>
            <button
              onClick={() => onNavigate('populasi-asset')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topCategories.slice(0, 6).map(([catName, count]) => {
              const pct = totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;
              return (
                <div key={catName} className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold">
                      {catName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{catName}</div>
                      <div className="text-[10px] text-slate-400">{pct}% dari seluruh aset</div>
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-1 rounded-lg">
                    {count} Unit
                  </div>
                </div>
              );
            })}
            {topCategories.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">Belum ada data kategori aset.</div>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Module Quick Navigation Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Modul Operasional & Formulir Input
          </h3>
          <span className="text-xs text-slate-400">7 Lembar Kerja Tersinkronisasi</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              id: 'populasi-toolbox' as SheetModule,
              name: 'Populasi Toolbox',
              count: `${toolboxes.length} Box`,
              icon: Briefcase,
              color: 'text-amber-400',
              borderColor: 'hover:border-amber-500/40'
            },
            {
              id: 'peminjaman-tools' as SheetModule,
              name: 'Peminjaman Tools',
              count: `${peminjaman.length} Log`,
              icon: ArrowLeftRight,
              color: 'text-blue-400',
              borderColor: 'hover:border-blue-500/40'
            },
            {
              id: 'pengadaan-barang' as SheetModule,
              name: 'Pengadaan Barang',
              count: `${pengadaan.length} PR/PO`,
              icon: ShoppingCart,
              color: 'text-purple-400',
              borderColor: 'hover:border-purple-500/40'
            },
            {
              id: 'ba-kerusakan' as SheetModule,
              name: 'BA Kerusakan',
              count: `${kerusakan.length} BA`,
              icon: AlertTriangle,
              color: 'text-rose-400',
              borderColor: 'hover:border-rose-500/40'
            },
            {
              id: 'osr-tools' as SheetModule,
              name: 'OSR Facility',
              count: `${osr.length} Unit`,
              icon: Wrench,
              color: 'text-orange-400',
              borderColor: 'hover:border-orange-500/40'
            },
            {
              id: 'ba-serah-terima' as SheetModule,
              name: 'BA Serah Terima',
              count: `${bast.length} Dokumen`,
              icon: FileCheck2,
              color: 'text-emerald-400',
              borderColor: 'hover:border-emerald-500/40'
            }
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className={`p-4 rounded-xl bg-slate-900 border border-slate-800 ${card.borderColor} transition-all cursor-pointer group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${card.color}`} />
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">
                      {card.count}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-white leading-tight">
                    {card.name}
                  </h4>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                  <span>Buka Tabel</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special HO Multi-Jobsite Comparison Table (when HO is logged in) */}
      {isHO && (
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Matriks Rekapitulasi Seluruh Jobsite
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Fitur eksklusif HO Balikpapan untuk monitoring cross-site dan audit data
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {ALL_JOBSITES.length} Jobsite Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Nama Jobsite</th>
                  <th className="py-2.5 px-3">Total Asset</th>
                  <th className="py-2.5 px-3">Kondisi Baik</th>
                  <th className="py-2.5 px-3">Rusak/Servis</th>
                  <th className="py-2.5 px-3">Toolbox</th>
                  <th className="py-2.5 px-3">Dipinjam</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {ALL_JOBSITES.map((site) => {
                  const siteAssets = assets.filter((a) => a.jobsite === site);
                  const siteBaik = siteAssets.filter((a) => a.kondisiAwal?.toLowerCase().includes('baik')).length;
                  const siteRusak = siteAssets.length - siteBaik;
                  const siteTbx = toolboxes.filter((t) => t.jobsite === site).length;
                  const sitePjm = peminjaman.filter((p) => p.jobsite === site && p.status === 'Dipinjam').length;

                  return (
                    <tr key={site} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-200">{site}</td>
                      <td className="py-2.5 px-3 text-white font-bold">{siteAssets.length} Unit</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">{siteBaik}</td>
                      <td className="py-2.5 px-3 text-rose-400">{siteRusak}</td>
                      <td className="py-2.5 px-3 text-slate-300">{siteTbx}</td>
                      <td className="py-2.5 px-3 text-amber-300">{sitePjm}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Online
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
