"use client";

import { useRef, useEffect, useState } from "react";
import {
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
} from "react-icons/fi";
import { formatDateLabel } from "@/utils/format-date";
import { VehicleAssignment } from "@/types/vehicles/vehicle-assignments.type";

interface DateDropdownModalProps {
  selectedDate: string; // ISO string format "YYYY-MM-DD"
  setSelectedDate: (date: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
  assignments: VehicleAssignment[] | null;
  todayString: string; // ISO string format "YYYY-MM-DD"
}

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = [
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

export default function DateDropdownModal({
  selectedDate,
  setSelectedDate,
  isDropdownOpen,
  setIsDropdownOpen,
  assignments,
  todayString,
}: DateDropdownModalProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State untuk navigasi bulan & tahun pada kalender custom
  const [currentViewDate, setCurrentViewDate] = useState<Date>(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  // Sinkronisasi kalender saat selectedDate berubah atau dropdown dibuka
  useEffect(() => {
    if (selectedDate) {
      setCurrentViewDate(new Date(selectedDate));
    }
  }, [selectedDate, isDropdownOpen]);

  // Close dropdown saat klik di luar area modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsDropdownOpen]);

  // Handler Navigasi Bulan
  const handlePrevMonth = () => {
    setCurrentViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  // Logika Generate Grid Hari untuk Kalender Custom
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper konversi tanggal ke format ISO YYYY-MM-DD (Local Time)
  const formatISO = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  const currentCount = assignments?.length ?? 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:border-gray-300 transition-all text-gray-700 cursor-pointer"
      >
        <FiCalendar className="w-4 h-4 text-gray-500 shrink-0" />
        <span>{formatDateLabel(selectedDate)}</span>
        <FiChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN MENU FULL CUSTOM */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-3xl shadow-2xl z-50 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150 select-none">
          {/* HEADER KALENDER: BULAN & NAVIGASI */}
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-bold text-gray-900">
              {MONTH_NAMES[month]} {year}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* BODY KALENDER CUSTOM */}
          <div className="space-y-2">
            {/* HARI DALAM SEMINGGU */}
            <div className="grid grid-cols-7 text-center">
              {WEEKDAYS.map((day) => (
                <span
                  key={day}
                  className="text-[11px] font-bold text-gray-400 uppercase tracking-wider"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* GRID TANGGAL */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Padding sel kosong sebelum tanggal 1 */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="h-8 w-8" />
              ))}

              {/* Angka Tanggal */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const dayNum = index + 1;
                const dateISO = formatISO(year, month, dayNum);
                const isSelected = dateISO === selectedDate;
                const isToday = dateISO === todayString;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => {
                      setSelectedDate(dateISO);
                      setIsDropdownOpen(false);
                    }}
                    className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold"
                        : isToday
                        ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {dayNum}
                    {/* Dot Indikator Hari Ini jika tidak terpilih */}
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FOOTER & PILIHAN CEPAT */}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(todayString);
                setIsDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedDate === todayString
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <FiCalendar className="w-3.5 h-3.5" />
                <span>Hari Ini ({formatDateLabel(todayString)})</span>
              </div>
              {selectedDate === todayString && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                    {currentCount} unit
                  </span>
                  <FiCheck className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}