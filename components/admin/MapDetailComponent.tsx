"use client";

import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3)"></div>`,
    className: "custom-leaflet-icon",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14, { animate: true });
  }, [center, map]);
  return null;
}

// Eksport interface agar tipenya bisa dikenali di file luar
export interface MapProps {
  stops: any[];
  coordinates: [number, number][];
  activeStop: number | null;
  onSelectStop: (id: number) => void;
}

export default function MapDetailComponent({
  stops,
  coordinates,
  activeStop,
  onSelectStop,
}: MapProps) {
  const defaultCenter: [number, number] = [-7.931891, 112.61];
  const currentActiveStop = stops.find((s) => s.id === activeStop);
  const mapCenter: [number, number] = currentActiveStop
    ? [currentActiveStop.lat, currentActiveStop.lng]
    : defaultCenter;

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution="&copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <Polyline
        positions={coordinates}
        color="#3b82f6"
        weight={4}
        opacity={0.8}
      />
      {stops.map((stop) => {
        const isTerminal = stop.type === "Terminal";
        const markerColor = isTerminal ? "#ef4444" : "#3b82f6";

        return (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={createCustomIcon(markerColor)}
            eventHandlers={{ click: () => onSelectStop(stop.id) }}
          >
            <Popup closeButton={false}>
              <div className="p-1">
                <span className="block text-[10px] font-bold text-red-500 uppercase">
                  {stop.type}
                </span>
                <h5 className="font-bold text-gray-900 text-sm">{stop.name}</h5>
              </div>
            </Popup>
          </Marker>
        );
      })}
      <ChangeMapView center={mapCenter} />
    </MapContainer>
  );
}
