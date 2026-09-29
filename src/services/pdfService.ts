import { jsPDF } from 'jspdf';
import { BaSerahTerimaItem, BaKerusakanItem } from '../types';

export class PdfService {
  /**
   * Menghasilkan dokumen Berita Acara Serah Terima (BAST) dalam format PDF
   * Berisi data lengkap penyerahan alat dan DUA APPROVAL:
   * 1. ESF HO Balikpapan (dengan tanda tangan digital)
   * 2. Penerima dari Jobsite (sesuai Kolom H Penerima)
   */
  static generateBastPdf(item: BaSerahTerimaItem): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Header Kop Dokumen
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, 15, contentWidth, 24, 'F');

    doc.setTextColor(245, 158, 11); // amber-500
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PT. KARUNIA GROUP', margin + 6, 23);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('EQUIPMENT SUPPORT FACILITY (ESF) - MANAGEMENT SYSTEM', margin + 6, 29);

    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('Workshop & Facility Tool Control | Balikpapan Head Office', margin + 6, 34);

    // Garis Pemisah
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(1);
    doc.line(margin, 42, pageWidth - margin, 42);

    // Judul Dokumen
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('BERITA ACARA SERAH TERIMA (BAST)', pageWidth / 2, 52, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Nomor Dokumen: ${item.noBast || '-'}`, pageWidth / 2, 58, { align: 'center' });

    // Kotak Informasi Dokumen
    const startY = 66;
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(margin, startY, contentWidth, 68, 3, 3, 'FD');

    doc.setFontSize(10);
    const labelX = margin + 6;
    const valueX = margin + 55;
    let currentY = startY + 9;

    const addRow = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text(label, labelX, currentY);
      doc.text(':', labelX + 44, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(value || '-', valueX, currentY);
      currentY += 8;
    };

    addRow('Jobsite / Lokasi', item.jobsite || '-');
    addRow('Tanggal Serah Terima', item.date || item.tglSerahTerima || '-');
    addRow('No. Register Alat', item.noRegister || '-');
    addRow('Nama Peralatan / Asset', item.namaAsset || '-');
    addRow('Nomor PO', item.po || '-');
    addRow('Penerima di Jobsite', item.penerima || item.pihakKedua || '-');
    addRow('Status Dokumen', item.status || 'Draft');

    // Catatan / Remarks Box
    const remarksY = currentY + 4;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('Keterangan / Remarks:', margin, remarksY);

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, remarksY + 3, contentWidth, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const splitRemarks = doc.splitTextToSize(
      item.remarks || item.keterangan || 'Peralatan/fasilitas telah diperiksa dan diserahterimakan dalam keadaan baik, lengkap, dan siap dioperasikan di jobsite.',
      contentWidth - 8
    );
    doc.text(splitRemarks, margin + 4, remarksY + 9);

    // Pernyataan Serah Terima
    const statementY = remarksY + 28;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(
      'Demikian Berita Acara Serah Terima ini dibuat dan ditandatangani oleh kedua belah pihak dengan sebenar-benarnya.',
      margin,
      statementY
    );

    // BAGIAN DUA APPROVAL (SIGNATURE BOXES)
    const signBoxY = statementY + 8;
    const boxWidth = (contentWidth - 10) / 2;
    const boxHeight = 65;

    // 1. Box Approval Pihak Pertama (HO Balikpapan)
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, signBoxY, boxWidth, boxHeight, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('PIHAK PERTAMA (MENYERAHKAN)', margin + boxWidth / 2, signBoxY + 8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('ESF HO BALIKPAPAN', margin + boxWidth / 2, signBoxY + 13, { align: 'center' });

    // Tempat tanda tangan HO
    if (item.hoSignature && item.hoSignature.startsWith('data:image')) {
      try {
        doc.addImage(item.hoSignature, 'PNG', margin + boxWidth / 2 - 25, signBoxY + 16, 50, 26);
      } catch {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(245, 158, 11);
        doc.text('[ Approved & Signed Digital ]', margin + boxWidth / 2, signBoxY + 30, { align: 'center' });
      }
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      doc.text('(Belum ditandatangani digital)', margin + boxWidth / 2, signBoxY + 30, { align: 'center' });
    }

    doc.setDrawColor(148, 163, 184);
    doc.line(margin + 10, signBoxY + 47, margin + boxWidth - 10, signBoxY + 47);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(item.hoSignedBy || 'HO - Balikpapan', margin + boxWidth / 2, signBoxY + 52, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Tgl: ${item.hoSignDate || item.date || '-'}`, margin + boxWidth / 2, signBoxY + 58, { align: 'center' });

    // 2. Box Approval Pihak Kedua (Penerima Jobsite)
    const box2X = margin + boxWidth + 10;
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(box2X, signBoxY, boxWidth, boxHeight, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('PIHAK KEDUA (MENERIMA)', box2X + boxWidth / 2, signBoxY + 8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(`PENERIMA JOBSITE (${item.jobsite || 'SITE'})`, box2X + boxWidth / 2, signBoxY + 13, { align: 'center' });

    if (item.penerimaSignature && item.penerimaSignature.startsWith('data:image')) {
      try {
        doc.addImage(item.penerimaSignature, 'PNG', box2X + boxWidth / 2 - 25, signBoxY + 16, 50, 26);
      } catch {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(16, 185, 129);
        doc.text('[ Signed by Jobsite ]', box2X + boxWidth / 2, signBoxY + 30, { align: 'center' });
      }
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      doc.text('(Tanda Tangan Penerima)', box2X + boxWidth / 2, signBoxY + 30, { align: 'center' });
    }

    doc.setDrawColor(148, 163, 184);
    doc.line(box2X + 10, signBoxY + 47, box2X + boxWidth - 10, signBoxY + 47);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(item.penerima || item.pihakKedua || 'Nama Penerima', box2X + boxWidth / 2, signBoxY + 52, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Tgl: ${item.date || '-'}`, box2X + boxWidth / 2, signBoxY + 58, { align: 'center' });

    // Footer Dokumen
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dicetak otomatis oleh Sistem ESF Tools & Facility Management | ID: ${item.id || item.noBast}`,
      pageWidth / 2,
      285,
      { align: 'center' }
    );

    return doc;
  }

  /**
   * Download langsung file PDF ke browser pengguna
   */
  static downloadBastPdf(item: BaSerahTerimaItem): void {
    const doc = this.generateBastPdf(item);
    const safeName = (item.noBast || 'BAST-DOKUMEN').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`${safeName}.pdf`);
  }

  /**
   * Dapatkan Base64 data URL dari PDF untuk preview atau upload ke GDrive
   */
  static getBastPdfBase64(item: BaSerahTerimaItem): string {
    const doc = this.generateBastPdf(item);
    return doc.output('datauristring');
  }

  /**
   * Menghasilkan dokumen Berita Acara Kerusakan Alat (BA-KERUSAKAN) dalam format PDF
   * Berisi data lengkap kerusakan dan 4 BAGIAN APPROVAL:
   * 1. PEMBUAT BERITA ACARA
   * 2. TOOLKEEPER
   * 3. PLANNER/TE
   * 4. DEPT HEAD
   */
  static generateBaKerusakanPdf(item: BaKerusakanItem): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;

    // Header Kop Dokumen
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, 12, contentWidth, 24, 'F');

    doc.setTextColor(245, 158, 11); // amber-500
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PT. KARUNIA GROUP', margin + 6, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text('EQUIPMENT SUPPORT FACILITY (ESF) - MANAGEMENT SYSTEM', margin + 6, 26);

    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('Plant Maintenance & Tools Control Division | Incident Report', margin + 6, 31);

    // Garis Pemisah
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(1);
    doc.line(margin, 39, pageWidth - margin, 39);

    // Judul Dokumen
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('BERITA ACARA KERUSAKAN ALAT (BA-KERUSAKAN)', pageWidth / 2, 47, { align: 'center' });

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Nomor: ${item.noBa || '-'}`, pageWidth / 2, 53, { align: 'center' });

    // Kotak Data Kerusakan
    const startY = 58;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, startY, contentWidth, 75, 3, 3, 'FD');

    doc.setFontSize(9);
    const labelX = margin + 5;
    const valueX = margin + 52;
    let currentY = startY + 7;

    const addRow = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text(label, labelX, currentY);
      doc.text(':', labelX + 42, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(value || '-', valueX, currentY);
      currentY += 6.5;
    };

    addRow('Jobsite / Lokasi Proyek', item.jobsite || '-');
    addRow('Tanggal Kerusakan', item.tglKerusakan || item.tglKejadian || '-');
    addRow('Nomor OSR Terkait', item.noOsr || '-');
    addRow('Kategori / Jenis Tools', item.jenisTools || 'Common Tools');
    addRow('No. Register Alat', item.noRegister || '-');
    addRow('Nama Peralatan / Asset', item.namaAsset || item.namaAlat || '-');
    addRow('Merk / Brand', item.brand || '-');
    addRow('Tanggal Supply Awal', item.tglSupply || '-');
    addRow('Masa Pakai (Life Time)', item.lifeTime || '-');
    addRow('Tindakan Korektif / Action', item.action || item.tindakanKorektif || '-');
    addRow('Status Penanganan', item.status || 'Investigasi');

    // Box Keterangan / Deskripsi Kerusakan
    const descY = currentY + 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text('Kronologi / Keterangan Kerusakan:', margin, descY);

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, descY + 2, contentWidth, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const splitDesc = doc.splitTextToSize(
      item.keterangan || item.action || 'Alat mengalami kerusakan saat operasional maintenance. Dilakukan investigasi mendalam untuk menentukan tindakan repair atau pergantian komponen.',
      contentWidth - 8
    );
    doc.text(splitDesc, margin + 4, descY + 8);

    // Pernyataan
    const statementY = descY + 30;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(
      'Demikian Berita Acara Kerusakan Alat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.',
      margin,
      statementY
    );

    // 4 APPROVAL BOXES (USER REQUIREMENT):
    // 1. PEMBUAT BERITA ACARA
    // 2. TOOLKEEPER
    // 3. PLANNER/TE
    // 4. DEPT HEAD
    const signBoxY = statementY + 6;
    const gap = 4;
    const boxWidth = (contentWidth - gap * 3) / 4;
    const boxHeight = 58;

    const approvalRoles = [
      { role: 'PEMBUAT BERITA ACARA', defaultName: 'Mekanik / User' },
      { role: 'TOOLKEEPER', defaultName: 'Toolkeeper Site' },
      { role: 'PLANNER / TE', defaultName: 'Planner / TE' },
      { role: 'DEPT HEAD', defaultName: 'Dept Head Plant' }
    ];

    approvalRoles.forEach((apr, idx) => {
      const bx = margin + idx * (boxWidth + gap);

      // Card frame
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(bx, signBoxY, boxWidth, boxHeight, 2, 2, 'FD');

      // Role Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(apr.role, bx + boxWidth / 2, signBoxY + 7, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Tanda Tangan & Nama', bx + boxWidth / 2, signBoxY + 11, { align: 'center' });

      // Space for signature
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('( Tanda Tangan )', bx + boxWidth / 2, signBoxY + 28, { align: 'center' });

      // Line for name
      doc.setDrawColor(148, 163, 184);
      doc.line(bx + 4, signBoxY + 41, bx + boxWidth - 4, signBoxY + 41);

      // Name & Date
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`( ${apr.defaultName} )`, bx + boxWidth / 2, signBoxY + 46, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Tgl: ${item.tglKerusakan || '-'}`, bx + boxWidth / 2, signBoxY + 52, { align: 'center' });
    });

    // Footer Dokumen
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dicetak otomatis oleh Sistem ESF Tools & Facility Management - PT. KARUNIA GROUP | Doc No: ${item.noBa || '-'}`,
      pageWidth / 2,
      287,
      { align: 'center' }
    );

    return doc;
  }

  /**
   * Download langsung file PDF BA Kerusakan ke browser pengguna
   */
  static downloadBaKerusakanPdf(item: BaKerusakanItem): void {
    const doc = this.generateBaKerusakanPdf(item);
    const safeName = (item.noBa || 'BA-KERUSAKAN').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`${safeName}.pdf`);
  }

  /**
   * Dapatkan Base64 data URL dari PDF BA Kerusakan
   */
  static getBaKerusakanPdfBase64(item: BaKerusakanItem): string {
    const doc = this.generateBaKerusakanPdf(item);
    return doc.output('datauristring');
  }
}
