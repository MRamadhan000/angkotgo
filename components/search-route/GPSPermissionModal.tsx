"use client";

import { FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { COLORS } from "@/constants";

interface GPSPermissionModalProps {
  onClose: () => void;
  onRetry: () => void;
}

export function GPSPermissionModal({
  onClose,
  onRetry,
}: GPSPermissionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-7 relative shadow-xl text-center border"
        style={{ borderColor: "#f1f5f9" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full transition hover:bg-slate-100"
          style={{ color: "#94a3b8" }}
          aria-label="Tutup"
        >
          <FaTimes size={12} />
        </button>

        {/* Icon */}
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-5"
          style={{ background: "#fef3c7" }}
        >
          <FaExclamationTriangle style={{ color: "#d97706" }} />
        </div>

        <h3
          className="font-bold text-lg mb-2"
          style={{ color: COLORS.textDark }}
        >
          Akses GPS Diblokir
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: COLORS.textSecondary }}>
          AngkotGo membutuhkan izin lokasi agar bisa menemukan angkot
          terdekat secara akurat.
        </p>

        <div className="mt-2 text-xs" style={{ color: "#94a3b8" }}>
          Aktifkan izin lokasi di pengaturan browser, lalu coba lagi.
        </div>

        <button
          onClick={() => {
            onClose();
            onRetry();
          }}
          className="mt-6 w-full py-3 rounded-full text-white font-semibold text-sm transition hover:opacity-90 active:scale-[0.99]"
          style={{ backgroundColor: COLORS.primary }}
        >
          Coba Lagi
        </button>

        <button
          onClick={onClose}
          className="mt-2 w-full py-2.5 rounded-full text-sm transition hover:bg-slate-50"
          style={{ color: COLORS.textSecondary }}
        >
          Masukkan Lokasi Manual
        </button>
      </div>
    </div>
  );
}
