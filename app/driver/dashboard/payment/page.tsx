"use client";

import React, { useState } from "react";
import {
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Wallet,
  CreditCard,
  Smartphone,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { useVehicleAssignmentFinancial } from "@/hooks/useVehicleAssignmentFinancial"; // Sesuaikan path hook Anda

export default function FinancialTransactionPage() {
  // Contoh menggunakan vehicleAssignmentId = 2 (berdasarkan data JSON Anda)
  const vehicleAssignmentId = 2;
  const { data, summary, payments, isLoading, error, refetch } =
    useVehicleAssignmentFinancial(vehicleAssignmentId);

  // State untuk filter pencarian / status jika diperlukan
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  // Filter logika sederhana untuk search dan tipe pembayaran
  const filteredPayments = payments.filter((item) => {
    const matchesSearch =
      item.paymentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "ALL" || item.paymentType === filterType;

    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-sm">
          <RefreshCw className="w-8 h-8 text-[#1D4ED8] animate-spin" />
          <p className="text-xs font-bold text-[#64748B]">
            Memuat data keuangan armada...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6">
        <div className="bg-white border border-rose-200 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#0F172A]">
              Gagal Memuat Data
            </h3>
            <p className="text-xs text-[#64748B] mt-1">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="w-full bg-[#1D4ED8] text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-blue-800 transition-all shadow-md"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#0F172A] font-sans antialiased pb-24">
      {/* HEADER HALAMAN */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-50 text-[#1D4ED8] rounded-2xl border border-blue-200 flex items-center justify-center font-black">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-base text-[#0F172A]">
                Rekapitulasi Keuangan Armada
              </h1>
              <p className="text-xs text-[#64748B] font-medium">
                Monitoring transaksi Cash & Online (Midtrans QRIS)
              </p>
            </div>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#0F172A] transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#1D4ED8]" /> Refresh Data
          </button>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        {/* 1. SUMMARY CARDS (GRID STATISTIK) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card Total Pending */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black tracking-wider text-[#64748B] uppercase">
                Total Pending
              </span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-[#0F172A] tracking-tight">
                Rp {(summary?.totalPending || 0).toLocaleString()}
              </span>
              <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
                {summary?.totalPendingTransactions || 0} transaksi belum lunas
              </p>
            </div>
          </div>

          {/* Card Total Paid */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black tracking-wider text-[#64748B] uppercase">
                Total Pendapatan (Paid)
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-[#0F172A] tracking-tight">
                Rp {(summary?.totalPaid || 0).toLocaleString()}
              </span>
              <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
                {summary?.totalPaidTransactions || 0} transaksi sukses
              </p>
            </div>
          </div>

          {/* Card Total Cash */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black tracking-wider text-[#64748B] uppercase">
                Kas Tunai (Cash)
              </span>
              <div className="p-2 bg-blue-50 text-[#1D4ED8] rounded-xl border border-blue-200">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-[#0F172A] tracking-tight">
                Rp {(summary?.totalCash || 0).toLocaleString()}
              </span>
              <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
                Penerimaan fisik langsung
              </p>
            </div>
          </div>

          {/* Card Total Online */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black tracking-wider text-[#64748B] uppercase">
                Pembayaran Online
              </span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-[#0F172A] tracking-tight">
                Rp {(summary?.totalOnline || 0).toLocaleString()}
              </span>
              <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
                QRIS / Midtrans Gateway
              </p>
            </div>
          </div>
        </div>

        {/* 2. TABEL DAFTAR TRANSAKSI & FILTER */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          {/* Header Filter & Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-black text-base text-[#0F172A]">
                Daftar Transaksi Masuk
              </h3>
              <p className="text-xs text-[#64748B] font-medium">
                Total {summary?.totalTransactions || 0} transaksi tercatat pada
                penugasan ini.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Cari kode / nama user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl pl-10 pr-4 py-2.5 text-xs w-full text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#1D4ED8] font-bold"
                />
              </div>

              {/* Filter Tipe */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-2.5 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] w-full sm:w-auto"
              >
                <option value="ALL">Semua Tipe</option>
                <option value="CASH">CASH</option>
                <option value="ONLINE">ONLINE (QRIS)</option>
              </select>
            </div>
          </div>

          {/* Tabel Transaksi */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-black tracking-wider text-[#64748B] uppercase bg-[#F8FAFC]">
                  <th className="py-3.5 px-4 rounded-l-2xl">Kode Pembayaran</th>
                  <th className="py-3.5 px-4">Penumpang</th>
                  <th className="py-3.5 px-4">Tipe</th>
                  <th className="py-3.5 px-4">Nominal</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 rounded-r-2xl">Waktu Transaksi</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold text-[#0F172A]">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-[#64748B] font-medium bg-[#F8FAFC]/50 rounded-2xl"
                    >
                      Tidak ada data transaksi yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#E2E8F0]/60 hover:bg-[#F8FAFC]/80 transition-colors"
                    >
                      <td className="py-4 px-4 font-black text-[#1D4ED8]">
                        {item.paymentCode}
                      </td>
                      <td className="py-4 px-4">
                        <span className="block text-[#0F172A] font-bold">
                          {item.user?.name || "Tanpa Nama"}
                        </span>
                        <span className="text-[10px] text-[#64748B] font-normal">
                          {item.user?.email || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black inline-flex items-center gap-1 ${
                            item.paymentType === "CASH"
                              ? "bg-blue-50 text-[#1D4ED8] border border-blue-200"
                              : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          }`}
                        >
                          {item.paymentType === "CASH" ? (
                            <Banknote className="w-3 h-3" />
                          ) : (
                            <CreditCard className="w-3 h-3" />
                          )}
                          {item.paymentType}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-black text-[#0F172A]">
                        Rp {item.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black inline-flex items-center gap-1 ${
                            item.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[#64748B] font-medium text-[11px]">
                        {new Date(item.createdAt).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
