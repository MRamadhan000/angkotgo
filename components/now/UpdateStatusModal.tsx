"use client";

import React from "react";
import {
  FaTimes,
  FaCheck,
  FaBus,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { AssignmentStatus } from "@/types/vehicles/vehicle-assignments.type";

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onSave: () => void;
  isUpdating: boolean;
}

export function UpdateStatusModal({
  isOpen,
  onClose,
  selectedStatus,
  onStatusChange,
  onSave,
  isUpdating,
}: UpdateStatusModalProps) {
  if (!isOpen) return null;

  // Konfigurasi 4 Pilihan Status berdasarkan Enum AssignmentStatus
  const statusOptions = [
    {
      value: AssignmentStatus.SCHEDULED,
      label: "SCHEDULED (Terjadwal)",
      description: "Penugasan telah dijadwalkan dan siap jalan.",
      icon: <FaCalendarAlt className="text-blue-500" />,
      activeClass: "border-blue-500 bg-blue-50/60 text-blue-900 ring-2 ring-blue-500/20",
    },
    {
      value: AssignmentStatus.ONGOING,
      label: "ONGOING (Berlangsung)",
      description: "Penugasan sedang berjalan di rute operasional.",
      icon: <FaBus className="text-emerald-500" />,
      activeClass: "border-emerald-500 bg-emerald-50/60 text-emerald-900 ring-2 ring-emerald-500/20",
    },
    {
      value: AssignmentStatus.COMPLETED,
      label: "COMPLETED (Selesai)",
      description: "Operasional penugasan telah selesai dilaksanakan.",
      icon: <FaCheckCircle className="text-slate-700" />,
      activeClass: "border-slate-800 bg-slate-100 text-slate-900 ring-2 ring-slate-800/20",
    },
    {
      value: AssignmentStatus.CANCELLED,
      label: "CANCELLED (Dibatalkan)",
      description: "Penugasan dibatalkan karena hal tertentu.",
      icon: <FaTimesCircle className="text-rose-500" />,
      activeClass: "border-rose-500 bg-rose-50/60 text-rose-900 ring-2 ring-rose-500/20",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Ubah Status Penugasan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih status operasional terbaru untuk kendaraan ini.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* BODY FORM OPTIONS */}
        <div className="p-5 space-y-2.5">
          {statusOptions.map((option) => {
            const isSelected = selectedStatus === option.value;
            return (
              <label
                key={option.value}
                onClick={() => onStatusChange(option.value)}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? option.activeClass
                    : "border-slate-100 hover:border-slate-200 bg-white text-slate-700"
                }`}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-2xs border border-slate-100 text-sm">
                  {option.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold leading-none">
                      {option.label}
                    </span>
                    {isSelected && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white text-[9px]">
                        <FaCheck />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {option.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-slate-50/80 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isUpdating}
            onClick={onSave}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

      </div>
    </div>
  );
}