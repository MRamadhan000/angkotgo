// src/components/common/UpdateStatusModal.tsx
"use client";

import { FaTimes } from "react-icons/fa";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Ubah Status Penugasan
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs sm:text-sm text-gray-500">
            Pilih status baru untuk penugasan kendaraan ini:
          </p>

          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-blue-50/50 transition-colors">
              <input
                type="radio"
                name="statusOption"
                value="SCHEDULED"
                checked={selectedStatus === "SCHEDULED"}
                onChange={(e) => onStatusChange(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="block text-xs sm:text-sm font-bold text-slate-800">
                  SCHEDULED
                </span>
                <span className="block text-[11px] text-gray-400">
                  Penugasan telah dijadwalkan.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-emerald-50/50 transition-colors">
              <input
                type="radio"
                name="statusOption"
                value="ONGOING"
                checked={selectedStatus === "ONGOING"}
                onChange={(e) => onStatusChange(e.target.value)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="block text-xs sm:text-sm font-bold text-slate-800">
                  ONGOING
                </span>
                <span className="block text-[11px] text-gray-400">
                  Penugasan sedang berlangsung di jalan.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-200/60 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isUpdating}
            onClick={onSave}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all disabled:opacity-50"
          >
            {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}