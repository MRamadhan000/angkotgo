"use client";

import React from "react";
import { SeatState } from "@/types/vehicles/seat-management.type";
import { FaChair, FaUserCheck, FaLock, FaInfoCircle } from "react-icons/fa";

interface SeatGridControlProps {
  seats: SeatState[];
  canControl: boolean;
  onToggleSeat: (seatNumber: number) => void;
  hasConductor?: boolean;
  isUserConductor?: boolean;
}

export const SeatGridControl: React.FC<SeatGridControlProps> = ({
  seats,
  canControl,
  onToggleSeat,
  hasConductor,
  isUserConductor,
}) => {
  const occupiedCount = seats.filter((s) => s.isOccupied).length;
  const availableCount = seats.length - occupiedCount;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-xs border border-slate-100 transition-all">
      {/* HEADER & RINGKASAN */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
              Ketersediaan Kursi
            </h3>
            {!canControl && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">
                <FaLock className="text-[8px]" />
                Hanya Lihat
              </span>
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <FaInfoCircle className="text-slate-300 shrink-0" />
            {canControl
              ? "Tap kursi untuk ubah status."
              : "Status dipantau langsung."}
          </p>
        </div>

        {/* COUNTER BADGES */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md sm:rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] sm:text-[11px] font-bold">
            <FaUserCheck className="text-[9px]" />
            <span>Kosong: {availableCount}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md sm:rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-[10px] sm:text-[11px] font-bold">
            <FaChair className="text-[9px]" />
            <span>Terisi: {occupiedCount}</span>
          </div>
        </div>
      </div>

      {/* SEAT GRID RESPONSIVE MOBILE */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 sm:gap-2 mb-1">
        {seats.map((seat) => {
          const isOccupied = seat.isOccupied;
          return (
            <button
              key={seat.seatNumber}
              type="button"
              disabled={!canControl}
              onClick={() => onToggleSeat(seat.seatNumber)}
              className={`relative group flex h-9 sm:h-11 w-full flex-col items-center justify-center rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-bold transition-all duration-150 select-none ${
                isOccupied
                  ? "bg-rose-500 border-rose-500 text-white shadow-xs hover:bg-rose-600"
                  : "bg-white border-emerald-200 text-slate-700 hover:bg-emerald-50/60 hover:border-emerald-300"
              } ${
                !canControl
                  ? "opacity-80 cursor-not-allowed"
                  : "active:scale-95 cursor-pointer shadow-2xs"
              }`}
            >
              <FaChair
                className={`text-[9px] sm:text-[11px] mb-0.5 transition-colors ${
                  isOccupied ? "text-rose-100" : "text-emerald-500/70"
                }`}
              />
              <span className="leading-none">{seat.seatNumber}</span>
            </button>
          );
        })}
      </div>

      {/* LEGEND / KETERANGAN WARNA */}
      {/* <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-[11px] font-semibold text-slate-500 border-t border-slate-50">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></span>
          <span>Kosong</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100"></span>
          <span>Terisi</span>
        </div>
      </div> */}
    </div>
  );
};