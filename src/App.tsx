import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  SheetModule,
  AssetItem,
  ToolboxItem,
  PeminjamanItem,
  PengadaanItem,
  BaKerusakanItem,
  OsrItem,
  BaSerahTerimaItem,
  GDRIVE_CONFIG
} from './types';
import { StorageService } from './services/storage';
import { AppsScriptSyncService } from './services/appsScriptSync';
import { PdfService } from './services/pdfService';
import { isJobsiteMatch } from './utils/jobsiteHelper';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DataTable } from './components/DataTable';
import { DataFormModal } from './components/DataFormModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { DeveloperPanel } from './components/DeveloperPanel';
import { AppsScriptModal } from './components/AppsScriptModal';
import { DokumentasiModal } from './components/DokumentasiModal';
import { HoSignatureModal } from './components/HoSignatureModal';
import { ReturnLoanModal } from './components/ReturnLoanModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { FileText, Camera, Download, ExternalLink, ShieldCheck } from 'lucide-react';

export default function App() {
  // Current user state
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());

  // Active module
  const [currentModule, setCurrentModule] = useState<SheetModule>('dashboard');

  // Jobsite filter: 'ALL' or specific jobsite (only HO can toggle)
  const [selectedJobsiteFilter, setSelectedJobsiteFilter] = useState<string>('ALL');

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync state & Modals
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModule, setFormModule] = useState<SheetModule>('populasi-asset');
  const [itemToEdit, setItemToEdit] = useState<any | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    module: SheetModule;
    item: any;
    key: string;
    name: string;
    jobsite: string;
  } | null>(null);

  // Dokumentasi Modal state
  const [dokumentasiModalState, setDokumentasiModalState] = useState<{
    isOpen: boolean;
    title: string;
    url?: string;
    isImage?: boolean;
    folderUrl?: string;
    folderName?: string;
    bastItem?: BaSerahTerimaItem | null;
    kerusakanItem?: BaKerusakanItem | null;
  }>({
    isOpen: false,
    title: ''
  });

  // HO Signature Modal state
  const [hoSignatureModalState, setHoSignatureModalState] = useState<{
    isOpen: boolean;
    bastItem: BaSerahTerimaItem | null;
  }>({
    isOpen: false,
    bastItem: null
  });

  // Return Loan Modal state (Aksi Kembalikan Alat - Kolom J & M)
  const [returnLoanModalState, setReturnLoanModalState] = useState<{
    isOpen: boolean;
    loanItem: PeminjamanItem | null;
  }>({
    isOpen: false,
    loanItem: null
  });
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Data states for 7 modules
  const [assets, setAssets] = useState<AssetItem[]>(() => StorageService.getAssets());
  const [toolboxes, setToolboxes] = useState<ToolboxItem[]>(() => StorageService.getToolboxes());
  const [peminjaman, setPeminjaman] = useState<PeminjamanItem[]>(() => StorageService.getPeminjaman());
  const [pengadaan, setPengadaan] = useState<PengadaanItem[]>(() => StorageService.getPengadaan());
  const [kerusakan, setKerusakan] = useState<BaKerusakanItem[]>(() => StorageService.getKerusakan());
  const [osr, setOsr] = useState<OsrItem[]>(() => StorageService.getOsr());
  const [bast, setBast] = useState<BaSerahTerimaItem[]>(() => StorageService.getBast());

  // Set initial jobsite filter based on user role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'ho') {
        setSelectedJobsiteFilter('ALL');
      } else {
        setSelectedJobsiteFilter(currentUser.jobsite);
      }
    }
  }, [currentUser]);

  // Reload data from local storage
  const reloadAllData = () => {
    setAssets(StorageService.getAssets());
    setToolboxes(StorageService.getToolboxes());
    setPeminjaman(StorageService.getPeminjaman());
    setPengadaan(StorageService.getPengadaan());
    setKerusakan(StorageService.getKerusakan());
    setOsr(StorageService.getOsr());
    setBast(StorageService.getBast());
  };

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'developer') {
      setCurrentModule('developer-panel');
    } else {
      setCurrentModule('dashboard');
    }
    addToast('success', `Selamat Datang, ${user.username}`, `Anda masuk sebagai ${user.role === 'ho' ? 'Head Office (Super Admin)' : user.role === 'developer' ? 'Developer' : `Jobsite ${user.jobsite}`}.`);
  };

  // Logout handler
  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setCurrentModule('dashboard');
    addToast('info', 'Berhasil Keluar', 'Anda telah keluar dari sistem.');
  };

  // Effective Jobsite for filtering
  // Rule: If HO and filter is 'ALL' -> show all. If HO and specific -> filter to that jobsite.
  // If regular user -> ALWAYS filter to their jobsite!
  const effectiveJobsiteFilter = useMemo(() => {
    if (!currentUser) return 'ALL';
    if (currentUser.role === 'ho') {
      return selectedJobsiteFilter; // 'ALL' or specific
    }
    return currentUser.jobsite;
  }, [currentUser, selectedJobsiteFilter]);

  // Realtime Automatic Synchronization (Polling every 5 seconds & on tab focus/visibility)
  useEffect(() => {
    if (!currentUser || currentUser.role === 'developer') return;

    let isMounted = true;
    let isFetching = false;

    const performSilentSync = async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        const res = await AppsScriptSyncService.pullDataFromSheet(true);
        if (isMounted && res.success && res.hasChanged) {
          reloadAllData();
        }
      } catch (err) {
        // silent catch
      } finally {
        isFetching = false;
      }
    };

    // 1. Initial silent sync on mount
    performSilentSync();

    // 2. Continuous lightweight background polling every 3.5 seconds
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        performSilentSync();
      }
    }, 3500);

    // 3. Trigger immediate sync when user focuses window or returns to tab from Google Sheets
    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        performSilentSync();
      }
    };

    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
    };
  }, [currentUser]);

  // Filtered dataset per module according to STEP 3:
  // Populasi Asset (kolom H: jobsite)
  const filteredAssets = useMemo(() => {
    if (effectiveJobsiteFilter === 'ALL') return assets;
    return assets.filter((a) => isJobsiteMatch(a.jobsite, effectiveJobsiteFilter, currentUser?.role));
  }, [assets, effectiveJobsiteFilter, currentUser]);

  // Populasi Toolbox (kolom H: jobsite)
  const filteredToolboxes = useMemo(() => {
    if (effectiveJobsiteFilter === 'ALL') return toolboxes;
    return toolboxes.filter((t) => isJobsiteMatch(t.jobsite, effectiveJobsiteFilter, currentUser?.role));
  }, [toolboxes, effectiveJobsiteFilter, currentUser]);

  // Peminjaman Tools (kolom E: jobsite)
  const filteredPeminjaman = useMemo(() => {
    if (effectiveJobsiteFilter === 'ALL') return peminjaman;
    return peminjaman.filter((p) => isJobsiteMatch(p.jobsite, effectiveJobsiteFilter, currentUser?.role));
  }, [peminjaman, effectiveJobsiteFilter, currentUser]);

  // Pengadaan Barang (kolom B: jobsite)
  const filteredPengadaan = useMemo(() => {
    if (effectiveJobsiteFilter === 'ALL') return pengadaan;
    return pengadaan.filter((p) => isJobsiteMatch(p.jobsite, effectiveJobsiteFilter, currentUser?.role));
  }, [pengadaan, effectiveJobsiteFilter, currentUser]);

  // BA Kerusakan Alat (kolom D: jobsite)
  const filteredKerusakan = useMemo(() => {
    if (effectiveJobsiteFilter === 'ALL') return kerusakan;
    return kerusakan.filter((k) => isJobsiteMatch(k.jobsite, effectiveJobsiteFilter, currentUser?.role));
  }, [kerusakan, effectiveJobsiteFilter, currentUser]);

  // OSR Tools & Facility (kolom B: jobsite)
  const filteredOsr = useMemo(() => {
    if (effectiveJobsiteFilter === 'ALL') return osr;
    return osr.filter((o) => isJobsiteMatch(o.jobsite, effectiveJobsiteFilter, currentUser?.role));
  }, [osr, effectiveJobsiteFilter, currentUser]);

  // BA Serah Terima (kolom B: jobsite)
  const filteredBast = useMemo(() => {
    if (effectiveJobsiteFilter === 'ALL') return bast;
    return bast.filter((b) => isJobsiteMatch(b.jobsite, effectiveJobsiteFilter, currentUser?.role));
  }, [bast, effectiveJobsiteFilter, currentUser]);

  // Manual Trigger for Full Sync
  const handleManualSync = useCallback(async () => {
    setIsSyncing(true);
    addToast('info', 'Menghubungkan ke Google Sheets...', 'Memulai sinkronisasi data.');

    const res = await AppsScriptSyncService.pullDataFromSheet();
    setIsSyncing(false);

    if (res.success) {
      addToast('success', 'Sinkronisasi Selesai', res.message);
      reloadAllData();
    } else {
      addToast('warning', 'Pemberitahuan Sinkronisasi', res.message);
    }
  }, []);

  // Open Form Modal for Create or Edit
  const handleOpenCreateModal = (mod: SheetModule) => {
    setFormModule(mod);
    setItemToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (mod: SheetModule, item: any) => {
    setFormModule(mod);
    setItemToEdit(item);
    setIsFormModalOpen(true);
  };

  // Save (Create / Update) Handler
  const handleSaveItem = async (mod: SheetModule, itemData: any, isEdit: boolean) => {
    if (!currentUser) return;

    const action = isEdit ? 'update' : 'insert';
    const itemsToSave: any[] = Array.isArray(itemData) ? itemData : [itemData];
    const scriptModule = AppsScriptSyncService.getScriptModuleName(mod);

    // Multi-item insert without overwrite (Pengadaan, BA Kerusakan, Peminjaman Tools, BA Serah Terima)
    if (!isEdit && itemsToSave.length > 1) {
      const preparedItems = itemsToSave.map((raw, idx) => {
        let prefix = 'item';
        if (mod === 'pengadaan-barang') prefix = 'pgd';
        else if (mod === 'ba-kerusakan') prefix = 'bak';
        else if (mod === 'peminjaman-tools') prefix = 'pjm';
        else if (mod === 'ba-serah-terima') prefix = 'bst';
        const itemId = raw.id || `${prefix}-${Date.now()}-${idx}`;
        return { ...raw, id: itemId, updatedAt: new Date().toISOString() };
      });

      // 1. Record each item in pending queue and push to Google Spreadsheet
      preparedItems.forEach((p) => {
        const itemKey = p.idPeminjaman || p.noPeminjaman || p.noPengadaan || p.noBa || p.noBast || p.id;
        StorageService.recordPendingItem(scriptModule, itemKey, p);
        AppsScriptSyncService.pushItemToSheet(mod, 'insert', p, currentUser);
      });

      // 2. Add all items to local state and storage
      if (mod === 'pengadaan-barang') {
        const currentList = StorageService.getPengadaan();
        const updated = [...preparedItems, ...currentList];
        StorageService.savePengadaan(updated);
        setPengadaan(updated);
      } else if (mod === 'ba-kerusakan') {
        const currentList = StorageService.getKerusakan();
        const updated = [...preparedItems, ...currentList];
        StorageService.saveKerusakan(updated);
        setKerusakan(updated);
      } else if (mod === 'peminjaman-tools') {
        const currentList = StorageService.getPeminjaman();
        const updated = [...preparedItems, ...currentList];
        StorageService.savePeminjaman(updated);
        setPeminjaman(updated);
      } else if (mod === 'ba-serah-terima') {
        const currentList = StorageService.getBast();
        const updated = [...preparedItems, ...currentList];
        StorageService.saveBast(updated);
        setBast(updated);
      }

      addToast(
        'success',
        'Data Berhasil Ditambahkan',
        `${preparedItems.length} item berhasil disimpan dan disinkronkan ke Spreadsheet.`
      );

      setTimeout(() => {
        AppsScriptSyncService.pullDataFromSheet(true).then((r) => {
          if (r.hasChanged) reloadAllData();
        });
      }, 2500);
      return;
    }

    // Single item insert or update
    for (let i = 0; i < itemsToSave.length; i++) {
      const rawItem = itemsToSave[i];
      const itemId = rawItem.id || `item-${Date.now()}-${i}`;
      const payload = { ...rawItem, id: itemId, updatedAt: new Date().toISOString() };

      const itemKey =
        payload.noRegistrasi ||
        payload.noToolbox ||
        payload.idPeminjaman ||
        payload.noPeminjaman ||
        payload.noPengadaan ||
        payload.noPoPr ||
        payload.noBa ||
        payload.noOsr ||
        payload.noBast ||
        payload.id;

      // Protect item from being cleared by immediate network latency (max 15 seconds)
      StorageService.recordPendingItem(scriptModule, itemKey, payload);

      // Helper to safely upsert into list without duplicate
      const upsert = <T extends { id?: string }>(
        items: T[],
        getKey: (item: T) => string | undefined
      ): T[] => {
        const targetKey = itemKey ? itemKey.trim().toLowerCase() : '';
        const idx = items.findIndex((it) => {
          if (it.id && it.id === payload.id) return true;
          const k = getKey(it);
          return Boolean(k && targetKey && k.trim().toLowerCase() === targetKey);
        });
        if (idx !== -1) {
          const copy = [...items];
          copy[idx] = { ...copy[idx], ...payload };
          return copy;
        }
        return [payload, ...items];
      };

      // Update locally based on module
      switch (mod) {
        case 'populasi-asset': {
          const list = StorageService.getAssets();
          const updated = upsert(list, (a: AssetItem) => a.noRegistrasi);
          StorageService.saveAssets(updated);
          setAssets(updated);
          break;
        }
        case 'populasi-toolbox': {
          const list = StorageService.getToolboxes();
          const updated = upsert(list, (t: ToolboxItem) => t.noToolbox);
          StorageService.saveToolboxes(updated);
          setToolboxes(updated);
          break;
        }
        case 'peminjaman-tools': {
          const list = StorageService.getPeminjaman();
          const updated = upsert(list, (p: PeminjamanItem) => p.idPeminjaman || p.noPeminjaman);
          StorageService.savePeminjaman(updated);
          setPeminjaman(updated);
          break;
        }
        case 'pengadaan-barang': {
          const list = StorageService.getPengadaan();
          const updated = upsert(list, (p: PengadaanItem) => p.noPengadaan || p.noPoPr);
          StorageService.savePengadaan(updated);
          setPengadaan(updated);
          break;
        }
        case 'ba-kerusakan': {
          const list = StorageService.getKerusakan();
          const updated = upsert(list, (k: BaKerusakanItem) => k.noBa);
          StorageService.saveKerusakan(updated);
          setKerusakan(updated);
          break;
        }
        case 'osr-tools': {
          const list = StorageService.getOsr();
          const updated = upsert(list, (o: OsrItem) => o.noOsr);
          StorageService.saveOsr(updated);
          setOsr(updated);
          break;
        }
        case 'ba-serah-terima': {
          const list = StorageService.getBast();
          const updated = upsert(list, (b: BaSerahTerimaItem) => b.noBast);
          StorageService.saveBast(updated);
          setBast(updated);
          break;
        }
      }

      // Push to Google Spreadsheet via Apps Script in background immediately
      AppsScriptSyncService.pushItemToSheet(mod, action, payload, currentUser);
    }

    addToast(
      'success',
      isEdit ? 'Data Diperbarui' : 'Data Berhasil Ditambahkan',
      `${itemsToSave.length} data berhasil disimpan dan disinkronkan ke Spreadsheet.`
    );

    // Re-fetch quietly to ensure spreadsheet state is 100% mirrored
    setTimeout(() => {
      AppsScriptSyncService.pullDataFromSheet(true).then((r) => {
        if (r.hasChanged) reloadAllData();
      });
    }, 2500);
  };

  // Handler Approval Tanda Tangan Digital HO Balikpapan untuk BAST
  const handleApproveBast = async (
    item: BaSerahTerimaItem,
    signatureDataUrl: string,
    signerName: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedItem: BaSerahTerimaItem = {
      ...item,
      hoSignature: signatureDataUrl,
      hoSignDate: today,
      hoSignedBy: signerName,
      status: 'Terverifikasi HO'
    };

    const currentBast = StorageService.getBast();
    const updatedList = currentBast.map((b) =>
      b.id === item.id || b.noBast === item.noBast ? updatedItem : b
    );
    StorageService.saveBast(updatedList);
    setBast(updatedList);

    // Push update to Google Spreadsheet
    await AppsScriptSyncService.pushItemToSheet('ba-serah-terima', 'update', updatedItem, currentUser!);

    addToast(
      'success',
      'Approval Tanda Tangan HO Berhasil',
      `Dokumen ${item.noBast} berhasil diverifikasi dan ditandatangani digital oleh ${signerName}. PDF siap diunduh.`
    );
  };

  // Handler Final Upload Dokumen BAST & BA Kerusakan
  const handleFinalUpload = async (file: File, base64: string) => {
    const { bastItem, kerusakanItem } = dokumentasiModalState;
    if (!currentUser) return;

    if (bastItem) {
      const payloadWithFile = {
        ...bastItem,
        status: 'Terverifikasi HO',
        dokumentasi: base64,
        fileData: {
          base64,
          fileName: `${bastItem.noBast || 'BAST'}.pdf`,
          mimeType: file.type || 'application/pdf'
        }
      };

      const currentBast = StorageService.getBast();
      const updatedList = currentBast.map((b) =>
        b.id === bastItem.id || b.noBast === bastItem.noBast ? payloadWithFile : b
      );
      StorageService.saveBast(updatedList);
      setBast(updatedList);

      // Push update to Google Spreadsheet & GDrive
      await AppsScriptSyncService.pushItemToSheet('ba-serah-terima', 'update', payloadWithFile, currentUser);

      addToast(
        'success',
        'Final Upload Berhasil',
        `Dokumen final untuk ${bastItem.noBast} berhasil diunggah ke Google Drive BAST dan disinkronkan ke Spreadsheet.`
      );
    } else if (kerusakanItem) {
      const payloadWithFile = {
        ...kerusakanItem,
        dokumentasi: base64,
        fotoKerusakan: base64,
        fileData: {
          base64,
          fileName: `${kerusakanItem.noBa || 'BA-KERUSAKAN'}.pdf`,
          mimeType: file.type || 'application/pdf'
        }
      };

      const currentKerusakan = StorageService.getKerusakan();
      const updatedList = currentKerusakan.map((k) =>
        k.id === kerusakanItem.id || k.noBa === kerusakanItem.noBa ? payloadWithFile : k
      );
      StorageService.saveKerusakan(updatedList);
      setKerusakan(updatedList);

      // Push update to Google Spreadsheet & GDrive
      await AppsScriptSyncService.pushItemToSheet('ba-kerusakan', 'update', payloadWithFile, currentUser);

      addToast(
        'success',
        'Final Upload Berhasil',
        `Dokumen final BA Kerusakan ${kerusakanItem.noBa} berhasil diunggah ke Google Drive dan disinkronkan ke Spreadsheet.`
      );
    }
  };

  // Open Delete Confirmation (Strictly HO - Balikpapan)
  const handlePromptDelete = (mod: SheetModule, item: any) => {
    if (!currentUser) return;
    if (currentUser.role !== 'ho' && currentUser.jobsite !== 'HO - Balikpapan') {
      addToast(
        'error',
        'Akses Ditolak',
        'Hanya user "HO - Balikpapan" yang berhak menghapus data aplikasi dan spreadsheet!'
      );
      return;
    }

    const key =
      item.noRegistrasi ||
      item.noToolbox ||
      item.noPeminjaman ||
      item.noPoPr ||
      item.noBa ||
      item.noOsr ||
      item.noBast ||
      item.id;
    const name =
      item.namaAsset ||
      item.namaToolbox ||
      item.namaTool ||
      item.deskripsiBarang ||
      item.namaAlat ||
      item.daftarBarang ||
      '';

    setItemToDelete({
      module: mod,
      item,
      key,
      name,
      jobsite: item.jobsite || ''
    });
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Execution
  const handleConfirmDelete = async () => {
    if (!itemToDelete || !currentUser) return;

    const res = StorageService.deleteItem(itemToDelete.module, itemToDelete.item.id, currentUser);
    setIsDeleteModalOpen(false);

    if (res.success) {
      addToast(
        'success',
        'Data Dihapus',
        `Item "${itemToDelete.key}" berhasil dihapus dari aplikasi & spreadsheet.`
      );
      reloadAllData();

      // Push delete to Google Spreadsheet via Apps Script immediately
      AppsScriptSyncService.pushDeleteToSheet(
        itemToDelete.module,
        itemToDelete.key,
        currentUser
      ).then(() => {
        // Re-fetch quietly to confirm spreadsheet state
        setTimeout(() => {
          AppsScriptSyncService.pullDataFromSheet(true).then((r) => {
            if (r.hasChanged) reloadAllData();
          });
        }, 1500);
      });
    } else {
      addToast('error', 'Gagal Menghapus', res.message);
    }

    setItemToDelete(null);
  };

  // Handler Fitur Aksi "Kembalikan" Tools (Kolom J & M Spreadsheet)
  const handleOpenReturnModal = (item: PeminjamanItem) => {
    setReturnLoanModalState({
      isOpen: true,
      loanItem: item
    });
  };

  const handleConfirmReturn = async (
    item: PeminjamanItem,
    tglRealisasiKembali: string,
    kondisiAkhir: string
  ) => {
    if (!currentUser) return;
    try {
      setIsSubmittingReturn(true);
      const updatedItem: PeminjamanItem = {
        ...item,
        tglRealisasiKembali,
        kondisiAkhir,
        status: 'Kembali',
        updatedAt: new Date().toISOString()
      };

      // 1. Update local storage & state for peminjaman IMMEDIATELY
      const currentList = StorageService.getPeminjaman();
      const updatedList = currentList.map((p) => {
        if (p.id === item.id || (p.idPeminjaman && p.idPeminjaman === item.idPeminjaman && p.kodeAlat === item.kodeAlat)) {
          return updatedItem;
        }
        return p;
      });
      StorageService.savePeminjaman(updatedList);
      setPeminjaman(updatedList);

      // Record pending item to guarantee resilience
      const itemKey = `${updatedItem.idPeminjaman || updatedItem.noPeminjaman || ''}_${updatedItem.kodeAlat || ''}`;
      StorageService.recordPendingItem('peminjaman', itemKey, updatedItem);

      // 2. INTEGRASI MODUL POPULASI ASSET:
      // Jika tools yang dipinjam dikembalikan dengan kondisi rusak, update juga kondisi tools pada modul populasi asset
      const isDamaged =
        kondisiAkhir.includes('Rusak') ||
        kondisiAkhir.includes('Defect') ||
        kondisiAkhir.includes('Non-Operational');

      const targetToolCode = (item.kodeAlat || (item as any).noRegistrasi || '').trim().toLowerCase();
      const targetToolName = (item.namaAsset || item.namaTool || '').trim().toLowerCase();
      
      const currentAssets = StorageService.getAssets();
      let matchedAsset: AssetItem | null = null;

      if (isDamaged) {
        const updatedAssetsList = currentAssets.map((asset) => {
          const assetReg = (asset.noRegistrasi || '').trim().toLowerCase();
          const assetName = (asset.namaAsset || '').trim().toLowerCase();
          const isMatch = (targetToolCode && assetReg === targetToolCode) || 
                          (!targetToolCode && targetToolName && assetName === targetToolName);
          
          if (isMatch) {
            matchedAsset = {
              ...asset,
              kondisiAwal: kondisiAkhir,
              updatedAt: new Date().toISOString()
            };
            return matchedAsset;
          }
          return asset;
        });

        if (matchedAsset) {
          StorageService.saveAssets(updatedAssetsList);
          setAssets(updatedAssetsList);
          StorageService.recordPendingItem('assets', (matchedAsset as AssetItem).noRegistrasi, matchedAsset);
        }
      }

      // 3. TUTUP MODAL SECARA INSTAN (0 Lag) & TAMPILKAN FEEDBACK
      setReturnLoanModalState({ isOpen: false, loanItem: null });
      setIsSubmittingReturn(false);

      addToast(
        'success',
        'Tools Berhasil Dikembalikan',
        `${updatedItem.namaAsset || updatedItem.namaTool || 'Alat'} tercatat kembali (${kondisiAkhir}). Data Kolom J & M berhasil disimpan.`
      );

      if (isDamaged && matchedAsset) {
        addToast(
          'info',
          'Populasi Asset Terupdate',
          `Kondisi alat ${(matchedAsset as AssetItem).noRegistrasi} pada Populasi Asset otomatis disinkronkan menjadi "${kondisiAkhir}".`
        );
      }

      // 4. SINKRONISASI KE GOOGLE SPREADSHEET SECARA PARALEL (Background Asynchronous)
      // Menghilangkan jeda/freeze dengan menjalankan push secara paralel tanpa memblokir UI
      const syncTasks: Promise<any>[] = [
        AppsScriptSyncService.pushItemToSheet('peminjaman-tools', 'update', updatedItem, currentUser)
      ];

      if (isDamaged && matchedAsset) {
        syncTasks.push(
          AppsScriptSyncService.pushItemToSheet('populasi-asset', 'update', matchedAsset, currentUser)
        );
      }

      Promise.allSettled(syncTasks).then((results) => {
        const anyFailed = results.some(r => r.status === 'rejected');
        if (anyFailed) {
          console.warn('Background sync encountered network warning, recorded in pending items.');
        }
      }).catch((syncErr) => {
        console.warn('Background sync error:', syncErr);
      });

      // Quiet re-fetch to confirm spreadsheet state
      setTimeout(() => {
        AppsScriptSyncService.pullDataFromSheet(true).then((r) => {
          if (r.hasChanged) reloadAllData();
        });
      }, 4000);
    } catch (err: any) {
      addToast('error', 'Gagal Memproses Pengembalian', err.message || 'Terjadi kesalahan sistem');
      setIsSubmittingReturn(false);
    }
  };

  // Not logged in -> Render Login Page
  if (!currentUser) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  // Column definitions matching the spreadsheet exactly
  const assetColumns = [
    { key: 'noRegistrasi', header: 'No Registrasi (A)' },
    { key: 'namaAsset', header: 'Nama Asset (B)' },
    { key: 'kategori', header: 'Kategori (C)' },
    { key: 'merkBrand', header: 'Merk/Brand (D)' },
    { key: 'noPo', header: 'No PO (E)' },
    { key: 'tglSupply', header: 'Tgl Supply (F)' },
    { key: 'lokasiPenempatan', header: 'Lokasi Penempatan (G)' },
    { key: 'jobsite', header: 'Jobsite (H)', isJobsiteColumn: true },
    {
      key: 'kondisiAwal',
      header: 'Kondisi Awal (I)',
      render: (row: AssetItem) => {
        const k = row.kondisiAwal?.toLowerCase() || '';
        let color = 'bg-slate-100 text-slate-700 border border-slate-200';
        if (k.includes('baik')) color = 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold';
        else if (k.includes('ringan')) color = 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold';
        else if (k.includes('berat')) color = 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold';
        else if (k.includes('perbaiki') || k.includes('maint'))
          color = 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold';
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] ${color}`}>
            {row.kondisiAwal || '-'}
          </span>
        );
      }
    },
    { key: 'spesifikasiKeterangan', header: 'Spesifikasi & Keterangan (J)' },
    { key: 'tanggalPenginputan', header: 'Tgl Penginputan (K)' }
  ];

  const toolboxColumns = [
    { key: 'noToolbox', header: 'No Toolbox (A)' },
    { key: 'namaToolbox', header: 'Nama Toolbox (B)' },
    { key: 'jenisToolbox', header: 'Kategori (C)' },
    { key: 'merkBrand', header: 'Merk/Brand (D)' },
    { key: 'jumlahItem', header: 'No PO (E)' },
    { key: 'tglSupply', header: 'Tgl Supply (F)' },
    { key: 'lokasiPenempatan', header: 'Lokasi Penempatan (G)' },
    { key: 'jobsite', header: 'Jobsite (H)', isJobsiteColumn: true },
    { key: 'kondisi', header: 'Kondisi (I)' },
    { key: 'pic', header: 'PIC Penanggung Jawab (J)' },
    { key: 'keterangan', header: 'Keterangan (K)' }
  ];

  const peminjamanColumns = [
    {
      key: 'idPeminjaman',
      header: 'ID Peminjaman (A)',
      render: (row: PeminjamanItem) => (
        <span className="font-mono text-emerald-800 font-bold">
          {row.idPeminjaman || row.noPeminjaman || '-'}
        </span>
      )
    },
    { key: 'kodeAlat', header: 'Kode Alat (B)' },
    {
      key: 'namaAsset',
      header: 'Nama Asset (C)',
      render: (row: PeminjamanItem) => row.namaAsset || row.namaTool || '-'
    },
    { key: 'kategori', header: 'Kategori (D)' },
    { key: 'jobsite', header: 'Jobsite (E)', isJobsiteColumn: true },
    { key: 'peminjam', header: 'Peminjam (F)' },
    { key: 'section', header: 'Section/Departemen (G)' },
    { key: 'tglPinjam', header: 'Tgl Pinjam (H)' },
    {
      key: 'estimasiKembali',
      header: 'Estimasi Kembali (I)',
      render: (row: PeminjamanItem) => row.estimasiKembali || row.tglRencanaKembali || '-'
    },
    {
      key: 'tglRealisasiKembali',
      header: 'Tgl Realisasi Kembali (J)',
      render: (row: PeminjamanItem) => (
        row.tglRealisasiKembali ? (
          <span className="font-mono text-emerald-800 font-semibold">
            {row.tglRealisasiKembali}
          </span>
        ) : (
          <span className="text-slate-400 italic text-[11px]">-</span>
        )
      )
    },
    {
      key: 'status',
      header: 'Status (K)',
      render: (row: PeminjamanItem) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            row.status === 'Kembali'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : row.status === 'Terlambat'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {row.status || 'Dipinjam'}
        </span>
      )
    },
    { key: 'kondisiAwal', header: 'Kondisi Awal (L)' },
    {
      key: 'kondisiAkhir',
      header: 'Kondisi Akhir (M)',
      render: (row: PeminjamanItem) => {
        if (!row.kondisiAkhir) return <span className="text-slate-400 italic text-[11px]">-</span>;
        const lower = row.kondisiAkhir.toLowerCase();
        let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
        if (lower.includes('baik')) badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
        else if (lower.includes('ringan')) badgeColor = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
        else if (lower.includes('berat')) badgeColor = 'bg-rose-50 text-rose-800 border-rose-300 font-bold';

        return (
          <span className={`px-2 py-0.5 rounded-md text-[10px] border ${badgeColor}`}>
            {row.kondisiAkhir}
          </span>
        );
      }
    },
    { key: 'keperluan', header: 'Keperluan (N)' }
  ];

  const pengadaanColumns = [
    {
      key: 'noPengadaan',
      header: 'No Pengadaan (A)',
      render: (row: PengadaanItem) => (
        <span className="font-mono text-emerald-800 font-bold">
          {row.noPengadaan || row.noPoPr || '-'}
        </span>
      )
    },
    { key: 'jobsite', header: 'Jobsite (B)', isJobsiteColumn: true },
    { key: 'kategori', header: 'Kategori (C)' },
    { key: 'typeBarang', header: 'Type (D)' },
    { key: 'noCer', header: 'No CER (E)' },
    { key: 'partNumber', header: 'Part Number (F)' },
    {
      key: 'namaAlat',
      header: 'Nama Alat (G)',
      render: (row: PengadaanItem) => row.namaAlat || row.deskripsiBarang || '-'
    },
    { key: 'qty', header: 'Qty (H)' },
    {
      key: 'tglPengadaan',
      header: 'Tgl Pengadaan (I)',
      render: (row: PengadaanItem) => row.tglPengadaan || row.tglPengajuan || '-'
    },
    { key: 'noUr', header: 'No UR (J)' },
    { key: 'noPr', header: 'No PR (K)' },
    { key: 'noPo', header: 'No PO (L)' },
    { key: 'qtyPr', header: 'Qty PR (M)' },
    { key: 'qtyPo', header: 'Qty PO (N)' },
    { key: 'qtyGr', header: 'Qty GR (O)' },
    {
      key: 'vendor',
      header: 'Vendor (P)',
      render: (row: PengadaanItem) => row.vendor || row.supplier || '-'
    },
    {
      key: 'totalPrice',
      header: 'Total Price (Q)',
      render: (row: PengadaanItem) => (
        <span className="font-mono font-semibold text-slate-900">
          Rp {row.totalPrice || row.estimasiBiaya || '0'}
        </span>
      )
    },
    { key: 'agingDays', header: 'Aging Days (R)' },
    { key: 'tglSupply', header: 'Tgl Supply (S)' },
    {
      key: 'remarks',
      header: 'Remarks (T)',
      render: (row: PengadaanItem) => row.remarks || row.keterangan || '-'
    },
    {
      key: 'status',
      header: 'Status (U)',
      render: (row: PengadaanItem) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            row.status === 'Diterima di Site'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : row.status === 'Disetujui HO'
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {row.status || 'Draft'}
        </span>
      )
    },
    {
      key: 'dokumentasi',
      header: 'Dokumentasi (V)',
      render: (row: PengadaanItem) => (
        <button
          type="button"
          onClick={() => {
            setDokumentasiModalState({
              isOpen: true,
              title: `Dokumen Pengadaan ${row.noPengadaan || ''}`,
              url: row.dokumentasi || '',
              isImage: false,
              folderUrl: GDRIVE_CONFIG.PENGADAAN_FOLDER_URL,
              folderName: 'Pengadaan Barang',
              bastItem: null
            });
          }}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            row.dokumentasi
              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-700" />
          <span>{row.dokumentasi ? 'Lihat Dokumen' : 'Folder GDrive'}</span>
        </button>
      )
    }
  ];

  const kerusakanColumns = [
    { key: 'noBa', header: 'No Berita Acara (A)' },
    { key: 'noOsr', header: 'No OSR (B)' },
    { key: 'jenisTools', header: 'Jenis Tools (C)' },
    { key: 'jobsite', header: 'Jobsite (D)', isJobsiteColumn: true },
    { key: 'noRegister', header: 'No Register (E)' },
    {
      key: 'namaAsset',
      header: 'Nama Asset (F)',
      render: (row: BaKerusakanItem) => (
        <div className="flex items-center gap-1.5">
          <span>{row.namaAsset || row.namaAlat || '-'}</span>
          {(row.fotoKerusakan || row.dokumentasi) && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              📷 Foto
            </span>
          )}
        </div>
      )
    },
    { key: 'brand', header: 'Brand (G)' },
    { key: 'tglSupply', header: 'Tgl Supply (H)' },
    {
      key: 'tglKerusakan',
      header: 'Tgl Kerusakan (I)',
      render: (row: BaKerusakanItem) => row.tglKerusakan || row.tglKejadian || '-'
    },
    { key: 'lifeTime', header: 'Life Time (J)' },
    {
      key: 'action',
      header: 'Action (K)',
      render: (row: BaKerusakanItem) => row.action || row.tindakanKorektif || '-'
    },
    {
      key: 'status',
      header: 'Status (L)',
      render: (row: BaKerusakanItem) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            row.status === 'Selesai'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {row.status || 'Investigasi'}
        </span>
      )
    },
    {
      key: 'kronologi',
      header: 'Kronologi (N)',
      render: (row: BaKerusakanItem) => (
        <span className="text-xs text-slate-700 max-w-xs line-clamp-2" title={row.kronologi || row.kronologiKerusakan || ''}>
          {row.kronologi || row.kronologiKerusakan || '-'}
        </span>
      )
    },
    {
      key: 'dokumentasi',
      header: 'Dokumentasi (M)',
      render: (row: BaKerusakanItem) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setDokumentasiModalState({
                isOpen: true,
                title: `BA Kerusakan ${row.noBa || ''} - ${row.namaAsset || ''}`,
                url: row.fotoKerusakan || row.dokumentasi || '',
                isImage: true,
                folderUrl: GDRIVE_CONFIG.KERUSAKAN_FOLDER_URL,
                folderName: 'BA Kerusakan Alat',
                bastItem: null,
                kerusakanItem: row
              });
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              row.fotoKerusakan || row.dokumentasi
                ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
            title="Lihat Foto & Opsi Upload Final"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-700" />
            <span>{row.fotoKerusakan || row.dokumentasi ? 'Lihat Foto' : 'Dokumentasi'}</span>
          </button>
          <button
            type="button"
            onClick={() => PdfService.downloadBaKerusakanPdf(row)}
            className="p-1.5 rounded-lg text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
            title="Download PDF BA Kerusakan Resmi (4 Approval)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  const osrColumns = [
    { key: 'noOsr', header: 'No OSR (A)' },
    { key: 'jobsite', header: 'Jobsite (B)', isJobsiteColumn: true },
    {
      key: 'dateOsr',
      header: 'Date OSR (C)',
      render: (row: OsrItem) => row.dateOsr || row.tglKirim || '-'
    },
    { key: 'noRegistrasi', header: 'No Registrasi (D)' },
    {
      key: 'namaAsset',
      header: 'Nama Asset (E)',
      render: (row: OsrItem) => row.namaAsset || row.namaTool || '-'
    },
    { key: 'keteranganKerusakan', header: 'Keterangan Kerusakan (F)' },
    { key: 'pr', header: 'PR (G)' },
    { key: 'po', header: 'PO (H)' },
    {
      key: 'vendor',
      header: 'Vendor (I)',
      render: (row: OsrItem) => row.vendor || row.vendorRekanan || '-'
    },
    {
      key: 'amount',
      header: 'Amount (J)',
      render: (row: OsrItem) => (
        <span className="font-mono font-semibold text-slate-900">Rp {row.amount || row.biayaPerbaikan || '0'}</span>
      )
    },
    { key: 'condition', header: 'Condition (K)' },
    {
      key: 'remarks',
      header: 'Remarks (L)',
      render: (row: OsrItem) => row.remarks || row.keterangan || '-'
    },
    { key: 'tglSupply', header: 'Tgl Supply (M)' },
    {
      key: 'status',
      header: 'Status (N)',
      render: (row: OsrItem) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            row.status === 'Selesai Diterima'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {row.status || 'Sedang Dikerjakan'}
        </span>
      )
    },
    {
      key: 'dokumentasi',
      header: 'Dokumentasi (O)',
      render: (row: OsrItem) => (
        <button
          type="button"
          onClick={() => {
            setDokumentasiModalState({
              isOpen: true,
              title: `Dokumentasi OSR ${row.noOsr || ''} - ${row.namaAsset || ''}`,
              url: row.dokumentasi || row.fotoKerusakan || '',
              isImage: true,
              folderUrl: GDRIVE_CONFIG.OSR_FOLDER_URL,
              folderName: 'OSR Tools & Facility',
              bastItem: null,
              kerusakanItem: null
            });
          }}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            row.dokumentasi || row.fotoKerusakan
              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-emerald-700" />
          <span>{row.dokumentasi || row.fotoKerusakan ? 'Lihat Foto' : 'Folder GDrive'}</span>
        </button>
      )
    }
  ];

  const bastColumns = [
    { key: 'noBast', header: 'No Bast (A)' },
    { key: 'jobsite', header: 'Jobsite (B)', isJobsiteColumn: true },
    {
      key: 'date',
      header: 'Date (C)',
      render: (row: BaSerahTerimaItem) => row.date || row.tglSerahTerima || '-'
    },
    { key: 'namaAsset', header: 'Nama Asset (D)' },
    { key: 'po', header: 'PO (E)' },
    {
      key: 'remarks',
      header: 'Remarks (F)',
      render: (row: BaSerahTerimaItem) => row.remarks || row.keterangan || '-'
    },
    { key: 'noRegister', header: 'No Register (G)' },
    {
      key: 'penerima',
      header: 'Penerima (H)',
      render: (row: BaSerahTerimaItem) => row.penerima || row.pihakKedua || '-'
    },
    {
      key: 'status',
      header: 'Status (I)',
      render: (row: BaSerahTerimaItem) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            row.status === 'Terverifikasi HO'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-sky-50 text-sky-700 border border-sky-200'
          }`}
        >
          {row.status || 'Draft'}
        </span>
      )
    },
    {
      key: 'dokumentasi',
      header: 'Dokumentasi (J)',
      render: (row: BaSerahTerimaItem) => {
        const isApproved = Boolean(row.hoSignature || row.status === 'Terverifikasi HO');
        const isHo = currentUser?.role === 'ho' || currentUser?.jobsite === 'HO - Balikpapan';
        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setDokumentasiModalState({
                  isOpen: true,
                  title: `Dokumen BAST ${row.noBast || ''}`,
                  url: row.dokumentasi || '',
                  isImage: false,
                  folderUrl: GDRIVE_CONFIG.BAST_FOLDER_URL,
                  folderName: 'BA Serah Terima',
                  bastItem: row
                });
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 transition"
              title="Lihat Dokumen & Opsi Upload Final"
            >
              <FileText className="w-3 h-3 text-emerald-700" />
              <span>Dokumen</span>
            </button>

            {isHo && !isApproved && (
              <button
                type="button"
                onClick={() => {
                  setHoSignatureModalState({
                    isOpen: true,
                    bastItem: row
                  });
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 transition shadow-sm"
                title="Berikan Tanda Tangan Digital HO"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Sign HO</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (!isApproved) {
                  alert(
                    'Dokumen BAST dapat didownload setelah dilakukan approval berupa tanda tangan digital oleh user HO - Balikpapan.'
                  );
                  return;
                }
                PdfService.downloadBastPdf(row);
              }}
              className={`p-1.5 rounded-lg text-xs transition ${
                isApproved
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
              title={isApproved ? 'Download PDF BAST Resmi' : 'Menunggu Approval HO Balikpapan'}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F5] text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        selectedJobsiteFilter={selectedJobsiteFilter}
        onJobsiteFilterChange={(site) => {
          setSelectedJobsiteFilter(site);
          addToast('info', 'Filter Jobsite Aktif', `Menampilkan data untuk: ${site === 'ALL' ? 'Semua Jobsite' : site}`);
        }}
        onLogout={handleLogout}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenDeveloperModal={() => setIsDeveloperModalOpen(true)}
        isSyncing={isSyncing}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentModule={currentModule}
          onSelectModule={(mod) => setCurrentModule(mod)}
          currentUser={currentUser}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          counts={{
            assets: filteredAssets.length,
            toolboxes: filteredToolboxes.length,
            peminjaman: filteredPeminjaman.length,
            pengadaan: filteredPengadaan.length,
            kerusakan: filteredKerusakan.length,
            osr: filteredOsr.length,
            bast: filteredBast.length
          }}
        />

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {currentModule === 'dashboard' && (
            <Dashboard
              currentUser={currentUser}
              activeJobsite={effectiveJobsiteFilter}
              assets={filteredAssets}
              toolboxes={filteredToolboxes}
              peminjaman={filteredPeminjaman}
              pengadaan={filteredPengadaan}
              kerusakan={filteredKerusakan}
              osr={filteredOsr}
              bast={filteredBast}
              onNavigate={(mod) => setCurrentModule(mod)}
              onOpenCreateModal={handleOpenCreateModal}
              onManualSync={handleManualSync}
              isSyncing={isSyncing}
            />
          )}

          {currentModule === 'populasi-asset' && (
            <DataTable
              module="populasi-asset"
              title="Populasi Asset (Sheet Populasi Asset)"
              description={`Data peralatan & fasilitas ESF. Filter Jobsite mengacu pada Kolom H (${effectiveJobsiteFilter === 'ALL' ? 'Semua Site' : effectiveJobsiteFilter}).`}
              data={filteredAssets}
              columns={assetColumns}
              currentUser={currentUser}
              onAdd={() => handleOpenCreateModal('populasi-asset')}
              onEdit={(item) => handleOpenEditModal('populasi-asset', item)}
              onDelete={(item) => handlePromptDelete('populasi-asset', item)}
              onManualSync={handleManualSync}
              isSyncing={isSyncing}
            />
          )}

          {currentModule === 'populasi-toolbox' && (
            <DataTable
              module="populasi-toolbox"
              title="Populasi Toolbox (Sheet Populasi Toolbox)"
              description={`Daftar kotak perkakas kerja & inventaris mekanik. Filter Jobsite mengacu pada Kolom H (${effectiveJobsiteFilter === 'ALL' ? 'Semua Site' : effectiveJobsiteFilter}).`}
              data={filteredToolboxes}
              columns={toolboxColumns}
              currentUser={currentUser}
              onAdd={() => handleOpenCreateModal('populasi-toolbox')}
              onEdit={(item) => handleOpenEditModal('populasi-toolbox', item)}
              onDelete={(item) => handlePromptDelete('populasi-toolbox', item)}
              onManualSync={handleManualSync}
              isSyncing={isSyncing}
            />
          )}

          {currentModule === 'peminjaman-tools' && (
            <DataTable
              module="peminjaman-tools"
              title="Peminjaman Tools (Sheet Peminjaman Tools)"
              description={`Pencatatan sirkulasi peminjaman alat harian. Filter Jobsite mengacu pada Kolom E (${effectiveJobsiteFilter === 'ALL' ? 'Semua Site' : effectiveJobsiteFilter}).`}
              data={filteredPeminjaman}
              columns={peminjamanColumns}
              currentUser={currentUser}
              onAdd={() => handleOpenCreateModal('peminjaman-tools')}
              onEdit={(item) => handleOpenEditModal('peminjaman-tools', item)}
              onDelete={(item) => handlePromptDelete('peminjaman-tools', item)}
              onReturn={(item) => handleOpenReturnModal(item)}
              onManualSync={handleManualSync}
              isSyncing={isSyncing}
            />
          )}

          {currentModule === 'pengadaan-barang' && (
            <DataTable
              module="pengadaan-barang"
              title="Pengadaan Barang (Sheet Pengadaan Barang)"
              description={`Tracking purchase request (PR) dan purchase order (PO) fasilitas. Filter Jobsite mengacu pada Kolom B (${effectiveJobsiteFilter === 'ALL' ? 'Semua Site' : effectiveJobsiteFilter}).`}
              data={filteredPengadaan}
              columns={pengadaanColumns}
              currentUser={currentUser}
              onAdd={() => handleOpenCreateModal('pengadaan-barang')}
              onEdit={(item) => handleOpenEditModal('pengadaan-barang', item)}
              onDelete={(item) => handlePromptDelete('pengadaan-barang', item)}
              onManualSync={handleManualSync}
              isSyncing={isSyncing}
            />
          )}

          {currentModule === 'ba-kerusakan' && (
            <DataTable
              module="ba-kerusakan"
              title="BA Kerusakan Alat (Sheet BA Kerusakan Alat)"
              description={`Laporan Berita Acara insiden kerusakan aset alat. Filter Jobsite mengacu pada Kolom D (${effectiveJobsiteFilter === 'ALL' ? 'Semua Site' : effectiveJobsiteFilter}).`}
              data={filteredKerusakan}
              columns={kerusakanColumns}
              currentUser={currentUser}
              onAdd={() => handleOpenCreateModal('ba-kerusakan')}
              onEdit={(item) => handleOpenEditModal('ba-kerusakan', item)}
              onDelete={(item) => handlePromptDelete('ba-kerusakan', item)}
              onManualSync={handleManualSync}
              isSyncing={isSyncing}
            />
          )}

          {currentModule === 'osr-tools' && (
            <DataTable
              module="osr-tools"
              title="OSR Tools & Facility (Sheet OSR Tools & Facility)"
              description={`Laporan perbaikan alat ke vendor luar (Off-Site Repair). Filter Jobsite mengacu pada Kolom B (${effectiveJobsiteFilter === 'ALL' ? 'Semua Site' : effectiveJobsiteFilter}).`}
              data={filteredOsr}
              columns={osrColumns}
              currentUser={currentUser}
              onAdd={() => handleOpenCreateModal('osr-tools')}
              onEdit={(item) => handleOpenEditModal('osr-tools', item)}
              onDelete={(item) => handlePromptDelete('osr-tools', item)}
              onManualSync={handleManualSync}
              isSyncing={isSyncing}
            />
          )}

          {currentModule === 'ba-serah-terima' && (
            <DataTable
              module="ba-serah-terima"
              title="BA Serah Terima (Sheet BA Serah Terima)"
              description={`Dokumen Berita Acara Serah Terima (BAST) aset. Filter Jobsite mengacu pada Kolom B (${effectiveJobsiteFilter === 'ALL' ? 'Semua Site' : effectiveJobsiteFilter}).`}
              data={filteredBast}
              columns={bastColumns}
              currentUser={currentUser}
              onAdd={() => handleOpenCreateModal('ba-serah-terima')}
              onEdit={(item) => handleOpenEditModal('ba-serah-terima', item)}
              onDelete={(item) => handlePromptDelete('ba-serah-terima', item)}
              onManualSync={handleManualSync}
              isSyncing={isSyncing}
            />
          )}

          {currentModule === 'developer-panel' && (
            <DeveloperPanel onNotify={addToast} />
          )}

          {currentModule === 'apps-script-sync' && (
            <div className="max-w-4xl mx-auto">
              <AppsScriptModal
                isOpen={true}
                onClose={() => setCurrentModule('dashboard')}
                onSyncNow={handleManualSync}
                isSyncing={isSyncing}
                onNotify={addToast}
              />
            </div>
          )}
        </main>
      </div>

      {/* Manual Input / Edit Form Modal */}
      <DataFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        module={formModule}
        currentUser={currentUser}
        itemToEdit={itemToEdit}
        onSave={handleSaveItem}
        availableAssets={assets}
      />

      {/* Dokumentasi Preview & GDrive Modal */}
      <DokumentasiModal
        isOpen={dokumentasiModalState.isOpen}
        onClose={() => setDokumentasiModalState((prev) => ({ ...prev, isOpen: false }))}
        title={dokumentasiModalState.title}
        url={dokumentasiModalState.url}
        isImage={dokumentasiModalState.isImage}
        folderUrl={dokumentasiModalState.folderUrl}
        folderName={dokumentasiModalState.folderName}
        bastItem={dokumentasiModalState.bastItem}
        kerusakanItem={dokumentasiModalState.kerusakanItem}
        onFinalUpload={handleFinalUpload}
        onOpenHoSign={() => {
          if (dokumentasiModalState.bastItem) {
            setHoSignatureModalState({
              isOpen: true,
              bastItem: dokumentasiModalState.bastItem
            });
          }
        }}
        isHoUser={currentUser?.role === 'ho' || currentUser?.jobsite === 'HO - Balikpapan'}
      />

      {/* HO Balikpapan Digital Signature Modal */}
      <HoSignatureModal
        isOpen={hoSignatureModalState.isOpen}
        onClose={() => setHoSignatureModalState({ isOpen: false, bastItem: null })}
        bastItem={hoSignatureModalState.bastItem}
        onApprove={handleApproveBast}
        currentUserName={currentUser?.name || currentUser?.username || 'HO - Balikpapan'}
      />

      {/* Return Loan Modal (Aksi Kembalikan Tools - Kolom J & M) */}
      <ReturnLoanModal
        isOpen={returnLoanModalState.isOpen}
        onClose={() => setReturnLoanModalState({ isOpen: false, loanItem: null })}
        loanItem={returnLoanModalState.loanItem}
        onConfirmReturn={handleConfirmReturn}
        isSubmitting={isSubmittingReturn}
      />

      {/* Delete Confirmation Modal (HO - Balikpapan Only) */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        moduleName={itemToDelete?.module || ''}
        itemKey={itemToDelete?.key || ''}
        itemName={itemToDelete?.name || ''}
        jobsite={itemToDelete?.jobsite || ''}
      />

      {/* Quick Apps Script Modal (when opened from Navbar) */}
      <AppsScriptModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncNow={handleManualSync}
        isSyncing={isSyncing}
        onNotify={addToast}
      />

      {/* Quick Developer Modal (when opened from Navbar) */}
      {isDeveloperModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-base font-bold text-white">Panel Pengembang (Developer)</h3>
              <button
                type="button"
                onClick={() => setIsDeveloperModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>
            <DeveloperPanel onNotify={addToast} />
          </div>
        </div>
      )}

      {/* Notification Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
