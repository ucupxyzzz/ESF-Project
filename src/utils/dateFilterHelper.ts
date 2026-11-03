/**
 * Utility untuk parsing, normalisasi, dan perbandingan filter tanggal (Dari - Sampai)
 * Mendukung berbagai format tanggal yang tersimpan di Google Spreadsheet & aplikasi:
 * - ISO string: 2026-09-25 atau 2026-09-25T14:20:00.000Z
 * - Format DD-Mmm-YY / DD-Mmm-YYYY (contoh: 01-Agu-24, 15-Agu-24, 17-Okt-25, 14-Mar-25)
 * - Format DD/MM/YYYY atau DD-MM-YYYY (contoh: 25/09/2026, 25-09-2026)
 * - Format YYYY/MM/DD
 */

const INDO_MONTHS: Record<string, number> = {
  jan: 1, januari: 1, january: 1,
  feb: 2, februari: 2, february: 2,
  mar: 3, maret: 3, march: 3,
  apr: 4, april: 4,
  mei: 5, may: 5,
  jun: 6, juni: 6, june: 6,
  jul: 7, juli: 7, july: 7,
  agu: 8, ags: 8, agust: 8, agustus: 8, aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  okt: 10, oktober: 10, oct: 10, october: 10,
  nov: 11, nop: 11, november: 11,
  des: 12, desember: 12, dec: 12, december: 12
};

/**
 * Normalisasi nilai tanggal menjadi string ISO YYYY-MM-DD
 */
export function normalizeToIsoDate(val: any): string | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str || str === '-' || str === 'undefined' || str === 'null') return null;

  // 1. ISO string dengan waktu: 2026-09-25T...
  if (str.includes('T')) {
    const part = str.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return part;
  }

  // 2. YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
    const [y, m, d] = str.split('-').map(Number);
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // 3. YYYY/MM/DD
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(str)) {
    const [y, m, d] = str.split('/').map(Number);
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // 4. DD-Mmm-YY atau DD-Mmm-YYYY (contoh: 01-Agu-24, 15-Agu-24, 17-Okt-25)
  const mmmMatch = str.match(/^(\d{1,2})[-/\s]([A-Za-z]+)[-/\s](\d{2,4})$/);
  if (mmmMatch) {
    const d = Number(mmmMatch[1]);
    const mStr = mmmMatch[2].toLowerCase();
    let y = Number(mmmMatch[3]);
    if (y < 100) y += 2000;
    const m = INDO_MONTHS[mStr];
    if (m && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // 5. DD/MM/YYYY atau DD-MM-YYYY (contoh: 25/09/2026, 25-09-2026)
  const ddmmyyyyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const d = Number(ddmmyyyyMatch[1]);
    const m = Number(ddmmyyyyMatch[2]);
    const y = Number(ddmmyyyyMatch[3]);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // 6. Fallback Date.parse
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  } catch {
    // Ignore fallback failure
  }

  return null;
}

/**
 * Cek apakah sebuah tanggal ISO berada dalam rentang startDate dan endDate
 */
export function isDateInRange(
  isoDate: string | null,
  startDate?: string,
  endDate?: string
): boolean {
  if (!isoDate) return false;
  if (startDate && isoDate < startDate) return false;
  if (endDate && isoDate > endDate) return false;
  return true;
}

export interface ModuleDateFieldOption {
  key: string;
  label: string;
}

/**
 * Opsi pilihan kolom tanggal per modul
 */
export const MODULE_DATE_OPTIONS: Record<string, ModuleDateFieldOption[]> = {
  'populasi-asset': [
    { key: 'ALL_DATES', label: 'Semua Tanggal (Supply / Input)' },
    { key: 'tglSupply', label: 'Tgl Supply (Kolom F)' },
    { key: 'tanggalPenginputan', label: 'Tgl Penginputan (Kolom K)' }
  ],
  'populasi-toolbox': [
    { key: 'tglSupply', label: 'Tgl Supply (Kolom F)' }
  ],
  'peminjaman-tools': [
    { key: 'ALL_DATES', label: 'Semua Tanggal (Pinjam / Kembali)' },
    { key: 'tglPinjam', label: 'Tgl Pinjam (Kolom H)' },
    { key: 'tglRealisasiKembali', label: 'Tgl Realisasi Kembali (Kolom J)' },
    { key: 'estimasiKembali', label: 'Estimasi Tgl Kembali (Kolom I)' }
  ],
  'pengadaan-barang': [
    { key: 'ALL_DATES', label: 'Semua Tanggal (Pengadaan / Supply)' },
    { key: 'tglPengadaan', label: 'Tgl Pengadaan / PR (Kolom I)' },
    { key: 'tglSupply', label: 'Tgl Supply (Kolom S)' }
  ],
  'ba-kerusakan': [
    { key: 'ALL_DATES', label: 'Semua Tanggal (Kerusakan / Supply)' },
    { key: 'tglKerusakan', label: 'Tgl Kerusakan / Kejadian (Kolom I)' },
    { key: 'tglSupply', label: 'Tgl Supply (Kolom H)' }
  ],
  'osr-tools': [
    { key: 'ALL_DATES', label: 'Semua Tanggal (OSR / Supply)' },
    { key: 'dateOsr', label: 'Tgl OSR / Kirim (Kolom C)' },
    { key: 'tglSupply', label: 'Tgl Supply (Kolom M)' }
  ],
  'ba-serah-terima': [
    { key: 'ALL_DATES', label: 'Semua Tanggal (BAST / Sign)' },
    { key: 'date', label: 'Tgl Serah Terima (Kolom C)' },
    { key: 'hoSignDate', label: 'Tgl Tandatangan HO' }
  ]
};

/**
 * Ekstrak tanggal-tanggal dari baris data berdasarkan modul dan opsi kolom yang dipilih
 */
export function extractRowDates(
  module: string,
  row: any,
  selectedTarget: string = 'ALL_DATES'
): string[] {
  if (!row) return [];

  const rawValues: any[] = [];

  switch (module) {
    case 'populasi-asset':
      if (selectedTarget === 'tglSupply') {
        rawValues.push(row.tglSupply);
      } else if (selectedTarget === 'tanggalPenginputan') {
        rawValues.push(row.tanggalPenginputan);
      } else {
        rawValues.push(row.tglSupply, row.tanggalPenginputan, row.updatedAt);
      }
      break;

    case 'populasi-toolbox':
      rawValues.push(row.tglSupply, row.updatedAt);
      break;

    case 'peminjaman-tools':
      if (selectedTarget === 'tglPinjam') {
        rawValues.push(row.tglPinjam);
      } else if (selectedTarget === 'tglRealisasiKembali') {
        rawValues.push(row.tglRealisasiKembali);
      } else if (selectedTarget === 'estimasiKembali') {
        rawValues.push(row.estimasiKembali, row.tglRencanaKembali);
      } else {
        rawValues.push(
          row.tglPinjam,
          row.tglRealisasiKembali,
          row.estimasiKembali,
          row.tglRencanaKembali,
          row.updatedAt
        );
      }
      break;

    case 'pengadaan-barang':
      if (selectedTarget === 'tglPengadaan') {
        rawValues.push(row.tglPengadaan, row.tglPengajuan);
      } else if (selectedTarget === 'tglSupply') {
        rawValues.push(row.tglSupply);
      } else {
        rawValues.push(row.tglPengadaan, row.tglPengajuan, row.tglSupply, row.updatedAt);
      }
      break;

    case 'ba-kerusakan':
      if (selectedTarget === 'tglKerusakan') {
        rawValues.push(row.tglKerusakan, row.tglKejadian);
      } else if (selectedTarget === 'tglSupply') {
        rawValues.push(row.tglSupply);
      } else {
        rawValues.push(row.tglKerusakan, row.tglKejadian, row.tglSupply, row.updatedAt);
      }
      break;

    case 'osr-tools':
      if (selectedTarget === 'dateOsr') {
        rawValues.push(row.dateOsr, row.tglKirim);
      } else if (selectedTarget === 'tglSupply') {
        rawValues.push(row.tglSupply);
      } else {
        rawValues.push(row.dateOsr, row.tglKirim, row.tglSupply, row.updatedAt);
      }
      break;

    case 'ba-serah-terima':
      if (selectedTarget === 'date') {
        rawValues.push(row.date, row.tglSerahTerima);
      } else if (selectedTarget === 'hoSignDate') {
        rawValues.push(row.hoSignDate);
      } else {
        rawValues.push(row.date, row.tglSerahTerima, row.hoSignDate, row.updatedAt);
      }
      break;

    default:
      // Fallback: cek properti umum bertema tanggal
      rawValues.push(
        row.tglSupply,
        row.tanggalPenginputan,
        row.tglPinjam,
        row.tglPengadaan,
        row.tglKerusakan,
        row.dateOsr,
        row.date,
        row.tglSerahTerima,
        row.updatedAt
      );
      break;
  }

  // Normalisasi dan ambil hanya tanggal ISO valid
  const isoDates: string[] = [];
  for (const raw of rawValues) {
    if (!raw) continue;
    const iso = normalizeToIsoDate(raw);
    if (iso && !isoDates.includes(iso)) {
      isoDates.push(iso);
    }
  }

  return isoDates;
}

/**
 * Filter baris data berdasarkan rentang tanggal
 */
export function rowMatchesDateRange(
  module: string,
  row: any,
  startDate?: string,
  endDate?: string,
  targetField: string = 'ALL_DATES'
): boolean {
  if (!startDate && !endDate) return true;

  const rowDates = extractRowDates(module, row, targetField);
  if (rowDates.length === 0) return false;

  // Jika minimal ada 1 tanggal yang masuk ke dalam rentang, maka baris ini cocok
  return rowDates.some((d) => isDateInRange(d, startDate, endDate));
}

/**
 * Helper preset tanggal cepat (Hari Ini, 7 Hari, 30 Hari, Bulan Ini, Tahun Ini)
 */
export function getDatePresets() {
  const now = new Date();
  const format = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = format(now);

  // 7 hari terakhir
  const d7 = new Date();
  d7.setDate(d7.getDate() - 7);
  const d7Str = format(d7);

  // 30 hari terakhir
  const d30 = new Date();
  d30.setDate(d30.getDate() - 30);
  const d30Str = format(d30);

  // Bulan Ini
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Tahun Ini
  const startYear = new Date(now.getFullYear(), 0, 1);
  const endYear = new Date(now.getFullYear(), 11, 31);

  return {
    today: { start: todayStr, end: todayStr, label: 'Hari Ini' },
    last7Days: { start: d7Str, end: todayStr, label: '7 Hari Terakhir' },
    last30Days: { start: d30Str, end: todayStr, label: '30 Hari Terakhir' },
    thisMonth: { start: format(startMonth), end: format(endMonth), label: 'Bulan Ini' },
    thisYear: { start: format(startYear), end: format(endYear), label: 'Tahun Ini' }
  };
}
