"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { COLORS, TYPOGRAPHY } from "@/constants";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaSearch,
  FaCrosshairs,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

// 1. Import mandatory Mapbox CSS
import "mapbox-gl/dist/mapbox-gl.css";
import { cariRuteAngkot } from "@/services/routeService";
import { mapAngkotToCleanData } from "@/util/angkotMapper";

// 2. Dynamic Imports
const SearchBoxDynamic = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.SearchBox),
  { ssr: false },
);

const MapDynamic = dynamic(
  () => import("react-map-gl/mapbox").then((mod) => mod.default),
  { ssr: false },
);

const MarkerDynamic = dynamic(
  () => import("react-map-gl/mapbox").then((mod) => mod.Marker),
  { ssr: false },
);

const NavigationControlDynamic = dynamic(
  () => import("react-map-gl/mapbox").then((mod) => mod.NavigationControl),
  { ssr: false },
);

// ==================== TYPES ====================
interface Location {
  lat: number;
  lng: number;
}

interface Route {
  id: string;
  name: string;
  fare: number;
  estimatedTrip: number;
  transit: number;
  destination: string;
  activeVehicles: number;
}

interface Vehicle {
  id: string;
  routeId: string;
  plateNumber: string;
  driver: string;
  speed: number;
  status: string;
  etaPickup: number;
  etaDestination: number;
  distanceToPassenger: number;
  distanceRemaining: number;
}

interface TrackingData {
  passenger: Location;
  destination: Location;
  vehicle: {
    id: string;
    lat: number;
    lng: number;
  };
}

// ==================== DUMMY DATA (sesuai PRD) ====================
const dummyRoutes: Route[] = [
  {
    id: "AL",
    name: "Arjosari - Landungsari",
    fare: 5000,
    estimatedTrip: 22,
    transit: 0,
    destination: "Universitas Muhammadiyah Malang",
    activeVehicles: 4,
  },
  {
    id: "AG",
    name: "Arjosari - Gadang",
    fare: 5000,
    estimatedTrip: 26,
    transit: 1,
    destination: "Universitas Muhammadiyah Malang",
    activeVehicles: 2,
  },
  {
    id: "GA",
    name: "Gadang - Arjosari",
    fare: 5000,
    estimatedTrip: 24,
    transit: 0,
    destination: "Universitas Muhammadiyah Malang",
    activeVehicles: 3,
  },
];

const dummyVehicles: Vehicle[] = [
  {
    id: "AL001",
    routeId: "AL",
    plateNumber: "N 1234 AB",
    driver: "Pak Budi",
    speed: 28,
    status: "Menuju Penumpang",
    etaPickup: 4,
    etaDestination: 16,
    distanceToPassenger: 1.3,
    distanceRemaining: 5.2,
  },
  {
    id: "AL002",
    routeId: "AL",
    plateNumber: "N 4312 BC",
    driver: "Pak Agus",
    speed: 24,
    status: "Available",
    etaPickup: 6,
    etaDestination: 18,
    distanceToPassenger: 1.8,
    distanceRemaining: 5.7,
  },
  {
    id: "AG001",
    routeId: "AG",
    plateNumber: "N 5566 AA",
    driver: "Pak Joko",
    speed: 30,
    status: "Available",
    etaPickup: 8,
    etaDestination: 24,
    distanceToPassenger: 2.6,
    distanceRemaining: 7.1,
  },
  {
    id: "GA001",
    routeId: "GA",
    plateNumber: "N 7788 GA",
    driver: "Pak Surya",
    speed: 26,
    status: "Available",
    etaPickup: 5,
    etaDestination: 20,
    distanceToPassenger: 1.5,
    distanceRemaining: 6.0,
  },
];

const DUMMY_TRACKING_TEMPLATE = {
  passenger: { lat: -7.9526, lng: 112.6142 },
  destination: { lat: -7.9218, lng: 112.5965 },
  vehicle: { id: "AL001", lat: -7.9442, lng: 112.6088 },
};

const currentUser = {
  id: "USR001",
  name: "Zam",
  currentLocation: { lat: -7.9526, lng: 112.6142 },
};
import { useSocket } from "@/context/SocketContext";

// ==================== COMPONENT ====================
export default function SearchRoutePage() {
  const { socket, isConnected } = useSocket();
  const [liveVehicles, setLiveVehicles] = useState<any[]>([]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const mapRef = useRef<any>(null);

  // Location states (from original)
  const [originLocation, setOriginLocation] = useState<string>("");
  const [destinationLocation, setDestinationLocation] = useState<string>("");
  const [originCoords, setOriginCoords] = useState<Location | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Location | null>(
    null,
  );

  const [viewState, setViewState] = useState({
    latitude: -7.982611,
    longitude: 112.630875,
    zoom: 12,
  });

  const [mounted, setMounted] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // ==================== PRD STATE (centralized) ====================
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  // fetcg data
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<any>(null);

  const fetchRouteData = async (origin: Location, destination: Location) => {
    setLoading(true);
    try {
      const data = await cariRuteAngkot({
        lngA: origin.lng,
        latA: origin.lat,
        lngB: destination.lng,
        latB: destination.lat,
      });
      if (data.success && data.found) {
        const dataBersih = mapAngkotToCleanData(data.data);
        setRoute(dataBersih);
        console.log("Data rute berhasil diambil:", dataBersih);
      }
    } catch (error) {
      console.error("Error fetching route data:", error);
      alert("Gagal mengambil data rute. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !selectedRoute?.id) {
      setLiveVehicles([]);
      return;
    }

    const kodeAngkot = selectedRoute.id; // "AL", "AG", "GA", dll.

    // === SUBSCRIBE KE ROOM ===
    socket.emit("subscribe_route", { kodeAngkot });
    console.log(`[WS] Subscribed to route: ${kodeAngkot}`);

    // === HANDLER INITIAL LOCATIONS (saat baru masuk room) ===
    const handleInitialLocations = (data: any) => {
      console.log("[WS] initial_angkot_locations:", data);

      let vehicles: any[] = [];
      if (Array.isArray(data)) {
        vehicles = data;
      } else if (data && Array.isArray(data.locations)) {
        vehicles = data.locations;
      } else if (data && Array.isArray(data.data)) {
        vehicles = data.data;
      }

      setLiveVehicles(vehicles);
    };

    // === HANDLER UPDATE REAL-TIME ===
    const handleLocationUpdate = (data: any) => {
      console.log("[WS] angkot_location_update:", data);

      setLiveVehicles((prev) => {
        const vehicleId = data.vehicleId || data.id;
        const idx = prev.findIndex((v) => (v.vehicleId || v.id) === vehicleId);

        if (idx !== -1) {
          // Update kendaraan yang sudah ada
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...data };
          return updated;
        } else {
          // Tambah kendaraan baru
          return [...prev, data];
        }
      });
    };

    // Daftarkan listener
    socket.on("initial_angkot_locations", handleInitialLocations);
    socket.on("angkot_location_update", handleLocationUpdate);

    // === CLEANUP ===
    return () => {
      socket.off("initial_angkot_locations", handleInitialLocations);
      socket.off("angkot_location_update", handleLocationUpdate);
      socket.emit("unsubscribe_route", { kodeAngkot });
      setLiveVehicles([]);
      console.log(`[WS] Unsubscribed from route: ${kodeAngkot}`);
    };
  }, [socket, selectedRoute?.id]); // Penting: pakai .id biar tidak re-render berlebih

  // Smooth camera move
  const moveMapCamera = (lat: number, lng: number, zoomLevel = 15) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: zoomLevel,
        essential: true,
        duration: 2000,
      });
    } else {
      setViewState((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        zoom: zoomLevel,
      }));
    }
  };

  // Fit map to multiple points (used in tracking)
  const fitMapToPoints = (points: Location[]) => {
    if (!mapRef.current || points.length === 0) return;

    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);

    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ];

    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 60, right: 60 },
          duration: 1600,
          essential: true,
        });
      }
    }, 80);
  };

  // GPS
  const getUserGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung deteksi lokasi (GPS).");
      return;
    }
    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setOriginCoords({ lat, lng });
        setOriginLocation("Lokasi Saat Ini (GPS)");
        setLoadingGPS(false);
        setShowPermissionModal(false);
        moveMapCamera(lat, lng, 16);
      },
      (error) => {
        console.error("GPS error:", error);
        setLoadingGPS(false);
        if (error.code === 1) setShowPermissionModal(true);
        else alert("Gagal mendeteksi lokasi. Silakan masukkan manual.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    setMounted(true);
    getUserGPSLocation();
  }, []);

  // Mapbox handlers
  const handleOriginRetrieve = (res: any) => {
    if (!res?.features?.length) return;
    const coords = res.features[0].geometry.coordinates;
    const name =
      res.features[0].properties.full_address ||
      res.features[0].properties.name;
    const lat = coords[1];
    const lng = coords[0];
    setOriginCoords({ lat, lng });
    setOriginLocation(name);
    moveMapCamera(lat, lng, 15);
  };

  const handleDestinationRetrieve = (res: any) => {
    if (!res?.features?.length) return;
    const coords = res.features[0].geometry.coordinates;
    const name =
      res.features[0].properties.full_address ||
      res.features[0].properties.name;
    const lat = coords[1];
    const lng = coords[0];
    setDestinationCoords({ lat, lng });
    setDestinationLocation(name);
    moveMapCamera(lat, lng, 15);
  };

  // ==================== FLOW HANDLERS ====================
  const handleFindRoute = () => {
    fetchRouteData(originCoords!, destinationCoords!);

    if (!originCoords || !destinationCoords) return;

    setAvailableRoutes(dummyRoutes);
    setStep(2);

    // Fit map to origin + destination
    if (originCoords && destinationCoords) {
      fitMapToPoints([originCoords, destinationCoords]);
    }
  };

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);

    // Pick first available vehicle for this route
    let vehicle = dummyVehicles.find((v) => v.routeId === route.id);
    if (!vehicle) vehicle = dummyVehicles[0]; // fallback

    setSelectedVehicle(vehicle);

    // Build tracking data (prefer user input, fallback to dummy)
    const updatedTracking: TrackingData = {
      passenger: originCoords || DUMMY_TRACKING_TEMPLATE.passenger,
      destination: destinationCoords || DUMMY_TRACKING_TEMPLATE.destination,
      vehicle: {
        id: vehicle.id,
        lat: DUMMY_TRACKING_TEMPLATE.vehicle.lat,
        lng: DUMMY_TRACKING_TEMPLATE.vehicle.lng,
      },
    };

    setTrackingData(updatedTracking);
    setStep(3);

    // Fit map to User + Angkot + Destination
    const points: Location[] = [
      updatedTracking.passenger,
      { lat: updatedTracking.vehicle.lat, lng: updatedTracking.vehicle.lng },
      updatedTracking.destination,
    ];
    fitMapToPoints(points);
  };

  // Auto-fit when entering tracking step
  useEffect(() => {
    if (step === 3 && trackingData) {
      const points: Location[] = [
        trackingData.passenger,
        { lat: trackingData.vehicle.lat, lng: trackingData.vehicle.lng },
        trackingData.destination,
      ];
      fitMapToPoints(points);
    }
  }, [step, trackingData]);

  if (!mounted) return null;

  return (
    <main className="min-h-[100dvh] bg-slate-50 pt-24 pb-12 relative">
      <div className="mx-auto w-full max-w-6xl px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80 mb-4"
            style={{ color: COLORS.primary }}
          >
            <FaArrowLeft /> Kembali ke Beranda
          </Link>
          <h1
            className="font-bold text-3xl sm:text-4xl tracking-[-1px] mb-2"
            style={{ color: COLORS.textDark }}
          >
            {step === 3 ? "Tracking Angkot Real-time" : "Cari Rute Angkot"}
          </h1>
          <p
            className="text-sm sm:text-base"
            style={{ color: COLORS.textSecondary }}
          >
            {step === 1 &&
              "Masukkan lokasi awal dan tujuan untuk menemukan trayek angkot terbaik di Malang."}
            {step === 2 && "Pilih salah satu trayek angkot yang tersedia."}
            {step === 3 &&
              "Pantau posisi angkot secara real-time hingga tiba di tujuan."}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* LEFT PANEL — Dynamic by Step */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6 min-h-[420px]">
            {/* STEP 1: Cari Tujuan */}
            {step === 1 && (
              <>
                {/* Origin */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      className="text-sm font-semibold flex items-center gap-2"
                      style={{ color: COLORS.textDark }}
                    >
                      <FaMapMarkerAlt style={{ color: "#60a5fa" }} /> Lokasi
                      Awal
                    </label>
                    <button
                      type="button"
                      onClick={getUserGPSLocation}
                      disabled={loadingGPS}
                      className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition disabled:opacity-50"
                    >
                      <FaCrosshairs
                        className={loadingGPS ? "animate-spin" : ""}
                      />
                      {loadingGPS ? "Mencari GPS..." : "Gunakan GPS Saya"}
                    </button>
                  </div>
                  <div className="relative style-mapbox-search">
                    <SearchBoxDynamic
                      accessToken={MAPBOX_TOKEN}
                      value={originLocation}
                      onRetrieve={handleOriginRetrieve}
                      placeholder="Ketik lokasi awal (contoh: Stasiun Malang)..."
                      options={{
                        country: "ID",
                        proximity: [112.630875, -7.982611],
                      }}
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="space-y-2">
                  <label
                    className="block text-sm font-semibold flex items-center gap-2"
                    style={{ color: COLORS.textDark }}
                  >
                    <FaMapMarkerAlt style={{ color: COLORS.accent }} /> Lokasi
                    Tujuan
                  </label>
                  <div className="relative style-mapbox-search">
                    <SearchBoxDynamic
                      accessToken={MAPBOX_TOKEN}
                      value={destinationLocation}
                      onRetrieve={handleDestinationRetrieve}
                      placeholder="Ketik tujuan (contoh: Universitas Brawijaya)..."
                      options={{
                        country: "ID",
                        proximity: [112.630875, -7.982611],
                      }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <button
                    onClick={handleFindRoute}
                    disabled={!originCoords || !destinationCoords}
                    className="w-full group flex items-center justify-center gap-2.5 rounded-full py-4 text-white font-medium transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    <FaSearch className="text-sm" />
                    <span className={TYPOGRAPHY.button}>
                      Cari Trayek Angkot
                    </span>
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: Daftar Angkot */}
            {step === 2 && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-xl">
                      Daftar Trayek Angkot
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ditemukan {availableRoutes.length} trayek sesuai tujuan
                      Anda
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <FaArrowLeft className="text-xs" /> Ubah Lokasi
                  </button>
                </div>

                <div className="space-y-4 max-h-[520px] overflow-auto pr-1 custom-scroll">
                  {availableRoutes.map((route) => {
                    const routeVehicles = dummyVehicles.filter(
                      (v) => v.routeId === route.id,
                    );
                    const etaPickup =
                      routeVehicles.length > 0
                        ? Math.min(...routeVehicles.map((v) => v.etaPickup))
                        : 8;
                    const activeCount =
                      routeVehicles.length || route.activeVehicles;

                    return (
                      <div
                        key={route.id}
                        onClick={() => handleSelectRoute(route)}
                        className="group border border-slate-200 hover:border-primary/60 transition-all rounded-2xl p-5 cursor-pointer active:scale-[0.995]"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="font-black text-3xl tracking-[-2px]"
                                style={{ color: COLORS.primary }}
                              >
                                {route.id}
                              </span>
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                                {activeCount} aktif
                              </span>
                            </div>
                            <div className="font-semibold text-lg mt-1 leading-tight">
                              {route.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {route.destination}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <div className="text-[10px] text-slate-500">
                              Estimasi Penjemputan
                            </div>
                            <div className="text-2xl font-semibold tabular-nums">
                              {etaPickup}{" "}
                              <span className="text-sm font-normal">menit</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className="font-bold text-xl"
                              style={{ color: COLORS.primary }}
                            >
                              Rp{route.fare.toLocaleString("id-ID")}
                            </div>
                            <div className="text-xs text-slate-500">
                              {route.transit} transit
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRoute(route);
                          }}
                          className="mt-5 w-full py-3 rounded-full text-white text-sm font-semibold transition active:scale-[0.985]"
                          style={{ backgroundColor: COLORS.primary }}
                        >
                          Pilih Trayek {route.id}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* STEP 3: Tracking */}
            {step === 3 && selectedRoute && selectedVehicle && trackingData && (
              <div className="space-y-5">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <FaArrowLeft /> Kembali ke Daftar Angkot
                </button>

                {/* Route Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="text-4xl font-black tracking-[-2.5px]"
                    style={{ color: COLORS.primary }}
                  >
                    {selectedRoute.id}
                  </div>
                  <div className="leading-none">
                    <div className="font-semibold text-xl">
                      {selectedRoute.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      Menuju {selectedRoute.destination}
                    </div>
                  </div>
                </div>

                {/* ETA & Journey Info */}
                <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="text-xs tracking-[1px] text-slate-500">
                        ESTIMASI DIJEMPUT
                      </div>
                      <div className="text-3xl font-semibold tabular-nums mt-0.5">
                        {selectedVehicle.etaPickup}{" "}
                        <span className="text-base font-normal">menit</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs tracking-[1px] text-slate-500">
                        ESTIMASI SAMPAI
                      </div>
                      <div className="text-3xl font-semibold tabular-nums mt-0.5">
                        {selectedVehicle.etaDestination}{" "}
                        <span className="text-base font-normal">menit</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Jarak Angkot</span>
                      <br />
                      <span className="font-semibold">
                        {selectedVehicle.distanceToPassenger} km
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500">Sisa Perjalanan</span>
                      <br />
                      <span className="font-semibold">
                        {selectedVehicle.distanceRemaining} km
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fare */}
                <div className="flex justify-between items-center bg-white border border-slate-100 rounded-2xl px-5 py-4">
                  <div className="text-sm text-slate-600">Tarif</div>
                  <div
                    className="font-bold text-2xl"
                    style={{ color: COLORS.primary }}
                  >
                    Rp{selectedRoute.fare.toLocaleString("id-ID")}
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      Informasi Kendaraan
                      <span className="text-[10px] px-2 py-px bg-emerald-100 text-emerald-600 rounded-full font-medium">
                        LIVE
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div>
                      <span className="text-slate-500">Plat Nomor</span>
                      <br />
                      <span className="font-medium">
                        {selectedVehicle.plateNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Supir</span>
                      <br />
                      <span className="font-medium">
                        {selectedVehicle.driver}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Kecepatan</span>
                      <br />
                      <span className="font-medium">
                        {selectedVehicle.speed} km/jam
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Status</span>
                      <br />
                      <span className="font-medium text-emerald-600">
                        {selectedVehicle.status}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    alert(
                      "Demo: Data tracking akan diperbarui otomatis via WebSocket di production.",
                    )
                  }
                  className="w-full py-3 rounded-full border border-slate-300 text-sm font-medium hover:bg-slate-50 active:bg-slate-100 transition"
                >
                  Refresh Tracking (Demo)
                </button>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: MAP */}
          <div className="lg:col-span-3 w-full h-[380px] sm:h-[520px] rounded-3xl overflow-hidden shadow-sm border border-slate-100 relative z-10">
            <MapDynamic
              ref={mapRef}
              {...viewState}
              onMove={(evt) => setViewState(evt.viewState)}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={MAPBOX_TOKEN}
              style={{ width: "100%", height: "100%" }}
            >
              <NavigationControlDynamic position="top-right" />

              {/* Origin / User Marker */}
              {originCoords && (
                <MarkerDynamic
                  latitude={originCoords.lat}
                  longitude={originCoords.lng}
                  anchor="bottom"
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-600 text-white text-[10px] px-2.5 py-0.5 rounded-md font-bold shadow mb-1 whitespace-nowrap">
                      {step === 3 ? "🧍 Anda" : "Origin"}
                    </div>
                    <div className="text-4xl drop-shadow">📍</div>
                  </div>
                </MarkerDynamic>
              )}

              {/* Destination Marker */}
              {destinationCoords && (
                <MarkerDynamic
                  latitude={destinationCoords.lat}
                  longitude={destinationCoords.lng}
                  anchor="bottom"
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-red-500 text-white text-[10px] px-2.5 py-0.5 rounded-md font-bold shadow mb-1 whitespace-nowrap">
                      {step === 3 ? "📍 Tujuan" : "Destination"}
                    </div>
                    <div className="text-4xl drop-shadow text-red-500">📍</div>
                  </div>
                </MarkerDynamic>
              )}

              {/* Vehicle Marker (only in tracking) */}
              {step === 3 && trackingData && (
                <MarkerDynamic
                  latitude={trackingData.vehicle.lat}
                  longitude={trackingData.vehicle.lng}
                  anchor="bottom"
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-emerald-600 text-white text-[10px] px-2.5 py-0.5 rounded-md font-bold shadow mb-1 flex items-center gap-1 whitespace-nowrap">
                      🚐 {trackingData.vehicle.id}
                    </div>
                    <div className="text-5xl drop-shadow">🚐</div>
                  </div>
                </MarkerDynamic>
              )}
            </MapDynamic>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Powered by AngkotGo • Data dummy untuk demo (siap dihubungkan ke
          backend + WebSocket)
        </p>
      </div>

      {/* GPS Permission Modal (unchanged) */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative shadow-xl border border-slate-100 text-center">
            <button
              onClick={() => setShowPermissionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <FaTimes />
            </button>
            <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 text-2xl mb-4">
              <FaExclamationTriangle />
            </div>
            <h3 className="font-bold text-lg">Akses GPS Diblokir</h3>
            <p className="text-sm text-slate-500 mt-2">
              AngkotGo membutuhkan izin lokasi untuk hasil rute yang akurat.
            </p>
            <button
              onClick={() => {
                setShowPermissionModal(false);
                getUserGPSLocation();
              }}
              className="mt-6 w-full py-3 rounded-full text-white font-medium text-sm"
              style={{ backgroundColor: COLORS.primary }}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .style-mapbox-search .mapboxgl-ctrl-geocoder,
        .style-mapbox-search input {
          width: 100% !important;
          border-radius: 9999px !important;
          border: 1px solid #e2e8f0 !important;
          padding: 12px 20px !important;
          font-size: 14px !important;
          box-shadow: none !important;
        }
        .style-mapbox-search input:focus {
          border-color: ${COLORS.primary} !important;
          outline: none !important;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 3px;
        }
      `}</style>
    </main>
  );
}
