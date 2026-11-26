"use client";

import { useState, useMemo } from "react";
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
  FiUsers,
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
  // Nested Objects dari Backend Response Terbaru
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

function FinanceAnalyticsContent() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const assignmentId = Number(params?.id ?? 10);

  // States Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<"ALL" | PaymentMethod>(
    "ALL",
  );

  // TanStack Query
  const {
    data: payments = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["assignment-payments", assignmentId],
    queryFn: () => fetchAssignmentPayments(assignmentId),
    enabled: Number.isFinite(assignmentId),
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
    };
  }, [payments]);

  // Filtered Payments Table Data
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesMethod =
        methodFilter === "ALL" || p.paymentMethod === methodFilter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        p.id.toLowerCase().includes(searchLower) ||
        (p.transactionId &&
          p.transactionId.toLowerCase().includes(searchLower)) ||
        p.amount.includes(searchLower);

      return matchesMethod && matchesSearch;
    });
  }, [payments, methodFilter, searchTerm]);

  // Export Data to CSV
  const exportToCSV = () => {
    if (payments.length === 0) return;

    const headers = [
      "Penugasan ID",
      "Metode",
      "Nominal (Rp)",
      "Estimasi Kursi",
      "Ref Transaction ID",
      "Waktu Pembayaran",
    ];

    const rows = payments.map((p) => [
      p.vehicleAssignmentId,
      p.paymentMethod,
      Number(p.amount),
      Math.round(Number(p.amount) / TICKET_PRICE),
      p.transactionId ?? "-",
      new Date(p.paidAt).toLocaleString("id-ID"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `laporan_keuangan_assignment_${assignmentId}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ---------------------------------------------------------
     LOADING & ERROR STATES
  --------------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-slate-50 text-slate-500 font-sans">
        <FiRefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold">Memuat Statistik Keuangan...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center font-sans">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm">
          <FiAlertCircle size={28} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            Gagal Memuat Laporan Keuangan
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
    <div className="min-h-screen w-full bg-slate-50/60 font-sans text-slate-900 antialiased pb-12">
      {/* ---------------------------------------------------------
          HEADER & TOOLBAR
      --------------------------------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 active:scale-95"
              title="Kembali"
            >
              <FiArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-slate-900 sm:text-lg">
                  Statistik Keuangan Penugasan
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
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

            <button
              onClick={exportToCSV}
              disabled={payments.length === 0}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiDownload className="h-3.5 w-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6">
        {/* ---------------------------------------------------------
            ASSIGNMENT METADATA CARD (DENGAN FIELD VEHICLE, ROUTE, DRIVER)
        --------------------------------------------------------- */}
        {assignmentInfo && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
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
                icon={<FiUserCheck className="text-emerald-600" />}
                label="Pengemudi (Driver)"
                value={
                  assignmentInfo.driver?.name ??
                  `Driver #${assignmentInfo.driverId}`
                }
              />
              <MetaItem
                icon={<FiUser className="text-teal-600" />}
                label="Kondektur"
                value={assignmentInfo.conductor?.name ?? "-"}
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
            EXECUTIVE STATS OVERVIEW CARDS
        --------------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card Total Pemasukan */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white shadow-lg shadow-emerald-600/20">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Total Pendapatan
              </p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                <FiDollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Rp {stats.totalIncome.toLocaleString("id-ID")}
            </h3>
            <p className="mt-2 text-[11px] font-medium text-emerald-100 flex items-center gap-1">
              <FiTrendingUp className="h-3.5 w-3.5" />
              Setara {stats.totalPaidSeats} tiket terbayar (@ Rp{" "}
              {TICKET_PRICE.toLocaleString("id-ID")})
            </p>
          </div>

          {/* Card Pendapatan QRIS */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pendapatan QRIS
              </p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiCreditCard className="h-5 w-5" />
              </div>
            </div>
            <h3 className="mt-2 text-2xl font-black text-slate-900">
              Rp {stats.qrisIncome.toLocaleString("id-ID")}
            </h3>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="font-bold text-blue-600">
                {stats.qrisPercentage}% dari Total
              </span>
              <span className="font-semibold text-slate-400">
                {stats.qrisCount} Transaksi
              </span>
            </div>
          </div>

          {/* Card Pendapatan Cash */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pendapatan Cash (Tunai)
              </p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FiDollarSign className="h-5 w-5" />
              </div>
            </div>
            <h3 className="mt-2 text-2xl font-black text-slate-900">
              Rp {stats.cashIncome.toLocaleString("id-ID")}
            </h3>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-600">
                {stats.cashPercentage}% dari Total
              </span>
              <span className="font-semibold text-slate-400">
                {stats.cashCount} Transaksi
              </span>
            </div>
          </div>

          {/* Card Total Transaksi */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Volume Transaksi
              </p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <FiPieChart className="h-5 w-5" />
              </div>
            </div>
            <h3 className="mt-2 text-2xl font-black text-slate-900">
              {stats.totalTransactions}{" "}
              <span className="text-sm font-bold text-slate-500">Trx</span>
            </h3>
            <p className="mt-2 text-[11px] font-medium text-slate-400">
              Rata-rata: Rp{" "}
              {stats.totalTransactions > 0
                ? Math.round(
                    stats.totalIncome / stats.totalTransactions,
                  ).toLocaleString("id-ID")
                : 0}{" "}
              / transaksi
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------------
            BREAKDOWN VISUAL BAR RATIO & COMPARISON
        --------------------------------------------------------- */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FiPieChart className="text-blue-600" /> Rasio Metode Pembayaran
            </h3>
            <span className="text-xs font-bold text-slate-700">
              Total {stats.totalTransactions} Transaksi
            </span>
          </div>

          {/* Visual Progress Bar Ratio */}
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 flex">
            <div
              style={{ width: `${stats.qrisPercentage}%` }}
              className="bg-blue-600 transition-all duration-500"
              title={`QRIS: ${stats.qrisPercentage}%`}
            />
            <div
              style={{ width: `${stats.cashPercentage}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Cash: ${stats.cashPercentage}%`}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-bold pt-1">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-600 inline-block" />
              <span className="text-slate-700">
                QRIS: Rp {stats.qrisIncome.toLocaleString("id-ID")} (
                {stats.qrisPercentage}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-700">
                Cash: Rp {stats.cashIncome.toLocaleString("id-ID")} (
                {stats.cashPercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------
            TRANSACTIONS TABLE & FILTERS (RINGKAS TANPA UUID)
        --------------------------------------------------------- */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden space-y-4">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Daftar Riwayat Transaksi
              </h3>
              <p className="text-xs text-slate-500">
                Menampilkan {filteredPayments.length} dari {payments.length}{" "}
                total transaksi
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Box */}
              <div className="relative min-w-[200px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Ref TRX / Nominal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Filter Metode */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <FiFilter className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
                {(["ALL", "QRIS", "CASH"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setMethodFilter(method)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                      methodFilter === method
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-y border-slate-100">
                <tr>
                  <th className="px-5 py-3">No</th>
                  <th className="px-5 py-3">Waktu Transaksi</th>
                  <th className="px-5 py-3">Metode</th>
                  <th className="px-5 py-3">Nominal (Rp)</th>
                  <th className="px-5 py-3">Porsi Kursi</th>
                  <th className="px-5 py-3">ID Transaksi / Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-slate-400"
                    >
                      <p className="font-bold text-xs text-slate-600">
                        Tidak ada transaksi ditemukan
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Coba ubah kata kunci pencarian atau filter metode
                        pembayaran
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p, idx) => {
                    const amountNum = Number(p.amount);
                    const seats = Math.round(amountNum / TICKET_PRICE);
                    const isQris = p.paymentMethod === "QRIS";

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 transition"
                      >
                        <td className="px-5 py-3.5 font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-800">
                          {formatDateTime(p.paidAt)}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
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
                        <td className="px-5 py-3.5 font-black text-slate-900 whitespace-nowrap">
                          Rp {amountNum.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-bold text-slate-700">
                            {seats} Kursi
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            (@ Rp 5.000)
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-600 whitespace-nowrap">
                          {p.transactionId ?? "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   5. HELPER COMPONENTS & UTILS
   ========================================================= */

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
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-xs font-black text-slate-800 truncate">{value}</div>
    </div>
  );
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
