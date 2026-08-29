// components/search-routev2/RoutePathLine.tsx

"use client";

import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { RoutePath } from "@/types/routes/route-path.type";

interface RoutePathLineProps {
  map: mapboxgl.Map | null;
  routePaths: RoutePath[];
}

export default function RoutePathLine({ map, routePaths }: RoutePathLineProps) {
  useEffect(() => {
    if (!map || !map.isStyleLoaded() || !routePaths.length) {
      return;
    }

    const sourceId = "angkot-route-path";
    const layerId = "angkot-route-path-line";

    // Pastikan urut berdasarkan sequenceOrder
    const sortedPaths = [...routePaths].sort(
      (a, b) => a.sequenceOrder - b.sequenceOrder,
    );

    // Ubah ke format Mapbox [lng, lat]
    const coordinates: [number, number][] = sortedPaths.map((path) => [
      path.longitude,
      path.latitude,
    ]);

    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates,
      },
    };

    // Kalau source sudah ada, update datanya
    const existingSource = map.getSource(sourceId) as
      | mapboxgl.GeoJSONSource
      | undefined;

    if (existingSource) {
      existingSource.setData(geojson);
    } else {
      map.addSource(sourceId, {
        type: "geojson",
        data: geojson,
      });
    }

    // Kalau layer belum ada, buat layer garis
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#2563eb",
          "line-width": 5,
          "line-opacity": 0.9,
        },
      });
    }

    return () => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }

      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    };
  }, [map, routePaths]);

  return null;
}
