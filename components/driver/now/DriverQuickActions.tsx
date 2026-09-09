"use client";

import React from "react";
import { FaLocationDot } from "react-icons/fa6";

interface DriverQuickActionsProps {
  onSelectLocation: () => void;
  isSubmitting: boolean;
  hasRouteStops: boolean;
}

export function DriverQuickActions({
  onSelectLocation,
  isSubmitting,
  hasRouteStops,
}: DriverQuickActionsProps) {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onSelectLocation}
        className="group relative flex w-full items-center justify-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 sm:px-5 sm:py-3.5 text-xs sm:text-base font-bold text-white shadow-sm sm:shadow-md shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting || !hasRouteStops}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm">
            <FaLocationDot className="text-xs sm:text-base text-white" />
          </div>
          <div className="text-left">
            <span className="block text-xs sm:text-sm font-extrabold leading-tight">
              {isSubmitting ? "Menyimpan posisi..." : "Pilih Posisi Kendaraan"}
            </span>
            <span className="block text-[10px] sm:text-[11px] font-medium text-blue-200">
              {hasRouteStops
                ? "Pilih halte terdekat sebagai posisi saat ini"
                : "Belum ada halte tersedia"}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
