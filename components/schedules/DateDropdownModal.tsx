"use client";

import { useRef, useEffect } from "react";
import { FiCalendar, FiChevronDown, FiCheck } from "react-icons/fi";
import { formatDateLabel } from "@/utils/format";
import { VehicleAssignment } from "@/types/vehicles/vehicle.type";

interface DateDropdownModalProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
  availableDates: string[];
  assignments: VehicleAssignment[] | null;
  todayString: string;
}

export default function DateDropdownModal({
  selectedDate,
  setSelectedDate,
  isDropdownOpen,
  setIsDropdownOpen,
  availableDates,
  assignments,
  todayString,
}: DateDropdownModalProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  const typedAssignments: VehicleAssignment[] = assignments || [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:border-gray-300 transition-all text-gray-700"
      >
        <FiCalendar className="w-4 h-4 text-gray-500 shrink-0" />
        <span>{formatDateLabel(selectedDate)}</span>
        <FiChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN MENU / MODAL */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Pilih Tanggal Operasional
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {availableDates.map((date) => {
              const isSelected = date === selectedDate;
              const count = typedAssignments.filter(
                (item) => (item.assignmentDate || todayString) === date,
              ).length;

              return (
                <button
                  key={date}
                  onClick={() => {
                    setSelectedDate(date);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{formatDateLabel(date)}</span>
                    {date === todayString && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                          isSelected
                            ? "bg-gray-800 text-gray-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        Hari Ini
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-gray-800 text-gray-300"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count} unit
                    </span>
                    {isSelected && <FiCheck className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}