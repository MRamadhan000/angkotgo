"use client";

import React, { useState } from "react";
import {
  Bus,
  MapPin,
  ShieldCheck,
  Banknote,
  PlusCircle,
  History,
  Navigation,
  Calendar,
  Clock,
  User as UserIcon,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function DriverDashboard() {
  // State Profil Popover
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // State Kendali Perjalanan Aktif/Non-Aktif
  const [isTripActive, setIsTripActive] = useState<boolean>(false);

  // State Ketersediaan Kursi (1-8, Default Kosong / false)
  const [seats, setSeats] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  // State Pembayaran Manual Cash
  const [manualAmount, setManualAmount] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [cashHistory, setCashHistory] = useState<
    { id: number; amount: number; time: string }[]
  >([]);

  // Handler Klik Kursi Cepat (Contoh: Klik K4 membuat K1-K4 terisi)
  const handleSeatClick = (targetIndex: number) => {
    const updatedSeats = seats.map((_, idx) =>
      idx <= targetIndex ? !seats[targetIndex] : false,
    );
    // Jika diklik kursi yang sama saat sudah aktif, matikan, atau logika kuantitas berurutan:
    const targetState = !seats[targetIndex];
    const newSeats = seats.map((_, idx) =>
      idx <= targetIndex ? targetState : false,
    );
    setSeats(newSeats);
  };

  // Handler Pilih Preset Nominal (Masuk ke Field Input Dulu)
  const handleSelectPreset = (amount: number) => {
    setManualAmount(amount.toString());
    setSelectedPreset(amount);
  };

  // Handler Simpan Cash ke Total Kas Hari Ini
  const handleSaveCash = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(manualAmount);
    if (!isNaN(parsed) && parsed > 0) {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newTransaction = {
        id: Date.now(),
        amount: parsed,
        time: timeString,
      };
      setCashHistory([newTransaction, ...cashHistory]);
      setManualAmount("");
      setSelectedPreset(null);

      // Munculkan notifikasi peringatan/sukses
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  // Hitung Total Kas Hari Ini
  const totalCashToday = cashHistory.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const filledSeatsCount = seats.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-blue-100 selection:text-blue-900 pb-16">
      {/* HEADER UTAMA */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1D4ED8] text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
              AG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm md:text-base tracking-tight">
                  Angkotgo Driver
                </h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                  Online
                </span>
              </div>
              <p className="text-xs text-[#475569]">
                Portal Operasional Pengemudi Non-Kondektur
              </p>
            </div>
          </div>

          {/* PROFIL DENGAN POPOVER */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] px-3 py-2 rounded-xl transition-all"
            >
              <div className="w-7 h-7 bg-blue-100 text-[#1D4ED8] rounded-lg flex items-center justify-center font-bold text-xs">
                SA
              </div>
              <span className="text-xs font-semibold hidden md:inline">
                Siti Aminah
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#475569]" />
            </button>

            {/* Popover Menu Profil & Logout */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-2 z-40 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2.5 border-b border-[#E2E8F0]">
                  <p className="text-xs text-[#475569]">Masuk sebagai</p>
                  <p className="text-sm font-bold text-[#0F172A]">
                    Siti Aminah
                  </p>
                  <p className="text-[10px] text-blue-600 font-medium">
                    Driver Armada AngkotGo
                  </p>
                </div>
                <button
                  onClick={() => alert("Logout Berhasil")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 mt-6 space-y-6">
        {/* NOTIFIKASI PEMBERITAHUAN CASH BERHASIL */}
        {showNotification && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-sm animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Pembayaran cash berhasil disimpan dan ditambahkan ke total kas
              hari ini!
            </span>
          </div>
        )}

        {/* BANNER STATUS KONDEKTUR */}
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3.5 rounded-2xl text-xs flex items-start gap-3 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Operasional Mandiri:</span> Armada
            berjalan tanpa kondektur. Anda memiliki akses kontrol penuh
            perjalanan, pemantauan lokasi, & kursi penumpang.
          </div>
        </div>

        {/* WIDGET JADWAL HARI INI */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-[#1D4ED8]">
              <Calendar className="w-4 h-4" /> Jadwal Operasional Hari Ini
            </div>
            <span className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 rounded-xl font-medium text-[#475569]">
              26 Agustus 2026
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs">
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
              <span className="text-[10px] text-[#475569] block mb-1">
                RUTE
              </span>
              <span className="font-bold text-sm text-[#1D4ED8]">MK-01</span>
            </div>
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
              <span className="text-[10px] text-[#475569] block mb-1">
                KENDARAAN
              </span>
              <span className="font-bold text-[#0F172A]">N 1234 AB</span>
            </div>
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
              <span className="text-[10px] text-[#475569] block mb-1">
                PENGEMUDI
              </span>
              <span className="font-bold text-[#0F172A]">Siti Aminah</span>
            </div>
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
              <span className="text-[10px] text-[#475569] block mb-1">
                KONDEKTUR
              </span>
              <span className="font-bold text-[#0F172A]">- (Mandiri)</span>
            </div>
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
              <span className="text-[10px] text-[#475569] block mb-1">
                ARAH RUTE
              </span>
              <span className="font-bold text-[#0F172A] flex items-center gap-1">
                <Navigation className="w-3 h-3 text-[#1D4ED8]" /> FORWARD
              </span>
            </div>
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
              <span className="text-[10px] text-[#475569] block mb-1">
                JAM OPERASIONAL
              </span>
              <span className="font-bold text-[#0F172A] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#1D4ED8]" /> 07:00 - 09:00
              </span>
            </div>
          </div>
        </div>

        {/* KENDALI PERJALANAN UTAMA */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl">
            <div>
              <h3 className="font-bold text-sm">Kendali Perjalanan Driver</h3>
              <p className="text-xs text-[#475569]">
                Aktifkan perjalanan untuk membuka peta GPS, status kursi, dan
                pencatatan kas.
              </p>
            </div>
            <button
              onClick={() => setIsTripActive(!isTripActive)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                isTripActive
                  ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20"
                  : "bg-[#1D4ED8] text-white hover:bg-blue-800 shadow-blue-500/20"
              }`}
            >
              {isTripActive
                ? "Selesaikan Perjalanan (Non-Aktif)"
                : "Mulai Perjalanan (Aktifkan)"}
            </button>
          </div>

          {/* KONDISI KETIKA PERJALANAN AKTIF (CONTAINER ANAK) */}
          {isTripActive ? (
            <div className="space-y-6 pt-4 border-t border-[#E2E8F0] animate-in fade-in duration-300">
              {/* LIVE MAP TRACKING */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-[#475569]">
                  <span>LIVE MAP TRACKING PERJALANAN</span>
                  <span className="text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>{" "}
                    GPS Aktif & Terhubung
                  </span>
                </div>
                <div className="w-full h-56 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-center relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <div className="z-10 bg-white px-4 py-2.5 rounded-xl shadow-md border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#1D4ED8] animate-bounce" />{" "}
                    Melacak Posisi Angkot di Rute Kota Malang
                  </div>
                </div>
              </div>

              {/* GRID KELOLA KURSI & INPUT PEMBAYARAN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. KETERSEDIAAN KURSI BERURUTAN */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs">
                        Ketersediaan Kursi (1-8)
                      </h4>
                      <p className="text-[10px] text-[#475569]">
                        Klik nomor kursi untuk set kapasitas otomatis.
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-blue-100 text-[#1D4ED8] px-2.5 py-1 rounded-full">
                      {filledSeatsCount}/8 Terisi
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {seats.map((isFilled, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSeatClick(idx)}
                        className={`py-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                          isFilled
                            ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                        }`}
                      >
                        <span>K{idx + 1}</span>
                        <span className="text-[9px] font-normal">
                          {isFilled ? "Terisi" : "Kosong"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. INPUT PEMBAYARAN CASH (DENGAN FIELD SEBAGAI BUFFER) */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                  <div>
                    <h4 className="font-bold text-xs flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-[#1D4ED8]" /> Input
                      Pembayaran Tunai (Cash)
                    </h4>
                    <p className="text-[10px] text-[#475569]">
                      Pilih nominal atau ketik, lalu konfirmasi simpan.
                    </p>
                  </div>

                  {/* Preset Cepat */}
                  <div className="grid grid-cols-3 gap-2">
                    {[3000, 4000, 5000].map((nominal) => (
                      <button
                        key={nominal}
                        type="button"
                        onClick={() => handleSelectPreset(nominal)}
                        className={`border py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          selectedPreset === nominal
                            ? "bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-sm"
                            : "bg-white hover:bg-blue-50 border-[#E2E8F0] text-[#0F172A]"
                        }`}
                      >
                        <PlusCircle className="w-3 h-3" /> {nominal / 1000}rb
                      </button>
                    ))}
                  </div>

                  {/* Form Buffer Input & Tombol Simpan */}
                  <form onSubmit={handleSaveCash} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Masukkan nominal manual..."
                        value={manualAmount}
                        onChange={(e) => {
                          setManualAmount(e.target.value);
                          setSelectedPreset(null);
                        }}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs w-full focus:outline-none focus:border-[#1D4ED8]"
                      />
                      <button
                        type="submit"
                        className="bg-[#1D4ED8] hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 shrink-0"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* WIDGET TOTAL KAS & RIWAYAT HARI INI */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-[#1D4ED8] to-blue-700 text-white p-4 rounded-xl shadow-md shadow-blue-500/20">
                  <div>
                    <span className="text-xs text-blue-100 block">
                      Total Kas Masuk Hari Ini
                    </span>
                    <span className="text-2xl font-extrabold tracking-tight">
                      Rp {totalCashToday.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <Banknote className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#475569] flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" /> Riwayat Kas Hari Ini
                    Saja
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {cashHistory.length === 0 ? (
                      <p className="text-xs text-[#475569] text-center py-4 bg-[#F8FAFC] border border-dashed border-[#E2E8F0] rounded-xl">
                        Belum ada transaksi cash yang disimpan hari ini.
                      </p>
                    ) : (
                      cashHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs"
                        >
                          <span className="font-medium text-[#0F172A]">
                            Penerimaan Tunai Penumpang
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-[#475569]">
                              {item.time}
                            </span>
                            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              +Rp {item.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center bg-[#F8FAFC] border border-dashed border-[#E2E8F0] rounded-xl space-y-2">
              <AlertCircle className="w-8 h-8 text-[#475569] mx-auto opacity-60" />
              <p className="text-xs font-bold text-[#0F172A]">
                Perjalanan Saat Ini Non-Aktif
              </p>
              <p className="text-xs text-[#475569] max-w-sm mx-auto">
                Klik tombol{" "}
                <span className="font-bold text-[#1D4ED8]">
                  "Mulai Perjalanan (Aktifkan)"
                </span>{" "}
                di atas untuk membuka peta rute live, ketersediaan kursi, dan
                input kas harian.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
