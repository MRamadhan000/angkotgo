"use client";

import { FiCompass, FiNavigation } from "react-icons/fi";

interface GpsPermissionModalProps {
  open: boolean;
  isLocating: boolean;
  onEnable: () => void;
  onSkip: () => void;
  hideSkip?: boolean;
}

export default function GpsPermissionModal({
  open,
  isLocating,
  onEnable,
  onSkip,
  hideSkip = false,
}: GpsPermissionModalProps) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#faf8ff] w-full max-w-sm rounded-[24px] shadow-2xl p-6 border border-[#c3c6d6]/30 flex flex-col items-center text-center gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-[#0052cc]/10 flex items-center justify-center text-[#003d9b] text-2xl">
          <FiCompass className="animate-spin-slow" />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-[#003d9b]">
            Nyalakan GPS
          </h2>

          <p className="text-xs sm:text-sm text-[#434654] leading-relaxed">
            Mohon aktifkan akses lokasi agar AngkotGo dapat mendeteksi titik
            penjemputan Anda secara akurat di area Malang.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col w-full gap-2 mt-2">
          <button
            onClick={onEnable}
            disabled={isLocating}
            className="w-full h-12 bg-[#003d9b] text-white rounded-xl font-semibold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLocating ? (
              <span>Mendeteksi Lokasi...</span>
            ) : (
              <>
                <FiNavigation className="text-base" />
                <span>Aktifkan GPS</span>
              </>
            )}
          </button>

          {!hideSkip && (
            <button
              onClick={onSkip}
              disabled={isLocating}
              className="w-full h-10 bg-transparent text-[#434654] hover:bg-[#ededf8] rounded-xl font-medium text-xs transition-all disabled:opacity-50"
            >
              Gunakan Manual / Lewati
            </button>
          )}
        </div>
      </div>
    </div>
  );
}