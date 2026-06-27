"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import "mapbox-gl/dist/mapbox-gl.css";
import { Location, TrackingData, Step } from "./types";
import { MapMarker } from "./MapMarker";

const MapDynamic = dynamic(
  () => import("react-map-gl/mapbox").then((mod) => mod.default),
  { ssr: false }
);
const MarkerDynamic = dynamic(
  () => import("react-map-gl/mapbox").then((mod) => mod.Marker),
  { ssr: false }
);
const NavigationControlDynamic = dynamic(
  () => import("react-map-gl/mapbox").then((mod) => mod.NavigationControl),
  { ssr: false }
);

export interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface MapPanelProps {
  mapboxToken: string;
  viewState: MapViewState;
  onViewStateChange: (vs: MapViewState) => void;
  mapRef: React.RefObject<any>;
  step: Step;
  originCoords: Location | null;
  destinationCoords: Location | null;
  trackingData: TrackingData | null;
}

export function MapPanel({
  mapboxToken,
  viewState,
  onViewStateChange,
  mapRef,
  step,
  originCoords,
  destinationCoords,
  trackingData,
}: MapPanelProps) {
  return (
    <div className="w-full h-[400px] sm:h-[540px] rounded-3xl overflow-hidden border relative z-10"
      style={{ borderColor: "#e2e8f0" }}
    >
      <MapDynamic
        ref={mapRef}
        {...viewState}
        onMove={(evt) => onViewStateChange(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControlDynamic position="top-right" />

        {/* Origin marker */}
        {originCoords && (
          <MarkerDynamic
            latitude={originCoords.lat}
            longitude={originCoords.lng}
            anchor="bottom"
          >
            <MapMarker
              label={step === 3 ? "🧍 Anda" : "Asal"}
              emoji="📍"
              color="#2563EB"
            />
          </MarkerDynamic>
        )}

        {/* Destination marker */}
        {destinationCoords && (
          <MarkerDynamic
            latitude={destinationCoords.lat}
            longitude={destinationCoords.lng}
            anchor="bottom"
          >
            <MapMarker
              label={step === 3 ? "🏁 Tujuan" : "Tujuan"}
              emoji="📍"
              color="#dc2626"
            />
          </MarkerDynamic>
        )}

        {/* Vehicle marker – only during tracking */}
        {step === 3 && trackingData && (
          <MarkerDynamic
            latitude={trackingData.vehicle.lat}
            longitude={trackingData.vehicle.lng}
            anchor="bottom"
          >
            <MapMarker
              label={`🚐 ${trackingData.vehicle.id}`}
              emoji="🚐"
              color="#059669"
            />
          </MarkerDynamic>
        )}
      </MapDynamic>
    </div>
  );
}
