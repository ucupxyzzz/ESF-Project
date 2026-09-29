/**
 * =========================================================================
 * KONFIGURASI APLIKASI ESF MONITORING
 * =========================================================================
 * File ini adalah lokasi utama tempat Anda dapat mengubah URL Web App
 * Google Apps Script secara manual di dalam kode aplikasi.
 *
 * File Path: /src/config/appConfig.ts
 * =========================================================================
 */

export const GOOGLE_APPS_SCRIPT_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbz8ccYdPD0W4IPAK45Pz1SiikRhL6PwsrRRPlciyPSXZE0tdJfTha2pgpDvprU8Q70w/exec';

/**
 * Aturan Pemetaan Kolom Jobsite (STEP 3):
 * 1. Populasi Asset     -> Kolom H (Index array: 7)
 * 2. Populasi Toolbox   -> Kolom H (Index array: 7)
 * 3. Peminjaman Tools   -> Kolom E (Index array: 4)
 * 4. Pengadaan Barang   -> Kolom B (Index array: 1)
 * 5. BA Kerusakan Alat  -> Kolom D (Index array: 3)
 * 6. OSR Tools & Fac    -> Kolom B (Index array: 1)
 * 7. BA Serah Terima    -> Kolom B (Index array: 1)
 */
export const JOBSITE_COLUMN_MAPPING = {
  ASSET: { name: 'Populasi Asset', columnLetter: 'H', arrayIndex: 7 },
  TOOLBOX: { name: 'Populasi Toolbox', columnLetter: 'H', arrayIndex: 7 },
  PEMINJAMAN: { name: 'Peminjaman Tools', columnLetter: 'E', arrayIndex: 4 },
  PENGADAAN: { name: 'Pengadaan Barang', columnLetter: 'B', arrayIndex: 1 },
  KERUSAKAN: { name: 'BA Kerusakan Alat', columnLetter: 'D', arrayIndex: 3 },
  OSR: { name: 'OSR Tools & Facility', columnLetter: 'B', arrayIndex: 1 },
  BAST: { name: 'BA Serah Terima', columnLetter: 'B', arrayIndex: 1 }
};
