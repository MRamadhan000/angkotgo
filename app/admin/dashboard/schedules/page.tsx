"use client";

import { useVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments";
import { useState, useEffect, useMemo, Fragment } from "react";
import {
  Bus,
  CalendarDays,
  AlertTriangle,
  Navigation,
  ArrowRightCircle,
  ArrowLeftCircle,
  Route,
} from "lucide-react";

export default function VehicleSchedulesPage0() {
  const todayString = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayString);

  const { schedules, schedulesLoading, schedulesError, fetchSchedulesByDate } =
    useVehicleAssignments();

  useEffect(() => {
    fetchSchedulesByDate(selectedDate);
  }, [selectedDate, fetchSchedulesByDate]);

  // Grouping data berdasarkan routeCode + direction, lalu di-flatten per HALTE
  // (bukan per armada) — tiap halte menyimpan daftar armada yang lewat & jam tibanya.
  const groupedSchedules = useMemo(() => {
    type Arrival = {
      assignmentId: string;
      estimatedArrivalTime: string;
      vehicle: (typeof schedules)[number]["vehicle"];
    };

    const routeMap = new Map<
      string,
      {
        routeCode: string;
        routeName: string;
        direction: string;
        vehicleIds: Set<string>;
        stopsMap: Map<
          string,
          { stopOrder: number; stopName: string; arrivals: Arrival[] }
        >;
      }
    >();

    schedules.forEach((item) => {
      const key = `${item.routeCode}-${item.direction}`;
      if (!routeMap.has(key)) {
        routeMap.set(key, {
          routeCode: item.routeCode,
          routeName: item.routeName,
          direction: item.direction,
          vehicleIds: new Set(),
          stopsMap: new Map(),
        });
      }
      const routeGroup = routeMap.get(key)!;
      routeGroup.vehicleIds.add(item.assignmentId.toString());

      item.estimatedStopsSchedule.forEach((stop) => {
        if (!routeGroup.stopsMap.has(stop.stopId.toString())) {
          routeGroup.stopsMap.set(stop.stopId.toString(), {
            stopOrder: stop.stopOrder,
            stopName: stop.stopName,
            arrivals: [],
          });
        }
        routeGroup.stopsMap.get(stop.stopId.toString())!.arrivals.push({
          assignmentId: item.assignmentId.toString(),
          estimatedArrivalTime: stop.estimatedArrivalTime,
          vehicle: item.vehicle,
        });
      });
    });

    return Array.from(routeMap.values()).map((group) => ({
      routeCode: group.routeCode,
      routeName: group.routeName,
      direction: group.direction,
      vehicleCount: group.vehicleIds.size,
      stops: Array.from(group.stopsMap.values())
        .sort((a, b) => a.stopOrder - b.stopOrder)
        .map((stop) => ({
          ...stop,
          arrivals: [...stop.arrivals].sort((a, b) =>
            a.estimatedArrivalTime.localeCompare(b.estimatedArrivalTime)
          ),
        })),
    }));
  }, [schedules]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Bus size={22} strokeWidth={2.25} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                Jadwal & Estimasi Kedatangan Angkot
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Estimasi waktu tiba angkot di setiap halte, berdasarkan rute.
              </p>
            </div>
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 pl-2 text-slate-500">
              <CalendarDays size={16} />
              <label htmlFor="schedule-date" className="text-sm font-medium">
                Pilih Tanggal
              </label>
            </div>
            <input
              id="schedule-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Error State */}
        {schedulesError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{schedulesError}</span>
          </div>
        )}

        {/* Loading State */}
        {schedulesLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-blue-600"></div>
            <p className="text-sm">Memuat jadwal...</p>
          </div>
        ) : groupedSchedules.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <Bus size={22} />
            </div>
            <p className="text-slate-500 text-base">
              Tidak ada jadwal penugasan kendaraan pada tanggal{" "}
              <span className="font-semibold text-slate-800">
                {selectedDate}
              </span>
              .
            </p>
          </div>
        ) : (
          /* List of Grouped Routes */
          <div className="grid grid-cols-1 gap-6">
            {groupedSchedules.map((group, index) => {
              const isForward = group.direction?.toUpperCase() === "FORWARD";
              const directionBadgeClass = isForward
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : "bg-amber-100 text-amber-800 border-amber-200";
              const DirectionIcon = isForward
                ? ArrowRightCircle
                : ArrowLeftCircle;

              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Header Rute */}
                  <div className="bg-white px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white font-bold text-sm rounded-lg shadow-sm">
                        <Route size={14} />
                        {group.routeCode}
                      </span>
                      <div>
                        <h2 className="text-slate-900 font-bold text-lg">
                          {group.routeName}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">
                            Arah / Jalur:
                          </span>
                          <span
                            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${directionBadgeClass}`}
                          >
                            <DirectionIcon size={12} />
                            {group.direction}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-medium border border-slate-200 self-start md:self-auto">
                      <Bus size={14} />
                      {group.vehicleCount} Armada Beroperasi
                    </span>
                  </div>

                  {/* Body: Garis Rute per Halte — fokus pada halte, bukan armada */}
                  <div className="p-6 md:p-8">
                    <h5 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4 md:mb-8 flex items-center gap-1.5">
                      <Navigation size={12} />
                      Estimasi Waktu Tiba di Halte
                    </h5>

                    <div className="md:overflow-x-auto md:pb-2 md:[scrollbar-width:thin]">
                      <div className="flex flex-col md:flex-row md:items-start gap-0 md:gap-0 md:min-w-max md:px-1">
                        {group.stops.map((stop, i, arr) => {
                          const isFirst = i === 0;
                          const isLast = i === arr.length - 1;
                          const dotClass = isFirst
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : isLast
                            ? "bg-rose-600 border-rose-600 text-white"
                            : "bg-white border-blue-600 text-blue-600";

                          return (
                            <Fragment key={stop.stopName + stop.stopOrder}>
                              {/* Node: dot + nama halte + daftar armada yang lewat */}
                              <div className="flex md:flex-col items-start md:items-center gap-3 md:gap-3 md:w-56 md:shrink-0 md:text-center">
                                <div
                                  className={`relative z-10 w-7 h-7 md:w-9 md:h-9 mt-0.5 md:mt-0 shrink-0 rounded-full border-2 flex items-center justify-center text-[10px] md:text-xs font-bold shadow-sm ${dotClass}`}
                                >
                                  {stop.stopOrder}
                                </div>
                                <div className="min-w-0 flex-1 md:flex-none md:w-full">
                                  <p
                                    className="text-sm md:text-[15px] font-semibold text-slate-800 md:leading-tight md:mb-3"
                                    title={stop.stopName}
                                  >
                                    {stop.stopName}
                                  </p>
                                  <div className="mt-1.5 md:mt-0 flex flex-wrap md:flex-col gap-1 md:gap-1.5 md:items-stretch">
                                    {stop.arrivals.map((arrival) => {
                                      const isPremium =
                                        arrival.vehicle?.type?.toUpperCase() ===
                                        "PREMIUM";
                                      const chipClass = isPremium
                                        ? "bg-purple-50 text-purple-700 border-purple-100"
                                        : "bg-blue-50 text-blue-700 border-blue-100";
                                      return (
                                        <span
                                          key={arrival.assignmentId}
                                          className={`inline-flex items-center justify-center md:justify-between gap-1 text-[10px] md:text-xs font-bold px-1.5 md:px-2.5 py-0.5 md:py-1.5 rounded-md border ${chipClass}`}
                                        >
                                          <span className="inline-flex items-center gap-1">
                                            <Bus size={10} className="shrink-0" />
                                            {arrival.vehicle?.plateNumber}
                                          </span>
                                          <span className="opacity-50 md:hidden">
                                            ·
                                          </span>
                                          <span>{arrival.estimatedArrivalTime}</span>
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Connector: vertikal di mobile, horizontal di desktop */}
                              {!isLast && (
                                <div
                                  className="w-0.5 h-6 ml-[15px] border-l-2 border-dashed border-slate-300
                                             md:w-auto md:h-0 md:ml-0 md:mt-[17px] md:flex-1 md:min-w-10 md:self-start
                                             md:border-l-0 md:border-t-2"
                                />
                              )}
                            </Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}