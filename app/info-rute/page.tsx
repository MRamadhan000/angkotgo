"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaRoute,
  FaSearch,
  FaInfoCircle,
  FaChevronRight,
  FaTimes,
  FaArrowRight,
  FaExchangeAlt,
} from "react-icons/fa";

// ==========================================
// INTERFACES
// ==========================================
interface RouteData {
  id: number;
  code: string;
  name: string;
  direction: "GO" | "BACK" | string;
  color: string;
  distanceKm: number | null;
  estimatedDurationMinutes: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RoutesInfoPage() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "GO" | "BACK">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // FETCH DATA FROM API
  // ==========================================
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/routes");
        if (!res.ok) {
          throw new Error("Gagal mengambil data rute angkot");
        }
        const data = await res.json();
        setRoutes(data);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan koneksi");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  // Filter + Search
  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === "all" || route.direction === filter;

    return matchesSearch && matchesFilter;
  });

  const activeRoutesCount = routes.filter((r) => r.isActive).length;

  const filterOptions = [
    { key: "all" as const, label: "Semua Rute" },
    { key: "GO" as const, label: "Rute Berangkat" },
    { key: "BACK" as const, label: "Rute Kembali (PP)" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-6">
        {/* ===== HEADER ===== */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold tracking-[2px] text-[#2563EB] mb-4">
            KOTA MALANG • MALANG RAYA
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-slate-900 mb-3">
            Rute Angkot Malang Raya
          </h1>
          <p className="max-w-lg text-[15px] leading-relaxed text-slate-600">
            Temukan seluruh trayek angkutan kota resmi yang beroperasi di
            wilayah Malang Raya lengkap dengan kode dan arah tujuannya.
          </p>

          {/* Stats */}
          {!loading && !error && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                <div>
                  <div className="text-3xl font-bold text-[#2563EB]">
                    {activeRoutesCount}
                  </div>
                  <div className="text-xs font-medium text-slate-500 -mt-0.5">
                    Rute Aktif
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-400 max-w-[180px]">
                Data resmi dari Dinas Perhubungan Kota Malang
              </div>
            </div>
          )}
        </div>

        {/* ===== SEARCH + FILTER ===== */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <FaSearch className="text-sm" />
            </div>
            <input
              type="text"
              placeholder="Cari rute (contoh: AL, Landungsari, Gadang...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setFilter(option.key)}
                className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all border ${
                  filter === option.key
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== RESULTS COUNTER ===== */}
        {!loading && !error && (
          <div className="mb-4 flex items-center justify-between text-sm">
            <p className="text-slate-600">
              Menampilkan{" "}
              <span className="font-semibold text-slate-900">
                {filteredRoutes.length}
              </span>{" "}
              rute
              {searchQuery && ` untuk "${searchQuery}"`}
            </p>
            {(searchQuery || filter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilter("all");
                }}
                className="text-[#2563EB] hover:underline font-medium"
              >
                Reset filter
              </button>
            )}
          </div>
        )}

        {/* ===== CONTENT ===== */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-5"
              >
                <div className="h-14 w-14 flex-shrink-0 animate-pulse rounded-2xl bg-slate-200" />
                <div className="flex-1 space-y-2.5 pt-1">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
            <FaInfoCircle className="mx-auto mb-3 text-3xl text-red-400" />
            <p className="font-semibold text-red-700">Gagal memuat data rute</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <FaRoute className="mx-auto mb-4 text-5xl text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-800">
              Rute tidak ditemukan
            </h3>
            <p className="mt-1 text-slate-500">
              Coba ubah kata kunci atau filter pencarianmu.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilter("all");
              }}
              className="mt-5 rounded-2xl bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Tampilkan Semua Rute
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRoutes.map((route) => {
              const isGO = route.direction === "GO";
              const directionText = isGO
                ? "Rute Berangkat"
                : "Rute Kembali / PP";

              return (
                <Link
                  key={route.id}
                  href={`/info-rute/${route.id}`}
                  className={`group flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-slate-200 hover:shadow-md active:scale-[0.995] sm:flex-row sm:items-center sm:justify-between ${
                    !route.isActive ? "opacity-75" : ""
                  }`}
                  style={{
                    borderLeft: `5px solid ${route.color || "#2563EB"}`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Kode Badge */}
                    <div
                      style={{ backgroundColor: route.color || "#2563EB" }}
                      className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold tracking-wider text-white shadow-sm group-hover:brightness-95 transition-all"
                    >
                      {route.code}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-lg tracking-tight text-slate-900 group-hover:text-[#2563EB] transition-colors">
                        {route.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                        {/* Direction Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            isGO
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {isGO ? (
                            <FaArrowRight className="text-[10px]" />
                          ) : (
                            <FaExchangeAlt className="text-[10px]" />
                          )}
                          {directionText}
                        </span>

                        {route.distanceKm && (
                          <span className="text-xs text-slate-500">
                            {route.distanceKm} km
                          </span>
                        )}
                        {route.estimatedDurationMinutes && (
                          <span className="text-xs text-slate-500">
                            ±{route.estimatedDurationMinutes} menit
                          </span>
                        )}

                        {!route.isActive && (
                          <span className="rounded-full bg-red-100 px-3 py-0.5 text-xs font-semibold text-red-600">
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-end sm:justify-center">
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-5 py-2.5 text-sm font-semibold text-[#2563EB] transition-all group-hover:bg-[#2563EB] group-hover:text-white">
                      Lihat Detail
                      <FaChevronRight className="text-xs transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
