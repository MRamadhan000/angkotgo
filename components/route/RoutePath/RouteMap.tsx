"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DirectionType } from "@/types/vehicle.type";

// Import Leaflet secara dinamis khusus client-side untuk menghindari error SSR Next.js
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

import { useMap } from "react-leaflet";

// Controller untuk otomatis mengatur posisi center dan auto-zoom (fitBounds) peta
function MapController({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      if (coordinates.length === 1) {
        map.setView(coordinates[0], 15, { animate: true });
      } else {
        map.fitBounds(coordinates, {
          padding: [50, 50],
          animate: true,
          maxZoom: 16,
        });
      }
    }
  }, [coordinates, map]);
  return null;
}

interface RouteMapProps {
  routePaths: any[];
  activeTab: DirectionType;
}

export default function RouteMap({ routePaths, activeTab }: RouteMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  // Urutkan berdasarkan sequenceOrder
  const sortedRoutePaths = [...routePaths].sort(
    (a: any, b: any) => a.sequenceOrder - b.sequenceOrder
  );
  const polylineCoordinates = sortedRoutePaths.map(
    (path: any) => [path.latitude, path.longitude] as [number, number]
  );

  const defaultCenter: [number, number] =
    routePaths.length > 0
      ? [routePaths[0].latitude, routePaths[0].longitude]
      : [-7.9666, 112.6326]; // Default Malang

  // Membuat Custom Marker Kecil dengan Nomor Sequence di dalamnya
  const createSmallNumberedIcon = (sequence: number, direction: DirectionType) => {
    if (!L) return undefined;
    const bgColor = direction === DirectionType.FORWARD ? "#2563eb" : "#d97706";
    return L.divIcon({
      className: "custom-small-marker",
      html: `<div style="
        background-color: ${bgColor};
        color: white;
        border: 1.5px solid white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        font-weight: bold;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      ">${sequence}</div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  };

  if (!isMounted || !L) {
    return (
      <div className="w-full h-[400px] rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        Memuat Peta...
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-100 z-0 relative">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <MapController coordinates={polylineCoordinates} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {polylineCoordinates.length > 0 && (
          <Polyline
            positions={polylineCoordinates}
            color={activeTab === DirectionType.FORWARD ? "#2563eb" : "#d97706"}
            weight={3}
          />
        )}

        {routePaths.map((path: any) => {
          const smallIcon = createSmallNumberedIcon(
            path.sequenceOrder,
            path.direction
          );
          return (
            <Marker
              key={path.id}
              position={[path.latitude, path.longitude]}
              {...(smallIcon ? { icon: smallIcon } : {})}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <p className="font-bold">Urutan: #{path.sequenceOrder}</p>
                  <p>Arah: {path.direction}</p>
                  <p className="font-mono text-gray-500">
                    Lat: {path.latitude}, Lng: {path.longitude}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}