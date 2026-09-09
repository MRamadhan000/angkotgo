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
        className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-base font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting || !hasRouteStops}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <FaLocationDot className="text-lg text-white" />
          </div>
          <div className="text-left">
            <span className="block text-sm font-extrabold leading-tight sm:text-base">
              {isSubmitting ? "Menyimpan posisi..." : "Pilih Posisi Kendaraan"}
            </span>
            <span className="block text-[11px] font-medium text-blue-200">
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
