"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiChevronRight,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiTruck,
  FiX,
  FiLoader,
  FiInbox,
  FiCalendar,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";

/* =========================================================
1. TYPES & DUMMY DATA
   ========================================================= */

export enum TripStatus {
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface TripHistory {
  id: number;
  dateKey: string; // YYYY-MM-DD
  vehicleCode: string;
  plateNumber: string;
  routeName: string;
  origin: string;
  destination: string;
  startTime: string;
  endTime: string;
  status: TripStatus;
  passengers: number;
  revenue: number;
}

type StatusFilter = "ALL" | TripStatus;

const FARE = 5000;
const PAGE_SIZE = 5;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const daysAgoKey = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toKey(d);
};

const buildDummyTrips = (): TripHistory[] => {
  const base = {
    vehicleCode: "AL-04",
    plateNumber: "N 1842 UB",
  };
  const AJ = {
    routeName: "Arjosari - Landungsari (Via Suhat)",
    origin: "Terminal Arjosari",
    destination: "Terminal Landungsari",
  };
  const LA = {
    routeName: "Landungsari - Arjosari (Via Suhat)",
    origin: "Terminal Landungsari",
    destination: "Terminal Arjosari",
  };

  const mk = (
    id: number,
    daysAgo: number,
    r: typeof AJ,
    startTime: string,
    endTime: string,
    passengers: number,
    status: TripStatus = TripStatus.COMPLETED,
  ): TripHistory => ({
    id,
    dateKey: daysAgoKey(daysAgo),
    ...base,
    ...r,
    startTime,
    endTime,
    status,
    passengers: status === TripStatus.CANCELLED ? 0 : passengers,
    revenue: status === TripStatus.CANCELLED ? 0 : passengers * FARE,
  });

  return [
    mk(99, 1, AJ, "06:00", "07:45", 11),
    mk(98, 1, LA, "14:00", "16:00", 9),
    mk(97, 2, AJ, "08:00", "10:15", 12),
    mk(96, 2, LA, "13:00", "15:15", 7),
    mk(95, 2, AJ, "16:30", "18:45", 0, TripStatus.CANCELLED),
    mk(94, 3, AJ, "06:00", "07:45", 10),
    mk(93, 3, LA, "14:00", "16:00", 12),
    mk(92, 5, AJ, "08:00", "10:15", 8),
    mk(91, 5, LA, "13:00", "15:15", 11),
    mk(90, 6, AJ, "16:30", "18:45", 6),
    mk(89, 7, LA, "06:00", "07:45", 0, TripStatus.CANCELLED),
    mk(88, 8, AJ, "08:00", "10:15", 12),
  ];
};

/* =========================================================
2. HELPERS
   ========================================================= */

const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

const dateLabel = (key: string) => {
  if (key === daysAgoKey(0)) return "Hari ini";
  if (key === daysAgoKey(1)) return "Kemarin";
  const [y, m, d] = key.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function Skel({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />
  );
}

/* =========================================================
3. MAIN COMPONENT
   ========================================================= */

export default function TripHistoryPage() {
  const router = useRouter();

  const [trips, setTrips] = useState<TripHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedTrip, setSelectedTrip] = useState<TripHistory | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setTrips(buildDummyTrips());
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(
    () => trips.filter((t) => filter === "ALL" || t.status === filter),
    [trips, filter],
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const grouped = useMemo(() => {
    const map = new Map<string, TripHistory[]>();
    visible.forEach((t) => {
      map.set(t.dateKey, [...(map.get(t.dateKey) ?? []), t]);
    });
    return Array.from(map.entries());
  }, [visible]);

  const summary = useMemo(() => {
    const done = trips.filter((t) => t.status === TripStatus.COMPLETED);
    return {
      totalDone: done.length,
      totalPassengers: done.reduce((s, t) => s + t.passengers, 0),
      totalRevenue: done.reduce((s, t) => s + t.revenue, 0),
    };
  }, [trips]);

  const changeFilter = (f: StatusFilter) => {
    setFilter(f);
    setVisibleCount(PAGE_SIZE);
  };

  const loadMore = async () => {
    setIsLoadingMore(true);
    await wait(600);
    setVisibleCount((c) => c + PAGE_SIZE);
    setIsLoadingMore(false);
  };

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "ALL", label: "Semua Perjalanan" },
    { key: TripStatus.COMPLETED, label: "Selesai" },
    { key: TripStatus.CANCELLED, label: "Dibatalkan" },
  ];

  return (
    <div className="min-h-dvh w-full bg-slate-100 pb-12 font-sans text-slate-900 antialiased select-none">
      {/* ---------------------------------------------------------
         TOP NAVBAR / HEADER
      --------------------------------------------------------- */}
      <header className="sticky top-0 z-30 mx-auto w-full max-w-2xl px-3 sm:px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/95 p-3 sm:p-3.5 shadow-md backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => router.back()}
                aria-label="Kembali"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition active:scale-95 hover:bg-slate-100"
              >
                <FiArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-none">
                  Riwayat Perjalanan
                </h1>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Laporan operasional & pemasukan angkot
                </p>
              </div>
            </div>

            <div className="flex h-8 items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 text-[11px] font-extrabold text-blue-700 border border-blue-100">
              <FiTruck size={13} />
              <span>AL-04</span>
            </div>
          </div>

          {/* FILTER STATUS SEGMENTED TAB */}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => changeFilter(f.key)}
                disabled={isLoading}
                className={`rounded-lg py-2 text-[11px] sm:text-xs font-bold transition active:scale-95 disabled:opacity-50 ${
                  filter === f.key
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------
         MAIN CONTENT AREA
      --------------------------------------------------------- */}
      <main className="mx-auto max-w-2xl space-y-4 px-3 sm:px-4 pt-4">
        {isLoading ? (
          /* SKELETON LOADING STATE */
          <div aria-busy="true" aria-label="Memuat riwayat" className="space-y-4">
            {/* SKELETON RINGKASAN STATS */}
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2 shadow-xs"
                >
                  <Skel className="h-3 w-12" />
                  <Skel className="h-5 w-16" />
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <Skel className="h-4 w-28" />
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <Skel className="h-4 w-40" />
                    <Skel className="h-4 w-16" />
                  </div>
                  <Skel className="h-3 w-2/3" />
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <Skel className="h-3 w-24" />
                    <Skel className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* RINGKASAN KINERJA DRIVER */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Trip
                </p>
                <p className="mt-1 text-base sm:text-lg font-black text-slate-900 leading-none">
                  {summary.totalDone} <span className="text-[10px] font-bold text-slate-400">Selesai</span>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Penumpang
                </p>
                <p className="mt-1 text-base sm:text-lg font-black text-blue-700 leading-none">
                  {summary.totalPassengers} <span className="text-[10px] font-bold text-slate-400">Orang</span>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pemasukan
                </p>
                <p className="mt-1 text-xs sm:text-sm font-black text-emerald-600 leading-none truncate">
                  {rupiah(summary.totalRevenue)}
                </p>
              </div>
            </div>

            {/* LIST GROUPED BY TANGGAL */}
            {grouped.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FiInbox size={22} />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Tidak Ada Riwayat Perjalanan
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Belum ada catatan operasional trayek untuk status filter yang dipilih saat ini.
                </p>
                {filter !== "ALL" && (
                  <button
                    onClick={() => changeFilter("ALL")}
                    className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-bold text-slate-700 active:scale-95 hover:bg-slate-100"
                  >
                    Tampilkan Semua Status
                  </button>
                )}
              </div>
            ) : (
              grouped.map(([key, items]) => (
                <section key={key} className="space-y-2">
                  <div className="flex items-center gap-1.5 px-1">
                    <FiCalendar size={13} className="text-blue-700" />
                    <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {dateLabel(key)}
                    </h2>
                  </div>

                  <div className="space-y-2.5">
                    {items.map((item) => {
                      const done = item.status === TripStatus.COMPLETED;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedTrip(item)}
                          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs transition hover:border-blue-300 active:scale-[0.99]"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                  done
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {done ? (
                                  <FiCheckCircle size={14} />
                                ) : (
                                  <FiXCircle size={14} />
                                )}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                Unit {item.vehicleCode} ({item.plateNumber})
                              </span>
                            </div>

                            <span
                              className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                done
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}
                            >
                              {done ? "Selesai" : "Dibatalkan"}
                            </span>
                          </div>

                          <div className="py-2.5 space-y-1">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                              {item.routeName}
                            </h3>
                            <p className="text-[11px] font-semibold text-slate-500">
                              {item.origin} → {item.destination}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <FiClock size={12} className="text-slate-400" />
                              <span>{item.startTime} - {item.endTime}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              {done && (
                                <span className="font-bold text-slate-700">
                                  {item.passengers} Penumpang
                                </span>
                              )}
                              <span className="font-black text-slate-900">
                                {done ? rupiah(item.revenue) : "Rp 0"}
                              </span>
                              <FiChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            )}

            {/* BUTTON LOAD MORE */}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-xs transition active:scale-98 hover:bg-slate-50 disabled:opacity-70"
              >
                {isLoadingMore ? (
                  <>
                    <FiLoader size={15} className="animate-spin text-blue-700" />
                    <span>Memuat riwayat tambahan...</span>
                  </>
                ) : (
                  <span>Muat Lebih Banyak</span>
                )}
              </button>
            )}
          </div>
        )}
      </main>

      {/* ---------------------------------------------------------
         MODAL DETAIL PERJALANAN (BOTTOM SHEET MOBILE / CENTERED DESKTOP)
      --------------------------------------------------------- */}
      {selectedTrip && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedTrip(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-5 space-y-4 border border-slate-100 shadow-2xl max-h-[85dvh] overflow-y-auto"
          >
            <div className="mx-auto h-1 w-8 rounded-full bg-slate-300 sm:hidden" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <FiActivity className="text-blue-700" size={16} />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Rincian Operasional Trayek
                </h3>
              </div>
              <button
                onClick={() => setSelectedTrip(null)}
                aria-label="Tutup"
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  Unit {selectedTrip.vehicleCode} ({selectedTrip.plateNumber})
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                    selectedTrip.status === TripStatus.COMPLETED
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {selectedTrip.status === TripStatus.COMPLETED ? "Selesai" : "Dibatalkan"}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                {selectedTrip.routeName}
              </h2>
            </div>

            {/* ROUTE STEPPER */}
            <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs">
              <div className="flex flex-col items-center pt-1 shrink-0">
                <span className="h-2 w-2 rounded-full bg-blue-700" />
                <span className="my-0.5 h-4 w-0.5 bg-slate-300" />
                <FiMapPin size={11} className="text-rose-600" />
              </div>
              <div className="space-y-1.5 font-semibold text-slate-800">
                <p>{selectedTrip.origin}</p>
                <p>{selectedTrip.destination}</p>
              </div>
            </div>

            {/* STATS GRID DETAIL */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <p className="text-[10px] font-bold uppercase text-slate-400">Tanggal</p>
                <p className="font-extrabold text-slate-900 mt-0.5">
                  {dateLabel(selectedTrip.dateKey)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <p className="text-[10px] font-bold uppercase text-slate-400">Jam Kerja</p>
                <p className="font-extrabold text-slate-900 mt-0.5">
                  {selectedTrip.startTime} - {selectedTrip.endTime}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <p className="text-[10px] font-bold uppercase text-slate-400">Total Penumpang</p>
                <p className="font-extrabold text-slate-900 mt-0.5">
                  {selectedTrip.passengers} Orang
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <p className="text-[10px] font-bold uppercase text-slate-400">Tarif Per Kursi</p>
                <p className="font-extrabold text-slate-900 mt-0.5">
                  {rupiah(FARE)}
                </p>
              </div>
            </div>

            {/* TOTAL PEMASUKAN CARD */}
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-700">Total Pemasukan Operasional</p>
                <p className="text-xs font-semibold text-emerald-800">
                  {selectedTrip.passengers} Penumpang × {rupiah(FARE)}
                </p>
              </div>
              <p className="text-base font-black">
                {rupiah(selectedTrip.revenue)}
              </p>
            </div>

            <button
              onClick={() => setSelectedTrip(null)}
              className="h-10 w-full rounded-xl bg-blue-700 text-xs font-bold text-white shadow-md active:scale-95 hover:bg-blue-800"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}
    </div>
  );
}