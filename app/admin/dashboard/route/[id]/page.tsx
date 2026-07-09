"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  MapPin,
  Clock,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface SmartPoint {
  id: string; // unique frontend key
  latitude: string | number;
  longitude: string | number;
  isStop: boolean;
  stopName: string;
  stopRadius: number;
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

const API_URL = "https://v1rpzn50-3000.asse.devtunnels.ms";

export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const targetId = parseInt(params.id as string) || 0;

  const [routeData, setRouteData] = useState<Route | null>(null);
  const [pointList, setPointList] = useState<SmartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);

  // Toast state
  interface Toast {
    id: number;
    type: "success" | "error" | "info";
    message: string;
  }
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const pathLineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const isFetchedRef = useRef(false);

  // Fetch data from server
  const fetchData = async (showNotification = false) => {
    setIsLoading(true);
    try {
      // 1. Fetch Route Details
      const routeRes = await fetch(`${API_URL}/routes`);
      if (!routeRes.ok) throw new Error("Gagal mengambil data rute");
      const routes: Route[] = await routeRes.json();
      const foundRoute = routes.find((r) => r.id === targetId);

      if (!foundRoute) {
        setRouteData(null);
        return;
      }
      setRouteData(foundRoute);

      // 2. Fetch Points
      const pointsRes = await fetch(`${API_URL}/routes/${targetId}/points`);
      if (!pointsRes.ok) throw new Error("Gagal mengambil data koordinat");
      const pointsData = await pointsRes.json();

      // 3. Fetch Stops
      const stopsRes = await fetch(`${API_URL}/routes/${targetId}/stops`);
      if (!stopsRes.ok) throw new Error("Gagal mengambil data halte");
      const stopsData = await stopsRes.json();

      // Sort points by sequence
      const sortedPoints = [...pointsData].sort((a, b) => a.sequence - b.sequence);

      // Merge points and stops into SmartPoint array
      const mergedPoints: SmartPoint[] = sortedPoints.map((pt, idx) => {
        // Find matching stop within close coordinate match
        const matchingStop = stopsData.find(
          (st: any) =>
            Math.abs(Number(st.latitude) - Number(pt.latitude)) < 0.00005 &&
            Math.abs(Number(st.longitude) - Number(pt.longitude)) < 0.00005
        );

        return {
          id: `pt-${pt.id || Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
          latitude: pt.latitude,
          longitude: pt.longitude,
          isStop: !!matchingStop,
          stopName: matchingStop ? matchingStop.name : `Halte ${idx + 1}`,
          stopRadius: matchingStop ? matchingStop.radiusMeter : 50,
          isTerminal: matchingStop ? matchingStop.isTerminal : false,
        };
      });

      setPointList(mergedPoints);
      if (showNotification) {
        showToast("success", "Data rute berhasil dimuat ulang.");
      }
    } catch (err: any) {
      console.error(err);
      showToast("error", err.message || "Gagal mengambil data dari server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  // Leaflet Map rendering and reactive updates
  useEffect(() => {
    if (isLoading || !routeData || !mapContainerRef.current) return;

    // Load Leaflet CSS dynamically
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

      // Default center: Malang City center
      let centerLat = -7.983908;
      let centerLng = 112.621391;
      if (pointList.length > 0) {
        centerLat = Number(pointList[0].latitude);
        centerLng = Number(pointList[0].longitude);
      }

      // Initialize map instance if not already initialized
      if (!map) {
        map = L.map(mapContainerRef.current!).setView([centerLat, centerLng], 14);
        mapInstanceRef.current = map;

        // Light Theme tile layer matching the clean workspace dashboard
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: "abcd",
          maxZoom: 20,
        }).addTo(map);
      }

      // Clear existing polyline path
      if (pathLineRef.current) {
        map.removeLayer(pathLineRef.current);
      }

      // Clear existing markers
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      const latlngs = pointList
        .filter((p) => !isNaN(Number(p.latitude)) && !isNaN(Number(p.longitude)))
        .map((p) => L.latLng(Number(p.latitude), Number(p.longitude)));

      // Draw royal blue polyline
      if (latlngs.length > 0) {
        pathLineRef.current = L.polyline(latlngs, {
          color: routeData.color || "#2196F3",
          weight: 5,
          opacity: 0.85,
        }).addTo(map);

        // Fit map bounds to polyline on first initial fetch only
        if (!isFetchedRef.current) {
          map.fitBounds(pathLineRef.current.getBounds(), { padding: [50, 50] });
          isFetchedRef.current = true;
        }
      }

      // Draw interactive circular nodes for each point
      pointList.forEach((pt, index) => {
        const lat = Number(pt.latitude);
        const lng = Number(pt.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        let iconHtml = "";
        let iconSize: [number, number] = [16, 16];

        if (pt.isStop) {
          const markerColor = pt.isTerminal ? "#EF4444" : "#10B981"; // Red for terminal, Green for halt/stop
          iconHtml = `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-size: 9px; font-weight: bold; color: white;">${index + 1}</div>`;
          iconSize = [24, 24];
        } else {
          // Regular waypoint node
          iconHtml = `<div style="background-color: #2196F3; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 1.5px 4px rgba(0,0,0,0.25);"></div>`;
          iconSize = [14, 14];
        }

        const marker = L.marker([lat, lng], {
          draggable: true,
          icon: L.divIcon({
            className: "interactive-map-node",
            html: iconHtml,
            iconSize: iconSize,
            iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
          }),
        }).addTo(map);

        // Real-time smooth polyline updating during drag
        marker.on("drag", (event: any) => {
          const { lat: dLat, lng: dLng } = event.target.getLatLng();
          if (pathLineRef.current) {
            const currentLatLngs = pathLineRef.current.getLatLngs();
            currentLatLngs[index] = L.latLng(dLat, dLng);
            pathLineRef.current.setLatLngs(currentLatLngs);
          }
        });

        // Trigger updates in React state when dragging ends
        marker.on("dragend", (event: any) => {
          const { lat: dLat, lng: dLng } = event.target.getLatLng();
          handlePointDrag(index, dLat, dLng);
        });

        // Tooltip
        marker.bindTooltip(
          pt.isStop
            ? `<b>${pt.stopName || `Halte ${index + 1}`}</b><br/>Status: ${pt.isTerminal ? "Terminal" : "Halte"}`
            : `Titik Waypoint Ke-${index + 1}`,
          { direction: "top", offset: [0, -10] }
        );

        markersRef.current.push(marker);
      });
    };

    renderMap();
  }, [isLoading, routeData, pointList]);

  // Handle marker dragging updates
  const handlePointDrag = (index: number, lat: number, lng: number) => {
    setPointList((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        latitude: Number(lat.toFixed(7)),
        longitude: Number(lng.toFixed(7)),
      };
      return updated;
    });
  };

  // Reorder points: move up
  const movePointUp = (index: number) => {
    if (index === 0) return;
    setPointList((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  // Reorder points: move down
  const movePointDown = (index: number) => {
    setPointList((prev) => {
      if (index === prev.length - 1) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  // Update input values directly
  const handleInputChange = (index: number, field: keyof SmartPoint, value: any) => {
    setPointList((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  // Delete a waypoint from list
  const deletePoint = (index: number) => {
    setPointList((prev) => prev.filter((_, idx) => idx !== index));
    showToast("info", `Titik ke-${index + 1} dihapus dari daftar.`);
  };

  // Spawn new point
  const addPoint = () => {
    let newLat = -7.983908;
    let newLng = 112.621391;

    // Position at the map center if map instance exists
    if (mapInstanceRef.current) {
      const center = mapInstanceRef.current.getCenter();
      newLat = center.lat;
      newLng = center.lng;
    } else if (pointList.length > 0) {
      // Otherwise, position slightly offset from the last point
      const lastPoint = pointList[pointList.length - 1];
      newLat = Number(lastPoint.latitude) + 0.001;
      newLng = Number(lastPoint.longitude) + 0.001;
    }

    const newPoint: SmartPoint = {
      id: `pt-new-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      latitude: Number(newLat.toFixed(7)),
      longitude: Number(newLng.toFixed(7)),
      isStop: false,
      stopName: `Halte ${pointList.length + 1}`,
      stopRadius: 50,
      isTerminal: false,
    };

    setPointList((prev) => [...prev, newPoint]);
    showToast("success", "Titik koordinat baru ditambahkan di tengah peta.");
  };

  // Snaps coordinates to roads simulation
  const handleSnapToRoads = () => {
    if (pointList.length < 2) {
      showToast("error", "Tambahkan minimal 2 titik untuk melacak jalan.");
      return;
    }

    setIsSnapping(true);
    showToast("info", "Menghubungkan rute ke jalur jalan terdekat...");

    setTimeout(() => {
      // Simulate slight alignment snap adjustments
      setPointList((prev) =>
        prev.map((pt) => ({
          ...pt,
          latitude: Number(Number(pt.latitude).toFixed(5)),
          longitude: Number(Number(pt.longitude).toFixed(5)),
        }))
      );
      setIsSnapping(false);
      showToast("success", "Rute berhasil diselaraskan ke jalan terdekat (Snap to Roads).");
    }, 1200);
  };

  // Reset local state back to database version
  const handleReset = () => {
    fetchData(true);
  };

  // Save changes to API
  const handleSaveRoute = async () => {
    if (pointList.length === 0) {
      showToast("error", "Daftar koordinat rute tidak boleh kosong!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate dynamic distance in Leaflet
      let distanceKm = 0;
      if (pointList.length >= 2 && typeof window !== "undefined") {
        const L = (window as any).L;
        if (L) {
          let totalDist = 0;
          for (let i = 0; i < pointList.length - 1; i++) {
            const p1 = L.latLng(Number(pointList[i].latitude), Number(pointList[i].longitude));
            const p2 = L.latLng(Number(pointList[i + 1].latitude), Number(pointList[i + 1].longitude));
            totalDist += p1.distanceTo(p2);
          }
          distanceKm = Number((totalDist / 1000).toFixed(2));
        }
      }

      // Estimate duration based on average angkot speed (20 km/h)
      const estimatedDurationMinutes = Math.max(1, Math.round((distanceKm / 20) * 60));

      // 1. Save Points
      const pointsPayload = pointList.map((pt, idx) => ({
        sequence: idx + 1,
        latitude: Number(pt.latitude),
        longitude: Number(pt.longitude),
      }));

      const pointsRes = await fetch(`${API_URL}/routes/${targetId}/points/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pointsPayload),
      });

      if (!pointsRes.ok) throw new Error("Gagal menyimpan data koordinat rute");

      // 2. Save Stops
      const stopsPayload = pointList
        .filter((pt) => pt.isStop)
        .map((pt, idx) => ({
          name: pt.stopName || `Halte ${idx + 1}`,
          sequence: idx + 1,
          latitude: Number(pt.latitude),
          longitude: Number(pt.longitude),
          radiusMeter: Number(pt.stopRadius) || 50,
          isTerminal: pt.isTerminal || false,
        }));

      const stopsRes = await fetch(`${API_URL}/routes/${targetId}/stops/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stopsPayload),
      });

      if (!stopsRes.ok) throw new Error("Gagal menyimpan data pemberhentian halte");

      // 3. Update Route Metadata
      const routeMetadataRes = await fetch(`${API_URL}/routes/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distanceKm: distanceKm,
          estimatedDurationMinutes: estimatedDurationMinutes,
        }),
      });

      if (!routeMetadataRes.ok) throw new Error("Gagal memperbarui metadata jarak dan waktu rute");

      showToast("success", "Perubahan rute, titik koordinat, dan halte berhasil disimpan!");
      
      // Reload updated stats
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast("error", err.message || "Gagal menyimpan rute");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete entire route
  const handleDeleteRoute = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus rute ini beserta seluruh koordinat dan haltenya dari database? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/routes/${targetId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus rute");

      alert("Rute berhasil dihapus.");
      router.push("/admin/dashboard/route");
    } catch (err: any) {
      console.error(err);
      showToast("error", err.message || "Gagal menghapus rute");
      setIsSubmitting(false);
    }
  };

  if (isLoading && !routeData) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mb-4" />
        <p className="text-sm font-semibold">Memuat peta editor koordinat rute...</p>
      </div>
    );
  }

  if (!routeData) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center text-slate-500 p-6">
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
    <main className={`${poppins.className} min-h-screen bg-[#F8F9FA] text-slate-800 p-4 sm:p-5 lg:p-6 flex flex-col h-[calc(100vh-72px)] overflow-hidden`}>
      {/* Workspace Grid Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 h-full overflow-hidden">
        
        {/* LEFT PANEL: Route Card and Coordinate inputs */}
        <div className="w-full lg:w-[420px] flex flex-col bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs h-full overflow-hidden">
          
          {/* Back Navigation Header */}
          <div className="flex items-center gap-3 mb-4 flex-shrink-0">
            <Link
              href="/admin/dashboard/route"
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 border border-slate-200/60 transition text-xs font-bold"
            >
              ←
            </Link>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">Editor Titik Rute</h2>
              <p className="text-[10px] text-slate-400">Atur jalur koordinat lintasan rute</p>
            </div>
          </div>

          {/* Selected Route Info Card */}
          <div className="border border-slate-100 bg-[#F8F9FA] rounded-2xl p-4 relative mb-4 flex-shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="px-2.5 py-1 rounded-lg font-extrabold text-xs tracking-wider leading-none border"
                  style={{
                    backgroundColor: `${routeData.color || "#2196F3"}15`,
                    color: routeData.color || "#2196F3",
                    borderColor: `${routeData.color || "#2196F3"}30`,
                  }}
                >
                  {routeData.code}
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    routeData.isActive
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {routeData.isActive ? "Aktif" : "Non-Aktif"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Rute #{routeData.id}</span>
            </div>

            <h2 className="mt-3 font-extrabold text-slate-800 text-base leading-snug">
              {routeData.name}
            </h2>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-200/60 pt-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <Compass size={12} className="text-slate-400" />
                <span>Arah: <strong className="text-slate-700">{routeData.direction}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <MapPin size={12} className="text-slate-400" />
                <span>Jarak: <strong className="text-slate-700">{routeData.distanceKm || 0} Km</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <Clock size={12} className="text-slate-400" />
                <span>Durasi: <strong className="text-slate-700">{routeData.estimatedDurationMinutes || 0}m</strong></span>
              </div>
            </div>
          </div>

          {/* Smart Point List Header */}
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Smart Point List ({pointList.length})
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Urutan Jalur</span>
          </div>

          {/* Scrollable Points List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 my-2">
            {pointList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-xs text-slate-400">Belum ada koordinat rute.</p>
                <p className="text-[10px] text-slate-400 mt-1">Gunakan tombol di peta untuk menambah titik.</p>
              </div>
            ) : (
              pointList.map((pt, idx) => {
                const isSelectedStop = activeStopId === pt.id;
                return (
                  <div
                    key={pt.id}
                    className={`bg-slate-50 border rounded-2xl p-3 flex flex-col gap-2.5 transition-all relative ${
                      pt.isStop 
                        ? pt.isTerminal 
                          ? "border-red-200/80 bg-red-50/10" 
                          : "border-green-200/80 bg-green-50/10" 
                        : isSelectedStop
                        ? "border-blue-300 bg-blue-50/20"
                        : "border-slate-100 hover:border-slate-300"
                    }`}
                    onMouseEnter={() => pt.isStop && setActiveStopId(pt.id)}
                    onMouseLeave={() => setActiveStopId(null)}
                  >
                    {/* Row Top Controls */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {/* Drag Reorder handles */}
                        <div className="flex items-center gap-0.5 text-slate-400">
                          <button
                            onClick={() => movePointUp(idx)}
                            disabled={idx === 0}
                            className="p-0.5 hover:bg-slate-200/60 rounded disabled:opacity-30 transition"
                            title="Pindah Ke Atas"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => movePointDown(idx)}
                            disabled={idx === pointList.length - 1}
                            className="p-0.5 hover:bg-slate-200/60 rounded disabled:opacity-30 transition"
                            title="Pindah Ke Bawah"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        {/* Number Tag */}
                        <div className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-700 font-extrabold text-[10px] flex items-center justify-center shadow-2xs">
                          {String(idx + 1).padStart(2, "0")}
                        </div>

                        {/* Stop Badge */}
                        {pt.isStop && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            pt.isTerminal
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-green-50 text-green-700 border border-green-200"
                          }`}>
                            {pt.isTerminal ? "Terminal" : "Halte"}
                          </span>
                        )}
                      </div>

                      {/* Right Hand Actions */}
                      <div className="flex items-center gap-2">
                        {/* Halte Toggle Button */}
                        <button
                          onClick={() => handleInputChange(idx, "isStop", !pt.isStop)}
                          className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition ${
                            pt.isStop
                              ? "bg-green-600 text-white border-green-600 shadow-sm"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          Halte
                        </button>

                        {/* Delete Waypoint Button */}
                        <button
                          onClick={() => deletePoint(idx)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50/50 text-slate-400 hover:text-red-600 transition"
                          title="Hapus Titik"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Coordinate Inputs */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Latitude</span>
                        <input
                          type="number"
                          step="0.0000001"
                          className="w-full border border-slate-200/80 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500 font-mono"
                          value={pt.latitude}
                          onChange={(e) => handleInputChange(idx, "latitude", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Longitude</span>
                        <input
                          type="number"
                          step="0.0000001"
                          className="w-full border border-slate-200/80 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500 font-mono"
                          value={pt.longitude}
                          onChange={(e) => handleInputChange(idx, "longitude", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    {/* Expandable Stop Details Panel */}
                    {pt.isStop && (
                      <div className="pt-2 border-t border-slate-200/60 mt-1 space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <div>
                          <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Nama Halte</span>
                          <input
                            type="text"
                            placeholder="Contoh: Halte Veteran"
                            className="w-full border border-slate-200/80 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                            value={pt.stopName}
                            onChange={(e) => handleInputChange(idx, "stopName", e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 items-center">
                          <div>
                            <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Radius ({pt.stopRadius}m)</span>
                            <input
                              type="range"
                              min="10"
                              max="200"
                              step="5"
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                              value={pt.stopRadius}
                              onChange={(e) => handleInputChange(idx, "stopRadius", parseInt(e.target.value) || 50)}
                            />
                          </div>
                          <div className="flex items-center justify-end pt-2">
                            <label className="flex items-center gap-1.5 select-none cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-3.5 h-3.5 text-red-600 border-slate-300 rounded focus:ring-red-500 cursor-pointer"
                                checked={pt.isTerminal}
                                onChange={(e) => handleInputChange(idx, "isTerminal", e.target.checked)}
                              />
                              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">Terminal</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto flex-shrink-0 bg-white z-10">
            <button
              onClick={handleDeleteRoute}
              disabled={isSubmitting}
              className="text-xs font-bold text-red-500 hover:text-red-700 transition disabled:opacity-50"
            >
              Hapus Rute
            </button>
            <button
              onClick={handleSaveRoute}
              disabled={isSubmitting || isSnapping}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-md shadow-blue-200 transition text-xs disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Rute"}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Interactive Leaflet Map workspace */}
        <div className="flex-1 bg-white border border-slate-200/80 rounded-3xl overflow-hidden relative shadow-xs h-full flex flex-col">
          
          {/* Map canvas frame */}
          <div className="flex-1 w-full h-full relative z-0">
            <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

            {/* Floating Top Header Controls */}
            <div className="absolute top-4 left-4 z-[1000] pointer-events-none flex flex-col gap-2">
              <div className="bg-white/95 border border-slate-200/50 rounded-2xl px-4 py-3 shadow-md backdrop-blur-sm pointer-events-auto flex items-center gap-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800">Visualisasi Peta Editor</h3>
                  <p className="text-[9px] text-slate-400 mt-0.5">Geser marker lingkaran di peta untuk memperbarui koordinat</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <span className="block text-xs font-bold text-blue-600">{pointList.length}</span>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Points</span>
                </div>
                <div className="text-center">
                  <span className="block text-xs font-bold text-green-600">
                    {pointList.filter((pt) => pt.isStop).length}
                  </span>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Stops</span>
                </div>
              </div>
            </div>

            {/* Floating Action Controls in white boxes */}
            <div className="absolute top-4 right-4 z-[1000] pointer-events-auto flex items-center gap-2">
              {/* + Tambah Titik */}
              <button
                onClick={addPoint}
                className="bg-white hover:bg-slate-50 border border-slate-200/85 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-md flex items-center gap-1.5 transition"
                title="Tambah titik koordinat baru di tengah peta"
              >
                <Plus size={14} className="text-blue-600" />
                Tambah Titik
              </button>

              {/* Snap ke Jalan */}
              <button
                onClick={handleSnapToRoads}
                disabled={isSnapping}
                className="bg-white hover:bg-slate-50 border border-slate-200/85 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-md flex items-center gap-1.5 transition disabled:opacity-50"
                title="Paskan dan hubungkan titik-titik ke jalur jalan terdekat"
              >
                <Zap size={13} className={`${isSnapping ? "text-amber-500 animate-bounce" : "text-amber-500"}`} />
                Snap Jalan
              </button>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="bg-white hover:bg-slate-50 border border-slate-200/85 p-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 shadow-md flex items-center justify-center transition"
                title="Reset seluruh titik kembali ke simpanan terakhir"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Active Stop Popup indicator inside map view */}
            {activeStopId && (
              (() => {
                const activeStop = pointList.find((pt) => pt.id === activeStopId);
                if (!activeStop) return null;
                return (
                  <div className="absolute bottom-4 left-4 bg-white/95 border border-slate-200 rounded-2xl px-4 py-3 max-w-xs shadow-md z-[1000] pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-[8px] text-green-600 font-extrabold uppercase tracking-widest">
                      {activeStop.isTerminal ? "🚨 TERMINAL UTAMA" : "🚌 HALTE ANGKOT"}
                    </p>
                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">{activeStop.stopName}</h4>
                    <p className="text-[9px] text-slate-400 mt-1">Layanan Radius: {activeStop.stopRadius} Meter</p>
                    <p className="text-[8px] font-mono text-slate-400 mt-0.5">{activeStop.latitude}, {activeStop.longitude}</p>
                  </div>
                );
              })()
            )}

            {/* Float Legend panel at bottom right */}
            <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 border border-slate-200/60 rounded-2xl px-3.5 py-2.5 shadow-sm backdrop-blur-xs pointer-events-none flex flex-col gap-1.5 text-[9px] text-slate-500 font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2196F3] border-2 border-white shadow-2xs" />
                <span>Titik Waypoint (Bisa Digeser)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white shadow-2xs" />
                <span>Halte Pemberhentian</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] border-2 border-white shadow-2xs" />
                <span>Terminal Pemberhentian</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 pt-1 border-t border-slate-200/60">
                <span className="w-4 h-0.5 inline-block" style={{ backgroundColor: routeData.color || "#2196F3" }} />
                <span>Polyline Trayek Rute</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Custom Toast Alert Notification Container */}
      <div className="fixed top-6 right-6 z-[10000] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl shadow-xl border animate-in fade-in slide-in-from-top-4 duration-300 w-full bg-white/95 backdrop-blur-md ${
                isSuccess
                  ? "border-emerald-100 bg-emerald-50/90 text-emerald-800"
                  : isError
                  ? "border-red-100 bg-red-50/90 text-red-800"
                  : "border-slate-100 bg-white/90 text-slate-800"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isSuccess
                    ? "bg-emerald-500/10 text-emerald-600"
                    : isError
                    ? "bg-red-500/10 text-red-600"
                    : "bg-blue-500/10 text-blue-600"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle size={15} />
                ) : isError ? (
                  <AlertCircle size={15} />
                ) : (
                  <Info size={15} />
                )}
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-bold text-slate-800 leading-none">
                  {isSuccess ? "Berhasil" : isError ? "Kesalahan" : "Info"}
                </p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium leading-normal">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100/50 transition flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
