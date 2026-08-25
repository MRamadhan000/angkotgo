"use client";

import React from "react";
import { SeatState } from "@/types/vehicles/seat-management.type";

interface SeatGridControlProps {
  seats: SeatState[];
  canControl: boolean;
  onToggleSeat: (seatNumber: number) => void;
  hasConductor: boolean;
  isUserConductor: boolean;
}

export const SeatGridControl: React.FC<SeatGridControlProps> = ({
  seats,
  canControl,
  onToggleSeat,
  hasConductor,
  isUserConductor,
}) => {
  const occupiedCount = seats.filter((s) => s.isOccupied).length;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Kapasitas Kursi
          </h3>
          <p className="text-xs text-gray-500">
            Terisi:{" "}
            <span className="font-bold text-blue-600">{occupiedCount}</span> / 8
            Kursi
          </p>
        </div>
        {!canControl && (
          <span className="text-[10px] font-medium bg-amber-50 text-amber-600 px-2 py-1 rounded-md border border-amber-200">
            {hasConductor && !isUserConductor
              ? "Dikelola Kondektur (Read-Only)"
              : "Mode Pantau"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2.5 my-2">
        {seats.map((seat) => (
          <button
            key={seat.seatNumber}
            type="button"
            disabled={!canControl}
            aria-label={`Kursi ${seat.seatNumber} ${seat.isOccupied ? "Terisi" : "Kosong"}`}
            onClick={() => onToggleSeat(seat.seatNumber)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-bold transition-all ${
              seat.isOccupied
                ? "bg-red-500 text-white border-red-600 shadow-sm"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            } ${
              !canControl
                ? "opacity-70 cursor-not-allowed"
                : "active:scale-95 cursor-pointer"
            }`}
          >
            <span>K{seat.seatNumber}</span>
            <span className="text-[9px] font-normal mt-0.5">
              {seat.isOccupied ? "Terisi" : "Kosong"}
            </span>
          </button>
        ))}
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
        <div
          className={`h-2 transition-all duration-300 ${
            occupiedCount === 8 ? "bg-red-500" : "bg-blue-600"
          }`}
          style={{ width: `${(occupiedCount / 8) * 100}%` }}
        />
      </div>
    </div>
  );
};
