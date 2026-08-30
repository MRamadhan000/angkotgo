"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { FaBus, FaUsers, FaMapMarkerAlt, FaRoute } from "react-icons/fa";

// ================= DYNAMIC IMPORT =================
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false },
);

// ================= DATA =================
const routePath: [number, number][] = [
  [-7.955, 112.612],
  [-7.954, 112.615],
  [-7.952, 112.618],
  [-7.95, 112.621],
  [-7.948, 112.625],
];

const passengerPoints: [number, number][] = [
  [-7.9545, 112.6135],
  [-7.9532, 112.6162],
  [-7.9515, 112.6195],
  [-7.9495, 112.623],
];

const angkotPosition: [number, number] = [-7.9515, 112.619];

interface DriverMapProps {
  currentPassengers?: number;
  capacity?: number;
  routeName?: string;
}

export default function DriverMap({
  currentPassengers = 8,
  capacity = 12,
  routeName = "Arjosari - Gadang",
}: DriverMapProps) {
  const [leafletReady, setLeafletReady] = useState(false);

  const [angkotIcon, setAngkotIcon] = useState<any>(null);

  useEffect(() => {
    const initLeaflet = async () => {
      const L = (await import("leaflet")).default;

      // ================= DEFAULT ICON FIX =================
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // ================= CUSTOM ANGKOT ICON =================
      const customIcon = L.divIcon({
        html: `
          <div style="
            position: relative;
            width: 72px;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            
            <div style="
              position: absolute;
              width: 72px;
              height: 72px;
              background: rgba(59,130,246,0.18);
              border-radius: 999px;
              animation: pulse 2s infinite;
            "></div>

            <div style="
              width: 56px;
              height: 56px;
              background: linear-gradient(135deg,#2563eb,#06b6d4);
              border-radius: 18px;
              display:flex;
              align-items:center;
              justify-content:center;
              box-shadow: 0 12px 30px rgba(37,99,235,0.35);
              border: 4px solid white;
              font-size: 28px;
            ">
              🚌
            </div>
          </div>

          <style>
            @keyframes pulse {
              0% {
                transform: scale(0.9);
                opacity: 0.7;
              }

              70% {
                transform: scale(1.4);
                opacity: 0;
              }

              100% {
                transform: scale(1.4);
                opacity: 0;
              }
            }
          </style>
        `,
        className: "custom-angkot-marker",
        iconSize: [72, 72],
        iconAnchor: [36, 36],
      });

      setAngkotIcon(customIcon);
      setLeafletReady(true);
    };

    initLeaflet();
  }, []);

  if (!leafletReady) {
    return (
      <div className="h-[500px] rounded-[32px] bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col items-center justify-center border border-blue-100">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-200 animate-pulse">
          <FaBus className="text-white text-2xl" />
        </div>

        <h3 className="mt-6 text-xl font-bold text-slate-800">
          Loading Live Map
        </h3>

        <p className="text-slate-500 mt-2">Menyiapkan tracking angkot...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* ================= MAP ================= */}
      <MapContainer
        center={angkotPosition}
        zoom={15}
        zoomControl={false}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "32px",
        }}
        className="shadow-2xl"
      >
        {/* ================= TILE ================= */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* ================= ROUTE LINE ================= */}
        <Polyline
          positions={routePath}
          pathOptions={{
            color: "#2563eb",
            weight: 7,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round",
            dashArray: "12 10",
          }}
        />

        {/* ================= PASSENGER POINTS ================= */}
        {passengerPoints.map((point, index) => (
          <CircleMarker
            key={index}
            center={point}
            radius={12}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#3b82f6",
              fillOpacity: 1,
              weight: 4,
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FaMapMarkerAlt />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800">
                      Passenger Point
                    </h3>

                    <p className="text-sm text-slate-500">
                      Calon Penumpang #{index + 1}
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-slate-50 rounded-2xl p-3 text-sm text-slate-600">
                  Penumpang sedang menunggu angkot di titik ini.
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* ================= ANGKOT POSITION ================= */}
        {angkotIcon && (
          <Marker position={angkotPosition} icon={angkotIcon}>
            <Popup>
              <div className="min-w-[220px]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg">
                    <FaBus size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold text-lg">Angkot Jalur AG</h3>

                    <p className="text-sm text-green-600 font-medium">
                      ● Sedang Beroperasi
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Passenger</span>

                    <span className="font-semibold">{currentPassengers} / {capacity}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Route</span>

                    <span className="font-semibold text-blue-600">
                      {routeName}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(100, Math.max(0, (currentPassengers / capacity) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
