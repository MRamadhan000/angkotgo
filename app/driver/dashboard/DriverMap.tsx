"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { RoutePath } from "@/types/routes/route-path.type";
import { RouteStopType } from "@/types/routes/route-stop.type";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type Coordinate = [number, number];

function toCoordinate(
  longitude: unknown,
  latitude: unknown,
): Coordinate | null {
  const lng = Number(longitude);
  const lat = Number(latitude);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return null;

  return [lng, lat];
}

interface DriverMapProps {
  routePaths?: RoutePath[];
  routeStops?: RouteStopType[];
  currentLocation?: { latitude: number; longitude: number } | null;
  currentPassengers?: number;
  capacity?: number;
  routeName?: string;
}

export default function DriverMap({
  routePaths = [],
  routeStops = [],
  currentLocation = null,
  currentPassengers = 0,
  capacity = 12,
  routeName = "Rute angkot",
}: DriverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const vehicleMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const stopMarkersRef = useRef<mapboxgl.Marker[]>([]);

  const sortedPaths = [...routePaths]
    .map((path) => ({
      path,
      coordinate: toCoordinate(path.longitude, path.latitude),
    }))
    .filter((item): item is { path: RoutePath; coordinate: Coordinate } =>
      item.coordinate !== null,
    )
    .sort((a, b) => a.path.sequenceOrder - b.path.sequenceOrder);
  const sortedStops = [...routeStops]
    .map((stop) => ({
      stop,
      coordinate: toCoordinate(stop.longitude, stop.latitude),
    }))
    .filter((item): item is { stop: RouteStopType; coordinate: Coordinate } =>
      item.coordinate !== null,
    )
    .sort((a, b) => a.stop.stopOrder - b.stop.stopOrder);

  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const center =
      toCoordinate(currentLocation?.longitude, currentLocation?.latitude) ??
      sortedPaths[0]?.coordinate ??
      sortedStops[0]?.coordinate ??
      ([112.6214, -7.9839] as Coordinate);
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: 14,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      vehicleMarkerRef.current?.remove();
      stopMarkersRef.current.forEach((marker) => marker.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const drawRoute = () => {
      const coordinates = sortedPaths.map((item) => item.coordinate);
      if (coordinates.length < 2) return;

      const sourceId = "driver-route-path";
      const layerId = "driver-route-path-line";
      const data: GeoJSON.Feature<GeoJSON.LineString> = {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates },
      };

      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
      if (source) source.setData(data);
      else map.addSource(sourceId, { type: "geojson", data });

      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#2563eb", "line-width": 5, "line-opacity": 0.9 },
        });
      }

      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach((coordinate) => bounds.extend(coordinate));
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 0 });
      }
    };

    if (map.isStyleLoaded()) drawRoute();
    else map.once("load", drawRoute);

    return () => {
      map.off("load", drawRoute);
    };
  }, [routePaths]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    stopMarkersRef.current.forEach((marker) => marker.remove());
    stopMarkersRef.current = sortedStops.map(({ stop, coordinate }) => {
      const element = document.createElement("div");
      element.className = "flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-teal-700 text-xs font-bold text-white shadow";
      element.textContent = String(stop.stopOrder);
      return new mapboxgl.Marker({ element })
        .setLngLat(coordinate)
        .setPopup(new mapboxgl.Popup().setText(`Halte ${stop.stopOrder}: ${stop.stopName}`))
        .addTo(map);
    });
  }, [routeStops]);

  useEffect(() => {
    const map = mapRef.current;
    const coordinate = toCoordinate(
      currentLocation?.longitude,
      currentLocation?.latitude,
    );
    if (!map || !coordinate || !currentLocation) return;

    if (!vehicleMarkerRef.current) {
      const element = document.createElement("div");
      element.className = "flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-xl";
      element.innerHTML = "<span aria-label=\"Posisi angkot\">🚌</span>";
      vehicleMarkerRef.current = new mapboxgl.Marker({ element })
        .setLngLat(coordinate)
        .addTo(map);
    }

    vehicleMarkerRef.current
      .setLngLat(coordinate)
      .setPopup(
        new mapboxgl.Popup({ offset: 28 }).setHTML(
          `<strong>${routeName}</strong><br/>GPS live: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}<br/>Penumpang: ${currentPassengers}/${capacity}`,
        ),
      );
  }, [currentLocation, routeName, currentPassengers, capacity]);

  if (!MAPBOX_TOKEN) {
    return <div className="flex h-full items-center justify-center bg-slate-100 p-4 text-center text-sm text-slate-600">NEXT_PUBLIC_MAPBOX_TOKEN belum dikonfigurasi.</div>;
  }

  return <div ref={containerRef} className="h-full w-full" aria-label={`Peta live ${routeName}`} />;
}
