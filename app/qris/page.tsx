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

const DEFAULT_PIN = "1234"; // PIN bawaan untuk membuka kunci
const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export default function DriverQrisDisplayPage() {
  const router = useRouter();

  // Fullscreen, Lock & PIN State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [inputPin, setInputPin] = useState("");
  const [pinError, setPinError] = useState(false);

  // Sync state dengan Fullscreen API browser
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Toggle Fullscreen Web API
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

  // Lock & Unlock Handler
  const handleLockToggle = () => {
    if (!isLocked) {
      setIsLocked(true);
    } else {
      setInputPin("");
      setPinError(false);
      setIsPinModalOpen(true);
    }
  };

  // Navigasi Kembali (Meminta PIN jika terkunci)
  const handleBackNavigation = () => {
    if (isLocked) {
      setInputPin("");
      setPinError(false);
      setIsPinModalOpen(true);
    } else {
      router.back();
    }
  };

  // Input Keypad Handler
  const handleKeyPress = (num: string) => {
    if (inputPin.length < 4) {
      const newPin = inputPin + num;
      setInputPin(newPin);
      setPinError(false);

      // Verifikasi otomatis jika sudah 4 digit
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
          {/* Tombol Fullscreen */}
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

          {/* Tombol Kunci / Buka Kunci dengan PIN */}
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

      {/* Content */}
      <main className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-1 items-center gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:gap-10">
        {/* QR */}
        <section className="mx-auto w-full max-w-sm rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(15,42,74,0.10)] sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xl font-extrabold tracking-tight text-rose-600">
              QRIS
            </span>
            <span className="text-xs font-semibold text-slate-400">
              AngkotGo
            </span>
          </div>

          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=ANGKOTGO-PAY-AL04-STATIONARY"
            alt="Kode QRIS AngkotGo"
            className="mx-auto aspect-square w-full max-w-72 object-contain"
          />

          <p className="mt-4 text-center text-xs font-medium text-slate-500">
            NMID: ID1020261125018
          </p>
        </section>

        {/* Tarif */}
        <section>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Bayar dengan QRIS
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Scan kode, lalu masukkan nominal sesuai jumlah penumpang.
          </p>

          <ul className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,42,74,0.06)]">
            {PRICE_TABLE.map((row) => (
              <li
                key={row.seats}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <span className="text-sm font-semibold text-slate-600 sm:text-base">
                  {row.seats} penumpang
                </span>
                <span className="text-lg font-extrabold tabular-nums sm:text-xl">
                  {rupiah(row.amount)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="pb-4 text-center text-xs font-medium text-slate-500">
        {isLocked ? "Layar terkunci · Masukkan PIN untuk keluar" : "Bebas biaya admin"}
      </footer>

      {/* ---------------------------------------------------------
         MODAL PIN PAD UNTUK UNLOCK / KELUAR
      --------------------------------------------------------- */}
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

            {/* Indikator Dots PIN */}
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

            {/* KEYPAD NUMERIK */}
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