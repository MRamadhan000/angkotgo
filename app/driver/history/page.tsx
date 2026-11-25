"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiChevronRight,
  FiMapPin,
  FiTruck,
  FiX,
  FiLoader,
  FiInbox,
  FiCalendar,
  FiActivity,
  FiRefreshCw,
  FiAlertCircle,
  FiCreditCard,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

/* =========================================================
1. INTERFACES (Sesuai Response & Entitas NestJS)
   ========================================================= */

export enum AssignmentStatus {
  SCHEDULED = "SCHEDULED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface RouteData {
  id: number;
  code: string;
  name: string;
  direction: string;
  color: string;
  encodedPolyline: string;
  totalDistanceMeters: number;
  isActive: boolean;
}

export interface VehicleData {
  id: number;
  plateNumber: string;
  vehicleCode: string;
  capacity: number;
  currentOdometer: number;
  type: string;
  status: string;
}

export interface DriverData {
  id: number;
  name: string;
  nik: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  photoUrl?: string | null;
  isVerified: boolean;
  status: string;
}

export interface ConductorData {
  id: number;
  name: string;
  nik: string;
  email: string;
  phone: string;
  photoUrl?: string | null;
  isVerified: boolean;
  status: string;
}

export interface PaymentData {
  id: string;
  vehicleAssignmentId: number;
  amount: string | number;
  paymentMethod: string;
  transactionId?: string | null;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiVehicleAssignmentHistory {
  id: number;
  routeId: number;
  vehicleId: number;
  driverId: number;
  conductorId?: number | null;
  startTime: string;
  status: AssignmentStatus;
  currentPassengers: number;
  assignmentDate: string;
  createdAt: string;
  updatedAt: string;
  route: RouteData;
  driver: DriverData;
  conductor?: ConductorData | null;
  vehicle: VehicleData;
  payments?: PaymentData[];
}

type StatusFilter = "ALL" | "COMPLETED" | "CANCELLED" | "SCHEDULED";

const PAGE_SIZE = 5;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

const dateLabel = (dateStr: string) => {
  if (!dateStr) return "-";
  const todayStr = new Date().toISOString().split("T")[0];
  if (dateStr === todayStr) return "Hari ini";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  if (dateStr === yesterdayStr) return "Kemarin";

  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  } catch {
    return dateStr;
  }
};

const calculateAssignmentRevenue = (
  item: ApiVehicleAssignmentHistory,
): number => {
  if (item.status === AssignmentStatus.CANCELLED) return 0;
  if (item.payments && item.payments.length > 0) {
    return item.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }
  return 0;
};

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
  const { user } = useAuth();

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedTrip, setSelectedTrip] =
    useState<ApiVehicleAssignmentHistory | null>(null);

  /* Fetch Riwayat Penugasan dari API Backend */
  const {
    data: trips = [],
    isLoading,
    isFetching: isRefreshing,
    isError,
    error,
    refetch,
  } = useQuery<ApiVehicleAssignmentHistory[]>({
    queryKey: ["driver-trip-history", user?.id],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3001/vehicle-assignments/history?role=DRIVER&userId=${user?.id}`,
      );

      if (!res.ok) {
        throw new Error(`Gagal mengambil data riwayat (${res.status})`);
      }

      const responseData = await res.json();
      return responseData.data || [];
    },
    enabled: !!user?.id,
    retry: 1,
  });

  const fetchError =
    isError && error
      ? error instanceof Error
        ? error.message
        : "Terjadi kesalahan koneksi ke server."
      : null;

  const handleRefresh = () => {
    if (!user?.id) return;
    refetch();
  };

  /* Filter Data */
  const filtered = useMemo(() => {
    return trips.filter((t) => {
      if (filter === "ALL") return true;
      return t.status === filter;
    });
  }, [trips, filter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  /* Grouping Berdasarkan Tanggal (assignmentDate) */
  const grouped = useMemo(() => {
    const map = new Map<string, ApiVehicleAssignmentHistory[]>();
    visible.forEach((t) => {
      const key = t.assignmentDate ? t.assignmentDate.split("T")[0] : "Lainnya";
      map.set(key, [...(map.get(key) ?? []), t]);
    });
    return Array.from(map.entries());
  }, [visible]);

  /* Ringkasan Statistik */
  const summary = useMemo(() => {
    const validTrips = trips.filter(
      (t) => t.status !== AssignmentStatus.CANCELLED,
    );
    return {
      totalDone: validTrips.length,
      totalRevenue: validTrips.reduce(
        (s, t) => s + calculateAssignmentRevenue(t),
        0,
      ),
    };
  }, [trips]);

  const changeFilter = (f: StatusFilter) => {
    setFilter(f);
    setVisibleCount(PAGE_SIZE);
  };

  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((c) => c + PAGE_SIZE);
      setIsLoadingMore(false);
    }, 300);
  };

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "ALL", label: "Semua" },
    { key: "COMPLETED", label: "Selesai" },
    { key: "SCHEDULED", label: "Lampau" },
    { key: "CANCELLED", label: "Batal" },
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
                  Laporan operasional & penugasan driver
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                title="Muat Ulang Data"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition active:scale-95 hover:bg-slate-100 disabled:opacity-50"
              >
                <FiRefreshCw
                  size={13}
                  className={isRefreshing ? "animate-spin text-blue-700" : ""}
                />
              </button>
            </div>
          </div>

          {/* FILTER STATUS TAB */}
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => changeFilter(f.key)}
                disabled={isLoading}
                className={`rounded-lg py-2 text-[10px] sm:text-xs font-bold transition active:scale-95 disabled:opacity-50 ${
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
          <div
            aria-busy="true"
            aria-label="Memuat riwayat"
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-2">
              {[0, 1].map((i) => (
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
              {[0, 1, 2].map((i) => (
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
        ) : fetchError ? (
          /* ERROR STATE */
          <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-xs space-y-3">
            <FiAlertCircle size={36} className="mx-auto text-rose-500" />
            <h2 className="text-sm font-extrabold text-slate-900">
              Gagal Memuat Riwayat
            </h2>
            <p className="text-xs text-slate-500">{fetchError}</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition active:scale-95"
            >
              <FiRefreshCw size={13} />
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* RINGKASAN KINERJA DRIVER (2 CARD) */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Trip
                </p>
                <p className="mt-1 text-base sm:text-lg font-black text-slate-900 leading-none">
                  {summary.totalDone}{" "}
                  <span className="text-[10px] font-bold text-slate-400">
                    Trip
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Pemasukan
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
                  Belum ada catatan operasional trayek untuk status filter yang
                  dipilih.
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
                      const isCompleted =
                        item.status === AssignmentStatus.COMPLETED;
                      const isCancelled =
                        item.status === AssignmentStatus.CANCELLED;
                      const rev = calculateAssignmentRevenue(item);

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
                                  isCompleted
                                    ? "bg-emerald-100 text-emerald-800"
                                    : isCancelled
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {isCompleted ? (
                                  <FiCheckCircle size={14} />
                                ) : isCancelled ? (
                                  <FiXCircle size={14} />
                                ) : (
                                  <FiClock size={14} />
                                )}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                {item.vehicle?.vehicleCode} (
                                {item.vehicle?.plateNumber})
                              </span>
                            </div>

                            <span
                              className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                isCompleted
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : isCancelled
                                    ? "bg-rose-50 text-rose-700 border border-rose-100"
                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                              }`}
                            >
                              {isCompleted
                                ? "Selesai"
                                : isCancelled
                                  ? "Dibatalkan"
                                  : "Jadwal Lampau"}
                            </span>
                          </div>

                          <div className="py-2.5 space-y-1">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                              {item.route?.name}
                            </h3>
                            <p className="text-[11px] font-semibold text-slate-500">
                              Kode Rute: {item.route?.code} (
                              {item.route?.direction})
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <FiClock size={12} className="text-slate-400" />
                              <span>Mulai {item.startTime} WIB</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-blue-700">
                                {item.payments?.length || 0} Transaksi
                              </span>
                              <span className="font-black text-slate-900">
                                {rupiah(rev)}
                              </span>
                              <FiChevronRight
                                size={14}
                                className="text-slate-400 group-hover:translate-x-0.5 transition"
                              />
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
                    <FiLoader
                      size={15}
                      className="animate-spin text-blue-700"
                    />
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
         MODAL DETAIL PERJALANAN (DATA RIIL DARI BACKEND)
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
                  Rincian Penugasan Driver
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
                  {selectedTrip.vehicle?.vehicleCode} (
                  {selectedTrip.vehicle?.plateNumber})
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                    selectedTrip.status === AssignmentStatus.COMPLETED
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedTrip.status === AssignmentStatus.CANCELLED
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedTrip.status}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                {selectedTrip.route?.name}
              </h2>
            </div>

            {/* ROUTE INFO CARD */}
            <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs">
              <div className="flex flex-col items-center pt-1 shrink-0">
                <span className="h-2 w-2 rounded-full bg-blue-700" />
                <span className="my-0.5 h-4 w-0.5 bg-slate-300" />
                <FiMapPin size={11} className="text-rose-600" />
              </div>
              <div className="space-y-1 font-semibold text-slate-800">
                <p>
                  Kode Rute: {selectedTrip.route?.code} (
                  {selectedTrip.route?.direction})
                </p>
                <p>Kapasitas Armada: {selectedTrip.vehicle?.capacity} Kursi</p>
              </div>
            </div>

            {/* STATS GRID DETAIL (TANPA CARD TOTAL PENUMPANG) */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Tanggal
                </p>
                <p className="font-extrabold text-slate-900 mt-0.5 truncate">
                  {dateLabel(selectedTrip.assignmentDate?.split("T")[0])}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Jam Mulai
                </p>
                <p className="font-extrabold text-slate-900 mt-0.5">
                  {selectedTrip.startTime} WIB
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Kondektur
                </p>
                <p className="font-extrabold text-slate-900 mt-0.5 truncate">
                  {selectedTrip.conductor?.name || "Tanpa Kondektur"}
                </p>
              </div>
            </div>

            {/* PAYMENT TRANSACTIONS SECTION */}
            {selectedTrip.payments && selectedTrip.payments.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <FiCreditCard size={12} className="text-blue-700" />
                  Rincian Transaksi Pembayaran ({selectedTrip.payments.length})
                </p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedTrip.payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2 text-[11px]"
                    >
                      <div>
                        <span className="font-bold text-slate-800">
                          {p.paymentMethod}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-2">
                          {new Date(p.paidAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB
                        </span>
                      </div>
                      <span className="font-black text-emerald-700">
                        {rupiah(Number(p.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TOTAL PEMASUKAN CARD */}
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-700">
                  Total Pemasukan Operasional
                </p>
                <p className="text-xs font-semibold text-emerald-800">
                  {selectedTrip.payments?.length || 0} Transaksi Pembayaran
                </p>
              </div>
              <p className="text-base font-black">
                {rupiah(calculateAssignmentRevenue(selectedTrip))}
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
