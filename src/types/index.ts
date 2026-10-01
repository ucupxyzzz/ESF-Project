export type UserRole = 'user' | 'ho' | 'developer';

export interface User {
  username: string;
  password?: string;
  jobsite: string;
  role: UserRole;
  name: string;
  lastLogin?: string;
}

export type SheetModule =
  | 'dashboard'
  | 'populasi-asset'
  | 'populasi-toolbox'
  | 'peminjaman-tools'
  | 'pengadaan-barang'
  | 'ba-kerusakan'
  | 'osr-tools'
  | 'ba-serah-terima'
  | 'developer-panel'
  | 'apps-script-sync';

// 1. Populasi Asset (Kolom H: Jobsite)
export interface AssetItem {
  id: string;
  noRegistrasi: string; // Kolom A
  namaAsset: string; // Kolom B
  kategori: string; // Kolom C
  merkBrand: string; // Kolom D
  noPo: string; // Kolom E
  tglSupply: string; // Kolom F
  lokasiPenempatan: string; // Kolom G
  jobsite: string; // Kolom H (Filter Key)
  kondisiAwal: string; // Kolom I
  spesifikasiKeterangan: string; // Kolom J
  tanggalPenginputan: string; // Kolom K
  updatedAt?: string;
}

// 2. Populasi Toolbox (Kolom H: Jobsite)
export interface ToolboxItem {
  id: string;
  noToolbox: string; // Kolom A
  namaToolbox: string; // Kolom B
  jenisToolbox: string; // Kolom C
  merkBrand: string; // Kolom D
  jumlahItem: string; // Kolom E
  tglSupply: string; // Kolom F
  lokasiPenempatan: string; // Kolom G
  jobsite: string; // Kolom H (Filter Key)
  kondisi: string; // Kolom I
  pic: string; // Kolom J
  keterangan: string; // Kolom K
  updatedAt?: string;
}

// 3. Peminjaman Tools (Kolom E: Jobsite)
// Spreadsheet: ID Peminjaman (A) | Kode Alat (B) | Nama Asset (C) | Kategori (D) | Jobsite (E) | Peminjam (F) | Section/Departemen (G) | Tgl Pinjam (H) | Estimasi Kembali (I) | Tgl Realisasi Kembali (J) | Status (K) | Kondisi Awal (L) | Kondisi Akhir (M) | Keperluan (N)
export interface PeminjamanItem {
  id: string;
  idPeminjaman?: string; // Kolom A
  kodeAlat?: string; // Kolom B
  namaAsset?: string; // Kolom C
  kategori?: string; // Kolom D
  jobsite: string; // Kolom E (Filter Key)
  peminjam: string; // Kolom F
  section?: string; // Kolom G (Section/Departemen)
  tglPinjam: string; // Kolom H
  estimasiKembali?: string; // Kolom I
  tglRealisasiKembali?: string; // Kolom J
  status: string; // Kolom K ('Dipinjam' | 'Kembali' | 'Terlambat')
  kondisiAwal?: string; // Kolom L
  kondisiAkhir?: string; // Kolom M
  keperluan?: string; // Kolom N
  // Compatibility aliases
  noPeminjaman?: string;
  namaTool?: string;
  tglRencanaKembali?: string;
  keterangan?: string;
  updatedAt?: string;
}

// 4. Pengadaan Barang (Kolom B: Jobsite)
// Spreadsheet: No Pengadaan (A) | Jobsite (B) | Kategori (C) | Type (D) | No CER (E) | Part Number (F) | Nama Alat (G) | Qty (H) | Tgl Pengadaan (I) | No UR (J) | No PR (K) | No PO (L) | Qty PR (M) | Qty PO (N) | Qty GR (O) | Vendor (P) | Total Price (Q) | Aging Days (R) | Tgl Supply (S) | Remarks (T) | Status (U)
export interface PengadaanItem {
  id: string;
  noPengadaan?: string; // Kolom A
  jobsite: string; // Kolom B (Filter Key)
  kategori?: string; // Kolom C
  typeBarang?: string; // Kolom D
  noCer?: string; // Kolom E
  partNumber?: string; // Kolom F
  namaAlat?: string; // Kolom G
  qty?: string; // Kolom H
  tglPengadaan?: string; // Kolom I
  noUr?: string; // Kolom J
  noPr?: string; // Kolom K
  noPo?: string; // Kolom L
  qtyPr?: string; // Kolom M
  qtyPo?: string; // Kolom N
  qtyGr?: string; // Kolom O
  vendor?: string; // Kolom P
  totalPrice?: string; // Kolom Q
  agingDays?: string; // Kolom R
  tglSupply?: string; // Kolom S
  remarks?: string; // Kolom T
  status: string; // Kolom U
  dokumentasi?: string; // Kolom V (Google Drive link / dokumentasi)
  // Compatibility aliases
  noPoPr?: string;
  deskripsiBarang?: string;
  tglPengajuan?: string;
  estimasiBiaya?: string;
  supplier?: string;
  keterangan?: string;
  updatedAt?: string;
}

// 5. BA Kerusakan Alat (Kolom D: Jobsite)
// Spreadsheet: No Berita Acara (A) | No OSR (B) | Jenis Tools (C) | Jobsite (D) | No Register (E) | Nama Asset (F) | Brand (G) | Tgl Supply (H) | Tgl Kerusakan (I) | Life Time (J) | Action (K) | Status (L) | Dokumentasi (M) | Kronologi (N)
export interface BaKerusakanItem {
  id: string;
  noBa: string; // Kolom A
  noOsr?: string; // Kolom B
  jenisTools?: string; // Kolom C
  jobsite: string; // Kolom D (Filter Key)
  noRegister?: string; // Kolom E
  namaAsset?: string; // Kolom F
  brand?: string; // Kolom G
  tglSupply?: string; // Kolom H
  tglKerusakan?: string; // Kolom I
  lifeTime?: string; // Kolom J
  action?: string; // Kolom K
  status: string; // Kolom L
  fotoKerusakan?: string; // Lampiran foto kerusakan (Base64 atau URL)
  dokumentasi?: string; // Kolom M (Google Drive link / foto alat rusak)
  kronologi?: string; // Kolom N (Kronologi & Penyebab Kerusakan)
  // Compatibility aliases
  tglKejadian?: string;
  namaAlat?: string;
  kronologiKerusakan?: string;
  estimasiBiaya?: string;
  tindakanKorektif?: string;
  pelapor?: string;
  keterangan?: string;
  updatedAt?: string;
}

// 6. OSR Tools & Facility (Kolom B: Jobsite)
// Spreadsheet: No OSR (A) | Jobsite (B) | Date OSR (C) | No Registrasi (D) | Nama Asset (E) | Keterangan Kerusakan (F) | PR (G) | PO (H) | Vendor (I) | Amount (J) | Condition (K) | Remarks (L) | Tgl Supply (M) | Status (N) | Dokumentasi (O)
export interface OsrItem {
  id: string;
  noOsr: string; // Kolom A
  jobsite: string; // Kolom B (Filter Key)
  dateOsr?: string; // Kolom C
  noRegistrasi?: string; // Kolom D
  namaAsset?: string; // Kolom E
  keteranganKerusakan?: string; // Kolom F
  pr?: string; // Kolom G
  po?: string; // Kolom H
  vendor?: string; // Kolom I
  amount?: string; // Kolom J
  condition?: string; // Kolom K
  remarks?: string; // Kolom L
  tglSupply?: string; // Kolom M
  status: string; // Kolom N
  dokumentasi?: string; // Kolom O (Google Drive link / foto kerusakan OSR)
  fotoKerusakan?: string;
  // Compatibility aliases
  namaTool?: string;
  vendorRekanan?: string;
  tglKirim?: string;
  estimasiSelesai?: string;
  biayaPerbaikan?: string;
  keterangan?: string;
  updatedAt?: string;
}

// 7. BA Serah Terima (Kolom B: Jobsite)
// Spreadsheet: No Bast (A) | Jobsite (B) | Date (C) | Nama Asset (D) | PO (E) | Remarks (F) | No Register (G) | Penerima (H) | Status (I) | Dokumentasi (J)
export interface BaSerahTerimaItem {
  id: string;
  noBast: string; // Kolom A
  jobsite: string; // Kolom B (Filter Key)
  date?: string; // Kolom C
  namaAsset?: string; // Kolom D
  po?: string; // Kolom E
  remarks?: string; // Kolom F
  noRegister?: string; // Kolom G
  penerima?: string; // Kolom H
  status: string; // Kolom I
  dokumentasi?: string; // Kolom J (Google Drive link / final upload BAST)
  hoSignature?: string; // Digital signature HO Balikpapan (Base64)
  hoSignDate?: string;
  hoSignedBy?: string;
  penerimaSignature?: string;
  // Compatibility aliases
  tglSerahTerima?: string;
  pihakPertama?: string;
  pihakKedua?: string;
  daftarBarang?: string;
  kondisiFisik?: string;
  lokasiBaru?: string;
  keterangan?: string;
  updatedAt?: string;
}

export const GDRIVE_CONFIG = {
  PENGADAAN_FOLDER_ID: '1noEzPT5sDCx9XtIImLm6iuWEhemV1Nh5',
  PENGADAAN_FOLDER_URL: 'https://drive.google.com/drive/folders/1noEzPT5sDCx9XtIImLm6iuWEhemV1Nh5?usp=sharing',
  KERUSAKAN_FOLDER_ID: '10CGksP6f116XPGWjh23-4UR1wlypI5TM',
  KERUSAKAN_FOLDER_URL: 'https://drive.google.com/drive/folders/10CGksP6f116XPGWjh23-4UR1wlypI5TM?usp=sharing',
  BAST_FOLDER_ID: '1NqjCKwHsH1_pVVfxPY95OI6nXcw71wT6',
  BAST_FOLDER_URL: 'https://drive.google.com/drive/folders/1NqjCKwHsH1_pVVfxPY95OI6nXcw71wT6?usp=sharing',
  OSR_FOLDER_ID: '117QSUo3_wux9S4_2GvX528Fi6HqLTtjV',
  OSR_FOLDER_URL: 'https://drive.google.com/drive/folders/117QSUo3_wux9S4_2GvX528Fi6HqLTtjV?usp=sharing'
};

export interface SyncConfig {
  webAppUrl: string;
  autoSync: boolean;
  syncIntervalMinutes: number;
  lastSyncTime?: string;
  lastSyncStatus?: 'idle' | 'success' | 'error' | 'syncing';
  lastSyncMessage?: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  action: 'PUSH' | 'PULL' | 'AUTO_SYNC' | 'DELETE' | 'MANUAL_INPUT';
  module: string;
  jobsite: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  detail: string;
}
