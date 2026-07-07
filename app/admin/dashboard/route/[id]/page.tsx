"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// --- Types ---
interface RoutePoint {
  id: number;
  sequence: number;
  latitude: number;
  longitude: number;
}

interface RouteStop {
  id: number;
  name: string;
  sequence: number;
  latitude: number;
  longitude: number;
  radiusMeter: number;
  isTerminal: boolean;
}

interface Route {
  id: number;
  code: string;
  name: string;
  direction: "GO" | "RETURN";
  color: string;
  distanceKm: number;
  estimatedDurationMinutes: number;
  isActive: boolean;
  points: RoutePoint[];
  stops: RouteStop[];
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// --- Mock Data Fallback ---
const mockRoutes: Route[] = [
  {
    id: 1,
    code: "AG",
    name: "Arjosari – Gadang",
    direction: "GO",
    color: "#10b981", // emerald green
    distanceKm: 14.50,
    estimatedDurationMinutes: 45,
    isActive: true,
    points: [
      { id: 1, sequence: 1, latitude: -7.935400, longitude: 112.635800 },
      { id: 2, sequence: 2, latitude: -7.942100, longitude: 112.638900 },
      { id: 3, sequence: 3, latitude: -7.950200, longitude: 112.630200 },
      { id: 4, sequence: 4, latitude: -7.962500, longitude: 112.628100 },
      { id: 5, sequence: 5, latitude: -7.985900, longitude: 112.632400 },
    ],
    stops: [
      { id: 1, name: "Terminal Arjosari (Titik Awal)", sequence: 1, latitude: -7.935400, longitude: 112.635800, radiusMeter: 100, isTerminal: true },
      { id: 2, name: "Halte Ciliwung", sequence: 2, latitude: -7.950200, longitude: 112.630200, radiusMeter: 50, isTerminal: false },
      { id: 3, name: "Halte Pasar Besar", sequence: 3, latitude: -7.962500, longitude: 112.628100, radiusMeter: 60, isTerminal: false },
      { id: 4, name: "Terminal Gadang (Titik Akhir)", sequence: 4, latitude: -7.985900, longitude: 112.632400, radiusMeter: 100, isTerminal: true },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    code: "AL",
    name: "Arjosari – Landungsari",
    direction: "RETURN",
    color: "#3b82f6", // blue
    distanceKm: 16.20,
    estimatedDurationMinutes: 50,
    isActive: true,
    points: [
      { id: 6, sequence: 1, latitude: -7.935400, longitude: 112.635800 },
      { id: 7, sequence: 2, latitude: -7.938200, longitude: 112.620100 },
      { id: 8, sequence: 3, latitude: -7.945100, longitude: 112.605300 },
      { id: 9, sequence: 4, latitude: -7.952900, longitude: 112.592100 },
    ],
    stops: [
      { id: 5, name: "Terminal Arjosari (Titik Awal)", sequence: 1, latitude: -7.935400, longitude: 112.635800, radiusMeter: 100, isTerminal: true },
      { id: 6, name: "Halte Blimbing", sequence: 2, latitude: -7.938200, longitude: 112.620100, radiusMeter: 60, isTerminal: false },
      { id: 7, name: "Terminal Landungsari (Titik Akhir)", sequence: 3, latitude: -7.952900, longitude: 112.592100, radiusMeter: 100, isTerminal: true },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    code: "ADL",
    name: "Arjosari – Dinoyo – Landungsari",
    direction: "GO",
    color: "#8b5cf6", // purple
    distanceKm: 18.00,
    estimatedDurationMinutes: 60,
    isActive: false,
    points: [],
    stops: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [routeData, setRouteData] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStop, setActiveStop] = useState<RouteStop | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Fetch route details
  useEffect(() => {
    const fetchRouteDetail = async () => {
      setIsLoading(true);
      const targetId = parseInt(params.id as string) || 0;
      try {
        const response = await fetch(`${API_URL}/admin/dashboard/route`);
        if (!response.ok) {
          throw new Error("Gagal load API");
        }
        const data = await response.json();
        const found = data.find((r: Route) => r.id === targetId);
        setRouteData(found || null);
      } catch (err) {
        console.warn("Menggunakan data simulasi lokal (Demo Mode).");
        const foundMock = mockRoutes.find((r) => r.id === targetId);
        setRouteData(foundMock || null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRouteDetail();
  }, [params.id]);

  // Load Leaflet and initialize map on client side only
  useEffect(() => {
    if (isLoading || !routeData || !mapContainerRef.current) return;

    // 1. Inject Leaflet CSS stylesheet dynamically
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    let map: any = null;

    // 2. Load Leaflet package dynamically
    const initMap = async () => {
      const L = (await import("leaflet")).default;

      const points = routeData.points || [];
      const stops = routeData.stops || [];

      // Determine default coordinates
      let centerLat = -7.983908;
      let centerLng = 112.621391; // Malang default
      if (points.length > 0) {
        centerLat = Number(points[0].latitude);
        centerLng = Number(points[0].longitude);
      }

      // Initialize map instance
      map = L.map(mapContainerRef.current!).setView([centerLat, centerLng], 13);
      mapInstanceRef.current = map;

      // Add CartoDB Positron clean map tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      // Draw polyline route path
      const latlngs = points.map(p => L.latLng(Number(p.latitude), Number(p.longitude)));
      if (latlngs.length > 0) {
        const pathLine = L.polyline(latlngs, {
          color: routeData.color || "#10b981",
          weight: 4.5,
          opacity: 0.85,
        }).addTo(map);

        // Auto zoom & fits bounds
        map.fitBounds(pathLine.getBounds(), { padding: [50, 50] });
      }

      // Draw stop markers
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

        // Wire mouse-hover actions to update details overlay
        stopMarker.on("mouseover", () => {
          setActiveStop(stop);
        });
      });
    };

    initMap();

    // Clean up map instance on component unmount
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [isLoading, routeData]);

  // Handler to center map on clicked sidebar stop
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

  if (isLoading) {
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

  const stops = routeData.stops || [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      
      {/* Clean & Bright Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm z-10">
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

        {/* Stats Summary */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Jarak Tempuh</span>
            <span className="text-sm font-bold text-gray-800">{routeData.distanceKm} Km</span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Estimasi Waktu</span>
            <span className="text-sm font-bold text-gray-800">{routeData.estimatedDurationMinutes} Menit</span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status Rute</span>
            <span className={`inline-flex items-center gap-1 text-xs font-bold ${routeData.isActive ? "text-green-600" : "text-amber-600"}`}>
              {routeData.isActive ? "● Aktif" : "● Draft"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Side: Map Visualizer */}
        <div className="flex-1 p-6 flex flex-col justify-between relative overflow-hidden bg-white/40">
          
          {/* Subtle light grid background overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-80" />

          {/* Heading info */}
          <div className="z-10 flex justify-between items-start mb-4 gap-4">
            <div className="bg-white/95 border border-gray-100 rounded-2xl px-4 py-3 shadow-sm backdrop-blur-md">
              <h2 className="text-sm font-bold text-gray-900">Visualisasi Peta Rute</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">Peta interaktif berbasis koordinat OpenStreetMap & Leaflet</p>
            </div>
          </div>

          {/* Leaflet Dynamic Geographic Map Canvas */}
          <div className="flex-1 w-full bg-white rounded-3xl border border-gray-150 overflow-hidden z-0 relative shadow-sm min-h-[500px]">
            
            {/* The Map Mount Point */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-full"
              style={{ minHeight: "100%", zIndex: 1 }}
            />

            {/* Tooltip Overlay placed INSIDE the map visualization container */}
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

          {/* Foot note / Legend */}
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

        {/* Right Side: Sidebar Stops Sequence */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-150 flex flex-col shadow-sm z-10">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900">Daftar Halte & Terminal</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Rangkaian urutan pemberhentian angkot ({stops.length} Lokasi)</p>
          </div>

          <div 
            className="flex-1 overflow-y-auto p-5 space-y-4"
            onMouseLeave={() => setActiveStop(null)}
          >
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
                        if (activeStop?.id !== stop.id) {
                          setActiveStop(stop);
                        }
                      }}
                      className={`relative flex gap-4 p-3 rounded-2xl border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-blue-50/70 border-blue-300 shadow-xs"
                          : "bg-white border-gray-200/60 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      {/* Sequence indicator timeline bullet */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          stop.isTerminal 
                            ? "bg-red-50 text-red-500 border border-red-200" 
                            : "bg-blue-50 text-blue-500 border border-blue-200"
                        }`}>
                          {stop.sequence}
                        </div>
                        {/* Connecting timeline stem */}
                        <div className="w-0.5 flex-1 bg-gray-100 my-2" />
                      </div>

                      {/* Info details */}
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
    </div>
  );
}
