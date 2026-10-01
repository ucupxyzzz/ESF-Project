export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - ESF MONITORING MULTI-JOBSITE DUAL-CHANNEL SYNC
 * (GOOGLE SPREADSHEETS & GOOGLE DRIVE INTEGRATION)
 * =========================================================================
 * Fitur:
 * 1. Mendukung HTTP GET dan POST untuk sinkronisasi instan tanpa kendala CORS.
 * 2. Pemetaan kolom presisi sesuai spesifikasi (STEP 3):
 *    - Populasi Asset (Kolom H)
 *    - Populasi Toolbox (Kolom H)
 *    - Peminjaman Tools (Kolom E)
 *    - Pengadaan Barang (Kolom B)
 *    - BA Kerusakan Alat (Kolom D)
 *    - OSR Tools & Facility (Kolom B)
 *    - BA Serah Terima (Kolom B)
 * 3. Otomatis mencari baris kosong pertama (appendRowCleanly) agar tidak
 *    tertumpuk di bawah baris kosong berformat.
 * 4. Two-Way Sync tanpa merusak formula, font, atau warna spreadsheet.
 * 5. Otorisasi hapus dibatasi khusus untuk user HO - Balikpapan.
 * =========================================================================
 * PETUNJUK PEMASANGAN:
 * 1. Buka Google Spreadsheet ESF Monitoring Anda.
 * 2. Klik menu "Ekstensi" (Extensions) > "Apps Script".
 * 3. Hapus semua kode default di Code.gs dan tempelkan (paste) seluruh script ini.
 * 4. Klik tombol "Simpan" (Ctrl+S / Command+S).
 * 5. Klik "Terapkan" (Deploy) > "Deployment baru" (New deployment).
 * 6. Pilih tipe: "Aplikasi Web" (Web app).
 *    - Deskripsi: ESF Monitoring Realtime v3.0
 *    - Jalankan sebagai (Execute as): Saya (Me)
 *    - Yang memiliki akses (Who has access): Siapa saja (Anyone)
 * 7. Klik "Terapkan" (Deploy) dan berikan izin akses Google Akun Anda.
 * 8. Salin URL Aplikasi Web (akhiran /exec) dan pasang di aplikasi.
 * =========================================================================
 */

const SHEET_NAMES = {
  ASSET: "Populasi Asset",
  TOOLBOX: "Populasi Toolbox",
  PEMINJAMAN: "Peminjaman Tools",
  PENGADAAN: "Pengadaan Barang",
  KERUSAKAN: "BA Kerusakan Alat",
  OSR: "OSR Tools & Facility",
  BAST: "BA Serah Terima"
};

/**
 * Handle HTTP GET request:
 * - Menarik seluruh data dari 7 lembar kerja (default get_all)
 * - Juga memproses aksi insert/update/delete langsung (GET channel untuk bypass CORS redirect)
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = (e && e.parameter && e.parameter.action) || "get_all";

    // Aksi manipulasi data via GET (Sangat handal & cepat)
    if (action === "insert" || action === "update" || action === "delete") {
      let payload = {};
      if (e && e.parameter && e.parameter.data) {
        try {
          payload = JSON.parse(e.parameter.data);
        } catch (pe) {
          payload = {};
        }
      }
      const module = (e && e.parameter && e.parameter.module) || "assets";
      const key = (e && e.parameter && e.parameter.key) || "";
      const userRole = (e && e.parameter && e.parameter.userRole) || "";
      const jobsite = (e && e.parameter && e.parameter.jobsite) || "";

      return handleDataOperation(ss, action, module, payload, key, userRole, jobsite);
    }

    if (action === "ping") {
      return createJsonResponse({ status: "success", message: "ESF Apps Script is Online", timestamp: new Date().toISOString() });
    }

    // Default: Ambil seluruh data dari 7 sheet
    ensureAllSheetsExist(ss);

    const result = {
      status: "success",
      spreadsheetId: ss.getId(),
      spreadsheetName: ss.getName(),
      timestamp: new Date().toISOString(),
      data: {
        assets: getSheetData(ss, SHEET_NAMES.ASSET),
        toolboxes: getSheetData(ss, SHEET_NAMES.TOOLBOX),
        peminjaman: getSheetData(ss, SHEET_NAMES.PEMINJAMAN),
        pengadaan: getSheetData(ss, SHEET_NAMES.PENGADAAN),
        kerusakan: getSheetData(ss, SHEET_NAMES.KERUSAKAN),
        osr: getSheetData(ss, SHEET_NAMES.OSR),
        bast: getSheetData(ss, SHEET_NAMES.BAST)
      }
    };

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * Handle HTTP POST request:
 * - Memproses insert, update, dan delete dari body JSON
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let postData = {};

    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (err) {
        postData = {};
      }
    }

    const action = postData.action || (e && e.parameter && e.parameter.action) || "insert";
    const module = postData.module || (e && e.parameter && e.parameter.module) || "assets";
    const payload = postData.data || postData;
    const key = postData.key || (e && e.parameter && e.parameter.key) || "";
    const userRole = postData.userRole || (e && e.parameter && e.parameter.userRole) || "";
    const jobsite = postData.jobsite || (e && e.parameter && e.parameter.jobsite) || "";

    return handleDataOperation(ss, action, module, payload, key, userRole, jobsite);
  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * Logika Eksekusi Operasi Spreadsheet (Shared Handler)
 * Dilengkapi LockService & Deduplikasi Otomatis untuk Mencegah Data Ganda
 */
function handleDataOperation(ss, action, module, payload, key, userRole, jobsite) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (lockErr) {
    // Proceed if timeout
  }

  try {
    const sheetName = getTargetSheetName(module);
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    // 1. DELETE OPERATION (Khusus HO - Balikpapan)
    if (action === "delete") {
      if (userRole !== "ho" && jobsite !== "HO - Balikpapan") {
        return createJsonResponse({
          status: "error",
          message: "Hak akses ditolak. Hanya user 'HO - Balikpapan' yang berhak menghapus data dari spreadsheet!"
        });
      }

      const targetKey = key || (payload && (payload.noRegistrasi || payload.noToolbox || payload.noPeminjaman || payload.noPoPr || payload.noBa || payload.noOsr || payload.noBast));
      if (!targetKey) {
        return createJsonResponse({ status: "error", message: "Kunci data tidak ditemukan untuk dihapus." });
      }

      const rowIndex = findRowIndexByKey(sheet, targetKey);
      if (rowIndex > 1) {
        sheet.deleteRow(rowIndex);
        // Hapus juga jika ada baris duplikat lain dengan kunci yang sama
        removeDuplicateRowsByKey(sheet, targetKey, -1);
        return createJsonResponse({
          status: "success",
          message: "Data '" + targetKey + "' berhasil dihapus dari sheet '" + sheetName + "' (Baris " + rowIndex + ")."
        });
      } else {
        return createJsonResponse({
          status: "success",
          message: "Data '" + targetKey + "' sudah tidak ada di sheet."
        });
      }
    }

    // 2. INSERT / UPDATE OPERATION
    // Check if payload contains file for Google Drive upload
    if (payload && payload.fileData && payload.fileData.base64) {
      try {
        let driveFolderId = "";
        let docIdentifier = "";
        if (module === 'pengadaan') {
          driveFolderId = "1noEzPT5sDCx9XtIImLm6iuWEhemV1Nh5";
          docIdentifier = payload.noPengadaan || payload.noPoPr || "PENGADAAN";
        } else if (module === 'kerusakan') {
          driveFolderId = "10CGksP6f116XPGWjh23-4UR1wlypI5TM";
          docIdentifier = payload.noBa || "BA-KERUSAKAN";
        } else if (module === 'bast') {
          driveFolderId = "1NqjCKwHsH1_pVVfxPY95OI6nXcw71wT6";
          docIdentifier = payload.noBast || "BAST";
        } else if (module === 'osr') {
          driveFolderId = "117QSUo3_wux9S4_2GvX528Fi6HqLTtjV";
          docIdentifier = payload.noOsr || "OSR";
        }

        if (driveFolderId) {
          const folder = DriveApp.getFolderById(driveFolderId);
          const cleanB64 = payload.fileData.base64.replace(/^data:[^;]+;base64,/, "");
          const decoded = Utilities.base64Decode(cleanB64);
          const ext = payload.fileData.fileName ? payload.fileData.fileName.split('.').pop() : (module === 'bast' ? 'pdf' : 'jpg');
          const finalFileName = docIdentifier + "." + ext;
          const blob = Utilities.newBlob(decoded, payload.fileData.mimeType || "application/octet-stream", finalFileName);
          const driveFile = folder.createFile(blob);
          try {
            driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          } catch (e) {}
          payload.dokumentasi = driveFile.getUrl();
        }
      } catch (driveErr) {
        // Continue if drive upload encounters issue
      }
    }

    // Support array payload for multi-item batch insert
    const itemsToProcess = Array.isArray(payload) ? payload : [payload];
    const results = [];

    for (let k = 0; k < itemsToProcess.length; k++) {
      const curItem = itemsToProcess[k];
      const rowValues = convertItemToRow(module, curItem);
      const primaryKey = String(key || (curItem && (curItem.noRegistrasi || curItem.noToolbox || curItem.idPeminjaman || curItem.noPeminjaman || curItem.noPengadaan || curItem.noPoPr || curItem.noBa || curItem.noOsr || curItem.noBast || curItem.id)) || "").trim();

      let targetRowIndex = -1;
      // ONLY look for existing row to update if action is explicitly 'update'
      // If action is 'insert', always append new row to ensure all items are entered cleanly
      if (action === "update" && primaryKey) {
        targetRowIndex = findRowIndexByKey(sheet, primaryKey);
      }

      if (targetRowIndex > 1) {
        // Update baris yang sudah ada
        sheet.getRange(targetRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
        results.push("Diperbarui baris " + targetRowIndex);
      } else {
        // Tambah baris baru secara bersih pada baris kosong pertama
        const insertedRow = appendRowCleanly(sheet, rowValues);
        results.push("Ditambahkan baris " + insertedRow);
      }
    }

    return createJsonResponse({
      status: "success",
      action: action,
      message: results.join(", ") + " di sheet '" + sheetName + "'."
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
}

/**
 * Menghapus baris duplikat dengan kunci yang sama pada spreadsheet
 */
function removeDuplicateRowsByKey(sheet, primaryKey, keepRowIndex) {
  if (!primaryKey) return;
  const cleanKey = String(primaryKey).trim().toLowerCase();
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    const rowNum = i + 1;
    if (rowNum === keepRowIndex) continue;
    const colA = String(data[i][0] || "").trim().toLowerCase();
    const colB = String(data[i][1] || "").trim().toLowerCase();
    if (colA === cleanKey || (colA === "" && colB === cleanKey)) {
      sheet.deleteRow(rowNum);
    }
  }
}

/**
 * Mengisi baris baru pada baris kosong pertama di bawah data,
 * mencegah data terlempar ke baris 1000 akibat format cell kosong.
 */
function appendRowCleanly(sheet, rowValues) {
  const data = sheet.getDataRange().getValues();
  let firstEmptyRow = -1;

  for (let i = 1; i < data.length; i++) {
    const rowContent = data[i].join("").trim();
    if (rowContent === "") {
      firstEmptyRow = i + 1; // 1-indexed
      break;
    }
  }

  if (firstEmptyRow > 1) {
    sheet.getRange(firstEmptyRow, 1, 1, rowValues.length).setValues([rowValues]);
    return firstEmptyRow;
  } else {
    sheet.appendRow(rowValues);
    return sheet.getLastRow();
  }
}

/**
 * Mencari index baris berdasarkan nomor registrasi / nomor dokumen
 */
function findRowIndexByKey(sheet, key) {
  if (!key) return -1;
  const cleanKey = String(key).trim().toLowerCase();
  const data = sheet.getDataRange().getValues();

  // Dukungan pencarian kunci gabungan (misal: "ID-PEMINJAMAN_KODE-ALAT")
  if (cleanKey.includes('_')) {
    const parts = cleanKey.split('_');
    const partA = parts[0].trim();
    const partB = parts[1].trim();
    for (let i = 1; i < data.length; i++) {
      const colA = String(data[i][0] || "").trim().toLowerCase();
      const colB = String(data[i][1] || "").trim().toLowerCase();
      if (colA === partA && colB === partB) {
        return i + 1;
      }
    }
  }

  for (let i = 1; i < data.length; i++) {
    // Periksa Kolom A (index 0)
    const colA = String(data[i][0] || "").trim().toLowerCase();
    if (colA === cleanKey) {
      return i + 1;
    }
    // Periksa Kolom B jika Kolom A kosong
    const colB = String(data[i][1] || "").trim().toLowerCase();
    if (colB === cleanKey) {
      return i + 1;
    }
  }
  return -1;
}

/**
 * Mengambil data sheet baris per baris tanpa baris kosong
 */
function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol < 1) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const rows = [];
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    if (row.join("").trim() === "") continue;
    rows.push(row);
  }
  return rows;
}

function getTargetSheetName(module) {
  switch (module) {
    case 'assets': return SHEET_NAMES.ASSET;
    case 'toolboxes': return SHEET_NAMES.TOOLBOX;
    case 'peminjaman': return SHEET_NAMES.PEMINJAMAN;
    case 'pengadaan': return SHEET_NAMES.PENGADAAN;
    case 'kerusakan': return SHEET_NAMES.KERUSAKAN;
    case 'osr': return SHEET_NAMES.OSR;
    case 'bast': return SHEET_NAMES.BAST;
    default: return SHEET_NAMES.ASSET;
  }
}

function ensureAllSheetsExist(ss) {
  Object.keys(SHEET_NAMES).forEach(function(key) {
    const name = SHEET_NAMES[key];
    if (!ss.getSheetByName(name)) {
      const newSheet = ss.insertSheet(name);
      const header = getDefaultHeader(key);
      if (header.length > 0) {
        newSheet.appendRow(header);
      }
    }
  });
}

function getDefaultHeader(key) {
  switch (key) {
    case 'ASSET':
      return ["No Registrasi", "Nama Asset", "Kategori", "Merk/Brand", "No PO", "Tgl Supply", "Lokasi/Penempatan", "Jobsite", "Kondisi Awal", "Spesifikasi & Keterangan Tambahan", "Tanggal Penginputan"];
    case 'TOOLBOX':
      return ["No Toolbox", "Nama Toolbox", "Kategori", "Merk/Brand", "No PO", "Tgl Supply", "Lokasi Penempatan", "Jobsite", "Kondisi", "PIC Penanggung Jawab", "Keterangan"];
    case 'PEMINJAMAN':
      return ["ID Peminjaman", "Kode Alat", "Nama Asset", "Kategori", "Jobsite", "Peminjam", "Section/Departemen", "Tgl Pinjam", "Estimasi Kembali", "Tgl Realisasi Kembali", "Status", "Kondisi Awal", "Kondisi Akhir", "Keperluan"];
    case 'PENGADAAN':
      return ["No Pengadaan", "Jobsite", "Kategori", "Type", "No CER", "Part Number", "Nama Alat", "Qty", "Tgl Pengadaan", "No UR", "No PR", "No PO", "Qty PR", "Qty PO", "Qty GR", "Vendor", "Total Price", "Aging Days", "Tgl Supply", "Remarks", "Status", "Dokumentasi"];
    case 'KERUSAKAN':
      return ["No Berita Acara", "No OSR", "Jenis Tools", "Jobsite", "No Register", "Nama Asset", "Brand", "Tgl Supply", "Tgl Kerusakan", "Life Time", "Action", "Status", "Dokumentasi", "Kronologi"];
    case 'OSR':
      return ["No OSR", "Jobsite", "Date OSR", "No Registrasi", "Nama Asset", "Keterangan Kerusakan", "PR", "PO", "Vendor", "Amount", "Condition", "Remarks", "Tgl Supply", "Status", "Dokumentasi"];
    case 'BAST':
      return ["No Bast", "Jobsite", "Date", "Nama Asset", "PO", "Remarks", "No Register", "Penerima", "Status", "Dokumentasi"];
    default:
      return [];
  }
}

/**
 * Konversi item objek aplikasi ke susunan array baris spreadsheet
 * dengan pemetaan kolom jobsite yang presisi (STEP 3).
 */
function convertItemToRow(module, item) {
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+8", "yyyy-MM-dd");

  switch (module) {
    case 'assets':
      return [
        item.noRegistrasi || '',
        item.namaAsset || '',
        item.kategori || 'Common Tools',
        item.merkBrand || '-',
        item.noPo || '',
        item.tglSupply || today,
        item.lokasiPenempatan || 'Tool Room',
        item.jobsite || '', // Kolom H (Index 7)
        item.kondisiAwal || 'Baik (Ready for Operation)',
        item.spesifikasiKeterangan || '',
        item.tanggalPenginputan || today
      ];
    case 'toolboxes':
      return [
        item.noToolbox || '',
        item.namaToolbox || '',
        item.jenisToolbox || item.kategori || 'Common Tools',
        item.merkBrand || '',
        item.jumlahItem || item.noPo || 'PO',
        item.tglSupply || today,
        item.lokasiPenempatan || 'Bays WS',
        item.jobsite || '', // Kolom H (Index 7)
        item.kondisi || 'Lengkap & Baik',
        item.pic || '',
        item.keterangan || ''
      ];
    case 'peminjaman':
      return [
        item.idPeminjaman || item.noPeminjaman || '', // A
        item.kodeAlat || item.noRegistrasi || '', // B
        item.namaAsset || item.namaTool || '', // C
        item.kategori || 'Common Tools', // D
        item.jobsite || '', // E (Index 4)
        item.peminjam || '', // F
        item.section || '', // G
        item.tglPinjam || today, // H
        item.estimasiKembali || item.tglRencanaKembali || today, // I
        item.tglRealisasiKembali || '', // J
        item.status || 'Dipinjam', // K
        item.kondisiAwal || 'Baik (Ready for Operation)', // L
        item.kondisiAkhir || '', // M
        item.keperluan || '' // N
      ];
    case 'pengadaan':
      return [
        item.noPengadaan || item.noPoPr || '', // A
        item.jobsite || '', // B (Index 1)
        item.kategori || 'Common Tools', // C
        item.typeBarang || item.type || '', // D
        item.noCer || '', // E
        item.partNumber || '', // F
        item.namaAlat || item.deskripsiBarang || '', // G
        item.qty || '1 Unit', // H
        item.tglPengadaan || item.tglPengajuan || today, // I
        item.noUr || '', // J
        item.noPr || '', // K
        item.noPo || '', // L
        item.qtyPr || '', // M
        item.qtyPo || '', // N
        item.qtyGr || '', // O
        item.vendor || item.supplier || '', // P
        item.totalPrice || item.estimasiBiaya || '0', // Q
        item.agingDays || '0', // R
        item.tglSupply || '', // S
        item.remarks || item.keterangan || '', // T
        item.status || 'Draft', // U
        item.dokumentasi || '' // V
      ];
    case 'kerusakan':
      return [
        item.noBa || '', // A
        item.noOsr || '', // B
        item.jenisTools || '', // C
        item.jobsite || '', // D (Index 3)
        item.noRegister || '', // E
        item.namaAsset || item.namaAlat || '', // F
        item.brand || '', // G
        item.tglSupply || '', // H
        item.tglKerusakan || item.tglKejadian || today, // I
        item.lifeTime || '', // J
        item.action || item.tindakanKorektif || '', // K
        item.status || 'Investigasi', // L
        item.dokumentasi || item.fotoKerusakan || '', // M
        item.kronologi || item.kronologiKerusakan || '' // N (Kolom N)
      ];
    case 'osr':
      return [
        item.noOsr || '', // A
        item.jobsite || '', // B (Index 1)
        item.dateOsr || item.tglKirim || today, // C
        item.noRegistrasi || '', // D
        item.namaAsset || item.namaTool || '', // E
        item.keteranganKerusakan || '', // F
        item.pr || item.noPr || '', // G
        item.po || item.noPo || '', // H
        item.vendor || item.vendorRekanan || '', // I
        item.amount || item.biayaPerbaikan || '0', // J
        item.condition || 'Rusak', // K
        item.remarks || item.keterangan || '', // L
        item.tglSupply || '', // M
        item.status || 'Sedang Dikerjakan', // N
        item.dokumentasi || item.fotoKerusakan || '' // O (Kolom O)
      ];
    case 'bast':
      return [
        item.noBast || '', // A
        item.jobsite || '', // B (Index 1)
        item.date || item.tglSerahTerima || today, // C
        item.namaAsset || '', // D
        item.po || '', // E
        item.remarks || item.keterangan || '', // F
        item.noRegister || '', // G
        item.penerima || item.pihakKedua || '', // H
        item.status || 'Draft', // I
        item.dokumentasi || '' // J
      ];
    default:
      return [];
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
