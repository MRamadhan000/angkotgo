"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  FiArrowLeft,
  FiRefreshCw,
  FiDollarSign,
  FiCreditCard,
  FiTrendingUp,
  FiCalendar,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiPieChart,
  FiMapPin,
  FiUser,
  FiBarChart2,
  FiChevronUp,
  FiChevronDown,
  FiX,
  FiAward,
  FiInbox,
  FiBriefcase,
} from "react-icons/fi";

/* =========================================================
   1. TYPES (MATCHING BACKEND API RESPONSE)
   ========================================================= */

export type PaymentMethod = "QRIS" | "CASH";
export type AssignmentStatus =
  | "SCHEDULED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

export interface ApiRoute {
  id: number;
  code: string;
  name: string;
  direction: string;
  color: string;
  encodedPolyline: string;
  totalDistanceMeters: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPerson {
  id: number;
  name: string;
  nik: string;
  email: string;
  phone: string;
  status: string;
}

export interface ApiVehicle {
  id: number;
  plateNumber: string;
  vehicleCode: string;
  capacity: number;
  currentOdometer: number;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiVehicleAssignment {
  id: number;
  routeId: number;
  vehicleId: number;
  driverId: number;
  conductorId: number | null;
  startTime: string;
  status: AssignmentStatus;
  currentPassengers: number;
  assignmentDate: string;
  createdAt: string;
  updatedAt: string;
  route?: ApiRoute;
  driver?: ApiPerson;
  conductor?: ApiPerson | null;
  vehicle?: ApiVehicle;
}

export interface ApiPayment {
  id: string;
  vehicleAssignmentId: number;
  vehicleAssignment: ApiVehicleAssignment;
  amount: string; // "20000.00"
  paymentMethod: PaymentMethod;
  transactionId: string | null;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

/* =========================================================
   2. API LAYER & CONFIG
   ========================================================= */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const TICKET_PRICE = 5000;

const QRIS_COLOR = "#2563EB";
const CASH_COLOR = "#F59E0B";

async function fetchAssignmentPayments(
  assignmentId: number,
): Promise<ApiPayment[]> {
  const res = await fetch(`${API_URL}/payments/assignment/${assignmentId}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = Array.isArray(json?.message)
      ? json.message.join(", ")
      : (json?.message ?? `Gagal mengambil data transaksi (${res.status})`);
    throw new Error(msg);
  }

  return (json as ApiResponse<ApiPayment[]>).data ?? [];
}

/* =========================================================
   3. ENTRY POINT WITH PROVIDER
   ========================================================= */

export default function DriverFinanceAnalyticsPage() {
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
      <DriverFinanceContent />
    </QueryClientProvider>
  );
}

/* =========================================================
   4. MAIN DASHBOARD CONTENT (DRIVER VIEW)
   ========================================================= */

type SortKey = "paidAt" | "amount";
type SortDir = "asc" | "desc";

function DriverFinanceContent() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const assignmentId = Number(params?.id ?? 10);

  // States Filter, Search & Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<"ALL" | PaymentMethod>(
    "ALL",
  );
  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("paidAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // UI States
  const [autoRefresh, setAutoRefresh] = useState(false);

  // TanStack Query
  const {
    data: payments = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["driver-assignment-payments", assignmentId],
    queryFn: () => fetchAssignmentPayments(assignmentId),
    enabled: Number.isFinite(assignmentId),
    refetchInterval: autoRefresh ? 10_000 : false,
  });

  /* ---------------------------------------------------------
     DERIVED ANALYTICS CALCULATIONS
  --------------------------------------------------------- */
  const assignmentInfo = useMemo(() => {
    return payments.length > 0 ? payments[0].vehicleAssignment : null;
  }, [payments]);

  const stats = useMemo(() => {
    let totalIncome = 0;
    let qrisIncome = 0;
    let cashIncome = 0;
    let qrisCount = 0;
    let cashCount = 0;

    for (const p of payments) {
      const amt = Number(p.amount) || 0;
      totalIncome += amt;

      if (p.paymentMethod === "QRIS") {
        qrisIncome += amt;
        qrisCount += 1;
      } else {
        cashIncome += amt;
        cashCount += 1;
      }
    }

    const totalTransactions = payments.length;
    const totalPaidSeats = Math.round(totalIncome / TICKET_PRICE);
    const qrisPercentage =
      totalIncome > 0 ? Math.round((qrisIncome / totalIncome) * 100) : 0;
    const cashPercentage =
      totalIncome > 0 ? Math.round((cashIncome / totalIncome) * 100) : 0;

    return {
      totalIncome,
      qrisIncome,
      cashIncome,
      totalTransactions,
      qrisCount,
      cashCount,
      totalPaidSeats,
      qrisPercentage,
      cashPercentage,
      averageTicket:
        totalTransactions > 0 ? totalIncome / totalTransactions : 0,
    };
  }, [payments]);

  // Bucket waktu untuk grafik
  const { buckets, bucketMs } = useMemo(
    () => buildBuckets(payments),
    [payments],
  );

  const activeBucket = useMemo(
    () => buckets.find((b) => b.start === selectedBucket) ?? null,
    [buckets, selectedBucket],
  );

  // Insight ringkat Driver
  const insights = useMemo(() => {
    if (payments.length === 0) return null;
    let largest = payments[0];
    let latest = payments[0];
    for (const p of payments) {
      if (Number(p.amount) > Number(largest.amount)) largest = p;
      if (new Date(p.paidAt).getTime() > new Date(latest.paidAt).getTime())
        latest = p;
    }
    let peak: Bucket | null = null;
    for (const b of buckets) {
      if (b.total > 0 && (!peak || b.total > peak.total)) peak = b;
    }
    return { largest, latest, peak };
  }, [payments, buckets]);

  // Filter & Sorting
  const sortedPayments = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    const digits = searchLower.replace(/\D/g, "");

    const list = payments.filter((p) => {
      const matchesMethod =
        methodFilter === "ALL" || p.paymentMethod === methodFilter;

      const t = new Date(p.paidAt).getTime();
      const matchesBucket =
        !activeBucket || (t >= activeBucket.start && t < activeBucket.end);

      const matchesSearch =
        searchLower === "" ||
        p.id.toLowerCase().includes(searchLower) ||
        (p.transactionId?.toLowerCase().includes(searchLower) ?? false) ||
        (digits.length > 0 &&
          String(Math.round(Number(p.amount))).includes(digits));

      return matchesMethod && matchesBucket && matchesSearch;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortKey === "amount")
        return (Number(a.amount) - Number(b.amount)) * dir;
      return (
        (new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime()) * dir
      );
    });
  }, [payments, methodFilter, activeBucket, searchTerm, sortKey, sortDir]);

  const filteredTotal = useMemo(
    () => sortedPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0),
    [sortedPayments],
  );

  const hasActiveFilter =
    methodFilter !== "ALL" || activeBucket !== null || searchTerm.trim() !== "";

  const resetAllFilters = () => {
    setMethodFilter("ALL");
    setSelectedBucket(null);
    setSearchTerm("");
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const toggleMethod = (m: PaymentMethod) =>
    setMethodFilter((prev) => (prev === m ? "ALL" : m));

  /* ---------------------------------------------------------
     LOADING & ERROR STATES
  --------------------------------------------------------- */
  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center font-sans">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm">
          <FiAlertCircle size={28} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            Gagal Memuat Pendapatan Penugasan
          </h2>
          <p className="max-w-md text-xs text-slate-500">
            {error instanceof Error
              ? error.message
              : "Terjadi kesalahan sistem."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 transition"
          >
            Kembali
          </button>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white font-sans text-slate-900 antialiased pb-12">
      {/* ---------------------------------------------------------
          HEADER & TOOLBAR (DRIVER PERSPECTIVE)
      --------------------------------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 active:scale-95"
              title="Kembali"
            >
              <FiArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-black tracking-tight text-slate-900 sm:text-lg">
                  Pendapatan & Setoran #{assignmentId}
                </h1>
                <span className="hidden sm:flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  <FiCheckCircle className="h-3 w-3" /> Rekap Driver
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <FiClock className="h-3 w-3" />
                Diperbarui {dataUpdatedAt ? formatClock(dataUpdatedAt) : "-"}
                {isFetching && (
                  <span className="font-bold text-blue-600">• memuat…</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              aria-pressed={autoRefresh}
              title="Perbarui otomatis tiap 10 detik"
              className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition active:scale-95 ${
                autoRefresh
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {autoRefresh && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    autoRefresh ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />
              </span>
              <span className="hidden sm:inline">
                {autoRefresh ? "Live" : "Auto"}
              </span>
            </button>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-60"
            >
              <FiRefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 pt-6 sm:px-6">
        {/* ---------------------------------------------------------
            ASSIGNMENT METADATA CARD
        --------------------------------------------------------- */}
        {assignmentInfo && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <MetaItem
                icon={<FiMapPin className="text-rose-600" />}
                label="Trayek / Rute"
                value={
                  assignmentInfo.route ? (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full inline-block shrink-0"
                        style={{
                          backgroundColor:
                            assignmentInfo.route.color ?? "#1E88E5",
                        }}
                      />
                      <span className="truncate">
                        {assignmentInfo.route.name} ({assignmentInfo.route.code}
                        )
                      </span>
                    </span>
                  ) : (
                    `Route #${assignmentInfo.routeId}`
                  )
                }
              />
              <MetaItem
                icon={<FiTruck className="text-blue-600" />}
                label="Angkot"
                value={
                  assignmentInfo.vehicle ? (
                    <span className="truncate">
                      {assignmentInfo.vehicle.vehicleCode} (
                      {assignmentInfo.vehicle.plateNumber})
                    </span>
                  ) : (
                    `Vehicle #${assignmentInfo.vehicleId}`
                  )
                }
              />
              <MetaItem
                icon={<FiUser className="text-teal-600" />}
                label="Kondektur"
                value={assignmentInfo.conductor?.name ?? "Tanpa Kondektur"}
              />
              <MetaItem
                icon={<FiCalendar className="text-amber-600" />}
                label="Tanggal Tugas"
                value={formatDate(assignmentInfo.assignmentDate)}
              />
              <MetaItem
                icon={<FiClock className="text-violet-600" />}
                label="Jam Mulai"
                value={assignmentInfo.startTime.slice(0, 5)}
              />
              <MetaItem
                icon={<FiCheckCircle className="text-indigo-600" />}
                label="Status Tugas"
                value={
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      assignmentInfo.status === "ONGOING"
                        ? "bg-blue-100 text-blue-800"
                        : assignmentInfo.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : assignmentInfo.status === "CANCELLED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {assignmentInfo.status}
                  </span>
                }
              />
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            EXECUTIVE STATS OVERVIEW CARDS (DRIVER FOCUSED)
        --------------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card Total Pemasukan Driver */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white shadow-lg shadow-emerald-600/20">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-8 -right-2 h-20 w-20 rounded-full bg-white/10" />
            <div className="relative flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Total Omzet Penugasan
              </p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                <FiDollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="relative mt-2 text-2xl font-black tracking-tight tabular-nums sm:text-3xl">
              <AnimatedNumber value={stats.totalIncome} prefix="Rp " />
            </h3>
            <p className="relative mt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-100">
              <FiTrendingUp className="h-3.5 w-3.5" />
              Total {stats.totalPaidSeats} penumpang terbayar
            </p>
          </div>

          {/* Card Setoran Tunai (Cash) */}
          <MethodCard
            title="Setoran Cash (Tunai)"
            subtitle="Uang fisik di dompet/kasir"
            amount={stats.cashIncome}
            percentage={stats.cashPercentage}
            count={stats.cashCount}
            color={CASH_COLOR}
            icon={<FiBriefcase className="h-5 w-5" />}
            iconClass="bg-amber-50 text-amber-600"
            percentClass="text-amber-600"
            active={methodFilter === "CASH"}
            onClick={() => toggleMethod("CASH")}
          />

          {/* Card Non-Tunai (QRIS) */}
          <MethodCard
            title="Non-Tunai (QRIS)"
            subtitle="Langsung masuk rekening"
            amount={stats.qrisIncome}
            percentage={stats.qrisPercentage}
            count={stats.qrisCount}
            color={QRIS_COLOR}
            icon={<FiCreditCard className="h-5 w-5" />}
            iconClass="bg-blue-50 text-blue-600"
            percentClass="text-blue-600"
            active={methodFilter === "QRIS"}
            onClick={() => toggleMethod("QRIS")}
          />

          {/* Card Total Transaksi Driver */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Transaksi
              </p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <FiPieChart className="h-5 w-5" />
              </div>
            </div>
            <h3 className="mt-2 text-2xl font-black tabular-nums text-slate-900">
              <AnimatedNumber value={stats.totalTransactions} />{" "}
              <span className="text-sm font-bold text-slate-500">Kali</span>
            </h3>
            <p className="mt-2 text-[11px] font-medium text-slate-400">
              Rata-rata bayar: Rp{" "}
              {Math.round(stats.averageTicket).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------------
            GRAFIK PENDAPATAN PER WAKTU + DONUT METODE PEMBAYARAN
        --------------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <FiBarChart2 className="text-blue-600" /> Pendapatan per{" "}
                {bucketMs >= DAY_MS
                  ? "Hari"
                  : bucketMs >= HOUR_MS
                    ? `${bucketMs / HOUR_MS} Jam`
                    : `${bucketMs / MIN_MS} Menit`}
              </h3>

              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: QRIS_COLOR }}
                  />
                  QRIS
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: CASH_COLOR }}
                  />
                  Cash
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0 w-4 border-t-2 border-dashed border-emerald-500" />
                  Akumulasi
                </span>
              </div>
            </div>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Tekan batang pada grafik untuk menyaring riwayat transaksi.
            </p>

            <div className="mt-3">
              <RevenueChart
                buckets={buckets}
                bucketMs={bucketMs}
                selectedStart={activeBucket?.start ?? null}
                onSelect={(start) =>
                  setSelectedBucket((prev) => (prev === start ? null : start))
                }
                totalIncome={stats.totalIncome}
              />
            </div>

            {insights && (
              <div className="mt-4 grid grid-cols-1 gap-2.5 border-t border-slate-100 pt-4 sm:grid-cols-3">
                <InsightItem
                  icon={<FiAward className="text-amber-500" />}
                  label="Pembayaran Terbesar"
                  value={`Rp ${Number(insights.largest.amount).toLocaleString("id-ID")}`}
                  hint={`${insights.largest.paymentMethod} • ${formatClock(insights.largest.paidAt)}`}
                />
                <InsightItem
                  icon={<FiClock className="text-blue-500" />}
                  label="Penumpang Terakhir"
                  value={formatClock(insights.latest.paidAt)}
                  hint={`Rp ${Number(insights.latest.amount).toLocaleString("id-ID")} • ${insights.latest.paymentMethod}`}
                />
                <InsightItem
                  icon={<FiTrendingUp className="text-emerald-500" />}
                  label="Jam Paling Ramai"
                  value={
                    insights.peak ? bucketRange(insights.peak, bucketMs) : "-"
                  }
                  hint={
                    insights.peak
                      ? `Rp ${insights.peak.total.toLocaleString("id-ID")} • ${insights.peak.count} trx`
                      : ""
                  }
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <FiPieChart className="text-blue-600" /> Proporsi Bayar
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                {stats.totalTransactions} Trx
              </span>
            </div>

            <MethodDonut
              qris={stats.qrisIncome}
              cash={stats.cashIncome}
              qrisCount={stats.qrisCount}
              cashCount={stats.cashCount}
              selected={methodFilter}
              onToggle={toggleMethod}
            />
          </div>
        </div>

        {/* ---------------------------------------------------------
            TRANSACTIONS TABLE & FILTERS (PENYESUAIAN DRIVER)
        --------------------------------------------------------- */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Riwayat Pembayaran Penumpang
              </h3>
              <p className="text-xs text-slate-500">
                Menampilkan {sortedPayments.length} dari {payments.length} total
                transaksi
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Box */}
              <div className="relative min-w-[180px] flex-1 sm:flex-none">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nominal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    aria-label="Hapus pencarian"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-700"
                  >
                    <FiX className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Metode */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <FiFilter className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
                {(["ALL", "QRIS", "CASH"] as const).map((method) => {
                  const count =
                    method === "ALL"
                      ? payments.length
                      : method === "QRIS"
                        ? stats.qrisCount
                        : stats.cashCount;
                  return (
                    <button
                      key={method}
                      onClick={() => setMethodFilter(method)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                        methodFilter === method
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {method}
                      <span className="rounded-full bg-slate-100 px-1.5 py-px text-[9px] font-black text-slate-500">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chips filter aktif */}
          {hasActiveFilter && (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Filter aktif
              </span>
              {methodFilter !== "ALL" && (
                <FilterChip
                  label={`Metode: ${methodFilter}`}
                  onRemove={() => setMethodFilter("ALL")}
                />
              )}
              {activeBucket && (
                <FilterChip
                  label={`Waktu: ${bucketRange(activeBucket, bucketMs)}`}
                  onRemove={() => setSelectedBucket(null)}
                />
              )}
              {searchTerm.trim() !== "" && (
                <FilterChip
                  label={`Cari: "${searchTerm.trim()}"`}
                  onRemove={() => setSearchTerm("")}
                />
              )}
              <button
                onClick={resetAllFilters}
                className="ml-auto text-[11px] font-bold text-blue-700 hover:underline"
              >
                Reset semua
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-y border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">No</th>
                  <SortableTh
                    label="Waktu"
                    active={sortKey === "paidAt"}
                    dir={sortDir}
                    onClick={() => toggleSort("paidAt")}
                  />
                  <th className="px-5 py-3">Metode Bayar</th>
                  <SortableTh
                    label="Nominal (Rp)"
                    active={sortKey === "amount"}
                    dir={sortDir}
                    onClick={() => toggleSort("amount")}
                  />
                  <th className="px-5 py-3">Jumlah Penumpang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-14 text-center text-slate-400"
                    >
                      <FiInbox className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                      <p className="text-xs font-bold text-slate-600">
                        {payments.length === 0
                          ? "Belum ada transaksi pembayaran"
                          : "Tidak ada transaksi yang cocok"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {payments.length === 0
                          ? "Pembayaran penumpang akan otomatis tercatat di sini."
                          : "Coba ganti filter atau pencarian Anda."}
                      </p>
                      {hasActiveFilter && (
                        <button
                          onClick={resetAllFilters}
                          className="mt-3 rounded-lg bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100"
                        >
                          Reset filter
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  sortedPayments.map((p, idx) => {
                    const amountNum = Number(p.amount);
                    const seats = Math.round(amountNum / TICKET_PRICE);
                    const isQris = p.paymentMethod === "QRIS";

                    return (
                      <tr
                        key={p.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-3.5 font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-800">
                          {formatDateTime(p.paidAt)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              isQris
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isQris ? (
                              <FiCreditCard className="h-3 w-3" />
                            ) : (
                              <FiDollarSign className="h-3 w-3" />
                            )}
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 font-black tabular-nums text-slate-900">
                          Rp {amountNum.toLocaleString("id-ID")}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <span className="font-bold text-slate-700">
                            {seats} Penumpang
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {sortedPayments.length > 0 && (
                <tfoot className="border-t border-slate-200 bg-slate-50/80">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      {hasActiveFilter
                        ? "Subtotal Tampilan"
                        : "Total Perolehan"}{" "}
                      ({sortedPayments.length} trx)
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-black tabular-nums text-slate-900">
                      Rp {filteredTotal.toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-600">
                      {Math.round(filteredTotal / TICKET_PRICE)} Orang
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   5. CHART COMPONENTS
   ========================================================= */

const MIN_MS = 60_000;
const HOUR_MS = 60 * MIN_MS;
const DAY_MS = 24 * HOUR_MS;

interface Bucket {
  start: number;
  end: number;
  qris: number;
  cash: number;
  total: number;
  count: number;
  qrisCount: number;
  cashCount: number;
}

function buildBuckets(payments: ApiPayment[]): {
  buckets: Bucket[];
  bucketMs: number;
} {
  const times = payments
    .map((p) => new Date(p.paidAt).getTime())
    .filter((t) => Number.isFinite(t));

  if (times.length === 0) return { buckets: [], bucketMs: 10 * MIN_MS };

  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = max - min;

  let bucketMs =
    span <= 2 * HOUR_MS
      ? 10 * MIN_MS
      : span <= 8 * HOUR_MS
        ? 30 * MIN_MS
        : span <= 2 * DAY_MS
          ? HOUR_MS
          : DAY_MS;

  const alignStart = (ms: number) => {
    if (bucketMs >= DAY_MS) {
      const d = new Date(min);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    return Math.floor(ms / bucketMs) * bucketMs;
  };

  let start = alignStart(min);
  let count = Math.floor((max - start) / bucketMs) + 1;
  while (count > 48) {
    bucketMs *= 2;
    start = alignStart(min);
    count = Math.floor((max - start) / bucketMs) + 1;
  }

  const buckets: Bucket[] = Array.from({ length: count }, (_, i) => ({
    start: start + i * bucketMs,
    end: start + (i + 1) * bucketMs,
    qris: 0,
    cash: 0,
    total: 0,
    count: 0,
    qrisCount: 0,
    cashCount: 0,
  }));

  for (const p of payments) {
    const t = new Date(p.paidAt).getTime();
    if (!Number.isFinite(t)) continue;
    const idx = Math.min(
      count - 1,
      Math.max(0, Math.floor((t - start) / bucketMs)),
    );
    const amt = Number(p.amount) || 0;
    const b = buckets[idx];
    b.total += amt;
    b.count += 1;
    if (p.paymentMethod === "QRIS") {
      b.qris += amt;
      b.qrisCount += 1;
    } else {
      b.cash += amt;
      b.cashCount += 1;
    }
  }

  return { buckets, bucketMs };
}

function bucketLabel(b: Bucket, bucketMs: number) {
  return bucketMs >= DAY_MS
    ? new Date(b.start).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      })
    : formatHM(b.start);
}

function bucketRange(b: Bucket, bucketMs: number) {
  return bucketMs >= DAY_MS
    ? bucketLabel(b, bucketMs)
    : `${formatHM(b.start)} – ${formatHM(b.end)}`;
}

function niceMax(v: number) {
  if (v <= 0) return 10_000;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * pow;
}

function compactRp(v: number) {
  if (v >= 1_000_000)
    return `${(v / 1_000_000).toFixed(1).replace(".0", "")}jt`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}rb`;
  return String(Math.round(v));
}

function RevenueChart({
  buckets,
  bucketMs,
  selectedStart,
  onSelect,
  totalIncome,
}: {
  buckets: Bucket[];
  bucketMs: number;
  selectedStart: number | null;
  onSelect: (start: number) => void;
  totalIncome: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const W = 640;
  const H = 240;
  const padL = 48;
  const padR = 12;
  const padT = 16;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const n = buckets.length;

  if (n === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
        <FiBarChart2 className="h-7 w-7 text-slate-300" />
        <p className="mt-2 text-xs font-bold text-slate-600">
          Belum ada data pendapatan
        </p>
        <p className="text-[11px] text-slate-400">
          Grafik akan otomatis terisi saat pembayaran masuk.
        </p>
      </div>
    );
  }

  const maxVal = niceMax(Math.max(...buckets.map((b) => b.total), 0));
  const slot = plotW / n;
  const barW = Math.min(slot * 0.64, 40);
  const yOf = (v: number) => padT + plotH - (v / maxVal) * plotH;
  const ticks = [0, 1, 2, 3, 4].map((i) => (maxVal * i) / 4);
  const labelStep = Math.ceil(n / 8);

  let running = 0;
  const cumulative = buckets.map((b) => (running += b.total));
  const cumY = (v: number) =>
    padT + plotH - (totalIncome > 0 ? (v / totalIncome) * plotH : 0);
  const centerX = (i: number) => padL + slot * (i + 0.5);

  const hoveredBucket = hovered !== null ? buckets[hovered] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label="Grafik batang pendapatan penugasan"
      >
        {/* Grid & sumbu Y */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={yOf(t)}
              y2={yOf(t)}
              stroke="#E2E8F0"
              strokeDasharray={t === 0 ? undefined : "3 4"}
            />
            <text
              x={padL - 8}
              y={yOf(t) + 3}
              textAnchor="end"
              fontSize="9"
              fontWeight="600"
              fill="#94A3B8"
            >
              {compactRp(t)}
            </text>
          </g>
        ))}

        {/* Batang bertumpuk: QRIS (bawah) + Cash (atas) */}
        {buckets.map((b, i) => {
          const x = padL + slot * i + (slot - barW) / 2;
          const hq = (b.qris / maxVal) * plotH;
          const hc = (b.cash / maxVal) * plotH;
          const isSelected = selectedStart === b.start;
          const isDimmed =
            (selectedStart !== null && !isSelected) ||
            (hovered !== null && hovered !== i);

          return (
            <g
              key={b.start}
              style={{
                transformBox: "fill-box",
                transformOrigin: "bottom",
                transform: animated ? "scaleY(1)" : "scaleY(0)",
                transition: `transform 650ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 30}ms, opacity 160ms ease`,
                opacity: isDimmed ? 0.4 : 1,
              }}
            >
              {b.qris > 0 && (
                <rect
                  x={x}
                  y={yOf(0) - hq}
                  width={barW}
                  height={hq}
                  fill={QRIS_COLOR}
                  rx={2}
                />
              )}
              {b.cash > 0 && (
                <rect
                  x={x}
                  y={yOf(0) - hq - hc}
                  width={barW}
                  height={hc}
                  fill={CASH_COLOR}
                  rx={2}
                />
              )}
              {isSelected && (
                <rect
                  x={x - 2}
                  y={yOf(b.total) - 2}
                  width={barW + 4}
                  height={(b.total / maxVal) * plotH + 4}
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth={1.5}
                  rx={4}
                />
              )}
            </g>
          );
        })}

        {/* Garis akumulasi */}
        {n > 1 && (
          <polyline
            points={buckets
              .map((_, i) => `${centerX(i)},${cumY(cumulative[i])}`)
              .join(" ")}
            fill="none"
            stroke="#10B981"
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: animated ? 1 : 0,
              transition: "opacity 600ms ease 400ms",
            }}
            pointerEvents="none"
          />
        )}
        {hovered !== null && (
          <circle
            cx={centerX(hovered)}
            cy={cumY(cumulative[hovered])}
            r={4}
            fill="#10B981"
            stroke="#fff"
            strokeWidth={2}
            pointerEvents="none"
          />
        )}

        {/* Label sumbu X */}
        {buckets.map((b, i) =>
          i % labelStep === 0 ? (
            <text
              key={b.start}
              x={centerX(i)}
              y={H - 10}
              textAnchor="middle"
              fontSize="9"
              fontWeight={
                hovered === i || selectedStart === b.start ? 800 : 600
              }
              fill={
                hovered === i || selectedStart === b.start
                  ? "#0F172A"
                  : "#94A3B8"
              }
            >
              {bucketLabel(b, bucketMs)}
            </text>
          ) : null,
        )}

        {/* Area interaksi */}
        {buckets.map((b, i) => (
          <rect
            key={`hit-${b.start}`}
            x={padL + slot * i}
            y={padT}
            width={slot}
            height={plotH}
            fill="transparent"
            tabIndex={0}
            role="button"
            aria-label={`${bucketRange(b, bucketMs)}: Rp ${b.total.toLocaleString("id-ID")}, ${b.count} transaksi`}
            aria-pressed={selectedStart === b.start}
            style={{ cursor: "pointer", outline: "none" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            onClick={() => onSelect(b.start)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(b.start);
              }
            }}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredBucket && hovered !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10 w-44 rounded-xl border border-slate-200 bg-white/95 p-2.5 text-[11px] shadow-xl backdrop-blur"
          style={{
            left: `${Math.min(80, Math.max(20, (centerX(hovered) / W) * 100))}%`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="font-black text-slate-900">
            {bucketRange(hoveredBucket, bucketMs)}
          </p>
          <p className="text-sm font-black tabular-nums text-slate-900">
            Rp {hoveredBucket.total.toLocaleString("id-ID")}
          </p>
          <div className="mt-1.5 space-y-0.5 font-semibold text-slate-600">
            <p className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: QRIS_COLOR }}
                />
                QRIS ({hoveredBucket.qrisCount})
              </span>
              <span className="tabular-nums">
                {hoveredBucket.qris.toLocaleString("id-ID")}
              </span>
            </p>
            <p className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: CASH_COLOR }}
                />
                Cash ({hoveredBucket.cashCount})
              </span>
              <span className="tabular-nums">
                {hoveredBucket.cash.toLocaleString("id-ID")}
              </span>
            </p>
            <p className="flex items-center justify-between gap-2 border-t border-slate-100 pt-1 text-emerald-700">
              <span>Akumulasi</span>
              <span className="tabular-nums">
                {cumulative[hovered].toLocaleString("id-ID")}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function MethodDonut({
  qris,
  cash,
  qrisCount,
  cashCount,
  selected,
  onToggle,
}: {
  qris: number;
  cash: number;
  qrisCount: number;
  cashCount: number;
  selected: "ALL" | PaymentMethod;
  onToggle: (m: PaymentMethod) => void;
}) {
  const [hovered, setHovered] = useState<PaymentMethod | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const circumference = 251.327; // 2 * PI * 40
  const total = qris + cash;
  const gap = qris > 0 && cash > 0 ? 2 : 0;

  const segments = (() => {
    let offset = 0;
    return (
      [
        {
          method: "QRIS" as const,
          label: "Non-Tunai (QRIS)",
          amount: qris,
          count: qrisCount,
          color: QRIS_COLOR,
          bar: "bg-blue-600",
        },
        {
          method: "CASH" as const,
          label: "Setoran Tunai (Cash)",
          amount: cash,
          count: cashCount,
          color: CASH_COLOR,
          bar: "bg-amber-500",
        },
      ] as const
    ).map((s) => {
      const pct = total > 0 ? s.amount / total : 0;
      const seg = pct * circumference;
      const out = {
        ...s,
        pct,
        length: Math.max(0, seg - gap),
        offset: -offset,
      };
      offset += seg;
      return out;
    });
  })();

  const activeMethod = hovered ?? (selected !== "ALL" ? selected : null);
  const active = segments.find((s) => s.method === activeMethod) ?? null;

  return (
    <div className="mt-4 flex flex-col items-center gap-4">
      <div className="relative h-40 w-40 shrink-0">
        <svg
          className="h-full w-full -rotate-90 overflow-visible"
          viewBox="0 0 100 100"
          role="img"
          aria-label="Donut proporsi metode bayar"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="14"
          />
          {[...segments]
            .filter((s) => s.amount > 0)
            .sort(
              (a, b) =>
                Number(a.method === activeMethod) -
                Number(b.method === activeMethod),
            )
            .map((s) => {
              const isActive = activeMethod === s.method;
              const isDimmed = activeMethod !== null && !isActive;
              return (
                <circle
                  key={s.method}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={s.color}
                  strokeWidth={isActive ? 19 : 14}
                  strokeDasharray={`${animated ? s.length : 0} ${circumference}`}
                  strokeDashoffset={s.offset}
                  pointerEvents="stroke"
                  tabIndex={0}
                  role="button"
                  aria-pressed={selected === s.method}
                  aria-label={`${s.label}: Rp ${s.amount.toLocaleString("id-ID")} (${Math.round(s.pct * 100)}%)`}
                  opacity={isDimmed ? 0.3 : 1}
                  onMouseEnter={() => setHovered(s.method)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(s.method)}
                  onBlur={() => setHovered(null)}
                  onClick={() => onToggle(s.method)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onToggle(s.method);
                    }
                  }}
                  style={{
                    cursor: "pointer",
                    outline: "none",
                    transition:
                      "stroke-dasharray 800ms cubic-bezier(0.22, 1, 0.36, 1), stroke-width 180ms ease, opacity 180ms ease",
                  }}
                />
              );
            })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          {total === 0 ? (
            <span className="text-[10px] font-bold text-slate-400">
              Belum Ada Pembayaran
            </span>
          ) : active ? (
            <>
              <span
                className="text-[11px] font-black uppercase tracking-wider"
                style={{ color: active.color }}
              >
                {active.method}
              </span>
              <span className="text-sm font-black tabular-nums text-slate-900">
                Rp {compactRp(active.amount)}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {Math.round(active.pct * 100)}% • {active.count} trx
              </span>
            </>
          ) : (
            <>
              <span className="text-[9px] font-bold uppercase text-slate-400">
                Total Omzet
              </span>
              <span className="text-base font-black tabular-nums text-slate-900">
                Rp {compactRp(total)}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {qrisCount + cashCount} trx
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend dengan progress bar */}
      <div className="w-full space-y-2">
        {segments.map((s) => {
          const isActive = activeMethod === s.method;
          const isDimmed = activeMethod !== null && !isActive;
          return (
            <button
              key={s.method}
              type="button"
              onMouseEnter={() => setHovered(s.method)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(s.method)}
              onBlur={() => setHovered(null)}
              onClick={() => onToggle(s.method)}
              aria-pressed={selected === s.method}
              className={`w-full rounded-xl border p-2.5 text-left transition active:scale-[0.98] ${
                isActive
                  ? "border-slate-300 bg-slate-50 shadow-sm"
                  : "border-slate-100 hover:bg-slate-50"
              } ${isDimmed ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-2 font-bold text-slate-700">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.label}
                </span>
                <span className="font-black tabular-nums text-slate-900">
                  {Math.round(s.pct * 100)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${s.bar} transition-all duration-700`}
                  style={{ width: animated ? `${s.pct * 100}%` : "0%" }}
                />
              </div>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                Rp {s.amount.toLocaleString("id-ID")} • {s.count} kali bayar
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   6. HELPER COMPONENTS & UTILS
   ========================================================= */

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const startTime = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      fromRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

function AnimatedNumber({
  value,
  prefix = "",
}: {
  value: number;
  prefix?: string;
}) {
  const v = useCountUp(value);
  return (
    <>
      {prefix}
      {Math.round(v).toLocaleString("id-ID")}
    </>
  );
}

function MethodCard({
  title,
  subtitle,
  amount,
  percentage,
  count,
  color,
  icon,
  iconClass,
  percentClass,
  active,
  onClick,
}: {
  title: string;
  subtitle?: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
  icon: React.ReactNode;
  iconClass: string;
  percentClass: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title="Klik untuk memfilter daftar transaksi"
      className={`group rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] ${
        active ? "border-transparent ring-2" : "border-slate-200/80"
      }`}
      style={
        active
          ? ({ "--tw-ring-color": color } as React.CSSProperties)
          : undefined
      }
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          {subtitle && (
            <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
      <h3 className="mt-2 text-2xl font-black tabular-nums text-slate-900">
        <AnimatedNumber value={amount} prefix="Rp " />
      </h3>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className={`font-bold ${percentClass}`}>
          {percentage}% dari total
        </span>
        <span className="font-semibold text-slate-400">{count} Transaksi</span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </button>
  );
}

function InsightItem({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black tabular-nums text-slate-900">
        {value}
      </p>
      {hint && (
        <p className="truncate text-[11px] font-medium text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 py-0.5 pl-2.5 pr-1 text-[11px] font-bold text-blue-700">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Hapus filter ${label}`}
        className="rounded p-0.5 text-blue-500 transition hover:bg-blue-100 hover:text-blue-800"
      >
        <FiX className="h-3 w-3" />
      </button>
    </span>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <th
      className="px-5 py-3"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider transition hover:text-slate-800 ${
          active ? "text-blue-700" : ""
        }`}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <FiChevronUp className="h-3.5 w-3.5" />
          ) : (
            <FiChevronDown className="h-3.5 w-3.5" />
          )
        ) : (
          <FiChevronDown className="h-3.5 w-3.5 opacity-30" />
        )}
      </button>
    </th>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className="truncate text-xs font-black text-slate-800">{value}</div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen w-full bg-white pb-12 font-sans">
      <div className="h-[65px] border-b border-slate-200/80 bg-white/90" />
      <div className="mx-auto max-w-5xl space-y-6 px-4 pt-6 sm:px-6">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-200/70" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-slate-200/70"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-2xl bg-slate-200/70 lg:col-span-2" />
          <div className="h-80 animate-pulse rounded-2xl bg-slate-200/70" />
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />
      </div>
    </div>
  );
}

function formatHM(ms: number) {
  return new Date(ms).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatClock(input: string | number) {
  try {
    return new Date(input).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return String(input);
  }
}

function formatDate(isoDate: string) {
  try {
    return new Date(isoDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    const dateStr = d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `${dateStr} • ${timeStr}`;
  } catch {
    return iso;
  }
}
