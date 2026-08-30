"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { UpcomingVehicle } from "@/types/route-search.type";

interface VehicleMarkersProps {
  map: mapboxgl.Map | null;
  vehicles: UpcomingVehicle[];
}

export default function VehicleMarkers({
  map,
  vehicles,
}: VehicleMarkersProps) {
  const markersRef = useRef<Map<number, mapboxgl.Marker>>(new Map());

  useEffect(() => {
    if (!map) {
      return;
    }

    const currentMarkers = markersRef.current;

    // Hapus marker lama
    currentMarkers.forEach((marker) => {
      marker.remove();
    });

    currentMarkers.clear();

    // Buat marker baru
    vehicles.forEach((vehicle) => {
      if (
        !vehicle.hasLocationData ||
        vehicle.vehicleLat === null ||
        vehicle.vehicleLng === null
      ) {
        return;
      }

      const element = document.createElement("div");

      element.className =
        "flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-blue-600 shadow-lg";

      element.innerHTML = `
        <div class="text-white text-lg">
          🚐
        </div>
      `;

      const marker = new mapboxgl.Marker({
        element,
        anchor: "center",
      })
        .setLngLat([
          vehicle.vehicleLng,
          vehicle.vehicleLat,
        ])
        .setPopup(
          new mapboxgl.Popup({
            offset: 20,
          }).setHTML(`
            <div style="min-width: 160px">
              <strong>Angkot ${vehicle.vehicleId}</strong>
              <div>Jarak: ${Math.round(
                vehicle.distanceToUserMeters,
              )} m</div>
            </div>
          `),
        )
        .addTo(map);

      currentMarkers.set(vehicle.assignmentId, marker);
    });

    return () => {
      currentMarkers.forEach((marker) => {
        marker.remove();
      });

      currentMarkers.clear();
    };
  }, [map, vehicles]);

  return null;
}