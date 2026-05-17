"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import Leaflet agar SSR di-skip
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
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

export default function DriverMap() {
  const [leafletReady, setLeafletReady] = useState(false);
  const [angkotIcon, setAngkotIcon] = useState<any>(null);

  // Inisialisasi Leaflet + Custom Icon (hanya client)
  useEffect(() => {
    const initLeaflet = async () => {
      const L = (await import("leaflet")).default;

      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Custom Angkot Icon
      const customIcon = L.divIcon({
        html: `<div style="font-size: 42px; line-height: 1;">🚌</div>`,
        className: "custom-angkot-icon",
        iconSize: [60, 60],
        iconAnchor: [30, 30],
      });

      setAngkotIcon(customIcon);
      setLeafletReady(true);
    };

    initLeaflet();
  }, []);

  if (!leafletReady) {
    return <div className="h-[500px] flex items-center justify-center">Loading Map...</div>;
  }

  return (
    <MapContainer
      center={angkotPosition}
      zoom={15}
      style={{ height: "500px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Route */}
      <Polyline
        positions={routePath}
        color="#3b82f6"
        weight={6}
        opacity={0.8}
      />

      {/* Passenger Points */}
      {passengerPoints.map((point, index) => (
        <Marker key={index} position={point}>
          <Popup>
            <strong>🚶 Calon Penumpang #{index + 1}</strong>
            <br />
            Menunggu di titik ini
          </Popup>
        </Marker>
      ))}

      {/* Angkot Position */}
      {angkotIcon && (
        <Marker position={angkotPosition} icon={angkotIcon}>
          <Popup>
            <strong>🚌 Angkot Jalur AG</strong>
            <br />
            Status: <span className="text-green-600">Aktif</span>
            <br />
            Penumpang: 8 / 12
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}