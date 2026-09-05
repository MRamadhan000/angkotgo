"use client";

import React, { useState } from "react";

export default function CashierPage() {
  const [branchId, setBranchId] = useState("CABANG_01");
  const [totalAmount, setTotalAmount] = useState<number>(100000);
  const [loading, setLoading] = useState(false);

  // Hitung simulasi pembagian saldo secara real-time
  const bossAmount = Math.round(totalAmount * 0.2);
  const branchAmount = Math.round(totalAmount * 0.8);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAmount <= 0) return alert("Nominal harus lebih dari 0");

    setLoading(true);

    try {
      // Panggil API Route internal kita sendiri
      const res = await fetch("/api/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          totalAmount,
          bossAmount,
          branchAmount,
        }),
      });

      const data = await res.json();

      if (data.invoice_url) {
        // Redirect atau buka tab baru ke Hosted Checkout Xendit
        window.open(data.invoice_url, "_blank");
      } else {
        alert("Gagal membuat invoice: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan koneksi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Kasir Multi-Cabang</h1>
          <p className="text-sm text-slate-400">
            Sistem Kasir & Split Payment Xendit (Sandbox)
          </p>
        </div>

        <form onSubmit={handleCreatePayment} className="space-y-4">
          {/* Pilih Cabang */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Pilih Cabang Transaksi
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="CABANG_01">Cabang 1 (Malang)</option>
              <option value="CABANG_02">Cabang 2 (Surabaya)</option>
              <option value="CABANG_03">Cabang 3 (Jakarta)</option>
              <option value="CABANG_04">Cabang 4 (Bandung)</option>
              <option value="CABANG_05">Cabang 5 (Bali)</option>
            </select>
          </div>

          {/* Nominal Transaksi */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Total Nominal Pembayaran (Rp)
            </label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
              placeholder="Contoh: 100000"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Rincian Split Balance Internal */}
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 space-y-2">
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Simulasi Pembagian Saldo:
            </span>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Hak Cabang (80%)</span>
              <span className="font-semibold text-emerald-400">
                Rp {branchAmount.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Hak Boss / Master (20%)</span>
              <span className="font-semibold text-blue-400">
                Rp {bossAmount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Tombol Bayar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition duration-200 disabled:opacity-50"
          >
            {loading
              ? "Membuat Invoice Xendit..."
              : "Bayar Sekarang via Xendit"}
          </button>
        </form>

        <p className="text-xs text-center text-slate-500">
          *Akan mengarahkan ke UI Hosted Checkout resmi dari Xendit.
        </p>
      </div>
    </main>
  );
}
