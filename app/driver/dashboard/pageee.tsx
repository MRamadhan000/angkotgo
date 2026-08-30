"use client";

import React, { useState } from "react";
import {
  Bus,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Banknote,
  PlusCircle,
  History,
  Navigation,
  Calendar,
} from "lucide-react";

export default function DriverDashboard() {
  // State Kendali Perjalanan & Kursi (1-8)
  const [isTripActive, setIsTripActive] = useState<boolean>(true);
  const [seats, setSeats] = useState<boolean[]>([
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
  ]); // true = terisi

  // State Pembayaran Manual Cash
  const [manualAmount, setManualAmount] = useState<string>("");
  const [cashHistory, setCashHistory] = useState<
    { id: number; amount: number; time: string }[]
  >([
    { id: 1, amount: 3000, time: "08:30" },
    { id: 2, amount: 4000, time: "09:15" },
  ]);

  // Handler Toggle Kursi
  const toggleSeat = (index: number) => {
    const updatedSeats = [...seats];
    updatedSeats[index] = !updatedSeats[index];
    setSeats(updatedSeats);
  };

  // Handler Tambah Cash Manual
  const handleAddCash = (amountToAdd: number) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newTransaction = {
      id: Date.now(),
      amount: amountToAdd,
      time: timeString,
    };
    setCashHistory([newTransaction, ...cashHistory]);
  };

  const handleCustomCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(manualAmount);
    if (!isNaN(parsed) && parsed > 0) {
      handleAddCash(parsed);
      setManualAmount("");
    }
  };

  // Hitung Total Kas Hari Ini
  const totalCashToday = cashHistory.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const filledSeatsCount = seats.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 1. STATUS & PROFIL DRIVER */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1D4ED8] text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
              AG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg">Angkotgo Driver</h1>
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                  Online
                </span>
              </div>
              <p className="text-sm text-[#475569]">
                Portal Operasional Pengemudi Non-Kondektur
              </p>
            </div>
          </div>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-[#1D4ED8]" /> Siti Aminah
          </div>
        </div>

        {/* 2. STATUS ON/OFF KONDEKTUR (BY ADMIN) */}
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Operasional Mandiri:</span> Armada
            berjalan tanpa kondektur. Anda memiliki akses kontrol penuh
            perjalanan, pemantauan lokasi, & kursi penumpang.
          </div>
        </div>

        {/* 3. PENUGASAN DRIVER AKTIF */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-2 font-bold text-[#1D4ED8]">
              <Bus className="w-5 h-5" /> MK-01 Rute Utama - Kota (Hari Ini)
            </div>
            <span className="text-xs text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 rounded-lg">
              07:00 - 09:00
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-xs text-[#475569] block">KENDARAAN</span>
              <span className="font-semibold">N 1234 AB (AG-01)</span>
            </div>
            <div>
              <span className="text-xs text-[#475569] block">PENGEMUDI</span>
              <span className="font-semibold">Siti Aminah</span>
            </div>
            <div>
              <span className="text-xs text-[#475569] block">KONDEKTUR</span>
              <span className="font-semibold">-</span>
            </div>
            <div>
              <span className="text-xs text-[#475569] block">ARAH RUTE</span>
              <span className="font-semibold flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-[#1D4ED8]" /> FORWARD
              </span>
            </div>
          </div>

          {/* Live Maps Simulation */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-[#475569]">
              <span>LIVE MAP TRACKING PERJALANAN</span>
              <span className="text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>{" "}
                GPS Aktif
              </span>
            </div>
            <div className="w-full h-48 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="z-10 bg-white px-4 py-2 rounded-xl shadow-sm border border-[#E2E8F0] text-xs font-medium text-[#475569] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1D4ED8] animate-bounce" />{" "}
                Menampilkan Titik GPS Rute Malang
              </div>
            </div>
          </div>
        </div>

        {/* 4. KENDALI PERJALANAN AKTIF & KURSI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kendali Status & Kursi */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Kendali Perjalanan Driver</h3>
              <button
                onClick={() => setIsTripActive(!isTripActive)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isTripActive
                    ? "bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20"
                    : "bg-[#1D4ED8] text-white hover:bg-blue-800 shadow-md shadow-blue-500/20"
                }`}
              >
                {isTripActive ? "Selesaikan Perjalanan" : "Mulai Perjalanan"}
              </button>
            </div>

            {/* Ketersediaan Kursi */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#475569]">
                  KETERSEDIAAN KURSI (Klik untuk Ubah Status)
                </span>
                <span className="text-xs font-bold bg-blue-50 text-[#1D4ED8] px-2.5 py-0.5 rounded-full">
                  {filledSeatsCount}/8 Terisi
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {seats.map((isFilled, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleSeat(idx)}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                      isFilled
                        ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                    }`}
                  >
                    <span>K{idx + 1}</span>
                    <span className="text-[10px] font-normal">
                      {isFilled ? "Terisi" : "Kosong"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* INPUT PEMBAYARAN MANUAL CASH & WIDGET TOTAL */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[#1D4ED8]" /> Input Pembayaran
                Tunai (Cash)
              </h3>
            </div>

            {/* Shortcut Tombol Cepat Nominal */}
            <div className="space-y-2">
              <span className="text-xs text-[#475569] block">
                Pilih Cepat Nominal Umum:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[3000, 4000, 5000].map((nominal) => (
                  <button
                    key={nominal}
                    onClick={() => handleAddCash(nominal)}
                    className="bg-[#F8FAFC] hover:bg-blue-50 border border-[#E2E8F0] hover:border-blue-300 text-[#0F172A] hover:text-[#1D4ED8] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Rp{" "}
                    {nominal.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Manual Bebas */}
            <form onSubmit={handleCustomCashSubmit} className="flex gap-2">
              <input
                type="number"
                placeholder="Nominal manual..."
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs w-full focus:outline-none focus:border-[#1D4ED8]"
              />
              <button
                type="submit"
                className="bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-800 transition-all shrink-0"
              >
                Simpan
              </button>
            </form>

            {/* Widget Total Pembayaran Cash Hari Ini */}
            <div className="bg-gradient-to-br from-[#1D4ED8] to-blue-700 text-white p-4 rounded-xl shadow-md shadow-blue-500/20 flex justify-between items-center">
              <div>
                <span className="text-xs text-blue-100 block">
                  Total Kas Masuk Hari Ini
                </span>
                <span className="text-xl font-extrabold">
                  Rp {totalCashToday.toLocaleString()}
                </span>
              </div>
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                <Banknote className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* History Transaksi Cash Hari Ini */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#475569] flex items-center gap-1">
                <History className="w-3.5 h-3.5" /> Riwayat Kas Hari Ini saja
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                {cashHistory.length === 0 ? (
                  <p className="text-xs text-[#475569] text-center py-2">
                    Belum ada transaksi cash hari ini.
                  </p>
                ) : (
                  cashHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs"
                    >
                      <span className="font-medium text-[#475569]">
                        Penerimaan Tunai
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-[#475569]">
                          {item.time}
                        </span>
                        <span className="font-bold text-emerald-600">
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
      </div>
    </div>
  );
}
