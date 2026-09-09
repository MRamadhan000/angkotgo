"use client";

import { FiMapPin, FiEdit2 } from "react-icons/fi";

interface LocationSummaryProps {
  origin: string;
  destination: string;
  onEdit?: () => void;
}

export default function LocationSummary({
  origin,
  destination,
  onEdit,
}: LocationSummaryProps) {
  return (
    <button
      type="button"
      onClick={onEdit}
      disabled={!onEdit}
      className="group relative flex w-full items-stretch gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 text-left shadow-sm transition-all hover:border-[#003d9b] hover:shadow-md active:scale-[0.99] disabled:cursor-default"
    >
      {/* Visual Route Indicator (Dots + Line) */}
      <div className="my-0.5 flex shrink-0 flex-col items-center justify-between py-1">
        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-100 ring-2 ring-blue-500/20">
          <div className="h-2 w-2 rounded-full bg-[#003d9b]" />
        </div>
        <div className="h-5 w-0.5 rounded-full bg-gradient-to-b from-[#003d9b] via-slate-300 to-rose-500" />
        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-100 ring-2 ring-rose-500/20">
          <FiMapPin className="text-[11px] text-rose-600" />
        </div>
      </div>

      {/* Origin & Destination Texts */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="min-w-0 pr-12">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Jemput
          </p>
          <p className="truncate text-xs font-semibold text-slate-800">
            {origin || "Pilih lokasi penjemputan"}
          </p>
        </div>

        <div className="my-1 border-t border-slate-100" />

        <div className="min-w-0 pr-12">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Tujuan
          </p>
          <p className="truncate text-xs font-semibold text-slate-800">
            {destination || "Pilih lokasi tujuan"}
          </p>
        </div>
      </div>

      {/* Edit Pill Button */}
      {onEdit && (
        <div className="absolute right-3 top-3.5 flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition group-hover:bg-blue-50 group-hover:text-[#003d9b]">
          <FiEdit2 className="text-[10px]" />
          <span>Ubah</span>
        </div>
      )}
    </button>
  );
}