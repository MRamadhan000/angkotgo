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

// Definisi palet warna identitas unik untuk tiap rute resmi
// Setiap rute punya hue warna tersendiri, dengan gradasi gelap-terang sesuai tingkat kepadatan
export const ROUTE_COLOR_PALETTES: Record<
  string,
  {
    name: string;
    label: string;
    dense: { color: string; border: string; label: string };     // Sangat padat (>50 pax) -> Paling Gelap & Pekat
    stable: { color: string; border: string; label: string };    // Stabil / Sedang (15-50 pax) -> Warna Medium Alami
    light: { color: string; border: string; label: string };     // Lengang (<15 pax) -> Warna Paling Terang / Cerah
    inactive: { color: string; border: string; label: string };  // Belum aktif (0 pax) -> Muted / Netral
  }
> = {
  BB: {
    name: "Biru",
    label: "Trayek BB (Begawan - UB)",
    dense: { color: "#1e3a8a", border: "#172554", label: "Padat (Biru Tua Pekat)" },
    stable: { color: "#2563eb", border: "#1d4ed8", label: "Stabil (Biru Royal)" },
    light: { color: "#93c5fd", border: "#bfdbfe", label: "Lengang (Biru Cerah)" },
    inactive: { color: "#cbd5e1", border: "#e2e8f0", label: "Belum Aktif" },
  },
  BGTU: {
    name: "Hijau",
    label: "Trayek BGTU (Begawan - Batu)",
    dense: { color: "#065f46", border: "#044332", label: "Padat (Hijau Hutan Pekat)" },
    stable: { color: "#059669", border: "#047857", label: "Stabil (Hijau Zamrud)" },
    light: { color: "#6ee7b7", border: "#a7f3d0", label: "Lengang (Hijau Mint Cerah)" },
    inactive: { color: "#cbd5e1", border: "#e2e8f0", label: "Belum Aktif" },
  },
  BS: {
    name: "Oranye",
    label: "Trayek BS (Begawan - Suhat)",
    dense: { color: "#9a3412", border: "#7c2d12", label: "Padat (Cokelat Oranye Pekat)" },
    stable: { color: "#ea580c", border: "#c2410c", label: "Stabil (Oranye Hangat)" },
    light: { color: "#fdba74", border: "#fed7aa", label: "Lengang (Oranye Cerah)" },
    inactive: { color: "#cbd5e1", border: "#e2e8f0", label: "Belum Aktif" },
  },
  BK: {
    name: "Ungu",
    label: "Trayek BK (Begawan - Karya)",
    dense: { color: "#581c87", border: "#3b0764", label: "Padat (Ungu Terong Pekat)" },
    stable: { color: "#7c3aed", border: "#6d28d9", label: "Stabil (Ungu Violet)" },
    light: { color: "#c4b5fd", border: "#ddd6fe", label: "Lengang (Ungu Lavender Cerah)" },
    inactive: { color: "#cbd5e1", border: "#e2e8f0", label: "Belum Aktif" },
  },
};

// Helper kalkulasi warna kepadatan penumpang berbasis Rata-rata Evaluasi Mingguan (Total 7 Hari / 7)
// Menghitung gradasi gelap (padat) ke terang (lengang) per kode rute
export function getWeeklyDensityStyle(avgDailyPax: number, routeCode: string = "BB") {
  const palette = ROUTE_COLOR_PALETTES[routeCode] || ROUTE_COLOR_PALETTES.BB;

  if (avgDailyPax > 50) {
    return {
      level: "Padat",
      statusType: "PRIORITY" as const,
      fullLabel: "Kepadatan Tinggi (> 50 Orang/Hari)",
      color: palette.dense.color,
      borderColor: palette.dense.border,
      weight: 6,
      opacity: 0.95,
      badgeBg: "bg-red-600 text-white border-red-500",
      pillBg: "bg-red-50 text-red-700 border-red-200",
      recommendationBoxBg: "bg-red-50 border-red-200 text-red-800",
      recommendation: "Prioritas: Perlu penambahan armada di jam sibuk",
    };
  } else if (avgDailyPax >= 15) {
    return {
      level: "Stabil",
      statusType: "STABLE" as const,
      fullLabel: "Kepadatan Stabil (15 - 50 Orang/Hari)",
      color: palette.stable.color,
      borderColor: palette.stable.border,
      weight: 5,
      opacity: 0.9,
      badgeBg: "bg-emerald-600 text-white border-emerald-500",
      pillBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      recommendationBoxBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
      recommendation: "Stabil: Keterisian optimal, pertahankan ritase",
    };
  } else if (avgDailyPax > 0) {
    return {
      level: "Lengang",
      statusType: "LIGHT" as const,
      fullLabel: "Kepadatan Rendah (< 15 Orang/Hari)",
      color: palette.light.color,
      borderColor: palette.light.border,
      weight: 4,
      opacity: 0.85,
      badgeBg: "bg-sky-500 text-white border-sky-400",
      pillBg: "bg-sky-50 text-sky-800 border-sky-200",
      recommendationBoxBg: "bg-sky-50 border-sky-200 text-sky-800",
      recommendation: "Lengang: Disarankan rotasi ritase ke koridor padat",
    };
  } else {
    return {
      level: "Belum Aktif",
      statusType: "INACTIVE" as const,
      fullLabel: "Belum Ada Penumpang (0)",
      color: palette.inactive.color,
      borderColor: palette.inactive.border,
      weight: 3,
      opacity: 0.55,
      badgeBg: "bg-slate-400 text-white border-slate-300",
      pillBg: "bg-slate-50 text-slate-600 border-slate-200",
      recommendationBoxBg: "bg-slate-50 border-slate-200 text-slate-600",
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
  activeVehiclesDaily: number;
  activeVehiclesWeekly: number;
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

          // Hitung armada harian & akumulasi unit beroperasi 7 hari (H1 + H2 + ... + H7)
          const todayMatching = assignments.filter(
            (a: any) =>
              a.route?.routeCode === r.routeCode || a.routeCode === r.routeCode
          );
          const activeVehiclesTodaySet = new Set(
            todayMatching.map((a: any) => a.vehicleId || a.vehicle?.id || a.vehicle?.plateNumber)
          );

          // Peta unit per hari untuk menghitung total akumulasi penugasan armada (H1 + H2 + ... + H7)
          const dailyVehiclesMap: Record<string, Set<any>> = {};
          matchingWeekly.forEach((a: any) => {
            const dateKey = a.assignmentDate ? String(a.assignmentDate).slice(0, 10) : "";
            const vId = a.vehicleId || a.vehicle?.id || a.vehicle?.plateNumber;
            if (dateKey && vId) {
              if (!dailyVehiclesMap[dateKey]) dailyVehiclesMap[dateKey] = new Set();
              dailyVehiclesMap[dateKey].add(vId);
            }
          });

          let cumulative7DaysFleet = 0;
          Object.values(dailyVehiclesMap).forEach((s) => {
            cumulative7DaysFleet += s.size;
          });

          // Rata-rata armada aktif per hari dan total akumulasi armada seminggu
          const activeVehiclesDaily = activeVehiclesTodaySet.size > 0
            ? activeVehiclesTodaySet.size
            : (Object.keys(dailyVehiclesMap).length > 0
                ? Math.max(1, Math.round(cumulative7DaysFleet / Object.keys(dailyVehiclesMap).length))
                : 1);

          const activeVehiclesWeekly = cumulative7DaysFleet > 0
            ? cumulative7DaysFleet
            : activeVehiclesDaily * 7;

          return {
            routeId: r.id,
            routeCode: r.routeCode,
            routeName: r.routeName || r.routeCode,
            coordinates: coords,
            total7DaysPax: total7Pax,
            avgDailyPax: avgDailyPax,
            total7DaysTrips: total7Trips,
            avgDailyTrips: avgDailyTrips,
            activeVehiclesDaily: activeVehiclesDaily,
            activeVehiclesWeekly: activeVehiclesWeekly,
            density: getWeeklyDensityStyle(avgDailyPax, r.routeCode),
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
  const lastFittedFilter = useRef<string | null>(null);
  useEffect(() => {
    if (
      mapInstance &&
      visibleTracks.length > 0 &&
      typeof window !== "undefined" &&
      (window as any).google &&
      lastFittedFilter.current !== selectedRouteFilter
    ) {
      lastFittedFilter.current = selectedRouteFilter;
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
  }, [mapInstance, selectedRouteFilter, visibleTracks]);

  const onMapLoad = useCallback((map: any) => {
    setMapInstance(map);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMapInstance(null);
  }, []);

  const defaultCenter = { lat: -7.955, lng: 112.615 };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 p-5 mb-8">
      {/* ── Header Rapih, Seimbang & Tidak Sesak (Decluttered UI) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        {/* Kiri: Judul & Keterangan Ringkas */}
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
              Warna per koridor: <span className="font-semibold text-blue-700">BB (Biru)</span>,{" "}
              <span className="font-semibold text-emerald-700">BGTU (Hijau)</span>,{" "}
              <span className="font-semibold text-amber-700">BS (Oranye)</span>,{" "}
              <span className="font-semibold text-purple-700">BK (Ungu)</span> •{" "}
              <span className="text-slate-700 font-bold">Warna Lebih Gelap</span> = Padat,{" "}
              <span className="text-slate-500">Warna Lebih Terang</span> = Sepi
            </p>
          </div>
        </div>

        {/* Kanan: Filter Jalur & Tombol Tindakan Tanpa Warna Hitam */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Selector Koridor Trayek dengan Dot Warna Rute */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl gap-0.5 border border-slate-200/60">
            <button
              onClick={() => setSelectedRouteFilter("ALL")}
              type="button"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRouteFilter === "ALL"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
              }`}
            >
              <FaLayerGroup className="w-3 h-3" />
              Semua ({visibleTracks.length})
            </button>

            {operationalRoutes.map((r: any) => {
              const active = selectedRouteFilter === String(r.id);
              const dotColor =
                r.routeCode === "BB"
                  ? "bg-blue-600"
                  : r.routeCode === "BGTU"
                  ? "bg-emerald-600"
                  : r.routeCode === "BS"
                  ? "bg-amber-600"
                  : "bg-purple-600";
              const activeBg =
                r.routeCode === "BB"
                  ? "bg-blue-600 text-white"
                  : r.routeCode === "BGTU"
                  ? "bg-emerald-600 text-white"
                  : r.routeCode === "BS"
                  ? "bg-amber-600 text-white"
                  : "bg-purple-600 text-white";

              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRouteFilter(String(r.id))}
                  type="button"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? `${activeBg} shadow-xs`
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      active ? "bg-white" : dotColor
                    }`}
                  />
                  {r.routeCode}
                </button>
              );
            })}
          </div>

          {/* Tombol Ekspor Laporan (Biru Cerah & Bersahabat) */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <FaFileAlt className="w-3.5 h-3.5" />
            <span>Ekspor Analisa</span>
          </button>

          {/* Refresh Data */}
          <button
            onClick={() => fetchRouteEvaluationData()}
            title="Muat Ulang Data Jalur"
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <FaSyncAlt
              className={`w-3.5 h-3.5 ${
                isLoadingPaths ? "animate-spin text-blue-600" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── Sub-Bar Ringkas Status Evaluasi ── */}
      <div className="mt-2.5 mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2 text-slate-600 flex-wrap">
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <FaCompass className="text-blue-600" />
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

        {/* Status Badge yang Presisi (Jika Stabil = Hijau Zamrud, Jika Padat = Merah Prioritas) */}
        {(() => {
          const hasDenseRoute = visibleTracks.some((t) => t.avgDailyPax > 50);
          if (hasDenseRoute) {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-red-50 text-red-800 border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                Terdeteksi Jalur Padat (Butuh Prioritas)
              </span>
            );
          } else {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Jalur Beroperasi Stabil
              </span>
            );
          }
        })()}
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
                <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 pt-1">
                  <span>Armada Beroperasi:</span>
                  <span className="font-bold text-slate-800">
                    <span className="text-blue-700">{hoveredRoute.activeVehiclesDaily} Unit/Hari</span>
                    {" • "}
                    <span className="text-slate-600">{hoveredRoute.activeVehiclesWeekly} Total Unit (7 Hari)</span>
                  </span>
                </div>
              </div>

              {/* Rekomendasi Kebijakan Armada (Hijau untuk Stabil/Optimal, Merah untuk Padat/Prioritas) */}
              <div
                className={`text-[10px] font-semibold rounded-xl p-2 text-center leading-snug border ${hoveredRoute.density.recommendationBoxBg}`}
              >
                {hoveredRoute.density.recommendation}
              </div>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200/80 shadow-md text-[11px] text-slate-600 flex items-center gap-2">
              <FaInfoCircle className="text-blue-500 shrink-0" />
              <span>Arahkan kursor ke garis rute untuk melihat detail evaluasi</span>
            </div>
          )}
        </div>

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/90 shadow-lg text-[11px] space-y-2 pointer-events-auto max-w-[270px]">
          <p className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
            <FaInfoCircle className="text-blue-600" />
            Panduan Warna &amp; Kepadatan
          </p>

          {/* Warna Koridor */}
          <div className="space-y-1 text-[10px] text-slate-600 border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">
              Identitas Trayek:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                <span className="font-semibold text-slate-700">BB (Biru)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-700">BGTU (Hijau)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
                <span className="font-semibold text-slate-700">BS (Oranye)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                <span className="font-semibold text-slate-700">BK (Ungu)</span>
              </div>
            </div>
          </div>

          {/* Gradasi Kepadatan */}
          <div className="space-y-1 text-[10px]">
            <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">
              Tingkat Kepadatan:
            </span>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-2 rounded bg-slate-800 inline-block" />
                <span className="text-slate-800 font-bold">Warna Gelap/Pekat</span>
              </div>
              <span className="text-red-700 font-bold">&gt; 50 (Padat)</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-2 rounded bg-slate-500 inline-block" />
                <span className="text-slate-700 font-semibold">Warna Sedang</span>
              </div>
              <span className="text-emerald-700 font-bold">15–50 (Stabil)</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-2 rounded bg-slate-300 inline-block" />
                <span className="text-slate-600">Warna Terang</span>
              </div>
              <span className="text-sky-700 font-semibold">&lt; 15 (Lengang)</span>
            </div>
          </div>

          {/* Simpul Halte */}
          <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100 text-[10px]">
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
