import { AssetItem } from '../types';

// Utility to parse CSV text into AssetItem array
export function parseAssetCsv(csvText: string): AssetItem[] {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];
  
  const items: AssetItem[] = [];
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line handling quotes
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        if (inQuotes && line[c + 1] === '"') {
          current += '"';
          c++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim());
    
    // Format: No Registrasi (0), Nama Asset (1), Kategori (2), Merk/Brand (3), No PO (4), Tgl Supply (5), Lokasi/Penempatan (6), Jobsite (7), Kondisi Awal (8), Spesifikasi & Keterangan (9), Tanggal Penginputan (10)
    if (cols.length >= 8 && cols[0]) {
      items.push({
        id: `ast-${i}-${cols[0].toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        noRegistrasi: cols[0] || '',
        namaAsset: cols[1] || '',
        kategori: cols[2] || 'Common Tools',
        merkBrand: cols[3] || '-',
        noPo: cols[4] || '',
        tglSupply: cols[5] || '',
        lokasiPenempatan: cols[6] || 'Tool Room',
        jobsite: cols[7] || 'SSE - Tabang',
        kondisiAwal: cols[8] || 'Baik (Ready for Operation)',
        spesifikasiKeterangan: cols[9] || '',
        tanggalPenginputan: cols[10] || new Date().toISOString().split('T')[0]
      });
    }
  }
  return items;
}
