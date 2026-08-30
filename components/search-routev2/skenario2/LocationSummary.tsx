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
      className="flex w-full items-center gap-2.5 rounded-xl border border-[#c3c6d6]/40 bg-[#faf8ff] px-3 py-2 text-left disabled:cursor-default"
    >
      {/* Titik origin -> destinasi, dihubungkan garis putus-putus */}
      <div className="flex shrink-0 flex-col items-center gap-0.5 py-0.5">
        <div className="h-2 w-2 rounded-full bg-[#003d9b]" />
        <div className="h-3 w-px border-l border-dashed border-[#c3c6d6]" />
        <FiMapPin className="text-[11px] text-rose-600" />
      </div>

      {/* Teks origin & destinasi */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-[11px] font-medium text-[#191b23] sm:text-xs">
          {origin || "Lokasi penjemputan"}
        </p>
        <p className="truncate text-[11px] font-medium text-[#191b23] sm:text-xs">
          {destination || "Lokasi tujuan"}
        </p>
      </div>

      {onEdit && (
        <FiEdit2 className="shrink-0 text-xs text-[#8b8fa3]" />
      )}
    </button>
  );
}