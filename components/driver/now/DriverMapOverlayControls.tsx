"use client";

import React from "react";
import { FaLocationCrosshairs, FaMapLocationDot, FaBug } from "react-icons/fa6";

interface DriverMapOverlayControlsProps {
  onRecenter: () => void;
  onOpenLocationModal: () => void;
  onToggleDebug?: () => void;
  isDebugOpen?: boolean;
  hasLocation?: boolean;
}

export function DriverMapOverlayControls({
  onRecenter,
  onOpenLocationModal,
  onToggleDebug,
  isDebugOpen = false,
  hasLocation = true,
}: DriverMapOverlayControlsProps) {
  return (
    <div className="pointer-events-auto fixed right-2.5 bottom-[175px] sm:right-4 sm:bottom-[210px] z-20 flex flex-col gap-2 transition-all">
      {/* RE-CENTER TO VEHICLE BUTTON */}
      <button
        type="button"
        onClick={onRecenter}
        disabled={!hasLocation}
        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/95 text-slate-700 shadow-md shadow-slate-900/10 backdrop-blur-md transition-all hover:bg-blue-50 hover:text-blue-600 active:scale-90 disabled:opacity-50"
        title="Pusatkan Peta ke Posisi Angkot"
        aria-label="Pusatkan Peta ke Posisi Angkot"
      >
        <FaLocationCrosshairs className="text-sm sm:text-base text-blue-600" />
      </button>

      {/* QUICK UPDATE HALTE / LOKASI BUTTON */}
      <button
        type="button"
        onClick={onOpenLocationModal}
        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-blue-200/80 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 active:scale-90"
        title="Perbarui Halte / Posisi Kendaraan"
        aria-label="Perbarui Halte / Posisi Kendaraan"
      >
        <FaMapLocationDot className="text-sm sm:text-base" />
      </button>

      {/* DEBUG PANEL TOGGLE (Optional) */}
      {onToggleDebug && (
        <button
          type="button"
          onClick={onToggleDebug}
          className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl border transition-all active:scale-90 ${
            isDebugOpen
              ? "bg-slate-800 text-amber-400 border-slate-700 shadow-md"
              : "bg-white/90 text-slate-500 border-slate-200/80 shadow-xs hover:bg-slate-100"
          }`}
          title="Toggle Debug Log"
          aria-label="Toggle Debug Log"
        >
          <FaBug className="text-[10px] sm:text-xs" />
        </button>
      )}
    </div>
  );
}
