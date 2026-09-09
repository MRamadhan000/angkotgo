"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { FaWifi, FaSatellite } from "react-icons/fa6";
import { DirectionType } from "@/types/vehicles/vehicle.type";

interface DriverFloatingTopBarProps {
  routeName?: string;
  routeCode?: string;
  plateNumber?: string;
  direction?: DirectionType | string;
  vehicleSocketStatus: { connected: boolean; joined: boolean };
  userSocketStatus: { connected: boolean; joined: boolean };
  onBackClick?: () => void;
  onRefreshGps?: () => void;
}

export function DriverFloatingTopBar({
  routeName = "Trayek Angkot",
  routeCode,
  plateNumber,
  direction,
  vehicleSocketStatus,
  userSocketStatus,
  onBackClick,
  onRefreshGps,
}: DriverFloatingTopBarProps) {
  const isVehicleLive = vehicleSocketStatus.connected && vehicleSocketStatus.joined;

  return (
    <header className="pointer-events-auto fixed inset-x-2.5 top-2 z-20 mx-auto max-w-xl transition-all sm:inset-x-4 sm:top-4">
      <div className="flex items-center justify-between gap-2 rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white/95 px-2.5 py-1.5 shadow-md shadow-slate-900/10 backdrop-blur-xl sm:px-4 sm:py-2.5">
        {/* LEFT: BACK BUTTON + ROUTE INFO */}
        <div className="flex items-center gap-2 min-w-0">
          {onBackClick ? (
            <button
              type="button"
              onClick={onBackClick}
              className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 active:scale-95"
              aria-label="Kembali"
            >
              <FiArrowLeft className="text-sm sm:text-base" />
            </button>
          ) : (
            <Link
              href="/driver/dashboard"
              className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 active:scale-95"
              aria-label="Kembali ke Dashboard"
            >
              <FiArrowLeft className="text-sm sm:text-base" />
            </Link>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate text-[11px] sm:text-xs md:text-sm font-extrabold text-slate-900">
                {routeName}
              </h1>
              {routeCode && (
                <span className="shrink-0 rounded bg-blue-50 px-1 py-0.2 text-[9px] sm:text-[10px] font-bold text-blue-700 border border-blue-200/50">
                  {routeCode}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-500">
              {plateNumber && (
                <span className="font-semibold text-slate-700">{plateNumber}</span>
              )}
              {direction && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="capitalize text-slate-600">
                    Arah {direction.toLowerCase()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE SOCKET STATUS BADGE */}
        <div className="flex items-center gap-1 shrink-0">
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold border transition-all ${
              isVehicleLive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs"
                : "bg-amber-50 text-amber-700 border-amber-200/80"
            }`}
            title={`Vehicle Socket: ${vehicleSocketStatus.connected ? "Connected" : "Disconnected"}, Joined: ${vehicleSocketStatus.joined ? "Yes" : "No"}`}
          >
            <span className="relative flex h-1.5 w-1.5">
              {isVehicleLive && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                  isVehicleLive ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>
            <span className="hidden sm:inline">
              {isVehicleLive ? "GPS LIVE" : "CONNECTING"}
            </span>
            <FaSatellite className="text-[9px] sm:hidden" />
          </div>

          {onRefreshGps && (
            <button
              type="button"
              onClick={onRefreshGps}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-slate-100 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 active:scale-95"
              title="Perbarui GPS"
              aria-label="Perbarui GPS"
            >
              <FaWifi className="text-[10px] sm:text-xs" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
