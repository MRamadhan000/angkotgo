"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaRedoAlt,
  FaTimes,
} from "react-icons/fa";

interface MiniCalendarPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // Format: "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
}

export default function MiniCalendarPicker({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}: MiniCalendarPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse tanggal terpilih atau fallback ke hari ini
  const initialDate = useMemo(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      const [y, m, d] = selectedDate.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  }, [selectedDate]);

  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  // View state untuk navigasi bulan di kalender
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth()); // 0 - 11

  // Sinkronisasi view jika selectedDate berubah dari luar
  useEffect(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      const [y, m] = selectedDate.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
  }, [selectedDate]);

  // Handle klik di luar popover untuk menutup
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Navigasi bulan
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Kalkulasi hari dalam bulan yang sedang dilihat
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 (Min) - 6 (Sab)
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Grid dates
  const calendarCells = [];

  // 1. Hari-hari dari bulan sebelumnya (padding)
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarCells.push({
      day,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // 2. Hari-hari bulan ini
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarCells.push({
      day,
      dateStr,
      isCurrentMonth: true,
    });
  }

  // 3. Hari-hari bulan berikutnya (padding sampai kelipatan 7)
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarCells.push({
      day,
      dateStr,
      isCurrentMonth: false,
    });
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full mt-2 right-0 sm:right-auto sm:left-0 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header Pop-up Kalender */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <FaCalendarAlt className="w-3.5 h-3.5 text-blue-600" />
          <span>
            {monthNames[viewMonth]} {viewYear}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Bulan Sebelumnya"
          >
            <FaChevronLeft className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Bulan Berikutnya"
          >
            <FaChevronRight className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
            title="Tutup"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Baris Nama Hari */}
      <div className="grid grid-cols-7 gap-1 text-center py-2 text-[10px] font-semibold text-slate-400 uppercase">
        {dayNames.map((d, i) => (
          <span key={d} className={i === 0 ? "text-red-400" : ""}>
            {d}
          </span>
        ))}
      </div>

      {/* Grid Tanggal */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((cell) => {
          const isSelected = cell.dateStr === selectedDate;
          const isToday = cell.dateStr === todayStr;

          return (
            <button
              key={cell.dateStr}
              type="button"
              onClick={() => {
                onSelectDate(cell.dateStr);
                onClose();
              }}
              className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all relative ${
                isSelected
                  ? "bg-blue-600 text-white shadow-sm font-bold scale-105 z-10"
                  : cell.isCurrentMonth
                  ? "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                  : "text-slate-300 hover:bg-slate-50 hover:text-slate-500"
              }`}
            >
              <span>{cell.day}</span>
              {isToday && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Shortcut & Reset */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => {
            onSelectDate(todayStr);
            onClose();
          }}
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
        >
          <FaRedoAlt className="w-2.5 h-2.5" />
          Hari Ini
        </button>

        <span className="text-[11px] text-slate-400">
          Pilih untuk filter data
        </span>
      </div>
    </div>
  );
}
