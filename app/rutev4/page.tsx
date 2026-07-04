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
  FaBug,
} from "react-icons/fa";

import "mapbox-gl/dist/mapbox-gl.css";
import { cariRuteAngkot } from "@/services/routeService";
import { mapAngkotToCleanData } from "@/util/angkotMapper";
import { useSocket } from "@/context/SocketContext";

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

interface websocketResponse {
  sessionId: string;
  vehicleId: string;
  kodeAngkot: string;
  arah: string;
  lat: number;
  lng: number;
  updatedAt: string;
  action: "location_update";
}

export default function SearchRoutePage() {
  const { socket, isConnected } = useSocket();
  const [liveVehicles, setLiveVehicles] = useState<websocketResponse[]>([]);
  const [listAngkotKode, setListAngkotKode] = useState<string[]>(["AL", "AG"]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const mapRef = useRef<any>(null);

  const [originLocation, setOriginLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
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

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<any>(null);

  // ==================== WEBSOCKET - SUBSCRIBE BERDASARKAN listAngkotKode ====================
  useEffect(() => {
    if (!socket || !isConnected || listAngkotKode.length === 0) return;

    // Subscribe ke semua route di listAngkotKode
    listAngkotKode.forEach((kode) => {
      socket.emit("subscribe_route", { kodeAngkot: kode });
      console.log(`[WS] Subscribed to: ${kode}`);
    });

    const handleInitialLocations = (data: any) => {
      console.log("[WS] initial_angkot_locations:", data);
      let vehicles: websocketResponse[] = [];

      if (Array.isArray(data)) {
        vehicles = data as websocketResponse[];
      } else if (data?.locations) {
        vehicles = data.locations as websocketResponse[];
      } else if (data?.data) {
        vehicles = data.data as websocketResponse[];
      }
      setLiveVehicles(vehicles);
    };

    const handleLocationUpdate = (data: any) => {
      console.log("[WS] angkot_location_update:", data);
      const newVehicle = data as websocketResponse;

      setLiveVehicles((prev) => {
        const idx = prev.findIndex((v) => v.vehicleId === newVehicle.vehicleId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = newVehicle;
          return updated;
        } else {
          return [...prev, newVehicle];
        }
      });
    };

    socket.on("initial_angkot_locations", handleInitialLocations);
    socket.on("angkot_location_update", handleLocationUpdate);

    return () => {
      socket.off("initial_angkot_locations", handleInitialLocations);
      socket.off("angkot_location_update", handleLocationUpdate);

      // Unsubscribe semua saat cleanup
      listAngkotKode.forEach((kode) => {
        socket.emit("unsubscribe_route", { kodeAngkot: kode });
      });
    };
  }, [socket, isConnected, listAngkotKode]);

  // ==================== FETCH ROUTE + UPDATE listAngkotKode ====================
  const fetchRouteData = async (origin: Location, destination: Location) => {
    setLoading(true);

    // Reset data lama
    setLiveVehicles([]);
    setListAngkotKode([]);

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

        // === AMBIL KODE INISIAL YANG UNIK ===
        const uniqueKodes = [
          ...new Set(dataBersih.map((item) => item.kodeInisial)),
        ];
        setListAngkotKode(uniqueKodes);

        console.log("[WS] Akan subscribe ke route:", uniqueKodes);

        // Mapping untuk availableRoutes
        const mapped: Route[] = dataBersih.map((item: any) => ({
          id: item.kodeInisial,
          name: item.namaRute,
          fare: 5000,
          estimatedTrip: 20,
          transit: 0,
          destination: "Universitas Muhammadiyah Malang",
          activeVehicles: 0,
        }));
        setAvailableRoutes(mapped);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      alert("Gagal mengambil data rute");
    } finally {
      setLoading(false);
    }
  };

  // ==================== MAP & GPS ====================
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

  const getUserGPSLocation = () => {
    if (!navigator.geolocation) return alert("Browser tidak mendukung GPS");
    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setOriginCoords({ lat, lng });
        setOriginLocation("Lokasi Saat Ini (GPS)");
        setLoadingGPS(false);
        setShowPermissionModal(false);
        moveMapCamera(lat, lng, 16);
      },
      (err) => {
        setLoadingGPS(false);
        if (err.code === 1) setShowPermissionModal(true);
        else alert("Gagal mendeteksi lokasi");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    setMounted(true);
    getUserGPSLocation();
  }, []);

  const handleOriginRetrieve = (res: any) => {
    if (!res?.features?.length) return;
    const coords = res.features[0].geometry.coordinates;
    setOriginCoords({ lat: coords[1], lng: coords[0] });
    setOriginLocation(
      res.features[0].properties.full_address ||
        res.features[0].properties.name,
    );
    moveMapCamera(coords[1], coords[0], 15);
  };

  const handleDestinationRetrieve = (res: any) => {
    if (!res?.features?.length) return;
    const coords = res.features[0].geometry.coordinates;
    setDestinationCoords({ lat: coords[1], lng: coords[0] });
    setDestinationLocation(
      res.features[0].properties.full_address ||
        res.features[0].properties.name,
    );
    moveMapCamera(coords[1], coords[0], 15);
  };

  const handleFindRoute = () => {
    if (!originCoords || !destinationCoords) return;
    fetchRouteData(originCoords, destinationCoords);
    setStep(2);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-[100dvh] bg-slate-50 pt-24 pb-12">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium mb-4"
            style={{ color: COLORS.primary }}
          >
            <FaArrowLeft /> Kembali
          </Link>
          <h1 className="font-bold text-3xl tracking-[-1px]">
            Cari Rute Angkot (Debug Mode)
          </h1>
          <p className="text-sm text-slate-500">
            Step 1 • Subscribe berdasarkan hasil pencarian
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* FORM STEP 1 */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border space-y-5">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500" /> Lokasi Awal
                </label>
                <button
                  onClick={getUserGPSLocation}
                  disabled={loadingGPS}
                  className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1"
                >
                  <FaCrosshairs className={loadingGPS ? "animate-spin" : ""} />{" "}
                  GPS
                </button>
              </div>
              <SearchBoxDynamic
                accessToken={MAPBOX_TOKEN}
                value={originLocation}
                onRetrieve={handleOriginRetrieve}
                placeholder="Ketik lokasi awal..."
                options={{ country: "ID", proximity: [112.630875, -7.982611] }}
              />
            </div>

            <div>
              <label className="text-sm font-semibold flex items-center gap-2 mb-1.5">
                <FaMapMarkerAlt className="text-red-500" /> Lokasi Tujuan
              </label>
              <SearchBoxDynamic
                accessToken={MAPBOX_TOKEN}
                value={destinationLocation}
                onRetrieve={handleDestinationRetrieve}
                placeholder="Ketik tujuan..."
                options={{ country: "ID", proximity: [112.630875, -7.982611] }}
              />
            </div>

            <button
              onClick={handleFindRoute}
              disabled={!originCoords || !destinationCoords || loading}
              className="w-full py-3.5 rounded-full text-white font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: COLORS.primary }}
            >
              <FaSearch /> {loading ? "Mencari..." : "Cari Trayek Angkot"}
            </button>
          </div>

          {/* MAP */}
          <div className="lg:col-span-3 bg-white rounded-3xl overflow-hidden border h-[480px]">
            <MapDynamic
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={viewState}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              ref={mapRef}
            >
              <NavigationControlDynamic position="top-right" />
              {originCoords && (
                <MarkerDynamic
                  latitude={originCoords.lat}
                  longitude={originCoords.lng}
                >
                  <FaMapMarkerAlt className="text-blue-500 text-3xl" />
                </MarkerDynamic>
              )}
              {destinationCoords && (
                <MarkerDynamic
                  latitude={destinationCoords.lat}
                  longitude={destinationCoords.lng}
                >
                  <FaMapMarkerAlt className="text-red-500 text-3xl" />
                </MarkerDynamic>
              )}
            </MapDynamic>
          </div>
        </div>

        {/* ==================== DEBUG PANEL ==================== */}
        <div className="mt-8 bg-slate-900 text-slate-200 rounded-3xl p-6 font-mono text-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <FaBug />{" "}
              <span className="font-bold">
                DEBUG - WebSocket (Dynamic Subscribe)
              </span>
            </div>
            <span
              className={`px-3 py-1 rounded text-xs font-bold ${isConnected ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
            >
              {isConnected ? "CONNECTED" : "DISCONNECTED"}
            </span>
          </div>

          <div className="text-emerald-400 mb-2 text-xs">
            Subscribed Routes:{" "}
            {listAngkotKode.length > 0
              ? listAngkotKode.join(", ")
              : "Belum ada"}
          </div>

          {/* RAW JSON */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 border-b border-slate-700 flex justify-between">
              <span>📡 Latest WebSocket Payload</span>
              <span>Live: {liveVehicles.length} armada</span>
            </div>
            <div className="p-4 max-h-[380px] overflow-auto text-emerald-400 text-[11px]">
              {liveVehicles.length > 0 ? (
                <pre>{JSON.stringify(liveVehicles[0], null, 2)}</pre>
              ) : (
                <div className="text-slate-500 py-8 text-center">
                  Belum ada data WebSocket.
                  <br />
                  Lakukan pencarian rute terlebih dahulu.
                </div>
              )}
            </div>
          </div>

          {/* Test Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                if (socket && listAngkotKode.length > 0) {
                  listAngkotKode.forEach((kode) =>
                    socket.emit("subscribe_route", { kodeAngkot: kode }),
                  );
                }
              }}
              className="flex-1 py-2.5 text-xs bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium"
            >
              Resubscribe All
            </button>
            <button
              onClick={() => {
                if (socket && listAngkotKode.length > 0) {
                  listAngkotKode.forEach((kode) =>
                    socket.emit("unsubscribe_route", { kodeAngkot: kode }),
                  );
                }
                setLiveVehicles([]);
              }}
              className="flex-1 py-2.5 text-xs bg-rose-600 hover:bg-rose-700 rounded-lg text-white font-medium"
            >
              Unsubscribe All
            </button>
          </div>
        </div>
      </div>

      {/* GPS Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center">
            <FaExclamationTriangle className="mx-auto text-amber-500 text-4xl mb-4" />
            <h3 className="font-bold">Akses GPS Diblokir</h3>
            <button
              onClick={getUserGPSLocation}
              className="mt-6 w-full py-3 rounded-full bg-emerald-600 text-white text-sm"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
