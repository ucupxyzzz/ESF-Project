/**
 * Utility untuk normalisasi dan pencocokan nama jobsite agar toleran terhadap
 * spasi, tanda strip, atau perbedaan huruf besar/kecil.
 */
export function normalizeJobsiteName(val: string | undefined | null): string {
  if (!val) return '';
  return String(val)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*/g, ' - ')
    .toUpperCase();
}

/**
 * Memeriksa apakah jobsite data cocok dengan jobsite pengguna.
 * Khusus untuk HO - Balikpapan, akan selalu return true jika filter adalah 'ALL'.
 */
export function isJobsiteMatch(
  rowJobsite: string | undefined | null,
  targetJobsite: string,
  userRole?: string
): boolean {
  if (!targetJobsite || targetJobsite === 'ALL') {
    return true;
  }

  const normRow = normalizeJobsiteName(rowJobsite);
  const normTarget = normalizeJobsiteName(targetJobsite);

  if (normRow === normTarget) return true;

  // Cek jika terdapat singkatan kode site yang sama (misal 'SSE' dalam 'SSE - Tabang')
  const rowCode = normRow.split(' - ')[0]?.trim();
  const targetCode = normTarget.split(' - ')[0]?.trim();
  if (rowCode && targetCode && rowCode === targetCode) {
    return true;
  }

  return normRow.includes(normTarget) || normTarget.includes(normRow);
}
