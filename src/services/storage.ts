import {
  User,
  AssetItem,
  ToolboxItem,
  PeminjamanItem,
  PengadaanItem,
  BaKerusakanItem,
  OsrItem,
  BaSerahTerimaItem,
  SyncConfig,
  SyncLog
} from '../types';
import { INITIAL_USERS } from '../data/defaultUsers';
import { INITIAL_ASSETS } from '../data/initialAssets';
import {
  INITIAL_TOOLBOXES,
  INITIAL_PEMINJAMAN,
  INITIAL_PENGADAAN,
  INITIAL_BA_KERUSAKAN,
  INITIAL_OSR,
  INITIAL_BA_SERAH_TERIMA
} from '../data/seedData';
import { GOOGLE_APPS_SCRIPT_WEB_APP_URL } from '../config/appConfig';

const STORAGE_KEYS = {
  USERS: 'esf_users_v1',
  CURRENT_USER: 'esf_current_user_v1',
  ASSETS: 'esf_assets_v1',
  TOOLBOXES: 'esf_toolboxes_v1',
  PEMINJAMAN: 'esf_peminjaman_v1',
  PENGADAAN: 'esf_pengadaan_v1',
  KERUSAKAN: 'esf_kerusakan_v1',
  OSR: 'esf_osr_v1',
  BAST: 'esf_bast_v1',
  SYNC_CONFIG: 'esf_sync_config_v1',
  SYNC_LOGS: 'esf_sync_logs_v1'
};

function formatCellDate(val: any): string {
  if (!val) return '';
  const s = String(val).trim();
  if (s.includes('T') && s.endsWith('Z')) {
    return s.split('T')[0];
  }
  return s;
}

/**
 * Deduplicate array of items by primary key (case-insensitive) to prevent duplicate entries
 */
export function deduplicateByKey<T>(items: T[], getKey: (item: T) => string | undefined): T[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (!item) continue;
    const rawKey = getKey(item);
    const normalized = rawKey ? rawKey.trim().toLowerCase() : '';
    if (normalized) {
      if (!seen.has(normalized)) {
        seen.add(normalized);
        result.push(item);
      }
    } else {
      result.push(item);
    }
  }
  return result;
}

interface PendingItem {
  module: string;
  key: string;
  data: any;
  timestamp: number;
}

export class StorageService {
  // Pending items queue to guarantee newly added items are not lost during immediate network latency
  // Retained only for 15 seconds so deleted rows in spreadsheet are accurately removed in the app
  static getPendingItems(): PendingItem[] {
    const raw = localStorage.getItem('esf_pending_items_v2');
    if (!raw) return [];
    try {
      const items: PendingItem[] = JSON.parse(raw);
      // Retain pending items up to 15 seconds only
      const valid = items.filter((p) => Date.now() - (p.timestamp || 0) < 15 * 1000);
      return valid;
    } catch {
      return [];
    }
  }

  static recordPendingItem(module: string, key: string, data: any): void {
    if (!key) return;
    try {
      const cleanKey = String(key).trim().toLowerCase();
      const pending = this.getPendingItems().filter(
        (p) => !(p.module === module && p.key.toLowerCase() === cleanKey)
      );
      // Strip heavy file data or huge base64 from pending localStorage to prevent quota exceeded
      let safeData = data;
      if (data && typeof data === 'object') {
        safeData = { ...data };
        if (safeData.fileData) delete safeData.fileData;
      }
      pending.unshift({
        module,
        key: cleanKey,
        data: safeData,
        timestamp: Date.now()
      });
      localStorage.setItem('esf_pending_items_v2', JSON.stringify(pending));
    } catch (err) {
      console.warn('LocalStorage quota or write error in recordPendingItem:', err);
    }
  }

  static removePendingItem(module: string, key: string): void {
    if (!key) return;
    try {
      const cleanKey = String(key).trim().toLowerCase();
      const pending = this.getPendingItems().filter(
        (p) => !(p.module === module && p.key.toLowerCase() === cleanKey)
      );
      localStorage.setItem('esf_pending_items_v2', JSON.stringify(pending));
    } catch (err) {
      console.warn('LocalStorage error in removePendingItem:', err);
    }
  }

  // Deleted keys tracker so deleted items do not get resurrected during background fetch
  static recordDeletedKey(module: string, key: string): void {
    if (!key) return;
    const raw = localStorage.getItem('esf_deleted_keys_v1');
    let list: { module: string; key: string; time: number }[] = [];
    try {
      list = raw ? JSON.parse(raw) : [];
    } catch {
      list = [];
    }
    const cleanKey = String(key).trim().toLowerCase();
    list = list.filter((x) => !(x.module === module && x.key.toLowerCase() === cleanKey) && Date.now() - x.time < 300000);
    list.push({ module, key: cleanKey, time: Date.now() });
    localStorage.setItem('esf_deleted_keys_v1', JSON.stringify(list));
  }

  static isDeletedKey(module: string, key: string): boolean {
    if (!key) return false;
    const raw = localStorage.getItem('esf_deleted_keys_v1');
    if (!raw) return false;
    try {
      const list: { module: string; key: string; time: number }[] = JSON.parse(raw);
      const cleanKey = String(key).trim().toLowerCase();
      return list.some((x) => x.module === module && x.key.toLowerCase() === cleanKey && Date.now() - x.time < 300000);
    } catch {
      return false;
    }
  }
  // --- USER AUTHENTICATION & MANAGEMENT ---
  static getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static authenticate(username: string, password: string):User | null {
    const users = this.getUsers();
    const user = users.find(
      u => u.username.trim().toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (user) {
      const loggedUser = { ...user, lastLogin: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(loggedUser));
      return loggedUser;
    }
    return null;
  }

  static getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // Developer actions
  static updatePassword(username: string, newPassword: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.username === username);
    if (idx !== -1) {
      users[idx].password = newPassword;
      this.saveUsers(users);
      return true;
    }
    return false;
  }

  static addUser(newUser: User): boolean {
    const users = this.getUsers();
    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      return false;
    }
    users.push(newUser);
    this.saveUsers(users);
    return true;
  }

  static deleteUser(username: string): boolean {
    let users = this.getUsers();
    if (username === 'Developer' || username === 'HO - Balikpapan') {
      return false; // protect essential accounts
    }
    users = users.filter(u => u.username !== username);
    this.saveUsers(users);
    return true;
  }

  static resetUsersToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }

  // --- DATA MODULES GETTERS & SETTERS ---
  static getAssets(): AssetItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(INITIAL_ASSETS));
      return INITIAL_ASSETS;
    }
    try {
      const parsed: AssetItem[] = JSON.parse(raw);
      return deduplicateByKey(parsed, (a) => a.noRegistrasi || a.id);
    } catch {
      return INITIAL_ASSETS;
    }
  }

  static saveAssets(items: AssetItem[]): void {
    const deduped = deduplicateByKey(items, (a) => a.noRegistrasi || a.id);
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(deduped));
  }

  static getToolboxes(): ToolboxItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TOOLBOXES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TOOLBOXES, JSON.stringify(INITIAL_TOOLBOXES));
      return INITIAL_TOOLBOXES;
    }
    try {
      const parsed: ToolboxItem[] = JSON.parse(raw);
      return deduplicateByKey(parsed, (t) => t.noToolbox || t.id);
    } catch {
      return INITIAL_TOOLBOXES;
    }
  }

  static saveToolboxes(items: ToolboxItem[]): void {
    const deduped = deduplicateByKey(items, (t) => t.noToolbox || t.id);
    localStorage.setItem(STORAGE_KEYS.TOOLBOXES, JSON.stringify(deduped));
  }

  static getPeminjaman(): PeminjamanItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PEMINJAMAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PEMINJAMAN, JSON.stringify(INITIAL_PEMINJAMAN));
      return INITIAL_PEMINJAMAN;
    }
    try {
      const parsed: PeminjamanItem[] = JSON.parse(raw);
      return deduplicateByKey(parsed, (p) => p.id || `${p.idPeminjaman || p.noPeminjaman || ''}_${p.kodeAlat || ''}`);
    } catch {
      return INITIAL_PEMINJAMAN;
    }
  }

  static savePeminjaman(items: PeminjamanItem[]): void {
    const deduped = deduplicateByKey(items, (p) => p.id || `${p.idPeminjaman || p.noPeminjaman || ''}_${p.kodeAlat || ''}`);
    try {
      localStorage.setItem(STORAGE_KEYS.PEMINJAMAN, JSON.stringify(deduped));
    } catch (e) {
      console.warn('Storage error savePeminjaman:', e);
    }
  }

  static getPengadaan(): PengadaanItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PENGADAAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PENGADAAN, JSON.stringify(INITIAL_PENGADAAN));
      return INITIAL_PENGADAAN;
    }
    try {
      const parsed: PengadaanItem[] = JSON.parse(raw);
      // Multi-item support: key by individual item id or composite key, never collapse identical noPengadaan
      return deduplicateByKey(parsed, (p) => p.id || `${p.noPengadaan || p.noPoPr || ''}_${p.partNumber || ''}_${p.namaAlat || ''}`);
    } catch {
      return INITIAL_PENGADAAN;
    }
  }

  static savePengadaan(items: PengadaanItem[]): void {
    const deduped = deduplicateByKey(items, (p) => p.id || `${p.noPengadaan || p.noPoPr || ''}_${p.partNumber || ''}_${p.namaAlat || ''}`);
    try {
      localStorage.setItem(STORAGE_KEYS.PENGADAAN, JSON.stringify(deduped));
    } catch (e) {
      console.warn('Storage error savePengadaan:', e);
    }
  }

  static getKerusakan(): BaKerusakanItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.KERUSAKAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.KERUSAKAN, JSON.stringify(INITIAL_BA_KERUSAKAN));
      return INITIAL_BA_KERUSAKAN;
    }
    try {
      const parsed: BaKerusakanItem[] = JSON.parse(raw);
      // Multi-item damage support: key by individual item id or composite key
      return deduplicateByKey(parsed, (k) => k.id || `${k.noBa || ''}_${k.noRegister || ''}_${k.namaAsset || ''}`);
    } catch {
      return INITIAL_BA_KERUSAKAN;
    }
  }

  static saveKerusakan(items: BaKerusakanItem[]): void {
    const deduped = deduplicateByKey(items, (k) => k.id || `${k.noBa || ''}_${k.noRegister || ''}_${k.namaAsset || ''}`);
    try {
      localStorage.setItem(STORAGE_KEYS.KERUSAKAN, JSON.stringify(deduped));
    } catch (e) {
      console.warn('Storage error saveKerusakan:', e);
    }
  }

  static getOsr(): OsrItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OSR);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.OSR, JSON.stringify(INITIAL_OSR));
      return INITIAL_OSR;
    }
    try {
      const parsed: OsrItem[] = JSON.parse(raw);
      return deduplicateByKey(parsed, (o) => o.id || `${o.noOsr || ''}_${o.noRegistrasi || ''}`);
    } catch {
      return INITIAL_OSR;
    }
  }

  static saveOsr(items: OsrItem[]): void {
    const deduped = deduplicateByKey(items, (o) => o.id || `${o.noOsr || ''}_${o.noRegistrasi || ''}`);
    try {
      localStorage.setItem(STORAGE_KEYS.OSR, JSON.stringify(deduped));
    } catch (e) {
      console.warn('Storage error saveOsr:', e);
    }
  }

  static getBast(): BaSerahTerimaItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BAST);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BAST, JSON.stringify(INITIAL_BA_SERAH_TERIMA));
      return INITIAL_BA_SERAH_TERIMA;
    }
    try {
      const parsed: BaSerahTerimaItem[] = JSON.parse(raw);
      // Multi-item BAST support: key by individual item id or composite key
      return deduplicateByKey(parsed, (b) => b.id || `${b.noBast || ''}_${b.noRegister || ''}_${b.namaAsset || ''}`);
    } catch {
      return INITIAL_BA_SERAH_TERIMA;
    }
  }

  static saveBast(items: BaSerahTerimaItem[]): void {
    const deduped = deduplicateByKey(items, (b) => b.id || `${b.noBast || ''}_${b.noRegister || ''}_${b.namaAsset || ''}`);
    try {
      localStorage.setItem(STORAGE_KEYS.BAST, JSON.stringify(deduped));
    } catch (e) {
      console.warn('Storage error saveBast:', e);
    }
  }

  // --- DELETE PERMISSION RULE (ONLY HO - Balikpapan) ---
  static deleteItem(module: string, id: string, currentUser: User): { success: boolean; message: string; deletedItemKey?: string } {
    if (currentUser.role !== 'ho' && currentUser.jobsite !== 'HO - Balikpapan') {
      return {
        success: false,
        message: 'Akses Ditolak: Hanya user "HO - Balikpapan" yang memiliki hak otorisasi untuk menghapus data aplikasi & spreadsheet!'
      };
    }

    let deletedKey = '';
    switch (module) {
      case 'populasi-asset': {
        const list = this.getAssets();
        const target = list.find(x => x.id === id);
        if (target) deletedKey = target.noRegistrasi;
        this.saveAssets(list.filter(x => x.id !== id));
        break;
      }
      case 'populasi-toolbox': {
        const list = this.getToolboxes();
        const target = list.find(x => x.id === id);
        if (target) deletedKey = target.noToolbox;
        this.saveToolboxes(list.filter(x => x.id !== id));
        break;
      }
      case 'peminjaman-tools': {
        const list = this.getPeminjaman();
        const target = list.find(x => x.id === id);
        if (target) deletedKey = target.idPeminjaman || target.noPeminjaman || '';
        this.savePeminjaman(list.filter(x => x.id !== id));
        break;
      }
      case 'pengadaan-barang': {
        const list = this.getPengadaan();
        const target = list.find(x => x.id === id);
        if (target) deletedKey = target.noPengadaan || target.noPoPr || '';
        this.savePengadaan(list.filter(x => x.id !== id));
        break;
      }
      case 'ba-kerusakan': {
        const list = this.getKerusakan();
        const target = list.find(x => x.id === id);
        if (target) deletedKey = target.noBa;
        this.saveKerusakan(list.filter(x => x.id !== id));
        break;
      }
      case 'osr-tools': {
        const list = this.getOsr();
        const target = list.find(x => x.id === id);
        if (target) deletedKey = target.noOsr;
        this.saveOsr(list.filter(x => x.id !== id));
        break;
      }
      case 'ba-serah-terima': {
        const list = this.getBast();
        const target = list.find(x => x.id === id);
        if (target) deletedKey = target.noBast;
        this.saveBast(list.filter(x => x.id !== id));
        break;
      }
      default:
        return { success: false, message: 'Modul tidak valid' };
    }

    if (deletedKey) {
      this.recordDeletedKey(module, deletedKey);
      this.removePendingItem(module, deletedKey);
    }

    this.addSyncLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'DELETE',
      module,
      jobsite: currentUser.jobsite,
      status: 'SUCCESS',
      detail: `Item dengan ID/Kunci '${deletedKey || id}' berhasil dihapus oleh HO - Balikpapan`
    });

    return {
      success: true,
      message: 'Data berhasil dihapus dari sistem.',
      deletedItemKey: deletedKey
    };
  }

  // --- SYNC CONFIG & LOGS ---
  static getSyncConfig(): SyncConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_CONFIG);
    if (!raw) {
      const def: SyncConfig = {
        webAppUrl: GOOGLE_APPS_SCRIPT_WEB_APP_URL,
        autoSync: true,
        syncIntervalMinutes: 5,
        lastSyncStatus: 'idle'
      };
      localStorage.setItem(STORAGE_KEYS.SYNC_CONFIG, JSON.stringify(def));
      return def;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.webAppUrl || !parsed.webAppUrl.trim().startsWith('http')) {
        parsed.webAppUrl = GOOGLE_APPS_SCRIPT_WEB_APP_URL;
        localStorage.setItem(STORAGE_KEYS.SYNC_CONFIG, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return { webAppUrl: GOOGLE_APPS_SCRIPT_WEB_APP_URL, autoSync: true, syncIntervalMinutes: 5 };
    }
  }

  static saveSyncConfig(cfg: SyncConfig): void {
    localStorage.setItem(STORAGE_KEYS.SYNC_CONFIG, JSON.stringify(cfg));
  }

  /**
   * Mengonversi raw rows dari Google Apps Script menjadi data modul aplikasi
   * dengan pemetaan kolom jobsite yang presisi (STEP 3).
   * Menghapus data lokal jika data di spreadsheet dihapus, dan mempertahankan item yang baru diinput.
   */
  static parseAndStoreSpreadsheetData(sheetData: any): {
    assetCount: number;
    toolboxCount: number;
    peminjamanCount: number;
    pengadaanCount: number;
    kerusakanCount: number;
    osrCount: number;
    bastCount: number;
    hasChanged: boolean;
  } {
    const counts = {
      assetCount: 0,
      toolboxCount: 0,
      peminjamanCount: 0,
      pengadaanCount: 0,
      kerusakanCount: 0,
      osrCount: 0,
      bastCount: 0,
      hasChanged: false
    };

    if (!sheetData || typeof sheetData !== 'object') return counts;

    let changed = false;
    const pending = this.getPendingItems();

    // 1. Populasi Asset (Kolom H adalah Jobsite: index 7)
    if (Array.isArray(sheetData.assets)) {
      const parsedAssets: AssetItem[] = sheetData.assets.map((r: any, idx: number) => {
        if (Array.isArray(r)) {
          return {
            id: `ast-live-${idx}-${String(r[0] || '').replace(/[^a-zA-Z0-9]/g, '-')}`,
            noRegistrasi: String(r[0] || '').trim(),
            namaAsset: String(r[1] || '').trim(),
            kategori: String(r[2] || 'Common Tools').trim(),
            merkBrand: String(r[3] || '-').trim(),
            noPo: String(r[4] || '').trim(),
            tglSupply: formatCellDate(r[5]),
            lokasiPenempatan: String(r[6] || 'Tool Room').trim(),
            jobsite: String(r[7] || '').trim(), // Kolom H
            kondisiAwal: String(r[8] || 'Baik (Ready for Operation)').trim(),
            spesifikasiKeterangan: String(r[9] || '').trim(),
            tanggalPenginputan: formatCellDate(r[10])
          };
        }
        return r;
      }).filter((a: AssetItem) => (a.noRegistrasi || a.namaAsset) && !this.isDeletedKey('assets', a.noRegistrasi));

      // Strictly deduplicate spreadsheet rows by noRegistrasi
      const uniqueAssets = deduplicateByKey(parsedAssets, (a) => a.noRegistrasi);

      // Merge pending local assets not yet reflected in spreadsheet
      const existingKeys = new Set(uniqueAssets.map((a) => a.noRegistrasi.trim().toLowerCase()).filter(Boolean));
      const pendingAssets = pending.filter((p) => p.module === 'assets');
      const finalAssets = [...uniqueAssets];
      for (const p of pendingAssets) {
        const pk = (p.key || '').trim().toLowerCase();
        if (pk && !existingKeys.has(pk)) {
          existingKeys.add(pk);
          finalAssets.unshift(p.data);
        } else {
          this.removePendingItem('assets', p.key);
        }
      }

      const oldAssets = this.getAssets();
      if (
        oldAssets.length !== finalAssets.length ||
        oldAssets[0]?.noRegistrasi !== finalAssets[0]?.noRegistrasi ||
        JSON.stringify(oldAssets) !== JSON.stringify(finalAssets)
      ) {
        this.saveAssets(finalAssets);
        changed = true;
      }
      counts.assetCount = finalAssets.length;
    }

    // 2. Populasi Toolbox (Kolom H adalah Jobsite: index 7)
    if (Array.isArray(sheetData.toolboxes)) {
      const parsedToolboxes: ToolboxItem[] = sheetData.toolboxes.map((r: any, idx: number) => {
        if (Array.isArray(r)) {
          return {
            id: `tbx-live-${idx}-${String(r[0] || '').replace(/[^a-zA-Z0-9]/g, '-')}`,
            noToolbox: String(r[0] || '').trim(),
            namaToolbox: String(r[1] || '').trim(),
            jenisToolbox: String(r[2] || '').trim(),
            merkBrand: String(r[3] || '').trim(),
            jumlahItem: String(r[4] || '').trim(),
            tglSupply: formatCellDate(r[5]),
            lokasiPenempatan: String(r[6] || '').trim(),
            jobsite: String(r[7] || '').trim(), // Kolom H
            kondisi: String(r[8] || 'Lengkap & Baik').trim(),
            pic: String(r[9] || '').trim(),
            keterangan: String(r[10] || '').trim()
          };
        }
        return r;
      }).filter((t: ToolboxItem) => (t.noToolbox || t.namaToolbox) && !this.isDeletedKey('toolboxes', t.noToolbox));

      // Strictly deduplicate spreadsheet rows by noToolbox
      const uniqueToolboxes = deduplicateByKey(parsedToolboxes, (t) => t.noToolbox);

      // Merge pending local toolboxes
      const existingTbxKeys = new Set(uniqueToolboxes.map((t) => t.noToolbox.trim().toLowerCase()).filter(Boolean));
      const pendingTbx = pending.filter((p) => p.module === 'toolboxes');
      const finalToolboxes = [...uniqueToolboxes];
      for (const p of pendingTbx) {
        const pk = (p.key || '').trim().toLowerCase();
        if (pk && !existingTbxKeys.has(pk)) {
          existingTbxKeys.add(pk);
          finalToolboxes.unshift(p.data);
        } else {
          this.removePendingItem('toolboxes', p.key);
        }
      }

      const oldToolboxes = this.getToolboxes();
      if (
        oldToolboxes.length !== finalToolboxes.length ||
        oldToolboxes[0]?.noToolbox !== finalToolboxes[0]?.noToolbox ||
        JSON.stringify(oldToolboxes) !== JSON.stringify(finalToolboxes)
      ) {
        this.saveToolboxes(finalToolboxes);
        changed = true;
      }
      counts.toolboxCount = finalToolboxes.length;
    }

    // 3. Peminjaman Tools (Kolom E adalah Jobsite: index 4)
    // ID Peminjaman (A) | Kode Alat (B) | Nama Asset (C) | Kategori (D) | Jobsite (E) | Peminjam (F) | Section/Departemen (G) | Tgl Pinjam (H) | Estimasi Kembali (I) | Tgl Realisasi Kembali (J) | Status (K) | Kondisi Awal (L) | Kondisi Akhir (M) | Keperluan (N)
    if (Array.isArray(sheetData.peminjaman)) {
      const parsedPeminjaman: PeminjamanItem[] = sheetData.peminjaman.map((r: any, idx: number) => {
        if (Array.isArray(r)) {
          const idVal = String(r[0] || '').trim();
          const kodeAlat = String(r[1] || '').trim();
          const namaAsset = String(r[2] || '').trim();
          const kategori = String(r[3] || 'Common Tools').trim();
          const jobsite = String(r[4] || '').trim(); // Kolom E
          const peminjam = String(r[5] || '').trim();
          const section = String(r[6] || '').trim();
          const tglPinjam = formatCellDate(r[7]);
          const estimasiKembali = formatCellDate(r[8]);
          const tglRealisasiKembali = formatCellDate(r[9]);
          const status = String(r[10] || 'Dipinjam').trim();
          const kondisiAwal = String(r[11] || 'Baik (Ready for Operation)').trim();
          const kondisiAkhir = String(r[12] || '').trim();
          const keperluan = String(r[13] || '').trim();

          return {
            id: `pjm-live-${idx}-${idVal.replace(/[^a-zA-Z0-9]/g, '-')}`,
            idPeminjaman: idVal,
            noPeminjaman: idVal,
            kodeAlat,
            namaAsset,
            namaTool: namaAsset ? `${namaAsset} (${kodeAlat})` : kodeAlat,
            kategori,
            jobsite,
            peminjam,
            section,
            tglPinjam,
            estimasiKembali,
            tglRencanaKembali: estimasiKembali,
            tglRealisasiKembali,
            status,
            kondisiAwal,
            kondisiAkhir,
            keperluan,
            keterangan: keperluan
          };
        }
        return r;
      }).filter((p: PeminjamanItem) => (p.idPeminjaman || p.noPeminjaman || p.kodeAlat) && !this.isDeletedKey('peminjaman', p.idPeminjaman || p.noPeminjaman || ''));

      // Multi-item loan support: deduplicate by composite loan ID and tool code
      const uniquePeminjaman = deduplicateByKey(parsedPeminjaman, (p) => `${p.idPeminjaman || p.noPeminjaman || ''}_${p.kodeAlat || ''}`);

      // Merge pending local loans
      const existingPjmKeys = new Set(uniquePeminjaman.map((p) => `${p.idPeminjaman || p.noPeminjaman || ''}_${p.kodeAlat || ''}`.trim().toLowerCase()).filter(Boolean));
      const pendingPjm = pending.filter((p) => p.module === 'peminjaman');
      const finalPeminjaman = [...uniquePeminjaman];
      for (const p of pendingPjm) {
        const item = p.data;
        const itemKey = `${item?.idPeminjaman || item?.noPeminjaman || ''}_${item?.kodeAlat || ''}`.trim().toLowerCase();
        if (itemKey && !existingPjmKeys.has(itemKey)) {
          existingPjmKeys.add(itemKey);
          finalPeminjaman.unshift(p.data);
        } else {
          this.removePendingItem('peminjaman', p.key);
        }
      }

      const oldPeminjaman = this.getPeminjaman();
      if (
        oldPeminjaman.length !== finalPeminjaman.length ||
        (oldPeminjaman[0]?.idPeminjaman || oldPeminjaman[0]?.noPeminjaman) !== (finalPeminjaman[0]?.idPeminjaman || finalPeminjaman[0]?.noPeminjaman) ||
        JSON.stringify(oldPeminjaman) !== JSON.stringify(finalPeminjaman)
      ) {
        this.savePeminjaman(finalPeminjaman);
        changed = true;
      }
      counts.peminjamanCount = finalPeminjaman.length;
    }

    // 4. Pengadaan Barang (Kolom B adalah Jobsite: index 1)
    // No Pengadaan (A) | Jobsite (B) | Kategori (C) | Type (D) | No CER (E) | Part Number (F) | Nama Alat (G) | Qty (H) | Tgl Pengadaan (I) | No UR (J) | No PR (K) | No PO (L) | Qty PR (M) | Qty PO (N) | Qty GR (O) | Vendor (P) | Total Price (Q) | Aging Days (R) | Tgl Supply (S) | Remarks (T) | Status (U)
    if (Array.isArray(sheetData.pengadaan)) {
      const parsedPengadaan: PengadaanItem[] = sheetData.pengadaan.map((r: any, idx: number) => {
        if (Array.isArray(r)) {
          const noPengadaan = String(r[0] || '').trim();
          const jobsite = String(r[1] || '').trim(); // Kolom B
          const kategori = String(r[2] || 'Common Tools').trim();
          const typeBarang = String(r[3] || '').trim();
          const noCer = String(r[4] || '').trim();
          const partNumber = String(r[5] || '').trim();
          const namaAlat = String(r[6] || '').trim();
          const qty = String(r[7] || '1').trim();
          const tglPengadaan = formatCellDate(r[8]);
          const noUr = String(r[9] || '').trim();
          const noPr = String(r[10] || '').trim();
          const noPo = String(r[11] || '').trim();
          const qtyPr = String(r[12] || '').trim();
          const qtyPo = String(r[13] || '').trim();
          const qtyGr = String(r[14] || '').trim();
          const vendor = String(r[15] || '').trim();
          const totalPrice = String(r[16] || '0').trim();
          const agingDays = String(r[17] || '0').trim();
          const tglSupply = formatCellDate(r[18]);
          const remarks = String(r[19] || '').trim();
          const status = String(r[20] || 'Draft').trim();
          const dokumentasi = String(r[21] || '').trim(); // Kolom V (index 21)

          return {
            id: `pgd-live-${idx}-${noPengadaan.replace(/[^a-zA-Z0-9]/g, '-')}`,
            noPengadaan,
            noPoPr: noPengadaan,
            jobsite,
            kategori,
            typeBarang,
            noCer,
            partNumber,
            namaAlat,
            deskripsiBarang: namaAlat,
            qty,
            tglPengadaan,
            tglPengajuan: tglPengadaan,
            noUr,
            noPr,
            noPo,
            qtyPr,
            qtyPo,
            qtyGr,
            vendor,
            supplier: vendor,
            totalPrice,
            estimasiBiaya: totalPrice,
            agingDays,
            tglSupply,
            remarks,
            keterangan: remarks,
            status,
            dokumentasi
          };
        }
        return r;
      }).filter((p: PengadaanItem) => (p.noPengadaan || p.noPoPr || p.namaAlat) && !this.isDeletedKey('pengadaan', p.noPengadaan || p.noPoPr || ''));

      // Preserve all rows from spreadsheet (multi-item support: do not discard items with same No Pengadaan)
      const uniquePengadaan = parsedPengadaan;

      // Merge pending local procurements
      const existingPgdKeys = new Set(uniquePengadaan.map((p) => `${p.noPengadaan || ''}_${p.partNumber || ''}_${p.namaAlat || ''}`.trim().toLowerCase()).filter(Boolean));
      const pendingPgd = pending.filter((p) => p.module === 'pengadaan');
      const finalPengadaan = [...uniquePengadaan];
      for (const p of pendingPgd) {
        const item = p.data;
        const itemKey = `${item?.noPengadaan || ''}_${item?.partNumber || ''}_${item?.namaAlat || ''}`.trim().toLowerCase();
        if (itemKey && !existingPgdKeys.has(itemKey)) {
          existingPgdKeys.add(itemKey);
          finalPengadaan.unshift(p.data);
        } else {
          this.removePendingItem('pengadaan', p.key);
        }
      }

      const oldPengadaan = this.getPengadaan();
      if (
        oldPengadaan.length !== finalPengadaan.length ||
        JSON.stringify(oldPengadaan) !== JSON.stringify(finalPengadaan)
      ) {
        this.savePengadaan(finalPengadaan);
        changed = true;
      }
      counts.pengadaanCount = finalPengadaan.length;
    }

    // 5. BA Kerusakan Alat (Kolom D adalah Jobsite: index 3)
    // No Berita Acara (A) | No OSR (B) | Jenis Tools (C) | Jobsite (D) | No Register (E) | Nama Asset (F) | Brand (G) | Tgl Supply (H) | Tgl Kerusakan (I) | Life Time (J) | Action (K) | Status (L) | Dokumentasi (M)
    if (Array.isArray(sheetData.kerusakan)) {
      const parsedKerusakan: BaKerusakanItem[] = sheetData.kerusakan.map((r: any, idx: number) => {
        if (Array.isArray(r)) {
          const noBa = String(r[0] || '').trim();
          const noOsr = String(r[1] || '').trim();
          const jenisTools = String(r[2] || '').trim();
          const jobsite = String(r[3] || '').trim(); // Kolom D
          const noRegister = String(r[4] || '').trim();
          const namaAsset = String(r[5] || '').trim();
          const brand = String(r[6] || '').trim();
          const tglSupply = formatCellDate(r[7]);
          const tglKerusakan = formatCellDate(r[8]);
          const lifeTime = String(r[9] || '').trim();
          const action = String(r[10] || '').trim();
          const status = String(r[11] || 'Investigasi').trim();
          const dokumentasi = String(r[12] || '').trim(); // Kolom M (index 12)

          return {
            id: `bak-live-${idx}-${noBa.replace(/[^a-zA-Z0-9]/g, '-')}`,
            noBa,
            noOsr,
            jenisTools,
            jobsite,
            noRegister,
            namaAsset,
            namaAlat: namaAsset,
            brand,
            tglSupply,
            tglKerusakan,
            tglKejadian: tglKerusakan,
            lifeTime,
            action,
            tindakanKorektif: action,
            status,
            fotoKerusakan: dokumentasi,
            dokumentasi,
            keterangan: action
          };
        }
        return r;
      }).filter((k: BaKerusakanItem) => (k.noBa || k.namaAsset) && !this.isDeletedKey('kerusakan', k.noBa));

      // Preserve all rows from spreadsheet (multi-item support: do not discard items with same No BA)
      const uniqueKerusakan = parsedKerusakan;

      // Merge pending local damage reports
      const existingBakKeys = new Set(uniqueKerusakan.map((k) => `${k.noBa}_${k.noRegister || ''}_${k.namaAsset || ''}`.trim().toLowerCase()).filter(Boolean));
      const pendingBak = pending.filter((p) => p.module === 'kerusakan');
      const finalKerusakan = [...uniqueKerusakan];
      for (const p of pendingBak) {
        const item = p.data;
        const itemKey = `${item?.noBa || ''}_${item?.noRegister || ''}_${item?.namaAsset || ''}`.trim().toLowerCase();
        if (itemKey && !existingBakKeys.has(itemKey)) {
          existingBakKeys.add(itemKey);
          finalKerusakan.unshift(p.data);
        } else {
          this.removePendingItem('kerusakan', p.key);
        }
      }

      const oldKerusakan = this.getKerusakan();
      if (
        oldKerusakan.length !== finalKerusakan.length ||
        JSON.stringify(oldKerusakan) !== JSON.stringify(finalKerusakan)
      ) {
        this.saveKerusakan(finalKerusakan);
        changed = true;
      }
      counts.kerusakanCount = finalKerusakan.length;
    }

    // 6. OSR Tools & Facility (Kolom B adalah Jobsite: index 1)
    // No OSR (A) | Jobsite (B) | Date OSR (C) | No Registrasi (D) | Nama Asset (E) | Keterangan Kerusakan (F) | PR (G) | PO (H) | Vendor (I) | Amount (J) | Condition (K) | Remarks (L) | Tgl Supply (M) | Status (N)
    if (Array.isArray(sheetData.osr)) {
      const parsedOsr: OsrItem[] = sheetData.osr.map((r: any, idx: number) => {
        if (Array.isArray(r)) {
          const noOsr = String(r[0] || '').trim();
          const jobsite = String(r[1] || '').trim(); // Kolom B
          const dateOsr = formatCellDate(r[2]);
          const noRegistrasi = String(r[3] || '').trim();
          const namaAsset = String(r[4] || '').trim();
          const keteranganKerusakan = String(r[5] || '').trim();
          const pr = String(r[6] || '').trim();
          const po = String(r[7] || '').trim();
          const vendor = String(r[8] || '').trim();
          const amount = String(r[9] || '0').trim();
          const condition = String(r[10] || '').trim();
          const remarks = String(r[11] || '').trim();
          const tglSupply = formatCellDate(r[12]);
          const status = String(r[13] || 'Sedang Dikerjakan').trim();
          const dokumentasi = String(r[14] || '').trim(); // Kolom O (index 14)

          return {
            id: `osr-live-${idx}-${noOsr.replace(/[^a-zA-Z0-9]/g, '-')}`,
            noOsr,
            jobsite,
            dateOsr,
            tglKirim: dateOsr,
            noRegistrasi,
            namaAsset,
            namaTool: namaAsset,
            keteranganKerusakan,
            pr,
            po,
            vendor,
            vendorRekanan: vendor,
            amount,
            biayaPerbaikan: amount,
            condition,
            remarks,
            keterangan: remarks,
            tglSupply,
            status,
            dokumentasi,
            fotoKerusakan: dokumentasi
          };
        }
        return r;
      }).filter((o: OsrItem) => (o.noOsr || o.namaAsset) && !this.isDeletedKey('osr', o.noOsr));

      // Strictly deduplicate spreadsheet rows by noOsr
      const uniqueOsr = deduplicateByKey(parsedOsr, (o) => o.noOsr);

      // Merge pending local OSR
      const existingOsrKeys = new Set(uniqueOsr.map((o) => o.noOsr.trim().toLowerCase()).filter(Boolean));
      const pendingOsr = pending.filter((p) => p.module === 'osr');
      const finalOsr = [...uniqueOsr];
      for (const p of pendingOsr) {
        const pk = (p.key || '').trim().toLowerCase();
        if (pk && !existingOsrKeys.has(pk)) {
          existingOsrKeys.add(pk);
          finalOsr.unshift(p.data);
        } else {
          this.removePendingItem('osr', p.key);
        }
      }

      const oldOsr = this.getOsr();
      if (
        oldOsr.length !== finalOsr.length ||
        oldOsr[0]?.noOsr !== finalOsr[0]?.noOsr ||
        JSON.stringify(oldOsr) !== JSON.stringify(finalOsr)
      ) {
        this.saveOsr(finalOsr);
        changed = true;
      }
      counts.osrCount = finalOsr.length;
    }

    // 7. BA Serah Terima (Kolom B adalah Jobsite: index 1)
    // No Bast (A) | Jobsite (B) | Date (C) | Nama Asset (D) | PO (E) | Remarks (F) | No Register (G) | Penerima (H) | Status (I) | Dokumentasi (J)
    if (Array.isArray(sheetData.bast)) {
      const parsedBast: BaSerahTerimaItem[] = sheetData.bast.map((r: any, idx: number) => {
        if (Array.isArray(r)) {
          const noBast = String(r[0] || '').trim();
          const jobsite = String(r[1] || '').trim(); // Kolom B
          const date = formatCellDate(r[2]);
          const namaAsset = String(r[3] || '').trim();
          const po = String(r[4] || '').trim();
          const remarks = String(r[5] || '').trim();
          const noRegister = String(r[6] || '').trim();
          const penerima = String(r[7] || '').trim();
          const status = String(r[8] || 'Draft').trim();
          const dokumentasi = String(r[9] || '').trim(); // Kolom J (index 9)

          return {
            id: `bst-live-${idx}-${noBast.replace(/[^a-zA-Z0-9]/g, '-')}`,
            noBast,
            jobsite,
            date,
            tglSerahTerima: date,
            namaAsset,
            po,
            remarks,
            keterangan: remarks,
            noRegister,
            penerima,
            pihakKedua: penerima,
            status,
            dokumentasi
          };
        }
        return r;
      }).filter((b: BaSerahTerimaItem) => (b.noBast || b.namaAsset) && !this.isDeletedKey('bast', b.noBast));

      // Multi-item BAST support: preserve all asset items with the same noBast
      const uniqueBast = parsedBast;

      // Merge pending local BAST
      const existingBastKeys = new Set(uniqueBast.map((b) => `${b.noBast}_${b.noRegister || ''}_${b.namaAsset || ''}`.trim().toLowerCase()).filter(Boolean));
      const pendingBast = pending.filter((p) => p.module === 'bast');
      const finalBast = [...uniqueBast];
      for (const p of pendingBast) {
        const item = p.data;
        const itemKey = `${item?.noBast || ''}_${item?.noRegister || ''}_${item?.namaAsset || ''}`.trim().toLowerCase();
        if (itemKey && !existingBastKeys.has(itemKey)) {
          existingBastKeys.add(itemKey);
          finalBast.unshift(p.data);
        } else {
          this.removePendingItem('bast', p.key);
        }
      }

      const oldBast = this.getBast();
      if (
        oldBast.length !== finalBast.length ||
        oldBast[0]?.noBast !== finalBast[0]?.noBast ||
        JSON.stringify(oldBast) !== JSON.stringify(finalBast)
      ) {
        this.saveBast(finalBast);
        changed = true;
      }
      counts.bastCount = finalBast.length;
    }

    counts.hasChanged = changed;
    return counts;
  }


  static getSyncLogs(): SyncLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static addSyncLog(log: SyncLog): void {
    const logs = this.getSyncLogs();
    logs.unshift(log);
    // keep maximum 50 logs
    localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(logs.slice(0, 50)));
  }

  // Bulk reset database
  static resetAllData(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(INITIAL_ASSETS));
    localStorage.setItem(STORAGE_KEYS.TOOLBOXES, JSON.stringify(INITIAL_TOOLBOXES));
    localStorage.setItem(STORAGE_KEYS.PEMINJAMAN, JSON.stringify(INITIAL_PEMINJAMAN));
    localStorage.setItem(STORAGE_KEYS.PENGADAAN, JSON.stringify(INITIAL_PENGADAAN));
    localStorage.setItem(STORAGE_KEYS.KERUSAKAN, JSON.stringify(INITIAL_BA_KERUSAKAN));
    localStorage.setItem(STORAGE_KEYS.OSR, JSON.stringify(INITIAL_OSR));
    localStorage.setItem(STORAGE_KEYS.BAST, JSON.stringify(INITIAL_BA_SERAH_TERIMA));
  }
}
