// src/components/vehicles/EstimatedStopsTimeline.tsx
"use client";

import { FaClock, FaMapMarkerAlt, FaChevronDown } from "react-icons/fa";

interface StopItem {
  stopId: number | string;
  stopOrder: number;
  stopName: string;
  latitude: number | string;
  longitude: number | string;
  estimatedArrivalTime: string;
}

interface EstimatedStopsTimelineProps {
  stops: StopItem[] | undefined;
  isOpen: boolean;
  onToggle: () => void;
}

export function EstimatedStopsTimeline({
  stops,
  isOpen,
  onToggle,
}: EstimatedStopsTimelineProps) {
  const stopsCount = stops?.length || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 sm:p-6 space-y-3 sm:space-y-4">
      {/* Header Toggle */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between cursor-pointer pb-2.5 sm:pb-3 border-b border-gray-100 select-none group"
      >
        <h2 className="text-sm sm:text-lg font-bold text-slate-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
          <FaMapMarkerAlt className="text-blue-600 shrink-0 text-sm sm:text-base" />
          <span className="leading-tight">Estimasi Waktu Halte Perjalanan</span>
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] sm:text-xs text-gray-400 font-medium">
            {stopsCount} Halte
          </span>
          <FaChevronDown
            className={`text-gray-400 text-xs sm:text-sm transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Konten Timeline Halte */}
      {isOpen && (
        <div className="pt-1 sm:pt-2">
          {!stops || stops.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400">
              Tidak ada data estimasi halte untuk penugasan ini.
            </div>
          ) : (
            <div className="relative border-l-2 border-blue-100 ml-2.5 sm:ml-3 space-y-4 sm:space-y-6 py-2">
              {stops.map((stop) => (
                <div key={stop.stopId} className="relative pl-5 sm:pl-6">
                  {/* Titik Timeline */}
                  <div className="absolute -left-[6px] sm:-left-[7px] top-1.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100"></div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/60 rounded-xl border border-gray-100 p-3 sm:p-3.5 gap-2.5 sm:gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] sm:text-xs font-semibold text-blue-600">
                        Halte ke-{stop.stopOrder}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 break-words">
                        {stop.stopName}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 break-all sm:break-normal">
                        Koordinat: {stop.latitude}, {stop.longitude}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-gray-200 text-[11px] sm:text-xs font-semibold text-slate-700 shadow-sm shrink-0 self-start sm:self-auto">
                      <FaClock className="text-blue-500 shrink-0 text-xs" />
                      <span>Est. Tiba: {stop.estimatedArrivalTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}