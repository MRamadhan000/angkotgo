"use client";

import { useMemo, useState } from "react";
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
  FiCalendar,
  FiClock,
  FiTruck,
  FiMapPin,
  FiSearch,
  FiFilter,
  FiInbox,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

/* =========================================================
   TYPES
========================================================= */

type PaymentMethod = "QRIS" | "CASH";

type AssignmentStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";

interface ApiRoute {
  id: number;
  code: string;
  name: string;
  color: string;
}

interface ApiPerson {
  id: number;
  name: string;
}

interface ApiVehicle {
  id: number;
  plateNumber: string;
  vehicleCode: string;
}

interface ApiVehicleAssignment {
  id: number;
  routeId: number;
  vehicleId: number;
  startTime: string;
  status: AssignmentStatus;
  assignmentDate: string;
  route?: ApiRoute;
  driver?: ApiPerson;
  conductor?: ApiPerson | null;
  vehicle?: ApiVehicle;
}

interface ApiPayment {
  id: string;
  vehicleAssignmentId: number;
  vehicleAssignment: ApiVehicleAssignment;
  amount: string;
  paymentMethod: PaymentMethod;
  transactionId: string | null;
  paidAt: string;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

/* =========================================================
   API
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
    const message = Array.isArray(json?.message)
      ? json.message.join(", ")
      : (json?.message ?? "Gagal mengambil data pembayaran");

    throw new Error(message);
  }

  return (json as ApiResponse<ApiPayment[]>).data ?? [];
}

/* =========================================================
   PAGE PROVIDER
========================================================= */

export default function DriverFinancePage() {
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
   MAIN CONTENT
========================================================= */

function DriverFinanceContent() {
  const router = useRouter();
  const params = useParams();

  // BACA SLUG / PARAMETER SECARA DINAMIS
  const rawId = params?.id ?? params?.assignmentId ?? params?.slug;
  const assignmentId = useMemo(() => {
    if (!rawId) return NaN;
    const parsed = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [rawId]);

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<"ALL" | PaymentMethod>(
    "ALL",
  );

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
    enabled: Number.isInteger(assignmentId) && assignmentId > 0,
  });

  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalIncome = payments.reduce(
    (total, payment) => total + (Number(payment.amount) || 0),
    0,
  );

  const cashPayments = payments.filter((p) => p.paymentMethod === "CASH");

  const qrisPayments = payments.filter((p) => p.paymentMethod === "QRIS");

  const cashIncome = cashPayments.reduce(
    (total, p) => total + (Number(p.amount) || 0),
    0,
  );

  const qrisIncome = qrisPayments.reduce(
    (total, p) => total + (Number(p.amount) || 0),
    0,
  );

  const totalPassengers = Math.round(totalIncome / TICKET_PRICE);

  const assignmentInfo =
    payments.length > 0 ? payments[0].vehicleAssignment : null;

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredPayments = payments
    .filter((payment) => {
      const matchesMethod =
        methodFilter === "ALL" || payment.paymentMethod === methodFilter;

      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        payment.id.toLowerCase().includes(searchValue) ||
        (payment.transactionId ?? "").toLowerCase().includes(searchValue) ||
        String(Number(payment.amount)).includes(searchValue.replace(/\D/g, ""));

      return matchesMethod && matchesSearch;
    })
    .sort(
      (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
    );

  /* =========================================================
     LOADING
  ========================================================= */

  if (isLoading) {
    return <PageSkeleton />;
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <FiAlertCircle size={26} />
        </div>

        <h2 className="text-lg font-bold text-slate-900">
          Gagal Memuat Pendapatan
        </h2>

        <p className="mt-2 max-w-sm text-sm text-slate-500">
          {error instanceof Error ? error.message : "Terjadi kesalahan sistem."}
        </p>

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            Kembali
          </button>

          <button
            onClick={() => refetch()}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 pb-10 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Kembali"
            >
              <FiArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900">
                Pendapatan Saya
              </h1>
              <p className="text-[11px] text-slate-500">
                Penugasan #{assignmentId}
              </p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <FiRefreshCw className={isFetching ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 px-4 pt-5">
        {/* ASSIGNMENT INFO */}
        {assignmentInfo && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">
                Informasi Penugasan
              </h2>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  assignmentInfo.status === "ONGOING"
                    ? "bg-blue-50 text-blue-700"
                    : assignmentInfo.status === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-700"
                      : assignmentInfo.status === "CANCELLED"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-amber-50 text-amber-700"
                }`}
              >
                {assignmentInfo.status}
              </span>
            </div>

            <div className="space-y-3">
              <InfoRow
                icon={<FiMapPin />}
                label="Rute"
                value={
                  assignmentInfo.route
                    ? `${assignmentInfo.route.name} (${assignmentInfo.route.code})`
                    : `Rute #${assignmentInfo.routeId}`
                }
              />

              <InfoRow
                icon={<FiTruck />}
                label="Kendaraan"
                value={
                  assignmentInfo.vehicle
                    ? `${assignmentInfo.vehicle.vehicleCode} - ${assignmentInfo.vehicle.plateNumber}`
                    : `Kendaraan #${assignmentInfo.vehicleId}`
                }
              />

              <InfoRow
                icon={<FiUser />}
                label="Kondektur"
                value={assignmentInfo.conductor?.name ?? "Tanpa kondektur"}
              />

              <InfoRow
                icon={<FiCalendar />}
                label="Tanggal"
                value={formatDate(assignmentInfo.assignmentDate)}
              />

              <InfoRow
                icon={<FiClock />}
                label="Jam mulai"
                value={assignmentInfo.startTime?.slice(0, 5) ?? "-"}
              />
            </div>
          </section>
        )}

        {/* TOTAL INCOME */}
        <section className="overflow-hidden rounded-2xl bg-emerald-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-100">
                Total Pendapatan
              </p>

              <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
                {formatRupiah(totalIncome)}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <FiDollarSign size={25} />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 border-t border-white/20 pt-4 text-sm text-emerald-50">
            <FiCheckCircle size={16} />
            <span>{payments.length} transaksi pembayaran</span>

            <span className="mx-1">•</span>

            <span>{totalPassengers} penumpang terbayar</span>
          </div>
        </section>

        {/* PAYMENT METHODS */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Rincian Pembayaran
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Pendapatan berdasarkan metode pembayaran
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* CASH */}
            <button
              type="button"
              onClick={() =>
                setMethodFilter((prev) => (prev === "CASH" ? "ALL" : "CASH"))
              }
              className={`rounded-2xl border bg-white p-4 text-left transition ${
                methodFilter === "CASH"
                  ? "border-amber-400 ring-2 ring-amber-100"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <FiDollarSign size={19} />
                </div>

                {methodFilter === "CASH" && (
                  <FiCheckCircle className="text-amber-600" />
                )}
              </div>

              <p className="mt-3 text-xs font-semibold text-slate-500">
                Tunai (Cash)
              </p>

              <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                {formatRupiah(cashIncome)}
              </h3>

              <p className="mt-1 text-[11px] text-slate-400">
                {cashPayments.length} transaksi
              </p>
            </button>

            {/* QRIS */}
            <button
              type="button"
              onClick={() =>
                setMethodFilter((prev) => (prev === "QRIS" ? "ALL" : "QRIS"))
              }
              className={`rounded-2xl border bg-white p-4 text-left transition ${
                methodFilter === "QRIS"
                  ? "border-blue-400 ring-2 ring-blue-100"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiCreditCard size={19} />
                </div>

                {methodFilter === "QRIS" && (
                  <FiCheckCircle className="text-blue-600" />
                )}
              </div>

              <p className="mt-3 text-xs font-semibold text-slate-500">
                Non-Tunai (QRIS)
              </p>

              <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                {formatRupiah(qrisIncome)}
              </h3>

              <p className="mt-1 text-[11px] text-slate-400">
                {qrisPayments.length} transaksi
              </p>
            </button>
          </div>

          {methodFilter !== "ALL" && (
            <button
              onClick={() => setMethodFilter("ALL")}
              className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
            >
              Tampilkan semua metode
            </button>
          )}
        </section>

        {/* TRANSACTION HISTORY */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Riwayat Pembayaran
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {filteredPayments.length} transaksi ditampilkan
                </p>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">
                <FiFilter size={12} />
                {methodFilter === "ALL" ? "Semua" : methodFilter}
              </div>
            </div>

            {/* SEARCH */}
            <div className="relative mt-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nominal atau ID transaksi..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* PAYMENT LIST */}
          {filteredPayments.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <FiInbox className="mx-auto h-9 w-9 text-slate-300" />

              <p className="mt-3 text-sm font-bold text-slate-700">
                {payments.length === 0
                  ? "Belum ada pembayaran"
                  : "Transaksi tidak ditemukan"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {payments.length === 0
                  ? "Pembayaran penumpang akan muncul di sini."
                  : "Coba ubah kata kunci atau filter."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPayments.map((payment) => {
                const amount = Number(payment.amount) || 0;
                const isQris = payment.paymentMethod === "QRIS";

                const passengers = Math.round(amount / TICKET_PRICE);

                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isQris
                            ? "bg-blue-50 text-blue-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {isQris ? (
                          <FiCreditCard size={18} />
                        ) : (
                          <FiDollarSign size={18} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">
                          {isQris ? "Pembayaran QRIS" : "Pembayaran Tunai"}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {formatDateTime(payment.paidAt)}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {passengers} penumpang
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-extrabold text-slate-900">
                        {formatRupiah(amount)}
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[9px] font-bold ${
                          isQris
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {payment.paymentMethod}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TOTAL */}
          {filteredPayments.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3.5">
              <div>
                <p className="text-xs font-bold text-slate-600">
                  Total ditampilkan
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {filteredPayments.length} transaksi
                </p>
              </div>

              <p className="text-base font-extrabold text-slate-900">
                {formatRupiah(
                  filteredPayments.reduce(
                    (total, p) => total + (Number(p.amount) || 0),
                    0,
                  ),
                )}
              </p>
            </div>
          )}
        </section>

        {/* FOOTER INFO */}
        <p className="text-center text-[11px] text-slate-400">
          Data diperbarui terakhir:{" "}
          {dataUpdatedAt ? formatDateTime(dataUpdatedAt) : "-"}
        </p>
      </main>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-slate-400">{label}</p>
        <p className="truncate text-xs font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-14 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatDate(input: string) {
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) return input;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(input: string | number) {
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) return String(input);

  return (
    date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " • " +
    date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}
