"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  FiArrowLeft,
  FiMaximize,
  FiMinimize,
  FiLock,
  FiUnlock,
  FiX,
  FiCheck,
  FiStar,
  FiCreditCard,
  FiInfo,
  FiShield,
} from "react-icons/fi";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const PRICE_TABLE = [
  { seats: 1, amount: 5000 },
  { seats: 2, amount: 10000 },
  { seats: 3, amount: 15000 },
  { seats: 4, amount: 20000 },
  { seats: 5, amount: 25000 },
  { seats: 6, amount: 30000 },
];

const DEFAULT_PIN = "1234";
const VEHICLE_ASSIGNMENT_ID = 16;
const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export default function DriverQrisDisplayPage() {
  const router = useRouter();

  // Fullscreen, Lock & PIN State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [inputPin, setInputPin] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (isLocked) return;

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen error:", err);
    }
  };

  const handleLockToggle = () => {
    if (!isLocked) {
      setIsLocked(true);
    } else {
      setInputPin("");
      setPinError(false);
      setIsPinModalOpen(true);
    }
  };

  const handleBackNavigation = () => {
    if (isLocked) {
      setInputPin("");
      setPinError(false);
      setIsPinModalOpen(true);
    } else {
      router.back();
    }
  };

  const handleKeyPress = (num: string) => {
    if (inputPin.length < 4) {
      const newPin = inputPin + num;
      setInputPin(newPin);
      setPinError(false);

      if (newPin.length === 4) {
        if (newPin === DEFAULT_PIN) {
          setIsLocked(false);
          setIsPinModalOpen(false);
          setInputPin("");
        } else {
          setPinError(true);
          setTimeout(() => {
            setInputPin("");
            setPinError(false);
          }, 800);
        }
      }
    }
  };

  const handleDeletePin = () => {
    setInputPin((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const feedbackUrl = `http://localhost:3000/passenger/feedback?vehicleAssignmentId=${VEHICLE_ASSIGNMENT_ID}`;
  const feedbackQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
    feedbackUrl
  )}`;

  return (
    <div
      className={`${jakarta.className} flex min-h-dvh w-full select-none flex-col bg-[#eef2f7] text-[#0f2a4a] antialiased`}
    >
      {/* Header */}
      <header className="flex items-center justify-between bg-[#0f2a4a] px-4 py-3 text-white sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackNavigation}
            aria-label="Kembali"
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition active:scale-95 ${
              isLocked
                ? "bg-white/5 text-white/40"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <FiArrowLeft size={20} />
          </button>
          <div className="leading-tight">
            <h1 className="text-base font-bold sm:text-lg">AngkotGo</h1>
            <p className="text-xs font-medium text-white/70">
              AL-04 · N 1842 UB
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            disabled={isLocked}
            aria-label={isFullscreen ? "Keluar Fullscreen" : "Mode Fullscreen"}
            className="flex h-10 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-bold transition hover:bg-white/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isFullscreen ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
            <span className="hidden sm:inline">
              {isFullscreen ? "Kecilkan" : "Layar Penuh"}
            </span>
          </button>

          <button
            onClick={handleLockToggle}
            className={`flex h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition active:scale-95 ${
              isLocked
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {isLocked ? <FiLock size={16} /> : <FiUnlock size={16} />}
            <span>{isLocked ? "Terkunci" : "Kunci Layar"}</span>
          </button>
        </div>
      </header>

      {/* Content Layout */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-6 px-4 py-6 sm:px-6">
        <div className="grid w-full grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          
          {/* LANGKAH 1 (KIRI): TABEL TARIF (3 Cols) */}
          <section className="flex flex-col justify-between rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,42,74,0.08)] sm:p-6 lg:col-span-3">
            <div>
              {/* STEP BADGE */}
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-extrabold text-blue-800">
                  LANGKAH 1
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Pilih Tarif</span>
              </div>

              <div className="mb-3 flex items-center gap-2 text-[#0f2a4a]">
                <FiInfo size={18} className="text-blue-600" />
                <div>
                  <h2 className="text-base font-extrabold leading-tight">Cek Jumlah Ongkos</h2>
                  <p className="text-[11px] font-medium text-slate-400">Tarif per penumpang</p>
                </div>
              </div>

              <ul className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/70">
                {PRICE_TABLE.map((row) => (
                  <li
                    key={row.seats}
                    className="flex items-center justify-between px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-slate-600">
                      {row.seats} Penumpang
                    </span>
                    <span className="font-extrabold tabular-nums text-[#0f2a4a]">
                      {rupiah(row.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* LANGKAH 2 (TENGAH): SCAN BAYAR QRIS (4 Cols) */}
          <section className="flex flex-col justify-between rounded-3xl border-2 border-rose-200/80 bg-gradient-to-b from-rose-50/30 via-white to-white p-5 shadow-[0_8px_30px_rgba(15,42,74,0.08)] sm:p-6 lg:col-span-4">
            <div>
              {/* STEP BADGE */}
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-extrabold text-rose-800">
                  LANGKAH 2
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                  <FiShield size={13} />
                </span>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xl font-extrabold tracking-tight text-rose-600">
                  <FiCreditCard size={20} />
                  QRIS PEMBAYARAN
                </span>
              </div>

              <div className="relative mx-auto aspect-square w-full max-w-64 rounded-2xl border border-slate-100 bg-slate-50 p-2">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=ANGKOTGO-PAY-AL04-STATIONARY"
                  alt="Kode QRIS AngkotGo"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs font-bold text-[#0f2a4a]">Scan untuk Lakukan Pembayaran</p>
              <p className="text-[11px] font-medium text-slate-400">NMID: ID1020261125018</p>
            </div>
          </section>

          {/* LANGKAH 3 (KANAN): QR ULASAN PENUMPANG (5 Cols) */}
          <section className="flex flex-col justify-between rounded-3xl border-2 border-amber-200/80 bg-gradient-to-b from-amber-50/30 via-white to-white p-6 shadow-[0_8px_30px_rgba(15,42,74,0.08)] lg:col-span-5">
            <div>
              {/* STEP BADGE */}
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-extrabold text-amber-800">
                  LANGKAH 3
                </span>
                
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xl font-black tracking-tight text-amber-500">
                  <FiStar className="fill-amber-400 text-amber-400" size={24} />
                  ULASAN PENUMPANG
                </span>
              </div>

              {/* QR CODE CONTAINER UKURAN BESAR */}
              <div className="relative mx-auto my-2 aspect-square w-full max-w-72 rounded-2xl border-2 border-dashed border-amber-300 bg-white p-3 shadow-inner">
                <img
                  src={feedbackQrCodeUrl}
                  alt="Kode QR Ulasan Penumpang AngkotGo"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <div className="mt-2 text-center">
              <p className="text-sm font-black text-[#0f2a4a]">
                Scan untuk Beri Ulasan & Rating Sopir
              </p>
              <p className="mt-0.5 text-xs font-semibold text-slate-400">
                Arahkan Kamera Smartphone ke Kode QR Di Atas
              </p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="pb-4 text-center text-xs font-medium text-slate-500">
        {isLocked ? "Layar terkunci · Masukkan PIN untuk keluar" : "AngkotGo Display System v1.2"}
      </footer>

      {/* MODAL PIN PAD UNTUK UNLOCK */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f2a4a]/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xs space-y-5 rounded-3xl bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">
                Keamanan Driver
              </span>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                <FiX size={18} />
              </button>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-[#0f2a4a]">
                Masukkan PIN Driver
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Default PIN: <span className="font-bold text-[#0f2a4a]">1234</span>
              </p>
            </div>

            <div className="flex justify-center gap-3 py-1">
              {[0, 1, 2, 3].map((idx) => {
                const filled = inputPin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`h-4 w-4 rounded-full border-2 transition-all ${
                      pinError
                        ? "border-rose-500 bg-rose-500 animate-bounce"
                        : filled
                          ? "border-[#0f2a4a] bg-[#0f2a4a]"
                          : "border-slate-300"
                    }`}
                  />
                );
              })}
            </div>

            {pinError && (
              <p className="text-xs font-bold text-rose-600 animate-pulse">
                PIN Salah! Coba lagi.
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="flex h-12 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-[#0f2a4a] transition hover:bg-slate-200 active:scale-95"
                >
                  {num}
                </button>
              ))}

              <button
                onClick={handleDeletePin}
                className="flex h-12 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600 active:scale-95"
              >
                Hapus
              </button>

              <button
                onClick={() => handleKeyPress("0")}
                className="flex h-12 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-[#0f2a4a] active:scale-95"
              >
                0
              </button>

              <div className="flex h-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiCheck size={20} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}