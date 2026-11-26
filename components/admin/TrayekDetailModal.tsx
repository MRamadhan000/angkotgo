"use client";

import React from "react";
import { FaTimes, FaRoute, FaBus, FaMoneyBillWave, FaQrcode, FaCalendarAlt } from "react-icons/fa";

export interface TrayekStat {
  key: string;
  routeCode: string;
  direction: "FORWARD" | "RETURN";
  origin: string;
  destination: string;
  scheduledCount: number;
  totalPassengers: number;
  totalRevenue: number;
  qrisRevenue: number;
  qrisTrxCount: number;
  cashRevenue: number;
  cashTrxCount: number;
}

interface TrayekDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trayek: TrayekStat | null;
}

export default function TrayekDetailModal({
  isOpen,
  onClose,
  trayek,
}: TrayekDetailModalProps) {
  if (!isOpen || !trayek) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-blue-50/60 to-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm font-bold text-lg">
              {trayek.routeCode}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800">
                  {trayek.origin} → {trayek.destination}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {trayek.direction === "FORWARD" ? "Arah Pergi" : "Arah Balik"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <FaCalendarAlt className="w-3 h-3 text-slate-400" />
                Rincian Ritase & Transaksi Hari Ini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Grid Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Jadwal Ritase</span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {trayek.scheduledCount} <span className="text-xs font-normal text-slate-500">Ritase</span>
              </p>
            </div>
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
              <span className="text-xs text-blue-600 font-medium">Total Penumpang</span>
              <p className="text-xl font-bold text-blue-900 mt-1">
                {trayek.totalPassengers} <span className="text-xs font-normal text-blue-600">Pax</span>
              </p>
            </div>
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-600 font-medium">Total Akumulasi</span>
              <p className="text-xl font-bold text-emerald-900 mt-1">
                Rp {trayek.totalRevenue.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* Breakdown Payment Method */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Rincian Kanal Transaksi
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {/* QRIS */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                    <FaQrcode className="w-4 h-4" />
                    <span>QRIS Gateway (Xendit)</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mt-2">
                    Rp {trayek.qrisRevenue.toLocaleString("id-ID")}
                  </p>
                  <span className="text-xs text-slate-500 mt-0.5 inline-block">
                    {trayek.qrisTrxCount} transaksi terverifikasi
                  </span>
                </div>
              </div>

              {/* TUNAI */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <FaMoneyBillWave className="w-4 h-4" />
                    <span>Tunai (Kondektur)</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mt-2">
                    Rp {trayek.cashRevenue.toLocaleString("id-ID")}
                  </p>
                  <span className="text-xs text-slate-500 mt-0.5 inline-block">
                    {trayek.cashTrxCount} transaksi disetor
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/60 flex items-center justify-between">
            <span>Rata-rata Penumpang per Ritase:</span>
            <span className="font-bold text-slate-800">
              {trayek.scheduledCount > 0
                ? (trayek.totalPassengers / trayek.scheduledCount).toFixed(1)
                : 0}{" "}
              Pax/Trip
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
