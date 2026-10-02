import { useState, useMemo } from 'react';
import { SheetModule, User } from '../types';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  Download,
  Filter,
  Lock,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  RotateCcw
} from 'lucide-react';

interface ColumnDef {
  key: string;
  header: string;
  isJobsiteColumn?: boolean;
  render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  module: SheetModule;
  title: string;
  description: string;
  data: any[];
  columns: ColumnDef[];
  currentUser: User;
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onView?: (item: any) => void;
  onReturn?: (item: any) => void;
  onManualSync?: () => void;
  isSyncing?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  title,
  description,
  data,
  columns,
  currentUser,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onReturn,
  onManualSync,
  isSyncing
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const canDelete = currentUser.role === 'ho' || currentUser.jobsite === 'HO - Balikpapan';

  // Filter options from data
  const categories = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => {
      if (d.kategori) set.add(d.kategori);
      if (d.jenisToolbox) set.add(d.jenisToolbox);
      if (d.jenisTools) set.add(d.jenisTools);
    });
    return Array.from(set);
  }, [data]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => {
      if (d.status) set.add(d.status);
      if (d.kondisiAwal) set.add(d.kondisiAwal);
      if (d.kondisi) set.add(d.kondisi);
    });
    return Array.from(set);
  }, [data]);

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const term = searchTerm.toLowerCase();
      // Search across all text fields
      const matchesSearch = Object.values(row).some((val) =>
        String(val).toLowerCase().includes(term)
      );

      // Category filter
      let matchesCategory = true;
      if (selectedCategory !== 'ALL') {
        matchesCategory =
          row.kategori === selectedCategory || row.jenisToolbox === selectedCategory;
      }

      // Status filter
      let matchesStatus = true;
      if (selectedStatus !== 'ALL') {
        matchesStatus =
          row.status === selectedStatus ||
          row.kondisiAwal === selectedStatus ||
          row.kondisi === selectedStatus;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [data, searchTerm, selectedCategory, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Export CSV
  const handleExportCsv = () => {
    if (data.length === 0) return;
    const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');
    const rows = filteredData.map((row) => {
      return columns
        .map((col) => {
          const val = row[col.key] || '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {title}
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {filteredData.length} Baris Data
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onManualSync && (
            <button
              type="button"
              onClick={onManualSync}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              title="Sinkronkan dengan Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Sheets</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Download CSV Sesuai Format Spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={onAdd}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Manual</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari no reg, nama alat, brand, serial, PIC..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {categories.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {statuses.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Status/Kondisi</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value={10}>10 / hal</option>
            <option value={15}>15 / hal</option>
            <option value={25}>25 / hal</option>
            <option value={50}>50 / hal</option>
            <option value={100}>100 / hal</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#063D2E] text-white font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-3.5 w-12 text-center text-emerald-200">No</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-3.5 px-3.5 whitespace-nowrap ${
                      col.isJobsiteColumn ? 'text-emerald-200 font-bold bg-[#04281E]' : ''
                    }`}
                  >
                    {col.header}
                    {col.isJobsiteColumn && (
                      <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        Filter Key
                      </span>
                    )}
                  </th>
                ))}
                <th className="py-3.5 px-3.5 text-right w-24 text-emerald-200">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((row, idx) => {
                const rowIndex = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr key={row.id || idx} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-2.5 px-3.5 text-center text-slate-400 font-mono font-medium">
                      {rowIndex}
                    </td>
                    {columns.map((col) => {
                      if (col.render) {
                        return (
                          <td key={col.key} className="py-2.5 px-3.5 whitespace-nowrap">
                            {col.render(row)}
                          </td>
                        );
                      }

                      const val = row[col.key];
                      const isJobsite = col.isJobsiteColumn;

                      return (
                        <td
                          key={col.key}
                          className={`py-2.5 px-3.5 max-w-xs truncate ${
                            isJobsite ? 'font-bold text-emerald-800 bg-emerald-50/40' : 'text-slate-800'
                          }`}
                          title={String(val || '')}
                        >
                          {val || '-'}
                        </td>
                      );
                    })}

                    {/* Actions Column */}
                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {onReturn && (
                          <button
                            type="button"
                            onClick={() => onReturn(row)}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                              row.status === 'Kembali'
                                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-600 text-white'
                            }`}
                            title={row.status === 'Kembali' ? 'Alat Sudah Kembali (Klik untuk perbarui data)' : 'Kembalikan Alat ke Tool Room'}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{row.status === 'Kembali' ? 'Kembali' : 'Kembalikan'}</span>
                          </button>
                        )}

                        {onView && (
                          <button
                            type="button"
                            onClick={() => onView(row)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition-colors cursor-pointer"
                            title="Lihat Seluruh Data (Detail View)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 transition-colors cursor-pointer"
                          title="Edit Data"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button: Available ONLY for HO - Balikpapan */}
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => onDelete(row)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-colors cursor-pointer"
                            title="Hapus Data (HO Only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                            title="Hanya user 'HO - Balikpapan' yang berhak menghapus data"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 2} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600">Tidak ada data yang sesuai filter / pencarian.</p>
                    <p className="text-xs mt-1 text-slate-500">
                      Klik "Tambah Data Manual" untuk memasukkan item baru.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 text-xs">
          <div className="text-slate-600">
            Menampilkan <span className="font-semibold text-slate-900">{filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> s/d{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </span>{' '}
            dari <span className="font-bold text-emerald-800">{filteredData.length}</span> total baris
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono font-medium text-slate-700">
              Hal {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
