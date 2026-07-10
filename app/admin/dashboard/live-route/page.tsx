"use client";

import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
  Circle,
} from "react-leaflet";
import L from "leaflet";

// --- Fix Default Leaflet Icon ---
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Icon Angkot
const angkotIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

// Custom Icon Halte/Terminal
const stopIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3410/3410289.png",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

// ==================== INTERFACES (UPDATED) ====================
interface RouteData {
  id: number;
  code: string;
  name: string;
  direction: string;
  color: string;
  isActive: boolean;
}

interface RouteStop {
  id: number;
  name: string;
  sequence: number;
  latitude: string;
  longitude: string;
  radiusMeter: number;
  isTerminal: boolean;
}

interface RoutePoint {
  id: number;
  sequence: number;
  latitude: string;
  longitude: string;
}

// === UPDATED: Sesuai response baru ===
interface LiveSession {
  id: number;
  status: string;
  isAtStop: boolean;
  currentSequence: number;
  nextSequence: number;
  startedAt: string;
  trip: {
    id: number;
    tripNumber: number;
    plannedDeparture: string;
    plannedArrival: string;
  };
  route: {
    id: number;
    code: string;
    name: string;
    direction: string;
    color: string;
  };
  driver: {
    id: number;
    name: string;
  };
  vehicle: {
    id: number;
    plateNumber: string;
    capacity: number;
  };
  currentStop: {
    id: number;
    name: string;
    sequence: number;
    latitude: string;
    longitude: string;
    radiusMeter: number;
    isTerminal: boolean;
  } | null;
  nextStop: {
    id: number;
    name: string;
    sequence: number;
    latitude: string;
    longitude: string;
    radiusMeter: number;
    isTerminal: boolean;
  } | null;
  latestLocation: {
    id: string | number;
    latitude: string;
    longitude: string;
    speedKmh: number;
    headingDegrees: number;
    createdAt: string;
  } | null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function AdminTrackingPage() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);

  const [liveAngkot, setLiveAngkot] = useState<LiveSession[]>([]);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Ambil daftar rute
  useEffect(() => {
    fetch("http://localhost:3000/routes")
      .then((res) => res.json())
      .then((data) => setRoutes(data))
      .catch((err) => console.error("Gagal memuat rute:", err));
  }, []);

  // 2. Ambil data stops, points, dan live angkot
  useEffect(() => {
    if (!selectedRoute) return;

    const fetchRouteDetails = () => {
      // Stops
      fetch(`http://localhost:3000/routes/${selectedRoute.id}/stops`)
        .then((res) => res.json())
        .then((data) => setStops(data))
        .catch((err) => console.error("Error fetch stops:", err));

      // Points (polyline)
      fetch(`http://localhost:3000/routes/${selectedRoute.id}/points`)
        .then((res) => res.json())
        .then((data) => setPoints(data))
        .catch((err) => console.error("Error fetch points:", err));
    };

    const fetchLiveSessions = () => {
      // === UPDATE: Tambah parameter direction ===
      const url = `http://localhost:3000/live-sessions/active/by-code?code=${selectedRoute.code}&direction=${selectedRoute.direction}`;

      fetch(url)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success) {
            setLiveAngkot(resData.data);
          }
        })
        .catch((err) => console.error("Error fetch live tracking:", err));
    };

    fetchRouteDetails();
    fetchLiveSessions();

    // Refresh posisi angkot setiap 10 detik
    const interval = setInterval(fetchLiveSessions, 10000);
    return () => clearInterval(interval);
  }, [selectedRoute]);

  // Polyline positions
  const polylinePositions: [number, number][] = points
    .sort((a, b) => a.sequence - b.sequence)
    .map((p) => [parseFloat(p.latitude), parseFloat(p.longitude)]);

  const defaultCenter: [number, number] = [-7.98129, 112.6311];
  const getMapCenter = (): [number, number] => {
    if (polylinePositions.length > 0) {
      return polylinePositions[0];
    }
    return defaultCenter;
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col shadow-md">
        <div className="p-5 border-b border-gray-200 bg-blue-600 text-white">
          <h1 className="text-xl font-bold tracking-wide">
            📦 Admin Angkot Hub
          </h1>
          <p className="text-xs opacity-80 mt-1">
            Monitoring rute, halte &amp; armada jalan
          </p>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Pilih Rute Angkot
          </h2>
          {routes.map((route) => (
            <button
              key={route.id}
              onClick={() => setSelectedRoute(route)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedRoute?.id === route.id
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className="px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: route.color || "#2196F3" }}
                >
                  {route.code}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    route.direction === "GO"
                      ? "bg-green-100 text-green-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {route.direction}
                </span>
              </div>
              <h3 className="text-gray-800 font-semibold mt-2 text-sm">
                {route.name}
              </h3>
            </button>
          ))}
        </div>
      </div>

      {/* MAP AREA */}
      <div className="flex-1 flex flex-col relative">
        {selectedRoute ? (
          <>
            {/* Header */}
            <div className="bg-white p-4 shadow-sm z-[1000] flex justify-between items-center px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Live Tracking Rute:{" "}
                  <span className="text-blue-600">
                    {selectedRoute.code} ({selectedRoute.direction})
                  </span>
                </h2>
                <p className="text-xs text-gray-500">
                  Menampilkan {stops.length} Halte &amp; {points.length} Titik
                  Jalur
                </p>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {liveAngkot.length} Angkot Aktif
              </div>
            </div>

            {/* MAP */}
            <div className="flex-1 w-full h-full z-0">
              <MapContainer
                center={getMapCenter()}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ChangeView center={getMapCenter()} />

                {/* Garis Rute */}
                {polylinePositions.length > 0 && (
                  <Polyline
                    positions={polylinePositions}
                    pathOptions={{
                      color: selectedRoute.color || "#2196F3",
                      weight: 5,
                      opacity: 0.8,
                    }}
                  />
                )}

                {/* Halte + Radius */}
                {stops.map((stop) => {
                  const stopPos: [number, number] = [
                    parseFloat(stop.latitude),
                    parseFloat(stop.longitude),
                  ];
                  return (
                    <React.Fragment key={`stop-${stop.id}`}>
                      <Marker position={stopPos} icon={stopIcon}>
                        <Popup>
                          <div className="font-sans text-xs">
                            <div className="font-bold text-gray-800">
                              {stop.name}
                            </div>
                            <div>Sequence: {stop.sequence}</div>
                            <div>Radius: {stop.radiusMeter} meter</div>
                            <div>
                              {stop.isTerminal
                                ? "🏁 Terminal Utama"
                                : "📍 Halte Biasa"}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                      <Circle
                        center={stopPos}
                        radius={stop.radiusMeter}
                        pathOptions={{
                          color: "#2196F3",
                          fillColor: "#2196F3",
                          fillOpacity: 0.15,
                          weight: 1,
                        }}
                      />
                    </React.Fragment>
                  );
                })}

                {/* Marker Live Angkot */}
                {liveAngkot.map((angkot) => {
                  if (!angkot.latestLocation?.latitude) return null;

                  const position: [number, number] = [
                    parseFloat(angkot.latestLocation.latitude),
                    parseFloat(angkot.latestLocation.longitude),
                  ];

                  return (
                    <Marker
                      key={`angkot-${angkot.id}`}
                      position={position}
                      icon={angkotIcon}
                    >
                      <Popup>
                        <div className="p-1 font-sans text-xs min-w-[220px]">
                          <div className="font-bold text-blue-600 text-sm mb-1">
                            {angkot.vehicle.plateNumber}
                          </div>

                          <div className="mb-1">
                            👤 <b>Driver:</b> {angkot.driver.name}
                          </div>
                          <div className="mb-1">
                            ⚡ <b>Kecepatan:</b>{" "}
                            {angkot.latestLocation.speedKmh} km/h
                          </div>
                          <div className="mb-1">
                            🧭 <b>Heading:</b>{" "}
                            {angkot.latestLocation.headingDegrees}°
                          </div>

                          <div className="mb-1">
                            📍 <b>Sekarang:</b>{" "}
                            {angkot.currentStop?.name || "Di Jalan"} (Seq{" "}
                            {angkot.currentSequence})
                          </div>
                          <div className="mb-2">
                            ➡️ <b>Berikutnya:</b> {angkot.nextStop?.name || "-"}{" "}
                            (Seq {angkot.nextSequence})
                          </div>

                          <div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] text-white ${angkot.isAtStop ? "bg-orange-500" : "bg-green-500"}`}
                            >
                              {angkot.isAtStop
                                ? "🚌 Sedang Ngetem"
                                : "🚗 Sedang Bergerak"}
                            </span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <svg
              className="w-16 h-16 mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <p className="text-base font-medium">
              Silakan pilih salah satu rute di sebelah kiri
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
