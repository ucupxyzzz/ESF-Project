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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header inside Sidebar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm">
              ESF
            </div>
            <div>
              <span className="text-xs font-bold text-white block uppercase tracking-wider">
                Monitoring Menu
              </span>
              <span className="text-[10px] text-slate-400">Multi Jobsite System</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card info in Sidebar */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
          <div className="text-[10px] text-slate-400 font-medium">Logged in as:</div>
          <div className="font-bold text-amber-300 truncate mt-0.5">{currentUser.username}</div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                currentUser.role === 'ho'
                  ? 'bg-amber-400'
                  : currentUser.role === 'developer'
                  ? 'bg-blue-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span>{currentUser.role === 'ho' ? 'All Jobsites Access' : currentUser.jobsite}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge !== null && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Integrasi & Sistem
          </div>

          <button
            type="button"
            onClick={() => handleNavClick('apps-script-sync')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentModule === 'apps-script-sync'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/30'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Sheet className="w-4 h-4 text-emerald-400" />
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
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-blue-300 hover:text-blue-200 hover:bg-blue-950/40 border border-blue-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="truncate">Kelola Akun & Password</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                Dev
              </span>
            </button>
          )}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>ESF Monitoring v2.0</span>
          <span>PT Karunia Armada Indonesia</span>
        </div>
      </aside>
    </>
  );
};
