"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

// --- Types ---
interface StopSearchResult {
  stop_id: number;
  stop_name: string;
  latitude: string;
  longitude: string;
}

interface BusInfo {
  trip_id: number;
  vehicle_code: string;
  plate_number: string;
  driver_name: string;
  ll_latitude: string;
  ll_longitude: string;
  speed_kmh: number;
  heading_degrees: number;
  updated_at: string;
}

interface RouteInfo {
  id: number;
  code: string;
  name: string;
  direction: string;
  color: string;
  distanceKm: number | null;
  estimatedDurationMinutes: number | null;
  isActive: boolean;
}

interface FindBusResponse {
  route_info: RouteInfo;
  stops: {
    id: number;
    name: string;
    sequence: number;
    latitude: string;
    longitude: string;
    radiusMeter: number;
    isTerminal: boolean;
  }[];
  polyline_points: { latitude: string; longitude: string }[];
  filtered_buses: BusInfo[]; // Typo from backend: 'filterd_buses' without 'e'
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function RutePage() {
  const [originQuery, setOriginQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");

  const [originResults, setOriginResults] = useState<StopSearchResult[]>([]);
  const [destResults, setDestResults] = useState<StopSearchResult[]>([]);

  const [selectedOrigin, setSelectedOrigin] = useState<StopSearchResult | null>(
    null,
  );
  const [selectedDest, setSelectedDest] = useState<StopSearchResult | null>(
    null,
  );

  const [routeResult, setRouteResult] = useState<FindBusResponse | null>(null);
  const [selectedBus, setSelectedBus] = useState<BusInfo | null>(null);

  const [hasSearched, setHasSearched] = useState(false);
  const [isLoadingStops, setIsLoadingStops] = useState(false);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const mapLayersRef = useRef<any[]>([]);
  const isMountedRef = useRef(true);

  // Initialize map on component mount
  useEffect(() => {
    isMountedRef.current = true;

    // Inject Leaflet CSS stylesheet dynamically
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    let map: any = null;

    const initMap = async () => {
      if (!mapContainerRef.current) return;

      if ((mapContainerRef.current as any)._leaflet_id) return;

      const L = (await import("leaflet")).default;

      if (!isMountedRef.current || !mapContainerRef.current) return;
      if ((mapContainerRef.current as any)._leaflet_id) return;

      map = L.map(mapContainerRef.current).setView([-7.983908, 112.621391], 13);
      mapInstanceRef.current = map;

      // Add clean Mapbox-style tile layer (CartoDB Positron)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        },
      ).addTo(map);
    };

    initMap();

    return () => {
      isMountedRef.current = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map layer markings whenever routeResult changes
  useEffect(() => {
    const updateMap = async () => {
      const map = mapInstanceRef.current;
      if (!map) return;
      const L = (await import("leaflet")).default;

      // Clear previous layers
      mapLayersRef.current.forEach((layer) => map.removeLayer(layer));
      mapLayersRef.current = [];

      if (!routeResult) {
        map.setView([-7.983908, 112.621391], 13);
        return;
      }

      const newLayers: any[] = [];

      // 1. Draw polyline points route path
      const points = routeResult.polyline_points || [];
      const latlngs = points.map((pt) =>
        L.latLng(parseFloat(pt.latitude), parseFloat(pt.longitude)),
      );

      if (latlngs.length > 0) {
        const polyline = L.polyline(latlngs, {
          color: routeResult.route_info.color || "#3b82f6",
          weight: 5,
          opacity: 0.85,
        }).addTo(map);
        newLayers.push(polyline);

        // Fit map bounds to path
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }

      // 2. Draw stops markers
      const stops = routeResult.stops || [];
      stops.forEach((stop) => {
        const isTerminal = stop.isTerminal;
        const color = isTerminal ? "#ef4444" : "#3b82f6";
        const marker = L.marker(
          [parseFloat(stop.latitude), parseFloat(stop.longitude)],
          {
            icon: L.divIcon({
              className: "custom-stop-marker",
              html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-size: 8px; font-weight: bold; color: white;">${stop.sequence}</div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            }),
          },
        ).addTo(map);

        marker.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
            <strong style="color: ${color};">${isTerminal ? "🚨 Terminal" : "🚌 Halte"}</strong><br/>
            <strong>${stop.name}</strong><br/>
            Sequence: Ke-${stop.sequence}
          </div>
        `);

        newLayers.push(marker);
      });

      // 3. Draw active buses from 'filterd_buses' array (typo guard)
      const buses = routeResult.filtered_buses || [];
      buses.forEach((bus) => {
        const busMarker = L.marker(
          [parseFloat(bus.ll_latitude), parseFloat(bus.ll_longitude)],
          {
            icon: L.divIcon({
              className: "custom-bus-marker",
              html: `<div style="background-color: #f59e0b; width: 32px; height: 32px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 14px;">🚌</div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            }),
          },
        ).addTo(map);

        busMarker.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 11px; padding: 4px;">
            <strong style="color: #d97706;">Armada Angkot (${routeResult.route_info.code})</strong><br/>
            <strong>Plat: ${bus.plate_number}</strong><br/>
            Driver: ${bus.driver_name}<br/>
            Kecepatan: ${bus.speed_kmh} km/jam
          </div>
        `);

        newLayers.push(busMarker);
      });

      mapLayersRef.current = newLayers;
    };

    updateMap();
  }, [routeResult]);

  // Handle Search Stop GET API
  const searchStops = async (query: string, type: "origin" | "dest") => {
    if (!query.trim()) return;
    setIsLoadingStops(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `${API_URL}/api/passenger/stops?search=${encodeURIComponent(query)}`,
      );
      if (!response.ok) {
        throw new Error("Gagal mengambil data halte.");
      }
      const resData = await response.json();
      if (resData.status === "success" && Array.isArray(resData.data)) {
        if (type === "origin") setOriginResults(resData.data);
        else setDestResults(resData.data);
      } else {
        throw new Error("Koneksi API bermasalah.");
      }
    } catch (err: any) {
      console.warn("API stops error, falling back silently:", err.message);
    } finally {
      setIsLoadingStops(false);
    }
  };

  // Handle Main Search POST API
  const handleFindBus = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasSearched(true);
    setSelectedBus(null);

    if (!selectedOrigin || !selectedDest) {
      setErrorMessage(
        "Harap cari dan pilih Halte Naik & Halte Turun terlebih dahulu.",
      );
      return;
    }

    if (selectedOrigin.stop_id === selectedDest.stop_id) {
      setErrorMessage("Halte Naik dan Halte Turun tidak boleh sama.");
      return;
    }

    setIsLoadingRoutes(true);

    try {
      const response = await fetch(`${API_URL}/api/passenger/find-bus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin_stop_id: selectedOrigin.stop_id,
          destination_stop_id: selectedDest.stop_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal mencari rute bus.");
      }
      const resData = await response.json();
      if (resData.status === "success" && resData.data) {
        console.log(`API find-bus response status: ${resData.data}`);
        setRouteResult(resData.data);
      } else {
        setRouteResult(null);
      }
    } catch (err: any) {
      console.warn("API find-bus error, falling back silently:", err.message);
      setRouteResult(null);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  // Focus map view onto selected bus marker
  const handleBusClick = async (bus: BusInfo) => {
    setSelectedBus(bus);
    const map = mapInstanceRef.current;
    if (map) {
      const L = (await import("leaflet")).default;
      map.flyTo(
        L.latLng(parseFloat(bus.ll_latitude), parseFloat(bus.ll_longitude)),
        16,
        {
          animate: true,
          duration: 1.2,
        },
      );
    }
  };

  // Reset Form
  const handleResetSearch = () => {
    setOriginQuery("");
    setDestQuery("");
    setOriginResults([]);
    setDestResults([]);
    setSelectedOrigin(null);
    setSelectedDest(null);
    setErrorMessage(null);
  };

  // Clear Map and Search results
  const handleClearResults = () => {
    setRouteResult(null);
    setHasSearched(false);
    setSelectedBus(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/40 font-sans py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Modern Glassmorphic Top Nav Header */}
        <header className="bg-white/80 border border-slate-100/80 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm backdrop-blur-md mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-gray-900 leading-none">
                  Angkot<span className="text-blue-600">Go</span>
                </h1>
                <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                  Live Tracker
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Sistem Informasi Pencarian Rute & Angkutan Umum Malang
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md shadow-slate-950/10 transition-all hover:scale-[1.02] active:scale-98 text-center"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Kembali ke Beranda
          </Link>
        </header>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT PANEL: Form and Bus List */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50 border border-slate-100 flex flex-col justify-between min-h-[550px]">
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Pencarian Rute
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Masukkan lokasi naik dan tujuan untuk mencari angkot terdekat
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-2xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errorMessage}
                </div>
              )}

              {/* Input Forms */}
              <div className="space-y-6">
                {/* Halte Naik Input */}
                <div className="relative">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Halte Naik (Jemput)
                  </label>
                  {selectedOrigin ? (
                    <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/50 rounded-2xl px-4 py-3.5 text-sm font-bold text-blue-700 animate-in zoom-in-95 duration-150">
                      <span className="truncate flex items-center gap-2">
                        <span className="text-blue-500">📍</span>
                        {selectedOrigin.stop_name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrigin(null);
                          setOriginResults([]);
                        }}
                        className="w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs transition"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          📍
                        </span>
                        <input
                          type="text"
                          value={originQuery}
                          onChange={(e) => setOriginQuery(e.target.value)}
                          placeholder="Ketik lokasi naik (cth: Arjosari)"
                          className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white text-gray-800 font-semibold placeholder-gray-400 transition"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => searchStops(originQuery, "origin")}
                        className="px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1"
                      >
                        Cari
                      </button>
                    </div>
                  )}

                  {/* Origin Suggestions drop-down list */}
                  {!selectedOrigin && originResults.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 border border-slate-100 rounded-2xl shadow-xl max-h-40 overflow-y-auto bg-white divide-y divide-slate-50 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                      {originResults.map((stop) => (
                        <div
                          key={`orig-res-${stop.stop_id}`}
                          onClick={() => {
                            setSelectedOrigin(stop);
                            setOriginResults([]);
                          }}
                          className="px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50/60 hover:text-blue-700 cursor-pointer transition flex items-center gap-2"
                        >
                          <span>📍</span>
                          {stop.stop_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Halte Turun Input */}
                <div className="relative">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Halte Turun (Tujuan)
                  </label>
                  {selectedDest ? (
                    <div className="flex items-center justify-between bg-red-50/70 border border-red-200/50 rounded-2xl px-4 py-3.5 text-sm font-bold text-red-700 animate-in zoom-in-95 duration-150">
                      <span className="truncate flex items-center gap-2">
                        <span className="text-red-500">🚩</span>
                        {selectedDest.stop_name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDest(null);
                          setDestResults([]);
                        }}
                        className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center font-bold text-xs transition"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          🚩
                        </span>
                        <input
                          type="text"
                          value={destQuery}
                          onChange={(e) => setDestQuery(e.target.value)}
                          placeholder="Ketik lokasi turun (cth: Gadang)"
                          className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white text-gray-800 font-semibold placeholder-gray-400 transition"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => searchStops(destQuery, "dest")}
                        className="px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1"
                      >
                        Cari
                      </button>
                    </div>
                  )}

                  {/* Destination Suggestions drop-down list */}
                  {!selectedDest && destResults.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 border border-slate-100 rounded-2xl shadow-xl max-h-40 overflow-y-auto bg-white divide-y divide-slate-50 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                      {destResults.map((stop) => (
                        <div
                          key={`dest-res-${stop.stop_id}`}
                          onClick={() => {
                            setSelectedDest(stop);
                            setDestResults([]);
                          }}
                          className="px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50/60 hover:text-blue-700 cursor-pointer transition flex items-center gap-2"
                        >
                          <span>🚩</span>
                          {stop.stop_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-4">
                <button
                  onClick={handleFindBus}
                  disabled={isLoadingRoutes}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-98 transition-all"
                >
                  {isLoadingRoutes ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Mencari armada...
                    </>
                  ) : (
                    "Cari Angkot & Rute Tersedia"
                  )}
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleResetSearch}
                    className="py-3 border border-slate-200 text-slate-500 hover:text-slate-800 font-bold rounded-2xl hover:bg-slate-50 transition-all text-xs active:scale-95"
                  >
                    Reset Pencarian
                  </button>
                  <button
                    onClick={handleClearResults}
                    className="py-3 border border-red-200 text-red-500 hover:text-red-700 font-bold rounded-2xl hover:bg-red-50/50 transition-all text-xs active:scale-95"
                  >
                    Hapus Hasil Rencana
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Angkot List output */}
            {hasSearched && routeResult && (
              <div className="mt-8 pt-8 border-t border-slate-100 flex-1 overflow-hidden flex flex-col">
                <div className="mb-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Hasil Rencana Perjalanan
                  </h3>
                  <div className="mt-2.5 flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                    <span className="bg-blue-600 text-white px-2.5 py-1 rounded-xl font-bold text-[10px] tracking-wider uppercase shadow-xs">
                      {routeResult.route_info.code}
                    </span>
                    <span className="font-extrabold text-xs text-slate-800 truncate">
                      {routeResult.route_info.name}
                    </span>
                  </div>
                </div>

                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Daftar Armada Angkot Terdekat
                </h4>

                {/* List Scroll wrapper */}
                <div className="space-y-3 overflow-y-auto max-h-64 pr-1 scrollbar-thin">
                  {!routeResult.filtered_buses ||
                  routeResult.filtered_buses.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50 text-xs text-slate-400 font-bold">
                      Tidak ada armada angkot aktif saat ini.
                    </div>
                  ) : (
                    routeResult.filtered_buses.map((bus) => {
                      const isCurrentBus = selectedBus?.trip_id === bus.trip_id;
                      const eta =
                        routeResult.route_info.estimatedDurationMinutes || 15;

                      return (
                        <div
                          key={`bus-card-${bus.trip_id}`}
                          onClick={() => handleBusClick(bus)}
                          className={`p-4 border rounded-2xl cursor-pointer transition-all flex justify-between items-center gap-4 relative overflow-hidden group/card ${
                            isCurrentBus
                              ? "bg-blue-50/70 border-blue-400 shadow-xs"
                              : "bg-white border-slate-150 hover:bg-slate-50/50 hover:border-slate-350"
                          }`}
                        >
                          {/* Visual accent left line */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1"
                            style={{
                              backgroundColor:
                                routeResult.route_info.color || "#2196F3",
                            }}
                          />

                          <div className="min-w-0 pl-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-extrabold text-slate-900 tracking-wide group-hover/card:text-blue-600 transition-colors">
                                {bus.plate_number}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {bus.vehicle_code}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Sopir:{" "}
                              <span className="font-bold text-slate-700">
                                {bus.driver_name}
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <span>⚡ {bus.speed_kmh} km/jam</span>
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="block text-[8px] text-slate-400 uppercase font-bold tracking-wider">
                              Estimasi Tiba
                            </span>
                            <span className="text-xs font-black text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 inline-block mt-0.5 shadow-2xs">
                              {eta} Min
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Map Container */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-xl shadow-slate-100/50 flex flex-col relative h-[550px] lg:h-auto">
            {/* Map Header Floating Overlay */}
            <div className="absolute top-4 left-4 bg-white/95 border border-slate-100 rounded-2xl px-4 py-3 shadow-sm backdrop-blur-md z-[1000] pointer-events-none">
              <h2 className="text-xs font-bold text-slate-900 leading-none">
                Peta Visualisasi Lintasan
              </h2>
              <p className="text-[9px] text-slate-400 mt-1">
                Live tracking armada & rute lintasan halte
              </p>
            </div>

            {/* Map wrapper */}
            <div
              ref={mapContainerRef}
              className="w-full h-full z-0"
              style={{ minHeight: "100%", zIndex: 0 }}
            />

            {/* Map Legend Overlay */}
            {hasSearched && routeResult && (
              <div className="absolute bottom-4 left-4 bg-white/95 border border-slate-100 rounded-2xl px-4 py-2.5 shadow-sm backdrop-blur-md z-[1000] flex items-center gap-5 text-[9px] text-slate-500 pointer-events-none font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white shadow-2xs" />
                  <span>Halte Umum</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white shadow-2xs" />
                  <span>Terminal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shadow-2xs flex items-center justify-center text-[7px] text-white">
                    🚌
                  </span>
                  <span>Posisi Angkot</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
