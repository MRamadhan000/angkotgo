"use client";

import { useState } from "react";
import {
  FiX,
  FiClock,
  FiCheckCircle,
  FiDollarSign,
  FiCreditCard,
  FiAlertCircle,
  FiCopy,
  FiCheck,
  FiTerminal,
  FiTag,
  FiActivity,
} from "react-icons/fi";
import {
  CreatePaymentType,
  PaymentCreateResponse,
  PaymentStatus,
} from "@/types/payments/payment.type";
import { UpcomingVehicle } from "@/types/route-search.type";

interface BookingPaymentModalProps {
  vehicle: UpcomingVehicle;
  amount: string;
  paymentType: CreatePaymentType;
  result: PaymentCreateResponse | null;
  error: string | null;
  isSubmitting: boolean;
  isMarkingSucceeded: boolean;
  isDevelopment: boolean;
  onMarkAsSucceeded: () => Promise<void>;
  onAmountChange: (value: string) => void;
  onPaymentTypeChange: (value: CreatePaymentType) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function BookingPaymentModal({
  vehicle,
  amount,
  paymentType,
  result,
  error,
  isSubmitting,
  isMarkingSucceeded,
  isDevelopment,
  onMarkAsSucceeded,
  onAmountChange,
  onPaymentTypeChange,
  onSubmit,
  onClose,
}: BookingPaymentModalProps) {
  const [copiedQr, setCopiedQr] = useState(false);

  const handleCopyQr = (qrString: string) => {
    navigator.clipboard.writeText(qrString);
    setCopiedQr(true);
    setTimeout(() => setCopiedQr(false), 2000);
  };

  const isSucceeded = result?.data.status === PaymentStatus.SUCCEEDED;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 transition-all">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <FiActivity className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Konfirmasi Booking
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                Kendaraan ID #{vehicle.assignmentId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6">
          {!result ? (
            /* STATE 1: FORM BOOKING */
            <div className="space-y-5">
              {/* INPUT NOMINAL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nominal Pembayaran
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-base font-extrabold text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* TIPE PEMBAYARAN */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onPaymentTypeChange("CASH")}
                    className={`flex items-center justify-center gap-2 rounded-2xl p-3 text-xs font-bold transition-all border cursor-pointer ${
                      paymentType === "CASH"
                        ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <FiDollarSign className="text-base" />
                    <span>CASH</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPaymentTypeChange("ONLINE")}
                    className={`flex items-center justify-center gap-2 rounded-2xl p-3 text-xs font-bold transition-all border cursor-pointer ${
                      paymentType === "ONLINE"
                        ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <FiCreditCard className="text-base" />
                    <span>ONLINE</span>
                  </button>
                </div>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100">
                  <FiAlertCircle className="text-base shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-blue-600 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? "Memproses Booking..." : "Konfirmasi Booking"}
              </button>
            </div>
          ) : (
            /* STATE 2: HASIL PEMBAYARAN */
            <div className="space-y-4">
              {/* STATUS BANNER */}
              <div
                className={`rounded-2xl border p-4 transition-all ${
                  isSucceeded
                    ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
                    : "border-amber-200 bg-amber-50/80 text-amber-900"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                      isSucceeded
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isSucceeded ? (
                      <FiCheckCircle className="text-xl" />
                    ) : (
                      <FiClock className="text-xl animate-pulse" />
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Status Transaksi
                    </span>
                    <h3 className="text-base font-extrabold tracking-tight">
                      Pembayaran {result.data.status}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {isSucceeded
                        ? "Pembayaran berhasil dikonfirmasi oleh sistem."
                        : "Booking tersimpan. Selesaikan pembayaran sesuai instruksi."}
                    </p>
                  </div>
                </div>
              </div>

              {/* KODE PEMBAYARAN */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-3 px-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <FiTag className="text-slate-400" />
                  <span>Kode Bayar</span>
                </div>
                <span className="font-mono text-xs font-black text-slate-900">
                  {result.data.payment_code}
                </span>
              </div>

              {/* QR STRING / INSTRUCTION */}
              {result.data.xendit?.qrString && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>QR String (Xendit)</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyQr(result.data.xendit?.qrString || "")
                      }
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      {copiedQr ? (
                        <>
                          <FiCheck className="text-emerald-500" />
                          <span className="text-emerald-600">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <FiCopy />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={result.data.xendit.qrString}
                    className="h-20 w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 font-mono text-[11px] text-slate-600 outline-none resize-none"
                  />
                </div>
              )}

              {/* DEV SIMULATION MODE */}
              {isDevelopment &&
                result.data.status === PaymentStatus.PENDING && (
                  <div className="rounded-2xl border border-dashed border-blue-300 bg-blue-50/60 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                      <FiTerminal className="text-blue-600" />
                      <span className="uppercase tracking-wider text-[10px]">
                        Mode Development
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-blue-900/80">
                      Simulasikan Webhook Xendit berhasil secara manual:
                    </p>

                    <button
                      type="button"
                      onClick={onMarkAsSucceeded}
                      disabled={
                        isMarkingSucceeded ||
                        !(
                          result.data.xendit?.paymentRequestId ??
                          result.data.xendit?.payment_request_id
                        )
                      }
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                      {isMarkingSucceeded
                        ? "Mengubah Status..."
                        : "Tandai Selesai (Simulasi)"}
                    </button>

                    {!(
                      result.data.xendit?.paymentRequestId ??
                      result.data.xendit?.payment_request_id
                    ) && (
                      <p className="text-center text-[10px] text-blue-600 font-medium italic">
                        ID Payment Request belum tersedia.
                      </p>
                    )}
                  </div>
                )}

              {/* CLOSE BUTTON */}
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl bg-slate-900 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition-all hover:bg-slate-800 active:scale-95 cursor-pointer mt-2"
              >
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}