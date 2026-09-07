import { useMemo } from "react";

interface Payment {
  id: number;
  user_id: number;
  payment_code: string;
  payment_type: string;
  amount: number;
  status: string;
  user?: { name: string } | null;
}

interface PaymentMonitorProps {
  payments: Payment[];
  summary: Record<string, number> | null;
  loading: boolean;
  error: string | null;
  connected: boolean;
  joined: boolean;
}

export function PaymentMonitor({
  payments,
  summary,
  loading,
  error,
  connected,
  joined,
}: PaymentMonitorProps) {
  // 1. Filter khusus PAID & Urutkan Terbaru di Atas (ID terbesar di atas)
  const paidPayments = useMemo(() => {
    return payments
      .filter((payment) => payment.status === "PAID")
      .sort((a, b) => b.id - a.id);
  }, [payments]);

  // Total Nominal
  const totalPaid = useMemo(() => {
    return paidPayments.reduce((total, payment) => total + payment.amount, 0);
  }, [paidPayments]);

  const isRealtimeActive = connected && joined;

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              Pembayaran Penumpang
            </h3>
            {/* Status Realtime Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                isRealtimeActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-amber-50 text-amber-700 border border-amber-200/60"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isRealtimeActive
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-amber-500"
                }`}
              />
              {isRealtimeActive ? "Realtime" : "Menghubungkan..."}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Daftar transaksi penumpang yang telah terverifikasi Lunas
          </p>
        </div>

        {/* TOTAL PAID CARD */}
        <div className="rounded-xl bg-emerald-50/80 px-3.5 py-2 text-right border border-emerald-100">
          <p className="text-[11px] font-semibold text-emerald-600 tracking-wide uppercase">
            Total Lunas
          </p>
          <p className="text-base font-extrabold text-emerald-700">
            Rp {totalPaid.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* SUMMARY STATS */}
      {summary && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="flex items-center justify-between rounded-xl bg-blue-50/60 border border-blue-100 p-2.5">
            <span className="text-xs font-semibold text-blue-700">
              Transaksi Berhasil
            </span>
            <span className="text-xs font-extrabold text-blue-900 bg-white px-2 py-0.5 rounded-lg border border-blue-200/60 shadow-2xs">
              {summary.totalPaidTransactions ?? 0} Transaksi
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-emerald-50/60 border border-emerald-100 p-2.5">
            <span className="text-xs font-semibold text-emerald-700">
              Total Uang
            </span>
            <span className="text-xs font-extrabold text-emerald-900 bg-white px-2 py-0.5 rounded-lg border border-emerald-200/60 shadow-2xs">
              Rp {(summary.totalPaid ?? 0).toLocaleString("id-ID")}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-purple-50/60 border border-purple-100 p-2.5">
            <span className="text-xs font-semibold text-purple-700">
              Metode Bayar
            </span>
            <div className="flex gap-1.5 text-[11px] font-bold">
              <span className="text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded-md">
                Cash: {summary.totalCash ?? 0}
              </span>
              <span className="text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded-md">
                Online: {summary.totalOnline ?? 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STATE MESSAGES */}
      {loading && (
        <div className="py-8 text-center text-xs font-medium text-slate-400">
          Memuat data pembayaran...
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-xl bg-red-50 p-3 text-center text-xs font-medium text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {!loading && paidPayments.length === 0 && !error && (
        <div className="py-8 text-center text-xs font-medium text-slate-400">
          Belum ada pembayaran berstatus{" "}
          <span className="font-semibold text-emerald-600">PAID</span>.
        </div>
      )}

      {/* TRANSACTIONS LIST (Langsung scrollable, transaksi terbaru paling atas) */}
      {!loading && paidPayments.length > 0 && (
        <div className="mt-4 max-h-72 space-y-2.5 overflow-y-auto pr-1">
          {paidPayments.map((payment) => (
            <div
              key={payment.id}
              className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 hover:border-slate-200 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100/70 text-emerald-700 font-bold text-xs uppercase">
                  {payment.user?.name ? payment.user.name.charAt(0) : "U"}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {payment.user?.name || `User #${payment.user_id}`}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">
                    {payment.payment_type} •{" "}
                    <span className="font-mono text-slate-500">
                      {payment.payment_code}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-slate-900">
                  +Rp {payment.amount.toLocaleString("id-ID")}
                </p>
                <span className="inline-block mt-0.5 rounded-md bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  LUNAS
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}