"use client";

import { FiClock, FiMap, FiMapPin, FiSearch, FiStar } from "react-icons/fi";

interface RouteSearchFormProps {
  origin: string;
  destination: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onMapClick?: () => void;
}

export default function RouteSearchForm({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onMapClick,
}: RouteSearchFormProps) {
  return (
    <div className="bg-[#faf8ff]/95 backdrop-blur-md rounded-[20px] sm:rounded-[24px] shadow-[0_8px_24px_0_rgba(0,0,0,0.08)] p-3.5 sm:p-4 border border-[#c3c6d6]/30 flex flex-col gap-2">
      {/* Origin Input */}
      <div className="relative flex items-center">
        <div className="absolute left-2.5 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0052cc]/10 text-[#003d9b]">
          <FiMapPin className="text-sm sm:text-base" />
        </div>

        <input
          className="w-full h-11 sm:h-12 pl-11 sm:pl-12 pr-3 bg-[#faf8ff] rounded-xl border border-[#c3c6d6] text-[#191b23] text-xs sm:text-sm focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/20 outline-none transition-all truncate"
          placeholder="Lokasi Penjemputan"
          type="text"
          value={origin}
          onChange={(e) => onOriginChange(e.target.value)}
        />
      </div>

      {/* Connector Line */}
      <div className="relative w-full h-1.5 flex justify-start pl-[22px] sm:pl-[28px] overflow-hidden -my-1">
        <div className="w-[2px] h-full border-l-2 border-dashed border-[#c3c6d6] opacity-60" />
      </div>

      {/* Destination Input */}
      <div className="relative flex items-center">
        <div className="absolute left-2.5 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#e7e7f2] text-[#434654]">
          <FiSearch className="text-sm sm:text-base" />
        </div>

        <input
          autoFocus
          className="w-full h-11 sm:h-12 pl-11 sm:pl-12 pr-16 sm:pr-20 bg-[#faf8ff] rounded-xl border border-[#c3c6d6] text-[#191b23] text-xs sm:text-sm focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/20 outline-none transition-all truncate"
          placeholder="Lokasi Tujuan"
          type="text"
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
        />

        <button
          type="button"
          onClick={onMapClick}
          className="absolute right-2 h-7 sm:h-8 px-2 rounded-lg bg-[#f3f3fd] border border-[#c3c6d6] text-[#003d9b] font-semibold text-[11px] sm:text-xs flex items-center gap-1 hover:bg-[#e7e7f2] active:scale-95 transition-all"
        >
          <FiMap className="text-xs sm:text-sm" />
          Peta
        </button>
      </div>

      {/* Quick Suggestions */}
      <div className="flex gap-1.5 overflow-x-auto pt-1 pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => onDestinationChange("Alun-Alun Malang")}
          className="shrink-0 px-2.5 py-1 rounded-lg bg-[#ededf8] text-[#434654] font-medium text-[11px] sm:text-xs flex items-center gap-1 active:bg-[#e7e7f2] transition-colors"
        >
          <FiClock className="text-[11px] text-[#003d9b]" />
          Alun-Alun
        </button>

        <button
          type="button"
          onClick={() => onDestinationChange("Universitas Brawijaya")}
          className="shrink-0 px-2.5 py-1 rounded-lg bg-[#ededf8] text-[#434654] font-medium text-[11px] sm:text-xs flex items-center gap-1 active:bg-[#e7e7f2] transition-colors"
        >
          <FiStar className="text-[11px] text-amber-500" />
          Kampus UB
        </button>

        <button
          type="button"
          onClick={() => onDestinationChange("Malang Town Square")}
          className="shrink-0 px-2.5 py-1 rounded-lg bg-[#ededf8] text-[#434654] font-medium text-[11px] sm:text-xs flex items-center gap-1 active:bg-[#e7e7f2] transition-colors"
        >
          <FiStar className="text-[11px] text-amber-500" />
          Matos
        </button>
      </div>
    </div>
  );
}
