import { useMemo } from "react";
import { FaCheckCircle, FaWallet, FaUserCheck } from "react-icons/fa";

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

// Metode yang wajib selalu tampil, walau belum ada transaksinya (default 0)
const KNOWN_PAYMENT_TYPES = ["CASH", "ONLINE"];

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

  // Total Nominal dari pembayaran PAID lokal jika summary tidak tersedia
  const totalPaidCalculated = useMemo(() => {
    return paidPayments.reduce((total, payment) => total + payment.amount, 0);
  }, [paidPayments]);

  // Statistik jumlah ORANG (unik) per metode pembayaran
  const paymentMethodStats = useMemo(() => {
    const map = new Map<string, Set<number>>();

    KNOWN_PAYMENT_TYPES.forEach((type) => map.set(type, new Set()));

    paidPayments.forEach((payment) => {
      const type = payment.payment_type || "Lainnya";
      if (!map.has(type)) map.set(type, new Set());
      map.get(type)!.add(payment.user_id);
    });

    const knownStats = KNOWN_PAYMENT_TYPES.map((type) => ({
      type,
      count: map.get(type)?.size ?? 0,
    }));

    const otherStats = Array.from(map.entries())
      .filter(([type]) => !KNOWN_PAYMENT_TYPES.includes(type))
      .map(([type, userSet]) => ({ type, count: userSet.size }))
      .sort((a, b) => b.count - a.count);

    return [...knownStats, ...otherStats];
  }, [paidPayments]);

  const isRealtimeActive = connected && joined;

  // Selalu hitung dari payments array lokal agar realtime via websocket
  // (summary dari server hanya snapshot awal, tidak update saat ada payment baru)
  const totalAmount = totalPaidCalculated;
  const successfulTxCount = paidPayments.length;

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-3.5 sm:p-5 shadow-sm transition-all">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Pembayaran Penumpang
            </h3>
            {/* Status Realtime Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium transition-colors ${
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
          <p className="text-[11px] sm:text-xs text-slate-500">
            Daftar transaksi penumpang yang telah terverifikasi Lunas
          </p>
        </div>

        {/* METODE BAYAR QUICK BADGES */}
        {/* <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {paymentMethodStats.map((stat) => (
            <span
              key={stat.type}
              className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/50"
            >
              <FaUserCheck className="text-slate-400 text-[10px]" />
              {stat.type}: <span className="font-extrabold text-slate-800">{stat.count}</span> orang
            </span>
          ))}
        </div> */}
      </div>

      {/* SUMMARY STATS (Simpel, Modern & Ringkas) */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Total Pendapatan */}
        <div className="flex items-center gap-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3.5 text-white shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
            <FaWallet className="text-lg text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-emerald-100 uppercase tracking-wide">
              Total Pendapatan
            </p>
            <p className="text-lg sm:text-xl font-black tracking-tight break-words">
              Rp {totalAmount.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Transaksi Berhasil */}
        <div className="flex items-center gap-3.5 rounded-2xl bg-slate-900 p-3.5 text-white shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
            <FaCheckCircle className="text-lg text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Transaksi Berhasil
            </p>
            <p className="text-lg sm:text-xl font-black tracking-tight">
              {successfulTxCount} <span className="text-xs font-normal text-slate-400">Transaksi</span>
            </p>
          </div>
        </div>
      </div>

      {/* STATE MESSAGES */}
      {loading && (
        <div className="py-6 sm:py-8 text-center text-xs font-medium text-slate-400">
          Memuat data pembayaran...
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-xl bg-red-50 p-3 text-center text-xs font-medium text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {!loading && paidPayments.length === 0 && !error && (
        <div className="py-6 sm:py-8 text-center text-xs font-medium text-slate-400">
          Belum ada pembayaran berstatus{" "}
          <span className="font-semibold text-emerald-600">PAID</span>.
        </div>
      )}

      {/* TRANSACTIONS LIST */}
      {!loading && paidPayments.length > 0 && (
        <div className="mt-3.5 sm:mt-4 max-h-64 sm:max-h-72 space-y-2 sm:space-y-2.5 overflow-y-auto pr-1">
          {paidPayments.map((payment) => (
            <div
              key={payment.id}
              className="group flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 sm:p-3 hover:bg-slate-50 hover:border-slate-200 transition-all"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100/70 text-emerald-700 font-bold text-xs uppercase">
                  {payment.user?.name ? payment.user.name.charAt(0) : "U"}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {payment.user?.name || `User #${payment.user_id}`}
                  </p>
                  <p className="truncate text-[10px] sm:text-[11px] font-medium text-slate-400">
                    {payment.payment_type} •{" "}
                    <span className="font-mono text-slate-500">
                      {payment.payment_code}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[11px] sm:text-xs font-bold text-slate-900 whitespace-nowrap">
                  +Rp {payment.amount.toLocaleString("id-ID")}
                </p>
                {/* <span className="inline-block mt-0.5 rounded-md bg-emerald-100/80 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-700">
                  LUNAS
                </span> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}