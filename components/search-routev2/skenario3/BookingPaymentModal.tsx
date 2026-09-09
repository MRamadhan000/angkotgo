"use client";

import { useState, useEffect } from "react";
import {
  FiX,
  FiCheckCircle,
  FiCreditCard,
  FiAlertCircle,
  FiTerminal,
  FiUsers,
  FiMinus,
  FiPlus,
  FiArrowRight,
  FiArrowLeft,
  FiShoppingBag,
  FiWifi,
} from "react-icons/fi";
import { BsCashStack } from "react-icons/bs";
import { MdOutlineQrCode2 } from "react-icons/md";
import {
  CreatePaymentType,
  PaymentCreateResponse,
  PaymentStatus,
} from "@/types/payments/payment.type";
import { UpcomingVehicle } from "@/types/route-search.type";

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
  onMarkAsSucceeded: () => Promise<void>;
  onAmountChange: (value: string) => void;
  onPaymentTypeChange: (value: CreatePaymentType) => void;
  onSubmit: () => void;
  onClose: () => void;
}

// ─── Dummy QR Code SVG ────────────────────────────────────────────────────────
function DummyQrCode() {
  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-xl"
    >
      <rect width="180" height="180" fill="white" />
      {/* Top-left finder */}
      <rect x="10" y="10" width="50" height="50" fill="#1e293b" rx="4" />
      <rect x="18" y="18" width="34" height="34" fill="white" rx="2" />
      <rect x="24" y="24" width="22" height="22" fill="#1e293b" rx="2" />
      {/* Top-right finder */}
      <rect x="120" y="10" width="50" height="50" fill="#1e293b" rx="4" />
      <rect x="128" y="18" width="34" height="34" fill="white" rx="2" />
      <rect x="134" y="24" width="22" height="22" fill="#1e293b" rx="2" />
      {/* Bottom-left finder */}
      <rect x="10" y="120" width="50" height="50" fill="#1e293b" rx="4" />
      <rect x="18" y="128" width="34" height="34" fill="white" rx="2" />
      <rect x="24" y="134" width="22" height="22" fill="#1e293b" rx="2" />
      {/* Data modules */}
      <rect x="70" y="10" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="82" y="10" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="94" y="10" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="106" y="10" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="70" y="22" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="94" y="22" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="70" y="34" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="82" y="34" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="106" y="34" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="70" y="46" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="94" y="46" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="10" y="70" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="22" y="70" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="34" y="70" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="46" y="70" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="58" y="70" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="70" y="70" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="82" y="70" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="106" y="70" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="118" y="70" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="142" y="70" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="154" y="70" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="166" y="70" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="10" y="82" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="34" y="82" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="58" y="82" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="82" y="82" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="118" y="82" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="142" y="82" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="10" y="94" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="22" y="94" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="46" y="94" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="70" y="94" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="94" y="94" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="118" y="94" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="130" y="94" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="154" y="94" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="10" y="106" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="34" y="106" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="58" y="106" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="82" y="106" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="106" y="106" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="130" y="106" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="166" y="106" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="70" y="120" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="82" y="120" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="94" y="120" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="118" y="120" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="142" y="120" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="166" y="120" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="70" y="132" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="94" y="132" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="106" y="132" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="130" y="132" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="154" y="132" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="70" y="144" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="82" y="144" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="106" y="144" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="118" y="144" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="142" y="144" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="166" y="144" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="70" y="156" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="94" y="156" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="118" y="156" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="130" y="156" width="8" height="8" fill="#1e293b" rx="1" />
      <rect x="154" y="156" width="8" height="8" fill="#1e293b" rx="1" />
      {/* Center logo */}
      <rect x="78" y="78" width="24" height="24" fill="white" rx="4" />
      <rect x="80" y="80" width="20" height="20" fill="#3b82f6" rx="3" />
      <text x="90" y="94" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">A</text>
    </svg>
  );
}

// ─── Success Animation Overlay ────────────────────────────────────────────────
function SuccessOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.97)",
        borderRadius: "1.5rem",
      }}
    >
      <style>{`
        @keyframes bpmPop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bpmRipple {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes bpmSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bpmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .bpm-overlay { animation: bpmFadeIn 0.3s ease; }
        .bpm-icon    { animation: bpmPop 0.5s 0.1s cubic-bezier(.4,0,.2,1) both; }
        .bpm-ripple-1 { animation: bpmRipple 1.4s 0s ease-out infinite; }
        .bpm-ripple-2 { animation: bpmRipple 1.4s 0.2s ease-out infinite; }
        .bpm-ripple-3 { animation: bpmRipple 1.4s 0.4s ease-out infinite; }
        .bpm-title   { animation: bpmSlideUp 0.4s 0.3s both; }
        .bpm-sub     { animation: bpmSlideUp 0.4s 0.45s both; }
      `}</style>

      <div className="bpm-overlay flex flex-col items-center">
        <div style={{ position: "relative", marginBottom: "1.25rem" }}>
          {["bpm-ripple-1", "bpm-ripple-2", "bpm-ripple-3"].map((cls) => (
            <span
              key={cls}
              className={cls}
              style={{
                position: "absolute",
                inset: "-12px",
                borderRadius: "50%",
                border: "2px solid #22c55e",
                display: "block",
              }}
            />
          ))}
          <div
            className="bpm-icon"
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px 0 rgba(34,197,94,0.35)",
            }}
          >
            <FiCheckCircle size={36} color="white" />
          </div>
        </div>
        <p className="bpm-title" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#15803d", letterSpacing: "-0.02em" }}>
          Pembayaran Berhasil!
        </p>
        <p className="bpm-sub" style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.35rem" }}>
          Booking kamu sudah terkonfirmasi ✓
        </p>
      </div>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold transition-all duration-300 ${
              step === s
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-110"
                : step > s
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {step > s ? <FiCheckCircle className="text-sm" /> : s}
          </div>
          <span
            className={`text-[11px] font-bold transition-colors ${
              step === s ? "text-blue-600" : step > s ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {s === 1 ? "Detail" : "Bayar"}
          </span>
          {s < 2 && (
            <div
              className={`h-0.5 w-8 rounded-full transition-all duration-500 ${
                step > 1 ? "bg-emerald-500" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Format Rupiah ────────────────────────────────────────────────────────────
function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
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
  const isSucceeded = result?.data.status === PaymentStatus.SUCCEEDED;

  // Sync amount to parent on passenger change
  useEffect(() => {
    onAmountChange(String(totalAmount));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmount]);

  // Move to step 2 when result arrives
  useEffect(() => {
    if (result) setStep(2);
  }, [result]);

  // Trigger success overlay
  useEffect(() => {
    if (isSucceeded) setShowSuccess(true);
  }, [isSucceeded]);

  const changePassengers = (delta: number) => {
    setPassengers((prev) => Math.min(10, Math.max(1, prev + delta)));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}
    >
      <style>{`
        @keyframes bpmSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bpm-modal { animation: bpmSlideUp 0.32s cubic-bezier(.4,0,.2,1); }
      `}</style>

      <div
        className="bpm-modal relative w-full sm:max-w-md overflow-hidden bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl"
        style={{ maxHeight: "95vh", overflowY: "auto" }}
      >
        {/* Success overlay */}
        {showSuccess && (
          <SuccessOverlay onDone={() => setShowSuccess(false)} />
        )}

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100">
          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-slate-200" />
          </div>

          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-2xl text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
              >
                <FiShoppingBag className="text-base" />
              </div>
              <div>
                <h2 className="text-[15px] font-extrabold text-slate-900 tracking-tight leading-tight">
                  Book Angkot
                </h2>
                <p className="text-[11px] font-semibold text-slate-400">
                  Kendaraan #{vehicle.assignmentId}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="px-5 pb-3.5">
            <StepIndicator step={step} />
          </div>
        </div>

        {/* ── BODY ────────────────────────────────────────────────────────── */}
        <div className="px-5 py-5">

          {/* ══ STEP 1 ════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-5">

              {/* Payment Method */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Metode Pembayaran
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {/* CASH */}
                  <button
                    type="button"
                    onClick={() => onPaymentTypeChange("CASH")}
                    className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl p-4 border-2 transition-all duration-200 cursor-pointer ${
                      paymentType === "CASH"
                        ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {paymentType === "CASH" && (
                      <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600">
                        <FiCheckCircle className="text-[9px] text-white" />
                      </span>
                    )}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        paymentType === "CASH"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <BsCashStack className="text-xl" />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-extrabold ${paymentType === "CASH" ? "text-blue-700" : "text-slate-700"}`}>
                        Cash
                      </p>
                      <p className={`text-[10px] font-medium mt-0.5 ${paymentType === "CASH" ? "text-blue-500" : "text-slate-400"}`}>
                        Bayar ke driver
                      </p>
                    </div>
                  </button>

                  {/* QRIS / ONLINE */}
                  <button
                    type="button"
                    onClick={() => onPaymentTypeChange("ONLINE")}
                    className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl p-4 border-2 transition-all duration-200 cursor-pointer ${
                      paymentType === "ONLINE"
                        ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {paymentType === "ONLINE" && (
                      <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600">
                        <FiCheckCircle className="text-[9px] text-white" />
                      </span>
                    )}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        paymentType === "ONLINE"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <MdOutlineQrCode2 className="text-xl" />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-extrabold ${paymentType === "ONLINE" ? "text-blue-700" : "text-slate-700"}`}>
                        QRIS
                      </p>
                      <p className={`text-[10px] font-medium mt-0.5 ${paymentType === "ONLINE" ? "text-blue-500" : "text-slate-400"}`}>
                        Bayar online
                      </p>
                    </div>
                  </button>
                </div>

                {/* Info note */}
                <div
                  className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-[11px] font-medium transition-all ${
                    paymentType === "CASH"
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  {paymentType === "CASH" ? (
                    <BsCashStack className="mt-0.5 shrink-0 text-amber-600" />
                  ) : (
                    <FiWifi className="mt-0.5 shrink-0 text-blue-600" />
                  )}
                  <span>
                    {paymentType === "CASH"
                      ? "Bayar langsung kepada driver atau kondektur saat naik angkot."
                      : "Scan QR Code menggunakan aplikasi dompet digital (GoPay, OVO, Dana, dll)."}
                  </span>
                </div>
              </div>

              {/* Passenger Count */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Jumlah Penumpang
                </p>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-3 px-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FiUsers className="text-base text-slate-400" />
                    <span className="text-sm font-semibold">Penumpang</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => changePassengers(-1)}
                      disabled={passengers <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:border-blue-400 hover:text-blue-600 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                      <FiMinus className="text-sm" />
                    </button>
                    <span className="w-6 text-center text-lg font-extrabold text-slate-900 tabular-nums">
                      {passengers}
                    </span>
                    <button
                      type="button"
                      onClick={() => changePassengers(1)}
                      disabled={passengers >= 10}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-400/30 transition-all hover:bg-blue-700 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                      <FiPlus className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Rincian Harga
                  </p>
                </div>
                <div className="px-4 py-3 space-y-2.5 bg-white">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Harga per penumpang</span>
                    <span className="font-bold text-slate-700">{formatRupiah(FARE_PER_PASSENGER)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Jumlah penumpang</span>
                    <span className="font-bold text-slate-700">× {passengers}</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-900">Total</span>
                    <span
                      className="text-lg font-black tabular-nums"
                      style={{
                        background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {formatRupiah(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
                  <FiAlertCircle className="shrink-0 text-base" />
                  <span>{error}</span>
                </div>
              )}

              {/* CTA Button */}
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-extrabold text-white shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                style={{
                  background: isSubmitting
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #3b82f6, #6366f1)",
                  boxShadow: isSubmitting ? "none" : "0 8px 24px rgba(99,102,241,0.35)",
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {paymentType === "CASH" ? "Konfirmasi Booking" : "Lanjut ke Pembayaran"}
                    </span>
                    <FiArrowRight />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ══ STEP 2 ════════════════════════════════════════════════════════ */}
          {step === 2 && result && (
            <div className="space-y-4">

              {/* Status banner */}
              <div
                className={`rounded-2xl border p-4 flex items-start gap-3 ${
                  isSucceeded
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-amber-200 bg-amber-50 text-amber-900"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    isSucceeded ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {isSucceeded ? (
                    <FiCheckCircle className="text-xl" />
                  ) : (
                    <FiCreditCard className="text-xl" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status Pembayaran
                  </p>
                  <h3 className="text-base font-extrabold tracking-tight mt-0.5">
                    {isSucceeded ? "Pembayaran Berhasil" : "Menunggu Pembayaran"}
                  </h3>
                  <p className="mt-0.5 text-[11px] leading-relaxed opacity-80">
                    {isSucceeded
                      ? "Booking kamu sudah terkonfirmasi oleh sistem."
                      : "Scan QR di bawah untuk menyelesaikan pembayaran."}
                  </p>
                </div>
              </div>

              {/* Payment code */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="text-xs font-semibold text-slate-500">Kode Booking</span>
                <span className="font-mono text-xs font-black text-slate-900 bg-white border border-slate-200 rounded-lg px-2 py-1">
                  {result.data.payment_code}
                </span>
              </div>

              {/* QR Code (shown for ONLINE while pending) */}
              {!isSucceeded && (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Scan QR Code
                  </p>
                  <div
                    className="rounded-2xl p-4 border-2 border-blue-100"
                    style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)" }}
                  >
                    <DummyQrCode />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center max-w-[220px] leading-relaxed">
                    Gunakan GoPay, OVO, Dana, atau aplikasi bank untuk scan QR ini
                  </p>
                </div>
              )}

              {/* ── Simulasi Bayar: tampil untuk ONLINE mode atau mode dev ─── */}
              {(paymentType === "ONLINE" || isDevelopment) && result.data.status === PaymentStatus.PENDING && (
                <div className="rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/60 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <FiTerminal className="text-indigo-500 shrink-0" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700">
                      Mode Testing
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                    Simulasikan pembayaran berhasil secara manual (testing only):
                  </p>
                  <button
                    type="button"
                    onClick={onMarkAsSucceeded}
                    disabled={isMarkingSucceeded}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                      boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                    }}
                  >
                    {isMarkingSucceeded ? (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="text-sm" />
                        <span>Tandai Sudah Bayar</span>
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
                    className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
                  >
                    <FiArrowLeft className="text-sm" />
                    Kembali
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 rounded-2xl py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition-all active:scale-95 cursor-pointer ${
                    isSucceeded
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                      : "bg-slate-800 hover:bg-slate-900"
                  }`}
                >
                  {isSucceeded ? "Selesai 🎉" : "Tutup"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}