"use client";

import { useState, useEffect } from "react";
import {
  FiX,
  FiCheck,
  FiAlertCircle,
  FiTerminal,
  FiUsers,
  FiMinus,
  FiPlus,
  FiArrowRight,
  FiArrowLeft,
  FiMapPin,
} from "react-icons/fi";
import { BsCashStack, BsQrCodeScan } from "react-icons/bs";
import {
  CreatePaymentType,
  PaymentCreateResponse,
  PaymentStatus,
} from "@/types/payments/payment.type";
import { UpcomingVehicle } from "@/types/route-search.type";
import { DummyQrCode } from "./DummyQrCode";
import { SuccessOverlay } from "./SuccessOverlay";
import { StepIndicator } from "./StepIndicator";
import { formatRupiah } from "./util";

const FARE_PER_PASSENGER = 5000;

interface BookingPaymentModalProps {
  vehicle: UpcomingVehicle;
  amount: string;
  paymentType: CreatePaymentType;
  result: PaymentCreateResponse | null;
  error: string | null;
  isSubmitting: boolean;
  isMarkingSucceeded: boolean;
  isDevelopment: boolean;
  onMarkAsSucceeded: () => Promise<boolean>;
  onAmountChange: (value: string) => void;
  onPaymentTypeChange: (value: CreatePaymentType) => void;
  onSubmit: () => Promise<boolean>;
  onClose: () => void;
}

// Brand palette, kept local so nothing outside this file needs to change
const BRAND_BLUE = "#1877F2";
const BRAND_BLUE_DARK = "#0E63D6";

export function BookingPaymentModal({
  vehicle,
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
  const [step, setStep] = useState<1 | 2>(1);
  const [passengers, setPassengers] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalAmount = passengers * FARE_PER_PASSENGER;
  const isSucceeded =
    result?.data.status === PaymentStatus.PAID ||
    result?.data.status === PaymentStatus.SUCCEEDED;

  // Sync amount to parent on passenger change
  useEffect(() => {
    onAmountChange(String(totalAmount));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmount]);

  const changePassengers = (delta: number) => {
    setPassengers((prev) => Math.min(10, Math.max(1, prev + delta)));
  };

  const handleSubmit = async () => {
    const succeeded = await onSubmit();
    if (!succeeded) return;

    if (paymentType === "CASH") {
      setShowSuccess(true);
    } else {
      setStep(2);
    }
  };

  const handleMarkAsSucceeded = async () => {
    const succeeded = await onMarkAsSucceeded();
    if (succeeded) setShowSuccess(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
      style={{ background: "rgba(15,23,42,0.55)" }}
    >
      <style>{`
        @keyframes bpmSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bpm-modal { animation: bpmSlideUp 0.28s ease-out; }
      `}</style>

      <div
        className={`bpm-modal relative w-full sm:max-w-sm overflow-hidden bg-white sm:rounded-2xl rounded-t-2xl shadow-xl ${
          showSuccess ? "min-h-105" : ""
        }`}
        style={{ maxHeight: "95vh", overflowY: "auto" }}
      >
        {/* Success overlay */}
        {showSuccess && (
          <SuccessOverlay
            onDone={() => {
              setShowSuccess(false);
              onClose();
            }}
          />
        )}

        {!showSuccess && (
          <>
            {/* ── HEADER ──────────────────────────────────────────────────────── */}
            <div className="sticky top-0 z-10 bg-white">
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
                <div className="h-1 w-9 rounded-full bg-slate-200" />
              </div>

              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: BRAND_BLUE }}
                  >
                    <FiMapPin className="text-base" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900 leading-tight">
                      Booking Angkot
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Kendaraan #{vehicle.assignmentId}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="px-4 pb-3">
                <StepIndicator step={step} totalSteps={paymentType === "CASH" ? 1 : 2} />
              </div>
              <div className="h-px bg-slate-100" />
            </div>

            {/* ── BODY ────────────────────────────────────────────────────────── */}
            <div className="px-4 py-4">

              {/* ══ STEP 1 ════════════════════════════════════════════════════ */}
              {step === 1 && (
                <div className="space-y-4">

                  {/* Payment Method */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                      Metode pembayaran
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* CASH */}
                      <button
                        type="button"
                        onClick={() => onPaymentTypeChange("CASH")}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl py-3.5 border transition-colors cursor-pointer ${
                          paymentType === "CASH"
                            ? "border-transparent text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                        style={
                          paymentType === "CASH"
                            ? { backgroundColor: BRAND_BLUE }
                            : undefined
                        }
                      >
                        <BsCashStack className="text-xl" />
                        <span className="text-xs font-bold">Tunai</span>
                        <span
                          className={`text-[10px] ${
                            paymentType === "CASH" ? "text-white/80" : "text-slate-400"
                          }`}
                        >
                          Bayar ke driver
                        </span>
                      </button>

                      {/* QRIS / ONLINE */}
                      <button
                        type="button"
                        onClick={() => onPaymentTypeChange("ONLINE")}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl py-3.5 border transition-colors cursor-pointer ${
                          paymentType === "ONLINE"
                            ? "border-transparent text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                        style={
                          paymentType === "ONLINE"
                            ? { backgroundColor: BRAND_BLUE }
                            : undefined
                        }
                      >
                        <BsQrCodeScan className="text-xl" />
                        <span className="text-xs font-bold">QRIS</span>
                        <span
                          className={`text-[10px] ${
                            paymentType === "ONLINE" ? "text-white/80" : "text-slate-400"
                          }`}
                        >
                          Bayar online
                        </span>
                      </button>
                    </div>

                    {paymentType === "CASH" && (
                      <div
                        className="mt-2.5 flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold"
                        style={{ backgroundColor: "#FFF4E5", color: "#B45309" }}
                      >
                        <FiAlertCircle className="shrink-0 text-sm" />
                        <span>Untuk cash harap langsung bayar ke driver</span>
                      </div>
                    )}
                  </div>

                  {/* Passenger Count */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                      Jumlah penumpang
                    </p>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 py-2.5 px-3.5">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FiUsers className="text-sm text-slate-400" />
                        <span className="text-sm font-medium">Penumpang</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => changePassengers(-1)}
                          disabled={passengers <= 1}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                        >
                          <FiMinus className="text-xs" />
                        </button>
                        <span className="w-5 text-center text-base font-bold text-slate-900 tabular-nums">
                          {passengers}
                        </span>
                        <button
                          type="button"
                          onClick={() => changePassengers(1)}
                          disabled={passengers >= 10}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                          style={{ backgroundColor: BRAND_BLUE }}
                        >
                          <FiPlus className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="rounded-xl bg-slate-50 px-3.5 py-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Harga per penumpang</span>
                      <span className="font-semibold text-slate-700">
                        {formatRupiah(FARE_PER_PASSENGER)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Jumlah penumpang</span>
                      <span className="font-semibold text-slate-700">× {passengers}</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">Total bayar</span>
                      <span className="text-base font-extrabold" style={{ color: BRAND_BLUE_DARK }}>
                        {formatRupiah(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                      <FiAlertCircle className="shrink-0 text-base" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    style={{ backgroundColor: isSubmitting ? "#94a3b8" : BRAND_BLUE }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {paymentType === "CASH" ? "Konfirmasi booking" : "Lanjut ke pembayaran"}
                        </span>
                        <FiArrowRight />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* ══ STEP 2 ════════════════════════════════════════════════════ */}
              {step === 2 && result && (
                <div className="space-y-4">

                  {/* Status banner */}
                  <div
                    className={`rounded-xl p-3.5 flex items-start gap-3 ${
                      isSucceeded ? "bg-blue-50" : "bg-amber-50"
                    }`}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: isSucceeded ? BRAND_BLUE : "#f59e0b" }}
                    >
                      {isSucceeded ? (
                        <FiCheck className="text-lg" />
                      ) : (
                        <BsQrCodeScan className="text-base" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {isSucceeded ? "Pembayaran berhasil" : "Menunggu pembayaran"}
                      </h3>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                        {isSucceeded
                          ? "Booking kamu sudah terkonfirmasi oleh sistem."
                          : "Scan QR di bawah untuk menyelesaikan pembayaran."}
                      </p>
                    </div>
                  </div>

                  {/* Payment code */}
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
                    <span className="text-xs text-slate-500">Kode booking</span>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {result.data.payment_code}
                    </span>
                  </div>

                  {/* QR Code (shown for ONLINE while pending) */}
                  {!isSucceeded && (
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-xl p-3 bg-slate-50">
                        <DummyQrCode />
                      </div>
                      <p className="text-[11px] text-slate-400 text-center max-w-[220px] leading-relaxed">
                        Gunakan GoPay, OVO, Dana, atau aplikasi bank untuk scan QR ini
                      </p>
                    </div>
                  )}

                  {/* Simulasi Bayar: tampil untuk ONLINE mode atau mode dev */}
                  {(paymentType === "ONLINE" || isDevelopment) && result.data.status === PaymentStatus.PENDING && (
                    <div className="rounded-xl border border-dashed border-slate-300 p-3.5 space-y-2.5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <FiTerminal className="shrink-0 text-sm" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">
                          Mode testing
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleMarkAsSucceeded}
                        disabled={isMarkingSucceeded}
                        className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        style={{ backgroundColor: BRAND_BLUE_DARK }}
                      >
                        {isMarkingSucceeded ? (
                          <>
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                            <span>Memproses...</span>
                          </>
                        ) : (
                          <>
                            <FiCheck className="text-sm" />
                            <span>Tandai sudah bayar</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Back & Close */}
                  <div className="flex gap-2.5 pt-1">
                    {!isSucceeded && (
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-95 cursor-pointer"
                      >
                        <FiArrowLeft className="text-sm" />
                        Kembali
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-xl py-3 text-xs font-bold text-white transition-transform active:scale-95 cursor-pointer"
                      style={{ backgroundColor: isSucceeded ? BRAND_BLUE : "#1e293b" }}
                    >
                      {isSucceeded ? "Selesai" : "Tutup"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}