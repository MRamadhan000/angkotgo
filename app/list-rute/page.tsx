"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  FaBus,
  FaRoute,
  FaMapMarkerAlt,
  FaFlagCheckered,
  FaSpinner,
  FaLayerGroup,
  FaLongArrowAltRight,
  FaLongArrowAltLeft,
  FaArrowLeft,
} from "react-icons/fa";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { useRoutes } from "@/hooks/routes/useRoutes";
import { useRoutePaths } from "@/hooks/routes/useRoutePath";
import { useRouteStops } from "@/hooks/routes/useRouteStops";
import type { Route } from "@/types/routes/route.type";
import { DirectionType } from "@/types/vehicles/vehicle.type";
import type {
  MapContainerProps,
  TileLayerProps,
  PolylineProps,
  MarkerProps,
  PopupProps,
} from "react-leaflet";

// Import Leaflet secara dinamis agar tidak error saat rendering sisi server (SSR).
// Generic type diberikan secara eksplisit ke dynamic() agar props (position, icon,
// center, zoom, dll) tetap punya tipe yang benar dan tidak memicu type error.
const MapContainer = dynamic<MapContainerProps>(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic<TileLayerProps>(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Polyline = dynamic<PolylineProps>(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);
const Marker = dynamic<MarkerProps>(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic<PopupProps>(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false },
);

// Komponen Pembantu Khusus Map FlyTo (auto focus peta saat titik awal berubah)
function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// Setiap trayek punya "warna garis" sendiri, meniru konvensi peta transit
// (mis. peta MRT/Trans Jogja) di mana tiap rute dikenali dari warnanya, bukan arahnya.
const ROUTE_LINE_PALETTE = [
  "#2563EB", // biru
  "#EA580C", // oranye
  "#059669", // hijau
  "#D946EF", // magenta
  "#DC2626", // merah
  "#0EA5E9", // cyan
  "#CA8A04", // kuning tua
  "#7C3AED", // ungu
];

// Fungsi untuk membuat Marker Angka (Custom DivIcon).
// Border solid = arah Berangkat, border putus-putus = arah Pulang — konsisten
// dengan gaya garis pada polyline di peta.
const createNumberIcon = (number: number, color: string, dashed: boolean) => {
  return L.divIcon({
    className: "custom-number-marker",
    html: `<div style="
      background-color: ${color};
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      border: 2.5px ${dashed ? "dashed" : "solid"} #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12);
    ">${number}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// ==================== INTERFACES / TYPES ====================
export default function InfoRutePage() {
  const router = useRouter();
  const { data: routes = [] } = useRoutes();
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [direction, setDirection] = useState<DirectionType>(
    DirectionType.FORWARD,
  );

  const { data: pathData = [], isLoading: pathsLoading } = useRoutePaths(
    selectedRoute?.id ?? 0,
    direction,
  );
  const { data: stopData = [], isLoading: stopsLoading } = useRouteStops(
    selectedRoute?.id ?? 0,
    direction,
  );
  const loading = pathsLoading || stopsLoading;

  const isReturn = direction === "RETURN";

  // Warna garis trayek ditentukan dari posisi trayek dalam daftar, bukan dari arah —
  // ini membuat tiap trayek punya identitas visual sendiri, sama seperti garis pada peta transit.
  const selectedRouteIndex = selectedRoute
    ? routes.findIndex((r) => r.id === selectedRoute.id)
    : -1;
  const routeColor =
    selectedRouteIndex >= 0
      ? ROUTE_LINE_PALETTE[selectedRouteIndex % ROUTE_LINE_PALETTE.length]
      : ROUTE_LINE_PALETTE[0];

  const getRouteColor = (id: number) => {
    const idx = routes.findIndex((r) => r.id === id);
    return ROUTE_LINE_PALETTE[(idx < 0 ? 0 : idx) % ROUTE_LINE_PALETTE.length];
  };

  useEffect(() => {
    if (!selectedRoute && routes.length > 0) {
      setSelectedRoute(routes[0]);
    }
  }, [routes, selectedRoute]);

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased overflow-x-hidden font-body">
      {/* Font & warna dasar */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        :root {
          --brand-600: #2563EB;
          --brand-700: #1D4ED8;
        }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-data { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[var(--brand-700)] transition-colors"
        >
          <FaArrowLeft className="text-xs" />
          Kembali
        </button>

        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-[var(--brand-600)] p-6 sm:p-8 shadow-xl shadow-blue-600/10">
          <FaRoute className="pointer-events-none absolute -right-6 -bottom-8 text-[9rem] text-white/10 rotate-[-12deg]" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="hidden sm:flex flex-shrink-0 w-14 h-14 rounded-2xl bg-white items-center justify-center shadow-lg shadow-black/10">
              <FaBus className="text-2xl text-[var(--brand-600)]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-white bg-white/15 px-3 py-1 rounded-full border border-white/20">
                Geospasial Angkot
              </span>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Informasi Trayek &amp; Rute Angkot
              </h1>
              <p className="mt-1 text-sm text-blue-100 max-w-xl">
                Pilih kode trayek di bawah untuk memantau jalur perjalanan
                lengkap dan urutan halte secara interaktif.
              </p>
              {routes.length > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-50">
                  <FaLayerGroup className="text-white" />
                  {routes.length} trayek terdaftar
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Route Selector — chip bergaya "line selector" peta transit */}
        <div className="flex flex-wrap gap-3">
          {routes.map((route) => {
            const chipColor = getRouteColor(route.id);
            const active = selectedRoute?.id === route.id;
            return (
              <button
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className="group px-4 py-2.5 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center gap-2.5 bg-white"
                style={{
                  borderColor: active ? chipColor : "#e2e8f0",
                  boxShadow: active ? `0 0 0 3px ${chipColor}22` : undefined,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: chipColor }}
                />
                <span
                  className="font-data font-bold text-xs px-2 py-1 rounded-lg"
                  style={{
                    backgroundColor: active ? `${chipColor}1A` : "#f1f5f9",
                    color: active ? chipColor : "#334155",
                  }}
                >
                  {route.routeCode}
                </span>
                <span className="text-xs font-semibold tracking-wide text-slate-700">
                  {route.routeName}
                </span>
              </button>
            );
          })}
        </div>

        {selectedRoute && (
          <div className="space-y-6">
            {/* Control Panel Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Strip warna garis trayek — identitas visual trayek yang sedang aktif */}
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: routeColor }}
              />

              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-200 pb-6">
                  <div>
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
                      style={{
                        color: routeColor,
                        backgroundColor: `${routeColor}0F`,
                        borderColor: `${routeColor}33`,
                      }}
                    >
                      Trayek Aktif
                    </span>
                    <h2 className="flex items-center gap-2 font-display text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                      <FaRoute style={{ color: routeColor }} />
                      {selectedRoute.routeCode} — {selectedRoute.routeName}
                    </h2>
                  </div>

                  {/* Direction Switcher */}
                  <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200 shadow-inner">
                    {[
                      DirectionType.FORWARD,
                      DirectionType.RETURN,
                    ].map((dir) => {
                      const active = direction === dir;
                      return (
                        <button
                          key={dir}
                          onClick={() => setDirection(dir)}
                          className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all"
                          style={{
                            backgroundColor: active
                              ? routeColor
                              : "transparent",
                            color: active ? "#ffffff" : "#475569",
                            boxShadow: active
                              ? "0 4px 10px -2px rgba(0,0,0,0.25)"
                              : undefined,
                          }}
                        >
                          {dir === "FORWARD" ? (
                            <FaLongArrowAltRight />
                          ) : (
                            <FaLongArrowAltLeft />
                          )}
                          {dir === "FORWARD" ? "Berangkat" : "Pulang"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Map & List Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Leaflet Map (7 cols) */}
                  <div className="lg:col-span-7">
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <FaMapMarkerAlt style={{ color: routeColor }} />
                      Peta Jalur
                    </div>
                    <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
                      {/* Loading Overlay */}
                      {loading && (
                        <div className="absolute inset-0 z-[1000] bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-slate-700 transition-all">
                          <FaSpinner
                            className="animate-spin text-3xl"
                            style={{ color: routeColor }}
                          />
                          <span className="text-xs font-bold tracking-wide">
                            Memuat rute trayek...
                          </span>
                        </div>
                      )}

                      {pathData.length > 0 ? (
                        <>
                          <MapContainer
                            center={[
                              pathData[0].latitude,
                              pathData[0].longitude,
                            ]}
                            zoom={14}
                            className="h-full w-full"
                          >
                            {/* Auto Focus Map Component */}
                            <MapFlyTo
                              center={[
                                pathData[0].latitude,
                                pathData[0].longitude,
                              ]}
                            />

                            {/* Light TileLayer (CartoDB Voyager) */}
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                            {/* Polyline — solid untuk Berangkat, putus-putus untuk Pulang */}
                            <Polyline
                              positions={pathData.map(
                                (p) =>
                                  [p.latitude, p.longitude] as [number, number],
                              )}
                              color={routeColor}
                              weight={5}
                              dashArray={isReturn ? "10 8" : undefined}
                            />

                            {/* Numbered Markers */}
                            {stopData.map((stop) => (
                              <Marker
                                key={stop.id}
                                position={[stop.latitude, stop.longitude]}
                                icon={createNumberIcon(
                                  stop.stopOrder,
                                  routeColor,
                                  isReturn,
                                )}
                              >
                                <Popup className="custom-popup">
                                  <div className="p-1 text-slate-900">
                                    <span
                                      className="text-[10px] font-bold px-2 py-0.5 rounded border"
                                      style={{
                                        color: routeColor,
                                        backgroundColor: `${routeColor}0F`,
                                        borderColor: `${routeColor}33`,
                                      }}
                                    >
                                      Halte #{stop.stopOrder}
                                    </span>
                                    <div className="font-bold text-slate-900 text-xs mt-1">
                                      {stop.stopName}
                                    </div>
                                  </div>
                                </Popup>
                              </Marker>
                            ))}
                          </MapContainer>

                          {/* Legend arah — pojok kiri bawah, aman dari kontrol zoom Leaflet */}
                          <div className="absolute bottom-3 left-3 z-[500] bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm px-3 py-2 space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                              <span
                                className="inline-block w-5 h-[3px] rounded-full"
                                style={{ backgroundColor: routeColor }}
                              />
                              Berangkat
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                              <span
                                className="inline-block w-5 h-0 border-t-[3px] rounded-full"
                                style={{
                                  borderColor: routeColor,
                                  borderStyle: "dashed",
                                }}
                              />
                              Pulang
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 font-medium text-sm">
                          {!loading && "Belum ada data koordinat jalur trayek."}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Urutan Halte List (5 cols) */}
                  <div className="lg:col-span-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <FaLayerGroup style={{ color: routeColor }} />
                        Urutan Halte
                      </div>
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${routeColor}0F`,
                          color: routeColor,
                          borderColor: `${routeColor}33`,
                        }}
                      >
                        {stopData.length} Halte
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 h-[500px] flex flex-col">
                      {/* Diagram garis halte — bergaya diagram jalur transit */}
                      <div className="relative overflow-y-auto pr-1 flex-1 custom-scrollbar">
                        {stopData.length > 0 ? (
                          <>
                            <div
                              className="absolute left-4 top-4 bottom-4 w-0.5 rounded-full"
                              style={{ backgroundColor: `${routeColor}33` }}
                            />
                            <div className="space-y-4">
                              {stopData.map((stop) => (
                                <div
                                  key={stop.id}
                                  className="relative flex items-center gap-3.5"
                                >
                                  <div
                                    className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold font-data shadow-sm ring-4 ring-slate-50"
                                    style={{ backgroundColor: routeColor }}
                                  >
                                    {stop.stopOrder}
                                  </div>
                                  <div className="flex-1 min-w-0 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                                    <h4 className="font-semibold text-slate-900 text-xs truncate">
                                      {stop.stopName}
                                    </h4>
                                    <p className="text-[10px] font-data text-slate-500 mt-0.5">
                                      {stop.latitude.toFixed(4)},{" "}
                                      {stop.longitude.toFixed(4)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
                            <FaFlagCheckered className="text-2xl mb-2 text-slate-300" />
                            <p className="text-xs font-medium">
                              Belum ada data halte untuk arah trayek ini.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}