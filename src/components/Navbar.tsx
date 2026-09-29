import React from 'react';
import { User } from '../types';
import { ALL_JOBSITES } from '../data/defaultUsers';
import {
  LogOut,
  Building2,
  Lock,
  RefreshCw,
  SlidersHorizontal,
  Code2,
  Shield,
  Menu
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  selectedJobsiteFilter: string; // 'ALL' or specific jobsite
  onJobsiteFilterChange: (jobsite: string) => void;
  onLogout: () => void;
  onOpenSyncModal: () => void;
  onOpenDeveloperModal?: () => void;
  isSyncing?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  selectedJobsiteFilter,
  onJobsiteFilterChange,
  onLogout,
  onOpenSyncModal,
  onOpenDeveloperModal,
  isSyncing = false,
  onToggleSidebar
}) => {
  const isHO = currentUser.role === 'ho';
  const isDev = currentUser.role === 'developer';

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-amber-500/20">
              ESF
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                ESF Monitoring
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-slate-800 border border-slate-700 text-amber-400">
                  SYSTEM
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 leading-tight">Equipment & Facility Management</p>
            </div>
          </div>
        </div>

        {/* Center / Right: Jobsite Filter (HO only or Locked) & Sync status */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Jobsite Selector: HO Balikpapan has full multi-site switcher */}
          {isHO ? (
            <div className="flex items-center gap-2 bg-slate-950/70 border border-amber-500/40 rounded-xl px-3 py-1.5 shadow-inner">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-semibold text-amber-400 uppercase tracking-wider">
                  Filter Jobsite (Akses HO Balikpapan)
                </span>
                <select
                  value={selectedJobsiteFilter}
                  onChange={(e) => onJobsiteFilterChange(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-4"
                >
                  <option value="ALL" className="bg-slate-900 text-amber-300 font-bold">
                    ★ SEMUA JOBSITE (Konsolidasi Total)
                  </option>
                  {ALL_JOBSITES.map((site) => (
                    <option key={site} value={site} className="bg-slate-900 text-white">
                      {site}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : isDev ? (
            <div className="hidden sm:flex items-center gap-2 bg-blue-950/40 border border-blue-800/60 rounded-xl px-3 py-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <div className="text-xs">
                <span className="text-[9px] block text-blue-400 font-semibold uppercase">Mode Akses</span>
                <span className="font-bold text-blue-200">User & Password Administrator</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  Jobsite Aktif <Lock className="w-2.5 h-2.5 text-amber-400" />
                </span>
                <span className="text-xs font-bold text-slate-200">{currentUser.jobsite}</span>
              </div>
            </div>
          )}

          {/* Live Sync Realtime Indicator & Sync Button */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/70 border border-emerald-900/60 text-[11px] text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Auto-Sync Aktif</span>
          </div>

          {/* Sync Apps Script & Drive Button */}
          <button
            type="button"
            onClick={onOpenSyncModal}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              isSyncing
                ? 'bg-amber-950/60 border-amber-600 text-amber-300 animate-pulse'
                : 'bg-emerald-950/50 hover:bg-emerald-900/50 border-emerald-700/60 text-emerald-200'
            }`}
            title="Akses Penuh Google Drive & Sinkronisasi Spreadsheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Drive & Sheets</span>
          </button>

          {/* User Badge & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-semibold text-white leading-tight">{currentUser.username}</span>
              <span className="text-[10px] text-slate-400">
                {isHO ? 'Super Admin' : isDev ? 'Developer' : 'Site User'}
              </span>
            </div>

            {isDev && onOpenDeveloperModal && (
              <button
                type="button"
                onClick={onOpenDeveloperModal}
                className="p-2 rounded-lg bg-blue-950/60 border border-blue-700/60 text-blue-300 hover:bg-blue-900/40 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                title="Manajemen Pengguna"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Kelola Akun</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700/60 text-slate-300 hover:text-rose-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
              title="Keluar dari Akun"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
