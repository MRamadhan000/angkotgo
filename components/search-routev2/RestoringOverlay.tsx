"use client";

import { FiRefreshCw, FiWifi } from "react-icons/fi";

interface RestoringOverlayProps {
  /** Memunculkan atau menyembunyikan overlay */
  show: boolean;
  /** Teks pesan kustom (opsional) */
  message?: string;
}

export default function RestoringOverlay({
  show,
  message = "Menghubungkan kembali perjalanan Anda...",
}: RestoringOverlayProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md transition-all duration-300"
      aria-live="assertive"
      role="alert"
    >
      <div className="relative flex w-full max-w-xs sm:max-w-sm flex-col items-center gap-3.5 rounded-3xl border border-blue-100 bg-white/95 p-5 text-center shadow-2xl shadow-blue-900/20 backdrop-blur-xl transition-transform animate-in fade-in zoom-in-95 duration-200">
        {/* Animated Badge & Icon */}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-8 ring-blue-50/50">
          <FiRefreshCw className="h-6 w-6 animate-spin text-[#003d9b]" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white shadow-sm">
            <FiWifi className="h-2.5 w-2.5 animate-pulse" />
          </span>
        </div>

        {/* Content Text */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-800 sm:text-base">
            Memuat Sesi
          </h4>
          <p className="text-xs font-medium text-slate-600 leading-relaxed sm:text-sm">
            {message}
          </p>
        </div>

        {/* Pulse Bar Indicator */}
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-blue-100">
          <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-[#003d9b] to-blue-500" />
        </div>
      </div>
    </div>
  );
}