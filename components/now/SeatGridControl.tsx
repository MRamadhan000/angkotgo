"use client";

import { SeatState } from "@/types/vehicles/seat-management.type";

type SeatGridControlProps = {
  seats: SeatState[];
  canControl: boolean;
  onToggleSeat: (seatNumber: number) => void | Promise<void>;
  hasConductor: boolean;
  isUserConductor: boolean;
};

export function SeatGridControl({
  seats,
  canControl,
  onToggleSeat,
}: SeatGridControlProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-900">Ketersediaan Seat</h2>

        <p className="mt-1 text-xs text-gray-500">
          Klik nomor seat untuk mengubah jumlah penumpang.
        </p>
      </div>

      {seats.length === 0 ? (
        <p className="py-5 text-center text-xs text-gray-400">
          Data seat belum tersedia dari server.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {seats.map((seat) => (
              <button
                key={seat.seatNumber}
                type="button"
                disabled={!canControl}
                onClick={() => void onToggleSeat(seat.seatNumber)}
                className={`flex h-14 items-center justify-center rounded-xl border-2 text-sm font-bold transition ${
                  seat.isOccupied
                    ? "border-red-500 bg-red-500 text-white hover:bg-red-600"
                    : "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                } ${
                  canControl
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-70"
                }`}
              >
                {seat.seatNumber}
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-5 text-xs text-gray-500">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              Terisi
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              Kosong
            </span>
          </div>
        </>
      )}
    </section>
  );
}
