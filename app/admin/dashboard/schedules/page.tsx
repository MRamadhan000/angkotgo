"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiTruck,
  FiSearch,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiInbox,
  FiArrowLeft,
  FiActivity,
  FiX,
  FiCheck,
  FiArrowRight,
} from "react-icons/fi";

/* =========================================================
1. TYPES & API RESPONSE INTERFACES
   ========================================================= */

export interface ApiStopEta {
  halteId: number;
  halteName: string;
  stopSequence: number;
  distanceMeters: number;
  etaMinutes: number;
  estimatedArrival: string;
}

export interface ApiRouteEta {
  routeId: number;
  routeCode: string;
  routeName: string;
  vehicleAssignmentId: number;
  vehicleId: number;
  vehicleCode: string;
  plateNumber: string;
  startTime: string;
  positionSource: string;
  estimationStatus: "SCHEDULE_BASED" | "GPS_BASED" | string;
  averageSpeedKmh: number;
  gpsUpdatedAt: string | null;
  stops: ApiStopEta[];
}

export interface ApiEtaResponse {
  date: string;
  routes: ApiRouteEta[];
}

/* =========================================================
2. API LAYER & HELPER UTILS
   ========================================================= */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function getTodayIsoString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function fetchEtaSchedule(date: string): Promise<ApiEtaResponse> {
  const res = await fetch(`${API_URL}/tracking/eta?date=${date}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = Array.isArray(json?.message)
      ? json.message.join(", ")
      : (json?.message ?? `Gagal mengambil jadwal angkot (${res.status})`);
    throw new Error(msg);
  }

  return json ?? { date, routes: [] };
}

/* =========================================================
3. ENTRY POINT WITH PROVIDER
   ========================================================= */

export default function TodaySchedulePage() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TodayScheduleContent />
    </QueryClientProvider>
  );
}

/* =========================================================
4. MAIN CONTENT COMPONENT
   ========================================================= */

function TodayScheduleContent() {
  const router = useRouter();
  const todayStr = useMemo(() => getTodayIsoString(), []);

  // Filter States
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // State pencatat halte tersembunyi (Default: Kosong -> Semua halte TAMPIL)
  const [collapsedRouteIds, setCollapsedRouteIds] = useState<Record<number, boolean>>({});

  // Query Fetching
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["tracking-eta-schedule", selectedDate],
    queryFn: () => fetchEtaSchedule(selectedDate),
    enabled: Boolean(selectedDate),
  });

  const routes = data?.routes ?? [];

  // Grouping per Trayek (routeCode) & Filtering
  const groupedRoutes = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();

    const filtered = routes.filter((r) => {
      if (!searchLower) return true;
      const matchesCode = r.routeCode.toLowerCase().includes(searchLower);
      const matchesName = r.routeName.toLowerCase().includes(searchLower);
      const matchesVehicle =
        r.vehicleCode.toLowerCase().includes(searchLower) ||
        r.plateNumber.toLowerCase().includes(searchLower);
      const matchesHalte = r.stops.some((s) =>
        s.halteName.toLowerCase().includes(searchLower),
      );

      return matchesCode || matchesName || matchesVehicle || matchesHalte;
    });

    const map = new Map<
      string,
      { routeCode: string; routeName: string; assignments: ApiRouteEta[] }
    >();

    for (const item of filtered) {
      const key = item.routeCode;
      if (!map.has(key)) {
        map.set(key, {
          routeCode: item.routeCode,
          routeName: item.routeName,
          assignments: [],
        });
      }
      map.get(key)!.assignments.push(item);
    }

    return Array.from(map.values());
  }, [routes, searchTerm]);

  // Toggle Collapse
  const toggleCollapse = (assignmentId: number) => {
    setCollapsedRouteIds((prev) => ({
      ...prev,
      [assignmentId]: !prev[assignmentId],
    }));
  };

  const isToday = selectedDate === todayStr;

  return (
    <div className="min-h-screen w-full bg-slate-100 font-sans text-slate-900 antialiased pb-12 select-none">
      {/* ---------------------------------------------------------
          HEADER BAR
      --------------------------------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition active:bg-slate-100"
              title="Kembali"
            >
              <FiArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900">
                Jadwal Operational Angkot
              </h1>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <FiClock className="h-3 w-3" />
                Updated {dataUpdatedAt ? formatClock(dataUpdatedAt) : "-"}
                {isFetching && (
                  <span className="font-bold text-blue-600">• memuat...</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition active:bg-slate-100 disabled:opacity-50"
          >
            <FiRefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 pt-4">
        {/* ---------------------------------------------------------
            FILTER & SEARCH TOOLBAR
        --------------------------------------------------------- */}
        <div className="rounded-xl border border-slate-300 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Custom Date Picker Trigger */}
            <div className="relative flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Tanggal:</span>
              <button
                onClick={() => setIsCalendarOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 transition hover:bg-slate-100 active:scale-95"
              >
                <FiCalendar className="text-blue-600" size={15} />
                <span>{formatDateDisplay(selectedDate)}</span>
                <FiChevronDown className="text-slate-500" size={14} />
              </button>

              {isToday && (
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-800 uppercase">
                  Hari Ini
                </span>
              )}

              {/* Custom Date Picker Popover */}
              {isCalendarOpen && (
                <CustomCalendarPicker
                  selectedDate={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setIsCalendarOpen(false);
                  }}
                  onClose={() => setIsCalendarOpen(false)}
                />
              )}
            </div>

            {/* Input Search Trayek / Halte */}
            <div className="relative min-w-[220px]">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Cari Kode Trayek / Halte / Plat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-7 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-slate-800"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------
            CONTENT LOADING / ERROR / EMPTY STATES
        --------------------------------------------------------- */}
        {isLoading ? (
          <ScheduleSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
            <FiAlertCircle className="h-8 w-8 text-rose-600" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                Gagal Memuat Jadwal
              </h3>
              <p className="text-xs text-slate-600">
                {error instanceof Error
                  ? error.message
                  : "Terjadi kesalahan koneksi server."}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              Coba Lagi
            </button>
          </div>
        ) : groupedRoutes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <FiInbox className="mb-2 h-8 w-8 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-800">
              Tidak Ada Jadwal Operasional
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {routes.length === 0
                ? `Belum ada penugasan armada angkot untuk tanggal ${formatDateDisplay(selectedDate)}.`
                : "Tidak ada data yang cocok dengan kriteria pencarian Anda."}
            </p>
          </div>
        ) : (
          /* ---------------------------------------------------------
              GROUPED ROUTES LIST
          --------------------------------------------------------- */
          <div className="space-y-4">
            {groupedRoutes.map((group) => (
              <div
                key={group.routeCode}
                className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xs"
              >
                {/* Header Trayek */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-10 items-center justify-center rounded-md bg-blue-600 font-mono text-xs font-black text-white">
                      {group.routeCode}
                    </span>
                    <div>
                      <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                        {group.routeName}
                      </h2>
                      <p className="text-[10px] font-semibold text-slate-500">
                        {group.assignments.length} Armada Beroperasi
                      </p>
                    </div>
                  </div>
                </div>

                {/* List Penugasan Armada pada Trayek Ini */}
                <div className="divide-y divide-slate-200">
                  {group.assignments.map((item) => {
                    const isCollapsed = Boolean(
                      collapsedRouteIds[item.vehicleAssignmentId],
                    );
                    const isExpanded = !isCollapsed;

                    return (
                      <div
                        key={item.vehicleAssignmentId}
                        className="p-4 transition hover:bg-slate-50/50"
                      >
                        {/* Summary Header Armada */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700">
                              <FiTruck size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900">
                                  {item.vehicleCode}
                                </span>
                                <span className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                                  {item.plateNumber}
                                </span>
                              </div>
                              <p className="mt-0.5 flex items-center gap-2 text-[11px] font-medium text-slate-500">
                                <span className="flex items-center gap-1 font-bold text-slate-700">
                                  <FiClock className="text-slate-400" /> Jam
                                  Mulai: {item.startTime.slice(0, 5)}
                                </span>
                                <span>•</span>
                                <span className="truncate">
                                  Posisi: {item.positionSource}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Status Badge & Toggle Button */}
                          <div className="flex items-center justify-between sm:justify-end gap-3">
                            <div className="text-left sm:text-right">
                              <span
                                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                  item.estimationStatus === "GPS_BASED"
                                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                    : "bg-blue-100 text-blue-900 border border-blue-300"
                                }`}
                              >
                                <FiActivity className="h-3 w-3" />
                                {item.estimationStatus === "GPS_BASED"
                                  ? "Live GPS"
                                  : "Terjadwal"}
                              </span>
                              <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                                Kecepatan: {item.averageSpeedKmh} km/jam
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                toggleCollapse(item.vehicleAssignmentId)
                              }
                              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 active:scale-95"
                            >
                              <span>Halte ({item.stops.length})</span>
                              {isExpanded ? (
                                <FiChevronUp />
                              ) : (
                                <FiChevronDown />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* ---------------------------------------------------------
                            DAFTAR HALTE HORIZONTAL / KE KANAN (HALTE -> HALTE)
                        --------------------------------------------------------- */}
                        {isExpanded && (
                          <div className="mt-4 border-t border-slate-200 pt-3">
                            <div className="flex items-center justify-between mb-2.5">
                              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <FiMapPin className="text-blue-600" />
                                Rute & Estimasi Kedatangan Halte (ETA)
                              </h4>
                              <span className="text-[10px] font-semibold text-slate-400">
                                Total {item.stops.length} Halte
                              </span>
                            </div>

                            {item.stops.length === 0 ? (
                              <p className="py-2 text-[11px] italic text-slate-400">
                                Belum ada titik halte pemberhentian yang terdaftar.
                              </p>
                            ) : (
                              <div className="flex items-stretch gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
                                {item.stops.map((stop, index) => {
                                  const isFirst = stop.stopSequence === 1;
                                  const isLast = index === item.stops.length - 1;
                                  const isArrived = stop.etaMinutes === 0;

                                  return (
                                    <div
                                      key={stop.halteId}
                                      className="flex shrink-0 items-center gap-2"
                                    >
                                      {/* Card Item Halte */}
                                      <div
                                        className={`flex w-48 flex-col justify-between rounded-xl border p-2.5 transition ${
                                          isFirst
                                            ? "border-emerald-300 bg-emerald-50/60"
                                            : isArrived
                                              ? "border-blue-300 bg-blue-50/50"
                                              : "border-slate-200 bg-slate-50/80"
                                        }`}
                                      >
                                        <div>
                                          <div className="flex items-center justify-between gap-1 mb-1">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 font-mono text-[10px] font-black text-white shrink-0">
                                              {stop.stopSequence}
                                            </span>
                                            <span
                                              className={`rounded px-1.5 py-0.2 text-[9px] font-extrabold uppercase ${
                                                isFirst
                                                  ? "bg-emerald-200 text-emerald-900"
                                                  : isArrived
                                                    ? "bg-blue-200 text-blue-900"
                                                    : "bg-slate-200 text-slate-700"
                                              }`}
                                            >
                                              {isFirst
                                                ? "Awal"
                                                : isArrived
                                                  ? "Tiba"
                                                  : `+${stop.etaMinutes} mnt`}
                                            </span>
                                          </div>
                                          <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                                            {stop.halteName}
                                          </p>
                                        </div>

                                        <div className="mt-3 flex items-end justify-between border-t border-slate-200/60 pt-1.5">
                                          <span className="text-[10px] font-semibold text-slate-500">
                                            {(stop.distanceMeters / 1000).toFixed(1)} km
                                          </span>
                                          <span className="font-mono text-xs font-black text-slate-900">
                                            {formatClock(stop.estimatedArrival)}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Arrow Divider / Penghubung antar halte */}
                                      {!isLast && (
                                        <div className="flex items-center text-slate-300 px-0.5 shrink-0">
                                          <FiArrowRight size={16} />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* =========================================================
5. CUSTOM CALENDAR PICKER COMPONENT
   ========================================================= */

interface CustomCalendarPickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelect: (dateIso: string) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_NAMES = ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function CustomCalendarPicker({
  selectedDate,
  onSelect,
  onClose,
}: CustomCalendarPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = useMemo(() => {
    const parsed = new Date(selectedDate);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [selectedDate]);

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        dateIso: "",
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      days.push({
        day: d,
        isCurrentMonth: true,
        dateIso: `${currentYear}-${monthStr}-${dayStr}`,
      });
    }

    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        dateIso: "",
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleTodayClick = () => {
    const today = getTodayIsoString();
    onSelect(today);
  };

  const todayStr = getTodayIsoString();

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-300 bg-white p-3 shadow-xl animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:scale-95"
          title="Bulan Sebelumnya"
        >
          <FiChevronLeft size={16} />
        </button>

        <span className="text-xs font-black text-slate-900">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:scale-95"
          title="Bulan Berikutnya"
        >
          <FiChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAY_NAMES.map((dayName) => (
          <span
            key={dayName}
            className="text-[10px] font-black uppercase tracking-wider text-slate-400"
          >
            {dayName}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((item, idx) => {
          if (!item.isCurrentMonth) {
            return (
              <span
                key={idx}
                className="flex h-8 items-center justify-center text-[11px] font-medium text-slate-300"
              >
                {item.day}
              </span>
            );
          }

          const isSelected = item.dateIso === selectedDate;
          const isToday = item.dateIso === todayStr;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(item.dateIso)}
              className={`flex h-8 items-center justify-center rounded-lg text-xs font-bold transition active:scale-95 ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : isToday
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-slate-800 hover:bg-slate-100"
              }`}
            >
              {item.day}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
        <button
          type="button"
          onClick={handleTodayClick}
          className="flex items-center gap-1 font-bold text-blue-600 hover:underline"
        >
          <FiCheck size={12} />
          <span>Pilih Hari Ini</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="font-semibold text-slate-500 hover:text-slate-800"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

/* =========================================================
6. SKELETON & GENERAL UTILS
   ========================================================= */

function ScheduleSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-xl bg-slate-200" />
      ))}
    </div>
  );
}

function formatDateDisplay(isoDate: string) {
  try {
    const [year, month, day] = isoDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

function formatClock(input: string | number) {
  try {
    return new Date(input).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(input);
  }
}