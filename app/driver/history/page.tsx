"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiInbox,
  FiCalendar,
  FiRefreshCw,
  FiAlertCircle,
  FiDollarSign,
  FiMessageSquare,
  FiTruck,
  FiMapPin,
  FiChevronRight,
  FiActivity,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

/* =========================================================
   TYPES
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

type StatusFilter =
  | "ALL"
  | "COMPLETED"
  | "SCHEDULED"
  | "ONGOING"
  | "CANCELLED";

const PAGE_SIZE = 5;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function getDateKey(value: string) {
  if (!value) return "Lainnya";
  return value.split("T")[0];
}

function dateLabel(value: string) {
  if (!value || value === "Lainnya") return "Tanggal tidak tersedia";

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return value;

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);

  const yesterday = [
    yesterdayDate.getFullYear(),
    String(yesterdayDate.getMonth() + 1).padStart(2, "0"),
    String(yesterdayDate.getDate()).padStart(2, "0"),
  ].join("-");

  if (value === today) return "Hari ini";
  if (value === yesterday) return "Kemarin";

  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/* =========================================================
   UI HELPERS
========================================================= */

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />
  );
}

function StatusBadge({ status }: { status: AssignmentStatus }) {
  const config = {
    COMPLETED: {
      label: "Selesai",
      icon: FiCheckCircle,
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    CANCELLED: {
      label: "Dibatalkan",
      icon: FiXCircle,
      className: "bg-rose-50 text-rose-700 border-rose-100",
    },
    ONGOING: {
      label: "Berlangsung",
      icon: FiActivity,
      className: "bg-blue-50 text-blue-700 border-blue-100",
    },
    SCHEDULED: {
      label: "Terjadwal",
      icon: FiClock,
      className: "bg-amber-50 text-amber-700 border-amber-100",
    },
  };

  const item = config[status] ?? config.SCHEDULED;
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${item.className}`}
    >
      <Icon size={11} />
      {item.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function TripHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const {
    data: trips = [],
    isLoading,
    isFetching,
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

      const result = await res.json();
      return result.data || [];
    },
    enabled: !!user?.id,
    retry: 1,
  });

  const fetchError = isError
    ? error instanceof Error
      ? error.message
      : "Terjadi kesalahan koneksi ke server."
    : null;

  /* FILTER */

  const filtered = useMemo(() => {
    return trips.filter((item) => {
      if (filter === "ALL") return true;
      return item.status === filter;
    });
  }, [trips, filter]);

  const visible = filtered.slice(0, visibleCount);

  /* GROUP BY DATE */

  const grouped = useMemo(() => {
    const map = new Map<string, ApiVehicleAssignmentHistory[]>();

    visible.forEach((item) => {
      const key = getDateKey(item.assignmentDate);
      const current = map.get(key) ?? [];
      map.set(key, [...current, item]);
    });

    return Array.from(map.entries()).sort((a, b) => {
      if (a[0] === "Lainnya") return 1;
      if (b[0] === "Lainnya") return -1;
      return b[0].localeCompare(a[0]);
    });
  }, [visible]);

  /* STATISTICS */

  const summary = useMemo(() => {
    const completed = trips.filter(
      (item) => item.status === AssignmentStatus.COMPLETED,
    );

    return {
      totalDone: completed.length,
    };
  }, [trips]);

  const counts = useMemo(() => {
    return {
      ALL: trips.length,
      COMPLETED: trips.filter(
        (t) => t.status === AssignmentStatus.COMPLETED,
      ).length,
      SCHEDULED: trips.filter(
        (t) => t.status === AssignmentStatus.SCHEDULED,
      ).length,
      ONGOING: trips.filter(
        (t) => t.status === AssignmentStatus.ONGOING,
      ).length,
      CANCELLED: trips.filter(
        (t) => t.status === AssignmentStatus.CANCELLED,
      ).length,
    };
  }, [trips]);

  const filters: {
    key: StatusFilter;
    label: string;
  }[] = [
    { key: "ALL", label: "Semua" },
    { key: "COMPLETED", label: "Selesai" },
    { key: "ONGOING", label: "Berlangsung" },
    { key: "CANCELLED", label: "Dibatalkan" },
  ];

  const handleFilter = (value: StatusFilter) => {
    setFilter(value);
    setVisibleCount(PAGE_SIZE);
  };

  const handleLoadMore = () => {
    setVisibleCount((current) => current + PAGE_SIZE);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-dvh bg-[#f8fafc] pb-10 font-sans text-slate-900 select-none">

      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                aria-label="Kembali"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 active:scale-95"
              >
                <FiArrowLeft size={18} />
              </button>

              <div>
                <h1 className="text-sm font-extrabold tracking-tight text-slate-900">
                  Riwayat Perjalanan
                </h1>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Aktivitas dan laporan operasional driver
                </p>
              </div>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              aria-label="Muat ulang"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <FiRefreshCw
                size={15}
                className={isFetching ? "animate-spin text-blue-600" : ""}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 pt-5">

        {/* INTRO */}

        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-blue-600">
            Driver workspace
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
            Aktivitas perjalanan
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Pantau riwayat penugasan operasional, transaksi penumpang, dan ulasan perjalanan Anda.
          </p>
        </section>

        {/* SUMMARY */}

        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !fetchError ? (
          <section>
            <StatCard
              label="Perjalanan selesai"
              value={summary.totalDone}
              description="Total penugasan operasional yang berhasil diselesaikan"
              icon={FiCheckCircle}
            />
          </section>
        ) : null}

        {/* FILTER */}

        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">
              Riwayat penugasan
            </h3>
            <span className="text-[10px] font-medium text-slate-400">
              {filtered.length} perjalanan
            </span>
          </div>

          <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 scrollbar-hide">
            {filters.map((item) => {
              const active = filter === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => handleFilter(item.key)}
                  disabled={isLoading}
                  className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2.5 text-[10px] font-bold transition ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {item.label}
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[9px] ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {counts[item.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* LOADING */}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="mt-4 h-4 w-48" />
                <Skeleton className="mt-2 h-3 w-32" />
                <Skeleton className="mt-5 h-10 w-full" />
              </div>
            ))}
          </div>
        ) : fetchError ? (

          /* ERROR */

          <div className="rounded-2xl border border-rose-200 bg-white px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <FiAlertCircle size={23} />
            </div>
            <h3 className="mt-3 text-sm font-extrabold">
              Gagal memuat riwayat
            </h3>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
              {fetchError}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-95"
            >
              <FiRefreshCw size={13} />
              Coba lagi
            </button>
          </div>

        ) : grouped.length === 0 ? (

          /* EMPTY STATE */

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <FiInbox size={25} />
            </div>

            <h3 className="mt-4 text-sm font-extrabold text-slate-800">
              Belum ada perjalanan
            </h3>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
              Belum ada riwayat penugasan untuk kategori yang dipilih.
            </p>

            {filter !== "ALL" && (
              <button
                onClick={() => handleFilter("ALL")}
                className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Lihat semua perjalanan
              </button>
            )}
          </div>

        ) : (

          /* TRIP HISTORY */

          <section className="space-y-5">
            {grouped.map(([date, items]) => (
              <div key={date} className="space-y-3">

                {/* DATE HEADER */}

                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FiCalendar size={14} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-700">
                    {dateLabel(date)}
                  </h3>
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-medium text-slate-400">
                    {items.length} perjalanan
                  </span>
                </div>

                {/* CARDS */}

                <div className="space-y-3">
                  {items.map((item) => {
                    return (
                      <article
                        key={item.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
                      >
                        <div className="space-y-4 p-4">

                          {/* VEHICLE + STATUS */}

                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <FiTruck size={21} />
                              </div>

                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-extrabold text-slate-900">
                                  {item.vehicle?.vehicleCode || "Kendaraan"}
                                </h4>
                                <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                                  {item.vehicle?.plateNumber || "-"}
                                </p>
                              </div>
                            </div>

                            <StatusBadge status={item.status} />
                          </div>

                          {/* ROUTE INFORMATION */}

                          <div className="rounded-xl bg-slate-50 p-3">
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                                <FiMapPin size={14} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                  Trayek perjalanan
                                </p>
                                <h4 className="mt-1 text-xs font-extrabold leading-relaxed text-slate-800">
                                  {item.route?.name || "Nama trayek tidak tersedia"}
                                </h4>
                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                  <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold text-slate-600">
                                    {item.route?.code || "-"}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {item.route?.direction || "-"}
                                  </span>
                                  {item.startTime && (
                                    <span className="text-[10px] font-semibold text-blue-600">
                                      &bull; Mulai {item.startTime} WIB
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>                     
                        </div>

                        {/* ACTIONS */}

                        <div className="grid grid-cols-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/driver/history/${item.id}/payment`,
                              )
                            }
                            className="group flex items-center justify-center gap-2 border-r border-slate-100 px-2 py-3 text-[11px] font-bold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100"
                          >
                            <FiDollarSign
                              size={15}
                              className="text-emerald-600"
                            />
                            Cek transaksi
                            <FiChevronRight
                              size={12}
                              className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/driver/history/${item.id}/feedbacks`,
                              )
                            }
                            className="group flex items-center justify-center gap-2 px-2 py-3 text-[11px] font-bold text-slate-600 transition hover:bg-amber-50 hover:text-amber-700 active:bg-amber-100"
                          >
                            <FiMessageSquare
                              size={14}
                              className="text-amber-600"
                            />
                            Cek ulasan
                            <FiChevronRight
                              size={12}
                              className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-amber-600"
                            />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* LOAD MORE */}

        {!isLoading &&
          !fetchError &&
          visibleCount < filtered.length && (
            <button
              onClick={handleLoadMore}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
            >
              Muat lebih banyak
              <FiChevronRight size={14} />
            </button>
          )}

        {/* FOOTER */}

        {!isLoading && !fetchError && trips.length > 0 && (
          <p className="pb-3 text-center text-[10px] font-medium text-slate-400">
            Menampilkan {visible.length} dari {filtered.length} perjalanan
          </p>
        )}
      </main>
    </div>
  );
}