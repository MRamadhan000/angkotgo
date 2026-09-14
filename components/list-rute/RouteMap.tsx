"use client";

import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Sesuaikan import type di bawah ini dengan path/nama type yang sebenarnya
// dipakai oleh useRoutePaths & useRouteStops di project Anda.
type RoutePathPoint = {
  latitude: number;
  longitude: number;
};

type RouteStop = {
  id: number | string;
  stopOrder: number;
  stopName: string;
  latitude: number;
  longitude: number;
};

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

type RouteMapProps = {
  pathData: RoutePathPoint[];
  stopData: RouteStop[];
  routeColor: string;
  isReturn: boolean;
};

export default function RouteMap({
  pathData,
  stopData,
  routeColor,
  isReturn,
}: RouteMapProps) {
  if (pathData.length === 0) return null;

  return (
    <>
      <MapContainer
        center={[pathData[0].latitude, pathData[0].longitude]}
        zoom={14}
        className="h-full w-full"
      >
        {/* Auto Focus Map Component */}
        <MapFlyTo center={[pathData[0].latitude, pathData[0].longitude]} />

        {/* Light TileLayer (CartoDB Voyager) */}
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

        {/* Polyline — solid untuk Berangkat, putus-putus untuk Pulang */}
        <Polyline
          positions={pathData.map(
            (p) => [p.latitude, p.longitude] as [number, number],
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
            icon={createNumberIcon(stop.stopOrder, routeColor, isReturn)}
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
  );
}