import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/appsScriptTemplate';
import {
  signInWithGoogle,
  signOutGoogle,
  getActiveGoogleUser,
  getGoogleAccessToken
} from '../services/googleAuth';
import { GoogleDriveService, GoogleDriveFile } from '../services/googleDriveService';
import {
  Sheet,
  Copy,
  Check,
  RefreshCw,
  Clock,
  History,
  HardDrive,
  FolderSync,
  FileSpreadsheet,
  LogOut,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({
  isOpen,
  onClose,
  onSyncNow,
  isSyncing,
  onNotify
}) => {
  const [config, setConfig] = useState(() => StorageService.getSyncConfig());
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'gdrive' | 'code' | 'logs'>('setup');
  const logs = StorageService.getSyncLogs();

  // Google OAuth state
  const [googleUser, setGoogleUser] = useState(() => getActiveGoogleUser());
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState(false);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState('');
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(() => {
    setGoogleUser(getActiveGoogleUser());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSyncConfig(config);
    onNotify('success', 'URL Web App Tersimpan', 'Konfigurasi integrasi Google Apps Script berhasil diperbarui.');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    onNotify('success', 'Kode Disalin ke Clipboard', 'Buka Extensions > Apps Script pada spreadsheet Anda dan tempelkan kodenya.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true);
      const res = await signInWithGoogle();
      if (res) {
        setGoogleUser(res.user);
        onNotify('success', 'Terhubung ke Akun Google', `Akses penuh ke Google Drive & Spreadsheets aktif untuk ${res.user.email}`);
        loadDriveFiles();
      }
    } catch (err: any) {
      onNotify('error', 'Gagal Sign-in Google', err.message || 'Periksa izin popup browser');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOutGoogle();
    setGoogleUser(null);
    setDriveFiles([]);
    onNotify('info', 'Terputus dari Akun Google', 'Koneksi Google Drive telah diakhiri.');
  };

  const loadDriveFiles = async () => {
    try {
      setIsLoadingDriveFiles(true);
      const files = await GoogleDriveService.listSpreadsheets();
      setDriveFiles(files);
      if (files.length > 0 && !selectedSpreadsheetId) {
        setSelectedSpreadsheetId(files[0].id);
      }
    } catch (err: any) {
      onNotify('error', 'Gagal Membaca Google Drive', err.message);
    } finally {
      setIsLoadingDriveFiles(false);
    }
  };

  const handleBackupToDrive = async () => {
    if (!selectedSpreadsheetId) {
      onNotify('warning', 'Pilih Spreadsheet', 'Pilih file spreadsheet yang ingin dicadangkan ke Google Drive.');
      return;
    }

    const confirmed = window.confirm('Apakah Anda ingin membuat salinan cadangan (backup) spreadsheet ini di Google Drive?');
    if (!confirmed) return;

    try {
      setIsBackingUp(true);
      const backup = await GoogleDriveService.backupSpreadsheet(selectedSpreadsheetId);
      onNotify('success', 'Backup Berhasil Dibuat', `Salinan file "${backup.name}" telah disimpan di Google Drive Anda.`);
      StorageService.addSyncLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'AUTO_SYNC',
        module: 'GDRIVE_BACKUP',
        jobsite: 'Google Drive',
        status: 'SUCCESS',
        detail: `Berhasil membuat cadangan spreadsheet ID: ${backup.id} di Google Drive`
      });
    } catch (err: any) {
      onNotify('error', 'Gagal Membuat Backup', err.message);
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Akses Penuh Google Drive & Spreadsheets
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono font-bold">
                  v2.5 Full Access
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Integrasi REST API Google Workspace & Web App Google Apps Script
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`py-3 px-4 font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'setup'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Web App Apps Script
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gdrive')}
            className={`py-3 px-4 font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'gdrive'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>2. Akun & Drive Manager</span>
            {googleUser && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`py-3 px-4 font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Kode Apps Script (Code.gs)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-4 font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'logs'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Log & Audit ({logs.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* TAB 1: SETUP WEB APP */}
          {activeTab === 'setup' && (
            <div className="space-y-6">
              {/* Status Box */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${config.webAppUrl ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Status Web App: {config.webAppUrl ? 'URL Terkonfigurasi' : 'Belum Terhubung'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Terakhir Sinkron: {config.lastSyncTime ? new Date(config.lastSyncTime).toLocaleString('id-ID') : 'Belum pernah'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onSyncNow}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
                </button>
              </div>

              {/* Form Input URL */}
              <form onSubmit={handleSaveUrl} className="space-y-3">
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Google Apps Script Web App URL:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={config.webAppUrl}
                    onChange={(e) => setConfig({ ...config, webAppUrl: e.target.value })}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white cursor-pointer"
                  >
                    Simpan URL
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  <span className="text-amber-400 font-bold block mb-1">
                    Lokasi File Kode untuk Update URL Secara Manual:
                  </span>
                  File: <code className="text-emerald-400 font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded">/src/config/appConfig.ts</code>
                  <br />
                  Variabel: <code className="text-amber-300 font-mono">GOOGLE_APPS_SCRIPT_WEB_APP_URL</code>
                </div>
              </form>

              {/* Summary of full access capabilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Akses Penuh Google Spreadsheets</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Membaca & menulis otomatis ke 7 lembar kerja tanpa merusak header atau rumus, serta pengecekan kelengkapan sheet otomatis.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Akses Penuh Google Drive</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Membuat salinan cadangan spreadsheet secara periodik di folder Google Drive serta mengunggah dokumentasi & lampiran BA.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE DRIVE & ACCOUNT MANAGER */}
          {activeTab === 'gdrive' && (
            <div className="space-y-6">
              {/* Account Connect Box */}
              {!googleUser ? (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 to-indigo-950/40 border border-slate-800 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Hubungkan Akun Google Anda</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Berikan akses langsung ke Google Drive & Google Spreadsheets untuk mengelola file, backup otomatis, dan sinkronisasi instan.
                    </p>
                  </div>

                  {/* Official Google Sign In Button */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleSigningIn}
                      className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-3 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      <span>{isGoogleSigningIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {googleUser.photoURL ? (
                      <img src={googleUser.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-emerald-500/40" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-sm">
                        {googleUser.displayName?.[0] || 'G'}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{googleUser.displayName || 'Akun Google Terhubung'}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Drive & Sheets Aktif
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{googleUser.email}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignOut}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800 text-xs text-slate-300 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Putuskan</span>
                  </button>
                </div>
              )}

              {/* Drive Operations if authenticated */}
              {googleUser && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        Daftar Spreadsheet di Google Drive Anda
                      </h4>
                      <p className="text-[11px] text-slate-400">Pilih spreadsheet untuk dicadangkan atau dibaca</p>
                    </div>

                    <button
                      type="button"
                      onClick={loadDriveFiles}
                      disabled={isLoadingDriveFiles}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingDriveFiles ? 'animate-spin' : ''}`} />
                      <span>Refresh Drive</span>
                    </button>
                  </div>

                  {isLoadingDriveFiles ? (
                    <div className="text-center py-8 text-xs text-slate-400">Memuat berkas dari Google Drive...</div>
                  ) : driveFiles.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {driveFiles.map((file) => (
                        <div
                          key={file.id}
                          onClick={() => setSelectedSpreadsheetId(file.id)}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            selectedSpreadsheetId === file.id
                              ? 'bg-emerald-950/40 border-emerald-500 text-white'
                              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold block truncate">{file.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">ID: {file.id}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] text-blue-400 hover:underline"
                              >
                                Buka
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950 text-center text-xs text-slate-400">
                      Tidak ada file Google Spreadsheet yang ditemukan di Drive Anda.
                    </div>
                  )}

                  {/* Drive Backup Action */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleBackupToDrive}
                      disabled={isBackingUp || !selectedSpreadsheetId}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-40"
                    >
                      <FolderSync className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
                      <span>{isBackingUp ? 'Membuat Salinan...' : 'Buat Salinan Cadangan (Backup) di Google Drive'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: APPS SCRIPT CODE */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Kode Google Apps Script Lengkap (Code.gs)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Mendukung Google DriveApp (backup & upload lampiran) & SpreadsheetApp (7 sheet)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Berhasil Disalin!' : 'Salin Seluruh Kode'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 max-h-[400px] overflow-auto leading-relaxed custom-scrollbar">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-400" />
                  Audit Trail Sinkronisasi Google Drive & Spreadsheets
                </h4>
                <span className="text-xs text-slate-400 font-mono">{logs.length} Log Tersimpan</span>
              </div>

              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="font-bold text-slate-200">[{log.module}]</span>
                        <span className="text-slate-400 font-medium">{log.jobsite}</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{log.detail}</p>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                    </div>
                  </div>
                ))}

                {logs.length === 0 && (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    Belum ada riwayat aktivitas sinkronisasi.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            Google Drive & Spreadsheets Full Permissions
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
