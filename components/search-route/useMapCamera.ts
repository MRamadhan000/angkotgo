"use client";

import { useRef, useState } from "react";
import { Location } from "./types";
import { MALANG_CENTER } from "./types";

export interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

export function useMapCamera() {
  const mapRef = useRef<any>(null);
  const [viewState, setViewState] = useState<ViewState>({
    latitude: MALANG_CENTER.latitude,
    longitude: MALANG_CENTER.longitude,
    zoom: 12,
  });

  const flyTo = (lat: number, lng: number, zoom = 15) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom,
        essential: true,
        duration: 1800,
      });
    } else {
      setViewState({ latitude: lat, longitude: lng, zoom });
    }
  };

  const fitBounds = (points: Location[]) => {
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

  return { mapRef, viewState, setViewState, flyTo, fitBounds };
}
