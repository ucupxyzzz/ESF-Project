import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, Check, X, RotateCcw } from 'lucide-react';

export interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

/**
 * Parsing tanggal dari berbagai format (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
 */
function parseDateString(str: string): Date | null {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (!isNaN(date.getTime())) return date;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(/[/-]/).map(Number);
    const date = new Date(parts[2], parts[1] - 1, parts[0]);
    if (!isNaN(date.getTime())) return date;
  }

  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function formatDateToIso(year: number, monthZeroIndexed: number, day: number): string {
  const y = year.toString();
  const m = (monthZeroIndexed + 1).toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Komponen DateInput yang Handal & PASTI MUNCUL di Semua Modul:
 * 1. Menampilkan input teks yang dapat diketik secara manual.
 * 2. Menampilkan tombol ikon kalender di sebelah kanan input.
 * 3. Menggunakan React Portal (document.body) untuk pop-up kalender sehingga TIDAK PERNAH terpotong
 *    oleh modal dialog yang memiliki styling overflow-hidden / overflow-y-auto.
 * 4. Mendukung pemilih 1-klik untuk Hari Ini, Besok, atau klik tanggal di kalender.
 */
export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  placeholder = 'YYYY-MM-DD atau DD/MM/YYYY',
  className = '',
  required = false,
  disabled = false,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const nativeDateRef = useRef<HTMLInputElement>(null);

  // Posisi popup fixed di viewport
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
    width: number;
    placeAbove: boolean;
  }>({
    top: 0,
    left: 0,
    width: 300,
    placeAbove: false
  });

  // State tampilan kalender (bulan & tahun)
  const initialDate = parseDateString(value) || new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Sinkronisasi view tahun & bulan jika value berubah
  useEffect(() => {
    const parsed = parseDateString(value);
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [value]);

  // Hitung posisi fixed popover agar selalu presisi di dekat input
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(320, window.innerWidth - 20);
    const popoverHeight = 350;

    // Horizontal position: sejajar sisi kiri input, tapi jangan lewat batas kanan layar
    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 12) {
      left = window.innerWidth - popoverWidth - 12;
    }
    if (left < 10) left = 10;

    // Vertical position: taruh di bawah input jika muat, jika mepet bawah taruh di atas input
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceBelow < popoverHeight && rect.top > popoverHeight;
    const top = placeAbove
      ? Math.max(10, rect.top - popoverHeight - 6)
      : Math.min(window.innerHeight - popoverHeight - 10, rect.bottom + 6);

    setPopoverPos({
      top,
      left,
      width: popoverWidth,
      placeAbove
    });
  }, []);

  // Update posisi saat terbuka
  useEffect(() => {
    if (isOpen) {
      updatePosition();

      const handleScrollOrResize = () => {
        updatePosition();
      };

      window.addEventListener('resize', handleScrollOrResize);
      window.addEventListener('scroll', handleScrollOrResize, true);

      return () => {
        window.removeEventListener('resize', handleScrollOrResize);
        window.removeEventListener('scroll', handleScrollOrResize, true);
      };
    }
  }, [isOpen, updatePosition]);

  // Tutup saat klik di luar kontainer & popup
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleCalendar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (!isOpen) {
      const parsed = parseDateString(value) || new Date();
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const isoString = formatDateToIso(viewYear, viewMonth, day);
    onChange(isoString);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = new Date();
    const isoString = formatDateToIso(now.getFullYear(), now.getMonth(), now.getDate());
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onChange(isoString);
    setIsOpen(false);
  };

  const handleSelectTomorrow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isoString = formatDateToIso(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    setViewYear(tomorrow.getFullYear());
    setViewMonth(tomorrow.getMonth());
    onChange(isoString);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // Helper kalender
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Minggu
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const parsedCurrent = parseDateString(value);
  const isSelectedDate = (day: number) => {
    if (!parsedCurrent) return false;
    return (
      parsedCurrent.getFullYear() === viewYear &&
      parsedCurrent.getMonth() === viewMonth &&
      parsedCurrent.getDate() === day
    );
  };

  const today = new Date();
  const isTodayDate = (day: number) => {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  // Daftar opsi tahun dari 2015 sampai 2035
  const yearOptions: number[] = [];
  for (let y = 2015; y <= 2035; y++) {
    yearOptions.push(y);
  }

  // Pop-up kalender yang dirender menggunakan React Portal ke document.body
  const calendarPopover = isOpen ? (
    createPortal(
      <div
        ref={popoverRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: `${popoverPos.top}px`,
          left: `${popoverPos.left}px`,
          width: `${popoverPos.width}px`,
          zIndex: 999999
        }}
        className="bg-white border-2 border-emerald-600 rounded-2xl shadow-2xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 text-slate-800 select-none pointer-events-auto"
      >
        {/* Header Kalender: Navigasi Bulan & Tahun */}
        <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 flex-1 justify-center">
            {/* Dropdown Bulan */}
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2 py-1 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            {/* Dropdown Tahun */}
            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2 py-1 font-mono font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Header Nama Hari */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {DAY_NAMES.map((day, idx) => (
            <span
              key={day}
              className={`text-[10px] font-bold py-0.5 ${
                idx === 0 ? 'text-rose-500' : 'text-slate-500'
              }`}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Grid Tanggal */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {/* Hari dari bulan sebelumnya */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
            const prevDay = daysInPrevMonth - firstDayOfWeek + idx + 1;
            return (
              <div
                key={`prev-${idx}`}
                className="p-1.5 text-center text-slate-300 text-[11px] font-mono select-none"
              >
                {prevDay}
              </div>
            );
          })}

          {/* Hari di bulan ini */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const isSelected = isSelectedDate(day);
            const isToday = isTodayDate(day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleSelectDay(day)}
                className={`p-1.5 rounded-xl text-center text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500'
                    : isToday
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-500 font-bold hover:bg-emerald-100'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Footer: Tombol Cepat (Hari Ini, Besok, Kosongkan, Tutup) */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSelectToday}
              className="px-2 py-1 rounded-lg bg-emerald-100/70 hover:bg-emerald-200 text-emerald-800 font-bold transition flex items-center gap-1 cursor-pointer border border-emerald-300"
              title="Pilih Tanggal Hari Ini"
            >
              <Check className="w-3 h-3" />
              <span>Hari Ini</span>
            </button>
            <button
              type="button"
              onClick={handleSelectTomorrow}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer border border-slate-200"
              title="Pilih Tanggal Besok"
            >
              <span>Besok</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium transition cursor-pointer border border-rose-200"
                title="Hapus Tanggal"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center gap-1 border border-slate-200"
            >
              <X className="w-3 h-3" />
              <span>Tutup</span>
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field + Calendar Icon Button */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full pl-3 pr-11 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-xs disabled:opacity-50"
        />

        {/* Tombol Kalender di sisi kanan input: 1 Klik Membuka Pop-up Kalender */}
        <button
          type="button"
          onClick={toggleCalendar}
          disabled={disabled}
          title="Klik 1x untuk membuka kalender pemilih tanggal"
          className={`absolute right-1 top-1 bottom-1 px-2.5 flex items-center justify-center rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
            isOpen
              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
              : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 active:scale-95'
          }`}
        >
          <Calendar className="w-4 h-4" />
        </button>

        {/* Hidden native input for mobile accessibility fallback */}
        <input
          ref={nativeDateRef}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only pointer-events-none"
          value={value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''}
          onChange={(e) => {
            if (e.target.value) {
              onChange(e.target.value);
            }
          }}
        />
      </div>

      {/* Render Popover via React Portal */}
      {calendarPopover}
    </div>
  );
};
