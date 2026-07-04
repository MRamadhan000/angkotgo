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
  FaPlay,
  FaUser,
  FaCar,
  FaClock,
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

interface AngkotCleanData {
  sessionId: string;
  kodeInisial: string;
  namaRute: string;
  namaSupir: string;
  platNomor: string;
  nomorLambung: string;
  indexTurun: number;
}

export default function SearchRoutePage() {
  const { socket, isConnected } = useSocket();
  const [liveVehicles, setLiveVehicles] = useState<websocketResponse[]>([]);
  const [listAngkotKode, setListAngkotKode] = useState<string[]>(["AL", "AG"]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const mapRef = useRef<any>(null);

  const [originLocation, setOriginLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [originCoords, setOriginCoords] = useState<Location | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Location | null>(null);

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
  const [route, setRoute] = useState<AngkotCleanData[]>([]);

  // ==================== WEBSOCKET ====================
  useEffect(() => {
    if (!socket || !isConnected || listAngkotKode.length === 0) return;

    listAngkotKode.forEach((kode) => {
      socket.emit("subscribe_route", { kodeAngkot: kode });
    });

    const handleInitialLocations = (data: any) => {
      let vehicles: websocketResponse[] = [];
      if (Array.isArray(data)) vehicles = data;
      else if (data?.locations) vehicles = data.locations;
      else if (data?.data) vehicles = data.data;
      setLiveVehicles(vehicles);
    };

    const handleLocationUpdate = (data: any) => {
      const newVehicle = data as websocketResponse;
      setLiveVehicles((prev) => {
        const idx = prev.findIndex((v) => v.vehicleId === newVehicle.vehicleId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = newVehicle;
          return updated;
        }
        return [...prev, newVehicle];
      });
    };

    socket.on("initial_angkot_locations", handleInitialLocations);
    socket.on("angkot_location_update", handleLocationUpdate);

    return () => {
      socket.off("initial_angkot_locations", handleInitialLocations);
      socket.off("angkot_location_update", handleLocationUpdate);
      listAngkotKode.forEach((kode) => socket.emit("unsubscribe_route", { kodeAngkot: kode }));
    };
  }, [socket, isConnected, listAngkotKode]);

  // ==================== FETCH ROUTE ====================
  const fetchRouteData = async (origin: Location, destination: Location) => {
    setLoading(true);
    setLiveVehicles([]);
    setListAngkotKode([]);
    setSelectedRoute(null);

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

        const uniqueKodes = [...new Set(dataBersih.map((item) => item.kodeInisial))];
        setListAngkotKode(uniqueKodes);

        const mapped: Route[] = dataBersih.map((item) => ({
          id: item.kodeInisial,
          name: item.namaRute,
          fare: 5000,
          estimatedTrip: 20,
          transit: 0,
          destination: "Universitas Muhammadiyah Malang",
          activeVehicles: 0,
        }));
        setAvailableRoutes(mapped);
        setStep(2);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data rute");
    } finally {
      setLoading(false);
    }
  };

  // ==================== MULAI TRACKING (Step 3) ====================
  const handleStartTracking = (rute: Route) => {
    setSelectedRoute(rute);
    setStep(3);
  };

  // ==================== KEMBALI KE STEP 2 ====================
  const handleBackToList = () => {
    setSelectedRoute(null);
    setStep(2);
  };

  // ==================== MAP & GPS ====================
  const moveMapCamera = (lat: number, lng: number, zoomLevel = 15) => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: zoomLevel, essential: true, duration: 2000 });
    } else {
      setViewState((prev) => ({ ...prev, latitude: lat, longitude: lng, zoom: zoomLevel }));
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
      { enableHighAccuracy: true, timeout: 10000 }
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
    setOriginLocation(res.features[0].properties.full_address || res.features[0].properties.name);
    moveMapCamera(coords[1], coords[0], 15);
  };

  const handleDestinationRetrieve = (res: any) => {
    if (!res?.features?.length) return;
    const coords = res.features[0].geometry.coordinates;
    setDestinationCoords({ lat: coords[1], lng: coords[0] });
    setDestinationLocation(res.features[0].properties.full_address || res.features[0].properties.name);
    moveMapCamera(coords[1], coords[0], 15);
  };

  const handleFindRoute = () => {
    if (!originCoords || !destinationCoords) return;
    fetchRouteData(originCoords, destinationCoords);
  };

  if (!mounted) return null;

  // Filter hanya angkot yang dipilih di Step 3
  const filteredVehicles = selectedRoute
    ? liveVehicles.filter((v) => v.kodeAngkot === selectedRoute.id)
    : liveVehicles;

  return (
    <main className="min-h-[100dvh] bg-slate-50 pt-24 pb-12">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium mb-4" style={{ color: COLORS.primary }}>
            <FaArrowLeft /> Kembali
          </Link>
          <h1 className="font-bold text-3xl tracking-[-1px]">
            {step === 1 && "Cari Rute Angkot"}
            {step === 2 && "Pilih Angkot"}
            {step === 3 && "Tracking Real-time"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT PANEL */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border space-y-5 min-h-[520px]">
            
            {/* STEP 1 */}
            {step === 1 && (
              <>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-sm font-semibold flex items-center gap-2">Lokasi Awal</label>
                    <button onClick={getUserGPSLocation} disabled={loadingGPS} className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1">
                      <FaCrosshairs className={loadingGPS ? "animate-spin" : ""} /> GPS
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
                  <label className="text-sm font-semibold flex items-center gap-2 mb-1.5">Lokasi Tujuan</label>
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
              </>
            )}

            {/* STEP 2: LIST ANGKOT */}
            {step === 2 && (
              <div>
                <h3 className="font-semibold mb-4">Angkot yang Tersedia</h3>
                {availableRoutes.length === 0 ? (
                  <p className="text-sm text-slate-500">Tidak ada angkot ditemukan.</p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-auto">
                    {availableRoutes.map((rute) => {
                      const detail = route.find((d) => d.kodeInisial === rute.id);
                      return (
                        <div key={rute.id} className="border border-slate-200 rounded-2xl p-4">
                          <div className="flex justify-between mb-2">
                            <div>
                              <div className="font-bold text-xl text-emerald-600">{rute.id}</div>
                              <div className="text-sm">{rute.name}</div>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                              Rp {rute.fare}<br />~{rute.estimatedTrip} menit
                            </div>
                          </div>

                          {detail && (
                            <div className="text-xs text-slate-600 mb-3">
                              Supir: <span className="font-medium">{detail.namaSupir}</span><br />
                              Plat: <span className="font-medium">{detail.platNomor}</span>
                            </div>
                          )}

                          <button
                            onClick={() => handleStartTracking(rute)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium"
                          >
                            <FaPlay /> Mulai Tracking
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: DETAIL TRACKING */}
            {step === 3 && selectedRoute && (
              <div>
                <button onClick={handleBackToList} className="text-sm text-emerald-600 mb-4 flex items-center gap-1">
                  ← Kembali ke Daftar
                </button>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                  <h3 className="font-bold text-xl text-emerald-700 mb-4">{selectedRoute.id} — {selectedRoute.name}</h3>

                  {filteredVehicles.length > 0 && (
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-emerald-600" />
                        <span>Supir: <strong>{route.find(d => d.kodeInisial === selectedRoute.id)?.namaSupir}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCar className="text-emerald-600" />
                        <span>Plat: <strong>{route.find(d => d.kodeInisial === selectedRoute.id)?.platNomor}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="text-emerald-600" />
                        <span>Update: {filteredVehicles[0]?.updatedAt}</span>
                      </div>
                      <div>
                        Posisi Saat Ini:<br />
                        <span className="font-mono text-xs">
                          {filteredVehicles[0]?.lat}, {filteredVehicles[0]?.lng}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* MAP */}
          <div className="lg:col-span-3 bg-white rounded-3xl overflow-hidden border h-[520px]">
            <MapDynamic
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={viewState}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              ref={mapRef}
              onLoad={() => setMapLoaded(true)}
            >
              <NavigationControlDynamic position="top-right" />

              {mapLoaded && originCoords && (
                <MarkerDynamic latitude={originCoords.lat} longitude={originCoords.lng}>
                  <FaMapMarkerAlt className="text-blue-500 text-3xl" />
                </MarkerDynamic>
              )}

              {mapLoaded && destinationCoords && (
                <MarkerDynamic latitude={destinationCoords.lat} longitude={destinationCoords.lng}>
                  <FaMapMarkerAlt className="text-red-500 text-3xl" />
                </MarkerDynamic>
              )}

              {/* Hanya tampilkan angkot yang dipilih di Step 3 */}
              {mapLoaded &&
                filteredVehicles.map((vehicle, index) => (
                  <MarkerDynamic key={index} latitude={vehicle.lat} longitude={vehicle.lng} anchor="bottom">
                    <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                      <FaMapMarkerAlt className="text-lg" />
                    </div>
                  </MarkerDynamic>
                ))}
            </MapDynamic>
          </div>
        </div>
      </div>

      {/* GPS Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center">
            <FaExclamationTriangle className="mx-auto text-amber-500 text-4xl mb-4" />
            <h3 className="font-bold">Akses GPS Diblokir</h3>
            <button onClick={getUserGPSLocation} className="mt-6 w-full py-3 rounded-full bg-emerald-600 text-white text-sm">Coba Lagi</button>
          </div>
        </div>
      )}
    </main>
  );
}