"use client";

import { useVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments";
import { useState, useEffect, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  Bus,
  CalendarDays,
  AlertTriangle,
  Navigation,
  ArrowRightCircle,
  ArrowLeftCircle,
  ArrowLeft,
  Route,
  Clock,
  MapPin,
  Search,
  X,
  ListFilter,
  SlidersHorizontal,
} from "lucide-react";

type DirectionFilter = "ALL" | "FORWARD" | "BACKWARD";
type VehicleTypeFilter = "ALL" | "REGULAR" | "PREMIUM";
type SortOption = "routeCode" | "nearestArrival" | "vehicleCount";

export default function VehicleSchedulesPage0() {
  const router = useRouter();
  const todayString = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const isToday = selectedDate === todayString;

  const { schedules, schedulesLoading, schedulesError, fetchSchedulesByDate } =
    useVehicleAssignments();

  useEffect(() => {
    fetchSchedulesByDate(selectedDate);
  }, [selectedDate, fetchSchedulesByDate]);

  // Filter, pencarian & pengurutan
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDirection, setFilterDirection] = useState<DirectionFilter>("ALL");
  const [filterVehicleType, setFilterVehicleType] = useState<VehicleTypeFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("routeCode");

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

  // Waktu tiba paling awal dalam satu rute — dipakai untuk sort "Kedatangan Terdekat"
  const getEarliestArrivalTime = (
    group: (typeof groupedSchedules)[number]
  ) => {
    let earliest: string | null = null;
    group.stops.forEach((stop) => {
      stop.arrivals.forEach((arrival) => {
        const t = arrival.estimatedArrivalTime.slice(0, 5);
        if (earliest === null || t < earliest) earliest = t;
      });
    });
    return earliest ?? "99:99";
  };

  // Terapkan filter arah, tipe armada, pencarian, lalu urutkan hasilnya.
  // Filter tipe armada bekerja di level chip (halte tetap tampil, hanya
  // armada yang tidak cocok yang disembunyikan); halte yang jadi kosong
  // ikut disembunyikan supaya susunan halte tetap rapi.
  const visibleSchedules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = groupedSchedules
      .filter(
        (group) =>
          filterDirection === "ALL" ||
          group.direction?.toUpperCase() === filterDirection
      )
      .map((group) => {
        const stops = group.stops
          .map((stop) => ({
            ...stop,
            arrivals: stop.arrivals.filter((arrival) => {
              if (filterVehicleType === "ALL") return true;
              const type = arrival.vehicle?.type?.toUpperCase();
              return filterVehicleType === "PREMIUM"
                ? type === "PREMIUM"
                : type !== "PREMIUM";
            }),
          }))
          .filter((stop) => stop.arrivals.length > 0);
        return { ...group, stops };
      })
      .filter((group) => group.stops.length > 0)
      .filter((group) => {
        if (!query) return true;
        const matchesRoute =
          group.routeCode.toLowerCase().includes(query) ||
          group.routeName.toLowerCase().includes(query);
        const matchesStopOrVehicle = group.stops.some(
          (stop) =>
            stop.stopName.toLowerCase().includes(query) ||
            stop.arrivals.some((arrival) =>
              arrival.vehicle?.plateNumber?.toLowerCase().includes(query)
            )
        );
        return matchesRoute || matchesStopOrVehicle;
      });

    return [...filtered].sort((a, b) => {
      if (sortBy === "vehicleCount") return b.vehicleCount - a.vehicleCount;
      if (sortBy === "nearestArrival")
        return getEarliestArrivalTime(a).localeCompare(
          getEarliestArrivalTime(b)
        );
      return a.routeCode.localeCompare(b.routeCode);
    });
  }, [groupedSchedules, searchQuery, filterDirection, filterVehicleType, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    filterDirection !== "ALL" ||
    filterVehicleType !== "ALL";

  const resetFilters = () => {
    setSearchQuery("");
    setFilterDirection("ALL");
    setFilterVehicleType("ALL");
  };

  // Menghitung selisih waktu ke kedatangan — ini yang paling dicari user:
  // "angkotnya berapa menit lagi?" bukan sekadar jam berapa.
  const getArrivalMeta = (estimatedArrivalTime: string) => {
    const timePart = estimatedArrivalTime.slice(0, 5); // "HH:mm"
    const [h, m] = timePart.split(":").map(Number);

    if (!isToday || Number.isNaN(h) || Number.isNaN(m)) {
      return { time: timePart, diffLabel: null, tone: "normal" as const };
    }

    const target = new Date();
    target.setHours(h, m, 0, 0);
    const diffMin = Math.round((target.getTime() - Date.now()) / 60000);

    if (diffMin < -2) {
      return { time: timePart, diffLabel: "Sudah lewat", tone: "passed" as const };
    }
    if (diffMin <= 15) {
      return {
        time: timePart,
        diffLabel: diffMin <= 0 ? "Tiba sekarang" : `${diffMin} menit lagi`,
        tone: "soon" as const,
      };
    }
    return { time: timePart, diffLabel: `${diffMin} menit lagi`, tone: "normal" as const };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>

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
              className="text-black px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {!isToday && (
              <button
                onClick={() => setSelectedDate(todayString)}
                className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
              >
                Hari Ini
              </button>
            )}
          </div>
        </div>

        {/* Toolbar: Cari, Filter, Urutkan */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari rute, halte, atau plat nomor..."
              className="w-full pl-9 pr-8 py-2 text-sm text-black placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter arah */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
              {(
                [
                  { value: "ALL", label: "Semua Arah" },
                  { value: "FORWARD", label: "Berangkat" },
                  { value: "BACKWARD", label: "Kembali" },
                ] as { value: DirectionFilter; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterDirection(opt.value)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                    filterDirection === opt.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Filter tipe armada */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
              {(
                [
                  { value: "ALL", label: "Semua Armada" },
                  { value: "REGULAR", label: "Reguler" },
                  { value: "PREMIUM", label: "Premium" },
                ] as { value: VehicleTypeFilter; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterVehicleType(opt.value)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                    filterVehicleType === opt.value
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Urutkan */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-1 py-1">
              <ListFilter size={13} className="text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs font-bold text-slate-700 bg-transparent py-1 pr-1 focus:outline-none cursor-pointer"
              >
                <option value="routeCode">Kode Rute</option>
                <option value="nearestArrival">Kedatangan Terdekat</option>
                <option value="vehicleCount">Armada Terbanyak</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors whitespace-nowrap"
              >
                <X size={13} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Ringkasan hasil */}
        {!schedulesLoading && groupedSchedules.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4 text-xs font-medium text-slate-500">
            <SlidersHorizontal size={12} />
            Menampilkan {visibleSchedules.length} dari {groupedSchedules.length}{" "}
            rute
          </div>
        )}

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
          /* Empty State: tidak ada jadwal sama sekali di tanggal ini */
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
            {!isToday && (
              <button
                onClick={() => setSelectedDate(todayString)}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                Lihat jadwal hari ini
              </button>
            )}
          </div>
        ) : visibleSchedules.length === 0 ? (
          /* Empty State: ada jadwal, tapi tidak cocok dengan filter/pencarian */
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <Search size={20} />
            </div>
            <p className="text-slate-500 text-base">
              Tidak ada rute yang cocok dengan pencarian atau filter saat ini.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              Reset filter & pencarian
            </button>
          </div>
        ) : (
          /* List of Grouped Routes */
          <div className="grid grid-cols-1 gap-6">
            {visibleSchedules.map((group, index) => {
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
                  <div className="p-5 md:p-8">
                    <div className="flex items-center justify-between mb-5 md:mb-9">
                      <h5 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                        <Navigation size={12} />
                        Estimasi Waktu Tiba di Halte
                      </h5>
                      <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <MapPin size={12} />
                        {group.stops.length} halte dilalui
                      </span>
                    </div>

                    <div className="relative">
                      {/* Fade hints di tepi scroll — hanya desktop */}
                      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent z-20 hidden md:block" />
                      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-20 hidden md:block" />

                      <div className="md:overflow-x-auto md:pb-3 md:[scrollbar-width:thin]">
                        <div className="relative flex flex-col md:flex-row md:items-start md:min-w-max md:px-3">
                          {/* Garis penghubung tunggal — vertikal di mobile, horizontal di desktop */}
                          <div
                            aria-hidden
                            className="absolute z-0 left-[13px] top-1 bottom-1 w-[3px] rounded-full
                                       bg-gradient-to-b from-emerald-400 via-blue-300 to-rose-400
                                       md:left-3 md:right-3 md:top-[15px] md:bottom-auto md:h-[3px] md:w-auto
                                       md:bg-gradient-to-r"
                          />

                          {group.stops.map((stop, i, arr) => {
                            const isFirst = i === 0;
                            const isLast = i === arr.length - 1;
                            const dotClass = isFirst
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : isLast
                              ? "bg-rose-600 border-rose-600 text-white"
                              : "bg-white border-blue-500 text-blue-600";

                            return (
                              <div
                                key={stop.stopName + stop.stopOrder}
                                className="relative z-10 flex md:flex-col items-start md:items-center gap-3 md:gap-0
                                           pb-7 md:pb-0 last:pb-0 md:w-52 md:shrink-0 md:text-center"
                              >
                                {/* Dot halte */}
                                <div
                                  className={`relative z-10 w-7 h-7 md:w-8 md:h-8 mt-0.5 md:mt-0 shrink-0 rounded-full
                                              border-[3px] ring-4 ring-slate-50 flex items-center justify-center
                                              text-[10px] md:text-[11px] font-bold shadow-sm ${dotClass}`}
                                >
                                  {stop.stopOrder}
                                </div>

                                {/* Info halte + armada */}
                                <div className="min-w-0 flex-1 md:flex-none md:w-full md:mt-3.5">
                                  <p
                                    className="text-sm md:text-[13px] font-semibold text-slate-800 md:leading-snug md:mb-2.5 md:px-1"
                                    title={stop.stopName}
                                  >
                                    {stop.stopName}
                                  </p>

                                  <div className="mt-1.5 md:mt-0 flex flex-wrap md:flex-col gap-1.5 md:items-stretch">
                                    {stop.arrivals.map((arrival) => {
                                      const isPremium =
                                        arrival.vehicle?.type?.toUpperCase() ===
                                        "PREMIUM";
                                      const meta = getArrivalMeta(
                                        arrival.estimatedArrivalTime
                                      );
                                      const isPassed = meta.tone === "passed";
                                      const isSoon = meta.tone === "soon";

                                      const chipClass = isPassed
                                        ? "bg-slate-50 text-slate-400 border-slate-200"
                                        : isPremium
                                        ? "bg-purple-50 text-purple-700 border-purple-100"
                                        : "bg-blue-50 text-blue-700 border-blue-100";

                                      return (
                                        <span
                                          key={arrival.assignmentId}
                                          className={`flex flex-col gap-0.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border
                                                      min-w-[108px] md:w-full transition-shadow hover:shadow-sm ${chipClass} ${
                                            isSoon
                                              ? "ring-2 ring-emerald-400/70 ring-offset-1 ring-offset-white"
                                              : ""
                                          }`}
                                        >
                                          <span className="flex items-center justify-between gap-2">
                                            <span className="flex items-center gap-1 min-w-0">
                                              <Bus size={10} className="shrink-0 opacity-70" />
                                              <span className="truncate">
                                                {arrival.vehicle?.plateNumber}
                                              </span>
                                            </span>
                                            <span className="flex items-center gap-1 tabular-nums shrink-0">
                                              <Clock size={10} className="shrink-0 opacity-70" />
                                              {meta.time}
                                            </span>
                                          </span>

                                          {meta.diffLabel && (
                                            <span
                                              className={`flex items-center gap-1 text-[10px] font-semibold ${
                                                isSoon
                                                  ? "text-emerald-600"
                                                  : isPassed
                                                  ? "text-slate-400"
                                                  : "text-slate-500"
                                              }`}
                                            >
                                              {isSoon && (
                                                <span className="relative flex h-1.5 w-1.5">
                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                                </span>
                                              )}
                                              {meta.diffLabel}
                                            </span>
                                          )}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
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