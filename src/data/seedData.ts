import {
  ToolboxItem,
  PeminjamanItem,
  PengadaanItem,
  BaKerusakanItem,
  OsrItem,
  BaSerahTerimaItem
} from '../types';

export const INITIAL_TOOLBOXES: ToolboxItem[] = [
  {
    id: 'tbx-1',
    noToolbox: 'TBX-SSE-001',
    namaToolbox: 'Toolbox Heavy Equipment 01',
    jenisToolbox: 'Roller Cabinet 7-Drawer',
    merkBrand: 'Tekiro Pro',
    jumlahItem: '124 pcs',
    tglSupply: '15-Agu-24',
    lokasiPenempatan: 'Bays WS HD',
    jobsite: 'SSE - Tabang',
    kondisi: 'Lengkap & Baik',
    pic: 'Agus Santoso (NRP: 84920)',
    keterangan: 'Peralatan mekanik harian pitstop'
  },
  {
    id: 'tbx-2',
    noToolbox: 'TBX-WBM-002',
    namaToolbox: 'Toolbox Tyre Service Team',
    jenisToolbox: 'Cantilever Heavy Duty',
    merkBrand: 'Genius Tools',
    jumlahItem: '58 pcs',
    tglSupply: '20-Sep-24',
    lokasiPenempatan: 'Bays Tyre WBM',
    jobsite: 'WBM - Satui',
    kondisi: 'Lengkap & Baik',
    pic: 'Bambang Irawan (NRP: 77219)',
    keterangan: 'Khusus penggantian ban HD & Support'
  },
  {
    id: 'tbx-3',
    noToolbox: 'TBX-BDA-003',
    namaToolbox: 'Toolbox Fabrication & Welder',
    jenisToolbox: 'Metal Chest Portable',
    merkBrand: 'Wipro Industrial',
    jumlahItem: '42 pcs',
    tglSupply: '10-Okt-24',
    lokasiPenempatan: 'Bays Fabrikasi KM 44',
    jobsite: 'BDA - Muara Teweh',
    kondisi: 'Ada 2 Kunci Pas Hilang',
    pic: 'Rudi Hartono (NRP: 90214)',
    keterangan: 'Proses investigasi kelengkapan tools'
  },
  {
    id: 'tbx-4',
    noToolbox: 'TBX-IPM-004',
    namaToolbox: 'Toolbox Engine Diagnostic',
    jenisToolbox: 'Protective Hard Case',
    merkBrand: 'CAT Spec',
    jumlahItem: '28 pcs',
    tglSupply: '05-Jan-25',
    lokasiPenempatan: 'Tool Room WS HD',
    jobsite: 'IPM - Tabang',
    kondisi: 'Lengkap & Terkalibrasi',
    pic: 'Hendra Setiawan (NRP: 65103)',
    keterangan: 'Peralatan khusus sensor dan elektrikal'
  },
  {
    id: 'tbx-5',
    noToolbox: 'TBX-MSJ-005',
    namaToolbox: 'Toolbox General Service MSJ',
    jenisToolbox: 'Roller Cabinet 5-Drawer',
    merkBrand: 'Tekiro',
    jumlahItem: '86 pcs',
    tglSupply: '14-Mar-25',
    lokasiPenempatan: 'Tool Room Separi',
    jobsite: 'MSJ - Separi',
    kondisi: 'Lengkap & Baik',
    pic: 'Suryadi (NRP: 81920)',
    keterangan: 'Ready for operation shift 1 & 2'
  },
  {
    id: 'tbx-6',
    noToolbox: 'TBX-GBPC-006',
    namaToolbox: 'Toolbox Pitstop Melak 01',
    jenisToolbox: 'Cantilever 5 Trays',
    merkBrand: 'Xander',
    jumlahItem: '64 pcs',
    tglSupply: '18-Mei-25',
    lokasiPenempatan: 'Pit Stop',
    jobsite: 'GBPC - Melak',
    kondisi: 'Lengkap & Baik',
    pic: 'Dedi Kurniawan (NRP: 74901)',
    keterangan: 'Ditempatkan di area Pit Stop 02'
  }
];

export const INITIAL_PEMINJAMAN: PeminjamanItem[] = [
  {
    id: 'pjm-1',
    noPeminjaman: 'LOAN-SSE-26-001',
    namaTool: 'TORQUE WRENCH DR.1"INCH (TC-SSE-0022)',
    peminjam: 'Ari Wibowo (Mekanik Engine)',
    tglPinjam: '2026-09-25',
    jobsite: 'SSE - Tabang',
    tglRencanaKembali: '2026-09-28',
    tglRealisasiKembali: '',
    status: 'Dipinjam',
    keperluan: 'Torque cylinder head unit HD-785-7',
    keterangan: 'Dipinjam lengkap bersama box kalibrasi'
  },
  {
    id: 'pjm-2',
    noPeminjaman: 'LOAN-WBM-26-002',
    namaTool: 'JACK PHENUMATIC 80 TON (TL-WBM-0001)',
    peminjam: 'Teguh Prasetyo (Tyre Man)',
    tglPinjam: '2026-09-24',
    jobsite: 'WBM - Satui',
    tglRencanaKembali: '2026-09-25',
    tglRealisasiKembali: '2026-09-25',
    status: 'Kembali',
    keperluan: 'Ganti ban depan OTR unit dump truck',
    keterangan: 'Kembali dalam kondisi bersih dan normal'
  },
  {
    id: 'pjm-3',
    noPeminjaman: 'LOAN-BDA-26-003',
    namaTool: 'AC FLUSHING SET (TC-BDA-0058)',
    peminjam: 'Irfan Hakim (AC Specialist)',
    tglPinjam: '2026-09-20',
    jobsite: 'BDA - Muara Teweh',
    tglRencanaKembali: '2026-09-22',
    tglRealisasiKembali: '',
    status: 'Terlambat',
    keperluan: 'Flushing kompresor AC unit Grader GD825',
    keterangan: 'Perlu konfirmasi pengembalian ke tool room'
  },
  {
    id: 'pjm-4',
    noPeminjaman: 'LOAN-IPM-26-004',
    namaTool: 'BORESCOPE CAMERA NTS 300 (TS-IPM-0014)',
    peminjam: 'Faisal Akbar (Troubleshooter)',
    tglPinjam: '2026-09-26',
    jobsite: 'IPM - Tabang',
    tglRencanaKembali: '2026-09-29',
    tglRealisasiKembali: '',
    status: 'Dipinjam',
    keperluan: 'Inspeksi liner cylinder turbo unit Excavator EX2500',
    keterangan: 'Kondisi baterai penuh saat serah terima'
  }
];

export const INITIAL_PENGADAAN: PengadaanItem[] = [
  {
    id: 'pgd-1',
    noPoPr: 'PR-ESF-SSE-2026-012',
    jobsite: 'SSE - Tabang',
    deskripsiBarang: 'Pengadaan 4 Unit Hydraulic Bottle Jack 50 Ton SWL',
    kategori: 'Lifting Tools',
    qty: '4 Unit',
    tglPengajuan: '2026-09-15',
    estimasiBiaya: '45.000.000',
    status: 'Disetujui HO',
    supplier: 'PT United Tools Sejahtera',
    keterangan: 'Penggantian unit jack yang telah aus/non-operational'
  },
  {
    id: 'pgd-2',
    noPoPr: 'PR-ESF-WBM-2026-015',
    jobsite: 'WBM - Satui',
    deskripsiBarang: 'Pneumatic Air Impact Wrench Long Anvil 1" (Heavy Duty)',
    kategori: 'Power Tools',
    qty: '2 Unit',
    tglPengajuan: '2026-09-18',
    estimasiBiaya: '38.500.000',
    status: 'Dalam Pengiriman',
    supplier: 'PT Ingersoll Rand Indonesia',
    keterangan: 'Resi ekspedisi Kaltim Logistik no: BPP-SAT-9921'
  },
  {
    id: 'pgd-3',
    noPoPr: 'PR-ESF-BDA-2026-008',
    jobsite: 'BDA - Muara Teweh',
    deskripsiBarang: 'Digital Multitester Sanwa CD800A & Battery Analyzer',
    kategori: 'Measurement Tools',
    qty: '3 Set',
    tglPengajuan: '2026-09-22',
    estimasiBiaya: '12.800.000',
    status: 'Diajukan',
    supplier: 'Mitra Teknik Instrument',
    keterangan: 'Menunggu persetujuan Finance HO Balikpapan'
  },
  {
    id: 'pgd-4',
    noPoPr: 'PR-ESF-IPM-2026-021',
    jobsite: 'IPM - Tabang',
    deskripsiBarang: 'Webbing Sling 5 Ton x 6 Meter & Lever Block 3 Ton',
    kategori: 'Lifting Tools',
    qty: '8 Pcs',
    tglPengajuan: '2026-09-10',
    estimasiBiaya: '24.200.000',
    status: 'Diterima di Site',
    supplier: 'PT Gosave Mandiri',
    keterangan: 'Sudah dilakukan QC fisik dan masuk inventory'
  }
];

export const INITIAL_BA_KERUSAKAN: BaKerusakanItem[] = [
  {
    id: 'bak-1',
    noBa: 'BA-KRS-SSE-2026-003',
    tglKejadian: '2026-09-12',
    namaAlat: 'JACK HYDRAULIC 16 TON (TL-SSE-0008)',
    jobsite: 'SSE - Tabang',
    kronologiKerusakan: 'Silinder hidrolik jebol saat mengangkat unit dump truck bermuatan',
    estimasiBiaya: '6.500.000',
    tindakanKorektif: 'Kirim ke workshop vendor Balikpapan (OSR) atau ganti unit',
    status: 'Review HO',
    pelapor: 'Yudi Pratama (Supervisor Tool Room)',
    keterangan: 'Disarankan ganti seal pack dan rod silinder'
  },
  {
    id: 'bak-2',
    noBa: 'BA-KRS-WBM-2026-007',
    tglKejadian: '2026-09-14',
    namaAlat: 'SOCKET IMPACT 1 INC 34 MM (TC-WBM-0009)',
    jobsite: 'WBM - Satui',
    kronologiKerusakan: 'Mata socket retak pada bagian drive square akibat over torque',
    estimasiBiaya: '1.200.000',
    tindakanKorektif: 'Scrap & Write-Off, ajukan penggantian baru',
    status: 'Disetujui',
    pelapor: 'Ahmad Faisal (Mekanik)',
    keterangan: 'Sudah tidak aman digunakan (safety risk)'
  },
  {
    id: 'bak-3',
    noBa: 'BA-KRS-IPM-2026-005',
    tglKejadian: '2026-09-19',
    namaAlat: 'JACK PNEUMATIC 150 TON (WF-IPM-0012)',
    jobsite: 'IPM - Tabang',
    kronologiKerusakan: 'Valve pengatur angin macet dan oli hidrolik merembes dari body',
    estimasiBiaya: '14.000.000',
    tindakanKorektif: 'Dibuatkan surat jalan OSR ke Balikpapan',
    status: 'Investigasi',
    pelapor: 'Dedi Sugianto (Foreman WS)',
    keterangan: 'Menunggu dokumen inspeksi keselamatan'
  }
];

export const INITIAL_OSR: OsrItem[] = [
  {
    id: 'osr-1',
    noOsr: '213/OSR/KAI-IPH/VI/2026',
    jobsite: 'IPH - Tabang',
    namaTool: 'PNEUMATIC AIR IMPACT DR.1" SR24K210010 (TP-IPH-0006)',
    vendorRekanan: 'PT Central Air Tool Balikpapan',
    tglKirim: '2026-06-18',
    estimasiSelesai: '2026-10-05',
    biayaPerbaikan: '8.750.000',
    status: 'Sedang Dikerjakan',
    keterangan: 'Ganti rotor vane dan anvil pin'
  },
  {
    id: 'osr-2',
    noOsr: '109/OSR/KAI-SSE/VIII/2026',
    jobsite: 'SSE - Tabang',
    namaTool: 'MESIN LAS PORTABLE 400A (TF-SSE-0011)',
    vendorRekanan: 'CV Mega Electricindo Samarinda',
    tglKirim: '2026-08-10',
    estimasiSelesai: '2026-09-30',
    biayaPerbaikan: '5.200.000',
    status: 'Testing',
    keterangan: 'Penggantian modul PCB power supply'
  },
  {
    id: 'osr-3',
    noOsr: '088/OSR/KAI-WBM/IX/2026',
    jobsite: 'WBM - Satui',
    namaTool: 'HYDRAULIC JACK 80 TON (TL-WBM-0014)',
    vendorRekanan: 'PT Hidrolik Prima Banjarmasin',
    tglKirim: '2026-09-02',
    estimasiSelesai: '2026-10-10',
    biayaPerbaikan: '12.000.000',
    status: 'Sedang Dikerjakan',
    keterangan: 'Honing silinder dan penggantian seal set'
  }
];

export const INITIAL_BA_SERAH_TERIMA: BaSerahTerimaItem[] = [
  {
    id: 'bst-1',
    noBast: 'BAST-ESF-SSE-2026-004',
    jobsite: 'SSE - Tabang',
    tglSerahTerima: '2026-09-10',
    pihakPertama: 'Logistik HO Balikpapan (Budi Santoso)',
    pihakKedua: 'Supervisor ESF SSE - Tabang (Wahyu Hidayat)',
    daftarBarang: '2 Unit Chain Block 3T x 5M Krisbow & 1 Unit Torque Wrench 1"',
    kondisiFisik: '100% Baru, Dus utuh, Sertifikat Factory Terlampir',
    lokasiBaru: 'Tool Room SSE - Tabang',
    status: 'Terverifikasi HO',
    keterangan: 'Pengadaan via PO-2026-9021 selesai diserahterimakan'
  },
  {
    id: 'bst-2',
    noBast: 'BAST-ESF-BDA-2026-002',
    jobsite: 'BDA - Muara Teweh',
    tglSerahTerima: '2026-09-15',
    pihakPertama: 'Workshop Foreman (Agus Salim)',
    pihakKedua: 'Pitstop Incharge KM 12 (Eko Prasetyo)',
    daftarBarang: '1 Unit Air Impact 1", 1 Unit Cable Roll 50M, 2 Unit Bottle Jack 20T',
    kondisiFisik: 'Baik (Ready for Operation), telah diuji coba',
    lokasiBaru: 'Pitstop KM 12 BDA',
    status: 'Ditandatangani',
    keterangan: 'Relokasi aset tool dari workshop utama ke pitstop'
  },
  {
    id: 'bst-3',
    noBast: 'BAST-ESF-MPH-2026-001',
    jobsite: 'MPH - Muara Pahu',
    tglSerahTerima: '2026-09-22',
    pihakPertama: 'ESF Officer HO (Rian Pratama)',
    pihakKedua: 'Site Manager MPH (Darmadi)',
    daftarBarang: '1 Set Battery Analyzer Ancel BST500 & 2 Set Manifold Gauge AC',
    kondisiFisik: 'Baru dalam hard case',
    lokasiBaru: 'WS CH 48 Tool Room',
    status: 'Terverifikasi HO',
    keterangan: 'Pemberian fasilitas penunjang diagnostic AC & Kelistrikan'
  }
];
