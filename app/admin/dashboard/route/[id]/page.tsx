"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// --- Types ---
interface RoutePoint {
  id: number;
  sequence: number;
  latitude: string | number;
  longitude: string | number;
}

interface RouteStop {
  id: number;
  name: string;
  sequence: number;
  latitude: string | number;
  longitude: string | number;
  radiusMeter: number;
  isTerminal: boolean;
}

interface Route {
  id: number;
  code: string;
  name: string;
  direction: "GO" | "RETURN";
  color: string;
  distanceKm: number | string | null;
  estimatedDurationMinutes: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [routeData, setRouteData] = useState<Route | null>(null);
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStop, setActiveStop] = useState<RouteStop | null>(null);

  // Bulk modal state
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showStopsModal, setShowStopsModal] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const pathLineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const targetId = parseInt(params.id as string) || 0;

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Route Info
      const routeRes = await fetch(`${API_URL}/routes`);
      if (!routeRes.ok) throw new Error("Gagal load rute");
      const routes: Route[] = await routeRes.json();
      const foundRoute = routes.find(r => r.id === targetId);

      if (!foundRoute) {
        setRouteData(null);
        return;
      }
      setRouteData(foundRoute);

      // Fetch Points
      const pointsRes = await fetch(`${API_URL}/routes/${targetId}/points`);
      if (pointsRes.ok) {
        const pointsData = await pointsRes.json();
        setPoints(pointsData);
      }

      // Fetch Stops
      const stopsRes = await fetch(`${API_URL}/routes/${targetId}/stops`);
      if (stopsRes.ok) {
        const stopsData = await stopsRes.json();
        setStops(stopsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  // Handle Leaflet Map Initialization and updates
  useEffect(() => {
    if (isLoading || !routeData || !mapContainerRef.current) return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    let map = mapInstanceRef.current;

    const renderMap = async () => {
      const L = (await import("leaflet")).default;

      let centerLat = -7.983908;
      let centerLng = 112.621391;
      if (points.length > 0) {
        centerLat = Number(points[0].latitude);
        centerLng = Number(points[0].longitude);
      } else if (stops.length > 0) {
        centerLat = Number(stops[0].latitude);
        centerLng = Number(stops[0].longitude);
      }

      if (!map) {
        map = L.map(mapContainerRef.current!).setView([centerLat, centerLng], 13);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: "abcd",
          maxZoom: 20,
        }).addTo(map);
      }

      // Clear existing layers if any
      if (pathLineRef.current) {
        map.removeLayer(pathLineRef.current);
      }
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];

      // Draw polyline
      const latlngs = [...points].sort((a, b) => a.sequence - b.sequence).map(p => L.latLng(Number(p.latitude), Number(p.longitude)));
      if (latlngs.length > 0) {
        pathLineRef.current = L.polyline(latlngs, {
          color: routeData.color || "#10b981",
          weight: 4.5,
          opacity: 0.85,
        }).addTo(map);
        map.fitBounds(pathLineRef.current.getBounds(), { padding: [50, 50] });
      }

      // Draw markers
      stops.forEach(stop => {
        const markerColor = stop.isTerminal ? "#ef4444" : "#3b82f6";
        const stopMarker = L.marker([Number(stop.latitude), Number(stop.longitude)], {
          icon: L.divIcon({
            className: "custom-leaflet-marker",
            html: `<div style="background-color: ${markerColor}; width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-size: 10px; font-weight: bold; color: white;">${stop.sequence}</div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          }),
        }).addTo(map);

        stopMarker.on("mouseover", () => {
          setActiveStop(stop);
        });

        markersRef.current.push(stopMarker);
      });
    };

    renderMap();
  }, [isLoading, routeData, points, stops]);

  const handleStopClick = async (stop: RouteStop) => {
    setActiveStop(stop);
    if (mapInstanceRef.current) {
      const L = (await import("leaflet")).default;
      mapInstanceRef.current.setView(L.latLng(Number(stop.latitude), Number(stop.longitude)), 15, {
        animate: true,
        duration: 0.8,
      });
    }
  };

  const handleBulkSubmit = async (type: "points" | "stops") => {
    try {
      const payload = JSON.parse(bulkInput);
      setIsSubmitting(true);
      
      const endpoint = type === "points" 
        ? `${API_URL}/routes/${targetId}/points/bulk` 
        : `${API_URL}/routes/${targetId}/stops/bulk`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan data bulk.");
      }

      alert("Data berhasil disimpan!");
      setBulkInput("");
      setShowPointsModal(false);
      setShowStopsModal(false);
      
      fetchData();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !routeData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mb-4" />
        <p className="text-sm font-semibold">Memuat peta visualisasi rute...</p>
      </div>
    );
  }

  if (!routeData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 p-6">
        <p className="text-lg font-bold text-red-500">Rute tidak ditemukan</p>
        <button
          onClick={() => router.push("/admin/dashboard/route")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
        >
          Kembali ke Rute
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard/route"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 border border-gray-200/60 transition"
          >
            ✕
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-lg font-bold text-xs tracking-wider">
                {routeData.code}
              </span>
              <h1 className="text-xl font-bold text-gray-900 leading-none">{routeData.name}</h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">Live Visualizer Rute Angkot & Titik Koordinat</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <button 
              onClick={() => setShowPointsModal(true)}
              className="text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition"
            >
              + Bulk Points
            </button>
            <button 
              onClick={() => setShowStopsModal(true)}
              className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
            >
              + Bulk Halte
            </button>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Jarak Tempuh</span>
            <span className="text-sm font-bold text-gray-800">{routeData.distanceKm ?? "-"} Km</span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Estimasi Waktu</span>
            <span className="text-sm font-bold text-gray-800">{routeData.estimatedDurationMinutes ?? "-"} Menit</span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status Rute</span>
            <span className={`inline-flex items-center gap-1 text-xs font-bold ${routeData.isActive ? "text-green-600" : "text-amber-600"}`}>
              {routeData.isActive ? "● Aktif" : "● Draft"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Side: Map Visualizer */}
        <div className="flex-1 p-6 flex flex-col justify-between relative overflow-hidden bg-white/40">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-80" />

          <div className="z-10 flex justify-between items-start mb-4 gap-4">
            <div className="bg-white/95 border border-gray-100 rounded-2xl px-4 py-3 shadow-sm backdrop-blur-md flex gap-4 items-center">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Visualisasi Peta Rute</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">Peta interaktif berbasis koordinat OpenStreetMap & Leaflet</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <p className="text-xs font-bold">{points.length}</p>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest">Points</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full bg-white rounded-3xl border border-gray-150 overflow-hidden z-0 relative shadow-sm min-h-[500px]">
            <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: "100%", zIndex: 1 }} />

            {activeStop && (
              <div className="absolute top-4 right-4 bg-white/95 border border-blue-200 rounded-2xl px-4 py-3 max-w-xs shadow-md z-[1000] pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wider">
                  {activeStop.isTerminal ? "🚨 TERMINAL" : "🚌 HALTE"}
                </p>
                <h4 className="text-xs font-bold text-gray-900 mt-0.5">{activeStop.name}</h4>
                <p className="text-[9px] text-gray-500 mt-1">Sequence: Ke-{activeStop.sequence}</p>
                <p className="text-[9px] text-gray-500">Radius Layanan: {activeStop.radiusMeter} Meter</p>
                <p className="text-[8px] text-gray-400 font-mono mt-1">{activeStop.latitude}, {activeStop.longitude}</p>
              </div>
            )}
          </div>

          <div className="z-10 mt-4 flex items-center gap-6 text-[10px] text-gray-500 bg-white/70 border border-gray-100 rounded-xl px-4 py-2 self-start shadow-2xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Titik Halte Umum</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Terminal Utama</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-green-500 inline-block" style={{ backgroundColor: routeData.color }} />
              <span>Garis Jalur Rute (Points)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar Stops */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-150 flex flex-col shadow-sm z-10">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900">Daftar Halte & Terminal</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Rangkaian urutan pemberhentian angkot ({stops.length} Lokasi)</p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4" onMouseLeave={() => setActiveStop(null)}>
            {stops.length === 0 ? (
              <div className="text-gray-400 text-center py-12 text-xs">
                Tidak ada halte yang terdaftar untuk rute ini.
              </div>
            ) : (
              stops
                .sort((a, b) => a.sequence - b.sequence)
                .map((stop) => {
                  const isCurrent = activeStop?.id === stop.id;
                  return (
                    <div
                      key={stop.id}
                      onClick={() => handleStopClick(stop)}
                      onMouseEnter={() => {
                        if (activeStop?.id !== stop.id) setActiveStop(stop);
                      }}
                      className={`relative flex gap-4 p-3 rounded-2xl border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-blue-50/70 border-blue-300 shadow-xs"
                          : "bg-white border-gray-200/60 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          stop.isTerminal 
                            ? "bg-red-50 text-red-500 border border-red-200" 
                            : "bg-blue-50 text-blue-500 border border-blue-200"
                        }`}>
                          {stop.sequence}
                        </div>
                        <div className="w-0.5 flex-1 bg-gray-100 my-2" />
                      </div>

                      <div className="min-w-0">
                        <h4 className={`text-xs font-bold truncate ${isCurrent ? "text-blue-900" : "text-gray-800"}`}>
                          {stop.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-2">
                          <span>Radius: {stop.radiusMeter}m</span>
                          <span>•</span>
                          <span className={stop.isTerminal ? "text-red-500 font-bold" : "text-gray-500"}>
                            {stop.isTerminal ? "Terminal" : "Halte Angkot"}
                          </span>
                        </p>
                        <p className="text-[9px] font-mono text-gray-400 mt-0.5 truncate">
                          {stop.latitude}, {stop.longitude}
                        </p>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Bulk Input Modals */}
      {(showPointsModal || showStopsModal) && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900">
                {showPointsModal ? "Bulk Tambah Route Points" : "Bulk Tambah Halte (Stops)"}
              </h3>
              <button 
                onClick={() => {
                  setShowPointsModal(false);
                  setShowStopsModal(false);
                  setBulkInput("");
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 flex-1">
              <p className="text-xs text-gray-500 mb-3">Paste array JSON di bawah ini. Pastikan format valid sesuai dengan standar API.</p>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                className="w-full h-64 p-4 text-xs font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={showPointsModal ? `[\n  {\n    "sequence": 1,\n    "latitude": -7.9242269,\n    "longitude": 112.6034436\n  }\n]` : `[\n  {\n    "name": "Halte Awal (Maksud)",\n    "sequence": 1,\n    "latitude": -7.9242269,\n    "longitude": 112.6034436,\n    "radiusMeter": 50,\n    "isTerminal": true\n  }\n]`}
              />
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={() => {
                  setShowPointsModal(false);
                  setShowStopsModal(false);
                  setBulkInput("");
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleBulkSubmit(showPointsModal ? "points" : "stops")}
                disabled={isSubmitting || !bulkInput.trim()}
                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition shadow-sm"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
