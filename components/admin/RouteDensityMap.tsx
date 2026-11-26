"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  PolylineF,
  MarkerF,
} from "@react-google-maps/api";
import { DirectionType } from "@/types/vehicles/vehicle.type";
import { useRoutes } from "@/hooks/routes/useRoutes";
import { routePathService } from "@/services/routes/route-path.service";
import { RouteStopType } from "@/types/routes/route-stop.type";
import { VehicleAssignment } from "@/types/vehicles/vehicle-assignments.type";
import {
  FaMapMarkedAlt,
  FaUsers,
  FaInfoCircle,
  FaSyncAlt,
  FaLayerGroup,
  FaFileAlt,
  FaCalculator,
  FaRoute,
  FaCompass,
} from "react-icons/fa";
import RouteEvaluationReportModal, {
  RouteEvaluationItem,
} from "./RouteEvaluationReportModal";

interface RouteDensityMapProps {
  selectedDate: string;
  assignments: VehicleAssignment[];
  rawRouteStops: RouteStopType[];
}

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "AIzaSyB_t7Y68s81CN5lnfPS-UC-p2x4YVKGoKI";

// Styling Google Maps bersih, kontras, dan ramah visual transportasi
const cleanMapStyles = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit.station.bus",
    elementType: "labels.icon",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ lightness: 12 }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#dbeafe" }],
  },
];

// Helper kalkulasi warna kepadatan penumpang berbasis Rata-rata Evaluasi Mingguan (Total 7 Hari / 7)
export function getWeeklyDensityStyle(avgDailyPax: number) {
  if (avgDailyPax > 50) {
    return {
      level: "Padat",
      fullLabel: "Kepadatan Tinggi (> 50 Orang/Hari)",
      color: "#991b1b", // Merah Darah Pekat
      borderColor: "#7f1d1d",
      weight: 6,
      opacity: 0.95,
      badgeBg: "bg-red-600 text-white border-red-500",
      pillBg: "bg-red-50 text-red-700 border-red-200",
      recommendation: "Prioritas: Perlu penambahan armada di jam sibuk",
    };
  } else if (avgDailyPax >= 15) {
    return {
      level: "Sedang",
      fullLabel: "Kepadatan Sedang (15 - 50 Orang/Hari)",
      color: "#ea580c", // Oranye Hangat
      borderColor: "#c2410c",
      weight: 5,
      opacity: 0.9,
      badgeBg: "bg-amber-500 text-white border-amber-400",
      pillBg: "bg-amber-50 text-amber-800 border-amber-200",
      recommendation: "Optimal: Keterisian stabil, pertahankan ritase",
    };
  } else if (avgDailyPax > 0) {
    return {
      level: "Lengang",
      fullLabel: "Kepadatan Rendah (< 15 Orang/Hari)",
      color: "#f43f5e", // Merah Muda / Soft Rose Cerah
      borderColor: "#fda4af",
      weight: 4,
      opacity: 0.85,
      badgeBg: "bg-rose-500 text-white border-rose-400",
      pillBg: "bg-rose-50 text-rose-700 border-rose-200",
      recommendation: "Lengang: Disarankan rotasi ritase ke koridor padat",
    };
  } else {
    return {
      level: "Belum Aktif",
      fullLabel: "Belum Ada Penumpang (0)",
      color: "#94a3b8", // Abu-abu Slate Netral
      borderColor: "#cbd5e1",
      weight: 3,
      opacity: 0.55,
      badgeBg: "bg-slate-400 text-white border-slate-300",
      pillBg: "bg-slate-50 text-slate-600 border-slate-200",
      recommendation: "Belum aktif: Siapkan integrasi jadwal trayek",
    };
  }
}

interface RouteTrack {
  routeId: number;
  routeCode: string;
  routeName: string;
  coordinates: { lat: number; lng: number }[];
  total7DaysPax: number;
  avgDailyPax: number;
  total7DaysTrips: number;
  avgDailyTrips: number;
  density: ReturnType<typeof getWeeklyDensityStyle>;
}

export default function RouteDensityMap({
  selectedDate,
  assignments,
  rawRouteStops,
}: RouteDensityMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "angkotgo-google-maps",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [mapInstance, setMapInstance] = useState<any>(null);

  // Live Hover HUD Card (bebas kedipan, tidak merender ulang peta)
  const [hoveredRoute, setHoveredRoute] = useState<RouteTrack | null>(null);

  // State Modal Ekspor Laporan Dokumen
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Selector: 'ALL' (Semua Jalur) atau string ID rute
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>("ALL");

  // Fetch rute dari database Supabase
  const { data: routesData = [] } = useRoutes();
  const routes = useMemo(() => {
    return Array.isArray(routesData)
      ? routesData
      : (routesData as any)?.data || [];
  }, [routesData]);

  // Hanya rute operasional resmi (Hapus AL dan AG)
  const operationalRoutes = useMemo(() => {
    return routes.filter((r: any) =>
      ["BB", "BGTU", "BS", "BK"].includes(r.routeCode)
    );
  }, [routes]);

  // Hitung rentang 7 Hari Terakhir (H-7 s/d H-1 dari selectedDate)
  const { evaluationWindowText, prev7DateStrings } = useMemo(() => {
    const [y, m, d] = (selectedDate || "2026-11-26").split("-").map(Number);
    const target = new Date(y, m - 1, d);

    const dateStrings: string[] = [];
    for (let i = 1; i <= 7; i++) {
      const dt = new Date(target);
      dt.setDate(dt.getDate() - i);
      const dy = dt.getFullYear();
      const dm = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      dateStrings.push(`${dy}-${dm}-${dd}`);
    }

    const firstDate = dateStrings[dateStrings.length - 1];
    const lastDate = dateStrings[0];
    const text = `${firstDate} s/d ${lastDate}`;
    return { evaluationWindowText: text, prev7DateStrings: dateStrings };
  }, [selectedDate]);

  const [allRouteTracks, setAllRouteTracks] = useState<RouteTrack[]>([]);
  const [isLoadingPaths, setIsLoadingPaths] = useState(false);

  // Fetch koordinat dan hitung evaluasi mingguan (Total 7 Hari / 7)
  const fetchRouteEvaluationData = useCallback(async () => {
    if (operationalRoutes.length === 0) return;
    setIsLoadingPaths(true);

    try {
      let allAssignmentsList: VehicleAssignment[] = [];
      try {
        const res = await fetch("http://localhost:3001/vehicle-assignments", {
          cache: "no-store",
        });
        if (res.ok) {
          const resJson = await res.json();
          allAssignmentsList = Array.isArray(resJson)
            ? resJson
            : resJson.data || [];
        }
      } catch {
        allAssignmentsList = assignments;
      }

      const weeklyAssignments = allAssignmentsList.filter((a: any) => {
        const aDate = a.assignmentDate
          ? String(a.assignmentDate).slice(0, 10)
          : "";
        return prev7DateStrings.includes(aDate) || prev7DateStrings.includes(a.date);
      });

      const tracksPromises = operationalRoutes.map(async (r: any) => {
        try {
          // Ambil koordinat jalur rute (FORWARD sebagai representasi koridor utama)
          const rawPaths = await routePathService.getRoutePathByRouteIdandDirection(
            r.id,
            DirectionType.FORWARD
          );
          const valid = (rawPaths || []).filter(
            (p: any) =>
              p &&
              typeof p.latitude === "number" &&
              typeof p.longitude === "number" &&
              !isNaN(p.latitude) &&
              !isNaN(p.longitude)
          );
          const sorted = [...valid].sort(
            (a: any, b: any) =>
              (a.sequenceOrder || a.stopOrder || 0) -
              (b.sequenceOrder || b.stopOrder || 0)
          );
          const coords = sorted.map((p: any) => ({
            lat: Number(p.latitude),
            lng: Number(p.longitude),
          }));

          // Hitung total penumpang 7 hari untuk rute ini (seluruh penugasan bolak-balik digabung)
          const matchingWeekly = weeklyAssignments.filter(
            (a: any) =>
              a.route?.routeCode === r.routeCode || a.routeCode === r.routeCode
          );

          let total7Pax = matchingWeekly.reduce(
            (acc, curr) => acc + (curr.currentPassengers || 0),
            0
          );

          if (total7Pax === 0) {
            const todayMatching = assignments.filter(
              (a: any) =>
                a.route?.routeCode === r.routeCode ||
                a.routeCode === r.routeCode
            );
            const todayPax = todayMatching.reduce(
              (acc, curr) => acc + (curr.currentPassengers || 0),
              0
            );
            total7Pax = todayPax > 0 ? todayPax * 7 : 0;
          }

          // RATA-RATA PENUMPANG HARIAN = TOTAL 7 HARI / 7
          const avgDailyPax = Math.round(total7Pax / 7);
          const total7Trips =
            matchingWeekly.length > 0
              ? matchingWeekly.length
              : (assignments.filter((a) => a.route?.routeCode === r.routeCode).length || 1) * 7;
          const avgDailyTrips = Math.max(1, Math.round(total7Trips / 7));

          return {
            routeId: r.id,
            routeCode: r.routeCode,
            routeName: r.routeName || r.routeCode,
            coordinates: coords,
            total7DaysPax: total7Pax,
            avgDailyPax: avgDailyPax,
            total7DaysTrips: total7Trips,
            avgDailyTrips: avgDailyTrips,
            density: getWeeklyDensityStyle(avgDailyPax),
          } as RouteTrack;
        } catch {
          return null;
        }
      });

      const results = await Promise.all(tracksPromises);
      const validTracks = results.filter(
        (t): t is RouteTrack => t !== null && t.coordinates.length > 0
      );
      setAllRouteTracks(validTracks);
    } catch {
      // Graceful fallback
    } finally {
      setIsLoadingPaths(false);
    }
  }, [operationalRoutes, assignments, prev7DateStrings]);

  useEffect(() => {
    fetchRouteEvaluationData();
  }, [fetchRouteEvaluationData]);

  // Filter jalur yang sedang terlihat
  const visibleTracks = useMemo(() => {
    if (selectedRouteFilter === "ALL") {
      return allRouteTracks;
    }
    const targetId = Number(selectedRouteFilter);
    return allRouteTracks.filter((t) => t.routeId === targetId);
  }, [allRouteTracks, selectedRouteFilter]);

  // Total evaluasi penumpang harian rata-rata
  const totalAvgDailyPax = useMemo(() => {
    return visibleTracks.reduce((acc, t) => acc + t.avgDailyPax, 0);
  }, [visibleTracks]);

  // Halte yang relevan
  const visibleStops = useMemo(() => {
    return rawRouteStops.filter((stop: any) => {
      if (selectedRouteFilter === "ALL") {
        return true;
      }
      const targetId = Number(selectedRouteFilter);
      return stop.routeId === targetId;
    });
  }, [rawRouteStops, selectedRouteFilter]);

  // Data Dokumen Ekspor Laporan
  const reportEvaluationItems: RouteEvaluationItem[] = useMemo(() => {
    return allRouteTracks.map((t) => ({
      routeId: t.routeId,
      routeCode: t.routeCode,
      routeName: t.routeName,
      total7DaysPax: t.total7DaysPax,
      avgDailyPax: t.avgDailyPax,
      total7DaysTrips: t.total7DaysTrips,
      avgDailyTrips: t.avgDailyTrips,
      densityLevel: t.density.level,
      densityColor: t.density.color,
      recommendation: t.density.recommendation,
    }));
  }, [allRouteTracks]);

  // Fit-Bounds HANYA berjalan saat filter rute diubah oleh user (bukan saat kursor hover)
  const isInitialFit = useRef(false);
  useEffect(() => {
    if (
      mapInstance &&
      visibleTracks.length > 0 &&
      typeof window !== "undefined" &&
      (window as any).google
    ) {
      const bounds = new (window as any).google.maps.LatLngBounds();
      let hasPoints = false;
      visibleTracks.forEach((track) => {
        track.coordinates.forEach((pt) => {
          bounds.extend(new (window as any).google.maps.LatLng(pt.lat, pt.lng));
          hasPoints = true;
        });
      });
      if (hasPoints) {
        mapInstance.fitBounds(bounds, {
          top: 35,
          right: 35,
          bottom: 35,
          left: 35,
        });
      }
    }
  }, [mapInstance, selectedRouteFilter, visibleTracks.length]);

  const onMapLoad = useCallback((map: any) => {
    setMapInstance(map);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMapInstance(null);
  }, []);

  const defaultCenter = { lat: -7.955, lng: 112.615 };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 p-5 mb-8">
      {/* ── Header Ringkas & Bersih Tanpa Overcrowding ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-4 border-b border-slate-100">
        {/* Kiri: Judul & Subjudul */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <FaMapMarkedAlt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-slate-800">
                Peta Evaluasi Kepadatan Koridor Trayek
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                <FaCalculator className="w-2.5 h-2.5" />
                Rolling 7-Hari (Total ÷ 7)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rata-rata mingguan:{" "}
              <strong className="text-red-700 font-bold">Merah Darah</strong> = Padat (&gt;50 orang/hari),{" "}
              <strong className="text-amber-600 font-semibold">Oranye</strong> = Sedang,{" "}
              <strong className="text-rose-500 font-semibold">Merah Muda</strong> = Lengang (&lt;15 orang/hari)
            </p>
          </div>
        </div>

        {/* Kanan: Tombol Ekspor & Selector Trayek (Tanpa Warna Hitam, Tanpa Pergi-Pulang) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Ekspor Laporan (Biru Cerah & Bersahabat) */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow transition-colors cursor-pointer"
          >
            <FaFileAlt className="w-3.5 h-3.5" />
            <span>Ekspor Analisa</span>
          </button>

          {/* Selector Jalur (Semua Jalur vs Jalur Tertentu) */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setSelectedRouteFilter("ALL")}
              type="button"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRouteFilter === "ALL"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <FaLayerGroup className="w-3 h-3" />
              Semua ({visibleTracks.length})
            </button>

            {operationalRoutes.map((r: any) => {
              const active = selectedRouteFilter === String(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRouteFilter(String(r.id))}
                  type="button"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  {r.routeCode}
                </button>
              );
            })}
          </div>

          {/* Refresh Data */}
          <button
            onClick={() => fetchRouteEvaluationData()}
            title="Muat Ulang Data Jalur"
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <FaSyncAlt
              className={`w-3.5 h-3.5 ${
                isLoadingPaths ? "animate-spin text-rose-600" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── Sub-Bar Ringkas Status Evaluasi ── */}
      <div className="mt-2.5 mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2 text-slate-600 flex-wrap">
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <FaCompass className="text-rose-600" />
            {selectedRouteFilter === "ALL"
              ? `Jaringan Multi-Jalur (${visibleTracks.length} Trayek)`
              : `Trayek ${operationalRoutes.find((r: any) => String(r.id) === selectedRouteFilter)?.routeCode}`}
          </span>
          <span className="text-slate-300">•</span>
          <span>
            Rata-rata: <strong className="text-slate-900">{totalAvgDailyPax} Orang / Hari</strong>
          </span>
          <span className="text-slate-400 text-[11px]">
            (Periode: {evaluationWindowText})
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-rose-50 text-rose-800 border-rose-200">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
          {visibleTracks.some((t) => t.avgDailyPax > 50)
            ? "Terdeteksi Jalur Padat (Merah Darah)"
            : "Jalur Terkendali"}
        </span>
      </div>

      {/* ── Google Maps Viewport dengan Live Floating HUD Tooltip (Bebas Kedipan) ── */}
      <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
        {!isLoaded ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <FaSyncAlt className="w-6 h-6 animate-spin text-rose-600" />
            <span className="text-xs font-semibold">
              Menghubungkan ke Google Maps Multi-Jalur...
            </span>
          </div>
        ) : loadError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-red-500 gap-2 p-6 text-center">
            <p className="font-bold text-sm">Gagal Memuat Google Maps</p>
            <p className="text-xs text-slate-500 max-w-md">
              Pastikan Google Maps JavaScript API telah aktif di Google Cloud Console.
            </p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={defaultCenter}
            zoom={13}
            onLoad={onMapLoad}
            onUnmount={onMapUnmount}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
              styles: cleanMapStyles,
            }}
          >
            {/* Render Setiap Jalur Trayek Multi-Jalur */}
            {visibleTracks.map((track) => (
              <React.Fragment key={`track-${track.routeId}`}>
                {/* Glow Outer Polyline */}
                <PolylineF
                  path={track.coordinates}
                  options={{
                    strokeColor: track.density.borderColor,
                    strokeOpacity: 0.35,
                    strokeWeight: track.density.weight + 3,
                    clickable: false,
                  }}
                />

                {/* Main Dynamic Polyline: onMouseOver memperbarui HUD Card tanpa autoPan / flicker */}
                <PolylineF
                  path={track.coordinates}
                  onMouseOver={() => setHoveredRoute(track)}
                  onClick={() => setHoveredRoute(track)}
                  options={{
                    strokeColor: track.density.color,
                    strokeOpacity: track.density.opacity,
                    strokeWeight: track.density.weight,
                    clickable: true,
                  }}
                />
              </React.Fragment>
            ))}

            {/* Marker Titik Halte Resmi */}
            {visibleStops.map((stop: any, idx: number) => {
              const isHub =
                stop.stopName?.toLowerCase().includes("begawan") ||
                stop.stopName?.toLowerCase().includes("brawijaya") ||
                stop.stopName?.toLowerCase().includes("batu");

              return (
                <MarkerF
                  key={`stop-${stop.id}-${idx}`}
                  position={{
                    lat: Number(stop.latitude),
                    lng: Number(stop.longitude),
                  }}
                  icon={
                    typeof window !== "undefined" && (window as any).google
                      ? {
                          path: (window as any).google.maps.SymbolPath.CIRCLE,
                          scale: isHub ? 6 : 4,
                          fillColor: isHub ? "#991b1b" : "#2563eb",
                          fillOpacity: 1,
                          strokeColor: "#ffffff",
                          strokeWeight: 1.5,
                        }
                      : undefined
                  }
                />
              );
            })}
          </GoogleMap>
        )}

        {/* ── LIVE FLOATING HUD TOOLTIP CARD (MUNCUL OTOMATIS SAAT KURSOR HOVER DI JALUR) ── */}
        <div className="absolute top-3 left-3 z-10 pointer-events-auto max-w-[280px]">
          {hoveredRoute ? (
            <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 shadow-xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-2xs">
                  TRAYEK {hoveredRoute.routeCode}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-lg text-white font-bold text-[10px] shadow-2xs"
                  style={{ backgroundColor: hoveredRoute.density.color }}
                >
                  {hoveredRoute.density.level}
                </span>
              </div>

              {/* Koridor Trayek */}
              <h4 className="font-extrabold text-slate-800 text-xs leading-snug">
                {hoveredRoute.routeName}
              </h4>

              {/* Evaluasi Mingguan Rolling 7-Hari */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Rata-rata Harian:</span>
                  <span className="font-extrabold text-slate-900 text-xs">
                    {hoveredRoute.avgDailyPax} Orang / Hari
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 pt-1">
                  <span>Total 7 Hari (H1–H7):</span>
                  <span className="font-semibold text-slate-700">
                    {hoveredRoute.total7DaysPax} Orang
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Ritase 7 Hari:</span>
                  <span className="font-semibold text-slate-700">
                    {hoveredRoute.total7DaysTrips} Putaran
                  </span>
                </div>
              </div>

              {/* Rekomendasi Kebijakan Armada */}
              <div className="text-[10px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-2 text-center leading-snug">
                {hoveredRoute.density.recommendation}
              </div>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200/80 shadow-md text-[11px] text-slate-600 flex items-center gap-2">
              <FaInfoCircle className="text-rose-500 shrink-0" />
              <span>Arahkan kursor ke garis rute untuk melihat detail evaluasi</span>
            </div>
          )}
        </div>

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200/90 shadow-md text-[11px] space-y-1.5 pointer-events-auto">
          <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-[11px]">
            <FaInfoCircle className="text-rose-600" />
            Legenda Evaluasi Jalur (Rolling 7-Hari)
          </p>
          <div className="flex items-center gap-2">
            <span className="w-5 h-2 rounded bg-red-700 inline-block shadow-2xs" />
            <span className="text-slate-800 font-bold">
              Padat (&gt; 50 Penumpang/Hari)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-2 rounded bg-amber-600 inline-block" />
            <span className="text-slate-700 font-semibold">
              Sedang (15 - 50 Penumpang/Hari)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-2 rounded bg-rose-400 inline-block" />
            <span className="text-slate-700 font-semibold">
              Lengang (&lt; 15 Penumpang/Hari)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-2 rounded bg-slate-400 inline-block" />
            <span className="text-slate-500">Belum Aktif (0)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <span className="w-2 h-2 rounded-full bg-red-700 inline-block" />
            <span className="text-slate-600">Simpul Utama</span>
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block ml-2" />
            <span className="text-slate-600">Halte Biasa</span>
          </div>
        </div>
      </div>

      {/* Modal Dokumen Ekspor Laporan Analisa Evaluasi */}
      <RouteEvaluationReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        evaluationDate={selectedDate}
        evaluationWindow={evaluationWindowText}
        reportItems={reportEvaluationItems}
      />
    </div>
  );
}
