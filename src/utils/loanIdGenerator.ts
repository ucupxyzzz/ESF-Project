import { PeminjamanItem, PengadaanItem, BaKerusakanItem } from '../types';

/**
 * Ekstrak kode singkatan jobsite standar untuk nomor dokumen
 * Contoh: "GAM - Sangkulirang" -> "GAM", "SSE - Tabang" -> "SSE"
 */
export const getJobsiteShortCode = (jobsite: string): string => {
  if (!jobsite) return 'GAM';
  const clean = jobsite.trim();
  const first = clean.split(/[\s-]+/)[0];
  return (first || 'GAM').toUpperCase().replace(/[^A-Z0-9]/g, '');
};

/**
 * Menghasilkan ID Peminjaman berurutan otomatis dengan format:
 * LOAN-(JOBSITE)-(NOMOR URUT), contoh: "LOAN-GAM-0001"
 * Menyesuaikan dengan data yang ada: jika nomor terakhir "LOAN-GAM-0025", maka nomor selanjutnya "LOAN-GAM-0026"
 */
export const getNextLoanId = (jobsite: string, existingItems: PeminjamanItem[]): string => {
  const code = getJobsiteShortCode(jobsite);
  let maxSeq = 0;

  // Regex mencari format LOAN-<CODE>-<NOMOR>
  const exactRegex = new RegExp(`^LOAN-${code}-(\\d+)`, 'i');
  // Fallback regex jika ada format LOAN-<ANY>-<NOMOR>
  const genericRegex = /^LOAN-.*-(\d+)$/i;

  if (Array.isArray(existingItems)) {
    existingItems.forEach((item) => {
      const idCandidates = [
        item.idPeminjaman,
        item.noPeminjaman,
        item.id
      ];

      for (const raw of idCandidates) {
        if (!raw || typeof raw !== 'string') continue;
        const trimmed = raw.trim();

        const match = trimmed.match(exactRegex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        } else {
          // Cek jika item memiliki jobsite yang sama
          const itemJobsite = item.jobsite || '';
          if (itemJobsite && getJobsiteShortCode(itemJobsite) === code) {
            const genMatch = trimmed.match(genericRegex);
            if (genMatch && genMatch[1]) {
              const num = parseInt(genMatch[1], 10);
              if (!isNaN(num) && num > maxSeq) {
                maxSeq = num;
              }
            }
          }
        }
      }
    });
  }

  const nextSeq = maxSeq + 1;
  const seqPadded = String(nextSeq).padStart(4, '0');
  return `LOAN-${code}-${seqPadded}`;
};

/**
 * Mendapatkan ID Peminjaman berikutnya dengan offset index (untuk batch insert multiple items)
 */
export const getNextLoanIdWithOffset = (
  jobsite: string,
  existingItems: PeminjamanItem[],
  offset: number = 0
): string => {
  const code = getJobsiteShortCode(jobsite);
  let maxSeq = 0;
  const exactRegex = new RegExp(`^LOAN-${code}-(\\d+)`, 'i');
  const genericRegex = /^LOAN-.*-(\d+)$/i;

  if (Array.isArray(existingItems)) {
    existingItems.forEach((item) => {
      const idCandidates = [item.idPeminjaman, item.noPeminjaman, item.id];
      for (const raw of idCandidates) {
        if (!raw || typeof raw !== 'string') continue;
        const match = raw.trim().match(exactRegex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) maxSeq = num;
        } else {
          const itemJobsite = item.jobsite || '';
          if (itemJobsite && getJobsiteShortCode(itemJobsite) === code) {
            const genMatch = raw.trim().match(genericRegex);
            if (genMatch && genMatch[1]) {
              const num = parseInt(genMatch[1], 10);
              if (!isNaN(num) && num > maxSeq) maxSeq = num;
            }
          }
        }
      }
    });
  }

  const nextSeq = maxSeq + 1 + offset;
  const seqPadded = String(nextSeq).padStart(4, '0');
  return `LOAN-${code}-${seqPadded}`;
};

/**
 * Format No Pengadaan (Kolom A):
 * .../PLANT/(KODEJOBSITE)/TOOLSREQ/(mm....)/(yyyy......)
 * Contoh: "001/PLANT/GAM/TOOLSREQ/10/2026"
 */
export const getNextPengadaanId = (
  jobsite: string,
  existingItems: PengadaanItem[]
): string => {
  const code = getJobsiteShortCode(jobsite);
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = String(now.getFullYear());
  let maxSeq = 0;

  const regex = /(?:NO\s*:\s*)?(\d+)\/PLANT\//i;

  if (Array.isArray(existingItems)) {
    existingItems.forEach((item) => {
      const raw = item.noPengadaan || item.noPoPr || '';
      const match = raw.match(regex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });
  }

  const nextSeq = maxSeq + 1;
  const seqPadded = String(nextSeq).padStart(3, '0');
  return `${seqPadded}/PLANT/${code}/TOOLSREQ/${mm}/${yyyy}`;
};

/**
 * Format No Berita Acara Kerusakan (Kolom A):
 * .../BAK-TOOL/(KODEJOBSITE)/(mm....)/(yyyy........)
 * Contoh: "001/BAK-TOOL/GAM/10/2026"
 */
export const getNextBaKerusakanId = (
  jobsite: string,
  existingItems: BaKerusakanItem[]
): string => {
  const code = getJobsiteShortCode(jobsite);
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = String(now.getFullYear());
  let maxSeq = 0;

  const regex = /(?:NO\s*:\s*)?(\d+)\/BAK-TOOL\//i;

  if (Array.isArray(existingItems)) {
    existingItems.forEach((item) => {
      const raw = item.noBa || '';
      const match = raw.match(regex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });
  }

  const nextSeq = maxSeq + 1;
  const seqPadded = String(nextSeq).padStart(3, '0');
  return `${seqPadded}/BAK-TOOL/${code}/${mm}/${yyyy}`;
};

