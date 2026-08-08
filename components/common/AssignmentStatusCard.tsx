"use client";

import { FaEdit, FaBus, FaCalendarAlt, FaInfoCircle } from "react-icons/fa";

interface AssignmentStatusCardProps {
  status?: string;
  onOpenModal: () => void;
}

export function AssignmentStatusCard({
  status,
  onOpenModal,
}: AssignmentStatusCardProps) {
  if (!status) return null;

  const currentStatus = status.toUpperCase();

  if (currentStatus === "ONGOING") {
    return (
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
            <FaBus className="text-xl animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-100">
              Status Penugasan Saat Ini
            </div>
            <div className="text-base sm:text-lg font-extrabold tracking-wide flex items-center gap-2 mt-0.5">
              <span>ONGOING (BERLANGSUNG)</span>
              <span className="h-2.5 w-2.5 rounded-full bg-white animate-ping"></span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white text-emerald-700 hover:bg-emerald-50 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <FaEdit className="text-xs" />
          <span>Ubah Status</span>
        </button>
      </div>
    );
  }

  if (currentStatus === "SCHEDULED") {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
            <FaCalendarAlt className="text-xl" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-100">
              Status Penugasan Saat Ini
            </div>
            <div className="text-base sm:text-lg font-extrabold tracking-wide mt-0.5">
              SCHEDULED (TERJADWAL)
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <FaEdit className="text-xs" />
          <span>Ubah Status</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 text-slate-800 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
          <FaInfoCircle className="text-xl" />
        </div>
        <div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">
            Status Penugasan Saat Ini
          </div>
          <div className="text-base sm:text-lg font-extrabold tracking-wide text-slate-900 mt-0.5">
            {currentStatus}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenModal}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer"
      >
        <FaEdit className="text-xs" />
        <span>Ubah Status</span>
      </button>
    </div>
  );
}