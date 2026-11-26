"use client";

import React, { useState } from "react";
import { RouteStopType } from "@/types/routes/route-stop.type";
import { FaTimes, FaMapMarkerAlt, FaUsers, FaSearch, FaRoute } from "react-icons/fa";
import Link from "next/link";

export interface HalteBoardingStat {
  stopId: number;
  stopName: string;
  routeCode: string;
  routeName: string;
  direction?: string;
  boardingCount: number;
  latitude: number;
  longitude: number;
}

interface HalteSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  halteStats: HalteBoardingStat[];
}

export default function HalteSummaryModal({
  isOpen,
  onClose,
  halteStats,
}: HalteSummaryModalProps) {
  const [search, setSearch] = useState("");
  const [hideDuplicates, setHideDuplicates] = useState(true);

  // Filter duplikat: jika nama halte sama di rute yang sama, gabungkan jadi 1 baris
  const displayStats = React.useMemo(() => {
    if (!hideDuplicates) return halteStats;

    const uniqueMap = new Map<string, HalteBoardingStat>();
    halteStats.forEach((h) => {
      // Normalisasi nama halte dan kode rute
      const key = `${h.stopName.trim().toLowerCase()}_${h.routeCode.trim().toLowerCase()}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, { ...h, direction: undefined });
      } else {
        // Akumulasi boarding jika ada
        const existing = uniqueMap.get(key)!;
        existing.boardingCount += h.boardingCount;
      }
    });

    return Array.from(uniqueMap.values());
  }, [halteStats, hideDuplicates]);

  const filtered = displayStats.filter(
    (h) =>
      h.stopName.toLowerCase().includes(search.toLowerCase()) ||
      h.routeCode.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-blue-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <FaMapMarkerAlt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-800">
                  Ringkasan Kepadatan Penumpang & Halte
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {displayStats.length} Halte Terdata
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Simpul halte utama dan titik penjemputan penumpang terpadat Kota Malang
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

        {/* Search & Toggle Duplikasi */}
        <div className="px-6 py-3 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <FaSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama halte atau kode rute..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setHideDuplicates(!hideDuplicates)}
            className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              hideDuplicates
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {hideDuplicates ? "✓ Gabungkan Duplikat (Unik)" : "Tampilkan Per Arah Trayek"}
          </button>
        </div>

        {/* List Halte */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">Tidak ditemukan halte yang cocok.</p>
            </div>
          ) : (
            filtered.map((h, idx) => (
              <div
                key={h.stopId}
                className="pt-2.5 first:pt-0 flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {h.stopName}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <FaRoute className="w-3 h-3 text-slate-400" />
                      Trayek {h.routeCode} ({h.routeName}) {h.direction ? `• Arah ${h.direction === "FORWARD" ? "Pergi" : "Pulang"}` : ""} • Titik Koordinat: {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <FaUsers className="w-3 h-3" />
                    {h.boardingCount} Boarding
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Data terintegrasi dengan jaringan geolokasi PostGIS</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <Link
              href="/admin/dashboard/route"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              Lihat Master Halte & Rute →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
