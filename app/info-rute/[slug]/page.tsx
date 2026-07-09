"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FaArrowLeft, FaInfoCircle } from "react-icons/fa";
import "leaflet/dist/leaflet.css";
// ==================== LEAFLET IMPORTS ====================
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
// ==================== DYNAMIC LEAFLET MAP ====================
const RouteMap = dynamic(() => Promise.resolve(InnerRouteMap), { ssr: false });

// ==================== INTERFACES ====================
interface RouteInfo {
  id: number;
  code: string;
  name: string;
  direction: "GO" | "BACK";
  color: string;
}

interface StopData {
  id: number;
  name: string;
  sequence: number;
  latitude: string;
  longitude: string;
  radiusMeter: number;
  isTerminal: boolean;
}

interface PointData {
  id: number;
  sequence: number;
  latitude: string;
  longitude: string;
}

// ==================== INNER MAP COMPONENT ====================
function InnerRouteMap({ points = [], stops = [], routeColor }: any) {
  const safePoints = Array.isArray(points) ? points : [];
  const safeStops = Array.isArray(stops) ? stops : [];

  const defaultCenter: [number, number] = [-7.983, 112.621];

  const polylinePositions: [number, number][] = safePoints
    .filter((p: any) => p?.latitude && p?.longitude)
    .map((p: any) => [parseFloat(p.latitude), parseFloat(p.longitude)]);

  // Custom Icons
  const createTerminalIcon = (name: string) =>
    L.divIcon({
      className: "",
      html: `
      <div style="
        display:flex;
        flex-direction:column;
        align-items:center;
      ">

        <div style="
          background:#DC2626;
          color:white;
          padding:4px 10px;
          border-radius:999px;
          font-size:11px;
          font-weight:700;
          white-space:nowrap;
          margin-bottom:4px;
          box-shadow:0 2px 8px rgba(0,0,0,.25);
        ">
          ${name}
        </div>

        <img
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
          style="width:25px;height:41px;"
        />
      </div>
    `,
      iconSize: [140, 65],
      iconAnchor: [70, 65],
      popupAnchor: [0, -40],
    });

  const createStopIcon = (sequence: number) =>
    (window as any).L.divIcon({
      className: "custom-stop-marker",
      html: `
        <div style="
          background-color: #2563EB;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          border: 2.5px solid white;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
        ">
          ${sequence}
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });

  // Auto Fit Bounds
  // ==================== FIT BOUNDS (Auto Zoom & Center ke Rute) ====================
  function FitBounds({ points, stops }: { points: any[]; stops: any[] }) {
    const map = useMap();

    useEffect(() => {
      const safePoints = Array.isArray(points) ? points : [];
      const safeStops = Array.isArray(stops) ? stops : [];

      if (safePoints.length === 0 && safeStops.length === 0) return;

      const bounds = L.latLngBounds([]);

      // Gabungkan semua titik dari points + stops
      safePoints.forEach((p: any) => {
        if (p?.latitude && p?.longitude) {
          bounds.extend([parseFloat(p.latitude), parseFloat(p.longitude)]);
        }
      });

      safeStops.forEach((s: any) => {
        if (s?.latitude && s?.longitude) {
          bounds.extend([parseFloat(s.latitude), parseFloat(s.longitude)]);
        }
      });

      if (bounds.isValid() && map) {
        // Penting: invalidateSize dulu biar ukuran map sudah benar
        map.invalidateSize();

        // Gunakan flyToBounds biar animasinya halus + auto center
        setTimeout(() => {
          map.flyToBounds(bounds, {
            padding: [80, 80], // jarak dari pinggir layar
            maxZoom: 15, // batas zoom maksimal
            duration: 1.2, // durasi animasi (detik)
          });
        }, 250);
      }
    }, [points, stops, map]);

    return null;
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: "100%", width: "100%", borderRadius: "24px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Garis Rute dari Points */}
      {polylinePositions.length > 1 && (
        <Polyline
          positions={polylinePositions}
          color={routeColor}
          weight={5.5}
          opacity={0.85}
        />
      )}

      {/* Marker Stops */}
      {safeStops.map((stop: any) => {
        if (!stop?.latitude || !stop?.longitude) return null;
        const position: [number, number] = [
          parseFloat(stop.latitude),
          parseFloat(stop.longitude),
        ];

        return (
          <Marker
            key={stop.id}
            position={position}
            icon={
              stop.isTerminal
                ? createTerminalIcon(stop.name)
                : createStopIcon(stop.sequence)
            }
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="font-semibold text-base">{stop.name}</div>
                {stop.isTerminal && (
                  <div className="inline-block mt-1 px-2.5 py-0.5 text-xs font-bold bg-red-100 text-red-600 rounded-md">
                    TERMINAL
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1.5">
                  Seq: {stop.sequence} • Radius: {stop.radiusMeter}m
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      <FitBounds points={safePoints} stops={safeStops} />
    </MapContainer>
  );
}

// ==================== MAIN PAGE ====================
export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [stops, setStops] = useState<StopData[]>([]);
  const [points, setPoints] = useState<PointData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const routeId = slug?.split("-").pop() || "";

  useEffect(() => {
    if (!routeId || isNaN(Number(routeId))) {
      setError("ID rute tidak valid.");
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        setLoading(true);

        const [routeRes, stopsRes, pointsRes] = await Promise.all([
          fetch(`http://localhost:3000/routes/${routeId}`),
          fetch(`http://localhost:3000/routes/${routeId}/stops`),
          fetch(`http://localhost:3000/routes/${routeId}/points`),
        ]);

        if (!stopsRes.ok || !pointsRes.ok)
          throw new Error("Gagal mengambil data rute");

        const routeData: RouteInfo = await routeRes.json();
        const stopsData: StopData[] = await stopsRes.json();
        const pointsData: PointData[] = await pointsRes.json();

        setRouteInfo(routeData);
        setStops(stopsData.sort((a, b) => a.sequence - b.sequence));
        setPoints(pointsData.sort((a, b) => a.sequence - b.sequence));
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [routeId]);

  return (
    <main className="min-h-screen bg-white py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#2563EB] transition-colors group"
        >
          <FaArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
          Kembali ke Daftar Rute
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 text-xs font-semibold tracking-[2px] text-[#2563EB]">
            DETAIL JALUR ANGKOT
          </div>

          {loading ? (
            <div className="h-10 w-80 animate-pulse rounded bg-slate-200" />
          ) : routeInfo ? (
            <div className="flex flex-wrap items-center gap-4">
              <div
                style={{ backgroundColor: routeInfo.color || "#2563EB" }}
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm"
              >
                {routeInfo.code}
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                  {routeInfo.name}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {routeInfo.direction === "GO"
                    ? "Rute Berangkat"
                    : "Rute Kembali / PP"}
                </p>
              </div>
            </div>
          ) : (
            <h1 className="text-3xl font-bold">Detail Rute</h1>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-[550px] animate-pulse rounded-3xl bg-slate-100" />
            <div className="lg:col-span-5 h-[550px] animate-pulse rounded-3xl bg-slate-50" />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-6 border border-red-100 flex items-center gap-3 text-red-700">
            <FaInfoCircle />
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
            {/* MAP */}
            <div className="lg:col-span-7 h-[450px] sm:h-[550px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
              <RouteMap
                points={points}
                stops={stops}
                routeColor={routeInfo?.color || "#2563EB"}
              />
            </div>

            {/* LIST STOPS */}
            <div className="lg:col-span-5 bg-slate-50/50 rounded-3xl border border-slate-100 p-6 sm:p-8 max-h-[550px] overflow-y-auto">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
                📍 Urutan Pemberhentian{" "}
                <span className="text-sm font-normal text-slate-500">
                  ({stops.length})
                </span>
              </h3>

              <div className="relative border-l-2 border-slate-200 ml-3.5 space-y-6">
                {stops.map((stop, index) => {
                  const isFirst = index === 0;
                  const isLast = index === stops.length - 1;

                  return (
                    <div key={stop.id} className="relative pl-8 group">
                      <span
                        className={`absolute -left-[15px] top-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold shadow-sm border transition-all group-hover:scale-110
                        ${
                          stop.isTerminal
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-white text-slate-600 border-slate-300 group-hover:border-[#2563EB] group-hover:text-[#2563EB]"
                        }`}
                      >
                        {stop.isTerminal
                          ? isFirst
                            ? "A"
                            : "T"
                          : stop.sequence}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 tracking-tight text-sm sm:text-base group-hover:text-[#2563EB] transition-colors">
                            {stop.name}
                          </h4>
                          {stop.isTerminal && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded-md border border-red-200">
                              Terminal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">
                          Radius: {stop.radiusMeter}m • Seq: {stop.sequence}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
