"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { MapProps } from "../../../../../components/admin/MapDetailComponent";

// Memanggil MapComponent secara dinamis (Client-Side Only) menggunakan Relative Path
const MapWithNoSSR = dynamic<MapProps>(
  () =>
    import("../../../../../components/admin/MapDetailComponent").then(
      (mod) => mod.default,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Memuat Peta Rute...</p>
        </div>
      </div>
    ),
  },
);

// Mock data halte & koordinat rute dinamis (Bisa Anda sesuaikan)
const fallbackRouteDetails = {
  id: 1,
  name: "Arjosari - Landungsari",
  code: "AL",
  pointsCount: 117,
  stops: [
    {
      id: 1,
      name: "Terminal Arjosari",
      radius: "40m",
      type: "Terminal",
      lat: -7.931891,
      lng: 112.642928,
    },
    {
      id: 30,
      name: "Stop 30",
      radius: "40m",
      type: "Halte Angkot",
      lat: -7.93623,
      lng: 112.624154,
    },
    {
      id: 60,
      name: "Stop 60",
      radius: "40m",
      type: "Halte Angkot",
      lat: -7.938286,
      lng: 112.601938,
    },
    {
      id: 90,
      name: "Stop 90",
      radius: "40m",
      type: "Halte Angkot",
      lat: -7.928576,
      lng: 112.58975,
    },
    {
      id: 117,
      name: "Terminal Landungsari",
      radius: "40m",
      type: "Terminal",
      lat: -7.920163,
      lng: 112.582844,
    },
  ],
  coordinates: [
    [-7.931891, 112.642928],
    [-7.93623, 112.624154],
    [-7.938286, 112.601938],
    [-7.928576, 112.58975],
    [-7.920163, 112.582844],
  ] as [number, number][],
};

export default function RouteDetailPage() {
  const params = useParams();
  const [routeData] = useState(fallbackRouteDetails);
  const [activeStop, setActiveStop] = useState<number | null>(117); // Default aktif di Terminal Landungsari

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          href="/admin/dashboard/route"
          className="hover:text-blue-600 transition"
        >
          Route
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">
          Detail {routeData.code} (ID: {params.id})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kiri: Peta Interaktif */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col h-[650px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Visualisasi Peta Rute
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Peta rute berbasis OpenStreetMap
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-center">
              <span className="block text-xs text-gray-400 font-medium uppercase">
                Points
              </span>
              <span className="text-lg font-bold text-gray-800">
                {routeData.pointsCount} Points
              </span>
            </div>
          </div>

          <div className="flex-1 w-full rounded-2xl overflow-hidden relative border border-gray-100 min-h-[400px]">
            <MapWithNoSSR
              stops={routeData.stops}
              coordinates={routeData.coordinates}
              activeStop={activeStop}
              onSelectStop={(id: number) => setActiveStop(id)}
            />
          </div>

          {/* Keterangan Peta */}
          <div className="flex items-center gap-6 mt-4 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Titik Halte Umum</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Terminal Utama</span>
            </div>
          </div>
        </div>

        {/* Kanan: Daftar Pemberhentian */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col h-[650px]">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Daftar Halte & Terminal
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Rangkaian urutan pemberhentian angkot
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {routeData.stops.map((stop) => {
              const isActive = activeStop === stop.id;
              const isTerminal = stop.type === "Terminal";

              return (
                <div
                  key={stop.id}
                  onClick={() => setActiveStop(stop.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                    isActive
                      ? "border-blue-500 bg-blue-50/50 shadow-sm shadow-blue-100"
                      : "border-gray-100 bg-white hover:bg-gray-50/60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        isTerminal
                          ? isActive
                            ? "bg-red-500 text-white"
                            : "bg-red-50 text-red-500 border border-red-100"
                          : isActive
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}
                    >
                      {stop.id}
                    </div>

                    <div>
                      <h4
                        className={`font-semibold text-sm ${isActive ? "text-blue-900" : "text-gray-800"}`}
                      >
                        {stop.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>Radius: {stop.radius}</span>
                        <span>•</span>
                        <span
                          className={`font-medium ${isTerminal ? "text-red-500" : "text-blue-500"}`}
                        >
                          {stop.type}
                        </span>
                      </div>
                      {isActive && (
                        <p className="text-[10px] text-gray-400 font-mono mt-1">
                          {stop.lat}, {stop.lng}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
