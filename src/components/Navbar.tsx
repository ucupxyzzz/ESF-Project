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
    <header className="sticky top-0 z-30 bg-[#063D2E] border-b border-[#0B4D3B] backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-emerald-200/70 hover:text-white rounded-lg hover:bg-[#0a4837] focus:outline-none"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-400 to-teal-300 flex items-center justify-center font-black text-[#063D2E] text-sm shadow-md shadow-emerald-950/40">
              ESF
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                ESF Monitoring
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-[#04281E] border border-emerald-400/30 text-emerald-300">
                  SYSTEM
                </span>
              </h1>
              <p className="text-[10px] text-emerald-200/70 leading-tight">Equipment & Facility Management</p>
            </div>
          </div>
        </div>

        {/* Center / Right: Jobsite Filter (HO only or Locked) & Sync status */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Jobsite Selector: HO Balikpapan has full multi-site switcher */}
          {isHO ? (
            <div className="flex items-center gap-2 bg-[#04281E]/80 border border-emerald-400/40 rounded-xl px-3 py-1.5 shadow-inner">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-semibold text-emerald-300 uppercase tracking-wider">
                  Filter Jobsite (Akses HO Balikpapan)
                </span>
                <select
                  value={selectedJobsiteFilter}
                  onChange={(e) => onJobsiteFilterChange(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-4"
                >
                  <option value="ALL" className="bg-[#063D2E] text-emerald-300 font-bold">
                    ★ SEMUA JOBSITE (Konsolidasi Total)
                  </option>
                  {ALL_JOBSITES.map((site) => (
                    <option key={site} value={site} className="bg-[#063D2E] text-white">
                      {site}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : isDev ? (
            <div className="hidden sm:flex items-center gap-2 bg-sky-950/60 border border-sky-600/50 rounded-xl px-3 py-1.5">
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              <div className="text-xs">
                <span className="text-[9px] block text-sky-400 font-semibold uppercase">Mode Akses</span>
                <span className="font-bold text-sky-200">User & Password Administrator</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#04281E]/75 border border-[#0D523F] rounded-xl px-3 py-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-300/70 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-semibold text-emerald-300/70 uppercase tracking-wider flex items-center gap-1">
                  Jobsite Aktif <Lock className="w-2.5 h-2.5 text-emerald-400" />
                </span>
                <span className="text-xs font-bold text-white">{currentUser.jobsite}</span>
              </div>
            </div>
          )}

          {/* Live Sync Realtime Indicator & Sync Button */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#04281E]/80 border border-emerald-500/30 text-[11px] text-emerald-200">
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
                : 'bg-[#0E5642] hover:bg-[#126850] border-emerald-400/30 text-white shadow-sm'
            }`}
            title="Akses Penuh Google Drive & Sinkronisasi Spreadsheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-300 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Drive & Sheets</span>
          </button>

          {/* User Badge & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#0B4D3B]">
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-xs font-bold text-emerald-200">
                {currentUser.username.substring(0, 1).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">{currentUser.username}</span>
                <span className="text-[10px] text-emerald-200/70">
                  {isHO ? 'Super Admin' : isDev ? 'Developer' : 'Site User'}
                </span>
              </div>
            </div>

            {isDev && onOpenDeveloperModal && (
              <button
                type="button"
                onClick={onOpenDeveloperModal}
                className="p-2 rounded-lg bg-sky-950/60 border border-sky-700/60 text-sky-200 hover:bg-sky-900/40 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                title="Manajemen Pengguna"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Kelola Akun</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg bg-[#04281E] hover:bg-rose-950/60 border border-[#0D523F] hover:border-rose-700/60 text-emerald-200 hover:text-rose-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
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
