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
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Armchair,
  Check,
  TrendingUp,
  UserCheck,
  FileText,
} from "lucide-react";

export default function DriverDashboard() {
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isTripActive, setIsTripActive] = useState<boolean>(false);
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

  const [manualAmount, setManualAmount] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [cashHistory, setCashHistory] = useState<
    { id: number; amount: number; time: string }[]
  >([]);

  // Logic Kursi: Klik K4 (index 3) membuat K1-K4 aktif secara berurutan
  const handleSeatClick = (targetIndex: number) => {
    const newSeats = seats.map((_, idx) => idx <= targetIndex);
    setSeats(newSeats);
  };

  const handleSelectPreset = (amount: number) => {
    setManualAmount(amount.toString());
    setSelectedPreset(amount);
  };

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
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const totalCashToday = cashHistory.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const filledSeatsCount = seats.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#0F172A] font-sans antialiased selection:bg-[#1D4ED8] selection:text-white pb-24">
      {/* HEADER UTAMA */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-gradient-to-tr from-[#1D4ED8] to-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/10">
              AG
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-black text-base md:text-lg tracking-tight text-[#0F172A]">
                  Angkotgo Driver
                </h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-medium tracking-wide">
                Portal Operasional Pengemudi Profesional
              </p>
            </div>
          </div>

          {/* PROFIL POPOVER */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] px-4 py-2.5 rounded-2xl transition-all shadow-sm group"
            >
              <div className="w-9 h-9 bg-blue-100 text-[#1D4ED8] rounded-xl flex items-center justify-center font-black text-xs shadow-inner">
                SA
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-[#0F172A] block group-hover:text-[#1D4ED8]">
                  Siti Aminah
                </span>
                <span className="text-[10px] text-[#1D4ED8] font-bold tracking-wider block uppercase">
                  Driver Utama
                </span>
              </div>
              <ChevronDown
                className="w-4 h-4 text-[#64748B] group-hover:text-[#0F172A] transition-transform duration-200"
                style={{
                  transform: isProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Popover Card Terstruktur */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl p-4 z-50 space-y-3 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3.5 p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                  <div className="w-12 h-12 bg-gradient-to-tr from-[#1D4ED8] to-blue-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md">
                    SA
                  </div>
                  <div>
                    <span className="text-[10px] text-[#1D4ED8] font-black tracking-wider uppercase">
                      Terverifikasi
                    </span>
                    <p className="text-sm font-bold text-[#0F172A]">
                      Siti Aminah
                    </p>
                    <p className="text-xs text-[#64748B]">ID: DRV-0892-MLG</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-[#64748B] px-1 font-medium">
                  <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                    <span>Armada</span>
                    <span className="font-bold text-[#0F172A]">
                      N 1234 AB (AG-01)
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span>Status Akun</span>
                    <span className="font-bold text-emerald-600">
                      Aktif & Prima
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => alert("Logout Berhasil")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all shadow-sm"
                >
                  <LogOut className="w-4 h-4" /> Keluar Aplikasi (Log Out)
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        {/* NOTIFIKASI TOAST */}
        {showNotification && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-5 py-4 rounded-2xl text-xs flex items-center gap-3 shadow-lg animate-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-black text-[#0F172A] block text-sm">
                Berhasil Disimpan!
              </span>
              <span className="font-medium">
                Pembayaran tunai telah dimasukkan dan direkap ke dalam total kas
                hari ini.
              </span>
            </div>
          </div>
        )}

        {/* BANNER OPERASIONAL MANDIRI */}
        <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white border border-blue-200/80 text-[#0F172A] px-6 py-5 rounded-3xl text-xs md:text-sm flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-blue-100/80 border border-blue-200 rounded-2xl text-[#1D4ED8] shrink-0 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-black text-[#0F172A] block text-sm mb-1">
              Mode Operasional Mandiri (Tanpa Kondektur)
            </span>
            <p className="text-[#64748B] leading-relaxed font-medium">
              Anda memiliki kendali penuh atas rute, status perjalanan,
              pemantauan GPS, pengelolaan kursi penumpang, serta input
              rekapitulasi kas harian langsung.
            </p>
          </div>
        </div>

        {/* WIDGET JADWAL OPERASIONAL (TABEL BARIS DENGAN KOLOM) */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-[#1D4ED8] rounded-xl border border-blue-200">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-base text-[#0F172A]">
                  Jadwal Operasional Hari Ini
                </h2>
                <p className="text-xs text-[#64748B] font-medium">
                  Informasi detail rute dan penugasan armada aktif.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold bg-[#F8FAFC] text-[#0F172A] px-4 py-2 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#1D4ED8]" /> 26 Agustus 2026
            </span>
          </div>

          {/* Tabel Baris Jadwal */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-black tracking-wider text-[#64748B] uppercase bg-[#F8FAFC]">
                  <th className="py-3 px-4 rounded-l-2xl">Rute / Trayek</th>
                  <th className="py-3 px-4">Kendaraan</th>
                  <th className="py-3 px-4">Pengemudi</th>
                  <th className="py-3 px-4">Kondektur</th>
                  <th className="py-3 px-4">Arah Rute</th>
                  <th className="py-3 px-4 rounded-r-2xl">Jam Operasional</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold text-[#0F172A]">
                <tr className="hover:bg-[#F8FAFC]/80 transition-colors">
                  <td className="py-4 px-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]"></span>
                    <div>
                      <span className="font-black text-[#1D4ED8] block">
                        MK-01
                      </span>
                      <span className="text-[10px] text-[#64748B] font-medium">
                        Rute Utama Kota
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#334155]">N 1234 AB</td>
                  <td className="py-4 px-4 text-[#334155]">Siti Aminah</td>
                  <td className="py-4 px-4 text-blue-600">Mandiri (-)</td>
                  <td className="py-4 px-4">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1">
                      <Navigation className="w-3 h-3" /> FWD (Forward)
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[#334155]">
                    07:00 - 09:00 WIB
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* WIDGET UTAMA: KENDALI PERJALANAN DRIVER (DEFAULT OFF) */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
          {/* Header Kendali & Tombol Utama */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-2xl">
            <div className="space-y-1">
              <h3 className="font-black text-base text-[#0F172A] flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#1D4ED8]" /> Master Kendali
                Perjalanan Driver
              </h3>
              <p className="text-xs text-[#64748B] font-medium">
                Aktifkan trip untuk membuka live map, kontrol kursi, dan sistem
                input kas.
              </p>
            </div>
            <button
              onClick={() => setIsTripActive(!isTripActive)}
              className={`px-6 py-3.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all shadow-md flex items-center gap-2 ${
                isTripActive
                  ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/25 ring-2 ring-rose-500/20"
                  : "bg-[#1D4ED8] text-white hover:bg-blue-800 shadow-blue-500/25 ring-2 ring-blue-500/20"
              }`}
            >
              {isTripActive
                ? "Selesaikan Perjalanan (Non-Aktifkan)"
                : "Mulai Perjalanan (Aktifkan Sekarang)"}
            </button>
          </div>

          {/* KONTEN ANAK: HANYA MUNCUL KETIKA PERJALANAN AKTIF */}
          {isTripActive ? (
            <div className="space-y-8 pt-4 border-t border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-300">
              {/* 1. LIVE MAP TRACKING */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-black text-[#334155]">
                  <span className="flex items-center gap-2 tracking-wider uppercase">
                    <MapPin className="w-4 h-4 text-[#1D4ED8] animate-bounce" />{" "}
                    Live Map Tracking Perjalanan
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>{" "}
                    GPS Aktif & Sinkron
                  </span>
                </div>
                <div className="w-full h-72 bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl flex items-center justify-center relative overflow-hidden shadow-inner group">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px]"></div>
                  <div className="z-10 bg-white px-6 py-3.5 rounded-2xl shadow-lg border border-[#E2E8F0] text-xs font-black text-[#0F172A] flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#1D4ED8] rounded-full animate-ping"></div>
                    <span>
                      Melacak Posisi Armada Real-time di Koridor Malang Kota
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. KELOLA KURSI & INPUT PEMBAYARAN DALAM GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ketersediaan Kursi */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 space-y-5 shadow-sm flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-sm text-[#0F172A] flex items-center gap-2">
                        <Armchair className="w-4 h-4 text-[#1D4ED8]" />{" "}
                        Ketersediaan Kursi (1-8)
                      </h4>
                      <span className="text-xs font-black bg-blue-50 text-[#1D4ED8] border border-blue-200 px-3 py-1 rounded-full shadow-sm">
                        {filledSeatsCount}/8 Terisi
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] font-medium">
                      Klik salah satu nomor kursi untuk set kapasitas berurutan
                      secara otomatis.
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-3 py-2">
                    {seats.map((isFilled, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSeatClick(idx)}
                        className={`py-4 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1.5 shadow-sm ${
                          isFilled
                            ? "bg-rose-50 border-rose-200 text-rose-700 shadow-rose-100 ring-1 ring-rose-500/20"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-emerald-100 ring-1 ring-emerald-500/20"
                        }`}
                      >
                        <span className="text-sm">K{idx + 1}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {isFilled ? "Terisi" : "Kosong"}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="text-[11px] text-[#64748B] font-medium bg-white p-3.5 rounded-2xl border border-[#E2E8F0] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#1D4ED8] rounded-full"></div>
                    <span>
                      Contoh: Klik K4 akan otomatis mengisi kursi 1 sampai 4
                      sekaligus.
                    </span>
                  </div>
                </div>

                {/* Input Pembayaran Cash */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 space-y-5 shadow-sm flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="font-black text-sm text-[#0F172A] flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-600" /> Input
                      Pembayaran Tunai (Cash)
                    </h4>
                    <p className="text-xs text-[#64748B] font-medium">
                      Pilih preset atau ketik manual ke buffer, lalu klik
                      simpan.
                    </p>
                  </div>

                  {/* Preset Tombol Cepat */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {[3000, 4000, 5000].map((nominal) => (
                      <button
                        key={nominal}
                        type="button"
                        onClick={() => handleSelectPreset(nominal)}
                        className={`border py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                          selectedPreset === nominal
                            ? "bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20"
                            : "bg-white hover:bg-blue-50/50 border-[#E2E8F0] text-[#0F172A]"
                        }`}
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-[#1D4ED8]" />{" "}
                        {nominal / 1000}rb
                      </button>
                    ))}
                  </div>

                  {/* Form Buffer Input & Konfirmasi Simpan */}
                  <form onSubmit={handleSaveCash} className="space-y-3">
                    <div className="flex gap-2.5">
                      <input
                        type="number"
                        placeholder="Ketik nominal cash..."
                        value={manualAmount}
                        onChange={(e) => {
                          setManualAmount(e.target.value);
                          setSelectedPreset(null);
                        }}
                        className="bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3 text-xs w-full text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-blue-500/20 font-bold shadow-sm"
                      />
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-emerald-600/20 shrink-0 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 stroke-[3]" /> Simpan
                      </button>
                    </div>
                  </form>

                  <div className="text-[11px] text-amber-900 font-medium bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      Wajib konfirmasi klik "Simpan" agar nominal tercatat resmi
                      pada rekap kas harian.
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. WIDGET TOTAL KAS & RIWAYAT HARIAN */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                {/* Total Kas Card Eye-Catching */}
                <div className="bg-gradient-to-r from-[#1D4ED8] via-blue-600 to-indigo-700 text-white p-6 md:p-8 rounded-2xl shadow-xl shadow-blue-500/25 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden border border-blue-400/20">
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="space-y-1 relative z-10">
                    <div className="flex items-center gap-2 text-blue-100 text-xs font-black uppercase tracking-widest">
                      <TrendingUp className="w-4 h-4" /> Akumulasi Pendapatan
                      Harian
                    </div>
                    <span className="text-3xl md:text-4xl font-black tracking-tight block">
                      Rp {totalCashToday.toLocaleString()}
                    </span>
                    <p className="text-xs text-blue-100 font-medium">
                      Total kas manual yang berhasil divalidasi dan disimpan
                      hari ini.
                    </p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner relative z-10 shrink-0">
                    <Banknote className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* List Riwayat Hari Ini Saja */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-black text-[#334155] flex items-center gap-2 tracking-wider uppercase">
                      <History className="w-4 h-4 text-[#1D4ED8]" /> Riwayat Kas
                      Masuk (Hari Ini Saja)
                    </h5>
                    <span className="text-[10px] text-[#64748B] bg-white px-3 py-1 rounded-xl border border-[#E2E8F0] font-bold shadow-sm">
                      {cashHistory.length} Transaksi Tercatat
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {cashHistory.length === 0 ? (
                      <p className="text-xs text-[#64748B] font-medium text-center py-8 bg-white border border-dashed border-[#E2E8F0] rounded-2xl">
                        Belum ada transaksi cash yang dikonfirmasi dan disimpan
                        hari ini.
                      </p>
                    ) : (
                      cashHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center bg-white border border-[#E2E8F0] px-5 py-3.5 rounded-2xl text-xs hover:border-blue-300 transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold border border-emerald-200">
                              +
                            </div>
                            <div>
                              <span className="font-bold text-[#0F172A] block">
                                Penerimaan Tunai Penumpang
                              </span>
                              <span className="text-[10px] text-[#64748B] font-medium">
                                Dicatat pukul {item.time} WIB
                              </span>
                            </div>
                          </div>
                          <span className="font-black text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-xs shadow-sm">
                            +Rp {item.amount.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center bg-[#F8FAFC] border border-dashed border-[#E2E8F0] rounded-3xl space-y-3 shadow-inner">
              <div className="w-16 h-16 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-center mx-auto text-[#64748B] shadow-sm">
                <AlertCircle className="w-8 h-8 text-[#1D4ED8] animate-pulse" />
              </div>
              <h4 className="text-sm font-black text-[#0F172A]">
                Perjalanan Saat Ini Dalam Status Non-Aktif
              </h4>
              <p className="text-xs text-[#64748B] font-medium max-w-md mx-auto leading-relaxed">
                Silakan klik tombol{" "}
                <span className="font-bold text-[#1D4ED8]">
                  "Mulai Perjalanan (Aktifkan Sekarang)"
                </span>{" "}
                di atas untuk membuka akses penuh ke live map rute, manajemen
                kursi, dan sistem rekapitulasi kas harian.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
