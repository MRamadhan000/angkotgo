"use client";

import { useState } from "react";
import { FaMapMarkerAlt, FaFilter, FaSearch, FaRoute } from "react-icons/fa";

const COLORS = {
  primary: "#1D4ED8",
  accent: "#2563EB",
  textDark: "#0F172A",
  textSecondary: "#475569",
  border: "#E2E8F0",
  rowEven: "#FFFFFF",
  rowOdd: "#F8FAFC",
  badgeAG: "#DBEAFE",
  badgeAL: "#DCFCE7",
  headerBg: "#1D4ED8",
};

interface Route {
  kode: string;
  badge: string;
  badgeColor: string;
  badgeText: string;
  label: string;
  fromArjosari: string[];
  fromLandungsari: string[];
}

const routes: Route[] = [
  {
    kode: "AG / AH",
    badge: "AG / AH",
    badgeColor: "#DBEAFE",
    badgeText: "#1D4ED8",
    label: "Term. Arjosari – Term. Gadang – Term. Hamid Rusdi",
    fromArjosari: [
      "Terminal Arjosari",
      "Jl. Simpang R. Panji Suroso",
      "Jl. Raden Intan",
      "Jl. Jend. A. Yani",
      "Jl. Letjen S. Parman",
      "Jl. Letjen Sutoyo",
      "Jl. Jakgung Suprapto",
      "Jl. Basuki Rahmat",
      "Merdeka Utara",
      "Jl. Merdeka Timur",
      "Jl. Sukun Jowiryo Panoto",
      "Jl. Pasar Besar",
      "Jl. Sersan Harun",
      "Jl. Prof. Moh. Yamin",
      "Jl. Sartono SH",
      "Jl. Kol. Sugiono",
      "Terminal Gadang",
    ],
    fromLandungsari: [
      "Terminal Gadang",
      "Jl. Kol. Sugiono",
      "Jl. Sartono SH",
      "Jl. Irian Jaya",
      "Jl. Tanimbar",
      "Jl. Sulawesi",
      "Jl. Yulius Usman",
      "Jl. Syarif Al Qodri",
      "Jl. Kauman",
      "Jl. Hasyim Asy'ari",
      "Jl. A. R. Hakim",
      "Jl. Basuki Rahmat",
      "Jl. Jakgung Suprapto",
      "Jl. Letjen Sutoyo",
      "Jl. Letjen S. Parman",
      "Jl. Jend. A. Yani",
      "Jl. Raden Intan",
      "Terminal Arjosari",
    ],
  },
];

function RouteStops({
  stops,
  isFirst,
}: {
  stops: string[];
  isFirst?: boolean;
}) {
  return (
    <div className="text-sm text-slate-600 leading-relaxed">
      {stops.map((stop, i) => {
        const isTerminal = i === 0 || i === stops.length - 1;
        return (
          <span key={i}>
            {isTerminal ? (
              <span className="font-semibold text-blue-700">{stop}</span>
            ) : (
              stop
            )}
            {i < stops.length - 1 && (
              <span className="mx-1 text-slate-400">–</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default function InfoRutePage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(false);

  const filtered = routes.filter(
    (r) =>
      r.kode.toLowerCase().includes(search.toLowerCase()) ||
      r.label.toLowerCase().includes(search.toLowerCase()) ||
      r.fromArjosari.some((s) =>
        s.toLowerCase().includes(search.toLowerCase()),
      ) ||
      r.fromLandungsari.some((s) =>
        s.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── SEARCH BAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-6">
        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Cari nama jalan, contoh: Basuki Rahmat"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <button
            onClick={() => setFilter(!filter)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition"
          >
            <FaFilter className="text-blue-500" />
            Filter Trayek
          </button>
        </div>
      </div>

      {/* ── TABLE SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 pb-20">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-2">
          <FaRoute className="text-blue-600 text-xl" />
          <h2 className="text-xl font-bold text-slate-800">
            Jalur Angkutan Kota Malang
          </h2>
        </div>
        <p className="text-sm text-slate-500 mb-5">
          Trayek Angkutan Kota (mikrolet) yang melewati jalur dalam Kota Malang
        </p>

        {/* Table */}
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr style={{ backgroundColor: COLORS.headerBg }}>
                <th className="px-5 py-4 text-white font-semibold text-sm w-[200px]">
                  Kode Trayek
                </th>
                <th className="px-5 py-4 text-white font-semibold text-sm w-1/2">
                  Dari Terminal Arjosari
                </th>
                <th className="px-5 py-4 text-white font-semibold text-sm w-1/2">
                  Dari Terminal Landungsari
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((route, i) => (
                <tr
                  key={route.kode}
                  className={`border-t border-slate-100 align-top ${
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                  }`}
                >
                  {/* Kode Trayek */}
                  <td className="px-6 py-5 align-top w-[200px] min-w-[200px]">
                    <span
                      className="inline-block rounded-lg px-3 py-1 text-sm font-bold mb-3"
                      style={{
                        backgroundColor: route.badgeColor,
                        color: route.badgeText,
                      }}
                    >
                      {route.badge}
                    </span>

                    <p className="text-sm text-slate-600 leading-6 max-w-[260px]">
                      {route.label}
                    </p>
                  </td>

                  {/* From Arjosari */}
                  <td className="px-5 py-5 align-top">
                    <div className="flex gap-2 items-start">
                      <FaMapMarkerAlt className="mt-0.5 shrink-0 text-blue-500 text-sm" />
                      <RouteStops stops={route.fromArjosari} isFirst />
                    </div>
                  </td>

                  {/* From Landungsari */}
                  <td className="px-5 py-5 align-top">
                    <div className="flex gap-2 items-start">
                      <FaMapMarkerAlt className="mt-0.5 shrink-0 text-blue-500 text-sm" />
                      <RouteStops stops={route.fromLandungsari} />
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    Tidak ada rute yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
