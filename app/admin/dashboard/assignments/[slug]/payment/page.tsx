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
  FiDownload,
  FiCalendar,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiPieChart,
  FiActivity,
  FiUserCheck,
  FiMapPin,
  FiUser,
  FiBarChart2,
  FiCopy,
  FiCheck,
  FiChevronUp,
  FiChevronDown,
  FiX,
  FiAward,
  FiInbox,
} from "react-icons/fi";

/* =========================================================
1. TYPES (SESUAI RESPONSE LENGKAP BACKEND)
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
  amount: string;
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
const CASH_COLOR = "#D97706";

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

export default function AssignmentFinanceAnalyticsPage() {
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
      <FinanceAnalyticsContent />
    </QueryClientProvider>
  );
}

/* =========================================================
4. MAIN DASHBOARD CONTENT
   ========================================================= */

type SortKey = "paidAt" | "amount";
type SortDir = "asc" | "desc";

function FinanceAnalyticsContent() {
  const router = useRouter();
  const params = useParams();

  // BACA SLUG / PARAMETER SECARA DINAMIS
  const rawId = params?.id ?? params?.assignmentId ?? params?.slug;
  const assignmentId = useMemo(() => {
    if (!rawId) return NaN;
    const parsed = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [rawId]);

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // TanStack Query (Hanya aktif jika assignmentId valid)
  const {
    data: payments = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["assignment-payments", assignmentId],
    queryFn: () => fetchAssignmentPayments(assignmentId),
    enabled: Number.isFinite(assignmentId) && assignmentId > 0,
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

  const { buckets, bucketMs } = useMemo(
    () => buildBuckets(payments),
    [payments],
  );

  const activeBucket = useMemo(
    () => buckets.find((b) => b.start === selectedBucket) ?? null,
    [buckets, selectedBucket],
  );

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

  const copyRef = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(value);
      setTimeout(() => setCopiedId((c) => (c === value ? null : c)), 1500);
    } catch {
      /* clipboard tidak tersedia */
    }
  };

  const exportToCSV = () => {
    if (sortedPayments.length === 0) return;

    const headers = [
      "Penugasan ID",
      "Metode",
      "Nominal (Rp)",
      "Estimasi Kursi",
      "Ref Transaction ID",
      "Waktu Pembayaran",
    ];

    const rows = sortedPayments.map((p) => [
      p.vehicleAssignmentId,
      p.paymentMethod,
      Number(p.amount),
      Math.round(Number(p.amount) / TICKET_PRICE),
      p.transactionId ?? "-",
      new Date(p.paidAt).toLocaleString("id-ID"),
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map(csvCell).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan_keuangan_assignment_${assignmentId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ---------------------------------------------------------
     INVALID SLUG / PARAMETER STATE
  --------------------------------------------------------- */
  if (Number.isNaN(assignmentId) || assignmentId <= 0) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center font-sans select-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
          <FiAlertCircle size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">
            ID Penugasan Tidak Valid
          </h2>
          <p className="max-w-xs text-xs text-slate-500">
            Parameter rute ID penugasan tidak ditemukan atau formatnya salah.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
        >
          Kembali
        </button>
      </div>
    );
  }

  /* ---------------------------------------------------------
     LOADING & ERROR STATES
  --------------------------------------------------------- */
  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center font-sans select-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
          <FiAlertCircle size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">
            Gagal Memuat Laporan Keuangan
          </h2>
          <p className="max-w-md text-xs text-slate-500">
            {error instanceof Error
              ? error.message
              : "Terjadi kesalahan sistem."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
          >
            Kembali
          </button>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-100 font-sans text-slate-900 antialiased pb-12 select-none">
      {/* ---------------------------------------------------------
          HEADER & TOOLBAR
      --------------------------------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition active:bg-slate-100"
              title="Kembali"
            >
              <FiArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900">
                  Statistik Keuangan Penugasan #{assignmentId}
                </h1>
              </div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <FiClock className="h-3 w-3" />
                Diperbarui {dataUpdatedAt ? formatClock(dataUpdatedAt) : "-"}
                {isFetching && (
                  <span className="font-bold text-blue-600">• memuat…</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              aria-pressed={autoRefresh}
              title="Perbarui otomatis tiap 10 detik"
              className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition active:bg-slate-100 ${
                autoRefresh
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {autoRefresh && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    autoRefresh ? "bg-emerald-600" : "bg-slate-400"
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
              className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition active:bg-slate-100 disabled:opacity-50"
            >
              <FiRefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={exportToCSV}
              disabled={sortedPayments.length === 0}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-xs font-bold text-white transition active:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiDownload className="h-3.5 w-3.5" />
              <span>
                Ekspor CSV
                {hasActiveFilter && sortedPayments.length > 0
                  ? ` (${sortedPayments.length})`
                  : ""}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 pt-4">
        {/* ---------------------------------------------------------
            ASSIGNMENT METADATA CARD
        --------------------------------------------------------- */}
        {assignmentInfo && (
          <div className="rounded-xl border border-slate-300 bg-white p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              <MetaItem
                icon={<FiMapPin className="text-slate-600" />}
                label="Trayek / Rute"
                value={
                  assignmentInfo.route ? (
                    <span className="flex items-center gap-1">
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
                icon={<FiTruck className="text-slate-600" />}
                label="Kendaraan"
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
                icon={<FiUserCheck className="text-slate-600" />}
                label="Pengemudi"
                value={
                  assignmentInfo.driver?.name ??
                  `Driver #${assignmentInfo.driverId}`
                }
              />
              <MetaItem
                icon={<FiUser className="text-slate-600" />}
                label="Kondektur"
                value={assignmentInfo.conductor?.name ?? "-"}
              />
              <MetaItem
                icon={<FiCalendar className="text-slate-600" />}
                label="Tanggal Tugas"
                value={formatDate(assignmentInfo.assignmentDate)}
              />
              <MetaItem
                icon={<FiClock className="text-slate-600" />}
                label="Jam Mulai"
                value={assignmentInfo.startTime.slice(0, 5)}
              />
              <MetaItem
                icon={<FiCheckCircle className="text-slate-600" />}
                label="Status Tugas"
                value={
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      assignmentInfo.status === "ONGOING"
                        ? "bg-blue-100 text-blue-900 border border-blue-300"
                        : assignmentInfo.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : assignmentInfo.status === "CANCELLED"
                            ? "bg-rose-100 text-rose-900 border border-rose-300"
                            : "bg-slate-100 text-slate-800 border border-slate-300"
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
            EXECUTIVE STATS OVERVIEW CARDS
        --------------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card Total Pemasukan */}
          <div className="rounded-xl border border-slate-300 bg-white p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Pendapatan
              </span>
              <FiDollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700 leading-tight">
              <AnimatedNumber value={stats.totalIncome} prefix="Rp " />
            </p>
            <p className="text-[10px] font-semibold text-slate-500">
              Setara {stats.totalPaidSeats} tiket terbayar (@ Rp{" "}
              {TICKET_PRICE.toLocaleString("id-ID")})
            </p>
          </div>

          {/* Card Pendapatan QRIS */}
          <MethodCard
            title="Pendapatan QRIS"
            amount={stats.qrisIncome}
            percentage={stats.qrisPercentage}
            count={stats.qrisCount}
            color={QRIS_COLOR}
            icon={<FiCreditCard className="h-4 w-4 text-blue-600" />}
            active={methodFilter === "QRIS"}
            onClick={() => toggleMethod("QRIS")}
          />

          {/* Card Pendapatan Cash */}
          <MethodCard
            title="Pendapatan Cash"
            amount={stats.cashIncome}
            percentage={stats.cashPercentage}
            count={stats.cashCount}
            color={CASH_COLOR}
            icon={<FiDollarSign className="h-4 w-4 text-amber-600" />}
            active={methodFilter === "CASH"}
            onClick={() => toggleMethod("CASH")}
          />

          {/* Card Total Transaksi */}
          <div className="rounded-xl border border-slate-300 bg-white p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Volume Transaksi
              </span>
              <FiPieChart className="h-4 w-4 text-slate-700" />
            </div>
            <p className="text-2xl font-black text-slate-900 leading-tight">
              <AnimatedNumber value={stats.totalTransactions} />{" "}
              <span className="text-xs font-semibold text-slate-500">Trx</span>
            </p>
            <p className="text-[10px] font-semibold text-slate-500">
              Rata-rata: Rp{" "}
              {Math.round(stats.averageTicket).toLocaleString("id-ID")} / trx
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------------
            GRAFIK PENDAPATAN PER WAKTU + DONUT METODE PEMBAYARAN
        --------------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-300 bg-white p-4 lg:col-span-2 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                <FiBarChart2 className="text-slate-700" /> Pendapatan per{" "}
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
                  <span className="h-0 w-4 border-t-2 border-dashed border-emerald-600" />
                  Total per Periode
                </span>
              </div>
            </div>

            <RevenueChart
              buckets={buckets}
              bucketMs={bucketMs}
              selectedStart={activeBucket?.start ?? null}
              onSelect={(start) =>
                setSelectedBucket((prev) => (prev === start ? null : start))
              }
            />

            {insights && (
              <div className="grid grid-cols-1 gap-2 border-t border-slate-200 pt-3 sm:grid-cols-3">
                <InsightItem
                  icon={<FiAward className="text-slate-600" />}
                  label="Transaksi terbesar"
                  value={`Rp ${Number(insights.largest.amount).toLocaleString("id-ID")}`}
                  hint={`${insights.largest.paymentMethod} • ${formatClock(insights.largest.paidAt)}`}
                />
                <InsightItem
                  icon={<FiClock className="text-slate-600" />}
                  label="Transaksi terakhir"
                  value={formatClock(insights.latest.paidAt)}
                  hint={`Rp ${Number(insights.latest.amount).toLocaleString("id-ID")} • ${insights.latest.paymentMethod}`}
                />
                <InsightItem
                  icon={<FiTrendingUp className="text-slate-600" />}
                  label="Periode tersibuk"
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

          <div className="rounded-xl border border-slate-300 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                <FiPieChart className="text-slate-700" /> Rasio Metode Bayar
              </h3>
              <span className="text-[11px] font-bold text-slate-600">
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
            TRANSACTIONS TABLE & FILTERS
        --------------------------------------------------------- */}
        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Daftar Riwayat Transaksi
              </h3>
              <p className="text-[11px] text-slate-500">
                Menampilkan {sortedPayments.length} dari {payments.length} total
                transaksi
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Box */}
              <div className="relative min-w-[180px]">
                <FiSearch
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={13}
                />
                <input
                  type="text"
                  placeholder="Cari Ref TRX / Nominal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-7 py-1 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-slate-800"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    aria-label="Hapus pencarian"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded text-slate-400 hover:text-slate-700"
                  >
                    <FiX className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Metode */}
              <div className="flex items-center gap-0.5 rounded-lg border border-slate-300 bg-slate-100 p-0.5">
                <FiFilter className="ml-1 h-3 w-3 text-slate-500" />
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
                      className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold transition ${
                        methodFilter === method
                          ? "bg-white text-slate-900 border border-slate-200 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {method}
                      <span className="rounded bg-slate-200 px-1 py-px text-[9px] font-black text-slate-700">
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
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3.5 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Filter aktif:
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
                className="ml-auto text-[11px] font-bold text-slate-800 hover:underline"
              >
                Reset semua
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-4 py-2.5">No</th>
                  <SortableTh
                    label="Waktu Transaksi"
                    active={sortKey === "paidAt"}
                    dir={sortDir}
                    onClick={() => toggleSort("paidAt")}
                  />
                  <th className="px-4 py-2.5">Metode</th>
                  <SortableTh
                    label="Nominal (Rp)"
                    active={sortKey === "amount"}
                    dir={sortDir}
                    onClick={() => toggleSort("amount")}
                  />
                  <th className="px-4 py-2.5">Porsi Kursi</th>
                  <th className="px-4 py-2.5">ID Transaksi / Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      <FiInbox className="mx-auto mb-2 h-7 w-7 text-slate-400" />
                      <p className="text-xs font-bold text-slate-800">
                        {payments.length === 0
                          ? "Belum Ada Transaksi"
                          : "Tidak Ada Transaksi Ditemukan"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {payments.length === 0
                          ? "Transaksi QRIS atau tunai akan muncul di sini."
                          : "Ubah kata kunci pencarian atau reset filter."}
                      </p>
                      {hasActiveFilter && (
                        <button
                          onClick={resetAllFilters}
                          className="mt-3 rounded border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-800 hover:bg-slate-50"
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
                    const refValue = p.transactionId ?? "";

                    return (
                      <tr key={p.id} className="transition hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                          {formatDateTime(p.paidAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${
                              isQris
                                ? "bg-blue-50 text-blue-900 border-blue-200"
                                : "bg-amber-50 text-amber-900 border-amber-200"
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
                        <td className="whitespace-nowrap px-4 py-3 font-black tabular-nums text-slate-900">
                          Rp {amountNum.toLocaleString("id-ID")}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="font-bold text-slate-800">
                            {seats} Kursi
                          </span>
                          <span className="ml-1 text-[10px] text-slate-500">
                            (@ Rp {TICKET_PRICE.toLocaleString("id-ID")})
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {refValue ? (
                            <button
                              onClick={() => copyRef(refValue)}
                              title="Salin ID transaksi"
                              className="group inline-flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-700 transition hover:border-slate-300 active:bg-slate-100"
                            >
                              {refValue}
                              {copiedId === refValue ? (
                                <FiCheck className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <FiCopy className="h-3 w-3 text-slate-400 transition group-hover:text-slate-600" />
                              )}
                            </button>
                          ) : (
                            <span className="font-mono text-[11px] font-bold text-slate-400">
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {sortedPayments.length > 0 && (
                <tfoot className="border-t border-slate-200 bg-slate-50 font-bold">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-2.5 text-[11px] uppercase tracking-wider text-slate-600"
                    >
                      {hasActiveFilter ? "Subtotal tampilan" : "Total"} (
                      {sortedPayments.length} trx)
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-black tabular-nums text-slate-900">
                      Rp {filteredTotal.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {Math.round(filteredTotal / TICKET_PRICE)} Kursi
                    </td>
                    <td />
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
}: {
  buckets: Bucket[];
  bucketMs: number;
  selectedStart: number | null;
  onSelect: (start: number) => void;
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
      <div className="flex h-52 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center">
        <FiBarChart2 className="h-7 w-7 text-slate-400" />
        <p className="mt-2 text-xs font-bold text-slate-700">
          Belum Ada Data Grafik
        </p>
        <p className="text-[11px] text-slate-500">
          Grafik akan tampil otomatis setelah ada transaksi.
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

  const centerX = (i: number) => padL + slot * (i + 0.5);

  const hoveredBucket = hovered !== null ? buckets[hovered] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label="Grafik batang pendapatan per periode waktu"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={yOf(t)}
              y2={yOf(t)}
              stroke="#CBD5E1"
              strokeDasharray={t === 0 ? undefined : "3 4"}
            />
            <text
              x={padL - 8}
              y={yOf(t) + 3}
              textAnchor="end"
              fontSize="9"
              fontWeight="600"
              fill="#64748B"
            >
              {compactRp(t)}
            </text>
          </g>
        ))}

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
                transition: `transform 600ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 25}ms, opacity 150ms ease`,
                opacity: isDimmed ? 0.35 : 1,
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

        {n > 1 && (
          <polyline
            points={buckets
              .map((bucket, i) => `${centerX(i)},${yOf(bucket.total)}`)
              .join(" ")}
            fill="none"
            stroke="#059669"
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: animated ? 1 : 0,
              transition: "opacity 500ms ease 300ms",
            }}
            pointerEvents="none"
          />
        )}
        {hovered !== null && (
          <circle
            cx={centerX(hovered)}
            cy={yOf(buckets[hovered].total)}
            r={4}
            fill="#059669"
            stroke="#fff"
            strokeWidth={2}
            pointerEvents="none"
          />
        )}

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
                  : "#64748B"
              }
            >
              {bucketLabel(b, bucketMs)}
            </text>
          ) : null,
        )}

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

      {hoveredBucket && hovered !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10 w-44 rounded-lg border border-slate-300 bg-white p-2.5 text-[11px] shadow-md"
          style={{
            left: `${Math.min(80, Math.max(20, (centerX(hovered) / W) * 100))}%`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="font-extrabold text-slate-900">
            {bucketRange(hoveredBucket, bucketMs)}
          </p>
          <p className="text-sm font-black tabular-nums text-slate-900">
            Rp {hoveredBucket.total.toLocaleString("id-ID")}
          </p>
          <div className="mt-1 space-y-0.5 font-semibold text-slate-600">
            <p className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1">
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
              <span className="flex items-center gap-1">
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

  const circumference = 251.327;
  const total = qris + cash;
  const gap = qris > 0 && cash > 0 ? 2 : 0;

  const segments = (() => {
    let offset = 0;
    return (
      [
        {
          method: "QRIS" as const,
          label: "QRIS",
          amount: qris,
          count: qrisCount,
          color: QRIS_COLOR,
          bar: "bg-blue-600",
        },
        {
          method: "CASH" as const,
          label: "Cash (Tunai)",
          amount: cash,
          count: cashCount,
          color: CASH_COLOR,
          bar: "bg-amber-600",
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
    <div className="mt-2 flex flex-col items-center gap-3">
      <div className="relative h-32 w-32 shrink-0">
        <svg
          className="h-full w-full -rotate-90 overflow-visible"
          viewBox="0 0 100 100"
          role="img"
          aria-label="Donut rasio metode pembayaran"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#E2E8F0"
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
                  strokeWidth={isActive ? 18 : 14}
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
                      "stroke-dasharray 600ms cubic-bezier(0.22, 1, 0.36, 1), stroke-width 150ms ease, opacity 150ms ease",
                  }}
                />
              );
            })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          {total === 0 ? (
            <span className="text-[10px] font-bold text-slate-400">Kosong</span>
          ) : active ? (
            <>
              <span
                className="text-[10px] font-extrabold uppercase tracking-wider"
                style={{ color: active.color }}
              >
                {active.method}
              </span>
              <span className="text-xs font-black tabular-nums text-slate-900">
                Rp {compactRp(active.amount)}
              </span>
              <span className="text-[9px] font-bold text-slate-500">
                {Math.round(active.pct * 100)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[9px] font-bold uppercase text-slate-500">
                Total
              </span>
              <span className="text-sm font-black tabular-nums text-slate-900">
                Rp {compactRp(total)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="w-full space-y-1.5">
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
              className={`w-full rounded-lg border p-2 text-left transition active:bg-slate-100 ${
                isActive
                  ? "border-slate-400 bg-slate-50"
                  : "border-slate-200 hover:bg-slate-50"
              } ${isDimmed ? "opacity-40" : ""}`}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.label}
                </span>
                <span>{Math.round(s.pct * 100)}%</span>
              </div>
              <p className="mt-1 text-[10px] font-semibold text-slate-500">
                Rp {s.amount.toLocaleString("id-ID")} • {s.count} trx
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

function useCountUp(target: number, duration = 600) {
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
  amount,
  percentage,
  count,
  color,
  icon,
  active,
  onClick,
}: {
  title: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title="Klik untuk memfilter tabel"
      className={`rounded-xl border bg-white p-4 text-left transition active:bg-slate-100 ${
        active ? "border-slate-800 ring-1 ring-slate-800" : "border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {icon}
      </div>
      <p className="mt-1 text-2xl font-black text-slate-900 leading-tight">
        <AnimatedNumber value={amount} prefix="Rp " />
      </p>
      <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-500">
        <span style={{ color }}>{percentage}% dari Total</span>
        <span>{count} Transaksi</span>
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
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-black text-slate-900">
        {value}
      </p>
      {hint && (
        <p className="truncate text-[10px] font-semibold text-slate-500">
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
    <span className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white py-0.5 pl-2 pr-1 text-[11px] font-bold text-slate-800">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Hapus filter ${label}`}
        className="rounded p-0.5 text-slate-400 hover:text-slate-800"
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
      className="px-4 py-2.5"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider transition hover:text-slate-900 ${
          active ? "text-slate-900" : ""
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
    <div className="space-y-0.5">
      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="truncate text-xs font-black text-slate-900">{value}</div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen w-full bg-slate-100 pb-12 font-sans select-none">
      <div className="h-14 border-b border-slate-200 bg-white" />
      <div className="mx-auto max-w-6xl space-y-4 px-4 pt-4">
        <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-xl bg-slate-200 lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-xl bg-slate-200" />
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

function csvCell(v: string | number) {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
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
