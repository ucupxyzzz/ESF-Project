import React, { useState, useEffect, useRef } from 'react';
import { SheetModule, User, AssetItem } from '../types';
import { ALL_JOBSITES } from '../data/defaultUsers';
import { StorageService } from '../services/storage';
import { getNextLoanId, getNextLoanIdWithOffset, getJobsiteShortCode, getNextPengadaanId, getNextBaKerusakanId } from '../utils/loanIdGenerator';
import { DateInput } from './DateInput';
import { X, Plus, Trash2, Camera, Upload, CheckCircle2, FileText, Image as ImageIcon, AlertTriangle } from 'lucide-react';

interface DataFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (module: SheetModule, data: any, isEdit: boolean) => void;
  module: SheetModule;
  itemToEdit?: any | null;
  currentUser: User;
  availableAssets?: AssetItem[];
}

export const DataFormModal: React.FC<DataFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  module,
  itemToEdit,
  currentUser,
  availableAssets = []
}) => {
  const isHO = currentUser.role === 'ho' || currentUser.jobsite === 'HO - Balikpapan';

  // General form state
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Multi-item states:
  // 1. Peminjaman Tools
  const [loanedItems, setLoanedItems] = useState<Array<{
    kodeAlat: string;
    namaAsset: string;
    kategori: string;
    kondisiAwal: string;
  }>>([{ kodeAlat: '', namaAsset: '', kategori: 'Common Tools', kondisiAwal: 'Baik (Ready for Operation)' }]);

  // 2. Pengadaan Barang
  const [pengadaanItems, setPengadaanItems] = useState<Array<{
    kategori: string;
    typeBarang: string;
    partNumber: string;
    namaAlat: string;
    qty: string;
  }>>([{ kategori: 'Common Tools', typeBarang: '', partNumber: '', namaAlat: '', qty: '1' }]);

  // 3. BA Kerusakan
  const [damagedItems, setDamagedItems] = useState<Array<{
    noRegister: string;
    namaAsset: string;
    brand: string;
    tglSupply: string;
    jenisTools: string;
    lifeTime: string;
  }>>([{ noRegister: '', namaAsset: '', brand: '', tglSupply: '', jenisTools: 'Common Tools', lifeTime: '' }]);

  // 4. BA Serah Terima
  const [bastAssets, setBastAssets] = useState<Array<{
    noRegister: string;
    namaAsset: string;
    po: string;
    remarks: string;
  }>>([{ noRegister: '', namaAsset: '', po: '', remarks: '' }]);

  // Document & Photo attachments
  const [dokumenPengadaan, setDokumenPengadaan] = useState<string>('');
  const [dokumenPengadaanName, setDokumenPengadaanName] = useState<string>('');

  const [fotoKerusakan, setFotoKerusakan] = useState<string>('');
  const [fotoKerusakanName, setFotoKerusakanName] = useState<string>('');

  const [fotoOsr, setFotoOsr] = useState<string>('');
  const [fotoOsrName, setFotoOsrName] = useState<string>('');

  const [dokumenBast, setDokumenBast] = useState<string>('');
  const [dokumenBastName, setDokumenBastName] = useState<string>('');

  // Hidden file inputs for Camera and File Picker
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeAttachmentTargetRef = useRef<'pengadaan' | 'kerusakan' | 'osr' | 'bast'>('pengadaan');

  // Fetch registered assets for the current jobsite
  const allAssets = availableAssets && availableAssets.length > 0 ? availableAssets : StorageService.getAssets();
  const activeJobsite = isHO ? (formData.jobsite || ALL_JOBSITES[0]) : currentUser.jobsite;
  const siteAssets = allAssets.filter((a) => isHO ? true : a.jobsite === activeJobsite);

  useEffect(() => {
    setIsSubmitting(false);
    if (itemToEdit) {
      setFormData({ ...itemToEdit });
      if (itemToEdit.fotoKerusakan || itemToEdit.dokumentasi) {
        setFotoKerusakan(itemToEdit.fotoKerusakan || itemToEdit.dokumentasi);
        setFotoOsr(itemToEdit.fotoKerusakan || itemToEdit.dokumentasi);
      }
      if (itemToEdit.dokumentasi) {
        setDokumenPengadaan(itemToEdit.dokumentasi);
        setDokumenBast(itemToEdit.dokumentasi);
      }
      if (module === 'peminjaman-tools') {
        setLoanedItems([{
          kodeAlat: itemToEdit.kodeAlat || '',
          namaAsset: itemToEdit.namaAsset || itemToEdit.namaTool || '',
          kategori: itemToEdit.kategori || 'Common Tools',
          kondisiAwal: itemToEdit.kondisiAwal || 'Baik (Ready for Operation)'
        }]);
      }
      if (module === 'pengadaan-barang') {
        setPengadaanItems([{
          kategori: itemToEdit.kategori || 'Common Tools',
          typeBarang: itemToEdit.typeBarang || itemToEdit.type || '',
          partNumber: itemToEdit.partNumber || '',
          namaAlat: itemToEdit.namaAlat || itemToEdit.deskripsiBarang || '',
          qty: itemToEdit.qty || '1'
        }]);
      }
      if (module === 'ba-kerusakan') {
        setDamagedItems([{
          noRegister: itemToEdit.noRegister || '',
          namaAsset: itemToEdit.namaAsset || itemToEdit.namaAlat || '',
          brand: itemToEdit.brand || '',
          tglSupply: itemToEdit.tglSupply || '',
          jenisTools: itemToEdit.jenisTools || 'Common Tools',
          lifeTime: itemToEdit.lifeTime || ''
        }]);
      }
      if (module === 'ba-serah-terima') {
        setBastAssets([{
          noRegister: itemToEdit.noRegister || '',
          namaAsset: itemToEdit.namaAsset || '',
          po: itemToEdit.po || '',
          remarks: itemToEdit.remarks || ''
        }]);
      }
    } else {
      // Default new item initialization based on module
      const defaultJobsite = isHO ? ALL_JOBSITES[0] : currentUser.jobsite;
      const today = new Date().toISOString().split('T')[0];
      setFotoKerusakan('');
      setFotoKerusakanName('');
      setFotoOsr('');
      setFotoOsrName('');
      setDokumenPengadaan('');
      setDokumenPengadaanName('');
      setDokumenBast('');
      setDokumenBastName('');

      const siteCode = getJobsiteShortCode(defaultJobsite);

      switch (module) {
        case 'populasi-asset':
          setFormData({
            noRegistrasi: `TC-${siteCode}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            namaAsset: '',
            kategori: 'Common Tools',
            merkBrand: '',
            noPo: '',
            tglSupply: today,
            lokasiPenempatan: 'Tool Room',
            jobsite: defaultJobsite,
            kondisiAwal: 'Baik (Ready for Operation)',
            tanggalPenginputan: today
          });
          break;
        case 'populasi-toolbox':
          setFormData({
            noToolbox: `TBX-${siteCode}-${String(Math.floor(Math.random() * 900) + 100)}`,
            namaToolbox: '',
            jenisToolbox: 'Common Tools',
            merkBrand: 'Tekiro Pro',
            jumlahItem: 'PO',
            tglSupply: today,
            lokasiPenempatan: 'Bays WS',
            jobsite: defaultJobsite,
            kondisi: 'Lengkap & Baik',
            pic: '', // Requirement: default blank
            keterangan: ''
          });
          break;
        case 'peminjaman-tools': {
          // Requirement: Format LOAN-(JOBSITE)-(NOMOR URUT), contoh LOAN-GAM-0001
          const nextLoanId = getNextLoanId(defaultJobsite, StorageService.getPeminjaman());
          setFormData({
            idPeminjaman: nextLoanId,
            noPeminjaman: nextLoanId,
            jobsite: defaultJobsite,
            peminjam: '', // Requirement: default blank
            section: 'Plant Maintenance',
            tglPinjam: today,
            estimasiKembali: today,
            tglRealisasiKembali: '',
            status: 'Dipinjam',
            keperluan: ''
          });
          setLoanedItems([{
            kodeAlat: '',
            namaAsset: '',
            kategori: 'Common Tools',
            kondisiAwal: 'Baik (Ready for Operation)'
          }]);
          break;
        }
        case 'pengadaan-barang': {
          const nextPgdId = getNextPengadaanId(defaultJobsite, StorageService.getPengadaan());
          setFormData({
            noPengadaan: nextPgdId,
            noPoPr: nextPgdId,
            jobsite: defaultJobsite,
            tglPengadaan: today,
            noCer: '',
            noUr: `UR-${Date.now().toString().slice(-4)}`,
            status: 'Draft'
          });
          setPengadaanItems([
            { kategori: 'Common Tools', typeBarang: 'Pengadaan Baru', partNumber: '', namaAlat: '', qty: '1' }
          ]);
          break;
        }
        case 'ba-kerusakan': {
          const nextBaId = getNextBaKerusakanId(defaultJobsite, StorageService.getKerusakan());
          setFormData({
            noBa: nextBaId,
            noOsr: '',
            jobsite: defaultJobsite,
            tglKerusakan: today,
            action: 'Pergantian Baru',
            status: 'Investigasi',
            kronologi: '',
            noRegister: '',
            namaAsset: '',
            brand: '',
            tglSupply: '',
            jenisTools: 'Common Tools',
            lifeTime: ''
          });
          setDamagedItems([
            { noRegister: '', namaAsset: '', brand: '', tglSupply: '', jenisTools: 'Common Tools', lifeTime: '' }
          ]);
          break;
        }
        case 'osr-tools':
          setFormData({
            noOsr: `${Math.floor(Math.random() * 900) + 100}/OSR/KAI-${siteCode}/${new Date().getFullYear()}`,
            jobsite: defaultJobsite,
            dateOsr: today,
            noRegistrasi: '',
            namaAsset: '',
            keteranganKerusakan: '',
            pr: '',
            po: '',
            vendor: 'Workshop Balikpapan',
            amount: '0',
            condition: 'Rusak',
            remarks: '',
            tglSupply: '',
            status: 'Sedang Dikerjakan'
          });
          break;
        case 'ba-serah-terima':
          setFormData({
            noBast: `BAST-ESF-${siteCode}-${Date.now().toString().slice(-4)}`,
            jobsite: defaultJobsite,
            date: today,
            po: '',
            remarks: 'Serah terima asset dalam kondisi baik dan lengkap',
            penerima: '', // Requirement: default blank
            status: 'Draft'
          });
          setBastAssets([
            { noRegister: '', namaAsset: '', po: '', remarks: '' }
          ]);
          break;
        default:
          setFormData({});
      }
    }
  }, [itemToEdit, module, isOpen, currentUser, isHO]);

  if (!isOpen) return null;

  const isEdit = Boolean(itemToEdit);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const next = { ...prev, [field]: value };
      // Auto update ID if jobsite changes for non-edit
      if (!isEdit && field === 'jobsite') {
        const sc = getJobsiteShortCode(value);
        if (module === 'peminjaman-tools') {
          const nextLoan = getNextLoanId(value, StorageService.getPeminjaman());
          next.idPeminjaman = nextLoan;
          next.noPeminjaman = nextLoan;
        } else if (module === 'pengadaan-barang') {
          const nextPgd = getNextPengadaanId(value, StorageService.getPengadaan());
          next.noPengadaan = nextPgd;
          next.noPoPr = nextPgd;
        } else if (module === 'ba-kerusakan') {
          next.noBa = getNextBaKerusakanId(value, StorageService.getKerusakan());
        } else if (module === 'populasi-asset') {
          next.noRegistrasi = `TC-${sc}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
        } else if (module === 'populasi-toolbox') {
          next.noToolbox = `TBX-${sc}-${String(Math.floor(Math.random() * 900) + 100)}`;
        }
      }
      return next;
    });
  };

  // Helper to calculate lifetime difference in months/years
  const calculateLifeTime = (supplyDate: string, damageDate: string): string => {
    if (!supplyDate || !damageDate) return '';
    try {
      const d1 = new Date(supplyDate);
      const d2 = new Date(damageDate);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '';
      const diffMs = Math.max(0, d2.getTime() - d1.getTime());
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const months = Math.floor(diffDays / 30);
      const years = Math.floor(months / 12);
      const remMonths = months % 12;

      if (years > 0) {
        return `${years} Tahun ${remMonths > 0 ? `${remMonths} Bulan` : ''}`.trim();
      }
      if (months > 0) {
        return `${months} Bulan`;
      }
      return `${diffDays} Hari`;
    } catch {
      return '';
    }
  };

  // Client-side image compression & document reader helper (Requirement 8)
  const processAndCompressFile = (
    file: File,
    setterBase64: (val: string) => void,
    setterName: (val: string) => void
  ) => {
    setterName(file.name);

    // If PDF or document, read as data URL directly
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setterBase64(reader.result);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // Compress smartphone photos to prevent localStorage quota crash and huge payloads
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.src = ev.target?.result as string;
    };
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 1280;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        setterBase64(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        setterBase64(img.src);
      }
    };
    img.onerror = () => {
      reader.readAsDataURL(file);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerUpload = (target: 'pengadaan' | 'kerusakan' | 'osr' | 'bast', isCamera: boolean) => {
    activeAttachmentTargetRef.current = target;
    if (isCamera && cameraInputRef.current) {
      cameraInputRef.current.click();
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleHiddenFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const target = activeAttachmentTargetRef.current;
    if (target === 'pengadaan') {
      processAndCompressFile(file, setDokumenPengadaan, setDokumenPengadaanName);
    } else if (target === 'kerusakan') {
      processAndCompressFile(file, setFotoKerusakan, setFotoKerusakanName);
    } else if (target === 'osr') {
      processAndCompressFile(file, setFotoOsr, setFotoOsrName);
    } else if (target === 'bast') {
      processAndCompressFile(file, setDokumenBast, setDokumenBastName);
    }

    // Reset input so selecting the same file again triggers onChange
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const finalJobsite = isHO ? (formData.jobsite || ALL_JOBSITES[0]) : currentUser.jobsite;
    const timestamp = Date.now();

    // 1. MULTI-ITEM HANDLING FOR PEMINJAMAN TOOLS (Requirement 1 & Loan ID format)
    if (module === 'peminjaman-tools') {
      const existingLoans = StorageService.getPeminjaman();
      const validLoans = loanedItems.filter(li => li.kodeAlat || li.namaAsset);
      const itemsToMap = validLoans.length > 0 ? validLoans : loanedItems;

      const items = itemsToMap.map((li, idx) => {
        // Sequential ID: LOAN-(JOBSITE)-(NOMOR URUT)
        const loanId = isEdit
          ? (formData.idPeminjaman || formData.noPeminjaman || getNextLoanIdWithOffset(finalJobsite, existingLoans, idx))
          : getNextLoanIdWithOffset(finalJobsite, existingLoans, idx);

        return {
          id: isEdit ? (formData.id || `pjm-${timestamp}`) : `pjm-${timestamp}-${idx}`,
          idPeminjaman: loanId,
          noPeminjaman: loanId,
          kodeAlat: li.kodeAlat || formData.kodeAlat || '',
          namaAsset: li.namaAsset || formData.namaAsset || '',
          namaTool: li.namaAsset || formData.namaAsset || '',
          kategori: li.kategori || formData.kategori || 'Common Tools',
          jobsite: finalJobsite,
          peminjam: formData.peminjam || '',
          section: formData.section || 'Plant Maintenance',
          tglPinjam: formData.tglPinjam || new Date().toISOString().split('T')[0],
          estimasiKembali: formData.estimasiKembali || '',
          tglRencanaKembali: formData.estimasiKembali || '',
          tglRealisasiKembali: formData.tglRealisasiKembali || '',
          status: formData.status || 'Dipinjam',
          kondisiAwal: li.kondisiAwal || formData.kondisiAwal || 'Baik (Ready for Operation)',
          kondisiAkhir: formData.kondisiAkhir || '',
          keperluan: formData.keperluan || '',
          keterangan: formData.keperluan || ''
        };
      });

      onSave(module, items, isEdit);
      onClose();
      return;
    }

    // 2. MULTI-ITEM HANDLING FOR PENGADAAN BARANG (Requirement 2 & 3)
    if (module === 'pengadaan-barang') {
      const items = pengadaanItems.map((pi, idx) => ({
        id: isEdit ? (formData.id || `pgd-${timestamp}`) : `pgd-${timestamp}-${idx}`,
        noPengadaan: formData.noPengadaan || formData.noPoPr,
        noPoPr: formData.noPengadaan || formData.noPoPr,
        jobsite: finalJobsite,
        kategori: pi.kategori || 'Common Tools',
        typeBarang: pi.typeBarang || '',
        noCer: formData.noCer || '',
        partNumber: pi.partNumber || '',
        namaAlat: pi.namaAlat || '',
        deskripsiBarang: pi.namaAlat || '',
        qty: pi.qty || '1',
        tglPengadaan: formData.tglPengadaan || formData.tglPengajuan,
        tglPengajuan: formData.tglPengadaan || formData.tglPengajuan,
        noUr: formData.noUr || '',
        noPr: formData.noPr || '',
        noPo: formData.noPo || '',
        qtyPr: formData.qtyPr || '',
        qtyPo: formData.qtyPo || '',
        qtyGr: formData.qtyGr || '',
        vendor: formData.vendor || formData.supplier || '',
        supplier: formData.vendor || formData.supplier || '',
        totalPrice: formData.totalPrice || formData.estimasiBiaya || '0',
        estimasiBiaya: formData.totalPrice || formData.estimasiBiaya || '0',
        agingDays: formData.agingDays || '0',
        tglSupply: formData.tglSupply || '',
        remarks: formData.remarks || formData.keterangan || '',
        status: formData.status || 'Draft',
        dokumentasi: dokumenPengadaan || formData.dokumentasi || '',
        fileData: dokumenPengadaan
          ? {
              base64: dokumenPengadaan,
              fileName: dokumenPengadaanName || `${formData.noPengadaan || 'PENGADAAN'}.pdf`,
              mimeType: 'application/pdf'
            }
          : undefined
      }));

      onSave(module, items, isEdit);
      onClose();
      return;
    }

    // 3. SINGLE ITEM HANDLING FOR BA KERUSAKAN (Requirement: Hapus Fitur Multi Input)
    if (module === 'ba-kerusakan') {
      const primaryNoReg = formData.noRegister || (damagedItems[0]?.noRegister) || '';
      const primaryNamaAsset = formData.namaAsset || formData.namaAlat || (damagedItems[0]?.namaAsset) || '';
      const primaryBrand = formData.brand || (damagedItems[0]?.brand) || '';
      const primaryTglSupply = formData.tglSupply || (damagedItems[0]?.tglSupply) || '';
      const primaryJenisTools = formData.jenisTools || (damagedItems[0]?.jenisTools) || 'Common Tools';
      const primaryLifeTime = formData.lifeTime || (damagedItems[0]?.lifeTime) || calculateLifeTime(primaryTglSupply, formData.tglKerusakan);

      const item = {
        id: isEdit ? (formData.id || `bak-${timestamp}`) : `bak-${timestamp}`,
        noBa: formData.noBa,
        noOsr: '',
        jenisTools: primaryJenisTools,
        jobsite: finalJobsite,
        noRegister: primaryNoReg,
        namaAsset: primaryNamaAsset,
        namaAlat: primaryNamaAsset,
        brand: primaryBrand,
        tglSupply: primaryTglSupply,
        tglKerusakan: formData.tglKerusakan || formData.tglKejadian || new Date().toISOString().split('T')[0],
        tglKejadian: formData.tglKerusakan || formData.tglKejadian || new Date().toISOString().split('T')[0],
        lifeTime: primaryLifeTime,
        action: formData.action || formData.tindakanKorektif || 'Pergantian Baru',
        tindakanKorektif: formData.action || formData.tindakanKorektif || 'Pergantian Baru',
        status: formData.status || 'Investigasi',
        fotoKerusakan: fotoKerusakan || formData.fotoKerusakan || '',
        dokumentasi: fotoKerusakan || formData.dokumentasi || '',
        kronologi: formData.kronologi || formData.kronologiKerusakan || '',
        kronologiKerusakan: formData.kronologi || formData.kronologiKerusakan || '',
        fileData: fotoKerusakan
          ? {
              base64: fotoKerusakan,
              fileName: fotoKerusakanName || `${formData.noBa || 'BA-KERUSAKAN'}.jpg`,
              mimeType: 'image/jpeg'
            }
          : undefined
      };

      onSave(module, [item], isEdit);
      onClose();
      return;
    }

    // 4. MULTI-ITEM HANDLING FOR BA SERAH TERIMA (Requirement 4 & 5)
    if (module === 'ba-serah-terima') {
      const validAssets = bastAssets.filter(ba => ba.noRegister || ba.namaAsset);
      const itemsToMap = validAssets.length > 0 ? validAssets : bastAssets;

      const items = itemsToMap.map((ba, idx) => ({
        id: isEdit ? (formData.id || `bst-${timestamp}`) : `bst-${timestamp}-${idx}`,
        noBast: formData.noBast,
        jobsite: finalJobsite,
        date: formData.date || new Date().toISOString().split('T')[0],
        tglSerahTerima: formData.date || new Date().toISOString().split('T')[0],
        namaAsset: ba.namaAsset || formData.namaAsset || '',
        noRegister: ba.noRegister || formData.noRegister || '',
        po: ba.po || formData.po || '',
        remarks: ba.remarks || formData.remarks || '',
        keterangan: ba.remarks || formData.remarks || '',
        penerima: formData.penerima || '',
        pihakKedua: formData.penerima || '',
        status: formData.status || 'Draft',
        dokumentasi: dokumenBast || formData.dokumentasi || '',
        fileData: dokumenBast
          ? {
              base64: dokumenBast,
              fileName: dokumenBastName || `${formData.noBast || 'BAST'}.pdf`,
              mimeType: 'application/pdf'
            }
          : undefined
      }));

      onSave(module, items, isEdit);
      onClose();
      return;
    }

    // 5. OSR TOOLS & FACILITY (Requirement 7)
    if (module === 'osr-tools') {
      const finalData = {
        ...formData,
        jobsite: finalJobsite,
        vendor: formData.vendor || '',
        amount: formData.amount || '0',
        status: formData.status || 'Sedang Dikerjakan',
        dokumentasi: fotoOsr || formData.dokumentasi || '',
        fotoKerusakan: fotoOsr || formData.fotoKerusakan || '',
        fileData: fotoOsr
          ? {
              base64: fotoOsr,
              fileName: fotoOsrName || `${formData.noOsr ? formData.noOsr.replace(/[^a-zA-Z0-9_-]/g, '_') : 'OSR'}.jpg`,
              mimeType: 'image/jpeg'
            }
          : undefined
      };
      onSave(module, finalData, isEdit);
      onClose();
      return;
    }

    // Default single item handling for Populasi Asset & Populasi Toolbox
    const finalData = {
      ...formData,
      jobsite: finalJobsite
    };

    onSave(module, finalData, isEdit);
    onClose();
  };

  const getModuleTitle = () => {
    switch (module) {
      case 'populasi-asset': return 'Form Populasi Asset';
      case 'populasi-toolbox': return 'Form Populasi Toolbox';
      case 'peminjaman-tools': return 'Form Peminjaman Tools';
      case 'pengadaan-barang': return 'Form Pengadaan Barang';
      case 'ba-kerusakan': return 'Form BA Kerusakan Alat';
      case 'osr-tools': return 'Form OSR Tools & Facility';
      case 'ba-serah-terima': return 'Form BA Serah Terima';
      default: return 'Formulir Input Data';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      {/* Hidden file and camera inputs for universal attachment support */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleHiddenFileSelected}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        onChange={handleHiddenFileSelected}
        className="hidden"
      />

      <div className="relative w-full max-w-3xl bg-white border border-[#0B4D3B]/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#063D2E] border-b border-[#0B4D3B] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{isEdit ? 'Edit Data' : 'Tambah Data Baru'}:</span>
              <span className="text-emerald-300">{getModuleTitle()}</span>
            </h3>
            <p className="text-xs text-emerald-200/80">
              {isEdit ? 'Perbarui informasi data yang tersimpan' : 'Input data baru dan otomatis sinkronkan ke Google Spreadsheet'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200/80 hover:text-white rounded-lg hover:bg-[#0a4837] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pb-28 overflow-y-auto space-y-4 bg-white text-slate-800">
          {/* Jobsite Selector (HO only can change) */}
          {isHO ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 mb-2">
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                Pilih Jobsite / Lokasi Proyek (Kolom Jobsite)
              </label>
              <select
                value={formData.jobsite || ALL_JOBSITES[0]}
                onChange={(e) => handleChange('jobsite', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                {ALL_JOBSITES.map((site) => (
                  <option key={site} value={site}>
                    {site}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 mb-2">
              <span className="text-xs text-slate-600 font-medium">Jobsite Terkunci:</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200 font-mono">{currentUser.jobsite}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODULE 1: POPULASI ASSET                                       */}
          {/* ============================================================== */}
          {module === 'populasi-asset' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No Registrasi (Kolom A)
                  </label>
                  <input
                    type="text"
                    value={formData.noRegistrasi || ''}
                    onChange={(e) => handleChange('noRegistrasi', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori (Kolom C)
                  </label>
                  <input
                    type="text"
                    value={formData.kategori || 'Common Tools'}
                    onChange={(e) => handleChange('kategori', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="Common Tools / Special Tools"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Asset (Kolom B)
                </label>
                <input
                  type="text"
                  value={formData.namaAsset || ''}
                  onChange={(e) => handleChange('namaAsset', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  placeholder="Contoh: Impact Wrench 1 Inch Heavy Duty"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Merk / Brand (Kolom D)
                  </label>
                  <input
                    type="text"
                    value={formData.merkBrand || ''}
                    onChange={(e) => handleChange('merkBrand', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No PO (Kolom E)
                  </label>
                  <input
                    type="text"
                    value={formData.noPo || ''}
                    onChange={(e) => handleChange('noPo', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tgl Supply (Kolom F)
                  </label>
                  <DateInput
                    value={formData.tglSupply || ''}
                    onChange={(val) => handleChange('tglSupply', val)}
                    placeholder="YYYY-MM-DD / manual"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi Penempatan (Kolom G)
                  </label>
                  <input
                    type="text"
                    value={formData.lokasiPenempatan || ''}
                    onChange={(e) => handleChange('lokasiPenempatan', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="Tool Room / Bay WS / Pit Stop"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kondisi Awal (Kolom I)
                  </label>
                  <select
                    value={formData.kondisiAwal || 'Baik (Ready for Operation)'}
                    onChange={(e) => handleChange('kondisiAwal', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
                  >
                    <option value="Baik (Ready for Operation)">Baik (Ready for Operation)</option>
                    <option value="Rusak Ringan (Minor Defect)">Rusak Ringan (Minor Defect)</option>
                    <option value="Rusak Berat (Non-Operational)">Rusak Berat (Non-Operational)</option>
                    <option value="Sedang Diperbaiki (Maintenance)">Sedang Diperbaiki (Maintenance)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* MODULE 2: POPULASI TOOLBOX                                     */}
          {/* Requirement 6: PIC / Penanggung Jawab dikosongkan secara default */}
          {/* ============================================================== */}
          {module === 'populasi-toolbox' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No Toolbox (Kolom A)
                  </label>
                  <input
                    type="text"
                    value={formData.noToolbox || ''}
                    onChange={(e) => handleChange('noToolbox', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori (Kolom C)
                  </label>
                  <input
                    type="text"
                    value={formData.jenisToolbox || 'Common Tools'}
                    onChange={(e) => handleChange('jenisToolbox', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="Common Tools"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Toolbox (Kolom B)
                </label>
                <input
                  type="text"
                  value={formData.namaToolbox || ''}
                  onChange={(e) => handleChange('namaToolbox', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  placeholder="Contoh: Toolbox Heavy Duty Mechanic 01"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Merk / Brand (Kolom D)
                  </label>
                  <input
                    type="text"
                    value={formData.merkBrand || ''}
                    onChange={(e) => handleChange('merkBrand', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No PO (Kolom E)
                  </label>
                  <input
                    type="text"
                    value={formData.jumlahItem || 'PO'}
                    onChange={(e) => handleChange('jumlahItem', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="PO"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tgl Supply (Kolom F)
                  </label>
                  <DateInput
                    value={formData.tglSupply || ''}
                    onChange={(val) => handleChange('tglSupply', val)}
                    placeholder="YYYY-MM-DD / manual"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kondisi (Kolom I)
                  </label>
                  <input
                    type="text"
                    value={formData.kondisi || 'Lengkap & Baik'}
                    onChange={(e) => handleChange('kondisi', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi Penempatan (Kolom G)
                  </label>
                  <input
                    type="text"
                    value={formData.lokasiPenempatan || ''}
                    onChange={(e) => handleChange('lokasiPenempatan', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIC / Penanggung Jawab (Kolom J)
                  </label>
                  <input
                    type="text"
                    value={formData.pic || ''}
                    onChange={(e) => handleChange('pic', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="Contoh: Ucupxyz"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan (Kolom K)
                </label>
                <input
                  type="text"
                  value={formData.keterangan || ''}
                  onChange={(e) => handleChange('keterangan', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  placeholder="Keterangan tambahan..."
                />
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* MODULE 3: PEMINJAMAN TOOLS                                     */}
          {/* Requirement 1: Multi-input alat dari Populasi Asset             */}
          {/* Requirement 6: Peminjam dikosongkan secara default              */}
          {/* Requirement: Format LOAN-(JOBSITE)-(NOMOR URUT) berurutan       */}
          {/* ============================================================== */}
          {module === 'peminjaman-tools' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>ID Peminjaman Awal (Kolom A)</span>
                    <span className="text-[10px] text-emerald-700 font-mono">Format: LOAN-{getJobsiteShortCode(activeJobsite)}-XXXX</span>
                  </label>
                  <input
                    type="text"
                    value={formData.idPeminjaman || formData.noPeminjaman || ''}
                    onChange={(e) => {
                      handleChange('idPeminjaman', e.target.value);
                      handleChange('noPeminjaman', e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status (Kolom K)
                  </label>
                  <select
                    value={formData.status || 'Dipinjam'}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
                  >
                    <option value="Dipinjam">Dipinjam</option>
                    <option value="Kembali">Kembali</option>
                    <option value="Terlambat">Terlambat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peminjam (Kolom F)
                  </label>
                  <input
                    type="text"
                    value={formData.peminjam || ''}
                    onChange={(e) => handleChange('peminjam', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="Nama Lengkap Peminjam"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Section / Departemen (Kolom G)
                  </label>
                  <input
                    type="text"
                    value={formData.section || 'Plant Maintenance'}
                    onChange={(e) => handleChange('section', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tgl Pinjam (Kolom H)
                  </label>
                  <DateInput
                    value={formData.tglPinjam || ''}
                    onChange={(val) => handleChange('tglPinjam', val)}
                    placeholder="YYYY-MM-DD / manual"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimasi Kembali (Kolom I)
                  </label>
                  <DateInput
                    value={formData.estimasiKembali || ''}
                    onChange={(val) => handleChange('estimasiKembali', val)}
                    placeholder="YYYY-MM-DD / manual"
                    required
                  />
                </div>
              </div>

              {/* Kolom J & Kolom M Realisasi Pengembalian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Tgl Realisasi Kembali (Kolom J)</span>
                    <span className="text-[10px] text-emerald-700 font-mono">Bisa manual/kalender</span>
                  </label>
                  <DateInput
                    value={formData.tglRealisasiKembali || ''}
                    onChange={(val) => handleChange('tglRealisasiKembali', val)}
                    placeholder="YYYY-MM-DD / kosongkan jika belum kembali"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Kondisi Akhir (Kolom M)</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Pilihan Wajib</span>
                  </label>
                  <select
                    value={formData.kondisiAkhir || ''}
                    onChange={(e) => {
                      handleChange('kondisiAkhir', e.target.value);
                      if (e.target.value && (!formData.status || formData.status === 'Dipinjam')) {
                        handleChange('status', 'Kembali');
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
                  >
                    <option value="">-- Belum Dikembalikan --</option>
                    <option value="Baik (Ready for Operation)">Baik (Ready for Operation)</option>
                    <option value="Rusak Ringan (Minor Defect)">Rusak Ringan (Minor Defect)</option>
                    <option value="Rusak Berat (Non-Operational)">Rusak Berat (Non-Operational)</option>
                  </select>
                </div>
              </div>

              {/* Peringatan otomatis jika kondisi akhir rusak */}
              {formData.kondisiAkhir && (formData.kondisiAkhir.includes('Rusak') || formData.kondisiAkhir.includes('Defect') || formData.kondisiAkhir.includes('Non-Operational')) && (
                <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-400 flex items-start gap-2.5 text-xs text-amber-950 animate-in fade-in slide-in-from-top-1 shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block">Peringatan Kondisi Akhir Rusak (Kolom M):</span>
                    Alat dikembalikan dengan kondisi rusak ({formData.kondisiAkhir}). Pengguna disarankan untuk mempertimbangkan pembuatan <b>Berita Acara Kerusakan (BA Kerusakan)</b> di modul BA Kerusakan.
                  </div>
                </div>
              )}

              {/* Multi-Tool Loan Selection (Requirement 1) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-emerald-800">
                    Daftar Alat yang Dipinjam ({loanedItems.length} Alat Terpilih)
                  </span>
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => setLoanedItems([...loanedItems, { kodeAlat: '', namaAsset: '', kategori: 'Common Tools', kondisiAwal: 'Baik (Ready for Operation)' }])}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold cursor-pointer border border-emerald-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Pilihan Alat</span>
                    </button>
                  )}
                </div>

                {loanedItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 font-mono">
                        Alat #{idx + 1} &bull; ID: {getNextLoanIdWithOffset(activeJobsite, StorageService.getPeminjaman(), idx)}
                      </span>
                      {loanedItems.length > 1 && !isEdit && (
                        <button
                          type="button"
                          onClick={() => setLoanedItems(loanedItems.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Quick selector from Populasi Asset */}
                    <div>
                      <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                        Pilih dari Populasi Asset ({activeJobsite})
                      </label>
                      <select
                        onChange={(e) => {
                          const selected = siteAssets.find(a => a.noRegistrasi === e.target.value);
                          if (selected) {
                            const copy = [...loanedItems];
                            copy[idx].kodeAlat = selected.noRegistrasi;
                            copy[idx].namaAsset = selected.namaAsset;
                            copy[idx].kategori = selected.kategori || 'Common Tools';
                            copy[idx].kondisiAwal = selected.kondisiAwal || 'Baik (Ready for Operation)';
                            setLoanedItems(copy);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        defaultValue=""
                      >
                        <option value="">-- Pilih Alat dari Populasi Asset --</option>
                        {siteAssets.map((asset) => (
                          <option key={asset.id || asset.noRegistrasi} value={asset.noRegistrasi}>
                            [{asset.noRegistrasi}] {asset.namaAsset} ({asset.kategori})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Kode Alat (Kolom B)</label>
                        <input
                          type="text"
                          value={item.kodeAlat}
                          onChange={(e) => {
                            const copy = [...loanedItems];
                            copy[idx].kodeAlat = e.target.value;
                            setLoanedItems(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="No Registrasi"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Nama Asset (Kolom C)</label>
                        <input
                          type="text"
                          value={item.namaAsset}
                          onChange={(e) => {
                            const copy = [...loanedItems];
                            copy[idx].namaAsset = e.target.value;
                            setLoanedItems(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Nama Alat"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Kategori (Kolom D)</label>
                        <input
                          type="text"
                          value={item.kategori}
                          onChange={(e) => {
                            const copy = [...loanedItems];
                            copy[idx].kategori = e.target.value;
                            setLoanedItems(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Kondisi Awal (Kolom L)</label>
                        <input
                          type="text"
                          value={item.kondisiAwal}
                          onChange={(e) => {
                            const copy = [...loanedItems];
                            copy[idx].kondisiAwal = e.target.value;
                            setLoanedItems(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keperluan Pinjam (Kolom N)
                </label>
                <input
                  type="text"
                  value={formData.keperluan || ''}
                  onChange={(e) => handleChange('keperluan', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  placeholder="Untuk pekerjaan maintenance unit..."
                />
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* MODULE 4: PENGADAAN BARANG                                     */}
          {/* ============================================================== */}
          {module === 'pengadaan-barang' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>No Pengadaan (Kolom A)</span>
                    <span className="text-[10px] text-emerald-700 font-mono">Format: …/PLANT/(SITE)/TOOLSREQ/(MM)/(YYYY)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.noPengadaan || formData.noPoPr || ''}
                    onChange={(e) => {
                      handleChange('noPengadaan', e.target.value);
                      handleChange('noPoPr', e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="001/PLANT/GAM/TOOLSREQ/10/2026"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No UR (Kolom J)
                  </label>
                  <input
                    type="text"
                    value={formData.noUr || ''}
                    onChange={(e) => handleChange('noUr', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="Contoh: UR-1002"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No CER (Kolom E)
                  </label>
                  <input
                    type="text"
                    value={formData.noCer || ''}
                    onChange={(e) => handleChange('noCer', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="CER-..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tgl Pengadaan (Kolom I)
                  </label>
                  <DateInput
                    value={formData.tglPengadaan || formData.tglPengajuan || ''}
                    onChange={(val) => {
                      handleChange('tglPengadaan', val);
                      handleChange('tglPengajuan', val);
                    }}
                    placeholder="YYYY-MM-DD / manual"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tgl Supply (Kolom S)
                  </label>
                  <DateInput
                    value={formData.tglSupply || ''}
                    onChange={(val) => handleChange('tglSupply', val)}
                    placeholder="YYYY-MM-DD / manual"
                  />
                </div>
              </div>

              {/* Dynamic Multiple Items List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-emerald-800">
                    Daftar Permintaan Item ({pengadaanItems.length} Item)
                  </span>
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => setPengadaanItems([...pengadaanItems, { kategori: 'Common Tools', typeBarang: '', partNumber: '', namaAlat: '', qty: '1' }])}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold cursor-pointer border border-emerald-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Item Baru</span>
                    </button>
                  )}
                </div>

                {pengadaanItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 font-mono">
                        Item #{idx + 1}
                      </span>
                      {pengadaanItems.length > 1 && !isEdit && (
                        <button
                          type="button"
                          onClick={() => setPengadaanItems(pengadaanItems.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Nama Alat (Kolom G)</label>
                        <input
                          type="text"
                          value={item.namaAlat}
                          onChange={(e) => {
                            const copy = [...pengadaanItems];
                            copy[idx].namaAlat = e.target.value;
                            setPengadaanItems(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Nama alat yang diminta"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Part Number (Kolom F)</label>
                        <input
                          type="text"
                          value={item.partNumber}
                          onChange={(e) => {
                            const copy = [...pengadaanItems];
                            copy[idx].partNumber = e.target.value;
                            setPengadaanItems(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Part Number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Kategori (Kolom C)</label>
                        <input
                          type="text"
                          value={item.kategori}
                          onChange={(e) => {
                            const copy = [...pengadaanItems];
                            copy[idx].kategori = e.target.value;
                            setPengadaanItems(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Type (Kolom D)</label>
                        <select
                          value={item.typeBarang || 'Pengadaan Baru'}
                          onChange={(e) => {
                            const copy = [...pengadaanItems];
                            copy[idx].typeBarang = e.target.value;
                            setPengadaanItems(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="Pengadaan Baru">Pengadaan Baru</option>
                          <option value="Pergantian Tools Rusak">Pergantian Tools Rusak</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Qty (Kolom H)</label>
                        <input
                          type="text"
                          value={item.qty}
                          onChange={(e) => {
                            const copy = [...pengadaanItems];
                            copy[idx].qty = e.target.value;
                            setPengadaanItems(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Contoh: 2 Unit"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lampiran Dokumen Pengadaan (Kolom V) with Dual Camera / File Upload */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Lampiran Dokumen Pengadaan (Kolom V)</span>
                  <span className="text-[10px] text-emerald-700 font-mono">Tersimpan ke GDrive Pengadaan</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTriggerUpload('pengadaan', true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer border border-slate-300 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Ambil Foto (Kamera)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerUpload('pengadaan', false)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer border border-slate-300 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Pilih File / Dokumen</span>
                  </button>
                  {dokumenPengadaan && (
                    <button
                      type="button"
                      onClick={() => {
                        setDokumenPengadaan('');
                        setDokumenPengadaanName('');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 cursor-pointer px-2"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                {dokumenPengadaanName && (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>File siap diunggah: {dokumenPengadaanName}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* MODULE 5: BA KERUSAKAN ALAT                                    */}
          {/* ============================================================== */}
          {module === 'ba-kerusakan' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>No Berita Acara (Kolom A)</span>
                    <span className="text-[10px] text-emerald-700 font-mono">Format: …/BAK-TOOL/(SITE)/(MM)/(YYYY)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.noBa || ''}
                    onChange={(e) => handleChange('noBa', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="001/BAK-TOOL/GAM/10/2026"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tgl Kerusakan (Kolom I)
                  </label>
                  <DateInput
                    value={formData.tglKerusakan || formData.tglKejadian || ''}
                    onChange={(val) => {
                      handleChange('tglKerusakan', val);
                      handleChange('tglKejadian', val);
                      if (formData.tglSupply) {
                        handleChange('lifeTime', calculateLifeTime(formData.tglSupply, val));
                      }
                    }}
                    placeholder="YYYY-MM-DD / manual"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Action (Kolom K)</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Dropdown Pilihan Wajib</span>
                </label>
                <select
                  value={formData.action || 'Pergantian Baru'}
                  onChange={(e) => {
                    handleChange('action', e.target.value);
                    handleChange('tindakanKorektif', e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
                >
                  <option value="Pergantian Baru">Pergantian Baru</option>
                  <option value="Out Site Repair">Out Site Repair</option>
                  <option value="In Site Repair">In Site Repair</option>
                </select>
              </div>

              {/* Selector Alat dari Populasi Asset */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Pilih Alat dari Populasi Asset ({activeJobsite})
                </label>
                <select
                  onChange={(e) => {
                    const sel = siteAssets.find(a => a.noRegistrasi === e.target.value);
                    if (sel) {
                      handleChange('noRegister', sel.noRegistrasi);
                      handleChange('namaAsset', sel.namaAsset);
                      handleChange('namaAlat', sel.namaAsset);
                      handleChange('brand', sel.merkBrand || '');
                      handleChange('tglSupply', sel.tglSupply || '');
                      handleChange('jenisTools', sel.kategori || 'Common Tools');
                      handleChange('lifeTime', calculateLifeTime(sel.tglSupply, formData.tglKerusakan || new Date().toISOString()));
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
                  defaultValue=""
                >
                  <option value="">-- Pilih Alat dari Populasi Asset --</option>
                  {siteAssets.map((asset) => (
                    <option key={asset.id || asset.noRegistrasi} value={asset.noRegistrasi}>
                      [{asset.noRegistrasi}] {asset.namaAsset} - {asset.merkBrand}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No Register (Kolom E)
                  </label>
                  <input
                    type="text"
                    value={formData.noRegister || (damagedItems[0]?.noRegister) || ''}
                    onChange={(e) => {
                      handleChange('noRegister', e.target.value);
                      if (damagedItems[0]) {
                        const copy = [...damagedItems];
                        copy[0].noRegister = e.target.value;
                        setDamagedItems(copy);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="No Registrasi Asset"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Asset (Kolom F)
                  </label>
                  <input
                    type="text"
                    value={formData.namaAsset || formData.namaAlat || (damagedItems[0]?.namaAsset) || ''}
                    onChange={(e) => {
                      handleChange('namaAsset', e.target.value);
                      handleChange('namaAlat', e.target.value);
                      if (damagedItems[0]) {
                        const copy = [...damagedItems];
                        copy[0].namaAsset = e.target.value;
                        setDamagedItems(copy);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="Nama Asset / Alat"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Brand (Kolom G)
                  </label>
                  <input
                    type="text"
                    value={formData.brand || (damagedItems[0]?.brand) || ''}
                    onChange={(e) => {
                      handleChange('brand', e.target.value);
                      if (damagedItems[0]) {
                        const copy = [...damagedItems];
                        copy[0].brand = e.target.value;
                        setDamagedItems(copy);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="Merk / Brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tgl Supply (Kolom H)
                  </label>
                  <DateInput
                    value={formData.tglSupply || (damagedItems[0]?.tglSupply) || ''}
                    onChange={(val) => {
                      handleChange('tglSupply', val);
                      handleChange('lifeTime', calculateLifeTime(val, formData.tglKerusakan || new Date().toISOString()));
                      if (damagedItems[0]) {
                        const copy = [...damagedItems];
                        copy[0].tglSupply = val;
                        copy[0].lifeTime = calculateLifeTime(val, formData.tglKerusakan || new Date().toISOString());
                        setDamagedItems(copy);
                      }
                    }}
                    placeholder="YYYY-MM-DD / manual"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Life Time (Kolom J)
                  </label>
                  <input
                    type="text"
                    value={formData.lifeTime || (damagedItems[0]?.lifeTime) || ''}
                    onChange={(e) => {
                      handleChange('lifeTime', e.target.value);
                      if (damagedItems[0]) {
                        const copy = [...damagedItems];
                        copy[0].lifeTime = e.target.value;
                        setDamagedItems(copy);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="Otomatis dihitung"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Kronologi & Sebab Kerusakan (Kolom N)</span>
                  <span className="text-[10px] text-amber-700 font-medium">Penjelasan Lengkap Kerusakan Alat / Facility</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.kronologi || formData.kronologiKerusakan || ''}
                  onChange={(e) => {
                    handleChange('kronologi', e.target.value);
                    handleChange('kronologiKerusakan', e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  placeholder="Jelaskan secara mendalam kronologi kejadian, indikasi penyebab kerusakan, serta dampaknya terhadap unit operasional..."
                  required
                />
              </div>

              {/* Lampiran Foto Alat Rusak (Kolom M) with Dual Camera / File Upload */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Lampiran Foto Alat Rusak (Kolom M)</span>
                  <span className="text-[10px] text-emerald-700 font-mono">Tersimpan ke GDrive BA Kerusakan</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTriggerUpload('kerusakan', true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer border border-slate-300 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Ambil Foto (Kamera)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerUpload('kerusakan', false)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer border border-slate-300 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Pilih File Gambar</span>
                  </button>
                  {fotoKerusakan && (
                    <button
                      type="button"
                      onClick={() => {
                        setFotoKerusakan('');
                        setFotoKerusakanName('');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 cursor-pointer px-2"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
                {fotoKerusakan && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={fotoKerusakan}
                      alt="Preview Kerusakan"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-xs"
                    />
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Foto siap dilampirkan: {fotoKerusakanName || 'foto-kerusakan.jpg'}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* MODULE 6: OSR TOOLS & FACILITY                                 */}
          {/* Requirement 7: Lampiran Foto Alat Rusak (Kolom O)              */}
          {/* ============================================================== */}
          {module === 'osr-tools' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No OSR (Kolom A)
                  </label>
                  <input
                    type="text"
                    value={formData.noOsr || ''}
                    onChange={(e) => handleChange('noOsr', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date OSR (Kolom C)
                  </label>
                  <DateInput
                    value={formData.dateOsr || formData.tglKirim || ''}
                    onChange={(val) => {
                      handleChange('dateOsr', val);
                      handleChange('tglKirim', val);
                    }}
                    placeholder="YYYY-MM-DD / manual"
                  />
                </div>
              </div>

              {/* Selector from Populasi Asset */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Pilih Alat dari Populasi Asset ({activeJobsite})
                </label>
                <select
                  onChange={(e) => {
                    const sel = siteAssets.find(a => a.noRegistrasi === e.target.value);
                    if (sel) {
                      handleChange('noRegistrasi', sel.noRegistrasi);
                      handleChange('namaAsset', sel.namaAsset);
                      handleChange('namaTool', sel.namaAsset);
                      if (sel.tglSupply) handleChange('tglSupply', sel.tglSupply);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
                  defaultValue=""
                >
                  <option value="">-- Pilih Alat dari Populasi Asset --</option>
                  {siteAssets.map((asset) => (
                    <option key={asset.id || asset.noRegistrasi} value={asset.noRegistrasi}>
                      [{asset.noRegistrasi}] {asset.namaAsset}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No Registrasi (Kolom D)
                  </label>
                  <input
                    type="text"
                    value={formData.noRegistrasi || ''}
                    onChange={(e) => handleChange('noRegistrasi', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Asset (Kolom E)
                  </label>
                  <input
                    type="text"
                    value={formData.namaAsset || formData.namaTool || ''}
                    onChange={(e) => {
                      handleChange('namaAsset', e.target.value);
                      handleChange('namaTool', e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Kerusakan (Kolom F)
                </label>
                <textarea
                  value={formData.keteranganKerusakan || ''}
                  onChange={(e) => handleChange('keteranganKerusakan', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  placeholder="Detail kendala / kerusakan alat..."
                  required
                />
              </div>

              {/* Lampiran Foto Alat Rusak OSR (Kolom O) - Requirement 7 & 8 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Lampiran Foto/Gambar Alat Rusak OSR (Kolom O)</span>
                  <span className="text-[10px] text-emerald-700 font-mono">Folder GDrive: 117QSUo3_wux9S4_2GvX528Fi6HqLTtjV</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTriggerUpload('osr', true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer border border-slate-300 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Ambil Foto (Kamera)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerUpload('osr', false)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer border border-slate-300 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Pilih File Gambar</span>
                  </button>
                  {fotoOsr && (
                    <button
                      type="button"
                      onClick={() => {
                        setFotoOsr('');
                        setFotoOsrName('');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 cursor-pointer px-2"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
                {fotoOsr && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={fotoOsr}
                      alt="Preview OSR"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-xs"
                    />
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Foto OSR siap diunggah: {fotoOsrName || 'foto-osr.jpg'}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* MODULE 7: BA SERAH TERIMA                                      */}
          {/* Requirement 4: Multi-input alat dari Populasi Asset             */}
          {/* Requirement 6: Penerima dikosongkan secara default              */}
          {/* ============================================================== */}
          {module === 'ba-serah-terima' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No Bast (Kolom A)
                  </label>
                  <input
                    type="text"
                    value={formData.noBast || ''}
                    onChange={(e) => handleChange('noBast', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date (Kolom C)
                  </label>
                  <DateInput
                    value={formData.date || formData.tglSerahTerima || ''}
                    onChange={(val) => {
                      handleChange('date', val);
                      handleChange('tglSerahTerima', val);
                    }}
                    placeholder="YYYY-MM-DD / manual"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penerima di Jobsite (Kolom H)
                  </label>
                  <input
                    type="text"
                    value={formData.penerima || formData.pihakKedua || ''}
                    onChange={(e) => {
                      handleChange('penerima', e.target.value);
                      handleChange('pihakKedua', e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    placeholder="Nama Lengkap Penerima"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status (Kolom I)
                  </label>
                  <select
                    value={formData.status || 'Draft'}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Ditandatangani">Ditandatangani</option>
                    <option value="Terverifikasi HO">Terverifikasi HO</option>
                  </select>
                </div>
              </div>

              {/* Multi-Asset Selector for BAST (Requirement 4) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-emerald-800">
                    Daftar Asset yang Diserahterimakan ({bastAssets.length} Asset)
                  </span>
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => setBastAssets([...bastAssets, { noRegister: '', namaAsset: '', po: '', remarks: '' }])}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold cursor-pointer border border-emerald-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Asset</span>
                    </button>
                  )}
                </div>

                {bastAssets.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 font-mono">
                        Asset #{idx + 1}
                      </span>
                      {bastAssets.length > 1 && !isEdit && (
                        <button
                          type="button"
                          onClick={() => setBastAssets(bastAssets.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Quick selector from Populasi Asset */}
                    <div>
                      <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                        Pilih dari Populasi Asset ({activeJobsite})
                      </label>
                      <select
                        onChange={(e) => {
                          const selected = siteAssets.find(a => a.noRegistrasi === e.target.value);
                          if (selected) {
                            const copy = [...bastAssets];
                            copy[idx].noRegister = selected.noRegistrasi;
                            copy[idx].namaAsset = selected.namaAsset;
                            if (selected.noPo) copy[idx].po = selected.noPo;
                            setBastAssets(copy);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        defaultValue=""
                      >
                        <option value="">-- Pilih Alat dari Populasi Asset --</option>
                        {siteAssets.map((asset) => (
                          <option key={asset.id || asset.noRegistrasi} value={asset.noRegistrasi}>
                            [{asset.noRegistrasi}] {asset.namaAsset}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">No Register (Kolom G)</label>
                        <input
                          type="text"
                          value={item.noRegister}
                          onChange={(e) => {
                            const copy = [...bastAssets];
                            copy[idx].noRegister = e.target.value;
                            setBastAssets(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="No Registrasi Asset"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Nama Asset (Kolom D)</label>
                        <input
                          type="text"
                          value={item.namaAsset}
                          onChange={(e) => {
                            const copy = [...bastAssets];
                            copy[idx].namaAsset = e.target.value;
                            setBastAssets(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Nama Asset"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">PO (Kolom E)</label>
                      <input
                        type="text"
                        value={item.po}
                        onChange={(e) => {
                          const copy = [...bastAssets];
                          copy[idx].po = e.target.value;
                          setBastAssets(copy);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="No PO"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Remarks / Keterangan (Kolom F)
                </label>
                <textarea
                  value={formData.remarks || formData.keterangan || ''}
                  onChange={(e) => {
                    handleChange('remarks', e.target.value);
                    handleChange('keterangan', e.target.value);
                  }}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  placeholder="Kondisi asset diserahterimakan..."
                />
              </div>

              {/* Lampiran Dokumen BAST (Kolom J) with Dual Camera / File Upload */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Lampiran Dokumen BAST (Kolom J)</span>
                  <span className="text-[10px] text-emerald-700 font-mono">Tersimpan ke GDrive BAST</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTriggerUpload('bast', true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer border border-slate-300 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Ambil Foto (Kamera)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerUpload('bast', false)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer border border-slate-300 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Pilih File PDF / Scan</span>
                  </button>
                  {dokumenBast && (
                    <button
                      type="button"
                      onClick={() => {
                        setDokumenBast('');
                        setDokumenBastName('');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 cursor-pointer px-2"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                {dokumenBastName && (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dokumen siap diunggah: {dokumenBastName}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur py-3 px-6 -mx-6 -mb-6 shadow-md z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-300 shadow-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
