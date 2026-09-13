"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiLoader,
  FiXCircle,
} from "react-icons/fi";

const PAYMENT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type PaymentRecord = {
  id: number;
  paymentCode?: string;
  user?: { name?: string; email?: string } | null;
  paymentType?: string;
  amount?: number;
  status?: string;
  paidAt?: string | null;
  createdAt?: string;
};

type FinancialResponse = {
  vehicleAssignmentId: number;
  summary: Record<string, number>;
  payments: PaymentRecord[];
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function getJakartaDate(value?: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function formatAssignmentDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

export default function AssignmentIncomeDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const assignmentId = params?.slug;
  const assignmentDate = searchParams.get("date");
  const vehicleCode = searchParams.get("vehicle");
  const [financial, setFinancial] = useState<FinancialResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assignmentId) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(
      `${PAYMENT_API_BASE_URL}/payments/financial/vehicle-assignment/${assignmentId}`,
      { headers: { Accept: "application/json" }, signal: controller.signal },
    )
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(
            payload && typeof payload === "object" && "message" in payload
              ? String(payload.message)
              : "Gagal memuat detail pemasukan.",
          );
        }
        return payload;
      })
      .then((payload) => {
        const data = payload?.data ?? payload;
        setFinancial(data as FinancialResponse);
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Gagal memuat detail pemasukan.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [assignmentId]);

  const relevantPayments = useMemo(() => {
    if (!financial) return [];
    if (!assignmentDate) return financial.payments;

    return financial.payments.filter((payment) => {
      const paymentDate = getJakartaDate(payment.paidAt || payment.createdAt);
      return paymentDate === assignmentDate;
    });
  }, [financial, assignmentDate]);

  const relevantSummary = useMemo(() => {
    const paidPayments = relevantPayments.filter((payment) =>
      ["PAID", "SUCCEEDED"].includes(
        String(payment.status || "").toUpperCase(),
      ),
    );

    return paidPayments.reduce(
      (summary, payment) => {
        const amount = Number(payment.amount || 0);
        const type = String(payment.paymentType || "").toUpperCase();
        summary.totalPaid += amount;
        if (["ONLINE", "QRIS", "TRANSFER"].includes(type)) {
          summary.totalOnline += amount;
        }
        if (type === "CASH") summary.totalCash += amount;
        return summary;
      },
      {
        totalTransactions: relevantPayments.length,
        totalPaid: 0,
        totalOnline: 0,
        totalCash: 0,
      },
    );
  }, [relevantPayments]);

  const summaryCards = useMemo(
    () =>
      [
        ["Total Transaksi", relevantSummary.totalTransactions, "count"],
        ["Total Paid", relevantSummary.totalPaid, "currency"],
        ["Total Online", relevantSummary.totalOnline, "currency"],
        ["Total Cash", relevantSummary.totalCash, "currency"],
      ] as const,
    [relevantSummary],
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
        >
          <FiArrowLeft className="h-4 w-4" />
          Kembali ke Assignments
        </button>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-2 border-b border-gray-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                Detail Pemasukan
              </p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">
                {vehicleCode || `Assignment #${assignmentId}`}
              </h1>
              <p className="mt-1 text-sm font-semibold text-emerald-700">
                Tanggal assignment: {formatAssignmentDate(assignmentDate)}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Data pembayaran dari financial assignment
            </p>
          </div>

          {loading && (
            <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-gray-500">
              <FiLoader className="h-5 w-5 animate-spin" />
              Memuat detail pembayaran...
            </div>
          )}

          {!loading && error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && financial && (
            <div className="mt-6 space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map(([label, value, type]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      {label}
                    </p>
                    <p className="mt-2 text-xl font-black text-slate-900">
                      {type === "currency" ? formatCurrency(value) : value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 font-bold text-slate-800">
                  Daftar Pembayaran
                </div>
                {relevantPayments.length === 0 ? (
                  <p className="p-6 text-center text-sm text-gray-500">
                    Belum ada pembayaran untuk assignment ini.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {relevantPayments.map((payment) => {
                      const status = String(
                        payment.status || "-",
                      ).toUpperCase();
                      const isPaid = ["PAID", "SUCCEEDED"].includes(status);
                      return (
                        <article key={payment.id} className="p-4 sm:p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                Payment Code
                              </p>
                              <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                                {payment.paymentCode || "-"}
                              </p>
                            </div>
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                              <FiDollarSign className="h-3.5 w-3.5" />
                              {String(payment.paymentType || "-").toUpperCase()}
                            </span>
                          </div>
                          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <div>
                              <p className="text-xs text-gray-400">User</p>
                              <p className="mt-1 text-sm font-semibold">
                                {payment.user?.name || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Email</p>
                              <p className="mt-1 break-all text-sm font-semibold">
                                {payment.user?.email || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Nominal</p>
                              <p className="mt-1 text-sm font-bold">
                                {formatCurrency(Number(payment.amount || 0))}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Status</p>
                              <p
                                className={`mt-1 inline-flex items-center gap-1 text-sm font-bold ${isPaid ? "text-emerald-700" : "text-amber-700"}`}
                              >
                                {isPaid ? <FiCheckCircle /> : <FiClock />}
                                {status}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">
                                Tanggal Bayar
                              </p>
                              <p className="mt-1 text-sm font-semibold">
                                {formatDate(
                                  payment.paidAt || payment.createdAt,
                                )}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
