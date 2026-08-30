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
}) => {
  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
      <div className="mb-4">
        <h3 className="text-[13px] sm:text-sm font-bold text-slate-900 mb-0.5">
          Ketersediaan Seat
        </h3>
        <p className="text-[11px] sm:text-xs text-gray-400">
          Klik nomor seat untuk mengubah jumlah penumpang.
        </p>
      </div>

      <div className="grid grid-cols-8 gap-1.5 sm:gap-2 mb-4">
        {seats.map((seat) => {
          const isOccupied = seat.isOccupied;
          return (
            <button
              key={seat.seatNumber}
              type="button"
              disabled={!canControl}
              onClick={() => onToggleSeat(seat.seatNumber)}
              className={`flex h-9 sm:h-12 w-full flex-col items-center justify-center rounded-lg sm:rounded-xl border text-[11px] sm:text-sm font-bold transition-all
              ${isOccupied
                  ? "bg-[#FC6B6B] border-[#FC6B6B] text-white shadow-sm"
                  : "bg-white border-[#8fe19a] text-slate-700 hover:bg-green-50"
                } 
              ${!canControl
                  ? "opacity-80 cursor-not-allowed"
                  : "active:scale-95 cursor-pointer"
                }
              `}
            >
              <span>{seat.seatNumber}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-[10px] sm:text-xs text-gray-500 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FC6B6B]"></span>
          <span>Terisi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3ae93a]"></span>
          <span>Kosong</span>
        </div>
      </div>
    </div>
  );
};
