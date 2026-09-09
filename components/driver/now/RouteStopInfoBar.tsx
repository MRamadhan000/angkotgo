"use client";

import React from "react";
import { FaMapSigns, FaMapMarkerAlt } from "react-icons/fa";
import { RouteStopType } from "@/types/routes/route-stop.type";
import { StopInterval } from "@/types/routes/stop-interval.type";

interface RouteStopInfoBarProps {
  routeStops: RouteStopType[];
  stopCount: number;
  direction: string;
  stopIntervals: StopInterval[];
}

export function RouteStopInfoBar({
  routeStops,
  stopCount,
  direction,
  stopIntervals,
}: RouteStopInfoBarProps) {
  // Urutkan halte berdasarkan urutan (stopOrder)
  const sortedStops = [...routeStops].sort((a, b) => a.stopOrder - b.stopOrder);

  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 shadow-xs transition-all">
      <InfoHeaderBar stopCount={stopCount} direction={direction} />

      <RouteStopList stops={sortedStops} stopIntervals={stopIntervals} />
    </div>
  );
}

interface InfoHeaderBarProps {
  stopCount: number;
  direction: string;
}

function InfoHeaderBar({ stopCount, direction }: InfoHeaderBarProps) {
  return (
    <div className="flex items-center justify-between px-2.5 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-blue-50 text-blue-600">
          <FaMapSigns className="text-[10px] sm:text-sm" />
        </div>
        <p className="font-medium text-slate-700 text-[11px] sm:text-sm leading-snug">
          <span className="font-bold text-slate-900">{stopCount}</span> halte tersedia
          untuk arah{" "}
          <span className="font-bold capitalize text-slate-900">{direction}</span>.
        </p>
      </div>
    </div>
  );
}

interface RouteStopListProps {
  stops: RouteStopType[];
  stopIntervals: StopInterval[];
}

function RouteStopList({ stops, stopIntervals }: RouteStopListProps) {
  return (
    <div className="border-t border-slate-100 px-2.5 sm:px-4 py-2 sm:py-3">
      <p className="mb-2 sm:mb-3 text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-blue-600">
        Rute Perjalanan
      </p>

      {stops.length === 0 ? (
        <p className="text-[10px] sm:text-xs italic text-slate-400">
          Tidak ada halte ditemukan.
        </p>
      ) : (
        <div className="relative pl-2 sm:pl-3">
          {stops.map((stop, index) => {
            const nextStop = stops[index + 1];
            const segmentDurationInSeconds = nextStop
              ? getSegmentDuration(stop, nextStop, stopIntervals)
              : null;

            return (
              <div key={stop.id} className="relative">
                <RouteStopCard stop={stop} />

                {/* Connector line + estimasi ke halte berikutnya */}
                {nextStop && (
                  <div className="relative ml-[4px] sm:ml-[5px] flex items-center gap-1.5 sm:gap-2 py-1 sm:py-1.5">
                    <div className="h-4 sm:h-6 w-0 border-l-2 border-dashed border-blue-200" />
                    {segmentDurationInSeconds !== null &&
                      segmentDurationInSeconds > 0 && (
                        <span className="text-[9px] sm:text-[11px] font-medium text-blue-500">
                          ↓ {Math.ceil(segmentDurationInSeconds / 60)} menit ke halte
                          berikutnya
                        </span>
                      )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface RouteStopCardProps {
  stop: RouteStopType;
}

function RouteStopCard({ stop }: RouteStopCardProps) {
  return (
    <div className="relative flex items-start gap-2 sm:gap-3 group">
      {/* Pin Indicator */}
      <div className="mt-0.5 sm:mt-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-50" />

      <div className="min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded bg-blue-100 text-[8px] sm:text-[10px] font-bold text-blue-700">
            #{stop.stopOrder}
          </span>
          <h4 className="font-semibold text-slate-900 text-[11px] sm:text-sm truncate">
            {stop.stopName}
          </h4>
        </div>
      </div>
    </div>
  );
}

function getSegmentDuration(
  fromStop: RouteStopType,
  toStop: RouteStopType,
  stopIntervals: StopInterval[],
) {
  const interval = stopIntervals.find(
    (item) => item.fromStopId === fromStop.id && item.toStopId === toStop.id,
  );

  return interval?.durationInSeconds ?? 0;
}