import React from 'react';
import { SheetModule, User } from '../types';
import {
  LayoutDashboard,
  Boxes,
  Briefcase,
  ArrowLeftRight,
  ShoppingCart,
  AlertTriangle,
  Wrench,
  FileCheck2,
  Sheet,
  Users,
  X
} from 'lucide-react';

interface SidebarProps {
  currentModule: SheetModule;
  onSelectModule: (module: SheetModule) => void;
  currentUser: User;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  counts?: {
    assets: number;
    toolboxes: number;
    peminjaman: number;
    pengadaan: number;
    kerusakan: number;
    osr: number;
    bast: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  currentUser,
  isOpenMobile,
  onCloseMobile,
  counts
}) => {
  const isDev = currentUser.role === 'developer';

  const navItems = [
    {
      id: 'dashboard' as SheetModule,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'populasi-asset' as SheetModule,
      label: 'Populasi Asset',
      icon: Boxes,
      badge: counts?.assets
    },
    {
      id: 'populasi-toolbox' as SheetModule,
      label: 'Populasi Toolbox',
      icon: Briefcase,
      badge: counts?.toolboxes
    },
    {
      id: 'peminjaman-tools' as SheetModule,
      label: 'Peminjaman Tools',
      icon: ArrowLeftRight,
      badge: counts?.peminjaman
    },
    {
      id: 'pengadaan-barang' as SheetModule,
      label: 'Pengadaan Barang',
      icon: ShoppingCart,
      badge: counts?.pengadaan
    },
    {
      id: 'ba-kerusakan' as SheetModule,
      label: 'BA Kerusakan Alat',
      icon: AlertTriangle,
      badge: counts?.kerusakan
    },
    {
      id: 'osr-tools' as SheetModule,
      label: 'OSR Tools & Facility',
      icon: Wrench,
      badge: counts?.osr
    },
    {
      id: 'ba-serah-terima' as SheetModule,
      label: 'BA Serah Terima',
      icon: FileCheck2,
      badge: counts?.bast
    }
  ];

  const handleNavClick = (mod: SheetModule) => {
    onSelectModule(mod);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#063D2E] border-r border-[#0B4D3B] flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header inside Sidebar */}
        <div className="p-4 border-b border-[#0B4D3B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-teal-300 flex items-center justify-center font-black text-[#063D2E] text-sm shadow-md shadow-emerald-950/40">
              ESF
            </div>
            <div>
              <span className="text-xs font-bold text-white block uppercase tracking-wider">
                Asset Management
              </span>
              <span className="text-[10px] text-emerald-200/70">Equipment Support Facility</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-emerald-200/70 hover:text-white rounded-lg hover:bg-[#0a4837]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card info in Sidebar */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-[#04281E]/75 border border-[#0D523F] text-xs">
          <div className="text-[10px] text-emerald-300/70 font-medium">Logged in as:</div>
          <div className="font-bold text-white truncate mt-0.5">{currentUser.username}</div>
          <div className="text-[10px] text-emerald-200/80 flex items-center gap-1.5 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                currentUser.role === 'ho'
                  ? 'bg-amber-400'
                  : currentUser.role === 'developer'
                  ? 'bg-sky-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span>{currentUser.role === 'ho' ? 'All Jobsites Access' : currentUser.jobsite}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar-dark">
          <div className="px-3 py-1.5 text-[10px] font-bold text-emerald-300/60 uppercase tracking-wider">
            Modul Utama (Spreadsheet)
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0E5642] text-white shadow-md border border-emerald-400/30'
                    : 'text-emerald-100/80 hover:text-white hover:bg-[#094736]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-300' : 'text-emerald-300/70'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge !== null && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-[#052C21] text-emerald-200 border border-emerald-500/20' : 'bg-[#04281E] text-emerald-200/80'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 py-1.5 text-[10px] font-bold text-emerald-300/60 uppercase tracking-wider">
            Integrasi & Sistem
          </div>

          <button
            type="button"
            onClick={() => handleNavClick('apps-script-sync')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentModule === 'apps-script-sync'
                ? 'bg-[#0E5642] text-white shadow-md border border-emerald-400/30'
                : 'text-emerald-100/80 hover:text-white hover:bg-[#094736]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Sheet className="w-4 h-4 text-emerald-300" />
              <span className="truncate">Sinkronisasi Apps Script</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {isDev && (
            <button
              type="button"
              onClick={() => handleNavClick('developer-panel')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'developer-panel'
                  ? 'bg-sky-700 text-white shadow-md border border-sky-400/30'
                  : 'text-sky-200 hover:text-white hover:bg-sky-950/40 border border-sky-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Users className="w-4 h-4 text-sky-300" />
                <span className="truncate">Kelola Akun & Password</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-200">
                Dev
              </span>
            </button>
          )}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-[#0B4D3B] text-[10px] text-emerald-300/60 flex items-center justify-between">
          <span>ESF Monitoring v2.0</span>
          <span>PT Karunia Group</span>
        </div>
      </aside>
    </>
  );
};
