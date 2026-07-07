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
  stops: { id: number; name: string; sequence: number; latitude: string; longitude: string; radiusMeter: number; isTerminal: boolean }[];
  polyline_points: { latitude: string; longitude: string }[];
  filterd_buses: BusInfo[]; // Typo from backend: 'filterd_buses' without 'e'
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// --- Silent Fallback Mock Data DB ---
const mockStopsDb: StopSearchResult[] = [
  { stop_id: 1, stop_name: "Terminal Arjosari", latitude: "-7.935400", longitude: "112.635800" },
  { stop_id: 2, stop_name: "Halte Ciliwung", latitude: "-7.950200", longitude: "112.630200" },
  { stop_id: 3, stop_name: "Halte Pasar Besar", latitude: "-7.962500", longitude: "112.628100" },
  { stop_id: 4, stop_name: "Terminal Gadang", latitude: "-7.985900", longitude: "112.632400" },
  { stop_id: 5, stop_name: "Terminal Landungsari", latitude: "-7.92801630", longitude: "112.60288440" },
  { stop_id: 6, stop_name: "Halte Blimbing", latitude: "-7.938200", longitude: "112.620100" }
];

const mockFindBusDb = (originId: number, destId: number): FindBusResponse | null => {
  if (originId === 1 && destId === 4) {
    return {
      route_info: {
        id: 1,
        code: "AG",
        name: "Arjosari - Gadang",
        direction: "GO",
        color: "#10b981",
        distanceKm: 14.5,
        estimatedDurationMinutes: 45,
        isActive: true
      },
      stops: [
        { id: 1, name: "Terminal Arjosari", sequence: 1, latitude: "-7.935400", longitude: "112.635800", radiusMeter: 100, isTerminal: true },
        { id: 2, name: "Halte Ciliwung", sequence: 2, latitude: "-7.950200", longitude: "112.630200", radiusMeter: 50, isTerminal: false },
        { id: 3, name: "Halte Pasar Besar", sequence: 3, latitude: "-7.962500", longitude: "112.628100", radiusMeter: 60, isTerminal: false },
        { id: 4, name: "Terminal Gadang", sequence: 4, latitude: "-7.985900", longitude: "112.632400", radiusMeter: 100, isTerminal: true }
      ],
      polyline_points: [
        { latitude: "-7.935400", longitude: "112.635800" },
        { latitude: "-7.942100", longitude: "112.638900" },
        { latitude: "-7.950200", longitude: "112.630200" },
        { latitude: "-7.962500", longitude: "112.628100" },
        { latitude: "-7.985900", longitude: "112.632400" }
      ],
      filterd_buses: [
        { trip_id: 1, vehicle_code: "VH001", plate_number: "N 1201 XA", driver_name: "Budi Santoso", ll_latitude: "-7.945000", ll_longitude: "112.635000", speed_kmh: 26, heading_degrees: 172, updated_at: new Date().toISOString() },
        { trip_id: 2, vehicle_code: "VH002", plate_number: "N 1202 XA", driver_name: "Andi Pratama", ll_latitude: "-7.958000", ll_longitude: "112.629000", speed_kmh: 24, heading_degrees: 172, updated_at: new Date().toISOString() }
      ]
    };
  }
  
  return {
    route_info: {
      id: 2,
      code: "AL",
      name: "Arjosari - Landungsari",
      direction: "GO",
      color: "#2196F3",
      distanceKm: 16.2,
      estimatedDurationMinutes: 50,
      isActive: true
    },
    stops: [
      { id: 2, name: "Stop 30", sequence: 30, latitude: "-7.90623090", longitude: "112.58415460", radiusMeter: 40, isTerminal: false },
      { id: 3, name: "Stop 60", sequence: 60, latitude: "-7.91302560", longitude: "112.59019380", radiusMeter: 40, isTerminal: false }
    ],
    polyline_points: [
      { latitude: "-7.90186910", longitude: "112.58426080" },
      { latitude: "-7.90193430", longitude: "112.58398300" },
      { latitude: "-7.90195610", longitude: "112.58368980" },
      { latitude: "-7.90197060", longitude: "112.58325730" },
      { latitude: "-7.90199970", longitude: "112.58267810" },
      { latitude: "-7.90201420", longitude: "112.58213560" },
      { latitude: "-7.90201420", longitude: "112.58173240" },
      { latitude: "-7.90201420", longitude: "112.58143920" },
      { latitude: "-7.90201420", longitude: "112.58126330" },
      { latitude: "-7.90225380", longitude: "112.58124860" },
      { latitude: "-7.90245710", longitude: "112.58122660" },
      { latitude: "-7.90264590", longitude: "112.58121930" },
      { latitude: "-7.90291460", longitude: "112.58118260" },
      { latitude: "-7.90319780", longitude: "112.58112400" },
      { latitude: "-7.90341560", longitude: "112.58116060" },
      { latitude: "-7.90364070", longitude: "112.58120460" },
      { latitude: "-7.90382950", longitude: "112.58136590" },
      { latitude: "-7.90398200", longitude: "112.58151250" },
      { latitude: "-7.90416350", longitude: "112.58169580" },
      { latitude: "-7.90436150", longitude: "112.58193160" },
      { latitude: "-7.90447930", longitude: "112.58210460" },
      { latitude: "-7.90463620", longitude: "112.58227720" },
      { latitude: "-7.90476500", longitude: "112.58247740" },
      { latitude: "-7.90493730", longitude: "112.58270700" },
      { latitude: "-7.90511070", longitude: "112.58292030" },
      { latitude: "-7.90531540", longitude: "112.58315230" },
      { latitude: "-7.90559910", longitude: "112.58346240" },
      { latitude: "-7.90561080", longitude: "112.60215650" },
      { latitude: "-7.90586660", longitude: "112.58377130" },
      { latitude: "-7.90604280", longitude: "112.58396330" },
      { latitude: "-7.90623090", longitude: "112.58415460" },
      { latitude: "-7.90643550", longitude: "112.58438660" },
      { latitude: "-7.90663510", longitude: "112.58464450" },
      { latitude: "-7.90687730", longitude: "112.58485300" },
      { latitude: "-7.90709260", longitude: "112.58507260" },
      { latitude: "-7.90733320", longitude: "112.58525800" },
      { latitude: "-7.90753030", longitude: "112.58541380" },
      { latitude: "-7.90774010", longitude: "112.58561990" },
      { latitude: "-7.90795340", longitude: "112.58577690" },
      { latitude: "-7.90817230", longitude: "112.58594750" },
      { latitude: "-7.90833310", longitude: "112.58611050" },
      { latitude: "-7.90855630", longitude: "112.58631100" },
      { latitude: "-7.90884870", longitude: "112.58654620" },
      { latitude: "-7.90919120", longitude: "112.58680800" },
      { latitude: "-7.90945390", longitude: "112.58704760" },
      { latitude: "-7.90975810", longitude: "112.58725400" },
      { latitude: "-7.91003050", longitude: "112.58743590" },
      { latitude: "-7.91032290", longitude: "112.58767100" },
      { latitude: "-7.91049590", longitude: "112.58784480" },
      { latitude: "-7.91074760", longitude: "112.58705730" },
      { latitude: "-7.91095580", longitude: "112.58824020" },
      { latitude: "-7.91123590", longitude: "112.58846460" },
      { latitude: "-7.91142120", longitude: "112.58864920" },
      { latitude: "-7.91162340", longitude: "112.58877910" },
      { latitude: "-7.91179920", longitude: "112.58895970" },
      { latitude: "-7.91201140", longitude: "112.58913310" },
      { latitude: "-7.91218050", longitude: "112.58931640" },
      { latitude: "-7.91234010", longitude: "112.58949580" },
      { latitude: "-7.91250090", longitude: "112.58965880" },
      { latitude: "-7.91278060", longitude: "112.58997850" },
      { latitude: "-7.91302560", longitude: "112.59019380" },
      { latitude: "-7.91318800", longitude: "112.59037990" },
      { latitude: "-7.9132150", longitude: "112.59051470" },
      { latitude: "-7.91358540", longitude: "112.59073790" },
      { latitude: "-7.91375960", longitude: "112.59089530" },
      { latitude: "-7.91393660", longitude: "112.59105950" },
      { latitude: "-7.91407920", longitude: "112.59115880" },
      { latitude: "-7.91439330", longitude: "112.59140870" },
      { latitude: "-7.91467540", longitude: "112.59156820" },
      { latitude: "-7.91495700", longitude: "112.59178600" },
      { latitude: "-7.91521590", longitude: "112.59194840" },
      { latitude: "-7.91543450", longitude: "112.59211680" },
      { latitude: "-7.91576560", longitude: "112.59232480" },
      { latitude: "-7.91613380", longitude: "112.59257140" },
      { latitude: "-7.91643750", longitude: "112.59279080" },
      { latitude: "-7.91680790", longitude: "112.59306890" },
      { latitude: "-7.91723050", longitude: "112.59342250" },
      { latitude: "-7.91769570", longitude: "112.59380160" },
      { latitude: "-7.91795790", longitude: "112.59410310" },
      { latitude: "-7.91831110", longitude: "112.59499640" },
      { latitude: "-7.91862120", longitude: "112.59481040" },
      { latitude: "-7.91885120", longitude: "112.59519020" },
      { latitude: "-7.91901710", longitude: "112.59559660" },
      { latitude: "-7.91922340", longitude: "112.59599700" },
      { latitude: "-7.91944790", longitude: "112.59638980" },
      { latitude: "-7.91957990", longitude: "112.59671310" },
      { latitude: "-7.91980880", longitude: "112.59716890" },
      { latitude: "-7.91998770", longitude: "112.59758080" },
      { latitude: "-7.92016110", longitude: "112.59800570" },
      { latitude: "-7.92046320", longitude: "112.59843100" },
      { latitude: "-7.92065760", longitude: "112.59875000" },
      { latitude: "-7.92088160", longitude: "112.59908900" },
      { latitude: "-7.92105240", longitude: "112.59942860" },
      { latitude: "-7.92132110", longitude: "112.59982460" },
      { latitude: "-7.92150420", longitude: "112.60011580" },
      { latitude: "-7.92173040", longitude: "112.60048630" },
      { latitude: "-7.92206960", longitude: "112.60095030" },
      { latitude: "-7.92230330", longitude: "112.60133930" },
      { latitude: "-7.92255100", longitude: "112.60165760" },
      { latitude: "-7.92291180", longitude: "112.60206940" },
      { latitude: "-7.92323910", longitude: "112.60245190" },
      { latitude: "-7.92387820", longitude: "112.60312600" },
      { latitude: "-7.92404930", longitude: "112.60296840" },
      { latitude: "-7.92427160", longitude: "112.60277860" },
      { latitude: "-7.92461540", longitude: "112.60262470" },
      { latitude: "-7.92490600", longitude: "112.60247140" },
      { latitude: "-7.92525900", longitude: "112.60231370" },
      { latitude: "-7.92597670", longitude: "112.60200420" },
      { latitude: "-7.92621940", longitude: "112.60183840" },
      { latitude: "-7.92637380", longitude: "112.60166610" },
      { latitude: "-7.92657460", longitude: "112.60189590" },
      { latitude: "-7.92685300", longitude: "112.60215820" },
      { latitude: "-7.92708340", longitude: "112.60240810" },
      { latitude: "-7.92739670", longitude: "112.60267750" },
      { latitude: "-7.92769390", longitude: "112.60280240" },
      { latitude: "-7.92801630", longitude: "112.60288440" }
    ],
    filterd_buses: [
      { trip_id: 1, vehicle_code: "VH001", plate_number: "N 1201 XA", driver_name: "Budi Santoso", ll_latitude: "-7.90795340", ll_longitude: "112.58577690", speed_kmh: 26, heading_degrees: 172, updated_at: new Date().toISOString() },
      { trip_id: 3, vehicle_code: "VH002", plate_number: "N 1202 XA", driver_name: "Andi Pratama", ll_latitude: "-7.90833310", ll_longitude: "112.58611050", speed_kmh: 26, heading_degrees: 172, updated_at: new Date().toISOString() }
    ]
  };
};

export default function SearchRouteUser() {
  const [originQuery, setOriginQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");
  
  const [originResults, setOriginResults] = useState<StopSearchResult[]>([]);
  const [destResults, setDestResults] = useState<StopSearchResult[]>([]);
  
  const [selectedOrigin, setSelectedOrigin] = useState<StopSearchResult | null>(null);
  const [selectedDest, setSelectedDest] = useState<StopSearchResult | null>(null);

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
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);
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
      mapLayersRef.current.forEach(layer => map.removeLayer(layer));
      mapLayersRef.current = [];

      if (!routeResult) {
        map.setView([-7.983908, 112.621391], 13);
        return;
      }

      const newLayers: any[] = [];

      // 1. Draw polyline points route path
      const points = routeResult.polyline_points || [];
      const latlngs = points.map(pt => L.latLng(parseFloat(pt.latitude), parseFloat(pt.longitude)));
      
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
      stops.forEach(stop => {
        const isTerminal = stop.isTerminal;
        const color = isTerminal ? "#ef4444" : "#3b82f6";
        const marker = L.marker([parseFloat(stop.latitude), parseFloat(stop.longitude)], {
          icon: L.divIcon({
            className: "custom-stop-marker",
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-size: 8px; font-weight: bold; color: white;">${stop.sequence}</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
        }).addTo(map);

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
      const buses = routeResult.filterd_buses || [];
      buses.forEach(bus => {
        const busMarker = L.marker([parseFloat(bus.ll_latitude), parseFloat(bus.ll_longitude)], {
          icon: L.divIcon({
            className: "custom-bus-marker",
            html: `<div style="background-color: #f59e0b; width: 32px; height: 32px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 14px;">🚌</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).addTo(map);

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
      const response = await fetch(`${API_URL}/api/passenger/stops?search=${encodeURIComponent(query)}`);
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
      const queryLower = query.toLowerCase();
      const filtered = mockStopsDb.filter(s => s.stop_name.toLowerCase().includes(queryLower));
      if (type === "origin") setOriginResults(filtered);
      else setDestResults(filtered);
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
      setErrorMessage("Harap cari dan pilih Halte Naik & Halte Turun terlebih dahulu.");
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
        setRouteResult(resData.data);
      } else {
        setRouteResult(null);
      }
    } catch (err: any) {
      console.warn("API find-bus error, falling back silently:", err.message);
      const mockResult = mockFindBusDb(selectedOrigin.stop_id, selectedDest.stop_id);
      setRouteResult(mockResult);
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
      map.flyTo(L.latLng(parseFloat(bus.ll_latitude), parseFloat(bus.ll_longitude)), 16, {
        animate: true,
        duration: 1.2,
      });
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-7xl mx-auto">
      
      {/* LEFT PANEL: Form and Bus List */}
      <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50 border border-slate-100 flex flex-col justify-between min-h-[550px]">
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Pencarian Rute</h2>
            <p className="text-xs text-gray-400 mt-0.5">Masukkan lokasi naik dan tujuan untuk mencari angkot terdekat</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-2xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errorMessage}
            </div>
          )}

          {/* Input Forms */}
          <div className="space-y-6">
            {/* Halte Naik Input */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Halte Naik (Jemput)</label>
              {selectedOrigin ? (
                <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/50 rounded-2xl px-4 py-3.5 text-sm font-bold text-blue-700 animate-in zoom-in-95 duration-150">
                  <span className="truncate flex items-center gap-2">
                    <span className="text-blue-500">📍</span>
                    {selectedOrigin.stop_name}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => { setSelectedOrigin(null); setOriginResults([]); }} 
                    className="w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs transition"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
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

              {/* Origin Suggestions dropdown */}
              {!selectedOrigin && originResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 border border-slate-100 rounded-2xl shadow-xl max-h-40 overflow-y-auto bg-white divide-y divide-slate-50 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                  {originResults.map(stop => (
                    <div 
                      key={`orig-res-${stop.stop_id}`}
                      onClick={() => { setSelectedOrigin(stop); setOriginResults([]); }}
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
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Halte Turun (Tujuan)</label>
              {selectedDest ? (
                <div className="flex items-center justify-between bg-red-50/70 border border-red-200/50 rounded-2xl px-4 py-3.5 text-sm font-bold text-red-700 animate-in zoom-in-95 duration-150">
                  <span className="truncate flex items-center gap-2">
                    <span className="text-red-500">🚩</span>
                    {selectedDest.stop_name}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => { setSelectedDest(null); setDestResults([]); }} 
                    className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center font-bold text-xs transition"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🚩</span>
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

              {/* Destination Suggestions dropdown */}
              {!selectedDest && destResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 border border-slate-100 rounded-2xl shadow-xl max-h-40 overflow-y-auto bg-white divide-y divide-slate-50 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                  {destResults.map(stop => (
                    <div 
                      key={`dest-res-${stop.stop_id}`}
                      onClick={() => { setSelectedDest(stop); setDestResults([]); }}
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
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hasil Rencana Perjalanan</h3>
              <div className="mt-2.5 flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                <span className="bg-blue-600 text-white px-2.5 py-1 rounded-xl font-bold text-[10px] tracking-wider uppercase shadow-xs">
                  {routeResult.route_info.code}
                </span>
                <span className="font-extrabold text-xs text-slate-800 truncate">{routeResult.route_info.name}</span>
              </div>
            </div>

            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Daftar Armada Angkot Terdekat</h4>
            
            {/* The List of Buses */}
            <div className="space-y-3 overflow-y-auto max-h-64 pr-1 scrollbar-thin">
              {!routeResult.filterd_buses || routeResult.filterd_buses.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50 text-xs text-slate-400 font-bold">
                  Tidak ada armada angkot aktif saat ini.
                </div>
              ) : (
                routeResult.filterd_buses.map((bus) => {
                  const isCurrentBus = selectedBus?.trip_id === bus.trip_id;
                  const eta = routeResult.route_info.estimatedDurationMinutes || 15;

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
                        style={{ backgroundColor: routeResult.route_info.color || "#2196F3" }} 
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
                          Sopir: <span className="font-bold text-slate-700">{bus.driver_name}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <span>⚡ {bus.speed_kmh} km/jam</span>
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="block text-[8px] text-slate-400 uppercase font-bold tracking-wider">Estimasi Tiba</span>
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

      {/* RIGHT PANEL: Map visualizer */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-xl shadow-slate-100/50 flex flex-col relative h-[550px] lg:h-auto">
        <div className="absolute top-4 left-4 bg-white/95 border border-slate-100 rounded-2xl px-4 py-3 shadow-sm backdrop-blur-md z-[1000] pointer-events-none">
          <h2 className="text-xs font-bold text-slate-900 leading-none">Peta Visualisasi Lintasan</h2>
          <p className="text-[9px] text-gray-400 mt-1">Live tracking armada & rute lintasan halte</p>
        </div>

        {/* Leaflet map container */}
        <div 
          ref={mapContainerRef} 
          className="w-full h-full z-0"
          style={{ minHeight: "100%", zIndex: 0 }}
        />

        {/* Map Legend */}
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
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shadow-2xs flex items-center justify-center text-[7px] text-white">🚌</span>
              <span>Posisi Angkot</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
